import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { reorderSubTasks } from "../../../api/superTask";
import { toastError } from "../../../utils/sweetAlert";
import SuperTaskSubTaskRow from "./SuperTaskSubTaskRow";
import { REVIEW_STATUS } from "./superTask.utils";
import "./superTaskReorder.css";

const moveItem = (items, sourceIndex, destinationIndex) => {
  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(destinationIndex, 0, moved);
  return next;
};

const approvedLast = (items) => [
  ...items.filter((item) => item?.review_status !== REVIEW_STATUS.APPROVED),
  ...items.filter((item) => item?.review_status === REVIEW_STATUS.APPROVED),
];

export default function SuperTaskSubTaskList({
  items = [],
  childrenLoading = false,
  projectId,
  taskId,
  canReorder = false,
  reorderDisabled = false,
  onOpen,
  onDelete,
  deletingId = null,
}) {
  const normalizedItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items],
  );
  const [orderedItems, setOrderedItems] = useState(normalizedItems);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    setOrderedItems(normalizedItems);
  }, [normalizedItems]);

  const dragDisabled =
    !canReorder ||
    reorderDisabled ||
    savingOrder ||
    deletingId != null ||
    orderedItems.length < 2;

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result || {};
    if (
      dragDisabled ||
      !destination ||
      type !== "SUPER_TASK_SUB_TASK" ||
      source.index === destination.index
    ) {
      return;
    }

    const previous = orderedItems;
    const next = approvedLast(
      moveItem(previous, source.index, destination.index),
    );

    if (
      previous.every(
        (item, index) => String(item?.id) === String(next[index]?.id),
      )
    ) {
      return;
    }

    setOrderedItems(next);
    setSavingOrder(true);

    try {
      await reorderSubTasks(
        projectId,
        taskId,
        next.map((item) => item.id),
      );
    } catch (error) {
      setOrderedItems(previous);
      toastError(error?.message || "Reorder Sub-tasks failed");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId={`super-task-sub-tasks-${taskId}`}
        type="SUPER_TASK_SUB_TASK"
        direction="vertical"
      >
        {(dropProvided) => (
          <div
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className="super-task-subtask-list"
          >
            {childrenLoading && !orderedItems.length ? (
              <div className="super-task-empty-inline">
                <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                Loading Sub-tasks...
              </div>
            ) : null}

            {!childrenLoading && !orderedItems.length ? (
              <div className="super-task-empty-inline">
                <i className="ti ti-subtask" aria-hidden="true" />
                No Sub-tasks match this view.
              </div>
            ) : null}

            {orderedItems.map((item, index) => {
              const itemDragDisabled =
                dragDisabled || item?.review_status === REVIEW_STATUS.APPROVED;

              return (
                <Draggable
                  key={item.id}
                  draggableId={`super-task-sub-task-${item.id}`}
                  index={index}
                  isDragDisabled={itemDragDisabled}
                >
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={`super-task-sortable-item ${
                        itemDragDisabled ? "is-disabled" : "is-reorderable"
                      } ${dragSnapshot.isDragging ? "is-dragging" : ""}`}
                    >
                      <SuperTaskSubTaskRow
                        item={item}
                        onOpen={onOpen}
                        onDelete={onDelete}
                        deleting={deletingId != null}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}

            {dropProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
