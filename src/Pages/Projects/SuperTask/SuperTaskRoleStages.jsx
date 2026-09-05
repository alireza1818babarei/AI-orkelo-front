import React from "react";
import { getStageLabel } from "./superTask.utils";
import "./superTaskRoleStages.css";

const getStageKey = (stage, index) =>
  stage?.id ?? stage?.slug ?? getStageLabel(stage) ?? index;

export default function SuperTaskRoleStages({ stages = [] }) {
  const orderedStages = Array.isArray(stages) ? stages : [];

  if (!orderedStages.length) return null;

  return (
    <div className="super-task-role-stages" aria-label="Work role stages">
      {orderedStages.map((stage, index) => {
        const isReady = stage?.is_ready === true;

        return (
          <span
            key={getStageKey(stage, index)}
            className={`super-task-role-stage ${
              isReady ? "is-ready" : "is-progress"
            }`}
            title={`${stage?.work_items_count || 0} Work Item(s)`}
          >
            {isReady ? (
              <i className="ti ti-check" aria-hidden="true" />
            ) : null}
            {getStageLabel(stage)}
          </span>
        );
      })}
    </div>
  );
}
