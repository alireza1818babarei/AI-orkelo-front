import React from 'react';
import { Card, CardBody, Row, Col } from 'reactstrap';

const FeaturedPost = () => {

    return (
        <Card>
          <CardBody>
            <div className="d-flex align-items-center">
              <div className="h-45 w-45 d-flex-center b-r-50 overflow-hidden bg-danger">
                <img src="/assets/images/avtar/16.png" alt="" className="img-fluid" />
              </div>
              <div className="flex-grow-1 ps-2 pe-2">
                <div className="f-w-600">Heli Walsh</div>
                <div className="text-muted f-s-12">3 Week</div>
              </div>
              <div><i className="ti ti-dots-vertical"></i></div>
            </div>
            <div className="post-div">
              <Row className="g-2 my-2">
                <Col xs="6">
                  <a href="/assets/images/profile-app/19.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                    <img src="/assets/images/profile-app/19.jpg" className="w-100 rounded" alt="" />
                  </a>
                </Col>
                <Col xs="6">
                  <a href="/assets/images/profile-app/27.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                    <img src="/assets/images/profile-app/27.jpg" className="w-100 rounded" alt="" />
                  </a>
                </Col>
                <Col xs="4">
                  <a href="/assets/images/profile-app/28.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                    <img src="/assets/images/profile-app/28.jpg" className="w-100 rounded" alt="" />
                  </a>
                </Col>
                <Col xs="4">
                  <a href="/assets/images/profile-app/29.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                    <img src="/assets/images/profile-app/29.jpg" className="w-100 rounded" alt="" />
                  </a>
                </Col>
                <Col xs="4">
                  <a href="/assets/images/profile-app/30.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                    <img src="/assets/images/profile-app/30.jpg" className="w-100 rounded" alt="" />
                  </a>
                </Col>
              </Row>
              <p className="test-muted">There's nothing like fresh flowers!......🌸🌼🌻</p>
              <div className="post-icon">
                <i className="ti ti-heart"></i>
                <i className="ti ti-brand-hipchat"></i>
                <i className="ti ti-send"></i>
                <p className="text-secondary">2k Likes</p>
              </div>
            </div>
          </CardBody>
        </Card>
    );
};

export default FeaturedPost;