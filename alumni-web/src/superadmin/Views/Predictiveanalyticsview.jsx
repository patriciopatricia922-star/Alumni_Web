// ============================================================================
// THIS IS THE UI superadmin
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

// ─── API base URL (mirrors the logic file) ───────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ============================================================================
// AI INSIGHTS CARD
// ============================================================================
const AIInsightsCard = ({ overviewTrend, departmentCards, selectedDepartmentData }) => {
  const [insights, setInsights] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const currentView = selectedDepartmentData ? 'department' : 'overview';

  const fetchAIInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build the payload that matches InsightsRequest on the backend
      const payload = {
        overview_trend: overviewTrend,
        departments: departmentCards.map((d) => ({
          code:           d.code,
          name:           d.name,
          current_rate:   d.current,
          predicted_rate: d.predicted,
          change:         d.change,
        })),
        current_view: currentView,
        selected_department: selectedDepartmentData
          ? { name: selectedDepartmentData.title, programs: selectedDepartmentData.programs }
          : null,
      };

      const response = await fetch(`${API_BASE}/api/ai/predictive-insights`, {
        method:  'POST',                                    // must be POST — backend is @app.post
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
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

  if (loading) {
    return (
      <div className="ai-insights-card loading">
        <div className="ai-insights-header"><FiCpu size={20} /><span>AI Insights</span></div>
        <div className="ai-loading-spinner" />
        <p>Analyzing predictive data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-insights-card error">
        <div className="ai-insights-header"><FiAlertCircle size={20} /><span>AI Insights</span></div>
        <p>{error}</p>
        <button onClick={fetchAIInsights} className="ai-retry-btn">Retry</button>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="ai-insights-card">
      <div className="ai-insights-header">
        <FiCpu size={20} />
        <span>AI Insights</span>
        <span className="ai-badge">Powered by AI</span>
      </div>

      <div className="ai-insights-content">
        {insights.key_insight && (
          <div className="ai-key-insight">
            <FiTrendingUp size={18} />
            <div className="ai-insight-text">
              <strong>Key Insight:</strong> {insights.key_insight}
            </div>
          </div>
        )}

        {insights.trend_analysis && (
          <div className="ai-trend-analysis">
            <FiBarChart2 size={18} />
            <div className="ai-insight-text">
              <strong>Trend Analysis:</strong> {insights.trend_analysis}
            </div>
          </div>
        )}

        {insights.department_insights?.length > 0 && (
          <div className="ai-department-insights">
            <strong>Department Highlights:</strong>
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
          <div className="ai-recommendations">
            <strong>AI Recommendations:</strong>
            <div className="ai-insight-bullets">
              {insights.recommendations.map((item, i) => (
                <div key={i} className="ai-bullet">
                  <span className="ai-bullet-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.risk_alert && (
          <div className="ai-risk-alert">
            <FiAlertCircle size={16} />
            <span className="risk-text">{insights.risk_alert}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN VIEW COMPONENT
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

  // ── Chart animation ────────────────────────────────────────────────────────
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

  // ── Guard: no data yet ─────────────────────────────────────────────────────
  if (!overviewTrend || overviewTrend.length === 0) {
    return (
      <div className="pa-layout">
        {sidebar}
        <main className="pa-main">
          <div className="pa-page-header">
            <h1 className="pa-page-title">Predictive Analytics</h1>
            <p className="pa-page-subtitle">Loading chart data...</p>
          </div>
          <div className="pa-tab-row">
            <div className="pa-breadcrumb">
              <span className="pa-breadcrumb-item active">Overview</span>
            </div>
            <div className="pa-tab-spacer" />
            {refreshBar}
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <p>No data available. Please check your connection.</p>
          </div>
        </main>
      </div>
    );
  }

  // ── Chart math ─────────────────────────────────────────────────────────────
  const values  = overviewTrend.map((d) => d.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const padding = Math.max((dataMax - dataMin) * 0.5, 5);
  const MIN     = Math.max(0,   Math.floor(dataMin - padding));
  const MAX     = Math.min(100, Math.ceil(dataMax  + padding));
  const RANGE   = MAX - MIN || 1;

  const toX = (i) => (overviewTrend.length > 1 ? (i / (overviewTrend.length - 1)) * 100 : 50);
  const toY = (v)  => ((MAX - v) / RANGE) * 100;

  const animatedTrend = overviewTrend
    .map((d, i) => {
      const t = i / Math.max(overviewTrend.length - 1, 1);
      if (t <= animProgress) return d;
      const prev = overviewTrend[i - 1];
      if (!prev) return null;
      const segLen = 1 / (overviewTrend.length - 1);
      const segT   = (animProgress - (i - 1) * segLen) / segLen;
      return { year: d.year, value: prev.value + (d.value - prev.value) * segT };
    })
    .filter(Boolean);

  const linePoints  = animatedTrend.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');
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

  // ── Page flags ─────────────────────────────────────────────────────────────
  const showOverview   = activePage === 'overview';
  const showDeptList   = activePage === 'departments';
  const showDeptDetail = activePage === 'department-detail' && !!selectedDepartment && !!selectedDepartmentData;

  const breadcrumbItems = (() => {
    const items = [
      { key: 'overview',     label: 'Overview',     icon: <HiOutlineChartBar size={16} />,        active: showOverview  },
      { key: 'departments',  label: 'Departments',  icon: <HiOutlineBuildingOffice2 size={16} />,  active: showDeptList  },
    ];
    if (showDeptDetail) {
      const dept = departmentCards?.find((c) => c.key === selectedDepartment);
      items.push({ key: 'department-detail', label: dept?.code || 'Detail', icon: <HiOutlineBuildingOffice2 size={16} />, active: true });
    }
    return items;
  })();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pa-layout">
      {sidebar}
      <main className="pa-main">

        <div className="pa-page-header">
          <h1 className="pa-page-title">Predictive Analytics</h1>
          <p className="pa-page-subtitle">Welcome back! Here's what's happening with your alumni insights.</p>
        </div>

        <div className="pa-tab-row">
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={item.key}>
              <button
                className={`pa-tab-btn ${item.active ? 'active' : ''}`}
                onClick={() => onBreadcrumbNav(item.key)}
              >
                {item.icon}{item.label}
              </button>
              {idx < breadcrumbItems.length - 1 && (
                <HiOutlineChevronRight size={14} color="#90A1B9" />
              )}
            </React.Fragment>
          ))}
          <div className="pa-tab-spacer" />
          {refreshBar}
        </div>

        {/* ── OVERVIEW ── */}
        {showOverview && (
          <div className="pa-overview-container">
            <div className="pa-chart-card">
              <div className="pa-chart-header">
                <div className="pa-chart-icon">
                  <HiOutlineArrowTrendingUp size={32} color="#155DFC" />
                </div>
                <div className="pa-chart-header-text">
                  <h2 className="pa-chart-title">Career to Degree Alignment</h2>
                  <p className="pa-chart-subtitle">Predicted alignment rates for all departments</p>
                </div>
              </div>

              <div className="pa-chart-legend">
                <div className="pa-legend-item"><div className="pa-legend-swatch upper"     /><span className="pa-legend-label">Upper Bound</span></div>
                <div className="pa-legend-item"><div className="pa-legend-swatch lower"     /><span className="pa-legend-label">Lower Bound</span></div>
                <div className="pa-legend-item"><div className="pa-legend-swatch predicted" /><span className="pa-legend-label">Predicted Rate</span></div>
              </div>

              <div className="pa-chart-shell">
                <div className="pa-chart-y-axis">
                  {yLabels.map((v) => <span key={v}>{v}</span>)}
                </div>
                <div className="pa-chart-main">
                  <div className="pa-chart-grid"><span /><span /><span /><span /></div>
                  <svg className="pa-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points={upperPoints} fill="rgba(219,234,254,0.5)" stroke="none" style={{ opacity: animProgress }} />
                    <polygon points={lowerPoints} fill="rgba(219,234,254,0.2)" stroke="none" style={{ opacity: animProgress }} />
                    {animatedTrend.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={linePoints}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    {overviewTrend.map((d, i) => {
                      const t       = i / Math.max(overviewTrend.length - 1, 1);
                      const opacity = Math.max(0, Math.min(1, (animProgress - t) / 0.1));
                      return (
                        <circle
                          key={d.year}
                          cx={toX(i)}
                          cy={toY(d.value)}
                          r="2"
                          fill="#FFFFFF"
                          stroke="#3B82F6"
                          strokeWidth="1.5"
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
                <div className="pa-summary-arrow"><LuArrowRight size={24} color="#51A2FF" /></div>
                <div className="pa-summary-block">
                  <span className="pa-summary-label">Predicted ({overviewTrend[overviewTrend.length - 1]?.year})</span>
                  <strong>{overviewTrend[overviewTrend.length - 1]?.value}%</strong>
                </div>
                <div className="pa-summary-change">
                  <span className="pa-trend-badge">
                    <LuArrowUpRight size={12} color="#009966" />
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

        {/* ── DEPARTMENTS LIST ── */}
        {showDeptList && (
          <div className="pa-department-grid">
            {departmentCards?.map((card) => (
              <div key={card.key} className="pa-department-card" onClick={() => onDepartmentClick(card.key)}>
                <div className="pa-department-top">
                  <div className={`pa-dept-icon ${card.color}`}><HiOutlineBuildingOffice2 size={24} /></div>
                  <HiOutlineChevronRight size={20} color="#90A1B9" />
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
                      <LuArrowUpRight size={12} color="#009966" />
                      +{card.change}%
                    </span>
                  </div>
                </div>
                <div className="pa-department-footer">{card.programs?.length} Programs</div>
              </div>
            ))}
          </div>
        )}

        {/* ── DEPARTMENT DETAIL ── */}
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
                          <LuArrowUpRight size={12} color="#009966" />
                          +{prog.change}%
                        </span>
                      </div>
                      <div className="pa-overview-stats">
                        <span className="pa-overview-years">
                          {overviewTrend[0]?.year} → {overviewTrend[overviewTrend.length - 1]?.year}
                        </span>
                        <span className="pa-overview-values">{prog.current}% → {prog.predicted}%</span>
                      </div>
                    </div>
                    <div className="pa-bar-pair">
                      <div className="pa-bar-track"><div className="pa-bar-fill current"   style={{ width: `${prog.current}%`   }} /></div>
                      <div className="pa-bar-track"><div className="pa-bar-fill predicted" style={{ width: `${prog.predicted}%` }} /></div>
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