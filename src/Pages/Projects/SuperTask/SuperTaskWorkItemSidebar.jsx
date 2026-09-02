import React, { useEffect, useMemo, useState } from "react";
import Flatpickr from "react-flatpickr";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import TaskPriorityDropdown from "../../../Components/taskDetailModal/TaskPriorityDropdown";
import SuperTaskUserAvatar from "./SuperTaskUserAvatar";
import SuperTaskWorkItemTimer from "./SuperTaskWorkItemTimer";
import {
  formatDateTime,
  getContrastText,
  getMemberId,
  normalizeProjectMember,
} from "./superTask.utils";

const idsEqual = (left, right) => String(left) === String(right);

function MultiSelectDropdown({
  type,
  items,
  selectedItems,
  disabled,
  saving,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const isTags = type === "tags";
  const selectedIds = useMemo(
    () => selectedItems.map((item) => item?.id).filter((id) => id != null),
    [selectedItems],
  );

  const toggleItem = (item) => {
    if (disabled || saving || item?.id == null) return;
    const selected = selectedIds.some((id) => idsEqual(id, item.id));
    onChange(selected
      ? selectedIds.filter((id) => !idsEqual(id, item.id))
      : [...selectedIds, item.id]);
  };

  return (
    <Dropdown
      isOpen={open}
      toggle={() => {
        if (!disabled && !saving) setOpen((current) => !current);
      }}
      className="super-task-work-item-picker"
    >
      <DropdownToggle
        tag="button"
        type="button"
        disabled={disabled || saving}
        className="btn d-flex align-items-center justify-content-between px-0 w-100"
        style={{ boxShadow: "none" }}
      >
        <span className="d-flex align-items-center gap-2">
          <i className={`ti ${isTags ? "ti-tags" : "ti-bell"} fs-5`} aria-hidden="true" />
          {isTags ? "Tags" : "Watchers"}
        </span>
        <span className="super-task-work-item-picker__preview ms-auto me-2">
          {saving ? (
            <Spinner size="sm" />
          ) : selectedItems.length ? (
            <>
              {selectedItems.slice(0, 3).map((item) =>
                isTags ? (
                  <span
                    key={item.id}
                    className="super-task-work-item-picker__preview-tag"
                    style={{ background: item.color || "rgba(var(--primary), .65)" }}
                    title={item.name || "Tag"}
                  />
                ) : (
                  <SuperTaskUserAvatar key={item.id} user={item} size={24} />
                ),
              )}
              {selectedItems.length > 3 ? (
                <span className="super-task-work-item-picker__more">
                  +{selectedItems.length - 3}
                </span>
              ) : null}
            </>
          ) : (
            <span className="small text-muted">None</span>
          )}
        </span>
        <i className="ti ti-chevron-down" aria-hidden="true" />
      </DropdownToggle>

      <DropdownMenu end className="p-1 super-task-work-item-picker__menu">
        {items.length ? (
          items.map((item) => {
            const selected = selectedIds.some((id) => idsEqual(id, item.id));
            return (
              <DropdownItem
                key={item.id}
                toggle={false}
                disabled={saving}
                className={selected ? "is-selected" : ""}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleItem(item);
                }}
              >
                <span className="super-task-work-item-picker__option">
                  {isTags ? (
                    <span
                      className="super-task-work-item-picker__tag"
                      style={{
                        background: item.color || "rgba(var(--primary), .12)",
                        color: item.color
                          ? getContrastText(item.color)
                          : "rgba(var(--primary), 1)",
                      }}
                    >
                      {item.name || "Tag"}
                    </span>
                  ) : (
                    <>
                      <SuperTaskUserAvatar user={item} size={28} />
                      <span className="text-truncate">{item.name}</span>
                    </>
                  )}
                </span>
                {selected ? <i className="ti ti-check text-success" aria-hidden="true" /> : null}
              </DropdownItem>
            );
          })
        ) : (
          <div className="px-2 py-2 text-muted small">
            {isTags ? "No project tags." : "No project members."}
          </div>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}

export default function SuperTaskWorkItemSidebar({
  isActive,
  projectId,
  taskId,
  subTaskId,
  workItem,
  projectMembers = [],
  projectTags = [],
  savingField,
  onUpdate,
  onTrackerChanged,
}) {
  const [dueOpen, setDueOpen] = useState(false);
  const [dueDraft, setDueDraft] = useState(null);
  const canEdit = Boolean(workItem?.capabilities?.can_edit);
  const dueAt = workItem?.due_at || null;
  const isOverdue = Boolean(
    dueAt &&
      new Date(dueAt).getTime() < Date.now() &&
      workItem?.review_status !== "approved",
  );

  const members = useMemo(() => {
    const unique = new Map();
    (Array.isArray(projectMembers) ? projectMembers : []).forEach((member) => {
      const normalized = normalizeProjectMember(member);
      if (normalized.id != null) unique.set(String(normalized.id), normalized);
    });
    return Array.from(unique.values());
  }, [projectMembers]);

  const tags = Array.isArray(projectTags) ? projectTags : [];
  const selectedTags = Array.isArray(workItem?.tags) ? workItem.tags : [];
  const selectedWatchers = Array.isArray(workItem?.watchers)
    ? workItem.watchers.map(normalizeProjectMember)
    : [];

  useEffect(() => {
    if (!dueOpen) return;
    const parsed = dueAt ? new Date(dueAt) : new Date();
    setDueDraft(Number.isNaN(parsed.getTime()) ? new Date() : parsed);
  }, [dueAt, dueOpen]);

  const saveDueDate = async () => {
    if (!dueDraft || Number.isNaN(dueDraft.getTime())) return;
    const saved = await onUpdate("due_at", dueDraft.toISOString());
    if (saved) setDueOpen(false);
  };

  return (
    <div className="task-detail-modal__sidebar super-task-work-item-sidebar p-3 h-100">
      <div className="d-flex flex-column gap-3">
        <SuperTaskWorkItemTimer
          isActive={isActive}
          projectId={projectId}
          taskId={taskId}
          subTaskId={subTaskId}
          workItem={workItem}
          onChanged={onTrackerChanged}
        />

        <Dropdown
          isOpen={dueOpen}
          toggle={() => {
            if (canEdit && !savingField) setDueOpen((current) => !current);
          }}
        >
          <DropdownToggle
            tag="button"
            type="button"
            disabled={!canEdit || Boolean(savingField)}
            className={`btn d-flex align-items-center justify-content-between px-0 w-100 task-detail-due-toggle ${isOverdue ? "is-overdue" : ""}`}
            style={{ boxShadow: "none" }}
          >
            <span className="d-flex flex-column align-items-start min-w-0">
              <span className="d-flex align-items-center gap-2 task-detail-due-toggle__title">
                <i className="ti ti-calendar fs-5" aria-hidden="true" />
                Due time
                {isOverdue ? <span className="badge text-bg-danger">Overdue</span> : null}
              </span>
              <span className="small task-detail-due-toggle__value">
                {dueAt ? formatDateTime(dueAt) : "Set time"}
              </span>
            </span>
            {savingField === "due_at" ? <Spinner size="sm" /> : <i className="ti ti-chevron-down" aria-hidden="true" />}
          </DropdownToggle>

          <DropdownMenu
            end
            className="p-2"
            style={{ minWidth: 320 }}
            onClick={(event) => event.stopPropagation()}
          >
            <Flatpickr
              value={dueDraft}
              options={{
                inline: true,
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                allowInput: false,
              }}
              onChange={(selectedDates) => setDueDraft(selectedDates?.[0] ?? null)}
            />
            <div className="d-flex justify-content-between gap-2 mt-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                disabled={!dueAt || savingField === "due_at"}
                onClick={async () => {
                  const saved = await onUpdate("due_at", null);
                  if (saved) setDueOpen(false);
                }}
              >
                Clear
              </button>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  disabled={savingField === "due_at"}
                  onClick={() => setDueOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary text-white"
                  disabled={!dueDraft || savingField === "due_at"}
                  onClick={saveDueDate}
                >
                  {savingField === "due_at" ? <Spinner size="sm" /> : "Done"}
                </button>
              </div>
            </div>
          </DropdownMenu>
        </Dropdown>

        <TaskPriorityDropdown
          value={workItem?.priority}
          disabled={!canEdit || Boolean(savingField)}
          saving={savingField === "priority"}
          onChange={(value) => onUpdate("priority", value)}
        />

        <MultiSelectDropdown
          type="tags"
          items={tags}
          selectedItems={selectedTags}
          disabled={!canEdit || Boolean(savingField)}
          saving={savingField === "tag_ids"}
          onChange={(ids) => onUpdate("tag_ids", ids)}
        />

        <MultiSelectDropdown
          type="watchers"
          items={members.map((member) => ({
            ...member,
            id: getMemberId(member),
          }))}
          selectedItems={selectedWatchers}
          disabled={!canEdit || Boolean(savingField)}
          saving={savingField === "watcher_ids"}
          onChange={(ids) => onUpdate("watcher_ids", ids)}
        />

        <div className="super-task-work-item-sidebar__meta">
          <div>
            <span><i className="ti ti-square-check" aria-hidden="true" /> Created</span>
            <strong>{formatDateTime(workItem?.created_at)}</strong>
          </div>
          <div>
            <span><i className="ti ti-pencil" aria-hidden="true" /> Updated</span>
            <strong>{formatDateTime(workItem?.updated_at)}</strong>
          </div>
          <div>
            <span><i className="ti ti-hash" aria-hidden="true" /> Work Item ID</span>
            <strong>{workItem?.id ?? "—"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
