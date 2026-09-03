import React, { useRef, useState } from "react";
import ActionDropdown from "../../../Components/ActionDropdown";

export default function SuperTaskDeleteMenu({
  itemLabel,
  onDelete,
  disabled = false,
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const label = String(itemLabel || "item").trim();

  return (
    <div
      ref={rootRef}
      className="position-relative super-task-row-action-menu"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="super-task-icon-button"
        disabled={disabled}
        aria-label={`More actions for ${label}`}
        title="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <i className="ti ti-dots" aria-hidden="true" />
      </button>
      <ActionDropdown
        open={open}
        onToggle={setOpen}
        rootRef={rootRef}
        portal
        width={160}
        actions={[
          {
            key: "delete",
            label: "Delete",
            icon: "ti-trash",
            destructive: true,
            disabled,
            onClick: onDelete,
          },
        ]}
      />
    </div>
  );
}
