import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaChevronRight,
  FaArrowLeft,
  FaFilter,
  FaBell,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import { truncateHtml, createMarkup, stripHtml } from '../utils/textHelpers';

// ── Icons ──────────────────────────────────────────────────────────────────────
const CalendarIcon   = () => <FaCalendarAlt    size={13} color="rgba(255,255,255,0.7)" />;
const ClockIcon      = () => <HiOutlineClock   size={13} color="rgba(255,255,255,0.55)" />;
const LocationIcon   = () => <HiOutlineLocationMarker size={13} color="rgba(255,255,255,0.55)" />;

const CategoryIcon = ({ category }) =>
  category === 'Exclusive Events'
    ? <FaStar size={13} color="#FAC775" />
    : <HiOutlineCalendar size={13} color="#51A2FF" />;

// ── Event Card — with expand toggle (NO MODAL) ────────────────────────────────
const EventCard = ({ event, isMobile }) => {
  const [hovered,  setHovered]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isExclusive    = event.category === 'Exclusive Events';
  const categoryColor  = isExclusive ? '#FAC775' : '#51A2FF';
  const categoryBg     = isExclusive ? 'rgba(250,199,117,0.15)' : 'rgba(81,162,255,0.15)';

  const getEventImage = () => {
    if (event.image_url) return event.image_url;
    return isExclusive
      ? 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80'
      : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80';
  };

  const formatEventDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const formatEventTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const hasDetails = event.location || event.event_date;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   'rgba(0,62,166,0.35)',
        marginTop:    '1px',
        border:       `0.889px solid ${hovered ? categoryColor : 'rgba(255,255,255,0.2)'}`,
        boxShadow:    hovered
          ? `0px 0px 20px ${categoryColor}40, 0px 8px 24px rgba(0,0,0,0.4)`
          : '0px 0px 8px rgba(255,255,255,0.25)',
        borderRadius: '16px',
        overflow:     'hidden',
        display:      'flex',
        flexDirection: 'column',
        transform:    hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition:   'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* ── Photo ── */}
      <div style={{ width: '100%', height: '214px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
        <img
          src={getEventImage()}
          alt={event.name || event.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            display: 'block',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.35s ease',
            boxShadow: '0px 4px 4px rgba(255,255,255,0.2)',
          }}
          onError={e => {
            e.target.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80';
          }}
        />
        {/* Category badge */}
        <div style={{
          position:   'absolute', top: '12px', left: '12px',
          background: categoryBg,
          border:     `1px solid ${categoryColor}`,
          borderRadius: '20px',
          padding:    '4px 12px',
          display:    'flex', alignItems: 'center', gap: '6px',
        }}>
          <CategoryIcon category={event.category} />
          <span style={{
            fontFamily: 'Arimo, Arial', fontSize: '11px', fontWeight: 700,
            color: categoryColor, textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {isExclusive ? 'Exclusive' : 'Upcoming'}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '20px 24px 0', flex: 1 }}>
        {/* Title */}
        <p style={{
          fontFamily: 'Arimo, Arial', fontWeight: 700,
          fontSize: '16px', lineHeight: '24px',
          color: '#FFED97', margin: '0 0 6px 0',
        }}>
          {event.name || event.title}
        </p>

        {/* Description - strip HTML for clean preview */}
        <p style={{
          fontFamily: 'Arimo, Arial', fontWeight: 400,
          fontSize: '12px', lineHeight: '18px',
          color: 'rgba(255,255,255,0.65)', margin: '0 0 14px 0',
          display:            '-webkit-box',
          WebkitLineClamp:    expanded ? 'none' : 2,
          WebkitBoxOrient:    'vertical',
          overflow:           'hidden',
        }}>
          {truncateHtml(event.description, expanded ? 500 : 100)}
        </p>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: '12px' }} />

        {/* ── Expandable details section ── */}
        <div style={{
          overflow:   'hidden',
          maxHeight:  expanded ? '200px' : '0px',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{ paddingBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {event.location && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ marginTop: '2px', flexShrink: 0 }}><LocationIcon /></div>
                <p style={{
                  fontFamily: 'Arimo, Arial', fontWeight: 600,
                  fontSize: '12px', lineHeight: '18px',
                  color: '#FFFFFF', margin: 0,
                }}>
                  {event.location}
                </p>
              </div>
            )}
            {event.event_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flexShrink: 0 }}><CalendarIcon /></div>
                <p style={{
                  fontFamily: 'Arimo, Arial', fontWeight: 600,
                  fontSize: '12px', lineHeight: '18px',
                  color: '#FFFFFF', margin: 0,
                }}>
                  {formatEventDate(event.event_date)}
                </p>
              </div>
            )}
            {event.event_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flexShrink: 0 }}><ClockIcon /></div>
                <p style={{
                  fontFamily: 'Arimo, Arial', fontWeight: 600,
                  fontSize: '12px', lineHeight: '18px',
                  color: 'rgba(255,255,255,0.7)', margin: 0,
                }}>
                  {formatEventTime(event.event_date)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toggle button (expand/collapse only, NO modal) ── */}
      {hasDetails && (
        <div style={{ padding: '0 19px 20px' }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              width:        '100%',
              height:       '37px',
              background:   expanded
                ? 'rgba(255,255,255,0.06)'
                : isExclusive
                  ? 'rgba(250,199,117,0.15)'
                  : 'rgba(0,40,255,0.7)',
              boxShadow:    '0px 2px 2px rgba(255,255,255,0.25)',
              border:       expanded
                ? '1px solid rgba(255,255,255,0.12)'
                : isExclusive
                  ? `1px solid ${categoryColor}`
                  : 'none',
              borderRadius: '14px',
              fontFamily:   'Arimo, Arial',
              fontWeight:   700,
              fontSize:     '13px',
              lineHeight:   '38px',
              textAlign:    'center',
              color:        expanded ? 'rgba(255,255,255,0.7)' : isExclusive ? '#FAC775' : '#FFFFFF',
              cursor:       'pointer',
              transition:   'background 0.15s, color 0.15s',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              gap:          '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
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

// ── Main View (NO modal) ──────────────────────────────────────────────────────
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
  const cols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';

  const featuredEvent  = filtered.find(e => e.category === 'Exclusive Events') || filtered[0];
  const regularEvents  = filtered.filter(e => e.id !== featuredEvent?.id);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial, sans-serif' }}>
      <Sidebar />

      <div style={{
        marginLeft:  isMobile ? 0 : `${sidebarWidth}px`,
        flex:        1,
        padding:     isMobile ? '24px 16px 90px' : isTablet ? '37px 28px 48px' : '37px 51px 60px',
        boxSizing:   'border-box',
        overflowX:   'hidden',
        position:    'relative',
      }}>

        {/* ── Notification Bell ── (keep as is - same as before) ── */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top:      isMobile ? '24px' : '37px',
          right:    isMobile ? '16px' : isTablet ? '28px' : '51px',
          zIndex:   200,
        }}>
          <button onClick={() => setShowDropdown(v => !v)} style={{
            width:      isMobile ? '44px' : '58px',
            height:     isMobile ? '44px' : '58px',
            background: showDropdown ? 'rgba(43,114,251,0.2)' : 'rgba(0,62,166,0.35)',
            border:     showDropdown ? '1.24px solid rgba(43,114,251,0.5)' : '1.24px solid rgba(255,255,255,0.9)',
            boxShadow:  '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'all 0.15s',
          }}>
            <FaBell size={22} color="#FFFFFF" />
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
                }}>
                  <span style={{ fontFamily: 'Arimo', fontSize: '9px', color: '#FFFFFF' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              </div>
            )}
          </button>

          {/* Notification dropdown (keep as is - no changes) */}
          {showDropdown && (
            <div style={{
              position: 'absolute', top: isMobile ? '52px' : '70px', right: 0,
              width: isMobile ? '90vw' : '380px', maxHeight: '520px',
              background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300,
            }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>Notifications</span>
                {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0 }}>Mark all read</button>}
              </div>
              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                {['all', 'unread'].map(t => (
                  <button key={t} onClick={() => setNotifTab(t)} style={{
                    height: '32px', padding: '0 16px',
                    background: notifTab === t ? '#2B72FB' : 'transparent',
                    border: notifTab === t ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '20px', cursor: 'pointer',
                    fontFamily: 'Arimo', fontSize: '13px', fontWeight: notifTab === t ? 700 : 400,
                    color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize',
                  }}>
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

        {/* ── Back Button ── */}
        <button onClick={() => navigate('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, marginBottom: isMobile ? '16px' : '24px',
        }}>
          <FaArrowLeft size={14} color="#FFFFFF" />
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* ── Header ── */}
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
            Stay updated with upcoming activities and gatherings designed to keep you engaged with the alumni community
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: isMobile ? '16px' : '28px', gap: '12px' }}>
          <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
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
              <span style={{ fontFamily: 'Arimo', fontSize: '14px', color: 'rgba(255,255,255,0.9)', flex: 1 }}>
                {activeCategory}
              </span>
              <div style={{ background: '#2B72FB', borderRadius: '8px', minWidth: '22.63px', height: '19.98px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>{filtered.length}</span>
              </div>
            </div>
            <button onClick={() => setShowFilter(f => !f)} style={{
              height: '37px', padding: '0 18px',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,40,255,0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', cursor: 'pointer',
              filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <FaFilter size={12} color="#FFFFFF" />
              <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>FILTER</span>
            </button>
            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: 'rgba(0,62,166,0.55)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                overflow: 'hidden', zIndex: 300, minWidth: '220px',
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
                    <span style={{ fontSize: '14px', color: activeCategory === cat ? '#FFFFFF' : 'rgba(255,255,255,0.7)', fontWeight: activeCategory === cat ? 700 : 400 }}>{cat}</span>
                    <div style={{ background: activeCategory === cat ? '#2B72FB' : 'rgba(43,114,251,0.25)', borderRadius: '6px', padding: '1px 7px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF' }}>{categoryCounts[cat]}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Featured Event (NO modal, just clickable to expand?) Actually keep as is with button ── */}
        {featuredEvent && activeCategory === 'All Events' && regularEvents.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(43,114,251,0.2) 0%, rgba(30,37,85,0.3) 100%)',
            border: '1px solid rgba(43,114,251,0.3)',
            borderRadius: '20px', marginBottom: '32px', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ width: isMobile ? '100%' : '280px', height: isMobile ? '180px' : '200px', overflow: 'hidden' }}>
                <img
                  src={featuredEvent.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80'}
                  alt={featuredEvent.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: isMobile ? '20px' : '24px 28px', flex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(250,199,117,0.15)', border: '1px solid #FAC775', borderRadius: '20px', padding: '4px 12px', marginBottom: '12px' }}>
                  <FaStar size={12} color="#FAC775" />
                  <span style={{ fontFamily: 'Arimo', fontSize: '11px', fontWeight: 700, color: '#FAC775', textTransform: 'uppercase' }}>Featured Event</span>
                </div>
                <h2 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isMobile ? '22px' : '28px', color: '#FFED97', margin: '0 0 12px 0' }}>
                  {featuredEvent.title}
                </h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px 0' }}>
                  {stripHtml(featuredEvent.description).substring(0, 150)}...
                </p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCalendarAlt size={12} color="rgba(255,255,255,0.7)" />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                      {new Date(featuredEvent.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {featuredEvent.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaMapMarkerAlt size={12} color="rgba(255,255,255,0.7)" />
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{featuredEvent.location}</span>
                    </div>
                  )}
                </div>
                <button style={{
                  height: '42px', padding: '0 28px',
                  background: 'linear-gradient(135deg, rgba(250,199,117,0.9) 0%, rgba(255,180,50,0.9) 100%)',
                  border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', color: '#0A0A0A', cursor: 'pointer',
                }}>
                  Register Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Events Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: cols,
          gap: isMobile ? '16px' : isTablet ? '20px' : '24px',
          alignItems: 'start',
        }}>
          {(activeCategory === 'All Events' ? regularEvents : filtered).map(event => (
            <EventCard key={event.id} event={event} isMobile={isMobile} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>
            No events found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsView;