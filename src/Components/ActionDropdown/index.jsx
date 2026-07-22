import React from "react";
import { createPortal } from "react-dom";

const MOBILE_HEADER_QUERY = "(max-width: 600px)";
const VIEWPORT_GAP = 8;
const DROPDOWN_WIDTH = 240;

const ActionDropdown = ({
  open,
  onToggle,
  actions = [],
  rootRef,
  align = "end",
  children,
}) => {
  const menuRef = React.useRef(null);
  const [isMobileHeader, setIsMobileHeader] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_HEADER_QUERY).matches;
  });
  const [portalStyle, setPortalStyle] = React.useState(null);

  const isCompanyHeaderDropdown = Boolean(
    rootRef?.current?.closest?.(".header-company"),
  );
  const shouldUsePortal = isMobileHeader && isCompanyHeaderDropdown;

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
      const width = Math.min(
        DROPDOWN_WIDTH,
        Math.max(0, window.innerWidth - VIEWPORT_GAP * 2),
      );
      const preferredLeft =
        align === "start" ? rect.left : rect.right - width;
      const left = Math.min(
        Math.max(VIEWPORT_GAP, preferredLeft),
        Math.max(VIEWPORT_GAP, window.innerWidth - width - VIEWPORT_GAP),
      );
      const top = rect.bottom + 2;

      setPortalStyle({
        position: "fixed",
        top,
        left,
        right: "auto",
        margin: 0,
        zIndex: 1100,
        width,
        minWidth: width,
        maxWidth: width,
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
  }, [align, open, rootRef, shouldUsePortal]);

  React.useEffect(() => {
    if (!open) return undefined;

    const onDocMouseDown = (e) => {
      if (rootRef?.current && rootRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      onToggle(false);
    };

    const onEsc = (e) => {
      if (e.key === "Escape") onToggle(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onToggle, rootRef]);

  if (!open) return null;

  const placementStyle =
    align === "start" ? { left: 0, right: "auto" } : { right: 0, left: "auto" };

  const dropdown = (
    <div
      ref={menuRef}
      className={`dropdown-menu position-absolute ${open ? "show" : ""} p-1`}
      style={
        shouldUsePortal
          ? portalStyle || { visibility: "hidden" }
          : {
              top: "calc(100% + 2px)",
              ...placementStyle,
              margin: 0,
              zIndex: 1060,
              minWidth: DROPDOWN_WIDTH,
            }
      }
    >
      {actions.length !== 0
        ? actions.map((a, index) => {
            if (a.type === "divider") {
              return (
                <hr key={`div-${index}`} className="dropdown-divider my-1" />
              );
            }

            return (
              <button
                key={a.key ?? index}
                type="button"
                className={`dropdown-item d-flex align-items-center py-1 px-2 text-start ${
                  a.destructive ? "text-danger text-center border-t" : ""
                }`}
                disabled={!!a.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  if (a.disabled) return;
                  a.onClick?.();
                  onToggle(false);
                }}
              >
                <span className="text-truncate flex-grow-1 pe-2">{a.label}</span>
                {a.icon ? <i className={`ti ${a.icon} fs-5 ms-auto`}></i> : null}
              </button>
            );
          })
        : null}
      {children}
    </div>
  );

  if (shouldUsePortal && typeof document !== "undefined") {
    return createPortal(dropdown, document.body);
  }

  return dropdown;
};

export default ActionDropdown;
