import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

// ─── Responsive hook ─────────────────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const announcements = [
  {
    id: 1,
    title: 'Alumni Welcome Back Night',
    description: 'Join us for an unforgettable evening of networking, reminiscing, and celebrating the bonds that unite our alumni community.',
    time: '2 hours ago',
  },
  {
    id: 2,
    title: 'Scholarship Applications Open',
    description: 'Enhance your professional skills with our comprehensive scholarship program. Applications are now open for the 2026 cycle.',
    time: '5 hours ago',
  },
  {
    id: 3,
    title: 'Career Fair This Friday',
    description: 'Enhance your professional skills with our comprehensive career fair. Connect with top companies and explore new opportunities.',
    time: '5 hours ago',
  },
  {
    id: 4,
    title: 'Chapter Meeting Update',
    description: 'Enhance your professional skills with our comprehensive chapter updates. The monthly meeting has been rescheduled to March 10.',
    time: '5 hours ago',
  },
];

const AnnouncementCard = ({ announcement, isMobile }) => (
  <div style={{
    background: 'rgba(13, 19, 56, 0.4)',
    border: '0.89px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    overflow: 'hidden',
  }}>
    {/* Top section */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: isMobile ? '14px 16px' : '20px 24px',
      borderBottom: '0.89px solid rgba(255, 255, 255, 0.1)',
    }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
        {/* Icon */}
        <div style={{
          width: '48px', height: '48px', flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(30, 37, 85, 0.8) 0%, rgba(15, 19, 56, 0.8) 100%)',
          boxShadow: '0px 10px 15px rgba(97, 95, 255, 0.3), 0px 4px 6px rgba(43, 114, 251, 0.15)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M1.5 3H20.5V16C20.5 16.55 20.05 17 19.5 17H2.5C1.95 17 1.5 16.55 1.5 16V3Z" stroke="#FFFFFF" strokeWidth="1.5"/>
            <path d="M1.5 3L11 11L20.5 3" stroke="#FFFFFF" strokeWidth="1.5"/>
          </svg>
        </div>
        {/* Title */}
        <h3 style={{
          fontFamily: 'Arimo, Arial', fontWeight: 700,
          fontSize: isMobile ? '14px' : '15px',
          lineHeight: '48px',
          letterSpacing: '-0.35px', color: '#FFFFFF',
          margin: 0,
        }}>
          {announcement.title}
        </h3>
      </div>
    </div>

    {/* Body */}
    <div style={{ padding: isMobile ? '12px 16px' : '16px 24px' }}>
      <p style={{
        fontFamily: 'Arimo, Arial', fontWeight: 400,
        fontSize: '14px', lineHeight: '22px',
        color: 'rgba(255, 255, 255, 0.65)',
        margin: 0,
      }}>
        {announcement.description}
      </p>
    </div>

    {/* Footer */}
    <div style={{
      padding: isMobile ? '10px 16px' : '12px 24px',
      borderTop: '0.89px solid rgba(255, 255, 255, 0.1)',
      display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17"/>
          <path d="M7 4V7.5L9.5 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17" strokeLinecap="round"/>
        </svg>
        <span style={{
          fontFamily: 'Montserrat', fontWeight: 400,
          fontSize: '12px', lineHeight: '18px',
          color: 'rgba(255, 255, 255, 0.5)',
        }}>
          {announcement.time}
        </span>
      </div>
      <button style={{
        height: '36px', padding: '0 16px',
        borderRadius: '14px', border: 'none',
        background: 'rgba(43,114,251,0.15)',
        fontFamily: 'Arimo, Arial', fontWeight: 700,
        fontSize: '13px', color: '#FFFFFF',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        See more
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1 4H7M7 4L4 1M7 4L4 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
);

const Announcements = () => {
  const [filter, setFilter] = useState('all');
  const width = useWindowWidth();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const sidebarWidth = 229;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263' }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        padding: isMobile ? '24px 20px 90px' : isTablet ? '40px 32px 48px' : '37px 51px',
        position: 'relative',
        boxSizing: 'border-box',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}>

        {/* Notification Bell */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '24px' : isTablet ? '40px' : '37px',
          right: isMobile ? '20px' : isTablet ? '32px' : '51px',
          zIndex: 50,
        }}>
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
              width: '20px', height: '20px', background: '#2B72FB', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'SF Pro Display, Arial', fontSize: '10px', color: '#FFFFFF' }}>3</span>
            </div>
          </button>
        </div>

        {/* Header */}
        <div style={{ paddingRight: '64px', marginBottom: isMobile ? '20px' : '32px' }}>
          <h1 style={{
            fontFamily: 'Montserrat', fontWeight: 700,
            fontSize: isMobile ? '32px' : isTablet ? '34px' : '40px',
            lineHeight: '1.2', letterSpacing: '-1px', color: '#FFFFFF',
            margin: '0 0 8px 0',
          }}>
            Announcements
          </h1>
          <p style={{
            fontFamily: 'Montserrat', fontWeight: 400,
            fontSize: isMobile ? '13px' : '16px', lineHeight: '22px',
            color: 'rgba(255,255,255,0.6)', margin: 0,
          }}>
            Stay connected with the latest news, events, and opportunities from your alumni community.
          </p>
        </div>

        {/* Featured Banner — hidden on mobile to save space, shown on tablet+ */}
        {!isMobile && (
          <div style={{
            position: 'relative',
            padding: isTablet ? '20px 24px' : '24px 32px',
            background: 'linear-gradient(180deg, rgba(43,114,251,0.2) 0%, rgba(30,37,85,0.3) 100%)',
            border: '0.89px solid rgba(43,114,251,0.3)',
            borderRadius: '24px',
            marginBottom: '40px',
            overflow: 'hidden',
            display: 'flex', gap: '24px', alignItems: 'center',
          }}>
            <div style={{
              position: 'absolute', width: '256px', height: '256px',
              right: '-30px', top: '-127px',
              background: '#2B72FB', opacity: 0.1,
              filter: 'blur(64px)', borderRadius: '50%', pointerEvents: 'none',
            }} />
            {/* Big Icon */}
            <div style={{
              width: '80px', height: '80px', flexShrink: 0,
              background: 'linear-gradient(180deg, rgba(43,114,251,0.4) 0%, rgba(30,37,85,0.6) 100%)',
              border: '0.89px solid rgba(255,255,255,0.2)',
              boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              alignSelf: 'flex-start',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M2 5H30V24C30 24.55 29.55 25 29 25H3C2.45 25 2 24.55 2 24V5Z" stroke="#FFFFFF" strokeWidth="2"/>
                <path d="M2 5L16 17L30 5" stroke="#FFFFFF" strokeWidth="2"/>
              </svg>
            </div>
            {/* Content */}
            <div style={{ flex: 1, position: 'relative' }}>
              <h2 style={{
                fontFamily: 'Arimo, Arial', fontWeight: 700,
                fontSize: isTablet ? '20px' : '25px', lineHeight: '1.3',
                letterSpacing: '-0.35px', color: '#FFFFFF', margin: '0 0 10px 0',
              }}>
                Alumni Tracer Survey
              </h2>
              <p style={{
                fontFamily: 'SF Pro Display, Arial', fontWeight: 400,
                fontSize: '14px', lineHeight: '22px',
                color: 'rgba(255,255,255,0.65)', margin: '0 0 16px 0',
              }}>
                Join us for an unforgettable evening of networking, reminiscing, and celebrating the bonds that unite our alumni community. Your participation helps us improve our programs.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17"/>
                    <path d="M7 4V7.5L9.5 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.17" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontFamily: 'SF Pro Display, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>2 hours ago</span>
                </div>
                <button style={{
                  height: '36px', padding: '0 20px',
                  borderRadius: '14px', border: 'none',
                  background: 'rgba(43,114,251,0.25)',
                  fontFamily: 'Arimo, Arial', fontWeight: 700,
                  fontSize: '13px', color: '#FFFFFF',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  See more
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4H7M7 4L4 1M7 4L4 7" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? '16px' : '24px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(90deg, #1E2555 0%, rgba(15,19,56,0.7) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '10px', padding: '8px 12px',
          }}>
            <span style={{
              fontFamily: 'Arimo, Arial', fontWeight: 400,
              fontSize: '14px', lineHeight: '20px',
              color: 'rgba(255,255,255,0.9)',
            }}>
              All Posts
            </span>
            <div style={{
              background: '#2B72FB', borderRadius: '8px',
              padding: '2px 8px',
              fontFamily: 'Arimo, Arial', fontWeight: 700,
              fontSize: '12px', lineHeight: '16px', color: '#FFFFFF',
            }}>
              {announcements.length}
            </div>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px',
            background: 'linear-gradient(180deg, rgba(30,37,85,0.7) 0%, rgba(15,19,56,0.7) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M4 8H12M6 12H10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{
              fontFamily: 'Arimo, Arial', fontWeight: 700,
              fontSize: '13px', lineHeight: '14px', color: '#FFFFFF',
            }}>
              FILTER
            </span>
          </button>
        </div>

        {/* Cards
            Desktop: 2-column grid
            Tablet:  2-column grid (narrower)
            Mobile:  single column  */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '14px' : '24px',
        }}>
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} isMobile={isMobile} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Announcements;