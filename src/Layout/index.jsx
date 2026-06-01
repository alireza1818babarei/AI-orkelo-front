import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import ScrollArrow from "./Footer/ScrollArrow";
import { useEffect, useState } from "react";
import Customizer from "./Customizer";
import AppUpdateModal from "../Components/AppUpdateModal";
import WarningAcknowledgeModal from "../Components/Warnings/WarningAcknowledgeModal";

const SIDEBAR_COMPACT_QUERY = "(max-width: 1199px)";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(SIDEBAR_COMPACT_QUERY);
    const syncSidebarMode = (event) => {
      const matches = Boolean(event?.matches ?? mediaQuery.matches);
      if (matches) {
        setIsSidebarOpen(true);
      }
    };

    syncSidebarMode(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncSidebarMode);
      return () => {
        mediaQuery.removeEventListener("change", syncSidebarMode);
      };
    }

    mediaQuery.addListener(syncSidebarMode);
    return () => {
      mediaQuery.removeListener(syncSidebarMode);
    };
  }, []);

  return (
    <div className="app-wrapper default">
      <div
        className="modal"
        tabIndex="-1"
        id="welcomeCard"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content welcome-card">
            <div className="modal-body p-0">
              <div className="text-center position-relative welcome-card-content z-1 p-3">
                <div className="text-end">
                  <i
                    className="ti ti-x fs-5 text-dark f-w-600"
                    data-bs-dismiss="modal"
                  />
                </div>
                <h2 className="f-w-600">
                  <span>Welcome !</span>
                </h2>
                <h6 className="f-s-15 text-dark f-w-500 mx-5">
                  {" "}
                  Start Multipurpose, clean modern responsive bootstrap 5 admin
                  template{" "}
                </h6>

                <div>
                  <img
                    src="/assets/images/modals/welcome-1.png"
                    alt="img"
                    className=" img-fluid"
                  />
                </div>
                <div className="mt-3 mb-4">
                  <button
                    type="button"
                    className="btn btn-primary text-white btn-lg"
                    data-bs-dismiss="modal"
                  >
                    Let's Started <i className="ti ti-chevrons-right"></i>{" "}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*-- Menu Navigation starts --*/}
      <Sidebar
        sidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {/*-- Menu Navigation ends --*/}

      <div className="app-content">
        {/*-- Header Section starts --*/}
        <Header
          sidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        {/*-- Header Section ends --*/}

        {/*-- Body main section starts --*/}
        <main>
          <Outlet />
        </main>
        {/*-- Body main section ends --*/}
      </div>

      <AppUpdateModal />
      <WarningAcknowledgeModal />

      {/*-- tap on top --*/}
      <ScrollArrow />

      <Customizer showLauncher={false} />
    </div>
  );
};

export default Layout;
