import React from "react";
import { Col, Container, Row } from "reactstrap";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../../validation/auth/signup.schema";
import {
  assignRandomAvatarThunk,
  signUpThunk,
} from "../../../store/auth/authSlice";
import { toastError } from "../../../utils/sweetAlert";

const SignUp = () => {
  const { accessToken, loading } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      terms: false,
    },
    mode: "onSubmit",
  });

  if (accessToken) return <Navigate to={"/"} replace />;

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(signUpThunk(data)).unwrap();
      try {
        await dispatch(assignRandomAvatarThunk()).unwrap();
      } catch {
        // Keep signup successful even if random avatar upload fails.
      }
      navigate("/", {
        replace: true,
        state: { flash: res?.message || "Registration Successfull"},
      });
    } catch (e) {
      const err =
        e?.message ||
        e?.data?.message ||
        "Somthing went wrong, please try again";
      toastError(err);
    }
  };

  return (
    <div className="sign-in-bg">
      <div className="app-wrapper d-block">
        <div className="main-container">
          <Container>
            <Row className="sign-in-content-bg">
              <Col lg={6} className="image-contentbox d-none d-lg-block">
                <div className="form-container">
                  <div className="signup-content mt-4">
                    <span>
                      <img
                        src="/assets/images/logo/1.png"
                        alt=""
                        className="img-fluid "
                      />
                    </span>
                  </div>

                  <div className="signup-bg-img">
                    <img
                      src="/assets/images/login/02.png"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                </div>
              </Col>
              <Col lg={6} className="form-contentbox">
                <div className="form-container">
                  <form className="app-form" onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                      <Col xs={12}>
                        <div className="mb-5 text-center text-lg-start">
                          <h2 className="text-primary f-w-600">
                            Create Account
                          </h2>
                          <p>Get Started For Free Today!</p>
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="mb-3">
                          <label htmlFor="username" className="form-label">
                            Username
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Your Username"
                            id="username"
                            {...register("name")}
                          />
                          {errors.name && (
                            <small className="text-danger">
                              {errors.name.message}
                            </small>
                          )}
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="mb-3">
                          <label htmlFor="username" className="form-label">
                            Email
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Enter Your Email"
                            id="email"
                            {...register("email")}
                          />
                          {errors.email && (
                            <small className="text-danger">
                              {errors.email.message}
                            </small>
                          )}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Enter Your Password"
                            id="password"
                            {...register("password")}
                          />
                          {errors.password && (
                            <small className="text-danger">
                              {errors.password.message}
                            </small>
                          )}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <label
                            htmlFor="password_confirmation"
                            className="form-label"
                          >
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="Enter Your Password"
                            id="password_confirmation"
                            {...register("password_confirmation")}
                          />
                          {errors.password_confirmation && (
                            <small className="text-danger">
                              {errors.password_confirmation.message}
                            </small>
                          )}
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="d-flex justify-content-between gap-3">
                          <div className="form-check mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              {...register("terms")}
                              id="checkDefault"
                            />
                            <label
                              className="form-check-label text-secondary"
                              htmlFor="checkDefault"
                            >
                              Accept Terms & Conditions
                            </label>
                            {errors.terms && (
                              <div>
                                <small className="text-danger">
                                  {errors.terms.message}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="mb-3">
                          <button
                            disabled={loading}
                            type="submit"
                            className="btn btn-primary w-100"
                          >
                            {loading ? (
                              <span className="d-inline-flex align-items-center gap-2">
                                <iconify-icon icon="line-md:loading-loop" />
                                Signing up...
                              </span>
                            ) : (
                              "Sign Up"
                            )}
                          </button>
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className="text-center text-lg-start">
                          Already Have A Account?{" "}
                          <Link
                            to="/login"
                            className="link-primary text-decoration-underline"
                          >
                            {" "}
                            Sign in
                          </Link>
                        </div>
                      </Col>
                    </Row>
                  </form>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
