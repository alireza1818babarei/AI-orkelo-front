import React, { useCallback, useEffect, useRef } from "react";

const SCROLLABLE_OVERFLOW_RE = /(auto|scroll|overlay)/;
const DEFAULT_EDGE_THRESHOLD = 96;
const DEFAULT_MAX_SPEED = 28;

export const getDragPointerClientPoint = (event) => {
  const touch = event?.touches?.[0] || event?.changedTouches?.[0];
  const clientX = touch?.clientX ?? event?.clientX;
  const clientY = touch?.clientY ?? event?.clientY;

  return typeof clientX === "number" && typeof clientY === "number"
    ? { x: clientX, y: clientY }
    : null;
};

const isScrollableOnAxis = (element, axis) => {
  if (typeof window === "undefined" || !element) return false;

  const isDocumentScroller = element === document.scrollingElement;
  const style = window.getComputedStyle(element);
  const overflow = axis === "x" ? style.overflowX : style.overflowY;
  const hasScrollableOverflow =
    isDocumentScroller || SCROLLABLE_OVERFLOW_RE.test(overflow || "");
  const hasScrollRange =
    axis === "x"
      ? element.scrollWidth > element.clientWidth + 1
      : element.scrollHeight > element.clientHeight + 1;

  return hasScrollableOverflow && hasScrollRange;
};

const collectScrollableAncestors = (node, candidates, seen) => {
  if (typeof document === "undefined" || !node) return;

  let current = node.nodeType === 1 ? node : node.parentElement;

  while (current && current !== document.body) {
    if (
      !seen.has(current) &&
      (isScrollableOnAxis(current, "x") || isScrollableOnAxis(current, "y"))
    ) {
      seen.add(current);
      candidates.push(current);
    }
    current = current.parentElement;
  }

  const documentScroller = document.scrollingElement;
  if (
    documentScroller &&
    !seen.has(documentScroller) &&
    (isScrollableOnAxis(documentScroller, "x") ||
      isScrollableOnAxis(documentScroller, "y"))
  ) {
    seen.add(documentScroller);
    candidates.push(documentScroller);
  }
};

const getElementDepth = (element) => {
  let depth = 0;
  let current = element;
  while (current?.parentElement) {
    depth += 1;
    current = current.parentElement;
  }
  return depth;
};

const getScrollCandidates = (point, rootNode) => {
  if (typeof document === "undefined") return [];

  const candidates = [];
  const seen = new Set();
  const pointElements = point
    ? document.elementsFromPoint(point.x, point.y)
    : [];

  pointElements.forEach((element) => {
    collectScrollableAncestors(element, candidates, seen);
  });
  collectScrollableAncestors(rootNode, candidates, seen);

  return candidates.sort((a, b) => {
    const depthDifference = getElementDepth(b) - getElementDepth(a);
    if (depthDifference !== 0) return depthDifference;

    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return aRect.width * aRect.height - bRect.width * bRect.height;
  });
};

const getEdgeScrollSpeed = (
  coordinate,
  start,
  end,
  threshold,
  maxSpeed,
) => {
  if (!Number.isFinite(coordinate) || coordinate < start || coordinate > end) {
    return 0;
  }

  const size = Math.max(end - start, 0);
  const effectiveThreshold = Math.min(
    threshold,
    Math.max(24, size / 3),
  );
  const startDistance = coordinate - start;
  const endDistance = end - coordinate;
  const nearStart = startDistance < effectiveThreshold;
  const nearEnd = endDistance < effectiveThreshold;

  if (!nearStart && !nearEnd) return 0;

  const startRatio = nearStart
    ? (effectiveThreshold - Math.max(startDistance, 0)) / effectiveThreshold
    : 0;
  const endRatio = nearEnd
    ? (effectiveThreshold - Math.max(endDistance, 0)) / effectiveThreshold
    : 0;

  if (startRatio >= endRatio) {
    return -Math.max(1, Math.round(maxSpeed * startRatio));
  }

  return Math.max(1, Math.round(maxSpeed * endRatio));
};

const scrollElementOnAxis = (element, axis, speed) => {
  if (!element || speed === 0 || !isScrollableOnAxis(element, axis)) {
    return false;
  }

  const current = axis === "x" ? element.scrollLeft : element.scrollTop;
  const max =
    axis === "x"
      ? element.scrollWidth - element.clientWidth
      : element.scrollHeight - element.clientHeight;
  const next = Math.min(max, Math.max(0, current + speed));

  if (next === current) return false;

  if (axis === "x") element.scrollLeft = next;
  else element.scrollTop = next;

  return true;
};

const autoScrollAtPoint = ({
  point,
  rootNode,
  edgeThreshold,
  maxSpeed,
  horizontal,
  vertical,
}) => {
  if (!point) return false;

  const candidates = getScrollCandidates(point, rootNode);
  let didScroll = false;

  if (horizontal) {
    for (const element of candidates) {
      if (!isScrollableOnAxis(element, "x")) continue;
      const rect = element.getBoundingClientRect();
      const speed = getEdgeScrollSpeed(
        point.x,
        rect.left,
        rect.right,
        edgeThreshold,
        maxSpeed,
      );
      if (scrollElementOnAxis(element, "x", speed)) {
        didScroll = true;
        break;
      }
    }
  }

  if (vertical) {
    for (const element of candidates) {
      if (!isScrollableOnAxis(element, "y")) continue;
      const rect = element.getBoundingClientRect();
      const speed = getEdgeScrollSpeed(
        point.y,
        rect.top,
        rect.bottom,
        edgeThreshold,
        maxSpeed,
      );
      if (scrollElementOnAxis(element, "y", speed)) {
        didScroll = true;
        break;
      }
    }
  }

  return didScroll;
};

export const useManualDragAutoScroll = (
  onDragFrame,
  {
    horizontal = true,
    vertical = true,
    edgeThreshold = DEFAULT_EDGE_THRESHOLD,
    maxSpeed = DEFAULT_MAX_SPEED,
  } = {},
) => {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const pointerRef = useRef(null);
  const activeRef = useRef(false);
  const onDragFrameRef = useRef(onDragFrame);

  useEffect(() => {
    onDragFrameRef.current = onDragFrame;
  }, [onDragFrame]);

  const setDragPointer = useCallback((pointOrEvent) => {
    const point =
      pointOrEvent &&
      typeof pointOrEvent.x === "number" &&
      typeof pointOrEvent.y === "number"
        ? pointOrEvent
        : getDragPointerClientPoint(pointOrEvent);

    if (point) pointerRef.current = point;
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      setDragPointer(event);
    },
    [setDragPointer],
  );

  const removeListeners = useCallback(() => {
    if (typeof window === "undefined") return;
    window.removeEventListener("pointermove", handlePointerMove, true);
    window.removeEventListener("mousemove", handlePointerMove, true);
    window.removeEventListener("touchmove", handlePointerMove, true);
  }, [handlePointerMove]);

  const stopDragAutoScroll = useCallback(() => {
    activeRef.current = false;
    removeListeners();

    if (typeof window !== "undefined" && frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = null;
  }, [removeListeners]);

  const clearDragPointer = useCallback(() => {
    pointerRef.current = null;
  }, []);

  const getLatestDragPointer = useCallback(() => pointerRef.current, []);

  const tickDragAutoScroll = useCallback(function tick() {
    if (!activeRef.current || typeof window === "undefined") return;

    const pointer = pointerRef.current;
    const didScroll = autoScrollAtPoint({
      point: pointer,
      rootNode: rootRef.current,
      edgeThreshold,
      maxSpeed,
      horizontal,
      vertical,
    });

    if (pointer) {
      onDragFrameRef.current?.(pointer, didScroll);
    }

    frameRef.current = window.requestAnimationFrame(tick);
  }, [edgeThreshold, horizontal, maxSpeed, vertical]);

  const startDragAutoScroll = useCallback(
    (node, initialPoint = null) => {
      if (typeof window === "undefined") return;

      stopDragAutoScroll();
      rootRef.current = node || rootRef.current;
      pointerRef.current = initialPoint || null;
      activeRef.current = true;

      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
        capture: true,
      });
      window.addEventListener("mousemove", handlePointerMove, {
        passive: true,
        capture: true,
      });
      window.addEventListener("touchmove", handlePointerMove, {
        passive: true,
        capture: true,
      });

      frameRef.current = window.requestAnimationFrame(tickDragAutoScroll);
    },
    [handlePointerMove, stopDragAutoScroll, tickDragAutoScroll],
  );

  useEffect(() => stopDragAutoScroll, [stopDragAutoScroll]);

  return {
    rootRef,
    clearDragPointer,
    getLatestDragPointer,
    setDragPointer,
    startDragAutoScroll,
    stopDragAutoScroll,
  };
};

const findDropContainerFromPoint = ({
  point,
  containerSelector,
  shellSelector,
}) => {
  if (typeof document === "undefined" || !point) return null;

  const elements = document.elementsFromPoint(point.x, point.y);

  for (const element of elements) {
    const directContainer = element.closest?.(containerSelector);
    if (directContainer) return directContainer;

    if (shellSelector) {
      const shell = element.closest?.(shellSelector);
      const nestedContainer = shell?.querySelector?.(containerSelector);
      if (nestedContainer) return nestedContainer;
    }
  }

  return null;
};

export const getPointerListDestination = ({
  point,
  draggedItemId,
  containerSelector,
  shellSelector,
  itemSelector,
  containerIdAttribute,
  itemIdAttribute,
  droppableIdPrefix = "",
}) => {
  const container = findDropContainerFromPoint({
    point,
    containerSelector,
    shellSelector,
  });
  const containerId = container?.getAttribute?.(containerIdAttribute);

  if (!container || !containerId) return null;

  const itemElements = [...container.querySelectorAll(itemSelector)].filter(
    (element) => {
      const itemId = element.getAttribute(itemIdAttribute);
      if (String(itemId ?? "") === String(draggedItemId ?? "")) return false;
      const rect = element.getBoundingClientRect();
      return rect.height > 0 && rect.width > 0;
    },
  );

  const index = itemElements.findIndex((element) => {
    const rect = element.getBoundingClientRect();
    return point.y < rect.top + rect.height / 2;
  });

  return {
    container,
    containerId: String(containerId),
    droppableId: `${droppableIdPrefix}${containerId}`,
    index: index === -1 ? itemElements.length : index,
  };
};

export const getGroupedDestinationIndex = ({
  draggedItem,
  destinationItemIds,
  destinationIndex,
  itemsById,
  isGroupedAtEnd,
}) => {
  const itemIds = Array.isArray(destinationItemIds)
    ? destinationItemIds
    : [];
  const maxIndex = itemIds.length;
  const requestedIndex = Number.isInteger(destinationIndex)
    ? destinationIndex
    : maxIndex;
  const boundedIndex = Math.min(Math.max(requestedIndex, 0), maxIndex);
  const leadingItemCount = itemIds.filter(
    (id) => !isGroupedAtEnd(itemsById?.[String(id)]),
  ).length;

  return isGroupedAtEnd(draggedItem)
    ? Math.max(boundedIndex, leadingItemCount)
    : Math.min(boundedIndex, leadingItemCount);
};

export const isPointInsideElement = (element, point, tolerance = 0) => {
  if (!element || !point) return false;
  const rect = element.getBoundingClientRect();
  return (
    point.x >= rect.left - tolerance &&
    point.x <= rect.right + tolerance &&
    point.y >= rect.top - tolerance &&
    point.y <= rect.bottom + tolerance
  );
};

export const renderSuppressedDropPlaceholder = (
  placeholder,
  shouldSuppress,
) => {
  if (!shouldSuppress || !React.isValidElement(placeholder)) return placeholder;

  return React.cloneElement(placeholder, {
    style: {
      ...(placeholder.props?.style || {}),
      display: "none",
      width: 0,
      height: 0,
      margin: 0,
      padding: 0,
      border: 0,
      opacity: 0,
      overflow: "hidden",
      pointerEvents: "none",
    },
  });
};
