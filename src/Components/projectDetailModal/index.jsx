import React from "react";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { formatFullDate } from "../../utils/date";

const ProjectDetailsModal = ({
  infoOpen,
  setInfoOpen,
  project,
  members = [],
  columns = [],
}) => {
  const p = project || {};

  return (
    <Modal isOpen={infoOpen} toggle={() => setInfoOpen(false)} centered>
      <ModalHeader>
        Project Info
      </ModalHeader>

      <ModalBody>
        <div className="d-flex flex-column gap-2">
          <div className="d-flex flex-column">
            <span className="text-muted">Name:</span>
            <span className="fw-semibold">{p.name ?? "-"}</span>
          </div>

          {p.description ? (
            <div>
              <div className="text-muted mb-1">Description:</div>
              <div className="small fw-semibold">{p.description}</div>
            </div>
          ) : null}

          <hr className="my-2" />

          <div className="d-flex justify-content-between">
            <span className="text-muted">Status</span>
            <span
              className={`text-capitalize badge rounded-pill ${
                p.status === "active"
                  ? "text-bg-success"
                  : "text-bg-secondary"
              }`}
            >
              {p.status ?? "-"}
            </span>
          </div>

          <div className="d-flex justify-content-between">
            <span className="text-muted">Owner</span>
            <span className="fw-semibold">
              {p.owner?.name ?? p.owner_id ?? "-"}
            </span>
          </div>

          <div className="d-flex justify-content-between">
            <span className="text-muted">Created</span>
            <span className="small fw-semibold">
              {p.created_at ? formatFullDate(p.created_at) : "-"}
            </span>
          </div>

          <div className="d-flex justify-content-between">
            <span className="text-muted">Updated</span>
            <span className="small fw-semibold">
              {p.updated_at ? formatFullDate(p.updated_at) : "-"}
            </span>
          </div>

          <div className="d-flex justify-content-between">
            <span className="text-muted">Members</span>
            <span className="fw-semibold">{members.length}</span>
          </div>

          <div className="d-flex justify-content-between">
            <span className="text-muted">Columns</span>
            <span className="fw-semibold">{columns.length}</span>
          </div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <Button
            color="primary"
            onClick={() => setInfoOpen(false)}
            className="w-100"
          >
            Close
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ProjectDetailsModal;
