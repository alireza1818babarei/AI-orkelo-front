import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

export const getProjectColumnsThunk = createAsyncThunk(
  "projectColumns/getByProject",
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const list = state?.projects?.items || [];
      const fromList = list.find((p) => String(p.id) === String(projectId));
      if (fromList && Array.isArray(fromList.columns)) {
        return { projectId, columns: fromList.columns };
      }

      const res = await api.get(`/projects/${projectId}`);
      const root = res.data?.data ?? res.data ?? null;
      const d = root?.data ?? root ?? null;
      const columns =
        d?.columns ??
        d?.project?.columns ??
        root?.columns ??
        root?.project?.columns ??
        [];
      return { projectId, columns: Array.isArray(columns) ? columns : [] };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createProjectColumnThunk = createAsyncThunk(
  "projectColumns/create",
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/projects/${projectId}/columns`, payload);
      return { projectId, column: res.data?.data ?? res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateProjectColumnThunk = createAsyncThunk(
  "projectColumns/update",
  async ({ projectId, columnId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(
        `/projects/${projectId}/columns/${columnId}`,
        payload,
      );
      return { projectId, column: res.data?.data ?? res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteProjectColumnThunk = createAsyncThunk(
  "projectColumns/delete",
  async ({ projectId, columnId }, { rejectWithValue }) => {
    try {
      const res = await api.delete(
        `/projects/${projectId}/columns/${columnId}`,
      );
      return { projectId, columnId, data: res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createProjectTaskThunk = createAsyncThunk(
  "projectColumns/createTask",
  async ({ projectId, columnId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `/projects/${projectId}/columns/${columnId}/tasks`,
        payload,
      );
      const data = res.data?.data ?? res.data;
      const createdTaskId = data?.id ?? data?.task_id ?? data?.uuid ?? null;

      const missingMeta = createdTaskId && (!data?.created_at || !data?.updated_at);
      let enriched = null;
      if (missingMeta) {
        try {
          const metaRes = await api.get(`/projects/${projectId}/tasks/${createdTaskId}`);
          const metaPayload = metaRes?.data?.data ?? metaRes?.data ?? null;
          enriched =
            metaPayload?.task ??
            metaPayload?.data?.task ??
            metaPayload?.data ??
            metaPayload ??
            null;
        } catch {
          enriched = null;
        }
      }
      return {
        projectId,
        columnId,
        task: { ...(payload || {}), ...(data || {}), ...(enriched || {}) },
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const getColumnTasksThunk = createAsyncThunk(
  "projectColumns/getColumnTasks",
  async ({ projectId, columnId }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/projects/${projectId}/columns/${columnId}/tasks`,
      );
      const payload = res.data?.data ?? res.data ?? [];
      return {
        projectId,
        columnId,
        tasks: Array.isArray(payload) ? payload : [],
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
  {
    condition: ({ projectId, columnId, force }, { getState }) => {
      if (force) return true;

      const state = getState();
      const slice = state?.projectColumns ?? null;
      if (!slice) return true;

      if (slice.projectId && String(slice.projectId) !== String(projectId)) {
        return true;
      }

      const key = String(columnId ?? "");
      if (slice.tasksLoadingByColumnId?.[key]) return false;

      const col = (slice.items || []).find((c) => String(c?.id) === key);
      if (!col) return true;

      if (Array.isArray(col.tasks)) return false;

      return true;
    },
  },
);

const initialState = {
  items: [],
  projectId: null,
  status: "idle",
  error: null,
  tasksLoadingByColumnId: {},
  tasksErrorByColumnId: {},
};

const projectColumnsSlice = createSlice({
  name: "projectColumns",
  initialState,
  reducers: {
    clearProjectColumns: () => initialState,
    setProjectColumns: (state, action) => {
      state.projectId = action.payload?.projectId ?? null;
      state.items = action.payload?.columns || [];
      state.tasksLoadingByColumnId = {};
      state.tasksErrorByColumnId = {};
    },
    updateTaskInColumn: (state, action) => {
      const { columnId, taskId, patch } = action.payload || {};
      if (!taskId || !patch) return;

      const matchesTask = (t) =>
        String(t?.id ?? t?.task_id ?? t?.uuid) === String(taskId);

      state.items = (state.items || []).map((c) => {
        if (columnId && String(c.id) !== String(columnId)) return c;

        const tasks = Array.isArray(c.tasks) ? c.tasks : [];
        let found = false;

        const nextTasks = tasks.map((t) => {
          if (!matchesTask(t)) return t;
          found = true;
          return { ...t, ...(patch || {}) };
        });

        if (!found && columnId && String(c.id) === String(columnId)) {
          nextTasks.push({
            id: taskId,
            ...(patch || {}),
          });
        }

        if (!found && !columnId) return c;
        return { ...c, tasks: nextTasks };
      });
    },
    removeTaskFromColumn: (state, action) => {
      const { columnId, taskId } = action.payload || {};
      if (!columnId || !taskId) return;
      state.items = (state.items || []).map((c) => {
        if (String(c.id) !== String(columnId)) return c;
        const nextTasks = Array.isArray(c.tasks) ? c.tasks : [];
        return {
          ...c,
          tasks: nextTasks.filter(
            (t) => String(t.id ?? t.task_id ?? t.uuid) !== String(taskId),
          ),
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjectColumnsThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
      state.tasksLoadingByColumnId = {};
      state.tasksErrorByColumnId = {};
    });
    builder.addCase(getProjectColumnsThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      const projectId = action.payload?.projectId ?? null;
      const nextColumns = action.payload?.columns || [];

      const prevTasksByColumnId = new Map(
        (state.items || []).map((c) => [String(c?.id), c?.tasks]),
      );

      state.projectId = projectId;
      state.items = (nextColumns || []).map((c) => {
        const key = String(c?.id);
        const existingTasks = c?.tasks;
        if (existingTasks != null) return c;

        const prevTasks = prevTasksByColumnId.get(key);
        if (Array.isArray(prevTasks)) return { ...c, tasks: prevTasks };

        return c;
      });
    });
    builder.addCase(getProjectColumnsThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Somthing went wrong" };
      state.items = [];
      state.tasksLoadingByColumnId = {};
      state.tasksErrorByColumnId = {};
    });

    builder.addCase(createProjectColumnThunk.fulfilled, (state, action) => {
      const { projectId, column } = action.payload || {};
      if (!column) return;
      state.projectId = projectId ?? state.projectId;
      state.items = [column, ...(state.items || [])];
    });
    builder.addCase(updateProjectColumnThunk.fulfilled, (state, action) => {
      const { projectId, column } = action.payload || {};
      if (!column) return;
      state.projectId = projectId ?? state.projectId;
      state.items = (state.items || []).map((c) =>
        String(c.id) === String(column.id) ? { ...c, ...column } : c,
      );
    });
    builder.addCase(deleteProjectColumnThunk.fulfilled, (state, action) => {
      const { projectId, columnId } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (!columnId) return;
      const key = String(columnId);
      delete state.tasksLoadingByColumnId?.[key];
      delete state.tasksErrorByColumnId?.[key];
      state.items = (state.items || []).filter(
        (c) => String(c.id) !== String(columnId),
      );
    });

    builder.addCase(createProjectTaskThunk.fulfilled, (state, action) => {
      const { projectId, columnId, task } = action.payload || {};
      if (!task || !columnId) return;
      state.projectId = projectId ?? state.projectId;
      state.items = (state.items || []).map((c) => {
        if (String(c.id) !== String(columnId)) return c;
        const nextTasks = Array.isArray(c.tasks) ? [...c.tasks] : [];
        nextTasks.push(task);
        return { ...c, tasks: nextTasks };
      });
    });

    builder.addCase(getColumnTasksThunk.pending, (state, action) => {
      const { projectId, columnId } = action.meta?.arg ?? {};
      state.projectId = projectId ?? state.projectId;
      if (columnId == null) return;
      const key = String(columnId);
      state.tasksLoadingByColumnId[key] = true;
      delete state.tasksErrorByColumnId[key];
    });
    builder.addCase(getColumnTasksThunk.fulfilled, (state, action) => {
      const { projectId, columnId, tasks } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (columnId == null) return;
      const key = String(columnId);
      delete state.tasksLoadingByColumnId[key];
      delete state.tasksErrorByColumnId[key];

      const sorted = Array.isArray(tasks)
        ? [...tasks].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
        : [];

      state.items = (state.items || []).map((c) => {
        if (String(c?.id) !== key) return c;
        return { ...c, tasks: sorted };
      });
    });
    builder.addCase(getColumnTasksThunk.rejected, (state, action) => {
      const { projectId, columnId } = action.meta?.arg ?? {};
      state.projectId = projectId ?? state.projectId;
      if (columnId == null) return;
      const key = String(columnId);
      delete state.tasksLoadingByColumnId[key];
      state.tasksErrorByColumnId[key] =
        action.payload || { message: "Somthing went wrong" };

      state.items = (state.items || []).map((c) => {
        if (String(c?.id) !== key) return c;
        return { ...c, tasks: [] };
      });
    });
  },
});

export const { clearProjectColumns, setProjectColumns, updateTaskInColumn, removeTaskFromColumn } =
  projectColumnsSlice.actions;
export default projectColumnsSlice.reducer;
