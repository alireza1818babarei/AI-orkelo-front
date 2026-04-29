import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from 'reactstrap';
import api from '../../api/axios';
import { alertConfirm, toastError, toastSuccess } from '../../utils/sweetAlert';
import { formatCommentTimestamp } from '../../services/dateTime';
import { resolveUserAvatarWithFallback } from '../../utils/mediaUrl';

const normalizeActionLabel = (action) => {
  const a = String(action || '');
  if (a === 'comment.created') return 'Comment added';
  if (a === 'attachment.uploaded') return 'Attachment uploaded';
  if (a === 'checklist_item.created') return 'Checklist item added';
  if (a === 'checklist_item.completed') return 'Checklist item completed';
  if (a === 'checklist_item.deleted') return 'Checklist item deleted';
  if (a === 'tracker_expired') return 'Timer expired';
  if (a === 'task.created') return 'Task created';
  if (a === 'task.completed') return 'Task completed';
  if (a === 'task.assignee.assigned') return 'Assignee assigned';
  if (a === 'task.assignee.changed') return 'Assignee changed';
  if (a === 'task.assignee.cleared') return 'Assignee cleared';
  return a || 'Activity';
};

const resolveActivityUi = (action) => {
  const a = String(action || '').toLowerCase();
  if (a.includes('deleted')) {
    return {
      iconClass: 'ti ti-trash',
      titleClass: 'text-danger',
      iconWrapClass: 'text-light-danger',
      contentClass: 'bg-light-danger b-1-danger',
    };
  }
  if (a.includes('completed') || a.includes('checked') || a.includes('done')) {
    return {
      iconClass: 'ti ti-circle-check',
      titleClass: 'text-success',
      iconWrapClass: 'text-light-success',
      contentClass: 'bg-light-success b-1-success',
    };
  }
  if (a.includes('attachment')) {
    return {
      iconClass: 'ti ti-paperclip',
      titleClass: 'text-primary',
      iconWrapClass: 'text-light-primary',
      contentClass: 'bg-light-primary b-1-primary',
    };
  }
  if (a.includes('comment')) {
    return {
      iconClass: 'ti ti-message-circle',
      titleClass: 'text-info',
      iconWrapClass: 'text-light-info',
      contentClass: 'bg-light-info b-1-info',
    };
  }
  if (a.includes('checklist')) {
    return {
      iconClass: 'ti ti-list-check',
      titleClass: 'text-secondary',
      iconWrapClass: 'text-light-secondary',
      contentClass: 'bg-light-secondary b-1-secondary',
    };
  }
  if (a === 'tracker_expired') {
    return {
      iconClass: 'ti ti-alert-triangle',
      titleClass: 'text-danger',
      iconWrapClass: 'text-light-danger',
      contentClass: 'bg-light-danger b-1-danger',
    };
  }
  if (a === 'task.assignee.cleared') {
    return {
      iconClass: 'ti ti-user-x',
      titleClass: 'text-warning',
      iconWrapClass: 'text-light-warning',
      contentClass: 'bg-light-warning b-1-warning',
    };
  }
  if (a.includes('assignee')) {
    return {
      iconClass: 'ti ti-user-check',
      titleClass: 'text-primary',
      iconWrapClass: 'text-light-primary',
      contentClass: 'bg-light-primary b-1-primary',
    };
  }
  if (a === 'task.created') {
    return {
      iconClass: 'ti ti-plus',
      titleClass: 'text-primary',
      iconWrapClass: 'text-light-primary',
      contentClass: 'bg-light-primary b-1-primary',
    };
  }
  return {
    iconClass: 'ti ti-clock',
    titleClass: 'text-warning',
    iconWrapClass: 'text-light-warning',
    contentClass: 'bg-light-warning b-1-warning',
  };
};

const pickString = (...vals) => {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
};

const lowerFirst = (value) => {
  const text = pickString(value);
  if (!text) return '';
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
};

const flattenChecklistItems = (items = []) => {
  const flat = [];

  const walk = (nodes) => {
    (Array.isArray(nodes) ? nodes : []).forEach((node) => {
      if (!node || typeof node !== 'object') return;
      flat.push(node);
      if (Array.isArray(node.children) && node.children.length) {
        walk(node.children);
      }
    });
  };

  walk(items);
  return flat;
};

const normalizeProperties = (properties) => {
  if (
    !properties ||
    typeof properties !== 'object' ||
    Array.isArray(properties)
  ) {
    return {};
  }

  return properties;
};

const quoteText = (value) => {
  const text = pickString(value);
  return text ? `"${text}"` : '';
};

const buildActivityMessage = (item, checklistItemTextById) => {
  const action = String(item?.action || '').toLowerCase();
  const properties = normalizeProperties(item?.properties);
  const checklistItemId =
    properties?.checklist_item_id ?? properties?.checklistItemId ?? null;
  const checklistText = pickString(
    checklistItemId != null
      ? checklistItemTextById.get(String(checklistItemId))
      : '',
    properties?.checklist_item_text,
    properties?.text,
  );
  const checklistLabel = quoteText(checklistText);
  const attachmentName = quoteText(properties?.original_name);
  const taskTitle = quoteText(properties?.task_text);
  const previousAssigneeName = pickString(
    properties?.previous_assignee_name,
    properties?.previous_assignee?.name,
  );
  const assigneeName = pickString(
    properties?.assignee_name,
    properties?.assignee?.name,
  );
  const nextStatus = pickString(properties?.to).toLowerCase();

  if (action === 'comment.created') return 'added a comment';
  if (action === 'comment.deleted') return 'deleted a comment';
  if (action === 'attachment.uploaded') {
    return attachmentName
      ? `uploaded attachment ${attachmentName}`
      : 'uploaded an attachment';
  }
  if (action === 'attachment.deleted') {
    return attachmentName
      ? `deleted attachment ${attachmentName}`
      : 'deleted an attachment';
  }
  if (action === 'checklist.created') return 'created a checklist';
  if (action === 'checklist.updated') return 'updated the checklist';
  if (action === 'checklist.deleted') return 'deleted the checklist';
  if (action === 'checklist_item.created') {
    return checklistLabel
      ? `added checklist item ${checklistLabel}`
      : 'added a checklist item';
  }
  if (action === 'checklist_item.updated') {
    if (properties?.type === 'reorder') return 'reordered checklist items';
    return checklistLabel
      ? `updated checklist item ${checklistLabel}`
      : 'updated a checklist item';
  }
  if (action === 'checklist_item.completed') {
    return checklistLabel
      ? `completed checklist item ${checklistLabel}`
      : 'completed a checklist item';
  }
  if (action === 'checklist_item.uncompleted') {
    return checklistLabel
      ? `reopened checklist item ${checklistLabel}`
      : 'reopened a checklist item';
  }
  if (action === 'checklist_item.deleted') {
    return checklistLabel
      ? `deleted checklist item ${checklistLabel}`
      : 'deleted a checklist item';
  }
  if (action === 'tracker_started') return 'started the timer';
  if (action === 'tracker_resumed') return 'resumed the timer';
  if (action === 'tracker_stopped') return 'stopped the timer';
  if (action === 'tracker_expired') {
    // Use the backend-provided limit so the message stays accurate if the tracker policy changes.
    const maxDurationHours = Number(properties?.max_duration_hours ?? 24);

    return Number.isFinite(maxDurationHours) && maxDurationHours > 0
      ? `timer expired after ${maxDurationHours} hours`
      : 'timer expired';
  }
  if (action === 'task.created') {
    return taskTitle ? `created the task ${taskTitle}` : 'created the task';
  }
  if (action === 'task.completed') return 'completed the task';
  if (action === 'task.moved') return 'moved the task';
  if (action === 'task.assignee.assigned') {
    return assigneeName
      ? `assigned ${assigneeName} to the task`
      : 'assigned a member to the task';
  }
  if (action === 'task.assignee.changed') {
    if (previousAssigneeName && assigneeName) {
      return `changed assignee from ${previousAssigneeName} to ${assigneeName}`;
    }
    if (assigneeName) return `changed assignee to ${assigneeName}`;
    if (previousAssigneeName) {
      return `changed assignee from ${previousAssigneeName}`;
    }
    return 'changed the task assignee';
  }
  if (action === 'task.assignee.cleared') {
    return previousAssigneeName
      ? `cleared assignee ${previousAssigneeName}`
      : 'cleared the task assignee';
  }
  if (action === 'task.status.changed') {
    if (nextStatus === 'done') return 'completed the task';
    if (nextStatus === 'open') return 'reopened the task';
    return nextStatus
      ? `changed task status to ${nextStatus}`
      : 'changed task status';
  }

  return lowerFirst(normalizeActionLabel(item?.action)) || 'did an activity';
};

const getMemberId = (member) => String(member?.id ?? '');

const getMemberName = (member) =>
  pickString(
    member?.name,
    member?.email,
    getMemberId(member) ? `User ${getMemberId(member)}` : '',
    'User',
  );

const getMemberInitials = (member) => {
  const label = getMemberName(member);
  const parts = label.split(/\s+/).slice(0, 2);
  return parts.map((item) => item[0]?.toUpperCase() ?? '').join('') || 'NA';
};

const normalizeProjectMembers = (members) => {
  const byId = new Map();

  (Array.isArray(members) ? members : []).forEach((member) => {
    const id = member?.id ?? null;
    if (id == null) return;

    const name = getMemberName(member);
    const email = pickString(member?.email);
    const normalized = {
      id,
      name,
      email,
      initials: getMemberInitials(member),
      avatar: resolveUserAvatarWithFallback(
        member?.avatar ?? '',
        id ?? email ?? name,
      ),
    };

    const key = getMemberId(normalized);
    if (!key || byId.has(key)) return;
    byId.set(key, normalized);
  });

  return Array.from(byId.values());
};

const getMentionToken = (member) => `@${getMemberName(member)}`;

const findActiveMention = (text, caretPosition) => {
  const value = String(text ?? '');
  const safeCaret = Math.max(
    0,
    Math.min(Number(caretPosition ?? value.length), value.length),
  );
  const textBeforeCaret = value.slice(0, safeCaret);
  const match = textBeforeCaret.match(/(^|\s)@([^\s@]*)$/);

  if (!match) return null;

  const query = String(match[2] ?? '');
  return {
    query,
    start: safeCaret - query.length - 1,
    end: safeCaret,
  };
};

const filterSelectedMentions = (selectedMembers, text) => {
  const normalizedText = String(text ?? '').toLowerCase();

  return (Array.isArray(selectedMembers) ? selectedMembers : []).filter(
    (member) => normalizedText.includes(getMentionToken(member).toLowerCase()),
  );
};

const shouldShowActivityItem = (item) => {
  const action = String(item?.action || '').toLowerCase();
  if (!action) return true;
  if (action.startsWith('comment.')) return false;
  if (action.includes('comment.created')) return false;
  if (action.includes('comment.deleted')) return false;
  return true;
};

const toDateKey = (raw) => {
  if (!raw) return '-';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};
const truncateText = (value, max = 50) => {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
};
export default function TaskActivityConversation({
  projectId,
  taskId,
  activities = [],
  comments = [],
  checklistItems = [],
  projectMembers = [],
  onRefresh,
}) {
  const authUser = useSelector((s) => s?.auth?.user ?? null);
  const currentUserId = authUser?.id ?? null;
  const currentUserName = pickString(authUser?.name);

  const [view, setView] = useState('all'); // "all" | "conversation"
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentDeletingIds, setCommentDeletingIds] = useState({});
  const [selectedMentionMembers, setSelectedMentionMembers] = useState([]);
  const [mentionState, setMentionState] = useState({
    open: false,
    query: '',
    start: -1,
    end: -1,
    activeIndex: 0,
  });
  const composerRef = useRef(null);
  const textareaRef = useRef(null);

  const showActivity = view === 'all';
  const showComments = view === 'all' || view === 'conversation';
  const mentionMembers = useMemo(
    () => normalizeProjectMembers(projectMembers),
    [projectMembers],
  );
  const mentionSuggestions = useMemo(() => {
    if (!mentionState.open) return [];

    const query = String(mentionState.query || '')
      .trim()
      .toLowerCase();
    const items = mentionMembers.filter((member) => {
      if (!query) return true;

      const haystack = `${member.name} ${member.email}`.toLowerCase();
      return haystack.includes(query);
    });

    return items.slice(0, 8);
  }, [mentionMembers, mentionState.open, mentionState.query]);
  const effectiveMentionMembers = useMemo(
    () => filterSelectedMentions(selectedMentionMembers, commentText),
    [commentText, selectedMentionMembers],
  );

  const activityByDate = useMemo(() => {
    const list = (activities || []).filter(shouldShowActivityItem);
    const map = new Map();
    list.forEach((it) => {
      const key = toDateKey(it?.created_at ?? it?.createdAt ?? it?.timestamp);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    });
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [activities]);

  const activityCount = useMemo(
    () => (activities || []).filter(shouldShowActivityItem).length,
    [activities],
  );
  const checklistItemTextById = useMemo(() => {
    const map = new Map();

    flattenChecklistItems(checklistItems).forEach((item) => {
      const id = item?.id;
      const text = pickString(item?.text);

      if (id == null || !text) return;
      map.set(String(id), text);
    });

    return map;
  }, [checklistItems]);

  const getCommentAuthor = (comment) => {
    const authorId = comment?.user_id ?? comment?.user?.id ?? null;
    const authorName = pickString(
      comment?.user_name,
      comment?.user?.name,
      comment?.name,
    );

    const sameById =
      authorId != null &&
      currentUserId != null &&
      String(authorId) === String(currentUserId);
    const sameByName =
      authorName &&
      currentUserName &&
      authorName.toLowerCase() === currentUserName.toLowerCase();

    if (sameById || sameByName) return pickString(currentUserName, 'You');
    return authorName || 'User';
  };

  const canDeleteComment = (comment) => {
    const commentId = comment?.id ?? null;
    if (commentId == null) return false;

    const authorId = comment?.user_id ?? comment?.user?.id ?? null;
    const authorName = pickString(comment?.user_name, comment?.user?.name);

    const sameById =
      authorId != null &&
      currentUserId != null &&
      String(authorId) === String(currentUserId);
    const sameByName =
      authorName &&
      currentUserName &&
      authorName.toLowerCase() === currentUserName.toLowerCase();

    return sameById || sameByName;
  };

  const closeMentionMenu = () => {
    setMentionState((prev) => ({
      ...prev,
      open: false,
      query: '',
      start: -1,
      end: -1,
      activeIndex: 0,
    }));
  };

  const syncSelectedMentions = (text) => {
    setSelectedMentionMembers((prev) => filterSelectedMentions(prev, text));
  };

  const updateMentionState = (text, caretPosition) => {
    const activeMention = findActiveMention(text, caretPosition);

    if (!activeMention) {
      closeMentionMenu();
      return;
    }

    setMentionState((prev) => ({
      open: true,
      query: activeMention.query,
      start: activeMention.start,
      end: activeMention.end,
      activeIndex:
        prev.open && prev.query === activeMention.query ? prev.activeIndex : 0,
    }));
  };

  const handleCommentChange = (event) => {
    const nextText = event.target.value;
    const nextCaret = event.target.selectionStart ?? nextText.length;

    setCommentText(nextText);
    syncSelectedMentions(nextText);
    updateMentionState(nextText, nextCaret);
  };

  const insertMention = (member) => {
    if (!member) return;

    const start = mentionState.start;
    const end =
      mentionState.end >= mentionState.start
        ? mentionState.end
        : (textareaRef.current?.selectionStart ?? commentText.length);

    if (start < 0 || end < start) return;

    const mentionToken = `${getMentionToken(member)} `;
    const nextText = `${commentText.slice(0, start)}${mentionToken}${commentText.slice(end)}`;
    const nextCaret = start + mentionToken.length;

    setCommentText(nextText);
    setSelectedMentionMembers((prev) => {
      const next = new Map(
        filterSelectedMentions(prev, nextText).map((item) => [
          getMemberId(item),
          item,
        ]),
      );
      next.set(getMemberId(member), member);
      return Array.from(next.values());
    });
    closeMentionMenu();

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const handleCommentKeyDown = (event) => {
    if (mentionState.open && mentionSuggestions.length) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setMentionState((prev) => ({
          ...prev,
          activeIndex:
            prev.activeIndex >= mentionSuggestions.length - 1
              ? 0
              : prev.activeIndex + 1,
        }));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setMentionState((prev) => ({
          ...prev,
          activeIndex:
            prev.activeIndex <= 0
              ? mentionSuggestions.length - 1
              : prev.activeIndex - 1,
        }));
        return;
      }

      if ((event.key === 'Enter' || event.key === 'Tab') && !event.shiftKey) {
        event.preventDefault();
        insertMention(
          mentionSuggestions[mentionState.activeIndex] ?? mentionSuggestions[0],
        );
        return;
      }
    }

    if (mentionState.open && event.key === 'Escape') {
      event.preventDefault();
      closeMentionMenu();
    }
  };

  useEffect(() => {
    if (!mentionState.open) return;

    setMentionState((prev) => {
      const nextIndex = Math.min(
        prev.activeIndex,
        Math.max(mentionSuggestions.length - 1, 0),
      );

      if (nextIndex === prev.activeIndex) return prev;
      return { ...prev, activeIndex: nextIndex };
    });
  }, [mentionSuggestions.length, mentionState.open]);

  useEffect(() => {
    if (!mentionState.open) return;

    const handlePointerDown = (event) => {
      if (composerRef.current?.contains(event.target)) return;
      closeMentionMenu();
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [mentionState.open]);

  useEffect(() => {
    if (showComments) return;
    closeMentionMenu();
  }, [showComments]);

  const submitComment = async () => {
    if (!projectId || !taskId) return;
    const text = commentText.trim();
    if (!text) return;

    try {
      setCommentSubmitting(true);
      const payload = {
        body: text,
      };

      if (effectiveMentionMembers.length) {
        payload.mentioned_user_ids = effectiveMentionMembers.map((member) =>
          Number(member.id),
        );
      }

      await api.post(
        `/projects/${projectId}/tasks/${taskId}/comments`,
        payload,
      );
      setCommentText('');
      setSelectedMentionMembers([]);
      closeMentionMenu();
      onRefresh?.();
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Create comment failed';
      toastError(msg);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const deleteComment = async (comment) => {
    const commentId = comment?.id ?? comment?.comment_id ?? null;
    if (!projectId || !taskId || !commentId) return;

    try {
      const { isConfirmed } = await alertConfirm({
        title: 'Delete comment',
        text: 'Comment will be deleted. Continue?',
        confirmText: 'Delete',
        cancelText: 'No',
      });
      if (!isConfirmed) return;

      const key = String(commentId);
      setCommentDeletingIds((prev) => ({ ...(prev || {}), [key]: true }));

      await api.delete(
        `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
      );
      toastSuccess('Comment Deleted');
      onRefresh?.();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Delete comment failed';
      toastError(msg);
    } finally {
      const key = String(commentId);
      setCommentDeletingIds((prev) => {
        const next = { ...(prev || {}) };
        delete next[key];
        return next;
      });
    }
  };

  const countLabel =
    view === 'conversation'
      ? `${(comments || []).length} comments`
      : `${activityCount} activity | ${(comments || []).length} comments`;

  const viewLabel = view === 'conversation' ? 'Conversations' : 'Activity';

  const commentsBlock = (
    <div className='checklist'>
      <div ref={composerRef} className='task-comment-composer'>
        {mentionState.open ? (
          <div className='task-comment-mention-card'>
            <div className='task-comment-mention-card__title'>
              Mention a project member
            </div>
            {mentionSuggestions.length ? (
              <div className='task-comment-mention-card__list'>
                {mentionSuggestions.map((member, index) => {
                  const active = index === mentionState.activeIndex;

                  return (
                    <button
                      key={member.id}
                      type='button'
                      className={`task-comment-mention-card__item ${
                        active ? 'is-active' : ''
                      }`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        insertMention(member);
                      }}
                    >
                      <span className='task-comment-mention-card__avatar'>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          <span>{member.initials}</span>
                        )}
                      </span>
                      <span className='task-comment-mention-card__meta'>
                        <span className='task-comment-mention-card__name'>
                          {member.name}
                        </span>
                        {member.email ? (
                          <span className='task-comment-mention-card__email'>
                            {member.email}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className='task-comment-mention-card__empty'>
                No matching members found.
              </div>
            )}
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          className='form-control'
          rows='3'
          placeholder='Click to add a comment'
          value={commentText}
          onChange={handleCommentChange}
          onKeyDown={handleCommentKeyDown}
          disabled={commentSubmitting}
        />
        <div className='task-comment-composer__hint'>
          Type <span>@</span> to mention a project member.
        </div>
        <div className='d-flex justify-content-end mt-2'>
          <button
            type='button'
            className='btn btn-primary btn-sm'
            onClick={submitComment}
            disabled={commentSubmitting || !commentText.trim()}
          >
            {commentSubmitting ? <Spinner size='sm' /> : 'Send'}
          </button>
        </div>
      </div>

      <div className='mt-3'>
        {(comments || []).length ? (
          <ul className='app-timeline-box m-0'>
            {(comments || []).map((comment, idx) => {
              const commentId = comment?.id ?? comment?.comment_id ?? idx;
              const deleting =
                commentId != null && !!commentDeletingIds[String(commentId)];
              const author = getCommentAuthor(comment);
              const text = pickString(
                comment?.comment,
                comment?.body,
                comment?.text,
              );
              const ts = pickString(comment?.created_at, comment?.createdAt);

              return (
                <li key={commentId} className='timeline-section'>
                  <div className='timeline-icon'>
                    <span className='text-light-info h-35 w-35 d-flex-center b-r-50'>
                      <i className='ti ti-message-circle f-s-20'></i>
                    </span>
                  </div>
                  <div className='timeline-content bg-light-info b-1-info position-relative'>
                    <div className='d-flex justify-content-between align-items-center timeline-flex'>
                      <h6 className='mt-2 text-info'>Comment</h6>
                      <span className='text-dark'>
                        {formatCommentTimestamp(ts)}
                      </span>
                    </div>
                    <p className='mt-2 text-dark mb-0'>
                      <span className='fw-semibold'>{author}</span>{' '}
                      <span className='text-muted'>said:</span>{' '}
                      <span>{text || '-'}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className='text-muted small'>No comments yet.</div>
        )}
      </div>
    </div>
  );

  const activityBlock = (
    <div>
      {activityByDate.length ? (
        <div className='d-flex flex-column'>
          {activityByDate.map((group) => (
            <div key={group?.date ?? '-'}>
              <div className='text-muted small task-activity-timeline__date'>
                {group?.date ?? '-'}
              </div>
              <ul className='app-timeline-box task-activity-timeline m-0'>
                {(group?.items || []).map((item, itIdx) => {
                  const ui = resolveActivityUi(item?.action);
                  const actorName = pickString(
                    item?.user_name,
                    item?.user?.name,
                    'User',
                  );
                  const activityMessage = buildActivityMessage(
                    item,
                    checklistItemTextById,
                  );
                  const key =
                    item?.id ??
                    `${item?.action ?? 'a'}-${item?.created_at ?? 'na'}-${item?.user_name ?? 'u'}-${itIdx}`;

                  return (
                    <li key={key} className='timeline-section'>
                      <div className='timeline-icon'>
                        <span
                          className={`${ui.iconWrapClass} h-35 w-35 d-flex-center b-r-50`}
                        >
                          <i className={`${ui.iconClass} f-s-20`}></i>
                        </span>
                      </div>
                      <div className={`timeline-content ${ui.contentClass} `}>
                        <div className='d-flex justify-content-between align-items-start gap-3  timeline-flex'>
                          <h6 className='mb-0 text-dark'>
                            <span className='fw-semibold f-s-14'>
                              {actorName}:{' '}
                            </span>
                            <span className={`${ui.titleClass} f-s-14`}>
                              {truncateText(activityMessage, 50)}
                            </span>
                          </h6>
                          <span className='text-dark flex-shrink-0'>
                            {formatCommentTimestamp(
                              item?.created_at ?? item?.createdAt,
                            )}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-muted small'>No activity yet.</div>
      )}
    </div>
  );

  return (
    <div className='pt-3'>
      <div className='d-flex align-items-center justify-content-between mb-2'>
        <div className='d-inline-flex align-items-center gap-1'>
          <span className='fs-6'>{viewLabel}</span>
          <Dropdown
            isOpen={viewMenuOpen}
            toggle={() => setViewMenuOpen((v) => !v)}
          >
            <DropdownToggle
              tag='button'
              type='button'
              className='btn p-0 text-info'
              title='View'
              aria-label='View'
              style={{ lineHeight: 1 }}
            >
              <i className='ti ti-chevron-down fs-5'></i>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                active={view === 'all'}
                onClick={() => {
                  setView('all');
                  setViewMenuOpen(false);
                }}
              >
                Activity
              </DropdownItem>
              <DropdownItem
                active={view === 'conversation'}
                onClick={() => {
                  setView('conversation');
                  setViewMenuOpen(false);
                }}
              >
                Conversations
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <span className='text-muted small'>({countLabel})</span>
        </div>
      </div>

      {showComments ? commentsBlock : null}
      {showActivity && showComments ? <hr className='my-3' /> : null}
      {showActivity ? activityBlock : null}
    </div>
  );
}

// {canDeleteComment(comment) ? (
//   <button
//     type='button'
//     className='btn p-0 text-danger'
//     title='Delete comment'
//     onClick={() => deleteComment(comment)}
//     disabled={deleting}
//     style={{ position: 'absolute', right: 5, bottom: 0 }}
//   >
//     {deleting ? (
//       <Spinner size='sm' />
//     ) : (
//       <i className='ti ti-trash fs-4'></i>
//     )}
//   </button>
// ) : null}
