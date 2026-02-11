
import React, {useEffect} from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    Button,
    Row,
    Col,
    ListGroup,
    ListGroupItem,
  } from "reactstrap";
import {Link} from 'react-router-dom'



const ProductsCards = () => {

  useEffect(() => {

    const generateData = (baseval, count, yrange) => {
      let i = 0;
      const series = [];
      while (i < count) {
        const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
        const z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

        series.push([baseval, y, z]);
        baseval += 86400000; // Adds one day in milliseconds
        i++;
      }
      return series;
    };

    $('#userCountries').vectorMap({
      map: 'world_mill',
      normalizeFunction: 'polynomial',
      hoverOpacity: 0.7,
      hoverColor: false,
      backgroundColor: 'var(--white)',
      regionStyle: { initial: { fill: 'rgb(var(--primary),.6)'  }, hover: { fill: 'rgb(var(--primary))' } },

      series: {
        regions: [{
          attribute: 'fill'
        }]
      }
    });

  }, []);


  const countriesData = [
        {
          flag: "usa",
          name: "US",
          trend: "down",
          percentage: "40%",
          isPositive: true,
        },
        {
          flag: "fra",
          name: "France",
          trend: "up",
          percentage: "60%",
          isPositive: true,
        },
        {
          flag: "ita",
          name: "Italy",
          trend: "down",
          percentage: "57%",
          isPositive: false,
        },
        {
          flag: "aus",
          name: "Australia",
          trend: "up",
          percentage: "24%",
          isPositive: true,
        },
        {
          flag: "deu",
          name: "Germany",
          trend: "up",
          percentage: "86%",
          isPositive: true,
        },
        {
          flag: "eng",
          name: "England",
          trend: "down",
          percentage: "12%",
          isPositive: false,
        },
      ];

      const products = [
        {
          name: "I Smart Watch",
          details: "50 product",
          imgSrc: "/assets/images/dashboard/ecommerce-dashboard/wristwatch.png",
          voucher: "@RA0911",
          sold: "60%",
          price: "$340.00",
        },
        {
          name: "Shoes",
          details: "200 product",
          imgSrc: "/assets/images/dashboard/ecommerce-dashboard/shoes.png",
          voucher: "@RA6547",
          sold: "50%",
          price: "$450.00",
        },
        {
          name: "Airpods Pro",
          details: "20 product",
          imgSrc: "/assets/images/dashboard/ecommerce-dashboard/earphone.png",
          voucher: "@RA5672",
          sold: "87%",
          price: "$500.00",
        },
        {
          name: "Purce",
          details: "180 product",
          imgSrc: "/assets/images/dashboard/ecommerce-dashboard/backpack.png",
          voucher: "@RA0546",
          sold: "68%",
          price: "$480.00",
        },
        {
          name: "Tree Pot",
          details: "80 product",
          imgSrc: "/assets/images/dashboard/ecommerce-dashboard/plant.png",
          voucher: "@RA340",
          sold: "52%",
          price: "$579.00",
        },
      ];

      const orders = [
        {
          status: "Order",
          color: "primary",
          date: "Nov 16",
          icon: "ph-basket",
          details: [
            { label: "Purchase 2 Items", value: "$489.00" },
            { label: "Order Id", value: "📦#R98056745" },
            { label: "Ships to", value: "Devied Smith" },
          ],
          link: { text: "More Details", url: "/product_details" },
        },
        {
          status: "Processing",
          color: "warning",
          date: "Est. Nov 18",
          icon: "ph-gear",
          details: [{ label: "Order Processing at Its Finest 📝" }],
        },
        {
          status: "Shipped",
          color: "success",
          date: "Est. Nov 18",
          icon: "ph-truck",
          details: [{ label: "Your order has set sail 🚚" }],
        },
        {
          status: "Delivered",
          color: "secondary",
          date: "Est. Nov 20",
          icon: "ph-seal-check",
          details: [{ label: "📦 Your Order delivered" }],
        },
      ];


    return (
        <Row>
             <Col md="6" xxl="4">
      <Card className="countries-details-card">
        <CardBody>
          <div>
            <div className="w-100 h-250" id="userCountries"></div>
            <Button color="primary" className="b-r-10 mt-3">
              Details
            </Button>
          </div>
          <Row className="d-flex justify-content-between mt-2">
            {/* Split the countries into two lists */}
            {Array.from({ length: 2 }, (_, index) => (
              <Col key={index} md="6">
                <ListGroup className="countries-details-list">
                  {countriesData
                    .slice(index * 3, index * 3 + 3)
                    .map((country, idx) => (
                      <ListGroupItem key={idx} className="d-flex justify-content-between border-0">
                        <div className="d-flex align-items-center">
                          <span className="me-3">
                            <i
                              className={`flag-icon flag-icon-${country.flag} flag-icon-squared b-r-5 f-s-24`}
                            ></i>
                          </span>
                          <p className="f-w-500 mb-0">{country.name}</p>
                        </div>
                        <div>
                          <h6
                            className={`mb-0 ${
                              country.isPositive ? "text-success" : "text-danger"
                            }`}
                          >
                            <i
                              className={`ph-bold ${
                                country.trend === "up"
                                  ? "ph-trend-up"
                                  : "ph-trend-down"
                              }`}
                            ></i>
                            {country.percentage}
                          </h6>
                        </div>
                      </ListGroupItem>
                    ))}
                </ListGroup>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>
    </Col>

    <Col md="6" xxl="4">
      <Card className="top-product-card">
        <CardHeader className="card-header-title">
          <Row className="align-items-center">
            <Col>
              <h5>Top Products</h5>
              <p className="text-secondary mb-0">Latest Report</p>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <div className="table-responsive app-scroll">
            <Table className="align-middle top-products-table mb-0" striped>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Voucher</th>
                  <th>Sold</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="position-relative">
                          <img
                            src={product.imgSrc}
                            alt={product.name}
                            className="w-35"
                          />
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0">{product.name}</h6>
                          <p className="mb-0">{product.details}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.voucher}</td>
                    <td>{product.sold}</td>
                    <td>{product.price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </Col>

    <Col md="6" lg="5" xxl="4" className="order-1-lg">
      <Card className="order-timeline-card">
        <CardHeader>
          <h5>Order History</h5>
        </CardHeader>
        <CardBody className="app-scroll">
          <ul className="app-timeline-box order-timeline list-unstyled">
            {orders.map((order, index) => (
              <li key={index} className="timeline-section ">
               
                  {/* Timeline Icon */}
                  <div className="timeline-icon me-3">
                    <span
                      className={`bg-${order.color} h-35 w-35 d-flex align-items-center justify-content-center rounded-circle`}
                    >
                      <i className={`ph-duotone ${order.icon} f-s-18 text-white`}></i>
                    </span>
                  </div>

                  {/* Timeline Content */}
                  <div className="timeline-content flex-grow-1">
                    <div className="order-timeline-box">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className={`text-${order.color} fw-bold mb-0`}>
                          {order.status}
                        </h6>
                        <p className="fs-12 mb-0 text-danger">{order.date}</p>
                      </div>
                      <div className="mt-2 order-timeline-content">
                        {order.details.map((detail, i) => (
                          <p key={i} className="mb-0">
                            {detail.label}{" "}
                            {detail.value && <span>{detail.value}</span>}
                          </p>
                        ))}
                        {order.link && (
                          <Link
                            to={order.link.url}
                            className="link-danger text-decoration-underline"
                          >
                            {order.link.text}
                            <i className="ph ph-arrow-right ps-1"></i>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </Col>

        </Row>
    )
}

export default ProductsCards;
