import { useEffect, useMemo, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./taskChecklistCopyTour.css";
import {
  RELEASE_SURFACES,
  getReleaseSurfaceVersion,
  isReleaseSurfaceEnabledForVersion,
  normalizeAppVersion,
} from "../../config/appVersion";
import {
  buildVersionedFeatureStorageKey,
  hasSeenVersionedFeature,
  markVersionedFeatureSeen,
  normalizeStorageKeyPart,
} from "../../utils/releaseFeatureStorage";

const COPY_TOUR_STORAGE_PREFIX = "orkelo_task_checklist_copy_tour_seen";
const LEGACY_COPY_TOUR_STORAGE_PREFIX = "orkelo_task_checklist_copy_tour_seen_v1";
const LEGACY_COPY_TOUR_RELEASE_VERSION = "v1.6.0";
const COPY_TOUR_RELEASE_VERSION = getReleaseSurfaceVersion(
  RELEASE_SURFACES.TASK_CHECKLIST_COPY_TOUR,
);
const shouldReadLegacyCopyTourStorage =
  normalizeAppVersion(COPY_TOUR_RELEASE_VERSION) ===
  normalizeAppVersion(LEGACY_COPY_TOUR_RELEASE_VERSION);
const COPY_TOUR_TARGET_SELECTOR = '[data-orkelo-tour="task-checklist-copy"]';
const COPY_TOUR_QUERY_VALUE = "task-copy";
const BOARD_TOUR_QUERY_VALUE = "project-board";
const TARGET_WAIT_TIMEOUT_MS = 6000;

const normalizeKeyPart = (value, fallback = "guest") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const buildStorageKey = (userId) =>
  buildVersionedFeatureStorageKey({
    prefix: COPY_TOUR_STORAGE_PREFIX,
    userId,
    featureVersion: COPY_TOUR_RELEASE_VERSION,
  });

const buildLegacyStorageKeys = (userId) =>
  shouldReadLegacyCopyTourStorage
    ? [`${LEGACY_COPY_TOUR_STORAGE_PREFIX}:${normalizeStorageKeyPart(userId)}`]
    : [];

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
    onDestroyed: () => markVersionedFeatureSeen(storageKey),
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
  const legacyStorageKeys = useMemo(() => buildLegacyStorageKeys(userId), [userId]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (
      !isReleaseSurfaceEnabledForVersion(
        RELEASE_SURFACES.TASK_CHECKLIST_COPY_TOUR,
      )
    ) {
      return undefined;
    }

    const forceTour = hasForcedTourRequest();
    if (!forceTour && hasSeenVersionedFeature(storageKey, legacyStorageKeys)) {
      return undefined;
    }

    const launchKey = [
      storageKey,
      COPY_TOUR_RELEASE_VERSION,
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
  }, [enabled, legacyStorageKeys, storageKey, taskId]);

  return null;
};

export default TaskChecklistCopyTour;
