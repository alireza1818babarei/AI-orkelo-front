import { useEffect } from 'react';
import {Card, CardBody, CardHeader, Table} from "reactstrap";
import {patientsData} from "../../Data/Datatable/patientsData";
// import ("../../../../public/assets/vendor/datatable/jquery.dataTables.min.css");
// import ("../../../../public/assets/vendor/datatable/jquery.dataTables.min.js");





const PatientsTable = () => {

    useEffect(() => {
        setTimeout(() => {
            new DataTable('#patientsTable');
        }, 1000)
    }, []);


    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Patients List</h5>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="app-scroll table-responsive app-datatable-default">
                        <Table id="patientsTable" className="w-100 display patients-list-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Patient ID</th>
                                <th>Number</th>
                                <th>Age</th>
                                <th>Last Visit</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {patientsData.map((patient) => (
                                <tr key={patient.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            {patient.avatar ? (
                                                <div
                                                    className="h-30 w-30 d-flex-center b-r-50 overflow-hidden text-bg-dark">
                                                    <img src={patient.avatar} alt={patient.name} className="img-fluid"/>
                                                </div>
                                            ) : (
                                                <span
                                                    className={`bg-${patient.statusColor} h-30 w-30 d-flex-center b-r-50`}>
                                            {patient.initials}
                                        </span>
                                            )}
                                            <p className="mb-0 ps-2">{patient.name}</p>
                                        </div>
                                    </td>
                                    <td>{patient.address}</td>
                                    <td className="f-w-500">{patient.patientId}</td>
                                    <td className="text-success">{patient.contact}</td>
                                    <td>{patient.age}</td>
                                    <td>{patient.lastVisit}</td>
                                    <td>
                                        <span color={patient.statusColor}
                                               className={`badge text-outline-${patient.statusColor}`}>
                                            {patient.status}
                                        </span>
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

export default PatientsTable;