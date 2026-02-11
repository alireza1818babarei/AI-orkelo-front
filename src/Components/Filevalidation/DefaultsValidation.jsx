import React , { useState } from 'react';
import {Form, FormGroup, Label, Input, Button, Row, Col, Card, CardHeader, CardBody} from 'reactstrap';

const DefaultsValidation = () => {
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = (e) => {
        setIsChecked(e.target.checked);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Browser Defaults</h5>
                    <p className="text-secondary">Not interested in custom validation feedback messages or writing
                        JavaScript to change form
                        behaviors? All good, you can use the browser defaults. Try submitting the form below. Depending
                        on
                        your browser and OS, you’ll see a slightly different style of feedback.
                        While these feedback styles cannot be styled with CSS, you can still customize the feedback text
                        through JavaScript.</p>
                </CardHeader>

                <CardBody>
                    <Form className="row g-3 app-form">
                        <Col md={4}>
                            <FormGroup>
                                <Label for="validationDefault01">First name</Label>
                                <Input type="text" name="firstName" id="validationDefault01" required/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                        <FormGroup>
                                    <Label for="validationDefault02">Last name</Label>
                                    <Input type="text" name="lastName" id="validationDefault02" required />
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup>
                                    <Label for="validationDefaultUsername">Username</Label>
                                    <div className="input-group">
                                        <span className="input-group-text" id="inputGroupPrepend2">@</span>
                                        <Input type="text" name="username" id="validationDefaultUsername" aria-describedby="inputGroupPrepend2" required />
                                    </div>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="validationDefault03">City</Label>
                                    <Input type="text" name="city" id="validationDefault03" required />
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="validationDefault04">State</Label>
                                    <Input
                                        type="select"
                                        name="state"
                                        id="validationDefault04"
                                        required
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Choose...</option>
                                        <option value="option1">Option 1</option>
                                        <option value="option2">Option 2</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={3}>
                                <FormGroup>
                                    <Label for="validationDefault05">Zip</Label>
                                    <Input type="text" name="zip" id="validationDefault05" required />
                                </FormGroup>
                            </Col>
                            <Col md={12}>
                                <div className="form-check d-flex gap-1">
                                    <div className="form-check d-flex gap-1">
                                        <Input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="invalidCheck2"
                                            checked={isChecked}
                                            onChange={handleCheckboxChange}
                                            required
                                        />
                                        <label className="form-check-label" htmlFor="invalidCheck2">
                                            Agree to terms and conditions
                                        </label>
                                    </div>
                                </div>
                            </Col>
                        <Col md={12} className="text-end">
                            <Button color="primary" type="submit">Submit form</Button>
                        </Col>
                    </Form>
                </CardBody>

            </Card>
        </>
    );
};

export default DefaultsValidation;