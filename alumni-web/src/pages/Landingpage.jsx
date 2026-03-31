import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LandingPageView from '../Views/Landingpageview';

// Helper function to parse separated content (same as in LandingModal)
const parseSeparatedContent = (content, expectedCount = 3) => {
  if (!content) return Array(expectedCount).fill('');
  let parts;
  if (content.includes('\n---\n')) {
    parts = content.split('\n---\n');
  } else if (content.includes('---')) {
    parts = content.split('---');
  } else {
    parts = [content];
  }
  while (parts.length < expectedCount) parts.push('');
  return parts.map(part => part.trim());
};

const LandingPage = () => {
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [alumniCount, setAlumniCount] = useState('...');
  const [employmentRate, setEmploymentRate] = useState('...');
  
  // State for dynamic landing page content
  const [landingSections, setLandingSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  
  // State for events, jobs, discounts (LIMIT TO 3 FOR LANDING PAGE)
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [jobOpportunities, setJobOpportunities] = useState([]);
  const [alumniDiscounts, setAlumniDiscounts] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch landing page sections from database
  useEffect(() => {
    const fetchLandingSections = async () => {
      setLoadingSections(true);
      try {
        const { data, error } = await supabase
          .from('landing_sections')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (!error && data) {
          setLandingSections(data);
        }
      } catch (err) {
        console.error('Error fetching landing sections:', err);
      } finally {
        setLoadingSections(false);
      }
    };
    fetchLandingSections();
  }, []);

  // Fetch Upcoming Events (active and not expired)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(3);
        
        if (!error && data) {
          setUpcomingEvents(data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch Job Opportunities (active jobs)
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('posted_at', { ascending: false })
          .limit(3);
        
        if (!error && data) {
          setJobOpportunities(data);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch Alumni Discounts (active discounts)
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoadingDiscounts(true);
      try {
        const { data, error } = await supabase
          .from('discounts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (!error && data) {
          setAlumniDiscounts(data);
        }
      } catch (err) {
        console.error('Error fetching discounts:', err);
      } finally {
        setLoadingDiscounts(false);
      }
    };
    fetchDiscounts();
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: alumni, error: alumniError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'alumni');
        if (alumniError) console.error('Alumni count error:', alumniError.message);

        const { count: completed, error: completedError } = await supabase
          .from('survey_progress')
          .select('*', { count: 'exact', head: true })
          .eq('completed', true);
        if (completedError) console.error('Completed count error:', completedError.message);

        const alumniTotal = alumni ?? 0;
        const completedTotal = completed ?? 0;
        
        setAlumniCount(alumniTotal > 0 ? alumniTotal.toLocaleString() : '0');
        
        if (alumniTotal > 0) {
          const rate = ((completedTotal / alumniTotal) * 100).toFixed(1);
          setEmploymentRate(`${rate}%`);
        } else {
          setEmploymentRate('0%');
        }
      } catch (err) {
        console.error('fetchStats error:', err);
      }
    };
    fetchStats();
  }, []);

  // Helper function to get section by type
  const getSectionByType = (type) => {
    return landingSections.find(section => section.section_type === type);
  };

  // Get section content
  const heroSection = getSectionByType('hero');
  const statsSection = getSectionByType('stats');
  const eventsSection = getSectionByType('events');
  const jobsSection = getSectionByType('jobs');
  const discountsSection = getSectionByType('discounts');
  const whyJoinSection = getSectionByType('why_join');
  const benefitsSection = getSectionByType('benefits');
  const footerSection = getSectionByType('footer');

  // Parse stats data - use dynamic values for alumni and employment rate
  const statsNumbers = parseSeparatedContent(statsSection?.description, 4);
const statsLabels = parseSeparatedContent(statsSection?.content, 4);

// Build stats array - DYNAMIC VALUES for alumni (index 0) and employment rate (index 2)
const stats = [
  { 
    number: alumniCount,  
    label: statsLabels[0] || 'Alumni' 
  },
  { 
    number: statsNumbers[1] || '44',  // Static from database
    label: statsLabels[1] || 'Undergraduate and Postgraduate Programmes' 
  },
  { 
    number: employmentRate,  
    label: statsLabels[2] || 'Employment Rate' 
  },
  { 
    number: statsNumbers[3] || '#1201-1300',  // Static from database
    label: statsLabels[3] || 'Asia University Ranking' 
  },
];

  const missionItems = [
    { label: 'STUDENTS', desc: 'by molding them into ethical, spiritual and responsible citizens.' },
    { label: 'FACULTY and EMPLOYEES', desc: 'by enhancing their competencies, cultivating their commitment and providing a just and fulfilling work environment.' },
    { label: 'ALUMNI', desc: 'by instilling in them a sense of pride, commitment, and loyalty to their alma mater.' },
    { label: 'INDUSTRY PARTNERS and EMPLOYERS', desc: 'by providing them Nationalians who will contribute to their growth and development.' },
    { label: 'COMMUNITY', desc: "by contributing to the improvement of life's conditions." },
  ];

  const handleViewAll = () => navigate('/login');

  const handleExploreMore = () => {
    document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <LandingPageView
      isScrolled={isScrolled}
      stats={stats}
      missionItems={missionItems}
      onViewAll={handleViewAll}
      onExploreMore={handleExploreMore}
      heroSection={heroSection}
      statsSection={statsSection}
      eventsSection={eventsSection}
      jobsSection={jobsSection}
      discountsSection={discountsSection}
      whyJoinSection={whyJoinSection}
      benefitsSection={benefitsSection}
      footerSection={footerSection}
      loadingSections={loadingSections}
      upcomingEvents={upcomingEvents}
      jobOpportunities={jobOpportunities}
      alumniDiscounts={alumniDiscounts}
      loadingEvents={loadingEvents}
      loadingJobs={loadingJobs}
      loadingDiscounts={loadingDiscounts}
    />
  );
};

export default LandingPage;