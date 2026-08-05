import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Spinner,
  Table,
} from 'reactstrap';
import AppPagination from '../Common/AppPagination';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectDailyReportsItems,
  selectDailyReportsLoading,
  selectDailyReportsMeta,
} from '../../store/Profile/DailyReports/dailyReports.selectors';
import {
  deleteDailyReport,
  getDailyReports,
} from '../../store/Profile/DailyReports/dailyReports.thunks';
import api from '../../api/axios';
import {
  alertConfirm,
  toastError,
  toastSuccess,
} from '../../utils/sweetAlert';
import { getReportFileIcon } from '../../utils/reportFileIcon';

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

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString();
};

const FileTable = ({ projectId, onChanged }) => {
  const dispatch = useDispatch();
  const dailyReportItems = useSelector(selectDailyReportsItems);
  const loading = useSelector(selectDailyReportsLoading);
  const meta = useSelector(selectDailyReportsMeta);
  const [busyId, setBusyId] = useState(null);
  const reportsStart = meta.total
    ? (meta.currentPage - 1) * meta.perPage + 1
    : 0;
  const reportsEnd = meta.total
    ? Math.min(meta.currentPage * meta.perPage, meta.total)
    : 0;
  const reportsSummary = meta.total
    ? `Showing ${reportsStart} to ${reportsEnd} of ${meta.total} reports`
    : 'No reports found.';

  useEffect(() => {
    if (!projectId) return;

    dispatch(
      getDailyReports({
        project_id: projectId,
        page: 1,
        per_page: 10,
      }),
    );
  }, [dispatch, projectId]);

  const handleDownload = async (report) => {
    try {
      setBusyId(`download-${report.id}`);

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
      setBusyId(null);
    }
  };

  const handleDelete = async (report) => {
    const { isConfirmed } = await alertConfirm({
      title: 'Delete report?',
      text: `"${report.originalName}" will be removed permanently.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (!isConfirmed) return;

    try {
      const nextPage =
        dailyReportItems.length === 1 && meta.currentPage > 1
          ? meta.currentPage - 1
          : meta.currentPage;

      setBusyId(`delete-${report.id}`);
      await dispatch(deleteDailyReport(report.id)).unwrap();
      await dispatch(
        getDailyReports({
          project_id: projectId,
          page: nextPage,
          per_page: meta.perPage || 10,
        }),
      ).unwrap();
      await onChanged?.();
      toastSuccess('Report deleted successfully');
    } catch (err) {
      toastError(err?.message || err || 'Delete failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className='pb-5'>
      <CardHeader>
        <div className='d-flex gap-2 justify-content-between flex-sm-row flex-column'>
          <h5>My Reports</h5>
          <span className='text-muted small'>
            {loading
              ? 'Loading...'
              : `Showing ${dailyReportItems.length} of ${meta.total}`}
          </span>
        </div>
      </CardHeader>

      <CardBody className='p-0'>
        <div className='table-responsive daily-reports-table-wrapper'>
          <Table className='table table-bottom-border recent-table daily-reports-table align-middle table-hover mb-0'>
            <colgroup>
              <col className='daily-reports-table__name-col' />
              <col className='daily-reports-table__description-col' />
              <col className='daily-reports-table__size-col' />
              <col className='daily-reports-table__date-col' />
              <col className='daily-reports-table__actions-col' />
            </colgroup>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Size</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan='5' className='text-center py-4 text-muted'>
                    <Spinner size='sm' color='primary' className='me-2' />
                    Loading reports...
                  </td>
                </tr>
              ) : dailyReportItems.length ? (
                dailyReportItems.map((item) => {
                  const downloadBusy = busyId === `download-${item.id}`;
                  const deleteBusy = busyId === `delete-${item.id}`;

                  return (
                    <tr key={item.id}>
                      <td data-label='Name'>
                        <div className='d-flex align-items-center gap-2'>
                          <img
                            src={getReportFileIcon(item.originalName)}
                            className='w-20 h-20'
                            alt='file-icon'
                          />
                          <span
                            className='table-text daily-reports-table__name'
                            title={item.originalName}
                          >
                            {item.originalName}
                          </span>
                        </div>
                      </td>
                      <td data-label='Description'>
                        <span
                          className='daily-reports-table__description'
                          title={item.description || ''}
                        >
                          {item.description || '-'}
                        </span>
                      </td>
                      <td data-label='Size'>{formatBytes(item.size)}</td>
                      <td data-label='Uploaded At'>{formatDateTime(item.createdAt)}</td>
                      <td data-label='Actions'>
                        <div className='daily-reports-table__actions'>
                          <Button
                            size='sm'
                            color='primary'
                            outline
                            className='daily-reports-table__action-btn'
                            onClick={() => handleDownload(item)}
                            disabled={downloadBusy}
                            title='Download'
                            aria-label={`Download ${item.originalName || 'report'}`}
                          >
                            {downloadBusy ? (
                              <Spinner size='sm' />
                            ) : (
                              <i className='ph ph-download-simple' aria-hidden='true' />
                            )}
                            <span className='visually-hidden'>Download</span>
                          </Button>

                          {item.canEdit ? (
                            <Button
                              size='sm'
                              color='danger'
                              outline
                              className='daily-reports-table__action-btn'
                              onClick={() => handleDelete(item)}
                              disabled={deleteBusy}
                              title='Delete'
                              aria-label={`Delete ${item.originalName || 'report'}`}
                            >
                              {deleteBusy ? (
                                <Spinner size='sm' />
                              ) : (
                                <i className='ph ph-trash-simple' aria-hidden='true' />
                              )}
                              <span className='visually-hidden'>Delete</span>
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan='5' className='text-center py-4 text-muted'>
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </CardBody>
      {meta.lastPage > 1 ? (
        <CardFooter className='daily-reports-table-footer'>
          <AppPagination
            currentPage={meta.currentPage}
            lastPage={meta.lastPage}
            summary={reportsSummary}
            disabled={loading}
            onPageChange={(page) =>
              dispatch(
                getDailyReports({
                  project_id: projectId,
                  page,
                  per_page: meta.perPage || 10,
                }),
              )
            }
          />
        </CardFooter>
      ) : null}
    </Card>
  );
};

export default FileTable;
