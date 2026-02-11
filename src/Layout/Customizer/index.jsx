import React, {useState, useEffect} from 'react';
import {getLocalStorageItem} from "@/_helper/index.js";
import {Link} from 'react-router-dom'

const themeName = "La-Theme";

const setLocalStorageItem = (key, value) => {
    localStorage.setItem(`${themeName}-${key}`, value);
};

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const Customizer = () => {
    const [sidebarOption, setSidebarOption] = useState(getLocalStorageItem("sidebar-option", "vertical-sidebar"));
    const [layoutOption, setLayoutOption] = useState(getLocalStorageItem("layout-option", "ltr"));
    const [colorOption, setColorOption] = useState(getLocalStorageItem("color-option", "default"));
    const [textOption, setTextOption] = useState(getLocalStorageItem("text-option", "medium-text"));

    useEffect(() => {
        const loadConfiguration = () => {
            setSidebarOption(getLocalStorageItem("sidebar-option", "vertical-sidebar"));
            setLayoutOption(getLocalStorageItem("layout-option", "ltr"));
            setColorOption(getLocalStorageItem("color-option", "default"));
            setTextOption(getLocalStorageItem("text-option", "medium-text"));
        };

        $("nav").removeClass('dark-sidebar').addClass(sidebarOption);
        $("body").attr("text", textOption);
        $("body").attr("class", layoutOption);
        $("html").attr("dir", layoutOption);
        $(".app-wrapper").addClass(`${colorOption}`)
        loadConfiguration();
    }, []);

    const handleSidebarOptionChange = (option) => {
        setSidebarOption(option);
        $("nav").removeClass("horizontal-sidebar vertical-sidebar dark-sidebar").addClass(option)
        setLocalStorageItem("sidebar-option", option);
    };

    const handleLayoutOptionChange = (option) => {
        setLayoutOption(option);
        $("body").attr("class", option);
        $("html").attr("dir", option);
        if(option === "box-layout") {
            $("html").removeAttr("dir");
        }
        setLocalStorageItem("layout-option", option);
    };

    const handleColorOptionChange = (option) => {
        setColorOption(option);
        let colorOption = getLocalStorageItem("color-option", "default");

        // Remove previous color class and add the new one
        const appWrapper = document.querySelector(".app-wrapper");
        if (appWrapper) {
            appWrapper.classList.remove(colorOption);
            appWrapper.classList.add(option);
        }

        // Create a temporary element to access the CSS variables
        const tempElement = document.createElement("div");
        tempElement.className = option;
        tempElement.style.display = "none"; // Hide the element
        document.body.appendChild(tempElement);

        // Get primary color values
        const primaryColorValue = getComputedStyle(tempElement).getPropertyValue('--primary').trim();
        console.log('Primary Color Value:', primaryColorValue);

        if (primaryColorValue) {
            let primaryColorValues = primaryColorValue.split(',');
            if (primaryColorValues.length === 3) {
                let primaryColorHex = rgbToHex(
                    parseInt(primaryColorValues[0]),
                    parseInt(primaryColorValues[1]),
                    parseInt(primaryColorValues[2])
                );
                setLocalStorageItem("color-primary", primaryColorHex);
            }
        } else {
            console.error(`--primary is undefined for class: ${option}`);
        }

        // Get secondary color values
        const secondaryColorValue = getComputedStyle(tempElement).getPropertyValue('--secondary').trim();
        console.log('Secondary Color Value:', secondaryColorValue);

        if (secondaryColorValue) {
            let secondaryColorValues = secondaryColorValue.split(',');
            if (secondaryColorValues.length === 3) {
                let secondaryColorHex = rgbToHex(
                    parseInt(secondaryColorValues[0]),
                    parseInt(secondaryColorValues[1]),
                    parseInt(secondaryColorValues[2])
                );
                setLocalStorageItem("color-secondary", secondaryColorHex);
            }
        } else {
            console.error(`--secondary is undefined for class: ${option}`);
        }

        // Clean up the temporary element
        document.body.removeChild(tempElement);

        setLocalStorageItem("color-option", option);
    };

    const handleTextOptionChange = (option) => {
        setTextOption(option);
        $("body").attr("text", option);
        setLocalStorageItem("text-option", option);
    };
    return (
        <>
            <button
                className="customizer-btn"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#customizerOptions"
                aria-controls="customizerOptions"
            >
                <i className="ti ti-settings-2"></i>
            </button>
            <div
                className="offcanvas offcanvas-end app-customizer"
                data-bs-scroll="true" tabIndex="-1"
                id="customizerOptions"
            >
                <div className="offcanvas-header flex-wrap bg-primary">
                    <h5 className="offcanvas-title text-white" id="customizerOptionsLabel"> Admin Customizer </h5>
                    <p className="d-block text-white opacity-75">it's time to style according to your choice ..!</p>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>

                <div className="offcanvas-body">
                    <div className="app-divider-v secondary my-3">
                        <h6 className="mt-2">Sidebar option</h6>
                    </div>
                    <ul className="sidebar-option d-flex gap-1">
                        <li className={sidebarOption === "vertical-sidebar" ? "selected" : ""}
                            onClick={() => handleSidebarOptionChange("vertical-sidebar")}>
                            <ul>
                                <li className="header"></li>
                                <li className="sidebar"></li>
                                <li className="body"><span className="badge text-bg-secondary b-r-6"> Vertical</span>
                                </li>
                            </ul>
                        </li>
                        <li className={sidebarOption === "horizontal-sidebar" ? "selected" : ""}
                            onClick={() => handleSidebarOptionChange("horizontal-sidebar")}>
                            <ul>
                                <li className="header h-20"><span
                                    className="badge text-bg-secondary b-r-6"> Horizontal</span></li>
                                <li className="body w-100"></li>
                            </ul>
                        </li>
                        <li className={sidebarOption === "dark-sidebar" ? "selected" : ""}
                            onClick={() => handleSidebarOptionChange("dark-sidebar")}>
                            <ul>
                                <li className="header "></li>
                                <li className="sidebar bg-dark-600"></li>
                                <li className="body"><span className="badge text-bg-secondary b-r-6"> Dark </span></li>
                            </ul>
                        </li>
                    </ul>

                    <div className="app-divider-v secondary my-3">
                        <h6 className="mt-2">Layout option</h6>
                    </div>
                    <ul className="layout-option d-flex gap-1">
                        <li className={layoutOption === "ltr" ? "selected" : ""}
                            onClick={() => handleLayoutOptionChange("ltr")}>
                            <ul>
                                <li className="header"/>
                                <li className="sidebar"/>
                                <li className="body"><span className="badge text-bg-secondary b-r-6"> LTR </span></li>
                            </ul>
                        </li>
                        <li className={layoutOption === "rtl" ? "selected" : ""}
                            onClick={() => handleLayoutOptionChange("rtl")}>
                            <ul>
                                <li className="header"/>
                                <li className="body"><span className="badge text-bg-secondary b-r-6"> RTL </span></li>
                                <li className="sidebar"/>
                            </ul>
                        </li>
                        <li className={layoutOption === "box-layout" ? "selected" : ""}
                            onClick={() => handleLayoutOptionChange("box-layout")}>
                            <ul>
                                <li className="header"/>
                                <li className="sidebar"/>
                                <li className="body"><span className="badge text-bg-secondary b-r-6"> Box </span></li>
                            </ul>
                        </li>
                    </ul>

                    <h6 className="mt-3">Color Hint</h6>
                    <ul className="color-hint p-0 d-flex gap-1">
                        <li className={(colorOption === "default" ? "selected" : "") + " default"}
                            onClick={() => handleColorOptionChange("default")}>
                            <div/>
                        </li>
                        <li className={(colorOption === "gold" ? "selected" : "") + " gold"}
                            onClick={() => handleColorOptionChange("gold")}>
                            <div/>
                        </li>
                        <li className={(colorOption === "warm" ? "selected" : "") + " warm"}
                            onClick={() => handleColorOptionChange("warm")}>
                            <div/>
                        </li>
                        <li className={(colorOption === "happy" ? "selected" : "") + " happy"}
                            onClick={() => handleColorOptionChange("happy")}>
                            <div/>
                        </li>
                        <li className={(colorOption === "nature" ? "selected" : "") + " nature"}
                            onClick={() => handleColorOptionChange("nature")}>
                            <div/>
                        </li>
                        <li className={(colorOption === "hot" ? "selected" : "") + " hot"}
                            onClick={() => handleColorOptionChange("hot")}>
                            <div/>
                        </li>
                    </ul>
                    <div className="app-divider-v secondary my-3">
                        <h6 className="mt-2 font-primary">Text size</h6>
                    </div>
                    <ul className="text-size d-flex gap-1">
                        <li className={textOption === "small-text" ? "selected" : ""}
                            onClick={() => handleTextOptionChange("small-text")}> sm
                        </li>
                        <li className={textOption === "medium-text" ? "selected" : ""}
                            onClick={() => handleTextOptionChange("medium-text")}> md
                        </li>
                        <li className={textOption === "large-text" ? "selected" : ""}
                            onClick={() => handleTextOptionChange("large-text")}> lg
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Customizer;
