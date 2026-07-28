import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";
import api from "../../api/axios";
import { alertConfirm, toastError, toastInfo, toastSuccess } from "../../utils/sweetAlert";
import { AttachmentImage, formatBytes, getAttachmentName, getAttachmentUrl, isImageAttachment, parseFilenameFromContentDisposition, resolveAttachmentHref, resolveAttachmentIcon, toPublicAsset, triggerBrowserDownload } from "./TaskAttachments";

const attachmentId = (a) => a?.id ?? a?.attachment_id ?? null;
const initialFiles = (item) => {
  for (const key of ["attachments", "checklist_item_attachments", "checklistAttachments", "files"]) {
    if (Array.isArray(item?.[key])) return item[key];
  }
  return [];
};
const responseFiles = (payload) => {
  const value = payload?.data ?? payload;
  return Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
};
const transferFiles = (data) => Array.from(data?.files || []).filter(Boolean);
const clipboardFiles = (data) => {
  const direct = transferFiles(data);
  if (direct.length) return direct;
  return Array.from(data?.items || []).filter((item) => item?.kind === "file").map((item) => item.getAsFile?.()).filter(Boolean);
};
const endpoint = ({ projectId, taskId, checklistItemId, id, action }) => {
  const base = `/projects/${projectId}/tasks/${taskId}/checklist-items/${checklistItemId}/attachments`;
  return id == null ? base : `${base}/${id}${action ? `/${action}` : ""}`;
};

export default function ChecklistItemAttachments({ projectId, taskId, checklistItem, inputId, disabled = false, showTrigger = true, onChanged }) {
  const checklistItemId = checklistItem?.id ?? null;
  const resolvedInputId = inputId || `checklist-item-attachment-input-${checklistItemId ?? "new"}`;
  const [attachments, setAttachments] = useState(() => initialFiles(checklistItem));
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [preview, setPreview] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const dragDepth = useRef(0);
  const controllerRef = useRef(null);
  const cancelReason = useRef(null);
  const unavailable = disabled || !projectId || !taskId || !checklistItemId;
  const busy = uploading > 0;
  const blocked = unavailable || busy;

  useEffect(() => setAttachments(initialFiles(checklistItem)), [checklistItem]);
  useEffect(() => {
    setUploadOpen(false);
    setDragging(false);
    dragDepth.current = 0;
  }, [checklistItemId]);
  useEffect(() => () => {
    cancelReason.current = "unmount";
    controllerRef.current?.abort();
  }, []);

  const closeUpload = useCallback(() => {
    if (busy) return;
    setUploadOpen(false);
    setDragging(false);
    dragDepth.current = 0;
  }, [busy]);

  const uploadFiles = useCallback(async (files) => {
    const selected = Array.from(files || []).filter(Boolean);
    if (!selected.length || blocked) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    cancelReason.current = null;
    setUploading(selected.length);
    try {
      const data = new FormData();
      selected.forEach((file) => data.append("files[]", file));
      const response = await api.post(endpoint({ projectId, taskId, checklistItemId }), data, { signal: controller.signal });
      const added = responseFiles(response?.data);
      if (added.length) setAttachments((current) => [...added, ...current]);
      toastSuccess((added.length || selected.length) > 1 ? "Files attached" : "File attached");
      onChanged?.();
    } catch (error) {
      if (cancelReason.current === "manual" || error?.message === "canceled") {
        if (cancelReason.current === "manual") toastInfo("Upload canceled");
      } else {
        toastError(error?.response?.data?.message || error?.message || "Upload checklist attachment failed");
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        cancelReason.current = null;
      }
      setUploading(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [blocked, checklistItemId, onChanged, projectId, taskId]);

  useEffect(() => {
    if (!uploadOpen) return undefined;
    const onPaste = (event) => {
      if (blocked) return;
      const files = clipboardFiles(event.clipboardData);
      if (!files.length) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      uploadFiles(files);
    };
    window.addEventListener("paste", onPaste, true);
    return () => window.removeEventListener("paste", onPaste, true);
  }, [blocked, uploadFiles, uploadOpen]);

  const onDragEnter = (event) => {
    if (!Array.from(event.dataTransfer?.types || []).includes("Files")) return;
    event.preventDefault();
    event.stopPropagation();
    if (blocked) return;
    dragDepth.current += 1;
    setDragging(true);
  };
  const onDragOver = (event) => {
    if (!Array.from(event.dataTransfer?.types || []).includes("Files")) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = blocked ? "none" : "copy";
  };
  const onDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (!dragDepth.current) setDragging(false);
  };
  const onDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setDragging(false);
    if (!blocked) await uploadFiles(transferFiles(event.dataTransfer));
  };

  const remove = async (file) => {
    const id = attachmentId(file);
    if (id == null || unavailable) return;
    const result = await alertConfirm({ title: "Delete attachment", text: "File will be deleted from this checklist item. Continue?", confirmText: "Delete", cancelText: "No" });
    if (!result.isConfirmed) return;
    try {
      setDeleting(String(id));
      await api.delete(endpoint({ projectId, taskId, checklistItemId, id }));
      setAttachments((current) => current.filter((item) => String(attachmentId(item)) !== String(id)));
      toastSuccess("File deleted");
      onChanged?.();
    } catch (error) {
      toastError(error?.response?.data?.message || error?.message || "Delete checklist attachment failed");
    } finally {
      setDeleting(null);
    }
  };

  const download = async (file) => {
    const id = attachmentId(file);
    const href = resolveAttachmentHref(getAttachmentUrl(file));
    const name = getAttachmentName(file);
    if (id == null && !href) return;
    try {
      setDownloading(true);
      let response;
      try {
        response = id == null ? null : await api.get(endpoint({ projectId, taskId, checklistItemId, id, action: "download" }), { responseType: "blob" });
      } catch {
        response = null;
      }
      if (!response && href) response = await api.get(href, { responseType: "blob" });
      if (!response) throw new Error("Download url missing");
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const header = response.headers?.["content-disposition"] ?? response.headers?.["Content-Disposition"];
      triggerBrowserDownload({ blob, filename: parseFilenameFromContentDisposition(header) || name });
    } catch (error) {
      toastError(error?.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const previewIndex = useMemo(() => attachments.findIndex((file) => file === preview), [attachments, preview]);
  const movePreview = (step) => {
    if (attachments.length < 2 || previewIndex < 0) return;
    setPreview(attachments[(previewIndex + step + attachments.length) % attachments.length]);
  };

  return <div className="checklist-item-attachments">
    {showTrigger && <button type="button" className="btn px-0 text-info small f-s-12 checklist-item-attachments__trigger" onClick={() => !unavailable && setUploadOpen(true)} disabled={unavailable}>
      <i className="ti ti-paperclip" aria-hidden="true"></i><span>Add attachment</span>
    </button>}
    <input ref={inputRef} id={resolvedInputId} type="file" name="files[]" multiple className="d-none" aria-label="Choose checklist attachments" disabled={blocked} onChange={(event) => uploadFiles(event.currentTarget.files)} />

    {attachments.length > 0 && <div className="checklist-item-attachments__grid">
      {attachments.map((file, index) => {
        const id = attachmentId(file);
        const name = getAttachmentName(file);
        const href = resolveAttachmentHref(getAttachmentUrl(file));
        const image = isImageAttachment(file) && !!href;
        const fallback = toPublicAsset("assets/images/icons/file.png");
        return <div className="checklist-item-attachment-card" key={id ?? file?.url ?? `${name}-${index}`}>
          <button type="button" className="checklist-item-attachment-card__button" title={name} onClick={() => setPreview(file)}>
            <span className="checklist-item-attachment-card__preview">
              {image ? <AttachmentImage attachment={file} href={href} alt={name} className="w-100 h-100" style={{ objectFit: "cover" }} fallbackIconSrc={fallback} /> : <img src={toPublicAsset(resolveAttachmentIcon(file))} alt={name} onError={(event) => { event.currentTarget.src = fallback; }} />}
            </span>
            <span className="checklist-item-attachment-card__meta"><span className="checklist-item-attachment-card__name">{name}</span><span className="checklist-item-attachment-card__size">{formatBytes(file?.size)}</span></span>
          </button>
          {id != null && <button type="button" className="btn btn-sm text-danger position-absolute top-0 end-0" aria-label={`Delete ${name}`} disabled={deleting === String(id)} onClick={() => remove(file)}><i className="ti ti-trash"></i></button>}
        </div>;
      })}
    </div>}

    <Modal isOpen={uploadOpen} toggle={closeUpload} centered size="lg" backdrop={busy ? "static" : true} keyboard={!busy} onOpened={() => dropRef.current?.focus()}>
      <ModalHeader toggle={busy ? undefined : closeUpload}>Add checklist attachments</ModalHeader>
      <ModalBody>
        <div ref={dropRef} role="button" tabIndex={blocked ? -1 : 0} className={`d-flex flex-column align-items-center justify-content-center rounded-3 text-center p-4 ${dragging ? "bg-light" : ""}`} style={{ minHeight: 220, border: `2px dashed ${dragging ? "var(--bs-primary)" : "var(--bs-border-color)"}`, cursor: blocked ? "not-allowed" : "pointer" }} onClick={() => !blocked && inputRef.current?.click()} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !blocked) { event.preventDefault(); inputRef.current?.click(); } }} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
          <i className="ti ti-cloud-upload text-primary mb-3" style={{ fontSize: 52 }}></i>
          <h5>{dragging ? "Drop files here" : "Add attachments"}</h5>
          <p className="text-muted mb-1">Drag and drop files here, paste copied files, or click to choose files.</p>
          <p className="text-muted small mb-0">Multiple files can be uploaded at the same time.</p>
          {busy && <div className="d-flex align-items-center gap-2 mt-4"><Spinner size="sm" color="primary" /><span>Uploading {uploading > 1 ? `${uploading} files` : "file"}...</span><button type="button" className="btn btn-sm btn-outline-danger" onClick={(event) => { event.stopPropagation(); cancelReason.current = "manual"; controllerRef.current?.abort(); }}>Cancel</button></div>}
        </div>
        <div className="text-muted small mt-3">Paste works while this window is open. {attachments.length} attachment{attachments.length === 1 ? "" : "s"} currently added.</div>
      </ModalBody>
      <ModalFooter><button type="button" className="btn btn-light" disabled={busy} onClick={closeUpload}>Close</button><button type="button" className="btn btn-primary" disabled={blocked} onClick={() => inputRef.current?.click()}>Choose files</button></ModalFooter>
    </Modal>

    <Modal isOpen={!!preview} toggle={() => setPreview(null)} centered size="lg" className="task-attachment-preview-modal">
      <ModalHeader toggle={() => setPreview(null)}>{getAttachmentName(preview)}</ModalHeader>
      <ModalBody>
        {preview && <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-2">
            {attachments.length > 1 && <button type="button" className="btn btn-light" aria-label="Previous attachment" onClick={() => movePreview(-1)}><i className="ti ti-chevron-left"></i></button>}
            <div className="bg-light rounded-3 d-flex-center flex-grow-1 overflow-hidden" style={{ minHeight: 320 }}>
              {isImageAttachment(preview) && resolveAttachmentHref(getAttachmentUrl(preview)) ? <AttachmentImage attachment={preview} href={resolveAttachmentHref(getAttachmentUrl(preview))} alt={getAttachmentName(preview)} style={{ maxWidth: "100%", maxHeight: 520, objectFit: "contain" }} fallbackIconSrc={toPublicAsset("assets/images/icons/file.png")} /> : <img src={toPublicAsset(resolveAttachmentIcon(preview))} alt={getAttachmentName(preview)} style={{ width: 84, height: 84, objectFit: "contain" }} />}
            </div>
            {attachments.length > 1 && <button type="button" className="btn btn-light" aria-label="Next attachment" onClick={() => movePreview(1)}><i className="ti ti-chevron-right"></i></button>}
          </div>
          <div className="d-flex justify-content-end"><button type="button" className="btn btn-primary" disabled={downloading} onClick={() => download(preview)}>{downloading ? <Spinner size="sm" /> : <><i className="ti ti-download me-1"></i>Download</>}</button></div>
        </div>}
      </ModalBody>
    </Modal>
  </div>;
}
