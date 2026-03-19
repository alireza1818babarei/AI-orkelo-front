import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const normalizeTaskPayload = (payload) => {
  const root = payload?.data ?? payload ?? null;
  if (!root || typeof root !== "object" || Array.isArray(root)) return null;
  return root?.task ?? root?.data?.task ?? root;
};

export const getTaskDetailThunk = createAsyncThunk(
  "taskDetail/get",
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks/${taskId}`);
      const raw = res?.data?.data ?? res?.data ?? null;
      return {
        projectId,
        taskId,
        task: normalizeTaskPayload(raw),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  projectId: null,
  taskId: null,
  task: null,
  creator: null,
  status: "idle",
  error: null,
};

const taskDetailSlice = createSlice({
  name: "taskDetail",
  initialState,
  reducers: {
    clearTaskDetail: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getTaskDetailThunk.pending, (state, action) => {
      const nextProjectId = action.meta?.arg?.projectId ?? null;
      const nextTaskId = action.meta?.arg?.taskId ?? null;
      const sameTask =
        state.projectId != null &&
        state.taskId != null &&
        nextProjectId != null &&
        nextTaskId != null &&
        String(state.projectId) === String(nextProjectId) &&
        String(state.taskId) === String(nextTaskId);

      state.status = "loading";
      state.error = null;
      state.projectId = nextProjectId;
      state.taskId = nextTaskId;
      if (!sameTask) state.task = null;
    });
    builder.addCase(getTaskDetailThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.projectId = action.payload?.projectId ?? null;
      state.taskId = action.payload?.taskId ?? null;
      state.task = action.payload?.task ?? null;

      state.creator = action.payload?.task?.creator ?? null;
    });
    builder.addCase(getTaskDetailThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Somthing went wrong" };
      state.task = null;
    });
  },
});

export const { clearTaskDetail } = taskDetailSlice.actions;
export default taskDetailSlice.reducer;
