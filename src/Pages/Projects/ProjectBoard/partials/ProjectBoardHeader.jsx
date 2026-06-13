// ProjectBoardHeader.jsx (updated)
import { Button, Col, Row } from 'reactstrap';
import { useEffect } from 'react';

const ProjectBoardHeader = ({
  projectName,
  viewLabel,
  onAddColumn,
  onDelete,
  onEdit,
  onInfo,
  disableAddColumn,
  disableDelete,
  disableEdit,
  disableInfo,
  disableArchives,
  showDelete = true,
}) => {
  const title = [projectName, viewLabel].filter(Boolean).join(" / ");

  useEffect(() => {
    $(function () {
      var tooltip_init = {
        init: function () {
          $('Button').tooltip();
        },
      };
      tooltip_init.init();
    });
  }, []);

  return (
    <Row className='project-board-header m-1 gx-2 align-items-center'>
      <Col lg={7} md={6} xs={12} className='mt-1'>
        <div className='project-board-header__meta'>
          <h4 className='main-title mb-1 text-primary'>{title}</h4>
        </div>
      </Col>

      <Col lg={5} md={6} xs={12} className='mt-1'>
        <div className='project-board-header__actions-wrap'>
          <div className='project-board-header__actions'>
            <Button
              className='btn project-board-header__add-btn'
              onClick={onAddColumn}
              disabled={disableAddColumn}
            >
              <i className='ph ph-plus-circle'></i>
              <span>Add Column</span>
            </Button>
            <Button
              className='btn project-board-header__icon-btn'
              onClick={onEdit}
              disabled={disableEdit}
              aria-label='Project edit'
              title='Edit project'
            >
              <i className='ph ph-pencil-line'></i>
            </Button>
            <Button
              className='btn project-board-header__icon-btn'
              aria-label='Project archives'
              title='Project archives'
              data-bs-toggle='offcanvas'
              data-bs-target='#offcanvas-archived-tasks'
              aria-controls='offcanvas-archived-tasks'
            >
              <i className='ph ph-archive'></i>
            </Button>
            <Button
              className='btn project-board-header__icon-btn'
              aria-label='Deleted tasks'
              title='Deleted tasks'
              data-bs-toggle='offcanvas'
              data-bs-target='#offcanvas-deleted-tasks'
              aria-controls='offcanvas-deleted-tasks'
            >
              <i className='iconoir-bin-half'></i>
            </Button>
            <Button
              className='btn project-board-header__icon-btn'
              onClick={onInfo}
              disabled={disableInfo}
              aria-label='Project information'
              title='Project information'
            >
              <i className='ph ph-info'></i>
            </Button>
            {showDelete ? (
              <Button
                className='btn project-board-header__icon-btn danger'
                onClick={onDelete}
                disabled={disableDelete}
                aria-label='Project delete'
                title='Delete project'
              >
                <i className='ph ph-trash-simple'></i>
              </Button>
            ) : null}
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default ProjectBoardHeader;
