import { Fragment, useEffect, useMemo, useState } from "react";
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
  const {
    iconClass,
    type,
    path,
    badgeCount,
    children: links,
    name,
    collapseId,
    title,
    isSidebarCompact = false,
  } = props;

  const { pathname } = useLocation();

  const isActive = useMemo(() => {
    const normalizePath = (value = "") => {
      if (!value) return "/";
      const clean = String(value).split(/[?#]/)[0] || "/";
      if (clean === "/") return "/";
      return clean.endsWith("/") ? clean.slice(0, -1) : clean;
    };

    const currentPath = normalizePath(pathname);

    return (linkPath) => {
      if (!linkPath || linkPath === "#") return false;
      const targetPath = normalizePath(linkPath);

      if (targetPath === "/") return currentPath === "/";
      return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
    };
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

  const [dropdownOpen, setDropdownOpen] = useState(
    () => type === "dropdown" && hasActiveInTree,
  );

  const compactProjectList =
    isSidebarCompact && type === "dropdown" && collapseId === "projects-collapse";
  const effectiveDropdownOpen = dropdownOpen || compactProjectList;

  useEffect(() => {
    if (type === "dropdown" && hasActiveInTree) {
      setDropdownOpen(true);
    }
  }, [hasActiveInTree, type]);

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

  const toggleDropdown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDropdownOpen((current) => !current);
  };

  return (
    <Fragment>
      {title && (
        <li className="menu-title">
          <span>{title}</span>
        </li>
      )}

      <li
        className={`${effectiveDropdownOpen ? "active" : ""} ${
          compactProjectList ? "sidebar-dropdown--compact-projects" : ""
        }`}
      >
        <Link
          to="#"
          onClick={toggleDropdown}
          aria-expanded={effectiveDropdownOpen}
          aria-controls={collapseId}
          className="d-flex align-items-center justify-content-between"
        >
          <span className="d-flex align-items-center">
            {iconClass && <i className={iconClass}></i>}
            <span>{name}</span>

            {badgeCount && (
              <span className="badge text-bg-primary badge-notification ms-2">
                {badgeCount}
              </span>
            )}
          </span>
        </Link>

        {links && (
          <ul
            className={`collapse ${effectiveDropdownOpen ? "show" : ""} ${
              compactProjectList ? "sidebar-submenu--compact-projects" : ""
            }`}
            id={collapseId}
          >
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
                      {link.iconClass ? (
                        <span className="sidebar-submenu-icon" aria-hidden="true">
                          <i className={link.iconClass}></i>
                        </span>
                      ) : null}
                      <span className="sidebar-project-name">{link.name}</span>
                    </Link>
                  ) : (
                    <NavLink to={link.path} title={link.name}>
                      {link.iconClass ? (
                        <span className="sidebar-submenu-icon" aria-hidden="true">
                          <i className={link.iconClass}></i>
                        </span>
                      ) : link.avatarSrc ? (
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
