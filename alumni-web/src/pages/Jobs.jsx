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

const JOBS = [
  { id: 1,  title: 'UI/UX Designer',                  company: 'Payso',                      date: 'August 19, 2024',  website: 'www.paysopay.com',               category: 'Full-time',  tags: ['Graphic Design', 'Multimedia Arts', 'Fine Arts'],                                                          keywords: ['design', 'arts', 'multimedia', 'creative'],          image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80' },
  { id: 2,  title: 'Architecture',                      company: 'Bizforce',                   date: 'October 3, 2024',  website: 'www.bizforce.com',                category: 'Full-time',  tags: ['Licensed Architect', '5 years experience', 'REVIT Proficiency'],                                           keywords: ['architecture', 'engineering', 'design', 'construction'], image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80' },
  { id: 3,  title: 'IT Operations Monitoring Analyst',  company: 'Dairy Farm Service Center',  date: 'April 21, 2022',   website: 'dfscjobs@dairy-farm.com.ph',     category: 'Full-time',  description: 'DFI Retail Group has a broad and exciting range of careers spread across its operations throughout Asia.',  keywords: ['IT', 'operations', 'technology', 'monitoring', 'analyst', 'computer science'], image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
  { id: 4,  title: 'Jr. Cyber Security Analyst',        company: 'Dairy Farm Service Center',  date: 'April 21, 2022',   website: 'dfscjobs@dairy-farm.com.ph',     category: 'Full-time',  description: 'DFI Retail Group has a broad and exciting range of careers spread across its operations throughout Asia.',  keywords: ['IT', 'security', 'cyber', 'technology', 'computer science', 'analyst'],       image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80' },
  { id: 5,  title: 'Service Desk Analyst',              company: 'Dairy Farm Service Center',  date: 'April 21, 2022',   website: 'dfscjobs@dairy-farm.com.ph',     category: 'Remote',     description: 'DFI Retail Group has a broad and exciting range of careers spread across its operations throughout Asia.',  keywords: ['IT', 'service desk', 'support', 'technology', 'computer science'],             image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80' },
  { id: 6,  title: 'Jr. SAP ABAP Programmer',           company: 'Dairy Farm Service Center',  date: 'April 21, 2022',   website: 'dfscjobs@dairy-farm.com.ph',     category: 'Remote',     description: 'DFI Retail Group has a broad and exciting range of careers spread across its operations throughout Asia.',  keywords: ['IT', 'programming', 'developer', 'SAP', 'technology', 'computer science'],    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80' },
  { id: 7,  title: 'Civil Engineer',                    company: 'Bizforce',                   date: 'October 3, 2024',  website: 'www.bizforce.com',                category: 'Full-time',  tags: ['Licensed Civil Engineer', 'AutoCAD', '5 years experience'],                                                keywords: ['engineering', 'civil', 'construction', 'AutoCAD'],     image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80' },
  { id: 8,  title: 'Marketing Officer',                 company: 'SM City Fairview',           date: 'October 3, 2024',  website: 'jenalyn.reyes@smsupermalls.com', category: 'Full-time',  tags: ['Computer Literate', '2 years experience', 'Strong inter-personal'],                                        keywords: ['marketing', 'business', 'management', 'communication'], image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80' },
  { id: 9,  title: 'Foodcourt Manager',                 company: 'SM City Fairview',           date: 'October 3, 2024',  website: 'jenalyn.reyes@smsupermalls.com', category: 'Full-time',  tags: ['Related Degree', '5 years experience', 'Knowledgeable in Business Operations'],                            keywords: ['management', 'business', 'hospitality', 'food'],       image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
  { id: 10, title: 'Resident Engineer',                 company: 'SM City Fairview',           date: 'October 3, 2024',  website: 'jenalyn.reyes@smsupermalls.com', category: 'Full-time',  tags: ['Electro-Mechanical Maintenance', 'Knowledgeable of codes & safety standards'],                             keywords: ['engineering', 'mechanical', 'electrical', 'maintenance'], image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=600&q=80' },
  { id: 11, title: 'Customer Relation Services',        company: 'SM City San Jose Del Monte', date: 'October 3, 2024',  website: 'jenalyn.reyes@smsupermalls.com', category: 'Part-time',  tags: ['Any 4 years course', '4 years experience', 'Knowledgeable in Security Policies'],                          keywords: ['customer service', 'communication', 'relations', 'business'], image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80' },
  { id: 12, title: 'Management Trainees',               company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Full-time',  description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['banking', 'finance', 'business', 'management', 'accounting'], image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=600&q=80' },
  { id: 13, title: 'Accounting Assistants',             company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Full-time',  description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['accounting', 'finance', 'banking', 'business'],        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80' },
  { id: 14, title: 'Audit Assistants',                  company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Full-time',  description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['audit', 'accounting', 'finance', 'banking'],           image: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&q=80' },
  { id: 15, title: 'Junior Valuation Assistants',       company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Full-time',  description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['valuation', 'finance', 'banking', 'accounting'],       image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80' },
  { id: 16, title: 'Business Analysts',                 company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Remote',     description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['business', 'analyst', 'finance', 'banking'],           image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80' },
];

const PROGRAM_KEYWORDS = {
  'BSCS':    ['IT', 'computer science', 'programming', 'developer', 'technology', 'software', 'cyber', 'security', 'analyst', 'systems'],
  'BSIT':    ['IT', 'technology', 'computer', 'programming', 'developer', 'systems', 'analyst', 'service desk', 'support'],
  'BSBA':    ['business', 'management', 'marketing', 'accounting', 'finance', 'banking', 'analyst'],
  'BSA':     ['accounting', 'audit', 'finance', 'banking', 'valuation', 'business'],
  'BSN':     ['health', 'nursing', 'medical', 'healthcare'],
  'BSCE':    ['engineering', 'civil', 'construction', 'AutoCAD'],
  'BSME':    ['engineering', 'mechanical', 'electrical', 'maintenance'],
  'BSARCH':  ['architecture', 'design', 'construction', 'engineering'],
  'BSHM':    ['hospitality', 'food', 'management', 'customer service'],
  'BSED':    ['education', 'teaching', 'communication'],
  'BSPSYCH': ['psychology', 'human resources', 'communication', 'relations'],
  'BSHRM':   ['hospitality', 'food', 'management', 'customer service', 'relations'],
  'BSENTREP':['business', 'management', 'marketing', 'finance'],
  'BSCRIM':  ['security', 'government', 'management', 'relations'],
};

const INDUSTRY_KEYWORDS = {
  'Manufacturing':          ['engineering', 'operations', 'mechanical', 'production', 'analyst'],
  'IT':                     ['IT', 'technology', 'computer science', 'programming', 'developer', 'cyber', 'security', 'analyst'],
  'Information Technology': ['IT', 'technology', 'programming', 'developer', 'systems', 'analyst'],
  'Banking':                ['banking', 'finance', 'accounting', 'audit', 'business', 'analyst'],
  'Finance':                ['finance', 'banking', 'accounting', 'audit', 'business', 'analyst'],
  'Healthcare':             ['health', 'nursing', 'medical', 'healthcare'],
  'Education':              ['education', 'teaching', 'communication'],
  'Retail':                 ['business', 'management', 'customer service', 'marketing'],
  'Construction':           ['engineering', 'civil', 'construction', 'architecture'],
  'Hospitality':            ['hospitality', 'food', 'management', 'customer service'],
  'Marketing':              ['marketing', 'business', 'communication', 'creative', 'design'],
  'Government':             ['management', 'business', 'analyst', 'communication'],
};

const getIndustryKeywords = (industry) => {
  if (!industry) return [];
  const upper = industry.toUpperCase();
  for (const [key, kws] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (upper.includes(key.toUpperCase())) return kws;
  }
  if (upper.includes('IT') || upper.includes('TECH') || upper.includes('SOFTW'))                                    return INDUSTRY_KEYWORDS['IT'];
  if (upper.includes('BANK') || upper.includes('FINANC'))                                                            return INDUSTRY_KEYWORDS['Banking'];
  if (upper.includes('HEALTH') || upper.includes('MEDIC') || (upper.includes('HOSP') && upper.includes('HEALTH')))  return INDUSTRY_KEYWORDS['Healthcare'];
  if (upper.includes('RETAIL') || upper.includes('MALL') || upper.includes('SHOP'))                                 return INDUSTRY_KEYWORDS['Retail'];
  if (upper.includes('CONSTRUCT') || upper.includes('INFRA'))                                                        return INDUSTRY_KEYWORDS['Construction'];
  if (upper.includes('HOTEL') || upper.includes('RESTAURANT') || upper.includes('FOOD'))                            return INDUSTRY_KEYWORDS['Hospitality'];
  if (upper.includes('MARKET'))                                                                                       return INDUSTRY_KEYWORDS['Marketing'];
  if (upper.includes('MANUFACTUR') || upper.includes('FACTORY'))                                                     return INDUSTRY_KEYWORDS['Manufacturing'];
  if (upper.includes('EDUC') || upper.includes('SCHOOL') || upper.includes('UNIV'))                                 return INDUSTRY_KEYWORDS['Education'];
  return [];
};

const getProgramKeywords = (program) => {
  if (!program) return [];
  const upper = program.toUpperCase();
  for (const [key, kws] of Object.entries(PROGRAM_KEYWORDS)) {
    if (upper.includes(key.toUpperCase())) return kws;
  }
  if (upper.includes('COMPUTER SCIENCE') || upper.includes('COMPSCI'))                         return PROGRAM_KEYWORDS['BSCS'];
  if (upper.includes('INFORMATION TECH') || upper.includes('INFO TECH'))                        return PROGRAM_KEYWORDS['BSIT'];
  if (upper.includes('BUSINESS ADMIN')   || upper.includes('BUSINESS ADMINISTRATION'))          return PROGRAM_KEYWORDS['BSBA'];
  if (upper.includes('ACCOUNTANC')       || upper.includes('ACCOUNTING'))                       return PROGRAM_KEYWORDS['BSA'];
  if (upper.includes('NURSING'))                                                                 return PROGRAM_KEYWORDS['BSN'];
  if (upper.includes('CIVIL ENG'))                                                               return PROGRAM_KEYWORDS['BSCE'];
  if (upper.includes('MECHANICAL'))                                                              return PROGRAM_KEYWORDS['BSME'];
  if (upper.includes('ARCHITECT'))                                                               return PROGRAM_KEYWORDS['BSARCH'];
  if (upper.includes('HOSPITALITY') || upper.includes('HOTEL'))                                 return PROGRAM_KEYWORDS['BSHM'];
  if (upper.includes('EDUCATION')   || upper.includes('EDUC'))                                  return PROGRAM_KEYWORDS['BSED'];
  if (upper.includes('PSYCHOLOGY')  || upper.includes('PSYCH'))                                 return PROGRAM_KEYWORDS['BSPSYCH'];
  if (upper.includes('ENTREPRENEUR'))                                                             return PROGRAM_KEYWORDS['BSENTREP'];
  if (upper.includes('CRIMINOL'))                                                                return PROGRAM_KEYWORDS['BSCRIM'];
  return [];
};

const scoreJob = (job, programKws, industryKws, jobPositionKws) => {
  const allProfileKws = [...new Set([...programKws, ...industryKws, ...jobPositionKws])];
  const jobKws = (job.keywords || []).map(k => k.toLowerCase());
  const matches = allProfileKws.filter(kw => jobKws.some(jk => jk.includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk)));
  const programMatches  = programKws.filter(kw     => jobKws.some(jk => jk.includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk)));
  const industryMatches = industryKws.filter(kw    => jobKws.some(jk => jk.includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk)));
  const positionMatches = jobPositionKws.filter(kw => jobKws.some(jk => jk.includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk)));
  let matchLabel = null;
  if (programMatches.length > 0 && industryMatches.length > 0) matchLabel = 'program + field';
  else if (programMatches.length > 0)                           matchLabel = 'program match';
  else if (positionMatches.length > 0)                          matchLabel = 'field match';
  else if (industryMatches.length > 0)                          matchLabel = 'industry match';
  return { score: matches.length, matchLabel };
};

const Jobs = () => {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;

  const [activeCategory, setActiveCategory] = useState('All Jobs');
  const [showFilter,     setShowFilter]     = useState(false);
  const filterRef = useRef(null);
  const bellRef   = useRef(null);

  const [alumniProgram,  setAlumniProgram]  = useState('');
  const [alumniIndustry, setAlumniIndustry] = useState('');
  const [alumniPosition, setAlumniPosition] = useState('');
  const [recommended,    setRecommended]    = useState([]);

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
      if (bellRef.current  && !bellRef.current.contains(e.target))    setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData }   = await supabase.from('users').select('program').eq('id', user.id).single();
      const { data: surveyData } = await supabase.from('survey_responses').select('employment_information_data').eq('user_id', user.id).single();

      const program  = userData?.program || '';
      const empData  = surveyData?.employment_information_data || {};
      const industry = empData.type_of_industry || '';
      const position = empData.job_position     || '';

      setAlumniProgram(program);
      setAlumniIndustry(industry);
      setAlumniPosition(position);

      const programKws  = getProgramKeywords(program);
      const industryKws = getIndustryKeywords(industry);
      const positionKws = position
        ? position.toLowerCase().split(/[\s,/]+/).filter(w => w.length > 2)
        : [];

      if (!programKws.length && !industryKws.length && !positionKws.length) return;

      const scored = JOBS
        .map(job => ({ job, ...scoreJob(job, programKws, industryKws, positionKws) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      setRecommended(scored);
    };
    fetchProfile();
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
    ? JOBS
    : JOBS.filter(j => j.category === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All Jobs' ? JOBS.length : JOBS.filter(j => j.category === cat).length;
    return acc;
  }, {});

  const recSubtitle = [
    alumniProgram  && alumniProgram,
    alumniIndustry && alumniIndustry + ' industry',
    alumniPosition && alumniPosition,
  ].filter(Boolean).join(' · ');

  return (
    <JobsView
      isMobile={isMobile}
      isTablet={isTablet}
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