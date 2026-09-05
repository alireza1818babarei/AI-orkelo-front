import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useParams } from "react-router-dom";
import { reorderWorkItems } from "../../../api/superTask";
import { toastError } from "../../../utils/sweetAlert";
import SuperTaskWorkItemCard from "./SuperTaskWorkItemCard";
import "./superTaskReorder.css";

const moveItem = (items, sourceIndex, destinationIndex) => {
  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(destinationIndex, 0, moved);
  return next;
};

export default function SuperTaskWorkItemList({
  items = [],
  projectId: projectIdProp = null,
  taskId: taskIdProp = null,
  subTaskId: subTaskIdProp = null,
  canReorder: canReorderProp = null,
  reorderDisabled = false,
  onOpen,
  onDelete,
  deletingId = null,
}) {
  const routeParams = useParams();
  const normalizedItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items],
  );
  const [orderedItems, setOrderedItems] = useState(normalizedItems);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    setOrderedItems(normalizedItems);
  }, [normalizedItems]);

  const projectId = projectIdProp ?? routeParams.projectId;
  const taskId = taskIdProp ?? routeParams.taskId;
  const subTaskId = subTaskIdProp ?? normalizedItems[0]?.parent_id ?? null;
  const canReorder =
    canReorderProp == null
      ? normalizedItems.some((item) => item?.capabilities?.can_reorder === true)
      : canReorderProp;

  const dragDisabled =
    !projectId ||
    !taskId ||
    !subTaskId ||
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
      type !== "SUPER_TASK_WORK_ITEM" ||
      source.index === destination.index
    ) {
      return;
    }

    const previous = orderedItems;
    const next = moveItem(previous, source.index, destination.index);
    setOrderedItems(next);
    setSavingOrder(true);

    try {
      await reorderWorkItems(
        projectId,
        taskId,
        subTaskId,
        next.map((item) => item.id),
      );
    } catch (error) {
      setOrderedItems(previous);
      toastError(error?.message || "Reorder Work Items failed");
    } finally {
      setSavingOrder(false);
    }
  };

  if (!orderedItems.length) {
    return (
      <div className="super-task-work-items-empty">
        <i className="ti ti-list-check" aria-hidden="true" />
        No Work Items yet.
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId={`super-task-work-items-${subTaskId ?? "unknown"}`}
        type="SUPER_TASK_WORK_ITEM"
        direction="vertical"
      >
        {(dropProvided) => (
          <div
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            className="super-task-modal-work-items"
          >
            {orderedItems.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={`super-task-work-item-${item.id}`}
                index={index}
                isDragDisabled={dragDisabled}
              >
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={`super-task-sortable-item ${
                      dragDisabled ? "is-disabled" : "is-reorderable"
                    } ${dragSnapshot.isDragging ? "is-dragging" : ""}`}
                  >
                    <SuperTaskWorkItemCard
                      item={item}
                      onOpen={onOpen}
                      onDelete={onDelete}
                      deleting={deletingId != null}
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
}
