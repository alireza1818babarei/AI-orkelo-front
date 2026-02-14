import React, { useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

export default function TaskWatchersDropdown({ disabled = false }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  return (
    <Dropdown isOpen={open} toggle={toggle}>
      <DropdownToggle
        tag="button"
        type="button"
        disabled={disabled}
        className="btn d-flex align-items-center justify-content-between px-0 w-100"
      >
        <span className="d-flex align-items-center gap-2">
          <i className="ti ti-eye fs-5"></i>
          Watchers
        </span>
        <i className="ti ti-chevron-down"></i>
      </DropdownToggle>

      <DropdownMenu end className="p-1" style={{ minWidth: 260 }}>
        <DropdownItem disabled>
          <div className="text-muted small">Coming soon</div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
