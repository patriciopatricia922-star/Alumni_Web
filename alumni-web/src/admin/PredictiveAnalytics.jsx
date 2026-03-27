import React, { useMemo, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminSidebar from './components/AdminSidebar';
import Predictiveanalyticsview from './Views/Predictiveanalyticsview';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Department metadata (colors, full names) — not from DB
const DEPARTMENT_META = {
  SECA: { key: 'seca', name: 'School of Engineering and Computer Studies', color: 'blue' },
  SBMA: { key: 'sbma', name: 'School of Business Management and Accountancy', color: 'amber' },
  SASE: { key: 'sase', name: 'School of Arts, Sciences and Education', color: 'violet' },
};

const Adminpredictiveanalytics = () => {
  const [activePage, setActivePage] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState(null);

  // Raw predictions from Supabase
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch predictions once on mount
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true });
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

  // ── Derive overviewTrend ──────────────────────────────────────────────────
  // Average predicted_rate across all programs per year
  const overviewTrend = useMemo(() => {
    if (!predictions.length) return [];

    const byYear = {};
    predictions.forEach(({ year, predicted_rate }) => {
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(predicted_rate);
    });

    return Object.entries(byYear)
      .sort(([a], [b]) => a - b)
      .map(([year, rates]) => ({
        year: String(year),
        value: Math.round(rates.reduce((s, r) => s + r, 0) / rates.length),
      }));
  }, [predictions]);

  // ── Derive departmentCards ────────────────────────────────────────────────
  // One card per department: current = rate at earliest year, predicted = rate at latest year
  const departmentCards = useMemo(() => {
    if (!predictions.length) return [];

    const byDept = {};
    predictions.forEach((row) => {
      if (!byDept[row.department]) byDept[row.department] = [];
      byDept[row.department].push(row);
    });

    return Object.entries(byDept).map(([dept, rows]) => {
      const sorted = [...rows].sort((a, b) => a.year - b.year);
      const current = Math.round(sorted[0].current_rate ?? sorted[0].predicted_rate ?? 0);
      const predicted = Math.round(sorted[sorted.length - 1].predicted_rate);
      const meta      = DEPARTMENT_META[dept] || { key: dept.toLowerCase(), name: dept, color: 'blue' };

      // Count unique programs in this department
      const programs = new Set(rows.map((r) => r.program)).size;

      return {
        key: meta.key,
        code: dept,
        name: meta.name,
        color: meta.color,
        current,
        predicted,
        change: predicted - current,
        programs,
      };
    });
  }, [predictions]);

  // ── Derive departmentTrends (for page 1.3) ────────────────────────────────
  // Per department: list of programs with current/predicted/change
  const departmentTrends = useMemo(() => {
    if (!predictions.length) return {};

    const byDept = {};
    predictions.forEach((row) => {
      if (!byDept[row.department]) byDept[row.department] = {};
      if (!byDept[row.department][row.program]) byDept[row.department][row.program] = [];
      byDept[row.department][row.program].push(row);
    });

    const result = {};
    Object.entries(byDept).forEach(([dept, programs]) => {
      const meta = DEPARTMENT_META[dept] || { key: dept.toLowerCase(), name: dept };

      const programList = Object.entries(programs).map(([prog, rows]) => {
        const sorted    = [...rows].sort((a, b) => a.year - b.year);
        const current   = Math.round(sorted[0].current_rate);
        const predicted = Math.round(sorted[sorted.length - 1].predicted_rate);
        return { code: prog, current, predicted, change: predicted - current };
      });

      result[meta.key] = {
        title: meta.name,
        subtitle: `Program-level predictions ${predictions[0]?.year ?? 2025} → ${predictions[predictions.length - 1]?.year ?? 2030}`,
        programs: programList,
      };
    });

    return result;
  }, [predictions]);

  // ── Handlers ──────────────────────────────────────────────────────────────
const handleRefresh = async () => {
  setRefreshing(true);
  setRefreshMsg(null);
  try {
    const res = await fetch('http://localhost:8000/api/refresh-predictions', {
      method: 'POST',
    });
    const data = await res.json();
    if (data.status === 'success') {
      setRefreshMsg('Predictions updated successfully.');
      const { data: newData } = await supabase
        .from('predictions')
        .select('*')
        .order('year', { ascending: true });
      setPredictions(newData || []);
    } else {
      setRefreshMsg('Failed: ' + data.message);
    }
  } catch (err) {
    setRefreshMsg('Error: ' + err.message);
  } finally {
    setRefreshing(false);
  }
};

// ← paste here
useEffect(() => {
  if (!refreshMsg) return;
  const timer = setTimeout(() => setRefreshMsg(null), 3000);
  return () => clearTimeout(timer);
}, [refreshMsg]);


  const handleTabChange = (key) => {
    setActivePage(key);
    setSelectedDepartment(null);
  };

  const handleDepartmentClick = (deptKey) => {
    setSelectedDepartment(deptKey);
    setActivePage('department-detail');
  };

  const selectedDepartmentData = selectedDepartment
    ? departmentTrends[selectedDepartment] ?? null
    : null;

  const breadcrumbTabs = useMemo(() => {
    const base = [
      { key: 'overview',    label: 'Overview' },
      { key: 'departments', label: 'Departments' },
    ];
    if (selectedDepartment) {
      const dept = departmentCards.find((c) => c.key === selectedDepartment);
      base.push({
        key: selectedDepartment,
        label: dept?.code || 'Detail',
        isDepartment: true,
      });
    }
    return base;
  }, [selectedDepartment, departmentCards]);

  // ── Loading / error states ────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Predictiveanalyticsview
      activePage={activePage}
      setActivePage={handleTabChange}
      pageTabs={breadcrumbTabs}
      overviewTrend={overviewTrend}
      overviewChartTitle="Career to Degree Alignment"
      overviewChartSubtitle="Predicted alignment rates for all departments"
      departmentCards={departmentCards}
      selectedDepartment={selectedDepartment}
      selectedDepartmentData={selectedDepartmentData}
      onDepartmentClick={handleDepartmentClick}
      sidebar={<AdminSidebar activePage="predictive-analytics" />}
      refreshBar={
        <div className="pa-refresh-bar">
          {refreshMsg && (
            <span className={`pa-refresh-msg ${refreshMsg.includes('success') ? 'success' : 'error'}`}>
              {refreshMsg}
            </span>
          )}
          <button
            className={`pa-refresh-btn ${refreshing ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Updating predictions…' : '↻ Refresh Predictions'}
          </button>
        </div>
      }
    />
  );
};

export default Adminpredictiveanalytics;