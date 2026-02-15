import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getProjectTagsThunk,
  deleteTaskTagThunk,
  toggleTaskTagThunk,
} from "../../store/tags/tagsSlice";
import { toastError } from "../../utils/sweetAlert";
import TaskTagsManagerModal from "./TaskTagsManagerModal";

const getTagLabel = (tag) =>
  tag?.name ?? tag?.title ?? tag?.label ?? tag?.text ?? `Tag ${tag?.id ?? ""}`;

const getTagKey = (tag) => String(tag?.id ?? tag?.tag_id ?? tag?.uuid ?? "");

const getContrastText = (hex) => {
  const raw = String(hex || "").trim();
  if (!raw) return "#111";
  const m = raw.startsWith("#") ? raw.slice(1) : raw;
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return "#fff";
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // perceived luminance
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y >= 170 ? "#111" : "#fff";
};

export default function TaskTagsDropdown({
  projectId,
  taskId,
  selectedTags = [],
  disabled = false,
  onSelect,
  onChanged,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  const tagsState = useSelector((s) => s.tags);

  const projectTags =
    tagsState?.projectId != null && String(tagsState.projectId) === String(projectId)
      ? tagsState?.items || []
      : [];

  const tagIds = useMemo(
    () => new Set((selectedTags || []).map((t) => getTagKey(t)).filter(Boolean)),
    [selectedTags],
  );

  const loading = open && tagsState?.status === "loading";

  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    if (projectId) dispatch(getProjectTagsThunk(projectId));
  }, [open, dispatch, projectId, taskId]);

  const items = useMemo(() => projectTags || [], [projectTags]);

  const handleSelectTag = async (tag) => {
    if (!projectId) return;

    if (!taskId) {
      onSelect?.(tag);
      setOpen(false);
      return;
    }

    const tagId = tag?.id ?? tag?.tag_id ?? null;
    if (tagId == null) return;
    const tagProjectId = tag?.project_id ?? tag?.projectId ?? null;
    if (tagProjectId != null && String(tagProjectId) !== String(projectId)) {
      toastError("This tag belongs to another project.");
      return;
    }
    const key = String(tagId);
    const wasAssigned = tagIds.has(key);

    try {
      const res = wasAssigned
        ? await dispatch(deleteTaskTagThunk({ projectId, taskId, tagId })).unwrap()
        : await dispatch(toggleTaskTagThunk({ projectId, taskId, tagId })).unwrap();

      const next =
        Array.isArray(res?.tags)
          ? res.tags
          : wasAssigned
            ? (selectedTags || []).filter((t) => getTagKey(t) !== key)
            : [...(selectedTags || []), tag];

      onChanged?.(next);
      setOpen(false);
    } catch (err) {
      const msg =
        (typeof err === "string" ? err : null) ||
        err?.message ||
        err?.data?.message ||
        "Toggle tag failed";
      toastError(msg);
    }
  };

  return (
    <>
      <Dropdown isOpen={open} toggle={toggle}>
        <DropdownToggle
          tag="button"
          type="button"
          disabled={disabled}
          className="btn d-flex align-items-center justify-content-between px-0 border-bottom w-100"
        >
          <span className="d-flex align-items-center gap-2">
            <i className="ti ti-tag fs-5"></i>
            Tags
          </span>
          <i className="ti ti-chevron-down"></i>
        </DropdownToggle>
        <DropdownMenu end className="p-1" style={{ minWidth: 260 }}>
          {loading ? (
            <div className="d-flex align-items-center gap-2 px-2 py-2 text-muted small">
              <Spinner size="sm" color="primary" />
              <span>Loading...</span>
            </div>
          ) : items.length ? (
            <div className="d-flex flex-wrap align-items-center justify-content-start gap-2 px-2 py-2">
              {items.map((t, idx) => {
                const label = getTagLabel(t);
                const key = getTagKey(t);
                const assigned = key ? tagIds.has(String(key)) : false;
                const color = String(t?.color || "").trim();
                const badgeText = getContrastText(color);

                return (
                  <button
                    key={t?.id ?? `${label}-${idx}`}
                    type="button"
                    className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-2 ${
                      assigned ? "border border-2" : "border"
                    }`}
                    style={{
                      background: color || "rgba(var(--secondary), 0.06)",
                      color: color ? badgeText : "rgba(var(--dark), 0.8)",
                      borderColor: assigned
                        ? "rgba(var(--primary), 0.55)"
                        : "rgba(var(--secondary), 0.18)",
                      maxWidth: 240,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectTag(t);
                    }}
                    title={label}
                    aria-pressed={assigned}
                  >
                    {assigned ? <i className="ti ti-check" /> : null}
                    <span className="text-truncate" style={{ maxWidth: 200 }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-2 py-2 text-muted small">No tags.</div>
          )}

          <DropdownItem divider />
          <DropdownItem
            onClick={() => {
              setOpen(false);
              setManageOpen(true);
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <span className="d-inline-flex align-items-center gap-2">
                <i className="ti ti-settings fs-5"></i>
                Manage
              </span>
              <i className="ti ti-chevron-right"></i>
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <TaskTagsManagerModal
        projectId={projectId}
        isOpen={manageOpen}
        toggle={() => setManageOpen(false)}
        onChanged={() => {
          if (projectId) dispatch(getProjectTagsThunk(projectId));
        }}
      />
    </>
  );
}
