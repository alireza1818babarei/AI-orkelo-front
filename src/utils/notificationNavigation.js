const pickId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;

    const id = String(value).trim();
    if (id) return id;
  }

  return "";
};

const encodePathId = (value) => encodeURIComponent(String(value));
const TODO_BOARD_TYPE = "todo_list";

const normalizeBoardType = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const pickBoardType = (...values) => {
  for (const value of values) {
    const normalized = normalizeBoardType(value);
    if (normalized) return normalized;
  }

  return "";
};

const appendTodoListView = (path, boardType) => {
  if (normalizeBoardType(boardType) !== TODO_BOARD_TYPE) return path;

  const [pathWithSearch, hash = ""] = String(path).split("#");
  const [pathname, search = ""] = pathWithSearch.split("?");
  const params = new URLSearchParams(search);
  params.set("view", "todo-list");

  return `${pathname}?${params.toString()}${hash ? `#${hash}` : ""}`;
};

export const resolveNotificationTarget = (notification) => {
  const properties =
    notification?.properties &&
    typeof notification.properties === "object" &&
    !Array.isArray(notification.properties)
      ? notification.properties
      : {};
  const activityProperties =
    properties?.activity_properties &&
    typeof properties.activity_properties === "object" &&
    !Array.isArray(properties.activity_properties)
      ? properties.activity_properties
      : {};
  const boardType = pickBoardType(
    notification?.task?.column?.board_type,
    notification?.task_board_type,
    notification?.board_type,
    properties?.task_board_type,
    properties?.board_type,
    properties?.column_board_type,
    activityProperties?.task_board_type,
    activityProperties?.board_type,
    activityProperties?.column_board_type,
  );

  if (typeof properties?.path === "string" && properties.path.trim()) {
    return {
      path: appendTodoListView(properties.path, boardType),
      label: "Open",
    };
  }

  // Prefer resource relations from the backend response, then fall back to persisted properties.
  const projectId = pickId(
    notification?.project?.id,
    notification?.project_id,
    properties?.project_id,
    activityProperties?.project_id,
  );
  const taskId = pickId(
    notification?.task?.id,
    notification?.task_id,
    properties?.task_id,
    activityProperties?.task_id,
  );

  if (projectId && taskId) {
    return {
      path: appendTodoListView(
        `/projects/${encodePathId(projectId)}/task/${encodePathId(taskId)}`,
        boardType,
      ),
      label: "Open task",
    };
  }

  if (projectId) {
    return {
      path: `/projects/${encodePathId(projectId)}`,
      label: "Open project",
    };
  }

  return null;
};
