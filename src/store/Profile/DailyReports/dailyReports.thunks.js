import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/axios';
import {
  normalizeDailyReportsResponse,
  normalizeReport,
} from './dailyReports.utils';
import { getErrorMessage } from '../../../utils/getError';

export const uploadDailyReport = createAsyncThunk(
  'dailyReports/uploadDailyReport',
  async ({ projectId, file, description = '' }, { rejectWithValue }) => {
    const id = String(projectId ?? '').trim();

    if (!id) {
      return rejectWithValue('Project id is required.');
    }

    if (!file) {
      return rejectWithValue('File is required.');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const normalizedDescription = String(description ?? '').trim();
      if (normalizedDescription) {
        // The reports API accepts nullable description text alongside the uploaded file.
        formData.append('description', normalizedDescription);
      }

      const response = await api.post(
        `/file-management/projects/${id}/reports`,
        formData,
      );

      return {
        message: response.data?.message || 'Report uploaded successfully.',
        data: normalizeReport(response.data?.data),
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getDailyReports = createAsyncThunk(
  'dailyReports/getDailyReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/file-management/reports/my', { params });
      return normalizeDailyReportsResponse(res.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);

export const deleteDailyReport = createAsyncThunk(
  'dailyReports/deleteDailyReport',
  async (reportId, { rejectWithValue }) => {
    if (!reportId) {
      return rejectWithValue('Report id is required.');
    }

    try {
      await api.delete(`/file-management/reports/${reportId}`);
      return reportId;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);
