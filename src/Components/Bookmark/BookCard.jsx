import React from 'react';
import {Card, CardBody, UncontrolledTooltip} from "reactstrap";

const BookCard = ({bookmark, onDelete, onFavouriteToggle, onShareToggle, onStarToggle, onEdit}) => {
    return (
        <>
            <Card className="book-mark-card">
                <CardBody>
                    <div className="draggable-card-img">
                        <img src={bookmark.image} alt={bookmark.title} className="h-225 img-fluid"/>
                        <div className="video-transparent-box"></div>
                        <div className="draggable-card-icon">
                            <div
                                className="bg-white h-35 w-35 d-flex-center b-r-50 me-3 heartBtn mb-2 "
                                onClick={() => onFavouriteToggle(bookmark.id)}>
                                <i className={`${bookmark.isFavourite ? 'ph-fill' : 'ph-bold'} ph-bold ph-heart f-s-18 text-danger hearticon`}></i>
                            </div>
                            <div
                                id={"share_" + bookmark.id}
                                className="bg-white h-35 w-35 d-flex-center b-r-50 me-3 shareBtn mb-2"
                                onClick={() => onShareToggle(bookmark.id)}
                            >
                                <a role="button" href="#" className=""
                                   data-bs-toggle="dropdown">
                                    <i className="ph-bold ph-share-network f-s-18 text-primary"/>
                                </a>
                                {/* Share Dropdown */}
                                <UncontrolledTooltip
                                    className=" bg-white"
                                    placement="right-start"
                                    target={"share_" + bookmark.id}
                                >
                                    <div className="d-flex justify-content-around py-2 ">
                                        <i className="ph-duotone ph-whatsapp-logo f-s-20 text-primary"></i>
                                        <i className="ph-duotone ph-instagram-logo f-s-20 text-success ms-2"></i>
                                        <i className="ph-duotone ph-facebook-logo f-s-20 text-info ms-2"></i>
                                        <i className="ph-duotone ph-messenger-logo f-s-20 text-danger ms-2"></i>
                                    </div>
                                </UncontrolledTooltip>
                            </div>
                            <div
                                className="bg-white h-35 w-35 d-flex-center b-r-50 me-3 starBtn mb-2"
                                onClick={() => onStarToggle(bookmark.id)}
                            >
                                <span className="f-s-18 text-warning">
                                    <i className={`${bookmark.isStarred ? 'ph-fill' : 'ph-bold'} ph-star f-s-18 text-warning`}></i>
                                </span>
                            </div>
                        </div>
                        {/* More actions */}
                        <div className="dropdown action-icon">
                            <a role="button" href="#" className=""
                               data-bs-toggle="dropdown">
                                <i className="ph-bold ph-dots-three-vertical text-white f-s-18"></i>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a className="dropdown-item" href="#"
                                       onClick={() => onEdit(bookmark)}>
                                        <i className="ti ti-edit text-success"></i> Edit
                                    </a>
                                </li>
                                <li>
                                    <a className="dropdown-item deletbtn" href="#"
                                       onClick={() => onDelete(bookmark.id)}>
                                        <i className="ti ti-trash text-danger"></i> Delete
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="draggable-card-content pt-4">
                        <h5 className="mb-2">{bookmark.title}</h5>
                        <p>{bookmark.url}</p>
                    </div>
                </CardBody>
            </Card>
        </>
    );
};

export default BookCard;