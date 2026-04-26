import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/axios';
import { getErrorMessage } from '../../../utils/getError';
import {
  normalizeFileManagementAccessPayload,
  normalizeFileManagementAccessUpdatePayload,
} from './access.utils';

export const getFileManagementAccessUsers = createAsyncThunk(
  'fileManagementAccess/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/finance-center/access-users');
      return normalizeFileManagementAccessPayload(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const updateFileManagementAccessUsers = createAsyncThunk(
  'fileManagementAccess/updateUsers',
  async ({ userIds }, { rejectWithValue }) => {
    try {
      const res = await api.put('/finance-center/access-users', {
        user_ids: Array.isArray(userIds) ? userIds : [],
      });

      return normalizeFileManagementAccessUpdatePayload(res?.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const probeFileManagementSectionAccess = createAsyncThunk(
  'fileManagementAccess/probe',
  async (_, { rejectWithValue }) => {
    try {
      await api.get('/finance-center/operations', {
        params: { page: 1 },
      });

      return { canView: true };
    } catch (err) {
      const normalized = getErrorMessage(err);

      if (normalized?.status === 403 || normalized?.status === 404) {
        return { canView: false };
      }

      return rejectWithValue(normalized);
    }
  },
);

