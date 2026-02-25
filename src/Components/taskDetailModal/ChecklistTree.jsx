import React from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

const CHECKLIST_DROPPABLE_PREFIX = "checklist-parent:";

const normalizeChecklistParentId = (value) => {
  if (value == null || value === "" || value === "root") return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : value;
};

const buildChecklistDroppableId = (parentId) =>
  `${CHECKLIST_DROPPABLE_PREFIX}${parentId == null ? "root" : parentId}`;

const parseChecklistParentId = (droppableId) => {
  if (
    typeof droppableId !== "string" ||
    !droppableId.startsWith(CHECKLIST_DROPPABLE_PREFIX)
  ) {
    return null;
  }
  return normalizeChecklistParentId(
    droppableId.slice(CHECKLIST_DROPPABLE_PREFIX.length),
  );
};

const isSaveCombo = (e) => e.key === "Enter" && !e.shiftKey;
const getChecklistItemIdentity = (item, index, parentId = null) =>
  String(
    item?.id ??
      `${parentId ?? "root"}-${index}`,
  );

const ChecklistTree = ({
  items = [],
  checklistBusyId,
  subInputById,
  setSubInputById,
  skipSubBlurByIdRef,
  hoveredChecklistId,
  setHoveredChecklistId,
  onToggleChecklistItem,
  onUpdateChecklistText,
  onDeleteChecklistItem,
  onCreateChecklistItem,
  onChangeItemText,
  onReorderChecklist,
}) => {
  const handleDragEnd = (result) => {
    const { source, destination, type } = result || {};
    if (!destination || type !== "CHECKLIST") return;

    // Reorder only in same sibling list (up/down in current level).
    if (source.droppableId !== destination.droppableId) return;
    if (source.index === destination.index) return;

    const parentId = parseChecklistParentId(source.droppableId);
    // Only top-level checklist items are draggable.
    if (parentId != null) return;
    onReorderChecklist?.(parentId, source.index, destination.index);
  };

  const renderChecklistItem = (
    item,
    index,
    depth,
    parentCompleted,
    dragProvided = null,
    dragSnapshot = null,
    itemIdentity = null,
  ) => {
    const isCompleted = parentCompleted || !!item.is_completed;
    const isItemBusy = checklistBusyId === item.id;
    const dragStyle = dragProvided?.draggableProps?.style || undefined;
    const draggableClass = dragSnapshot?.isDragging ? "shadow-sm bg-white" : "";

    return (
      <div
        key={`checklist-item-${itemIdentity ?? getChecklistItemIdentity(item, index)}`}
        ref={dragProvided?.innerRef}
        {...(dragProvided?.draggableProps || {})}
        {...(dragProvided?.dragHandleProps || {})}
        style={dragProvided ? { ...(dragStyle || {}), cursor: checklistBusyId ? "default" : "grab" } : undefined}
        className={`mb-2 ${
          depth === 0 ? "border rounded-3 p-2" : ""
        } ${
          item.is_completed && depth === 0
            ? "border border-success"
            : ""
        } ${draggableClass}`}
      >
        <div
          className={`d-flex align-items-start gap-2 ps-3${
            depth ? "ps-6" : ""
          }`}
          style={depth ? { marginLeft: 8 } : undefined}
          onMouseEnter={() => setHoveredChecklistId(item.id)}
          onMouseLeave={() => setHoveredChecklistId(null)}
        >
          {depth > 0 ? (
            <span className="d-inline-flex align-items-center justify-content-center mt-1 text-muted small">
              {index + 1}.
            </span>
          ) : null}

          {depth === 0 ? (
            <input
              type="checkbox"
              className="form-check-input mt-1"
              checked={!!item.is_completed}
              onChange={(e) =>
                onToggleChecklistItem?.(item, e.target.checked)
              }
              disabled={isItemBusy}
            />
          ) : null}

          <div className="flex-grow-1">
            <textarea
              className={`form-control border-0 shadow-none px-0 py-0 small checklist-textarea ${
                isCompleted ? "text-decoration-line-through text-muted" : ""
              }`}
              rows="1"
              value={item.text ?? ""}
              onChange={(e) =>
                onChangeItemText?.(item.id, e.target.value)
              }
              onBlur={(e) =>
                onUpdateChecklistText?.(item, e.target.value)
              }
              onKeyDown={(e) => {
                if (isSaveCombo(e)) {
                  e.preventDefault();
                  onUpdateChecklistText?.(item, e.currentTarget.value);
                  e.currentTarget.blur();
                }
              }}
              onInput={(e) => {
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              style={{ resize: "none", overflow: "hidden", height: "auto" }}
              disabled={isItemBusy}
            />
          </div>

          <button
            type="button"
            className="btn icon-btn b-r-100 text-muted"
            onClick={() => onDeleteChecklistItem?.(item)}
            disabled={isItemBusy}
            style={{
              opacity: hoveredChecklistId === item.id ? 1 : 0,
              transition: "opacity 120ms ease",
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {item.children?.length ? (
          <div className="mt-2">
            {renderChecklist(item.children, depth + 1, isCompleted, item.id)}
          </div>
        ) : null}

        {depth === 0 ? (
          <div className="mt-2 ps-3">
            <button
              type="button"
              className="btn px-0 text-info small f-s-12"
              onClick={() =>
                setSubInputById((prev) => ({
                  ...prev,
                  [item.id]: prev[item.id] ?? "",
                }))
              }
            >
              Add sub item
            </button>
            {subInputById[item.id] !== undefined ? (
              <div className="mt-1">
                <textarea
                  className="form-control autogrow-textarea"
                  rows="1"
                  placeholder="Write a sub item..."
                  value={subInputById[item.id] || ""}
                  onChange={(e) =>
                    setSubInputById((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  onBlur={async () => {
                    if (skipSubBlurByIdRef.current?.[item.id]) {
                      delete skipSubBlurByIdRef.current[item.id];
                      return;
                    }
                    const text = (subInputById[item.id] || "").trim();
                    if (text) {
                      await onCreateChecklistItem?.({
                        text,
                        parentId: item.id,
                      });
                    }
                    setSubInputById((prev) => {
                      const next = { ...prev };
                      delete next[item.id];
                      return next;
                    });
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      skipSubBlurByIdRef.current[item.id] = true;
                      const text = (subInputById[item.id] || "").trim();
                      if (text) {
                        await onCreateChecklistItem?.({
                          text,
                          parentId: item.id,
                        });
                      }
                      setSubInputById((prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      });
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      skipSubBlurByIdRef.current[item.id] = true;
                      setSubInputById((prev) => {
                        const next = { ...prev };
                        delete next[item.id];
                        return next;
                      });
                    }
                  }}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                  style={{ resize: "none", overflow: "hidden", height: "auto" }}
                  autoFocus
                  disabled={isItemBusy}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  const renderChecklist = (
    list,
    depth = 0,
    parentCompleted = false,
    parentId = null,
  ) => {
    const siblingItems = list || [];

    if (depth > 0 || parentId != null) {
      return (
        <div>
          {siblingItems.map((item, index) => {
            const itemIdentity = getChecklistItemIdentity(item, index, parentId);
            return renderChecklistItem(
              item,
              index,
              depth,
              parentCompleted,
              null,
              null,
              itemIdentity,
            );
          })}
        </div>
      );
    }

    const droppableId = buildChecklistDroppableId(null);
    return (
      <Droppable droppableId={droppableId} type="CHECKLIST" direction="vertical">
        {(dropProvided) => (
          <div ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
            {siblingItems.map((item, index) => {
              const itemIdentity = getChecklistItemIdentity(item, index, null);
              return (
                <Draggable
                  key={`checklist-${itemIdentity}`}
                  draggableId={`checklist-${itemIdentity}`}
                  index={index}
                  isDragDisabled={!!checklistBusyId}
                >
                  {(dragProvided, dragSnapshot) =>
                    renderChecklistItem(
                      item,
                      index,
                      depth,
                      parentCompleted,
                      dragProvided,
                      dragSnapshot,
                      itemIdentity,
                    )
                  }
                </Draggable>
              );
            })}
            {dropProvided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return <DragDropContext onDragEnd={handleDragEnd}>{renderChecklist(items)}</DragDropContext>;
};

export default ChecklistTree;
