import React, { useEffect, useState } from "react";
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

const AddCompanyMemberModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setEmail("");
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = String(email || "").trim();
    if (!next) return;
    onSubmit?.(next);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Add Member</ModalHeader>

      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="mb-2 text-secondary f-s-13">Members</div>
          <Label for="company-member-email" className="form-label">
            Email
          </Label>
          <Input
            id="company-member-email"
            type="email"
            placeholder="member@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button color="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Member"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AddCompanyMemberModal;
