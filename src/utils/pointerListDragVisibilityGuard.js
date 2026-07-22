const POINTER_DRAG_ACTIVE_CLASS = "pointer-list-drag-active";
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";
const RESTORE_TIMEOUT_MS = 1200;

const SURFACES = [
  {
    rootSelector: ".board",
    itemSelector: "[data-board-task-id]",
    containerSelector: "[data-board-column-id]",
    itemIdAttribute: "data-board-task-id",
    containerIdAttribute: "data-board-column-id",
    visualSelector: ".board-item-shell",
  },
  {
    rootSelector: ".project-todo-list",
    itemSelector: "[data-todo-task-id]",
    containerSelector: "[data-todo-column-id]",
    itemIdAttribute: "data-todo-task-id",
    containerIdAttribute: "data-todo-column-id",
    visualSelector: ".project-todo-list__drag-wrapper",
  },
];

const getAttribute = (element, name) =>
  String(element?.getAttribute?.(name) ?? "");

const getDirectLayoutNode = (element, container) => {
  let current = element;

  while (current?.parentElement && current.parentElement !== container) {
    current = current.parentElement;
  }

  return current?.parentElement === container ? current : element;
};

const findSurface = (target) => {
  for (const surface of SURFACES) {
    const item = target?.closest?.(surface.itemSelector);
    const root = item?.closest?.(surface.rootSelector);
    const container = item?.closest?.(surface.containerSelector);

    if (item && root && container) {
      return { surface, item, root, container };
    }
  }

  return null;
};

const findContainerFromPoint = (surface, root, clientX, clientY) => {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;

  for (const element of document.elementsFromPoint(clientX, clientY)) {
    const container = element.closest?.(surface.containerSelector);
    if (container && root.contains(container)) return container;
  }

  return null;
};

const findCurrentLayoutNode = (record) => {
  if (!record.root?.isConnected) return null;

  const containers = record.root.querySelectorAll(record.surface.containerSelector);
  const container = [...containers].find(
    (candidate) =>
      getAttribute(candidate, record.surface.containerIdAttribute) ===
      record.sourceContainerId,
  );

  if (!container) return null;

  const item = [...container.querySelectorAll(record.surface.itemSelector)].find(
    (candidate) =>
      getAttribute(candidate, record.surface.itemIdAttribute) === record.itemId,
  );

  if (!item) return null;

  const visual = record.surface.visualSelector
    ? item.closest?.(record.surface.visualSelector) || item
    : item;

  return getDirectLayoutNode(visual, container);
};

const restoreVisibleDisplay = (record) => {
  const layoutNode = findCurrentLayoutNode(record);
  if (!layoutNode) return false;

  const inlineDisplay = layoutNode.style.display;
  const computedDisplay = window.getComputedStyle(layoutNode).display;

  if (inlineDisplay !== "none" && computedDisplay !== "none") return true;

  if (record.originalDisplay) {
    layoutNode.style.display = record.originalDisplay;
  } else {
    layoutNode.style.removeProperty("display");
  }

  return window.getComputedStyle(layoutNode).display !== "none";
};

/**
 * The shared pointer engine temporarily hides the original layout node while
 * its overlay is moving. In a same-column reorder React can reuse that exact
 * node. The handoff snapshot may therefore contain display:none and restore it
 * after the animation, leaving a valid task invisible until a page refresh.
 *
 * This guard runs only for same-column drops and restores the node's original
 * display value immediately after the central drag engine finishes cleanup.
 */
export const installPointerListDragVisibilityGuard = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    window.__orkeloPointerListVisibilityGuardInstalled
  ) {
    return;
  }

  window.__orkeloPointerListVisibilityGuardInstalled = true;

  let pressed = null;
  let pendingCleanup = null;

  const clearPendingCleanup = () => {
    pendingCleanup?.observer?.disconnect();
    if (pendingCleanup?.timeoutId) {
      window.clearTimeout(pendingCleanup.timeoutId);
    }
    pendingCleanup = null;
  };

  const finishWhenEngineIsIdle = (record) => {
    clearPendingCleanup();

    const restoreAfterPaint = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          restoreVisibleDisplay(record);
          clearPendingCleanup();
        });
      });
    };

    const check = () => {
      if (
        !document.documentElement.classList.contains(
          POINTER_DRAG_ACTIVE_CLASS,
        )
      ) {
        restoreAfterPaint();
      }
    };

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const timeoutId = window.setTimeout(() => {
      restoreVisibleDisplay(record);
      clearPendingCleanup();
    }, RESTORE_TIMEOUT_MS);

    pendingCleanup = { observer, timeoutId };
    check();
  };

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || event.isPrimary === false) return;
      if (event.target?.closest?.(INTERACTIVE_SELECTOR)) return;

      const match = findSurface(event.target);
      if (!match) return;

      const { surface, item, root, container } = match;
      const visual = surface.visualSelector
        ? item.closest?.(surface.visualSelector) || item
        : item;
      const layoutNode = getDirectLayoutNode(visual, container);
      const itemId = getAttribute(item, surface.itemIdAttribute);
      const sourceContainerId = getAttribute(
        container,
        surface.containerIdAttribute,
      );

      if (!itemId || !sourceContainerId || !layoutNode) return;

      pressed = {
        pointerId: event.pointerId,
        surface,
        root,
        itemId,
        sourceContainerId,
        originalDisplay: layoutNode.style.display,
      };
    },
    true,
  );

  window.addEventListener(
    "pointerup",
    (event) => {
      if (!pressed || event.pointerId !== pressed.pointerId) return;

      const record = pressed;
      pressed = null;
      const destination = findContainerFromPoint(
        record.surface,
        record.root,
        event.clientX,
        event.clientY,
      );
      const destinationContainerId = getAttribute(
        destination,
        record.surface.containerIdAttribute,
      );

      if (destinationContainerId !== record.sourceContainerId) return;
      finishWhenEngineIsIdle(record);
    },
    true,
  );

  window.addEventListener(
    "pointercancel",
    (event) => {
      if (pressed?.pointerId === event.pointerId) pressed = null;
    },
    true,
  );
};

export default installPointerListDragVisibilityGuard;
