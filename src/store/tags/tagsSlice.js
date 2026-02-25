import { createSlice } from "@reduxjs/toolkit";
import {
  createProjectTagThunk,
  createTaskTagThunk,
  deleteProjectTagThunk,
  deleteTaskTagThunk,
  getProjectTagsThunk,
  getTaskTagsThunk,
  toggleTaskTagThunk,
  updateProjectTagThunk,
  updateTaskTagThunk,
} from "../projects/projectDetailsSlice";

const getTagKey = (t) => String(t?.id ?? "");

const upsertById = (items, item) => {
  if (!item) return items;
  const key = getTagKey(item);
  if (!key) return items;
  const next = Array.isArray(items) ? [...items] : [];
  const idx = next.findIndex((t) => getTagKey(t) === key);
  if (idx >= 0) next[idx] = { ...next[idx], ...item };
  else next.unshift(item);
  return next;
};

const removeById = (items, id) => {
  const key = String(id ?? "");
  if (!key) return items;
  return (items || []).filter((t) => getTagKey(t) !== key);
};

const initialState = {
  projectId: null,
  items: [],
  status: "idle",
  error: null,

  taskProjectId: null,
  taskId: null,
  taskItems: [],
  taskStatus: "idle",
  taskError: null,

  saving: false,
  updatingByTagId: {},
  deletingByTagId: {},
  togglingByTagId: {},
};

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    clearTagsState: () => initialState,
    clearTaskTags: (state) => {
      state.taskProjectId = null;
      state.taskId = null;
      state.taskItems = [];
      state.taskStatus = "idle";
      state.taskError = null;
      state.togglingByTagId = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjectTagsThunk.pending, (state, action) => {
      state.status = "loading";
      state.error = null;
      state.projectId = action.meta?.arg ?? null;
    });
    builder.addCase(getProjectTagsThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.projectId = action.payload?.projectId ?? null;
      state.items = action.payload?.items || [];
    });
    builder.addCase(getProjectTagsThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Somthing went wrong" };
      state.items = [];
    });

    builder.addCase(createProjectTagThunk.pending, (state) => {
      state.saving = true;
      state.error = null;
    });
    builder.addCase(createProjectTagThunk.fulfilled, (state, action) => {
      state.saving = false;
      const { projectId, tag } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (tag) state.items = upsertById(state.items, tag);
    });
    builder.addCase(createProjectTagThunk.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(updateProjectTagThunk.pending, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) state.updatingByTagId[String(tagId)] = true;
      state.error = null;
    });
    builder.addCase(updateProjectTagThunk.fulfilled, (state, action) => {
      const { projectId, tagId, tag } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      const key = String(tagId ?? getTagKey(tag) ?? "");
      if (key) delete state.updatingByTagId[key];

      if (tag) {
        state.items = upsertById(state.items, tag);
        state.taskItems = (state.taskItems || []).map((t) =>
          getTagKey(t) === getTagKey(tag) ? { ...t, ...tag } : t,
        );
      }
    });
    builder.addCase(updateProjectTagThunk.rejected, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) delete state.updatingByTagId[String(tagId)];
      state.error = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(deleteProjectTagThunk.pending, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) state.deletingByTagId[String(tagId)] = true;
      state.error = null;
    });
    builder.addCase(deleteProjectTagThunk.fulfilled, (state, action) => {
      const { projectId, tagId } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (tagId != null) delete state.deletingByTagId[String(tagId)];
      state.items = removeById(state.items, tagId);
      state.taskItems = removeById(state.taskItems, tagId);
    });
    builder.addCase(deleteProjectTagThunk.rejected, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) delete state.deletingByTagId[String(tagId)];
      state.error = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(getTaskTagsThunk.pending, (state, action) => {
      state.taskStatus = "loading";
      state.taskError = null;
      state.taskProjectId = action.meta?.arg?.projectId ?? null;
      state.taskId = action.meta?.arg?.taskId ?? null;
    });
    builder.addCase(getTaskTagsThunk.fulfilled, (state, action) => {
      state.taskStatus = "succeeded";
      state.taskProjectId = action.payload?.projectId ?? null;
      state.taskId = action.payload?.taskId ?? null;
      state.taskItems = action.payload?.items || [];
    });
    builder.addCase(getTaskTagsThunk.rejected, (state, action) => {
      state.taskStatus = "failed";
      state.taskError = action.payload || { message: "Somthing went wrong" };
      state.taskItems = [];
    });

    builder.addCase(toggleTaskTagThunk.pending, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) state.togglingByTagId[String(tagId)] = true;
      state.taskError = null;
    });
    builder.addCase(toggleTaskTagThunk.fulfilled, (state, action) => {
      const { projectId, taskId, tagId, tags, tagIds } = action.payload || {};
      state.taskProjectId = projectId ?? state.taskProjectId;
      state.taskId = taskId ?? state.taskId;
      if (tagId != null) delete state.togglingByTagId[String(tagId)];

      if (Array.isArray(tags)) {
        state.taskItems = tags;
        return;
      }

      if (Array.isArray(tagIds)) {
        const byId = new Map(
          [...(state.items || []), ...(state.taskItems || [])].map((tag) => [
            getTagKey(tag),
            tag,
          ]),
        );
        state.taskItems = tagIds.map((id) => {
          const key = String(id);
          return byId.get(key) || { id };
        });
        return;
      }

      const key = String(tagId ?? "");
      if (!key) return;
      const has = (state.taskItems || []).some((t) => getTagKey(t) === key);
      if (has) {
        state.taskItems = removeById(state.taskItems, key);
        return;
      }

      const fromProject = (state.items || []).find((t) => getTagKey(t) === key);
      state.taskItems = [...(state.taskItems || []), fromProject || { id: tagId }];
    });
    builder.addCase(toggleTaskTagThunk.rejected, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) delete state.togglingByTagId[String(tagId)];
      state.taskError = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(createTaskTagThunk.pending, (state) => {
      state.saving = true;
      state.taskError = null;
    });
    builder.addCase(createTaskTagThunk.fulfilled, (state, action) => {
      state.saving = false;
      const { projectId, taskId, tag, tags, tagIds } = action.payload || {};
      state.taskProjectId = projectId ?? state.taskProjectId;
      state.taskId = taskId ?? state.taskId;

      if (tag) state.items = upsertById(state.items, tag);
      if (Array.isArray(tags)) {
        state.taskItems = tags;
        return;
      }
      if (Array.isArray(tagIds)) {
        const byId = new Map(
          [...(state.items || []), ...(state.taskItems || []), tag].map((current) => [
            getTagKey(current),
            current,
          ]),
        );
        state.taskItems = tagIds.map((id) => {
          const key = String(id);
          return byId.get(key) || { id };
        });
        return;
      }
      if (tag) state.taskItems = upsertById(state.taskItems, tag);
    });
    builder.addCase(createTaskTagThunk.rejected, (state, action) => {
      state.saving = false;
      state.taskError = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(updateTaskTagThunk.pending, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) state.updatingByTagId[String(tagId)] = true;
      state.error = null;
      state.taskError = null;
    });
    builder.addCase(updateTaskTagThunk.fulfilled, (state, action) => {
      const { projectId, taskId, tagId, tag } = action.payload || {};
      state.taskProjectId = projectId ?? state.taskProjectId;
      state.taskId = taskId ?? state.taskId;
      if (tagId != null) delete state.updatingByTagId[String(tagId)];
      if (!tag) return;
      state.items = upsertById(state.items, tag);
      state.taskItems = (state.taskItems || []).map((t) =>
        getTagKey(t) === getTagKey(tag) ? { ...t, ...tag } : t,
      );
    });
    builder.addCase(updateTaskTagThunk.rejected, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) delete state.updatingByTagId[String(tagId)];
      state.error = action.payload || { message: "Somthing went wrong" };
    });

    builder.addCase(deleteTaskTagThunk.pending, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) state.deletingByTagId[String(tagId)] = true;
      state.error = null;
      state.taskError = null;
    });
    builder.addCase(deleteTaskTagThunk.fulfilled, (state, action) => {
      const { projectId, taskId, tagId } = action.payload || {};
      state.taskProjectId = projectId ?? state.taskProjectId;
      state.taskId = taskId ?? state.taskId;
      if (tagId != null) delete state.deletingByTagId[String(tagId)];
      state.items = removeById(state.items, tagId);
      state.taskItems = removeById(state.taskItems, tagId);
    });
    builder.addCase(deleteTaskTagThunk.rejected, (state, action) => {
      const tagId = action.meta?.arg?.tagId;
      if (tagId != null) delete state.deletingByTagId[String(tagId)];
      state.error = action.payload || { message: "Somthing went wrong" };
    });
  },
});

export const { clearTagsState, clearTaskTags } = tagsSlice.actions;
export default tagsSlice.reducer;

export {
  createProjectTagThunk,
  createTaskTagThunk,
  deleteProjectTagThunk,
  deleteTaskTagThunk,
  getProjectTagsThunk,
  getTaskTagsThunk,
  toggleTaskTagThunk,
  updateProjectTagThunk,
  updateTaskTagThunk,
};
