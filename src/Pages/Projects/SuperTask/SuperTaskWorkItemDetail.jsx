import React from "react";
import { Spinner } from "reactstrap";
import TaskActivityConversation from "../../../Components/taskDetailModal/TaskActivityConversation";
import TaskAttachments from "../../../Components/taskDetailModal/TaskAttachments";
import SuperTaskInlineTextField from "./SuperTaskInlineTextField";
import SuperTaskWorkItemSidebar from "./SuperTaskWorkItemSidebar";
import { formatDateTime } from "./superTask.utils";

export default function SuperTaskWorkItemDetail({
  isActive,
  projectId,
  taskId,
  subTaskId,
  workItem,
  resourceBasePath,
  projectMembers,
  projectTags,
  timeline,
  timelineLoading,
  savingField,
  onUpdate,
  onContentChanged,
  onTrackerChanged,
}) {
  const canEdit = Boolean(workItem?.capabilities?.can_edit);

  return (
    <div className="row g-0 flex-wrap-reverse super-task-work-item-detail">
      <main className="col-12 col-lg-8 task-detail-modal__main super-task-work-item-detail__main">
        <section className="super-task-item-modal__editor">
          <SuperTaskInlineTextField
            kind="title"
            value={workItem.title}
            placeholder="Work Item title"
            canEdit={canEdit}
            saving={Boolean(savingField)}
            onCommit={(value) => onUpdate("title", value)}
            className="super-task-inline-editor--modal-title"
          />
          <SuperTaskInlineTextField
            value={workItem.description || ""}
            placeholder={
              canEdit
                ? "Click to add a description"
                : "No description has been added yet."
            }
            canEdit={canEdit}
            saving={Boolean(savingField)}
            onCommit={(value) =>
              onUpdate("description", value.trim() || null)
            }
            className="super-task-inline-editor--modal-description"
          />

          {workItem.rejection_note ? (
            <div className="super-task-rejection-note">
              <i className="ti ti-message-exclamation" aria-hidden="true" />
              <span>{workItem.rejection_note}</span>
            </div>
          ) : null}
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
            inputId={`work-item-attachment-file-${workItem.id}`}
            syncBoardCounts={false}
            isActive={isActive}
            formatDateTime={formatDateTime}
            onChanged={onContentChanged}
          />
        </section>

        <section className="super-task-item-modal__section">
          {timelineLoading ? (
            <div className="d-flex align-items-center gap-2 text-muted small mb-2">
              <Spinner size="sm" /> Refreshing Work Item activity...
            </div>
          ) : null}
          <TaskActivityConversation
            projectId={projectId}
            taskId={taskId}
            resourceBasePath={resourceBasePath}
            activities={timeline.activities}
            comments={timeline.comments}
            projectMembers={projectMembers}
            onRefresh={onContentChanged}
          />
        </section>
      </main>

      <aside className="col-12 col-lg-4">
        <SuperTaskWorkItemSidebar
          isActive={isActive}
          projectId={projectId}
          taskId={taskId}
          subTaskId={subTaskId}
          workItem={workItem}
          projectMembers={projectMembers}
          projectTags={projectTags}
          savingField={savingField}
          onUpdate={onUpdate}
          onTrackerChanged={onTrackerChanged}
        />
      </aside>
    </div>
  );
}
