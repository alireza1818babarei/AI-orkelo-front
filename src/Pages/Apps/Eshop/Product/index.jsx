import React, {useState} from 'react';
import {Button, Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import {products} from "@/Data/Eshopproduct/Eshopproduct";
import {Link} from 'react-router-dom'

const Product = () => {

    // State to track the layout view
    const [layout, setLayout] = useState("col-xxl-3"); // Default to 4-column view
    const [isListView, setIsListView] = useState(false); // Toggle between grid and list view

    // Button click handlers
    const handleGridLayout = () => {
        setIsListView(true);
        setLayout("col-sm-6"); // List layout with 2 columns
    };

    const handleViewChange = (newLayout) => {
        setIsListView(false);
        setLayout(newLayout); // Update grid layout
    };

    return (
        <div>
            <Container fluid>
                <Row className="m-1">
                    <div className="col-12 ">
                        <h4 className="main-title">Product</h4>
                        <ul className="app-line-breadcrumbs mb-3">
                            <li className="">
                                <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="f-s-14 f-w-500">E-shop</a>
                            </li>
                            <li className="active">
                                <a href="#" className="f-s-14 f-w-500">Product</a>
                            </li>
                        </ul>
                    </div>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Card>
                            <CardBody>
                                <div className="product-header d-flex justify-content-between gap-3 align-items-center">
                                    <div className="d-flex align-items-center">
                                        <a className="me-3 toggle-btn d-inline-block d-lg-none" role="button"><i
                                            className="ti ti-align-justified f-s-24"></i></a>
                                        <form className="app-form app-icon-form d-inline-block " action="#">
                                            <div className="position-relative">
                                                <input type="search" className="form-control" placeholder="Search..."
                                                       aria-label="Search"/>
                                                    <i className="ti ti-search text-dark"></i>
                                            </div>
                                        </form>
                                    </div>
                                    <div>
                                        <Button color="secondary product-view4 d-inline-block" onClick={() => handleViewChange("col-xxl-3")}>
                                            IV
                                        </Button>{" "}
                                        <Button color="secondary product-view3" onClick={() => handleViewChange("col-md-4")}>
                                            III
                                        </Button>{" "}
                                        <Button color="secondary  product-view2  d-none" onClick={() => handleViewChange("col-sm-6")}>
                                            II
                                        </Button>{" "}
                                        <Button color="secondary product-view" onClick={() => handleViewChange("col-12")}>
                                            I
                                        </Button>{" "}
                                        <Button color="primary grid-layout-view" onClick={handleGridLayout}>
                                            <i className="ti ti-list"></i>
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col xxl={3} lg={4} className="product-box productbox">
                        <Card>
                            <CardHeader>
                                <h5>Filters</h5>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="accordion accordion-flush app-accordion accordion-light-primary"
                                     id="accordion-flush-sort-by">

                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-heading-two">
                                            <button className="accordion-button bg-none p-1" type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapse_two" aria-expanded="true"
                                                    aria-controls="collapse_two">
                                                <span className="m-0 mt-1">Sort By</span>
                                            </button>
                                        </h2>
                                        <div id="collapse_two" className="accordion-collapse collapse show"
                                             aria-labelledby="flush-heading-two"
                                             data-bs-parent="#accordion-flush-sort-by">
                                            <div>
                                                <label className="check-box m-3">
                                                    <input type="radio" name="radio-group1"/>
                                                        <span className="radiomark outline-secondary"></span>
                                                        <span className="text-secondary">Featured</span>
                                                </label>
                                                <label className="check-box m-3">
                                                    <input type="radio" name="radio-group1"/>
                                                        <span className="radiomark outline-secondary"></span>
                                                        <span className="text-secondary">Price: High to Low</span>
                                                </label>
                                                <label className="check-box m-3">
                                                    <input type="radio" name="radio-group1"/>
                                                        <span className="radiomark outline-secondary"></span>
                                                        <span className="text-secondary">Price: Low to High</span>
                                                </label>
                                                <label className="check-box m-3">
                                                    <input type="radio" name="radio-group1"/>
                                                        <span className="radiomark outline-secondary"></span>
                                                        <span className="text-secondary">Newest</span>
                                                </label>
                                                <label className="check-box m-3">
                                                    <input type="radio" name="radio-group1"/>
                                                        <span className="radiomark outline-secondary"></span>
                                                        <span className="text-secondary">Ratings</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-heading-three">
                                            <button className="accordion-button bg-none p-1" type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapse_three" aria-expanded="false"
                                                    aria-controls="collapse_three">
                                                <span className="m-0 mt-1">Categories</span>
                                            </button>
                                        </h2>
                                        <div id="collapse_three" className="accordion-collapse collapse show"
                                             aria-labelledby="flush-heading-three"
                                             data-bs-parent="#accordion-flush-sort-by">
                                            <div className="accordion-body p-2">
                                                <div className="p-2 d-flex align-items-center gap-2">
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary ms-2"></span>
                                                    </label>
                                                    <a href="#" className="f-s-15 f-w-500 text-secondary"><i
                                                        className="ph-duotone  ph-dress text-dark f-s-18 me-2"></i>Fashion
                                                    </a>
                                                </div>
                                                <div className="p-2 d-flex align-items-center gap-2">
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary ms-2"></span>
                                                    </label>
                                                    <a href="#" className="f-s-15 f-w-500 text-secondary"><i
                                                        className="ph-duotone  ph-desktop-tower text-dark f-s-18 me-2"></i>Home
                                                        Appliances</a>
                                                </div>
                                                <div className="p-2 d-flex align-items-center gap-2">
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary ms-2"></span>
                                                    </label>
                                                    <a href="#" className="f-s-15 f-w-500 text-secondary"><i
                                                        className="ph-duotone  ph-first-aid-kit text-dark f-s-18 me-2"></i>Health
                                                        & Beauty</a>
                                                </div>
                                                <div className="p-2 d-flex align-items-center gap-2">
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary ms-2"></span>
                                                    </label>
                                                    <a href="#" className="f-s-15 f-w-500 text-secondary"><i
                                                        className="ph-duotone  ph-game-controller text-dark f-s-18 me-2"></i>Toys
                                                        & Game</a>
                                                </div>
                                                <div className="p-2 d-flex align-items-center gap-2">
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary ms-2"></span>
                                                    </label>
                                                    <a href="#" className="f-s-15 f-w-500 text-secondary"><i
                                                        className="ph-duotone  ph-basket text-dark f-s-18 me-2"></i>Groceries</a>
                                                </div>
                                                <div className="p-2 d-flex align-items-center gap-2">
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary ms-2"></span>
                                                    </label>
                                                    <a href="#" className="f-s-15 f-w-500 text-secondary"><i
                                                        className="ph-duotone  ph-circles-three-plus text-dark f-s-18 me-2"></i>See
                                                        all</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-heading-four">
                                            <button className="accordion-button bg-none p-1" type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapse_four" aria-expanded="false"
                                                    aria-controls="collapse_four">
                                                <span className="m-0 mt-1">Color</span>
                                            </button>
                                        </h2>
                                        <div id="collapse_four" className="accordion-collapse collapse show"
                                             aria-labelledby="flush-heading-four"
                                             data-bs-parent="#accordion-flush-sort-by">
                                            <div className="accordion-body p-2">
                                                <div className="d-flex flex-wrap check-container mt-3">
                                                    <label className="check-box">
                                                        <input type="radio" name="radio-groupbox" defaultChecked/>
                                                            <span className="radiomark check-primary ms-2"></span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="radio" name="radio-groupbox"/>
                                                            <span className="radiomark check-secondary ms-2"></span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="radio" name="radio-groupbox"/>
                                                            <span className="radiomark check-success ms-2"></span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="radio" name="radio-groupbox"/>
                                                            <span className="radiomark check-danger ms-2"></span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="radio" name="radio-groupbox"/>
                                                            <span className="radiomark check-warning ms-2"></span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="radio" name="radio-groupbox"/>
                                                            <span className="radiomark check-info ms-2"></span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="radio" name="radio-groupbox"/>
                                                            <span className="radiomark check-light ms-2"></span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="radio" name="radio-groupbox"/>
                                                            <span className="radiomark check-dark ms-2"></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-heading-five">
                                            <button className="accordion-button bg-none p-1" type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapse_five" aria-expanded="false"
                                                    aria-controls="collapse_five">
                                                <span className="m-0 mt-1">Gender</span>
                                            </button>
                                        </h2>
                                        <div id="collapse_five" className="accordion-collapse collapse show"
                                             aria-labelledby="flush-heading-five"
                                             data-bs-parent="#accordion-flush-sort-by">
                                            <div className="accordion-body p-2">
                                                <div className="d-flex flex-column gap-2 mt-2 ms-2">
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary"></span>
                                                            <span className="text-secondary me-2">Men</span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary"></span>
                                                            <span className="text-secondary me-2">Women</span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary"></span>
                                                            <span className="text-secondary me-2">Boys</span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary"></span>
                                                            <span className="text-secondary me-2">Girls</span>
                                                    </label>
                                                    <label className="check-box">
                                                        <input type="checkbox"/>
                                                            <span className="checkmark outline-secondary"></span>
                                                            <span className="text-secondary me-2">Boys & Girls</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-heading-six">
                                            <button className="accordion-button bg-none p-1" type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapse_six" aria-expanded="false"
                                                    aria-controls="collapse_six">
                                                <span className="m-0 mt-1">Customer Ratings</span>
                                            </button>
                                        </h2>
                                        <div id="collapse_six" className="accordion-collapse collapse show"
                                             aria-labelledby="flush-heading-six"
                                             data-bs-parent="#accordion-flush-sort-by">
                                            <div className="accordion-body p-3">
                                                <div className="rating text-start">
                                                    <span className="fa fa-star f-s-18 text-warning"></span>
                                                    <span className="fa fa-star f-s-18 text-warning"></span>
                                                    <span className="fa fa-star f-s-18 text-warning"></span>
                                                    <span className="fa fa-star f-s-18 text-secondary"></span>
                                                    <span className="fa fa-star f-s-18 text-secondary"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="flush-heading-seven">
                                            <button className="accordion-button bg-none p-1" type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target="#collapse_seven" aria-expanded="false"
                                                    aria-controls="collapse_seven">
                                                <span className="m-0 mt-1">Customer Ratings</span>
                                            </button>
                                        </h2>
                                        <div id="collapse_seven" className="accordion-collapse collapse show"
                                             aria-labelledby="flush-heading-seven"
                                             data-bs-parent="#accordion-flush-sort-by">
                                            <div className="accordion-body p-2">
                                                <div className="d-flex flex-column gap-2 mt-2 ms-2">
                                                    <div className="mb-3">
                                                        <div className="slider-round" id="html-input"></div>
                                                    </div>
                                                    <div className=" d-flex gap-2 mb-3">
                                                        <select id="select-input" className="form-select"></select>
                                                        <input type="number" id="number-input" className="form-control"/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>

                                    <div className="text-end m-3">
                                        <a href="#" role="button" className="btn btn-sm btn-primary">Clear all</a>{' '}
                                        <a href="#" role="button" className="btn btn-sm btn-secondary">Apply</a>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xxl={9} lg={8}>
                        <div className="product-wrapper-grid">
                            <Row className={isListView ? "list-view" : ""}>
                                {products.map((product) => (
                                    <Col key={product.id} className={layout}>
                                        <Card className="overflow-hidden">
                                            <CardBody className="p-0">
                                                <div className="product-content-box">
                                                    <div className="product-grid">
                                                        <div className="product-image">
                                                            <a href="#" className="image">
                                                                <img className="pic-1" src={product.image1} alt="" />
                                                                <img
                                                                    className="images_box"
                                                                    src={product.image2}
                                                                    alt=""
                                                                />
                                                            </a>
                                                            <ul className="product-links">
                                                                <li>
                                                                    <Link
                                                                        to="/apps/e-shop/wishlist"
                                                                        className="bg-danger h-30 w-30 d-flex-center b-r-20"
                                                                    >
                                                                        <i className="f-s-18 ti ti-heart text-light"></i>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        to="/ui-kits/card"
                                                                        className="bg-primary h-30 w-30 d-flex-center b-r-20"
                                                                    >
                                                                        <i className="ti ti-shopping-cart f-s-18 text-light"></i>
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        to="/apps/e-shop/product-details"
                                                                        className="bg-success h-30 w-30 d-flex-center b-r-20"
                                                                    >
                                                                        <i className="ti ti-eye f-s-18 text-light"></i>
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <Link
                                                                to="/apps/e-shop/product-details"
                                                                className="m-0 f-s-20 f-w-500"
                                                            >
                                                                {product.title}
                                                            </Link>
                                                            <p className="text-warning m-0">
                                                                {product.rating}{" "}
                                                                <span className="text-warning">
                            <i className="ti ti-star-filled"></i>
                          </span>
                                                            </p>
                                                        </div>
                                                        <p className="text-secondary">{product.description}</p>
                                                        <div className="pricing-box">
                                                            <h6>
                                                                ${product.price}{" "}
                                                                <span>
                            (<del>${product.originalPrice}</del>)
                          </span>
                                                                <span className="text-success ms-2">
                            {product.discount}
                          </span>
                                                            </h6>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Col>




                </Row>
            </Container>
        </div>
    );
};

export default Product;