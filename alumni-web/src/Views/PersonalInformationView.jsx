import React from 'react';
import Sidebar from '../components/Sidebar';

const inputStyle = {
  width: '100%', height: '47px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '0.89px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  padding: '12px 16px',
  fontFamily: 'Arimo', fontSize: '15px',
  lineHeight: '21px', color: '#FFFFFF',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: 'Arimo', fontWeight: 400,
  fontSize: '14px', lineHeight: '21px', color: 'rgba(255,255,255,0.8)',
};

const Field = ({ label, children, mb = '16px', flex }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: mb, ...(flex ? { flex } : {}) }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const PersonalInformationView = ({
  isMobile, isTablet,
  form, set, loading, saving, success, error, handleSave,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  const sidebarWidth = isTablet ? 200 : 229;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#002263' }}>
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

        {/* ── Notification Bell ──────────────────────────────────────────────── */}
        <div ref={bellRef} style={{ position: 'fixed', top: isMobile ? '24px' : isTablet ? '24px' : '28px', right: isMobile ? '20px' : isTablet ? '24px' : '32px', zIndex: 200 }}>
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
            <div style={{ position: 'absolute', top: '54px', right: 0, width: isMobile ? '90vw' : '380px', maxHeight: '520px', background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
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
                  if (!list.length) return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
                    </div>
                  );
                  return Object.entries(groupByDate(list)).map(([label, items]) => {
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
          )}
        </div>

        {/* ── Card ───────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          padding: isMobile ? '24px 20px 28px' : '28px 33px 32px',
          width: '100%', maxWidth: '680px',
          background: 'rgba(13, 19, 56, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          borderRadius: '14px',
          boxSizing: 'border-box',
        }}>

          {/* Back button */}
          <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '12px' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
          </button>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: isMobile ? '18px' : '20px', color: '#FFFFFF', margin: '0 0 4px 0' }}>
              Personal Information
            </h2>
            <p style={{ fontFamily: 'Arimo', fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Review and update your basic personal details
            </p>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0 16px' }} />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <span style={{ fontFamily: 'Arimo', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Loading...</span>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '15px', color: '#FFFFFF', margin: '0 0 12px 0' }}>Personal Details</h3>

              <Field label="Last Name">
                <input
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder="e.g. Dela Cruz"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                  onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </Field>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '20px' }}>
                <Field label="First Name" mb="0" flex={1}>
                  <input
                    value={form.firstName}
                    onChange={set('firstName')}
                    placeholder="e.g. Juan"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </Field>
                <Field label="Middle Name" mb="0" flex={1}>
                  <input
                    value={form.middleName}
                    onChange={set('middleName')}
                    placeholder="e.g. Mercado"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </Field>
              </div>

              <h3 style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '15px', color: '#FFFFFF', margin: '0 0 12px 0' }}>Account Security</h3>

              <Field label="Email Address">
                <input value={form.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </Field>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <button
                  onClick={() => navigate('/change-password')}
                  style={{
                    width: '100%', height: '47px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '0.89px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', boxSizing: 'border-box',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(43,114,251,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <span style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '14px', color: '#FFFFFF' }}>Change Password</span>
                  <svg width="13" height="20" viewBox="0 0 13 20" fill="none">
                    <path d="M2 2L11 10L2 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {error && (
                <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                  <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: '#FF6B6B', margin: 0 }}>{error}</p>
                </div>
              )}
              {success && (
                <div style={{ background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                  <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: '#00C853', margin: 0 }}>Changes saved successfully!</p>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%', height: '48px',
                  background: saving ? 'rgba(0,40,255,0.4)' : 'rgba(0,40,255,0.8)',
                  boxShadow: '0px 2px 2px rgba(255,255,255,0.25)',
                  border: 'none', borderRadius: '10px',
                  fontFamily: 'Arimo', fontWeight: 600, fontSize: '15px', color: '#FFFFFF',
                  cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationView;