import React from "react";
import { Link } from "react-router-dom";

const TelegramHeaderButton = () => (
  <li className="header-telegram">
    <Link
      className="btn icon-btn b-r-100 p-0 border-0 d-flex align-items-center head-icon"
      to="/profile/integrations"
      aria-label="Open Telegram integration"
      title="Telegram integration"
    >
      <i className="ti ti-brand-telegram"></i>
    </Link>
  </li>
);

export default TelegramHeaderButton;
