
import React, {useEffect} from 'react'
import {Row, Col, CardImg} from 'reactstrap';
import {Container} from "reactstrap";
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';

const Gallery = () => {

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lightbox = GLightbox({
                selector: '.glightbox',
                touchNavigation: true,
                loop: true,
                width: '90vw',
                height: '90vh',
            });


            return () => {
                lightbox.destroy();
            };
        }
    }, []);

    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Gallery</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                    <span>
                      <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                    </span>
                            </a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Gallery</a>
                        </li>
                    </ul>
                </Col>
            </Row>

            <div className="gallery-grid-container">
                <Row>
                    <Col sm="6" lg="4">
                        <div className="imagebox">
                            <a href="/assets/images/gallary/01.jpg" className="glightbox"
                               data-glightbox="type: image; zoomable: true;">
                                <CardImg src="/assets/images/gallary/01.jpg" alt="image"/>
                            </a>
                            <div className="caption-content">
                                <p>Simple Image</p>
                            </div>
                        </div>
                    </Col>

                    <Col sm="6" lg="4">
                        <div className="imagebox">
                            <a href="/assets/images/gallary/02.jpg" className="glightbox"
                               data-glightbox="title:Description Bottom; description: You can set the position of the description">
                                <CardImg src="/assets/images/gallary/02.jpg" alt="image"/>
                            </a>
                            <div className="caption-content">
                                <p>Image With Bottom Description</p>
                            </div>
                        </div>
                    </Col>

                    <Col lg="4">
                        <Row>
                            <Col sm="3" lg="6">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/03.jpg" className="glightbox"
                                       data-glightbox="title:Description Right; description: You can set the position of the description; descPosition: right;">
                                        <CardImg src="/assets/images/gallary/03.jpg" alt="image"/>
                                    </a>
                                    <div className="caption-content">
                                        <p>Image With Right Description</p>
                                    </div>
                                </div>
                            </Col>

                            <Col sm="3" lg="6">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/04.jpg" className="glightbox"
                                       data-glightbox="title: Description Left;  description: You can set the position of the description; descPosition: left;">
                                        <CardImg src="/assets/images/gallary/04.jpg" alt="image"/>
                                    </a>
                                    <div className="caption-content">
                                        <p>Image With Left Description</p>
                                    </div>
                                </div>
                            </Col>

                            <Col sm="3" lg="6">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/05.jpg" className="glightbox"
                                       data-glightbox="title: Description Left;  description: You can set the position of the description; descPosition: top;">
                                        <CardImg src="/assets/images/gallary/05.jpg" alt="image"/>
                                    </a>
                                    <div className="caption-content">
                                        <p>Image With Top Description</p>
                                    </div>
                                </div>
                            </Col>

                            <Col sm="3" lg="6">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/06.jpg" className="glightbox"
                                       data-glightbox="type: image; zoomable: true;">
                                        <CardImg src="/assets/images/gallary/06.jpg" alt="image"/>
                                    </a>
                                    <div className="caption-content">
                                        <p>Simple Image</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>

                    <Col md="3">
                        <div className="imagebox">
                            <a href="/assets/images/gallary/07.jpg" className="glightbox">
                                <CardImg src="/assets/images/gallary/07.jpg" alt="image"/>
                            </a>
                            <div className="caption-content">
                                <p>Simple Image With Video</p>
                            </div>
                        </div>
                    </Col>

                    <Col md="3">
                        <div className="imagebox">
                            <a href="/assets/images/gallary/08.jpg" className="glightbox"
                               data-glightbox="type: image; zoomable: true;">
                                <CardImg src="/assets/images/gallary/08.jpg" alt="image"/>
                            </a>
                            <div className="caption-content">
                                <p>Simple Image</p>
                            </div>
                        </div>
                    </Col>

                    <Col md="3">
                        <div className="imagebox">
                            <a href="/assets/images/gallary/09.jpg" className="glightbox"
                               data-glightbox="type: image; zoomable: true;">
                                <CardImg src="/assets/images/gallary/09.jpg" alt="image"/>
                            </a>
                            <div className="caption-content">
                                <p>Simple Image</p>
                            </div>
                        </div>
                    </Col>

                    <Col md="3">
                        <div className="imagebox">
                            <a href="/assets/images/gallary/10.jpg" className="glightbox"
                               data-glightbox="type: image; zoomable: true;">
                                <CardImg src="/assets/images/gallary/10.jpg" alt="image"/>
                            </a>
                            <div className="caption-content">
                                <p>Simple Image</p>
                            </div>
                        </div>
                    </Col>

                    <Col sm="6">
                        <Row>
                            <Col xs="6">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/11.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                                        <CardImg src="/assets/images/gallary/11.jpg" alt="image" className="img-fluid" />
                                    </a>
                                    <div className="caption-content">
                                        <p>Simple Image</p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs="6">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/12.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                                        <CardImg src="/assets/images/gallary/12.jpg" alt="image" className="img-fluid" />
                                        <div className="transparent-box2"></div>
                                    </a>
                                    <div className="caption-content">
                                        <p>Simple Image</p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs="12">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/14.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                                        <CardImg src="/assets/images/gallary/14.jpg" alt="image" className="img-fluid" />
                                    </a>
                                    <div className="caption-content">
                                        <p>Simple Image</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>

                    <Col sm="6">
                        <Row>
                            <Col xs="12">
                                <div className="imagebox">
                                    <a href="/assets/images/profile-app/video.mp4" className="glightbox">
                                        <CardImg src="/assets/images/gallary/13.jpg" alt="video thumbnail" className="img-fluid" />
                                        <div className="caption-content video-caption">
                                            <i className="fa-solid fa-play-circle fa-fw f-s-35"></i>
                                        </div>
                                    </a>
                                    <div className="caption-content">
                                        <p>Simple Image with Video</p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs="6">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/15.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                                        <CardImg src="/assets/images/gallary/15.jpg" alt="image" className="img-fluid" />
                                    </a>
                                    <div className="caption-content">
                                        <p>Simple Image</p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs="6">
                                <div className="imagebox">
                                    <a href="/assets/images/gallary/16.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                                        <CardImg src="/assets/images/gallary/16.jpg" alt="image" className="img-fluid" />
                                    </a>
                                    <div className="caption-content">
                                        <p>Simple Image</p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        </Container>
    )
}

export default Gallery