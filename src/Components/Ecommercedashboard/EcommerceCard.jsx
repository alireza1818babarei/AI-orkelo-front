import React from 'react';
import {visitsChartData,orderChartData,activityChartData,salesChartData} from "../../Data/Charts/EcommerceChart";
import Chart from "react-apexcharts";
import {Link} from 'react-router-dom'

const EcommerceCard = () => {
    return (
        <>
            <div className="col-lg-7 col-xxl-6">
                <div className="row">
                    <div className="col-sm-6">
                        <div className="card eshop-cards">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                          <span className="bg-primary h-40 w-40 d-flex-center b-r-15 f-s-18">
                            <i className="ph-bold  ph-map-pin-line"></i>
                          </span>
                                    <div className="dropdown">
                                        <Link to="#" className="text-primary" role="button" data-bs-toggle="dropdown"
                                           aria-expanded="false">
                                            Last Month<i className="ti ti-chevron-down ms-1"></i>
                                        </Link>
                                        <ul className="dropdown-menu  dropdown-menu-end">
                                            <li><Link className="dropdown-item" to="#">Last Month</Link></li>
                                            <li><Link className="dropdown-item" to="#">Last Week</Link></li>
                                            <li><Link className="dropdown-item" to="#">Last Year</Link></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-shrink-0 align-self-end">
                                        <p className="f-s-16 mb-0">Visits</p>
                                        <h5>25,220k <span className="f-s-12 text-danger">-45%</span></h5>
                                    </div>
                                    <div className="visits-chart">
                                        <Chart options={visitsChartData} series={visitsChartData.series} type="line"
                                               width={140} height={120}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="card eshop-cards">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                          <span className="bg-secondary h-40 w-40 d-flex-center b-r-15 f-s-18">
                            <i className="ph-bold  ph-shopping-cart"></i>
                          </span>
                                    <div className="dropdown">
                                        <Link to="#" className="text-secondary " role="button" data-bs-toggle="dropdown"
                                           aria-expanded="false">
                                            Weekly<i className="ti ti-chevron-down ms-1"></i>
                                        </Link>
                                        <ul className="dropdown-menu  dropdown-menu-end">
                                            <li><Link className="dropdown-item" to="#">Monthly</Link></li>
                                            <li><Link className="dropdown-item" to="#">Weekly</Link></li>
                                            <li><Link className="dropdown-item" to="#">Yearly</Link></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center position-relative">
                                    <div className="flex-shrink-0 align-self-end">
                                        <p className="f-s-16 mb-0">Order</p>
                                        <h5>45,782k <span className="f-s-12 text-success">+65%</span></h5>
                                    </div>
                                    <div className="order-chart">
                                        <Chart options={orderChartData} series={orderChartData.series} type="line"
                                               width={140} height={120}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="card eshop-cards">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                          <span className="bg-success h-40 w-40 d-flex-center b-r-15 f-s-18">
                            <i className="ph-bold  ph-pulse"></i>
                          </span>
                                    <div className="dropdown">
                                        <Link to="#" className="text-success " role="button" data-bs-toggle="dropdown"
                                           aria-expanded="false">
                                            Today<i className="ti ti-chevron-down ms-1"></i>
                                        </Link>
                                        <ul className="dropdown-menu  dropdown-menu-end">
                                            <li><Link className="dropdown-item" to="#">Today</Link></li>
                                            <li><Link className="dropdown-item" to="#">Tomorrow</Link></li>
                                            <li><Link className="dropdown-item" to="#">Last Week</Link></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-shrink-0 align-self-end">
                                        <p className="f-s-16 mb-0">Activity</p>
                                        <h5>45k</h5>
                                    </div>
                                    <div className="activity-chart">
                                        <Chart options={activityChartData} series={activityChartData.series} type="line"
                                               width={140} height={120}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="card eshop-cards">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                          <span className="bg-warning h-40 w-40 d-flex-center b-r-15 f-s-18">
                            <i className="ph-fill  ph-coins"></i>
                          </span>
                                    <div className="dropdown">
                                        <Link to="#" className="text-warning " role="button" data-bs-toggle="dropdown"
                                           aria-expanded="false">
                                            February<i className="ti ti-chevron-down ms-1"></i>
                                        </Link>
                                        <ul className="dropdown-menu  dropdown-menu-end">
                                            <li><Link className="dropdown-item" to="#">January</Link></li>
                                            <li><Link className="dropdown-item" to="#">February</Link></li>
                                            <li><Link className="dropdown-item" to="#">March</Link></li>
                                            <li><Link className="dropdown-item" to="#">April</Link></li>
                                            <li><Link className="dropdown-item" to="#">...</Link></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-shrink-0 align-self-end">
                                        <p className="f-s-16 mb-0">Sales</p>
                                        <h5>$63,987<span className="f-s-12 text-success">+68%</span></h5>
                                    </div>
                                    <div className="sales-chart">
                                        <Chart options={salesChartData} series={salesChartData.series} type="bar"
                                               width={120} height={120}/>
                                        {/*<div id="salesChart"></div>*/}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EcommerceCard;