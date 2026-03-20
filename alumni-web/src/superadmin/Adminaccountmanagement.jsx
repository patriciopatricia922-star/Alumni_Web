import React, { useState, useEffect, useCallback, useRef } from 'react';
import SuperAdSidebar from './SuperAdsidebar';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Stat Card (matches Figma key metrics) ────────────────────────────────────
const StatCard = ({ title, value, subtitle, subtitleColor, iconBg, IconEl }) => (
  <div style={{
    background: '#FFFFFF',
    border: '0.888889px solid #9E9E9E',
    borderRadius: '10px',
    padding: '24.8889px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    flex: 1, minWidth: 0,
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontFamily: 'Lexend, Arial', fontSize: '14px', color: '#6A7282', lineHeight: '20px' }}>{title}</span>
      <span style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '30px', color: '#101828', lineHeight: '36px' }}>{value}</span>
      <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: subtitleColor || '#6A7282', lineHeight: '16px' }}>{subtitle}</span>
    </div>
    <div style={{ width: '48px', height: '48px', flexShrink: 0, background: iconBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconEl />
    </div>
  </div>
);

// ─── Custom dropdown ──────────────────────────────────────────────────────────
const FilterDropdown = ({ value, options, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: '36px',
          background: '#F3F3F5', border: 'none', borderRadius: '8px',
          padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A',
          cursor: 'pointer', outline: 'none',
        }}
      >
        <span>{value || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
          <path d="M4 6L8 10L12 6" stroke="#717182" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
          background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden',
        }}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '10px 14px', fontFamily: 'Arimo, Arial', fontSize: '14px',
                color: value === opt ? '#155DFC' : '#0A0A0A',
                background: value === opt ? '#EFF6FF' : 'transparent',
                cursor: 'pointer', transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = value === opt ? '#EFF6FF' : '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = value === opt ? '#EFF6FF' : 'transparent'}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Create Admin Modal ───────────────────────────────────────────────────────
const CreateAdminModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    setError('');
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authErr) throw authErr;

      const uid = authData?.user?.id;
      if (!uid) throw new Error('User creation failed.');

      // Insert into users table
      const { error: insertErr } = await supabase.from('users').insert({
        id: uid,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
      });
      if (insertErr) throw insertErr;

      await logAction({
        action: 'Create',
        module: 'User Management',
        description: `Created new ${form.role} account for ${form.email}`,
        recordId: uid,
      });

      onCreated();
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to create admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '32px',
        width: '480px', maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '20px', color: '#101828', margin: 0 }}>Create New Admin</h2>
            <p style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#717182', margin: '4px 0 0' }}>Add a new admin or superadmin account</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#62748E' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round"/></svg>
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#B91C1C' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[['first_name', 'First Name'], ['last_name', 'Last Name']].map(([k, label]) => (
              <div key={k} style={{ flex: 1 }}>
                <label style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>{label}</label>
                <input
                  type="text" value={form[k]} onChange={e => set(k, e.target.value)}
                  style={{ width: '100%', height: '38px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', outline: 'none', background: '#F8FAFC' }}
                  placeholder={label}
                />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              type="email" value={form.email} onChange={e => set('email', e.target.value)}
              style={{ width: '100%', height: '38px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', outline: 'none', background: '#F8FAFC' }}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type="password" value={form.password} onChange={e => set('password', e.target.value)}
              style={{ width: '100%', height: '38px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', outline: 'none', background: '#F8FAFC' }}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Role</label>
            <select
              value={form.role} onChange={e => set('role', e.target.value)}
              style={{ width: '100%', height: '38px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', outline: 'none', background: '#F8FAFC', cursor: 'pointer' }}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
          <button onClick={onClose} style={{ flex: 1, height: '40px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleCreate} disabled={loading}
            style={{ flex: 1, height: '40px', background: '#001947', border: 'none', borderRadius: '8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating…' : 'Create Admin'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toggle Access Confirm Modal ──────────────────────────────────────────────
const ConfirmModal = ({ user, currentEnabled, onClose, onConfirm, loading }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{ background: '#fff', borderRadius: '14px', padding: '32px', width: '400px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
      <h2 style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '18px', color: '#101828', margin: '0 0 8px' }}>
        {currentEnabled ? 'Disable Access' : 'Enable Access'}
      </h2>
      <p style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#717182', margin: '0 0 24px', lineHeight: '22px' }}>
        Are you sure you want to {currentEnabled ? 'disable' : 'enable'} access for <strong style={{ color: '#0A0A0A' }}>{user?.email}</strong>?
        {currentEnabled && ' They will no longer be able to log in.'}
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onClose} style={{ flex: 1, height: '40px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
          Cancel
        </button>
        <button
          onClick={onConfirm} disabled={loading}
          style={{ flex: 1, height: '40px', background: currentEnabled ? '#EF4444' : '#00A63E', border: 'none', borderRadius: '8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Updating…' : currentEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const AdminAccountManagement = () => {
  const [admins,         setAdmins]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [total,          setTotal]          = useState(0);
  const [page,           setPage]           = useState(1);
  const [search,         setSearch]         = useState('');
  const [debouncedSearch,setDebouncedSearch]= useState('');
  const [roleFilter,     setRoleFilter]     = useState('All Roles');
  const [statusFilter,   setStatusFilter]   = useState('All Status');
  const [showCreate,     setShowCreate]     = useState(false);
  const [confirmUser,    setConfirmUser]    = useState(null); // { user, currentEnabled }
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Stats
  const [statsTotal,    setStatsTotal]    = useState(0);
  const [statsActive,   setStatsActive]   = useState(0);
  const [statsInactive, setStatsInactive] = useState(0);
  const [statsDisabled, setStatsDisabled] = useState(0);

  const PER_PAGE = 10;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [roleFilter, statusFilter, debouncedSearch]);

  // ── Fetch stats ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const { count: tot } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin']);
    setStatsTotal(tot ?? 0);

    const { count: act } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin'])
      .eq('account_status', 'active');
    setStatsActive(act ?? 0);

    const { count: inact } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin'])
      .eq('account_status', 'inactive');
    setStatsInactive(inact ?? 0);

    const { count: dis } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin'])
      .eq('account_status', 'disabled');
    setStatsDisabled(dis ?? 0);
  }, []);

  // ── Fetch admin list ──────────────────────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('users')
        .select('id, first_name, last_name, email, role, account_status, created_at', { count: 'exact' })
        .in('role', ['admin', 'superadmin'])
        .order('created_at', { ascending: false })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      if (roleFilter === 'Admin')      q = q.eq('role', 'admin');
      if (roleFilter === 'Super Admin') q = q.eq('role', 'superadmin');

      if (statusFilter === 'Active')   q = q.eq('account_status', 'active');
      if (statusFilter === 'Inactive') q = q.eq('account_status', 'inactive');
      if (statusFilter === 'Disabled') q = q.eq('account_status', 'disabled');

      if (debouncedSearch.trim()) {
        q = q.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      const { data, count, error } = await q;
      if (error) throw error;

      // Fetch last login from audit_logs for each user
      const ids = (data || []).map(u => u.id);
      let lastLogins = {};
      if (ids.length > 0) {
        const { data: loginData } = await supabase
          .from('audit_logs')
          .select('user_id, created_at')
          .eq('action', 'Login')
          .eq('status', 'Success')
          .in('user_id', ids)
          .order('created_at', { ascending: false });

        (loginData || []).forEach(l => {
          if (!lastLogins[l.user_id]) lastLogins[l.user_id] = l.created_at;
        });
      }

      setAdmins((data || []).map(u => ({ ...u, last_login: lastLogins[u.id] || null })));
      setTotal(count || 0);
    } catch (err) {
      console.error('fetchAdmins error:', err.message);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchStats();
    logAction({ action: 'View', module: 'User Management', description: 'Accessed admin account management page' });
  }, [fetchStats]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // ── Toggle access ────────────────────────────────────────────────────────────
  const handleToggleAccess = async () => {
    if (!confirmUser) return;
    setConfirmLoading(true);
    try {
      const { user, currentEnabled } = confirmUser;
      const newStatus = currentEnabled ? 'disabled' : 'active';
      const { error } = await supabase.from('users').update({ account_status: newStatus }).eq('id', user.id);
      if (error) throw error;

      await logAction({
        action: 'Update',
        module: 'User Management',
        description: `${currentEnabled ? 'Disabled' : 'Enabled'} admin access for ${user.email}`,
        recordId: user.id,
      });

      setConfirmUser(null);
      fetchAdmins();
      fetchStats();
    } catch (err) {
      console.error('toggleAccess error:', err.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const startEntry = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry   = Math.min(page * PER_PAGE, total);

  const roleLabel = (r) => r === 'superadmin' ? 'Super Admin' : 'Admin';
  const isEnabled = (u) => u.account_status === 'active';

  // Status badge styles matching Figma
  const statusBadge = (status) => {
    const map = {
      active:   { bg: '#00A63E', color: '#FFFFFF', label: 'Active' },
      inactive: { bg: '#FEF9C2', color: '#A65F00', label: 'Inactive' },
      disabled: { bg: '#FFE2E2', color: '#C10007', label: 'Disabled' },
    };
    return map[status] || { bg: '#F1F5F9', color: '#314158', label: status || '—' };
  };

  return (
    <>
      <style>{FONT_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Lexend, Arimo, Arial' }}>
        <SuperAdSidebar activePage="admin-management" />

        <main style={{ marginLeft: '229px', flex: 1, padding: '40px 40px 60px', overflowX: 'hidden' }}>

          {/* ── Page header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <h1 style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '30px', color: '#101828', margin: '0 0 4px', lineHeight: '36px' }}>
                Admin Account Management
              </h1>
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#717182', margin: 0 }}>
                Manage and monitor admin accounts
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                height: '36px', padding: '0 16px',
                background: '#001947', border: 'none', borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#FFFFFF',
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="1.33" strokeLinecap="round"/>
              </svg>
              Create New Admin
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <StatCard
              title="Admin Accounts" value={String(statsTotal)} subtitle="Total admins" subtitleColor="#155DFC"
              iconBg="#EFF6FF"
              IconEl={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              )}
            />
            <StatCard
              title="Active Admins" value={String(statsActive)} subtitle="Active admin accounts" subtitleColor="#DAA520"
              iconBg="rgba(217,202,129,0.35)"
              IconEl={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              )}
            />
            <StatCard
              title="Inactive Admins" value={String(statsInactive)} subtitle="Nothing for now" subtitleColor="#BF0000"
              iconBg="#FFE2E2"
              IconEl={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DF7171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  <line x1="9" y1="13" x2="15" y2="13"/>
                </svg>
              )}
            />
            <StatCard
              title="Disabled Access" value={String(statsDisabled)} subtitle="Admin access disabled" subtitleColor="#666666"
              iconBg="rgba(98,98,98,0.13)"
              IconEl={() => (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="5" x2="23" y2="9"/><line x1="23" y1="5" x2="19" y2="9"/>
                </svg>
              )}
            />
          </div>

          {/* ── Search & Filter ── */}
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '14px', padding: '24px', marginBottom: '20px',
          }}>
            <div style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', marginBottom: '2px' }}>Search & Filter</div>
            <div style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#717182', marginBottom: '16px' }}>Find and filter admin accounts</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: '#717182' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.33"/>
                    <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', height: '36px',
                    background: '#F3F3F5', border: 'none', borderRadius: '8px',
                    padding: '0 12px 0 36px',
                    fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              {/* Role filter */}
              <div style={{ width: '200px' }}>
                <FilterDropdown
                  value={roleFilter}
                  options={['All Roles', 'Admin', 'Super Admin']}
                  onChange={setRoleFilter}
                  placeholder="All Roles"
                />
              </div>
              {/* Status filter */}
              <div style={{ width: '200px' }}>
                <FilterDropdown
                  value={statusFilter}
                  options={['All Status', 'Active', 'Inactive', 'Disabled']}
                  onChange={setStatusFilter}
                  placeholder="All Status"
                />
              </div>
            </div>
          </div>

          {/* ── Admin Accounts Table ── */}
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '14px', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px 16px' }}>
              <div style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '16px', color: '#0A0A0A' }}>
                Admin Accounts ({total})
              </div>
              <div style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#717182', marginTop: '2px' }}>
                All administrative users in the system
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#94A3B8' }}>
                Loading…
              </div>
            ) : admins.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#94A3B8' }}>
                No admin accounts found.
              </div>
            ) : (
              <>
                <div style={{ margin: '0 24px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: 'transparent' }}>
                        {['Full Name', 'Email', 'Role', 'Status', 'Last Login', 'Created By', 'Date Created', 'Access'].map((h, i) => (
                          <th key={h} style={{
                            padding: '10px 8px', textAlign: i === 7 ? 'center' : 'left',
                            fontFamily: 'Arimo, Arial', fontSize: '14px', fontWeight: 400, color: '#0A0A0A',
                            borderBottom: '1px solid rgba(0,0,0,0.1)', whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin, i) => {
                        const badge = statusBadge(admin.account_status);
                        const enabled = isEnabled(admin);
                        return (
                          <tr
                            key={admin.id}
                            style={{ borderBottom: i < admins.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none', transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '14px 8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', whiteSpace: 'nowrap' }}>
                              {[admin.first_name, admin.last_name].filter(Boolean).join(' ') || '—'}
                            </td>
                            <td style={{ padding: '14px 8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {admin.email || '—'}
                            </td>
                            <td style={{ padding: '14px 8px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '2px 10px', borderRadius: '9999px',
                                fontSize: '12px', fontFamily: 'Arimo, Arial',
                                background: admin.role === 'superadmin' ? '#FFEDD5' : '#E0E7FF',
                                color: admin.role === 'superadmin' ? '#C2410C' : '#3730A3',
                              }}>{roleLabel(admin.role)}</span>
                            </td>
                            <td style={{ padding: '14px 8px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: '2px 8px', borderRadius: '8px',
                                fontSize: '12px', fontFamily: 'Arimo, Arial',
                                background: badge.bg, color: badge.color,
                              }}>{badge.label}</span>
                            </td>
                            <td style={{ padding: '14px 8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', whiteSpace: 'nowrap' }}>
                              {admin.last_login ? formatDate(admin.last_login) : '—'}
                            </td>
                            <td style={{ padding: '14px 8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', whiteSpace: 'nowrap' }}>
                              System
                            </td>
                            <td style={{ padding: '14px 8px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', whiteSpace: 'nowrap' }}>
                              {formatDate(admin.created_at)}
                            </td>
                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                              <button
                                onClick={() => setConfirmUser({ user: admin, currentEnabled: enabled })}
                                style={{
                                  height: '32px', padding: '0 12px',
                                  background: '#FFFFFF',
                                  border: `1px solid ${enabled ? '#00A63E' : '#EF4444'}`,
                                  borderRadius: '8px',
                                  fontFamily: 'Arimo, Arial', fontSize: '14px',
                                  color: enabled ? '#00A63E' : '#EF4444',
                                  cursor: 'pointer', whiteSpace: 'nowrap',
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = enabled ? '#F0FDF4' : '#FEF2F2'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
                              >
                                {enabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 24px', borderTop: '1px solid #E2E8F0', marginTop: '8px',
                }}>
                  <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#62748E' }}>
                    Showing {startEntry} to {endEntry} of {total} entries
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ height: '30px', padding: '0 12px', border: '1px solid #CAD5E2', borderRadius: '4px', background: '#fff', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.45 : 1, fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0F172B' }}
                    >Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1)
                          acc.push(<span key={`g${p}`} style={{ padding: '0 4px', color: '#90A1B9', fontSize: 14, lineHeight: '30px' }}>…</span>);
                        acc.push(
                          <button key={p} onClick={() => setPage(p)}
                            style={{ minWidth: '32px', height: '30px', padding: '0 8px', border: '1px solid', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Arimo, Arial', fontSize: '14px', borderColor: p === page ? '#155DFC' : '#CAD5E2', background: p === page ? '#155DFC' : '#fff', color: p === page ? '#fff' : '#0F172B' }}>
                            {p}
                          </button>
                        );
                        return acc;
                      }, [])}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ height: '30px', padding: '0 12px', border: '1px solid #CAD5E2', borderRadius: '4px', background: '#fff', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.45 : 1, fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0F172B' }}
                    >Next</button>
                  </div>
                </div>
              </>
            )}
          </div>

        </main>
      </div>

      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchAdmins(); fetchStats(); }}
        />
      )}

      {confirmUser && (
        <ConfirmModal
          user={confirmUser.user}
          currentEnabled={confirmUser.currentEnabled}
          onClose={() => setConfirmUser(null)}
          onConfirm={handleToggleAccess}
          loading={confirmLoading}
        />
      )}
    </>
  );
};

export default AdminAccountManagement;