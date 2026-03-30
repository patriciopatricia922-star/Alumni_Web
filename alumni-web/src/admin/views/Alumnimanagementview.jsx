import React, { useState, useEffect } from "react";
import { MdEmail } from "react-icons/md";
import { MdWork } from "react-icons/md";
import { MdAssignment } from "react-icons/md";
import { MdAccountCircle } from "react-icons/md";
import { FiFilter, FiDownload, FiSearch, FiX } from "react-icons/fi";
import AdminSidebar from "../components/AdminSidebar";
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

// ─── Badges ───────────────────────────────────────────────────────────────────
function EmpBadge({ status }) {
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
    <span className={`emp-badge ${s}`}>{label}</span>
  );
}

function SurveyBadge({ status }) {
  const done = status === "completed";
  return (
    <span className={`survey-badge ${done ? "completed" : "pending"}`}>
      {done ? "Completed" : "Pending"}
    </span>
  );
}

function AccountBadge({ status }) {
  const active = (status ?? "active") === "active";
  return (
    <span className={`account-badge ${active ? "active" : "inactive"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Filter Modal ────────────────────────────────────────────────────────────
const FilterModal = ({ filters, onApply, onClear, onClose, availablePrograms, availableBatches }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const employmentOptions = ["Employed", "Unemployed", "Student", "Seeking", "Further Studies", "Self-Employed"];
  const surveyOptions = ["Completed", "Pending"];

  const handleChange = (key, value) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({
      program: "",
      batch: "",
      employmentStatus: "",
      surveyStatus: "",
    });
    onClear();
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>Filter Alumni</h3>
          <button className="filter-modal-close" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="filter-modal-body">
          <div className="filter-group">
            <label>Program</label>
            <select value={localFilters.program} onChange={(e) => handleChange("program", e.target.value)}>
              <option value="">All Programs</option>
              {availablePrograms.map((program) => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Batch Year</label>
            <select value={localFilters.batch} onChange={(e) => handleChange("batch", e.target.value)}>
              <option value="">All Batches</option>
              {availableBatches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Employment Status</label>
            <select value={localFilters.employmentStatus} onChange={(e) => handleChange("employmentStatus", e.target.value)}>
              <option value="">All Statuses</option>
              {employmentOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Survey Status</label>
            <select value={localFilters.surveyStatus} onChange={(e) => handleChange("surveyStatus", e.target.value)}>
              <option value="">All Statuses</option>
              {surveyOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="filter-btn-clear" onClick={handleClear}>Clear All</button>
          <div className="filter-actions">
            <button className="filter-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="filter-btn-apply" onClick={handleApply}>Apply Filters</button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    { icon: <MdEmail size={18} color="#155DFC" />, label: "Email Address", value: alumni.email || "—", isText: true },
    { icon: <MdWork size={18} color="#155DFC" />, label: "Employment Status", value: alumni.employment_status || "—", isText: true },
    { icon: <MdAssignment size={18} color="#155DFC" />, label: "Survey Status", value: alumni.survey_status || "—", isBadge: true },
    { icon: <MdAccountCircle size={18} color="#155DFC" />, label: "Account Status", value: alumni.account_status || "—", isBadge: true },
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
                <div className="apm-detail-icon-wrap">{item.icon}</div>
                <div className="apm-detail-content">
                  <span className="apm-detail-label">{item.label}</span>
                  {item.isBadge ? (
                    <span className={`apm-badge apm-badge--${statusClass(item.value)}`}>
                      {item.value === "completed" ? "Completed" : item.value === "pending" ? "Pending" : item.value}
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
  setSearch, setPage, setSelectedAlumni,
  showFilter, onOpenFilter, onCloseFilter, onApplyFilters, onClearFilters,
  onExport, filters, availablePrograms, availableBatches, hasActiveFilters,
  onPrevPage, onNextPage, onGoToPage, onCloseModal,
}) {
  return (
    <div className="am-page">
      <AdminSidebar />

      <div className="am-heading-row">
        <div>
          <h1 className="am-title">Alumni Module</h1>
          <p className="am-subtitle">Welcome bark! Here's what's happening with your alumni.</p>
        </div>
      </div>

      {/* ── Export Button Row (outside the card, flex-end) ── */}
      <div className="am-export-row">
        <button className="am-export-btn" onClick={onExport}>
          <FiDownload size={14} /> Export
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="am-table-card">
        <div className="am-toolbar">
          <div className="am-search-wrap">
            <FiSearch size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="am-toolbar-btns">
            <button className={`am-tb-btn ${hasActiveFilters ? "active-filter" : ""}`} onClick={onOpenFilter}>
              <FiFilter size={14} /> Filter
              {hasActiveFilters && <span className="filter-badge" />}
            </button>
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
                      {a.batch !== "—" ? <span className="am-batch">{a.batch}</span> : <span style={{ color: "#CBD5E1" }}>—</span>}
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
            <button className="am-pg-btn" disabled={page === 1} onClick={onPrevPage}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1)
                  acc.push(<span key={`g${p}`} className="pagination-dots">…</span>);
                acc.push(
                  <button key={p} className={`am-pg-btn${p === page ? " on" : ""}`} onClick={() => onGoToPage(p)}>{p}</button>
                );
                return acc;
              }, [])}
            <button className="am-pg-btn" disabled={page === totalPages} onClick={onNextPage}>Next</button>
          </div>
        </div>
      </div>

      {/* ── Filter Modal ── */}
      {showFilter && (
        <FilterModal
          filters={filters}
          onApply={onApplyFilters}
          onClear={onClearFilters}
          onClose={onCloseFilter}
          availablePrograms={availablePrograms}
          availableBatches={availableBatches}
        />
      )}

      {/* ── Profile Modal ── */}
      {selectedAlumni && (
        <AlumniProfileModal
          alumni={selectedAlumni}
          onClose={onCloseModal}
        />
      )}
    </div>
  );
}

export default AlumniManagementView;