import React from 'react';
import { useState } from 'react';
import {Modal, Button, Form, FormGroup, Label, Input, Row, Col, Table, Badge, Container, Card} from 'reactstrap';
import {tododata} from "@/Data/Todo/tododata";
const ToDo = () => {

  const [tasks, setTasks] = useState([
    { id: 1, name: "Ra-Admin & Dashboard" },
    { id: 2, name: "Project Management" },
    { id: 3, name: "Chat Application" },
    { id: 4, name: "Todo App" },
    { id: 5, name: "React Weather App" },
    { id: 6, name: "Tic-Tac-Toe" },
    { id: 7, name: "Stopwatch" },
    { id: 8, name: "Calculator App" },
    { id: 9, name: "Ecommerce Site" },
    { id: 10, name: "Chat Application" },
  ]);

  const [newTask, setNewTask] = useState("");

  // Add Task
  const handleAddTask = () => {
    if (newTask.trim() === "") {
      alert("Enter Task Name!!!!");
      return;
    }
    const newTaskItem = {
      id: tasks.length + 1,
      name: newTask,
    };
    setTasks([...tasks, newTaskItem]);
    setNewTask(""); // Clear input field
  };

  // Delete Task
  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);

  };

  var options = {
    valueNames: ['id', 'task','assign', 'notes', 'date', 'status',],
  };

// Init list



  
  return (
    <div>
      <Container fluid >

      <Row className="m-1">
              <Col xs={12}>
                <h4 className="main-title">Todo</h4>
                <ul className="app-line-breadcrumbs mb-3">
                  <li className="">
                    <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                    </a>
                  </li>
                  <li className="active">
                    <a href="#" className="f-s-14 f-w-500">Todo</a>
                  </li>
                </ul>
              </Col>
            </Row>

            <Row >
            <Col xl={3} >
      <Card>
        <div className="card-body">
          {/* Add Task Button */}
          <button
            type="button"
            className="btn btn-primary btn-lg w-100"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
          >
            <i className="ti ti-plus"></i> Add Project
          </button>

          {/* Modal */}
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">
                    Create Task
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Task Name</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Default input"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleAddTask}
                    data-bs-dismiss="modal"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="todo-container mt-3">
            {tasks.map((task) => (
              <div className="task d-flex align-items-center justify-content-between" key={task.id}>
                <span>{task.name}</span>
                <button
                  className="btn btn-sm p-1 border-0 delete"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <i className="ti ti-trash text-danger f-s-18"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>
          </Col>
              <Col xl={9}>
                <div id="myTodo">
                  <Card>
                    <div className="card-body">
                      <div className="d-flex gap-1">
                        <div className="flex-grow-1">
                          <form className="me-3 app-form app-icon-form search-lg h-100" action="#">
                            <div className="position-relative h-100">
                              <input type="search" className="form-control search h-100 pe-4" placeholder="Search..."
                                     aria-label="Search"/>
                                <i className="ti ti-search text-dark icon-search"></i>
                            </div>
                          </form>
                        </div>
                        <div>
                          <button type="button" className="btn btn-primary w-100" data-bs-toggle="modal"
                                  data-bs-target="#exampleModal1">Add
                          </button>
                          <div className="modal fade" id="exampleModal1" tabIndex="-1"
                               aria-labelledby="exampleModalLabel"
                               aria-hidden="true">
                            <form className="app-form" id="add_employee_todo">
                              <div className="modal-dialog">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h1 className="modal-title fs-5" id="exampleModalLabel">Add Employee
                                    </h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal"
                                            aria-label="Close"></button>
                                  </div>
                                  <div className="modal-body">
                                    <div className="task mb-3">
                                      <input type="hidden" id="id-field"/>
                                        <label className="form-label">Employee :</label>
                                        <input className="form-control" type="text" id="task-field"
                                               placeholder="Enter Your Task"
                                               required/>
                                    </div>

                                    <div className="assign mb-3">
                                      <label className="form-label">Assign :</label>
                                      <input className="form-control" type="text" id="assign-field" placeholder="Assign"
                                             required/>
                                    </div>


                                    <div className="date mb-3">
                                      <label className="form-label">date :</label>
                                      <input className="form-control" type="date" id="date-field" required/>
                                    </div>

                                    <div className="notes mb-3">
                                      <label className="form-label">Notes :</label>
                                      <textarea className="form-control" rows="3" placeholder="Enter Your Notes"
                                                id="notes-field"></textarea>
                                    </div>

                                    <div className="status mb-3">
                                      <label className="form-label">status :</label>
                                      <select className="form-select" id="status-field"
                                              aria-label="Default select example">
                                        <option value="">Status</option>
                                        <option value="success">High</option>
                                        <option value="warning">Medium</option>
                                        <option value="danger">Low</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="modal-footer add">
                                    <input type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                           value="Close"/>
                                      <button className="btn btn-primary" id="add-btn" value="Add">Add</button>
                                      <button className="btn btn-success" id="edit-btn">Edit</button>
                                  </div>
                                </div>
                              </div>
                            </form>

                          </div>
                        </div>
                      </div>
                    </div>

                  </Card>
                  <Card>
                    <div className="table-responsive app-scroll">
                      <Table className="table-bottom-border table-lg align-middle todo-table">
                        <thead>
                        <tr>
                          <th>
                            <Input type="checkbox" className="form-check-input ms-2" />
                          </th>
                          <th className="d-none">Id</th>
                          <th>Task</th>
                          <th>Priority</th>
                          <th>Assign</th>
                          <th>Due Date</th>
                          <th>Notes</th>
                          <th>Edit</th>
                          <th>Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tododata.map((item) => (
                            <tr key={item.id}>
                              <th scope="row">
                                <Input
                                    type="checkbox"
                                    className="form-check-input ms-2"
                                    value={item.id}
                                />
                              </th>
                              <td className="d-none">{item.id}</td>
                              <td className="task f-w-500 text-dark">{item.task}</td>
                              <td className="status">
                                <Badge
                                    color={
                                      item.priority === "High"
                                          ? "success"
                                          : item.priority === "Medium"
                                          ? "warning"
                                          : "danger"
                                    }
                                    className="text-uppercase"
                                >
                                  {item.priority}
                                </Badge>
                              </td>
                              <td>{item.assign}</td>
                              <td className="text-danger">{item.dueDate}</td>
                              <td>
                  <span className="text-dark f-s-14">
                    <i className="ti ti-circle-filled me-2 f-s-6"></i>
                    {item.notes}
                  </span>
                              </td>
                              <td>
                                <Button
                                    outline
                                    color="success"
                                    className="icon-btn edit-item-btn" data-bs-target="#exampleModal1"
                                >
                                  <i className="ti ti-edit"></i>
                                </Button>
                              </td>
                              <td>
                                <Button
                                    outline
                                    color="danger"
                                    className="icon-btn remove-item-btn"
                                >
                                  <i className="ti ti-trash"></i>
                                </Button>
                              </td>
                            </tr>
                        ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card>


                </div>
              </Col>

    </Row>
    </Container>
    </div>
  );
};

export default ToDo;