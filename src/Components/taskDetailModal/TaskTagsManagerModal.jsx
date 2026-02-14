import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from "reactstrap";
import api from "../../api/axios";
import { alertSuccess, toastError } from "../../utils/sweetAlert";

const getTagLabel = (tag) =>
  tag?.name ?? tag?.title ?? tag?.label ?? tag?.text ?? `Tag ${tag?.id ?? ""}`;

const normalizeTags = (payload) => {
  const items = payload?.data ?? payload ?? [];
  return Array.isArray(items) ? items : [];
};

const PRESET_COLORS = [
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#06B6D4", // cyan
  "#10B981", // green
  "#84CC16", // lime
  "#F59E0B", // amber
  "#F97316", // orange
  "#EF4444", // red
  "#EC4899", // pink
  "#6B7280", // gray
];

export default function TaskTagsManagerModal({
  projectId,
  isOpen,
  toggle,
  onChanged,
}) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);

  const [adding, setAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

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
    if (!isOpen) return;
    fetchTags();
  }, [isOpen, fetchTags]);

  useEffect(() => {
    if (!isOpen) return;
    setAdding(false);
    setNewTagName("");
    setNewTagColor(PRESET_COLORS[0]);
  }, [isOpen]);

  const items = useMemo(() => tags || [], [tags]);

  const createTag = async () => {
    if (!projectId) return;
    const name = newTagName.trim();
    if (!name) return;
    try {
      setSaving(true);
      const payload = { name };
      if (newTagColor) payload.color = newTagColor;
      const res = await api.post(`/projects/${projectId}/tags`, payload);
      const created = res?.data?.data ?? res?.data ?? null;
      if (created) {
        setTags((prev) => [created, ...(prev || [])]);
      } else {
        await fetchTags();
      }
      alertSuccess();
      setNewTagName("");
      setAdding(false);
      setNewTagColor(PRESET_COLORS[0]);
      onChanged?.();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Create tag failed";
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteTag = async (tag) => {
    const tagId = tag?.id ?? null;
    if (!projectId || !tagId) return;
    try {
      setSaving(true);
      await api.delete(`/projects/${projectId}/tags/${tagId}`);
      setTags((prev) => (prev || []).filter((t) => String(t?.id) !== String(tagId)));
      alertSuccess();
      onChanged?.();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Delete tag failed";
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader toggle={toggle} className="py-3">
        Project Settings
      </ModalHeader>
      <ModalBody className="pt-0">
        <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
          <div className="fw-semibold text-primary">Tags</div>
        </div>

        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <Spinner size="sm" />
            <span>Loading tags...</span>
          </div>
        ) : items.length ? (
          <div className="d-flex flex-column gap-2">
            {items.map((t, idx) => {
              const label = getTagLabel(t);
              const color = String(t?.color || "").trim();
              return (
                <div
                  key={t?.id ?? `${label}-${idx}`}
                  className="bg-light rounded-pill px-3 py-2 d-flex align-items-center justify-content-between gap-2"
                >
                  <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                    <span
                      className="d-flex-center rounded-circle bg-white"
                      style={{
                        width: 34,
                        height: 34,
                        border: color ? `2px solid ${color}` : "1px solid rgba(0,0,0,0.1)",
                        flex: "0 0 auto",
                      }}
                    >
                      <i className="ti ti-tag fs-5"></i>
                    </span>
                    <span className="text-truncate">{label}</span>
                  </div>

                  <Button
                    type="button"
                    color="link"
                    className="p-0 text-muted"
                    title="Delete"
                    disabled={saving}
                    onClick={() => deleteTag(t)}
                  >
                    <i className="ti ti-trash fs-5"></i>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted">No tags yet.</div>
        )}

        <div className="mt-3">
          {adding ? (
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                <span
                  className="d-flex-center rounded-circle bg-white"
                  style={{
                    width: 34,
                    height: 34,
                    border: newTagColor
                      ? `2px solid ${newTagColor}`
                      : "1px solid rgba(0,0,0,0.1)",
                    flex: "0 0 auto",
                  }}
                  title="Color"
                >
                  <i className="ti ti-tag fs-5"></i>
                </span>
                <Input
                  value={newTagName}
                  placeholder="Tag name"
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createTag();
                    if (e.key === "Escape") {
                      setAdding(false);
                      setNewTagName("");
                      setNewTagColor(PRESET_COLORS[0]);
                    }
                  }}
                  disabled={saving}
                />
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => {
                    const active = String(c).toLowerCase() === String(newTagColor).toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        className="btn p-0"
                        onClick={() => setNewTagColor(c)}
                        disabled={saving}
                        title={c}
                        aria-label={`Color ${c}`}
                        style={{ width: 22, height: 22 }}
                      >
                        <span
                          className="d-inline-block rounded-circle"
                          style={{
                            width: 18,
                            height: 18,
                            background: c,
                            border: active ? "2px solid rgba(0,0,0,0.35)" : "1px solid rgba(0,0,0,0.15)",
                            boxShadow: active ? "0 0 0 2px rgba(59,130,246,0.25)" : "none",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Button
                    color="primary"
                    onClick={createTag}
                    disabled={saving || !newTagName.trim()}
                  >
                    {saving ? "Saving..." : "Add"}
                  </Button>
                  <Button
                    color="link"
                    className="text-muted"
                    onClick={() => {
                      setAdding(false);
                      setNewTagName("");
                      setNewTagColor(PRESET_COLORS[0]);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn px-0 text-primary d-inline-flex align-items-center gap-2"
              onClick={() => setAdding(true)}
              disabled={saving}
            >
              <i className="ti ti-plus fs-5"></i>
              Add Tag
            </button>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
