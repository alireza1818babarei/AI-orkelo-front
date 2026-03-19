import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

export const getTrackingTasks = createAsyncThunk(
  "trackingTasks/get",
  async (_, {rejectWithValue})=> {
    try {
      const res = await api.get('/time-trackers');
      return res.data.data;
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

const taskTrackerSlice = createSlice({
  name: "taskTracker",
  initialState,
  reducers: {
    clearInitialState : ()=> initialState,
    clearError: (s)=> {
      s.error = null;
    }
  },
  extraReducers: (builder)=> {
    builder.addCase(getTrackingTasks.pending, (s)=> {
      s.loading = true;
      s.error = null
    });
    builder.addCase(getTrackingTasks.fulfilled, (s, a)=> {
      s.loading = false;
      s.data = a.payload;
    });
    builder.addCase(getTrackingTasks.rejected, (s, a)=> {
      s.loading = false;
      s.error = a.payload || a.error.message;
    });
  }
})

export const {
  clearInitialState,
  clearError
} = taskTrackerSlice.actions;

export default taskTrackerSlice.reducer;
