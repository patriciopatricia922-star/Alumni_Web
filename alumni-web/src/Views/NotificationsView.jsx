import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Notifications.css';

/* ─────────────────────────────────────────────────────────────────────────────
Utility — strips HTML tags so raw markup in n.body never shows as text
───────────────────────────────────────────────────────────────────────────── */
const stripHtml = (html = '') =>
  html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

/* ─────────────────────────────────────────────────────────────────────────────
NotificationsPageView
Redesigned to match the About page's header/wrapper design language.
Uses unified notification data from useNotifications hook.
───────────────────────────────────────────────────────────────────────────── */
const NotificationsPageView = ({
  tab, setTab,
  loading, unreadCount,
  list, groups,
  markAllRead, markOneRead,
  formatTime,
  navigate,
  onNotificationClick,
}) => {
  return (
    <div className="notif-root">
      <Sidebar />
      <div className="notif-main">
        
        {/* Back Button */}
        <button className="notif-back" onClick={() => navigate('/dashboard')}>
          <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
            <path d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="notif-hdr">
          <h1 className="notif-title">Notifications</h1>
          <p className="notif-sub">Stay updated with the latest announcements and activities.</p>
        </div>

        {/* Controls: Tabs & Mark All */}
        <div className="notif-controls">
          <div className="notif-tabs">
            {['all', 'unread'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`notif-tab-btn ${tab === t ? 'notif-tab-btn--active' : 'notif-tab-btn--inactive'}`}
              >
                {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all-btn" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="notif-state-card">
            <div className="notif-loading-row">
              <div className="notif-spinner" />
              <span>Loading notifications…</span>
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="notif-state-card">
            <div className="notif-state-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p>{tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            </div>
          </div>
        ) : (
          <div className="notif-cards-list">
            {Object.entries(groups).map(([label, items]) => {
              if (!items.length) return null;
              return (
                <React.Fragment key={label}>
                  <div className="notif-group-label">
                    <span>{label}</span>
                  </div>
                  {items.map(n => (
                    <div
                      key={n.id}
                      className={`notif-card${n.read ? '' : ' notif-card--unread'}`}
                      onClick={() => onNotificationClick(n)}
                    >
                      <div className="notif-card__body">
                        <div className="notif-card__icon">
                          {/* 
                            FIX: Added negative margin-left to compensate for 
                            the SVG path's internal empty space on the right side,
                            achieving true visual centering within the flex container.
                          */}
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '-2px' }}>
                            <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#ffffff" strokeWidth="1.75" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="notif-card__content">
                          <div className="notif-card__top-row">
                            <p className={`notif-card__title ${n.read ? 'notif-card__title--read' : 'notif-card__title--unread'}`}>
                              {n.title}
                            </p>
                            <div className="notif-card__meta">
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="6" stroke="rgba(74,85,101,0.45)" strokeWidth="1.17"/>
                                <path d="M7 4V7.5L9.5 9" stroke="rgba(74,85,101,0.45)" strokeWidth="1.17" strokeLinecap="round"/>
                              </svg>
                              <span className="notif-card__time">{formatTime(n.time)}</span>
                              {!n.read && <div className="notif-unread-dot" />}
                            </div>
                          </div>
                          <p className="notif-card__preview">
                            {stripHtml(n.body)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPageView;