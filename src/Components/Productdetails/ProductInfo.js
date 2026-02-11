
import React from "react";
import {Card, CardBody, Col} from "reactstrap";
import {Link} from 'react-router-dom'

const ProductInfo = () => {
  return (
    <Col xxl={6}>
      <Card>
        <CardBody>
          <div className="product-details-contentbox">
            <h4>Trendy &amp; Stylish Loafers For Men</h4>
            <div className="mt-2 d-flex align-items-center gap-2">
              <div className="rating ">
                <input
                  type="radio"
                  id="star11"
                  name="ratings2"
                  value="11"
                  defaultChecked
                  disabled=""
                />
                <label className="star" htmlFor="star11">
                  <span className="ti ti-star f-s-20 text-warning"></span>
                </label>
                <input
                  type="radio"
                  id="star15"
                  name="ratings2"
                  value="15"
                  defaultChecked
                  disabled=""
                />
                <label className="star" htmlFor="star15">
                  <span className="ti ti-star f-s-20 text-warning"></span>
                </label>
                <input
                  type="radio"
                  id="star12"
                  name="ratings2"
                  value="12"
                  disabled=""
                />
                <label className="star" htmlFor="star12">
                  <span className="ti ti-star-half-filled text-warning f-s-20"></span>
                </label>
                <input
                  type="radio"
                  id="star13"
                  name="ratings2"
                  value="13"
                  disabled=""
                />
                <label className="star" htmlFor="star13">
                  <span className="ti ti-star-filled text-secondary f-s-20"></span>
                </label>
                <input
                  type="radio"
                  id="star14"
                  name="ratings2"
                  value="14"
                  disabled=""
                />
                <label className="star" htmlFor="star14">
                  <span className="ti ti-star-filled text-secondary f-s-20"></span>
                </label>
              </div>
              <div>
                <h6 className="m-0 text-warning">
                  (<span className="f-w-600">4.50k</span> Review )
                </h6>
              </div>
            </div>
            <div className="mt-4 product-details">
              <h3>
                $26.00 <span>(54% OFF)</span>
              </h3>
            </div>

            <div className="app-divider-v dotted py-4 m-0"></div>

            <div className="product-detailbox">
              <div>
                <h5>Size:</h5>
                <div className="form-selectgroup d-flex gap-1">
                  <label className="select-items">
                    <input type="checkbox" className="select-input" defaultChecked />
                    <span className="select-box">
                      <span className="selectitem">6</span>
                    </span>
                  </label>
                  <label className="select-items">
                    <input type="checkbox" className="select-input" />
                    <span className="select-box">
                      <span className="selectitem">7</span>
                    </span>
                  </label>
                  <label className="select-items">
                    <input type="checkbox" className="select-input" />
                    <span className="select-box">
                      <span className="selectitem">25</span>
                    </span>
                  </label>
                  <label className="select-items">
                    <input type="checkbox" className="select-input" />
                    <span className="select-box">
                      <span className="selectitem">30</span>
                    </span>
                  </label>
                  <label className="select-items">
                    <input type="checkbox" className="select-input" />
                    <span className="select-box">
                      <span className="selectitem">40</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <h5>Color:</h5>
                <div className="option-color-list check-container">
                  <label className="check-box">
                    <input type="radio" name="radio-group1" defaultChecked />
                    <span className="radiomark check-primary ms-2"></span>
                  </label>
                  <label className="check-box">
                    <input type="radio" name="radio-group1" />
                    <span className="radiomark check-secondary ms-2"></span>
                  </label>
                  <label className="check-box">
                    <input type="radio" name="radio-group1" />
                    <span className="radiomark check-success ms-2"></span>
                  </label>
                  <label className="check-box">
                    <input type="radio" name="radio-group1" />
                    <span className="radiomark check-danger ms-2"></span>
                  </label>
                  <label className="check-box">
                    <input type="radio" name="radio-group1" />
                    <span className="radiomark check-warning ms-2"></span>
                  </label>
                  <label className="check-box">
                    <input type="radio" name="radio-group1" />
                    <span className="radiomark check-info ms-2"></span>
                  </label>
                  <label className="check-box">
                    <input type="radio" name="radio-group1" />
                    <span className="radiomark check-light ms-2"></span>
                  </label>
                  <label className="check-box">
                    <input type="radio" name="radio-group1" />
                    <span className="radiomark check-dark ms-2"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h5>Description :</h5>
              <div className="mt-3">
                <p>
                  A product description is a piece of writing that conveys the
                  features and benefits of a product, ranging from basic facts
                  to stories that make a product compelling to an ideal buyer.
                </p>
                <p>
                  Aside from educating and enticing potential customers, the
                  best descriptions can help you differentiate your product and
                  brand from your competitors by putting forward your most
                  salient features and benefits.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="d-flex align-items-center">
                <div className="me-2 ">
                  <i className="ti ti-star-filled f-s-30 text-warning"></i>
                </div>
                <div className="">
                  <h5 className="m-0">3.2 out of 5</h5>
                  <p className="mb-0 text-secondary f-s-13">
                    Based on (20,435) ratings
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="d-flex align-items-center">
                  <h6 className="mb-0">5 </h6>
                  <i className="ti ti-star-filled text-warning f-s-9"></i>
                  <div
                    className="progress w-100 ms-2 me-2"
                    role="progressbar"
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="progress-bar bg-primary progress-bar-striped"
                      style={{ width: "74%" }}
                    ></div>
                  </div>
                  <h6>(4,567)</h6>
                </div>
                <div className="d-flex align-items-center mt-3">
                  <h6 className="mb-0">4 </h6>
                  <i className="ti ti-star-filled text-warning f-s-9"></i>
                  <div
                    className="progress w-100 ms-2 me-2"
                    role="progressbar"
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="progress-bar bg-secondary progress-bar-striped"
                      style={{ width: "65%" }}
                    >
                    </div>
                  </div>
                  <h6>(2,765)</h6>
                </div>
                <div className="d-flex align-items-center mt-3">
                  <h6 className="mb-0">3 </h6>
                  <i className="ti ti-star-filled text-warning f-s-9"></i>
                  <div
                    className="progress w-100 ms-2 me-2"
                    role="progressbar"
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="progress-bar bg-success progress-bar-striped"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                  <h6>(1,682)</h6>
                </div>
                <div className="d-flex align-items-center mt-3">
                  <h6 className="mb-0">2 </h6>
                  <i className="ti ti-star-filled text-warning f-s-9"></i>
                  <div
                    className="progress w-100 ms-2 me-2"
                    role="progressbar"
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="progress-bar bg-warning progress-bar-striped"
                      style={{ width: "25%" }}
                    >
                    </div>
                  </div>
                  <h6>(2,380)</h6>
                </div>
                <div className="d-flex align-items-center mt-3">
                  <h6 className="mb-0">5 </h6>
                  <i className="ti ti-star-filled text-warning f-s-9"></i>
                  <div
                    className="progress w-100 ms-2 me-2"
                    role="progressbar"
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="progress-bar bg-danger progress-bar-striped"
                      style={{ width: "10%" }}
                    ></div>
                  </div>
                  <h6>(1,9211)</h6>
                </div>
              </div>
            </div>

            <div className="product-details-btn text-end mt-4">
              <Link to="/apps/e-shop/cart" role="button" className="btn btn-primary">
                Add To Cart
              </Link>{' '}
              <Link to="/apps/e-shop/checkout" role="button" className="btn btn-success">
                Buy Now
              </Link>{' '}
              <Link to="/apps/e-shop/wishlist" role="button" className="btn btn-danger">
                Add to Wishlist
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ProductInfo;
