import React, { useState } from 'react';

const FONT_STYLE = `@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&family=Arimo:wght@400;600;700&display=swap');`;
import SuperAdminSidebar from '../superadmin/SuperAdsidebar';

// ─── Icons (page-only) ────────────────────────────────────────────────────────
const Icons = {
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

// ─── No data ──────────────────────────────────────────────────────────────────
const AUDIT_LOGS = [];

// ─── Main Component ───────────────────────────────────────────────────────────
const DetailedAuditLogs = () => {
  const [selectedRole, setSelectedRole]     = useState('All Roles');
  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');

  return (
    <>
      <style>{FONT_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Lexend, Arimo, Arial' }}>
      <SuperAdminSidebar activePage="audit-logs" />

      {/* ── Main Content ── */}
      <main style={{ marginLeft: '250px', flex: 1, padding: '40px 40px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Lexend, Arimo, Arial', fontWeight: 700, fontSize: '30px', color: '#101828', margin: '0 0 6px', lineHeight: '36px' }}>
            Detailed Audit Logs
          </h1>
          <p style={{ fontFamily: 'Lexend, Arimo, Arial', fontSize: '16px', color: '#6A7282', margin: 0 }}>
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
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                <Icons.Search />
              </span>
              <input
                type="text"
                placeholder="Search by user, description, or record ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', color: '#101828', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', color: '#374151', background: '#FFFFFF', outline: 'none' }}>
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Admin</option>
              <option>Alumni</option>
            </select>
            <select value={selectedAction} onChange={e => setSelectedAction(e.target.value)} style={{ padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', color: '#374151', background: '#FFFFFF', outline: 'none' }}>
              <option>All Actions</option>
              <option>Create</option>
              <option>Update</option>
              <option>Delete</option>
              <option>Login</option>
            </select>
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
              Showing 0 of 0 records
            </span>
          </div>
        </div>

        {/* ── Audit Log Entries Card ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Lexend, Arial', fontWeight: 600, fontSize: '15px', color: '#101828', margin: '0 0 4px' }}>Audit Log Entries</h3>
            <p style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#6A7282', margin: 0 }}>Detailed record of all system activities</p>
          </div>

          {/* Empty state */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 24px', gap: '10px',
            background: '#F8FAFC', borderRadius: '10px',
            border: '1px dashed #CBD5E1',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#94A3B8' }}>No audit logs recorded yet</span>
          </div>
        </div>

      </main>
    </div>
    </>
  );
};

export default DetailedAuditLogs;