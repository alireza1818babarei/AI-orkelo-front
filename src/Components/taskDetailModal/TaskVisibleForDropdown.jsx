import React, { useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { toggleTaskVisibleForUserThunk } from "../../store/tasks/taskVisibleForSlice";
import { getTaskPeopleThunk } from "../../store/tasks/taskPeopleSlice";
import { getProjectMembersThunk } from "../../store/projects/projectMembersSlice";
import { toastError } from "../../utils/sweetAlert";
import { resolveUserAvatarWithFallback } from "../../utils/mediaUrl";

const getUserKey = (u) => String(u?.id ?? "");
const getUserLabel = (u) =>
  u?.name ?? u?.email ?? `User ${getUserKey(u)}`;

const DEFAULT_WATCHER_AVATAR = "/assets/images/avtar/3.png";

const normalizeAvatarUrl = (value, seed = "") =>
  resolveUserAvatarWithFallback(value, seed);

const getUserAvatar = (u) =>
  normalizeAvatarUrl(
    u?.avatar ?? "",
    getUserKey(u) || u?.email || getUserLabel(u)
  );

const getUserInitials = (u) => {
  const name = String(u?.name ?? u?.email ?? "").trim();
  if (!name) return "NA";
  const parts = name.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "NA";
};

const mapProjectMembersToPeople = (members) => {
  const list = Array.isArray(members) ? members : [];
  const byId = new Map();

  list.forEach((member) => {
    const src = member ?? {};
    const person = {
      id: src?.id ?? null,
      name: src?.name ?? "",
      email: src?.email ?? "",
      avatar: src?.avatar ?? null,
    };

    const key = getUserKey(person);
    if (!key || byId.has(key)) return;

    byId.set(key, person);
  });

  return Array.from(byId.values());
};

export default function TaskVisibleForDropdown({
                                                 projectId,
                                                 columnId = null,
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
  const projectMembersState = useSelector((s) => s.projectMembers);
  const visibleForState = useSelector((s) => s.taskVisibleFor);

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
    [projectMembersMatch, projectMembersState?.items]
  );

  const people = taskPeople.length ? taskPeople : projectMemberPeople;


  const visibleForIdsRaw =
    visibleForState?.byTaskId?.[taskId]?.visibleForUserIds;

  const visibleForIds = Array.isArray(visibleForIdsRaw)
    ? visibleForIdsRaw
    : [];


  const loading = visibleForState?.loading;

  const visibleForSet = useMemo(
    () => new Set((visibleForIds || []).map(String)),
    [visibleForIds]
  );

  /* load people */
  useEffect(() => {
    if (!open) return;
    if (!projectId || !taskId) return;

    dispatch(getTaskPeopleThunk({ projectId, taskId, columnId }));
  }, [open, dispatch, projectId, taskId, columnId]);

  /* load project members fallback */
  useEffect(() => {
    if (!open) return;
    if (!projectId) return;

    const needsProjectMembers =
      !projectMembersMatch || projectMembersState?.status === "idle";

    if (!needsProjectMembers) return;

    dispatch(getProjectMembersThunk(projectId));
  }, [open, dispatch, projectId, projectMembersMatch, projectMembersState?.status]);

  /* ✅ toggle visible-for */
  const toggleVisibleFor = async (user) => {
    if (!projectId || !taskId) return;

    const userId = user?.id;
    if (!userId) return;

    try {
      await dispatch(
        toggleTaskVisibleForUserThunk({
          projectId,
          taskId,
          userId,
        })
      ).unwrap();
    } catch (err) {
      toastError(err || "Update visible-for failed");
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
          Visible For
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
            const selected = visibleForSet.has(String(key));
            const avatar = getUserAvatar(u);

            return (
              <DropdownItem
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleVisibleFor(u);
                }}
                className={selected ? "bg-light" : ""}
              >
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="d-flex align-items-center gap-2 text-truncate">
                    <span className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-primary">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={getUserLabel(u)}
                          className="img-fluid"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_WATCHER_AVATAR;
                          }}
                        />
                      ) : (
                        <span className="small fw-semibold">
                          {getUserInitials(u)}
                        </span>
                      )}
                    </span>

                    <span className="text-truncate">
                      {getUserLabel(u)}
                    </span>
                  </span>

                  {selected ? (
                    <i className="ti ti-check text-success fs-5"></i>
                  ) : (
                    <span className="text-muted small">Add</span>
                  )}
                </div>
              </DropdownItem>
            );
          })
        ) : (
          <div className="px-2 py-2 text-muted small">
            No people.
          </div>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
