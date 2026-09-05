import React from "react";
import { getReviewMeta, REVIEW_STATUS } from "./superTask.utils";
import SuperTaskDeleteMenu from "./SuperTaskDeleteMenu";
import SuperTaskRoleStages from "./SuperTaskRoleStages";
import "./superTaskVoice.css";
import "./superTaskSubTaskRow.css";

export default function SuperTaskSubTaskRow({
  item,
  onOpen,
  onDelete,
  deleting = false,
}) {
  const status = getReviewMeta(item?.review_status);
  const isApproved = item?.review_status === REVIEW_STATUS.APPROVED;

  return (
    <article
      className={`super-task-subtask-row ${
        item?.capabilities?.can_delete === true ? "has-actions" : ""
      }`}
    >
      <span className={`super-task-subtask-row__state is-${status.tone}`}>
        <i
          className={isApproved ? "ti ti-check" : status.icon}
          aria-hidden="true"
        />
      </span>
      <div className="super-task-subtask-row__main">
        <strong>{item?.title || "Untitled Sub-task"}</strong>
        <p>{item?.description || "No description"}</p>
      </div>
      <div className="super-task-subtask-row__stages">
        <SuperTaskRoleStages stages={item?.work_role_stages} />
      </div>
      <span className={`super-task-status is-${status.tone}`}>{status.label}</span>
      {item?.capabilities?.can_delete === true ? (
        <SuperTaskDeleteMenu
          itemLabel={item?.title || "Sub-task"}
          onDelete={() => onDelete?.(item)}
          disabled={deleting}
        />
      ) : null}
      <button
        type="button"
        className="super-task-icon-button super-task-subtask-row__open"
        onClick={(event) => {
          event.stopPropagation();
          onOpen?.(item.id);
        }}
        title="Open Sub-task"
        aria-label={`Open ${item?.title || "Sub-task"}`}
      >
        <i className="ti ti-external-link" aria-hidden="true" />
      </button>
    </article>
  );
}
