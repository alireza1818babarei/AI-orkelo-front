import React from 'react';
import { Card, CardBody, Col, Nav, NavItem, NavLink } from 'reactstrap';
import LectureVideo from "./LectureVideo";



const LectureCard = () => {

    const activityData = [
        {
            id: 1,
            avatar: '/assets/images/avtar/1.png',
            bgClass: 'text-bg-secondary',
            name: 'Earl Klein',
            activity: 'Paused "Fillo Design Sy"',
            time: '2 Week',
            timeClass: 'text-primary',
        },
        {
            id: 2,
            avatar: '/assets/images/avtar/2.png',
            bgClass: 'text-bg-light',
            name: 'Matteo Klein',
            activity: 'Completed "Introduction to Python Programming" course',
            time: '1 Min',
            timeClass: 'text-success',
        },
        {
            id: 3,
            avatar: '/assets/images/avtar/3.png',
            bgClass: 'text-bg-dark',
            name: 'Sam Franco',
            activity: 'Joined "Literature Appreciation Club"',
            time: '4 hours',
            timeClass: 'text-primary',
        },
        {
            id: 4,
            avatar: '/assets/images/avtar/4.png',
            bgClass: 'text-bg-secondary',
            name: 'Steve Waters',
            activity: 'Achieved 90% score in "Advanced Mathematics Quiz"',
            time: '1 week',
            timeClass: 'text-primary',
        },
        {
            id: 5,
            avatar: '/assets/images/avtar/5.png',
            bgClass: 'text-bg-secondary',
            name: 'John Mandela',
            activity: 'Submitted research paper',
            time: '1 Min',
            timeClass: 'text-success',
        },
    ];

    const lectureData = [
        {
            time: "9:00AM",
            course: "Frontend Development",
            bgClass: "bg-light-primary",
            avatars: [
                { src: "/assets/images/avtar/2.png", tooltip: "Sabrina Torres" },
                { count: "10+", tooltip: "10 More" },
            ],
        },
        {
            time: "11:00AM",
            course: "Principles of Economics",
            bgClass: "bg-light-success",
            avatars: [
                { src: "/assets/images/avtar/4.png", tooltip: "Sabrina Torres" },
                { count: "10+", tooltip: "10 More" },
            ],
        },
        {
            time: "1:30PM",
            course: "Organic Chemistry",
            bgClass: "bg-light-secondary",
            avatars: [
                { src: "/assets/images/avtar/5.png", tooltip: "Sabrina Torres" },
                { count: "25+", tooltip: "25 More" },
            ],
        },
        {
            time: "3:30PM",
            course: "World History",
            bgClass: "bg-light-primary",
            avatars: [
                { src: "/assets/images/avtar/1.png", tooltip: "Sabrina Torres" },
                { count: "15+", tooltip: "15 More" },
            ],
        },
        {
            time: "4:00PM",
            course: "Application Software",
            bgClass: "bg-light-dark",
            avatars: [
                { src: "/assets/images/avtar/3.png", tooltip: "Sabrina Torres" },
                { count: "20+", tooltip: "20 More" },
            ],
        },
    ];

    const tabs = [
        { id: "mon", day: "MON", date: "20" },
        { id: "tue", day: "TUE", date: "21", active: true },
        { id: "wed", day: "WED", date: "22" },
        { id: "thu", day: "THU", date: "23" },
        { id: "fri", day: "FRI", date: "24" },
    ];



    return (
        <>
            <Col md="6" lg="3">
                <Card>
                    <CardBody>
                        <h5 className="header-title-text">Recent Activity</h5>

                        <ul className="activity-list mt-3">
                            {activityData.map((activity) => (
                                <li key={activity.id} className="activity-list-item d-flex align-items-start">
                                    <div
                                        className={`h-35 w-35 d-flex justify-content-center align-items-center b-r-10 overflow-hidden ${activity.bgClass} activity-list-avtar me-3`}
                                    >
                                        <img src={activity.avatar} alt={`${activity.name} Avatar`} className="img-fluid" />
                                    </div>

                                    <div className="activity-list-content flex-grow-1">
                                        <h6 className="mb-0">{activity.name}</h6>
                                        <p className="mb-0 text-secondary">{activity.activity}</p>
                                    </div>

                                    <div className="flex-shrink-0 align-self-start">
                                        <p className={`mb-0 ${activity.timeClass} f-s-12`}>{activity.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            </Col>


            <Col md="6" lg="5" xxl="4">
                <Card className="lecture-schedule-card">
                    <CardBody>
                        <h5 className="header-title-text text-nowrap">Today's Lecture Schedule</h5>

                        <div className="lecture-schedule-tab mt-3">
                            <Nav tabs className="p-1">
                                {tabs.map((tab) => (
                                    <NavItem key={tab.id}>
                                        <NavLink
                                            className={`nav-link ${tab.active ? "active" : ""}`}
                                            id={`${tab.id}-lecture-tab`}
                                            role="tab"
                                        >
                                            {tab.day} <span>{tab.date}</span>
                                        </NavLink>
                                    </NavItem>
                                ))}
                            </Nav>

                            <div className="app-timeline lecture-timeline app-scroll">
                                {lectureData.map((lecture, index) => (
                                    <div key={index} className="timeline-text align-items-center">
                                        <p className="mb-0 me-2 timeline-time-text">{lecture.time}</p>

                                        <div className="app-timeline-info-text">
                                            <div className={`lecture-content-box ${lecture.bgClass}`}>
                                                <ul className="avatar-group">
                                                    {lecture.avatars.map((avatar, idx) =>
                                                        avatar.src ? (
                                                            <li
                                                                key={idx}
                                                                className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-primary b-2-light"
                                                                data-bs-toggle="tooltip"
                                                                title={avatar.tooltip}
                                                            >
                                                                <img
                                                                    src={avatar.src}
                                                                    alt={avatar.tooltip}
                                                                    className="img-fluid"
                                                                />
                                                            </li>
                                                        ) : (
                                                            <li
                                                                key={idx}
                                                                className="text-bg-secondary h-25 w-25 d-flex-center b-r-50"
                                                                data-bs-toggle="tooltip"
                                                                title={avatar.tooltip}
                                                            >
                                                                {avatar.count}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                                <p className="f-s-14 f-w-600 mb-0">{lecture.course}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col md="6" lg="4" xxl="5">
                <LectureVideo/>
            </Col>
        </>
    );
};

export default LectureCard;