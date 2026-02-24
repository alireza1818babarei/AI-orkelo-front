import React from 'react';

const ProfileAppTabs = ({data,setData}) => {
    return (
        <div className="card">
            <div className="card-body">
                <div className="tab-wrapper">
                    <ul className="profile-app-tabs ">
                        <li className={`${(data == "tab1" ? 'active' : '')} tab-link fw-medium f-s-16 f-w-600`} onClick={() => setData('tab1')}>
                            <i className="ti ti-user fw-bold"></i>{" "}
                            Profile
                        </li>
                        <li className={`${(data == "tab3" ? 'active' : '')} tab-link fw-medium f-s-16 f-w-600`} onClick={() => setData('tab3')}><i
                            className="ti ti-clipboard-data fw-bold"></i>{" "} Projects
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProfileAppTabs;
