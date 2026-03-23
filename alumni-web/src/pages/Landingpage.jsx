import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LandingPageView from '../Views/Landingpageview';

const LandingPage = () => {
  const navigate = useNavigate();

  const [isScrolled,      setIsScrolled]      = useState(false);
  const [alumniCount,     setAlumniCount]      = useState('...');
  const [employmentRate,  setEmploymentRate]   = useState('...');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        const alumniTotal    = alumni ?? 0;
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

  const stats = [
    { number: alumniCount,    label: 'Alumni' },
    { number: '44',           label: 'Undergraduate and Postgraduate Programmes' },
    { number: employmentRate, label: 'Employment Rate' },
    { number: '#1201-1300',   label: 'Asia University Ranking' },
  ];

  const missionItems = [
    { label: 'STUDENTS',                        desc: 'by molding them into ethical, spiritual and responsible citizens.' },
    { label: 'FACULTY and EMPLOYEES',           desc: 'by enhancing their competencies, cultivating their commitment and providing a just and fulfilling work environment.' },
    { label: 'ALUMNI',                          desc: 'by instilling in them a sense of pride, commitment, and loyalty to their alma mater.' },
    { label: 'INDUSTRY PARTNERS and EMPLOYERS', desc: 'by providing them Nationalians who will contribute to their growth and development.' },
    { label: 'COMMUNITY',                       desc: "by contributing to the improvement of life's conditions." },
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
    />
  );
};

export default LandingPage;