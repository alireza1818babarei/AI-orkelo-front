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
import { getTaskDetailThunk } from "../../store/tasks/taskDetailSlice";
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
import ChecklistTree from "./ChecklistTree";
import TaskTimer from "./TaskTimer";
import { restoreArchivedTasks } from "../../store/projects/projectArchivedTasksSlice";
import { getTextDirectionProps } from "../../utils/textDirection";

const sortChecklistByPosition = (items = []) =>
  [...(items || [])].sort((a, b) => {
    const aPos = Number(a?.position ?? 0);
    const bPos = Number(b?.position ?? 0);
    if (aPos !== bPos) return aPos - bPos;
    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
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
      const childrenSummary = countChecklistProgress(item?.children || []);
      return {
        total: summary.total + 1 + childrenSummary.total,
        completed:
          summary.completed +
          (item?.is_completed ? 1 : 0) +
          childrenSummary.completed,
      };
    },
    { total: 0, completed: 0 },
  );

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
  const deriveCompleted = (obj) =>
    !!obj?.is_completed ||
    String(obj?.status || "").toLowerCase() === "done" ||
    String(obj?.status || "").toLowerCase() === "completed";
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

  const [description, setDescription] = useState(t.description || "");
  const [savedDescription, setSavedDescription] = useState(t.description || "");
  const [taskText, setTaskText] = useState(t.text || "");
  const [savedTaskText, setSavedTaskText] = useState(t.text || "");
  const taskTextInputRef = useRef(null);
  const skipNextTaskTextBlurSaveRef = useRef(false);
  const [taskCompleting, setTaskCompleting] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(deriveCompleted(t));
  const [taskCompletedAt, setTaskCompletedAt] = useState(deriveCompletedAt(t));
  const [dueAt, setDueAt] = useState(deriveDueAt(t));
  const [savedDueAt, setSavedDueAt] = useState(deriveDueAt(t));
  const [dueDraftDate, setDueDraftDate] = useState(
    deriveDueAt(t) ? new Date(deriveDueAt(t)) : null,
  );
  const [dueDropdownOpen, setDueDropdownOpen] = useState(false);
  const [dueSaving, setDueSaving] = useState(false);
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
  const dispatch = useDispatch();
  const [actionOpen, setActionOpen] = useState(false);
  const actionRef = useRef(null);
  const refreshDetail = () => {
    if (!effectiveProjectId || !taskId) return;
    dispatch(getTaskDetailThunk({ projectId: effectiveProjectId, taskId }));
  };

  const taskId = useMemo(() => t?.id ?? null, [t?.id]);
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

  // comments + activity are rendered in TaskActivityConversation

  const isSaveCombo = (e) => e.key === "Enter" && !e.shiftKey;

  const normalizeTree = (items) =>
    sortChecklistByPosition(items).map((item) => ({
      ...item,
      text: item.text ?? "",
      _savedText: item.text ?? "",
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
    setTaskCompleted(deriveCompleted(t));
    setTaskCompletedAt(deriveCompletedAt(t));
    const nextDueAt = deriveDueAt(t);
    setDueAt(nextDueAt);
    setSavedDueAt(nextDueAt);
    setDueDraftDate(nextDueAt ? new Date(nextDueAt) : null);
    setDueDropdownOpen(false);
    setDueSaving(false);
    setCreatedAt(t.created_at ?? null);
    setUpdatedAt(t.updated_at ?? null);
  }, [
    t.description,
    t.text,
    t.status,
    t.is_completed,
    t.completed_at,
    t.created_at,
    t.updated_at,
    t.due_at,
    t.id,
  ]);

  useEffect(() => {
    setTrackedTotalOverrideSeconds(null);
  }, [taskId, isOpen]);

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
        ? addChildToTree(checklistItems, parentId, nextItem)
        : [...checklistItems, nextItem];
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
      const nextItems = updateItemInTree(checklistItems, item.id, (i) => ({
        ...i,
        is_completed: checked ? 1 : 0,
      }));
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

  const handleCompleteTask = async () => {
    if (taskCompleted || taskCompleting) return;
    if (!projectId || !taskId) return;
    try {
      setTaskCompleting(true);
      let res;
      try {
        res = resolvedColumnId ? await updateTask({ status: "done" }) : null;
      } catch (err) {
        try {
          res = resolvedColumnId ? await updateTask({ is_completed: 1 }) : null;
        } catch (err2) {
          res = await api.patch(
            `/projects/${projectId}/tasks/${taskId}/complete`,
          );
        }
      }
      const updated = res?.data?.data ?? res?.data ?? { status: "done" };
      dispatch(
        updateTaskInColumn({
          columnId: resolvedColumnId,
          taskId,
          patch: updated,
        }),
      );
      setTaskCompleted(deriveCompleted(updated) || true);
      const completedAt =
        deriveCompletedAt(updated) ?? new Date().toISOString();
      setTaskCompletedAt(completedAt);
      toastSuccess("Task completed");
      refreshDetail();
    } catch (err) {
      toastError(err?.message || "Complete task failed");
    } finally {
      setTaskCompleting(false);
    }
  };

  const handleRestoreTask = async () => {
    if (!taskCompleted || taskCompleting) return;
    if (!effectiveProjectId || !taskId) return;

    try {
      setTaskCompleting(true);
      let res;
      try {
        res = resolvedColumnId ? await updateTask({ status: "open" }) : null;
      } catch (err) {
        res = await api.patch(`/projects/${effectiveProjectId}/tasks/${taskId}/complete`, {
          is_completed: false,
        });
      }

      const updated = res?.data?.data ?? res?.data ?? {
        status: "open",
        completed_at: null,
      };

      dispatch(
        updateTaskInColumn({
          columnId: resolvedColumnId,
          taskId,
          patch: updated,
        }),
      );
      setTaskCompleted(false);
      setTaskCompletedAt(null);
      toastSuccess("Task restored");
      refreshDetail();
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
    const nextItems = reorderChecklistSiblings(
      previousItems,
      parentId,
      sourceIndex,
      destinationIndex,
    );
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={handleClose}
        size="lg"
        className="task-detail-modal-dialog byekan-font"
      >
        <div className="d-flex justify-content-between p-4 border border-bottom-1 rounded-top task-detail-modal__header">
          <div className="d-flex align-items-end gap-2">
            {taskCompleted ? (
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success px-3 py-2">Completed</span>
                {taskCompletedAt ? (
                  <span className="text-muted small">
                    {formatDateTime(taskCompletedAt)}
                  </span>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleCompleteTask}
                disabled={taskCompleting}
              >
                <i className="ti ti-check me-1"></i>
                Complete Task
              </button>
            )}
            {!taskCompleted ? (
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
                    ...(taskCompleted
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
                </div>

                <div className="py-3">
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
                    />
                  </div>
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
                </div>

                <TaskAttachments
                  projectId={effectiveProjectId}
                  taskId={taskId}
                  columnId={taskColumnId}
                  prefetched={!!detailTask}
                  initialAttachments={detailTask?.attachments}
                  onChanged={refreshDetail}
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
    </>
  );
};

export default TaskDetailModal;
