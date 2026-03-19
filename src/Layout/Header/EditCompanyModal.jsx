import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { resolveUserAvatarUrl } from "../../utils/mediaUrl.js";

const getCompanyInitial = (name) => {
  const raw = String(name ?? "").trim();
  return raw ? raw.charAt(0).toUpperCase() : "C";
};

const EditCompanyModal = ({
  isOpen,
  onClose,
  company,
  onSubmit,
  onRemoveImage,
  isSubmitting = false,
  isRemovingImage = false,
}) => {
  const companyName = String(company?.name ?? "").trim();
  const serverImageUrl = resolveUserAvatarUrl(company?.image ?? "");

  const [name, setName] = useState(companyName);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(companyName);
    setSelectedImageFile(null);
    setImagePreviewUrl("");
  }, [isOpen, companyName, company?.id]);

  useEffect(() => {
    return () => {
      if (
        imagePreviewUrl &&
        typeof imagePreviewUrl === "string" &&
        imagePreviewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const currentImageUrl = imagePreviewUrl || serverImageUrl || "";
  const companyInitial = useMemo(() => getCompanyInitial(name || companyName), [name, companyName]);

  const handlePickImage = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setImagePreviewUrl(objectUrl);
  };

  const clearSelectedImage = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImageFile(null);
    setImagePreviewUrl("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = String(name ?? "").trim();
    if (!trimmedName) return;

    onSubmit?.({
      name: trimmedName,
      image: selectedImageFile,
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered className="company-edit-modal">
      <ModalHeader toggle={onClose}>Edit Company</ModalHeader>

      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="company-edit-modal__preview mb-3">
            <div
              className={`company-edit-modal__avatar ${
                currentImageUrl ? "has-image" : "is-fallback"
              }`}
            >
              {currentImageUrl ? (
                <img src={currentImageUrl} alt={companyName || "Company"} />
              ) : (
                <span>{companyInitial}</span>
              )}
            </div>

            <div className="company-edit-modal__avatar-actions">
              <Label for="company-image-input" className="form-label mb-1">
                Company Image
              </Label>
              <Input
                id="company-image-input"
                type="file"
                accept="image/*"
                onChange={handlePickImage}
                disabled={isSubmitting || isRemovingImage}
              />

              <div className="d-flex align-items-center gap-2 mt-2">
                {selectedImageFile ? (
                  <Button
                    type="button"
                    color="light"
                    size="sm"
                    onClick={clearSelectedImage}
                    disabled={isSubmitting || isRemovingImage}
                  >
                    Clear selected
                  </Button>
                ) : null}

                {!selectedImageFile && serverImageUrl ? (
                  <Button
                    type="button"
                    color="light"
                    size="sm"
                    className="text-danger border-danger-subtle"
                    onClick={onRemoveImage}
                    disabled={isSubmitting || isRemovingImage}
                  >
                    {isRemovingImage ? "Removing..." : "Remove image"}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <Label for="company-name-input" className="form-label">
            Company Name
          </Label>
          <Input
            id="company-name-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={255}
            required
            disabled={isSubmitting || isRemovingImage}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            color="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting || isRemovingImage}
          >
            Close
          </Button>
          <Button color="primary" type="submit" disabled={isSubmitting || isRemovingImage}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default EditCompanyModal;
