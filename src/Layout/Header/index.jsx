
import {
    Col,
    Container,
    Row,
} from "reactstrap";
import HeaderMenu from "../../Layout/Header/HeaderMenu.jsx";

const Header = ({sidebarOpen, setIsSidebarOpen}) => {
    return (
        <header className="header-main">
            <Container fluid>
                <Row>
                    <Col xs="6" sm="4" className="d-flex align-items-center header-left p-0">
                        <span
                            className="header-toggle me-3"
                            onClick={() => setIsSidebarOpen(!sidebarOpen)}
                        >
                          <i className="ph ph-circles-four"></i>
                        </span>
                    </Col>

                    <Col xs="6" sm="8" className="d-flex align-items-center justify-content-end header-right p-0">
                        <HeaderMenu/>
                    </Col>
                </Row>
            </Container>
        </header>
    )
}

export default Header;