import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  FaCalendarAlt,
  FaStar,
  FaFilter,
  FaChevronUp,
} from 'react-icons/fa';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import { truncateHtml, stripHtml, htmlToReadableText } from '../utils/textHelpers';
import '../styles/Events.css';
import NotificationBell from '../components/notifications/NotificationBell';
import '../styles/NotificationBell.css';

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
  const previewText = htmlToReadableText(event.description || '');
  const needsTrunc  = previewText.length > 120;

  const [imgIndex, setImgIndex] = useState(0);
  const images = event.images?.length ? event.images : event.image ? [event.image] : [];
  const hasMultiple = images.length > 1;
  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length); };
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length); };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={isMobile ? 'events-event-card mobile' : 'events-event-card'}
      style={{
        background:   expanded ? 'rgba(0,62,166,0.03)' : T.cardBg,
        border:       `1px solid ${hovered || expanded ? T.cardBorderHover : T.cardBorder}`,
        borderLeft:   expanded ? '3px solid #003EA6' : '3px solid transparent',
        boxShadow:    hovered || expanded ? T.cardShadowHover : T.cardShadow,
        borderRadius: '16px',
        overflow:     'hidden',
        cursor:       'pointer',
        transform:    hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition:   'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.12s ease',
      }}
    >
      {/* ── Image with arrows ── */}
      {images.length > 0 && (
        <div
          className={isMobile ? 'events-event-image-wrapper mobile' : undefined}
          style={{ position: 'relative', width: '100%', height: isMobile ? undefined : '220px', overflow: 'hidden', flexShrink: 0 }}
        >
          <img
            src={images[imgIndex]}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.35s ease' }}
            onError={e => { e.target.style.display = 'none'; }}
          />

          {/* Left arrow */}
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

          {/* Right arrow */}
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
        </div>
      )}

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
             margin:     expanded ? '0 0 16px 0' : '0 0 4px 0',
          }}>
            {event.name || event.title}
          </p>

          {/* Description with inline See more */}
          <p style={{
            fontFamily: "'Montserrat', Arial, sans-serif",
            fontWeight: 400,
            fontSize:   '12px',
            lineHeight: expanded ? '1.8' : '1.6',   // ← changed
            color:      '#4A5565',
            margin:     expanded ? '0 0 16px 0' : '0 0 4px 0',  // ← changed
            whiteSpace: 'pre-wrap',    // ← new
            wordBreak:  'break-word',  // ← new
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
            <div style={{
              display:       'flex',
              flexDirection: 'column',
              gap:           '10px',    // was 8px
              paddingTop:    '8px',     // was 4px
            }}>
              <div style={{ height: '1px', background: '#FAC775', margin: '0 0 4px 0' }} />
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
              gap:           '12px',      // ← was 8px
              paddingTop:    '12px',      // ← was 4px
            }}>
              <div style={{ height: '1px', background: '#FAC775', margin: '0 0 8px 0' }} />
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
                  marginTop: '8px', 
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
  navigate,
}) => {
  const sidebarWidth = isTablet ? 200 : 229;

  return (
    <div style={{
      display:    'flex',
      minHeight:  '100vh',
      background: T.pageBg,
    }}>
      <Sidebar />

      <div
        className={`events-main-content ${isMobile ? 'mobile' : ''}`}
        style={{
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
          flex:       1,
          padding:    isMobile ? undefined : isTablet ? '37px 28px 48px' : '37px 51px 60px',
          boxSizing:  'border-box',
          overflowX:  'hidden',
          position:   'relative',
        }}>

        <NotificationBell
          onSeeAll={() => navigate('/notifications')}
          className={isMobile ? 'mobile' : ''}
          dropdownClassName={isMobile ? 'mobile' : ''}
        />

        {/* ── Back Button ── */}
        <button
          className={isMobile ? 'back-button mobile' : 'back-button'}
          onClick={() => navigate(-1)}
          style={{ position: 'relative', top: '-0.5px' }}
        >
          <svg width="15" height="15" viewBox="0 0 17 17" fill="none" style={{ marginLeft: '7.5px' }}>
            <path d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
              stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        {/* ── Header ── */}
        <div className={`events-header ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
          <h1 className={`events-title ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
            Events
          </h1>
          <p className={`events-subtitle ${isMobile ? 'mobile' : ''}`}>
            Stay updated with upcoming activities and gatherings designed to keep you engaged with the alumni community
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div
          className={isMobile ? 'events-filter-bar mobile' : 'events-filter-bar'}
          style={{
            display:        'flex',
            justifyContent: 'flex-end',
            alignItems:     'center',
            marginBottom:   isMobile ? '16px' : '24px',
            marginRight:    isMobile ? undefined : '34.5px',
            gap:            '12px',
          }}>
          <div
            ref={filterRef}
            className={isMobile ? 'events-filter-container mobile' : 'events-filter-container'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
          >

            <div style={{ position: 'relative' }} className={isMobile ? 'events-filter-trigger-wrap mobile' : undefined}>
            <div
              className={isMobile ? 'events-filter-display mobile' : 'events-filter-display'}
              style={{
                height:      '40px',
                display:     'flex',
                alignItems:  'center',
                padding:     '0 14px',
                gap:         '10px',
                background:  'var(--filter-bg, #ffffff)',
                border:      '1px solid var(--filter-border, rgba(0,62,166,0.15))',
                borderRadius:'10px',
                boxShadow:   '0px 2px 8px rgba(0,0,0,0.06)',
                minWidth:    isMobile ? undefined : '240px',
                flex:        isMobile ? 1 : 'none',
              }}>
              <span style={{
                fontFamily:   'Montserrat, Arial, sans-serif',
                fontWeight:   600,
                fontSize:     '13.5px',
                color:        '#1e3a5f',
                whiteSpace:   'nowrap',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                flex:         1,
              }}>
                {activeCategory}
              </span>
              <div style={{
                background:     '#003ea6',
                borderRadius:   '6px',
                minWidth:       '24px',
                height:         '20px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '0 6px',
                flexShrink:     0,
              }}>
                <span style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: '12px', color: '#ffffff' }}>
                  {filtered.length}
                </span>
              </div>
            </div>

            {showFilter && (
              <div
                className={isMobile ? 'events-filter-dropdown mobile' : 'events-filter-dropdown'}
                style={{
                  position:     'absolute',
                  top:          'calc(100% + 8px)',
                  left:         0,
                  background:   '#FFFFFF',
                  border:       '1px solid rgba(0,62,166,0.15)',
                  borderRadius: '12px',
                  overflow:     'hidden',
                  zIndex:       300,
                  minWidth:     '100%',
                  width:        '100%',
                  boxShadow:    '0px 10px 30px rgba(0,0,0,0.15)',
                }}>
                {categories.map((cat, i) => (
                  <button key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    style={{
                      width:          '100%',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'space-between',
                      padding:        '12px 14px 12px 14.5px',
                      background:     activeCategory === cat ? 'rgba(43,114,251,0.08)' : 'transparent',
                      border:         'none',
                      borderTop:      i > 0 ? '1px solid rgba(0,62,166,0.08)' : 'none',
                      cursor:         'pointer',
                      transition:     'background 0.15s',
                    }}
                    onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'rgba(0,62,166,0.05)'; }}
                    onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontFamily:  'Montserrat, Arial, sans-serif',
                      fontSize:    '13.5px',
                      color:       activeCategory === cat ? '#1e3a5f' : '#545454',
                      fontWeight:  activeCategory === cat ? 700 : 400,
                      whiteSpace:  'nowrap',
                    }}>
                      {cat}
                    </span>
                    <div style={{
                      background:     activeCategory === cat ? '#003ea6' : 'rgba(43,114,251,0.15)',
                      borderRadius:   '6px',
                      minWidth:       '24px',
                      height:         '20px',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      padding:        '0 6px',
                      flexShrink:     0,
                      marginLeft:     '0',
                    }}>
                      <span style={{
                        fontFamily: 'Montserrat, Arial, sans-serif',
                        fontWeight: 700,
                        fontSize:   '11px',
                        color:      activeCategory === cat ? '#FFFFFF' : '#1e3a5f',
                      }}>
                        {categoryCounts[cat]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            </div>

            <button
              onClick={() => setShowFilter(f => !f)}
              className={isMobile ? 'events-filter-button mobile' : 'events-filter-button'}
              style={{
                height:         '40px',
                padding:        '0 18px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '8px',
                background:     '#003ea6',
                border:         'none',
                borderRadius:   '10px',
                cursor:         'pointer',
                flexShrink:     0,
                boxShadow:      '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
                transition:     'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                FILTER
              </span>
            </button>
          </div>
        </div>

        {/* ── Events List (stacked, full-width cards) ── */}
        <div className={isMobile ? 'events-list-wrap mobile' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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