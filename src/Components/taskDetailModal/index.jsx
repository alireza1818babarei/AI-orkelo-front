import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalBody, Spinner } from "reactstrap";
import api from "../../api/axios";
import { alertConfirm, alertSuccess, toastError } from "../../utils/sweetAlert";
import ActionDropdown from "../ActionDropdown";
import { useDispatch, useSelector } from "react-redux";
import { updateTaskInColumn } from "../../store/projects/projectColumnsSlice";
import TaskModalPlaceHolder from "../TaskModalPlaceHolder";
import Flatpickr from "react-flatpickr";
import TaskActivityConversation from "./TaskActivityConversation";
import TaskAttachments from "./TaskAttachments";
import TaskTagsDropdown from "./TaskTagsDropdown";
import TaskAssigneeDropdown from "./TaskAssigneeDropdown";
import TaskWatchersDropdown from "./TaskWatchersDropdown";

const TaskDetailModal = ({ isOpen, onClose, task, projectId, onDeleted }) => {
  const t = task || {};
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
  const duePickerInstanceRef = useRef(null);
  const [createdAt, setCreatedAt] = useState(t.created_at ?? null);
  const [updatedAt, setUpdatedAt] = useState(t.updated_at ?? null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistBusyId, setChecklistBusyId] = useState(null);
  const [subInputById, setSubInputById] = useState({});
  const [rootInput, setRootInput] = useState("");
  const [showRootInput, setShowRootInput] = useState(false);
  const [hoveredChecklistId, setHoveredChecklistId] = useState(null);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const dispatch = useDispatch();
  const [actionOpen, setActionOpen] = useState(false);
  const actionRef = useRef(null);

  const bumpActivity = () => setActivityRefreshKey((k) => k + 1);

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
    if (!projectId || !taskId || !resolvedColumnId) return null;
    return `/projects/${projectId}/columns/${resolvedColumnId}/tasks/${taskId}`;
  };
  const updateTask = async (payload) => {
    const url = getTaskUpdateUrl();
    if (!url) throw new Error("Project/column/task id missing");
    return api.patch(url, payload);
  };

  // comments + activity are rendered in TaskActivityConversation

  const isSaveCombo = (e) => e.key === "Enter" && !e.shiftKey;

  const normalizeTree = (items) =>
    (items || []).map((item) => ({
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
        return { ...item, children: [...(item.children || []), child] };
      }
      if (item.children?.length) {
        return { ...item, children: addChildToTree(item.children, parentId, child) };
      }
      return item;
    });

  useLayoutEffect(() => {
    if (!isOpen || !taskId || !projectId) return;
    setChecklistItems([]);
    setChecklistLoading(true);
  }, [isOpen, taskId, projectId]);

  useEffect(() => {
    if (!isOpen || !taskId || !projectId) return;
    const load = async () => {
      try {
        const res = await api.get(
          `/projects/${projectId}/tasks/${taskId}/checklist-items`,
        );
        const items = res.data?.data ?? res.data ?? [];
        setChecklistItems(normalizeTree(items));
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Load checklist failed";
        toastError(msg);
      } finally {
        setChecklistLoading(false);
      }
    };
    load();
  }, [isOpen, taskId, projectId]);

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

  useEffect(() => {
    if (!isOpen || !projectId || !taskId) return;
    if (createdAt && updatedAt) return;

    const loadMeta = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/tasks/${taskId}`);
        const payload = res?.data?.data ?? res?.data ?? null;
        const fetched = payload?.task ?? payload?.data?.task ?? payload ?? null;
        if (!fetched || typeof fetched !== "object") return;

        const nextCreated = fetched?.created_at ?? null;
        const nextUpdated = fetched?.updated_at ?? null;
        if (nextCreated) setCreatedAt(nextCreated);
        if (nextUpdated) setUpdatedAt(nextUpdated);

        const patch = {};
        if (nextCreated) patch.created_at = nextCreated;
        if (nextUpdated) patch.updated_at = nextUpdated;
        if (Object.keys(patch).length) {
          dispatch(
            updateTaskInColumn({
              columnId: taskColumnId,
              taskId,
              patch,
            }),
          );
        }
      } catch {
        // ignore: meta is optional; board will eventually refresh from other calls
      }
    };

    loadMeta();
  }, [isOpen, projectId, taskId, createdAt, updatedAt, dispatch, taskColumnId]);

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
      bumpActivity();
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
      bumpActivity();
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
      bumpActivity();
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

  const updateTaskDueAt = async (isoValue) => {
    if (!projectId || !taskId) return;
    if ((savedDueAt ?? "") === (isoValue ?? "")) return;
    try {
      try {
        await api.patch(`/projects/${projectId}/tasks/${taskId}/due-time`, {
          due_at: isoValue,
          dueAt: isoValue,
        });
      } catch {
        await api.post(`/projects/${projectId}/tasks/${taskId}/due-time`, {
          due_at: isoValue,
          dueAt: isoValue,
        });
      }
      dispatch(
        updateTaskInColumn({
          columnId: taskColumnId,
          taskId,
          patch: { due_at: isoValue },
        }),
      );
      bumpActivity();
      setSavedDueAt(isoValue);
      setDueAt(isoValue);
    } catch (err) {
      toastError(err?.message || "Update due date failed");
      setDueAt(savedDueAt);
    }
  };

  const handleClose = () => {
    const active = document.activeElement;
    if (active && typeof active.blur === "function") {
      active.blur();
    }
    onClose?.();
  };

  const openDuePicker = () => {
    const inst = duePickerInstanceRef.current;
    if (inst && typeof inst.open === "function") {
      inst.open();
    }
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
      bumpActivity();
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
      bumpActivity();
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
      bumpActivity();
    } catch (err) {
      toastError(err?.message || "Complete task failed");
    } finally {
      setTaskCompleting(false);
    }
  };

  const renderChecklist = (items, depth = 0, parentCompleted = false) => {
    return (items || []).map((item, index) => {
      const isCompleted = parentCompleted || !!item.is_completed;
      return (
      <div
        key={item.id}
        className={`mb-2 ${
          depth === 0 ? "border rounded-3 p-2" : ""
        } ${
          item.is_completed && depth === 0 ? "border border-success" : ""
        }`}
      >
        <div
          className={`d-flex align-items-start gap-2 ps-3 ${depth ? "ps-6" : ""}`}
          style={depth ? { marginLeft: 8 } : undefined}
          onMouseEnter={() => setHoveredChecklistId(item.id)}
          onMouseLeave={() => setHoveredChecklistId(null)}
        >
          {depth > 0 ? (
            <span className="d-inline-flex align-items-center justify-content-center mt-1 text-muted small">
              {index + 1}.
            </span>
          ) : null}
          {depth === 0 ? (
            <input
              type="checkbox"
              className="form-check-input mt-1"
              checked={!!item.is_completed}
              onChange={(e) => toggleChecklistItem(item, e.target.checked)}
              disabled={checklistBusyId === item.id}
            />
          ) : null}
          <div className="flex-grow-1">
            <textarea
              className={`form-control border-0 shadow-none px-0 py-0 small checklist-textarea ${
                isCompleted ? "text-decoration-line-through text-muted" : ""
              }`}
              rows="1"
              value={item.text ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setChecklistItems((prev) =>
                  updateItemInTree(prev, item.id, (i) => ({ ...i, text: value })),
                );
              }}
              onBlur={(e) => updateChecklistText(item, e.target.value)}
              onKeyDown={(e) => {
                if (isSaveCombo(e)) {
                  e.preventDefault();
                  updateChecklistText(item, e.currentTarget.value);
                  e.currentTarget.blur();
                }
              }}
              onInput={(e) => {
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              style={{ resize: "none", overflow: "hidden", height: "auto" }}
              disabled={checklistBusyId === item.id}
            />
          </div>
          <button
            type="button"
            className="btn icon-btn b-r-100 text-muted"
            onClick={() => deleteChecklistItem(item)}
            disabled={checklistBusyId === item.id}
            style={{
              opacity: hoveredChecklistId === item.id ? 1 : 0,
              transition: "opacity 120ms ease",
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        {item.children?.length ? (
          <div className="mt-2">
            {renderChecklist(item.children, depth + 1, isCompleted)}
          </div>
        ) : null}
        {depth === 0 ? (
          <div className="mt-2 ps-3">
            <button
              type="button"
              className="btn px-0 text-info small f-s-12"
              onClick={() =>
                setSubInputById((prev) => ({
                  ...prev,
                  [item.id]: prev[item.id] ?? "",
                }))
              }
            >
              Add sub item
            </button>
            {subInputById[item.id] !== undefined ? (
              <div className="mt-1">
                <textarea
                  className="form-control autogrow-textarea"
                  rows="1"
                  placeholder="Write a sub item..."
                  value={subInputById[item.id] || ""}
                  onChange={(e) =>
                    setSubInputById((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  onBlur={async () => {
                    const text = (subInputById[item.id] || "").trim();
                    if (text) await createChecklistItem({ text, parentId: item.id });
                    setSubInputById((prev) => {
                      const next = { ...prev };
                      delete next[item.id];
                      return next;
                    });
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const text = (subInputById[item.id] || "").trim();
                      if (text) await createChecklistItem({ text, parentId: item.id });
                      setSubInputById((prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      });
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setSubInputById((prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      });
                    }
                  }}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                  style={{ resize: "none", overflow: "hidden", height: "auto" }}
                  autoFocus
                  disabled={checklistBusyId === item.id}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
    });
  };

  return (
    <>
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
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
              projectId={projectId}
              taskId={taskId}
              disabled={!projectId || !taskId}
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

      <ModalBody style={{ paddingRight: 0, paddingTop: 0, paddingBottom: 0 }}>
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
                <div className="mt-2">{renderChecklist(checklistItems)}</div>
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
                        const text = rootInput.trim();
                        if (text) await createChecklistItem({ text });
                        setRootInput("");
                        setShowRootInput(false);
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          const text = rootInput.trim();
                          if (text) await createChecklistItem({ text });
                          setRootInput("");
                          setShowRootInput(false);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
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
                projectId={projectId}
                taskId={taskId}
                columnId={taskColumnId}
                onChanged={bumpActivity}
                formatDateTime={formatDateTime}
              />

              <TaskActivityConversation
                projectId={projectId}
                taskId={taskId}
                activityRefreshKey={activityRefreshKey}
              />
            </div>

            <div className="col-12 col-lg-4">
              <div className="bg-light-dark text-black p-3 h-100">
                <div className="d-flex flex-column gap-3 mt-3">
                  <button
                    type="button"
                    className="btn d-flex align-items-center justify-content-between px-0 border-bottom"
                    onClick={openDuePicker}
                  >
                    <span className="d-flex flex-column align-items-start">
                      <span className="d-flex align-items-center gap-2">
                        <i className="ti ti-calendar fs-5"></i>
                        Due date
                      </span>
                      <span className="small">
                        {dueAt ? formatDateTime(dueAt) : "Set date"}
                      </span>
                    </span>
                    <i className="ti ti-chevron-down"></i>
                  </button>
                  <Flatpickr
                    value={dueAt ? new Date(dueAt) : null}
                    options={{
                      enableTime: true,
                      dateFormat: "Y-m-d H:i",
                      time_24hr: true,
                      allowInput: false,
                    }}
                    onReady={(_, __, instance) => {
                      duePickerInstanceRef.current = instance;
                    }}
                    onChange={(selectedDates) => {
                      const next = selectedDates?.[0] ? selectedDates[0].toISOString() : null;
                      setDueAt(next);
                      updateTaskDueAt(next);
                    }}
                    render={({ defaultValue, value, ...props }, ref) => (
                      <input
                        ref={ref}
                        defaultValue={defaultValue}
                        value={value ?? ""}
                        readOnly
                        {...props}
                        style={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          opacity: 0,
                          pointerEvents: "none",
                        }}
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                    )}
                  />
                  <TaskTagsDropdown
                    projectId={projectId}
                    taskId={taskId}
                    disabled={!projectId || !taskId}
                    onChanged={(tags) => {
                      if (!taskId) return;
                      dispatch(
                        updateTaskInColumn({
                          columnId: taskColumnId,
                          taskId,
                          patch: { tags: Array.isArray(tags) ? tags : [] },
                        }),
                      );
                      bumpActivity();
                    }}
                  />
                  <TaskWatchersDropdown
                    projectId={projectId}
                    taskId={taskId}
                    disabled={!projectId || !taskId}
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
