
import {useEffect} from "react";
import CalendarCard from "@/Components/Calander/CalendarCard";
import {Col, Row} from "reactstrap";


const Calendar = () => {
    useEffect(()=>{
        $('.slider').slick({
            dots: false,
            speed: 1000,
            slidesToShow: 1,
            centerMode: true,
            arrows: false,
            vertical: true,
            verticalSwiping: true,
            focusOnSelect: true,
            autoplay: true,
            autoplaySpeed: 1000,
        });
    },[])
    return (
        <div className="container-fluid">
            <Row className="row m-1">
                <Col xs={12}>
                    <h4 className="main-title">Calendar</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Calendar</a>
                        </li>
                    </ul>
                </Col>
            </Row>

            <div className="row m-1 calendar app-fullcalender">
                <div className="col-xxl-3">
                    <div className="row">
                        <div className="col-md-6 col-xxl-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5>Draggable Events</h5>
                                </div>
                                <div className="card-body ">
                                    <div id='events-list'>
                                        <div className='list-event event-primary' data-classname="event-primary"><i
                                            className="ti ti-briefcase"></i>
                                            Meeting Time</div>

                                        <div className='list-event event-success' data-classname="event-success"><i className="ti ti-photo"></i>
                                            Holiday</div>

                                        <div className='list-event event-warning' data-classname="event-warning"><i className="ti ti-plane"></i>
                                            Tour Event Planning</div>

                                        <div className='list-event event-info' data-classname="event-info"><i className="ti ti-cake"></i> Birthday
                                            Event</div>

                                        <div className='list-event event-secondary' data-classname="event-secondary"><i
                                            className="ti ti-glass-full"></i> Lunch Break</div>

                                        <div className="form-check calendar-remove-check ps-0">
                                            <input className="form-check-input mg-2" type="checkbox" id='drop-remove'/>
                                            <label className="form-check-label" htmlFor="drop-remove">
                                                Remove After Drop
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 col-xxl-12">
                            <div>
                                <div>
                                    <div className="event-container slider">
                                        <div className="event-box">
                                            <h6 className="mb-3"><i className="ti ti-playstation-circle f-s-12 me-2"></i>International Women's Day</h6>
                                            <p className="mb-2 text-secondary f-s-13">
                                                Celebrated to recognize the social and political achievements of women.
                                            </p>

                                            <p className="f-s-13 text-end mb-0">
                                                <i className="ti ti-calendar-event me-1"></i>08 Mar 2024
                                            </p>
                                        </div>

                                        <div className="event-box">
                                            <h6 className="mb-3"><i className="ti ti-playstation-circle f-s-12 me-2"></i>World Book Day</h6>
                                            <p className="mb-2 text-secondary f-s-13">
                                                Celebrated to promote reading, publishing, and copyright, although in the US
                                            </p>
                                            <p className="f-s-13 text-end mb-0">
                                                <i className="ti ti-calendar-event me-1"></i>23 apr 2024
                                            </p>
                                        </div>

                                        <div className="event-box">
                                            <h6 className="mb-3"><i className="ti ti-playstation-circle f-s-12 me-2"></i>World Refugee Day</h6>
                                            <p className="mb-2 text-secondary f-s-13">
                                                Observed to honor the courage and resilience of refugees.
                                            </p>
                                            <p className="f-s-13 text-end mb-0">
                                                <i className="ti ti-calendar-event me-1"></i>20 Jun 2024
                                            </p>
                                        </div>

                                        <div className="event-box">
                                            <h6 className="mb-3"><i className="ti ti-playstation-circle f-s-12 me-2"></i>World Humanitarian Day</h6>
                                            <p className="mb-2 text-secondary f-s-13">
                                                A day to recognize humanitarian personnel and those who have lost their lives working
                                            </p>
                                            <p className="f-s-13 text-end mb-0">
                                                <i className="ti ti-calendar-event me-1"></i>19 Aug 2024
                                            </p>
                                        </div>

                                        <div className="event-box">
                                            <h6 className="mb-3"><i className="ti ti-playstation-circle f-s-12 me-2"></i>International Day of Peace</h6>
                                            <p className="mb-2 text-secondary f-s-13">
                                                World Braille Day is an international day on 4 January.!
                                            </p>
                                            <p className="f-s-13 text-end mb-0">
                                                <i className="ti ti-calendar-event me-1"></i>21 sep 2024
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xxl-9 mt-3 mt-0-md">
                    <CalendarCard/>
                </div>
            </div>
        </div>
    );
};

export default Calendar;