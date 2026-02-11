
import React, {useState} from 'react'
import {Card, CardBody, CardHeader, Col, Container, Progress, Row} from "reactstrap";
import ApexCharts from "react-apexcharts";
import CloudTabData from "@/Components/Filemanager/CloudTabData.jsx";


const FileManager = () => {
    const [activeTab, setActiveTab] = useState('1');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Filemanager</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                                        <span>
                                          <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                                        </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Filemanager</a>
                        </li>
                    </ul>
                </Col>
            </Row>
            <Row>
                <Col lg={4} xxl={3}>
                    <Card>
                        <CardHeader>
                            <h5>My Drive</h5>
                        </CardHeader>

                        <CardBody>
                            <div className="horizontal-tab-wrapper">
                                <ul className="filemenu-list mt-3 tabs">
                                    <li
                                        className={`tab-link ${activeTab === '1' ? 'active' : ''}`}
                                        onClick={() => handleTabClick('1')}
                                        data-tab="1"
                                    >
                                        <i className="ti ti-folder-filled fs-5 pe-2"></i>
                                        <span className="flex-grow-1">My Cloud</span>
                                        10+
                                    </li>

                                    <li
                                        className={`tab-link ${activeTab === '2' ? 'active' : ''}`}
                                        onClick={() => handleTabClick('2')}
                                        data-tab="2"
                                    >
                                        <i className="ti ti-star fs-5 pe-2"></i>
                                        <span className="flex-grow-1">Starred</span>
                                    </li>

                                    <li
                                        className={`tab-link ${activeTab === '3' ? 'active' : ''}`}
                                        onClick={() => handleTabClick('3')}
                                        data-tab="3"
                                    >
                                        <i className="ti ti-trash fs-5 pe-2"></i>
                                        <span className="flex-grow-1">Recycle Bin</span>
                                        2+
                                    </li>

                                    <li
                                        className={`tab-link ${activeTab === '4' ? 'active' : ''}`}
                                        onClick={() => handleTabClick('4')}
                                        data-tab="4"
                                    >
                                        <i className="ti ti-rotate-clockwise fs-5 pe-2"></i>
                                        <span className="flex-grow-1">Recent</span>
                                    </li>

                                    <div className="app-divider-v dashed m-0 p-2"></div>

                                    <li
                                        className="tab-link"
                                        onClick={() => handleTabClick('5')}
                                    >
                                        <i className="ti ti-send fs-5 pe-2"></i>
                                        <span className="flex-grow-1">Shared File</span>
                                    </li>

                                    <li
                                        className="tab-link"
                                        onClick={() => handleTabClick('6')}
                                    >
                                        <i className="ti ti-help fs-5 pe-2"></i>
                                        <span className="flex-grow-1">Help</span>
                                    </li>

                                    <li
                                        className="tab-link"
                                        onClick={() => handleTabClick('7')}
                                    >
                                        <i className="ti ti-adjustments-alt fs-5 pe-2"></i>
                                        <span className="flex-grow-1">Settings</span>
                                    </li>


                                </ul>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader>
                            <h5>Overview</h5>
                        </CardHeader>

                        <CardBody>
                            <div className="mb-3">
                                <ApexCharts

                                    series={[70]}
                                    type={'radialBar'}
                                    height={350}
                                    options={{
                                        chart: {
                                            offsetY: -20,
                                            sparkline: {
                                                enabled: true
                                            }
                                        },
                                        colors: ['rgba(var(--primary),1)'],
                                        plotOptions: {
                                            radialBar: {
                                                startAngle: -90,
                                                endAngle: 90,
                                                track: {
                                                    background: "#e7e7e7",
                                                    strokeWidth: '97%',
                                                    margin: 5, // margin is in pixels
                                                    dropShadow: {
                                                        enabled: true,
                                                        top: 2,
                                                        left: 0,
                                                        color: '#999',
                                                        opacity: 1,
                                                        blur: 2,
                                                    }
                                                },
                                                dataLabels: {
                                                    name: {
                                                        show: false
                                                    },
                                                    value: {
                                                        offsetY: -4,
                                                        fontSize: '22px'
                                                    }
                                                }
                                            }
                                        },
                                        grid: {
                                            padding: {
                                                top: -20
                                            }
                                        },
                                        fill: {
                                            type: '',
                                            gradient: {
                                                shade: '',
                                                shadeIntensity: 0.4,
                                                inverseColors: false,
                                                opacityFrom: 1,
                                                opacityTo: 1,
                                                stops: [0, 60, 73, 108]
                                            },
                                        },
                                        labels: ['Average Results'],
                                    }}


                                />
                            </div>
                            <div className="file-manager-sidebar mb-4">
                                <div className="d-flex align-items-center position-relative">
                        <span className="text-light-primary h-40 w-40 d-flex-center b-r-10 position-absolute">
                          <i className="ph-bold  ph-image f-s-20"></i>
                        </span>
                                    <div className="flex-grow-1 ms-5">
                                        <h6 className="mb-0">Images</h6>
                                        <p className="text-secondary mb-0">1.195 Files</p>
                                    </div>
                                    <p className="text-secondary f-w-500 mb-0">37.2GB</p>
                                </div>
                            </div>
                            <div className="file-manager-sidebar mb-4">
                                <div className="d-flex align-items-center position-relative">
                        <span className="text-light-success h-40 w-40 d-flex-center b-r-10 position-absolute">
                          <i className="ph-bold  ph-video f-s-22"></i>
                        </span>
                                    <div className="flex-grow-1 ms-5  ">
                                        <h6 className="mb-0">Videos</h6>
                                        <p className="text-secondary mb-0">53 Files</p>
                                    </div>
                                    <p className="text-secondary f-w-500 mb-0">19.1 GB</p>
                                </div>
                            </div>
                            <div className="file-manager-sidebar mb-4">
                                <div className="d-flex align-items-center position-relative">
                        <span className="text-light-danger h-40 w-40 d-flex-center b-r-10 position-absolute">
                          <i className="ph-bold  ph-file-archive f-s-20"></i>
                        </span>
                                    <div className="flex-grow-1 ms-5  ">
                                        <h6 className="mb-0">Documents</h6>
                                        <p className="text-secondary mb-0">486 Files</p>
                                    </div>
                                    <p className="text-secondary f-w-500 mb-0">23.5 MB</p>
                                </div>
                            </div>
                            <div className="file-manager-sidebar">
                                <div className="d-flex align-items-center position-relative">
                        <span className="text-light-warning h-40 w-40 d-flex-center b-r-10 position-absolute">
                          <i className="ph-bold  ph-files f-s-20"></i>
                        </span>
                                    <div className="flex-grow-1 ms-5  ">
                                        <h6 className="mb-0">Others</h6>
                                        <p className="text-secondary mb-0">32 Files</p>
                                    </div>
                                    <p className="text-secondary f-w-500 mb-0">13 MB</p>
                                </div>
                            </div>
                        </CardBody>


                    </Card>
                    <Card>
                        <CardHeader>
                            <h5>File Upload</h5>
                        </CardHeader>
                        <CardBody>
                            <div className="mb-4">
                                <h6 className="mb-1 text-dark">Uploading 59 photos</h6>
                                <div>
                                    <div className="d-flex justify-content-between">
                                        <p className="text-secondary">Photoes 01</p>
                                        <span className="text-primary">65%</span>
                                    </div>
                                    <Progress className="h-5" value={65} max={100} color="primary"/>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="mb-1 text-dark">Uploading 7 videos</h6>
                                <div>
                                    <div className="d-flex justify-content-between">
                                        <p className="text-secondary">Museum</p>
                                        <span className="text-primary">25%</span>
                                    </div>
                                    <Progress className="h-5" value={25} max={100} color="primary"/>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="mb-1 text-dark">Uploading 12 Documents</h6>
                                <div>
                                    <div className="d-flex justify-content-between">
                                        <p className="text-secondary">My Work</p>
                                        <span className="text-primary">90%</span>
                                    </div>
                                    <Progress className="h-5" value={90} max={100} color="primary"/>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col lg={8} xxl={9}>
                    <div className="content-wrapper">
                        <div id="tab-1" className={`tabs-content ${activeTab === '1' ? 'active' : ''}`}>
                            <CloudTabData/>
                        </div>
                        <div id="tab-2" className={`tabs-content ${activeTab === '2' ? 'active' : ''}`}>
                            <div className="card documents-section">
                                <CardHeader>
                                    <h5>Starred Documents & Files</h5>
                                </CardHeader>
                                <CardBody>
                                    <Row>

                                    </Row>
                                </CardBody>
                            </div>
                        </div>
                        <div id="tab-3" className={`tabs-content ${activeTab === '3' ? 'active' : ''}`}>
                            <div className="card documents-sections">
                                <CardHeader>
                                    <h5>Deleted Flies</h5>
                                </CardHeader>

                                <CardBody>
                                    <Row>

                                    </Row>
                                </CardBody>
                            </div>

                        </div>
                        <div id="tab-4" className={`tabs-content ${activeTab === '4' ? 'active' : ''}`}>
                            <Card>
                                <CardHeader>
                                    <h5>Recent Added</h5>
                                </CardHeader>
                                <CardBody>
                                    <Row>

                                    </Row>
                                </CardBody>
                            </Card>
                        </div>

                    </div>
                </Col>

            </Row>

        </Container>
    )
}

export default FileManager