import React from "react";

const BoardItem = ({
  taskTitle,
  taskBody,
  taskDate,
  taskFileAttachCount,
  taskTags,
  taskIcon,
  taskUserImg,
  isCompleted = false,
  innerRef,
  className = "",
  style,
  ...rest
}) => {
  const normalizeTags = (value) => {
    const v = value?.data ?? value ?? [];
    if (Array.isArray(v)) return v;
    if (typeof v === "string") {
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
    }
    return [];
  };

  const tags = normalizeTags(taskTags);
  const getTagName = (t) => t?.name ?? t?.title ?? t?.label ?? t?.text ?? String(t ?? "");

  return (
    <div
      ref={innerRef}
      className={`board-item ${className}`}
      style={style}
      {...rest}
    >
      <div className="board-item-content">
        <div className="gap-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold text-dark text-truncate board-item-title">
                {taskTitle}
              </div>
            </div>
            <div className="d-flex align-items-center gap-1">
              {isCompleted ? (
                <span
                  className="text-success"
                  title="Completed"
                  aria-label="Completed"
                >
                  <i className="ti ti-circle-check f-s-18" />
                </span>
              ) : null}
              <div className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-primary">
                {/* FIXME Task User img */}
                <img
                  src={taskUserImg || "/assets/images/avtar/3.png"}
                  alt=""
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
          <div>
            <div
              className="text-muted small board-item-desc"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              title={taskBody || ""}
            >
              {taskBody || ""}
            </div>
          </div>

          <div className="d-flex flex-wrap gap-1">
            {tags.length ? (
              tags.map((t, idx) => (
                <span
                  key={t?.id ?? `${getTagName(t)}-${idx}`}
                  className="badge bg-light-primary text-primary"
                  style={{ maxWidth: 110 }}
                  title={getTagName(t)}
                >
                  <span className="text-truncate d-inline-block" style={{ maxWidth: 110 }}>
                    {getTagName(t)}
                  </span>
                </span>
              ))
            ) : null}
          </div>

          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className=" text-secondary me-2">
                <i className="ti ti-calendar "></i>{" "}
                <span className="f-s-14">{taskDate}</span>
              </span>
              <span className=" text-secondary">
                <i className="ti ti-unlink "></i>{" "}
                <span className="f-s-14">{taskFileAttachCount}</span>
              </span>
            </div>
            <div className="kanban-icon">
              <span className="text-light-success h-35 w-35 d-flex-center b-r-50">
                <i className={`ti ${taskIcon} f-s-18`}></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardItem;
