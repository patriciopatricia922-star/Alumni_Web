import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AnnouncementsView from '../Views/AnnouncementsView';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const CATEGORIES = ['All Announcements', 'Activities', 'News'];

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso), now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return Math.floor(diff / 60)   + 'm ago';
  if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

const Announcements = () => {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;

  const bellRef   = useRef(null);
  const filterRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('All Announcements');
  const [showFilter,     setShowFilter]     = useState(false);
  const [announcements,  setAnnouncements]  = useState([]);
  const [loading,        setLoading]        = useState(true);

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active, category')
        .eq('is_active', true)
        .order('published_at', { ascending: false });
      if (!error && data) {
        setAnnouncements(data.map(a => ({
          id: a.id, title: a.title, description: a.content,
          time: formatTime(a.published_at),
          category: a.category || 'News',
        })));
      } else {
        setAnnouncements([
          { id: 1, title: 'New Partnership with Industry Leaders', description: 'Hello, Alumni!',     time: '2 hours ago', category: 'News'       },
          { id: 2, title: 'New Partnership with Industry Leaders', description: 'Hello, Alumni!',     time: '2 hours ago', category: 'News'       },
          { id: 3, title: 'Alumni Networking Event 2026',          description: 'Hello, Alumni!',     time: '2 days ago',  category: 'Activities' },
          { id: 4, title: 'Complete Your Alumni Tracer Survey',    description: 'Attention, Alumni!', time: '2 days ago',  category: 'Activities' },
        ]);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error || !data) return;
      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped  = data.map(n => ({ id: n.id, title: n.title, body: n.content, time: n.published_at, read: readIds.includes(n.id) }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current   && !bellRef.current.contains(e.target))   setShowDropdown(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem('read_notifs', JSON.stringify(notifs.map(n => n.id)));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { readIds.push(id); localStorage.setItem('read_notifs', JSON.stringify(readIds)); }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const groupByDate = (list) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0, 0, 0, 0);
      if      (d >= today)     groups['Today'].push(n);
      else if (d >= yesterday) groups['Yesterday'].push(n);
      else if (d >= weekAgo)   groups['This Week'].push(n);
      else                     groups['Earlier'].push(n);
    });
    return groups;
  };

  const filtered = activeCategory === 'All Announcements'
    ? announcements
    : announcements.filter(a => a.category === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All Announcements'
      ? announcements.length
      : announcements.filter(a => a.category === cat).length;
    return acc;
  }, {});

  return (
    <AnnouncementsView
      isMobile={isMobile}
      isTablet={isTablet}
      // announcements
      filtered={filtered}
      loading={loading}
      categories={CATEGORIES}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      categoryCounts={categoryCounts}
      showFilter={showFilter}
      setShowFilter={setShowFilter}
      filterRef={filterRef}
      // notifications
      bellRef={bellRef}
      notifs={notifs}
      unreadCount={unreadCount}
      showDropdown={showDropdown}
      setShowDropdown={setShowDropdown}
      notifTab={notifTab}
      setNotifTab={setNotifTab}
      markAllRead={markAllRead}
      markOneRead={markOneRead}
      groupByDate={groupByDate}
      formatTime={formatTime}
      // navigation
      navigate={navigate}
    />
  );
};

export default Announcements;