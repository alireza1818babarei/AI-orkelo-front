import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const normalizeArray = (payload) => {
  const d = payload?.data ?? payload ?? [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.tags)) return d.tags;
  if (Array.isArray(d?.people)) return d.people;
  if (Array.isArray(d?.users)) return d.users;
  if (Array.isArray(d?.members)) return d.members;
  return [];
};

const normalizeObject = (payload) => {
  const d = payload?.data ?? payload ?? null;
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  return d;
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
      const res = await api.post("/project", payload);
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
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;
      if (isFormData) {
        if (!payload.has("_method")) payload.append("_method", "PUT");
        const res = await api.post(`/projects/${id}`, payload);
        return res.data?.data;
      }
      const res = await api.put(`/projects/${id}`, payload);
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
      const raw = normalizeObject(res?.data) ?? null;
      const task =
        raw?.task ??
        raw?.data?.task ??
        raw?.data ??
        raw ??
        null;
      const tags =
        task?.tags ??
        task?.tag_list ??
        task?.task_tags ??
        task?.labels ??
        [];
      return {
        projectId,
        taskId,
        items: Array.isArray(tags) ? tags : [],
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
      const tagId = tag?.id ?? tag?.tag_id ?? null;

      if (!tagId || !taskId) return { projectId, taskId, tag, tags: null };

      const toggleRes = await api.patch(
        `/projects/${projectId}/tags/${tagId}/toggle`,
        { task_id: taskId, taskId },
      );
      const toggleRaw = toggleRes?.data?.data ?? toggleRes?.data ?? null;
      const tags = Array.isArray(toggleRaw)
        ? toggleRaw
        : Array.isArray(toggleRaw?.tags)
          ? toggleRaw.tags
          : Array.isArray(toggleRaw?.data?.tags)
            ? toggleRaw.data.tags
            : null;

      return { projectId, taskId, tag, tags };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const toggleTaskTagThunk = createAsyncThunk(
  "tags/toggleTaskTag",
  async ({ projectId, taskId, tagId }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/projects/${projectId}/tags/${tagId}/toggle`, {
        task_id: taskId,
        taskId,
      });
      const raw = res?.data?.data ?? res?.data ?? null;
      const tags = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.tags)
          ? raw.tags
          : Array.isArray(raw?.data?.tags)
            ? raw.data.tags
            : null;
      return { projectId, taskId, tagId, tags };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateTaskTagThunk = createAsyncThunk(
  "tags/updateTaskTag",
  async ({ projectId, taskId, tagId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        `/projects/${projectId}/tasks/${taskId}/tags/${tagId}`,
        payload,
      );
      const raw = normalizeObject(res?.data) ?? null;
      const tag = raw?.tag ?? raw?.data?.tag ?? raw ?? null;
      return { projectId, taskId, tagId, tag };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteTaskTagThunk = createAsyncThunk(
  "tags/deleteTaskTag",
  async ({ projectId, taskId, tagId }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}/tags/${tagId}`);
      return { projectId, taskId, tagId };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

/* =========================
   Task People (Assignee/Watchers)
========================= */

const normalizePeoplePayload = (payload) => {
  if (payload == null) return { people: [], watchers: [], assignee: null };

  const root = payload?.data ?? payload ?? null;
  if (Array.isArray(root)) return { people: root, watchers: [], assignee: null };

  const obj = normalizeObject(root) ?? {};

  const people = normalizeArray(
    obj?.people ?? obj?.users ?? obj?.members ?? obj?.data ?? [],
  );
  const watchers = normalizeArray(obj?.watchers ?? obj?.data?.watchers ?? []);
  const assignee =
    obj?.assignee ??
    obj?.data?.assignee ??
    obj?.assignee_user ??
    obj?.data?.assignee_user ??
    obj?.assigneeUser ??
    obj?.data?.assigneeUser ??
    null;

  return { people, watchers, assignee };
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
      const res = await api.patch(`/projects/${projectId}/tasks/${taskId}/assignee`, {
        user_id: userId,
        userId,
      });
      const raw = res?.data?.data ?? res?.data ?? null;
      const obj = normalizeObject(raw);
      const assignee =
        obj?.assignee ??
        obj?.data?.assignee ??
        obj?.user ??
        obj?.data?.user ??
        obj ??
        null;
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
      const res = await api.post(`/projects/${projectId}/tasks/${taskId}/watchers`, {
        user_id: userId,
        userId,
      });
      const raw = res?.data?.data ?? res?.data ?? null;
      const watchers = normalizeArray(raw?.watchers ?? raw?.data?.watchers ?? raw);
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
