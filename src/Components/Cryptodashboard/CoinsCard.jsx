import React from 'react'
import { Card, CardBody, Col, Row } from 'reactstrap';

import Chart from "react-apexcharts";
import {cryptocurrencies} from "../../Data/Charts/CryptoChart";

const CoinsCard = () => {



  return (
    <>
      {cryptocurrencies.map((crypto, index) => (
        <Col sm="6" lg="3" key={index}>
          <Card className="currency-card">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div className="position-relative">
                  <div
                    className={`h-40 w-40 d-flex-center b-r-8 overflow-hidden bg-light-${crypto.colorClass} p-1 currency-icon`}
                  >
                    <i className={`ph-bold ${crypto.icon} f-s-20`}></i>
                  </div>
                  <div className="ms-5">
                    <h6 className="header-title-text mb-0">{crypto.name}</h6>
                  </div>
                </div>
                <div>
                  <h5 className={`text-${crypto.colorClass}`}>{crypto.amount}{crypto.symbol}</h5>
                </div>
              </div>
              <div className="currency-chart-box">
                <div className="currency-chart">
                    <Chart
                        options={{
                            chart: {
                                type: 'area',
                                height: 80,
                                offsetY: 0,
                                offsetX: 0,
                                toolbar: {
                                    show: false,
                                },
                            },
                            stroke: {
                                width: 2,
                                curve: 'smooth'
                            },
                            dataLabels: {
                                enabled: false,
                            },
                            legend: {
                                show: false,
                            },
                            fill: {
                                type: "gradient",
                                gradient: {
                                    shadeIntensity: 1,
                                    colorStops: crypto.fill.gradient.colorStops
                                }
                            },
                          colors:[crypto.color],
                            xaxis: {
                                labels: {
                                    show: false,
                                },
                                axisBorder: {
                                    show: false,
                                },
                                axisTicks: {
                                    show: false,
                                },
                                tooltip: {
                                    enabled: false,
                                },
                            },
                            yaxis: {
                                min: 19,
                                max: 25,
                                labels: {
                                    show: false,
                                },
                            },
                            grid: {
                                show: false,
                                padding: {
                                    top: -10,
                                    right: 0,
                                    bottom: -18,
                                    left: 0,
                                },
                            },
                            tooltip: {
                                x: {
                                    show: false,
                                },
                                style: {
                                    fontSize: '16px',
                                    fontFamily: '"Outfit", sans-serif',
                                },
                            },
                        }}
                        series={crypto.series}
                        type="area"
                        height={80}
                        clssname="currency-chart"
                    />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </>
  )
}

export default CoinsCard
