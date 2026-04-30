import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { truncateHtml } from '../utils/textHelpers';

/* ─── Google Fonts: Montserrat (shared token) ───────────────────────────────── */
const fontLink = document.querySelector('#montserrat-font');
if (!fontLink) {
  const link = document.createElement('link');
  link.id   = 'montserrat-font';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap';
  document.head.appendChild(link);
}

/*
 * ─── Design tokens (mirrors SurveyComplete / Figma CSS export) ───────────────
 *   Page bg          : #e8edf5
 *   Card bg          : #ffffff
 *   Card shadow      : 0px 8px 40px rgba(0,0,0,0.12)
 *   Card radius      : 16px
 *   Primary blue     : #003ea6
 *   Heading color    : #1e3a5f  (Figma: #314c86 — closest token)
 *   Body color       : #4a5565  (Figma: #545454)
 *   Subtext          : #6a7282
 *   Accent yellow    : #f5cb00
 *   Tag bg           : #dbeafe  (light blue chip)
 *   Tag text         : #003ea6
 *   Discount badge   : #ef4444 (red — high-emphasis)
 *   Font             : Montserrat
 */

// ── Icons ─────────────────────────────────────────────────────────────────────
const PriceTagIcon = () => (
  <svg width="14" height="11" viewBox="0 0 24 20" fill="none">
    <path d="M1 1h8l10 9-8 9L1 10V1z" stroke="#003ea6" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="6" cy="6" r="1.5" fill="#003ea6"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z"
      stroke="#4a5565" strokeWidth="1.2" fill="none"/>
    <circle cx="8" cy="6" r="1.5" stroke="#4a5565" strokeWidth="1.2"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="3" width="18" height="17" rx="2" stroke="#4a5565" strokeWidth="1.5"/>
    <path d="M2 8h18" stroke="#4a5565" strokeWidth="1.5"/>
    <path d="M7 1.5v3M15 1.5v3" stroke="#4a5565" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="5.5" y="11" width="3" height="3" rx="0.5" fill="#4a5565" opacity="0.6"/>
    <rect x="9.5" y="11" width="3" height="3" rx="0.5" fill="#4a5565" opacity="0.6"/>
    <rect x="13.5" y="11" width="3" height="3" rx="0.5" fill="#4a5565" opacity="0.6"/>
  </svg>
);

// ── Discount Card ─────────────────────────────────────────────────────────────
const DiscountCard = ({ item }) => {
  const [hovered,  setHovered]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasDetails = item.location || item.validUntil;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:    '#ffffff',
        marginTop:     '1px',
        border:        `1px solid ${hovered ? 'rgba(0,62,166,0.25)' : 'rgba(0,0,0,0.07)'}`,
        boxShadow:     hovered
          ? '0px 12px 32px rgba(0,62,166,0.15), 0px 4px 16px rgba(0,0,0,0.08)'
          : '0px 4px 16px rgba(0,0,0,0.07)',
        borderRadius:  '16px',
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
        transform:     hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition:    'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* ── Photo with discount badge + category tag ── */}
      <div style={{ width: '100%', height: '214px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.35s ease',
          }}
          onError={e => { e.target.style.background = '#dbeafe'; e.target.style.display = 'none'; }}
        />

        {/* Discount % badge — top-right, red pill */}
        {item.discountPercent && (
          <div style={{
            position:       'absolute',
            top:            '12px',
            right:          '12px',
            background:     '#ef4444',
            borderRadius:   '20px',
            padding:        '4px 10px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize:   '12px',
              color:      '#ffffff',
              lineHeight: 1,
            }}>
              {item.discountPercent}
            </span>
          </div>
        )}

        {/* Category tag — bottom-left, white pill */}
        {item.category && (
          <div style={{
            position:       'absolute',
            bottom:         '12px',
            left:           '12px',
            background:     'rgba(255,255,255,0.92)',
            borderRadius:   '20px',
            padding:        '4px 10px',
          }}>
            <span style={{
              fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
              fontWeight: 600,
              fontSize:   '11px',
              color:      '#1e3a5f',
              lineHeight: 1,
            }}>
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '20px 20px 0', flex: 1 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <div style={{ marginTop: '4px', flexShrink: 0 }}><PriceTagIcon /></div>
          <p style={{
            fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize:   '15px',
            lineHeight: '22px',
            color:      '#1e3a5f',
            margin:     0,
          }}>
            {item.name}
          </p>
        </div>

        {/* Discount description */}
        <p style={{
          fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
          fontWeight: 400,
          fontSize:   '12px',
          lineHeight: '18px',
          color:      '#4a5565',
          margin:     '0 0 14px 0',
        }}>
          {truncateHtml(item.discount, expanded ? 500 : 80)}
        </p>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.08)', marginBottom: '12px' }} />

        {/* ── Expandable details ── */}
        <div style={{
          overflow:   'hidden',
          maxHeight:  expanded ? '200px' : '0px',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{ paddingBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {item.location && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ marginTop: '3px', flexShrink: 0 }}><LocationIcon /></div>
                <p style={{
                  fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                  fontWeight: 400,
                  fontSize:   '12px',
                  lineHeight: '18px',
                  color:      '#4a5565',
                  margin:     0,
                  whiteSpace: 'pre-line',
                }}>
                  {item.location}
                </p>
              </div>
            )}
            {item.validUntil && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flexShrink: 0 }}><CalendarIcon /></div>
                <p style={{
                  fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                  fontWeight: 400,
                  fontSize:   '12px',
                  lineHeight: '18px',
                  color:      '#4a5565',
                  margin:     0,
                }}>
                  {item.validUntil}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toggle button ── */}
      {hasDetails && (
        <div style={{ padding: '0 20px 20px' }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              width:          '100%',
              height:         '37px',
              background:     expanded ? 'transparent' : '#003ea6',
              border:         expanded ? '1.5px solid #003ea6' : 'none',
              borderRadius:   '10px',
              fontFamily:     "'Montserrat', Helvetica, Arial, sans-serif",
              fontWeight:     700,
              fontSize:       '13px',
              color:          expanded ? '#003ea6' : '#ffffff',
              cursor:         'pointer',
              transition:     'background 0.15s, color 0.15s',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {expanded ? <>See Less <FaChevronUp size={10} /></> : <>See More <FaChevronDown size={10} /></>}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────
const DiscountsView = ({
  isMobile, isTablet,
  categories, activeCategory, setActiveCategory,
  showFilter, setShowFilter, filterRef, categoryCounts, filtered,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  const sidebarWidth = isTablet ? 200 : 229;
  const cols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';

  return (
    <div style={{
      display:    'flex',
      minHeight:  '100vh',
      background: '#e8edf5',                    /* ← was #002263 */
      fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
    }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex:       1,
        padding:    isMobile ? '24px 16px 90px' : isTablet ? '37px 28px 48px' : '37px 51px 60px',
        boxSizing:  'border-box',
        overflowX:  'hidden',
        position:   'relative',
      }}>

        {/* ── Notification Bell ─────────────────────────────────────────────── */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top:      isMobile ? '24px' : '37px',
          right:    isMobile ? '16px' : isTablet ? '28px' : '51px',
          zIndex:   200,
        }}>
          {/* Bell button — solid primary blue, matches SurveyComplete */}
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              width:          isMobile ? '44px' : '52px',
              height:         isMobile ? '44px' : '52px',
              background:     '#003ea6',
              border:         'none',
              boxShadow:      '0px 4px 12px rgba(0,62,166,0.35)',
              borderRadius:   '14px',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              position:       'relative',
              transition:     'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                stroke="#ffffff" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <div style={{
                position:       'absolute',
                top:            '-4px',
                right:          '-4px',
                minWidth:       '18px',
                height:         '18px',
                background:     '#ef4444',
                borderRadius:   '50%',
                border:         '2px solid #003ea6',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '0 3px',
              }}>
                <span style={{
                  fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                  fontSize:   '9px',
                  color:      '#ffffff',
                  fontWeight: 700,
                  lineHeight: 1,
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            )}
          </button>

          {/* Notification dropdown — dark panel (unchanged) */}
          {showDropdown && (
            <div style={{
              position:       'absolute',
              top:            isMobile ? '52px' : '60px',
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
              {/* Header */}
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0 }}>
                    Mark all read
                  </button>
                )}
              </div>
              {/* Tabs */}
              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                {['all', 'unread'].map(t => (
                  <button key={t} onClick={() => setNotifTab(t)} style={{
                    height: '32px', padding: '0 16px',
                    background: notifTab === t ? '#2B72FB' : 'transparent',
                    border: notifTab === t ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '20px', cursor: 'pointer',
                    fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                    fontSize: '12px', fontWeight: notifTab === t ? 700 : 400,
                    color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize',
                  }}>
                    {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>
              {/* List */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (!list.length) return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <p style={{ fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                        {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                      </p>
                    </div>
                  );
                  return Object.entries(groupByDate(list)).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p style={{ fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{label}</p>
                        {items.map(n => (
                          <div key={n.id} onClick={() => markOneRead(n.id)}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 18px', background: n.read ? 'transparent' : 'rgba(43,114,251,0.07)', cursor: 'pointer', transition: 'background 0.12s', borderLeft: n.read ? '3px solid transparent' : '3px solid #2B72FB' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(43,114,251,0.07)'}
                          >
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                                  stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", fontWeight: n.read ? 400 : 700, fontSize: '13px', color: '#FFFFFF', margin: '0 0 2px 0', lineHeight: '1.4' }}>{n.title}</p>
                              <p style={{ fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '0 0 4px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body}</p>
                              <span style={{ fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{formatTime(n.time)}</span>
                            </div>
                            {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2B72FB', flexShrink: 0, marginTop: '6px' }} />}
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
              </div>
              {/* Footer */}
              <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                  style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Back Button ───────────────────────────────────────────────────── */}
        <button onClick={() => navigate('/dashboard')} style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '8px',
          background:   'none',
          border:       'none',
          cursor:       'pointer',
          padding:      0,
          marginBottom: isMobile ? '16px' : '24px',
        }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67"
              stroke="#003ea6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
            fontWeight: 700,
            fontSize:   '15px',
            lineHeight: '16px',
            color:      '#003ea6',                          /* ← was #FFFFFF */
          }}>
            Back
          </span>
        </button>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: isMobile ? '16px' : '20px', paddingRight: isMobile ? '58px' : '90px' }}>
          <h1 style={{
            fontFamily:    "'Montserrat', Helvetica, Arial, sans-serif",  /* ← was Arimo */
            fontWeight:    700,
            fontSize:      isMobile ? '28px' : isTablet ? '32px' : '40px',
            lineHeight:    '48px',
            letterSpacing: '-1px',
            color:         '#1e3a5f',                       /* ← was #FFFFFF (Figma: #314c86) */
            margin:        '0 0 8px 0',
          }}>
            Discounts
          </h1>
          <p style={{
            fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
            fontWeight: 400,
            fontSize:   isMobile ? '13px' : '16px',
            lineHeight: '22.5px',
            color:      '#545454',                          /* ← Figma token exactly */
            margin:     0,
          }}>
            Avail discounts on participating accommodations, dining, shopping, leisure, and health and wellness establishments.
          </p>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: isMobile ? '16px' : '20px', gap: '12px' }}>
          <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>

            {/* Active filter display pill */}
            <div style={{
              height:     '40px',
              display:    'flex',
              alignItems: 'center',
              padding:    '0 14px',
              gap:        '10px',
              background: '#ffffff',
              border:     '1px solid rgba(0,62,166,0.2)',
              borderRadius: '10px',
              boxShadow:  '0px 2px 8px rgba(0,0,0,0.06)',
              minWidth:   isMobile ? 0 : '200px',
              flex:       isMobile ? 1 : 'none',
            }}>
              <span style={{
                fontFamily:   "'Montserrat', Helvetica, Arial, sans-serif",
                fontWeight:   600,
                fontSize:     '14px',
                lineHeight:   '20px',
                color:        '#1e3a5f',
                whiteSpace:   'nowrap',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                flex:         1,
              }}>
                {activeCategory === 'All' ? 'All Discounts' : activeCategory}
              </span>
              {/* Count badge */}
              <div style={{
                background:  '#003ea6',
                borderRadius: '6px',
                minWidth:    '24px',
                height:      '20px',
                display:     'flex',
                alignItems:  'center',
                justifyContent: 'center',
                padding:     '0 6px',
                flexShrink:  0,
              }}>
                <span style={{
                  fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize:   '12px',
                  color:      '#ffffff',
                }}>
                  {categoryCounts[activeCategory]}
                </span>
              </div>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilter(f => !f)}
              style={{
                height:         '40px',
                padding:        '0 18px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '8px',
                background:     '#003ea6',                  /* ← was rgba(0,40,255,0.85) */
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
              <span style={{
                fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                fontWeight: 700,
                fontSize:   '13px',
                color:      '#FFFFFF',
                whiteSpace: 'nowrap',
              }}>
                FILTER
              </span>
            </button>

            {/* Filter dropdown */}
            {showFilter && (
              <div style={{
                position:       'absolute',
                top:            'calc(100% + 8px)',
                left:           0,
                background:     '#ffffff',                  /* ← was rgba blue blur */
                border:         '1px solid rgba(0,62,166,0.15)',
                borderRadius:   '12px',
                overflow:       'hidden',
                zIndex:         300,
                minWidth:       '220px',
                boxShadow:      '0px 8px 24px rgba(0,0,0,0.12)',
              }}>
                {categories.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    style={{
                      width:       '100%',
                      display:     'flex',
                      alignItems:  'center',
                      justifyContent: 'space-between',
                      padding:     '11px 16px',
                      background:  activeCategory === cat ? '#dbeafe' : 'transparent',
                      border:      'none',
                      borderTop:   i > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                      cursor:      'pointer',
                      transition:  'background 0.15s',
                    }}
                    onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = '#f0f4ff'; }}
                    onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                      fontSize:   '14px',
                      color:      activeCategory === cat ? '#003ea6' : '#4a5565',
                      fontWeight: activeCategory === cat ? 700 : 400,
                    }}>
                      {cat}
                    </span>
                    <div style={{
                      background:   activeCategory === cat ? '#003ea6' : '#dbeafe',
                      borderRadius: '6px',
                      padding:      '1px 7px',
                    }}>
                      <span style={{
                        fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                        fontWeight: 700,
                        fontSize:   '11px',
                        color:      activeCategory === cat ? '#ffffff' : '#003ea6',
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

        {/* ── Cards grid ────────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div style={{
            display:             'grid',
            gridTemplateColumns: cols,
            gap:                 isMobile ? '16px' : isTablet ? '20px' : '24px',
            alignItems:          'start',
          }}>
            {filtered.map(item => (
              <DiscountCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign:  'center',
            padding:    '80px 0',
            color:      '#6a7282',
            fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
            fontSize:   '15px',
          }}>
            No discounts found for this category.
          </div>
        )}

      </div>
    </div>
  );
};

export default DiscountsView;