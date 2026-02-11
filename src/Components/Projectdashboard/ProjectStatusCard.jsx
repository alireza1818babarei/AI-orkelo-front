import React from 'react'
import { Card, CardBody, Row, Col } from 'reactstrap';
import {hoursRedial, projectEarning, spendhoursRedial} from "../../Data/Charts/projectCharts";
import Chart from "react-apexcharts";

const ProjectStatusCard = () => {

    const projectData = {
        projectCount: '35k',
        assigned: 60,
        inProgress: 20,
        completed: '2k',
        onTimeCompletion: 89,
        projectTeam: [
          { initials: 'A', color: 'danger', name: 'Everlee Lambert' },
          { initials: 'CD', color: 'dark', name: 'Hunter Scott' },
          { initials: 'XYZ', color: 'warning', name: 'Hunter Scott' },
          { initials: '2+', color: 'secondary', name: '2 More' },
        ],
        hoursWorked: 60,
        tasksCompleted: '100/85',
      };

      const messages = [
        { id: 1, name: 'Emily Johnson', message: 'Could we discuss the project timeline?', avatar: '/assets/images/avtar/1.png' },
        { id: 2, name: 'David Smith', message: 'I\'m impressed with the progress so far!', avatar: '/assets/images/avtar/2.png' },
        { id: 3, name: 'Samantha Brown', message: 'Can we have a quick update meeting?', avatar: '/assets/images/avtar/3.png' },
        { id: 4, name: 'Michael Davis', message: 'Looking forward to the next milestone.', avatar: '/assets/images/avtar/4.png' },
        { id: 5, name: 'Jennifer Martinez', message: 'Is there any way to expedite the delivery?', avatar: '/assets/images/avtar/5.png' },
      ];

      const earnings = [
        { label: 'Income', amount: '$68,200', icon: 'ph-circle text-warning' },
        { label: 'Total', amount: '$12,200', icon: 'ph-circle text-success' },
      ];

  return (
    <>
    <Col lg="8" xxl="6" className="order--2-lg">
    <Card className="equal-card">
      <CardBody>
        <Row>
          <Col sm="9">
            <h5 className="header-title-text">Project Status</h5>
            <div className="project-status-box">
              <div className="project-status-card bg-primary">
                <span className="bg-light-light h-45 w-45 d-flex-center b-r-50">
                  <i className="ph-fill ph-projector-screen-chart"></i>
                </span>
                <p className="mb-0 mt-2">Project</p>
                <h4 className="text-white f-w-600">{projectData.projectCount}</h4>
              </div>
              <div className="project-status-card bg-dark">
                <span className="bg-light-light h-45 w-45 d-flex-center b-r-50">
                  <i className="ph-bold ph-circles-three-plus"></i>
                </span>
                <p className="mb-0 mt-2">Assigned</p>
                <h4 className="text-white f-w-600">{projectData.assigned}</h4>
              </div>
              <div className="project-status-card bg-warning">
                <span className="bg-light-dark h-45 w-45 d-flex-center b-r-50">
                  <i className="ph ph-chart-line-up"></i>
                </span>
                <p className="mb-0 mt-2">In Progress</p>
                <h4 className="text-white f-w-600">{projectData.inProgress}</h4>
              </div>
              <div className="project-status-card">
                <span className="bg-light-secondary h-45 w-45 d-flex-center b-r-50">
                  <i className="ph-bold ph-check-circle"></i>
                </span>
                <p className="mb-0 mt-2">Completed</p>
                <h4 className="f-w-600">{projectData.completed}</h4>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <div>
                <p className="f-s-16 text-secondary mb-0">On Time Completion Rating :</p>
              </div>
              <h5>{projectData.onTimeCompletion}%</h5>
            </div>

            <div className="progress-box bg-light-secondary w-100 mt-3">
              <div className="progress-content">
                <div>
                  <div className="left d-flex align-items-center">
                    <b className="me-1 ms-1">85%</b> Processing
                  </div>
                  <div className="right">
                    <i className="fa fa-close"></i>
                  </div>
                </div>
              </div>
              <div className="progress w-100 h-8">
                <div className="progress-bar bg-secondary h-8" style={{ width: '75%' }}></div>
              </div>
            </div>
          </Col>

          <Col sm="3" className="pt-3 pt-sm-0">
            <h5 className="header-title-text">Project Team</h5>
            <div className="mt-3">
              <ul className="avatar-group justify-content-start mt-3">
                {projectData.projectTeam.map((member, index) => (
                  <li
                    key={index}
                    className={`text-bg-${member.color} h-45 w-45 d-flex-center b-r-50`}
                    data-bs-toggle="tooltip"
                    data-bs-title={member.name}
                  >
                    {member.initials}
                  </li>
                ))}
              </ul>
            </div>

            <div className="project-hour-box">
              <div className="flex-grow-1">
                <p className="f-s-18 f-w-500 text-secondary mb-0">
                  Hours: <span className="f-w-600 text-primary">{projectData.hoursWorked}</span>
                </p>
                <div>
                  <Chart options={hoursRedial} series={hoursRedial.series} type="radialBar" height={100} width={80}/>
                </div>
              </div>
            </div>
            <div className="project-hour-box">
              <div className="flex-grow-1">
                <p className="f-s-18 f-w-500 text-secondary mb-0">
                  Task: <span className="f-w-600 text-success">{projectData.tasksCompleted}</span>
                </p>
                <div>
                  <Chart options={spendhoursRedial} series={spendhoursRedial.series} type="radialBar" height={100} width={80}/>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
    </Col>

      <Col md="6" lg="3">
        <Card>
          <CardBody>
          <h5 className="header-title-text">Messages</h5>

          <ul className="messages-list mt-3">
            {messages.map((message) => (
              <li key={message.id} className="messages-list-item">
                <div className={`h-40 w-40 d-flex-center b-r-15 overflow-hidden messages-list-avtar ${message.id % 2 === 0 ? 'text-bg-light' : 'text-bg-secondary'}`}>
                  <img src={message.avatar} alt={message.name} className="img-fluid" />
                </div>
                <div className="messages-list-content">
                  <h6 className="mb-0 f-s-16">{message.name}</h6>
                  <p className="mb-0 f-s-13 text-secondary">{message.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </Col>

    <Col md="6" lg="4" xxl="3">
      <Card>
        <CardBody className="p-0">
          <div className="p-3">
            <h6 className="f-w-500 text-secondary mb-0">
              <i className="ph-bold ph-caret-left me-2"></i>Feb 02 - Feb 08
            </h6>

            <div className="project-earning mt-3">
              {earnings.map((earning, index) => (
                <div key={index} className="project-earning-label">
                  <h6 className="mb-0">
                    <i className={`ph-fill ${earning.icon} f-s-14 me-2`}></i>
                    {earning.amount}
                  </h6>
                  <p className="text-secondary mb-0 ms-4">{earning.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="project-earning-chart">
            <Chart options={projectEarning} series={projectEarning.series} type="line"
                                                height={190}/>
          </div>

          <div className="p-3 project-earning-content">
            <p className="mb-0">
              In the symphony of success, our total project income resonates as the crescendo of our endeavors.
            </p>
          </div>
        </CardBody>
      </Card>
    </Col>
    </>
  )
}

export default ProjectStatusCard
