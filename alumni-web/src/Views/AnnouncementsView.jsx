//friends
import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import megaphoneIcon from '../assets/announcement_icn.svg';
import calenderIcon from '../assets/calendar_ic.svg';
import documentIcon from '../assets/document_ic.svg';
import clockIcon from '../assets/clock_icn.svg';
import { getResumeRoute, getSurveySections, isSurveyComplete } from '../lib/surveyProgress';
import { truncateHtml, createMarkup } from '../utils/textHelpers';
import '../styles/Announcements.css';
import '../styles/About.css';

const CATEGORY_ICONS = {
  'News':       megaphoneIcon,
  'Activities': calenderIcon,
};
const getIcon = (category) => CATEGORY_ICONS[category] || documentIcon;

// ── Icons ──────────────────────────────────────────────────────────────────────
const ClockIcon = () => (
   <img src={clockIcon} alt="" aria-hidden="true" width="12" height="12" style={{ display: 'block', flexShrink: 0 }} />
);

// ── Announcement Card ─────────────────────────────────────────────────────────
const AnnouncementCard = ({ announcement, isMobile, isTablet }) => {
  const [expanded, setExpanded] = useState(false);
  const [read, setRead] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const images = announcement.images?.length ? announcement.images : announcement.image ? [announcement.image] : [];
  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length); };
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length); };

  const [hovered, setHovered] = useState(false);
  const hasDetails = Boolean(announcement.time);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   '#ffffff',
        border:       `1px solid ${hovered || expanded ? 'rgba(0,62,166,0.25)' : 'rgba(0,0,0,0.07)'}`,
        boxShadow:    hovered || expanded
                        ? '0px 12px 32px rgba(0,62,166,0.15), 0px 4px 16px rgba(0,0,0,0.08)'
                        : '0px 4px 16px rgba(0,0,0,0.07)',
        borderRadius: '16px',
        overflow:     'hidden',
        cursor:       'pointer',
        maxWidth:     '96%',
        transform:    hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition:   'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* ── Photo with arrows + category pill ── */}
      {images.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: '330px', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={images[imgIndex]}
            alt={announcement.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.35s ease' }}
            onError={e => { e.target.style.display = 'none'; }}
          />

          {/* Left / Right arrows */}
          <>
            <button onClick={prevImg} style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10, transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
            >
              <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
                <path d="M7 1L3 5L7 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={nextImg} style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10, transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
            >
              <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
                <path d="M3 1L7 5L3 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dot indicators */}
            <div style={{
              position: 'absolute', bottom: '7.5px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '5px', zIndex: 10,
            }}>
              {images.map((_, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); setImgIndex(i); }} style={{
                  width: i === imgIndex ? '18px' : '6px', height: '6px',
                  borderRadius: '3px', background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }} />
              ))}
            </div>
          </>

          {/* Category tag — bottom-left, white pill (matches discount card) */}
          {announcement.category && (
            <div style={{
              position: 'absolute', bottom: '14px', left: '12px',
              background: 'rgba(255,255,255,0.92)', borderRadius: '999px',
              padding: '4px 10px',
            }}>
              <span style={{
                fontFamily: "'Montserrat', Arial, sans-serif",
                fontWeight: 600, fontSize: '11px', color: '#1e3a5f', lineHeight: 1,
              }}>
                {announcement.category}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <p style={{
            fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700,
            fontSize: '15px', lineHeight: 1.45, color: '#1e3a5f', margin: 0, wordBreak: 'break-word', flex: 1,
          }}>
            {announcement.title}
          </p>
        </div>

        {/* Description — truncated or full depending on expanded state */}
        {!expanded ? (
          <p style={{
            fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 400, fontSize: '13px',
            lineHeight: 1.65, color: '#4a5565', margin: '0 0 16px 0', wordBreak: 'break-word', overflowWrap: 'break-word',
          }}>
            {truncateHtml(announcement.description, 80)}
          </p>
        ) : (
          <div
            style={{
              fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 400, fontSize: '13px',
              lineHeight: 1.65, color: '#4a5565', margin: '0 0 16px 0', wordBreak: 'break-word', overflowWrap: 'break-word',
            }}
            dangerouslySetInnerHTML={createMarkup(announcement.description)}
          />
        )}

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.08)' }} />

        {/* ── Expandable details (timestamp) ── */}
        <div style={{
          overflow: 'hidden',
          maxHeight: expanded ? '200px' : '0px',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), padding 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {hasDetails && (
            <div style={{ padding: '14px 0 4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ marginTop: '2px', flexShrink: 0 }}><ClockIcon /></div>
                <p style={{
                  fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 400, fontSize: '12px',
                  lineHeight: 1.6, color: '#4a5565', margin: 0,
                }}>
                  {announcement.time}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Toggle button ── */}
      <div style={{ padding: '14px 20px 20px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); if (!expanded) setRead(true); }}
          style={{
            width: '100%', height: '37px',
            background: expanded ? 'transparent' : '#003ea6',
            border: expanded ? '1.5px solid #003ea6' : 'none',
            borderRadius: '10px',
            fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 700, fontSize: '13px',
            color: expanded ? '#003ea6' : '#ffffff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          {expanded ? (
            <>See Less <FaChevronUp size={10} /></>
          ) : (
            <>See More <FaChevronDown size={10} /></>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Notification Item (CSS-based, matches About) ───────────────────────────
const NItem = ({ n, markOneRead, formatTime }) => (
  <div
    onClick={() => markOneRead(n.id)}
    className={`ab-notif-item ${!n.read ? 'unread' : ''}`}
  >
    <div className="ab-notif-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
          stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="ab-notif-content">
      <p className="ab-notif-title">{n.title}</p>
      <p className="ab-notif-body">{n.body}</p>
      <span className="ab-notif-time">{formatTime(n.time)}</span>
    </div>
    {!n.read && <div className="ab-notif-dot" />}
  </div>
);

// ── Notification Bell (shared white-theme dropdown) ───────────────────────────
const NotificationBell = ({
  bellRef, isMobile, isTablet,
  notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime, navigate,
}) => {
  const bellSize = isMobile ? '44px' : '52px';

  return (
    <div
      ref={bellRef}
      style={{
        position: 'absolute',
        top:   isMobile ? '24px' : '37px',
        right: isMobile ? '16px' : isTablet ? '32px' : '51px',
        zIndex: 200,
      }}
    >
      <button
        onClick={() => setShowDropdown(v => !v)}
        style={{
          width:        bellSize,
          height:       bellSize,
          background:   showDropdown ? 'rgba(43,114,251,0.25)' : '#003EA6',
          border:       showDropdown
            ? '1px solid rgba(43,114,251,0.5)'
            : '1px solid rgba(255,255,255,0.15)',
          boxShadow:    '0px 4px 12px rgba(0,0,0,0.35)',
          borderRadius: '14px',
          cursor:       'pointer',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          position:     'relative',
          transition:   'all 0.15s',
          flexShrink:   0,
        }}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
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
            position:    'absolute',
            top:         '-7px',
            right:       '-7px',
            minWidth:    '20px',
            height:      '20px',
            background:  '#E53935',
            borderRadius:'10px',
            border:      '2px solid #DAE5F1',
            display:     'flex',
            alignItems:  'center',
            justifyContent: 'center',
            padding:     '0 4px',
            boxSizing:   'border-box',
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

      {showDropdown && (
        <div style={{
          position:       'absolute',
          top:            `calc(${bellSize} + 10px)`,
          right:          0,
          width:          isMobile ? '92vw' : '380px',
          maxHeight:      '520px',
          background:     '#FFFFFF',
          backdropFilter: 'blur(16px)',
          border:         '1px solid #E5E7EB',
          borderRadius:   '16px',
          boxShadow:      '0 20px 60px rgba(0,0,0,0.15)',
          display:        'flex',
          flexDirection:  'column',
          overflow:       'hidden',
          zIndex:         300,
        }}>
          <div style={{
            padding:      '16px 18px 12px',
            borderBottom: '1px solid #F0F2F5',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            flexShrink:   0,
          }}>
            <span style={{
              fontFamily: 'Montserrat, Montserrat, Arial, sans-serif',
              fontWeight: 700,
              fontSize:   '16px',
              color:      '#003EA6',
            }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background:  'none',
                  border:      'none',
                  fontFamily:  'Montserrat, Arial, sans-serif',
                  fontSize:    '12px',
                  color:       '#2B72FB',
                  cursor:      'pointer',
                  padding:     0,
                  fontWeight:  600,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{
            display:    'flex',
            padding:    '10px 18px 0',
            gap:        '6px',
            flexShrink: 0,
          }}>
            {['all', 'unread'].map(t => (
              <button
                key={t}
                onClick={() => setNotifTab(t)}
                style={{
                  height:      '30px',
                  padding:     '0 14px',
                  background:  notifTab === t ? '#003EA6' : 'transparent',
                  border:      notifTab === t ? 'none' : '1px solid #D1D5DC',
                  borderRadius:'20px',
                  cursor:      'pointer',
                  fontFamily:  'Montserrat, Arial, sans-serif',
                  fontSize:    '12px',
                  fontWeight:  notifTab === t ? 700 : 400,
                  color:       notifTab === t ? '#FFFFFF' : '#4A5565',
                  transition:  'all 0.15s',
                }}
              >
                {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              </button>
            ))}
          </div>

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
                          display:     'flex',
                          alignItems:  'flex-start',
                          gap:         '12px',
                          padding:     '10px 18px',
                          background:  n.read ? 'transparent' : 'rgba(0,62,166,0.05)',
                          cursor:      'pointer',
                          transition:  'background 0.12s',
                          borderLeft:  n.read ? '3px solid transparent' : '3px solid #003EA6',
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
                            fontFamily:          'Montserrat, Arial, sans-serif',
                            fontSize:            '12px',
                            color:               '#4A5565',
                            margin:              '0 0 4px 0',
                            lineHeight:          '1.4',
                            display:             '-webkit-box',
                            WebkitLineClamp:     2,
                            WebkitBoxOrient:     'vertical',
                            overflow:            'hidden',
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

          <div style={{
            padding:    '10px 18px',
            borderTop:  '1px solid #F0F2F5',
            flexShrink: 0,
          }}>
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
  const [surveyRoute, setSurveyRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const resolveSurveyRoute = async () => {
      try {
        await getSurveySections();
        const complete = await isSurveyComplete();
        if (cancelled) return;
        if (complete) {
          setSurveyRoute('/update-tracer');
        } else {
          const route = await getResumeRoute();
          if (!cancelled) setSurveyRoute(route);
        }
      } catch (err) {
        console.error('AnnouncementsView: error resolving survey route:', err);
        if (!cancelled) setSurveyRoute('/survey/personal-background');
      }
    };
    resolveSurveyRoute();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="ann-page" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex:       1,
        padding:    isMobile ? '24px 16px 90px' : isTablet ? '37px 32px 48px' : '37px 51px 60px',
        boxSizing:  'border-box',
        maxWidth:   '100%',
        overflowX:  'hidden',
        position:   'relative',
      }}>

        <div ref={bellRef} className="ab-bell" style={!isMobile ? { transform: 'translateX(16px)' } : undefined}>
          <button className="ab-bell-btn" onClick={() => setShowDropdown(v => !v)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                stroke="#fff" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <div className="ab-badge">
                <span>{unreadCount > 99 ? '99+' : unreadCount}</span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="ab-ndrop">
              <div className="ab-ndrop-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="ab-mark-all">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="ab-ndrop-tabs">
                {['all', 'unread'].map(t => (
                  <button
                    key={t}
                    onClick={() => setNotifTab(t)}
                    className={`ab-tab-btn ${notifTab === t ? 'active' : ''}`}
                  >
                    {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>
              <div className="ab-ndrop-list">
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (!list.length) return (
                    <div className="ab-notif-empty">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <p>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
                    </div>
                  );
                  return Object.entries(groupByDate(list)).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p className="ab-notif-group-label">{label}</p>
                        {items.map(n => <NItem key={n.id} n={n} markOneRead={markOneRead} formatTime={formatTime}/>)}
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="ab-ndrop-footer">
                <button
                  onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                  className="ab-see-all"
                >
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <button
            className="ann-back"
            onClick={() => navigate(-1)}
            style={{ marginLeft: isMobile ? 0 : undefined }}
          >
          <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
            <path d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
              stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        <div className="ann-hdr" style={{ paddingRight: isMobile ? '60px' : '90px', marginBottom: isMobile ? '20px' : '28px', marginLeft: isMobile ? '4px' : '40px', marginTop: '10px' }}>
          <h1 className="ann-heading">
            Announcements
          </h1>

          <p
            className="ann-subheading"
            style={{
              fontFamily: 'Montserrat, Arial',
              fontWeight: 400,
              fontSize:   isMobile ? '12px' : '13.5px',
              lineHeight: isMobile ? '1.5' : '0.3',
              margin:     0,
              marginLeft: isMobile ? 0 : '-4px',
              marginTop:  '12px',
            }}
          >
            Stay connected with the latest news, events, and opportunities from your alumni network.
          </p>
        </div>

        {!isMobile && (
          <div
            className="ann-banner"
            style={{
              position:     'relative',
              padding:      isTablet ? '24px 28px' : '24px 32px',
              border:       '1px solid #E5E7EB',
              boxShadow:    '0px 2px 8px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.06)',
              borderRadius: '24px',
              marginBottom: isTablet ? '28px' : '32px',
              marginLeft:   '20px',
              marginRight:  '-24px',
              transform:    'translateX(6px)',
              marginTop:    '40px',
              width:        'calc(100% - 42px)',
              overflow:     'hidden',
              display:      'flex',
              gap:          '24px',
              alignItems:   'center',
            }}
          >
            <div style={{
              position:     'absolute',
              width:        '256px',
              height:       '256px',
              right:        '-30px',
              top:          '-127px',
              background:   '#2B72FB',
              opacity:      0.05,
              filter:       'blur(64px)',
              borderRadius: '50%',
              pointerEvents:'none',
            }} />

            <div style={{
              width:          isTablet ? '80px' : '120px',
              height:         isTablet ? '80px' : '120px',
              flexShrink:     0,
              background:     'linear-gradient(180deg, #fcc7cb 0%, #ffb7ba 80%)',
              boxShadow:      '0px 4px 10px rgba(43, 114, 251, 0.15)',
              borderRadius:   '14px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}>
              <img
                src={megaphoneIcon}
                alt="Megaphone"
                style={{ width: '110%', height: '110%', objectFit: 'contain', filter: 'drop-shadow(0px 3px 4px #000000)' }}
              />
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
              <h2 style={{
                fontFamily:    'Montserrat, Montserrat, Arial',
                fontWeight:    700,
                fontSize:      isTablet ? '20px' : '25px',
                lineHeight:    '1.3',
                letterSpacing: '-0.35px',
                color:         '#324D87',
                margin:        '0 0 8px 0',
              }}>
                Alumni Tracer Survey
              </h2>
              <p style={{
                fontFamily: 'Montserrat, Arial',
                fontWeight: 400,
                fontSize:   '13px',
                lineHeight: '22px',
                color:      '#545454',
                margin:     '0 0 16px 0',
              }}>
                Your feedback matters! Complete our annual survey to help us improve the alumni experience and community engagement.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <img src={clockIcon} alt="" aria-hidden="true" width="14" height="14" style={{ display: 'block', flexShrink: 0, filter: 'brightness(0.4)', opacity: 1 }} />
                  <span style={{ fontFamily: 'Montserrat, Arial', fontSize: '12px', color: '#8A94A6', whiteSpace: 'nowrap' }}>
                    2 hours ago
                  </span>
                </div>
                <button
                  onClick={() => surveyRoute && navigate(surveyRoute)}
                  disabled={!surveyRoute}
                  style={{
                    height:       '39px',
                    padding:      '0 20px',
                    borderRadius: '14px',
                    border:       'none',
                    background:   '#003EA6',
                    boxShadow:    '0px 4px 12px rgba(0, 62, 166, 0.2)',
                    fontFamily:   'Montserrat, Arial',
                    fontWeight:   700,
                    fontSize:     '13px',
                    color:        '#FFFFFF',
                    cursor:       surveyRoute ? 'pointer' : 'not-allowed',
                    opacity:      surveyRoute ? 1 : 0.5,
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '8px',
                    transition:   'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (surveyRoute) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { if (surveyRoute) e.currentTarget.style.opacity = '1'; }}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{
            display:       'flex',
            justifyContent:'flex-end',
            alignItems:    'center',
            marginBottom:  isMobile ? '16px' : '24px',
            marginLeft:    isMobile ? '8px' : '28px',
            marginRight:   isMobile ? '8px' : '15px',
            paddingRight:  isMobile ? 0 : '15px',
            gap:           '2px',
          }}>
          <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>

            <div
              className="ann-filter-display"
              style={{
                height:      '40px',
                display:     'flex',
                alignItems:  'center',
                padding:     '0 14px',
                gap:         '10px',
                borderRadius:'10px',
                background:  '#FFFFFF',
                border:      '1px solid var(--ann-card-border)',
                boxShadow:   '0px 2px 8px rgba(0,0,0,0.06)',
                minWidth:    isMobile ? 0 : '236px',
                flex:        isMobile ? 1 : 'none',
              }}
            >
              <span style={{
                fontFamily:    'Montserrat, Arial, sans-serif',
                fontWeight:    700,
                fontSize:      '13.5px',
                lineHeight:    '1.4',
                color:         '#1e3a5f',
                whiteSpace:    'nowrap',
                overflow:      'hidden',
                textOverflow:  'ellipsis',
                marginLeft:    '2px',
                flex:          1,
              }}>
                {activeCategory}
              </span>
              <div style={{
                background:     '#003ea6',
                borderRadius:   '6px',
                display:        'inline-flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '1px 7px',
                marginLeft:     '-5px',
                flexShrink:     0,
                verticalAlign:  'middle',
              }}>
                <span style={{ fontFamily: 'Montserrat, Arial', fontWeight: 700, fontSize: '11px', color: '#FFFFFF' }}>
                  {filtered.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowFilter(f => !f)}
              style={{
                height:         '37px',
                padding:        '0 18px',
                transform:      isMobile ? 'none' : 'translateX(12px)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '8px',
                background:     'var(--ann-accent-btn)',
                border:         '1px solid rgba(255,255,255,0.1)',
                borderRadius:   '8px',
                cursor:         'pointer',
                flexShrink:     0,
                filter:         'drop-shadow(0px 2px 2px rgba(0,0,0,0.15))',
                transition:     'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Montserrat, Arial', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                FILTER
              </span>
            </button>

            {showFilter && (
              <div style={{
                position:  'absolute',
                top:       'calc(100% + 8px)',
                left:      0,
                background:'#FFFFFF',
                border:    '1px solid var(--ann-card-border)',
                borderRadius:'12px',
                overflow:  'hidden',
                zIndex:    300,
                minWidth:  isMobile ? '160px' : '236px',
                width:     isMobile ? 'clamp(160px, 32vw, 200px)' : undefined,
                boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
              }}>
                {categories.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    style={{
                      width:          '100%',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'space-between',
                      padding:        '12px 16px',
                      background:     activeCategory === cat ? 'rgba(43,114,251,0.08)' : 'transparent',
                      border:         'none',
                      borderTop:      i > 0 ? '1px solid var(--ann-card-border)' : 'none',
                      cursor:         'pointer',
                      transition:     'background 0.15s',
                    }}
                    onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'rgba(0,62,166,0.05)'; }}
                    onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontFamily: 'Montserrat, Arial, sans-serif',
                      fontSize:   '13.5px',
                      color:      '#1e3a5f',
                      fontWeight: activeCategory === cat ? 700 : 400,
                      whiteSpace: 'nowrap',
                    }}>
                      {cat}
                    </span>
                    <div style={{
                      background:   activeCategory === cat ? '#003ea6' : '#dbeafe',
                      borderRadius: '6px',
                      padding:      '1px 7px',
                    }}>
                      <span style={{
                        fontFamily: 'Montserrat, Arial',
                        fontWeight: 700,
                        fontSize:   '11px',
                        color:      activeCategory === cat ? '#FFFFFF' : '#003ea6',
                      }}>
                        {categoryCounts[cat]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', marginLeft: '28px', marginRight: '-30px' }}>
            <span style={{ fontFamily: 'Montserrat, Arial', fontSize: '14px', color: 'var(--ann-body-color)' }}>
              Loading announcements…
            </span>
          </div>
        ) : (
          <div
              className="ann-cards-list"
              style={{
                display:             'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap:                 isMobile ? '16px' : '14px',
                alignItems:          'start',
                marginLeft:          isMobile ? '8px' : '24px',
                marginRight:         isMobile ? '8px' : '-10px',
                paddingRight:        isMobile ? 0 : '10px',
              }}
            >
            {filtered.map(a => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsView;