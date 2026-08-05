import React, { useState, useEffect } from "react";
import { MdEmail, MdWork, MdAssignment, MdAccountCircle } from "react-icons/md";
import { FiFilter, FiDownload, FiSearch, FiX, FiUpload } from "react-icons/fi";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AlumniManagement.css";

// ============================================================================
// SVG ICONS - Used for metric cards (preserved from your version)
// ============================================================================
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

// ============================================================================
// BADGE COMPONENTS
// ============================================================================
function EmpBadge({ status }) {
  const s = (status ?? "").toLowerCase();
  let bg, color, label;

  if (s === "employed") {
    bg = "#DCFCE7"; color = "#008236"; label = "Employed";
  } else if (s === "unemployed") {
    bg = "#FFE2E2"; color = "#BF0000"; label = "Unemployed";
  } else if (s === "student" || s.includes("stud")) {
    bg = "#DBEAFE"; color = "#1447E6"; label = "Student";
  } else if (s.includes("seek") || s.includes("look")) {
    bg = "#FEF9C2"; color = "#A65F00"; label = "Seeking";
  } else if (s.includes("further") || s.includes("study")) {
    bg = "#DBEAFE"; color = "#1447E6"; label = "Further Studies";
  } else if (s.includes("self")) {
    bg = "#DCFCE7"; color = "#008236"; label = "Self-Employed";
  } else {
    bg = "#F1F5F9"; color = "#45556C"; label = status || "—";
  }

  return (
    <span className={`emp-badge ${s}`} style={{ background: bg, color }}>
      {label}
    </span>
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

// ============================================================================
// FILTER MODAL
// ============================================================================
const FilterModal = ({
  filters,
  onApply,
  onClear,
  onClose,
  availablePrograms,
  availableBatches,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const employmentOptions = [
    "Employed",
    "Unemployed",
    "Student",
    "Seeking",
    "Further Studies",
    "Self-Employed",
  ];
  const surveyOptions = ["Completed", "Pending"];

  // Functional state update — safer for batched updates (your version)
  const handleChange = (key, value) =>
    setLocalFilters((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => onApply(localFilters);

  const handleClear = () => {
    setLocalFilters({
      program: "",
      batch: "",
      employmentStatus: "",
      surveyStatus: "",
      sortOrder: "",
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
            <select
              value={localFilters.program}
              onChange={(e) => handleChange("program", e.target.value)}
            >
              <option value="">All Programs</option>
              {availablePrograms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Batch Year</label>
            <select
              value={localFilters.batch}
              onChange={(e) => handleChange("batch", e.target.value)}
            >
              <option value="">All Batches</option>
              {availableBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Employment Status</label>
            <select
              value={localFilters.employmentStatus}
              onChange={(e) => handleChange("employmentStatus", e.target.value)}
            >
              <option value="">All Statuses</option>
              {employmentOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Survey Status</label>
            <select
              value={localFilters.surveyStatus}
              onChange={(e) => handleChange("surveyStatus", e.target.value)}
            >
              <option value="">All Statuses</option>
              {surveyOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by Name</label>
            <select
              value={localFilters.sortOrder}
              onChange={(e) => handleChange("sortOrder", e.target.value)}
            >
              <option value="">No Sorting</option>
              <option value="A-Z">A → Z</option>
              <option value="Z-A">Z → A</option>
            </select>
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="filter-btn-clear" onClick={handleClear}>
            Clear All
          </button>
          <div className="filter-actions">
            <button className="filter-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="filter-btn-apply" onClick={handleApply}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// UPLOAD CSV MODAL
// ============================================================================
// Upload logic uses auth.admin.createUser (your version) so that the
// auth.users FK constraint is satisfied before inserting the public profile
// row. On auth creation failure the row is skipped; on insert failure the
// orphaned auth user is deleted (rolled back).
// All UI structure, styling, and column hints are preserved from your version.
// ============================================================================
function UploadCSVModal({ onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { headers: [], rows: [] };

    const hdrs = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map((line) => {
      const values = [];
      let cur = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuote = !inQuote;
        } else if (line[i] === "," && !inQuote) {
          values.push(cur.trim());
          cur = "";
        } else {
          cur += line[i];
        }
      }
      values.push(cur.trim());
      const obj = {};
      hdrs.forEach((h, idx) => { obj[h] = values[idx] ?? ""; });
      return obj;
    });

    return { headers: hdrs, rows };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const { headers: hdrs, rows } = parseCSV(evt.target.result);
      setHeaders(hdrs);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const normalizeKey = (k) => k.toLowerCase().replace(/[\s_-]+/g, "_");

  // `id` is intentionally omitted — auth.admin.createUser owns the UUID.
  const mapRow = (row) => {
    const n = {};
    Object.entries(row).forEach(([k, v]) => { n[normalizeKey(k)] = v; });
    return {
      email:          n.email          ?? n.email_address ?? "",
      first_name:     n.first_name     ?? n.firstname     ?? n.first  ?? "",
      middle_name:    n.middle_name    ?? n.middlename    ?? n.middle ?? "",
      last_name:      n.last_name      ?? n.lastname      ?? n.last   ?? "",
      program:        n.program        ?? n.course        ?? n.degree ?? "",
      batch_year:     n.batch_year     ?? n.batch         ?? n.year   ?? null,
      account_status: n.account_status ?? n.status        ?? "active",
      role:           "alumni",
    };
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setResult(null);

    try {
      const text = await selectedFile.text();
      const { rows } = parseCSV(text);
      // const { supabaseAdmin } = await import("../../../backend/supabaseAdmin");

      // let inserted = 0;
      // let skipped = 0;
      // const errors = [];

      // for (const row of rows) {
      //   const mapped = mapRow(row);
      //   if (!mapped.email) { skipped++; continue; }

      //   // Skip if a public users record already exists for this email.
      //   const { data: existing } = await supabaseAdmin
      //     .from("users")
      //     .select("id")
      //     .eq("email", mapped.email)
      //     .maybeSingle();

      //   if (existing) { skipped++; continue; }

      //   if (mapped.batch_year) {
      //     const parsed = parseInt(mapped.batch_year, 10);
      //     mapped.batch_year = isNaN(parsed) ? null : parsed;
      //   } else {
      //     mapped.batch_year = null;
      //   }

      //   // Create the auth.users record first so the FK constraint is satisfied,
      //   // then insert the public profile row using the UUID Supabase returns.
      //   const { data: authData, error: authError } =
      //     await supabaseAdmin.auth.admin.createUser({
      //       email: mapped.email,
      //       // Random password — alumni reset via "Forgot password" on first login.
      //       password: crypto.randomUUID(),
      //       email_confirm: true,
      //     });

      //   if (authError) {
      //     errors.push({ email: mapped.email, message: authError.message });
      //     continue;
      //   }

      //   const authId = authData.user.id;

      //   const { error: insertError } = await supabaseAdmin
      //     .from("users")
      //     .insert([{ id: authId, ...mapped }]);

      //   if (insertError) {
      //     // Roll back the auth user to avoid orphaned auth records.
      //     await supabaseAdmin.auth.admin.deleteUser(authId);
      //     errors.push({ email: mapped.email, message: insertError.message });
      //   } else {
      //     inserted++;
      //   }
      // }

      // setResult({ inserted, skipped, errors });

      const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/api`;
      const mappedRows = rows.map(mapRow).filter((r) => r.email);
      const res = await fetch(`${API_BASE}/admin/alumni/bulk-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: mappedRows }),
      });

      if (!res.ok) throw new Error("Bulk upload failed");
      const result = await res.json();
      setResult(result);
      if (inserted > 0) onSuccess();
    } catch (e) {
      setResult({
        inserted: 0,
        skipped: 0,
        errors: [{ email: "—", message: e.message }],
      });
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview([]);
    setHeaders([]);
    setResult(null);
  };

  return (
    <div className="apm-overlay" onClick={onClose}>
      <div
        className="apm-drawer"
        style={{ width: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="apm-close" onClick={onClose} aria-label="Close">✕</button>

        <div
          style={{
            padding: "28px 28px 20px",
            background: "#1E293B",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: "Lexend",
              fontWeight: 700,
              fontSize: 18,
              color: "#fff",
            }}
          >
            Upload Alumni CSV
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "Arimo",
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Import new alumni records.
          </p>
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 20,
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                fontFamily: "Lexend",
                fontSize: 12,
                fontWeight: 700,
                color: "#62748E",
                textTransform: "uppercase",
                letterSpacing: ".5px",
              }}
            >
              Expected CSV Columns
            </p>
            {/* Column hints rendered via .map() loop (your version — DRY) */}
            <p
              style={{
                margin: 0,
                fontFamily: "Arimo",
                fontSize: 12,
                color: "#45556C",
                lineHeight: "20px",
              }}
            >
              {[
                "email",
                "first_name",
                "middle_name",
                "last_name",
                "program",
                "batch_year",
              ].map((col, i, arr) => (
                <React.Fragment key={col}>
                  <code
                    style={{
                      background: "#E2E8F0",
                      padding: "1px 5px",
                      borderRadius: 4,
                    }}
                  >
                    {col}
                  </code>
                  {i < arr.length - 1 && ", "}
                </React.Fragment>
              ))}
            </p>
          </div>

          {!result && (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: "2px dashed #CAD5E2",
                borderRadius: 12,
                padding: "28px 20px",
                cursor: "pointer",
                background: selectedFile ? "#F0FDF4" : "#F8FAFC",
                borderColor: selectedFile ? "#86EFAC" : "#CAD5E2",
                transition: "all .15s",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 4v16M10 10l6-6 6 6"
                  stroke={selectedFile ? "#008236" : "#90A1B9"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 24h20"
                  stroke={selectedFile ? "#008236" : "#90A1B9"}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: "Arimo",
                  fontSize: 14,
                  color: selectedFile ? "#008236" : "#62748E",
                }}
              >
                {selectedFile ? `✓ ${selectedFile.name}` : "Click to choose a CSV file"}
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          )}

          {preview.length > 0 && !result && (
            <div style={{ marginTop: 20 }}>
              <p
                style={{
                  margin: "0 0 8px",
                  fontFamily: "Lexend",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#62748E",
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Preview (first {preview.length} rows)
              </p>
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 400,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {headers.map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            fontFamily: "Arimo",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#62748E",
                            textTransform: "uppercase",
                            letterSpacing: ".5px",
                            whiteSpace: "nowrap",
                            borderBottom: "1px solid #E2E8F0",
                            textAlign: "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom:
                            i < preview.length - 1 ? "1px solid #E2E8F0" : "none",
                        }}
                      >
                        {headers.map((h) => (
                          <td
                            key={h}
                            style={{
                              padding: "8px 12px",
                              fontFamily: "Arimo",
                              fontSize: 12,
                              color: "#45556C",
                              whiteSpace: "nowrap",
                              maxWidth: 120,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {row[h] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  background: result.inserted > 0 ? "#F0FDF4" : "#FFF7ED",
                  border: `1px solid ${result.inserted > 0 ? "#86EFAC" : "#FED7AA"}`,
                  borderRadius: 10,
                  padding: "16px 18px",
                  marginBottom: 14,
                }}
              >
                <p
                  style={{
                    margin: "0 0 6px",
                    fontFamily: "Lexend",
                    fontSize: 14,
                    fontWeight: 700,
                    color: result.inserted > 0 ? "#008236" : "#92400E",
                  }}
                >
                  {result.inserted > 0 ? "✓ Upload Complete" : "Upload Finished"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Arimo",
                    fontSize: 13,
                    color: "#45556C",
                    lineHeight: "22px",
                  }}
                >
                  <strong>{result.inserted}</strong> record
                  {result.inserted !== 1 ? "s" : ""} inserted &nbsp;·&nbsp;
                  <strong>{result.skipped}</strong> skipped (already exist or
                  missing email)
                </p>
              </div>

              {result.errors.length > 0 && (
                <div
                  style={{
                    background: "#FFF1F2",
                    border: "1px solid #FECDD3",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "Lexend",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#BF0000",
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                    }}
                  >
                    Errors ({result.errors.length})
                  </p>
                  <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                    {result.errors.map((err, i) => (
                      <li
                        key={i}
                        style={{
                          fontFamily: "Arimo",
                          fontSize: 12,
                          color: "#BF0000",
                          marginBottom: 4,
                        }}
                      >
                        <strong>{err.email}</strong>: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 24,
            }}
          >
            {result ? (
              <>
                <button className="am-tb-btn" onClick={reset}>
                  Upload Another
                </button>
                <button
                  className="am-tb-btn"
                  style={{
                    background: "#155DFC",
                    color: "#fff",
                    borderColor: "#155DFC",
                  }}
                  onClick={onClose}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  className="am-tb-btn"
                  onClick={onClose}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  className="am-tb-btn"
                  style={{
                    background: uploading ? "#93AEFA" : "#155DFC",
                    color: "#fff",
                    borderColor: uploading ? "#93AEFA" : "#155DFC",
                    cursor: uploading ? "not-allowed" : "pointer",
                  }}
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? "Uploading…" : "Upload"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ALUMNI PROFILE MODAL
// ============================================================================
// alumniType prop — conditionally swaps the Employment Status label when
// alumniType === 'shs'. The label value "dqpaalam" is a placeholder from
// friend's code; replace with the final SHS-appropriate label when ready.
// ============================================================================
function AlumniProfileModal({ alumni, onClose, alumniType }) {
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
    (name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

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
      // SHS alumni use a different label — replace placeholder when finalised
      label: alumniType === "shs" ? "dqpaalam" : "Employment Status",
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
        <button className="apm-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

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
                    <span
                      className={`apm-badge apm-badge--${statusClass(item.value)}`}
                    >
                      {item.value === "completed"
                        ? "Completed"
                        : item.value === "pending"
                        ? "Pending"
                        : item.value}
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

// ============================================================================
// MAIN VIEW COMPONENT
// ============================================================================
// Layout and toolbar placement preserved from your version.
// alumniType drives the subtitle text only. Both college and SHS render the
// same fully-functional table — the controller partitions alumni by cohort
// before passing props, so no branching is needed here.
// ============================================================================
function AlumniManagementView({
  alumni,
  stats,
  search,
  page,
  isMobile,
  selectedAlumni,
  completedPct,
  pendingPct,
  filtered,
  totalPages,
  paginated,
  startEntry,
  endEntry,
  setSearch,
  setPage,
  setSelectedAlumni,
  updateStatus,
  showFilter,
  showUploadModal,
  onOpenFilter,
  onCloseFilter,
  onOpenUploadModal,
  onCloseUploadModal,
  onUploadSuccess,
  onApplyFilters,
  onClearFilters,
  onExport,
  filters,
  availablePrograms,
  availableBatches,
  hasActiveFilters,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onCloseModal,
  alumniType,
}) {
  return (
    <div className="am-page">
      <AdminSidebar />

      <div className="am-heading-row">
        <div>
          <h1 className="am-title">Alumni Management</h1>
          <p className="am-subtitle">
            {alumniType === "shs"
              ? "Monitor and manage SHS alumni data."
              : "Monitor and manage alumni data."}
          </p>
        </div>
      </div>

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
            <button className="am-tb-btn" onClick={onOpenUploadModal}>
              <FiUpload size={14} /> Upload CSV
            </button>
            <button
              className={`am-tb-btn ${hasActiveFilters ? "active-filter" : ""}`}
              onClick={onOpenFilter}
            >
              <FiFilter size={14} /> Filter
              {hasActiveFilters && <span className="filter-badge" />}
            </button>
            <button
              className="am-tb-btn"
              onClick={onExport}
              style={{ background: "#4FA3F7", color: "#fff", borderColor: "#4FA3F7" }}
            >
              <FiDownload size={14} /> Export
            </button>
          </div>
        </div>

        <div className="am-table-wrap">
          <table className="am-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Name</th>
                <th className="am-col-batch">Batch</th>
                <th className="am-col-program">Program</th>
                <th className="tc">Employment Status</th>
                <th className="tc am-col-survey">Survey Status</th>
                <th className="tc am-col-account">Account Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr className="am-empty">
                  <td colSpan="6">No alumni records found.</td>
                </tr>
              ) : (
                paginated.map((a) => (
                  <tr
                    key={a.id}
                    className="apm-row-clickable"
                    onClick={() => setSelectedAlumni(a)}
                  >
                    <td>
                      <div className="am-name-cell">
                        <div className="am-avatar">
                          {(a.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="am-name-stack">
                          <span className="am-name">{a.name}</span>
                          <span className="am-email">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="am-col-batch">
                      {a.batch !== "—" ? (
                        <span className="am-batch">{a.batch}</span>
                      ) : (
                        <span style={{ color: "#CBD5E1" }}>—</span>
                      )}
                    </td>
                    <td className="am-col-program">{a.program || "—"}</td>
                    <td className="tc">
                      <EmpBadge status={a.employment_status} />
                    </td>
                    <td className="tc am-col-survey">
                      <SurveyBadge status={a.survey_status} />
                    </td>
                    <td className="tc am-col-account">
                      <AccountBadge status={a.account_status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="am-footer">
          <span className="am-footer-text">
            Showing {startEntry} to {endEntry} of {filtered.length} entries
          </span>
          <div className="am-pages">
            <button
              className="am-pg-btn"
              disabled={page === 1}
              onClick={onPrevPage}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - page) <= 1
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push(
                    <span key={`g${p}`} className="pagination-dots">
                      …
                    </span>
                  );
                }
                acc.push(
                  <button
                    key={p}
                    className={`am-pg-btn${p === page ? " on" : ""}`}
                    onClick={() => onGoToPage(p)}
                  >
                    {p}
                  </button>
                );
                return acc;
              }, [])}
            <button
              className="am-pg-btn"
              disabled={page === totalPages}
              onClick={onNextPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
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

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <UploadCSVModal
          onClose={onCloseUploadModal}
          onSuccess={onUploadSuccess}
        />
      )}

      {/* Profile Modal — alumniType forwarded for label swap */}
      {selectedAlumni && (
        <AlumniProfileModal
          alumni={selectedAlumni}
          onClose={onCloseModal}
          alumniType={alumniType}
        />
      )}
    </div>
  );
}

export default AlumniManagementView;