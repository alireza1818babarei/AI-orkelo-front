import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getCompanyContextThunk,
  setActiveCompanyThunk,
} from "../../store/company/companyContextSlice";
import { clearCompanyMembersState } from "../../store/company/companyMembersSlice";
import { clearProjectColumns } from "../../store/projects/projectColumnsSlice";
import { clearProjectDetailsState } from "../../store/projects/projectDetailsSlice";
import { clearProjectMembersState } from "../../store/projects/projectMembersSlice";
import { clearProjectState } from "../../store/projects/projectsSlice";
import { clearTagsState } from "../../store/tags/tagsSlice";
import { clearComments } from "../../store/tasks/commentSlice";
import { clearTaskDetail } from "../../store/tasks/taskDetailSlice";
import { clearTaskPeople } from "../../store/tasks/taskPeopleSlice";
import { clearInitialState } from "../../store/tasks/trackingTasksSlice";
import { toastError } from "../../utils/sweetAlert";
import { resolveUserAvatarUrl } from "../../utils/mediaUrl";

const getCompanyInitial = (name) => {
  const raw = String(name ?? "").trim();
  return raw ? raw.charAt(0).toUpperCase() : "?";
};

const getCompanyLabel = (company, index) => {
  if (!company) return "Company";
  const name = String(company?.name ?? "").trim();
  if (name) return name;
  const id = company?.id ?? index + 1;
  return `Company ${id}`;
};

export default function CompanySwitcher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const userId = useSelector((s) => s.auth?.user?.id ?? null);
  const {
    items: companies = [],
    activeCompany,
    activeCompanyId,
    status,
    switchingCompanyId,
  } = useSelector((s) => s.companyContext || {});

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event) => {
      if (rootRef.current && rootRef.current.contains(event.target)) return;
      setOpen(false);
    };

    const onEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const currentCompany = useMemo(() => {
    if (activeCompany?.id != null) return activeCompany;

    const activeId = activeCompanyId != null ? String(activeCompanyId) : "";

    if (!companies.length) return null;
    if (activeId) {
      const found = companies.find((company) => String(company?.id) === activeId);
      if (found) return found;
    }

    return companies.find((company) => company?.is_active) ?? companies[0] ?? null;
  }, [activeCompany, activeCompanyId, companies]);

  const currentCompanyName = getCompanyLabel(currentCompany, 0);
  const currentCompanyImage = resolveUserAvatarUrl(currentCompany?.image);
  const currentCompanyInitial = getCompanyInitial(currentCompanyName);

  const clearCompanyScopedState = () => {
    dispatch(clearProjectState());
    dispatch(clearProjectDetailsState());
    dispatch(clearProjectColumns());
    dispatch(clearProjectMembersState());
    dispatch(clearCompanyMembersState());
    dispatch(clearTagsState());
    dispatch(clearComments());
    dispatch(clearTaskPeople());
    dispatch(clearTaskDetail());
    dispatch(clearInitialState());
  };

  const handleSwitchCompany = async (company) => {
    const nextCompanyId = company?.id;
    const selectedId = currentCompany?.id ?? activeCompanyId ?? null;

    if (nextCompanyId == null) return;
    if (selectedId != null && String(selectedId) === String(nextCompanyId)) {
      setOpen(false);
      return;
    }

    try {
      await dispatch(
        setActiveCompanyThunk({
          companyId: nextCompanyId,
        }),
      ).unwrap();

      clearCompanyScopedState();
      dispatch(getCompanyContextThunk({ userId }));
      setOpen(false);
      navigate("/");
    } catch (err) {
      toastError(err?.message || "Failed to switch company");
    }
  };

  return (
    <div className="sidebar-company-switcher" ref={rootRef}>
      <button
        type="button"
        className="sidebar-company-switcher__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Switch active company"
      >
        <span
          className={`sidebar-company-switcher__avatar ${
            currentCompanyImage
              ? ""
              : "sidebar-company-switcher__avatar--fallback"
          }`}
        >
          {currentCompanyImage ? (
            <img src={currentCompanyImage} alt={currentCompanyName} />
          ) : (
            <span>{currentCompanyInitial}</span>
          )}
        </span>

        <span
          className="sidebar-company-switcher__name text-truncate"
          title={currentCompanyName}
        >
          {currentCompanyName}
        </span>
        <span className="sidebar-company-switcher__hint">Switch Company</span>

        <i
          className={`ph ${
            open ? "ph-caret-up" : "ph-caret-down"
          } sidebar-company-switcher__caret`}
        />
      </button>

      {open ? (
        <div className="sidebar-company-switcher__menu app-scroll">
          {status === "loading" && companies.length === 0 ? (
            <div className="sidebar-company-switcher__state">
              <iconify-icon icon="line-md:loading-loop" />
            </div>
          ) : null}

          {status !== "loading" && companies.length === 0 ? (
            <div className="sidebar-company-switcher__state">
              No companies found
            </div>
          ) : null}

          {companies.map((company, index) => {
            const label = getCompanyLabel(company, index);
            const image = resolveUserAvatarUrl(company?.image);
            const initial = getCompanyInitial(label);
            const companyId = company?.id;
            const isActive =
              currentCompany?.id != null
                ? String(currentCompany.id) === String(companyId)
                : Boolean(company?.is_active);
            const isSwitching =
              switchingCompanyId != null &&
              String(switchingCompanyId) === String(companyId);

            return (
              <button
                key={companyId ?? `${label}-${index}`}
                type="button"
                className={`sidebar-company-switcher__item ${
                  isActive ? "is-active" : ""
                }`}
                onClick={() => handleSwitchCompany(company)}
                disabled={isActive || isSwitching}
              >
                <span
                  className={`sidebar-company-switcher__item-avatar ${
                    image ? "" : "sidebar-company-switcher__item-avatar--fallback"
                  }`}
                >
                  {image ? <img src={image} alt={label} /> : <span>{initial}</span>}
                </span>

                <span className="sidebar-company-switcher__item-name text-truncate">
                  {label}
                </span>

                {isSwitching ? (
                  <iconify-icon icon="line-md:loading-loop" />
                ) : isActive ? (
                  <i className="ph ph-check"></i>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
