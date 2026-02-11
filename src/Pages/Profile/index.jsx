import React, { useEffect, useState } from "react";
import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.min.css";
import ProfileAppTabs from "@/Components/Profileapp/profileAppTabs";
import FriendsCard from "@/Components/Profileapp/FriendsCard";
import FeaturedPost from "@/Components/Profileapp/FeaturedPost";
import FeaturedStories from "@/Components/Profileapp/FeaturedStories";
import AboutMe from "@/Components/Profileapp/AboutMe";
import { Col, Container, Row } from "reactstrap";
import ProfileCard from "../../Components/Profileapp/ProfileCard";

const Profile = () => {
  useEffect(() => {
    GLightbox({
      selector: ".glightbox",
    });
  }, []);

  const [data, setData] = useState("tab1");
  return (
    <Container fluid>
      <Row className=" m-1">
        <Col xs={12}>
          <div className="d-flex align-items-center gap-1 mb-3">
            <i className="ph-duotone  ph-user fs-3 text-primary"></i>
            <h4 className="main-title">Profile</h4>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={3}>
          <ProfileAppTabs data={data} setData={setData} />
        </Col>
        <div className="col-9">
          <ProfileCard />
          <AboutMe />
        </div>
      </Row>
    </Container>
  );
};

export default Profile;
