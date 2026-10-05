//SuperAdminDashboardView.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { IoMdSchool }    from "react-icons/io";
import { BiSolidSchool } from "react-icons/bi";
import {
  MdBarChart,
  MdWarningAmber,
} from "react-icons/md";
import SuperAdminSidebar from "../SuperAdSidebar";
import "../styles/SuperAdminDashboard.css";
import { buildKpiRecommendations, buildInsightView } from "../../utils/kpiRecommendations";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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
  const clampedTarget   = Math.min(target, 100);
  const progressOffset  = circumference * (1 - clampedProgress / 100) + 0.5;
  const targetOffset    = circumference * (1 - clampedTarget   / 100) + 0.5;
  const isGood = targetDir === "below"
    ? (target < 100 ? progress <= target : progress === 0)
    : progress >= target;
  const progressColor = isGood ? "#00BC7D" : "#F59E0B";
  const targetColor   = "#324D87";

  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={7} />
      {target > 0 && (
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={targetColor} strokeWidth={4}
          strokeOpacity={0.18}
          strokeDasharray={circumference}
          strokeDashoffset={targetOffset}
          strokeLinecap="butt"
          style={{ shapeRendering: "geometricPrecision" }}
        />
      )}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={progressColor} strokeWidth={7}
        strokeDasharray={circumference}
        strokeDashoffset={progressOffset}
        strokeLinecap="butt"
        style={{ shapeRendering: "geometricPrecision" }}
      />
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

function KpiProgressCard({ category, label, value, progress, target, targetLabel, targetDir = "above", trend, isCount, status }) {
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

  // Mirrors the isGood logic in RadialGauge exactly so the warning fires
  // whenever the gauge would show amber — including the target===100 sentinel.
  // College KPIs carry a `status` from the shared KPI result (raw percentage vs
  // target), so the card never re-derives it from the rounded value. SHS cards
  // have no status and keep the original rule.
  const isNotMet = status !== undefined
    ? status === "not_met"
    : target > 0 && (
        targetDir === "below"
          ? (target < 100 ? progress > target : progress > 0)
          : progress < target
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
              <MdWarningAmber size={13} />
              Goal not met — click for suggestions
            </div>
          )}
          {!isNotMet && status !== undefined && (
            <div
              className="kpi-alert-text"
              style={{ color: "#45556C" }}
              onClick={() => window.dispatchEvent(new CustomEvent('openKpiModal', { detail: { label } }))}
            >
              <MdBarChart size={13} />
              View insights
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
  // Ported from Admin: 'Employment Rate' replaces 'Active Programs' since
  // kpis2's College stat card set now matches Admin's exactly (see
  // SuperAdminDashboard.jsx). 'Active Programs' icon removed as it no longer
  // corresponds to any rendered label.
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
  'Retention Rate': {
    bg: '#F0FDF4',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
};

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

function CareerAlignmentChart({ data, title, subtitle, height = 300, navigateTo }) {
  const content = (!data || data.length === 0)
    ? <EmptyChart height={height} />
    : (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="program"
            tick={{ fontSize: 11, fontFamily: 'Lexend, Arimo, Arial' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            label={{
              value: 'Alignment Rate (%)',
              angle: -90,
              position: 'insideLeft',
              offset: -5,
              style: { fontSize: 11, fill: '#6A7282', fontFamily: 'Lexend, Arimo, Arial' },
            }}
          />
          <Tooltip
            formatter={(value, name) => [
              `${value}%`,
              name === 'predicted' ? 'Predicted' : 'Actual',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => value === 'predicted' ? 'Predicted Rate' : 'Actual Rate'}
          />
          <Bar dataKey="actual"    name="actual"    fill="#00BC7D" radius={[6, 6, 0, 0]} />
          <Bar dataKey="predicted" name="predicted" fill="#324D87" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );

  return navigateTo
    ? <NavigableChartCard title={title} subtitle={subtitle} to={navigateTo}>{content}</NavigableChartCard>
    : <ChartCard title={title} subtitle={subtitle}>{content}</ChartCard>;
}

function ShsContinuedStudiesChart({ data, title, subtitle, height = 300 }) {
  const content = (!data || data.length === 0)
    ? <EmptyChart height={height} />
    : (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(value) => `${value} alumni`} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );

  return <ChartCard title={title} subtitle={subtitle}>{content}</ChartCard>;
}

const staticFallbackSuggestions = (label) => {
  const map = {
    "Absorption from Internship": [
      "Strengthen industry partnerships for internship-to-hire conversion.",
      "Improve internship quality monitoring and employer relationships.",
    ],
    "Employed Within 2 Yrs of Graduation": [
      "Enhance career placement services and job fair frequency.",
      "Conduct job readiness workshops before graduation.",
    ],
    "Employed in Field / Related Field": [
      "Align curriculum with current industry requirements.",
      "Increase internship relevance to degree programs.",
    ],
    "Employed Outside Field of Specialization": [
      "Review program-industry alignment each academic year.",
      "Provide career guidance and mentoring from Year 1.",
    ],
    "Engaged in Entrepreneurship": [
      "Offer startup incubation and entrepreneurship training programs.",
      "Promote access to seed funding and mentorship networks.",
    ],
    "Occupying Supervisory Positions": [
      "Provide leadership development training for senior alumni.",
      "Encourage career progression planning through alumni mentoring.",
    ],
    "Pursued Graduate Studies (within 1 yr)": [
      "Promote postgraduate opportunities through alumni advisors.",
      "Offer merit-based scholarships and research assistantships.",
    ],
    "Pursued Graduate Studies at NU": [
      "Strengthen internal graduate programs and alumni loyalty incentives.",
      "Offer exclusive alumni discounts and flexible graduate schedules.",
    ],
    "In Positions in Professional Organizations": [
      "Encourage alumni to join and lead professional associations.",
      "Host networking events connecting alumni to professional bodies.",
    ],
    "SHS Alumni Who Pursued Undergraduate Degree": [
      "Strengthen SHS-to-college transition programs.",
      "Provide early college counseling for Grade 12 students.",
    ],
    "SHS Alumni Who Pursued Undergraduate at NU": [
      "Offer SHS-to-NU enrollment incentives.",
      "Highlight NU undergraduate programs to current SHS students.",
    ],
  };
  return map[label] || ["Review current data to generate recommendations."];
};
// KPI insights modal: everything shown is read from the same result object the card uses
// (grouped by buildInsightView in utils/kpiRecommendations.js). Nothing is calculated here.
function InsightSection({ title, hint, children }) {
  return (
    <section className="kpi-section">
      <h3 className="kpi-section-title">{title}</h3>
      {hint && <p className="kpi-section-hint">{hint}</p>}
      {children}
    </section>
  );
}

function ActionList({ actions }) {
  return (
    <ol className="kpi-actions">
      {actions.map((a, i) => {
        const text  = typeof a === "string" ? a : a.text;
        const basis = typeof a === "string" ? null : a.basis;
        const general = typeof a === "string" ? false : a.general;
        return (
          <li key={`act-${i}`} className="kpi-action">
            <span className="kpi-action-no" aria-hidden="true">{i + 1}</span>
            <div className="kpi-action-body">
              <p className="kpi-action-text">{text}</p>
              {basis && (
                <p className="kpi-action-basis">
                  <span className="kpi-tag kpi-tag--evidence">Survey evidence</span>
                  {basis}
                </p>
              )}
              {!basis && general && (
                <p className="kpi-action-basis">
                  <span className="kpi-tag kpi-tag--general">General practice</span>
                  Not derived from the survey.
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function AnswerBlock({ block }) {
  if (block.type === "stat") {
    return (
      <div className="kpi-answer">
        <p className="kpi-answer-q">{block.question}</p>
        <p className="kpi-answer-stat">{block.value}</p>
        <p className="kpi-answer-meta">{block.meta}</p>
        {block.note && <p className="kpi-answer-meta">{block.note}</p>}
      </div>
    );
  }
  return (
    <div className="kpi-answer">
      <p className="kpi-answer-q">{block.question}</p>
      <ul className="kpi-bars">
        {block.items.map((item) => (
          <li key={item.label} className="kpi-bar-row">
            <span className="kpi-bar-label">{item.label}</span>
            <span className="kpi-bar-count">{item.count}</span>
            <span className="kpi-bar-track" aria-hidden="true">
              <i style={{ width: `${(item.count / block.max) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
      <p className="kpi-answer-meta">
        {block.meta}
        {block.more > 0 ? ` · ${block.more} more answer${block.more === 1 ? "" : "s"} not shown` : ""}
      </p>
    </div>
  );
}

function KpiAlertModal({ label, onClose, kpiResult }) {
  // The modal is mounted fresh each time it opens, so this seed gives a new draw of
  // wording and eligible suggestions per opening. It never changes a number or finding.
  const [seed] = useState(() => Math.floor(Math.random() * 2147483647));
  const rec      = buildKpiRecommendations(kpiResult, { seed });
  const view     = buildInsightView(kpiResult, rec);
  const fallback = rec ? null : staticFallbackSuggestions(label);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="kpi-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kpi-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="kpi-modal">

        {/* ── HEADER ── */}
        <div className="kpi-modal-header">
          <h2 id="kpi-modal-title">{label}</h2>
        </div>

        <div className="kpi-modal-body">
          {view ? (
            <>
              {/* ── RESULT ── */}
              {view.hero && (
                <div className="kpi-hero">
                  <div className="kpi-hero-row">
                    <span className="kpi-hero-value">{view.hero.value}<small>%</small></span>
                    <span className="kpi-hero-frac"><b>{view.hero.n} of {view.hero.d}</b> alumni qualify</span>
                  </div>
                  <div
                    className="kpi-hero-bar"
                    role="img"
                    aria-label={`${view.hero.value} percent`}
                  >
                    <i style={{ width: `${Math.min(Math.max(view.hero.value, 0), 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="kpi-chips">
                <span className={`kpi-chip kpi-chip--${view.tone}`}>{view.badge}</span>
                {view.chips.map((c) => (
                  <span key={c.text} className={`kpi-chip kpi-chip--${c.tone === "warn" ? "warn" : "plain"}`}>{c.text}</span>
                ))}
              </div>

              {view.message && (
                <div className="kpi-message">
                  <p className="kpi-message-title">{view.message.title}</p>
                  <p className="kpi-message-text">{view.message.text}</p>
                </div>
              )}

              {/* ── WHO IS INCLUDED ── */}
              {view.included && (
                <InsightSection title="Who is included">
                  <dl className="kpi-kv">
                    {view.included.rows.map(([k, v]) => (
                      <div key={k} className="kpi-kv-row">
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {view.included.leftOut && <p className="kpi-answer-meta">{view.included.leftOut}</p>}
                  {view.included.note && <p className="kpi-answer-meta">{view.included.note}</p>}
                </InsightSection>
              )}

              {/* ── WHAT ALUMNI ANSWERED ── */}
              {view.answers.length > 0 && (
                <InsightSection title="What alumni answered">
                  {view.answers.map((block) => (
                    <AnswerBlock key={block.question} block={block} />
                  ))}
                </InsightSection>
              )}

              {/* ── BY PROGRAM ── */}
              {view.byProgram && (
                <InsightSection title={view.byProgram.title}>
                  <dl className="kpi-kv">
                    {view.byProgram.rows.map(([k, v]) => (
                      <div key={k} className="kpi-kv-row">
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {view.byProgram.note && <p className="kpi-answer-meta">{view.byProgram.note}</p>}
                </InsightSection>
              )}

              {/* ── CAUTION ── */}
              {view.caution && <p className="kpi-caution">{view.caution}</p>}

              {/* ── SUGGESTED ACTIONS ── */}
              <InsightSection title="Suggested actions" hint={view.actionsHint}>
                <ActionList actions={view.actions} />
              </InsightSection>
            </>
          ) : (
            <>
              <div className="kpi-chips">
                <span className="kpi-chip kpi-chip--warn">Below Target Performance</span>
              </div>
              <p className="kpi-modal-desc">
                This KPI is currently not meeting its expected goal. Here are some recommended actions to improve performance:
              </p>
              <InsightSection title="Suggested actions">
                <ActionList actions={fallback} />
              </InsightSection>
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="kpi-modal-footer">
          <button className="kpi-modal-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

const SuperAdminDashboardView = ({
  activeKpiTab,
  setActiveKpiTab,
  kpiData,
  kpis2,
  shsKpis,
  employmentAlignmentData,
  employmentStatusData,
  inDemandSkillsData,
  careerAlignmentData,
  loadingCharts,
  alumniType,
  shsPostGradPathData,
  shsContinuedStudiesData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const focus = location.state?.focus;

  const [activeKpiModal, setActiveKpiModal] = useState(null);

  useEffect(() => {
    const handler = (e) => setActiveKpiModal(e.detail.label);
    window.addEventListener('openKpiModal', handler);
    return () => window.removeEventListener('openKpiModal', handler);
  }, []);

  // Ported from Admin: force the KPI tab to "seniorrhigh" for SHS users and
  // back to "employment" for College users, so an SHS Super Admin cannot
  // land on / linger on a College-only tab (Employment/Career/Education).
  useEffect(() => {
    if (alumniType === 'shs' && activeKpiTab !== 'seniorrhigh') {
      setActiveKpiTab('seniorrhigh');
    } else if (alumniType !== 'shs' && activeKpiTab === 'seniorrhigh') {
      setActiveKpiTab('employment');
    }
  }, [alumniType, activeKpiTab, setActiveKpiTab]);

  return (
    <div className="super-dashboard-layout">
      <SuperAdminSidebar />

      <main className="super-dashboard-main">

        <div className="super-dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome! Here's the complete institutional overview.</p>
        </div>

        <div className="super-dashboard-section">
          <div className="section-header">
            <BiSolidSchool className="section-icon" />
            <div className="section-title">Institutional KPI</div>
          </div>

          {/* Ported from Admin: SHS users see only the SENIOR HIGH tab button,
              matching Admin's department-scoped tab bar exactly. */}
          <div className="kpi-tabs">
            {(alumniType === 'shs'
              ? [{ id: "seniorrhigh", label: "SENIOR HIGH" }]
              : [
                  { id: "employment", label: "EMPLOYMENT"      },
                  { id: "career",     label: "CAREER PROGRESS" },
                  { id: "education",  label: "EDUCATION"       },
                ]
            ).map(({ id, label }) => (
              <button
                key={id}
                className={`kpi-tab-btn${activeKpiTab === id ? " active" : ""}`}
                onClick={() => setActiveKpiTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Ported from Admin: kpi-grid--shs modifier class for SHS layout */}
          <div className={`kpi-grid${alumniType === 'shs' ? ' kpi-grid--shs' : ''}`}>
            {kpiData[activeKpiTab].map(kpi => (
              <KpiProgressCard key={kpi.id} {...kpi} />
            ))}
          </div>
        </div>

        {alumniType === 'shs' ? (

          <>
            <div className="super-dashboard-section">
              <div className="section-header">
                <IoMdSchool className="section-icon" />
                <div className="section-title">SHS Alumni</div>
              </div>
              <div className="alumni-tracer-grid">
                {shsKpis.map((k) => (
                  <KpiStatCard key={k.label} {...k} />
                ))}
              </div>
            </div>

            <div className="charts-row">
              <CustomPieChart
                data={shsPostGradPathData}
                title="Post-Graduation Path"
                subtitle="Where SHS alumni went after graduation"
                height={280}
              />
            </div>

            <div className="full-width-chart">
              <ShsContinuedStudiesChart
                data={shsContinuedStudiesData}
                title="Continued Studies: NU vs Other Schools"
                subtitle="% of SHS alumni who pursued undergrad at NU vs elsewhere"
                height={300}
              />
            </div>
          </>

        ) : (

          <>
            <div className="super-dashboard-section">
              <div className="section-header">
                <IoMdSchool className="section-icon" />
                <div className="section-title">College Alumni</div>
              </div>
              <div className="alumni-tracer-grid">
                {kpis2.map((k) => (
                  <KpiStatCard key={k.label} {...k} />
                ))}
              </div>
            </div>

            <div className="charts-row">
              <CustomBarChart
                data={employmentAlignmentData}
                dataKey="alignment"
                nameKey="name"
                title="Degree Alignment Rate"
                subtitle="Percentage of alumni aligned with their degree per program"
                height={280}
                navigateTo="/superadmin/response-and-analytics"
              />
              <CustomPieChart
                data={employmentStatusData}
                title="Employment Status Distribution"
                subtitle="Breakdown of alumni by employment type"
                height={280}
                navigateTo="/superadmin/response-and-analytics"
              />
            </div>

            <div className="full-width-chart">
              <CareerAlignmentChart
                data={careerAlignmentData}
                title="Career Alignment Prediction"
                subtitle="Predicted vs. actual career alignment rate by program"
                height={300}
                navigateTo="/superadmin/response-and-analytics"
              />
            </div>

            <div className="full-width-chart">
              <CustomBarChart
                data={inDemandSkillsData}
                dataKey="count"
                nameKey="name"
                title="Most In-Demand Skills"
                subtitle="Most useful skills reported by alumni"
                height={300}
              />
            </div>
          </>

        )}

        {activeKpiModal && (
          <KpiAlertModal
            label={activeKpiModal}
            onClose={() => setActiveKpiModal(null)}
            kpiResult={Object.values(kpiData || {})
              .flat()
              .find((k) => k.label === activeKpiModal)?.result}
          />
        )}

      </main>
    </div>
  );
};

export default SuperAdminDashboardView;