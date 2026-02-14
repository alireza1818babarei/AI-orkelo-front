import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";
import api from "../../api/axios";
import { alertConfirm, alertSuccess, toastError } from "../../utils/sweetAlert";
import { updateTaskInColumn } from "../../store/projects/projectColumnsSlice";

const toPublicAsset = (relPath) => {
  const base = import.meta.env.BASE_URL || "/";
  const cleanedBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanedBase}${String(relPath || "").replace(/^\//, "")}`;
};

const formatBytes = (bytes) => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const idx = Math.min(
    Math.floor(Math.log(n) / Math.log(1024)),
    units.length - 1,
  );
  const val = n / Math.pow(1024, idx);
  return `${val.toFixed(val >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const getAttachmentName = (a) =>
  a?.original_name ?? a?.name ?? a?.filename ?? a?.file_name ?? "Attachment";

const getFileExt = (name) => {
  const str = String(name || "");
  const lastDot = str.lastIndexOf(".");
  if (lastDot === -1) return "";
  return str.slice(lastDot + 1).toLowerCase();
};

const isImageAttachment = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  const ext = getFileExt(getAttachmentName(a));
  return ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"].includes(ext);
};

const resolveAttachmentIcon = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  const name = getAttachmentName(a);
  const ext = getFileExt(name);

  if (mime.includes("pdf") || ext === "pdf") return "assets/images/icons/pdf.png";
  if (ext === "zip" || mime.includes("zip")) return "assets/images/icons/zip.png";
  if (ext === "rar" || mime.includes("rar")) return "assets/images/icons/rar.png";
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a"].includes(ext)) {
    return "assets/images/icons/music.png";
  }
  return "assets/images/icons/folder.png";
};

const getBackendOrigin = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  try {
    return new URL(String(apiBase)).origin;
  } catch {
    return "";
  }
};

const resolveAttachmentHref = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";

  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) return raw;

  try {
    const parsed = new URL(raw);
    const isLocal =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1";

    if (isLocal || parsed.pathname.startsWith("/storage/")) {
      return `${backendOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return raw;
  } catch {
    let path = raw.startsWith("/") ? raw : `/${raw}`;
    if (path.startsWith("/task_attachments/")) path = `/storage${path}`;
    return `${backendOrigin}${path}`;
  }
};

export default function TaskAttachments({
  projectId,
  taskId,
  columnId,
  onChanged,
  formatDateTime,
}) {
  const dispatch = useDispatch();
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const safeFormatDateTime = (value) => {
    if (typeof formatDateTime === "function") return formatDateTime(value);
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const setBoardCounts = (items) => {
    if (!taskId) return;
    const count = Array.isArray(items) ? items.length : 0;
    dispatch(
      updateTaskInColumn({
        columnId,
        taskId,
        patch: { files_count: count, attachments: count },
      }),
    );
  };

  const fetchAttachments = useCallback(async () => {
    if (!projectId || !taskId) return;
    try {
      setAttachmentsLoading(true);
      const res = await api.get(
        `/projects/${projectId}/tasks/${taskId}/attachments`,
      );
      const items = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(items) ? items : [];
      setAttachments(list);
      setBoardCounts(list);
    } catch (err) {
      toastError(err?.message || "Load attachments failed");
      setAttachments([]);
      setBoardCounts([]);
    } finally {
      setAttachmentsLoading(false);
    }
  }, [projectId, taskId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const uploadAttachment = async (file) => {
    if (!projectId || !taskId || !file) return;
    try {
      setAttachmentUploading(true);
      const url = `/projects/${projectId}/tasks/${taskId}/attachments`;
      const fieldCandidates = [
        "file",
        "attachment",
        "attachments[]",
        "attachments",
        "files[]",
        "files",
      ];

      let res = null;
      let lastErr = null;
      for (const fieldName of fieldCandidates) {
        try {
          const fd = new FormData();
          fd.append(fieldName, file);
          res = await api.post(url, fd);
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          const msg = String(err?.message || "");
          const isValidation = err?.status === 422 || /validation/i.test(msg);
          if (!isValidation) throw err;
        }
      }
      if (!res && lastErr) throw lastErr;

      alertSuccess();
      await fetchAttachments();
      onChanged?.();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Upload attachment failed";
      toastError(msg);
    } finally {
      setAttachmentUploading(false);
    }
  };

  const deleteAttachment = async (attachment) => {
    const attachmentId = attachment?.id ?? attachment?.attachment_id ?? null;
    if (!projectId || !taskId || !attachmentId) return;
    try {
      const { isConfirmed } = await alertConfirm({
        title: "Delete attachment",
        text: "File will be deleted. Continue?",
        confirmText: "Delete",
        cancelText: "No",
      });
      if (!isConfirmed) return;

      setDeletingId(String(attachmentId));
      await api.delete(
        `/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`,
      );
      alertSuccess();
      setMenuOpenId(null);
      await fetchAttachments();
      onChanged?.();
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Delete attachment failed";
      toastError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mb-3">
      <label
        htmlFor="task-attachment-file"
        className={`btn px-2 b-r-20 d-flex align-items-center gap-2 text-primary ${
          attachmentUploading ? "opacity-50 pe-none" : ""
        }`}
      >
        <i className="fa-solid fa-plus fa-fw"></i>
        <span>{attachmentUploading ? "Uploading..." : "Add attachment"}</span>
        <input
          type="file"
          name="file"
          id="task-attachment-file"
          className="d-none"
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0] || null;
            if (!file) return;
            await uploadAttachment(file);
            e.currentTarget.value = "";
          }}
          disabled={attachmentUploading}
        />
      </label>

      <div className="mt-2">
        {attachmentsLoading ? (
          <div className="text-muted small">Loading attachments...</div>
        ) : attachments?.length ? (
          <div className="row g-2">
            {attachments.map((a, idx) => {
              const name = getAttachmentName(a);
              const attachmentId = a?.id ?? a?.attachment_id ?? null;
              const href = resolveAttachmentHref(a?.url);
              const isImg = isImageAttachment(a) && !!href;
              const iconSrc = toPublicAsset(resolveAttachmentIcon(a));
              const fallbackIconSrc = toPublicAsset("assets/images/icons/folder.png");
              const idKey = attachmentId != null ? String(attachmentId) : null;
              const menuOpen = idKey != null && menuOpenId === idKey;
              const deleting = idKey != null && deletingId === idKey;
              return (
                <div
                  key={a?.id ?? a?.url ?? a?.path ?? `${name}-${idx}`}
                  className="col-12 col-sm-6 col-md-4"
                >
                  <div className="position-relative h-100">
                    {idKey ? (
                      <div style={{ position: "absolute", top: 6, right: 8, zIndex: 2 }}>
                        <Dropdown
                          direction="up"
                          isOpen={menuOpen}
                          toggle={() =>
                            setMenuOpenId((prev) => (prev === idKey ? null : idKey))
                          }
                        >
                          <DropdownToggle
                            tag="button"
                            type="button"
                            className="btn p-0 text-muted"
                            title="Options"
                            aria-label="Options"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <i className="ti ti-dots-vertical fs-5"></i>
                          </DropdownToggle>
                          <DropdownMenu end>
                            <DropdownItem
                              className="text-danger"
                              disabled={deleting}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteAttachment(a);
                              }}
                            >
                              <div className="d-flex align-items-center justify-content-between gap-2">
                                <span>{deleting ? "Deleting..." : "Delete"}</span>
                                <i className="ti ti-trash fs-5"></i>
                              </div>
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    ) : null}

                    <a
                      href={href || "#"}
                      target={href ? "_blank" : undefined}
                      rel={href ? "noreferrer" : undefined}
                      className={`text-decoration-none ${href ? "" : "pe-none"}`}
                      title={href ? "Open" : name}
                      onClick={() => setMenuOpenId(null)}
                    >
                      <div className="bg-light rounded-3 p-2 h-100">
                      <div
                        className="rounded-3 overflow-hidden bg-white d-flex-center"
                        style={{ height: 84 }}
                      >
                        {isImg ? (
                          <img
                            src={href}
                            alt={name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <img
                            src={iconSrc}
                            alt={name}
                            onError={(e) => {
                              if (e.currentTarget.src === fallbackIconSrc) return;
                              e.currentTarget.src = fallbackIconSrc;
                            }}
                            style={{ width: 38, height: 38, objectFit: "contain" }}
                          />
                        )}
                      </div>
                      <div className="pt-2" style={{ minWidth: 0 }}>
                        <div className="small fw-semibold text-truncate text-dark">
                          {name}
                        </div>
                        <div className="text-muted small text-truncate">
                          {formatBytes(a?.size)}
                        </div>
                      </div>
                    </div>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted small">No attachments yet.</div>
        )}
      </div>
    </div>
  );
}
