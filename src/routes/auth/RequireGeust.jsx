import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../../Components/Loader";
import { meThunk } from "../../store/auth/authSlice";

const restoreGuestPageScroll = () => {
  if (typeof document === "undefined") return;

  document
    .querySelectorAll(".offcanvas-backdrop, .modal-backdrop")
    .forEach((backdrop) => backdrop.remove());

  const { body, documentElement } = document;

  body.classList.remove("modal-open");
  body.style.removeProperty("overflow");
  body.style.removeProperty("padding-right");
  documentElement.style.removeProperty("overflow");
  documentElement.style.removeProperty("padding-right");
};

export default function RequireGuest() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { accessToken, user, meStatus } = useSelector((s) => s.auth);

  useEffect(() => {
    restoreGuestPageScroll();

    const animationFrame = window.requestAnimationFrame(restoreGuestPageScroll);
    const cleanupTimer = window.setTimeout(restoreGuestPageScroll, 400);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(cleanupTimer);
    };
  }, []);

  useEffect(() => {
    if (accessToken && !user && meStatus === "idle") {
      dispatch(meThunk());
    }
  }, [accessToken, user, meStatus, dispatch]);

  if (user && accessToken) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  if (accessToken && (meStatus === "idle" || meStatus === "loading")) {
    return <Loader />;
  }

  return <Outlet />;
}
