import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import ActionDropdown from "../../../../Components/ActionDropdown";
import { getTextDirectionProps } from "../../../../utils/textDirection";

const TODO_COMPLETED_STATUSES = new Set(["done", "completed"]);
const TODO_COLUMN_DND_TYPE = "TODO_COLUMN";

const isTodoTaskCompleted = (task) => {
  const status = String(task?.status ?? "").trim().toLowerCase();
  if (TODO_COMPLETED_STATUSES.has(status)) return true;
  return task?.is_completed === true || task?.is_completed === 1;
};

const isTodoTaskTracking = (task) =>
  String(task?.type ?? "").trim().toLowerCase() === "start";

const getTodoOrder = (task) => {
  const value = Number(task?.position ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const sortTodoTasks = (tasks = []) =>
  [...(Array.isArray(tasks) ? tasks : [])].sort((a, b) => {
    const aCompleted = isTodoTaskCompleted(a) ? 1 : 0;
    const bCompleted = isTodoTaskCompleted(b) ? 1 : 0;
    if (aCompleted !== bCompleted) return aCompleted - bCompleted;

    const positionDiff = getTodoOrder(a) - getTodoOrder(b);
    if (positionDiff !== 0) return positionDiff;
    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });

const normalizeTodoBoard = (columns = []) => ({
  columns: (Array.isArray(columns) ? columns : []).map((column) => ({
    ...column,
    id: String(column?.id ?? ""),
    tasks: sortTodoTasks(column?.tasks || []),
  })),
});

const normalizeIconClass = (raw) => {
  const value = String(raw || "").trim();
  if (!value) return "ph-duotone ph-sparkle";
  if (value.includes("ph-") || value.includes("fa-") || value.includes("ti ")) {
    return value;
  }
  if (value.startsWith("ti-")) return `ti ${value}`;
  return value;
};

const TodoTaskRow = memo(function TodoTaskRow({
  task,
  columnId,
  completing,
  onToggleTask,
  onOpenTask,
}) {
  const completed = isTodoTaskCompleted(task);
  const tracking = isTodoTaskTracking(task);
  const title = String(task?.text ?? "Untitled todo").trim();
  const titleDirectionProps = getTextDirectionProps(title);

  return (
    <div
      data-todo-task-id={String(task?.id ?? "")}
      className={`project-todo-list__task ${
        completed ? "is-completed" : ""
      } ${tracking ? "is-tracking" : ""}`}
    >
      <button
        type="button"
        className="project-todo-list__check"
        onClick={() => onToggleTask?.(task, columnId, !completed)}
        disabled={completing}
        aria-label={completed ? "Mark todo as incomplete" : "Mark todo as complete"}
      >
        <i className={completed ? "ti ti-check" : ""}></i>
      </button>

      <div className="project-todo-list__task-copy" aria-label="Drag todo">
        <div className="project-todo-list__task-title" {...titleDirectionProps}>
          {title}
        </div>
      </div>

      <button
        type="button"
        className="project-todo-list__open"
        onClick={() => onOpenTask?.({ ...task, column_id: columnId, columnId })}
        aria-label="Open todo details"
      >
        <i className="ti ti-external-link"></i>
      </button>
    </div>
  );
});

const areTaskListsEqual = (previousTasks = [], nextTasks = []) => {
  if (previousTasks === nextTasks) return true;
  if (previousTasks.length !== nextTasks.length) return false;

  return previousTasks.every((task, index) => {
    const nextTask = nextTasks[index];
    return (
      task === nextTask ||
      (String(task?.id ?? "") === String(nextTask?.id ?? "") &&
        getTodoOrder(task) === getTodoOrder(nextTask) &&
        isTodoTaskCompleted(task) === isTodoTaskCompleted(nextTask) &&
        String(task?.text ?? "") === String(nextTask?.text ?? "") &&
        String(task?.type ?? "") === String(nextTask?.type ?? ""))
    );
  });
};

const TodoColumn = memo(
  function TodoColumn({
    column,
    tasksLoading,
    completingByTaskId,
    addingColumnId,
    addTaskText,
    setAddTaskText,
    onStartAddTask,
    onCancelAddTask,
    onSubmitAddTask,
    onToggleTask,
    onOpenTask,
    onEditColumn,
    onDeleteColumn,
    columnDragHandleProps,
    isColumnDragging,
  }) {
    const rootRef = useRef(null);
    const [actionsOpen, setActionsOpen] = useState(false);
    const columnId = String(column?.id ?? "");
    const tasks = Array.isArray(column?.tasks) ? column.tasks : [];
    const isAdding = String(addingColumnId ?? "") === columnId;
    const columnColor = column?.color || "#0ea5e9";
    const iconClass = normalizeIconClass(column?.icon);
    const taskCount = tasks.length || Number(column?.tasks_count ?? 0) || 0;

    const actions = useMemo(
      () => [
        {
          key: "edit",
          label: "Edit",
          icon: "ti-pencil",
          onClick: () => onEditColumn?.(column),
        },
        { type: "divider" },
        {
          key: "delete",
          label: "Delete",
          icon: "ti-trash",
          destructive: true,
          onClick: () => onDeleteColumn?.(column),
        },
      ],
      [column, onDeleteColumn, onEditColumn],
    );

    return (
      <section
        data-todo-column-shell-id={columnId}
        className={`project-todo-list__column ${
          actionsOpen ? "is-actions-open" : ""
        } ${isColumnDragging ? "is-column-dragging" : ""}`}
        style={{ "--project-todo-list-column-color": columnColor }}
      >
        <div className="project-todo-list__column-header">
          <div className="project-todo-list__column-title">
            <i className={iconClass} aria-hidden="true"></i>
            <span>{column?.title || "Next"}</span>
          </div>

          <div
            className="project-todo-list__column-drag-space project-todo-list__column-drag-handle"
            {...columnDragHandleProps}
            aria-label="Drag todo column"
          />

          <div className="project-todo-list__column-actions">
            {taskCount > 0 ? (
              <span className="project-todo-list__count">{taskCount}</span>
            ) : null}

            <div ref={rootRef} className="position-relative">
              <button
                type="button"
                className="project-todo-list__header-icon project-todo-list__header-icon--settings"
                onClick={() => setActionsOpen((value) => !value)}
                aria-label="Column actions"
              >
                <i className="ph-light ph-gear"></i>
              </button>
              <ActionDropdown
                open={actionsOpen}
                onToggle={setActionsOpen}
                rootRef={rootRef}
                actions={actions}
              />
            </div>

            <button
              type="button"
              className="project-todo-list__header-icon project-todo-list__header-icon--add"
              onClick={() => onStartAddTask?.(column)}
              aria-label="Add todo"
            >
              <i className="ti ti-plus"></i>
            </button>
          </div>
        </div>

        <div
          data-todo-column-id={columnId}
          className={`project-todo-list__tasks app-scroll ${
            !tasks.length ? "project-todo-list__tasks--drop-target" : ""
          }`}
        >
          {isAdding ? (
            <div className="project-todo-list__add-row">
              <span className="project-todo-list__check is-input"></span>
              <input
                type="text"
                className="project-todo-list__input"
                value={addTaskText}
                placeholder="Write a todo..."
                onChange={(event) => setAddTaskText(event.target.value)}
                onBlur={() => onSubmitAddTask?.(column)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSubmitAddTask?.(column);
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    onCancelAddTask?.();
                  }
                }}
                autoFocus
              />
            </div>
          ) : null}

          {tasksLoading && !tasks.length ? (
            <div className="project-todo-list__state">
              <iconify-icon icon="line-md:loading-loop" />
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={String(task?.id)}
                className="project-todo-list__drag-wrapper"
              >
                <TodoTaskRow
                  task={task}
                  columnId={column?.id}
                  completing={Boolean(
                    completingByTaskId?.[String(task?.id)],
                  )}
                  onToggleTask={onToggleTask}
                  onOpenTask={onOpenTask}
                />
              </div>
            ))
          )}
        </div>
      </section>
    );
  },
  (previous, next) =>
    previous.column?.id === next.column?.id &&
    previous.column?.title === next.column?.title &&
    previous.column?.color === next.column?.color &&
    previous.column?.icon === next.column?.icon &&
    previous.column?.tasks_count === next.column?.tasks_count &&
    areTaskListsEqual(previous.column?.tasks || [], next.column?.tasks || []) &&
    previous.tasksLoading === next.tasksLoading &&
    previous.completingByTaskId === next.completingByTaskId &&
    previous.addingColumnId === next.addingColumnId &&
    previous.addTaskText === next.addTaskText &&
    previous.isColumnDragging === next.isColumnDragging &&
    previous.columnDragHandleProps === next.columnDragHandleProps &&
    previous.onStartAddTask === next.onStartAddTask &&
    previous.onCancelAddTask === next.onCancelAddTask &&
    previous.onSubmitAddTask === next.onSubmitAddTask &&
    previous.onToggleTask === next.onToggleTask &&
    previous.onOpenTask === next.onOpenTask &&
    previous.onEditColumn === next.onEditColumn &&
    previous.onDeleteColumn === next.onDeleteColumn,
);

const ProjectTodoList = ({
  columns = [],
  status = "idle",
  tasksLoadingByColumnId = {},
  completingByTaskId = {},
  onAddTask,
  onToggleTask,
  onOpenTask,
  onEditColumn,
  onDeleteColumn,
  onReorderColumn,
}) => {
  const [board, setBoard] = useState(() => normalizeTodoBoard(columns));
  const snapshotRef = useRef(null);
  const isColumnDraggingRef = useRef(false);
  const [addingColumnId, setAddingColumnId] = useState(null);
  const [addTaskText, setAddTaskText] = useState("");

  useEffect(() => {
    if (isColumnDraggingRef.current) return;
    setBoard(normalizeTodoBoard(columns));
  }, [columns]);

  const startAddTask = (column) => {
    if (!column?.id) return;
    setAddingColumnId(column.id);
    setAddTaskText("");
  };

  const cancelAddTask = () => {
    setAddingColumnId(null);
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

  const onDragStart = () => {
    isColumnDraggingRef.current = true;
    snapshotRef.current = {
      columns: [...(board.columns || [])],
    };
  };

  const onDragEnd = (result) => {
    isColumnDraggingRef.current = false;
    const { destination, source, draggableId, type } = result || {};
    const baseBoard = snapshotRef.current || board;
    snapshotRef.current = null;

    if (
      !destination ||
      type !== TODO_COLUMN_DND_TYPE ||
      !draggableId?.startsWith("todo-column-")
    ) {
      setBoard(baseBoard);
      return;
    }

    if (source?.index === destination?.index) return;

    const nextColumns = [...(baseBoard.columns || [])];
    const [movedColumn] = nextColumns.splice(source.index, 1);
    if (!movedColumn) {
      setBoard(baseBoard);
      return;
    }

    nextColumns.splice(destination.index, 0, movedColumn);
    const nextBoard = {
      columns: nextColumns.map((column, index) => ({
        ...column,
        position: index + 1,
      })),
    };
    setBoard(nextBoard);

    const orderedIds = nextBoard.columns.map((column) => column.id);

    try {
      const maybePromise = onReorderColumn?.({ orderedIds });
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.catch(() => setBoard(baseBoard));
      }
    } catch {
      setBoard(baseBoard);
    }
  };

  if (status === "loading" && !board.columns.length) {
    return (
      <div className="project-todo-list__state">
        <iconify-icon icon="line-md:loading-loop" />
      </div>
    );
  }

  if (!board.columns.length) {
    return (
      <div className="project-todo-list__empty">
        <i className="ti ti-checklist"></i>
        <span>Start adding Todo List columns</span>
      </div>
    );
  }

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Droppable droppableId="todo-columns" type={TODO_COLUMN_DND_TYPE}>
        {(dropProvided) => (
          <div
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className="project-todo-list"
          >
            {board.columns.map((column, index) => (
              <Draggable
                key={String(column?.id)}
                draggableId={`todo-column-${column?.id}`}
                index={index}
              >
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                  >
                    <TodoColumn
                      column={column}
                      tasksLoading={Boolean(
                        tasksLoadingByColumnId?.[String(column?.id)],
                      )}
                      completingByTaskId={completingByTaskId}
                      addingColumnId={addingColumnId}
                      addTaskText={addTaskText}
                      setAddTaskText={setAddTaskText}
                      onStartAddTask={startAddTask}
                      onCancelAddTask={cancelAddTask}
                      onSubmitAddTask={submitAddTask}
                      onToggleTask={onToggleTask}
                      onOpenTask={onOpenTask}
                      onEditColumn={onEditColumn}
                      onDeleteColumn={onDeleteColumn}
                      columnDragHandleProps={dragProvided.dragHandleProps}
                      isColumnDragging={dragSnapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ProjectTodoList;
