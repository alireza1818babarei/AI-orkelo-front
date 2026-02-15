import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  getProjectTagsThunk,
  getTaskTagsThunk,
  toggleTaskTagThunk,
} from "../../store/tags/tagsSlice";
import { toastError } from "../../utils/sweetAlert";
import TaskTagsManagerModal from "./TaskTagsManagerModal";

const getTagLabel = (tag) =>
  tag?.name ?? tag?.title ?? tag?.label ?? tag?.text ?? `Tag ${tag?.id ?? ""}`;

const getTagKey = (tag) => String(tag?.id ?? tag?.tag_id ?? tag?.uuid ?? "");

export default function TaskTagsDropdown({
  projectId,
  taskId,
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

  const taskTags =
    tagsState?.taskProjectId != null &&
    tagsState?.taskId != null &&
    String(tagsState.taskProjectId) === String(projectId) &&
    String(tagsState.taskId) === String(taskId)
      ? tagsState?.taskItems || []
      : [];

  const tagIds = useMemo(
    () => new Set((taskTags || []).map((t) => getTagKey(t)).filter(Boolean)),
    [taskTags],
  );

  const loading =
    (open && tagsState?.status === "loading") ||
    (open && tagsState?.taskStatus === "loading");

  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    if (projectId) dispatch(getProjectTagsThunk(projectId));
    if (projectId && taskId) dispatch(getTaskTagsThunk({ projectId, taskId }));
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
    const key = String(tagId);
    const wasAssigned = tagIds.has(key);

    try {
      const res = await dispatch(toggleTaskTagThunk({ projectId, taskId, tagId })).unwrap();

      const next =
        Array.isArray(res?.tags)
          ? res.tags
          : wasAssigned
            ? (taskTags || []).filter((t) => getTagKey(t) !== key)
            : [...(taskTags || []), tag];

      onChanged?.(next);
      setOpen(false);
    } catch (err) {
      const msg = err?.message || err?.data?.message || "Toggle tag failed";
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
            items.map((t, idx) => {
              const label = getTagLabel(t);
              return (
                <DropdownItem
                  key={t?.id ?? `${label}-${idx}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectTag(t);
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <span className="text-truncate">{label}</span>
                    {t?.color ? (
                      <span
                        className="d-inline-block rounded-circle"
                        style={{
                          width: 10,
                          height: 10,
                          background: String(t.color),
                          flex: "0 0 auto",
                        }}
                      />
                    ) : null}
                  </div>
                </DropdownItem>
              );
            })
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
          if (projectId && taskId) dispatch(getTaskTagsThunk({ projectId, taskId }));
        }}
      />
    </>
  );
}

