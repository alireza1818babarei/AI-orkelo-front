import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  clearInitialState,
  getTrackingTasks,
} from "../../../store/tasks/trackingTasksSlice";
import { TODO_BOARD_TYPE } from "../../../store/projects/projectTodoListSlice";
import { formatMonthDayTime } from "../../../utils/date";

const DEFAULT_TRACKER_COLUMNS = 4;
const RUNNING_TIME_REFRESH_MS = 30000;

const getRunningDurationSeconds = (startedAt, nowMs) => {
  const startedAtMs = new Date(startedAt ?? "").getTime();

  if (!Number.isFinite(startedAtMs)) return 0;

  return Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
};

const formatUnit = (value, unit) =>
  `${value} ${unit}${value === 1 ? "" : "s"}`;

const formatRunningDuration = (seconds) => {
  const totalMinutes = Math.floor(Math.max(0, Number(seconds) || 0) / 60);

  if (totalMinutes < 1) return "Less than 1 minute";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return formatUnit(minutes, "minute");
  if (minutes === 0) return formatUnit(hours, "hour");

  return `${formatUnit(hours, "hour")}, ${formatUnit(minutes, "minute")}`;
};

const getFallbackColumnsPerRow = () => {
  if (typeof window === "undefined") return DEFAULT_TRACKER_COLUMNS;

  if (window.innerWidth <= 576) return 1;
  if (window.innerWidth <= 992) return 2;
  if (window.innerWidth <= 1400) return 3;

  return DEFAULT_TRACKER_COLUMNS;
};

const normalizeBoardType = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const buildTrackingTaskUrl = (baseUrl, task) => {
  const normalizedBase = String(baseUrl || "/");
  const safeBase = normalizedBase.endsWith("/")
    ? normalizedBase
    : `${normalizedBase}/`;
  const path = `projects/${encodeURIComponent(task.project_id)}/task/${encodeURIComponent(task.task_id)}`;

  return normalizeBoardType(task?.task_board_type) === TODO_BOARD_TYPE
    ? `${safeBase}${path}?view=todo-list`
    : `${safeBase}${path}`;
};

const TrackingTasks = () => {
  const dispatch = useDispatch();
  const trackerGridRef = useRef(null);
  const { data, error, loading } = useSelector((s) => s.taskTracking);
  const activeCompanyId = useSelector(
    (s) =>
      s.companyContext?.activeCompanyId ??
      s.companyContext?.activeCompany?.id ??
      null
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [columnsPerRow, setColumnsPerRow] = useState(getFallbackColumnsPerRow);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (activeCompanyId == null) {
      dispatch(clearInitialState());
      return undefined;
    }

    dispatch(clearInitialState());
    const trackingRequest = dispatch(getTrackingTasks());

    return () => {
      trackingRequest.abort();
    };
  }, [activeCompanyId, dispatch]);

  useEffect(() => {
    // Refresh minute-level running time without forcing a render every second.
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, RUNNING_TIME_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const updateColumnsPerRow = useCallback(() => {
    const gridElement = trackerGridRef.current;

    if (!gridElement) {
      setColumnsPerRow(getFallbackColumnsPerRow());
      return;
    }

    // Read the actual rendered grid columns so the first row stays correct on every breakpoint.
    const templateColumns = window
      .getComputedStyle(gridElement)
      .gridTemplateColumns.split(" ")
      .filter(Boolean);

    setColumnsPerRow(templateColumns.length || getFallbackColumnsPerRow());
  }, []);

  useEffect(() => {
    updateColumnsPerRow();

    window.addEventListener("resize", updateColumnsPerRow);

    //  ResizeObserver catches layout changes such as sidebar width changes without relying only on window resize.
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && trackerGridRef.current
        ? new ResizeObserver(updateColumnsPerRow)
        : null;

    if (resizeObserver && trackerGridRef.current) {
      resizeObserver.observe(trackerGridRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateColumnsPerRow);
      resizeObserver?.disconnect();
    };
  }, [data.length, updateColumnsPerRow]);

  useEffect(() => {
    if (data.length <= columnsPerRow) {
      setIsExpanded(false);
    }
  }, [columnsPerRow, data.length]);

  const taskModalUrl = import.meta.env.VITE_FRONTEND_BASE_URL;
  const hasHiddenRows = data.length > columnsPerRow;

  //  Keep only the first grid row rendered until the user chooses to expand the tracker list.
  const visibleTasks = isExpanded ? data : data.slice(0, columnsPerRow);

  return (
    <div className="mt-5 mb-5 tracker-panel home-panel">
      <h3 className="text-center tracker-panel__title">Tracking Tasks</h3>

      {loading && (
        <div className="text-center tracker-panel__state">
          <iconify-icon icon="line-md:loading-twotone-loop"></iconify-icon>
        </div>
      )}

      {error && (
        <div className="text-center tracker-panel__state">
          <small className="tracker-panel__message tracker-panel__message--danger">
            {error?.message || error}
          </small>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center tracker-panel__state">
          <small className="tracker-panel__message tracker-panel__message--warning">
            There is no tracking tasks yet.
          </small>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="tracker__homeContent">
          <div
            id="trackingTasksGrid"
            ref={trackerGridRef}
            className="tracker__homePage b-r-5"
          >
            {visibleTasks.map((task) => (
              <Link
                to={buildTrackingTaskUrl(taskModalUrl, task)}
                key={task.id}
                className="tracker__homeLink"
              >
                <div className="tracker__homeCard d-flex flex-column px-4 py-3">
                  <p className="trackerBadge__homePage fw-bold align-self-start px-2 py-1 b-r-10">
                    {task.project_name}
                  </p>

                  <p className="trackerDetail__homePage">
                    <span className="trackerLabel__homePage">User name:</span>
                    <span className="trackerValue__homePage text-capitalize">
                      {task.user_name}
                    </span>
                  </p>

                  <p className="trackerDetail__homePage">
                    <span className="trackerLabel__homePage">Task name:</span>
                    <span className="trackerValue__homePage text-capitalize">
                      {task.task_name}
                    </span>
                  </p>

                  <p className="trackerDetail__homePage">
                    <span className="trackerLabel__homePage">Started at:</span>
                    <span className="trackerValue__homePage">
                      {formatMonthDayTime(task.start_track)}
                    </span>
                  </p>

                  <p className="trackerDetail__homePage">
                    <span className="trackerLabel__homePage">
                      Running time:
                    </span>
                    <span className="trackerValue__homePage">
                      {formatRunningDuration(
                        getRunningDurationSeconds(task.start_track, nowMs)
                      )}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {hasHiddenRows && (
            <div className="tracker__toggleWrap">
              <button
                type="button"
                className="tracker__toggleButton"
                aria-controls="trackingTasksGrid"
                aria-expanded={isExpanded}
                onClick={() => setIsExpanded((currentValue) => !currentValue)}
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackingTasks;
