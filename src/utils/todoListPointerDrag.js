import {
  getTodoListColumnTasksThunk,
  getTodoListColumnsThunk,
  reorderTodoListTaskThunk,
} from "../store/projects/projectTodoListSlice";
import { registerPointerListDragSurface } from "./pointerListDragEngine";
import { toastError } from "./sweetAlert";

const isCompleted = (task) => {
  const status = String(task?.status ?? "").trim().toLowerCase();
  return (
    status === "done" ||
    status === "completed" ||
    task?.is_completed === true ||
    task?.is_completed === 1
  );
};

const getColumns = (store) => store.getState()?.projectTodoList?.items || [];

const getColumn = (store, columnId) =>
  getColumns(store).find(
    (column) => String(column?.id ?? "") === String(columnId),
  );

const findTaskRecord = (store, taskId) => {
  for (const column of getColumns(store)) {
    const tasks = Array.isArray(column?.tasks) ? column.tasks : [];
    const task = tasks.find((item) => String(item?.id ?? "") === String(taskId));
    if (task) return { task, column };
  }

  return null;
};

const normalizeIndex = (store, { itemId, containerId, rawIndex }) => {
  const destinationColumn = getColumn(store, containerId);
  const draggedTask = findTaskRecord(store, itemId)?.task;
  const destinationTasks = (destinationColumn?.tasks || []).filter(
    (task) => String(task?.id ?? "") !== String(itemId),
  );
  const boundedIndex = Math.min(
    Math.max(Number(rawIndex) || 0, 0),
    destinationTasks.length,
  );
  const activeCount = destinationTasks.filter((task) => !isCompleted(task)).length;

  return isCompleted(draggedTask)
    ? Math.max(boundedIndex, activeCount)
    : Math.min(boundedIndex, activeCount);
};

const buildPayload = (
  store,
  { itemId, destinationContainerId, destinationIndex },
) => {
  const projectId = Number(store.getState()?.projectTodoList?.projectId);
  const taskRecord = findTaskRecord(store, itemId);
  const sourceColumnId = String(taskRecord?.column?.id ?? "");
  const destinationColumnId = String(destinationContainerId ?? "");
  const sourceColumn = getColumn(store, sourceColumnId);
  const destinationColumn = getColumn(store, destinationColumnId);

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !taskRecord?.task ||
    !sourceColumn ||
    !destinationColumn
  ) {
    return null;
  }

  const previousSourceTaskIds = (sourceColumn.tasks || []).map((task) =>
    String(task?.id ?? ""),
  );
  const previousDestinationTaskIds =
    sourceColumnId === destinationColumnId
      ? [...previousSourceTaskIds]
      : (destinationColumn.tasks || []).map((task) => String(task?.id ?? ""));
  const sourceTaskIds = previousSourceTaskIds.filter(
    (id) => id && id !== String(itemId),
  );
  const destinationTaskIds =
    sourceColumnId === destinationColumnId
      ? sourceTaskIds
      : previousDestinationTaskIds.filter(
          (id) => id && id !== String(itemId),
        );
  const index = normalizeIndex(store, {
    itemId,
    containerId: destinationColumnId,
    rawIndex: destinationIndex,
  });

  destinationTaskIds.splice(index, 0, String(itemId));

  if (
    sourceColumnId === destinationColumnId &&
    previousSourceTaskIds.join("|") === destinationTaskIds.join("|")
  ) {
    return null;
  }

  return {
    projectId,
    taskId: String(itemId),
    sourceColumnId,
    destinationColumnId,
    sourceTaskIds:
      sourceColumnId === destinationColumnId
        ? destinationTaskIds
        : sourceTaskIds,
    destinationTaskIds,
    previousSourceTaskIds,
    previousDestinationTaskIds,
  };
};

const dispatchOptimistic = (store, payload) => {
  store.dispatch({
    type: reorderTodoListTaskThunk.fulfilled.type,
    payload,
    meta: {
      manualOptimistic: true,
      requestId: `todo-pointer-${Date.now()}`,
      arg: payload,
    },
  });
};

export const installTodoListPointerDrag = (store) => {
  let persistenceQueue = Promise.resolve();
  let queuedOperations = 0;
  let persistenceError = null;

  const refreshBoard = async (projectId) => {
    try {
      await store.dispatch(
        getTodoListColumnsThunk({ projectId, force: true }),
      ).unwrap();
      const columns = getColumns(store);

      await Promise.all(
        columns.map((column) =>
          store
            .dispatch(
              getTodoListColumnTasksThunk({
                projectId,
                columnId: column?.id,
              }),
            )
            .unwrap()
            .catch(() => null),
        ),
      );
    } catch {
      // The next normal refresh can reconcile the board.
    }
  };

  const enqueuePersistence = (payload) => {
    queuedOperations += 1;

    persistenceQueue = persistenceQueue
      .catch(() => null)
      .then(() => store.dispatch(reorderTodoListTaskThunk(payload)).unwrap())
      .catch((error) => {
        persistenceError = error;
      })
      .finally(async () => {
        queuedOperations -= 1;
        if (queuedOperations !== 0 || !persistenceError) return;

        const error = persistenceError;
        persistenceError = null;
        toastError(
          error?.message ||
            error?.data?.message ||
            "Todo reorder failed. The board was refreshed.",
        );
        await refreshBoard(payload.projectId);
      });
  };

  return registerPointerListDragSurface({
    id: "todo-list-tasks",
    rootSelector: ".project-todo-list",
    itemSelector: "[data-todo-task-id]",
    containerSelector: "[data-todo-column-id]",
    shellSelector: "[data-todo-column-shell-id]",
    itemIdAttribute: "data-todo-task-id",
    containerIdAttribute: "data-todo-column-id",
    itemVisualSelector: ".project-todo-list__drag-wrapper",
    placeholderClass: "project-todo-list__drop-preview",
    horizontal: false,
    vertical: true,
    normalizeIndex: (args) => normalizeIndex(store, args),
    onDrop: (drop) => {
      const payload = buildPayload(store, drop);
      if (!payload) return false;

      dispatchOptimistic(store, payload);
      enqueuePersistence(payload);
      return true;
    },
  });
};

export default installTodoListPointerDrag;
