import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LandingPageView from '../Views/Landingpageview';
import LandingModalManager from '../pages/LandingModalManager';

const parseSeparatedContent = (content, expectedCount = 3) => {
  if (!content) return Array(expectedCount).fill('');
  let parts;
  if (content.includes('\n---\n'))    parts = content.split('\n---\n');
  else if (content.includes('---'))   parts = content.split('---');
  else                                parts = [content];
  while (parts.length < expectedCount) parts.push('');
  return parts.map(part => part.trim());
};

const LandingPage = () => {
  const navigate = useNavigate();

  // ── Modal state ──────────────────────────────────────────
  // modal: null | 'register' | 'signup' | 'login' | 'forgot-password' | 'verification' | 'reset-password'
  const [modal, setModal] = useState(null);
  const [idExtracted, setIdExtracted] = useState(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const openRegister = useCallback(() => {
    setIdExtracted(null);
    setModal('register');
  }, []);

  const openLogin = useCallback(() => setModal('login'), []);

  const closeModal = useCallback(() => {
    setModal(null);
    setForgotPasswordEmail('');
  }, []);

  // Called by IDRegistration when verified → advance to signup panel
  const handleIDVerified = useCallback((extractedData) => {
    setIdExtracted(extractedData);
    setModal('signup');
  }, []);

  // Called by Signup on success → close modal, stay on landing
  const handleSignupSuccess = useCallback(() => {
    setModal(null);
    setIdExtracted(null);
  }, []);

  // Called by Login on success → navigate normally
  const handleLoginSuccess = useCallback((redirectPath) => {
    setModal(null);
    navigate(redirectPath);
  }, [navigate]);

  // ── Forgot password flow handlers ─────────────────────────
  const handleSwitchToForgotPassword = useCallback(() => {
    setModal('forgot-password');
    setForgotPasswordEmail('');
  }, []);

  const handleSwitchToVerification = useCallback((email) => {
    setForgotPasswordEmail(email);
    setModal('verification');
  }, []);

  const handleSwitchToResetPassword = useCallback(() => {
    setModal('reset-password');
  }, []);

  // ── Scroll ────────────────────────────────────────────────
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const getScrollTop = () =>
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  const onScroll = () => {
    setIsScrolled(getScrollTop() > 50);
  };

  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll, { capture: true });
  };
}, []);

  // ── Stats ─────────────────────────────────────────────────
  const [alumniCount, setAlumniCount] = useState('...');
  const [employmentRate, setEmploymentRate] = useState('...');

  // ── CMS sections ─────────────────────────────────────────
  const [landingSections, setLandingSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  // ── Content ───────────────────────────────────────────────
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [jobOpportunities, setJobOpportunities] = useState([]);
  const [alumniDiscounts, setAlumniDiscounts] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);

  // ── Helper: fetch active landing sections ─────────────────
  const fetchActiveLandingSections = useCallback(() => {
    return supabase
      .from('landing_sections')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setLandingSections(data);
      });
  }, []);

  // ── Landing sections with real-time subscription ──────────
  // Admin-side changes (create, update, archive, toggle visibility)
  // are reflected on the landing page without a manual page reload.
  useEffect(() => {
    fetchActiveLandingSections().finally(() => setLoadingSections(false));

    const channel = supabase
      .channel('landing_sections_public_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'landing_sections' },
        () => {
          // Re-fetch whenever any row in landing_sections changes
          fetchActiveLandingSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveLandingSections]);

  useEffect(() => {
    supabase.from('events').select('*').eq('is_active', true).gte('event_date', new Date().toISOString()).order('event_date', { ascending: true }).limit(3)
      .then(({ data, error }) => { if (!error && data) setUpcomingEvents(data); })
      .finally(() => setLoadingEvents(false));
  }, []);

  useEffect(() => {
    supabase.from('jobs').select('*').eq('is_active', true).order('posted_at', { ascending: false }).limit(3)
      .then(({ data, error }) => { if (!error && data) setJobOpportunities(data); })
      .finally(() => setLoadingJobs(false));
  }, []);

  useEffect(() => {
    supabase.from('discounts').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3)
      .then(({ data, error }) => { if (!error && data) setAlumniDiscounts(data); })
      .finally(() => setLoadingDiscounts(false));
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: alumni } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'alumni');
        const { count: completed } = await supabase.from('survey_progress').select('*', { count: 'exact', head: true }).eq('completed', true);
        const alumniTotal = alumni ?? 0;
        const completedTotal = completed ?? 0;
        setAlumniCount(alumniTotal > 0 ? alumniTotal.toLocaleString() : '0');
        setEmploymentRate(alumniTotal > 0 ? `${((completedTotal / alumniTotal) * 100).toFixed(1)}%` : '0%');
      } catch (err) {
        console.error('fetchStats error:', err);
      }
    };
    fetchStats();
  }, []);

  const getSectionByType = (type) => landingSections.find(s => s.section_type === type);

  const heroSection      = getSectionByType('hero');
  const statsSection     = getSectionByType('stats');
  const eventsSection    = getSectionByType('events');
  const jobsSection      = getSectionByType('jobs');
  const discountsSection = getSectionByType('discounts');
  const whyJoinSection   = getSectionByType('why_join');
  const benefitsSection  = getSectionByType('benefits');
  const footerSection    = getSectionByType('footer');

  const statsNumbers = parseSeparatedContent(statsSection?.description, 4);
  const statsLabels  = parseSeparatedContent(statsSection?.content, 4);

  const stats = [
    { number: alumniCount,              label: statsLabels[0] || 'Alumni' },
    { number: statsNumbers[1] || '44',  label: statsLabels[1] || 'Undergraduate and Postgraduate Programmes' },
    { number: employmentRate,           label: statsLabels[2] || 'Employment Rate' },
    { number: statsNumbers[3] || '#1201-1300', label: statsLabels[3] || 'Asia University Ranking' },
  ];

  const missionItems = [
    { label: 'STUDENTS',                        desc: 'by molding them into ethical, spiritual and responsible citizens.' },
    { label: 'FACULTY and EMPLOYEES',           desc: 'by enhancing their competencies, cultivating their commitment and providing a just and fulfilling work environment.' },
    { label: 'ALUMNI',                          desc: 'by instilling in them a sense of pride, commitment, and loyalty to their alma mater.' },
    { label: 'INDUSTRY PARTNERS and EMPLOYERS', desc: 'by providing them Nationalians who will contribute to their growth and development.' },
    { label: 'COMMUNITY',                       desc: "by contributing to the improvement of life's conditions." },
  ];

  const handleExploreMore = () => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <LandingPageView
        isScrolled={isScrolled}
        stats={stats}
        missionItems={missionItems}
        onViewAll={openLogin}
        onExploreMore={handleExploreMore}
        onOpenLogin={openLogin}
        onOpenRegister={openRegister}
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

      {/* Modal overlay — rendered above landing page */}
      {modal && (
        <LandingModalManager
          modal={modal}
          idExtracted={idExtracted}
          forgotPasswordEmail={forgotPasswordEmail}
          onClose={closeModal}
          onIDVerified={handleIDVerified}
          onSignupSuccess={handleSignupSuccess}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToLogin={openLogin}
          onSwitchToRegister={openRegister}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
          onSwitchToVerification={handleSwitchToVerification}
          onSwitchToResetPassword={handleSwitchToResetPassword}
        />
      )}
    </>
  );
};

export default LandingPage;