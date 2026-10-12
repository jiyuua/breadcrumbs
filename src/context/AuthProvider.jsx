import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axios from "../api/axios";

const AuthProvider = ({ children }) => {
   const [auth, setAuth] = useState(null);
   const [loading, setLoading] = useState(true);

   // call api to check if session cookie belongs to logged in user
   // (restoring previous session when page is refreshed)
   useEffect(() => {
      axios
         .get("/auth/me", { withCredentials: true })
         .then(({ data }) => setAuth({ user: data.user }))
         // later: consider error if there is server failure - currently all failures = logged out
         .catch(() => setAuth(null))
         .finally(() => setLoading(false));
   }, []);

   return (
      <AuthContext.Provider value={{ auth, setAuth, loading }}>
         {children}
      </AuthContext.Provider>
   );
};

export default AuthProvider;
