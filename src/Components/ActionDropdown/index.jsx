import React from "react";
import { createPortal } from "react-dom";
import TaskMoveModal from "./TaskMoveModal";

const MOBILE_HEADER_QUERY = "(max-width: 600px)";
const VIEWPORT_GAP = 8;
const DROPDOWN_WIDTH = 240;

const ActionDropdown = ({
  open,
  onToggle,
  actions = [],
  rootRef,
  align = "end",
  portal = false,
  width = DROPDOWN_WIDTH,
  children,
}) => {
  const menuRef = React.useRef(null);
  const [taskMoveOpen, setTaskMoveOpen] = React.useState(false);
  const [isMobileHeader, setIsMobileHeader] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_HEADER_QUERY).matches;
  });
  const [portalStyle, setPortalStyle] = React.useState(null);

  const isCompanyHeaderDropdown = Boolean(
    rootRef?.current?.closest?.(".header-company"),
  );
  const shouldUsePortal = portal || (isMobileHeader && isCompanyHeaderDropdown);

  const isTaskDetailActionMenu = React.useMemo(() => {
    const actionKeys = new Set(
      (Array.isArray(actions) ? actions : []).map((action) => action?.key),
    );

    return (
      actionKeys.has("copyLink") &&
      actionKeys.has("archive") &&
      actionKeys.has("delete")
    );
  }, [actions]);

  const displayedActions = React.useMemo(() => {
    if (!isTaskDetailActionMenu) return actions;
    if (actions.some((action) => action?.key === "moveBetweenProjects")) {
      return actions;
    }

    const moveAction = {
      key: "moveBetweenProjects",
      label: "Move to another project",
      icon: "ti-arrow-right",
      destructive: false,
      onClick: () => setTaskMoveOpen(true),
    };

    const archiveIndex = actions.findIndex((action) => action?.key === "archive");
    if (archiveIndex < 0) return [...actions, moveAction];

    return [
      ...actions.slice(0, archiveIndex),
      moveAction,
      ...actions.slice(archiveIndex),
    ];
  }, [actions, isTaskDetailActionMenu]);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(MOBILE_HEADER_QUERY);
    const handleChange = (event) => setIsMobileHeader(event.matches);

    setIsMobileHeader(mediaQuery.matches);
    mediaQuery.addEventListener?.("change", handleChange);

    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  React.useLayoutEffect(() => {
    if (!open || !shouldUsePortal || typeof window === "undefined") {
      setPortalStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      const root = rootRef?.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const menuWidth = Math.min(
        width,
        Math.max(0, window.innerWidth - VIEWPORT_GAP * 2),
      );
      const preferredLeft =
        align === "start" ? rect.left : rect.right - menuWidth;
      const left = Math.min(
        Math.max(VIEWPORT_GAP, preferredLeft),
        Math.max(VIEWPORT_GAP, window.innerWidth - menuWidth - VIEWPORT_GAP),
      );
      const top = rect.bottom + 2;

      setPortalStyle({
        position: "fixed",
        top,
        left,
        right: "auto",
        margin: 0,
        zIndex: 1100,
        width: menuWidth,
        minWidth: menuWidth,
        maxWidth: menuWidth,
        maxHeight: `calc(100vh - ${top + VIEWPORT_GAP}px)`,
        overflowY: "auto",
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, open, rootRef, shouldUsePortal, width]);

  React.useEffect(() => {
    if (!open) return undefined;

    const onDocMouseDown = (event) => {
      if (rootRef?.current && rootRef.current.contains(event.target)) return;
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      onToggle(false);
    };

    const onEsc = (event) => {
      if (event.key === "Escape") onToggle(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onToggle, rootRef]);

  const placementStyle =
    align === "start" ? { left: 0, right: "auto" } : { right: 0, left: "auto" };

  const dropdown = open ? (
    <div
      ref={menuRef}
      className={`dropdown-menu show p-1 ${
        shouldUsePortal ? "" : "position-absolute"
      }`}
      style={
        shouldUsePortal
          ? portalStyle || { visibility: "hidden" }
          : {
              top: "calc(100% + 2px)",
              ...placementStyle,
              margin: 0,
              zIndex: 1060,
              minWidth: width,
            }
      }
    >
      {displayedActions.length !== 0
        ? displayedActions.map((action, index) => {
            if (action.type === "divider") {
              return (
                <hr key={`div-${index}`} className="dropdown-divider my-1" />
              );
            }

            return (
              <button
                key={action.key ?? index}
                type="button"
                className={`dropdown-item d-flex align-items-center py-1 px-2 text-start ${
                  action.destructive ? "text-danger text-center border-t" : ""
                }`}
                disabled={!!action.disabled}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (action.disabled) return;

                  onToggle(false);
                  action.onClick?.(event);
                }}
              >
                <span className="text-truncate flex-grow-1 pe-2">
                  {action.label}
                </span>
                {action.icon ? (
                  <i className={`ti ${action.icon} fs-5 ms-auto`}></i>
                ) : null}
              </button>
            );
          })
        : null}
      {children}
    </div>
  ) : null;

  const renderedDropdown =
    dropdown && shouldUsePortal && typeof document !== "undefined"
      ? createPortal(dropdown, document.body)
      : dropdown;

  return (
    <>
      {renderedDropdown}
      {isTaskDetailActionMenu ? (
        <TaskMoveModal
          isOpen={taskMoveOpen}
          onClose={() => setTaskMoveOpen(false)}
        />
      ) : null}
    </>
  );
};

export default ActionDropdown;
