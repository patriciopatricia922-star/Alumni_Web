import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import NotificationsPageView from '../Views/NotificationsView';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifs,      setNotifs]      = useState([]);
  const [tab,         setTab]         = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      setLoading(true);
      // Note: This currently only fetches announcements. 
      // If you want all types here, this query needs to be updated similar to notificationService.js
      // For now, keeping existing logic as per "preserve existing functionality" instruction.
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error || !data) { setLoading(false); return; }

      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped  = data.map(n => ({
        id:    n.id,
        title: n.title,
        body:  n.content,
        time:  n.published_at,
        read:  readIds.includes(n.id),
      }));

      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
      setLoading(false);
    };

    fetchNotifs();
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem('read_notifs', JSON.stringify(notifs.map(n => n.id)));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { 
      readIds.push(id); 
      localStorage.setItem('read_notifs', JSON.stringify(readIds)); 
    }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const groupByDate = (list) => {
    const today     = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const groups    = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };

    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0, 0, 0, 0);
      if      (d >= today)     groups['Today'].push(n);
      else if (d >= yesterday) groups['Yesterday'].push(n);
      else if (d >= weekAgo)   groups['This Week'].push(n);
      else                     groups['Earlier'].push(n);
    });

    return groups;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60)   + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const list   = tab === 'unread' ? notifs.filter(n => !n.read) : notifs;
  const groups = groupByDate(list);

  return (
    <NotificationsPageView
      notifs={notifs}
      tab={tab}
      setTab={setTab}
      loading={loading}
      unreadCount={unreadCount}
      list={list}
      groups={groups}
      markAllRead={markAllRead}
      markOneRead={markOneRead}
      formatTime={formatTime}
      navigate={navigate}
    />
  );
};

export default NotificationsPage;