import React, {useEffect, useState} from "react";
import {
    Col,
    Row,
    Card,
    CardBody,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Table
} from "reactstrap";
import Cleave from "cleave.js/react";
import {ordersData, orders1, orders2, orders3, orders4} from '../../Data/Dashboards/EcommerceData';
import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';


const OrdersCards = () => {

    const [cardBalance, setCardBalance] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiration, setExpiration] = useState("");

    const [displayBalance, setDisplayBalance] = useState("$8,625.00");
    const [displayCardNumber, setDisplayCardNumber] = useState("**** **** **** 7894");
    const [displayExpiration, setDisplayExpiration] = useState("07/24");

    const handleSubmit = (e) => {
        e.preventDefault();

        // Mask card number to show only the last 4 digits
        const maskedCardNumber = `**** **** **** ${cardNumber.slice(-4)}`;

        // Update the displayed values
        setDisplayBalance(cardBalance);
        setDisplayCardNumber(maskedCardNumber);
        setDisplayExpiration(expiration);

        // Clear the form inputs
        setCardBalance("");
        setCardNumber("");
        setExpiration("");
    };

    const [activeTab, setActiveTab] = useState("1");

    const toggleTab = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    useEffect(() => {
        setTimeout(() => {

            const props = {
                searching: false, // Disable the search field
                ordering: false,  // Disable sorting functionality
                paging: false     // Disable pagination
            }
            new DataTable('#recentOrders', props);
            new DataTable('#recentOrders1', props);
            new DataTable('#recentOrders2', props);
            new DataTable('#recentOrders3', props);
            new DataTable('#recentOrders4', props);

            return () => {
                new DataTable('#recentOrders').destroy();
                new DataTable('#recentOrders1').destroy();
                new DataTable('#recentOrders2').destroy();
                new DataTable('#recentOrders3').destroy();
                new DataTable('#recentOrders4').destroy();
            };
        }, 2000)
    }, []);

    return (
        <>
            <Col lg="7" xxl="6">
                <Row>
                    <Col md="12">
                        <Card>
                            <CardBody>
                                <h5 className="header-title-text">Payment</h5>
                                <Row className="mt-3">
                                    {/* Payment Form */}
                                    <Col md="6">
                                        <Form id="payment-form" onSubmit={handleSubmit}>
                                            <Row>
                                                <Col md="12">
                                                    <FormGroup>
                                                        <Label for="card-balance">Balance</Label>
                                                        <Input
                                                            type="text"
                                                            id="card-balance"
                                                            placeholder="$1,900.00"
                                                            value={cardBalance}
                                                            onChange={(e) => setCardBalance(e.target.value)}
                                                            required
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="8">
                                                    <FormGroup>
                                                        <Label for="card-number">Card Number</Label>
                                                        <Cleave
                                                            id="card-number"
                                                            className="form-control credit-form-control"
                                                            placeholder="xxxx xxxx xxxx xxxx"
                                                            options={{creditCard: true}}
                                                            value={cardNumber}
                                                            onChange={(e) => setCardNumber(e.target.value)}
                                                            required
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="4">
                                                    <FormGroup>
                                                        <Label for="expiration">Expiration</Label>
                                                        <Cleave
                                                            id="expiration"
                                                            className="form-control expirationform-control"
                                                            placeholder="MM/YY"
                                                            options={{date: true, datePattern: ["m", "y"]}}
                                                            value={expiration}
                                                            onChange={(e) => setExpiration(e.target.value)}
                                                            required
                                                        />
                                                    </FormGroup>
                                                </Col>
                                                <Col md="12">
                                                    <div className="text-end">
                                                        <Button type="submit" color="primary">
                                                            Submit
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Col>

                                    {/* Display Card Details */}
                                    <Col md="6" className="mt-3 mt-md-0">
                                        <Card className="payment-details-card">
                                            <CardBody>
                                                <div className="payment-details-content">
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src="/assets/images/icons/master-icon.png"
                                                            alt="Mastercard Icon"
                                                        />
                                                    </div>
                                                    <div className="d-flex justify-content-between mt-3">
                                                        <div>
                                                            <p className="text-light f-w-500 mb-0">Current Balance</p>
                                                            <h4 className="text-white f-w-600" id="display-balance">
                                                                {displayBalance}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-between mt-5">
                                                        <div>
                                                            <h6 className="text-light f-w-500 mb-0" id="display-card-number">
                                                                {displayCardNumber}
                                                            </h6>
                                                        </div>
                                                        <div>
                                                            <p className="badge text-bg-secondary f-w-500 mb-0" id="display-expiration">
                                                                {displayExpiration}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Customer Comments */}
                    <Col sm="6">
                        <Card className="customer-comment-card">
                            <CardBody>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-secondary position-absolute">
                                        <img src="/assets/images/avtar/16.png" alt="" className="img-fluid"/>
                                    </div>
                                    <span className="fs-6 f-w-500 text-dark ms-5"> Sophia</span>
                                    <div>
                                        <i className="ph ph-star fs-5 star-icon text-warning"></i>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-muted mb-0">
                                        "This Top is not only stylish but also incredibly warm. Perfect for those chilly days.{" "}
                                        <a className="text-primary text-d-underline" href="#">
                                            Read More
                                        </a>
                                    </p>
                                    <div className="mt-3">
                                        <a href="./product.html">
                                            <img src="/assets/images/ecommerce/01.jpg" alt="" className="w-45 b-r-5"/>
                                        </a>{" "}
                                        <a href="./product.html">
                                            <img src="/assets/images/ecommerce/02.jpg" alt="" className="w-45 b-r-5"/>
                                        </a>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col sm="6">
                        <Card className="customer-comment-card">
                            <CardBody>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-dark position-absolute">
                                        <img src="/assets/images/avtar/14.png" alt="" className="img-fluid"/>
                                    </div>
                                    <span className="fs-6 f-w-500 text-dark ms-5"> Isabella</span>
                                    <div>
                                        <i className="ph ph-star star-icon text-warning fs-5"></i>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-muted mb-0">
                                        Trendy crop top paired with strappy sandals and a matching crossbody bag{" "}
                                        <a className="text-primary text-d-underline" href="#">
                                            Read More
                                        </a>
                                    </p>
                                    <div className="mt-3">
                                        <a href="./product.html">
                                            <img src="/assets/images/ecommerce/16.jpg" alt="" className="w-45 b-r-5"/>
                                        </a>{" "}
                                        <a href="./product.html">
                                            <img src="/assets/images/ecommerce/15.jpg" alt="" className="w-45 b-r-5"/>
                                        </a>{" "}
                                        <a href="./product.html">
                                            <img src="/assets/images/ecommerce/11.jpg" alt="" className="w-45 b-r-5"/>
                                        </a>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Col>

            <Col lg="8" xxl="6" className="order-2-l">

                <Card>
                    <CardBody>
                        <div className="recent-order-table">
                            <Nav tabs className="app-tabs-primary pb-0 mb-3" id="Basic" role="tablist">
                                {/* T-shirt Tab */}
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "1" ? "active" : ""}
                                        onClick={() => toggleTab("1")}
                                        id="tshirt-tab"
                                        role="tab"
                                    >
                                        <img
                                            src="/assets/images/dashboard/ecommerce-dashboard/tshirt.png"
                                            alt="T-shirt"
                                            className="w-35"
                                        />
                                        <span> T-shirt</span>
                                    </NavLink>
                                </NavItem>

                                {/* Watch Tab */}
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "2" ? "active" : ""}
                                        onClick={() => toggleTab("2")}
                                        id="watch-tab"
                                        role="tab"
                                    >
                                        <img
                                            src="/assets/images/dashboard/ecommerce-dashboard/wristwatch.png"
                                            alt="Watch"
                                            className="w-35"
                                        />
                                        <span>Watch</span>
                                    </NavLink>
                                </NavItem>

                                {/* Bag Tab */}
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "3" ? "active" : ""}
                                        onClick={() => toggleTab("3")}
                                        id="bag-tab"
                                        role="tab"
                                    >
                                        <img
                                            src="/assets/images/dashboard/ecommerce-dashboard/backpack.png"
                                            alt="Bag"
                                            className="w-35"
                                        />
                                        <span>Bags</span>
                                    </NavLink>
                                </NavItem>

                                {/* Shoes Tab */}
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "4" ? "active" : ""}
                                        onClick={() => toggleTab("4")}
                                        id="shoes-tab"
                                        role="tab"
                                    >
                                        <img
                                            src="/assets/images/dashboard/ecommerce-dashboard/shoes.png"
                                            alt="Shoes"
                                            className="w-35"
                                        />
                                        <span>Shoes</span>
                                    </NavLink>
                                </NavItem>

                                {/* Sunglasses Tab */}
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "5" ? "active" : ""}
                                        onClick={() => toggleTab("5")}
                                        id="sunglasse-tab"
                                        role="tab"
                                    >
                                        <img
                                            src="/assets/images/dashboard/ecommerce-dashboard/women-hat.png"
                                            alt="Sunglasses"
                                            className="w-35"
                                        />
                                        <span>Sunglasses</span>
                                    </NavLink>
                                </NavItem>
                            </Nav>

                            <TabContent activeTab={activeTab}>
                                {/* T-shirt Tab Pane */}
                                <TabPane tabId="1">
                                    <Row>
                                        <Col sm="12">
                                            <div className="table-responsive app-scroll app-datatable-default">
                                                <Table id="recentOrders" className="display recent-order-datatable">
                                                    <thead>
                                                    <tr>
                                                        <th>Id</th>
                                                        <th>Order</th>
                                                        <th>Qty</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {ordersData.map((order, index) => (
                                                        <tr key={index}>
                                                            <td>{order.id}</td>
                                                            <td>
                                                                <div className="position-relative">
                                                                    <div className="h-40 w-40 d-flex-center b-r-15 overflow-hidden bg-light-light p-1 position-absolute">
                                                                        <img src={order.product.image} alt={order.product.name} className="img-fluid"/>
                                                                    </div>
                                                                    <div className="ms-5">
                                                                        <h6 className="f-s-16 mb-0">{order.product.name}</h6>
                                                                        <p className="f-s-14 text-secondary mb-0">{order.product.quantity} product</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{order.qty}</td>
                                                            <td>
                                                                <span className={`badge ${order.statusClass}`}>{order.status}</span>
                                                            </td>
                                                            <td>{order.date}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Col>
                                    </Row>
                                </TabPane>

                                {/* Watch Tab Pane */}
                                <TabPane tabId="2">
                                    <Row>
                                        <Col sm="12">
                                            <div className="table-responsive app-scroll app-datatable-default">
                                                <Table striped responsive id="recentOrders1" className="display">
                                                    <thead>
                                                    <tr>
                                                        <th>Id</th>
                                                        <th>Order</th>
                                                        <th>Qty</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {orders1.map((order, index) => (
                                                        <tr key={index}>
                                                            <td>{order.id}</td>
                                                            <td>
                                                                <div className="position-relative">
                                                                    <div
                                                                        className="h-40 w-40 d-flex-center b-r-15 overflow-hidden p-1 position-absolute">
                                                                        <img src={order.order.img}
                                                                             alt={order.order.name}
                                                                             className="img-fluid"/>
                                                                    </div>
                                                                    <div className="ms-5">
                                                                        <h6 className="mb-0 f-s-16">{order.order.name}</h6>
                                                                        <p className="mb-0 f-s-14 text-secondary">{order.order.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{order.qty}</td>
                                                            <td><span className="badge"
                                                                      color={order.statusClass}>{order.status}</span>
                                                            </td>
                                                            <td>{order.date}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Col>
                                    </Row>
                                </TabPane>

                                {/* Bag Tab Pane */}
                                <TabPane tabId="3">
                                    <Row>
                                        <Col sm="12">
                                            <div className="table-responsive app-scroll app-datatable-default">
                                                <Table id="recentOrders2" striped bordered hover>
                                                    <thead>
                                                    <tr>
                                                        <th>Id</th>
                                                        <th>Order</th>
                                                        <th>Qty</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {orders2.map((order, index) => (
                                                        <tr key={index}>
                                                            <td>{order.id}</td>
                                                            <td>
                                                                <div className="position-relative">
                                                                    <div
                                                                        className="h-40 w-40 d-flex-center b-r-15 overflow-hidden p-1 position-absolute">
                                                                        <img src={order.order.imageUrl} alt=""
                                                                             className="img-fluid"/>
                                                                    </div>
                                                                    <div className="ms-5">
                                                                        <h6 className="mb-0 f-s-16">{order.order.title}</h6>
                                                                        <p className="mb-0 f-s-14 text-secondary">{order.order.description}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{order.qty}</td>
                                                            <td>
                <span className={`badge text-light-${order.status === "DELIVERED" ? "success" : "primary"}`}>
                  {order.status}
                </span>
                                                            </td>
                                                            <td>{order.date}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Col>
                                    </Row>
                                </TabPane>

                                {/* Shoes Tab Pane */}
                                <TabPane tabId="4">
                                    <Row>
                                        <Col sm="12">
                                            <div className="table-responsive app-scroll app-datatable-default">
                                                <Table id="recentOrders3" className="display">
                                                    <thead>
                                                    <tr>
                                                        <th>Id</th>
                                                        <th>Order</th>
                                                        <th>Qty</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {orders3.map((order, index) => (
                                                        <tr key={index}>
                                                            <td>{order.id}</td>
                                                            <td>
                                                                <div className="position-relative">
                                                                    <div
                                                                        className="h-40 w-40 d-flex-center b-r-15 overflow-hidden p-1 position-absolute">
                                                                        <img src={order.image} alt={order.order}
                                                                             className="img-fluid"/>
                                                                    </div>
                                                                    <div className="ms-5">
                                                                        <h6 className="mb-0 f-s-16">{order.order}</h6>
                                                                        <p className="mb-0 f-s-14 text-secondary">{order.productCount}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{order.qty}</td>
                                                            <td>
                <span
                    className={`badge text-light-${order.status === "PICKUPS" ? "primary" : order.status === "DELIVERED" ? "success" : "dark"}`}>
                  {order.status}
                </span>
                                                            </td>
                                                            <td>{order.date}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Col>
                                    </Row>
                                </TabPane>

                                {/* Sunglasses Tab Pane */}
                                <TabPane tabId="5">
                                    <Row>
                                        <Col sm="12">
                                            <div className="table-responsive app-scroll app-datatable-default">
                                                <Table id="recentOrders4" className="display">
                                                    <thead>
                                                    <tr>
                                                        <th>Id</th>
                                                        <th>Order</th>
                                                        <th>Qty</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {orders4.map((order, index) => (
                                                        <tr key={index}>
                                                            <td>{order.id}</td>
                                                            <td>
                                                                <div className="position-relative">
                                                                    <div
                                                                        className="h-40 w-40 d-flex-center b-r-15 overflow-hidden bg-light-secondary p-1 position-absolute">
                                                                        <img src={order.image} alt={order.order}
                                                                             className="img-fluid"/>
                                                                    </div>
                                                                    <div className="ms-5">
                                                                        <h6 className="mb-0 f-s-16">{order.order}</h6>
                                                                        <p className="mb-0 f-s-14 text-secondary">{order.productCount}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{order.qty}</td>
                                                            <td>
                <span className={`badge text-light-${order.status === 'PICKUPS' ? 'primary' : 'secondary'}`}>
                  {order.status}
                </span>
                                                            </td>
                                                            <td>{order.date}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </>
    )
}

export default OrdersCards
