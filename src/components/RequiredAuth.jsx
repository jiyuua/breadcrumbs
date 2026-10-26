import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router";

const RequiredAuth = () => {
   const { auth, loading } = useContext(AuthContext);
   const location = useLocation();

   // handle loading state, check for valid session
   if (loading) {
      return <p>Checking your session</p>;
   }

   // invalid session / user isn't logged, redirect to login page
   if (!auth?.user) {
      return <Navigate to="/login" replace stae={{ from: location }} />;
   }
   return <Outlet />;
};
export default RequiredAuth;
