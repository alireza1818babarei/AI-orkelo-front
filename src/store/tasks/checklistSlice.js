import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const normalizeOrderedIds = (orderedIds) =>
  (Array.isArray(orderedIds) ? orderedIds : [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

const normalizeParentItemId = (parentItemId) => {
  if (parentItemId == null || parentItemId === "" || parentItemId === "root") {
    return null;
  }
  const n = Number(parentItemId);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const buildReorderKey = ({ projectId, taskId, parentItemId }) =>
  `${projectId}:${taskId}:${parentItemId ?? "root"}`;

export const reorderTaskChecklistItemsThunk = createAsyncThunk(
  "taskChecklist/reorder",
  async (
    { projectId, taskId, orderedIds, parentItemId = null },
    { rejectWithValue },
  ) => {
    try {
      const normalizedProjectId = Number(projectId);
      const normalizedTaskId = Number(taskId);
      const normalizedOrderedIds = normalizeOrderedIds(orderedIds);
      const normalizedParentItemId = normalizeParentItemId(parentItemId);

      if (
        !Number.isInteger(normalizedProjectId) ||
        normalizedProjectId <= 0 ||
        !Number.isInteger(normalizedTaskId) ||
        normalizedTaskId <= 0 ||
        !normalizedOrderedIds.length
      ) {
        return rejectWithValue({ message: "Invalid checklist reorder payload." });
      }

      await api.patch(
        `/projects/${normalizedProjectId}/tasks/${normalizedTaskId}/checklist-items/reorder`,
        {
          ordered_ids: normalizedOrderedIds,
          ...(normalizedParentItemId != null
            ? { parent_item_id: normalizedParentItemId }
            : {}),
        },
      );

      return {
        projectId: normalizedProjectId,
        taskId: normalizedTaskId,
        orderedIds: normalizedOrderedIds,
        parentItemId: normalizedParentItemId,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

const initialState = {
  reorderStatusByKey: {},
  reorderErrorByKey: {},
};

const checklistSlice = createSlice({
  name: "taskChecklist",
  initialState,
  reducers: {
    clearTaskChecklistState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(reorderTaskChecklistItemsThunk.pending, (state, action) => {
      const key = buildReorderKey({
        projectId: action.meta?.arg?.projectId,
        taskId: action.meta?.arg?.taskId,
        parentItemId: normalizeParentItemId(action.meta?.arg?.parentItemId),
      });
      state.reorderStatusByKey[key] = "loading";
      delete state.reorderErrorByKey[key];
    });
    builder.addCase(reorderTaskChecklistItemsThunk.fulfilled, (state, action) => {
      const key = buildReorderKey({
        projectId: action.payload?.projectId,
        taskId: action.payload?.taskId,
        parentItemId: action.payload?.parentItemId ?? null,
      });
      state.reorderStatusByKey[key] = "succeeded";
      delete state.reorderErrorByKey[key];
    });
    builder.addCase(reorderTaskChecklistItemsThunk.rejected, (state, action) => {
      const key = buildReorderKey({
        projectId: action.meta?.arg?.projectId,
        taskId: action.meta?.arg?.taskId,
        parentItemId: normalizeParentItemId(action.meta?.arg?.parentItemId),
      });
      state.reorderStatusByKey[key] = "failed";
      state.reorderErrorByKey[key] =
        action.payload || { message: "Somthing went wrong" };
    });
  },
});

export const { clearTaskChecklistState } = checklistSlice.actions;
export default checklistSlice.reducer;
