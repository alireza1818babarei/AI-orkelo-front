import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

export const getArchivedTasks = createAsyncThunk(
  "tasks/getArchives",
  async({projectId}, {rejectWithValue})=> {
    try{
      const res = await api.get(`projects/${projectId}/tasks/archived`);
      return res.data.data
    } catch(err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
)

export const restoreArchivedTasks = createAsyncThunk(
  "tasks/restoreArchives",
  async({projectId, columnId, taskId}, {rejectWithValue})=> {
    try {
      const res = await api.patch(`/project/${projectId}/columns/${columnId}/tasks/${taskId}/toggle-archive`);
      return res.data;
    } catch(err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
)


const archivedTasksSlice = createSlice({
  name: "archivedTasks",
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getArchivedTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getArchivedTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getArchivedTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(restoreArchivedTasks.pending, (state)=> {
        state.loading = true;
        state.error = false;
      })
      .addCase(restoreArchivedTasks.fulfilled, (state, action) => {
        state.loading = false;
        const taskId = action.meta.arg.taskId;
        state.data = state.data.filter(task => task.id !== taskId);
      })
      .addCase(restoreArchivedTasks.rejected, (state, action)=> {
        state.loading = false;
        state.error = action.payload || action.error.message  || "Somthing went wrong"
      })
  }
});

export default archivedTasksSlice.reducer;
