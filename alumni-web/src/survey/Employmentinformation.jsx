import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ei-root { display: flex; min-height: 100vh; background: #002263; font-family: 'Arimo', Arial, sans-serif; }
  .ei-content { flex: 1; min-width: 0; margin-left: 229px; }
  .ei-header { position: sticky; top: 0; z-index: 40; background: #002263; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .ei-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .ei-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
  .ei-badge { background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .ei-bell { width: 48px; height: 48px; background: rgba(0,62,166,0.35); border: 1.24px solid rgba(255,255,255,0.2); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .ei-bell.active { background: rgba(43,114,251,0.2); border-color: rgba(43,114,251,0.5); }
  .ei-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: #2B72FB; opacity: 0.42; border-radius: 50%; }
  .ei-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: #2B72FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .ei-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #fff; }
  .ei-progress { margin: 12px 51px 0; background: #001743; border: 1px solid #01122F; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 18px 30px 16px; }
  .ei-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 16px; color: rgba(255,255,255,0.99); }
  .ei-progress-track { width: 100%; height: 11px; background: #D9CA81; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
  .ei-progress-fill { height: 100%; background: #51A2FF; border-radius: 10px; transition: width 0.4s ease; }
  .ei-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 17px; color: rgba(255,255,255,0.99); }
  .ei-body { padding: 24px 51px 60px; }
  .ei-card { background: rgba(13,19,56,0.4); border: 0.89px solid rgba(255,255,255,0.1); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 40px; }
  .ei-section-title { font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.5; color: #fff; text-align: center; }
  .ei-section-sub { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 20px; color: rgba(255,255,255,0.6); margin-top: 6px; text-align: center; }
  .ei-fields { display: flex; flex-direction: column; gap: 32px; }
  .ei-field { display: flex; flex-direction: column; gap: 14px; width: 100%; }
  .ei-label { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: rgba(255,255,255,0.7); }
  .ei-input { width: 100%; height: 47px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: #fff; outline: none; transition: border-color 0.15s; }
  .ei-input:focus { border-color: rgba(43,114,251,0.6); }
  .ei-radio-group { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
  .ei-radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .ei-radio-label input[type="radio"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }
  .ei-branch { display: flex; flex-direction: column; gap: 36px; padding-top: 24px; }
  .ei-dropdown { position: relative; width: 100%; }
  .ei-dropdown-trigger { width: 100%; height: 47px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 0 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: #fff; outline: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.15s; user-select: none; }
  .ei-dropdown-trigger.open { border-color: rgba(43,114,251,0.6); }
  .ei-dropdown-menu { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #011C50; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; max-height: 260px; overflow-y: auto; z-index: 200; }
  .ei-dropdown-item { padding: 10px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.85); cursor: pointer; transition: background 0.15s; }
  .ei-dropdown-item:hover { background: rgba(81,162,255,0.08); }
  .ei-dropdown-item.selected { background: rgba(81,162,255,0.1); color: #51A2FF; }
  .ei-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .ei-btn-prev { width: 120px; height: 48px; background: #fff; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #090909; transition: opacity 0.15s; }
  .ei-btn-prev:hover { opacity: 0.85; }
  .ei-btn-save { height: 48px; padding: 0 24px; background: transparent; border: 1.24px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: rgba(255,255,255,0.8); transition: border-color 0.15s, color 0.15s; }
  .ei-btn-save:hover { border-color: rgba(255,255,255,0.7); color: #fff; }
  .ei-btn-next { width: 120px; height: 48px; background: #0028FF; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #fff; transition: opacity 0.15s; }
  .ei-btn-next:hover { opacity: 0.9; }
  .ei-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .ei-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }
  @media (max-width: 1100px) { .ei-topbar { padding: 24px 32px 0; } .ei-title { padding: 14px 32px 0; font-size: 26px; } .ei-progress { margin: 12px 32px 0; } .ei-body { padding: 20px 32px 60px; } .ei-card { padding: 32px 32px 28px; } }
  @media (max-width: 900px) { .ei-topbar { padding: 20px 24px 0; } .ei-title { padding: 12px 24px 0; font-size: 24px; } .ei-progress { margin: 10px 24px 0; } .ei-body { padding: 18px 24px 60px; } .ei-card { padding: 28px 24px 24px; gap: 24px; } }
  @media (max-width: 767px) { .ei-content { margin-left: 0; } .ei-topbar { padding: 20px 16px 0; } .ei-badge { padding: 6px 12px; font-size: 10px; } .ei-bell { display: none; } .ei-title { padding: 12px 16px 0; font-size: 20px; } .ei-progress { margin: 10px 16px 0; padding: 14px 16px; } .ei-progress-row { font-size: 13px; } .ei-progress-label { font-size: 13px; } .ei-body { padding: 16px 16px 80px; } .ei-card { padding: 20px 16px 20px; gap: 20px; } .ei-section-title { font-size: 17px; } .ei-btn-prev { width: 100px; height: 44px; font-size: 14px; } .ei-btn-save { height: 44px; padding: 0 14px; font-size: 14px; } .ei-btn-next { width: 100px; height: 44px; font-size: 14px; } }
  @media (max-width: 390px) { .ei-title { font-size: 17px; } .ei-input { font-size: 13px; } .ei-btn-prev, .ei-btn-next { width: 90px; font-size: 13px; } .ei-btn-save { padding: 0 10px; font-size: 13px; } }
  @media (max-height: 600px) { .ei-header { padding-bottom: 10px; } .ei-progress { padding: 10px 20px; } .ei-body { padding-top: 14px; } }
`;

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 4;
const PROGRESS_PCT    = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;

const INDUSTRY_OPTIONS       = ['Agriculture, Forestry and Fishing','Mining and Quarrying','Manufacturing','Electricity, Gas, Steam and Air Conditioning Supply','Water Supply, Sewerage and Waste Management','Construction','Wholesale and Retail Trade','Transportation and Storage','Accommodation and Food Service Activities','Information and Communication Technology (ICT)','Financial and Insurance Activities','Real Estate Activities','Professional, Scientific and Technical Activities','Administrative and Support Service Activities','Public Administration and Defence','Education','Human Health and Social Work Activities','Arts, Entertainment and Recreation','Other Service Activities','Other'];
const EMPLOYMENT_STATUSES_ALL = ['Regular / Permanent','Contractual','Part-Time','Probationary','Self-Employed','Unemployed, but looking for work','Unemployed, but not looking for work','Other'];
const REASONS_FOR_JOB        = ['Salaries and Benefits','Career Challenge','Related to Special Skill','Related to Course or Program of Study','Proximity of Residence','Peer Influence','Family Influence','Other'];
const UNEMPLOYED_REASONS     = ['Pursuing further studies','Family responsibilities or personal matters','Health-related reasons','Lack of job opportunities related to the field of study','Waiting for job placement results or hiring process','Currently seeking better employment opportunities','Started a personal business or freelance work (not yet stable)','Relocation or migration plans','Lack of work experience or qualifications required by employers','Taking a break or resting before seeking employment','Reviewing for board examination','Other'];
const MONTHLY_INCOME         = ['Below ₱15,000','₱15,001 – ₱30,000','₱30,001 – ₱50,000','Above ₱50,000'];
const EMPLOYED_STATUSES      = ['Regular / Permanent','Contractual','Part-Time','Probationary','Self-Employed'];
const UNEMPLOYED_STATUSES    = ['Unemployed, but looking for work','Unemployed, but not looking for work'];

const SelectDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="ei-dropdown" ref={ref}>
      <div className={`ei-dropdown-trigger${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span style={{ color: value ? '#fff' : 'rgba(255,255,255,0.3)' }}>{value || 'Select'}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}><path d="M1 1L6 7L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      {open && (
        <div className="ei-dropdown-menu">
          {INDUSTRY_OPTIONS.map(opt => (
            <div key={opt} className={`ei-dropdown-item${value === opt ? ' selected' : ''}`} onClick={() => { onChange(opt); setOpen(false); }}>{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmploymentInformation = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    job_related_to_degree: '',
    employment_status: '',
    other_employment_status: '',
    job_position: '',
    company_name: '',
    type_of_industry: '',
    location_of_employment: '',
    monthly_income: '',
    reason_for_job: '',
    other_reason_for_job: '',
    reasons_unemployed: '',
    other_reason_unemployed: '',
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('employment_information');
      if (savedData) setForm(f => ({
        ...f,
        ...savedData,
        location_of_employment: savedData.location_of_employment || savedData.employment_location || '',
        reason_for_job:         savedData.reason_for_job         || savedData.job_acceptance_reason || '',
        type_of_industry:       savedData.type_of_industry       || savedData.industry || '',
        monthly_income:         savedData.monthly_income         || savedData.salary_range || '',
      }));
    };
    load();
  }, []);

  const resetEmploymentBranch = (v) => setForm(prev => ({
    ...prev,
    employment_status: v,
    other_employment_status: '',
    job_position: '', company_name: '', type_of_industry: '',
    location_of_employment: '', monthly_income: '',
    reason_for_job: '', other_reason_for_job: '',
    reasons_unemployed: '', other_reason_unemployed: '',
  }));

  const isEmployed           = EMPLOYED_STATUSES.includes(form.employment_status);
  const isUnemployed         = UNEMPLOYED_STATUSES.includes(form.employment_status);
  const showEmployedFields   = form.employment_status !== '' && isEmployed;
  const showUnemployedFields = form.employment_status !== '' && isUnemployed;

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  // ── Notification state ─────────────────────────────────────────────────────
  const bellRef                         = useRef(null);
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
    const h = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
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

  const validate = () => {
    const e = new Set();
    if (!form.job_related_to_degree) e.add('job_related_to_degree');
    if (!form.employment_status)     e.add('employment_status');
    if (form.employment_status === 'Other' && !form.other_employment_status.trim()) e.add('other_employment_status');
    if (EMPLOYED_STATUSES.includes(form.employment_status)) {
      if (!form.job_position.trim())    e.add('job_position');
      if (!form.company_name.trim())    e.add('company_name');
      if (!form.type_of_industry)       e.add('type_of_industry');
      if (!form.location_of_employment) e.add('location_of_employment');
      if (!form.monthly_income)         e.add('monthly_income');
      if (!form.reason_for_job)         e.add('reason_for_job');
      if (form.reason_for_job === 'Other' && !form.other_reason_for_job.trim()) e.add('other_reason_for_job');
    }
    if (UNEMPLOYED_STATUSES.includes(form.employment_status)) {
      if (!form.reasons_unemployed) e.add('reasons_unemployed');
      if (form.reasons_unemployed === 'Other' && !form.other_reason_unemployed.trim()) e.add('other_reason_unemployed');
    }
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('employment_information', form);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleNext = () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    saveSectionProgress('employment_information', form)
      .then(() => navigate('/survey/job-experience'));
  };

  const onFocus = e => e.target.style.borderColor = 'rgba(43,114,251,0.6)';
  const onBlur  = e => e.target.style.borderColor = 'rgba(255,255,255,0.06)';

  return (
    <>
      <style>{STYLES}</style>
      <div className="ei-root">
        <Sidebar />
        <div className="ei-content">
          <div className="ei-header">
            <div className="ei-topbar">
              <button className="ei-back-btn" onClick={() => navigate('/survey/certification-achievement')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
              <div className="ei-badge">Alumni Status</div>

              {/* ── Notification Bell ──────────────────────────────────────── */}
              <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  className={`ei-bell${showDropdown ? ' active' : ''}`}
                  onClick={() => setShowDropdown(v => !v)}
                >
                  <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                    <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z"
                      stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {unreadCount > 0 && (
                    <>
                      <div className="ei-bell-dot" />
                      <div className="ei-bell-count">{unreadCount > 99 ? '99+' : unreadCount}</div>
                    </>
                  )}
                </button>

                {showDropdown && (
                  <div style={{ position: 'absolute', top: '60px', right: 0, width: '380px', maxHeight: '520px', background: 'rgba(13,19,56,0.97)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
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
            </div>

            <h1 className="ei-title">Alumni Tracer Survey</h1>
            <div className="ei-progress">
              <div className="ei-progress-row">
                <span>Section {CURRENT_SECTION} of {TOTAL_SECTIONS}</span>
              </div>
              <div className="ei-progress-track">
                <div className="ei-progress-fill" style={{ width: `${PROGRESS_PCT}%` }} />
              </div>
              <span className="ei-progress-label">Employment Information</span>
            </div>
          </div>

          <div className="ei-body">
            <div className="ei-card" ref={cardRef}>
              <div>
                <h2 className="ei-section-title">Employment Information</h2>
                <p className="ei-section-sub">Information related to your job</p>
              </div>
              <div className="ei-fields">
                <div className="ei-field">
                  <span className="ei-label">Is your current job related to your degree? <span className="ei-req">*</span>{errors.has('job_related_to_degree') && <span className="ei-field-error">Required</span>}</span>
                  <div className="ei-radio-group">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="ei-radio-label">
                        <input type="radio" name="job_related_to_degree" value={opt} checked={form.job_related_to_degree === opt} onChange={() => set('job_related_to_degree', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="ei-field">
                  <span className="ei-label">Current Employment Status <span className="ei-req">*</span>{errors.has('employment_status') && <span className="ei-field-error">Required</span>}</span>
                  <div className="ei-radio-group">
                    {EMPLOYMENT_STATUSES_ALL.map(opt => (
                      <label key={opt} className="ei-radio-label">
                        <input type="radio" name="employment_status" value={opt} checked={form.employment_status === opt} onChange={() => resetEmploymentBranch(opt)} />{opt}
                      </label>
                    ))}
                  </div>
                  {form.employment_status === 'Other' && (
                    <input className="ei-input" type="text" placeholder="Please specify" value={form.other_employment_status} onChange={e => set('other_employment_status', e.target.value)} onFocus={onFocus} onBlur={onBlur} style={{ marginTop: '8px', borderColor: errors.has('other_employment_status') ? '#F87171' : undefined }} />
                  )}
                </div>
              </div>

              {showEmployedFields && (
                <div className="ei-branch">
                  <div className="ei-field">
                    <span className="ei-label">Job position <span className="ei-req">*</span>{errors.has('job_position') && <span className="ei-field-error">Required</span>}</span>
                    <input className="ei-input" type="text" placeholder="Enter your answer" value={form.job_position} onChange={e => set('job_position', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">Name of company / employer <span className="ei-req">*</span>{errors.has('company_name') && <span className="ei-field-error">Required</span>}</span>
                    <input className="ei-input" type="text" placeholder="Enter your answer" value={form.company_name} onChange={e => set('company_name', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">Type of industry <span className="ei-req">*</span>{errors.has('type_of_industry') && <span className="ei-field-error">Required</span>}</span>
                    <SelectDropdown value={form.type_of_industry} onChange={v => set('type_of_industry', v)} />
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">Location of employment <span className="ei-req">*</span>{errors.has('location_of_employment') && <span className="ei-field-error">Required</span>}</span>
                    <div className="ei-radio-group">
                      {['Local', 'Abroad'].map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="location_of_employment" value={opt} checked={form.location_of_employment === opt} onChange={() => set('location_of_employment', opt)} />{opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">Monthly income range <span className="ei-req">*</span>{errors.has('monthly_income') && <span className="ei-field-error">Required</span>}</span>
                    <div className="ei-radio-group">
                      {MONTHLY_INCOME.map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="monthly_income" value={opt} checked={form.monthly_income === opt} onChange={() => set('monthly_income', opt)} />{opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">Reasons for accepting the job <span className="ei-req">*</span>{errors.has('reason_for_job') && <span className="ei-field-error">Required</span>}</span>
                    <div className="ei-radio-group">
                      {REASONS_FOR_JOB.map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="reason_for_job" value={opt} checked={form.reason_for_job === opt} onChange={() => set('reason_for_job', opt)} />{opt}
                        </label>
                      ))}
                    </div>
                    {form.reason_for_job === 'Other' && (
                      <input className="ei-input" type="text" placeholder="Please specify" value={form.other_reason_for_job} onChange={e => set('other_reason_for_job', e.target.value)} onFocus={onFocus} onBlur={onBlur} style={{ marginTop: '8px', borderColor: errors.has('other_reason_for_job') ? '#F87171' : undefined }} />
                    )}
                  </div>
                </div>
              )}

              {showUnemployedFields && (
                <div className="ei-branch">
                  <div className="ei-field">
                    <span className="ei-label">Reasons of being unemployed <span className="ei-req">*</span>{errors.has('reasons_unemployed') && <span className="ei-field-error">Required</span>}</span>
                    <div className="ei-radio-group" style={{ gap: '16px' }}>
                      {UNEMPLOYED_REASONS.map(reason => (
                        <label key={reason} className="ei-radio-label">
                          <input type="radio" name="reasons_unemployed" value={reason} checked={form.reasons_unemployed === reason} onChange={() => set('reasons_unemployed', reason)} />{reason}
                        </label>
                      ))}
                    </div>
                    {form.reasons_unemployed === 'Other' && (
                      <input className="ei-input" type="text" placeholder="Please specify" value={form.other_reason_unemployed} onChange={e => set('other_reason_unemployed', e.target.value)} onFocus={onFocus} onBlur={onBlur} style={{ marginTop: '8px', borderColor: errors.has('other_reason_unemployed') ? '#F87171' : undefined }} />
                    )}
                  </div>
                </div>
              )}

              <div className="ei-footer">
                <button className="ei-btn-prev" onClick={() => navigate('/survey/certification-achievement')}>Previous</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {saveToast && (
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: 'rgba(81,210,130,0.9)' }}>
                      Progress saved
                    </span>
                  )}
                  <button className="ei-btn-save" onClick={handleSave}>Save</button>
                  <button className="ei-btn-next" onClick={handleNext}>Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmploymentInformation;