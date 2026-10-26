
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "../api/axios";
import "./Signup.css";

const USER_REGEX = /^[A-Za-z][A-Za-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const REGISTERURL = "/auth/register";

function Signup() {
  const userRef = useRef(null);
  const errRef = useRef(null);

  const [name, setName] = useState("");
  const [nameFocus, setNameFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [matchPassword, setMatchPassword] = useState("");
  const [matchFocus, setMatchFocus] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Preserve the existing validation requirements.
  const validName = USER_REGEX.test(name);
  const validEmail = EMAIL_REGEX.test(email);
  const validPassword = PWD_REGEX.test(password);
  const validMatch =
    matchPassword.length > 0 && password === matchPassword;

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validName || !validEmail || !validPassword || !validMatch) {
      setErrorMsg("Please check your information and try again.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(REGISTERURL, { name, email, password });

      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      setMatchPassword("");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ??
          "Unable to create account. Please try again."
      );
      errRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const navItems = [
    { label: "Home", hash: "home" },
    { label: "Features", hash: "features" },
    { label: "About", hash: "about" },
    { label: "Blog", hash: "blog" },
  ];

  return (
    <div className="bc-signup-page">
      {/* HEADER */}
      <header className="bc-signup-header">
        <Link className="bc-signup-logo" to="/">
          <span aria-hidden="true">✦</span>
          Breadcrumbs
        </Link>

        <button
          className="bc-signup-menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          className={`bc-signup-nav ${
            menuOpen ? "bc-signup-nav-open" : ""
          }`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.hash}
              to={`/#${item.hash}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="bc-signup-header-actions">
          <Link className="bc-signup-login-button" to="/login">
            Log In
          </Link>

          <Link
            className="bc-signup-active-button"
            to="/signup"
            aria-current="page"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main className="bc-signup-main">
        <div className="bc-signup-layout">
          {/* NYC PHOTO */}
          <div className="bc-signup-photo">
            <img
              src="/assets/sunset.jpg"
              alt="New York City skyline at sunset"
            />

            <div className="bc-signup-photo-overlay">
              <span className="bc-signup-photo-label">
                YOUR NYC STORY STARTS HERE
              </span>

              <h2>
                Find your people.
                <br />
                Follow your curiosity.
              </h2>

              <p>
                New places, shared adventures, and memories worth
                keeping.
              </p>
            </div>

            <div className="bc-signup-photo-sticker">
              New City
              <br />
              New Stories ✦
            </div>
          </div>

          {/* REGISTRATION FORM */}
          <section className="bc-signup-form-panel">
            <div className="bc-signup-form-inner">
              <div className="bc-signup-intro">
                <span className="bc-signup-eyebrow">
                  WELCOME TO YOUR NEXT ADVENTURE
                </span>

                <h1>
                  Join Breadcrumbs <span>✦</span>
                </h1>

                <p>
                  Create your account and start exploring New York,
                  one breadcrumb at a time.
                </p>
              </div>

              <p
                ref={errRef}
                className={
                  errorMsg
                    ? "bc-signup-error"
                    : "bc-signup-visually-hidden"
                }
                role={errorMsg ? "alert" : undefined}
                tabIndex={-1}
              >
                {errorMsg}
              </p>

              {success ? (
                <div className="bc-signup-success" role="status">
                  <div className="bc-signup-success-icon">✓</div>
                  <h2>You're on your way!</h2>
                  <p>
                    Your account was created successfully.
                    Log in to start your NYC adventure.
                  </p>
                  <Link
                    to="/login"
                    className="bc-signup-submit bc-signup-success-link"
                  >
                    Continue to Log In →
                  </Link>
                </div>
              ) : (
                <>
                  <form
                    className="bc-signup-form"
                    onSubmit={handleSubmit}
                    noValidate
                  >
                    {/* USERNAME */}
                    <div className="bc-signup-field">
                      <label htmlFor="signup-name">
                        Username
                        {name && validName && (
                          <span className="bc-signup-valid">
                            {" "}✓
                          </span>
                        )}
                      </label>

                      <input
                        id="signup-name"
                        ref={userRef}
                        type="text"
                        value={name}
                        placeholder="Choose a username"
                        autoComplete="username"
                        required
                        aria-invalid={
                          name.length > 0 && !validName
                        }
                        aria-describedby="signup-name-info"
                        onChange={(e) => {
                          setName(e.target.value);
                          setErrorMsg("");
                        }}
                        onFocus={() => setNameFocus(true)}
                        onBlur={() => setNameFocus(false)}
                      />

                      {nameFocus && name && !validName && (
                        <p
                          id="signup-name-info"
                          className="bc-signup-hint"
                        >
                          Use 4–24 characters. Start with a letter.
                          Letters, numbers, underscores, and
                          hyphens are allowed.
                        </p>
                      )}
                    </div>

                    {/* EMAIL */}
                    <div className="bc-signup-field">
                      <label htmlFor="signup-email">
                        Email address
                        {email && validEmail && (
                          <span className="bc-signup-valid">
                            {" "}✓
                          </span>
                        )}
                      </label>

                      <input
                        id="signup-email"
                        type="email"
                        value={email}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        aria-invalid={
                          email.length > 0 && !validEmail
                        }
                        aria-describedby="signup-email-info"
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMsg("");
                        }}
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                      />

                      {emailFocus && email && !validEmail && (
                        <p
                          id="signup-email-info"
                          className="bc-signup-hint"
                        >
                          Please enter a valid email address.
                        </p>
                      )}
                    </div>

                    {/* PASSWORD */}
                    <div className="bc-signup-field">
                      <label htmlFor="signup-password">
                        Password
                        {password && validPassword && (
                          <span className="bc-signup-valid">
                            {" "}✓
                          </span>
                        )}
                      </label>

                      <div className="bc-signup-password-wrap">
                        <input
                          id="signup-password"
                          type={
                            showPassword ? "text" : "password"
                          }
                          value={password}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          required
                          aria-invalid={
                            password.length > 0 &&
                            !validPassword
                          }
                          aria-describedby="signup-password-info"
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setErrorMsg("");
                          }}
                          onFocus={() =>
                            setPasswordFocus(true)
                          }
                          onBlur={() =>
                            setPasswordFocus(false)
                          }
                        />

                        <button
                          type="button"
                          className="bc-signup-show-password"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>

                      {passwordFocus && !validPassword && (
                        <p
                          id="signup-password-info"
                          className="bc-signup-hint"
                        >
                          Use 8–24 characters with uppercase and
                          lowercase letters, a number, and one
                          of these symbols: ! @ # $ %.
                        </p>
                      )}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="bc-signup-field">
                      <label htmlFor="signup-confirm">
                        Confirm password
                        {validMatch && (
                          <span className="bc-signup-valid">
                            {" "}✓
                          </span>
                        )}
                      </label>

                      <input
                        id="signup-confirm"
                        type={
                          showPassword ? "text" : "password"
                        }
                        value={matchPassword}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        required
                        aria-invalid={
                          matchPassword.length > 0 &&
                          !validMatch
                        }
                        aria-describedby="signup-confirm-info"
                        onChange={(e) => {
                          setMatchPassword(e.target.value);
                          setErrorMsg("");
                        }}
                        onFocus={() => setMatchFocus(true)}
                        onBlur={() => setMatchFocus(false)}
                      />

                      {matchFocus &&
                        matchPassword &&
                        !validMatch && (
                          <p
                            id="signup-confirm-info"
                            className="bc-signup-hint"
                          >
                            Your passwords must match.
                          </p>
                        )}
                    </div>

                    <button
                      className="bc-signup-submit"
                      type="submit"
                      disabled={
                        submitting ||
                        !validName ||
                        !validEmail ||
                        !validPassword ||
                        !validMatch
                      }
                    >
                      {submitting
                        ? "Creating account..."
                        : "Create my account →"}
                    </button>
                  </form>

                  <div className="bc-signup-divider">
                    <span>ALREADY EXPLORING WITH US?</span>
                  </div>

                  <p className="bc-signup-login-prompt">
                    Already have an account?{" "}
                    <Link to="/login">Log In</Link>
                  </p>
                </>
              )}

              <p className="bc-signup-bottom-note">
                Made for the curious. Built for discovering NYC. ✦
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Signup;

