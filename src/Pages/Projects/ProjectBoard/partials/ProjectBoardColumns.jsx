import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  TouchSensor,
  DragOverlay,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
  MeasuringStrategy,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import BoardColumn from "./BoardColumn";
import BoardItem from "../../../../Components/BoardItem";
import { formatMonthDay } from "../../../../utils/date";

const arrayMove = (arr, from, to) => {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const getTaskAttachmentCount = (task) => {
  const raw =
    task?.files_count ??
    task?.filesCount ??
    task?.attachments_count ??
    task?.attachmentsCount ??
    task?.files ??
    task?.attachments ??
    null;

  if (Array.isArray(raw)) return raw.length;
  if (raw && typeof raw === "object") {
    const maybeCount = raw.count ?? raw.total ?? raw.length ?? null;
    if (typeof maybeCount === "number") return maybeCount;
    if (typeof maybeCount === "string" && maybeCount.trim()) {
      const n = Number(maybeCount);
      if (Number.isFinite(n)) return n;
    }
  }
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return 0;
};

const parseId = (rawId) => {
  const id = String(rawId || "");
  if (id.startsWith("col-drop-")) return { type: "column-drop", id: id.slice(9) };
  if (id.startsWith("col-")) return { type: "column", id: id.slice(4) };
  if (id.startsWith("task-")) return { type: "task", id: id.slice(5) };
  return { type: null, id };
};

const cloneColumns = (columns) =>
  (columns || []).map((c) => ({
    ...c,
    taskIds: [...(c.taskIds || [])],
  }));

const normalizeBoard = (columns = []) => {
  const tasksById = {};
  const nextColumns = (columns || []).map((col) => {
    const rawTasks = col.tasks ?? col.items ?? col.cards ?? col.task_list;
    const tasksUndefined = rawTasks == null;
    const taskIds = (rawTasks || []).map((t, index) => {
      const id = String(t.id ?? t.task_id ?? t.uuid ?? `${col.id || "col"}-${index}`);
      tasksById[id] = { ...t, id };
      return id;
    });
    return {
      ...col,
      id: String(col.id),
      taskIds,
      tasksUndefined,
    };
  });
  return { columns: nextColumns, tasksById };
};

const findContainer = (taskId, columns) =>
  (columns || []).find((c) => (c.taskIds || []).includes(taskId))?.id ?? null;

const getProjectedIndex = ({
  overType,
  overId,
  destColumn,
  activeRect,
  overRect,
}) => {
  if (!destColumn) return 0;
  if (overType === "column") return destColumn.taskIds.length;
  if (!overId) return destColumn.taskIds.length;
  const overIndex = destColumn.taskIds.indexOf(overId);
  if (overIndex < 0) return destColumn.taskIds.length;
  const isBelow =
    activeRect && overRect
      ? activeRect.top > overRect.top + overRect.height / 2
      : false;
  return overIndex + (isBelow ? 1 : 0);
};

const animateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const dropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.6" } },
  }),
};

const isTaskCompleted = (task) =>
  !!task?.is_completed ||
  String(task?.status || "").toLowerCase() === "done" ||
  String(task?.status || "").toLowerCase() === "completed";

const getTaskDueValue = (task) =>
  task?.due_at ?? task?.dueAt ?? task?.due_date ?? task?.dueDate ?? task?.date ?? null;

const formatTaskDate = (task) => {
  const raw = getTaskDueValue(task);
  if (!raw) return formatMonthDay(task?.created_at) || "";
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return formatMonthDay(raw) || "";
  return String(raw);
};

const TaskCard = memo(function TaskCard({
  task,
  columnId,
  onTaskClick,
  flashCompleted,
  enter,
  enterIndex = 0,
}) {
  if (!task) return null;
  const completed = isTaskCompleted(task);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task-${task.id}`,
    data: { type: "task", taskId: task.id, columnId },
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition || "transform 200ms ease",
    zIndex: isDragging ? 6 : 1,
    ...(enter ? { "--enter-delay": `${Math.min(Number(enterIndex) || 0, 20) * 55}ms` } : null),
  };

  return (
      <BoardItem
        innerRef={setNodeRef}
        style={style}
        className={`${isDragging ? "is-dragging" : ""} ${flashCompleted ? "task-completed-flash" : ""} ${
          completed ? "task-completed" : ""
        } ${enter ? "task-enter" : ""}`}
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        onClick={() => onTaskClick?.(task)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTaskClick?.(task);
          }
        }}
        taskTitle={task.title || task.name || task.text || "Task"}
        taskBody={task.body || task.description || "-"}
        taskDate={formatTaskDate(task)}
        taskFileAttachCount={getTaskAttachmentCount(task) || "0"}
        taskTags={task.tags ?? task.tag_list ?? task.task_tags ?? task.labels ?? []}
        taskIcon={task.icon || "ti-device-desktop-analytics"}
        taskUserImg={task.user_image || task.avatar || ""}
        isCompleted={completed}
      />
  );
});

const PlaceholderItem = memo(function PlaceholderItem({ id, height }) {
  const { setNodeRef, transform, transition } = useSortable({
    id,
    disabled: true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    height: height || 64,
  };

  return (
    <div
      ref={setNodeRef}
      className="board-item board-item-placeholder"
      style={style}
    />
  );
});

const Column = memo(function Column({
  column,
  tasksById,
  status,
  tasksLoading,
  onAddTask,
  onTaskClick,
  addTaskColumnId,
  addTaskText,
  setAddTaskText,
  onStartAddTask,
  onCancelAddTask,
  onSubmitAddTask,
  activeTaskId,
  activeTaskHeight,
  flashCompletedTaskIds,
  enterTaskIds,
  onColumnNodeRef,
  activeColumnId,
  activeColumnSize,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `col-${column.id}`,
    data: { type: "column", columnId: column.id },
    animateLayoutChanges,
  });

  const { setNodeRef: setDropRef, isOver: isOverTasks } = useDroppable({
    id: `col-drop-${column.id}`,
    data: { type: "column-drop", columnId: column.id },
  });

  const setColumnRef = useCallback(
    (node) => {
      setNodeRef(node);
      if (onColumnNodeRef) {
        onColumnNodeRef(column.id, node);
      }
    },
    [setNodeRef, onColumnNodeRef, column.id],
  );

  const isActiveColumn =
    activeColumnId != null &&
    String(activeColumnId) === String(column.id);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition || "transform 220ms ease",
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.95 : undefined,
    boxShadow: isDragging ? "0 16px 32px rgba(0, 0, 0, 0.18)" : undefined,
    width:
      isActiveColumn && activeColumnSize?.width
        ? `${activeColumnSize.width}px`
        : undefined,
    height:
      isActiveColumn && activeColumnSize?.height
        ? `${activeColumnSize.height}px`
        : undefined,
  };

  const taskIds = column.taskIds || [];
  const placeholderId = `placeholder-${column.id}`;
  const hasActive = activeTaskId && taskIds.includes(activeTaskId);
  const displayIds = useMemo(() => {
    if (!hasActive) return taskIds;
    return taskIds.map((id) => (id === activeTaskId ? placeholderId : id));
  }, [taskIds, activeTaskId, hasActive]);
  const sortableIds = useMemo(
    () =>
      displayIds.map((id) =>
        id === placeholderId ? placeholderId : `task-${id}`,
      ),
    [displayIds, placeholderId],
  );

  return (
    <BoardColumn
      color={column.color}
      innerRef={setColumnRef}
      headerRef={setActivatorNodeRef}
      headerProps={{ ...attributes, ...listeners }}
      style={style}
      className={isDragging ? "is-dragging" : ""}
      columnTitle={column.title || column.name || "Column"}
      actions={column.actions}
      contentRef={setDropRef}
      contentClassName={isOverTasks ? "is-over" : ""}
    >
      {column.tasksUndefined ? (
        tasksLoading || status === "loading" ? (
          <div className="d-flex align-items-center justify-content-center py-3">
            <iconify-icon icon="line-md:loading-loop" />
          </div>
        ) : null
      ) : taskIds.length === 0 ? (
        <div className="d-flex align-items-center justify-content-center py-3 text-muted">
          No tasks yet
        </div>
      ) : (
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
          {(displayIds || []).map((id, index) =>
            id === placeholderId ? (
              <PlaceholderItem
                key={placeholderId}
                id={placeholderId}
                height={activeTaskHeight}
              />
            ) : (
              <TaskCard
                key={id}
                task={tasksById[id]}
                columnId={column.id}
                onTaskClick={onTaskClick}
                flashCompleted={flashCompletedTaskIds?.has?.(String(id))}
                enter={enterTaskIds?.has?.(String(id))}
                enterIndex={index}
              />
            ),
          )}
        </SortableContext>
      )}

      {addTaskColumnId === String(column.id) ? (
        <div className="py-3 px-2">
          <input
            type="text"
            className="form-control"
            placeholder="Task title"
            value={addTaskText}
            onChange={(e) => setAddTaskText(e.target.value)}
            onBlur={() => onSubmitAddTask?.(column)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmitAddTask?.(column);
              } else if (e.key === "Escape") {
                e.preventDefault();
                onCancelAddTask?.();
              }
            }}
            autoFocus
            disabled={tasksLoading || status === "loading"}
          />
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-center py-3">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => onStartAddTask?.(column)}
            disabled={tasksLoading || status === "loading"}
          >
            Add Task
          </button>
        </div>
      )}
    </BoardColumn>
  );
});

const ProjectBoardColumns = ({
  columns: columnsProp,
  status,
  tasksLoading = false,
  onEditColumn,
  onDeleteColumn,
  onAddTask,
  onTaskClick,
}) => {
  const [board, setBoard] = useState(() => normalizeBoard(columnsProp));
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeTaskSize, setActiveTaskSize] = useState({ width: 0, height: 0 });
  const [addTaskColumnId, setAddTaskColumnId] = useState(null);
  const [addTaskText, setAddTaskText] = useState("");
  const [flashCompletedTaskIds, setFlashCompletedTaskIds] = useState(() => new Set());
  const snapshotRef = useRef(null);
  const isDraggingRef = useRef(false);
  const columnNodeRefs = useRef({});
  const completedByIdRef = useRef({});
  const completeFlashTimeoutsRef = useRef({});
  const [enterTaskIds, setEnterTaskIds] = useState(() => new Set());
  const seenTaskIdsRef = useRef(new Set());
  const enterTimeoutsRef = useRef({});

  useEffect(() => {
    if (isDraggingRef.current) return;
    const nextBoard = normalizeBoard(columnsProp);

    const prevCompletedById = completedByIdRef.current || {};
    const nextCompletedById = {};
    const toFlash = [];

    Object.keys(nextBoard.tasksById || {}).forEach((id) => {
      const nextCompleted = isTaskCompleted(nextBoard.tasksById[id]);
      nextCompletedById[id] = nextCompleted;
      if (!prevCompletedById[id] && nextCompleted) {
        toFlash.push(id);
      }
    });

    if (toFlash.length) {
      setFlashCompletedTaskIds((prev) => {
        const next = new Set(prev);
        toFlash.forEach((id) => next.add(id));
        return next;
      });

      toFlash.forEach((id) => {
        if (completeFlashTimeoutsRef.current[id]) {
          clearTimeout(completeFlashTimeoutsRef.current[id]);
        }
        completeFlashTimeoutsRef.current[id] = setTimeout(() => {
          setFlashCompletedTaskIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          delete completeFlashTimeoutsRef.current[id];
        }, 1100);
      });
    }

    completedByIdRef.current = nextCompletedById;
    setBoard(nextBoard);

    const newIds = [];
    Object.keys(nextBoard.tasksById || {}).forEach((id) => {
      if (seenTaskIdsRef.current.has(id)) return;
      seenTaskIdsRef.current.add(id);
      newIds.push(id);
    });

    if (newIds.length) {
      setEnterTaskIds((prev) => {
        const next = new Set(prev);
        newIds.forEach((id) => next.add(id));
        return next;
      });

      newIds.forEach((id) => {
        if (enterTimeoutsRef.current[id]) clearTimeout(enterTimeoutsRef.current[id]);
        enterTimeoutsRef.current[id] = setTimeout(() => {
          setEnterTaskIds((prev) => {
            if (!prev.has(id)) return prev;
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          delete enterTimeoutsRef.current[id];
        }, 650);
      });
    }
  }, [columnsProp]);

  useEffect(() => {
    return () => {
      Object.values(completeFlashTimeoutsRef.current || {}).forEach((t) => clearTimeout(t));
      completeFlashTimeoutsRef.current = {};
      Object.values(enterTimeoutsRef.current || {}).forEach((t) => clearTimeout(t));
      enterTimeoutsRef.current = {};
    };
  }, []);

  const columnIds = useMemo(
    () => board.columns.map((c) => `col-${c.id}`),
    [board.columns],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
  );
  const collisionDetection = useCallback(
    (args) => {
      const activeType = parseId(args?.active?.id).type;
      return activeType === "column" ? closestCenter(args) : closestCorners(args);
    },
    [],
  );

  const handleDragStart = useCallback(({ active }) => {
    const parsed = parseId(active.id);
    setActiveId(active.id);
    setActiveType(parsed.type);
    setActiveTaskId(parsed.type === "task" ? parsed.id : null);
    snapshotRef.current = cloneColumns(board.columns);
    isDraggingRef.current = true;
    const columnNode =
      parsed.type === "column"
        ? columnNodeRefs.current?.[String(parsed.id)]
        : null;
    if (columnNode && active?.data?.current) {
      if (active.data.current.sortable) {
        active.data.current.sortable.node = columnNode;
      } else {
        active.data.current.sortable = { node: columnNode };
      }
    }
    const rect =
      parsed.type === "column"
        ? active.data.current?.sortable?.node?.getBoundingClientRect?.() ||
          active.rect.current?.initial ||
          active.rect.current?.translated
        : active.rect.current?.initial || active.rect.current?.translated;
    setActiveTaskSize({
      width: rect?.width || 0,
      height: rect?.height || 0,
    });
  }, [board.columns]);

  const handleDragOver = useCallback(({ active, over }) => {
    if (!over) return;
    const activeInfo = parseId(active.id);
    if (activeInfo.type === "column") {
      const overInfo = parseId(over.id);
      if (overInfo.type !== "column") return;
      setBoard((prev) => {
        const oldIndex = prev.columns.findIndex(
          (c) => String(c.id) === String(activeInfo.id),
        );
        const newIndex = prev.columns.findIndex(
          (c) => String(c.id) === String(overInfo.id),
        );
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          return prev;
        }
        return {
          ...prev,
          columns: arrayMove(prev.columns, oldIndex, newIndex),
        };
      });
      return;
    }
    if (activeInfo.type !== "task") return;

    setBoard((prev) => {
      const { columns, tasksById } = prev;
      const activeTask = activeInfo.id;
      const overInfo = parseId(over.id);

      const sourceColumnId = findContainer(activeTask, columns);
      const overColumnId =
        overInfo.type === "column-drop"
          ? overInfo.id
          : overInfo.type === "column"
            ? overInfo.id
            : overInfo.type === "task"
              ? findContainer(overInfo.id, columns)
              : null;

      if (!sourceColumnId || !overColumnId) return prev;

      const sourceIndex = columns.findIndex((c) => c.id === sourceColumnId);
      const destIndex = columns.findIndex((c) => c.id === overColumnId);
      if (sourceIndex === -1 || destIndex === -1) return prev;

      const sourceColumn = columns[sourceIndex];
      const destColumn = columns[destIndex];

      const activeRect = active.rect.current?.translated || active.rect.current?.initial;
      const overRect = over.rect;

      if (sourceColumnId === overColumnId) {
        const oldIndex = sourceColumn.taskIds.indexOf(activeTask);
        const projectedIndex = getProjectedIndex({
          overType: overInfo.type === "column-drop" ? "column" : overInfo.type,
          overId: overInfo.type === "task" ? overInfo.id : null,
          destColumn: sourceColumn,
          activeRect,
          overRect,
        });

        if (oldIndex === projectedIndex || oldIndex < 0 || projectedIndex < 0) {
          return prev;
        }

        const nextTaskIds = arrayMove(
          sourceColumn.taskIds,
          oldIndex,
          projectedIndex,
        );

        const nextColumns = columns.map((c) =>
          c.id === sourceColumnId ? { ...c, taskIds: nextTaskIds } : c,
        );

        return { columns: nextColumns, tasksById };
      }

      const nextSourceTaskIds = sourceColumn.taskIds.filter(
        (id) => id !== activeTask,
      );
      const nextDestTaskIds = destColumn.taskIds.filter(
        (id) => id !== activeTask,
      );

      const destColumnForIndex = {
        ...destColumn,
        taskIds: nextDestTaskIds,
      };
      let insertIndex = getProjectedIndex({
        overType: overInfo.type === "column-drop" ? "column" : overInfo.type,
        overId: overInfo.type === "task" ? overInfo.id : null,
        destColumn: destColumnForIndex,
        activeRect,
        overRect,
      });

      insertIndex = Math.max(0, Math.min(insertIndex, nextDestTaskIds.length));
      nextDestTaskIds.splice(insertIndex, 0, activeTask);

      const nextColumns = columns.map((c) => {
        if (c.id === sourceColumnId) return { ...c, taskIds: nextSourceTaskIds };
        if (c.id === overColumnId) return { ...c, taskIds: nextDestTaskIds };
        return c;
      });

      return { columns: nextColumns, tasksById };
    });
  }, []);

  const handleDragEnd = useCallback(({ active, over }) => {
    const activeInfo = parseId(active.id);
    const overInfo = over ? parseId(over.id) : { type: null, id: null };

    if (!over && snapshotRef.current) {
      setBoard((prev) => ({
        ...prev,
        columns: snapshotRef.current,
      }));
    }

    if (activeInfo.type === "column" && overInfo.type === "column") {
      setBoard((prev) => {
        const oldIndex = prev.columns.findIndex(
          (c) => String(c.id) === String(activeInfo.id),
        );
        const newIndex = prev.columns.findIndex(
          (c) => String(c.id) === String(overInfo.id),
        );
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          return prev;
        }
        return {
          ...prev,
          columns: arrayMove(prev.columns, oldIndex, newIndex),
        };
      });
    }

    setActiveId(null);
    setActiveType(null);
    setActiveTaskId(null);
    snapshotRef.current = null;
    isDraggingRef.current = false;
  }, []);

  const handleDragCancel = useCallback(() => {
    if (snapshotRef.current) {
      setBoard((prev) => ({
        ...prev,
        columns: snapshotRef.current,
      }));
    }
    setActiveId(null);
    setActiveType(null);
    setActiveTaskId(null);
    snapshotRef.current = null;
    isDraggingRef.current = false;
  }, []);

  const startAddTask = (column) => {
    if (!column?.id) return;
    setAddTaskColumnId(String(column.id));
    setAddTaskText("");
  };

  const cancelAddTask = () => {
    setAddTaskColumnId(null);
    setAddTaskText("");
  };

  const submitAddTask = (column) => {
    const text = addTaskText.trim();
    if (!text) {
      cancelAddTask();
      return;
    }
    onAddTask?.(column, text);
    cancelAddTask();
  };

  const handleColumnNodeRef = useCallback((id, node) => {
    const key = String(id);
    if (node) {
      columnNodeRefs.current[key] = node;
    } else {
      delete columnNodeRefs.current[key];
    }
  }, []);

  if (!board.columns.length) {
    if (status === "loading") {
      return (
        <div className="d-flex align-items-center justify-content-center py-5">
          <iconify-icon icon="line-md:loading-loop" />
        </div>
      );
    }
    return (
      <div className="d-flex align-items-center justify-content-center text-muted py-5">
        Start adding columns
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div className="board">
          {board.columns.map((col) => (
            <Column
              key={col.id}
              column={{
                ...col,
                actions: [
                  {
                    key: "edit",
                    label: "Edit",
                    icon: "ti-pencil",
                    onClick: () => onEditColumn?.(col),
                  },
                  { type: "divider" },
                  {
                    key: "delete",
                    label: "Delete",
                    icon: "ti-trash",
                    destructive: true,
                    onClick: () => onDeleteColumn?.(col),
                  },
                ],
              }}
              tasksById={board.tasksById}
              status={status}
              tasksLoading={tasksLoading}
              onAddTask={onAddTask}
              onTaskClick={onTaskClick}
              addTaskColumnId={addTaskColumnId}
              addTaskText={addTaskText}
              setAddTaskText={setAddTaskText}
              onStartAddTask={startAddTask}
              onCancelAddTask={cancelAddTask}
              onSubmitAddTask={submitAddTask}
              activeTaskId={activeType === "task" ? activeTaskId : null}
              activeTaskHeight={activeTaskSize.height}
              flashCompletedTaskIds={flashCompletedTaskIds}
              enterTaskIds={enterTaskIds}
              onColumnNodeRef={handleColumnNodeRef}
              activeColumnId={activeType === "column" ? parseId(activeId).id : null}
              activeColumnSize={activeTaskSize}
            />
          ))}
        </div>
      </SortableContext>

      {createPortal(
        <DragOverlay dropAnimation={dropAnimation} className="dnd-overlay">
          {activeType === "task" && activeTaskId ? (
            <div style={{ width: activeTaskSize.width || undefined }}>
              <BoardItem
                className="is-drag-overlay"
                taskTitle={
                  board.tasksById[activeTaskId]?.title ||
                  board.tasksById[activeTaskId]?.name ||
                  board.tasksById[activeTaskId]?.text ||
                  "Task"
                }
                taskBody={
                  board.tasksById[activeTaskId]?.body ||
                  board.tasksById[activeTaskId]?.description ||
                  "-"
                }
                taskDate={
                  board.tasksById[activeTaskId]?.date ||
                  formatMonthDay(board.tasksById[activeTaskId]?.created_at) ||
                  ""
                }
                taskFileAttachCount={
                  getTaskAttachmentCount(board.tasksById[activeTaskId]) || "0"
                }
                taskTags={
                  board.tasksById[activeTaskId]?.tags ??
                  board.tasksById[activeTaskId]?.tag_list ??
                  board.tasksById[activeTaskId]?.task_tags ??
                  board.tasksById[activeTaskId]?.labels ??
                  []
                }
                taskIcon={
                  board.tasksById[activeTaskId]?.icon || "ti-device-desktop-analytics"
                }
                taskUserImg={
                  board.tasksById[activeTaskId]?.user_image ||
                  board.tasksById[activeTaskId]?.avatar ||
                  ""
                }
              />
            </div>
          ) : null}
          {activeType === "column" && activeId ? (() => {
            const columnId = parseId(activeId).id;
            const column = board.columns.find(
              (c) => String(c.id) === String(columnId),
            );
            if (!column) return null;
            const taskIds = column.taskIds || [];
            return (
              <div
                style={{
                  width: activeTaskSize.width || 300,
                  height: activeTaskSize.height || undefined,
                }}
              >
                <BoardColumn
                  className="is-drag-overlay"
                  columnTitle={column.title || column.name || "Column"}
                  color={column.color}
                >
                  {taskIds.length ? (
                    taskIds.map((id) => {
                      const task = board.tasksById[id];
                      if (!task) return null;
                      return (
                        <BoardItem
                          key={id}
                          taskTitle={task.title || task.name || task.text || "Task"}
                          taskBody={task.body || task.description || "-"}
                          taskDate={task.date || formatMonthDay(task.created_at) || ""}
                          taskFileAttachCount={getTaskAttachmentCount(task) || "0"}
                          taskTags={task.tags ?? task.tag_list ?? task.task_tags ?? task.labels ?? []}
                          taskIcon={task.icon || "ti-device-desktop-analytics"}
                          taskUserImg={task.user_image || task.avatar || ""}
                        />
                      );
                    })
                  ) : (
                    <div className="d-flex align-items-center justify-content-center py-3 text-muted">
                      No tasks yet
                    </div>
                  )}
                </BoardColumn>
              </div>
            );
          })() : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};

export default ProjectBoardColumns;
