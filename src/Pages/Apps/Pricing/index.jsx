
import React from 'react'
import {Card, CardBody, CardHeader, Button, Row, Col, Container} from 'reactstrap';
import SimplePricingCard from "@/Components/Pricing/SimplePricingCard";
import CustomPricingCard from "@/Components/Pricing/CustomPricingCard";
import ComparePricing from "@/Components/Pricing/ComparePricing";
import PricingCard from "@/Components/Pricing/PricingCard";


const Pricing = () => {
    const plans = [
        {
            plan: 'Basic Plans',
            price: 20,
            yearlyPrice: 80,
            features: [
                '5 Free Websites',
                '1 GB Hard disk Storage',
                '1 field',
                '10 Users',
                'Email Support',
            ],
            imgSrc: '/assets/images/pricing/1.png',
            imgSrcBack: '/assets/images/pricing/9.png',
            bgColor: 'secondary',
        },
        {
            plan: 'Business Plans',
            price: 80,
            yearlyPrice: 100,
            features: [
                '40 Free Websites',
                '20 GB Hard disk Storage',
                '50 fields',
                '30 Users',
                'Email Support',
            ],
            imgSrc: '/assets/images/pricing/2.png',
            imgSrcBack: '/assets/images/pricing/8.png',
            isBest: true,
            bgColor: 'primary',
        },
        {
            plan: 'Premium Plans',
            price: 200,
            yearlyPrice: 500,
            features: [
                'Unlimited Websites',
                '40 GB Hard disk Storage',
                'Unlimited fields',
                '40 Users',
                'Email Support',
            ],
            imgSrc: '/assets/images/pricing/3.png',
            imgSrcBack: '/assets/images/pricing/7.png',
            bgColor: 'secondary',
        },
        {
            plan: 'Golden Premium Plans',
            price: 500,
            yearlyPrice: 1000,
            features: [
                'Unlimited Websites',
                '40 GB Hard disk Storage',
                'Unlimited fields',
                'Unlimited Users',
                'Email Support',
            ],
            imgSrc: '/assets/images/pricing/15.png',
            imgSrcBack: '/assets/images/pricing/14.png',
            isBest: true,
            bgColor: 'primary',
        },
    ];


    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12} >
                    <h4 className="main-title">Pricing</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                    <span>
                      <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                    </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Pricing</a>
                        </li>
                    </ul>
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <Card>
                        <CardHeader>
                            <h5>Pricing Plans</h5>
                        </CardHeader>
                        <CardBody>
                            <Row className="flip-pricing-container app-arrow">
                                {plans.map((plan, index) => (
                                    <PricingCard key={index} {...plan} />
                                ))}
                            </Row>
                        </CardBody>
                    </Card>
                </Col>

                <Col xs={12}>
                    <Card>
                        <CardHeader>
                            <h5>Simple Pricing Plans</h5>
                        </CardHeader>
                        <CardBody>
                            <SimplePricingCard/>
                        </CardBody>
                    </Card>
                </Col>

                <Col xs={12}>
                    <Card>
                        <CardHeader>
                            <h5>Custom Pricing</h5>
                        </CardHeader>
                        <CardBody>
                            <CustomPricingCard/>
                        </CardBody>
                    </Card>
                </Col>

                <Col xs={12}>
                    <Card>
                        <CardHeader>
                            <h5>Compare plans</h5>
                        </CardHeader>
                        <CardBody>
                            <ComparePricing/>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Pricing