import { useRef, useState, useEffect, useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "./context/AuthContext";
import axios from "./api/axios";
// change to match to backend later
const LOGIN_URL = "/auth";

const Login = () => {
   const { setAuth } = useContext(AuthContext);
   const userRef = useRef();
   const errRef = useRef();

   const [user, setUser] = useState("");
   const [password, setPassword] = useState("");
   const [errorMsg, setErrorMsg] = useState("");

   useEffect(() => {
      userRef.current.focus();
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();

      // connect to database

      try {
         const response = await axios.post(
            LOGIN_URL,
            JSON.stringify({ user, password }),
            {
               headers: { "Content-Type": "application/json" },
               withCredentials: true,
            },
         );
         const accessToken = response?.data?.accessToken;
         setAuth({ user, accessToken });
         setUser("");
         setPassword("");
      } catch (error) {
         if (!error?.response) {
            setErrorMsg("No Server Response");
         } else if (error.response?.status === 400) {
            setErrorMsg("Missing Username or Password");
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
            <label htmlFor="username">Username</label>
            <input
               type="text"
               id="username"
               ref={userRef}
               autoComplete="off"
               onChange={(e) => {
                  setUser(e.target.value);
                  setErrorMsg("");
               }}
               value={user}
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
                  <Link to="/Signup">Sign up</Link>;
               </span>
            </p>
         </div>
      </div>
   );
};
export default Login;
