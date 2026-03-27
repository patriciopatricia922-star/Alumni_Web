import '../styles/Predictiveanalytics.css';
import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineChartBar, HiOutlineBuildingOffice2, HiOutlineArrowTrendingUp, HiOutlineChevronRight } from 'react-icons/hi2';
import { LuArrowUpRight, LuArrowRight } from 'react-icons/lu';

const Predictiveanalyticsview = (props) => {
  const {
    activePage,
    setActivePage,
    pageTabs,
    overviewTrend,
    departmentCards,
    selectedDepartment,
    selectedDepartmentData,
    onDepartmentClick,
    sidebar,
    refreshBar 
  } = props;

  // ── Animation state ──────────────────────────────────────
  const [animProgress, setAnimProgress] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (activePage !== 'overview' || !overviewTrend.length) return;

    // Reset and re-animate every time overview is shown
    setAnimProgress(0);
    let start = null;
    const duration = 1200; // ms

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [activePage, overviewTrend]);

  // ── Chart math — dynamic range from real data ────────────
  const values = overviewTrend.map((d) => d.value);
  const dataMin = values.length ? Math.min(...values) : 0;
  const dataMax = values.length ? Math.max(...values) : 100;

  // Add 10% padding above and below so line is never at the edge
  const padding = Math.max((dataMax - dataMin) * 0.5, 5);
  const MIN = Math.max(0,   Math.floor(dataMin - padding));
  const MAX = Math.min(100, Math.ceil(dataMax  + padding));
  const RANGE = MAX - MIN;

  const toX = (i) =>
    overviewTrend.length > 1 ? (i / (overviewTrend.length - 1)) * 100 : 50;
  const toY = (v) => ((MAX - v) / RANGE) * 100;

  // Animated points — only draw up to animProgress along the line
  const animatedTrend = overviewTrend.map((d, i) => {
    const t = i / Math.max(overviewTrend.length - 1, 1);
    // Interpolate value for points past the animation head
    if (t <= animProgress) return d;
    // Point is ahead of animation — interpolate from previous
    const prev = overviewTrend[i - 1];
    if (!prev) return null;
    const segT = (animProgress - (i - 1) / (overviewTrend.length - 1)) /
                 (1 / (overviewTrend.length - 1));
    return { year: d.year, value: prev.value + (d.value - prev.value) * segT };
  }).filter(Boolean);

  const linePoints = animatedTrend
    .map((d, i) => `${toX(i)},${toY(d.value)}`)
    .join(' ');

  // Full (static) points for bands
  const upperPoints = [
    ...overviewTrend.map((d, i) => `${toX(i)},${toY(d.value + padding * 0.6)}`),
    ...overviewTrend.slice().reverse()
      .map((d, i) => `${toX(overviewTrend.length - 1 - i)},${toY(d.value)}`),
  ].join(' ');

  const lowerPoints = [
    ...overviewTrend.map((d, i) => `${toX(i)},${toY(d.value)}`),
    ...overviewTrend.slice().reverse()
      .map((d, i) => `${toX(overviewTrend.length - 1 - i)},${toY(d.value - padding * 0.6)}`),
  ].join(' ');

  const changeVal = values.length > 1
    ? overviewTrend[overviewTrend.length - 1].value - overviewTrend[0].value
    : 0;

  // Y-axis labels — evenly spaced between MIN and MAX
  const yLabels = [MAX, Math.round(MIN + RANGE * 0.66), Math.round(MIN + RANGE * 0.33), MIN];

  return (
    <div className="pa-layout">
      {sidebar}
      <main className="pa-main">

        {/* Page Header */}
        <div className="pa-page-header">
          <h1 className="pa-page-title">Predictive Analytics</h1>
          <p className="pa-page-subtitle">
            Welcome back! Here's what's happening with your alumni insights.
          </p>
        </div>

        {/* Breadcrumb Tabs */}
        <div className="pa-tab-row">
          {pageTabs.map((tab, idx) => (
            <React.Fragment key={tab.key}>
              <button
                className={`pa-tab-btn ${
                  activePage === tab.key ||
                  (tab.isDepartment && activePage === 'department-detail')
                    ? 'active' : ''
                }`}
                onClick={() => setActivePage(tab.key)}
              >
                {tab.key === 'overview'
                  ? <HiOutlineChartBar size={16} />
                  : <HiOutlineBuildingOffice2 size={16} />
                }
                {tab.label}
              </button>
              {idx < pageTabs.length - 1 && (
                <HiOutlineChevronRight size={14} color="#90A1B9" />
              )}
            </React.Fragment>
          ))}
          {/* Spacer pushes refresh to the right */}
            <div className="pa-tab-spacer" />
            {refreshBar}
        </div>

        

        {/* ── PAGE 1.1 — Overview Chart ── */}
        {activePage === 'overview' && overviewTrend.length > 0 && (
          <div className="pa-chart-card">

            {/* Header */}
            <div className="pa-chart-header">
              <div className="pa-chart-icon">
                <HiOutlineArrowTrendingUp size={32} color="#155DFC" />
              </div>
              <div className="pa-chart-header-text">
                <h2 className="pa-chart-title">Career to Degree Alignment</h2>
                <p className="pa-chart-subtitle">
                  Predicted alignment rates for all departments
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="pa-chart-legend">
              <div className="pa-legend-item">
                <div className="pa-legend-swatch upper" />
                <span className="pa-legend-label upper">Upper Bound</span>
              </div>
              <div className="pa-legend-item">
                <div className="pa-legend-swatch lower" />
                <span className="pa-legend-label lower">Lower Bound</span>
              </div>
              <div className="pa-legend-item">
                <div className="pa-legend-swatch predicted" />
                <span className="pa-legend-label predicted">Predicted Rate</span>
              </div>
            </div>

            {/* Chart */}
            <div className="pa-chart-shell">
              {/* Y axis */}
              <div className="pa-chart-y-axis">
                {yLabels.map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>

              {/* Chart area */}
              <div className="pa-chart-main">
                {/* Grid lines */}
                <div className="pa-chart-grid">
                  <span /><span /><span /><span />
                </div>

                <svg
                  className="pa-chart-svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Confidence bands — static, fade in */}
                  <polygon
                    points={upperPoints}
                    fill="rgba(219,234,254,0.5)"
                    stroke="none"
                    style={{ opacity: animProgress }}
                  />
                  <polygon
                    points={lowerPoints}
                    fill="rgba(219,234,254,0.2)"
                    stroke="none"
                    style={{ opacity: animProgress }}
                  />

                  {/* Animated predicted line */}
                  {animatedTrend.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={linePoints}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}

                  {/* Data point dots — appear as line reaches them */}
                  {overviewTrend.map((d, i) => {
                    const t = i / Math.max(overviewTrend.length - 1, 1);
                    const dotOpacity = Math.max(0, Math.min(1,
                      (animProgress - t) / 0.1
                    ));
                    return (
                      <circle
                        key={d.year}
                        cx={toX(i)}
                        cy={toY(d.value)}
                        r="1.8"
                        fill="#FFFFFF"
                        stroke="#3B82F6"
                        strokeWidth="1.2"
                        vectorEffect="non-scaling-stroke"
                        style={{ opacity: dotOpacity }}
                      />
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="pa-chart-x-axis">
                  {overviewTrend.map((d) => (
                    <span key={d.year}>{d.year}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary bar */}
            <div className="pa-chart-summary">
              <div className="pa-summary-block">
                <span className="pa-summary-label">Current (2025)</span>
                <strong>{overviewTrend[0].value}%</strong>
              </div>
              <div className="pa-summary-arrow">
                <LuArrowRight size={24} color="#51A2FF" />
              </div>
              <div className="pa-summary-block">
                <span className="pa-summary-label">Predicted (2030)</span>
                <strong>{overviewTrend[overviewTrend.length - 1].value}%</strong>
              </div>
              <div className="pa-summary-change">
                <span className="pa-trend-badge">
                  <LuArrowUpRight size={12} color="#009966" />
                  +{changeVal}%
                </span>
              </div>
            </div>

            <button
              className="pa-chart-note-btn"
              onClick={() => setActivePage('departments')}
            >
              Click to view detailed breakdown by department →
            </button>
          </div>
        )}

        {/* ── PAGE 1.2 — Department Cards ── */}
        {activePage === 'departments' && (
          <div className="pa-department-grid">
            {departmentCards.map((card) => (
              <div
                key={card.key}
                className="pa-department-card"
                onClick={() => onDepartmentClick(card.key)}
              >
                <div className="pa-department-top">
                  <div className={`pa-dept-icon ${card.color}`}>
                    <HiOutlineBuildingOffice2 size={24} />
                  </div>
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
                    <span className="pa-metric-label">Predicted {overviewTrend[overviewTrend.length - 1]?.year ?? 2030}</span>
                    <span className={`pa-metric-value accent ${card.color}`}>
                      {card.predicted}%
                    </span>
                  </div>
                  <div className="pa-metric-change">
                    <span className="pa-trend-badge">
                      <LuArrowUpRight size={12} color="#009966" />
                      +{card.change}%
                    </span>
                  </div>
                </div>
                <div className="pa-department-footer">{card.programs} Programs</div>
              </div>
            ))}
          </div>
        )}

        {/* ── PAGE 1.3 — Program Bars ── */}
        {activePage === 'department-detail' && selectedDepartmentData && (
          <div className="pa-panel">
            <h2 className="pa-section-title">{selectedDepartmentData.title}</h2>
            <p className="pa-section-subtitle" style={{ marginBottom: 20 }}>
              {selectedDepartmentData.subtitle}
            </p>

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
              {selectedDepartmentData.programs.map((prog) => (
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
                      <span className="pa-overview-years">2025 → 2030</span>
                      <span className="pa-overview-values">
                        {prog.current}% → {prog.predicted}%
                      </span>
                    </div>
                  </div>
                  <div className="pa-bar-pair">
                    <div className="pa-bar-track">
                      <div
                        className="pa-bar-fill current"
                        style={{ width: `${prog.current}%` }}
                      />
                    </div>
                    <div className="pa-bar-track">
                      <div
                        className="pa-bar-fill predicted"
                        style={{ width: `${prog.predicted}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Predictiveanalyticsview;