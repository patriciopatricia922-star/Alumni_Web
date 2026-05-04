import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import sidebarLogo from '../../assets/alumnai_logo_new.svg';
import dashboardIcon from '../../assets/dashboard_icn.svg';
import contentIcon from '../../assets/content_icn.svg';
import predictIcon from '../../assets/predict_icn.svg';
import analyticsIcon from '../../assets/analytics_icn.svg';
import surveyIcon from '../../assets/survey_icn.svg';
import alumniIcon from '../../assets/alumni_icn.svg';
import adminIcon from '../../assets/admin_icn.svg';
import auditsIcon from '../../assets/audits_icn.svg';
import './AdminSidebar.css';

const iconMap = {
  dashboard_icn: dashboardIcon,
  content_icn: contentIcon,
  predict_icn: predictIcon,
  analytics_icn: analyticsIcon,
  survey_icn: surveyIcon,
  alumni_icn: alumniIcon,
  admin_icn: adminIcon,
  audits_icn: auditsIcon,
  // Legacy fallback keys (in case menuItems still pass old names)
  TbLayoutDashboardFilled: dashboardIcon,
  BsFillPeopleFill: alumniIcon,
  RiSurveyFill: surveyIcon,
  SiGoogleanalytics: analyticsIcon,
  RiOrganizationChart: adminIcon,
  FaBookBookmark: contentIcon,
};

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M16 17l5-5-5-5" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AdminSidebarView = ({
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
        <nav className="admin-mobile-bottom-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const iconSrc = iconMap[item.icon];
            return (
              <Link key={item.path} to={item.path} className="admin-mobile-nav-item">
                {isActive && <div className="admin-mobile-active-indicator" />}
                <img
                  src={iconSrc}
                  alt={item.label}
                  className={`admin-mobile-icon ${isActive ? 'admin-mobile-icon-active' : 'admin-mobile-icon-inactive'}`}
                />
                <span className={`admin-mobile-label ${isActive ? 'admin-mobile-label-active' : 'admin-mobile-label-inactive'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Logout */}
          <button onClick={handleLogout} className="admin-mobile-logout-btn">
            <LogoutIcon />
            <span className="admin-mobile-label-inactive">Logout</span>
          </button>
        </nav>

        {/* Mobile hamburger toggle - only show when bottom nav is present */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="admin-mobile-hamburger"
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
        className={`admin-sidebar ${isMobile ? 'admin-sidebar-mobile' : ''}`}
        style={{ width: sidebarW }}
      >
        {/* Logo */}
        <div className="admin-sidebar-logo-container">
          <img
            src={sidebarLogo}
            alt="AlumnAI"
            className={`admin-sidebar-logo ${isTablet ? 'admin-sidebar-logo-tablet' : ''}`}
          />
        </div>

        {/* Divider */}
        <div className="admin-sidebar-divider" />

        {/* MENU section */}
        <div className="admin-sidebar-menu-section">
          <p className="admin-sidebar-menu-heading">MENU</p>
          {menuItems.map(({ path, icon, label, marginTop }) => {
            const isActive = location.pathname === path;
            const iconSrc = iconMap[icon];
            return (
              <Link
                key={path}
                to={path}
                className={`admin-sidebar-menu-item ${isActive ? 'admin-sidebar-menu-item-active' : ''}`}
                style={{ marginTop: marginTop || '0px' }}
                onMouseEnter={e => {
                  if (!isActive && !e.currentTarget.classList.contains('admin-sidebar-menu-item-active')) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive && !e.currentTarget.classList.contains('admin-sidebar-menu-item-active')) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <img
                  src={iconSrc}
                  alt={label}
                  className={`admin-sidebar-icon ${isActive ? 'admin-sidebar-icon-active' : 'admin-sidebar-icon-inactive'}`}
                />
                <span className={`admin-sidebar-label ${isTablet ? 'admin-sidebar-label-tablet' : ''} ${isActive ? 'admin-sidebar-label-active' : ''}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User card + Logout at bottom */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user-card">
            {/* Avatar */}
            <div className="admin-sidebar-avatar">
              <span className="admin-sidebar-initials">{initials}</span>
            </div>

            {/* Name + role */}
            <div className="admin-sidebar-user-info">
              <span className="admin-sidebar-user-name" title={displayName}>
                {displayName}
              </span>
              <span className="admin-sidebar-user-role">{role}</span>
            </div>

            {/* Logout icon */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="admin-sidebar-logout-btn"
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
          className="admin-sidebar-backdrop"
        />
      )}

      {/* Mobile hamburger toggle - for tablet/desktop sidebar style on mobile */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="admin-mobile-hamburger"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      )}
    </>
  );
};

export default AdminSidebarView;