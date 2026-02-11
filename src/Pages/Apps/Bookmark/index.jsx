
import {useState} from "react";
import {Button, Card, CardBody, CardHeader, Col, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Nav, NavItem, NavLink, Row, TabContent, TabPane} from "reactstrap";
import {bookMarkTableData} from "@/Data/BookmarkDataPage/Bookmark1.js";
import BookCard from "@/Components/Bookmark/BookCard.jsx";

const Bookmarks = () => {

    const [activeTab, setActiveTab] = useState("tab1");
    const [modalOpen, setModalOpen] = useState(false);
    const [bookmarksData, setBookmarksData] = useState(bookMarkTableData);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editBookmark, setEditBookmark] = useState(null);

    const toggleEditModal = () => setEditModalOpen(!editModalOpen);
    const toggleModal = () => setModalOpen(!modalOpen);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    // Handle bookmark add
    const handleAddBookmark = () => {
        console.log(file)
        const newBookmark = {
            id: bookmarksData.length + 1,
            title,
            url,
            image: file ? URL.createObjectURL(file) : ''
        };
        setBookmarksData([newBookmark, ...bookmarksData]);
        setTitle('');
        setUrl('');
        setFile(null);
        setModalOpen(false);
    };


    const handleDelete = (id) => {
        setBookmarksData(bookmarksData.map((bookmark) =>
            bookmark.id === id ? {...bookmark, isDelete: !bookmark.isDelete} : bookmark
        ));
    };

    const handleFavouriteToggle = (id) => {
        setBookmarksData(bookmarksData.map((bookmark) =>
            bookmark.id === id ? {...bookmark, isFavourite: !bookmark.isFavourite} : bookmark
        ));
    };

    const handleShareToggle = (id) => {
        setBookmarksData(bookmarksData.map(bookmark =>
            bookmark.id === id ? {...bookmark, isShared: !bookmark.isShared} : bookmark
        ));
    };

    const handleStarToggle = (id) => {
        setBookmarksData(bookmarksData.map(bookmark =>
            bookmark.id === id ? { ...bookmark, isStarred: !bookmark.isStarred } : bookmark
        ));
    };

    const handleEditClick = (bookmark) => {
        setEditBookmark(bookmark);
        setTitle(bookmark.title);
        setUrl(bookmark.url);
        setEditModalOpen(true);
    };

    const handleSaveChanges = () => {
        console.log(file)
        const updatedBookmark = {
            id: editBookmark.id,
            title,
            url,
            image: file ? URL.createObjectURL(file) : editBookmark.image
        };

        const updatedBookmarks = bookmarksData.map(bookmark =>
            bookmark.id === editBookmark.id ? updatedBookmark : bookmark
        );

        setBookmarksData(updatedBookmarks);
        resetForm();
        toggleEditModal();
    };

    const resetForm = () => {
        setTitle('');
        setUrl('');
        setFile(null);
    };
    return (
        <div>
            <Container fluid>
                <Row className="m-1">
                    <Col xs={12}>
                        <h4 className="main-title">Bookmark</h4>
                        <ul className="app-line-breadcrumbs mb-3">
                            <li className="">
                                <a href="#" className="f-s-14 f-w-500">
                      <span>
                        <i className="ph-duotone  ph-stack f-s-16"></i> Apps
                      </span>
                                </a>
                            </li>
                            <li className="active">
                                <a href="#" className="f-s-14 f-w-500">Bookmark</a>
                            </li>
                        </ul>
                    </Col>
                </Row>
                <Row>
                    <Col lg={3}>
                        <Card>
                            <CardHeader>
                                <h5>Bookmark</h5>
                            </CardHeader>
                            <CardBody>
                                <div className="vertical-tab setting-tab">
                                    <Nav tabs className="nav nav-tabs app-tabs-primary m-0">
                                        <NavItem className="cursor-pointer">
                                            <NavLink
                                                className={activeTab === "tab1" ? "active" : ""}
                                                onClick={() => setActiveTab("tab1")}
                                            >
                                                <i className="ph-bold  ph-bookmark pe-2"></i> Book Mark
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className="cursor-pointer">
                                            <NavLink
                                                className={activeTab === "tab2" ? "active" : ""}
                                                onClick={() => setActiveTab("tab2")}
                                            >
                                                <i className="ph-bold ph-heart pe-2"></i> Favourites
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className="cursor-pointer">
                                            <NavLink
                                                className={activeTab === "tab3" ? "active" : ""}
                                                onClick={() => setActiveTab("tab3")}
                                            >
                                                <i className="ph-bold ph-share-network pe-2"></i> Share
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className="cursor-pointer">
                                            <NavLink
                                                className={activeTab === "tab4" ? "active" : ""}
                                                onClick={() => setActiveTab("tab4")}
                                            >
                                                <i className="ph-bold ph-star pe-2"></i> Important
                                            </NavLink>
                                        </NavItem>
                                        <NavItem className="cursor-pointer">
                                            <NavLink
                                                className={activeTab === "tab5" ? "active" : ""}
                                                onClick={() => setActiveTab("tab5")}
                                            >
                                                <i className="ph-bold ph-trash pe-2"></i> Delete
                                            </NavLink>
                                        </NavItem>
                                    </Nav>
                                </div>

                                <div className="app-divider-v pt-2 pb-2 dashed"></div>

                                <ul className="email-list">
                                    <li className="cursor-pointer"><h6>Labels</h6></li>
                                    <li className="cursor-pointer"><i
                                        className="ti ti-circle-filled pe-2 text-danger"></i> Social
                                    </li>
                                    <li className="cursor-pointer"><i
                                        className="ti ti-circle-filled pe-2 text-primary"></i> Company
                                    </li>
                                    <li className="cursor-pointer"><i
                                        className="ti ti-circle-filled pe-2 text-success"></i> Important
                                    </li>
                                    <li className="cursor-pointer"><i
                                        className="ti ti-circle-filled pe-2 text-info"></i> Private
                                    </li>
                                </ul>
                                <div className="app-divider-v pt-2 pb-2 dashed"></div>

                                {/* Bookmark Options */}
                                <ul className="email-list">
                                    <li><i className="ph-bold ph-bookmark fs-5 pe-2"></i> All Bookmark</li>
                                    <li><i className="ph-bold ph-book-bookmark fs-5 pe-2"></i> Primary</li>
                                    <li><i className="ph-bold ph-tag fs-5 pe-2"></i> Promotions</li>
                                    <li><i className="ph-bold ph-user-circle fs-5 pe-2"></i> Social</li>
                                </ul>

                                {/* Add Bookmark Button */}
                                <Button color="primary" className="btn btn-primary w-100 mt-4 " block
                                        onClick={toggleModal}>
                                    Add Bookmark
                                </Button>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col lg={9}>
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId="tab1">
                                <Row className="bookmark-card">
                                    {bookmarksData.filter(bookmark => !bookmark.isStarred && !bookmark.isShared && !bookmark.isDelete).map((bookmark) => (
                                        <Col sm={6} xxl={4} key={bookmark.id}>
                                            <BookCard
                                                bookmark={bookmark}
                                                onDelete={handleDelete}
                                                onFavouriteToggle={handleFavouriteToggle}
                                                onShareToggle={handleShareToggle}
                                                onStarToggle={handleStarToggle}
                                                onEdit={handleEditClick}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </TabPane>
                            <TabPane tabId="tab2">
                                <div id="favourite-tab-pane">
                                    <Row>
                                        {bookmarksData.filter((bookmark) => bookmark.isFavourite).map((bookmark) => (
                                            <Col sm={6} xxl={4} key={bookmark.id}>
                                                <BookCard bookmark={bookmark}
                                                          onDelete={handleDelete}
                                                          onFavouriteToggle={handleFavouriteToggle}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </TabPane>
                            <TabPane tabId="tab3">
                                <div id="share-tab-pane">
                                    <Row>
                                        {bookmarksData.filter(bookmark => bookmark.isShared).map((bookmark) => (
                                            <Col sm={6} xxl={4} key={bookmark.id}>
                                                <BookCard
                                                    bookmark={bookmark}
                                                    onDelete={handleDelete}
                                                    onFavouriteToggle={handleFavouriteToggle}
                                                    onShareToggle={handleShareToggle}
                                                    onStarToggle={handleStarToggle}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </TabPane>
                            <TabPane tabId="tab4">
                                <div id="important-tab-pane">
                                    <Row>
                                        {bookmarksData.filter(bookmark => bookmark.isStarred).map((bookmark) => (
                                            <Col sm={6} xxl={4} key={bookmark.id}>
                                                <BookCard
                                                    bookmark={bookmark}
                                                    onDelete={handleDelete}
                                                    onFavouriteToggle={handleFavouriteToggle}
                                                    onShareToggle={handleShareToggle}
                                                    onStarToggle={handleStarToggle}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </TabPane>
                            <TabPane tabId="tab5">
                                <div id="delet-tab-pane">
                                    <Row>
                                        {bookmarksData.filter(bookmark => bookmark.isDelete).map((bookmark) => (
                                            <Col sm={6} xxl={4} key={bookmark.id}>
                                                <BookCard
                                                    bookmark={bookmark}
                                                    onDelete={handleDelete}
                                                    onFavouriteToggle={handleFavouriteToggle}
                                                    onShareToggle={handleShareToggle}
                                                    onStarToggle={handleStarToggle}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            </TabPane>
                        </TabContent>
                    </Col>
                </Row>

                <Modal isOpen={modalOpen} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal} className="bg-primary text-white">
                        New Bookmark
                    </ModalHeader>
                    <ModalBody>
                        <Form className="app-form">
                            <FormGroup>
                                <Label for="title">Title</Label>
                                <Input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="weburl">Url</Label>
                                <Input
                                    type="text"
                                    id="weburl"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="image">Image</Label>
                                <Input
                                    type="file"
                                    id="image"
                                    onChange={handleFileChange}
                                    required
                                />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleModal}>Close</Button>
                        <Button color="primary" onClick={handleAddBookmark}>Add New</Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Bookmark Modal */}
                <Modal isOpen={editModalOpen} toggle={toggleEditModal}>
                    <ModalHeader toggle={toggleEditModal} className="bg-primary text-white">
                        Edit Bookmark
                    </ModalHeader>
                    <ModalBody>
                        <Form className="app-form">
                            <FormGroup>
                                <Label for="title">Title</Label>
                                <Input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="weburl">Url</Label>
                                <Input
                                    type="text"
                                    id="weburl"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="image">Image</Label>
                                <Input
                                    type="file"
                                    id="image"
                                    onChange={handleFileChange}
                                />
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggleEditModal}>Close</Button>
                        <Button color="primary" onClick={handleSaveChanges}>Save Changes</Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </div>
    );
};

export default Bookmarks;