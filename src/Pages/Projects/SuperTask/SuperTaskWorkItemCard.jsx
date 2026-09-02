import React from "react";
import SuperTaskUserAvatar from "./SuperTaskUserAvatar";
import { getContrastText, getReviewMeta } from "./superTask.utils";

const MAX_VISIBLE_TAGS = 3;

const formatTrackedTime = (value) => {
  const parsed = Number(value);
  const totalSeconds = Number.isFinite(parsed)
    ? Math.max(0, Math.floor(parsed))
    : 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (part) => String(part).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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

export default function SuperTaskWorkItemCard({ item, onOpen }) {
  const title = item?.title || "Untitled Work Item";
  const description = item?.description || "No description";
  const assignee = item?.assigned_user || null;
  const assigneeName = assignee?.name || "Unassigned";
  const workRoleName = assignee?.work_role?.name || "";
  const status = getReviewMeta(item?.review_status);
  const tags = Array.isArray(item?.tags) ? item.tags : [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagCount = Math.max(0, tags.length - visibleTags.length);
  const trackedSeconds = Number(item?.time_tracking?.total_time);
  const hasTrackedTime = Number.isFinite(trackedSeconds) && trackedSeconds > 0;
  const hasActiveTracker = Boolean(item?.time_tracking?.active_tracker);
  const isActionable = typeof onOpen === "function";
  const CardElement = isActionable ? "button" : "article";
  const avatarUser = assignee || { name: "Unassigned" };
  const avatarTitle = workRoleName
    ? `${assigneeName} — ${workRoleName}`
    : assigneeName;

  return (
    <CardElement
      className={`super-task-work-item-card ${isActionable ? "is-actionable" : ""}`}
      {...(isActionable
        ? {
            type: "button",
            onClick: () => onOpen(item),
            "aria-label": `Open ${title}`,
          }
        : {})}
    >
      <SuperTaskUserAvatar
        user={avatarUser}
        size={40}
        title={avatarTitle}
        useGeneratedFallback={false}
      />

      <span className="super-task-work-item-card__content">
        <span className="super-task-work-item-card__head">
          <span className="super-task-work-item-card__copy">
            <strong title={title} dir="auto">{title}</strong>
            <span
              className="super-task-work-item-card__description"
              title={description}
              dir="auto"
            >
              {description}
            </span>
          </span>

          <span className={`super-task-status is-${status.tone}`}>
            {status.label}
          </span>

          <span
            className="super-task-work-item-card__chevron"
            title="Open Work Item"
            aria-hidden="true"
          >
            <i className="ti ti-chevron-right" />
          </span>
        </span>

        {(workRoleName || tags.length || hasTrackedTime || hasActiveTracker) ? (
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

            {(hasTrackedTime || hasActiveTracker) ? (
              <span
                className={`super-task-work-item-card__tracking ${hasActiveTracker ? "is-active" : ""}`}
                title={hasActiveTracker ? "Tracking is active" : "Total tracked time"}
              >
                <i className="ti ti-clock" aria-hidden="true" />
                {hasTrackedTime ? formatTrackedTime(trackedSeconds) : "Tracking"}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
    </CardElement>
  );
}
