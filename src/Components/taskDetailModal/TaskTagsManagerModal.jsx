import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalHeader, Spinner } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  createProjectTagThunk,
  deleteProjectTagThunk,
  getProjectTagsThunk,
  updateProjectTagThunk,
} from "../../store/tags/tagsSlice";
import { alertSuccess, toastError } from "../../utils/sweetAlert";

const getTagLabel = (tag) => tag?.name ?? `Tag ${tag?.id ?? ""}`;

const getTagKey = (tag) => String(tag?.id ?? "");

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

export default function TaskTagsManagerModal({ projectId, isOpen, toggle, onChanged }) {
  const dispatch = useDispatch();
  const tagsState = useSelector((s) => s.tags);

  const items =
    tagsState?.projectId != null && String(tagsState.projectId) === String(projectId)
      ? tagsState?.items || []
      : [];

  const loading = isOpen && tagsState?.status === "loading";
  const saving = !!tagsState?.saving;
  const deletingByTagId = tagsState?.deletingByTagId || {};
  const updatingByTagId = tagsState?.updatingByTagId || {};

  const [adding, setAdding] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);

  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState(PRESET_COLORS[0]);

  const fetchTags = useCallback(async () => {
    if (!projectId) return;
    try {
      await dispatch(getProjectTagsThunk(projectId)).unwrap();
    } catch (err) {
      toastError(err?.message || err?.data?.message || "Load tags failed");
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!isOpen) return;
    fetchTags();
  }, [isOpen, fetchTags]);

  useEffect(() => {
    if (!isOpen) return;
    setAdding(false);
    setNewTagName("");
    setNewTagColor(PRESET_COLORS[0]);
    setEditingTagId(null);
    setEditTagName("");
    setEditTagColor(PRESET_COLORS[0]);
  }, [isOpen]);

  const list = useMemo(() => items || [], [items]);

  const createTag = async () => {
    if (!projectId) return;
    const name = newTagName.trim();
    if (!name) return;
    try {
      const payload = { name };
      if (newTagColor) payload.color = newTagColor;
      await dispatch(createProjectTagThunk({ projectId, payload })).unwrap();
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
    }
  };

  const startEditTag = (tag) => {
    const tagId = tag?.id ?? null;
    if (!tagId) return;
    setEditingTagId(String(tagId));
    setEditTagName(String(getTagLabel(tag) || ""));
    setEditTagColor(String(tag?.color || PRESET_COLORS[0]));
  };

  const cancelEditTag = () => {
    setEditingTagId(null);
    setEditTagName("");
    setEditTagColor(PRESET_COLORS[0]);
  };

  const updateTag = async () => {
    const tagId = editingTagId;
    const name = (editTagName || "").trim();
    if (!projectId || !tagId || !name) return;
    try {
      const payload = { name };
      if (editTagColor) payload.color = editTagColor;
      await dispatch(updateProjectTagThunk({ projectId, tagId, payload })).unwrap();
      alertSuccess();
      cancelEditTag();
      onChanged?.();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Update tag failed";
      toastError(msg);
    }
  };

  const deleteTag = async (tag) => {
    const tagId = tag?.id ?? null;
    if (!projectId || !tagId) return;
    try {
      await dispatch(deleteProjectTagThunk({ projectId, tagId })).unwrap();
      alertSuccess();
      onChanged?.();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Delete tag failed";
      toastError(msg);
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
        ) : list.length ? (
          <div className="d-flex flex-column gap-2">
            {list.map((t, idx) => {
              const label = getTagLabel(t);
              const color = String(t?.color || "").trim();
              const idKey = getTagKey(t);
              const deleting = !!deletingByTagId[idKey];
              const updating = !!updatingByTagId[idKey];
              const isEditing = editingTagId != null && String(editingTagId) === String(idKey);
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
                        border:
                          (isEditing ? editTagColor : color)
                            ? `2px solid ${isEditing ? editTagColor : color}`
                            : "1px solid rgba(0,0,0,0.1)",
                        flex: "0 0 auto",
                      }}
                    >
                      <i className="ti ti-tag fs-5"></i>
                    </span>
                    {isEditing ? (
                      <Input
                        value={editTagName}
                        onChange={(e) => setEditTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateTag();
                          if (e.key === "Escape") cancelEditTag();
                        }}
                        disabled={saving || deleting || updating}
                        bsSize="sm"
                        style={{ maxWidth: 260 }}
                        autoFocus
                      />
                    ) : (
                      <span className="text-truncate">{label}</span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {isEditing ? (
                      <>
                        <div className="d-flex align-items-center gap-1 flex-wrap">
                          {PRESET_COLORS.map((c) => {
                            const active =
                              String(c).toLowerCase() === String(editTagColor).toLowerCase();
                            return (
                              <button
                                key={c}
                                type="button"
                                className="btn p-0"
                                onClick={() => setEditTagColor(c)}
                                disabled={saving || deleting || updating}
                                title={c}
                                aria-label={`Color ${c}`}
                                style={{ width: 18, height: 18 }}
                              >
                                <span
                                  className="d-inline-block rounded-circle"
                                  style={{
                                    width: 14,
                                    height: 14,
                                    background: c,
                                    border: active
                                      ? "2px solid rgba(0,0,0,0.35)"
                                      : "1px solid rgba(0,0,0,0.15)",
                                    boxShadow: active
                                      ? "0 0 0 2px rgba(59,130,246,0.25)"
                                      : "none",
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>

                        <Button
                          type="button"
                          color="link"
                          className="p-0 text-primary"
                          title="Save"
                          disabled={saving || deleting || updating || !editTagName.trim()}
                          onClick={updateTag}
                        >
                          {updating ? <Spinner size="sm" /> : <i className="ti ti-check fs-5"></i>}
                        </Button>

                        <Button
                          type="button"
                          color="link"
                          className="p-0 text-muted"
                          title="Cancel"
                          disabled={saving || deleting || updating}
                          onClick={cancelEditTag}
                        >
                          <i className="ti ti-x fs-5"></i>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          color="link"
                          className="p-0 text-muted"
                          title="Edit"
                          disabled={saving || deleting || updating}
                          onClick={() => startEditTag(t)}
                        >
                          <i className="ti ti-pencil fs-5"></i>
                        </Button>

                        <Button
                          type="button"
                          color="link"
                          className="p-0 text-muted"
                          title="Delete"
                          disabled={saving || deleting || updating}
                          onClick={() => deleteTag(t)}
                        >
                          {deleting ? <Spinner size="sm" /> : <i className="ti ti-trash fs-5"></i>}
                        </Button>
                      </>
                    )}
                  </div>
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
                    const active =
                      String(c).toLowerCase() === String(newTagColor).toLowerCase();
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
                            border: active
                              ? "2px solid rgba(0,0,0,0.35)"
                              : "1px solid rgba(0,0,0,0.15)",
                            boxShadow: active ? "0 0 0 2px rgba(59,130,246,0.25)" : "none",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Button color="primary" onClick={createTag} disabled={saving || !newTagName.trim()}>
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
