import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  closestCorners,
  pointerWithin,
  DragOverlay,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import BoardColumn from "./BoardColumn";
import BoardItem from "../../../../Components/BoardItem";
import { formatMonthDay } from "../../../../utils/date";

const arrayMove = (arr, from, to) => {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const DraggableTask = ({ task, columnId, onTaskClick }) => {
  const taskId = String(task.__dndId);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `task:${taskId}`,
    data: { type: "task", columnId: String(columnId), taskId, task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
        zIndex: isDragging ? 6 : 1,
      }
    : { transition };

  return (
    <BoardItem
      innerRef={setNodeRef}
      style={style}
      className={`${isDragging ? "is-dragging" : ""} ${isOver ? "is-over" : ""}`}
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
      taskDate={task.date || formatMonthDay(task.created_at) || ""}
      taskFileAttachCount={task.files_count || task.attachments || "0"}
      taskIcon={task.icon || "ti-device-desktop-analytics"}
      taskUserImg={task.user_image || task.avatar || ""}
    />
  );
};

const DraggableColumn = ({
  column,
  actions,
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
}) => {
  const id = String(column.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `column:${id}`,
    data: { type: "column", columnId: id, column },
  });

  const {
    setNodeRef: setTasksDropRef,
    isOver: isOverTasks,
  } = useDroppable({
    id: `column-tasks:${id}`,
    data: { type: "column-tasks", columnId: id },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
        zIndex: isDragging ? 5 : 1,
      }
    : { transition };

  return (
    <BoardColumn
      color={column.color}
      innerRef={setNodeRef}
      headerRef={setActivatorNodeRef}
      headerProps={{ ...attributes, ...listeners }}
      style={style}
      className={`${isOver ? "is-over" : ""} ${
        isDragging ? "is-dragging" : ""
      }`}
      columnTitle={column.title || column.name || "Column"}
      actions={actions}
      contentRef={setTasksDropRef}
      contentClassName={isOverTasks ? "is-over" : ""}
    >
      {column.tasks === undefined ? (
        tasksLoading || status === "loading" ? (
          <div className="d-flex align-items-center justify-content-center py-3">
            <iconify-icon icon="line-md:loading-loop" />
          </div>
        ) : null
      ) : column.tasks.length === 0 ? (
        <div className="d-flex align-items-center justify-content-center py-3 text-muted">
          No tasks yet
        </div>
      ) : (
        <SortableContext
          items={(column.tasks || []).map((t) => `task:${t.__dndId}`)}
          strategy={verticalListSortingStrategy}
        >
          {(column.tasks || []).map((task) => (
            <DraggableTask
              key={task.__dndId}
              task={task}
              columnId={column.id}
              onTaskClick={onTaskClick}
            />
          ))}
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
};

const ProjectBoardColumns = ({
  columns,
  status,
  tasksLoading = false,
  onEditColumn,
  onDeleteColumn,
  onAddTask,
  onTaskClick,
}) => {
  const [orderedColumns, setOrderedColumns] = useState([]);
  const [activeDrag, setActiveDrag] = useState(null);
  const [addTaskColumnId, setAddTaskColumnId] = useState(null);
  const [addTaskText, setAddTaskText] = useState("");

  const normalizedColumns = useMemo(() => {
    return (columns || []).map((col) => {
      const rawTasks =
        col.tasks ?? col.items ?? col.cards ?? col.task_list;
      if (rawTasks == null) {
        return { ...col, tasks: undefined };
      }
      const tasks = (rawTasks || []).map((t, index) => ({
        ...t,
        __dndId: String(
          t.id ?? t.task_id ?? t.uuid ?? `${col.id || "col"}-${index}`,
        ),
      }));
      return { ...col, tasks };
    });
  }, [columns]);

  useEffect(() => {
    setOrderedColumns(normalizedColumns);
  }, [normalizedColumns]);

  const columnIds = useMemo(
    () => orderedColumns.map((c) => `column:${c.id}`),
    [orderedColumns],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const collisionDetection = (args) => {
    const activeType = args?.active?.data?.current?.type;
    if (activeType === "column") {
      const hits = pointerWithin(args);
      return hits.length ? hits : closestCorners(args);
    }
    return closestCenter(args);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeType = active?.data?.current?.type;
    const overType = over?.data?.current?.type;

    if (activeType === "column") {
      const activeId = active.data.current.columnId;
      const overId = over?.data?.current?.columnId;
      if (!overId || activeId === overId) return;

      setOrderedColumns((items) => {
        const oldIndex = items.findIndex(
          (c) => String(c.id) === String(activeId),
        );
        const newIndex = items.findIndex(
          (c) => String(c.id) === String(overId),
        );
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          return items;
        }
        return arrayMove(items, oldIndex, newIndex);
      });
      return;
    }

    if (activeType === "task") {
      const activeTaskId = active.data.current.taskId;
      const sourceColumnId = active.data.current.columnId;
      const destColumnId =
        overType === "task"
          ? over.data.current.columnId
          : overType === "column" || overType === "column-tasks"
            ? over.data.current.columnId
            : null;
      if (!destColumnId) return;

      setOrderedColumns((items) => {
        const sourceIndex = items.findIndex(
          (c) => String(c.id) === String(sourceColumnId),
        );
        const destIndex = items.findIndex(
          (c) => String(c.id) === String(destColumnId),
        );
        if (sourceIndex === -1 || destIndex === -1) return items;

        const sourceTasks = [...(items[sourceIndex].tasks || [])];
        const destTasks =
          sourceIndex === destIndex
            ? sourceTasks
            : [...(items[destIndex].tasks || [])];

        const fromIndex = sourceTasks.findIndex(
          (t) => String(t.__dndId) === String(activeTaskId),
        );
        if (fromIndex === -1) return items;

        const toIndex =
          overType === "task"
            ? destTasks.findIndex(
                (t) =>
                  String(t.__dndId) ===
                  String(over.data.current.taskId),
              )
            : destTasks.length;
        if (toIndex === -1) return items;

        const [moved] = sourceTasks.splice(fromIndex, 1);
        destTasks.splice(toIndex, 0, moved);

        return items.map((c, idx) => {
          if (idx === sourceIndex) return { ...c, tasks: sourceTasks };
          if (idx === destIndex) return { ...c, tasks: destTasks };
          return c;
        });
      });
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const activeType = active?.data?.current?.type;
    const overType = over?.data?.current?.type;

    if (activeType === "column") {
      const activeId = active.data.current.columnId;
      const overId = over?.data?.current?.columnId;
      if (!overId) return;
      if (activeId === overId) return;
      setOrderedColumns((items) => {
        const oldIndex = items.findIndex(
          (c) => String(c.id) === String(activeId),
        );
        const newIndex = items.findIndex(
          (c) => String(c.id) === String(overId),
        );
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
      return;
    }

    if (activeType === "task") {
      const activeTaskId = active.data.current.taskId;
      const sourceColumnId = active.data.current.columnId;
      const destColumnId =
        overType === "task"
          ? over.data.current.columnId
          : overType === "column" || overType === "column-tasks"
            ? over.data.current.columnId
            : null;
      if (!destColumnId) return;

      setOrderedColumns((items) => {
        const sourceIndex = items.findIndex(
          (c) => String(c.id) === String(sourceColumnId),
        );
        const destIndex = items.findIndex(
          (c) => String(c.id) === String(destColumnId),
        );
        if (sourceIndex === -1 || destIndex === -1) return items;

        const sourceTasks = [...(items[sourceIndex].tasks || [])];
        const destTasks =
          sourceIndex === destIndex
            ? sourceTasks
            : [...(items[destIndex].tasks || [])];

        const fromIndex = sourceTasks.findIndex(
          (t) => String(t.__dndId) === String(activeTaskId),
        );
        if (fromIndex === -1) return items;

        const toIndex =
          overType === "task"
            ? destTasks.findIndex(
                (t) =>
                  String(t.__dndId) ===
                  String(over.data.current.taskId),
              )
            : destTasks.length;

        if (toIndex === -1) return items;

        const [moved] = sourceTasks.splice(fromIndex, 1);
        destTasks.splice(toIndex, 0, moved);

        return items.map((c, idx) => {
          if (idx === sourceIndex) return { ...c, tasks: sourceTasks };
          if (idx === destIndex) return { ...c, tasks: destTasks };
          return c;
        });
      });
    }
  };

  const handleDragStart = ({ active }) => {
    setActiveDrag(active?.data?.current || null);
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
  };

  const handleDragEndCleanup = (args) => {
    handleDragEnd(args);
    setActiveDrag(null);
  };

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

  if (!orderedColumns.length) {
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
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEndCleanup}
    >
      <SortableContext items={columnIds} strategy={rectSortingStrategy}>
        <div className="board">
          {orderedColumns.map((c) => (
            <DraggableColumn
              key={c.id}
              column={c}
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
              actions={[
                {
                  key: "edit",
                  label: "Edit",
                  icon: "ti-pencil",
                  onClick: () => onEditColumn?.(c),
                },
                { type: "divider" },
                {
                  key: "delete",
                  label: "Delete",
                  icon: "ti-trash",
                  destructive: true,
                  onClick: () => onDeleteColumn?.(c),
                },
              ]}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeDrag?.type === "task" ? (
          <BoardItem
            className="is-drag-overlay"
            taskTitle={
              activeDrag.task?.title ||
              activeDrag.task?.name ||
              activeDrag.task?.text ||
              "Task"
            }
            taskBody={
              activeDrag.task?.body || activeDrag.task?.description || "-"
            }
            taskDate={activeDrag.task?.date || activeDrag.task?.due_date || ""}
            taskFileAttachCount={
              activeDrag.task?.files_count || activeDrag.task?.attachments || "0"
            }
            taskIcon={activeDrag.task?.icon || "ti-device-desktop-analytics"}
            taskUserImg={activeDrag.task?.user_image || activeDrag.task?.avatar || ""}
          />
        ) : activeDrag?.type === "column" ? (
          <BoardColumn
            className="is-drag-overlay"
            columnTitle={
              activeDrag.column?.title || activeDrag.column?.name || "Column"
            }
            color={activeDrag.column?.color}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProjectBoardColumns;
