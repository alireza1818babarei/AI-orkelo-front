
import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  FormGroup,
  Input,
  Button,
} from 'reactstrap';
import {integrationData} from "../../Data/Settingapp/SettingAppData";

const ConnectionSettings = () => {
  const [connections, setConnections] = useState({
    github: true,
    slack: true,
    google: true,
    figma: true,
    drive: true,
  });

  const handleToggle = (connection) => {
    setConnections((prevState) => ({
      ...prevState,
      [connection]: !prevState[connection],
    }));
  };

  

  return (
    <Row>
      {integrationData.map((integration) => (
        <Col md="6" xxl="4" key={integration.connectionKey}>
          <Card className="conection-setting">
            <CardBody>
              <div className="conection-item">
                <div className="position-relative">
                  <span className="position-absolute">
                    <img src={integration.img} alt={integration.name} className="w-35 h-35" />
                  </span>
                  <h5 className="ms-5 mt-1">{integration.name}</h5>
                </div>
                <FormGroup className="form-check form-switch d-flex mt-1">
                  <Input
                    type="switch"
                    id={`basic-switch-${integration.connectionKey}`}
                    checked={connections[integration.connectionKey]}
                    onChange={() => handleToggle(integration.connectionKey)}
                    label=""
                    className="form-check-input form-check-primary fs-3"
                  />
                </FormGroup>
              </div>
              <p className="text-secondary f-s-16 mt-4">{integration.description}</p>
            </CardBody>
            <CardFooter className="text-end text-d-underline link-primary">
              <a href="#">View integration</a>
            </CardFooter>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ConnectionSettings;
