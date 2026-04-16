// ============================================================================
// THIS IS THE UI.
// ============================================================================
// Purpose: Renders all visual components using friend's exact design with
//          proper font styling, responsive grids, and modal functionality.
// ============================================================================

import React, { useRef, useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import '../styles/ResponseAnalytics.css';

// ============================ ICONS ============================
const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v8M5 7l3 3 3-3" stroke="#314158" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12h12" stroke="#314158" strokeWidth="1.33" strokeLinecap="round"/>
  </svg>
);

// ============================ COLORS ============================
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// ============================ CHART WITH RESIZE OBSERVER ============================
const ChartWithResponsiveContainer = ({ children, height = 190 }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
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

  // If width is not yet available, show loading placeholder
  if (containerWidth === 0) {
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
            <FullBlock label="Degree Program Completed">
              <strong>{data.program}</strong>
              {data.programOther && <span style={{ display: "block", marginTop: 4, color: "#6b7280", fontSize: 12 }}>Specified: {data.programOther}</span>}
            </FullBlock>
            <FullBlock label="Reason(s) for Taking the Course">
              <span style={{ color: "#374151", lineHeight: 1.6 }}>{data.reasonTakingCourse || "N/A"}</span>
            </FullBlock>
            <div className="ra-grid">
              <Field label="Year Graduated" value={data.batch} />
              <Field label="Distinction Received" value={data.distinction} />
              <Field label="Plans for Post-Graduate Studies" value={data.postGradPlans} />
              {data.postGradPlans === "Yes" && <Field label="Post-Graduate Course" value={data.postGradCourse} />}
            </div>
          </div>

          {/* Section 3: Certification Achievements */}
          <div>
            <SectionHeader title="Section 3 — Certification Achievements" color="#F59E0B" />
            <div className="ra-grid">
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
            <div className="ra-grid">
              <Field label="Job Related to Degree" value={data.jobRelatedToDegree} />
              <div style={{ background: "#fff5e7", padding: "10px", borderRadius: 8, fontSize: 13 }}>
                <span style={{ display: "block", fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Employment Status</span>
                <span className={`ra-status ${data.status?.toLowerCase().replace(/ /g, '-') || ''}`}>{data.status}</span>
              </div>
            </div>
            {data.status === "Employed" && (
              <div className="ra-grid">
                <Field label="Job Title / Position" value={data.jobTitle} />
                <Field label="Company / Employer" value={data.company} />
                <Field label="Type of Industry" value={data.industry} />
                <Field label="Monthly Income Range" value={data.salary} />
              </div>
            )}
          </div>

          {/* Section 5: Skills & Competencies */}
          <div>
            <SectionHeader title="Section 5 — Skills & Competencies" color="#8B5CF6" />
            <FullBlock label="Competencies Learned in College That Are Very Useful">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(data.usefulCompetencies || []).map((s, i) => <Badge key={i} text={s} color="purple" />)}
              </div>
            </FullBlock>
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

          {/* Section 6: Feedback for the University */}
          <div>
            <SectionHeader title="Section 6 — Feedback & Alumni Engagement" color="#F97316" />
            <div className="ra-grid">
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
}) => {
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowFilter]);

  // Check if data exists for charts
  const hasGenderData = stats.genderDistribution && stats.genderDistribution.length > 0;
  const hasAgeData = stats.ageDistribution && stats.ageDistribution.length > 0;
  const hasBoardExamData = stats.boardExam && stats.boardExam.length > 0;
  const hasCertificationData = stats.certification && stats.certification.length > 0;
  const hasEmploymentData = stats.employment && stats.employment.length > 0;
  const hasSalaryData = stats.salary && stats.salary.length > 0;
  const hasTimeToJobData = stats.timeToJob && stats.timeToJob.length > 0;
  const hasSkillsData = stats.skills && stats.skills.length > 0;
  const hasSatisfactionData = stats.satisfactionScores && stats.satisfactionScores.length > 0;

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
                      "Certification Achievements",
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
                            stats.genderDistribution.map((entry, index) => (
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

              {isSectionVisible("educational-information") && (
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

              {isSectionVisible("certification-achievements") && (
                <div className="ra-chart-single">
                  <div className="ra-chart-inner">
                    <h3 className="ra-chart-title">Certification Status</h3>
                    <ChartWithResponsiveContainer height={250}>
                      <LineChart data={hasCertificationData ? stats.certification : [{ status: 'No Data', count: 1 }]}>
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
                            stats.employment.map((entry, index) => (
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
            <div className="ra-table-container">
              <div className="ra-table-header">
                <span><strong>No of Respondents:</strong> {respondents.length} people</span>
                <button className="am-tb-btn"><IconExport /> Export</button>
              </div>

              <table className="ra-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>BATCH</th>
                    <th>PROGRAM</th>
                    <th>EMPLOYMENT STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {respondents.map((a, i) => (
                    <tr key={i} onClick={() => setSelectedResponse(a)} style={{ cursor: "pointer" }}>
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
                  ))}
                </tbody>
              </table>

              {selectedResponse && (
                <ResponseModal data={selectedResponse} onClose={() => setSelectedResponse(null)} />
              )}

              <div className="ra-pagination">
                <span>Showing 1 to {respondents.length} of {respondents.length} entries</span>
                <div>
                  <button>Prev</button>
                  <button className="active">1</button>
                  <button>Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResponseAnalyticsView;