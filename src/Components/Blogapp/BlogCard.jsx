
import {Card, CardBody, Col, Row, Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormText} from "reactstrap";
import React, {useEffect, useState} from "react";
import GLightbox from 'glightbox';
import 'glightbox/dist/css/glightbox.min.css';
import {Link} from 'react-router-dom'


const BlogCard = () => {
    const blogData = [
        {
            id: 1,
            colclass:"col-md-6 col-lg-4 col-xxl-3",
            image: "/assets/images/blog-app/02.jpg",
            tag: "Technology",
            date: "02.01.2021",
            title: "Web Development",
            description:
                "Web development is the work involved in developing a website for the Internet or an intranet",
            author: {
                name: "Bette Hagenes",
                avatar: "/assets/images/avtar/1.png",
                time: "1day ago",
            },
        },
        {
            id: 2,
            colclass:"col-md-6 col-lg-4 col-xxl-3",
            image: "/assets/images/blog-app/01.jpg",
            tag: "Lifestyle",
            date: "25.03.2022",
            title: "Photographs",
            description:
                "“Photography is a way of feeling, of touching, of loving. What you have caught on film…”",
            author: {
                name: "James Parker",
                avatar: "/assets/images/avtar/2.png",
                time: "1day ago",
            },
        },
        {
            id: 3,
            colclass:"col-md-6 col-lg-4 col-xxl-3",
            image: "/assets/images/blog-app/04.jpg",
            tag: "Travel",
            date: "25.03.2022",
            title: "Travel",
            description:
                "Travel is the movement of people between distant geographical locations. To travel ...",
            author: {
                name: "Emma Bennett",
                avatar: "/assets/images/avtar/4.png",
                time: "1day ago",
            },
        },
        {
            id: 4,
            colclass:"col-md-6 col-lg-4 col-xxl-3",
            image: "/assets/images/blog-app/06.jpg",
            tag: "Sports",
            date: "25.03.2022",
            title: "Sports Blog",
            description:
                "Sports have taught me so many valuable life lessons, from teamwork.",
            author: {
                name: "William Foster",
                avatar: "/assets/images/avtar/3.png",
                time: "10days ago",
            },
        },
        {
            id: 5,
            colclass:"col-md-6 col-lg-4 col-xxl-3",
            image: "/assets/images/blog-app/05.jpg",
            tag: "Travel",
            date: "08.04.2022",
            title: "Living in the Moment",
            description:
                "“I believe the happiness we feel in relation to animals is immensely...",
            author: {
                name: "Evelyn Morgan",
                avatar: "/assets/images/avtar/5.png",
                time: "7days ago",
            },
        },
        {
            id: 6,
            colclass:"col-md-6 col-lg-4 col-xxl-3",
            image: "/assets/images/blog-app/07.jpg",
            tag: "Lifestyle",
            date: "25.03.2022",
            title: "Every sunset has a story.",
            description:
                "You may not get to enjoy the beautiful foliage marked by the color-changing leaves...",
            author: {
                name: "Isabella Davis",
                avatar: "/assets/images/avtar/11.png",
                time: "1day ago",
            },
        },
        {
            id: 7,
            colclass:"col-md-6 col-lg-4 col-xxl-3",
            image: "/assets/images/blog-app/08.jpg",
            tag: "Depot",
            date: "01.08.2022",
            title: "Webdesigner Depot",
            description:
                "“With a name like 'Webdesigner Depot,' it's no wonder that this design news site...",
            author: {
                name: "Oliver Brooks",
                avatar: "/assets/images/avtar/14.png",
                time: "9days ago",
            },
        },
        {
            id: 8,
            colclass:"col-md-6 col-lg-4 col-xxl-3",
            image: "/assets/images/blog-app/09.jpg",
            tag: "Life",
            date: "11.02.2019",
            title: "Life As We Explore.",
            description:
                "Belgium has some of the most beautiful cities in this world and renowned with...",
            author: {
                name: "Liam Walker",
                avatar: "/assets/images/avtar/12.png",
                time: "1day ago",
            },
        },
    ];

    const blogData1 = [
        {
            id: 1,
            colclass: "col-md-12 col-lg-6",
            image: "/assets/images/blog-app/10.jpg",
            tag: "Lifestyle",
            date: "25.03.2024",
            title: "Collect Moments",
            description:
                "This is what holidays, travels, vacations are about. It is not really rest or even leisure we chase. We tend to put values on what we buy such as a new car, which we may value at $30,000. However when it comes to experiences.",
            author: {
                name: "Sophia Mitchell",
                avatar: "/assets/images/avtar/11.png",
                time: "1day ago",
            },
        },
        {
            id: 2,
            colclass: "col-md-12 col-lg-6",
            image: "/assets/images/blog-app/11.jpg",
            tag: "Lifestyle",
            date: "25.03.2024",
            title: "Just Me, Myself & Coffee",
            description:
                "Coffee is the fuel that keeps our designers and engineers, movers and shakers going all day long. Coffee is the best thing to douse the sunrise with. Coffee is always a good idea.",
            author: {
                name: "Henry Powell",
                avatar: "/assets/images/avtar/12.png",
                time: "1day ago",
            },
        },
    ];

    const [modalOpen, setModalOpen] = useState(false); // State for modal visibility
    const [selectedBlog, setSelectedBlog] = useState(null); // State to hold selected blog for editing

    const toggleModal = () => {
        setModalOpen(!modalOpen); // Toggle modal visibility
    };

    const handleEditClick = (blog) => {
        setSelectedBlog(blog); // Set the selected blog for editing
        toggleModal(); // Open the modal
    };

    useEffect(() => {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        const handleDeleteClick = (e) => {
            const blogCard = e.target.closest('.col-md-6');
            if (blogCard) {
                blogCard.remove();
            }
        };

        deleteButtons.forEach((button) => {
            button.addEventListener('click', handleDeleteClick);
        });

        return () => {
            deleteButtons.forEach((button) => {
                button.removeEventListener('click', handleDeleteClick);
            });
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lightbox = GLightbox({
                touchNavigation: true,
                loop: true,
                width: "90vw",
                height: "90vh",
            });

            return () => {
                lightbox.destroy();
            };
        }
    }, []);


    return (
        <>
            <Row>
                {blogData.map((blog) => (
                    <div
                        className={blog.colclass}
                        key={blog.id}
                    >
                        <Card className="blog-card overflow-hidden">
                            <a
                                href={blog.image}
                                className="glightbox img-hover-zoom"
                                data-glightbox="type: image; zoomable: true;"
                            >
                                <img
                                    src={blog.image}
                                    className="card-img-top"
                                    alt={blog.title}
                                />
                            </a>
                            <div className="tag-container">
              <span className="badge text-light-secondary">
                {blog.tag}
              </span>
                            </div>
                            <CardBody>
                                <p className="text-body-secondary">
                                    <i className="ti ti-calendar-due"></i> {blog.date}
                                </p>
                                <Link to="/apps/blog-page/blog-details" className="bloglink">
                                    <h5 className="title-text mb-2">{blog.title}</h5>
                                </Link>
                                <p className="card-text text-secondary">
                                    {blog.description}
                                </p>
                                <div className="app-divider-v dashed py-3"></div>
                                <div
                                    className="d-flex justify-content-between align-items-center gap-2 position-relative">
                                    <div
                                        className="h-40 w-40 d-flex-center b-r-10 overflow-hidden bg-primary position-absolute">
                                        <img
                                            src={blog.author.avatar}
                                            alt="avatar"
                                            className="img-fluid"
                                        />
                                    </div>
                                    <div className="ps-5">
                                        <h6 className="text-dark f-w-500 mb-0">
                                            {blog.author.name}
                                        </h6>
                                        <p className="text-secondary f-s-12 mb-0">
                                            {blog.author.time}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="btn-group dropdown-icon-none">
                                            <button
                                                className="btn border-0 icon-btn b-r-4 dropdown-toggle"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                data-bs-auto-close="true"
                                                aria-expanded="false"
                                            >
                                                <i className="ti ti-dots-vertical f-s-18 text-dark"></i>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#exampleModal"
                                                >
                                                    <a className="dropdown-item text-success" href="#"
                                                       onClick={() => handleEditClick(blog)}>
                                                        <i className="ti ti-archive"></i> Edit{" "}
                                                    </a>
                                                </li>
                                                <li className="delete-btn">
                                                    <a
                                                        className="dropdown-item text-danger"
                                                        href="#"
                                                    >
                                                        <i className="ti ti-trash"></i> Delete{" "}
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                ))}
            </Row>

            <Row>
                {blogData1.map((blog) => (
                    <div className={blog.colclass} key={blog.id}>
                        <div className="card vertical-blog mb-3 hover-effect overflow-hidden">
                            <div className="row g-0">
                                <Col sm={4}>
                                    <a
                                        href={blog.image}
                                        className="glightbox img-hover-zoom"
                                        data-glightbox="type: image; zoomable: true;"
                                    >
                                        <img
                                            src={blog.image}
                                            className="card-img-top"
                                            alt={blog.title}
                                        />
                                    </a>
                                </Col>
                                <Col sm={8}>
                                    <CardBody>
                                        <p className="text-body-secondary">
                                            <i className="ti ti-calendar-due"></i> {blog.date}
                                        </p>
                                        <Link to="./apps/blog-page/blog-details">
                                            <h5 className="title-text mb-3 bloglink">{blog.title}</h5>
                                        </Link>
                                        <p className="card-text text-secondary">
                                            {blog.description.split('. ')[0]}.
                                        </p>
                                        <p className="card-text text-secondary">
                                            {blog.description.split('. ')[1]}.
                                        </p>
                                        <div className="app-divider-v mb-2"></div>
                                        <div
                                            className="d-flex justify-content-between align-items-center gap-2 position-relative">
                                            <div
                                                className="h-40 w-40 d-flex-center b-r-10 overflow-hidden bg-dark position-absolute">
                                                <img
                                                    src={blog.author.avatar}
                                                    alt="avatar"
                                                    className="img-fluid"
                                                />
                                            </div>
                                            <div className="ps-5">
                                                <h6 className="text-dark f-w-500 mb-0">{blog.author.name}</h6>
                                                <p className="text-secondary f-s-12 mb-0">{blog.author.time}</p>
                                            </div>
                                            <div>
                                                <div className="btn-group dropdown-icon-none">
                                                    <button
                                                        className="btn border-0 icon-btn b-r-4 dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        data-bs-auto-close="true"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="ti ti-dots-vertical f-s-18 text-dark"></i>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#exampleModal"
                                                        >
                                                            <a className="dropdown-item text-success" href="#"
                                                               onClick={() => handleEditClick(blog)}>
                                                                <i className="ti ti-archive"></i> Edit
                                                            </a>
                                                        </li>

                                                        <li className="delete-btn">
                                                            <a
                                                                className="dropdown-item text-danger"
                                                                href="#"
                                                            >
                                                                <i className="ti ti-trash"></i> Delete
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Col>
                            </div>
                        </div>
                    </div>
                ))}

            </Row>

            {selectedBlog && (
                <Modal isOpen={modalOpen} toggle={toggleModal} backdrop="static" keyboard={false}>
                    <ModalHeader toggle={toggleModal}>Edit Blog</ModalHeader>
                    <ModalBody>

                        <Form className="app-form">
                            <FormGroup className="mb-3">
                                <Label for="blogFile">File</Label>
                                <Input
                                    type="file"
                                    id="blogFile"
                                    onChange={(e) => setSelectedBlog({...selectedBlog, tag: e.target.value})}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label for="blogTitle">Blog Title</Label>
                                <Input
                                    type="text"
                                    className="form-control"
                                    id="blogTitle"
                                    placeholder="Blog Title"
                                    value={selectedBlog.title}
                                    onChange={(e) => setSelectedBlog({...selectedBlog, title: e.target.value})}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label for="blogDescription">Blog Description</Label>
                                <Input
                                    type="textarea"
                                    className="form-control"
                                    id="blogDescription"
                                    placeholder="Type a comment here"
                                    value={selectedBlog.description}
                                    onChange={(e) => setSelectedBlog({...selectedBlog, description: e.target.value})}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label for="blogDate">Blog Date</Label>
                                <Input
                                    type="date"
                                    className="form-control"
                                    id="blogDate"
                                    value={selectedBlog.date}
                                    onChange={(e) => setSelectedBlog({...selectedBlog, tag: e.target.value})}
                                />
                            </FormGroup>
                        </Form>

                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleModal}>Close</Button>
                        <Button color="primary" onClick={() => {
                            toggleModal();
                        }}>Save Changes</Button>
                    </ModalFooter>
                </Modal>
            )}
        </>
    );
};

export default BlogCard;