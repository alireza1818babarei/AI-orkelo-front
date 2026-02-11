import React, {useEffect, useRef, useState} from 'react';
import { Card, CardBody, CardHeader, Col } from "reactstrap";


const TablesLists = () => {
    const [List, setList] = useState(null);
    const sideListRef = useRef(null);
    const listRef = useRef(null);
    const listRef1 = useRef(null);
    const paginationRef = useRef(null);

    useEffect(() => {

        if (typeof window !== 'undefined') {
            import('list.js').then((module) => {
                setList(() => module.default);
            });
        }

        if (List) {
            new List(sideListRef.current, { valueNames: ['side'] });
            new List(listRef.current, { valueNames: ['name'] });
            new List(listRef1.current, {
                valueNames: ['name'],
                page: 3,
                pagination: true,
                paginationRef: paginationRef.current,
            });
        }

    }, [List]);

    return (
        <>
            <Col md={6} xxl={4}>
                <Card>
                    <CardHeader><h5>Existing list</h5></CardHeader>
                    <CardBody>
                        <div id="sidelist" ref={sideListRef}>
                            <div className="row mb-3">
                                <div className="col-md">
                                    <input type="search" className="form-control search" placeholder="Search..." />
                                </div>
                                <div className="col-md-auto">
                                    <button className="sort btn btn-sm btn-secondary" data-sort="side">Sort by name</button>
                                </div>
                            </div>
                            <div className="list existing-list">
                                {[1, 2, 3, 4].map(id => (
                                    <div key={id} data-id={id} className="d-flex justify-content-between">
                                        <div>
                                            <span className={`position-relative h-40 w-40 d-flex-center b-r-50 text-light-${['info', 'success', 'primary', 'info'][id-1]}`}>
                                                <i className="fa-solid fa-user"></i>
                                                <span className="position-absolute end-0 top-0 p-1 bg-light border border-light rounded-circle"></span>
                                            </span>
                                        </div>
                                        <div className="flex-grow-1 ps-2">
                                            <h6 className="link side">{['Olive Yew', 'Bea Mine', 'Toi Story', 'Art Decco'][id-1]}</h6>
                                            <p>{['This is the content of the email.', 'It enables users to easily.', 'Companies can use to convey.', 'System Software is closer.'][id-1]}</p>
                                        </div>
                                        <div className="text-muted">{['28 min', '48 min', '2 hours', '1 day'][id-1]}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col md={6} xxl={4}>
                <Card>
                    <CardHeader>
                        <h5>Search List Table</h5>
                    </CardHeader>
                    <CardBody>
                        <div id="test-list" ref={listRef}>
                            <div className="mb-3">
                                <input
                                    type="search"
                                    className="fuzzy-search form-control search"
                                    placeholder="Search..."
                                    aria-label="Search"
                                />
                            </div>
                            <ul className="list fuzzy-list">
                                {[
                                    'Guybrush Threepwood', 'Elaine Marley', 'LeChuck', 'Stan',
                                    'Voodoo Lady', 'Herman Toothrot', 'Meathook', 'Carla',
                                    'Otis', 'Rapp Scallion', 'Rum Rogers Sr.', 'Men of Low Moral Fiber',
                                    'Murray', 'Cannibals'
                                ].map((name, idx) => (
                                    <li key={idx}>
                                        <p className="name">{name}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col md={6} xxl={4}>
                <Card>
                    <CardHeader>
                        <h5>Table with Pagination</h5>
                    </CardHeader>
                    <CardBody>
                        <div id="user" ref={listRef1}>
                            <div className="mb-3">
                                <input
                                    type="search"
                                    className="form-control search"
                                    placeholder="Search..."
                                    aria-label="Search"
                                />
                            </div>

                            <table className="table table-bordered align-middle">
                                <tbody className="list">
                                {[
                                    'Jonny Stromberg', 'Jonas Arnklint', 'Martina Elm', 'Olive Yew',
                                    'Dave Allippa', 'Rhoda Report', 'Rita Book', 'Bess Twishes',
                                    'Gustaf Lindqvist'
                                ].map((name, idx) => (
                                    <tr key={idx}>
                                        <td className="name">{name}</td>
                                        <td>
                                            <button type="button" className="btn btn-light-secondary float-end">
                                                <i className="bi bi-envelope-at-fill"></i> Message
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <div className="list-pagination">
                                <ul className="pagination" ref={paginationRef}></ul>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </>
    );
};

export default TablesLists;
