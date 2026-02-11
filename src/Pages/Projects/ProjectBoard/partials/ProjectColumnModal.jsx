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

const ProjectColumnModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  errors,
  titleField,
  titleRef,
  colorField,
  colorRef,
  iconField,
  iconRef,
  isEdit,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>
        {isEdit ? "Edit Column" : "Add Column"}
      </ModalHeader>

      <Form className="app-form" onSubmit={onSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="column-title">Title</Label>
            <Input
              id="column-title"
              type="text"
              {...titleField}
              innerRef={titleRef}
              invalid={!!errors.title}
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup>
            <Label for="column-color">Color</Label>
            <Input
              id="column-color"
              type="color"
              {...colorField}
              innerRef={colorRef}
              disabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup>
            <Label for="column-icon">Icon</Label>
            <Input
              id="column-icon"
              type="text"
              placeholder="e.g. list"
              {...iconField}
              innerRef={iconRef}
              disabled={isSubmitting}
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
          <Button color="primary" type="submit" disabled={isSubmitting}>
            {isEdit ? "Update Column" : "Create Column"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ProjectColumnModal;
