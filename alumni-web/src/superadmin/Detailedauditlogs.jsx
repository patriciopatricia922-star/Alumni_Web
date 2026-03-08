import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sidebarLogo from '../assets/sidebar_alumnAI.svg';

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
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  RotateCcw: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.74"/>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { key: 'super-admin',       label: 'Audit Overview',      route: '/superadmin/super-admin-dashboard', Icon: Icons.Dashboard   },
  { key: 'audit-logs',        label: 'Detailed Audit Logs', route: '/superadmin/audit-logs',            Icon: Icons.AuditLogs   },
  { key: 'admin-management',  label: 'Admin Management',    route: '/superadmin/admin-management',      Icon: Icons.AdminMgmt   },
  { key: 'alumni-management', label: 'Alumni Management',   route: '/superadmin/alumni-management',     Icon: Icons.AlumniMgmt  },
  { key: 'engagement',        label: 'Alumni Engagement',   route: '/superadmin/alumni-engagement',     Icon: Icons.Engagement  },
];

// ─── Sidebar (identical to SuperAdminDashboard) ───────────────────────────────
const SuperAdminSidebar = ({ activePage }) => {
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
        <img src={sidebarLogo} alt="AlumnAI" style={{ width: '120px', height: 'auto', objectFit: 'contain', flexShrink: 0 }} />
        <span style={{ fontFamily: 'Montserrat, Arial', fontSize: '11px', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
          Super Admin
        </span>
      </div>

      {/* ── Divider ── */}
      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', boxShadow: '0px 4px 4px rgba(0,0,0,0.35)', flexShrink: 0 }} />

      {/* ── Menu ── */}
      <div style={{ padding: '20px 9px 0', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
        <p style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '10px', lineHeight: '15px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '0 16px', margin: '0 0 6px 0' }}>MENU</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV.map(({ key, label, route, Icon }) => {
            const isActive = activePage === key;
            return (
              <button
                key={key}
                onClick={() => navigate(route)}
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
                <span style={{ width: '20px', height: '20px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#D9CA81' : 'rgba(255,255,255,0.85)' }}>
                  <Icon size={20} />
                </span>
                <span style={{ fontFamily: 'Montserrat, Arial', fontSize: '15px', fontWeight: isActive ? 700 : 400, lineHeight: '24px', letterSpacing: '0.325px', color: isActive ? '#D9CA81' : '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── User Profile Bottom ── */}
      <div style={{ padding: '0 8px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', gap: '12px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '30px' }}>
          <div style={{ width: '40px', height: '40px', flexShrink: 0, background: 'linear-gradient(135deg, #51A2FF 0%, #155DFC 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Arial', fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>S</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontFamily: 'Arial', fontSize: '13px', lineHeight: '20px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Super Admin</span>
            <span style={{ fontFamily: 'Arial', fontSize: '11px', lineHeight: '16px', color: '#D1D5DC' }}>Super Admin</span>
          </div>
          <button onClick={handleLogout} title="Sign out" style={{ width: '28px', height: '28px', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: '#D1D5DC' }}>
            <Icons.LogOut />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ─── Tag color map ─────────────────────────────────────────────────────────────
const tagColors = {
  'Update':      { bg: '#DBEAFE', color: '#1D4ED8' },
  'Login':       { bg: '#EDE9FE', color: '#6D28D9' },
  'Create':      { bg: '#DCFCE7', color: '#15803D' },
  'Delete':      { bg: '#FEE2E2', color: '#B91C1C' },
  'Super Admin': { bg: '#FFEDD5', color: '#C2410C' },
  'Admin':       { bg: '#FEF9C3', color: '#A16207' },
  'Alumni':      { bg: '#E0E7FF', color: '#3730A3' },
};
const getTagStyle = tag => tagColors[tag] || { bg: '#F3F4F6', color: '#374151' };
const getStatusStyle = status => status === 'Success'
  ? { bg: '#DCFCE7', color: '#15803D' }
  : { bg: '#FEE2E2', color: '#B91C1C' };

// ─── Audit log data ───────────────────────────────────────────────────────────
const AUDIT_LOGS = [
  {
    tags: ['Super Admin', 'Update', 'Alumni Profile'],
    user: 'Mark Wilson',
    action: 'disabled access admin Thomas Lee',
    timestamp: 'Feb 15, 2026, 08:55:42 PM',
    newValue: 'Disabled admin profile',
    recordId: 'IMPORT-2026-001',
    device: 'Chrome 120 / Windows 11',
    status: 'Success',
  },
  {
    tags: ['Alumni', 'Login', 'Alumni Profile'],
    user: 'Sarah Smith',
    action: 'failed login attempt - incorrect password',
    timestamp: 'Feb 15, 2026, 08:42:18 PM',
    newValue: '',
    recordId: '',
    device: 'Safari 17 / iOS 17',
    status: 'Failed',
  },
  {
    tags: ['Admin', 'Create', 'Events'],
    user: 'Jennifer Garcia',
    action: 'created new alumni event',
    timestamp: 'Feb 15, 2026, 08:15:33 PM',
    newValue: 'Event: Alumni Homecoming 2026',
    recordId: 'EVENT-2026-048',
    device: 'Chrome 120 / macOS 14',
    status: 'Success',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const DetailedAuditLogs = () => {
  const [selectedRole, setSelectedRole]     = useState('All Roles');
  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Arimo, Arial, sans-serif' }}>
      <SuperAdminSidebar activePage="audit-logs" />

      {/* ── Main Content ── */}
      <main style={{ marginLeft: '229px', flex: 1, padding: '40px 40px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '30px', color: '#101828', margin: '0 0 6px', lineHeight: '36px' }}>
            Detailed Audit Logs
          </h1>
          <p style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#6A7282', margin: 0 }}>
            Complete audit trail of all system activities and operations
          </p>
        </div>

        {/* ── Filters Card ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontFamily: 'Lexend, Arial', fontWeight: 600, fontSize: '15px', color: '#101828', margin: '0 0 4px' }}>Filters</h3>
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#6A7282', margin: 0 }}>Search and filter audit logs</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', fontFamily: 'Arimo, Arial', fontWeight: 500, color: '#374151', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer' }}>
                <Icons.RotateCcw /> Reset Filters
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', fontFamily: 'Arimo, Arial', fontWeight: 500, color: '#374151', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer' }}>
                <Icons.Download /> Export CSV
              </button>
            </div>
          </div>

          {/* Search + dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                <Icons.Search />
              </span>
              <input
                type="text"
                placeholder="Search by user, description, IP, or record ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', color: '#101828', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {/* Role */}
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', color: '#374151', background: '#FFFFFF', outline: 'none' }}>
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Admin</option>
              <option>Alumni</option>
            </select>
            {/* Action */}
            <select value={selectedAction} onChange={e => setSelectedAction(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', color: '#374151', background: '#FFFFFF', outline: 'none' }}>
              <option>All Actions</option>
              <option>Create</option>
              <option>Update</option>
              <option>Delete</option>
              <option>Login</option>
            </select>
            {/* Module */}
            <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', color: '#374151', background: '#FFFFFF', outline: 'none' }}>
              <option>All Modules</option>
              <option>Alumni Profile</option>
              <option>Events</option>
              <option>Donations</option>
              <option>User Management</option>
            </select>
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', fontWeight: 500, color: '#374151' }}>Status:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Success', 'Failed'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  style={{
                    padding: '6px 16px', fontSize: '13px', fontFamily: 'Arimo, Arial', fontWeight: 500,
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: selectedStatus === s ? '#2563EB' : '#F3F4F6',
                    color: selectedStatus === s ? '#FFFFFF' : '#374151',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#6A7282' }}>
              Showing {AUDIT_LOGS.length} of {AUDIT_LOGS.length} records
            </span>
          </div>
        </div>

        {/* ── Audit Log Entries Card ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Lexend, Arial', fontWeight: 600, fontSize: '15px', color: '#101828', margin: '0 0 4px' }}>Audit Log Entries</h3>
            <p style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#6A7282', margin: 0 }}>Detailed record of all system activities</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {AUDIT_LOGS.map((log, i) => (
              <div key={i} style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF' }}>
                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {log.tags.map((tag, ti) => {
                    const s = getTagStyle(tag);
                    return (
                      <span key={ti} style={{ background: s.bg, color: s.color, fontFamily: 'Arimo, Arial', fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '999px' }}>
                        {tag}
                      </span>
                    );
                  })}
                </div>

                {/* User + action */}
                <p style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#111827', margin: '0 0 10px' }}>
                  <span style={{ fontWeight: 700 }}>{log.user}</span>{' '}
                  <span style={{ color: '#374151' }}>{log.action}</span>
                </p>

                {/* Meta row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#6B7280' }}>
                      <span style={{ fontWeight: 600 }}>Timestamp:</span> {log.timestamp}
                    </span>
                    {log.newValue && (
                      <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#6B7280' }}>
                        <span style={{ fontWeight: 600 }}>New Value:</span> {log.newValue}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'right' }}>
                    {log.recordId && (
                      <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#6B7280' }}>
                        <span style={{ fontWeight: 600 }}>Record ID:</span> {log.recordId}
                      </span>
                    )}
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#6B7280' }}>
                      <span style={{ fontWeight: 600 }}>Device / Browser:</span> {log.device}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  {(() => {
                    const s = getStatusStyle(log.status);
                    return (
                      <span style={{ background: s.bg, color: s.color, fontFamily: 'Arimo, Arial', fontSize: '12px', fontWeight: 600, padding: '3px 12px', borderRadius: '999px' }}>
                        {log.status === 'Success' ? '✓ ' : '✕ '}{log.status}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailedAuditLogs;