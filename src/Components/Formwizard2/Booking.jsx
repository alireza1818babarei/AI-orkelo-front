import { useState } from 'react';
import {Row, Col, Card, CardBody, Form, FormGroup, Input, Label, CardHeader} from 'reactstrap';

const Booking = () => {

    const [activeTab, setActiveTab] = useState("tabs-1");

    const toggleTab = (tab) => {
        setActiveTab(tab);
    };

    return (
        <>
            <Card>
                <CardHeader className="card-header">
                    <h5>Booking Wizard</h5>
                </CardHeader>
                <CardBody>
                    <Row>
                        {/* Sidebar with steps */}
                        <Col lg="4" className="mb-3">
                            <div className="vertical-tabs">
                                {["tabs-1", "tabs-2", "tabs-3", "tabs-4"].map((tab, index) => (
                                    <div
                                        key={index}
                                        className={`tab ${activeTab === tab ? 'current-tab' : ''}`}
                                        onClick={() => toggleTab(tab)}
                                    >
                                        <div className="d-flex">
                                            <div className="step ms-2">
                                                <i className={`ti ${tab === 'tabs-1' ? 'ti-settings-filled' : tab === 'tabs-2' ? 'ti-calendar-stats' : tab === 'tabs-3' ? 'ti-notebook' : 'ti-checkbox'}`}></i>
                                            </div>
                                            <div className="ps-3">
                                                <h5>{tab === 'tabs-1' ? 'Service' : tab === 'tabs-2' ? 'Date & Time' : tab === 'tabs-3' ? 'Booking Summary' : 'Completed'}</h5>
                                                <span className="text-secondary">Step {index + 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>

                        {/* Tab Contents */}
                        <Col lg="8">
                            <div className="tab-contents-list">
                                {activeTab === "tabs-1" && (
                                        <Form className="app-form">
                                            <Row>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Company Name</Label>
                                                        <Input type="text" className="form-control" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Service</Label>
                                                        <Input type="text" className="form-control" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="12">
                                                    <FormGroup>
                                                        <Label>Company Address</Label>
                                                        <Input type="textarea" className="form-control" rows="2" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Additional Persons</Label>
                                                        <Input type="number" defaultValue="2" className="form-control" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Email</Label>
                                                        <Input type="text" className="form-control-plaintext" value="email@gmail.com" readOnly />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Form>
                                )}

                                {activeTab === "tabs-2" && (
                                        <Form className="app-form">
                                            <Row>
                                                <Col md="6" xl="4">
                                                    <Card className="shadow-none">
                                                        <CardBody>
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input type="radio" name="radio-group1" />
                                                                </Label>
                                                            </FormGroup>
                                                            <div className="text-center">
                                                                <img src="/images/form/19.png" alt="Location 1" />
                                                                <h6 className="tab-heading">Location 1</h6>
                                                                <p className="text-muted">A Global Positioning System, or GPS, satellites orbiting Earth.</p>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </Col>

                                                <Col md="6" xl="4">
                                                    <Card className="shadow-none">
                                                        <CardBody>
                                                            <FormGroup check>
                                                                <Label check>
                                                                    <Input type="radio" name="radio-group1" />
                                                                </Label>
                                                            </FormGroup>
                                                            <div className="text-center">
                                                                <img src="/images/form/20.png" alt="Location 2" />
                                                                <h6 className="tab-heading">Location 2</h6>
                                                                <p className="text-muted">Traditionally, those are the three important factors in buying.</p>
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </Col>

                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Date</Label>
                                                        <Input type="datetime-local" className="form-control" />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="6">
                                                    <FormGroup>
                                                        <Label>Time</Label>
                                                        <Input type="text" className="form-control" placeholder="10:00" readOnly />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </Form>

                                )}

                                {activeTab === "tabs-3" && (
                                        <div className="accordion  app-accordion accordion-light-primary"
                                             id="accordionExample">
                                            <div className="accordion-item">
                                                <h6 className="accordion-header">
                                                    <button className="accordion-button" type="button"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseOne" aria-expanded="true"
                                                            aria-controls="collapseOne">
                                                        Company Details
                                                    </button>
                                                </h6>
                                                <div id="collapseOne" className="accordion-collapse collapse show"
                                                     data-bs-parent="#accordionExample">
                                                    <div className="accordion-body">
                                                        <p className="fw-bold"><i className="ti ti-building-skyscraper"></i> AR
                                                            info</p>
                                                        <address>
                                                            120 Silver Point , <br/> Myriam Estate South
                                                            Carolina, <br/> india
                                                        </address>
                                                        <p>Zip: 456730</p>
                                                        <p>Service : Application</p>
                                                        <p>Email : ar12@gmail.com</p>
                                                        <p>+91 6926578398</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="accordion-item">
                                                <h2 className="accordion-header">
                                                    <button className="accordion-button collapsed" type="button"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target="#collapseTwo" aria-expanded="false"
                                                            aria-controls="collapseTwo">
                                                        Meeting time Details
                                                    </button>
                                                </h2>
                                                <div id="collapseTwo" className="accordion-collapse collapse"
                                                     data-bs-parent="#accordionExample">
                                                    <div className="accordion-body">
                                                        <p><i className="ti ti-calendar-minus me-2"></i>2024-10-1</p>
                                                        <p><i className="ti ti-clock-hour-1 me-2"></i>10:00 am</p>
                                                        <p><i className="ti ti-map-pin me-2"></i>Location 1-(office)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                )}

                                {activeTab === "tabs-4" && (

                                    <div className="completed-contents">
                                        <div className="completbox text-center">
                                            <img src="/images/form/done.png" alt="Completed"/>
                                            <h6>Thank You!</h6>
                                            <p>Your booking is completed.</p>
                                        </div>


                                    </div>

                                )}
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default Booking;