import { useRef, useState, useEffect, useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "./context/AuthContext";
import axios from "./api/axios";

const LOGIN_URL = "/auth/login";

const Login = () => {
   const { setAuth } = useContext(AuthContext);
   const userRef = useRef();
   const errRef = useRef();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [errorMsg, setErrorMsg] = useState("");

   useEffect(() => {
      userRef.current.focus();
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         const response = await axios.post(
            LOGIN_URL,
            { email, password },
            { withCredentials: true },
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
      <div>
         <p
            ref={errRef}
            className={errorMsg ? "errmsg" : "offscreen"}
            aria-live="assertive">
            {errorMsg}
         </p>

         <h1>Log In</h1>

         <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
               type="email"
               id="email"
               ref={userRef}
               autoComplete="email"
               onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
               }}
               value={email}
               required
            />

            <label htmlFor="password">Password</label>
            <input
               type="password"
               id="password"
               onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
               }}
               value={password}
               required
            />

            <button>Log in</button>
         </form>
         <div>
            <p>
               New to Breadcrumbs?
               <span>
                  <Link to="/signup">Sign up</Link>
               </span>
            </p>
         </div>
      </div>
   );
};
export default Login;
