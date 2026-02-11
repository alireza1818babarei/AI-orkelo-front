import React from 'react';
import {Card, CardBody, Col, Row} from "reactstrap";
import Chart from "react-apexcharts";
import {sharesChart} from "@/Data/Charts/CryptoChart";
import {projectEarning} from "@/Data/Charts/projectCharts";

const WidgetsCards = () => {
    const currencies = [
        {
            id: 1,
            name: 'Bitcoin',
            amount: '$72,890',
            img: '/images/dashboard/analytics/binance.png',
            bgColor: 'bg-primary',
        },
        {
            id: 2,
            name: 'Ethereum',
            amount: '$34,786',
            img: '/images/dashboard/analytics/ethereum.png',
            bgColor: 'bg-danger',
        },
        {
            id: 3,
            name: 'Dash',
            amount: '$34,786',
            img: '/images/dashboard/analytics/dogecoin.png',
            bgColor: 'bg-secondary',
        },
        {
            id: 4,
            name: 'Edo',
            amount: '$34,786',
            img: '/images/dashboard/analytics/turkish-lira.png',
            bgColor: 'bg-success',
        },
    ];

    const profitData = {
        amount: '$45,897.00',
        yearOverYear: '45.9% Year over year',
    };

    const sharesData = {
        amount: '$7,829.03',
        yearOverYear: '14.07% Year over year',
    };

    const earnings = [
        { label: 'Income', amount: '$68,200', icon: 'ph-circle text-warning' },
        { label: 'Total', amount: '$12,200', icon: 'ph-circle text-success' },
    ];

    const coursesData = [
        {
            id: 1,
            cardClass: 'card-success',
            iconClass: 'ph-duotone ph-calendar-check',
            iconColorClass: 'text-success',
            value: '2K+',
            label: 'Completed Courses',
        },
        {
            id: 2,
            cardClass: 'card-info',
            iconClass: 'ph-duotone ph-projector-screen-chart',
            iconColorClass: 'text-info',
            value: '38+',
            label: 'Online Courses',
        },
        {
            id: 3,
            cardClass: 'card-primary',
            iconClass: 'ph-duotone ph-graduation-cap',
            iconColorClass: 'text-primary',
            value: '16',
            label: 'Upcoming Courses',
        },
        {
            id: 4,
            cardClass: 'card-warning',
            iconClass: 'ph-duotone ph-pencil-line',
            iconColorClass: 'text-warning',
            value: '25+',
            label: 'In Progress Courses',
        },
    ];

    return (
        <>
            <Col lg="5" >
                <Card className="card-dark currency-data-card">
                    <CardBody>
                        <Row>
                            <Col sm="6">
                                <h6>Profit</h6>
                                <h2>{profitData.amount}</h2>
                                <p className="text-light">{profitData.yearOverYear}</p>
                            </Col>

                            <Col sm="6" className="text-end text-sm-start">
                                <h6>Shares</h6>
                                <h4>{sharesData.amount}</h4>
                                <p className="text-light mb-0">{sharesData.yearOverYear}</p>
                                <div>
                                    <Chart options={sharesChart} series={sharesChart.series} type="line" height={90}/>
                                </div>
                            </Col>

                            {currencies.map((currency) => (
                                <Col key={currency.id} xs="6" md="3" className="p-1">
                                    <div className={`currency-coin-box ${currency.bgColor}`}>
                                        <div className="h-45 w-45 d-flex-center b-r-15 overflow-hidden p-1 mb-3">
                                            <img src={currency.img} alt={currency.name} className="img-fluid"/>
                                        </div>
                                        <p className="text-light mb-0">{currency.name}</p>
                                        <h6 className="mb-0">{currency.amount}</h6>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </CardBody>
                </Card>
            </Col>

            <Col md="6" lg="4" xxl="3">
                <Card>
                    <CardBody className="p-0">
                        <div className="p-3">
                            <h6 className="f-w-500 text-secondary mb-0">
                                <i className="ph-bold ph-caret-left me-2"></i>Feb 02 - Feb 08
                            </h6>

                            <div className="project-earning mt-3">
                                {earnings.map((earning, index) => (
                                    <div key={index} className="project-earning-label">
                                        <h6 className="mb-0">
                                            <i className={`ph-fill ${earning.icon} f-s-14 me-2`}></i>
                                            {earning.amount}
                                        </h6>
                                        <p className="text-secondary mb-0 ms-4">{earning.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="project-earning-chart">
                            <Chart options={projectEarning} series={projectEarning.series} type="line"
                                   height={190}/>
                        </div>

                        <div className="p-3 project-earning-content">
                            <p className="mb-0">
                                In the symphony of success, our total project income resonates as the crescendo of our endeavors.
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col md="7" lg="5" xxl="4" >
                <Row>
                    {coursesData.map((course) => (
                        <Col sm="6" key={course.id} className="mb-3">
                            <Card className={`courses-cards ${course.cardClass}`}>
                                <CardBody>
                                    <i className={`${course.iconClass} icon-bg`}/>
                                    <span
                                        className="bg-white h-50 w-50 d-flex justify-content-center align-items-center rounded">
                  <i className={`${course.iconClass} ${course.iconColorClass} f-s-24`}/>
                </span>
                                    <div className="mt-5">
                                        <h4>{course.value}</h4>
                                        <p className="font-weight-bold mb-0">{course.label}</p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Col>
        </>
    );
};

export default WidgetsCards;