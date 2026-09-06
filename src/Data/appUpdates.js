import { APP_VERSION, normalizeAppVersion } from "../config/appVersion";

export const APP_UPDATES = [
  {
    id: "2026-09-06-super-task-update",
    version: "v1.7.0",
    releasedAt: "2026-09-06",
    title: "Super Task Is Now Available",
    summary:
      "Super Task introduces a new way to manage large, multi-part, and collaborative work in Orkelo. Break complex work into Sub-tasks, organize independent Work Items, assign responsibilities, track progress, and manage the entire workflow in one place.",
    newFeatures: [
      {
        title: "Super Task",
        description:
          "Create a Super Task for larger pieces of work and assign one main owner who is responsible for coordinating and managing the overall task.",
        icon: "ph-duotone ph-tree-structure",
      },
      {
        title: "Sub-tasks",
        description:
          "Break a Super Task into multiple Sub-tasks so each independent part of the main work can be organized and managed separately.",
        icon: "ph-duotone ph-list-checks",
      },
      {
        title: "Work Items",
        description:
          "Create multiple independent Work Items inside each Sub-task and assign each Work Item to a specific team member.",
        icon: "ph-duotone ph-check-square",
      },
      {
        title: "Work Roles",
        description:
          "Work Roles identify the responsibilities of team members. The status of each work-role group is shown directly on the Sub-task card, making it easy to see which roles have completed their work and which are still in progress.",
        icon: "ph-duotone ph-users-three",
      },
      {
        title: "Review, Approve & Reject",
        description:
          "Work Items and Sub-tasks can move through Review, Approve, and Reject workflows, allowing work to be checked and confirmed before completion.",
        icon: "ph-duotone ph-seal-check",
      },
      {
        title: "Time Tracking",
        description:
          "Team members can track the time they spend working on their assigned Work Items directly inside the Super Task workflow.",
        icon: "ph-duotone ph-timer",
      },
      {
        title: "Attachments & Voice",
        description:
          "Files and voice recordings can be added while working on Work Items, keeping relevant information and communication connected to the work.",
        icon: "ph-duotone ph-paperclip",
      },
      {
        title: "Activity",
        description:
          "Important actions and changes are recorded in Activity so the progress and history of work can be followed more easily.",
        icon: "ph-duotone ph-clock-counter-clockwise",
      },
      {
        title: "Smart Ordering",
        description:
          "Sub-tasks and Work Items can be reordered, while approved items are automatically kept organized at the end of the list.",
        icon: "ph-duotone ph-arrows-down-up",
      },
      {
        title: "Integrated With Orkelo",
        description:
          "Super Task works with Assignment, Work Roles, Review & Approval, Time Tracking, Attachments, Voice, Activity, Notifications, Tags, Priority, Due Date, and Watchers.",
        icon: "ph-duotone ph-squares-four",
      },
    ],
    active: true,
  },
];

export const getActiveAppUpdateForVersion = (appVersion = APP_VERSION) => {
  const normalizedAppVersion = normalizeAppVersion(appVersion);

  return (
    APP_UPDATES.find(
      (item) =>
        item?.active &&
        normalizeAppVersion(item?.version) === normalizedAppVersion,
    ) ?? null
  );
};

export const getLatestActiveAppUpdate = getActiveAppUpdateForVersion;
