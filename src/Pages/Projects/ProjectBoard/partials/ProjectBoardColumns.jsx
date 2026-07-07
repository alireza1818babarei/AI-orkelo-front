import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createPortal } from "react-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import BoardColumn from "./BoardColumn";
import BoardItem from "../../../../Components/BoardItem";
import { formatMonthDay } from "../../../../utils/date";
import { resolveUserAvatarWithFallback } from "../../../../utils/mediaUrl";
import {
  getTaskReviewStatus,
  isTaskApproved,
  TASK_REVIEW_STATUS,
} from "../../../../utils/taskReviewStatus";

/* =========================
   Helpers
========================= */

const arrayMove = (arr, from, to) => {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const EDGE_AUTO_SCROLL_THRESHOLD = 96;
const EDGE_AUTO_SCROLL_MAX_SPEED = 28;

const getDragPointerClientPoint = (event) => {
  const touch = event?.touches?.[0] || event?.changedTouches?.[0];
  const clientX = touch?.clientX ?? event?.clientX;
  const clientY = touch?.clientY ?? event?.clientY;

  return typeof clientX === "number" && typeof clientY === "number"
    ? { x: clientX, y: clientY }
    : null;
};

const getHorizontalScrollContainer = (node) => {
  if (typeof window === "undefined" || !node) return null;

  let current = node.parentElement;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const canScrollX =
      /(auto|scroll|overlay)/.test(style.overflowX || "") &&
      current.scrollWidth > current.clientWidth;

    if (canScrollX) return current;
    current = current.parentElement;
  }

  return null;
};

const getHorizontalEdgeScrollSpeed = (clientX, rect) => {
  const leftDistance = clientX - rect.left;
  const rightDistance = rect.right - clientX;

  if (leftDistance < EDGE_AUTO_SCROLL_THRESHOLD) {
    const ratio =
      (EDGE_AUTO_SCROLL_THRESHOLD - Math.max(leftDistance, 0)) /
      EDGE_AUTO_SCROLL_THRESHOLD;
    return -Math.max(1, Math.round(EDGE_AUTO_SCROLL_MAX_SPEED * ratio));
  }

  if (rightDistance < EDGE_AUTO_SCROLL_THRESHOLD) {
    const ratio =
      (EDGE_AUTO_SCROLL_THRESHOLD - Math.max(rightDistance, 0)) /
      EDGE_AUTO_SCROLL_THRESHOLD;
    return Math.max(1, Math.round(EDGE_AUTO_SCROLL_MAX_SPEED * ratio));
  }

  return 0;
};

const getColumnContentFromPoint = (point) => {
  if (typeof document === "undefined" || !point) return null;
  const elements = document.elementsFromPoint(point.x, point.y);

  for (const element of elements) {
    const content = element.closest?.("[data-board-column-id]");
    if (content) return content;

    const column = element.closest?.("[data-board-column-shell-id]");
    const columnContent = column?.querySelector?.("[data-board-column-id]");
    if (columnContent) return columnContent;
  }

  return null;
};

const getTaskDestinationFromPoint = ({ point, draggedTaskId }) => {
  const columnContent = getColumnContentFromPoint(point);
  const destinationColumnId = columnContent?.dataset?.boardColumnId;

  if (!destinationColumnId) return null;

  const taskElements = [
    ...columnContent.querySelectorAll("[data-board-task-id]"),
  ].filter(
    (element) =>
      String(element?.dataset?.boardTaskId ?? "") !== String(draggedTaskId),
  );

  const index = taskElements.findIndex((element) => {
    const rect = element.getBoundingClientRect();
    return point.y < rect.top + rect.height / 2;
  });

  return {
    droppableId: `col-${destinationColumnId}`,
    index: index === -1 ? taskElements.length : index,
  };
};

const renderDropPlaceholder = (placeholder, shouldSuppress) => {
  if (!shouldSuppress || !React.isValidElement(placeholder)) return placeholder;

  return React.cloneElement(placeholder, {
    style: {
      ...(placeholder.props?.style || {}),
      display: "none",
      height: 0,
      margin: 0,
      padding: 0,
      border: 0,
      opacity: 0,
      overflow: "hidden",
      pointerEvents: "none",
    },
  });
};

// Keeps the horizontal board wrapper moving while a dragged card reaches an edge.
const useHorizontalDragAutoScroll = (onDragFrame) => {
  const boardRef = useRef(null);
  const frameRef = useRef(null);
  const pointerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const activeRef = useRef(false);
  const hasAutoScrolledRef = useRef(false);
  const onDragFrameRef = useRef(onDragFrame);

  useEffect(() => {
    onDragFrameRef.current = onDragFrame;
  }, [onDragFrame]);

  const updatePointerX = useCallback((event) => {
    const point = getDragPointerClientPoint(event);
    if (point) pointerRef.current = point;
  }, []);

  const stopHorizontalDragAutoScroll = useCallback(() => {
    activeRef.current = false;
    scrollContainerRef.current = null;

    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", updatePointerX);
      window.removeEventListener("mousemove", updatePointerX);
      window.removeEventListener("touchmove", updatePointerX);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    }

    frameRef.current = null;
  }, [updatePointerX]);

  const clearDragPointer = useCallback(() => {
    pointerRef.current = null;
    hasAutoScrolledRef.current = false;
  }, []);

  const getLatestDragPointer = useCallback(() => pointerRef.current, []);

  const tickHorizontalDragAutoScroll = useCallback(function tick() {
    if (!activeRef.current || typeof window === "undefined") return;

    const scrollContainer = scrollContainerRef.current;
    const pointer = pointerRef.current;

    if (scrollContainer && typeof pointer?.x === "number") {
      const rect = scrollContainer.getBoundingClientRect();
      const speed = getHorizontalEdgeScrollSpeed(pointer.x, rect);
      const maxScrollLeft =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;

      if (speed !== 0 && maxScrollLeft > 0) {
        const currentScrollLeft = scrollContainer.scrollLeft;
        const nextScrollLeft = Math.min(
          maxScrollLeft,
          Math.max(0, currentScrollLeft + speed),
        );
        scrollContainer.scrollLeft = nextScrollLeft;
        if (nextScrollLeft !== currentScrollLeft) {
          hasAutoScrolledRef.current = true;
        }
      }
    }

    if (pointer) {
      onDragFrameRef.current?.(pointer, hasAutoScrolledRef.current);
    }

    frameRef.current = window.requestAnimationFrame(tick);
  }, []);

  const startHorizontalDragAutoScroll = useCallback(
    (node) => {
      if (typeof window === "undefined") return;

      stopHorizontalDragAutoScroll();
      clearDragPointer();

      const scrollContainer = getHorizontalScrollContainer(node);
      if (!scrollContainer) return;

      scrollContainerRef.current = scrollContainer;
      activeRef.current = true;

      window.addEventListener("pointermove", updatePointerX, { passive: true });
      window.addEventListener("mousemove", updatePointerX, { passive: true });
      window.addEventListener("touchmove", updatePointerX, { passive: true });

      frameRef.current = window.requestAnimationFrame(
        tickHorizontalDragAutoScroll,
      );
    },
    [
      clearDragPointer,
      stopHorizontalDragAutoScroll,
      tickHorizontalDragAutoScroll,
      updatePointerX,
    ],
  );

  useEffect(() => stopHorizontalDragAutoScroll, [stopHorizontalDragAutoScroll]);

  return {
    boardRef,
    clearDragPointer,
    getLatestDragPointer,
    startHorizontalDragAutoScroll,
    stopHorizontalDragAutoScroll,
  };
};

const getTaskAttachmentCount = (task) => {
  const candidates = [
    task?.total_attachment,
    task?.attachments_count,
    task?.files_count,
    task?.attachments,
  ];

  for (const raw of candidates) {
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
      return {
        total: summary.total + 1,
        completed:
          summary.completed +
          (isChecklistItemChecked(item) ? 1 : 0),
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

  // Only top-level checklist items contribute to card progress.
  return countChecklistItems(task?.checklist_items || task?.checklistItems || []);
};

const getTaskOrder = (task) => {
  const value = Number(task?.position ?? 0);
  return Number.isFinite(value) ? value : 0;
};

const sortTasksByReviewState = (tasks = []) =>
  [...(Array.isArray(tasks) ? tasks : [])].sort((a, b) => {
    // Keep approved task cards grouped at the bottom like checked checklist items.
    const aCompleted = getTaskReviewStatus(a) === TASK_REVIEW_STATUS.APPROVED ? 1 : 0;
    const bCompleted = getTaskReviewStatus(b) === TASK_REVIEW_STATUS.APPROVED ? 1 : 0;

    if (aCompleted !== bCompleted) return aCompleted - bCompleted;

    const positionDiff = getTaskOrder(a) - getTaskOrder(b);
    if (positionDiff !== 0) return positionDiff;

    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });

const normalizeBoard = (columns = []) => {
  const tasksById = {};
  const nextColumns = (columns || []).map((col) => {
    const rawTasks = col.tasks;
    const tasksUndefined = rawTasks == null;
    const taskIds = sortTasksByReviewState(rawTasks).map((t, index) => {
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
  const totalFromColumn = normalizeColumnTaskCount(
    column.tasks_count ?? column.tasksCount ?? column.task_count ?? column.taskCount,
  );
  if (totalFromColumn != null) return totalFromColumn;
  if (!column.tasksUndefined) return Array.isArray(column.taskIds) ? column.taskIds.length : 0;

  return null;
};

const isTaskCompleted = (task) => isTaskApproved(task);

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
  if (!assignee) return "";

  const assigneeAvatarRaw = pickFirstNonEmpty([
    assignee?.avatar,
  ]);

  return resolveUserAvatarWithFallback(
    assigneeAvatarRaw,
    assignee?.id ?? assignee?.email ?? assignee?.name ?? task?.id ?? "",
  );
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
  const reviewStatus = getTaskReviewStatus(task);
  const completed = isTaskCompleted(task);
  const checklistProgress = getTaskChecklistProgress(task);
  const hasDueTime = Boolean(getTaskDueValue(task));
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
        data-board-task-id={String(task.id)}
        className={`${isDragging ? "is-dragging" : ""} ${
          completed ? "task-completed" : ""
        } ${
          reviewStatus === TASK_REVIEW_STATUS.PENDING ? "task-review-pending" : ""
        } ${
          reviewStatus === TASK_REVIEW_STATUS.REJECTED ? "task-review-rejected" : ""
        } ${hasDueTime ? "task-has-due" : ""} ${overdue ? "task-overdue" : ""} ${
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
        taskPriority={task.priority}
        taskRating={task.rating}
        taskUserImg={resolveTaskAssigneeAvatar(task)}
        taskReviewStatus={reviewStatus}
        isCompleted={completed}
      />
    </div>
  );
});

const portalEl = typeof document !== "undefined" ? document.body : null;

const PortalDraggable = ({
  provided,
  snapshot,
  className = "",
  disableDropDisplacement = false,
  children,
}) => {
  const baseStyle = provided.draggableProps.style || {};
  const style = snapshot.isDragging
    ? { ...(provided.draggableProps.style || {}), zIndex: 999999 }
    : disableDropDisplacement
      ? {
          ...baseStyle,
          transform: "none",
          transition: "transform 180ms ease",
        }
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
  taskPagination,
  onLoadMoreTasks,
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
  manualTaskDropPreview,
  isManualTaskDropActive = false,
}) {
  const taskIds = column.taskIds || [];
  const columnTaskCount = getColumnTaskCount(column);
  const [contentNode, setContentNode] = useState(null);
  const loadMoreTriggerRef = useRef(null);
  const loadMoreRequestedPageRef = useRef(null);
  const manualPreviewColumnId = String(
    manualTaskDropPreview?.droppableId || "",
  ).replace(/^col-/, "");
  const manualPreviewTaskId =
    manualTaskDropPreview?.taskId != null
      ? String(manualTaskDropPreview.taskId)
      : "";
  const isManualDropTarget =
    Boolean(manualTaskDropPreview) &&
    String(column.id) === manualPreviewColumnId;
  const manualPreviewTaskIds = taskIds.filter(
    (taskId) => String(taskId) !== manualPreviewTaskId,
  );
  const manualPreviewIndex = isManualDropTarget
    ? Math.min(
        Math.max(Number(manualTaskDropPreview?.index ?? 0), 0),
        manualPreviewTaskIds.length,
      )
    : -1;
  const manualPreviewBeforeTaskId =
    manualPreviewIndex >= 0 && manualPreviewIndex < manualPreviewTaskIds.length
      ? String(manualPreviewTaskIds[manualPreviewIndex])
      : "";
  const shouldShowManualPreviewAtEnd =
    isManualDropTarget && manualPreviewIndex >= manualPreviewTaskIds.length;
  const manualPreviewHeight = Math.max(
    Number(manualTaskDropPreview?.height ?? 0),
    72,
  );
  const manualDropPreviewNode = isManualDropTarget ? (
    <div
      key={`manual-preview-${manualTaskDropPreview?.droppableId || ""}-${manualPreviewIndex}`}
      className="board-item-drop-preview"
      style={{
        "--board-drop-preview-height": `${manualPreviewHeight}px`,
      }}
      aria-hidden="true"
    />
  ) : null;
  const setColumnContentRef = useCallback(
    (node) => {
      setContentNode(node);
      if (typeof contentRef === "function") {
        contentRef(node);
      } else if (contentRef && typeof contentRef === "object") {
        contentRef.current = node;
      }
    },
    [contentRef],
  );
  const nextTaskPage = Number(taskPagination?.currentPage || 1) + 1;
  const canLoadMoreTasks =
    Boolean(taskPagination?.hasMore) &&
    !tasksLoading &&
    status !== "loading" &&
    !isDragging &&
    !isManualTaskDropActive;

  const requestMoreTasks = useCallback(() => {
    if (!canLoadMoreTasks) return;
    if (loadMoreRequestedPageRef.current === nextTaskPage) return;

    loadMoreRequestedPageRef.current = nextTaskPage;
    onLoadMoreTasks?.(column);
  }, [canLoadMoreTasks, column, nextTaskPage, onLoadMoreTasks]);

  useEffect(() => {
    if (!tasksLoading) {
      loadMoreRequestedPageRef.current = null;
    }
  }, [tasksLoading, taskIds.length]);

  useEffect(() => {
    if (!contentNode || !loadMoreTriggerRef.current || !canLoadMoreTasks) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          requestMoreTasks();
        }
      },
      {
        root: contentNode,
        rootMargin: "140px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => observer.disconnect();
  }, [
    canLoadMoreTasks,
    contentNode,
    requestMoreTasks,
    taskIds.length,
  ]);

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
      {(dropProvided, dropSnapshot) => {
        const suppressPackageDropState = isManualTaskDropActive;
        const isPackageDraggingOver =
          !suppressPackageDropState && dropSnapshot.isDraggingOver;

        return (
        <BoardColumn
          innerRef={innerRef}
          headerRef={null}
          dragHandleProps={dragHandleProps}
          color={column.color}
          className={`${isDragging ? "is-dragging" : ""} ${
            isPackageDraggingOver ? "is-over" : ""
          }`}
          columnTitle={column.title || column.name || "Column"}
          columnIcon={column.icon ?? column.iconClass ?? column.icon_code ?? null}
          taskCount={columnTaskCount}
          actions={column.actions}
          contentRef={setColumnContentRef}
          contentClassName={`${isPackageDraggingOver ? "is-over" : ""} ${
            isManualDropTarget ? "is-manual-drop-target" : ""
          }`}
          footer={footer}
          contentInnerRef={dropProvided.innerRef}
          contentProps={{
            ...dropProvided.droppableProps,
            "data-board-column-id": String(column.id),
          }}
          data-board-column-shell-id={String(column.id)}
          {...(draggableProps || {})}
        >
          {column.tasksUndefined ? (
            tasksLoading || status === "loading" ? (
              <div className="d-flex align-items-center justify-content-center py-3">
                <iconify-icon icon="line-md:loading-loop" />
              </div>
            ) : null
          ) : taskIds.length === 0 && !isManualDropTarget ? (
            <div className="d-flex align-items-center justify-content-center py-3 text-muted">
              No tasks yet
            </div>
          ) : (
            taskIds.map((taskId, index) => {
              const t = tasksById[String(taskId)];
              return (
                <React.Fragment key={String(taskId)}>
                  {manualPreviewBeforeTaskId === String(taskId)
                    ? manualDropPreviewNode
                    : null}
                  <Draggable draggableId={`task-${taskId}`} index={index}>
                    {(dragProvided, dragSnapshot) => (
                      <PortalDraggable
                        provided={dragProvided}
                        snapshot={dragSnapshot}
                        className={dragSnapshot.isDragging ? "board-drag-portal" : ""}
                        disableDropDisplacement={isManualTaskDropActive}
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
                </React.Fragment>
              );
            })
          )}

          {!column.tasksUndefined && taskPagination?.hasMore ? (
            <div
              ref={loadMoreTriggerRef}
              className="board-column-load-more"
            >
              {tasksLoading ? (
                <span className="board-column-load-more__status">
                  <iconify-icon icon="line-md:loading-loop" />
                </span>
              ) : (
                <button
                  type="button"
                  className="board-column-load-more__button"
                  onClick={requestMoreTasks}
                  disabled={!canLoadMoreTasks}
                >
                  Load more
                </button>
              )}
            </div>
          ) : null}

          {shouldShowManualPreviewAtEnd ? manualDropPreviewNode : null}
          {renderDropPlaceholder(
            dropProvided.placeholder,
            isManualTaskDropActive,
          )}
        </BoardColumn>
        );
      }}
    </Droppable>
  );
});

const ProjectBoardColumns = ({
  columns: columnsProp,
  status,
  tasksLoading = false,
  tasksLoadingByColumnId = {},
  taskPaginationByColumnId = {},
  onLoadMoreTasks,
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
  const draggedTaskIdRef = useRef(null);
  const draggedTaskHeightRef = useRef(0);
  const isTaskDragActiveRef = useRef(false);
  const manualTaskDropPreviewRef = useRef(null);
  const [manualTaskDropPreview, setManualTaskDropPreview] = useState(null);
  const [isManualTaskDropActive, setIsManualTaskDropActive] = useState(false);

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

  const syncManualTaskDropPreview = useCallback(
    (point) => {
      const draggedTaskId = draggedTaskIdRef.current;
      if (!draggedTaskId || !point) {
        updateManualTaskDropPreview(null);
        return;
      }

      const destination = getTaskDestinationFromPoint({
        point,
        draggedTaskId,
      });

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
    [updateManualTaskDropPreview],
  );

  const {
    boardRef,
    clearDragPointer,
    getLatestDragPointer,
    startHorizontalDragAutoScroll,
    stopHorizontalDragAutoScroll,
  } = useHorizontalDragAutoScroll(syncManualTaskDropPreview);

  const setManualTaskDropMode = useCallback(
    (isActive) => {
      isTaskDragActiveRef.current = isActive;
      setIsManualTaskDropActive(isActive);
      boardRef.current?.classList?.toggle(
        "is-manual-task-drop-active",
        isActive,
      );

      if (!isActive) {
        updateManualTaskDropPreview(null);
      }
    },
    [boardRef, updateManualTaskDropPreview],
  );

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

  const onBeforeCapture = useCallback(
    (before) => {
      const isTaskDrag = String(before?.draggableId || "").startsWith("task-");
      setManualTaskDropMode(isTaskDrag);
      updateManualTaskDropPreview(null);
    },
    [setManualTaskDropMode, updateManualTaskDropPreview],
  );

  const onDragStart = (start) => {
    isDraggingRef.current = true;
    if (start?.type === "TASK") {
      const draggedTaskId = String(start?.draggableId || "").replace(/^task-/, "");
      const draggedTaskElement =
        typeof document !== "undefined"
          ? [...document.querySelectorAll("[data-board-task-id]")].find(
              (element) =>
                String(element?.dataset?.boardTaskId ?? "") === draggedTaskId,
            )
          : null;

      setManualTaskDropMode(true);
      draggedTaskIdRef.current = draggedTaskId;
      draggedTaskHeightRef.current =
        draggedTaskElement?.getBoundingClientRect?.().height || 0;
      updateManualTaskDropPreview(null);
      startHorizontalDragAutoScroll(boardRef.current);
    } else {
      setManualTaskDropMode(false);
      draggedTaskIdRef.current = null;
      draggedTaskHeightRef.current = 0;
      updateManualTaskDropPreview(null);
      clearDragPointer();
    }
    snapshotRef.current = {
      ...board,
      columns: (board.columns || []).map((c) => ({ ...c, taskIds: [...(c.taskIds || [])] })),
      tasksById: { ...(board.tasksById || {}) },
    };
  };

  const onDragEnd = (result) => {
    const dragPointer = getLatestDragPointer();
    const shouldUsePointerDestination = Boolean(
      isTaskDragActiveRef.current && manualTaskDropPreviewRef.current,
    );
    stopHorizontalDragAutoScroll();
    clearDragPointer();
    setManualTaskDropMode(false);
    draggedTaskIdRef.current = null;
    draggedTaskHeightRef.current = 0;
    updateManualTaskDropPreview(null);
    isDraggingRef.current = false;
    const { destination, source, draggableId, type } = result || {};
    const pointerDestination =
      shouldUsePointerDestination &&
      type === "TASK" &&
      draggableId?.startsWith("task-")
        ? getTaskDestinationFromPoint({
            point: dragPointer,
            draggedTaskId: draggableId.slice(5),
          })
        : null;
    const effectiveDestination = pointerDestination || destination;

    if (!effectiveDestination) {
      if (snapshotRef.current) setBoard(snapshotRef.current);
      snapshotRef.current = null;
      return;
    }

    if (type === "COLUMN") {
      if (source.index === effectiveDestination.index) {
        snapshotRef.current = null;
        return;
      }

      const baseBoard = snapshotRef.current || board;
      const previousOrderedIds = (baseBoard.columns || []).map((col) => String(col.id));
      const nextColumns = arrayMove(
        baseBoard.columns || [],
        source.index,
        effectiveDestination.index,
      );
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
    const destColId = String(effectiveDestination.droppableId || "").replace(/^col-/, "");
    if (sourceColId === destColId && source.index === effectiveDestination.index) {
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
    destTasks.splice(effectiveDestination.index, 0, taskId);

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
    <DragDropContext
      onBeforeCapture={onBeforeCapture}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Droppable droppableId="board" direction="horizontal" type="COLUMN">
        {(boardDropProvided) => (
          <div
            ref={(node) => {
              boardRef.current = node;
              boardDropProvided.innerRef(node);
            }}
            {...boardDropProvided.droppableProps}
            className={`board ${
              isManualTaskDropActive ? "is-manual-task-drop-active" : ""
            }`}
          >
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
                      tasksLoading={
                        tasksLoading ||
                        Boolean(tasksLoadingByColumnId?.[String(col.id)])
                      }
                      taskPagination={taskPaginationByColumnId?.[String(col.id)]}
                      onLoadMoreTasks={onLoadMoreTasks}
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
                      manualTaskDropPreview={manualTaskDropPreview}
                      isManualTaskDropActive={isManualTaskDropActive}
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
