import React from 'react';
import {ticketDetails} from "../../Data/Ticket/Ticket";

const Ticketinfo = () => {
    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <div className="ticket-details-profile">
                        <div className="ticket-profile mb-4">
                            <div
                                className="h-45 w-45 d-flex-center b-r-50 overflow-hidden text-bg-secondary me-3">
                                <img src="/assets/images/avtar/2.png" alt="" className="img-fluid "/>
                            </div>
                            <div>
                                <h6 className="mb-0">Marry jones</h6>
                                <p className="text-secondary">(678)456-7890</p>
                            </div>
                        </div>
                        <div className="ticket-profile-con">
                      <span>
                        <i className="ph-bold ph-phone-call text-success f-s-18 me-3"></i>
                      </span>
                            <span>
                        <i className="ph-bold  ph-arrow-square-out f-s-20 text-danger f-s-18 me-3"></i>
                      </span>
                            <span>
                        <i className="ph-bold  ph-user text-info f-s-18"></i>
                      </span>
                            <div className="app-divider-v dashed mt-4 mb-4"></div>
                        </div>
                    </div>
                    <div className="about-list pt-0">
                        {ticketDetails.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between">
                                <span className="fw-medium">{item.label}</span>
                                <span className="f-s-13 text-secondary">{item.value}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Ticketinfo;