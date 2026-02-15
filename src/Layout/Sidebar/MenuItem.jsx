import { Fragment, useMemo } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const getInitials = (name) => {
  const raw = String(name || "").trim();
  if (!raw) return "?";
  const parts = raw.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  const out = `${first}${last}`.toUpperCase();
  return out || raw.slice(0, 2).toUpperCase();
};

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
                    <NavLink to={link.path}>
                      {link.avatarSrc ? (
                        <span className="sidebar-project-avatar" aria-hidden="true">
                          <img src={link.avatarSrc} alt="" />
                        </span>
                      ) : link.className?.includes("project-submenu-item") ? (
                        <span className="sidebar-project-avatar sidebar-project-avatar--fallback" aria-hidden="true">
                          {getInitials(link.name)}
                        </span>
                      ) : null}
                      <span className="sidebar-project-name">{link.name}</span>
                    </NavLink>
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
