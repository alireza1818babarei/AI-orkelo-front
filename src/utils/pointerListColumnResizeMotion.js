const ACTIVE_CLASS = "pointer-list-drag-active";
const PLACEHOLDER_SELECTOR = ".pointer-list-drag-placeholder";
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";
const HEIGHT_DURATION_MS = 180;
const CLEANUP_DELAY_MS = 900;

const SURFACES = [
  {
    rootSelector: ".board",
    itemSelector: "[data-board-task-id]",
    shellSelector: "[data-board-column-shell-id]",
  },
  {
    rootSelector: ".project-todo-list",
    itemSelector: "[data-todo-task-id]",
    shellSelector: "[data-todo-column-shell-id]",
  },
];

const findSurface = (target) => {
  for (const surface of SURFACES) {
    const item = target?.closest?.(surface.itemSelector);
    const root = item?.closest?.(surface.rootSelector);
    if (item && root) return { surface, root };
  }

  return null;
};

const mutationTouchesPlaceholder = (mutation) => {
  const nodes = [...mutation.addedNodes, ...mutation.removedNodes];

  return nodes.some(
    (node) =>
      node?.nodeType === Node.ELEMENT_NODE &&
      (node.matches?.(PLACEHOLDER_SELECTOR) ||
        node.querySelector?.(PLACEHOLDER_SELECTOR)),
  );
};

const getAffectedShells = (drag, mutations) => {
  const shells = new Set();

  mutations.forEach((mutation) => {
    if (!mutationTouchesPlaceholder(mutation)) return;

    const target = mutation.target;
    if (!(target instanceof Element) || !drag.root.contains(target)) return;

    const shell = target.closest?.(drag.surface.shellSelector);
    if (shell && drag.root.contains(shell)) shells.add(shell);
  });

  return shells;
};

export const installPointerListColumnResizeMotion = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    window.__orkeloPointerListColumnResizeMotionInstalled
  ) {
    return;
  }

  window.__orkeloPointerListColumnResizeMotionInstalled = true;

  let drag = null;
  const runningAnimations = new WeakMap();

  const getShells = () =>
    drag?.root?.isConnected
      ? [...drag.root.querySelectorAll(drag.surface.shellSelector)]
      : [];

  const snapshotNaturalHeights = () => {
    if (!drag?.root?.isConnected) return;

    getShells().forEach((shell) => {
      if (runningAnimations.has(shell)) return;
      drag.heights.set(shell, shell.getBoundingClientRect().height);
    });
  };

  const animateShell = (shell) => {
    if (!drag || !shell?.isConnected || !drag.root.contains(shell)) return;

    const running = runningAnimations.get(shell);
    const visualHeight = running
      ? shell.getBoundingClientRect().height
      : drag.heights.get(shell);

    if (running) {
      running.cancel();
      runningAnimations.delete(shell);
    }

    const targetHeight = shell.getBoundingClientRect().height;
    drag.heights.set(shell, targetHeight);

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    if (
      reducedMotion ||
      typeof shell.animate !== "function" ||
      !Number.isFinite(visualHeight) ||
      !Number.isFinite(targetHeight) ||
      Math.abs(targetHeight - visualHeight) < 1
    ) {
      return;
    }

    const animation = shell.animate(
      [
        { height: `${visualHeight}px`, overflow: "hidden" },
        { height: `${targetHeight}px`, overflow: "hidden" },
      ],
      {
        duration: HEIGHT_DURATION_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );

    runningAnimations.set(shell, animation);

    animation.finished
      .catch(() => null)
      .finally(() => {
        if (runningAnimations.get(shell) !== animation) return;
        runningAnimations.delete(shell);
        if (drag?.root?.contains(shell)) {
          drag.heights.set(shell, shell.getBoundingClientRect().height);
        }
      });
  };

  const startSnapshotLoop = () => {
    if (!drag) return;
    snapshotNaturalHeights();
    drag.frameId = window.requestAnimationFrame(startSnapshotLoop);
  };

  const stop = () => {
    if (!drag) return;

    if (drag.frameId) window.cancelAnimationFrame(drag.frameId);
    if (drag.cleanupTimerId) window.clearTimeout(drag.cleanupTimerId);
    drag.observer?.disconnect();

    getShells().forEach((shell) => {
      const animation = runningAnimations.get(shell);
      animation?.cancel?.();
      runningAnimations.delete(shell);
    });

    drag = null;
  };

  const scheduleStop = () => {
    if (!drag) return;
    if (drag.cleanupTimerId) window.clearTimeout(drag.cleanupTimerId);
    drag.cleanupTimerId = window.setTimeout(stop, CLEANUP_DELAY_MS);
  };

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0 || event.isPrimary === false) return;
      if (event.target?.closest?.(INTERACTIVE_SELECTOR)) return;

      const match = findSurface(event.target);
      if (!match) return;

      stop();
      drag = {
        pointerId: event.pointerId,
        surface: match.surface,
        root: match.root,
        heights: new Map(),
        observer: null,
        frameId: null,
        cleanupTimerId: null,
      };

      snapshotNaturalHeights();

      drag.observer = new MutationObserver((mutations) => {
        if (!drag || !document.documentElement.classList.contains(ACTIVE_CLASS)) {
          return;
        }

        const affectedShells = getAffectedShells(drag, mutations);
        affectedShells.forEach(animateShell);
      });

      drag.observer.observe(drag.root, {
        childList: true,
        subtree: true,
      });

      drag.frameId = window.requestAnimationFrame(startSnapshotLoop);
    },
    true,
  );

  window.addEventListener(
    "pointerup",
    (event) => {
      if (drag?.pointerId !== event.pointerId) return;
      scheduleStop();
    },
    true,
  );

  window.addEventListener(
    "pointercancel",
    (event) => {
      if (drag?.pointerId !== event.pointerId) return;
      scheduleStop();
    },
    true,
  );

  window.addEventListener("blur", stop);
};

export default installPointerListColumnResizeMotion;
