import React, { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';

registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
    FilePondPluginFileValidateSize,
    FilePondPluginImageExifOrientation,
    FilePondPluginFileEncode
);

const UploadProduct = () => {
    const [files, setFiles] = useState([]);

    return (
        <div>
            <FilePond
                files={files}
                allowMultiple={true}
                maxFiles={5}
                onupdatefiles={setFiles}
                labelIdle='<i className="fa-solid fa-cloud-upload fa-fw fs-4"></i> <div className="filepond--label-action text-decoration-none">Upload Your Product Images</div>'
            />
        </div>
    );
}

export default UploadProduct;
