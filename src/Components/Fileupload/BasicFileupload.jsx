import React, {useState} from 'react';
import {  Row, Col, Card, CardHeader, CardBody, Form, FormGroup, Label, Input, Button } from 'reactstrap';

const Fileuploads = () => {

    const [fileName, setFileName] = useState('No file chosen, yet.');

    const handleCustomFileUpload = (e) => {
        const fileInput = document.getElementById('real-file');
        fileInput.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName('No file chosen, yet.');
        }
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <h5>Basic File Upload</h5>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col sm="12" xl="6">
                            <Form className="app-form">
                                <FormGroup>
                                    <Label className="mt-2">File Upload</Label>
                                    <Input type="file" className="form-control" />
                                </FormGroup>
                            </Form>
                        </Col>
                        <Col sm="12" xl="6">
                            <FormGroup>
                                <Label className="mt-2">Custom File Upload</Label>
                                <input type="file" id="real-file" hidden onChange={handleFileChange} />
                                <div className="d-flex align-items-center gap-3">
                                    <Button color="primary" onClick={handleCustomFileUpload} className="flex-shrink-0">
                                        Add file
                                    </Button>
                                    <span id="custom-text" className="custom-text">
                        {fileName}
                      </span>
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </div>
    );
};

export default Fileuploads;