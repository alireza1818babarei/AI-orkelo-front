import React, {useEffect, useState} from 'react';
import { productlist } from '@/Data/Productlist/Productlist.js';
import {Card, CardBody, Col, Container, Row} from "reactstrap";
import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';

const ProductList = () => {
    useEffect(() => {
        setTimeout(() => {
            new DataTable('#product-Listtable');
        }, 1000)
    }, []);
    const [productPageList, setProductPageList] = useState(productlist);

    const handleDelete = (productId) => {
        const updatedProductList = productPageList.filter(product => product.id !== productId);
        setProductPageList(updatedProductList);
    };
    return (
        <div>
            <Container fluid>
            <Row className="m-1">
                        <Col xs={12}>
                            <h4 className="main-title">Product List</h4>
                            <ul className="app-line-breadcrumbs mb-3">
                                <li className="">
                                    <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="f-s-14 f-w-500">E-shop</a>
                                </li>
                                <li className="active">
                                    <a href="#" className="f-s-14 f-w-500">Product List</a>
                                </li>
                            </ul>
                        </Col>
                    </Row>

                    <Row>
                    <Col xs={12}>
                            <Card>
                                <CardBody className="px-0">

                                <div className="table-responsive app-scroll app-datatable-default product-list-table">
      <table id="product-Listtable" className="table-sm display align-middle">
        <thead>
          <tr>
            <th>
              <label className="check-box mb-0">
                <input type="checkbox" id="select-all" />
                <span className="checkmark outline-secondary ms-2 "></span>
              </label>
            </th>
            <th>Product</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Seller</th>
            <th>Published</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {productPageList.map((product) => (
            <tr key={product.id}>
              <td>
                <label className="check-box mb-0">
                  <input type="checkbox" />
                  <span className="checkmark outline-secondary ms-2"></span>
                </label>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <div className="h-35 w-35 d-flex-center b-r-10 overflow-hidden me-2">
                    <img src={product.image} alt={product.name} className="img-fluid" />
                  </div>
                  <div className="d-flex">
                    <span className="fw-medium">{product.name}</span>
                  </div>
                </div>
              </td>
              <td>{product.price}</td>
              <td>{product.stock}</td>
              <td>
                <span className="badge text-light-secondary">{product.category}</span>
              </td>
              <td>{product.seller}</td>
              <td>{product.published}</td>
                <td>
                    <button type="button" className="btn btn-light-success icon-btn b-r-4">
                        <i className="ti ti-edit text-success"></i>
                    </button>
                    {' '}
                    <button
                        type="button"
                        className="btn btn-light-danger icon-btn b-r-4 delete-btn"
                        onClick={() => handleDelete(product.id)}
                    >
                        <i className="ti ti-trash"></i>
                    </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
                                </div>


                                </CardBody>
                            </Card>
                    </Col>
                    </Row>
            </Container>
        </div>
    );
};

export default ProductList;