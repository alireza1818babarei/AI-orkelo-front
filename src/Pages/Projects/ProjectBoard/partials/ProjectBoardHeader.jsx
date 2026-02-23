import React from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

const ProjectBoardHeader = ({
  projectName,
  onAddColumn,
  onDelete,
  onEdit,
  onInfo,
  disableAddColumn,
  disableDelete,
  disableEdit,
  disableInfo,
}) => {
  return (
    <Row className="project-board-header m-1 gx-2 align-items-center">
      <Col lg={7} md={6} xs={12} className="mt-1">
        <div className="project-board-header__meta">
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
          <h4 className="main-title mb-1">{projectName || ""}</h4>
          <p className="project-board-header__subtitle mb-0">
            Manage your project board from one place.
          </p>
        </div>
      </Col>

      <Col lg={5} md={6} xs={12} className="mt-1">
        <div className="project-board-header__actions-wrap">
          <div className="project-board-header__actions">
            <button
              type="button"
              className="btn project-board-header__add-btn"
              onClick={onAddColumn}
              disabled={disableAddColumn}
            >
              <i className="ph ph-plus-circle"></i>
              <span>Add Column</span>
            </button>

            <button
              type="button"
              className="btn project-board-header__icon-btn"
              onClick={onEdit}
              disabled={disableEdit}
              aria-label="Project edit"
              title="Edit project"
            >
              <i className="ph ph-pencil-line"></i>
            </button>

            <button
              type="button"
              className="btn project-board-header__icon-btn"
              onClick={onInfo}
              disabled={disableInfo}
              aria-label="Project info"
              title="Project info"
            >
              <i className="ph ph-info"></i>
            </button>
            <button
              type="button"
              className="btn project-board-header__icon-btn danger"
              onClick={onDelete}
              disabled={disableDelete}
              aria-label="Project delete"
              title="Delete project"
            >
              <i className="ph ph-trash-simple"></i>
            </button>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default ProjectBoardHeader;
