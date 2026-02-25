import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

const normalizeOrderedIds = (orderedIds) =>
  (Array.isArray(orderedIds) ? orderedIds : [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

const toSortableColumnPosition = (column) => {
  const n = Number(column?.position);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
};

const sortColumnsByPosition = (columns) => {
  const next = Array.isArray(columns) ? [...columns] : [];
  return next.sort((a, b) => {
    const posDiff = toSortableColumnPosition(a) - toSortableColumnPosition(b);
    if (posDiff !== 0) return posDiff;

    const aId = Number(a?.id);
    const bId = Number(b?.id);
    if (Number.isFinite(aId) && Number.isFinite(bId)) return aId - bId;

    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
  });
};

const toTaskIdKey = (task) => String(task?.id ?? "");

const normalizeTaskIds = (taskIds) =>
  (Array.isArray(taskIds) ? taskIds : [])
    .map((id) => String(id ?? "").trim())
    .filter(Boolean);

const normalizeColumnIdValue = (columnId) => {
  const n = Number(columnId);
  return Number.isInteger(n) && n > 0 ? n : columnId;
};

const buildTaskByIdMap = (columns) => {
  const map = new Map();
  (Array.isArray(columns) ? columns : []).forEach((column) => {
    const tasks = Array.isArray(column?.tasks) ? column.tasks : [];
    tasks.forEach((task) => {
      const key = toTaskIdKey(task);
      if (!key || map.has(key)) return;
      map.set(key, task);
    });
  });
  return map;
};

const applyTaskOrderToColumn = ({
  tasks,
  orderedTaskIds,
  columnId,
  taskById,
  keepRest = true,
}) => {
  const nextTasks = Array.isArray(tasks) ? tasks : [];
  const normalizedIds = normalizeTaskIds(orderedTaskIds);
  if (!normalizedIds.length) {
    return keepRest ? nextTasks : [];
  }

  const byId =
    taskById instanceof Map
      ? taskById
      : new Map(nextTasks.map((task) => [toTaskIdKey(task), task]));
  const used = new Set();
  const normalizedColumnId = normalizeColumnIdValue(columnId);

  const orderedTasks = [];
  normalizedIds.forEach((id, index) => {
    if (used.has(id)) return;
    const task = byId.get(id);
    if (!task) return;
    used.add(id);
    orderedTasks.push({
      ...task,
      position: index + 1,
      column_id: normalizedColumnId,
      columnId: normalizedColumnId,
    });
  });

  if (keepRest) {
    nextTasks.forEach((task) => {
      const key = toTaskIdKey(task);
      if (!key || used.has(key)) return;
      orderedTasks.push(task);
    });
  }

  return orderedTasks;
};

const applyTaskReorder = (columns, payload) => {
  const nextColumns = Array.isArray(columns) ? columns : [];
  const sourceColumnId = String(payload?.sourceColumnId ?? "");
  const destinationColumnId = String(payload?.destinationColumnId ?? "");
  const sourceTaskIds = normalizeTaskIds(payload?.sourceTaskIds);
  const destinationTaskIds = normalizeTaskIds(payload?.destinationTaskIds);

  if (!sourceColumnId || !destinationColumnId) return nextColumns;
  const taskById = buildTaskByIdMap(nextColumns);

  return nextColumns.map((column) => {
    const columnId = String(column?.id ?? "");
    if (columnId === sourceColumnId && columnId === destinationColumnId) {
      return {
        ...column,
        tasks: applyTaskOrderToColumn({
          tasks: column?.tasks,
          orderedTaskIds: sourceTaskIds,
          columnId: column?.id,
          taskById,
          keepRest: true,
        }),
      };
    }

    if (columnId === sourceColumnId) {
      return {
        ...column,
        tasks: applyTaskOrderToColumn({
          tasks: column?.tasks,
          orderedTaskIds: sourceTaskIds,
          columnId: column?.id,
          taskById,
          keepRest: false,
        }),
      };
    }

    if (columnId === destinationColumnId) {
      return {
        ...column,
        tasks: applyTaskOrderToColumn({
          tasks: column?.tasks,
          orderedTaskIds: destinationTaskIds,
          columnId: column?.id,
          taskById,
          keepRest: false,
        }),
      };
    }

    return column;
  });
};

const applyColumnOrder = (columns, orderedIds) => {
  const nextColumns = Array.isArray(columns) ? columns : [];
  const normalizedIds = normalizeOrderedIds(orderedIds).map(String);
  if (!normalizedIds.length) return nextColumns;

  const byId = new Map(nextColumns.map((column) => [String(column?.id), column]));
  const used = new Set();
  const orderedColumns = [];

  normalizedIds.forEach((id) => {
    if (used.has(id)) return;
    const column = byId.get(id);
    if (!column) return;
    used.add(id);
    orderedColumns.push(column);
  });

  nextColumns.forEach((column) => {
    const key = String(column?.id);
    if (used.has(key)) return;
    orderedColumns.push(column);
  });

  return orderedColumns.map((column, index) => ({
    ...column,
    position: index + 1,
  }));
};

export const getProjectColumnsThunk = createAsyncThunk(
  "projectColumns/getByProject",
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const list = state?.projects?.items || [];
      const fromList = list.find((p) => String(p.id) === String(projectId));
      if (fromList && Array.isArray(fromList.columns)) {
        return { projectId, columns: sortColumnsByPosition(fromList.columns) };
      }

      const res = await api.get(`/projects/${projectId}`);
      const root = res.data?.data ?? res.data ?? null;
      const d = root?.data ?? root ?? null;
      const columns =
        d?.columns ??
        d?.project?.columns ??
        root?.columns ??
        root?.project?.columns ??
        [];
      return {
        projectId,
        columns: sortColumnsByPosition(Array.isArray(columns) ? columns : []),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createProjectColumnThunk = createAsyncThunk(
  "projectColumns/create",
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/projects/${projectId}/columns`, payload);
      return { projectId, column: res.data?.data ?? res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateProjectColumnThunk = createAsyncThunk(
  "projectColumns/update",
  async ({ projectId, columnId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.put(
        `/projects/${projectId}/columns/${columnId}`,
        payload,
      );
      return { projectId, column: res.data?.data ?? res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteProjectColumnThunk = createAsyncThunk(
  "projectColumns/delete",
  async ({ projectId, columnId }, { rejectWithValue }) => {
    try {
      const res = await api.delete(
        `/projects/${projectId}/columns/${columnId}`,
      );
      return { projectId, columnId, data: res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createProjectTaskThunk = createAsyncThunk(
  "projectColumns/createTask",
  async ({ projectId, columnId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `/projects/${projectId}/columns/${columnId}/tasks`,
        payload,
      );
      const data = res.data?.data ?? res.data;
      const createdTaskId = data?.id ?? null;

      const missingMeta = createdTaskId && (!data?.created_at || !data?.updated_at);
      let enriched = null;
      if (missingMeta) {
        try {
          const metaRes = await api.get(`/projects/${projectId}/tasks/${createdTaskId}`);
          const metaPayload = metaRes?.data?.data ?? metaRes?.data ?? null;
          enriched =
            metaPayload?.task ??
            metaPayload?.data?.task ??
            metaPayload?.data ??
            metaPayload ??
            null;
        } catch {
          enriched = null;
        }
      }
      return {
        projectId,
        columnId,
        task: { ...(payload || {}), ...(data || {}), ...(enriched || {}) },
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const reorderProjectColumnsThunk = createAsyncThunk(
  "projectColumns/reorder",
  async ({ projectId, orderedIds }, { rejectWithValue }) => {
    try {
      const normalizedIds = normalizeOrderedIds(orderedIds);
      if (!normalizedIds.length) {
        return { projectId, orderedIds: [] };
      }

      await api.patch(`/projects/${projectId}/columns/reorder`, {
        ordered_ids: normalizedIds,
      });

      return { projectId, orderedIds: normalizedIds };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const reorderProjectTaskThunk = createAsyncThunk(
  "projectColumns/reorderTask",
  async (
    {
      projectId,
      taskId,
      sourceColumnId,
      destinationColumnId,
      sourceTaskIds,
      destinationTaskIds,
    },
    { rejectWithValue },
  ) => {
    try {
      const normalizedProjectId = Number(projectId);
      const normalizedTaskId = Number(taskId);
      const normalizedSourceColumnId = Number(sourceColumnId);
      const normalizedDestinationColumnId = Number(destinationColumnId);
      const normalizedSourceTaskIds = normalizeTaskIds(sourceTaskIds);
      const normalizedDestinationTaskIds = normalizeTaskIds(destinationTaskIds);
      const toOrderedIntIds = (ids) =>
        (Array.isArray(ids) ? ids : [])
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0);

      if (
        !Number.isInteger(normalizedProjectId) ||
        normalizedProjectId <= 0 ||
        !Number.isInteger(normalizedTaskId) ||
        normalizedTaskId <= 0 ||
        !Number.isInteger(normalizedSourceColumnId) ||
        normalizedSourceColumnId <= 0 ||
        !Number.isInteger(normalizedDestinationColumnId) ||
        normalizedDestinationColumnId <= 0
      ) {
        return rejectWithValue({ message: "Invalid task reorder payload." });
      }

      const sameColumn = normalizedSourceColumnId === normalizedDestinationColumnId;
      const reorderColumnTasks = async (columnId, orderedTaskIds) => {
        const orderedIds = toOrderedIntIds(orderedTaskIds);
        if (!orderedIds.length) return;

        await api.patch(
          `/projects/${normalizedProjectId}/columns/${columnId}/tasks/reorder`,
          { ordered_ids: orderedIds },
        );
      };

      if (sameColumn) {
        await reorderColumnTasks(normalizedSourceColumnId, normalizedSourceTaskIds);

        return {
          projectId: normalizedProjectId,
          taskId: normalizedTaskId,
          sourceColumnId: normalizedSourceColumnId,
          destinationColumnId: normalizedDestinationColumnId,
          sourceTaskIds: normalizedSourceTaskIds,
          destinationTaskIds: normalizedDestinationTaskIds,
        };
      }

      await api.patch(
        `/projects/${normalizedProjectId}/columns/${normalizedSourceColumnId}/tasks/${normalizedTaskId}`,
        {
          column_id: normalizedDestinationColumnId,
        },
      );

      await reorderColumnTasks(
        normalizedDestinationColumnId,
        normalizedDestinationTaskIds,
      );

      return {
        projectId: normalizedProjectId,
        taskId: normalizedTaskId,
        sourceColumnId: normalizedSourceColumnId,
        destinationColumnId: normalizedDestinationColumnId,
        sourceTaskIds: normalizedSourceTaskIds,
        destinationTaskIds: normalizedDestinationTaskIds,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const getColumnTasksThunk = createAsyncThunk(
  "projectColumns/getColumnTasks",
  async ({ projectId, columnId }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/projects/${projectId}/columns/${columnId}/tasks`,
      );
      const payload = res.data?.data ?? res.data ?? [];
      return {
        projectId,
        columnId,
        tasks: Array.isArray(payload) ? payload : [],
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
  {
    condition: ({ projectId, columnId, force }, { getState }) => {
      if (force) return true;

      const state = getState();
      const slice = state?.projectColumns ?? null;
      if (!slice) return true;

      if (slice.projectId && String(slice.projectId) !== String(projectId)) {
        return true;
      }

      const key = String(columnId ?? "");
      if (slice.tasksLoadingByColumnId?.[key]) return false;

      const col = (slice.items || []).find((c) => String(c?.id) === key);
      if (!col) return true;

      if (Array.isArray(col.tasks)) return false;

      return true;
    },
  },
);

const initialState = {
  items: [],
  projectId: null,
  status: "idle",
  error: null,
  tasksLoadingByColumnId: {},
  tasksErrorByColumnId: {},
};

const projectColumnsSlice = createSlice({
  name: "projectColumns",
  initialState,
  reducers: {
    clearProjectColumns: () => initialState,
    setProjectColumns: (state, action) => {
      state.projectId = action.payload?.projectId ?? null;
      state.items = sortColumnsByPosition(action.payload?.columns || []);
      state.tasksLoadingByColumnId = {};
      state.tasksErrorByColumnId = {};
    },
    reorderProjectColumnsLocal: (state, action) => {
      const { projectId, orderedIds } = action.payload || {};
      if (
        projectId != null &&
        state.projectId != null &&
        String(state.projectId) !== String(projectId)
      ) {
        return;
      }

      state.projectId = projectId ?? state.projectId;
      state.items = applyColumnOrder(state.items, orderedIds);
    },
    reorderProjectTasksLocal: (state, action) => {
      const { projectId } = action.payload || {};
      if (
        projectId != null &&
        state.projectId != null &&
        String(state.projectId) !== String(projectId)
      ) {
        return;
      }

      state.projectId = projectId ?? state.projectId;
      state.items = applyTaskReorder(state.items, action.payload || {});
    },
    updateTaskInColumn: (state, action) => {
      const { columnId, taskId, patch } = action.payload || {};
      if (!taskId || !patch) return;

      const matchesTask = (t) =>
        String(t?.id) === String(taskId);

      state.items = (state.items || []).map((c) => {
        if (columnId && String(c.id) !== String(columnId)) return c;

        const tasks = Array.isArray(c.tasks) ? c.tasks : [];
        let found = false;

        const nextTasks = tasks.map((t) => {
          if (!matchesTask(t)) return t;
          found = true;
          return { ...t, ...(patch || {}) };
        });

        if (!found && columnId && String(c.id) === String(columnId)) {
          nextTasks.push({
            id: taskId,
            ...(patch || {}),
          });
        }

        if (!found && !columnId) return c;
        return { ...c, tasks: nextTasks };
      });
    },
    removeTaskFromColumn: (state, action) => {
      const { columnId, taskId } = action.payload || {};
      if (!columnId || !taskId) return;
      state.items = (state.items || []).map((c) => {
        if (String(c.id) !== String(columnId)) return c;
        const nextTasks = Array.isArray(c.tasks) ? c.tasks : [];
        return {
          ...c,
          tasks: nextTasks.filter(
            (t) => String(t.id) !== String(taskId),
          ),
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjectColumnsThunk.pending, (state) => {
      state.status = "loading";
      state.error = null;
      state.tasksLoadingByColumnId = {};
      state.tasksErrorByColumnId = {};
    });
    builder.addCase(getProjectColumnsThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      const projectId = action.payload?.projectId ?? null;
      const nextColumns = action.payload?.columns || [];

      const prevTasksByColumnId = new Map(
        (state.items || []).map((c) => [String(c?.id), c?.tasks]),
      );

      state.projectId = projectId;
      state.items = sortColumnsByPosition(
        (nextColumns || []).map((c) => {
          const key = String(c?.id);
          const existingTasks = c?.tasks;
          if (existingTasks != null) return c;

          const prevTasks = prevTasksByColumnId.get(key);
          if (Array.isArray(prevTasks)) return { ...c, tasks: prevTasks };

          return c;
        }),
      );
    });
    builder.addCase(getProjectColumnsThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Somthing went wrong" };
      state.items = [];
      state.tasksLoadingByColumnId = {};
      state.tasksErrorByColumnId = {};
    });

    builder.addCase(createProjectColumnThunk.fulfilled, (state, action) => {
      const { projectId, column } = action.payload || {};
      if (!column) return;
      state.projectId = projectId ?? state.projectId;
      state.items = sortColumnsByPosition([...(state.items || []), column]);
    });
    builder.addCase(updateProjectColumnThunk.fulfilled, (state, action) => {
      const { projectId, column } = action.payload || {};
      if (!column) return;
      state.projectId = projectId ?? state.projectId;
      state.items = sortColumnsByPosition(
        (state.items || []).map((c) =>
          String(c.id) === String(column.id) ? { ...c, ...column } : c,
        ),
      );
    });
    builder.addCase(deleteProjectColumnThunk.fulfilled, (state, action) => {
      const { projectId, columnId } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (!columnId) return;
      const key = String(columnId);
      delete state.tasksLoadingByColumnId?.[key];
      delete state.tasksErrorByColumnId?.[key];
      state.items = (state.items || []).filter(
        (c) => String(c.id) !== String(columnId),
      );
    });
    builder.addCase(reorderProjectColumnsThunk.fulfilled, (state, action) => {
      const { projectId, orderedIds } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (!orderedIds?.length) return;
      state.items = applyColumnOrder(state.items, orderedIds);
    });
    builder.addCase(reorderProjectTaskThunk.fulfilled, (state, action) => {
      const { projectId } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      state.items = applyTaskReorder(state.items, action.payload || {});
    });

    builder.addCase(createProjectTaskThunk.fulfilled, (state, action) => {
      const { projectId, columnId, task } = action.payload || {};
      if (!task || !columnId) return;
      state.projectId = projectId ?? state.projectId;
      state.items = (state.items || []).map((c) => {
        if (String(c.id) !== String(columnId)) return c;
        const nextTasks = Array.isArray(c.tasks) ? [...c.tasks] : [];
        nextTasks.push(task);
        return { ...c, tasks: nextTasks };
      });
    });

    builder.addCase(getColumnTasksThunk.pending, (state, action) => {
      const { projectId, columnId } = action.meta?.arg ?? {};
      state.projectId = projectId ?? state.projectId;
      if (columnId == null) return;
      const key = String(columnId);
      state.tasksLoadingByColumnId[key] = true;
      delete state.tasksErrorByColumnId[key];
    });
    builder.addCase(getColumnTasksThunk.fulfilled, (state, action) => {
      const { projectId, columnId, tasks } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (columnId == null) return;
      const key = String(columnId);
      delete state.tasksLoadingByColumnId[key];
      delete state.tasksErrorByColumnId[key];

      const sorted = Array.isArray(tasks)
        ? [...tasks].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
        : [];

      state.items = (state.items || []).map((c) => {
        if (String(c?.id) !== key) return c;
        return { ...c, tasks: sorted };
      });
    });
    builder.addCase(getColumnTasksThunk.rejected, (state, action) => {
      const { projectId, columnId } = action.meta?.arg ?? {};
      state.projectId = projectId ?? state.projectId;
      if (columnId == null) return;
      const key = String(columnId);
      delete state.tasksLoadingByColumnId[key];
      state.tasksErrorByColumnId[key] =
        action.payload || { message: "Somthing went wrong" };

      state.items = (state.items || []).map((c) => {
        if (String(c?.id) !== key) return c;
        return { ...c, tasks: [] };
      });
    });
  },
});

export const {
  clearProjectColumns,
  setProjectColumns,
  reorderProjectColumnsLocal,
  reorderProjectTasksLocal,
  updateTaskInColumn,
  removeTaskFromColumn,
} = projectColumnsSlice.actions;
export default projectColumnsSlice.reducer;
