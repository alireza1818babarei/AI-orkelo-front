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
                        <li className={`${(data == "tab2" ? 'active' : '')} tab-link fw-medium f-s-16 f-w-600`} onClick={() => setData('tab2')}>
                            <i className="ti ti-timeline fw-bold"></i>{" "}
                            Activities{" "}
                            <span className="badge rounded-pill bg-warning badge-notification">
                                10+
                                <span className="visually-hidden">unread messages</span>
                            </span>
                        </li>
                        <li className={`${(data == "tab3" ? 'active' : '')} tab-link fw-medium f-s-16 f-w-600`} onClick={() => setData('tab3')}><i
                            className="ti ti-clipboard-data fw-bold"></i>{" "} Projects
                        </li>
                        <li className={`${(data == "tab4" ? 'active' : '')} tab-link fw-medium f-s-16 f-w-600`} onClick={() => setData('tab4')}><i
                            className="ti ti-photo-heart fw-bold"></i>{" "} Post
                        </li>
                        <li className={`${(data == "tab5" ? 'active' : '')} tab-link fw-medium f-s-16 f-w-600`} onClick={() => setData('tab5')}><i
                            className="ti ti-users fw-bold"></i>{" "}
                            Friends
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProfileAppTabs;