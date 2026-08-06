import { useEffect, useMemo, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./taskChecklistCopyTour.css";

const COPY_TOUR_STORAGE_PREFIX = "orkelo_task_checklist_copy_tour_seen_v1";
const COPY_TOUR_TARGET_SELECTOR = '[data-orkelo-tour="task-checklist-copy"]';
const COPY_TOUR_QUERY_VALUE = "task-copy";
const BOARD_TOUR_QUERY_VALUE = "project-board";
const TARGET_WAIT_TIMEOUT_MS = 6000;

const normalizeKeyPart = (value, fallback = "guest") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const buildStorageKey = (userId) =>
  `${COPY_TOUR_STORAGE_PREFIX}:${normalizeKeyPart(userId)}`;

const canUseLocalStorage = () => {
  if (typeof window === "undefined") return false;

  try {
    const probeKey = `${COPY_TOUR_STORAGE_PREFIX}:probe`;
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
};

const hasSeenTour = (storageKey) => {
  if (!canUseLocalStorage()) return false;

  try {
    return window.localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
};

const markTourSeen = (storageKey) => {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(storageKey, "1");
  } catch {
    // Storage failures should not block the tour UI.
  }
};

const getTourQueryValue = () => {
  if (typeof window === "undefined" || typeof URLSearchParams === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("tour") || "";
};

const hasForcedTourRequest = () => {
  const tourValue = getTourQueryValue();
  return (
    tourValue === COPY_TOUR_QUERY_VALUE ||
    tourValue === BOARD_TOUR_QUERY_VALUE
  );
};

const isVisibleTarget = (element) => {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== "hidden" &&
    style.display !== "none"
  );
};

const waitForCopyTarget = (onReady) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  let animationFrame = null;
  const startedAt = Date.now();

  const checkTarget = () => {
    const target = document.querySelector(COPY_TOUR_TARGET_SELECTOR);

    if (isVisibleTarget(target)) {
      onReady();
      return;
    }

    if (Date.now() - startedAt >= TARGET_WAIT_TIMEOUT_MS) return;
    animationFrame = window.requestAnimationFrame(checkTarget);
  };

  animationFrame = window.requestAnimationFrame(checkTarget);

  return () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
  };
};

const formatTourPopover = (popover) => {
  popover.closeButton.textContent = "Skip";
  popover.closeButton.setAttribute("aria-label", "Skip checklist copy tour");
  popover.closeButton.setAttribute("title", "Skip tour");
};

const createChecklistCopyTour = (storageKey) =>
  driver({
    allowClose: true,
    allowKeyboardControl: true,
    allowScroll: true,
    animate: true,
    disableActiveInteraction: true,
    doneBtnText: "Done",
    overlayClickBehavior: "close",
    overlayColor: "#06152f",
    overlayOpacity: 0.62,
    popoverClass: "orkelo-task-copy-tour-popover",
    popoverOffset: 14,
    showButtons: ["next", "close"],
    showProgress: false,
    smoothScroll: true,
    stagePadding: 10,
    stageRadius: 999,
    waitForElement: 1500,
    onDestroyed: () => markTourSeen(storageKey),
    onPopoverRender: formatTourPopover,
    steps: [
      {
        element: COPY_TOUR_TARGET_SELECTOR,
        popover: {
          title: "Copy checklist items",
          description:
            "Use this shortcut to preview and copy all checklist items from the task in one place.",
          side: "left",
          align: "center",
        },
      },
    ],
  });

const TaskChecklistCopyTour = ({ enabled, taskId, userId }) => {
  const cancelWaitRef = useRef(null);
  const driverRef = useRef(null);
  const launchedKeyRef = useRef("");
  const storageKey = useMemo(() => buildStorageKey(userId), [userId]);

  useEffect(() => {
    if (!enabled) return undefined;

    const forceTour = hasForcedTourRequest();
    if (!forceTour && hasSeenTour(storageKey)) return undefined;

    const launchKey = [
      storageKey,
      normalizeKeyPart(taskId, "task"),
      forceTour ? "forced" : "auto",
    ].join(":");

    if (launchedKeyRef.current === launchKey) return undefined;
    launchedKeyRef.current = launchKey;

    cancelWaitRef.current = waitForCopyTarget(() => {
      driverRef.current = createChecklistCopyTour(storageKey);
      driverRef.current.drive();
    });

    return () => {
      cancelWaitRef.current?.();
      cancelWaitRef.current = null;

      if (driverRef.current?.isActive()) {
        driverRef.current.destroy();
      }

      driverRef.current = null;
    };
  }, [enabled, storageKey, taskId]);

  return null;
};

export default TaskChecklistCopyTour;
