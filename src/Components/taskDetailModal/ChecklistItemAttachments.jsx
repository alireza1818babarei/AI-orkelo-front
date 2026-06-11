import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { alertConfirm, toastError, toastSuccess } from "../../utils/sweetAlert";
import {
  AttachmentImage,
  formatBytes,
  getAttachmentName,
  getAttachmentUrl,
  isImageAttachment,
  parseFilenameFromContentDisposition,
  resolveAttachmentHref,
  resolveAttachmentIcon,
  toPublicAsset,
  triggerBrowserDownload,
} from "./TaskAttachments";

const getAttachmentId = (attachment) =>
  attachment?.id ?? attachment?.attachment_id ?? null;

const getInitialChecklistAttachments = (item) => {
  const keys = [
    "attachments",
    "checklist_item_attachments",
    "checklistAttachments",
    "files",
  ];

  for (const key of keys) {
    if (Array.isArray(item?.[key])) return item[key];
  }

  return null;
};

const normalizeResponseAttachments = (payload) => {
  const root = payload?.data ?? payload ?? null;
  if (Array.isArray(root)) return root;
  if (root && typeof root === "object") return [root];
  return [];
};

const buildChecklistAttachmentUrl = ({
  projectId,
  taskId,
  checklistItemId,
  attachmentId = null,
  action = null,
}) => {
  const base =
    `/projects/${projectId}/tasks/${taskId}` +
    `/checklist-items/${checklistItemId}/attachments`;

  if (attachmentId == null) return base;
  return `${base}/${attachmentId}${action ? `/${action}` : ""}`;
};

const safeFormatDate = (value, formatDateTime) => {
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

export default function ChecklistItemAttachments({
  projectId,
  taskId,
  checklistItem,
  inputId,
  disabled = false,
  showTrigger = true,
  onChanged,
  formatDateTime,
}) {
  const checklistItemId = checklistItem?.id ?? null;
  const generatedInputId = useMemo(
    () => `checklist-item-attachment-input-${checklistItemId ?? "new"}`,
    [checklistItemId],
  );
  const resolvedInputId = inputId || generatedInputId;
  const initialAttachments = getInitialChecklistAttachments(checklistItem);

  const [attachments, setAttachments] = useState(
    Array.isArray(initialAttachments) ? initialAttachments : [],
  );
  const [uploadingCount, setUploadingCount] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDownloading, setPreviewDownloading] = useState(false);
  const inputRef = useRef(null);

  const isUploading = uploadingCount > 0;
  const isDisabled =
    disabled || !projectId || !taskId || !checklistItemId || isUploading;

  const previewAttachmentCount = attachments.length;
  const normalizedPreviewIndex = previewAttachmentCount
    ? Math.min(Math.max(previewIndex, 0), previewAttachmentCount - 1)
    : 0;
  const previewAttachment =
    previewOpen && previewAttachmentCount
      ? attachments[normalizedPreviewIndex] ?? null
      : null;
  const canNavigatePreview = previewAttachmentCount > 1;

  useEffect(() => {
    const next = getInitialChecklistAttachments(checklistItem);
    if (Array.isArray(next)) setAttachments(next);
  }, [
    checklistItem?.id,
    checklistItem?.attachments,
    checklistItem?.checklist_item_attachments,
    checklistItem?.checklistAttachments,
    checklistItem?.files,
  ]);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewIndex(0);
  }, []);

  const openPreview = useCallback((index) => {
    setMenuOpenId(null);
    setPreviewIndex(index);
    setPreviewOpen(true);
  }, []);

  const showPreviousPreview = useCallback(() => {
    setPreviewIndex((current) => {
      if (previewAttachmentCount <= 1) return current;
      const currentIndex = Math.min(
        Math.max(current, 0),
        previewAttachmentCount - 1,
      );
      return (currentIndex - 1 + previewAttachmentCount) % previewAttachmentCount;
    });
  }, [previewAttachmentCount]);

  const showNextPreview = useCallback(() => {
    setPreviewIndex((current) => {
      if (previewAttachmentCount <= 1) return current;
      const currentIndex = Math.min(
        Math.max(current, 0),
        previewAttachmentCount - 1,
      );
      return (currentIndex + 1) % previewAttachmentCount;
    });
  }, [previewAttachmentCount]);

  useEffect(() => {
    if (!previewOpen) return undefined;

    if (!previewAttachmentCount) {
      closePreview();
      return undefined;
    }

    setPreviewIndex((current) =>
      Math.min(Math.max(current, 0), previewAttachmentCount - 1),
    );

    return undefined;
  }, [closePreview, previewAttachmentCount, previewOpen]);

  useEffect(() => {
    if (!previewOpen) return undefined;

    const handlePreviewKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousPreview();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextPreview();
      }
    };

    window.addEventListener("keydown", handlePreviewKeyDown);
    return () => window.removeEventListener("keydown", handlePreviewKeyDown);
  }, [previewOpen, showNextPreview, showPreviousPreview]);

  const uploadFiles = useCallback(
    async (files) => {
      const selectedFiles = Array.from(files || []).filter(Boolean);
      if (!selectedFiles.length || isDisabled) return;

      let uploadedCount = 0;
      try {
        setUploadingCount(selectedFiles.length);

        const fd = new FormData();
        selectedFiles.forEach((file) => {
          fd.append("files[]", file);
        });

        const res = await api.post(
          buildChecklistAttachmentUrl({
            projectId,
            taskId,
            checklistItemId,
          }),
          fd,
        );

        const uploaded = normalizeResponseAttachments(res?.data);
        if (uploaded.length) {
          uploadedCount = uploaded.length;
          setAttachments((prev) => [...uploaded, ...(prev || [])]);
        }

        if (uploadedCount) {
          toastSuccess(uploadedCount > 1 ? "Files attached" : "File attached");
          onChanged?.();
        }
      } catch (err) {
        toastError(err?.message || "Upload checklist attachment failed");
      } finally {
        setUploadingCount(0);
      }
    },
    [checklistItemId, isDisabled, onChanged, projectId, taskId],
  );

  const downloadAttachment = async (attachment) => {
    const href = resolveAttachmentHref(getAttachmentUrl(attachment));
    const attachmentId = getAttachmentId(attachment);
    if (!href && attachmentId == null) return;

    const fallbackName = getAttachmentName(attachment);
    const name = String(fallbackName || "Attachment").trim() || "Attachment";

    try {
      setPreviewDownloading(true);

      if (projectId && taskId && checklistItemId && attachmentId != null) {
        try {
          const res = await api.get(
            buildChecklistAttachmentUrl({
              projectId,
              taskId,
              checklistItemId,
              attachmentId,
              action: "download",
            }),
            { responseType: "blob" },
          );
          const blob =
            res?.data instanceof Blob ? res.data : new Blob([res?.data]);
          const headerName = parseFilenameFromContentDisposition(
            res?.headers?.["content-disposition"] ??
              res?.headers?.["Content-Disposition"],
          );
          triggerBrowserDownload({ blob, filename: headerName || name });
          return;
        } catch {
          // Existing file URLs still allow download when the item endpoint is unavailable.
        }
      }

      if (!href) throw new Error("Download url missing");

      const res = await api.get(href, { responseType: "blob" });
      const blob = res?.data instanceof Blob ? res.data : new Blob([res?.data]);
      const headerName = parseFilenameFromContentDisposition(
        res?.headers?.["content-disposition"] ??
          res?.headers?.["Content-Disposition"],
      );
      triggerBrowserDownload({ blob, filename: headerName || name });
    } catch (err) {
      toastError(err?.message || "Download failed");
    } finally {
      setPreviewDownloading(false);
    }
  };

  const deleteAttachment = async (attachment) => {
    const attachmentId = getAttachmentId(attachment);
    if (!projectId || !taskId || !checklistItemId || attachmentId == null) {
      return;
    }

    try {
      const { isConfirmed } = await alertConfirm({
        title: "Delete attachment",
        text: "File will be deleted from this checklist item. Continue?",
        confirmText: "Delete",
        cancelText: "No",
      });
      if (!isConfirmed) return;

      setDeletingId(String(attachmentId));
      await api.delete(
        buildChecklistAttachmentUrl({
          projectId,
          taskId,
          checklistItemId,
          attachmentId,
        }),
      );

      setAttachments((prev) =>
        (prev || []).filter(
          (item) => String(getAttachmentId(item)) !== String(attachmentId),
        ),
      );
      setMenuOpenId(null);
      toastSuccess("File deleted");
      onChanged?.();
    } catch (err) {
      toastError(err?.message || "Delete checklist attachment failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="checklist-item-attachments">
      {showTrigger ? (
        <button
          type="button"
          className="btn px-0 text-info small f-s-12 checklist-item-attachments__trigger"
          onClick={() => inputRef.current?.click()}
          disabled={isDisabled}
        >
          <i className="ti ti-paperclip" aria-hidden="true"></i>
          <span>Add attachment</span>
        </button>
      ) : null}

      <input
        ref={inputRef}
        id={resolvedInputId}
        type="file"
        multiple
        className="d-none"
        onChange={async (event) => {
          const input = event.currentTarget;
          const files = Array.from(input.files || []);
          await uploadFiles(files);
          if (input) input.value = "";
        }}
        disabled={isDisabled}
      />

      {isUploading ? (
        <div className="checklist-item-attachments__uploading">
          <Spinner size="sm" color="primary" />
          <span>
            Uploading {uploadingCount > 1 ? `${uploadingCount} files` : "file"}...
          </span>
        </div>
      ) : null}

      {attachments.length ? (
        <div className="checklist-item-attachments__grid">
          {attachments.map((attachment, index) => {
            const name = getAttachmentName(attachment);
            const href = resolveAttachmentHref(getAttachmentUrl(attachment));
            const attachmentId = getAttachmentId(attachment);
            const isImg = isImageAttachment(attachment) && !!href;
            const iconSrc = toPublicAsset(resolveAttachmentIcon(attachment));
            const fallbackIconSrc = toPublicAsset("assets/images/icons/file.png");
            const idKey =
              attachmentId != null
                ? String(attachmentId)
                : `${name}-${index}`;
            const menuOpen = attachmentId != null && menuOpenId === idKey;
            const deleting = attachmentId != null && deletingId === idKey;

            return (
              <div
                key={attachment?.id ?? attachment?.url ?? attachment?.path ?? idKey}
                className="checklist-item-attachment-card"
              >
                {attachmentId != null ? (
                  <div className="checklist-item-attachment-card__menu">
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
                            deleteAttachment(attachment);
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

                <button
                  type="button"
                  className="checklist-item-attachment-card__button"
                  title={name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openPreview(index);
                  }}
                >
                  <span className="checklist-item-attachment-card__preview">
                    {isImg ? (
                      <AttachmentImage
                        attachment={attachment}
                        href={href}
                        alt={name}
                        className="w-100 h-100"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
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
                      />
                    )}
                  </span>
                  <span className="checklist-item-attachment-card__meta">
                    <span className="checklist-item-attachment-card__name">
                      {name}
                    </span>
                    <span className="checklist-item-attachment-card__size">
                      {formatBytes(attachment?.size)}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <Modal
        isOpen={previewOpen}
        toggle={closePreview}
        centered
        size="lg"
        className="task-attachment-preview-modal"
      >
        <ModalHeader toggle={closePreview}>
          <div className="task-attachment-preview-modal__title">
            <span>{getAttachmentName(previewAttachment)}</span>
            {previewAttachmentCount ? (
              <span className="task-attachment-preview-modal__counter">
                {normalizedPreviewIndex + 1} / {previewAttachmentCount}
              </span>
            ) : null}
          </div>
        </ModalHeader>
        <ModalBody className="task-attachment-preview-modal__body">
          {previewAttachment ? (
            (() => {
              const name = getAttachmentName(previewAttachment);
              const href = resolveAttachmentHref(getAttachmentUrl(previewAttachment));
              const attachmentId = getAttachmentId(previewAttachment);
              const isImg = isImageAttachment(previewAttachment) && !!href;
              const iconSrc = toPublicAsset(resolveAttachmentIcon(previewAttachment));
              const fallbackIconSrc = toPublicAsset("assets/images/icons/file.png");

              return (
                <div className="d-flex flex-column gap-3">
                  <div className="task-attachment-preview-modal__content">
                    {canNavigatePreview ? (
                      <button
                        type="button"
                        className="task-attachment-preview-modal__nav task-attachment-preview-modal__nav--prev"
                        aria-label="Previous attachment"
                        title="Previous attachment"
                        onClick={showPreviousPreview}
                      >
                        <i className="ti ti-chevron-left" aria-hidden="true"></i>
                        <span className="visually-hidden">
                          Previous attachment
                        </span>
                      </button>
                    ) : null}

                    <div className="task-attachment-preview-modal__stage bg-light rounded-3 d-flex-center overflow-hidden">
                      {isImg ? (
                        <AttachmentImage
                          attachment={previewAttachment}
                          href={href}
                          alt={name}
                          style={{
                            maxWidth: "100%",
                            maxHeight: 520,
                            objectFit: "contain",
                          }}
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
                            style={{
                              width: 84,
                              height: 84,
                              objectFit: "contain",
                            }}
                          />
                          <div className="text-muted small">
                            {formatBytes(previewAttachment?.size)}
                          </div>
                        </div>
                      )}
                    </div>

                    {canNavigatePreview ? (
                      <button
                        type="button"
                        className="task-attachment-preview-modal__nav task-attachment-preview-modal__nav--next"
                        aria-label="Next attachment"
                        title="Next attachment"
                        onClick={showNextPreview}
                      >
                        <i className="ti ti-chevron-right" aria-hidden="true"></i>
                        <span className="visually-hidden">Next attachment</span>
                      </button>
                    ) : null}
                  </div>

                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="text-muted small">
                      {previewAttachment?.created_at
                        ? `Uploaded: ${safeFormatDate(
                            previewAttachment.created_at,
                            formatDateTime,
                          )}`
                        : null}
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={(!href && attachmentId == null) || previewDownloading}
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
              );
            })()
          ) : null}
        </ModalBody>
      </Modal>
    </div>
  );
}
