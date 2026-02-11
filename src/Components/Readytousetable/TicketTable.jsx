import { useEffect } from 'react';
import {Card, CardBody, CardHeader, Table} from "reactstrap";
import {ticketsData} from "@/Data/Datatable/ticketData";


const TicketTable = () => {
    useEffect(() => {
        setTimeout(() => {
            new DataTable('#ticketTable');
        }, 1000)
    }, []);

    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Ticket Detail</h5>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="app-scroll table-responsive app-datatable-default">
                        <Table id="ticketTable" className="w-100 display ticket-detail-table">
                            <thead>
                            <tr>
                                <th>AGENT</th>
                                <th>DEPARTMENT</th>
                                <th>ID</th>
                                <th>TITLE</th>
                                <th>ACTIVITY</th>
                                <th>DATE</th>
                                <th>PRIORITY</th>
                            </tr>
                            </thead>
                            <tbody>
                            {ticketsData.map((ticket, index) => (
                                <tr key={index}>
                                    <td>{ticket.agent}</td>
                                    <td>{ticket.department}</td>
                                    <td className="f-w-500">{ticket.id}</td>
                                    <td><p>{ticket.title}</p></td>
                                    <td className={`text-${ticket.activity === 'No reply yet' ? 'danger' : 'success'} f-w-500`}>
                                        {ticket.activity}
                                    </td>
                                    <td>{ticket.date}</td>
                                    <td>
                                        <span className={`badge ${ticket.priorityClass}`}>{ticket.priority}</span>
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

export default TicketTable;