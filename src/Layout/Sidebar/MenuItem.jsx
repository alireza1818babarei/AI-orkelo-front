import { Fragment, useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function MenuItem(props) {
  const { iconClass, type, path, badgeCount, children: links, name, collapseId, title } = props;

  const { pathname } = useLocation();

  const isActive = useMemo(() => {
    return (linkPath) => linkPath === pathname;
  }, [pathname]);

  const hasActiveInTree = useMemo(() => {
    const walk = (arr = []) =>
      arr.some((item) => {
        if (item?.path && item.path !== "#" && isActive(item.path)) return true;
        if (item?.children?.length) return walk(item.children);
        return false;
      });

    return walk(links || []);
  }, [links, isActive]);

  const dropdownOpen = type === "dropdown" && hasActiveInTree;

  if (type !== "dropdown") {
    return (
      <li className={`no-sub ${isActive(path) ? "active" : ""}`}>
        <NavLink to={path}>
          {iconClass && <i className={iconClass}></i>}
          {name}
        </NavLink>
      </li>
    );
  }

  return (
    <Fragment>
      {title && (
        <li className="menu-title">
          <span>{title}</span>
        </li>
      )}

      <li className={`${dropdownOpen ? "active" : ""}`}>
        <Link
          to={collapseId ? `#${collapseId}` : "#"}
          data-bs-toggle="collapse"
          aria-expanded={dropdownOpen}
          aria-controls={collapseId}
          className="d-flex align-items-center justify-content-between"
        >
          <span className="d-flex align-items-center gap-2">
            {iconClass && <i className={iconClass}></i>}
            <span>{name}</span>

            {badgeCount && (
              <span className="badge text-bg-success badge-notification ms-2">
                {badgeCount}
              </span>
            )}
          </span>
        </Link>

        {links && (
          <ul className={`collapse ${dropdownOpen ? "show" : ""}`} id={collapseId}>
            {(links || []).map((link, index) => {
              const active = link.path && link.path !== "#" && isActive(link.path);
              const itemClass = [active ? "active" : "", link.className]
                .filter(Boolean)
                .join(" ");

              return (
                <li key={`${collapseId}-${index}`} className={itemClass}>
                  {link.onClick ? (
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        link.onClick?.();
                      }}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <NavLink to={link.path}>{link.name}</NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </li>
    </Fragment>
  );
}
export default MenuItem;
