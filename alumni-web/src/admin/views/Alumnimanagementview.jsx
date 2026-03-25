import React, { useEffect } from "react";
import { MdEmail } from "react-icons/md";
import { MdWork } from "react-icons/md";
import { MdAssignment } from "react-icons/md";
import { MdAccountCircle } from "react-icons/md";
import "../styles/Alumnimanagement.css";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconUsers = ({ color = "#155DFC" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="8" r="4" stroke={color} strokeWidth="2"/>
    <path d="M19 14c1.657 0 3 1.343 3 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="17" cy="7" r="3" stroke={color} strokeWidth="2"/>
  </svg>
);
const IconSurveyDone = ({ color = "#00A63E" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M8 7h6M8 11h6M8 15h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 16l1.5 1.5L18 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconSurveyPending = ({ color = "#DF7171" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M8 7h6M8 11h6M8 15h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 14v3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="15" cy="18.5" r="0.75" fill={color}/>
  </svg>
);
const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
    style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
    <circle cx="7.5" cy="7.5" r="5.25" stroke="#90A1B9" strokeWidth="1.5"/>
    <path d="M11.5 11.5L15.5 15.5" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M4 8h8M6 12h4" stroke="#314158" strokeWidth="1.33" strokeLinecap="round"/>
  </svg>
);
const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v8M5 7l3 3 3-3" stroke="#314158" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12h12" stroke="#314158" strokeWidth="1.33" strokeLinecap="round"/>
  </svg>
);

// ─── Badges ───────────────────────────────────────────────────────────────────
function EmpBadge({ status }) {
  const s = (status ?? "").toLowerCase();
  let bg, color, label;
  if      (s === "employed")                              { bg="#DCFCE7"; color="#008236"; label="Employed"; }
  else if (s === "unemployed")                            { bg="#FFE2E2"; color="#BF0000"; label="Unemployed"; }
  else if (s === "student" || s.includes("stud"))         { bg="#DBEAFE"; color="#1447E6"; label="Student"; }
  else if (s.includes("seek") || s.includes("look"))      { bg="#FEF9C2"; color="#A65F00"; label="Seeking"; }
  else if (s.includes("further") || s.includes("study"))  { bg="#DBEAFE"; color="#1447E6"; label="Further Studies"; }
  else if (s.includes("self"))                            { bg="#DCFCE7"; color="#008236"; label="Self-Employed"; }
  else                                                    { bg="#F1F5F9"; color="#45556C"; label=status||"—"; }
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      padding:"2px 10px", borderRadius:9999, fontSize:12, lineHeight:"16px",
      fontFamily:"Arimo,sans-serif", fontWeight:400, color, background:bg, whiteSpace:"nowrap"
    }}>{label}</span>
  );
}

function SurveyBadge({ status }) {
  const done = status === "completed";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      padding:"2px 10px", borderRadius:9999, fontSize:12, lineHeight:"16px",
      fontFamily:"Arimo,sans-serif", fontWeight:400, whiteSpace:"nowrap",
      background: done ? "#DCFCE7" : "#FFE2E2",
      color:      done ? "#008236" : "#BF0000",
    }}>{done ? "Completed" : "Pending"}</span>
  );
}

function AccountBadge({ status }) {
  const active = (status ?? "active") === "active";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      padding:"2px 10px", borderRadius:9999, fontSize:12, lineHeight:"16px",
      fontFamily:"Arimo,sans-serif", fontWeight:400, whiteSpace:"nowrap",
      background: active ? "rgba(142,201,47,0.28)" : "rgba(255,149,0,0.55)",
      color:"#4C4C4C",
    }}>{active ? "Active" : "Inactive"}</span>
  );
}

// ─── Alumni Profile Modal ─────────────────────────────────────────────────────
function AlumniProfileModal({ alumni, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const getInitials = (name) =>
    (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const statusClass = (value) =>
    (value ?? "").toLowerCase().replace(/[\s-]+/g, "-");

  const detailItems = [
    { icon: <MdEmail size={18} color="#155DFC" />,       label: "Email Address",     value: alumni.email             || "—", isText: true  },
    { icon: <MdWork size={18} color="#155DFC" />,        label: "Employment Status", value: alumni.employment_status || "—", isText: true  },
    { icon: <MdAssignment size={18} color="#155DFC" />,  label: "Survey Status",     value: alumni.survey_status     || "—", isBadge: true },
    { icon: <MdAccountCircle size={18} color="#155DFC"/>, label: "Account Status",   value: alumni.account_status    || "—", isBadge: true },
  ];

  return (
    <div className="apm-overlay" onClick={onClose}>
      <div className="apm-drawer" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="apm-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Hero */}
        <div className="apm-hero">
          <div className="apm-hero-bg" aria-hidden="true" />
          <div className="apm-avatar-ring">
            <div className="apm-avatar">{getInitials(alumni.name)}</div>
          </div>
          <div className="apm-hero-info">
            <h2 className="apm-name">{alumni.name}</h2>
            <p className="apm-program">{alumni.program || "—"}</p>
            <span className="apm-batch">Batch {alumni.batch || "—"}</span>
          </div>
        </div>

        {/* Body */}
        <div className="apm-body">
          <p className="apm-section-title">Profile Details</p>
          <ul className="apm-details-list">
            {detailItems.map((item, i) => (
              <li key={i} className="apm-detail-item">
                <div className="apm-detail-icon-wrap">{item.icon}</div>
                <div className="apm-detail-content">
                  <span className="apm-detail-label">{item.label}</span>
                  {item.isBadge ? (
                    <span className={`apm-badge apm-badge--${statusClass(item.value)}`}>
                      {item.value}
                    </span>
                  ) : (
                    <span className="apm-detail-value">{item.value}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
function AlumniManagementView({
  alumni, stats, search, page, isMobile,
  selectedAlumni, completedPct, pendingPct,
  filtered, totalPages, paginated,
  startEntry, endEntry,
  setSearch, setPage, setSelectedAlumni, updateStatus,
}) {
  return (
    <div className="am-page">

      <div className="am-heading-row">
        <div>
          <h1 className="am-title">Alumni Module</h1>
          <p className="am-subtitle">Welcome bark! Here's what's happening with your alumni.</p>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="am-metrics">
        <div className="am-metric-card">
          <div className="am-metric-left">
            <p className="am-metric-label">Active Accounts</p>
            <p className="am-metric-value">{stats.active}</p>
            <p className="am-metric-sub">of {alumni.length} total</p>
          </div>
          <div className="am-metric-icon am-icon-blue"><IconUsers color="#155DFC" /></div>
        </div>
        <div className="am-metric-card">
          <div className="am-metric-left">
            <p className="am-metric-label">Inactive Accounts</p>
            <p className="am-metric-value">{stats.deactivated}</p>
            <p className="am-metric-sub">of {alumni.length} total</p>
          </div>
          <div className="am-metric-icon am-icon-orange"><IconUsers color="#FCC271" /></div>
        </div>
        <div className="am-metric-card">
          <div className="am-metric-left">
            <p className="am-metric-label">Survey Completed</p>
            <p className="am-metric-value">{completedPct}%</p>
            <p className="am-metric-sub">{stats.completed} alumni</p>
          </div>
          <div className="am-metric-icon am-icon-green"><IconSurveyDone color="#00A63E" /></div>
        </div>
        <div className="am-metric-card">
          <div className="am-metric-left">
            <p className="am-metric-label">Survey Pending</p>
            <p className="am-metric-value">{stats.pending}</p>
            <p className="am-metric-sub">{pendingPct}% of total</p>
          </div>
          <div className="am-metric-icon am-icon-red"><IconSurveyPending color="#DF7171" /></div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="am-table-card">
        <div className="am-toolbar">
          <div className="am-search-wrap">
            <IconSearch />
            <input
              type="text"
              placeholder="Search by name, email, or program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="am-toolbar-btns">
            <button className="am-tb-btn"><IconFilter /> Filter</button>
            <button className="am-tb-btn"><IconExport /> Export</button>
          </div>
        </div>

        <div className="am-table-wrap">
          <table className="am-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="am-col-batch">Batch</th>
                <th className="am-col-program">Program</th>
                <th className="tc">Employment Status</th>
                <th className="tc am-col-survey">Survey Status</th>
                <th className="tc am-col-account">Account Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr className="am-empty"><td colSpan="6">No alumni records found.</td></tr>
              ) : (
                paginated.map((a) => (
                  <tr key={a.id} className="apm-row-clickable" onClick={() => setSelectedAlumni(a)}>
                    <td>
                      <div className="am-name-cell">
                        <div className="am-avatar">{(a.name ?? "?").charAt(0).toUpperCase()}</div>
                        <div className="am-name-stack">
                          <span className="am-name">{a.name}</span>
                          <span className="am-email">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="am-col-batch">
                      {a.batch ? <span className="am-batch">{a.batch}</span> : <span style={{color:"#CBD5E1"}}>—</span>}
                    </td>
                    <td className="am-col-program">{a.program || "—"}</td>
                    <td className="tc"><EmpBadge status={a.employment_status} /></td>
                    <td className="tc am-col-survey"><SurveyBadge status={a.survey_status} /></td>
                    <td className="tc am-col-account"><AccountBadge status={a.account_status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer / Pagination ── */}
        <div className="am-footer">
          <span className="am-footer-text">
            Showing {startEntry} to {endEntry} of {filtered.length} entries
          </span>
          <div className="am-pages">
            <button className="am-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1)
                  acc.push(<span key={`g${p}`} style={{ padding:"0 4px", color:"#90A1B9", fontSize:14 }}>…</span>);
                acc.push(
                  <button key={p} className={`am-pg-btn${p === page ? " on" : ""}`} onClick={() => setPage(p)}>{p}</button>
                );
                return acc;
              }, [])}
            <button className="am-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {/* ── Profile Modal ── */}
      {selectedAlumni && (
        <AlumniProfileModal
          alumni={selectedAlumni}
          onClose={() => setSelectedAlumni(null)}
        />
      )}
    </div>
  );
}

export default AlumniManagementView;