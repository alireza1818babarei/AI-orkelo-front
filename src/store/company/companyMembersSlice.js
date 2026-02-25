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

const getUserIdFromMember = (member) =>
  String(
      member?.id ??
      "",
  );

export const getCompanyMembersThunk = createAsyncThunk(
  "companyMembers/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/companies/my/members");
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

      return added;
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
