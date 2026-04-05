import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import email_icn    from '../assets/3d_email_icon.svg';
import phone_icn    from '../assets/3d_phone_handset.svg';
import location_icn from '../assets/location_3d_icon.svg';

// ─── Responsive hook ─────────────────────────────────────────────────────────
const useWindowSize = () => {
  const [size, setSize] = useState({
    width:  typeof window !== 'undefined' ? window.innerWidth  : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return size;
};

// ─── Notification helpers ─────────────────────────────────────────────────────
const formatTime = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return Math.floor(diff / 60)    + 'm ago';
  if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

const groupByDate = (list) => {
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
  const groups    = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
  list.forEach(n => {
    const d = new Date(n.time); d.setHours(0, 0, 0, 0);
    if      (d >= today)     groups['Today'].push(n);
    else if (d >= yesterday) groups['Yesterday'].push(n);
    else if (d >= weekAgo)   groups['This Week'].push(n);
    else                     groups['Earlier'].push(n);
  });
  return groups;
};

// ─────────────────────────────────────────────────────────────────────────────
const ContactSupport = () => {
  const navigate         = useNavigate();
  const { width, height } = useWindowSize();
  const bellRef          = useRef(null);

  const isMobile     = width < 768;
  const isTablet     = width >= 768 && width < 1024;
  const sidebarWidth = isMobile ? 0 : isTablet ? 200 : 229;

  // Available vertical space for the card area
  const vPad      = isMobile ? 20 : 37;   // top + bottom padding of content col
  const backRowH  = 44;                   // back button + its bottom margin
  const cardAreaH = height - vPad * 2 - backRowH;

  // Natural card height on a 1440×900 screen (Figma proportions):
  //   outer padding top+bottom ≈ 56
  //   title block ≈ 60
  //   gap1 ≈ 16
  //   contacts inner card ≈ 380  (3×97px rows + gaps + inner padding)
  //   gap2 ≈ 16
  //   legal card ≈ 176
  //   ─────────────────
  //   total ≈ 704
  const NATURAL_H = 704;
  const scale     = Math.min(1, cardAreaH / NATURAL_H);

  // Derived sizes (scale down on short viewports, never scale up)
  const s = (n) => Math.round(n * scale);

  // ── Notification state ─────────────────────────────────────────────────────
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id,title,content,published_at,is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error || !data) return;
      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped  = data.map(n => ({
        id: n.id, title: n.title, body: n.content,
        time: n.published_at, read: readIds.includes(n.id),
      }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem('read_notifs', JSON.stringify(notifs.map(n => n.id)));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const ids = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!ids.includes(id)) { ids.push(id); localStorage.setItem('read_notifs', JSON.stringify(ids)); }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // ── Static data ────────────────────────────────────────────────────────────
  const contactItems = [
    { icon: phone_icn,    label: 'Phone',    value: '0912-345-6789',                                                  underline: false },
    { icon: email_icn,    label: 'Email',    value: 'nudaao@nu-dasma.edu.ph',                                         underline: true  },
    { icon: location_icn, label: 'Location', value: "Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114", underline: false },
  ];

  const legalLinks = [
    { label: 'Terms of Service', route: '/terms'           },
    { label: 'Privacy Policy',   route: '/privacy'         },
    { label: 'Contact Support',  route: '/contact-support' },
  ];

  // ── Sub-components (scale-aware) ───────────────────────────────────────────
  const IconBox = ({ src, alt }) => (
    <div style={{
      width:        `${s(70)}px`,
      height:       `${s(70)}px`,
      flexShrink:   0,
      background:   'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
      boxShadow:    '0px 10px 15px rgba(97,95,255,0.5), 0px 4px 6px rgba(43,114,251,0.15)',
      borderRadius: `${s(14)}px`,
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'center',
    }}>
      <img
        src={src} alt={alt}
        style={{ width: `${s(57)}px`, height: `${s(57)}px`, objectFit: 'contain', display: 'block' }}
      />
    </div>
  );

  const ContactRow = ({ icon, label, value, underline }) => (
    <div style={{
      width:        '100%',
      minHeight:    `${s(97)}px`,
      background:   'rgba(0,62,166,0.35)',
      border:       '0.888889px solid rgba(255,255,255,0.2)',
      boxShadow:    '0px 2px 2px rgba(255,255,255,0.25)',
      borderRadius: `${s(16)}px`,
      display:      'flex',
      alignItems:   'center',
      padding:      `${s(13)}px ${s(16)}px`,
      gap:          `${s(14)}px`,
      boxSizing:    'border-box',
    }}>
      <IconBox src={icon} alt={label} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 }}>
        <span style={{
          fontFamily: 'Arimo', fontWeight: 600,
          fontSize: `${s(14)}px`, lineHeight: '1.4', color: '#FFFFFF',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily:     'Arimo', fontWeight: 400,
          fontSize:       `${s(13)}px`, lineHeight: '1.5',
          color:          '#2B72FB',
          textDecoration: underline ? 'underline' : 'none',
          wordBreak:      'break-word',
        }}>
          {value}
        </span>
      </div>
    </div>
  );

  // ── Notification dropdown (logic untouched) ────────────────────────────────
  const NotifDropdown = () => {
    const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
    return (
      <div style={{
        position: 'absolute', top: '54px', right: 0,
        width: isMobile ? 'min(90vw, 340px)' : '380px',
        maxHeight: '480px',
        background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 400,
      }}>
        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0 }}>
              Mark all read
            </button>
          )}
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
          {['all', 'unread'].map(t => (
            <button key={t} onClick={() => setNotifTab(t)} style={{
              height: '32px', padding: '0 16px',
              background: notifTab === t ? '#2B72FB' : 'transparent',
              border: notifTab === t ? 'none' : '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px', cursor: 'pointer',
              fontFamily: 'Arimo', fontSize: '13px',
              fontWeight: notifTab === t ? 700 : 400,
              color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize',
            }}>
              {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>
        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {!list.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            Object.entries(groupByDate(list)).map(([label, items]) => {
              if (!items.length) return null;
              return (
                <div key={label}>
                  <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{label}</p>
                  {items.map(n => (
                    <div key={n.id} onClick={() => markOneRead(n.id)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 18px', background: n.read ? 'transparent' : 'rgba(43,114,251,0.07)', cursor: 'pointer', transition: 'background 0.12s', borderLeft: n.read ? '3px solid transparent' : '3px solid #2B72FB' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(43,114,251,0.07)'}
                    >
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'Arimo', fontWeight: n.read ? 400 : 700, fontSize: '13px', color: '#FFFFFF', margin: '0 0 2px', lineHeight: '1.4' }}>{n.title}</p>
                        <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '0 0 4px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body}</p>
                        <span style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{formatTime(n.time)}</span>
                      </div>
                      {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2B72FB', flexShrink: 0, marginTop: '6px' }} />}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
        {/* Footer */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <button
            onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
            style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            See all notifications
          </button>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#002263' }}>
      <Sidebar />

      {/* ── Main content column ───────────────────────────────────────────── */}
      <div style={{
        marginLeft:    `${sidebarWidth}px`,
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        height:        '100vh',
        overflow:      'hidden',
        padding:       isMobile
          ? `${vPad}px 16px`
          : `${vPad}px 51px`,
        boxSizing:     'border-box',
        position:      'relative',
      }}>

        {/* Bell — absolute so it doesn't push layout ───────────────────── */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top:      `${vPad}px`,
          right:    isMobile ? '16px' : '51px',
          zIndex:   200,
        }}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              width:        '46px',
              height:       '46px',
              background:   showDropdown ? 'rgba(43,114,251,0.2)' : 'rgba(0,62,166,0.35)',
              border:       showDropdown ? '1px solid rgba(43,114,251,0.5)' : '1px solid rgba(255,255,255,0.2)',
              boxShadow:    '0px 2px 3px rgba(255,255,255,0.15)',
              borderRadius: '14px',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              position:     'relative',
              transition:   'all 0.15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unreadCount > 0 && (
              <>
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '22px', height: '22px', background: '#2B72FB', opacity: 0.42, borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '-1px', right: '-1px', minWidth: '18px', height: '18px', background: '#2B72FB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxSizing: 'border-box' }}>
                  <span style={{ fontFamily: 'Arimo', fontSize: '9px', fontWeight: 700, color: '#FFFFFF' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                </div>
              </>
            )}
          </button>
          {showDropdown && <NotifDropdown />}
        </div>

        {/* Back button ─────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/about')}
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '8px',
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            padding:    0,
            marginBottom: '16px',
            flexShrink: 0,
            width:      'fit-content',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
              stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* Card centring wrapper — fills remaining height exactly ──────── */}
        <div style={{
          flex:            1,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          overflow:        'hidden',
          minHeight:       0,
        }}>
          {/* ── Outer card ─────────────────────────────────────────────────
               Never scrolls. All sizing is driven by the scale factor so
               the card always fits within the available viewport height.
          ──────────────────────────────────────────────────────────────── */}
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            width:         '100%',
            maxWidth:      isMobile ? '100%' : isTablet ? '480px' : '547px',
            background:    'rgba(13,19,56,0.4)',
            border:        '1px solid rgba(255,255,255,0.1)',
            boxShadow:     '0px 0px 10px rgba(255,255,255,0.15)',
            borderRadius:  `${s(25)}px`,
            padding:       isMobile ? '20px 18px' : `${s(28)}px ${s(38)}px`,
            gap:           `${s(16)}px`,
            boxSizing:     'border-box',
            overflow:      'hidden',
          }}>

            {/* Title */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <h2 style={{
                fontFamily: 'Arimo',
                fontWeight: 700,
                fontSize:   `${s(19)}px`,
                lineHeight: '1.2',
                color:      '#FFFFFF',
                margin:     `0 0 ${s(6)}px`,
              }}>
                Contact Support
              </h2>
              <p style={{
                fontFamily: 'Arimo',
                fontWeight: 400,
                fontSize:   `${s(15)}px`,
                lineHeight: '1.4',
                color:      'rgba(255,255,255,0.5)',
                margin:     0,
              }}>
                Support and assistance for your alumni needs
              </p>
            </div>

            {/* ── Inner contact list card ─────────────────────────────── */}
            <div style={{
              background:    'rgba(13,19,56,0.4)',
              border:        '1px solid rgba(255,255,255,0.1)',
              borderRadius:  `${s(25)}px`,
              padding:       `${s(20)}px ${s(24)}px`,
              display:       'flex',
              flexDirection: 'column',
              gap:           `${s(16)}px`,
              flexShrink:    0,
              filter:        'drop-shadow(0px 0px 10px rgba(255,255,255,0.15))',
            }}>
              {contactItems.map((item, i) => (
                <ContactRow
                  key={i}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  underline={item.underline}
                />
              ))}
            </div>

            {/* ── Legal links card ────────────────────────────────────── */}
            <div style={{
              background:    'rgba(13,19,56,0.4)',
              border:        '1px solid rgba(255,255,255,0.1)',
              boxShadow:     '0px 2px 2px rgba(255,255,255,0.25)',
              borderRadius:  '14px',
              padding:       `${s(6)}px ${s(28)}px`,
              display:       'flex',
              flexDirection: 'column',
              flexShrink:    0,
            }}>
              {legalLinks.map((link, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                  )}
                  <button
                    onClick={() => navigate(link.route)}
                    style={{
                      width:          '100%',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'space-between',
                      background:     'none',
                      border:         'none',
                      cursor:         'pointer',
                      padding:        `${s(14)}px 0`,
                      transition:     'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <span style={{
                      fontFamily: 'Arimo',
                      fontWeight: 700,
                      fontSize:   `${s(16)}px`,
                      color:      '#FFFFFF',
                    }}>
                      {link.label}
                    </span>
                    <svg width="11" height="20" viewBox="0 0 11 20" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M1 1L10 10L1 19" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </React.Fragment>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;