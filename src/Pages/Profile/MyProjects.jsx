import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap';
import FileTable from '../../Components/FileTable/FileTable';
import { useNavigate, useParams } from 'react-router-dom';
import LightFileupload from '../../Components/Fileupload/LightFileupload';
import { useDispatch, useSelector } from 'react-redux';
import { selectDailyReportsUploadLoading } from '../../store/Profile/DailyReports/dailyReports.selectors';
import {
  getDailyReports,
  uploadDailyReport,
} from '../../store/Profile/DailyReports/dailyReports.thunks';
import { selectMyProjectsItems } from '../../store/Profile/MyProjects/myProjects.selectors';
import { getMyProjects } from '../../store/Profile/MyProjects/myProjects.thunk';
import {
  selectQuickAccessItems,
  selectQuickAccessLoading,
} from '../../store/Profile/QuickAccess/quickAccess.selectors';
import { getQuickAccessReports } from '../../store/Profile/QuickAccess/quickAccess.thunks';
import { dailyReportSchema } from '../../validation/dailyReports/userDailyReports';
import { toastError, toastSuccess } from '../../utils/sweetAlert';
import api from '../../api/axios';
import { getReportFileIcon } from '../../utils/reportFileIcon';

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString();
};

function MyProjects() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const uploading = useSelector(selectDailyReportsUploadLoading);
  const myProjectsItems = useSelector(selectMyProjectsItems);
  const quickAccessItems = useSelector(selectQuickAccessItems);
  const quickAccessLoading = useSelector(selectQuickAccessLoading);
  const [quickAccessBusyId, setQuickAccessBusyId] = useState(null);
  const [descriptionModalReport, setDescriptionModalReport] = useState(null);
  const currentProject = myProjectsItems.find(
    (project) => String(project.id) === String(projectId),
  );
  const projectTitle = currentProject?.title || `Project #${projectId}`;

  const refreshQuickAccess = async () => {
    if (!projectId) return;
    await dispatch(getQuickAccessReports(projectId)).unwrap();
  };

  useEffect(() => {
    refreshQuickAccess().catch(() => {});
  }, [dispatch, projectId]);

  useEffect(() => {
    if (currentProject) return;
    dispatch(getMyProjects());
  }, [currentProject, dispatch]);

  const handleUpload = async (file, description = '') => {
    try {
      await dailyReportSchema.validate({ file, description });

      await dispatch(
        uploadDailyReport({ projectId, file, description }),
      ).unwrap();
      await dispatch(
        getDailyReports({ project_id: projectId, page: 1, per_page: 10 }),
      ).unwrap();
      await refreshQuickAccess();

      toastSuccess('File uploaded successfully');
    } catch (err) {
      toastError(
        err?.message || err || 'Something went wrong, please try again',
      );
    }
  };

  const handleQuickAccessDownload = async (report) => {
    try {
      setQuickAccessBusyId(report.id);

      const response = await api.get(
        `/file-management/reports/${report.id}/download`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], {
        type: report.mime || 'application/octet-stream',
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = report.originalName || `report-${report.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toastError(err?.message || 'Download failed.');
    } finally {
      setQuickAccessBusyId(null);
    }
  };

  const closeDescriptionModal = () => {
    setDescriptionModalReport(null);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/profile/projects');
    }
  };

  return (
    <Container>
      <Row className='mb-3'>
        <Col xs={12}>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <h3 className='mb-1'>
                <span className='text-primary'>{projectTitle}</span>
              </h3>
              <h4 className='mb-0'>
                Upload your daily reports for the project
              </h4>
            </div>
            <Button size='sm' color='primary' onClick={handleBack}>
              Back
            </Button>
          </div>
        </Col>
      </Row>

      <Row className='g-4'>
        <Col lg={4}>
          <LightFileupload uploading={uploading} onUpload={handleUpload} />
        </Col>

        <Col lg={8}>
          <Card className='mb-4'>
            <CardHeader>
              <h5>Quick-Access</h5>
            </CardHeader>
            <CardBody id='rename_keybody'>
              {quickAccessLoading ? (
                <div className='text-muted d-flex align-items-center gap-2'>
                  <Spinner size='sm' color='primary' />
                  <span>Loading recent files...</span>
                </div>
              ) : quickAccessItems.length ? (
                <Row>
                  {quickAccessItems.map((item) => {
                    const busy = quickAccessBusyId === item.id;

                    return (
                      <Col key={item.id} sm={6} xl={4} xxl={3}>
                        <div className='card quick-access'>
                          <CardBody>
                            <div className='d-flex justify-content-between'>
                              <div></div>
                              <div className='dropdown folder-dropdown'>
                                <a
                                  role='button'
                                  data-bs-toggle='dropdown'
                                  aria-expanded='true'
                                >
                                  <i className='ti ti-dots-vertical'></i>
                                </a>
                                <ul className='dropdown-menu'>
                                  <li>
                                    <Button
                                      color='text-primary'
                                      className='dropdown-item px-3'
                                      onClick={() =>
                                        handleQuickAccessDownload(item)
                                      }
                                      disabled={busy}
                                    >
                                      <i className='ti ti-file-export text-primary'></i>{' '}
                                      {busy ? 'Downloading...' : 'Download'}
                                    </Button>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            <span className='d-block text-center mb-3'>
                              <img
                                src={getReportFileIcon(item.originalName)}
                                alt={item.originalName}
                                className='img-fluid'
                              />
                            </span>

                            <p
                              className='text-center f-w-600 mb-1'
                              title={item.originalName}
                            >
                              {item.originalName}
                            </p>
                            {item.description ? (
                              <button
                                type='button'
                                className='quick-access__description'
                                title={item.description}
                                onClick={() => setDescriptionModalReport(item)}
                              >
                                {item.description}
                              </button>
                            ) : (
                              <span className='quick-access__description quick-access__description--empty'>
                                No description
                              </span>
                            )}
                            <span className='d-block text-center text-secondary f-s-12'>
                              {formatDateTime(item.createdAt)}
                            </span>
                          </CardBody>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <div className='text-muted small'>No recent files found.</div>
              )}
            </CardBody>
          </Card>

          <FileTable projectId={projectId} onChanged={refreshQuickAccess} />
        </Col>
      </Row>

      <Modal
        isOpen={Boolean(descriptionModalReport)}
        toggle={closeDescriptionModal}
        centered
        size='md'
      >
        <ModalHeader toggle={closeDescriptionModal}>
          Report Description
        </ModalHeader>
        <ModalBody>
          <div className='daily-report-description-modal__file'>
            {descriptionModalReport?.originalName || 'Report'}
          </div>
          <div className='daily-report-description-modal__text'>
            {descriptionModalReport?.description || '-'}
          </div>
        </ModalBody>
      </Modal>
    </Container>
  );
}

export default MyProjects;
