import React, { useState } from "react";
import {
  weatherData,
  initialCartItems,
  initialnotifications,
  linkData,
  headerLanguages,
  searchData,
} from "../../Data/HeaderMenuData.js";
import { Link } from "react-router-dom";
import { Button, Card, CardBody } from "reactstrap";
import HeaderMode from "../../Layout/Header/HeaderMode.jsx";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/auth/authSlice.js";

const HeaderMenu = () => {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const user = useSelector(s=> s.auth.user);


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
              src="/assets/images/avtar/woman.jpg"
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
                      {/* FIXME User Profile */}
                      <img
                        src="/assets/images/avtar/woman.jpg"
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
                <li>
                  <div className="app-dropdown dropstart">
                    <Link
                      className="f-w-500"
                      role="button"
                      href="/apps/profile-page/setting"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="ph-duotone  ph-eye-slash pe-1 f-s-20"></i>
                      Hide Settings
                    </Link>
                    <ul className="dropdown-menu">
                      <li>
                        <a className="dropdown-item">Hide Comments</a>
                      </li>
                      <li>
                        <a className="dropdown-item">
                          Advanced comment filtering
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item">Hide mssage request</a>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <a className="dropdown-item">Separated link</a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <div className="d-flex align-items-center justify-content-between">
                    <a className="f-w-500" href="#">
                      <i className="ph-duotone  ph-notification pe-1 f-s-20"></i>
                      Notification
                    </a>
                    <div className="flex-shrink-0">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input form-check-primary"
                          type="checkbox"
                          id="basicSwitch"
                          defaultChecked
                        />
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <a className="f-w-500" href="#">
                        <i className="ph-duotone  ph-detective pe-1 f-s-20"></i>
                        Incognito
                      </a>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input form-check-primary"
                          type="checkbox"
                          id="incognitoSwitch"
                        />
                      </div>
                    </div>
                  </div>
                </li>
                <li className="app-divider-v dotted my-1"></li>
                <li>
                  <Link className="f-w-500" href="/apps/faq">
                    <i className="ph-duotone  ph-question pe-1 f-s-20"></i> Help
                  </Link>
                </li>
                <li>
                  <Link className="f-w-500" href="/apps/pricing">
                    <i className="ph-duotone  ph-currency-circle-dollar pe-1 f-s-20"></i>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    className="mb-0 text-secondary f-w-500"
                    href="/admin-pages/auth_pages/sign_up"
                  >
                    <i className="ph-bold  ph-plus pe-1 f-s-20"></i> Add account
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
    </>
  );
};

export default HeaderMenu;
