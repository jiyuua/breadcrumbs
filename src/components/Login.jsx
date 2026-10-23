import { useRef, useState, useEffect, useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import nycSunset from "../assets/nyc-sunset-2.jpg";
import "./Login.css";

const LOGIN_URL = "/auth/login";

const Login = () => {
   const { setAuth } = useContext(AuthContext);
   const userRef = useRef();
   const errRef = useRef();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [errorMsg, setErrorMsg] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(true);

   useEffect(() => {
      userRef.current.focus();
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();

      // connect to database

      try {
         const response = await axios.post(
            LOGIN_URL,
            { email, password },
            { withCredentials: true },
            {
               headers: { "Content-Type": "application/json" },
               withCredentials: true,
            },
         );
         setAuth({ user: response.data.user });
         setEmail("");
         setPassword("");
      } catch (error) {
         if (!error?.response) {
            setErrorMsg("No Server Response");
         } else if (error.response?.status === 400) {
            setErrorMsg("Missing Email or Password");
         } else if (error.response?.status === 401) {
            setErrorMsg("Unauthorized");
         } else {
            setErrorMsg("Login Failed");
         }
         errRef.current.focus();
      }
   };

   return (
      <main className="breadcrumbs-login">
      <section className="login-hero">
        <img
          className="hero-photo"
          src={nycSunset}
          alt="New York City skyline at sunset"
        />

        <div className="sticky-note note-explore">
          Explore<br />together
        </div>

        <div className="sticky-note note-plan">
          Plan<br />easier
        </div>

        <div className="sticky-note note-memories">
          Make<br />memories
        </div>

        <div className="hero-caption">
          Your next NYC adventure starts here ✦
        </div>
      </section>

      <section className="login-card">
        <div className="nyc-emblem" aria-hidden="true">
          ✦ NYC ✦
        </div>

        <div className="login-inner">
          <p className="login-eyebrow">WELCOME BACK TO</p>

          <h1 className="login-brand">
            Breadcrumbs <span>✦</span>
          </h1>

          <p className="login-description">
            Log in to continue planning, exploring,
            <br className="desktop-only" />
            and making memories in NYC.
          </p>

          <p
            ref={errRef}
            className={errorMsg ? "login-error" : "login-error hidden"}
            role="alert"
            tabIndex="-1"
          >
            {errorMsg}
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-input">
              <span aria-hidden="true">✉</span>
              <input
                type="email"
                ref={userRef}
                autoComplete="email"
                placeholder="Email address"
                aria-label="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                }}
                required
              />
            </label>

            <label className="login-input">
              <span aria-hidden="true">♙</span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <a href="#forgot-password">Forgot password?</a>
            </div>

            <button className="login-submit" type="submit">
              Log In <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="login-divider">
            <span />
            OR
            <span />
          </div>

          <div className="social-login">
            <button
              type="button"
              onClick={() =>
                alert("Google sign-in has not been connected yet.")
              }
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() =>
                alert("Apple sign-in has not been connected yet.")
              }
            >
              <span className="apple-icon">●</span>
              Continue with Apple
            </button>
          </div>

          <p className="signup-text">
            Don’t have an account?{" "}
            <Link to="/signup">Sign Up →</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;