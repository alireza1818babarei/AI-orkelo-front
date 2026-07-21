const PROJECT_TASK_REORDER_FULFILLED =
  "projectColumns/reorderTask/fulfilled";

/**
 * Task moves are applied optimistically before the API request starts.
 *
 * Several drag operations may be in flight at the same time. Re-applying an
 * older fulfilled payload would overwrite the newest optimistic board state
 * and make cards jump backwards until the last request finishes.
 *
 * The fulfilled action still resolves the createAsyncThunk promise; it is only
 * prevented from mutating Redux a second time.
 */
export const taskReorderConsistencyMiddleware = () => (next) => (action) => {
  if (action?.type === PROJECT_TASK_REORDER_FULFILLED) {
    return action;
  }

  return next(action);
};

export default taskReorderConsistencyMiddleware;
