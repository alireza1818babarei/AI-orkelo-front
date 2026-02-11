import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Button,
    Input,
    Table,
    CardBody,
} from 'reactstrap';
import {Link} from 'react-router-dom'
import {initialrecentData} from "@/Data/Filemanager/Filemanager.js";


const RecentCardTable = () => {
    const [files, setFiles] = useState(initialrecentData);
    const [currentFile, setCurrentFile] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    const toggleAddModal = () => setIsAddModalOpen(!isAddModalOpen);
    const toggleRenameModal = () => setIsRenameModalOpen(!isRenameModalOpen);
    const toggleDeleteModal = () => setIsDeleteModalOpen(!isDeleteModalOpen);

    const handleAddFile = () => {
        if (!newFileName.trim()) {
            alert('File name cannot be empty');
            return;
        }

        const isDuplicate = files.some(file => file.name === newFileName.trim());
        if (isDuplicate) {
            alert('File name already exists');
            return;
        }

        const newFile = {
            id: files.length + 1,
            name: newFileName.trim(),
            totalItems: 0,
            size: '0 KB',
            icon: '/images/icons/folder.png', // use image instead of icon
            lastModified: new Date().toISOString().split('T')[0],
        };

        setFiles([...files, newFile]);
        setNewFileName('');
        toggleAddModal();
    };

    const openRenameModal = (file) => {
        setCurrentFile(file);
        setNewFileName(file.name);
        toggleRenameModal();
    };

    const handleRenameFile = () => {
        if (!newFileName.trim()) {
            alert('File name cannot be empty');
            return;
        }

        const isDuplicate = files.some(file => file.name === newFileName.trim() && file.id !== currentFile.id);
        if (isDuplicate) {
            alert('File name already exists');
            return;
        }

        const updatedFiles = files.map(file =>
            file.id === currentFile.id ? { ...file, name: newFileName.trim() } : file
        );

        setFiles(updatedFiles);
        setCurrentFile(null);
        setNewFileName('');
        toggleRenameModal();
    };

    const openDeleteModal = (file) => {
        setCurrentFile(file);
        toggleDeleteModal();
    };

    const handleDeleteFile = () => {
        const updatedFiles = files.filter(file => file.id !== currentFile.id);
        setFiles(updatedFiles);
        setCurrentFile(null);
        toggleDeleteModal();
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="d-flex gap-2 justify-content-between flex-sm-row flex-column">
                        <h5>Recent Added</h5>
                        <Button color="primary" onClick={toggleAddModal}>Create File</Button>
                    </div>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="table-responsive">
                        <Table id="recentdatatable" className="table table-bottom-border recent-table align-middle table-hover mb-0">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Total Items</th>
                                <th>Size</th>
                                <th>Last Modified</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {files.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div>
                                            <img src={item.icon} className="w-20 h-20" alt="file-icon" /> {/* Updated to image */}
                                            <span className="ms-2 table-text">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-success f-w-500">{item.totalItems}</td>
                                    <td>{item.size}</td>
                                    <td className="text-danger f-w-500">{item.lastModified}</td>
                                    <td className="d-flex">
                                        <div className="dropdown folder-dropdown">
                                            <a className="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="true">
                                                <i className="ti ti-dots-vertical"></i>
                                            </a>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <Link className="dropdown-item view-item-btn" href="/apps/file-manager">
                                                        <i className="ti ti-file-export text-primary me-2"></i>
                                                        View
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Button className="dropdown-item edit-folder-name px-3" color="link" onClick={() => openRenameModal(item)}>Rename</Button>
                                                </li>
                                                <li>
                                                    <Button className="dropdown-item delete-btn text-danger px-3" color="link" onClick={() => openDeleteModal(item)}>Delete</Button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="starreddiv favBtn ms-3">
                                            <i className="ph-bold ph-star text-warning f-s-18 star-icon"></i>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                </CardBody>

                <div className="card-footer">
                    <div className="seller-table-footer d-flex gap-2 justify-content-between align-items-center">
                        <p className="text-secondary text-truncate">Showing 1 to 6 of 24 order entries</p>
                        <ul className="pagination app-pagination">
                            <li className="page-item bg-light-secondary disabled">
                                <a className="page-link b-r-left">Previous</a>
                            </li>
                            <li className="page-item"><a className="page-link" href="#">1</a></li>
                            <li className="page-item active" aria-current="page">
                                <a className="page-link" href="#">2</a>
                            </li>
                            <li className="page-item"><a className="page-link" href="#">3</a></li>
                            <li className="page-item page-next">
                                <a className="page-link" href="#">Next</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Add File Modal */}
            <Modal isOpen={isAddModalOpen} toggle={toggleAddModal} centered>
                <ModalHeader toggle={toggleAddModal}>New File</ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        placeholder="Enter file name"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleAddModal}>Close</Button>
                    <Button color="primary" onClick={handleAddFile}>Add File</Button>
                </ModalFooter>
            </Modal>

            {/* Rename File Modal */}
            <Modal isOpen={isRenameModalOpen} toggle={toggleRenameModal} centered>
                <ModalHeader toggle={toggleRenameModal}>Rename File</ModalHeader>
                <ModalBody>
                    <Input
                        type="text"
                        placeholder="Enter new file name"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleRenameModal}>Close</Button>
                    <Button color="primary" onClick={handleRenameFile}>Save Changes</Button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal} centered>
                <ModalBody className="text-center">
                    <p className="text-danger">Are you sure you want to delete this file?</p>
                    <div>
                        <Button color="secondary" onClick={toggleDeleteModal}>Cancel</Button>{" "}
                        <Button color="primary" onClick={handleDeleteFile}>Delete</Button>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
};

export default RecentCardTable;
