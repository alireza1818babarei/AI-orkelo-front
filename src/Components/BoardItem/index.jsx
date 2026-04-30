import React, { useEffect, useState } from 'react';
import { getTextDirectionProps } from '../../utils/textDirection';

const BoardItem = ({
  taskId,
  taskTitle,
  taskBody,
  taskDate,
  taskFileAttachCount,
  taskChecklistCompletedCount,
  taskChecklistTotalCount,
  taskTags,
  taskUserImg,
  isCompleted = false,
  innerRef,
  className = '',
  style,
  ...rest
}) => {
  const normalizedTaskUserImg = String(taskUserImg || '').trim();
  const [showTaskUserImg, setShowTaskUserImg] = useState(
    Boolean(normalizedTaskUserImg)
  );

  useEffect(() => {
    setShowTaskUserImg(Boolean(normalizedTaskUserImg));
  }, [normalizedTaskUserImg]);

  const normalizeTags = (value) => {
    const v = value?.data ?? value ?? [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
    }
    return [];
  };

  const tags = normalizeTags(taskTags);
  const taskDateText = String(taskDate ?? '').trim();
  const taskFileAttachCountText = String(taskFileAttachCount ?? '').trim();
  const taskFileAttachCountNumber = Number(taskFileAttachCountText);
  const normalizeCount = (value) => {
    const count = Number(value);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  };
  const checklistTotalCount = normalizeCount(taskChecklistTotalCount);
  const checklistCompletedCount = Math.min(
    normalizeCount(taskChecklistCompletedCount),
    checklistTotalCount,
  );
  const showTaskChecklistProgress = checklistTotalCount > 0;
  const showTaskDate = Boolean(taskDateText);
  const showTaskFileAttachCount =
    Boolean(taskFileAttachCountText) &&
    (!Number.isFinite(taskFileAttachCountNumber) ||
      taskFileAttachCountNumber > 0);
  const showTaskMeta =
    showTaskDate || showTaskFileAttachCount || showTaskChecklistProgress;
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
      <div className='board-item-content position-relative'>
        {isCompleted ? (
          <div
            className='box-ribbon box-right board-item-completed-ribbon'
            title='Completed'
            aria-label='Completed'
          >
            <div className='ribbonbox ribbon-success'>
              <span className='f-s-10'>Completed</span>
            </div>
          </div>
        ) : null}

        <div className='gap-1 d-flex flex-column'>
          <div className='d-flex justify-content-between align-items-center gap-2'>
            <div>
              {taskId ? (
                <div
                  className='board-item-id position-absolute bottom-0 f-s-11'
                  style={{ right: 5 }}
                >
                  #<span className='fw-semibold'>{taskId}</span>
                </div>
              ) : null}
              <div
                className='f-w-500 f-s-15 board-item-title text-break capitalized text-muted'
                {...taskTitleDirectionProps}
              >
                {taskTitle}
              </div>
            </div>

            {showTaskUserImg ? (
              <div className='d-flex align-items-center gap-1'>
                <div className='h-40 w-40 d-flex-center b-r-50 overflow-hidden text-bg-primary'>
                  <img
                    src={normalizedTaskUserImg}
                    alt=''
                    className='img-fluid'
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
              className='small f-s-13 board-item-desc mt-2'
              {...taskBodyDirectionProps}
              title={taskBody || ''}
            >
              {taskBody || ''}
            </div>
          </div>

          <div className='d-flex flex-wrap gap-1'>
            {tags.length
              ? tags.map((t, idx) => {
                  const tagName = getTagName(t);
                  const tagColor = getTagColor(t);

                  return (
                    <span
                      key={t?.id ?? `${tagName}-${idx}`}
                      className='badge d-inline-flex align-items-center gap-1'
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
                          aria-hidden='true'
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
                        className='text-truncate d-inline-block'
                        {...getTextDirectionProps(tagName, { maxWidth: 110 })}
                      >
                        {tagName}
                      </span>
                    </span>
                  );
                })
              : null}
          </div>

          {showTaskMeta ? (
            <div className='d-flex align-items-center justify-content-between'>
              <div className='board-item-meta d-flex align-items-center flex-wrap gap-2'>
                {showTaskDate ? (
                  <span className='board-item-meta-item'>
                    <i className='ti ti-calendar board-item-meta-icon'></i>{' '}
                    <span className='f-s-14'>{taskDateText}</span>
                  </span>
                ) : null}
                {showTaskFileAttachCount ? (
                  <span className='board-item-meta-item'>
                    <i className='ti ti-unlink board-item-meta-icon'></i>{' '}
                    <span className='f-s-14'>{taskFileAttachCountText}</span>
                  </span>
                ) : null}
                {showTaskChecklistProgress ? (
                  <span
                    className='board-item-meta-item'
                    title={`${checklistCompletedCount} of ${checklistTotalCount} checklist items checked`}
                    aria-label={`${checklistCompletedCount} of ${checklistTotalCount} checklist items checked`}
                  >
                    <i className='ti ti-list-check board-item-meta-icon'></i>{' '}
                    <span className='f-s-14'>
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
