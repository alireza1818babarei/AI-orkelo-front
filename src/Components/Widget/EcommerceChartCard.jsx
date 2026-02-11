import React from 'react';
import {Card, CardBody, Row, Col} from 'reactstrap';
import ApexCharts from 'react-apexcharts';
import {
    activityChartData,
    orderChartData,
    productSoldChartData,
    salesChartData,
    visitsChartData
} from "../../Data/Charts/EcommerceChart";
import Chart from "react-apexcharts";
import {activityHoursChart} from "../../Data/Charts/EducationChart";
import {Link} from 'react-router-dom'


const EcommerceChartCard = () => {


    return (
        <>
            <Col lg="7" xxl="6">
                <Row>
                    <Col sm="6">
                        <Card>
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                     <span className="bg-primary h-40 w-40 d-flex-center b-r-15 f-s-18">
                                       <i className="ph-bold ph-map-pin-line"></i>
                                     </span>

                                    <div className="dropdown">
                                        <a href="#" className="text-primary" role="button" data-bs-toggle="dropdown"
                                           aria-expanded="false">
                                            Last Month<i className="ti ti-chevron-down ms-1"></i>
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><a className="dropdown-item" href="#">Last Month</a></li>
                                            <li><a className="dropdown-item" href="#">Last Week</a></li>
                                            <li><a className="dropdown-item" href="#">Last Year</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-shrink-0 align-self-end">
                                        <p className="f-s-16 mb-0">Visits</p>
                                        <h5>25,220k <span className="f-s-12 text-danger">-45%</span></h5>
                                    </div>

                                    <div className="visits-chart">
                                        <ApexCharts
                                            options={visitsChartData}
                                            series={visitsChartData.series}
                                            type="line"
                                            width={140} height={120}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm="6">
                        <Card>
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <span className="bg-secondary h-40 w-40 d-flex-center b-r-15 f-s-18">
                                      <i className="ph-bold ph-shopping-cart"></i>
                                    </span>
                                    <div className="dropdown">
                                        <a href="#" className="text-secondary" role="button" data-bs-toggle="dropdown"
                                           aria-expanded="false">
                                            Weekly<i className="ti ti-chevron-down ms-1"></i>
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><a className="dropdown-item" href="#">Monthly</a></li>
                                            <li><a className="dropdown-item" href="#">Weekly</a></li>
                                            <li><a className="dropdown-item" href="#">Yearly</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-shrink-0 align-self-end">
                                        <p className="f-s-16 mb-0">Order</p>
                                        <h5>45,782k <span className="f-s-12 text-success">+65%</span></h5>
                                    </div>
                                    <div className="order-chart">
                                        <ApexCharts
                                            options={orderChartData}
                                            series={orderChartData.series}
                                            type="line"
                                            width={140} height={120}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm="6">
                        <Card>
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                    <span className="bg-success h-40 w-40 d-flex-center b-r-15 f-s-18">
                                      <i className="ph-bold ph-pulse"></i>
                                    </span>
                                    <div className="dropdown">
                                        <a href="#" className="text-success" role="button" data-bs-toggle="dropdown"
                                           aria-expanded="false">
                                            Today<i className="ti ti-chevron-down ms-1"></i>
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><a className="dropdown-item" href="#">Today</a></li>
                                            <li><a className="dropdown-item" href="#">Tomorrow</a></li>
                                            <li><a className="dropdown-item" href="#">Last Week</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-shrink-0 align-self-end">
                                        <p className="f-s-16 mb-0">Activity</p>
                                        <h5>45k</h5>
                                    </div>
                                    <div className="activity-chart">
                                        <ApexCharts
                                            options={activityChartData}
                                            series={activityChartData.series}
                                            type="line"
                                            width={140}
                                            height={120}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm="6">
                        <Card>
                            <CardBody>
                                <div className="d-flex justify-content-between">
                                     <span className="bg-warning h-40 w-40 d-flex-center b-r-15 f-s-18">
                                       <i className="ph-fill ph-coins"></i>
                                     </span>

                                    <div className="dropdown">
                                        <a href="#" className="text-warning" role="button" data-bs-toggle="dropdown"
                                           aria-expanded="false">
                                            February<i className="ti ti-chevron-down ms-1"></i>
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><a className="dropdown-item" href="#">January</a></li>
                                            <li><a className="dropdown-item" href="#">February</a></li>
                                            <li><a className="dropdown-item" href="#">March</a></li>
                                            <li><a className="dropdown-item" href="#">April</a></li>
                                            <li><a className="dropdown-item" href="#">...</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-shrink-0 align-self-end">
                                        <p className="f-s-16 mb-0">Sales</p>
                                        <h5>$63,987 <span className="f-s-12 text-success">+68%</span></h5>
                                    </div>
                                    <div className="sales-chart">
                                        <ApexCharts
                                            options={salesChartData}
                                            series={salesChartData.series}
                                            type="bar"
                                            width={120}
                                            height={120}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Col>

            <Col md="5" lg="3" xxl="4" className="order-4-lg">
                <Card>
                    <CardBody>
                        <h5 className="header-title-text">Spent Hours</h5>

                        <div className="mt-3">
                            <Chart options={activityHoursChart} series={activityHoursChart.series} type="line"
                                   height={200}/>
                        </div>

                        <div className="spent-hours-content">
                            <div>
                                <h6 className="mb-0">20H</h6>
                                <p className="text-secondary mb-0">Time Spent</p>
                            </div>
                            <div>
                                <h6 className="mb-0">45</h6>
                                <p className="text-secondary mb-0">Lessons taken</p>
                            </div>
                            <div>
                                <h6 className="mb-0">200</h6>
                                <p className="text-secondary mb-0">Lessons remaining</p>
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
                            <Chart options={productSoldChartData} series={productSoldChartData.series} type="bubble"
                                   height={220}/>
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

export default EcommerceChartCard;