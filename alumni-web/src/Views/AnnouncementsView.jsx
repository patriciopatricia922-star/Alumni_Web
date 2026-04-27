import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import megaphoneIcon from '../assets/megaphone_ic.svg';
import calenderIcon from '../assets/calendar_ic.svg';
import documentIcon from '../assets/document_ic.svg';
import { getResumeRoute, getSurveySections, isSurveyComplete } from '../lib/surveyProgress';
import { truncateHtml, createMarkup } from '../utils/textHelpers';
import '../styles/Announcements.css';

const CATEGORY_ICONS = {
  'News':       megaphoneIcon,
  'Activities': calenderIcon,
};
const getIcon = (category) => CATEGORY_ICONS[category] || documentIcon;

// ── Icons ──────────────────────────────────────────────────────────────────────
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" className="ann-clock-circle" strokeWidth="1.17"/>
    <path d="M7 4V7.5L9.5 9" className="ann-clock-hand" strokeWidth="1.17" strokeLinecap="round"/>
  </svg>
);

// ── Announcement Card ─────────────────────────────────────────────────────────
// Redesigned to match reference: icon-left, content-center, timestamp top-right,
// "See more" as inline text link at end of description. No separate footer.
const AnnouncementCard = ({ announcement, isMobile, isTablet }) => {
  const [expanded, setExpanded] = useState(false);
  const iconSize = isMobile ? '48px' : isTablet ? '52px' : '56px';

  return (
    <div className={`ann-card ${expanded ? 'ann-card--expanded' : ''}`}>
      <div className="ann-card__body">

        <div
          className="ann-card__icon-box"
          style={{ width: iconSize, height: iconSize, minWidth: iconSize }}
        >
          <img
            src={getIcon(announcement.category)}
            alt={announcement.category}
            style={{
              width: '60%', height: '60%', objectFit: 'contain',
              filter: 'drop-shadow(0px 2px 4px rgba(43,114,251,0.45))',
            }}
          />
          <div className="ann-card__notif-ring">
            <div className="ann-card__notif-dot" />
          </div>
        </div>

        <div className="ann-card__content">
          <div className="ann-card__top-row">
            <h3 className="ann-card__title">{announcement.title}</h3>
            <div className="ann-card__timestamp">
              <ClockIcon />
              <span>{announcement.time}</span>
            </div>
          </div>

          {!expanded && (
            <p className="ann-card__preview">
              {truncateHtml(announcement.description, 120)}
              {' '}
              <button
                className="ann-card__see-more-inline"
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
              >
                See more
              </button>
            </p>
          )}

          {expanded && (
            <div className="ann-card__full-content">
              <div
                className="announcement-full-content"
                dangerouslySetInnerHTML={createMarkup(announcement.description)}
              />
              <button
                className="ann-card__see-more-inline ann-card__see-less"
                onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              >
                See less
              </button>
            </div>
          )}
        </div>
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
  // const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
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

  const handleCardClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  return (
    <div className="ann-page" style={{ display: 'flex', minHeight: '100vh' }}>
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
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              width: isMobile ? '44px' : '52px',
              height: isMobile ? '44px' : '52px',
              background: '#003EA6',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.35)',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.15s',
            }}
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
                position: 'absolute',
                top: '-7px',
                right: '-7px',
                minWidth: '20px',
                height: '20px',
                background: '#E53935',
                borderRadius: '10px',
                border: '2px solid #DAE5F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                boxSizing: 'border-box',
              }}>
                <span style={{
                  fontFamily: 'Montserrat',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: isMobile ? '52px' : '70px',
              right: 0,
              width: isMobile ? '90vw' : '380px',
              maxHeight: '520px',
              background: 'rgba(13,19,56,0.97)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 300,
            }}>
              <div style={{
                padding: '16px 18px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                {['all', 'unread'].map(t => (
                  <button
                    key={t}
                    onClick={() => setNotifTab(t)}
                    style={{
                      height: '32px', padding: '0 16px',
                      background: notifTab === t ? '#2B72FB' : 'transparent',
                      border: notifTab === t ? 'none' : '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontFamily: 'Arimo',
                      fontSize: '13px',
                      fontWeight: notifTab === t ? 700 : 400,
                      color: '#FFFFFF',
                      transition: 'all 0.15s',
                      textTransform: 'capitalize',
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
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', padding: '40px 20px', gap: '10px',
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
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
                        }}>
                          {label}
                        </p>
                        {items.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markOneRead(n.id)}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: '12px',
                              padding: '10px 18px',
                              background: n.read ? 'transparent' : 'rgba(43,114,251,0.07)',
                              cursor: 'pointer',
                              transition: 'background 0.12s',
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
                                  stroke="#2B72FB"
                                  strokeWidth="1.67"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontFamily: 'Arimo',
                                fontWeight: n.read ? 400 : 700,
                                fontSize: '13px',
                                color: '#FFFFFF',
                                margin: '0 0 2px 0',
                                lineHeight: '1.4',
                              }}>
                                {n.title}
                              </p>
                              <p style={{
                                fontFamily: 'Arimo', fontSize: '12px',
                                color: 'rgba(255,255,255,0.45)',
                                margin: '0 0 4px 0', lineHeight: '1.4',
                                display: '-webkit-box', WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              }}>
                                {n.body}
                              </p>
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
                    fontFamily: 'Arimo', fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
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

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{ paddingRight: isMobile ? '60px' : '90px', marginBottom: isMobile ? '20px' : '28px' }}>
          <button
            className="ann-back-btn"
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, marginBottom: isMobile ? '12px' : '16px',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path
                d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67"
                stroke="var(--ann-back-color)"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '15px', color: 'var(--ann-back-color)' }}>
              Back
            </span>
          </button>

          <h1
            className="ann-heading"
            style={{ fontSize: isMobile ? '27px' : isTablet ? '31px' : '39px', margin: '0 0 8px 0' }}
          >
            Announcements
          </h1>

          <p
            className="ann-subheading"
            style={{
              fontFamily: 'Arimo, Arial', fontWeight: 400,
              fontSize: isMobile ? '13px' : '16px',
              lineHeight: '22px', margin: 0,
            }}
          >
            Stay connected with the latest news, events, and opportunities from your alumni network.
          </p>
        </div>

        {/* ── Featured Banner ─────────────────────────────────────────────────── */}
        {!isMobile && (
          <div
            className="ann-banner"
            style={{
              position: 'relative',
              padding: isTablet ? '24px 28px' : '24px 32px',
              border: '0.889px solid rgba(43,114,251,0.3)',
              boxShadow: '0px 4px 4px rgba(0,0,0,0.5)',
              borderRadius: '24px',
              marginBottom: isTablet ? '28px' : '32px',
              overflow: 'hidden',
              display: 'flex', gap: '24px', alignItems: 'center',
            }}
          >
            <div style={{
              position: 'absolute', width: '256px', height: '256px',
              right: '-30px', top: '-127px',
              background: '#2B72FB', opacity: 0.1,
              filter: 'blur(64px)', borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            <div style={{
              width: isTablet ? '80px' : '120px',
              height: isTablet ? '80px' : '120px',
              flexShrink: 0,
              background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
              boxShadow: '0px 10px 15px rgba(97,95,255,0.5), 0px 4px 6px rgba(43,114,251,0.15)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={megaphoneIcon}
                alt="Megaphone"
                style={{ width: '82%', height: '82%', objectFit: 'contain', filter: 'drop-shadow(0px 4px 4px #2B72FB)' }}
              />
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
              <h2 style={{
                fontFamily: 'Montserrat, Arimo, Arial', fontWeight: 700,
                fontSize: isTablet ? '20px' : '25px',
                lineHeight: '1.3', letterSpacing: '-0.35px',
                color: '#FFFFFF', margin: '0 0 8px 0',
              }}>
                Alumni Tracer Survey
              </h2>
              <p style={{
                fontFamily: 'Arimo, Arial', fontWeight: 400,
                fontSize: '13px', lineHeight: '22px',
                color: 'rgba(255,255,255,0.65)', margin: '0 0 16px 0',
              }}>
                Your feedback matters! Complete our annual survey to help us improve the alumni experience and community engagement.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClockIcon />
                  <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                    2 hours ago
                  </span>
                </div>
                <button
                  onClick={() => surveyRoute && navigate(surveyRoute)}
                  disabled={!surveyRoute}
                  style={{
                    height: '39px', padding: '0 20px',
                    borderRadius: '14px', border: 'none',
                    background: 'rgba(0,40,255,0.85)',
                    boxShadow: '0px 2px 2px rgba(255,255,255,0.25)',
                    fontFamily: 'Arimo, Arial', fontWeight: 700,
                    fontSize: '13px', color: '#FFFFFF',
                    cursor: surveyRoute ? 'pointer' : 'not-allowed',
                    opacity: surveyRoute ? 1 : 0.5,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (surveyRoute) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { if (surveyRoute) e.currentTarget.style.opacity = '1'; }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Filter bar ─────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          marginBottom: isMobile ? '16px' : '24px', gap: '12px',
        }}>
          <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>

            <div
              className="ann-filter-display"
              style={{
                height: '37px', display: 'flex', alignItems: 'center',
                padding: '0 12px', gap: '8px',
                borderRadius: '10px',
                filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))',
                minWidth: isMobile ? 0 : '211px',
                flex: isMobile ? 1 : 'none',
              }}
            >
              <span style={{
                fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '14px',
                lineHeight: '20px', color: 'var(--ann-filter-text)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
              }}>
                {activeCategory}
              </span>
              <div style={{
                background: 'var(--ann-badge-bg)',
                borderRadius: '8px',
                minWidth: '22.63px', height: '19.98px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 5px', flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>
                  {filtered.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowFilter(f => !f)}
              style={{
                height: '37px', padding: '0 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'var(--ann-accent-btn)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
                filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.15))',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                FILTER
              </span>
            </button>

            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: '#FFFFFF',
                border: '1px solid var(--ann-card-border)',
                borderRadius: '12px', overflow: 'hidden',
                zIndex: 300, minWidth: '220px',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
              }}>
                {categories.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: activeCategory === cat ? 'rgba(43,114,251,0.08)' : 'transparent',
                      border: 'none',
                      borderTop: i > 0 ? '1px solid var(--ann-card-border)' : 'none',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'rgba(0,62,166,0.05)'; }}
                    onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontFamily: 'Arimo, Arial', fontSize: '14px',
                      color: activeCategory === cat ? 'var(--ann-title-color)' : 'var(--ann-body-color)',
                      fontWeight: activeCategory === cat ? 700 : 400,
                    }}>
                      {cat}
                    </span>
                    <div style={{
                      background: activeCategory === cat ? 'var(--ann-badge-bg)' : 'rgba(43,114,251,0.15)',
                      borderRadius: '6px', padding: '1px 7px',
                    }}>
                      <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '11px', color: activeCategory === cat ? '#FFFFFF' : 'var(--ann-title-color)' }}>
                        {categoryCounts[cat]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Cards list ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: 'var(--ann-body-color)' }}>
              Loading announcements…
            </span>
          </div>
        ) : (
          <div className="ann-cards-list">
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