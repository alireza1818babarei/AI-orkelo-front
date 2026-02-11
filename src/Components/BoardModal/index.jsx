import React from "react";
import { Button, Card, CardBody, CardHeader, Col } from "reactstrap";

function BoardModal(props) {
  return (
    <Col sm={12} md={6}>
      <Card className="equal-card">
        <CardHeader>
          <h5>Center Modal</h5>
          <p className="mb-0 text-secondary">
            if you want to keep the default modal then you can keep it using{" "}
            <span className="text-danger">modal-dialog-centered</span>
          </p>
        </CardHeader>
        <CardBody className="card-body">
          <Button
            type="button"
            className="btn btn-danger btn-md"
            data-bs-toggle="modal"
            data-bs-target="#exampleModalToggle"
          >
            Center Modal
          </Button>
        </CardBody>
      </Card>
    </Col>
  );
}

export default BoardModal;
