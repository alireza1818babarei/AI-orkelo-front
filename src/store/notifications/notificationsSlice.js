import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const normalizeNotificationsList = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(root?.data)) return root.data;

  return [];
};

const normalizeUnreadCount = (payload, items) => {
  const root = payload?.data ?? payload ?? {};
  const meta = root?.meta ?? payload?.meta ?? {};
  const unreadCount = Number(meta?.unread_count);

  if (Number.isFinite(unreadCount) && unreadCount >= 0) return unreadCount;
  return (items || []).filter((item) => !Boolean(item?.is_read)).length;
};

const normalizeSingleNotification = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    if (data?.data && typeof data.data === "object" && !Array.isArray(data.data)) {
      return data.data;
    }
    return data;
  }

  return null;
};

export const fetchNotificationsThunk = createAsyncThunk(
  "notifications/fetchAll",
  async ({ limit = 50, unreadOnly = false } = {}, { rejectWithValue }) => {
    try {
      const params = {};
      if (limit != null) params.limit = limit;
      if (unreadOnly) params.unread_only = true;

      const res = await api.get("/notifications", { params });
      const items = normalizeNotificationsList(res?.data);

      return {
        items,
        unreadCount: normalizeUnreadCount(res?.data, items),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const markNotificationAsReadThunk = createAsyncThunk(
  "notifications/markRead",
  async ({ notificationId }, { rejectWithValue }) => {
    const id = String(notificationId ?? "");
    if (!id) {
      return rejectWithValue({ message: "Notification id is required" });
    }

    try {
      const res = await api.patch(`/notifications/${id}/read`);
      return {
        notificationId: id,
        item: normalizeSingleNotification(res?.data),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.patch("/notifications/read-all");
      const updated = Number(
        res?.data?.data?.updated ?? res?.data?.updated ?? 0,
      );
      return {
        updated: Number.isFinite(updated) ? updated : 0,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  items: [],
  unreadCount: 0,
  status: "idle",
  error: null,
  refreshing: false,
  markingAll: false,
  markingById: {},
  actionError: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotificationsThunk.pending, (state) => {
      state.error = null;
      if (state.status === "idle") {
        state.status = "loading";
      } else {
        state.refreshing = true;
      }
    });
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.refreshing = false;
      state.error = null;
      state.items = Array.isArray(action.payload?.items) ? action.payload.items : [];
      state.unreadCount = Number(action.payload?.unreadCount ?? 0);
    });
    builder.addCase(fetchNotificationsThunk.rejected, (state, action) => {
      state.status = "failed";
      state.refreshing = false;
      state.error = action.payload || { message: "Somthing went wrong" };
      state.items = [];
      state.unreadCount = 0;
    });

    builder.addCase(markNotificationAsReadThunk.pending, (state, action) => {
      const id = String(action.meta?.arg?.notificationId ?? "");
      if (id) state.markingById[id] = true;
      state.actionError = null;
    });
    builder.addCase(markNotificationAsReadThunk.fulfilled, (state, action) => {
      const id = String(action.payload?.notificationId ?? "");
      if (id) delete state.markingById[id];

      let unreadWasMarked = false;
      state.items = (state.items || []).map((item) => {
        const currentId = String(item?.id ?? "");
        if (!id || currentId !== id) return item;

        if (!item?.is_read) unreadWasMarked = true;

        return {
          ...item,
          ...(action.payload?.item || {}),
          is_read: true,
          read_at:
            action.payload?.item?.read_at ??
            item?.read_at ??
            new Date().toISOString(),
        };
      });

      if (unreadWasMarked && state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
      state.actionError = null;
    });
    builder.addCase(markNotificationAsReadThunk.rejected, (state, action) => {
      const id = String(action.meta?.arg?.notificationId ?? "");
      if (id) delete state.markingById[id];
      state.actionError = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(markAllNotificationsReadThunk.pending, (state) => {
      state.markingAll = true;
      state.actionError = null;
    });
    builder.addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
      state.markingAll = false;
      state.actionError = null;
      state.unreadCount = 0;

      const nowIso = new Date().toISOString();
      state.items = (state.items || []).map((item) => ({
        ...item,
        is_read: true,
        read_at: item?.read_at ?? nowIso,
      }));
    });
    builder.addCase(markAllNotificationsReadThunk.rejected, (state, action) => {
      state.markingAll = false;
      state.actionError = action.payload || { message: "Somthing went wrong" };
    });
  },
});

export const { clearNotificationsState } = notificationsSlice.actions;
export default notificationsSlice.reducer;
