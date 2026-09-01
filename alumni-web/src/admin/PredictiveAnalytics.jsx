// ============================================================================
// AdminPredictiveAnalytics — Business Logic Controller 
// ============================================================================
// Handles all business logic, Supabase API calls, ML service integration,
// AI insights fetching, data processing, and state management for
// predictive analytics.
// ============================================================================

import React, { useMemo, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Predictiveanalyticsview from './views/Predictiveanalyticsview';
import AdminSidebar from './components/AdminSidebar';

// ============================================================================
// API BASE URL — set VITE_API_BASE_URL in your .env to override localhost
// ============================================================================
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ============================================================================
// DEPARTMENT METADATA — maps department codes to display info
// ============================================================================
const DEPARTMENT_META = {
  SECA: { key: 'seca', name: 'School of Engineering, Computing, and Architecture',    color: 'blue'   },
  SBMA: { key: 'sbma', name: 'School of Business Management and Accountancy',        color: 'amber'  },
  SASE: { key: 'sase', name: 'School of Arts, Sciences and Education',               color: 'violet' },
};

// ============================================================================
// AdminPredictiveAnalytics — main logic controller
// ============================================================================
const AdminPredictiveAnalytics = () => {

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activePage,         setActivePage]         = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState(null);

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

  // ── Overview trend — { year, value } pairs averaged across all departments ─
  const overviewTrend = useMemo(() => {
    if (!predictions.length) return [];
    const byYear = {};
    predictions.forEach(({ year, predicted_rate }) => {
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(predicted_rate);
    });
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, rates]) => ({
        year:  String(year),
        value: Math.round(rates.reduce((s, r) => s + r, 0) / rates.length),
      }));
  }, [predictions]);

  // ── Department cards ───────────────────────────────────────────────────────
  const departmentCards = useMemo(() => {
    if (!predictions.length) return [];
    const byDept = {};
    predictions.forEach((row) => {
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
  }, [predictions]);

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