import React, { useState } from 'react';
import {orders, delivered, pickup, returns, cancelled} from "@/Data/Orderpage/Orderpage";
import {Card, CardBody, Col, Container, Row} from "reactstrap";
import {Link} from 'react-router-dom'



const Orders = () => {
    const [activeTab, setActiveTab] = useState('connect-tab');
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };


    
    return (
        <div>
            <Container fluid>
            <Row className="m-1">
              <Col xs={12}>
                <h4 className="main-title">Orders</h4>
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
                    <a href="#" className="f-s-14 f-w-500">Orders</a>
                  </li>
                </ul>
              </Col>
            </Row>
            <Row>
                <Col xs={12}>
                     <Card >
                         <CardBody>

                    <ul className="nav nav-tabs app-tabs-primary order-tabs d-flex justify-content-start border-0 mb-0 pb-0" id="Outline"   role="tablist">

                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link d-flex align-items-center gap-1 ${activeTab === 'connect-tab' ? 'active' : ''}`}
                                id="connect-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#connect-tab-pane"
                                type="button"
                                role="tab"
                                aria-controls="connect-tab-pane"
                                aria-selected={activeTab === 'connect-tab'}
                                onClick={() => handleTabClick('connect-tab')}
                            >
                                <i className="ti ti-sort-descending-2 f-s-18 mg-b-3"></i> All Orders
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link d-flex align-items-center gap-1 ${activeTab === 'discover-tab' ? 'active' : ''}`}
                                id="discover-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#discover-tab-pane"
                                type="button"
                                role="tab"
                                aria-controls="discover-tab-pane"
                                aria-selected={activeTab === 'discover-tab'}
                                onClick={() => handleTabClick('discover-tab')}
                            >
                                <i className="ti ti-truck-delivery f-s-18 mg-b-3"></i> Delivered
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link d-flex align-items-center gap-1 ${activeTab === 'order-tab' ? 'active' : ''}`}
                                id="order-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#order-tab-pane"
                                type="button"
                                role="tab"
                                aria-controls="order-tab-pane"
                                aria-selected={activeTab === 'order-tab'}
                                onClick={() => handleTabClick('order-tab')}
                            >
                                <i className="ti ti-truck-loading f-s-18 mg-b-3"></i> Pickups
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link d-flex align-items-center gap-1 ${activeTab === 'order-tabs' ? 'active' : ''}`}
                                id="order-tabs"
                                data-bs-toggle="tab"
                                data-bs-target="#order-tab-returns"
                                type="button"
                                role="tab"
                                aria-controls="order-tab-returns"
                                aria-selected={activeTab === 'order-tabs'}
                                onClick={() => handleTabClick('order-tabs')}
                            >
                                <i className="ti ti-arrow-back f-s-18 mg-b-3"></i> Returns
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link d-flex align-items-center gap-1 ${activeTab === 'ordertab' ? 'active' : ''}`}
                                id="ordertab"
                                data-bs-toggle="tab"
                                data-bs-target="#order-tab-cancelled"
                                type="button"
                                role="tab"
                                aria-controls="order-tab-cancelled"
                                aria-selected={activeTab === 'ordertab'}
                                onClick={() => handleTabClick('ordertab')}
                            >
                                <i className="ti ti-square-rounded-x f-s-18 mg-b-3"></i> Cancelled
                            </button>
                        </li>

                     </ul>

                    </CardBody>

                         <div className="card-body order-tab-content p-0">
                             <div className="tab-content" id="OutlineContent">
                                 <div
                                     className={`tab-pane fade ${activeTab === 'connect-tab' ? 'active show' : ''}`}
                                     id="connect-tab-pane"
                                     role="tabpanel"
                                     aria-labelledby="connect-tab"
                                     tabIndex="0"
                                 >
                                     <div className="order-list-table table-responsive app-scroll">

                                         <table className="table table-bottom-border align-middle mb-0">
                                             <thead>
                                             <tr>
                                                 <th>
                                                     <label className="check-box">
                                                         <input type="checkbox" id="select-all" />
                                                         <span className="checkmark outline-secondary ms-2 "></span>
                                                     </label>
                                                 </th>
                                                 <th>Order Id</th>
                                                 <th scope="col" className="text-start">Customer</th>
                                                 <th scope="col">Product</th>
                                                 <th scope="col">Status</th>
                                                 <th scope="col">Order Date</th>
                                                 <th scope="col">Payment Method</th>
                                                 <th scope="col">Amount</th>
                                                 <th scope="col">Actions</th>
                                             </tr>
                                             </thead>
                                             <tbody>
                                             {orders.map((order, index) => (
                                                 <tr key={index}>
                                                     <td>
                                                         <label className="check-box">
                                                             <input type="checkbox"/>
                                                             <span className="checkmark outline-secondary ms-2"></span>
                                                         </label>
                                                     </td>
                                                     <td>{order.id}</td>
                                                     <td className="d-flex align-items-center gap-2">
                                                         <div
                                                             className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-primary">
                                                             <img src={order.customer.avatar} alt=""
                                                                  className="img-fluid"/>
                                                         </div>
                                                         <span className="title-text mb-0">{order.customer.name}</span>
                                                     </td>
                                                     <td>{order.product}</td>
                                                     <td>
                                                        <span className={`badge text-light-${(() => {
                                                            if (order.status === "CANCELLED") return "danger";
                                                            if (order.status === "DELIVERED") return "success";
                                                            if (order.status === "INPROGRESS") return "warning";
                                                            if (order.status === "PICKUPS") return "info";
                                                            if (order.status === "RETURNS") return "secondary";
                                                            return "light";
                                                        })()}`}>
                                                          {order.status}
                                                        </span>
                                                     </td>
                                                     <td>{order.orderDate}</td>
                                                     <td>{order.paymentMethod}</td>
                                                     <td>{order.amount}</td>
                                                     <td>
                                                         <Link
                                                             to="/apps/e-shop/orders-details"
                                                             role="button"
                                                             target="_blank"
                                                             rel="noopener noreferrer"
                                                             className="btn btn-outline-primary icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-eye"></i>
                                                         </Link>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-success icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-edit"></i>
                                                         </button>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-danger icon-btn w-30 h-30 b-r-22 delete-btn"
                                                         >
                                                             <i className="ti ti-trash"></i>
                                                         </button>
                                                     </td>
                                                 </tr>
                                             ))}
                                             </tbody>
                                         </table>

                                     </div>


                                 </div>

                                 <div
                                     className={`tab-pane fade ${activeTab === 'discover-tab' ? 'active show' : ''}`}
                                     id="discover-tab-pane"
                                     role="tabpanel"
                                     aria-labelledby="discover-tab"
                                     tabIndex="0"
                                 >
                                     <div className=" order-list-table table-responsive app-scroll">

                                         <table className="table table-bottom-border align-middle mb-0">
                                             <thead>
                                             <tr>
                                             <th>
                                                     <label className="check-box">
                                                         <input type="checkbox" id="select-all" />
                                                         <span className="checkmark outline-secondary ms-2 "></span>
                                                     </label>
                                                 </th>
                                                 <th>Order Id</th>
                                                 <th scope="col" className="text-start">Customer</th>
                                                 <th scope="col">Product</th>
                                                 <th scope="col">Status</th>
                                                 <th scope="col">Order Date</th>
                                                 <th scope="col">Payment Method</th>
                                                 <th scope="col">Amount</th>
                                                 <th scope="col">Actions</th>
                                             </tr>
                                             </thead>
                                             <tbody>
                                             {delivered.map((order, index) => (
                                                 <tr key={index}>
                                                     <td>
                                                         <label className="check-box">
                                                             <input type="checkbox"/>
                                                             <span className="checkmark outline-secondary ms-2"></span>
                                                         </label>
                                                     </td>
                                                     <td>{order.id}</td>
                                                     <td className="d-flex align-items-center gap-2">
                                                         <div
                                                             className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-primary">
                                                             <img src={order.customer.avatar} alt=""
                                                                  className="img-fluid"/>
                                                         </div>
                                                         <span className="title-text mb-0">{order.customer.name}</span>
                                                     </td>
                                                     <td>{order.product}</td>
                                                     <td>
                                                        <span className={`badge text-light-${(() => {
                                                            if (order.status === "CANCELLED") return "danger";
                                                            if (order.status === "DELIVERED") return "success";
                                                            if (order.status === "INPROGRESS") return "warning";
                                                            if (order.status === "PICKUPS") return "info";
                                                            if (order.status === "RETURNS") return "secondary";
                                                            return "light";
                                                        })()}`}>
                                                          {order.status}
                                                        </span>
                                                     </td>
                                                     <td>{order.orderDate}</td>
                                                     <td>{order.paymentMethod}</td>
                                                     <td>{order.amount}</td>
                                                     <td>
                                                         <Link
                                                             to="/apps/e-shop/orders-details"
                                                             role="button"
                                                             target="_blank"
                                                             rel="noopener noreferrer"
                                                             className="btn btn-outline-primary icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-eye"></i>
                                                         </Link>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-success icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-edit"></i>
                                                         </button>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-danger icon-btn w-30 h-30 b-r-22 delete-btn"
                                                         >
                                                             <i className="ti ti-trash"></i>
                                                         </button>
                                                     </td>
                                                 </tr>
                                             ))}
                                             </tbody>
                                         </table>

                                     </div>

                                 </div>

                                 <div
                                     className={`tab-pane fade ${activeTab === 'order-tab' ? 'active show' : ''}`}
                                     id="order-tab"
                                     role="tabpanel"
                                     aria-labelledby="order-tab"
                                     tabIndex="0">
                                     <div className=" order-list-table table-responsive app-scroll">

                                         <table className="table table-bottom-border align-middle mb-0">
                                             <thead>
                                             <tr>
                                                 <th>
                                                 <label className="check-box">
                                                         <input type="checkbox" id="select-all" />
                                                         <span className="checkmark outline-secondary ms-2 "></span>
                                                     </label>
                                                 </th>
                                                 <th>Order Id</th>
                                                 <th scope="col" className="text-start">Customer</th>
                                                 <th scope="col">Product</th>
                                                 <th scope="col">Status</th>
                                                 <th scope="col">Order Date</th>
                                                 <th scope="col">Payment Method</th>
                                                 <th scope="col">Amount</th>
                                                 <th scope="col">Actions</th>
                                             </tr>
                                             </thead>
                                             <tbody>
                                             {pickup.map((order, index) => (
                                                 <tr key={index}>
                                                     <td>
                                                         <label className="check-box">
                                                             <input type="checkbox"/>
                                                             <span className="checkmark outline-secondary ms-2"></span>
                                                         </label>
                                                     </td>
                                                     <td>{order.id}</td>
                                                     <td className="d-flex align-items-center gap-2">
                                                         <div
                                                             className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-primary">
                                                             <img src={order.customer.avatar} alt=""
                                                                  className="img-fluid"/>
                                                         </div>
                                                         <span className="title-text mb-0">{order.customer.name}</span>
                                                     </td>
                                                     <td>{order.product}</td>
                                                     <td>
                                                        <span className={`badge text-light-${(() => {
                                                            if (order.status === "CANCELLED") return "danger";
                                                            if (order.status === "DELIVERED") return "success";
                                                            if (order.status === "INPROGRESS") return "warning";
                                                            if (order.status === "PICKUPS") return "info";
                                                            if (order.status === "RETURNS") return "secondary";
                                                            return "light";
                                                        })()}`}>
                                                          {order.status}
                                                        </span>
                                                     </td>
                                                     <td>{order.orderDate}</td>
                                                     <td>{order.paymentMethod}</td>
                                                     <td>{order.amount}</td>
                                                     <td>
                                                         <Link
                                                             to="/apps/e-shop/orders-details"
                                                             role="button"
                                                             target="_blank"
                                                             rel="noopener noreferrer"
                                                             className="btn btn-outline-primary icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-eye"></i>
                                                         </Link>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-success icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-edit"></i>
                                                         </button>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-danger icon-btn w-30 h-30 b-r-22 delete-btn"
                                                         >
                                                             <i className="ti ti-trash"></i>
                                                         </button>
                                                     </td>
                                                 </tr>
                                             ))}
                                             </tbody>
                                         </table>

                                     </div>


                                 </div>


                                 <div
                                     className={`tab-pane fade ${activeTab === 'order-tabs' ? 'active show' : ''}`}
                                     id="order-tabs"
                                     role="tabpanel"
                                     aria-labelledby="order-tabs"
                                     tabIndex="0">
                                     <div className=" order-list-table table-responsive app-scroll">

                                         <table className="table table-bottom-border align-middle mb-0">
                                             <thead>
                                             <tr>
                                                 <th>
                                                 <label className="check-box">
                                                         <input type="checkbox" id="select-all" />
                                                         <span className="checkmark outline-secondary ms-2 "></span>
                                                     </label>
                                                 </th>
                                                 <th>Order Id</th>
                                                 <th scope="col" className="text-start">Customer</th>
                                                 <th scope="col">Product</th>
                                                 <th scope="col">Status</th>
                                                 <th scope="col">Order Date</th>
                                                 <th scope="col">Payment Method</th>
                                                 <th scope="col">Amount</th>
                                                 <th scope="col">Actions</th>
                                             </tr>
                                             </thead>
                                             <tbody>
                                             {returns.map((order, index) => (
                                                 <tr key={index}>
                                                     <td>
                                                         <label className="check-box">
                                                             <input type="checkbox"/>
                                                             <span className="checkmark outline-secondary ms-2"></span>
                                                         </label>
                                                     </td>
                                                     <td>{order.id}</td>
                                                     <td className="d-flex align-items-center gap-2">
                                                         <div
                                                             className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-primary">
                                                             <img src={order.customer.avatar} alt=""
                                                                  className="img-fluid"/>
                                                         </div>
                                                         <span className="title-text mb-0">{order.customer.name}</span>
                                                     </td>
                                                     <td>{order.product}</td>
                                                     <td>
                                                        <span className={`badge text-light-${(() => {
                                                            if (order.status === "CANCELLED") return "danger";
                                                            if (order.status === "DELIVERED") return "success";
                                                            if (order.status === "INPROGRESS") return "warning";
                                                            if (order.status === "PICKUPS") return "info";
                                                            if (order.status === "RETURNS") return "secondary";
                                                            return "light";
                                                        })()}`}>
                                                          {order.status}
                                                        </span>
                                                     </td>
                                                     <td>{order.orderDate}</td>
                                                     <td>{order.paymentMethod}</td>
                                                     <td>{order.amount}</td>
                                                     <td>
                                                         <Link
                                                             to="/apps/e-shop/orders-details"
                                                             role="button"
                                                             target="_blank"
                                                             rel="noopener noreferrer"
                                                             className="btn btn-outline-primary icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-eye"></i>
                                                         </Link>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-success icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-edit"></i>
                                                         </button>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-danger icon-btn w-30 h-30 b-r-22 delete-btn"
                                                         >
                                                             <i className="ti ti-trash"></i>
                                                         </button>
                                                     </td>
                                                 </tr>
                                             ))}
                                             </tbody>
                                         </table>

                                     </div>


                                 </div>


                                 <div
                                     className={`tab-pane fade ${activeTab === 'ordertab' ? 'active show' : ''}`}
                                     id="ordertab"
                                     role="tabpanel"
                                     aria-labelledby="ordertab"
                                     tabIndex="0">
                                     <div className=" order-list-table table-responsive app-scroll">

                                         <table className="table table-bottom-border align-middle mb-0">
                                             <thead>
                                             <tr>
                                                 <th>
                                                 <label className="check-box">
                                                         <input type="checkbox" id="select-all" />
                                                         <span className="checkmark outline-secondary ms-2 "></span>
                                                     </label>
                                                 </th>
                                                 <th>Order Id</th>
                                                 <th scope="col" className="text-start">Customer</th>
                                                 <th scope="col">Product</th>
                                                 <th scope="col">Status</th>
                                                 <th scope="col">Order Date</th>
                                                 <th scope="col">Payment Method</th>
                                                 <th scope="col">Amount</th>
                                                 <th scope="col">Actions</th>
                                             </tr>
                                             </thead>
                                             <tbody>
                                             {cancelled.map((order, index) => (
                                                 <tr key={index}>
                                                     <td>
                                                         <label className="check-box">
                                                             <input type="checkbox"/>
                                                             <span className="checkmark outline-secondary ms-2"></span>
                                                         </label>
                                                     </td>
                                                     <td>{order.id}</td>
                                                     <td className="d-flex align-items-center gap-2">
                                                         <div
                                                             className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-primary">
                                                             <img src={order.customer.avatar} alt=""
                                                                  className="img-fluid"/>
                                                         </div>
                                                         <span className="title-text mb-0">{order.customer.name}</span>
                                                     </td>
                                                     <td>{order.product}</td>
                                                     <td>
                                                        <span className={`badge text-light-${(() => {
                                                            if (order.status === "CANCELLED") return "danger";
                                                            if (order.status === "DELIVERED") return "success";
                                                            if (order.status === "INPROGRESS") return "warning";
                                                            if (order.status === "PICKUPS") return "info";
                                                            if (order.status === "RETURNS") return "secondary";
                                                            return "light";
                                                        })()}`}>
                                                          {order.status}
                                                        </span>
                                                     </td>
                                                     <td>{order.orderDate}</td>
                                                     <td>{order.paymentMethod}</td>
                                                     <td>{order.amount}</td>
                                                     <td>
                                                         <Link
                                                             to="/apps/e-shop/orders-details"
                                                             role="button"
                                                             target="_blank"
                                                             rel="noopener noreferrer"
                                                             className="btn btn-outline-primary icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-eye"></i>
                                                         </Link>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-success icon-btn w-30 h-30 b-r-22 me-2"
                                                         >
                                                             <i className="ti ti-edit"></i>
                                                         </button>
                                                         <button
                                                             type="button"
                                                             className="btn btn-outline-danger icon-btn w-30 h-30 b-r-22 delete-btn"
                                                         >
                                                             <i className="ti ti-trash"></i>
                                                         </button>
                                                     </td>
                                                 </tr>
                                             ))}
                                             </tbody>
                                         </table>

                                     </div>


                                 </div>


                             </div>
                         </div>


                     </Card>
                </Col>
            </Row>
            </Container>

        </div>
    );
};

export default Orders;