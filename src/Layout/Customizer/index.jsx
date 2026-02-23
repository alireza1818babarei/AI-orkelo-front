import React, { useState, useEffect } from "react";
import { getLocalStorageItem } from "@/_helper/index.js";

const themeName = "La-Theme";
const COLOR_CLASSES = [
  "default",
  "gold",
  "warm",
  "happy",
  "nature",
  "cold",
  "hot",
];
const WALLPAPER_FILES = [
  "w1.jpg",
  "w2.jpg",
  "w3.jpg",
  "w4.webp",
  "w5.jpg",
  "w6.jpg",
  "w7.jpg",
  "w8.png",
  "w9.jpg",
  "w10.jpg",
  "w11.jpg",
  "w12.jpg",
];
const WALLPAPER_NONE = "none";

const wallpaperOptions = [
  { id: WALLPAPER_NONE, label: "Default", preview: null },
  ...WALLPAPER_FILES.map((file) => ({
    id: file,
    label: file.replace(".jpg", "").toUpperCase(),
    preview: `/assets/images/wallpapers/${file}`,
  })),
];

const setLocalStorageItem = (key, value) => {
  localStorage.setItem(`${themeName}-${key}`, value);
};

const applyWallpaperToApp = (wallpaperId) => {
  const appWrapper = document.querySelector(".app-wrapper");
  if (!appWrapper) return;

  appWrapper.classList.remove("app-wrapper--wallpaper");
  appWrapper.style.removeProperty("--app-wallpaper-image");

  if (!wallpaperId || wallpaperId === WALLPAPER_NONE) return;

  const wallpaperUrl = `/assets/images/wallpapers/${wallpaperId}`;
  appWrapper.style.setProperty(
    "--app-wallpaper-image",
    `url("${wallpaperUrl}")`,
  );
  appWrapper.classList.add("app-wrapper--wallpaper");
};

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const setBootstrapThemeVars = ({ primaryRgb, secondaryRgb }) => {
  if (primaryRgb) {
    document.documentElement.style.setProperty("--bs-primary-rgb", primaryRgb);
    document.documentElement.style.setProperty(
      "--bs-primary",
      `rgb(${primaryRgb})`,
    );
  }
  if (secondaryRgb) {
    document.documentElement.style.setProperty(
      "--bs-secondary-rgb",
      secondaryRgb,
    );
    document.documentElement.style.setProperty(
      "--bs-secondary",
      `rgb(${secondaryRgb})`,
    );
  }
};

const Customizer = ({ showLauncher = true }) => {
  const [sidebarOption, setSidebarOption] = useState(
    getLocalStorageItem("sidebar-option", "vertical-sidebar"),
  );
  const [colorOption, setColorOption] = useState(
    getLocalStorageItem("color-option", "default"),
  );
  const [textOption, setTextOption] = useState(
    getLocalStorageItem("text-option", "medium-text"),
  );
  const [wallpaperOption, setWallpaperOption] = useState(
    getLocalStorageItem("wallpaper-option", WALLPAPER_NONE),
  );

  useEffect(() => {
    const storedSidebar = getLocalStorageItem(
      "sidebar-option",
      "vertical-sidebar",
    );
    const storedLayout = getLocalStorageItem("layout-option", "ltr");
    const storedColor = getLocalStorageItem("color-option", "default");
    const storedText = getLocalStorageItem("text-option", "medium-text");
    const storedWallpaper = getLocalStorageItem(
      "wallpaper-option",
      WALLPAPER_NONE,
    );
    const hasValidWallpaper =
      storedWallpaper === WALLPAPER_NONE ||
      WALLPAPER_FILES.includes(storedWallpaper);
    const normalizedWallpaper = hasValidWallpaper
      ? storedWallpaper
      : WALLPAPER_NONE;

    setSidebarOption(storedSidebar);
    setColorOption(storedColor);
    setTextOption(storedText);
    setWallpaperOption(normalizedWallpaper);

    $("nav").removeClass("dark-sidebar").addClass(storedSidebar);
    $("body").attr("text", storedText);
    $("body").attr("class", storedLayout);
    $("html").attr("dir", storedLayout);
    if (storedLayout === "box-layout") {
      $("html").removeAttr("dir");
    }

    const appWrapper = document.querySelector(".app-wrapper");
    if (appWrapper) {
      COLOR_CLASSES.forEach((c) => appWrapper.classList.remove(c));
      appWrapper.classList.add(storedColor);
    }

    COLOR_CLASSES.forEach((c) => document.documentElement.classList.remove(c));
    document.documentElement.classList.add(storedColor);

    const tempElement = document.createElement("div");
    tempElement.className = storedColor;
    tempElement.style.display = "none";
    document.body.appendChild(tempElement);

    const primaryRgb = getComputedStyle(tempElement)
      .getPropertyValue("--primary")
      .trim();
    const secondaryRgb = getComputedStyle(tempElement)
      .getPropertyValue("--secondary")
      .trim();
    setBootstrapThemeVars({ primaryRgb, secondaryRgb });

    document.body.removeChild(tempElement);

    applyWallpaperToApp(normalizedWallpaper);
  }, []);

  const handleSidebarOptionChange = (option) => {
    setSidebarOption(option);
    $("nav")
      .removeClass("horizontal-sidebar vertical-sidebar dark-sidebar")
      .addClass(option);
    setLocalStorageItem("sidebar-option", option);
  };

  const handleColorOptionChange = (option) => {
    setColorOption(option);
    const appWrapper = document.querySelector(".app-wrapper");
    if (appWrapper) {
      COLOR_CLASSES.forEach((c) => appWrapper.classList.remove(c));
      appWrapper.classList.add(option);
    }

    COLOR_CLASSES.forEach((c) => document.documentElement.classList.remove(c));
    document.documentElement.classList.add(option);

    const tempElement = document.createElement("div");
    tempElement.className = option;
    tempElement.style.display = "none";
    document.body.appendChild(tempElement);

    const primaryColorValue = getComputedStyle(tempElement)
      .getPropertyValue("--primary")
      .trim();

    if (primaryColorValue) {
      let primaryColorValues = primaryColorValue.split(",");
      if (primaryColorValues.length === 3) {
        let primaryColorHex = rgbToHex(
          parseInt(primaryColorValues[0]),
          parseInt(primaryColorValues[1]),
          parseInt(primaryColorValues[2]),
        );
        setLocalStorageItem("color-primary", primaryColorHex);
      }
    }

    const secondaryColorValue = getComputedStyle(tempElement)
      .getPropertyValue("--secondary")
      .trim();

    if (secondaryColorValue) {
      let secondaryColorValues = secondaryColorValue.split(",");
      if (secondaryColorValues.length === 3) {
        let secondaryColorHex = rgbToHex(
          parseInt(secondaryColorValues[0]),
          parseInt(secondaryColorValues[1]),
          parseInt(secondaryColorValues[2]),
        );
        setLocalStorageItem("color-secondary", secondaryColorHex);
      }
    }

    setBootstrapThemeVars({
      primaryRgb: primaryColorValue,
      secondaryRgb: secondaryColorValue,
    });

    document.body.removeChild(tempElement);

    setLocalStorageItem("color-option", option);
  };

  const handleTextOptionChange = (option) => {
    setTextOption(option);
    $("body").attr("text", option);
    setLocalStorageItem("text-option", option);
  };

  const handleWallpaperOptionChange = (option) => {
    setWallpaperOption(option);
    applyWallpaperToApp(option);
    setLocalStorageItem("wallpaper-option", option);
  };
  return (
    <>
      {showLauncher ? (
        <button
          className="customizer-btn"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#customizerOptions"
          aria-controls="customizerOptions"
        >
          <i className="ti ti-settings-2"></i>
        </button>
      ) : null}
      <div
        className="offcanvas offcanvas-end app-customizer"
        data-bs-scroll="true"
        tabIndex="-1"
        id="customizerOptions"
      >
        <div className="offcanvas-header flex-wrap bg-primary">
          <h5
            className="offcanvas-title text-white"
            id="customizerOptionsLabel"
          >
            {" "}
            Customizer{" "}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div className="offcanvas-body">
          <div className="app-divider-v secondary my-3">
            <h6 className="mt-2">Sidebar option</h6>
          </div>
          <ul className="sidebar-option d-flex gap-1">
            <li
              className={sidebarOption === "vertical-sidebar" ? "selected" : ""}
              onClick={() => handleSidebarOptionChange("vertical-sidebar")}
            >
              <ul>
                <li className="header"></li>
                <li className="sidebar"></li>
                <li className="body">
                  <span className="badge text-bg-secondary b-r-6">
                    {" "}
                    Vertical
                  </span>
                </li>
              </ul>
            </li>
            <li
              className={
                sidebarOption === "horizontal-sidebar" ? "selected" : ""
              }
              onClick={() => handleSidebarOptionChange("horizontal-sidebar")}
            >
              <ul>
                <li className="header h-20">
                  <span className="badge text-bg-secondary b-r-6">
                    {" "}
                    Horizontal
                  </span>
                </li>
                <li className="body w-100"></li>
              </ul>
            </li>
            <li
              className={sidebarOption === "dark-sidebar" ? "selected" : ""}
              onClick={() => handleSidebarOptionChange("dark-sidebar")}
            >
              <ul>
                <li className="header "></li>
                <li className="sidebar bg-dark-600"></li>
                <li className="body">
                  <span className="badge text-bg-secondary b-r-6"> Dark </span>
                </li>
              </ul>
            </li>
          </ul>

          <h6 className="mt-3">Color Hint</h6>
          <ul className="color-hint p-0 d-flex gap-1">
            <li
              className={
                (colorOption === "default" ? "selected" : "") + " default"
              }
              onClick={() => handleColorOptionChange("default")}
            >
              <div />
            </li>
            <li
              className={(colorOption === "gold" ? "selected" : "") + " gold"}
              onClick={() => handleColorOptionChange("gold")}
            >
              <div />
            </li>
            <li
              className={(colorOption === "warm" ? "selected" : "") + " warm"}
              onClick={() => handleColorOptionChange("warm")}
            >
              <div />
            </li>
            <li
              className={(colorOption === "happy" ? "selected" : "") + " happy"}
              onClick={() => handleColorOptionChange("happy")}
            >
              <div />
            </li>
            <li
              className={
                (colorOption === "nature" ? "selected" : "") + " nature"
              }
              onClick={() => handleColorOptionChange("nature")}
            >
              <div />
            </li>
            <li
              className={(colorOption === "hot" ? "selected" : "") + " hot"}
              onClick={() => handleColorOptionChange("hot")}
            >
              <div />
            </li>
          </ul>
          <div className="app-divider-v secondary my-3">
            <h6 className="mt-2 font-primary">Text size</h6>
          </div>
          <ul className="text-size d-flex gap-1">
            <li
              className={textOption === "small-text" ? "selected" : ""}
              onClick={() => handleTextOptionChange("small-text")}
            >
              {" "}
              sm
            </li>
            <li
              className={textOption === "medium-text" ? "selected" : ""}
              onClick={() => handleTextOptionChange("medium-text")}
            >
              {" "}
              md
            </li>
            <li
              className={textOption === "large-text" ? "selected" : ""}
              onClick={() => handleTextOptionChange("large-text")}
            >
              {" "}
              lg
            </li>
          </ul>

          <div className="app-divider-v secondary my-3">
            <h6 className="mt-2">Wallpapers</h6>
          </div>
          <ul className="wallpaper-option p-0">
            {wallpaperOptions.map((wallpaper) => (
              <li
                key={wallpaper.id}
                className={wallpaperOption === wallpaper.id ? "selected" : ""}
                onClick={() => handleWallpaperOptionChange(wallpaper.id)}
              >
                <button
                  type="button"
                  className="wallpaper-option__btn"
                  aria-label={`Set wallpaper ${wallpaper.label}`}
                >
                  {wallpaper.preview ? (
                    <img src={wallpaper.preview} alt={wallpaper.label} />
                  ) : (
                    <span className="wallpaper-option__empty">
                      No wallpaper
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Customizer;
