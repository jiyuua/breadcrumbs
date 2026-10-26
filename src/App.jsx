
import { Routes, Route } from "react-router";
import "./App.css";

import Login from "./components/Login";
import Signup from "./components/Signup";
import LandingPage from "./LandingPage";
import Profile from "./components/Profile";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
