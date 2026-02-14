import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import api from "../../api/axios";
import { alertConfirm, alertSuccess, toastError } from "../../utils/sweetAlert";
import {
  createTaskCommentThunk,
  deleteTaskCommentThunk,
  getTaskCommentsThunk,
} from "../../store/tasks/commentSlice";
import { formatCommentTimestamp } from "../../services/dateTime";

const normalizeActionLabel = (action) => {
  const a = String(action || "");
  if (a === "comment.created") return "Comment added";
  if (a === "attachment.uploaded") return "Attachment uploaded";
  if (a === "checklist_item.created") return "Checklist item added";
  if (a === "checklist_item.completed") return "Checklist item completed";
  if (a === "checklist_item.deleted") return "Checklist item deleted";
  if (a === "task.completed") return "Task completed";
  return a || "Activity";
};

const resolveActivityUi = (action) => {
  const a = String(action || "").toLowerCase();
  if (a.includes("deleted")) {
    return {
      tone: "danger",
      iconClass: "ti ti-trash",
      titleClass: "text-danger",
      iconWrapClass: "text-light-danger",
      contentClass: "bg-light-danger b-1-danger",
    };
  }
  if (a.includes("completed") || a.includes("checked") || a.includes("done")) {
    return {
      tone: "success",
      iconClass: "ti ti-circle-check",
      titleClass: "text-success",
      iconWrapClass: "text-light-success",
      contentClass: "bg-light-success b-1-success",
    };
  }
  if (a.includes("attachment")) {
    return {
      tone: "primary",
      iconClass: "ti ti-paperclip",
      titleClass: "text-primary",
      iconWrapClass: "text-light-primary",
      contentClass: "bg-light-primary b-1-primary",
    };
  }
  if (a.includes("comment")) {
    return {
      tone: "info",
      iconClass: "ti ti-message-circle",
      titleClass: "text-info",
      iconWrapClass: "text-light-info",
      contentClass: "bg-light-info b-1-info",
    };
  }
  if (a.includes("checklist")) {
    return {
      tone: "secondary",
      iconClass: "ti ti-list-check",
      titleClass: "text-secondary",
      iconWrapClass: "text-light-secondary",
      contentClass: "bg-light-secondary b-1-secondary",
    };
  }
  return {
    tone: "warning",
    iconClass: "ti ti-clock",
    titleClass: "text-warning",
    iconWrapClass: "text-light-warning",
    contentClass: "bg-light-warning b-1-warning",
  };
};

const pickString = (...vals) => {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};

const shouldShowActivityItem = (item) => {
  const action = String(item?.action || "").toLowerCase();
  if (!action) return true;
  // Comments are already shown in Conversations; hide them from Activity.
  if (action.startsWith("comment.")) return false;
  if (action.includes("comment.created")) return false;
  if (action.includes("comment.deleted")) return false;
  return true;
};

export default function TaskActivityConversation({
  projectId,
  taskId,
  activityRefreshKey = 0,
  commentsRefreshKey = 0,
}) {
  const dispatch = useDispatch();
  const [view, setView] = useState("all"); // "all" | "conversation"
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  const [activityGroups, setActivityGroups] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const authUser = useSelector((s) => s?.auth?.user ?? null);
  const currentUserId =
    authUser?.id ?? authUser?.user_id ?? authUser?.uuid ?? null;
  const currentUserName = pickString(
    authUser?.username,
    authUser?.name,
    authUser?.full_name,
  );

  const commentsState = useSelector((s) => s.comments);
  const comments =
    commentsState?.taskId === taskId && commentsState?.projectId === projectId
      ? commentsState?.items || []
      : [];
  const showActivity = view === "all";
  const showComments = view === "all" || view === "conversation";
  const commentsLoading = showComments && commentsState?.status === "loading";
  const commentsSubmitting = commentsState?.status === "saving";
  const commentDeletingIds = commentsState?.deletingIds || {};

  const [commentText, setCommentText] = useState("");

  const fetchActivity = useCallback(async () => {
    if (!projectId || !taskId) return;
    try {
      setActivityLoading(true);
      const res = await api.get(
        `/projects/${projectId}/tasks/${taskId}/activity`,
      );
      setActivityGroups(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      toastError(err?.message || "Load activity failed");
    } finally {
      setActivityLoading(false);
    }
  }, [projectId, taskId]);

  useEffect(() => {
    if (!showActivity) return;
    fetchActivity();
  }, [showActivity, fetchActivity, activityRefreshKey]);

  useEffect(() => {
    if (!showComments) return;
    if (!projectId || !taskId) return;
    dispatch(getTaskCommentsThunk({ projectId, taskId }));
  }, [dispatch, showComments, projectId, taskId, commentsRefreshKey]);

  const getCommentAuthor = (c) => {
    const authorId =
      c?.user?.id ??
      c?.user?.user_id ??
      c?.user_id ??
      c?.author?.id ??
      c?.author_id ??
      c?.created_by?.id ??
      c?.created_by_id ??
      c?.creator?.id ??
      c?.creator_id ??
      null;
    const authorName = pickString(
      c?.user_name,
      c?.username,
      c?.name,
      c?.full_name,
      c?.user?.username,
      c?.user?.name,
      c?.user?.full_name,
      c?.author?.name,
      c?.author_name,
      c?.created_by_name,
      c?.creator?.name,
    );

    const sameById =
      authorId != null &&
      currentUserId != null &&
      String(authorId) === String(currentUserId);
    const sameByName =
      authorName &&
      currentUserName &&
      String(authorName).toLowerCase() === String(currentUserName).toLowerCase();

    if (sameById || sameByName) return pickString(currentUserName, "You");
    return authorName || "User";
  };

  const canDeleteComment = (c) => {
    const commentId = c?.id ?? c?.comment_id ?? null;
    if (commentId == null) return false;

    const authorId =
      c?.user?.id ??
      c?.user?.user_id ??
      c?.user_id ??
      c?.author?.id ??
      c?.author_id ??
      c?.created_by_id ??
      c?.creator_id ??
      null;
    const authorName = pickString(
      c?.user_name,
      c?.user?.username,
      c?.username,
    );

    const sameById =
      authorId != null &&
      currentUserId != null &&
      String(authorId) === String(currentUserId);
    const sameByName =
      authorName &&
      currentUserName &&
      String(authorName).toLowerCase() === String(currentUserName).toLowerCase();

    return sameById || sameByName;
  };

  const submitComment = async () => {
    if (!projectId || !taskId) return;
    const text = commentText.trim();
    if (!text) return;
    try {
      await dispatch(createTaskCommentThunk({ projectId, taskId, text })).unwrap();
      setCommentText("");
      dispatch(getTaskCommentsThunk({ projectId, taskId }));
      if (showActivity) fetchActivity();
    } catch (err) {
      const msg = err?.message || err?.data?.message || "Create comment failed";
      toastError(msg);
    }
  };

  const deleteComment = async (comment) => {
    const commentId = comment?.id ?? comment?.comment_id ?? null;
    if (!projectId || !taskId || !commentId) return;
    try {
      const { isConfirmed } = await alertConfirm({
        title: "Delete comment",
        text: "Comment will be deleted. Continue?",
        confirmText: "Delete",
        cancelText: "No",
      });
      if (!isConfirmed) return;
      await dispatch(deleteTaskCommentThunk({ projectId, taskId, commentId })).unwrap();
      alertSuccess();
      dispatch(getTaskCommentsThunk({ projectId, taskId }));
      if (showActivity) fetchActivity();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err ||
        "Delete comment failed";
      toastError(msg);
    }
  };

  const activityCount = useMemo(() => {
    return (activityGroups || []).reduce(
      (sum, g) => sum + ((g?.items || []).length || 0),
      0,
    );
  }, [activityGroups]);

  const flatActivity = useMemo(() => {
    const out = [];
    (activityGroups || []).forEach((g) => {
      const date = g?.date ?? null;
      (g?.items || []).forEach((it) => {
        if (!shouldShowActivityItem(it)) return;
        out.push({
          ...it,
          _groupDate: date,
        });
      });
    });
    return out;
  }, [activityGroups]);

  const activityByDate = useMemo(() => {
    const map = new Map();
    flatActivity.forEach((it) => {
      const key = it?._groupDate ?? "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(it);
    });
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [flatActivity]);

  const countLabel =
    view === "conversation"
      ? `${comments.length} comments`
      : `${activityCount} activity \u2022 ${comments.length} comments`;

  const viewLabel = view === "conversation" ? "Conversations" : "Activity";

  const commentsBlock = (
    <div>
      <textarea
        className="form-control"
        rows="3"
        placeholder="Click to add a comment"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      ></textarea>
      <div className="d-flex justify-content-between align-items-center">
        <small className="text-light-primary small mt-2 align-self-start px-1 b-r-10">
          @to mention someone
        </small>
        <button
          type="button"
          className="btn btn-primary m-2 px-2 py-0 b-r-5"
          onClick={submitComment}
          disabled={commentsSubmitting}
        >
          <i className="ti ti-arrow-right fs-5"></i>
        </button>
      </div>

      <div className="mt-3">
        {commentsLoading ? (
          <div className="text-muted small">Loading comments...</div>
        ) : comments.length ? (
          <ul className="app-timeline-box m-0">
            {comments.map((c, idx) => {
              const commentId = c?.id ?? c?.comment_id ?? null;
              const deleting = !!commentDeletingIds[String(commentId)];
              const author = getCommentAuthor(c);
              const text = c?.text ?? c?.body ?? c?.comment ?? "-";
              return (
                <li key={commentId ?? idx} className="timeline-section">
                  <div className="timeline-icon">
                    <span className="text-light-info h-35 w-35 d-flex-center b-r-50">
                      <i className="ti ti-message-circle f-s-20"></i>
                    </span>
                  </div>
                  <div className="timeline-content bg-light-info b-1-info">
                    <div className="d-flex justify-content-between align-items-center timeline-flex">
                      <h6 className="mt-2 text-info">Comment</h6>
                      <span className="d-inline-flex align-items-center gap-2">
                        <span className="text-dark small">
                          {formatCommentTimestamp(c?.created_at)}
                        </span>
                        {canDeleteComment(c) ? (
                          <button
                            type="button"
                            className="btn p-0 text-danger"
                            title="Delete comment"
                            onClick={() => deleteComment(c)}
                            disabled={deleting}
                          >
                            <i className="ti ti-trash fs-5"></i>
                          </button>
                        ) : null}
                      </span>
                    </div>
                    <p className="mt-2 text-dark mb-0">
                      <span className="fw-semibold">{author}</span>{" "}
                      <span className="text-muted">said:</span>{" "}
                      <span>{text}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-muted small">No comments yet.</div>
        )}
      </div>
    </div>
  );

  const activityBlock = (
    <div>
      {activityLoading ? (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <Spinner size="sm" color="primary" />
          <span>Loading...</span>
        </div>
      ) : activityGroups?.length ? (
        <div className="d-flex flex-column gap-3">
          {activityByDate.map((g) => (
            <div key={g?.date ?? "—"}>
              <div className="text-muted small mb-2">{g?.date ?? "—"}</div>
              <ul className="app-timeline-box m-0">
                {(g?.items || []).map((it, itIdx) => {
                  const ui = resolveActivityUi(it?.action);
                  const title = normalizeActionLabel(it?.action);
                  return (
                    <li
                      key={`${it?.action ?? "a"}-${it?.created_at ?? "na"}-${it?.user_name ?? "u"}-${itIdx}`}
                      className="timeline-section"
                    >
                      <div className="timeline-icon">
                        <span
                          className={`${ui.iconWrapClass} h-35 w-35 d-flex-center b-r-50`}
                        >
                          <i className={`${ui.iconClass} f-s-20`}></i>
                        </span>
                      </div>
                      <div className={`timeline-content ${ui.contentClass}`}>
                        <div className="d-flex justify-content-between align-items-center timeline-flex">
                          <h6 className={`mt-2 ${ui.titleClass}`}>{title}</h6>
                          <span className="text-dark">
                            {formatCommentTimestamp(it?.created_at)}
                          </span>
                        </div>
                        <p className="mt-2 text-dark mb-0">
                          <span className="fw-semibold">
                            {pickString(it?.user_name, "User")}
                          </span>{" "}
                          <span className="text-muted">did this action.</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted small">No activity yet.</div>
      )}
    </div>
  );

  return (
    <div className="pt-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-inline-flex align-items-center gap-1">
          <span className="fs-6">{viewLabel}</span>
          <Dropdown isOpen={viewMenuOpen} toggle={() => setViewMenuOpen((v) => !v)}>
            <DropdownToggle
              tag="button"
              type="button"
              className="btn p-0 text-info"
              title="View"
              aria-label="View"
              style={{ lineHeight: 1 }}
            >
              <i className="ti ti-chevron-down fs-5"></i>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                active={view === "all"}
                onClick={() => {
                  setView("all");
                  setViewMenuOpen(false);
                }}
              >
                Activity
              </DropdownItem>
              <DropdownItem
                active={view === "conversation"}
                onClick={() => {
                  setView("conversation");
                  setViewMenuOpen(false);
                }}
              >
                Conversations
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <span className="text-muted small">({countLabel})</span>
        </div>
      </div>

      {showComments ? commentsBlock : null}
      {showActivity && showComments ? <hr className="my-3" /> : null}
      {showActivity ? activityBlock : null}
    </div>
  );
}
