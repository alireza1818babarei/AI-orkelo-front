import { createSlice } from "@reduxjs/toolkit";
import {
  addTaskWatcherThunk,
  getTaskPeopleThunk,
  removeTaskWatcherThunk,
  setTaskAssigneeThunk,
} from "../projects/projectDetailsSlice";

const getUserKey = (u) => String(u?.id ?? u ?? "");

const normalizeWatcherIds = (watchers) => {
  const arr = Array.isArray(watchers) ? watchers : [];
  return arr.map(getUserKey).filter(Boolean);
};

const pickAssignee = ({ userId, assignee, people }) => {
  const key = String(userId ?? getUserKey(assignee) ?? "");
  if (!key) return assignee ?? null;
  const fromPeople = (people || []).find((p) => getUserKey(p) === key) || null;
  if (fromPeople) {
    if (assignee && typeof assignee === "object") return { ...fromPeople, ...assignee };
    return fromPeople;
  }
  if (!assignee) return userId != null ? { id: userId } : null;
  if (fromPeople && typeof assignee === "object") return { ...fromPeople, ...assignee };
  return assignee;
};

const initialState = {
  projectId: null,
  taskId: null,
  people: [],
  watcherIds: [],
  assignee: null,
  status: "idle",
  error: null,
  updatingWatcherByUserId: {},
  settingAssignee: false,
};

const taskPeopleSlice = createSlice({
  name: "taskPeople",
  initialState,
  reducers: {
    clearTaskPeople: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getTaskPeopleThunk.pending, (state, action) => {
      state.status = "loading";
      state.error = null;
      state.projectId = action.meta?.arg?.projectId ?? null;
      state.taskId = action.meta?.arg?.taskId ?? null;
    });
    builder.addCase(getTaskPeopleThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.projectId = action.payload?.projectId ?? null;
      state.taskId = action.payload?.taskId ?? null;
      state.people = action.payload?.people || [];
      state.watcherIds = normalizeWatcherIds(action.payload?.watchers);
      const assigneeUserId =
        typeof action.payload?.assignee === "string" || typeof action.payload?.assignee === "number"
          ? action.payload.assignee
          : null;
      state.assignee = pickAssignee({
        userId: assigneeUserId,
        assignee: action.payload?.assignee ?? null,
        people: state.people,
      });
    });
    builder.addCase(getTaskPeopleThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Somthing went wrong" };
      state.people = [];
      state.watcherIds = [];
      state.assignee = null;
    });

    builder.addCase(addTaskWatcherThunk.pending, (state, action) => {
      const userId = action.meta?.arg?.userId;
      if (userId != null) state.updatingWatcherByUserId[String(userId)] = true;
      state.error = null;
    });
    builder.addCase(addTaskWatcherThunk.fulfilled, (state, action) => {
      const { projectId, taskId, userId, watchers } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      state.taskId = taskId ?? state.taskId;
      if (userId != null) delete state.updatingWatcherByUserId[String(userId)];

      if (Array.isArray(watchers) && watchers.length) {
        state.watcherIds = normalizeWatcherIds(watchers);
        return;
      }

      const key = String(userId ?? "");
      if (!key) return;
      const set = new Set((state.watcherIds || []).map(String));
      set.add(key);
      state.watcherIds = Array.from(set);
    });
    builder.addCase(addTaskWatcherThunk.rejected, (state, action) => {
      const userId = action.meta?.arg?.userId;
      if (userId != null) delete state.updatingWatcherByUserId[String(userId)];
      state.error = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(removeTaskWatcherThunk.pending, (state, action) => {
      const userId = action.meta?.arg?.userId;
      if (userId != null) state.updatingWatcherByUserId[String(userId)] = true;
      state.error = null;
    });
    builder.addCase(removeTaskWatcherThunk.fulfilled, (state, action) => {
      const { projectId, taskId, userId } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      state.taskId = taskId ?? state.taskId;
      if (userId != null) delete state.updatingWatcherByUserId[String(userId)];
      const key = String(userId ?? "");
      if (!key) return;
      state.watcherIds = (state.watcherIds || []).filter((id) => String(id) !== key);
    });
    builder.addCase(removeTaskWatcherThunk.rejected, (state, action) => {
      const userId = action.meta?.arg?.userId;
      if (userId != null) delete state.updatingWatcherByUserId[String(userId)];
      state.error = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(setTaskAssigneeThunk.pending, (state) => {
      state.settingAssignee = true;
      state.error = null;
    });
    builder.addCase(setTaskAssigneeThunk.fulfilled, (state, action) => {
      state.settingAssignee = false;
      const { projectId, taskId, userId, assignee } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      state.taskId = taskId ?? state.taskId;
      state.assignee = pickAssignee({
        userId,
        assignee,
        people: state.people,
      });
    });
    builder.addCase(setTaskAssigneeThunk.rejected, (state, action) => {
      state.settingAssignee = false;
      state.error = action.payload || { message: "Somthing went wrong" };
    });
  },
});

export const { clearTaskPeople } = taskPeopleSlice.actions;
export default taskPeopleSlice.reducer;

export {
  addTaskWatcherThunk,
  getTaskPeopleThunk,
  removeTaskWatcherThunk,
  setTaskAssigneeThunk,
};
