import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import JobsView from '../Views/JobsView';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const CATEGORIES = ['All Jobs', 'Full-time', 'Part-time', 'Remote'];

const getProgramKeywords = (program) => {
  const PROGRAM_KEYWORDS = {
    'BSCS': ['IT', 'computer science', 'programming', 'developer', 'technology', 'software', 'cyber', 'security', 'analyst', 'systems'],
    'BSIT': ['IT', 'technology', 'computer', 'programming', 'developer', 'systems', 'analyst', 'service desk', 'support'],
    'BSBA': ['business', 'management', 'marketing', 'accounting', 'finance', 'banking', 'analyst'],
    'BSA': ['accounting', 'audit', 'finance', 'banking', 'valuation', 'business'],
    'BSCE': ['engineering', 'civil', 'construction', 'AutoCAD'],
    'BSME': ['engineering', 'mechanical', 'electrical', 'maintenance'],
    'BSARCH': ['architecture', 'design', 'construction', 'engineering'],
    'BSHM': ['hospitality', 'food', 'management', 'customer service'],
    'BSPSYCH': ['psychology', 'human resources', 'communication', 'relations'],
  };
  if (!program) return [];
  const upper = program.toUpperCase();
  for (const [key, kws] of Object.entries(PROGRAM_KEYWORDS)) {
    if (upper.includes(key.toUpperCase())) return kws;
  }
  return [];
};

const scoreJob = (job, programKws) => {
  const jobText = `${job.title} ${job.description || ''} ${job.company || ''}`.toLowerCase();
  const matches = programKws.filter(kw => jobText.includes(kw.toLowerCase()));
  return { score: matches.length, matchLabel: matches.length > 0 ? 'program match' : null };
};

const Jobs = () => {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;

  const [activeCategory, setActiveCategory] = useState('All Jobs');
  const [showFilter,     setShowFilter]     = useState(false);
  const [jobs,           setJobs]           = useState([]);
  const [loading,        setLoading]        = useState(true);
  const filterRef = useRef(null);
  const bellRef   = useRef(null);

  const [alumniProgram,  setAlumniProgram]  = useState('');
  const [recommended,    setRecommended]    = useState([]);

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_at', { ascending: false });
      
      if (!error && data) {
        const formattedJobs = data.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          date: job.expires_at ? new Date(job.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No expiry',
          website: job.location || '',
          category: job.category || 'Full-time',
          description: job.description,
          tags: [],
          keywords: getProgramKeywords(alumniProgram),
          image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
        }));
        setJobs(formattedJobs);
      }
      setLoading(false);
    };
    fetchJobs();
  }, [alumniProgram]);

  // Fetch alumni program for recommendations
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: userData } = await supabase.from('users').select('program').eq('id', user.id).single();
      const program = userData?.program || '';
      setAlumniProgram(program);
    };
    fetchProfile();
  }, []);

  // Generate recommendations based on program
  useEffect(() => {
    if (!alumniProgram || jobs.length === 0) return;
    const programKws = getProgramKeywords(alumniProgram);
    if (programKws.length === 0) return;
    
    const scored = jobs
      .map(job => ({ job, ...scoreJob(job, programKws) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    
    setRecommended(scored);
  }, [alumniProgram, jobs]);

  // Fetch notifications
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
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
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

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60)   + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const filtered = activeCategory === 'All Jobs'
    ? jobs
    : jobs.filter(j => j.category === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All Jobs' ? jobs.length : jobs.filter(j => j.category === cat).length;
    return acc;
  }, {});

  const recSubtitle = alumniProgram ? `program: ${alumniProgram}` : 'Recommended jobs based on your profile';

  return (
    <JobsView
      isMobile={isMobile}
      isTablet={isTablet}
      loading={loading}
      // category / filter
      categories={CATEGORIES}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      showFilter={showFilter}
      setShowFilter={setShowFilter}
      filterRef={filterRef}
      categoryCounts={categoryCounts}
      filtered={filtered}
      // recommendations
      recommended={recommended}
      recSubtitle={recSubtitle}
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

export default Jobs;