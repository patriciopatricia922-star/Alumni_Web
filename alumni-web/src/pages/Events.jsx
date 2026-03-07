import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const EVENTS = [
  {
    id: 1,
    name: '[Event Name]',
    date: 'February 19, 2026',
    time: '11 AM - 1 PM',
    description: 'Join us for the annual alumni welcome back event.',
  },
  {
    id: 2,
    name: '[Event Name]',
    date: 'February 19, 2026',
    time: '11 AM - 1 PM',
    description: 'Join us for the annual alumni welcome back event.',
  },
  {
    id: 3,
    name: '[Event Name]',
    date: 'February 19, 2026',
    time: '11 AM - 1 PM',
    description: 'Join us for the annual alumni welcome back event.',
  },
  {
    id: 4,
    name: '[Event Name]',
    date: 'February 19, 2026',
    time: '11 AM - 1 PM',
    description: 'Join us for the annual alumni welcome back event.',
  },
  {
    id: 5,
    name: '[Event Name]',
    date: 'February 19, 2026',
    time: '11 AM - 1 PM',
    description: 'Join us for the annual alumni welcome back event.',
  },
];

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="16" height="15" rx="2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
    <path d="M2 7h16" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
    <path d="M6 1v4M14 1v4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
    <path d="M7 4v3l2 1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3" r="1.2" fill="rgba(255,255,255,0.4)" />
    <circle cx="8" cy="8" r="1.2" fill="rgba(255,255,255,0.4)" />
    <circle cx="8" cy="13" r="1.2" fill="rgba(255,255,255,0.4)" />
  </svg>
);

const EventCard = ({ event }) => (
  <div style={{
    background: 'rgba(13, 19, 56, 0.4)',
    border: '1.24px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '16px',
    overflow: 'hidden',
    flex: '1 1 calc(50% - 12px)',
    minWidth: '0',
    maxWidth: 'calc(50% - 12px)',
  }}>
    {/* Card Header */}
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '20px 20px 20px 24px',
      borderBottom: '0.89px solid rgba(255, 255, 255, 0.1)',
    }}>
      {/* Calendar icon box */}
      <div style={{
        width: '48px',
        height: '48px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(30, 37, 85, 0.8) 0%, rgba(15, 19, 56, 0.8) 100%)',
        boxShadow: '0px 10px 15px rgba(97, 95, 255, 0.3), 0px 4px 6px rgba(43, 114, 251, 0.15)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CalendarIcon />
      </div>

      {/* Event name + date */}
      <div style={{ flex: 1, paddingLeft: '16px' }}>
        <p style={{
          fontFamily: 'Arimo',
          fontWeight: 400,
          fontSize: '15px',
          lineHeight: '22px',
          letterSpacing: '-0.35px',
          color: '#FFFFFF',
          margin: '0 0 4px 0',
        }}>
          {event.name}
        </p>
        <p style={{
          fontFamily: 'Arimo',
          fontWeight: 700,
          fontSize: '12px',
          lineHeight: '20px',
          letterSpacing: '-0.35px',
          color: '#FFFFFF',
          margin: 0,
        }}>
          {event.date}
        </p>
      </div>

      {/* More icon */}
      <div style={{ paddingTop: '4px', cursor: 'pointer' }}>
        <MoreIcon />
      </div>
    </div>

    {/* Description */}
    <div style={{ padding: '16px 24px 0px 24px' }}>
      <p style={{
        fontFamily: 'Arimo',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '23px',
        color: 'rgba(255, 255, 255, 0.65)',
        margin: 0,
      }}>
        {event.description}
      </p>
    </div>

    {/* Card Footer */}
    <div style={{
      borderTop: '1.24px solid rgba(255, 255, 255, 0.1)',
      margin: '16px 0 0 0',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      <ClockIcon />
      <span style={{
        fontFamily: 'Arimo',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '16px',
        color: 'rgba(255, 255, 255, 0.5)',
      }}>
        {event.time}
      </span>
    </div>
  </div>
);

const Events = () => {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Posts');
  const filterRef = useRef(null);

  const FILTERS = ['All Posts', 'Upcoming', 'Past Events'];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#002263',
      fontFamily: 'Arimo, Arial, sans-serif',
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{
        marginLeft: '229px',
        flex: 1,
        padding: '37px 51px 60px 48px',
        minHeight: '100vh',
        position: 'relative',
      }}>

        {/* Notification Bell - top right */}
        <div style={{ position: 'absolute', top: '37px', right: '51px' }}>
          <button style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
            border: '1.24px solid rgba(255,255,255,0.1)',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '20px', height: '20px',
              background: '#2B72FB', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', color: '#FFFFFF' }}>3</span>
            </div>
          </button>
        </div>

        {/* Back Button - top left */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, marginBottom: '24px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'Arial',
            fontWeight: 700,
            fontSize: '40px',
            lineHeight: '48px',
            letterSpacing: '-1px',
            color: '#FFFFFF',
            margin: '0 0 4px 0',
          }}>
            Events
          </h1>
          <p style={{
            fontFamily: 'Arimo',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
          }}>
            Stay connected with the latest news, events, and opportunities.
          </p>
        </div>

        {/* Filter Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: '28px',
          gap: '12px',
          position: 'relative',
        }}>
          {/* Active filter label + count */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 14px',
            background: 'linear-gradient(90deg, #1E2555 0%, rgba(15, 19, 56, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            minWidth: '210px',
          }}>
            <span style={{
              fontFamily: 'Arimo', fontSize: '14px', lineHeight: '20px',
              color: 'rgba(255,255,255,0.9)', flex: 1,
            }}>
              {activeFilter}
            </span>
            <div style={{
              background: '#2B72FB', borderRadius: '8px',
              padding: '1px 7px', minWidth: '22px', textAlign: 'center',
            }}>
              <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>
                {EVENTS.length}
              </span>
            </div>
          </div>

          {/* Filter Button */}
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilter(f => !f)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 18px',
                background: 'linear-gradient(180deg, rgba(30, 37, 85, 0.7) 0%, rgba(15, 19, 56, 0.7) 100%)',
                border: showFilter ? '1px solid rgba(43,114,251,0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M7 12h10M11 18h2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{
                fontFamily: 'Arimo', fontWeight: 700, fontSize: '13px',
                color: '#FFFFFF', letterSpacing: '0.5px',
              }}>
                FILTER
              </span>
            </button>

            {/* Dropdown */}
            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'linear-gradient(180deg, #1E2555 0%, #0F1338 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', overflow: 'hidden',
                zIndex: 50, minWidth: '200px',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.4)',
              }}>
                {FILTERS.map((filter, i) => (
                  <button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setShowFilter(false); }}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: activeFilter === filter ? 'rgba(43,114,251,0.15)' : 'transparent',
                      border: 'none',
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { if (activeFilter !== filter) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (activeFilter !== filter) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontFamily: 'Arimo', fontSize: '14px',
                      color: activeFilter === filter ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                      fontWeight: activeFilter === filter ? 700 : 400,
                    }}>
                      {filter}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Events Grid - 2 columns */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          {EVENTS.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Events;