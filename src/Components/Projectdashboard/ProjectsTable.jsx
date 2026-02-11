import React, {useEffect} from 'react'
import { Card, CardBody, Col, Table, Badge ,Button } from 'reactstrap';
import {projects} from "../../Data/Dashboards/ProjectData"

import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import {Link} from 'react-router-dom'
const ProjectsTable = () => {

    useEffect(() => {
      setTimeout(() => {
        const props = {
          searching: false,  // Disable sorting functionality
          paging: false     // Disable pagination
        }
        new DataTable('#ProjectsDatatable');
        return () => {

          new DataTable('#ProjectsDatatable').destroy();
        };
      }, 1000)
      }, []);
  return (
    <>
      <Col xl="9" className="order-1-md">
      <Card>
        <CardBody className="p-0">
          <div className="table-responsive Projects-datatable  app-datatable-default app-scroll">
              <Table id="ProjectsDatatable" className="display">
                <thead>
                <tr>
                  <th>
                    <label className="check-box">
                      <input type="checkbox" />
                      <span className="checkmark outline-light ms-2"></span>
                    </label>
                  </th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Team</th>
                  <th>Preview</th>
                  <th>Tracking</th>
                  <th>Progress</th>
                  <th>Due Date</th>
                </tr>
                </thead>
                <tbody>
                {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <label className="check-box">
                          <input type="checkbox" />
                          <span className="checkmark outline-light ms-2"></span>
                        </label>
                      </td>
                      <td>
                        <div className="position-relative">
                          <div
                              className={`h-35 w-35 d-flex-center b-r-50 overflow-hidden ${project.bgClass} ${project.borderClass} p-1 position-absolute me-3`}
                          >
                            <i className={`${project.iconClass} f-s-16`}></i>
                          </div>
                          <div className="ms-5">
                            <h6 className="f-s-15 f-w-600 mb-0">{project.name}</h6>
                            <p className="f-s-13 text-secondary mb-0">{project.teamLead}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge
                            className={project.status === "In Progress" ? "bg-light-info" : project.status === "Completed" ? "bg-light-success" : project.status === "Pending" ? "bg-light-warning" : project.status === "On Hold" ? "bg-light-danger" :
                                "bg-light-secondary"
                            }
                        >
                          <i className={`ti ti-download me-1`}></i> {project.status}
                        </Badge>
                      </td>
                      <td>{project.type}</td>
                      <td>
                        <ul className="avatar-group justify-content-start">
                          {project.teamMembers.map((member, idx) => (
                              <li key={idx} className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-primary b-2-light" data-bs-toggle="tooltip" data-bs-title={member.name}>
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="img-fluid" />
                                ) : (
                                    // <span className="text-bg-secondary h-25 w-25 d-flex-center b-r-50">{member.name}</span>
                                    <span className="text-bg-secondary h-25 w-25 d-flex-center b-r-50">
                                    {member.name === "10 More" ? "10+" : member.name}
                                </span>
                                )}
                              </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <Link to={project.previewLink}  rel="noopener noreferrer">
                          {project.previewLink}
                        </Link>
                      </td>
                      <td>
                        <div className="time-tracking-box">
                          <i className="ph-duotone ph-clock f-s-12"></i>
                          <span className="f-s-12">{project.timeTracking}</span>
                          <Badge color="warning">
                            <i className="ph ph-play-pause text-white f-s-13"></i>
                          </Badge>
                        </div>
                      </td>
                      <td>{project.progress}</td>
                      <td>{project.dueDate}</td>
                    </tr>
                ))}
                </tbody>
              </Table>
          </div>
        </CardBody>
      </Card>
    </Col>

    <Col md="5" xxl="3" >

    <Card>
          <CardBody>
            <h5 className="header-title-text">Data Folder & Files</h5>

            <div className="data-list-box mt-3">
              <div className="filebox">
                <div className="d-flex align-items-center">
                  <img src="/assets/images/icons/10.png" className="w-35 h-35" alt="" />
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-0">React Data</h6>
                    <p className="text-secondary mb-0">18 Files</p>
                  </div>
                  <p className="text-secondary f-w-500">32GB</p>
                </div>
              </div>
              <div className="filebox">
                <div className="d-flex align-items-center">
                  <img src="/assets/images/icons/02.png" className="w-35 h-35" alt="" />
                  <div className="flex-grow-1 ms-2">
                    <h6 className="mb-0">React Data</h6>
                    <p className="text-secondary mb-0">18 Files</p>
                  </div>
                  <p className="text-secondary f-w-500">32GB</p>
                </div>
              </div>
              <div>
                <Button color="primary" className="b-r-15 w-100">
                  View More
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="card-dark milestones-card">
          <CardBody>
            <div className="milestones-image">
              <img src="/assets/images/dashboard/project/04.png" alt="" />
            </div>
            <div className="text-center">
              <h4 className="text-white">
                There are no <span className="text-primary">milestones</span> for today
              </h4>
              <p className="text-light mb-0">You can create milestones.</p>
              <Button color="primary" className="b-r-24 mt-3">
                <i className="ph ph-plus me-2"></i>Create Milestones
              </Button>
            </div>
          </CardBody>
        </Card>

    </Col>

    </>
  )
}

export default ProjectsTable
