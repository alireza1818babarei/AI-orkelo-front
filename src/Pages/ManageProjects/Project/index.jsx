import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  projectReportsErrorSelector,
  projectReportsLinksSelector,
  projectReportsLoadingSelector,
  projectReportsMetaSelector,
  projectReportsSelector,
  projectReportsTotalSelector,
} from '../../../store/FileManager/Reports/projectReports.selector';
import {
  deleteProjectReport,
  downloadProjectReport,
  getProjectReports,
} from '../../../store/FileManager/Reports/projectReports.thunk';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Table,
  Row,
  Alert,
} from 'react-bootstrap';
import { Button } from 'reactstrap';
import { formatFullDate } from '../../../utils/date';
import { resolvePublicMediaUrl } from '../../../utils/mediaUrl';
import { getProjectMembersThunk } from '../../../store/projects/projectMembersSlice';
import {
  MemberListSkeleton,
  TableSkeleton,
} from '../../../Components/Common/LoadingSkeleton';

function ProjectManager() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const projectReports = useSelector(projectReportsSelector);
  const projectReportsLoading = useSelector(projectReportsLoadingSelector);
  const projectReportsError = useSelector(projectReportsErrorSelector);
  const projectReportsLinks = useSelector(projectReportsLinksSelector);
  const projectReportsMeta = useSelector(projectReportsMetaSelector);
  const projectReportsTotal = useSelector(projectReportsTotalSelector);

  const {
    items: projectMembersItems = [],
    error: projectMembersError,
    status: projectMembersStatus,
  } = useSelector((s) => s.projectMembers || {});

  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const projectName = projectReports?.[0]?.projectName;

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectReports({ projectId, page }));
    }
  }, [dispatch, projectId, page]);

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectMembersThunk(projectId));
    }
  }, [dispatch, projectId]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/manage-projects');
    }
  };

  const handleDownload = async (item) => {
    try {
      setDownloadingId(item.id);
      await dispatch(downloadProjectReport({ reportId: item.id }));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.reportName}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      const resultAction = await dispatch(
        deleteProjectReport({ reportId: item.id }),
      );

      if (deleteProjectReport.fulfilled.match(resultAction)) {
        const isLastItemOnPage = projectReports.length === 1 && page > 1;
        const nextPage = isLastItemOnPage ? page - 1 : page;

        if (nextPage !== page) {
          setPage(nextPage);
        } else if (projectId) {
          dispatch(getProjectReports({ projectId, page: nextPage }));
        }
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes) => {
    const size = Number(bytes);

    if (!Number.isFinite(size) || size < 0) return '-';
    if (size === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unitIndex = Math.min(
      Math.floor(Math.log(size) / Math.log(1024)),
      units.length - 1,
    );
    const value = size / 1024 ** unitIndex;

    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const normalizeRole = (role) =>
    String(role ?? '')
      .trim()
      .toLowerCase();

  const formatProjectMemberRole = (member) => {
    const companyRole = normalizeRole(member?.company_role);

    switch (companyRole) {
      case 'company_owner':
        return 'Company Owner';
      case 'company_supervisor':
        return 'Company Supervisor';
      default:
        break;
    }

    switch (normalizeRole(member?.project_role)) {
      case 'project_manager':
        return 'Project Manager';
      default:
        return '';
    }
  };

  const currentPage = Number(projectReportsMeta?.current_page) || 1;
  const lastPage = Number(projectReportsMeta?.last_page) || 1;

  return (
    <Row className='g-4'>
      <div className='d-flex align-items-center justify-content-between'>
        <h2 className='text-primary'>{projectName}</h2>
        <Button color='primary' onClick={handleGoBack}>
          Back
        </Button>
      </div>
      <Col md='6' lg='3'>
        <Card className='h-100'>
          <CardBody>
            <h5 className='header-title-text'>Project Members</h5>
            <p className='text-muted'>Click on the user to see their reports</p>
            {projectMembersStatus === 'loading' ? (
              <MemberListSkeleton count={5} />
            ) : projectMembersError ? (
              <Alert variant='danger' className='mt-3 mb-0'>
                {typeof projectMembersError === 'string'
                  ? projectMembersError
                  : projectMembersError?.message || 'Something went wrong'}
              </Alert>
            ) : (
              <ul className='messages-list mt-3'>
                {projectMembersItems.length > 0 ? (
                  projectMembersItems.map((member) => {
                    const displayRole = formatProjectMemberRole(member);

                    return (
                      <li
                        key={member.id}
                        className='messages-list-item cursor-pointer'
                        onClick={() =>
                          navigate(
                            `/manage-projects/${projectId}/user/${member.id}`,
                            { state: { memberName: member.name } },
                          )
                        }
                      >
                        <div
                          className={`h-40 w-40 d-flex-center b-r-15 overflow-hidden messages-list-avtar ${
                            member.id % 2 === 0
                              ? 'text-bg-light'
                              : 'text-bg-secondary'
                          }`}
                        >
                          {member.avatar ? (
                            <img
                              src={resolvePublicMediaUrl(member.avatar)}
                              alt={member.name}
                              className='img-fluid'
                            />
                          ) : (
                            <div className='f-s-17'>
                              {member.name?.slice(0, 1) || '?'}
                            </div>
                          )}
                        </div>

                        <div className='messages-list-content'>
                          <h6 className='mb-0 f-s-16 capitalized'>
                            {member.name}
                          </h6>
                          {displayRole && (
                            <p className='mb-0 f-s-13 text-secondary'>
                              {displayRole}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className='messages-list-item'>
                    <div className='messages-list-content'>
                      <p className='mb-0 text-secondary'>No members found</p>
                    </div>
                  </li>
                )}
              </ul>
            )}
          </CardBody>
        </Card>
      </Col>

      <Col md='6' lg='9'>
        <Card className='h-100'>
          <CardHeader>
            <div className='d-flex gap-2 justify-content-between flex-sm-row flex-column'>
              <div>
                <h5 className='mb-1'>Project Reports</h5>
                <small className='text-muted'>
                  {projectReportsLoading
                    ? 'Loading...'
                    : `Showing ${projectReports?.length || 0} of ${projectReportsTotal || 0} entries`}
                </small>
              </div>
            </div>
          </CardHeader>

          <CardBody className='p-0'>
            {projectReportsLoading ? (
              <TableSkeleton
                rows={5}
                columns={7}
                firstColumn='avatar'
                wrapperClassName='project-reports-table-wrapper'
                tableClassName='table table-bottom-border project-reports-table align-middle table-hover mb-0'
              />
            ) : projectReportsError ? (
              <div className='p-3'>
                <Alert variant='danger' className='mb-0'>
                  {projectReportsError}
                </Alert>
              </div>
            ) : (
              <div className='project-reports-table-wrapper'>
                <Table
                  className='table table-bottom-border project-reports-table align-middle table-hover mb-0'
                >
                  <colgroup>
                    <col className='project-reports-table__name-col' />
                    <col className='project-reports-table__file-col' />
                    <col className='project-reports-table__description-col' />
                    <col className='project-reports-table__project-col' />
                    <col className='project-reports-table__size-col' />
                    <col className='project-reports-table__date-col' />
                    <col className='project-reports-table__actions-col' />
                  </colgroup>

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>File name</th>
                      <th>Description</th>
                      <th>Project Name</th>
                      <th>Size</th>
                      <th>Uploaded At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {projectReports?.length > 0 ? (
                      projectReports.map((item) => {
                        const isDeleting = deletingId === item.id;
                        const isDownloading = downloadingId === item.id;
                        const avatarSrc = item.uploaderAvatar
                          ? resolvePublicMediaUrl(item.uploaderAvatar)
                          : null;

                        return (
                          <tr key={item.id}>
                            <td>
                              <div className='project-reports-table__user'>
                                {avatarSrc ? (
                                  <img
                                    src={avatarSrc}
                                    className='project-reports-table__avatar'
                                    alt={item.uploaderName || 'avatar'}
                                  />
                                ) : (
                                  <div className='project-reports-table__avatar project-reports-table__avatar--empty'>
                                    {(item.uploaderName || '?')
                                      .slice(0, 1)
                                      .toUpperCase()}
                                  </div>
                                )}

                                <span className='project-reports-table__text capitalized'>
                                  {item.uploaderName || '-'}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span className='project-reports-table__text'>
                                {item.reportName || '-'}
                              </span>
                            </td>
                            <td>
                              <span
                                className='project-reports-table__text project-reports-table__description'
                                title={item.description || ''}
                              >
                                {item.description || '-'}
                              </span>
                            </td>
                            <td>
                              <span className='project-reports-table__text'>
                                {item.projectName || '-'}
                              </span>
                            </td>
                            <td className='project-reports-table__size'>
                              {formatBytes(item.reportSize)}
                            </td>
                            <td className='project-reports-table__date text-danger f-w-500'>
                              {item.createdAt
                                ? formatFullDate(item.createdAt)
                                : '-'}
                            </td>

                            <td>
                              <div className='project-reports-table__actions'>
                                <Button
                                  type='button'
                                  size='sm'
                                  color='primary'
                                  outline
                                  onClick={() => handleDownload(item)}
                                  disabled={isDownloading || isDeleting}
                                  className='project-reports-table__download'
                                >
                                  {isDownloading
                                    ? 'Downloading...'
                                    : 'Download'}
                                </Button>

                                {/* Legacy dropdown actions are kept disabled for possible future multi-action support. */}
                                {false && (
                                  <div className='dropdown folder-dropdown'>
                                    <a
                                      className='dropdown-toggle'
                                      data-bs-toggle='dropdown'
                                      aria-expanded='false'
                                      href='#'
                                      onClick={(e) => e.preventDefault()}
                                    >
                                      <i className='ti ti-dots-vertical'></i>
                                    </a>

                                    <ul className='dropdown-menu'>
                                      <li>
                                        <button
                                          type='button'
                                          onClick={() => handleDownload(item)}
                                          disabled={isDownloading || isDeleting}
                                          className='dropdown-item px-3 d-flex justify-content-between align-items-center'
                                        >
                                          <span>
                                            {isDownloading
                                              ? 'Downloading...'
                                              : 'Download'}
                                          </span>
                                          <i className='ph-bold ph-download'></i>
                                        </button>
                                      </li>

                                      <li>
                                        <button
                                          type='button'
                                          onClick={() => handleDelete(item)}
                                          disabled={isDeleting || isDownloading}
                                          className='dropdown-item px-3 d-flex text-danger justify-content-between align-items-center'
                                        >
                                          <span>
                                            {isDeleting
                                              ? 'Deleting...'
                                              : 'Delete'}
                                          </span>
                                          <i className='ph-bold ph-trash'></i>
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan='7' className='text-center py-4'>
                          No reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>

          {!projectReportsLoading && !projectReportsError && (
            <div className='card-footer'>
              <div className='seller-table-footer d-flex gap-2 justify-content-between align-items-center flex-wrap'>
                <p className='text-secondary text-truncate mb-0'>
                  Showing page {currentPage} of {lastPage} — total{' '}
                  {projectReportsTotal || 0} entries
                </p>

                <ul className='pagination app-pagination mb-0'>
                  <li
                    className={`page-item bg-light-secondary ${
                      !projectReportsLinks?.prev ? 'disabled' : ''
                    }`}
                  >
                    <button
                      type='button'
                      className='page-link b-r-left'
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={!projectReportsLinks?.prev}
                    >
                      Previous
                    </button>
                  </li>

                  <li className='page-item active' aria-current='page'>
                    <span className='page-link'>{currentPage}</span>
                  </li>

                  <li
                    className={`page-item page-next ${
                      !projectReportsLinks?.next ? 'disabled' : ''
                    }`}
                  >
                    <button
                      type='button'
                      className='page-link'
                      onClick={() =>
                        setPage((prev) =>
                          lastPage && prev < lastPage ? prev + 1 : prev,
                        )
                      }
                      disabled={!projectReportsLinks?.next}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}

export default ProjectManager;
