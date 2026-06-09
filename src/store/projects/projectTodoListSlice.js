import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getError";

export const TODO_BOARD_TYPE = "todo_list";

const normalizeOrderedIds = (orderedIds) =>
  (Array.isArray(orderedIds) ? orderedIds : [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

const normalizeTaskIds = (taskIds) =>
  (Array.isArray(taskIds) ? taskIds : [])
    .map((id) => String(id ?? "").trim())
    .filter(Boolean);

const sortColumnsByPosition = (columns) =>
  [...(Array.isArray(columns) ? columns : [])].sort((a, b) => {
    const posDiff = Number(a?.position ?? 0) - Number(b?.position ?? 0);
    if (posDiff !== 0) return posDiff;
    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });

const isTodoTaskCompleted = (task) => {
  const status = String(task?.status ?? "").trim().toLowerCase();
  if (status === "done" || status === "completed") return true;
  return task?.is_completed === true || task?.is_completed === 1;
};

const sortTasksForTodoColumn = (tasks) =>
  [...(Array.isArray(tasks) ? tasks : [])].sort((a, b) => {
    const aCompleted = isTodoTaskCompleted(a) ? 1 : 0;
    const bCompleted = isTodoTaskCompleted(b) ? 1 : 0;
    if (aCompleted !== bCompleted) return aCompleted - bCompleted;

    const posDiff = Number(a?.position ?? 0) - Number(b?.position ?? 0);
    if (posDiff !== 0) return posDiff;
    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });

const normalizeColumns = (columns) =>
  sortColumnsByPosition(columns).map((column) => ({
    ...column,
    board_type: column?.board_type ?? TODO_BOARD_TYPE,
    tasks: Array.isArray(column?.tasks)
      ? sortTasksForTodoColumn(column.tasks)
      : column?.tasks,
  }));

export const getTodoListColumnsThunk = createAsyncThunk(
  "projectTodoList/getColumns",
  async ({ projectId, force = false }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/columns`, {
        params: { board_type: TODO_BOARD_TYPE },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      return {
        projectId,
        force,
        columns: normalizeColumns(Array.isArray(payload) ? payload : []),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createTodoListColumnThunk = createAsyncThunk(
  "projectTodoList/createColumn",
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/projects/${projectId}/columns`, {
        ...(payload || {}),
        board_type: TODO_BOARD_TYPE,
      });
      return {
        projectId,
        column: res?.data?.data ?? res?.data,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateTodoListColumnThunk = createAsyncThunk(
  "projectTodoList/updateColumn",
  async ({ projectId, columnId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/projects/${projectId}/columns/${columnId}`, {
        ...(payload || {}),
        board_type: TODO_BOARD_TYPE,
      });
      return {
        projectId,
        column: res?.data?.data ?? res?.data,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteTodoListColumnThunk = createAsyncThunk(
  "projectTodoList/deleteColumn",
  async ({ projectId, columnId }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/columns/${columnId}`, {
        params: { board_type: TODO_BOARD_TYPE },
      });
      return { projectId, columnId };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const reorderTodoListColumnsThunk = createAsyncThunk(
  "projectTodoList/reorderColumns",
  async ({ projectId, orderedIds }, { rejectWithValue }) => {
    try {
      const normalizedIds = normalizeOrderedIds(orderedIds);
      await api.patch(`/projects/${projectId}/columns/reorder`, {
        board_type: TODO_BOARD_TYPE,
        ordered_ids: normalizedIds,
      });
      return { projectId, orderedIds: normalizedIds };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const getTodoListColumnTasksThunk = createAsyncThunk(
  "projectTodoList/getColumnTasks",
  async ({ projectId, columnId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/projects/${projectId}/columns/${columnId}/tasks`);
      const payload = res?.data?.data ?? res?.data ?? [];
      return {
        projectId,
        columnId,
        tasks: sortTasksForTodoColumn(Array.isArray(payload) ? payload : []),
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createTodoListTaskThunk = createAsyncThunk(
  "projectTodoList/createTask",
  async ({ projectId, columnId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `/projects/${projectId}/columns/${columnId}/tasks`,
        {
          ...(payload || {}),
          status: "open",
        },
      );
      return {
        projectId,
        columnId,
        task: res?.data?.data ?? res?.data,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const toggleTodoListTaskCompletionThunk = createAsyncThunk(
  "projectTodoList/toggleTaskCompletion",
  async ({ projectId, columnId, taskId, isCompleted }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/projects/${projectId}/tasks/${taskId}/complete`, {
        is_completed: Boolean(isCompleted),
      });
      return {
        projectId,
        columnId,
        taskId,
        task: res?.data?.data ?? res?.data,
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const reorderTodoListTaskThunk = createAsyncThunk(
  "projectTodoList/reorderTask",
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
        return rejectWithValue({ message: "Invalid todo reorder payload." });
      }

      const reorderColumnTasks = async (columnId, orderedTaskIds) => {
        const orderedIds = toOrderedIntIds(orderedTaskIds);
        if (!orderedIds.length) return;

        await api.patch(
          `/projects/${normalizedProjectId}/columns/${columnId}/tasks/reorder`,
          { ordered_ids: orderedIds },
        );
      };

      const sameColumn =
        normalizedSourceColumnId === normalizedDestinationColumnId;

      if (!sameColumn) {
        await api.patch(
          `/projects/${normalizedProjectId}/columns/${normalizedSourceColumnId}/tasks/${normalizedTaskId}`,
          {
            column_id: normalizedDestinationColumnId,
          },
        );
      }

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

const initialState = {
  items: [],
  projectId: null,
  status: "idle",
  error: null,
  tasksLoadingByColumnId: {},
  tasksErrorByColumnId: {},
  completingByTaskId: {},
};

const updateColumnTasks = (items, columnId, updater) =>
  (items || []).map((column) => {
    if (String(column?.id) !== String(columnId)) return column;
    const nextTasks = updater(Array.isArray(column.tasks) ? column.tasks : []);
    return {
      ...column,
      tasks: sortTasksForTodoColumn(nextTasks),
      tasks_count: nextTasks.length,
    };
  });

const projectTodoListSlice = createSlice({
  name: "projectTodoList",
  initialState,
  reducers: {
    clearTodoList: () => initialState,
    patchTodoTask: (state, action) => {
      const { columnId, taskId, patch } = action.payload || {};
      if (!columnId || !taskId || !patch) return;

      state.items = updateColumnTasks(state.items, columnId, (tasks) =>
        tasks.map((task) =>
          String(task?.id) === String(taskId) ? { ...task, ...patch } : task,
        ),
      );
    },
    removeTodoTask: (state, action) => {
      const { columnId, taskId } = action.payload || {};
      if (!columnId || !taskId) return;

      state.items = updateColumnTasks(state.items, columnId, (tasks) =>
        tasks.filter((task) => String(task?.id) !== String(taskId)),
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTodoListColumnsThunk.pending, (state, action) => {
      state.status = "loading";
      state.error = null;
      state.projectId = action.meta?.arg?.projectId ?? state.projectId;
      state.tasksLoadingByColumnId = {};
      state.tasksErrorByColumnId = {};
    });
    builder.addCase(getTodoListColumnsThunk.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.projectId = action.payload?.projectId ?? null;

      const previousTasks = new Map(
        (state.items || []).map((column) => [String(column?.id), column?.tasks]),
      );

      state.items = normalizeColumns(
        (action.payload?.columns || []).map((column) => {
          if (Array.isArray(column?.tasks)) return column;
          const existingTasks = previousTasks.get(String(column?.id));
          return Array.isArray(existingTasks)
            ? { ...column, tasks: existingTasks }
            : column;
        }),
      );
    });
    builder.addCase(getTodoListColumnsThunk.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || { message: "Something went wrong" };
      state.items = [];
    });

    builder.addCase(createTodoListColumnThunk.fulfilled, (state, action) => {
      const { projectId, column } = action.payload || {};
      if (!column) return;
      state.projectId = projectId ?? state.projectId;
      state.items = normalizeColumns([...(state.items || []), column]);
    });
    builder.addCase(updateTodoListColumnThunk.fulfilled, (state, action) => {
      const { projectId, column } = action.payload || {};
      if (!column) return;
      state.projectId = projectId ?? state.projectId;
      state.items = normalizeColumns(
        (state.items || []).map((item) =>
          String(item?.id) === String(column?.id) ? { ...item, ...column } : item,
        ),
      );
    });
    builder.addCase(deleteTodoListColumnThunk.fulfilled, (state, action) => {
      const { projectId, columnId } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      state.items = (state.items || []).filter(
        (column) => String(column?.id) !== String(columnId),
      );
    });
    builder.addCase(reorderTodoListColumnsThunk.fulfilled, (state, action) => {
      const ids = normalizeOrderedIds(action.payload?.orderedIds).map(String);
      if (!ids.length) return;
      const byId = new Map((state.items || []).map((column) => [String(column?.id), column]));
      const used = new Set();
      const ordered = [];
      ids.forEach((id) => {
        const column = byId.get(id);
        if (!column || used.has(id)) return;
        used.add(id);
        ordered.push(column);
      });
      (state.items || []).forEach((column) => {
        const id = String(column?.id);
        if (!used.has(id)) ordered.push(column);
      });
      state.items = ordered.map((column, index) => ({ ...column, position: index + 1 }));
    });

    builder.addCase(getTodoListColumnTasksThunk.pending, (state, action) => {
      const { projectId, columnId } = action.meta?.arg ?? {};
      state.projectId = projectId ?? state.projectId;
      if (columnId == null) return;
      state.tasksLoadingByColumnId[String(columnId)] = true;
      delete state.tasksErrorByColumnId[String(columnId)];
    });
    builder.addCase(getTodoListColumnTasksThunk.fulfilled, (state, action) => {
      const { projectId, columnId, tasks } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (columnId == null) return;
      delete state.tasksLoadingByColumnId[String(columnId)];
      state.items = updateColumnTasks(state.items, columnId, () => tasks || []);
    });
    builder.addCase(getTodoListColumnTasksThunk.rejected, (state, action) => {
      const { columnId } = action.meta?.arg ?? {};
      if (columnId == null) return;
      delete state.tasksLoadingByColumnId[String(columnId)];
      state.tasksErrorByColumnId[String(columnId)] =
        action.payload || { message: "Something went wrong" };
    });

    builder.addCase(createTodoListTaskThunk.fulfilled, (state, action) => {
      const { projectId, columnId, task } = action.payload || {};
      if (!columnId || !task) return;
      state.projectId = projectId ?? state.projectId;
      state.items = updateColumnTasks(state.items, columnId, (tasks) => [
        task,
        ...tasks.filter((item) => String(item?.id) !== String(task?.id)),
      ]);
    });

    builder.addCase(toggleTodoListTaskCompletionThunk.pending, (state, action) => {
      const taskId = action.meta?.arg?.taskId;
      if (taskId == null) return;
      state.completingByTaskId[String(taskId)] = true;
    });
    builder.addCase(toggleTodoListTaskCompletionThunk.fulfilled, (state, action) => {
      const { projectId, columnId, taskId, task } = action.payload || {};
      state.projectId = projectId ?? state.projectId;
      if (taskId != null) delete state.completingByTaskId[String(taskId)];
      if (!columnId || !task) return;

      state.items = updateColumnTasks(state.items, columnId, (tasks) =>
        tasks.map((item) =>
          String(item?.id) === String(taskId) ? { ...item, ...task } : item,
        ),
      );
    });
    builder.addCase(toggleTodoListTaskCompletionThunk.rejected, (state, action) => {
      const taskId = action.meta?.arg?.taskId;
      if (taskId == null) return;
      delete state.completingByTaskId[String(taskId)];
    });

    builder.addCase(reorderTodoListTaskThunk.fulfilled, (state, action) => {
      const {
        projectId,
        taskId,
        sourceColumnId,
        destinationColumnId,
        sourceTaskIds,
        destinationTaskIds,
      } = action.payload || {};

      state.projectId = projectId ?? state.projectId;
      if (!taskId || !sourceColumnId || !destinationColumnId) return;

      const movedTask = (state.items || [])
        .flatMap((column) => (Array.isArray(column?.tasks) ? column.tasks : []))
        .find((task) => String(task?.id) === String(taskId));

      state.items = (state.items || []).map((column) => {
        const columnId = String(column?.id);
        const isSource = columnId === String(sourceColumnId);
        const isDestination = columnId === String(destinationColumnId);
        if (!isSource && !isDestination) return column;

        const currentTasks = Array.isArray(column?.tasks) ? column.tasks : [];
        let nextTasks = currentTasks;

        if (isSource && !isDestination) {
          nextTasks = currentTasks.filter(
            (task) => String(task?.id) !== String(taskId),
          );
        }

        if (isDestination) {
          const orderedIds =
            sourceColumnId === destinationColumnId
              ? normalizeTaskIds(sourceTaskIds)
              : normalizeTaskIds(destinationTaskIds);
          const byId = new Map(
            currentTasks
              .filter((task) => String(task?.id) !== String(taskId))
              .map((task) => [String(task?.id), task]),
          );

          if (movedTask) {
            byId.set(String(taskId), {
              ...movedTask,
              column_id: destinationColumnId,
              columnId: destinationColumnId,
            });
          }

          const used = new Set();
          nextTasks = orderedIds
            .map((id, index) => {
              const task = byId.get(String(id));
              if (!task) return null;
              used.add(String(id));
              return { ...task, position: index + 1 };
            })
            .filter(Boolean);

          byId.forEach((task, id) => {
            if (!used.has(String(id))) nextTasks.push(task);
          });
        }

        return {
          ...column,
          tasks: sortTasksForTodoColumn(nextTasks),
          tasks_count: nextTasks.length,
        };
      });
    });
  },
});

export const { clearTodoList, patchTodoTask, removeTodoTask } =
  projectTodoListSlice.actions;

export default projectTodoListSlice.reducer;
