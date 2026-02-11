import React from 'react';
import {  Row, Col, Card, CardHeader, CardBody } from 'reactstrap';
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';


const CircleUploader = () => {


    registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Circle File Uploader</h5>
                </CardHeader>
                <CardBody>
                    <Row className="file-uploader-box">
                        <Col className="text-center">
                            <FilePond
                                allowMultiple={false}
                                name="filepond"
                                className="filepond-2 m-auto"
                                acceptedFileTypes={['image/png', 'image/jpeg', 'image/gif']}
                                labelIdle={`<i className="fa-solid fa-cloud-upload fa-fw f-s-60 text-secondary"></i> <div className="filepond--label-action text-decoration-none">Upload Your Image</div>`}
                                imagePreviewHeight={170}
                                imageCropAspectRatio="1:1"
                                imageResizeTargetWidth={100}
                                imageResizeTargetHeight={100}
                                stylePanelLayout="compact circle"
                                styleLoadIndicatorPosition="center bottom"
                                styleProgressIndicatorPosition="right bottom"
                                styleButtonRemoveItemPosition="left bottom"
                                styleButtonProcessItemPosition="right bottom"
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>
    );
};

export default CircleUploader;