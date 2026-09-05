import React from "react";
import SuperTaskDeleteMenu from "./SuperTaskDeleteMenu";
import SuperTaskUserAvatar from "./SuperTaskUserAvatar";
import { getContrastText, getReviewMeta } from "./superTask.utils";
import "./superTaskWorkItemActions.css";

const MAX_VISIBLE_TAGS = 3;

const getDueDateMeta = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return {
    compact: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date),
    full: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
    isOverdue: date.getTime() < Date.now(),
  };
};

function WorkItemTag({ tag }) {
  const name = String(tag?.name || "Tag");
  const color = String(tag?.color || "").trim();

  return (
    <span
      className="badge super-task-work-item-card__tag"
      style={{
        background: color || "rgba(var(--primary), 0.12)",
        color: color ? getContrastText(color) : "rgba(var(--primary), 1)",
      }}
      title={name}
    >
      {!color ? (
        <span className="super-task-work-item-card__tag-dot" aria-hidden="true" />
      ) : null}
      <span className="text-truncate" dir="auto">{name}</span>
    </span>
  );
}

export default function SuperTaskWorkItemCard({
  item,
  onOpen,
  onDelete,
  deleting = false,
}) {
  const title = item?.title || "Untitled Work Item";
  const description = item?.description || "No description";
  const assignee = item?.assigned_user || null;
  const assigneeName = assignee?.name || "Unassigned";
  const workRoleName = assignee?.work_role?.name || "";
  const status = getReviewMeta(item?.review_status);
  const tags = Array.isArray(item?.tags) ? item.tags : [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagCount = Math.max(0, tags.length - visibleTags.length);
  const dueDate = getDueDateMeta(item?.due_at);
  const attachmentCount = Math.max(0, Number(item?.attachments_count) || 0);
  const voiceCount = Math.max(0, Number(item?.voice_count) || 0);
  const canOpen = typeof onOpen === "function";
  const avatarUser = assignee || { name: "Unassigned" };
  const avatarTitle = workRoleName
    ? `${assigneeName} — ${workRoleName}`
    : assigneeName;

  return (
    <article className="super-task-work-item-card">
      <SuperTaskUserAvatar
        user={avatarUser}
        size={40}
        title={avatarTitle}
      />

      <span className="super-task-work-item-card__content">
        <span
          className={`super-task-work-item-card__head ${
            item?.capabilities?.can_delete === true ? "has-actions" : ""
          }`}
        >
          <strong title={title} dir="auto">{title}</strong>

          <span className={`super-task-status is-${status.tone}`}>
            {status.label}
          </span>

          {item?.capabilities?.can_delete === true ? (
            <SuperTaskDeleteMenu
              itemLabel={title}
              onDelete={() => onDelete?.(item)}
              disabled={deleting}
            />
          ) : null}

          <button
            type="button"
            className="super-task-work-item-card__chevron"
            title="Open Work Item"
            aria-label={`Open ${title}`}
            disabled={!canOpen || deleting}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (canOpen && !deleting) onOpen(item);
            }}
          >
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </span>

        <span
          className="super-task-work-item-card__description"
          title={description}
          dir="auto"
        >
          {description}
        </span>

        {(workRoleName || tags.length || dueDate || attachmentCount || voiceCount) ? (
          <span className="super-task-work-item-card__meta">
            <span className="super-task-work-item-card__meta-left">
              {workRoleName ? (
                <span className="super-task-work-item-card__role" title={avatarTitle}>
                  <i className="ti ti-briefcase" aria-hidden="true" />
                  {workRoleName}
                </span>
              ) : null}

              {visibleTags.length ? (
                <span className="super-task-work-item-card__tags">
                  {visibleTags.map((tag, index) => (
                    <WorkItemTag
                      key={tag?.id ?? `${tag?.name || "tag"}-${index}`}
                      tag={tag}
                    />
                  ))}
                  {remainingTagCount ? (
                    <span
                      className="super-task-work-item-card__tag-overflow"
                      title={`${remainingTagCount} more tag${remainingTagCount === 1 ? "" : "s"}`}
                    >
                      +{remainingTagCount}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </span>

            <span className="super-task-work-item-card__meta-right">
              {dueDate ? (
                <span
                  className={`super-task-work-item-card__due ${dueDate.isOverdue ? "is-overdue" : ""}`}
                  title={`Due ${dueDate.full}`}
                >
                  <i className="ti ti-calendar" aria-hidden="true" />
                  {dueDate.compact}
                </span>
              ) : null}

              {attachmentCount ? (
                <span
                  className="super-task-work-item-card__media-count"
                  title={`${attachmentCount} file attachment${attachmentCount === 1 ? "" : "s"}`}
                  aria-label={`${attachmentCount} file attachment${attachmentCount === 1 ? "" : "s"}`}
                >
                  <i className="ti ti-paperclip" aria-hidden="true" />
                  {attachmentCount}
                </span>
              ) : null}

              {voiceCount ? (
                <span
                  className="super-task-work-item-card__media-count"
                  title={`${voiceCount} voice attachment${voiceCount === 1 ? "" : "s"}`}
                  aria-label={`${voiceCount} voice attachment${voiceCount === 1 ? "" : "s"}`}
                >
                  <i className="ti ti-microphone" aria-hidden="true" />
                  {voiceCount}
                </span>
              ) : null}
            </span>
          </span>
        ) : null}
      </span>
    </article>
  );
}
