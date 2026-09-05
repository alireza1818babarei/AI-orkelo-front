import React, { useCallback, useEffect, useState } from "react";
import SuperTaskItemModalContent from "./SuperTaskItemModalContent";

export default function SuperTaskItemModal({
  initialWorkItemId = null,
  onWorkItemChange,
  ...props
}) {
  const [syncedWorkItemId, setSyncedWorkItemId] = useState(
    initialWorkItemId ?? null,
  );

  useEffect(() => {
    setSyncedWorkItemId(initialWorkItemId ?? null);
  }, [initialWorkItemId, props.isOpen, props.subTaskId]);

  const handleWorkItemChange = useCallback(
    (workItemId) => {
      const nextWorkItemId = workItemId ?? null;

      // Keep the modal's route intent in sync immediately. In particular,
      // Back must clear the Work Item intent in the same render batch as the
      // modal switches to its Sub-task view, otherwise the stale URL prop can
      // reopen the Work Item before React Router finishes updating the query.
      setSyncedWorkItemId(nextWorkItemId);
      onWorkItemChange?.(nextWorkItemId);
    },
    [onWorkItemChange],
  );

  return (
    <SuperTaskItemModalContent
      {...props}
      initialWorkItemId={syncedWorkItemId}
      onWorkItemChange={handleWorkItemChange}
    />
  );
}
