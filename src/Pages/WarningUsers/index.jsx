import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import api from '../../api/axios';
import { formatFullDate, formatMonthDayTime } from '../../utils/date';
import { resolveUserAvatarWithFallback } from '../../utils/mediaUrl';
import { alertConfirm, toastError, toastSuccess } from '../../utils/sweetAlert';

const WARNING_LEVELS = [
  {
    value: 'low',
    label: 'Low',
    detail: 'Minor issues',
    icon: 'ph ph-warning',
  },
  {
    value: 'medium',
    label: 'Medium',
    detail: 'Moderate issues',
    icon: 'ph ph-warning-octagon',
  },
  {
    value: 'high',
    label: 'High',
    detail: 'Serious issues',
    icon: 'ph ph-warning-diamond',
  },
];

const initialForm = {
  title: '',
  description: '',
  level: 'low',
};

const normalizeUsersPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;

  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data)) return data;
  return [];
};

const normalizeWarningHistoryPayload = (payload) => {
  const root = payload?.data ?? payload ?? {};
  const data = root?.data ?? root;

  if (Array.isArray(data?.warnings)) return data.warnings;
  if (Array.isArray(data)) return data;
  return [];
};

const formatRole = (role) => {
  switch (String(role ?? '').toLowerCase()) {
    case 'company_owner':
      return 'Company Owner';
    case 'company_supervisor':
      return 'Company Supervisor';
    default:
      return 'Member';
  }
};

const getLevelLabel = (level) => {
  switch (String(level ?? '').toLowerCase()) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return '-';
  }
};

const getErrorMessage = (err, fallback) =>
  err?.message || err?.data?.message || fallback;

function WarningUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('create');
  const [formMode, setFormMode] = useState('create');
  const [editingWarning, setEditingWarning] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/warnings/users');
      setUsers(normalizeUsersPayload(res?.data));
    } catch (err) {
      setUsers([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (userId = selectedUser?.id) => {
    if (!userId) return;

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const res = await api.get(`/warnings/users/${userId}/history`);
      setHistoryItems(normalizeWarningHistoryPayload(res?.data));
    } catch (err) {
      setHistoryItems([]);
      setHistoryError(err);
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedUser?.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!selectedUser?.id || activeModalTab !== 'history') return;
    loadHistory(selectedUser.id);
  }, [activeModalTab, loadHistory, selectedUser?.id]);

  const filteredUsers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return users.filter((user) => {
      const name = String(user?.name ?? '').toLowerCase();
      const email = String(user?.email ?? '').toLowerCase();

      return !searchTerm || name.includes(searchTerm) || email.includes(searchTerm);
    });
  }, [search, users]);

  const resetFormState = () => {
    setForm(initialForm);
    setFormMode('create');
    setEditingWarning(null);
  };

  const openWarningModal = (user) => {
    setSelectedUser(user);
    setActiveModalTab('create');
    setHistoryItems([]);
    setHistoryError(null);
    resetFormState();
  };

  const closeWarningModal = () => {
    if (submitting || deletingId) return;
    setSelectedUser(null);
    setActiveModalTab('create');
    setHistoryItems([]);
    setHistoryError(null);
    resetFormState();
  };

  const switchModalTab = (tab) => {
    setActiveModalTab(tab);
  };

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const startEditWarning = (warning) => {
    setEditingWarning(warning);
    setFormMode('edit');
    setActiveModalTab('create');
    setForm({
      title: warning?.title ?? '',
      description: warning?.description ?? '',
      level: warning?.level ?? 'low',
    });
  };

  const backToHistory = () => {
    resetFormState();
    setActiveModalTab('history');
  };

  const submitWarning = async (event) => {
    event.preventDefault();

    if (!selectedUser?.id) return;

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      toastError('Title and description are required');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        level: form.level,
      };

      if (formMode === 'edit' && editingWarning?.id) {
        await api.patch(`/warnings/${editingWarning.id}`, payload);
        toastSuccess('Warning updated');
        resetFormState();
        setActiveModalTab('history');
        await Promise.all([loadHistory(selectedUser.id), loadUsers()]);
        return;
      }

      await api.post('/warnings', {
        user_id: selectedUser.id,
        ...payload,
      });

      toastSuccess('Warning created');
      setForm(initialForm);
      await Promise.all([loadHistory(selectedUser.id), loadUsers()]);
    } catch (err) {
      toastError(
        getErrorMessage(
          err,
          formMode === 'edit' ? 'Failed to update warning' : 'Failed to create warning',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteWarning = async (warning) => {
    if (!warning?.id || deletingId) return;

    const result = await alertConfirm({
      title: 'Delete warning?',
      text: 'This warning will be removed from the user history.',
      confirmText: 'Delete',
    });

    if (!result.isConfirmed) return;

    setDeletingId(warning.id);

    try {
      await api.delete(`/warnings/${warning.id}`);
      toastSuccess('Warning deleted');
      await Promise.all([loadHistory(selectedUser?.id), loadUsers()]);
    } catch (err) {
      toastError(getErrorMessage(err, 'Failed to delete warning'));
    } finally {
      setDeletingId(null);
    }
  };

  const renderWarningForm = () => (
    <Form onSubmit={submitWarning}>
      {formMode === 'edit' ? (
        <div className='warning-create-modal__edit-toolbar'>
          <Button
            type='button'
            variant='outline-secondary'
            size='sm'
            onClick={backToHistory}
            disabled={submitting}
          >
            <i className='ph ph-arrow-left'></i>
            Back to History
          </Button>
        </div>
      ) : null}

      <Form.Group controlId='warning-title' className='mb-3'>
        <Form.Label>Warning Title</Form.Label>
        <Form.Control
          name='title'
          value={form.title}
          maxLength={120}
          placeholder='Enter warning title...'
          onChange={updateForm}
          disabled={submitting}
          required
        />
        <Form.Text>{form.title.length}/120</Form.Text>
      </Form.Group>

      <Form.Group controlId='warning-description' className='mb-3'>
        <Form.Label>Description</Form.Label>
        <Form.Control
          as='textarea'
          rows={4}
          name='description'
          value={form.description}
          maxLength={1000}
          placeholder='Enter warning description...'
          onChange={updateForm}
          disabled={submitting}
          required
        />
        <Form.Text>{form.description.length}/1000</Form.Text>
      </Form.Group>

      <div className='warning-create-modal__levels'>
        <Form.Label>Warning Level</Form.Label>
        <Row className='g-2'>
          {WARNING_LEVELS.map((level) => (
            <Col xs={12} md={4} key={level.value}>
              <button
                type='button'
                className={`warning-create-modal__level is-${level.value} ${
                  form.level === level.value ? 'is-active' : ''
                }`}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    level: level.value,
                  }))
                }
                disabled={submitting}
              >
                <i className={level.icon}></i>
                <strong>{level.label}</strong>
                <small>{level.detail}</small>
              </button>
            </Col>
          ))}
        </Row>
      </div>

      <div className='warning-create-modal__actions'>
        <Button
          type='button'
          variant='outline-secondary'
          onClick={formMode === 'edit' ? backToHistory : closeWarningModal}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type='submit' className='warning-create-modal__submit' disabled={submitting}>
          {submitting ? (
            <Spinner size='sm' animation='border' aria-hidden='true' />
          ) : formMode === 'edit' ? (
            'Update Warning'
          ) : (
            'Create Warning'
          )}
        </Button>
      </div>
    </Form>
  );

  const renderHistory = () => {
    if (historyLoading) {
      return (
        <div className='warning-create-modal__state'>
          <Spinner animation='border' size='sm' />
          <span>Loading history...</span>
        </div>
      );
    }

    if (historyError) {
      return (
        <Alert variant='danger' className='mb-0'>
          {getErrorMessage(historyError, 'Failed to load warning history')}
        </Alert>
      );
    }

    if (historyItems.length === 0) {
      return (
        <div className='warning-create-modal__state'>
          <i className='ph ph-clock-counter-clockwise'></i>
          <span>No warning history found.</span>
        </div>
      );
    }

    return (
      <div className='warning-create-modal__history-list'>
        {historyItems.map((warning) => (
          <article key={warning.id} className={`warning-create-modal__history-item is-${warning.level}`}>
            <div className='warning-create-modal__history-main'>
              <div>
                <span className={`warning-create-modal__history-level is-${warning.level}`}>
                  {getLevelLabel(warning.level)}
                </span>
                <h6>{warning.title}</h6>
              </div>
              <small>{formatMonthDayTime(warning.created_at, { useUTC: false })}</small>
            </div>

            <p>{warning.description}</p>

            <div className='warning-create-modal__history-actions'>
              <Button
                type='button'
                variant='outline-primary'
                size='sm'
                onClick={() => startEditWarning(warning)}
                disabled={Boolean(deletingId)}
              >
                <i className='ph ph-pencil-simple'></i>
                Edit
              </Button>
              <Button
                type='button'
                variant='outline-danger'
                size='sm'
                onClick={() => deleteWarning(warning)}
                disabled={deletingId === warning.id}
              >
                {deletingId === warning.id ? (
                  <Spinner animation='border' size='sm' />
                ) : (
                  <>
                    <i className='ph ph-trash'></i>
                    Delete
                  </>
                )}
              </Button>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <section className='warning-users-page'>
      <Card className='warning-users-page__header border-0 shadow-sm'>
        <Card.Body>
          <div>
            <h2>Warning Users</h2>
            <p>Manage warnings for company users.</p>
          </div>
        </Card.Body>
      </Card>

      <Card className='warning-users-page__panel border-0 shadow-sm'>
        <Card.Body>
          <div className='warning-users-page__toolbar'>
            <Form.Control
              type='search'
              value={search}
              placeholder='Search users...'
              aria-label='Search users'
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {error ? (
            <Alert
              variant={Number(error?.status) === 403 ? 'warning' : 'danger'}
              className='mb-4'
            >
              {getErrorMessage(error, 'Failed to load warning users')}
            </Alert>
          ) : null}

          {loading ? (
            <div className='warning-users-page__state'>
              <Spinner animation='border' size='sm' />
              <span>Loading users...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className='warning-users-page__grid'>
              {filteredUsers.map((user) => {
                const latestLevel = user?.latest_warning_level
                  ? String(user.latest_warning_level).toLowerCase()
                  : 'none';

                return (
                  <button
                    type='button'
                    key={user.id}
                    className={`warning-users-page__user-card is-${latestLevel}`}
                    onClick={() => openWarningModal(user)}
                  >
                    <span className='warning-users-page__avatar'>
                      <img
                        src={resolveUserAvatarWithFallback(user?.avatar, user?.email || user?.name)}
                        alt=''
                      />
                    </span>

                    <span className='warning-users-page__user-main'>
                      <strong>{user?.name || 'User'}</strong>
                      <small>{formatRole(user?.role)}</small>
                    </span>

                    <span className='warning-users-page__meta'>
                      {user?.last_warning_at ? (
                        <>
                          <i className='ph ph-calendar-blank'></i>
                          Last warning: {formatFullDate(user.last_warning_at, { useUTC: false })}
                        </>
                      ) : (
                        <>
                          <i className='ph ph-info'></i>
                          No warnings yet
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className='warning-users-page__state'>
              <i className='ph ph-users'></i>
              <span>No users found.</span>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={Boolean(selectedUser)}
        onHide={closeWarningModal}
        centered
        className='warning-create-modal'
      >
        <Modal.Header closeButton={!submitting && !deletingId}>
          <Modal.Title>
            {formMode === 'edit' ? 'Edit Warning' : 'Manage Warnings'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className='warning-create-modal__user'>
            <img
              src={resolveUserAvatarWithFallback(
                selectedUser?.avatar,
                selectedUser?.email || selectedUser?.name,
              )}
              alt=''
            />
            <span>
              <strong>{selectedUser?.name || 'User'}</strong>
              <small>{formatRole(selectedUser?.role)}</small>
            </span>
          </div>

          {formMode !== 'edit' ? (
            <div className='warning-create-modal__tabs' role='tablist'>
              <button
                type='button'
                className={activeModalTab === 'create' ? 'is-active' : ''}
                onClick={() => switchModalTab('create')}
              >
                Create Warning
              </button>
              <button
                type='button'
                className={activeModalTab === 'history' ? 'is-active' : ''}
                onClick={() => switchModalTab('history')}
              >
                History
              </button>
            </div>
          ) : null}

          {activeModalTab === 'history' && formMode !== 'edit'
            ? renderHistory()
            : renderWarningForm()}
        </Modal.Body>
      </Modal>
    </section>
  );
}

export default WarningUsers;
