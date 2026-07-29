import {
  getColumnTasksThunk,
  getProjectColumnsThunk,
  PROJECT_COLUMN_TASK_PAGE_SIZE,
  reorderProjectTasksLocal,
  reorderProjectTaskThunk,
} from "../store/projects/projectColumnsSlice";
import { registerPointerListDragSurface } from "./pointerListDragEngine";
import { toastError } from "./sweetAlert";
import { isTaskApproved } from "./taskReviewStatus";

const TASK_DRAG_ACTIVATION_DELAY = 500;
const TASK_SELECTOR = "[data-board-task-id]";
const BOARD_SELECTOR = ".board";
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";

const findTaskRecord = (store, taskId) => {
  const columns = store.getState()?.projectColumns?.items || [];

  for (const column of columns) {
    const tasks = Array.isArray(column?.tasks) ? column.tasks : [];
    const task = tasks.find((item) => String(item?.id ?? "") === String(taskId));
    if (task) return { task, column };
  }

  return null;
};

const getColumn = (store, columnId) =>
  (store.getState()?.projectColumns?.items || []).find(
    (column) => String(column?.id ?? "") === String(columnId),
  );

const normalizeIndex = (store, { itemId, containerId, rawIndex }) => {
  const destinationColumn = getColumn(store, containerId);
  const taskRecord = findTaskRecord(store, itemId);
  const destinationTasks = (destinationColumn?.tasks || []).filter(
    (task) => String(task?.id ?? "") !== String(itemId),
  );
  const boundedIndex = Math.min(
    Math.max(Number(rawIndex) || 0, 0),
    destinationTasks.length,
  );
  const activeCount = destinationTasks.filter((task) => !isTaskApproved(task)).length;

  return isTaskApproved(taskRecord?.task)
    ? Math.max(boundedIndex, activeCount)
    : Math.min(boundedIndex, activeCount);
};

const buildPayload = (
  store,
  { itemId, destinationContainerId, destinationIndex },
) => {
  const state = store.getState()?.projectColumns;
  const projectId = Number(state?.projectId);
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

export const installTaskManagerPointerDrag = (store) => {
  let persistenceQueue = Promise.resolve();
  let queuedOperations = 0;
  let persistenceError = null;
  let activationStartedAt = 0;
  let activationPointerId = null;
  let activationPointerType = "mouse";
  let activationPoint = null;
  let activationTimer = null;

  const clearActivationTimer = () => {
    if (activationTimer) window.clearTimeout(activationTimer);
    activationTimer = null;
  };

  const resetActivation = () => {
    clearActivationTimer();
    activationStartedAt = 0;
    activationPointerId = null;
    activationPointerType = "mouse";
    activationPoint = null;
  };

  const isTaskPointerTarget = (event) => {
    if (event.button !== 0 || event.isPrimary === false) return false;
    if (event.target?.closest?.(INTERACTIVE_SELECTOR)) return false;

    const task = event.target?.closest?.(TASK_SELECTOR);
    return Boolean(task?.closest?.(BOARD_SELECTOR));
  };

  const handlePointerDown = (event) => {
    if (!isTaskPointerTarget(event)) return;

    resetActivation();
    activationStartedAt = performance.now();
    activationPointerId = event.pointerId;
    activationPointerType = event.pointerType || "mouse";
    activationPoint = { x: event.clientX, y: event.clientY };

    activationTimer = window.setTimeout(() => {
      if (activationPointerId !== event.pointerId || !activationPoint) return;
      if (typeof PointerEvent !== "function") return;

      const target =
        document.elementFromPoint(activationPoint.x, activationPoint.y) ||
        event.target;

      target?.dispatchEvent?.(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: activationPointerId,
          pointerType: activationPointerType,
          isPrimary: true,
          buttons: 1,
          clientX: activationPoint.x,
          clientY: activationPoint.y,
        }),
      );
    }, TASK_DRAG_ACTIVATION_DELAY);
  };

  const handlePointerMove = (event) => {
    if (event.pointerId !== activationPointerId) return;
    activationPoint = { x: event.clientX, y: event.clientY };
  };

  const handlePointerEnd = (event) => {
    if (event.pointerId !== activationPointerId) return;
    resetActivation();
  };

  window.addEventListener("pointerdown", handlePointerDown, true);
  window.addEventListener("pointermove", handlePointerMove, true);
  window.addEventListener("pointerup", handlePointerEnd, true);
  window.addEventListener("pointercancel", handlePointerEnd, true);

  const refreshBoardFromServer = async (projectId) => {
    try {
      await store.dispatch(getProjectColumnsThunk(projectId)).unwrap();
      const columns = store.getState()?.projectColumns?.items || [];

      await Promise.all(
        columns.map((column) =>
          store
            .dispatch(
              getColumnTasksThunk({
                projectId,
                columnId: column?.id,
                page: 1,
                perPage: PROJECT_COLUMN_TASK_PAGE_SIZE,
                force: true,
              }),
            )
            .unwrap()
            .catch(() => null),
        ),
      );
    } catch {
      // A later normal board refresh can retry reconciliation.
    }
  };

  const enqueuePersistence = (payload) => {
    queuedOperations += 1;

    persistenceQueue = persistenceQueue
      .catch(() => null)
      .then(() => store.dispatch(reorderProjectTaskThunk(payload)).unwrap())
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
            "Task reorder failed. The board was refreshed.",
        );
        await refreshBoardFromServer(payload.projectId);
      });
  };

  const unregisterSurface = registerPointerListDragSurface({
    id: "task-manager-tasks",
    rootSelector: BOARD_SELECTOR,
    itemSelector: TASK_SELECTOR,
    containerSelector: "[data-board-column-id]",
    shellSelector: "[data-board-column-shell-id]",
    itemIdAttribute: "data-board-task-id",
    containerIdAttribute: "data-board-column-id",
    itemVisualSelector: ".board-item-shell",
    placeholderClass: "task-manager-pointer-placeholder",
    horizontal: true,
    vertical: true,
    get activationDistance() {
      if (activationPointerId == null) return Number.MAX_SAFE_INTEGER;

      return performance.now() - activationStartedAt >= TASK_DRAG_ACTIVATION_DELAY
        ? -1
        : Number.MAX_SAFE_INTEGER;
    },
    normalizeIndex: (args) => normalizeIndex(store, args),
    onDrop: (drop) => {
      const payload = buildPayload(store, drop);
      if (!payload) return false;

      store.dispatch(reorderProjectTasksLocal(payload));
      enqueuePersistence(payload);
      return true;
    },
  });

  return () => {
    resetActivation();
    window.removeEventListener("pointerdown", handlePointerDown, true);
    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("pointerup", handlePointerEnd, true);
    window.removeEventListener("pointercancel", handlePointerEnd, true);
    unregisterSurface();
  };
};

export default installTaskManagerPointerDrag;
