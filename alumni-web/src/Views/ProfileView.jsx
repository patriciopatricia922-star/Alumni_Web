import React from 'react';
import Sidebar from '../components/Sidebar';
import prfdeets_icn from '../assets/prfdeets_icn.svg';
import about_icn     from '../assets/about_icn.svg';
import logout_icn    from '../assets/logout_icn.svg';
import profile_icn   from '../assets/profile_icn.svg';
import '../styles/Profile.css';

// ── Helpers ────────────────────────────────────────────────────────────────
const getStrengthLabel = (pct) => {
  if (pct >= 100) return 'Excellent – 100% complete';
  if (pct >= 80)  return `Very Good – ${pct}% complete`;
  if (pct >= 60)  return `Good – ${pct}% complete`;
  if (pct >= 40)  return `Fair – ${pct}% complete`;
  if (pct >= 20)  return `Getting Started – ${pct}% complete`;
  return                 `Just Starting – ${pct}% complete`;
};

const groupByDate = (list) => {
  const today     = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
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
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return Math.floor(diff / 60)    + 'm ago';
  if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

// ── Profile Strength Card ──────────────────────────────────────────────────
const ProfileStrengthCard = ({ strength, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width:      '100%',
      padding:    '14px 18px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(43,114,251,0.5) 0%, rgba(30,37,85,0.65) 100%)',
      border:     '1px solid rgba(255,255,255,0.1)',
      cursor:     'pointer',
      boxSizing:  'border-box',
      flexShrink: 0,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
      <span style={{
        fontFamily:    'Montserrat, Arimo, Arial',
        fontWeight:    800,
        fontSize:      '11px',
        letterSpacing: '0.5px',
        color:         '#FFFFFF',
        textTransform: 'uppercase',
      }}>
        Profile Strength
      </span>
      <div style={{
        width:          '36px',
        height:         '36px',
        borderRadius:   '50%',
        background:     '#FFED97',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <span style={{
          fontFamily: 'Montserrat, Arimo, Arial',
          fontWeight: 800,
          fontSize:   '10px',
          color:      '#012E86',
        }}>
          {strength}%
        </span>
      </div>
    </div>

    <p style={{
      fontFamily: 'Montserrat, Arimo, Arial',
      fontSize:   '11px',
      color:      'rgba(255,255,255,0.7)',
      margin:     '0 0 8px 0',
    }}>
      {getStrengthLabel(strength)}
    </p>

    <div style={{
      height:       '7px',
      background:   'rgba(43,79,187,0.5)',
      borderRadius: '10px',
      overflow:     'hidden',
      marginBottom: '12px',
    }}>
      <div style={{
        height:      '100%',
        width:       `${Math.min(strength, 100)}%`,
        background:  '#FFED97',
        borderRadius:'10px',
        transition:  'width 0.4s ease',
      }} />
    </div>

    <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '10px' }} />

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Montserrat, Arimo, Arial', fontSize: '11px', color: '#FFFFFF' }}>
        Continue profile information set up
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>
);

// ── Main View ──────────────────────────────────────────────────────────────
const ProfileView = ({
  user, avatarUrl, width, strength,
  showModal, setShowModal,
  bellRef, notifs, notifTab, setNotifTab,
  unreadCount, showDropdown, setShowDropdown,
  markAllRead, markOneRead,
  onAvatarUpload, navigate,
}) => {
  const isMobile     = width < 768;
  const isTablet     = width >= 768 && width < 1024;
  const sidebarWidth = isTablet ? 200 : 229;

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : '';
  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '';

  const avatarSize       = isMobile ? 72 : 84;
  const initialsFontSize = isMobile ? '24px' : '30px';

  const menuItems = [
    {
      icon: prfdeets_icn, label: 'Personal Information', color: '#FFFFFF',
      action: () => navigate('/personal-information'),
    },
    {
      icon: about_icn, label: 'About', color: '#FFFFFF',
      action: () => navigate('/about'),
    },
    {
      icon: logout_icn, label: 'Log out', color: '#FF0000',
      action: async () => {
        const { supabase } = await import('../lib/supabase');
        await supabase.auth.signOut();
        navigate('/login');
      },
    },
  ];

  return (
    <div style={{
      display:  'flex',
      height:   '100vh',
      overflow: 'hidden',
      background: '#012E86',
    }}>
      <Sidebar />

      <div style={{
        marginLeft:     isMobile ? 0 : `${sidebarWidth}px`,
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        isMobile ? '16px 16px 80px' : '20px 32px',
        boxSizing:      'border-box',
        overflow:       'hidden',
        position:       'relative',
      }}>

        <div ref={bellRef} style={{
          position: 'absolute',
          top:      isMobile ? '16px' : '20px',
          right:    isMobile ? '16px' : '32px',
          zIndex:   200,
        }}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              width:          '44px',
              height:         '44px',
              background:     showDropdown ? 'rgba(43,114,251,0.2)' : 'rgba(0,62,166,0.35)',
              border:         showDropdown
                                ? '1.24px solid rgba(43,114,251,0.5)'
                                : '1.24px solid rgba(255,255,255,0.2)',
              borderRadius:   '14px',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              position:       'relative',
              transition:     'all 0.15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            {unreadCount > 0 && (
              <div style={{
                position:       'absolute',
                top:            '-5px',
                right:          '-5px',
                minWidth:       '20px',
                height:         '20px',
                background:     '#2B72FB',
                borderRadius:   '50%',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '0 4px',
              }}>
                <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FFFFFF', fontWeight: 700 }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div style={{
              position:       'absolute',
              top:            '52px',
              right:          0,
              width:          isMobile ? '90vw' : '380px',
              maxHeight:      '520px',
              background:     'rgba(13,19,56,0.97)',
              backdropFilter: 'blur(16px)',
              border:         '1px solid rgba(255,255,255,0.1)',
              borderRadius:   '16px',
              boxShadow:      '0 20px 60px rgba(0,0,0,0.5)',
              display:        'flex',
              flexDirection:  'column',
              overflow:       'hidden',
              zIndex:         300,
            }}>
              <div style={{
                padding:        '16px 18px 12px',
                borderBottom:   '1px solid rgba(255,255,255,0.07)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                flexShrink:     0,
              }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{
                    background: 'none', border: 'none',
                    fontFamily: 'Arimo', fontSize: '12px', color: '#2B72FB',
                    cursor: 'pointer', padding: 0,
                  }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                {['all', 'unread'].map(t => (
                  <button key={t} onClick={() => setNotifTab(t)} style={{
                    height:        '32px',
                    padding:       '0 16px',
                    background:    notifTab === t ? '#2B72FB' : 'transparent',
                    border:        notifTab === t ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius:  '20px',
                    cursor:        'pointer',
                    fontFamily:    'Arimo',
                    fontSize:      '13px',
                    fontWeight:    notifTab === t ? 700 : 400,
                    color:         '#FFFFFF',
                    transition:    'all 0.15s',
                    textTransform: 'capitalize',
                  }}>
                    {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>

              <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (!list.length) return (
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '40px 20px', gap: '10px',
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"
                        />
                      </svg>
                      <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                        {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                      </p>
                    </div>
                  );
                  return Object.entries(groupByDate(list)).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p style={{
                          fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px',
                          color: 'rgba(255,255,255,0.35)',
                          textTransform: 'uppercase', letterSpacing: '0.8px',
                          margin: '10px 18px 4px',
                        }}>{label}</p>
                        {items.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markOneRead(n.id)}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: '12px',
                              padding: '10px 18px',
                              background: n.read ? 'transparent' : 'rgba(43,114,251,0.07)',
                              cursor: 'pointer', transition: 'background 0.12s',
                              borderLeft: n.read ? '3px solid transparent' : '3px solid #2B72FB',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(43,114,251,0.07)'}
                          >
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '50%',
                              background: 'rgba(43,114,251,0.15)',
                              border: '1px solid rgba(43,114,251,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, marginTop: '2px',
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                                  stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontFamily: 'Arimo', fontWeight: n.read ? 400 : 700,
                                fontSize: '13px', color: '#FFFFFF', margin: '0 0 2px', lineHeight: '1.4',
                              }}>{n.title}</p>
                              <p style={{
                                fontFamily: 'Arimo', fontSize: '12px',
                                color: 'rgba(255,255,255,0.45)', margin: '0 0 4px', lineHeight: '1.4',
                                display: '-webkit-box', WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              }}>{n.body}</p>
                              <span style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                                {formatTime(n.time)}
                              </span>
                            </div>
                            {!n.read && (
                              <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: '#2B72FB', flexShrink: 0, marginTop: '6px',
                              }} />
                            )}
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
                  style={{
                    width: '100%', height: '36px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          padding:       isMobile ? '18px 16px 20px' : '22px 28px 26px',
          gap:           isMobile ? '10px' : '12px',
          width:         isMobile ? '100%' : isTablet ? '420px' : '480px',
          maxHeight:     isMobile ? 'calc(100vh - 110px)' : 'calc(100vh - 60px)',
          overflow:      'hidden', 
          background:    'rgba(1,37,107,0.6)',
          border:        '1px solid rgba(255,255,255,0.1)',
          boxShadow:     '0px 4px 24px rgba(0,0,0,0.3)',
          borderRadius:  '20px',
          boxSizing:     'border-box',
        }}>

          <div style={{
            background:    'rgba(43,58,140,0.6)',
            border:        '1px solid rgba(255,255,255,0.15)',
            padding:       '4px 14px',
            borderRadius:  '30px',
            fontSize:      '10px',
            letterSpacing: '1px',
            color:         'rgba(255,255,255,0.8)',
            fontFamily:    'Arimo, Arial',
            fontWeight:    400,
            flexShrink:    0,
          }}>
            SET UP PROFILE
          </div>

          <ProfileStrengthCard
            strength={strength}
            onClick={() => navigate('/personal-information')}
          />

          <div style={{
            width:      '100%',
            height:     '1px',
            background: 'rgba(255,255,255,0.08)',
            flexShrink: 0,
          }} />

          <div
            style={{
              width:     `${avatarSize}px`,
              height:    `${avatarSize}px`,
              position:  'relative',
              cursor:    'pointer',
              flexShrink: 0,
            }}
            onClick={() => document.getElementById('avatar-upload').click()}
            onMouseEnter={e => e.currentTarget.querySelector('.avatar-overlay').style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.querySelector('.avatar-overlay').style.opacity = '0'}
          >
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={onAvatarUpload}
            />

            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" style={{
                width: `${avatarSize}px`, height: `${avatarSize}px`,
                borderRadius: '50%', objectFit: 'cover',
                border: '3px solid rgba(255,255,255,0.15)', display: 'block',
              }} />
            ) : user ? (
              <div style={{
                width: `${avatarSize}px`, height: `${avatarSize}px`,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #51A2FF 0%, #155DFC 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid rgba(255,255,255,0.15)',
              }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: initialsFontSize, color: '#FFFFFF' }}>
                  {initials}
                </span>
              </div>
            ) : (
              <div style={{
                width: `${avatarSize}px`, height: `${avatarSize}px`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img
                  src={profile_icn} alt="Profile"
                  style={{ width: `${avatarSize}px`, height: `${avatarSize}px`, filter: 'brightness(0) invert(1)' }}
                />
              </div>
            )}

            <div className="avatar-overlay" style={{
              position: 'absolute', top: 0, left: 0,
              width: `${avatarSize}px`, height: `${avatarSize}px`,
              borderRadius: '50%', background: 'rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
              opacity: 0, transition: 'opacity 0.2s ease',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
                <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
              </svg>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', fontWeight: 600, color: '#FFFFFF' }}>
                Change Photo
              </span>
            </div>
          </div>

          <h2 style={{
            fontFamily: 'Arimo, Arial', fontWeight: 700,
            fontSize:   isMobile ? '18px' : '22px',
            lineHeight: '1.2', textAlign: 'center',
            color:      '#FFFFFF', margin: 0, flexShrink: 0,
          }}>
            {fullName || 'Loading...'}
          </h2>

          {/* DYNAMIC PROGRAM & BATCH YEAR DISPLAY */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            margin: '-4px 0 0 0',
            flexShrink: 0,
          }}>
            <p style={{
              fontFamily: 'Montserrat, Arimo, Arial',
              fontSize:   '12px',
              color:      '#FFFFFF',
              margin:     0,
              textAlign:  'center',
              fontWeight: 500,
            }}>
              {user?.program || 'Program not set'}
            </p>
            <p style={{
              fontFamily: 'Montserrat, Arimo, Arial',
              fontSize:   '11px',
              color:      'rgba(255,255,255,0.5)',
              margin:     0,
              textAlign:  'center',
              letterSpacing: '0.5px'
            }}>
              {user?.batch_year ? `Batch ${user.batch_year}` : 'Batch Year not set'}
            </p>
          </div>

          <div style={{
            width:        '100%',
            background:   'rgba(1,37,107,0.5)',
            border:       '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            overflow:     'hidden',
            flexShrink:   0,
          }}>
            <div style={{ padding: isMobile ? '10px 18px 6px' : '12px 22px 8px' }}>
              <h3 style={{
                fontFamily:    'Arimo, Arial', fontWeight: 700,
                fontSize:      '12px', lineHeight: '1.4',
                color:         'rgba(255,255,255,0.45)',
                margin:        0, letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}>
                Settings
              </h3>
            </div>

            <div style={{ paddingBottom: '4px' }}>
              {menuItems.map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 18px' }} />
                  )}
                  <button
                    onClick={item.action}
                    style={{
                      width:      '100%',
                      display:    'flex',
                      alignItems: 'center',
                      gap:        '12px',
                      padding:    isMobile ? '10px 18px' : '11px 22px',
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      textAlign:  'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{
                      width: '24px', height: '24px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={item.icon} alt={item.label}
                        style={{
                          width: '18px', height: '18px',
                          filter: item.color === '#FF0000'
                            ? 'brightness(0) saturate(100%) invert(17%) sepia(96%) saturate(7472%) hue-rotate(0deg) brightness(105%) contrast(115%)'
                            : 'brightness(0) invert(1)',
                        }}
                      />
                    </div>
                    <span style={{
                      fontFamily: 'Arimo, Arial', fontWeight: 600,
                      fontSize:   isMobile ? '13px' : '14px',
                      lineHeight: '20px', color: item.color, flex: 1,
                    }}>
                      {item.label}
                    </span>
                    {item.color !== '#FF0000' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,0.35)" strokeWidth="2.5">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
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

export default ProfileView;