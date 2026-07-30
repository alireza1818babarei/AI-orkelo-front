const TASK_CARD_SELECTOR = ".board-item";
const MAX_VISIBLE_ASSIGNEES = 2;
const OVERFLOW_CLASS = "board-item-assignee-overflow-count";
const HIDDEN_ATTRIBUTE = "data-task-assignee-overflow-hidden";
const STYLE_ID = "task-card-assignee-avatar-limit-styles";

let observer = null;
let scheduledFrame = null;
let installed = false;

const installStyles = () => {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${OVERFLOW_CLASS} {
      width: 40px;
      height: 40px;
      min-width: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bs-body-bg, #fff);
      border-radius: 50%;
      margin-inline-start: -10px;
      background: rgba(var(--primary), 0.14);
      color: rgba(var(--primary), 1);
      box-shadow: 0 1px 4px rgba(15, 23, 42, 0.14);
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      user-select: none;
      pointer-events: none;
      z-index: 10;
    }

    [${HIDDEN_ATTRIBUTE}="true"] {
      display: none !important;
    }
  `;

  document.head.appendChild(style);
};

const resolveAvatarWrapper = (image, card) => {
  const wrapper =
    image.closest(
      "[data-task-assignee-avatar], .board-item-assignee-avatar, .avatar, .h-40.w-40, .rounded-circle, .b-r-50",
    ) || image.parentElement;

  if (!wrapper || wrapper === card || !card.contains(wrapper)) return null;
  if (wrapper.classList?.contains(OVERFLOW_CLASS)) return null;

  return wrapper;
};

const getLargestAvatarGroup = (card) => {
  const images = Array.from(card.querySelectorAll(".board-item-content img"));
  const groups = new Map();

  images.forEach((image) => {
    const wrapper = resolveAvatarWrapper(image, card);
    const parent = wrapper?.parentElement;
    if (!wrapper || !parent) return;

    const wrappers = groups.get(parent) || [];
    if (!wrappers.includes(wrapper)) wrappers.push(wrapper);
    groups.set(parent, wrappers);
  });

  let largest = null;

  groups.forEach((wrappers, parent) => {
    if (!largest || wrappers.length > largest.wrappers.length) {
      largest = { parent, wrappers };
    }
  });

  return largest;
};

const updateTaskCardAssignees = (card) => {
  card
    .querySelectorAll(`[${HIDDEN_ATTRIBUTE}="true"]`)
    .forEach((element) => {
      element.removeAttribute(HIDDEN_ATTRIBUTE);
      element.hidden = false;
    });

  const group = getLargestAvatarGroup(card);
  if (!group) return;

  const { parent, wrappers } = group;
  const existingCounter = parent.querySelector(`.${OVERFLOW_CLASS}`);
  const overflowCount = Math.max(0, wrappers.length - MAX_VISIBLE_ASSIGNEES);

  if (!overflowCount) {
    existingCounter?.remove();
    return;
  }

  wrappers.slice(MAX_VISIBLE_ASSIGNEES).forEach((wrapper) => {
    wrapper.setAttribute(HIDDEN_ATTRIBUTE, "true");
    wrapper.hidden = true;
  });

  const counter = existingCounter || document.createElement("span");
  counter.className = OVERFLOW_CLASS;
  counter.textContent = `+${overflowCount}`;
  counter.setAttribute("aria-label", `${overflowCount} more assignees`);
  counter.setAttribute("title", `${overflowCount} more assignees`);

  const lastVisibleAvatar = wrappers[MAX_VISIBLE_ASSIGNEES - 1];
  if (lastVisibleAvatar?.nextElementSibling !== counter) {
    lastVisibleAvatar?.insertAdjacentElement("afterend", counter);
  }
};

const updateAllTaskCards = () => {
  document.querySelectorAll(TASK_CARD_SELECTOR).forEach(updateTaskCardAssignees);
};

const scheduleUpdate = () => {
  if (scheduledFrame != null) return;

  scheduledFrame = window.requestAnimationFrame(() => {
    scheduledFrame = null;
    updateAllTaskCards();
  });
};

export const installTaskCardAssigneeAvatarLimit = () => {
  if (installed || typeof document === "undefined") return;
  installed = true;

  installStyles();
  scheduleUpdate();

  const root = document.body || document.documentElement;
  if (!root || typeof MutationObserver !== "function") return;

  observer = new MutationObserver(scheduleUpdate);
  observer.observe(root, { childList: true, subtree: true });
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      installTaskCardAssigneeAvatarLimit,
      { once: true },
    );
  } else {
    installTaskCardAssigneeAvatarLimit();
  }
}
