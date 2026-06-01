export const APP_UPDATES = [
  {
    id: "2026-05-31-request-task-tracker-finance-and-performance-updates",
    version: "v1.3.0",
    releasedAt: "2026-05-31",
    title: "Orkelo Product Update",
    summary:
      "This update improves leave requests, user warnings, task management, trackers, performance analysis, file handling, and Finance Center so daily work is clearer for admins, project managers, and regular users.",
    newFeatures: [
      {
        title: "Leave Requests For Regular Users",
        description:
          "Regular users can now view their pending leave requests and cancel their own request before it is approved or rejected.",
        icon: "ph-duotone ph-calendar-check",
      },
      {
        title: "Checklist Item Attachments",
        description:
          "Each checklist item can now have its own attachments with preview, download, and delete actions.",
        icon: "ph-duotone ph-paperclip",
      },
      {
        title: "Better Project Manager Access",
        description:
          "Project managers can access active trackers and available project members only within their permitted project scope.",
        icon: "ph-duotone ph-user-gear",
      },
      {
        title: "User Performance Analysis",
        description:
          "Company owners and supervisors can review tracked time, working days, leave days, task totals, overdue tasks, and ratings.",
        icon: "ph-duotone ph-chart-line-up",
      },
      {
        title: "User Warning Management",
        description:
          "Managers can issue low, medium, or high warnings, review warning history, and users must acknowledge pending warnings before continuing.",
        icon: "ph-duotone ph-warning-octagon",
      },
      {
        title: "Improved Task Controls",
        description:
          "Task priority, two-stage approval, rejection notes, task ratings, approved task ordering, and attachment preview slider have been improved.",
        icon: "ph-duotone ph-kanban",
      },
      {
        title: "Finance Center Improvements",
        description:
          "Amount display, search behavior, pending calculations, menu access, and company balance color behavior are now clearer and more accurate.",
        icon: "ph-duotone ph-currency-circle-dollar",
      },
    ],
    bugFixes: [
      "Fixed missing pending leave requests for regular users.",
      "Fixed active trackers staying open after final task approval.",
      "Fixed Home trackers showing previous company data after switching companies.",
      "Fixed project members refreshing when opening Excluded Users in the task modal.",
      "Fixed tracked time calculations in performance analysis using real tracking sessions.",
      "Fixed file downloads so uploaded files use their original names.",
    ],
    improvements: [
      "Leave request tabs, summaries, durations, and date display are clearer.",
      "Approved tasks now move to the bottom of the column with clearer review states.",
      "Task and checklist attachments are easier to preview and manage.",
      "Finance Center amounts now show the Toman label and search waits until typing pauses.",
      "Sensitive menus and actions, such as project delete and Finance Center, better match real access permissions.",
      "Main UI, dark mode, main menu, Project Members, and My File Management responsive behavior were improved.",
    ],
    active: true,
  },
];

export const getLatestActiveAppUpdate = () =>
  APP_UPDATES.find((item) => item?.active) ?? null;
