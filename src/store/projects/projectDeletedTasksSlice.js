import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../utils/getError";
import api from "../../api/axios";

export const getDeletedTasksThunk = createAsyncThunk (
  "get/deletedTasks",
  async({projectId}, {rejectWithvalue})=> {
    try {
      const res = await api.get(`/projects/${projectId}/tasks/trashed`);
      return res.data.data;
    } catch(err) {
      return rejectWithvalue(getErrorMessage(err));
    }
  }
)

export const restoreDeletedTaskThunk = createAsyncThunk(
  "restore/deletedTask",
  async({projectId, columnId, taskId}, {rejectWithValue})=> {
    try {
      const res = await api.patch(`/projects/${projectId}/columns/${columnId}/tasks/${taskId}/restore`);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
)

const initialState = {
  data: [],
  loading: false,
  error: null
}

const deletedTaskSlice = createSlice({
  name: "deletedTasks",
  initialState,
  reducers: {},
  extraReducers: (builder)=> {
    builder
    .addCase(getDeletedTasksThunk.pending, (state)=> {
      state.loading = true;
      state.error = false;
    })
    .addCase(getDeletedTasksThunk.fulfilled, (state, action)=> {
      state.loading = false;
      state.data = action.payload;
    })
    .addCase(getDeletedTasksThunk.rejected, (state, action)=> {
      state.loading = false;
      state.error = action.payload || action.error.message || "Somthing went wrong"
    })

    .addCase(restoreDeletedTaskThunk.pending, (state)=> {
      state.loading = true;
      state.error = false;
    })
    .addCase(restoreDeletedTaskThunk.fulfilled, (state, action)=> {
      state.loading = false;
      const taskId = action.meta.arg.taskId;
      state.data = state.data.filter(task=> task.id !== taskId);
    })
    .addCase(restoreDeletedTaskThunk.rejected, (state, action)=> {
      state.loading = false;
      state.error = action.payload || action.error.message || "Somthing went wrong"
    })

  }
})

export default deletedTaskSlice.reducer;
