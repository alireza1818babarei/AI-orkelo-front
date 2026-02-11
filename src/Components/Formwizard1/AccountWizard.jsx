import React, { useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Form,
    FormGroup,
    Input,
    Label,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Col,
    Row,
} from 'reactstrap';

const AccountWizard = () => {
    const [activeTab, setActiveTab] = useState('1');

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };
    return (
        <div>
            <Card>
                <CardHeader>
                    <h5>Create Account Wizards</h5>
                </CardHeader>
                <CardBody>
                    {/* Navigation Tabs */}
                    <Nav pills className="custom-navstpes d-flex" role="tablist">
                        <NavItem className="flex-grow-1 text-center">
                            <NavLink
                                className={activeTab === '1' ? 'active' : ''}
                                onClick={() => toggleTab('1')}
                            >
              <span className="d-flex align-items-center">
                <i className="ti ti-user-circle pe-2"></i>
                <span className="text-start ms-3 custom-title d-flex flex-column">
                  <span className="f-w-500 f-s-16">Personal Info</span>
                  <span className="f-s-14 text-secondary">Enter step 1 details</span>
                </span>
              </span>
                            </NavLink>
                        </NavItem>
                        <NavItem className="flex-grow-1 text-center">
                            <NavLink
                                className={activeTab === '2' ? 'active' : ''}
                                onClick={() => toggleTab('2')}
                            >
              <span className="d-flex align-items-center">
                <i className="ti ti-file-dollar pe-2"></i>
                <span className="text-start ms-3 custom-title d-flex flex-column">
                  <span className="f-w-500 f-s-16">Billing Information</span>
                  <span className="f-s-14 text-secondary">Enter step 2 details</span>
                </span>
              </span>
                            </NavLink>
                        </NavItem>
                        <NavItem className="flex-grow-1 text-center">
                            <NavLink
                                className={activeTab === '3' ? 'active' : ''}
                                onClick={() => toggleTab('3')}
                            >
              <span className="d-flex align-items-center">
                <i className="ti ti-file-check pe-2"></i>
                <span className="text-start ms-3 custom-title d-flex flex-column">
                  <span className="f-w-500 f-s-16">Review Order</span>
                  <span className="f-s-14 text-secondary">Enter step 3 details</span>
                </span>
              </span>
                            </NavLink>
                        </NavItem>
                        <NavItem className="flex-grow-1 text-center">
                            <NavLink
                                className={activeTab === '4' ? 'active' : ''}
                                onClick={() => toggleTab('4')}
                            >
              <span className="d-flex align-items-center">
                <i className="ti ti-checks pe-2"></i>
                <span className="text-start ms-3 custom-title d-flex flex-column">
                  <span className="f-w-500 f-s-16">Order Confirmation</span>
                  <span className="f-s-14 text-secondary">Enter step 4 details</span>
                </span>
              </span>
                            </NavLink>
                        </NavItem>
                    </Nav>

                    {/* Tab Content */}
                    <TabContent activeTab={activeTab} className="mt-3">
                        {/* Tab Pane 1 */}
                        <TabPane tabId="1">
                            <Form>
                                <Row>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username">Cardholder Name</Label>
                                            <Input
                                                type="text"
                                                id="username"
                                                placeholder="Enter Your Cardholder Name"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username11">Last Name</Label>
                                            <Input
                                                type="text"
                                                id="username11"
                                                placeholder="Enter Your Lastname"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username1">Phone Number</Label>
                                            <Input
                                                type="text"
                                                id="username1"
                                                placeholder="Phone Number"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username2">Email Address</Label>
                                            <Input
                                                type="text"
                                                id="username2"
                                                placeholder="Enter Your Email"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="city">Country</Label>
                                            <Input type="select" id="city">
                                                <option>Select Your Country</option>
                                                <option value="1">UK</option>
                                                <option value="2">US</option>
                                                <option value="3">Italy</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="city1">Language</Label>
                                            <Input type="select" id="city1">
                                                <option>Select Your Language</option>
                                                <option value="1">English</option>
                                                <option value="2">Spanish</option>
                                                <option value="3">Italian</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="text-end">
                                    <Button color="primary" size="lg">
                                        Next
                                    </Button>
                                </div>
                            </Form>
                        </TabPane>

                        {/* Tab Pane 2 */}
                        <TabPane tabId="2">
                            <Form>
                                <Row>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username3">Username</Label>
                                            <Input
                                                type="text"
                                                id="username3"
                                                placeholder="Enter Your Username"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username4">Credit/Debit Card Number</Label>
                                            <Input
                                                type="text"
                                                id="username4"
                                                placeholder="Enter Your Card Number"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username5">ZIP Code</Label>
                                            <Input
                                                type="text"
                                                id="username5"
                                                placeholder="ZIP Code"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="text-end">
                                    <Button color="primary" size="lg" className="me-2">
                                        Previous
                                    </Button>
                                    <Button color="primary" size="lg">
                                        Next
                                    </Button>
                                </div>
                            </Form>
                        </TabPane>

                        {/* Tab Pane 3 */}
                        <TabPane tabId="3">
                            <Form>
                                <Row>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username6">Product Name</Label>
                                            <Input
                                                type="text"
                                                id="username6"
                                                placeholder="Enter Product Name"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username7">Quantity</Label>
                                            <Input
                                                type="text"
                                                id="username7"
                                                placeholder="Quantity"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username8">Price per Unit</Label>
                                            <Input
                                                type="text"
                                                id="username8"
                                                placeholder="Enter Price per Unit"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6" className="mb-3">
                                        <FormGroup>
                                            <Label for="username10">Billing Address</Label>
                                            <Input
                                                type="text"
                                                id="username10"
                                                placeholder="Enter Billing Address"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="text-end">
                                    <Button color="primary" size="lg" className="me-2">
                                        Previous
                                    </Button>
                                    <Button color="primary" size="lg">
                                        Next
                                    </Button>
                                </div>
                            </Form>
                        </TabPane>

                        {/* Tab Pane 4 */}
                        <TabPane tabId="4">
                            <div className="completed-contents text-center">
                                <img src="../assets/images/form/done.png" alt="Completed" />
                                <h6 className="mb-0">Thank You!</h6>
                                <p>Your booking is completed</p>
                            </div>
                        </TabPane>
                    </TabContent>
                </CardBody>
            </Card>
        </div>
    );
};

export default AccountWizard;