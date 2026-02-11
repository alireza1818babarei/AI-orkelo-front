import React from "react";
import { Form, FormGroup, Input, Label, Modal, ModalHeader } from "reactstrap";

const ProjectEditCreateModal = () => {
  return (
    <Modal isOpen={modal} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Add Project</ModalHeader>
      <ModalBody>
        <Form className="app-form">
          <FormGroup>
            <Label for="title">Project Name</Label>
            <Input
              type="text"
              name="title"
              id="title"
              placeholder="Designing"
              value={formValues.title}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="logo">Image</Label>
            <Input
              type="file"
              name="logo"
              id="logo"
              onChange={handleFileChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="startDate">Start Date</Label>
            <Input
              type="date"
              name="startDate"
              id="startDate"
              value={formValues.startDate}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="endDate">End Date</Label>
            <Input
              type="date"
              name="endDate"
              id="endDate"
              value={formValues.endDate}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="price">Pricing</Label>
            <Input
              type="text"
              name="price"
              id="price"
              placeholder="$10k"
              value={formValues.price}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="description">Project Description</Label>
            <Input
              type="textarea"
              name="description"
              id="description"
              rows="4"
              placeholder="Enter Description"
              value={formValues.description}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggleModal}>
          Close
        </Button>
        <Button color="primary" onClick={addProject}>
          Save Project
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProjectEditCreateModal;
