
import React, {useEffect, useState} from 'react';
import GLightbox from "glightbox";
import 'glightbox/dist/css/glightbox.min.css';
import ProfileAppTabs from "@/Components/Profileapp/profileAppTabs";
import FriendsCard from "@/Components/Profileapp/FriendsCard";
import FeaturedPost from "@/Components/Profileapp/FeaturedPost";
import FeaturedStories from "@/Components/Profileapp/FeaturedStories";
import ProfileCard from "@/Components/Profileapp/ProfileCard";
import AboutMe from "@/Components/Profileapp/AboutMe";
import {Col, Container, Row} from "reactstrap";

const Profile = () => {

    useEffect(() => {
        GLightbox({
            selector: ".glightbox",
        });
    }, []);

    const [data,setData] = useState("tab1");
    return (
        <Container fluid>
            <Row className=" m-1">
                <Col xs={12}>
                    <h4 className="main-title">Profile</h4>
                    <ul className="app-line-breadcrumbs mb-3">
                        <li className="">
                            <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                            </a>
                        </li>
                        <li>
                            <a href="#" className="f-s-14 f-w-500">Profile</a>
                        </li>
                        <li className="active">
                            <a href="#" className="f-s-14 f-w-500">Profile</a>
                        </li>
                    </ul>
                </Col>
            </Row>
            <Row>
                <Col lg={3}>
                    <ProfileAppTabs data={data} setData={setData}/>
                    <FriendsCard />
                    <FeaturedPost />
                </Col>
                <FeaturedStories data={data}/>
                <div className="col-lg-4 col-xxl-3 order--1-lg col-box-4">
                    <ProfileCard />
                    <AboutMe />
                </div>
            </Row>
        </Container>
    );
};

export default Profile;