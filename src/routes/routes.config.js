import Layout from "../Layout";
import Login from "../Pages/AuthPages/Login";
import NotFound from "../Pages/AuthPages/NotFound";
import SignUp from "../Pages/AuthPages/SignUp";
import Home from "../Pages/Home";
import Profile from "../Pages/Profile";
import ProjectBoard from "../Pages/Projects/ProjectBoard";
import RequireAuth from "./auth/RequireAuth";
import RequireGuest from "./auth/RequireGeust";

export const routesConfig = [
  {
    element: <RequireGuest />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignUp /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/projects/:id", element: <ProjectBoard/> },
          { path: "/profile", element: <Profile/> }
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];
