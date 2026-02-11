import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Form, FormGroup, Input, Label } from "reactstrap";
import api from "../../api/axios";
import { alertConfirm, alertSuccess, toastError } from "../../utils/sweetAlert";
import ActionDropdown from "../ActionDropdown";
import { useDispatch, useSelector } from "react-redux";
import { createTaskCommentThunk, getTaskCommentsThunk } from "../../store/tasks/commentSlice";
import { formatCommentTimestamp } from "../../services/dateTime";
import TaskModalPlaceHolder from "../TaskModalPlaceHolder";

const TaskDetailModal = ({ isOpen, onClose, task, projectId, onDeleted }) => {
  const t = task || {};
  const [description, setDescription] = useState(t.description || "");
  const [savedDescription, setSavedDescription] = useState(t.description || "");
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistBusyId, setChecklistBusyId] = useState(null);
  const [subInputById, setSubInputById] = useState({});
  const [rootInput, setRootInput] = useState("");
  const [showRootInput, setShowRootInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [hoveredChecklistId, setHoveredChecklistId] = useState(null);
  const dispatch = useDispatch();
  const [actionOpen, setActionOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const actionRef = useRef(null);

  const taskId = useMemo(
    () => t?.id ?? t?.task_id ?? t?.uuid ?? null,
    [t?.id, t?.task_id, t?.uuid],
  );

  const commentsState = useSelector((s) => s.comments);
  const comments =
    commentsState?.taskId === taskId && commentsState?.projectId === projectId
      ? commentsState?.items || []
      : [];
  const commentsLoading = commentsState?.status === "loading";
  const commentsSubmitting = commentsState?.status === "saving";
  const getCommentAuthor = (c) =>
    c?.user?.name ||
    c?.user?.full_name ||
    c?.user?.username ||
    c?.author?.name ||
    c?.created_by?.name ||
    c?.created_by_name ||
    c?.creator?.name ||
    "User";

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

  useEffect(() => {
    if (!isOpen || !taskId || !projectId) return;
    const load = async () => {
      try {
        setChecklistItems([]);
        setChecklistLoading(true);
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
    if (!isOpen || !taskId || !projectId) return;
    dispatch(getTaskCommentsThunk({ projectId, taskId }));
  }, [dispatch, isOpen, taskId, projectId]);

  useEffect(() => {
    const next = t.description || "";
    setDescription(next);
    setSavedDescription(next);
    setEditText(t.text || t.title || "");
    setEditDescription(t.description || "");
    setEditStatus(t.status || "active");
  }, [t.description, t.id, t.task_id]);

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
    const effectiveTaskId = item.task_id ?? item.task?.id ?? taskId;
    const effectiveProjectId = item.project_id ?? projectId;
    const trimmed = text.trim();
    if (!trimmed) return;
    const current = (item._savedText ?? item.text ?? "").trim();
    if (current === trimmed) return;
    try {
      setChecklistBusyId(item.id);
      await api.patch(
        `/projects/${effectiveProjectId}/tasks/${effectiveTaskId}/checklist-items/${item.id}`,
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
    if (!projectId || !taskId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const current = (savedDescription ?? "").trim();
    if (current === trimmed) return;
    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}`, {
        description: text,
      });
      setSavedDescription(text);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Update description failed";
      toastError(msg);
    }
  };

  const openEditModal = () => {
    setEditText(t.text || t.title || "");
    setEditDescription(t.description || "");
    setEditStatus(t.status || "active");
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!projectId || !taskId) return;
    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}`, {
        text: editText,
        description: editDescription,
        status: editStatus,
      });
      setSavedDescription(editDescription);
      setDescription(editDescription);
      setEditOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Update task failed";
      toastError(msg);
    }
  };

  const deleteTask = async () => {
    const columnId = t.column_id ?? t.column?.id ?? null;
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
    const effectiveTaskId = item.task_id ?? item.task?.id ?? taskId;
    const effectiveProjectId = item.project_id ?? projectId;
    try {
      setChecklistBusyId(item.id);
      await api.patch(
        `/projects/${effectiveProjectId}/tasks/${effectiveTaskId}/checklist-items/${item.id}`,
        { is_completed: checked ? 1 : 0 },
      );
      setChecklistItems((prev) =>
        updateItemInTree(prev, item.id, (i) => ({
          ...i,
          is_completed: checked ? 1 : 0,
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

  const submitComment = async () => {
    if (!projectId || !taskId) return;
    const text = commentText.trim();
    if (!text) return;
    try {
      await dispatch(createTaskCommentThunk({ projectId, taskId, text })).unwrap();
      setCommentText("");
    } catch (err) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Create comment failed";
      toastError(msg);
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
    <Modal isOpen={isOpen} toggle={onClose} size="lg">
      <div className="d-flex justify-content-between p-4 border border-bottom-1 rounded-top">
        <div className="d-flex align-items-end gap-2">
          <button className="btn btn-outline-primary">
            <i className="ti ti-check me-1"></i>
            Complete Task
          </button>
          <button type="button" className="btn text-muted">
            <i className="ti ti-user-plus me-1 fs-4"></i>
            Assign
          </button>
        </div>
        <div className="ms-auto d-flex gap-2">
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
                { key: "edit", label: "Edit", icon: "ti-pencil", onClick: openEditModal },
                { type: "divider" },
                { key: "delete", label: "Delete", icon: "ti-trash", destructive: true, onClick: deleteTask },
              ]}
            />
          </div>
          <button
            onClick={onClose}
            type="button"
            className="btn text-muted icon-btn b-r-100"
          >
            <i className="fa-solid fa-times fa-fw fs-5"></i>
          </button>
        </div>
      </div>

      <ModalBody className="pt-2 pb-lg-5">
        {checklistLoading ? (
          <TaskModalPlaceHolder/>
        ) : (
          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div className="pb-3">
                <input
                  type="text"
                  className="form-control f-s-16 border-0 mb-3"
                  placeholder="Task title"
                  defaultValue={t.text || t.title || ""}
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
                  className="btn px-2 b-r-20 d-flex align-items-center gap-2 text-info"
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

              <div>
                <button
                  type="button"
                  className="btn px-2 b-r-20 d-flex align-items-center gap-2 text-info"
                >
                  <i className="fa-solid fa-plus fa-fw"></i>
                  <span>Add attachment</span>
                </button>
              </div>

              <div className="pt-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fs-6">Activity</span>
                </div>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Click to add a comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-light-info small mt-2 align-self-start px-1 b-r-10">
                    @to mention someone
                  </small>
                  <button
                    type="button"
                    className="btn btn-info m-2 px-2 py-0 b-r-5"
                    onClick={submitComment}
                    disabled={commentsSubmitting}
                  >
                    <i className="ti ti-arrow-right fs-5"></i>
                  </button>
                </div>
                <div className="mt-3">
                  {commentsLoading ? (
                    <div className="text-muted small">Loading comments...</div>
                  ) : comments.length ? (
                    <div className="d-flex flex-column gap-2">
                      {comments.map((c, idx) => (
                        <div key={c.id ?? idx} className="bg-light rounded-3 p-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold small">
                              {getCommentAuthor(c)}
                            </span>
                            <span className="text-muted small">
                              {formatCommentTimestamp(c.created_at)}
                            </span>
                          </div>
                          <div className="small">
                            {c.text ?? c.body ?? c.comment ?? "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small">No comments yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="bg-info-700 rounded-3 p-3 h-100">
                <div className="d-flex flex-column gap-3 mt-3">
                  <button
                    type="button"
                    className="btn d-flex align-items-center justify-content-between px-0 text-white"
                  >
                    <span className="d-flex align-items-center gap-2">
                      <i className="ti ti-calendar fs-5"></i>
                      Due date
                    </span>
                    <i className="ti ti-chevron-down"></i>
                  </button>
                  <button
                    type="button"
                    className="btn d-flex align-items-center justify-content-between px-0 text-white"
                  >
                    <span className="d-flex align-items-center gap-2">
                      <i className="ti ti-tag fs-5"></i>
                      Tags
                    </span>
                    <i className="ti ti-chevron-down"></i>
                  </button>
                  <button
                    type="button"
                    className="btn d-flex align-items-center justify-content-between px-0 text-white"
                  >
                    <span className="d-flex align-items-center gap-2">
                      <i className="ti ti-link fs-5"></i>
                      Relations
                    </span>
                    <i className="ti ti-chevron-down"></i>
                  </button>
                  <button
                    type="button"
                    className="btn d-flex align-items-center justify-content-between px-0 text-white"
                  >
                    <span className="d-flex align-items-center gap-2">
                      <i className="ti ti-eye fs-5"></i>
                      Watching
                    </span>
                    <i className="ti ti-chevron-down"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
    <Modal isOpen={editOpen} toggle={() => setEditOpen(false)} centered>
      <ModalHeader toggle={() => setEditOpen(false)}>Edit Task</ModalHeader>
      <Form onSubmit={submitEdit}>
        <ModalBody>
          <FormGroup>
            <Label for="task-edit-text">Text</Label>
            <Input
              id="task-edit-text"
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="task-edit-description">Description</Label>
            <Input
              id="task-edit-description"
              type="textarea"
              rows="3"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="task-edit-status">Status</Label>
            <Input
              id="task-edit-status"
              type="select"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="deactive">Deactive</option>
              <option value="done">Done</option>
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" type="button" onClick={() => setEditOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Save
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
    </>
  );
};

export default TaskDetailModal;
