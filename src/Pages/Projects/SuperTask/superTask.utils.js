export const REVIEW_STATUS = {
  IN_PROGRESS: "in_progress",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const REVIEW_STATUS_META = {
  [REVIEW_STATUS.IN_PROGRESS]: {
    label: "In progress",
    icon: "ti ti-player-play",
    tone: "info",
  },
  [REVIEW_STATUS.PENDING_REVIEW]: {
    label: "Pending review",
    icon: "ti ti-clock-hour-4",
    tone: "warning",
  },
  [REVIEW_STATUS.APPROVED]: {
    label: "Approved",
    icon: "ti ti-circle-check",
    tone: "success",
  },
  [REVIEW_STATUS.REJECTED]: {
    label: "Rejected",
    icon: "ti ti-circle-x",
    tone: "danger",
  },
};

export const getReviewMeta = (status) =>
  REVIEW_STATUS_META[String(status || "").toLowerCase()] ??
  REVIEW_STATUS_META[REVIEW_STATUS.IN_PROGRESS];

export const formatDateTime = (value, includeTime = true) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit" }
      : {}),
  }).format(date);
};

export const getMemberId = (member) =>
  member?.id ?? member?.user_id ?? member?.user?.id ?? null;

export const normalizeProjectMember = (member) => ({
  ...(member?.user && typeof member.user === "object" ? member.user : member),
  id: getMemberId(member),
  name:
    member?.name ??
    member?.user?.name ??
    member?.email ??
    member?.user?.email ??
    "Project member",
  email: member?.email ?? member?.user?.email ?? "",
  avatar: member?.avatar ?? member?.user?.avatar ?? null,
});

export const getStageLabel = (stage) => {
  if (typeof stage === "string") return stage;
  return (
    stage?.name ??
    stage?.title ??
    stage?.label ??
    stage?.work_role ??
    "Stage"
  );
};

export const entityResourcePath = ({
  projectId,
  taskId,
  subTaskId = null,
  workItemId = null,
}) => {
  let path = `/projects/${projectId}/tasks/${taskId}`;
  if (subTaskId != null) path += `/sub-tasks/${subTaskId}`;
  if (workItemId != null) path += `/work-items/${workItemId}`;
  return path;
};
