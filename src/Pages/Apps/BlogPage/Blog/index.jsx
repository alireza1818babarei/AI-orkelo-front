
import React from 'react'
import BlogCard from "@/Components/Blogapp/BlogCard";
import {Col, Container, Row} from "reactstrap";

const Blog = () => {


    return (
        <Container fluid>
            <Row className="m-1">
                <Col xs={12}>
                    <h4 className="main-title">Blog</h4>
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
                            <a href="#" className="f-s-14 f-w-500">Blog</a>
                        </li>
                    </ul>
                </Col>
            </Row>
            <BlogCard/>
        </Container>
    )
}

export default Blog