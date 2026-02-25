import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const toArrayIfListLike = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;

  // Some endpoints may serialize list payloads as keyed objects: { "0": {...}, "1": {...} }.
  const keys = Object.keys(value);
  if (!keys.length) return [];
  if (!keys.every((k) => /^\d+$/.test(String(k)))) return null;
  return Object.values(value);
};

const normalizeArray = (payload) => {
  const d = payload?.data ?? payload ?? [];
  const direct = toArrayIfListLike(d);
  if (direct) return direct;

  const candidates = [d?.data, d?.items, d?.tags, d?.people, d?.users, d?.members];
  for (const candidate of candidates) {
    const arr = toArrayIfListLike(candidate);
    if (arr) return arr;
  }

  return [];
};

const normalizeObject = (payload) => {
  const d = payload?.data ?? payload ?? null;
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  return d;
};

const normalizeTaskObject = (payload) => {
  const obj = normalizeObject(payload);
  if (!obj) return null;
  const task = obj?.task ?? obj?.data?.task ?? obj?.data ?? obj;
  return task && typeof task === "object" && !Array.isArray(task) ? task : null;
};

/* =========================
   Project Details (existing)
========================= */

export const getProjectDetailsThunk = createAsyncThunk(
  "project/getProjectDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`projects/${id}`);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteProjectThunk = createAsyncThunk(
  "project/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/projects/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createProjectThunk = createAsyncThunk(
  "project/createProject",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/projects", payload);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateProjectThunk = createAsyncThunk(
  "project/updateProject",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/projects/${id}`, payload);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

/* =========================
   Project Tags (Settings)
========================= */

export const getProjectTagsThunk = createAsyncThunk(
  "tags/getProjectTags",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/tags`);
      return {
        projectId,
        items: normalizeArray(res?.data),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createProjectTagThunk = createAsyncThunk(
  "tags/createProjectTag",
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/projects/${projectId}/tags`, payload);
      const raw = normalizeObject(res?.data) ?? null;
      const tag = raw?.tag ?? raw?.data?.tag ?? raw ?? null;
      return { projectId, tag };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateProjectTagThunk = createAsyncThunk(
  "tags/updateProjectTag",
  async ({ projectId, tagId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/projects/${projectId}/tags/${tagId}`, payload);
      const raw = normalizeObject(res?.data) ?? null;
      const tag = raw?.tag ?? raw?.data?.tag ?? raw ?? null;
      return { projectId, tagId, tag };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const toggleProjectTagThunk = createAsyncThunk(
  "tags/toggleProjectTag",
  async ({ projectId, tagId }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/projects/${projectId}/tags/${tagId}/toggle`);
      const raw = normalizeObject(res?.data) ?? null;
      const tag = raw?.tag ?? raw?.data?.tag ?? raw ?? null;
      return { projectId, tagId, tag };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteProjectTagThunk = createAsyncThunk(
  "tags/deleteProjectTag",
  async ({ projectId, tagId }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/tags/${tagId}`);
      return { projectId, tagId };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

/* =========================
   Task Tags (Assign/Toggle)
========================= */

export const getTaskTagsThunk = createAsyncThunk(
  "tags/getTaskTags",
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks/${taskId}`);
      const task = normalizeTaskObject(res?.data?.data ?? res?.data ?? null);
      return {
        projectId,
        taskId,
        items: Array.isArray(task?.tags) ? task.tags : [],
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createTaskTagThunk = createAsyncThunk(
  "tags/createTaskTag",
  async ({ projectId, taskId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/projects/${projectId}/tags`, payload);
      const raw = normalizeObject(res?.data) ?? null;
      const tag = raw?.tag ?? raw?.data?.tag ?? raw ?? null;
      const tagId = tag?.id ?? null;

      if (!tagId || !taskId) {
        return { projectId, taskId, tag, tagIds: null };
      }

      const attachRes = await api.post(
        `/projects/${projectId}/tags/${tagId}/tasks/${taskId}`,
      );
      const attachRaw = attachRes?.data?.data ?? null;
      const tagIds = Array.isArray(attachRaw?.tag_ids)
        ? attachRaw.tag_ids
        : null;

      return { projectId, taskId, tag, tagIds };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const toggleTaskTagThunk = createAsyncThunk(
  "tags/toggleTaskTag",
  async ({ projectId, taskId, tagId }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/projects/${projectId}/tags/${tagId}/tasks/${taskId}`);
      const raw = res?.data?.data ?? null;
      const tagIds = Array.isArray(raw?.tag_ids) ? raw.tag_ids : null;

      return { projectId, taskId, tagId, tagIds };
    } catch (err) {
      const status = err?.response?.status ?? err?.status ?? null;
      if (status === 404) {
        return rejectWithValue(
          "Tag یا Task متعلق به این پروژه نیست (یا دسترسی ندارید).",
        );
      }
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateTaskTagThunk = createAsyncThunk(
  "tags/updateTaskTag",
  async (_, { rejectWithValue }) =>
    rejectWithValue({
      message: "Backend route for updating task tag is not available.",
    }),
);

export const deleteTaskTagThunk = createAsyncThunk(
  "tags/deleteTaskTag",
  async (_, { rejectWithValue }) =>
    rejectWithValue({
      message: "Backend route for removing task tag is not available.",
    }),
);

/* =========================
   Task People (Assignee/Watchers)
========================= */

const normalizePeoplePayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;
  const items = Array.isArray(data?.items) ? data.items : [];
  const meta = data?.meta && typeof data.meta === "object" ? data.meta : {};
  const watcherIds = Array.isArray(meta?.watcher_ids) ? meta.watcher_ids : [];
  const assigneeIds = Array.isArray(meta?.assignee_ids) ? meta.assignee_ids : [];

  return {
    people: items,
    watchers: watcherIds,
    assignee: assigneeIds.length ? assigneeIds[0] : null,
  };
};

export const getTaskPeopleThunk = createAsyncThunk(
  "taskPeople/getTaskPeople",
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks/${taskId}/people`);
      const raw = res?.data?.data ?? res?.data ?? null;
      const { people, watchers, assignee } = normalizePeoplePayload(raw);
      return { projectId, taskId, people, watchers, assignee };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const setTaskAssigneeThunk = createAsyncThunk(
  "taskPeople/setAssignee",
  async ({ projectId, taskId, userId }, { rejectWithValue }) => {
    try {
      const payload = {
        user_id: userId ?? null,
      };

      const res = await api.patch(`/projects/${projectId}/tasks/${taskId}/assignee`, payload);
      const raw = res?.data?.data ?? res?.data ?? null;
      const obj = normalizeObject(raw);
      const assigneeIds = Array.isArray(obj?.assignee_ids) ? obj.assignee_ids : [];
      const assignee = assigneeIds.length ? assigneeIds[0] : null;
      return { projectId, taskId, userId, assignee };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const addTaskWatcherThunk = createAsyncThunk(
  "taskPeople/addWatcher",
  async ({ projectId, taskId, userId }, { rejectWithValue }) => {
    try {
      const payload = {
        user_id: userId,
      };

      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/watchers`, payload);
      const raw = res?.data?.data ?? res?.data ?? null;
      const obj = normalizeObject(raw);
      const watchers = Array.isArray(obj?.watcher_ids) ? obj.watcher_ids : [];
      return { projectId, taskId, userId, watchers };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const removeTaskWatcherThunk = createAsyncThunk(
  "taskPeople/removeWatcher",
  async ({ projectId, taskId, userId }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}/watchers/${userId}`);
      return { projectId, taskId, userId };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const projectDetailsSlice = createSlice({
  name: "projectDetails",
  initialState,
  reducers: {
    clearProjectDetailsErr: (state) => {
      state.error = false;
    },
    clearProjectDetailsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getProjectDetailsThunk.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
    });
    builder.addCase(deleteProjectThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload;
    });
    builder.addCase(createProjectThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    builder.addCase(createProjectThunk.fulfilled, (s, a) => {
      s.loading = false;
      const created = a.payload;
      if (!created) return;
      s.data = { project: created };
    });
    builder.addCase(createProjectThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Somthing went wrong";
    });
    builder.addCase(updateProjectThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    builder.addCase(updateProjectThunk.fulfilled, (s, a) => {
      s.loading = false;
      const updated = a.payload;
      if (!updated) return;

      if (s.data?.project) {
        s.data = { ...s.data, project: { ...s.data.project, ...updated } };
        return;
      }

      if (s.data?.data?.project) {
        s.data = {
          ...s.data,
          data: {
            ...s.data.data,
            project: { ...s.data.data.project, ...updated },
          },
        };
        return;
      }

      if (s.data && typeof s.data === "object") {
        s.data = { ...s.data, ...updated };
        return;
      }

      s.data = updated;
    });
    builder.addCase(updateProjectThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Somthing went wrong";
    });

    builder.addMatcher(
      isAnyOf(getProjectDetailsThunk.pending, deleteProjectThunk.pending),
      (state) => {
        state.loading = true;
        state.error = null;
      },
    );
    builder.addMatcher(
      isAnyOf(getProjectDetailsThunk.rejected, deleteProjectThunk.rejected),
      (state, action) => {
        state.loading = false;
        state.error = action.payload || "Somthing went wrong";
      },
    );
  },
});

export const { clearProjectDetailsErr, clearProjectDetailsState } =
  projectDetailsSlice.actions;

export default projectDetailsSlice.reducer;
