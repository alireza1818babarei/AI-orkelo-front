import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../../Components/Loader";
import { logoutThunk, meThunk } from "../../store/auth/authSlice";
import { getCompanyContextThunk } from "../../store/company/companyContextSlice";
import { getProjectsThunk } from "../../store/projects/projectsSlice";

export default function RequireAuth() {
  const location = useLocation();
  const dispatch = useDispatch();

  const toComparableId = (value) => String(value ?? "").trim();

  const { user, meStatus, accessToken } = useSelector((s) => s.auth);
  const {
    loading: projectsLoading,
    status: projectsStatus,
    ownerUserId: projectsOwnerUserId,
  } = useSelector((s) => s.projects);
  const { status: companyContextStatus, ownerUserId: companyContextUserId } =
    useSelector((s) => s.companyContext || {});

  const userId = user?.id ?? null;
  const projectsBelongToCurrentUser =
    userId != null &&
    projectsOwnerUserId != null &&
    toComparableId(projectsOwnerUserId) === toComparableId(userId);

  const shouldSyncProjects =
    !!accessToken &&
    userId != null &&
    (projectsStatus === "idle" || !projectsBelongToCurrentUser);

  useEffect(() => {
    if (accessToken && !user && meStatus === "idle") {
      dispatch(meThunk());
    }
  }, [accessToken, user, meStatus, dispatch]);

  useEffect(() => {
    if (shouldSyncProjects && !projectsLoading) {
      dispatch(getProjectsThunk({ userId }));
    }
  }, [dispatch, projectsLoading, shouldSyncProjects, userId]);

  useEffect(() => {
    if (!accessToken || !userId) return;

    const isForCurrentUser =
      companyContextUserId != null &&
      String(companyContextUserId) === String(userId);

    if (companyContextStatus === "idle" || !isForCurrentUser) {
      dispatch(getCompanyContextThunk({ userId }));
    }
  }, [
    accessToken,
    user?.id,
    companyContextStatus,
    companyContextUserId,
    dispatch,
  ]);

  useEffect(() => {
    if (!user && meStatus === "failed") {
      dispatch(logoutThunk());
    }
  }, [user, meStatus, dispatch]);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const meLoading = !user && (meStatus === "idle" || meStatus === "loading");

  if (meLoading || (user && (projectsLoading || shouldSyncProjects))) {
    return <Loader />;
  }

  if (!user && meStatus === "failed") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
