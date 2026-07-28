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
import './AdminSidebar.css';

const iconMap = {
  dashboard_icn: dashboardIcon,
  content_icn:   contentIcon,
  predict_icn:   predictIcon,
  analytics_icn: analyticsIcon,
  survey_icn:    surveyIcon,
  alumni_icn:    alumniIcon,
  admin_icn:     adminIcon,
  audits_icn:    auditsIcon,
  // Legacy fallback keys (in case menuItems still pass old names)
  TbLayoutDashboardFilled: dashboardIcon,
  BsFillPeopleFill:        alumniIcon,
  RiSurveyFill:            surveyIcon,
  SiGoogleanalytics:       analyticsIcon,
  RiOrganizationChart:     adminIcon,
  FaBookBookmark:          contentIcon,
};

/**
 * Long nav labels displayed across two lines for visual balance.
 * Keys must match item.label exactly.
 */
const TWO_LINE_LABELS = {
  'Content Management':   { line1: 'Content',    line2: 'Management' },
  'Survey Management':    { line1: 'Survey',      line2: 'Management' },
  'Response & Analytics': { line1: 'Response &',  line2: 'Analytics'  },
  'Predictive Analytics': { line1: 'Predictive',  line2: 'Analytics'  },
  'Admin Management':     { line1: 'Admin',       line2: 'Management' },
  'Alumni Management':    { line1: 'Alumni',      line2: 'Management' },
  'Audit Logs':           { line1: 'Audit',       line2: 'Logs'       },
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

// ── Alumni Type Switcher ───────────────────────────────────────────────────────
// Integrated from friend's implementation. Allows toggling between College and
// SHS alumni data views. State is owned by AlumniTypeContext (via the container)
// so all downstream pages react to the selection automatically.
const AlumniTypeSwitcher = ({ alumniType, setAlumniType, disableShs }) => (
  <div className="alumni-type-switcher">
    <button
      className={`switcher-pill ${alumniType === 'college' ? 'active' : ''}`}
      onClick={() => setAlumniType('college')}
    >
      College
    </button>
    <button
      className={`switcher-pill ${alumniType === 'shs' ? 'active' : ''}`}
      onClick={() => setAlumniType('shs')}
      disabled={disableShs}
      title={disableShs ? 'Not available for SHS on this page' : undefined}
    >
      SHS
    </button>
  </div>
);

/** Renders a plain or two-line label, correctly styled for active/inactive state. */
const NavLabel = ({ label, isTablet, isActive }) => {
  const twoLine = TWO_LINE_LABELS[label];

  const className = [
    'admin-sidebar-label',
    isTablet ? 'admin-sidebar-label-tablet' : '',
    isActive  ? 'admin-sidebar-label-active'  : '',
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

/**
 * MenuSkeleton
 * Shown only on cold load (no cached user yet). Renders placeholder rows
 * that mimic the geometry of real nav items so the sidebar holds its
 * correct height and the layout never shifts.
 */
const SKELETON_COUNT = 5;

const MenuSkeleton = () => (
  <div className="admin-sidebar-skeleton-list" aria-hidden="true">
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <div key={i} className="admin-sidebar-skeleton-item">
        <div className="admin-sidebar-skeleton-icon" />
        <div
          className="admin-sidebar-skeleton-label"
          style={{ width: `${52 + (i % 3) * 12}%` }}
        />
      </div>
    ))}
  </div>
);

/**
 * UserCardSkeleton
 * Placeholder for the footer user pill while user data is loading.
 */
const UserCardSkeleton = () => (
  <div className="admin-sidebar-user-card" aria-hidden="true">
    <div className="admin-sidebar-skeleton-avatar" />
    <div className="admin-sidebar-skeleton-user-info">
      <div className="admin-sidebar-skeleton-name" />
      <div className="admin-sidebar-skeleton-role" />
    </div>
  </div>
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
  isLoadingUser = false,
  handleLogout,
  alumniType,
  setAlumniType,
  isCollegeOnlyRoute,
}) => {

  // ── Mobile bottom nav ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <nav className="admin-mobile-bottom-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const iconSrc  = iconMap[item.icon];
            return (
              <Link key={item.path} to={item.path} className="admin-mobile-nav-item">
                {isActive && <div className="admin-mobile-active-indicator" />}
                <img
                  src={iconSrc}
                  alt={item.label}
                  className={`admin-mobile-icon ${
                    isActive ? 'admin-mobile-icon-active' : 'admin-mobile-icon-inactive'
                  }`}
                />
                <span className={`admin-mobile-label ${
                  isActive ? 'admin-mobile-label-active' : 'admin-mobile-label-inactive'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button onClick={handleLogout} className="admin-mobile-logout-btn">
            <LogoutIcon />
            <span className="admin-mobile-label admin-mobile-label-inactive">Logout</span>
          </button>
        </nav>

        {/* Switcher floats above the bottom nav on mobile */}
        <div className="alumni-type-switcher-mobile">
          <AlumniTypeSwitcher
            alumniType={alumniType}
            setAlumniType={setAlumniType}
            disableShs={isCollegeOnlyRoute}
          />
        </div>

        <button
          onClick={() => setMobileOpen(o => !o)}
          className="admin-mobile-hamburger"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
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
        className={`admin-sidebar ${isMobile && !mobileOpen ? 'admin-sidebar-hidden' : ''}`}
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

        {/* Alumni type switcher — sits between divider and MENU heading */}
        <div style={{ padding: '26px 12px 0px' }}>
          <AlumniTypeSwitcher
            alumniType={alumniType}
            setAlumniType={setAlumniType}
            disableShs={isCollegeOnlyRoute}
          />
        </div>

        {/* Nav items — skeleton on cold load, real list once resolved */}
        <div className="admin-sidebar-menu-section">
          <p className="admin-sidebar-menu-heading">MENU</p>

          {isLoadingUser ? (
            <MenuSkeleton />
          ) : (
            menuItems.map(({ path, icon, label, marginTop }) => {
              const isActive = location.pathname === path;
              const iconSrc  = iconMap[icon];
              return (
                <Link
                  key={path}
                  to={path}
                  className={`admin-sidebar-menu-item ${
                    isActive ? 'admin-sidebar-menu-item-active' : ''
                  }`}
                  style={marginTop ? { marginTop } : undefined}
                >
                  <img
                    src={iconSrc}
                    alt={label}
                    className={`admin-sidebar-icon ${
                      isActive ? 'admin-sidebar-icon-active' : 'admin-sidebar-icon-inactive'
                    }`}
                  />
                  <NavLabel label={label} isTablet={isTablet} isActive={isActive} />
                </Link>
              );
            })
          )}
        </div>

        {/* User card — skeleton on cold load, real card once resolved */}
        <div className="admin-sidebar-footer">
          {isLoadingUser ? (
            <UserCardSkeleton />
          ) : (
            <div className="admin-sidebar-user-card">
              <div className="admin-sidebar-avatar">
                <span className="admin-sidebar-initials">{initials}</span>
              </div>

              <div className="admin-sidebar-user-info">
                <span className="admin-sidebar-user-name" title={displayName}>
                  {displayName}
                </span>
                <span className="admin-sidebar-user-role">{role}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="admin-sidebar-logout-btn"
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <LogoutIcon />
              </button>
            </div>
          )}
        </div>
      </aside>

      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="admin-sidebar-backdrop" />
      )}
    </>
  );
};

export default AdminSidebarView;