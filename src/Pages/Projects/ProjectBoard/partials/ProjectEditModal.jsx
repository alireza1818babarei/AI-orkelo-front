import React from "react";
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
}) => {
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
