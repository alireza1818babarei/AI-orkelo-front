import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import BoardColumn from "./BoardColumn";
import BoardItem from "../../../../Components/BoardItem";
import { formatMonthDay } from "../../../../utils/date";

/* =========================
   Helpers
========================= */

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
  dragHandleProps,
  isDragging,
  flashCompleted,
  enter,
  enterIndex = 0,
}) {
  if (!task) return null;
  const completed = isTaskCompleted(task);

  return (
    <div
      className="board-item-shell"
      style={
        enter ? { "--enter-delay": `${Math.min(Number(enterIndex) || 0, 20) * 55}ms` } : null
      }
    >
      <div className="board-item-drag-handle" aria-hidden="true" {...(dragHandleProps || {})} />
      <BoardItem
        className={`${isDragging ? "is-dragging" : ""} ${
          completed ? "task-completed" : ""
        } ${flashCompleted ? "task-completed-flash" : ""} ${enter ? "task-enter" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => onTaskClick?.({ ...task, column_id: columnId, columnId })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTaskClick?.({ ...task, column_id: columnId, columnId });
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
    </div>
  );
});

const portalEl = typeof document !== "undefined" ? document.body : null;

const PortalDraggable = ({ provided, snapshot, className = "", children }) => {
  const style = snapshot.isDragging
    ? { ...(provided.draggableProps.style || {}), zIndex: 999999 }
    : provided.draggableProps.style;

  const node = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={style}
      className={className}
    >
      {children}
    </div>
  );

  if (snapshot.isDragging && portalEl) return createPortal(node, portalEl);
  return node;
};

const Column = memo(function Column({
  column,
  tasksById,
  status,
  tasksLoading,
  onAddTask,
  onTaskClick,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging,

  addTaskColumnId,
  addTaskText,
  setAddTaskText,
  onStartAddTask,
  onCancelAddTask,
  onSubmitAddTask,

  flashCompletedTaskIds,
  enterTaskIds,
}) {
  const taskIds = column.taskIds || [];

  const footer = useMemo(() => {
    if (addTaskColumnId === String(column.id)) {
      return (
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
      );
    }

    return (
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
    );
  }, [
    addTaskColumnId,
    addTaskText,
    column,
    onCancelAddTask,
    onStartAddTask,
    onSubmitAddTask,
    setAddTaskText,
    status,
    tasksLoading,
  ]);

  return (
    <Droppable droppableId={`col-${column.id}`} type="TASK">
      {(dropProvided, dropSnapshot) => (
        <BoardColumn
          innerRef={innerRef}
          headerRef={null}
          dragHandleProps={dragHandleProps}
          color={column.color}
          className={`${isDragging ? "is-dragging" : ""} ${
            dropSnapshot.isDraggingOver ? "is-over" : ""
          }`}
          columnTitle={column.title || column.name || "Column"}
          actions={column.actions}
          contentRef={dropProvided.innerRef}
          contentClassName={dropSnapshot.isDraggingOver ? "is-over" : ""}
          footer={footer}
          contentProps={dropProvided.droppableProps}
          {...(draggableProps || {})}
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
            taskIds.map((taskId, index) => {
              const t = tasksById[String(taskId)];
              return (
                <Draggable key={String(taskId)} draggableId={`task-${taskId}`} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <PortalDraggable
                      provided={dragProvided}
                      snapshot={dragSnapshot}
                      className={dragSnapshot.isDragging ? "board-drag-portal" : ""}
                    >
                      <TaskCard
                        task={t}
                        columnId={column.id}
                        onTaskClick={onTaskClick}
                        dragHandleProps={dragProvided.dragHandleProps}
                        isDragging={dragSnapshot.isDragging}
                        flashCompleted={flashCompletedTaskIds?.has?.(String(taskId))}
                        enter={enterTaskIds?.has?.(String(taskId))}
                        enterIndex={index}
                      />
                    </PortalDraggable>
                  )}
                </Draggable>
              );
            })
          )}

          {dropProvided.placeholder}
        </BoardColumn>
      )}
    </Droppable>
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
  const snapshotRef = useRef(null);
  const isDraggingRef = useRef(false);

  const [addTaskColumnId, setAddTaskColumnId] = useState(null);
  const [addTaskText, setAddTaskText] = useState("");

  const completedByIdRef = useRef({});
  const completeFlashTimeoutsRef = useRef({});
  const [flashCompletedTaskIds, setFlashCompletedTaskIds] = useState(() => new Set());

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
      if (!prevCompletedById[id] && nextCompleted) toFlash.push(id);
    });

    if (toFlash.length) {
      setFlashCompletedTaskIds((prev) => {
        const next = new Set(prev);
        toFlash.forEach((id) => next.add(id));
        return next;
      });

      toFlash.forEach((id) => {
        if (completeFlashTimeoutsRef.current[id]) clearTimeout(completeFlashTimeoutsRef.current[id]);
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

  const safeOnTaskClick = useCallback(
    (task) => {
      if (isDraggingRef.current) return;
      onTaskClick?.(task);
    },
    [onTaskClick],
  );

  const onDragStart = () => {
    isDraggingRef.current = true;
    snapshotRef.current = {
      ...board,
      columns: (board.columns || []).map((c) => ({ ...c, taskIds: [...(c.taskIds || [])] })),
      tasksById: { ...(board.tasksById || {}) },
    };
  };

  const onDragEnd = (result) => {
    isDraggingRef.current = false;
    const { destination, source, draggableId, type } = result || {};

    if (!destination) {
      if (snapshotRef.current) setBoard(snapshotRef.current);
      snapshotRef.current = null;
      return;
    }

    if (type === "COLUMN") {
      if (source.index === destination.index) return;
      setBoard((prev) => ({ ...prev, columns: arrayMove(prev.columns, source.index, destination.index) }));
      snapshotRef.current = null;
      return;
    }

    if (!draggableId?.startsWith("task-")) return;
    const taskId = draggableId.slice(5);
    const sourceColId = String(source.droppableId || "").replace(/^col-/, "");
    const destColId = String(destination.droppableId || "").replace(/^col-/, "");

    setBoard((prev) => {
      const columns = prev.columns || [];
      const sourceIndex = columns.findIndex((c) => String(c.id) === sourceColId);
      const destIndex = columns.findIndex((c) => String(c.id) === destColId);
      if (sourceIndex === -1 || destIndex === -1) return prev;

      const nextColumns = columns.map((c) => ({ ...c, taskIds: [...(c.taskIds || [])] }));
      const sourceTasks = nextColumns[sourceIndex].taskIds;
      const destTasks = nextColumns[destIndex].taskIds;

      sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, taskId);

      const tasksById = { ...(prev.tasksById || {}) };
      if (tasksById[String(taskId)]) {
        tasksById[String(taskId)] = {
          ...tasksById[String(taskId)],
          column_id: destColId,
          columnId: destColId,
        };
      }

      return { ...prev, columns: nextColumns, tasksById };
    });

    snapshotRef.current = null;
  };

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
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="COLUMN">
        {(boardDropProvided) => (
          <div ref={boardDropProvided.innerRef} {...boardDropProvided.droppableProps} className="board">
            {(board.columns || []).map((col, index) => (
              <Draggable key={String(col.id)} draggableId={`col-${col.id}`} index={index}>
                {(colDragProvided, colDragSnapshot) => (
                  <PortalDraggable
                    provided={colDragProvided}
                    snapshot={colDragSnapshot}
                    className={colDragSnapshot.isDragging ? "board-drag-portal" : ""}
                  >
                    <Column
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
                      onTaskClick={safeOnTaskClick}
                      innerRef={null}
                      draggableProps={null}
                      dragHandleProps={colDragProvided.dragHandleProps}
                      isDragging={colDragSnapshot.isDragging}
                      addTaskColumnId={addTaskColumnId}
                      addTaskText={addTaskText}
                      setAddTaskText={setAddTaskText}
                      onStartAddTask={startAddTask}
                      onCancelAddTask={cancelAddTask}
                      onSubmitAddTask={submitAddTask}
                      flashCompletedTaskIds={flashCompletedTaskIds}
                      enterTaskIds={enterTaskIds}
                    />
                  </PortalDraggable>
                )}
              </Draggable>
            ))}
            {boardDropProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ProjectBoardColumns;
