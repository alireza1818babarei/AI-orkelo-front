import React from 'react';
import {userChartData,productSoldChartData} from "../../Data/Charts/EcommerceChart";
import Chart from "react-apexcharts";
import {Link} from 'react-router-dom'
import {Card, CardBody, Col} from "reactstrap";

const ActiveUser = () => {
    return (
        <>
            <Col md={6} lg={5} xxl={4}>
                <Card className="active-user-card">
                    <CardBody>
                        <div className="">
                            <h5 className="text-dark">Active Users</h5>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <div className="active-user-content">
                                <h2 className="text-primary mb-0">50k</h2>
                                <p className="text-secondary text-nowrap mb-0">Page Views per Minutes</p>
                                <div className="app-divider-v dashed py-3"></div>
                                <p className="f-w-500">Today Users</p>
                                <div>
                                    <ul className="avatar-group justify-content-start">
                                        <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-primary b-2-light"
                                            data-bs-toggle="tooltip" data-bs-title="Sabrina Torres">
                                            <img width={31} height={31} src="/assets/images/avtar/4.png" alt="avtar" className="img-fluid"/>
                                        </li>
                                        <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-success b-2-light"
                                            data-bs-toggle="tooltip" data-bs-title="Eva Bailey">
                                            <img width={31} height={31} src="/assets/images/avtar/5.png" alt="avtar" className="img-fluid"/>
                                        </li>
                                        <li className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-danger b-2-light"
                                            data-bs-toggle="tooltip" data-bs-title="Michael Hughes">
                                            <img width={31} height={31} src="/assets/images/avtar/6.png" alt="avtar" className="img-fluid"/>
                                        </li>
                                        <li className="text-bg-secondary h-25 w-25 d-flex-center b-r-50"
                                            data-bs-toggle="tooltip"
                                            data-bs-title="10 More">
                                            10+
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <Card className="card-primary flex-grow-1 user-chart-card">
                                <CardBody>
                                    <div className="active-users-chart">
                                        {/*<div id="userChart"></div>*/}
                                        <Chart options={userChartData} series={userChartData.series} type="bar" height={160}/>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="active-users-content mt-3">
                            <div>
                                <h6 className="mb-0">4.78%</h6>
                                <p className="text-secondary mb-0">Monthly</p>
                            </div>
                            <div>
                                <h6 className="mb-0">82.90%</h6>
                                <p className="text-secondary mb-0">Weekly</p>
                            </div>
                            <div>
                                <h6 className="mb-0">80.0%</h6>
                                <p className="text-secondary mb-0">Yearly</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col md={6} lg={2} className="d-none d-xxl-block">
                <Card>
                    <CardBody>
                        <div className="d-flex justify-content-between">
                            <h6 className="header-title-text mb-0">Product Sold </h6>
                            <span><i className="ph-bold  ph-trend-down text-danger"></i></span>
                        </div>
                        <div>
                            <div id="productSold"></div>
                            <Chart options={productSoldChartData} series={productSoldChartData.series} type="bubble" height={220}/>
                            <div>
                                <Link to="/apps/e-shop/product-details" role="button"
                                   className="btn btn-success w-100">Details</Link>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </>
    );
};

export default ActiveUser;