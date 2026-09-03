import api from "./axios";

const unwrapData = (response, fallback = null) =>
  response?.data?.data ?? response?.data ?? fallback;

export const getSuperTask = async (projectId, taskId) => {
  const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
  return unwrapData(response, null);
};

export const getSuperTaskSummary = async (projectId, taskId) => {
  const response = await api.get(
    `/projects/${projectId}/tasks/${taskId}/summary`,
  );
  return unwrapData(response, null);
};

export const getSuperTaskSubTasks = async (projectId, taskId, filters = {}) => {
  const params = new URLSearchParams();
  const search = String(filters.search || "").trim();
  if (search) params.set("search", search);
  if (filters.assigneeId) params.set("assignee_id", filters.assigneeId);
  if (filters.tagId) params.set("tag_id", filters.tagId);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const response = await api.get(
    `/projects/${projectId}/tasks/${taskId}/sub-tasks${query ? `?${query}` : ""}`,
  );
  const data = unwrapData(response, []);
  return Array.isArray(data) ? data : [];
};

export const updateSuperTask = async (
  projectId,
  columnId,
  taskId,
  payload,
) => {
  const response = await api.patch(
    `/projects/${projectId}/columns/${columnId}/tasks/${taskId}`,
    payload,
  );
  return unwrapData(response, null);
};

export const getProjectMembers = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/members`);
  const root = unwrapData(response, []);
  const items = root?.data ?? root?.items ?? root;
  return Array.isArray(items) ? items : [];
};

export const getProjectTags = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/tags`);
  const root = unwrapData(response, []);
  const items = root?.data ?? root?.items ?? root;
  return Array.isArray(items) ? items : [];
};

export const toggleSuperTaskTag = async ({
  projectId,
  taskId,
  tagId,
  attached,
}) => {
  const url = `/projects/${projectId}/tags/${tagId}/tasks/${taskId}`;
  const response = attached ? await api.delete(url) : await api.post(url);
  return unwrapData(response, null);
};

export const toggleSuperTaskWatcher = async ({
  projectId,
  taskId,
  userId,
  watching,
}) => {
  const base = `/projects/${projectId}/tasks/${taskId}/watchers`;
  const response = watching
    ? await api.delete(`${base}/${userId}`)
    : await api.post(base, { user_id: userId });
  return unwrapData(response, null);
};

export const createSubTask = async (projectId, taskId, payload) => {
  const response = await api.post(
    `/projects/${projectId}/tasks/${taskId}/sub-tasks`,
    payload,
  );
  return unwrapData(response, null);
};

export const getSubTask = async (projectId, taskId, subTaskId) => {
  const response = await api.get(
    `/projects/${projectId}/tasks/${taskId}/sub-tasks/${subTaskId}`,
  );
  return unwrapData(response, null);
};

export const updateSubTask = async (
  projectId,
  taskId,
  subTaskId,
  payload,
) => {
  const response = await api.patch(
    `/projects/${projectId}/tasks/${taskId}/sub-tasks/${subTaskId}`,
    payload,
  );
  return unwrapData(response, null);
};

export const createWorkItem = async (
  projectId,
  taskId,
  subTaskId,
  payload,
) => {
  const response = await api.post(
    `/projects/${projectId}/tasks/${taskId}/sub-tasks/${subTaskId}/work-items`,
    payload,
  );
  return unwrapData(response, null);
};

const workItemPath = (projectId, taskId, subTaskId, workItemId) =>
  `/projects/${projectId}/tasks/${taskId}/sub-tasks/${subTaskId}/work-items/${workItemId}`;

export const getWorkItem = async (
  projectId,
  taskId,
  subTaskId,
  workItemId,
) => {
  const response = await api.get(
    workItemPath(projectId, taskId, subTaskId, workItemId),
  );
  return unwrapData(response, null);
};

export const updateWorkItem = async (
  projectId,
  taskId,
  subTaskId,
  workItemId,
  payload,
) => {
  const response = await api.patch(
    workItemPath(projectId, taskId, subTaskId, workItemId),
    payload,
  );
  return unwrapData(response, null);
};

export const getWorkItemTrackers = async (
  projectId,
  taskId,
  subTaskId,
  workItemId,
) => {
  const response = await api.get(
    `${workItemPath(projectId, taskId, subTaskId, workItemId)}/time-trackers`,
  );
  return unwrapData(response, {
    trackers: [],
    work_item_total_time: 0,
    active_tracker: null,
  });
};

const mutateWorkItemTracker = async ({
  projectId,
  taskId,
  subTaskId,
  workItemId,
  action,
  payload,
}) => {
  const path = `${workItemPath(
    projectId,
    taskId,
    subTaskId,
    workItemId,
  )}/time-trackers/${action}`;
  const response =
    action === "start"
      ? await api.post(path, payload)
      : await api.patch(path, payload);
  return unwrapData(response, null);
};

export const startWorkItemTracker = (params) =>
  mutateWorkItemTracker({ ...params, action: "start" });

export const resumeWorkItemTracker = (params) =>
  mutateWorkItemTracker({ ...params, action: "resume" });

export const stopWorkItemTracker = (params) =>
  mutateWorkItemTracker({ ...params, action: "stop" });

export const deleteSubTask = async (projectId, taskId, subTaskId) => {
  const response = await api.delete(
    `/projects/${projectId}/tasks/${taskId}/sub-tasks/${subTaskId}`,
  );
  return unwrapData(response, null);
};

export const deleteWorkItem = async (
  projectId,
  taskId,
  subTaskId,
  workItemId,
) => {
  const response = await api.delete(
    workItemPath(projectId, taskId, subTaskId, workItemId),
  );
  return unwrapData(response, null);
};

export const toggleSuperTaskArchive = async (projectId, columnId, taskId) => {
  const response = await api.patch(
    `/projects/${projectId}/columns/${columnId}/tasks/${taskId}/toggle-archive`,
  );
  return unwrapData(response, null);
};

export const deleteSuperTask = async (projectId, columnId, taskId) => {
  const response = await api.delete(
    `/projects/${projectId}/columns/${columnId}/tasks/${taskId}`,
  );
  return unwrapData(response, null);
};

export const reviewSuperTaskEntity = async ({
  projectId,
  taskId,
  subTaskId = null,
  workItemId = null,
  action,
  rejectionReason = "",
}) => {
  let path = `/projects/${projectId}/tasks/${taskId}`;
  if (subTaskId != null) path += `/sub-tasks/${subTaskId}`;
  if (workItemId != null) path += `/work-items/${workItemId}`;

  const payload =
    action === "reject" ? { rejection_reason: rejectionReason } : {};
  const response = await api.patch(`${path}/review/${action}`, payload);
  return unwrapData(response, null);
};

export const getEntityTimeline = async (resourceBasePath) => {
  const [activityResponse, commentsResponse] = await Promise.all([
    api.get(`${resourceBasePath}/activity`),
    api.get(`${resourceBasePath}/conversation`),
  ]);

  const activityRoot = unwrapData(activityResponse, []);
  const activities = (Array.isArray(activityRoot) ? activityRoot : []).flatMap(
    (group) => (Array.isArray(group?.items) ? group.items : [group]),
  );
  const commentsRoot = unwrapData(commentsResponse, []);

  return {
    activities,
    comments: Array.isArray(commentsRoot) ? commentsRoot : [],
  };
};
