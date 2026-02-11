import React, {useEffect, useRef, useState} from 'react';
import {Card, CardBody, CardHeader, Col} from "reactstrap";

const ListTable = () => {

    const [List, setList] = useState(null);

    const usersRef = useRef(null);


    useEffect(() => {

        if (typeof window !== 'undefined') {
            import('list.js').then((module) => {
                setList(() => module.default);
            });
        }

        const options = {
            valueNames: ['name', 'born', { data: ['id'] }]
        };

        if (List) {
            new List(usersRef.current, options);
        }


    }, [List]);


    return (
        <>
            <Col lg={4}>
                <Card>
                    <CardHeader>
                        <h5>List table</h5>
                    </CardHeader>
                    <CardBody>
                        <div id="users" ref={usersRef}>
                            <div className="row">
                                <div className="col-12 col-sm">
                                    <div className="mb-3">
                                        <input
                                            type="search"
                                            className="form-control search"
                                            placeholder="Search..."
                                            aria-label="Search"
                                        />
                                    </div>
                                </div>
                                <div className="col-12 col-sm-auto">
                                    <div className="mb-3">
                                        <button className="sort btn btn-sm btn-secondary" data-sort="name">
                                            Sort by name
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="list list-tables">
                                <div data-id="1" className="d-flex align-items-center justify-content-between mt-2">
                                    <input className="form-check-input mt-0" type="checkbox" name="item"/>
                                    <div className="link name ps-3 flex-grow-1 pe-2">
                                        <p className="mb-0">Olive Yew</p>
                                        <h6 className="fw-bold" data-timestamp="12345">1986</h6>
                                    </div>
                                    <div className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-secondary">
                                        <img src="/assets/images/avtar/07.png" alt="" className="img-fluid"/>
                                    </div>
                                </div>

                                <div data-id="2" className="d-flex align-items-center justify-content-between mt-2">
                                    <input className="form-check-input mt-0" type="checkbox" name="item"/>
                                    <div className="link name ps-3 flex-grow-1 pe-2">
                                        <p className="mb-0">Olive Yew</p>
                                        <h6 className="fw-bold" data-timestamp="12345">1957</h6>
                                    </div>
                                    <div className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-secondary">
                                        <img src="/assets/images/avtar/07.png" alt="" className="img-fluid"/>
                                    </div>
                                </div>

                                <div data-id="3" className="d-flex align-items-center justify-content-between mt-2">
                                    <input className="form-check-input mt-0" type="checkbox" name="item"/>
                                    <div className="link name ps-3 flex-grow-1 pe-2">
                                        <p className="mb-0">Allie Grater</p>
                                        <h6 className="fw-bold" data-timestamp="12345">1860</h6>
                                    </div>
                                    <div className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-secondary">
                                        <img src="/assets/images/avtar/1.png" alt="" className="img-fluid"/>
                                    </div>
                                </div>

                                <div data-id="4" className="d-flex align-items-center justify-content-between mt-2">
                                    <input className="form-check-input mt-0" type="checkbox" name="item"/>
                                    <div className="link name ps-3 flex-grow-1 pe-2">
                                        <p className="mb-0">Rita Book</p>
                                        <h6 className="fw-bold" data-timestamp="12345">1976</h6>
                                    </div>
                                    <div className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-secondary">
                                        <img src="/assets/images/avtar/16.png" alt="" className="img-fluid"/>
                                    </div>
                                </div>

                                <div data-id="5" className="d-flex align-items-center justify-content-between mt-2">
                                    <input className="form-check-input mt-0" type="checkbox" name="item"/>
                                    <div className="link name ps-3 flex-grow-1 pe-2">
                                        <p className="mb-0">Rose Bush</p>
                                        <h6 className="fw-bold" data-timestamp="12345">1960</h6>
                                    </div>
                                    <div className="h-25 w-25 d-flex-center b-r-50 overflow-hidden text-bg-secondary">
                                        <img src="/assets/images/avtar/4.png" alt="" className="img-fluid"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </>
    );
};

export default ListTable;