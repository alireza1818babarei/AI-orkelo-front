import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../../utils/tokenStorage";

export default function RequireGuest() {
  const token = getToken();
  const location = useLocation();

  if (token) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace/>
  }
  return <Outlet/>;
}
