import React, {useEffect, useMemo, useState} from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Spinner,
} from "reactstrap";
import {useDispatch, useSelector} from "react-redux";
import {
  getTaskExcludePeopleThunk,
  toggleTaskExcludedUserThunk,
} from "../../store/tasks/taskExcludedPeopleSlice";
import {toastError} from "../../utils/sweetAlert";
import {resolveUserAvatarWithFallback} from "../../utils/mediaUrl";

/* ================= Utils ================= */

const DEFAULT_AVATAR = "/assets/images/avtar/3.png";

const getUserLabel = (u) => u?.name ?? u?.email ?? "Unknown user";

const getUserAvatar = (u) =>
  resolveUserAvatarWithFallback(
    u?.avatar ?? "",
    u?.id ?? u?.email ?? "user"
  );

const getUserInitials = (u) => {
  const name = String(u?.name ?? u?.email ?? "").trim();
  if (!name) return "NA";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
};

/* ================= Component ================= */

export default function TaskExcludedUsersDropdown({
                                                    projectId,
                                                    taskId,
                                                    disabled = false,
                                                  }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (!disabled) setOpen((v) => !v);
  };

  /* ===== Redux state ===== */

  const excludedState = useSelector((s) => s.taskExcludedPeople);

  const taskData = excludedState.byTaskId?.[taskId] ?? {};

  const excludedIds = Array.isArray(taskData.excludedUserIds)
    ? taskData.excludedUserIds
    : [];


  const people = Array.isArray(taskData.people) ? taskData.people : [];

  const excludedSet = useMemo(
    () => new Set(excludedIds.map(String)),
    [excludedIds]
  );

  const loading = open && excludedState.loading;

  /* ===== Effects ===== */

  useEffect(() => {
    if (open && projectId && taskId) {
      dispatch(getTaskExcludePeopleThunk({projectId, taskId}));
    }
  }, [open, projectId, taskId, dispatch]);

  /* ===== Handlers ===== */

  const toggleExcluded = async (user) => {
    if (!user?.id) return;

    try {
      await dispatch(
        toggleTaskExcludedUserThunk({
          projectId,
          taskId,
          userId: user.id,
        })
      ).unwrap();
    } catch (err) {
      toastError(
        err?.message ||
        err?.data?.message ||
        "Failed to update excluded user"
      );
    }
  };

  /* ===== Render ===== */

  return (
    <Dropdown isOpen={open} toggle={toggle}>
      <DropdownToggle
        tag="button"
        type="button"
        disabled={disabled}
        className="btn d-flex align-items-center justify-content-between px-0 w-100"
      >
        <span className="d-flex align-items-center gap-2">
          <i className="ti ti-eye-off fs-5"/>
          Excluded Users
        </span>

        <i className="ti ti-chevron-down"/>
      </DropdownToggle>


      <DropdownMenu end style={{minWidth: 260}} className="p-1">
        {loading ? (
          <div className="px-2 py-2 text-muted small d-flex align-items-center gap-2">
            <Spinner size="sm"/>
            Loading...
          </div>
        ) : people.length ? (
          people.map((user) => {
            const selected = excludedSet.has(String(user.id));
            const avatar = getUserAvatar(user);

            return (
              <DropdownItem
                key={user.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleExcluded(user);
                }}
                className={selected ? "bg-light" : ""}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    <span className="h-25 w-25 d-flex-center rounded-circle overflow-hidden text-bg-primary">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={getUserLabel(user)}
                          className="img-fluid"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                        />
                      ) : (
                        <span className="small fw-semibold">
                          {getUserInitials(user)}
                        </span>
                      )}
                    </span>

                    <span className="text-truncate">
                      {getUserLabel(user)}
                    </span>
                  </div>

                  {selected ? (
                    <i className="ti ti-check text-success fs-5"/>
                  ) : (
                    <span className="text-muted small">Add</span>
                  )}
                </div>
              </DropdownItem>
            );
          })
        ) : (
          <div className="px-2 py-2 text-muted small">
            No people found
          </div>
        )}
      </DropdownMenu>

    </Dropdown>
  );
}
