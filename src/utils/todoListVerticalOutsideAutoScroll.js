const ROOT_SELECTOR = ".project-todo-list";
const ITEM_SELECTOR = "[data-todo-task-id]";
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";
const POINTER_DRAG_ACTIVE_CLASS = "pointer-list-drag-active";
const OUTSIDE_ACCELERATION_DISTANCE = 180;
const BASE_OUTSIDE_SPEED = 28;
const MAX_OUTSIDE_SPEED = 52;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getPoint = (event) => {
  const coalesced = event?.getCoalescedEvents?.();
  const sample = coalesced?.length ? coalesced[coalesced.length - 1] : event;
  const x = sample?.clientX;
  const y = sample?.clientY;

  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};

const canScrollVertically = (element) => {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY || "";

  return (
    /(auto|scroll|overlay)/.test(overflowY) &&
    element.scrollHeight > element.clientHeight + 1
  );
};

const collectVerticalScrollers = (root) => {
  const candidates = [];
  const seen = new Set();
  let element = root;

  while (element && element !== document.body) {
    if (!seen.has(element) && canScrollVertically(element)) {
      seen.add(element);
      candidates.push(element);
    }
    element = element.parentElement;
  }

  const documentScroller = document.scrollingElement;
  if (
    documentScroller &&
    !seen.has(documentScroller) &&
    documentScroller.scrollHeight > documentScroller.clientHeight + 1
  ) {
    candidates.push(documentScroller);
  }

  return candidates;
};

const getVisibleVerticalBounds = (element) => {
  if (element === document.scrollingElement) {
    return { top: 0, bottom: window.innerHeight };
  }

  const rect = element.getBoundingClientRect();
  return {
    top: Math.max(0, rect.top),
    bottom: Math.min(window.innerHeight, rect.bottom),
  };
};

const getOutsideSpeed = (y, top, bottom) => {
  if (!Number.isFinite(y) || bottom <= top) return 0;

  if (y <= top) {
    const outsideRatio = clamp(
      (top - y) / OUTSIDE_ACCELERATION_DISTANCE,
      0,
      1,
    );

    return -Math.round(
      BASE_OUTSIDE_SPEED +
        (MAX_OUTSIDE_SPEED - BASE_OUTSIDE_SPEED) * outsideRatio,
    );
  }

  if (y >= bottom) {
    const outsideRatio = clamp(
      (y - bottom) / OUTSIDE_ACCELERATION_DISTANCE,
      0,
      1,
    );

    return Math.round(
      BASE_OUTSIDE_SPEED +
        (MAX_OUTSIDE_SPEED - BASE_OUTSIDE_SPEED) * outsideRatio,
    );
  }

  return 0;
};

export const installTodoListVerticalOutsideAutoScroll = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    window.__orkeloTodoListVerticalOutsideAutoScrollInstalled
  ) {
    return;
  }

  window.__orkeloTodoListVerticalOutsideAutoScrollInstalled = true;

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
        drag.scrollers = collectVerticalScrollers(drag.root);
        drag.scrollersCollectedAt = performance.now();
      }

      for (const scroller of drag.scrollers) {
        const { top, bottom } = getVisibleVerticalBounds(scroller);
        const speed = getOutsideSpeed(drag.point.y, top, bottom);
        if (!speed) continue;

        const current = scroller.scrollTop;
        const maximum = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        const next = clamp(current + speed, 0, maximum);
        if (next === current) continue;

        scroller.scrollTop = next;
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

      const item = event.target?.closest?.(ITEM_SELECTOR);
      const root = item?.closest?.(ROOT_SELECTOR);
      const point = getPoint(event);
      if (!item || !root || !point) return;

      stop();
      drag = {
        pointerId: event.pointerId,
        root,
        point,
        scrollers: collectVerticalScrollers(root),
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

export default installTodoListVerticalOutsideAutoScroll;
