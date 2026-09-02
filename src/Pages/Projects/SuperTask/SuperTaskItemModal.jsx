import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalBody, Spinner } from "reactstrap";
import {
  getEntityTimeline,
  getSubTask,
  updateSubTask,
} from "../../../api/superTask";
import TaskActivityConversation from "../../../Components/taskDetailModal/TaskActivityConversation";
import TaskAttachments from "../../../Components/taskDetailModal/TaskAttachments";
import { toastError, toastSuccess } from "../../../utils/sweetAlert";
import SuperTaskReviewControls from "./SuperTaskReviewControls";
import SuperTaskWorkItemList from "./SuperTaskWorkItemList";
import {
  entityResourcePath,
  formatDateTime,
  getReviewMeta,
} from "./superTask.utils";

const EMPTY_TIMELINE = { activities: [], comments: [] };

export default function SuperTaskItemModal({
  isOpen,
  onClose,
  projectId,
  taskId,
  subTaskId,
  projectMembers = [],
  onChanged,
}) {
  const requestRef = useRef(0);
  const [subTask, setSubTask] = useState(null);
  const [draft, setDraft] = useState({ title: "", description: "" });
  const [timeline, setTimeline] = useState(EMPTY_TIMELINE);
  const [loading, setLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const resourceBasePath = useMemo(
    () =>
      entityResourcePath({
        projectId,
        taskId,
        subTaskId,
      }),
    [projectId, subTaskId, taskId],
  );

  const syncSubTask = useCallback((item) => {
    setSubTask(item);
    setDraft({
      title: item?.title ?? "",
      description: item?.description ?? "",
    });
  }, []);

  const loadTimeline = useCallback(async () => {
    if (!isOpen || !subTaskId || !resourceBasePath) return;
    try {
      setTimelineLoading(true);
      setTimeline(await getEntityTimeline(resourceBasePath));
    } catch (error) {
      toastError(error?.message || "Load Sub-task activity failed");
      setTimeline(EMPTY_TIMELINE);
    } finally {
      setTimelineLoading(false);
    }
  }, [isOpen, resourceBasePath, subTaskId]);

  const refreshDetails = useCallback(
    async ({ showLoading = false } = {}) => {
      if (!isOpen || !projectId || !taskId || !subTaskId) return null;

      const requestId = ++requestRef.current;
      try {
        if (showLoading) setLoading(true);
        setModalError("");
        const [item, timelineData] = await Promise.all([
          getSubTask(projectId, taskId, subTaskId),
          getEntityTimeline(resourceBasePath),
        ]);

        if (requestId !== requestRef.current) return null;
        syncSubTask(item);
        setTimeline(timelineData);
        return item;
      } catch (error) {
        if (requestId !== requestRef.current) return null;
        const message = error?.message || "Sub-task details could not be loaded.";
        setModalError(message);
        if (!showLoading) toastError(message);
        return null;
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [isOpen, projectId, resourceBasePath, subTaskId, syncSubTask, taskId],
  );

  useEffect(() => {
    if (!isOpen) {
      requestRef.current += 1;
      return;
    }

    setSubTask(null);
    setTimeline(EMPTY_TIMELINE);
    setModalError("");
    refreshDetails({ showLoading: true });
  }, [isOpen, refreshDetails, subTaskId]);

  const refreshModalAndRoot = useCallback(async () => {
    await Promise.all([
      refreshDetails(),
      Promise.resolve(onChanged?.()),
    ]);
  }, [onChanged, refreshDetails]);

  const saveSubTask = async () => {
    if (!subTask?.id || saving || !subTask?.capabilities?.can_edit) return;

    const title = String(draft.title || "").trim();
    if (!title) {
      toastError("Title is required");
      return;
    }

    try {
      setSaving(true);
      await updateSubTask(projectId, taskId, subTaskId, {
        title,
        description: String(draft.description || "").trim() || null,
      });
      await refreshModalAndRoot();
      toastSuccess("Sub-task updated");
    } catch (error) {
      toastError(error?.message || "Update Sub-task failed");
    } finally {
      setSaving(false);
    }
  };

  const handleNestedContentChanged = useCallback(async () => {
    await Promise.all([
      loadTimeline(),
      Promise.resolve(onChanged?.()),
    ]);
  }, [loadTimeline, onChanged]);

  const status = getReviewMeta(subTask?.review_status);
  const workItems = Array.isArray(subTask?.work_items)
    ? subTask.work_items
    : [];

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      centered
      size="lg"
      scrollable
      className="task-detail-modal-dialog super-task-item-modal"
      contentClassName="super-task-item-modal__content"
    >
      <div className="super-task-item-modal__header">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <span className="super-task-item-modal__eyebrow">Sub-task</span>
          {subTask ? (
            <span className={`super-task-status is-${status.tone}`}>
              <i className={status.icon} aria-hidden="true" />
              {status.label}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="super-task-icon-button"
          onClick={onClose}
          aria-label="Close Sub-task"
          title="Close"
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <ModalBody className="super-task-item-modal__body">
        {loading ? (
          <div className="super-task-item-modal__loading">
            <Spinner color="primary" />
            <span>Loading Sub-task...</span>
          </div>
        ) : modalError || !subTask ? (
          <div className="super-task-item-modal__loading">
            <i className="ti ti-alert-circle fs-3" aria-hidden="true" />
            <strong>{modalError || "Sub-task not found."}</strong>
            <button
              type="button"
              className="btn btn-primary btn-sm text-white"
              onClick={() => refreshDetails({ showLoading: true })}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <section className="super-task-item-modal__editor">
              <label className="form-label" htmlFor={`sub-task-title-${subTask.id}`}>
                Title
              </label>
              <input
                id={`sub-task-title-${subTask.id}`}
                className="form-control form-control-lg"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                disabled={!subTask.capabilities?.can_edit || saving}
              />

              <label
                className="form-label mt-3"
                htmlFor={`sub-task-description-${subTask.id}`}
              >
                Description
              </label>
              <textarea
                id={`sub-task-description-${subTask.id}`}
                className="form-control"
                rows="4"
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                disabled={!subTask.capabilities?.can_edit || saving}
                placeholder="Add a clear description..."
              />

              {subTask.rejection_note ? (
                <div className="super-task-rejection-note">
                  <i className="ti ti-message-exclamation" aria-hidden="true" />
                  <span>{subTask.rejection_note}</span>
                </div>
              ) : null}

              <div className="super-task-item-modal__actions">
                <SuperTaskReviewControls
                  entity={subTask}
                  projectId={projectId}
                  taskId={taskId}
                  subTaskId={subTaskId}
                  onChanged={refreshModalAndRoot}
                  compact
                />
                {subTask.capabilities?.can_edit ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm text-white"
                    onClick={saveSubTask}
                    disabled={saving || !String(draft.title || "").trim()}
                  >
                    {saving ? <Spinner size="sm" className="me-2" /> : null}
                    Save changes
                  </button>
                ) : null}
              </div>
            </section>

            <section className="super-task-item-modal__section">
              <div className="super-task-section-heading">
                <div>
                  <span className="super-task-section-heading__eyebrow">
                    Assigned delivery
                  </span>
                  <h5>Work Items ({workItems.length})</h5>
                </div>
              </div>
              <SuperTaskWorkItemList items={workItems} />
            </section>

            <section className="super-task-item-modal__section super-task-detail-assets task-detail-modal-dialog">
              <div className="super-task-section-heading">
                <div>
                  <span className="super-task-section-heading__eyebrow">Files & voice</span>
                  <h5>Attachments</h5>
                </div>
              </div>
              <TaskAttachments
                projectId={projectId}
                taskId={taskId}
                resourceBasePath={resourceBasePath}
                inputId={`sub-task-attachment-file-${subTask.id}`}
                syncBoardCounts={false}
                isActive={isOpen}
                formatDateTime={formatDateTime}
                onChanged={handleNestedContentChanged}
              />
            </section>

            <section className="super-task-item-modal__section">
              {timelineLoading ? (
                <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                  <Spinner size="sm" /> Refreshing Sub-task activity...
                </div>
              ) : null}
              <TaskActivityConversation
                projectId={projectId}
                taskId={taskId}
                resourceBasePath={resourceBasePath}
                activities={timeline.activities}
                comments={timeline.comments}
                projectMembers={projectMembers}
                onRefresh={handleNestedContentChanged}
              />
            </section>

          </>
        )}
      </ModalBody>
    </Modal>
  );
}
