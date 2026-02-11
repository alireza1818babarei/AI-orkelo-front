import React from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

const AboutMe = () => {
    return (
        <Card>
            <CardHeader>
                <h5>About Me</h5>
            </CardHeader>
            <CardBody>
                <p className="text-muted f-s-13">
                    Hello! I am Ninfa Monaldo, a devoted web designer with over five years of experience and a strong understanding of Adobe Creative Suite, HTML5, CSS3, and Java. Excited to bring my exceptional front-end development abilities to the retail industry.
                </p>
                <div className="about-list">
                    <div>
                        <span className="fw-medium"><i className="ti ti-briefcase"></i> Work passion</span>
                        <span className="float-end f-s-13 text-secondary">IT Section</span>
                    </div>
                    <div>
                        <span className="fw-medium"><i className="ti ti-mail"></i> Email</span>
                        <span className="float-end f-s-13 text-secondary">Ninfa@gmail.com</span>
                    </div>
                    <div>
                        <span className="fw-medium"><i className="ti ti-phone"></i> Contact</span>
                        <span className="float-end f-s-13 text-secondary">0364 4559103</span>
                    </div>
                    <div>
                        <span className="fw-medium"><i className="ti ti-cake"></i> Birth of Date</span>
                        <span className="float-end f-s-13 text-secondary">24 Oct</span>
                    </div>
                    <div>
                        <span className="fw-semibold"><i className="ti ti-map-pin"></i> Location</span>
                        <span className="float-end f-s-13 text-secondary">Via Partenope, 117</span>
                    </div>
                    <div>
                        <span className="fw-semibold"><i className="ti ti-device-laptop"></i> Website</span>
                        <span className="float-end f-s-13 text-secondary">Ninfa_devWWW.com</span>
                    </div>
                    <div>
                        <span className="fw-semibold"><i className="ti ti-brand-github"></i> Github</span>
                        <span className="float-end f-s-13 text-secondary">Ninfa_dev</span>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default AboutMe;