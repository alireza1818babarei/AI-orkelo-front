import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getArchivedTasks,
  restoreArchivedTasks,
} from "../../../../store/projects/projectArchivedTasksSlice";
import {
  getDeletedTasksThunk,
  restoreDeletedTaskThunk,
} from "../../../../store/projects/projectDeletedTasksSlice";
import { getColumnTasksThunk } from "../../../../store/projects/projectColumnsSlice";
import { toastError, toastSuccess } from "../../../../utils/sweetAlert";
import { Button } from "reactstrap";
import { getTaskDetailThunk } from "../../../../store/tasks/taskDetailSlice";

const ProjectTaskManager = ({ type, projectId, title, onRestored }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) =>
    type === "archived" ? state.archivedTasksSlice : state.deletedTaskSlice,
  );

  useEffect(() => {
    if (projectId) {
      if (type === "archived") {
        dispatch(getArchivedTasks({ projectId }));
      } else {
        dispatch(getDeletedTasksThunk({ projectId }));
      }
    }
  }, [projectId, type, dispatch]);

  const resolveTaskColumnId = (task) =>
    task?.column_id ?? task?.columnId ?? task?.column?.id ?? null;

  const handleRestore = async (task) => {
    const columnId = resolveTaskColumnId(task);
    const taskId = task?.id ?? null;
    if (!projectId || !columnId || !taskId) {
      toastError("Project/column/task id missing");
      return;
    }

    if (type === "archived") {
      try {
        await dispatch(restoreArchivedTasks({ projectId, columnId, taskId })).unwrap();
        await dispatch(
          getColumnTasksThunk({ projectId, columnId, force: true }),
        ).unwrap();
        onRestored?.({ taskId, columnId });
        toastSuccess("Task restored");
        dispatch(getTaskDetailThunk({ projectId, taskId }));
      } catch (err) {
        console.log(err);
        toastError(err.message || "Failed to restore task");
      }
    } else {
      try {
        await dispatch(restoreDeletedTaskThunk({ projectId, columnId, taskId })).unwrap();
        await dispatch(
          getColumnTasksThunk({ projectId, columnId, force: true }),
        ).unwrap();
        onRestored?.({ taskId, columnId });
        toastSuccess("Task restored");
        dispatch(getTaskDetailThunk({ projectId, taskId }));
      } catch (err) {
        console.log(err);
        toastError(err.message || "Failed to restore task");
      }
    }
  };

  const offcanvasId = `offcanvas-${type}-tasks`;
  const offcanvasLabelId = `offcanvas-${type}-tasks-label`;

  useEffect(() => {
    const offcanvasElement = document.getElementById(offcanvasId);

    if (offcanvasElement) {
      const handleShow = () => {
        if (!data || data.length === 0) {
          if (type === "archived") {
            dispatch(getArchivedTasks({ projectId }));
          } else {
            dispatch(getDeletedTasksThunk({ projectId }));
          }
        }
      };

      offcanvasElement.addEventListener("show.bs.offcanvas", handleShow);

      return () => {
        offcanvasElement.removeEventListener("show.bs.offcanvas", handleShow);
      };
    }
  }, [offcanvasId, projectId, type, dispatch, data]);

  return (
    <div className="offcanvas offcanvas-start" tabIndex="-1" id={offcanvasId}>
      <div className="offcanvas-header">
        <h5
          className="offcanvas-title fw-bold capitalized"
          id={offcanvasLabelId}
        >
          {title} Tasks
        </h5>
        <Button
          color="primary"
          type="button"
          className="btn-close text-reset fs-5 btn-primary"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></Button>
      </div>
      {loading && (
        <div className="text-center">
          <iconify-icon icon="line-md:loading-twotone-loop"></iconify-icon>
        </div>
      )}
      {error && (
        <div className="text-center text-danger">
          <small>{error.message || error}</small>
        </div>
      )}
      {!loading && !error && data?.length === 0 && (
        <div className="text-center text-warning">
          <small>There is no {title} tasks yet.</small>
        </div>
      )}
      {!loading && !error && data?.length > 0 && (
        <div className="offcanvas-body">
          {data.map((task) => (
            <div
              className="d-flex justify-content-between align-content-center border bg-primary p-2 b-r-10 mt-2"
              key={task.id}
            >
              <div className="mb-0 d-flex flex-column justify-content-center gap-2">
                <p className="fs-6">{task.text}</p>
                <p>{task.description}</p>
              </div>
              <button
                disabled={loading}
                onClick={() => handleRestore(task)}
                className="btn icon-btn fs-5"
              >
                <i className="ph-fill ph-arrow-counter-clockwise"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ProjectTaskManager;
