import React, { useState, useEffect, useCallback } from 'react';
import SuperAdminSidebar from '../superadmin/SuperAdsidebar';
import { supabase } from '../lib/supabase';

const FONT_STYLE = `@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&family=Arimo:wght@400;600;700&display=swap');`;

// ─── Icons ────────────────────────────────────────────────────────────────────
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
  ChevronLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

// ─── Tag / Status Styles ──────────────────────────────────────────────────────
const tagColors = {
  'Update':      { bg: '#DBEAFE', color: '#1D4ED8' },
  'Login':       { bg: '#EDE9FE', color: '#6D28D9' },
  'Create':      { bg: '#DCFCE7', color: '#15803D' },
  'Delete':      { bg: '#FEE2E2', color: '#B91C1C' },
  'Super Admin': { bg: '#FFEDD5', color: '#C2410C' },
  'Admin':       { bg: '#FEF9C3', color: '#A16207' },
  'Alumni':      { bg: '#E0E7FF', color: '#3730A3' },
  'Export':      { bg: '#F0FDF4', color: '#15803D' },
  'Archive':     { bg: '#FFF7ED', color: '#C2410C' },
};
const getTagStyle   = tag    => tagColors[tag]   || { bg: '#F3F4F6', color: '#374151' };
const getStatusStyle = status => status === 'Success'
  ? { bg: '#DCFCE7', color: '#15803D' }
  : { bg: '#FEE2E2', color: '#B91C1C' };

const Tag = ({ label }) => {
  const s = getTagStyle(label);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '9999px',
      fontSize: '11px', fontFamily: 'Arimo, Arial', fontWeight: 500,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
};

const StatusBadge = ({ status }) => {
  const s = getStatusStyle(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: '9999px',
      fontSize: '11px', fontFamily: 'Arimo, Arial', fontWeight: 500,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>{status}</span>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const PER_PAGE = 10;

// ─── Main Component ───────────────────────────────────────────────────────────
const DetailedAuditLogs = () => {
  const [logs,           setLogs]           = useState([]);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [selectedRole,   setSelectedRole]   = useState('All Roles');
  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [selectedRole, selectedAction, selectedModule, selectedStatus, debouncedSearch]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          created_at,
          user_id,
          user_email,
          user_role,
          action,
          module,
          description,
          record_id,
          status
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      if (selectedRole   !== 'All Roles')   query = query.eq('user_role', selectedRole);
      if (selectedAction !== 'All Actions') query = query.eq('action',    selectedAction);
      if (selectedModule !== 'All Modules') query = query.eq('module',    selectedModule);
      if (selectedStatus !== 'All')         query = query.eq('status',    selectedStatus);
      if (debouncedSearch.trim()) {
        query = query.or(
          `user_email.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,record_id.ilike.%${debouncedSearch}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setLogs(data  || []);
      setTotal(count || 0);
    } catch (err) {
      console.error('Audit logs fetch error:', err.message);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, selectedRole, selectedAction, selectedModule, selectedStatus, debouncedSearch]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('id,created_at,user_email,user_role,action,module,description,record_id,status')
        .order('created_at', { ascending: false });

      if (selectedRole   !== 'All Roles')   query = query.eq('user_role', selectedRole);
      if (selectedAction !== 'All Actions') query = query.eq('action',    selectedAction);
      if (selectedModule !== 'All Modules') query = query.eq('module',    selectedModule);
      if (selectedStatus !== 'All')         query = query.eq('status',    selectedStatus);
      if (debouncedSearch.trim()) {
        query = query.or(
          `user_email.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,record_id.ilike.%${debouncedSearch}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      const headers = ['ID','Date','User Email','Role','Action','Module','Description','Record ID','Status'];
      const rows = (data || []).map(r => [
        r.id, formatDate(r.created_at), r.user_email, r.user_role,
        r.action, r.module, `"${(r.description || '').replace(/"/g,'""')}"`,
        r.record_id, r.status,
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `audit_logs_${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err.message);
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedRole('All Roles');
    setSelectedAction('All Actions');
    setSelectedModule('All Modules');
    setSelectedStatus('All');
    setSearchQuery('');
    setPage(1);
  };

  const totalPages  = Math.max(1, Math.ceil(total / PER_PAGE));
  const startEntry  = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry    = Math.min(page * PER_PAGE, total);

  return (
    <>
      <style>{FONT_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Lexend, Arimo, Arial' }}>
        <SuperAdminSidebar activePage="audit-logs" />

        <main style={{ marginLeft: '250px', flex: 1, padding: '40px 40px 60px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '30px', color: '#101828', margin: '0 0 6px', lineHeight: '36px' }}>
              Detailed Audit Logs
            </h1>
            <p style={{ fontFamily: 'Lexend, Arial', fontSize: '16px', color: '#6A7282', margin: 0 }}>
              Complete audit trail of all system activities and operations
            </p>
          </div>

          {/* ── Filters Card ── */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'Lexend, Arial', fontWeight: 600, fontSize: '15px', color: '#101828', margin: '0 0 4px' }}>Filters</h3>
                <p style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#6A7282', margin: 0 }}>Search and filter audit logs</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleReset}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', fontFamily: 'Arimo, Arial', fontWeight: 500, color: '#374151', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Icons.RotateCcw /> Reset Filters
                </button>
                <button
                  onClick={handleExport}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', fontFamily: 'Arimo, Arial', fontWeight: 500, color: '#374151', background: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer' }}
                >
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
              {[
                { value: selectedRole,   setter: setSelectedRole,   options: ['All Roles',   'Super Admin', 'Admin', 'Alumni'] },
                { value: selectedAction, setter: setSelectedAction, options: ['All Actions', 'Create', 'Update', 'Delete', 'Login', 'Export', 'Archive'] },
                { value: selectedModule, setter: setSelectedModule, options: ['All Modules', 'Alumni Profile', 'Events', 'Donations', 'User Management', 'Survey', 'Announcements'] },
              ].map((s, i) => (
                <select key={i} value={s.value} onChange={e => s.setter(e.target.value)}
                  style={{ padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', color: '#374151', background: '#FFFFFF', outline: 'none' }}>
                  {s.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>

            {/* Status filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', fontWeight: 500, color: '#374151' }}>Status:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Success', 'Failed'].map(s => (
                  <button key={s} onClick={() => setSelectedStatus(s)}
                    style={{
                      padding: '6px 16px', fontSize: '13px', fontFamily: 'Arimo, Arial', fontWeight: 500,
                      borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: selectedStatus === s ? '#2563EB' : '#F3F4F6',
                      color:      selectedStatus === s ? '#FFFFFF'  : '#374151',
                      transition: 'all 0.15s',
                    }}>{s}</button>
                ))}
              </div>
              <span style={{ marginLeft: 'auto', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#6A7282' }}>
                Showing {startEntry}–{endEntry} of {total} records
              </span>
            </div>
          </div>

          {/* ── Log Entries Table ── */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '20px 24px 16px' }}>
              <h3 style={{ fontFamily: 'Lexend, Arial', fontWeight: 600, fontSize: '15px', color: '#101828', margin: '0 0 4px' }}>Audit Log Entries</h3>
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#6A7282', margin: 0 }}>Detailed record of all system activities</p>
            </div>

            {loading ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#94A3B8' }}>
                Loading audit logs…
              </div>
            ) : logs.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '60px 24px', gap: '10px',
                background: '#F8FAFC', margin: '0 24px 24px',
                borderRadius: '10px', border: '1px dashed #CBD5E1',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#94A3B8' }}>No audit logs found</span>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        {['Timestamp', 'User', 'Role', 'Action', 'Module', 'Description', 'Record ID', 'Status'].map(h => (
                          <th key={h} style={{
                            padding: '12px 16px', textAlign: 'left',
                            fontFamily: 'Arimo, Arial', fontSize: '11px', fontWeight: 700,
                            color: '#62748E', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => (
                        <tr key={log.id}
                          style={{ borderBottom: i < logs.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px 16px', fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#62748E', whiteSpace: 'nowrap' }}>
                            {formatDate(log.created_at)}
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#101828', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.user_email || '—'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {log.user_role ? <Tag label={log.user_role} /> : <span style={{ color: '#CBD5E1' }}>—</span>}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {log.action ? <Tag label={log.action} /> : <span style={{ color: '#CBD5E1' }}>—</span>}
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                            {log.module || '—'}
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#374151', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.description || '—'}
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#62748E', whiteSpace: 'nowrap' }}>
                            {log.record_id || '—'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {log.status ? <StatusBadge status={log.status} /> : <span style={{ color: '#CBD5E1' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 24px', borderTop: '1px solid #E2E8F0',
                }}>
                  <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#62748E' }}>
                    Showing {startEntry} to {endEntry} of {total} entries
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '30px', border: '1px solid #CAD5E2', borderRadius: '4px', background: '#fff', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.45 : 1 }}>
                      <Icons.ChevronLeft />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1)
                          acc.push(<span key={`g${p}`} style={{ padding: '0 4px', color: '#90A1B9', fontSize: 13 }}>…</span>);
                        acc.push(
                          <button key={p} onClick={() => setPage(p)}
                            style={{ minWidth: '32px', height: '30px', padding: '0 8px', border: '1px solid', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Arimo, Arial', fontSize: '13px', borderColor: p === page ? '#155DFC' : '#CAD5E2', background: p === page ? '#155DFC' : '#fff', color: p === page ? '#fff' : '#0F172B' }}>
                            {p}
                          </button>
                        );
                        return acc;
                      }, [])}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '30px', border: '1px solid #CAD5E2', borderRadius: '4px', background: '#fff', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.45 : 1 }}>
                      <Icons.ChevronRight />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DetailedAuditLogs;