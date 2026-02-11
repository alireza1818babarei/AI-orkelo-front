
import React from 'react'
import {Card, CardBody, Col, Container, Row} from "reactstrap";
import CheckoutTabs from "@/Components/Checkout/CheckoutTabs.jsx";
import CheckoutProducts from "@/Components/Checkout/CheckoutProducts.jsx";


const Checkout = () => {

    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Checkout</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                            </a>
                        </li>
                        <li>
                            <a href="#" className="f-s-14 f-w-500">E-shop</a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Checkout</a>
                        </li>
                    </ul>
                </Col>
            </Row>

            <Row>
                <Col lg={8}>
                    <CheckoutTabs/>
                </Col>

                <Col lg={4}>
                    <Card>
                        <CardBody>
                            <CheckoutProducts/>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Checkout;