const SURFACES = [
  {
    rootSelector: ".board",
    itemSelector: "[data-board-task-id]",
  },
  {
    rootSelector: ".project-todo-list",
    itemSelector: "[data-todo-task-id]",
  },
];

const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";
const POINTER_DRAG_ACTIVE_CLASS = "pointer-list-drag-active";
const EDGE_ZONE = 160;
const MIN_SPEED = 10;
const MAX_INSIDE_SPEED = 44;
const MAX_OUTSIDE_SPEED = 62;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getPoint = (event) => {
  const coalesced = event?.getCoalescedEvents?.();
  const sample = coalesced?.length ? coalesced[coalesced.length - 1] : event;
  const x = sample?.clientX;
  const y = sample?.clientY;

  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};

const findSurface = (target) => {
  for (const surface of SURFACES) {
    const item = target?.closest?.(surface.itemSelector);
    const root = item?.closest?.(surface.rootSelector);
    if (item && root) return { root };
  }

  return null;
};

const canScrollHorizontally = (element) => {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  const overflowX = style.overflowX || "";

  return (
    /(auto|scroll|overlay)/.test(overflowX) &&
    element.scrollWidth > element.clientWidth + 1
  );
};

const collectHorizontalScrollers = (root) => {
  const candidates = [];
  const seen = new Set();
  let element = root;

  while (element && element !== document.body) {
    if (!seen.has(element) && canScrollHorizontally(element)) {
      seen.add(element);
      candidates.push(element);
    }
    element = element.parentElement;
  }

  const documentScroller = document.scrollingElement;
  if (
    documentScroller &&
    !seen.has(documentScroller) &&
    documentScroller.scrollWidth > documentScroller.clientWidth + 1
  ) {
    candidates.push(documentScroller);
  }

  return candidates;
};

const getVisibleHorizontalBounds = (element) => {
  if (element === document.scrollingElement) {
    return { left: 0, right: window.innerWidth };
  }

  const rect = element.getBoundingClientRect();
  return {
    left: Math.max(0, rect.left),
    right: Math.min(window.innerWidth, rect.right),
  };
};

const getHorizontalSpeed = (x, left, right) => {
  if (!Number.isFinite(x) || right <= left) return 0;

  if (x <= left) {
    const outsideRatio = clamp((left - x) / EDGE_ZONE, 0, 1);
    return -Math.round(
      MAX_INSIDE_SPEED +
        (MAX_OUTSIDE_SPEED - MAX_INSIDE_SPEED) * outsideRatio,
    );
  }

  if (x >= right) {
    const outsideRatio = clamp((x - right) / EDGE_ZONE, 0, 1);
    return Math.round(
      MAX_INSIDE_SPEED +
        (MAX_OUTSIDE_SPEED - MAX_INSIDE_SPEED) * outsideRatio,
    );
  }

  const leftDistance = x - left;
  if (leftDistance < EDGE_ZONE) {
    const ratio = clamp((EDGE_ZONE - leftDistance) / EDGE_ZONE, 0, 1);
    return -Math.round(
      MIN_SPEED + (MAX_INSIDE_SPEED - MIN_SPEED) * ratio * ratio,
    );
  }

  const rightDistance = right - x;
  if (rightDistance < EDGE_ZONE) {
    const ratio = clamp((EDGE_ZONE - rightDistance) / EDGE_ZONE, 0, 1);
    return Math.round(
      MIN_SPEED + (MAX_INSIDE_SPEED - MIN_SPEED) * ratio * ratio,
    );
  }

  return 0;
};

export const installPointerListHorizontalAutoScroll = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    window.__orkeloPointerListHorizontalAutoScrollInstalled
  ) {
    return;
  }

  window.__orkeloPointerListHorizontalAutoScrollInstalled = true;

  let drag = null;
  let frameId = null;

  const stop = () => {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = null;
    drag = null;
  };

  const frame = () => {
    if (!drag?.root?.isConnected) {
      stop();
      return;
    }

    if (
      document.documentElement.classList.contains(POINTER_DRAG_ACTIVE_CLASS) &&
      drag.point
    ) {
      if (
        !drag.scrollers.length ||
        performance.now() - drag.scrollersCollectedAt > 300
      ) {
        drag.scrollers = collectHorizontalScrollers(drag.root);
        drag.scrollersCollectedAt = performance.now();
      }

      for (const scroller of drag.scrollers) {
        const { left, right } = getVisibleHorizontalBounds(scroller);
        const speed = getHorizontalSpeed(drag.point.x, left, right);
        if (!speed) continue;

        const current = scroller.scrollLeft;
        const maximum = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
        const next = clamp(current + speed, 0, maximum);
        if (next === current) continue;

        scroller.scrollLeft = next;
        break;
      }
    }

    frameId = window.requestAnimationFrame(frame);
  };

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || event.isPrimary === false) return;
      if (event.target?.closest?.(INTERACTIVE_SELECTOR)) return;

      const match = findSurface(event.target);
      const point = getPoint(event);
      if (!match || !point) return;

      stop();
      drag = {
        pointerId: event.pointerId,
        root: match.root,
        point,
        scrollers: collectHorizontalScrollers(match.root),
        scrollersCollectedAt: performance.now(),
      };
      frameId = window.requestAnimationFrame(frame);
    },
    true,
  );

  window.addEventListener(
    "pointermove",
    (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const point = getPoint(event);
      if (point) drag.point = point;
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    "pointerup",
    (event) => {
      if (drag?.pointerId === event.pointerId) stop();
    },
    true,
  );

  window.addEventListener(
    "pointercancel",
    (event) => {
      if (drag?.pointerId === event.pointerId) stop();
    },
    true,
  );

  window.addEventListener("blur", stop);
};

export default installPointerListHorizontalAutoScroll;
