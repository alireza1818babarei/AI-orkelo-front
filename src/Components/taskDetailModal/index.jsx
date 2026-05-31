import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  Spinner,
} from "reactstrap";
import api from "../../api/axios";
import {
  alertConfirm,
  toastError,
  toastSuccess,
} from "../../utils/sweetAlert";
import ActionDropdown from "../ActionDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  getColumnTasksThunk,
  updateTaskInColumn,
} from "../../store/projects/projectColumnsSlice";
import {
  getTaskDetailThunk,
  patchTaskDetail,
} from "../../store/tasks/taskDetailSlice";
import { reorderTaskChecklistItemsThunk } from "../../store/tasks/checklistSlice";
import TaskModalPlaceHolder from "../TaskModalPlaceHolder";
import Flatpickr from "react-flatpickr";
import TaskActivityConversation from "./TaskActivityConversation";
import TaskAttachments from "./TaskAttachments";
import TaskTagsDropdown from "./TaskTagsDropdown";
import TaskAssigneeDropdown from "./TaskAssigneeDropdown";
import TaskWatchersDropdown from "./TaskWatchersDropdown";
import TaskExcludedUsersDropdown from "./TaskExcludedUsersDropdown";
import TaskVisibleForDropdown from "./TaskVisibleForDropdown";
import TaskPriorityDropdown, {
  normalizeTaskPriority,
} from "./TaskPriorityDropdown";
import TaskRatingDropdown, {
  normalizeTaskRating,
} from "./TaskRatingDropdown";
import ChecklistTree from "./ChecklistTree";
import TaskTimer from "./TaskTimer";
import { restoreArchivedTasks } from "../../store/projects/projectArchivedTasksSlice";
import { resolveUserAvatarWithFallback } from "../../utils/mediaUrl";
import { getTextDirectionProps } from "../../utils/textDirection";
import {
  getTaskReviewNote,
  getTaskReviewReviewedAt,
  getTaskReviewReviewerName,
  getTaskReviewStatus,
  getTaskReviewSubmittedAt,
  getTaskReviewSubmittedByName,
  persistTaskReviewState,
  TASK_REVIEW_STATUS,
} from "../../utils/taskReviewStatus";

const getChecklistOrder = (item) => {
  const value = Number(item?.position ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const sortChecklistByPosition = (items = []) =>
  [...(items || [])].sort((a, b) => {
    const aCompleted = a?.is_completed ? 1 : 0;
    const bCompleted = b?.is_completed ? 1 : 0;

    if (aCompleted !== bCompleted) return aCompleted - bCompleted;

    const positionDiff = getChecklistOrder(a) - getChecklistOrder(b);
    if (positionDiff !== 0) return positionDiff;

    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });

const arrayMove = (list, from, to) => {
  const next = [...(list || [])];
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= next.length ||
    to >= next.length
  ) {
    return next;
  }
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const clampNonNegativeInt = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

const AUTO_GROW_TEXTAREA_STYLE = {
  resize: "none",
  overflow: "hidden",
  height: "auto",
};

const parseDateMs = (value) => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
};

const trackerTotalSeconds = (tracker, nowMs = Date.now()) => {
  const savedTotal = Number(tracker?.total_time);
  const baseTotal =
    Number.isFinite(savedTotal) && savedTotal >= 0 ? Math.floor(savedTotal) : 0;

  if (tracker?.stop_track != null) {
    if (baseTotal > 0) return baseTotal;
    const startMs = parseDateMs(tracker?.start_track);
    const stopMs = parseDateMs(tracker?.stop_track);
    if (!startMs || !stopMs || stopMs < startMs) return 0;
    return Math.floor((stopMs - startMs) / 1000);
  }

  const startMs = parseDateMs(tracker?.start_track);
  if (!startMs) return baseTotal;
  const liveSeconds = Math.floor((nowMs - startMs) / 1000);
  return baseTotal + Math.max(0, liveSeconds);
};

const taskTrackedTotalSeconds = (trackers, nowMs = Date.now()) =>
  (Array.isArray(trackers) ? trackers : []).reduce(
    (sum, item) => sum + trackerTotalSeconds(item, nowMs),
    0,
  );

const formatHoursMinutes = (totalSeconds) => {
  const safeSeconds = clampNonNegativeInt(totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const countChecklistProgress = (items = []) =>
  (Array.isArray(items) ? items : []).reduce(
    (summary, item) => {
      return {
        total: summary.total + 1,
        completed:
          summary.completed +
          (item?.is_completed ? 1 : 0),
      };
    },
    { total: 0, completed: 0 },
  );

const countChecklistAttachments = (items = []) =>
  (Array.isArray(items) ? items : []).reduce((total, item) => {
    const itemAttachments = Array.isArray(item?.attachments)
      ? item.attachments.length
      : 0;
    return total + itemAttachments + countChecklistAttachments(item?.children || []);
  }, 0);

const markChecklistTreeCompleted = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    is_completed: true,
    children: markChecklistTreeCompleted(item?.children || []),
  }));

const getTaskAssigneeList = (task) => {
  if (Array.isArray(task?.assignees)) return task.assignees;
  if (task?.assignee) return [task.assignee];
  return [];
};

const getPrimaryTaskAssignee = (task) =>
  getTaskAssigneeList(task).find(Boolean) ?? null;

const getAssigneeDisplayName = (assignee) => {
  const name = String(
    assignee?.name ?? assignee?.full_name ?? assignee?.email ?? "",
  ).trim();
  return name || "Assigned user";
};

const TaskDetailModal = ({ isOpen, onClose, task, projectId, onDeleted, projectMembers = [] }) => {
  const propTask = task || {};

  const taskDetailState = useSelector((s) => s.taskDetail);
  const taskDetailMatches =
    taskDetailState?.projectId != null &&
    taskDetailState?.taskId != null &&
    String(taskDetailState.projectId) === String(projectId) &&
    String(taskDetailState.taskId) === String(propTask?.id ?? "");

  const detailLoading =
    isOpen &&
    taskDetailMatches &&
    taskDetailState?.status === "loading" &&
    !taskDetailState?.task;
  const detailTask = taskDetailMatches ? (taskDetailState?.task ?? null) : null;
  const t = detailTask || propTask;
  const effectiveProjectId =
    detailTask?.project?.id ??
    t?.project?.id ??
    t?.project_id ??
    projectId ??
    null;
  const deriveReviewStatus = (obj) => getTaskReviewStatus(obj);
  const deriveCompleted = (obj) =>
    deriveReviewStatus(obj) === TASK_REVIEW_STATUS.APPROVED;
  const deriveDueAt = (obj) => obj?.due_at ?? null;
  const deriveCompletedAt = (obj) => obj?.completed_at ?? null;
  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const creatorId = useSelector(
    (state) => state.taskDetail.creator?.id
  );

  const currentUserId = useSelector((state) => state.auth.user?.id);
  const currentUserName = useSelector((state) => state.auth.user?.name ?? "");
  const currentUserRole = useSelector(
    (state) => state.auth.user?.company_role ?? state.auth.user?.user_type ?? null,
  );
  const activeCompanyRole = useSelector(
    (state) => state.companyContext?.activeCompany?.membership?.role ?? null,
  );
  const companyRole = String(activeCompanyRole ?? currentUserRole ?? "")
    .trim()
    .toLowerCase();
  const canRateTask =
    companyRole === "company_owner" || companyRole === "company_supervisor";
  const canReviewTask = canRateTask;

  const [description, setDescription] = useState(t.description || "");
  const [savedDescription, setSavedDescription] = useState(t.description || "");
  const [taskText, setTaskText] = useState(t.text || "");
  const [savedTaskText, setSavedTaskText] = useState(t.text || "");
  const taskTextInputRef = useRef(null);
  const skipNextTaskTextBlurSaveRef = useRef(false);
  const [taskCompleting, setTaskCompleting] = useState(false);
  const [taskReviewing, setTaskReviewing] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(deriveCompleted(t));
  const [taskReviewStatus, setTaskReviewStatus] = useState(deriveReviewStatus(t));
  const [taskReviewNote, setTaskReviewNote] = useState(getTaskReviewNote(t));
  const [taskReviewSubmittedAt, setTaskReviewSubmittedAt] = useState(
    getTaskReviewSubmittedAt(t),
  );
  const [taskReviewSubmittedByName, setTaskReviewSubmittedByName] = useState(
    getTaskReviewSubmittedByName(t),
  );
  const [taskReviewReviewedAt, setTaskReviewReviewedAt] = useState(
    getTaskReviewReviewedAt(t),
  );
  const [taskReviewReviewerName, setTaskReviewReviewerName] = useState(
    getTaskReviewReviewerName(t),
  );
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [taskCompletedAt, setTaskCompletedAt] = useState(deriveCompletedAt(t));
  const [dueAt, setDueAt] = useState(deriveDueAt(t));
  const [savedDueAt, setSavedDueAt] = useState(deriveDueAt(t));
  const [dueDraftDate, setDueDraftDate] = useState(
    deriveDueAt(t) ? new Date(deriveDueAt(t)) : null,
  );
  const [dueDropdownOpen, setDueDropdownOpen] = useState(false);
  const [dueSaving, setDueSaving] = useState(false);
  const [priority, setPriority] = useState(normalizeTaskPriority(t.priority));
  const [savedPriority, setSavedPriority] = useState(
    normalizeTaskPriority(t.priority),
  );
  const [prioritySaving, setPrioritySaving] = useState(false);
  const [rating, setRating] = useState(normalizeTaskRating(t.rating));
  const [savedRating, setSavedRating] = useState(normalizeTaskRating(t.rating));
  const [ratingSaving, setRatingSaving] = useState(false);
  const [approvalRatingModalOpen, setApprovalRatingModalOpen] = useState(false);
  const [approvalRatingAssignee, setApprovalRatingAssignee] = useState(null);
  const [createdAt, setCreatedAt] = useState(t.created_at ?? null);
  const [updatedAt, setUpdatedAt] = useState(t.updated_at ?? null);
  const [checklistItems, setChecklistItems] = useState([]);
  const checklistLoading = detailLoading;
  const [checklistBusyId, setChecklistBusyId] = useState(null);
  const [subInputById, setSubInputById] = useState({});
  const [rootInput, setRootInput] = useState("");
  const [showRootInput, setShowRootInput] = useState(false);
  const skipRootBlurRef = useRef(false);
  const skipSubBlurByIdRef = useRef({});
  const [hoveredChecklistId, setHoveredChecklistId] = useState(null);
  const checklistAttachmentCount = useMemo(
    () => countChecklistAttachments(checklistItems),
    [checklistItems],
  );
  const dispatch = useDispatch();
  const [actionOpen, setActionOpen] = useState(false);
  const actionRef = useRef(null);
  const refreshDetail = () => {
    if (!effectiveProjectId || !taskId) return;
    dispatch(getTaskDetailThunk({ projectId: effectiveProjectId, taskId }));
  };

  const taskId = useMemo(() => t?.id ?? null, [t?.id]);
  const isTaskPendingReview = taskReviewStatus === TASK_REVIEW_STATUS.PENDING;
  const isTaskRejected = taskReviewStatus === TASK_REVIEW_STATUS.REJECTED;
  const isTaskApproved = taskReviewStatus === TASK_REVIEW_STATUS.APPROVED;
  const canSubmitForReview =
    !isTaskPendingReview && !isTaskApproved && !taskCompleting;
  const canRestoreTask =
    (isTaskPendingReview || isTaskApproved) && !taskCompleting;
  const taskTrackers = useMemo(() => {
    const list = detailTask?.time_trackers ?? t?.time_trackers;
    return Array.isArray(list) ? list : [];
  }, [detailTask?.time_trackers, t?.time_trackers]);
  const [trackedNowMs, setTrackedNowMs] = useState(Date.now());
  const [trackedTotalOverrideSeconds, setTrackedTotalOverrideSeconds] =
    useState(null);
  const hasActiveTracker = useMemo(
    () => taskTrackers.some((item) => item && item.stop_track == null),
    [taskTrackers],
  );
  const backendTrackedTotalSeconds = useMemo(
    () => taskTrackedTotalSeconds(taskTrackers, trackedNowMs),
    [taskTrackers, trackedNowMs],
  );
  const trackedTotalSeconds = useMemo(
    () =>
      Math.max(
        backendTrackedTotalSeconds,
        clampNonNegativeInt(trackedTotalOverrideSeconds),
      ),
    [backendTrackedTotalSeconds, trackedTotalOverrideSeconds],
  );
  const trackedTotalLabel = useMemo(
    () => formatHoursMinutes(trackedTotalSeconds),
    [trackedTotalSeconds],
  );
  const taskTextDirectionProps = useMemo(
    () => getTextDirectionProps(taskText, AUTO_GROW_TEXTAREA_STYLE),
    [taskText],
  );
  const descriptionDirectionProps = useMemo(
    () => getTextDirectionProps(description, AUTO_GROW_TEXTAREA_STYLE),
    [description],
  );
  const rootInputDirectionProps = useMemo(
    () => getTextDirectionProps(rootInput, AUTO_GROW_TEXTAREA_STYLE),
    [rootInput],
  );

  const taskColumnId = t?.column_id ?? t?.columnId ?? t?.column?.id ?? null;
  const projectColumns = useSelector((s) => s.projectColumns?.items || []);

  const resolvedColumnId = useMemo(() => {
    if (taskColumnId != null) return taskColumnId;
    if (!taskId) return null;

    const matchesTask = (x) => String(x?.id ?? "") === String(taskId);

    for (const col of projectColumns || []) {
      const tasks = Array.isArray(col?.tasks) ? col.tasks : [];
      if (tasks.some(matchesTask)) return col?.id ?? null;
    }
    return null;
  }, [taskColumnId, taskId, projectColumns]);
  const effectiveColumnId = resolvedColumnId ?? taskColumnId ?? null;

  const getTaskUpdateUrl = () => {
    if (!effectiveProjectId || !taskId || !resolvedColumnId) return null;
    return `/projects/${effectiveProjectId}/columns/${resolvedColumnId}/tasks/${taskId}`;
  };
  const updateTask = async (payload) => {
    const url = getTaskUpdateUrl();
    if (!url) throw new Error("Project/column/task id missing");
    return api.patch(url, payload);
  };
  const refreshTaskCard = () => {
    const columnIdForStore = resolvedColumnId ?? taskColumnId;
    if (!effectiveProjectId || !columnIdForStore) return;

    dispatch(
      getColumnTasksThunk({
        projectId: effectiveProjectId,
        columnId: columnIdForStore,
        force: true,
      }),
    );
  };
  const updateTaskCardChecklistProgress = (items) => {
    if (!taskId) return;

    const progress = countChecklistProgress(items);

    dispatch(
      updateTaskInColumn({
        columnId: resolvedColumnId ?? taskColumnId,
        taskId,
        patch: {
          checklist_items_total: progress.total,
          checklist_items_completed_count: progress.completed,
        },
      }),
    );
  };

  const handleAttachmentChanged = () => {
    refreshDetail();
    refreshTaskCard();
  };

  // comments + activity are rendered in TaskActivityConversation

  const isSaveCombo = (e) => e.key === "Enter" && !e.shiftKey;

  const normalizeTree = (items = []) =>
    sortChecklistByPosition(items).map((item) => ({
      ...item,
      is_completed: !!item.is_completed,
      text: item.text ?? "",
      _savedText: item._savedText ?? item.text ?? "",
      children: normalizeTree(item.children || []),
    }));

  const updateItemInTree = (items, id, updater) =>
    items.map((item) => {
      if (item.id === id) return updater(item);
      if (item.children?.length) {
        return {
          ...item,
          children: updateItemInTree(item.children, id, updater),
        };
      }
      return item;
    });

  const addChildToTree = (items, parentId, child) =>
    items.map((item) => {
      if (item.id === parentId) {
        const nextChildren = sortChecklistByPosition([
          ...(item.children || []),
          child,
        ]).map((c, idx) => ({ ...c, position: idx + 1 }));
        return { ...item, children: nextChildren };
      }
      if (item.children?.length) {
        return {
          ...item,
          children: addChildToTree(item.children, parentId, child),
        };
      }
      return item;
    });

  const reorderChecklistSiblings = (items, parentId, fromIndex, toIndex) => {
    const withPositions = (siblings, ownerParentId) =>
      arrayMove(siblings || [], fromIndex, toIndex).map((item, idx) => ({
        ...item,
        position: idx + 1,
        parent_item_id: ownerParentId ?? null,
      }));

    if (parentId == null) {
      return withPositions(items || [], null);
    }

    return (items || []).map((item) => {
      if (String(item?.id) === String(parentId)) {
        return {
          ...item,
          children: withPositions(item.children || [], item.id),
        };
      }
      if (item?.children?.length) {
        return {
          ...item,
          children: reorderChecklistSiblings(
            item.children,
            parentId,
            fromIndex,
            toIndex,
          ),
        };
      }
      return item;
    });
  };

  const normalizeDraggedChecklistOrder = (items = [], parentId = null) =>
    sortChecklistByPosition(items).map((item, index) => ({
      ...item,
      is_completed: !!item.is_completed,
      parent_item_id: parentId ?? null,
      position: index + 1,
      children: normalizeDraggedChecklistOrder(item.children || [], item.id),
    }));

  const collectChecklistSiblingIds = (items, parentId) => {
    const toIds = (list) =>
      (Array.isArray(list) ? list : [])
        .map((item) => Number(item?.id))
        .filter((id) => Number.isInteger(id) && id > 0);

    if (parentId == null) {
      return toIds(items);
    }

    for (const item of items || []) {
      if (String(item?.id) === String(parentId)) {
        return toIds(item?.children);
      }
      if (item?.children?.length) {
        const nested = collectChecklistSiblingIds(item.children, parentId);
        if (nested.length) return nested;
      }
    }

    return [];
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!effectiveProjectId || !taskId) return;
    dispatch(getTaskDetailThunk({ projectId: effectiveProjectId, taskId }));
  }, [isOpen, dispatch, effectiveProjectId, taskId]);

  useEffect(() => {
    if (!isOpen) return;
    setChecklistItems(normalizeTree(t?.checklist_items || []));
  }, [isOpen, t?.checklist_items]);

  useEffect(() => {
    const next = t.description || "";
    setDescription(next);
    setSavedDescription(next);
    const nextText = t.text || "";
    setTaskText(nextText);
    setSavedTaskText(nextText);
    const nextReviewStatus = deriveReviewStatus(t);
    setTaskReviewStatus(nextReviewStatus);
    setTaskReviewNote(getTaskReviewNote(t));
    setTaskReviewSubmittedAt(getTaskReviewSubmittedAt(t));
    setTaskReviewSubmittedByName(getTaskReviewSubmittedByName(t));
    setTaskReviewReviewedAt(getTaskReviewReviewedAt(t));
    setTaskReviewReviewerName(getTaskReviewReviewerName(t));
    setRejectReasonOpen(false);
    setRejectReason("");
    setTaskCompleted(nextReviewStatus === TASK_REVIEW_STATUS.APPROVED);
    setTaskCompletedAt(deriveCompletedAt(t));
    const nextDueAt = deriveDueAt(t);
    setDueAt(nextDueAt);
    setSavedDueAt(nextDueAt);
    setDueDraftDate(nextDueAt ? new Date(nextDueAt) : null);
    setDueDropdownOpen(false);
    setDueSaving(false);
    const nextPriority = normalizeTaskPriority(t.priority);
    setPriority(nextPriority);
    setSavedPriority(nextPriority);
    setPrioritySaving(false);
    const nextRating = normalizeTaskRating(t.rating);
    setRating(nextRating);
    setSavedRating(nextRating);
    setRatingSaving(false);
    setCreatedAt(t.created_at ?? null);
    setUpdatedAt(t.updated_at ?? null);
  }, [
    t.description,
    t.text,
    t.status,
    t.is_completed,
    t.review_status,
    t.completion_status,
    t.approval_status,
    t.task_review_status,
    t.rejection_note,
    t.review_note,
    t.rejection_reason,
    t.approval_note,
    t.completion_submitted_at,
    t.review_requested_at,
    t.submitted_at,
    t.completion_submitted_by,
    t.review_requested_by,
    t.submitted_by,
    t.submitter,
    t.reviewed_at,
    t.approved_at,
    t.rejected_at,
    t.reviewed_by,
    t.reviewer,
    t.approved_by,
    t.rejected_by,
    t.completed_at,
    t.created_at,
    t.updated_at,
    t.due_at,
    t.priority,
    t.rating,
    t.id,
  ]);

  useEffect(() => {
    setTrackedTotalOverrideSeconds(null);
  }, [taskId, isOpen]);

  useEffect(() => {
    setApprovalRatingModalOpen(false);
    setApprovalRatingAssignee(null);
  }, [taskId]);

  useEffect(() => {
    if (trackedTotalOverrideSeconds == null) return;
    if (
      backendTrackedTotalSeconds >=
      clampNonNegativeInt(trackedTotalOverrideSeconds)
    ) {
      setTrackedTotalOverrideSeconds(null);
    }
  }, [backendTrackedTotalSeconds, trackedTotalOverrideSeconds]);

  useEffect(() => {
    if (!isOpen) return;
    setTrackedNowMs(Date.now());
  }, [isOpen, taskId, taskTrackers]);

  useEffect(() => {
    if (!isOpen || !hasActiveTracker) return undefined;

    const intervalId = window.setInterval(() => {
      setTrackedNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, hasActiveTracker]);

  const handleTimerStateChanged = useCallback(
    (payload = {}) => {
      const nextTotalSeconds = clampNonNegativeInt(payload?.taskTotalSeconds);
      setTrackedTotalOverrideSeconds(nextTotalSeconds);

      const columnIdForStore = resolvedColumnId ?? taskColumnId;
      if (!effectiveProjectId || !columnIdForStore) return;

      dispatch(
        getColumnTasksThunk({
          projectId: effectiveProjectId,
          columnId: columnIdForStore,
          force: true,
        }),
      );
    },
    [dispatch, effectiveProjectId, resolvedColumnId, taskColumnId],
  );

  const isDueAtOverdue = useMemo(() => {
    if (!dueAt || taskCompleted) return false;
    const ms = new Date(dueAt).getTime();
    return Number.isFinite(ms) && ms < Date.now();
  }, [dueAt, taskCompleted]);

  useEffect(() => {
    if (!isOpen) return;
    const resize = () => {
      const nodes = document.querySelectorAll(
        ".task-title-textarea, .checklist-textarea, .autogrow-textarea",
      );
      nodes.forEach((el) => {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      });
    };
    const id = requestAnimationFrame(resize);
    return () => cancelAnimationFrame(id);
  }, [isOpen, checklistItems, description, taskText]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e) => {
      const input = taskTextInputRef.current;
      if (!input) return;
      if (document.activeElement !== input) return;
      if (input.contains(e.target)) return;
      input.blur();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [isOpen]);

  const createChecklistItem = async ({ text, parentId = null }) => {
    if (!projectId || !taskId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      setChecklistBusyId(parentId || "root");
      const payload = parentId
        ? { text: trimmed, parent_item_id: parentId }
        : { text: trimmed };
      const res = await api.post(
        `/projects/${projectId}/tasks/${taskId}/checklist-items`,
        payload,
      );
      const item = res.data?.data ?? res.data ?? { text: trimmed };
      const nextItem = {
        ...item,
        text: item.text ?? trimmed,
        _savedText: item.text ?? trimmed,
        children: item.children || [],
      };
      const nextItems = parentId
        ? normalizeTree(addChildToTree(checklistItems, parentId, nextItem))
        : normalizeTree([...checklistItems, nextItem]);
      setChecklistItems(nextItems);
      updateTaskCardChecklistProgress(nextItems);
      refreshDetail();
      refreshTaskCard();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Create checklist failed";
      toastError(msg);
    } finally {
      setChecklistBusyId(null);
    }
  };

  const updateChecklistText = async (item, text) => {
    if (!projectId || !taskId || !item?.id) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const current = (item._savedText ?? item.text ?? "").trim();
    if (current === trimmed) return;
    try {
      setChecklistBusyId(item.id);
      await api.patch(
        `/projects/${projectId}/tasks/${taskId}/checklist-items/${item.id}`,
        { text },
      );
      setChecklistItems((prev) =>
        updateItemInTree(prev, item.id, (i) => ({
          ...i,
          text,
          _savedText: text,
        })),
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Update checklist failed";
      toastError(msg);
    } finally {
      setChecklistBusyId(null);
    }
  };

  const updateTaskDescription = async (text) => {
    const url = getTaskUpdateUrl();
    if (!url) {
      toastError("Project/column/task id missing");
      return;
    }
    const trimmed = text.trim();
    const current = (savedDescription ?? "").trim();
    if (current === trimmed) return;
    try {
      await updateTask({ description: text });
      dispatch(
        updateTaskInColumn({
          columnId: resolvedColumnId,
          taskId,
          patch: { description: text },
        }),
      );
      refreshDetail();
      setSavedDescription(text);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Update description failed";
      toastError(msg);
    }
  };

  const updateTaskText = async (text) => {
    const url = getTaskUpdateUrl();
    if (!url) {
      toastError("Project/column/task id missing");
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      setTaskText(savedTaskText);
      return;
    }
    const current = (savedTaskText ?? "").trim();
    if (current === trimmed) return;
    try {
      await updateTask({ text: trimmed });
      dispatch(
        updateTaskInColumn({
          columnId: resolvedColumnId,
          taskId,
          patch: { text: trimmed },
        }),
      );
      refreshDetail();
      setSavedTaskText(trimmed);
      setTaskText(trimmed);
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Update task failed";
      toastError(msg);
      setTaskText(savedTaskText);
    }
  };

  const parseDueAtInput = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatDueAtForApi = (value) => {
    const d = parseDueAtInput(value);
    if (!d) return null;

    // Backend stores due_at in UTC; send UTC clock parts so the selected local
    // time survives a round-trip back to the client without shifting.
    const pad2 = (n) => String(n).padStart(2, "0");
    const y = d.getUTCFullYear();
    const m = pad2(d.getUTCMonth() + 1);
    const day = pad2(d.getUTCDate());
    const hh = pad2(d.getUTCHours());
    const mm = pad2(d.getUTCMinutes());
    const ss = pad2(d.getUTCSeconds());
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
  };

  const cancelDuePicker = () => {
    setDueDraftDate(savedDueAt ? new Date(savedDueAt) : null);
    setDueAt(savedDueAt);
    setDueDropdownOpen(false);
  };

  const syncDueDraftFromCurrent = () => {
    const base = dueAt ?? savedDueAt ?? null;
    const nextDraft = base ? new Date(base) : null;
    setDueDraftDate(
      nextDraft && !Number.isNaN(nextDraft.getTime()) ? nextDraft : null,
    );
  };

  const updateTaskDueAt = async (value) => {
    if (!projectId || !taskId) return;
    const parsedValue = parseDueAtInput(value);
    const isoValue = parsedValue?.toISOString?.() ?? null;
    if ((savedDueAt ?? "") === (isoValue ?? "")) return;
    try {
      setDueSaving(true);
      const dueAtForApi = formatDueAtForApi(parsedValue);
      try {
        await api.patch(`/projects/${projectId}/tasks/${taskId}/due-time`, {
          due_at: dueAtForApi,
        });
      } catch {
        await api.post(`/projects/${projectId}/tasks/${taskId}/due-time`, {
          due_at: dueAtForApi,
        });
      }
      dispatch(
        updateTaskInColumn({
          columnId: taskColumnId,
          taskId,
          patch: { due_at: isoValue },
        }),
      );
      refreshDetail();
      setSavedDueAt(isoValue);
      setDueAt(isoValue);
      setDueDropdownOpen(false);
    } catch (err) {
      toastError(err?.message || "Update due date failed");
      setDueAt(savedDueAt);
    } finally {
      setDueSaving(false);
    }
  };

  const toggleDueDropdown = () => {
    if (dueSaving) return;
    if (dueDropdownOpen) {
      cancelDuePicker();
      return;
    }
    syncDueDraftFromCurrent();
    setDueDropdownOpen(true);
  };

  const updateTaskPriority = async (nextPriorityValue) => {
    const nextPriority = normalizeTaskPriority(nextPriorityValue);
    if (nextPriority === savedPriority) {
      setPriority(nextPriority);
      return;
    }

    const previousPriority = priority;
    try {
      setPrioritySaving(true);
      setPriority(nextPriority);
      const res = await updateTask({ priority: nextPriority });
      const updated = res?.data?.data ?? res?.data ?? {};
      const persistedPriority = normalizeTaskPriority(
        updated?.priority ?? nextPriority,
      );

      dispatch(
        updateTaskInColumn({
          columnId: resolvedColumnId ?? taskColumnId,
          taskId,
          patch: { priority: persistedPriority },
        }),
      );
      setPriority(persistedPriority);
      setSavedPriority(persistedPriority);
      refreshDetail();
    } catch (err) {
      setPriority(previousPriority);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Update priority failed";
      toastError(msg);
    } finally {
      setPrioritySaving(false);
    }
  };

  const updateTaskRating = async (nextRatingValue) => {
    if (!isTaskApproved) {
      toastError("Task must be approved before rating");
      return false;
    }

    const nextRating = normalizeTaskRating(nextRatingValue);
    if (!nextRating) {
      toastError("Rating must be from 1 to 5");
      return false;
    }

    if (nextRating === savedRating) {
      setRating(nextRating);
      return true;
    }

    const previousRating = rating;
    try {
      setRatingSaving(true);
      setRating(nextRating);
      const res = await api.patch(
        `/projects/${effectiveProjectId}/tasks/${taskId}/rating`,
        { rating: nextRating },
      );
      const updated = res?.data?.data ?? res?.data ?? {};
      const persistedRating = normalizeTaskRating(updated?.rating ?? nextRating);

      dispatch(
        updateTaskInColumn({
          columnId: resolvedColumnId ?? taskColumnId,
          taskId,
          patch: { rating: persistedRating },
        }),
      );
      setRating(persistedRating);
      setSavedRating(persistedRating);
      refreshDetail();
      toastSuccess("Task rating updated");
      return true;
    } catch (err) {
      setRating(previousRating);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Update rating failed";
      toastError(msg);
      return false;
    } finally {
      setRatingSaving(false);
    }
  };

  const handleClose = () => {
    const active = document.activeElement;
    if (active && typeof active.blur === "function") {
      active.blur();
    }
    onClose?.();
  };

  const archiveTask = async () => {
    const columnId = resolvedColumnId ?? t.column_id;
    if (!projectId || !taskId || !columnId) {
      toastError("Project/column/id is missing");
      return;
    }
    try {
      dispatch(restoreArchivedTasks({ projectId, columnId, taskId }));
      onDeleted?.({ taskId, columnId });
      onClose?.();
      toastSuccess("Task archived");
    } catch (err) {
      toastError("Somthing went wrong");
    }
  };

  const deleteTask = async () => {
    const columnId =
      resolvedColumnId ?? t.column_id ?? t.columnId ?? t.column?.id ?? null;
    if (!projectId || !taskId || !columnId) {
      toastError("Project/column/task id missing");
      return;
    }
    try {
      const { isConfirmed } = await alertConfirm({
        title: "Delete task",
        text: "Task will be deleted. Continue?",
        confirmText: "Delete",
        cancelText: "No",
      });
      if (!isConfirmed) return;
      await api.delete(
        `/projects/${projectId}/columns/${columnId}/tasks/${taskId}`,
      );
      toastSuccess("Task deleted successfuly");
      onDeleted?.({ taskId, columnId });
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Delete task failed";
      toastError(msg);
    }
  };

  const toggleChecklistItem = async (item, checked) => {
    if (!projectId || !taskId || !item?.id) return;
    try {
      setChecklistBusyId(item.id);
      await api.patch(
        `/projects/${projectId}/tasks/${taskId}/checklist-items/${item.id}`,
        { is_completed: checked ? 1 : 0 },
      );
      const nextItems = normalizeTree(
        updateItemInTree(checklistItems, item.id, (i) => ({
          ...i,
          is_completed: !!checked,
        })),
      );

      setChecklistItems(nextItems);
      updateTaskCardChecklistProgress(nextItems);
      refreshDetail();
      refreshTaskCard();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Update checklist failed";
      toastError(msg);
    } finally {
      setChecklistBusyId(null);
    }
  };

  const deleteChecklistItem = async (item) => {
    if (!projectId || !taskId || !item?.id) return;
    try {
      setChecklistBusyId(item.id);
      await api.delete(
        `/projects/${projectId}/tasks/${taskId}/checklist-items/${item.id}`,
      );
      const removeFromTree = (items) =>
        (items || [])
          .filter((i) => i.id !== item.id)
          .map((i) => ({
            ...i,
            children: removeFromTree(i.children || []),
          }));
      const nextItems = removeFromTree(checklistItems);
      setChecklistItems(nextItems);
      updateTaskCardChecklistProgress(nextItems);
      refreshDetail();
      refreshTaskCard();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Delete checklist failed";
      toastError(msg);
    } finally {
      setChecklistBusyId(null);
    }
  };

  const getTaskPayloadFromResponse = (res, fallback = {}) => {
    const data = res?.data?.data ?? res?.data ?? {};
    return {
      ...(fallback || {}),
      ...(data && typeof data === "object" ? data : {}),
    };
  };

  const preserveCurrentAssigneePatch = (patch = {}) => {
    const currentAssignees = Array.isArray(detailTask?.assignees)
      ? detailTask.assignees
      : Array.isArray(t?.assignees)
        ? t.assignees
        : [];
    const currentAssignee = detailTask?.assignee ?? t?.assignee ?? currentAssignees[0] ?? null;
    const hasAssignees = Object.prototype.hasOwnProperty.call(patch, "assignees");
    const hasAssignee = Object.prototype.hasOwnProperty.call(patch, "assignee");
    const nextPatch = { ...patch };

    if (
      currentAssignees.length &&
      (!hasAssignees || (Array.isArray(patch.assignees) && patch.assignees.length === 0))
    ) {
      nextPatch.assignees = currentAssignees;
    }

    if (currentAssignee && (!hasAssignee || !patch.assignee)) {
      nextPatch.assignee = currentAssignee;
    }

    return nextPatch;
  };

  const applyReviewState = (updated, fallbackStatus) => {
    const nextStatus = getTaskReviewStatus({
      ...(updated || {}),
      review_status: updated?.review_status ?? fallbackStatus,
    });
    const nextCompleted = nextStatus === TASK_REVIEW_STATUS.APPROVED;
    const reviewPatch = preserveCurrentAssigneePatch({
      ...(updated || {}),
      review_status: nextStatus,
    });
    const nextSubmittedAt = getTaskReviewSubmittedAt(reviewPatch);
    const nextReviewedAt = getTaskReviewReviewedAt(reviewPatch);

    dispatch(
      updateTaskInColumn({
        columnId: resolvedColumnId ?? taskColumnId,
        taskId,
        patch: reviewPatch,
      }),
    );
    dispatch(patchTaskDetail(reviewPatch));
    persistTaskReviewState(taskId, reviewPatch);

    setTaskReviewStatus(nextStatus);
    setTaskReviewNote(getTaskReviewNote(reviewPatch));
    setTaskReviewSubmittedAt(nextSubmittedAt);
    setTaskReviewSubmittedByName(getTaskReviewSubmittedByName(reviewPatch));
    setTaskReviewReviewedAt(nextReviewedAt);
    setTaskReviewReviewerName(getTaskReviewReviewerName(reviewPatch));
    setTaskCompleted(nextCompleted);
    setTaskCompletedAt(nextCompleted ? deriveCompletedAt(reviewPatch) : null);
    return reviewPatch;
  };

  const handleCompleteTask = async () => {
    if (!canSubmitForReview) return;
    if (!effectiveProjectId || !taskId) return;
    try {
      setTaskCompleting(true);
      const submittedAt = new Date().toISOString();
      const res = await api.patch(
        `/projects/${effectiveProjectId}/tasks/${taskId}/complete`,
        { is_completed: true },
      );
      const updated = getTaskPayloadFromResponse(res, {
        review_status: TASK_REVIEW_STATUS.PENDING,
        completion_submitted_at: submittedAt,
        completion_submitted_by: currentUserName,
      });
      const completedChecklistItems = normalizeTree(
        markChecklistTreeCompleted(
          Array.isArray(updated?.checklist_items)
            ? updated.checklist_items
            : checklistItems,
        ),
      );
      const checklistProgress = countChecklistProgress(completedChecklistItems);
      const stoppedAt = updated.completion_submitted_at ?? submittedAt;
      const stoppedTrackers = Array.isArray(updated?.time_trackers)
        ? updated.time_trackers
        : taskTrackers.map((tracker) =>
            tracker?.stop_track == null
              ? { ...tracker, stop_track: stoppedAt, type: "stop" }
              : tracker,
          );

      applyReviewState(
        {
          ...updated,
          review_status: updated.review_status ?? TASK_REVIEW_STATUS.PENDING,
          completion_submitted_at:
            updated.completion_submitted_at ?? submittedAt,
          completion_submitted_by:
            updated.completion_submitted_by ?? currentUserName,
          checklist_items: completedChecklistItems,
          checklist_items_total:
            updated.checklist_items_total ?? checklistProgress.total,
          checklist_items_completed_count:
            updated.checklist_items_completed_count ?? checklistProgress.completed,
          time_trackers: stoppedTrackers,
          type: updated.type ?? (hasActiveTracker ? "stop" : t?.type ?? null),
        },
        TASK_REVIEW_STATUS.PENDING,
      );
      if (completedChecklistItems.length) {
        setChecklistItems(completedChecklistItems);
        updateTaskCardChecklistProgress(completedChecklistItems);
      }
      setTrackedTotalOverrideSeconds(trackedTotalSeconds);
      refreshDetail();
      refreshTaskCard();
      toastSuccess("Task submitted for review");
    } catch (err) {
      toastError(err?.message || "Submit task for review failed");
    } finally {
      setTaskCompleting(false);
    }
  };

  const handleApproveTask = async () => {
    if (!canReviewTask || !isTaskPendingReview || taskReviewing) return;
    if (!effectiveProjectId || !taskId) return;

    try {
      setTaskReviewing(true);
      const reviewedAt = new Date().toISOString();
      const res = await api.patch(
        `/projects/${effectiveProjectId}/tasks/${taskId}/review`,
        { review_status: TASK_REVIEW_STATUS.APPROVED },
      );
      const updated = getTaskPayloadFromResponse(res, {
        review_status: TASK_REVIEW_STATUS.APPROVED,
        reviewed_at: reviewedAt,
        reviewed_by: currentUserName,
        completed_at: reviewedAt,
        status: "done",
      });
      const stoppedTrackers = Array.isArray(updated?.time_trackers)
        ? updated.time_trackers
        : taskTrackers.map((tracker) =>
            tracker?.stop_track == null
              ? { ...tracker, stop_track: updated.reviewed_at ?? reviewedAt, type: "stop" }
              : tracker,
          );

      const reviewPatch = applyReviewState(
        {
          ...updated,
          review_status: updated.review_status ?? TASK_REVIEW_STATUS.APPROVED,
          reviewed_at: updated.reviewed_at ?? reviewedAt,
          reviewed_by: updated.reviewed_by ?? currentUserName,
          completed_at: updated.completed_at ?? reviewedAt,
          status: updated.status ?? "done",
          time_trackers: stoppedTrackers,
          type: updated.type ?? (hasActiveTracker ? "stop" : t?.type ?? null),
        },
        TASK_REVIEW_STATUS.APPROVED,
      );
      setTrackedTotalOverrideSeconds(trackedTotalSeconds);
      refreshDetail();
      refreshTaskCard();
      setRejectReasonOpen(false);
      setRejectReason("");
      const approvedAssignee = getPrimaryTaskAssignee(reviewPatch);
      if (approvedAssignee) {
        setApprovalRatingAssignee(approvedAssignee);
        setApprovalRatingModalOpen(true);
      }
      toastSuccess("Task approved");
    } catch (err) {
      toastError(err?.message || "Approve task failed");
    } finally {
      setTaskReviewing(false);
    }
  };

  const handleRejectTask = async () => {
    if (!canReviewTask || !isTaskPendingReview || taskReviewing) return;
    if (!effectiveProjectId || !taskId) return;

    const note = rejectReason.trim();
    if (!note) {
      toastError("Rejection reason is required");
      return;
    }

    try {
      setTaskReviewing(true);
      const reviewedAt = new Date().toISOString();
      const res = await api.patch(
        `/projects/${effectiveProjectId}/tasks/${taskId}/review`,
        {
          review_status: TASK_REVIEW_STATUS.REJECTED,
          rejection_note: note,
        },
      );
      const updated = getTaskPayloadFromResponse(res, {
        review_status: TASK_REVIEW_STATUS.REJECTED,
        rejection_note: note,
        reviewed_at: reviewedAt,
        reviewed_by: currentUserName,
        status: "open",
        completed_at: null,
      });

      applyReviewState(
        {
          ...updated,
          review_status: updated.review_status ?? TASK_REVIEW_STATUS.REJECTED,
          rejection_note: updated.rejection_note ?? note,
          reviewed_at: updated.reviewed_at ?? reviewedAt,
          reviewed_by: updated.reviewed_by ?? currentUserName,
          status: updated.status ?? "open",
          completed_at: null,
        },
        TASK_REVIEW_STATUS.REJECTED,
      );
      setRejectReasonOpen(false);
      setRejectReason("");
      toastSuccess("Changes requested");
    } catch (err) {
      toastError(err?.message || "Reject task failed");
    } finally {
      setTaskReviewing(false);
    }
  };

  const handleRestoreTask = async () => {
    if (!canRestoreTask) return;
    if (!effectiveProjectId || !taskId) return;

    try {
      setTaskCompleting(true);
      let res;
      try {
        res = await api.patch(`/projects/${effectiveProjectId}/tasks/${taskId}/complete`, {
          is_completed: false,
        });
      } catch (err) {
        res = resolvedColumnId ? await updateTask({ status: "open" }) : null;
      }

      const updated = getTaskPayloadFromResponse(res, {
        review_status: TASK_REVIEW_STATUS.ACTIVE,
        status: "open",
        completed_at: null,
      });

      applyReviewState(
        {
          ...updated,
          review_status: TASK_REVIEW_STATUS.ACTIVE,
          status: "open",
          completed_at: null,
          completion_submitted_at: null,
          completion_submitted_by: null,
          reviewed_at: null,
          reviewed_by: null,
          rejection_note: null,
        },
        TASK_REVIEW_STATUS.ACTIVE,
      );
      setApprovalRatingModalOpen(false);
      setApprovalRatingAssignee(null);
      refreshDetail();
      refreshTaskCard();
      toastSuccess("Task restored");
    } catch (err) {
      toastError(err?.message || "Restore task failed");
    } finally {
      setTaskCompleting(false);
    }
  };

  const handleChecklistReorder = async (
    parentId,
    sourceIndex,
    destinationIndex,
  ) => {
    const normalizedProjectId = Number(effectiveProjectId ?? projectId);
    const normalizedTaskId = Number(taskId);
    const isValidContext =
      Number.isInteger(normalizedProjectId) &&
      normalizedProjectId > 0 &&
      Number.isInteger(normalizedTaskId) &&
      normalizedTaskId > 0;

    const previousItems = checklistItems;
    const movedItems = reorderChecklistSiblings(
      previousItems,
      parentId,
      sourceIndex,
      destinationIndex,
    );
    const nextItems = normalizeDraggedChecklistOrder(movedItems);
    const orderedIds = collectChecklistSiblingIds(nextItems, parentId);

    if (!orderedIds.length) return;
    setChecklistItems(nextItems);
    if (!isValidContext) return;

    const busyKey = parentId ?? "root";
    try {
      setChecklistBusyId(busyKey);
      await dispatch(
        reorderTaskChecklistItemsThunk({
          projectId: normalizedProjectId,
          taskId: normalizedTaskId,
          orderedIds,
          parentItemId: parentId,
        }),
      ).unwrap();
    } catch (err) {
      setChecklistItems(previousItems);
      toastError(err?.message || "Checklist reorder failed");
    } finally {
      setChecklistBusyId(null);
    }
  };

  const handleChecklistTextChange = (itemId, value) => {
    setChecklistItems((prev) =>
      updateItemInTree(prev, itemId, (i) => ({ ...i, text: value })),
    );
  };

  function copyTaskLink() {
    const taskLink = window.location.href;
    navigator.clipboard.writeText(taskLink);
    toastSuccess("Link Copied");
  }

  const reviewStatusView = {
    [TASK_REVIEW_STATUS.PENDING]: {
      label: "Pending Approval",
      className: "task-review-status-pill--pending",
      icon: "ti ti-clock",
      meta: taskReviewSubmittedByName
        ? `Submitted by ${taskReviewSubmittedByName}`
        : "Submitted for review",
      date: taskReviewSubmittedAt,
    },
    [TASK_REVIEW_STATUS.APPROVED]: {
      label: "Approved",
      className: "task-review-status-pill--approved",
      icon: "ti ti-circle-check",
      meta: taskReviewReviewerName
        ? `Approved by ${taskReviewReviewerName}`
        : "Approved",
      date: taskReviewReviewedAt ?? taskCompletedAt,
    },
    [TASK_REVIEW_STATUS.REJECTED]: {
      label: "Changes Requested",
      className: "task-review-status-pill--rejected",
      icon: "ti ti-circle-x",
      meta: taskReviewReviewerName
        ? `Rejected by ${taskReviewReviewerName}`
        : "Rejected",
      date: taskReviewReviewedAt,
    },
  }[taskReviewStatus] ?? null;
  const approvalRatingAssigneeName = getAssigneeDisplayName(
    approvalRatingAssignee,
  );
  const approvalRatingAssigneeAvatar = useMemo(
    () =>
      resolveUserAvatarWithFallback(
        approvalRatingAssignee?.avatar,
        approvalRatingAssignee?.id ??
          approvalRatingAssignee?.email ??
          approvalRatingAssigneeName ??
          taskId ??
          "",
      ),
    [approvalRatingAssignee, approvalRatingAssigneeName, taskId],
  );
  const handleApprovalRatingChange = async (nextRating) => {
    const saved = await updateTaskRating(nextRating);
    if (saved) setApprovalRatingModalOpen(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={handleClose}
        size="lg"
        className="task-detail-modal-dialog byekan-font"
      >
        <div className="d-flex justify-content-between p-4 border border-bottom-1 rounded-top task-detail-modal__header">
          <div className="d-flex align-items-start gap-2 flex-wrap">
            {reviewStatusView ? (
              <div className="task-review-summary">
                <div className="task-review-summary__top">
                  <span
                    className={`task-review-status-pill ${reviewStatusView.className}`}
                  >
                    <i className={reviewStatusView.icon}></i>
                    {reviewStatusView.label}
                  </span>
                  {isTaskApproved && canRateTask ? (
                    <TaskRatingDropdown
                      value={rating}
                      saving={ratingSaving}
                      disabled={
                        !effectiveProjectId ||
                        !taskId ||
                        detailLoading ||
                        !detailTask
                      }
                      onChange={updateTaskRating}
                    />
                  ) : isTaskApproved && rating ? (
                    <span className="task-rating-pill">{rating}/5</span>
                  ) : null}
                </div>
                <span className="task-review-summary__meta">
                  {reviewStatusView.meta}
                  {reviewStatusView.date ? (
                    <>
                      {" "}
                      <span>{formatDateTime(reviewStatusView.date)}</span>
                    </>
                  ) : null}
                </span>
              </div>
            ) : null}

            {canSubmitForReview ? (
              <button
                type="button"
                className={`btn ${
                  isTaskRejected ? "btn-outline-danger" : "btn-outline-primary"
                }`}
                onClick={handleCompleteTask}
                disabled={taskCompleting}
              >
                <i className="ti ti-send me-1"></i>
                {isTaskRejected ? "Resubmit For Review" : "Submit For Review"}
              </button>
            ) : null}

            {isTaskPendingReview && canReviewTask ? (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleApproveTask}
                  disabled={taskReviewing}
                >
                  <i className="ti ti-check me-1"></i>
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setRejectReasonOpen((value) => !value)}
                  disabled={taskReviewing}
                >
                  <i className="ti ti-x me-1"></i>
                  Reject
                </button>
              </div>
            ) : null}

            {!isTaskApproved ? (
              <TaskAssigneeDropdown
                projectId={effectiveProjectId}
                columnId={effectiveColumnId}
                taskId={taskId}
                selectedAssignees={detailTask?.assignees ?? t?.assignees ?? []}
                disabled={!effectiveProjectId || !taskId}
                variant="header"
              />
            ) : null}
          </div>
          <div className="ms-auto d-flex gap-2 align-items-start task-detail-modal__header-right">
            <div className="d-flex gap-2 task-detail-modal__quick-actions">
              {checklistLoading ? (
                <div className="d-flex align-items-center px-2">
                  <Spinner size="sm" color="primary" />
                </div>
              ) : null}
              <button type="button" className="btn text-muted icon-btn b-r-100">
                <i className="ti ti-pin fs-4"></i>
              </button>
              <div ref={actionRef} className="position-relative">
                <button
                  type="button"
                  className="btn text-muted icon-btn b-r-100"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActionOpen((v) => !v);
                  }}
                >
                  <i className="ti ti-dots fs-4"></i>
                </button>
                <ActionDropdown
                  open={actionOpen}
                  onToggle={setActionOpen}
                  rootRef={actionRef}
                  actions={[
                    {
                      key: "copyLink",
                      label: "Copy link",
                      icon: "ti-link",
                      destructive: false,
                      onClick: copyTaskLink,
                    },
                    {
                      key: "archive",
                      label: "Archive",
                      icon: "ti-archive",
                      destructive: false,
                      onClick: archiveTask,
                    },
                    ...(canRestoreTask
                      ? [
                          {
                            key: "restore",
                            label: "Restore",
                            icon: "ti-refresh",
                            destructive: false,
                            onClick: handleRestoreTask,
                          },
                        ]
                      : []),
                    {
                      key: "delete",
                      label: "Delete",
                      destructive: true,
                      onClick: deleteTask,
                    },
                  ]}
                />
              </div>
              <button
                onClick={handleClose}
                type="button"
                className="btn text-muted icon-btn b-r-100"
              >
                <i className="fa-solid fa-times fa-fw fs-5"></i>
              </button>
            </div>
          </div>
        </div>

        {rejectReasonOpen ? (
          <div className="task-review-rejection-panel">
            <label htmlFor="task-review-rejection-note">
              Reason for rejection
            </label>
            <textarea
              id="task-review-rejection-note"
              className="form-control"
              rows="2"
              placeholder="Write what needs to be fixed before approval..."
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              disabled={taskReviewing}
            />
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setRejectReasonOpen(false);
                  setRejectReason("");
                }}
                disabled={taskReviewing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleRejectTask}
                disabled={taskReviewing}
              >
                Request Changes
              </button>
            </div>
          </div>
        ) : null}

        <ModalBody
          className="task-detail-modal__body"
          style={{
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 20,
          }}
        >
          {checklistLoading ? (
            <TaskModalPlaceHolder />
          ) : (
            <div className="row g-4">
              <div
                className="col-12 col-lg-8 pt-2 pb-5 task-detail-modal__main"
                style={{ paddingRight: 0 }}
              >
                <div className="pb-3">
                  <div className="task-detail-editor task-detail-editor--title mb-3">
                    <textarea
                      ref={taskTextInputRef}
                      className="form-control f-s-16 border-0 task-title-textarea"
                      rows="1"
                      placeholder="Task title"
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      onBlur={(e) => {
                        if (skipNextTaskTextBlurSaveRef.current) {
                          skipNextTaskTextBlurSaveRef.current = false;
                          return;
                        }
                        updateTaskText(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" ||
                          e.code === "NumpadEnter" ||
                          e.keyCode === 13
                        ) {
                          e.preventDefault();
                          updateTaskText(e.currentTarget.value);
                          skipNextTaskTextBlurSaveRef.current = true;
                          e.currentTarget.blur();
                        }
                      }}
                      onInput={(e) => {
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                      }}
                      {...taskTextDirectionProps}
                    />
                  </div>
                  <div className="task-detail-editor task-detail-editor--description">
                    <textarea
                      className="form-control f-s-14 border-0 autogrow-textarea"
                      rows="1"
                      placeholder="Click to add a description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={(e) => updateTaskDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (isSaveCombo(e)) {
                          e.preventDefault();
                          updateTaskDescription(e.currentTarget.value);
                          e.currentTarget.blur();
                        }
                      }}
                      onInput={(e) => {
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                      }}
                      {...descriptionDirectionProps}
                    />
                  </div>
                  {isTaskRejected && taskReviewNote ? (
                    <div className="task-review-note-alert mt-3">
                      <div className="task-review-note-alert__title">
                        <i className="ti ti-alert-triangle"></i>
                        Reason for rejection
                      </div>
                      <p className="mb-0">{taskReviewNote}</p>
                    </div>
                  ) : null}
                </div>

                <div className="py-3">
                  <button
                    type="button"
                    className="btn px-2 b-r-20 d-flex align-items-center gap-2 text-primary"
                    onClick={() => {
                      setShowRootInput(true);
                      setRootInput("");
                    }}
                  >
                    <i className="fa-solid fa-plus fa-fw"></i>
                    <span>Add checklist item</span>
                  </button>
                  {showRootInput ? (
                    <div>
                      <textarea
                        className="form-control autogrow-textarea"
                        rows="1"
                        placeholder="Write an item..."
                        value={rootInput}
                        onChange={(e) => setRootInput(e.target.value)}
                        onBlur={async () => {
                          if (skipRootBlurRef.current) {
                            skipRootBlurRef.current = false;
                            return;
                          }
                          const text = rootInput.trim();
                          if (text) await createChecklistItem({ text });
                          setRootInput("");
                          setShowRootInput(false);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            skipRootBlurRef.current = true;
                            const text = rootInput.trim();
                            if (text) await createChecklistItem({ text });
                            setRootInput("");
                            setShowRootInput(false);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            skipRootBlurRef.current = true;
                            setRootInput("");
                            setShowRootInput(false);
                          }
                        }}
                        onInput={(e) => {
                          e.currentTarget.style.height = "auto";
                          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                        }}
                        {...rootInputDirectionProps}
                        autoFocus
                        disabled={checklistBusyId === "root"}
                      />
                    </div>
                  ) : null}

                  <div className="mt-2">
                    <ChecklistTree
                      items={checklistItems}
                      checklistBusyId={checklistBusyId}
                      subInputById={subInputById}
                      setSubInputById={setSubInputById}
                      skipSubBlurByIdRef={skipSubBlurByIdRef}
                      hoveredChecklistId={hoveredChecklistId}
                      setHoveredChecklistId={setHoveredChecklistId}
                      onToggleChecklistItem={toggleChecklistItem}
                      onUpdateChecklistText={updateChecklistText}
                      onDeleteChecklistItem={deleteChecklistItem}
                      onCreateChecklistItem={createChecklistItem}
                      onChangeItemText={handleChecklistTextChange}
                      onReorderChecklist={handleChecklistReorder}
                      projectId={effectiveProjectId}
                      taskId={taskId}
                      onChecklistAttachmentChanged={handleAttachmentChanged}
                      formatDateTime={formatDateTime}
                    />
                  </div>
                </div>

                <TaskAttachments
                  projectId={effectiveProjectId}
                  taskId={taskId}
                  columnId={taskColumnId}
                  prefetched={!!detailTask}
                  initialAttachments={detailTask?.attachments}
                  extraAttachmentCount={checklistAttachmentCount}
                  onChanged={handleAttachmentChanged}
                  formatDateTime={formatDateTime}
                />

                <TaskActivityConversation
                  projectId={effectiveProjectId}
                  taskId={taskId}
                  activities={detailTask?.activities ?? t?.activities ?? []}
                  comments={detailTask?.comments ?? t?.comments ?? []}
                  checklistItems={
                    detailTask?.checklist_items ?? t?.checklist_items ?? []
                  }
                  onRefresh={refreshDetail}
                  projectMembers={projectMembers}
                />
              </div>

              <div className="col-12 col-lg-4">
                <div className="task-detail-modal__sidebar p-3 h-100">
                  <div className="d-flex flex-column gap-3">
                    <TaskTimer
                      taskId={taskId}
                      projectId={effectiveProjectId}
                      isOpen={isOpen}
                      timeTrackers={taskTrackers}
                      onStateChanged={handleTimerStateChanged}
                      onChanged={refreshDetail}
                    />
                    <Dropdown
                      isOpen={dueDropdownOpen}
                      toggle={toggleDueDropdown}
                    >
                      <DropdownToggle
                        tag="button"
                        type="button"
                        disabled={dueSaving}
                        className={`btn d-flex align-items-center justify-content-between px-0  w-100 task-detail-due-toggle ${
                          isDueAtOverdue ? "is-overdue" : ""
                        }`}
                        style={{ boxShadow: "none" }}
                      >
                        <span className="d-flex flex-column align-items-start">
                          <span className="d-flex align-items-center gap-2 task-detail-due-toggle__title">
                            <i className="ti ti-calendar fs-5"></i>
                            Due time
                            {isDueAtOverdue ? (
                              <span className="badge text-bg-danger">Overdue</span>
                            ) : null}
                          </span>
                          <span className="small task-detail-due-toggle__value">
                            {dueAt ? formatDateTime(dueAt) : "Set time"}
                          </span>
                        </span>
                        <i className="ti ti-chevron-down"></i>
                      </DropdownToggle>

                      <DropdownMenu
                        end
                        className="p-2"
                        style={{ minWidth: 320 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Flatpickr
                            value={dueDraftDate}
                            options={{
                              inline: true,
                              enableTime: true,
                              dateFormat: "Y-m-d H:i",
                              time_24hr: true,
                              allowInput: false,
                            }}
                            onChange={(selectedDates) => {
                              const next = selectedDates?.[0] ?? null;
                              setDueDraftDate(next);
                            }}
                          />

                          <div className="d-flex justify-content-end gap-2 mt-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              disabled={dueSaving}
                              onClick={cancelDuePicker}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              disabled={dueSaving || !dueDraftDate}
                              onClick={() => {
                                if (!dueDraftDate) return;
                                updateTaskDueAt(dueDraftDate);
                              }}
                            >
                              {dueSaving ? (
                                <span className="d-inline-flex align-items-center gap-2">
                                  <Spinner size="sm" />
                                  <span>Saving...</span>
                                </span>
                              ) : (
                                "Done"
                              )}
                            </button>
                          </div>
                        </div>
                      </DropdownMenu>
                    </Dropdown>
                    <TaskPriorityDropdown
                      value={priority}
                      saving={prioritySaving}
                      disabled={
                        !effectiveProjectId ||
                        !taskId ||
                        !resolvedColumnId ||
                        detailLoading ||
                        !detailTask
                      }
                      onChange={updateTaskPriority}
                    />
                    <TaskTagsDropdown
                      projectId={effectiveProjectId}
                      taskId={taskId}
                      selectedTags={detailTask?.tags ?? t?.tags ?? []}
                      disabled={
                        !effectiveProjectId ||
                        !taskId ||
                        detailLoading ||
                        !detailTask
                      }
                      onChanged={(tags) => {
                        if (!taskId) return;
                        dispatch(
                          updateTaskInColumn({
                            columnId: taskColumnId,
                            taskId,
                            patch: { tags: Array.isArray(tags) ? tags : [] },
                          }),
                        );
                        refreshDetail();
                      }}
                    />

                    <TaskWatchersDropdown
                      projectId={effectiveProjectId}
                      columnId={effectiveColumnId}
                      taskId={taskId}
                      disabled={!effectiveProjectId || !taskId}
                    />

                    {currentUserId === creatorId && (
                      <TaskExcludedUsersDropdown
                        projectId={effectiveProjectId}
                        columnId={effectiveColumnId}
                        taskId={taskId}
                        disabled={!effectiveProjectId || !taskId}
                      />
                    )}

                    {currentUserId === creatorId && (
                      <TaskVisibleForDropdown
                        projectId={effectiveProjectId}
                        columnId={effectiveColumnId}
                        taskId={taskId}
                        disabled={!effectiveProjectId || !taskId}
                      />
                    )}

                    <div className=" pt-2 border-top">
                      <div className="d-flex flex-column gap-3">
                        {createdAt ? (
                          <div className="d-flex gap-2">
                            <span className="text-primary h-35 w-35 d-flex-center b-r-50 bg-light-primary">
                              <i className="ti ti-plus fs-5"></i>
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div className="small fw-semibold text-muted">
                                Created
                              </div>
                              <div className="small text-muted">
                                {formatDateTime(createdAt)}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {updatedAt ? (
                          <div className="d-flex gap-2">
                            <span className="text-primary h-35 w-35 d-flex-center b-r-50 bg-light-primary">
                              <i className="ti ti-pencil fs-5"></i>
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div className="small fw-semibold text-muted">
                                Updated
                              </div>
                              <div className="small text-muted">
                                {formatDateTime(updatedAt)}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {taskId ? (
                          <div className="d-flex gap-2">
                            <span className="text-primary h-35 w-35 d-flex-center b-r-50 bg-light-primary">
                              <i className="ti ti-id fs-5"></i>
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div className="small fw-semibold text-muted">
                                Task ID
                              </div>
                              <div className="small text-muted text-truncate">
                                {taskId}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {taskId ? (
                          <div className="d-flex gap-2">
                            <span className="text-primary h-35 w-35 d-flex-center b-r-50 bg-light-primary">
                              <i className="ti ti-clock-hour-4 fs-5"></i>
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div className="small fw-semibold text-muted">
                                Tracked Time
                              </div>
                              <div className="small text-muted">
                                {trackedTotalLabel}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
      <Modal
        isOpen={approvalRatingModalOpen}
        toggle={() => setApprovalRatingModalOpen(false)}
        centered
        size="sm"
        backdrop
        className="task-approval-rating-modal-dialog byekan-font"
      >
        <ModalBody className="task-approval-rating-modal">
          <button
            type="button"
            className="task-approval-rating-modal__close"
            aria-label="Close"
            onClick={() => setApprovalRatingModalOpen(false)}
            disabled={ratingSaving}
          >
            <i className="ti ti-x"></i>
          </button>
          <img
            className="task-approval-rating-modal__avatar"
            src={approvalRatingAssigneeAvatar}
            alt={approvalRatingAssigneeName}
          />
          <div className="task-approval-rating-modal__name">
            {approvalRatingAssigneeName}
          </div>
          <TaskRatingDropdown
            value={rating}
            saving={ratingSaving}
            disabled={!effectiveProjectId || !taskId}
            onChange={handleApprovalRatingChange}
          />
          {ratingSaving ? (
            <span className="task-approval-rating-modal__saving">
              <Spinner size="sm" />
            </span>
          ) : null}
        </ModalBody>
      </Modal>
    </>
  );
};

export default TaskDetailModal;
