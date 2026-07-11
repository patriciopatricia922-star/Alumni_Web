import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { truncateHtml } from '../utils/textHelpers';
import '../styles/Discounts.css';

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

// ── Linkify helper ────────────────────────────────────────────────────────────
// Converts bare URLs in an HTML string into clickable <a> tags.
// Skips URLs that are already inside an href attribute.
const linkifyHtml = (html) => {
  if (!html) return html;
  // Matches http(s):// and www. URLs that are NOT already inside href="..."
  const URL_REGEX = /(?<!href=["'])((https?:\/\/|www\.)[^\s<"')\]]+)/g;
  return html.replace(URL_REGEX, (url) => {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="discount-link">${url}</a>`;
  });
};

// ── Discount Card ─────────────────────────────────────────────────────────────
const DiscountCard = ({ item }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const images = item.images?.length ? item.images : [item.image];
  const hasMultiple = images.length > 1;

  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length); };
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length); };

  const hasDetails = item.location || item.validUntil;

  const descriptionContent = linkifyHtml(
    expanded ? item.discount : truncateHtml(item.discount, 80)
  );

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`discount-card ${hovered ? 'hovered' : ''} ${expanded ? 'expanded' : ''}`}
    >
      {/* ── Photo with discount badge + category tag ── */}
      <div className="discount-card-image-wrapper">
        <img
          src={images[imgIndex]}
          alt={item.name}
          className={`discount-card-image ${hovered ? 'hovered' : ''}`}
          onError={e => { e.target.style.background = '#dbeafe'; e.target.style.display = 'none'; }}
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

        {/* Discount % badge — top-right, red pill */}
        {item.discountPercent && (
          <div className="discount-badge">
            <span className="discount-badge-text">
              {item.discountPercent}
            </span>
          </div>
        )}

        {/* Category tag — bottom-left, white pill */}
        {item.category && (
          <div className="discount-category-tag">
            <span className="discount-category-text">
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="discount-card-body">
        {/* Title row */}
        <div className="discount-card-title-row">
          <div className="discount-card-icon"><PriceTagIcon /></div>
          <p className="discount-card-title">
            {item.name}
          </p>
        </div>

        {/* Discount description — shows truncated or full depending on expanded state */}
        <p
          className="discount-card-description"
          dangerouslySetInnerHTML={{ __html: descriptionContent }}
        />

        {/* Divider */}
        <div className="discount-card-divider" />

        {/* ── Expandable details (location + validity) ── */}
        <div className={`discount-card-details ${expanded ? 'expanded' : ''}`}>
          <div className="discount-card-details-content">
            {item.location && (
              <div className="discount-card-detail-item">
                <div className="detail-icon"><LocationIcon /></div>
                <p className="detail-text">
                  {item.location}
                </p>
              </div>
            )}
            {item.validUntil && (
              <div className="discount-card-detail-item">
                <div className="detail-icon"><CalendarIcon /></div>
                <p className="detail-text">
                  {item.validUntil}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toggle button ── */}
      {hasDetails && (
        <div className="discount-card-button-wrapper">
          <button
            onClick={() => setExpanded(v => !v)}
            className={`discount-card-toggle-btn ${expanded ? 'expanded' : ''}`}
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
  // const filterBtnRef = useRef(null);
  // const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  // const handleFilterToggle = () => {
  //   if (!showFilter && filterBtnRef.current) {
  //     const rect = filterBtnRef.current.getBoundingClientRect();
  //     setDropdownPos({
  //       top:   rect.bottom + 8,
  //       right: window.innerWidth - rect.right,
  //     });
  //   }
  //   setShowFilter(f => !f);
  // };

  return (
    <div className="discounts-view-container">
      <Sidebar />

      <div className={`discounts-main-content ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
        {/* ── Notification Bell ─────────────────────────────────────────────── */}
        <div
          ref={bellRef}
          style={{
            position: 'absolute',
            top:   isMobile ? '32px' : '45px',
            right: isMobile ? '59px' : isTablet ? '65px' : '84px',
            zIndex: 200,
          }}
        >
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              width:          isMobile ? '44px' : '52px',
              height:         isMobile ? '44px' : '52px',
              background:     showDropdown ? 'rgba(43,114,251,0.25)' : '#003EA6',
              border:         showDropdown ? '1px solid rgba(43,114,251,0.5)' : '1px solid rgba(255,255,255,0.15)',
              boxShadow:      '0px 4px 12px rgba(0,0,0,0.35)',
              borderRadius:   '14px',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              position:       'relative',
              transition:     'all 0.15s',
              flexShrink:     0,
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

          {showDropdown && (
            <div style={{
              position:      'absolute',
              top:           `calc(${isMobile ? '44px' : '52px'} + 10px)`,
              right:         0,
              width:         isMobile ? '92vw' : '380px',
              maxHeight:     '520px',
              background:    '#FFFFFF',
              backdropFilter:'blur(16px)',
              border:        '1px solid #E5E7EB',
              borderRadius:  '16px',
              boxShadow:     '0 20px 60px rgba(0,0,0,0.15)',
              display:       'flex',
              flexDirection: 'column',
              overflow:      'hidden',
              zIndex:        300,
            }}>
              <div style={{
                padding:        '16px 18px 12px',
                borderBottom:   '1px solid #F0F2F5',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                flexShrink:     0,
              }}>
                <span style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: '16px', color: '#003EA6' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ background: 'none', border: 'none', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '6px', flexShrink: 0 }}>
                {['all', 'unread'].map(t => (
                  <button
                    key={t}
                    onClick={() => setNotifTab(t)}
                    style={{
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <p style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '13px', color: 'rgba(0,0,0,0.3)', margin: 0 }}>
                        {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                      </p>
                    </div>
                  );
                  return Object.entries(groupByDate(list)).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: '10px', color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>
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
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,62,166,0.08)', border: '1px solid rgba(0,62,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round" />
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: n.read ? 400 : 700, fontSize: '13px', color: '#0A0A0A', margin: '0 0 2px 0', lineHeight: '1.4' }}>
                                {n.title}
                              </p>
                              <p style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '12px', color: '#4A5565', margin: '0 0 4px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {n.body}
                              </p>
                              <span style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '11px', color: 'rgba(0,0,0,0.35)' }}>
                                {formatTime(n.time)}
                              </span>
                            </div>
                            {!n.read && (
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#003EA6', flexShrink: 0, marginTop: '6px' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
              </div>

              <div style={{ padding: '10px 18px', borderTop: '1px solid #F0F2F5', flexShrink: 0 }}>
                <button
                  onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                  style={{ width: '100%', height: '36px', background: '#F9FAFB', border: '1px solid #D1D5DC', borderRadius: '10px', fontFamily: 'Montserrat, Arial, sans-serif', fontSize: '13px', color: '#4A5565', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F0F4FB'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
                >
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Back Button ───────────────────────────────────────────────────── */}
        <button className="back-button" onClick={() => navigate(-1)} style={{ position: 'relative', top: '-0.5px', marginLeft: '-20px' }}>
          <svg width="15" height="15" viewBox="0 0 17 17" fill="none" style={{ marginLeft: '0.5px' }}>
            <path d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
              stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className={`discounts-header ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
          <h1 className={`discounts-title ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
            Discounts
          </h1>
          <p className={`discounts-subtitle ${isMobile ? 'mobile' : ''}`}>
            Avail discounts on participating accommodations, dining, shopping, leisure, and health and wellness establishments.
          </p>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────────────────── */}
        <div style={{
          display:        'flex',
          justifyContent: 'flex-end',
          alignItems:     'center',
          marginBottom:   isMobile ? '16px' : '24px',
          marginRight:    '34.5px',
          gap:            '12px',
        }}>
          <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>

            <div style={{ position: 'relative' }}>
            <div style={{
              height:      '40px',
              display:     'flex',
              alignItems:  'center',
              padding:     '0 14px',
              gap:         '10px',
              background:  'var(--filter-bg, #ffffff)',
              border:      '1px solid var(--filter-border, rgba(0,62,166,0.15))',
              borderRadius:'10px',
              boxShadow:   '0px 2px 8px rgba(0,0,0,0.06)',
              minWidth:    isMobile ? 0 : '240px',
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
                {activeCategory === 'All' ? 'All Discounts' : activeCategory}
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
                  {categoryCounts[activeCategory]}
                </span>
              </div>
            </div>

            {showFilter && (
              <div style={{
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
                  <button
                    key={cat}
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

        {/* ── Cards grid ────────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className={`discounts-grid ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`} style={{ marginLeft: '27px', marginRight: '27.5px', marginTop: '-8px' }}>
            {filtered.map((item) => (
              <DiscountCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-discounts">
            No discounts found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountsView;