import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import ActionDropdown from "../../../../Components/ActionDropdown";
import { getTextDirectionProps } from "../../../../utils/textDirection";
import {
  getGroupedDestinationIndex,
  getPointerListDestination,
  isPointInsideElement,
  renderSuppressedDropPlaceholder,
  useManualDragAutoScroll,
} from "../../../../utils/manualDragDrop";

const TODO_COMPLETED_STATUSES = new Set(["done", "completed"]);
const TODO_COLUMN_DND_TYPE = "TODO_COLUMN";
const TODO_TASK_DND_TYPE = "TODO_TASK";

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

const normalizeTodoBoard = (columns = []) => {
  const tasksById = {};
  const nextColumns = (Array.isArray(columns) ? columns : []).map((column) => {
    const sortedTasks = sortTodoTasks(column?.tasks || []);
    const taskIds = sortedTasks.map((task, index) => {
      const id = String(task?.id ?? `${column?.id || "todo"}-${index}`);
      tasksById[id] = {
        ...task,
        id,
        column_id: task?.column_id ?? column?.id ?? null,
        columnId: task?.columnId ?? column?.id ?? null,
      };
      return id;
    });

    return {
      ...column,
      id: String(column?.id ?? ""),
      taskIds,
    };
  });

  return { columns: nextColumns, tasksById };
};

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
  dragHandleProps,
  isDragging,
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
      } ${tracking ? "is-tracking" : ""} ${isDragging ? "is-dragging" : ""}`}
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

      <div
        className="project-todo-list__task-copy"
        {...dragHandleProps}
        aria-label="Drag todo"
      >
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

const todoPortalElement =
  typeof document !== "undefined" ? document.body : null;

const TodoPortalDraggable = ({
  provided,
  snapshot,
  disableDropDisplacement = false,
  children,
}) => {
  const baseStyle = provided.draggableProps.style || {};
  const style = snapshot.isDragging
    ? { ...baseStyle, zIndex: 999999 }
    : disableDropDisplacement
      ? {
          ...baseStyle,
          transform: "none",
          transition: "transform 160ms ease",
        }
      : baseStyle;

  const node = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={style}
      className="project-todo-list__drag-wrapper"
    >
      {children}
    </div>
  );

  if (snapshot.isDragging && todoPortalElement) {
    return createPortal(node, todoPortalElement);
  }

  return node;
};

const TodoColumn = memo(function TodoColumn({
  column,
  tasksById,
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
  manualTaskDropPreview,
  isManualTaskDropActive,
}) {
  const rootRef = useRef(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const columnId = String(column?.id ?? "");
  const taskIds = Array.isArray(column?.taskIds) ? column.taskIds : [];
  const isAdding = String(addingColumnId ?? "") === columnId;
  const columnColor = column?.color || "#0ea5e9";
  const iconClass = normalizeIconClass(column?.icon);
  const taskCount = taskIds.length || Number(column?.tasks_count ?? 0) || 0;
  const previewColumnId = String(
    manualTaskDropPreview?.droppableId || "",
  ).replace(/^todo-col-/, "");
  const previewTaskId = String(manualTaskDropPreview?.taskId ?? "");
  const isManualDropTarget =
    Boolean(manualTaskDropPreview) && previewColumnId === columnId;
  const previewTaskIds = taskIds.filter(
    (taskId) => String(taskId) !== previewTaskId,
  );
  const previewIndex = isManualDropTarget
    ? Math.min(
        Math.max(Number(manualTaskDropPreview?.index ?? 0), 0),
        previewTaskIds.length,
      )
    : -1;
  const previewBeforeTaskId =
    previewIndex >= 0 && previewIndex < previewTaskIds.length
      ? String(previewTaskIds[previewIndex])
      : "";
  const shouldShowPreviewAtEnd =
    isManualDropTarget && previewIndex >= previewTaskIds.length;
  const previewHeight = Math.max(
    Number(manualTaskDropPreview?.height ?? 0),
    64,
  );
  const previewNode = isManualDropTarget ? (
    <div
      className="project-todo-list__drop-preview"
      style={{
        height: `${previewHeight}px`,
        border: "2px dashed var(--project-todo-list-column-color)",
        borderRadius: "8px",
        background: "rgba(59, 130, 246, 0.08)",
        margin: "0.35rem 0",
      }}
      aria-hidden="true"
    />
  ) : null;

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

      <Droppable droppableId={`todo-col-${columnId}`} type={TODO_TASK_DND_TYPE}>
        {(dropProvided, dropSnapshot) => {
          const isPackageDraggingOver =
            !isManualTaskDropActive && dropSnapshot.isDraggingOver;

          return (
            <div
              ref={dropProvided.innerRef}
              {...dropProvided.droppableProps}
              data-todo-column-id={columnId}
              className={`project-todo-list__tasks app-scroll ${
                !taskIds.length ? "project-todo-list__tasks--drop-target" : ""
              } ${isManualDropTarget ? "is-manual-drop-target" : ""} ${
                isPackageDraggingOver ? "is-package-dragging-over" : ""
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

              {tasksLoading && !taskIds.length ? (
                <div className="project-todo-list__state">
                  <iconify-icon icon="line-md:loading-loop" />
                </div>
              ) : (
                taskIds.map((taskId, index) => {
                  const task = tasksById?.[String(taskId)];
                  if (!task) return null;

                  return (
                    <React.Fragment key={String(taskId)}>
                      {previewBeforeTaskId === String(taskId)
                        ? previewNode
                        : null}
                      <Draggable
                        draggableId={`todo-task-${taskId}`}
                        index={index}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <TodoPortalDraggable
                            provided={dragProvided}
                            snapshot={dragSnapshot}
                            disableDropDisplacement={isManualTaskDropActive}
                          >
                            <TodoTaskRow
                              task={task}
                              columnId={column?.id}
                              completing={Boolean(
                                completingByTaskId?.[String(task?.id)],
                              )}
                              onToggleTask={onToggleTask}
                              onOpenTask={onOpenTask}
                              dragHandleProps={dragProvided.dragHandleProps}
                              isDragging={dragSnapshot.isDragging}
                            />
                          </TodoPortalDraggable>
                        )}
                      </Draggable>
                    </React.Fragment>
                  );
                })
              )}
              {shouldShowPreviewAtEnd ? previewNode : null}
              {renderSuppressedDropPlaceholder(
                dropProvided.placeholder,
                isManualTaskDropActive,
              )}
            </div>
          );
        }}
      </Droppable>
    </section>
  );
});

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
  onReorderTask,
  onReorderColumn,
}) => {
  const [board, setBoard] = useState(() => normalizeTodoBoard(columns));
  const snapshotRef = useRef(null);
  const isDraggingRef = useRef(false);
  const draggedTaskIdRef = useRef(null);
  const draggedTaskHeightRef = useRef(0);
  const isTaskDragActiveRef = useRef(false);
  const manualTaskDropPreviewRef = useRef(null);
  const [manualTaskDropPreview, setManualTaskDropPreview] = useState(null);
  const [isManualTaskDropActive, setIsManualTaskDropActive] = useState(false);
  const [addingColumnId, setAddingColumnId] = useState(null);
  const [addTaskText, setAddTaskText] = useState("");

  useEffect(() => {
    if (isDraggingRef.current) return;
    setBoard(normalizeTodoBoard(columns));
  }, [columns]);

  const updateManualTaskDropPreview = useCallback((nextPreview) => {
    const current = manualTaskDropPreviewRef.current;
    const samePreview =
      current?.taskId === nextPreview?.taskId &&
      current?.droppableId === nextPreview?.droppableId &&
      current?.index === nextPreview?.index &&
      current?.height === nextPreview?.height;

    if (samePreview) return;

    manualTaskDropPreviewRef.current = nextPreview;
    setManualTaskDropPreview(nextPreview);
  }, []);

  const resolvePointerDestination = useCallback(
    (point, draggedTaskId) => {
      const rawDestination = getPointerListDestination({
        point,
        draggedItemId: draggedTaskId,
        containerSelector: "[data-todo-column-id]",
        shellSelector: "[data-todo-column-shell-id]",
        itemSelector: "[data-todo-task-id]",
        containerIdAttribute: "data-todo-column-id",
        itemIdAttribute: "data-todo-task-id",
        droppableIdPrefix: "todo-col-",
      });

      if (!rawDestination) return null;

      const baseBoard = snapshotRef.current || board;
      const draggedTask = baseBoard.tasksById?.[String(draggedTaskId)];
      const destinationColumn = (baseBoard.columns || []).find(
        (column) => String(column?.id) === rawDestination.containerId,
      );

      if (!draggedTask || !destinationColumn) return rawDestination;

      const destinationTaskIds = (destinationColumn.taskIds || []).filter(
        (taskId) => String(taskId) !== String(draggedTaskId),
      );
      const normalizedIndex = getGroupedDestinationIndex({
        draggedItem: draggedTask,
        destinationItemIds: destinationTaskIds,
        destinationIndex: rawDestination.index,
        itemsById: baseBoard.tasksById,
        isGroupedAtEnd: isTodoTaskCompleted,
      });

      return { ...rawDestination, index: normalizedIndex };
    },
    [board],
  );

  const syncManualTaskDropPreview = useCallback(
    (point) => {
      const draggedTaskId = draggedTaskIdRef.current;
      if (!draggedTaskId || !point) {
        updateManualTaskDropPreview(null);
        return;
      }

      const destination = resolvePointerDestination(point, draggedTaskId);
      updateManualTaskDropPreview(
        destination
          ? {
              taskId: draggedTaskId,
              droppableId: destination.droppableId,
              index: destination.index,
              height: draggedTaskHeightRef.current,
            }
          : null,
      );
    },
    [resolvePointerDestination, updateManualTaskDropPreview],
  );

  const {
    rootRef: todoListRef,
    clearDragPointer,
    getLatestDragPointer,
    startDragAutoScroll,
    stopDragAutoScroll,
  } = useManualDragAutoScroll(syncManualTaskDropPreview, {
    horizontal: false,
    vertical: true,
  });

  const setManualTaskDropMode = useCallback(
    (isActive) => {
      isTaskDragActiveRef.current = isActive;
      setIsManualTaskDropActive(isActive);
      todoListRef.current?.classList?.toggle(
        "is-manual-task-drop-active",
        isActive,
      );

      if (!isActive) updateManualTaskDropPreview(null);
    },
    [todoListRef, updateManualTaskDropPreview],
  );

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

  const onBeforeCapture = useCallback(
    (before) => {
      const isTaskDrag = String(before?.draggableId || "").startsWith(
        "todo-task-",
      );
      setManualTaskDropMode(isTaskDrag);
      updateManualTaskDropPreview(null);
    },
    [setManualTaskDropMode, updateManualTaskDropPreview],
  );

  const onDragStart = (start) => {
    isDraggingRef.current = true;
    snapshotRef.current = {
      columns: (board.columns || []).map((column) => ({
        ...column,
        taskIds: [...(column.taskIds || [])],
      })),
      tasksById: { ...(board.tasksById || {}) },
    };

    if (start?.type === TODO_TASK_DND_TYPE) {
      const draggedTaskId = String(start?.draggableId || "").replace(
        /^todo-task-/,
        "",
      );
      const draggedTaskElement =
        typeof document !== "undefined"
          ? [...document.querySelectorAll("[data-todo-task-id]")].find(
              (element) =>
                String(element?.dataset?.todoTaskId ?? "") === draggedTaskId,
            )
          : null;
      const draggedRect = draggedTaskElement?.getBoundingClientRect?.();
      const initialPoint = draggedRect
        ? {
            x: draggedRect.left + draggedRect.width / 2,
            y: draggedRect.top + draggedRect.height / 2,
          }
        : null;

      draggedTaskIdRef.current = draggedTaskId;
      draggedTaskHeightRef.current = draggedRect?.height || 0;
      setManualTaskDropMode(true);
      startDragAutoScroll(todoListRef.current, initialPoint);
      if (initialPoint) syncManualTaskDropPreview(initialPoint);
    } else {
      draggedTaskIdRef.current = null;
      draggedTaskHeightRef.current = 0;
      setManualTaskDropMode(false);
      clearDragPointer();
    }
  };

  const onDragEnd = (result) => {
    const { destination, draggableId, source, type } = result || {};
    const dragPointer = getLatestDragPointer();
    const isTaskDrag =
      type === TODO_TASK_DND_TYPE &&
      draggableId?.startsWith("todo-task-");
    const draggedTaskId = isTaskDrag
      ? draggableId.replace("todo-task-", "")
      : null;
    const livePointerDestination =
      isTaskDrag && dragPointer
        ? resolvePointerDestination(dragPointer, draggedTaskId)
        : null;
    const previewDestination = manualTaskDropPreviewRef.current
      ? {
          droppableId: manualTaskDropPreviewRef.current.droppableId,
          index: manualTaskDropPreviewRef.current.index,
        }
      : null;
    const canUsePreviewDestination =
      isTaskDragActiveRef.current &&
      isPointInsideElement(todoListRef.current, dragPointer, 32);
    const effectiveDestination = isTaskDrag
      ? livePointerDestination ||
        (canUsePreviewDestination ? previewDestination : null) ||
        destination
      : destination;
    const baseBoard = snapshotRef.current || board;

    stopDragAutoScroll();
    clearDragPointer();
    setManualTaskDropMode(false);
    draggedTaskIdRef.current = null;
    draggedTaskHeightRef.current = 0;
    updateManualTaskDropPreview(null);
    isDraggingRef.current = false;

    if (!effectiveDestination) {
      setBoard(baseBoard);
      snapshotRef.current = null;
      return;
    }

    if (type === TODO_COLUMN_DND_TYPE) {
      if (!draggableId?.startsWith("todo-column-")) {
        snapshotRef.current = null;
        return;
      }

      if (source?.index === effectiveDestination?.index) {
        snapshotRef.current = null;
        return;
      }

      const nextColumns = [...(baseBoard.columns || [])];
      const [movedColumn] = nextColumns.splice(source.index, 1);
      if (!movedColumn) {
        setBoard(baseBoard);
        snapshotRef.current = null;
        return;
      }

      nextColumns.splice(effectiveDestination.index, 0, movedColumn);
      const nextBoard = {
        ...baseBoard,
        columns: nextColumns.map((column, index) => ({
          ...column,
          position: index + 1,
        })),
      };
      setBoard(nextBoard);
      snapshotRef.current = null;

      const orderedIds = nextBoard.columns.map((column) => column.id);

      try {
        const maybePromise = onReorderColumn?.({ orderedIds });

        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.catch(() => {
            setBoard(baseBoard);
          });
        }
      } catch {
        setBoard(baseBoard);
      }

      return;
    }

    if (!draggableId?.startsWith("todo-task-")) {
      snapshotRef.current = null;
      return;
    }

    const taskId = draggableId.replace("todo-task-", "");
    const sourceColumnId = String(source?.droppableId || "").replace(
      "todo-col-",
      "",
    );
    const destinationColumnId = String(
      effectiveDestination?.droppableId || "",
    ).replace("todo-col-", "");

    if (
      sourceColumnId === destinationColumnId &&
      source?.index === effectiveDestination?.index
    ) {
      snapshotRef.current = null;
      return;
    }

    const sourceColumnIndex = (baseBoard.columns || []).findIndex(
      (column) => String(column?.id) === sourceColumnId,
    );
    const destinationColumnIndex = (baseBoard.columns || []).findIndex(
      (column) => String(column?.id) === destinationColumnId,
    );

    if (sourceColumnIndex === -1 || destinationColumnIndex === -1) {
      setBoard(baseBoard);
      snapshotRef.current = null;
      return;
    }

    const draggedTask = baseBoard.tasksById?.[String(taskId)];
    if (!draggedTask) {
      setBoard(baseBoard);
      snapshotRef.current = null;
      return;
    }

    const nextColumns = (baseBoard.columns || []).map((column) => ({
      ...column,
      taskIds: [...(column.taskIds || [])],
    }));
    const nextTasksById = { ...(baseBoard.tasksById || {}) };
    const sourceTaskIds = nextColumns[sourceColumnIndex].taskIds;
    sourceTaskIds.splice(source.index, 1);

    const destinationTaskIds =
      sourceColumnIndex === destinationColumnIndex
        ? sourceTaskIds
        : nextColumns[destinationColumnIndex].taskIds;
    const nextDestinationIndex = getGroupedDestinationIndex({
      draggedItem: draggedTask,
      destinationItemIds: destinationTaskIds,
      destinationIndex: effectiveDestination.index,
      itemsById: nextTasksById,
      isGroupedAtEnd: isTodoTaskCompleted,
    });

    destinationTaskIds.splice(nextDestinationIndex, 0, taskId);

    nextTasksById[String(taskId)] = {
      ...draggedTask,
      column_id: destinationColumnId,
      columnId: destinationColumnId,
    };

    const nextBoard = {
      columns: nextColumns,
      tasksById: nextTasksById,
    };
    setBoard(nextBoard);
    snapshotRef.current = null;

    const nextSourceTaskIds = [...nextColumns[sourceColumnIndex].taskIds];
    const nextDestinationTaskIds = [
      ...nextColumns[destinationColumnIndex].taskIds,
    ];

    try {
      const maybePromise = onReorderTask?.({
        taskId,
        sourceColumnId,
        destinationColumnId,
        sourceTaskIds: nextSourceTaskIds,
        destinationTaskIds: nextDestinationTaskIds,
      });

      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.catch(() => {
          setBoard(baseBoard);
        });
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
    <DragDropContext
      onBeforeCapture={onBeforeCapture}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Droppable droppableId="todo-columns" type={TODO_COLUMN_DND_TYPE}>
        {(dropProvided) => (
          <div
            ref={(node) => {
              todoListRef.current = node;
              dropProvided.innerRef(node);
            }}
            {...dropProvided.droppableProps}
            className={`project-todo-list ${
              isManualTaskDropActive ? "is-manual-task-drop-active" : ""
            }`}
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
                      tasksById={board.tasksById}
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
                      manualTaskDropPreview={manualTaskDropPreview}
                      isManualTaskDropActive={isManualTaskDropActive}
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
