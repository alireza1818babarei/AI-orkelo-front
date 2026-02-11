import React, { useEffect, useRef } from 'react';
import { Container, Card, CardHeader, Row, Col, CardBody } from 'reactstrap';
import ChatLeftData from "@/Components/Chat/ChatLeftData";
import ChatContainer from "@/Components/Chat/ChatContainer";

const Chat = () => {
    const chatContainerRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        const handleToggleClick = () => {
            if (chatContainerRef.current) {
                chatContainerRef.current.classList.toggle('chattoggle');
            }
        };

        const handleCloseClick = () => {
            if (chatContainerRef.current) {
                chatContainerRef.current.classList.remove('chattoggle');
            }
        };

        if (toggleButtonRef.current) {
            toggleButtonRef.current.addEventListener('click', handleToggleClick);
        }
        if (closeButtonRef.current) {
            closeButtonRef.current.addEventListener('click', handleCloseClick);
        }

        return () => {
            if (toggleButtonRef.current) {
                toggleButtonRef.current.removeEventListener('click', handleToggleClick);
            }
            if (closeButtonRef.current) {
                closeButtonRef.current.removeEventListener('click', handleCloseClick);
            }
        };
    }, []);

    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Chat</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li>
                            <a href="#" className="f-s-14 f-w-500">
                                <span>
                                  <i className="ph-duotone ph-stack f-s-16"></i> Apps
                                </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Chat</a>
                        </li>
                    </ul>
                </Col>
            </Row>

            <Row className="row position-relative chat-container-box">
                <Col lg="4" xxl="3" className="box-col-5">
                    <div className="chat-div" ref={chatContainerRef}>
                        <Card>
                            <CardHeader>
                                <div className="d-flex align-items-center">
                                    <span className="chatdp h-45 w-45 d-flex-center b-r-50 position-relative bg-danger">
                                        <img
                                            src="/assets/images/avtar/09.png"
                                            alt="User Avatar"
                                            className="img-fluid b-r-50"
                                        />
                                        <span className="position-absolute top-0 end-0 p-1 bg-success border border-light rounded-circle" />
                                    </span>

                                    <div className="flex-grow-1 ps-2">
                                        <div className="fs-6">Ninfa Monaldo</div>
                                        <div className="text-muted f-s-12">Web Developer</div>
                                    </div>

                                    <div>
                                        <div className="btn-group dropdown-icon-none">
                                            <a
                                                role="button"
                                                data-bs-placement="top"
                                                data-bs-toggle="dropdown"
                                                data-bs-auto-close="true"
                                                aria-expanded="false"
                                            >
                                                <i className="ti ti-settings fs-5"></i>
                                            </a>
                                            <ul className="dropdown-menu" data-popper-placement="bottom-start">
                                                <li>
                                                    <a className="dropdown-item" href="#">
                                                        <i className="ti ti-brand-hipchat"></i>{" "}
                                                        <span className="f-s-13">Chat Settings</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" href="#">
                                                        <i className="ti ti-phone-call"></i>{" "}
                                                        <span className="f-s-13">Contact Settings</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" href="#">
                                                        <i className="ti ti-settings"></i>{" "}
                                                        <span className="f-s-13">Settings</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="close-togglebtn">
                                        <button ref={closeButtonRef} className="ms-2 close-toggle btn btn-link">
                                            <i className="ti ti-align-justified fs-5"></i>
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <ChatLeftData />
                            </CardBody>
                        </Card>
                    </div>
                </Col>
                <Col lg="8" xxl="9" className="box-col-7">
                    <ChatContainer />
                </Col>
            </Row>
        </Container>
    );
};

export default Chat;
