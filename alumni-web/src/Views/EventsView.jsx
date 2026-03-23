import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

// ── Icons ──────────────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="16" height="15" rx="2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/>
    <path d="M2 7h16" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/>
    <path d="M6 1v4M14 1v4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M7 4v3l2 1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3"  r="1.2" fill="rgba(255,255,255,0.4)"/>
    <circle cx="8" cy="8"  r="1.2" fill="rgba(255,255,255,0.4)"/>
    <circle cx="8" cy="13" r="1.2" fill="rgba(255,255,255,0.4)"/>
  </svg>
);

// ── Event Card ─────────────────────────────────────────────────────────────────
const EventCard = ({ event, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(13,19,56,0.4)',
        border: `1.24px solid ${hovered ? 'rgba(43,114,251,0.4)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hovered
          ? '0px 0px 20px rgba(43,114,251,0.25), 0px 8px 24px rgba(0,0,0,0.4)'
          : '0px 2px 2px rgba(255,255,255,0.25)',
        borderRadius: '16px',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Card Header */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'flex-start',
        padding: isMobile ? '16px 16px 16px 18px' : '20px 20px 20px 24px',
        borderBottom: '0.89px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: '48px', height: '48px', flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
          boxShadow: '0px 10px 15px rgba(97,95,255,0.3), 0px 4px 6px rgba(43,114,251,0.15)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}>
          <CalendarIcon />
        </div>

        <div style={{ flex: 1, paddingLeft: '16px' }}>
          <p style={{
            fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px',
            lineHeight: '22px', letterSpacing: '-0.35px',
            color: '#FFED97', margin: '0 0 4px 0',
          }}>
            {event.name}
          </p>
          <p style={{
            fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px',
            lineHeight: '20px', color: 'rgba(255,255,255,0.7)', margin: 0,
          }}>
            {event.date}
          </p>
        </div>

        <div style={{ paddingTop: '4px', cursor: 'pointer' }}>
          <MoreIcon />
        </div>
      </div>

      {/* Description */}
      <div style={{ padding: '16px 24px 0' }}>
        <p style={{
          fontFamily: 'Arimo', fontWeight: 400, fontSize: '14px',
          lineHeight: '23px', color: 'rgba(255,255,255,0.65)', margin: 0,
        }}>
          {event.description}
        </p>
      </div>

      {/* Card Footer */}
      <div style={{
        borderTop: '1.24px solid rgba(255,255,255,0.1)',
        margin: '16px 0 0 0', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <ClockIcon />
        <span style={{
          fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px',
          lineHeight: '16px', color: 'rgba(255,255,255,0.5)',
        }}>
          {event.time}
        </span>
      </div>
    </div>
  );
};

// ── Main View ──────────────────────────────────────────────────────────────────
const EventsView = ({
  isMobile, isTablet,
  categories, activeCategory, setActiveCategory,
  showFilter, setShowFilter, filterRef, categoryCounts, filtered,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  const sidebarWidth = isTablet ? 200 : 229;
  const cols = isMobile ? '1fr' : '1fr 1fr';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial, sans-serif' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        padding: isMobile ? '24px 16px 90px' : isTablet ? '37px 28px 48px' : '37px 51px 60px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative',
      }}>

        {/* ── Notification Bell ──────────────────────────────────────────────── */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top:   isMobile ? '24px' : '37px',
          right: isMobile ? '16px' : isTablet ? '28px' : '51px',
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

        {/* ── Back Button ─────────────────────────────────────────────────────── */}
        <button onClick={() => navigate('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, marginBottom: isMobile ? '16px' : '24px',
        }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: isMobile ? '20px' : '28px', paddingRight: isMobile ? '58px' : '90px' }}>
          <h1 style={{
            fontFamily: 'Arimo, Arial', fontWeight: 700,
            fontSize: isMobile ? '28px' : isTablet ? '32px' : '40px',
            lineHeight: '1.2', letterSpacing: '-1px',
            color: '#FFFFFF', margin: '0 0 8px 0',
          }}>
            Events
          </h1>
          <p style={{
            fontFamily: 'Arimo', fontWeight: 400,
            fontSize: isMobile ? '13px' : '16px', lineHeight: '22px',
            color: 'rgba(255,255,255,0.6)', margin: 0,
          }}>
            Stay connected with the latest news, events, and opportunities from your alumni network.
          </p>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: isMobile ? '16px' : '28px', gap: '12px' }}>

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
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>
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

        {/* ── Events Grid ────────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: isMobile ? '14px' : isTablet ? '18px' : '24px' }}>
            {filtered.map(event => (
              <EventCard key={event.id} event={event} isMobile={isMobile} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arimo, Arial', fontSize: '15px' }}>
            No events found for this category.
          </div>
        )}

      </div>
    </div>
  );
};

export default EventsView;