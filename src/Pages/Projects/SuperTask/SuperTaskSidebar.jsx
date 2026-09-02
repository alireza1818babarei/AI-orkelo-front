import React from "react";
import TaskPriorityDropdown from "../../../Components/taskDetailModal/TaskPriorityDropdown";
import TaskTagsDropdown from "../../../Components/taskDetailModal/TaskTagsDropdown";
import TaskWatchersDropdown from "../../../Components/taskDetailModal/TaskWatchersDropdown";
import { formatDateTime } from "./superTask.utils";
import SuperTaskUserAvatar from "./SuperTaskUserAvatar";

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export default function SuperTaskSidebar({
  task,
  projectId,
  taskId,
  savingField,
  onUpdateField,
  onTagsChanged,
  onWatchersChanged,
}) {
  return (
    <aside className="super-task-sidebar">
      <section>
        <h6>Planning</h6>
        <label className="super-task-sidebar-row">
          <span><i className="ti ti-calendar-event" aria-hidden="true" /> Due date</span>
          <input
            type="date"
            value={toDateInputValue(task?.due_at)}
            onChange={(event) => onUpdateField("due_at", event.target.value || null)}
            disabled={savingField === "due_at" || !task?.capabilities?.can_edit}
          />
        </label>
        <div className="super-task-sidebar-control">
          <TaskPriorityDropdown
            value={task?.priority}
            saving={savingField === "priority"}
            disabled={!task?.capabilities?.can_edit}
            onChange={(value) => onUpdateField("priority", value)}
          />
        </div>
        <div className="super-task-sidebar-control">
          <TaskTagsDropdown
            projectId={projectId}
            taskId={taskId}
            selectedTags={task?.tags || []}
            disabled={!task?.capabilities?.can_edit}
            onChanged={onTagsChanged}
          />
        </div>
      </section>

      <section>
        <h6>People</h6>
        <div className="super-task-sidebar-control">
          <TaskWatchersDropdown
            projectId={projectId}
            columnId={task?.column?.id}
            taskId={taskId}
            disabled={!task?.capabilities?.can_edit}
            onChanged={onWatchersChanged}
          />
          <div className="super-task-watchers">
            {(task?.watchers || []).slice(0, 5).map((watcher) => (
              <SuperTaskUserAvatar key={watcher.id} user={watcher} size={30} />
            ))}
            {(task?.watchers || []).length > 5 ? <span>+{task.watchers.length - 5}</span> : null}
          </div>
        </div>
      </section>

      <section>
        <h6>More Details</h6>
        <div className="super-task-sidebar-row is-static">
          <span><i className="ti ti-square-check" aria-hidden="true" /> Created</span>
          <strong>{formatDateTime(task?.created_at)}</strong>
        </div>
        <div className="super-task-sidebar-row is-static">
          <span><i className="ti ti-pin" aria-hidden="true" /> Updated</span>
          <strong>{formatDateTime(task?.updated_at)}</strong>
        </div>
        <div className="super-task-sidebar-row is-static">
          <span><i className="ti ti-id" aria-hidden="true" /> Task ID</span>
          <strong>#{task?.id}</strong>
        </div>
      </section>
    </aside>
  );
}
