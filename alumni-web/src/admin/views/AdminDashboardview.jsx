// ============================================================================
// AdminDashboardView — UI Layer
// ============================================================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { IoMdSchool }   from "react-icons/io";
import { BiSolidSchool } from "react-icons/bi";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminDashboard.css";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// ============================================================================
// RADIAL GAUGE
// ============================================================================
function RadialGauge({ progress = 0, target = 0, targetDir = "above", isCount = false, size = 80, valueLabel }) {
  const r  = (size / 2) - 7;
  const cx = size / 2;
  const cy = size / 2;

  if (isCount || target === 0) {
    const circumference   = 2 * Math.PI * r;
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const progressOffset  = circumference * (1 - clampedProgress / 100);
    const progressColor   = "#00BC7D";

    return (
      <svg width={size} height={size} style={{ flexShrink: 0, transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={7} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={progressColor} strokeWidth={7}
          strokeDasharray={circumference} strokeDashoffset={progressOffset} strokeLinecap="round" />
        <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
          fontSize={clampedProgress >= 100 ? 10 : 12}
          fontFamily="Lexend, Arimo, Arial" fontWeight={700} fill={progressColor}
          style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          {valueLabel || `${clampedProgress}%`}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle"
          fontSize={8} fontFamily="Lexend, Arimo, Arial" fontWeight={600} fill="#94A3B8"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          No Goal
        </text>
      </svg>
    );
  }

  const circumference   = 2 * Math.PI * r;
  const clampedProgress = Math.min(progress, 100);
  const progressOffset  = circumference * (1 - clampedProgress / 100);
  const isGood          = targetDir === "below" ? progress <= target : progress >= target;
  const progressColor   = isGood ? "#00BC7D" : "#F59E0B";

  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={7} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={progressColor} strokeWidth={7}
        strokeDasharray={circumference} strokeDashoffset={progressOffset} strokeLinecap="round" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={clampedProgress >= 100 ? 10 : 12}
        fontFamily="Lexend, Arimo, Arial" fontWeight={700} fill={progressColor}
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}>
        {clampedProgress}%
      </text>
    </svg>
  );
}

// ============================================================================
// KPI PROGRESS CARD
// ============================================================================
function KpiProgressCard({ category, label, value, progress, target, targetLabel, targetDir = "above", trend, isCount }) {
  const trendColor = trend.dir === "up"
    ? (targetDir === "below" ? "#F59E0B" : "#00A63E")
    : trend.dir === "down"
    ? (targetDir === "below" ? "#00A63E" : "#ef4444")
    : "#90A1B9";
  const trendArrow = trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "";

  const resolvedTargetLabel =
    !targetLabel || targetLabel === 'N/A' || /^Goal:\s*[—-]/.test(targetLabel)
      ? 'Not Provided'
      : targetLabel;

  const isNotMet = target > 0 && (
    targetDir === "below" ? progress > target : progress < target
  );

  return (
    <div className="kpi-progress-card">
      <div className="kpi-progress-category">{category}</div>
      <div className="kpi-progress-content">
        <div className="kpi-progress-info">
          <div className="kpi-progress-label">{label}</div>
          <div className="kpi-progress-value-row">
            <div className="kpi-progress-target">{resolvedTargetLabel}</div>
            {trend.delta && (
              <div className="kpi-progress-trend" style={{ color: trendColor }}>
                {trendArrow} {trend.delta}
              </div>
            )}
          </div>
          {isNotMet && (
            <div
              className="kpi-alert-text"
              onClick={() => window.dispatchEvent(new CustomEvent('openKpiModal', { detail: { label } }))}
            >
              ⚠ Goal not met — click for suggestions
            </div>
          )}
        </div>
        <div className="kpi-progress-gauge">
          <RadialGauge
            progress={progress}
            target={target}
            targetDir={targetDir}
            isCount={isCount}
            size={76}
            valueLabel={value}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD ICONS
// ============================================================================
const statCardIcons = {
  'Registered Alumni': {
    bg: '#EFF6FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  'Survey Response Rate': {
    bg: '#F0FDF4',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  'Employment Rate': {
    bg: '#FFF7ED',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  'Alumni Satisfaction': {
    bg: '#FFFBEB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
};

// ============================================================================
// KPI STAT CARD
// ============================================================================
function KpiStatCard({ label, value, sub }) {
  const iconData = statCardIcons[label];
  return (
    <div className="kpi-stat-card">
      <div className="kpi-stat-content">
        <div className="kpi-stat-info">
          <div className="kpi-stat-label">{label}</div>
          <div className="kpi-stat-value">{value}</div>
          <div className="kpi-stat-sub">{sub}</div>
        </div>
        {iconData && (
          <div className="kpi-stat-icon" style={{ background: iconData.bg }}>
            {iconData.icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY CHART PLACEHOLDER
// ============================================================================
function EmptyChart({ height = 280 }) {
  return (
    <div className="empty-chart" style={{ height: `${height}px` }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
      <span>No data available yet</span>
    </div>
  );
}

// ============================================================================
// CHART CARD
// ============================================================================
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title">{title}</div>
        {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
      </div>
      <div className="chart-container">{children}</div>
    </div>
  );
}

// ============================================================================
// NAVIGABLE CHART CARD
// Clicking navigates to the analytics page with a focus hint in route state.
// Long mouse-hold (drag) intentionally suppressed to avoid mis-navigation.
// ============================================================================
function NavigableChartCard({ title, subtitle, to, children }) {
  const navigate = useNavigate();
  const mouseDownTimeRef = { current: null };

  const handleMouseDown = () => { mouseDownTimeRef.current = Date.now(); };
  const handleClick     = () => {
    if (mouseDownTimeRef.current === null) return;
    if (Date.now() - mouseDownTimeRef.current > 300) return;
    mouseDownTimeRef.current = null;
    navigate(to);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(to); }
  };

  return (
    <div
      className="chart-card chart-card--navigable"
      role="button"
      tabIndex={0}
      aria-label={`${title} — click to view full report`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="chart-card-header">
        <div className="chart-card-title">
          {title}
          <svg className="chart-card-nav-icon" width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
        {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
      </div>
      <div className="chart-container">{children}</div>
    </div>
  );
}

// ============================================================================
// CUSTOM BAR CHART
// ============================================================================
function CustomBarChart({ data, dataKey, nameKey, title, subtitle, height = 280, navigateTo }) {
  const content = (!data || data.length === 0)
    ? <EmptyChart height={height} />
    : (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey={dataKey} fill="#3B82F6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );

  return navigateTo
    ? <NavigableChartCard title={title} subtitle={subtitle} to={navigateTo}>{content}</NavigableChartCard>
    : <ChartCard title={title} subtitle={subtitle}>{content}</ChartCard>;
}

// ============================================================================
// CUSTOM PIE CHART
// ============================================================================
function CustomPieChart({ data, title, subtitle, height = 280, navigateTo }) {
  const filteredData = data?.filter(d => d.value > 0) || [];

  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central" fontSize={11} fontFamily="Arimo, sans-serif">
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const content = filteredData.length === 0
    ? <EmptyChart height={height} />
    : (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={filteredData} cx="50%" cy="50%" labelLine label={renderLabel}
            outerRadius={80} dataKey="value">
            {filteredData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} alumni`} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    );

  return navigateTo
    ? <NavigableChartCard title={title} subtitle={subtitle} to={navigateTo}>{content}</NavigableChartCard>
    : <ChartCard title={title} subtitle={subtitle}>{content}</ChartCard>;
}

// ============================================================================
// CAREER ALIGNMENT PREDICTION CHART (Grouped Bar) — Navigable
// Props: data — array of { program, predicted, actual }
// ============================================================================
function CareerAlignmentChart({ data, title, subtitle, height = 300, navigateTo }) {
  const content = (!data || data.length === 0)
    ? <EmptyChart height={height} />
    : (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="program" tick={{ fontSize: 11, fontFamily: 'Lexend, Arimo, Arial' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`}
            label={{ value: 'Alignment Rate (%)', angle: -90, position: 'insideLeft', offset: -5,
              style: { fontSize: 11, fill: '#6A7282', fontFamily: 'Lexend, Arimo, Arial' } }} />
          <Tooltip formatter={(value, name) => [`${value}%`, name === 'predicted' ? 'Predicted' : 'Actual']} />
          <Legend wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => value === 'predicted' ? 'Predicted Rate' : 'Actual Rate'} />
          <Bar dataKey="predicted" name="predicted" fill="#324D87" radius={[6, 6, 0, 0]} />
          <Bar dataKey="actual"    name="actual"    fill="#00BC7D" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );

  return navigateTo
    ? <NavigableChartCard title={title} subtitle={subtitle} to={navigateTo}>{content}</NavigableChartCard>
    : <ChartCard title={title} subtitle={subtitle}>{content}</ChartCard>;
}

// ============================================================================
// KPI SUGGESTIONS — used by the alert modal
// ============================================================================
const getKpiSuggestions = (label) => {
  const map = {
    "Absorption from Internship":               ["Strengthen industry partnerships", "Improve internship-to-hire programs"],
    "Employed Within 2 Yrs of Graduation":      ["Enhance career placement services", "Conduct job readiness workshops"],
    "Employed in Field / Related Field":        ["Align curriculum with industry needs", "Increase internship relevance"],
    "Employed Outside Field of Specialization": ["Review program alignment", "Provide career guidance earlier"],
    "Engaged in Entrepreneurship":             ["Offer startup incubation programs", "Promote entrepreneurship training"],
    "Occupying Supervisory Positions":          ["Provide leadership training", "Encourage career progression planning"],
    "Pursued Graduate Studies (within 1 yr)":   ["Promote postgraduate opportunities", "Offer scholarships"],
    "Pursued Graduate Studies at NU":           ["Strengthen internal graduate programs", "Offer alumni incentives"],
    "In Positions in Professional Organizations": ["Encourage professional membership", "Host networking events"],
  };
  return map[label] || ["No suggestions available"];
};

// ============================================================================
// KPI ALERT MODAL
// ============================================================================
function KpiAlertModal({ label, onClose }) {
  return (
    <div className="kpi-modal-overlay">
      <div className="kpi-modal">
        <div className="kpi-modal-header">
          <h2>{label}</h2>
          <button className="kpi-modal-close-icon" onClick={onClose}>✕</button>
        </div>
        <div className="kpi-modal-status">⚠ Below Target Performance</div>
        <p className="kpi-modal-desc">
          This KPI is currently not meeting its expected goal. Here are some recommended actions to improve performance:
        </p>
        <div className="kpi-modal-suggestions">
          {getKpiSuggestions(label).map((s, i) => (
            <div key={i} className="kpi-suggestion-item">
              <div className="suggestion-icon">💡</div>
              <div className="suggestion-text">{s}</div>
            </div>
          ))}
        </div>
        <div className="kpi-modal-footer">
          <button className="kpi-modal-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN VIEW COMPONENT
// ============================================================================
const AdminDashboardView = ({
  activeKpiTab,
  setActiveKpiTab,
  kpiData,
  kpis2,
  employmentAlignmentData,
  employmentStatusData,
  inDemandSkillsData,
  careerAlignmentData,
  loadingCharts,
}) => {
  const [activeKpiModal, setActiveKpiModal] = useState(null);

  useEffect(() => {
    const handler = (e) => setActiveKpiModal(e.detail.label);
    window.addEventListener('openKpiModal', handler);
    return () => window.removeEventListener('openKpiModal', handler);
  }, []);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <main className="dashboard-main">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome Bark! Here's what's happening with your alumni.</p>
        </div>

        {/* ── Institutional KPIs ─────────────────────────────────────────── */}
        <div className="dashboard-section">
          <div className="section-header">
            <BiSolidSchool className="section-icon" />
            <div className="section-title">Institutional KPI</div>
          </div>

          <div className="kpi-tabs">
            {[
              { id: "employment", label: "EMPLOYMENT" },
              { id: "career",     label: "CAREER PROGRESS" },
              { id: "education",  label: "EDUCATION" },
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`kpi-tab-btn${activeKpiTab === id ? " active" : ""}`}
                onClick={() => setActiveKpiTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="kpi-grid">
            {kpiData[activeKpiTab].map(kpi => (
              <KpiProgressCard key={kpi.id} {...kpi} />
            ))}
          </div>
        </div>

        {/* ── Alumni Tracer ───────────────────────────────────────────────── */}
        <div className="dashboard-section">
          <div className="section-header">
            <IoMdSchool className="section-icon" />
            <div className="section-title">Alumni Tracer</div>
          </div>
          <div className="alumni-tracer-grid">
            {kpis2.map((k) => (
              <KpiStatCard key={k.label} {...k} />
            ))}
          </div>
        </div>

        {/* ── Degree Alignment + Employment Status ───────────────────────── */}
        <div className="charts-row">
          <CustomBarChart
            data={employmentAlignmentData}
            dataKey="alignment"
            nameKey="name"
            title="Degree Alignment Rate"
            subtitle="Percentage of alumni aligned with their degree per program"
            height={280}
            navigateTo="/admin/response-and-analytics"
          />
          <CustomPieChart
            data={employmentStatusData}
            title="Employment Status Distribution"
            subtitle="Breakdown of alumni by employment type"
            height={280}
            navigateTo="/admin/response-and-analytics"
          />
        </div>

        {/* ── Career Alignment Prediction (grouped bar, navigable) ────────── */}
        <div className="full-width-chart">
          <CareerAlignmentChart
            data={careerAlignmentData}
            title="Career Alignment Prediction"
            subtitle="Predicted vs. actual career alignment rate by program"
            height={300}
            navigateTo="/admin/response-and-analytics"
          />
        </div>

        {/* ── In-Demand Skills ─────────────────────────────────────────────── */}
        <div className="full-width-chart">
          <CustomBarChart
            data={inDemandSkillsData}
            dataKey="count"
            nameKey="name"
            title="Most In-Demand Skills"
            subtitle="Top skills required by employers"
            height={300}
          />
        </div>

        {/* ── KPI Alert Modal ──────────────────────────────────────────────── */}
        {activeKpiModal && (
          <KpiAlertModal label={activeKpiModal} onClose={() => setActiveKpiModal(null)} />
        )}

      </main>
    </div>
  );
};

export default AdminDashboardView;