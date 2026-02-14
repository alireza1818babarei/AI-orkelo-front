import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

export const getTaskCommentsThunk = createAsyncThunk(
  "comments/getByTask",
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/projects/${projectId}/tasks/${taskId}/conversation`,
      );
      return {
        projectId,
        taskId,
        items: res.data?.data ?? res.data ?? [],
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createTaskCommentThunk = createAsyncThunk(
  "comments/create",
  async ({ projectId, taskId, text }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `/projects/${projectId}/tasks/${taskId}/comments`,
        { body: text },
      );
      return {
        projectId,
        taskId,
        item: res.data?.data ?? res.data ?? { text },
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteTaskCommentThunk = createAsyncThunk(
  "comments/delete",
  async ({ projectId, taskId, commentId }, { rejectWithValue }) => {
    try {
      await api.delete(
        `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
      );
      return { projectId, taskId, commentId };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  items: [],
  projectId: null,
  taskId: null,
  status: "idle",
  error: null,
  deletingIds: {},
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getTaskCommentsThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(getTaskCommentsThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.projectId = action.payload?.projectId ?? null;
      state.taskId = action.payload?.taskId ?? null;
      state.items = action.payload?.items || [];
    });
    builder.addCase(getTaskCommentsThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Somthing went wrong";
      state.items = [];
    });

    builder.addCase(createTaskCommentThunk.pending, (state) => {
      state.status = "saving";
      state.error = null;
    });
    builder.addCase(createTaskCommentThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      const { projectId, taskId, item } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      state.taskId = taskId ?? state.taskId;
      if (item) state.items = [...(state.items || []), item];
    });
    builder.addCase(createTaskCommentThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Somthing went wrong";
    });

    builder.addCase(deleteTaskCommentThunk.pending, (state, action) => {
      const commentId = action.meta?.arg?.commentId;
      if (commentId != null) state.deletingIds[String(commentId)] = true;
      state.error = null;
    });
    builder.addCase(deleteTaskCommentThunk.fulfilled, (state, action) => {
      const { projectId, taskId, commentId } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      state.taskId = taskId ?? state.taskId;
      if (commentId != null) {
        const key = String(commentId);
        delete state.deletingIds[key];
        state.items = (state.items || []).filter(
          (c) => String(c?.id ?? c?.comment_id ?? "") !== key,
        );
      }
      state.status = "succeeded";
    });
    builder.addCase(deleteTaskCommentThunk.rejected, (state, action) => {
      const commentId = action.meta?.arg?.commentId;
      if (commentId != null) delete state.deletingIds[String(commentId)];
      state.error = action.payload || "Somthing went wrong";
    });
  },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;
