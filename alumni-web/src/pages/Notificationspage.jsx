import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifs,      setNotifs]      = useState([]);
  const [tab,         setTab]         = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error || !data) { setLoading(false); return; }

      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped  = data.map(n => ({
        id:    n.id,
        title: n.title,
        body:  n.content,
        time:  n.published_at,
        read:  readIds.includes(n.id),
      }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
      setLoading(false);
    };
    fetch();
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = notifs.map(n => n.id);
    localStorage.setItem('read_notifs', JSON.stringify(allIds));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { readIds.push(id); localStorage.setItem('read_notifs', JSON.stringify(readIds)); }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const groupByDate = (list) => {
    const today     = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate()-7);
    const groups    = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
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
    if (diff < 3600)   return Math.floor(diff/60)    + 'm ago';
    if (diff < 86400)  return Math.floor(diff/3600)   + 'h ago';
    if (diff < 604800) return Math.floor(diff/86400)  + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const list   = tab === 'unread' ? notifs.filter(n => !n.read) : notifs;
  const groups = groupByDate(list);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&family=Arimo:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #002263 !important; }
        .np-page {
          min-height: 100vh; background: #002263;
          margin-left: 229px; padding: 37px 40px 80px;
          font-family: 'Arimo';
        }
        @media (max-width: 900px) { .np-page { margin-left: 0; padding: 20px 16px 60px; } }
        .np-notif-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 20px; cursor: pointer;
          border-left: 3px solid transparent;
          transition: background 0.12s, border-color 0.12s;
        }
        .np-notif-row:hover { background: rgba(255,255,255,0.04); }
        .np-notif-row.unread { background: rgba(43,114,251,0.07); border-left-color: #2B72FB; }
        .np-notif-row.unread:hover { background: rgba(43,114,251,0.12); }
        .np-scroll::-webkit-scrollbar { width: 4px; }
        .np-scroll::-webkit-scrollbar-track { background: transparent; }
        .np-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
      `}</style>

      <Sidebar />

      <div className="np-page">

        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, marginBottom: '24px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* Heading */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontFamily: 'Arimo', fontWeight: 700, fontSize: 30, color: '#FFFFFF' }}>Notifications</h1>
            <p style={{ margin: 0, fontFamily: 'Arimo', fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>Stay updated with the latest announcements and activities.</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ height: 36, padding: '0 18px', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.3)', borderRadius: 10, fontFamily: 'Arimo', fontSize: 13, color: '#93C5FD', cursor: 'pointer', transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(43,114,251,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(43,114,251,0.15)'}>
              Mark all as read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {['all', 'unread'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              height: 36, padding: '0 20px',
              background: tab === t ? '#2B72FB' : 'rgba(255,255,255,0.06)',
              border: tab === t ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, cursor: 'pointer',
              fontFamily: 'Arimo', fontSize: 13, fontWeight: tab === t ? 700 : 400,
              color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize',
            }}>
              {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(13,19,56,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.15)', borderTop: '2px solid #2B72FB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontFamily: 'Arimo', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Loading notifications...</span>
            </div>
          ) : list.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 14 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{ fontFamily: 'Arimo', fontSize: 15, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            Object.entries(groups).map(([label, items]) => {
              if (!items.length) return null;
              return (
                <div key={label}>
                  {/* Date group label */}
                  <div style={{ padding: '14px 20px 6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
                  </div>

                  {items.map((n, idx) => (
                    <div key={n.id}
                      className={`np-notif-row${n.read ? '' : ' unread'}`}
                      onClick={() => markOneRead(n.id)}
                      style={{ borderBottom: idx < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    >
                      {/* Avatar */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(43,114,251,0.12)', border: '1px solid rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/>
                        </svg>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Arimo', fontWeight: n.read ? 400 : 700, fontSize: 14, color: '#FFFFFF', margin: '0 0 4px 0', lineHeight: 1.4 }}>{n.title}</p>
                        <p style={{ fontFamily: 'Arimo', fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px 0', lineHeight: 1.5 }}>{n.body}</p>
                        <span style={{ fontFamily: 'Arimo', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{formatTime(n.time)}</span>
                      </div>

                      {/* Unread indicator */}
                      {!n.read && (
                        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#2B72FB', flexShrink: 0, marginTop: 6 }} />
                      )}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default NotificationsPage;