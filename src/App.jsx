import { Navigate, Routes, Route } from "react-router";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";
function App() {
   return (
      <>
         <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
         </Routes>
      </>
   );
}

export default App;
