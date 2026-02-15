import React, { useRef, useState } from "react";
import ActionDropdown from "../../../../Components/ActionDropdown";

const BoardColumn = ({
  columnTitle,
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
