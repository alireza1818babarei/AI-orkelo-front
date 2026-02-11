import React from "react";
import {Card, CardBody, Col} from "reactstrap";

const ProductReturns = () => {
  return (
    <Col lg={6} xxl={3}>
      <Card>
        <CardBody>
          <div className="product-details-contentbox">
            <div>
              <h5>Returns:</h5>
              <p>Returns is a scheme provided by respective sellers directly
                under this policy in terms of which the option of exchange, replacement and/ or refund
                is offered by the respective sellers to you.</p>
            </div>

            <div className="mt-4">
              <div className="product-review">
                <div>
                  <div className="d-flex align-items-center justify-content-between">
                              <span className="bg-danger h-35 w-35 d-flex-center b-r-50 position-absolute">
                                EM
                              </span>
                    <span className="fs-6 f-w-500 text-secondary ms-5"> Elyssa Moen</span>
                    <div>
                      <i className="ti ti-star fs-5 "></i>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-muted mb-0">I got your first assignment.
                      It was quite good. 🥳 We can
                      continue with the next assignment.</p>
                  </div>
                </div>
                <div className="app-divider-v dotted py-3"></div>

                <div>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="h-35 w-35 d-flex-center b-r-50 overflow-hidden text-bg-secondary position-absolute">
                      <img src="/assets/images/avtar/16.png" alt="" className="img-fluid"/>
                    </div>
                    <span className="fs-6 f-w-500 text-secondary ms-5"> Mark</span>
                    <div>
                      <i className="ti ti-star fs-5 "></i>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-muted  ">
                      "This Top is not only stylish but also incredibly warm."
                    </p>
                    <div className="me-2 mt-3 text-end">
                      <a href="./product.html">
                        <img src="/assets/images/ecommerce/01.jpg" alt="" className="w-40 b-r-5"/>
                      </a>
                      <a href="./product.html">
                        <img src="/assets/images/ecommerce/02.jpg" alt="" className="w-40 b-r-5"/>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h5>Products:</h5>
              <div className="product-details-table">
                <table className="table table-bottom-border align-middle products-data-table">
                  <tbody>
                  <tr className="border-0">
                    <td>
                      <div className="position-relative">
                        <img src="/assets/images/dashboard/ecommerce-dashboard/16.png" alt="product-image"
                             className="w-45 h-45 position-absolute"/>
                        <div className="mg-s-40">
                          <h6 className="text-dark f-w-600 txt-ellipsis-1">Sports shoes</h6>
                          <p className="text-secondary mb-0">#AB9875</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-end">
                      <h6 className="f-s-15 text-success">$450</h6>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="position-relative">
                        <img src="/assets/images/dashboard/ecommerce-dashboard/01.png" alt="product-image"
                             className="w-45 h-45 position-absolute"/>
                        <div className="mg-s-40">
                          <h6 className="text-dark f-w-600 txt-ellipsis-1">Smartwatch</h6>
                          <p className="text-secondary mb-0">#AB8394</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-end">
                      <h6 className="f-s-15 text-success">$920</h6>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="position-relative">
                        <img src="/assets/images/dashboard/ecommerce-dashboard/09.png" alt="product-image"
                             className="w-45 h-45 position-absolute"/>
                        <div className="mg-s-40">
                          <h6 className="text-dark f-w-600 txt-ellipsis-1">T-shirt</h6>
                          <p className="text-secondary mb-0">#AB3804</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-end">
                      <h6 className="f-s-15 text-success">$100</h6>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="position-relative">
                        <img src="/assets/images/dashboard/ecommerce-dashboard/02.png" alt="product-image"
                             className="w-45 h-45 position-absolute"/>
                        <div className="mg-s-40">
                          <h6 className="text-dark f-w-600 txt-ellipsis-1">Airpods</h6>
                          <p className="text-secondary mb-0">#AB2903</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-end">
                      <h6 className="f-s-15 text-success">$10,900</h6>
                    </td>
                  </tr>
                  </tbody>
                </table>
                <a role="button" href="product.html" target="_blank" className="btn  btn-primary w-100">View All
                  Products</a>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ProductReturns;
