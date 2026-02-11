
import React, { useState } from "react";
import {designingProjects, developmentProjects, projectData} from "@/Data/Projectapp/ProjectAppData";
import {Button, CardBody, CardFooter, Col, Container, Row} from "reactstrap";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {Link} from 'react-router-dom'



const Projects = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  const handleTabClick = (tabID) => {
    setActiveTab(tabID);
  };
  const [modal, setModal] = useState(false);
  const [projectPageData, setProjectPageData] = useState(projectData);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    price: "",
    logo: null,
  });

  const toggleModal = () => setModal(!modal);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormValues((prev) => ({...prev, [name]: value}));
  };

  const handleFileChange = (e) => {
    setFormValues((prev) => ({...prev, logo: e.target.files[0]}));
  };

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      ...formValues,
      logo: formValues.logo ? URL.createObjectURL(formValues.logo) : null,
      progress: 50,
      status: "Progress",
      membersCount: 20,
      avatars: ["/assets/images/avtar/4.png", "/assets/images/avtar/1.png", "/assets/images/avtar/2.png", "/assets/images/avtar/3.png"]
    };
    setProjectPageData((prev) => [...prev, newProject]);
    toggleModal();
    setFormValues({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      price: "",
      logo: null,
    })
  };

  return (
      <Container fluid>
        <Row className=" m-1">
          <Col xs={12}>
            <h4 className="main-title">Projects</h4>
            <ul className="app-line-breadcrumbs mb-3">
              <li className="">
                <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                </a>
              </li>
              <li>
                <a href="#" className="f-s-14 f-w-500">Project App</a>
              </li>
              <li className="active">
                <a href="#" className="f-s-14 f-w-500">Projects</a>
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <div className="tab-wrapper mb-3">
              <ul className="tabs">
                <li className={`tab-link ${activeTab === 'tab1' ? 'active' : ''}`}
                    onClick={() => handleTabClick('tab1')} data-tab="1">
                  All Project
                </li>
                <li className={`tab-link ${activeTab === 'tab2' ? 'active' : ''}`}
                    onClick={() => handleTabClick('tab2')} data-tab="2">
                  Designing Project
                </li>
                <li className={`tab-link ${activeTab === 'tab3' ? 'active' : ''}`}
                    onClick={() => handleTabClick('tab3')} data-tab="3">
                  Development Project
                </li>
                <li className="ms-auto">
                  <div className="text-end">
                    <Button color="primary" className="mb-3 w-45 h-45 icon-btn b-r-10 m-2"
                            onClick={toggleModal}>
                      <i className="ti ti-plus f-s-18"></i>
                    </Button>
                  </div>
                </li>
              </ul>
            </div>
            <div className="content-wrapper">
              <div id="tab-1" className={`tab-content ${activeTab === 'tab1' ? 'd-block' : 'd-none'}`}>

                <Row>
                  {projectPageData.map((project) => (
                      <div key={project.id} className="col-md-6 col-xxl-4">
                        <div className="card hover-effect project-app-card">
                          <div className="card-header">
                          <div className="d-flex align-items-center">
                              <div className="h-40 w-40 d-flex-center b-r-50 overflow-hidden">
                                <img src={project.logo} alt="" className="img-fluid"/>
                              </div>
                              <div className="flex-grow-1 ps-2">
                                <Link
                                    to="/apps/e-shop/projects-page/project-details"
                                    target="_blank"
                                    className="fs-6 m-0 f-w-600"
                                >
                                  {project.title}
                                </Link>
                                <div className="text-muted f-s-14">{project.subTitle}</div>
                              </div>
                              <i className="ti ti-dots-vertical"></i>
                            </div>
                          </div>
                          <CardBody>
                            <div className="d-flex">
                              <div>
                                <h6 className="f-w-500">
                                  Start Date :
                                  <span className=" f-s-14 text-secondary">
                      {project.startDate}
                    </span>
                                </h6>
                                <h6 className="f-w-500">
                                  End Date :
                                  <span className=" f-s-14 text-secondary">
                      {project.endDate}
                    </span>
                                </h6>
                              </div>
                              <div className="flex-grow-1 text-end">
                                <p>pricing </p>
                                <h6>{project.price}</h6>
                              </div>
                            </div>
                            <p className="text-muted f-s-14 text-secondary">
                              {project.description}
                            </p>
                            <div className="text-end mb-2">
                <span className={`badge text-light-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
                            </div>
                            <div
                                className="progress w-100"
                                role="progressbar"
                                aria-valuenow={project.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                              <div
                                  className={`progress-bar ${project.status === "Completed" ? "bg-success" : "bg-primary"}`}
                                  style={{width: `${project.progress}%`}}
                              >
                                {project.progress}%
                              </div>
                            </div>
                          </CardBody>
                          <CardFooter>
                            <Row>
                              <Col xs={6}>
                  <span>
                    <i className="ti ti-brand-wechat"></i> {project.membersCount} Members
                  </span>
                              </Col>
                              <Col xs={6}>
                                <ul className="avatar-group float-end breadcrumb-start">
                                  {project.avatars.map((avatar, index) => (
                                      <li
                                          key={index}
                                          className="h-25 w-25 d-flex-center b-r-50 text-bg-danger b-2-light position-relative"
                                          data-bs-toggle="tooltip"
                                          data-bs-title={`Member ${index + 1}`}
                                      >
                                        <img src={avatar} alt="" className="img-fluid b-r-50 overflow-hidden"/>
                                      </li>
                                  ))}
                                  {project.avatars.length > 3 && (
                                      <li
                                          className="text-bg-primary h-25 w-25 d-flex-center b-r-50"
                                          data-bs-toggle="tooltip"
                                          data-bs-title={`${project.avatars.length - 3} More`}
                                      >
                                        {`${project.avatars.length - 3}+`}
                                      </li>
                                  )}
                                </ul>
                              </Col>
                            </Row>
                          </CardFooter>
                        </div>
                      </div>
                  ))}
                </Row>

              </div>
              <div id="tab-2" className={`tab-content ${activeTab === 'tab2' ? 'd-block' : 'd-none'}`}>
                <Row>
                  {designingProjects.map((project) => (
                      <div key={project.id} className="col-md-6 col-xxl-4">
                        <div className="card hover-effect project-app-card">
                          <div className="card-header">
                            <div className="d-flex align-items-center">
                              <div className="h-40 w-40 d-flex-center b-r-50 overflow-hidden">
                                <img src={project.logo} alt="" className="img-fluid"/>
                              </div>
                              <div className="flex-grow-1 ps-2">
                                <Link
                                    to="/apps/e-shop/projects-page/project-details"
                                    target="_blank"
                                    className="fs-6 m-0 f-w-600"
                                >
                                  {project.title}
                                </Link>
                                <div className="text-muted f-s-14">{project.subTitle}</div>
                              </div>
                              <i className="ti ti-dots-vertical"></i>
                            </div>
                          </div>
                          <CardBody>
                            <div className="d-flex">
                              <div>
                                <h6 className="f-w-500">
                                  Start Date :
                                  <span className=" f-s-14 text-secondary">
                      {project.startDate}
                    </span>
                                </h6>
                                <h6 className="f-w-500">
                                  End Date :
                                  <span className=" f-s-14 text-secondary">
                      {project.endDate}
                    </span>
                                </h6>
                              </div>
                              <div className="flex-grow-1 text-end">
                                <p>pricing </p>
                                <h6>{project.price}</h6>
                              </div>
                            </div>
                            <p className="text-muted f-s-14 text-secondary">
                              {project.description}
                            </p>
                            <div className="text-end mb-2">
                <span className={`badge text-light-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
                            </div>
                            <div
                                className="progress w-100"
                                role="progressbar"
                                aria-valuenow={project.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                              <div
                                  className={`progress-bar ${project.status === "Completed" ? "bg-success" : "bg-primary"}`}
                                  style={{width: `${project.progress}%`}}
                              >
                                {project.progress}%
                              </div>
                            </div>
                          </CardBody>
                          <CardFooter>
                            <Row>
                              <Col xs={6}>
                  <span>
                    <i className="ti ti-brand-wechat"></i> {project.membersCount} Members
                  </span>
                              </Col>
                              <Col xs={6}>
                                <ul className="avatar-group float-end breadcrumb-start">
                                  {project.avatars.map((avatar, index) => (
                                      <li
                                          key={index}
                                          className="h-25 w-25 d-flex-center b-r-50 text-bg-danger b-2-light position-relative"
                                          data-bs-toggle="tooltip"
                                          data-bs-title={`Member ${index + 1}`}
                                      >
                                        <img src={avatar} alt="" className="img-fluid b-r-50 overflow-hidden"/>
                                      </li>
                                  ))}
                                  {project.avatars.length > 3 && (
                                      <li
                                          className="text-bg-primary h-25 w-25 d-flex-center b-r-50"
                                          data-bs-toggle="tooltip"
                                          data-bs-title={`${project.avatars.length - 3} More`}
                                      >
                                        {`${project.avatars.length - 3}+`}
                                      </li>
                                  )}
                                </ul>
                              </Col>
                            </Row>
                          </CardFooter>
                        </div>
                      </div>
                  ))}
                </Row>
              </div>
              <div id="tab-3" className={`tab-content ${activeTab === 'tab3' ? 'd-block' : 'd-none'}`}>
                <Row>
                  {developmentProjects.map((project) => (
                      <div key={project.id} className="col-md-6 col-xxl-4">
                        <div className="card hover-effect project-app-card">
                          <div className="card-header">
                            <div className="d-flex align-items-center">
                              <div className="h-40 w-40 d-flex-center b-r-50 overflow-hidden">
                                <img src={project.logo} alt="" className="img-fluid"/>
                              </div>
                              <div className="flex-grow-1 ps-2">
                                <Link
                                    to="/apps/e-shop/projects-page/project-details"
                                    target="_blank"
                                    className="fs-6 m-0 f-w-600"
                                >
                                  {project.title}
                                </Link>
                                <div className="text-muted f-s-14">{project.subTitle}</div>
                              </div>
                              <i className="ti ti-dots-vertical"></i>
                            </div>
                          </div>
                          <CardBody>
                            <div className="d-flex">
                              <div>
                                <h6 className="f-w-500">
                                  Start Date :
                                  <span className=" f-s-14 text-secondary">
                      {project.startDate}
                    </span>
                                </h6>
                                <h6 className="f-w-500">
                                  End Date :
                                  <span className=" f-s-14 text-secondary">
                      {project.endDate}
                    </span>
                                </h6>
                              </div>
                              <div className="flex-grow-1 text-end">
                                <p>pricing </p>
                                <h6>{project.price}</h6>
                              </div>
                            </div>
                            <p className="text-muted f-s-14 text-secondary">
                              {project.description}
                            </p>
                            <div className="text-end mb-2">
                <span className={`badge text-light-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
                            </div>
                            <div
                                className="progress w-100"
                                role="progressbar"
                                aria-valuenow={project.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                              <div
                                  className={`progress-bar ${project.status === "Completed" ? "bg-success" : "bg-primary"}`}
                                  style={{width: `${project.progress}%`}}
                              >
                                {project.progress}%
                              </div>
                            </div>
                          </CardBody>
                          <CardFooter>
                            <Row>
                              <Col xs={6}>
                  <span>
                    <i className="ti ti-brand-wechat"></i> {project.membersCount} Members
                  </span>
                              </Col>
                              <Col xs={6}>
                                <ul className="avatar-group float-end breadcrumb-start">
                                  {project.avatars.map((avatar, index) => (
                                      <li
                                          key={index}
                                          className="h-25 w-25 d-flex-center b-r-50 text-bg-danger b-2-light position-relative"
                                          data-bs-toggle="tooltip"
                                          data-bs-title={`Member ${index + 1}`}
                                      >
                                        <img src={avatar} alt="" className="img-fluid b-r-50 overflow-hidden"/>
                                      </li>
                                  ))}
                                  {project.avatars.length > 3 && (
                                      <li
                                          className="text-bg-primary h-25 w-25 d-flex-center b-r-50"
                                          data-bs-toggle="tooltip"
                                          data-bs-title={`${project.avatars.length - 3} More`}
                                      >
                                        {`${project.avatars.length - 3}+`}
                                      </li>
                                  )}
                                </ul>
                              </Col>
                            </Row>
                          </CardFooter>
                        </div>
                      </div>
                  ))}
                </Row>
              </div>
            </div>
          </Col>
        </Row>


        <Modal isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>Add Project</ModalHeader>
          <ModalBody>
            <Form className="app-form">
              <FormGroup>
                <Label for="title">Project Name</Label>
                <Input
                    type="text"
                    name="title"
                    id="title"
                    placeholder="Designing"
                    value={formValues.title}
                    onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="logo">Image</Label>
                <Input
                    type="file"
                    name="logo"
                    id="logo"
                    onChange={handleFileChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="startDate">Start Date</Label>
                <Input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formValues.startDate}
                    onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="endDate">End Date</Label>
                <Input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formValues.endDate}
                    onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="price">Pricing</Label>
                <Input
                    type="text"
                    name="price"
                    id="price"
                    placeholder="$10k"
                    value={formValues.price}
                    onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label for="description">Project Description</Label>
                <Input
                    type="textarea"
                    name="description"
                    id="description"
                    rows="4"
                    placeholder="Enter Description"
                    value={formValues.description}
                    onChange={handleChange}
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>
              Close
            </Button>
            <Button color="primary" onClick={addProject}>
              Save Project
            </Button>
          </ModalFooter>
        </Modal>




      </Container>
  );
};

export default Projects;
