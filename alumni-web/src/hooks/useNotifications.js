// src/hooks/useNotifications.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  fetchNotifications,
  markAllAsRead,
  markOneAsRead,
} from '../lib/notificationService';

export function useNotifications(options = {}) {
  const { autoMarkReadOnMount = false, limit = 20 } = options;

  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab, setNotifTab] = useState('all');
  const bellRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const items = await fetchNotifications(user.id, limit);

      if (autoMarkReadOnMount) {
        const marked = markAllAsRead(items);
        if (!cancelled) {
          setNotifs(marked);
          setUnreadCount(0);
        }
      } else {
        if (!cancelled) {
          setNotifs(items);
          setUnreadCount(items.filter((n) => !n.read).length);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [autoMarkReadOnMount, limit]);

  // Outside click to close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifs((prev) => {
      const updated = markAllAsRead(prev);
      setUnreadCount(0);
      return updated;
    });
  }, []);

  const handleMarkOneRead = useCallback((id) => {
    setNotifs((prev) => {
      const updated = markOneAsRead(prev, id);
      setUnreadCount(updated.filter((n) => !n.read).length);
      return updated;
    });
  }, []);

  const toggleDropdown = useCallback(() => {
    setShowDropdown((v) => !v);
  }, []);

  return {
    bellRef,
    notifs,
    unreadCount,
    showDropdown,
    notifTab,
    setNotifTab,
    setShowDropdown,
    markAllRead: handleMarkAllRead,
    markOneRead: handleMarkOneRead,
    toggleDropdown,
  };
}