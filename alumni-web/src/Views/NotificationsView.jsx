import React from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/Notifications.css';

/* ─────────────────────────────────────────────────────────────────────────────
Utility — strips HTML tags so raw markup in n.body never shows as text
───────────────────────────────────────────────────────────────────────────── */
const stripHtml = (html = '') =>
  html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

/* ─────────────────────────────────────────────────────────────────────────────
Icon paths per notification type — keyed off the existing `n.type` field
(announcement / discount / job / event / reward) that notificationService.js
already produces, so icon selection is fully data-driven and never depends
on matching a notification's title/name.
───────────────────────────────────────────────────────────────────────────── */
const NOTIF_ICON_PATHS = {
  announcement: 'M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z',
  discount: 'M5 8.5h10v9H5v-9zM3 6h14v2.5H3V6zM10 6v11.5M10 6C10 6 8.5 3 6.8 3.3S6 5.6 7 6h3zm0 0c0 0 1.5-3 3.2-2.7S13 5.6 12 6h-2z',
  job: 'M3 8h14v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8zM7 8V6a2 2 0 012-2h2a2 2 0 012 2v2M3 12h14',
  event: 'M4 4h12v13a1 1 0 01-1 1H5a1 1 0 01-1-1V4zM4 8h12M7 2v4M13 2v4',
  reward: 'M10 2l2.35 4.76 5.25.76-3.8 3.7.9 5.24L10 13.9l-4.7 2.56.9-5.24-3.8-3.7 5.25-.76z',
};

const getNotifIconPath = (type) => NOTIF_ICON_PATHS[type] || NOTIF_ICON_PATHS.announcement;

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
        
        {/* Back Button — position/behavior unchanged */}
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
            <div
              className="notif-tabs-indicator"
              style={{ transform: tab === 'unread' ? 'translateX(calc(100% + 2px))' : 'translateX(0%)' }}
            />
            {['all', 'unread'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`notif-tab-btn ${tab === t ? 'notif-tab-btn--active' : 'notif-tab-btn--inactive'}`}
              >
                {t === 'all' ? 'All' : (
                  <>
                    Unread
                    {unreadCount > 0 && <span className="notif-tab-count">{unreadCount}</span>}
                  </>
                )}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="notif-mark-all-btn" onClick={markAllRead}>
              <span className="notif-mark-all-btn__chk">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
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
              <div className="notif-state-icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2b72fb" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="notif-state-title">
                {tab === 'unread' ? "You're all caught up" : 'No notifications yet'}
              </h3>
              <p>{tab === 'unread' ? 'No unread notifications right now.' : 'New announcements and activities will show up here.'}</p>
            </div>
          </div>
        ) : (
          <div className="notif-cards-list">
            {Object.entries(groups).map(([label, items]) => {
              if (!items.length) return null;
              return (
                <React.Fragment key={label}>
                  <div className="notif-group-label">
                    <span className="notif-group-label__text">{label}</span>
                    <span className="notif-group-count">{items.length}</span>
                  </div>
                  {items.map(n => (
                    <div
                      key={n.id}
                      className={`notif-card${n.read ? '' : ' notif-card--unread'}`}
                      onClick={() => onNotificationClick(n)}
                    >
                      <div className="notif-card__body">
                        <div className="notif-card__icon">
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path
                              d={getNotifIconPath(n.type)}
                              stroke={n.read ? '#2b72fb' : '#ffffff'}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div className="notif-card__content">
                          <div className="notif-card__top-row">
                            <div className="notif-card__title-wrap">
                              <p className={`notif-card__title ${n.read ? 'notif-card__title--read' : 'notif-card__title--unread'}`}>
                                {n.title}
                              </p>
                              {!n.read && <span className="notif-new-badge">New</span>}
                            </div>
                            <span className="notif-card__time">{formatTime(n.time)}</span>
                          </div>
                          <p className="notif-card__preview">
                            {stripHtml(n.body)}
                          </p>
                        </div>
                        <div className="notif-card__actions">
                          {!n.read && (
                            <button
                              className="notif-mark-one-btn"
                              onClick={(e) => { e.stopPropagation(); markOneRead(n.id); }}
                            >
                              Mark read
                            </button>
                          )}
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