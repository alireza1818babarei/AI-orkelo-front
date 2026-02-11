import { Suspense } from "react";
import "simplebar-react/dist/simplebar.min.css";
import "../public/assets/css/style.css";
import "./scss/style.scss";
import "./scss/responsive.scss";
import Loader from "./Components/Loader";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { routesConfig } from "./routes/routes.config";

function AppRoutes() {
  return useRoutes(routesConfig);
}

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <BrowserRouter basename="/">
        <AppRoutes />
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
