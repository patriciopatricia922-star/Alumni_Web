import "./styles/Alumni.css";
import { HiOutlineUsers } from "react-icons/hi2";
import { FaFileLines } from "react-icons/fa6";
import { useState, useEffect } from "react";

function Alumni() {
  const [alumni, setAlumni] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    active: 0,
    deactivated: 0,
  });

  useEffect(() => {
    
    fetch("http://localhost/alumni_backend/sync_from_supabase.php", {
      method: "GET",
      headers: { "x-api-key": "SUPER_SECRET_ADMIN_KEY" },
    })
      .then((res) => res.json())
      .then((syncResult) => {
        console.log("Sync result:", syncResult);

        
        return fetch("http://localhost/alumni_backend/get_alumni.php", {
          method: "GET",
          headers: { "x-api-key": "SUPER_SECRET_ADMIN_KEY" },
        });
      })
      .then((res) => res.json())
      .then((data) => {
        setAlumni(data);

        // Calculate stats dynamically from real data
        setStats({
          completed: data.filter((a) => a.survey_status === "completed").length,
          pending: data.filter((a) => a.survey_status === "pending").length,
          active: data.filter((a) => a.account_status === "active").length,
          deactivated: data.filter((a) => a.account_status === "deactivated").length,
        });
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  function updateStatus(id, newStatus) {
    fetch("http://localhost/alumni_backend/update_status.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "SUPER_SECRET_ADMIN_KEY",
      },
      body: JSON.stringify({ id, account_status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        // Update alumni list locally
        const updated = alumni.map((a) =>
          a.id === id ? { ...a, account_status: newStatus } : a
        );
        setAlumni(updated);

        // Recalculate stats after status change
        setStats({
          completed: updated.filter((a) => a.survey_status === "completed").length,
          pending: updated.filter((a) => a.survey_status === "pending").length,
          active: updated.filter((a) => a.account_status === "active").length,
          deactivated: updated.filter((a) => a.account_status === "deactivated").length,
        });
      })
      .catch((err) => console.error(err));
  }

  // Calculate percentages for stat cards
  const total = alumni.length || 1; // avoid division by zero
  const completedPct = Math.round((stats.completed / total) * 100);
  const pendingPct = Math.round((stats.pending / total) * 100);

  return (
    <div className="alumni_page">
      <div className="header">
        <h1>Alumni Module</h1>
        <p>Welcome back! Here's what's happening with alumni affairs.</p>
      </div>

      <div className="cards_row">
        <div className="card_col">
          <div className="left">
            <p className="title">Survey Completed</p>
            <FaFileLines className="stat-icon green" />
            <p className="num">{completedPct}%</p>
            <span className="update">{stats.completed} alumni</span>
          </div>
        </div>

        <div className="card_col">
          <div className="left">
            <p className="title">Survey Pending</p>
            <FaFileLines className="stat-icon orange" />
            <p className="num">{pendingPct}%</p>
            <span className="update">{stats.pending} alumni</span>
          </div>
        </div>

        <div className="card_col">
          <div className="left">
            <p className="title">Active Accounts</p>
            <HiOutlineUsers className="stat-icon blue" />
            <p className="num">{stats.active}</p>
            <span className="update">of {total} total</span>
          </div>
        </div>

        <div className="card_col">
          <div className="left">
            <p className="title">Deactivated Accounts</p>
            <HiOutlineUsers className="stat-icon red" />
            <p className="num">{stats.deactivated}</p>
            <span className="update">of {total} total</span>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <input
            type="text"
            placeholder="Search by name, email, or program..."
          />
          <div className="table-actions">
            <button>Filter</button>
            <button>Export</button>
            <button>Deactivate all inactive</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>BATCH</th>
                <th>PROGRAM</th>
                <th>EMPLOYMENT <br /> STATUS</th>
                <th>SURVEY <br /> STATUS</th>
                <th>ACCOUNT STATUS</th>
                <th>ACCOUNT ACTION</th>
              </tr>
            </thead>

            <tbody>
              {alumni.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                    No alumni records found.
                  </td>
                </tr>
              ) : (
                alumni.map((a) => (
                  <tr key={a.id}>
                    <td className="name-cell">
                      <div className="profile">
                        <div className="avatar">{a.name.charAt(0)}</div>
                        <div className="profile-info">
                          <p className="name">{a.name}</p>
                          <span className="email">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{a.batch}</td>
                    <td>{a.program}</td>
                    <td className={a.employment_status?.toLowerCase()}>
                      {a.employment_status}
                    </td>
                    <td>
                      <span className={`status-pill ${a.survey_status?.toLowerCase()}`}>
                        {a.survey_status}
                      </span>
                    </td>
                    <td>
                      <button className={`status-pill ${a.account_status?.toLowerCase()}`}>
                        {a.account_status}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`status-bor ${
                          a.account_status === "active" ? "deactivate" : "activate"
                        }`}
                        onClick={() =>
                          updateStatus(
                            a.id,
                            a.account_status === "active" ? "deactivated" : "active"
                          )
                        }
                      >
                        {a.account_status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Alumni;