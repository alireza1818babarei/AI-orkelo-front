import React, { useState } from 'react';
import {Card, CardHeader, CardBody, Nav, NavItem, NavLink, TabContent, TabPane, Col,} from 'reactstrap';
import {Link} from 'react-router-dom'
import TimeSpent from "./TimeSpent";
import SettingProfile from "./SettingProfile";
import ActivityTimeline from "./ActivityTimeline";
import SecurityCard from "./SecurityCard";
import PrivacyCard from "./PrivacyCard";
import Connection from "./Connection";
import Subscription from "./Subscription";
import NotificationSettings from "./NotificationSettings";

const SettingTabs = () => {
    const [activeTab, setActiveTab] = useState('1');

    const toggleTab = (tab) => {
      if (activeTab !== tab) {
        setActiveTab(tab);
      }
    };

  const handleDeleteClick = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
        );
      }
    });
  };
  return (
    <>
    <Col lg={4} xxl={3}>
    <Card>
      <CardHeader>
        <h5>Settings</h5>
      </CardHeader>
      <CardBody>
        <div className="vertical-tab setting-tab">
          <Nav tabs className="app-tabs-primary">
            <NavItem className="cursor-pointer">
              <NavLink
                className={`nav-link ${activeTab === '1' ? 'active' : ''}`}
                onClick={() => toggleTab('1')}
              >
                <i className="ph-bold ph-user-circle-gear pe-2"></i>
                Profile
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={`nav-link ${activeTab === '2' ? 'active' : ''}`}
                onClick={() => toggleTab('2')}
              >
                <i className="ph-bold ph-alarm pe-2"></i>
                Activity
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={`nav-link ${activeTab === '3' ? 'active' : ''}`}
                onClick={() => toggleTab('3')}
              >
                <i className="ph-bold ph-shield-check pe-2"></i>
                Security
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={`nav-link ${activeTab === '4' ? 'active' : ''}`}
                onClick={() => toggleTab('4')}
              >
                <i className="ph-bold ph-lock-open pe-2"></i>
                Privacy
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={`nav-link ${activeTab === '5' ? 'active' : ''}`}
                onClick={() => toggleTab('5')}
              >
                <i className="ph-bold ph-notification pe-2"></i>
                Notification
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={`nav-link ${activeTab === '6' ? 'active' : ''}`}
                onClick={() => toggleTab('6')}
              >
                <i className="ph-bold ph-bell-simple pe-2"></i>
                Subscription
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className={`nav-link ${activeTab === '7' ? 'active' : ''}`}
                onClick={() => toggleTab('7')}
              >
                <i className="ph-bold ph-graph pe-2"></i>
                Connection
              </NavLink>
            </NavItem>
            <NavItem className="cursor-pointer">
              <NavLink
                className="nav-link"
                id="account_delete"
                onClick={handleDeleteClick}
              >
                <i className="ph-bold ph-trash pe-2"></i>
                Delete
              </NavLink>
            </NavItem>
          </Nav>
          
        </div>

       
      </CardBody>
    </Card>

    <Card className="mb-4">
        <CardHeader>
          <h5>Time Spent</h5>
        </CardHeader>
        <CardBody>
          <TimeSpent/>
        </CardBody>
      </Card>

      {/* Used Space Card */}
      <Card className="mb-4">
        <CardBody>
          <Card className="hover-effect card-light-primary mt-4">
            <CardBody>
              <h5>Used Space</h5>
              <p className="mt-2 text-secondary fs-6">
                Your team has used 80% of your available space. Need more?
              </p>
              {/* Custom Progress Bar */}
              <div
                className="progress w-100 mt-3 mb-3"
                role="progressbar"
                aria-valuenow="78.5"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="progress-bar bg-primary progress-bar-striped"
                  style={{ width: '78.5%' }}
                >
                  78.5%
                </div>
              </div>
              <div>
                <a href="#" className="me-3 text-secondary">
                  Dismiss
                </a>
                <a href="#" className="text-decoration-underline">
                  Upgrade plan
                </a>
              </div>
            </CardBody>
          </Card>
          <div className="my-3 border-top"></div>
          <div className="d-flex align-items-center">
            <span className="h-45 w-45 d-flex justify-content-center align-items-center bg-warning rounded-circle position-relative">
              <img
                src="/assets/images/avtar/09.png"
                alt="avatar"
                className="img-fluid rounded-circle"
                style={{ width: '45px', height: '45px' }}
              />
              <span className="position-absolute top-0 end-0 p-1 bg-success border border-light rounded-circle"></span>
            </span>
            <div className="flex-grow-1 ps-2">
              <div className="fw-bold fs-6">Ninfa Monaldo</div>
              <div className="text-secondary fs-6">Web Developer</div>
            </div>
            <div>
              <Link to="/apps/profile-page/profile">
                <i className="ph-bold ph-arrow-square-out fs-4"></i>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
    <Col lg={8} xxl={9}>
      
    <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <SettingProfile/>
          </TabPane>
          <TabPane tabId="2">
            <ActivityTimeline/>
          </TabPane>
          <TabPane tabId="3">
            <SecurityCard/>
          </TabPane>
          <TabPane tabId="4">
            <PrivacyCard/>
          </TabPane>
          <TabPane tabId="5">
            <NotificationSettings/>
          </TabPane>
          <TabPane tabId="6">
            <Subscription/>
          </TabPane>
          <TabPane tabId="7">
            <Connection/>
          </TabPane>
        </TabContent>
    </Col>
    
    
      
    </>
  )
}

export default SettingTabs
