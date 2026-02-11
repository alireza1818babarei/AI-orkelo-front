
import React from 'react';
import {Button, Card, CardBody, Col, Row} from "reactstrap";
import Chart from "react-apexcharts";
import {coursesProgress} from "../../Data/Charts/EducationChart";
import {Link} from 'react-router-dom'

const ProfileCards = () => {

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

    const progressData = [
        {
            id: 1,
            colorClass: 'text-primary',
            value: '$68,200',
            label: 'Income',
        },
        {
            id: 2,
            colorClass: 'text-secondary',
            value: '$45,587',
            label: 'Income',
        },
        {
            id: 3,
            colorClass: 'text-danger',
            value: '$49k',
            label: 'Income',
        },
    ];

    return (
        <>
            <Col md="5" lg="4" xxl="3" className="order--lg-3">
                <Card className="education-profile-card">
                    <CardBody>
                        <div className="profile-header">
                            <h5 className="header-title-text">Profile</h5>
                        </div>

                        <div className="profile-top-content text-center">
                            <div
                                className="h-80 w-80 mx-auto rounded-circle overflow-hidden d-flex justify-content-center align-items-center">
                                <img
                                    src="/assets/images/dashboard/education/01.png"
                                    alt="Profile"
                                    className="img-fluid"
                                />
                            </div>
                            <h6 className="text-dark font-weight-bold mb-0">Kari Wiza</h6>
                            <p className="text-secondary font-italic mb-0">@Kari_wiza@001</p>
                            <div className="my-3">
                                <Button color="primary" className="me-2">
                                    Follow
                                </Button>
                                <Link to="/apps/profile-page/profile">
                                    <Button
                                        color="secondary"
                                        outline
                                        target="_blank"
                                    >
                                        View Profile
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-secondary text-ellipsis f-s-15 my-4">
                                "Crafting a Path of Knowledge, Innovation,
                                <br/>
                                and Excellence."
                            </p>
                        </div>

                        <div className="profile-content-box d-flex justify-content-between">
                            <div className="profile-details text-center">
                                <p className="f-s-18 mb-0">
                                    <i className="ph-bold ph-clock-countdown"></i>
                                </p>
                                <span className="badge bg-light-primary">
                                    45H
                                </span>
                            </div>
                            <div className="profile-details text-center">
                                <p className="f-s-18 mb-0">
                                    <i className="ph-fill ph-book-bookmark"></i>
                                </p>
                                <span className="badge bg-light-secondary">
                                    10
                                </span>
                            </div>
                            <div className="profile-details text-center">
                                <p className="f-s-18 mb-0">
                                    <i className="ph-fill ph-seal-check"></i>
                                </p>
                                <span className="badge bg-light-success">
                                    2K
                                </span>
                            </div>
                            <div className="profile-details text-center">
                                <p className="f-s-18 mb-0">
                                    <i className="ph-fill ph-user-circle"></i>
                                </p>
                                <span className="badge bg-light-info">
                                    34K
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col md="7" lg="5" xxl="4" className="order--lg-2">
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

            {/*className="order-lg-1"*/}
            <Col  md="6" lg="5" >
                <Card className="courses-progress-card">
                    <CardBody>
                        <div>
                            <h5 className="header-title-text">Courses Progress</h5>
                        </div>

                        <div className="d-flex justify-content-center align-items-center mt-3">
                            <div className="courses-progress-box">
                                {progressData.map((progress) => (
                                    <div key={progress.id} className="courses-progress-label mb-3">
                                        <h6 className="mb-0 text-dark">
                                            <i className={`ph-fill ph-circle f-s-14 ${progress.colorClass} me-2`}></i>
                                            {progress.value}
                                        </h6>
                                        <p className="text-secondary mb-0 ms-4">{progress.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-grow-1">
                                {/*<div id="coursesProgress" className="placeholder-chart"></div>*/}

                                <Chart options={coursesProgress} series={coursesProgress.series} type="donut" height={300} className="placeholder-chart"/>
                            </div>
                        </div>

                        <div className="mt-3">
                            <p className="f-s-16 text-secondary mb-0">
                                <span className="text-success">
                                  86.90%
                                  <i className="ph-bold ph-trend-up ms-2"></i>
                                </span>{' '}
                                More Than Last Month
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </>
    );
};

export default ProfileCards;