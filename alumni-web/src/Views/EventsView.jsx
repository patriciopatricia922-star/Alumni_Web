import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  FaCalendarAlt,
  FaStar,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import { truncateHtml, stripHtml, htmlToReadableText } from '../utils/textHelpers';
import '../styles/Events.css';
import NotificationBell from '../components/notifications/NotificationBell';
import '../styles/NotificationBell.css';

// ── Design tokens (mirrors Discounts.css) ──────────────────────────────
const T = {
  pageBg:          '#DAE5F1',
  cardBg:          '#FFFFFF',
  cardBorder:      'rgba(0, 0, 0, 0.07)',
  cardBorderHover: 'rgba(0, 62, 166, 0.25)',
  cardShadow:      '0px 4px 16px rgba(0, 0, 0, 0.07)',
  cardShadowHover: '0px 12px 32px rgba(0, 62, 166, 0.15), 0px 4px 16px rgba(0, 0, 0, 0.08)',
  titleColor:      '#1e3a5f',
  bodyColor:       '#4a5565',
  metaColor:       '#8A94A6',
  accent:          '#003ea6',
  pageTitle:       '#314C86',
  pageSubtitle:    '#545454',
  backColor:       '#003EA6',
  filterBg:        '#FFFFFF',
  filterBorder:    'rgba(0, 62, 166, 0.2)',
  exclusiveBadge:  '#FAC775',
  dividerColor:    'rgba(0, 0, 0, 0.08)',
};

// ── Clock SVG ───────────────────────────────────────────────────────────────
const ClockSVG = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(74,85,101,0.45)" strokeWidth="1.2" />
    <path d="M6.5 3.5V6.5L8.5 8" stroke="rgba(74,85,101,0.45)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ── Category badge (placed below image like reference) ────────────────────────
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
      padding:       '4px 10px',
      alignSelf:     'flex-start',
      marginTop:     '-16px', // Overlap image slightly like reference
      marginLeft:    '20px',
      position:      'relative',
      zIndex:        2,
      boxShadow:     '0px 2px 4px rgba(0,0,0,0.05)',
    }}>
      {isExclusive
        ? <FaStar size={10} color={T.exclusiveBadge} />
        : <HiOutlineCalendar size={11} color={T.accent} />}
      <span style={{
        fontFamily:     "'Montserrat', Arial, sans-serif",
        fontSize:      '11px',
        fontWeight:    600,
        color:         isExclusive ? T.exclusiveBadge : T.accent,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {isExclusive ? 'Exclusive' : 'Upcoming'}
      </span>
    </div>
  );
};

// ── Event Card ───────────────────────────────────────────────────────────────
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
        boxShadow:    hovered || expanded ? T.cardShadowHover : T.cardShadow,
        borderRadius: '16px',
        overflow:     'hidden',
        cursor:       'pointer',
        transform:    hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition:   'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.12s ease',
        display:      'flex',
        flexDirection: 'column',
        maxWidth:     '95%',
        margin:       '0 auto',
      }}
    >
      {/* ── Image Area (1:1 Aspect Ratio) ── */}
      {images.length > 0 && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          <img
            src={images[imgIndex]}
            alt={event.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.35s ease'
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          
          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              <button onClick={prevImg} style={{
                position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, transition: 'background 0.15s',
              }}>
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
              }}>
                <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
                  <path d="M3 1L7 5L3 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Dot Indicators */}
              <div style={{
                position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: '6px', zIndex: 10,
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
          )}
        </div>
      )}

      {/* ── Content Body ── */}
      <div style={{
        display:    'flex',
        flexDirection: 'column',
        padding:    '18px 20px 0',
        flex:       1,
        position:   'relative',
      }}>
        
        {/* Category Badge (Overlapping Image Bottom) */}
        <CategoryBadge category={event.category} />
        
        {/* Timestamp (Top Right of Content Area) */}
        <div style={{ 
          position: 'absolute', 
          top: '22px', 
          right: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px' 
        }}>
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

        {/* Title Row with Icon */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '8px', 
          marginTop: '16px',
          marginBottom: '8px' 
        }}>
          <div style={{ 
            marginTop: '3px', 
            flexShrink: 0, 
            color: T.accent,
            display: 'flex',
            alignItems: 'center'
          }}>
            <HiOutlineCalendar size={16} />
          </div>
          <p style={{
            fontFamily:    "'Montserrat', Arial, sans-serif",
            fontWeight:    700,
            fontSize:      '15px',
            lineHeight:    '1.45',
            color:         T.titleColor,
            margin:        '0',
            wordBreak:     'break-word',
          }}>
            {event.name || event.title}
          </p>
        </div>

        {/* Description */}
        <p style={{
          fontFamily: "'Montserrat', Arial, sans-serif",
          fontWeight: 400,
          fontSize:   '13px',
          lineHeight: '1.65',
          color:      T.bodyColor,
          margin:     '0 0 16px 0',
          wordBreak:  'break-word',
          overflowWrap: 'break-word',
        }}>
          {expanded ? previewText : (needsTrunc ? previewText.substring(0, 120) + '…' : previewText)}
        </p>

        {/* Divider */}
        <div style={{
          width:      '100%',
          height:     '1px',
          background: T.dividerColor,
          margin:     '0 0 16px 0',
          flexShrink: 0,
        }} />

        {/* Expanded Details (if needed, otherwise hidden) */}
        {expanded && hasDetails && (
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           '10px',
            marginBottom:  '16px',
          }}>
            {event.location && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <HiOutlineLocationMarker size={14} color={T.metaColor} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: '12px', color: T.bodyColor }}>{event.location}</span>
              </div>
            )}
            {event.event_date && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <FaCalendarAlt size={12} color={T.metaColor} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontSize: '12px', color: T.bodyColor }}>
                  {formatEventDate(event.event_date)} • {formatEventTime(event.event_date)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* See More Button */}
        <div style={{ padding: '0 0 20px', flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{
              width:          '100%',
              height:         '37px',
              background:     expanded ? 'transparent' : T.accent,
              border:         expanded ? `1.5px solid ${T.accent}` : 'none',
              borderRadius:   '10px',
              fontFamily:     "'Montserrat', Arial, sans-serif",
              fontWeight:     700,
              fontSize:       '13px',
              color:          expanded ? T.accent : '#ffffff',
              cursor:         'pointer',
              transition:     'all 0.15s',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '6px',
            }}
          >
            {expanded ? 'See Less' : 'See More'}
            <FaChevronDown size={10} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
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
        {/* ─ Back Button ── */}
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
        <div className={isMobile ? 'events-list-wrap mobile' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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