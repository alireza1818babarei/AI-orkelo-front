import React, {useEffect} from 'react';
import { Table} from "reactstrap";
import {employeesData} from "@/Data/Datatable/borderedDatatable";
import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';


const BorderedDatatable = () => {
    useEffect(() =>
    {setTimeout(() => {
        new DataTable('#BorderedDataTable').destroy();
    }, 1000)
    }, []);

    return (
        <>
            <div className="app-scroll table-responsive app-datatable-default">
                <Table id="BorderedDataTable" className="w-100 display row-border-table align-middle">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Office</th>
                        <th>Age</th>
                        <th>Start date</th>
                        <th>Salary</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employeesData.map((employee, index) => (
                        <tr key={index}>
                            <td>
                                <div className="d-flex align-items-center">
                                    <div className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-info">
                                        <img src={employee.imageUrl} alt={employee.name} className="img-fluid"/>
                                    </div>
                                    <p className="mb-0 ps-2">{employee.name}</p>
                                </div>
                            </td>
                            <td>{employee.position}</td>
                            <td>{employee.location}</td>
                            <td>{employee.age}</td>
                            <td>{employee.salary}</td>
                            <td>{employee.totalSalary}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </>
    );
};

export default BorderedDatatable;