import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Navbar.css";

function LandingLayout() {
  return (
    <div className="layout">
      <Navbar />
      <div className="landing_content">
        <Outlet />
      </div>
    </div>
  );
}

export default LandingLayout;
