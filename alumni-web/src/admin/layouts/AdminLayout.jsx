import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/admin.css";

function AdminLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
