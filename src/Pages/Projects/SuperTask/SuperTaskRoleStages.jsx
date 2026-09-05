import React, { useEffect, useState } from "react";
import { getStageLabel } from "./superTask.utils";
import "./superTaskRoleStages.css";

const DESKTOP_VISIBLE_STAGE_COUNT = 3;
const MOBILE_VISIBLE_STAGE_COUNT = 2;
const MOBILE_STAGE_MEDIA_QUERY = "(max-width: 767px)";

const getStageKey = (stage, index) =>
  stage?.id ?? stage?.slug ?? getStageLabel(stage) ?? index;

const getVisibleStageCount = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return DESKTOP_VISIBLE_STAGE_COUNT;
  }

  return window.matchMedia(MOBILE_STAGE_MEDIA_QUERY).matches
    ? MOBILE_VISIBLE_STAGE_COUNT
    : DESKTOP_VISIBLE_STAGE_COUNT;
};

export default function SuperTaskRoleStages({ stages = [] }) {
  const orderedStages = Array.isArray(stages) ? stages : [];
  const [startIndex, setStartIndex] = useState(0);
  const [visibleStageCount, setVisibleStageCount] = useState(getVisibleStageCount);
  const maxStartIndex = Math.max(0, orderedStages.length - visibleStageCount);
  const hasOverflow = orderedStages.length > visibleStageCount;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia(MOBILE_STAGE_MEDIA_QUERY);
    const handleChange = () => {
      setVisibleStageCount(
        mediaQuery.matches
          ? MOBILE_VISIBLE_STAGE_COUNT
          : DESKTOP_VISIBLE_STAGE_COUNT,
      );
    };

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [maxStartIndex]);

  if (!orderedStages.length) return null;

  const visibleStages = hasOverflow
    ? orderedStages.slice(startIndex, startIndex + visibleStageCount)
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
                title={`${getStageLabel(stage)} · ${stage?.work_items_count || 0} Work Item(s)`}
              >
                {isReady ? (
                  <i className="ti ti-check" aria-hidden="true" />
                ) : null}
                <span className="super-task-role-stage__label">
                  {getStageLabel(stage)}
                </span>
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
