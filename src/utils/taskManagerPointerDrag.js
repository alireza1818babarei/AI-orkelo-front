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
const TOUCH_DRAG_HANDLE_SELECTOR = "[data-board-touch-drag-handle]";
const TOUCH_DRAG_HANDLE_STYLE_ID = "task-manager-touch-drag-handle-styles";
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

const isTouchCapableDevice = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  return (
    Number(navigator.maxTouchPoints || 0) > 0 ||
    Boolean(window.matchMedia?.("(any-pointer: coarse)")?.matches)
  );
};

const installTouchDragHandleStyles = () => {
  if (document.getElementById(TOUCH_DRAG_HANDLE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = TOUCH_DRAG_HANDLE_STYLE_ID;
  style.textContent = `
    .board-touch-drag-handle {
      min-height: 30px;
      margin: 5px 8px 2px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid rgba(var(--primary), 0.24);
      border-radius: 8px;
      background: rgba(var(--primary), 0.08);
      color: rgba(var(--primary), 0.95);
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
      cursor: grab;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
    }

    .board-touch-drag-handle i {
      font-size: 16px;
      pointer-events: none;
    }

    .board-touch-drag-handle span {
      pointer-events: none;
    }

    .board-touch-drag-handle.is-holding {
      border-color: rgba(var(--primary), 0.46);
      background: rgba(var(--primary), 0.14);
    }

    .board-touch-drag-handle.is-ready,
    .pointer-list-drag-active .board-touch-drag-handle {
      cursor: grabbing;
      border-color: rgba(var(--primary), 0.72);
      background: rgba(var(--primary), 0.2);
      box-shadow: 0 0 0 3px rgba(var(--primary), 0.1);
    }
  `;
  document.head.appendChild(style);
};

const createTouchDragHandle = (taskElement) => {
  const taskId = taskElement?.getAttribute?.("data-board-task-id");
  if (!taskId || taskElement.querySelector(`:scope > ${TOUCH_DRAG_HANDLE_SELECTOR}`)) {
    return;
  }

  const handle = document.createElement("div");
  handle.className = "board-touch-drag-handle";
  handle.setAttribute("data-board-touch-drag-handle", "true");
  handle.setAttribute("data-board-task-id", taskId);
  handle.setAttribute("role", "button");
  handle.setAttribute("aria-label", "Hold to move task");
  handle.setAttribute("title", "Hold to move");

  const icon = document.createElement("i");
  icon.className = "ti ti-grip-horizontal";
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.textContent = "Hold to move";

  const suppressHandleAction = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  handle.addEventListener("click", suppressHandleAction);
  handle.addEventListener("contextmenu", suppressHandleAction);
  handle.addEventListener("dragstart", suppressHandleAction);
  handle.append(icon, label);
  taskElement.prepend(handle);
};

const ensureTouchDragHandles = () => {
  document
    .querySelectorAll(`${BOARD_SELECTOR} .board-item${TASK_SELECTOR}`)
    .forEach(createTouchDragHandle);
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
  let activationHandle = null;
  let touchHandleObserver = null;
  let touchHandleFrame = null;

  const clearActivationTimer = () => {
    if (activationTimer) window.clearTimeout(activationTimer);
    activationTimer = null;
  };

  const resetActivation = () => {
    clearActivationTimer();
    activationHandle?.classList?.remove("is-holding", "is-ready");
    activationStartedAt = 0;
    activationPointerId = null;
    activationPointerType = "mouse";
    activationPoint = null;
    activationHandle = null;
  };

  const temporarilyDisableTaskDrag = (taskElement) => {
    const taskId = taskElement?.getAttribute?.("data-board-task-id");
    if (!taskId) return;

    taskElement.removeAttribute("data-board-task-id");
    queueMicrotask(() => {
      if (taskElement.isConnected && !taskElement.hasAttribute("data-board-task-id")) {
        taskElement.setAttribute("data-board-task-id", taskId);
      }
    });
  };

  const getTaskPointerTarget = (event) => {
    if (event.button !== 0 || event.isPrimary === false) return null;

    const task = event.target?.closest?.(TASK_SELECTOR);
    if (!task?.closest?.(BOARD_SELECTOR)) return null;
    return task;
  };

  const handlePointerDown = (event) => {
    const task = getTaskPointerTarget(event);
    if (!task) return;

    const pointerType = event.pointerType || "mouse";
    const touchHandle = event.target?.closest?.(TOUCH_DRAG_HANDLE_SELECTOR);

    if (pointerType === "touch" && !touchHandle) {
      resetActivation();
      temporarilyDisableTaskDrag(task);
      return;
    }

    if (event.target?.closest?.(INTERACTIVE_SELECTOR)) return;

    resetActivation();
    activationStartedAt = performance.now();
    activationPointerId = event.pointerId;
    activationPointerType = pointerType;
    activationPoint = { x: event.clientX, y: event.clientY };
    activationHandle = touchHandle || null;

    if (activationPointerType !== "touch") return;

    activationHandle?.classList?.add("is-holding");
    activationTimer = window.setTimeout(() => {
      if (activationPointerId !== event.pointerId || !activationPoint) return;

      activationHandle?.classList?.add("is-ready");
      try {
        navigator.vibrate?.(18);
      } catch {
        // Vibration support is optional.
      }

      const target =
        document.elementFromPoint(activationPoint.x, activationPoint.y) ||
        event.target;
      const options = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: activationPointerId,
        pointerType: activationPointerType,
        isPrimary: true,
        buttons: 1,
        clientX: activationPoint.x,
        clientY: activationPoint.y,
      };
      let syntheticMove;

      if (typeof PointerEvent === "function") {
        syntheticMove = new PointerEvent("pointermove", options);
      } else {
        syntheticMove = new Event("pointermove", options);
        Object.entries(options).forEach(([key, value]) => {
          try {
            Object.defineProperty(syntheticMove, key, { value });
          } catch {
            // Ignore immutable event fields in older browsers.
          }
        });
      }

      target?.dispatchEvent?.(syntheticMove);
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

  const scheduleTouchDragHandles = () => {
    if (touchHandleFrame) return;
    touchHandleFrame = window.requestAnimationFrame(() => {
      touchHandleFrame = null;
      ensureTouchDragHandles();
    });
  };

  if (isTouchCapableDevice()) {
    installTouchDragHandleStyles();
    ensureTouchDragHandles();

    const observerRoot = document.body || document.documentElement;
    if (observerRoot && typeof MutationObserver === "function") {
      touchHandleObserver = new MutationObserver(scheduleTouchDragHandles);
      touchHandleObserver.observe(observerRoot, { childList: true, subtree: true });
    }
  }

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
      if (activationPointerType !== "touch") return 5;

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
    touchHandleObserver?.disconnect();
    if (touchHandleFrame) window.cancelAnimationFrame(touchHandleFrame);
    window.removeEventListener("pointerdown", handlePointerDown, true);
    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("pointerup", handlePointerEnd, true);
    window.removeEventListener("pointercancel", handlePointerEnd, true);
    unregisterSurface();
  };
};

export default installTaskManagerPointerDrag;
