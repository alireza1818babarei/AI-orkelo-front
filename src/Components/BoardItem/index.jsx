import React from "react";

const BoardItem = ({
  taskTitle,
  taskBody,
  taskDate,
  taskFileAttachCount,
  taskIcon,
  taskUserImg,
  innerRef,
  className = "",
  style,
  ...rest
}) => {
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
              <span className="badge text-light-success f-s-13">
                {taskTitle}
              </span>
            </div>
            <div className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-primary">
              {/* FIXME Task User img */}
              <img
                src={taskUserImg || "/assets/images/avtar/3.png"}
                alt=""
                className="img-fluid"
              />
            </div>
          </div>
          <div>
            <p>{taskBody}</p>
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
