import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  weatherData,
  initialCartItems,
  initialnotifications,
  searchData,
} from "../../Data/HeaderMenuData.js";
import { Link } from "react-router-dom";
import { Button, Card, CardBody } from "reactstrap";
import HeaderMode from "../../Layout/Header/HeaderMode.jsx";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/auth/authSlice.js";
import {
  addCompanyMemberThunk,
  deleteCompanyMemberThunk,
  getCompanyMembersThunk,
} from "../../store/company/companyMembersSlice.js";
import ActionDropdown from "../../Components/ActionDropdown/index.jsx";
import CompanyMembersModal from "./CompanyMembersModal.jsx";
import AddCompanyMemberModal from "./AddCompanyMemberModal.jsx";
import { alertConfirm, toastError, toastSuccess } from "../../utils/sweetAlert.js";
import { resolveUserAvatarWithFallback } from "../../utils/mediaUrl.js";

const HeaderMenu = () => {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const user = useSelector(s=> s.auth.user);
  const activeCompanyIdFromContext = useSelector(
    (s) => s.companyContext?.activeCompanyId ?? null,
  );
  const userAvatar = useMemo(() => {
    const raw = user?.avatar ?? "";
    const seed = user?.id ?? user?.email ?? user?.name ?? "header-user";
    return resolveUserAvatarWithFallback(raw, seed);
  }, [user]);
  const {
    items: companyMembers,
    status: companyMembersStatus,
    error: companyMembersError,
    addLoading: companyMemberAddLoading,
    removingByUserId: companyMembersRemovingByUserId,
  } = useSelector((s) => s.companyMembers || {});

  const companyMenuRef = useRef(null);
  const [companyActionOpen, setCompanyActionOpen] = useState(false);
  const [companyMembersModalOpen, setCompanyMembersModalOpen] = useState(false);
  const [companyAddMemberModalOpen, setCompanyAddMemberModalOpen] =
    useState(false);

  const userCompanyId = user?.company_id ?? null;
  const activeCompanyId = activeCompanyIdFromContext ?? user?.active_company_id ?? null;
  const canManageCurrentCompany =
    userCompanyId != null &&
    activeCompanyId != null &&
    String(userCompanyId) === String(activeCompanyId);

  useEffect(() => {
    if (canManageCurrentCompany) return;
    setCompanyActionOpen(false);
    setCompanyMembersModalOpen(false);
    setCompanyAddMemberModalOpen(false);
  }, [canManageCurrentCompany]);


  const handleRemoveItem = (id) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCartItems);
  };

  const [notificationsItems, setNotificationsItems] =
    useState(initialnotifications);

  const handleRemoveItem1 = (id) => {
    const updatedNotificationsItems = notificationsItems.filter(
      (item) => item.id !== id,
    );
    setNotificationsItems(updatedNotificationsItems);
  };

  const [currentIcon1, setCurrentIcon1] = useState("usa");
  const [selectedLang, setSelectedLang] = useState("lang-en");

  const handleLangChange = (lang, icon) => {
    setSelectedLang(lang);
    setCurrentIcon1(icon);
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filterItems = searchData.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    return text.replace(regex, `<span class="highlight-searchtext">$1</span>`);
  };

  const openCompanyMembersModal = () => {
    setCompanyMembersModalOpen(true);
    dispatch(getCompanyMembersThunk());
  };

  const handleReloadCompanyMembers = () => {
    dispatch(getCompanyMembersThunk());
  };

  const openCompanyAddMemberModal = () => {
    setCompanyAddMemberModalOpen(true);
  };

  const handleSubmitAddCompanyMember = async (email) => {
    try {
      await dispatch(addCompanyMemberThunk({ email })).unwrap();
      toastSuccess("Member added");
      setCompanyAddMemberModalOpen(false);
      dispatch(getCompanyMembersThunk());
    } catch (err) {
      toastError(err?.message || "Failed to add member");
    }
  };

  const handleDeleteCompanyMember = async (member) => {
    const userId = String(member?.userId ?? "");
    if (!userId) {
      toastError("User id not found");
      return;
    }

    const { isConfirmed } = await alertConfirm({
      title: "Are you sure?",
      text: "Member will be removed from company.",
      confirmText: "Remove",
      cancelText: "Cancel",
    });
    if (!isConfirmed) return;

    try {
      await dispatch(deleteCompanyMemberThunk({ userId })).unwrap();
      toastSuccess("Member removed");
    } catch (err) {
      toastError(err?.message || "Failed to remove member");
    }
  };

  const companyMenuActions = [
    {
      key: "company-members",
      label: "Company Members",
      icon: "ti-users",
      onClick: openCompanyMembersModal,
    },
    {
      key: "add-member",
      label: "Add Member",
      icon: "ti-user-plus",
      onClick: openCompanyAddMemberModal,
    },
  ];

  return (
    <>
      <ul className="d-flex align-items-center">
        <li className="header-dark">
          <HeaderMode />
        </li>

        <li className="header-notification">
          <a
            href="#"
            className="d-block head-icon position-relative"
            role="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#notificationcanvasRight"
            aria-controls="notificationcanvasRight"
          >
            <i className="ph ph-bell"></i>
            <span className="position-absolute translate-middle p-1 bg-success border border-light rounded-circle animate__animated animate__fadeIn animate__infinite animate__slower"></span>
          </a>
          <div
            className="offcanvas offcanvas-end header-notification-canvas"
            tabIndex="-1"
            id="notificationcanvasRight"
            aria-labelledby="notificationcanvasRightLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="notificationcanvasRightLabel">
                Notification
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body app-scroll p-0">
              <div className="head-container">
                {notificationsItems.length > 0 ? (
                  notificationsItems.map((notification) => (
                    <div
                      key={notification.id}
                      className="notification-message head-box"
                    >
                      <div className="message-images">
                        <span className="bg-secondary h-35 w-35 d-flex-center b-r-10 position-relative">
                          <img
                            src={notification.imageSrc}
                            alt={notification.title}
                            className="img-fluid b-r-10"
                          />
                          <span className="position-absolute bottom-30 end-0 p-1 bg-secondary border border-light rounded-circle notification-avtar"></span>
                        </span>
                      </div>
                      <div className="message-content-box flex-grow-1 ps-2">
                        <Link
                          href="/apps/email-page/read-email"
                          className="f-s-15 text-secondary mb-0"
                        >
                          <span className="f-w-500 text-secondary">
                            {notification.title}
                          </span>
                          {notification.message}
                        </Link>
                        <span className="badge text-light-secondary mt-2">
                          {notification.date}
                        </span>
                      </div>
                      <div className="align-self-start text-end">
                        <i
                          className="ph ph-trash f-s-18 text-danger close-btn"
                          onClick={() => handleRemoveItem1(notification.id)}
                        ></i>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="hidden-massage py-4 px-3">
                    <img
                      src="/assets/images/icons/bell.png"
                      className="w-50 h-50 mb-3 mt-2"
                      alt="No notifications"
                    />
                    <div>
                      <h6 className="mb-0">Notification Not Found</h6>
                      <p className="text-secondary">
                        When you have any notifications added here, they will
                        appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </li>

        <li className="header-theme-settings">
          <button
            type="button"
            className="btn icon-btn b-r-100 p-0 border-0  d-flex align-items-center head-icon"
            data-bs-toggle="offcanvas"
            data-bs-target="#customizerOptions"
            aria-controls="customizerOptions"
            aria-label="Theme settings"
          >
            <i className="ti ti-settings-2"></i>
          </button>
        </li>

        {canManageCurrentCompany ? (
          <li className="header-company">
            <div ref={companyMenuRef} className="position-relative">
              <button
                type="button"
                className="btn company-menu-trigger"
                onClick={() => setCompanyActionOpen((v) => !v)}
                aria-label="Company actions"
              >
                <i className="ph ph-buildings"></i>
                <span className="company-menu-trigger__text">Company</span>
                <i
                  className={`ph ${
                    companyActionOpen ? "ph-caret-up" : "ph-caret-down"
                  } company-menu-trigger__caret`}
                ></i>
              </button>

              <ActionDropdown
                open={companyActionOpen}
                onToggle={setCompanyActionOpen}
                rootRef={companyMenuRef}
                actions={companyMenuActions}
              />
            </div>
          </li>
        ) : null}

        <li className="header-profile">
          <a
            href="#"
            className="d-block head-icon"
            role="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#profilecanvasRight"
            aria-controls="profilecanvasRight"
          >
            <img
              src={userAvatar || "/assets/images/avtar/woman.jpg"}
              alt="avtar"
              className="b-r-10 h-35 w-35"
            />
          </a>

          <div
            className="offcanvas offcanvas-end header-profile-canvas"
            tabIndex="-1"
            id="profilecanvasRight"
            aria-labelledby="profilecanvasRight"
          >
            <div className="offcanvas-body app-scroll">
              <ul className="">
                <li>
                  <div className="d-flex-center">
                    <span className="h-45 w-45 d-flex-center b-r-10 position-relative">
                      <img
                        src={userAvatar || "/assets/images/avtar/woman.jpg"}
                        alt="woman"
                        className="img-fluid b-r-10"
                      />
                    </span>
                  </div>
                  <div className="text-center mt-2">
                    <h6 className="mb-0"> {user?.name ?? "...."}</h6>
                    <p className="f-s-12 mb-0 text-secondary">
                      {user?.email ?? "...."}
                    </p>
                  </div>
                </li>

                <li className="app-divider-v dotted my-1"></li>
                <li>
                  <Link className="f-w-500" to={'/profile'}>
                    <i className="ph-duotone  ph-user-circle pe-1 f-s-20"></i>
                    Profile Details
                  </Link>
                </li>
                <li>
                  <Link className="f-w-500" href="/apps/profile-page/setting">
                    <i className="ph-duotone  ph-gear pe-1 f-s-20"></i> Settings
                  </Link>
                </li>

                {/* <li className="app-divider-v dotted my-1"></li>
                <li>
                  <Card className="card-light-primary upgrade-plan">
                    <CardBody>
                      <div className="text-center">
                        <div>
                          <h6 className="mb-0 text-dark f-w-600">Free Plan</h6>
                          <p className="text-dark mb-0">20k views</p>
                        </div>
                        <div className="flex-shrink-0 mt-3">
                          <button
                            type="button"
                            className="btn btn-dark text-white"
                          >
                            Upgrade
                          </button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </li> */}
                <li className="app-divider-v dotted my-1"></li>

                <li>
                  <button
                    className="mb-0 text-danger btn w-100 d-flex justify-content-center"
                    onClick={()=> dispatch(logoutThunk())}
                  >
                    <i className="ph-duotone  ph-sign-out pe-1 f-s-20"></i> Log
                    Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>

      {canManageCurrentCompany ? (
        <CompanyMembersModal
          isOpen={companyMembersModalOpen}
          onClose={() => setCompanyMembersModalOpen(false)}
          members={companyMembers}
          status={companyMembersStatus}
          error={companyMembersError}
          onReload={handleReloadCompanyMembers}
          onDeleteMember={handleDeleteCompanyMember}
          removingByUserId={companyMembersRemovingByUserId}
        />
      ) : null}

      {canManageCurrentCompany ? (
        <AddCompanyMemberModal
          isOpen={companyAddMemberModalOpen}
          onClose={() => setCompanyAddMemberModalOpen(false)}
          onSubmit={handleSubmitAddCompanyMember}
          isSubmitting={companyMemberAddLoading}
        />
      ) : null}
    </>
  );
};

export default HeaderMenu;
