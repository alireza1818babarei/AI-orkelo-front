import React, {useEffect} from 'react';
import {Card, CardBody, Col, Container, Row} from "reactstrap";

const Timeline = () => {
    useEffect(()=>{
        $('.timeline-horizontal-responsive').slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    },
                },
                {
                    breakpoint: 1008,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    },
                },
                {
                    breakpoint: 768       ,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    },
                },
            ],
            // autoplay: true,
            autoplaySpeed: 2000,
            nextArrow: '<div><i class="fa fa-arrow-right"></i></div>',
            prevArrow: '<div><i class="fa fa-arrow-left"></i></div>',
        });
        $('.timeline-horizontal').slick();
        $('.timeline-slick').slick({
            centerMode: true,
            centerPadding: '60px',
            slidesToShow: 3,
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    },
                },
                {
                    breakpoint: 1008,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    },
                },
                {
                    breakpoint: 441,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    },
                },
            ],
        });

    },[])
    return (
        <div>
            <Container fluid>
                <Row className="m-1">
                    <Col xs={12}>
                        <h4 className="main-title">Timeline</h4>
                        <ul className="app-line-breadcrumbs mb-3">
                            <li className="">
                                <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                                </a>
                            </li>
                            <li className="active">
                                <a href="#" className="f-s-14 f-w-500">Timeline</a>
                            </li>
                        </ul>
                    </Col>
                </Row>
                <Row>
                    <Col lg={6}>
                        <Card className="equal-card">
                            <CardBody>
                                <ul className="app-timeline-box">

                                    <li className="timeline-section">
                                        <div className="timeline-icon">
                          <span className="text-light-primary h-35 w-35 d-flex-center b-r-50">
                            <i className="ti ti-circle-check f-s-20"></i>
                          </span>
                                        </div>
                                        <div className="timeline-content bg-light-primary b-1-primary">
                                            <div
                                                className="d-flex justify-content-between align-items-center timeline-flex">
                                                <h6 className="mt-2 text-primary">Task finished</h6>
                                                <p className="text-dark">10 Min ago</p>
                                            </div>
                                            <p className="mt-2 text-dark">The quick, brown fox jumps over a lazy dog.
                                                DJs flock by when MTV ax
                                                quiz prog.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>
                                        </div>
                                    </li>
                                    <li className="timeline-section">
                                        <div className="timeline-icon">
                          <span className="text-light-secondary h-35 w-35 d-flex-center b-r-50">
                            <i className="ti ti-clock f-s-20 "></i>
                          </span>
                                        </div>
                                        <div className="timeline-content bg-light-secondary b-1-secondary">
                                            <div
                                                className="d-flex justify-content-between align-items-center timeline-flex">
                                                <h6 className="mt-2 text-secondary">Task Overdue</h6>
                                                <span className="color-light">50 Min ago</span>
                                            </div>
                                            <p className="mt-2">Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph,
                                                for quick jigs vex! Fox nymphs grab quick-jived waltz.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>
                                            <span className="badge bg-primary-900">Design</span>
                                            <span className="badge bg-primary-900">HTML</span>
                                        </div>
                                    </li>
                                    <li className="timeline-section">
                                        <div className="timeline-icon">
                          <span className="text-light-success h-35 w-35 d-flex-center b-r-50">
                            <i className="ti ti-clipboard-check f-s-20"></i>
                          </span>
                                        </div>
                                        <div className="timeline-content bg-light-success b-1-success">
                                            <div
                                                className="d-flex justify-content-between align-items-center timeline-flex">
                                                <h6 className="mt-2 text-success">New Task</h6>
                                                <span className="text-dark">10 hours ago</span>
                                            </div>
                                            <p className="mt-2 text-dark">Brick quiz whangs jumpy veldt fox. Bright
                                                vixens jump; dozy fowl quack. Quick
                                                wafting zephyrs vex bold Jim.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>
                                        </div>
                                    </li>
                                    <li className="timeline-section">
                                        <div className="timeline-icon">
                          <span className="text-light-info h-35 w-35 d-flex-center b-r-50">
                            <i className="ti ti-message-circle f-s-20"></i>
                          </span>
                                        </div>
                                        <div className="timeline-content bg-light-info b-1-info">
                                            <div
                                                className="d-flex justify-content-between align-items-center timeline-flex">
                                                <h6 className="mt-2 text-info">New Comment</h6>
                                                <span className="text-dark">Yesterday</span>
                                            </div>
                                            <p className="mt-2 text-dark">Quick zephyrs blow, vexing daft Jim.
                                                Sex-charged fop blew my junk TV quiz. How
                                                quickly daft jumping zebras vex.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>

                                        </div>
                                    </li>
                                    <li className="timeline-section">
                                        <div className="timeline-icon">
                          <span className="text-light-warning h-35 w-35 d-flex-center b-r-50">
                            <i className="ti ti-message-circle f-s-20"></i>
                          </span>
                                        </div>
                                        <div className="timeline-content bg-light-warning b-1-warning">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mt-2 text-warning">New Task</h6>
                                                <span className="text-dark">10 hours ago</span>
                                            </div>
                                            <p className="mt-2 text-dark">Brick quiz whangs jumpy veldt fox. Bright
                                                vixens jump; dozy fowl quack. Quick
                                                wafting zephyrs vex bold Jim.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>

                                        </div>
                                    </li>
                                </ul>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col lg={6}>
                        <Card className="equal-card">
                            <CardBody>
                                <ul className="app-side-timeline">
                                    <li className="side-timeline-section left-side">
                                        <div className="side-timeline-icon">
                          <span className="text-light-primary h-25 w-25 d-flex-center b-r-50">
                            <i className="ti ti-circle-filled f-s-12 rounded-circle animate__animated animate__zoomIn animate__infinite animate__slower"></i>
                          </span>
                                        </div>
                                        <div className="timeline-content ">
                                            <div>
                                                <h6 className="mt-2 text-primary">Task finished</h6>
                                                <p className="text-dark">10 Min ago</p>
                                            </div>
                                            <p className="mt-2">The quick, brown fox jumps over a lazy dog. DJs flock by
                                                when MTV ax
                                                quiz prog.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>
                                        </div>
                                    </li>
                                    <li className="side-timeline-section right-side">
                                        <div className="side-timeline-icon">
                          <span className="text-light-secondary h-25 w-25 d-flex-center b-r-50">
                            <i className="ti ti-circle-filled f-s-12 rounded-circle animate__animated animate__zoomIn animate__infinite animate__slower"></i>
                          </span>
                                        </div>
                                        <div className="timeline-content ">
                                            <div>
                                                <h6 className="mt-2 text-secondary">Task Overdue</h6>
                                                <span className="color-light">50 Min ago</span>
                                            </div>
                                            <p className="mt-2">Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph,
                                                for quick jigs vex! Fox nymphs grab quick-jived waltz.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>
                                            <span className="badge bg-primary-900">Design</span>
                                            <span className="badge bg-primary-900">HTML</span>
                                        </div>
                                    </li>
                                    <li className="side-timeline-section left-side">
                                        <div className="side-timeline-icon">
                          <span className="text-light-success h-25 w-25 d-flex-center b-r-50">
                            <i className="ti ti-circle-filled f-s-12 rounded-circle animate__animated animate__zoomIn animate__infinite animate__slower"></i>
                          </span>
                                        </div>
                                        <div className="timeline-content">
                                            <div>
                                                <h6 className="mt-2 text-success">New Task</h6>
                                                <span className="text-dark">10 hours ago</span>
                                            </div>
                                            <p className="mt-2">Brick quiz whangs jumpy veldt fox. Bright vixens jump;
                                                dozy fowl quack. Quick
                                                wafting zephyrs vex bold Jim.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>

                                        </div>
                                    </li>
                                    <li className="side-timeline-section right-side">
                                        <div className="side-timeline-icon">
                          <span className="text-light-info h-25 w-25 d-flex-center b-r-50">
                           <i className="ti ti-circle-filled f-s-12 rounded-circle animate__animated animate__zoomIn animate__infinite animate__slower"></i>
                          </span>
                                        </div>
                                        <div className="timeline-content">
                                            <div>
                                                <h6 className="mt-2 text-info">New Task</h6>
                                                <span className="text-dark">10 hours ago</span>
                                            </div>
                                            <p className="mt-2">Brick quiz whangs jumpy veldt fox. Bright vixens jump;
                                                dozy fowl quack. Quick
                                                wafting zephyrs vex bold Jim.
                                                <a href="#" className="text-primary">[more info]</a>
                                            </p>

                                        </div>
                                    </li>
                                </ul>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xs={12}>
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col xs={12}>
                                        <div className="timeline-horizontal">
                                            <div className="main-timeline-section">
                                                <div className="conference-center-line"></div>
                                                <div>
                                                    <div
                                                        className="conference-timeline-content slider timeline-horizontal-responsive">
                                                        <div className="timeline-article">
                                                            <div className="meta-date border-info">
                                    <span
                                        className="text-light-info h-40  w-40 p-3 d-flex-center b-r-50 timline_position">
                                      <i className="fa-regular fa-comment-dots f-s-20 mg-t-2"></i>
                                    </span>
                                                            </div>
                                                            <div
                                                                className="card card-light-info content-box content-box-bottom">
                                                                <CardBody>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                                        <h6 className="m-0 text-info">New Task</h6>
                                                                        <span className="text-info">10 hours ago</span>
                                                                    </div>
                                                                    <p className="text-secondary timeline-ellipsis"> A
                                                                        business- and employment-oriented
                                                                        social
                                                                        networking service that operates via websites
                                                                        and nomile apps
                                                                    </p>
                                                                </CardBody>
                                                            </div>
                                                        </div>
                                                        <div className="timeline-article">
                                                            <div className="meta-date border-success">
                                    <span
                                        className="text-light-success h-40  w-40 p-3 d-flex-center b-r-50 timline_position">
                                      <i className="fa-regular fa-square-check f-s-20 mg-t-2"></i>
                                    </span>
                                                            </div>
                                                            <div
                                                                className="card card-light-success content-box content-box-top">
                                                                <CardBody>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                                        <h6 className="m-0 text-success">New Task</h6>
                                                                        <span
                                                                            className="text-success">10 hours ago</span>
                                                                    </div>
                                                                    <p className="text-secondary timeline-ellipsis"> An
                                                                        online social media and social
                                                                        networking sercice based in menlo park,
                                                                        califonia.
                                                                    </p>
                                                                </CardBody>
                                                            </div>
                                                        </div>
                                                        <div className="timeline-article">
                                                            <div className="meta-date border-secondary">
                                    <span
                                        className="text-light-secondary h-40  w-40 p-3 d-flex-center b-r-50 timline_position">
                                      <i className="fa-regular fa-clock f-s-20 mg-t-2"></i>
                                    </span>
                                                            </div>
                                                            <div
                                                                className="card card-light-secondary content-box content-box-bottom">
                                                                <CardBody>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                                        <h6 className="m-0 text-secondary">New Task</h6>
                                                                        <span
                                                                            className="text-secondary">10 hours ago</span>
                                                                    </div>
                                                                    <p className="text-secondary timeline-ellipsis"> A
                                                                        service for friends,family, and
                                                                        coworkers to communcate
                                                                        and stay connected through the exchange of
                                                                        quick, frequent messages.
                                                                    </p>
                                                                </CardBody>
                                                            </div>
                                                        </div>
                                                        <div className="timeline-article">
                                                            <div className="meta-date border-primary">
                                    <span
                                        className="text-light-primary h-40  w-40 p-3 d-flex-center b-r-50 timline_position">
                                      <i className="fa-regular fa-circle-check f-s-20 mg-t-2"></i>
                                    </span>
                                                            </div>
                                                            <Card
                                                                className="card-light-primary content-box content-box-top">
                                                                <CardBody>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                                        <h6 className="m-0 text-primary">New Task</h6>
                                                                        <span
                                                                            className="text-primary">10 hours ago</span>
                                                                    </div>
                                                                    <p className="text-secondary timeline-ellipsis"> First
                                                                        large-scale video sharing
                                                                        website that
                                                                        makes it easy to watch videos online.
                                                                    </p>
                                                                </CardBody>
                                                            </Card>
                                                        </div>
                                                        <div className="timeline-article">
                                                            <div className="meta-date border-info">
                                    <span
                                        className="text-light-info h-40  w-40 p-3 d-flex-center b-r-50 timline_position">
                                      <i className="fa-regular fa-comment-dots f-s-20 mg-t-2"></i>
                                    </span>
                                                            </div>
                                                            <div
                                                                className="card card-light-info content-box content-box-bottom">
                                                                <CardBody>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                                        <h6 className="m-0 text-info">New Task</h6>
                                                                        <span className="text-info">10 hours ago</span>
                                                                    </div>
                                                                    <p className="text-secondary timeline-ellipsis"> Lets
                                                                        you effortlessly share anthing.
                                                                        Post text,photos
                                                                        quotes, links,music,and videos from your
                                                                        browser, phone, desktop, email.
                                                                    </p>
                                                                </CardBody>
                                                            </div>
                                                        </div>
                                                        <div className="timeline-article">
                                                            <div className="meta-date border-success">
                                    <span
                                        className="text-light-success h-40  w-40 p-3 d-flex-center b-r-50 timline_position">
                                      <i className="fa-regular fa-square-check f-s-20 mg-t-2"></i>
                                    </span>
                                                            </div>
                                                            <div
                                                                className="card card-light-success content-box content-box-top">
                                                                <CardBody>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                                        <h6 className="m-0 text-success">New Task</h6>
                                                                        <span
                                                                            className="text-success">10 hours ago</span>
                                                                    </div>
                                                                    <p className="text-secondary timeline-ellipsis"> The
                                                                        home for visual stroytelling
                                                                        for everyone from celebrities, newsrooms and
                                                                        newsrooms and brands to teens,
                                                                        musicians and anyone with a creative passion.
                                                                    </p>
                                                                </CardBody>
                                                            </div>
                                                        </div>
                                                        <div className="timeline-article">
                                                            <div className="meta-date border-secondary">
                                    <span
                                        className="text-light-secondary h-40  w-40 p-3 d-flex-center b-r-50 timline_position">
                                      <i className="fa-regular fa-clock f-s-20 mg-t-2"></i>
                                    </span>
                                                            </div>
                                                            <div
                                                                className="card card-light-secondary content-box content-box-bottom">
                                                                <CardBody>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                                        <h6 className="m-0 text-secondary">New Task</h6>
                                                                        <span
                                                                            className="text-secondary">10 hours ago</span>
                                                                    </div>
                                                                    <p className="text-secondary timeline-ellipsis"> A
                                                                        visual bookmarking tool that helps
                                                                        you
                                                                        disscore and save creative ideas.
                                                                    </p>
                                                                </CardBody>
                                                            </div>
                                                        </div>
                                                        <div className="timeline-article">
                                                            <div className="meta-date border-primary">
                                    <span
                                        className="text-light-primary h-40  w-40 p-3 d-flex-center b-r-50 timline_position">
                                      <i className="fa-solid fa-check f-s-20 mg-t-2"></i>
                                    </span>
                                                            </div>
                                                            <Card
                                                                className="card-light-primary content-box content-box-top">
                                                                <CardBody>
                                                                    <div
                                                                        className="d-flex justify-content-between align-items-center mb-2">
                                                                        <h6 className="m-0 text-primary">New Task</h6>
                                                                        <span
                                                                            className="text-primary">10 hours ago</span>
                                                                    </div>
                                                                    <p className="text-secondary timeline-ellipsis"> Lorem
                                                                        ipsum dolor sit amet,
                                                                        consectetur adipisicing elit. Quis deserunt
                                                                        minus ipsa qui minima! Quibusdam
                                                                        possimus quia quas? Facere ea sint perspiciatis
                                                                        non odit nihil soluta amet
                                                                        sapiente deleniti omnis.
                                                                    </p>
                                                                </CardBody>
                                                            </Card>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Timeline;