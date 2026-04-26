import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/axios';
import { getErrorMessage } from '../../../utils/getError';
import {
  normalizeFinancialCounterparty,
  normalizeFinancialCounterpartiesResponse,
} from './counterparties.utils';

const buildCounterpartyBody = (payload) => ({
  full_name: String(payload?.fullName ?? '').trim(),
  card_number: String(payload?.cardNumber ?? '').trim() || null,
  iban: String(payload?.iban ?? '').trim() || null,
  account: String(payload?.account ?? '').trim() || null,
  bank_name: String(payload?.bankName ?? '').trim() || null,
});

export const getFinancialCounterparties = createAsyncThunk(
  'financialCounterparties/getAll',
  async ({ page = 1, search = '', perPage = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = { page, per_page: perPage };
      const normalizedSearch = String(search ?? '').trim();

      if (normalizedSearch) {
        params.search = normalizedSearch;
      }

      const res = await api.get('/finance-center/counterparties', { params });
      return normalizeFinancialCounterpartiesResponse(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const createFinancialCounterparty = createAsyncThunk(
  'financialCounterparties/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(
        '/finance-center/counterparties',
        buildCounterpartyBody(payload),
      );

      return {
        counterparty: normalizeFinancialCounterparty(res?.data?.data),
        message: res?.data?.message || 'Counterparty created successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateFinancialCounterparty = createAsyncThunk(
  'financialCounterparties/update',
  async ({ counterpartyId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        `/finance-center/counterparties/${counterpartyId}`,
        buildCounterpartyBody(payload),
      );

      return {
        counterparty: normalizeFinancialCounterparty(res?.data?.data),
        message: res?.data?.message || 'Counterparty updated successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteFinancialCounterparty = createAsyncThunk(
  'financialCounterparties/delete',
  async ({ counterpartyId }, { rejectWithValue }) => {
    try {
      const res = await api.delete(
        `/finance-center/counterparties/${counterpartyId}`,
      );

      return {
        counterpartyId,
        message: res?.data?.message || 'Counterparty deleted successfully.',
      };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);
