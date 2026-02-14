import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import api from "../../api/axios";
import { toastError } from "../../utils/sweetAlert";
import TaskTagsManagerModal from "./TaskTagsManagerModal";

const getTagLabel = (tag) =>
  tag?.name ?? tag?.title ?? tag?.label ?? tag?.text ?? `Tag ${tag?.id ?? ""}`;

const normalizeTags = (payload) => {
  const items = payload?.data ?? payload ?? [];
  return Array.isArray(items) ? items : [];
};

export default function TaskTagsDropdown({
  projectId,
  disabled = false,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [manageOpen, setManageOpen] = useState(false);

  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  const fetchTags = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/tags`);
      setTags(normalizeTags(res?.data));
    } catch (err) {
      toastError(err?.message || "Load tags failed");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!open) return;
    fetchTags();
  }, [open, fetchTags]);

  useEffect(() => {
    setTags([]);
  }, [projectId]);

  const items = useMemo(() => tags || [], [tags]);

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
            <div className="px-2 py-2 text-muted small">Loading...</div>
          ) : items.length ? (
            items.map((t, idx) => {
              const label = getTagLabel(t);
              return (
                <DropdownItem
                  key={t?.id ?? `${label}-${idx}`}
                  onClick={() => {
                    onSelect?.(t);
                    setOpen(false);
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
          if (open) fetchTags();
        }}
      />
    </>
  );
}
