
import React, { useState } from 'react';
import { Card, CardBody, Row, Col, Button, Badge,Label, Input, InputGroup, InputGroupText } from 'reactstrap';
import {datasettings, devices} from "../../Data/Settingapp/SettingAppData";

const SecurityCard = () => {

    const [passwordVisible, setPasswordVisible] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
    
      const togglePasswordVisibility = (field) => {
        setPasswordVisible((prev) => ({
          ...prev,
          [field]: !prev[field],
        }));
      };

  return (
    <>
      <div className="security-settings">
      {datasettings.map((setting) => (
        <Card key={setting.id} className="security-card-content">
          <CardBody>
            <div className="account-security">
              <Row className="align-items-center">
                <Col sm={setting.imgSrc ? 9 : 12}>
                  <h5 className="text-primary f-w-600">{setting.title}</h5>
                  <p className="account-description text-secondary f-s-16 mt-2 mb-0">
                    {setting.description}
                  </p>
                  {setting.badgeText && (
                    <Badge color={setting.badgeColor} className="p-2">
                      <i className={`ph-fill ${setting.badgeIcon} me-1`}></i>
                      {setting.badgeText}
                    </Badge>
                  )}
                </Col>
                {setting.imgSrc && (
                  <Col sm={3} className="account-security-img">
                    <img src={setting.imgSrc} alt={setting.imgAlt} className="w-150" />
                  </Col>
                )}
                <Col sm={12} className="text-end">
                  {setting.buttonText && (
                    <Button color={setting.buttonColor}>{setting.buttonText}</Button>
                  )}
                </Col>
              </Row>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>

    <Row>
        {/* Left Column */}
        <Col lg={12} xxl={6}>
          <ul className="active-device-session active-device-list" id="shareMenuLeft">
            {devices.slice(0, 3).map((device) => (
              <li key={device.id}>
                <Card className="share-menu-active">
                  <CardBody>
                    <div className="device-menu-item" draggable="false">
                      <span className="device-menu-img">
                        <i className={`ph-duotone ${device.icon} f-s-40 ${device.statusColor}`}></i>
                      </span>
                      <div className="device-menu-content">
                        <h6 className="mb-0 txt-ellipsis-1">{device.deviceName}</h6>
                        <p className="mb-0 txt-ellipsis-1 text-secondary">{device.location}</p>
                      </div>
                      <div className="device-menu-icons">
                        <Badge color="light-secondary" className="p-2 f-s-16">
                          <i className={`ph-fill ph-check-circle me-1 ${device.statusColor}`}></i>
                          {device.status}
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </Col>

        {/* Right Column */}
        <Col lg={12} xxl={6}>
          <ul className="active-device-session active-device-list" id="shareMenuRight">
            {devices.slice(3).map((device) => (
              <li key={device.id}>
                <Card>
                  <CardBody>
                    <div className="device-menu-item" draggable="false">
                      <span className="device-menu-img">
                        <i className={`ph-duotone ${device.icon} f-s-40 ${device.statusColor}`}></i>
                      </span>
                      <div className="device-menu-content">
                        <h6 className="mb-0 txt-ellipsis-1">{device.deviceName}</h6>
                        <p className="mb-0 txt-ellipsis-1 text-secondary">{device.location}</p>
                      </div>
                      <div className="device-menu-icons">
                        <Badge color="light-secondary" className="p-2 f-s-16">
                          <i className={`ph-fill ph-x-circle me-1 ${device.statusColor}`}></i>
                          {device.status}
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </Col>
      </Row>

      <Card className="security-card-content">
      <CardBody>
        <div className="account-security mb-2">
          <Row className="align-items-center">
            <Col sm="9">
              <h5 className="text-primary f-w-600">Change Password</h5>
              <p className="account-discription text-secondary f-s-16 mt-3">
                To change your password, please fill in the fields below. Your password must contain at least 8
                characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.
              </p>
            </Col>
            <Col sm="3" className="account-security-img">
              <img src="../assets/images/setting-app/password.jpg" alt="" className="w-150" />
            </Col>
          </Row>
        </div>

        <div className="app-form">
          <Row>
            {/* Current Password */}
            <Col sm="12">
              <Label for="currentPassword" className="form-label">
                Current Password
              </Label>
              <InputGroup className="mb-3">
                <InputGroupText>
                  <i className="ph-bold ph-lock f-s-20"></i>
                </InputGroupText>
                <Input
                  type={passwordVisible.currentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  className="form-control"
                  placeholder="********"
                />
                <InputGroupText onClick={() => togglePasswordVisibility('currentPassword')}>
                  <i className={`ph ph-eye-slash f-s-20 ${passwordVisible.currentPassword ? 'text-primary' : ''}`}></i>
                </InputGroupText>
              </InputGroup>
            </Col>

            {/* New Password */}
            <Col sm="12">
              <Label for="newPassword" className="form-label">
                New Password
              </Label>
              <InputGroup className="mb-3">
                <InputGroupText>
                  <i className="ph-bold ph-lock f-s-20"></i>
                </InputGroupText>
                <Input
                  type={passwordVisible.newPassword ? 'text' : 'password'}
                  id="newPassword"
                  className="form-control"
                  placeholder="********"
                />
                <InputGroupText onClick={() => togglePasswordVisibility('newPassword')}>
                  <i className={`ph ph-eye-slash f-s-20 ${passwordVisible.newPassword ? 'text-primary' : ''}`}></i>
                </InputGroupText>
              </InputGroup>
            </Col>

            {/* Confirm Password */}
            <Col sm="12">
              <Label for="confirmPassword" className="form-label">
                Confirm Password
              </Label>
              <InputGroup className="mb-3">
                <InputGroupText>
                  <i className="ph-bold ph-lock f-s-20"></i>
                </InputGroupText>
                <Input
                  type={passwordVisible.confirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="form-control"
                  placeholder="********"
                />
                <InputGroupText onClick={() => togglePasswordVisibility('confirmPassword')}>
                  <i className={`ph ph-eye-slash f-s-20 ${passwordVisible.confirmPassword ? 'text-primary' : ''}`}></i>
                </InputGroupText>
              </InputGroup>
            </Col>

            {/* Submit Button */}
            <Col sm="12" className="text-end">
              <Button color="primary">Save Changes</Button>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
    </>
  )
}

export default SecurityCard
