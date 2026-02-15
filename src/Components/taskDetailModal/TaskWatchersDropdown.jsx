import React, { useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  addTaskWatcherThunk,
  getTaskPeopleThunk,
  removeTaskWatcherThunk,
} from "../../store/tasks/taskPeopleSlice";
import { toastError } from "../../utils/sweetAlert";

const getUserKey = (u) => String(u?.id ?? u?.user_id ?? u?.uuid ?? "");
const getUserLabel = (u) =>
  u?.name ?? u?.full_name ?? u?.username ?? u?.email ?? `User ${getUserKey(u)}`;

export default function TaskWatchersDropdown({
  projectId,
  taskId,
  disabled = false,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  const peopleState = useSelector((s) => s.taskPeople);

  const matches =
    peopleState?.projectId != null &&
    peopleState?.taskId != null &&
    String(peopleState.projectId) === String(projectId) &&
    String(peopleState.taskId) === String(taskId);

  const people = matches ? peopleState?.people || [] : [];
  const watcherIds = matches ? peopleState?.watcherIds || [] : [];
  const updatingByUserId = peopleState?.updatingWatcherByUserId || {};
  const loading = open && peopleState?.status === "loading";

  const watcherSet = useMemo(
    () => new Set((watcherIds || []).map(String)),
    [watcherIds],
  );

  useEffect(() => {
    if (!open) return;
    if (!projectId || !taskId) return;
    dispatch(getTaskPeopleThunk({ projectId, taskId }));
  }, [open, dispatch, projectId, taskId]);

  const toggleWatcher = async (user) => {
    if (!projectId || !taskId) return;
    const userId = user?.id ?? user?.user_id ?? user?.uuid ?? null;
    if (userId == null) return;
    const key = String(userId);
    const isWatcher = watcherSet.has(key);
    try {
      if (isWatcher) {
        await dispatch(removeTaskWatcherThunk({ projectId, taskId, userId })).unwrap();
      } else {
        await dispatch(addTaskWatcherThunk({ projectId, taskId, userId })).unwrap();
      }
    } catch (err) {
      const msg = err?.message || err?.data?.message || "Update watchers failed";
      toastError(msg);
    }
  };

  return (
    <Dropdown isOpen={open} toggle={toggle}>
      <DropdownToggle
        tag="button"
        type="button"
        disabled={disabled}
        className="btn d-flex align-items-center justify-content-between px-0 w-100"
      >
        <span className="d-flex align-items-center gap-2">
          <i className="ti ti-eye fs-5"></i>
          Watchers
        </span>
        <i className="ti ti-chevron-down"></i>
      </DropdownToggle>

      <DropdownMenu end className="p-1" style={{ minWidth: 260 }}>
        {loading ? (
          <div className="d-flex align-items-center gap-2 px-2 py-2 text-muted small">
            <Spinner size="sm" color="primary" />
            <span>Loading...</span>
          </div>
        ) : people.length ? (
          people.map((u, idx) => {
            const key = getUserKey(u) || `${idx}`;
            const selected = watcherSet.has(String(key));
            const busy = !!updatingByUserId[String(key)];
            return (
              <DropdownItem
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWatcher(u);
                }}
                className={selected ? "bg-light" : ""}
                disabled={busy}
              >
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="text-truncate">{getUserLabel(u)}</span>
                  {busy ? (
                    <Spinner size="sm" color="primary" />
                  ) : selected ? (
                    <i className="ti ti-check text-success fs-5"></i>
                  ) : (
                    <span className="text-muted small">Add</span>
                  )}
                </div>
              </DropdownItem>
            );
          })
        ) : (
          <div className="px-2 py-2 text-muted small">No people.</div>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
