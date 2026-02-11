import React from "react";
import ProductImage from "@/Components/Productdetails/ProductImage";
import ProductInfo from "@/Components/Productdetails/ProductInfo";
import ProductReturns from "@/Components/Productdetails/ProductReturns";
import {Col, Container, Row} from "reactstrap";

const ProductDetails = () => {
    return (
        <Container fluid>
            <Row className="m-1">
              <Col xs={12}>
                <h4 className="main-title">Product Details</h4>
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
                    <a href="#" className="f-s-14 f-w-500">Product Details</a>
                  </li>
                </ul>
              </Col>
            </Row>
            <Row className=" product-details-container">
                <ProductImage />
                <ProductInfo />
                <ProductReturns />
            </Row>
        </Container>
    );
};

export default ProductDetails;
