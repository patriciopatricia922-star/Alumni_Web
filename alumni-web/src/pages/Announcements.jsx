import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';

const useWindowWidth = () => {
  const [width, setWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

// ─── Icon: megaphone (matches Figma 3D icon placeholder) ─────────────────────
const MegaphoneIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 9v6h4l5 5V4L7 9H3z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M16.5 7.5C17.9 8.9 18.75 10.85 18.75 13C18.75 15.15 17.9 17.1 16.5 18.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19.5 4.5C22.2 7.2 23.75 10.94 23.75 13C23.75 15.06 22.2 18.8 19.5 21.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

// ─── Announcement Card — Figma: 495×180, icon box 120×120 ────────────────────
const AnnouncementCard = ({ announcement, isMobile, isTablet }) => (
  <div style={{
    background: 'rgba(0,62,166,0.35)',
    border: '0.889px solid rgba(255,255,255,0.2)',
    boxShadow: '0px 4px 4px rgba(0,0,0,0.3)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }}>
    {/* Top: timestamp */}
    <div style={{
      display: 'flex', justifyContent: 'flex-end',
      padding: isMobile ? '8px 14px' : '10px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17"/>
          <path d="M7 4V7.5L9.5 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
          {announcement.time}
        </span>
      </div>
    </div>

    {/* Main body — icon + text, Figma layout */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '0 14px 14px' : '0 20px 20px',
      gap: isMobile ? '12px' : '20px',
      flex: 1,
    }}>
      {/* Icon box — Figma: 120×120, left:-4 top:12, gradient bg */}
      <div style={{
        width:  isMobile ? '64px' : isTablet ? '80px' : '100px',
        height: isMobile ? '64px' : isTablet ? '80px' : '100px',
        minWidth: isMobile ? '64px' : isTablet ? '80px' : '100px',
        background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
        boxShadow: '0px 10px 15px rgba(97,95,255,0.5), 0px 4px 6px rgba(43,114,251,0.15)',
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative',
        marginLeft: '-4px',
      }}>
        <MegaphoneIcon size={isMobile ? 24 : isTablet ? 30 : 36} />
        {/* Figma Component 7: notification dot */}
        <div style={{
          position: 'absolute', top: '-8px', right: '-8px',
          width: '22px', height: '22px',
          background: 'rgba(43,114,251,0.42)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: '14px', height: '14px', background: '#2B72FB', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Text — Figma: title 22px #FFED97, description 16px rgba(255,255,255,0.65) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontFamily: 'Arimo, Arial', fontWeight: 700,
          fontSize: isMobile ? '15px' : isTablet ? '17px' : '20px',
          lineHeight: '1.4', letterSpacing: '-0.3px',
          color: '#FFED97', margin: '0 0 6px 0',
        }}>
          {announcement.title}
        </h3>
        <p style={{
          fontFamily: 'Arimo, Arial', fontWeight: 400,
          fontSize: isMobile ? '12px' : '14px', lineHeight: '1.6',
          color: 'rgba(255,255,255,0.65)', margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {announcement.description}
        </p>
      </div>

      {/* Chevron */}
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0 }}>
        <path d="M1 1L7 7L1 13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.25))' }}/>
      </svg>
    </div>

    {/* Footer — Figma: See more button rgba(0,40,255,0.85) */}
    <div style={{
      padding: isMobile ? '10px 14px' : '12px 20px',
      borderTop: '0.89px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <button style={{
        height: '36px', padding: '0 18px',
        borderRadius: '14px', border: 'none',
        background: 'rgba(0,40,255,0.85)',
        boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
        fontFamily: 'Arimo, Arial', fontWeight: 700,
        fontSize: '13px', color: '#FFFFFF',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
        transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        See more
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 4H7M7 4L4 1M7 4L4 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const Announcements = () => {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const bellRef   = useRef(null);

  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;
  const sidebarWidth = isTablet ? 200 : 229;

  // ── Announcement data ──────────────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (!error && data) {
        setAnnouncements(data.map(a => ({
          id:          a.id,
          title:       a.title,
          description: a.content,
          time:        formatTime(a.published_at),
        })));
      } else {
        // Fallback mock data when table is empty or doesn't exist yet
        setAnnouncements([
          { id: 1, title: 'Alumni Welcome Back Night',     description: 'Join us for an unforgettable evening of networking, reminiscing, and celebrating the bonds that unite our alumni community.', time: '2 hours ago' },
          { id: 2, title: 'Scholarship Applications Open', description: 'Applications for the 2026 alumni scholarship are now open. Enhance your professional development and skills.', time: '5 hours ago' },
          { id: 3, title: 'Career Fair This Friday',       description: 'Connect with top companies and explore new opportunities at our upcoming career fair. Don\'t miss out!', time: '1 day ago' },
          { id: 4, title: 'Chapter Meeting Update',        description: 'The monthly chapter meeting has been rescheduled to March 10. Mark your calendars and stay connected.', time: '2 days ago' },
        ]);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  // ── Notification bell (same pattern as dashboard) ──────────────────────────
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

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
    };
    fetchNotifs();
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
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { readIds.push(id); localStorage.setItem('read_notifs', JSON.stringify(readIds)); }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff/60)   + 'm ago';
    if (diff < 86400)  return Math.floor(diff/3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        padding: isMobile ? '24px 16px 90px' : isTablet ? '37px 32px 48px' : '37px 51px 60px',
        boxSizing: 'border-box',
        maxWidth: '100%',
        overflowX: 'hidden',
        position: 'relative',
      }}>

        {/* ── Notification Bell — same as dashboard ──────────────────────── */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top:   isMobile ? '24px' : '37px',
          right: isMobile ? '16px' : isTablet ? '32px' : '51px',
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
            position: 'relative', transition: 'all 0.15s',
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
                }}>
                  <span style={{ fontFamily: 'Arimo', fontSize: '9px', color: '#FFFFFF', fontWeight: 400 }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              </div>
            )}
          </button>

          {/* Notification dropdown */}
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
                <button onClick={() => setShowDropdown(false)}
                  style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                  See all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Header — Figma: "Announcements" 40px, subtitle 16px ──────────── */}
        <div style={{ paddingRight: isMobile ? '60px' : '90px', marginBottom: isMobile ? '20px' : '32px' }}>

          {/* Back button — Figma: maki:arrow + "Back" text, color #FFFFFF */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, marginBottom: isMobile ? '12px' : '16px',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67"
                stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
          </button>

          <h1 style={{
            fontFamily: 'Arimo, Arial', fontWeight: 700,
            fontSize: isMobile ? '28px' : isTablet ? '32px' : '40px',
            lineHeight: '1.2', letterSpacing: '-1px', color: '#FFFFFF',
            margin: '0 0 8px 0',
          }}>
            Announcements
          </h1>
          <p style={{
            fontFamily: 'Arimo, Arial', fontWeight: 400,
            fontSize: isMobile ? '13px' : '16px', lineHeight: '22px',
            color: 'rgba(255,255,255,0.6)', margin: 0,
          }}>
            Stay connected with the latest news, events, and opportunities from your alumni community.
          </p>
        </div>

        {/* ── Featured Banner — Figma: 1028×200, gradient bg ───────────────── */}
        {!isMobile && (
          <div style={{
            position: 'relative',
            padding: isTablet ? '24px 28px' : '24px 32px',
            background: 'linear-gradient(180deg, rgba(43,114,251,0.2) 0%, rgba(30,37,85,0.3) 100%)',
            border: '0.889px solid rgba(43,114,251,0.3)',
            borderRadius: '24px',
            marginBottom: isTablet ? '28px' : '40px',
            overflow: 'hidden',
            display: 'flex', gap: '24px', alignItems: 'center',
          }}>
            {/* Glow blob */}
            <div style={{ position: 'absolute', width: '256px', height: '256px', right: '-30px', top: '-127px', background: '#2B72FB', opacity: 0.1, filter: 'blur(64px)', borderRadius: '50%', pointerEvents: 'none' }} />

            {/* Icon box — Figma: 120×120 */}
            <div style={{
              width: isTablet ? '80px' : '120px',
              height: isTablet ? '80px' : '120px',
              flexShrink: 0,
              background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
              boxShadow: '0px 10px 15px rgba(97,95,255,0.5), 0px 4px 6px rgba(43,114,251,0.15)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <MegaphoneIcon size={isTablet ? 30 : 42} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, position: 'relative' }}>
              <h2 style={{
                fontFamily: 'Arimo, Arial', fontWeight: 700,
                fontSize: isTablet ? '20px' : '25px',
                lineHeight: '1.3', letterSpacing: '-0.35px',
                color: '#FFFFFF', margin: '0 0 8px 0',
              }}>
                Alumni Tracer Survey
              </h2>
              <p style={{
                fontFamily: 'Arimo, Arial', fontWeight: 400,
                fontSize: '13px', lineHeight: '22px',
                color: 'rgba(255,255,255,0.65)', margin: '0 0 16px 0',
              }}>
                Join us for an unforgettable evening of networking, reminiscing, and celebrating the bonds that unite our alumni community.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17"/>
                    <path d="M7 4V7.5L9.5 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>2 hours ago</span>
                </div>
                <button style={{
                  height: '39px', padding: '0 20px',
                  borderRadius: '14px', border: 'none',
                  background: 'rgba(0,40,255,0.85)',
                  boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
                  fontFamily: 'Arimo, Arial', fontWeight: 700,
                  fontSize: '13px', color: '#FFFFFF',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  See more
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4H7M7 4L4 1M7 4L4 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Filter bar — Figma: 321×37 joined component, right-aligned ────
             Left (65.73%): "All Posts" + count badge
             Right (34.27%): funnel icon + "FILTER"                         */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: isMobile ? '16px' : '24px',
        }}>
          <div style={{
            display: 'flex',
            height: '37px',
            width: isMobile ? '100%' : '321px',
            borderRadius: '10px',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {/* Left: All Posts + badge */}
            <div style={{
              flex: '0 0 65.73%',
              display: 'flex', alignItems: 'center',
              padding: '0 12px', gap: '8px',
              background: 'rgba(0,62,166,0.35)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRight: 'none',
              borderRadius: '10px 0 0 10px',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>
                All Posts
              </span>
              <div style={{ background: '#2B72FB', borderRadius: '8px', minWidth: '23px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF' }}>
                  {announcements.length}
                </span>
              </div>
            </div>
            {/* Right: FILTER button */}
            <button style={{
              flex: '0 0 34.27%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px',
              background: 'rgba(0,40,255,0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer', padding: 0,
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '13px', lineHeight: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                FILTER
              </span>
            </button>
          </div>
        </div>

        {/* ── Announcement Cards — Figma: 2-col desktop, 1-col mobile ─────── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Loading announcements…</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '14px' : isTablet ? '18px' : '24px',
          }}>
            {announcements.map(a => (
              <AnnouncementCard key={a.id} announcement={a} isMobile={isMobile} isTablet={isTablet} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Announcements;