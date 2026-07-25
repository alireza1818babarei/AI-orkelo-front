export const APP_UPDATES = [
  {
    id: "2026-07-25-project-board-filter-and-checklist-update",
    version: "v1.4.0",
    releasedAt: "2026-07-25",
    title: "Project Board Update",
    summary:
      "This update makes the Project Board easier to search, filter, and manage by improving checklist actions and adding task filtering by tags, priorities, and assigned members.",
    newFeatures: [
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
    ],
    improvements: [
      "The checklist copy action was moved out of the three-dot menu and placed directly in the checklist action row.",
      "The copy all checklists tooltip and existing copy modal behavior were preserved.",
      "The filter drawer supports Reset, Apply Filters, backdrop closing, and Escape key closing.",
      "Selected member filters include hover, focus, active, keyboard, light mode, dark mode, and reduced-motion states.",
    ],
    active: true,
  },
];

export const getLatestActiveAppUpdate = () =>
  APP_UPDATES.find((item) => item?.active) ?? null;
