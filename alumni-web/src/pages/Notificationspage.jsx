import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { groupByDate, formatTime } from '../lib/notificationService';
import NotificationsPageView from './Views/NotificationsView';

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

  // Handle clicking a notification card to navigate to specific content
  const handleNotificationClick = useCallback((n) => {
    markOneRead(n.id);
    
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
  );
};

export default NotificationsPage;