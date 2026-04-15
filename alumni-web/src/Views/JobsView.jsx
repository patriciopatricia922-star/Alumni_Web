import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { truncateHtml, createMarkup, stripHtml } from '../utils/textHelpers';

// ── Icons ──────────────────────────────────────────────────────────────────────
const BriefcaseIcon = ({ size = 14, opacity = 0.85 }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 20 18" fill="none">
    <rect x="1" y="5" width="18" height="12" rx="2" stroke={`rgba(255,255,255,${opacity})`} strokeWidth="1.5"/>
    <path d="M7 5V3a1 1 0 011-1h4a1 1 0 011 1v2" stroke={`rgba(255,255,255,${opacity})`} strokeWidth="1.5"/>
    <path d="M1 10h18" stroke={`rgba(255,255,255,${opacity})`} strokeWidth="1.5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2" width="14" height="13" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M1 6h14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M5 1v2M11 1v2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 14" fill="none">
    <rect x="1" y="1" width="14" height="12" rx="2" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2"/>
    <path d="M1 4l7 5 7-5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ── Job Detail Modal (FIXED: Renders HTML properly) ───────────────────────────
const JobDetailModal = ({ job, onClose, isMobile }) => {
  if (!job) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,62,166,0.95) 0%, rgba(0,34,102,0.95) 100%)',
        borderRadius: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: isMobile ? '24px' : '32px',
        border: '1px solid rgba(43,114,251,0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(81,162,255,0.15)',
              border: '1px solid #51A2FF',
              borderRadius: '20px', padding: '4px 12px', marginBottom: '12px',
            }}>
              <BriefcaseIcon size={12} opacity={1} />
              <span style={{ fontFamily: 'Arimo', fontSize: '11px', fontWeight: 700, color: '#51A2FF' }}>{job.category}</span>
            </div>
            <h2 style={{
              fontFamily: 'Arimo, Arial', fontWeight: 700,
              fontSize: isMobile ? '24px' : '32px',
              color: '#FFED97',
              margin: 0,
            }}>{job.title}</h2>
            <p style={{
              fontFamily: 'Arimo, Arial',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              margin: '8px 0 0 0',
            }}>{job.company}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontSize: '20px',
          }}>✕</button>
        </div>
        
        {/* Job Image */}
        {job.image && (
          <div style={{
            width: '100%',
            height: '200px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}>
            <img 
              src={job.image} 
              alt={job.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        
        {/* Job Details */}
        <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {job.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none"/>
                <circle cx="8" cy="6" r="1.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/>
              </svg>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{job.location}</span>
            </div>
          )}
          {job.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{job.date}</span>
            </div>
          )}
          {job.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MailIcon />
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{job.website}</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px' }}>Requirements</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {job.tags.map((tag, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.8)',
                }}>{tag}</span>
              ))}
            </div>
          </div>
        )}
        
        {/*  Render HTML content properly in detail view */}
        <div 
          className="job-full-content"
          style={{
            fontFamily: 'Arimo, Arial',
            fontSize: '15px',
            lineHeight: '1.7',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '24px',
          }}
          dangerouslySetInnerHTML={createMarkup(job.description)}
        />
        
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontSize: '13px',
          }}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ── Shared Job Card (FIXED: HTML rendering for description) ────────────────────
const JobCard = ({ job, matchLabel, isMobile, isRecommended = false, onCardClick }) => {
  const [hovered, setHovered] = useState(false);

  const borderColor = isRecommended
    ? hovered ? 'rgba(255,200,80,0.65)' : 'rgba(255,200,80,0.28)'
    : hovered ? 'rgba(43,114,251,0.55)' : 'rgba(255,255,255,0.2)';

  const boxShadow = isRecommended
    ? hovered
      ? '0px 0px 20px rgba(255,180,50,0.2), 0px 8px 24px rgba(0,0,0,0.4)'
      : '0px 0px 8px rgba(255,255,255,0.1)'
    : hovered
      ? '0px 0px 20px rgba(43,114,251,0.35), 0px 8px 24px rgba(0,0,0,0.4)'
      : '0px 0px 8px rgba(255,255,255,0.25)';

  const handleCardClick = () => {
    if (onCardClick) onCardClick(job);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(0,62,166,0.35)',
        border: `0.889px solid ${borderColor}`,
        boxShadow,
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={handleCardClick}
    >
      {/* Photo area */}
      <div style={{ width: '100%', height: '160px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        {job.image ? (
          <>
            <img
              src={job.image}
              alt={job.title}
              style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.35s ease',
              }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,15,50,0.55) 100%)' }} />
          </>
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(180deg, rgba(30,37,85,0.9) 0%, rgba(15,19,56,0.95) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BriefcaseIcon size={40} opacity={0.3} />
          </div>
        )}
        {matchLabel && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(250,199,117,0.15)', border: '0.5px solid #FAC775',
            borderRadius: '7px', padding: '3px 8px',
            fontSize: '10px', fontWeight: 700, color: '#FAC775', fontFamily: 'Arimo, Arial',
          }}>
            {matchLabel}
          </div>
        )}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          background: 'rgba(0,40,180,0.65)', border: '0.5px solid rgba(255,255,255,0.2)',
          borderRadius: '7px', padding: '3px 8px',
          fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: 'Arimo, Arial',
        }}>
          {job.category}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px 0', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
          <div style={{ marginTop: '3px', flexShrink: 0 }}><BriefcaseIcon size={14} opacity={0.85} /></div>
          <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '15px', lineHeight: '22px', color: '#FFED97', margin: 0 }}>
            {job.title}
          </p>
        </div>
        <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 12px 0' }}>
          {job.company}
        </p>
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '12px' }} />
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.7px', margin: '0 0 7px 0' }}>
            Requirements
          </p>
          {job.tags && job.tags.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {job.tags.slice(0, 3).map((tag, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '3px 9px', fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                  {tag}
                </span>
              ))}
              {job.tags.length > 3 && (
                <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '3px 9px', fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                  +{job.tags.length - 3}
                </span>
              )}
            </div>
          ) : (
            //  Strip HTML for description preview
            <p style={{
              fontFamily: 'Arimo, Arial', fontWeight: 400,
              fontSize: '12px', lineHeight: '20px',
              color: 'rgba(255,255,255,0.6)', margin: 0,
              display: '-webkit-box', WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {truncateHtml(job.description, 100)}
            </p>
          )}
        </div>
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
          <div style={{ flexShrink: 0 }}><MailIcon /></div>
          <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {job.website}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '18px' }}>
          <div style={{ flexShrink: 0 }}><CalendarIcon /></div>
          <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            {job.date}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Filter Dropdown ────────────────────────────────────────────────────────────
const FilterDropdown = ({ categories, activeCategory, setActiveCategory, setShowFilter, categoryCounts }) => (
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
);

// ── Main View ──────────────────────────────────────────────────────────────────
const JobsView = ({
  isMobile, isTablet,
  categories, activeCategory, setActiveCategory,
  showFilter, setShowFilter, filterRef, categoryCounts, filtered,
  recommended, recSubtitle,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  const sidebarWidth   = isTablet ? 200 : 229;
  const hasRecommended = recommended.length > 0;
  const recCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';
  const allCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';
  const [selectedJob, setSelectedJob] = useState(null);

  const handleCardClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial, sans-serif' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        padding: isMobile ? '24px 16px 90px' : isTablet ? '37px 28px 48px' : '37px 51px 60px',
        boxSizing: 'border-box', overflowX: 'hidden', position: 'relative',
      }}>

        {/* ── Notification Bell ── (keep as is - same pattern as previous) ── */}
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
                <button onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
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

        {/* ── Back ───────────────────────────────────────────────────────────── */}
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: isMobile ? '16px' : '24px' }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: isMobile ? '20px' : '28px', paddingRight: isMobile ? '58px' : '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <h1 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isMobile ? '28px' : isTablet ? '32px' : '40px', lineHeight: '1.2', letterSpacing: '-1px', color: '#FFFFFF', margin: 0 }}>Jobs</h1>
            <div style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)', border: '1.24px solid rgba(99,102,241,0.3)', borderRadius: '9999px', padding: '5px 14px' }}>
              <span style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.8)' }}>HAPPENING SOON</span>
            </div>
          </div>
          <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: isMobile ? '13px' : '16px', lineHeight: '22px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Stay connected with the latest opportunities from your alumni network.
          </p>
        </div>

        {/* ── Recommended section ────────────────────────────────────────────── */}
        {hasRecommended && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isMobile ? '15px' : '17px', color: '#FFFFFF' }}>Recommended for you</span>
              <div style={{ background: '#2B72FB', borderRadius: '8px', padding: '2px 9px' }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{recommended.length}</span>
              </div>
            </div>
            {recSubtitle && (
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,200,80,0.6)', margin: '0 0 16px 0' }}>
                Based on your {recSubtitle}
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: recCols, gap: isMobile ? '12px' : isTablet ? '16px' : '20px', marginBottom: 0 }}>
              {recommended.map(({ job, matchLabel }) => (
                <JobCard key={job.id} job={job} matchLabel={matchLabel} isMobile={isMobile} isRecommended onCardClick={handleCardClick} />
              ))}
            </div>

            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', margin: isMobile ? '20px 0' : '28px 0' }} />

            {/* ── All Jobs label + filter — with recommendations ── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'nowrap',
              marginBottom: isMobile ? '14px' : '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isMobile ? '15px' : '17px', color: '#FFFFFF' }}>All Jobs</span>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2px 9px' }}>
                  <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{filtered.length}</span>
                </div>
              </div>

              <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', flexShrink: 0 }}>
                <div style={{
                  height: '37px', display: 'flex', alignItems: 'center',
                  padding: '0 12px', gap: '8px',
                  background: 'rgba(0,62,166,0.35)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))',
                }}>
                  <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '14px', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>{activeCategory}</span>
                  <div style={{ background: '#2B72FB', borderRadius: '8px', minWidth: '22px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                    <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{filtered.length}</span>
                  </div>
                </div>
                <button onClick={() => setShowFilter(f => !f)}
                  style={{
                    height: '37px', padding: '0 18px',
                    display: 'flex', alignItems: 'center', gap: '8px',
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
                  <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>FILTER</span>
                </button>
                {showFilter && <FilterDropdown categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} setShowFilter={setShowFilter} categoryCounts={categoryCounts} />}
              </div>
            </div>
          </>
        )}

        {/* ── No recommendations — standalone filter bar ─────────────────────── */}
        {!hasRecommended && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: isMobile ? '16px' : '24px', gap: '12px' }}>
            <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', flexShrink: 0 }}>
              <div style={{ height: '37px', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', background: 'rgba(0,62,166,0.35)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))', minWidth: isMobile ? 0 : '211px', flex: isMobile ? 1 : 'none' }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '14px', color: 'rgba(255,255,255,0.9)', flex: 1 }}>{activeCategory}</span>
                <div style={{ background: '#2B72FB', borderRadius: '8px', minWidth: '22px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                  <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{filtered.length}</span>
                </div>
              </div>
              <button onClick={() => setShowFilter(f => !f)}
                style={{
                  height: '37px', padding: '0 18px',
                  display: 'flex', alignItems: 'center', gap: '8px',
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
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>FILTER</span>
              </button>
              {showFilter && <FilterDropdown categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} setShowFilter={setShowFilter} categoryCounts={categoryCounts} />}
            </div>
          </div>
        )}

        {/* ── All Jobs grid ──────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: allCols, gap: isMobile ? '14px' : isTablet ? '18px' : '24px' }}>
            {filtered.map(job => (
              <JobCard key={job.id} job={job} isMobile={isMobile} onCardClick={handleCardClick} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arimo, Arial', fontSize: '15px' }}>
            No jobs found for this category.
          </div>
        )}

      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal 
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default JobsView;