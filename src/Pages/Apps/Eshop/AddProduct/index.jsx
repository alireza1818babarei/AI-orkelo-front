import React from 'react';
import TextEditor from "@/Components/AddProduct/TextEditor";
import CustomSelect from "@/Components/AddProduct/CustomSelect";
import {options, options2} from "@/Components/AddProduct/addProductData";
import UploadProduct from "@/Components/AddProduct/UploadProduct";
import {Link} from "react-router-dom";
import ("../../../../../public/assets/vendor/select/select2.min");

const AddProduct = () => {
    return (
        <div className="container-fluid">
            <div className="row m-1">
                <div className="col-12 ">
                    <h4 className="main-title">Add Product</h4>
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
                            <a href="#" className="f-s-14 f-w-500">Add Product</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <div className="app-product-section">
                                <div className="main-title">
                                    <h6>General Information</h6>
                                </div>
                                <div>
                                    <form className="app-form">
                                        <div className="mb-3">
                                            <label className="form-label">Product Title</label>
                                            <input type="text" className="form-control"/>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Brand Name</label>
                                            <input type="text" className="form-control"/>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Product Description</label>
                                            <TextEditor/>
                                        </div>
                                    </form>
                                </div>
                                <div className="app-divider-v dashed" />
                                <div className="main-title">
                                    <h6>Category</h6>
                                </div>
                                <div>
                                    <form className="app-form">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Product Category</label>
                                                    <CustomSelect options={options}/>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Product Tags</label>
                                                    <CustomSelect options={options2}/>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="app-divider-v dashed"/>
                                <div className="main-title">
                                    <h6>Inventory</h6>
                                </div>
                                <div>
                                    <form className="app-form">
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label className="form-label">SKU(Optional)</label>
                                                    <input type="text" className="form-control"/>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Barcode</label>
                                                    <input type="text" className="form-control"/>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="mb-3">
                                                    <label className="form-label">Quantity</label>
                                                    <input type="text" className="form-control"/>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="app-divider-v dashed"/>
                                <div className="main-title">
                                    <h6>Shipping</h6>
                                </div>
                                <form className="app-form">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Weight</label>
                                                <input type="text" className="form-control"/>
                                                <div className="form-text">
                                                    Package Size(The package you use to ship your product)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Shipping Days</label>
                                                <input type="text" className="form-control"/>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Length</label>
                                                <input type="text" className="form-control"/>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Breadth</label>
                                                <input type="text" className="form-control"/>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label className="form-label">Width</label>
                                                <input type="text" className="form-control"/>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="mt-4 text-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-light-secondary"
                                                >
                                                    Discard
                                                </button>
                                                <Link
                                                    to="/apps/e-shop/product-details"
                                                    role="button"
                                                    className="btn btn-primary ms-1"
                                                >
                                                    Add Product
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-body">
                            <div className="app-product-section">
                                <div className="main-title">
                                    <h6>Product Media</h6>
                                </div>
                                <UploadProduct/>
                                <div className="app-divider-v dashed"/>
                                <div className="main-title">
                                    <h6>Pricing</h6>
                                </div>
                                <form className="app-form">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <label className="form-label">Price</label>
                                                <div className="input-group mb-3">
                                                  <span
                                                      className="input-group-text b-r-left"
                                                      id="basic-addon1"
                                                  >
                                                    $
                                                  </span>
                                                    <input
                                                        type="text"
                                                        className="form-control b-r-right"
                                                        aria-label="Username"
                                                        aria-describedby="basic-addon1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <label className="form-label">Compare at price</label>
                                                <div className="input-group mb-3">
                                                      <span
                                                          className="input-group-text b-r-left"
                                                          id="basic-addon2"
                                                      >
                                                        $
                                                      </span>
                                                    <input
                                                        type="text"
                                                        className="form-control b-r-right"
                                                        aria-label="Username"
                                                        aria-describedby="basic-addon1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <label className="form-label">Discount(%)</label>
                                                <input type="text" className="form-control"/>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <label className="form-label">Discount Type</label>
                                                <input type="text" className="form-control"/>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div className="app-divider-v dashed"/>
                                <div>
                                    <div className="main-title">
                                        <h6>Product Variants</h6>
                                    </div>
                                    <div className="variants-box">
                                        <a
                                            role="button"
                                            className="text-primary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#exampleModal"
                                        >
                                            <i className="ti ti-plus"/> Add Variants
                                        </a>
                                    </div>
                                    <div
                                        className="modal fade"
                                        id="exampleModal"
                                        tabIndex="-1"
                                        aria-labelledby="exampleModalLabel"
                                        aria-hidden="true"
                                    >
                                        <div className="modal-dialog">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <h1
                                                        className="modal-title fs-5"
                                                        id="exampleModalLabel"
                                                    >
                                                        Modal title
                                                    </h1>
                                                    <button
                                                        type="button"
                                                        className="btn-close"
                                                        data-bs-dismiss="modal"
                                                        aria-label="Close"
                                                    />
                                                </div>
                                                <div className="modal-body">
                                                    <form className="app-form">
                                                        <div className="mb-3">
                                                            <label className="form-label">City</label>
                                                            <select className="form-select" defaultValue="1">
                                                                <option>select Option</option>
                                                                <option value="1">Size</option>
                                                                <option value="2">Weight</option>
                                                                <option value="3">Color</option>
                                                            </select>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Product Height
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                placeholder="Enter Number"
                                                            />
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="modal-footer">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        data-bs-dismiss="modal"
                                                    >
                                                        Close
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary"
                                                        data-bs-dismiss="modal"
                                                    >
                                                        Add Variants
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="app-divider-v dashed"/>
                                <div className="main-title">
                                    <h6>Visibility</h6>
                                </div>
                                <div>
                                    <div className="form-check d-flex align-items-center mt-2">
                                        <input
                                            className="form-check-input f-s-18 mb-1 m-1"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="Visibility_1"
                                        />
                                        <label className="form-check-label" htmlFor="Visibility_1">
                                            Published
                                        </label>
                                    </div>
                                    <div className="form-check d-flex align-items-center mt-2">
                                        <input
                                            className="form-check-input f-s-18 mb-1 m-1"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="Visibility_2"
                                        />
                                        <label className="form-check-label" htmlFor="Visibility_2">
                                            Schedule
                                        </label>
                                    </div>
                                    <div className="form-check d-flex align-items-center mt-2">
                                        <input
                                            className="form-check-input f-s-18 mb-1 m-1"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="Visibility_3"
                                        />
                                        <label className="form-check-label" htmlFor="Visibility_3">
                                            Hidden
                                        </label>
                                    </div>
                                </div>
                                <form className="app-form mt-4  ">
                                    <div className="mb-3">
                                        <label className="form-label">Publish Date</label>
                                        <input type="text" className="form-control"/>
                                        <div className="form-text">
                                            The category will not be visible until the specified date.
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;