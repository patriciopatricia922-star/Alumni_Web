import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

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
  { id: 1,  title: 'UI/UX Designer',                  company: 'Payso',                      date: 'August 19, 2024',  website: 'www.paysopay.com',               category: 'Full-time',  tags: ['Graphic Design', 'Multimedia Arts', 'Fine Arts'],                                                          keywords: ['design', 'arts', 'multimedia', 'creative'] },
  { id: 2,  title: 'Architecture',                      company: 'Bizforce',                   date: 'October 3, 2024',  website: 'www.bizforce.com',                category: 'Full-time',  tags: ['Licensed Architect', '5 years experience', 'REVIT Proficiency'],                                           keywords: ['architecture', 'engineering', 'design', 'construction'] },
  { id: 3,  title: 'IT Operations Monitoring Analyst',  company: 'Dairy Farm Service Center',  date: 'April 21, 2022',   website: 'dfscjobs@dairy-farm.com.ph',     category: 'Full-time',  description: 'DFI Retail Group has a broad and exciting range of careers spread across its operations throughout Asia.',  keywords: ['IT', 'operations', 'technology', 'monitoring', 'analyst', 'computer science'] },
  { id: 4,  title: 'Jr. Cyber Security Analyst',        company: 'Dairy Farm Service Center',  date: 'April 21, 2022',   website: 'dfscjobs@dairy-farm.com.ph',     category: 'Full-time',  description: 'DFI Retail Group has a broad and exciting range of careers spread across its operations throughout Asia.',  keywords: ['IT', 'security', 'cyber', 'technology', 'computer science', 'analyst'] },
  { id: 5,  title: 'Service Desk Analyst',              company: 'Dairy Farm Service Center',  date: 'April 21, 2022',   website: 'dfscjobs@dairy-farm.com.ph',     category: 'Remote',     description: 'DFI Retail Group has a broad and exciting range of careers spread across its operations throughout Asia.',  keywords: ['IT', 'service desk', 'support', 'technology', 'computer science'] },
  { id: 6,  title: 'Jr. SAP ABAP Programmer',           company: 'Dairy Farm Service Center',  date: 'April 21, 2022',   website: 'dfscjobs@dairy-farm.com.ph',     category: 'Remote',     description: 'DFI Retail Group has a broad and exciting range of careers spread across its operations throughout Asia.',  keywords: ['IT', 'programming', 'developer', 'SAP', 'technology', 'computer science'] },
  { id: 7,  title: 'Civil Engineer',                    company: 'Bizforce',                   date: 'October 3, 2024',  website: 'www.bizforce.com',                category: 'Full-time',  tags: ['Licensed Civil Engineer', 'AutoCAD', '5 years experience'],                                                keywords: ['engineering', 'civil', 'construction', 'AutoCAD'] },
  { id: 8,  title: 'Marketing Officer',                 company: 'SM City Fairview',           date: 'October 3, 2024',  website: 'jenalyn.reyes@smsupermalls.com', category: 'Full-time',  tags: ['Computer Literate', '2 years experience', 'Strong inter-personal'],                                        keywords: ['marketing', 'business', 'management', 'communication'] },
  { id: 9,  title: 'Foodcourt Manager',                 company: 'SM City Fairview',           date: 'October 3, 2024',  website: 'jenalyn.reyes@smsupermalls.com', category: 'Full-time',  tags: ['Related Degree', '5 years experience', 'Knowledgeable in Business Operations'],                            keywords: ['management', 'business', 'hospitality', 'food'] },
  { id: 10, title: 'Resident Engineer',                 company: 'SM City Fairview',           date: 'October 3, 2024',  website: 'jenalyn.reyes@smsupermalls.com', category: 'Full-time',  tags: ['Electro-Mechanical Maintenance', 'Knowledgeable of codes & safety standards'],                             keywords: ['engineering', 'mechanical', 'electrical', 'maintenance'] },
  { id: 11, title: 'Customer Relation Services',        company: 'SM City San Jose Del Monte', date: 'October 3, 2024',  website: 'jenalyn.reyes@smsupermalls.com', category: 'Part-time',  tags: ['Any 4 years course', '4 years experience', 'Knowledgeable in Security Policies'],                          keywords: ['customer service', 'communication', 'relations', 'business'] },
  { id: 12, title: 'Management Trainees',               company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Full-time',  description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['banking', 'finance', 'business', 'management', 'accounting'] },
  { id: 13, title: 'Accounting Assistants',             company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Full-time',  description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['accounting', 'finance', 'banking', 'business'] },
  { id: 14, title: 'Audit Assistants',                  company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Full-time',  description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['audit', 'accounting', 'finance', 'banking'] },
  { id: 15, title: 'Junior Valuation Assistants',       company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Full-time',  description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['valuation', 'finance', 'banking', 'accounting'] },
  { id: 16, title: 'Business Analysts',                 company: 'China Bank',                 date: 'April 21, 2022',   website: 'careers@chinabank.ph',           category: 'Remote',     description: 'China Banking Corporation is one of the leading private universal banks in the Philippines.',           keywords: ['business', 'analyst', 'finance', 'banking'] },
];

// ── Program → keyword map ──────────────────────────────────────────────────────
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

// ── Partial industry match ─────────────────────────────────────────────────────
const getIndustryKeywords = (industry) => {
  if (!industry) return [];
  const upper = industry.toUpperCase();
  for (const [key, kws] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (upper.includes(key.toUpperCase())) return kws;
  }
  // Fallback broad matches
  if (upper.includes('IT') || upper.includes('TECH') || upper.includes('SOFTW'))   return INDUSTRY_KEYWORDS['IT'];
  if (upper.includes('BANK') || upper.includes('FINANC'))                           return INDUSTRY_KEYWORDS['Banking'];
  if (upper.includes('HEALTH') || upper.includes('MEDIC') || upper.includes('HOSP') && upper.includes('HEALTH')) return INDUSTRY_KEYWORDS['Healthcare'];
  if (upper.includes('RETAIL') || upper.includes('MALL') || upper.includes('SHOP')) return INDUSTRY_KEYWORDS['Retail'];
  if (upper.includes('CONSTRUCT') || upper.includes('INFRA'))                       return INDUSTRY_KEYWORDS['Construction'];
  if (upper.includes('HOTEL') || upper.includes('RESTAURANT') || upper.includes('FOOD')) return INDUSTRY_KEYWORDS['Hospitality'];
  if (upper.includes('MARKET'))                                                      return INDUSTRY_KEYWORDS['Marketing'];
  if (upper.includes('MANUFACTUR') || upper.includes('FACTORY'))                    return INDUSTRY_KEYWORDS['Manufacturing'];
  if (upper.includes('EDUC') || upper.includes('SCHOOL') || upper.includes('UNIV')) return INDUSTRY_KEYWORDS['Education'];
  return [];
};

// ── Partial program match — handles "BSBA - MktgMgt", "BS Computer Science", etc ──
const getProgramKeywords = (program) => {
  if (!program) return [];
  const upper = program.toUpperCase();
  for (const [key, kws] of Object.entries(PROGRAM_KEYWORDS)) {
    if (upper.includes(key.toUpperCase())) return kws;
  }
  // Fallback: check common full-name variants
  if (upper.includes('COMPUTER SCIENCE') || upper.includes('COMPSCI')) return PROGRAM_KEYWORDS['BSCS'];
  if (upper.includes('INFORMATION TECH') || upper.includes('INFO TECH'))  return PROGRAM_KEYWORDS['BSIT'];
  if (upper.includes('BUSINESS ADMIN')   || upper.includes('BUSINESS ADMINISTRATION')) return PROGRAM_KEYWORDS['BSBA'];
  if (upper.includes('ACCOUNTANC')       || upper.includes('ACCOUNTING'))  return PROGRAM_KEYWORDS['BSA'];
  if (upper.includes('NURSING'))          return PROGRAM_KEYWORDS['BSN'];
  if (upper.includes('CIVIL ENG'))        return PROGRAM_KEYWORDS['BSCE'];
  if (upper.includes('MECHANICAL'))       return PROGRAM_KEYWORDS['BSME'];
  if (upper.includes('ARCHITECT'))        return PROGRAM_KEYWORDS['BSARCH'];
  if (upper.includes('HOSPITALITY') || upper.includes('HOTEL')) return PROGRAM_KEYWORDS['BSHM'];
  if (upper.includes('EDUCATION') || upper.includes('EDUC'))    return PROGRAM_KEYWORDS['BSED'];
  if (upper.includes('PSYCHOLOGY') || upper.includes('PSYCH'))  return PROGRAM_KEYWORDS['BSPSYCH'];
  if (upper.includes('ENTREPRENEUR'))     return PROGRAM_KEYWORDS['BSENTREP'];
  if (upper.includes('CRIMINOL'))         return PROGRAM_KEYWORDS['BSCRIM'];
  return [];
};

// ── Industry → keyword map ─────────────────────────────────────────────────────
const INDUSTRY_KEYWORDS = {
  'Manufacturing':        ['engineering', 'operations', 'mechanical', 'production', 'analyst'],
  'IT':                   ['IT', 'technology', 'computer science', 'programming', 'developer', 'cyber', 'security', 'analyst'],
  'Information Technology': ['IT', 'technology', 'programming', 'developer', 'systems', 'analyst'],
  'Banking':              ['banking', 'finance', 'accounting', 'audit', 'business', 'analyst'],
  'Finance':              ['finance', 'banking', 'accounting', 'audit', 'business', 'analyst'],
  'Healthcare':           ['health', 'nursing', 'medical', 'healthcare'],
  'Education':            ['education', 'teaching', 'communication'],
  'Retail':               ['business', 'management', 'customer service', 'marketing'],
  'Construction':         ['engineering', 'civil', 'construction', 'architecture'],
  'Hospitality':          ['hospitality', 'food', 'management', 'customer service'],
  'Marketing':            ['marketing', 'business', 'communication', 'creative', 'design'],
  'Government':           ['management', 'business', 'analyst', 'communication'],
};

// ── Scoring function ───────────────────────────────────────────────────────────
const scoreJob = (job, programKws, industryKws, jobPositionKws) => {
  const allProfileKws = [...new Set([...programKws, ...industryKws, ...jobPositionKws])];
  const jobKws = (job.keywords || []).map(k => k.toLowerCase());
  const matches = allProfileKws.filter(kw => jobKws.some(jk => jk.includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk)));
  let matchLabel = null;
  const programMatches  = programKws.filter(kw  => jobKws.some(jk => jk.includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk)));
  const industryMatches = industryKws.filter(kw  => jobKws.some(jk => jk.includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk)));
  const positionMatches = jobPositionKws.filter(kw => jobKws.some(jk => jk.includes(kw.toLowerCase()) || kw.toLowerCase().includes(jk)));
  if (programMatches.length > 0 && industryMatches.length > 0) matchLabel = 'program + field';
  else if (programMatches.length > 0) matchLabel = 'program match';
  else if (positionMatches.length > 0) matchLabel = 'field match';
  else if (industryMatches.length > 0) matchLabel = 'industry match';
  return { score: matches.length, matchLabel };
};

// ── Icons ──────────────────────────────────────────────────────────────────────
const BriefcaseIcon = ({ size = 20, opacity = 0.7 }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 20 18" fill="none">
    <rect x="1" y="5" width="18" height="12" rx="2" stroke={`rgba(255,255,255,${opacity})`} strokeWidth="1.5"/>
    <path d="M7 5V3a1 1 0 011-1h4a1 1 0 011 1v2" stroke={`rgba(255,255,255,${opacity})`} strokeWidth="1.5"/>
    <path d="M1 10h18" stroke={`rgba(255,255,255,${opacity})`} strokeWidth="1.5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2" width="14" height="13" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M1 6h14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M5 1v2M11 1v2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3"  r="1.2" fill="rgba(255,255,255,0.4)"/>
    <circle cx="8" cy="8"  r="1.2" fill="rgba(255,255,255,0.4)"/>
    <circle cx="8" cy="13" r="1.2" fill="rgba(255,255,255,0.4)"/>
  </svg>
);

// ── Recommended Card (Discounts-style) ────────────────────────────────────────
const RecommendedCard = ({ job, matchLabel, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(0,62,166,0.35)',
        border: `0.889px solid ${hovered ? 'rgba(255,200,80,0.6)' : 'rgba(255,200,80,0.25)'}`,
        boxShadow: hovered
          ? '0px 0px 20px rgba(255,180,50,0.15), 0px 8px 24px rgba(0,0,0,0.4)'
          : '0px 0px 8px rgba(255,255,255,0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Card image area */}
      <div style={{
        height: '110px',
        background: 'linear-gradient(180deg, rgba(30,37,85,0.9) 0%, rgba(15,19,56,0.95) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }}>
          <BriefcaseIcon size={40} opacity={0.5} />
        </div>
        {/* Match badge */}
        {matchLabel && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(250,199,117,0.15)',
            border: '0.5px solid #FAC775',
            borderRadius: '7px', padding: '3px 8px',
            fontSize: '10px', fontWeight: 700, color: '#FAC775',
            fontFamily: 'Arimo, Arial',
          }}>
            {matchLabel}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '14px', color: '#FFED97', margin: 0, lineHeight: '1.35' }}>
          {job.title}
        </p>
        <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          {job.company}
        </p>
        {job.tags ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '2px' }}>
            {job.tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontFamily: 'Arimo, Arial', color: 'rgba(255,255,255,0.75)' }}>
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {job.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '0.5px solid rgba(255,255,255,0.08)',
        padding: '8px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CalendarIcon />
          <span style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{job.date}</span>
        </div>
        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{job.website}</span>
      </div>
    </div>
  );
};

// ── Regular Job Card ───────────────────────────────────────────────────────────
const JobCard = ({ job, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(13,19,56,0.4)',
        border: `1.24px solid ${hovered ? 'rgba(43,114,251,0.4)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hovered
          ? '0px 0px 20px rgba(43,114,251,0.25), 0px 8px 24px rgba(0,0,0,0.4)'
          : '0px 2px 2px rgba(255,255,255,0.25)',
        borderRadius: '16px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: isMobile ? '14px 14px 14px 16px' : '18px 18px 18px 22px', borderBottom: '0.89px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          width: '46px', height: '46px', flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
          boxShadow: '0px 10px 15px rgba(97,95,255,0.3), 0px 4px 6px rgba(43,114,251,0.15)',
          borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.3s ease',
        }}>
          <BriefcaseIcon size={20} opacity={0.8} />
        </div>
        <div style={{ flex: 1, paddingLeft: '14px' }}>
          <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', lineHeight: '22px', color: '#FFED97', margin: '0 0 3px 0' }}>{job.title}</p>
          <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>{job.company}</p>
        </div>
        <div style={{ paddingTop: '3px', cursor: 'pointer' }}><MoreIcon /></div>
      </div>
      <div style={{ padding: '12px 22px', flex: 1 }}>
        {job.tags ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {job.tags.map((tag, i) => (
              <div key={i} style={{ padding: '4px 11px', background: 'rgba(243,243,245,0.17)', border: '1.24px solid rgba(0,0,0,0.25)', borderRadius: '8px' }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{tag}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px', lineHeight: '22px', color: 'rgba(255,255,255,0.65)', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {job.description}
          </p>
        )}
      </div>
      <div style={{ borderTop: '1.24px solid rgba(255,255,255,0.05)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <CalendarIcon />
          <span style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{job.date}</span>
        </div>
        <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{job.website}</span>
      </div>
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────────
const Jobs = () => {
  const navigate     = useNavigate();
  const width        = useWindowWidth();
  const isMobile     = width < 768;
  const isTablet     = width >= 768 && width < 1024;
  const sidebarWidth = isTablet ? 200 : 229;

  const [activeCategory, setActiveCategory] = useState('All Jobs');
  const [showFilter,     setShowFilter]     = useState(false);
  const filterRef = useRef(null);
  const bellRef   = useRef(null);

  // ── Alumni profile state ───────────────────────────────────────────────────
  const [alumniProgram,   setAlumniProgram]   = useState('');
  const [alumniIndustry,  setAlumniIndustry]  = useState('');
  const [alumniPosition,  setAlumniPosition]  = useState('');
  const [recommended,     setRecommended]     = useState([]);

  // ── Notification state ─────────────────────────────────────────────────────
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  // ── Outside click ──────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Fetch alumni profile + build recommendations ───────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('program')
        .eq('id', user.id)
        .single();

      const { data: surveyData } = await supabase
        .from('survey_responses')
        .select('employment_information_data')
        .eq('user_id', user.id)
        .single();

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

  // ── Notifications ──────────────────────────────────────────────────────────
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
    setNotifs(prev => prev.map(n => ({ ...n, read: true }))); setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { readIds.push(id); localStorage.setItem('read_notifs', JSON.stringify(readIds)); }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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

  // ── Filtered data ──────────────────────────────────────────────────────────
  const recommendedIds = new Set(recommended.map(r => r.job.id));
  const filtered = (activeCategory === 'All Jobs'
    ? JOBS
    : JOBS.filter(j => j.category === activeCategory)
  );

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All Jobs' ? JOBS.length : JOBS.filter(j => j.category === cat).length;
    return acc;
  }, {});

  const hasRecommended = recommended.length > 0;
  const recCols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr';
  const allCols = isMobile ? '1fr' : '1fr 1fr';

  // ── Recommendation subtitle ────────────────────────────────────────────────
  const recSubtitle = [
    alumniProgram  && alumniProgram,
    alumniIndustry && alumniIndustry + ' industry',
    alumniPosition && alumniPosition,
  ].filter(Boolean).join(' · ');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial, sans-serif' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        padding: isMobile ? '24px 16px 90px' : isTablet ? '37px 28px 48px' : '37px 51px 60px',
        boxSizing: 'border-box', overflowX: 'hidden', position: 'relative',
      }}>

        {/* ── Notification Bell ──────────────────────────────────────────────── */}
        <div ref={bellRef} style={{ position: 'absolute', top: isMobile?'24px':'37px', right: isMobile?'16px':isTablet?'28px':'51px', zIndex: 200 }}>
          <button onClick={() => setShowDropdown(v => !v)} style={{
            width: isMobile?'44px':'62px', height: isMobile?'44px':'62px',
            background: showDropdown ? 'rgba(43,114,251,0.2)' : 'rgba(0,62,166,0.35)',
            border: showDropdown ? '0.8px solid rgba(43,114,251,0.5)' : '0.8px solid rgba(255,255,255,0.2)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'all 0.15s',
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z" stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <>
                <div style={{ position: 'absolute', top: '-4.41px', right: '-4.41px', width: '28.81px', height: '28.81px', background: '#2B72FB', opacity: 0.42, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: '-1px', right: '-1px', minWidth: '20px', height: '20px', background: '#2B72FB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FFFFFF', fontWeight: 400 }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                </div>
              </>
            )}
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', top: isMobile?'52px':'70px', right: 0, width: isMobile?'90vw':'380px', maxHeight: '520px', background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>Notifications</span>
                {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0 }}>Mark all read</button>}
              </div>
              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                {['all','unread'].map(t => (
                  <button key={t} onClick={() => setNotifTab(t)} style={{ height: '32px', padding: '0 16px', background: notifTab===t?'#2B72FB':'transparent', border: notifTab===t?'none':'1px solid rgba(255,255,255,0.12)', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Arimo', fontSize: '13px', fontWeight: notifTab===t?700:400, color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                    {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>
              <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (!list.length) return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{notifTab==='unread'?'No unread notifications':'No notifications yet'}</p>
                    </div>
                  );
                  return Object.entries(groupByDate(list)).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{label}</p>
                        {items.map(n => (
                          <div key={n.id} onClick={() => markOneRead(n.id)}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 18px', background: n.read?'transparent':'rgba(43,114,251,0.07)', cursor: 'pointer', transition: 'background 0.12s', borderLeft: n.read?'3px solid transparent':'3px solid #2B72FB' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background=n.read?'transparent':'rgba(43,114,251,0.07)'}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/></svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: 'Arimo', fontWeight: n.read?400:700, fontSize: '13px', color: '#FFFFFF', margin: '0 0 2px 0', lineHeight: '1.4' }}>{n.title}</p>
                              <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '0 0 4px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body}</p>
                              <span style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{formatTime(n.time)}</span>
                            </div>
                            {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2B72FB', flexShrink: 0, marginTop: '6px' }} />}
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
              </div>
              <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <button onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                  style={{ width: '100%', height: '36px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                  See all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Back ───────────────────────────────────────────────────────────── */}
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: isMobile?'16px':'24px' }}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: isMobile?'20px':'28px', paddingRight: isMobile?'58px':'90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <h1 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isMobile?'28px':isTablet?'32px':'40px', lineHeight: '1.2', letterSpacing: '-1px', color: '#FFFFFF', margin: 0 }}>Jobs</h1>
            <div style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)', border: '1.24px solid rgba(99,102,241,0.3)', borderRadius: '9999px', padding: '5px 14px' }}>
              <span style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.8)' }}>HAPPENING SOON</span>
            </div>
          </div>
          <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: isMobile?'13px':'16px', lineHeight: '22px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Stay connected with the latest opportunities from your alumni network.
          </p>
        </div>

        {/* ── Recommended for You — only renders when matches exist ──────────── */}
        {hasRecommended && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isMobile?'15px':'17px', color: '#FFFFFF' }}>Recommended for you</span>
              <div style={{ background: '#2B72FB', borderRadius: '8px', padding: '2px 9px' }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{recommended.length}</span>
              </div>
            </div>
            {recSubtitle && (
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,200,80,0.6)', margin: '0 0 16px 0' }}>
                Based on your {recSubtitle}
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: recCols, gap: isMobile?'12px':isTablet?'16px':'20px', marginBottom: '0' }}>
              {recommended.map(({ job, matchLabel }) => (
                <RecommendedCard key={job.id} job={job} matchLabel={matchLabel} isMobile={isMobile} />
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', margin: isMobile?'20px 0':'28px 0' }} />

            {/* All Jobs label + filter on same row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile?'14px':'20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isMobile?'15px':'17px', color: '#FFFFFF' }}>All Jobs</span>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2px 9px' }}>
                  <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{filtered.length}</span>
                </div>
              </div>
              {/* Filter bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ height: '34px', display: 'flex', alignItems: 'center', padding: '0 10px', gap: '7px', background: 'rgba(0,62,166,0.35)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))' }}>
                  <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap' }}>{activeCategory}</span>
                  <div style={{ background: '#2B72FB', borderRadius: '6px', padding: '1px 6px' }}>
                    <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '11px', color: '#FFFFFF' }}>{filtered.length}</span>
                  </div>
                </div>
                <div ref={filterRef} style={{ position: 'relative', flexShrink: 0 }}>
                  <button onClick={() => setShowFilter(f => !f)} style={{ height: '34px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '7px', background: 'rgba(0,40,255,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.85'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                    <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>FILTER</span>
                  </button>
                  {showFilter && <FilterDropdown activeCategory={activeCategory} setActiveCategory={setActiveCategory} setShowFilter={setShowFilter} categoryCounts={categoryCounts} />}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── No recommendations — just filter bar ──────────────────────────── */}
        {!hasRecommended && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: isMobile?'16px':'24px', gap: '12px' }}>
            <div style={{ height: '37px', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', background: 'rgba(0,62,166,0.35)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))', minWidth: isMobile?0:'211px', flex: isMobile?1:'none' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '14px', color: 'rgba(255,255,255,0.9)', flex: 1 }}>{activeCategory}</span>
              <div style={{ background: '#2B72FB', borderRadius: '8px', minWidth: '22px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>{filtered.length}</span>
              </div>
            </div>
            <div ref={filterRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setShowFilter(f => !f)} style={{ height: '37px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,40,255,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', filter: 'drop-shadow(0px 2px 2px rgba(255,255,255,0.15))', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.85'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '13px', color: '#FFFFFF' }}>FILTER</span>
              </button>
              {showFilter && <FilterDropdown activeCategory={activeCategory} setActiveCategory={setActiveCategory} setShowFilter={setShowFilter} categoryCounts={categoryCounts} />}
            </div>
          </div>
        )}

        {/* ── All Jobs grid ──────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: allCols, gap: isMobile?'14px':isTablet?'18px':'24px' }}>
            {filtered.map(job => <JobCard key={job.id} job={job} isMobile={isMobile} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arimo, Arial', fontSize: '15px' }}>
            No jobs found for this category.
          </div>
        )}

      </div>
    </div>
  );
};

// ── Filter Dropdown (shared) ───────────────────────────────────────────────────
const FilterDropdown = ({ activeCategory, setActiveCategory, setShowFilter, categoryCounts }) => (
  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'linear-gradient(180deg, #1E2555 0%, #0F1338 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', zIndex: 300, minWidth: '220px', boxShadow: '0px 10px 30px rgba(0,0,0,0.5)' }}>
    {CATEGORIES.map((cat, i) => (
      <button key={cat} onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: activeCategory===cat?'rgba(43,114,251,0.15)':'transparent', border: 'none', borderTop: i>0?'1px solid rgba(255,255,255,0.06)':'none', cursor: 'pointer', transition: 'background 0.15s' }}
        onMouseEnter={e => { if (activeCategory!==cat) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => { if (activeCategory!==cat) e.currentTarget.style.background='transparent'; }}
      >
        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: activeCategory===cat?'#FFFFFF':'rgba(255,255,255,0.7)', fontWeight: activeCategory===cat?700:400 }}>{cat}</span>
        <div style={{ background: activeCategory===cat?'#2B72FB':'rgba(43,114,251,0.25)', borderRadius: '6px', padding: '1px 7px' }}>
          <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '11px', color: '#FFFFFF' }}>{categoryCounts[cat]}</span>
        </div>
      </button>
    ))}
  </div>
);

export default Jobs;