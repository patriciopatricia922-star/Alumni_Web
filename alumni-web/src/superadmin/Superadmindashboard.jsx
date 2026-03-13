import React, { useState, useEffect } from 'react';
import SuperAdSidebar from '../superadmin/SuperAdsidebar';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Legend,
} from 'recharts';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, subtitleColor, IconEl, iconBg }) => (
  <div style={{
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
    boxShadow: '0px 1px 3px rgba(0,0,0,0.08)',
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontFamily: 'Arimo', fontSize: '14px', color: '#6A7282', lineHeight: '20px' }}>{title}</span>
      <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '30px', color: '#101828', lineHeight: '36px' }}>{value}</span>
      <span style={{ fontFamily: 'Arimo', fontSize: '12px', color: subtitleColor || '#6A7282', lineHeight: '16px' }}>{subtitle}</span>
    </div>
    <div style={{
      width: '48px', height: '48px', flexShrink: 0,
      background: iconBg, borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <IconEl />
    </div>
  </div>
);

// ─── Chart Card ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children }) => (
  <div style={{
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '14px',
    padding: '24px',
    flex: 1,
  }}>
    <div style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '16px', color: '#0A0A0A', marginBottom: '4px' }}>{title}</div>
    <div style={{ fontFamily: 'Arimo', fontSize: '14px', color: '#717182', marginBottom: '20px' }}>{subtitle}</div>
    {children}
  </div>
);

// ─── Empty Chart Placeholder ──────────────────────────────────────────────────
const EmptyChart = ({ height = 280 }) => (
  <div style={{
    height,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#F8FAFC', borderRadius: '10px',
    border: '1px dashed #CBD5E1', gap: '8px',
  }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
    <span style={{ fontFamily: 'Arimo', fontSize: '13px', color: '#94A3B8' }}>No data available yet</span>
  </div>
);

// ─── Action Badge ─────────────────────────────────────────────────────────────
const ActionBadge = ({ type }) => {
  const colors = {
    Update:  { bg: '#155DFC', text: '#FFFFFF' },
    Archive: { bg: '#FF720D', text: '#FFFFFF' },
    Export:  { bg: '#155DFC', text: '#FFFFFF' },
  };
  const c = colors[type] || colors.Update;
  return (
    <span style={{
      fontFamily: 'Arimo', fontSize: '12px', color: c.text,
      background: c.bg, borderRadius: '8px',
      padding: '2px 8px', lineHeight: '16px',
    }}>{type}</span>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const [alumniCount, setAlumniCount] = useState('—');

  useEffect(() => {
    const fetchStats = async () => {
      const { count: alumCount, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni');
      if (error) console.error('Alumni count error:', error.message);
      setAlumniCount(alumCount ?? 0);
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: 'Actions Today', value: '0', subtitle: 'Total actions',
      subtitleColor: '#155DFC', iconBg: '#EFF6FF',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
    {
      title: 'Records Modified', value: '0', subtitle: 'Across all modules',
      subtitleColor: '#DAA520', iconBg: 'rgba(217,202,129,0.35)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      title: 'Total Alumni', value: String(alumniCount), subtitle: 'Total Registered',
      subtitleColor: '#00A63E', iconBg: 'rgba(0,166,62,0.12)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      ),
    },
    {
      title: 'Archived', value: '0', subtitle: 'Requires review',
      subtitleColor: '#FF720D', iconBg: 'rgba(255,164,85,0.49)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF720D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Arimo' }}>
      <SuperAdSidebar activePage="super-admin" />

      {/* Main content */}
      <main style={{ marginLeft: '229px', flex: 1, padding: '40px 40px 60px', overflowX: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '30px', color: '#101828', margin: '0 0 4px', lineHeight: '36px' }}>
            Audit Overview
          </h1>
          <p style={{ fontFamily: 'Arimo', fontSize: '16px', color: '#6A7282', margin: 0 }}>
            Welcome bark! Here's what's happening with your alumni network.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
          <ChartCard title="Activity by Role" subtitle="Distribution of actions across user roles">
            <EmptyChart height={280} />
          </ChartCard>

          <ChartCard title="Activity by Module" subtitle="Actions performed in each system module">
            <EmptyChart height={280} />
          </ChartCard>
        </div>

        {/* ── Login Trends ── */}
        <div style={{ marginBottom: '28px' }}>
          <ChartCard title="Login Activity Trends" subtitle="Successful and failed login attempts over the past week">
            <EmptyChart height={280} />
          </ChartCard>
        </div>

        {/* ── Recent Critical Actions ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '14px', padding: '24px' }}>
          <div style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '16px', color: '#0A0A0A', marginBottom: '4px' }}>
            Recent Critical Actions
          </div>
          <div style={{ fontFamily: 'Arimo', fontSize: '14px', color: '#717182', marginBottom: '20px' }}>
            Latest admin-level operations and important system changes
          </div>

          {/* Empty state */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '48px 24px', gap: '10px',
            background: '#F8FAFC', borderRadius: '10px',
            border: '1px dashed #CBD5E1',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <span style={{ fontFamily: 'Arimo', fontSize: '13px', color: '#94A3B8' }}>No actions recorded yet</span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default SuperAdminDashboard;