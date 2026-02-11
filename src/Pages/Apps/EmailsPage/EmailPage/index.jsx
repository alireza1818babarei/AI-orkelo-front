
import React, { useState } from 'react'
import {Badge, Card, CardBody, Col, Container, Row} from "reactstrap";
import { Input, InputGroup, InputGroupText, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {emaildraft, emails, emailsent, emailstarred, emailstrash} from "@/Data/Email/email";
import {Link} from 'react-router-dom'

const Email = () => {
    const [active,setActive] = useState("tab1");
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Email</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Email</a>
                        </li>
                    </ul>
                </Col>
            </Row>
            <div className="row position-relative">
                <div className="col-lg-3">
                    <div className="mailbox">
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
                                        <li className={`tab-link ${active == "tab1" ? "active" : ""}`} onClick={() => setActive("tab1")}>
                                            <i className="ti ti-mail fs-5 pe-2"/> <span className="flex-grow-1">Inbox</span> 10+
                                        </li>
                                        <li className={`tab-link ${active == "tab2" ? "active" : ""}`} onClick={() => setActive("tab2")}><i className="ti ti-send fs-5 pe-2"/><span
                                            className="flex-grow-1">Sent</span></li>
                                        <li className={`tab-link ${active == "tab3" ? "active" : ""}`} onClick={() => setActive("tab3")}><i className="ti ti-file fs-5 pe-2"/><span
                                            className="flex-grow-1">Draft</span> </li>
                                        <li className={`tab-link ${active == "tab4" ? "active" : ""}`} onClick={() => setActive("tab4")}><i className="ti ti-star fs-5 pe-2"/><span
                                            className="flex-grow-1">
                              Starred </span>
                                            2+</li>
                                        <li className={`tab-link ${active == "tab5" ? "active" : ""}`} onClick={() => setActive("tab5")}><i className="ti ti-alert-octagon fs-5 pe-2"/><span
                                            className="flex-grow-1">Spam</span> </li>
                                        <li className={`tab-link ${active == "tab6" ? "active" : ""}`} onClick={() => setActive("tab6")}><i className="ti ti-trash fs-5 pe-2 "/><span
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

                    </div>
                </div>
                <div className="col-lg-9">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex align-items-center">

                                <div className="d-lg-none">
                                    <a className="me-3 toggle-btn" role="button">
                                        <i className="ti ti-align-justified"></i>
                                    </a>
                                </div>


                                <div className="flex-grow-1">
                                    <InputGroup className="b-r-search">
                                        <InputGroupText className="bg-primary border-0">
                                            <i className="ti ti-search"></i>
                                        </InputGroupText>
                                        <Input type="text" placeholder="Search..." />
                                    </InputGroup>
                                </div>


                                <div>
                                    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="dropdown-icon-none">
                                        <DropdownToggle tag="a" className="icon-btn p-2" role="button">
                                            <i className="ti ti-dots-vertical"></i>
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem href="#">
                                                <i className="ti ti-album"></i> Primary
                                            </DropdownItem>
                                            <DropdownItem href="#">
                                                <i className="ti ti-tag"></i> Promotions
                                            </DropdownItem>
                                            <DropdownItem href="#">
                                                <i className="ti ti-users"></i> Social
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </div>
                            <div className="content-wrapper mt-3">
                                <div className={`tabs-content ${active == "tab1" ? "active" : ""}`}>
                                    <div className="mail-table">
                                        {emails.map((email) => (
                                            <div key={email.id} className="mail-box d-flex align-items-center p-3 border-bottom">
                                                {/* Checkbox */}
                                                <Input type="checkbox" id={`checkbox-${email.id}`} className="form-check-input" value={`option${email.id}`} />

                                                {/* Star Icon */}
                                                <span className="ms-2 me-2">
            <i className="ti ti-star text-warning star-icon fs-5"></i>
          </span>

                                                {/* Mail Content */}
                                                <div className="flex-grow-1 position-relative d-flex">
                                                    {/* Avatar */}
                                                    <div className="mail-img h-35 w-35 b-r-50 overflow-hidden text-bg-primary position-absolute mt-1">
                                                        <img src={email.avatar} alt={email.name} className="img-fluid" />
                                                    </div>
                                                    <div className="mg-s-45 ms-5">
                                                        <h6 className="mb-0 f-w-600">{email.name}</h6>
                                                        <Link to="/apps/email-page/read_email">
                                                            <span className="f-s-13 text-secondary">{email.content}</span>
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Date and Badge */}
                                                <div className="text-center">
                                                    <p className="mb-1">{email.date}</p>
                                                    <span className={email.badgeClass}>{email.badge}</span>
                                                </div>

                                                {/* Dropdown Menu */}
                                                <div className="ms-3">
                                                    <Dropdown toggle={() => {}} className="dropdown-icon-none">
                                                        <DropdownToggle tag="button" className="btn border-0 icon-btn b-r-4" type="button">
                                                            <i className="ti ti-dots-vertical"></i>
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <i className="ti ti-archive"></i> Archive
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-trash"></i> Delete
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-mail-opened"></i> Read Mail
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                                <div className={`tabs-content ${active == "tab2" ? "active" : ""}`}>
                                    <div className="mail-table">
                                        {emailsent.map((email) => (
                                            <div key={email.id} className="mail-box d-flex align-items-center p-3 border-bottom">
                                                {/* Checkbox */}
                                                <Input type="checkbox" id={`checkbox-${email.id}`} className="form-check-input" value={`option${email.id}`} />

                                                {/* Star Icon */}
                                                <span className="ms-2 me-2">
            <i className="ti ti-star text-warning star-icon fs-5"></i>
          </span>

                                                {/* Mail Content */}
                                                <div className="flex-grow-1 position-relative d-flex">
                                                    {/* Avatar */}
                                                    <div className="mail-img h-35 w-35 b-r-50 overflow-hidden text-bg-primary position-absolute mt-1">
                                                        <img src={email.avatar} alt={email.name} className="img-fluid" />
                                                    </div>
                                                    <div className="mg-s-45 ms-5">
                                                        <h6 className="mb-0 f-w-600">{email.name}</h6>
                                                        <Link to="/apps/email-page/read_email">
                                                            <span className="f-s-13 text-secondary">{email.content}</span>
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Date and Badge */}
                                                <div className="text-center">
                                                    <p className="mb-1">{email.date}</p>
                                                    <span className={email.badgeClass}>{email.badge}</span>
                                                </div>

                                                {/* Dropdown Menu */}
                                                <div className="ms-3">
                                                    <Dropdown toggle={() => {}} className="dropdown-icon-none">
                                                        <DropdownToggle tag="button" className="btn border-0 icon-btn b-r-4" type="button">
                                                            <i className="ti ti-dots-vertical"></i>
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <i className="ti ti-archive"></i> Archive
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-trash"></i> Delete
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-mail-opened"></i> Read Mail
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={`tabs-content ${active == "tab3" ? "active" : ""}`}>

                                    <div className="mail-table">
                                        {emaildraft.map((email) => (
                                            <div key={email.id} className="mail-box d-flex align-items-center p-3 border-bottom">
                                                {/* Checkbox */}
                                                <Input type="checkbox" id={`checkbox-${email.id}`} className="form-check-input" value={`option${email.id}`} />

                                                {/* Star Icon */}
                                                <span className="ms-2 me-2">
            <i className="ti ti-star text-warning star-icon fs-5"></i>
          </span>

                                                {/* Mail Content */}
                                                <div className="flex-grow-1 position-relative d-flex">
                                                    {/* Avatar */}
                                                    <div className="mail-img h-35 w-35 b-r-50 overflow-hidden text-bg-primary position-absolute mt-1">
                                                        <img src={email.avatar} alt={email.name} className="img-fluid" />
                                                    </div>
                                                    <div className="mg-s-45 ms-5">
                                                        <h6 className="mb-0 f-w-600">{email.name}</h6>
                                                        <Link to="/apps/email-page/read_email">
                                                            <span className="f-s-13 text-secondary">{email.content}</span>
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Date and Badge */}
                                                <div className="text-center">
                                                    <p className="mb-1">{email.date}</p>
                                                    <span className={email.badgeClass}>{email.badge}</span>
                                                </div>

                                                {/* Dropdown Menu */}
                                                <div className="ms-3">
                                                    <Dropdown toggle={() => {}} className="dropdown-icon-none">
                                                        <DropdownToggle tag="button" className="btn border-0 icon-btn b-r-4" type="button">
                                                            <i className="ti ti-dots-vertical"></i>
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <i className="ti ti-archive"></i> Archive
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-trash"></i> Delete
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-mail-opened"></i> Read Mail
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>


                                <div className={`tabs-content ${active == "tab4" ? "active" : ""}`}>

                                    <div className="mail-table">
                                        {emailstarred.map((email) => (
                                            <div key={email.id} className="mail-box d-flex align-items-center p-3 border-bottom">
                                                {/* Checkbox */}
                                                <Input type="checkbox" id={`checkbox-${email.id}`} className="form-check-input" value={`option${email.id}`} />

                                                {/* Star Icon */}
                                                <span className="ms-2 me-2">
            <i className="ti ti-star text-warning star-icon fs-5"></i>
          </span>

                                                {/* Mail Content */}
                                                <div className="flex-grow-1 position-relative d-flex">
                                                    {/* Avatar */}
                                                    <div className="mail-img h-35 w-35 b-r-50 overflow-hidden text-bg-primary position-absolute mt-1">
                                                        <img src={email.avatar} alt={email.name} className="img-fluid" />
                                                    </div>
                                                    <div className="mg-s-45 ms-5">
                                                        <h6 className="mb-0 f-w-600">{email.name}</h6>
                                                        <Link to="/apps/email-page/read_email">
                                                            <span className="f-s-13 text-secondary">{email.content}</span>
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Date and Badge */}
                                                <div className="text-center">
                                                    <p className="mb-1">{email.date}</p>
                                                    <span className={email.badgeClass}>{email.badge}</span>
                                                </div>

                                                {/* Dropdown Menu */}
                                                <div className="ms-3">
                                                    <Dropdown toggle={() => {}} className="dropdown-icon-none">
                                                        <DropdownToggle tag="button" className="btn border-0 icon-btn b-r-4" type="button">
                                                            <i className="ti ti-dots-vertical"></i>
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <i className="ti ti-archive"></i> Archive
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-trash"></i> Delete
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-mail-opened"></i> Read Mail
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>

                                <div className={`tabs-content ${active == "tab5" ? "active" : ""}`}>

                                    <div className="mail-table d-flex align-items-center justify-content-center">
                                        <div className="spam-box text-center">
                                            <img src="/assets/images/icons/spam..png" alt=""/>
                                                <h5>No spam here</h5>
                                                <p>The MUA formats the message in email format and uses the submission a
                                                    profile of the
                                                    Simple Mail Transfer Protocol (SMTP), to send the message !</p>
                                        </div>
                                    </div>

                                </div>


                                <div className={`tabs-content ${active == "tab6" ? "active" : ""}`}>
                                    <div className="mail-table">
                                        {emailstrash.map((email) => (
                                            <div key={email.id} className="mail-box d-flex align-items-center p-3 border-bottom">
                                                {/* Checkbox */}
                                                <Input type="checkbox" id={`checkbox-${email.id}`} className="form-check-input" value={`option${email.id}`} />

                                                {/* Star Icon */}
                                                <span className="ms-2 me-2">
            <i className="ti ti-star text-warning star-icon fs-5"></i>
          </span>

                                                {/* Mail Content */}
                                                <div className="flex-grow-1 position-relative d-flex">
                                                    {/* Avatar */}
                                                    <div className="mail-img h-35 w-35 b-r-50 overflow-hidden text-bg-primary position-absolute mt-1">
                                                        <img src={email.avatar} alt={email.name} className="img-fluid" />
                                                    </div>
                                                    <div className="mg-s-45 ms-5">
                                                        <h6 className="mb-0 f-w-600">{email.name}</h6>
                                                        <Link to="/apps/email-page/read_email">
                                                            <span className="f-s-13 text-secondary">{email.content}</span>
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Date and Badge */}
                                                <div className="text-center">
                                                    <p className="mb-1">{email.date}</p>
                                                    <span className={email.badgeClass}>{email.badge}</span>
                                                </div>

                                                {/* Dropdown Menu */}
                                                <div className="ms-3">
                                                    <Dropdown toggle={() => {}} className="dropdown-icon-none">
                                                        <DropdownToggle tag="button" className="btn border-0 icon-btn b-r-4" type="button">
                                                            <i className="ti ti-dots-vertical"></i>
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem>
                                                                <i className="ti ti-archive"></i> Archive
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-trash"></i> Delete
                                                            </DropdownItem>
                                                            <DropdownItem>
                                                                <i className="ti ti-mail-opened"></i> Read Mail
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default Email