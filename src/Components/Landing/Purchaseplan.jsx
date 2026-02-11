import React from 'react';
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";

const Purchaseplan = () => {
    return (
        <div>
            <Row>
                <div className="col-xl-6 offset-xl-3">
                    <div className="landing-title text-md-center">
                        <h2>Purchase <span className="highlight-title">Plans</span></h2>
                        <p>Include information on how users can navigate your platform, select a plan, and
                            complete the
                            transaction.</p>
                    </div>
                </div>
            </Row>
            <div className="row justify-content-center">
                <Col md={7} xl={8}>
                    <Card className="pricing-cards mb-0">
                        <CardBody>
                            <Row className="align-items-center">
                                <Col md={5} xl={6}>
                                    <div>
                                        <img
                                            src="/assets/images/landing/wallet.png"
                                            className="w-120"
                                            alt="Wallet"
                                        />
                                        <div>
                                            <p className="badge bg-primary f-s-16 mt-3">Basic Plans</p>
                                            <h1 className="text-dark f-w-700 mt-3">$14.00</h1>
                                            <p className="text-secondary txt-ellipsis-3 f-w-500 f-s-16">
                                                Essential features at the best value. Get started today with
                                                our budget-friendly pricing!
                                            </p>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={7} xl={6}>
                                    <div className="pricing-details">
                                        <div className="price-title">
                                            <h3 className="text-dark f-w-600 txt-ellipsis-1">
                                                Basic Plans List
                                            </h3>
                                            <ul className="pricing-list-menu">
                                                <li className="pricing-listitem">
                                                    <i className="ph-bold ph-check text-success me-2"/>
                                                    6 Month support
                                                </li>
                                                <li className="pricing-listitem">
                                                    <i className="ph-bold ph-check text-success me-2"/>
                                                    Single end product use
                                                </li>
                                                <li className="pricing-listitem">
                                                    <i className="ph-bold ph-check text-success me-2"/>
                                                    Future upgrades included
                                                </li>
                                                <li className="pricing-listitem">
                                                    <i className="ph-bold ph-check text-success me-2"/>
                                                    Free for use in end products
                                                </li>
                                            </ul>
                                            <div className="text-center price-btn">
                                                <Button
                                                    href="https://themeforest.net/user/la-themes"
                                                    target="_blank"
                                                    color="dark"
                                                    size="lg"
                                                >
                                                    Buy Plans
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={5} xl={4}>
                    <Card className="pricing-cards active mb-0">
                        <CardBody className="p-0">
                            <div className="pricing-details">
                                <div className="price-title">
                                    <p>Business Plans</p>
                                    <h2>$499.00</h2>
                                    <ul className="pricing-list-menu">
                                        <li className="pricing-listitem text-dark">
                                            <i className="ph-bold ph-check text-success me-2"/>
                                            6 Month support
                                        </li>
                                        <li className="pricing-listitem text-dark">
                                            <i className="ph-bold ph-check text-success me-2"/>
                                            Single end product use
                                        </li>
                                        <li className="pricing-listitem text-dark">
                                            <i className="ph-bold ph-check text-success me-2"/>
                                            Future upgrades included
                                        </li>
                                        <li className="pricing-listitem text-dark">
                                            <i className="ph-bold ph-check text-success me-2"/>
                                            Free for use in end products
                                        </li>
                                    </ul>
                                    <div className="text-center price-btn">
                                        <Button
                                            href="https://themeforest.net/user/la-themes"
                                            target="_blank"
                                            color="primary"
                                            size="lg"
                                        >
                                            Buy Plans
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </div>
        </div>
    );
};

export default Purchaseplan;