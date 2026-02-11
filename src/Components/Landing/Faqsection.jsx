import React from 'react';
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";

const Faqsection = () => {
    return (
        <div>
            <Container>
                <Row>
                    <div className="col-xl-6 offset-xl-3">
                        <div className="landing-title text-md-center">
                            <h2>Inquired <span className="highlight-title"> Queries</span></h2>
                            <p className="text-light">After reading the instructions, I had a few inquired queries about the process
                                and decided to reach out
                                to customer support for clarification.</p>
                        </div>
                    </div>
                </Row>

                <Row className="align-items-center">
                    <Col lg={4}>
                        <Row>
                            {/* Digitize Your Documents Card */}
                            <Col lg="12" sm="6" className="mb-3">
                                <Card className="card-boxs">
                                    <CardBody>
                                        <div className="icon-boxs">
                                            <i className="ti ti-book-2" />
                                        </div>
                                        <div className="box-content">
                                            <h4>Digitize Your Documents</h4>
                                            <p>Efficiently Arranged and Current</p>
                                            <Button
                                                color="primary"
                                                target="_blank"
                                                href="https://phpstack-1384472-5121645.cloudwaysapps.com/document/react/ra-admin/"
                                            >
                                                Check Document
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Committed Assistance Card */}
                            <Col lg="12" sm="6">
                                <Card className="card-boxs">
                                    <CardBody>
                                        <div className="icon-boxs">
                                            <i className="ti ti-headphones" />
                                        </div>
                                        <div className="box-content">
                                            <h4>Committed Assistance</h4>
                                            <p>Require assistance? Send us a ticket. We're here to help!</p>
                                            <Button
                                                color="primary"
                                                target="_blank"
                                                href="mailto:teqlathemes@gmail.com"
                                            >
                                                Get Support
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={8}>
                        <div className="landing-accordion">
                            <div
                                className="accordion app-accordion accordion-flush accordion-light-dark app-accordion-plus"
                                id="nestingExample">
                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button" type="button" data-bs-toggle="collapse"
                                                data-bs-target="#nestingcollapseOne" aria-expanded="true"
                                                aria-controls="nestingcollapseOne">
                                            What is the role of an admin??
                                        </button>
                                    </h2>
                                    <div id="nestingcollapseOne" className="accordion-collapse collapse show"
                                         data-bs-parent="#nestingExample">
                                        <div className="accordion-body">
                                            <p>Admins are responsible for managing and overseeing the smooth
                                                operation of a
                                                system, platform,
                                                or organization.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#nestingcollapseTwo" aria-expanded="false"
                                                aria-controls="nestingcollapseTwo">
                                            How do I add or remove users?
                                        </button>
                                    </h2>
                                    <div id="nestingcollapseTwo" className="accordion-collapse collapse"
                                         data-bs-parent="#nestingExample">
                                        <div className="accordion-body">
                                            <p>
                                                Depending on the system, user management can usually be done through
                                                the
                                                admin dashboard. Look
                                                for the <strong>"User Management"</strong> or <strong>"Admin
                                                Settings"</strong> section, where
                                                you can add or remove users and
                                                assign roles.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#nestingcollapseFour" aria-expanded="false">
                                            What security measures should I implement?
                                        </button>
                                    </h2>
                                    <div id="nestingcollapseFour" className="accordion-collapse collapse"
                                         data-bs-parent="#nestingExample">
                                        <div className="accordion-body">
                                            <p>
                                                Admins should prioritize security by enforcing strong password
                                                policies,
                                                implementing two-factor
                                                authentication, regularly updating software, and monitoring system
                                                logs for
                                                any suspicious
                                                activities.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#nestingcollapseFive" aria-expanded="false">
                                            How can I troubleshoot common issues?
                                        </button>
                                    </h2>
                                    <div id="nestingcollapseFive" className="accordion-collapse collapse"
                                         data-bs-parent="#nestingExample">
                                        <div className="accordion-body">
                                            <p>
                                                Document and follow a systematic approach to troubleshooting. Check
                                                error
                                                logs, consult
                                                documentation, and involve relevant stakeholders if needed.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#nestingcollapseSix" aria-expanded="false">
                                            How can I stay informed about updates and patches?
                                        </button>
                                    </h2>
                                    <div id="nestingcollapseSix" className="accordion-collapse collapse"
                                         data-bs-parent="#nestingExample">
                                        <div className="accordion-body">
                                            <p>
                                                Subscribe to official newsletters, forums, or mailing lists related
                                                to the
                                                software or system
                                                you're administering. Regularly check the official website for
                                                announcements
                                                and security
                                                patches. Stay informed about the latest industry trends and best
                                                practices.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#nestingcollapseSeven" aria-expanded="false">
                                            What is the process for system upgrades?
                                        </button>
                                    </h2>
                                    <div id="nestingcollapseSeven" className="accordion-collapse collapse"
                                         data-bs-parent="#nestingExample">
                                        <div className="accordion-body">
                                            <p>
                                                Before upgrading, thoroughly review release notes, test the upgrade
                                                in a
                                                non-production
                                                environment, and ensure compatibility with existing plugins or
                                                integrations.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse"
                                                data-bs-target="#nestingcollapseEight" aria-expanded="false">
                                            How do I handle user access permissions?
                                        </button>
                                    </h2>
                                    <div id="nestingcollapseEight" className="accordion-collapse collapse"
                                         data-bs-parent="#nestingExample">
                                        <div className="accordion-body">
                                            <p>
                                                Website design projects can vary depending on their scale and
                                                complexity—making it hard to
                                                generalize about project timelines. Ideally, a typical website
                                                design
                                                project should take
                                                between 6 and 12 weeks.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                </Row>
            </Container>
        </div>
    );
};

export default Faqsection;