import React, { useEffect, useState } from "react";
import { getStageLabel } from "./superTask.utils";
import "./superTaskRoleStages.css";

const VISIBLE_STAGE_COUNT = 3;

const getStageKey = (stage, index) =>
  stage?.id ?? stage?.slug ?? getStageLabel(stage) ?? index;

export default function SuperTaskRoleStages({ stages = [] }) {
  const orderedStages = Array.isArray(stages) ? stages : [];
  const [startIndex, setStartIndex] = useState(0);
  const maxStartIndex = Math.max(0, orderedStages.length - VISIBLE_STAGE_COUNT);
  const hasOverflow = orderedStages.length > VISIBLE_STAGE_COUNT;

  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [maxStartIndex]);

  if (!orderedStages.length) return null;

  const visibleStages = hasOverflow
    ? orderedStages.slice(startIndex, startIndex + VISIBLE_STAGE_COUNT)
    : orderedStages;

  const showPrevious = () => {
    setStartIndex((current) => Math.max(0, current - 1));
  };

  const showNext = () => {
    setStartIndex((current) => Math.min(maxStartIndex, current + 1));
  };

  return (
    <div
      className={`super-task-role-stages ${hasOverflow ? "has-overflow" : ""}`}
      aria-label="Work role stages"
    >
      {hasOverflow ? (
        <button
          type="button"
          className="super-task-role-stages__arrow is-previous"
          onClick={showPrevious}
          disabled={startIndex === 0}
          aria-label="Show previous work role"
          title="Previous role"
        >
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
      ) : null}

      <div className="super-task-role-stages__viewport">
        <div className="super-task-role-stages__track">
          {visibleStages.map((stage, visibleIndex) => {
            const stageIndex = startIndex + visibleIndex;
            const isReady = stage?.is_ready === true;

            return (
              <span
                key={getStageKey(stage, stageIndex)}
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
      </div>

      {hasOverflow ? (
        <button
          type="button"
          className="super-task-role-stages__arrow is-next"
          onClick={showNext}
          disabled={startIndex >= maxStartIndex}
          aria-label="Show next work role"
          title="Next role"
        >
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
