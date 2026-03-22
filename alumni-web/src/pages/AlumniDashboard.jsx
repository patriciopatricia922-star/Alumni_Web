import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { loadSurveyProgress } from '../lib/surveyProgress';
import { logAction } from '../lib/auditLogger';
import announcementIcon from '../assets/announcement_ic.svg';
import discountIcon     from '../assets/discount_ic.svg';
import eventsIcon       from '../assets/events_ic.svg';
import jobsIcon         from '../assets/jobs_ic.svg';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const width    = useWindowWidth();

  const [user,               setUser]               = useState(null);
  const [surveyProgress,     setSurveyProgress]     = useState({ percentage: 0 });
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [notifs,             setNotifs]             = useState([]);
  const [unreadCount,        setUnreadCount]        = useState(0);
  const [showDropdown,       setShowDropdown]       = useState(false);
  const [notifTab,           setNotifTab]           = useState('all');
  const bellRef = useRef(null);

  // ── Card badge dots ───────────────────────────────────────────────────────
  const [cardBadges, setCardBadges] = useState({
    announcements: false,
    events:        false,
    discounts:     false,
    jobs:          false,
  });

  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;
  const sidebarWidth = isTablet ? 200 : 229;

  // ── Fetch user + survey progress ─────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', authUser.id)
        .single();
      if (data) setUser(data);
      const progress = await loadSurveyProgress();
      if (progress) setSurveyProgress(progress);
      await logAction({ action: 'View', module: 'Dashboard', description: 'Alumni viewed dashboard (web)', status: 'Success' });
    };
    fetchData();
  }, []);

  const firstName   = user?.first_name || 'Alumni';
  const progressPct = Math.min(surveyProgress?.percentage || 0, 100);

  useEffect(() => {
    if (progressPct === 0) { setAnimatedPercentage(0); return; }
    let current = 0;
    const timer = setInterval(() => {
      current += progressPct / 60;
      if (current >= progressPct) { setAnimatedPercentage(progressPct); clearInterval(timer); }
      else setAnimatedPercentage(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [progressPct]);

  // ── Fetch notifications ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchNotifs = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error || !data) return;
      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped  = data.map(n => ({ id: n.id, title: n.title, body: n.content, time: n.published_at, read: readIds.includes(n.id) }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
      // Announcements badge — true if any unread
      setCardBadges(prev => ({ ...prev, announcements: mapped.some(n => !n.read) }));
    };
    fetchNotifs();
  }, []);

  // ── Fetch card badges for events, discounts, jobs ────────────────────────
  useEffect(() => {
    const fetchBadges = async () => {
      const [eventsRes, discountsRes, jobsRes] = await Promise.all([
        supabase.from('events').select('id',    { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('discounts').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('jobs').select('id',      { count: 'exact', head: true }).eq('is_active', true),
      ]);
      setCardBadges(prev => ({
        ...prev,
        events:    (eventsRes.count    || 0) > 0,
        discounts: (discountsRes.count || 0) > 0,
        jobs:      (jobsRes.count      || 0) > 0,
      }));
    };
    fetchBadges();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = notifs.map(n => n.id);
    localStorage.setItem('read_notifs', JSON.stringify(allIds));
    setNotifs(prev => prev.map(n => ({ ...n, read: true }))); setUnreadCount(0);
    setCardBadges(prev => ({ ...prev, announcements: false }));
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { readIds.push(id); localStorage.setItem('read_notifs', JSON.stringify(readIds)); }
    setNotifs(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setCardBadges(p => ({ ...p, announcements: updated.some(n => !n.read) }));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const groupByDate = (list) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate()-7);
    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0,0,0,0);
      if      (d >= today)     groups['Today'].push(n);
      else if (d >= yesterday) groups['Yesterday'].push(n);
      else if (d >= weekAgo)   groups['This Week'].push(n);
      else                     groups['Earlier'].push(n);
    });
    return groups;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff/60)   + 'm ago';
    if (diff < 86400)  return Math.floor(diff/3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const forYouItems = [
    { icon: announcementIcon, title: 'Announcements', description: 'Check latest news',    path: '/announcements', showDot: cardBadges.announcements },
    { icon: eventsIcon,       title: 'Events',        description: '5 upcoming events',    path: '/events',        showDot: cardBadges.events        },
    { icon: discountIcon,     title: 'Discounts',     description: '8 offers available',   path: '/discounts',     showDot: cardBadges.discounts     },
    { icon: jobsIcon,         title: 'Jobs',          description: '3 listings available', path: '/jobs',          showDot: cardBadges.jobs          },
  ];

  // ── Sizes — scaled from Figma (card 160px, icon box 120px) ───────────────
  // Figma: card 495×160px, icon box 120×120px
  const CARD_H   = isMobile ? 80  : isTablet ? 120 : 160;
  const ICON_BOX = isMobile ? 60  : isTablet ? 90  : 120;
  const TITLE_SZ = isMobile ? 13  : isTablet ? 16  : 22;
  const SUB_SZ   = isMobile ? 10  : isTablet ? 12  : 16;

  // ── For You Card ──────────────────────────────────────────────────────────
  const ForYouCard = ({ item }) => (
    <div
      onClick={() => navigate(item.path)}
      style={{
        height: `${CARD_H}px`,
        background: 'rgba(0,62,166,0.35)',
        border: '0.889px solid rgba(255,255,255,0.2)',
        boxShadow: '0px 4px 4px rgba(0,0,0,0.3)',
        borderRadius: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        paddingRight: isMobile ? '14px' : '20px',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, transform 0.15s',
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(43,114,251,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Icon box — Figma: 120×120, left:-4, top:1 (flush left, vertically centered in 160px card) */}
      <div style={{
        width:  `${ICON_BOX}px`,
        height: `${ICON_BOX}px`,
        minWidth: `${ICON_BOX}px`,
        background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
        boxShadow: '0px 10px 15px rgba(97,95,255,0.5), 0px 4px 6px rgba(43,114,251,0.15)',
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        marginLeft: isMobile ? '8px' : '14px',
        flexShrink: 0,
      }}>
        <img
          src={item.icon}
          alt={item.title}
          style={{
            width:  item.title === 'Discounts' ? '159%' : '95%',
            height: item.title === 'Discounts' ? '159%' : '95%',
            objectFit: 'contain',
            filter: 'drop-shadow(0px 4px 4px #2B72FB)',
            transform: item.title === 'Discounts' ? 'rotate(10.05deg)' : 'none',
            marginLeft: item.title === 'Discounts' ? '2vh': '0',
          }}
        />

        {/* Notification dot — only shown when there's something new */}
        {item.showDot && (
          <div style={{
            position: 'absolute',
            top: isMobile ? '-6px' : '-10px',
            right: isMobile ? '-6px' : '-10px',
            width:  isMobile ? '14px' : '26px',
            height: isMobile ? '14px' : '26px',
            background: 'rgba(43,114,251,0.42)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width:  isMobile ? '9px' : '16px',
              height: isMobile ? '9px' : '16px',
              background: '#2B72FB',
              borderRadius: '50%',
            }} />
          </div>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: isMobile ? '14px' : '22px' }}>
        <p style={{
          fontFamily: 'Arimo, Arial', fontWeight: 700,
          fontSize: `${TITLE_SZ}px`,
          lineHeight: '1.25', color: '#FFED97',
          margin: '0 0 4px 0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.title}
        </p>
        <p style={{
          fontFamily: 'Arimo, Arial', fontWeight: 400,
          fontSize: `${SUB_SZ}px`,
          lineHeight: '1.4', color: '#FFFFFF',
          margin: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.description}
        </p>
      </div>

      {/* Chevron */}
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0, marginLeft: '8px' }}>
        <path d="M1 1L7 7L1 13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: 'drop-shadow(4px 4px 10px rgba(0,0,0,0.25))' }}/>
      </svg>
    </div>
  );

  // ── Progress circle ───────────────────────────────────────────────────────
  const CIRCLE_SZ = isMobile ? 60  : isTablet ? 80  : 110;
  const CIRCLE_R  = isMobile ? 22  : isTablet ? 30  : 43;
  const PCT_SZ    = isMobile ? 14  : isTablet ? 18  : 26;

  const ProgressCircle = () => (
    <div style={{ position: 'relative', width: CIRCLE_SZ, height: CIRCLE_SZ, flexShrink: 0 }}>
      <svg width={CIRCLE_SZ} height={CIRCLE_SZ} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={CIRCLE_SZ/2} cy={CIRCLE_SZ/2} r={CIRCLE_R}
          stroke="#FFED97" strokeWidth={isMobile ? 7 : 9} fill="none" opacity="0.35"/>
        <circle cx={CIRCLE_SZ/2} cy={CIRCLE_SZ/2} r={CIRCLE_R}
          stroke="#2B72FB" strokeWidth={isMobile ? 7 : 9} fill="none"
          strokeDasharray={`${2*Math.PI*CIRCLE_R}`}
          strokeDashoffset={`${2*Math.PI*CIRCLE_R*(1-animatedPercentage/100)}`}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(10px 0px 10px #00369C)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        fontFamily: 'Arimo, Arial', fontWeight: 700,
        fontSize: `${PCT_SZ}px`,
        letterSpacing: '-0.35px', color: '#FFED97', lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        {animatedPercentage}%
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'rgba(0,34,99,0.95)' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingTop:    isMobile ? '14px' : isTablet ? '22px' : '28px',
        paddingBottom: isMobile ? '80px' : '22px',
        paddingLeft:   isMobile ? '14px' : isTablet ? '24px' : '36px',
        paddingRight:  isMobile ? '14px' : isTablet ? '24px' : '36px',
        boxSizing: 'border-box',
        height: '100vh',
        overflowY: isMobile ? 'auto' : 'hidden',
        overflowX: 'hidden',
        position: 'relative',
      }}>

        {/* ── Notification Bell ──────────────────────────────────────────── */}
        <div ref={bellRef} style={{
          position: 'fixed',
          top:   isMobile ? '14px' : isTablet ? '28px' : '36px',
          right: isMobile ? '9px' : isTablet ? '23px' : '39px',
          zIndex: 200,
        }}>
          <button onClick={() => setShowDropdown(v => !v)} style={{
            width: isMobile ? '44px' : '58px',
            height: isMobile ? '44px' : '58px',
            background: showDropdown ? 'rgba(43,114,251,0.2)' : 'rgba(0,62,166,0.35)',
            border: showDropdown ? '1.24px solid rgba(43,114,251,0.5)' : '1.24px solid rgba(255,255,255,0.9)',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'all 0.15s', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '-5px', right: '-5px',
                width: '24px', height: '24px',
                background: 'rgba(43,114,251,0.42)', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '17px', height: '17px', background: '#2B72FB', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1)',
                }}>
                  <span style={{ fontFamily: 'Arimo', fontSize: '9px', color: '#FFFFFF', fontWeight: 400 }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              </div>
            )}
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', top: isMobile?'52px':'68px', right: 0, width: isMobile?'90vw':'380px', maxHeight: '520px', background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>Notifications</span>
                {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0 }}>Mark all read</button>}
              </div>
              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                {['all','unread'].map(t => (
                  <button key={t} onClick={() => setNotifTab(t)} style={{ height: '32px', padding: '0 16px', background: notifTab===t?'#2B72FB':'transparent', border: notifTab===t?'none':'1px solid rgba(255,255,255,0.12)', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Arimo', fontSize: '13px', fontWeight: notifTab===t?700:400, color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                    {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>
              <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (!list.length) return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{notifTab==='unread'?'No unread notifications':'No notifications yet'}</p>
                    </div>
                  );
                  return Object.entries(groupByDate(list)).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{label}</p>
                        {items.map(n => (
                          <div key={n.id} onClick={() => markOneRead(n.id)}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 18px', background: n.read?'transparent':'rgba(43,114,251,0.07)', cursor: 'pointer', transition: 'background 0.12s', borderLeft: n.read?'3px solid transparent':'3px solid #2B72FB' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background=n.read?'transparent':'rgba(43,114,251,0.07)'}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/></svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: 'Arimo', fontWeight: n.read?400:700, fontSize: '13px', color: '#FFFFFF', margin: '0 0 2px 0', lineHeight: '1.4' }}>{n.title}</p>
                              <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '0 0 4px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body}</p>
                              <span style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{formatTime(n.time)}</span>
                            </div>
                            {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2B72FB', flexShrink: 0, marginTop: '6px' }} />}
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
              </div>
              <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <button onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                  style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                  See all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 1: Header ─────────────────────────────────────────── */}
        <div style={{ paddingRight: isMobile ? '58px' : '80px', flexShrink: 0 }}>
          <h2 style={{
            fontFamily: 'Arimo, Arial', fontWeight: 700,
            fontSize: isMobile ? '20px' : isTablet ? '24px' : '32px',
            lineHeight: '1.2', letterSpacing: '-1px', color: '#FFFFFF',
            margin: 0,
          }}>
            Dashboard
          </h2>
          <p style={{
            fontFamily: 'Arimo, Arial', fontWeight: 400,
            fontSize: isMobile ? '10px' : isTablet ? '11px' : '13px',
            lineHeight: '1.5', color: 'rgba(255,255,255,0.7)',
            margin: '2px 0 0 0',
          }}>
            You're making great progress! Keep engaging with your alumni network.
          </p>
        </div>

        <div style={{ height: isMobile ? '12px' : isTablet ? '16px' : '22px', flexShrink: 0 }} />

        {/* ── Hello + Banner ────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, paddingRight: isMobile ? '58px' : '80px' }}>
          <h1 style={{
            fontFamily: 'Arimo, Arial', fontWeight: 700,
            fontSize: isMobile ? '23px' : isTablet ? '26px' : '30px',
            lineHeight: '1.14', letterSpacing: '-1.05px', color: '#FFFFFF',
            margin: '0 0 8px 0',
            marginTop: '16px',
          }}>
            Hello, <span style={{ color: '#D9CA81' }}>{firstName}</span>
          </h1>
        </div>

        {/* ── SECTION 2: Progress Banner ───────────────────────────────── */}
        <div style={{
          position: 'relative', flexShrink: 0,
          marginBottom: 0,
          padding: isMobile ? '14px 18px' : isTablet ? '16px 22px' : '18px 28px',
          background: 'linear-gradient(180deg, rgba(43,114,251,0.5) -11.25%, rgba(30,37,85,0.65) 100%)',
          border: '0.889px solid rgba(43,114,251,0.3)',
          borderRadius: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '20px', overflow: 'hidden', boxSizing: 'border-box',
        }}>
          <div style={{ position: 'absolute', width: '256px', height: '256px', right: '-30px', top: '-127px', background: '#2B72FB', opacity: 0.1, filter: 'blur(64px)', borderRadius: '50%', pointerEvents: 'none' }} />
          <p style={{
            fontFamily: 'Arimo, Arial', fontWeight: 700,
            fontSize: isMobile ? '19px' : isTablet ? '19px' : '25px',
            lineHeight: '1.5', color: '#FFFFFF',
            margin: 0, position: 'relative', flex: 1,
          }}>
            Your alumni tracer survey progress!
          </p>
          <ProgressCircle />
        </div>

        <div style={{ height: isMobile ? '16px' : isTablet ? '22px' : '28px', flexShrink: 0 }} />

        {/* ── SECTION 3: For You ────────────────────────────────────────── */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontFamily: 'Arimo, Arial', fontWeight: 700,
            fontSize: isMobile ? '16px' : isTablet ? '18px' : '24px',
            letterSpacing: '-0.6px', color: '#FFFFFF',
            margin: '0 0 9px 0',
            flexShrink: 0,
          }}>For You</h3>

          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {forYouItems.map((item, i) => <ForYouCard key={i} item={item} />)}
            </div>
          ) : (
            <div style={{
              flex: 1, minHeight: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: `${CARD_H}px ${CARD_H}px`,
              alignContent: 'start',
              gap: isTablet ? '10px' : '14px',
            }}>
              {forYouItems.map((item, i) => <ForYouCard key={i} item={item} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AlumniDashboard;