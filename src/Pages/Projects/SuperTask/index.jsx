import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "reactstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createSubTask,
  deleteSubTask,
  deleteSuperTask,
  getEntityTimeline,
  getProjectMembers,
  getProjectTags,
  getSuperTask,
  getSuperTaskSubTasks,
  getSuperTaskSummary,
  toggleSuperTaskArchive,
  updateSuperTask,
} from "../../../api/superTask";
import ActionDropdown from "../../../Components/ActionDropdown";
import TaskMoveModal from "../../../Components/ActionDropdown/TaskMoveModal";
import TaskActivityConversation from "../../../Components/taskDetailModal/TaskActivityConversation";
import TaskAttachments from "../../../Components/taskDetailModal/TaskAttachments";
import {
  alertConfirm,
  toastError,
  toastSuccess,
} from "../../../utils/sweetAlert";
import SuperTaskInlineTextField from "./SuperTaskInlineTextField";
import SuperTaskItemModal from "./SuperTaskItemModal";
import SuperTaskReviewControls from "./SuperTaskReviewControls";
import SuperTaskSidebar from "./SuperTaskSidebar";
import SuperTaskSubTaskList from "./SuperTaskSubTaskList";
import SuperTaskSummaryGrid from "./SuperTaskSummaryGrid";
import SuperTaskUserDropdown from "./SuperTaskUserDropdown";
import {
  formatDateTime,
  getMemberId,
  normalizeProjectMember,
  REVIEW_STATUS,
} from "./superTask.utils";
import "./superTask.css";

const EMPTY_SUMMARY = {
  sub_tasks: { total: 0, in_progress: 0, pending_review: 0, approved: 0, rejected: 0 },
  work_items: { total: 0, in_progress: 0, pending_review: 0, approved: 0, rejected: 0 },
};
const EMPTY_TIMELINE = { activities: [], comments: [] };
const EMPTY_FILTERS = { assigneeId: "", tagId: "", status: "" };

export default function SuperTaskPage() {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const attachmentSectionRef = useRef(null);
  const actionMenuRef = useRef(null);
  const childRequestRef = useRef(0);
  const routeSearchRef = useRef(location.search);
  const invalidChildIntentRef = useRef("");
  const [task, setTask] = useState(null);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [subTasks, setSubTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [tags, setTags] = useState([]);
  const [timeline, setTimeline] = useState(EMPTY_TIMELINE);
  const [loading, setLoading] = useState(true);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showNewSubTask, setShowNewSubTask] = useState(false);
  const [newSubTask, setNewSubTask] = useState({ title: "", description: "" });
  const [creatingSubTask, setCreatingSubTask] = useState(false);
  const [savingField, setSavingField] = useState("");
  const [selectedSubTaskId, setSelectedSubTaskId] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [lifecycleAction, setLifecycleAction] = useState("");
  const [deletingSubTaskId, setDeletingSubTaskId] = useState(null);

  const rootPath = `/projects/${projectId}/tasks/${taskId}`;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const childIntent = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const subTaskId = String(params.get("subTask") ?? "").trim();
    const workItemId = String(params.get("workItem") ?? "").trim();

    return {
      subTaskId: subTaskId || null,
      workItemId: workItemId || null,
    };
  }, [location.search]);

  useEffect(() => {
    routeSearchRef.current = location.search;
  }, [location.search]);

  const updateChildIntent = useCallback(
    ({ subTaskId: nextSubTaskId, workItemId: nextWorkItemId }) => {
      const params = new URLSearchParams(location.search);

      if (nextSubTaskId == null || String(nextSubTaskId).trim() === "") {
        params.delete("subTask");
      } else {
        params.set("subTask", String(nextSubTaskId));
      }

      if (nextWorkItemId == null || String(nextWorkItemId).trim() === "") {
        params.delete("workItem");
      } else {
        params.set("workItem", String(nextWorkItemId));
      }

      const search = params.toString();
      navigate(
        {
          pathname: location.pathname,
          search: search ? `?${search}` : "",
        },
        { replace: true },
      );
    },
    [location.pathname, location.search, navigate],
  );

  const loadTimeline = useCallback(async () => {
    try {
      setTimelineLoading(true);
      setTimeline(await getEntityTimeline(rootPath));
    } catch (error) {
      toastError(error?.message || "Load activity failed");
      setTimeline(EMPTY_TIMELINE);
    } finally {
      setTimelineLoading(false);
    }
  }, [rootPath]);

  const loadChildren = useCallback(async () => {
    const requestId = ++childRequestRef.current;
    try {
      setChildrenLoading(true);
      const items = await getSuperTaskSubTasks(projectId, taskId, {
        search: debouncedSearch,
        ...filters,
      });
      if (requestId === childRequestRef.current) setSubTasks(items);
    } catch (error) {
      if (requestId === childRequestRef.current) {
        toastError(error?.message || "Load Sub-tasks failed");
        setSubTasks([]);
      }
    } finally {
      if (requestId === childRequestRef.current) setChildrenLoading(false);
    }
  }, [debouncedSearch, filters, projectId, taskId]);

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");
      const [taskData, summaryData, memberData, tagData, timelineData] = await Promise.all([
        getSuperTask(projectId, taskId),
        getSuperTaskSummary(projectId, taskId),
        getProjectMembers(projectId),
        getProjectTags(projectId),
        getEntityTimeline(rootPath),
      ]);
      if (String(taskData?.task_type || "").toLowerCase() !== "super_task") {
        navigate(`/projects/${projectId}/task/${taskId}${routeSearchRef.current || ""}`, { replace: true });
        return;
      }
      setTask(taskData);
      setSummary(summaryData || EMPTY_SUMMARY);
      setSubTasks(Array.isArray(taskData?.sub_tasks) ? taskData.sub_tasks : []);
      setMembers(memberData);
      setTags(tagData);
      setTimeline(timelineData);
    } catch (error) {
      setPageError(error?.message || "Super Task could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [navigate, projectId, rootPath, taskId]);

  const refreshTask = useCallback(async () => {
    try {
      const [taskData, summaryData] = await Promise.all([
        getSuperTask(projectId, taskId),
        getSuperTaskSummary(projectId, taskId),
      ]);
      setTask(taskData);
      setSummary(summaryData || EMPTY_SUMMARY);
      await Promise.all([loadChildren(), loadTimeline()]);
    } catch (error) {
      toastError(error?.message || "Refresh Super Task failed");
    }
  }, [loadChildren, loadTimeline, projectId, taskId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!task) return;
    loadChildren();
  }, [debouncedSearch, filters, loadChildren, task?.id]);

  useEffect(() => {
    if (!task) return;

    const intentKey = `${childIntent.subTaskId || ""}:${childIntent.workItemId || ""}`;

    if (!childIntent.subTaskId) {
      if (childIntent.workItemId && invalidChildIntentRef.current !== intentKey) {
        invalidChildIntentRef.current = intentKey;
        toastError("A Sub-task ID is required to open this Work Item.");
        updateChildIntent({ subTaskId: null, workItemId: null });
      }
      return;
    }

    const rootSubTasks = Array.isArray(task?.sub_tasks) ? task.sub_tasks : [];
    const subTaskExists = rootSubTasks.some(
      (item) => String(item?.id) === String(childIntent.subTaskId),
    );

    if (!subTaskExists) {
      if (invalidChildIntentRef.current !== intentKey) {
        invalidChildIntentRef.current = intentKey;
        toastError("The requested Sub-task could not be found.");
      }
      setSelectedSubTaskId(null);
      updateChildIntent({ subTaskId: null, workItemId: null });
      return;
    }

    invalidChildIntentRef.current = "";
    setSelectedSubTaskId(childIntent.subTaskId);
  }, [childIntent, task, updateChildIntent]);

  const handleOpenSubTask = useCallback((subTaskId) => {
    setSelectedSubTaskId(subTaskId);
    updateChildIntent({ subTaskId, workItemId: null });
  }, [updateChildIntent]);

  const handleCloseChild = useCallback(() => {
    setSelectedSubTaskId(null);
    updateChildIntent({ subTaskId: null, workItemId: null });
  }, [updateChildIntent]);

  const handleWorkItemIntent = useCallback((workItemId) => {
    updateChildIntent({
      subTaskId: selectedSubTaskId,
      workItemId,
    });
  }, [selectedSubTaskId, updateChildIntent]);

  const handleCopyLink = useCallback(async () => {
    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.clipboard?.writeText
      ) {
        throw new Error("Clipboard access is unavailable.");
      }
      await navigator.clipboard.writeText(`${window.location.origin}${rootPath}`);
      toastSuccess("Link Copied");
    } catch (error) {
      toastError(error?.message || "Copy link failed");
    }
  }, [rootPath]);

  const handleArchive = useCallback(async () => {
    const columnId = task?.column?.id ?? task?.column_id ?? null;
    if (!columnId || lifecycleAction) return;

    try {
      setLifecycleAction("archive");
      await toggleSuperTaskArchive(projectId, columnId, taskId);
      setSelectedSubTaskId(null);
      toastSuccess("Task archived");
      navigate(`/projects/${projectId}`, { replace: true });
    } catch (error) {
      toastError(error?.message || "Archive task failed");
    } finally {
      setLifecycleAction("");
    }
  }, [lifecycleAction, navigate, projectId, task, taskId]);

  const handleDeleteRoot = useCallback(async () => {
    const columnId = task?.column?.id ?? task?.column_id ?? null;
    if (
      !columnId ||
      lifecycleAction ||
      task?.capabilities?.can_delete !== true
    ) {
      return;
    }

    const { isConfirmed } = await alertConfirm({
      title: "Delete this Super Task?",
      text: "Its Sub-tasks and Work Items will also be removed from active views.",
      confirmText: "Delete",
      cancelText: "No",
    });
    if (!isConfirmed) return;

    try {
      setLifecycleAction("delete");
      await deleteSuperTask(projectId, columnId, taskId);
      setSelectedSubTaskId(null);
      toastSuccess("Super Task deleted");
      navigate(`/projects/${projectId}`, { replace: true });
    } catch (error) {
      toastError(error?.message || "Delete Super Task failed");
    } finally {
      setLifecycleAction("");
    }
  }, [lifecycleAction, navigate, projectId, task, taskId]);

  const handleDeleteSubTask = useCallback(async (item) => {
    const subTaskId = item?.id ?? null;
    if (
      subTaskId == null ||
      deletingSubTaskId != null ||
      item?.capabilities?.can_delete !== true
    ) {
      return;
    }

    const { isConfirmed } = await alertConfirm({
      title: "Delete this Sub-task?",
      text: "Its Work Items will also be removed from active views.",
      confirmText: "Delete",
      cancelText: "No",
    });
    if (!isConfirmed) return;

    const isOpen = String(selectedSubTaskId ?? "") === String(subTaskId);

    try {
      setDeletingSubTaskId(subTaskId);
      await deleteSubTask(projectId, taskId, subTaskId);
      setSubTasks((current) =>
        current.filter((subTask) => String(subTask?.id) !== String(subTaskId)),
      );
      setTask((current) => ({
        ...current,
        sub_tasks: (current?.sub_tasks || []).filter(
          (subTask) => String(subTask?.id) !== String(subTaskId),
        ),
      }));

      if (isOpen) {
        setSelectedSubTaskId(null);
        updateChildIntent({ subTaskId: null, workItemId: null });
      }

      toastSuccess("Sub-task deleted");
      await refreshTask();
    } catch (error) {
      toastError(error?.message || "Delete Sub-task failed");
    } finally {
      setDeletingSubTaskId(null);
    }
  }, [
    deletingSubTaskId,
    projectId,
    refreshTask,
    selectedSubTaskId,
    taskId,
    updateChildIntent,
  ]);

  const handleCreateSubTask = async (event) => {
    event.preventDefault();
    const title = newSubTask.title.trim();
    if (!title) return;
    try {
      setCreatingSubTask(true);
      await createSubTask(projectId, taskId, {
        title,
        description: newSubTask.description.trim() || null,
      });
      setNewSubTask({ title: "", description: "" });
      setShowNewSubTask(false);
      toastSuccess("Sub-task created");
      await refreshTask();
    } catch (error) {
      toastError(error?.message || "Create Sub-task failed");
    } finally {
      setCreatingSubTask(false);
    }
  };

  const handleUpdateField = async (
    field,
    value,
    { showSuccess = true } = {},
  ) => {
    if (!task?.column?.id || savingField) return false;
    try {
      setSavingField(field);
      const updatedTask = await updateSuperTask(
        projectId,
        task.column.id,
        taskId,
        { [field]: value },
      );
      setTask((current) => ({
        ...current,
        ...(updatedTask && typeof updatedTask === "object" ? updatedTask : {}),
        [field]: updatedTask?.[field] ?? value,
        ...(field === "responsible_user_id"
          ? {
              responsible_user:
                members
                  .map(normalizeProjectMember)
                  .find((member) => String(member.id) === String(value)) || null,
            }
          : {}),
      }));
      if (showSuccess) toastSuccess("Super Task updated");
      await loadTimeline();
      return true;
    } catch (error) {
      toastError(error?.message || "Update failed");
      return false;
    } finally {
      setSavingField("");
    }
  };

  const handleTagsChanged = useCallback((nextTags) => {
    setTask((current) => ({
      ...current,
      tags: Array.isArray(nextTags) ? nextTags : [],
    }));
    loadTimeline();
  }, [loadTimeline]);

  const handleWatchersChanged = useCallback(({ user, watching } = {}) => {
    const userId = getMemberId(user);
    if (userId != null) {
      setTask((current) => ({
        ...current,
        watchers: watching
          ? [
              ...(current?.watchers || []).filter(
                (watcher) => String(watcher.id) !== String(userId),
              ),
              user,
            ]
          : (current?.watchers || []).filter(
              (watcher) => String(watcher.id) !== String(userId),
            ),
      }));
    }
    loadTimeline();
  }, [loadTimeline]);

  if (loading) {
    return <div className="super-task-page-state"><Spinner color="primary" /><span>Loading Super Task...</span></div>;
  }

  if (pageError || !task) {
    return (
      <div className="super-task-page-state">
        <i className="ti ti-alert-circle" aria-hidden="true" />
        <strong>{pageError || "Super Task not found."}</strong>
        <button type="button" className="btn btn-primary text-white" onClick={loadPage}>Retry</button>
      </div>
    );
  }

  return (
    <div className="super-task-page">
      <header className="super-task-page__toolbar">
        <div className="super-task-page__toolbar-left">
          <button
            type="button"
            className="btn btn-primary text-white d-inline-flex align-items-center gap-2 fw-semibold"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            <i className="ti ti-arrow-left" aria-hidden="true" />
            <span className="d-none d-sm-inline">Back to board</span>
          </button>
          <SuperTaskReviewControls entity={task} projectId={projectId} taskId={taskId} onChanged={refreshTask} />
        </div>
        <div className="super-task-page__toolbar-responsible">
          <SuperTaskUserDropdown
            users={members}
            selectedUser={task.responsible_user}
            selectedUserId={task.responsible_user?.id}
            onChange={(userId) =>
              handleUpdateField("responsible_user_id", userId, {
                showSuccess: false,
              })
            }
            disabled={!task.capabilities?.can_edit || Boolean(savingField)}
            saving={savingField === "responsible_user_id"}
            emptyLabel="Assign responsible"
            className="super-task-owner-dropdown"
          />
        </div>
        <div
          ref={actionMenuRef}
          className="position-relative super-task-page__action-menu"
        >
          <button
            type="button"
            className="super-task-icon-button"
            aria-label="More Super Task actions"
            title="More actions"
            aria-haspopup="menu"
            aria-expanded={actionMenuOpen}
            disabled={Boolean(lifecycleAction)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setActionMenuOpen((current) => !current);
            }}
          >
            {lifecycleAction ? (
              <Spinner size="sm" />
            ) : (
              <i className="ti ti-dots" aria-hidden="true" />
            )}
          </button>
          <ActionDropdown
            open={actionMenuOpen}
            onToggle={setActionMenuOpen}
            rootRef={actionMenuRef}
            actions={[
              {
                key: "superTaskCopyLink",
                label: "Copy link",
                icon: "ti-link",
                onClick: handleCopyLink,
              },
              {
                key: "superTaskMove",
                label: "Move to another project",
                icon: "ti-arrow-right",
                onClick: () => setMoveModalOpen(true),
              },
              {
                key: "superTaskArchive",
                label: "Archive",
                icon: "ti-archive",
                disabled: lifecycleAction === "archive",
                onClick: handleArchive,
              },
              ...(task.capabilities?.can_delete === true
                ? [
                    { type: "divider" },
                    {
                      key: "superTaskDelete",
                      label: "Delete",
                      icon: "ti-trash",
                      destructive: true,
                      disabled: lifecycleAction === "delete",
                      onClick: handleDeleteRoot,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </header>

      <div className="super-task-page__layout">
        <main className="super-task-page__main">
          <section className="super-task-hero">
            <SuperTaskInlineTextField
              kind="title"
              value={task.text}
              placeholder="Super Task title"
              canEdit={Boolean(task.capabilities?.can_edit)}
              saving={Boolean(savingField)}
              onCommit={(value) =>
                handleUpdateField("text", value, { showSuccess: false })
              }
              className="super-task-inline-editor--root-title"
            />
            <SuperTaskInlineTextField
              value={task.description || ""}
              placeholder={
                task.capabilities?.can_edit
                  ? "Click to add a description"
                  : "No description has been added yet."
              }
              canEdit={Boolean(task.capabilities?.can_edit)}
              saving={Boolean(savingField)}
              onCommit={(value) =>
                handleUpdateField("description", value.trim() || null, {
                  showSuccess: false,
                })
              }
              className="super-task-inline-editor--root-description"
            />
            {task.rejection_note ? <div className="super-task-rejection-note"><i className="ti ti-message-exclamation" />{task.rejection_note}</div> : null}
          </section>

          <SuperTaskSummaryGrid summary={summary} />

          <section className="super-task-list-section">
            <div className="super-task-list-tools">
              <div className="d-flex gap-2 flex-wrap">
                <button type="button" className="btn btn-primary text-white" onClick={() => setShowNewSubTask((v) => !v)} disabled={!task.capabilities?.can_edit}>
                  <i className="ti ti-plus me-2" aria-hidden="true" />Add Sub-task
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    const input = document.getElementById("task-attachment-file");
                    if (input) input.click();
                    else attachmentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <i className="ti ti-paperclip me-2" aria-hidden="true" />Add Attachment
                </button>
              </div>
              <div className="super-task-search-filter">
                <label className="super-task-search">
                  <i className="ti ti-search" aria-hidden="true" />
                  <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search Sub-tasks..." />
                  {childrenLoading ? <Spinner size="sm" /> : null}
                </label>
                <button type="button" className={`super-task-filter-button ${activeFilterCount ? "is-active" : ""}`} onClick={() => setFiltersOpen((v) => !v)}>
                  <i className="ti ti-filter" aria-hidden="true" />Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}<i className="ti ti-chevron-down" aria-hidden="true" />
                </button>
              </div>
            </div>

            {showNewSubTask ? (
              <form className="super-task-new-subtask" onSubmit={handleCreateSubTask}>
                <input className="form-control" value={newSubTask.title} onChange={(event) => setNewSubTask((current) => ({ ...current, title: event.target.value }))} placeholder="Sub-task title" autoFocus />
                <input className="form-control" value={newSubTask.description} onChange={(event) => setNewSubTask((current) => ({ ...current, description: event.target.value }))} placeholder="Short description (optional)" />
                <button className="btn btn-primary text-white" disabled={creatingSubTask || !newSubTask.title.trim()}>{creatingSubTask ? <Spinner size="sm" /> : "Create"}</button>
              </form>
            ) : null}

            {filtersOpen ? (
              <div className="super-task-filter-panel">
                <label>Assignee<select value={filters.assigneeId} onChange={(event) => setFilters((current) => ({ ...current, assigneeId: event.target.value }))}><option value="">All assignees</option>{members.map((member) => <option key={getMemberId(member)} value={getMemberId(member)}>{member.name}</option>)}</select></label>
                <label>Tag<select value={filters.tagId} onChange={(event) => setFilters((current) => ({ ...current, tagId: event.target.value }))}><option value="">All tags</option>{tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}</select></label>
                <label>Status<select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">All statuses</option><option value={REVIEW_STATUS.IN_PROGRESS}>In progress</option><option value={REVIEW_STATUS.PENDING_REVIEW}>Pending review</option><option value={REVIEW_STATUS.APPROVED}>Approved</option><option value={REVIEW_STATUS.REJECTED}>Rejected</option></select></label>
                <button type="button" className="btn btn-link" onClick={() => setFilters(EMPTY_FILTERS)} disabled={!activeFilterCount}>Clear filters</button>
              </div>
            ) : null}

            <div className="super-task-list-heading">
              <h4>Sub-tasks ({subTasks.length})</h4>
              <span>{childrenLoading ? "Updating..." : `${summary.work_items?.total || 0} Work Items`}</span>
            </div>
            <SuperTaskSubTaskList
              items={subTasks}
              childrenLoading={childrenLoading}
              projectId={projectId}
              taskId={taskId}
              canReorder={task.capabilities?.can_reorder === true}
              reorderDisabled={Boolean(
                searchInput.trim() ||
                  debouncedSearch ||
                  activeFilterCount ||
                  childrenLoading ||
                  deletingSubTaskId != null
              )}
              onOpen={handleOpenSubTask}
              onDelete={handleDeleteSubTask}
              deletingId={deletingSubTaskId}
            />
          </section>

          <section ref={attachmentSectionRef} className="super-task-root-assets task-detail-modal-dialog">
            <div className="super-task-section-heading"><div><span className="super-task-section-heading__eyebrow">Files & voice</span><h4>Attachments</h4></div></div>
            <TaskAttachments projectId={projectId} taskId={taskId} columnId={task.column?.id} formatDateTime={formatDateTime} onChanged={loadTimeline} isActive={!selectedSubTaskId} />
          </section>

          <section className="super-task-root-activity">
            {timelineLoading ? <div className="super-task-empty-inline"><Spinner size="sm" />Loading activity...</div> : <TaskActivityConversation projectId={projectId} taskId={taskId} activities={timeline.activities} comments={timeline.comments} projectMembers={members} onRefresh={loadTimeline} />}
          </section>
        </main>

        <SuperTaskSidebar task={task} projectId={projectId} taskId={taskId} savingField={savingField} onUpdateField={handleUpdateField} onTagsChanged={handleTagsChanged} onWatchersChanged={handleWatchersChanged} />
      </div>

      <SuperTaskItemModal
        isOpen={
          selectedSubTaskId != null &&
          String(deletingSubTaskId ?? "") !== String(selectedSubTaskId)
        }
        onClose={handleCloseChild}
        projectId={projectId}
        taskId={taskId}
        subTaskId={selectedSubTaskId}
        initialWorkItemId={childIntent.workItemId}
        projectMembers={members}
        projectTags={tags}
        onChanged={refreshTask}
        onWorkItemChange={handleWorkItemIntent}
      />

      <TaskMoveModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        task={task}
        projectId={projectId}
        onMoved={({ destinationProjectId }) => {
          setSelectedSubTaskId(null);
          navigate(`/projects/${destinationProjectId}/tasks/${taskId}`, {
            replace: true,
          });
        }}
      />
    </div>
  );
}
