
import { Routes, Route } from "react-router";
import "./App.css";

import Login from "./components/Login";
import Signup from "./components/Signup";
import LandingPage from "./LandingPage";

import RequiredAuth from "./components/RequiredAuth";
import Profile from "./components/Profile";
import Archive from "./components/Archive";
import Saved from "./components/Saved";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Pages that require users to log in */}
      <Route element={<RequiredAuth />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/saved" element={<Saved />} />
      </Route>
    </Routes>
  );
}

export default App;
