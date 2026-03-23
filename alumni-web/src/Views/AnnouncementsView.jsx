import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import megaphoneIcon from '../assets/megaphone_ic.svg';
import calenderIcon  from '../assets/calendar_ic.svg';
import documentIcon  from '../assets/document_ic.svg';

const CATEGORY_ICONS = {
  'News':       megaphoneIcon,
  'Activities': calenderIcon,
};
const getIcon = (category) => CATEGORY_ICONS[category] || documentIcon;

// ── Icons ──────────────────────────────────────────────────────────────────────
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17"/>
    <path d="M7 4V7.5L9.5 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17" strokeLinecap="round"/>
  </svg>
);

// ── Announcement Card ──────────────────────────────────────────────────────────
const AnnouncementCard = ({ announcement, isMobile, isTablet }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(0,62,166,0.35)',
        border: `0.889px solid ${hovered ? 'rgba(43,114,251,0.55)' : 'rgba(255,255,255,0.2)'}`,
        boxShadow: hovered
          ? '0px 0px 20px rgba(43,114,251,0.3), 0px 8px 24px rgba(0,0,0,0.4)'
          : '0px 2px 2px rgba(255,255,255,0.25)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: 'pointer',
      }}
    >
      {/* Timestamp */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: isMobile ? '8px 14px' : '10px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClockIcon />
          <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            {announcement.time}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 14px 14px' : '0 20px 20px',
        gap: isMobile ? '12px' : '20px',
        flex: 1,
      }}>
        {/* Icon box */}
        <div style={{
          width:    isMobile ? '64px' : isTablet ? '80px' : '100px',
          height:   isMobile ? '64px' : isTablet ? '80px' : '100px',
          minWidth: isMobile ? '64px' : isTablet ? '80px' : '100px',
          background: 'rgba(0,62,166,0.35)',
          boxShadow: '0px 10px 15px rgba(97,95,255,0.5), 0px 4px 6px rgba(43,114,251,0.15)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, position: 'relative', marginLeft: '-4px',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}>
          <img
            src={getIcon(announcement.category)}
            alt={announcement.category}
            style={{ width: '82%', height: '82%', objectFit: 'contain', filter: 'drop-shadow(0px 4px 4px #2B72FB)' }}
          />
          <div style={{
            position: 'absolute', top: '-8px', right: '-8px',
            width: '22px', height: '22px',
            background: 'rgba(43,114,251,0.42)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: '14px', height: '14px', background: '#2B72FB', borderRadius: '50%' }} />
          </div>
        </div>

        {/* Text */}
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

      {/* Footer */}
      <div style={{
        padding: isMobile ? '10px 14px' : '12px 20px',
        borderTop: '0.89px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
      }}>
        <button
          style={{
            height: '36px', padding: '0 18px',
            borderRadius: '14px', border: 'none',
            background: 'rgba(0,40,255,0.85)',
            boxShadow: '0px 2px 2px rgba(255,255,255,0.25)',
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
};

// ── Main View ──────────────────────────────────────────────────────────────────
const AnnouncementsView = ({
  isMobile, isTablet,
  filtered, loading,
  categories, activeCategory, setActiveCategory,
  categoryCounts, showFilter, setShowFilter, filterRef,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  const sidebarWidth = isTablet ? 200 : 229;

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

        {/* ── Notification Bell ──────────────────────────────────────────────── */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top:   isMobile ? '24px' : '37px',
          right: isMobile ? '16px' : isTablet ? '32px' : '51px',
          zIndex: 200,
        }}>
          <button onClick={() => setShowDropdown(v => !v)} style={{
            width:  isMobile ? '44px' : '58px',
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
            <div style={{ position: 'absolute', top: isMobile ? '52px' : '70px', right: 0, width: isMobile ? '90vw' : '380px', maxHeight: '520px', background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
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

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{ paddingRight: isMobile ? '60px' : '90px', marginBottom: isMobile ? '20px' : '28px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: isMobile ? '12px' : '16px' }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
          </button>
          <h1 style={{
            fontFamily: 'Arimo, Arial', fontWeight: 700,
            fontSize: isMobile ? '27px' : isTablet ? '31px' : '39px',
            lineHeight: '1.2', letterSpacing: '-1px',
            color: '#FFFFFF', margin: '0 0 8px 0',
          }}>
            Announcements
          </h1>
          <p style={{
            fontFamily: 'Arimo, Arial', fontWeight: 400,
            fontSize: isMobile ? '13px' : '16px', lineHeight: '22px',
            color: 'rgba(255,255,255,0.6)', margin: 0,
          }}>
            Stay connected with the latest news, events, and opportunities from your alumni network.
          </p>
        </div>

        {/* ── Featured Banner ─────────────────────────────────────────────────── */}
        {!isMobile && (
          <div style={{
            position: 'relative',
            padding: isTablet ? '24px 28px' : '24px 32px',
            background: 'linear-gradient(180deg, rgba(43,114,251,0.2) 0%, rgba(30,37,85,0.3) 100%)',
            border: '0.889px solid rgba(43,114,251,0.3)',
            boxShadow: '0px 0px 8px rgba(255,255,255,0.5)',
            borderRadius: '24px',
            marginBottom: isTablet ? '28px' : '32px',
            overflow: 'hidden',
            display: 'flex', gap: '24px', alignItems: 'center',
          }}>
            <div style={{ position: 'absolute', width: '256px', height: '256px', right: '-30px', top: '-127px', background: '#2B72FB', opacity: 0.1, filter: 'blur(64px)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{
              width: isTablet ? '80px' : '120px',
              height: isTablet ? '80px' : '120px',
              flexShrink: 0,
              background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
              boxShadow: '0px 10px 15px rgba(97,95,255,0.5), 0px 4px 6px rgba(43,114,251,0.15)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: 'drop-shadow(0px 4px 4px #2B72FB)',
            }}>
              <img src={megaphoneIcon} alt="Megaphone" style={{ width: '82%', height: '82%', objectFit: 'contain', filter: 'drop-shadow(0px 4px 4px #2B72FB)' }} />
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <h2 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isTablet ? '20px' : '25px', lineHeight: '1.3', letterSpacing: '-0.35px', color: '#FFFFFF', margin: '0 0 8px 0' }}>
                Alumni Tracer Survey
              </h2>
              <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '13px', lineHeight: '22px', color: 'rgba(255,255,255,0.65)', margin: '0 0 16px 0' }}>
                Your feedback matters! Complete our annual survey to help us improve the alumni experience and community engagement.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClockIcon />
                  <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>2 hours ago</span>
                </div>
                <button style={{
                  height: '39px', padding: '0 20px',
                  borderRadius: '14px', border: 'none',
                  background: 'rgba(0,40,255,0.85)',
                  boxShadow: '0px 2px 2px rgba(255,255,255,0.25)',
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
          </div>
        )}

        {/* ── Filter bar ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: isMobile ? '16px' : '24px', gap: '12px' }}>

          {/* ── Wrapper covers both pill + button so dropdown aligns to pill ── */}
          <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>

            {/* Label pill */}
            <div style={{
              height: '37px', display: 'flex', alignItems: 'center',
              padding: '0 12px', gap: '8px',
              background: 'rgba(0,62,166,0.35)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px',
              filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))',
              minWidth: isMobile ? 0 : '211px',
              flex: isMobile ? 1 : 'none',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                {activeCategory}
              </span>
              <div style={{ background: '#2B72FB', borderRadius: '8px', minWidth: '22.63px', height: '19.98px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', lineHeight: '16px', color: '#FFFFFF' }}>
                  {filtered.length}
                </span>
              </div>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilter(f => !f)}
              style={{
                height: '37px', padding: '0 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'rgba(0,40,255,0.85)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
                filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '13px', lineHeight: '14px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>FILTER</span>
            </button>

            {/* Dropdown — left: 0 aligns it to the pill's left edge */}
            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: 'rgba(0,62,166,0.55)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', overflow: 'hidden',
                zIndex: 300, minWidth: '220px',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.5)',
              }}>
                {categories.map((cat, i) => (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: activeCategory === cat ? 'rgba(43,114,251,0.25)' : 'transparent',
                      border: 'none',
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: activeCategory === cat ? '#FFFFFF' : 'rgba(255,255,255,0.7)', fontWeight: activeCategory === cat ? 700 : 400 }}>{cat}</span>
                    <div style={{ background: activeCategory === cat ? '#2B72FB' : 'rgba(43,114,251,0.25)', borderRadius: '6px', padding: '1px 7px' }}>
                      <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '11px', color: '#FFFFFF' }}>{categoryCounts[cat]}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Cards grid ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Loading announcements…</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '14px' : isTablet ? '18px' : '24px',
          }}>
            {filtered.map(a => (
              <AnnouncementCard key={a.id} announcement={a} isMobile={isMobile} isTablet={isTablet} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AnnouncementsView;