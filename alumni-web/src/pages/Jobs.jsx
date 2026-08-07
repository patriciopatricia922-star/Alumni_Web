import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import JobsView from '../Views/JobsView';
import { useNotifications } from '../hooks/useNotifications';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const CATEGORIES = ['All Jobs', 'Recommended'];

const getProgramKeywords = (program) => {
  const PROGRAM_KEYWORDS = {
    'BSCS': ['IT', 'computer science', 'programming', 'developer', 'technology', 'software', 'cyber', 'security', 'analyst', 'systems'],
    'BSIT': ['IT', 'technology', 'computer', 'programming', 'developer', 'systems', 'analyst', 'service desk', 'support'],
    'BSBA': ['business', 'management', 'marketing', 'accounting', 'finance', 'banking', 'analyst'],
    'BSA': ['accounting', 'audit', 'finance', 'banking', 'valuation', 'business'],
    'BSCE': ['engineering', 'civil', 'construction', 'AutoCAD'],
    'BSCpE': ['engineering', 'computer', 'cloud computing', 'maintenance'],
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

  const [alumniProgram,  setAlumniProgram]  = useState('');
  const [recommended,    setRecommended]    = useState([]);

  const { unreadCount } = useNotifications();

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
          // Use the admin-uploaded image; fall back to null so the card shows the SVG icon instead
          image: job.image_url || job.image || null,
          images: job.image_urls?.length ? job.image_urls : (job.image_url ? [job.image_url] : null),
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

    // On initial page load, default to Recommended if matches exist;
    // only update when the category hasn't been manually changed yet.
    setActiveCategory(prev =>
      prev === 'All Jobs' && scored.length > 0 ? 'Recommended' : prev
    );
  }, [alumniProgram, jobs]);

  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = activeCategory === 'All Jobs'
    ? jobs
    : recommended.map(r => r.job);

  const categoryCounts = {
  'All Jobs':    jobs.length,
  'Recommended': recommended.length,
};

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
      // navigation
      navigate={navigate}
    />
  );
};

export default Jobs;