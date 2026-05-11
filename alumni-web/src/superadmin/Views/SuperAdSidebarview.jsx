import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import sidebarLogo from '../../assets/alumnai_logo_new.png';
import dashboardIcon from '../../assets/dashboard_icn.svg';
import contentIcon from '../../assets/content_icn.svg';
import predictIcon from '../../assets/predict_icn.svg';
import analyticsIcon from '../../assets/analytics_icn.svg';
import surveyIcon from '../../assets/survey_icn.svg';
import alumniIcon from '../../assets/alumni_icn.svg';
import adminIcon from '../../assets/admin_icn.svg';
import auditsIcon from '../../assets/audits_icn.svg';
import '../styles/SuperAdSidebar.css';

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

/**
 * Long nav labels that are displayed across two lines for visual balance.
 * Keys must match item.label exactly. Both lines share the same style (Figma).
 */
const TWO_LINE_LABELS = {
  'Content Management':   { line1: 'Content',     line2: 'Management'   },
  'Survey Management':    { line1: 'Survey',       line2: 'Management'   },
  'Response & Analytics': { line1: 'Response &',   line2: 'Analytics'    },
  'Predictive Analytics': { line1: 'Predictive',   line2: 'Analytics'    },
  'Admin Management':     { line1: 'Admin',        line2: 'Management'   },
  'Alumni Management':    { line1: 'Alumni',       line2: 'Management'   },
  'Audit Logs':           { line1: 'Audit',        line2: 'Logs'         },
};

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M16 17l5-5-5-5"
      stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9"
      stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
      stroke="#D1D5DC" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/** Renders a plain or two-line label, correctly styled for active/inactive state. */
const NavLabel = ({ label, isTablet, isActive }) => {
  const twoLine = TWO_LINE_LABELS[label];

  const className = [
    'superadmin-sidebar-label',
    isTablet ? 'superadmin-sidebar-label-tablet' : '',
    isActive  ? 'superadmin-sidebar-label-active'  : '',
  ].filter(Boolean).join(' ');

  if (twoLine) {
    return (
      <span className={className}>
        <span className="label-line1">{twoLine.line1}</span>
        <span className="label-line2">{twoLine.line2}</span>
      </span>
    );
  }

  return <span className={className}>{label}</span>;
};

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
            const iconSrc  = iconMap[item.icon];
            return (
              <Link key={item.path} to={item.path} className="superadmin-mobile-nav-item">
                {isActive && <div className="superadmin-mobile-active-indicator" />}
                <img
                  src={iconSrc}
                  alt={item.label}
                  className={`superadmin-mobile-icon ${
                    isActive ? 'superadmin-mobile-icon-active' : 'superadmin-mobile-icon-inactive'
                  }`}
                />
                <span className={`superadmin-mobile-label ${
                  isActive ? 'superadmin-mobile-label-active' : 'superadmin-mobile-label-inactive'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button onClick={handleLogout} className="superadmin-mobile-logout-btn">
            <LogoutIcon />
            <span className="superadmin-mobile-label superadmin-mobile-label-inactive">Logout</span>
          </button>
        </nav>

        <button
          onClick={() => setMobileOpen(o => !o)}
          className="superadmin-mobile-hamburger"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </>
    );
  }

  // ── Desktop / Tablet sidebar ───────────────────────────────────────────────
  const sidebarW = isTablet ? '190px' : '218px';

  return (
    <>
      <aside
        className={`superadmin-sidebar ${isMobile && !mobileOpen ? 'superadmin-sidebar-hidden' : ''}`}
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

        {/* Nav items */}
        <div className="superadmin-sidebar-menu-section">
          <p className="superadmin-sidebar-menu-heading">MENU</p>

          {menuItems.map(({ path, icon, label, marginTop }) => {
            const isActive = location.pathname === path;
            const iconSrc  = iconMap[icon];
            return (
              <Link
                key={path}
                to={path}
                className={`superadmin-sidebar-menu-item ${
                  isActive ? 'superadmin-sidebar-menu-item-active' : ''
                }`}
                style={marginTop ? { marginTop } : undefined}
              >
                <img
                  src={iconSrc}
                  alt={label}
                  className={`superadmin-sidebar-icon ${
                    isActive ? 'superadmin-sidebar-icon-active' : 'superadmin-sidebar-icon-inactive'
                  }`}
                />
                <NavLabel label={label} isTablet={isTablet} isActive={isActive} />
              </Link>
            );
          })}
        </div>

        {/* User card */}
        <div className="superadmin-sidebar-footer">
          <div className="superadmin-sidebar-user-card">
            <div className="superadmin-sidebar-avatar">
              <span className="superadmin-sidebar-initials">{initials}</span>
            </div>

            <div className="superadmin-sidebar-user-info">
              <span className="superadmin-sidebar-user-name" title={displayName}>
                {displayName}
              </span>
              <span className="superadmin-sidebar-user-role">{role}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="superadmin-sidebar-logout-btn"
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
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