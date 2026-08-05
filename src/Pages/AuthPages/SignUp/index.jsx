import { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../../validation/auth/signup.schema";
import {
  assignRandomAvatarThunk,
  signUpThunk,
} from "../../../store/auth/authSlice";
import { toastError } from "../../../utils/sweetAlert";
import TermsModal from "../../../Components/TermsModal/TermsModal";

const SignUp = () => {
  const { accessToken, loading, user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [termsOpen, setTermsOpen] = useState(false);

  const toggleTerms = () => setTermsOpen((prev) => !prev);

  const isLogin = location.pathname === "/login";
  const isSignup = location.pathname === "/signup";

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

  if (accessToken && user) return <Navigate to="/" replace />;

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(signUpThunk(data)).unwrap();

      try {
        await dispatch(assignRandomAvatarThunk()).unwrap();
      } catch {
        // signup remains successful even if avatar fails
      }

      navigate("/", {
        replace: true,
        state: { flash: res?.message || "Registration Successful" },
      });
    } catch (e) {
      const err =
        e?.message ||
        e?.data?.message ||
        "Something went wrong, please try again";
      toastError(err);
    }
  };

  return (
    <div className="sign-in-bg">
      <div className="app-wrapper d-block">
        <div className="main-container">
          <Container>
            <Row className="sign-in-content-bg">
              <Col lg={6} className="image-contentbox position-relative">
                <Link
                  to="/login"
                  className={`signin-btn text-decoration-none ${
                    isLogin ? "bg-white color-orkelo" : "bg-orkelo text-white"
                  }`}
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className={`signup-btn text-decoration-none ${
                    isSignup ? "bg-white color-orkelo" : "bg-orkelo text-white"
                  }`}
                >
                  Sign Up
                </Link>

                <div className="form-container">
                  <div className="signup-bg-img">
                    <img
                      src="/assets/images/pages/Orkelologo-white.png"
                      alt="signup"
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
                        <div className="login-intro mb-5 text-center text-lg-start">
                          <h2 className="f-w-600 text-muted">
                            Create Your{" "}
                            <span className="color-orkelo fw-bold">Account</span>
                          </h2>
                          <p className="fw-400">
                            Get started for free today
                          </p>
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="mb-3">
                          <label htmlFor="username" className="form-label">
                            Username
                          </label>
                          <input
                            type="text"
                            className="form-control b-r-14"
                            placeholder="Enter Your Username"
                            id="username"
                            autoComplete="username"
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
                          <label htmlFor="email" className="form-label">
                            Email Address
                          </label>
                          <input
                            type="email"
                            className="form-control b-r-14"
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

                      <Col md={6}>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control b-r-14"
                            placeholder="Enter Your Password"
                            id="password"
                            autoComplete="new-password"
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
                            className="form-control b-r-14"
                            placeholder="Confirm Your Password"
                            id="password_confirmation"
                            autoComplete="new-password"
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
                        <div className="d-flex gap-2 align-items-center mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            {...register("terms")}
                            id="terms"
                          />

                          <label
                            className="form-check-label text-secondary"
                            htmlFor="terms"
                          >
                            Accept{" "}
                            <button
                              type="button"
                              onClick={toggleTerms}
                              className="btn btn-link p-0 border-0 color-orkelo text-decoration-underline"
                              style={{ verticalAlign: "baseline" }}
                            >
                              Terms & Conditions
                            </button>
                          </label>

                          {errors.terms && (
                            <div>
                              <small className="text-danger">
                                {errors.terms.message}
                              </small>
                            </div>
                          )}
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="mb-3">
                          <button
                            disabled={loading}
                            type="submit"
                            className="btn bg-orkelo text-white w-100 py-md-3 b-r-14"
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
                        <div className="login-switch text-center text-lg-start">
                          Already have an account?{" "}
                          <Link
                            to="/login"
                            className="color-orkelo text-decoration"
                          >
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

      <TermsModal isOpen={termsOpen} toggle={toggleTerms} />
    </div>
  );
};

export default SignUp;
