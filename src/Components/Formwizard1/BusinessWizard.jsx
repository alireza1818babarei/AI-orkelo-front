import React, { useState } from "react";
import {
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
    Button,
    Row,
    Col,
} from "reactstrap";
import classnames from "classnames";

const BusinessAccountWizards = () => {
    const [activeTab, setActiveTab] = useState("1");

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    return (
        <div className="col-12">
            <Card>
                <CardHeader>
                    <h5>Business Account Wizards</h5>
                </CardHeader>
                <CardBody>
                    <Nav pills className="business-nav d-flex">
                        <NavItem className="flex-grow-1 text-center">
                            <NavLink
                                className={classnames({ active: activeTab === "1" })}
                                onClick={() => toggleTab("1")}
                            >
                                <i className="ph-duotone ph-user-circle-plus"></i>
                                <span className="f-s-18 f-w-500">Create account</span>
                            </NavLink>
                        </NavItem>
                        <NavItem className="flex-grow-1 text-center">
                            <NavLink
                                className={classnames({ active: activeTab === "2" })}
                                onClick={() => toggleTab("2")}
                            >
                                <i className="ph-duotone ph-user-switch"></i>
                                <span className="f-s-18 f-w-500">Personal account</span>
                            </NavLink>
                        </NavItem>
                        <NavItem className="flex-grow-1 text-center">
                            <NavLink
                                className={classnames({ active: activeTab === "3" })}
                                onClick={() => toggleTab("3")}
                            >
                                <i className="ph-duotone ph-credit-card"></i>
                                <span className="f-s-18 f-w-500">Payment method</span>
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <TabContent activeTab={activeTab} className="mt-3">
                        <TabPane tabId="1">
                            <Form>
                                <Row>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Username</Label>
                                            <Input type="text" placeholder="James" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Email Address</Label>
                                            <Input type="email" placeholder="@gmail.com" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Password</Label>
                                            <Input type="password" placeholder="******" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Confirm Password</Label>
                                            <Input type="password" placeholder="******" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Form>
                        </TabPane>

                        <TabPane tabId="2">
                            <Form>
                                <Row>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Contact Number</Label>
                                            <Input type="text" placeholder="+91" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Address</Label>
                                            <Input type="text" placeholder="156/A ..." />
                                        </FormGroup>
                                    </Col>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Address 2</Label>
                                            <Input type="text" placeholder="Apartment, studio, or floor" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">City</Label>
                                            <Input type="text" placeholder="UK" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="4">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">State</Label>
                                            <Input type="select">
                                                <option>Choose...</option>
                                                <option>...</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md="2">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Zip</Label>
                                            <Input type="text" placeholder="xxxxx" maxLength="5" />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Form>
                        </TabPane>

                        <TabPane tabId="3">
                            <Form>
                                <Row>
                                    <Col md="12">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Cardholder Name</Label>
                                            <Input type="text" placeholder="Olaf" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Card Number</Label>
                                            <Input type="text" placeholder="xxxx-xxxx-xxxx-xxxx" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">Expiration Date</Label>
                                            <Input type="text" placeholder="MM/YY" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup>
                                            <Label className="form-label f-w-500">CVC Code</Label>
                                            <Input type="text" placeholder="xxx" />
                                        </FormGroup>
                                    </Col>
                                    <Col md="12" className="text-end">
                                        <Button color="primary">Submit</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </TabPane>
                    </TabContent>
                </CardBody>
            </Card>
        </div>
    );
};

export default BusinessAccountWizards;
