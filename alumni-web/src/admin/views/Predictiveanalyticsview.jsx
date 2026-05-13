// ============================================================================
// Predictiveanalyticsview — UI / Presentation Layer (Refactored)
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  HiOutlineChartBar,
  HiOutlineBuildingOffice2,
  HiOutlineArrowTrendingUp,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import { LuArrowUpRight, LuArrowRight } from 'react-icons/lu';
import { FiBarChart2, FiTrendingUp, FiAlertCircle, FiCpu } from 'react-icons/fi';
import '../styles/PredictiveAnalytics.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ============================================================================
// Skeleton Components
// ============================================================================
const SkeletonLine = ({ width = '100%', height = '13px', style = {} }) => (
  <div className="pa-skeleton" style={{ width, height, borderRadius: '6px', ...style }} />
);

const SkeletonBlock = ({ height = '80px', style = {} }) => (
  <div className="pa-skeleton" style={{ width: '100%', height, borderRadius: '12px', ...style }} />
);

const AIInsightsSkeleton = () => (
  <div className="ai-insights-card ai-insights-skeleton">
    <div className="ai-insights-header">
      <div className="pa-skeleton" style={{ width: 20, height: 20, borderRadius: '50%' }} />
      <SkeletonLine width="100px" height="16px" />
      <div className="pa-skeleton ai-badge-skeleton" style={{ width: 90, height: 20, borderRadius: 20, marginLeft: 'auto' }} />
    </div>
    <div className="ai-insights-content">
      <SkeletonBlock height="72px" />
      <SkeletonBlock height="72px" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonLine width="60%" height="12px" />
        <SkeletonLine width="100%" height="40px" style={{ borderRadius: 10 }} />
        <SkeletonLine width="100%" height="40px" style={{ borderRadius: 10 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonLine width="60%" height="12px" />
        <SkeletonLine width="100%" height="40px" style={{ borderRadius: 10 }} />
      </div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="pa-chart-card">
    <div className="pa-chart-header" style={{ marginBottom: 24 }}>
      <div className="pa-skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
      <div className="pa-chart-header-text" style={{ marginLeft: 14, flex: 1, minWidth: 0 }}>
        <SkeletonLine width="55%" height="20px" style={{ marginBottom: 8 }} />
        <SkeletonLine width="40%" height="13px" />
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 24, flexWrap: 'wrap' }}>
      <SkeletonLine width="90px" height="13px" />
      <SkeletonLine width="90px" height="13px" />
      <SkeletonLine width="90px" height="13px" />
    </div>
    <SkeletonBlock height="260px" style={{ borderRadius: 12 }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
      <SkeletonLine width="120px" height="40px" style={{ borderRadius: 10 }} />
      <SkeletonLine width="24px" height="24px" />
      <SkeletonLine width="120px" height="40px" style={{ borderRadius: 10 }} />
      <SkeletonLine width="60px" height="24px" style={{ marginLeft: 'auto', borderRadius: 20 }} />
    </div>
  </div>
);

// ============================================================================
// AIInsightsCard
// ============================================================================
const AIInsightsCard = ({ overviewTrend, departmentCards, selectedDepartmentData }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentView = selectedDepartmentData ? 'department' : 'overview';

  const fetchAIInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        overview_trend: overviewTrend,
        departments: departmentCards.map((d) => ({
          code: d.code,
          name: d.name,
          current_rate: d.current,
          predicted_rate: d.predicted,
          change: d.change,
        })),
        current_view: currentView,
        selected_department: selectedDepartmentData
          ? { name: selectedDepartmentData.title, programs: selectedDepartmentData.programs }
          : null,
      };

      const response = await fetch(`${API_BASE}/api/ai/predictive-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}${body ? ': ' + body.slice(0, 120) : ''}`);
      }

      setInsights(await response.json());
    } catch (err) {
      console.error('AI Insights error:', err);
      setError('AI insights unavailable — ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (overviewTrend?.length > 0) fetchAIInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overviewTrend, currentView, selectedDepartmentData]);

  if (loading) return <AIInsightsSkeleton />;

  if (error) {
    return (
      <div className="ai-insights-card error">
        <div className="ai-insights-header">
          <FiAlertCircle size={20} />
          <span>AI Insights</span>
        </div>
        <p>{error}</p>
        <button onClick={fetchAIInsights} className="ai-retry-btn">Retry</button>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="ai-insights-card">
      <div className="ai-insights-header">
        <FiCpu size={18} />
        <span>AI Insights</span>
        <span className="ai-badge">Powered by AI</span>
      </div>

      <div className="ai-insights-content">
        {insights.key_insight && (
          <div className="ai-key-insight">
            <FiTrendingUp size={16} className="ai-icon-accent" />
            <div className="ai-insight-text">
              <strong>Key Insight</strong>
              <p>{insights.key_insight}</p>
            </div>
          </div>
        )}

        {insights.trend_analysis && (
          <div className="ai-trend-analysis">
            <FiBarChart2 size={16} className="ai-icon-accent" />
            <div className="ai-insight-text">
              <strong>Trend Analysis</strong>
              <p>{insights.trend_analysis}</p>
            </div>
          </div>
        )}

        {insights.department_insights?.length > 0 && (
          <div className="ai-section-block">
            <p className="ai-section-label">Department Highlights</p>
            <div className="ai-insight-bullets">
              {insights.department_insights.map((item, i) => (
                <div key={i} className="ai-bullet">
                  <span className="ai-bullet-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.recommendations?.length > 0 && (
          <div className="ai-section-block">
            <p className="ai-section-label">AI Recommendations</p>
            <div className="ai-insight-bullets">
              {insights.recommendations.map((item, i) => (
                <div key={i} className="ai-bullet">
                  <span className="ai-bullet-dot" style={{ background: '#3B82F6' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.risk_alert && (
          <div className="ai-risk-alert">
            <FiAlertCircle size={15} />
            <span className="risk-text">{insights.risk_alert}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Predictiveanalyticsview
// ============================================================================
const Predictiveanalyticsview = ({
  activePage,
  selectedDepartment,
  selectedDepartmentData,
  overviewTrend,
  departmentCards,
  onDepartmentClick,
  onBreadcrumbNav,
  onViewBreakdown,
  sidebar,
  refreshBar,
}) => {

  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (activePage !== 'overview' || !overviewTrend?.length) return;
    setAnimProgress(0);
    let start = null;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setAnimProgress(1 - Math.pow(1 - progress, 3));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [activePage, overviewTrend]);

  // Loading skeleton state
  if (!overviewTrend || overviewTrend.length === 0) {
    return (
      <div className="pa-layout">
        {sidebar}
        <main className="pa-main">
          <div className="pa-page-header">
            <div className="pa-skeleton" style={{ width: '60%', maxWidth: 220, height: 28, borderRadius: 8, marginBottom: 10 }} />
            <div className="pa-skeleton" style={{ width: '80%', maxWidth: 320, height: 14, borderRadius: 6 }} />
          </div>
          <div className="pa-tab-row">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="pa-skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
              <div className="pa-skeleton" style={{ width: 16, height: 16, borderRadius: 4 }} />
              <div className="pa-skeleton" style={{ width: 100, height: 32, borderRadius: 8 }} />
            </div>
            <div className="pa-tab-spacer" />
            <div className="pa-skeleton" style={{ width: 160, height: 36, borderRadius: 8, flexShrink: 0 }} />
          </div>
          <div className="pa-overview-container">
            <ChartSkeleton />
            <div className="pa-ai-card">
              <AIInsightsSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Chart math (unchanged)
  const values = overviewTrend.map((d) => d.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const padding = Math.max((dataMax - dataMin) * 0.5, 5);
  const MIN = Math.max(0, Math.floor(dataMin - padding));
  const MAX = Math.min(100, Math.ceil(dataMax + padding));
  const RANGE = MAX - MIN || 1;

  const toX = (i) => (overviewTrend.length > 1 ? (i / (overviewTrend.length - 1)) * 100 : 50);
  const toY = (v) => ((MAX - v) / RANGE) * 100;

  const animatedTrend = overviewTrend
    .map((d, i) => {
      const t = i / Math.max(overviewTrend.length - 1, 1);
      if (t <= animProgress) return d;
      const prev = overviewTrend[i - 1];
      if (!prev) return null;
      const segLen = 1 / (overviewTrend.length - 1);
      const segT = (animProgress - (i - 1) * segLen) / segLen;
      return { year: d.year, value: prev.value + (d.value - prev.value) * segT };
    })
    .filter(Boolean);

  const linePoints = animatedTrend.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');
  const upperPoints = [
    ...overviewTrend.map((d, i) => `${toX(i)},${toY(d.value + padding * 0.6)}`),
    ...overviewTrend.slice().reverse().map((d, i) => `${toX(overviewTrend.length - 1 - i)},${toY(d.value)}`),
  ].join(' ');
  const lowerPoints = [
    ...overviewTrend.map((d, i) => `${toX(i)},${toY(d.value)}`),
    ...overviewTrend.slice().reverse().map((d, i) => `${toX(overviewTrend.length - 1 - i)},${toY(d.value - padding * 0.6)}`),
  ].join(' ');

  const changeVal = overviewTrend.length > 1
    ? overviewTrend[overviewTrend.length - 1].value - overviewTrend[0].value
    : 0;
  const yLabels = [MAX, Math.round(MIN + RANGE * 0.66), Math.round(MIN + RANGE * 0.33), MIN];

  const showOverview = activePage === 'overview';
  const showDeptList = activePage === 'departments';
  const showDeptDetail = activePage === 'department-detail' && !!selectedDepartment && !!selectedDepartmentData;

  const breadcrumbItems = (() => {
    const items = [
      { key: 'overview', label: 'Overview', icon: <HiOutlineChartBar size={15} />, active: showOverview },
      { key: 'departments', label: 'Departments', icon: <HiOutlineBuildingOffice2 size={15} />, active: showDeptList },
    ];
    if (showDeptDetail) {
      const dept = departmentCards?.find((c) => c.key === selectedDepartment);
      items.push({
        key: 'department-detail',
        label: dept?.code || 'Detail',
        icon: <HiOutlineBuildingOffice2 size={15} />,
        active: true,
      });
    }
    return items;
  })();

  return (
    <div className="pa-layout">
      {sidebar}
      <main className="pa-main">

        <div className="pa-page-header">
          <h1 className="pa-page-title">Predictive Analytics</h1>
          <p className="pa-page-subtitle">
            Welcome back! Here's what's happening with your alumni insights.
          </p>
        </div>

        <div className="pa-tab-row">
          <div className="pa-breadcrumb-nav">
            {breadcrumbItems.map((item, idx) => (
              <React.Fragment key={item.key}>
                <button
                  className={`pa-tab-btn ${item.active ? 'active' : ''}`}
                  onClick={() => onBreadcrumbNav(item.key)}
                >
                  {item.icon}{item.label}
                </button>
                {idx < breadcrumbItems.length - 1 && (
                  <HiOutlineChevronRight size={13} color="#C0CCDA" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="pa-tab-spacer" />
          {refreshBar}
        </div>

        {/* ── OVERVIEW PAGE ── */}
        {showOverview && (
          <div className="pa-overview-container">
            <div className="pa-chart-card">
              <div className="pa-chart-header">
                <div className="pa-chart-icon">
                  <HiOutlineArrowTrendingUp size={28} color="#155DFC" />
                </div>
                <div className="pa-chart-header-text">
                  <h2 className="pa-chart-title">Career to Degree Alignment</h2>
                  <p className="pa-chart-subtitle">Predicted alignment rates for all departments</p>
                </div>
              </div>

              <div className="pa-chart-legend">
                <div className="pa-legend-item">
                  <div className="pa-legend-swatch upper" />
                  <span className="pa-legend-label">Upper Bound</span>
                </div>
                <div className="pa-legend-item">
                  <div className="pa-legend-swatch lower" />
                  <span className="pa-legend-label">Lower Bound</span>
                </div>
                <div className="pa-legend-item">
                  <div className="pa-legend-swatch predicted" />
                  <span className="pa-legend-label">Predicted Rate</span>
                </div>
              </div>

              <div className="pa-chart-shell">
                <div className="pa-chart-y-axis">
                  {yLabels.map((v) => <span key={v}>{v}</span>)}
                </div>
                <div className="pa-chart-main">
                  <div className="pa-chart-grid">
                    <span /><span /><span /><span />
                  </div>
                  <svg className="pa-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="upperGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="lowerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#155DFC" />
                      </linearGradient>
                      <filter id="lineShadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#3B82F6" floodOpacity="0.25" />
                      </filter>
                    </defs>
                    <polygon points={upperPoints} fill="url(#upperGrad)" stroke="none" style={{ opacity: animProgress }} />
                    <polygon points={lowerPoints} fill="url(#lowerGrad)" stroke="none" style={{ opacity: animProgress }} />
                    {animatedTrend.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="2.2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={linePoints}
                        vectorEffect="non-scaling-stroke"
                        filter="url(#lineShadow)"
                      />
                    )}
                    {overviewTrend.map((d, i) => {
                      const t = i / Math.max(overviewTrend.length - 1, 1);
                      const opacity = Math.max(0, Math.min(1, (animProgress - t) / 0.1));
                      return (
                        <circle
                          key={d.year}
                          cx={toX(i)}
                          cy={toY(d.value)}
                          r="2.2"
                          fill="#FFFFFF"
                          stroke="#3B82F6"
                          strokeWidth="1.8"
                          vectorEffect="non-scaling-stroke"
                          style={{ opacity }}
                        />
                      );
                    })}
                  </svg>
                  <div className="pa-chart-x-axis">
                    {overviewTrend.map((d) => <span key={d.year}>{d.year}</span>)}
                  </div>
                </div>
              </div>

              <div className="pa-chart-summary">
                <div className="pa-summary-block">
                  <span className="pa-summary-label">Current ({overviewTrend[0]?.year})</span>
                  <strong>{overviewTrend[0]?.value}%</strong>
                </div>
                <div className="pa-summary-arrow">
                  <LuArrowRight size={20} color="#93C5FD" />
                </div>
                <div className="pa-summary-block">
                  <span className="pa-summary-label">Predicted ({overviewTrend[overviewTrend.length - 1]?.year})</span>
                  <strong>{overviewTrend[overviewTrend.length - 1]?.value}%</strong>
                </div>
                <div className="pa-summary-change">
                  <span className="pa-trend-badge">
                    <LuArrowUpRight size={11} color="#009966" />
                    +{changeVal}%
                  </span>
                </div>
              </div>

              <button className="pa-view-breakdown-btn" onClick={onViewBreakdown}>
                Click to view detailed breakdown by department →
              </button>
            </div>

            <div className="pa-ai-card">
              <AIInsightsCard
                overviewTrend={overviewTrend}
                departmentCards={departmentCards}
                selectedDepartmentData={null}
              />
            </div>
          </div>
        )}

        {/* ── DEPARTMENTS LIST PAGE ── */}
        {showDeptList && (
          <div className="pa-department-grid">
            {departmentCards?.map((card) => (
              <div key={card.key} className="pa-department-card" onClick={() => onDepartmentClick(card.key)}>
                <div className="pa-department-top">
                  <div className={`pa-dept-icon ${card.color}`}>
                    <HiOutlineBuildingOffice2 size={22} />
                  </div>
                  <HiOutlineChevronRight size={18} color="#C0CCDA" />
                </div>
                <h3 className="pa-department-code">{card.code}</h3>
                <p className="pa-department-name">{card.name}</p>
                <div className="pa-department-metrics">
                  <div className="pa-metric-row">
                    <span className="pa-metric-label">Current Rate</span>
                    <span className="pa-metric-value">{card.current}%</span>
                  </div>
                  <div className="pa-metric-row">
                    <span className="pa-metric-label">Predicted {overviewTrend[overviewTrend.length - 1]?.year}</span>
                    <span className={`pa-metric-value accent ${card.color}`}>{card.predicted}%</span>
                  </div>
                  <div className="pa-metric-change">
                    <span className="pa-trend-badge">
                      <LuArrowUpRight size={11} color="#009966" />
                      +{card.change}%
                    </span>
                  </div>
                </div>
                <div className="pa-department-footer">{card.programs?.length} Programs</div>
              </div>
            ))}
          </div>
        )}

        {/* ── DEPARTMENT DETAIL PAGE ── */}
        {showDeptDetail && selectedDepartmentData && (
          <div className="pa-overview-container pa-detail-container">
            <div className="pa-panel">
              <h2 className="pa-section-title">{selectedDepartmentData.title}</h2>
              <p className="pa-section-subtitle">{selectedDepartmentData.subtitle}</p>

              <div className="pa-bar-legend">
                <div className="pa-bar-legend-item">
                  <span className="pa-bar-legend-swatch current" />
                  <span className="pa-summary-label">Current ({overviewTrend[0]?.year})</span>
                </div>
                <div className="pa-bar-legend-item">
                  <span className="pa-bar-legend-swatch predicted" />
                  <span className="pa-summary-label">Predicted ({overviewTrend[overviewTrend.length - 1]?.year})</span>
                </div>
              </div>

              <div className="pa-overview-list">
                {selectedDepartmentData.programs?.map((prog) => (
                  <div key={prog.code} className="pa-overview-card">
                    <div className="pa-overview-card-top">
                      <div className="pa-overview-card-title">
                        <span className="pa-program-code">{prog.code}</span>
                        <span className="pa-trend-badge">
                          <LuArrowUpRight size={11} color="#009966" />
                          +{prog.change}%
                        </span>
                      </div>
                      <div className="pa-overview-stats">
                        <span className="pa-overview-years">{overviewTrend[0]?.year} → {overviewTrend[overviewTrend.length - 1]?.year}</span>
                        <span className="pa-overview-values">{prog.current}% → {prog.predicted}%</span>
                      </div>
                    </div>
                    <div className="pa-bar-pair">
                      <div className="pa-bar-track">
                        <div className="pa-bar-fill current" style={{ width: `${prog.current}%` }} />
                      </div>
                      <div className="pa-bar-track">
                        <div className="pa-bar-fill predicted" style={{ width: `${prog.predicted}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pa-ai-card">
              <AIInsightsCard
                overviewTrend={overviewTrend}
                departmentCards={departmentCards}
                selectedDepartmentData={selectedDepartmentData}
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Predictiveanalyticsview;