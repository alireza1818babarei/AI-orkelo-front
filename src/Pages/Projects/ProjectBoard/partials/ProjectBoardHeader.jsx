import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

const ProjectBoardHeader = ({
  projectName,
  onDelete,
  onEdit,
  onInfo,
  disableDelete,
  disableEdit,
  disableInfo,
  children,
}) => {
  return (
    <Row className="m-1">
      <Col xs={12} className="d-flex align-items-start mt-1">
        <div>
          <ul className="app-line-breadcrumbs">
            <li>
              <Link to="/projects" className="f-s-14 f-w-500">
                <span>
                  <i className="ph-duotone ph-rocket-launch f-s-16"></i>{" "}
                  Projects
                </span>
              </Link>
            </li>
          </ul>
          <h4 className="main-title mb-3">{projectName || ""}</h4>
        </div>

        <div className="ms-auto d-flex">
          <div className="text-light-info p-1 b-r-20">
            <button
              type="button"
              className="btn icon-btn text-dark fs-3 b-r-100"
              onClick={onDelete}
              disabled={disableDelete}
              aria-label="Project delete"
            >
              <i className="ph ph-trash-simple"></i>
            </button>

            <button
              type="button"
              className="btn icon-btn text-dark fs-3 b-r-100"
              onClick={onEdit}
              disabled={disableEdit}
              aria-label="Project edit"
            >
              <i className="ph ph-pencil-line"></i>
            </button>

            <button
              type="button"
              className="btn icon-btn text-dark fs-3 b-r-100"
              onClick={onInfo}
              disabled={disableInfo}
              aria-label="Project info"
            >
              <i className="ph ph-info"></i>
            </button>
          </div>

          {children}
        </div>
      </Col>
    </Row>
  );
};

export default ProjectBoardHeader;
