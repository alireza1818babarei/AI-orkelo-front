import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap';
import Flatpickr from 'react-flatpickr';
import api from '../../../api/axios';
import AppPagination from '../../../Components/Common/AppPagination';
import {
  FinanceOperationDetailSkeleton,
  FinanceOperationListSkeleton,
} from '../../../Components/Common/LoadingSkeleton';
import { formatFullDate, formatMonthDayTime } from '../../../utils/date';
import { alertConfirm, toastError, toastSuccess } from '../../../utils/sweetAlert';
import {
  financialOperationCreateErrorSelector,
  financialOperationCreateStatusSelector,
  financialOperationRecordDeleteErrorSelector,
  financialOperationRecordDeleteStatusSelector,
  financialOperationUpdateErrorSelector,
  financialOperationUpdateStatusSelector,
  currentFinancialOperationErrorSelector,
  currentFinancialOperationLoadingSelector,
  currentFinancialOperationSelector,
  financialOperationDeleteErrorSelector,
  financialOperationDeletingFileIdsSelector,
  financialOperationFileUploadErrorSelector,
  financialOperationFileUploadStatusSelector,
  financialOperationSummaryErrorSelector,
  financialOperationSummaryLoadingSelector,
  financialOperationSummarySelector,
  financialOperationStatusUpdateErrorSelector,
  financialOperationStatusUpdateStatusSelector,
  financialOperationsErrorSelector,
  financialOperationsLoadingSelector,
  financialOperationsMetaSelector,
  financialOperationsSelector,
  financialOperationsTotalSelector,
} from '../../../store/FileManager/operations/operations.selector';
import {
  createFinancialOperation,
  deleteFinancialOperation,
  deleteFinancialOperationFile,
  getFinancialOperationDetail,
  getFinancialOperations,
  updateFinancialOperation,
  updateFinancialOperationStatus,
  uploadFinancialOperationFile,
} from '../../../store/FileManager/operations/operations.thunk';
import {
  clearFinancialOperationDetail,
  resetFinancialOperationMutationState,
} from '../../../store/FileManager/operations/operations.slice';
import {
  financialCounterpartiesLoadingSelector,
  financialCounterpartiesSelector,
} from '../../../store/FileManager/counterparties/counterparties.selector';
import { getFinancialCounterparties } from '../../../store/FileManager/counterparties/counterparties.thunk';

const OPERATIONS_PAGE_SIZE = 5;

const getDefaultOperationDateTime = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const toDateTimeLocalValue = (value) => {
  if (!value) return getDefaultOperationDateTime();

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value).replace(' ', 'T').slice(0, 16);
  }

  const timezoneOffset = parsed.getTimezoneOffset() * 60 * 1000;
  return new Date(parsed.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const formatDateFilterValue = (value) => {
  if (!value) return '';

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getDateRangeFilters = (range = []) => ({
  fromDate: formatDateFilterValue(range[0]),
  toDate: formatDateFilterValue(range[1]),
});

const getOperationForm = (operation = null) => ({
  title: String(operation?.title ?? '').trim(),
  type:
    String(operation?.type ?? '').trim().toLowerCase() === 'deposit'
      ? 'deposit'
      : 'withdrawal',
  amount: String(operation?.amount ?? '').trim(),
  operatedAt: toDateTimeLocalValue(operation?.operatedAt),
  account: String(operation?.account ?? '').trim(),
  counterpartyId:
    operation?.counterpartyId == null ? '' : String(operation.counterpartyId),
  description: String(operation?.description ?? '').trim(),
  depositSource: String(operation?.depositSource ?? '').trim(),
});

const formatAmount = (value) => {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};

const formatBytes = (bytes) => {
  const size = Number(bytes ?? 0);

  if (!Number.isFinite(size) || size <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const value = size / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const getOperationTypeVariant = (type) =>
  String(type ?? '').trim().toLowerCase() === 'deposit' ? 'success' : 'warning';

// Keep status metadata in one place so labels, colors, and actions stay aligned.
const FINANCIAL_OPERATION_STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Pending',
    variant: 'warning',
    iconClass: 'ph-duotone ph-clock',
  },
  {
    value: 'approved',
    label: 'Approved',
    variant: 'success',
    iconClass: 'ph-duotone ph-check-circle',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    variant: 'danger',
    iconClass: 'ph-duotone ph-x-circle',
  },
];

const getOperationStatusOption = (status) => {
  const normalized = String(status ?? '').trim().toLowerCase();

  return (
    FINANCIAL_OPERATION_STATUS_OPTIONS.find(
      (option) => option.value === normalized,
    ) || FINANCIAL_OPERATION_STATUS_OPTIONS[0]
  );
};

const getOperationStatusVariant = (status) =>
  getOperationStatusOption(status).variant;

const parseFilenameFromContentDisposition = (headerValue) => {
  const raw = String(headerValue || '').trim();
  if (!raw) return '';

  const utf8Match = raw.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  const plainMatch = raw.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1]?.trim() || '';
};

const triggerBlobDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName || 'attachment');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const getDataTransferFile = (dataTransfer) => {
  const files = Array.from(dataTransfer?.files || []).filter(Boolean);
  return files[0] || null;
};

const getClipboardFile = (items) => {
  if (!items?.length) return null;

  for (const item of items) {
    if (!item || item.kind !== 'file') continue;
    const file = item.getAsFile?.();
    if (file) return file;
  }

  return null;
};

const isEditableElement = (target) => {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"]',
    ),
  );
};

const validateOperationForm = (form) => {
  if (!String(form?.title ?? '').trim()) {
    return 'Operation title is required.';
  }

  if (!String(form?.amount ?? '').trim()) {
    return 'Operation amount is required.';
  }

  if (!String(form?.operatedAt ?? '').trim()) {
    return 'Operation date is required.';
  }

  if (!String(form?.account ?? '').trim()) {
    return 'Account is required.';
  }

  return null;
};

function OperationFormFields({
  form,
  onChange,
  disabled,
  error,
  counterparties = [],
  counterpartiesLoading = false,
}) {
  return (
    <Form className='manage-finance__create-form'>
      <Form.Group>
        <Form.Label>Title</Form.Label>
        <Form.Control
          type='text'
          value={form.title}
          onChange={onChange('title')}
          placeholder='Office expense or initial deposit'
          disabled={disabled}
        />
      </Form.Group>

      <Row className='g-3'>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={form.type}
              onChange={onChange('type')}
              disabled={disabled}
            >
              <option value='withdrawal'>Withdrawal</option>
              <option value='deposit'>Deposit</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type='number'
              min='0.01'
              step='0.01'
              value={form.amount}
              onChange={onChange('amount')}
              disabled={disabled}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className='g-3'>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Operated At</Form.Label>
            <Form.Control
              type='datetime-local'
              value={form.operatedAt}
              onChange={onChange('operatedAt')}
              disabled={disabled}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Account</Form.Label>
            <Form.Control
              type='text'
              value={form.account}
              onChange={onChange('account')}
              placeholder='Main company account'
              disabled={disabled}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className='g-3'>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Counterparty</Form.Label>
            <Form.Select
              value={form.counterpartyId}
              onChange={onChange('counterpartyId')}
              disabled={disabled || counterpartiesLoading}
            >
              <option value=''>None</option>
              {counterparties.map((counterparty) => (
                <option key={counterparty.id} value={counterparty.id}>
                  {counterparty.fullName}
                  {counterparty.bankName ? ` - ${counterparty.bankName}` : ''}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {form.type === 'deposit' ? (
          <Col md={6}>
            <Form.Group>
              <Form.Label>Deposit Source</Form.Label>
              <Form.Control
                type='text'
                value={form.depositSource}
                onChange={onChange('depositSource')}
                placeholder='Card to card'
                disabled={disabled}
              />
            </Form.Group>
          </Col>
        ) : null}
      </Row>

      <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control
          as='textarea'
          rows={3}
          value={form.description}
          onChange={onChange('description')}
          placeholder='Optional notes for this operation'
          disabled={disabled}
        />
      </Form.Group>

      {error?.message ? (
        <Alert variant='danger' className='mb-0'>
          {error.message}
        </Alert>
      ) : null}
    </Form>
  );
}

export default function FinancialOperationsPanel({ enabled = true }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user ?? null);
  const activeCompany = useSelector((state) => state.companyContext?.activeCompany);
  const operations = useSelector(financialOperationsSelector);
  const operationsLoading = useSelector(financialOperationsLoadingSelector);
  const operationsError = useSelector(financialOperationsErrorSelector);
  const operationsMeta = useSelector(financialOperationsMetaSelector);
  const operationsTotal = useSelector(financialOperationsTotalSelector);
  const operationSummary = useSelector(financialOperationSummarySelector);
  const operationSummaryLoading = useSelector(
    financialOperationSummaryLoadingSelector,
  );
  const operationSummaryError = useSelector(
    financialOperationSummaryErrorSelector,
  );
  const createStatus = useSelector(financialOperationCreateStatusSelector);
  const createError = useSelector(financialOperationCreateErrorSelector);
  const operationDeleteStatus = useSelector(
    financialOperationRecordDeleteStatusSelector,
  );
  const operationDeleteError = useSelector(
    financialOperationRecordDeleteErrorSelector,
  );
  const updateStatus = useSelector(financialOperationUpdateStatusSelector);
  const updateError = useSelector(financialOperationUpdateErrorSelector);
  const currentOperation = useSelector(currentFinancialOperationSelector);
  const currentOperationLoading = useSelector(
    currentFinancialOperationLoadingSelector,
  );
  const currentOperationError = useSelector(currentFinancialOperationErrorSelector);
  const uploadStatus = useSelector(financialOperationFileUploadStatusSelector);
  const uploadError = useSelector(financialOperationFileUploadErrorSelector);
  const deletingFileIds = useSelector(financialOperationDeletingFileIdsSelector);
  const deleteError = useSelector(financialOperationDeleteErrorSelector);
  const statusUpdateStatus = useSelector(
    financialOperationStatusUpdateStatusSelector,
  );
  const statusUpdateError = useSelector(
    financialOperationStatusUpdateErrorSelector,
  );
  const counterparties = useSelector(financialCounterpartiesSelector);
  const counterpartiesLoading = useSelector(
    financialCounterpartiesLoadingSelector,
  );

  const companyRole = String(
    activeCompany?.membership?.role ?? user?.company_role ?? user?.user_type ?? '',
  )
    .trim()
    .toLowerCase();
  // The backend allows status changes only for the company owner.
  const isCompanyOwner = companyRole === 'company_owner';

  const [searchTerm, setSearchTerm] = useState('');
  const [operationDateRange, setOperationDateRange] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedOperationId, setSelectedOperationId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newOperationForm, setNewOperationForm] = useState(getOperationForm());
  const [editOperationForm, setEditOperationForm] = useState(getOperationForm());
  const [uploadDragActive, setUploadDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const uploadDragDepthRef = useRef(0);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const operationDateFilters = useMemo(
    () => getDateRangeFilters(operationDateRange),
    [operationDateRange],
  );
  const operationFromDate = operationDateFilters.fromDate;
  const operationToDate = operationDateFilters.toDate;
  const hasOperationFilters = Boolean(
    String(deferredSearchTerm ?? '').trim() ||
      operationFromDate ||
      operationToDate,
  );

  useEffect(() => {
    if (!enabled) return;

    dispatch(
      getFinancialOperations({
        page,
        title: deferredSearchTerm,
        fromDate: operationFromDate,
        toDate: operationToDate,
        perPage: OPERATIONS_PAGE_SIZE,
      }),
    );
  }, [
    deferredSearchTerm,
    dispatch,
    enabled,
    operationFromDate,
    operationToDate,
    page,
  ]);

  useEffect(() => {
    if (!enabled) return;

    // The operation modals need all available counterparties as select options.
    dispatch(
      getFinancialCounterparties({
        page: 1,
        search: '',
        perPage: 500,
      }),
    );
  }, [dispatch, enabled]);

  useEffect(() => {
    if (!operations.length) {
      setSelectedOperationId(null);
      dispatch(clearFinancialOperationDetail());
      return;
    }

    const hasSelectedOperation = operations.some(
      (operation) =>
        String(operation?.id ?? '') === String(selectedOperationId ?? ''),
    );

    if (!hasSelectedOperation) {
      setSelectedOperationId(operations[0]?.id ?? null);
    }
  }, [dispatch, operations, selectedOperationId]);

  useEffect(() => {
    if (!selectedOperationId || !enabled) return;

    dispatch(
      getFinancialOperationDetail({
        operationId: selectedOperationId,
      }),
    );
  }, [dispatch, enabled, selectedOperationId]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchTerm, operationFromDate, operationToDate]);

  useEffect(() => {
    setSelectedFile(null);
    uploadDragDepthRef.current = 0;
    setUploadDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedOperationId]);

  useEffect(() => {
    if (!enabled || !selectedOperationId || createModalOpen || editModalOpen) {
      return undefined;
    }

    const onPaste = (event) => {
      if (uploadStatus === 'loading' || isEditableElement(event.target)) {
        return;
      }

      const file = getClipboardFile(event?.clipboardData?.items);
      if (!file) return;

      event.preventDefault();
      event.stopPropagation();
      setSelectedFile(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    document.addEventListener('paste', onPaste, true);
    return () => document.removeEventListener('paste', onPaste, true);
  }, [createModalOpen, editModalOpen, enabled, selectedOperationId, uploadStatus]);

  const currentPage = Number(operationsMeta?.current_page) || 1;
  const lastPage = Number(operationsMeta?.last_page) || 1;
  const perPage = Number(operationsMeta?.per_page) || OPERATIONS_PAGE_SIZE;

  const paginationSummary = useMemo(() => {
    const total = Number(operationsMeta?.total ?? operationsTotal ?? 0);
    const start = total ? (currentPage - 1) * perPage + 1 : 0;
    const end = total ? Math.min(currentPage * perPage, total) : 0;

    return total
      ? `${start}-${end} of ${total} operations`
      : 'No financial operations found.';
  }, [currentPage, operationsMeta?.total, operationsTotal, perPage]);

  const handleRefresh = () => {
    dispatch(
      getFinancialOperations({
        page,
        title: deferredSearchTerm,
        fromDate: operationFromDate,
        toDate: operationToDate,
        perPage: OPERATIONS_PAGE_SIZE,
      }),
    );

    if (selectedOperationId) {
      dispatch(
        getFinancialOperationDetail({
          operationId: selectedOperationId,
        }),
      );
    }
  };

  const setPendingFile = (file) => {
    setSelectedFile(file || null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenCreateModal = () => {
    dispatch(resetFinancialOperationMutationState());
    setNewOperationForm(getOperationForm());
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (createStatus === 'loading') return;

    setCreateModalOpen(false);
    dispatch(resetFinancialOperationMutationState());
  };

  const handleOpenEditModal = () => {
    if (!currentOperation) return;

    dispatch(resetFinancialOperationMutationState());
    setEditOperationForm(getOperationForm(currentOperation));
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (updateStatus === 'loading') return;

    setEditModalOpen(false);
    dispatch(resetFinancialOperationMutationState());
  };

  const createOperationChangeHandler = (setter) => (field) => (event) => {
    const nextValue = event.target.value;

    setter((current) => ({
      ...current,
      [field]: nextValue,
      ...(field === 'type' && nextValue === 'withdrawal'
        ? { depositSource: '' }
        : {}),
    }));
  };

  const handleCreateInputChange = createOperationChangeHandler(setNewOperationForm);
  const handleEditInputChange = createOperationChangeHandler(setEditOperationForm);

  const handleCreateOperation = async () => {
    const validationError = validateOperationForm(newOperationForm);
    if (validationError) {
      toastError(validationError);
      return;
    }

    const resultAction = await dispatch(
      createFinancialOperation(newOperationForm),
    );

    if (createFinancialOperation.fulfilled.match(resultAction)) {
      const createdOperationId = resultAction.payload?.operation?.id ?? null;

      toastSuccess(
        resultAction.payload?.message || 'Financial operation created successfully.',
      );

      setCreateModalOpen(false);
      dispatch(resetFinancialOperationMutationState());
      setSearchTerm('');
      setOperationDateRange([]);
      setPage(1);

      dispatch(
        getFinancialOperations({
          page: 1,
          title: '',
          fromDate: '',
          toDate: '',
          perPage: OPERATIONS_PAGE_SIZE,
        }),
      );

      if (createdOperationId) {
        setSelectedOperationId(createdOperationId);
        dispatch(
          getFinancialOperationDetail({
            operationId: createdOperationId,
          }),
        );
      }

      return;
    }

    toastError(
      resultAction.payload?.message || 'Failed to create financial operation.',
    );
  };

  const handleEditOperation = async () => {
    if (!currentOperation?.id) return;

    const validationError = validateOperationForm(editOperationForm);
    if (validationError) {
      toastError(validationError);
      return;
    }

    const resultAction = await dispatch(
      updateFinancialOperation({
        operationId: currentOperation.id,
        payload: editOperationForm,
      }),
    );

    if (updateFinancialOperation.fulfilled.match(resultAction)) {
      toastSuccess(
        resultAction.payload?.message || 'Financial operation updated successfully.',
      );

      setEditModalOpen(false);
      dispatch(resetFinancialOperationMutationState());

      dispatch(
        getFinancialOperations({
          page,
          title: deferredSearchTerm,
          fromDate: operationFromDate,
          toDate: operationToDate,
          perPage: OPERATIONS_PAGE_SIZE,
        }),
      );

      dispatch(
        getFinancialOperationDetail({
          operationId: currentOperation.id,
        }),
      );

      return;
    }

    toastError(
      resultAction.payload?.message || 'Failed to update financial operation.',
    );
  };

  const handleDeleteOperation = async () => {
    if (!currentOperation?.id) return;

    const result = await alertConfirm({
      title: 'Delete operation?',
      text: 'This financial operation and its uploaded files will be removed permanently.',
      confirmText: 'Delete',
    });

    if (!result.isConfirmed) return;

    const operationId = currentOperation.id;
    const resultAction = await dispatch(
      deleteFinancialOperation({
        operationId,
      }),
    );

    if (deleteFinancialOperation.fulfilled.match(resultAction)) {
      toastSuccess(
        resultAction.payload?.message || 'Financial operation deleted successfully.',
      );

      setEditModalOpen(false);
      dispatch(resetFinancialOperationMutationState());
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      dispatch(
        getFinancialOperations({
          page,
          title: deferredSearchTerm,
          fromDate: operationFromDate,
          toDate: operationToDate,
          perPage: OPERATIONS_PAGE_SIZE,
        }),
      );

      return;
    }

    toastError(
      resultAction.payload?.message || 'Failed to delete financial operation.',
    );
  };

  const handleUploadDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (uploadStatus === 'loading') return;

    uploadDragDepthRef.current += 1;
    setUploadDragActive(true);
  };

  const handleUploadDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (uploadStatus === 'loading') return;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleUploadDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (uploadStatus === 'loading') return;

    uploadDragDepthRef.current = Math.max(uploadDragDepthRef.current - 1, 0);

    if (uploadDragDepthRef.current === 0) {
      setUploadDragActive(false);
    }
  };

  const handleUploadDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    uploadDragDepthRef.current = 0;
    setUploadDragActive(false);

    if (uploadStatus === 'loading') return;

    const file = getDataTransferFile(event.dataTransfer);
    if (!file) return;

    setPendingFile(file);
  };

  const handleUploadFile = async () => {
    if (!selectedOperationId) {
      toastError('Select an operation first.');
      return;
    }

    if (!selectedFile) {
      toastError('Choose a file to upload.');
      return;
    }

    const resultAction = await dispatch(
      uploadFinancialOperationFile({
        operationId: selectedOperationId,
        file: selectedFile,
      }),
    );

    if (uploadFinancialOperationFile.fulfilled.match(resultAction)) {
      toastSuccess(resultAction.payload?.message || 'File uploaded successfully.');
      setPendingFile(null);

      dispatch(
        getFinancialOperationDetail({
          operationId: selectedOperationId,
        }),
      );
      return;
    }

    toastError(
      resultAction.payload?.message || 'Failed to upload operation file.',
    );
  };

  const handleDeleteFile = async (fileId) => {
    if (!selectedOperationId || !fileId) return;

    const result = await alertConfirm({
      title: 'Delete file?',
      text: 'This uploaded finance file will be removed permanently.',
      confirmText: 'Delete',
    });

    if (!result.isConfirmed) return;

    const resultAction = await dispatch(
      deleteFinancialOperationFile({
        operationId: selectedOperationId,
        fileId,
      }),
    );

    if (deleteFinancialOperationFile.fulfilled.match(resultAction)) {
      toastSuccess(resultAction.payload?.message || 'File deleted successfully.');
      return;
    }

    toastError(
      resultAction.payload?.message || 'Failed to delete operation file.',
    );
  };

  const handleDownloadFile = async (file) => {
    const operationId = selectedOperationId ?? file?.operationId;
    const fileId = file?.id;

    if (!operationId || !fileId) {
      toastError('File download data is incomplete.');
      return;
    }

    try {
      const response = await api.get(
        `/finance-center/operations/${operationId}/files/${fileId}/download`,
        {
          responseType: 'blob',
        },
      );

      const contentType =
        response.headers['content-type'] || 'application/octet-stream';
      const fileName =
        parseFilenameFromContentDisposition(
          response.headers['content-disposition'],
        ) ||
        file?.originalName ||
        'attachment';

      const blob = new Blob([response.data], { type: contentType });
      triggerBlobDownload(blob, fileName);
    } catch (error) {
      toastError(error?.message || 'Download failed.');
    }
  };

  const handleChangeOperationStatus = async (nextStatus) => {
    const normalizedStatus = String(nextStatus ?? '').trim().toLowerCase();

    if (!currentOperation?.id || !normalizedStatus) return;

    // Avoid sending a PATCH request when the selected status is already active.
    if (
      normalizedStatus ===
      String(currentOperation?.status ?? '').trim().toLowerCase()
    ) {
      return;
    }

    const resultAction = await dispatch(
      updateFinancialOperationStatus({
        operationId: currentOperation.id,
        status: normalizedStatus,
      }),
    );

    if (updateFinancialOperationStatus.fulfilled.match(resultAction)) {
      toastSuccess(
        resultAction.payload?.message ||
          'Financial operation status updated successfully.',
      );
      return;
    }

    toastError(
      resultAction.payload?.message || 'Failed to update operation status.',
    );
  };

  const currentStatusOption = getOperationStatusOption(currentOperation?.status);
  const files = Array.isArray(currentOperation?.files) ? currentOperation.files : [];
  const companyTotalAmount =
    operationSummary?.totals?.netValue ?? operationSummary?.totals?.net;
  const companyTotalValue = Number(companyTotalAmount ?? 0);
  const companyTotalToneClass =
    companyTotalValue < 0 ? 'is-negative' : 'is-positive';
  const companyTotalDisplay = operationSummaryLoading
    ? 'Loading...'
    : operationSummaryError?.message
      ? '-'
      : formatAmount(companyTotalAmount);
  const isDepositOperation =
    String(currentOperation?.type ?? '').trim().toLowerCase() === 'deposit';
  const operationAmountToneClass = isDepositOperation
    ? 'is-deposit'
    : 'is-withdrawal';
  const operationAmountIconClass = isDepositOperation
    ? 'ph-duotone ph-arrow-circle-up-right'
    : 'ph-duotone ph-arrow-circle-down-left';

  return (
    <Card className='manage-finance__operations-card shadow-sm border-0'>
      <Card.Header className='bg-transparent border-0 d-flex flex-wrap gap-3 justify-content-between align-items-start'>
        <div>
          <div className='d-flex flex-wrap align-items-center gap-2 mb-2'>
            <h4 className='mb-0'>Operations & Files</h4>
            <Badge bg='light' text='dark'>
              {operationsTotal} operations
            </Badge>
            {currentOperation ? (
              <Badge bg='info'>
                {files.length} file{files.length === 1 ? '' : 's'} on selected
              </Badge>
            ) : null}
          </div>
          <p className='text-muted mb-0'>
            Pick an operation, then upload receipts or other supporting files.
          </p>
        </div>

        <div className='manage-finance__operations-toolbar'>
          <Form.Control
            type='search'
            placeholder='Search operations by title'
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className='manage-finance__operations-search'
          />
          <Flatpickr
            className='form-control manage-finance__operations-date-filter'
            value={operationDateRange}
            onChange={(dates) => setOperationDateRange(dates)}
            options={{
              mode: 'range',
              dateFormat: 'Y-m-d',
            }}
            placeholder='YYYY-MM-DD to YYYY-MM-DD'
          />
          {hasOperationFilters ? (
            <Button
              variant='outline-secondary'
              onClick={() => {
                setSearchTerm('');
                setOperationDateRange([]);
                setPage(1);
              }}
              disabled={operationsLoading}
            >
              Clear Filters
            </Button>
          ) : null}
          <Button
            variant='outline-secondary'
            onClick={handleRefresh}
            disabled={operationsLoading || currentOperationLoading}
          >
            Refresh
          </Button>
          <Button onClick={handleOpenCreateModal}>Create Operation</Button>
        </div>
      </Card.Header>

      <Card.Body>
        <Row className='g-4'>
          <Col xl={5}>
            <div className='manage-finance__operations-pane'>
              {operationsLoading ? (
                <FinanceOperationListSkeleton count={5} />
              ) : operationsError ? (
                <Alert variant='danger' className='mb-0'>
                  {operationsError?.message || 'Failed to load financial operations.'}
                </Alert>
              ) : operations.length > 0 ? (
                <div className='manage-finance__operation-list'>
                  {operations.map((operation) => {
                    const isActive =
                      String(operation?.id ?? '') ===
                      String(selectedOperationId ?? '');

                    return (
                      <button
                        key={operation.id}
                        type='button'
                        className={`manage-finance__operation-item ${
                          isActive ? 'is-active' : ''
                        }`}
                        onClick={() => setSelectedOperationId(operation.id)}
                      >
                        <div className='d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2'>
                          <h6 className='mb-0 text-start'>{operation.title || '-'}</h6>
                          <Badge bg={getOperationTypeVariant(operation.type)}>
                            {operation.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                          </Badge>
                        </div>

                        <div className='d-flex flex-wrap gap-2 mb-2'>
                          <Badge bg={getOperationStatusVariant(operation.status)}>
                            {operation.status || 'pending'}
                          </Badge>
                          <Badge bg='light' text='dark'>
                            {formatMonthDayTime(operation.operatedAt)}
                          </Badge>
                        </div>

                        <div className='manage-finance__operation-item-meta'>
                          <span>{operation.account || '-'}</span>
                          <strong>{formatAmount(operation.amount)}</strong>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className='manage-finance__state manage-finance__state--empty'>
                  <i className='ph-duotone ph-receipt'></i>
                  <span>No financial operations available yet.</span>
                  <Button onClick={handleOpenCreateModal}>
                    Create your first operation
                  </Button>
                </div>
              )}

              {!operationsLoading && !operationsError && operations.length > 0 ? (
                <AppPagination
                  className='manage-finance__operation-list-pagination'
                  currentPage={currentPage}
                  lastPage={lastPage}
                  summary={paginationSummary}
                  disabled={operationsLoading}
                  onPageChange={(nextPage) => setPage(nextPage)}
                />
              ) : null}
            </div>
          </Col>

          <Col xl={7}>
            <div className='manage-finance__operations-pane'>
              {selectedOperationId && currentOperationLoading ? (
                <FinanceOperationDetailSkeleton />
              ) : currentOperationError ? (
                <Alert variant='danger' className='mb-0'>
                  {currentOperationError?.message ||
                    'Failed to load selected operation.'}
                </Alert>
              ) : selectedOperationId && currentOperation ? (
                <div className='manage-finance__operation-detail'>
                  <div className='manage-finance__operation-detail-header'>
                    <div>
                      <div className='d-flex flex-wrap align-items-center gap-2 mb-2'>
                        <h5 className='mb-0'>{currentOperation.title || '-'}</h5>
                        <Badge bg={getOperationTypeVariant(currentOperation.type)}>
                          {currentOperation.type === 'deposit'
                            ? 'Deposit'
                            : 'Withdrawal'}
                        </Badge>
                        <Badge bg={getOperationStatusVariant(currentOperation.status)}>
                          {currentOperation.status || 'pending'}
                        </Badge>
                      </div>
                      <p className='text-muted mb-0'>
                        {currentOperation.description || 'No description added.'}
                      </p>
                    </div>

                    <div className='manage-finance__operation-detail-actions'>
                      {isCompanyOwner ? (
                        <Dropdown
                          align='end'
                          className='manage-finance__status-dropdown'
                        >
                          <Dropdown.Toggle
                            size='sm'
                            variant={`light-${currentStatusOption.variant}`}
                            disabled={statusUpdateStatus === 'loading'}
                          >
                            <i className={currentStatusOption.iconClass}></i>
                            {statusUpdateStatus === 'loading'
                              ? 'Updating...'
                              : `Status: ${currentStatusOption.label}`}
                          </Dropdown.Toggle>

                          <Dropdown.Menu className='manage-finance__status-menu'>
                            {FINANCIAL_OPERATION_STATUS_OPTIONS.map((option) => {
                              const isCurrent =
                                option.value === currentStatusOption.value;

                              return (
                                <Dropdown.Item
                                  as='button'
                                  key={option.value}
                                  className={`manage-finance__status-item ${
                                    isCurrent ? 'is-current' : ''
                                  }`}
                                  disabled={
                                    isCurrent || statusUpdateStatus === 'loading'
                                  }
                                  onClick={() =>
                                    handleChangeOperationStatus(option.value)
                                  }
                                >
                                  <span className='manage-finance__status-item-copy'>
                                    <i className={option.iconClass}></i>
                                    {option.label}
                                  </span>

                                  {isCurrent ? (
                                    <Badge bg={option.variant}>Current</Badge>
                                  ) : null}
                                </Dropdown.Item>
                              );
                            })}
                          </Dropdown.Menu>
                        </Dropdown>
                      ) : null}

                      <Button
                        variant='outline-secondary'
                        size='sm'
                        onClick={handleOpenEditModal}
                        disabled={operationDeleteStatus === 'loading'}
                      >
                        Edit Operation
                      </Button>
                      <Button
                        variant='outline-danger'
                        size='sm'
                        onClick={handleDeleteOperation}
                        disabled={operationDeleteStatus === 'loading'}
                      >
                        {operationDeleteStatus === 'loading'
                          ? 'Deleting...'
                          : 'Delete Operation'}
                      </Button>
                    </div>

                    <div className='manage-finance__operation-amount-strip'>
                      <div
                        className={[
                          'manage-finance__operation-amount',
                          'manage-finance__operation-amount--operation',
                          operationAmountToneClass,
                        ].join(' ')}
                      >
                        <span className='manage-finance__operation-amount-icon'>
                          <i className={operationAmountIconClass}></i>
                        </span>
                        <span className='manage-finance__operation-amount-copy'>
                          <span className='manage-finance__operation-amount-label'>
                            Operation Amount
                          </span>
                          <strong>{formatAmount(currentOperation.amount)}</strong>
                        </span>
                      </div>

                      <div
                        className={[
                          'manage-finance__operation-amount',
                          'manage-finance__operation-amount--company-total',
                          companyTotalToneClass,
                        ].join(' ')}
                      >
                        <span className='manage-finance__operation-amount-icon'>
                          <i className='ph-duotone ph-buildings'></i>
                        </span>
                        <span className='manage-finance__operation-amount-copy'>
                          <span className='manage-finance__operation-amount-label'>
                            Company Balance
                          </span>
                          <strong>{companyTotalDisplay}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {statusUpdateError?.message ? (
                    <Alert variant='danger' className='mb-0'>
                      {statusUpdateError.message}
                    </Alert>
                  ) : null}

                  <div className='manage-finance__operation-stats'>
                    <div className='manage-finance__operation-stat'>
                      <span>Account</span>
                      <strong>{currentOperation.account || '-'}</strong>
                    </div>
                    <div className='manage-finance__operation-stat'>
                      <span>Operated At</span>
                      <strong>{formatFullDate(currentOperation.operatedAt)}</strong>
                    </div>
                    <div className='manage-finance__operation-stat'>
                      <span>Counterparty</span>
                      <strong>
                        {currentOperation.counterparty?.fullName || '-'}
                      </strong>
                    </div>
                    <div className='manage-finance__operation-stat'>
                      <span>Created By</span>
                      <strong>{currentOperation.creator?.name || '-'}</strong>
                    </div>
                    {currentOperation.type === 'deposit' ? (
                      <div className='manage-finance__operation-stat'>
                        <span>Deposit Source</span>
                        <strong>{currentOperation.depositSource || '-'}</strong>
                      </div>
                    ) : null}
                  </div>

                  <div className='manage-finance__upload-box'>
                    <div>
                      <h6 className='mb-1'>Upload Finance File</h6>
                      <p className='text-muted mb-0'>
                        Drag a file here, paste with Ctrl+V, or pick one manually
                        for the selected operation.
                      </p>
                    </div>

                    <label
                      htmlFor='finance-operation-upload'
                      className={`manage-finance__upload-dropzone ${
                        uploadDragActive ? 'is-drag-over' : ''
                      } ${uploadStatus === 'loading' ? 'is-uploading' : ''}`}
                      onDragEnter={handleUploadDragEnter}
                      onDragOver={handleUploadDragOver}
                      onDragLeave={handleUploadDragLeave}
                      onDrop={handleUploadDrop}
                    >
                      <span className='manage-finance__upload-dropzone-icon'>
                        {uploadStatus === 'loading' ? (
                          <Spinner animation='border' size='sm' />
                        ) : (
                          <i className='ph-duotone ph-upload-simple'></i>
                        )}
                      </span>
                      <span className='manage-finance__upload-dropzone-text'>
                        <span className='manage-finance__upload-dropzone-title'>
                          {selectedFile
                            ? selectedFile.name
                            : 'Drop a file, paste from clipboard, or click to browse'}
                        </span>
                        <span className='manage-finance__upload-dropzone-hint'>
                          {selectedFile
                            ? `${formatBytes(selectedFile.size)} ready to upload`
                            : 'Receipts, invoices, screenshots, and finance documents are supported.'}
                        </span>
                      </span>
                      <input
                        ref={fileInputRef}
                        id='finance-operation-upload'
                        type='file'
                        className='d-none'
                        onChange={(event) =>
                          setPendingFile(event.target.files?.[0] || null)
                        }
                        disabled={uploadStatus === 'loading'}
                      />
                    </label>

                    <div className='manage-finance__upload-controls'>
                      <Button
                        onClick={handleUploadFile}
                        disabled={!selectedFile || uploadStatus === 'loading'}
                      >
                        {uploadStatus === 'loading' ? 'Uploading...' : 'Upload File'}
                      </Button>
                      <Button
                        variant='outline-secondary'
                        onClick={() => setPendingFile(null)}
                        disabled={!selectedFile || uploadStatus === 'loading'}
                      >
                        Clear Selection
                      </Button>
                    </div>

                    {selectedFile ? (
                      <span className='text-muted small'>
                        Selected file: {selectedFile.name}
                      </span>
                    ) : null}

                    {uploadError?.message ? (
                      <Alert variant='danger' className='mb-0 mt-3'>
                        {uploadError.message}
                      </Alert>
                    ) : null}

                    {operationDeleteError?.message ? (
                      <Alert variant='danger' className='mb-0 mt-3'>
                        {operationDeleteError.message}
                      </Alert>
                    ) : null}

                    {deleteError?.message ? (
                      <Alert variant='danger' className='mb-0 mt-3'>
                        {deleteError.message}
                      </Alert>
                    ) : null}
                  </div>

                  <div>
                    <div className='d-flex align-items-center justify-content-between gap-2 mb-3'>
                      <h6 className='mb-0'>Uploaded Files</h6>
                      <Badge bg='light' text='dark'>
                        {files.length} total
                      </Badge>
                    </div>

                    {files.length > 0 ? (
                      <div className='manage-finance__file-list'>
                        {files.map((file) => {
                          const isDeleting = Boolean(
                            deletingFileIds?.[String(file?.id ?? '')],
                          );

                          return (
                            <div
                              key={file.id}
                              className='manage-finance__file-item'
                            >
                              <div className='manage-finance__file-copy'>
                                <div className='manage-finance__file-icon'>
                                  <i className='ph-duotone ph-file-arrow-up'></i>
                                </div>
                                <div>
                                  <h6 className='mb-1'>{file.originalName}</h6>
                                  <p className='text-muted mb-0'>
                                    {formatBytes(file.size)} -{' '}
                                    {file.uploader?.name || 'Unknown uploader'} -{' '}
                                    {formatMonthDayTime(file.createdAt)}
                                  </p>
                                </div>
                              </div>

                              <div className='manage-finance__file-actions'>
                                <Button
                                  variant='outline-primary'
                                  size='sm'
                                  onClick={() => handleDownloadFile(file)}
                                  disabled={isDeleting}
                                >
                                  Download
                                </Button>
                                <Button
                                  variant='outline-danger'
                                  size='sm'
                                  onClick={() => handleDeleteFile(file.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className='manage-finance__state manage-finance__state--empty'>
                        <i className='ph-duotone ph-file-dashed'></i>
                        <span>No files uploaded for this operation yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : operations.length > 0 ? (
                <div className='manage-finance__state manage-finance__state--empty'>
                  <i className='ph-duotone ph-cursor-click'></i>
                  <span>Select an operation to manage its files.</span>
                </div>
              ) : (
                <div className='manage-finance__state manage-finance__state--empty'>
                  <i className='ph-duotone ph-receipt'></i>
                  <span>Create an operation first, then upload its finance files.</span>
                  <Button onClick={handleOpenCreateModal}>
                    Create your first operation
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>

      <Modal show={createModalOpen} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton={createStatus !== 'loading'}>
          <Modal.Title>Create Operation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OperationFormFields
            form={newOperationForm}
            onChange={handleCreateInputChange}
            disabled={createStatus === 'loading'}
            error={createError}
            counterparties={counterparties}
            counterpartiesLoading={counterpartiesLoading}
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
          <Button onClick={handleCreateOperation} disabled={createStatus === 'loading'}>
            {createStatus === 'loading' ? 'Creating...' : 'Create Operation'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={editModalOpen} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton={updateStatus !== 'loading'}>
          <Modal.Title>Edit Operation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OperationFormFields
            form={editOperationForm}
            onChange={handleEditInputChange}
            disabled={updateStatus === 'loading'}
            error={updateError}
            counterparties={counterparties}
            counterpartiesLoading={counterpartiesLoading}
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
          <Button onClick={handleEditOperation} disabled={updateStatus === 'loading'}>
            {updateStatus === 'loading' ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
