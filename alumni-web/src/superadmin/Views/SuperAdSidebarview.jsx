import React from 'react';
import { Link } from 'react-router-dom';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { FaBookBookmark } from 'react-icons/fa6';
import { RiSurveyFill, RiOrganizationChart } from 'react-icons/ri';
import { SiGoogleanalytics } from 'react-icons/si';
import { BsFillPeopleFill } from 'react-icons/bs';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import sidebarLogo from '../../assets/new_lg.svg';
import '../styles/SuperAdSidebar.css';

const iconMap = {
  TbLayoutDashboardFilled: TbLayoutDashboardFilled,
  BsFillPeopleFill: BsFillPeopleFill,
  RiSurveyFill: RiSurveyFill,
  SiGoogleanalytics: SiGoogleanalytics,
  RiOrganizationChart: RiOrganizationChart,
  FaBookBookmark: FaBookBookmark,
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
  user,
  role,
  displayName,
  initials,
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
                  {item.split ? (
                    <>
                      {item.label.split(' ')[0]}<br />
                      {item.label.split(' ').slice(1).join(' ')}
                    </>
                  ) : item.label}
                </span>
              </Link>
            );
          })}

          {/* Logout */}
          <button onClick={handleLogout} className="superadmin-mobile-logout-btn">
            <LogoutIcon />
            <span className="superadmin-mobile-label-inactive">Logout</span>
          </button>
        </nav>

        {/* Mobile hamburger toggle - only show when bottom nav is present */}
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
  const sidebarW = isTablet ? '200px' : '250px';

  return (
    <>
      <aside
        className={`superadmin-sidebar ${isMobile ? 'superadmin-sidebar-mobile' : ''}`}
        style={{ width: sidebarW }}
      >
        {/* Logo */}
        <div className="superadmin-sidebar-logo-container">
          <img
            src={sidebarLogo}
            alt="AlumnAI"
            className={`superadmin-sidebar-logo ${isTablet ? 'superadmin-sidebar-logo-tablet' : ''}`}
          />
        </div>

        {/* Divider */}
        <div className="superadmin-sidebar-divider" />

        {/* MENU section */}
        <div className="superadmin-sidebar-menu-section">
          {menuItems.map(({ path, icon, label, split }) => {
            const isActive = location.pathname === path;
            const IconComponent = iconMap[icon];
            return (
              <Link
                key={path}
                to={path}
                className={`superadmin-sidebar-menu-item ${isActive ? 'superadmin-sidebar-menu-item-active' : ''}`}
                onMouseEnter={e => {
                  if (!isActive && !e.currentTarget.classList.contains('superadmin-sidebar-menu-item-active')) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive && !e.currentTarget.classList.contains('superadmin-sidebar-menu-item-active')) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <IconComponent
                  size={isTablet ? 21 : 23}
                  className={`superadmin-sidebar-icon ${isActive ? 'superadmin-sidebar-icon-active' : 'superadmin-sidebar-icon-inactive'}`}
                />
                <span className={`superadmin-sidebar-label ${isTablet ? 'superadmin-sidebar-label-tablet' : ''} ${isActive ? 'superadmin-sidebar-label-active' : ''}`}>
                  {split ? (
                    <>
                      {label.split(' ')[0]}<br />
                      {label.split(' ').slice(1).join(' ')}
                    </>
                  ) : label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User card + Logout at bottom */}
        <div className="superadmin-sidebar-footer">
          <div className="superadmin-sidebar-user-card">
            {/* Avatar */}
            <div className="superadmin-sidebar-avatar">
              <span className="superadmin-sidebar-initials">{initials}</span>
            </div>

            {/* Name + role */}
            <div className="superadmin-sidebar-user-info">
              <span className="superadmin-sidebar-user-name">{displayName}</span>
              <span className="superadmin-sidebar-user-role">{role}</span>
            </div>

            {/* Logout icon */}
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

      {/* Mobile backdrop - only for tablet/desktop sidebar when in mobile view */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="superadmin-sidebar-backdrop"
        />
      )}

      {/* Mobile hamburger toggle - for tablet/desktop sidebar style on mobile */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="superadmin-mobile-hamburger"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      )}
    </>
  );
};

export default SuperAdminSidebarView;