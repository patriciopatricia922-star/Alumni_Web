// src/components/notifications/NotificationBell.jsx
import React, { useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { groupByDate, formatTime } from '../../lib/notificationService';
import { truncateHtml } from '../../utils/textHelpers';
import notifIcon from '../../assets/notif_icn.png';

const NotificationBell = ({
  autoMarkReadOnMount = false,
  limit = 20,
  onSeeAll,
  onUnreadCountChange,
  className = '',
  bellClassName = '',
  dropdownClassName = '',
}) => {
  const {
    bellRef,
    notifs,
    unreadCount,
    showDropdown,
    notifTab,
    setNotifTab,
    setShowDropdown,
    markAllRead,
    markOneRead,
    toggleDropdown,
  } = useNotifications({ autoMarkReadOnMount, limit });

  const filteredList = notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const grouped = groupByDate(filteredList);
  const isMobile = className.includes('mobile');

  // Optional: lets a parent page mirror this component's unread count
  // (e.g. for greeting text elsewhere on the page) without running its
  // own separate useNotifications() instance. No-op if not provided.
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  return (
    <div ref={bellRef} className={`notification-bell-wrapper ${className}`}>
      <button
        onClick={toggleDropdown}
        className={`notification-bell-btn ${showDropdown ? 'active' : ''} ${bellClassName}`}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <img 
          src={notifIcon} 
          alt="Notifications" 
          className="notification-bell-icon" 
        />
        {unreadCount > 0 && (
          <div className="notification-badge">
            <span className="notification-badge-text">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {showDropdown && (
        <div className={`notification-dropdown ${dropdownClassName}`}>
          {/* Header */}
          <div className="dropdown-header">
            <span className="dropdown-title">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="mark-all-read-btn">
                Mark all read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="dropdown-tabs">
            {['all', 'unread'].map((t) => (
              <button
                key={t}
                onClick={() => setNotifTab(t)}
                className={`dropdown-tab ${notifTab === t ? 'active' : ''}`}
              >
                {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="dropdown-body">
            {filteredList.length === 0 ? (
              <div className="empty-notifications">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                    stroke="rgba(0,0,0,0.2)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="empty-text">
                  {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([label, items]) => {
                if (!items.length) return null;
                return (
                  <div key={label}>
                    <p className="notification-date-label">{label}</p>
                    {items.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markOneRead(n.id)}
                        className={`notification-item ${!n.read ? 'unread' : 'read'}`}
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
                          <p className="notification-body">{truncateHtml(n.body, 100)}</p>
                          <span className="notification-time">{formatTime(n.time)}</span>
                        </div>
                        {!n.read && <div className="notification-unread-dot" />}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {onSeeAll && (
            <div className="dropdown-footer">
              <button
                onClick={() => { setShowDropdown(false); onSeeAll(); }}
                className="see-all-btn"
              >
                See all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;