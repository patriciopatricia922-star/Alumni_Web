import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  FaCalendarAlt,
  FaStar,
  FaFilter,
  FaChevronUp,
} from 'react-icons/fa';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import { truncateHtml, stripHtml } from '../utils/textHelpers';
import '../styles/Events.css';


// ── Design tokens (mirrors Announcements.css) ──────────────────────────────
const T = {
  pageBg:          '#DAE5F1',
  cardBg:          '#FFFFFF',
  cardBorder:      '#E5E7EB',
  cardBorderHover: '#2B72FB',
  cardShadow:      '0px 2px 8px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.06)',
  cardShadowHover: '0px 8px 24px rgba(43,114,251,0.14), 0px 2px 8px rgba(0,0,0,0.08)',
  titleColor:      '#003EA6',
  bodyColor:       '#4A5565',
  metaColor:       '#8A94A6',
  timestampColor:  'rgba(74,85,101,0.65)',
  accent:          '#2B72FB',
  pageTitle:       '#314C86',
  pageSubtitle:    '#545454',
  backColor:       '#003EA6',
  iconBoxBg:       'linear-gradient(180deg, #2B7FFF 0%, #155DFC 100%)',
  iconBoxShadow:   '0px 4px 10px rgba(43,114,251,0.35)',
  iconBoxShadowHover: '0px 8px 20px rgba(43,114,251,0.45)',
  filterBg:        '#FFFFFF',
  filterBorder:    '#E5E7EB',
  filterText:      '#003EA6',
  badgeBg:         '#2B72FB',
  exclusiveBadge:  '#FAC775',
  footerBorder:    '#F0F2F5',
};

// ── Clock SVG ────────────────────────────────────────────────────────────────
const ClockSVG = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(74,85,101,0.45)" strokeWidth="1.2" />
    <path d="M6.5 3.5V6.5L8.5 8" stroke="rgba(74,85,101,0.45)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ── Category badge ────────────────────────────────────────────────────────────
const CategoryBadge = ({ category }) => {
  const isExclusive = category === 'Exclusive Events';
  return (
    <div style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           '5px',
      background:    isExclusive ? 'rgba(250,199,117,0.15)' : '#EEF4FF',
      border:        `1px solid ${isExclusive ? T.exclusiveBadge : T.accent}`,
      borderRadius:  '20px',
      padding:       '3px 10px',
      alignSelf:     'flex-start',
    }}>
      {isExclusive
        ? <FaStar size={10} color={T.exclusiveBadge} />
        : <HiOutlineCalendar size={11} color={T.accent} />}
      <span style={{
        fontFamily:    "'Montserrat', Arial, sans-serif",
        fontSize:      '10px',
        fontWeight:    700,
        color:         isExclusive ? T.exclusiveBadge : T.accent,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {isExclusive ? 'Exclusive' : 'Upcoming'}
      </span>
    </div>
  );
};

// ── Meta item ─────────────────────────────────────────────────────────────────
const MetaItem = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ color: T.metaColor, display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
    <span style={{
      fontFamily: "'Arimo', Arial, sans-serif",
      fontSize:   '12.5px',
      color:      T.bodyColor,
      lineHeight: '1.4',
    }}>
      {text}
    </span>
  </div>
);

// ── Event Card ────────────────────────────────────────────────────────────────
const EventCard = ({ event, isMobile }) => {
  const [hovered,  setHovered]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isExclusive = event.category === 'Exclusive Events';

  const formatEventDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const formatEventTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const relativeTime = (dateStr) => {
    if (!dateStr) return '2 hours ago';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs   = Math.floor(diff / 3600000);
    if (hrs < 1)  return 'just now';
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const hasDetails  = event.location || event.event_date;
  const previewText = stripHtml(event.description || '');
  const needsTrunc  = previewText.length > 120;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   expanded ? 'rgba(0,62,166,0.03)' : T.cardBg,
        border:       `1px solid ${hovered || expanded ? T.cardBorderHover : T.cardBorder}`,
        borderLeft:   expanded ? '3px solid #003EA6' : '3px solid transparent',
        boxShadow:    hovered || expanded ? T.cardShadowHover : T.cardShadow,
        borderRadius: '16px',
        overflow:     'visible',
        cursor:       'pointer',
        transform:    hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition:   'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.12s ease',
      }}
    >
      {/* Card body */}
      <div style={{
        display:    'flex',
        alignItems: 'flex-start',
        padding:    isMobile ? '12px 14px' : '14px 18px',
        gap:        '12px',
      }}>

        {/* Icon box */}
        <div style={{
          width:          40,
          height:         40,
          minWidth:       40,
          background:     'rgba(0,62,166,0.08)',
          border:         '1px solid rgba(0,62,166,0.15)',
          borderRadius:   '50%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          marginTop:      '2px',
          transition:     'transform 0.2s ease, box-shadow 0.2s ease',
          transform:      hovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow:      hovered ? '0px 4px 12px rgba(0,62,166,0.2)' : 'none',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="3" stroke="#003EA6" strokeWidth="1.6" />
            <path d="M3 9H21" stroke="#003EA6" strokeWidth="1.6" />
            <path d="M8 2V5M16 2V5" stroke="#003EA6" strokeWidth="1.6" strokeLinecap="round" />
            <rect x="7" y="13" width="2.5" height="2.5" rx="0.5" fill="#003EA6" />
            <rect x="11" y="13" width="2.5" height="2.5" rx="0.5" fill="#003EA6" />
          </svg>
        </div>

        {/* Content column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>

          {/* Top row: badge + timestamp */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <CategoryBadge category={event.category} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, paddingTop: '2px' }}>
              <ClockSVG />
              <span style={{
                fontFamily: "'Montserrat', Arial, sans-serif",
                fontSize:   '11px',
                color:      'rgba(0,0,0,0.35)',
                whiteSpace: 'nowrap',
              }}>
                {relativeTime(event.created_at || event.event_date)}
              </span>
            </div>
          </div>

          {/* Title */}
          <p style={{
            fontFamily:    "'Montserrat', Arial, sans-serif",
            fontWeight:    700,
            fontSize:      '13px',
            lineHeight:    '1.4',
            letterSpacing: '0px',
            color:         '#0A0A0A',
            margin:        0,
          }}>
            {event.name || event.title}
          </p>

          {/* Description with inline See more */}
          <p style={{
            fontFamily: "'Montserrat', Arial, sans-serif",
            fontWeight: 400,
            fontSize:   '12px',
            lineHeight: '1.4',
            color:      '#4A5565',
            margin:     '0 0 4px 0',
          }}>
            {expanded
              ? previewText
              : needsTrunc
                ? previewText.substring(0, 120) + '… '
                : previewText}
            {!expanded && needsTrunc && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                style={{
                  background:  'none',
                  border:      'none',
                  padding:     0,
                  fontFamily:  "'Montserrat', Arial, sans-serif",
                  fontSize:    '12px',
                  fontWeight:  700,
                  color:       '#2B72FB',
                  cursor:      'pointer',
                  display:     'inline',
                  lineHeight:  'inherit',
                }}
              >
                See more
              </button>
            )}
          </p>

          {/* Compact meta (always visible) */}
          {!expanded && hasDetails && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '2px' }}>
              {event.event_date && (
                <MetaItem
                  icon={<FaCalendarAlt size={11} color={T.metaColor} />}
                  text={formatEventDate(event.event_date)}
                />
              )}
              {event.location && (
                <MetaItem
                  icon={<HiOutlineLocationMarker size={13} color={T.metaColor} />}
                  text={event.location}
                />
              )}
              {event.event_date && (
                <MetaItem
                  icon={<HiOutlineClock size={13} color={T.metaColor} />}
                  text={formatEventTime(event.event_date)}
                />
              )}
            </div>
          )}

          {/* Expanded: full meta + See less */}
          {expanded && hasDetails && (
            <div style={{
              display:       'flex',
              flexDirection: 'column',
              gap:           '8px',
              paddingTop:    '4px',
            }}>
              <div style={{ height: '1px', background: T.footerBorder, margin: '4px 0' }} />
              {event.location && (
                <MetaItem
                  icon={<HiOutlineLocationMarker size={13} color={T.metaColor} />}
                  text={event.location}
                />
              )}
              {event.event_date && (
                <MetaItem
                  icon={<FaCalendarAlt size={11} color={T.metaColor} />}
                  text={formatEventDate(event.event_date)}
                />
              )}
              {event.event_date && (
                <MetaItem
                  icon={<HiOutlineClock size={13} color={T.metaColor} />}
                  text={formatEventTime(event.event_date)}
                />
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
                style={{
                  background:  'none',
                  border:      'none',
                  padding:     0,
                  fontFamily:  "'Montserrat', Arial, sans-serif",
                  fontSize:    '12px',
                  fontWeight:  700,
                  color:       '#2B72FB',
                  cursor:      'pointer',
                  display:     'inline-flex',
                  alignItems:  'center',
                  gap:         '4px',
                  marginTop:   '4px',
                  alignSelf:   'flex-start',
                }}
              >
                See less <FaChevronUp size={9} />
              </button>
            </div>
          )}

        </div>  
      </div>    
    </div>      
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────
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

  return (
    <div style={{
      display:    'flex',
      minHeight:  '100vh',
      background: T.pageBg,
    }}>
      {/* Font import */}

      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex:       1,
        padding:    isMobile ? '24px 16px 90px' : isTablet ? '37px 28px 48px' : '37px 51px 60px',
        boxSizing:  'border-box',
        overflowX:  'hidden',
        position:   'relative',
      }}>

        {/* ── Notification Bell ── */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top:      isMobile ? '24px' : '37px',
          right:    isMobile ? '16px' : isTablet ? '28px' : '51px',
          zIndex:   200,
        }}>
          <button onClick={() => setShowDropdown(v => !v)} style={{
            width:          isMobile ? '44px' : '52px',
            height:         isMobile ? '44px' : '52px',
            background:     showDropdown ? 'rgba(43,114,251,0.25)' : '#003EA6',
            border:         showDropdown
              ? '1px solid rgba(43,114,251,0.5)'
              : '1px solid rgba(255,255,255,0.15)',
            boxShadow:      '0px 4px 12px rgba(0,0,0,0.35)',
            borderRadius:   '14px',
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            position:       'relative',
            transition:     'all 0.15s',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                stroke="#FFFFFF"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unreadCount > 0 && (
              <div style={{
                position:       'absolute',
                top:            '-7px',
                right:          '-7px',
                minWidth:       '20px',
                height:         '20px',
                background:     '#E53935',
                borderRadius:   '10px',
                border:         '2px solid #DAE5F1',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '0 4px',
                boxSizing:      'border-box',
              }}>
                <span style={{
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize:   '10px',
                  fontWeight: 700,
                  color:      '#FFFFFF',
                  lineHeight: 1,
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            )}
          </button>

          {/* Notification dropdown */}
          {showDropdown && (
            <div style={{
              position:      'absolute',
              top:           `calc(${isMobile ? '44px' : '52px'} + 10px)`,
              right:         0,
              width:         isMobile ? '92vw' : '380px',
              maxHeight:     '520px',
              background:    '#FFFFFF',
              border:        '1px solid #E5E7EB',
              borderRadius:  '16px',
              boxShadow:     '0 20px 60px rgba(0,0,0,0.15)',
              display:       'flex',
              flexDirection: 'column',
              overflow:      'hidden',
              zIndex:        300,
            }}>
              {/* Header */}
              <div style={{
                padding:        '16px 18px 12px',
                borderBottom:   '1px solid #F0F2F5',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                flexShrink:     0,
              }}>
                <span style={{
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontWeight: 700,
                  fontSize:   '16px',
                  color:      '#003EA6',
                }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{
                    background:  'none',
                    border:      'none',
                    fontFamily:  'Montserrat, Arial, sans-serif',
                    fontSize:    '12px',
                    fontWeight:  600,
                    color:       '#2B72FB',
                    cursor:      'pointer',
                    padding:     0,
                  }}>
                    Mark all read
                  </button>
                )}
              </div>

    {/* Tabs */}
    <div style={{ display: 'flex', padding: '10px 18px 0', gap: '6px', flexShrink: 0 }}>
      {['all', 'unread'].map(t => (
        <button key={t} onClick={() => setNotifTab(t)} style={{
          height:       '30px',
          padding:      '0 14px',
          background:   notifTab === t ? '#003EA6' : 'transparent',
          border:       notifTab === t ? 'none' : '1px solid #D1D5DC',
          borderRadius: '20px',
          cursor:       'pointer',
          fontFamily:   'Montserrat, Arial, sans-serif',
          fontSize:     '12px',
          fontWeight:   notifTab === t ? 700 : 400,
          color:        notifTab === t ? '#FFFFFF' : '#4A5565',
          transition:   'all 0.15s',
        }}>
          {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
        </button>
      ))}
    </div>

    {/* Body */}
    <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
      {(() => {
        const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
        if (!list.length) return (
          <div style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '40px 20px',
            gap:            '10px',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontSize:   '13px',
              color:      'rgba(0,0,0,0.3)',
              margin:     0,
            }}>
              {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        );
        return Object.entries(groupByDate(list)).map(([label, items]) => {
          if (!items.length) return null;
          return (
            <div key={label}>
              <p style={{
                fontFamily:    'Montserrat, Arial, sans-serif',
                fontWeight:    700,
                fontSize:      '10px',
                color:         'rgba(0,0,0,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                margin:        '10px 18px 4px',
              }}>
                {label}
              </p>
              {items.map(n => (
                <div
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  style={{
                    display:    'flex',
                    alignItems: 'flex-start',
                    gap:        '12px',
                    padding:    '10px 18px',
                    background: n.read ? 'transparent' : 'rgba(0,62,166,0.05)',
                    cursor:     'pointer',
                    transition: 'background 0.12s',
                    borderLeft: n.read ? '3px solid transparent' : '3px solid #003EA6',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(0,62,166,0.05)'}
                >
                  <div style={{
                    width:          '36px',
                    height:         '36px',
                    borderRadius:   '50%',
                    background:     'rgba(0,62,166,0.08)',
                    border:         '1px solid rgba(0,62,166,0.15)',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    flexShrink:     0,
                    marginTop:      '2px',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                        stroke="#003EA6"
                        strokeWidth="1.67"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'Montserrat, Arial, sans-serif',
                      fontWeight: n.read ? 400 : 700,
                      fontSize:   '13px',
                      color:      '#0A0A0A',
                      margin:     '0 0 2px 0',
                      lineHeight: '1.4',
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      fontFamily:      'Montserrat, Arial, sans-serif',
                      fontSize:        '12px',
                      color:           '#4A5565',
                      margin:          '0 0 4px 0',
                      lineHeight:      '1.4',
                      display:         '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow:        'hidden',
                    }}>
                      {n.body}
                    </p>
                    <span style={{
                      fontFamily: 'Montserrat, Arial, sans-serif',
                      fontSize:   '11px',
                      color:      'rgba(0,0,0,0.35)',
                    }}>
                      {formatTime(n.time)}
                    </span>
                  </div>
                  {!n.read && (
                    <div style={{
                      width:        '8px',
                      height:       '8px',
                      borderRadius: '50%',
                      background:   '#003EA6',
                      flexShrink:   0,
                      marginTop:    '6px',
                    }} />
                  )}
                </div>
              ))}
            </div>
          );
        });
      })()}
    </div>

    {/* Footer */}
    <div style={{ padding: '10px 18px', borderTop: '1px solid #F0F2F5', flexShrink: 0 }}>
      <button
        onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
        style={{
          width:        '100%',
          height:       '36px',
          background:   '#F9FAFB',
          border:       '1px solid #D1D5DC',
          borderRadius: '10px',
          fontFamily:   'Montserrat, Arial, sans-serif',
          fontSize:     '13px',
          color:        '#4A5565',
          cursor:       'pointer',
          transition:   'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F0F4FB'}
        onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
      >
        See all notifications
      </button>
    </div>
  </div>
)}
      </div>

        {/* ── Back Button ── */}
        <button onClick={() => navigate('/dashboard')} style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '6px',
          background:   'none',
          border:       'none',
          cursor:       'pointer',
          padding:      0,
          marginBottom: isMobile ? '16px' : '24px',
        }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path
              d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
              stroke={T.backColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{
            fontFamily: "'Montserrat', Arial, sans-serif",
            fontWeight: 400,
            fontSize:   '15px',
            color:      T.backColor,
          }}>
            Back
          </span>
        </button>

        {/* ── Header ── */}
        <div style={{ marginBottom: isMobile ? '20px' : '28px', paddingRight: isMobile ? '58px' : '90px' }}>
          <h1 style={{
            fontFamily:    "'Montserrat', Arial, sans-serif",
            fontWeight:    700,
            fontSize:      isMobile ? '28px' : isTablet ? '32px' : '40px',
            lineHeight:    '1.2',
            letterSpacing: '-1px',
            color:         T.pageTitle,
            margin:        '0 0 8px 0',
          }}>
            Events
          </h1>
          <p style={{
            fontFamily: "'Montserrat', Arial, sans-serif",
            fontWeight: 400,
            fontSize:   isMobile ? '13px' : '16px',
            lineHeight: '22.5px',
            color:      T.pageSubtitle,
            margin:     0,
          }}>
            Stay updated with upcoming activities and gatherings designed to keep you engaged with the alumni community
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: isMobile ? '16px' : '28px', gap: '12px' }}>
          <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <div style={{
              height:       '37px',
              display:      'flex',
              alignItems:   'center',
              padding:      '0 12px',
              gap:          '8px',
              background:   T.filterBg,
              border:       `1px solid ${T.filterBorder}`,
              borderRadius: '10px',
              boxShadow:    T.cardShadow,
              minWidth:     isMobile ? 0 : '211px',
              flex:         isMobile ? 1 : 'none',
            }}>
              <span style={{
                fontFamily:   "'Montserrat', Arial",
                fontSize:     '14px',
                fontWeight:   400,
                color:        T.filterText,
                flex:         1,
                whiteSpace:   'nowrap',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
              }}>
                {activeCategory}
              </span>
              <div style={{ background: T.badgeBg, borderRadius: '8px', minWidth: '22.63px', height: '19.98px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{filtered.length}</span>
              </div>
            </div>
            <button
              onClick={() => setShowFilter(f => !f)}
              style={{
                height:       '37px',
                padding:      '0 18px',
                display:      'flex',
                alignItems:   'center',
                gap:          '8px',
                background:   T.titleColor,
                border:       'none',
                borderRadius: '8px',
                cursor:       'pointer',
                boxShadow:    T.cardShadow,
                transition:   'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <FaFilter size={12} color="#FFFFFF" />
              <span style={{ fontFamily: "'Montserrat', Arial", fontWeight: 700, fontSize: '12px', color: '#FFFFFF', letterSpacing: '0.5px' }}>FILTER</span>
            </button>

            {showFilter && (
              <div style={{
                position:     'absolute',
                top:          'calc(100% + 8px)',
                left:         0,
                background:   T.cardBg,
                border:       `1px solid ${T.cardBorder}`,
                borderRadius: '12px',
                overflow:     'hidden',
                zIndex:       300,
                minWidth:     '220px',
                boxShadow:    '0px 10px 30px rgba(0,0,0,0.12)',
              }}>
                {categories.map((cat, i) => (
                  <button key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    style={{
                      width:          '100%',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'space-between',
                      padding:        '12px 16px',
                      background:     activeCategory === cat ? 'rgba(43,114,251,0.08)' : 'transparent',
                      border:         'none',
                      borderTop:      i > 0 ? `1px solid ${T.footerBorder}` : 'none',
                      cursor:         'pointer',
                      transition:     'background 0.15s',
                    }}
                    onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                    onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontFamily: "'Montserrat', Arial",
                      fontSize:   '13px',
                      color:      activeCategory === cat ? T.titleColor : T.bodyColor,
                      fontWeight: activeCategory === cat ? 700 : 400,
                    }}>
                      {cat}
                    </span>
                    <div style={{ background: activeCategory === cat ? T.accent : 'rgba(43,114,251,0.12)', borderRadius: '6px', padding: '1px 7px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: activeCategory === cat ? '#FFFFFF' : T.accent }}>{categoryCounts[cat]}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Events List (stacked, full-width cards) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(event => (
            <EventCard key={event.id} event={event} isMobile={isMobile} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{
            textAlign:  'center',
            padding:    '80px 0',
            color:      T.metaColor,
            fontSize:   '15px',
            fontFamily: "'Montserrat', Arial, sans-serif",
          }}>
            No events found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsView;