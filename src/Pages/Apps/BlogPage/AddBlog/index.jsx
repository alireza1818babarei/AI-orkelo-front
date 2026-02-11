
import React, {useEffect, useState} from 'react';

import {Button, Card, CardBody, CardHeader, Col, Container, Form, FormGroup, Label, Row, Input} from "reactstrap";

const AddBlog = () => {
    useEffect(() => {
        $('#editor').trumbowyg({
            btns: [
                ['viewHTML'],
                ['undo', 'redo'],
                ['formatting'],
                ['strong', 'em', 'del'],
                ['superscript', 'subscript'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                ['unorderedList', 'orderedList'],
                ['horizontalRule'],
                ['removeformat'],
                ['fullscreen']
            ],
        });
    }, []);

    $(function() {
        var tooltip_init = {
            init: function () {
                $("button").tooltip();
            }
        };
        tooltip_init.init()
    });

    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const rawFile = e.target.files;
        const selectedFile = rawFile[0];
        if (selectedFile) {
            const fileUrl = URL.createObjectURL(selectedFile);
            setFile(fileUrl);
            setFileName(selectedFile.name);
        }
    };

    return (
        <Container fluid>

            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Add Blog</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">

                                            <span>
                                                <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                                            </span>
                            </a>
                        </li>
                        <li>
                            <a href="#" className="f-s-14 f-w-500">Blog Page</a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Add Blog</a>
                        </li>
                    </ul>
                </Col>
            </Row>
            <Row>
                <Col xl="12">
                    <Card className="add-blog">
                        <CardHeader>
                            <h5>Add Blog</h5>
                        </CardHeader>
                        <CardBody>
                            <Form className="app-form">
                                <Row>
                                    <Col md="6">
                                        <FormGroup className="form-floating">
                                            <Label for="title">Blog Title</Label>
                                            <Input
                                                className="form-control"
                                                type="text"
                                                name="title"
                                                id="title"
                                                placeholder="Blog Title"
                                            />
                                        </FormGroup>
                                        <FormGroup className="form-floating">
                                            <Label for="category">Category</Label>
                                            <Input
                                                className="form-control"
                                                type="select"
                                                name="category"
                                                id="category"
                                            >
                                                <option value="">Select Category</option>
                                                <option value="1">Category One</option>
                                                <option value="2">Category Two</option>
                                                <option value="3">Category Three</option>
                                            </Input>
                                        </FormGroup>
                                        <FormGroup className="form-floating">
                                            <Label for="description">Blog Description</Label>
                                            <Input
                                                className="form-control"
                                                type="textarea"
                                                name="description"
                                                id="description"
                                                placeholder="Type a description here"
                                            />
                                        </FormGroup>
                                        <FormGroup className="form-floating">
                                            <Label for="date">Blog Date</Label>
                                            <Input
                                                className="form-control"
                                                type="date"
                                                name="date"
                                                id="date"
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <FormGroup className="file-uploader">
                                            <Label for="file-input" id="uploaded_image">
                                                <i className="fa-solid fa-cloud-arrow-up me-2 fs-1 mb-3 text-secondary"></i>
                                                <span className="fs-5">Choose a file</span>
                                                <span className="fs-6 text-secondary text-center ms-3 me-3">JPEG, PNG & PDF formats, up to 50MB</span>
                                            </Label>
                                            <Input
                                                className="form-control"
                                                type="file"
                                                id="file-input"
                                                name="file"
                                                accept="image/jpeg, image/png, application/pdf"
                                                onChange={handleFileChange} // Handle file change
                                            />

                                            {file && (
                                                <div>
                                                    <img src={file} alt="preview" className="uploaded-image" style={{ maxWidth: '100%', marginTop: '10px' }} />
                                                    <p>{fileName}</p>
                                                </div>
                                            )}
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xl="12" className="editor-details">
                                        <div id="editor" >
                                            <p>Hello !</p>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="mt-3">
                                        <div className="text-end">
                                            <Button color="primary" type="submit">Add Blog</Button>
                                            <Button color="outline-primary" type="button" className="ms-2">Cancel</Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default AddBlog