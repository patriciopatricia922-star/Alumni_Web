// ============================================================================
// Purpose: Renders all visual components with combined enhancements:
//          - PDF export with batch/program filtering (friend)
//          - Scrollable table body (friend)
//          - Functional pagination (mine, preserved)
//          - CSV export (mine, preserved)
//          - Response modal with all 7 sections including Job Experience (friend)
//
// FIX: ChartWithResponsiveContainer — guards against negative dimensions
//      during export modal state changes to prevent Recharts warnings and
//      cascading render cycles that degrade export performance.
// ============================================================================

import React, { useRef, useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import '../styles/ResponseAnalytics.css';
import { exportSurveyPDF } from '../../utils/exportPDF';

// ============================ CONSTANTS ============================
const PAGE_SIZE = 10;

// ============================ ICONS ============================
const IconExport = ({ color = "#314158" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v8M5 7l3 3 3-3" stroke={color} strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12h12" stroke={color} strokeWidth="1.33" strokeLinecap="round"/>
  </svg>
);

// ============================ COLORS ============================
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// ============================ EXPORT UTILITIES ============================

/**
 * CSV Export — converts respondents array to CSV and triggers browser download.
 * Preserved from original implementation.
 */
const exportToCSV = (data, filename = 'survey-responses') => {
  if (!data || data.length === 0) return;

  const headers = Array.from(
    data.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  const escapeCell = (value) => {
    if (value === null || value === undefined) return '""';
    const str = Array.isArray(value) ? value.join('; ') : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.map(escapeCell).join(','),
    ...data.map((row) =>
      headers.map((h) => escapeCell(row[h])).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ============================ CHART WITH RESIZE OBSERVER ============================
// FIX: Guards against negative/zero container dimensions during DOM transitions
// (e.g., export modal open/close, tab switches). Prevents Recharts from receiving
// width=-1 / height=-1 which triggers console warnings and unnecessary re-renders.
const ChartWithResponsiveContainer = ({ children, height = 190 }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        // Only accept valid positive widths — reject -1, 0, or NaN
        // that occur during layout shifts (export modal, tab changes).
        if (w > 0) {
          setContainerWidth(w);
        }
      }
    };

    // Initial update
    updateWidth();

    // Use ResizeObserver to detect size changes
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });
    resizeObserver.observe(containerRef.current);

    // Also listen for window resize
    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Show placeholder while width is unavailable or invalid.
  // Changed from `=== 0` to `<= 0` to catch all invalid states
  // including the transient -1 that occurs during export modal rendering.
  if (containerWidth <= 0) {
    return (
      <div ref={containerRef} style={{ height: `${height}px`, width: '100%' }}>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#94A3B8', fontSize: '12px' }}>Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

// ============================ RESPONSE MODAL ============================
// INTEGRATION: Merged friend's expanded modal with all 7 sections including
// Section 5 (Job Experience) and Section 7 (Feedback & Alumni Engagement).
const ResponseModal = ({ data, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

  const StarDisplay = ({ rating }) => (
    <span style={{ color: "#F59E0B", fontSize: "15px", letterSpacing: 2 }}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
      <strong style={{ color: "#374151", fontSize: 12, marginLeft: 6 }}>{rating}/5</strong>
    </span>
  );

  const Badge = ({ text, color = "blue" }) => {
    const colors = {
      blue: { bg: "#dbeafe", text: "#1d4ed8" },
      purple: { bg: "#f3e8ff", text: "#6d28d9" },
      green: { bg: "#dcfce7", text: "#166534" },
      amber: { bg: "#fef3c7", text: "#92400e" },
      red: { bg: "#fee2e2", text: "#991b1b" },
      cyan: { bg: "#cffafe", text: "#0e7490" },
      orange: { bg: "#ffedd5", text: "#9a3412" },
    };
    const c = colors[color] || colors.blue;
    return (
      <span style={{
        background: c.bg, color: c.text,
        padding: "3px 10px", borderRadius: 20,
        fontSize: 11, fontWeight: 600, display: "inline-block"
      }}>{text}</span>
    );
  };

  const Field = ({ label, value }) => (
    <div style={{ background: "#fff5e7", padding: "10px", borderRadius: 8, fontSize: 13 }}>
      <span style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 3 }}>{label}</span>
      <strong style={{ color: "#111827" }}>{value || "N/A"}</strong>
    </div>
  );

  const SectionHeader = ({ title, color }) => (
    <h3 style={{
      borderLeft: `3px solid ${color}`, paddingLeft: 8,
      fontSize: 13, fontWeight: 700, color: "#1f2937",
      margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: 0.5
    }}>{title}</h3>
  );

  const FullBlock = ({ label, children }) => (
    <div style={{ background: "#fff5e7", padding: "10px 12px", borderRadius: 8, fontSize: 13 }}>
      <span style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{label}</span>
      {children}
    </div>
  );

  const completeAddress = [data.streetAddress, data.city, data.province, data.zipCode, data.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="ra-modal-overlay" onClick={onClose}>
      <div className="ra-modal-card wide" onClick={(e) => e.stopPropagation()}>
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "#fff", borderBottom: "1px solid #e5e7eb",
          padding: "16px 24px", borderRadius: "14px 14px 0 0"
        }}>
          <button className="ra-modal-close" onClick={onClose}>✕</button>
          <h2 style={{ margin: 0, fontSize: 17, color: "#1f2937" }}>{data.name}</h2>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
            {data.email && <span>{data.email} • </span>}
            Batch {data.batch}
          </p>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto", flex: 1 }}>
          {/* Section 1: Personal Information */}
          <div>
            <SectionHeader title="Section 1 — Personal Information" color="#3B82F6" />
            <div className="ra-grid" style={{ marginBottom: 10 }}>
              <Field label="Student Number" value={data.studentNumber} />
              <Field label="Gender" value={data.gender} />
              <Field label="Birthday" value={data.birthday} />
              <Field label="Civil Status" value={data.civilStatus} />
              <Field label="Contact Number" value={data.contact} />
              <Field label="Personal Email Address" value={data.email} />
            </div>
            <FullBlock label="Complete Address">
              <strong style={{ color: "#111827" }}>{completeAddress || "N/A"}</strong>
            </FullBlock>
          </div>

          {/* Section 2: Educational Background */}
          <div>
            <SectionHeader title="Section 2 — Educational Background" color="#10B981" />
            <div style={{ marginBottom: 10 }}>
              <FullBlock label="Degree Program Completed">
              <strong>{data.program}</strong>
              {data.programOther && <span style={{ display: "block", marginTop: 4, color: "#6b7280", fontSize: 12 }}>Specified: {data.programOther}</span>}
              </FullBlock>
            </div>
            <div style={{ marginBottom: 10 }}>
              <FullBlock label="Reason(s) for Taking the Course">
              <span style={{ color: "#374151", lineHeight: 1.6 }}>{data.reasonTakingCourse || "N/A"}</span>
            </FullBlock>
            </div>
            <div className="ra-grid" style={{ marginBottom: 10 }}>
              <Field label="Year Graduated" value={data.batch} />
              <Field label="Distinction Received" value={data.distinction} />
              <Field label="Plans for Post-Graduate Studies" value={data.postGradPlans} />
              {data.postGradPlans === "Yes" && <Field label="Post-Graduate Course" value={data.postGradCourse} />}
            </div>
          </div>

          {/* Section 3: Certification Achievements */}
          <div>
            <SectionHeader title="Section 3 — Certification Achievements" color="#F59E0B" />
            <div className="ra-grid" style={{ marginBottom: 10 }}>
              <Field label="Certiport Passer" value={data.certiportPasser} />
              <Field label="Certifications Helped in Career" value={data.certificationUseful || "N/A"} />
            </div>
            <FullBlock label="Certiport Certifications Earned">
              {data.certifications && data.certifications.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {data.certifications.map((c, i) => <Badge key={i} text={c} color="blue" />)}
                </div>
              ) : <span style={{ color: "#9ca3af" }}>None</span>}
            </FullBlock>
          </div>

          {/* Section 4: Employment Information */}
          <div>
            <SectionHeader title="Section 4 — Employment Information" color="#EF4444" />
            <div className="ra-grid" style={{ marginBottom: 10 }}>
              <Field label="Job Related to Degree" value={data.jobRelatedToDegree} />
              <div style={{ background: "#fff5e7", padding: "10px", borderRadius: 8, fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Employment Status</span>
                <span className={`ra-status ${data.status?.toLowerCase().replace(/ /g, '-') || ''}`}>{data.status}</span>
              </div>
            </div>
            {data.status === "Employed" && (
              <div className="ra-grid" style={{ marginBottom: 10 }}>
                <Field label="Job Title / Position" value={data.jobTitle} />
                <Field label="Company / Employer" value={data.company} />
                <Field label="Type of Industry" value={data.industry} />
                <Field label="Monthly Income Range" value={data.salary} />
              </div>
            )}
          </div>

          {/* Section 5: Job Experience (INTEGRATION: from friend's modal) */}
          <div>
            <SectionHeader title="Section 5 — Job Experience" color="#06B6D4" />
            <div className="ra-grid" style={{ marginBottom: 10 }}>
              <Field label="Time to Find First Job After Graduation" value={data.timeToJob} />
              <Field label="Duration in Current Job" value={data.employmentDuration} />
              {data.employmentDurationOther && (
                <Field label="Duration (Specified)" value={data.employmentDurationOther} />
              )}
              <Field label="How First Job Was Found" value={data.howFoundJob} />
              {data.howFoundJobOther && (
                <Field label="Other Source (Specified)" value={data.howFoundJobOther} />
              )}
            </div>
            <FullBlock label="Factors That Helped in Getting First Job">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(data.factorsForJob || []).map((f, i) => <Badge key={i} text={f} color="cyan" />)}
              </div>
              {data.factorsForJobOther && (
                <span style={{ display: "block", marginTop: 6, color: "#6b7280", fontSize: 12 }}>
                  Other: {data.factorsForJobOther}
                </span>
              )}
            </FullBlock>
          </div>
    
          {/* Section 6: Skills & Competencies */}
          <div>
            <SectionHeader title="Section 6 — Skills & Competencies" color="#8B5CF6" />
            <div style={{ marginBottom: 10 }}>
              <FullBlock label="Competencies Learned in College That Are Very Useful">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(data.usefulCompetencies || []).map((s, i) => <Badge key={i} text={s} color="purple" />)}
                </div>
              </FullBlock>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ background: "#fff5e7", borderRadius: 8, padding: "12px", fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
                  How well did NU Dasma prepare you? (1 = Lowest, 5 = Highest)
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["Communication Skills", data.commSkillRating],
                    ["Information & Technology Skills", data.itSkillRating],
                    ["Leadership Skills", data.leadershipRating],
                    ["Critical & Problem-Solving Skills", data.criticalRating],
                    ["Work Ethics / Professionalism", data.workEthicsRating],
                  ].map(([label, val], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#374151", fontSize: 12 }}>{label}</span>
                      <StarDisplay rating={Number(val) || 0} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Feedback & Alumni Engagement (INTEGRATION: from friend's modal) */}
          <div>
            <SectionHeader title="Section 7 — Feedback & Alumni Engagement" color="#F97316" />
            <div className="ra-grid" style={{ marginBottom: 10 }}>
              <Field label="Satisfaction with NU Dasma Education" value={data.satisfaction} />
              <Field label="Would Recommend NU Dasma to Others" value={data.wouldRecommend} />
            </div>
            <FullBlock label="Suggestions for Improving Academic Programs">
              <p style={{ margin: "4px 0 0", lineHeight: 1.6, color: "#374151" }}>{data.suggestions || "N/A"}</p>
            </FullBlock>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================ MAIN VIEW COMPONENT ============================
const ResponseAnalyticsView = ({
  activeTab,
  setActiveTab,
  selectedSection,
  setSelectedSection,
  showFilter,
  setShowFilter,
  selectedResponse,
  setSelectedResponse,
  stats,
  respondents,
  isSectionVisible,
  renderStars,
  sidebar,
  alumniType
}) => {
  const filterRef = useRef(null);

  // ── Pagination state (preserved from original) ──
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 on tab switch
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const totalPages   = Math.max(1, Math.ceil((respondents?.length ?? 0) / PAGE_SIZE));
  const pageStart    = (currentPage - 1) * PAGE_SIZE;
  const pageEnd      = pageStart + PAGE_SIZE;
  const visibleRows  = (respondents ?? []).slice(pageStart, pageEnd);
  const firstEntry   = respondents?.length ? pageStart + 1 : 0;
  const lastEntry    = Math.min(pageEnd, respondents?.length ?? 0);

  // ── Export modal state (INTEGRATION: from friend's implementation) ──
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState(null); // 'csv' | 'pdf'
  const [exportFilterType, setExportFilterType] = useState(null);
  const [exportSubOpen, setExportSubOpen] = useState(false);
  const [exportSelected, setExportSelected] = useState(null);
  const [exportTemp, setExportTemp] = useState(null);

  const resetExport = () => {
    setExportFormat(null);
    setExportFilterType(null);
    setExportSubOpen(false);
    setExportSelected(null);
    setExportTemp(null);
  };

  const exportOptions = exportFilterType === 'batch'
    ? [...new Set(respondents.map(r => r.batch).filter(b => b && b !== 'N/A'))].sort((a, b) => b - a)
    : [...new Set(respondents.map(r => r.program).filter(Boolean))].sort();

  const canExport = exportFormat && exportFilterType && exportSelected;

  // ── Click outside handler for section filter ──
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowFilter]);

  // ── Chart data guards ──
  const hasGenderData      = stats.genderDistribution?.length  > 0;
  const hasAgeData         = stats.ageDistribution?.length     > 0;
  const hasBoardExamData   = stats.boardExam?.length           > 0;
  const hasCertData        = stats.certification?.length       > 0;
  const hasEmploymentData  = stats.employment?.length          > 0;
  const hasSalaryData      = stats.salary?.length              > 0;
  const hasTimeToJobData   = stats.timeToJob?.length           > 0;
  const hasSkillsData      = stats.skills?.length              > 0;
  const hasSatisfactionData = stats.satisfactionScores?.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&family=Arimo:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #E5ECF7F2; }
      `}</style>

      {sidebar}

      <div className="ra-page">
        {/* HEADER */}
        <div className="ra-header">
          <h1 className="ra-title">Response & Analytics</h1>
          <p className="ra-subtitle">View and analyze alumni survey responses and insights.</p>
        </div>

        {/* TABS */}
        <div className="ra-tabs-container">
          <div className="ra-tabs">
            <button className={`ra-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Survey Overview</button>
            <button className={`ra-tab ${activeTab === "responses" ? "active" : ""}`} onClick={() => setActiveTab("responses")}>Survey Responses</button>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="ra-controls">
          {activeTab === "overview" && (
            <div className="ra-controls-left">
              <span>Total Responses:</span>
              <span className="ra-total-value">{stats.totalResponses.toLocaleString()}</span>
            </div>
          )}
          <div className="ra-controls-right">
            {activeTab === "overview" && (
              <div className="ra-filter-wrapper" ref={filterRef}>
                <div className="ra-filter" onClick={(e) => { e.stopPropagation(); setShowFilter(!showFilter); }}>
                  <span>{selectedSection}</span>
                  <span className="ra-dropdown">▼</span>
                </div>
                {showFilter && (
                  <div className="ra-filter-dropdown">
                    {[
                      "All Sections",
                      "Personal Information",
                      "Educational Information",
                      (alumniType !== 'shs' ? ["Certification Achievements"] : []),
                      "Employment Information",
                      "Job Experience",
                      "Skills & Competencies",
                      "Feedback & Engagement"
                    ].map((section) => (
                      <div key={section} className="ra-filter-option" onClick={() => { setSelectedSection(section); setShowFilter(false); }}>
                        {section}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CHARTS / RESPONSES */}
        <div className={`ra-content ${activeTab === "responses" ? "responses" : ""}`}>
          {activeTab === "overview" && (
            <div className="ra-charts-container">
              {isSectionVisible("personal-information") && (
                <div className="ra-chart-row">
                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Gender Distribution</h3>
                    <ChartWithResponsiveContainer height={190}>
                      <PieChart>
                        <Pie data={hasGenderData ? stats.genderDistribution : [{ name: 'No Data', value: 1 }]} dataKey="value" nameKey="name">
                          {hasGenderData ? (
                            stats.genderDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))
                          ) : (
                            <Cell fill="#CBD5E1" />
                          )}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartWithResponsiveContainer>
                  </div>

                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Age Distribution</h3>
                    <ChartWithResponsiveContainer height={190}>
                      <BarChart data={hasAgeData ? stats.ageDistribution : [{ range: 'No Data', count: 1 }]} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="range" type="category" width={50} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10B981" />
                      </BarChart>
                    </ChartWithResponsiveContainer>
                  </div>
                </div>
              )}

              {isSectionVisible("educational-information") && alumniType !== 'shs' && (
                <div className="ra-chart-single">
                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Board Exam Pass Rate</h3>
                    <ChartWithResponsiveContainer height={250}>
                      <BarChart data={hasBoardExamData ? stats.boardExam : [{ category: 'No Data', count: 1 }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ChartWithResponsiveContainer>
                  </div>
                </div>
              )}

              {isSectionVisible("certification-achievements") && alumniType !== 'shs' && (
                <div className="ra-chart-single">
                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Certification Status</h3>
                    <ChartWithResponsiveContainer height={250}>
                      <LineChart data={hasCertData ? stats.certification : [{ status: 'No Data', count: 1 }]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={3} />
                      </LineChart>
                    </ChartWithResponsiveContainer>
                  </div>
                </div>
              )}

              {isSectionVisible("employment-information") && (
                <div className="ra-chart-row">
                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Employment Status</h3>
                    <ChartWithResponsiveContainer height={190}>
                      <PieChart>
                        <Pie data={hasEmploymentData ? stats.employment : [{ name: 'No Data', value: 1 }]} dataKey="value" nameKey="name">
                          {hasEmploymentData ? (
                            stats.employment.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))
                          ) : (
                            <Cell fill="#CBD5E1" />
                          )}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartWithResponsiveContainer>
                  </div>

                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Salary Range</h3>
                    <ChartWithResponsiveContainer height={190}>
                      <BarChart data={hasSalaryData ? stats.salary : [{ range: 'No Data', count: 1 }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#EF4444" />
                      </BarChart>
                    </ChartWithResponsiveContainer>
                  </div>
                </div>
              )}

              {isSectionVisible("job-experience") && (
                <div className="ra-chart-single">
                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Time to First Job</h3>
                    <ChartWithResponsiveContainer height={250}>
                      <BarChart data={hasTimeToJobData ? stats.timeToJob : [{ label: 'No Data', count: 1 }]} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="label" type="category" width={80} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#06B6D4" />
                      </BarChart>
                    </ChartWithResponsiveContainer>
                  </div>
                </div>
              )}

              {isSectionVisible("skills-competencies") && (
                <div className="ra-chart-single">
                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Top Skills</h3>
                    <ChartWithResponsiveContainer height={250}>
                      <BarChart data={hasSkillsData ? stats.skills : [{ skill: 'No Data', count: 1 }]} layout="vertical" margin={{ top: 10, right: 20, left: 80, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="skill" type="category" width={80} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8B5CF6" />
                      </BarChart>
                    </ChartWithResponsiveContainer>
                  </div>
                </div>
              )}

              {isSectionVisible("feedback-engagement") && (
                <div className="ra-chart-row">
                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Rating Breakdown</h3>
                    <ChartWithResponsiveContainer height={190}>
                      <BarChart data={hasSatisfactionData ? stats.satisfactionScores : [{ score: 'No Data', count: 1 }]} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="score" type="category" tickFormatter={(v) => renderStars(parseInt(v))} width={60} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#F97316" />
                      </BarChart>
                    </ChartWithResponsiveContainer>
                  </div>

                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Overall Sentiment</h3>
                    <div style={{ height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ textAlign: "center" }}>
                        <h2 style={{ fontSize: "48px", margin: 0 }}>{stats.avgSatisfaction || 0}</h2>
                        <div style={{ fontSize: "24px", color: "gold" }}>
                          {"★".repeat(Math.round(stats.avgSatisfaction || 0))}
                          {"☆".repeat(5 - Math.round(stats.avgSatisfaction || 0))}
                        </div>
                        <p style={{ marginTop: "10px", color: "#6B7280" }}>Average satisfaction rating</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "responses" && (
            <div className="ra-table-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Fixed header — never scrolls (INTEGRATION: improved layout from friend) */}
              <div className="ra-table-header" style={{ flexShrink: 0, paddingBottom: '12px' }}>
                <span><strong>No of Respondents:</strong> {respondents.length} people</span>
                <button
                  className="am-tb-btn"
                  style={{ background: '#4FA3F7', color: '#fff', borderColor: '#4FA3F7' }}
                  onClick={() => { resetExport(); setExportOpen(true); }}
                >
                  <IconExport color="#fff" /> Export
                </button>
              </div>

              {/* Fixed column headers — never scrolls */}
              <table className="ra-table" style={{ flexShrink: 0, tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>BATCH</th>
                    <th>PROGRAM</th>
                    <th>EMPLOYMENT STATUS</th>
                  </tr>
                </thead>
              </table>

              {/* Scrollable tbody (INTEGRATION: from friend's implementation) */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table className="ra-table" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col /><col /><col /><col />
                  </colgroup>
                  <tbody>
                    {visibleRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                          No alumni records here
                        </td>
                      </tr>
                    ) : (
                      visibleRows.map((a, i) => (
                        <tr key={pageStart + i} onClick={() => setSelectedResponse(a)} style={{ cursor: "pointer" }}>
                          <td>
                            <div className="ra-name-cell">
                              <div className="ra-avatar">{a.name?.charAt(0) || '?'}</div>
                              <div>
                                <div className="ra-name">{a.name}</div>
                                <div className="ra-email">{a.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="ra-batch">{a.batch}</span></td>
                          <td>{a.program?.length > 40 ? a.program.slice(0, 40) + "…" : a.program}</td>
                          <td>
                            <span className={`ra-status ${a.status?.toLowerCase().replace(/ /g, '-') || ''}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Fixed pagination — never scrolls, functional (preserved from original) */}
              <div className="ra-pagination" style={{ flexShrink: 0, marginTop: '12px' }}>
                <span>
                  Showing {firstEntry} to {lastEntry} of {respondents.length} entries
                </span>
                <div>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '…' ? (
                        <span key={`ellipsis-${idx}`} style={{ padding: '4px 6px', fontSize: 13, color: '#6b7280' }}>…</span>
                      ) : (
                        <button
                          key={item}
                          className={currentPage === item ? 'active' : ''}
                          onClick={() => setCurrentPage(item)}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              </div>

              {selectedResponse && (
                <ResponseModal data={selectedResponse} onClose={() => setSelectedResponse(null)} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── EXPORT FORMAT SELECTION MODAL (INTEGRATION: from friend, extended for CSV+PDF) ── */}
      {exportOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={() => { setExportOpen(false); resetExport(); }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:14, width:380, boxShadow:'0 20px 50px rgba(0,0,0,0.18)', overflow:'hidden', animation:'raFade 0.18s ease' }}>
            <div style={{ background:'#dfe9f5', padding:'18px 22px' }}>
              <h3 style={{ margin:0, fontFamily:'Lexend, sans-serif', fontSize:15, fontWeight:700, color:'#1E293B' }}>Export Survey Responses</h3>
              <p style={{ margin:'4px 0 0', fontSize:12, color:'#6A7282' }}>Choose export format and filter.</p>
            </div>
            <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
              {/* Format selection */}
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#62748E', textTransform:'uppercase', letterSpacing:'.5px' }}>Export Format</p>
              <div style={{ display:'flex', gap:10 }}>
                <label style={{ flex:1, display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'10px 14px', borderRadius:8, border:`1px solid ${exportFormat === 'csv' ? '#4FA3F7' : '#E2E8F0'}`, background: exportFormat === 'csv' ? '#EFF6FF' : '#fff' }}>
                  <input type="radio" name="exportFormat" checked={exportFormat === 'csv'} onChange={() => { setExportFormat('csv'); setExportFilterType(null); setExportSelected(null); }} style={{ accentColor:'#155DFC' }} />
                  <span style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>CSV (All Data)</span>
                </label>
                <label style={{ flex:1, display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'10px 14px', borderRadius:8, border:`1px solid ${exportFormat === 'pdf' ? '#4FA3F7' : '#E2E8F0'}`, background: exportFormat === 'pdf' ? '#EFF6FF' : '#fff' }}>
                  <input type="radio" name="exportFormat" checked={exportFormat === 'pdf'} onChange={() => { setExportFormat('pdf'); setExportFilterType(null); setExportSelected(null); }} style={{ accentColor:'#155DFC' }} />
                  <span style={{ fontSize:13, fontWeight:600, color:'#1E293B' }}>PDF (Filtered)</span>
                </label>
              </div>

              {/* Filter options (PDF only) */}
              {exportFormat === 'pdf' && (
                <>
                  <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#62748E', textTransform:'uppercase', letterSpacing:'.5px' }}>Download by…</p>
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <input type="radio" name="exportType" checked={exportFilterType === 'batch'} onChange={() => { setExportFilterType('batch'); setExportSelected(null); setExportTemp(null); }} style={{ accentColor:'#155DFC', width:15, height:15 }} />
                    <span style={{ fontSize:14, color:'#1E293B', fontWeight:500 }}>Batch</span>
                  </label>
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <input type="radio" name="exportType" checked={exportFilterType === 'program'} onChange={() => { setExportFilterType('program'); setExportSelected(null); setExportTemp(null); }} style={{ accentColor:'#155DFC', width:15, height:15 }} />
                    <span style={{ fontSize:14, color:'#1E293B', fontWeight:500 }}>Program</span>
                  </label>
                  {exportFilterType && (
                    <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, fontSize:11, color:'#94A3B8' }}>Selected {exportFilterType === 'batch' ? 'Batch' : 'Program'}</p>
                        <p style={{ margin:'3px 0 0', fontSize:13, fontWeight:600, color: exportSelected ? '#1E293B' : '#CBD5E1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {exportSelected ? (exportFilterType === 'batch' ? `Batch ${exportSelected}` : exportSelected) : `No ${exportFilterType} selected`}
                        </p>
                      </div>
                      <button onClick={() => { setExportTemp(null); setExportSubOpen(true); }} style={{ marginLeft:12, padding:'5px 12px', borderRadius:7, border:'1px solid #CBD5E1', background:'#fff', fontSize:12, fontWeight:500, color:'#475569', cursor:'pointer', whiteSpace:'nowrap' }}>Choose</button>
                    </div>
                  )}
                </>
              )}
              {/* CSV: no filter — export all */}
              {exportFormat === 'csv' && (
                <p style={{ margin:0, fontSize:12, color:'#6A7282' }}>Will export all {respondents.length} respondents as CSV.</p>
              )}
            </div>
            <div style={{ padding:'14px 22px 20px', display:'flex', justifyContent:'flex-end', gap:8, borderTop:'1px solid #F1F5F9' }}>
              <button onClick={() => { setExportOpen(false); resetExport(); }} style={{ padding:'8px 18px', borderRadius:8, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, color:'#475569', cursor:'pointer', fontFamily:'Arimo, sans-serif' }}>Cancel</button>
              <button
                disabled={exportFormat === 'pdf' ? !canExport : !exportFormat}
                onClick={() => {
                  if (exportFormat === 'csv') {
                    exportToCSV(respondents, 'survey-responses');
                  } else if (exportFormat === 'pdf') {
                    exportSurveyPDF({
                      filterType: exportFilterType,
                      filterValue: exportSelected,
                      stats: stats,
                      respondents: respondents,
                    }).catch(err => console.error('PDF export error:', err));
                  }
                  setExportOpen(false);
                  resetExport();
                }}
                style={{ padding:'8px 18px', borderRadius:8, border:'none', background: (exportFormat === 'csv' || canExport) ? '#4FA3F7' : '#CBD5E1', color: (exportFormat === 'csv' || canExport) ? '#fff' : '#94A3B8', fontSize:13, fontWeight:600, cursor: (exportFormat === 'csv' || canExport) ? 'pointer' : 'not-allowed', fontFamily:'Arimo, sans-serif' }}
              >Export</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-PICKER MODAL (from friend) ── */}
      {exportSubOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100 }}
          onClick={() => setExportSubOpen(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:14, width:320, boxShadow:'0 20px 50px rgba(0,0,0,0.18)', overflow:'hidden', animation:'raFade 0.15s ease' }}>
            <div style={{ background:'#dfe9f5', padding:'16px 20px', borderBottom:'1px solid #E2E8F0' }}>
              <h3 style={{ margin:0, fontFamily:'Lexend, sans-serif', fontSize:14, fontWeight:700, color:'#1E293B' }}>Select {exportFilterType === 'batch' ? 'Batch Year' : 'Program'}</h3>
            </div>
            <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:8, maxHeight:280, overflowY:'auto' }}>
              {exportOptions.map(opt => (
                <label key={opt} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, cursor:'pointer', background: exportTemp === opt ? '#EFF6FF' : '#F8FAFC', border:`1px solid ${exportTemp === opt ? '#BFDBFE' : '#E2E8F0'}`, transition:'all 0.1s' }}>
                  <input type="radio" name="exportSub" checked={exportTemp === opt} onChange={() => setExportTemp(opt)} style={{ accentColor:'#155DFC', width:14, height:14 }} />
                  <span style={{ fontSize:13, color:'#1E293B', fontWeight: exportTemp === opt ? 600 : 400 }}>
                    {exportFilterType === 'batch' ? `Batch ${opt}` : opt}
                  </span>
                </label>
              ))}
            </div>
            <div style={{ padding:'12px 20px 18px', display:'flex', justifyContent:'flex-end', gap:8, borderTop:'1px solid #F1F5F9' }}>
              <button onClick={() => setExportSubOpen(false)} style={{ padding:'7px 16px', borderRadius:8, border:'1px solid #E2E8F0', background:'#fff', fontSize:13, color:'#475569', cursor:'pointer', fontFamily:'Arimo, sans-serif' }}>Back</button>
              <button disabled={!exportTemp} onClick={() => { setExportSelected(exportTemp); setExportSubOpen(false); }} style={{ padding:'7px 16px', borderRadius:8, border:'none', background: exportTemp ? '#1E293B' : '#CBD5E1', color: exportTemp ? '#fff' : '#94A3B8', fontSize:13, fontWeight:600, cursor: exportTemp ? 'pointer' : 'not-allowed', fontFamily:'Arimo, sans-serif' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponseAnalyticsView;