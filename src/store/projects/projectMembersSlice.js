import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const normalizeMembersPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;
  if (Array.isArray(data)) return data;
  return [];
};

const getMemberKey = (member) =>
  String(
      member?.id ??
      member?.email ??
      "",
  );

const getMemberRouteId = (member) =>
  String(
    member?.id ??
      "",
  );

export const getProjectMembersThunk = createAsyncThunk(
  "projectMembers/getByProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      return {
        projectId,
        items: normalizeMembersPayload(res?.data),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const addProjectMemberThunk = createAsyncThunk(
  "projectMembers/add",
  async ({ projectId, email }, { rejectWithValue }) => {
    try {
      const payload = {
        email,
      };

      await api.post(`/projects/${projectId}/members`, payload);

      return {
        projectId,
        email: String(email || "").trim().toLowerCase(),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteProjectMemberThunk = createAsyncThunk(
  "projectMembers/delete",
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
      return {
        projectId,
        memberId: String(memberId),
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
  addingByEmail: {},
  addError: null,
  removingByMemberId: {},
  removeError: null,
};

const projectMembersSlice = createSlice({
  name: "projectMembers",
  initialState,
  reducers: {
    clearProjectMembersState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getProjectMembersThunk.pending, (state, action) => {
      const nextProjectId = action.meta?.arg ?? null;
      state.status = "loading";
      state.error = null;
      state.projectId = nextProjectId;
      state.items = [];
    });
    builder.addCase(getProjectMembersThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      state.projectId = action.payload?.projectId ?? state.projectId;
      state.items = Array.isArray(action.payload?.items)
        ? action.payload.items
        : [];
    });
    builder.addCase(getProjectMembersThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Somthing went wrong" };
      state.items = [];
    });

    builder.addCase(addProjectMemberThunk.pending, (state, action) => {
      const email = String(action.meta?.arg?.email ?? "").trim().toLowerCase();
      if (!email) return;
      state.addError = null;
      state.addingByEmail[email] = true;
    });
    builder.addCase(addProjectMemberThunk.fulfilled, (state, action) => {
      const email = String(action.payload?.email ?? "").trim().toLowerCase();
      if (email) delete state.addingByEmail[email];
      state.addError = null;
      state.projectId = action.payload?.projectId ?? state.projectId;
    });
    builder.addCase(addProjectMemberThunk.rejected, (state, action) => {
      const email = String(action.meta?.arg?.email ?? "").trim().toLowerCase();
      if (email) delete state.addingByEmail[email];
      state.addError = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(deleteProjectMemberThunk.pending, (state, action) => {
      const memberId = String(action.meta?.arg?.memberId ?? "");
      if (!memberId) return;
      state.removeError = null;
      state.removingByMemberId[memberId] = true;
    });
    builder.addCase(deleteProjectMemberThunk.fulfilled, (state, action) => {
      const memberId = String(action.payload?.memberId ?? "");
      if (!memberId) return;
      delete state.removingByMemberId[memberId];
      state.removeError = null;
      state.projectId = action.payload?.projectId ?? state.projectId;
      state.items = (state.items || []).filter((member) => {
        const routeId = getMemberRouteId(member);
        const key = getMemberKey(member);
        return routeId !== memberId && key !== memberId;
      });
    });
    builder.addCase(deleteProjectMemberThunk.rejected, (state, action) => {
      const memberId = String(action.meta?.arg?.memberId ?? "");
      if (memberId) delete state.removingByMemberId[memberId];
      state.removeError = action.payload || { message: "Somthing went wrong" };
    });
  },
});

export const { clearProjectMembersState } = projectMembersSlice.actions;
export default projectMembersSlice.reducer;
