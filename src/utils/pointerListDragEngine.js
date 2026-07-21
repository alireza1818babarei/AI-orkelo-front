const surfaces = new Map();

const ACTIVATION_DISTANCE = 5;
const EDGE_THRESHOLD = 76;
const MAX_SCROLL_SPEED = 24;
const DROP_DURATION = 150;
const HANDOFF_TIMEOUT = 700;
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";

let installed = false;
let session = null;
let frameId = null;
let suppressClickUntil = 0;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getPoint = (event) => {
  const coalesced = event?.getCoalescedEvents?.();
  const sample = coalesced?.length ? coalesced[coalesced.length - 1] : event;
  const x = sample?.clientX;
  const y = sample?.clientY;
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};

const getAttribute = (element, name) =>
  String(element?.getAttribute?.(name) ?? "");

const getDirectLayoutNode = (element, container) => {
  let current = element;
  while (current?.parentElement && current.parentElement !== container) {
    current = current.parentElement;
  }
  return current?.parentElement === container ? current : element;
};

const captureInlineStyle = (element) => element?.getAttribute?.("style") ?? null;

const restoreInlineStyle = (element, value) => {
  if (!element) return;
  if (value == null) element.removeAttribute("style");
  else element.setAttribute("style", value);
};

const getEntries = (surface, container, draggedItemId = "") => {
  if (!container) return [];
  const seen = new Set();
  const entries = [];

  container.querySelectorAll(surface.itemSelector).forEach((item) => {
    const itemId = getAttribute(item, surface.itemIdAttribute);
    if (!itemId || itemId === String(draggedItemId)) return;

    const visual = surface.itemVisualSelector
      ? item.closest?.(surface.itemVisualSelector) || item
      : item;
    const layoutNode = getDirectLayoutNode(visual, container);
    if (!layoutNode || seen.has(layoutNode)) return;

    const rect = layoutNode.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    seen.add(layoutNode);
    entries.push({ itemId, item, visual, layoutNode, rect });
  });

  return entries;
};

const findContainerFromPoint = (surface, root, point) => {
  if (!point) return null;

  for (const element of document.elementsFromPoint(point.x, point.y)) {
    const direct = element.closest?.(surface.containerSelector);
    if (direct && root.contains(direct)) return direct;

    if (surface.shellSelector) {
      const shell = element.closest?.(surface.shellSelector);
      const nested = shell?.querySelector?.(surface.containerSelector);
      if (nested && root.contains(nested)) return nested;
    }
  }

  return null;
};

const resolveDestination = (current, point) => {
  const { surface, root, itemId } = current;
  const container = findContainerFromPoint(surface, root, point);
  if (!container) return null;

  const containerId = getAttribute(container, surface.containerIdAttribute);
  if (!containerId) return null;

  const entries = getEntries(surface, container, itemId);
  const rawIndex = entries.findIndex(
    ({ rect }) => point.y < rect.top + rect.height / 2,
  );
  const requestedIndex = rawIndex === -1 ? entries.length : rawIndex;
  const index = surface.normalizeIndex
    ? surface.normalizeIndex({
        itemId,
        containerId,
        rawIndex: requestedIndex,
        itemIds: entries.map((entry) => entry.itemId),
      })
    : requestedIndex;

  return {
    container,
    containerId,
    index: clamp(Number(index) || 0, 0, entries.length),
  };
};

const captureRects = (surface, containers) => {
  const rects = new Map();
  containers.forEach((container) => {
    getEntries(surface, container).forEach(({ itemId, layoutNode, rect }) => {
      rects.set(itemId, { layoutNode, rect });
    });
  });
  return rects;
};

const animateReflow = (surface, beforeRects, containers, duration) => {
  if (!duration) return;

  containers.forEach((container) => {
    getEntries(surface, container).forEach(({ itemId, layoutNode, rect }) => {
      const before = beforeRects.get(itemId)?.rect;
      if (!before || typeof layoutNode.animate !== "function") return;

      const dx = before.left - rect.left;
      const dy = before.top - rect.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

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

const placePlaceholder = (current, destination) => {
  if (!destination) return;

  const { surface, placeholder } = current;
  const previousContainer = current.destination?.container;
  const containers = new Set(
    [previousContainer, destination.container].filter(Boolean),
  );
  const beforeRects = captureRects(surface, containers);
  const entries = getEntries(surface, destination.container, current.itemId);
  const target = entries[destination.index]?.layoutNode;

  if (target) destination.container.insertBefore(placeholder, target);
  else destination.container.appendChild(placeholder);

  current.destination = {
    container: destination.container,
    containerId: destination.containerId,
    index: destination.index,
  };

  animateReflow(surface, beforeRects, containers, current.motionDuration);
};

const getOverflow = (element) => {
  const style = window.getComputedStyle(element);
  return {
    x: /(auto|scroll|overlay)/.test(style.overflowX || ""),
    y: /(auto|scroll|overlay)/.test(style.overflowY || ""),
  };
};

const collectScrollCandidates = (current) => {
  const candidates = [];
  const seen = new Set();
  const seeds = [current.destination?.container, current.root].filter(Boolean);

  seeds.forEach((seed) => {
    let node = seed;
    while (node && node !== document.body) {
      if (!seen.has(node)) {
        const overflow = getOverflow(node);
        const canX = overflow.x && node.scrollWidth > node.clientWidth + 1;
        const canY = overflow.y && node.scrollHeight > node.clientHeight + 1;
        if (canX || canY) {
          seen.add(node);
          candidates.push({ element: node, canX, canY });
        }
      }
      node = node.parentElement;
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

  current.scrollCandidates = candidates;
  current.scrollCandidatesAt = performance.now();
  current.scrollContainerId = current.destination?.containerId || "";
};

const getEdgeSpeed = (coordinate, start, end) => {
  if (coordinate < start || coordinate > end) return 0;
  const size = Math.max(0, end - start);
  const threshold = Math.min(EDGE_THRESHOLD, Math.max(28, size / 3));
  const startDistance = coordinate - start;
  const endDistance = end - coordinate;

  if (startDistance >= threshold && endDistance >= threshold) return 0;

  if (startDistance <= endDistance) {
    const ratio = clamp((threshold - Math.max(0, startDistance)) / threshold, 0, 1);
    return -Math.max(1, Math.round(MAX_SCROLL_SPEED * ratio * ratio));
  }

  const ratio = clamp((threshold - Math.max(0, endDistance)) / threshold, 0, 1);
  return Math.max(1, Math.round(MAX_SCROLL_SPEED * ratio * ratio));
};

const scrollAxis = (candidate, axis, point) => {
  const { element } = candidate;
  const rect = element.getBoundingClientRect();
  const speed = axis === "x"
    ? getEdgeSpeed(point.x, rect.left, rect.right)
    : getEdgeSpeed(point.y, rect.top, rect.bottom);
  if (!speed) return false;

  const current = axis === "x" ? element.scrollLeft : element.scrollTop;
  const max = axis === "x"
    ? element.scrollWidth - element.clientWidth
    : element.scrollHeight - element.clientHeight;
  const next = clamp(current + speed, 0, max);
  if (next === current) return false;

  if (axis === "x") element.scrollLeft = next;
  else element.scrollTop = next;
  return true;
};

const autoScroll = (current, point) => {
  const now = performance.now();
  if (
    !current.scrollCandidates?.length ||
    now - current.scrollCandidatesAt > 180 ||
    current.scrollContainerId !== (current.destination?.containerId || "")
  ) {
    collectScrollCandidates(current);
  }

  let didScroll = false;
  if (current.surface.vertical !== false) {
    for (const candidate of current.scrollCandidates) {
      if (candidate.canY && scrollAxis(candidate, "y", point)) {
        didScroll = true;
        break;
      }
    }
  }

  if (current.surface.horizontal !== false) {
    for (const candidate of current.scrollCandidates) {
      if (candidate.canX && scrollAxis(candidate, "x", point)) {
        didScroll = true;
        break;
      }
    }
  }

  return didScroll;
};

const createOverlay = (current) => {
  const clone = current.sourceVisual.cloneNode(true);
  clone.removeAttribute?.(current.surface.itemIdAttribute);
  clone
    .querySelectorAll?.(`[${current.surface.itemIdAttribute}]`)
    .forEach((element) => element.removeAttribute(current.surface.itemIdAttribute));
  clone.classList.add("pointer-list-drag-overlay");

  Object.assign(clone.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${current.sourceRect.width}px`,
    height: `${current.sourceRect.height}px`,
    margin: "0",
    zIndex: "2147483000",
    pointerEvents: "none",
    willChange: "transform",
    transformOrigin: "center center",
    boxSizing: "border-box",
  });

  document.body.appendChild(clone);
  current.overlay = clone;
};

const moveOverlay = (current, point) => {
  if (!current.overlay) return;
  const left = point.x - current.grabOffset.x;
  const top = point.y - current.grabOffset.y;
  current.overlay.style.transform =
    `translate3d(${left}px, ${top}px, 0) scale(1.018) rotate(0.25deg)`;
};

const installStyles = () => {
  if (document.getElementById("pointer-list-drag-engine-styles")) return;
  const style = document.createElement("style");
  style.id = "pointer-list-drag-engine-styles";
  style.textContent = `
    .pointer-list-drag-active, .pointer-list-drag-active * { cursor: grabbing !important; }
    .pointer-list-drag-overlay { filter: drop-shadow(0 18px 28px rgba(15, 23, 42, 0.28)); opacity: 0.98; }
    .pointer-list-drag-placeholder {
      width: 100%; min-height: 64px; margin: 0 0 10px;
      border: 2px dashed rgba(var(--primary), 0.68); border-radius: 10px;
      background: rgba(var(--primary), 0.09); box-sizing: border-box;
      animation: pointer-list-placeholder-in 105ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes pointer-list-placeholder-in { from { opacity: 0; transform: scaleY(0.92); } to { opacity: 1; transform: scaleY(1); } }
  `;
  document.head.appendChild(style);
};

const activate = (current) => {
  if (current.active) return;
  current.active = true;
  current.motionDuration = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    ? 0
    : 125;

  createOverlay(current);
  current.placeholder = document.createElement("div");
  current.placeholder.className = `pointer-list-drag-placeholder ${current.surface.placeholderClass || ""}`.trim();
  current.placeholder.setAttribute("aria-hidden", "true");
  current.placeholder.style.height = `${Math.max(current.sourceRect.height, 64)}px`;

  current.sourceStyle = captureInlineStyle(current.sourceLayoutNode);
  current.sourceLayoutNode.style.display = "none";
  current.sourceContainer.insertBefore(current.placeholder, current.sourceLayoutNode);

  document.documentElement.classList.add("pointer-list-drag-active");
  current.previousUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = "none";
  moveOverlay(current, current.latestPoint);
};

const animateOverlayTo = async (current, rect) => {
  if (!current.overlay || !rect || !current.motionDuration || typeof current.overlay.animate !== "function") return;
  const left = rect.left + (rect.width - current.sourceRect.width) / 2;
  const top = rect.top;
  const fromTransform = current.overlay.style.transform;
  const toTransform = `translate3d(${left}px, ${top}px, 0) scale(1) rotate(0deg)`;

  try {
    await current.overlay.animate(
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
    // Navigation or cancellation can remove the overlay.
  }
};

const cleanupBase = (current) => {
  current.observer?.disconnect();
  if (current.handoffTimeout) window.clearTimeout(current.handoffTimeout);
  current.placeholder?.remove();
  current.overlay?.remove();
  document.documentElement.classList.remove("pointer-list-drag-active");
  document.body.style.userSelect = current.previousUserSelect || "";
};

const cancelCurrent = async (current) => {
  await animateOverlayTo(current, current.sourceRect);
  restoreInlineStyle(current.sourceLayoutNode, current.sourceStyle);
  cleanupBase(current);
};

const findRenderedDestinationNode = (current) => {
  const container = [...current.root.querySelectorAll(current.surface.containerSelector)].find(
    (candidate) =>
      getAttribute(candidate, current.surface.containerIdAttribute) ===
      String(current.destination?.containerId || ""),
  );
  if (!container) return null;

  const item = [...container.querySelectorAll(current.surface.itemSelector)].find(
    (candidate) =>
      getAttribute(candidate, current.surface.itemIdAttribute) === current.itemId,
  );
  if (!item) return null;

  const visual = current.surface.itemVisualSelector
    ? item.closest?.(current.surface.itemVisualSelector) || item
    : item;
  return {
    container,
    node: getDirectLayoutNode(visual, container),
  };
};

const fadeOverlayOut = (current) => {
  if (!current.overlay?.isConnected) return Promise.resolve();
  if (!current.motionDuration || typeof current.overlay.animate !== "function") {
    current.overlay.remove();
    return Promise.resolve();
  }

  return current.overlay
    .animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: DROP_DURATION,
      easing: "ease-out",
      fill: "forwards",
    })
    .finished.catch(() => null)
    .finally(() => current.overlay?.remove());
};

const completeHandoff = async (current, rendered) => {
  if (current.handoffComplete) return;
  current.handoffComplete = true;
  current.observer?.disconnect();
  if (current.handoffTimeout) window.clearTimeout(current.handoffTimeout);

  const node = rendered.node;
  const destinationStyle = captureInlineStyle(node);
  const placeholderRect = current.placeholder?.getBoundingClientRect();

  Object.assign(node.style, {
    position: "fixed",
    left: "-100000px",
    top: "-100000px",
    width: `${Math.max(placeholderRect?.width || current.sourceRect.width, 1)}px`,
    height: `${Math.max(placeholderRect?.height || current.sourceRect.height, 1)}px`,
    margin: "0",
    visibility: "hidden",
    pointerEvents: "none",
  });

  await (current.dropAnimationPromise || Promise.resolve());

  window.requestAnimationFrame(() => {
    current.placeholder?.remove();
    restoreInlineStyle(node, destinationStyle);

    if (node === current.sourceLayoutNode) {
      restoreInlineStyle(node, current.sourceStyle);
    }

    node.style.opacity = "0";
    node.style.transform = "translate3d(0, 4px, 0) scale(0.997)";
    node.style.transition = "none";
    node.style.visibility = "visible";

    const revealPromise =
      typeof node.animate === "function" && current.motionDuration
        ? node
            .animate(
              [
                { opacity: 0, transform: "translate3d(0, 4px, 0) scale(0.997)" },
                { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
              ],
              {
                duration: DROP_DURATION,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              },
            )
            .finished.catch(() => null)
        : Promise.resolve();

    const overlayPromise = fadeOverlayOut(current);

    Promise.all([revealPromise, overlayPromise]).finally(() => {
      if (node.isConnected) restoreInlineStyle(node, destinationStyle);
      if (current.sourceLayoutNode !== node && current.sourceLayoutNode?.isConnected) {
        current.sourceLayoutNode.style.display = "none";
      }
      cleanupBase(current);
    });
  });
};

const waitForHandoff = (current) => {
  const tryComplete = () => {
    const rendered = findRenderedDestinationNode(current);
    if (rendered) void completeHandoff(current, rendered);
  };

  current.observer = new MutationObserver(tryComplete);
  current.observer.observe(current.root, { childList: true, subtree: true });
  current.handoffTimeout = window.setTimeout(() => {
    if (current.handoffComplete) return;
    const rendered = findRenderedDestinationNode(current);
    if (rendered) {
      void completeHandoff(current, rendered);
      return;
    }

    restoreInlineStyle(current.sourceLayoutNode, current.sourceStyle);
    cleanupBase(current);
  }, HANDOFF_TIMEOUT);

  tryComplete();
};

const stopFrame = () => {
  if (frameId) window.cancelAnimationFrame(frameId);
  frameId = null;
};

const clearActiveListeners = () => {
  window.removeEventListener("pointermove", onPointerMove, true);
  window.removeEventListener("pointerup", onPointerUp, true);
  window.removeEventListener("pointercancel", onPointerCancel, true);
  window.removeEventListener("keydown", onKeyDown, true);
};

const finish = async (cancelled = false) => {
  const current = session;
  if (!current || current.finishing) return;
  current.finishing = true;
  stopFrame();
  clearActiveListeners();

  if (!current.active) {
    session = null;
    return;
  }

  suppressClickUntil = performance.now() + 350;
  const destination = !cancelled
    ? resolveDestination(current, current.latestPoint) || current.destination
    : null;

  if (!destination) {
    await cancelCurrent(current);
    session = null;
    return;
  }

  placePlaceholder(current, destination);

  const accepted = current.surface.onDrop?.({
    itemId: current.itemId,
    sourceContainerId: current.sourceContainerId,
    destinationContainerId: current.destination.containerId,
    destinationIndex: current.destination.index,
  });

  if (accepted === false) {
    await cancelCurrent(current);
    session = null;
    return;
  }

  current.dropAnimationPromise = animateOverlayTo(
    current,
    current.placeholder.getBoundingClientRect(),
  );
  waitForHandoff(current);
  session = null;
};

const dragFrame = () => {
  const current = session;
  if (!current) return;

  if (current.active) {
    moveOverlay(current, current.latestPoint);
    const didScroll = autoScroll(current, current.latestPoint);
    const destination = resolveDestination(current, current.latestPoint);

    if (
      destination &&
      (didScroll ||
        destination.containerId !== current.destination?.containerId ||
        destination.index !== current.destination?.index)
    ) {
      placePlaceholder(current, destination);
    }
  }

  frameId = window.requestAnimationFrame(dragFrame);
};

function onPointerMove(event) {
  if (!session || event.pointerId !== session.pointerId || session.finishing) return;
  const point = getPoint(event);
  if (!point) return;
  session.latestPoint = point;

  if (!session.active) {
    const distance = Math.hypot(
      point.x - session.startPoint.x,
      point.y - session.startPoint.y,
    );
    if (distance >= (session.surface.activationDistance || ACTIVATION_DISTANCE)) {
      activate(session);
    }
  }

  if (session.active && event.cancelable) event.preventDefault();
}

function onPointerUp(event) {
  if (!session || event.pointerId !== session.pointerId || session.finishing) return;
  const point = getPoint(event);
  if (point) session.latestPoint = point;
  if (session.active && event.cancelable) event.preventDefault();
  void finish(false);
}

function onPointerCancel(event) {
  if (!session || event.pointerId !== session.pointerId || session.finishing) return;
  void finish(true);
}

function onKeyDown(event) {
  if (event.key !== "Escape" || !session?.active || session.finishing) return;
  event.preventDefault();
  void finish(true);
}

const findSurface = (target) => {
  for (const surface of surfaces.values()) {
    const item = target?.closest?.(surface.itemSelector);
    const root = item?.closest?.(surface.rootSelector);
    const container = item?.closest?.(surface.containerSelector);
    if (item && root && container) return { surface, item, root, container };
  }
  return null;
};

const onPointerDown = (event) => {
  if (session || event.button !== 0 || event.isPrimary === false) return;
  if (event.target?.closest?.(INTERACTIVE_SELECTOR)) return;

  const match = findSurface(event.target);
  if (!match) return;

  const point = getPoint(event);
  const { surface, item, root, container } = match;
  const itemId = getAttribute(item, surface.itemIdAttribute);
  const sourceContainerId = getAttribute(container, surface.containerIdAttribute);
  const sourceVisual = surface.itemVisualSelector
    ? item.closest?.(surface.itemVisualSelector) || item
    : item;
  const sourceLayoutNode = getDirectLayoutNode(sourceVisual, container);
  const sourceRect = sourceLayoutNode.getBoundingClientRect();

  if (!point || !itemId || !sourceContainerId || sourceRect.height <= 0) return;

  session = {
    pointerId: event.pointerId,
    surface,
    itemId,
    root,
    sourceContainer: container,
    sourceContainerId,
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
    finishing: false,
    destination: null,
    scrollCandidates: [],
    scrollCandidatesAt: 0,
    scrollContainerId: "",
    dropAnimationPromise: null,
  };

  window.addEventListener("pointermove", onPointerMove, { capture: true, passive: false });
  window.addEventListener("pointerup", onPointerUp, { capture: true, passive: false });
  window.addEventListener("pointercancel", onPointerCancel, true);
  window.addEventListener("keydown", onKeyDown, true);
  frameId = window.requestAnimationFrame(dragFrame);
};

const blockPackageSensor = (event) => {
  if (!findSurface(event.target)) return;
  event.stopImmediatePropagation();
};

const suppressDraggedClick = (event) => {
  if (performance.now() > suppressClickUntil) return;
  if (!findSurface(event.target)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  suppressClickUntil = 0;
};

const install = () => {
  if (installed || typeof window === "undefined" || typeof document === "undefined") return;
  installed = true;
  installStyles();
  window.addEventListener("pointerdown", onPointerDown, true);
  window.addEventListener("mousedown", blockPackageSensor, true);
  window.addEventListener("touchstart", blockPackageSensor, { capture: true, passive: true });
  window.addEventListener("click", suppressDraggedClick, true);
};

export const registerPointerListDragSurface = (surface) => {
  if (!surface?.id) throw new Error("Pointer drag surface id is required");
  surfaces.set(surface.id, surface);
  install();

  return () => {
    if (surfaces.get(surface.id) === surface) surfaces.delete(surface.id);
  };
};

export default registerPointerListDragSurface;
