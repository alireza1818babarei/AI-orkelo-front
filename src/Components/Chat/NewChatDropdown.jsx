import React from 'react';

const NewChatDropdown = () => {
    return (
        <>
            <div className="float-end">
                <div className="btn-group dropdown-icon-none">
                    <button className="btn btn-primary icon-btn b-r-22 dropdown-toggle active" type="button"
                            data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false">
                        <i className="ti ti-plus"></i>
                    </button>
                    <ul className="dropdown-menu" data-popper-placement="bottom-start">
                        <li><a className="dropdown-item" href="#"><i className="ti ti-brand-hipchat"></i> <span
                            className="f-s-13">New Chat</span></a>
                        </li>
                        <li><a className="dropdown-item" href="#"><i className="ti ti-phone-call"></i> <span
                            className="f-s-13">New Contact</span></a>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default NewChatDropdown;