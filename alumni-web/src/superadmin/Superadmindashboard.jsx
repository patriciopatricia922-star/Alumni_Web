import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sidebarLogo from '../assets/sidebar_alumnAI.svg';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Legend,
} from 'recharts';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Dashboard: ({ size = 21 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  ),
  AuditLogs: ({ size = 21 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
    </svg>
  ),
  AdminMgmt: ({ size = 21 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ),
  AlumniMgmt: ({ size = 21 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-9-3V8H4v3H1v2h3v3h2v-3h3v-2H6z"/>
    </svg>
  ),
  Engagement: ({ size = 21 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64c2.02 2.2 2.02 5.25 0 7.27l-1.68-1.69c.84-1.18.84-2.71 0-3.89l1.68-1.69zM20.07 2c3.93 4.05 3.9 10.11 0 14l-1.63-1.63c2.77-3.18 2.77-7.72 0-10.74L20.07 2z"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  GraduationCap: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D9CA81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
        stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { key: 'super-admin',       label: 'Audit Overview',     Icon: Icons.Dashboard   },
  { key: 'audit-logs',        label: 'Detailed Audit Logs',Icon: Icons.AuditLogs   },
  { key: 'admin-management',  label: 'Admin Management',   Icon: Icons.AdminMgmt   },
  { key: 'alumni-management', label: 'Alumni Management',  Icon: Icons.AlumniMgmt  },
  { key: 'engagement',        label: 'Alumni Engagement',  Icon: Icons.Engagement  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const SuperAdminSidebar = ({ activePage, onNavigate }) => {
  const navigate = useNavigate();
  const handleLogout = () => navigate('/login');

  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: 0,
      width: '229px', height: '100vh',
      background: '#001947',
      boxShadow: '0px 10px 50px rgba(0,0,0,0.25)',
      borderRadius: '0px 20px 20px 0px',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>

      {/* ── Logo ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0 16px', gap: '6px' }}>
        {/* sidebar_alumnAI.svg — constrained so it never distorts layout */}
        <img
          src={sidebarLogo}
          alt="AlumnAI"
          style={{ width: '120px', height: 'auto', objectFit: 'contain', flexShrink: 0 }}
        />
        {/* Super Admin label */}
        <span style={{
          fontFamily: 'Montserrat, Arial', fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.6px', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
        }}>
          Super Admin
        </span>
      </div>

      {/* ── Divider ── */}
      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', boxShadow: '0px 4px 4px rgba(0,0,0,0.35)', flexShrink: 0 }} />

      {/* ── Menu ── */}
      <div style={{ padding: '20px 9px 0', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
        <p style={{
          fontFamily: 'Montserrat', fontWeight: 600, fontSize: '10px',
          lineHeight: '15px', letterSpacing: '0.5px', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)', padding: '0 16px', margin: '0 0 6px 0',
        }}>MENU</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV.map(({ key, label, Icon }) => {
            const isActive = activePage === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 13px', margin: '0 6px',
                  background: isActive ? 'rgba(217,202,129,0.12)' : 'transparent',
                  borderRadius: '14px', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.2s',
                  width: 'calc(100% - 12px)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  width: '20px', height: '20px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#D9CA81' : 'rgba(255,255,255,0.85)',
                }}>
                  <Icon size={20} />
                </span>
                <span style={{
                  fontFamily: 'Montserrat, Arial', fontSize: '15px',
                  fontWeight: isActive ? 700 : 400, lineHeight: '24px',
                  letterSpacing: '0.325px',
                  color: isActive ? '#D9CA81' : '#FFFFFF',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── User Profile Bottom ── */}
      <div style={{ padding: '0 8px 24px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 12px',
          gap: '12px', height: '56px',
          background: 'rgba(255,255,255,0.1)', borderRadius: '30px',
        }}>
          <div style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: 'linear-gradient(135deg, #51A2FF 0%, #155DFC 100%)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'Arial', fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>S</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontFamily: 'Arial', fontSize: '13px', lineHeight: '20px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Super Admin
            </span>
            <span style={{ fontFamily: 'Arial', fontSize: '11px', lineHeight: '16px', color: '#D1D5DC' }}>
              Super Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              width: '28px', height: '28px', background: 'none', border: 'none',
              borderRadius: '4px', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            }}
          >
            <Icons.LogOut />
          </button>
        </div>
      </div>
    </aside>
  );
};

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
      <span style={{ fontFamily: 'Lexend, Arial', fontSize: '14px', color: '#6A7282', lineHeight: '20px' }}>{title}</span>
      <span style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '30px', color: '#101828', lineHeight: '36px' }}>{value}</span>
      <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: subtitleColor || '#6A7282', lineHeight: '16px' }}>{subtitle}</span>
    </div>
    <div style={{
      width: '48px', height: '48px', flexShrink: 0,
      background: iconBg,
      borderRadius: '10px',
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
    <div style={{ fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '16px', color: '#0A0A0A', marginBottom: '4px' }}>{title}</div>
    <div style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#717182', marginBottom: '20px' }}>{subtitle}</div>
    {children}
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
      fontFamily: 'Arimo, Arial', fontSize: '12px', color: c.text,
      background: c.bg, borderRadius: '8px',
      padding: '2px 8px', lineHeight: '16px',
    }}>{type}</span>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const [activePage, setActivePage] = useState('super-admin');

  // ── Data ──────────────────────────────────────────────────────────────────
  const stats = [
    {
      title: 'Actions Today', value: '280', subtitle: 'Total actions',
      subtitleColor: '#155DFC', iconBg: '#EFF6FF',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
    {
      title: 'Records Modified', value: '14', subtitle: 'Across all modules',
      subtitleColor: '#DAA520', iconBg: 'rgba(217,202,129,0.35)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      title: 'New Alumni', value: '180', subtitle: '+8% from last year',
      subtitleColor: '#00A63E', iconBg: 'rgba(0,166,62,0.12)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      ),
    },
    {
      title: 'Archived', value: '3', subtitle: 'Requires review',
      subtitleColor: '#FF720D', iconBg: 'rgba(255,164,85,0.49)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF720D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
        </svg>
      ),
    },
  ];

  const activityByRole = [
    { name: 'Alumni', value: 78, color: '#51A2FF' },
    { name: 'Admin',  value: 45, color: '#155DFC' },
  ];

  const activityByModule = [
    { name: 'Alumni Portal',    value: 50 },
    { name: 'Events',           value: 30 },
    { name: 'Donations',        value: 20 },
    { name: 'Feedback',         value: 18 },
    { name: 'User Mgmt',        value: 25 },
    { name: 'Settings',         value: 12 },
    { name: 'Reports',          value: 28 },
  ];

  const loginTrends = [
    { date: 'Feb 8',  successful: 65, failed: 5 },
    { date: 'Feb 9',  successful: 68, failed: 3 },
    { date: 'Feb 10', successful: 62, failed: 8 },
    { date: 'Feb 11', successful: 70, failed: 4 },
    { date: 'Feb 12', successful: 73, failed: 6 },
    { date: 'Feb 13', successful: 67, failed: 2 },
    { date: 'Feb 14', successful: 75, failed: 4 },
    { date: 'Feb 15', successful: 71, failed: 3 },
  ];

  const recentActions = [
    { type: 'Update',  module: 'System Settings', user: 'Super Admin', description: 'Updated system security settings',    timestamp: 'February 15, 2026 10:23 PM', id: 'ID: #27T4X55D1'     },
    { type: 'Archive', module: 'Events',           user: 'Super Admin', description: 'Archived event',                     timestamp: 'February 15, 2026 10:19 PM', id: 'ID: EVENT-2025-045' },
    { type: 'Export',  module: 'Reports',          user: 'Super Admin', description: 'Exported alumni database report',    timestamp: 'February 15, 2026 09:58 PM', id: 'ID: EXPORT-652'     },
    { type: 'Update',  module: 'User Management',  user: 'Admin',       description: 'Changed user role',                 timestamp: 'February 14, 2026 09:32 PM', id: 'ID: USER-188'       },
    { type: 'Update',  module: 'System Settings',  user: 'Super Admin', description: 'Enabled email notifications',       timestamp: 'February 14, 2026 10:18 PM', id: 'ID: SETT#65D-002'   },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Lexend, Arial, sans-serif' }}>
      <SuperAdminSidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main content */}
      <main style={{ marginLeft: '229px', flex: 1, padding: '40px 40px 60px', overflowX: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '30px', color: '#101828', margin: '0 0 4px', lineHeight: '36px' }}>
              Audit Overview
            </h1>
            <p style={{ fontFamily: 'Lexend, Arial', fontSize: '16px', color: '#6A7282', margin: 0 }}>
              Welcome back! Here's what's happening with your alumni network.
            </p>
          </div>

          {/* Notification Bell */}
          <button style={{
            width: '48px', height: '48px',
            background: '#001947',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', flexShrink: 0,
          }}>
            <Icons.Bell />
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '20px', height: '20px', background: '#2B72FB',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', color: '#FFF' }}>3</span>
            </div>
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
          {/* Pie Chart */}
          <ChartCard title="Activity by Role" subtitle="Distribution of actions across user roles">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={activityByRole}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {activityByRole.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bar Chart */}
          <ChartCard title="Activity by Module" subtitle="Actions performed in each system module">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={activityByModule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Arimo, Arial' }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#155DFC" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Login Trends ── */}
        <div style={{ marginBottom: '28px' }}>
          <ChartCard title="Login Activity Trends" subtitle="Successful and failed login attempts over the past week">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={loginTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fontFamily: 'Arimo, Arial' }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontFamily: 'Arimo, Arial', fontSize: '14px' }} />
                <Line type="monotone" dataKey="successful" stroke="#10B981" strokeWidth={2} name="Successful Logins" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="failed"     stroke="#EF4444" strokeWidth={2} name="Failed Logins"     dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Recent Critical Actions ── */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '14px',
          padding: '24px',
        }}>
          <div style={{ fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '16px', color: '#0A0A0A', marginBottom: '4px' }}>
            Recent Critical Actions
          </div>
          <div style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#717182', marginBottom: '20px' }}>
            Latest admin-level operations and important system changes
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActions.map((action, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '14px',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '10px',
                gap: '12px',
              }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Top row: badge + module + user */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <ActionBadge type={action.type} />
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', fontWeight: 600, color: '#0A0A0A' }}>{action.module}</span>
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#717182' }}>•</span>
                    <span style={{
                      fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#0A0A0A',
                      border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '2px 8px',
                    }}>{action.user}</span>
                  </div>
                  {/* Description */}
                  <div style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A' }}>
                    {action.description}
                  </div>
                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>{action.timestamp}</span>
                    <span style={{ color: '#717182', fontSize: '12px' }}>•</span>
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>{action.id}</span>
                  </div>
                </div>
                {/* Status badge */}
                <span style={{
                  fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#0A0A0A',
                  border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px',
                  padding: '2px 10px', flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  ✓ Success
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;