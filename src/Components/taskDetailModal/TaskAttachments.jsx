import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
} from "reactstrap";
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

const getAttachmentUrl = (a) =>
  a?.download_url ??
  a?.downloadUrl ??
  a?.url ??
  a?.path ??
  a?.file_path ??
  a?.filePath ??
  a?.storage_path ??
  a?.storagePath ??
  a?.src ??
  a?.href ??
  "";

const getFileExt = (name) => {
  const str = String(name || "");
  const lastDot = str.lastIndexOf(".");
  if (lastDot === -1) return "";
  return str.slice(lastDot + 1).toLowerCase();
};

const getExtFromUrl = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw, "http://localhost");
    const path = String(u.pathname || "");
    const lastDot = path.lastIndexOf(".");
    if (lastDot === -1) return "";
    return path.slice(lastDot + 1).toLowerCase();
  } catch {
    const noQuery = raw.split("?")[0].split("#")[0];
    const lastDot = noQuery.lastIndexOf(".");
    if (lastDot === -1) return "";
    return noQuery.slice(lastDot + 1).toLowerCase();
  }
};

const getAttachmentExt = (a) => {
  const byName = getFileExt(getAttachmentName(a));
  if (byName) return byName;
  return getExtFromUrl(getAttachmentUrl(a) ?? a?.file ?? "");
};

const isImageAttachment = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  const ext = getAttachmentExt(a);
  return [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
    "tif",
    "tiff",
    "avif",
    "heic",
    "heif",
  ].includes(ext);
};

const resolveAttachmentIcon = (a) => {
  const mime = String(a?.mime || "").toLowerCase();
  const ext = getAttachmentExt(a);

  if (isImageAttachment(a)) return "assets/images/icons/gallary.png";

  if (mime.includes("pdf") || ext === "pdf") return "assets/images/icons/pdf.png";
  if (ext === "zip" || mime.includes("zip")) return "assets/images/icons/zip.png";
  if (ext === "rar" || mime.includes("rar") || ext === "7z") return "assets/images/icons/rar.png";
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a"].includes(ext)) return "assets/images/icons/music.png";

  if (mime.includes("spreadsheet") || mime.includes("excel")) {
    return "assets/images/icons/excel.png";
  }

  const officeMap = {
    xls: "excel.png",
    xlsx: "excel.png",
    xlsm: "excel.png",
    xlsb: "excel.png",
    xlt: "excel.png",
    xltx: "excel.png",
    csv: "excel.png",
    doc: "doc.png",
    docx: "doc.png",
    ppt: "ppt.png",
    pptx: "ppt.png",
  };
  if (officeMap[ext]) return `assets/images/icons/${officeMap[ext]}`;

  if (ext) return `assets/images/icons/${ext}.png`;
  return "assets/images/icons/file.png";
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
  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

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
    const cutIndex = raw.search(/[?#]/);
    const pathPart = cutIndex === -1 ? raw : raw.slice(0, cutIndex);
    const rest = cutIndex === -1 ? "" : raw.slice(cutIndex);

    let path = String(pathPart || "");
    path = path.startsWith("/") ? path : `/${path}`;

    if (path.startsWith("/storage/")) return `${backendOrigin}${path}${rest}`;
    if (path.startsWith("/task_attachments/")) return `${backendOrigin}/storage${path}${rest}`;
    if (path.startsWith("/attachments/")) return `${backendOrigin}/storage${path}${rest}`;
    if (path.startsWith("/project_images/")) return `${backendOrigin}/storage${path}${rest}`;

    return `${backendOrigin}${path}${rest}`;
  }
};

const useAttachmentImageSrc = ({ attachment, href }) => {
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const objectUrlRef = useRef(null);

  const isImg = isImageAttachment(attachment) && !!href;
  const shouldFetchAuthed = useMemo(() => {
    if (!isImg) return false;
    const h = String(href || "");
    if (!h) return false;
    if (h.includes("/storage/")) return false;
    return h.includes("/api/");
  }, [isImg, href]);

  useEffect(() => {
    setSrc(href || "");
  }, [href]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldFetchAuthed) return undefined;
    if (!href) return undefined;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(href, { responseType: "blob" });
        const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data]);
        const url = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = url;
        setSrc(url);
      } catch {
        setSrc(href);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldFetchAuthed, href]);

  return { src: src || href || "", loading, isImg };
};

export default function TaskAttachments({
  projectId,
  taskId,
  columnId,
  onChanged,
  formatDateTime,
  initialAttachments,
  prefetched = false,
}) {
  const dispatch = useDispatch();
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewDownloading, setPreviewDownloading] = useState(false);
  const seededRef = useRef(false);

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
    if (!prefetched) return;
    if (!taskId) return;
    if (!Array.isArray(initialAttachments)) return;
    setAttachments(initialAttachments);
    setBoardCounts(initialAttachments);
    seededRef.current = true;
  }, [prefetched, initialAttachments, taskId]);

  const downloadAttachment = async (attachment) => {
    const href = resolveAttachmentHref(getAttachmentUrl(attachment));
    if (!href) return;

    const fallbackName = getAttachmentName(attachment);
    const name = String(fallbackName || "Attachment").trim() || "Attachment";

    try {
      setPreviewDownloading(true);
      const res = await api.get(href, { responseType: "blob" });
      const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data]);

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toastError(err?.message || "Download failed");
    } finally {
      setPreviewDownloading(false);
    }
  };

  useEffect(() => {
    if (prefetched && seededRef.current) return;
    fetchAttachments();
  }, [fetchAttachments]);

  const uploadAttachment = useCallback(async (file) => {
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
  }, [fetchAttachments, onChanged, projectId, taskId]);

  useEffect(() => {
    if (!projectId || !taskId) return undefined;

    const onPaste = (e) => {
      const items = e?.clipboardData?.items;
      if (!items || !items.length) return;

      const files = [];
      for (const item of items) {
        if (!item) continue;
        if (item.kind !== "file") continue;
        const f = item.getAsFile?.();
        if (f) files.push(f);
      }

      if (!files.length) return;

      // Only intercept when clipboard actually contains files (so normal text paste is unaffected).
      e.preventDefault();
      e.stopPropagation();

      // Upload the first pasted file (common use-case: screenshot / single file copy).
      uploadAttachment(files[0]);
    };

    document.addEventListener("paste", onPaste, true);
    return () => document.removeEventListener("paste", onPaste, true);
  }, [projectId, taskId, uploadAttachment]);

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
          <div className="d-flex align-items-center gap-2 text-muted small">
            <Spinner size="sm" color="primary" />
            <span>Loading attachments...</span>
          </div>
        ) : attachments?.length ? (
          <div className="row g-2">
            {attachments.map((a, idx) => {
              const name = getAttachmentName(a);
              const attachmentId = a?.id ?? a?.attachment_id ?? null;
              const href = resolveAttachmentHref(getAttachmentUrl(a));
              const isImg = isImageAttachment(a) && !!href;
              const iconSrc = toPublicAsset(resolveAttachmentIcon(a));
              const fallbackIconSrc = toPublicAsset("assets/images/icons/file.png");
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
                      className="text-decoration-none"
                      title={name}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId(null);
                        setPreviewAttachment(a);
                        setPreviewOpen(true);
                      }}
                    >
                      <div className="bg-light rounded-3 p-2 h-100">
	                      <div
	                        className="rounded-3 overflow-hidden bg-white d-flex-center"
	                        style={{ height: 84 }}
	                      >
	                        {isImg ? (
	                          <AttachmentImage
	                            attachment={a}
	                            href={href}
	                            alt={name}
	                            className="w-100 h-100"
	                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
	                            fallbackIconSrc={fallbackIconSrc}
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

      <Modal
        isOpen={previewOpen}
        toggle={() => {
          setPreviewOpen(false);
          setPreviewAttachment(null);
        }}
        centered
        size="lg"
      >
        <ModalHeader
          toggle={() => {
            setPreviewOpen(false);
            setPreviewAttachment(null);
          }}
        >
          {getAttachmentName(previewAttachment)}
        </ModalHeader>
        <ModalBody>
          {previewAttachment ? (
	            (() => {
	              const name = getAttachmentName(previewAttachment);
	              const href = resolveAttachmentHref(getAttachmentUrl(previewAttachment));
	              const isImg = isImageAttachment(previewAttachment) && !!href;
	              const iconSrc = toPublicAsset(resolveAttachmentIcon(previewAttachment));
	              const fallbackIconSrc = toPublicAsset("assets/images/icons/file.png");

	              return (
	                <div className="d-flex flex-column gap-3">
	                  <div
                    className="bg-light rounded-3 d-flex-center overflow-hidden"
                    style={{ minHeight: 360 }}
                  >
	                    {isImg ? (
	                      <AttachmentImage
	                        attachment={previewAttachment}
	                        href={href}
	                        alt={name}
	                        style={{ maxWidth: "100%", maxHeight: 520, objectFit: "contain" }}
	                        fallbackIconSrc={fallbackIconSrc}
	                      />
	                    ) : (
	                      <div className="d-flex flex-column align-items-center gap-2 py-4">
	                        <img
	                          src={iconSrc}
	                          alt={name}
                          onError={(e) => {
                            if (e.currentTarget.src === fallbackIconSrc) return;
                            e.currentTarget.src = fallbackIconSrc;
                          }}
                          style={{ width: 84, height: 84, objectFit: "contain" }}
                        />
                        <div className="text-muted small">{formatBytes(previewAttachment?.size)}</div>
                      </div>
                    )}
                  </div>

                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="text-muted small">
                      {previewAttachment?.created_at
                        ? `Uploaded: ${safeFormatDateTime(previewAttachment.created_at)}`
                        : null}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={!href || previewDownloading}
                        onClick={() => downloadAttachment(previewAttachment)}
                      >
                        {previewDownloading ? (
                          <span className="d-inline-flex align-items-center gap-2">
                            <Spinner size="sm" />
                            <span>Downloading...</span>
                          </span>
                        ) : (
                          <>
                            <i className="ti ti-download me-1"></i>
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}
        </ModalBody>
      </Modal>
    </div>
  );
}

function AttachmentImage({ attachment, href, alt, fallbackIconSrc, ...imgProps }) {
  const { src, loading } = useAttachmentImageSrc({ attachment, href });
  const [errored, setErrored] = useState(false);
  const iconSrc = toPublicAsset(resolveAttachmentIcon(attachment));
  const fallback = fallbackIconSrc || toPublicAsset("assets/images/icons/file.png");

  if (!href) {
    return (
      <img
        src={iconSrc}
        alt={alt}
        onError={(e) => {
          if (e.currentTarget.src === fallback) return;
          e.currentTarget.src = fallback;
        }}
        style={{ width: 38, height: 38, objectFit: "contain" }}
      />
    );
  }

  if (errored) {
    return (
      <img
        src={iconSrc}
        alt={alt}
        onError={(e) => {
          if (e.currentTarget.src === fallback) return;
          e.currentTarget.src = fallback;
        }}
        style={{ width: 38, height: 38, objectFit: "contain" }}
      />
    );
  }

  if (loading && !src) {
    return (
      <div className="w-100 h-100 d-flex-center">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <img
      src={src || href}
      alt={alt}
      onError={() => setErrored(true)}
      {...imgProps}
    />
  );
}
