import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { logoutThunk, meThunk } from "../../store/auth/authSlice";
import { getProjectsThunk } from "../../store/projects/projectsSlice";

export default function RequireAuth() {
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, meStatus, accessToken } = useSelector((s) => s.auth);
  const { items, loading: projectsLoading } = useSelector((s) => s.projects);

  useEffect(() => {
    if (accessToken && !user && meStatus === "idle") {
      dispatch(meThunk());
    }
  }, [accessToken, user, meStatus, dispatch]);

  useEffect(() => {
    if (accessToken && user && items.length === 0) {
      dispatch(getProjectsThunk());
    }
  }, [accessToken, user, items.length, dispatch]);

  useEffect(() => {
    if (!user && meStatus === "failed") {
      dispatch(logoutThunk());
    }
  }, [user, meStatus, dispatch]);

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const meLoading = !user && (meStatus === "idle" || meStatus === "loading");

  if (meLoading || (user && projectsLoading)) {
    return (
      <div className="loader_box">
        <div className="loader_32"></div>
      </div>
    );
  }

  if (!user && meStatus === "failed") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
