import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import api from "../../api/axios";
import {
  getColumnTasksThunk,
  PROJECT_COLUMN_TASK_PAGE_SIZE,
} from "../../store/projects/projectColumnsSlice";
import { getProjectsThunk } from "../../store/projects/projectsSlice";
import { getErrorMessage } from "../../utils/getError";
import { toastError, toastSuccess } from "../../utils/sweetAlert";

const TASK_MANAGER_BOARD = "task_manager";
const TODO_LIST_BOARD = "todo_list";

const normalizeBoardType = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === TODO_LIST_BOARD ? TODO_LIST_BOARD : TASK_MANAGER_BOARD;
};

const resolveTaskColumn = (task, projectColumns, taskId) => {
  const directColumnId =
    task?.column?.id ?? task?.column_id ?? task?.columnId ?? null;
  const directBoardType = task?.column?.board_type ?? task?.board_type ?? null;

  if (directColumnId != null) {
    const matchingColumn = (projectColumns || []).find(
      (column) => String(column?.id) === String(directColumnId),
    );

    return {
      id: directColumnId,
      boardType: normalizeBoardType(
        directBoardType ?? matchingColumn?.board_type,
      ),
    };
  }

  for (const column of projectColumns || []) {
    const containsTask = (Array.isArray(column?.tasks) ? column.tasks : []).some(
      (item) => String(item?.id ?? "") === String(taskId ?? ""),
    );

    if (containsTask) {
      return {
        id: column?.id ?? null,
        boardType: normalizeBoardType(column?.board_type),
      };
    }
  }

  return { id: null, boardType: TASK_MANAGER_BOARD };
};

const TaskMoveModal = ({
  isOpen,
  onClose,
  task: providedTask = null,
  projectId: providedProjectId = null,
  onMoved = null,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const taskDetail = useSelector((state) => state.taskDetail ?? {});
  const projectsState = useSelector((state) => state.projects ?? {});
  const projectColumns = useSelector(
    (state) => state.projectColumns?.items ?? [],
  );

  const projectItems = Array.isArray(projectsState?.items)
    ? projectsState.items
    : [];
  const task = providedTask ?? taskDetail?.task ?? null;
  const taskId = task?.id ?? taskDetail?.taskId ?? null;
  const sourceProjectId =
    providedProjectId ??
    task?.project?.id ?? task?.project_id ?? taskDetail?.projectId ?? null;
  const sourceProjectName =
    task?.project?.name ??
    projectItems.find(
      (project) => String(project?.id) === String(sourceProjectId),
    )?.name ??
    "Current project";

  const sourceColumn = useMemo(
    () => resolveTaskColumn(task, projectColumns, taskId),
    [projectColumns, task, taskId],
  );

  const destinationProjects = useMemo(
    () =>
      projectItems.filter(
        (project) => String(project?.id) !== String(sourceProjectId),
      ),
    [projectItems, sourceProjectId],
  );

  const [destinationProjectId, setDestinationProjectId] = useState("");
  const [destinationColumnId, setDestinationColumnId] = useState("");
  const [destinationColumns, setDestinationColumns] = useState([]);
  const [columnsLoading, setColumnsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setDestinationProjectId("");
    setDestinationColumnId("");
    setDestinationColumns([]);
    setInlineError("");

    if (
      projectItems.length === 0 &&
      projectsState?.status !== "loading" &&
      !projectsState?.loading
    ) {
      dispatch(getProjectsThunk());
    }
  }, [
    dispatch,
    isOpen,
    projectItems.length,
    projectsState?.loading,
    projectsState?.status,
  ]);

  useEffect(() => {
    if (!isOpen || !destinationProjectId) {
      setDestinationColumns([]);
      setDestinationColumnId("");
      return;
    }

    let active = true;

    const loadColumns = async () => {
      setColumnsLoading(true);
      setInlineError("");
      setDestinationColumnId("");

      try {
        const response = await api.get(
          `/projects/${destinationProjectId}/columns`,
          {
            params: { board_type: sourceColumn.boardType },
          },
        );

        const columns = response?.data?.data ?? [];
        if (!active) return;

        setDestinationColumns(
          (Array.isArray(columns) ? columns : []).filter(
            (column) =>
              normalizeBoardType(column?.board_type) === sourceColumn.boardType,
          ),
        );
      } catch (error) {
        if (!active) return;
        const normalizedError = getErrorMessage(error);
        setDestinationColumns([]);
        setInlineError(
          normalizedError?.message ||
            "Destination columns could not be loaded.",
        );
      } finally {
        if (active) setColumnsLoading(false);
      }
    };

    loadColumns();

    return () => {
      active = false;
    };
  }, [destinationProjectId, isOpen, sourceColumn.boardType]);

  const handleMove = async () => {
    if (submitting) return;

    if (!sourceProjectId || !sourceColumn.id || !taskId) {
      setInlineError(
        "Task location is unavailable. Refresh the board and try again.",
      );
      return;
    }

    if (!destinationProjectId || !destinationColumnId) {
      setInlineError("Select both a destination project and column.");
      return;
    }

    setSubmitting(true);
    setInlineError("");

    try {
      const response = await api.patch(
        `/projects/${sourceProjectId}/columns/${sourceColumn.id}/tasks/${taskId}/move`,
        {
          destination_project_id: Number(destinationProjectId),
          destination_column_id: Number(destinationColumnId),
        },
      );

      dispatch(
        getColumnTasksThunk({
          projectId: sourceProjectId,
          columnId: sourceColumn.id,
          page: 1,
          perPage: PROJECT_COLUMN_TASK_PAGE_SIZE,
          force: true,
        }),
      );
      dispatch(getProjectsThunk());

      toastSuccess("Task moved to the destination project.");
      onClose();
      if (typeof onMoved === "function") {
        onMoved({
          destinationProjectId,
          destinationColumnId,
          taskId,
          response: response?.data?.data ?? response?.data ?? null,
        });
      } else {
        navigate(`/projects/${sourceProjectId}`, { replace: true });
      }
    } catch (error) {
      const normalizedError = getErrorMessage(error);
      const message = normalizedError?.message || "Task could not be moved.";
      setInlineError(message);
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProject = destinationProjects.find(
    (project) => String(project?.id) === String(destinationProjectId),
  );

  return (
    <Modal
      isOpen={isOpen}
      toggle={submitting ? undefined : onClose}
      centered
      zIndex={1080}
      backdrop={submitting ? "static" : true}
      keyboard={!submitting}
      className="byekan-font task-move-modal"
    >
      <ModalHeader toggle={submitting ? undefined : onClose}>
        Move task to another project
      </ModalHeader>
      <ModalBody>
        <p className="text-muted mb-3">
          Move this task from <strong>{sourceProjectName}</strong> to a compatible
          column in another project.
        </p>

        <div className="alert alert-warning py-2" role="alert">
          Project-specific tags will be removed. The task description, checklist,
          comments, attachments, assignees, and tracking history will remain.
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="task-move-project">
            Destination project
          </label>
          <select
            id="task-move-project"
            className="form-select"
            value={destinationProjectId}
            disabled={submitting || projectsState?.loading}
            onChange={(event) => setDestinationProjectId(event.target.value)}
          >
            <option value="">
              {projectsState?.loading
                ? "Loading projects..."
                : "Select a project"}
            </option>
            {destinationProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name || `Project ${project.id}`}
              </option>
            ))}
          </select>
          {!projectsState?.loading && destinationProjects.length === 0 ? (
            <div className="form-text">
              No other accessible active project is available.
            </div>
          ) : null}
        </div>

        <div className="mb-2">
          <label className="form-label" htmlFor="task-move-column">
            Destination column
          </label>
          <select
            id="task-move-column"
            className="form-select"
            value={destinationColumnId}
            disabled={
              submitting ||
              !destinationProjectId ||
              columnsLoading ||
              destinationColumns.length === 0
            }
            onChange={(event) => setDestinationColumnId(event.target.value)}
          >
            <option value="">
              {columnsLoading ? "Loading columns..." : "Select a column"}
            </option>
            {destinationColumns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title || `Column ${column.id}`}
              </option>
            ))}
          </select>
          {destinationProjectId &&
          !columnsLoading &&
          destinationColumns.length === 0 &&
          !inlineError ? (
            <div className="form-text">
              {selectedProject?.name || "This project"} has no compatible
              {sourceColumn.boardType === TODO_LIST_BOARD
                ? " Todo List"
                : " Task Manager"} column.
            </div>
          ) : null}
        </div>

        {inlineError ? (
          <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">
            {inlineError}
          </div>
        ) : null}
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          onClick={handleMove}
          disabled={
            submitting || !destinationProjectId || !destinationColumnId
          }
        >
          {submitting ? (
            <Spinner size="sm" />
          ) : (
            <i className="ti ti-arrow-right" aria-hidden="true" />
          )}
          Move task
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default TaskMoveModal;
