import { useEffect, useMemo, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "../projectBoardTour.css";
import {
  RELEASE_SURFACES,
  getReleaseSurfaceVersion,
  isReleaseSurfaceEnabledForVersion,
  normalizeAppVersion,
} from "../../../../config/appVersion";
import {
  buildVersionedFeatureStorageKey,
  hasSeenVersionedFeature,
  markVersionedFeatureSeen,
  normalizeStorageKeyPart,
} from "../../../../utils/releaseFeatureStorage";

const TOUR_STORAGE_PREFIX = "orkelo_project_board_tour_seen";
const LEGACY_TOUR_STORAGE_PREFIX = "orkelo_project_board_tour_seen_v1";
const LEGACY_TOUR_RELEASE_VERSION = "v1.6.0";
const TOUR_RELEASE_VERSION = getReleaseSurfaceVersion(
  RELEASE_SURFACES.PROJECT_BOARD_TOUR,
);
const shouldReadLegacyTourStorage =
  normalizeAppVersion(TOUR_RELEASE_VERSION) ===
  normalizeAppVersion(LEGACY_TOUR_RELEASE_VERSION);
const TOUR_QUERY_VALUE = "project-board";
const FILTER_TARGET_SELECTOR = '[data-orkelo-tour="project-task-filter"]';
const MEMBER_TARGET_SELECTOR = '[data-orkelo-tour="project-member-filter"]';
const TARGET_WAIT_TIMEOUT_MS = 7000;

const normalizeKeyPart = (value, fallback = "guest") => {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
};

const buildStorageKey = (userId) =>
  buildVersionedFeatureStorageKey({
    prefix: TOUR_STORAGE_PREFIX,
    userId,
    featureVersion: TOUR_RELEASE_VERSION,
  });

const buildLegacyStorageKeys = (userId) =>
  shouldReadLegacyTourStorage
    ? [`${LEGACY_TOUR_STORAGE_PREFIX}:${normalizeStorageKeyPart(userId)}`]
    : [];

const hasForcedTourRequest = (locationSearch) => {
  if (typeof URLSearchParams === "undefined") return false;
  const params = new URLSearchParams(String(locationSearch || ""));
  return params.get("tour") === TOUR_QUERY_VALUE;
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

const waitForTourTargets = (onReady) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  let animationFrame = null;
  const startedAt = Date.now();

  const checkTargets = () => {
    const filterTarget = document.querySelector(FILTER_TARGET_SELECTOR);
    const memberTarget = document.querySelector(MEMBER_TARGET_SELECTOR);

    if (isVisibleTarget(filterTarget) && isVisibleTarget(memberTarget)) {
      onReady();
      return;
    }

    if (Date.now() - startedAt >= TARGET_WAIT_TIMEOUT_MS) return;
    animationFrame = window.requestAnimationFrame(checkTargets);
  };

  animationFrame = window.requestAnimationFrame(checkTargets);

  return () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
  };
};

const formatTourPopover = (popover) => {
  popover.closeButton.textContent = "Skip";
  popover.closeButton.setAttribute("aria-label", "Skip project board tour");
  popover.closeButton.setAttribute("title", "Skip tour");
};

const createProjectBoardTour = (storageKey) =>
  driver({
    allowClose: true,
    allowKeyboardControl: true,
    allowScroll: true,
    animate: true,
    disableActiveInteraction: true,
    doneBtnText: "Done",
    nextBtnText: "Next",
    overlayClickBehavior: "close",
    overlayColor: "#06152f",
    overlayOpacity: 0.62,
    popoverClass: "orkelo-project-board-tour-popover",
    popoverOffset: 14,
    progressText: "{{current}} of {{total}}",
    showButtons: ["next", "close"],
    showProgress: true,
    smoothScroll: true,
    stagePadding: 12,
    stageRadius: 999,
    waitForElement: 1500,
    onDestroyed: () => markVersionedFeatureSeen(storageKey),
    onPopoverRender: formatTourPopover,
    steps: [
      {
        element: FILTER_TARGET_SELECTOR,
        popover: {
          title: "Filter board tasks",
          description:
            "<p>Use this filter to focus the Task Manager by:</p><ul><li>Priority</li><li>Project Tags</li></ul>",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: MEMBER_TARGET_SELECTOR,
        popover: {
          title: "View work by member",
          description:
            "Click a project member to show only the tasks assigned to that person. Click the same member again to return to the full board.",
          side: "left",
          align: "center",
        },
      },
    ],
  });

const ProjectBoardTour = ({
  enabled,
  locationSearch,
  onShowMembersPanel,
  projectId,
  userId,
}) => {
  const cancelWaitRef = useRef(null);
  const driverRef = useRef(null);
  const launchedKeyRef = useRef("");
  const onShowMembersPanelRef = useRef(onShowMembersPanel);
  const storageKey = useMemo(() => buildStorageKey(userId), [userId]);
  const legacyStorageKeys = useMemo(() => buildLegacyStorageKeys(userId), [userId]);

  useEffect(() => {
    onShowMembersPanelRef.current = onShowMembersPanel;
  }, [onShowMembersPanel]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (
      !isReleaseSurfaceEnabledForVersion(RELEASE_SURFACES.PROJECT_BOARD_TOUR)
    ) {
      return undefined;
    }

    const forceTour = hasForcedTourRequest(locationSearch);
    if (!forceTour && hasSeenVersionedFeature(storageKey, legacyStorageKeys)) {
      return undefined;
    }

    const launchKey = [
      storageKey,
      TOUR_RELEASE_VERSION,
      normalizeKeyPart(projectId, "project"),
      forceTour ? "forced" : "auto",
    ].join(":");

    if (launchedKeyRef.current === launchKey) return undefined;
    launchedKeyRef.current = launchKey;

    onShowMembersPanelRef.current?.();

    cancelWaitRef.current = waitForTourTargets(() => {
      driverRef.current = createProjectBoardTour(storageKey);
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
  }, [enabled, legacyStorageKeys, locationSearch, projectId, storageKey]);

  return null;
};

export default ProjectBoardTour;
