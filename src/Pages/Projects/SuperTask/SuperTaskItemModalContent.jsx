import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalBody, Spinner } from "reactstrap";
import {
  createWorkItem,
  deleteWorkItem,
  getEntityTimeline,
  getSubTask,
  getWorkItem,
  updateSubTask,
  updateWorkItem,
} from "../../../api/superTask";
import TaskActivityConversation from "../../../Components/taskDetailModal/TaskActivityConversation";
import TaskAttachments from "../../../Components/taskDetailModal/TaskAttachments";
import {
  alertConfirm,
  toastError,
  toastSuccess,
} from "../../../utils/sweetAlert";
import SuperTaskCreateWorkItemForm from "./SuperTaskCreateWorkItemForm";
import SuperTaskInlineTextField from "./SuperTaskInlineTextField";
import SuperTaskReviewControls from "./SuperTaskReviewControls";
import SuperTaskUserDropdown from "./SuperTaskUserDropdown";
import SuperTaskWorkItemDetail from "./SuperTaskWorkItemDetail";
import SuperTaskWorkItemList from "./SuperTaskWorkItemList";
import {
  entityResourcePath,
  formatDateTime,
  getReviewMeta,
} from "./superTask.utils";

const EMPTY_TIMELINE = { activities: [], comments: [] };
const VIEW = { SUB_TASK: "sub_task", WORK_ITEM: "work_item" };

export default function SuperTaskItemModal({
  isOpen,
  onClose,
  projectId,
  taskId,
  subTaskId,
  initialWorkItemId = null,
  projectMembers = [],
  projectTags = [],
  onChanged,
  onWorkItemChange,
}) {
  const subTaskRequestRef = useRef(0);
  const subTaskTimelineRequestRef = useRef(0);
  const workItemRequestRef = useRef(0);
  const workItemTimelineRequestRef = useRef(0);
  const [view, setView] = useState(VIEW.SUB_TASK);
  const [subTask, setSubTask] = useState(null);
  const [timeline, setTimeline] = useState(EMPTY_TIMELINE);
  const [loading, setLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [savingField, setSavingField] = useState("");
  const [showCreateWorkItem, setShowCreateWorkItem] = useState(false);
  const [creatingWorkItem, setCreatingWorkItem] = useState(false);
  const [modalError, setModalError] = useState("");
  const [selectedWorkItemId, setSelectedWorkItemId] = useState(null);
  const [workItem, setWorkItem] = useState(null);
  const [workItemTimeline, setWorkItemTimeline] = useState(EMPTY_TIMELINE);
  const [workItemLoading, setWorkItemLoading] = useState(false);
  const [workItemTimelineLoading, setWorkItemTimelineLoading] = useState(false);
  const [workItemError, setWorkItemError] = useState("");
  const [workItemSavingField, setWorkItemSavingField] = useState("");
  const [deletingWorkItemId, setDeletingWorkItemId] = useState(null);
  const isWorkItemView = view === VIEW.WORK_ITEM;

  const resourceBasePath = useMemo(
    () => entityResourcePath({ projectId, taskId, subTaskId }),
    [projectId, subTaskId, taskId],
  );
  const workItemResourceBasePath = useMemo(
    () =>
      selectedWorkItemId == null
        ? ""
        : entityResourcePath({
            projectId,
            taskId,
            subTaskId,
            workItemId: selectedWorkItemId,
          }),
    [projectId, selectedWorkItemId, subTaskId, taskId],
  );

  const loadSubTaskTimeline = useCallback(async () => {
    if (!isOpen || !subTaskId || !resourceBasePath) return;
    const requestId = ++subTaskTimelineRequestRef.current;
    try {
      setTimelineLoading(true);
      const nextTimeline = await getEntityTimeline(resourceBasePath);
      if (requestId === subTaskTimelineRequestRef.current) {
        setTimeline(nextTimeline);
      }
    } catch (error) {
      if (requestId !== subTaskTimelineRequestRef.current) return;
      toastError(error?.message || "Load Sub-task activity failed");
      setTimeline(EMPTY_TIMELINE);
    } finally {
      if (requestId === subTaskTimelineRequestRef.current) {
        setTimelineLoading(false);
      }
    }
  }, [isOpen, resourceBasePath, subTaskId]);

  const refreshDetails = useCallback(
    async ({ showLoading = false } = {}) => {
      if (!isOpen || !projectId || !taskId || !subTaskId) return null;

      const requestId = ++subTaskRequestRef.current;
      try {
        if (showLoading) setLoading(true);
        setModalError("");
        const [item, timelineData] = await Promise.all([
          getSubTask(projectId, taskId, subTaskId),
          getEntityTimeline(resourceBasePath),
        ]);
        if (requestId !== subTaskRequestRef.current) return null;
        setSubTask(item);
        setTimeline(timelineData);
        return item;
      } catch (error) {
        if (requestId !== subTaskRequestRef.current) return null;
        const message = error?.message || "Sub-task details could not be loaded.";
        setModalError(message);
        if (!showLoading) toastError(message);
        return null;
      } finally {
        if (requestId === subTaskRequestRef.current) setLoading(false);
      }
    },
    [isOpen, projectId, resourceBasePath, subTaskId, taskId],
  );

  const loadWorkItemTimeline = useCallback(async () => {
    if (!isOpen || !selectedWorkItemId || !workItemResourceBasePath) return;
    const requestId = ++workItemTimelineRequestRef.current;
    try {
      setWorkItemTimelineLoading(true);
      const nextTimeline = await getEntityTimeline(workItemResourceBasePath);
      if (requestId === workItemTimelineRequestRef.current) {
        setWorkItemTimeline(nextTimeline);
      }
    } catch (error) {
      if (requestId !== workItemTimelineRequestRef.current) return;
      toastError(error?.message || "Load Work Item activity failed");
      setWorkItemTimeline(EMPTY_TIMELINE);
    } finally {
      if (requestId === workItemTimelineRequestRef.current) {
        setWorkItemTimelineLoading(false);
      }
    }
  }, [isOpen, selectedWorkItemId, workItemResourceBasePath]);

  const loadWorkItem = useCallback(
    async ({ showLoading = false } = {}) => {
      if (
        !isOpen ||
        !projectId ||
        !taskId ||
        !subTaskId ||
        !selectedWorkItemId ||
        !workItemResourceBasePath
      ) {
        return null;
      }

      const requestId = ++workItemRequestRef.current;
      try {
        if (showLoading) setWorkItemLoading(true);
        setWorkItemError("");
        const [item, timelineData] = await Promise.all([
          getWorkItem(projectId, taskId, subTaskId, selectedWorkItemId),
          getEntityTimeline(workItemResourceBasePath),
        ]);
        if (requestId !== workItemRequestRef.current) return null;
        setWorkItem(item);
        setWorkItemTimeline(timelineData);
        return item;
      } catch (error) {
        if (requestId !== workItemRequestRef.current) return null;
        const message = error?.message || "Work Item details could not be loaded.";
        setWorkItemError(message);
        if (!showLoading) toastError(message);
        return null;
      } finally {
        if (requestId === workItemRequestRef.current) setWorkItemLoading(false);
      }
    },
    [
      isOpen,
      projectId,
      selectedWorkItemId,
      subTaskId,
      taskId,
      workItemResourceBasePath,
    ],
  );

  useEffect(() => {
    if (!isOpen) {
      subTaskRequestRef.current += 1;
      subTaskTimelineRequestRef.current += 1;
      workItemRequestRef.current += 1;
      workItemTimelineRequestRef.current += 1;
      setView(VIEW.SUB_TASK);
      setSelectedWorkItemId(null);
      setShowCreateWorkItem(false);
      setDeletingWorkItemId(null);
      return;
    }

    setView(VIEW.SUB_TASK);
    setSelectedWorkItemId(null);
    setSubTask(null);
    setTimeline(EMPTY_TIMELINE);
    setModalError("");
    setShowCreateWorkItem(false);
    setSavingField("");
    setWorkItem(null);
    setWorkItemTimeline(EMPTY_TIMELINE);
    setWorkItemError("");
    setWorkItemSavingField("");
    setDeletingWorkItemId(null);
    refreshDetails({ showLoading: true });
  }, [isOpen, refreshDetails, subTaskId]);

  useEffect(() => {
    if (!isOpen || view !== VIEW.WORK_ITEM || !selectedWorkItemId) return;
    loadWorkItem({ showLoading: true });
  }, [isOpen, loadWorkItem, selectedWorkItemId, view]);

  useEffect(() => {
    if (!isOpen || !subTask || initialWorkItemId == null) return;

    if (
      view === VIEW.WORK_ITEM &&
      String(selectedWorkItemId) === String(initialWorkItemId)
    ) {
      return;
    }

    const requestedWorkItem = (subTask.work_items || []).find(
      (item) => String(item?.id) === String(initialWorkItemId),
    );

    if (!requestedWorkItem) {
      toastError("The requested Work Item could not be found in this Sub-task.");
      onWorkItemChange?.(null);
      return;
    }

    setWorkItem(null);
    setWorkItemTimeline(EMPTY_TIMELINE);
    setWorkItemError("");
    setWorkItemSavingField("");
    setWorkItemLoading(true);
    setSelectedWorkItemId(requestedWorkItem.id);
    setView(VIEW.WORK_ITEM);
  }, [
    initialWorkItemId,
    isOpen,
    onWorkItemChange,
    selectedWorkItemId,
    subTask,
    view,
  ]);

  const refreshModalAndRoot = useCallback(async () => {
    await Promise.all([refreshDetails(), Promise.resolve(onChanged?.())]);
  }, [onChanged, refreshDetails]);

  const refreshWorkItemAndAncestors = useCallback(async () => {
    await Promise.all([
      loadWorkItem(),
      refreshDetails(),
      Promise.resolve(onChanged?.()),
    ]);
  }, [loadWorkItem, onChanged, refreshDetails]);

  const handleUpdateField = async (field, value) => {
    if (!subTask?.id || savingField || !subTask?.capabilities?.can_edit) {
      return false;
    }
    try {
      setSavingField(field);
      await updateSubTask(projectId, taskId, subTaskId, { [field]: value });
      await refreshModalAndRoot();
      return true;
    } catch (error) {
      toastError(error?.message || "Update Sub-task failed");
      return false;
    } finally {
      setSavingField("");
    }
  };

  const handleUpdateWorkItem = async (field, value) => {
    if (
      !workItem?.id ||
      workItemSavingField ||
      !workItem?.capabilities?.can_edit
    ) {
      return false;
    }

    try {
      setWorkItemSavingField(field);
      const updated = await updateWorkItem(
        projectId,
        taskId,
        subTaskId,
        workItem.id,
        { [field]: value },
      );
      setWorkItem(updated);
      await Promise.all([
        loadWorkItemTimeline(),
        refreshDetails(),
        Promise.resolve(onChanged?.()),
      ]);
      toastSuccess("Work Item updated");
      return true;
    } catch (error) {
      toastError(error?.message || "Update Work Item failed");
      return false;
    } finally {
      setWorkItemSavingField("");
    }
  };

  const handleCreateWorkItem = async (payload) => {
    if (!subTask?.id || creatingWorkItem || !subTask?.capabilities?.can_edit) {
      return false;
    }

    try {
      setCreatingWorkItem(true);
      await createWorkItem(projectId, taskId, subTaskId, payload);
      setShowCreateWorkItem(false);
      await refreshModalAndRoot();
      toastSuccess("Work Item created");
      return true;
    } catch (error) {
      toastError(error?.message || "Create Work Item failed");
      return false;
    } finally {
      setCreatingWorkItem(false);
    }
  };

  const handleDeleteWorkItem = useCallback(async (item) => {
    const workItemId = item?.id ?? null;
    if (
      workItemId == null ||
      deletingWorkItemId != null ||
      item?.capabilities?.can_delete !== true
    ) {
      return;
    }

    const { isConfirmed } = await alertConfirm({
      title: "Delete this Work Item?",
      text: "This Work Item will be removed from active views.",
      confirmText: "Delete",
      cancelText: "No",
    });
    if (!isConfirmed) return;

    const wasSelected =
      view === VIEW.WORK_ITEM &&
      String(selectedWorkItemId ?? "") === String(workItemId);

    try {
      setDeletingWorkItemId(workItemId);

      if (wasSelected) {
        // Invalidate every Work Item request before clearing its resource path.
        workItemRequestRef.current += 1;
        workItemTimelineRequestRef.current += 1;
        setWorkItemLoading(false);
        setWorkItemTimelineLoading(false);
        setView(VIEW.SUB_TASK);
        setSelectedWorkItemId(null);
        setWorkItem(null);
        setWorkItemTimeline(EMPTY_TIMELINE);
        setWorkItemError("");
        setWorkItemSavingField("");
        onWorkItemChange?.(null);
      }

      await deleteWorkItem(projectId, taskId, subTaskId, workItemId);
      setSubTask((current) => ({
        ...current,
        work_items: (current?.work_items || []).filter(
          (workItemEntry) =>
            String(workItemEntry?.id) !== String(workItemId),
        ),
      }));
      toastSuccess("Work Item deleted");
      await Promise.all([
        refreshDetails(),
        Promise.resolve(onChanged?.()),
      ]);
    } catch (error) {
      toastError(error?.message || "Delete Work Item failed");

      if (wasSelected) {
        setWorkItem(null);
        setWorkItemTimeline(EMPTY_TIMELINE);
        setWorkItemError("");
        setWorkItemLoading(true);
        setSelectedWorkItemId(workItemId);
        setView(VIEW.WORK_ITEM);
        onWorkItemChange?.(workItemId);
      }
    } finally {
      setDeletingWorkItemId(null);
    }
  }, [
    deletingWorkItemId,
    onChanged,
    onWorkItemChange,
    projectId,
    refreshDetails,
    selectedWorkItemId,
    subTaskId,
    taskId,
    view,
  ]);

  const handleSubTaskContentChanged = useCallback(async () => {
    await Promise.all([
      loadSubTaskTimeline(),
      Promise.resolve(onChanged?.()),
    ]);
  }, [loadSubTaskTimeline, onChanged]);

  const handleWorkItemContentChanged = useCallback(async () => {
    await refreshWorkItemAndAncestors();
  }, [refreshWorkItemAndAncestors]);

  const openWorkItem = (item) => {
    if (item?.id == null) return;
    setWorkItem(null);
    setWorkItemTimeline(EMPTY_TIMELINE);
    setWorkItemError("");
    setWorkItemSavingField("");
    setWorkItemLoading(true);
    setSelectedWorkItemId(item.id);
    setView(VIEW.WORK_ITEM);
    onWorkItemChange?.(item.id);
  };

  const backToSubTask = () => {
    workItemRequestRef.current += 1;
    workItemTimelineRequestRef.current += 1;
    setWorkItemLoading(false);
    setWorkItemTimelineLoading(false);
    setView(VIEW.SUB_TASK);
    setSelectedWorkItemId(null);
    setWorkItem(null);
    setWorkItemError("");
    setWorkItemSavingField("");
    onWorkItemChange?.(null);
    refreshDetails({ showLoading: true });
  };

  const visibleEntity = isWorkItemView ? workItem : subTask;
  const status = getReviewMeta(visibleEntity?.review_status);
  const workItems = Array.isArray(subTask?.work_items) ? subTask.work_items : [];
  const capabilities = visibleEntity?.capabilities ?? {};
  const hasReviewActions = Boolean(
    capabilities.can_submit ||
      capabilities.can_approve ||
      capabilities.can_reject ||
      capabilities.can_restore,
  );
  const workRoleName = workItem?.assigned_user?.work_role?.name || "";

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      centered
      size={isWorkItemView ? "xl" : "lg"}
      scrollable
      className={`task-detail-modal-dialog super-task-item-modal ${isWorkItemView ? "is-work-item" : ""}`}
      contentClassName="super-task-item-modal__content"
    >
      <div className="super-task-item-modal__header">
        {isWorkItemView ? (
          <button
            type="button"
            className="btn btn-sm btn-light super-task-item-modal__back"
            onClick={backToSubTask}
            aria-label="Back to Sub-task"
            title="Back to Sub-task"
          >
            <i className="ti ti-arrow-left" aria-hidden="true" />
            <span>Back</span>
          </button>
        ) : null}

        <div className="super-task-item-modal__identity">
          <span className="super-task-item-modal__eyebrow">
            {isWorkItemView ? "Work Item" : "Sub-task"}
          </span>
          {visibleEntity ? (
            <span className={`super-task-status is-${status.tone}`}>
              <i className={status.icon} aria-hidden="true" />
              {status.label}
            </span>
          ) : null}
        </div>

        <div className="super-task-item-modal__header-actions">
          {visibleEntity && hasReviewActions ? (
            <SuperTaskReviewControls
              entity={visibleEntity}
              projectId={projectId}
              taskId={taskId}
              subTaskId={subTaskId}
              workItemId={isWorkItemView ? selectedWorkItemId : null}
              onChanged={
                isWorkItemView
                  ? refreshWorkItemAndAncestors
                  : refreshModalAndRoot
              }
              compact
              showStatus={false}
              secondaryActionsInMenu={isWorkItemView}
            />
          ) : null}
        </div>

        {isWorkItemView && workItem ? (
          <SuperTaskUserDropdown
            users={projectMembers}
            selectedUser={workItem.assigned_user}
            onChange={(userId) =>
              handleUpdateWorkItem("assigned_user_id", userId)
            }
            disabled={!workItem.capabilities?.can_edit}
            saving={workItemSavingField === "assigned_user_id"}
            allowUnassigned={false}
            selectedLabel={workItem.assigned_user?.name || "Assigned user"}
            secondaryText={workRoleName}
            className="super-task-item-modal__assignee"
          />
        ) : null}

        <button
          type="button"
          className="super-task-icon-button super-task-item-modal__close"
          onClick={onClose}
          aria-label="Close details"
          title="Close"
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <ModalBody className="super-task-item-modal__body">
        {isWorkItemView ? (
          workItemLoading ? (
            <div className="super-task-item-modal__loading">
              <Spinner color="primary" />
              <span>Loading Work Item...</span>
            </div>
          ) : workItemError || !workItem ? (
            <div className="super-task-item-modal__loading">
              <i className="ti ti-alert-circle fs-3" aria-hidden="true" />
              <strong>{workItemError || "Work Item not found."}</strong>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={backToSubTask}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm text-white"
                  onClick={() => loadWorkItem({ showLoading: true })}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <SuperTaskWorkItemDetail
              isActive={isOpen && isWorkItemView}
              projectId={projectId}
              taskId={taskId}
              subTaskId={subTaskId}
              workItem={workItem}
              resourceBasePath={workItemResourceBasePath}
              projectMembers={projectMembers}
              projectTags={projectTags}
              timeline={workItemTimeline}
              timelineLoading={workItemTimelineLoading}
              savingField={workItemSavingField}
              onUpdate={handleUpdateWorkItem}
              onContentChanged={handleWorkItemContentChanged}
              onTrackerChanged={refreshWorkItemAndAncestors}
            />
          )
        ) : loading ? (
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
              <SuperTaskInlineTextField
                kind="title"
                value={subTask.title}
                placeholder="Sub-task title"
                canEdit={Boolean(subTask.capabilities?.can_edit)}
                saving={Boolean(savingField)}
                onCommit={(value) => handleUpdateField("title", value)}
                className="super-task-inline-editor--modal-title"
              />
              <SuperTaskInlineTextField
                value={subTask.description || ""}
                placeholder={
                  subTask.capabilities?.can_edit
                    ? "Click to add a description"
                    : "No description has been added yet."
                }
                canEdit={Boolean(subTask.capabilities?.can_edit)}
                saving={Boolean(savingField)}
                onCommit={(value) =>
                  handleUpdateField("description", value.trim() || null)
                }
                className="super-task-inline-editor--modal-description"
              />

              {subTask.rejection_note ? (
                <div className="super-task-rejection-note">
                  <i className="ti ti-message-exclamation" aria-hidden="true" />
                  <span>{subTask.rejection_note}</span>
                </div>
              ) : null}
            </section>

            <section className="super-task-item-modal__section">
              <div className="super-task-section-heading">
                <h5>Work Items ({workItems.length})</h5>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowCreateWorkItem((current) => !current)}
                  disabled={!subTask.capabilities?.can_edit || creatingWorkItem}
                >
                  <i className="ti ti-plus me-1" aria-hidden="true" />
                  Add Work Item
                </button>
              </div>
              {showCreateWorkItem ? (
                <SuperTaskCreateWorkItemForm
                  projectMembers={projectMembers}
                  creating={creatingWorkItem}
                  onCreate={handleCreateWorkItem}
                  onCancel={() => setShowCreateWorkItem(false)}
                />
              ) : null}
              <SuperTaskWorkItemList
                items={workItems}
                onOpen={openWorkItem}
                onDelete={handleDeleteWorkItem}
                deletingId={deletingWorkItemId}
              />
            </section>

            <section className="super-task-item-modal__section super-task-detail-assets">
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
                isActive={isOpen && !isWorkItemView}
                formatDateTime={formatDateTime}
                onChanged={handleSubTaskContentChanged}
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
                onRefresh={handleSubTaskContentChanged}
              />
            </section>
          </>
        )}
      </ModalBody>
    </Modal>
  );
}
