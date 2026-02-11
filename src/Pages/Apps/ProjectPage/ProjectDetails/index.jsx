import React from "react";
import {Card, CardHeader, CardBody, Table, Badge, UncontrolledTooltip, ListGroup, ListGroupItem, Button, Input, InputGroup, InputGroupText, Tooltip, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, CardFooter, Container, Row, Col} from "reactstrap";
import { fileData, projectData } from "@/Data/project details/projectteam";
import {Link} from 'react-router-dom'

const ProjectDetails = () => {
  return (
    <div>
      <Container fluid>
        <Row className="m-1">
          <Col xs={12}>
            <h4 className="main-title">Project Details</h4>
            <ul className="app-line-breadcrumbs mb-3">
              <li className="">
                <a href="#" className="f-s-14 f-w-500">
                  <span>
                    <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="f-s-14 f-w-500">
                  Project App
                </a>
              </li>
              <li className="active">
                <a href="#" className="f-s-14 f-w-500">
                  Project Details
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col md={6} xxl={3}  className="order-xxl-1">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <h5>Project Details</h5>
              </CardHeader>
              <CardBody>
                <Table
                  borderless
                  className="project-details-table align-middle mb-0"
                >
                  <tbody>
                    <tr>
                      <td>
                        <p className="fw-bold mb-0">Name</p>
                      </td>
                      <td className="text-end">Ra-admin</td>
                    </tr>
                    <tr>
                      <td>
                        <p className="fw-bold mb-0">Manager</p>
                      </td>
                      <td className="text-end">Leonor Hill</td>
                    </tr>
                    <tr>
                      <td>
                        <p className="fw-bold mb-0">Start Date</p>
                      </td>
                      <td className="text-end text-primary">10 Apr 2024</td>
                    </tr>
                    <tr>
                      <td>
                        <p className="fw-bold mb-0">End Date</p>
                      </td>
                      <td className="text-end text-danger">20 Jul 2024</td>
                    </tr>
                    <tr>
                      <td className="pb-0">
                        <p className="fw-bold mb-0">Pricing</p>
                      </td>
                      <td className="text-end pb-0">
                        <h6>$200k</h6>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p className="fw-bold mb-0">Assigned By</p>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end">
                          <span
                            className="text-bg-danger rounded-circle d-flex align-items-center justify-content-center me-1"
                            id="tooltipA"
                            style={{ width: "30px", height: "30px" }}
                          >
                            A
                          </span>
                          <UncontrolledTooltip
                            placement="top"
                            target="tooltipA"
                          >
                            Everlee Lambert
                          </UncontrolledTooltip>
                          <span
                            className="text-bg-dark rounded-circle d-flex align-items-center justify-content-center me-1"
                            id="tooltipB"
                            style={{ width: "30px", height: "30px" }}
                          >
                            CD
                          </span>
                          <UncontrolledTooltip
                            placement="top"
                            target="tooltipB"
                          >
                            Hunter Scott
                          </UncontrolledTooltip>
                          <span
                            className="text-bg-warning rounded-circle d-flex align-items-center justify-content-center me-1"
                            id="tooltipC"
                            style={{ width: "30px", height: "30px" }}
                          >
                            XYZ
                          </span>
                          <UncontrolledTooltip
                            placement="top"
                            target="tooltipC"
                          >
                            Hunter Scott
                          </UncontrolledTooltip>
                          <span
                            className="text-bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                            id="tooltipMore"
                            style={{ width: "25px", height: "25px" }}
                          >
                            2+
                          </span>
                          <UncontrolledTooltip
                            placement="top"
                            target="tooltipMore"
                          >
                            2 More
                          </UncontrolledTooltip>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p className="fw-bold mb-0">Status</p>
                      </td>
                      <td className="text-end">
                        <Badge color="primary">In progress</Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>

            {/* Project Team */}
            <Card className="mt-4">
              <CardHeader>
                <h5>Project Team</h5>
              </CardHeader>
              <CardBody>
                <ListGroup className="project-team-list">
                  {projectData.map((member, index) => (
                    <ListGroupItem
                      key={index}
                      className="d-flex align-items-center mt-3"
                    >
                      {member.img ? (
                        <div
                          className={`${member.bgColor} h-35 w-35 rounded overflow-hidden`}
                        >
                          <img
                            src={member.img}
                            alt={member.name}
                            className="img-fluid"
                          />
                        </div>
                      ) : (
                        <span
                          className={`${member.bgColor} h-35 w-35 rounded d-flex justify-content-center align-items-center text-white`}
                        >
                          {member.initials}
                        </span>
                      )}
                      <div className="flex-grow-1 ps-2">
                        <h6 className="mb-0 fw-medium">{member.name}</h6>
                        <p className="text-muted fs-13 mb-0">{member.role}</p>
                      </div>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
          <div className="col-xxl-6 order-xxl-2">
      {/* Project Activity */}
      <Card>
        <CardHeader>
          <h5>Project Activity</h5>
        </CardHeader>
        <CardBody>
          <ul className="app-timeline-box">
            {/* Timeline Sections */}
            <li className="timeline-section">
              <div className="timeline-icon">
                <span className="text-light-primary h-35 w-35 d-flex-center b-r-50">W</span>
              </div>
              <div className="timeline-content pt-0">
                <div className="d-flex f-s-16">
                  <p className="text-primary f-s-16 mb-0">Wilson</p>
                  <span className="text-secondary ms-2">
                    added reaction in{' '}
                    <span className="badge text-outline-primary me-2">#product website</span> post
                  </span>
                </div>
                <p>09.00AM</p>
              </div>
            </li>
            <li className="timeline-section">
                                  <div className="timeline-icon">
                                             <span className="text-light-info h-35 w-35 d-flex-center b-r-50">
                                                 <i className="ph-duotone  ph-image f-s-18"></i>
                                             </span>
                                  </div>
                                  <div className="timeline-content pt-0 ">
                                    <p className=" f-s-16 text-info mb-0">2 image files and
                                      2 videos uploaded</p>
                                    <p className="text-secondary">
                                      updated at 12:45 pm
                                    </p>
                                    <div
                                            className="app-timeline-info-text timeline-border-box me-2 ms-0 mt-3 p-3">
                                      <div className="row">
                                        <div className="col-sm-4">
                                          <a href="/assets/images/draggable/02.jpg" className="glightbox img-hover-zoom" data-glightbox="type: image; zoomable: true;">
                                            <img src="/assets/images/draggable/02.jpg" className="w-100 rounded" alt=""/>
                                          </a>
                                        </div>
                                        <div className="col-sm-4">
                                          <a href="/assets/images/draggable/04.jpg" className="glightbox img-hover-zoom" data-glightbox="type: image; zoomable: true;">
                                            <img src="/assets/images/draggable/04.jpg" className="w-100 rounded" alt=""/>
                                          </a>
                                        </div>
                                        <div className="col-sm-4">
                                          <div className="img-hover-zoom">
                                            <a href="/assets/images/draggable/01.jpg" className="glightbox img-hover-zoom" data-glightbox="type: image; zoomable: true;">
                                              <img src="/assets/images/draggable/01.jpg" className="w-100 rounded" alt=""/>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>


                                </li>
                                <li className="timeline-section">
                                  <div className="timeline-icon">
                                             <span className="text-light-success  h-35 w-35 d-flex-center b-r-50">
                                               D
                                             </span>
                                  </div>
                                  <div className="timeline-content pt-0 ">
                                    <div className="d-flex f-s-16">
                                      <p className="text-success f-s-16 mb-0">Dane Wiza
                                      </p> <span className="text-secondary ms-2">added
                                                     reacton in <span
                                              className="badge text-outline-success me-2">#
                                                         product website</span>post</span>

                                    </div>
                                    <p className="">
                                      09.00AM
                                    </p>
                                    <div
                                            className="timeline-border-box me-2 ms-0 mt-3">
                                      <h6 className="mb-0">Need a feature</h6>
                                      <p className="mb-4 text-secondary">Hello everyone,
                                        question on email marketing. What are some
                                        tips/tricks to avoid going to promotion
                                        spam/ junk for automated marketing emails
                                        going to promotion spam/ junk for automated
                                        marketing emails</p>
                                      <span
                                              className="badge text-outline-success me-2 timeline-badge">#🙂❤
                                                     10Reactions</span>
                                      <span className="badge text-outline-success me-2">#✨
                                                     12Replies</span>
                                    </div>
                                  </div>


                                </li>
                                <li className="timeline-section">
                                  <div className="timeline-icon">
                                             <span className="text-light-danger h-35 w-35 d-flex-center b-r-50">
                                              B
                                             </span>
                                  </div>
                                  <div className="timeline-content pt-0">
                                    <div className="d-flex f-s-16">
                                      <p className="text-danger f-s-16 mb-0">Betty Mante
                                      </p> <span className="text-secondary ms-2">Request
                                                     joined<span
                                              className="badge text-outline-danger me-2 ms-2">#reaserchteam</span>groups</span>

                                    </div>
                                    <p className="mb-4">
                                      4 days ago
                                    </p>
                                    <Button color='danger' type="button"
                                            className="btn btn-danger">Accept</Button>{' '}
                                    <Button type="button"
                                            className="btn btn-outline-danger">Rejects</Button>
                                  </div>


                                </li>
                                <li className="timeline-section">
                                  <div className="timeline-icon">
                                             <span className="text-light-primary h-35 w-35 d-flex-center b-r-50">
                                             P
                                             </span>
                                  </div>
                                  <div className="timeline-content pt-0">
                                    <div className="d-flex f-s-16">
                                      <p className="text-primary f-s-16 mb-0">Pinkie</p>
                                      <span className="text-secondary ms-2">uploaded<span
                                              className="text-dark f-w-600 me-2 ms-2">
                                                         2</span>attachment<span
                                              className="badge text-outline-primary me-2 ms-2">#reaserchteam</span></span>

                                    </div>
                                    <p className="mb-4">
                                      4 days ago
                                    </p>
                                    <Button color='primary' type="button"
                                            className="btn btn-primary">Accept</Button>{' '}
                                    <Button type="button" color='primary'
                                            className="btn btn-outline-primary">Rejects</Button>
                                  </div>


                                </li>

            {/* Add more timeline sections similarly */}
          </ul>
        </CardBody>
        <CardFooter>
          <div className="d-flex">
            <div className="flex-grow-1">
              <InputGroup>
                <InputGroupText className="ms-2 me-2 b-r-10">
                  <a data-bs-toggle="tooltip" data-bs-placement="top" title="Emoji" role="button">
                    <i className="ti ti-mood-smile"></i>
                  </a>
                </InputGroupText>
                <Input
                  type="text"
                  className="form-control b-r-6"
                  placeholder="Type a message"
                  aria-label="Type a message"
                />
                <Button color="primary" className="btn-sm ms-2 me-2 b-r-4">
                  <i className="ti ti-send"></i> Send
                </Button>
              </InputGroup>
            </div>
            <div className="ms-2 d-none d-sm-block">
              <a
                className="text-light-secondary h-35 w-35 d-flex-center b-r-10 ms-1"
                role="button"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Microphone"
              >
                <i className="ti ti-microphone"></i>
              </a>
            </div>
            <div className="d-none d-sm-block">
              <a
                className="text-light-secondary h-35 w-35 d-flex-center b-r-10 ms-1"
                role="button"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Camera"
              >
                <i className="ti ti-camera-plus"></i>
              </a>
            </div>
            <div className="d-none d-sm-block">
              <a
                className="text-light-secondary h-35 w-35 d-flex-center b-r-10 ms-1"
                role="button"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Paperclip"
              >
                <i className="ti ti-paperclip"></i>
              </a>
            </div>
            <div>
              <UncontrolledDropdown>
                <DropdownToggle
                  tag="a"
                  className="h-35 w-35 d-flex-center ms-1"
                  role="button"
                >
                  <i className="ti ti-dots-vertical"></i>
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem>
                    <i className="ti ti-microphone"></i> Microphone
                  </DropdownItem>
                  <DropdownItem>
                    <i className="ti ti-camera-plus"></i> Camera
                  </DropdownItem>
                  <DropdownItem>
                    <i className="ti ti-paperclip"></i> Paperclip
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </div>
        </CardFooter>
      </Card>
      {/* End Project Activity */}
        </div>
        
        <div className="col-md-6 col-xxl-3 order-md-1 order-xxl-3">
      {/* About Project */}
      <Card>
        <CardHeader>
          <h5>About Project</h5>
        </CardHeader>
        <CardBody>
          <div className="mb-3">
            <h6>Project Description</h6>
            <p className="text-muted">
              An admin panel or a control panel is a system that enables administrators and other website workers to
              conduct various tasks like monitoring, maintaining, and controlling certain business processes. An admin
              dashboard is one of the core components of a control panel.
            </p>
          </div>
          <div className="mb-3">
            <h6>Task Information</h6>
            <p className="text-muted">
              The success of a project relies heavily on effective project management, which involves the careful
              planning, organizing, and controlling of resources to ensure that the project objectives are met. This
              includes defining the project scope, setting realistic timelines and budgets.
            </p>
          </div>
          <div className="mb-3">
            <h6>Background Information</h6>
            <p className="text-muted">
              A project is a planned endeavor that aims to achieve a specific goal within a defined timeframe. It
              involves a series of tasks and activities that are coordinated and executed by a team of individuals.
              Projects can vary in size, complexity, and scope, ranging from small-scale initiatives to large-scale
              undertakings that span across multiple departments or organizations.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Project Documents */}
      <Card className="mt-4">
        <CardBody>
          <h5 className="header-title-text">Data Folder & Files</h5>
          <div className="data-list-box mt-3">
            {fileData.map((file, index) => (
              <div className="filebox mb-3" key={index}>
                <div className="d-flex align-items-center position-relative">
                  <div className="position-absolute start-0">
                    <img src={`/assets/images/icons/${file.icon}`} className="w-35 h-35" alt={file.title} />
                  </div>
                  <div className="flex-grow-1 mg-s-40">
                    <h6 className="mb-0">{file.title}</h6>
                    <p className="text-secondary mb-0">{file.filesCount}</p>
                  </div>
                  <p className="file-data text-secondary f-w-500 mb-0">{file.size}</p>
                </div>
              </div>
            ))}
            <div>
              <Link to="/apps/file-manager">
                <Button color="primary" className="w-100" >
                  View More
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>


        </Row>
      </Container>
    </div>
  );
};

export default ProjectDetails;
