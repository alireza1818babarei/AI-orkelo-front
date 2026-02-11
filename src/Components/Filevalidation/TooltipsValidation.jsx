import React, { useState } from 'react';
import {Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label, Row, FormFeedback,} from 'reactstrap';

const TooltipsValidation = () => {
    const [errors, setErrors] = useState({
        userName: '',
        email: '',
        password: '',
        address: '',
        address2: '',
        city: '',
        zipCode: '',
    });

    const validate = () => {
        const newErrors = {};
        // Example validation rules
        newErrors.userName = !document.getElementById('userName').value ? 'User Name is required' : '';
        newErrors.email = !document.getElementById('email').value ? 'Email is required' : '';
        newErrors.password = !document.getElementById('password').value ? 'Password is required' : '';
        newErrors.address = !document.getElementById('address').value ? 'Address is required' : '';
        newErrors.city = !document.getElementById('city').value ? 'City is required' : '';
        newErrors.zipCode = !document.getElementById('zipCode').value ? 'Zip Code is required' : '';
        setErrors(newErrors);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        validate();
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Tooltips</h5>
                    <p className="text-secondary">
                        If your form layout allows it, you can swap the SP <span className="text-danger">.{`valid|invalid`}-feedback</span> classes for
                        <span className="text-danger">.{`valid|invalid`}-tooltip</span> classes to display validation feedback in a styled tooltip.
                        Ensure the parent has <span className="text-danger">position: relative</span> for tooltip positioning.
                    </p>
                </CardHeader>

                <CardBody>
                    <Form className="row g-3 app-form" id="form-validation" onSubmit={handleSubmit}>

                            <Col md="6">
                                <FormGroup style={{ position: 'relative' }}>
                                    <Label for="userName">User Name</Label>
                                    <Input
                                        type="text"
                                        id="userName"
                                        invalid={!!errors.userName}
                                    />
                                    <FormFeedback tooltip>{errors.userName}</FormFeedback>
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup style={{ position: 'relative' }}>
                                    <Label for="email">Email</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        invalid={!!errors.email}
                                    />
                                    <FormFeedback tooltip>{errors.email}</FormFeedback>
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup style={{ position: 'relative' }}>
                                    <Label for="password">Password</Label>
                                    <Input
                                        type="password"
                                        id="password"
                                        invalid={!!errors.password}
                                    />
                                    <FormFeedback tooltip>{errors.password}</FormFeedback>
                                </FormGroup>
                            </Col>
                            <Col md="6">
                                <FormGroup style={{ position: 'relative' }}>
                                    <Label for="address">Address</Label>
                                    <Input
                                        type="text"
                                        id="address"
                                        placeholder="1234 Main St"
                                        invalid={!!errors.address}
                                    />
                                    <FormFeedback tooltip>{errors.address}</FormFeedback>
                                </FormGroup>
                            </Col>
                            <Col md="5">
                                <FormGroup style={{ position: 'relative' }}>
                                    <Label for="address2">Address 2</Label>
                                    <Input
                                        type="text"
                                        id="address2"
                                        placeholder="Apartment, studio, or floor"
                                        invalid={!!errors.address2}
                                    />
                                    <FormFeedback tooltip>{errors.address2}</FormFeedback>
                                </FormGroup>
                            </Col>
                            <Col md="5">
                                <FormGroup style={{ position: 'relative' }}>
                                    <Label for="city">City</Label>
                                    <Input
                                        type="text"
                                        id="city"
                                        invalid={!!errors.city}
                                    />
                                    <FormFeedback tooltip>{errors.city}</FormFeedback>
                                </FormGroup>
                            </Col>
                            <Col md="2">
                                <FormGroup style={{ position: 'relative' }}>
                                    <Label for="zipCode">Zip</Label>
                                    <Input
                                        type="text"
                                        id="zipCode"
                                        invalid={!!errors.zipCode}
                                    />
                                    <FormFeedback tooltip>{errors.zipCode}</FormFeedback>
                                </FormGroup>
                            </Col>
                            <Col xs="12">
                                <FormGroup check className="d-flex gap-1">
                                    <Input type="checkbox" id="gridCheck" />
                                    <Label for="gridCheck" check>Check me out</Label>
                                </FormGroup>
                            </Col>
                            <Col xs="12" className="text-end">
                                <Button type="submit" color="primary" className="mt-3">Submit form</Button>
                            </Col>
                    </Form>
                </CardBody>
            </Card>
        </>
    );
};

export default TooltipsValidation;
