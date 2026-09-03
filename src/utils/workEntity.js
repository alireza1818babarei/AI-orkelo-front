const TODO_BOARD_TYPE = "todo_list";

export const WORK_ENTITY_TYPE = Object.freeze({
  TASK: "task",
  WORK_ITEM: "work_item",
});

const pickId = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;

    const id = String(value).trim();
    if (id) return id;
  }

  return "";
};

const normalizeEntityType = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const encodePathId = (value) => encodeURIComponent(String(value));

const withBaseUrl = (path, baseUrl) => {
  const base = String(baseUrl ?? "").trim();
  if (!base) return path;

  return `${base.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
};

export const isWorkItemEntity = (entity) => {
  const explicitType = normalizeEntityType(entity?.entity_type);

  if (explicitType) return explicitType === WORK_ENTITY_TYPE.WORK_ITEM;

  return Boolean(pickId(entity?.work_item_id, entity?.super_task_item_id));
};

export const buildWorkEntityPath = (entity, { baseUrl = "" } = {}) => {
  if (!entity || typeof entity !== "object") return null;

  if (isWorkItemEntity(entity)) {
    const projectId = pickId(entity.project_id, entity.project?.id);
    const superTaskId = pickId(entity.super_task_id, entity.super_task?.id);
    const subTaskId = pickId(entity.sub_task_id, entity.sub_task?.id);
    const workItemId = pickId(
      entity.work_item_id,
      entity.super_task_item_id,
      entity.work_item?.id,
    );

    if (!projectId || !superTaskId || !subTaskId || !workItemId) return null;

    const params = new URLSearchParams({
      subTask: subTaskId,
      workItem: workItemId,
    });
    const path = `/projects/${encodePathId(projectId)}/tasks/${encodePathId(superTaskId)}?${params.toString()}`;

    return withBaseUrl(path, baseUrl);
  }

  const projectId = pickId(entity.project_id, entity.project?.id);
  const taskId = pickId(entity.task_id, entity.task?.id, entity.id);

  if (!projectId || !taskId) return null;

  const boardType = String(
    entity.task_board_type ?? entity.board_type ?? entity.task?.column?.board_type ?? "",
  )
    .trim()
    .toLowerCase();
  const suffix = boardType === TODO_BOARD_TYPE ? "?view=todo-list" : "";

  return withBaseUrl(
    `/projects/${encodePathId(projectId)}/task/${encodePathId(taskId)}${suffix}`,
    baseUrl,
  );
};

export const getWorkEntityPresentation = (entity) => {
  const workItem = isWorkItemEntity(entity);
  const title = String(
    workItem
      ? entity?.work_item_title ?? entity?.task_name ?? entity?.title ?? ""
      : entity?.task_name ?? entity?.text ?? entity?.title ?? "",
  ).trim();
  const contextParts = workItem
    ? [entity?.super_task_title, entity?.sub_task_title]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
    : [];
  const assignedUser = entity?.assigned_user ?? entity?.assignee ?? null;

  return {
    entityType: workItem ? WORK_ENTITY_TYPE.WORK_ITEM : WORK_ENTITY_TYPE.TASK,
    isWorkItem: workItem,
    label: workItem ? "Work Item" : "Task",
    title: title || (workItem ? "Untitled Work Item" : "Untitled task"),
    context: contextParts.join(" / "),
    assignedUser,
    workRole: assignedUser?.work_role ?? null,
  };
};

export const getWorkEntityKey = (entity) => {
  const presentation = getWorkEntityPresentation(entity);
  const id = presentation.isWorkItem
    ? pickId(entity?.work_item_id, entity?.super_task_item_id, entity?.id)
    : pickId(entity?.task_id, entity?.id);

  return `${presentation.entityType}:${id || "unknown"}`;
};
