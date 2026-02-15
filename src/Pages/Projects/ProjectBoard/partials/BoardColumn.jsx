import React, { useRef, useState } from "react";
import ActionDropdown from "../../../../Components/ActionDropdown";

const BoardColumn = ({
  columnTitle,
  columnIcon,
  innerRef,
  headerRef,
  dragHandleProps,
  color,
  className = "",
  style,
  children,
  actions = [],
  contentRef,
  contentClassName = "",
  contentProps,
  footer,
  ...rest
}) => {
  const [columnAction, setColumnAction] = useState(false);
  const rootRef = useRef();
  const hasActions = actions.length > 0;

  const normalizeIconClass = (raw) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (s.includes("ph-") || s.includes("fa-") || s.includes("ti ")) return s;
    if (s.startsWith("ti-")) return `ti ${s}`;
    if (/^[a-z0-9-]+$/i.test(s)) return `ti ti-${s}`;
    return s;
  };

  const iconClass = normalizeIconClass(columnIcon);

  return (
    <div
      ref={innerRef}
      className={`board-column app-scroll  box-shadow-4 ${className}`}
      style={style}
      {...rest}
    >
      <div
        ref={headerRef}
        className="board-column-header f-w-600 text-white d-flex justify-content-between align-items-center border-t-0"
        style={{
          backgroundColor: `${color}`
        }}
      >
        {iconClass ? (
          <span className="board-column-header-icon" aria-hidden="true">
            <i className={iconClass} />
          </span>
        ) : null}
        <div className="board-column-drag-handle" {...(dragHandleProps || {})} />
        <span>{columnTitle}</span>
        {hasActions ? (
          <div ref={rootRef} className="position-relative">
            <button
              type="button"
              className="text-light btn icon-btn fs-4"
              onClick={(e) => {
                e.stopPropagation();
                setColumnAction((v) => !v);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Column actions"
            >
              <i className="ph-light ph-gear"></i>
            </button>
            <ActionDropdown
              onToggle={setColumnAction}
              open={columnAction}
              rootRef={rootRef}
              actions={actions}
            />
          </div>
        ) : null}
      </div>
      <div className="board-column-content-wrapper">
        <div
          ref={contentRef}
          className={`board-column-content ${contentClassName}`}
          {...(contentProps || {})}
        >
          {children}
        </div>
        {footer ? <div className="board-column-footer">{footer}</div> : null}
      </div>
    </div>
  );
};

export default BoardColumn;
