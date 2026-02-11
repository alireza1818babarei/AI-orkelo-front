import React from 'react';
import {Card, CardBody, CardHeader, Col, Row} from "reactstrap";

const PaymentWizard = () => {
    return (
        <div>
            <Card>
                <CardHeader>
                    <h5>Payment Method Wizards</h5>
                </CardHeader>
                <CardBody>
                    <div className="form-wizard">
                        <Row>

                            <Col xl={3} className="mb-3">
                                <div className="nav navstpes flex-column" id="Basic" role="tablist">
                                    <button className="nav-link active" id="v-features-tab" data-bs-toggle="tab"
                                            data-bs-target="#v-features-tab-pane" type="button" role="tab"
                                            aria-controls="v-features-tab-pane" aria-selected="true">
                                        <i className="ti ti-user-circle pe-2"></i>
                                        <span className="ms-3">Create Account</span>
                                    </button>
                                    <button className="nav-link" id="v-history-tab" data-bs-toggle="tab"
                                            data-bs-target="#v-history-tab-pane" type="button" role="tab"
                                            aria-controls="v-history-tab-pane" aria-selected="true">
                                        <i className="ti ti-info-circle pe-2"></i>
                                        <span className="ms-3">Personal Info</span>
                                    </button>
                                    <button className="nav-link" id="v-reviews-tab" data-bs-toggle="tab"
                                            data-bs-target="#v-reviews-tab-pane" type="button" role="tab"
                                            aria-controls="v-reviews-tab-pane" aria-selected="true">
                                        <i className="ti ti-brand-mastercard pe-2"></i>
                                        <span className="ms-3">Payment Method</span>
                                    </button>
                                    <button className="nav-link" id="v-reviews-tab1" data-bs-toggle="tab"
                                            data-bs-target="#v-reviews-tab-pane1" type="button" role="tab"
                                            aria-controls="v-reviews-tab-pane1" aria-selected="true">
                                        <i className="ti ti-checks pe-2"></i>
                                        <span className="ms-3">Confirm order</span>
                                    </button>
                                </div>
                            </Col>
                            <Col xl={9}>
                                <div className="tab-content" id="BasicContent">
                                    <div className="tab-pane fade show active" id="v-features-tab-pane" role="tabpanel"
                                         aria-labelledby="v-features-tab" tabIndex="-1">
                                        <form className="app-form">
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className="mb-3">
                                                        <label className="form-label f-w-500">Username</label>
                                                        <input type="text" className="form-control" placeholder="James"/>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="mb-3">
                                                        <label className="form-label f-w-500">Email Address</label>
                                                        <div>
                                                            <input type="email" className="form-control"
                                                                   placeholder="@gmail.com"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label f-w-500">Password</label>
                                                        <div>
                                                            <input type="password" className="form-control"
                                                                   placeholder="******"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="form-label f-w-500">Confirm Password</label>
                                                        <div>
                                                            <input type="password" className="form-control"
                                                                   placeholder="******"/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="tab-pane" id="v-history-tab-pane" role="tabpanel"
                                         aria-labelledby="v-history-tab" tabIndex="-1">
                                        <form className="row app-form">
                                            <div className="col-12 mb-3">
                                                <label className="form-label f-w-500">Contact Number</label>
                                                <input type="text" className="form-control" placeholder="+91"/>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label f-w-500">Address</label>
                                                <input type="text" className="form-control" placeholder="156/A ..."/>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label f-w-500">Address 2</label>
                                                <input type="text" className="form-control"
                                                       placeholder="Apartment, studio, or floor"/>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label f-w-500">City</label>
                                                <input type="text" className="form-control" placeholder="UK"/>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="inputState" className="form-label f-w-500">State</label>
                                                <select id="inputState" className="form-select" defaultValue="1">
                                                    <option>Choose...</option>
                                                    <option>1</option>
                                                    <option>2</option>
                                                </select>
                                            </div>
                                            <div className="col-md-2 mb-3">
                                                <label htmlFor="inputZip1" className="form-label f-w-500">Zip</label>
                                                <input type="text" className="form-control" placeholder="xxxxx"
                                                       id="inputZip1"
                                                       maxLength="5"/>
                                            </div>
                                            <div className="col-12 mb-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="gridCheck"/>
                                                        <label className="form-check-label f-w-500" htmlFor="gridCheck">
                                                            Check me out
                                                        </label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <div className="tab-pane" id="v-reviews-tab-pane" role="tabpanel"
                                         aria-labelledby="v-reviews-tab" tabIndex="-1">
                                        <div className="custome-radio-list">
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className="card shadow-none">
                                                        <div className="card-body select-content ">
                                                            <div className="mb-3">
                                                                <label className="check-box f-w-500">
                                                                    <input type="radio" name="radio-group1"/>
                                                                        <span
                                                                            className="radiomark outline-secondary"></span>
                                                                        <span
                                                                            className="fs-6">Credit / Debit Card</span>
                                                                </label>
                                                            </div>
                                                            <div>
                                                                <form className="app-form">
                                                                    <div className="row">
                                                                        <div className="col-12">
                                                                            <div className="mb-3">
                                                                                <label className="form-label f-w-500">Cardholder
                                                                                    Name</label>
                                                                                <input type="text"
                                                                                       className="form-control"
                                                                                       placeholder="Olaf"/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <div className="mb-3">
                                                                                <label className="form-label f-w-500">Card
                                                                                    Number</label>
                                                                                <input type="text"
                                                                                       className="form-control"
                                                                                       placeholder="xxxx-xxxx-xxxx-xxx"
                                                                                       required=""/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-6 col-xl-3">
                                                                            <div className="mb-3">
                                                                                <label className="form-label f-w-500">Expiration
                                                                                    Date</label>
                                                                                <input type="text"
                                                                                       className="form-control"
                                                                                       placeholder="pin"/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-6 col-xl-3">
                                                                            <div className="mb-3">
                                                                                <label className="form-label f-w-500">CVC
                                                                                    code</label>
                                                                                <input type="text"
                                                                                       className="form-control"
                                                                                       placeholder="xxx"/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-12">
                                                                            <div className="text-end">
                                                                                <button type="button"
                                                                                        className="btn btn-primary">Submit
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="card shadow-none">
                                                        <div className="card-body select-content ">
                                                            <div className="position-relative">
                                                                <label className="check-box">
                                                                    <input type="radio" name="radio-group1"/>
                                                                        <span
                                                                            className="radiomark outline-secondary position-absolute"></span>
                                                                        <span
                                                                            className="d-flex align-items-center mg-s-25">
                                              <img src="../assets/images/checkbox-radio/logo1.png" className="w-30 h-30"
                                                   alt=""/>
                                              <span className="ms-2">
                                                <span className="fs-6 f-w-500">Visa Card</span>
                                                <span className="d-block text-secondary">Select Visa card payment
                                                  method</span>
                                              </span>
                                            </span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="card shadow-none">
                                                        <div className="card-body select-content ">
                                                            <div className="position-relative">
                                                                <label className="check-box">
                                                                    <input type="radio" name="radio-group1"/>
                                                                        <span
                                                                            className="radiomark outline-secondary position-absolute"></span>
                                                                        <span
                                                                            className="d-flex align-items-center mg-s-25">
                                              <img src="../assets/images/checkbox-radio/logo3.png" className="w-30 h-30"
                                                   alt=""/>
                                              <span className="ms-2">
                                                <span className="fs-6 f-w-500">Paypal</span>
                                                <span className="d-block text-secondary">Select PayPal payment
                                                  method</span>
                                              </span>
                                            </span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tab-pane" id="v-reviews-tab-pane1" role="tabpanel"
                                         aria-labelledby="v-reviews-tab1" tabIndex="-1">
                                        <div className="completed-contents">
                                            <div className="completbox text-center">
                                                <img src="../assets/images/form/done.png" alt=""/>
                                                    <h6 className="mb-0">Thank You !</h6>
                                                    <p>Successfully Completed your order process ! Confirmation will be
                                                        sent your email
                                                    </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default PaymentWizard;