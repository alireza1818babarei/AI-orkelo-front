import { createSlice } from '@reduxjs/toolkit';
import {
  createFinancialOperation,
  updateFinancialOperationStatus,
  deleteFinancialOperation,
  deleteFinancialOperationFile,
  getFinancialOperationDetail,
  getFinancialOperations,
  getFinancialOperationSummary,
  updateFinancialOperation,
  uploadFinancialOperationFile,
} from './operations.thunk';

const emptyFinancialOperationSummary = {
  period: '12_months',
  totals: {
    income: '0.00',
    outcome: '0.00',
    net: '0.00',
    pendingAmount: '0.00',
    pendingCount: 0,
    incomeValue: 0,
    outcomeValue: 0,
    netValue: 0,
    pendingAmountValue: 0,
  },
  monthly: [],
};

const initialState = {
  items: [],
  loading: false,
  error: null,
  links: null,
  meta: null,
  total: 0,
  statusUpdateStatus: 'idle',
  statusUpdateError: null,
  currentOperation: null,
  currentOperationLoading: false,
  currentOperationError: null,
  createStatus: 'idle',
  createError: null,
  updateStatus: 'idle',
  updateError: null,
  operationDeleteStatus: 'idle',
  operationDeleteError: null,
  uploadStatus: 'idle',
  uploadError: null,
  deletingFileIds: {},
  deleteError: null,
  summary: emptyFinancialOperationSummary,
  summaryLoading: false,
  summaryError: null,
  // Refresh key changes after financial mutations so overview data stays current.
  summaryRefreshKey: 0,
};

const financialOperationsSlice = createSlice({
  name: 'financialOperations',
  initialState,
  reducers: {
    clearFinancialOperationDetail(state) {
      state.statusUpdateStatus = 'idle';
      state.statusUpdateError = null;
      state.currentOperation = null;
      state.currentOperationLoading = false;
      state.currentOperationError = null;
      state.createStatus = 'idle';
      state.createError = null;
      state.updateStatus = 'idle';
      state.updateError = null;
      state.operationDeleteStatus = 'idle';
      state.operationDeleteError = null;
      state.uploadStatus = 'idle';
      state.uploadError = null;
      state.deletingFileIds = {};
      state.deleteError = null;
    },
    resetFinancialOperationMutationState(state) {
      state.statusUpdateStatus = 'idle';
      state.statusUpdateError = null;
      state.createStatus = 'idle';
      state.createError = null;
      state.updateStatus = 'idle';
      state.updateError = null;
      state.operationDeleteStatus = 'idle';
      state.operationDeleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createFinancialOperation.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createFinancialOperation.fulfilled, (state, action) => {
        const nextOperation = action.payload?.operation ?? null;

        state.createStatus = 'succeeded';
        state.createError = null;

        if (nextOperation) {
          const existingIndex = (state.items || []).findIndex(
            (operation) =>
              String(operation?.id ?? '') === String(nextOperation?.id ?? ''),
          );

          if (existingIndex >= 0) {
            state.items[existingIndex] = nextOperation;
          } else {
            state.items = [nextOperation, ...(state.items || [])];
            state.total = Number(state.total ?? 0) + 1;
          }

          state.currentOperation = nextOperation;
          state.summaryRefreshKey += 1;
        }
      })
      .addCase(createFinancialOperation.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload || {
          message: 'Failed to create financial operation',
        };
      });

    builder
      .addCase(updateFinancialOperation.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateFinancialOperation.fulfilled, (state, action) => {
        const nextOperation = action.payload?.operation ?? null;

        state.updateStatus = 'succeeded';
        state.updateError = null;

        if (!nextOperation) return;

        state.items = (state.items || []).map((operation) =>
          String(operation?.id ?? '') === String(nextOperation?.id ?? '')
            ? {
                ...operation,
                ...nextOperation,
              }
            : operation,
        );

        state.currentOperation = nextOperation;
        state.summaryRefreshKey += 1;
      })
      .addCase(updateFinancialOperation.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload || {
          message: 'Failed to update financial operation',
        };
      });

    builder
      .addCase(updateFinancialOperationStatus.pending, (state) => {
        // Track status mutations separately from edit form mutations.
        state.statusUpdateStatus = 'loading';
        state.statusUpdateError = null;
      })
      .addCase(updateFinancialOperationStatus.fulfilled, (state, action) => {
        const nextOperation = action.payload?.operation ?? null;

        state.statusUpdateStatus = 'succeeded';
        state.statusUpdateError = null;

        if (!nextOperation) return;

        state.items = (state.items || []).map((operation) =>
          String(operation?.id ?? '') === String(nextOperation?.id ?? '')
            ? { ...operation, ...nextOperation }
            : operation,
        );

        if (
          state.currentOperation &&
          String(state.currentOperation?.id ?? '') === String(nextOperation?.id ?? '')
        ) {
          state.currentOperation = {
            ...state.currentOperation,
            ...nextOperation,
          };
        }

        state.summaryRefreshKey += 1;
      })
      .addCase(updateFinancialOperationStatus.rejected, (state, action) => {
        state.statusUpdateStatus = 'failed';
        state.statusUpdateError = action.payload || {
          message: 'Failed to update operation status',
        };
      });


    builder
      .addCase(deleteFinancialOperation.pending, (state) => {
        state.operationDeleteStatus = 'loading';
        state.operationDeleteError = null;
      })
      .addCase(deleteFinancialOperation.fulfilled, (state, action) => {
        const operationId = String(action.payload?.operationId ?? '');

        state.operationDeleteStatus = 'succeeded';
        state.operationDeleteError = null;
        state.items = (state.items || []).filter(
          (operation) => String(operation?.id ?? '') !== operationId,
        );
        state.total = Math.max(Number(state.total ?? 0) - 1, 0);

        if (
          state.currentOperation &&
          String(state.currentOperation?.id ?? '') === operationId
        ) {
          state.currentOperation = null;
        }

        state.summaryRefreshKey += 1;
      })
      .addCase(deleteFinancialOperation.rejected, (state, action) => {
        state.operationDeleteStatus = 'failed';
        state.operationDeleteError = action.payload || {
          message: 'Failed to delete financial operation',
        };
      });

    builder
      .addCase(getFinancialOperations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFinancialOperations.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = Array.isArray(action.payload?.operations)
          ? action.payload.operations
          : [];
        state.links = action.payload?.links ?? null;
        state.meta = action.payload?.meta ?? null;
        state.total = action.payload?.total ?? 0;

        if (state.currentOperation?.id != null) {
          const matchedOperation = state.items.find(
            (operation) =>
              String(operation?.id ?? '') ===
              String(state.currentOperation?.id ?? ''),
          );

          if (matchedOperation) {
            state.currentOperation = {
              ...state.currentOperation,
              ...matchedOperation,
              files: state.currentOperation?.files || [],
            };
          }
        }
      })
      .addCase(getFinancialOperations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || {
          message: 'Failed to load financial operations',
        };
        state.items = [];
        state.links = null;
        state.meta = null;
        state.total = 0;
      });

    builder
      .addCase(getFinancialOperationSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(getFinancialOperationSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = null;
        state.summary = action.payload ?? emptyFinancialOperationSummary;
      })
      .addCase(getFinancialOperationSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = action.payload || {
          message: 'Failed to load financial summary',
        };
      });

    builder
      .addCase(getFinancialOperationDetail.pending, (state) => {
        state.currentOperationLoading = true;
        state.currentOperationError = null;
      })
      .addCase(getFinancialOperationDetail.fulfilled, (state, action) => {
        state.currentOperationLoading = false;
        state.currentOperationError = null;
        state.currentOperation = action.payload ?? null;
      })
      .addCase(getFinancialOperationDetail.rejected, (state, action) => {
        state.currentOperationLoading = false;
        state.currentOperationError = action.payload || {
          message: 'Failed to load operation detail',
        };
      });

    builder
      .addCase(uploadFinancialOperationFile.pending, (state) => {
        state.uploadStatus = 'loading';
        state.uploadError = null;
      })
      .addCase(uploadFinancialOperationFile.fulfilled, (state, action) => {
        const nextFile = action.payload?.file ?? null;
        const operationId = action.payload?.operationId ?? null;

        state.uploadStatus = 'succeeded';
        state.uploadError = null;

        if (
          nextFile &&
          state.currentOperation &&
          String(state.currentOperation?.id ?? '') === String(operationId ?? '')
        ) {
          const currentFiles = Array.isArray(state.currentOperation.files)
            ? state.currentOperation.files
            : [];

          state.currentOperation.files = [nextFile, ...currentFiles];
        }
      })
      .addCase(uploadFinancialOperationFile.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.uploadError = action.payload || {
          message: 'Failed to upload operation file',
        };
      });

    builder
      .addCase(deleteFinancialOperationFile.pending, (state, action) => {
        const fileId = String(action.meta?.arg?.fileId ?? '');
        if (!fileId) return;

        state.deleteError = null;
        state.deletingFileIds[fileId] = true;
      })
      .addCase(deleteFinancialOperationFile.fulfilled, (state, action) => {
        const fileId = String(action.payload?.fileId ?? '');
        if (fileId) {
          delete state.deletingFileIds[fileId];
        }

        state.deleteError = null;

        if (state.currentOperation) {
          state.currentOperation.files = (state.currentOperation.files || []).filter(
            (file) => String(file?.id ?? '') !== fileId,
          );
        }
      })
      .addCase(deleteFinancialOperationFile.rejected, (state, action) => {
        const fileId = String(action.meta?.arg?.fileId ?? '');
        if (fileId) {
          delete state.deletingFileIds[fileId];
        }

        state.deleteError = action.payload || {
          message: 'Failed to delete operation file',
        };
      });
  },
});

export const {
  clearFinancialOperationDetail,
  resetFinancialOperationMutationState,
} = financialOperationsSlice.actions;

export default financialOperationsSlice.reducer;
