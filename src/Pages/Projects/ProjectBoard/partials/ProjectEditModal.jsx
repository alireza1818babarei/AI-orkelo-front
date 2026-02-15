import React, { useEffect, useMemo, useRef } from "react";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

const ProjectEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  isFormReady,
  isSubmitting,
  errors,
  nameField,
  nameRef,
  statusField,
  statusRef,
  descriptionField,
  descriptionRef,
  setValue,
  statusOptions,
  currentImageSrc,
  selectedImageFile,
  onClearSelectedImage,
}) => {
  const objectUrlRef = useRef(null);
  const filePreview = useMemo(() => {
    if (!(selectedImageFile instanceof File)) return "";
    const url = URL.createObjectURL(selectedImageFile);
    objectUrlRef.current = url;
    return url;
  }, [selectedImageFile]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!(selectedImageFile instanceof File)) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [selectedImageFile]);

  const effectivePreview = filePreview || String(currentImageSrc || "").trim();
  const hasCurrent = !!String(currentImageSrc || "").trim();
  const hasSelected = selectedImageFile instanceof File;

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Edit Project</ModalHeader>

      <Form className="app-form" onSubmit={onSubmit}>
        <ModalBody>
          {!isFormReady ? (
            <div className="p-2">
              <iconify-icon icon="line-md:loading-loop" />
            </div>
          ) : null}

          <FormGroup>
            <Label for="name">Project Name</Label>
            <Input
              id="name"
              type="text"
              {...nameField}
              innerRef={nameRef}
              invalid={!!errors.name}
              disabled={!isFormReady}
            />
          </FormGroup>

          <FormGroup>
            <Label for="status">Status</Label>
            <Input
              id="status"
              type="select"
              {...statusField}
              innerRef={statusRef}
              invalid={!!errors.status}
              disabled={!isFormReady}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="logo">Image</Label>

            {effectivePreview ? (
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-3 overflow-hidden border bg-light"
                  style={{ width: 84, height: 84 }}
                >
                  <img
                    src={effectivePreview}
                    alt="Project"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="flex-grow-1">
                  <div className="text-muted small">
                    {hasSelected
                      ? "Selected image (will be uploaded)"
                      : hasCurrent
                        ? "Current project image"
                        : null}
                  </div>
                  {hasSelected ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary mt-1"
                      onClick={() => {
                        onClearSelectedImage?.();
                      }}
                      disabled={!isFormReady || isSubmitting}
                    >
                      Remove selected
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setValue("image", file, { shouldValidate: true });
              }}
              invalid={!!errors.image}
              disabled={!isFormReady}
            />
          </FormGroup>

          <FormGroup>
            <Label for="description">Project Description</Label>
            <Input
              id="description"
              type="textarea"
              rows="4"
              {...descriptionField}
              innerRef={descriptionRef}
              invalid={!!errors.description}
              disabled={!isFormReady}
            />
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <Button
            color="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button
            color="primary"
            type="submit"
            disabled={!isFormReady || isSubmitting}
          >
            Save Project
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ProjectEditModal;
