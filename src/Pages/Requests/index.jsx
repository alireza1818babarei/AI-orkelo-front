import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { toastError, toastSuccess } from '../../utils/sweetAlert';

const managerRoles = new Set(['company_owner', 'company_supervisor']);
const REQUESTS_PER_PAGE = 10;

const employeeTabs = [
  { key: 'upcoming', label: 'Upcoming', params: () => ({ status: 'approved', temporal_scope: 'upcoming' }) },
  { key: 'active', label: 'Active', params: () => ({ status: 'approved', temporal_scope: 'active' }) },
  { key: 'history', label: 'History', params: () => ({ status: 'approved', temporal_scope: 'history' }) },
  { key: 'rejected', label: 'Rejected', params: () => ({ status: 'rejected' }) },
];

const managementTabs = [
  { key: 'pending', label: 'Pending Approvals', params: () => ({ status: 'pending' }) },
  { key: 'active', label: 'Active Leaves', params: () => ({ status: 'approved', temporal_scope: 'active' }) },
  { key: 'upcoming', label: 'Upcoming Leaves', params: () => ({ status: 'approved', temporal_scope: 'upcoming' }) },
  { key: 'history', label: 'Leave History', params: () => ({ status: 'approved', temporal_scope: 'history' }) },
  { key: 'rejected', label: 'Rejected', params: () => ({ status: 'rejected' }) },
];

const emptyMeta = {
  current_page: 1,
  last_page: 1,
  per_page: REQUESTS_PER_PAGE,
  total: 0,
};

const defaultSummary = {
  approved_days_this_year: 0,
  approved_this_month: 0,
  pending_requests: 0,
  rejected_this_month: 0,
  upcoming_requests: 0,
  upcoming_leave: null,
};

function toDateInput(date) {
  const normalized = new Date(date);
  normalized.setMinutes(normalized.getMinutes() - normalized.getTimezoneOffset());
  return normalized.toISOString().slice(0, 10);
}

function buildDefaultForm(userId = '') {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  const startDate = toDateInput(start);

  return {
    user_id: userId ? String(userId) : '',
    leave_type: 'daily',
    start_date: startDate,
    end_date: startDate,
    leave_date: startDate,
    hours: '2',
    reason: 'Personal work',
    notes: '',
  };
}

const normalizeCollection = (payload) => {
  const data = Array.isArray(payload?.data) ? payload.data : [];
  const meta = payload?.meta && typeof payload.meta === 'object'
    ? payload.meta
    : emptyMeta;

  return {
    items: data,
    meta: {
      current_page: Number(meta.current_page ?? 1) || 1,
      last_page: Number(meta.last_page ?? 1) || 1,
      per_page: Number(meta.per_page ?? REQUESTS_PER_PAGE) || REQUESTS_PER_PAGE,
      total: Number(meta.total ?? data.length) || 0,
    },
  };
};

const normalizeMembersPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;
  if (Array.isArray(data?.members)) return data.members;
  if (Array.isArray(data)) return data;
  return [];
};

const normalizeSummaryPayload = (payload) => {
  const data = payload?.data ?? payload ?? {};
  return {
    ...defaultSummary,
    ...(data && typeof data === 'object' ? data : {}),
  };
};

const formatDateOnly = (value) => {
  const dateOnly = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dateOnly) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])));
  }

  const date = new Date(value ?? '');
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const formatRequestStart = (request) => formatDateOnly(request.start_date || request.start_at);

const formatRequestEnd = (request) =>
  request.leave_type === 'hourly' ? '-' : formatDateOnly(request.end_date || request.end_at);

const formatLeaveType = (value) => {
  switch (String(value ?? '').toLowerCase()) {
    case 'hourly':
      return 'Hourly Leave';
    case 'daily':
      return 'Daily Leave';
    default:
      return 'Leave';
  }
};

const statusVariant = (status) => {
  switch (String(status ?? '').toLowerCase()) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

const getErrorMessage = (error, fallback) =>
  error?.message || error?.data?.message || fallback;

const LeaveTypeOption = ({ active, icon, title, description, onClick }) => (
  <button
    type='button'
    className={`requests-page__leave-type ${active ? 'is-active' : ''}`}
    aria-pressed={active}
    onClick={onClick}
  >
    <span className='requests-page__leave-type-icon'>
      <i className={icon}></i>
    </span>
    <span className='requests-page__leave-type-copy'>
      <strong>{title}</strong>
      <small>{description}</small>
    </span>
    <i
      className={`requests-page__leave-type-check ph ${
        active ? 'ph-radio-button' : 'ph-circle'
      }`}
      aria-hidden='true'
    ></i>
  </button>
);

function Requests({ variant = 'auto' }) {
  const user = useSelector((s) => s.auth?.user ?? null);
  const activeCompanyRole = useSelector(
    (s) => s.companyContext?.activeCompany?.membership?.role ?? null,
  );

  const companyRole = String(
    activeCompanyRole ?? user?.company_role ?? user?.user_type ?? '',
  ).trim().toLowerCase();

  const isManagementView =
    variant === 'management' ||
    (variant === 'auto' && managerRoles.has(companyRole));

  const tabs = isManagementView ? managementTabs : employeeTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [requests, setRequests] = useState([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [summary, setSummary] = useState(defaultSummary);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusChangingId, setStatusChangingId] = useState(null);
  const [form, setForm] = useState(() => buildDefaultForm(user?.id));

  const activeTabConfig = useMemo(
    () => tabs.find((tab) => tab.key === activeTab) ?? tabs[0],
    [activeTab, tabs],
  );

  useEffect(() => {
    setActiveTab(tabs[0].key);
  }, [isManagementView, tabs]);

  const loadSummary = useCallback(async () => {
    const params = isManagementView ? { scope: 'management' } : {};
    const res = await api.get('/leave-requests/summary', { params });
    setSummary(normalizeSummaryPayload(res?.data));
  }, [isManagementView]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = isManagementView
        ? '/leave-requests/management'
        : '/leave-requests/my';
      const params = {
        page: 1,
        per_page: REQUESTS_PER_PAGE,
        ...activeTabConfig.params(),
      };
      const res = await api.get(endpoint, { params });
      const normalized = normalizeCollection(res?.data);
      setRequests(normalized.items);
      setMeta(normalized.meta);
    } catch (err) {
      setRequests([]);
      setMeta(emptyMeta);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [activeTabConfig, isManagementView]);

  const loadMembers = useCallback(async () => {
    if (!isManagementView) return;

    setMembersLoading(true);

    try {
      const res = await api.get('/companies/my/members');
      const normalizedMembers = normalizeMembersPayload(res?.data);
      setMembers(normalizedMembers);
      setForm((current) => ({
        ...current,
        user_id: current.user_id || String(normalizedMembers[0]?.id ?? ''),
      }));
    } catch (err) {
      setMembers([]);
      toastError(getErrorMessage(err, 'Failed to load company members'));
    } finally {
      setMembersLoading(false);
    }
  }, [isManagementView]);

  useEffect(() => {
    loadSummary().catch((err) => {
      setSummary(defaultSummary);
      toastError(getErrorMessage(err, 'Failed to load leave summary'));
    });
  }, [loadSummary]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const metrics = useMemo(
    () => [
      {
        label: isManagementView ? 'Pending Approvals' : 'Pending Requests',
        value: summary.pending_requests,
        detail: 'Waiting for approval',
        icon: 'ph-duotone ph-hourglass-medium',
        tone: 'amber',
      },
      {
        label: 'Approved This Month',
        value: summary.approved_this_month,
        detail: 'Approved requests',
        icon: 'ph-duotone ph-check-circle',
        tone: 'green',
      },
      {
        label: 'Rejected This Month',
        value: summary.rejected_this_month,
        detail: 'Rejected requests',
        icon: 'ph-duotone ph-x-circle',
        tone: 'red',
      },
    ],
    [isManagementView, summary],
  );

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };

      if (name === 'start_date' && next.end_date < value) {
        next.end_date = value;
      }

      return next;
    });
  };

  const setLeaveType = (leaveType) => {
    setForm((current) => ({
      ...current,
      leave_type: leaveType,
      start_date: current.start_date || current.leave_date,
      end_date: current.end_date || current.start_date || current.leave_date,
      leave_date: current.leave_date || current.start_date,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        leave_type: form.leave_type,
        reason: form.reason,
        notes: form.notes || null,
      };

      if (form.leave_type === 'daily') {
        payload.start_date = form.start_date;
        payload.end_date = form.end_date;
      } else {
        payload.leave_date = form.leave_date;
        payload.hours = Number(form.hours);
      }

      if (isManagementView && form.user_id) {
        payload.user_id = Number(form.user_id);
      }

      await api.post('/leave-requests', payload);
      toastSuccess('Request submitted');
      setForm(buildDefaultForm(isManagementView ? form.user_id : user?.id));
      await Promise.all([loadRequests(), loadSummary()]);
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to submit request'));
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (requestId, action) => {
    setStatusChangingId(requestId);

    try {
      await api.patch(`/leave-requests/${requestId}/${action}`);
      toastSuccess(action === 'approve' ? 'Request approved' : 'Request rejected');
      await Promise.all([loadRequests(), loadSummary()]);
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to update request'));
    } finally {
      setStatusChangingId(null);
    }
  };

  return (
    <section className='requests-page'>
      <Card className='requests-page__shell border-0 shadow-sm'>
        <Card.Body>
          <div className='requests-page__header'>
            <div>
              <h2>{isManagementView ? 'Requests Management' : 'Requests'}</h2>
              <p>
                {isManagementView
                  ? 'Manage team leave requests and approvals'
                  : 'Manage and track your leave requests'}
              </p>
            </div>
          </div>

          <ul className='requests-page__tabs'>
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  type='button'
                  className={tab.key === activeTab ? 'is-active' : ''}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          <Row className='g-4'>
            <Col xl={isManagementView ? 8 : 9}>
              <Row className='g-3 mb-4 requests-page__metrics'>
                {metrics.map((metric) => (
                  <Col key={metric.label} xs={12} md={4}>
                    <div className='requests-page__metric'>
                      <span
                        className={`requests-page__metric-icon is-${metric.tone}`}
                      >
                        <i className={metric.icon}></i>
                      </span>
                      <span>
                        <small>{metric.label}</small>
                        <strong>{metric.value}</strong>
                        <em>{metric.detail}</em>
                      </span>
                    </div>
                  </Col>
                ))}
              </Row>

              <Card className='requests-page__panel border-0'>
                <Card.Body>
                  <div className='requests-page__panel-header'>
                    <h5>{activeTabConfig.label}</h5>
                    <span className='requests-page__total'>{meta.total} request(s)</span>
                  </div>

                  {error ? (
                    <Alert variant='danger'>
                      {getErrorMessage(error, 'Failed to load requests')}
                    </Alert>
                  ) : null}

                  <Table responsive className='align-middle requests-page__table'>
                    <thead>
                      <tr>
                        {isManagementView ? <th>Employee</th> : null}
                        <th>Type</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Status</th>
                        {isManagementView ? <th>Actions</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={isManagementView ? 8 : 6}
                            className='requests-page__empty'
                          >
                            Loading requests...
                          </td>
                        </tr>
                      ) : requests.length > 0 ? (
                        requests.map((request) => (
                          <tr key={request.id}>
                            {isManagementView ? (
                              <td>
                                <div className='requests-page__employee'>
                                  <span>
                                    {String(request.requester?.name || '?').slice(0, 1)}
                                  </span>
                                  <span>
                                    <strong>{request.requester?.name || 'User'}</strong>
                                    <small>{request.requester?.email || '-'}</small>
                                  </span>
                                </div>
                              </td>
                            ) : null}
                            <td>
                              <Badge
                                bg={
                                  request.leave_type === 'hourly'
                                    ? 'secondary'
                                    : 'primary'
                                }
                              >
                                {formatLeaveType(request.leave_type)}
                              </Badge>
                            </td>
                            <td>{formatRequestStart(request)}</td>
                            <td>{formatRequestEnd(request)}</td>
                            <td>{request.duration_label || '-'}</td>
                            <td>{request.reason || '-'}</td>
                            <td>
                              <Badge bg={statusVariant(request.status)}>
                                {request.status}
                              </Badge>
                            </td>
                            {isManagementView ? (
                              <td>
                                <div className='requests-page__row-actions'>
                                  <Button
                                    type='button'
                                    variant='success'
                                    size='sm'
                                    aria-label='Approve request'
                                    disabled={
                                      request.status !== 'pending' ||
                                      statusChangingId === request.id
                                    }
                                    onClick={() => changeStatus(request.id, 'approve')}
                                  >
                                    <i className='ph ph-check'></i>
                                  </Button>
                                  <Button
                                    type='button'
                                    variant='danger'
                                    size='sm'
                                    aria-label='Reject request'
                                    disabled={
                                      request.status !== 'pending' ||
                                      statusChangingId === request.id
                                    }
                                    onClick={() => changeStatus(request.id, 'reject')}
                                  >
                                    <i className='ph ph-x'></i>
                                  </Button>
                                </div>
                              </td>
                            ) : null}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={isManagementView ? 8 : 6}
                            className='requests-page__empty'
                          >
                            No requests found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={isManagementView ? 4 : 3}>
              <Card className='requests-page__form-card border-0'>
                <Card.Body>
                  <div className='requests-page__form-header'>
                    <h5>
                      New Request
                      {isManagementView ? <span> For Employee</span> : null}
                    </h5>
                  </div>

                  <Form className='requests-page__form' onSubmit={handleSubmit}>
                    {isManagementView ? (
                      <Form.Group controlId='request-employee'>
                        <Form.Label>Employee</Form.Label>
                        <Form.Select
                          name='user_id'
                          value={form.user_id}
                          onChange={handleFormChange}
                          disabled={membersLoading || submitting}
                        >
                          <option value=''>
                            {membersLoading ? 'Loading employees...' : 'Select employee'}
                          </option>
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    ) : null}

                    <div>
                      <Form.Label>Leave Type</Form.Label>
                      <div className='requests-page__leave-types'>
                        <LeaveTypeOption
                          active={form.leave_type === 'daily'}
                          icon='ph-duotone ph-calendar'
                          title='Daily Leave'
                          description='Full day(s) leave'
                          onClick={() => setLeaveType('daily')}
                        />
                        <LeaveTypeOption
                          active={form.leave_type === 'hourly'}
                          icon='ph-duotone ph-clock'
                          title='Hourly Leave'
                          description='Partial leave for few hours'
                          onClick={() => setLeaveType('hourly')}
                        />
                      </div>
                    </div>

                    {form.leave_type === 'daily' ? (
                      <div className='requests-page__date-grid'>
                        <Form.Group controlId='request-start-date'>
                          <Form.Label>Start Date</Form.Label>
                          <Form.Control
                            type='date'
                            name='start_date'
                            value={form.start_date}
                            onChange={handleFormChange}
                            disabled={submitting}
                            required
                          />
                        </Form.Group>

                        <Form.Group controlId='request-end-date'>
                          <Form.Label>End Date</Form.Label>
                          <Form.Control
                            type='date'
                            name='end_date'
                            value={form.end_date}
                            min={form.start_date}
                            onChange={handleFormChange}
                            disabled={submitting}
                            required
                          />
                        </Form.Group>
                      </div>
                    ) : (
                      <div className='requests-page__date-grid'>
                        <Form.Group controlId='request-leave-date'>
                          <Form.Label>Leave Date</Form.Label>
                          <Form.Control
                            type='date'
                            name='leave_date'
                            value={form.leave_date}
                            onChange={handleFormChange}
                            disabled={submitting}
                            required
                          />
                        </Form.Group>

                        <Form.Group controlId='request-hours'>
                          <Form.Label>Hours</Form.Label>
                          <Form.Control
                            type='number'
                            name='hours'
                            value={form.hours}
                            min='0.5'
                            max='24'
                            step='0.5'
                            onChange={handleFormChange}
                            disabled={submitting}
                            required
                          />
                        </Form.Group>
                      </div>
                    )}

                    <Form.Group controlId='request-reason'>
                      <Form.Label>Reason</Form.Label>
                      <Form.Select
                        name='reason'
                        value={form.reason}
                        onChange={handleFormChange}
                        disabled={submitting}
                      >
                        <option>Personal work</option>
                        <option>Family event</option>
                        <option>Doctor appointment</option>
                        <option>Vacation</option>
                        <option>Other</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId='request-notes'>
                      <Form.Label>Notes Optional</Form.Label>
                      <Form.Control
                        as='textarea'
                        rows={4}
                        name='notes'
                        value={form.notes}
                        onChange={handleFormChange}
                        placeholder='Add additional notes...'
                        disabled={submitting}
                      />
                    </Form.Group>

                    <div className='requests-page__form-actions'>
                      <Button
                        type='button'
                        variant='outline-secondary'
                        disabled={submitting}
                        onClick={() => setForm(buildDefaultForm(form.user_id))}
                      >
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        className='requests-page__primary-action'
                        disabled={submitting}
                      >
                        Submit Request
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </section>
  );
}

export default Requests;
