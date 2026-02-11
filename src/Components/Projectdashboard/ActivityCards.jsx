import React, {useEffect, useState} from 'react';
import { Card, CardBody, Row, Col, InputGroup, InputGroupText, Input } from 'reactstrap';
import {activityHours} from "../../Data/Charts/projectCharts";
import Chart from "react-apexcharts";
// import Sortable from 'sortablejs';
import {Link} from 'react-router-dom'

function ActivityCards() {

  useEffect(() => {
    new Sortable(meetingSchedule, {
      animation: 150,
      ghostClass: 'draggable-bg'
    });

  }, []);

    const meetings = [
        {
          time: '10:00 AM',
          name: 'Layla Garcia',
          description: 'Weekly Progress Update',
          avatars: ['03.png', '01.png', '02.png'],
        },
        {
          time: '11:30 AM',
          name: 'Jim Kramer',
          description: 'Client Feedback Session',
          avatars: ['03.png', '01.png', '02.png'],
        },
        {
          time: '1:00 PM',
          name: 'Zack Padilla',
          description: 'Problem-Solving Brainstorm',
          avatars: ['03.png', '01.png', '02.png'],
        },
        {
          time: '2:45 PM',
          name: 'Wilson Terry',
          description: 'Product Demo and Review',
          avatars: ['03.png', '01.png', '02.png'],
        },
      ];

      const chatMessages = [
        {
          id: 1,
          sender: "RA",
          message: "Good morning team! I've made some progress on the homepage design. Check it out: [homepage_designing.com]",
          time: "2 Minutes ago",
          position: "left",
          avatar: "/assets/images/avtar/4.png",
        },
        {
          id: 2,
          sender: "Alice",
          message: "Looks great, Alice! I'll start working on the backend functionalities to support it.",
          time: "2 Minutes ago",
          position: "right",
          avatar: "/assets/images/avtar/09.png",
        },
        {
          id: 3,
          sender: "RA",
          message: "I've encountered an issue with the database connection. Can someone help troubleshoot?",
          time: "2 Minutes ago",
          position: "left",
          avatar: "/assets/images/avtar/4.png",
        },
        {
          id: 4,
          sender: "Alice",
          message: "Sure, Charlie. Let's hop on a call after lunch to debug it together.",
          time: "2 Minutes ago",
          position: "right",
          avatar: "/assets/images/avtar/09.png",
        },
        {
          id: 5,
          sender: "RA",
          message: "Typing...",
          time: "2 Minutes ago",
          position: "left",
          avatar: "/assets/images/avtar/4.png",
          typing: true,
        },
      ];
    
      const [message, setMessage] = useState("");

      const handleSendMessage = () => {
        if (message) {
          // Handle sending message (you can add logic to update the chat history here)
          console.log(message);
          setMessage(""); // Reset input field
        }
      };

  return (
    <>
      <Col md="7" lg="6" xxl="4">
      <Card>
        <CardBody>
          <h5 className="header-title-text">Meeting Schedule</h5>

          <ul className="meeting-schedule-list mt-3" id="meetingSchedule">
            {meetings.map((meeting, index) => (
              <li key={index}>
                <div className="meeting-time">
                  <div className="meeting-schedule-icons">
                    {meeting.avatars.map((avatar, idx) => (
                      <div key={idx}>
                        <img
                          src={`/assets/images/dashboard/project/${avatar}`}
                          alt={`Avatar ${idx + 1}`}
                          className="w-25"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Card>
                  <CardBody>
                    <div className="d-flex align-items-center justify-content-between" draggable="false">
                      <div>
                        <h6 className="mb-0 text-dark">{meeting.name}</h6>
                        <p className="mb-0 text-secondary f-s-12">{meeting.description}</p>
                      </div>
                      <p className="text-secondary mb-0">{meeting.time}</p>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </Col>

    <Col md="5" lg="3">
      <Card>
        <CardBody>
          <h5 className="header-title-text">Activity Hours</h5>

          {/* Placeholder for chart or graph */}
          <Chart options={activityHours} series={activityHours.series} type="line"
                                                height={270}/>

          {/* Static performance text */}
          <div>
            <p className="text-secondary f-w-500 mb-0">
              Your work performance is 30% better compared to last month
            </p>
          </div>
        </CardBody>
      </Card>
    </Col>

    <Col md="7" xxl="5">
      <Card>
        <CardBody>
          {/* Header */}
          <div className="team-chat-header d-flex align-items-center">
            <Link to="/apps/profile-page/profile">
              <span className="profileimg h-45 w-45 d-flex-center bg-primary b-r-50 position-relative">
                RA
                <span className="position-absolute top-0 end-0 p-1 bg-success border border-light rounded-circle"></span>
              </span>
            </Link>
            <div className="flex-grow-1 ps-2 pe-2">
              <h6 className="text-dark mb-0 f-w-600">Innovision Squad</h6>
              <div className="text-muted f-s-12 text-success">Online</div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="team-chat-container app-scroll mt-3">
            {chatMessages.map((chat) => (
              <div
                key={chat.id}
                className={`position-relative ${chat.position === 'right' ? 'right-side-chat' : ''}`}
              >
                <div className="chatdp h-40 w-40 b-r-15 position-absolute">
                  <img src={chat.avatar} alt="" className="img-fluid b-r-15" />
                </div>
                <div className="team-chat-box">
                  <div>
                    <div className="team-text-box">
                      <p className={chat.typing ? "chat-text text-success" : "chat-text"}>
                        {chat.message}
                      </p>
                    </div>
                    <p className="text-muted mb-0">{chat.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Message Input */}
          <div className="team-chat-footer">
            <div className="flex-grow-1">
              <InputGroup>
                <InputGroupText className="mx-2 b-r-10">
                  <Link
                    className="d-flex-center text-secondary"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-original-title="Emoji"
                    role="button"
                  >
                    <i className="ti ti-mood-smile f-s-18"></i>
                  </Link>
                </InputGroupText>
                <Input
                  type="text"
                  className="b-r-6"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <InputGroupText
                  className="ms-2 me-2 b-r-10 bg-primary"
                  onClick={handleSendMessage}
                >
                  <Link
                    className="d-flex-center text-white"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-original-title="Send"
                    role="button"
                  >
                    <i className="ti ti-send f-s-18"></i>
                  </Link>
                </InputGroupText>
              </InputGroup>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
    </>
  )
}

export default ActivityCards
