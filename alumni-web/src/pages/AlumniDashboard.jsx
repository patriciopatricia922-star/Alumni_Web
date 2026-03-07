import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { loadSurveyProgress } from '../lib/surveyProgress';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const [user, setUser] = useState(null);
  const [surveyProgress, setSurveyProgress] = useState({ percentage: 0, current_route: '/survey/personal-background' });
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // Sidebar is exactly 229px — content must offset by this on desktop
  // Mobile: no sidebar (bottom nav), so no offset needed
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const sidebarWidth = 229;

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', authUser.id)
        .single();
      if (data) setUser(data);
      const progress = await loadSurveyProgress();
      if (progress) setSurveyProgress(progress);
    };
    fetchData();
  }, []);

  const firstName = user?.first_name || 'Alumni';
  const progressPercentage = surveyProgress?.percentage || 0;
  const resumeRoute = surveyProgress?.current_route || '/survey/personal-background';

  useEffect(() => {
    if (progressPercentage === 0) return;
    let start = 0;
    const end = progressPercentage;
    const duration = 1200;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setAnimatedPercentage(end); clearInterval(timer); }
      else setAnimatedPercentage(Math.floor(start));
    }, stepTime);
    return () => clearInterval(timer);
  }, [progressPercentage]);

  const forYouItems = [
    { icon: 'survey',   title: 'Alumni Survey Tracer', description: 'Update your status',       badge: true, path: '/survey/personal-background' },
    { icon: 'discount', title: 'Discounts',            description: '8 new offers available',   badge: true, path: '/discounts' },
    { icon: 'events',   title: 'Events',               description: '5 upcoming this week',     badge: true, path: '/events' },
    { icon: 'jobs',     title: 'Jobs',                 description: '3 new listings available', badge: true, path: '/jobs' },
  ];

  const announcements = [
    { title: 'Alumni Welcome Back Night',     description: 'Join us for the annual alumni welcome back event.',              time: '2 hours ago' },
    { title: 'Scholarship Applications Open', description: 'Applications for the 2026 alumni scholarship are now open.',    time: '5 hours ago' },
    { title: 'Career Fair This Friday',       description: 'Connect with top companies at our upcoming career fair.',        time: '1 day ago'   },
    { title: 'Chapter Meeting Update',        description: 'The monthly chapter meeting has been rescheduled to March 10.', time: '2 days ago'  },
  ];

  const ForYouIcon = ({ type }) => {
    if (type === 'survey') return (
      <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
        <rect x="0.5" y="0.5" width="11" height="15" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M3 5H9M3 8H9M3 11H6" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    );
    if (type === 'discount') return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13.5 2.5L2.5 13.5M5.5 4C5.5 4.82843 4.82843 5.5 4 5.5C3.17157 5.5 2.5 4.82843 2.5 4C2.5 3.17157 3.17157 2.5 4 2.5C4.82843 2.5 5.5 3.17157 5.5 4ZM13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
    if (type === 'events') return (
      <svg width="15" height="16" viewBox="0 0 15 16" fill="none">
        <rect x="0.75" y="1.75" width="13.5" height="13.5" rx="1.25" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M0.75 6H14.25" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M4.5 0.5V3M10.5 0.5V3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
    if (type === 'jobs') return (
      <svg width="18" height="17" viewBox="0 0 18 17" fill="none">
        <rect x="0.75" y="4.75" width="16.5" height="11.5" rx="1.25" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M5.5 4.5V3C5.5 2.17157 6.17157 1.5 7 1.5H11C11.8284 1.5 12.5 2.17157 12.5 3V4.5" stroke="#FFFFFF" strokeWidth="1.5"/>
      </svg>
    );
    return null;
  };

  // Shared card arrow chevron
  const Chevron = () => (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 1L5 5L1 9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Shared For You card; row layout on BOTH mobile and desktop
  const ForYouCard = ({ item }) => (
    <div
      style={{
        padding: isMobile ? '14px 16px' : '20px',
        background: 'rgba(13,19,56,0.4)',
        border: '0.89px solid rgba(255,255,255,0.1)',
        boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'row',        // no column stacking
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        transition: 'transform 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(43,114,251,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      onClick={() => navigate(item.icon === 'survey' ? resumeRoute : item.path)}
    >
      {/* Icon box + badge */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: '40px', height: '40px',
          background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
          boxShadow: '0px 10px 15px rgba(97,95,255,0.3), 0px 4px 6px rgba(43,114,251,0.15)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ForYouIcon type={item.icon} />
        </div>
        {item.badge && (
          <>
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: 'rgba(43,114,251,0.42)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: '#2B72FB', borderRadius: '50%' }} />
          </>
        )}
      </div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '14px', lineHeight: '20px', color: '#FFFFFF', margin: '0 0 2px 0' }}>{item.title}</p>
        <p style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '11px', lineHeight: '16px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{item.description}</p>
      </div>
      <Chevron />
    </div>
  );

  // Progress circle sized by prop
  const circleSize = isMobile ? 110 : isTablet ? 120 : 140;
  const circleR    = isMobile ? 45  : isTablet ? 50  : 58;
  const ProgressCircle = () => (
    <div style={{ position: 'relative', width: `${circleSize}px`, height: `${circleSize}px`, flexShrink: 0 }}>
      <svg width={circleSize} height={circleSize} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={circleSize/2} cy={circleSize/2} r={circleR} stroke="#D9CA81" strokeWidth="8" fill="none"/>
        <circle cx={circleSize/2} cy={circleSize/2} r={circleR} stroke="#2B72FB" strokeWidth="8" fill="none"
          strokeDasharray={`${2 * Math.PI * circleR}`}
          strokeDashoffset={`${2 * Math.PI * circleR * (1 - animatedPercentage / 100)}`}
          strokeLinecap="round"/>
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'Rubik, Arial', fontWeight: 700,
        fontSize: isMobile ? '24px' : '32px', lineHeight: '1',
        letterSpacing: '-0.35px', color: '#2B72FB',
      }}>
        {animatedPercentage}%
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263' }}>
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop/tablet only */}
      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        padding: isMobile ? '24px 20px 90px' : isTablet ? '40px 32px 48px' : '48px 51px 48px 48px',
        boxSizing: 'border-box',
        maxWidth: '100%',
        overflowX: 'hidden',
        position: 'relative',
      }}>

        {/* ── Notification Bell ─────────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '24px' : isTablet ? '40px' : '48px',
          right: isMobile ? '20px' : isTablet ? '32px' : '51px',
          zIndex: 10,
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
              <path d="M8.33 17.5H11.67M15 7.5C15 5.84 14.16 4.34 12.89 3.39M5 7.5C5 4.74 7.24 2.5 10 2.5C11.33 2.5 12.53 3.02 13.41 3.88M15 7.5C15 11.25 16.67 13.33 16.67 13.33H3.33C3.33 13.33 5 11.25 5 7.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '20px', height: '20px', background: '#2B72FB', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'SF Pro Display, Arial', fontSize: '10px', color: '#FFFFFF', fontWeight: 400 }}>3</span>
            </div>
          </button>
        </div>

        {/* ── Header ──────────────────────────────────────────────────────
            Show on ALL screen sizes — user wanted this kept             */}
        <div style={{ paddingRight: '64px', marginBottom: isMobile ? '20px' : '32px' }}>
          <h2 style={{
            fontFamily: 'Montserrat', fontWeight: 700,
            fontSize: isMobile ? '32px' : isTablet ? '34px' : '40px',
            lineHeight: '1.2', letterSpacing: '-1px', color: '#FFFFFF',
            margin: '0 0 4px 0',
          }}>
            Dashboard
          </h2>
          <p style={{
            fontFamily: 'Montserrat',
            fontSize: isMobile ? '13px' : '16px',
            lineHeight: '24px', color: 'rgba(255,255,255,0.7)',
            margin: isMobile ? '0 0 16px 0' : '0 0 24px 0',
          }}>
            Welcome Bark! Let's see what's new in your alumni network.
          </p>
          <h1 style={{
            fontFamily: 'Montserrat', fontWeight: 700,
            fontSize: isMobile ? '34px' : isTablet ? '36px' : '42px',
            lineHeight: '1.2', letterSpacing: '-1.05px', color: '#FFFFFF',
            margin: '0',
          }}>
            Hello, <span style={{ color: '#D9CA81' }}>{firstName}</span>
          </h1>
        </div>

        {/* ── Progress Banner ──────────────────────────────────────────────
            Always a ROW — text left, circle right. Never stacks.        */}
        <div style={{
          position: 'relative',
          width: '100%',
          padding: isMobile ? '20px' : '32px',
          background: 'linear-gradient(180deg, rgba(43,114,251,0.2) 0%, rgba(30,37,85,0.3) 100%)',
          border: '0.89px solid rgba(43,114,251,0.3)',
          borderRadius: '20px',
          marginBottom: isMobile ? '28px' : '40px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',         
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div style={{
            position: 'absolute', width: '256px', height: '256px',
            right: '-30px', top: '-127px',
            background: '#2B72FB', opacity: 0.1,
            filter: 'blur(64px)', borderRadius: '50%', pointerEvents: 'none',
          }} />
          <p style={{
            fontFamily: 'Montserrat', fontWeight: 700,
            fontSize: isMobile ? '16px' : isTablet ? '22px' : '28px',
            lineHeight: '1.4', color: '#FFFFFF',
            margin: 0, position: 'relative', flex: 1,
          }}>
            Your alumni activity engagement!
          </p>
          <ProgressCircle />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MOBILE — single column: For You list, then Announcements
        ══════════════════════════════════════════════════════════════════ */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* For You */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '22px', color: '#FFFFFF', margin: 0 }}>For You</h3>
                <span style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '13px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {forYouItems.map((item, i) => <ForYouCard key={i} item={item} />)}
              </div>
            </div>

            {/* Announcements */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '22px', color: '#FFFFFF', margin: 0 }}>Announcements</h3>
                <span onClick={() => navigate('/announcements')} style={{ fontFamily: 'Montserrat', fontWeight: 600, fontSize: '13px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map((a, i) => (
                  <div key={i} style={{
                    padding: '14px 16px',
                    background: 'rgba(13,19,56,0.4)',
                    border: '0.89px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    display: 'flex', gap: '14px', alignItems: 'center',
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '40px', height: '40px', background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)', boxShadow: '0px 8px 14px rgba(97,95,255,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M1.5 2.5H14.5V11C14.5 11.55 14.05 12 13.5 12H2.5C1.95 12 1.5 11.55 1.5 11V2.5Z" stroke="#FFFFFF" strokeWidth="1.2"/>
                          <path d="M1.5 2.5L8 8L14.5 2.5" stroke="#FFFFFF" strokeWidth="1.2"/>
                        </svg>
                      </div>
                      <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '13px', height: '13px', background: 'rgba(43,114,251,0.4)', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '9px', height: '9px', background: '#2B72FB', borderRadius: '50%' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                        <p style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '13px', lineHeight: '18px', color: '#FFFFFF', margin: 0, paddingRight: '8px' }}>{a.title}</p>
                        <span style={{ fontFamily: 'Arial', fontSize: '10px', color: 'rgba(255,255,255,0.5)', flexShrink: 0, whiteSpace: 'nowrap' }}>{a.time}</span>
                      </div>
                      <p style={{ fontFamily: 'Montserrat', fontSize: '11px', lineHeight: '17px', color: 'rgba(255,255,255,0.55)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        ) : (
        /* ══════════════════════════════════════════════════════════════════
            TABLET + DESKTOP — two-column side by side
        ══════════════════════════════════════════════════════════════════ */
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: isTablet ? '32px' : '80px',
            alignItems: 'flex-start',
          }}>
            {/* For You */}
            <div style={{ flex: isDesktop ? '0 0 360px' : '1', minWidth: 0 }}>
              <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '24px', lineHeight: '28px', letterSpacing: '-0.6px', color: '#FFFFFF', margin: '0 0 22px 0' }}>For You</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {forYouItems.map((item, i) => <ForYouCard key={i} item={item} />)}
              </div>
            </div>

            {/* Announcements */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '24px', lineHeight: '28px', letterSpacing: '-0.55px', color: '#FFFFFF', margin: '0 0 22px 0' }}>Recent Announcements</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {announcements.map((a, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    background: 'rgba(13,19,56,0.4)',
                    border: '0.89px solid rgba(255,255,255,0.1)',
                    boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                    borderRadius: '16px',
                    display: 'flex', gap: '14px', alignItems: 'center',
                  }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '40px', height: '40px', background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)', boxShadow: '0px 10px 15px rgba(97,95,255,0.3)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M1.5 2.5H14.5V11C14.5 11.55 14.05 12 13.5 12H2.5C1.95 12 1.5 11.55 1.5 11V2.5Z" stroke="#FFFFFF" strokeWidth="1.2"/>
                          <path d="M1.5 2.5L8 8L14.5 2.5" stroke="#FFFFFF" strokeWidth="1.2"/>
                        </svg>
                      </div>
                      <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: 'rgba(43,114,251,0.42)', borderRadius: '50%' }} />
                      <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: '#2B72FB', borderRadius: '50%' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <p style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.35px', color: '#FFFFFF', margin: 0 }}>{a.title}</p>
                        <span style={{ fontFamily: 'SF Pro Display, Arial', fontSize: '10px', lineHeight: '15px', color: 'rgba(255,255,255,0.7)', flexShrink: 0, marginLeft: '8px' }}>{a.time}</span>
                      </div>
                      <p style={{ fontFamily: 'Montserrat', fontSize: '11px', lineHeight: '23px', color: 'rgba(255,255,255,0.65)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AlumniDashboard;