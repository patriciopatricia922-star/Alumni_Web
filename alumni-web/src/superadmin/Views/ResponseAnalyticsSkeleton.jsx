// ============================================================================
// ResponseAnalyticsSkeleton.jsx
// ============================================================================
// Pure presentational component — no props, no state, no logic.
// Mirrors the exact pixel geometry of ResponseAnalyticsView so the layout
// is stable and fully populated the instant data arrives (zero layout shift).
//
// Architecture contract:
//   - Rendered by ResponseAnalytics (logic controller) when loading === true
//   - AdminSidebar is included here so it renders immediately on mount,
//     not after the Supabase fetch resolves
//   - ResponseAnalyticsView is NOT modified
//   - All skeleton classes use the ra-skel-* namespace — zero collision
//     with existing ResponseAnalytics.css rules
//   - CSS lives in ResponseAnalyticsSkeleton.css, imported here
// ============================================================================

import React from 'react';
import SuperAdSidebar from '../SuperAdSidebar';
import '../styles/ResponseAnalyticsSkeleton.css';

// ─── Primitive atom ───────────────────────────────────────────────────────────
// Width, height, borderRadius are inline for per-instance precision.
// The shimmer animation is applied via className.
const Bone = ({ width = '100%', height = 14, radius = 6, style = {} }) => (
  <div
    className="ra-skel-bone"
    style={{ width, height, borderRadius: radius, ...style }}
  />
);

// ─── Chart card skeleton ──────────────────────────────────────────────────────
// Mirrors .ra-chart-inner exactly (padding 24px, border, border-radius 12px).
// chartHeight matches the real chart height so the card is the same total height.
const ChartCardSkeleton = ({ chartHeight = 190, titleWidth = '52%' }) => (
  <div className="ra-chart-inner ra-skel-chart-inner">
    {/* .ra-chart-title: 18px text + border-bottom + margin-bottom 20px */}
    <div className="ra-skel-chart-title-row">
      <Bone width={titleWidth} height={18} radius={6} />
    </div>

    {/* Chart body placeholder — mimics bar/pie/line area */}
    <div className="ra-skel-chart-body" style={{ height: chartHeight }}>
      {/* Horizontal baseline (x-axis) */}
      <div className="ra-skel-chart-axis ra-skel-chart-axis-x" />
      {/* Vertical baseline (y-axis) */}
      <div className="ra-skel-chart-axis ra-skel-chart-axis-y" />
      {/* Bar columns — varied heights to look organic */}
      <div className="ra-skel-bars">
        {[65, 40, 80, 55, 70, 45, 90].map((pct, i) => (
          <div
            key={i}
            className="ra-skel-bar"
            style={{ height: `${pct}%`, animationDelay: `${i * 0.07}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Pie chart card skeleton ──────────────────────────────────────────────────
// For Gender Distribution and Employment Status which use PieChart.
const PieChartCardSkeleton = ({ titleWidth = '48%' }) => (
  <div className="ra-chart-inner ra-skel-chart-inner">
    <div className="ra-skel-chart-title-row">
      <Bone width={titleWidth} height={18} radius={6} />
    </div>
    <div className="ra-skel-chart-body" style={{ height: 190, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
      <div className="ra-skel-pie" />
    </div>
  </div>
);

// ─── Sentiment card skeleton ──────────────────────────────────────────────────
// Mirrors the "Overall Sentiment" card: big number + star row + label.
const SentimentCardSkeleton = () => (
  <div className="ra-chart-inner ra-skel-chart-inner">
    <div className="ra-skel-chart-title-row">
      <Bone width="56%" height={18} radius={6} />
    </div>
    <div style={{ height: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      {/* Big number */}
      <Bone width={64} height={52} radius={10} />
      {/* Star row */}
      <Bone width={120} height={22} radius={6} />
      {/* "Average satisfaction rating" label */}
      <Bone width={160} height={12} radius={5} />
    </div>
  </div>
);

// ─── Overview tab skeleton ────────────────────────────────────────────────────
// Mirrors the full .ra-charts-container content: 7 chart groups in order.
const OverviewSkeleton = () => (
  <div className="ra-charts-container">

    {/* personal-information: ROW — Pie | Bar 190h */}
    <div className="ra-chart-row">
      <PieChartCardSkeleton titleWidth="52%" />
      <ChartCardSkeleton chartHeight={190} titleWidth="44%" />
    </div>

    {/* educational-information: SINGLE — Bar 250h */}
    <div className="ra-chart-single">
      <ChartCardSkeleton chartHeight={250} titleWidth="40%" />
    </div>

    {/* certification-achievements: SINGLE — Line 250h */}
    <div className="ra-chart-single">
      <ChartCardSkeleton chartHeight={250} titleWidth="36%" />
    </div>

    {/* employment-information: ROW — Pie | Bar 190h */}
    <div className="ra-chart-row">
      <PieChartCardSkeleton titleWidth="46%" />
      <ChartCardSkeleton chartHeight={190} titleWidth="34%" />
    </div>

    {/* job-experience: SINGLE — Bar 250h */}
    <div className="ra-chart-single">
      <ChartCardSkeleton chartHeight={250} titleWidth="38%" />
    </div>

    {/* skills-competencies: SINGLE — Bar 250h */}
    <div className="ra-chart-single">
      <ChartCardSkeleton chartHeight={250} titleWidth="28%" />
    </div>

    {/* feedback-engagement: ROW — Bar 190h | Sentiment 190h */}
    <div className="ra-chart-row">
      <ChartCardSkeleton chartHeight={190} titleWidth="42%" />
      <SentimentCardSkeleton />
    </div>

  </div>
);

// ─── Table row skeleton ───────────────────────────────────────────────────────
// Mirrors a single tbody <tr>: avatar circle | name+email stack | batch badge | program | status badge.
// widths array varies the name-bar width per row so rows look like real content.
const TABLE_ROW_NAME_WIDTHS = ['68%', '55%', '80%', '60%', '72%', '50%', '65%', '75%', '58%', '70%'];

const TableRowSkeleton = ({ nameWidth }) => (
  <tr className="ra-skel-tr">
    {/* NAME cell: avatar circle + name bar + email bar */}
    <td>
      <div className="ra-name-cell">
        <div className="ra-skel-avatar" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Bone width={nameWidth} height={12} radius={5} />
          <Bone width="80%" height={10} radius={4} />
        </div>
      </div>
    </td>
    {/* BATCH cell: badge-shaped bone */}
    <td>
      <Bone width={48} height={22} radius={6} style={{ margin: '0 auto' }} />
    </td>
    {/* PROGRAM cell: text bar */}
    <td>
      <Bone width="75%" height={12} radius={5} style={{ margin: '0 auto' }} />
    </td>
    {/* EMPLOYMENT STATUS cell: status badge bone */}
    <td>
      <Bone width={72} height={22} radius={8} style={{ margin: '0 auto' }} />
    </td>
  </tr>
);

// ─── Responses tab skeleton ───────────────────────────────────────────────────
// Mirrors the full responses tab: fixed header + thead + scrollable tbody rows + pagination.
const ResponsesSkeleton = () => (
  <div className="ra-table-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

    {/* Fixed header — "No of Respondents" + Export button */}
    <div className="ra-table-header" style={{ flexShrink: 0, paddingBottom: '12px' }}>
      <Bone width={160} height={13} radius={5} />
      <Bone width={90} height={38} radius={10} />
    </div>

    {/* Fixed column headers */}
    <table className="ra-table" style={{ flexShrink: 0, tableLayout: 'fixed' }}>
      <thead>
        <tr>
          {['NAME', 'BATCH', 'PROGRAM', 'EMPLOYMENT STATUS'].map(col => (
            <th key={col}>
              <Bone width="60%" height={10} radius={4} style={{ margin: '0 auto' }} />
            </th>
          ))}
        </tr>
      </thead>
    </table>

    {/* Scrollable tbody */}
    <div style={{ overflowY: 'auto', flex: 1 }}>
      <table className="ra-table" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col /><col /><col /><col />
        </colgroup>
        <tbody>
          {TABLE_ROW_NAME_WIDTHS.map((w, i) => (
            <TableRowSkeleton key={i} nameWidth={w} />
          ))}
        </tbody>
      </table>
    </div>

    {/* Fixed pagination */}
    <div className="ra-pagination" style={{ flexShrink: 0, marginTop: '12px' }}>
      <Bone width={160} height={12} radius={5} />
      <div style={{ display: 'flex', gap: 4 }}>
        {[80, 28, 28, 28, 28, 80].map((w, i) => (
          <Bone key={i} width={w} height={28} radius={6} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Composed full-page skeleton ──────────────────────────────────────────────
// activeTab is passed from the controller so the correct content zone is shown.
// Defaults to 'overview' — safe for the initial loading state.
const ResponseAnalyticsSkeleton = ({ activeTab = 'overview' }) => (
  <>
    <SuperAdSidebar />

    <div className="ra-page ra-skel-page">

      {/* HEADER */}
      <div className="ra-header">
        <Bone width={260} height={27} radius={7} />
        <Bone width={340} height={14} radius={5} style={{ marginTop: 4 }} />
      </div>

      {/* TABS */}
      <div className="ra-tabs-container">
        <div className="ra-tabs">
          <div className={`ra-tab${activeTab === 'overview' ? ' active' : ''} ra-skel-tab`}>
            <Bone width={100} height={13} radius={5} />
          </div>
          <div className={`ra-tab${activeTab === 'responses' ? ' active' : ''} ra-skel-tab`}>
            <Bone width={118} height={13} radius={5} />
          </div>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div className="ra-controls">
        {activeTab === 'overview' && (
          <div className="ra-controls-left" style={{ gap: 8 }}>
            {/* "Total Responses:" label + number */}
            <Bone width={105} height={13} radius={5} />
            <Bone width={32} height={20} radius={5} />
          </div>
        )}
        <div className="ra-controls-right">
          {activeTab === 'overview' && (
            /* Filter dropdown stub */
            <Bone width={200} height={34} radius={8} />
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className={`ra-content${activeTab === 'responses' ? ' responses' : ''}`}>
        {activeTab === 'overview'
          ? <OverviewSkeleton />
          : <ResponsesSkeleton />
        }
      </div>

    </div>
  </>
);

export default ResponseAnalyticsSkeleton;