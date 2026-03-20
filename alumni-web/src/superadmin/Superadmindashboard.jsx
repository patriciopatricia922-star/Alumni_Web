import React, { useState, useEffect } from 'react';
import SuperAdSidebar from '../superadmin/SuperAdsidebar';
import { supabase } from '../lib/supabase';

const FONT_STYLE = `@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&family=Arimo:wght@400;600;700&display=swap');`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatRelative = iso => {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─── Tag / Status Styles ──────────────────────────────────────────────────────
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
const getTagStyle    = tag    => tagColors[tag]   || { bg: '#F3F4F6', color: '#374151' };
const getStatusStyle = status => status === 'Success'
  ? { bg: 'transparent', color: '#0A0A0A', border: '1px solid rgba(0,0,0,0.1)' }
  : { bg: '#FEE2E2', color: '#B91C1C', border: 'none' };

const Tag = ({ label }) => {
  const s = getTagStyle(label);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '8px',
      fontSize: '12px', fontFamily: 'Arimo, Arial', fontWeight: 400,
      background: s.bg, color: s.color,
      border: s.border || 'none',
      whiteSpace: 'nowrap', lineHeight: '16px',
    }}>{label}</span>
  );
};

const StatusBadge = ({ status }) => {
  const s = getStatusStyle(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: '8px',
      fontSize: '12px', fontFamily: 'Arimo, Arial', fontWeight: 400,
      background: s.bg, color: s.color,
      border: s.border || 'none',
      whiteSpace: 'nowrap', lineHeight: '16px',
    }}>{status}</span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, subtitleColor, IconEl, iconBg }) => (
  <div style={{
    background: '#FFFFFF',
    border: '0.888889px solid #9E9E9E',
    borderRadius: '10px',
    padding: '24.8889px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', flex: 1, minWidth: 0,
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

// ─── Empty Placeholder ────────────────────────────────────────────────────────
const EmptyState = ({ message = 'No data available yet' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '48px 24px', gap: '10px',
    background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #CBD5E1',
  }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#94A3B8' }}>{message}</span>
  </div>
);

// ─── Pie Chart — matches Figma "Activity by Role" screenshot ─────────────────
// Large centered pie, floating outside labels like "Admin: 45", spin-in animation
const PIE_ANIM_STYLE = `
  @keyframes pie-spin-in {
    from { opacity: 0; transform: rotate(-90deg) scale(0.7); }
    to   { opacity: 1; transform: rotate(0deg)   scale(1);   }
  }
  @keyframes label-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .pie-chart-wrap { animation: pie-spin-in 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards; transform-origin: center; }
  .pie-label      { animation: label-fade-in 0.4s ease forwards; }
`;

const DonutChart = ({ data }) => {
  if (!data || data.length === 0 || data.every(d => d.value === 0))
    return <EmptyState />;

  const COLORS = ['#4D81F3', '#51A2FF', '#00A63E', '#DAA520', '#FF720D', '#6D28D9'];
  const total  = data.reduce((s, d) => s + d.value, 0);

  // SVG canvas — big enough to fit the pie + outside labels
  const W = 340, H = 300;
  const cx = W / 2, cy = H / 2;
  const r  = 110; // pie radius
  const labelR = r + 36; // label anchor distance from center

  // Build slices
  const slices = [];
  let startAngle = -Math.PI / 2;
  data.forEach((d, i) => {
    if (d.value === 0) return;
    const slice    = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + slice;
    const midAngle = startAngle + slice / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = slice > Math.PI ? 1 : 0;
    const path  = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;

    // Label position — push out past the edge
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    const anchor = Math.cos(midAngle) > 0 ? 'start' : 'end';

    slices.push({ path, color: COLORS[i % COLORS.length], lx, ly, anchor, label: d.label, value: d.value, delay: i * 80 });
    startAngle = endAngle;
  });

  return (
    <>
      <style>{PIE_ANIM_STYLE}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg
          width={W} height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ maxWidth: '100%', overflow: 'visible' }}
        >
          {/* Pie slices — animated as a group */}
          <g className="pie-chart-wrap" style={{ transformOrigin: `${cx}px ${cy}px` }}>
            {slices.map((s, i) => (
              <path
                key={i}
                d={s.path}
                fill={s.color}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: 'default', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.setAttribute('opacity', '0.85')}
                onMouseLeave={e => e.currentTarget.setAttribute('opacity', '1')}
              />
            ))}
          </g>
          {/* Floating labels — each fades in with a slight delay */}
          {slices.map((s, i) => (
            <text
              key={`lbl-${i}`}
              className="pie-label"
              x={s.lx}
              y={s.ly}
              textAnchor={s.anchor}
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="500"
              fill={s.color}
              fontFamily="Arimo,Arial"
              style={{ animationDelay: `${0.5 + s.delay / 1000}s`, opacity: 0 }}
            >
              {s.label}: {s.value}
            </text>
          ))}
        </svg>
      </div>
    </>
  );
};

// ─── Bar Chart — matches screenshot "Activity by Module" ─────────────────────
// Bars: #3B82F6, dashed grid both axes, angled X labels, grow-up animation
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

const BarChart = ({ data }) => {
  if (!data || data.length === 0) return <EmptyState />;

  const W = 480, H = 300;
  const padL = 40, padR = 12, padT = 16, padB = 90; // extra bottom for angled labels
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const max    = Math.max(...data.map(d => d.value), 1);

  // Y grid — 5 lines matching screenshot (0, ~15, ~30, ~45, ~60)
  const gridCount  = 4;
  const gridStep   = Math.ceil(max / gridCount) || 1;
  const yMax       = gridStep * gridCount;
  const gridVals   = Array.from({ length: gridCount + 1 }, (_, i) => i * gridStep);

  const barSlot = chartW / data.length;
  const barW    = Math.max(14, barSlot * 0.55);
  const baseY   = padT + chartH; // y-coordinate of x-axis

  return (
    <>
      <style>{BAR_ANIM_STYLE}</style>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">

        {/* Dashed horizontal grid lines + Y-axis labels */}
        {gridVals.map((val, i) => {
          const y = padT + chartH - (val / yMax) * chartH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y}
                stroke="#CCCCCC" strokeWidth="1" strokeDasharray="4,4" />
              <text x={padL - 6} y={y + 4} textAnchor="end"
                fontSize="10" fill="#666666" fontFamily="Arimo,Arial">{val}</text>
            </g>
          );
        })}

        {/* Dashed vertical grid lines (one per bar centre) */}
        {data.map((_, i) => {
          const cx = padL + i * barSlot + barSlot / 2;
          return (
            <line key={`vg${i}`} x1={cx} y1={padT} x2={cx} y2={baseY}
              stroke="#CCCCCC" strokeWidth="1" strokeDasharray="4,4" />
          );
        })}

        {/* X axis solid line */}
        <line x1={padL} y1={baseY} x2={W - padR} y2={baseY}
          stroke="#666666" strokeWidth="1" />

        {/* Bars — each animates with a staggered delay */}
        {data.map((d, i) => {
          const barH = Math.max(d.value > 0 ? 3 : 0, Math.round((d.value / yMax) * chartH));
          const cx   = padL + i * barSlot + barSlot / 2;
          const x    = cx - barW / 2;
          const y    = baseY - barH;
          return (
            <rect
              key={i}
              className="bar-rect"
              x={x} y={y} width={barW} height={barH} rx="3"
              fill="#3B82F6"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
            />
          );
        })}

        {/* Angled X-axis labels — rotated -45° anchored at bar centre */}
        {data.map((d, i) => {
          const cx = padL + i * barSlot + barSlot / 2;
          return (
            <text
              key={`lbl${i}`}
              x={cx}
              y={baseY + 8}
              textAnchor="end"
              fontSize="11"
              fill="#666666"
              fontFamily="Arimo,Arial"
              transform={`rotate(-45, ${cx}, ${baseY + 8})`}
            >
              {d.label}
            </text>
          );
        })}

      </svg>
    </>
  );
};

// ─── Login Trends Line Chart — matches Figma exactly ─────────────────────────
// Green #10B981 success line, Red #EF4444 failed line
// Dashed grid, dots on each point, centered legend below
const LoginTrendsChart = ({ data }) => {
  if (!data || data.length === 0) return <EmptyState message="No login data yet" />;

  const W = 900, H = 280;
  const padL = 52, padR = 8, padT = 8, padB = 56;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = Math.max(...data.map(d => Math.max(d.success, d.failed)), 1);

  // 5 grid lines matching Figma: 0, 20, 40, 60, 80
  const gridCount = 4;
  const step      = Math.ceil(maxVal / gridCount) || 1;
  const yMax      = step * gridCount;
  const gridVals  = Array.from({ length: gridCount + 1 }, (_, i) => i * step);

  const xPos = i  => padL + (i / Math.max(data.length - 1, 1)) * chartW;
  const yPos = v  => padT + chartH - (v / yMax) * chartH;

  const buildPath = key =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i).toFixed(1)} ${yPos(d[key]).toFixed(1)}`).join(' ');

  const successPath = buildPath('success');
  const failedPath  = buildPath('failed');

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Dashed horizontal grid lines */}
      {gridVals.map((val, i) => {
        const y = yPos(val);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y}
              stroke="#CCCCCC" strokeWidth="1" strokeDasharray="4,4" />
            <text x={padL - 8} y={y + 4} textAnchor="end"
              fontSize="11" fill="#666666" fontFamily="Arimo,Arial">{val}</text>
          </g>
        );
      })}
      {/* Dashed vertical grid lines */}
      {data.map((_, i) => (
        <line key={i} x1={xPos(i)} y1={padT} x2={xPos(i)} y2={padT + chartH}
          stroke="#CCCCCC" strokeWidth="1" strokeDasharray="4,4" />
      ))}
      {/* X axis solid */}
      <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH}
        stroke="#666666" strokeWidth="1" />
      {/* Lines */}
      <path d={successPath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round" />
      <path d={failedPath}  fill="none" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
      {/* Dots + X labels */}
      {data.map((d, i) => (
        <g key={i}>
          {/* Success dot */}
          <circle cx={xPos(i)} cy={yPos(d.success)} r="4"
            fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
          {/* Failed dot */}
          <circle cx={xPos(i)} cy={yPos(d.failed)} r="4"
            fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
          {/* X-axis date label */}
          <text x={xPos(i)} y={padT + chartH + 16}
            textAnchor="middle" fontSize="11" fill="#666666" fontFamily="Arimo,Arial">{d.label}</text>
          {/* Tick mark */}
          <line x1={xPos(i)} y1={padT + chartH} x2={xPos(i)} y2={padT + chartH + 5}
            stroke="#666666" strokeWidth="1" />
        </g>
      ))}
      {/* Centered legend — matching Figma layout */}
      <g transform={`translate(${W / 2 - 145}, ${H - 18})`}>
        <line x1="0" y1="7" x2="14" y2="7" stroke="#10B981" strokeWidth="1.75" />
        <text x="20" y="12" fontSize="14" fill="#10B981" fontFamily="Arimo,Arial">Successful Logins</text>
        <line x1="160" y1="7" x2="174" y2="7" stroke="#EF4444" strokeWidth="1.75" />
        <text x="180" y="12" fontSize="14" fill="#EF4444" fontFamily="Arimo,Arial">Failed Logins</text>
      </g>
    </svg>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const [loading,         setLoading]         = useState(true);
  const [alumniCount,     setAlumniCount]     = useState(0);
  const [actionsToday,    setActionsToday]    = useState(0);
  const [recordsModified, setRecordsModified] = useState(0);
  const [archivedCount,   setArchivedCount]   = useState(0);
  const [recentActions,   setRecentActions]   = useState([]);
  const [roleData,        setRoleData]        = useState([]);
  const [actionData,      setActionData]      = useState([]);
  const [loginTrends,     setLoginTrends]     = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // ── 1. Alumni count ──────────────────────────────────────────────
        const { count: alumCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'alumni');
        setAlumniCount(alumCount ?? 0);

        // ── 2. Today's audit stats ───────────────────────────────────────
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count: todayCount } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayStart.toISOString());
        setActionsToday(todayCount ?? 0);

        const { count: modCount } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .in('action', ['Create', 'Update', 'Delete'])
          .gte('created_at', todayStart.toISOString());
        setRecordsModified(modCount ?? 0);

        const { count: archCount } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('action', 'Archive');
        setArchivedCount(archCount ?? 0);

        // ── 3. Recent critical actions (last 8) ──────────────────────────
        const { data: recent } = await supabase
          .from('audit_logs')
          .select('id, created_at, user_email, user_role, action, module, description, status')
          .in('action', ['Create', 'Update', 'Delete', 'Archive', 'Export'])
          .order('created_at', { ascending: false })
          .limit(8);
        setRecentActions(recent ?? []);

        // ── 4. Role breakdown (donut) + Module breakdown (bar) ──────────
        const { data: allLogs } = await supabase
          .from('audit_logs')
          .select('user_role, module');

        if (allLogs && allLogs.length > 0) {
          // Role breakdown for donut chart
          const roleCounts = allLogs.reduce((acc, l) => {
            if (l.user_role) acc[l.user_role] = (acc[l.user_role] || 0) + 1;
            return acc;
          }, {});
          setRoleData(Object.entries(roleCounts).map(([label, value]) => ({ label, value })));

          // Module breakdown for bar chart — matching screenshot labels
          const moduleOrder = ['Alumni Profile', 'Events', 'Donations', 'Feedback', 'User Management', 'System Settings', 'Reports'];
          const moduleCounts = allLogs.reduce((acc, l) => {
            if (l.module) acc[l.module] = (acc[l.module] || 0) + 1;
            return acc;
          }, {});
          // Include any extra modules not in the default order
          const extraModules = Object.keys(moduleCounts).filter(m => !moduleOrder.includes(m));
          const allModules = [...moduleOrder, ...extraModules];
          setActionData(allModules
            .filter(m => moduleCounts[m] > 0)
            .map(m => ({ label: m, value: moduleCounts[m] }))
          );
        }

        // ── 5. Login trends — last 7 days ────────────────────────────────
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data: loginLogs } = await supabase
          .from('audit_logs')
          .select('created_at, status')
          .eq('action', 'Login')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          d.setHours(0, 0, 0, 0);
          return d;
        });

        const trends = days.map(day => {
          const label   = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const nextDay = new Date(day);
          nextDay.setDate(nextDay.getDate() + 1);
          const dayLogs = (loginLogs ?? []).filter(l => {
            const t = new Date(l.created_at);
            return t >= day && t < nextDay;
          });
          return {
            label,
            success: dayLogs.filter(l => l.status === 'Success').length,
            failed:  dayLogs.filter(l => l.status === 'Failed').length,
          };
        });
        setLoginTrends(trends);

      } catch (err) {
        console.error('SuperAdmin dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const stats = [
    {
      title: 'Actions Today', value: loading ? '—' : String(actionsToday),
      subtitle: 'Total actions', subtitleColor: '#155DFC', iconBg: '#EFF6FF',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
    {
      title: 'Records Modified', value: loading ? '—' : String(recordsModified),
      subtitle: 'Across all modules', subtitleColor: '#DAA520', iconBg: 'rgba(217,202,129,0.35)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    {
      title: 'Total Alumni', value: loading ? '—' : String(alumniCount),
      subtitle: 'Total registered', subtitleColor: '#00A63E', iconBg: 'rgba(0,166,62,0.12)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      ),
    },
    {
      title: 'Archived', value: loading ? '—' : String(archivedCount),
      subtitle: 'Total archive actions', subtitleColor: '#FF720D', iconBg: 'rgba(255,164,85,0.49)',
      IconEl: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF720D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
          <line x1="10" y1="12" x2="14" y2="12"/>
        </svg>
      ),
    },
  ];

  // Shared card header style
  const CardHeader = ({ title, subtitle, icon }) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        {icon && icon}
        <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', lineHeight: '16px' }}>{title}</span>
      </div>
      <span style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#717182', lineHeight: '24px' }}>{subtitle}</span>
    </div>
  );

  const LoadingBox = () => (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px', fontFamily: 'Arimo, Arial' }}>Loading…</div>
  );

  return (
    <>
      <style>{FONT_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Lexend, Arimo, Arial' }}>
        <SuperAdSidebar activePage="super-admin" />

        <main style={{ marginLeft: '229px', flex: 1, padding: '40px 40px 60px', overflowX: 'hidden' }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontFamily: 'Lexend, Arial', fontWeight: 700, fontSize: '30px', color: '#101828', margin: '0 0 4px', lineHeight: '36px' }}>
              Audit Overview
            </h1>
            <p style={{ fontFamily: 'Lexend, Arial', fontSize: '16px', color: '#6A7282', margin: 0 }}>
              Welcome bark! Here's what's happening with your alumni network.
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* ── Charts Row: Activity by Role + Activity by Action ── */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>

            {/* Activity by Role — Donut */}
            <div style={{
              background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '14px', padding: '24px', flex: 1,
            }}>
              <CardHeader
                title="Activity by Role"
                subtitle="Distribution of actions across user roles"
              />
              {loading ? <LoadingBox /> : <DonutChart data={roleData} />}
            </div>

            {/* Activity by Action — Bar */}
            <div style={{
              background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '14px', padding: '24px', flex: 1,
            }}>
              <CardHeader
                title="Activity by Module"
                subtitle="Actions performed in each system module"
              />
              {loading ? <LoadingBox /> : <BarChart data={actionData} />}
            </div>
          </div>

          {/* ── Login Activity Trends — full width ── */}
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '14px', padding: '24px', marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {/* Activity/chart icon matching Figma */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', lineHeight: '16px' }}>
                Login Activity Trends
              </span>
            </div>
            <div style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#717182', lineHeight: '24px', marginBottom: '20px' }}>
              Successful and failed login attempts over the past 7 days
            </div>
            {loading ? <LoadingBox /> : <LoginTrendsChart data={loginTrends} />}
          </div>

          {/* ── Recent Critical Actions ── */}
          {/* Figma shows this as a card with individual action rows, each in their own bordered container */}
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '14px', padding: '24px',
          }}>
            <div style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '16px', color: '#0A0A0A', marginBottom: '4px' }}>
              Recent Critical Actions
            </div>
            <div style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: '#717182', lineHeight: '24px', marginBottom: '20px' }}>
              Latest admin-level operations and important system changes
            </div>

            {loading ? (
              <LoadingBox />
            ) : recentActions.length === 0 ? (
              <EmptyState message="No actions recorded yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActions.map((a) => (
                  <div key={a.id} style={{
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    {/* Left: action info */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {/* Row 1: action tag + module + role tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {a.action && <Tag label={a.action} />}
                        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', lineHeight: '20px' }}>
                          {a.module || '—'}
                        </span>
                        {a.user_role && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            padding: '2px 8px', borderRadius: '8px',
                            fontSize: '12px', fontFamily: 'Arimo, Arial',
                            background: 'transparent', color: '#0A0A0A',
                            border: '1px solid rgba(0,0,0,0.1)',
                            lineHeight: '16px',
                          }}>{a.user_role}</span>
                        )}
                      </div>
                      {/* Row 2: description */}
                      <div style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#0A0A0A', lineHeight: '20px' }}>
                        {a.description || '—'}
                      </div>
                      {/* Row 3: meta — user · time · record id */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {a.user_email && (
                          <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>
                            User: {a.user_email}
                          </span>
                        )}
                        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>•</span>
                        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>
                          {formatDate(a.created_at)}
                        </span>
                        {a.record_id && (
                          <>
                            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>•</span>
                            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#717182' }}>
                              ID: {a.record_id}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Right: status badge */}
                    <div style={{ flexShrink: 0 }}>
                      {a.status && <StatusBadge status={a.status} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  );
};

export default SuperAdminDashboard;