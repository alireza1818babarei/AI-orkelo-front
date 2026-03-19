import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

/* ===================== THUNK ===================== */

export const toggleTaskVisibleForUserThunk = createAsyncThunk(
  "taskVisibleFor/toggle",
  async ({ projectId, taskId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/projects/${projectId}/tasks/${taskId}/visible-for`,
        { user_id: userId }
      );

      // ✅ normalize response to ARRAY
      const visibleForUserIds =
        data?.data?.visible_for_user_ids ??
        data?.visible_for_user_ids ??
        data?.data ??
        data ??
        [];

      return {
        taskId,
        visibleForUserIds: Array.isArray(visibleForUserIds)
          ? visibleForUserIds
          : [],
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Request failed"
      );
    }
  }
);

/* ===================== SLICE ===================== */

const taskVisibleForSlice = createSlice({
  name: "taskVisibleFor",
  initialState: {
    byTaskId: {}, // { [taskId]: { visibleForUserIds: [] } }
    loading: false,
    error: null,
  },
  reducers: {
    clearTaskVisibleForError(state) {
      state.error = null;
    },
    clearTaskVisibleForTask(state, action) {
      delete state.byTaskId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleTaskVisibleForUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleTaskVisibleForUserThunk.fulfilled, (state, action) => {
        const { taskId, visibleForUserIds } = action.payload;

        state.loading = false;
        state.byTaskId[taskId] = {
          visibleForUserIds: Array.isArray(visibleForUserIds)
            ? visibleForUserIds
            : [],
        };
      })
      .addCase(toggleTaskVisibleForUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearTaskVisibleForError,
  clearTaskVisibleForTask,
} = taskVisibleForSlice.actions;

export default taskVisibleForSlice.reducer;
