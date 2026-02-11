
import React, { useState } from 'react'
import {Link} from 'react-router-dom'
import {Container, TabContent, TabPane, Card, CardBody, Nav, NavItem, NavLink, Row, Col} from "reactstrap";
import {developerteamData, marketingteamData, teamMembers} from "@/Data/Team/Teamdata";


const Team = () => {

    const [activeTeamTab, setActiveTeamTab] = useState('1'); // Default active tab is 1

    const toggleTab = (tab) => {
        if (activeTeamTab !== tab) {
            setActiveTeamTab(tab);
        }
    };

    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Team</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"/> Apps
                      </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Team</a>
                        </li>
                    </ul>
                </Col>
            </Row>
            <div className="tab-wrapper">

                <ul className="tabs">
                    <li className={activeTeamTab === '1' ? 'tab-link active' : 'tab-link'} onClick={() => toggleTab('1')}>
                        <i className="ph-duotone  ph-pen-nib f-s-18 me-2"></i>Designer
                    </li>

                    <li className={activeTeamTab === '2' ? 'tab-link active' : 'tab-link'}
                        onClick={() => toggleTab('2')}>
                        <i className="ph-duotone  ph-gear-fine f-s-18 me-2"></i>Development
                    </li>

                    <li className={activeTeamTab === '3' ? 'tab-link active' : 'tab-link'}
                        onClick={() => toggleTab('3')}>
                        <i className="ph-duotone  ph-megaphone f-s-18 me-2"></i>Marketing
                    </li>
                </ul>

            </div>

            <TabContent activeTab={activeTeamTab} className="content-wrapper mt-3">
                <TabPane tabId="1">
                    <Card>
                        <CardBody>
                            <Row>
                                {teamMembers.map((member, index) => (
                                    <Col md={6} xl={4} key={index}>
                                        <Card className="team-box-card hover-effect overflow-hidden">
                                            <div className="team-box">
                                                <img src={member.coverImg} className="card-img-top" alt={member.name}/>
                                            </div>

                                            <div className="team-container">
                                                <div className="team-pic">
                                 <span className="bg-secondary h-80 w-80 d-flex-center b-r-50 position-relative overflow-hidden">
                                   <img src={member.avatarImg} alt={member.name} className="img-fluid b-r-50"/>
                                 </span>
                                                </div>
                                            </div>

                                            <div className="team-content">
                                                <div className="mb-3 mt-3">
                                                    <h5>{member.name}</h5>
                                                    <p>{member.position}</p>
                                                </div>
                                                <div className="team-details">
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <Link to="/apps/projects-page/projects">Projects</Link>
                                                        </p>
                                                        <p className="text-center">{member.projects}</p>
                                                    </div>
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <Link to="/apps/todo">Tasks</Link>
                                                        </p>
                                                        <p className="text-center">{member.tasks}</p>
                                                    </div>
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <a href="#">Position</a>
                                                        </p>
                                                        <p className="text-center">{member.employeeType}</p>
                                                    </div>
                                                </div>
                                                <p className="team-content-list text-muted mb-3">{member.description}</p>
                                                <div className="p-2 mb-3">
                                                    <a href="https://www.facebook.com" className="btn btn-facebook icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-facebook text-white"></i>
                                                    </a>
                                                    <a href="https://twitter.com" className="btn btn-twitter icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-twitter text-white"></i>
                                                    </a>
                                                    <a href="https://www.pinterest.com" className="btn btn-pinterest icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-pinterest text-white"></i>
                                                    </a>
                                                    <a href="https://www.whatsapp.com" className="btn btn-whatsapp icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-whatsapp text-white"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </CardBody>
                    </Card>
                </TabPane>
                <TabPane tabId="2">
                    <Card>
                        <CardBody>
                            <Row>
                                {developerteamData.map((member, index) => (
                                    <Col md={6} xl={4} key={index}>
                                        <Card className="team-box-card hover-effect overflow-hidden">
                                            <div className="team-box">
                                                <img src={member.coverImg} className="card-img-top" alt={member.name}/>
                                            </div>

                                            <div className="team-container">
                                                <div className="team-pic">
                                 <span className="bg-secondary h-80 w-80 d-flex-center b-r-50 position-relative overflow-hidden">
                                   <img src={member.avatarImg} alt={member.name} className="img-fluid b-r-50"/>
                                 </span>
                                                </div>
                                            </div>

                                            <div className="team-content">
                                                <div className="mb-3 mt-3">
                                                    <h5>{member.name}</h5>
                                                    <p>{member.position}</p>
                                                </div>
                                                <div className="team-details">
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <Link to="/apps/projects-page/projects">Projects</Link>
                                                        </p>
                                                        <p className="text-center">{member.projects}</p>
                                                    </div>
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <Link to="/apps/todo">Tasks</Link>
                                                        </p>
                                                        <p className="text-center">{member.tasks}</p>
                                                    </div>
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <a href="#">Position</a>
                                                        </p>
                                                        <p className="text-center">{member.employeeType}</p>
                                                    </div>
                                                </div>
                                                <p className="team-content-list text-muted mb-3">{member.description}</p>
                                                <div className="p-2 mb-3">
                                                    <a href="https://www.facebook.com" className="btn btn-facebook icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-facebook text-white"></i>
                                                    </a>
                                                    <a href="https://twitter.com" className="btn btn-twitter icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-twitter text-white"></i>
                                                    </a>
                                                    <a href="https://www.pinterest.com" className="btn btn-pinterest icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-pinterest text-white"></i>
                                                    </a>
                                                    <a href="https://www.whatsapp.com" className="btn btn-whatsapp icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-whatsapp text-white"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </CardBody>
                    </Card>
                </TabPane>
                <TabPane tabId="3">
                    <Card>
                        <CardBody>
                            <Row>
                                {marketingteamData.map((member, index) => (
                                    <Col md={6} xl={4} key={index}>
                                        <Card className="team-box-card hover-effect overflow-hidden">
                                            <div className="team-box">
                                                <img src={member.coverImg} className="card-img-top" alt={member.name}/>
                                            </div>

                                            <div className="team-container">
                                                <div className="team-pic">
                                 <span className="bg-secondary h-80 w-80 d-flex-center b-r-50 position-relative overflow-hidden">
                                   <img src={member.avatarImg} alt={member.name} className="img-fluid b-r-50"/>
                                 </span>
                                                </div>
                                            </div>

                                            <div className="team-content">
                                                <div className="mb-3 mt-3">
                                                    <h5>{member.name}</h5>
                                                    <p>{member.role}</p>
                                                </div>
                                                <div className="team-details">
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <Link to="/apps/projects-page/projects">Projects</Link>
                                                        </p>
                                                        <p className="text-center">{member.projects}</p>
                                                    </div>
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <Link to="/apps/todo">Tasks</Link>
                                                        </p>
                                                        <p className="text-center">{member.tasks}</p>
                                                    </div>
                                                    <div className="team-contentbox">
                                                        <p className="f-w-500">
                                                            <a href="#">Position</a>
                                                        </p>
                                                        <p className="text-center">{member.position}</p>
                                                    </div>
                                                </div>
                                                <p className="team-content-list text-muted mb-3">{member.description}</p>
                                                <div className="p-2 mb-3">
                                                    <a href="https://www.facebook.com" className="btn btn-facebook icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-facebook text-white"></i>
                                                    </a>
                                                    <a href="https://twitter.com" className="btn btn-twitter icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-twitter text-white"></i>
                                                    </a>
                                                    <a href="https://www.pinterest.com" className="btn btn-pinterest icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-pinterest text-white"></i>
                                                    </a>
                                                    <a href="https://www.whatsapp.com" className="btn btn-whatsapp icon-btn b-r-22 me-2"
                                                       target="_blank" rel="noopener noreferrer">
                                                        <i className="ti ti-brand-whatsapp text-white"></i>
                                                    </a>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </CardBody>
                    </Card>
                </TabPane>
            </TabContent>
        </Container>
    )
}

export default Team