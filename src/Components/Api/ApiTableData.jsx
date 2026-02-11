import React, {useEffect, useState} from "react";
import {Button, Card, CardBody, Col, Modal, Row, Table, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input} from "reactstrap";
import {apiData} from "../../Data/Api/Api.js";
import ("../../../public/assets/vendor/datatable/jquery.dataTables.min.css");
import ("../../../public/assets/vendor/datatable/jquery.dataTables.min.js");

const ApiTableData = () => {
    const [apiPageData, setApiPageData] = useState(apiData);
    const [showModal, setShowModal] = useState(false);
    const [apiName, setApiName] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [isKeyGenerated, setIsKeyGenerated] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedApiIndex, setSelectedApiIndex] = useState(null);
    useEffect(() => {
        setTimeout(() => {
            $(document).ready(function () {
                $("#apikeydtatable").DataTable();
            });
        }, 300);
    }, [apiPageData]);

    const generateUUID = () => {
        var d = new Date().getTime();
        if (typeof window.performance !== "undefined" && typeof window.performance.now === "function") {
            d += performance.now(); // Use high-precision timer if available
        }
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
    };

    const handleGenerateKey = () => {
        if (apiName.trim()) {
            setApiKey(generateUUID());
            setIsKeyGenerated(true);
        } else {
            alert("Please enter a valid API Key name.");
        }
    };

    const handleAddApi = () => {
        if (apiName && apiKey) {
            const newApi = {
                // id: generateUUID(),
                avatar: "../assets/images/avtar/1.png",
                avatarBg: "primary",
                name: apiName,
                apiKey,
                date: new Date().toLocaleDateString(),
                email: "example@mail.com",
                parentName: "Parent Example"
            };
            setApiPageData([newApi, ...apiPageData]);
            setApiName("");
            setApiKey("");
            setIsKeyGenerated(false);
            setShowModal(false);
        }
    };

    const handleDeleteClick = (apiId) => {
        setSelectedApiIndex(apiId);
        setDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        setDeleteModal(false);
        setApiPageData((prevData) =>
            prevData.filter((item) => item.id !== selectedApiIndex)
        );
    };

    return (
        <>
            <Col lg={6}>
                <Row>
                    <Col sm={6} className="col-sm-6">
                        <Card className="api-eshop-card">
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6>Total Users</h6>
                                    <div className="dropdown bg-light-primary h-40 w-40 d-flex-center b-r-15">
                                        <i className="ph ph-user-circle-gear f-s-20"></i>
                                    </div>
                                </div>
                                <h3>2564k</h3>
                                <p className="text-success mt-3 f-s-16 f-w-500 mb-0">
                                    <i className="ph-bold  ph-arrow-up-right text-success f-s-20"></i>
                                    92.9%{" "}
                                    <span className="text-secondary f-s-16 f-w-200">
                      users income{" "}
                    </span>
                                </p>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm={6}>
                        <Card className="api-eshop-card">
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6>Members</h6>
                                    <div className="dropdown bg-light-success h-40 w-40 d-flex-center b-r-15">
                                        <i className="ph ph-users-three f-s-20"></i>
                                    </div>
                                </div>
                                <h3>1210k</h3>
                                <p className="text-success mt-3 f-s-16 f-w-500 mb-0">
                                    <i className="ph-bold  ph-arrow-up-right text-success f-s-20"></i>
                                    15.5%{" "}
                                    <span className="text-secondary f-s-16 f-w-200">
                      members income
                    </span>
                                </p>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm={6}>
                        <Card className="api-eshop-card">
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6>Active Now</h6>
                                    <div className="dropdown bg-light-danger h-40 w-40 d-flex-center b-r-15">
                                        <i className="ph ph-check-circle f-s-20"></i>
                                    </div>
                                </div>
                                <h3>416k</h3>
                                <ul className="avatar-group justify-content-start">
                                    <li
                                        className="h-45 w-45 d-flex-center b-r-50 text-bg-danger b-2-light position-relative"
                                        data-bs-toggle="tooltip"
                                        data-bs-title="Sabrina Torres"
                                    >
                                        <span className="position-absolute top-0 start-2 p-1 bg-danger border border-light rounded-circle"></span>
                                        <img
                                            src="/assets/images/avtar/4.png"
                                            alt="Avtar"
                                            className="img-fluid b-r-50 overflow-hidden"
                                        />
                                    </li>
                                    <li
                                        className="h-45 w-45 d-flex-center b-r-50 text-bg-success b-2-light position-relative"
                                        data-bs-toggle="tooltip"
                                        data-bs-title="Sabrina Torres"
                                    >
                                        <span className="position-absolute top-0 start-2 p-1 bg-success border border-light rounded-circle"></span>
                                        <img
                                            src="/assets/images/avtar/1.png"
                                            alt="Avtar"
                                            className="img-fluid b-r-50 overflow-hidden"
                                        />
                                    </li>
                                    <li
                                        className="h-45 w-45 d-flex-center b-r-50 text-bg-warning b-2-light position-relative"
                                        data-bs-toggle="tooltip"
                                        data-bs-title="Sabrina Torres"
                                    >
                                        <span className="position-absolute top-0 start-2 p-1 bg-warning border border-light rounded-circle"></span>
                                        <img
                                            src="/assets/images/avtar/2.png"
                                            alt="Avtar"
                                            className="img-fluid b-r-50 overflow-hidden"
                                        />
                                    </li>
                                    <li
                                        className="h-45 w-45 d-flex-center b-r-50 text-bg-info b-2-light position-relative"
                                        data-bs-toggle="tooltip"
                                        data-bs-title="Sabrina Torres"
                                    >
                                        <span className="position-absolute top-0 start-2 p-1 bg-info border border-light rounded-circle"></span>
                                        <img
                                            src="/assets/images/avtar/3.png"
                                            alt="Avtar"
                                            className="img-fluid b-r-50 overflow-hidden"
                                        />
                                    </li>
                                    <li
                                        className="text-bg-primary h-35 w-35 d-flex-center b-r-50"
                                        data-bs-toggle="tooltip"
                                        data-bs-title="5 More"
                                    >
                                        5+
                                    </li>
                                </ul>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col sm={6} className="col-sm-6">
                        <Card className="api-eshop-card">
                            <CardBody>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6>Developer</h6>
                                    <div className="dropdown bg-light-warning h-40 w-40 d-flex-center b-r-15">
                                        <i className="ph ph-file-arrow-down f-s-20"></i>
                                    </div>
                                </div>
                                <h3 className="mb-3">64</h3>
                                <Button color='primary' className="btn btn-primary" onClick={() => setShowModal(true)}>
                                    Create API
                                </Button>
                            </CardBody>
                        </Card>
                    </Col>{" "}


                    <Col xl={12}>
                        <div className="alert alert-border-info bg-white" role="alert">
                            <h6>
                                <i className="ti ti-info-circle f-s-18 me-2 text-info"></i>
                                Review API Token
                            </h6>
                            <p className="text-secondary">
                                Here is your new api token.This is the only time the token
                                will ever be displayed, so be sure not to lose it!
                            </p>
                            <div className="text-end">
                                <a
                                    href=""
                                    className="link-primary text-d-underline"
                                    data-bs-dismiss="alert"
                                >
                                    Don't allow
                                </a>
                                <a href="" className="link-primary text-d-underline ms-2">
                                    Allow
                                </a>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Col>

            <Col xs={12}>
                <Card>
                    <CardBody className="p-0">
                        <div className="table-responsive app-scroll app-datatable-default">
                            <Table
                                id="apikeydtatable"
                                className="w-100 display apikey-data-table table-bottom-border"
                            >
                                <thead>
                                <tr>
                                    <th>
                                        <div className="checkbox-wrapper">
                                            <label className="check-box m-0">
                                                <input type="checkbox" id="select-all"/>
                                                <span className="checkmark outline-secondary"></span>
                                            </label>
                                        </div>
                                    </th>
                                    <th>Name</th>
                                    <th>Parent Name</th>
                                    <th>API Key</th>
                                    <th>Date</th>
                                    <th>Email</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody id="api_key_body">
                                {(apiPageData || []).map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="checkbox-wrapper">
                                                <label className="check-box m-0">
                                                    <input type="checkbox"/>
                                                    <span className="checkmark outline-secondary"></span>
                                                </label>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className={`h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-${item.avatarBg} me-2`}
                                                >
                                                    <img
                                                        src={item.avatar}
                                                        alt="avatar"
                                                        className="img-fluid"
                                                    />
                                                </div>
                                                {item.name}
                                            </div>
                                        </td>
                                        <td>{item.parentName}</td>
                                        <td>{item.apiKey}</td>
                                        <td>{item.date}</td>
                                        <td>{item.email}</td>

                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-danger icon-btn b-r-4 delete-btn"
                                                id="account_delete"
                                                data-bs-toggle="modal"
                                                // onClick={() => handleDeleteClick()}
                                                onClick={() => handleDeleteClick(item.id)}
                                            >
                                                <i className="ti ti-trash"></i>
                                            </button>
                                            {" "}
                                            <button
                                                type="button"
                                                className="btn btn-success icon-btn b-r-4"
                                            >
                                                <i className="ti ti-edit"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Modal isOpen={showModal} toggle={() => setShowModal(false)} backdrop="static">
                <ModalHeader toggle={() => setShowModal(false)}>Create API</ModalHeader>
                <ModalBody>
                    <Form className="app-form">
                        <FormGroup>
                            <Label for="apiName">API Key Name</Label>
                            <Input
                                type="text"
                                id="apiName"
                                placeholder="Enter API Key Name"
                                value={apiName}
                                onChange={(e) => setApiName(e.target.value)}
                            />
                        </FormGroup>
                        {isKeyGenerated && (
                            <FormGroup>
                                <Label for="generatedApiKey">Generated API Key</Label>
                                <Input type="text" id="generatedApiKey" value={apiKey} readOnly/>
                            </FormGroup>
                        )}
                    </Form>
                </ModalBody>
                <ModalFooter>
                    {!isKeyGenerated ? (
                        <Button color="primary" onClick={handleGenerateKey}>
                            Generate Key
                        </Button>
                    ) : (
                        <Button color="success" onClick={handleAddApi}>
                            Add API
                        </Button>
                    )}
                    <Button color="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} backdrop="static">
                <ModalBody className="text-center">
                    <img src="/assets/images/icons/delete-icon.png" alt="" className="img-fluid"/>
                    <h4 className="text-danger">Are You Sure?</h4>
                    <p>You won't be able to revert this!</p>
                    <Button color="secondary" onClick={() => setDeleteModal(false)}>
                        Close
                    </Button>{" "}
                    <Button color="primary" onClick={handleConfirmDelete}>
                        Yes, Delete it
                    </Button>
                </ModalBody>
            </Modal>
        </>
    );
};

export default ApiTableData;