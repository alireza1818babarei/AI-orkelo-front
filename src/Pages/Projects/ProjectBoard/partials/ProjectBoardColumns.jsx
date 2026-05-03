import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import BoardColumn from "./BoardColumn";
import BoardItem from "../../../../Components/BoardItem";
import { formatMonthDay } from "../../../../utils/date";
import { resolveUserAvatarUrl } from "../../../../utils/mediaUrl";

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
  const raw = task?.total_attachment ?? null;

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

const normalizeNonNegativeCount = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
  }

  return null;
};

const isChecklistItemChecked = (item) => {
  const value = item?.is_completed;
  if (value === true || value === 1) return true;
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1";
};

const countChecklistItems = (items = []) =>
  (Array.isArray(items) ? items : []).reduce(
    (summary, item) => {
      const childrenSummary = countChecklistItems(item?.children || []);
      return {
        total: summary.total + 1 + childrenSummary.total,
        completed:
          summary.completed +
          (isChecklistItemChecked(item) ? 1 : 0) +
          childrenSummary.completed,
      };
    },
    { total: 0, completed: 0 },
  );

const getTaskChecklistProgress = (task) => {
  const total = normalizeNonNegativeCount(
    task?.checklist_items_total ??
      task?.checklistItemsTotal ??
      task?.checklist_total_count,
  );
  const completed = normalizeNonNegativeCount(
    task?.checklist_items_completed_count ??
      task?.checklistItemsCompletedCount ??
      task?.checklist_items_checked,
  );

  if (total !== null) {
    return {
      total,
      completed: Math.min(completed ?? 0, total),
    };
  }

  // Count nested checklist items when the task was sourced from a detail payload.
  return countChecklistItems(task?.checklist_items || task?.checklistItems || []);
};

const normalizeBoard = (columns = []) => {
  const tasksById = {};
  const nextColumns = (columns || []).map((col) => {
    const rawTasks = col.tasks;
    const tasksUndefined = rawTasks == null;
    const taskIds = (rawTasks || []).map((t, index) => {
      const id = String(t.id ?? `${col.id || "col"}-${index}`);
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

const normalizeColumnTaskCount = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return null;
};

const getColumnTaskCount = (column) => {
  if (!column) return null;
  if (!column.tasksUndefined) return Array.isArray(column.taskIds) ? column.taskIds.length : 0;

  return normalizeColumnTaskCount(
    column.tasks_count ?? column.tasksCount ?? column.task_count ?? column.taskCount,
  );
};

const isTaskCompleted = (task) =>
  !!task?.is_completed ||
  String(task?.status || "").toLowerCase() === "done" ||
  String(task?.status || "").toLowerCase() === "completed";

const getTaskDueValue = (task) =>
  task?.due_at ?? null;

const isTaskOverdue = (task) => {
  const raw = getTaskDueValue(task);
  if (!raw) return false;
  const dueTime = new Date(raw).getTime();
  return Number.isFinite(dueTime) && dueTime < Date.now();
};

const formatTimeHHmm = (raw) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const formatTaskDate = (task) => {
  const raw = getTaskDueValue(task);
  if (!raw) return "";
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    const base = formatMonthDay(raw) || "";
    const time = formatTimeHHmm(raw);
    return time ? `${base} ${time}` : base;
  }
  return String(raw);
};

const pickFirstNonEmpty = (values = []) => {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
};

const getTaskAssigneeObject = (task) => {
  const fromAssignees =
    Array.isArray(task?.assignees) &&
    task.assignees.find((item) => item && typeof item === "object");
  if (fromAssignees) return fromAssignees;

  const candidates = [task?.assignee];

  return (
    candidates.find((item) => item && typeof item === "object") || null
  );
};

const resolveTaskAssigneeAvatar = (task) => {
  const assignee = getTaskAssigneeObject(task);

  const assigneeAvatarRaw = pickFirstNonEmpty([
    assignee?.avatar,
  ]);

  if (!assignee) return "";

  return resolveUserAvatarUrl(assigneeAvatarRaw);
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
  const checklistProgress = getTaskChecklistProgress(task);
  const overdue = !completed && isTaskOverdue(task);
  const trackingActive =
    String(task?.type ?? "")
      .toLowerCase()
      .trim() === "start";
  const pressRef = useRef({
    startedAt: 0,
    startX: 0,
    startY: 0,
    moved: false,
  });

  const { onKeyDown: onDragHandleKeyDown, ...taskDragHandleProps } = dragHandleProps || {};

  const openTask = useCallback(() => {
    onTaskClick?.({ ...task, column_id: columnId, columnId });
  }, [columnId, onTaskClick, task]);

  const markMoved = useCallback((clientX, clientY) => {
    const p = pressRef.current;
    if (!p.startedAt) return;
    if (Math.abs(clientX - p.startX) > 6 || Math.abs(clientY - p.startY) > 6) {
      p.moved = true;
    }
  }, []);

  const handlePointerDown = useCallback((e) => {
    pressRef.current = {
      startedAt: Date.now(),
      startX: e.clientX ?? 0,
      startY: e.clientY ?? 0,
      moved: false,
    };
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      markMoved(e.clientX ?? 0, e.clientY ?? 0);
    },
    [markMoved],
  );

  const handleCardClick = useCallback(() => {
    const p = pressRef.current;
    const elapsed = Date.now() - (p.startedAt || 0);
    if (p.moved || elapsed > 220) return;
    openTask();
  }, [openTask]);

  return (
    <div
      className="board-item-shell"
      style={
        enter ? { "--enter-delay": `${Math.min(Number(enterIndex) || 0, 20) * 55}ms` } : null
      }
    >
      <BoardItem
        {...taskDragHandleProps}
        className={`${isDragging ? "is-dragging" : ""} ${
          completed ? "task-completed" : ""
        } ${overdue ? "task-overdue" : ""} ${
          flashCompleted ? "task-completed-flash" : ""
        } ${
          enter ? "task-enter" : ""
        } ${trackingActive ? "task-tracking task-tracking-bounce" : ""}`}
        data-ani={trackingActive ? "bounce" : undefined}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerCancel={() => {
          pressRef.current.startedAt = 0;
        }}
        onPointerUp={() => {
          // keep press timing data for click handler right after pointer up
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openTask();
            return;
          }
          onDragHandleKeyDown?.(e);
        }}
        taskId={task.id}
        taskTitle={task.text || "Task"}
        taskBody={task.description || ""}
        taskDate={formatTaskDate(task)}
        taskFileAttachCount={getTaskAttachmentCount(task) || "0"}
        taskChecklistCompletedCount={checklistProgress.completed}
        taskChecklistTotalCount={checklistProgress.total}
        taskTags={task.tags ?? []}
        taskUserImg={resolveTaskAssigneeAvatar(task)}
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
  contentRef,
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
  registerContentRef,
}) {
  const taskIds = column.taskIds || [];
  const columnTaskCount = getColumnTaskCount(column);
  const setColumnContentRef = useCallback(
    (node) => {
      if (typeof contentRef === "function") {
        contentRef(node);
      } else if (contentRef && typeof contentRef === "object") {
        contentRef.current = node;
      }
      registerContentRef?.(column.id, node);
    },
    [column.id, contentRef, registerContentRef],
  );

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
      <div className="d-flex align-items-center justify-content-center py-2">
        <button
          type="button"
          className="btn btn-primary btn-sm"
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
          columnIcon={column.icon ?? column.iconClass ?? column.icon_code ?? null}
          taskCount={columnTaskCount}
          actions={column.actions}
          contentRef={setColumnContentRef}
          contentClassName={dropSnapshot.isDraggingOver ? "is-over" : ""}
          footer={footer}
          contentInnerRef={dropProvided.innerRef}
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
  onArchiveCompletedTasks,
  archivingCompletedByColumnId = {},
  onAddTask,
  onTaskClick,
  onReorderColumns,
  onReorderTask,
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
  const columnContentElsRef = useRef({});
  const pendingCreatedTaskScrollColumnIdRef = useRef(null);
  const readyCreatedTaskScrollColumnIdRef = useRef(null);

  const registerColumnContentRef = useCallback((columnId, node) => {
    const key = String(columnId ?? "");
    if (!key) return;
    if (node) {
      columnContentElsRef.current[key] = node;
      return;
    }
    delete columnContentElsRef.current[key];
  }, []);

  const scrollContentElementToBottom = useCallback((el, behavior = "auto") => {
    if (!el) return false;

    if (typeof el.scrollTo === "function") {
      el.scrollTo({
        top: el.scrollHeight,
        behavior,
      });
    } else {
      el.scrollTop = el.scrollHeight;
    }

    return true;
  }, []);

  const scrollColumnToBottom = useCallback(
    (columnId, behavior = "smooth") => {
      const key = String(columnId ?? "");
      return scrollContentElementToBottom(
        columnContentElsRef.current[key],
        behavior,
      );
    },
    [scrollContentElementToBottom],
  );

  const scrollAllColumnsToBottom = useCallback(
    (behavior = "auto") => {
      Object.values(columnContentElsRef.current || {}).forEach((el) => {
        scrollContentElementToBottom(el, behavior);
      });
    },
    [scrollContentElementToBottom],
  );

  useLayoutEffect(() => {
    if (isDraggingRef.current) return undefined;

    let raf1 = 0;
    let raf2 = 0;

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        scrollAllColumnsToBottom("auto");
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [board, status, tasksLoading, scrollAllColumnsToBottom]);


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

    const pendingScrollColumnId = pendingCreatedTaskScrollColumnIdRef.current;
    if (pendingScrollColumnId && newIds.length) {
      const newTaskIdSet = new Set(newIds.map(String));
      const targetColumn = (nextBoard.columns || []).find(
        (col) => String(col.id) === String(pendingScrollColumnId),
      );

      if (targetColumn?.taskIds?.some((id) => newTaskIdSet.has(String(id)))) {
        readyCreatedTaskScrollColumnIdRef.current = String(pendingScrollColumnId);
        pendingCreatedTaskScrollColumnIdRef.current = null;
      }
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

  useEffect(() => {
    const targetColumnId = readyCreatedTaskScrollColumnIdRef.current;
    if (!targetColumnId) return undefined;

    let raf1 = 0;
    let raf2 = 0;
    let fallbackTimeout = 0;

    const runScroll = () => {
      const didScroll = scrollColumnToBottom(targetColumnId, "smooth");
      if (didScroll) {
        readyCreatedTaskScrollColumnIdRef.current = null;
        return;
      }

      fallbackTimeout = window.setTimeout(() => {
        if (scrollColumnToBottom(targetColumnId, "auto")) {
          readyCreatedTaskScrollColumnIdRef.current = null;
        }
      }, 80);
    };

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(runScroll);
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(fallbackTimeout);
    };
  }, [board, scrollColumnToBottom]);

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
    const targetColumnId = String(column?.id ?? "");
    if (targetColumnId) {
      pendingCreatedTaskScrollColumnIdRef.current = targetColumnId;
    }

    const maybePromise = onAddTask?.(column, text);
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.catch(() => {
        if (pendingCreatedTaskScrollColumnIdRef.current === targetColumnId) {
          pendingCreatedTaskScrollColumnIdRef.current = null;
        }
      });
    }
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
      if (source.index === destination.index) {
        snapshotRef.current = null;
        return;
      }

      const baseBoard = snapshotRef.current || board;
      const previousOrderedIds = (baseBoard.columns || []).map((col) => String(col.id));
      const nextColumns = arrayMove(baseBoard.columns || [], source.index, destination.index);
      const orderedIds = nextColumns.map((col) => String(col.id));

      setBoard((prev) => ({ ...prev, columns: nextColumns }));
      snapshotRef.current = null;

      try {
        const maybePromise = onReorderColumns?.({ orderedIds, previousOrderedIds });
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

    if (!draggableId?.startsWith("task-")) return;
    const taskId = draggableId.slice(5);
    const sourceColId = String(source.droppableId || "").replace(/^col-/, "");
    const destColId = String(destination.droppableId || "").replace(/^col-/, "");
    if (sourceColId === destColId && source.index === destination.index) {
      snapshotRef.current = null;
      return;
    }

    const baseBoard = snapshotRef.current || board;
    const columns = baseBoard.columns || [];
    const sourceIndex = columns.findIndex((c) => String(c.id) === sourceColId);
    const destIndex = columns.findIndex((c) => String(c.id) === destColId);
    if (sourceIndex === -1 || destIndex === -1) {
      snapshotRef.current = null;
      return;
    }

    const previousSourceTaskIds = [...(columns[sourceIndex]?.taskIds || [])];
    const previousDestinationTaskIds =
      sourceIndex === destIndex
        ? [...previousSourceTaskIds]
        : [...(columns[destIndex]?.taskIds || [])];

    const nextColumns = columns.map((c) => ({ ...c, taskIds: [...(c.taskIds || [])] }));
    const sourceTasks = nextColumns[sourceIndex].taskIds;
    const destTasks = nextColumns[destIndex].taskIds;

    sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, taskId);

    const sourceTaskIds = [...(nextColumns[sourceIndex]?.taskIds || [])];
    const destinationTaskIds =
      sourceIndex === destIndex
        ? [...sourceTaskIds]
        : [...(nextColumns[destIndex]?.taskIds || [])];

    const tasksById = { ...(baseBoard.tasksById || {}) };
    if (tasksById[String(taskId)]) {
      tasksById[String(taskId)] = {
        ...tasksById[String(taskId)],
        column_id: destColId,
        columnId: destColId,
      };
    }

    const nextBoard = { ...baseBoard, columns: nextColumns, tasksById };
    setBoard(nextBoard);
    snapshotRef.current = null;

    try {
      const maybePromise = onReorderTask?.({
        taskId,
        sourceColumnId: sourceColId,
        destinationColumnId: destColId,
        sourceTaskIds,
        destinationTaskIds,
        previousSourceTaskIds,
        previousDestinationTaskIds,
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
                          {
                            key: "archive-completed-tasks",
                            label: "Archive completed",
                            icon: "ti-archive",
                            disabled: !!archivingCompletedByColumnId?.[String(col.id)],
                            onClick: () => onArchiveCompletedTasks?.(col),
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
                      registerContentRef={registerColumnContentRef}
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
