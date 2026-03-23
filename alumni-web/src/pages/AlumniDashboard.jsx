import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { loadSurveyProgress } from '../lib/surveyProgress';
import { logAction } from '../lib/auditLogger';
import announcementIcon from '../assets/announcement_ic.svg';
import discountIcon     from '../assets/discount_ic.svg';
import eventsIcon       from '../assets/events_ic.svg';
import jobsIcon         from '../assets/jobs_ic.svg';
import AlumniDashboardView from '../Views/Alumnidashboardview';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const width    = useWindowWidth();

  const [user,               setUser]               = useState(null);
  const [surveyProgress,     setSurveyProgress]     = useState({ percentage: 0 });
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [notifs,             setNotifs]             = useState([]);
  const [unreadCount,        setUnreadCount]        = useState(0);
  const [showDropdown,       setShowDropdown]       = useState(false);
  const [notifTab,           setNotifTab]           = useState('all');
  const bellRef = useRef(null);

  const [cardBadges, setCardBadges] = useState({
    announcements: false,
    events:        false,
    discounts:     false,
    jobs:          false,
  });

  const isMobile     = width < 768;
  const isTablet     = width >= 768 && width < 1024;
  const sidebarWidth = isTablet ? 200 : 229;

  // ── Fetch user + survey progress ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', authUser.id)
        .single();
      if (data) setUser(data);
      const progress = await loadSurveyProgress();
      if (progress) setSurveyProgress(progress);
      await logAction({ action: 'View', module: 'Dashboard', description: 'Alumni viewed dashboard (web)', status: 'Success' });
    };
    fetchData();
  }, []);

  const firstName   = user?.first_name || 'Alumni';
  const progressPct = Math.min(surveyProgress?.percentage || 0, 100);

  // ── Animate progress circle ───────────────────────────────────────────────
  useEffect(() => {
    if (progressPct === 0) { setAnimatedPercentage(0); return; }
    let current = 0;
    const timer = setInterval(() => {
      current += progressPct / 60;
      if (current >= progressPct) { setAnimatedPercentage(progressPct); clearInterval(timer); }
      else setAnimatedPercentage(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [progressPct]);

  // ── Fetch notifications ───────────────────────────────────────────────────
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
      setCardBadges(prev => ({ ...prev, announcements: mapped.some(n => !n.read) }));
    };
    fetchNotifs();
  }, []);

  // ── Fetch card badges ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBadges = async () => {
      const [eventsRes, discountsRes, jobsRes] = await Promise.all([
        supabase.from('events').select('id',    { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('discounts').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('jobs').select('id',      { count: 'exact', head: true }).eq('is_active', true),
      ]);
      setCardBadges(prev => ({
        ...prev,
        events:    (eventsRes.count    || 0) > 0,
        discounts: (discountsRes.count || 0) > 0,
        jobs:      (jobsRes.count      || 0) > 0,
      }));
    };
    fetchBadges();
  }, []);

  // ── Bell outside click ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = notifs.map(n => n.id);
    localStorage.setItem('read_notifs', JSON.stringify(allIds));
    setNotifs(prev => prev.map(n => ({ ...n, read: true }))); setUnreadCount(0);
    setCardBadges(prev => ({ ...prev, announcements: false }));
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { readIds.push(id); localStorage.setItem('read_notifs', JSON.stringify(readIds)); }
    setNotifs(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setCardBadges(p => ({ ...p, announcements: updated.some(n => !n.read) }));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const groupByDate = (list) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate()-7);
    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0,0,0,0);
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
    if (diff < 3600)   return Math.floor(diff/60)   + 'm ago';
    if (diff < 86400)  return Math.floor(diff/3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const forYouItems = [
    { icon: announcementIcon, title: 'Announcements', description: 'Check latest news',    path: '/announcements', showDot: cardBadges.announcements },
    { icon: eventsIcon,       title: 'Events',        description: '5 upcoming events',    path: '/events',        showDot: cardBadges.events        },
    { icon: discountIcon,     title: 'Discounts',     description: '8 offers available',   path: '/discounts',     showDot: cardBadges.discounts     },
    { icon: jobsIcon,         title: 'Jobs',          description: '3 listings available', path: '/jobs',          showDot: cardBadges.jobs          },
  ];

  // ── Responsive sizes ──────────────────────────────────────────────────────
  const CARD_H   = isMobile ? 80  : isTablet ? 120 : 160;
  const ICON_BOX = isMobile ? 60  : isTablet ? 90  : 120;
  const TITLE_SZ = isMobile ? 13  : isTablet ? 16  : 22;
  const SUB_SZ   = isMobile ? 10  : isTablet ? 12  : 16;
  const CIRCLE_SZ = isMobile ? 60  : isTablet ? 80  : 110;
  const CIRCLE_R  = isMobile ? 22  : isTablet ? 30  : 43;
  const PCT_SZ    = isMobile ? 14  : isTablet ? 18  : 26;

  return (
    <AlumniDashboardView
      // Layout
      isMobile={isMobile}
      isTablet={isTablet}
      sidebarWidth={sidebarWidth}
      // User
      firstName={firstName}
      // Notification bell
      bellRef={bellRef}
      notifs={notifs}
      unreadCount={unreadCount}
      showDropdown={showDropdown}
      notifTab={notifTab}
      setShowDropdown={setShowDropdown}
      setNotifTab={setNotifTab}
      markAllRead={markAllRead}
      markOneRead={markOneRead}
      groupByDate={groupByDate}
      formatTime={formatTime}
      onSeeAllNotifs={() => { setShowDropdown(false); navigate('/notifications'); }}
      // Progress
      animatedPercentage={animatedPercentage}
      CIRCLE_SZ={CIRCLE_SZ}
      CIRCLE_R={CIRCLE_R}
      PCT_SZ={PCT_SZ}
      // For You cards
      forYouItems={forYouItems}
      CARD_H={CARD_H}
      ICON_BOX={ICON_BOX}
      TITLE_SZ={TITLE_SZ}
      SUB_SZ={SUB_SZ}
      onNavigate={navigate}
    />
  );
};

export default AlumniDashboard;