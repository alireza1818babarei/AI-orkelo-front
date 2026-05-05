import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const normalizeMembersPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;
  if (Array.isArray(data?.members)) return data.members;
  if (Array.isArray(data)) return data;
  return [];
};

const normalizeRolesPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;
  if (Array.isArray(data?.roles)) return data.roles;
  if (Array.isArray(data)) return data;
  return [];
};

const normalizeRoleUpdatePayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;
  return data && typeof data === "object" ? data : null;
};

const getUserIdFromMember = (member) =>
  String(
      member?.id ??
      "",
  );

export const getCompanyMembersThunk = createAsyncThunk(
  "companyMembers/getAll",
  async (projectId, { rejectWithValue }) => {
    try {
      // Project boards use the project-scoped endpoint so project managers can load the modal list.
      const normalizedProjectId = String(projectId ?? "").trim();
      const url = normalizedProjectId
        ? `/projects/${normalizedProjectId}/available-members`
        : "/companies/my/members";
      const res = await api.get(url);
      return normalizeMembersPayload(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const addCompanyMemberThunk = createAsyncThunk(
  "companyMembers/add",
  async ({ email }, { rejectWithValue }) => {
    try {
      const payload = { email };
      const res = await api.post("/companies/my/members", payload);
      const data = res?.data?.data ?? {};
      const added = data?.user ?? null;

      return added
        ? {
            ...added,
            role: data?.membership?.role ?? added?.role,
            status: data?.membership?.status ?? added?.status,
          }
        : null;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const getCompanyRolesThunk = createAsyncThunk(
  "companyMembers/getRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/companies/my/roles");
      return normalizeRolesPayload(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateCompanyMemberRoleThunk = createAsyncThunk(
  "companyMembers/updateRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/companies/my/roles/users/${userId}`, {
        role,
      });
      return normalizeRoleUpdatePayload(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteCompanyMemberThunk = createAsyncThunk(
  "companyMembers/delete",
  async ({ userId }, { rejectWithValue }) => {
    try {
      await api.delete(`/companies/my/members/${userId}`);
      return { userId: String(userId) };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
  addLoading: false,
  addError: null,
  roles: [],
  rolesStatus: "idle",
  rolesError: null,
  roleUpdatingByUserId: {},
  roleUpdateError: null,
  removingByUserId: {},
  removeError: null,
};

const companyMembersSlice = createSlice({
  name: "companyMembers",
  initialState,
  reducers: {
    clearCompanyMembersState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getCompanyMembersThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(getCompanyMembersThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.error = null;
      state.items = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(getCompanyMembersThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Somthing went wrong" };
      state.items = [];
    });

    builder.addCase(addCompanyMemberThunk.pending, (state) => {
      state.addLoading = true;
      state.addError = null;
    });
    builder.addCase(addCompanyMemberThunk.fulfilled, (state, action) => {
      state.addLoading = false;
      state.addError = null;
      const member = action.payload;
      if (!member || typeof member !== "object") return;

      const memberKey = String(
        member?.id ?? member?.email ?? "",
      );
      if (!memberKey) return;

      const exists = (state.items || []).some((item) => {
        const key = String(
          item?.id ?? item?.email ?? "",
        );
        return key === memberKey;
      });
      if (!exists) {
        state.items = [member, ...(state.items || [])];
      }
    });
    builder.addCase(addCompanyMemberThunk.rejected, (state, action) => {
      state.addLoading = false;
      state.addError = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(getCompanyRolesThunk.pending, (state) => {
      state.rolesStatus = "loading";
      state.rolesError = null;
    });
    builder.addCase(getCompanyRolesThunk.fulfilled, (state, action) => {
      state.rolesStatus = "succeeded";
      state.rolesError = null;
      state.roles = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(getCompanyRolesThunk.rejected, (state, action) => {
      state.rolesStatus = "failed";
      state.rolesError = action.payload || { message: "Somthing went wrong" };
      state.roles = [];
    });

    builder.addCase(updateCompanyMemberRoleThunk.pending, (state, action) => {
      const userId = String(action.meta?.arg?.userId ?? "");
      if (!userId) return;
      state.roleUpdateError = null;
      state.roleUpdatingByUserId[userId] = true;
    });
    builder.addCase(updateCompanyMemberRoleThunk.fulfilled, (state, action) => {
      const updated = action.payload || {};
      const userId = String(updated?.id ?? action.meta?.arg?.userId ?? "");
      if (!userId) return;

      delete state.roleUpdatingByUserId[userId];
      state.roleUpdateError = null;
      state.items = (state.items || []).map((member) => {
        if (getUserIdFromMember(member) !== userId) return member;
        return {
          ...member,
          ...updated,
          membership:
            member?.membership && typeof member.membership === "object"
              ? {
                  ...member.membership,
                  role: updated?.role ?? member.membership.role,
                  status: updated?.status ?? member.membership.status,
                }
              : member?.membership,
        };
      });
    });
    builder.addCase(updateCompanyMemberRoleThunk.rejected, (state, action) => {
      const userId = String(action.meta?.arg?.userId ?? "");
      if (userId) delete state.roleUpdatingByUserId[userId];
      state.roleUpdateError = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(deleteCompanyMemberThunk.pending, (state, action) => {
      const userId = String(action.meta?.arg?.userId ?? "");
      if (!userId) return;
      state.removeError = null;
      state.removingByUserId[userId] = true;
    });
    builder.addCase(deleteCompanyMemberThunk.fulfilled, (state, action) => {
      const userId = String(action.payload?.userId ?? "");
      if (!userId) return;
      delete state.removingByUserId[userId];
      state.removeError = null;
      state.items = (state.items || []).filter(
        (member) => getUserIdFromMember(member) !== userId,
      );
    });
    builder.addCase(deleteCompanyMemberThunk.rejected, (state, action) => {
      const userId = String(action.meta?.arg?.userId ?? "");
      if (userId) delete state.removingByUserId[userId];
      state.removeError = action.payload || { message: "Somthing went wrong" };
    });
  },
});

export const { clearCompanyMembersState } = companyMembersSlice.actions;
export default companyMembersSlice.reducer;
