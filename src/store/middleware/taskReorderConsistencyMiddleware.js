const PROJECT_TASK_REORDER_FULFILLED =
  "projectColumns/reorderTask/fulfilled";
const TODO_TASK_REORDER_FULFILLED =
  "projectTodoList/reorderTask/fulfilled";

/**
 * Pointer drag applies moves optimistically before persistence begins.
 * Older fulfilled responses must not replay stale ordering over a newer drag.
 * Manual optimistic Todo actions are explicitly allowed through.
 */
export const taskReorderConsistencyMiddleware = () => (next) => (action) => {
  if (action?.type === PROJECT_TASK_REORDER_FULFILLED) {
    return action;
  }

  if (
    action?.type === TODO_TASK_REORDER_FULFILLED &&
    !action?.meta?.manualOptimistic
  ) {
    return action;
  }

  return next(action);
};

export default taskReorderConsistencyMiddleware;
