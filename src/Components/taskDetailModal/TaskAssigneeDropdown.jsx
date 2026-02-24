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
import { getProjectMembersThunk } from "../../store/projects/projectMembersSlice";
import { toastError } from "../../utils/sweetAlert";

const getUserKey = (u) => String(u?.id ?? u?.user_id ?? u?.uuid ?? "");
const getUserLabel = (u) =>
  u?.name ?? u?.full_name ?? u?.username ?? u?.email ?? `User ${getUserKey(u)}`;
const getUserAvatar = (u) => u?.avatar ?? u?.image ?? u?.photo ?? u?.avatar_url ?? null;
const mapProjectMembersToPeople = (members) => {
  const list = Array.isArray(members) ? members : [];
  const byId = new Map();

  list.forEach((member) => {
    const nestedUser = member?.user && typeof member.user === "object" ? member.user : null;
    const person = {
      ...(member && typeof member === "object" ? member : {}),
      ...(nestedUser && typeof nestedUser === "object" ? nestedUser : {}),
      id: nestedUser?.id ?? member?.user_id ?? member?.id ?? null,
      name:
        nestedUser?.name ??
        nestedUser?.full_name ??
        member?.name ??
        member?.full_name ??
        "",
      email: nestedUser?.email ?? member?.email ?? "",
      avatar:
        nestedUser?.avatar ??
        nestedUser?.avatar_url ??
        member?.avatar ??
        member?.avatar_url ??
        null,
    };

    const key = getUserKey(person);
    if (!key || byId.has(key)) return;
    byId.set(key, person);
  });

  return Array.from(byId.values());
};

export default function TaskAssigneeDropdown({
  projectId,
  taskId,
  selectedAssignees = [],
  disabled = false,
  variant = "sidebar",
  showSelectedInToggle = true,
}) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  const peopleState = useSelector((s) => s.taskPeople);
  const projectMembersState = useSelector((s) => s.projectMembers);
  const matches =
    peopleState?.projectId != null &&
    peopleState?.taskId != null &&
    String(peopleState.projectId) === String(projectId) &&
    String(peopleState.taskId) === String(taskId);
  const projectMembersMatch =
    projectMembersState?.projectId != null &&
    String(projectMembersState.projectId) === String(projectId);

  const taskPeople = matches ? peopleState?.people || [] : [];
  const projectMemberPeople = useMemo(
    () =>
      projectMembersMatch
        ? mapProjectMembersToPeople(projectMembersState?.items || [])
        : [],
    [projectMembersMatch, projectMembersState?.items],
  );
  const people = taskPeople.length ? taskPeople : projectMemberPeople;
  const assigneeFromPeople = matches ? peopleState?.assignee ?? null : null;
  const assigneeFromDetail =
    Array.isArray(selectedAssignees) && selectedAssignees.length
      ? selectedAssignees[0]
      : null;
  const assignee = assigneeFromPeople || assigneeFromDetail || null;
  const assigneeId = assignee ? getUserKey(assignee) : "";
  const loading = open && peopleState?.status === "loading";
  const saving = !!peopleState?.settingAssignee;

  const items = useMemo(() => people || [], [people]);

  useEffect(() => {
    if (!open) return;
    if (!projectId || !taskId) return;
    dispatch(getTaskPeopleThunk({ projectId, taskId }));
  }, [open, dispatch, projectId, taskId]);

  useEffect(() => {
    if (!open) return;
    if (!projectId) return;

    const needsProjectMembers =
      !projectMembersMatch || projectMembersState?.status === "idle";
    if (!needsProjectMembers) return;

    dispatch(getProjectMembersThunk(projectId));
  }, [open, dispatch, projectId, projectMembersMatch, projectMembersState?.status]);

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
        <DropdownToggle
          tag="button"
          type="button"
          disabled={disabled}
          className="btn text-muted d-inline-flex align-items-center gap-2"
          style={{
            position: "relative",
            overflow: "hidden",
            paddingRight: showSelectedInToggle && assignee ? 44 : undefined,
          }}
        >
          {/* avatar as a subtle background on the right */}
          {showSelectedInToggle && assignee && getUserAvatar(assignee) ? (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 26,
                height: 26,
                borderRadius: 999,
                overflow: "hidden",
                opacity: 0.95,
                boxShadow: "0 0 0 2px rgba(255,255,255,0.7)",
              }}
            >
              <img
                src={getUserAvatar(assignee)}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </span>
          ) : null}

          <i className="ti ti-user-plus fs-4" />
          <span className="d-inline-flex align-items-center gap-2" style={{ minWidth: 0 }}>
            <span className="text-truncate" style={{ maxWidth: 220 }}>
              {assignee ? `Assigned to ${getUserLabel(assignee)}` : "Assign to"}
            </span>
            <i className="ti ti-chevron-down" />
          </span>

          {saving ? <Spinner size="sm" color="primary" className="ms-1" /> : null}
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
