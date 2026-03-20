import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { supabaseAdmin } from "../lib/supabaseadmin";
import SuperAdSidebar from "../superadmin/SuperAdsidebar";
import { MdEmail } from "react-icons/md";
import { MdWork } from "react-icons/md";
import { MdAssignment } from "react-icons/md";
import { MdAccountCircle } from "react-icons/md";

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
    {
      icon: <MdEmail size={18} color="#155DFC" />,
      label: "Email Address",
      value: alumni.email || "—",
      isText: true,
    },
    {
      icon: <MdWork size={18} color="#155DFC" />,
      label: "Employment Status",
      value: alumni.employment_status || "—",
      isText: true,
    },
    {
      icon: <MdAssignment size={18} color="#155DFC" />,
      label: "Survey Status",
      value: alumni.survey_status || "—",
      isBadge: true,
    },
    {
      icon: <MdAccountCircle size={18} color="#155DFC" />,
      label: "Account Status",
      value: alumni.account_status || "—",
      isBadge: true,
    },
  ];

  return (
    <div className="apm-overlay" onClick={onClose}>
      <div className="apm-drawer" onClick={(e) => e.stopPropagation()}>

        <button className="apm-close" onClick={onClose} aria-label="Close">✕</button>

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

        <div className="apm-body">
          <p className="apm-section-title">Profile Details</p>
          <ul className="apm-details-list">
            {detailItems.map((item, i) => (
              <li key={i} className="apm-detail-item">
                <div className="apm-detail-icon-wrap">
                  {item.icon}
                </div>
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

// ─── Main ─────────────────────────────────────────────────────────────────────
function SuperAdminAlumni() {
  const navigate = useNavigate();
  const [alumni,         setAlumni]         = useState([]);
  const [search,         setSearch]         = useState("");
  const [stats,          setStats]          = useState({ completed:0, pending:0, active:0, deactivated:0 });
  const [page,           setPage]           = useState(1);
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 900);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const PER_PAGE = 5;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const calcStats = (data) => ({
    completed:   data.filter((a) => a.survey_status  === "completed").length,
    pending:     data.filter((a) => a.survey_status  === "pending").length,
    active:      data.filter((a) => a.account_status === "active").length,
    deactivated: data.filter((a) =>
      a.account_status === "deactivated" || a.account_status === "inactive"
    ).length,
  });

  // ── Supabase backend — identical logic to AlumniManagement ─────────────────
  const loadAlumni = async () => {
    try {
      const { data: users, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, email, first_name, middle_name, last_name, program, batch_year, account_status, role")
        .eq("role", "alumni");

      if (usersError) throw usersError;

      const { data: surveys, error: surveyError } = await supabaseAdmin
        .from("survey_progress")
        .select("user_id, completed, percentage, employment_information_data");

      if (surveyError) throw surveyError;

      const surveyMap = {};
      (surveys || []).forEach((s) => {
        let empData = s.employment_information_data;
        if (typeof empData === "string") {
          try { empData = JSON.parse(empData); } catch (_) { empData = {}; }
        }
        empData = empData || {};
        surveyMap[s.user_id] = {
          survey_status:     s.completed ? "completed" : "pending",
          percentage:        s.percentage ?? 0,
          employment_status: empData.employmentStatus
                          ?? empData.employment_status
                          ?? empData.status
                          ?? null,
          job_position:      empData.jobTitle
                          ?? empData.job_title
                          ?? empData.position
                          ?? empData.jobPosition
                          ?? null,
          job_company:       empData.companyName
                          ?? empData.company
                          ?? empData.employer
                          ?? null,
        };
      });

      const merged = (users || []).map((u) => {
        const survey = surveyMap[u.id] || {};
        const fullName = [u.first_name, u.middle_name, u.last_name]
          .filter(Boolean).join(" ");
        return {
          id:                u.id,
          name:              fullName,
          email:             u.email,
          program:           u.program || "—",
          batch:             u.batch_year ? String(u.batch_year) : "—",
          account_status:    u.account_status ?? "active",
          survey_status:     survey.survey_status     ?? "pending",
          percentage:        survey.percentage        ?? 0,
          employment_status: survey.employment_status ?? null,
          job_position:      survey.job_position      ?? null,
          job_company:       survey.job_company       ?? null,
        };
      });

      setAlumni(merged);
      setStats(calcStats(merged));
    } catch (e) {
      console.error("loadAlumni error:", e);
    }
  };

  useEffect(() => { loadAlumni(); }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabaseAdmin
        .from("users")
        .update({ account_status: newStatus })
        .eq("id", id);
      if (error) throw error;
      const updated = alumni.map((a) =>
        a.id === id ? { ...a, account_status: newStatus } : a
      );
      setAlumni(updated);
      setStats(calcStats(updated));
    } catch (e) {
      console.error("updateStatus error:", e);
    }
  };

  const total        = alumni.length || 1;
  const completedPct = Math.round((stats.completed / total) * 100);
  const pendingPct   = Math.round((stats.pending   / total) * 100);
  const filtered     = alumni.filter((a) =>
    [a.name, a.email, a.program].some((f) =>
      (f ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry   = Math.min(page * PER_PAGE, filtered.length);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&family=Arimo:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }

        .sam-page {
          min-height: 100vh;
          background: #F8FAFC;
          margin-left: 250px;
          padding: 37px 32px 60px;
          font-family: 'Arimo', Arial, sans-serif;
        }
        @media (max-width: 900px) {
          .sam-page { margin-left: 0 !important; padding: 20px 16px 48px; }
        }

        .am-heading-row {
          display: flex; justify-content: space-between;
          align-items: flex-start; flex-wrap: wrap; gap: 12px;
          margin-bottom: 24px;
        }
        .am-title {
          margin: 0 0 4px;
          font-family: 'Lexend', sans-serif; font-weight: 700;
          font-size: 30px; line-height: 36px; color: #101828;
        }
        .am-subtitle {
          margin: 0; font-family: 'Lexend', sans-serif;
          font-weight: 400; font-size: 16px; line-height: 24px; color: #6A7282;
        }

        .am-metrics {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 16px; margin-bottom: 24px;
        }
        @media (max-width: 1100px) { .am-metrics { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 540px)  { .am-metrics { grid-template-columns: 1fr; } }
        .am-metric-card {
          background: #fff; border: 0.889px solid #9E9E9E; border-radius: 10px;
          padding: 24px; display: flex; justify-content: space-between;
          align-items: flex-start; gap: 12px;
        }
        .am-metric-left { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .am-metric-label { font-family:'Lexend',sans-serif; font-size:14px; line-height:20px; color:#6A7282; margin:0; }
        .am-metric-value { font-family:'Lexend',sans-serif; font-weight:700; font-size:30px; line-height:36px; color:#101828; margin:0; }
        .am-metric-sub   { font-family:Arial,sans-serif; font-size:12px; line-height:16px; color:#00A63E; margin:0; }
        .am-metric-icon  { width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .am-icon-blue    { background:#EFF6FF; }
        .am-icon-orange  { background:#FFE7C7; }
        .am-icon-green   { background:#F0FDF4; }
        .am-icon-red     { background:#FFE2E2; }

        .am-table-card {
          background: #F8F9FB; border: 1px solid #E2E8F0; border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1);
          overflow: hidden;
        }

        .am-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px; padding: 16px;
          background: rgba(248,250,252,.5); border-bottom: 1px solid #E2E8F0;
        }
        .am-search-wrap { position: relative; width: 100%; max-width: 384px; }
        .am-search-wrap input {
          width:100%; height:38px; padding:8px 16px 8px 40px;
          border:1px solid #CAD5E2; border-radius:10px; background:#fff;
          outline:none; font-family:'Arimo',sans-serif; font-size:14px; color:#0F172B;
        }
        .am-search-wrap input::placeholder { color:rgba(15,23,43,.5); }
        .am-toolbar-btns { display:flex; gap:8px; flex-shrink:0; }
        .am-tb-btn {
          display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 14px;
          background:#fff; border:1px solid #CAD5E2; border-radius:10px; cursor:pointer;
          font-family:'Arimo',sans-serif; font-size:14px; color:#314158; transition:background .12s;
        }
        .am-tb-btn:hover { background:#f1f5f9; }

        .am-table-wrap { width:100%; overflow-x:auto; }
        .am-table { width:100%; border-collapse:collapse; min-width:620px; }
        .am-table thead tr { background:#F8FAFC; border-bottom:1px solid #E2E8F0; }
        .am-table th {
          padding:16px 24px; font-family:'Arimo',sans-serif; font-weight:700;
          font-size:12px; line-height:16px; letter-spacing:.6px;
          text-transform:uppercase; color:#62748E; text-align:left; white-space:nowrap;
        }
        .am-table th.tc, .am-table td.tc { text-align:center; }
        .am-table th.tr, .am-table td.tr { text-align:right; }
        .am-table tbody tr { border-bottom:1px solid #E2E8F0; transition:background .12s; }
        .am-table tbody tr:last-child { border-bottom:none; }
        .am-table tbody tr:hover { background:#f8fafc; }
        .am-table td {
          padding:0 24px; height:69px; vertical-align:middle;
          font-family:'Arimo',sans-serif; font-size:14px; color:#45556C;
        }
        .am-empty td { text-align:center; color:#90A1B9; padding:40px 0; font-style:italic; }

        .am-name-cell  { display:flex; align-items:center; gap:12px; }
        .am-avatar     { width:32px; height:32px; border-radius:50%; background:#DBEAFE; color:#155DFC; font-family:'Arimo',sans-serif; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .am-name-stack { display:flex; flex-direction:column; min-width:0; }
        .am-name       { font-size:14px; line-height:20px; color:#0F172B; font-family:'Arimo',sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .am-email      { font-size:12px; line-height:16px; color:#62748E; font-family:'Arimo',sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .am-batch      { display:inline-flex; align-items:center; padding:4px 8px; background:#F1F5F9; border-radius:4px; font-family:'Arimo',sans-serif; font-size:14px; line-height:20px; color:#314158; }

        .am-footer {
          display:flex; justify-content:space-between; align-items:center;
          flex-wrap:wrap; gap:12px; padding:0 24px; min-height:63px;
          border-top:1px solid #E2E8F0;
        }
        @media (max-width:480px) { .am-footer { padding:12px 16px; } }
        .am-footer-text { font-family:'Arimo',sans-serif; font-size:14px; line-height:20px; color:#62748E; }
        .am-pages { display:flex; align-items:center; gap:4px; flex-wrap:wrap; }
        .am-pg-btn {
          min-width:32px; height:30px; padding:0 8px;
          border:1px solid #CAD5E2; border-radius:4px; background:#fff;
          cursor:pointer; font-family:'Arimo',sans-serif; font-size:14px;
          color:#0F172B; transition:background .12s;
        }
        .am-pg-btn:hover:not(:disabled) { background:#f1f5f9; }
        .am-pg-btn:disabled { opacity:.45; cursor:default; }
        .am-pg-btn.on { background:#155DFC; color:#fff; border-color:#155DFC; }

        @media (max-width:1020px) { .am-col-program { display:none; } }
        @media (max-width:860px)  { .am-col-survey  { display:none; } }
        @media (max-width:720px)  { .am-col-account { display:none; } }
        @media (max-width:580px)  { .am-col-batch   { display:none; } .am-table { min-width:0; } }

        /* ── Alumni Profile Modal ── */
        .apm-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          animation: apm-fade-in 0.18s ease;
        }
        @keyframes apm-fade-in { from { opacity:0; } to { opacity:1; } }
        .apm-drawer {
          position: relative;
          width: 420px; max-width: 95vw; max-height: 90vh;
          background: #fff; border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          overflow-y: auto; overflow-x: hidden;
          animation: apm-slide-up 0.22s ease;
        }
        @keyframes apm-slide-up { from { transform: translateY(24px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        .apm-close {
          position: absolute; top: 14px; right: 14px; z-index: 2;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.85); border: 1px solid #E2E8F0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px; color: #62748E;
          transition: background 0.12s;
        }
        .apm-close:hover { background: #f1f5f9; }
        .apm-hero {
          position: relative; padding: 32px 24px 20px;
          background: linear-gradient(135deg, #1447E6 0%, #0F2FA3 100%);
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }
        .apm-hero-bg {
          position: absolute; inset: 0; opacity: 0.07;
          background: repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%);
          background-size: 12px 12px;
        }
        .apm-avatar-ring {
          width: 72px; height: 72px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.4);
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.15);
        }
        .apm-avatar {
          width: 60px; height: 60px; border-radius: 50%;
          background: #DBEAFE; color: #155DFC;
          font-family: 'Arimo', sans-serif; font-weight: 700; font-size: 22px;
          display: flex; align-items: center; justify-content: center;
        }
        .apm-hero-info { text-align: center; position: relative; z-index: 1; }
        .apm-name {
          margin: 0 0 4px; font-family: 'Lexend', sans-serif;
          font-weight: 700; font-size: 18px; color: #fff;
        }
        .apm-program {
          margin: 0 0 6px; font-family: 'Arimo', sans-serif;
          font-size: 13px; color: rgba(255,255,255,0.8);
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .apm-batch {
          display: inline-flex; align-items: center; padding: 2px 10px;
          background: rgba(255,255,255,0.15); border-radius: 9999px;
          font-family: 'Arimo', sans-serif; font-size: 12px; color: #fff;
        }
        .apm-body { padding: 20px 24px 28px; }
        .apm-section-title {
          font-family: 'Lexend', sans-serif; font-weight: 700;
          font-size: 12px; letter-spacing: .6px; text-transform: uppercase;
          color: #62748E; margin: 0 0 14px;
        }
        .apm-details-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .apm-detail-item { display: flex; align-items: flex-start; gap: 12px; }
        .apm-detail-icon-wrap {
          width: 36px; height: 36px; border-radius: 8px;
          background: #EFF6FF;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .apm-detail-content { display: flex; flex-direction: column; gap: 2px; padding-top: 2px; }
        .apm-detail-label { font-family: 'Arimo', sans-serif; font-size: 11px; color: #90A1B9; }
        .apm-detail-value { font-family: 'Arimo', sans-serif; font-size: 14px; color: #0F172B; word-break: break-all; }
        .apm-badge {
          display: inline-flex; align-items: center; padding: 2px 10px;
          border-radius: 9999px; font-family: 'Arimo', sans-serif;
          font-size: 12px; font-weight: 400;
        }
        .apm-badge--completed    { background: #DCFCE7; color: #008236; }
        .apm-badge--pending      { background: #FFE2E2; color: #BF0000; }
        .apm-badge--active       { background: rgba(142,201,47,0.28); color: #4C4C4C; }
        .apm-badge--inactive,
        .apm-badge--deactivated  { background: rgba(255,149,0,0.55); color: #4C4C4C; }
        .apm-row-clickable       { cursor: pointer; }
      `}</style>

      <SuperAdSidebar />

      <div className="sam-page">

        <div className="am-heading-row">
          <div>
            <h1 className="am-title">Alumni Module</h1>
            <p className="am-subtitle">View, organize, and manage alumni data and activities.</p>
          </div>
        </div>

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

        <div className="am-table-card">
          <div className="am-toolbar">
            <div className="am-search-wrap">
              <IconSearch />
              <input
                type="text"
                placeholder="Search by name, email, or program..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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

          <div className="am-footer">
            <span className="am-footer-text">
              Showing {startEntry} to {endEntry} of {filtered.length} entries
            </span>
            <div className="am-pages">
              <button className="am-pg-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
              {Array.from({length:totalPages},(_,i)=>i+1)
                .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1)
                .reduce((acc,p,idx,arr)=>{
                  if(idx>0 && p-arr[idx-1]>1)
                    acc.push(<span key={`g${p}`} style={{padding:"0 4px",color:"#90A1B9",fontSize:14}}>…</span>);
                  acc.push(
                    <button key={p} className={`am-pg-btn${p===page?" on":""}`} onClick={()=>setPage(p)}>{p}</button>
                  );
                  return acc;
                },[])}
              <button className="am-pg-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {selectedAlumni && (
        <AlumniProfileModal
          alumni={selectedAlumni}
          onClose={() => setSelectedAlumni(null)}
        />
      )}
    </>
  );
}

export default SuperAdminAlumni;