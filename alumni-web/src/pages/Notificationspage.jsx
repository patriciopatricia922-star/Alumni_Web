import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { groupByDate, formatTime, getPolicyModalType } from '../lib/notificationService';
import NotificationsPageView from '../Views/NotificationsView';
// [policy-notif-click] Reuses the same policy modal separated out earlier
// (About / ID Registration) rather than duplicating its content here.
import useDisclosure from '../hooks/Usedisclosure';
import UserPolicyModal from '../modals/UserPolicyModal';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');

  // Use the unified hook to fetch ALL notification types
  const {
    notifs,
    unreadCount,
    markAllRead,
    markOneRead,
  } = useNotifications({ autoMarkReadOnMount: false, limit: 50 });

  // Filter based on tab
  const filteredList = tab === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const groups = groupByDate(filteredList);

  // [policy-notif-click] Only fetched/used when a Policy Update notification
  // is actually clicked; disclosure already carries live tos_content/
  // pp_content/updated_at via its own real-time subscription.
  const { disclosure } = useDisclosure();
  const [policyModalType, setPolicyModalType] = useState(null); // 'tos' | 'privacy' | null

  // Handle clicking a notification card to navigate to specific content
  const handleNotificationClick = useCallback((n) => {
    markOneRead(n.id);

    // [policy-notif-click] Policy Update notifications open the shared
    // policy modal in place, instead of navigating to /announcements.
    const policyType = getPolicyModalType(n);
    if (policyType) {
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
        // Fallback for legacy or unknown types
        if (n.typeId) {
           targetPath = '/announcements';
           queryParams = `announcement=${encodeURIComponent(n.typeId)}`;
        }
        break;
    }

    if (targetPath) {
      try {
        navigate(`${targetPath}?${queryParams}`);
      } catch (err) {
        console.error('Notification navigation failed:', err);
        navigate(targetPath);
      }
    }
  }, [markOneRead, navigate]);

  return (
    <>
    <NotificationsPageView
      tab={tab}
      setTab={setTab}
      loading={false} // Loading is handled internally by hook if needed, or we can add a loading state from hook if exposed
      unreadCount={unreadCount}
      list={filteredList}
      groups={groups}
      markAllRead={markAllRead}
      markOneRead={markOneRead}
      formatTime={formatTime}
      navigate={navigate}
      onNotificationClick={handleNotificationClick}
    />
    {/* [policy-notif-click] Rendered as a sibling of the page view (not
        inside it) since UserPolicyModal is its own fixed-position overlay —
        NotificationsView.jsx itself is untouched. */}
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

export default NotificationsPage;