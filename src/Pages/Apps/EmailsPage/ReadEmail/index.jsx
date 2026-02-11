
import React, {useEffect, useState} from 'react'
import {Button, Card, CardBody, Col, Container, Row, Tooltip} from "reactstrap";
import {Link} from 'react-router-dom'


const ReadEmail = () => {
    useEffect(() => {
        $('#editor').trumbowyg({
            btns: [
                ['viewHTML'],
                ['undo', 'redo'],
                ['formatting'],
                ['strong', 'em', 'del'],
                ['superscript', 'subscript'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                ['unorderedList', 'orderedList'],
                ['horizontalRule'],
                ['removeformat'],
                ['fullscreen']
            ],
        });
    }, []);
    const [tooltipOpen, setTooltipOpen] = useState({});


    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const files = [
        {
            icon: "/assets/images/icons/file.png",
            title: "Meeting Paper's",
            details: "1MB",
        },
        {
            icon: "/assets/images/icons/folder.png",
            title: "Project Details",
            details: "18 Files",
        },
    ];

    return (
        <Container fluid>

            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Read Email</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Read Email</a>
                        </li>
                    </ul>
                </Col>
            </Row>
            <Row>
                <Col lg={3}>
                    <Card>
                        <CardBody>
                            <div className="d-flex">
                                <button type="button" className="btn btn-primary w-100" data-bs-toggle="modal"
                                        data-bs-target="#emailBox">Compose</button>

                                <div className="close-togglebtn">
                                    <a className="ms-2 close-toggle" role="button"><i className="ti ti-align-justified fs-5"/></a>
                                </div>
                            </div>

                            <div className="horizontal-tab-wrapper">
                                <ul className="email-list mt-3 tabs">
                                    <li className="tab-link active" >
                                        <i className="ti ti-mail fs-5 pe-2"/> <span className="flex-grow-1">Inbox</span> 10+
                                    </li>
                                    <li className="tab-link"><i className="ti ti-send fs-5 pe-2"/><span
                                        className="flex-grow-1">Sent</span></li>
                                    <li className="tab-link"><i className="ti ti-file fs-5 pe-2"/><span
                                        className="flex-grow-1">Draft</span> </li>
                                    <li className="tab-link"><i className="ti ti-star fs-5 pe-2"/><span
                                        className="flex-grow-1">
                              Starred </span>
                                        2+</li>
                                    <li className="tab-link"><i className="ti ti-alert-octagon fs-5 pe-2"/><span
                                        className="flex-grow-1">Spam</span> </li>
                                    <li className="tab-link"><i className="ti ti-trash fs-5 pe-2 "/><span
                                        className="flex-grow-1">Trash</span> </li>
                                </ul>
                            </div>
                            <div className="app-divider-v dashed p-2 m-0"/>
                            <ul className="email-list">
                                <li>
                                    <h6>Labels</h6>
                                </li>
                                <li><i className="ti ti-circle-filled pe-2 text-danger"/> Social</li>
                                <li><i className="ti ti-circle-filled pe-2 text-primary"/> Company</li>
                                <li><i className="ti ti-circle-filled pe-2 text-success"/> Important</li>
                                <li><i className="ti ti-circle-filled pe-2 text-info"/> Private</li>
                            </ul>
                            <div className="app-divider-v dashed p-2 m-0"/>
                            <ul className="email-list">
                                <li><i className="ti ti-mail fs-5 pe-2"/>All Mail</li>
                                <li><i className="ti ti-album fs-5 pe-2"/>Primary</li>
                                <li><i className="ti ti-tag fs-5 pe-2"/>Promotions</li>
                                <li><i className="ti ti-users fs-5 pe-2"/>Social</li>
                            </ul>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={9}>
                    <Card>
                        <CardBody>
                            <div className="d-flex align-items-center flex-wrap mb-3">
                                <div className="flex-grow-1">
                                    <Link
                                        href="/apps/email-page/email"
                                        role="button"
                                        className="btn p-0 pe-2"
                                        title="Back To Inbox"
                                    >
                                        <i className="ti ti-arrow-left fs-4 text-dark"></i>
                                    </Link>
                                    <Button
                                        color="link"
                                        className="border-0 p-1 text-decoration-none"
                                        id="tooltip-archive"
                                    >
                                        <i className="ti ti-archive fs-5 text-dark"></i>
                                    </Button>
                                    <Tooltip
                                        target="tooltip-archive"
                                        isOpen={tooltipOpen["tooltip-archive"] || false}
                                        toggle={() => toggleTooltip("tooltip-archive")}
                                    >
                                        Archive
                                    </Tooltip>

                                    <Button
                                        color="link"
                                        className="border-0 p-1 text-decoration-none"
                                        id="tooltip-star"
                                    >
                                        <i className="ti ti-star fs-5 text-dark"></i>
                                    </Button>
                                    <Tooltip
                                        target="tooltip-star"
                                        isOpen={tooltipOpen["tooltip-star"] || false}
                                        toggle={() => toggleTooltip("tooltip-star")}
                                    >
                                        Starred
                                    </Tooltip>

                                    <Button
                                        color="link"
                                        className="border-0 p-1 text-decoration-none"
                                        id="tooltip-spam"
                                    >
                                        <i className="ti ti-alert-octagon fs-5 text-dark"></i>
                                    </Button>
                                    <Tooltip
                                        target="tooltip-spam"
                                        isOpen={tooltipOpen["tooltip-spam"] || false}
                                        toggle={() => toggleTooltip("tooltip-spam")}
                                    >
                                        Spam
                                    </Tooltip>

                                    <Button
                                        color="link"
                                        className="border-0 p-1 text-decoration-none"
                                        id="tooltip-delete"
                                    >
                                        <i className="ti ti-trash fs-5 text-dark"></i>
                                    </Button>
                                    <Tooltip
                                        target="tooltip-delete"
                                        isOpen={tooltipOpen["tooltip-delete"] || false}
                                        toggle={() => toggleTooltip("tooltip-delete")}
                                    >
                                        Delete
                                    </Tooltip>

                                    <Button
                                        color="link"
                                        className="border-0 p-1 text-decoration-none"
                                        id="tooltip-folder"
                                    >
                                        <i className="ti ti-folder fs-5 text-dark"></i>
                                    </Button>
                                    <Tooltip
                                        target="tooltip-folder"
                                        isOpen={tooltipOpen["tooltip-folder"] || false}
                                        toggle={() => toggleTooltip("tooltip-folder")}
                                    >
                                        Folder
                                    </Tooltip>

                                    <Button
                                        color="link"
                                        className="border-0 p-1 text-decoration-none"
                                        id="tooltip-labels"
                                    >
                                        <i className="ti ti-tags fs-5 text-dark"></i>
                                    </Button>
                                    <Tooltip
                                        target="tooltip-labels"
                                        isOpen={tooltipOpen["tooltip-labels"] || false}
                                        toggle={() => toggleTooltip("tooltip-labels")}
                                    >
                                        Labels
                                    </Tooltip>
                                </div>

                                {/* Right Section */}
                                <div className="d-flex justify-content-end">
                                    <span className="text-muted text-dark">2 to 10</span>
                                    <Button color="link" className="border-0 p-1 text-decoration-none"
                                            id="tooltip-next">
                                        <i className="ti ti-chevron-left fs-5 text-dark"></i>
                                    </Button>
                                    <Tooltip
                                        target="tooltip-next"
                                        isOpen={tooltipOpen["tooltip-next"] || false}
                                        toggle={() => toggleTooltip("tooltip-next")}
                                    >
                                        Next
                                    </Tooltip>
                                    <Button color="link" className="border-0 p-1 text-decoration-none"
                                            id="tooltip-previous">
                                        <i className="ti ti-chevron-right fs-5 text-dark"></i>
                                    </Button>
                                    <Tooltip
                                        target="tooltip-previous"
                                        isOpen={tooltipOpen["tooltip-previous"] || false}
                                        toggle={() => toggleTooltip("tooltip-previous")}
                                    >
                                        Previous
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="mail-container">
                                <div className="d-flex align-items-center flex-nowrap mb-5">
                                    <span className="bg-secondary h-45 w-45 d-flex-center b-r-50 position-relative ">
                                        <img src="/assets/images/avtar/6.png" alt="" className="img-fluid b-r-50"/>
                                        <span
                                            className="position-absolute top-0 d-flex-center bg-success border border-light rounded-circle text-center p-1 f-s-10 end-0"></span>
                                    </span>
                                    <div className="flex-grow-1 ps-2">
                                        <p className="text-muted f-s-14 m-0">bettehagenes@gmail.com</p>
                                        <div className="btn-group hover-dropdown">
                                            <button type="button" className="btn waves-effect waves-light text-dark p-0"
                                                    data-bs-toggle="dropdown"
                                                    data-trigger="hover" aria-expanded="false">to<i
                                                className="ti ti-chevron-down"></i></button>
                                            <ul className="dropdown-menu">
                                                <li><a className="dropdown-item">From : <span
                                                    className="text-muted f-s-14">arteam@gmail.com</span></a>
                                                </li>
                                                <li><a className="dropdown-item">To : <span
                                                    className="text-muted f-s-14">bettehagenes@gmail.com</span></a>
                                                </li>
                                                <li><a className="dropdown-item">cc : <span
                                                    className="text-muted f-s-14">bettehagenes@gmail.com</span></a>
                                                </li>
                                                <li><a className="dropdown-item">Date : <span
                                                    className="text-muted f-s-14">29 Sep 2024</span></a>
                                                </li>
                                                <li><a className="dropdown-item">Subject : <span
                                                    className="text-muted f-s-14">meeting
                                    invitation</span></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="text-end d-none d-sm-block">
                                        <p>Sep 29 2024, 4:00 PM</p>
                                        <span className="badge text-light-primary">Company</span>
                                    </div>
                                    <div className="d-none d-sm-block">
                                        <div className="btn-group dropdown-icon-none ps-2">
                                            <a className="icon-btn dropdown-toggle" role="button"
                                               data-bs-toggle="dropdown"
                                               data-bs-auto-close="true" aria-expanded="false">
                                                <i className="ti ti-dots-vertical"></i>
                                            </a>
                                            <ul className="dropdown-menu" data-popper-placement="bottom-start">
                                                <li><a className="dropdown-item" href="#"><i
                                                    className="ti ti-archive"></i> Archive </a></li>
                                                <li><a className="dropdown-item" href="#"><i
                                                    className="ti ti-trash"></i> Delete </a></li>
                                                <li><a className="dropdown-item" href="#"><i
                                                    className="ti ti-mail-opened"></i> Read Mali </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3">
                                        <h6>Hello! Bette</h6>
                                    </div>
                                    <div className="mb-3 text-secondary">
                                        <p>I hope you're doing well. I would like to schedule a one-on-one
                                            meeting with you to <strong>discussing a new project</strong>.
                                            I'll send over the
                                            agenda in advance.</p>
                                        <p>The meeting will be in my office, will you be available
                                            one-on-one
                                            <strong> 10 Oct,2024
                                                at 10PM ?</strong> It's important that we have this meeting
                                            so that we can
                                            continue to work effectively together.
                                        </p>
                                    </div>
                                    <div className="mb-3 text-secondary">
                                        <p>I hope you can make it!</p>
                                        <p>Best,</p>
                                    </div>
                                    <p className="f-w-500">AR team</p>
                                </div>

                                <div className="app-divider-v dotted"></div>

                                <div className="mb-3">
                                    <h6>
                                        <i className="ti ti-paperclip"></i> Attached
                                    </h6>
                                    <div className="data-list-box d-flex flex-wrap gap-2 mt-3">
                                        {files.map((file, index) => (
                                            <div className="filebox" key={index}>
                                                <div className="d-flex gap-3 align-items-center position-relative">
                                                    <div className="position-absolute start-0">
                                                        <img src={file.icon} className="w-35 h-35" alt="File Icon"/>
                                                    </div>

                                                    <div className="flex-grow-1 ms-5">
                                                        <h6 className="mb-0">{file.title}</h6>
                                                        <p className="text-secondary mb-0">{file.details}</p>
                                                    </div>

                                                    <p className="file-data text-secondary f-w-500 mb-0">
                                                        <i className="ti ti-download fs-4"></i>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div id="editor">
                                        <p>Type Message...</p>
                                    </div>
                                </div>

                                <button className="btn btn-primary mb-1" type="button">
                                    <i className="ti ti-arrow-back-up"></i> Reply
                                </button>{" "}
                                <button className="btn btn-primary mb-1" type="button">
                                    <i className="ti ti-corner-up-left-double"></i> Reply All
                                </button>{" "}
                                <button className="btn btn-primary mb-1" type="button">
                                    <i className="ti ti-arrow-forward-up"></i> Forward
                                </button>

                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default ReadEmail