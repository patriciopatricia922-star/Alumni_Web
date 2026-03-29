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
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';

// ── Icons ──────────────────────────────────────────────────────────────────────
const CalendarIcon = () => <FaCalendarAlt size={14} color="rgba(255,255,255,0.8)" />;
const ClockIcon = () => <HiOutlineClock size={14} color="rgba(255,255,255,0.5)" />;
const LocationIcon = () => <HiOutlineLocationMarker size={14} color="rgba(255,255,255,0.5)" />;

const CategoryIcon = ({ category }) => {
  if (category === 'Exclusive Events') {
    return <FaStar size={14} color="#FAC775" />;
  }
  return <HiOutlineCalendar size={14} color="#51A2FF" />;
};

// ── Event Card (Pubmat-style) ─────────────────────────────────────────────────
const EventCard = ({ event, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  
  const getEventImage = () => {
    if (event.image_url) return event.image_url;
    if (event.category === 'Exclusive Events') {
      return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80';
  };

  const formatEventDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatEventTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isExclusive = event.category === 'Exclusive Events';
  const categoryColor = isExclusive ? '#FAC775' : '#51A2FF';
  const categoryBg = isExclusive ? 'rgba(250,199,117,0.15)' : 'rgba(81,162,255,0.15)';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(0,62,166,0.35)',
        backdropFilter: 'blur(10px)',
        border: `0.889px solid ${hovered ? categoryColor : 'rgba(255,255,255,0.2)'}`,
        boxShadow: hovered ? `0px 0px 20px ${categoryColor}40, 0px 8px 24px rgba(0,0,0,0.4)` : '0px 2px 2px rgba(255,255,255,0.25)',
        borderRadius: '20px',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image Section */}
      <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
        <img
          src={getEventImage()}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80';
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(0,34,109,0.85) 0%, rgba(0,34,109,0) 100%)',
        }} />
        
        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: categoryBg,
          border: `1px solid ${categoryColor}`,
          borderRadius: '20px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <CategoryIcon category={event.category} />
          <span style={{
            fontFamily: 'Arimo, Arial',
            fontSize: '11px',
            fontWeight: 700,
            color: categoryColor,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {event.category === 'Exclusive Events' ? 'Exclusive' : 'Upcoming'}
          </span>
        </div>
        
        {/* Date Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <CalendarIcon />
          <span style={{
            fontFamily: 'Arimo, Arial',
            fontSize: '12px',
            fontWeight: 600,
            color: '#FFFFFF',
          }}>
            {formatEventDate(event.event_date)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '18px 20px', flex: 1 }}>
        <h3 style={{
          fontFamily: 'Arimo, Arial',
          fontWeight: 700,
          fontSize: '18px',
          lineHeight: '1.3',
          color: '#FFED97',
          margin: '0 0 8px 0',
        }}>
          {event.title}
        </h3>
        
        <p style={{
          fontFamily: 'Arimo, Arial',
          fontWeight: 400,
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'rgba(255,255,255,0.7)',
          margin: '0 0 16px 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
        }}>
          {event.description?.replace(/<[^>]*>/g, '')}
        </p>

        {/* Location & Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LocationIcon />
              <span style={{
                fontFamily: 'Arimo, Arial',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)',
              }}>
                {event.location}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClockIcon />
            <span style={{
              fontFamily: 'Arimo, Arial',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
            }}>
              {formatEventTime(event.event_date)}
            </span>
          </div>
        </div>

        {/* Button */}
        <button
          style={{
            width: '100%',
            height: '40px',
            background: isExclusive 
              ? 'linear-gradient(135deg, rgba(250,199,117,0.9) 0%, rgba(255,180,50,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(0,40,255,0.85) 0%, rgba(21,93,252,0.85) 100%)',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'Arimo, Arial',
            fontWeight: 700,
            fontSize: '13px',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.85';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          View Details
          <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
};

// ── Main View ──────────────────────────────────────────────────────────────────
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
  
  const featuredEvent = filtered.find(e => e.category === 'Exclusive Events') || filtered[0];
  const regularEvents = filtered.filter(e => e.id !== featuredEvent?.id);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial, sans-serif' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        padding: isMobile ? '24px 16px 90px' : isTablet ? '37px 28px 48px' : '37px 51px 60px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative',
      }}>

        {/* Notification Bell */}
        <div ref={bellRef} style={{
          position: 'absolute',
          top: isMobile ? '24px' : '37px',
          right: isMobile ? '16px' : isTablet ? '28px' : '51px',
          zIndex: 200,
        }}>
          <button onClick={() => setShowDropdown(v => !v)} style={{
            width: isMobile ? '44px' : '58px',
            height: isMobile ? '44px' : '58px',
            background: showDropdown ? 'rgba(43,114,251,0.2)' : 'rgba(0,62,166,0.35)',
            border: showDropdown ? '1.24px solid rgba(43,114,251,0.5)' : '1.24px solid rgba(255,255,255,0.9)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
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
          {/* Notification dropdown content - same structure */}
        </div>

        {/* Back Button */}
        <button onClick={() => navigate('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, marginBottom: isMobile ? '16px' : '24px',
        }}>
          <FaArrowLeft size={14} color="#FFFFFF" />
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* Header */}
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

        {/* Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: isMobile ? '16px' : '28px', gap: '12px' }}>
          <div ref={filterRef} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <div style={{
              height: '37px', display: 'flex', alignItems: 'center',
              padding: '0 12px', gap: '8px',
              background: 'rgba(0,62,166,0.35)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px',
              minWidth: isMobile ? 0 : '211px',
              flex: isMobile ? 1 : 'none',
            }}>
              <span style={{ fontFamily: 'Arimo', fontSize: '14px', color: 'rgba(255,255,255,0.9)', flex: 1 }}>
                {activeCategory}
              </span>
              <div style={{ background: '#2B72FB', borderRadius: '8px', minWidth: '22.63px', height: '19.98px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                  {filtered.length}
                </span>
              </div>
            </div>
            <button onClick={() => setShowFilter(f => !f)} style={{
              height: '37px', padding: '0 18px',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,40,255,0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', cursor: 'pointer',
            }}>
              <FaFilter size={12} color="#FFFFFF" />
              <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>FILTER</span>
            </button>
            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: 'rgba(0,62,166,0.55)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', overflow: 'hidden',
                zIndex: 300, minWidth: '220px',
              }}>
                {categories.map((cat, i) => (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: activeCategory === cat ? 'rgba(43,114,251,0.25)' : 'transparent',
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      cursor: 'pointer',
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

        {/* Featured Event */}
        {featuredEvent && activeCategory === 'All Events' && regularEvents.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(43,114,251,0.2) 0%, rgba(30,37,85,0.3) 100%)',
            border: '1px solid rgba(43,114,251,0.3)',
            borderRadius: '20px',
            marginBottom: '32px',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{
                width: isMobile ? '100%' : '280px',
                height: isMobile ? '180px' : '200px',
                overflow: 'hidden',
              }}>
                <img
                  src={featuredEvent.image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80'}
                  alt={featuredEvent.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: isMobile ? '20px' : '24px 28px', flex: 1 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(250,199,117,0.15)',
                  border: '1px solid #FAC775',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  marginBottom: '12px',
                }}>
                  <FaStar size={12} color="#FAC775" />
                  <span style={{ fontFamily: 'Arimo', fontSize: '11px', fontWeight: 700, color: '#FAC775', textTransform: 'uppercase' }}>
                    Featured Event
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'Arimo, Arial',
                  fontWeight: 700,
                  fontSize: isMobile ? '22px' : '28px',
                  color: '#FFED97',
                  margin: '0 0 12px 0',
                }}>
                  {featuredEvent.title}
                </h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px 0' }}>
                  {featuredEvent.description?.replace(/<[^>]*>/g, '').substring(0, 150)}...
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
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                        {featuredEvent.location}
                      </span>
                    </div>
                  )}
                </div>
                <button style={{
                  height: '42px',
                  padding: '0 28px',
                  background: 'linear-gradient(135deg, rgba(250,199,117,0.9) 0%, rgba(255,180,50,0.9) 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#0A0A0A',
                  cursor: 'pointer',
                }}>
                  Register Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: isMobile ? '16px' : isTablet ? '20px' : '24px' }}>
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