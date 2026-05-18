import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, ProgressBar, Row, Table } from 'react-bootstrap';
import Flatpickr from 'react-flatpickr';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { resolvePublicMediaUrl } from '../../utils/mediaUrl';

const COMPANY_MANAGEMENT_ROLES = new Set(['company_owner', 'company_supervisor']);
const WORK_DAY_MINUTES = 480;
const DISPLAY_DAY_MINUTES = 1440;

function getDefaultDateRange() {
  const now = new Date();
  return [
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
  ];
}

const defaultAnalysis = {
  filters: {
    period: {
      key: 'this_month',
      label: 'This Month',
      from_date: '',
      to_date: '',
    },
    selected_project_id: null,
    selected_user_id: null,
    can_select_user: null,
    projects: [],
    users: [],
  },
  summary: {
    total_tracked_seconds: 0,
    total_tracked_label: '0m',
    total_non_tracked_tasks: 0,
    tracked_days: 0,
    non_working_days: 0,
    leave_days: 0,
    leave_minutes: 0,
    leave_time_label: '0 hours',
    tasks_with_highest_time_spent: 0,
    total_tasks: 0,
    total_tasks_for_month: 0,
    completed_tasks_in_range: 0,
    completed_tasks_for_month: 0,
    total_completed_tasks: 0,
    overdue_tasks: 0,
    tasks_rating: 0,
    rated_tasks: 0,
  },
  top_time_tasks: [],
  overdue_tasks: [],
  user_performance: [],
  rating_distribution: [],
};

const metricCards = [
  {
    key: 'total_tracked_label',
    label: 'Total Tracked Time',
    iconClass: 'ph-duotone ph-timer',
    tone: 'cyan',
    value: (summary) => summary.total_tracked_label,
    detail: 'All tracked time in range',
  },
  {
    key: 'tracked_days',
    label: 'Number of Tracked Days',
    iconClass: 'ph-duotone ph-calendar-check',
    tone: 'teal',
    value: (summary) => formatDayValue(summary.tracked_days),
    detail: 'Days with tracker activity',
  },
  {
    key: 'non_working_days',
    label: 'Number of Non-working Days',
    iconClass: 'ph-duotone ph-coffee',
    tone: 'amber',
    value: (summary) => formatDayValue(summary.non_working_days),
    detail: 'Calendar days; weekends and holidays included',
  },
  {
    key: 'leave_days',
    label: 'Approved Leave Time',
    iconClass: 'ph-duotone ph-airplane-tilt',
    tone: 'violet',
    value: (summary) => formatLeaveTimeValue(summary),
    detail: 'Approved leave within selected range',
  },
  {
    key: 'total_tasks',
    label: 'Total Tasks',
    iconClass: 'ph-duotone ph-stack',
    tone: 'slate',
    value: (summary) => numberLabel(summary.total_tasks ?? summary.total_tasks_for_month),
    detail: 'Created during selected range',
  },
  {
    key: 'total_completed_tasks',
    label: 'Total Completed Tasks',
    iconClass: 'ph-duotone ph-flag-checkered',
    tone: 'emerald',
    value: (summary) => numberLabel(summary.total_completed_tasks),
    detail: 'All completed tasks',
  },
  {
    key: 'overdue_tasks',
    label: 'Overdue Tasks',
    iconClass: 'ph-duotone ph-alarm',
    tone: 'red',
    value: (summary) => numberLabel(summary.overdue_tasks),
    detail: 'Open tasks past due date',
  },
  {
    key: 'tasks_rating',
    label: 'Tasks Rating',
    iconClass: 'ph-duotone ph-star',
    tone: 'orange',
    value: (summary) => `${formatRating(summary.tasks_rating)} / 5`,
    detail: (summary) => `${numberLabel(summary.rated_tasks)} rated task(s)`,
  },
];

function numberLabel(value) {
  return new Intl.NumberFormat('en-US').format(Number(value ?? 0) || 0);
}

function formatRating(value) {
  const rating = Number(value ?? 0);
  if (!Number.isFinite(rating) || rating <= 0) return '0';
  return rating % 1 === 0 ? String(rating) : rating.toFixed(1);
}

function normalizeRating(value) {
  const rating = Number(value ?? 0);
  if (!Number.isFinite(rating)) return 0;

  return Math.min(5, Math.max(0, rating));
}

function formatDayValue(value) {
  const days = Number(value ?? 0) || 0;
  const label = days % 1 === 0 ? String(days) : days.toFixed(1);
  return `${label} ${days === 1 ? 'day' : 'days'}`;
}

function formatLeaveMinutes(minutesValue) {
  const minutes = Math.max(0, Math.round(Number(minutesValue ?? 0) || 0));

  if (minutes === 0) return '0 hours';

  const days = Math.floor(minutes / DISPLAY_DAY_MINUTES);
  let remainingMinutes = minutes % DISPLAY_DAY_MINUTES;
  const hours = Math.floor(remainingMinutes / 60);
  remainingMinutes %= 60;
  const parts = [];

  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`);
  }

  return parts.join(' ');
}

function formatLeaveTimeValue(value) {
  if (value?.leave_time_label) return value.leave_time_label;
  if (value?.leave_minutes !== undefined && value?.leave_minutes !== null) {
    return formatLeaveMinutes(value.leave_minutes);
  }

  return formatLeaveMinutes((Number(value?.leave_days ?? 0) || 0) * WORK_DAY_MINUTES);
}

function formatDate(value) {
  const date = new Date(value ?? '');
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateFilterValue(value) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeAnalysisPayload(payload) {
  const root = payload?.data ?? payload ?? {};

  return {
    ...defaultAnalysis,
    ...root,
    filters: {
      ...defaultAnalysis.filters,
      ...(root.filters && typeof root.filters === 'object' ? root.filters : {}),
      projects: normalizeArray(root.filters?.projects),
      users: normalizeArray(root.filters?.users),
    },
    summary: {
      ...defaultAnalysis.summary,
      ...(root.summary && typeof root.summary === 'object' ? root.summary : {}),
    },
    top_time_tasks: normalizeArray(root.top_time_tasks),
    overdue_tasks: normalizeArray(root.overdue_tasks),
    user_performance: normalizeArray(root.user_performance),
    rating_distribution: normalizeArray(root.rating_distribution),
  };
}

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '?';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
}

function UserAvatar({ user }) {
  const avatar = resolvePublicMediaUrl(user?.avatar);

  return (
    <span className='user-performance-analyze__avatar' aria-hidden='true'>
      {avatar ? <img src={avatar} alt='' /> : initials(user?.name)}
    </span>
  );
}

function StarRating({ value }) {
  const rating = normalizeRating(value);
  const label = `${formatRating(rating)}/5`;

  return (
    <span
      className='user-performance-analyze__rating-value'
      aria-label={`${formatRating(rating)} out of 5`}
      title={`${formatRating(rating)} out of 5`}
    >
      <i className={rating > 0 ? 'ph-fill ph-star' : 'ph ph-star'} aria-hidden='true'></i>
      <span>{label}</span>
    </span>
  );
}

function MetricCard({ metric, summary }) {
  const detail = typeof metric.detail === 'function' ? metric.detail(summary) : metric.detail;

  return (
    <div className='user-performance-analyze__metric'>
      <span className={`user-performance-analyze__metric-icon is-${metric.tone}`}>
        <i className={metric.iconClass}></i>
      </span>
      <span>
        <small>{metric.label}</small>
        <strong>{metric.value(summary)}</strong>
        <em>{detail}</em>
      </span>
    </div>
  );
}

function TopTimeTasks({ tasks }) {
  const maxSeconds = Math.max(
    1,
    ...tasks.map((task) => Number(task.total_seconds ?? 0) || 0),
  );

  return (
    <Card className='user-performance-analyze__panel border-0 shadow-sm h-100'>
      <Card.Body>
        <div className='user-performance-analyze__panel-header'>
          <h5>Tasks With The Highest Time Spent</h5>
        </div>

        <div className='user-performance-analyze__time-list'>
          {tasks.length > 0 ? (
            tasks.map((task, index) => {
              const percent = Math.max(5, Math.round(((Number(task.total_seconds) || 0) / maxSeconds) * 100));

              return (
                <div className='user-performance-analyze__time-item' key={task.task_id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{task.task_name || 'Untitled task'}</strong>
                    <small>{task.project_name || 'Project'}</small>
                    <ProgressBar now={percent} aria-label={`${task.task_name} tracked time`} />
                  </div>
                  <em>{task.total_time_label || '0m'}</em>
                </div>
              );
            })
          ) : (
            <div className='user-performance-analyze__empty'>No tracked tasks found.</div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

function OverdueTasks({ tasks }) {
  return (
    <Card className='user-performance-analyze__panel border-0 shadow-sm h-100'>
      <Card.Body>
        <div className='user-performance-analyze__panel-header'>
          <h5>Most Overdue Tasks</h5>
        </div>

        <div className='user-performance-analyze__table-wrap'>
          <Table responsive className='align-middle mb-0'>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Overdue By</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.task_id}>
                    <td>{task.task_name || 'Untitled task'}</td>
                    <td>{task.project_name || 'Project'}</td>
                    <td>
                      {task.assignee ? (
                        <span className='user-performance-analyze__assignee'>
                          <UserAvatar user={task.assignee} />
                          {task.assignee.name}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{formatDate(task.due_at)}</td>
                    <td>
                      <span className='user-performance-analyze__danger-text'>
                        {formatDayValue(task.overdue_days)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className='user-performance-analyze__empty'>
                    No overdue tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

function UserPerformanceTable({ rows }) {
  return (
    <Card className='user-performance-analyze__panel border-0 shadow-sm'>
      <Card.Body>
        <div className='user-performance-analyze__panel-header'>
          <h5>User Performance Overview</h5>
        </div>

        <div className='user-performance-analyze__table-wrap'>
          <Table responsive className='align-middle mb-0'>
            <thead>
              <tr>
                <th>User</th>
                <th>Total Tracked Time</th>
                <th>Working Hours</th>
                <th>Tracked Days</th>
                <th>Leave Time</th>
                <th>Completed Tasks</th>
                <th>Overdue Tasks</th>
                <th>Tasks Rating</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.user?.id}>
                    <td>
                      <span className='user-performance-analyze__person'>
                        <UserAvatar user={row.user} />
                        <span>
                          <strong>{row.user?.name || 'User'}</strong>
                          <small>{row.user?.email || '-'}</small>
                        </span>
                      </span>
                    </td>
                    <td>{row.total_tracked_label || '0m'}</td>
                    <td>{row.working_label || '0m'}</td>
                    <td>{numberLabel(row.tracked_days)}</td>
                    <td>{formatLeaveTimeValue(row)}</td>
                    <td>{numberLabel(row.completed_tasks)}</td>
                    <td>
                      <span className={Number(row.overdue_tasks) > 0 ? 'user-performance-analyze__danger-text' : 'user-performance-analyze__success-text'}>
                        {numberLabel(row.overdue_tasks)}
                      </span>
                    </td>
                    <td>
                      <StarRating value={row.tasks_rating} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className='user-performance-analyze__empty'>
                    No user performance data found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default function UserPerformanceAnalyze() {
  const user = useSelector((state) => state.auth?.user ?? null);
  const activeCompanyRole = useSelector(
    (state) => state.companyContext?.activeCompany?.membership?.role ?? null,
  );
  const [analysis, setAnalysis] = useState(defaultAnalysis);
  const [filters, setFilters] = useState({
    dateRange: getDefaultDateRange(),
    projectId: '',
    userId: '',
  });
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const companyRole = String(activeCompanyRole ?? user?.company_role ?? user?.user_type ?? '')
    .trim()
    .toLowerCase();
  const canManageCompany = COMPANY_MANAGEMENT_ROLES.has(companyRole);
  const canSelectUser = Boolean(analysis.filters.can_select_user ?? canManageCompany);

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fromDate = formatDateFilterValue(filters.dateRange[0]);
      const toDate = formatDateFilterValue(filters.dateRange[1] ?? filters.dateRange[0]);
      const params = {
        period: 'custom',
      };

      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (filters.projectId) params.project_id = filters.projectId;
      if (canSelectUser && filters.userId) params.user_id = filters.userId;

      const res = await api.get('/companies/my/user-performance-analysis', { params });
      setAnalysis(normalizeAnalysisPayload(res?.data));
    } catch (err) {
      setError(err);
      setAnalysis(defaultAnalysis);
    } finally {
      setLoading(false);
    }
  }, [canSelectUser, filters.dateRange, filters.projectId, filters.userId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis, refreshIndex]);

  const rangeLabel = useMemo(() => {
    const period = analysis.filters.period;
    if (!period?.from_date || !period?.to_date) return period?.label || 'Selected range';

    return `${period.label}: ${formatDate(period.from_date)} - ${formatDate(period.to_date)}`;
  }, [analysis.filters.period]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <section className='user-performance-analyze'>
      <Card className='user-performance-analyze__filters border-0 shadow-sm'>
        <Card.Body>
          <div className='user-performance-analyze__title'>
            <h2>User Performance Analyze</h2>
            <strong>{rangeLabel}</strong>
          </div>

          <Form className={`user-performance-analyze__filter-grid ${canSelectUser ? '' : 'is-self-view'}`}>
            <Form.Group controlId='performance-date-range'>
              <Form.Label>Date Range</Form.Label>
              <Flatpickr
                className='form-control user-performance-analyze__date-range'
                value={filters.dateRange}
                onChange={(dates) => updateFilter('dateRange', dates)}
                disabled={loading}
                options={{
                  mode: 'range',
                  dateFormat: 'Y-m-d',
                }}
                placeholder='YYYY-MM-DD to YYYY-MM-DD'
              />
            </Form.Group>

            <Form.Group controlId='performance-project'>
              <Form.Label>Project</Form.Label>
              <Form.Select
                value={filters.projectId}
                onChange={(event) => updateFilter('projectId', event.target.value)}
                disabled={loading}
              >
                <option value=''>All Projects</option>
                {analysis.filters.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {canSelectUser ? (
              <Form.Group controlId='performance-user'>
                <Form.Label>User</Form.Label>
                <Form.Select
                  value={filters.userId}
                  onChange={(event) => updateFilter('userId', event.target.value)}
                  disabled={loading}
                >
                  <option value=''>All Users</option>
                  {analysis.filters.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            ) : null}

            <Button
              type='button'
              className='user-performance-analyze__refresh'
              onClick={() => setRefreshIndex((current) => current + 1)}
              disabled={loading}
            >
              <i className={`ph ${loading ? 'ph-circle-notch' : 'ph-arrow-clockwise'}`}></i>
              <span>Refresh</span>
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {error ? (
        <Alert variant={Number(error?.status) === 403 ? 'warning' : 'danger'}>
          {error?.message || 'Failed to load user performance analysis.'}
        </Alert>
      ) : null}

      <div className='user-performance-analyze__metrics'>
        {metricCards.map((metric) => (
          <div key={metric.key} className='user-performance-analyze__metric-cell'>
            <MetricCard metric={metric} summary={analysis.summary} />
          </div>
        ))}
      </div>

      <Row className='g-4'>
        <Col xs={12} xl={4}>
          <TopTimeTasks tasks={analysis.top_time_tasks} />
        </Col>
        <Col xs={12} xl={8}>
          <OverdueTasks tasks={analysis.overdue_tasks} />
        </Col>
        <Col xs={12}>
          <UserPerformanceTable rows={analysis.user_performance} />
        </Col>
      </Row>
    </section>
  );
}
