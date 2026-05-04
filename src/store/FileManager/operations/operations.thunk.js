import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/axios';
import { getErrorMessage } from '../../../utils/getError';
import {
  normalizeFinancialOperation,
  normalizeFinancialOperationFile,
  normalizeFinancialOperationsResponse,
  normalizeFinancialOperationSummary,
} from './operations.utils';

export const getFinancialOperations = createAsyncThunk(
  'financialOperations/getAll',
  async (
    { page = 1, title = '', fromDate = '', toDate = '', perPage = 10 } = {},
    { rejectWithValue },
  ) => {
    try {
      const params = { page, per_page: perPage };
      const normalizedTitle = String(title ?? '').trim();
      const normalizedFromDate = String(fromDate ?? '').trim();
      const normalizedToDate = String(toDate ?? '').trim();

      if (normalizedTitle) {
        params.title = normalizedTitle;
      }

      if (normalizedFromDate) {
        params.from_date = normalizedFromDate;
      }

      if (normalizedToDate) {
        params.to_date = normalizedToDate;
      }

      const res = await api.get('/finance-center/operations', { params });
      return normalizeFinancialOperationsResponse(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const getFinancialOperationSummary = createAsyncThunk(
  'financialOperations/getSummary',
  async ({ period = '12_months' } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/finance-center/operations/summary', {
        params: { period },
      });

      return normalizeFinancialOperationSummary(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const getFinancialOperationDetail = createAsyncThunk(
  'financialOperations/getDetail',
  async ({ operationId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/finance-center/operations/${operationId}`);
      return normalizeFinancialOperation(res?.data?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createFinancialOperation = createAsyncThunk(
  'financialOperations/create',
  async (payload, { rejectWithValue }) => {
    try {
      const body = {
        title: String(payload?.title ?? '').trim(),
        type: String(payload?.type ?? 'withdrawal').trim().toLowerCase(),
        amount: payload?.amount,
        operated_at: payload?.operatedAt,
        account: String(payload?.account ?? '').trim(),
        description: String(payload?.description ?? '').trim() || undefined,
      };

      const counterpartyId = Number(payload?.counterpartyId);
      body.counterparty_id =
        Number.isInteger(counterpartyId) && counterpartyId > 0
          ? counterpartyId
          : null;

      if (body.type === 'deposit') {
        body.deposit_source =
          String(payload?.depositSource ?? '').trim() || null;
      }

      const res = await api.post('/finance-center/operations', body);

      return {
        operation: normalizeFinancialOperation(res?.data?.data),
        message: res?.data?.message || 'Financial operation created successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateFinancialOperation = createAsyncThunk(
  'financialOperations/update',
  async ({ operationId, payload }, { rejectWithValue }) => {
    try {
      const body = {
        title: String(payload?.title ?? '').trim(),
        type: String(payload?.type ?? 'withdrawal').trim().toLowerCase(),
        amount: payload?.amount,
        operated_at: payload?.operatedAt,
        account: String(payload?.account ?? '').trim(),
        description: String(payload?.description ?? '').trim() || null,
      };

      const counterpartyId = Number(payload?.counterpartyId);
      body.counterparty_id =
        Number.isInteger(counterpartyId) && counterpartyId > 0
          ? counterpartyId
          : null;

      if (body.type === 'deposit') {
        body.deposit_source =
          String(payload?.depositSource ?? '').trim() || null;
      }

      const res = await api.patch(
        `/finance-center/operations/${operationId}`,
        body,
      );

      return {
        operation: normalizeFinancialOperation(res?.data?.data),
        message: res?.data?.message || 'Financial operation updated successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateFinancialOperationStatus = createAsyncThunk(
  'financialOperations/updateStatus',
  async ({ operationId, status }, { rejectWithValue }) => {
    try {
      // Send only the status field because the endpoint is dedicated to review state.
      const res = await api.patch(
        `/finance-center/operations/${operationId}/status`,
        {
          status: String(status ?? '').trim().toLowerCase(),
        },
      );

      return {
        operation: normalizeFinancialOperation(res?.data?.data),
        message:
          res?.data?.message ||
          'Financial operation status updated successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteFinancialOperation = createAsyncThunk(
  'financialOperations/delete',
  async ({ operationId }, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/finance-center/operations/${operationId}`);

      return {
        operationId,
        message: res?.data?.message || 'Financial operation deleted successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const uploadFinancialOperationFile = createAsyncThunk(
  'financialOperations/uploadFile',
  async ({ operationId, file }, { rejectWithValue }) => {
    if (!file) {
      return rejectWithValue({ status: 0, message: 'File is required.' });
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(
        `/finance-center/operations/${operationId}/files`,
        formData,
      );

      return {
        operationId,
        file: normalizeFinancialOperationFile(res?.data?.data),
        message: res?.data?.message || 'File uploaded successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteFinancialOperationFile = createAsyncThunk(
  'financialOperations/deleteFile',
  async ({ operationId, fileId }, { rejectWithValue }) => {
    try {
      const res = await api.delete(
        `/finance-center/operations/${operationId}/files/${fileId}`,
      );

      return {
        operationId,
        fileId,
        message: res?.data?.message || 'File deleted successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);
