import {chatmessages} from '../../Data/Chat/ChatData';
import React, {useState} from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    InputGroup,
    Input,
    Modal,
    ModalBody,
    Row,
    Col,
    Tooltip
} from 'reactstrap';
import {Link} from 'react-router-dom'


function ChatContainer() {
    const [callModal, setCallModal] = React.useState(false);
    const [videoModal, setVideoModal] = React.useState(false);

    const toggleCallModal = () => setCallModal(!callModal);
    const toggleVideoModal = () => setVideoModal(!videoModal);

    const [tooltipOpen, setTooltipOpen] = React.useState({
        emoji: false,
        microphone: false,
        camera: false,
        paperclip: false,
    });

    const toggleTooltip = (name) => {
        setTooltipOpen((prevState) => ({...prevState, [name]: !prevState[name]}));
    };


    return (
        <>

                <Card className="chat-container-content-box">
                    <CardHeader>
                        <div className="chat-header d-flex align-items-center">
                            {/* Mobile Toggle Button */}
                            <div className="d-lg-none me-3">
                                <Button className="toggle-btn" color="link">
                                    <i className="ti ti-align-justified"></i>
                                </Button>
                            </div>

                            {/* Profile Section */}
                            <Link to="/apps/profile-page/profile">
          <span className="profileimg h-45 w-45 d-flex-center b-r-50 position-relative bg-light">
            <img
                src="/assets/images/avtar/14.png"
                alt=""
                className="img-fluid b-r-50"
            />
            <span className="position-absolute top-0 end-0 p-1 bg-success border border-light rounded-circle"></span>
          </span>
                            </Link>

                            <div className="flex-grow-1 ps-2 pe-2">
                                <div className="fs-6">Jerry Ladies</div>
                                <div className="text-muted f-s-12 text-success">Online</div>
                            </div>

                            {/* Call Button */}
                            <Button
                                color="success"
                                className="h-45 w-45 icon-btn b-r-22 me-sm-2"
                                onClick={toggleCallModal}
                            >
                                <i className="ti ti-phone-call f-s-20"></i>
                            </Button>

                            {/* Call Modal */}
                            <Modal isOpen={callModal} toggle={toggleCallModal} centered>
                                <ModalBody className="p-0">
                                    <div className="call">
                                        <div className="call-div">
                                            <img src="/images/profile-app/32.jpg" className="w-100" alt=""/>
                                            <div className="call-caption">
                                                <h2 className="text-white">Jerry Ladies</h2>
                                                <div className="d-flex justify-content-center">
                    <span
                        className="bg-success h-40 w-40 d-flex-center b-r-50 call-btn pointer-events-auto"
                        onClick={toggleCallModal}
                    >
                      <i className="ti ti-phone-call"></i>
                    </span>
                                                    <span
                                                        className="bg-danger h-40 w-40 d-flex-center b-r-50 ms-4 call-btn pointer-events-auto"
                                                        onClick={toggleCallModal}
                                                    >
                      <i className="ti ti-phone"></i>
                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ModalBody>
                            </Modal>

                            {/* Video Button */}
                            <Button
                                color="primary"
                                className="h-45 w-45 icon-btn b-r-22 me-sm-2"
                                onClick={toggleVideoModal}
                            >
                                <i className="ti ti-video f-s-20"></i>
                            </Button>

                            {/* Video Modal */}
                            <Modal isOpen={videoModal} toggle={toggleVideoModal} centered>
                                <ModalBody className="p-0">
                                    <div className="call">
                                        <div className="call-div pointer-events-auto">
                                            <img src="/images/profile-app/25.jpg" className="w-100" alt=""/>
                                            <div className="call-caption">
                                                <div className="d-flex justify-content-center align-items-center">
                    <span className="bg-white h-35 w-35 d-flex-center b-r-50 ms-4">
                      <i className="ti ti-microphone text-dark"></i>
                    </span>
                                                    <span
                                                        className="bg-danger h-45 w-45 d-flex-center b-r-50 ms-4 call-btn pointer-events-auto"
                                                        onClick={toggleVideoModal}
                                                    >
                      <i className="ti ti-phone"></i>
                    </span>
                                                    <span className="bg-white h-35 w-35 d-flex-center b-r-50 ms-4">
                      <i className="ti ti-phone-pause text-dark"></i>
                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="video-div">
                                            <img src="/images/profile-app/31.jpg" className="w-100 rounded"
                                                 alt=""/>
                                        </div>
                                    </div>
                                </ModalBody>
                            </Modal>

                            {/* Settings Dropdown */}
                            <button className="btn btn-secondary h-45 w-45 icon-btn b-r-22 me-sm-2"
                                    data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false">
                                <i className="ti ti-settings f-s-20"></i>
                            </button>
                            <ul className="dropdown-menu" data-popper-placement="bottom-start">
                                <li><a className="dropdown-item" href="#"><i className="ti ti-brand-hipchat"></i> <span
                                    className="f-s-13">Chat Settings</span></a>
                                </li>
                                <li><a className="dropdown-item" href="#"><i className="ti ti-phone-call"></i> <span
                                    className="f-s-13">Contact Settings</span></a>
                                </li>
                                <li><a className="dropdown-item" href="#"><i className="ti ti-settings"></i> <span
                                    className="f-s-13">Settings</span></a>
                                </li>
                            </ul>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="chat-container">
                            <div className="text-center">
                                <span className="badge text-light-secondary">Today</span>
                            </div>

                            {chatmessages.map((chat) => (
                                <Col key={chat.id} xs="12" className="position-relative">
                                    {/* Left aligned chat */}
                                    {chat.position === 'left' ? (
                                        <>
                                            <div className="chatdp h-45 w-45 b-r-50 position-absolute start-0 bg-light">
                                                <img src={chat.avatar} alt="Avatar" className="img-fluid b-r-50"/>
                                            </div>
                                            <div className="chat-box">
                                                <div>
                                                    <p className="chat-text">{chat.message}</p>
                                                    <p className="text-muted">
                                                        <i className="ti ti-checks text-primary"></i> {chat.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* Right aligned chat */
                                        <>
                                            <div className="chat-box-right">
                                                <div>
                                                    <p className="chat-text">{chat.message}</p>
                                                    <p className="text-muted">
                                                        <i className="ti ti-checks text-primary"></i> {chat.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className="chatdp h-45 w-45 b-r-50 position-absolute end-0 top-0 bg-danger">
                                                <img src={chat.avatar} alt="Avatar" className="img-fluid b-r-50"/>
                                            </div>
                                        </>
                                    )}
                                </Col>
                            ))}
                        </div>
                    </CardBody>

                    <CardFooter>
                        <div className="chat-footer d-flex">
                        {/* Input and Emoji Button */}
                            <div className="app-form flex-grow-1">
                                <InputGroup>
            <span
                className="input-group-text bg-secondary ms-2 me-2 b-r-10"
                id="emojiTooltip"
                role="button"
            >
              <a className="emoji-btn d-flex-center">
                <i className="ti ti-mood-smile f-s-18"></i>
              </a>
            </span>
                                    <Tooltip
                                        isOpen={tooltipOpen.emoji}
                                        target="emojiTooltip"
                                        toggle={() => toggleTooltip("emoji")}
                                    >
                                        Emoji
                                    </Tooltip>
                                    <Input
                                        type="text"
                                        className="form-control b-r-6"
                                        placeholder="Type a message"
                                        aria-label="Recipient's username"
                                    />
                                    <Button color="primary" className="btn-sm ms-2 me-2 b-r-4">
                                        <i className="ti ti-send"></i> <span>Send</span>
                                    </Button>
                                </InputGroup>
                            </div>

                            {/* Additional Buttons */}
                            <div className="d-none d-sm-block">
          <span
              className="bg-secondary h-50 w-50 d-flex-center b-r-10 ms-1"
              id="microphoneTooltip"
              role="button"
          >
            <i className="ti ti-microphone f-s-18"></i>
          </span>
                                <Tooltip
                                    isOpen={tooltipOpen.microphone}
                                    target="microphoneTooltip"
                                    toggle={() => toggleTooltip("microphone")}
                                >
                                    Microphone
                                </Tooltip>
                            </div>
                            <div className="d-none d-sm-block">
          <span
              className="bg-secondary h-50 w-50 d-flex-center b-r-10 ms-1"
              id="cameraTooltip"
              role="button"
          >
            <i className="ti ti-camera-plus f-s-18"></i>
          </span>
                                <Tooltip
                                    isOpen={tooltipOpen.camera}
                                    target="cameraTooltip"
                                    toggle={() => toggleTooltip("camera")}
                                >
                                    Camera
                                </Tooltip>
                            </div>
                            <div className="d-none d-sm-block">
          <span
              className="bg-secondary h-50 w-50 d-flex-center b-r-10 ms-1"
              id="paperclipTooltip"
              role="button"
          >
            <i className="ti ti-paperclip f-s-18"></i>
          </span>
                                <Tooltip
                                    isOpen={tooltipOpen.paperclip}
                                    target="paperclipTooltip"
                                    toggle={() => toggleTooltip("paperclip")}
                                >
                                    Paperclip
                                </Tooltip>
                            </div>

                            {/* Dropdown for Mobile */}
                            <div>
                                <div className="btn-group dropdown-icon-none d-sm-none">
                                    <a className="h-35 w-35 d-flex-center ms-1" role="button" data-bs-toggle="dropdown"
                                       data-bs-auto-close="true" aria-expanded="false">
                                        <i className="ti ti-dots-vertical"></i>
                                    </a>
                                    <ul className="dropdown-menu" data-popper-placement="bottom-start">
                                        <li><a className="dropdown-item" href="#"><i className="ti ti-microphone"></i> <span
                                            className="f-s-13">Microphone</span></a>
                                        </li>
                                        <li><a className="dropdown-item" href="#"> <i className="ti ti-camera-plus"></i>
                                            <span
                                                className="f-s-13">camera</span></a>
                                        </li>
                                        <li><a className="dropdown-item" href="#"><i className="ti ti-paperclip"></i> <span
                                            className="f-s-13">paperclip</span></a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
        </>
    )
}

export default ChatContainer
