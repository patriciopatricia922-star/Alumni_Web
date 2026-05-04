import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import SuperAdsidebar from './SuperAdsidebar';
import {
  FiSearch, FiRotateCcw, FiDownload,
  FiChevronLeft, FiChevronRight,
  FiCalendar, FiClock, FiDatabase,
  FiUser, FiFolder, FiActivity,
  FiCheckCircle, FiXCircle,
} from 'react-icons/fi';

/* ─── Font import ─────────────────────────────────────────────────────────── */
const FONT_STYLE = `@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&family=Arimo:wght@400;600;700&display=swap');`;

/* ─── Filter maps (unchanged from DetailedAuditLogs) ─────────────────────── */
const roleMap = {
  'All Roles': null, 'Super Admin': 'superadmin', 'Admin': 'admin', 'Alumni': 'alumni',
};
const actionMap = {
  'All Actions': null, 'Create': 'Create', 'Update': 'Update', 'Delete': 'Delete',
  'Login': 'Login', 'Export': 'Export', 'Archive': 'Archive',
};
const moduleMap = {
  'All Modules': null, 'Alumni Profile': 'Alumni Profile', 'Events': 'Events',
  'Donations': 'Donations', 'User Management': 'User Management',
  'Survey': 'Survey', 'Announcements': 'Announcements',
};
const statusMap = { 'All': null, 'Success': 'Success', 'Failed': 'Failed' };

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatRelative = (iso) => {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

/* ─── Tag colour maps ─────────────────────────────────────────────────────── */
const tagColors = {
  'Update':      { bg: '#155DFC', color: '#FFFFFF' },
  'Login':       { bg: '#EDE9FE', color: '#6D28D9' },
  'Create':      { bg: '#DCFCE7', color: '#15803D' },
  'Delete':      { bg: '#FEE2E2', color: '#B91C1C' },
  'Export':      { bg: '#155DFC', color: '#FFFFFF' },
  'Archive':     { bg: '#FF720D', color: '#FFFFFF' },
  'Super Admin': { bg: 'transparent', color: '#0A0A0A', border: '1px solid rgba(0,0,0,0.1)' },
  'Admin':       { bg: 'transparent', color: '#0A0A0A', border: '1px solid rgba(0,0,0,0.1)' },
  'Alumni':      { bg: '#E0E7FF', color: '#3730A3' },
};

/* ─── Shared small components ─────────────────────────────────────────────── */
const Tag = ({ label }) => {
  const s = tagColors[label] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '8px',
      fontSize: '12px', fontFamily: 'Arimo, Arial', fontWeight: 400,
      background: s.bg, color: s.color, border: s.border || 'none',
      whiteSpace: 'nowrap', lineHeight: '16px',
    }}>{label}</span>
  );
};

const StatusBadge = ({ status }) => {
  const isSuccess = status === 'Success';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '8px',
      fontSize: '12px', fontFamily: 'Arimo, Arial', fontWeight: 400,
      background: isSuccess ? 'transparent' : '#FEE2E2',
      color: isSuccess ? '#0A0A0A' : '#B91C1C',
      border: isSuccess ? '1px solid rgba(0,0,0,0.1)' : 'none',
      whiteSpace: 'nowrap', lineHeight: '16px',
    }}>
      {isSuccess ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
      {status}
    </span>
  );
};

const EmptyState = ({ message = 'No data available yet' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '48px 24px', gap: '10px',
    background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1',
  }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#94A3B8' }}>{message}</span>
  </div>
);

const LoadingBox = () => (
  <div style={{
    height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#94A3B8', fontSize: '13px', fontFamily: 'Arimo, Arial',
  }}>Loading…</div>
);

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
const StatCard = ({ title, value, subtitle, subtitleColor, IconEl, iconBg }) => (
  <div style={{
    background: '#FFFFFF', border: '0.888889px solid #9E9E9E',
    borderRadius: '10px', padding: '24px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', flex: 1, minWidth: 0,
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontFamily: 'Lexend, Arial', fontSize: '14px', color: '#6A7282', lineHeight: '20px' }}>{title}</span>
      <span style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '28px', color: '#101828', lineHeight: '36px' }}>{value}</span>
      <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: subtitleColor || '#6A7282', lineHeight: '16px' }}>{subtitle}</span>
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

/* ─── Chart animations ────────────────────────────────────────────────────── */
const PIE_ANIM_STYLE = `
  @keyframes pie-spin-in {
    from { opacity: 0; transform: rotate(-90deg) scale(0.7); }
    to   { opacity: 1; transform: rotate(0deg) scale(1); }
  }
  @keyframes label-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pie-chart-wrap { animation: pie-spin-in 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards; transform-origin: center; }
  .pie-label { animation: label-fade-in 0.4s ease forwards; }
`;

const BAR_ANIM_STYLE = `
  @keyframes bar-grow-up {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  .bar-rect {
    transform-origin: bottom;
    animation: bar-grow-up 0.5s cubic-bezier(0.34,1.28,0.64,1) forwards;
    opacity: 0;
  }
`;

/* ─── Donut Chart ─────────────────────────────────────────────────────────── */
const DonutChart = ({ data }) => {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) return <EmptyState />;
  const COLORS = ['#4D81F3', '#51A2FF', '#00A63E', '#DAA520', '#FF720D', '#6D28D9'];
  const total = data.reduce((s, d) => s + d.value, 0);
  const W = 340, H = 300, cx = W / 2, cy = H / 2, r = 110, labelR = r + 36;
  const slices = [];
  let startAngle = -Math.PI / 2;
  data.forEach((d, i) => {
    if (d.value === 0) return;
    const slice = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + slice;
    const midAngle = startAngle + slice / 2;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
    const large = slice > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const lx = cx + labelR * Math.cos(midAngle), ly = cy + labelR * Math.sin(midAngle);
    const anchor = Math.cos(midAngle) > 0 ? 'start' : 'end';
    slices.push({ path, color: COLORS[i % COLORS.length], lx, ly, anchor, label: d.label, value: d.value, delay: i * 80 });
    startAngle = endAngle;
  });
  return (
    <>
      <style>{PIE_ANIM_STYLE}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: '100%', overflow: 'visible' }}>
          <g className="pie-chart-wrap" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill={s.color} stroke="#FFFFFF" strokeWidth="2"
                style={{ cursor: 'default', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.setAttribute('opacity', '0.85')}
                onMouseLeave={e => e.currentTarget.setAttribute('opacity', '1')}
              />
            ))}
          </g>
          {slices.map((s, i) => (
            <text key={`lbl-${i}`} className="pie-label" x={s.lx} y={s.ly}
              textAnchor={s.anchor} dominantBaseline="middle"
              fontSize="12" fontWeight="500" fill={s.color} fontFamily="Arimo,Arial"
              style={{ animationDelay: `${0.5 + s.delay / 1000}s`, opacity: 0 }}>
              {s.label}: {s.value}
            </text>
          ))}
        </svg>
      </div>
    </>
  );
};

/* ─── Bar Chart ───────────────────────────────────────────────────────────── */
const BarChart = ({ data }) => {
  if (!data || data.length === 0) return <EmptyState />;
  const W = 480, H = 300;
  const padL = 40, padR = 12, padT = 16, padB = 90;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const max = Math.max(...data.map(d => d.value), 1);
  const gridCount = 4, gridStep = Math.ceil(max / gridCount) || 1;
  const yMax = gridStep * gridCount;
  const gridVals = Array.from({ length: gridCount + 1 }, (_, i) => i * gridStep);
  const barSlot = chartW / data.length, barW = Math.max(14, barSlot * 0.55);
  const baseY = padT + chartH;
  return (
    <>
      <style>{BAR_ANIM_STYLE}</style>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {gridVals.map((val, i) => {
          const y = padT + chartH - (val / yMax) * chartH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#CCCCCC" strokeWidth="1" strokeDasharray="4,4" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#666666" fontFamily="Arimo,Arial">{val}</text>
            </g>
          );
        })}
        {data.map((_, i) => {
          const cx = padL + i * barSlot + barSlot / 2;
          return <line key={`vg${i}`} x1={cx} y1={padT} x2={cx} y2={baseY} stroke="#CCCCCC" strokeWidth="1" strokeDasharray="4,4" />;
        })}
        <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke="#666666" strokeWidth="1" />
        {data.map((d, i) => {
          const barH = Math.max(d.value > 0 ? 3 : 0, Math.round((d.value / yMax) * chartH));
          const cx = padL + i * barSlot + barSlot / 2;
          return (
            <rect key={i} className="bar-rect" x={cx - barW / 2} y={baseY - barH}
              width={barW} height={barH} rx="3" fill="#3B82F6"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
            />
          );
        })}
        {data.map((d, i) => {
          const cx = padL + i * barSlot + barSlot / 2;
          return (
            <text key={`lbl${i}`} x={cx} y={baseY + 8} textAnchor="end"
              fontSize="11" fill="#666666" fontFamily="Arimo,Arial"
              transform={`rotate(-45, ${cx}, ${baseY + 8})`}>{d.label}</text>
          );
        })}
      </svg>
    </>
  );
};

/* ─── Login Trends Chart ──────────────────────────────────────────────────── */
const LoginTrendsChart = ({ data }) => {
  if (!data || data.length === 0) return <EmptyState message="No login data yet" />;
  const W = 900, H = 280;
  const padL = 52, padR = 8, padT = 8, padB = 56;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const maxVal = Math.max(...data.map(d => Math.max(d.success, d.failed)), 1);
  const gridCount = 4, step = Math.ceil(maxVal / gridCount) || 1;
  const yMax = step * gridCount;
  const gridVals = Array.from({ length: gridCount + 1 }, (_, i) => i * step);
  const xPos = i => padL + (i / Math.max(data.length - 1, 1)) * chartW;
  const yPos = v => padT + chartH - (v / yMax) * chartH;
  const buildPath = key => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i).toFixed(1)} ${yPos(d[key]).toFixed(1)}`).join(' ');
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {gridVals.map((val, i) => {
        const y = yPos(val);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#CCCCCC" strokeWidth="1" strokeDasharray="4,4" />
            <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#666666" fontFamily="Arimo,Arial">{val}</text>
          </g>
        );
      })}
      {data.map((_, i) => (
        <line key={i} x1={xPos(i)} y1={padT} x2={xPos(i)} y2={padT + chartH} stroke="#CCCCCC" strokeWidth="1" strokeDasharray="4,4" />
      ))}
      <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#666666" strokeWidth="1" />
      <path d={buildPath('success')} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
      <path d={buildPath('failed')}  fill="none" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xPos(i)} cy={yPos(d.success)} r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
          <circle cx={xPos(i)} cy={yPos(d.failed)}  r="4" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
          <text x={xPos(i)} y={padT + chartH + 16} textAnchor="middle" fontSize="11" fill="#666666" fontFamily="Arimo,Arial">{d.label}</text>
          <line x1={xPos(i)} y1={padT + chartH} x2={xPos(i)} y2={padT + chartH + 5} stroke="#666666" strokeWidth="1" />
        </g>
      ))}
      <g transform={`translate(${W / 2 - 145}, ${H - 18})`}>
        <line x1="0" y1="7" x2="14" y2="7" stroke="#10B981" strokeWidth="1.75" />
        <text x="20" y="12" fontSize="14" fill="#10B981" fontFamily="Arimo,Arial">Successful Logins</text>
        <line x1="160" y1="7" x2="174" y2="7" stroke="#EF4444" strokeWidth="1.75" />
        <text x="180" y="12" fontSize="14" fill="#EF4444" fontFamily="Arimo,Arial">Failed Logins</text>
      </g>
    </svg>
  );
};

/* ─── Section divider ─────────────────────────────────────────────────────── */
const SectionDivider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '36px 0 24px' }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #E2E8F0, transparent)' }} />
    <span style={{
      fontFamily: 'Lexend, Arial', fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8',
      padding: '4px 14px', background: '#F1F5F9', borderRadius: '20px',
      border: '1px solid #E2E8F0', whiteSpace: 'nowrap',
    }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, #E2E8F0, transparent)' }} />
  </div>
);

/* ─── Filter select ───────────────────────────────────────────────────────── */
const FilterSelect = ({ value, onChange, children, minWidth = '110px' }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      flex: 1, minWidth, padding: '7px 10px',
      border: '1px solid #E5E7EB', borderRadius: '8px',
      fontSize: '13px', fontFamily: 'Arimo, Arial', background: 'white', cursor: 'pointer',
      color: '#374151', outline: 'none',
    }}
  >
    {children}
  </select>
);

/* ══════════════════════════════════════════════════════════════════════════════
   UNIFIED AUDIT LOGS PAGE
══════════════════════════════════════════════════════════════════════════════ */
const AuditLogs = () => {

  /* ── Overview state (from SuperAdminDashboard) ─────────────────────────── */
  const [overviewLoading,   setOverviewLoading]   = useState(true);
  const [alumniCount,       setAlumniCount]       = useState(0);
  const [actionsToday,      setActionsToday]      = useState(0);
  const [recordsModified,   setRecordsModified]   = useState(0);
  const [archivedCount,     setArchivedCount]     = useState(0);
  const [recentActions,     setRecentActions]     = useState([]);
  const [roleData,          setRoleData]          = useState([]);
  const [actionData,        setActionData]        = useState([]);
  const [loginTrends,       setLoginTrends]       = useState([]);

  /* ── Detailed logs state (from DetailedAuditLogs) ─────────────────────── */
  const [logs,              setLogs]              = useState([]);
  const [total,             setTotal]             = useState(0);
  const [page,              setPage]              = useState(1);
  const [logsLoading,       setLogsLoading]       = useState(true);
  const [selectedRole,      setSelectedRole]      = useState('All Roles');
  const [selectedAction,    setSelectedAction]    = useState('All Actions');
  const [selectedModule,    setSelectedModule]    = useState('All Modules');
  const [selectedStatus,    setSelectedStatus]    = useState('All');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [debouncedSearch,   setDebouncedSearch]   = useState('');
  const [dateRange,         setDateRange]         = useState('all');
  const [itemsPerPage,      setItemsPerPage]      = useState(10);

  const tableWrapperRef   = useRef(null);
  const scrollPositionRef = useRef(0);

  /* ── Debounce ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* ── Reset page on filter change ──────────────────────────────────────── */
  useEffect(() => { setPage(1); },
    [selectedRole, selectedAction, selectedModule, selectedStatus, debouncedSearch, dateRange]);

  /* ── Date filter builder ──────────────────────────────────────────────── */
  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today': return { value: new Date(now.setHours(0, 0, 0, 0)).toISOString() };
      case 'week':  return { value: new Date(now.setDate(now.getDate() - 7)).toISOString() };
      case 'month': return { value: new Date(now.setMonth(now.getMonth() - 1)).toISOString() };
      default:      return null;
    }
  };

  /* ── Fetch overview data ──────────────────────────────────────────────── */
  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      try {
        const { count: alumCount } = await supabase
          .from('users').select('*', { count: 'exact', head: true }).eq('role', 'alumni');
        setAlumniCount(alumCount ?? 0);

        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

        const { count: todayCount } = await supabase
          .from('audit_logs').select('*', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString());
        setActionsToday(todayCount ?? 0);

        const { count: modCount } = await supabase
          .from('audit_logs').select('*', { count: 'exact', head: true })
          .in('action', ['Create', 'Update', 'Delete'])
          .gte('created_at', todayStart.toISOString());
        setRecordsModified(modCount ?? 0);

        const { count: archCount } = await supabase
          .from('audit_logs').select('*', { count: 'exact', head: true }).eq('action', 'Archive');
        setArchivedCount(archCount ?? 0);

        const { data: recent } = await supabase
          .from('audit_logs')
          .select('id,created_at,user_email,user_role,action,module,description,status')
          .in('action', ['Create', 'Update', 'Delete', 'Archive', 'Export'])
          .order('created_at', { ascending: false }).limit(8);
        setRecentActions(recent ?? []);

        const { data: allLogs } = await supabase
          .from('audit_logs').select('user_role, module');

        if (allLogs && allLogs.length > 0) {
          const roleCounts = allLogs.reduce((acc, l) => {
            if (l.user_role) acc[l.user_role] = (acc[l.user_role] || 0) + 1;
            return acc;
          }, {});
          setRoleData(Object.entries(roleCounts).map(([label, value]) => ({ label, value })));

          const moduleOrder = ['Alumni Profile', 'Events', 'Donations', 'Feedback', 'User Management', 'System Settings', 'Reports'];
          const moduleCounts = allLogs.reduce((acc, l) => {
            if (l.module) acc[l.module] = (acc[l.module] || 0) + 1;
            return acc;
          }, {});
          const extraModules = Object.keys(moduleCounts).filter(m => !moduleOrder.includes(m));
          setActionData([...moduleOrder, ...extraModules]
            .filter(m => moduleCounts[m] > 0)
            .map(m => ({ label: m, value: moduleCounts[m] })));
        }

        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); sevenDaysAgo.setHours(0, 0, 0, 0);
        const { data: loginLogs } = await supabase
          .from('audit_logs').select('created_at,status').eq('action', 'Login')
          .gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: true });

        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0); return d;
        });
        setLoginTrends(days.map(day => {
          const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
          const dayLogs = (loginLogs ?? []).filter(l => { const t = new Date(l.created_at); return t >= day && t < nextDay; });
          return { label, success: dayLogs.filter(l => l.status === 'Success').length, failed: dayLogs.filter(l => l.status === 'Failed').length };
        }));

      } catch (err) {
        console.error('Overview fetch error:', err.message);
      } finally {
        setOverviewLoading(false);
      }
    };
    fetchOverview();
  }, []);

  /* ── Fetch detailed logs ──────────────────────────────────────────────── */
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('id,created_at,user_email,user_role,action,module,description,record_id,status', { count: 'exact', head: false })
        .order('created_at', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      const dbRole = roleMap[selectedRole];     if (dbRole)   query = query.eq('user_role', dbRole);
      const dbAction = actionMap[selectedAction]; if (dbAction) query = query.eq('action', dbAction);
      const dbModule = moduleMap[selectedModule]; if (dbModule) query = query.eq('module', dbModule);
      const dbStatus = statusMap[selectedStatus]; if (dbStatus) query = query.eq('status', dbStatus);
      const dateFilter = getDateFilter();         if (dateFilter) query = query.gte('created_at', dateFilter.value);
      if (debouncedSearch.trim())
        query = query.or(`user_email.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,record_id.ilike.%${debouncedSearch}%`);

      const { data, count, error } = await query;
      if (error) throw error;
      setLogs(data || []); setTotal(count || 0);
    } catch (err) {
      console.error('Audit logs fetch error:', err.message);
      setLogs([]); setTotal(0);
    } finally {
      setLogsLoading(false);
    }
  }, [page, selectedRole, selectedAction, selectedModule, selectedStatus, debouncedSearch, dateRange, itemsPerPage]);

  useEffect(() => { setPage(1); fetchLogs(); }, [itemsPerPage]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  /* ── Export CSV ───────────────────────────────────────────────────────── */
  const handleExport = async () => {
    await logAction({ action: 'Export', module: 'Audit Logs', description: 'Exported audit logs', status: 'Success' });
    try {
      let query = supabase
        .from('audit_logs')
        .select('id,created_at,user_email,user_role,action,module,description,record_id,status')
        .order('created_at', { ascending: false });

      const dbRole = roleMap[selectedRole];     if (dbRole)   query = query.eq('user_role', dbRole);
      const dbAction = actionMap[selectedAction]; if (dbAction) query = query.eq('action', dbAction);
      const dbModule = moduleMap[selectedModule]; if (dbModule) query = query.eq('module', dbModule);
      const dbStatus = statusMap[selectedStatus]; if (dbStatus) query = query.eq('status', dbStatus);
      const dateFilter = getDateFilter();         if (dateFilter) query = query.gte('created_at', dateFilter.value);
      if (debouncedSearch.trim())
        query = query.or(`user_email.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,record_id.ilike.%${debouncedSearch}%`);

      const { data, error } = await query;
      if (error) throw error;

      const headers = ['ID', 'Date', 'User Email', 'Role', 'Action', 'Module', 'Description', 'Record ID', 'Status'];
      const rows = (data || []).map(r => [
        r.id, formatDate(r.created_at), r.user_email, r.user_role,
        r.action, r.module, `"${(r.description || '').replace(/"/g, '""')}"`, r.record_id, r.status,
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `audit_logs_${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error('Export error:', err.message); }
  };

  /* ── Reset filters ────────────────────────────────────────────────────── */
  const handleReset = async () => {
    await logAction({ action: 'Update', module: 'Audit Logs', description: 'Reset all audit log filters', status: 'Success' });
    setSelectedRole('All Roles'); setSelectedAction('All Actions');
    setSelectedModule('All Modules'); setSelectedStatus('All');
    setSearchQuery(''); setDateRange('all'); setPage(1);
  };

  /* ── Pagination helpers ───────────────────────────────────────────────── */
  const totalPages  = Math.max(1, Math.ceil(total / itemsPerPage));
  const startEntry  = total === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endEntry    = Math.min(page * itemsPerPage, total);

  const handlePageChange = (newPage) => {
    if (tableWrapperRef.current) scrollPositionRef.current = tableWrapperRef.current.scrollTop;
    setPage(newPage);
  };

  /* ── Overview stat cards config ───────────────────────────────────────── */
  const stats = [
    {
      title: 'Actions Today', value: overviewLoading ? '—' : String(actionsToday),
      subtitle: 'Total actions', subtitleColor: '#155DFC', iconBg: '#EFF6FF',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      title: 'Records Modified', value: overviewLoading ? '—' : String(recordsModified),
      subtitle: 'Across all modules', subtitleColor: '#DAA520', iconBg: 'rgba(217,202,129,0.35)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      title: 'Total Alumni', value: overviewLoading ? '—' : String(alumniCount),
      subtitle: 'Total registered', subtitleColor: '#00A63E', iconBg: 'rgba(0,166,62,0.12)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      ),
    },
    {
      title: 'Archived', value: overviewLoading ? '—' : String(archivedCount),
      subtitle: 'Total archive actions', subtitleColor: '#FF720D', iconBg: 'rgba(255,164,85,0.49)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF720D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" />
          <line x1="10" y1="12" x2="14" y2="12" />
        </svg>
      ),
    },
  ];

  /* ── Card header helper ───────────────────────────────────────────────── */
  const CardHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '20px' }}>
      <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', display: 'block', marginBottom: '4px' }}>{title}</span>
      <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#717182', lineHeight: '20px' }}>{subtitle}</span>
    </div>
  );

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{FONT_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Lexend, Arimo, Arial' }}>
        <SuperAdsidebar activePage="audit-logs" />

        <main style={{ marginLeft: '229px', flex: 1, padding: '36px 36px 60px', overflowX: 'hidden' }}>

          {/* ══ PAGE HEADER ══════════════════════════════════════════════ */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '28px', color: '#101828', margin: '0 0 6px' }}>
              Audit Logs
            </h1>
            <p style={{ fontFamily: 'Lexend, Arial', fontSize: '15px', color: '#6A7282', margin: 0 }}>
              System-wide audit trail — overview, analytics, and detailed log records.
            </p>
          </div>

          {/* ══ SECTION A: OVERVIEW ══════════════════════════════════════ */}
          <SectionDivider label="Audit Overview" />

          {/* Stat Cards */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '14px', padding: '24px', flex: 1, minWidth: '280px' }}>
              <CardHeader title="Activity by Role" subtitle="Distribution of actions across user roles" />
              {overviewLoading ? <LoadingBox /> : <DonutChart data={roleData} />}
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '14px', padding: '24px', flex: 1, minWidth: '280px' }}>
              <CardHeader title="Activity by Module" subtitle="Actions performed in each system module" />
              {overviewLoading ? <LoadingBox /> : <BarChart data={actionData} />}
            </div>
          </div>

          {/* Login Trends */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#0A0A0A' }}>Login Activity Trends</span>
            </div>
            <div style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#717182', marginBottom: '20px' }}>
              Successful and failed login attempts over the past 7 days
            </div>
            {overviewLoading ? <LoadingBox /> : <LoginTrendsChart data={loginTrends} />}
          </div>

          {/* Recent Critical Actions */}
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#0A0A0A', marginBottom: '4px' }}>Recent Critical Actions</div>
            <div style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#717182', lineHeight: '20px', marginBottom: '20px' }}>
              Latest admin-level operations and important system changes
            </div>
            {overviewLoading ? <LoadingBox /> : recentActions.length === 0 ? (
              <EmptyState message="No actions recorded yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActions.map(a => (
                  <div key={a.id} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {a.action && <Tag label={a.action} />}
                        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A' }}>{a.module || '—'}</span>
                        {a.user_role && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Arimo, Arial', background: 'transparent', color: '#0A0A0A', border: '1px solid rgba(0,0,0,0.1)', lineHeight: '16px' }}>
                            {a.user_role}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A' }}>{a.description || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {a.user_email && <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>User: {a.user_email}</span>}
                        <span style={{ color: '#717182', fontSize: '12px' }}>•</span>
                        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>{formatDate(a.created_at)}</span>
                        {a.record_id && (<><span style={{ color: '#717182', fontSize: '12px' }}>•</span><span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>ID: {a.record_id}</span></>)}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>{a.status && <StatusBadge status={a.status} />}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══ SECTION B: DETAILED LOGS TABLE ═══════════════════════════ */}
          <SectionDivider label="Detailed Log Records" />

          {/* Table header bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontFamily: 'Lexend, Arial', fontWeight: 600, fontSize: '17px', color: '#1A1F36', margin: '0 0 2px' }}>Detailed Audit Logs</h2>
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#6B7280', margin: 0 }}>Complete audit trail of all system activities and operations</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#F9FAFB', borderRadius: '8px', fontSize: '11px', color: '#6B7280' }}>
                <FiDatabase size={12} />{total.toLocaleString()} records
                <span style={{ opacity: 0.4 }}>|</span>
                <FiClock size={12} />Showing {startEntry}–{endEntry}
                <span style={{ opacity: 0.4 }}>|</span>
                <FiActivity size={12} />Archived after 90d
              </div>
              <button
                onClick={handleExport}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer', fontFamily: 'Arimo, Arial' }}
              >
                <FiDownload size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '14px', marginBottom: '14px', border: '1px solid #E5E7EB' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <FiSearch size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search by user, description, or record ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'Arimo, Arial', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <FilterSelect value={selectedRole}   onChange={e => setSelectedRole(e.target.value)}>
                {['All Roles','Super Admin','Admin','Alumni'].map(o => <option key={o}>{o}</option>)}
              </FilterSelect>
              <FilterSelect value={selectedAction} onChange={e => setSelectedAction(e.target.value)}>
                {['All Actions','Create','Update','Delete','Login','Export','Archive'].map(o => <option key={o}>{o}</option>)}
              </FilterSelect>
              <FilterSelect value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
                {['All Modules','Alumni Profile','Events','Donations','User Management','Survey','Announcements'].map(o => <option key={o}>{o}</option>)}
              </FilterSelect>
              <FilterSelect value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                {['All','Success','Failed'].map(o => <option key={o}>{o}</option>)}
              </FilterSelect>
              <FilterSelect value={dateRange} onChange={e => setDateRange(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </FilterSelect>
              <button
                onClick={handleReset}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: '#F3F4F6', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer', fontFamily: 'Arimo, Arial' }}
              >
                <FiRotateCcw size={13} /> Reset
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Arimo, Arial' }}>Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={e => { if (tableWrapperRef.current) scrollPositionRef.current = tableWrapperRef.current.scrollTop; setItemsPerPage(parseInt(e.target.value)); }}
                  style={{ padding: '5px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px', background: 'white', cursor: 'pointer' }}
                >
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {logsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '10px', color: '#9CA3AF' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid #E5E7EB', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px' }}>Loading audit logs…</span>
              </div>
            ) : logs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '8px', color: '#9CA3AF' }}>
                <FiDatabase size={40} />
                <span style={{ fontFamily: 'Lexend, Arial', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>No logs found</span>
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px' }}>Try adjusting your filters or search query</span>
              </div>
            ) : (
              <>
                <div ref={tableWrapperRef} style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '520px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '12%' }} />{/* Timestamp */}
                      <col style={{ width: '14%' }} />{/* User */}
                      <col style={{ width: '9%' }}  />{/* Role */}
                      <col style={{ width: '8%' }}  />{/* Action */}
                      <col style={{ width: '10%' }} />{/* Module */}
                      <col style={{ width: '27%' }} />{/* Description */}
                      <col style={{ width: '12%' }} />{/* Record ID */}
                      <col style={{ width: '8%' }}  />{/* Status */}
                    </colgroup>
                    <thead>
                      <tr>
                        {['Timestamp','User','Role','Action','Module','Description','Record ID','Status'].map(h => (
                          <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7280', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 10, fontFamily: 'Arimo, Arial' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #F3F4F6' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 14px', fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Arimo, Arial' }}>
                            <FiCalendar size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            {formatDate(log.created_at)}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 500, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Arimo, Arial' }}>
                            <FiUser size={11} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#9CA3AF' }} />
                            {log.user_email || '—'}
                          </td>
                          <td style={{ padding: '10px 14px', overflow: 'hidden' }}>
                            {log.user_role ? <Tag label={log.user_role} /> : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '13px', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Arimo, Arial' }}>
                            {log.action || '—'}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '13px', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Arimo, Arial' }}>
                            <FiFolder size={11} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#9CA3AF' }} />
                            {log.module || '—'}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '13px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Arimo, Arial' }}>
                            {log.description || '—'}
                          </td>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '10px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.record_id || '—'}
                          </td>
                          <td style={{ padding: '10px 14px', overflow: 'hidden' }}>
                            {log.status ? <StatusBadge status={log.status} /> : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #E5E7EB', background: 'white', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Arimo, Arial' }}>
                    Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of <strong>{total.toLocaleString()}</strong> entries
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontFamily: 'Arimo, Arial' }}
                    >
                      <FiChevronLeft size={13} /> Prev
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(() => {
                        const pages = []; const maxV = 5;
                        let sp = Math.max(1, page - Math.floor(maxV / 2));
                        let ep = Math.min(totalPages, sp + maxV - 1);
                        if (ep - sp + 1 < maxV) sp = Math.max(1, ep - maxV + 1);
                        for (let i = sp; i <= ep; i++) {
                          pages.push(
                            <button key={i} onClick={() => handlePageChange(i)}
                              style={{ minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === page ? '#3B82F6' : 'white', border: '1px solid', borderColor: i === page ? '#3B82F6' : '#E5E7EB', borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: i === page ? 'white' : '#374151', cursor: 'pointer', fontFamily: 'Arimo, Arial' }}>
                              {i}
                            </button>
                          );
                        }
                        return pages;
                      })()}
                    </div>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontFamily: 'Arimo, Arial' }}
                    >
                      Next <FiChevronRight size={13} />
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

export default AuditLogs;