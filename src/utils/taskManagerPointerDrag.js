import {
  getColumnTasksThunk,
  getProjectColumnsThunk,
  PROJECT_COLUMN_TASK_PAGE_SIZE,
  reorderProjectTasksLocal,
  reorderProjectTaskThunk,
} from "../store/projects/projectColumnsSlice";
import { toastError } from "./sweetAlert";
import { isTaskApproved } from "./taskReviewStatus";

const INSTALL_KEY = "__orkeloTaskManagerPointerDragInstalled";
const CARD_SELECTOR = "[data-board-task-id]";
const COLUMN_SELECTOR = "[data-board-column-id]";
const COLUMN_SHELL_SELECTOR = "[data-board-column-shell-id]";
const BOARD_SELECTOR = ".board";
const ACTIVATION_DISTANCE = 5;
const EDGE_THRESHOLD = 76;
const MAX_SCROLL_SPEED = 24;
const DROP_DURATION = 150;
const LAST_TARGET_GRACE_MS = 180;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getPoint = (event) => {
  const coalesced = event?.getCoalescedEvents?.();
  const sample = coalesced?.length ? coalesced[coalesced.length - 1] : event;
  const x = sample?.clientX;
  const y = sample?.clientY;

  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};

const getTaskId = (element) =>
  String(element?.getAttribute?.("data-board-task-id") ?? "");

const getColumnId = (element) =>
  String(element?.getAttribute?.("data-board-column-id") ?? "");

const getDirectLayoutNode = (element, container) => {
  let current = element;
  while (current?.parentElement && current.parentElement !== container) {
    current = current.parentElement;
  }

  return current?.parentElement === container ? current : element;
};

const getCardEntries = (container, draggedTaskId = "") => {
  if (!container) return [];

  const seen = new Set();
  const entries = [];

  container.querySelectorAll(CARD_SELECTOR).forEach((card) => {
    const taskId = getTaskId(card);
    if (!taskId || taskId === String(draggedTaskId)) return;

    const layoutNode = getDirectLayoutNode(card, container);
    if (!layoutNode || seen.has(layoutNode)) return;

    const rect = layoutNode.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    seen.add(layoutNode);
    entries.push({ taskId, card, layoutNode, rect });
  });

  return entries;
};

const findColumnFromPoint = (point) => {
  if (!point || typeof document === "undefined") return null;

  for (const element of document.elementsFromPoint(point.x, point.y)) {
    const direct = element.closest?.(COLUMN_SELECTOR);
    if (direct) return direct;

    const shell = element.closest?.(COLUMN_SHELL_SELECTOR);
    const nested = shell?.querySelector?.(COLUMN_SELECTOR);
    if (nested) return nested;
  }

  return null;
};

const findTaskInState = (store, taskId) => {
  const columns = store.getState()?.projectColumns?.items || [];

  for (const column of columns) {
    const tasks = Array.isArray(column?.tasks) ? column.tasks : [];
    const task = tasks.find((item) => String(item?.id ?? "") === String(taskId));
    if (task) return { task, column };
  }

  return null;
};

const getGroupedIndex = ({ store, taskId, columnId, rawIndex }) => {
  const state = store.getState()?.projectColumns;
  const columns = state?.items || [];
  const destinationColumn = columns.find(
    (column) => String(column?.id ?? "") === String(columnId),
  );
  const taskRecord = findTaskInState(store, taskId);
  const destinationTasks = (destinationColumn?.tasks || []).filter(
    (task) => String(task?.id ?? "") !== String(taskId),
  );
  const maxIndex = destinationTasks.length;
  const boundedIndex = clamp(Number(rawIndex) || 0, 0, maxIndex);
  const activeCount = destinationTasks.filter((task) => !isTaskApproved(task)).length;

  return isTaskApproved(taskRecord?.task)
    ? Math.max(boundedIndex, activeCount)
    : Math.min(boundedIndex, activeCount);
};

const resolveDestination = (store, session, point) => {
  const container = findColumnFromPoint(point);
  if (!container) return null;

  const columnId = getColumnId(container);
  if (!columnId) return null;

  const entries = getCardEntries(container, session.taskId);
  const rawIndex = entries.findIndex(
    ({ rect }) => point.y < rect.top + rect.height / 2,
  );
  const index = getGroupedIndex({
    store,
    taskId: session.taskId,
    columnId,
    rawIndex: rawIndex === -1 ? entries.length : rawIndex,
  });

  return {
    container,
    columnId,
    index,
    entries,
  };
};

const captureRects = (containers) => {
  const rects = new Map();

  containers.forEach((container) => {
    getCardEntries(container).forEach(({ taskId, layoutNode, rect }) => {
      rects.set(taskId, { layoutNode, rect });
    });
  });

  return rects;
};

const animateReflow = (beforeRects, containers, duration) => {
  if (!duration) return;

  containers.forEach((container) => {
    getCardEntries(container).forEach(({ taskId, layoutNode, rect }) => {
      const before = beforeRects.get(taskId)?.rect;
      if (!before) return;

      const dx = before.left - rect.left;
      const dy = before.top - rect.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      if (typeof layoutNode.animate !== "function") return;

      layoutNode.animate(
        [
          { transform: `translate3d(${dx}px, ${dy}px, 0)` },
          { transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        },
      );
    });
  });
};

const placePlaceholder = (session, destination) => {
  if (!destination) return;

  const previousContainer = session.destination?.container;
  const containers = new Set(
    [previousContainer, destination.container].filter(Boolean),
  );
  const beforeRects = captureRects(containers);
  const entries = getCardEntries(destination.container, session.taskId);
  const targetEntry = entries[destination.index];

  if (targetEntry?.layoutNode) {
    destination.container.insertBefore(
      session.placeholder,
      targetEntry.layoutNode,
    );
  } else {
    destination.container.appendChild(session.placeholder);
  }

  session.destination = {
    container: destination.container,
    columnId: destination.columnId,
    index: destination.index,
  };
  session.lastValidDestination = session.destination;
  session.lastValidAt = performance.now();

  animateReflow(beforeRects, containers, session.motionDuration);
};

const getOverflow = (element) => {
  const style = window.getComputedStyle(element);
  return {
    x: /(auto|scroll|overlay)/.test(style.overflowX || ""),
    y: /(auto|scroll|overlay)/.test(style.overflowY || ""),
  };
};

const collectScrollCandidates = (session) => {
  const candidates = [];
  const seen = new Set();
  const seeds = [session.destination?.container, session.board].filter(Boolean);

  seeds.forEach((seed) => {
    let current = seed;
    while (current && current !== document.body) {
      if (!seen.has(current)) {
        const overflow = getOverflow(current);
        const canX =
          overflow.x && current.scrollWidth > current.clientWidth + 1;
        const canY =
          overflow.y && current.scrollHeight > current.clientHeight + 1;

        if (canX || canY) {
          seen.add(current);
          candidates.push({ element: current, canX, canY });
        }
      }
      current = current.parentElement;
    }
  });

  const documentScroller = document.scrollingElement;
  if (documentScroller && !seen.has(documentScroller)) {
    candidates.push({
      element: documentScroller,
      canX: documentScroller.scrollWidth > documentScroller.clientWidth + 1,
      canY: documentScroller.scrollHeight > documentScroller.clientHeight + 1,
    });
  }

  session.scrollCandidates = candidates;
  session.scrollCandidatesAt = performance.now();
  session.scrollCandidateColumnId = session.destination?.columnId || "";
};

const edgeSpeed = (coordinate, start, end) => {
  if (coordinate < start || coordinate > end) return 0;

  const size = Math.max(0, end - start);
  const threshold = Math.min(EDGE_THRESHOLD, Math.max(28, size / 3));
  const fromStart = coordinate - start;
  const fromEnd = end - coordinate;

  if (fromStart >= threshold && fromEnd >= threshold) return 0;

  if (fromStart <= fromEnd) {
    const ratio = clamp((threshold - Math.max(0, fromStart)) / threshold, 0, 1);
    return -Math.max(1, Math.round(MAX_SCROLL_SPEED * ratio * ratio));
  }

  const ratio = clamp((threshold - Math.max(0, fromEnd)) / threshold, 0, 1);
  return Math.max(1, Math.round(MAX_SCROLL_SPEED * ratio * ratio));
};

const scrollAxis = (candidate, axis, point) => {
  const { element } = candidate;
  const rect = element.getBoundingClientRect();
  const speed =
    axis === "x"
      ? edgeSpeed(point.x, rect.left, rect.right)
      : edgeSpeed(point.y, rect.top, rect.bottom);

  if (!speed) return false;

  const current = axis === "x" ? element.scrollLeft : element.scrollTop;
  const max =
    axis === "x"
      ? element.scrollWidth - element.clientWidth
      : element.scrollHeight - element.clientHeight;
  const next = clamp(current + speed, 0, max);
  if (next === current) return false;

  if (axis === "x") element.scrollLeft = next;
  else element.scrollTop = next;

  return true;
};

const autoScroll = (session, point) => {
  const now = performance.now();
  if (
    !session.scrollCandidates?.length ||
    now - session.scrollCandidatesAt > 180 ||
    session.scrollCandidateColumnId !== (session.destination?.columnId || "")
  ) {
    collectScrollCandidates(session);
  }

  let didScroll = false;

  for (const candidate of session.scrollCandidates) {
    if (!candidate.canY) continue;
    if (scrollAxis(candidate, "y", point)) {
      didScroll = true;
      break;
    }
  }

  for (const candidate of session.scrollCandidates) {
    if (!candidate.canX) continue;
    if (scrollAxis(candidate, "x", point)) {
      didScroll = true;
      break;
    }
  }

  return didScroll;
};

const createOverlay = (session) => {
  const clone = session.sourceVisual.cloneNode(true);
  const rect = session.sourceRect;

  clone.removeAttribute?.("id");
  clone.querySelectorAll?.("[id]").forEach((element) => element.removeAttribute("id"));
  clone.classList.add("task-manager-pointer-overlay");
  Object.assign(clone.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    zIndex: "2147483000",
    pointerEvents: "none",
    willChange: "transform",
    transformOrigin: "center center",
    boxSizing: "border-box",
  });

  document.body.appendChild(clone);
  session.overlay = clone;
};

const moveOverlay = (session, point) => {
  if (!session.overlay) return;

  const left = point.x - session.grabOffset.x;
  const top = point.y - session.grabOffset.y;
  session.overlayLeft = left;
  session.overlayTop = top;
  session.overlay.style.transform =
    `translate3d(${left}px, ${top}px, 0) scale(1.018) rotate(0.25deg)`;
};

const activateSession = (session) => {
  if (session.active) return;

  session.active = true;
  session.motionDuration = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    ?.matches
    ? 0
    : 125;

  createOverlay(session);

  session.placeholder = document.createElement("div");
  session.placeholder.className = "task-manager-pointer-placeholder";
  session.placeholder.setAttribute("aria-hidden", "true");
  session.placeholder.style.height = `${Math.max(session.sourceRect.height, 72)}px`;

  session.sourceDisplay = session.sourceLayoutNode.style.display;
  session.sourceLayoutNode.style.display = "none";
  session.sourceContainer.insertBefore(session.placeholder, session.sourceLayoutNode);

  document.documentElement.classList.add("task-manager-pointer-dragging");
  session.previousUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = "none";

  moveOverlay(session, session.latestPoint);
};

const removeSessionDom = (session) => {
  session.placeholder?.remove();
  session.overlay?.remove();

  if (session.sourceLayoutNode) {
    session.sourceLayoutNode.style.display = session.sourceDisplay || "";
  }

  document.documentElement.classList.remove("task-manager-pointer-dragging");
  document.body.style.userSelect = session.previousUserSelect || "";
};

const animateOverlayTo = async (session, rect) => {
  if (
    !session.overlay ||
    !rect ||
    !session.motionDuration ||
    typeof session.overlay.animate !== "function"
  ) {
    return;
  }

  const targetLeft = rect.left + (rect.width - session.sourceRect.width) / 2;
  const targetTop = rect.top;
  const fromTransform = session.overlay.style.transform;
  const toTransform =
    `translate3d(${targetLeft}px, ${targetTop}px, 0) scale(1) rotate(0deg)`;

  try {
    await session.overlay.animate(
      [
        { transform: fromTransform, opacity: 0.98 },
        { transform: toTransform, opacity: 1 },
      ],
      {
        duration: DROP_DURATION,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      },
    ).finished;
  } catch {
    // The overlay can be removed by navigation or cancellation.
  }
};

const buildReorderPayload = (store, session, destination) => {
  const state = store.getState()?.projectColumns;
  const projectId = Number(state?.projectId);
  const columns = state?.items || [];
  const sourceRecord = findTaskInState(store, session.taskId);
  const sourceColumnId = String(sourceRecord?.column?.id ?? session.sourceColumnId);
  const destinationColumnId = String(destination?.columnId ?? "");
  const sourceColumn = columns.find(
    (column) => String(column?.id ?? "") === sourceColumnId,
  );
  const destinationColumn = columns.find(
    (column) => String(column?.id ?? "") === destinationColumnId,
  );

  if (
    !Number.isInteger(projectId) ||
    projectId <= 0 ||
    !sourceColumn ||
    !destinationColumn ||
    !sourceRecord?.task
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
    (id) => id && id !== String(session.taskId),
  );
  const destinationTaskIds =
    sourceColumnId === destinationColumnId
      ? sourceTaskIds
      : previousDestinationTaskIds.filter(
          (id) => id && id !== String(session.taskId),
        );
  const normalizedIndex = getGroupedIndex({
    store,
    taskId: session.taskId,
    columnId: destinationColumnId,
    rawIndex: destination.index,
  });

  destinationTaskIds.splice(normalizedIndex, 0, String(session.taskId));

  if (
    sourceColumnId === destinationColumnId &&
    previousSourceTaskIds.join("|") === destinationTaskIds.join("|")
  ) {
    return null;
  }

  return {
    projectId,
    taskId: String(session.taskId),
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

const installStyles = () => {
  if (document.getElementById("task-manager-pointer-drag-styles")) return;

  const style = document.createElement("style");
  style.id = "task-manager-pointer-drag-styles";
  style.textContent = `
    ${BOARD_SELECTOR} ${CARD_SELECTOR} { cursor: grab; touch-action: none; }
    .task-manager-pointer-dragging, .task-manager-pointer-dragging * { cursor: grabbing !important; }
    .task-manager-pointer-overlay {
      filter: drop-shadow(0 18px 28px rgba(15, 23, 42, 0.28));
      opacity: 0.98;
    }
    .task-manager-pointer-placeholder {
      width: 100%;
      min-height: 72px;
      margin: 0 0 10px;
      border: 2px dashed rgba(var(--primary), 0.68);
      border-radius: 10px;
      background: rgba(var(--primary), 0.09);
      box-sizing: border-box;
      animation: task-manager-placeholder-in 110ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes task-manager-placeholder-in {
      from { opacity: 0; transform: scaleY(0.9); }
      to { opacity: 1; transform: scaleY(1); }
    }
  `;
  document.head.appendChild(style);
};

export const installTaskManagerPointerDrag = (store) => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    window[INSTALL_KEY]
  ) {
    return;
  }

  window[INSTALL_KEY] = true;
  installStyles();

  let session = null;
  let frameId = null;
  let persistenceQueue = Promise.resolve();
  let queuedOperations = 0;
  let persistenceError = null;
  let suppressClickUntil = 0;

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
      // The next normal board refresh can retry reconciliation.
    }
  };

  const enqueuePersistence = (payload) => {
    queuedOperations += 1;

    const operation = persistenceQueue
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

    persistenceQueue = operation;
  };

  const commitDrop = (currentSession, destination) => {
    const payload = buildReorderPayload(store, currentSession, destination);
    if (!payload) return;

    store.dispatch(reorderProjectTasksLocal(payload));
    enqueuePersistence(payload);
  };

  const clearListeners = () => {
    window.removeEventListener("pointermove", onPointerMove, true);
    window.removeEventListener("pointerup", onPointerUp, true);
    window.removeEventListener("pointercancel", onPointerCancel, true);
    window.removeEventListener("keydown", onKeyDown, true);
  };

  const stopFrame = () => {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = null;
  };

  const resetSession = (currentSession) => {
    stopFrame();
    clearListeners();
    removeSessionDom(currentSession);
    session = null;
  };

  const finishSession = async (cancelled = false) => {
    const currentSession = session;
    if (!currentSession) return;

    stopFrame();
    clearListeners();

    if (!currentSession.active) {
      session = null;
      return;
    }

    suppressClickUntil = performance.now() + 350;

    const liveDestination = resolveDestination(
      store,
      currentSession,
      currentSession.latestPoint,
    );
    const destination =
      !cancelled && liveDestination
        ? liveDestination
        : !cancelled &&
            currentSession.lastValidDestination &&
            performance.now() - currentSession.lastValidAt <= LAST_TARGET_GRACE_MS
          ? currentSession.lastValidDestination
          : null;

    if (destination) {
      placePlaceholder(currentSession, destination);
      const targetRect = currentSession.placeholder.getBoundingClientRect();
      await animateOverlayTo(currentSession, targetRect);
      commitDrop(currentSession, currentSession.destination);
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      resetSession(currentSession);
      return;
    }

    await animateOverlayTo(currentSession, currentSession.sourceRect);
    resetSession(currentSession);
  };

  const dragFrame = () => {
    const currentSession = session;
    if (!currentSession) return;

    if (currentSession.active) {
      moveOverlay(currentSession, currentSession.latestPoint);
      const didScroll = autoScroll(currentSession, currentSession.latestPoint);
      const destination = resolveDestination(
        store,
        currentSession,
        currentSession.latestPoint,
      );

      if (
        destination &&
        (didScroll ||
          destination.columnId !== currentSession.destination?.columnId ||
          destination.index !== currentSession.destination?.index)
      ) {
        placePlaceholder(currentSession, destination);
      }
    }

    frameId = window.requestAnimationFrame(dragFrame);
  };

  function onPointerMove(event) {
    if (!session || event.pointerId !== session.pointerId) return;

    const point = getPoint(event);
    if (!point) return;
    session.latestPoint = point;

    if (!session.active) {
      const distance = Math.hypot(
        point.x - session.startPoint.x,
        point.y - session.startPoint.y,
      );
      if (distance >= ACTIVATION_DISTANCE) activateSession(session);
    }

    if (session.active && event.cancelable) event.preventDefault();
  }

  function onPointerUp(event) {
    if (!session || event.pointerId !== session.pointerId) return;
    const point = getPoint(event);
    if (point) session.latestPoint = point;
    if (session.active && event.cancelable) event.preventDefault();
    void finishSession(false);
  }

  function onPointerCancel(event) {
    if (!session || event.pointerId !== session.pointerId) return;
    void finishSession(true);
  }

  function onKeyDown(event) {
    if (event.key !== "Escape" || !session?.active) return;
    event.preventDefault();
    void finishSession(true);
  }

  const onPointerDown = (event) => {
    if (session || event.button !== 0 || event.isPrimary === false) return;

    const card = event.target?.closest?.(CARD_SELECTOR);
    const board = card?.closest?.(BOARD_SELECTOR);
    const sourceContainer = card?.closest?.(COLUMN_SELECTOR);
    if (!card || !board || !sourceContainer) return;

    if (
      event.target?.closest?.(
        "button, a, input, textarea, select, [contenteditable='true']",
      )
    ) {
      return;
    }

    const point = getPoint(event);
    const taskId = getTaskId(card);
    const sourceColumnId = getColumnId(sourceContainer);
    const sourceVisual = card.closest?.(".board-item-shell") || card;
    const sourceLayoutNode = getDirectLayoutNode(sourceVisual, sourceContainer);
    const sourceRect = sourceLayoutNode.getBoundingClientRect();

    if (!point || !taskId || !sourceColumnId || sourceRect.height <= 0) return;

    session = {
      pointerId: event.pointerId,
      taskId,
      sourceColumnId,
      board,
      sourceContainer,
      sourceVisual,
      sourceLayoutNode,
      sourceRect,
      startPoint: point,
      latestPoint: point,
      grabOffset: {
        x: point.x - sourceRect.left,
        y: point.y - sourceRect.top,
      },
      active: false,
      destination: null,
      lastValidDestination: null,
      lastValidAt: 0,
      scrollCandidates: [],
      scrollCandidatesAt: 0,
      scrollCandidateColumnId: "",
    };

    window.addEventListener("pointermove", onPointerMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener("pointerup", onPointerUp, {
      capture: true,
      passive: false,
    });
    window.addEventListener("pointercancel", onPointerCancel, true);
    window.addEventListener("keydown", onKeyDown, true);
    frameId = window.requestAnimationFrame(dragFrame);
  };

  const blockPackageMouseSensor = (event) => {
    const card = event.target?.closest?.(CARD_SELECTOR);
    if (!card?.closest?.(BOARD_SELECTOR)) return;
    event.stopImmediatePropagation();
  };

  const suppressDraggedClick = (event) => {
    if (performance.now() > suppressClickUntil) return;
    if (!event.target?.closest?.(CARD_SELECTOR)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClickUntil = 0;
  };

  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("mousedown", blockPackageMouseSensor, true);
  window.addEventListener("touchstart", blockPackageMouseSensor, {
    capture: true,
    passive: true,
  });
  window.addEventListener("click", suppressDraggedClick, true);
};

export default installTaskManagerPointerDrag;
