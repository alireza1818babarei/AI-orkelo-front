import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
const modules = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'header': [1, 2, 3, false] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean'],
        ['code-block', 'blockquote'],
        ['link', 'image', 'video']
    ]
};
const formats = [
    'bold', 'italic', 'underline', 'strike',
    'script', 'header', 'align',
    'list', 'bullet', 'clean',
    'code-block', 'blockquote',
    'link', 'image', 'video'
];
const TextEditor = () => {
    const [value, setValue] = useState('Hello!');
    return (
        <div className="text-editor-wrapper">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={setValue}
                modules={modules}
                formats={formats}
            />
        </div>
    );
};
export default TextEditor;