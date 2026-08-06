export const APP_UPDATES = [
  {
    id: "2026-08-06-task-media-mobile-and-project-board-update",
    version: "v1.6.0",
    releasedAt: "2026-08-06",
    title: "Orkelo Workflow Update",
    summary:
      "This update brings task voice recording, in-app media playback, multi-file uploads, cross-project task moving, stronger board filters, better login sessions, better mobile support, and Telegram bot support.",
    newFeatures: [
      {
        title: "Voice Recording In Tasks",
        description:
          "Voice notes can now be recorded directly inside tasks, making it easier to share quick updates without typing long descriptions.",
        icon: "ph-duotone ph-microphone",
      },
      {
        title: "Audio And Video Preview",
        description:
          "Audio and video attachments can now be played inside Orkelo without downloading the file first.",
        icon: "ph-duotone ph-play-circle",
      },
      {
        title: "Multi-File Task Uploads",
        description:
          "Task attachments and checklist item attachments now support uploading multiple files by selecting, dragging, or pasting copied files.",
        icon: "ph-duotone ph-files",
      },
      {
        title: "Move Tasks Between Projects",
        description:
          "Tasks can now be moved from one project to another accessible project and placed in a compatible destination column.",
        icon: "ph-duotone ph-arrows-left-right",
      },
      {
        title: "Project Board Task Filters",
        description:
          "Board tasks can now be filtered by search text, tags, priorities, and selected project members.",
        icon: "ph-duotone ph-funnel",
      },
      {
        title: "Checklist Copy Shortcut",
        description:
          "The checklist copy action is now available directly from the checklist area for faster access.",
        icon: "ph-duotone ph-copy",
      },
      {
        title: "Improved Login Sessions",
        description:
          "Accounts can now stay signed in across multiple tabs, browsers, and devices at the same time.",
        icon: "ph-duotone ph-devices",
      },
      {
        title: "Better Mobile Experience",
        description:
          "Orkelo has been improved for mobile screens with better responsive behavior, cleaner layout, and smoother daily use.",
        icon: "ph-duotone ph-device-mobile",
      },
      {
        title: "Telegram Bot Support",
        description:
          "Telegram bot support has been added to help teams stay connected with Orkelo updates and workflows.",
        icon: "ph-duotone ph-paper-plane-tilt",
      },
    ],
    active: true,
  },
];

export const getLatestActiveAppUpdate = () =>
  APP_UPDATES.find((item) => item?.active) ?? null;
