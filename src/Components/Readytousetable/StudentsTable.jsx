import React, {useEffect} from 'react';
import {Card, CardBody, CardHeader, Table} from "reactstrap";
import {studentsData} from "@/Data/Datatable/studentsData";
// import $ from "jquery";

const StudentsTable = () => {

    useEffect(() => {
        setTimeout(() => {

            new DataTable('#studentsTable');
        }, 1000)
    }, []);

    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Students List</h5>
                </CardHeader>
                <CardBody className="p-0">

                    <div className="app-scroll table-responsive app-datatable-default">
                        <table id="studentsTable" className="w-100 display student-list-table">
                            <thead>
                            <tr>
                                <th>
                                    <input className="form-check-input mt-0 " type="checkbox" id="select-all"/>
                                </th>
                                <th>Name</th>
                                <th>Parent Name</th>
                                <th>ID</th>
                                <th>Contact</th>
                                <th>City</th>
                                <th>Date</th>
                                <th>Grade</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {studentsData.map((student, index) => (
                                <tr key={index}>
                                    <td>
                                        <input className="form-check-input mt-0 " type="checkbox"/>
                                    </td>
                                    <td>{student.name}</td>
                                    <td>{student.parentName}</td>
                                    <td className="f-w-500">{student.id}</td>
                                    <td className="text-success">{student.contact}</td>
                                    <td>{student.city}</td>
                                    <td>{student.date}</td>
                                    <td>
                                        <span className={`badge text-light-${student.grade === 'A' ? 'success' : 'warning'}`}>
                                          {student.grade}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="btn-group dropdown-icon-none">
                                            <button
                                                className="btn border-0 icon-btn b-r-4 dropdown-toggle active"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                data-bs-auto-close="true"
                                                aria-expanded="false"
                                            >
                                                <i className="ti ti-dots-vertical"></i>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li><a className="dropdown-item" href="#"><i
                                                    className="ti ti-edit"></i> Edit </a></li>
                                                <li><a className="dropdown-item" href="#"><i
                                                    className="ti ti-trash"></i> Delete </a></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                </CardBody>
            </Card>
        </>
    );
};

export default StudentsTable;