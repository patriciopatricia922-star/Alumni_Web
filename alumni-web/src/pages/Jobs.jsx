import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const JOBS = [
  {
    id: 1,
    title: 'UI/UX Designer',
    company: 'Payso',
    date: 'August 19, 2024',
    website: 'www.paysopay.com',
    tags: ['Graphic Design', 'Multimedia Arts', 'Fine Arts'],
  },
  {
    id: 2,
    title: 'Architecture',
    company: 'Bizforce',
    date: 'October 3, 2024',
    website: 'www.bizforce.com',
    tags: ['Licensed Architect', '5 years experience', 'REVIT Proficiency', 'Virtual environment'],
  },
  {
    id: 3,
    title: 'IT Operations Monitoring Analyst',
    company: 'Dairy Farm Service Center',
    date: 'April 21, 2022',
    website: 'dfscjobs@dairy-farm.com.ph',
    description: 'DFI Retail Group ("Group") has a broad and exciting range of careers spread across its operations throughout Asia. To find out more and take the first step towards joining our rapidly expanding team, please see the listing below, or refer to the opportunities in your respective operating markets.',
  },
  {
    id: 4,
    title: 'Jr. Cyber Security Analyst',
    company: 'Dairy Farm Service Center',
    date: 'April 21, 2022',
    website: 'dfscjobs@dairy-farm.com.ph',
    description: 'DFI Retail Group ("Group") has a broad and exciting range of careers spread across its operations throughout Asia. To find out more and take the first step towards joining our rapidly expanding team, please see the listing below, or refer to the opportunities in your respective operating markets.',
  },
  {
    id: 5,
    title: 'Service Desk Analyst',
    company: 'Dairy Farm Service Center',
    date: 'April 21, 2022',
    website: 'dfscjobs@dairy-farm.com.ph',
    description: 'DFI Retail Group ("Group") has a broad and exciting range of careers spread across its operations throughout Asia. To find out more and take the first step towards joining our rapidly expanding team, please see the listing below, or refer to the opportunities in your respective operating markets.',
  },
  {
    id: 6,
    title: 'Jr. SAP ABAP Programmer',
    company: 'Dairy Farm Service Center',
    date: 'April 21, 2022',
    website: 'dfscjobs@dairy-farm.com.ph',
    description: 'DFI Retail Group ("Group") has a broad and exciting range of careers spread across its operations throughout Asia. To find out more and take the first step towards joining our rapidly expanding team, please see the listing below, or refer to the opportunities in your respective operating markets.',
  },
  {
    id: 7,
    title: 'Civil Engineer',
    company: 'Bizforce',
    date: 'October 3, 2024',
    website: 'www.bizforce.com',
    tags: ['Licensed Civil Engineer', 'AutoCAD', '5 years experience', 'Virtual environment'],
  },
  {
    id: 8,
    title: 'Marketing Officer',
    company: 'SM City Fairview',
    date: 'October 3, 2024',
    website: 'jenalyn.reyes@smsupermalls.com',
    tags: ['Computer Literate', '2 years experience', 'Strong inter-personal'],
  },
  {
    id: 9,
    title: 'Foodcourt Manager',
    company: 'SM City Fairview',
    date: 'October 3, 2024',
    website: 'jenalyn.reyes@smsupermalls.com',
    tags: ['Related Degree', '5 years experience', 'Knowledgeable in Business Operations'],
  },
  {
    id: 10,
    title: 'Resident Engineer',
    company: 'SM City Fairview',
    date: 'October 3, 2024',
    website: 'jenalyn.reyes@smsupermalls.com',
    tags: ['Electro-Mechanical Maintenance', 'Knowledgeable of codes & safety standards'],
  },
  {
    id: 11,
    title: 'Customer Relation Services',
    company: 'SM City San Jose Del Monte',
    date: 'October 3, 2024',
    website: 'jenalyn.reyes@smsupermalls.com',
    tags: ['Any 4 years course', '4 years experience', 'Knowledgeable in Security Policies'],
  },
  {
    id: 12,
    title: 'Management Trainees',
    company: 'China Bank',
    date: 'April 21, 2022',
    website: 'careers@chinabank.ph',
    description: 'With its wide array of banking products and services to corporate, commercial, and retail customers, China Banking Corporation (China Bank PH) is one of the leading private universal banks in the Philippines.',
  },
  {
    id: 13,
    title: 'Accounting Assistants',
    company: 'China Bank',
    date: 'April 21, 2022',
    website: 'careers@chinabank.ph',
    description: 'With its wide array of banking products and services to corporate, commercial, and retail customers, China Banking Corporation (China Bank PH) is one of the leading private universal banks in the Philippines.',
  },
  {
    id: 14,
    title: 'Audit Assistants',
    company: 'China Bank',
    date: 'April 21, 2022',
    website: 'careers@chinabank.ph',
    description: 'With its wide array of banking products and services to corporate, commercial, and retail customers, China Banking Corporation (China Bank PH) is one of the leading private universal banks in the Philippines.',
  },
  {
    id: 15,
    title: 'Junior Valuation Assistants',
    company: 'China Bank',
    date: 'April 21, 2022',
    website: 'careers@chinabank.ph',
    description: 'With its wide array of banking products and services to corporate, commercial, and retail customers, China Banking Corporation (China Bank PH) is one of the leading private universal banks in the Philippines.',
  },
  {
    id: 16,
    title: 'Business Analysts',
    company: 'China Bank',
    date: 'April 21, 2022',
    website: 'careers@chinabank.ph',
    description: 'With its wide array of banking products and services to corporate, commercial, and retail customers, China Banking Corporation (China Bank PH) is one of the leading private universal banks in the Philippines.',
  },
];

const BriefcaseIcon = () => (
  <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
    <rect x="1" y="5" width="18" height="12" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
    <path d="M7 5V3a1 1 0 011-1h4a1 1 0 011 1v2" stroke="#FFFFFF" strokeWidth="1.5"/>
    <path d="M1 10h18" stroke="#FFFFFF" strokeWidth="1.5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2" width="14" height="13" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M1 6h14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M5 1v2M11 1v2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="3" r="1.2" fill="rgba(255,255,255,0.4)"/>
    <circle cx="8" cy="8" r="1.2" fill="rgba(255,255,255,0.4)"/>
    <circle cx="8" cy="13" r="1.2" fill="rgba(255,255,255,0.4)"/>
  </svg>
);

const JobCard = ({ job }) => (
  <div style={{
    background: 'rgba(13, 19, 56, 0.4)',
    border: '1.24px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '16px',
    overflow: 'hidden',
    flex: '1 1 calc(50% - 12px)',
    minWidth: '0',
    maxWidth: 'calc(50% - 12px)',
  }}>
    {/* Card Header */}
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '20px 20px 20px 24px',
      borderBottom: '0.89px solid rgba(255, 255, 255, 0.1)',
    }}>
      {/* Briefcase icon box */}
      <div style={{
        width: '48px', height: '48px', flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(30, 37, 85, 0.8) 0%, rgba(15, 19, 56, 0.8) 100%)',
        boxShadow: '0px 10px 15px rgba(97, 95, 255, 0.3), 0px 4px 6px rgba(43, 114, 251, 0.15)',
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <BriefcaseIcon />
      </div>

      {/* Title + Company */}
      <div style={{ flex: 1, paddingLeft: '16px' }}>
        <p style={{
          fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px',
          lineHeight: '22px', letterSpacing: '-0.35px',
          color: '#FFFFFF', margin: '0 0 4px 0',
        }}>
          {job.title}
        </p>
        <p style={{
          fontFamily: 'Arimo', fontWeight: 700, fontSize: '12px',
          lineHeight: '20px', letterSpacing: '-0.35px',
          color: '#FFFFFF', margin: 0,
        }}>
          {job.company}
        </p>
      </div>

      {/* More icon */}
      <div style={{ paddingTop: '4px', cursor: 'pointer' }}>
        <MoreIcon />
      </div>
    </div>

    {/* Body: tags or description */}
    <div style={{ padding: '16px 24px' }}>
      {job.tags ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {job.tags.map((tag, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              padding: '4px 12px',
              background: 'rgba(243, 243, 245, 0.17)',
              border: '1.24px solid rgba(0, 0, 0, 0.25)',
              borderRadius: '8px',
            }}>
              <span style={{
                fontFamily: 'Arimo', fontWeight: 700, fontSize: '13px',
                lineHeight: '14px', color: '#FFFFFF',
              }}>
                {tag}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{
          fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px',
          lineHeight: '22px', color: '#FFFFFF',
          margin: 0, textAlign: 'justify',
        }}>
          {job.description}
        </p>
      )}
    </div>

    {/* Card Footer */}
    <div style={{
      borderTop: '1.24px solid rgba(255, 255, 255, 0.05)',
      padding: '14px 20px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <CalendarIcon />
        <span style={{
          fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px',
          lineHeight: '16px', color: 'rgba(255, 255, 255, 0.5)',
        }}>
          {job.date}
        </span>
      </div>
      <span style={{
        fontFamily: 'Arimo', fontWeight: 700, fontSize: '9px',
        lineHeight: '24px', color: '#FFFFFF', textAlign: 'right',
      }}>
        {job.website}
      </span>
    </div>
  </div>
);

const Jobs = () => {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  const filterRef = useRef(null);

  const FILTERS = ['All Jobs', 'Full-time', 'Part-time', 'Remote'];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Notification state ────────────────────────────────────────────────────────
  const bellRef                              = useRef(null);
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

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
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = useCallback(() => {
    const allIds = notifs.map(n => n.id);
    localStorage.setItem('read_notifs', JSON.stringify(allIds));
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


  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#002263',
      fontFamily: 'Arimo, Arial, sans-serif',
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{
        marginLeft: '229px', flex: 1,
        padding: '37px 51px 60px 48px',
        minHeight: '100vh', position: 'relative',
      }}>

        {/* Notification Bell + Dropdown */}
        <div ref={bellRef} style={{ position: 'absolute', top: '37px', right: '51px', zIndex: 200 }}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            style={{
              width: '48px', height: '48px',
              background: showDropdown ? 'rgba(43,114,251,0.15)' : 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
              border: showDropdown ? '1.24px solid rgba(43,114,251,0.4)' : '1.24px solid rgba(255,255,255,0.1)',
              boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', transition: 'all 0.15s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', minWidth: '20px', height: '20px', background: '#2B72FB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FFFFFF', fontWeight: 700 }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div style={{ position: 'absolute', top: '56px', right: 0, width: '380px', maxHeight: '520px', background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#2B72FB', cursor: 'pointer', padding: 0 }}>Mark all read</button>
                )}
              </div>
              <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                {['all', 'unread'].map(t => (
                  <button key={t} onClick={() => setNotifTab(t)} style={{ height: '32px', padding: '0 16px', background: notifTab === t ? '#2B72FB' : 'transparent', border: notifTab === t ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Arimo', fontSize: '13px', fontWeight: notifTab === t ? 700 : 400, color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                    {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>
              <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (list.length === 0) return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
                    </div>
                  );
                  const groups = groupByDate(list);
                  return Object.entries(groups).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{label}</p>
                        {items.map(n => (
                          <div key={n.id} onClick={() => markOneRead(n.id)}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 18px', background: n.read ? 'transparent' : 'rgba(43,114,251,0.07)', cursor: 'pointer', transition: 'background 0.12s', borderLeft: n.read ? '3px solid transparent' : '3px solid #2B72FB' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background=n.read?'transparent':'rgba(43,114,251,0.07)'}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/></svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: 'Arimo', fontWeight: n.read ? 400 : 700, fontSize: '13px', color: '#FFFFFF', margin: '0 0 2px 0', lineHeight: '1.4' }}>{n.title}</p>
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

        {/* Back Button - top left */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, marginBottom: '24px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 style={{
              fontFamily: 'Arial', fontWeight: 700, fontSize: '40px',
              lineHeight: '48px', letterSpacing: '-1px',
              color: '#FFFFFF', margin: 0,
            }}>
              Jobs
            </h1>
            {/* HAPPENING SOON badge */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
              border: '1.24px solid rgba(99,102,241,0.3)',
              borderRadius: '9999px',
              padding: '6px 16px',
            }}>
              <span style={{
                fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px',
                lineHeight: '16px', letterSpacing: '0.3px',
                color: 'rgba(255, 255, 255, 0.8)',
              }}>
                HAPPENING SOON
              </span>
            </div>
          </div>
          <p style={{
            fontFamily: 'Arimo', fontWeight: 400, fontSize: '14px',
            lineHeight: '20px', color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
          }}>
            Stay connected with the latest news, events, and opportunities.
          </p>
        </div>

        {/* Filter Row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: '28px', gap: '12px', position: 'relative',
        }}>
          {/* Active filter label + count */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 14px',
            background: 'linear-gradient(90deg, #1E2555 0%, rgba(15, 19, 56, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px', minWidth: '210px',
          }}>
            <span style={{
              fontFamily: 'Arimo', fontSize: '14px', lineHeight: '20px',
              color: 'rgba(255,255,255,0.9)', flex: 1,
            }}>
              {activeFilter}
            </span>
            <div style={{
              background: '#2B72FB', borderRadius: '8px',
              padding: '1px 7px', minWidth: '22px', textAlign: 'center',
            }}>
              <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>
                {JOBS.length}
              </span>
            </div>
          </div>

          {/* Filter Button */}
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilter(f => !f)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 18px',
                background: 'linear-gradient(180deg, rgba(30,37,85,0.7) 0%, rgba(15,19,56,0.7) 100%)',
                border: showFilter ? '1px solid rgba(43,114,251,0.4)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M7 12h10M11 18h2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontFamily: 'Arimo', fontWeight: 700, fontSize: '13px',
                color: '#FFFFFF', letterSpacing: '0.5px',
              }}>
                FILTER
              </span>
            </button>

            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'linear-gradient(180deg, #1E2555 0%, #0F1338 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', overflow: 'hidden',
                zIndex: 50, minWidth: '200px',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.4)',
              }}>
                {FILTERS.map((filter, i) => (
                  <button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setShowFilter(false); }}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: activeFilter === filter ? 'rgba(43,114,251,0.15)' : 'transparent',
                      border: 'none',
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { if (activeFilter !== filter) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (activeFilter !== filter) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontFamily: 'Arimo', fontSize: '14px',
                      color: activeFilter === filter ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                      fontWeight: activeFilter === filter ? 700 : 400,
                    }}>
                      {filter}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Jobs Grid - 2 columns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {JOBS.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Jobs;