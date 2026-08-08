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
import {
  alertConfirm,
  toastError,
  toastInfo,
  toastSuccess,
} from "../../utils/sweetAlert";
import {
  AttachmentAudio,
  AttachmentAudioThumbnail,
  AttachmentImage,
  AttachmentVideo,
  AttachmentVideoThumbnail,
  formatBytes,
  getAttachmentName,
  getAttachmentUrl,
  isAudioAttachment,
  isImageAttachment,
  isVoiceAttachment,
  isVideoAttachment,
  parseFilenameFromContentDisposition,
  resolveAttachmentHref,
  resolveAttachmentIcon,
  toPublicAsset,
  triggerBrowserDownload,
  VoiceAttachmentsPanel,
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

const isFileDragEvent = (event) => {
  const types = Array.from(event?.dataTransfer?.types || []);
  return types.includes("Files");
};

const getDataTransferFiles = (dataTransfer) =>
  Array.from(dataTransfer?.files || []).filter(
    (file) => file && (typeof File === "undefined" || file instanceof File),
  );

const getClipboardFiles = (clipboardData) => {
  const items = Array.from(clipboardData?.items || []);
  return items
    .filter((item) => item?.kind === "file")
    .map((item) => item.getAsFile?.())
    .filter(Boolean);
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
  className = "",
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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadDragActive, setUploadDragActive] = useState(false);
  const inputRef = useRef(null);
  const uploadAreaRef = useRef(null);
  const uploadDropDepthRef = useRef(0);
  const uploadAbortControllerRef = useRef(null);
  const uploadCancelReasonRef = useRef(null);

  const isUploading = uploadingCount > 0;
  const isUploadUnavailable =
    disabled || !projectId || !taskId || !checklistItemId;
  const isDisabled =
    isUploadUnavailable || isUploading;
  const voiceAttachments = useMemo(
    () => (attachments || []).filter(isVoiceAttachment),
    [attachments],
  );
  const fileAttachments = useMemo(
    () => (attachments || []).filter((attachment) => !isVoiceAttachment(attachment)),
    [attachments],
  );

  const cancelUpload = useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    uploadCancelReasonRef.current = "manual";
    uploadAbortControllerRef.current?.abort();
  }, []);

  const closeUploadModal = useCallback(() => {
    setUploadModalOpen(false);
    setUploadDragActive(false);
    uploadDropDepthRef.current = 0;
  }, []);

  const openUploadModal = useCallback(() => {
    if (isUploadUnavailable) return;
    setUploadModalOpen(true);
  }, [isUploadUnavailable]);

  useEffect(() => () => {
    uploadCancelReasonRef.current = "unmount";
    uploadAbortControllerRef.current?.abort();
  }, []);

  const previewAttachmentCount = fileAttachments.length;
  const normalizedPreviewIndex = previewAttachmentCount
    ? Math.min(Math.max(previewIndex, 0), previewAttachmentCount - 1)
    : 0;
  const previewAttachment =
    previewOpen && previewAttachmentCount
      ? fileAttachments[normalizedPreviewIndex] ?? null
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
    async (files, options = {}) => {
      const selectedFiles = Array.from(files || []).filter(Boolean);
      if (!selectedFiles.length || isDisabled) return 0;

      let uploadedCount = 0;
      let controller = null;
      try {
        setUploadingCount(selectedFiles.length);
        controller = new AbortController();
        uploadAbortControllerRef.current = controller;
        uploadCancelReasonRef.current = null;

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
          { signal: controller.signal },
        );

        const uploaded = normalizeResponseAttachments(res?.data);
        if (uploaded.length) {
          uploadedCount = uploaded.length;
          const enhancedUploaded = options.voiceDurationSeconds
            ? uploaded.map((attachment) =>
                isAudioAttachment(attachment)
                  ? {
                      ...attachment,
                      voiceDurationSeconds: options.voiceDurationSeconds,
                    }
                  : attachment,
              )
            : uploaded;
          setAttachments((prev) => [...enhancedUploaded, ...(prev || [])]);
        }

        if (uploadedCount) {
          toastSuccess(
            uploadedCount > 1
              ? options.successMessagePlural || "Files attached"
              : options.successMessage || "File attached",
          );
          onChanged?.();
        }

        return uploadedCount;
      } catch (err) {
        if (
          uploadCancelReasonRef.current === "manual" ||
          err?.message === "canceled"
        ) {
          if (uploadCancelReasonRef.current === "manual") {
              toastInfo("Upload canceled");
            }
          return 0;
        }

        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Upload checklist attachment failed";
        toastError(msg);
        return 0;
      } finally {
        if (uploadAbortControllerRef.current === controller) {
          uploadAbortControllerRef.current = null;
          uploadCancelReasonRef.current = null;
        }

        setUploadingCount(0);
      }
    },
    [checklistItemId, isDisabled, onChanged, projectId, taskId],
  );

  const uploadVoiceAttachment = useCallback(
    (file, metadata) =>
      uploadFiles([file], {
        successMessage: "Voice attached",
        successMessagePlural: "Voice recordings attached",
        voiceDurationSeconds: metadata?.durationSeconds,
      }),
    [uploadFiles],
  );

  const handleUploadDragEnter = useCallback(
    (event) => {
      if (!isFileDragEvent(event)) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = isDisabled ? "none" : "copy";
      }

      uploadDropDepthRef.current += 1;
      setUploadDragActive(true);
    },
    [isDisabled],
  );

  const handleUploadDragOver = useCallback(
    (event) => {
      if (!isFileDragEvent(event)) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = isDisabled ? "none" : "copy";
      }
    },
    [isDisabled],
  );

  const handleUploadDragLeave = useCallback((event) => {
    if (!isFileDragEvent(event)) return;

    event.preventDefault();
    event.stopPropagation();

    uploadDropDepthRef.current = Math.max(uploadDropDepthRef.current - 1, 0);
    if (uploadDropDepthRef.current === 0) {
      setUploadDragActive(false);
    }
  }, []);

  const handleUploadDrop = useCallback(
    async (event) => {
      if (!isFileDragEvent(event)) return;

      event.preventDefault();
      event.stopPropagation();

      uploadDropDepthRef.current = 0;
      setUploadDragActive(false);

      if (isDisabled) return;

      const files = getDataTransferFiles(event.dataTransfer);
      if (!files.length) return;

      const uploadedCount = await uploadFiles(files);
      if (uploadedCount) closeUploadModal();
    },
    [closeUploadModal, isDisabled, uploadFiles],
  );

  const handleUploadPaste = useCallback(
    async (event) => {
      if (!uploadModalOpen || isDisabled) return;

      const files = getClipboardFiles(event.clipboardData);
      if (!files.length) return;

      // Only file clipboard content is intercepted; text paste stays untouched.
      event.preventDefault();
      event.stopPropagation();

      const uploadedCount = await uploadFiles(files);
      if (uploadedCount) closeUploadModal();
    },
    [closeUploadModal, isDisabled, uploadFiles, uploadModalOpen],
  );

  useEffect(() => {
    if (!uploadModalOpen) return undefined;

    document.addEventListener("paste", handleUploadPaste, true);
    return () => document.removeEventListener("paste", handleUploadPaste, true);
  }, [handleUploadPaste, uploadModalOpen]);

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
    const isVoice = isAudioAttachment(attachment);

    try {
      const { isConfirmed } = await alertConfirm({
        title: isVoice ? "Delete voice" : "Delete attachment",
        text: isVoice
          ? "Voice recording will be deleted from this checklist item. Continue?"
          : "File will be deleted from this checklist item. Continue?",
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
      toastSuccess(isVoice ? "Voice deleted" : "File deleted");
      onChanged?.();
    } catch (err) {
      toastError(err?.message || "Delete checklist attachment failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      className={`checklist-item-attachments${
        className ? ` ${className}` : ""
      }`}
    >
      {showTrigger ? (
        <button
          type="button"
          className="btn px-0 text-info small f-s-12 checklist-item-attachments__trigger"
          onClick={openUploadModal}
          disabled={isUploadUnavailable}
        >
          <i className="ti ti-paperclip" aria-hidden="true"></i>
          <span>Add attachment</span>
        </button>
      ) : null}

      <VoiceAttachmentsPanel
        className="checklist-item-voice-panel"
        attachments={voiceAttachments}
        disabled={isUploadUnavailable}
        uploading={isUploading}
        showTrigger={showTrigger}
        onUpload={uploadVoiceAttachment}
        onDelete={deleteAttachment}
        deletingId={deletingId}
      />

      <input
        ref={inputRef}
        id={resolvedInputId}
        type="file"
        multiple
        className="d-none"
        onChange={async (event) => {
          const input = event.currentTarget;
          const files = Array.from(input.files || []);
          const uploadedCount = await uploadFiles(files);
          if (input) input.value = "";
          if (uploadedCount) closeUploadModal();
        }}
        disabled={isDisabled}
      />

      <Modal
        isOpen={uploadModalOpen}
        toggle={closeUploadModal}
        centered
        className="checklist-item-attachment-upload-modal"
        onOpened={() => uploadAreaRef.current?.focus()}
      >
        <ModalHeader toggle={closeUploadModal}>
          Checklist item attachment
        </ModalHeader>
        <ModalBody>
          <label
            ref={uploadAreaRef}
            htmlFor={resolvedInputId}
            tabIndex={isDisabled ? -1 : 0}
            className={`checklist-item-attachment-upload-modal__dropzone${
              uploadDragActive ? " is-drag-over" : ""
            }${isUploading ? " is-uploading" : ""}`}
            onDragEnter={handleUploadDragEnter}
            onDragOver={handleUploadDragOver}
            onDragLeave={handleUploadDragLeave}
            onDrop={handleUploadDrop}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              if (isDisabled) return;

              event.preventDefault();
              inputRef.current?.click();
            }}
          >
            <span className="checklist-item-attachment-upload-modal__icon">
              {isUploading ? (
                <Spinner size="sm" color="primary" />
              ) : (
                <i className="fa-solid fa-cloud-arrow-up fa-fw"></i>
              )}
            </span>
            <span className="checklist-item-attachment-upload-modal__title">
              {isUploading
                ? uploadingCount > 1
                  ? `Uploading ${uploadingCount} files...`
                  : "Uploading file..."
                : "Add attachment"}
            </span>
            <span className="checklist-item-attachment-upload-modal__hint">
              Drag files here, paste copied files, or choose files
            </span>
            {isUploading ? (
              <button
                type="button"
                className="checklist-item-attachments__cancel mt-1"
                onClick={cancelUpload}
                title="Cancel upload"
                aria-label="Cancel upload"
              >
                <i className="ti ti-x" aria-hidden="true"></i>
                <span>Cancel</span>
              </button>
            ) : null}
          </label>
        </ModalBody>
      </Modal>

      {isUploading ? (
        <div className="checklist-item-attachments__uploading">
          <Spinner size="sm" color="primary" />
          <span>
            Uploading {uploadingCount > 1 ? `${uploadingCount} files` : "file"}...
          </span>
          <button
            type="button"
            className="checklist-item-attachments__cancel"
            onClick={cancelUpload}
            title="Cancel upload"
            aria-label="Cancel upload"
          >
            <i className="ti ti-x" aria-hidden="true"></i>
            <span>Cancel</span>
          </button>
        </div>
      ) : null}

      {fileAttachments.length ? (
        <div className="checklist-item-attachments__grid">
          {fileAttachments.map((attachment, index) => {
            const name = getAttachmentName(attachment);
            const href = resolveAttachmentHref(getAttachmentUrl(attachment));
            const attachmentId = getAttachmentId(attachment);
            const isImg = isImageAttachment(attachment) && !!href;
            const isAudio = isAudioAttachment(attachment) && !!href;
            const isVideo = isVideoAttachment(attachment) && !!href;
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
                    ) : isAudio ? (
                      <AttachmentAudioThumbnail />
                    ) : isVideo ? (
                      <AttachmentVideoThumbnail />
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
              const isAudio = isAudioAttachment(previewAttachment) && !!href;
              const isVideo = isVideoAttachment(previewAttachment) && !!href;
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
                      ) : isAudio ? (
                        <AttachmentAudio
                          attachment={previewAttachment}
                          href={href}
                          className="task-attachment-preview-modal__audio"
                          fallbackIconSrc={fallbackIconSrc}
                        />
                      ) : isVideo ? (
                        <AttachmentVideo
                          attachment={previewAttachment}
                          href={href}
                          className="task-attachment-preview-modal__video"
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
