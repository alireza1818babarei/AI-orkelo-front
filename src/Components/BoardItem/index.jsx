import React, {useEffect, useState} from 'react';
import {getTextDirectionProps} from '../../utils/textDirection';

const TASK_PRIORITY_META = {
  low: {
    label: 'Low',
    background: '#B0EECD',
  },
  medium: {
    label: 'Medium',
    background: '#7FE4E4',
  },
  high: {
    label: 'High',
    background: '#f97316',
  },
  urgent: {
    label: 'Urgent',
    background: '#dc3545',
  },
};

const getTaskPriorityMeta = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  const key = Object.prototype.hasOwnProperty.call(TASK_PRIORITY_META, normalized)
    ? normalized
    : null;

  return key
    ? {
        value: key,
        ...TASK_PRIORITY_META[key],
      }
    : null;
};

const BoardItem = ({
                     taskId,
                     taskTitle,
                     taskBody,
                     taskDate,
                     taskFileAttachCount,
                     taskChecklistCompletedCount,
                     taskChecklistTotalCount,
                      taskTags,
                      taskPriority,
                     taskRating,
                      taskUserImg,
                     taskUsers = [],
                     taskKindLabel = '',
                     taskReviewStatus = 'active',
                     isCompleted = false,
                     innerRef,
                     className = '',
                     style,
                     ...rest
                   }) => {
  const normalizedTaskUserImg = String(taskUserImg || '').trim();
  const normalizedReviewStatus = String(taskReviewStatus || 'active')
    .trim()
    .toLowerCase();
  const isPendingReview = normalizedReviewStatus === 'pending_approval';
  const isRejectedReview = normalizedReviewStatus === 'rejected';
  const [showTaskUserImg, setShowTaskUserImg] = useState(
    Boolean(normalizedTaskUserImg)
  );
  const [failedTaskUserImages, setFailedTaskUserImages] = useState(() => new Set());

  useEffect(() => {
    setShowTaskUserImg(Boolean(normalizedTaskUserImg));
  }, [normalizedTaskUserImg]);

  const normalizedTaskUsers = (Array.isArray(taskUsers) ? taskUsers : [])
    .filter((user) => user && typeof user === 'object')
    .map((user, index) => ({
      ...user,
      key: String(user.id ?? user.email ?? user.name ?? index),
      avatar: String(user.avatar || '').trim(),
    }));
  const visibleTaskUsers = normalizedTaskUsers.slice(0, 3);
  const hiddenTaskUserCount = Math.max(normalizedTaskUsers.length - visibleTaskUsers.length, 0);
  const hasTaskUsers = visibleTaskUsers.length > 0;
  const hasAnyTaskUser = hasTaskUsers || showTaskUserImg;

  useEffect(() => {
    setFailedTaskUserImages(new Set());
  }, [normalizedTaskUsers.map((user) => `${user.key}:${user.avatar}`).join('|')]);

  const normalizeTags = (value) => {
    const v = value?.data ?? value ?? [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({name}));
    }
    return [];
  };

  const tags = normalizeTags(taskTags);
  const priority = getTaskPriorityMeta(taskPriority);
  const showPriorityCue = Boolean(priority) && !isCompleted;
  const taskDateText = String(taskDate ?? '').trim();
  const taskFileAttachCountText = String(taskFileAttachCount ?? '').trim();
  const taskFileAttachCountNumber = Number(taskFileAttachCountText);
  const normalizeCount = (value) => {
    const count = Number(value);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  };
  const normalizeRating = (value) => {
    const rating = Number(value);
    if (!Number.isFinite(rating)) return null;
    const rounded = Math.trunc(rating);
    return rounded >= 1 && rounded <= 5 ? rounded : null;
  };
  const checklistTotalCount = normalizeCount(taskChecklistTotalCount);
  const checklistCompletedCount = Math.min(
    normalizeCount(taskChecklistCompletedCount),
    checklistTotalCount,
  );
  const normalizedRating = normalizeRating(taskRating);
  const showTaskChecklistProgress = checklistTotalCount > 0;
  const showTaskRating = normalizedRating !== null;
  const showTaskDate = Boolean(taskDateText);
  const showTaskFileAttachCount =
    Boolean(taskFileAttachCountText) &&
    (!Number.isFinite(taskFileAttachCountNumber) ||
      taskFileAttachCountNumber > 0);
  const showTaskMeta =
    showTaskDate ||
    showTaskFileAttachCount ||
    showTaskChecklistProgress ||
    showTaskRating;
  const getTagName = (t) =>
    t?.name ?? t?.title ?? t?.label ?? t?.text ?? String(t ?? '');
  const getTagColor = (t) => String(t?.color ?? t?.hex ?? '').trim();
  const taskTitleDirectionProps = getTextDirectionProps(taskTitle, {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  });
  const taskBodyDirectionProps = getTextDirectionProps(taskBody, {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  });

  const getContrastText = (hex) => {
    const raw = String(hex || '').trim();
    if (!raw) return '#111';
    const m = raw.startsWith('#') ? raw.slice(1) : raw;
    const full =
      m.length === 3
        ? m
          .split('')
          .map((c) => c + c)
          .join('')
        : m;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return '#fff';
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    const y = (r * 299 + g * 587 + b * 114) / 1000;
    return y >= 170 ? '#111' : '#fff';
  };
  return (
    <div
      ref={innerRef}
      className={`board-item ${className}`}
      style={style}
      {...rest}
    >
      <div
        className={`board-item-content position-relative ${
          isCompleted ? 'board-item-content--completed' : ''
        } ${
          hasAnyTaskUser ? 'board-item-content--has-assignee-img' : ''
        } ${
          !showPriorityCue ? 'board-item-content--without-priority' : ''
        }`}
        style={
          showPriorityCue
            ? {'--board-item-priority-color': priority.background}
            : undefined
        }
      >
        {showPriorityCue ? (
          <div
            className={`board-item-priority-cue board-item-priority-cue--${priority.value}`}
            aria-label={`Priority: ${priority.label}`}
            title={`${priority.label} priority`}
          >
            <span className="board-item-priority-cue__label">
              {priority.label} priority
            </span>
          </div>
        ) : null}

        {isPendingReview ? (
          <div
            className="box-ribbon box-right board-item-status-ribbon board-item-waiting-ribbon"
            title="Waiting"
            aria-label="Waiting"
          >
            <div className="ribbonbox ribbon-warning">
              <span className="f-s-10">Waiting</span>
            </div>
          </div>
        ) : null}

        {isRejectedReview ? (
          <div
            className="box-ribbon box-right board-item-status-ribbon board-item-rejected-ribbon"
            title="Rejected"
            aria-label="Rejected"
          >
            <div className="ribbonbox ribbon-danger">
              <span className="f-s-10">Rejected</span>
            </div>
          </div>
        ) : null}

        {isCompleted ? (
          <div
            className="box-ribbon box-right board-item-status-ribbon board-item-completed-ribbon"
            title="Approved"
            aria-label="Approved"
          >
            <div className="ribbonbox ribbon-success">
              <span className="f-s-10">Approved</span>
            </div>
          </div>
        ) : null}

        <div className="gap-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center gap-2">
            <div>
              {taskKindLabel ? (
                <span className="board-item-kind-badge">
                  <i className="ti ti-hierarchy-3" aria-hidden="true"></i>
                  {taskKindLabel}
                </span>
              ) : null}
              {taskId ? (
                <div
                  className="board-item-id position-absolute bottom-0 f-s-11"
                  style={{right: 5}}
                >
                  #<span className="fw-semibold">{taskId}</span>
                </div>
              ) : null}
              <div
                className="f-w-500 f-s-15 board-item-title text-break capitalized text-muted"
                {...taskTitleDirectionProps}
              >
                {taskTitle}
              </div>
            </div>

            {hasTaskUsers ? (
              <div className="board-item-participants" aria-label="Super Task participants">
                {visibleTaskUsers.map((user) => {
                  const showAvatar = user.avatar && !failedTaskUserImages.has(user.key);
                  const initial = String(user.name || user.email || '?').trim().charAt(0).toUpperCase();

                  return (
                    <div
                      key={user.key}
                      className="board-item-participant"
                      title={user.name || user.email || 'Participant'}
                    >
                      {showAvatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="img-fluid"
                          onError={() => {
                            setFailedTaskUserImages((current) => {
                              const next = new Set(current);
                              next.add(user.key);
                              return next;
                            });
                          }}
                        />
                      ) : (
                        <span aria-hidden="true">{initial}</span>
                      )}
                    </div>
                  );
                })}
                {hiddenTaskUserCount > 0 ? (
                  <div
                    className="board-item-participant board-item-participant--overflow"
                    title={`${hiddenTaskUserCount} more participant${hiddenTaskUserCount === 1 ? '' : 's'}`}
                    aria-label={`${hiddenTaskUserCount} more participants`}
                  >
                    +{hiddenTaskUserCount}
                  </div>
                ) : null}
              </div>
            ) : showTaskUserImg ? (
              <div className="d-flex align-items-center gap-1">
                <div className="h-40 w-40 d-flex-center b-r-50 overflow-hidden text-bg-primary">
                  <img
                    src={normalizedTaskUserImg}
                    alt=""
                    className="img-fluid"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={() => {
                      setShowTaskUserImg(false);
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <div
              className="small f-s-13 board-item-desc mt-2"
              {...taskBodyDirectionProps}
              title={taskBody || ''}
            >
              {taskBody || ''}
            </div>
          </div>

          {tags.length ? (
            <div className="board-item-tags-row d-flex flex-wrap gap-1">
              {tags.map((t, idx) => {
                const tagName = getTagName(t);
                const tagColor = getTagColor(t);

                return (
                  <span
                    key={t?.id ?? `${tagName}-${idx}`}
                    className="badge d-inline-flex align-items-center gap-1"
                    style={{
                      maxWidth: 140,
                      fontSize: 11,
                      borderRadius: 12,
                      padding: '0.2rem 0.6rem',
                      background: tagColor
                        ? tagColor
                        : 'rgba(var(--primary), 0.12)',
                      color: tagColor
                        ? getContrastText(tagColor)
                        : 'rgba(var(--primary), 1)',
                    }}
                    title={tagName}
                  >
                      {tagColor ? null : (
                        <span
                          aria-hidden="true"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: 'rgba(var(--primary), 0.8)',
                            flex: '0 0 8px',
                          }}
                        />
                      )}
                    <span
                      className="text-truncate d-inline-block"
                      {...getTextDirectionProps(tagName, {maxWidth: 110})}
                    >
                        {tagName}
                      </span>
                  </span>
                );
              })}
            </div>
          ) : null}

          {showTaskMeta ? (
            <div className="board-item-meta">
              {showTaskDate ? (
                <span className="board-item-meta-item board-item-meta-item--date">
                  <i className="ti ti-calendar board-item-meta-icon"></i>
                  <span className="f-s-14">{taskDateText}</span>
                </span>
              ) : null}

              <div className="board-item-meta-secondary">
                {showTaskRating ? (
                  <span
                    className="board-item-meta-item board-item-meta-item--rating"
                    title={`Rating: ${normalizedRating}/5`}
                    aria-label={`Rating: ${normalizedRating}/5`}
                  >
                    <i className="ti ti-star-filled board-item-meta-icon"></i>
                    <span className="board-item-rating-value">{normalizedRating}/5</span>
                  </span>
                ) : null}

                {showTaskFileAttachCount ? (<span className="board-item-meta-item">
                <i className="ti ti-paperclip board-item-meta-icon"></i>
                <span className="f-s-14">{taskFileAttachCountText}</span>
                </span>
                ) : null}

                {showTaskChecklistProgress ? (
                  <span
                    className="board-item-meta-item"
                    title={`${checklistCompletedCount} of ${checklistTotalCount} checklist items checked`}
                    aria-label={`${checklistCompletedCount} of ${checklistTotalCount} checklist items checked`}
                  >
                    <i className="ti ti-list-check board-item-meta-icon"></i>
                      <span className="f-s-14">
                        {checklistCompletedCount}/{checklistTotalCount}
                      </span>
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BoardItem;
