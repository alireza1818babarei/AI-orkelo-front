import React, {useState} from 'react';
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Form,
    FormGroup,
    Label,
    Row,
    Col,
    Badge,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    ListGroup,
    ListGroupItem,
    CardImg
} from 'reactstrap';
import {Link} from 'react-router-dom'


const BlogDetails = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

    }
    React.useEffect(() => {
        const lightbox = GLightbox({
            selector: '.glightbox',  // Apply GLightbox to all elements with class 'glightbox'
        });
    }, []);
    return (
        <div>
            <div className="container-fluied">
                <Row>
                    <Row className="m-1">
                        <Col xs={12}>
                            <h4 className="main-title">Blog Details</h4>
                            <ul className="app-line-breadcrumbs mb-3">
                                <li className="">
                                    <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="f-s-14 f-w-500">Blog Page</a>
                                </li>
                                <li className="active">
                                    <a href="#" className="f-s-14 f-w-500">Blog Details</a>
                                </li>
                            </ul>
                        </Col>
                    </Row>
                </Row>
                <div className="row">
                    <div className="col-lg-8 col-xxl-9">
                        <div className="card">
                            <CardBody>
                                <div className="post-div mb-3">
                                    <Row>
                                        <Col xs="12">
                                            <video controls className="w-100 h-400 rounded">
                                                <source src="/assets/images/blog-app/video1.mp4" type="video/mp4" />
                                                <source src="movie.ogg" type="video/ogg" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </Col>

                                        <Col xs="6" sm="3">
                                            <a href="/assets/images/blog-app/09.jpg" className="glightbox img-fluid" data-glightbox="type: image;">
                                                <img src="/assets/images/blog-app/09.jpg" className="img-fluid" alt="image" />
                                            </a>
                                        </Col>

                                        <Col xs="6" sm="3">
                                            <a href="/assets/images/blog-app/05.jpg" className="glightbox img-fluid" data-glightbox="type: image;">
                                                <img src="/assets/images/blog-app/05.jpg" className="img-fluid" alt="image" />
                                            </a>
                                        </Col>

                                        <Col xs="6" sm="3">
                                            <a href="/assets/images/blog-app/08.jpg" className="glightbox img-fluid" data-glightbox="type: image;">
                                                <img src="/assets/images/blog-app/08.jpg" className="img-fluid" alt="image" />
                                            </a>
                                        </Col>

                                        <Col xs="6" sm="3">
                                            <a href="/assets/images/blog-app/04.jpg" className="glightbox img-fluid" data-glightbox="type: image;">
                                                <img src="/assets/images/blog-app/04.jpg" className="img-fluid" alt="image" />
                                            </a>
                                        </Col>
                                    </Row>
                                </div>

                                <h5 className="mb-3 text-dark font-weight-bold">Adjust your focus when life gets blurry.</h5>

                                <div className="mb-3">
                                    <p className="text-secondary">
                                        Photography is the art, application, and practice of creating images by recording light, either electronically by means of an image sensor, or chemically by means of a light-sensitive material such as photographic film.
                                    </p>
                                    <p className="text-secondary">
                                        The word Photography literally means 'drawing with light', which derives from the Greek photo, meaning light and graph, meaning to draw. Photography is the process of recording an image on light-sensitive film or, in the case of digital photography, via a digital electronic or magnetic memory.
                                    </p>

                                    <Card className="card-light-secondary shadow-none my-3">
                                        <CardBody>
                                            <i className="ti ti-quote icon-bg"></i>
                                            <p className="mb-2 text-dark font-weight-bold">
                                                “I never stay in one country more than three months. Why? Because I was interested in seeing, and if I stay longer I become blind.”
                                            </p>
                                            <h6 className="text-secondary text-end"><cite>- Josef Koudelka.</cite></h6>
                                        </CardBody>
                                    </Card>

                                    <p className="text-secondary mb-4">
                                        In 1826, Phosphoric Niece first managed to fix an image that was captured with a camera, but at least eight hours or even several days of exposure in the camera were required and the earliest results were very crude.
                                    </p>

                                    <Row className="mb-3">
                                        <Col md="6">
                                            <h5 className="mb-3 text-dark font-weight-bold">List of photographers</h5>
                                            <ul className="blog-list">
                                                <li><span className="text-dark font-weight-medium">Charlotte Abram (born 1993)</span> - photographer and filmmaker</li>
                                                <li><span className="text-dark font-weight-medium">Jennifer Des (born 1975)</span> - photographer</li>
                                                <li><span className="text-dark font-weight-medium">Nathalie Gasses (born 1964)</span> - writer, photographer</li>
                                                <li><span className="text-dark font-weight-medium">Germaine Van Paras (1893 - 1983)</span> - film director, photographer, educator</li>
                                                <li><span className="text-dark font-weight-medium">Katrin Vermeer (born 1979)</span> - photographer, filmmaker</li>
                                                <li><span className="text-dark font-weight-medium">Stephanie Windings-rate (1939 - 2019)</span> - artistic portrait and animal photographer</li>
                                                <li><span className="text-dark font-weight-medium">Claudia Andujar (born 1931)</span> - Swiss-born Brazilian photographer and photojournalist</li>
                                                <li><span className="text-dark font-weight-medium">Brigida Baltar (born 1959)</span> - visual artist and photographer</li>
                                                <li><span className="text-dark font-weight-medium">Alice Della (born 1987)</span> - model, photographer</li>
                                            </ul>
                                        </Col>

                                        <Col md="6">
                                            <a href="/assets/images/blog-app/03.jpg" className="glightbox" data-glightbox="type: image; zoomable: true;">
                                                <img src="/assets/images/blog-app/03.jpg" className="w-100 rounded" alt="image" />
                                            </a>
                                        </Col>
                                    </Row>

                                    <p className="text-secondary">
                                        The commercial introduction of computer-based electronic digital cameras in the 1990s soon revolutionized photography. During the first decade of the 21st century, traditional film-based photochemical methods were increasingly marginalized as the practical advantages of the new technology became widely appreciated.
                                    </p>
                                </div>

                                <div className="app-divider-v mb-2"></div>

                                <div className="d-flex align-items-center flex-wrap">
                                    <div className="h-50 w-50 d-flex-center b-r-10 overflow-hidden">
                                        <img src="/assets/images/avtar/09.png" alt="" className="bg-danger img-fluid" />
                                    </div>
                                    <div className="flex-grow-1 ps-2 me-2">
                                        <h6 className="mb-0 font-weight-medium text-dark">Bette Hagenes</h6>
                                        <div className="text-muted font-size-12">26 Nov,2022</div>
                                    </div>
                                    <div>
                                        <Button color="link" className="btn-sm icon-btn b-r-5">
                                            <i className="ti ti-thumb-up font-size-20"></i>
                                        </Button>
                                        <Button color="link" className="btn-sm icon-btn b-r-5">
                                            <i className="ti ti-brand-hipchat font-size-20"></i>
                                        </Button>
                                        <Button color="link" className="btn-sm icon-btn b-r-5">
                                            <i className="ti ti-share font-size-20"></i>
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </div>
                        <Card>
                            <CardHeader>
                                <h5>Comments</h5>
                            </CardHeader>
                            <CardBody>
                                {/* Comment 1 */}
                                <div className="blogcomment-box mb-3">
                                    <div className="d-flex justify-content-between">
                                        <div className="h-40 w-40 d-flex-center b-r-10 overflow-hidden comment-img">
                                            <img src="/assets/images/avtar/4.png" alt="avtar" className="bg-warning img-fluid" />
                                        </div>
                                        <div className="commentdiv">
                                            <h6 className="mb-0 text-dark f-w-600">
                                                Bette Hagenes <span className="text-muted f-s-12">1 min</span>
                                            </h6>
                                            <p className="text-muted mb-0">
                                                “Photography is the only language that can be understood anywhere in the world.”
                                                <span className="fs-6 d-inline-block text-secondary">
                  <cite>- Bruno Barbey</cite>
                </span>
                                            </p>
                                            <Badge color="light-secondary">lenora@gmail.com</Badge>
                                            <Badge color="dark">#beautiful</Badge>
                                        </div>
                                        <div>
                                            <Dropdown>
                                                <DropdownToggle className="icon-btn p-2" caret>
                                                    <i className="ti ti-dots-vertical"></i>
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem><i className="ti ti-share"></i> Share</DropdownItem>
                                                    <DropdownItem><i className="ti ti-edit"></i> Edit</DropdownItem>
                                                    <DropdownItem><i className="ti ti-trash"></i> Delete</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>

                                {/* Comment 2 */}
                                <div className="blogcomment-box mb-3">
                                    <div className="d-flex justify-content-between">
                                        <div className="h-40 w-40 d-flex-center b-r-10 overflow-hidden comment-img">
                                            <img src="/assets/images/avtar/4.png" alt="avtar" className="bg-warning img-fluid" />
                                        </div>
                                        <div className="commentdiv">
                                            <h6 className="mb-0 text-dark f-w-600">
                                                Bette Hagenes <span className="text-muted f-s-12">1 min</span>
                                            </h6>
                                            <p className="text-muted mb-0">
                                                You're such a talented person with the camera. I appreciate your work, it's always good to work with a photographer who knows how to get the job done.
                                            </p>
                                        </div>
                                        <div>
                                            <Dropdown>
                                                <DropdownToggle className="icon-btn p-2" caret>
                                                    <i className="ti ti-dots-vertical"></i>
                                                </DropdownToggle>
                                                <DropdownMenu>
                                                    <DropdownItem><i className="ti ti-share"></i> Share</DropdownItem>
                                                    <DropdownItem><i className="ti ti-edit"></i> Edit</DropdownItem>
                                                    <DropdownItem><i className="ti ti-trash"></i> Delete</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>

                                {/* Leave A Comment */}
                                <h5 className="mb-3">Leave A Comment</h5>
                                <Form className="app-form" id="id1">
                                    <Row>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Input type="textarea" rows="3" placeholder="Enter Your Comment" />
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Input type="text" placeholder="Enter Your Name" />
                                            </FormGroup>
                                        </Col>
                                        <Col md={6}>
                                            <FormGroup>
                                                <Input type="email" placeholder="Enter Your Email" />
                                            </FormGroup>
                                        </Col>
                                        <Col>
                                            <div className="text-end">
                                                <Button color="primary">
                                                    <i className="ti ti-send"></i> Comment
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Form>
                            </CardBody>
                        </Card>
                        <h5 className="mb-3">Related Posts</h5>
                        <Row>
                            {/* First Blog Card */}
                            <Col md="6" xxl="4">
                                <Card className="blog-card overflow-hidden">
                                    <a href="/assets/images/blog-app/01.jpg" className="glightbox img-hover-zoom" data-glightbox="type: image; zoomable: true;">
                                        <CardImg top src="/assets/images/blog-app/01.jpg" alt="..." />
                                    </a>
                                    <div className="tag-container">
                                        <Badge>Lifestyle</Badge>
                                    </div>
                                    <CardBody>
                                        <p className="text-body-secondary"><i className="ti ti-calendar-due"></i> 25.03.2022</p>
                                        <Link to="/apps/blog-page/blog-details" className="bloglink">
                                            <h5 className="title-text mb-2">Photographs</h5>
                                        </Link>
                                        <p className="card-text text-secondary">
                                            “Photography is a way of feeling, of touching, of loving. What you have caught on film…”
                                        </p>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Second Blog Card */}
                            <Col md="6" xxl="4">
                                <Card className="blog-card overflow-hidden">
                                    <div className="img-hover-zoom">
                                        <a href="/assets/images/blog-app/05.jpg" className="glightbox img-hover-zoom" data-glightbox="type: image; zoomable: true;">
                                            <CardImg top src="/assets/images/blog-app/05.jpg" alt="..." />
                                        </a>
                                    </div>
                                    <div className="tag-container">
                                        <Badge className="text-light-secondary">Travel</Badge>
                                    </div>
                                    <CardBody>
                                        <p className="text-body-secondary"><i className="ti ti-calendar-due"></i> 08.04.2022</p>
                                        <Link to="/apps/blog-page/blog-details" className="bloglink">
                                            <h5 className="title-text mb-2">Living in the Moment</h5>
                                        </Link>
                                        <p className="card-text text-secondary">
                                            “I believe the happiness we feel in relation to animals is immensely...
                                        </p>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Third Blog Card */}
                            <Col md="6" xxl="4">
                                <Card className="blog-card overflow-hidden">
                                    <div className="img-hover-zoom">
                                        <a href="/assets/images/blog-app/04.jpg" className="glightbox img-hover-zoom" data-glightbox="type: image; zoomable: true;">
                                            <CardImg top src="/assets/images/blog-app/04.jpg" alt="..." />
                                        </a>
                                    </div>
                                    <div className="tag-container">
                                        <Badge className="text-light-secondary">Travel</Badge>
                                    </div>
                                    <CardBody>
                                        <p className="text-body-secondary"><i className="ti ti-calendar-due"></i> 25.03.2022</p>
                                        <Link to="/apps/blog-page/blog-details" className="bloglink">
                                            <h5 className="title-text mb-2">Travel</h5>
                                        </Link>
                                        <p className="card-text text-secondary">
                                            Travel is the movement of people between distant geographical locations.To travel ...
                                        </p>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    <div className="col-lg-4 col-xxl-3">
                        <div className="row">

                            <div className="col-12">
                                <Card>
                                    <CardHeader>
                                        <h5>About Me</h5>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="text-secondary mb-3">
                                            <p className="mb-3">Hi! I am Aaliyah.</p>
                                            <p>
                                                Over the last fifteen years of my career, I earned a sense of creativity. I want to show the beauty
                                                of life in a chaotic world.
                                            </p>
                                            <p>
                                                In my first year as a photographer, I thought the photos I took needed more spark. So I enrolled in a
                                                graphic design class. I combined my photographs with visual arts and finally saw what I was looking for.
                                                The spark!
                                            </p>
                                        </div>

                                        <div className="">
                                            <Button color="facebook" className="icon-btn b-r-5">
                                                <i className="ti ti-brand-facebook text-white"></i>
                                            </Button>{' '}
                                            <Button color="success" className="icon-btn b-r-5">
                                                <i className="ti ti-brand-whatsapp text-white"></i>
                                            </Button>{' '}
                                            <Button color="info" className="icon-btn b-r-5">
                                                <i className="ti ti-brand-twitter text-white"></i>
                                            </Button>{' '}
                                            <Button color="dark" className="icon-btn b-r-5">
                                                <i className="ti ti-brand-github text-white"></i>
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                            <div className="col-md-6 col-lg-12">
                                <Card className="equal-card">
                                    <CardHeader>
                                        <h5>Categories</h5>
                                    </CardHeader>
                                    <CardBody>
                                        <ListGroup className="categories-list">
                                            <ListGroupItem className="d-flex justify-content-between align-items-start">
                                                <div className="me-auto categories-content">
                                                    <p className="text-primary f-w-600">
                                                        <i className="ti ti-chevron-right"></i> Fashion
                                                    </p>
                                                </div>
                                                <span>[7]</span>
                                            </ListGroupItem>
                                            <ListGroupItem className="d-flex justify-content-between align-items-start">
                                                <div className="me-auto categories-content">
                                                    <p className="text-secondary f-w-600">
                                                        <i className="ti ti-chevron-right"></i> Lifestyle
                                                    </p>
                                                </div>
                                                <span>[10]</span>
                                            </ListGroupItem>
                                            <ListGroupItem className="d-flex justify-content-between align-items-start">
                                                <div className="me-auto categories-content">
                                                    <p className="text-success f-w-600">
                                                        <i className="ti ti-chevron-right"></i> Food
                                                    </p>
                                                </div>
                                                <span>[15]</span>
                                            </ListGroupItem>
                                            <ListGroupItem className="d-flex justify-content-between align-items-start">
                                                <div className="me-auto categories-content">
                                                    <p className="text-warning f-w-600">
                                                        <i className="ti ti-chevron-right"></i> Travel
                                                    </p>
                                                </div>
                                                <span>[20]</span>
                                            </ListGroupItem>
                                            <ListGroupItem className="d-flex justify-content-between align-items-start">
                                                <div className="me-auto categories-content">
                                                    <p className="text-danger f-w-600">
                                                        <i className="ti ti-chevron-right"></i> Sports
                                                    </p>
                                                </div>
                                                <span>[8]</span>
                                            </ListGroupItem>
                                            <ListGroupItem className="d-flex justify-content-between align-items-start">
                                                <div className="me-auto categories-content">
                                                    <p className="f-w-600">
                                                        <i className="ti ti-chevron-right"></i> Technology
                                                    </p>
                                                </div>
                                                <span>[10]</span>
                                            </ListGroupItem>
                                            <ListGroupItem className="d-flex justify-content-between align-items-start">
                                                <div className="me-auto categories-content">
                                                    <p className="text-info f-w-600">
                                                        <i className="ti ti-chevron-right"></i> Business
                                                    </p>
                                                </div>
                                                <span>[25]</span>
                                            </ListGroupItem>
                                        </ListGroup>
                                    </CardBody>
                                </Card>
                            </div>
                            <div className="col-md-6 col-lg-12">
                                <Card>
                                    <CardHeader>
                                        <h5>Popular Blog Posts</h5>
                                    </CardHeader>
                                    <CardBody className="popular-blog-list">
                                        <div className="position-relative mb-3">
                                            <div>
                                                <div className="position-absolute">
                                                    <img src="/assets/images/avtar/5.png" alt="" className="w-40 h-40 bg-warning rounded" />
                                                </div>
                                            </div>
                                            <div className="ms-5">
                                                <p className="text-dark mb-0 f-w-500 f-s-14">There is a collage of large headlines and pictures..</p>
                                                <div className="text-secondary text-end f-s-12">2 days ago</div>
                                            </div>
                                        </div>
                                        <div className="position-relative mb-3">
                                            <div>
                                                <div className="position-absolute">
                                                    <img src="/assets/images/avtar/14.png" alt="" className="w-40 h-40 bg-danger rounded" />
                                                </div>
                                            </div>
                                            <div className="ms-5">
                                                <p className="text-dark mb-0 f-w-500 f-s-14">In addition, some additional blog content is displayed..</p>
                                                <div className="text-secondary text-end f-s-12">10 days ago</div>
                                            </div>
                                        </div>
                                        <div className="position-relative mb-3">
                                            <div>
                                                <div className="position-absolute">
                                                    <img src="/assets/images/avtar/4.png" alt="" className="w-40 h-40 bg-primary rounded" />
                                                </div>
                                            </div>
                                            <div className="ms-5">
                                                <p className="text-dark mb-0 f-w-500 f-s-14">It also showcases the best tech deals, helping people make..</p>
                                                <div className="text-secondary text-end f-s-12">1 day ago</div>
                                            </div>
                                        </div>
                                        <div className="position-relative mb-3">
                                            <div>
                                                <div className="position-absolute">
                                                    <img src="/assets/images/avtar/07.png" alt="" className="w-40 h-40 bg-success rounded" />
                                                </div>
                                            </div>
                                            <div className="ms-5">
                                                <p className="text-dark mb-0 f-w-500 f-s-14">Further down the page, more article headlines are sorted by the most..</p>
                                                <div className="text-secondary text-end f-s-12">5 mins ago</div>
                                            </div>
                                        </div>
                                        <div className="position-relative mb-3">
                                            <div>
                                                <div className="position-absolute">
                                                    <img src="/assets/images/avtar/09.png" alt="" className="w-40 h-40 bg-dark rounded" />
                                                </div>
                                            </div>
                                            <div className="ms-5">
                                                <p className="text-dark mb-0 f-w-500 f-s-14">The blog also does a great job of emphasizing text readability..</p>
                                                <div className="text-secondary text-end f-s-12">5 mins ago</div>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Link to="/apps/blog-page/blog">
                                                <Button target="_blank" color="primary" size="md" block>
                                                    <i className="ti ti-plus"></i> View All
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                            <div className="col-md-6 col-lg-12">
                                <Card>
                                    <CardHeader>
                                        <h5>Popular Blog Tags</h5>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="blog-tags d-flex gap-2 f-s-16 flex-wrap">
                                            <span className="badge text-light-dark">#Lifestyle</span>
                                            <span className="badge text-light-secondary">#Blogging</span>
                                            <span className="badge text-light-dark">#beautiful</span>
                                            <span className="badge text-light-secondary">#DesignBlogger</span>
                                            <span className="badge text-light-dark">#likeforlikes</span>
                                            <span className="badge text-light-dark">#vlog</span>
                                            <span className="badge text-light-secondary">#instafashion</span>
                                            <span className="badge text-light-dark">#lifestyleblogger</span>
                                            <span className="badge text-light-secondary">#fashionista</span>
                                            <span className="badge text-light-dark">#blogueira</span>
                                            <span className="badge text-light-dark">#bloggersofinstagram</span>
                                            <span className="badge text-light-dark">#news</span>
                                            <span className="badge text-light-secondary">#foodblogger</span>
                                            <span className="badge text-light-dark">#vlog</span>
                                            <span className="badge text-light-secondary">#instafashion</span>
                                            <span className="badge text-light-dark">#beauty</span>
                                            <span className="badge text-light-secondary">#bloggerstyle</span>
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                            <div className="col-md-6 col-lg-12">
                                <Card>
                                    <CardHeader>
                                        <h5>Subscribe</h5>
                                    </CardHeader>
                                    <CardBody>
                                        <Form className="app-form" onSubmit={handleSubmit}>
                                            <FormGroup className="mb-3">
                                                <Label for="email" className="f-w-500">Email</Label>
                                                <div className="input-group">
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        className="form-control-sm"
                                                        placeholder="@gmail.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                    <Button type="submit" color="primary">
                                                        <i className="ti ti-mail-fast fs-5"></i>
                                                    </Button>
                                                </div>
                                            </FormGroup>
                                            <FormGroup className="mb-3">
                                                <p className="text-success">Subscribe to our newsletter and stay Updated</p>
                                            </FormGroup>
                                        </Form>
                                    </CardBody>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BlogDetails;