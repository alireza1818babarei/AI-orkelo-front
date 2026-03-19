import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const initialState = {
  byTaskId: {},
  loading: false,
  error: null,
};

export const getTaskExcludePeopleThunk = createAsyncThunk(
  "taskExcludedPeople/getPeople",
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/projects/${projectId}/tasks/${taskId}/exclude-people`
      );

      return {
        taskId,
        people: data.data.items || [],
        taskCreatorId: data.data.task_creator_id ?? null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Request failed");
    }
  }
);

export const toggleTaskExcludedUserThunk = createAsyncThunk(
  "taskExcludedPeople/toggle",
  async ({ projectId, taskId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/projects/${projectId}/tasks/${taskId}/exclude-user`,
        { user_id: Number(userId) },
        { headers: { "Content-Type": "application/json" } }
      );

      return {
        taskId,
        excludedUserIds: data.data.excluded_user_ids || [],
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Request failed");
    }
  }
);

const taskExcludedPeopleSlice = createSlice({
  name: "taskExcludedPeople",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(getTaskExcludePeopleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getTaskExcludePeopleThunk.fulfilled, (state, action) => {
        state.loading = false;

        const { taskId, people, taskCreatorId } = action.payload;

        state.byTaskId[taskId] = {
          ...(state.byTaskId[taskId] ?? {}),
          people,
          task_creator_id: taskCreatorId,
        };
      })

      .addCase(getTaskExcludePeopleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(toggleTaskExcludedUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(toggleTaskExcludedUserThunk.fulfilled, (state, action) => {
        state.loading = false;

        const { taskId, excludedUserIds } = action.payload;

        state.byTaskId[taskId] = {
          ...(state.byTaskId[taskId] ?? {}),
          excludedUserIds,
        };
      })

      .addCase(toggleTaskExcludedUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default taskExcludedPeopleSlice.reducer;
