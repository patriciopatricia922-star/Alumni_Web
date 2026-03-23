import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const SUPPRESS_NATIVE_EYE = `
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear,
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-contacts-auto-fill-button {
    display: none !important;
    pointer-events: none;
  }
`;

const EyeIcon = ({ visible }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {visible ? (
      <>
        <path d="M1 9C1 9 4 3 9 3C14 3 17 9 17 9C17 9 14 15 9 15C4 15 1 9 1 9Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="9" r="2.5" stroke="#FFFFFF" strokeWidth="1.5"/>
      </>
    ) : (
      <>
        <path d="M1 1L17 17M7.5 7.6C7.19 7.92 7 8.34 7 8.8C7 9.8 7.9 10.6 9 10.6C9.5 10.6 9.95 10.42 10.3 10.12M5.2 5.28C3.27 6.45 2 8 2 8C2 8 5 14 9 14C10.5 14 11.86 13.44 12.98 12.65M3 3C3 3 4.5 3 6 3C8.5 3 10 3 12 3C14 3 16 5 16 5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

const PasswordInput = ({ label, value, onChange, hint }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontFamily: 'Arimo, Arimo', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: 'rgba(255,255,255,0.8)' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          style={{
            width: '100%', height: '47px',
            background: 'rgba(243, 243, 245, 0.17)',
            border: '0.89px solid rgba(0, 0, 0, 0.25)',
            borderRadius: '10px', padding: '12px 48px 12px 16px',
            fontFamily: 'Arimo, Arimo', fontSize: '14px', color: '#FFFFFF',
            outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.25)'}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', zIndex: 1,
          }}
        >
          <EyeIcon visible={show} />
        </button>
      </div>
      {hint && <p style={{ fontFamily: 'Arimo, Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{hint}</p>}
    </div>
  );
};

const RULES = [
  { id: 'length',  label: 'At least 8 characters',          test: v => v.length >= 8 },
  { id: 'upper',   label: 'At least one uppercase letter',   test: v => /[A-Z]/.test(v) },
  { id: 'number',  label: 'At least one number',             test: v => /[0-9]/.test(v) },
  { id: 'special', label: 'At least one symbol (!, #, * …)', test: v => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) },
];

const PasswordRules = ({ value }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
      {RULES.map(rule => {
        const passed = rule.test(value);
        return (
          <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{
              width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
              background: passed ? 'rgba(0,200,83,0.2)' : 'rgba(255,255,255,0.07)',
              border: `1.5px solid ${passed ? '#00C853' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {passed && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span style={{ fontFamily: 'Arimo, Arimo', fontSize: '12px', color: passed ? '#00C853' : 'rgba(255,255,255,0.45)' }}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const sidebarWidth = isTablet ? 200 : 229;

  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  // ── Notification state ──────────────────────────────────────────────────────
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

  const allRulesPassed = RULES.every(rule => rule.test(newPass));

  const handleSave = async () => {
    setError(''); setSuccess(false);
    if (!current || !newPass || !confirm) return setError('Please fill in all fields.');
    if (!allRulesPassed) return setError('New password does not meet all requirements.');
    if (newPass !== confirm) return setError('New passwords do not match.');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
      if (signInError) throw new Error('Current password is incorrect.');
      const { error: updateError } = await supabase.auth.updateUser({ password: newPass });
      if (updateError) throw updateError;
      setSuccess(true);
      setCurrent(''); setNewPass(''); setConfirm('');
      setTimeout(() => navigate('/personal-information'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#002263' }}>
      <style>{SUPPRESS_NATIVE_EYE}</style>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '24px 16px 90px' : '24px 32px',
        boxSizing: 'border-box',
        overflow: 'auto',
        position: 'relative',
      }}>

        {/* Notification Bell + Dropdown */}
        <div ref={bellRef} style={{ position: 'fixed', top: isMobile?'24px':isTablet?'24px':'28px', right: isMobile?'20px':isTablet?'24px':'32px', zIndex: 200 }}>
          <button onClick={() => setShowDropdown(v => !v)} style={{
            width: '46px', height: '46px',
            background: showDropdown ? 'rgba(43,114,251,0.2)' : 'rgba(0,62,166,0.35)',
            border: showDropdown ? '1.24px solid rgba(43,114,251,0.5)' : '1.24px solid rgba(255,255,255,0.2)',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'all 0.15s',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z" stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: '-5px', right: '-5px', minWidth: '20px', height: '20px', background: '#2B72FB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FFFFFF', fontWeight: 700 }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', top: '54px', right: 0, width: isMobile?'90vw':'380px', maxHeight: '520px', background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
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
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card */}
        <div style={{
          position: 'relative',
          width: '100%', maxWidth: '500px',
          background: 'rgba(13, 19, 56, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          borderRadius: '14px',
          padding: isMobile ? '44px 20px 28px' : '44px 33px 32px',
          boxSizing: 'border-box',
        }}>

          {/* Back button */}
          <button onClick={() => navigate('/personal-information')} style={{
            position: 'absolute', top: '24px', left: '24px',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontFamily: 'Arimo, Arimo', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
          </button>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Arimo, Arimo', fontWeight: 700, fontSize: isMobile ? '18px' : '20px', color: '#FFFFFF', margin: '0 0 4px 0' }}>Change Password</h2>
            <p style={{ fontFamily: 'Arimo, Arimo', fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Enter your current and new password for your account</p>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
            <PasswordInput label="Current password *" value={current} onChange={e => setCurrent(e.target.value)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <PasswordInput label="New password *" value={newPass} onChange={e => setNewPass(e.target.value)} />
              <PasswordRules value={newPass} />
            </div>
            <PasswordInput label="Confirm new password *" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
              <p style={{ fontFamily: 'Arimo, Arimo', fontSize: '13px', color: '#FF6B6B', margin: 0 }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
              <p style={{ fontFamily: 'Arimo, Arimo', fontSize: '13px', color: '#00C853', margin: 0 }}>Password updated! Redirecting...</p>
            </div>
          )}

          <button onClick={handleSave} disabled={loading}
            style={{
              width: '100%', height: '48px',
              background: loading ? 'rgba(0,40,255,0.4)' : 'rgba(0,40,255,0.8)',
              boxShadow: '0px 2px 2px rgba(255,255,255,0.25)',
              borderRadius: '13px', border: 'none',
              fontFamily: 'Arimo, Arimo', fontWeight: 700, fontSize: '15px', color: '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(0,40,255,0.95)'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(0,40,255,0.8)'; }}
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;