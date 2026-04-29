import { Button, Card, Table } from 'react-bootstrap';
import {
  projectReportsErrorSelector,
  projectReportsLoadingSelector,
  projectReportsMetaSelector,
  projectReportsSelector,
  projectReportsTotalSelector,
} from '../../../store/FileManager/Reports/projectReports.selector';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import {
  deleteProjectReport,
  downloadProjectReport,
  getUserProjectReports,
  getUserReports,
} from '../../../store/FileManager/Reports/projectReports.thunk';
import { getReportFileIcon } from '../../../utils/reportFileIcon';
import { formatFullDate } from '../../../utils/date';
import AppPagination from '../../../Components/Common/AppPagination';
import { TableRowsSkeleton } from '../../../Components/Common/LoadingSkeleton';

function UserReports() {
  const { projectId, userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const projectReports = useSelector(projectReportsSelector);
  const projectReportsLoading = useSelector(projectReportsLoadingSelector);
  const projectReportsError = useSelector(projectReportsErrorSelector);
  const projectReportsMeta = useSelector(projectReportsMetaSelector);
  const projectReportsTotal = useSelector(projectReportsTotalSelector);

  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const uploaderName =
    projectReports?.[0]?.uploaderName || location.state?.memberName || '';

  const loadReports = (targetPage = page) => {
    // Fetch project-scoped reports when the page has projectId.
    // The legacy user-wide route is kept for /manage-projects/user/:userId.
    if (projectId) {
      return dispatch(getUserProjectReports({ projectId, userId, page: targetPage }));
    }

    return dispatch(getUserReports({ userId, page: targetPage }));
  };


  useEffect(() => {
    if (userId) {
      loadReports(page);
    }
  }, [userId, projectId, page]);


  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(projectId ? `/manage-projects/${projectId}` : '/manage-projects');
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
      `Are you sure you want to delete "${item.reportName}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      const resultAction = await dispatch(
        deleteProjectReport({ reportId: item.id })
      );

      if (deleteProjectReport.fulfilled.match(resultAction)) {
        const isLastItemOnPage = projectReports.length === 1 && page > 1;
        const nextPage = isLastItemOnPage ? page - 1 : page;

        if (nextPage !== page) {
          setPage(nextPage);
        } else {
          loadReports(nextPage);
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
      units.length - 1
    );
    const value = size / 1024 ** unitIndex;

    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  const paginationSummary = useMemo(() => {
    const currentPage = Number(projectReportsMeta?.current_page) || 1;
    const perPage = Number(projectReportsMeta?.per_page) || 10;
    const total = Number(projectReportsMeta?.total) || 0;

    const start = total ? (currentPage - 1) * perPage + 1 : 0;
    const end = total ? Math.min(currentPage * perPage, total) : 0;

    return total
      ? `Showing ${start} to ${end} of ${total} reports`
      : 'No reports found.';
  }, [projectReportsMeta]);

  const currentPage = Number(projectReportsMeta?.current_page) || 1;
  const lastPage = Number(projectReportsMeta?.last_page) || 1;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h2 className="mb-0">
          <span className="text-primary text-capitalize">
            {uploaderName || 'User'}
          </span>{' '}
          Daily Reports
        </h2>

        <Button onClick={handleGoBack}>Back</Button>
      </div>

      <Card className="pb-3">
        <Card.Header>
          <div className="d-flex gap-2 justify-content-between flex-sm-row flex-column">
            <h5 className="mb-0">All Daily Reports</h5>

            <span className="text-muted small">
              {projectReportsLoading
                ? 'Loading...'
                : `Showing ${projectReports.length} of ${projectReportsTotal}`}
            </span>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table className="table table-bottom-border recent-table align-middle table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Project</th>
                  <th>Size</th>
                  <th>Uploaded At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {projectReportsLoading ? (
                  <TableRowsSkeleton rows={5} columns={6} firstColumn='file' />
                ) : projectReports.length ? (
                  projectReports.map((item) => {
                    const isDeleting = deletingId === item.id;
                    const isDownloading = downloadingId === item.id;

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={getReportFileIcon(item.reportName)}
                              className="w-20 h-20"
                              alt="file-icon"
                            />
                            <span className="table-text">{item.reportName}</span>
                          </div>
                        </td>

                        <td>
                          <span
                            className="daily-reports-table__description"
                            title={item.description || ''}
                          >
                            {item.description || '-'}
                          </span>
                        </td>
                        <td>{item.projectName || '-'}</td>
                        <td>{formatBytes(item.reportSize)}</td>
                        <td>{formatFullDate(item.createdAt)}</td>

                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleDownload(item)}
                              disabled={isDownloading || isDeleting}
                            >
                              {isDownloading ? 'Downloading...' : 'Download'}
                            </Button>
{/* 
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(item)}
                              disabled={isDeleting || isDownloading}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {projectReportsError ? (
            <div className="text-danger p-3">{projectReportsError}</div>
          ) : null}
        </Card.Body>

        {lastPage > 1 ? (
          <Card.Footer>
            <AppPagination
              className="mt-2"
              currentPage={currentPage}
              lastPage={lastPage}
              summary={paginationSummary}
              disabled={projectReportsLoading}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </Card.Footer>
        ) : null}
      </Card>
    </div>
  );
}

export default UserReports;
