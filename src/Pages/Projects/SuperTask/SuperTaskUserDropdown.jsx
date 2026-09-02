import React, { useMemo, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import SuperTaskUserAvatar from "./SuperTaskUserAvatar";
import { getMemberId, normalizeProjectMember } from "./superTask.utils";

const EMPTY_USERS = [];

export default function SuperTaskUserDropdown({
  users = EMPTY_USERS,
  selectedUser = null,
  selectedUserId = null,
  onChange,
  disabled = false,
  saving = false,
  allowUnassigned = true,
  emptyLabel = "Assign to",
  selectedLabel = null,
  secondaryText = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const uniqueUsers = new Map();
    (Array.isArray(users) ? users : []).forEach((member) => {
      const normalized = normalizeProjectMember(member);
      if (normalized.id == null) return;
      uniqueUsers.set(String(normalized.id), normalized);
    });
    return Array.from(uniqueUsers.values());
  }, [users]);

  const activeId = String(selectedUserId ?? getMemberId(selectedUser) ?? "");
  const activeUser =
    items.find((user) => String(user.id) === activeId) ||
    (selectedUser ? normalizeProjectMember(selectedUser) : null);

  const handleSelect = async (user) => {
    if (disabled || saving) return;
    setOpen(false);
    try {
      await onChange?.(user?.id ?? null, user ?? null);
    } catch {
      // The feature owner handles API errors and keeps this presentation component reusable.
    }
  };

  return (
    <Dropdown
      isOpen={open}
      toggle={() => {
        if (!disabled && !saving) setOpen((current) => !current);
      }}
      className={`super-task-user-dropdown ${className}`.trim()}
    >
      <DropdownToggle
        tag="button"
        type="button"
        disabled={disabled || saving}
        className="btn super-task-user-dropdown__toggle"
      >
        {activeUser ? (
          <SuperTaskUserAvatar user={activeUser} size={30} />
        ) : (
          <span className="super-task-user-dropdown__empty-avatar" aria-hidden="true">
            <i className="ti ti-user-plus" />
          </span>
        )}
        <span className="super-task-user-dropdown__label">
          <span>
            {activeUser
              ? selectedLabel || `Assigned to ${activeUser.name}`
              : emptyLabel}
          </span>
          {activeUser && secondaryText ? (
            <small>{secondaryText}</small>
          ) : null}
        </span>
        {saving ? (
          <Spinner size="sm" color="primary" />
        ) : (
          <i className="ti ti-chevron-down" aria-hidden="true" />
        )}
      </DropdownToggle>

      <DropdownMenu end className="super-task-user-dropdown__menu p-1">
        {allowUnassigned ? (
          <>
            <DropdownItem
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                handleSelect(null);
              }}
              disabled={saving}
              className={!activeId ? "is-selected" : ""}
            >
              <span className="super-task-user-dropdown__option-copy">
                <span className="super-task-user-dropdown__empty-avatar" aria-hidden="true">
                  <i className="ti ti-user-off" />
                </span>
                <span>Unassigned</span>
              </span>
              {!activeId ? <i className="ti ti-check text-success" /> : null}
            </DropdownItem>
            <DropdownItem divider />
          </>
        ) : null}

        {items.length ? (
          items.map((user) => {
            const selected = String(user.id) === activeId;
            return (
              <DropdownItem
                key={user.id}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleSelect(user);
                }}
                disabled={saving}
                className={selected ? "is-selected" : ""}
              >
                <span className="super-task-user-dropdown__option-copy">
                  <SuperTaskUserAvatar user={user} size={30} />
                  <span className="text-truncate">{user.name}</span>
                </span>
                {selected ? (
                  <i className="ti ti-check text-success" />
                ) : (
                  <span className="super-task-user-dropdown__assign-label">Assign</span>
                )}
              </DropdownItem>
            );
          })
        ) : (
          <div className="px-2 py-2 text-muted small">No project members.</div>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
