import { Col, Container, Row } from "reactstrap";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../../validation/auth/login.schema";
import { loginThunk } from "../../../store/auth/authSlice";
import { toastError } from "../../../utils/sweetAlert";

const Login = () => {
  const { loading, accessToken, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isSignup = location.pathname === "/signup";

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

  if (accessToken && user) return <Navigate to="/" replace />;

  const onSubmit = async (data) => {
    try {
      const res = await dispatch(loginThunk(data)).unwrap();

      navigate("/", {
        replace: true,
        state: { flash: res?.message || "Welcome" },
      });
    } catch (e) {
      const message = e?.message || e?.data?.message || "Something went wrong";
      toastError(message);
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
                        <div className="login-intro mb-5 text-center text-lg-start">
                          <h2 className="f-w-600 text-muted">
                            Welcome back To{" "}
                            <span className="color-orkelo fw-bold">Orkelo!</span>
                          </h2>
                          <p className="fw-400">
                            Log in to continue where you left off
                          </p>
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

                      <Col xs={12}>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control b-r-14"
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
                        <div className="login-options mb-3">
                          <div className="form-check mb-0">
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
                          <Link
                            to="/auth/password-reset"
                            className="color-orkelo"
                          >
                            Forgot Password ?
                          </Link>
                        </div>
                      </Col>

                      <Col xs={12}>
                        <div className="mb-3">
                          <button
                            type="submit"
                            className="btn bg-orkelo text-white w-100 py-md-3 b-r-14"
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
                        <div className="login-switch text-center text-lg-start">
                          Don&apos;t Have Your Account yet?{" "}
                          <Link
                            to="/signup"
                            className="color-orkelo text-decoration"
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
