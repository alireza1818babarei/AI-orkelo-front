export const APP_UPDATES = [
  {
    id: "2026-07-27-project-board-filter-checklist-and-task-move-update",
    version: "v1.5.0",
    releasedAt: "2026-07-27",
    title: "Project Board Update",
    summary:
      "This update makes the Project Board easier to search, filter, organize, and manage by improving checklist actions, adding task filters, and allowing tasks to move between compatible projects.",
    newFeatures: [
      {
        title: "Move Tasks Between Projects",
        description:
          "Tasks can now be moved from one project to another accessible project and placed in a compatible destination column.",
        icon: "ph-duotone ph-arrows-left-right",
      },
      {
        title: "Project Board Filters",
        description:
          "A new filter drawer lets users narrow board tasks by search text, project tags, and priority levels.",
        icon: "ph-duotone ph-funnel",
      },
      {
        title: "Tag And Priority Filtering",
        description:
          "Tasks can now be filtered by one or more tags and priorities, with filters staying active as board content changes.",
        icon: "ph-duotone ph-tag",
      },
      {
        title: "Member-Based Task Filtering",
        description:
          "Project member cards can now be selected to show only tasks assigned to that member across all board columns.",
        icon: "ph-duotone ph-user-focus",
      },
    ],
    bugFixes: [
      "The checklist copy action is no longer hidden inside the three-dot actions menu.",
      "The move-to-another-project action now opens the move dialog without refreshing the page.",
    ],
    improvements: [
      "The checklist copy action was moved out of the three-dot menu and placed directly in the checklist action row.",
      "The copy all checklists tooltip and existing copy modal behavior were preserved.",
      "Moved tasks keep their descriptions, checklists, comments, attachments, assignees, watchers, and activity history.",
      "The filter drawer supports Reset, Apply Filters, backdrop closing, and Escape key closing.",
      "Selected member filters include hover, focus, active, keyboard, light mode, dark mode, and reduced-motion states.",
    ],
    active: true,
  },
];

export const getLatestActiveAppUpdate = () =>
  APP_UPDATES.find((item) => item?.active) ?? null;
