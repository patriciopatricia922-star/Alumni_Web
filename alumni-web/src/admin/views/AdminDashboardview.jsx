// ============================================================================
// THIS IS THE UI.
// ============================================================================
// Purpose: Renders all visual components for the admin dashboard using
//          friend's exact design with proper font styling and grid layouts.
// ============================================================================

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";
import { IoMdSchool } from "react-icons/io";
import { BiSolidSchool } from "react-icons/bi";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminDashboard.css";

// ============================================================================
// COLOR PALETTE - Used for pie chart segments
// ============================================================================
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// ============================================================================
// RADIAL GAUGE CHART - Displays progress toward target as a circular gauge
// ============================================================================
function RadialGauge({ progress = 0, target = 0, targetDir = "above", isCount = false, size = 80 }) {
  if (isCount || target === 0) {
    const r = (size / 2) - 7;
    const cx = size / 2;
    const cy = size / 2;
    return (
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={7} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={11}
          fontFamily="Lexend, Arimo, Arial" fontWeight={700} fill="#94A3B8">N/A</text>
      </svg>
    );
  }

  const r = (size / 2) - 7;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const clampedProgress = Math.min(progress, 100);
  const clampedTarget   = Math.min(target, 100);

  const progressOffset = circumference * (1 - clampedProgress / 100);
  const targetOffset   = circumference * (1 - clampedTarget   / 100);

  const isGood = targetDir === "below"
    ? progress <= target
    : progress >= target;

  const progressColor = isGood ? "#00BC7D" : "#F59E0B";
  const targetColor   = "#324D87";

  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: "rotate(-90deg)" }}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={7} />
      {/* Target arc */}
      {target > 0 && (
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={targetColor} strokeWidth={4}
          strokeOpacity={0.18}
          strokeDasharray={circumference}
          strokeDashoffset={targetOffset}
          strokeLinecap="round"
        />
      )}
      {/* Progress arc */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={progressColor} strokeWidth={7}
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset}
        strokeLinecap="round"
      />
      {/* Target tick mark */}
      {target > 0 && (() => {
        const drawAngle = (clampedTarget / 100) * 2 * Math.PI;
        const inner = r - 5;
        const outer = r + 3;
        const x1 = cx + inner * Math.cos(drawAngle);
        const y1 = cy + inner * Math.sin(drawAngle);
        const x2 = cx + outer * Math.cos(drawAngle);
        const y2 = cy + outer * Math.sin(drawAngle);
        return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={targetColor} strokeWidth={2.5} strokeLinecap="round" />;
      })()}
      {/* Center label */}
      <text
        x={cx} y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={clampedProgress >= 100 ? 10 : 12}
        fontFamily="Lexend, Arimo, Arial"
        fontWeight={700}
        fill={progressColor}
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
      >
        {clampedProgress}%
      </text>
    </svg>
  );
}

// ============================================================================
// KPI PROGRESS CARD - With radial gauge (for Institutional KPIs)
// ============================================================================
function KpiProgressCard({ category, label, value, progress, target, targetLabel, targetDir = "above", trend, isCount }) {
  const trendColor = trend.dir === "up"
    ? (targetDir === "below" ? "#F59E0B" : "#00A63E")
    : trend.dir === "down"
    ? (targetDir === "below" ? "#00A63E" : "#ef4444")
    : "#90A1B9";

  const trendArrow = trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "";

  return (
    <div className="kpi-progress-card">
      <div className="kpi-progress-category">{category}</div>

      <div className="kpi-progress-content">
        <div className="kpi-progress-info">
          <div className="kpi-progress-label">{label}</div>
          <div className="kpi-progress-value-row">
            <div className="kpi-progress-target">{targetLabel}</div>
            {trend.delta && (
              <div className="kpi-progress-trend" style={{ color: trendColor }}>
                {trendArrow} {trend.delta}
              </div>
            )}
          </div>
        </div>

        <div className="kpi-progress-gauge">
          <RadialGauge
            progress={progress}
            target={target}
            targetDir={targetDir}
            isCount={isCount}
            size={76}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KPI STAT CARD ICONS
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
  'Active Programs': {
    bg: '#F5F3FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
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
// KPI STAT CARD - For Alumni Tracer (4 cards in a row)
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
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      <span>No data available yet</span>
    </div>
  );
}

// ============================================================================
// CHART CARD COMPONENT
// ============================================================================
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title">{title}</div>
        {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
      </div>
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// CUSTOM BAR CHART
// ============================================================================
function CustomBarChart({ data, dataKey, nameKey, title, subtitle, height = 280 }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <EmptyChart height={height} />
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
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
    </ChartCard>
  );
}

// ============================================================================
// CUSTOM PIE CHART
// ============================================================================
function CustomPieChart({ data, title, subtitle, height = 280 }) {
  const filteredData = data?.filter(d => d.value > 0) || [];
  
  if (!filteredData || filteredData.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <EmptyChart height={height} />
      </ChartCard>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontFamily="Arimo, sans-serif">
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%" cy="50%"
            labelLine={true}
            label={renderCustomizedLabel}
            outerRadius={80}
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} alumni`} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ============================================================================
// CUSTOM LINE CHART
// ============================================================================
function CustomLineChart({ data, dataKey, xKey, title, subtitle, height = 280 }) {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <EmptyChart height={height} />
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
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
  employmentForecastData,
  loadingCharts,
}) => {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <main className="dashboard-main">

        {/* ============================ HEADER ============================ */}
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome Bark! Here's what's happening with your alumni.</p>
        </div>

        {/* ============================ INSTITUTIONAL KPIs SECTION ============================ */}
        <div className="dashboard-section">
          <div className="section-header">
            <BiSolidSchool className="section-icon" />
            <div className="section-title">Institutional KPI</div>
          </div>

          {/* TABS */}
          <div className="kpi-tabs">
            <button
              className={`kpi-tab-btn${activeKpiTab === "employment" ? " active" : ""}`}
              onClick={() => setActiveKpiTab("employment")}
            >
              EMPLOYMENT
            </button>
            <button
              className={`kpi-tab-btn${activeKpiTab === "career" ? " active" : ""}`}
              onClick={() => setActiveKpiTab("career")}
            >
              CAREER PROGRESS
            </button>
            <button
              className={`kpi-tab-btn${activeKpiTab === "education" ? " active" : ""}`}
              onClick={() => setActiveKpiTab("education")}
            >
              EDUCATION
            </button>
          </div>

          {/* KPI GRID - 3 columns */}
          <div className="kpi-grid">
            {kpiData[activeKpiTab].map(kpi => (
              <KpiProgressCard key={kpi.id} {...kpi} />
            ))}
          </div>
        </div>

        {/* ============================ ALUMNI TRACER SECTION ============================ */}
        <div className="dashboard-section">
          <div className="section-header">
            <IoMdSchool className="section-icon" />
            <div className="section-title">Alumni Tracer</div>
          </div>
          {/* Alumni Tracer Grid - 4 columns */}
          <div className="alumni-tracer-grid">
            {kpis2.map((k) => (
              <KpiStatCard key={k.label} {...k} />
            ))}
          </div>
        </div>

        {/* ============================ CHARTS SECTION ============================ */}
        <div className="charts-row">
          <CustomBarChart
            data={employmentAlignmentData}
            dataKey="alignment"
            nameKey="name"
            title="Employment Alignment Rate"
            subtitle="Percentage of employed alumni per program"
            height={280}
          />
          <CustomPieChart
            data={employmentStatusData}
            title="Employment Status Distribution"
            subtitle="Breakdown of alumni by employment type"
            height={280}
          />
        </div>

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

        <div className="full-width-chart">
          <CustomLineChart
            data={employmentForecastData}
            dataKey="rate"
            xKey="year"
            title="Employment Probability Forecast"
            subtitle="Predicted employment outcomes over time"
            height={280}
          />
        </div>

      </main>
    </div>
  );
};

export default AdminDashboardView;