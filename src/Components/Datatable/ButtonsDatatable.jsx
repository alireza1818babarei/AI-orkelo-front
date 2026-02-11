import React, {useEffect} from 'react';
import {Table} from "reactstrap";
import {currenciesData} from "@/Data/Datatable/buttonsDatatable";
import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';


const ButtonsDatatable = () => {
    useEffect(() => {
        setTimeout(() => {
            new DataTable('#ButtonsDataTable').destroy();
        }, 1000)
    }, []);

    return (
        <>
            <div className="app-scroll table-responsive app-datatable-default">
                <Table id="ButtonsDataTable" className="w-100 display default-data-table align-middle">
                    <thead>
                    <tr>
                        <th>Currency Code</th>
                        <th>Currency</th>
                        <th>Price</th>
                        <th>High</th>
                        <th>Low</th>
                        <th>Change</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currenciesData.map((currency, index) => (
                        <tr key={index}>
                            <td>{currency.code}</td>
                            <td>{currency.name}</td>
                            <td>{currency.totalAmount}</td>
                            <td>{currency.availableAmount}</td>
                            <td>{currency.availableBalance}</td>
                            <td>
                                <div className="d-flex gap-1 align-items-center">
                                    <i
                                        className={`ti ti-chevrons-${currency.percentageChange >= 0 ? 'up' : 'down'} f-s-20 ${currency.percentageChange >= 0 ? 'text-success' : 'text-danger'}`}
                                    ></i>
                                    <h6 className={`m-0 ${currency.percentageChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {currency.percentageChange}%
                                    </h6>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </>
    );
};

export default ButtonsDatatable;