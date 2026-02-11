import React,{useState} from 'react';
import {Card, CardBody, CardHeader, Col, Modal, ModalBody, ModalHeader, Row, Input,ModalFooter,Button } from "reactstrap";
import FolderCardData from "@/Components/Filemanager/FolderCardData.jsx";
import RecentCardTable from "@/Components/Filemanager/RecentCardTable.jsx";
import {initialCardData} from "@/Data/Filemanager/Filemanager.js";


const CloudTabData = () => {

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState([]);
    const [title, setTitle] = useState('');
    const [cardData, setCardData] = useState(initialCardData);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    const handleRename = () => {
        if (selectedCard && title.trim() !== '') {
            const updatedCardData = cardData.map((card1) =>
                card1.id === selectedCard.id ? { ...card1, title } : card1
            );
            setCardData(updatedCardData);
            setSelectedCard(null);
            setTitle('');
            setModalOpen(false);
        } else {
            alert('Title cannot be empty.');
        }
    };

    const handleEdit = (card1) => {
        setSelectedCard(card1);
        setTitle(card1.title);
        toggleModal();
    };

    const handleDelete = () => {
        if (selectedCard) {
            const updatedCardData = cardData.filter((card1) => card1.id !== selectedCard.id);
            setCardData(updatedCardData);
            setSelectedCard(null);
            setDeleteModalOpen(false);
        }
    };

    const confirmDelete = (card1) => {
        setSelectedCard(card1);
        toggleDeleteModal();
    }


    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Quick-Access</h5>
                </CardHeader>
                <CardBody id="rename_keybody">
                    <Row>
                        {cardData.map((card1) => (
                            <Col key={card1.id} sm={6} xl={4} xxl={3}>
                                <div className="card quick-access">
                                    <CardBody>
                                        <div className="d-flex justify-content-between">
                                            <div className="starreddiv favBtn">
                                                <i
                                                    className={`ph-bold ph-star text-warning f-s-18 fav-icon ${card1.isStarred ? 'active' : ''}`}
                                                ></i>
                                            </div>

                                            <div className="dropdown folder-dropdown">
                                                <a className="" role="button" data-bs-toggle="dropdown" aria-expanded="true">
                                                    <i className="ti ti-dots-vertical"></i>
                                                </a>
                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <a className="dropdown-item view-item-btn">
                                                            <i className="ti ti-file-export text-primary"></i> View
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <Button
                                                            color="text-primary"
                                                            className="dropdown-item edit-folder-list px-3"
                                                            onClick={() => handleEdit(card1)}
                                                        >
                                                            <i className="ti ti-edit text-success"></i> Rename
                                                        </Button>
                                                    </li>
                                                    <li>
                                                        <Button
                                                            color="text-primary"
                                                            className="dropdown-item delete-btn px-3"
                                                            href=""
                                                            onClick={() => confirmDelete(card1)}
                                                            type="button"
                                                        >
                                                            <i className="ti ti-trash text-danger"></i> Delete
                                                        </Button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <span className="d-block text-center mb-3">
                                                     <img src={card1.image} alt="" className="img-fluid" />
                                                     </span>
                                        <p className="text-center f-w-600 mb-0">{card1.title}</p>
                                    </CardBody>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </CardBody>

            </Card>

            {/* Rename Modal */}
            <Modal isOpen={modalOpen} toggle={toggleModal} centered>
                <ModalHeader toggle={toggleModal} className="bg-primary text-white">
                    Folder Rename
                </ModalHeader>
                <ModalBody>
                    <div className="rename-form">
                        <form className="app-form" id="renameForm">
                            <div className="mb-3">
                                <label className="form-label">Folder Name</label>
                                <Input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Title"
                                />
                            </div>
                        </form>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>
                        Close
                    </Button>
                    <Button color="primary" onClick={handleRename}>
                        Save changes
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={deleteModalOpen} toggle={toggleDeleteModal} centered>
                <ModalBody className="text-center">
                    <img
                        src="/images/icons/delete-icon.png"
                        alt="Delete Icon"
                        className="img-fluid mb-3"
                    />
                    <h4 className="text-danger f-w-600">Are You Sure?</h4>
                    <p className="text-secondary f-s-16">You won't be able to revert this!</p>
                    <div className="mt-3">
                        <Button color="secondary" onClick={toggleDeleteModal}>
                            Close
                        </Button>
                        <Button color="primary" onClick={handleDelete}>
                            Yes, Delete it
                        </Button>
                    </div>
                </ModalBody>
            </Modal>

            <FolderCardData/>

            <RecentCardTable />

        </>
    );
};

export default CloudTabData;