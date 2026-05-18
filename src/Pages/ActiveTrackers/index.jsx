import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AppPagination from '../../Components/Common/AppPagination';
import api from '../../api/axios';
import { formatMonthDayTime } from '../../utils/date';

const TRACKERS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 800;
const RUNNING_TIME_REFRESH_MS = 30000;

const emptyMeta = {
  current_page: 1,
  from: null,
  last_page: 1,
  per_page: TRACKERS_PER_PAGE,
  to: null,
  total: 0,
};

const getRunningDurationSeconds = (startedAt, nowMs) => {
  const startedAtMs = new Date(startedAt ?? '').getTime();

  if (!Number.isFinite(startedAtMs)) return 0;

  return Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
};

const formatUnit = (value, unit) =>
  `${value} ${unit}${value === 1 ? '' : 's'}`;

const formatRunningDuration = (seconds) => {
  const totalMinutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);

  if (totalMinutes < 1) return 'Less than 1 minute';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return formatUnit(minutes, 'minute');
  if (minutes === 0) return formatUnit(hours, 'hour');

  return `${formatUnit(hours, 'hour')}, ${formatUnit(minutes, 'minute')}`;
};

const normalizeTracker = (tracker) => ({
  id: tracker?.id,
  userId: tracker?.user_id,
  taskId: tracker?.task_id,
  projectId: tracker?.project_id,
  projectName: String(tracker?.project_name ?? '').trim() || 'Project',
  userName: String(tracker?.user_name ?? '').trim() || 'Unknown user',
  taskName: String(tracker?.task_name ?? '').trim() || 'Untitled task',
  startedAt: tracker?.start_track ?? null,
  totalTime: Number(tracker?.total_time ?? 0) || 0,
  type: String(tracker?.type ?? '').trim(),
});

const normalizeMeta = (meta, fallbackLength) => ({
  current_page: Number(meta?.current_page ?? 1) || 1,
  from: meta?.from ?? (fallbackLength > 0 ? 1 : null),
  last_page: Number(meta?.last_page ?? 1) || 1,
  per_page: Number(meta?.per_page ?? TRACKERS_PER_PAGE) || TRACKERS_PER_PAGE,
  to: meta?.to ?? fallbackLength,
  total: Number(meta?.total ?? fallbackLength) || 0,
});

const normalizeTrackersResponse = (payload) => {
  const root = payload && typeof payload === 'object' ? payload : {};
  const data = Array.isArray(root?.data)
    ? root.data
    : Array.isArray(root)
      ? root
      : [];

  return {
    trackers: data.map(normalizeTracker),
    meta: normalizeMeta(root?.meta, data.length),
  };
};

export default function ActiveTrackers() {
  const [trackers, setTrackers] = useState([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [draftSearch, setDraftSearch] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Professional note: Debounce the global search so typing does not trigger a request for every keystroke.
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setSearch(draftSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [draftSearch]);

  useEffect(() => {
    // Professional note: Refresh minute-level running time without recalculating on every second.
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, RUNNING_TIME_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTrackers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          per_page: TRACKERS_PER_PAGE,
        };

        const searchTerm = String(search ?? '').trim();

        // Professional note: The backend applies this term only to the visible project, task, and user names.
        if (searchTerm) params.search = searchTerm;

        const res = await api.get('/companies/my/time-trackers', { params });
        const normalized = normalizeTrackersResponse(res?.data);

        if (cancelled) return;

        setTrackers(normalized.trackers);
        setMeta(normalized.meta);
      } catch (err) {
        if (cancelled) return;

        setTrackers([]);
        setMeta(emptyMeta);
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTrackers();

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const paginationSummary = useMemo(() => {
    if (!meta.total) return 'No active trackers';

    return `Showing ${meta.from ?? 0}-${meta.to ?? 0} of ${meta.total}`;
  }, [meta.from, meta.to, meta.total]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    // Professional note: Pressing Enter should bypass the debounce and apply the current term immediately.
    setPage(1);
    setSearch(draftSearch);
  };

  return (
    <section className='active-trackers-page'>
      <Card className='active-trackers-page__header border-0 shadow-sm'>
        <Card.Body>
          <div>
            <Badge bg='primary' className='mb-2'>
              Active Trackers
            </Badge>
            <h2 className='mb-1'>Team Time Tracking</h2>
            <p className='mb-0 text-secondary'>
              Review active trackers for the projects you are allowed to manage.
            </p>
          </div>

          <div className='active-trackers-page__header-stat'>
            <span>Active now</span>
            <strong>{meta.total}</strong>
          </div>
        </Card.Body>
      </Card>

      <Card className='active-trackers-page__panel border-0 shadow-sm'>
        <Card.Body>
          <Form
            className='active-trackers-page__filters'
            onSubmit={handleSearchSubmit}
          >
            <Form.Group controlId='active-tracker-search'>
              <Form.Control
                type='search'
                value={draftSearch}
                aria-label='Search active trackers'
                placeholder='Search by project, task, or user'
                onChange={(event) => setDraftSearch(event.target.value)}
              />
            </Form.Group>
          </Form>

          {error ? (
            <Alert variant={Number(error?.status) === 403 ? 'warning' : 'danger'}>
              {error?.message || 'Failed to load active trackers.'}
            </Alert>
          ) : null}

          <div className='active-trackers-page__table-wrap'>
            <Table responsive hover className='align-middle mb-0'>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Task</th>
                  <th>User</th>
                  <th>Started at</th>
                  <th>Running time</th>
                  <th className='active-trackers-page__action-cell'>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className='text-center text-secondary py-4'>
                      <iconify-icon icon='line-md:loading-twotone-loop'></iconify-icon>
                    </td>
                  </tr>
                ) : trackers.length > 0 ? (
                  trackers.map((tracker) => (
                    <tr key={tracker.id}>
                      <td>
                        <span className='active-trackers-page__strong-cell'>
                          {tracker.projectName}
                        </span>
                      </td>
                      <td>
                        <span className='active-trackers-page__truncate'>
                          {tracker.taskName}
                        </span>
                      </td>
                      <td>{tracker.userName}</td>
                      <td>{formatMonthDayTime(tracker.startedAt)}</td>
                      <td>
                        {formatRunningDuration(
                          getRunningDurationSeconds(tracker.startedAt, nowMs)
                        )}
                      </td>
                      <td className='active-trackers-page__action-cell'>
                        {tracker.projectId && tracker.taskId ? (
                          <Button
                            as={Link}
                            to={`/projects/${tracker.projectId}/task/${tracker.taskId}`}
                            variant='outline-primary'
                            size='sm'
                          >
                            Open task
                          </Button>
                        ) : (
                          <Badge bg='light' text='dark'>
                            Unavailable
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='text-center text-secondary py-4'>
                      No active trackers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <AppPagination
            className='active-trackers-page__pagination'
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            summary={paginationSummary}
            disabled={loading}
            onPageChange={setPage}
          />
        </Card.Body>
      </Card>
    </section>
  );
}
