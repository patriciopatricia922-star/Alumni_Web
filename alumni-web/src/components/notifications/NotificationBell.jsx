// src/components/notifications/NotificationBell.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { groupByDate, formatTime, getPolicyModalType } from '../../lib/notificationService';
import { truncateHtml } from '../../utils/textHelpers';
import notifIcon from '../../assets/notif_icn.png';
// [policy-notif-click] Reuses the same policy modal separated out earlier
// (About / ID Registration) rather than duplicating its content here.
import useDisclosure from '../../hooks/Usedisclosure';
import UserPolicyModal from '../../modals/UserPolicyModal';

const NotificationBell = ({
  autoMarkReadOnMount = false,
  limit = 20,
  onSeeAll,
  onUnreadCountChange,
  className = '',
  bellClassName = '',
  dropdownClassName = '',
}) => {
  const navigate = useNavigate();
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

  // [policy-notif-click] Only fetched/used when a Policy Update notification
  // is actually clicked; disclosure already carries live tos_content/
  // pp_content/updated_at via its own real-time subscription.
  const { disclosure } = useDisclosure();
  const [policyModalType, setPolicyModalType] = useState(null); // 'tos' | 'privacy' | null

  // Optional: lets a parent page mirror this component's unread count
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  // NEW: Extended click handler for all notification types
  const handleNotificationClick = (n) => {
    markOneRead(n.id);

    // [policy-notif-click] Policy Update notifications open the shared
    // policy modal in place, instead of navigating to /announcements.
    const policyType = getPolicyModalType(n);
    if (policyType) {
      setShowDropdown(false);
      setPolicyModalType(policyType);
      return;
    }

    let targetPath = '';
    let queryParams = '';

    switch (n.type) {
      case 'announcement':
        targetPath = '/announcements';
        queryParams = `announcement=${encodeURIComponent(n.typeId)}`;
        break;
      case 'discount':
        targetPath = '/discounts';
        queryParams = `discount=${encodeURIComponent(n.typeId)}`;
        break;
      case 'job':
        targetPath = '/jobs';
        queryParams = `job=${encodeURIComponent(n.typeId)}`;
        break;
      case 'event':
        targetPath = '/events';
        queryParams = `event=${encodeURIComponent(n.typeId)}`;
        break;
      case 'reward':
        targetPath = '/rewards';
        queryParams = `reward=${encodeURIComponent(n.typeId)}`;
        break;
      default:
        // Fallback for unknown types or legacy notifications without type
        if (n.typeId) {
           targetPath = '/announcements';
           queryParams = `announcement=${encodeURIComponent(n.typeId)}`;
        }
        break;
    }

    if (targetPath) {
      try {
        setShowDropdown(false);
        navigate(`${targetPath}?${queryParams}`);
      } catch (err) {
        console.error('Notification navigation failed:', err);
        navigate(targetPath);
      }
    }
  };

  return (
    <>
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
                        onClick={() => handleNotificationClick(n)}
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

    {/* [policy-notif-click] Rendered as a sibling of the bell wrapper (not
        nested inside it) since UserPolicyModal is its own fixed-position
        overlay — matches how About/ID Registration already render it. */}
    {policyModalType && (
      <UserPolicyModal
        type={policyModalType}
        disclosure={disclosure}
        onClose={() => setPolicyModalType(null)}
        headerIcon={
          policyModalType === 'tos' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )
        }
      />
    )}
    </>
  );
};

export default NotificationBell;