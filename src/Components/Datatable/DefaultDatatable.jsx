import React, {useEffect} from 'react';
import { Table} from "reactstrap";
import {users} from "@/Data/Datatable/defaultDatatable";
import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';


const DefaultDatatable = () => {

    useEffect(() => {
        setTimeout(() => {
            new DataTable('#DefaultDataTable').destroy();
        }, 1000)
    }, []);

    return (
        <>
            <div className="app-scroll table-responsive app-datatable-default">
                <Table id="DefaultDataTable" className="w-100 display default-data-table align-middle">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Office</th>
                        <th>Age</th>
                        <th>Start date</th>
                        <th>Salary</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.name}</td>
                            <td>
                                <span className="badge text-light-primary">{user.position}</span>
                            </td>
                            <td>{user.location}</td>
                            <td>{user.age}</td>
                            <td>{user.salary}</td>
                            <td>{user.totalSalary}</td>
                            <td>
                                <button type="button" className="btn btn-light-success icon-btn b-r-4">
                                    <i className="ti ti-edit text-success"></i>
                                </button>{" "}
                                <button type="button" className="btn btn-light-danger icon-btn b-r-4 delete-btn">
                                    <i className="ti ti-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </>
    );
};

export default DefaultDatatable;