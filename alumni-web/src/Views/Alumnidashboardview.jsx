import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/AlumniDashboard.css';

// ============================ FOR YOU CARD COMPONENT ============================
// Arrow icon removed per revision spec.
const ForYouCard = ({ item, onNavigate, onDismissBadge }) => (
  <div
    className="for-you-card"
    onClick={() => {
      onDismissBadge(item.category);
      onNavigate(item.path);
    }}
  >
    <div className="for-you-icon-box">
      <img
        src={item.icon}
        alt={item.title}
        className={`for-you-icon ${item.title === 'Discounts' ? 'discount-icon' : ''}`}
      />
      {item.showDot && (
        <div className="notification-dot" />
      )}
    </div>

    <div className="for-you-text">
      <p className="card-title">{item.title}</p>
      <p className="card-description">{item.description}</p>
    </div>
  </div>
);

// ============================ PROGRESS CIRCLE COMPONENT ============================
const ProgressCircle = ({ animatedPercentage }) => {
  const size          = 154;
  const radius        = 64;
  const strokeWidth   = 13;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="progress-circle">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="progress-svg"
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="progress-bg"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="progress-fill"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - animatedPercentage / 100)}
        />
      </svg>
      <div className="progress-percentage">{animatedPercentage}%</div>
    </div>
  );
};

// ============================ NOTIFICATION DROPDOWN ============================
const NotificationDropdown = ({
  notifs,
  unreadCount,
  notifTab,
  setNotifTab,
  markAllRead,
  markOneRead,
  groupByDate,
  formatTime,
  onSeeAllNotifs,
}) => {
  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;

  if (!list.length) {
    return (
      <div className="notification-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <p>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
      </div>
    );
  }

  return (
    <div className="notification-list">
      {Object.entries(groupByDate(list)).map(([label, items]) => {
        if (!items.length) return null;
        return (
          <div key={label}>
            <p className="notification-group-label">{label}</p>
            {items.map(n => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? 'unread' : ''}`}
                onClick={() => markOneRead(n.id)}
              >
                <div className="notification-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                      stroke="#003EA6"
                      strokeWidth="1.67"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="notification-content">
                  <p className="notification-title">{n.title}</p>
                  <p className="notification-body">{n.body}</p>
                  <span className="notification-time">{formatTime(n.time)}</span>
                </div>
                {!n.read && <div className="notification-unread-dot" />}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ============================ MAIN VIEW COMPONENT ============================
const AlumniDashboardView = ({
  isMobile,
  isTablet,
  sidebarWidth,
  firstName,
  bellRef,
  notifs,
  unreadCount,
  showDropdown,
  notifTab,
  setShowDropdown,
  setNotifTab,
  markAllRead,
  markOneRead,
  groupByDate,
  formatTime,
  onSeeAllNotifs,
  animatedPercentage,
  forYouItems,
  onNavigate,
  onDismissBadge,
  surveyRoute,
  onSurveyNavigate,
}) => {
  return (
    <div className="alumni-dashboard">
      <Sidebar />

      <div
        className="dashboard-content"
        style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}
      >
        {/* ── Page Header — now includes welcome subtitle ── */}
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h1>Welcome Bark!</h1> 
               <p>Let's see what's new in your alumni network.</p>
          </div>

          <div ref={bellRef} className={`notification-bell ${isMobile ? 'mobile' : ''}`}>
            <button
              className={`bell-button ${showDropdown ? 'active' : ''}`}
              onClick={() => setShowDropdown(v => !v)}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                  stroke="#FFFFFF"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {unreadCount > 0 && (
                <div className="bell-badge">
                  <span>{unreadCount > 99 ? '99+' : unreadCount}</span>
                </div>
              )}
            </button>

            {showDropdown && (
              <div className={`notification-dropdown ${isMobile ? 'mobile' : ''}`}>
                <div className="dropdown-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="mark-all-read">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="dropdown-tabs">
                  {['all', 'unread'].map(t => (
                    <button
                      key={t}
                      className={`tab-btn ${notifTab === t ? 'active' : ''}`}
                      onClick={() => setNotifTab(t)}
                    >
                      {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                    </button>
                  ))}
                </div>
                <div className="dropdown-body">
                  <NotificationDropdown
                    notifs={notifs}
                    unreadCount={unreadCount}
                    notifTab={notifTab}
                    setNotifTab={setNotifTab}
                    markAllRead={markAllRead}
                    markOneRead={markOneRead}
                    groupByDate={groupByDate}
                    formatTime={formatTime}
                    onSeeAllNotifs={onSeeAllNotifs}
                  />
                </div>
                <div className="dropdown-footer">
                  <button onClick={onSeeAllNotifs} className="see-all-btn">
                    See all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Top Banner Row ── */}
        <div className="top-banner-row">

          {/* Hello Card */}
          <div className="hello-card">
            <div className="hello-deco-circle hello-deco-circle--tr" />
            <div className="hello-deco-circle hello-deco-circle--bl" />
            <div className="hello-card-inner">
              <h2 className="hello-text">
                Hello,<br />
                <span className="hello-name">{firstName}!</span>
              </h2>
              <p className="hello-notification-text">
                You have{' '}
                <span className="hello-notif-highlight">
                  {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}.
                </span>
                {' '}Check it now!
              </p>
            </div>
          </div>

          {/* Survey Progress Card */}
          <div className="survey-card">
            <div className="survey-blur" />
            <div className="survey-deco-circle survey-deco-circle--tl" />
            <div className="survey-deco-circle survey-deco-circle--br" />

            <div className="survey-card-content">
              <p className="survey-label">SURVEY PROGRESS</p>
              <p className="survey-message">Your alumni tracer survey!</p>

              <button
                className="continue-button"
                onClick={() => surveyRoute && onSurveyNavigate(surveyRoute)}
                disabled={!surveyRoute}
                style={{
                  opacity: surveyRoute ? 1 : 0.5,
                  cursor:  surveyRoute ? 'pointer' : 'not-allowed',
                }}
              >
                Proceed
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="rgba(0, 40, 255, 0.85)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <ProgressCircle animatedPercentage={animatedPercentage} />
          </div>
        </div>

        {/* ── For You Section ── */}
        <div className="for-you-section">
          <h3 className="for-you-heading">For You</h3>
          <p className="for-you-subtitle">See what's here for you.</p>

          <div className="for-you-grid">
            {forYouItems.map((item, i) => (
              <ForYouCard
                key={i}
                item={item}
                onNavigate={onNavigate}
                onDismissBadge={onDismissBadge}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboardView;