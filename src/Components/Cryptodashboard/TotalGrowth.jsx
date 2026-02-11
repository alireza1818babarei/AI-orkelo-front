import React, { useState} from 'react';
import {Card, CardBody, Col, Button, Table} from 'reactstrap';
import {totalGrowth} from "../../Data/Charts/CryptoChart";
import Chart from "react-apexcharts";
import MarketChart from "../../Data/Charts/MarketChart";
import {Link} from 'react-router-dom'

const TotalGrowth = () => {

    const [activeTab, setActiveTab] = useState('day'); // Manage the active tab state

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const marketData = [
        {
            name: "Bitcoin",
            marketCap: "$25,89.00",
            image: "/assets/images/dashboard/analytics/bitcoin.png",
            progressData: [50, 45, 60, 46, 58, 45],
            color: "rgba(var(--warning))"
        },
        {
            name: "Edo",
            marketCap: "$21,80.00",
            image: "/assets/images/dashboard/analytics/turkish-lira.png",
            progressData: [45, 10, 20, 66, 18, 15],
            color: "rgba(var(--success))"
        },
        {
            name: "Ethereum",
            marketCap: "$18,97.00",
            image: "/assets/images/dashboard/analytics/ethereum.png",
            progressData: [20, 45, 38, 26, 18, 35],
            color: "rgba(var(--secondary))"
        },
        {
            name: "Binance",
            marketCap: "$29,80.00",
            image: "/assets/images/dashboard/analytics/binance.png",
            progressData: [50, 45, 60, 46, 58, 45],
            color: "rgba(var(--primary))"
        },
        {
            name: "Dash",
            marketCap: "$12,64.00",
            image: "/assets/images/dashboard/analytics/dogecoin.png",
            progressData: [50, 45, 60, 46, 58, 45],
            color: "rgba(var(--danger))"
        },
    ];

    const seriesLists = [
        [50, 45, 60, 46, 58, 45],
        [45, 10, 20, 66, 18, 15],
        [20, 45, 38, 26, 18, 35],
        [50, 45, 60, 46, 58, 45],
        [50, 45, 60, 46, 58, 45],
    ];

    const colorLists = [
        "rgba(var(--primary))",
        "rgba(var(--secondary))",
        "rgba(var(--success))",
        "rgba(var(--danger))",
        "rgba(var(--primary))",
    ];

    return (


        <>
            <Col lg="5">
                <Card className="currency-growth-card">
                    <CardBody>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="header-title-text">$78,906.099</h4>
                                <p className="mb-0 text-secondary">
                                    Total <span className="text-danger">-45%</span> Growth
                                </p>
                            </div>
                            <div>
                                <div className="growth-tabs">
                                    <div className="nav nav-tabs app-tabs-primary d-flex">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link active ${activeTab === 'day' ? 'active' : ''}`}
                                                onClick={() => handleTabChange('day')}
                                            >
                                                1D
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link  ${activeTab === 'week' ? 'active' : ''}`}
                                                onClick={() => handleTabChange('day')}
                                            >
                                                1W
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link  ${activeTab === 'month' ? 'active' : ''}`}
                                                onClick={() => handleTabChange('day')}
                                            >
                                                1M
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link  ${activeTab === 'year' ? 'active' : ''}`}
                                                onClick={() => handleTabChange('day')}
                                            >
                                                1Y
                                            </button>
                                        </li>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="total-growth">
                            {activeTab === 'day' &&
                                <Chart options={totalGrowth} series={totalGrowth.series} type="candlestick"
                                       height={286}/>
                            }
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col sm={7} lg={4}>
                <Card>
                    <CardBody className="p-0">
                        <div className="table-responsive app-scroll">
                            <Table className="currency-market-table align-middle table-bottom-border mb-0">
                                <thead>
                                <tr>
                                    <th scope="col">MarketCap</th>
                                    <th scope="col">America</th>
                                    <th scope="col">Progress</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {marketData.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="position-relative">
                                                    <div className="h-35 w-35 d-flex-center b-r-15 overflow-hidden bg-light-warning position-absolute">
                                                        <img src={item.image} alt={item.name} className="img-fluid" />
                                                    </div>
                                                    <div className="ms-5">
                                                        <h6 className="mb-0">{item.name}</h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.marketCap}</td>
                                            <td>
                                                <div className="coin-progress">
                                                    <MarketChart data={seriesLists[index]} color={colorLists[index]}/>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </CardBody>
                </Card>
            </Col>

            <Col sm="5" lg="3">
                <Card className="card-added">
                    <CardBody>
                        <div className="text-center">
                            <img src="/assets/images/dashboard/analytics/bg.png" className="img-fluid" alt="Card added"/>

                            <div>
                            <h5 className="text-primary mt-3">Your Card Added Successfully</h5>
                                <p className="text-secondary f-s-15 mt-2 mb-0">
                                    Congratulations! Your card has been Successfully added.
                                </p>
                            </div>
                            <div className="text-center mt-3">
                                <Link to="/apps/profile-page/profile">
                                    <Button color="primary">Added Card</Button>
                                </Link>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>


        </>
    )
}

export default TotalGrowth
