import React from 'react';
import { Link } from 'react-router-dom';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { FaBookBookmark } from 'react-icons/fa6';
import { RiSurveyFill, RiOrganizationChart } from 'react-icons/ri';
import { SiGoogleanalytics } from 'react-icons/si';
import { BsFillPeopleFill } from 'react-icons/bs';
import { FiMenu, FiX } from 'react-icons/fi';
import sidebarLogo from '../../assets/new_lg.svg';
import '../styles/SuperAdSidebar.css';

const iconMap = {
  TbLayoutDashboardFilled,
  BsFillPeopleFill,
  RiSurveyFill,
  SiGoogleanalytics,
  RiOrganizationChart,
  FaBookBookmark,
};

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M16 17l5-5-5-5" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SuperAdminSidebarView = ({
  location,
  isMobile,
  isTablet,
  mobileOpen,
  setMobileOpen,
  displayName,
  initials,
  role,
  menuItems,
  handleLogout,
}) => {

  // ── Mobile bottom nav ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <nav className="superadmin-mobile-bottom-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = iconMap[item.icon];
            return (
              <Link key={item.path} to={item.path} className="superadmin-mobile-nav-item">
                {isActive && <div className="superadmin-mobile-active-indicator" />}
                <IconComponent
                  size={21}
                  className={`superadmin-mobile-icon ${isActive ? 'superadmin-mobile-icon-active' : 'superadmin-mobile-icon-inactive'}`}
                />
                <span className={`superadmin-mobile-label ${isActive ? 'superadmin-mobile-label-active' : 'superadmin-mobile-label-inactive'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button onClick={handleLogout} className="superadmin-mobile-logout-btn">
            <LogoutIcon />
            <span className="superadmin-mobile-label-inactive">Logout</span>
          </button>
        </nav>

        <button
          onClick={() => setMobileOpen(o => !o)}
          className="superadmin-mobile-hamburger"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </>
    );
  }

  // ── Desktop / Tablet sidebar ───────────────────────────────────────────────
  const sidebarW = isTablet ? '200px' : '229px';

  return (
    <>
      <aside
        className={`superadmin-sidebar ${isMobile && !mobileOpen ? 'superadmin-sidebar-hidden' : ''}`}
        style={{ width: sidebarW }}
      >
        <div className="superadmin-sidebar-logo-container">
          <img
            src={sidebarLogo}
            alt="AlumnAI"
            className={`superadmin-sidebar-logo ${isTablet ? 'superadmin-sidebar-logo-tablet' : ''}`}
          />
        </div>

        <div className="superadmin-sidebar-divider" />

        <div className="superadmin-sidebar-menu-section">
          {menuItems.map(({ path, icon, label, marginTop }) => {
            const isActive = location.pathname === path;
            const IconComponent = iconMap[icon];
            return (
              <Link
                key={path}
                to={path}
                className={`superadmin-sidebar-menu-item ${isActive ? 'superadmin-sidebar-menu-item-active' : ''}`}
                style={{ marginTop: marginTop || '0px' }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <IconComponent
                  size={20}
                  className={`superadmin-sidebar-icon ${isActive ? 'superadmin-sidebar-icon-active' : 'superadmin-sidebar-icon-inactive'}`}
                />
                <span className={`superadmin-sidebar-label ${isTablet ? 'superadmin-sidebar-label-tablet' : ''} ${isActive ? 'superadmin-sidebar-label-active' : ''}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="superadmin-sidebar-footer">
          <div className="superadmin-sidebar-user-card">
            <div className="superadmin-sidebar-avatar">
              <span className="superadmin-sidebar-initials">{initials}</span>
            </div>

            <div className="superadmin-sidebar-user-info">
              <span className="superadmin-sidebar-user-name" title={displayName}>{displayName}</span>
              <span className="superadmin-sidebar-user-role">{role}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="superadmin-sidebar-logout-btn"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="superadmin-sidebar-backdrop" />
      )}
    </>
  );
};

export default SuperAdminSidebarView;