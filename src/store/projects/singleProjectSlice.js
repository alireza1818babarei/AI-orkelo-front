import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

export const getProjectDetailsThunk = createAsyncThunk(
  "project/getProjectDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`projects/${id}`);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteProjectThunk = createAsyncThunk(
  "project/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/projects/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createProjectThunk = createAsyncThunk(
  "project/createProject",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/project", payload);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateProjectThunk = createAsyncThunk(
  "project/updateProject",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;
      if (isFormData) {
        if (!payload.has("_method")) payload.append("_method", "PUT");
        const res = await api.post(`/projects/${id}`, payload);
        return res.data?.data;
      }
      const res = await api.put(`/projects/${id}`, payload);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const projectDetailsSlice = createSlice({
  name: "projectDetails",
  initialState,
  reducers: {
    clearProjectDetailsErr: (state) => {
      state.error = false;
    },
    clearProjectDetailsState: () => initialState,
  },
  extraReducers: (builder) => {

    builder.addCase(getProjectDetailsThunk.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
    });
    builder.addCase(deleteProjectThunk.fulfilled, (s,a)=> {
      s.loading = false;
      s.data = a.payload
    })
    builder.addCase(createProjectThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
    builder.addCase(createProjectThunk.fulfilled, (s, a) => {
      s.loading = false;
      const created = a.payload;
      if (!created) return;
      s.data = { project: created };
    })
    builder.addCase(createProjectThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Somthing went wrong";
    })
    builder.addCase(updateProjectThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    })
    builder.addCase(updateProjectThunk.fulfilled, (s,a)=> {
      s.loading = false;
      const updated = a.payload;
      if (!updated) return;

      if (s.data?.project) {
        s.data = { ...s.data, project: { ...s.data.project, ...updated } };
        return;
      }

      if (s.data?.data?.project) {
        s.data = {
          ...s.data,
          data: {
            ...s.data.data,
            project: { ...s.data.data.project, ...updated },
          },
        };
        return;
      }

      if (s.data && typeof s.data === "object") {
        s.data = { ...s.data, ...updated };
        return;
      }

      s.data = updated;
    })
    builder.addCase(updateProjectThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload || "Somthing went wrong";
    })

    builder.addMatcher(
      isAnyOf(getProjectDetailsThunk.pending, deleteProjectThunk.pending),
      (state) => {
        state.loading = true;
        state.error = null;
      },
    );
    builder.addMatcher(
      isAnyOf(getProjectDetailsThunk.rejected, deleteProjectThunk.rejected),
      (state, action)=> {
        state.loading = false;
        state.error = action.payload || "Somthing went wrong";
      }
    )
  },
});

export const { clearProjectDetailsErr, clearProjectDetailsState } =
  projectDetailsSlice.actions;

export default projectDetailsSlice.reducer;
