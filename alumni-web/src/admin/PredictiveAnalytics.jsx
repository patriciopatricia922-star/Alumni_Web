// ============================================================================
// AdminPredictiveAnalytics — Business Logic Controller 
// ============================================================================
// Handles all business logic, Supabase API calls, ML service integration,
// AI insights fetching, data processing, and state management for
// predictive analytics.
// ============================================================================

import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Predictiveanalyticsview from './views/Predictiveanalyticsview';
import AdminSidebar from './components/AdminSidebar';

// ============================================================================
// API BASE URL — set VITE_API_BASE_URL in your .env to override localhost
// ============================================================================
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
// FIX (Rewards Archive RLS bug): this component used to call its own
// createClient(...) here with default options. Since it pointed at the same
// Supabase project as lib/supabase.js and specified no custom storageKey,
// it silently shared the same default localStorage auth-token key as the
// canonical client — but as a *separate* GoTrueClient instance with its own
// in-memory session and its own autoRefreshToken timer.
//
// When this instance's timer rotated the refresh token, it rewrote the
// shared localStorage session, but the canonical client elsewhere in the
// app (e.g. Content Management) never picked up that change and kept using
// its now-invalidated access token — which Postgres/PostgREST then treated
// as an unauthenticated request, causing RLS policies scoped `TO
// authenticated` to reject with 42501 on unrelated pages.
//
// Fix: reuse the single shared client instead of creating a second
// GoTrueClient instance. No query/behavior here changes — this component
// only ever did supabase.from('predictions').select(...), which the shared
// client supports identically.
// ============================================================================

// ============================================================================
// DEPARTMENT METADATA — maps department codes to display info
// ============================================================================
const DEPARTMENT_META = {
  SECA: { key: 'seca', name: 'School of Engineering, Computing, and Architecture',    color: 'blue'   },
  SBMA: { key: 'sbma', name: 'School of Business Management and Accountancy',        color: 'amber'  },
  SASE: { key: 'sase', name: 'School of Arts, Sciences and Education',               color: 'violet' },
};

// ============================================================================
// GRADUATION-BATCH (COHORT) HELPERS
// ============================================================================
// Each prediction row written by train_model.py carries the graduation_year of
// the batch it belongs to (batch 2025 -> 2025..2030, batch 2026 -> 2026..2031).
// Rows from before that migration have no graduation_year and are grouped as
// 'legacy' so the page keeps working until predictions are refreshed.
// ============================================================================
const ALL_BATCHES = 'All';

const batchKeyOf = (row) =>
  row.graduation_year != null ? String(row.graduation_year) : 'legacy';

const batchLabelOf = (key) => (key === 'legacy' ? 'Unassigned' : `Batch ${key}`);

// Label for a "years since graduation" position (used when batches are pooled).
const horizonLabel = (offset) => `Year ${offset}`;

// Average predicted_rate per year across the given rows -> [{ year, value }].
// (Same calculation the page always used for its overview trend.)
const averageByYear = (rows) => {
  const byYear = {};
  rows.forEach(({ year, predicted_rate }) => {
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(predicted_rate);
  });
  return Object.entries(byYear)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, rates]) => ({
      year:  String(year),
      value: Math.round(rates.reduce((s, r) => s + r, 0) / rates.length),
    }));
};

// Headline figures for one scope (one batch, or all batches together):
//   current   = observed current_rate, alumni-weighted by respondent_count
//   predicted = model prediction at the END of each batch's horizon, weighted
//               the same way
// Each (program, batch) pair counts once, however many forecast years it has.
// Rows without respondent_count (written before the migration) weigh 1.
const summarizeScope = (rows) => {
  const groups = {};
  rows.forEach((r) => {
    const k = `${r.program}|${batchKeyOf(r)}`;
    if (!groups[k]) {
      groups[k] = { w: r.respondent_count > 0 ? r.respondent_count : 1, first: r, last: r };
    }
    if (r.year < groups[k].first.year) groups[k].first = r;
    if (r.year > groups[k].last.year)  groups[k].last  = r;
  });
  const list = Object.values(groups);
  const totalW = list.reduce((s, g) => s + g.w, 0);
  const current = list.reduce(
    (s, g) => s + (g.first.current_rate ?? g.first.predicted_rate ?? 0) * g.w, 0
  ) / totalW;
  const predicted = list.reduce((s, g) => s + g.last.predicted_rate * g.w, 0) / totalW;
  const hasCounts = rows.some((r) => r.respondent_count > 0);
  return {
    current:     Math.round(current),
    predicted:   Math.round(predicted),
    firstYear:   Math.min(...list.map((g) => g.first.year)),
    lastYear:    Math.max(...list.map((g) => g.last.year)),
    horizon:     Math.max(...list.map((g) => g.last.year - g.first.year)),
    respondents: hasCounts ? list.reduce((s, g) => s + g.w, 0) : null,
  };
};

// Pool several batches onto one "years since graduation" timeline. Each
// (program, offset) becomes one row, weighted by respondent_count (1 when the
// count is missing). Because every batch is aligned by its own graduation year,
// a 2026 graduate's first prediction year is compared with a 2025 graduate's
// first prediction year -- never with their 2026 value.
const mergeByHorizon = (rows) => {
  const legacyYears = rows.filter((r) => r.graduation_year == null).map((r) => r.year);
  const legacyBase  = legacyYears.length ? Math.min(...legacyYears) : null;
  const merged = {};
  rows.forEach((r) => {
    const base   = r.graduation_year != null ? r.graduation_year : legacyBase;
    const offset = r.year - base;
    const k      = `${r.program}|${offset}`;
    const w      = r.respondent_count > 0 ? r.respondent_count : 1;
    if (!merged[k]) {
      merged[k] = { program: r.program, department: r.department, year: offset, w: 0, pred: 0, cur: 0 };
    }
    merged[k].w    += w;
    merged[k].pred += r.predicted_rate * w;
    merged[k].cur  += (r.current_rate ?? r.predicted_rate ?? 0) * w;
  });
  return Object.values(merged).map((m) => ({
    program:        m.program,
    department:     m.department,
    year:           m.year,
    predicted_rate: m.pred / m.w,
    current_rate:   m.cur / m.w,
  }));
};

// ============================================================================
// AdminPredictiveAnalytics — main logic controller
// ============================================================================
const AdminPredictiveAnalytics = () => {

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activePage,         setActivePage]         = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBatch,      setSelectedBatch]      = useState(ALL_BATCHES);

  // ── Refresh state ──────────────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState(null);

  // ── Predictions data state ─────────────────────────────────────────────────
  const [predictions, setPredictions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // ── Fetch predictions on mount ─────────────────────────────────────────────
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true })
          .order('program', { ascending: true });
        if (error) throw error;
        setPredictions(data || []);
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  // ── Graduation batches available in the data (options for the filter) ─────
  const batchOptions = useMemo(() => {
    const years = [
      ...new Set(
        predictions.map((r) => r.graduation_year).filter((y) => y != null)
      ),
    ]
      .sort((a, b) => a - b)
      .map(String);
    return [ALL_BATCHES, ...years];
  }, [predictions]);

  // If the chosen batch disappears (e.g. after a refresh), fall back to All.
  const activeBatch = batchOptions.includes(selectedBatch) ? selectedBatch : ALL_BATCHES;

  // ── Rows in scope for the selected batch ───────────────────────────────────
  const seriesRows = useMemo(
    () =>
      activeBatch === ALL_BATCHES
        ? predictions
        : predictions.filter((r) => batchKeyOf(r) === activeBatch),
    [predictions, activeBatch]
  );

  // ── One trend line per batch: [{ key, label, points: [{ year, value }] }] ──
  // A single batch selected -> one series. "All" -> one series per batch, each
  // on its own real calendar years (2025..2030 and 2026..2031).
  const trendSeries = useMemo(() => {
    const groups = {};
    seriesRows.forEach((r) => {
      const k = batchKeyOf(r);
      if (!groups[k]) groups[k] = [];
      groups[k].push(r);
    });
    return Object.keys(groups)
      .sort((a, b) => (a === 'legacy') - (b === 'legacy') || Number(a) - Number(b))
      .map((key) => ({
        key,
        label:  batchLabelOf(key),
        points: averageByYear(groups[key]),
      }));
  }, [seriesRows]);

  // Shared x-axis: every calendar year that any visible series has a point for.
  const trendYears = useMemo(
    () =>
      [...new Set(trendSeries.flatMap((s) => s.points.map((p) => p.year)))].sort(
        (a, b) => Number(a) - Number(b)
      ),
    [trendSeries]
  );

  // Rows feeding the department/program figures and the AI summary. With one
  // series these are simply the rows in scope; with several, the batches are
  // pooled by years-since-graduation (respondent-weighted per program).
  const summaryRows = useMemo(
    () => (trendSeries.length > 1 ? mergeByHorizon(seriesRows) : seriesRows),
    [trendSeries, seriesRows]
  );

  // ── Headline figures shown in the summary strip(s) ─────────────────────────
  // One entry per batch in scope. When several batches are shown ("All"), a
  // first "All batches" entry gives the overall figure across every alumnus.
  const trendSummaries = useMemo(() => {
    if (!seriesRows.length) return [];
    const groups = {};
    seriesRows.forEach((r) => {
      const k = batchKeyOf(r);
      if (!groups[k]) groups[k] = [];
      groups[k].push(r);
    });
    const keys = Object.keys(groups).sort(
      (a, b) => (a === 'legacy') - (b === 'legacy') || Number(a) - Number(b)
    );
    const perBatch = keys.map((key) => ({
      key,
      label: keys.length === 1 && key === 'legacy' ? 'All batches' : batchLabelOf(key),
      pooled: false,
      ...summarizeScope(groups[key]),
    }));
    if (perBatch.length <= 1) return perBatch;
    return [
      { key: 'overall', label: 'All batches', pooled: true, ...summarizeScope(seriesRows) },
      ...perBatch,
    ];
  }, [seriesRows]);

  // ── Overview trend — { year, value } pairs averaged across all departments ─
  // Single batch: real calendar years. Pooled "All": Year 0 .. Year N.
  const overviewTrend = useMemo(() => {
    if (!summaryRows.length) return [];
    const points = averageByYear(summaryRows);
    const labelled = trendSeries.length > 1
      ? points.map((p) => ({ ...p, year: horizonLabel(p.year) }))
      : points;
    // Make the end points match the summary strip (observed current rate ->
    // predicted rate at the end of the horizon) so the AI insights quote the
    // same numbers the admin sees.
    const head = trendSummaries[0];
    if (head && labelled.length > 1) {
      labelled[0] = { ...labelled[0], value: head.current };
      labelled[labelled.length - 1] = { ...labelled[labelled.length - 1], value: head.predicted };
    }
    return labelled;
  }, [summaryRows, trendSeries, trendSummaries]);

  // ── Department cards ───────────────────────────────────────────────────────
  const departmentCards = useMemo(() => {
    if (!summaryRows.length) return [];
    const byDept = {};
    summaryRows.forEach((row) => {
      if (!byDept[row.department]) byDept[row.department] = [];
      byDept[row.department].push(row);
    });
    return Object.entries(byDept).map(([dept, rows]) => {
      const meta = DEPARTMENT_META[dept] || { key: dept.toLowerCase(), name: dept, color: 'blue' };

      // Program-level cards.
      const programsList = [...new Set(rows.map((r) => r.program))];
      const programs = programsList.map((prog) => {
        const progRows      = rows.filter((r) => r.program === prog).sort((a, b) => a.year - b.year);
        const progCurrent   = Math.round(progRows[0].current_rate ?? progRows[0].predicted_rate ?? 0);
        const progPredicted = Math.round(progRows[progRows.length - 1].predicted_rate);
        return {
          code:      prog,
          current:   progCurrent,
          predicted: progPredicted,
          change:    progPredicted - progCurrent,
        };
      });

      // Department/school card — aggregated across this department's programs.
      //
      // NOTE: a response-weighted aggregate (weighting each program by its
      // alumni/cohort count) would be the more representative figure, but the
      // `predictions` table does not currently store a cohort/respondent count
      // per row (only program, department, year, predicted_rate, current_rate).
      // Without that field, weighting by response count can't be done correctly
      // here, so this uses an equal-weighted mean across the department's
      // programs instead of inventing a proxy weight.
      const current   = Math.round(
        programs.reduce((sum, p) => sum + p.current, 0) / programs.length
      );
      const predicted = Math.round(
        programs.reduce((sum, p) => sum + p.predicted, 0) / programs.length
      );

      return {
        key:      meta.key,
        code:     dept,
        name:     meta.name,
        color:    meta.color,
        current,
        predicted,
        change:   predicted - current,
        programs,
      };
    });
  }, [summaryRows]);

  // ── Selected department detail ─────────────────────────────────────────────
  const selectedDepartmentData = useMemo(() => {
    if (!selectedDepartment || !departmentCards.length) return null;
    const dept = departmentCards.find((d) => d.key === selectedDepartment);
    if (!dept) return null;
    return {
      title:    dept.name,
      subtitle: `Program-level predictions ${overviewTrend[0]?.year || 2025} → ${overviewTrend[overviewTrend.length - 1]?.year || 2030}`,
      programs: dept.programs,
    };
  }, [selectedDepartment, departmentCards, overviewTrend]);

  // ── If the selected department has no data for the chosen batch, go back ──
  useEffect(() => {
    if (
      selectedDepartment &&
      departmentCards.length &&
      !departmentCards.some((d) => d.key === selectedDepartment)
    ) {
      setSelectedDepartment(null);
      setActivePage('departments');
    }
  }, [departmentCards, selectedDepartment]);

  // ── Navigation handlers ────────────────────────────────────────────────────
  const handleBreadcrumbNav = (targetPage) => {
    if (targetPage === 'overview') {
      setActivePage('overview');
      setSelectedDepartment(null);
    } else if (targetPage === 'departments') {
      setActivePage('departments');
      setSelectedDepartment(null);
    }
  };

  const handleDepartmentClick = (deptKey) => {
    setSelectedDepartment(deptKey);
    setActivePage('department-detail');
  };

  const handleViewBreakdown = () => {
    setActivePage('departments');
    setSelectedDepartment(null);
  };

  // ── Refresh predictions ────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/refresh-predictions`, {
        method: 'POST',
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        setRefreshMsg(
          `Failed: HTTP ${res.status}${body ? ' — ' + body.slice(0, 120) : ''}`
        );
        return;
      }

      const data = await res.json();
      if (data.status === 'success') {
        setRefreshMsg('Predictions updated successfully.');
        const { data: newData } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true })
          .order('program', { ascending: true });
        setPredictions(newData || []);
      } else {
        setRefreshMsg('Failed: ' + (data.message ?? 'Unknown error'));
      }
    } catch (err) {
      setRefreshMsg('Error: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // ── Auto-clear refresh message after 3 s ──────────────────────────────────
  useEffect(() => {
    if (!refreshMsg) return;
    const timer = setTimeout(() => setRefreshMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [refreshMsg]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pa-layout">
        <AdminSidebar activePage="predictive-analytics" />
        <main className="pa-main">
          <p style={{ color: '#62748E', marginTop: 48 }}>Loading predictions…</p>
        </main>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="pa-layout">
        <AdminSidebar activePage="predictive-analytics" />
        <main className="pa-main">
          <p style={{ color: '#EF4444', marginTop: 48 }}>
            Failed to load predictions: {error}
          </p>
        </main>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Predictiveanalyticsview
      activePage={activePage}
      selectedDepartment={selectedDepartment}
      selectedDepartmentData={selectedDepartmentData}
      overviewTrend={overviewTrend}
      trendSeries={trendSeries}
      trendYears={trendYears}
      trendSummaries={trendSummaries}
      batchOptions={batchOptions}
      selectedBatch={activeBatch}
      onBatchChange={setSelectedBatch}
      departmentCards={departmentCards}
      onDepartmentClick={handleDepartmentClick}
      onBreadcrumbNav={handleBreadcrumbNav}
      onViewBreakdown={handleViewBreakdown}
      sidebar={<AdminSidebar activePage="predictive-analytics" />}
      refreshBar={
        <div className="pa-refresh-bar">
          {refreshMsg && (
            <span
              className={`pa-refresh-msg ${
                refreshMsg.includes('success') ? 'success' : 'error'
              }`}
            >
              {refreshMsg}
            </span>
          )}
          <button
            className={`pa-refresh-btn ${refreshing ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Updating Predictions…' : '↻ Refresh Predictions'}
          </button>
        </div>
      }
    />
  );
};

export default AdminPredictiveAnalytics;