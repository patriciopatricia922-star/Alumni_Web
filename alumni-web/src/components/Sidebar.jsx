import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import homeIcon     from '../assets/home_icn.svg';
import settingsIcon from '../assets/settings_icn.svg';
import aboutIcon    from '../assets/about_icn.svg';
import surveyIcon   from '../assets/tracer_ic.svg';
import profileIcon  from '../assets/profile_icn.svg';
import { supabase } from '../lib/supabase';
import { getResumeRoute } from '../lib/surveyProgress';
import sidebarLogo  from '../assets/new_lg.svg';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M16 17l5-5-5-5" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9"       stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Sidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [user,        setUser]        = useState(null);
  const [surveyRoute, setSurveyRoute] = useState('/survey/personal-background');
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', authUser.id)
        .single();
      if (data) setUser(data);
    };
    fetchUser();
    const resolveSurveyRoute = async () => {
      try {
        const { isSurveyComplete } = await import('../lib/surveyProgress');
        const complete = await isSurveyComplete();
        if (complete) {
          setSurveyRoute('/update-tracer');
        } else {
          const route = await getResumeRoute();
          setSurveyRoute(route);
        }
      } catch {
        setSurveyRoute('/survey/personal-background');
      }
    };
    resolveSurveyRoute();
  }, []);

  const email       = user?.email || '';
  const role        = email === 'superadmin@nu-dasma.edu.ph' ? 'Super Admin'
                    : email === 'nudaao@nu-dasma.edu.ph'     ? 'Admin'
                    : 'Alumni';
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Loading...';
  const initials    = user ? user.first_name?.charAt(0).toUpperCase() : 'U';

  const menuItems = [
    { path: '/dashboard', label: 'Home',          icon: homeIcon,    navPath: '/dashboard' },
    { path: '/survey',    label: 'Tracer Survey', icon: surveyIcon,  navPath: surveyRoute  },
    { path: '/profile',   label: 'Profile',       icon: profileIcon, navPath: '/profile'   },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // ── Mobile bottom nav ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '68px',
        background: '#001947',
        boxShadow: '0px -4px 24px rgba(0,0,0,0.35)',
        borderRadius: '20px 20px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/survey' && location.pathname.startsWith('/survey'));
          return (
            <Link key={item.path} to={item.navPath} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', flex: 1, height: '100%',
              textDecoration: 'none', position: 'relative',
            }}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: '28px', height: '3px',
                  background: '#D9CA81', borderRadius: '0 0 4px 4px',
                }} />
              )}
              <img src={item.icon} alt={item.label} style={{
                width: '21px', height: '21px',
                filter: isActive
                  ? 'brightness(0) saturate(100%) invert(77%) sepia(37%) saturate(466%) hue-rotate(6deg) brightness(95%) contrast(89%)'
                  : 'brightness(0) invert(1) opacity(0.5)',
              }} />
              <span style={{
                fontFamily: 'Arimo', fontSize: '10px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#D9CA81' : 'rgba(255,255,255,0.45)',
                maxWidth: '60px', textAlign: 'center',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '3px', flex: 1, height: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <LogoutIcon />
          <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Logout</span>
        </button>
      </nav>
    );
  }

  // ── Desktop / Tablet sidebar ─────────────────────────────────────────────────
  const sidebarW = isTablet ? '200px' : '229px';

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      width: sidebarW, height: '100vh',
      background: 'rgba(0,34,109,0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0px 10px 50px rgba(255,255,255,0.1)',
      borderRadius: '0px 15px 15px 0px',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0 24px' }}>
        <img
          src={sidebarLogo}
          alt="AlumnAI"
          style={{ marginLeft: '15px',width: isTablet ? '139px' : '159px', height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />

      {/* Menu */}
      <div style={{ padding: '20px 9px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p style={{
          fontFamily: 'Arimo', fontWeight: 600, fontSize: '10px',
          lineHeight: '15px', letterSpacing: '0.5px', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)', padding: '0 16px', margin: '0 0 8px 0',
        }}>MENU</p>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/survey' && location.pathname.startsWith('/survey'));
          return (
            <Link
              key={item.path}
              to={item.navPath}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 13px', margin: '0 6px',
                background: 'transparent',
                borderRadius: '14px', textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <img src={item.icon} alt={item.label} style={{
                width: '20px', height: '20px',
                filter: isActive
                  ? 'brightness(0) saturate(100%) invert(77%) sepia(37%) saturate(466%) hue-rotate(6deg) brightness(95%) contrast(89%)'
                  : 'brightness(0) invert(1) opacity(0.75)',
              }} />
              <span style={{
                fontFamily: 'Arimo',
                fontSize: isTablet ? '14px' : '15px',
                fontWeight: isActive ? 700 : 500,
                lineHeight: '24px', letterSpacing: '0.325px',
                // ── Only gold text as the active indicator, no pill ──
                color: isActive ? '#FFEC8E' : '#FFFFFF',
              }}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* HELP section */}
      <div style={{ padding: '16px 9px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p style={{
          fontFamily: 'Arimo', fontWeight: 600, fontSize: '10px',
          lineHeight: '15px', letterSpacing: '0.5px', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)', padding: '0 16px', margin: '0 0 8px 0',
        }}>HELP</p>

        {[
          { path: '/personal-information', label: 'Settings', icon: settingsIcon },
          { path: '/about',                         label: 'About',    icon: aboutIcon    },
        ].map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 13px', margin: '0 6px',
                background: 'transparent',
                borderRadius: '14px', textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <img src={item.icon} alt={item.label} style={{
                width: '20px', height: '20px',
                filter: isActive
                  ? 'brightness(0) saturate(100%) invert(77%) sepia(37%) saturate(466%) hue-rotate(6deg) brightness(95%) contrast(89%)'
                  : 'brightness(0) invert(1) opacity(0.75)',
              }} />
              <span style={{
                fontFamily: 'Arimo',
                fontSize: isTablet ? '14px' : '15px',
                fontWeight: isActive ? 700 : 500,
                lineHeight: '24px', letterSpacing: '0.325px',
                color: isActive ? '#FFEC8E' : '#FFFFFF',
              }}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User card + Logout at bottom */}
      <div style={{ marginTop: 'auto', padding: '0 8px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 10px 0 12px',
          gap: '10px', height: '56px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '30px',
        }}>
          {/* Avatar */}
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'linear-gradient(135deg, #51A2FF 0%, #155DFC 100%)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'Arial', fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{initials}</span>
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{
              fontFamily: 'Arial', fontSize: '12px', lineHeight: '18px',
              color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{displayName}</span>
            <span style={{ fontFamily: 'Arial', fontSize: '11px', lineHeight: '15px', color: '#D1D5DC' }}>{role}</span>
          </div>

          {/* Logout icon — inside user card, right side */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', flexShrink: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: '6px', padding: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;