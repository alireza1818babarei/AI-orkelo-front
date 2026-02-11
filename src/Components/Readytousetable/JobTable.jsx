import React, {useEffect} from 'react';
import {Card, CardBody, CardHeader} from "reactstrap";
import { Table } from 'reactstrap';
import {paymentData} from "../../Data/Datatable/jobData";
// import $ from "jquery";

const JobTable = () => {

    useEffect(() => {
        setTimeout(() => {
            new DataTable('#jobTable');
        }, 1000)
    }, []);


    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Job Resumes</h5>
                </CardHeader>
                <CardBody className="p-0">

                    <div className="app-scroll table-responsive app-datatable-default">
                        <Table id="jobTable" className="w-100 display job-resumes-table">
                            <thead>
                            <tr>
                                <th></th>
                                <th>NAME</th>
                                <th>COURSE</th>
                                <th>EXPERIENCE</th>
                                <th>RATE</th>
                                <th>ADDRESS</th>
                                <th>REVIEW</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paymentData.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-dark">
                                            {item.avatar ? (
                                                <div
                                                    className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-dark">
                                                    <img src={item.avatar} alt={item.name} className="img-fluid"/>
                                                </div>
                                            ) : (
                                                <span
                                                    className={`bg-${item.statusColor} h-30 w-30 d-flex-center b-r-50`}>
                                            {item.initials}
                                        </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.course}</td>
                                    <td>{item.experience}</td>
                                    <td>{item.rate}</td>
                                    <td>{item.address}</td>
                                    <td>
                                        <div>
                                            {[...Array(5)].map((_, idx) => (
                                                <i
                                                    key={idx}
                                                    className={`ti ti-star-filled f-s-16 ${
                                                        idx < item.review ? 'text-warning' : 'text-light'
                                                    }`}
                                                />
                                            ))}
                                        </div>
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
                                                <li>
                                                    <a className="dropdown-item" href="#">
                                                        <i className="ti ti-edit"></i> Edit
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" href="#">
                                                        <i className="ti ti-trash"></i> Delete
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>

                </CardBody>
            </Card>
        </>
    );
};

export default JobTable;