import React from "react";
import { getStageLabel } from "./superTask.utils";

const getStageKey = (stage, index) =>
  stage?.id ?? stage?.slug ?? getStageLabel(stage) ?? index;

export default function SuperTaskRoleStages({ stages = [] }) {
  const orderedStages = Array.isArray(stages) ? stages : [];

  if (!orderedStages.length) return null;

  return (
    <div className="super-task-role-stages" aria-label="Work role stages">
      {orderedStages.map((stage, index) => (
        <span
          key={getStageKey(stage, index)}
          className={stage?.is_ready ? "is-ready" : "is-progress"}
          title={`${stage?.work_items_count || 0} Work Item(s)`}
        >
          <i
            className={
              stage?.is_ready
                ? "ti ti-circle-check-filled"
                : "ti ti-loader-2"
            }
            aria-hidden="true"
          />
          {getStageLabel(stage)}
        </span>
      ))}
    </div>
  );
}
