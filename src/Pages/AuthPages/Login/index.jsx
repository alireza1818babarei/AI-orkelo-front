import React from "react";
import { Col, Container, Row } from "reactstrap";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../../validation/auth/login.schema";
import { loginThunk } from "../../../store/auth/authSlice";
import { toastError } from "../../../utils/sweetAlert";

const Login = () => {
  const {loading, accessToken} = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onSubmit",
  });

  if(accessToken) return <Navigate to={"/"} replace/>

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(loginThunk(data)).unwrap();
      navigate("/", {
        replace: true,
        state: {flash: res?.message || "Welcome"}
      });
    } catch (e) {
      const message =
        e?.message || e?.data?.message || "Something went wrong";
        toastError(message);
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
                        alt="logo"
                        className="img-fluid"
                      />
                    </span>
                  </div>

                  <div className="signup-bg-img">
                    <img
                      src="/assets/images/login/04.png"
                      alt="login"
                      className="img-fluid"
                    />
                  </div>
                </div>
              </Col>

              <Col lg={6} className="form-contentbox">
                <div className="form-container">
                  <form onSubmit={handleSubmit(onSubmit)} className="app-form">
                    <Row>
                      <Col xs={12}>
                        <div className="mb-5 text-center text-lg-start">
                          <h2 className="text-primary f-w-600">
                            Welcome To Orkelo!
                          </h2>
                          <p>
                            Sign in with your data that you entered during your
                            registration
                          </p>
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Enter Your Email"
                            id="email"
                            autoComplete="email"
                            {...register("email")}
                          />
                          {errors.email && (
                            <small className="text-danger">
                              {errors.email.message}
                            </small>
                          )}
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <Link
                            to="/auth/password-reset"
                            className="link-primary float-end"
                          >
                            Forgot Password ?
                          </Link>

                          <input
                            type="password"
                            className="form-control"
                            placeholder="Enter Your Password"
                            id="password"
                            autoComplete="current-password"
                            {...register("password")}
                          />
                          {errors.password && (
                            <small className="text-danger">
                              {errors.password.message}
                            </small>
                          )}
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="rememberMe"
                            {...register("rememberMe")}
                          />
                          <label
                            className="form-check-label text-secondary"
                            htmlFor="rememberMe"
                          >
                            Remember me
                          </label>
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="mb-3">
                          <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                          >
                            {loading ? (
                              <span className="d-inline-flex align-items-center gap-2">
                                <iconify-icon icon="line-md:loading-loop" />
                                Signing in...
                              </span>
                            ) : (
                              "Sign In"
                            )}
                          </button>
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="text-center text-lg-start">
                          Don&apos;t Have Your Account yet?{" "}
                          <Link
                            to="/signup"
                            className="link-primary text-decoration-underline"
                          >
                            Sign up
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

export default Login;
