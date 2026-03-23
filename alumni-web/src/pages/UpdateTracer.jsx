import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';

const useWindowWidth = () => {
  const [width, setWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const UpdateTracerPage = () => {
  const navigate     = useNavigate();
  const width        = useWindowWidth();
  const isMobile     = width < 768;
  const isTablet     = width >= 768 && width < 1024;
  const sidebarWidth = 229;

  // ── Notification state ─────────────────────────────────────────────────────
  const bellRef                              = useRef(null);
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

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#002263' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '20px' : isTablet ? '28px 32px' : '32px 51px',
        boxSizing: 'border-box',
        position: 'relative',
      }}>

        {/* Notification Bell + Dropdown */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top:   isMobile ? '20px' : isTablet ? '28px' : '32px',
          right: isMobile ? '20px' : isTablet ? '32px' : '51px',
          zIndex: 200,
        }}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              width: '44px', height: '44px',
              background: showDropdown ? 'rgba(43,114,251,0.15)' : 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
              border: showDropdown ? '1.24px solid rgba(43,114,251,0.4)' : '1.24px solid rgba(255,255,255,0.1)',
              boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', transition: 'all 0.15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.33 17.5H11.67M15 7.5C15 5.84 14.16 4.34 12.89 3.39M5 7.5C5 4.74 7.24 2.5 10 2.5C11.33 2.5 12.53 3.02 13.41 3.88M15 7.5C15 11.25 16.67 13.33 16.67 13.33H3.33C3.33 13.33 5 11.25 5 7.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', minWidth: '20px', height: '20px', background: '#2B72FB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FFFFFF', fontWeight: 700 }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', top: '52px', right: 0, width: isMobile ? '92vw' : '380px', maxHeight: '520px', background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>Notifications</span>
                {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0 }}>Mark all read</button>}
              </div>
              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                {['all', 'unread'].map(t => (
                  <button key={t} onClick={() => setNotifTab(t)} style={{ height: '32px', padding: '0 16px', background: notifTab === t ? '#2B72FB' : 'transparent', border: notifTab === t ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Arimo', fontSize: '13px', fontWeight: notifTab === t ? 700 : 400, color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                    {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>
              <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (list.length === 0) return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
                    </div>
                  );
                  const groups = groupByDate(list);
                  return Object.entries(groups).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{label}</p>
                        {items.map(n => (
                          <div key={n.id} onClick={() => markOneRead(n.id)}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 18px', background: n.read ? 'transparent' : 'rgba(43,114,251,0.07)', cursor: 'pointer', transition: 'background 0.12s', borderLeft: n.read ? '3px solid transparent' : '3px solid #2B72FB' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background=n.read?'transparent':'rgba(43,114,251,0.07)'}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/></svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: 'Arimo', fontWeight: n.read ? 400 : 700, fontSize: '13px', color: '#FFFFFF', margin: '0 0 2px 0', lineHeight: '1.4' }}>{n.title}</p>
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
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(1,37,107,0.6)',
          border: '0.89px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: isMobile ? '32px 24px' : '48px 40px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0px 10px 40px rgba(0,0,0,0.4)',
        }}>

          {/* Icon ring */}
          <div style={{
            width: isMobile ? '72px' : '88px',
            height: isMobile ? '72px' : '88px',
            borderRadius: '50%',
            border: '5px solid #FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 0 24px rgba(255,255,255,0.25)',
          }}>
            <svg width={isMobile ? 30 : 38} height={isMobile ? 30 : 38} viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="white" strokeWidth="1.8"/>
              <path d="M8 9h8M8 12h8M8 15h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 3v4h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <p style={{ fontFamily: 'Arimo, Arial, sans-serif', fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.5px', margin: '0 0 14px 0' }}>
            Update Tracer?
          </p>

          <p style={{ fontFamily: 'Arimo, Arial, sans-serif', fontSize: isMobile ? '13px' : '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: '0 0 32px 0' }}>
            You have previously submitted your response.{' '}
            Do you want to update it?
          </p>

          <button
            onClick={() => navigate('/survey/personal-background')}
            style={{ width: '100%', padding: '14px', background: '#1E3AFF', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontFamily: 'Arimo, Arial, sans-serif', fontSize: isMobile ? '14px' : '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.3)' }}
          >
            Update Response
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '14px', background: '#FFFFFF', border: 'none', borderRadius: '12px', color: '#000000', fontFamily: 'Arimo, Arial, sans-serif', fontSize: isMobile ? '14px' : '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            Keep Response
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTracerPage;