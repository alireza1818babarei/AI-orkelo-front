
import React, {useState} from 'react';
import {Row, Col, Card, CardBody, Button, Nav, NavItem, NavLink, TabPane} from "reactstrap";
import classnames from 'classnames';
import {
    demoAdvanceui, demoAuth, demoError,
    demoForms,
    demoIcon,
    demoItems, demoReadytouse,
    demos,
    demoTable,
    demoUi
} from "../../Data/Landing/democard";

const Demosection = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const toggle = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };
    return (
        <div>
            <div className="container-fluid">
                <Row>
                    <div className="col-xl-6 offset-xl-3">
                        <div className="landing-title text-md-center">
                            <h2 className=""><span className="highlight-title">150+</span> pages</h2>
                            <p>All pages created with unlimited features that will reduce the cost, efforts and your
                                time.</p>
                        </div>
                    </div>
                </Row>
                <Row>
                    <div className="col-xl-8 offset-xl-2">
                        <div className="demos-tab-section ">
                            <Nav tabs className="app-tabs-dark" id="v-bg" role="tablist">
                                {/* Dashboard */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'dashboard' })}
                                        onClick={() => toggle('dashboard')}
                                        role="tab"
                                    >
                                        <i className="ti ti-home pe-2 ps-1"></i> Dashboard
                                    </NavLink>
                                </NavItem>

                                {/* Apps */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'apps' })}
                                        onClick={() => toggle('apps')}
                                        role="tab"
                                    >
                                        <i className="ti ti-server pe-2 ps-1"></i> Apps
                                    </NavLink>
                                </NavItem>

                                {/* UI Kits */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'ui' })}
                                        onClick={() => toggle('ui')}
                                        role="tab"
                                    >
                                        <i className="ti ti-first-aid-kit pe-2 ps-1"></i> UI Kits
                                    </NavLink>
                                </NavItem>

                                {/* Advance UI */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'advance-ui' })}
                                        onClick={() => toggle('advance-ui')}
                                        role="tab"
                                    >
                                        <i className="ti ti-briefcase pe-2 ps-1"></i> Advance UI
                                    </NavLink>
                                </NavItem>

                                {/* Icons */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'icons' })}
                                        onClick={() => toggle('icons')}
                                        role="tab"
                                    >
                                        <i className="ti ti-icons pe-2 ps-2"></i> Icons
                                    </NavLink>
                                </NavItem>

                                {/* Tables */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'table' })}
                                        onClick={() => toggle('table')}
                                        role="tab"
                                    >
                                        <i className="ti ti-table pe-2 ps-2"></i> Tables
                                    </NavLink>
                                </NavItem>

                                {/* Forms */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'forms' })}
                                        onClick={() => toggle('forms')}
                                        role="tab"
                                    >
                                        <i className="ti ti-forms pe-2 ps-2"></i> Forms
                                    </NavLink>
                                </NavItem>

                                {/* Ready To Use */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'ready-to-use' })}
                                        onClick={() => toggle('ready-to-use')}
                                        role="tab"
                                    >
                                        <i className="ti ti-table-import pe-2 ps-2"></i> Ready To Use
                                    </NavLink>
                                </NavItem>

                                {/* Auth Pages */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'auth' })}
                                        onClick={() => toggle('auth')}
                                        role="tab"
                                    >
                                        <i className="ti ti-news pe-2 ps-2"></i> Auth Pages
                                    </NavLink>
                                </NavItem>

                                {/* Error Pages */}
                                <NavItem role="presentation">
                                    <NavLink
                                        className={classnames({ active: activeTab === 'error' })}
                                        onClick={() => toggle('error')}
                                        role="tab"
                                    >
                                        <i className="ti ti-news pe-2 ps-2"></i> Error Pages
                                    </NavLink>
                                </NavItem>
                            </Nav>


                        </div>
                    </div>
                    <Col xs={12}>
                        <div className="tab-content mt-3">

                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'dashboard',
                                    active: activeTab === 'dashboard',
                                })}
                                id="dashboard-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >
                                <Row>
                                    {demos.map((demo, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={demo.imgSrc}
                                                        alt={`${demo.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{demo.title}</h6>
                                                        <Button
                                                            href={demo.link}
                                                            target="_blank"
                                                            role="button"
                                                            className={`icon-btn b-r-22 ${demo.btnClass}`}
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </TabPane>



                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'apps',
                                    active: activeTab === 'apps',
                                })}
                                id="apps-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >

                                <Row>
                                    {demoItems.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className={`icon-btn b-r-22 ${item.btnClass}`}
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </TabPane>

                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'ui',
                                    active: activeTab === 'ui',
                                })}
                                id="ui-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >
                                <Row>
                                    {demoUi.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className={`icon-btn b-r-22 ${item.btnClass}`}
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                            </TabPane>

                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'advance-ui',
                                    active: activeTab === 'advance-ui',
                                })}
                                id="advance-ui-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >
                                <Row>
                                    {demoAdvanceui.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className={`icon-btn b-r-22 ${item.btnClass}`}
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                            </TabPane>


                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'icons',
                                    active: activeTab === 'icons',
                                })}
                                id="icons-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >

                                <Row>
                                    {demoIcon.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className="btn btn-primary icon-btn b-r-22"
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                            </TabPane>

                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'table',
                                    active: activeTab === 'table',
                                })}
                                id="table-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >
                                <Row>
                                    {demoTable.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className={`btn btn-${item.btnColor} icon-btn b-r-22`}
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </TabPane>

                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'forms',
                                    active: activeTab === 'forms',
                                })}
                                id="forms-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >
                                <Row>
                                    {demoForms.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className={`btn btn-${item.btnColor} icon-btn b-r-22`}
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                            </TabPane>


                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'ready-to-use',
                                    active: activeTab === 'ready-to-use',
                                })}
                                id="ready-to-use-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >

                                <Row>
                                    {demoReadytouse.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className={`btn btn-${item.btnColor} icon-btn b-r-22`}
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                            </TabPane>

                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'auth',
                                    active: activeTab === 'auth',
                                })}
                                id="auth-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >
                                <Row>
                                    {demoAuth.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className="btn btn-primary icon-btn b-r-22"
                                                        >
                                                            <i className="ti ti-chevrons-right"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>

                            </TabPane>

                            <TabPane
                                tabId="dashboard"
                                className={classnames('tab-pane fade', {
                                    show: activeTab === 'error',
                                    active: activeTab === 'error',
                                })}
                                id="error-tab-pane"
                                role="tabpanel"
                                tabIndex="0"
                            >
                                <Row>
                                    {demoError.map((item, index) => (
                                        <Col sm="6" lg="3" key={index}>
                                            <Card className="demo-card">
                                                <CardBody>
                                                    <img
                                                        src={item.imgSrc}
                                                        alt={`${item.title} demo`}
                                                        className="img-fluid b-r-8"
                                                    />
                                                    <div className="demo-box">
                                                        <h6 className="m-0 f-w-500 f-s-18">{item.title}</h6>
                                                        <Button
                                                            href={item.link}
                                                            target="_blank"
                                                            role="button"
                                                            className={`btn btn-${item.buttonColor} icon-btn b-r-22`}
                                                        >
                                                            <i className="ph-bold ph-caret-right f-s-18 f-w-900"></i>
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>


                            </TabPane>

                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Demosection;