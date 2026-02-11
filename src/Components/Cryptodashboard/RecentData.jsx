import React, {useState} from 'react';
import {
    Card,
    CardBody,
    Col,
    Row,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Button,
    Form,
    FormGroup,
    Label,
    Input
} from 'reactstrap';
import {sharesChart} from "../../Data/Charts/CryptoChart";
import Chart from "react-apexcharts";
import {Link} from 'react-router-dom'
const RecentData = () => {

    const transactions = [
        {
            id: 1,
            avatar: '/assets/images/avtar/1.png',
            crypto: 'Bitcoin',
            action: 'Buy',
            amount: '+$24,00',
            time: '12:35 PM',
            status: 'success',
        },
        {
            id: 2,
            avatar: '/assets/images/avtar/2.png',
            crypto: 'Ethereum',
            action: 'Sell',
            amount: '-$78,00',
            time: '12:35 PM',
            status: 'danger',
        },
        {
            id: 3,
            avatar: '/assets/images/avtar/3.png',
            crypto: 'Binance',
            action: 'Buy',
            amount: '+$89,00',
            time: '12:35 PM',
            status: 'success',
        },
        {
            id: 4,
            avatar: '/assets/images/avtar/4.png',
            crypto: 'Litecoin',
            action: 'Sell',
            amount: '-$18,00',
            time: '12:35 PM',
            status: 'danger',
        },
        {
            id: 5,
            avatar: '/assets/images/avtar/6.png',
            crypto: 'Ethereum',
            action: 'Buy',
            amount: '+$87,00',
            time: '8:05 PM',
            status: 'success',
        },
    ];

    const currencies = [
        {
            id: 1,
            name: 'Bitcoin',
            amount: '$72,890',
            img: '/assets/images/dashboard/analytics/binance.png',
            bgColor: 'bg-primary',
        },
        {
            id: 2,
            name: 'Ethereum',
            amount: '$34,786',
            img: '/assets/images/dashboard/analytics/ethereum.png',
            bgColor: 'bg-danger',
        },
        {
            id: 3,
            name: 'Dash',
            amount: '$34,786',
            img: '/assets/images/dashboard/analytics/dogecoin.png',
            bgColor: 'bg-secondary',
        },
        {
            id: 4,
            name: 'Edo',
            amount: '$34,786',
            img: '/assets/images/dashboard/analytics/turkish-lira.png',
            bgColor: 'bg-success',
        },
    ];

    const profitData = {
        amount: '$45,897.00',
        yearOverYear: '45.9% Year over year',
    };

    const sharesData = {
        amount: '$7,829.03',
        yearOverYear: '14.07% Year over year',
    };

    const [activeTab, setActiveTab] = useState('exchange'); // To manage the active tab state

    // Data for tabs and dropdowns
    const tabData = [
        {id: 'buy', label: 'Buy'},
        {id: 'sell', label: 'Sell'},
        {id: 'exchange', label: 'Exchange'}
    ];

    const selectOptions = [
        {value: 'USD', label: 'USD'},
        {value: 'BTC', label: 'BTC'},
        {value: 'LTC', label: 'LTC'},
        {value: 'ETC', label: 'ETC'}
    ];

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <>
            <Col md="6" lg="3">
                <Card>
                    <CardBody>
                        <div className="transaction-list-header">
                            <h5 className="header-title-text">Recent Transaction</h5>
                        </div>
                        <ul className="transaction-list mt-3">
                            {transactions.map((transaction) => (
                                <li key={transaction.id} className="transaction-list-item">
                                    <div
                                        className="h-40 w-40 d-flex-center b-r-10 overflow-hidden text-bg-secondary transaction-list-avtar">
                                        <img src={transaction.avatar} alt={transaction.crypto} className="img-fluid"/>
                                    </div>
                                    <div className="transaction-list-content">
                                        <h6 className="mb-0">{transaction.crypto}</h6>
                                        <p className="mb-0 text-secondary">{transaction.action}</p>
                                    </div>
                                    <div>
                                        <p className={`mb-0 f-s-15 f-w-500 text-${transaction.status}`}>
                                            {transaction.amount}
                                        </p>
                                        <p className="mb-0 f-s-12 text-secondary">{transaction.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardBody>
                </Card>
            </Col>

            <Col lg="5" className="order--1-md">
                <Card className="card-dark currency-data-card">
                    <CardBody>
                        <Row>
                            <Col sm="6">
                                <h6>Profit</h6>
                                <h2>{profitData.amount}</h2>
                                <p className="text-light">{profitData.yearOverYear}</p>
                            </Col>

                            <Col sm="6" className="text-end text-sm-start">
                                <h6>Shares</h6>
                                <h4>{sharesData.amount}</h4>
                                <p className="text-light mb-0">{sharesData.yearOverYear}</p>
                                <div>
                                    <Chart options={sharesChart} series={sharesChart.series} type="line" height={90}/>
                                </div>
                            </Col>

                            {currencies.map((currency) => (
                                <Col key={currency.id} xs="6" md="3" className="p-1">
                                    <div className={`currency-coin-box ${currency.bgColor}`}>
                                        <div className="h-45 w-45 d-flex-center b-r-15 overflow-hidden p-1 mb-3">
                                            <img src={currency.img} alt={currency.name} className="img-fluid"/>
                                        </div>
                                        <p className="text-light mb-0">{currency.name}</p>
                                        <h6 className="mb-0">{currency.amount}</h6>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </CardBody>
                </Card>
            </Col>

            <Col md="6" lg="4">
                <Card>
                    <CardBody>
                        <div className="wallet-card-header d-flex align-items-center justify-content-between">
                            <h5 className="header-title-text">Your Wallet</h5>
                            <div className="wallet-tabs">
                                <Nav tabs className="nav nav-tabs app-tabs-primary">
                                    {tabData.map((tab) => (
                                        <NavItem key={tab.id}>
                                            <NavLink
                                                className={activeTab === tab.id ? 'active' : ''}
                                                onClick={() => handleTabChange(tab.id)}
                                            >
                                                {tab.label}
                                            </NavLink>
                                        </NavItem>
                                    ))}
                                </Nav>
                            </div>
                        </div>

                        <div className="mt-4">
                            <TabContent activeTab={activeTab}>
                                <TabPane tabId="buy">
                                    <div className="wallet-card">
                                        <div className="position-relative">
                                            <div
                                                className="h-35 w-35 d-flex-center b-r-10 overflow-hidden bg-warning position-absolute mt-1">
                                                <i className="ph-bold ph-currency-btc"></i>
                                            </div>
                                            <div className="mg-s-45">
                                                <h6 className="text-warning mb-0">BITCOIN</h6>
                                                <p className="mb-0">Bitcoin Price</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="wallet-card">
                                        <div>
                                            <p className="text-dark mb-0">Bitcoin Price</p>
                                            <h6 className="mb-0 text-secondary">$24,87.900</h6>
                                        </div>
                                        <Form>
                                            <FormGroup>
                                                <Input type="select" name="select" id="currency">
                                                    {selectOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Form>
                                    </div>
                                    <div className="wallet-card">
                                        <div>
                                            <p className="text-dark mb-0">Amount</p>
                                            <h6 className="mb-0 text-secondary">$24,87.900</h6>
                                        </div>
                                        <Form>
                                            <FormGroup>
                                                <Input type="select" name="select" id="amount">
                                                    {selectOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Form>
                                    </div>
                                    <div className="text-end mt-4">
                                        <Link to="/apps/pricing">
                                            <Button color="success" className="b-r-10">Buy Coin</Button>
                                        </Link>
                                    </div>
                                </TabPane>

                                <TabPane tabId="sell">
                                    <div className="wallet-card">
                                        <div className="position-relative">
                                            <div
                                                className="h-35 w-35 d-flex-center b-r-10 overflow-hidden bg-warning position-absolute mt-1">
                                                <i className="ph-bold ph-currency-btc"></i>
                                            </div>
                                            <div className="mg-s-45">
                                                <h6 className="text-warning mb-0">BITCOIN</h6>
                                                <p className="mb-0">Bitcoin Price</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="wallet-card">
                                        <div>
                                            <p className="text-dark mb-0">Bitcoin Price</p>
                                            <h6 className="mb-0 text-secondary">$24,87.900</h6>
                                        </div>
                                        <Form>
                                            <FormGroup>
                                                <Input type="select" name="select" id="currency">
                                                    {selectOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Form>
                                    </div>
                                    <div className="wallet-card">
                                        <div>
                                            <p className="text-dark mb-0">Amount</p>
                                            <h6 className="mb-0 text-secondary">$24,87.900</h6>
                                        </div>
                                        <Form>
                                            <FormGroup>
                                                <Input type="select" name="select" id="amount">
                                                    {selectOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Form>
                                    </div>
                                    <div className="text-end mt-4">
                                        <Link to="/apps/pricing">
                                            <Button color="danger" className="b-r-10">Sell Coin</Button>
                                        </Link>
                                    </div>
                                </TabPane>

                                <TabPane tabId="exchange">
                                    <div className="wallet-card">
                                        <div className="position-relative">
                                            <div
                                                className="h-35 w-35 d-flex-center b-r-10 overflow-hidden bg-warning position-absolute mt-1">
                                                <i className="ph-bold ph-currency-btc"></i>
                                            </div>
                                            <div className="mg-s-45">
                                                <h6 className="text-warning mb-0">BITCOIN</h6>
                                                <p className="mb-0">Bitcoin Price</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="wallet-card">
                                        <div>
                                            <p className="text-dark mb-0">Bitcoin Price</p>
                                            <h6 className="mb-0 text-secondary">$24,87.900</h6>
                                        </div>
                                        <Form>
                                            <FormGroup>
                                                <Input type="select" name="select" id="currency">
                                                    {selectOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Form>
                                    </div>
                                    <div className="wallet-card">
                                        <div>
                                            <p className="text-dark mb-0">Amount</p>
                                            <h6 className="mb-0 text-secondary">$24,87.900</h6>
                                        </div>
                                        <Form>
                                            <FormGroup>
                                                <Input type="select" name="select" id="amount">
                                                    {selectOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Form>
                                    </div>
                                    <div className="text-end mt-4">
                                        <Link to="/apps/pricing">
                                            <Button color="primary" className="b-r-10">Connect Wallet</Button>
                                        </Link>
                                    </div>
                                </TabPane>
                            </TabContent>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </>
    )
}

export default RecentData
