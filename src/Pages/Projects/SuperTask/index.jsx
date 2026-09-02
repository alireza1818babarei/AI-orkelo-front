import React, { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "reactstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createSubTask,
  getEntityTimeline,
  getProjectMembers,
  getProjectTags,
  getSuperTask,
  getSuperTaskSubTasks,
  getSuperTaskSummary,
  updateSuperTask,
} from "../../../api/superTask";
import TaskActivityConversation from "../../../Components/taskDetailModal/TaskActivityConversation";
import TaskAttachments from "../../../Components/taskDetailModal/TaskAttachments";
import { toastError, toastSuccess } from "../../../utils/sweetAlert";
import SuperTaskItemModal from "./SuperTaskItemModal";
import SuperTaskReviewControls from "./SuperTaskReviewControls";
import SuperTaskSidebar from "./SuperTaskSidebar";
import SuperTaskSubTaskRow from "./SuperTaskSubTaskRow";
import SuperTaskSummaryGrid from "./SuperTaskSummaryGrid";
import SuperTaskUserAvatar from "./SuperTaskUserAvatar";
import {
  formatDateTime,
  getMemberId,
  getReviewMeta,
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
  const childRequestRef = useRef(0);
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
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState({ text: "", description: "" });
  const [savingField, setSavingField] = useState("");
  const [selectedSubTaskId, setSelectedSubTaskId] = useState(null);

  const rootPath = `/projects/${projectId}/tasks/${taskId}`;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
        navigate(`/projects/${projectId}/task/${taskId}${location.search || ""}`, { replace: true });
        return;
      }
      setTask(taskData);
      setSummary(summaryData || EMPTY_SUMMARY);
      setSubTasks(Array.isArray(taskData?.sub_tasks) ? taskData.sub_tasks : []);
      setMembers(memberData);
      setTags(tagData);
      setTimeline(timelineData);
      setDetailsDraft({ text: taskData?.text || "", description: taskData?.description || "" });
    } catch (error) {
      setPageError(error?.message || "Super Task could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [location.search, navigate, projectId, rootPath, taskId]);

  const refreshTask = useCallback(async () => {
    try {
      const [taskData, summaryData] = await Promise.all([
        getSuperTask(projectId, taskId),
        getSuperTaskSummary(projectId, taskId),
      ]);
      setTask(taskData);
      setSummary(summaryData || EMPTY_SUMMARY);
      setDetailsDraft({ text: taskData?.text || "", description: taskData?.description || "" });
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

  const handleUpdateField = async (field, value) => {
    if (!task?.column?.id || savingField) return;
    try {
      setSavingField(field);
      await updateSuperTask(projectId, task.column.id, taskId, { [field]: value });
      setTask((current) => ({
        ...current,
        [field]: value,
        ...(field === "responsible_user_id"
          ? {
              responsible_user:
                members.find((member) => String(getMemberId(member)) === String(value)) || null,
            }
          : {}),
      }));
      toastSuccess("Super Task updated");
      await loadTimeline();
    } catch (error) {
      toastError(error?.message || "Update failed");
    } finally {
      setSavingField("");
    }
  };

  const saveDetails = async () => {
    const text = detailsDraft.text.trim();
    if (!text) {
      toastError("Title is required");
      return;
    }
    try {
      setSavingField("details");
      await updateSuperTask(projectId, task.column.id, taskId, {
        text,
        description: detailsDraft.description.trim() || null,
      });
      setEditingDetails(false);
      await refreshTask();
      toastSuccess("Super Task details updated");
    } catch (error) {
      toastError(error?.message || "Update details failed");
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

  const statusMeta = getReviewMeta(task.review_status);

  return (
    <div className="super-task-page">
      <header className="super-task-page__toolbar">
        <div className="super-task-page__toolbar-left">
          <button type="button" className="super-task-back-button" onClick={() => navigate(`/projects/${projectId}${location.search || ""}`)}>
            <i className="ti ti-arrow-left" aria-hidden="true" />
            <span>Back to board</span>
          </button>
          <SuperTaskReviewControls entity={task} projectId={projectId} taskId={taskId} onChanged={refreshTask} />
        </div>
        <label className="super-task-owner-control">
          <span>Super Task owner</span>
          <div>
            <SuperTaskUserAvatar user={task.responsible_user} size={34} />
            <select
              value={task.responsible_user?.id || ""}
              onChange={(event) => handleUpdateField("responsible_user_id", event.target.value ? Number(event.target.value) : null)}
              disabled={savingField === "responsible_user_id" || !task.capabilities?.can_edit}
            >
              <option value="">Unassigned</option>
              {members.map((member) => <option key={getMemberId(member)} value={getMemberId(member)}>{member.name}</option>)}
            </select>
          </div>
        </label>
        <div className="super-task-page__toolbar-actions">
          {task.capabilities?.can_edit ? (
            <button type="button" className="super-task-icon-button" onClick={() => setEditingDetails((v) => !v)} title="Edit details">
              <i className="ti ti-edit" aria-hidden="true" />
            </button>
          ) : null}
          <button type="button" className="super-task-icon-button" onClick={() => navigate(`/projects/${projectId}${location.search || ""}`)} aria-label="Close">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="super-task-page__layout">
        <main className="super-task-page__main">
          <section className="super-task-hero">
            {editingDetails ? (
              <div className="super-task-details-editor">
                <input value={detailsDraft.text} onChange={(event) => setDetailsDraft((current) => ({ ...current, text: event.target.value }))} className="form-control form-control-lg" />
                <textarea value={detailsDraft.description} onChange={(event) => setDetailsDraft((current) => ({ ...current, description: event.target.value }))} rows="3" className="form-control" placeholder="Description" />
                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-light" onClick={() => setEditingDetails(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary text-white" onClick={saveDetails} disabled={savingField === "details"}>
                    {savingField === "details" ? <Spinner size="sm" className="me-2" /> : null}Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="super-task-hero__title-row">
                  <h1>{task.text}</h1>
                  <span className={`super-task-status is-${statusMeta.tone}`}><i className={statusMeta.icon} aria-hidden="true" />{statusMeta.label}</span>
                </div>
                <p>{task.description || "No description has been added yet."}</p>
                {task.rejection_note ? <div className="super-task-rejection-note"><i className="ti ti-message-exclamation" />{task.rejection_note}</div> : null}
              </>
            )}
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
            <div className="super-task-subtask-list">
              {childrenLoading && !subTasks.length ? <div className="super-task-empty-inline"><Spinner size="sm" />Loading Sub-tasks...</div> : null}
              {!childrenLoading && !subTasks.length ? <div className="super-task-empty-inline"><i className="ti ti-subtask" />No Sub-tasks match this view.</div> : null}
              {subTasks.map((item) => (
                <SuperTaskSubTaskRow
                  key={item.id}
                  item={item}
                  onOpen={setSelectedSubTaskId}
                />
              ))}
            </div>
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
        isOpen={selectedSubTaskId != null}
        onClose={() => setSelectedSubTaskId(null)}
        projectId={projectId}
        taskId={taskId}
        subTaskId={selectedSubTaskId}
        projectMembers={members}
        onChanged={refreshTask}
      />
    </div>
  );
}
