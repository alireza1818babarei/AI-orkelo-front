const ACTIVE_CLASS = "pointer-list-drag-active";
const PLACEHOLDER_SELECTOR = ".pointer-list-drag-placeholder";
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";
const HEIGHT_DURATION_MS = 190;
const RELEASE_SETTLE_MS = 720;

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

const captureInlineStyle = (element) =>
  element?.getAttribute?.("style") ?? null;

const restoreInlineStyle = (element, value) => {
  if (!element) return;
  if (value == null) element.removeAttribute("style");
  else element.setAttribute("style", value);
};

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

  const ensureOriginalStyle = (shell) => {
    if (!drag?.originalStyles.has(shell)) {
      drag?.originalStyles.set(shell, captureInlineStyle(shell));
    }
    return drag?.originalStyles.get(shell) ?? null;
  };

  const releaseAnimation = (shell) => {
    const record = runningAnimations.get(shell);
    const visualHeight = shell?.getBoundingClientRect?.().height;

    if (record) {
      record.animation.cancel();
      runningAnimations.delete(shell);
    }

    restoreInlineStyle(shell, ensureOriginalStyle(shell));
    return visualHeight;
  };

  const animateShellToNaturalHeight = (shell) => {
    if (!drag || !shell?.isConnected || !drag.root.contains(shell)) return;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    const fromHeight = releaseAnimation(shell);
    const naturalHeight = shell.getBoundingClientRect().height;

    if (
      reducedMotion ||
      typeof shell.animate !== "function" ||
      !Number.isFinite(fromHeight) ||
      !Number.isFinite(naturalHeight) ||
      Math.abs(naturalHeight - fromHeight) < 1
    ) {
      restoreInlineStyle(shell, ensureOriginalStyle(shell));
      return;
    }

    shell.style.height = `${fromHeight}px`;
    shell.style.overflow = "clip";
    shell.style.willChange = "height";
    void shell.offsetHeight;

    const animation = shell.animate(
      [
        { height: `${fromHeight}px` },
        { height: `${naturalHeight}px` },
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
        restoreInlineStyle(shell, ensureOriginalStyle(shell));
      });
  };

  const animateAllShells = () => {
    if (!drag?.root?.isConnected) return;

    drag.root
      .querySelectorAll(drag.surface.shellSelector)
      .forEach((shell) => animateShellToNaturalHeight(shell));
  };

  const scheduleHeightSync = () => {
    if (!drag || drag.syncFrameId) return;

    drag.syncFrameId = window.requestAnimationFrame(() => {
      if (!drag) return;
      drag.syncFrameId = null;
      animateAllShells();
    });
  };

  const stop = () => {
    if (!drag) return;

    if (drag.syncFrameId) window.cancelAnimationFrame(drag.syncFrameId);
    if (drag.releaseTimerId) window.clearTimeout(drag.releaseTimerId);
    drag.observer?.disconnect();

    drag.root
      ?.querySelectorAll?.(drag.surface.shellSelector)
      .forEach((shell) => {
        const record = runningAnimations.get(shell);
        record?.animation?.cancel?.();
        runningAnimations.delete(shell);
        restoreInlineStyle(shell, ensureOriginalStyle(shell));
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
        originalStyles: new WeakMap(),
        observer: null,
        syncFrameId: null,
        releaseTimerId: null,
      };

      drag.root
        .querySelectorAll(drag.surface.shellSelector)
        .forEach((shell) => ensureOriginalStyle(shell));

      drag.observer = new MutationObserver((mutations) => {
        if (!drag) return;
        if (!mutations.some(mutationTouchesPlaceholder)) return;

        // A placeholder move changes both the previous and next columns. Sync
        // every shell from its current visual height to its new natural height
        // so the previous column always collapses while the next one expands.
        scheduleHeightSync();
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

      scheduleHeightSync();
      drag.releaseTimerId = window.setTimeout(() => {
        scheduleHeightSync();
        window.requestAnimationFrame(stop);
      }, RELEASE_SETTLE_MS);
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
    if (!drag) return;
    if (document.documentElement.classList.contains(ACTIVE_CLASS)) return;

    scheduleHeightSync();
  });

  activeClassObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("blur", stop);
};

export default installPointerListColumnHeightMotion;
