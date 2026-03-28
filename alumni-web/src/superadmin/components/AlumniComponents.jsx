import React from "react";
import { MdEmail, MdWork, MdAssignment, MdAccountCircle } from "react-icons/md";

// SVG Icons
export const IconUsers = ({ color = "#155DFC" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="8" r="4" stroke={color} strokeWidth="2"/>
    <path d="M19 14c1.657 0 3 1.343 3 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="17" cy="7" r="3" stroke={color} strokeWidth="2"/>
  </svg>
);

export const IconSurveyDone = ({ color = "#00A63E" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M8 7h6M8 11h6M8 15h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 16l1.5 1.5L18 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconSurveyPending = ({ color = "#DF7171" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M8 7h6M8 11h6M8 15h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M15 14v3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="15" cy="18.5" r="0.75" fill={color}/>
  </svg>
);

export const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
    <circle cx="7.5" cy="7.5" r="5.25" stroke="#90A1B9" strokeWidth="1.5"/>
    <path d="M11.5 11.5L15.5 15.5" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const IconFilter = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M4 8h8M6 12h4" stroke="#314158" strokeWidth="1.33" strokeLinecap="round"/>
  </svg>
);

export const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v8M5 7l3 3 3-3" stroke="#314158" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12h12" stroke="#314158" strokeWidth="1.33" strokeLinecap="round"/>
  </svg>
);

// Badges
export const EmpBadge = ({ status }) => {
  const s = (status ?? "").toLowerCase();
  let bg, color, label;
  if (s === "employed") { bg = "#DCFCE7"; color = "#008236"; label = "Employed"; }
  else if (s === "unemployed") { bg = "#FFE2E2"; color = "#BF0000"; label = "Unemployed"; }
  else if (s === "student" || s.includes("stud")) { bg = "#DBEAFE"; color = "#1447E6"; label = "Student"; }
  else if (s.includes("seek") || s.includes("look")) { bg = "#FEF9C2"; color = "#A65F00"; label = "Seeking"; }
  else if (s.includes("further") || s.includes("study")) { bg = "#DBEAFE"; color = "#1447E6"; label = "Further Studies"; }
  else if (s.includes("self")) { bg = "#DCFCE7"; color = "#008236"; label = "Self-Employed"; }
  else { bg = "#F1F5F9"; color = "#45556C"; label = status || "—"; }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "2px 10px", borderRadius: 9999, fontSize: 12, lineHeight: "16px",
      fontFamily: "Arimo,sans-serif", fontWeight: 400, color, background: bg, whiteSpace: "nowrap"
    }}>{label}</span>
  );
};

export const SurveyBadge = ({ status }) => {
  const done = status === "completed";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "2px 10px", borderRadius: 9999, fontSize: 12, lineHeight: "16px",
      fontFamily: "Arimo,sans-serif", fontWeight: 400, whiteSpace: "nowrap",
      background: done ? "#DCFCE7" : "#FFE2E2",
      color: done ? "#008236" : "#BF0000",
    }}>{done ? "Completed" : "Pending"}</span>
  );
};

export const AccountBadge = ({ status }) => {
  const active = (status ?? "active") === "active";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "2px 10px", borderRadius: 9999, fontSize: 12, lineHeight: "16px",
      fontFamily: "Arimo,sans-serif", fontWeight: 400, whiteSpace: "nowrap",
      background: active ? "rgba(142,201,47,0.28)" : "rgba(255,149,0,0.55)",
      color: "#4C4C4C",
    }}>{active ? "Active" : "Inactive"}</span>
  );
};