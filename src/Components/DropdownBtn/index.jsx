import React from "react";

const getBtnClass = (type, color) => {
  switch (type) {
    case "outlined":
      return `btn btn-outline-${color} dropdown-toggle`;

    case "default":
      return `btn btn-light-${color} dropdown-toggle`;

    case "filled":
    default:
      return `btn btn-${color} dropdown-toggle`;
  }
};

const DropdownButtonX = ({
  btnType = "filled",
  btnColor = "secondary",
  label,
  icon,
  items = [],
}) => {
  return (
    <div className="btn-group" role="group">
      <button
        type="button"
        className={`${getBtnClass(btnType, btnColor)} d-flex align-items-center`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {icon ? (
          <span className="fs-5">
            <i className={`ph-bold ${icon} me-1`}></i>
          </span>
        ) : null}
        {label}
      </button>

      <ul className="dropdown-menu ">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="dropdown-item"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DropdownButtonX;
