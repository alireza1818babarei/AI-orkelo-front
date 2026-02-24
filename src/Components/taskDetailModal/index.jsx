import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dropdown, DropdownMenu, DropdownToggle, Modal, ModalBody, Spinner } from "reactstrap";
import api from "../../api/axios";
import { alertConfirm, alertSuccess, toastError } from "../../utils/sweetAlert";
import ActionDropdown from "../ActionDropdown";
import { useDispatch, useSelector } from "react-redux";
import { updateTaskInColumn } from "../../store/projects/projectColumnsSlice";
import { getTaskDetailThunk } from "../../store/tasks/taskDetailSlice";
import { reorderTaskChecklistItemsThunk } from "../../store/tasks/checklistSlice";
import TaskModalPlaceHolder from "../TaskModalPlaceHolder";
import Flatpickr from "react-flatpickr";
import TaskActivityConversation from "./TaskActivityConversation";
import TaskAttachments from "./TaskAttachments";
import TaskTagsDropdown from "./TaskTagsDropdown";
import TaskAssigneeDropdown from "./TaskAssigneeDropdown";
import TaskWatchersDropdown from "./TaskWatchersDropdown";
import ChecklistTree from "./ChecklistTree";

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

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  projectId,
  onDeleted,
}) => {
  const propTask = task || {};

  const taskDetailState = useSelector((s) => s.taskDetail);
  const taskDetailMatches =
    taskDetailState?.projectId != null &&
    taskDetailState?.taskId != null &&
    String(taskDetailState.projectId) === String(projectId) &&
    String(taskDetailState.taskId) === String(propTask?.id ?? propTask?.task_id ?? propTask?.uuid ?? "");

  const detailLoading =
    isOpen &&
    taskDetailMatches &&
    taskDetailState?.status === "loading" &&
    !taskDetailState?.task;
  const detailTask = taskDetailMatches ? taskDetailState?.task ?? null : null;
  const t = detailTask || propTask;
  const effectiveProjectId =
    detailTask?.project?.id ??
    t?.project?.id ??
    t?.project_id ??
    t?.projectId ??
    projectId ??
    null;
  const deriveCompleted = (obj) =>
    !!obj?.is_completed ||
    String(obj?.status || "").toLowerCase() === "done" ||
    String(obj?.status || "").toLowerCase() === "completed";
  const deriveDueAt = (obj) =>
    obj?.due_at ??
    obj?.dueAt ??
    obj?.due_date ??
    obj?.dueDate ??
    obj?.date ??
    null;
  const deriveCompletedAt = (obj) =>
    obj?.completed_at ??
    obj?.completedAt ??
    obj?.done_at ??
    obj?.doneAt ??
    obj?.finished_at ??
    obj?.finishedAt ??
    null;
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
  const [description, setDescription] = useState(t.description || "");
  const [savedDescription, setSavedDescription] = useState(t.description || "");
  const [taskText, setTaskText] = useState(t.text || t.title || "");
  const [savedTaskText, setSavedTaskText] = useState(t.text || t.title || "");
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

  const taskId = useMemo(
    () => t?.id ?? t?.task_id ?? t?.uuid ?? null,
    [t?.id, t?.task_id, t?.uuid],
  );
  const taskColumnId = t?.column_id ?? t?.columnId ?? t?.column?.id ?? null;
  const projectColumns = useSelector((s) => s.projectColumns?.items || []);

  const resolvedColumnId = useMemo(() => {
    if (taskColumnId != null) return taskColumnId;
    if (!taskId) return null;

    const matchesTask = (x) =>
      String(x?.id ?? x?.task_id ?? x?.uuid ?? "") === String(taskId);

    for (const col of projectColumns || []) {
      const tasks = Array.isArray(col?.tasks) ? col.tasks : [];
      if (tasks.some(matchesTask)) return col?.id ?? col?.column_id ?? null;
    }
    return null;
  }, [taskColumnId, taskId, projectColumns]);

  const getTaskUpdateUrl = () => {
    if (!effectiveProjectId || !taskId || !resolvedColumnId) return null;
    return `/projects/${effectiveProjectId}/columns/${resolvedColumnId}/tasks/${taskId}`;
  };
  const updateTask = async (payload) => {
    const url = getTaskUpdateUrl();
    if (!url) throw new Error("Project/column/task id missing");
    return api.patch(url, payload);
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
        return { ...item, children: updateItemInTree(item.children, id, updater) };
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
        return { ...item, children: addChildToTree(item.children, parentId, child) };
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
    const nextText = t.text || t.title || "";
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
    t.title,
    t.status,
    t.is_completed,
    t.completed_at,
    t.created_at,
    t.updated_at,
    t.due_at,
    t.due_date,
    t.date,
    t.id,
    t.task_id,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const resize = () => {
      const nodes = document.querySelectorAll(".checklist-textarea, .autogrow-textarea");
      nodes.forEach((el) => {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      });
    };
    const id = requestAnimationFrame(resize);
    return () => cancelAnimationFrame(id);
  }, [isOpen, checklistItems]);

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
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [isOpen]);

  const createChecklistItem = async ({ text, parentId = null }) => {
    if (!projectId || !taskId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      setChecklistBusyId(parentId || "root");
      const payload = parentId ? { text: trimmed, parent_item_id: parentId } : { text: trimmed };
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
      setChecklistItems((prev) =>
        parentId ? addChildToTree(prev, parentId, nextItem) : [...prev, nextItem],
      );
      refreshDetail();
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
          patch: { text: trimmed, title: trimmed },
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

  const formatDueAtForApi = (value) => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return null;

    const pad2 = (n) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
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
    setDueDraftDate(nextDraft && !Number.isNaN(nextDraft.getTime()) ? nextDraft : null);
  };

  const updateTaskDueAt = async (isoValue) => {
    if (!projectId || !taskId) return;
    if ((savedDueAt ?? "") === (isoValue ?? "")) return;
    try {
      setDueSaving(true);
      const dueAtForApi = formatDueAtForApi(isoValue) ?? isoValue;
      try {
        await api.patch(`/projects/${projectId}/tasks/${taskId}/due-time`, {
          due_at: dueAtForApi,
          dueAt: dueAtForApi,
        });
      } catch {
        await api.post(`/projects/${projectId}/tasks/${taskId}/due-time`, {
          due_at: dueAtForApi,
          dueAt: dueAtForApi,
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

  const deleteTask = async () => {
    const columnId = resolvedColumnId ?? t.column_id ?? t.columnId ?? t.column?.id ?? null;
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
      alertSuccess();
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
      setChecklistItems((prev) =>
        updateItemInTree(prev, item.id, (i) => ({
          ...i,
          is_completed: checked ? 1 : 0,
        })),
      );
      refreshDetail();
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
      setChecklistItems((prev) => removeFromTree(prev));
      refreshDetail();
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
          res = await api.patch(`/projects/${projectId}/tasks/${taskId}/complete`);
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
      const completedAt = deriveCompletedAt(updated) ?? new Date().toISOString();
      setTaskCompletedAt(completedAt);
      alertSuccess("Task completed");
      refreshDetail();
    } catch (err) {
      toastError(err?.message || "Complete task failed");
    } finally {
      setTaskCompleting(false);
    }
  };

  const handleChecklistReorder = async (parentId, sourceIndex, destinationIndex) => {
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

  return (
    <>
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      size="lg"
      className="task-detail-modal-dialog"
    >
      <div className="d-flex justify-content-between p-4 border border-bottom-1 rounded-top">
        <div className="d-flex align-items-end gap-2">
          {taskCompleted ? (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success px-3 py-2">Completed</span>
              {taskCompletedAt ? (
                <span className="text-muted small">{formatDateTime(taskCompletedAt)}</span>
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
              taskId={taskId}
              selectedAssignees={detailTask?.assignees ?? t?.assignees ?? []}
              disabled={!effectiveProjectId || !taskId}
              variant="header"
            />
          ) : null}
        </div>
        <div className="ms-auto d-flex gap-2">
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
                { key: "delete", label: "Delete", icon: "ti-trash", destructive: true, onClick: deleteTask },
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

      <ModalBody style={{ paddingRight: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 20 }}>
        {checklistLoading ? (
          <TaskModalPlaceHolder/>
        ) : (
          <div className="row g-4">
            <div className="col-12 col-lg-8 pt-2 pb-5" style={{paddingRight: 0}}>
              <div className="pb-3">
                <input
                  ref={taskTextInputRef}
                  type="text"
                  className="form-control f-s-16 border-0 mb-3"
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
                    if (e.key === "Enter" || e.code === "NumpadEnter" || e.keyCode === 13) {
                      e.preventDefault();
                      updateTaskText(e.currentTarget.value);
                      skipNextTaskTextBlurSaveRef.current = true;
                      e.currentTarget.blur();
                    }
                  }}
                />
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
                  style={{ resize: "none", overflow: "hidden", height: "auto" }}
                />
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
                      style={{ resize: "none", overflow: "hidden", height: "auto" }}
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
                onRefresh={refreshDetail}
              />
            </div>

            <div className="col-12 col-lg-4">
              <div className="bg-light-dark text-black p-3 h-100">
                <div className="d-flex flex-column gap-3 mt-3">
                  <Dropdown isOpen={dueDropdownOpen} toggle={toggleDueDropdown}>
                    <DropdownToggle
                      tag="button"
                      type="button"
                      disabled={dueSaving}
                      className="btn d-flex align-items-center justify-content-between px-0 border-bottom w-100"
                      style={{ boxShadow: "none" }}
                    >
                      <span className="d-flex flex-column align-items-start">
                        <span className="d-flex align-items-center gap-2">
                          <i className="ti ti-calendar fs-5"></i>
                          Due time
                        </span>
                        <span className="small">
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
                              updateTaskDueAt(dueDraftDate.toISOString());
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
                    disabled={!effectiveProjectId || !taskId || detailLoading || !detailTask}
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
                    taskId={taskId}
                    disabled={!effectiveProjectId || !taskId}
                  />

                  <div className=" pt-2 border-top">
                    <div className="d-flex flex-column gap-3">
                      {createdAt ? (
                        <div className="d-flex gap-2">
                          <span className="text-primary h-35 w-35 d-flex-center b-r-50 bg-light-primary">
                            <i className="ti ti-plus fs-5"></i>
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div className="small fw-semibold text-muted">Created</div>
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
                            <div className="small fw-semibold text-muted">Updated</div>
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
                            <div className="small fw-semibold text-muted">Task ID</div>
                            <div className="small text-muted text-truncate">{taskId}</div>
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
