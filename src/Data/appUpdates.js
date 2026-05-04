export const APP_UPDATES = [
  {
    id: "2026-05-04-finance-dashboard-board-notifications-and-tracker-updates",
    version: "v1.1.1",
    releasedAt: "2026-05-04",
    title: "Latest Update",
    summary:
      "This release brings new Finance Center tools, better daily reports, dynamic dashboard navigation, stronger project controls, improved checklist behavior, cleaner notifications, and time tracker updates.",
    newFeatures: [
      {
        title: "Expanded Finance Center",
        description:
          "Finance Center now supports financial operations, operation files, status review, selected-user access, counterparties, and a financial overview with 6-month and 12-month chart filters.",
        icon: "ph-duotone ph-wallet",
      },
      {
        title: "Operations Date Filter",
        description:
          "Operations & Files can now be filtered by title and date range, with the selected dates kept during refresh, edit, delete, and pagination.",
        icon: "ph-duotone ph-calendar-dots",
      },
      {
        title: "Deposit And Withdrawal Counterparties",
        description:
          "Counterparties can now be used for both deposit and withdrawal operations, while deposit source remains available only for deposit records.",
        icon: "ph-duotone ph-handshake",
      },
      {
        title: "Daily Report Descriptions",
        description:
          "Daily report uploads now include a description field, and long descriptions are shown with a clean preview and full-text modal.",
        icon: "ph-duotone ph-file-text",
      },
      {
        title: "Dynamic Home Dashboard",
        description:
          "Home dashboard sections now load real task, notification, and project data with direct navigation to the related destination.",
        icon: "ph-duotone ph-house-line",
      },
      {
        title: "Clickable Notifications",
        description:
          "Task, mention, and project notifications now open their related target directly and can be marked as seen during navigation.",
        icon: "ph-duotone ph-bell-ringing",
      },
      {
        title: "Checklist Progress on Task Cards",
        description:
          "Task cards now show checklist progress such as 2/8, and the value updates after checklist changes without requiring a full board reload.",
        icon: "ph-duotone ph-check-square",
      },
      {
        title: "Automatic Checklist Completion",
        description:
          "Checklist state now stays aligned with task completion so completed tasks do not keep inconsistent checklist states.",
        icon: "ph-duotone ph-list-checks",
      },
      {
        title: "Column Completed Task Archive",
        description:
          "Completed tasks can now be archived from a column settings menu, keeping the active board cleaner while preserving archived task history.",
        icon: "ph-duotone ph-archive-box",
      },
      {
        title: "Compact Tracking Task Cards",
        description:
          "Home tracking task cards now use a compact responsive grid with Show more and Show less behavior for cleaner scanning.",
        icon: "ph-duotone ph-timer",
      },
      {
        title: "Manager Active Trackers",
        description:
          "Authorized managers can now review active trackers with role-based visibility, search, pagination, and live running time display.",
        icon: "ph-duotone ph-gauge",
      },
    ],
    bugFixes: [
      "Fixed project member report filtering so member reports stay scoped to the selected project.",
      "Fixed task creator visibility so the creator keeps access when task visibility is restricted.",
      "Fixed unauthorized project deletion responses so denied requests return 403 instead of a server error.",
      "Fixed project member removal menus so users only see actions they are allowed to perform.",
      "Fixed project member role badges so Owner and Supervisor labels stay readable without overflow.",
      "Fixed checklist drag behavior so completed items stay below active checklist items.",
      "Fixed Home tracking task time display and removed the empty time placeholder.",
      "Fixed timer expiration notifications so the timer owner is notified even when they are not watching the task.",
      "Fixed duplicate notifications that could be sent to other users when a task timer expired.",
      "Fixed time tracker notification noise so pause, stop, and resume actions remain in the activity log without creating unnecessary notifications.",
    ],
    improvements: [
      "Added skeleton loading states for Manage Projects and Finance Center to make loading screens clearer.",
      "Improved Financial Overview with total income, total outcome, net balance, pending review, and monthly chart filters.",
      "Improved operation list pagination with a compact 5-item page layout in Finance Center.",
      "Improved Operations & Files search with a responsive date range picker using YYYY-MM-DD dates.",
      "Improved project member role visibility and removal rules across owner, supervisor, project manager, and member roles.",
      "Improved checklist behavior so active items stay first and checklist state stays aligned after task completion.",
      "Improved board column behavior so project columns stay scrolled to the bottom after load and board updates.",
      "Improved dashboard navigation so project, task, and notification items open their related destination directly.",
      "Improved timer expiration messaging with a dedicated your timer message for the timer owner and separate wording for other related users.",
      "Reviewed project list ordering and prepared the project list flow for A-Z sorting.",
      "Verified related frontend builds and backend time tracker tests after the update.",
    ],
    active: true,
  },
  {
    id: "2026-04-20-manage-projects-reports-roles-and-task-board-updates",
    version: "v1.0.3",
    releasedAt: "2026-04-20",
    title: "Latest Update",
    summary:
      "This release improves project management, daily reports, member roles, task boards, file uploads, and task detail workflows across Orkelo.",
    newFeatures: [
      {
        title: "Manage Projects Workspace",
        description:
          "Company owners and supervisors can now review accessible projects, open project reports, and view each member's daily reports from one place.",
        icon: "ph-duotone ph-kanban",
      },
      {
        title: "Member Daily Reports",
        description:
          "Clicking a member now opens all daily reports uploaded by that user across the active company.",
        icon: "ph-duotone ph-file-text",
      },
      {
        title: "Project Manager Assignment",
        description:
          "Company owners and supervisors can assign project manager access directly from the project board members sidebar.",
        icon: "ph-duotone ph-user-switch",
      },
      {
        title: "Company Role Management",
        description:
          "Company owners can manage member roles from the company members modal in the header.",
        icon: "ph-duotone ph-users-three",
      },
      {
        title: "Drag and Drop Task Uploads",
        description:
          "Task files can now be uploaded by dragging them directly into the task detail modal.",
        icon: "ph-duotone ph-upload-simple",
      },
      {
        title: "Shared Task Time Tracking",
        description:
          "Active task timers now calculate elapsed time from the tracker start time, so other users can see the running timer correctly.",
        icon: "ph-duotone ph-timer",
      },
      {
        title: "Shared Task Time Tracking",
        description:
          "Now removing a project requires to enter the name of the project",
        icon: "ph-duotone ph-file-text",
      },
    ],
    bugFixes: [
      "Fixed company image uploads by aligning the request flow with server-side multipart handling.",
      "Fixed unreadable dark mode text in the task detail modal sidebar.",
      "Fixed task activity labels for assignee assignment, assignee changes, assignee clearing, and task creation events.",
      "Fixed member report navigation from the Manage Projects page.",
      "Fixed loading spinner behavior when members are already visible.",
      "Fixed empty board item metadata by hiding due date and attachment icons when there is no due time and no files.",
    ],
    improvements: [
      "Added a clearer overdue style for tasks that have passed their due time.",
      "Improved Manage Projects loading states with larger, clearer project spinners.",
      "Formatted company member roles into readable labels such as Company Owner, Company Supervisor, and Member.",
      "Added My File Manager access in the user profile area.",
      "Added clearer report upload guidance so users know they can upload their reports.",
      "Improved project board member sidebar role display and dark mode styling.",
      "Improved task activity timeline readability by showing who created the task.",
    ],
    active: false,
  },
];

export const getLatestActiveAppUpdate = () =>
  APP_UPDATES.find((item) => item?.active) ?? null;
