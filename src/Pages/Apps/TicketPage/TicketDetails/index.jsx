import React, {useEffect} from 'react';
import Ticketinfo from "@/Components/Ticketapp/Ticketinfo";
import Ticketfileupload from "@/Components/Ticketapp/Ticketfileupload";
import Ticketdetails from "@/Components/Ticketapp/Ticketdetails";
import {Col, Container, Row} from "reactstrap";



const TicketDetails = () => {


// Register FilePond plugins

    return (
        <div>
            <Container fluid>
                <Row className="m-1">
                    <Col xs={12}>
                        <h4 className="main-title">Ticket Details</h4>
                        <ul className="app-line-breadcrumbs mb-3">
                            <li className="">
                                <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"/> Apps
                      </span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="f-s-14 f-w-500">Ticket</a>
                            </li>
                            <li className="active">
                                <a href="#" className="f-s-14 f-w-500">Ticket Details</a>
                            </li>
                        </ul>
                    </Col>
                </Row>
                <Row className="ticket-details">
                    <Col md={5} lg={4} xxl={3}>
                       <Ticketinfo/>
                       <Ticketfileupload/>
                    </Col>
                    <Col md={7} lg={8} xxl={9}>
                        <Ticketdetails/>
                    </Col>

                </Row>
            </Container>
        </div>
    );
};

export default TicketDetails;