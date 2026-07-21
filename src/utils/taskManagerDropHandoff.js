const INSTALL_KEY = "__orkeloTaskManagerDropHandoffInstalled";
const BOARD_SELECTOR = ".board";
const CARD_SELECTOR = "[data-board-task-id]";
const COLUMN_SELECTOR = "[data-board-column-id]";
const PLACEHOLDER_SELECTOR = ".task-manager-pointer-placeholder";
const ACTIVATION_DISTANCE = 5;
const HANDOFF_TIMEOUT_MS = 900;
const REVEAL_DURATION_MS = 150;

const STYLE_PROPERTIES = [
  "position",
  "left",
  "top",
  "right",
  "bottom",
  "width",
  "height",
  "margin",
  "visibility",
  "pointerEvents",
  "opacity",
  "transform",
  "transition",
  "zIndex",
];

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

const captureInlineStyles = (element) => {
  const values = {};
  STYLE_PROPERTIES.forEach((property) => {
    values[property] = element?.style?.[property] ?? "";
  });
  return values;
};

const restoreInlineStyles = (element, values) => {
  if (!element || !values) return;
  STYLE_PROPERTIES.forEach((property) => {
    element.style[property] = values[property] ?? "";
  });
};

const quarantineLayoutNode = (element, rect) => {
  if (!element) return;

  Object.assign(element.style, {
    position: "fixed",
    left: "-100000px",
    top: "-100000px",
    right: "auto",
    bottom: "auto",
    width: `${Math.max(rect?.width || 1, 1)}px`,
    height: `${Math.max(rect?.height || 1, 1)}px`,
    margin: "0",
    visibility: "hidden",
    pointerEvents: "none",
    opacity: "0",
    transform: "none",
    transition: "none",
    zIndex: "-1",
  });
};

const findTaskLayoutInColumn = (column, taskId) => {
  if (!column || !taskId) return null;

  const card = [...column.querySelectorAll(CARD_SELECTOR)].find(
    (candidate) => getTaskId(candidate) === String(taskId),
  );

  if (!card) return null;

  return {
    card,
    layoutNode: getDirectLayoutNode(
      card.closest?.(".board-item-shell") || card,
      column,
    ),
  };
};

const createHandoffGhost = (drag, targetRect) => {
  const ghost = drag.sourceVisual.cloneNode(true);
  ghost.removeAttribute?.("data-board-task-id");
  ghost
    .querySelectorAll?.("[data-board-task-id]")
    .forEach((element) => element.removeAttribute("data-board-task-id"));
  ghost.classList.add("task-manager-drop-handoff-ghost");

  Object.assign(ghost.style, {
    position: "fixed",
    left: `${targetRect.left}px`,
    top: `${targetRect.top}px`,
    width: `${targetRect.width}px`,
    height: `${targetRect.height}px`,
    margin: "0",
    zIndex: "2147482999",
    pointerEvents: "none",
    display: "none",
    opacity: "1",
    transform: "translate3d(0, 0, 0)",
  });

  document.body.appendChild(ghost);
  return ghost;
};

const hideHandoffGhost = (handoff) => {
  const ghost = handoff.ghost;
  if (!ghost?.isConnected) return;

  if (typeof ghost.animate !== "function") {
    ghost.remove();
    return;
  }

  ghost
    .animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 110,
      easing: "ease-out",
    })
    .finished.catch(() => null)
    .finally(() => ghost.remove());
};

const revealDestination = (handoff) => {
  if (handoff.revealed || !handoff.destinationLayoutNode) return;
  handoff.revealed = true;

  const node = handoff.destinationLayoutNode;
  const originalStyles = handoff.destinationOriginalStyles;
  restoreInlineStyles(node, originalStyles);

  const finalTransform = originalStyles?.transform || "none";
  const reducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  if (reducedMotion || typeof node.animate !== "function") {
    node.style.visibility = originalStyles?.visibility || "";
    node.style.opacity = originalStyles?.opacity || "";
    handoff.ghost?.remove();
    return;
  }

  node.style.visibility = "visible";
  node.style.opacity = "0";
  node.style.transform = "translate3d(0, 5px, 0) scale(0.995)";
  node.style.transition = "none";

  window.requestAnimationFrame(() => {
    if (!node.isConnected) return;

    hideHandoffGhost(handoff);

    const animation = node.animate(
      [
        {
          opacity: 0,
          transform: "translate3d(0, 5px, 0) scale(0.995)",
        },
        {
          opacity: 1,
          transform: finalTransform,
        },
      ],
      {
        duration: REVEAL_DURATION_MS,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    );

    animation.finished
      .catch(() => null)
      .finally(() => {
        if (!node.isConnected) return;
        restoreInlineStyles(node, originalStyles);
      });
  });
};

const finishHandoff = (handoff) => {
  handoff.observer?.disconnect();
  if (handoff.timeoutId) window.clearTimeout(handoff.timeoutId);
  handoff.ghost?.remove();

  if (!handoff.destinationLayoutNode && handoff.sourceLayoutNode?.isConnected) {
    restoreInlineStyles(
      handoff.sourceLayoutNode,
      handoff.sourceOriginalStyles,
    );
  }
};

const syncHandoff = (handoff) => {
  if (!handoff.destinationLayoutNode) {
    const destination = findTaskLayoutInColumn(
      handoff.destinationColumn,
      handoff.taskId,
    );

    if (destination) {
      handoff.destinationLayoutNode = destination.layoutNode;
      handoff.destinationOriginalStyles =
        destination.layoutNode === handoff.sourceLayoutNode
          ? handoff.sourceOriginalStyles
          : captureInlineStyles(destination.layoutNode);

      const rect = handoff.placeholder?.isConnected
        ? handoff.placeholder.getBoundingClientRect()
        : destination.layoutNode.getBoundingClientRect();

      // React can render the destination before the drag engine removes its
      // placeholder. Keep the real card out of layout until that handoff is
      // complete, so the destination column never contains both at once.
      quarantineLayoutNode(destination.layoutNode, rect);
    }
  }

  if (!handoff.placeholder?.isConnected && !handoff.destinationLayoutNode) {
    if (handoff.ghost?.isConnected) handoff.ghost.style.display = "block";
  }

  if (
    handoff.destinationLayoutNode &&
    !handoff.placeholder?.isConnected
  ) {
    revealDestination(handoff);

    // The source node is expected to be unmounted by React. If React reused the
    // same node, revealDestination already restored its original layout styles.
    if (
      handoff.sourceLayoutNode !== handoff.destinationLayoutNode &&
      handoff.sourceLayoutNode?.isConnected
    ) {
      quarantineLayoutNode(
        handoff.sourceLayoutNode,
        handoff.sourceRect,
      );
    }

    window.setTimeout(() => finishHandoff(handoff), REVEAL_DURATION_MS + 40);
  }
};

const startHandoff = (drag) => {
  const placeholder = drag.board.querySelector(PLACEHOLDER_SELECTOR);
  const destinationColumn = placeholder?.closest?.(COLUMN_SELECTOR);
  const destinationColumnId = getColumnId(destinationColumn);

  if (
    !placeholder ||
    !destinationColumn ||
    !destinationColumnId ||
    destinationColumnId === drag.sourceColumnId
  ) {
    return;
  }

  const handoff = {
    taskId: drag.taskId,
    board: drag.board,
    sourceColumn: drag.sourceColumn,
    sourceColumnId: drag.sourceColumnId,
    sourceLayoutNode: drag.sourceLayoutNode,
    sourceRect: drag.sourceRect,
    sourceOriginalStyles: captureInlineStyles(drag.sourceLayoutNode),
    ghost: createHandoffGhost(
      drag,
      placeholder.getBoundingClientRect(),
    ),
    destinationColumn,
    destinationColumnId,
    destinationLayoutNode: null,
    destinationOriginalStyles: null,
    placeholder,
    observer: null,
    timeoutId: null,
    revealed: false,
  };

  // The current drag engine restores display after dispatching Redux. Keeping
  // the source node fixed off-screen prevents that restoration from expanding
  // the old column for one frame before React unmounts it.
  quarantineLayoutNode(handoff.sourceLayoutNode, handoff.sourceRect);

  handoff.observer = new MutationObserver(() => syncHandoff(handoff));
  handoff.observer.observe(handoff.board, {
    childList: true,
    subtree: true,
  });

  handoff.timeoutId = window.setTimeout(() => {
    if (handoff.destinationLayoutNode && !handoff.revealed) {
      revealDestination(handoff);
    }
    finishHandoff(handoff);
  }, HANDOFF_TIMEOUT_MS);

  syncHandoff(handoff);
};

export const installTaskManagerDropHandoff = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    window[INSTALL_KEY]
  ) {
    return;
  }

  window[INSTALL_KEY] = true;

  let drag = null;

  const onPointerDown = (event) => {
    if (drag || event.button !== 0 || event.isPrimary === false) return;

    const card = event.target?.closest?.(CARD_SELECTOR);
    const board = card?.closest?.(BOARD_SELECTOR);
    const sourceColumn = card?.closest?.(COLUMN_SELECTOR);
    if (!card || !board || !sourceColumn) return;

    if (
      event.target?.closest?.(
        "button, a, input, textarea, select, [contenteditable='true']",
      )
    ) {
      return;
    }

    const point = getPoint(event);
    const taskId = getTaskId(card);
    const sourceColumnId = getColumnId(sourceColumn);
    const sourceVisual = card.closest?.(".board-item-shell") || card;
    const sourceLayoutNode = getDirectLayoutNode(sourceVisual, sourceColumn);
    const sourceRect = sourceLayoutNode.getBoundingClientRect();

    if (!point || !taskId || !sourceColumnId || sourceRect.height <= 0) return;

    drag = {
      pointerId: event.pointerId,
      taskId,
      board,
      sourceColumn,
      sourceColumnId,
      sourceVisual,
      sourceLayoutNode,
      sourceRect,
      startPoint: point,
      active: false,
    };
  };

  const onPointerMove = (event) => {
    if (!drag || event.pointerId !== drag.pointerId || drag.active) return;
    const point = getPoint(event);
    if (!point) return;

    drag.active =
      Math.hypot(
        point.x - drag.startPoint.x,
        point.y - drag.startPoint.y,
      ) >= ACTIVATION_DISTANCE;
  };

  const onPointerUp = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const completedDrag = drag;
    drag = null;

    if (completedDrag.active) startHandoff(completedDrag);
  };

  const onPointerCancel = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag = null;
  };

  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("pointermove", onPointerMove, {
    capture: true,
    passive: true,
  });
  window.addEventListener("pointerup", onPointerUp, true);
  window.addEventListener("pointercancel", onPointerCancel, true);
};

export default installTaskManagerDropHandoff;
