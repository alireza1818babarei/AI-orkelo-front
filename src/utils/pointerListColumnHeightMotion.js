const ACTIVE_CLASS = "pointer-list-drag-active";
const PLACEHOLDER_SELECTOR = ".pointer-list-drag-placeholder";
const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable='true']";
const HEIGHT_DURATION_MS = 190;

const SURFACES = [
  {
    rootSelector: ".board",
    itemSelector: "[data-board-task-id]",
    shellSelector: "[data-board-column-shell-id]",
    containerSelector: "[data-board-column-id]",
  },
  {
    rootSelector: ".project-todo-list",
    itemSelector: "[data-todo-task-id]",
    shellSelector: "[data-todo-column-shell-id]",
    containerSelector: "[data-todo-column-id]",
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

const getShellFromMutation = (surface, root, mutation) => {
  const target = mutation.target;
  if (!(target instanceof Element) || !root.contains(target)) return null;

  const container = target.closest?.(surface.containerSelector);
  const shell = container?.closest?.(surface.shellSelector);
  return shell && root.contains(shell) ? shell : null;
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

  const stopHeightAnimation = (element) => {
    const record = runningAnimations.get(element);
    if (!record) return null;

    const visualHeight = element.getBoundingClientRect().height;
    record.animation.cancel();
    restoreInlineStyle(element, record.originalStyle);
    runningAnimations.delete(element);

    return visualHeight;
  };

  const animateHeight = (element, previousHeight) => {
    if (!element?.isConnected) return;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reducedMotion || typeof element.animate !== "function") return;

    const interruptedHeight = stopHeightAnimation(element);
    const fromHeight = interruptedHeight ?? previousHeight;
    const originalStyle = captureInlineStyle(element);
    const targetHeight = element.getBoundingClientRect().height;

    if (
      !Number.isFinite(fromHeight) ||
      !Number.isFinite(targetHeight) ||
      Math.abs(targetHeight - fromHeight) < 1
    ) {
      drag?.heights.set(element, targetHeight);
      return;
    }

    element.style.height = `${fromHeight}px`;
    element.style.overflow = "clip";
    element.style.willChange = "height";
    void element.offsetHeight;

    const animation = element.animate(
      [
        { height: `${fromHeight}px` },
        { height: `${targetHeight}px` },
      ],
      {
        duration: HEIGHT_DURATION_MS,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    const record = { animation, originalStyle };
    runningAnimations.set(element, record);

    animation.finished
      .catch(() => null)
      .finally(() => {
        if (runningAnimations.get(element) !== record) return;
        restoreInlineStyle(element, originalStyle);
        runningAnimations.delete(element);
        if (drag?.root?.contains(element)) {
          drag.heights.set(element, element.getBoundingClientRect().height);
        }
      });
  };

  const snapshotHeights = () => {
    if (!drag?.root?.isConnected) return;

    drag.root.querySelectorAll(drag.surface.shellSelector).forEach((shell) => {
      if (runningAnimations.has(shell)) return;
      drag.heights.set(shell, shell.getBoundingClientRect().height);
    });
  };

  const frame = () => {
    if (!drag) return;
    snapshotHeights();
    drag.frameId = window.requestAnimationFrame(frame);
  };

  const stop = () => {
    if (!drag) return;
    if (drag.frameId) window.cancelAnimationFrame(drag.frameId);
    drag.observer?.disconnect();
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
        frameId: null,
        observer: null,
      };

      snapshotHeights();

      drag.observer = new MutationObserver((mutations) => {
        if (
          !drag ||
          !document.documentElement.classList.contains(ACTIVE_CLASS)
        ) {
          return;
        }

        const affectedShells = new Set();

        mutations.forEach((mutation) => {
          if (!mutationTouchesPlaceholder(mutation)) return;
          const shell = getShellFromMutation(
            drag.surface,
            drag.root,
            mutation,
          );
          if (shell) affectedShells.add(shell);
        });

        affectedShells.forEach((shell) => {
          const previousHeight = drag.heights.get(shell);
          animateHeight(shell, previousHeight);
        });
      });

      drag.observer.observe(drag.root, {
        childList: true,
        subtree: true,
      });
      drag.frameId = window.requestAnimationFrame(frame);
    },
    true,
  );

  window.addEventListener(
    "pointerup",
    (event) => {
      if (drag?.pointerId === event.pointerId) {
        window.setTimeout(stop, HEIGHT_DURATION_MS + 40);
      }
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

export default installPointerListColumnHeightMotion;
