import React from 'react';
import { Card, CardBody, Col,Progress, Button } from "reactstrap";
import {overviewChartData} from "../../Data/Charts/EcommerceChart";
import Chart from "react-apexcharts";
import Slider from "react-slick";

const CustomersCards = () => {

  const ratings = [
    { stars: 5, percentage: 74, count: 4567, color: "primary" },
    { stars: 4, percentage: 65, count: 2765, color: "secondary" },
    { stars: 3, percentage: 40, count: 1682, color: "success" },
    { stars: 2, percentage: 25, count: 2380, color: "warning" },
    { stars: 1, percentage: 10, count: 19211, color: "danger" },
  ];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  const offers = [
    {
      title: "Get 10% off",
      description: "Visa card EMI Transactions, up to $800 on orders of $1500",
      imgSrc: "/assets/images/dashboard/ecommerce-dashboard/vector-1.png",
      btnText: "Check Now",
      btnColor: "warning",
      link: "/apps/e-shop/product",
    },
    {
      title: "Get extra 20% off",
      description:
          "Additional INR 250 Discount on OneCard Credit Card 9 month",
      imgSrc: "/assets/images/dashboard/ecommerce-dashboard/vector-2.png",
      btnText: "Check Now",
      btnColor: "success",
      link: "/apps/e-shop/product",
    },
  ];


  return (
      <>
        <Col lg="8" xxl="5">
          <Card>
            <CardBody>
              {/* Header Section */}
              <div>
                <h5 className="header-title-text">Revenue Reports</h5>
                <p className="fs-16 text-secondary mb-0">Latest 2H Update</p>
              </div>

              {/* Revenue Data Section */}
              <div className="d-flex gap-3 align-items-center justify-content-end">
                <div>
                  <h5 className="mb-0 text-primary fw-bold">$45,890.00</h5>
                  <p className="fs-16 text-secondary mb-0">Profit</p>
                </div>
                <div>
                  <h5 className="mb-0 text-success fw-bold">$3,890.00</h5>
                  <p className="fs-16 text-secondary mb-0">Expense</p>
                </div>
              </div>

              {/* Revenue Chart Section */}
              <div className="revenue-overview-chart">
                <Chart options={overviewChartData} series={overviewChartData.series} type="line" height={295}/>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col sm="6" lg="4" xxl="4" className="order-3-lg">
          <Card className="customers-review-box">
            <CardBody>
              {/* Header Section */}
              <div className="card-header-title">
                <h5 className="header-title-text">Customers Review</h5>
              </div>

              {/* Ratings Section */}
              <div className="mt-2 d-flex align-items-center gap-2">
                <div className="rating">
                  <span className="ti ti-star-filled f-s-16 text-warning"></span>
                  <span className="ti ti-star-filled f-s-16 text-warning"></span>
                  <span className="ti ti-star-half-filled f-s-16 text-warning"></span>
                  <span className="ti ti-star f-s-16"></span>
                  <span className="ti ti-star f-s-16"></span>
                </div>
                <div>
                  <p className="fs-16 mb-0 text-warning">
                    (<span className="fw-bold">4.50k</span> Review)
                  </p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="mt-3">
                {ratings.map((rating, index) => (
                    <div key={index} className="d-flex align-items-center mt-3">
                      <h5 className="mb-0">{rating.stars}</h5>
                      <i className="ti ti-star-filled text-warning f-s-9"></i>
                      <div className="progress w-100 ms-2 me-2">
                        <div
                            className={`progress-bar bg-${rating.color} progress-bar-striped`}
                            style={{ width: `${rating.percentage}%` }}
                        ></div>
                      </div>
                      <h6>({rating.count})</h6>
                    </div>
                ))}
              </div>

              {/* Footer Section */}
              <div className="text-center mt-3">
                <p>Discover what our customers have to say!</p>
                <a href="#" className="text-primary text-decoration-underline">
                  See all Customers Review
                </a>

                {/* Social Buttons */}
                <div className="mt-3">
                  <Button color="facebook" className="icon-btn rounded-circle me-1">
                    <i className="ti ti-brand-facebook text-white"></i>
                  </Button>
                  <Button color="twitter" className="icon-btn rounded-circle me-1">
                    <i className="ti ti-brand-twitter text-white"></i>
                  </Button>
                  <Button color="pinterest" className="icon-btn rounded-circle me-1">
                    <i className="ti ti-brand-pinterest text-white"></i>
                  </Button>
                  <Button color="linkedin" className="icon-btn rounded-circle">
                    <i className="ti ti-brand-linkedin text-white"></i>
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col sm="6" lg="4" xxl="3" className="mb-3 sm-0">
          <Slider {...sliderSettings} className="offer-slider">
            {offers.map((offer, index) => (
                <Card
                    key={index}
                    className={`offer-slider-box offeer-${offer.btnColor}-card mx-2`}
                >
                  <CardBody>
                    <div>
                      <h3 className="mb-0">{offer.title}</h3>
                      <p className="my-2">{offer.description}</p>
                    </div>
                    <div className="my-3">
                      <img src={offer.imgSrc} alt={offer.title} />
                    </div>
                    <div className="my-3">
                      <Button
                          href={offer.link}
                          color={offer.btnColor}
                          className="b-r-10 text-white"
                      >
                        <i className="ph-bold ph-arrow-circle-up-right me-1"></i>
                        {offer.btnText}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
            ))}
          </Slider>
        </Col>
      </>
  )
}

export default CustomersCards;
