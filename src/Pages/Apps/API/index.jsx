import React from "react";
import Chart from "react-apexcharts";
import {Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import ApiTableData from "@/Components/Api/ApiTableData.jsx";
import {ApiRequestData} from "@/Data/Charts/ApexChart.js";


const Api = () => {

    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Api</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                        <span>
                          <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                        </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Api</a>
                        </li>
                    </ul>
                </Col>
            </Row>

            <Row className="row">
                <Col lg={6}>
                    <Card>
                        <CardHeader>
                            <h5>API request</h5>
                        </CardHeader>
                        <CardBody>
                            <div className="api-chart d-flex gap-3 justify-content-end">
                                <div className="form-check ps-0">
                                    <input
                                        className="form-check-input form-check-info mg-2 w-20 h-20"
                                        type="checkbox"
                                        value=""
                                        id="apiCheckbox"
                                    />
                                    <label className="form-check-label ms-2" htmlFor="apiCheckbox">
                                        22k successfully
                                    </label>
                                </div>
                                <div className="form-check ps-0">
                                    <input
                                        className="form-check-input form-check-info mg-2 w-20 h-20"
                                        type="checkbox"
                                        value=""
                                        id="apiCheckbox1"
                                    />
                                    <label className="form-check-label ms-2" htmlFor="apiCheckbox1">
                                        2error
                                    </label>
                                </div>
                                <div className="form-check ps-0">
                                    <input
                                        className="form-check-input form-check-info mg-2 w-20 h-20"
                                        type="checkbox"
                                        value=""
                                        id="apiCheckbox2"
                                    />
                                    <label className="form-check-label ms-2" htmlFor="apiCheckbox2">
                                        123 Total request
                                    </label>
                                </div>
                            </div>
                            <div>
                                <div id="apikey"></div>
                                <Chart
                                    options={ApiRequestData}
                                    series={ApiRequestData.series}
                                    type="area"
                                    height={350}
                                />
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <ApiTableData/>

            </Row>
        </Container>
    );
};

export default Api;
