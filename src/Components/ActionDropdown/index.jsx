import React from "react";

const ActionDropdown = ({
  open,
  onToggle,
  actions = [],
  rootRef,
  align = "end",
  children,
}) => {
  React.useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e) => {
      if (rootRef?.current && rootRef.current.contains(e.target)) return;
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

  return (
    <div
      className={`dropdown-menu position-absolute ${open ? "show" : ""} p-1`}
      style={{
        top: "calc(100% + 2px)",
        ...placementStyle,
        margin: 0,
        zIndex: 1060,
        minWidth: 240,
      }}
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
};

export default ActionDropdown;
