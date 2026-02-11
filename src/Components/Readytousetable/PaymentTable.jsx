import React, {useEffect} from 'react';
import {Card, CardBody, CardHeader, Table} from "reactstrap";
import {paymentData} from "@/Data/Datatable/paymentData";

const PaymentTable = () => {

    useEffect(() => {
        setTimeout(() => {
            new DataTable('#paymentsTable');
        }, 1000)
    }, []);

    return (
        <>
            <Card>
                <CardHeader>
                    <h5>Payment Details</h5>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="app-scroll table-responsive app-datatable-default">
                        <Table id="paymentsTable" className="w-100 display payment-details-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Bill No</th>
                                <th>Tax</th>
                                <th>Charges</th>
                                <th>Discount</th>
                                <th>Bill Date</th>
                                <th>Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paymentData.map((payment, index) => (
                                <tr key={index}>
                                    <td>
                                        <p className="mb-0">{payment.name}</p>
                                    </td>
                                    <td>{payment.billNo}</td>
                                    <td>{payment.tax}</td>
                                    <td>{payment.charges}</td>
                                    <td className="f-w-500 text-success">{payment.discount}</td>
                                    <td>{payment.billDate}</td>
                                    <td>{payment.total}</td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr>
                                <th>Name</th>
                                <th>Bill No</th>
                                <th>Tax</th>
                                <th>Charges</th>
                                <th>Discount</th>
                                <th>Bill Date</th>
                                <th>Total</th>
                            </tr>
                            </tfoot>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </>
    );
};

export default PaymentTable;