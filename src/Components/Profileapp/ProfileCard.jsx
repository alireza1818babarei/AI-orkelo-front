import React from 'react'
import { useSelector } from 'react-redux';
import { Card, CardBody } from 'reactstrap';

const ProfileCard = () => {

    const user = useSelector(s=> s.auth.user);

  return (
    <Card className="card">
      <CardBody className="card-body">
        <div className="profile-container">
          <div className="image-details">
            <div className="profile-image"></div>
            <div className="profile-pic">
              <div className="avatar-upload">
                <div className="avatar-edit">
                  <input
                    type="file"
                    id="imageUpload"
                    accept=".png, .jpg, .jpeg"
                  />
                  <label htmlFor="imageUpload">
                    <i className="ti ti-photo-heart"></i>
                  </label>
                </div>
                <div className="avatar-preview">
                  <div id="imgPreview"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="person-details">
            <h5 className="f-w-600 text-capitalize">
              {user?.name}
              <img
                width="20"
                height="20"
                src="/assets/images/profile-app/01.png"
                alt="instagram-check-mark"
              />
            </h5>
            <p>{user?.user_type}</p>
            <div className="details">
              <div>
                <h4 className="text-primary">10</h4>
                <p className="text-secondary">Post</p>
              </div>
              <div>
                <h4 className="text-primary">3.4k</h4>
                <p className="text-secondary">Follower</p>
              </div>
              <div>
                <h4 className="text-primary">1k</h4>
                <p className="text-secondary">Following</p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default ProfileCard
