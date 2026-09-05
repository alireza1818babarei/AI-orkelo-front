import React, { useEffect, useRef, useState } from "react";
import { getStageLabel } from "./superTask.utils";
import "./superTaskRoleStages.css";

const EMPTY_STAGES = [];
const MAX_VISIBLE_STAGES = 3;
const getStageKey = (stage, index) =>
  stage?.id ?? stage?.slug ?? getStageLabel(stage) ?? index;

export default function SuperTaskRoleStages({ stages = EMPTY_STAGES }) {
  const orderedStages = Array.isArray(stages) ? stages : EMPTY_STAGES;
  const showArrows = orderedStages.length > MAX_VISIBLE_STAGES;
  const [startIndex, setStartIndex] = useState(0);
  const maxStartIndex = Math.max(0, orderedStages.length - MAX_VISIBLE_STAGES);
  const visibleStart = Math.min(startIndex, maxStartIndex);
  const visibleStages = orderedStages.slice(visibleStart, visibleStart + MAX_VISIBLE_STAGES);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [navigation, setNavigation] = useState({ previous: false, next: false });

  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [maxStartIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return undefined;

    // Each page contains at most three complete labels; long labels remain scrollable.
    viewport.scrollLeft = 0;
    const updateNavigation = () => {
      const previous = viewport.scrollLeft > 1;
      const next = viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1;
      setNavigation((current) =>
        current.previous === previous && current.next === next
          ? current
          : { previous, next },
      );
    };
    updateNavigation();
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(viewport);
    observer.observe(track);
    viewport.addEventListener("scroll", updateNavigation, { passive: true });
    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", updateNavigation);
    };
  }, [orderedStages, visibleStart]);

  const move = (direction) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    // Advance the role window once the current page has been fully viewed.
    if (direction > 0 && !navigation.next && visibleStart < maxStartIndex) {
      setStartIndex(visibleStart + 1);
      return;
    }
    if (direction < 0 && !navigation.previous && visibleStart > 0) {
      setStartIndex(visibleStart - 1);
      return;
    }
    const left = viewport.scrollLeft;
    const width = viewport.clientWidth;
    const roles = Array.from(track.children);
    // Bring the next clipped role fully into view; oversized names remain scrollable.
    const target = direction > 0
      ? roles.find((role) => role.offsetLeft + role.offsetWidth > left + width + 1)
      : roles.slice().reverse().find((role) => role.offsetLeft < left - 1);
    const position = target
      ? direction > 0
        ? Math.min(target.offsetLeft, left + width)
        : Math.max(target.offsetLeft, left - width)
      : left + direction * width;
    viewport.scrollTo({
      left: position > left || direction < 0 ? position : left + width,
      behavior: "auto",
    });
  };

  if (!orderedStages.length) return null;

  return (
    <div className="super-task-role-stages" aria-label="Work role stages">
      {showArrows ? (
        <button
          type="button"
          className="super-task-role-stages__arrow is-previous"
          onClick={() => move(-1)}
          disabled={!navigation.previous && visibleStart === 0}
          aria-label="Show previous work role"
          title="Previous role"
        >
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
      ) : null}
      <div className="super-task-role-stages__viewport" ref={viewportRef}>
        <div className="super-task-role-stages__track" ref={trackRef}>
          {visibleStages.map((stage, index) => (
            <span
              key={getStageKey(stage, visibleStart + index)}
              className={`super-task-role-stage ${stage?.is_ready === true ? "is-ready" : "is-progress"}`}
              title={`${getStageLabel(stage)} · ${stage?.work_items_count || 0} Work Item(s)`}
            >
              {stage?.is_ready === true ? <i className="ti ti-check" aria-hidden="true" /> : null}
              <span className="super-task-role-stage__label">{getStageLabel(stage)}</span>
            </span>
          ))}
        </div>
      </div>
      {showArrows ? (
        <button
          type="button"
          className="super-task-role-stages__arrow is-next"
          onClick={() => move(1)}
          disabled={!navigation.next && visibleStart >= maxStartIndex}
          aria-label="Show next work role"
          title="Next role"
        >
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
