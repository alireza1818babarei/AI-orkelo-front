import React, { useState } from "react";
import {Button, Card, CardBody, Col, ListGroup, ListGroupItem, Input} from "reactstrap";
import Chart from "react-apexcharts";
import {activityHoursChart, progressUser, totalCourses} from "../../Data/Charts/EducationChart";

const ProgressCards = () => {

    const [tasks, setTasks] = useState([
        "Create Brand design & Logo",
        "Create To-Do Using React js",
        "Create Countdown Using js",
        "Create Form Validation Page",
        "Create Speech Detection",
        "Create Webpage Filter",
        "Create Note app",
        "Create Admin",
    ]);
    const [currentTask, setCurrentTask] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);

    const handleAddTask = () => {
        if (currentTask.trim() === "") return;

        if (editingIndex !== null) {
            const updatedTasks = [...tasks];
            updatedTasks[editingIndex] = currentTask;
            setTasks(updatedTasks);
            setEditingIndex(null);
        } else {
            setTasks([currentTask, ...tasks]);
        }
        setCurrentTask("");
    };

    const handleEditTask = (index) => {
        setCurrentTask(tasks[index]);
        setEditingIndex(index);
    };

    const handleDeleteTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };

    return (
        <>
            <Col md="5" lg="3" xxl="4" className="order-4-lg">
                <Card>
                    <CardBody>
                        <h5 className="header-title-text">Spent Hours</h5>

                        <div className="mt-3">
                            <Chart options={activityHoursChart} series={activityHoursChart.series} type="line" height={280}/>
                        </div>

                        <div className="spent-hours-content">
                            <div>
                                <h6 className="mb-0">20H</h6>
                                <p className="text-secondary mb-0">Time Spent</p>
                            </div>
                            <div>
                                <h6 className="mb-0">45</h6>
                                <p className="text-secondary mb-0">Lessons taken</p>
                            </div>
                            <div>
                                <h6 className="mb-0">200</h6>
                                <p className="text-secondary mb-0">Lessons remaining</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col md="7" lg="4" className="order-2-lg">
                <Card>
                    <CardBody>
                        <h5 className="header-title-text">Today Task</h5>
                        <div className="mt-3">
                            <div className="today-task-input">
                                <div className="input-group mb-3">
                                    <Input
                                        type="text"
                                        className="form-control b-r-left"
                                        value={currentTask}
                                        onChange={(e) => setCurrentTask(e.target.value)}
                                        placeholder="Enter Your Task"
                                        aria-label="Enter Your Task"
                                    />
                                    <Button
                                        color="secondary"
                                        className="b-r-right"
                                        onClick={handleAddTask}
                                    >
                                        {editingIndex !== null ? "Edit" : "Add"}
                                    </Button>
                                </div>
                            </div>

                            <ListGroup className="today-task-list app-scroll">
                                {tasks.map((task, index) => (
                                    <ListGroupItem key={index} className="d-flex justify-content-between align-items-center border-0">
                                        <span className="task-text">{task}</span>
                                        <div className="task_actions">
                                           <span
                                               className="task-edit me-2"
                                               onClick={() => handleEditTask(index)}
                                               style={{ cursor: "pointer" }}
                                           >
                                             <i className="ph-duotone ph-note-pencil f-s-18 text-success"></i>
                                           </span>
                                                                   <span
                                                                       className="task-delete"
                                                                       onClick={() => handleDeleteTask(index)}
                                                                       style={{ cursor: "pointer" }}
                                                                   >
                                             <i className="ph-duotone ph-trash f-s-18 text-danger"></i>
                                           </span>
                                        </div>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col lg="3" xxl="4" className="order-1-lg education-courses-card">
                <div className="row">

                    {/* Total Courses Card */}
                    <Col xs="6" lg="12">
                        <Card>
                            <CardBody>
                                <h5 className="header-title-text">Total Courses</h5>
                                <p className="text-secondary mb-0">Latest Update</p>
                                <div className="d-flex justify-content-between mt-2">
                                    <h3 className="text-dark mb-0">2K+</h3>
                                    <div className="total-courses flex-grow-1">
                                        <Chart options={totalCourses} series={totalCourses.series} type="bar" height={150}/>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xs="6" lg="12">
                        <Card>
                            <CardBody>
                                <h5 className="header-title-text">User Progress</h5>
                                <p className="text-secondary mb-0">Latest Update</p>
                                <div className="d-flex justify-content-between mt-2">
                                    <h3 className="text-dark mb-0">89%</h3>
                                    <div className="progress-user flex-grow-1">
                                        <Chart options={progressUser} series={progressUser.series} type="line" height={150}/>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                </div>
            </Col>
        </>
    );
};

export default ProgressCards;