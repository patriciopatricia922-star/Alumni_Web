import React, { useState, useEffect, useRef } from 'react';
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

// ── Clock SVG ────────────────────────────────────────────────────────────────
const ClockSVG = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(74,85,101,0.45)" strokeWidth="1.2" />
    <path d="M6.5 3.5V6.5L8.5 8" stroke="rgba(74,85,101,0.45)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ── Event Card ───────────────────────────────────────────────────────────────
const EventCard = ({ event, isMobile, isTarget }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(isTarget); // Auto-expand if target
  const formatEventDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formatEventTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const relativeTime = (dateStr) => {
    if (!dateStr) return '2 hours ago';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'just now';
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const hasDetails = event.location || event.event_date;
  const previewText = htmlToReadableText(event.description || '');
  const needsTrunc = previewText.length > 120;
  const [imgIndex, setImgIndex] = useState(0);
  const images = event.images?.length ? event.images : event.image ? [event.image] : [];
  const hasMultiple = images.length > 1;

  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length); };
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length); };

  // Determine category label
  const isExclusive = event.category === 'Exclusive Events';
  const categoryLabel = isExclusive ? 'Exclusive' : (event.category || 'Upcoming');

  // Scroll into view if it's the target
  const cardRef = useRef(null);
  useEffect(() => {
    if (isTarget && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isTarget]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`events-event-card ${hovered ? 'hovered' : ''} ${expanded ? 'expanded' : ''} ${isTarget ? 'target-highlight' : ''}`}
      style={isTarget ? { boxShadow: '0 0 0 2px #003ea6, 0px 12px 32px rgba(0,62,166,0.15)' } : {}}
    >
      {/* ── Image Area (1:1 Aspect Ratio controlled by CSS) ── */}
      {images.length > 0 && (
        <div className="events-event-image-wrapper">
          <img
            src={images[imgIndex]}
            alt={event.title}
            className={`events-event-image ${hovered ? 'hovered' : ''}`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          
          {/* Navigation Arrows & Dots - Only visible if more than 1 image */}
          {hasMultiple && (
            <>
              {/* Left / Right arrows */}
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
              
              {/* Dot Indicators */}
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
          )}

          {/* Category Tag - Bottom Left */}
          <div className="events-category-tag">
            {isExclusive && <FaStar size={10} color="#FAC775" />}
            {!isExclusive && <HiOutlineCalendar size={11} color="#003ea6" />}
            <span className="events-category-text">{categoryLabel}</span>
          </div>
          
          {/* Timestamp Overlay - Top Right */}
          <div className="events-timestamp-overlay">
            <ClockSVG />
            <span className="events-timestamp-text">
              {relativeTime(event.created_at || event.event_date)}
            </span>
          </div>
        </div>
      )}

      {/* ── Card Body ── */}
      <div className="events-event-card-body">
        {/* Title Row with Icon */}
        <div className="events-event-title-row">
          <div className="events-event-icon">
            <HiOutlineCalendar size={16} />
          </div>
          <p className="events-event-title">
            {event.name || event.title}
          </p>
        </div>
        
        {/* Description */}
        <p className="events-event-description">
          {expanded ? previewText : (needsTrunc ? previewText.substring(0, 120) + '…' : previewText)}
        </p>
        
        {/* Divider */}
        <div className="events-event-divider" />
        
        {/* ─ Expandable Details (Location + Date/Time) ── */}
        <div className={`events-event-details ${expanded ? 'expanded' : ''}`}>
          <div className="events-event-details-content">
            {event.location && (
              <div className="events-event-detail-item">
                <div className="events-detail-icon"><HiOutlineLocationMarker size={14} /></div>
                <p className="events-detail-text">{event.location}</p>
              </div>
            )}
            {event.event_date && (
              <div className="events-event-detail-item">
                <div className="events-detail-icon"><FaCalendarAlt size={12} /></div>
                <p className="events-detail-text">
                  {formatEventDate(event.event_date)} • {formatEventTime(event.event_date)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toggle Button ── */}
      {hasDetails && (
        <div className="events-event-button-wrapper">
          <button
            onClick={() => setExpanded(v => !v)}
            className={`events-event-toggle-btn ${expanded ? 'expanded' : ''}`}
          >
            {expanded ? (
              <>See Less <FaChevronUp size={10} /></>
            ) : (
              <>See More <FaChevronDown size={10} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// ─ Main View ─────────────────────────────────────────────────────────────────
const EventsView = ({
  isMobile, isTablet,
  categories, activeCategory, setActiveCategory,
  showFilter, setShowFilter, filterRef, categoryCounts, filtered,
  navigate,
  targetEventId, // NEW PROP
}) => {
  const sidebarWidth = isTablet ? 200 : 229;

  return (
    <div className="events-view-container">
      <Sidebar />
      <div className={`events-main-content ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
        <NotificationBell
          onSeeAll={() => navigate('/notifications')}
          className={isMobile ? 'mobile' : ''}
          dropdownClassName={isMobile ? 'mobile' : ''}
        />
        
        {/* ── Back Button ── */}
        <button
          className={`back-button ${isMobile ? 'mobile' : ''}`}
          onClick={() => navigate(-1)}
          style={{ position: 'relative', top: '-0.5px', marginLeft: isMobile ? 0 : '-20px' }}
        >
          <svg width="15" height="15" viewBox="0 0 17 17" fill="none" style={{ marginLeft: '0.5px' }}>
            <path d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
              stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back</span>
        </button>

        {/* ── Header ─ */}
        <div className={`events-header ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
          <h1 className={`events-title ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
            Events
          </h1>
          <p className={`events-subtitle ${isMobile ? 'mobile' : ''}`}>
            Stay updated with upcoming activities and gatherings designed to keep you engaged with the alumni community
          </p>
        </div>

        {/* ─ Filter Bar ── */}
        <div
          className={`filter-bar ${isMobile ? 'mobile' : ''}`}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: isMobile ? '16px' : '24px',
            marginRight: isMobile ? undefined : '34.5px',
            gap: '12px',
          }}
        >
          <div
            ref={filterRef}
            className={`filter-container ${isMobile ? 'mobile' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
          >
            <div style={{ position: 'relative' }} className={isMobile ? 'filter-trigger-wrap mobile' : undefined}>
              <div
                className={`filter-display ${isMobile ? 'mobile' : ''}`}
                style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  gap: '10px',
                  background: 'var(--filter-bg, #ffffff)',
                  border: '1px solid var(--filter-border, rgba(0,62,166,0.15))',
                  borderRadius: '10px',
                  boxShadow: '0px 2px 8px rgba(0,0,0,0.06)',
                  minWidth: isMobile ? undefined : '240px',
                  flex: isMobile ? 1 : 'none',
                }}
              >
                <span className="filter-active-text">
                  {activeCategory}
                </span>
                <div className="filter-count-badge">
                  <span className="filter-count-text">{filtered.length}</span>
                </div>
              </div>
              
              {showFilter && (
                <div
                  className={`filter-dropdown ${isMobile ? 'mobile' : ''}`}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    background: '#FFFFFF',
                    border: '1px solid rgba(0,62,166,0.15)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    zIndex: 300,
                    minWidth: '100%',
                    width: '100%',
                    boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  {categories.map((cat, i) => (
                    <button key={cat}
                      onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                      className={`filter-option ${activeCategory === cat ? 'active' : ''}`}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '11px 16px',
                        background: activeCategory === cat ? 'rgba(43,114,251,0.08)' : 'transparent',
                        border: 'none',
                        borderTop: i > 0 ? '1px solid rgba(0,62,166,0.08)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      <span className={`filter-option-text ${activeCategory === cat ? 'active' : ''}`}>
                        {cat}
                      </span>
                      <div className={`filter-option-count ${activeCategory === cat ? 'active' : ''}`}>
                        <span className="filter-option-count-text">{categoryCounts[cat]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowFilter(f => !f)}
              className={`filter-button ${isMobile ? 'mobile' : ''}`}
              style={{
                height: '40px',
                padding: '0 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#003ea6',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <span className="filter-button-text">FILTER</span>
            </button>
          </div>
        </div>

        {/* ── Events List (Grid Layout) ── */}
        {filtered.length > 0 ? (
          <div
            className={`events-list ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}
            style={{
              marginLeft: isMobile ? undefined : '27px',
              marginRight: isMobile ? undefined : '27.5px',
              marginTop: '-8px',
            }}
          >
            {filtered.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isMobile={isMobile}
                isTarget={targetEventId && String(event.id) === String(targetEventId)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-events">
            No events found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsView;