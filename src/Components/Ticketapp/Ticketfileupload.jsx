import React from 'react';
import {Card, CardBody, CardHeader} from "reactstrap";
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
registerPlugin(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
    FilePondPluginFileEncode,
    FilePondPluginFileValidateSize,
    FilePondPluginImageExifOrientation
);

const Ticketfileupload = () => {
    return (
        <div>
            <Card>
                <CardHeader>
                    <h5>File Upload</h5>
                </CardHeader>
                <CardBody>
                    {/* FilePond Input */}
                    <FilePond
                        allowMultiple={true}
                        maxFiles={5}
                        acceptedFileTypes={['image/jpeg', 'image/png', 'application/pdf']}
                        maxFileSize="50MB"
                        labelIdle={`
            <i className="fa-solid fa-cloud-arrow-up me-2 f-s-30 mb-3 text-primary"></i>
            <p className="f-s-18">Choose a file</p>
            <p className="f-s-14 text-secondary text-center pe-3 ps-3">JPEG, PNG & PDF formats, up to 50MB</p>
            <p className="btn btn-lg file-btn btn-primary mt-3 f-s-14">Choose a Files</p>
          `} className="ticket-file-upload app-file-upload"
                    />

                    {/* File Upload Buttons */}
                    <div className="file-upload-btn mt-3">
                        <div className="d-flex">
            <span className="bg-danger h-40 w-40 d-flex align-items-center justify-content-center rounded-circle me-3 heartBtn">
              <i className="ph ph-google-drive-logo f-s-18"></i>
            </span>
                            <span className="bg-success h-40 w-40 d-flex align-items-center justify-content-center rounded-circle me-3 heartBtn">
              <i className="ph-bold ph-folder f-s-18"></i>
            </span>
                        </div>
                        <div>
            <span className="bg-warning h-40 w-40 d-flex align-items-center justify-content-center rounded-circle me-3 heartBtn">
              <i className="ph ph-file-arrow-down f-s-18"></i>
            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default Ticketfileupload;