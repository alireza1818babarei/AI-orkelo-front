import React, { useRef, useState } from 'react';
import {Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label} from 'reactstrap';

const CustomValidation = () => {

    const [formData, setFormData] = useState({
        firstName: 'Mark',
        lastName: 'Otto',
        username: '',
        city: '',
        state: '',
        zip: '',
        termsAgreed: false,
    });

    const formRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formElement = formRef.current;
        if (formElement && !formElement.checkValidity()) {
            e.stopPropagation();
        }

        if (formElement) {
            formElement.classList.add('was-validated');
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Custom Styles</h5>
                </CardHeader>

                <CardBody>
                    <form ref={formRef} onSubmit={handleSubmit} noValidate className="app-form row g-3">

                        <Col md={4}>
                            <FormGroup>
                                <Label for="validationCustom01">First name</Label>
                                <Input
                                    type="text"
                                    id="validationCustom01"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="valid-feedback">Looks good!</div>
                            </FormGroup>
                        </Col>


                        <Col md={4}>
                            <FormGroup>
                                <Label for="validationCustom02">Last name</Label>
                                <Input
                                    type="text"
                                    id="validationCustom02"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="valid-feedback">Looks good!</div>
                            </FormGroup>
                        </Col>


                        <Col md={4}>
                            <FormGroup>
                                <Label for="validationCustomUsername">Username</Label>
                                <div className="input-group has-validation">
                                    <span className="input-group-text" id="inputGroupPrepend">@</span>
                                    <Input
                                        type="text"
                                        id="validationCustomUsername"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        aria-describedby="inputGroupPrepend"
                                        required
                                    />
                                    <div className="invalid-feedback">Please choose a username.</div>
                                </div>
                            </FormGroup>
                        </Col>


                        <Col md={6}>
                            <FormGroup>
                                <Label for="validationCustom03">City</Label>
                                <Input
                                    type="text"
                                    id="validationCustom03"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="invalid-feedback">Please provide a valid city.</div>
                            </FormGroup>
                        </Col>


                        <Col md={3}>
                            <FormGroup>
                                <Label for="validationCustom04">State</Label>
                                <select name="state" id="validationDefault04" required="" className="form-select" defaultValue="option1">
                                    <option value="option1">Choose...</option>
                                    <option value="option2">Option 1</option>
                                    <option value="option3">Option 2</option>
                                </select>
                                <div className="invalid-feedback">Please select a valid state.</div>
                            </FormGroup>
                        </Col>


                        <Col md={3}>
                            <FormGroup>
                                <Label for="validationCustom05">Zip</Label>
                                <Input
                                    type="text"
                                    id="validationCustom05"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="invalid-feedback">Please provide a valid zip.</div>
                            </FormGroup>
                        </Col>


                        <Col md={12}>
                            <div className="form-check d-flex flex-wrap gap-1">
                                <Input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="invalidCheck"
                                    name="termsAgreed"
                                    checked={formData.termsAgreed}
                                    onChange={handleChange}
                                    required
                                />
                                <Label className="form-check-label" for="invalidCheck">
                                    Agree to terms and conditions
                                </Label>
                                <div className="invalid-feedback">You must agree before submitting.</div>
                            </div>
                        </Col>


                        <Col md={12}>
                            <Button color="primary" type="submit">
                                Submit form
                            </Button>
                        </Col>
                    </form>
                </CardBody>

            </Card>
        </>
    );
};

export default CustomValidation;