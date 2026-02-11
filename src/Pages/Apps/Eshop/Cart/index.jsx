import React, {useEffect, useState} from 'react';
import {cartData} from "@/Data/Eshopcart/Eshopcart";
import {Card, CardHeader, Col, Container, Row} from "reactstrap";

import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';

const Cart = () => {
    useEffect(() => {
        setTimeout(() => {
        // $('#example').DataTable();
            new DataTable('#example');

        }, 1000)
    }, []);
    return (
        <div>
            <Container fluid>
                <Row className="m-1">
                    <Col xs={12}>
                        <h4 className="main-title">Cart</h4>
                        <ul className="app-line-breadcrumbs mb-3">
                            <li className="">
                                <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="f-s-14 f-w-500">E-shop</a>
                            </li>
                            <li className="active">
                                <a href="#" className="f-s-14 f-w-500">Cart</a>
                            </li>
                        </ul>
                    </Col>
                </Row>
                        <Row>
                            <Col lg={8}>
                                <Card>
                                    <div className="card-body p-0">

                                        <div className="app-scroll table-responsive app-datatable-default">
                                            <table id="example" className="table cart-product-table align-middle">
                                                <thead>
                                                <tr>
                                                    <th scope="col">Product Name</th>
                                                    <th scope="col">Price</th>
                                                    <th scope="col">Quantity</th>
                                                    <th scope="col">Total</th>
                                                    <th scope="col">Action</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {cartData.map((item) => (
                                                    <tr key={item.id}>
                                                        <th scope="row">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <img src={item.image} className="w-50 h-50" alt={item.name} />
                                                                <div className="cart-details">
                                                                    <p className="fs-6">{item.name}</p>
                                                                    <p className="f-w-500">Color: <span>{item.color}</span></p>
                                                                    <p className="f-w-500">Size: <span>{item.size}</span></p>
                                                                </div>
                                                            </div>
                                                        </th>
                                                        <td>${item.price.toFixed(2)}</td>
                                                        <td>
                                                            <div className="d-flex">
                                                                <button className="btn btn-danger h-35 w-35 d-flex-center b-r-6 p-0">-</button>
                                                                <input
                                                                    type="text"
                                                                    className="h-35 w-35 ms-1 me-1 border b-r-6 text-center"
                                                                    value={item.quantity}
                                                                    readOnly
                                                                />
                                                                <button className="btn btn-primary h-35 w-35 d-flex-center b-r-6 p-0">+</button>
                                                            </div>
                                                        </td>
                                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                                        <td>
                                                            <button type="button" className="btn btn-outline-primary icon-btn b-r-4">
                                                                <i className="ti ti-heart"></i>
                                                            </button>{' '}
                                                            <button type="button" className="btn btn-outline-danger icon-btn b-r-4">
                                                                <i className="ti ti-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>

                                    </div>
                                </Card>
                            </Col>

                            <div className="col-lg-4">
                                <div className="row">
                                    <div className="col-12">
                                        <Card>
                                            <CardHeader>
                                                <h5>Price Details</h5>
                                            </CardHeader>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table cart-side-table mb-0">
                                                        <tbody>
                                                        <tr className="total-price">
                                                            <th>Sub Total :</th>
                                                            <th className="text-end">
                                      <span id="cart-sub">
                                        $359.96
                                      </span>
                                                            </th>
                                                        </tr>
                                                        <tr>
                                                            <td>Discount:
                                                            </td>
                                                            <td className="text-end" id="cart-discount">- $
                                                                53.00
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Shipping Charge :</td>
                                                            <td className="text-end" id="cart-shipping">$
                                                                65.00
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Estimated Tax (12.5%) :</td>
                                                            <td className="text-end" id="cart-tax">$ 44.99
                                                            </td>
                                                        </tr>
                                                        <tr className="total-price">
                                                            <th>Total (USD) :</th>
                                                            <th className="text-end">
                                    <span id="cart-total">
                                      $415.96
                                    </span>
                                                            </th>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                            </div>
                                        </Card>
                                    </div>
                                    <div className="col-md-6 col-xl-12">
                                        <div className="card scratch-card position-relative">
                                            <div className="card-body">
                        <span>
                          <i className="ph-duotone  ph-gift f-s-35"></i>
                        </span>
                                                <h4>Extra 10% off</h4>
                                                <div className="scratch-code-box">
                                                    <h6 className="mb-0">WIN190EGHY018</h6>
                                                    <div className="flex-shrink-0">
                                                        <button className="btn btn-primary btn-sm b-r-24"
                                                                id="copyBtn">copy
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <p className="mb-0">Valid till 4 May 2024. <span>T&C Apply</span>
                                                    </p>
                                                </div>
                                                <div className="scratch-overlay"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-xl-12">
                                        <div className="card gift-card">
                                            <div className="card-body">

                                                <div className="d-flex align-items-center gap-2">
                                                    <img src="/assets/images/ecommerce/01.gif" alt=""
                                                         className="w-35 h-35"/>
                                                        <h6 className="text-dark f-w-600 f-s-18 m-0">Buying for a loved
                                                            one?</h6>
                                                </div>
                                                <div>

                                                    <p className="text-secondary mt-2">Gift wrap and personalized
                                                        message on card,
                                                        Only for <span
                                                            className="text-dark f-w-500"><b>$10.50 USD</b></span></p>
                                                    <div className="cart-gift text-end mt-4">
                                                        <button className="btn btn-primary">Add Gift</button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </Row>

            </Container>
        </div>
    );
};

export default Cart;