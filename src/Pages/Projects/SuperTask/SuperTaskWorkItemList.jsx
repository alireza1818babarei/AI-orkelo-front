import React from "react";
import SuperTaskWorkItemCard from "./SuperTaskWorkItemCard";

export default function SuperTaskWorkItemList({ items = [], onOpen }) {
  const workItems = Array.isArray(items) ? items : [];

  if (!workItems.length) {
    return (
      <div className="super-task-work-items-empty">
        <i className="ti ti-list-check" aria-hidden="true" />
        No Work Items yet.
      </div>
    );
  }

  return (
    <div className="super-task-modal-work-items">
      {workItems.map((item) => (
        <SuperTaskWorkItemCard key={item.id} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}
