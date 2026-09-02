import React from "react";
import { getReviewMeta } from "./superTask.utils";
import SuperTaskRoleStages from "./SuperTaskRoleStages";

export default function SuperTaskSubTaskRow({ item, onOpen }) {
  const status = getReviewMeta(item?.review_status);

  return (
    <article className="super-task-subtask-row">
      <span className={`super-task-subtask-row__state is-${status.tone}`}>
        <i className={status.icon} aria-hidden="true" />
      </span>
      <div className="super-task-subtask-row__main">
        <strong>{item?.title || "Untitled Sub-task"}</strong>
        <p>{item?.description || "No description"}</p>
      </div>
      <div className="super-task-subtask-row__stages">
        <SuperTaskRoleStages stages={item?.work_role_stages} />
      </div>
      <span className={`super-task-status is-${status.tone}`}>{status.label}</span>
      <button
        type="button"
        className="super-task-icon-button"
        onClick={() => onOpen?.(item.id)}
        title="Open Sub-task"
        aria-label={`Open ${item?.title || "Sub-task"}`}
      >
        <i className="ti ti-external-link" aria-hidden="true" />
      </button>
    </article>
  );
}
