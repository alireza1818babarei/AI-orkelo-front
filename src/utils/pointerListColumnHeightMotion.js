const ACTIVE_CLASS = "pointer-list-drag-active";
const PLACEHOLDER_SELECTOR = ".pointer-list-drag-placeholder";
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";
const HEIGHT_DURATION_MS = 210;
const RELEASE_FALLBACK_MS = 900;

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

const captureManagedStyle = (element) => ({
  height: element.style.height,
  overflow: element.style.overflow,
  willChange: element.style.willChange,
});

const restoreManagedStyle = (element, style) => {
  if (!element || !style) return;
  element.style.height = style.height;
  element.style.overflow = style.overflow;
  element.style.willChange = style.willChange;
};

export const installPointerListColumnHeightMotion = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    window.__orkeloPointerListColumnHeightMotionInstalled
  ) {
    return;
  }

  window.__orkeloPointerListColumnHeightMotionInstalled = true;

  let drag = null;
  const runningAnimations = new WeakMap();

  const getShells = () =>
    drag?.root?.isConnected
      ? [...drag.root.querySelectorAll(drag.surface.shellSelector)]
      : [];

  const ensureBaseStyle = (shell) => {
    if (!drag?.baseStyles.has(shell)) {
      drag?.baseStyles.set(shell, captureManagedStyle(shell));
    }
    return drag?.baseStyles.get(shell);
  };

  const cancelAnimation = (shell) => {
    const record = runningAnimations.get(shell);
    if (!record) return null;

    const visualHeight = shell.getBoundingClientRect().height;
    record.animation.cancel();
    runningAnimations.delete(shell);
    restoreManagedStyle(shell, ensureBaseStyle(shell));

    return visualHeight;
  };

  const animateShell = (shell) => {
    if (!drag || !shell?.isConnected || !drag.root.contains(shell)) return;

    const runningHeight = cancelAnimation(shell);
    const previousHeight =
      runningHeight ??
      drag.heights.get(shell) ??
      shell.getBoundingClientRect().height;

    // Removing our temporary height exposes the new natural layout after the
    // placeholder has entered or left this column.
    restoreManagedStyle(shell, ensureBaseStyle(shell));
    const targetHeight = shell.getBoundingClientRect().height;
    drag.heights.set(shell, targetHeight);

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    if (
      reducedMotion ||
      typeof shell.animate !== "function" ||
      !Number.isFinite(previousHeight) ||
      !Number.isFinite(targetHeight) ||
      Math.abs(targetHeight - previousHeight) < 1
    ) {
      return;
    }

    shell.style.height = `${previousHeight}px`;
    shell.style.overflow = "clip";
    shell.style.willChange = "height";
    void shell.offsetHeight;

    const animation = shell.animate(
      [
        { height: `${previousHeight}px` },
        { height: `${targetHeight}px` },
      ],
      {
        duration: HEIGHT_DURATION_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    const record = { animation };
    runningAnimations.set(shell, record);

    animation.finished
      .catch(() => null)
      .finally(() => {
        if (runningAnimations.get(shell) !== record) return;
        runningAnimations.delete(shell);
        restoreManagedStyle(shell, ensureBaseStyle(shell));
        if (drag?.root?.contains(shell)) {
          drag.heights.set(shell, shell.getBoundingClientRect().height);
        }
      });
  };

  const syncAllHeights = () => {
    if (!drag) return;
    getShells().forEach(animateShell);
  };

  const scheduleStop = (delay = HEIGHT_DURATION_MS + 90) => {
    if (!drag) return;
    if (drag.stopTimerId) window.clearTimeout(drag.stopTimerId);
    drag.stopTimerId = window.setTimeout(stop, delay);
  };

  const stop = () => {
    if (!drag) return;

    if (drag.stopTimerId) window.clearTimeout(drag.stopTimerId);
    drag.observer?.disconnect();

    getShells().forEach((shell) => {
      const record = runningAnimations.get(shell);
      record?.animation?.cancel?.();
      runningAnimations.delete(shell);
      restoreManagedStyle(shell, ensureBaseStyle(shell));
    });

    drag = null;
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
        baseStyles: new WeakMap(),
        observer: null,
        released: false,
        stopTimerId: null,
      };

      getShells().forEach((shell) => {
        ensureBaseStyle(shell);
        drag.heights.set(shell, shell.getBoundingClientRect().height);
      });

      drag.observer = new MutationObserver((mutations) => {
        if (!drag || !mutations.some(mutationTouchesPlaceholder)) return;

        // MutationObserver runs after the placeholder DOM mutation but before
        // the next paint. Cached heights are therefore the previous layout,
        // while the fresh measurements are the new layout. Animating all shells
        // makes the old column collapse and the new column expand together.
        syncAllHeights();

        if (drag.released) {
          scheduleStop();
        }
      });

      drag.observer.observe(drag.root, {
        childList: true,
        subtree: true,
      });
    },
    true,
  );

  window.addEventListener(
    "pointerup",
    (event) => {
      if (drag?.pointerId !== event.pointerId) return;
      drag.released = true;
      scheduleStop(RELEASE_FALLBACK_MS);
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

  const activeClassObserver = new MutationObserver(() => {
    if (!drag || !drag.released) return;
    if (document.documentElement.classList.contains(ACTIVE_CLASS)) return;

    // The pointer engine has completed its handoff. Keep the observer alive for
    // the placeholder removal mutation, then clean up after the height motion.
    scheduleStop();
  });

  activeClassObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("blur", stop);
};

export default installPointerListColumnHeightMotion;
