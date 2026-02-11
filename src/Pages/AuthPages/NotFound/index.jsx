import React from "react";
import { Container } from "reactstrap";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="error-container p-0">
      <Container>
        <div>
          <div>
            <img
              src="../assets/images/background/error-404.png"
              className="img-fluid"
              alt=""
            />
          </div>
          <div className="mb-3">
            <div className="row">
              <div className="col-lg-8 offset-lg-2 ">
                <p className="text-center text-secondary f-w-500">
                  Website owners should regularly check for and fix broken links
                  using tools like Google Search Console or other link-checking
                  software.
                </p>
              </div>
            </div>
          </div>
          <Link
            role="button"
            to="/"
            className="btn btn-lg btn-primary"
          >
            <i className="ti ti-home"></i> Back To Home
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;
