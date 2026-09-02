import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "reactstrap";
import {
  getWorkItemTrackers,
  resumeWorkItemTracker,
  startWorkItemTracker,
  stopWorkItemTracker,
} from "../../../api/superTask";
import { toastError } from "../../../utils/sweetAlert";

const clampSeconds = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
};

const formatElapsed = (value) => {
  const totalSeconds = clampSeconds(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (part) => String(part).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function SuperTaskWorkItemTimer({
  isActive,
  projectId,
  taskId,
  subTaskId,
  workItem,
  onChanged,
}) {
  const workItemId = workItem?.id;
  const canTrack = Boolean(workItem?.capabilities?.can_track);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [trackers, setTrackers] = useState([]);
  const [activeTracker, setActiveTracker] = useState(
    workItem?.time_tracking?.active_tracker ?? null,
  );
  const [baseTotal, setBaseTotal] = useState(
    clampSeconds(workItem?.time_tracking?.total_time),
  );
  const [nowMs, setNowMs] = useState(Date.now());

  const syncTrackerData = useCallback((data) => {
    setTrackers(Array.isArray(data?.trackers) ? data.trackers : []);
    setActiveTracker(data?.active_tracker ?? null);
    setBaseTotal(clampSeconds(data?.work_item_total_time));
    setNowMs(Date.now());
  }, []);

  const loadTrackers = useCallback(async () => {
    if (!isActive || !projectId || !taskId || !subTaskId || !workItemId) return;

    try {
      setLoading(true);
      const data = await getWorkItemTrackers(
        projectId,
        taskId,
        subTaskId,
        workItemId,
      );
      syncTrackerData(data);
    } catch (error) {
      toastError(getErrorMessage(error, "Load Work Item tracker failed"));
    } finally {
      setLoading(false);
    }
  }, [isActive, projectId, subTaskId, syncTrackerData, taskId, workItemId]);

  useEffect(() => {
    if (!isActive) return;
    setActiveTracker(workItem?.time_tracking?.active_tracker ?? null);
    setBaseTotal(clampSeconds(workItem?.time_tracking?.total_time));
    setNowMs(Date.now());
    loadTrackers();
  }, [isActive, loadTrackers, workItem?.time_tracking]);

  useEffect(() => {
    if (!activeTracker?.start_track) return undefined;
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [activeTracker?.start_track]);

  const elapsedSeconds = useMemo(() => {
    if (!activeTracker?.start_track) return baseTotal;
    const startedAtMs = new Date(activeTracker.start_track).getTime();
    if (!Number.isFinite(startedAtMs)) return baseTotal;

    // The backend total contains completed sessions; add only the current live span.
    return baseTotal + Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
  }, [activeTracker?.start_track, baseTotal, nowMs]);

  const runMutation = async (mutation, fallbackMessage, timestampField) => {
    if (!canTrack || saving) return;
    try {
      setSaving(true);
      const data = await mutation({
        projectId,
        taskId,
        subTaskId,
        workItemId,
        payload: { [timestampField]: new Date().toISOString() },
      });
      setTrackers((current) =>
        data?.tracker
          ? [
              data.tracker,
              ...current.filter(
                (tracker) => String(tracker?.id) !== String(data.tracker.id),
              ),
            ]
          : current,
      );
      setActiveTracker(data?.tracker?.stop_track ? null : data?.tracker ?? null);
      setBaseTotal(clampSeconds(data?.work_item_total_time));
      setNowMs(Date.now());
      await Promise.resolve(onChanged?.());
    } catch (error) {
      toastError(getErrorMessage(error, fallbackMessage));
    } finally {
      setSaving(false);
    }
  };

  const hasHistory = trackers.length > 0 || baseTotal > 0;
  const running = Boolean(activeTracker?.start_track && !activeTracker?.stop_track);
  const statusLabel = running ? "Running" : elapsedSeconds > 0 ? "Stopped" : "Idle";
  const disabled = loading || saving || !canTrack;

  return (
    <div className="task-detail-timer" aria-label="Work Item timer">
      <div className="task-detail-timer__head">
        <span className="task-detail-timer__label">
          <i className="ph ph-timer" aria-hidden="true" />
          Timer
        </span>
        <span className={`task-detail-timer__status ${running ? "is-running" : ""}`}>
          {loading ? <Spinner size="sm" /> : statusLabel}
        </span>
      </div>
      <div className="task-detail-timer__value" aria-live="polite">
        {formatElapsed(elapsedSeconds)}
      </div>
      <div className="task-detail-timer__actions">
        <button
          type="button"
          className={`btn task-detail-timer__icon-btn ${running ? "btn-outline-primary" : "btn-primary"}`}
          onClick={() =>
            runMutation(
              hasHistory ? resumeWorkItemTracker : startWorkItemTracker,
              hasHistory ? "Resume tracker failed" : "Start tracker failed",
              "start_track",
            )
          }
          disabled={disabled || running}
          aria-label={hasHistory ? "Resume Work Item timer" : "Start Work Item timer"}
          title={
            canTrack
              ? hasHistory
                ? "Resume"
                : "Start"
              : "Only the assigned user can track an in-progress Work Item"
          }
        >
          {saving && !running ? (
            <Spinner size="sm" />
          ) : (
            <i className="ph-fill ph-play" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className={`btn task-detail-timer__icon-btn ${running ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() =>
            runMutation(
              stopWorkItemTracker,
              "Stop tracker failed",
              "stop_track",
            )
          }
          disabled={disabled || !running}
          aria-label="Stop Work Item timer"
          title={canTrack ? "Stop" : "You cannot control this Work Item timer"}
        >
          {saving && running ? (
            <Spinner size="sm" />
          ) : (
            <i className="ph-fill ph-stop" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
