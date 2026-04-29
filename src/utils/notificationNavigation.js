const pickId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;

    const id = String(value).trim();
    if (id) return id;
  }

  return "";
};

const encodePathId = (value) => encodeURIComponent(String(value));

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
      path: `/projects/${encodePathId(projectId)}/task/${encodePathId(taskId)}`,
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
