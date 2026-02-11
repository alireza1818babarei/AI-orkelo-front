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

      const res = await api.get("/projects");
      const projects = res.data?.data || [];
      const project = projects.find(
        (p) => String(p.id) === String(projectId),
      );
      return { projectId, columns: project?.columns || [] };
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
      return {
        projectId,
        columnId,
        task: { ...(payload || {}), ...(data || {}) },
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  items: [],
  projectId: null,
  status: "idle",
  error: null,
};

const projectColumnsSlice = createSlice({
  name: "projectColumns",
  initialState,
  reducers: {
    clearProjectColumns: () => initialState,
    setProjectColumns: (state, action) => {
      state.projectId = action.payload?.projectId ?? null;
      state.items = action.payload?.columns || [];
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
    });
    builder.addCase(getProjectColumnsThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.projectId = action.payload?.projectId ?? null;
      state.items = action.payload?.columns || [];
    });
    builder.addCase(getProjectColumnsThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Somthing went wrong" };
      state.items = [];
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
  },
});

export const { clearProjectColumns, setProjectColumns, removeTaskFromColumn } =
  projectColumnsSlice.actions;
export default projectColumnsSlice.reducer;
