import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

export const getTrackingTasks = createAsyncThunk(
  "trackingTasks/get",
  async (_, { rejectWithValue, signal }) => {
    try {
      const res = await api.get("/time-trackers", { signal });
      return res.data.data;
    } catch (err) {
      if (signal.aborted) {
        throw err;
      }

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
      s.error = null;
      s.data = [];
    });
    builder.addCase(getTrackingTasks.fulfilled, (s, a)=> {
      s.loading = false;
      s.error = null;
      s.data = Array.isArray(a.payload) ? a.payload : [];
    });
    builder.addCase(getTrackingTasks.rejected, (s, a)=> {
      if (a.meta.aborted) return;

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
