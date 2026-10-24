import { useRef, useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "../api/axios";

const USER_REGEX = /^[A-Za-z][A-Za-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTERURL = "/auth/register";

const Signup = () => {
   const userRef = useRef();
   const errRef = useRef();

   const [name, setName] = useState("");
   const [nameFocus, setNameFocus] = useState(false);

   const [email, setEmail] = useState("");
   const [emailFocus, setEmailFocus] = useState(false);

   const [password, setPassword] = useState("");
   const [passwordFocus, setPasswordFocus] = useState(false);

   const [matchPassword, setMatchPassword] = useState("");
   const [matchFocus, setMatchFocus] = useState(false);

   const [errorMsg, setErrorMsg] = useState("");
   const [success, setSuccess] = useState(false);

   // validate name and email
   const validName = USER_REGEX.test(name);
   const validEmail = EMAIL_REGEX.test(email);
   // validate password and match
   const validPassword = PWD_REGEX.test(password);
   const validMatch = password === matchPassword;

   useEffect(() => {
      userRef.current.focus();
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validName || !validEmail || !validPassword || !validMatch) {
         setErrorMsg("Invalid Entry");
         return;
      }

      try {
         await axios.post(REGISTERURL, { name, email, password });
         setSuccess(true);

         // clear fields after submit
         setName("");
         setEmail("");
         setPassword("");
         setMatchPassword("");
      } catch (error) {
         setErrorMsg(
            error.response?.data?.message ??
               "Unable to create account. Please try again.",
         );
         errRef.current.focus();
      }
   };

   return (
      <section>
         <p
            ref={errRef}
            className={errorMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
            tabIndex={-1}>
            {errorMsg}
         </p>

         <h1>Sign up</h1>
         {success ? (
            <div>
               <p role="status">Account created successfully!</p>
               <Link to="/login">Login</Link>
            </div>
         ) : (
            <>
               <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="form-div">
                     <label htmlFor="name">
                        Name
                        <span className={validName ? "valid" : "hide"}>✔️</span>
                        <span className={validName || !name ? "hide" : "invalid"}>
                           ❌
                        </span>
                     </label>
                     <input
                        type="text"
                        id="name"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => {
                           setName(e.target.value);
                           setErrorMsg("");
                        }}
                        required
                        aria-invalid={name.length > 0 && !validName}
                        aria-describedby="nameinfo"
                        onFocus={() => setNameFocus(true)}
                        onBlur={() => setNameFocus(false)}
                     />
                     <p
                        id="nameinfo"
                        className={
                           nameFocus && name && !validName ? "instructions" : "offscreen"
                        }>
                        At least 4 characters and must begin with a letter.
                        <br />
                        Letters, numbers, underscores, hyphens allowed.
                     </p>

                     {/* Email */}
                     <label htmlFor="email">
                        Email <span className={validEmail ? "valid" : "hide"}>✔️</span>
                        <span className={validEmail || !email ? "hide" : "invalid"}>
                           ❌
                        </span>
                     </label>
                     <input
                        type="email"
                        id="email"
                        autoComplete="email"
                        onChange={(e) => {
                           setEmail(e.target.value);
                           setErrorMsg("");
                        }}
                        required
                        aria-invalid={email.length > 0 && !validEmail}
                        aria-describedby="emailinfo"
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                     />

                     <p
                        id="emailinfo"
                        className={
                           emailFocus && email && !validEmail
                              ? "instructions"
                              : "offscreen"
                        }>
                        Email should follow username@domain.tld format
                     </p>

                     {/* Password  */}
                     <label htmlFor="password">
                        Password
                        <span className={validPassword ? "valid" : "hide"}>✔️</span>
                        <span className={validPassword || !password ? "hide" : "invalid"}>
                           ❌
                        </span>
                     </label>
                     <input
                        type="password"
                        id="password"
                        onChange={(e) => {
                           setPassword(e.target.value);
                           setErrorMsg("");
                        }}
                        required
                        aria-invalid={password.length > 0 && !validPassword}
                        aria-describedby="passwordinfo"
                        onFocus={() => setPasswordFocus(true)}
                        onBlur={() => setPasswordFocus(false)}
                     />

                     <p
                        id="passwordinfo"
                        className={
                           passwordFocus && !validPassword ? "instructions" : "offscreen"
                        }>
                        At least 8 characters long and must include uppercase and
                        lowercase letters, a number and a special character.
                        <br />
                        Allowed special characters:{" "}
                        <span aria-label="exclamation mark">!</span>
                        <span aria-label="at symbol">@</span>{" "}
                        <span aria-label="hashtag">#</span>{" "}
                        <span aria-label="dollar sign">$</span>{" "}
                        <span aria-label="percent">%</span>
                     </p>

                     {/* Matching Password */}
                     <label htmlFor="confirm_password">
                        Confirm Password
                        <span className={validMatch && matchPassword ? "valid" : "hide"}>
                           ✔️
                        </span>
                        <span
                           className={validMatch || !matchPassword ? "hide" : "invalid"}>
                           ❌
                        </span>
                     </label>
                     <input
                        type="password"
                        id="confirm_password"
                        onChange={(e) => {
                           setMatchPassword(e.target.value);
                           setErrorMsg("");
                        }}
                        required
                        aria-invalid={matchPassword.length > 0 && !validMatch}
                        aria-describedby="matchinfo"
                        onFocus={() => setMatchFocus(true)}
                        onBlur={() => setMatchFocus(false)}
                     />
                     <p
                        id="matchinfo"
                        className={
                           matchFocus && !validMatch ? "instructions" : "offscreen"
                        }>
                        Please match inputted password.
                     </p>

                     {/* signup button is disabled until requirements are met*/}
                     <button
                        disabled={
                           !validName || !validEmail || !validPassword || !validMatch
                              ? true
                              : false
                        }>
                        Sign up
                     </button>
                  </div>
               </form>
               <div>
                  <p>
                     Already have an account?
                     <span>
                        <Link to="/login">Login</Link>
                     </span>
                  </p>
               </div>
            </>
         )}
      </section>
   );
};
export default Signup;
