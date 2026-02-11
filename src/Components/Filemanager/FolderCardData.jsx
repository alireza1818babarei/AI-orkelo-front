import React, { useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Row,
    Input,
    Button,
} from 'reactstrap';
import {initialfolderData} from "@/Data/Filemanager/Filemanager.js";


const FolderCardData = () => {
    const [modalOpen, setModalOpen] = useState(false); // For renaming
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // For deletion
    const [addModalOpen, setAddModalOpen] = useState(false); // For adding new folders

    const [selectedFolder, setSelectedFolder] = useState(null);
    const [title, setTitle] = useState('');
    const [folders, setFolders] = useState(initialfolderData);

    const [newFolderName, setNewFolderName] = useState('');

    const toggleModal = () => setModalOpen(!modalOpen);
    const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);
    const toggleAddModal = () => setAddModalOpen(!addModalOpen);

    // Handle folder renaming
    const handleRename = () => {
        if (title.trim() === '') {
            alert('Folder name cannot be empty.');
            return;
        }

        const isDuplicate = folders.some(folder => folder.title === title.trim() && folder.id !== selectedFolder.id);
        if (isDuplicate) {
            alert('Folder name already exists.');
            return;
        }

        const updatedFolders = folders.map(folder =>
            folder.id === selectedFolder.id ? { ...folder, title: title.trim() } : folder
        );

        setFolders(updatedFolders);
        resetModalState();
    };

    const handleEdit = (folder) => {
        setSelectedFolder(folder);
        setTitle(folder.title);
        toggleModal();
    };

    // Handle folder deletion
    const handleDelete = () => {
        const updatedFolders = folders.filter(folder => folder.id !== selectedFolder.id);
        setFolders(updatedFolders);
        resetModalState();
    };

    const confirmDelete = (folder) => {
        setSelectedFolder(folder);
        toggleDeleteModal();
    };

    // Reset modal states
    const resetModalState = () => {
        setSelectedFolder(null);
        setTitle('');
        setModalOpen(false);
        setDeleteModalOpen(false);
    };

    // Handle folder addition
    const handleAddFolder = () => {
        if (!newFolderName.trim()) {
            alert('Folder name cannot be empty.');
            return;
        }

        const isDuplicate = folders.some(folder => folder.title === newFolderName.trim());
        if (isDuplicate) {
            alert('Folder name already exists.');
            return;
        }

        const newFolder = {
            id: folders.length + 1,
            title: newFolderName.trim(),
            size: '0 KB',
            maxSize: '500 MB',
            image: '/images/icons/folder.png',
            isStarred: false,
        };

        setFolders([...folders, newFolder]);
        setNewFolderName('');
        toggleAddModal();
    };



    return (
        <>
            <Card>
                <CardHeader>
                    <div className="d-flex align-items-center justify-content-between">
                        <h5>Folders</h5>
                        <Button color="primary" onClick={toggleAddModal}>
                            Create Folder
                        </Button>
                    </div>
                </CardHeader>
                <CardBody>
                    <Row>
                        {folders.map(folder => (
                            <div key={folder.id} className="col-sm-6 col-xl-4 col-xxl-3">
                                <Card>
                                    <CardBody className="folder-card">
                                        <div className="starreddiv favBtn">
                                            <i
                                                className={`ph-bold ph-star text-warning f-s-18 fav-icon ${folder.isStarred ? 'active' : ''}`}
                                            ></i>
                                        </div>

                                        <div className="dropdown folder-dropdown">
                                            <a
                                                className=""
                                                role="button"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="true"
                                            >
                                                <i className="ti ti-dots-vertical"></i>
                                            </a>
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <a className="dropdown-item view-item-btn" href="#">
                                                        <i className="ti ti-file-export text-primary"></i> View
                                                    </a>
                                                </li>
                                                <li>
                                                    <Button
                                                        color="text-primary"
                                                        type="button"
                                                        className="dropdown-item px-3"
                                                        onClick={() => handleEdit(folder)}
                                                    >
                                                        <i className="ti ti-edit text-success"></i> Rename
                                                    </Button>
                                                </li>
                                                <li>
                                                    <Button
                                                        color="text-primary"
                                                        type="button"
                                                        className="dropdown-item px-3"
                                                        onClick={() => confirmDelete(folder)}
                                                    >
                                                        <i className="ti ti-trash text-danger"></i> Delete
                                                    </Button>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="fileimage">
                                            <img src={folder.image} alt="" className="img-fluid" />
                                            <p className="mb-0 f-s-16 text-center">{folder.title}</p>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2">
                                            <p className="text-secondary mb-0 f-w-500">{folder.size}</p>
                                            <p className="text-secondary mb-0 f-w-500 text-end">{folder.maxSize}</p>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        ))}
                    </Row>
                </CardBody>
            </Card>

            {/* Rename Modal */}
            <Modal isOpen={modalOpen} toggle={toggleModal} centered>
                <ModalHeader toggle={toggleModal} className="bg-primary text-white">
                    Rename Folder
                </ModalHeader>
                <ModalBody>
                    <div className="app-form mb-3">
                        <label className="form-label">Folder Name</label>
                        <Input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter new folder name"
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>
                        Close
                    </Button>
                    <Button color="primary" onClick={handleRename}>
                        Save
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModalOpen} toggle={toggleDeleteModal} centered>
                <ModalBody className="text-center">
                    <img src="/images/icons/delete-icon.png" alt="Delete Icon" className="img-fluid mb-3" />
                    <h4 className="text-danger">Are You Sure?</h4>
                    <p className="text-secondary">You won't be able to revert this!</p>
                    <div>
                        <Button color="secondary" onClick={toggleDeleteModal}>
                            Close
                        </Button>
                        <Button color="primary" onClick={handleDelete}>
                            Yes, Delete it
                        </Button>
                    </div>
                </ModalBody>
            </Modal>

            {/* Add Folder Modal */}
            <Modal isOpen={addModalOpen} toggle={toggleAddModal} centered>
                <ModalHeader toggle={toggleAddModal} className="bg-primary text-white">
                    New Folder
                </ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <label className="form-label">Folder Name</label>
                        <Input
                            type="text"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name"
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleAddModal}>
                        Close
                    </Button>
                    <Button color="primary" onClick={handleAddFolder}>
                        Add New Folder
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default FolderCardData;
