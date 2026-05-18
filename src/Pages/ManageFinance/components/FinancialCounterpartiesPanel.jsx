import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Table,
} from 'react-bootstrap';
import AppPagination from '../../../Components/Common/AppPagination';
import { TableSkeleton } from '../../../Components/Common/LoadingSkeleton';
import { alertConfirm, toastError, toastSuccess } from '../../../utils/sweetAlert';
import {
  financialCounterpartiesErrorSelector,
  financialCounterpartiesLoadingSelector,
  financialCounterpartiesMetaSelector,
  financialCounterpartiesSelector,
  financialCounterpartiesTotalSelector,
  financialCounterpartyCreateErrorSelector,
  financialCounterpartyCreateStatusSelector,
  financialCounterpartyDeleteErrorSelector,
  financialCounterpartyDeleteStatusSelector,
  financialCounterpartyUpdateErrorSelector,
  financialCounterpartyUpdateStatusSelector,
} from '../../../store/FileManager/counterparties/counterparties.selector';
import {
  createFinancialCounterparty,
  deleteFinancialCounterparty,
  getFinancialCounterparties,
  updateFinancialCounterparty,
} from '../../../store/FileManager/counterparties/counterparties.thunk';
import { resetFinancialCounterpartyMutationState } from '../../../store/FileManager/counterparties/counterparties.slice';

const getCounterpartyForm = (counterparty = null) => ({
  fullName: String(counterparty?.fullName ?? '').trim(),
  cardNumber: String(counterparty?.cardNumber ?? '').trim(),
  iban: String(counterparty?.iban ?? '').trim(),
  account: String(counterparty?.account ?? '').trim(),
  bankName: String(counterparty?.bankName ?? '').trim(),
});

const validateCounterpartyForm = (form) => {
  if (!String(form?.fullName ?? '').trim()) {
    return 'Counterparty full name is required.';
  }

  return null;
};

function CounterpartyFormFields({ form, onChange, disabled, error }) {
  return (
    <Form className='manage-finance__create-form'>
      <Form.Group>
        <Form.Label>Full Name</Form.Label>
        <Form.Control
          type='text'
          value={form.fullName}
          onChange={onChange('fullName')}
          placeholder='Ali Ahmadi'
          disabled={disabled}
        />
      </Form.Group>

      <Row className='g-3'>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type='text'
              value={form.cardNumber}
              onChange={onChange('cardNumber')}
              placeholder='6037991234567890'
              disabled={disabled}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>IBAN</Form.Label>
            <Form.Control
              type='text'
              value={form.iban}
              onChange={onChange('iban')}
              placeholder='IR...'
              disabled={disabled}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className='g-3'>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Account</Form.Label>
            <Form.Control
              type='text'
              value={form.account}
              onChange={onChange('account')}
              placeholder='Account number'
              disabled={disabled}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Bank Name</Form.Label>
            <Form.Control
              type='text'
              value={form.bankName}
              onChange={onChange('bankName')}
              placeholder='Mellat'
              disabled={disabled}
            />
          </Form.Group>
        </Col>
      </Row>

      {error?.message ? (
        <Alert variant='danger' className='mb-0'>
          {error.message}
        </Alert>
      ) : null}
    </Form>
  );
}

export default function FinancialCounterpartiesPanel({ enabled = true }) {
  const dispatch = useDispatch();

  const counterparties = useSelector(financialCounterpartiesSelector);
  const loading = useSelector(financialCounterpartiesLoadingSelector);
  const error = useSelector(financialCounterpartiesErrorSelector);
  const meta = useSelector(financialCounterpartiesMetaSelector);
  const total = useSelector(financialCounterpartiesTotalSelector);
  const createStatus = useSelector(financialCounterpartyCreateStatusSelector);
  const createError = useSelector(financialCounterpartyCreateErrorSelector);
  const updateStatus = useSelector(financialCounterpartyUpdateStatusSelector);
  const updateError = useSelector(financialCounterpartyUpdateErrorSelector);
  const deleteStatus = useSelector(financialCounterpartyDeleteStatusSelector);
  const deleteError = useSelector(financialCounterpartyDeleteErrorSelector);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCounterparty, setEditingCounterparty] = useState(null);
  const [createForm, setCreateForm] = useState(getCounterpartyForm());
  const [editForm, setEditForm] = useState(getCounterpartyForm());
  const deferredSearchTerm = useDeferredValue(searchTerm);

  useEffect(() => {
    if (!enabled) return;

    dispatch(
      getFinancialCounterparties({
        page,
        search: deferredSearchTerm,
        perPage: 10,
      }),
    );
  }, [deferredSearchTerm, dispatch, enabled, page]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchTerm]);

  const currentPage = Number(meta?.current_page) || 1;
  const lastPage = Number(meta?.last_page) || 1;
  const perPage = Number(meta?.per_page) || 10;

  const paginationSummary = useMemo(() => {
    const normalizedTotal = Number(meta?.total ?? total ?? 0);
    const start = normalizedTotal ? (currentPage - 1) * perPage + 1 : 0;
    const end = normalizedTotal
      ? Math.min(currentPage * perPage, normalizedTotal)
      : 0;

    return normalizedTotal
      ? `Showing ${start} to ${end} of ${normalizedTotal} counterparties`
      : 'No counterparties found.';
  }, [currentPage, meta?.total, perPage, total]);

  const handleRefresh = () => {
    dispatch(
      getFinancialCounterparties({
        page,
        search: deferredSearchTerm,
        perPage: 10,
      }),
    );
  };

  const buildChangeHandler = (setter) => (field) => (event) => {
    const nextValue = event.target.value;

    setter((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  const handleOpenCreateModal = () => {
    dispatch(resetFinancialCounterpartyMutationState());
    setCreateForm(getCounterpartyForm());
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (createStatus === 'loading') return;

    setCreateModalOpen(false);
    dispatch(resetFinancialCounterpartyMutationState());
  };

  const handleOpenEditModal = (counterparty) => {
    dispatch(resetFinancialCounterpartyMutationState());
    setEditingCounterparty(counterparty);
    setEditForm(getCounterpartyForm(counterparty));
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (updateStatus === 'loading') return;

    setEditModalOpen(false);
    setEditingCounterparty(null);
    dispatch(resetFinancialCounterpartyMutationState());
  };

  const handleCreateCounterparty = async () => {
    const validationError = validateCounterpartyForm(createForm);

    if (validationError) {
      toastError(validationError);
      return;
    }

    const resultAction = await dispatch(createFinancialCounterparty(createForm));

    if (createFinancialCounterparty.fulfilled.match(resultAction)) {
      toastSuccess(
        resultAction.payload?.message || 'Counterparty created successfully.',
      );
      setCreateModalOpen(false);
      dispatch(resetFinancialCounterpartyMutationState());
      setSearchTerm('');
      setPage(1);
      return;
    }

    toastError(resultAction.payload?.message || 'Failed to create counterparty.');
  };

  const handleUpdateCounterparty = async () => {
    if (!editingCounterparty?.id) return;

    const validationError = validateCounterpartyForm(editForm);

    if (validationError) {
      toastError(validationError);
      return;
    }

    const resultAction = await dispatch(
      updateFinancialCounterparty({
        counterpartyId: editingCounterparty.id,
        payload: editForm,
      }),
    );

    if (updateFinancialCounterparty.fulfilled.match(resultAction)) {
      toastSuccess(
        resultAction.payload?.message || 'Counterparty updated successfully.',
      );
      setEditModalOpen(false);
      setEditingCounterparty(null);
      dispatch(resetFinancialCounterpartyMutationState());
      return;
    }

    toastError(resultAction.payload?.message || 'Failed to update counterparty.');
  };

  const handleDeleteCounterparty = async (counterparty) => {
    if (!counterparty?.id) return;

    const result = await alertConfirm({
      title: 'Delete counterparty?',
      text: 'This counterparty will be removed from future selection lists.',
      confirmText: 'Delete',
    });

    if (!result.isConfirmed) return;

    const resultAction = await dispatch(
      deleteFinancialCounterparty({
        counterpartyId: counterparty.id,
      }),
    );

    if (deleteFinancialCounterparty.fulfilled.match(resultAction)) {
      toastSuccess(
        resultAction.payload?.message || 'Counterparty deleted successfully.',
      );
      return;
    }

    toastError(resultAction.payload?.message || 'Failed to delete counterparty.');
  };

  return (
    <Card className='manage-finance__panel manage-finance__counterparties-card border-0'>
      <Card.Body>
        <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4'>
          <div>
            <Badge bg='primary' className='mb-2'>
              Counterparties
            </Badge>
            <h5 className='mb-1'>Counterparties</h5>
            <p className='text-muted mb-0'>
              Manage people or accounts that can be linked to deposit operations.
            </p>
          </div>

          <div className='manage-finance__counterparty-toolbar'>
            <Form.Control
              type='search'
              className='manage-finance__operations-search'
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder='Search counterparties...'
            />
            <Button variant='outline-secondary' onClick={handleRefresh} disabled={loading}>
              Refresh
            </Button>
            <Button onClick={handleOpenCreateModal}>Add Counterparty</Button>
          </div>
        </div>

        {error?.message ? <Alert variant='danger'>{error.message}</Alert> : null}

        {deleteError?.message ? (
          <Alert variant='danger'>{deleteError.message}</Alert>
        ) : null}

        {loading ? (
          <TableSkeleton
            rows={5}
            columns={6}
            wrapperClassName='manage-finance__counterparty-table'
            tableClassName='table table-bordered align-middle mb-0'
          />
        ) : counterparties.length > 0 ? (
          <div className='table-responsive manage-finance__counterparty-table'>
            <Table className='table table-bordered align-middle mb-0'>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Bank</th>
                  <th>Card Number</th>
                  <th>IBAN</th>
                  <th>Account</th>
                  <th className='text-end'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {counterparties.map((counterparty) => (
                  <tr key={counterparty.id}>
                    <td>
                      <strong>{counterparty.fullName || '-'}</strong>
                    </td>
                    <td>{counterparty.bankName || '-'}</td>
                    <td>{counterparty.cardNumber || '-'}</td>
                    <td>{counterparty.iban || '-'}</td>
                    <td>{counterparty.account || '-'}</td>
                    <td>
                      <div className='manage-finance__counterparty-actions'>
                        <Button
                          variant='light-success'
                          size='sm'
                          onClick={() => handleOpenEditModal(counterparty)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant='light-danger'
                          size='sm'
                          onClick={() => handleDeleteCounterparty(counterparty)}
                          disabled={deleteStatus === 'loading'}
                        >
                          {deleteStatus === 'loading' ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className='manage-finance__state manage-finance__state--empty'>
            <i className='ph-duotone ph-address-book'></i>
            <span>No counterparties available yet.</span>
            <Button onClick={handleOpenCreateModal}>Add Counterparty</Button>
          </div>
        )}
      </Card.Body>

      <Card.Footer className='bg-transparent border-0 pt-0'>
        <AppPagination
          currentPage={currentPage}
          lastPage={lastPage}
          summary={paginationSummary}
          disabled={loading}
          onPageChange={(nextPage) => setPage(nextPage)}
        />
      </Card.Footer>

      <Modal show={createModalOpen} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton={createStatus !== 'loading'}>
          <Modal.Title>Add Counterparty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CounterpartyFormFields
            form={createForm}
            onChange={buildChangeHandler(setCreateForm)}
            disabled={createStatus === 'loading'}
            error={createError}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='outline-secondary'
            onClick={handleCloseCreateModal}
            disabled={createStatus === 'loading'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCounterparty}
            disabled={createStatus === 'loading'}
          >
            {createStatus === 'loading' ? 'Creating...' : 'Create Counterparty'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={editModalOpen} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton={updateStatus !== 'loading'}>
          <Modal.Title>Edit Counterparty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CounterpartyFormFields
            form={editForm}
            onChange={buildChangeHandler(setEditForm)}
            disabled={updateStatus === 'loading'}
            error={updateError}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='outline-secondary'
            onClick={handleCloseEditModal}
            disabled={updateStatus === 'loading'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateCounterparty}
            disabled={updateStatus === 'loading'}
          >
            {updateStatus === 'loading' ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
