import React from 'react';
import { Link } from 'react-router-dom';

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M16 17l5-5-5-5" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9"       stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SidebarView = ({
  location,
  isMobile,
  isTablet,
  user,
  role,
  displayName,
  initials,
  menuItems,
  helpItems,
  sidebarLogo,
  handleLogout,
  onNavClick,   // ← required: called for every menu item click (includes DPA gate)
}) => {

  // ── Mobile bottom nav ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '68px',
        background: '#00226D',
        boxShadow: '0px -4px 24px rgba(0,0,0,0.35)',
        borderRadius: '20px 20px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/survey' && location.pathname.startsWith('/survey'));
          return (
            // FIX: use button + onNavClick instead of <Link> so the DPA gate
            // in Sidebar.jsx (handleNavClick → requestNavigation) is always invoked.
            <button
              key={item.path}
              onClick={() => onNavClick(item)}
              disabled={item.loading}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '3px', flex: 1, height: '100%',
                background: 'none', border: 'none', cursor: item.loading ? 'not-allowed' : 'pointer',
                padding: 0, position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: '28px', height: '3px',
                  background: '#FFEC8E', borderRadius: '0 0 4px 4px',
                }} />
              )}
              <img src={item.icon} alt={item.label}
              style={{
                width: '21px', height: '21px',
                filter: isActive
                  ? 'brightness(0) saturate(100%) invert(77%) sepia(37%) saturate(466%) hue-rotate(6deg) brightness(95%) contrast(89%)'
                  : 'brightness(0) invert(1) opacity(0.5)',
              }} />
              <span style={{
                fontFamily: 'Montserrat', fontSize: '10px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#FFEC8E' : 'rgba(255,255,255,0.45)',
                maxWidth: '60px', textAlign: 'center',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.label}
              </span>
            </button>
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
          <span style={{ fontFamily: 'Montserrat', fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Logout</span>
        </button>
      </nav>
    );
  }

  // ── Desktop / Tablet sidebar ───────────────────────────────────────────────
  const sidebarW = isTablet ? '200px' : '228px';

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      width: sidebarW, height: '100vh',
      background: '#00226D',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0px 10px 50px rgba(0,0,0,0.5)',
      borderRadius: '0px 40px 40px 0px',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      boxSizing: 'border-box',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0 20px' }}>
        <img
          src={sidebarLogo}
          alt="AlumnAI"
          style={{
            marginRight: '20px',
            marginTop: '-30px',
            width: isTablet ? '169px' : '242px',
            height: 'auto',
            objectFit: 'contain',
            marginBottom: '-30px',
          }}
        />
      </div>

      {/* Divider under logo */}
      <div style={{
        height: '1px',
        marginTop: '-1vw',
        background: 'rgba(255, 255, 255, 0.15)',
        margin: '0 20px 4px',
        flexShrink: 0,
      }} />

      {/* MENU section */}
      <div style={{ marginTop: '1.9vw', padding: '16px 11px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{
          fontFamily: 'Montserrat', fontWeight: 600, fontSize: '10px',
          lineHeight: '15px', letterSpacing: '0.5px', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.9)', padding: '0 14px', margin: '0 0 8px 0',
        }}>MENU</p>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/survey' && location.pathname.startsWith('/survey'));

          // FIX: render as a styled button that always calls onNavClick.
          // This ensures every entry point — including new-user first-time visits
          // and resume actions — passes through the DPA gate in Sidebar.jsx
          // before any survey route is resolved and navigated to.
          return (
            <button
              key={item.path}
              onClick={() => onNavClick(item)}
              disabled={item.loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 13px',
                margin: '0 6.5px',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderRadius: '14px',
                border: 'none',
                cursor: item.loading ? 'not-allowed' : 'pointer',
                width: 'calc(100% - 13px)',
                textAlign: 'left',
                transition: 'background 0.15s ease',
              }}
            >
              <img src={item.icon} alt={item.label} style={{
                width: '13.2px', height: '13.2px', flexShrink: 0,
                filter: isActive
                  ? 'brightness(0) saturate(100%) invert(88%) sepia(40%) saturate(400%) hue-rotate(6deg) brightness(100%) contrast(90%)'
                  : 'brightness(0) invert(1) opacity(0.9)',
              }} />
              <span style={{
                fontFamily: 'Montserrat',
                marginLeft: '20px',
                fontSize: isTablet ? '14px' : '12.9px',
                fontWeight: isActive ? 700 : 500,
                lineHeight: '24px', letterSpacing: '0.325px',
                color: isActive ? '#FFEC8E' : '#FFFFFF',
              }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* HELP section — uses Link directly (not survey-gated) */}
      <div style={{ marginTop: '1.2vw', padding: '16px 11px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{
          fontFamily: 'Montserrat',
          fontWeight: 600,
          fontSize: '10px',
          lineHeight: '15px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.9)',
          padding: '0 14px',
          margin: '0 0 8px 0',
        }}>HELP</p>

        {helpItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 13px',
                margin: '0 6.5px',
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderRadius: '14px', textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
            >
              <img src={item.icon} alt={item.label} style={{
                width: '13.2px', height: '13.2px', flexShrink: 0,
                filter: isActive
                  ? 'brightness(0) saturate(100%) invert(88%) sepia(40%) saturate(400%) hue-rotate(6deg) brightness(100%) contrast(90%)'
                  : 'brightness(0) invert(1) opacity(0.9)',
              }} />
              <span style={{
                fontFamily: 'Montserrat',
                marginLeft: '20px',
                fontSize: isTablet ? '14px' : '12.9px',
                fontWeight: isActive ? 700 : 500,
                lineHeight: '27px', letterSpacing: '0.325px',
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
          padding: '0 12px',
          gap: '12px', height: '56px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '30px',
        }}>
          {/* Avatar */}
          <div style={{
            width: '40px', height: '40px', flexShrink: 0,
            background: 'linear-gradient(135deg, #51A2FF 0%, #155DFC 100%)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'Arial', fontSize: '14px', fontWeight: 700, color: '#FFFFFF',
            }}>{initials}</span>
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{
              fontFamily: 'Arial', fontSize: '14px', lineHeight: '20px',
              color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              fontWeight: 400,
            }}>{displayName}</span>
            <span style={{
              fontFamily: 'Arial', fontSize: '12px', lineHeight: '16px',
              color: '#D1D5DC', textTransform: 'capitalize', fontWeight: 400,
            }}>{role}</span>
          </div>

          {/* Logout icon */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', flexShrink: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: '4px', padding: '6px 6px 0',
              transition: 'background 0.15s',
              boxSizing: 'border-box',
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

export default SidebarView;