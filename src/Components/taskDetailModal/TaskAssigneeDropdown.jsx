import React, { useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { getTaskPeopleThunk, setTaskAssigneeThunk } from "../../store/tasks/taskPeopleSlice";
import { toastError } from "../../utils/sweetAlert";

const getUserKey = (u) => String(u?.id ?? u?.user_id ?? u?.uuid ?? "");
const getUserLabel = (u) =>
  u?.name ?? u?.full_name ?? u?.username ?? u?.email ?? `User ${getUserKey(u)}`;

export default function TaskAssigneeDropdown({
  projectId,
  taskId,
  disabled = false,
  variant = "sidebar",
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
  const assignee = matches ? peopleState?.assignee ?? null : null;
  const assigneeId = assignee ? getUserKey(assignee) : "";
  const loading = open && peopleState?.status === "loading";
  const saving = !!peopleState?.settingAssignee;

  const items = useMemo(() => people || [], [people]);

  useEffect(() => {
    if (!open) return;
    if (!projectId || !taskId) return;
    dispatch(getTaskPeopleThunk({ projectId, taskId }));
  }, [open, dispatch, projectId, taskId]);

  const setAssignee = async (userId) => {
    if (!projectId || !taskId) return;
    try {
      await dispatch(setTaskAssigneeThunk({ projectId, taskId, userId })).unwrap();
      setOpen(false);
    } catch (err) {
      const msg = err?.message || err?.data?.message || "Assign failed";
      toastError(msg);
    }
  };

  return (
    <Dropdown isOpen={open} toggle={toggle}>
      {variant === "header" ? (
        <DropdownToggle tag="button" type="button" disabled={disabled} className="btn text-muted">
          <i className="ti ti-user-plus me-1 fs-4"></i>
          Assign
          {saving ? <Spinner size="sm" color="primary" className="ms-2" /> : null}
        </DropdownToggle>
      ) : (
        <DropdownToggle
          tag="button"
          type="button"
          disabled={disabled}
          className="btn d-flex align-items-center justify-content-between px-0 border-bottom w-100"
        >
          <span className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
            <i className="ti ti-user fs-5"></i>
            <span className="text-truncate">
              {assignee ? `Assign to: ${getUserLabel(assignee)}` : "Assign to"}
            </span>
          </span>
          {saving ? (
            <Spinner size="sm" color="primary" />
          ) : (
            <i className="ti ti-chevron-down"></i>
          )}
        </DropdownToggle>
      )}

      <DropdownMenu end className="p-1" style={{ minWidth: 260 }}>
        {loading ? (
          <div className="d-flex align-items-center gap-2 px-2 py-2 text-muted small">
            <Spinner size="sm" color="primary" />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <DropdownItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAssignee(null);
              }}
              disabled={saving}
              className={!assigneeId ? "bg-light" : ""}
            >
              <div className="d-flex align-items-center justify-content-between gap-2">
                <span className="text-truncate">Unassigned</span>
                {!assigneeId ? <i className="ti ti-check text-success fs-5"></i> : null}
              </div>
            </DropdownItem>

            <DropdownItem divider />

            {items.length ? (
              items.map((u, idx) => {
                const key = getUserKey(u) || `${idx}`;
                const selected = assigneeId && String(assigneeId) === String(key);
                return (
                  <DropdownItem
                    key={key}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAssignee(key);
                    }}
                    disabled={saving}
                    className={selected ? "bg-light" : ""}
                  >
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <span className="text-truncate">{getUserLabel(u)}</span>
                      {selected ? (
                        <i className="ti ti-check text-success fs-5"></i>
                      ) : (
                        <span className="text-muted small">Assign</span>
                      )}
                    </div>
                  </DropdownItem>
                );
              })
            ) : (
              <div className="px-2 py-2 text-muted small">No people.</div>
            )}
          </>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
