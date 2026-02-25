import React, { useEffect, useState } from "react";
import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.min.css";
import { useDispatch, useSelector } from "react-redux";
import ProfileAppTabs from "@/Components/Profileapp/profileAppTabs";
import AboutMe from "@/Components/Profileapp/AboutMe";
import { projectData } from "@/Data/Projectapp/ProjectAppData";
import { Col, Container, Row } from "reactstrap";
import ProfileCard from "../../Components/Profileapp/ProfileCard";
import { getMyProfileThunk } from "@/store/auth/authSlice";

const getProjectStatusClassName = (status) => {
  if (status === "Completed") return "text-light-success";
  if (status === "New") return "text-light-secondary";
  return "text-light-primary";
};

const Profile = () => {
  const dispatch = useDispatch();
  const profileStatus = useSelector((s) => s.auth?.profileStatus ?? "idle");

  useEffect(() => {
    GLightbox({
      selector: ".glightbox",
    });
  }, []);

  useEffect(() => {
    if (profileStatus !== "idle") return;
    dispatch(getMyProfileThunk());
  }, [dispatch, profileStatus]);

  const [data, setData] = useState("tab1");
  const mockProfileProjects = projectData;

  return (
    <Container fluid>
      <Row className=" m-1">
        <Col xs={12}>
          <div className="d-flex align-items-center gap-1 mb-3">
            <i className="ph-duotone  ph-user fs-3 text-primary"></i>
            <h4 className="main-title">Profile</h4>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={3}>
          <ProfileAppTabs data={data} setData={setData} />
        </Col>
        <div className="col-lg-9">
          {data === "tab1" && (
            <>
              <ProfileCard />
            </>
          )}

          {data === "tab3" && (
            <Row>
              {mockProfileProjects.map((project) => {
                const visibleAvatars = project.avatars.slice(0, 3);
                const extraAvatarsCount = Math.max(project.avatars.length - 3, 0);

                return (
                  <Col key={project.id} md={6} xxl={4} className="mb-4">
                    <div className="card hover-effect project-app-card h-100">
                      <div className="card-header">
                        <div className="d-flex align-items-center">
                          <div className="h-40 w-40 d-flex-center b-r-50 overflow-hidden">
                            <img src={project.logo} alt={project.title} className="img-fluid" />
                          </div>
                          <div className="flex-grow-1 ps-2">
                            <h6 className="fs-6 m-0 f-w-600">{project.title}</h6>
                            <div className="text-muted f-s-14">{project.subTitle}</div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="d-flex">
                          <div>
                            <h6 className="f-w-500">
                              Start Date :
                              <span className=" f-s-14 text-secondary">{project.startDate}</span>
                            </h6>
                            <h6 className="f-w-500">
                              End Date :
                              <span className=" f-s-14 text-secondary">{project.endDate}</span>
                            </h6>
                          </div>
                          <div className="flex-grow-1 text-end">
                            <p>pricing </p>
                            <h6>{project.price}</h6>
                          </div>
                        </div>
                        <p className="text-muted f-s-14 text-secondary">{project.description}</p>
                        <div className="text-end mb-2">
                          <span className={`badge ${getProjectStatusClassName(project.status)}`}>
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
                            className={`progress-bar ${
                              project.status === "Completed" ? "bg-success" : "bg-primary"
                            }`}
                            style={{ width: `${project.progress}%` }}
                          >
                            {project.progress}%
                          </div>
                        </div>
                      </div>
                      <div className="card-footer">
                        <Row>
                          <Col xs={6}>
                            <span>
                              <i className="ti ti-brand-wechat"></i> {project.membersCount} Members
                            </span>
                          </Col>
                          <Col xs={6}>
                            <ul className="avatar-group float-end breadcrumb-start">
                              {visibleAvatars.map((avatar, index) => (
                                <li
                                  key={`${project.id}-${index}`}
                                  className="h-25 w-25 d-flex-center b-r-50 text-bg-danger b-2-light position-relative"
                                  data-bs-toggle="tooltip"
                                  data-bs-title={`Member ${index + 1}`}
                                >
                                  <img
                                    src={avatar}
                                    alt={`Member ${index + 1}`}
                                    className="img-fluid b-r-50 overflow-hidden"
                                  />
                                </li>
                              ))}
                              {extraAvatarsCount > 0 && (
                                <li
                                  className="text-bg-primary h-25 w-25 d-flex-center b-r-50"
                                  data-bs-toggle="tooltip"
                                  data-bs-title={`${extraAvatarsCount} More`}
                                >
                                  {`${extraAvatarsCount}+`}
                                </li>
                              )}
                            </ul>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </Row>
    </Container>
  );
};

export default Profile;
