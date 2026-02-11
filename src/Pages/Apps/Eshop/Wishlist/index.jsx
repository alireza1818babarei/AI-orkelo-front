import React, {useState} from 'react';
import { whishListData} from "@/Data/project details/projectteam";
import {Col, Container, Row} from "reactstrap";

const Wishlist = () => {
    const handleIconClick = (index) => {
        setHeartStatus(prevState => {
            const newStatus = [...prevState];
            newStatus[index] = !newStatus[index];
            return newStatus;
        });
    };

    const [heartStatus, setHeartStatus] = useState(new Array(whishListData.length).fill(false));
    return (
        <div>
            <Container fluid>
                <Row className="m-1">
                    <Col xs={12}>
                        <h4 className="main-title">Wishlist</h4>
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
                                <a href="#" className="f-s-14 f-w-500">Wishlist</a>
                            </li>
                        </ul>
                    </Col>
                </Row>
                <Row className="wishlist-container">
                    {whishListData.map((product, index) => (
                        <div key={index} className="col-sm-6 col-lg-4 col-xl-3">
                            <div className="card overflow-hidden">
                                <div className="card-body p-0">
                                    <div className="product-content-box">
                                        <div className="product-grid">
                                            <div className="product-image">
                                                <a href={product.productLink} target="_blank" className="image">
                                                    <img className="pic-1" src={product.image1} alt={product.name}/>
                                                    <img className="images_box" src={product.image2} alt={product.name}/>
                                                </a>
                                            </div>
                                        </div>
                                        <div className="p-3">sxd
                                            <div className="d-flex justify-content-between align-items-center">
                                                <a href={product.productLink} className="m-0 f-s-20 f-w-500">{product.name}</a>
                                                <p className="text-warning">{product.rating} <span className="text-warning"><i
                                                    className="ti ti-star-filled"></i></span></p>
                                            </div>
                                            <p className="text-secondary">{product.description}</p>
                                            <div className="pricing-box">
                                                <h6>{product.price} <span>(<del>{product.originalPrice}</del>)</span><span
                                                    className="text-success ms-2">{product.discount}</span></h6>
                                            </div>
                                        </div>

                                        <span
                                            className={`bg-danger h-45 w-45 d-flex-center b-r-50 wishlist-like-icon`}
                                            onClick={() => handleIconClick(index)} // Handle the click for each heart icon
                                            role="button"
                                            aria-label="Toggle Heart Icon"
                                        >
                                   <i className={`ti ${heartStatus[index] ? 'ti-heart-filled' : 'ti-heart'} heart-icon text-light`}></i>
                               </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                </Row>
            </Container>
        </div>
    );
};

export default Wishlist;
