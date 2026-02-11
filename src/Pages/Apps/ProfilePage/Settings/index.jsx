
import React from "react";
import { Col, Container, Row } from "reactstrap";
import SettingTabs from "@/Components/Setting/SettingTabs";



const Setting = () => {

    return (
        <>
            <Container fluid>
                <div className="row m-1">
                    <div className="col-12 ">
                        <h4 className="main-title">Setting</h4>
                        <ul className="app-line-breadcrumbs mb-3">
                            <li className="">
                                <a href="#" className="f-s-14 f-w-500">
                                    <span>
                                      <i className="ph-duotone  ph-stack f-s-16 "></i> Apps
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="f-s-14 f-w-500">Profile</a>
                            </li>
                            <li className="active">
                                <a href="#" className="f-s-14 f-w-500">Setting</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <Row>
                    <SettingTabs/>
                </Row>
            </Container>
        </>
    );
};

export default Setting;
