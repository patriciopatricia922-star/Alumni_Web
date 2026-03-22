import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .eb-root { display: flex; min-height: 100vh; background: #002263; font-family: 'Arimo', Arial, sans-serif; }
  .eb-content { flex: 1; min-width: 0; margin-left: 229px; }
  .eb-header { position: sticky; top: 0; z-index: 40; background: #002263; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .eb-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .eb-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
  .eb-badge { background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .eb-bell { width: 48px; height: 48px; background: rgba(0,62,166,0.35); border: 1.24px solid rgba(255,255,255,0.2); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .eb-bell.active { background: rgba(43,114,251,0.2); border-color: rgba(43,114,251,0.5); }
  .eb-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: #2B72FB; opacity: 0.42; border-radius: 50%; }
  .eb-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: #2B72FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .eb-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #fff; }
  .eb-progress { margin: 12px 51px 0; background: #001743; border: 1px solid #01122F; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 18px 30px 16px; }
  .eb-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 16px; color: rgba(255,255,255,0.99); }
  .eb-progress-track { width: 100%; height: 11px; background: #D9CA81; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
  .eb-progress-fill { height: 100%; background: #51A2FF; border-radius: 10px; transition: width 0.4s ease; }
  .eb-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 17px; color: rgba(255,255,255,0.99); }
  .eb-body { padding: 24px 51px 60px; }
  .eb-card { background: rgba(13,19,56,0.4); border: 0.89px solid rgba(255,255,255,0.1); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 36px; }
  .eb-section-title { font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.5; color: #fff; text-align: center; }
  .eb-section-sub { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 20px; color: rgba(255,255,255,0.6); margin-top: 6px; text-align: center; }
  .eb-fields { display: flex; flex-direction: column; gap: 36px; }
  .eb-field { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .eb-label { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: rgba(255,255,255,0.9); }
  .eb-label-sub { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 18px; letter-spacing: 0.3px; color: rgba(255,255,255,0.6); }
  .eb-input { width: 100%; height: 47px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: #fff; outline: none; transition: border-color 0.15s; }
  .eb-input:focus { border-color: rgba(43,114,251,0.6); }
  .eb-input option { background: #001743; color: #fff; }
  .eb-textarea { width: 100%; height: 100px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: #fff; outline: none; resize: none; transition: border-color 0.15s; }
  .eb-textarea:focus { border-color: rgba(43,114,251,0.6); }
  .eb-select-wrap { position: relative; width: 100%; }
  .eb-select { appearance: none; -webkit-appearance: none; cursor: pointer; }
  .eb-select-arrow { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .eb-radio-group { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
  .eb-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.9); line-height: 1.4; padding: 2px 0; }
  .eb-radio-label input[type="radio"] { width: 18px; height: 18px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }
  .eb-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; }
  .eb-btn-prev { width: 120px; height: 48px; background: #fff; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #090909; transition: opacity 0.15s; }
  .eb-btn-prev:hover { opacity: 0.85; }
  .eb-btn-save { height: 48px; padding: 0 24px; background: transparent; border: 1.24px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: rgba(255,255,255,0.8); transition: border-color 0.15s, color 0.15s; }
  .eb-btn-save:hover { border-color: rgba(255,255,255,0.7); color: #fff; }
  .eb-btn-next { width: 120px; height: 48px; background: #0028FF; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #fff; transition: opacity 0.15s; }
  .eb-btn-next:hover { opacity: 0.9; }
  .eb-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .eb-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }

  @media (max-width: 1100px) { .eb-topbar { padding: 24px 32px 0; } .eb-title { padding: 14px 32px 0; font-size: 26px; } .eb-progress { margin: 12px 32px 0; } .eb-body { padding: 20px 32px 60px; } .eb-card { padding: 32px 32px 28px; } }
  @media (max-width: 900px) { .eb-topbar { padding: 20px 24px 0; } .eb-title { padding: 12px 24px 0; font-size: 24px; } .eb-progress { margin: 10px 24px 0; } .eb-body { padding: 18px 24px 60px; } .eb-card { padding: 28px 24px 24px; gap: 28px; } .eb-fields { gap: 28px; } }
  @media (max-width: 767px) { .eb-content { margin-left: 0; } .eb-topbar { padding: 20px 16px 0; } .eb-badge { padding: 6px 12px; font-size: 10px; } .eb-bell { display: none; } .eb-title { padding: 12px 16px 0; font-size: 20px; } .eb-progress { margin: 10px 16px 0; padding: 14px 16px; } .eb-progress-row { font-size: 13px; } .eb-progress-label { font-size: 13px; } .eb-body { padding: 16px 16px 80px; } .eb-card { padding: 20px 16px 20px; gap: 24px; } .eb-fields { gap: 24px; } .eb-section-title { font-size: 17px; } .eb-btn-prev { width: 100px; height: 44px; font-size: 14px; } .eb-btn-save { height: 44px; padding: 0 14px; font-size: 14px; } .eb-btn-next { width: 100px; height: 44px; font-size: 14px; } }
  @media (max-width: 390px) { .eb-title { font-size: 17px; } .eb-input, .eb-textarea { font-size: 13px; } .eb-btn-prev, .eb-btn-next { width: 90px; font-size: 13px; } .eb-btn-save { padding: 0 10px; font-size: 13px; } }
  @media (max-height: 600px) { .eb-header { padding-bottom: 10px; } .eb-progress { padding: 10px 20px; } .eb-body { padding-top: 14px; } }
`;

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 2;
const PROGRESS_PCT    = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;

const DEGREE_OPTIONS      = ['BA COMM','BS PSYCH','BS PE','BSA','BSMA','BSBA-MM','BSBA-FM','BSBA-HRM','BSTM','BSHM','BS ARCH','BSCE','BSCS-ML','BSCpE','BSIT-MWA','Other'];
const YEAR_OPTIONS        = Array.from({ length: 10 }, (_, i) => String(2025 + i));
const DISTINCTION_OPTIONS = ['Summa Cum Laude','Magna Cum Laude','Cum Laude','With Honors','None'];

const EducationalBackground = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    degree_program: '', other_degree: '', reason_for_course: '',
    year_graduated: '', distinction: '', post_grad_plans: '',
    post_grad_course: '', licensure_reviewing: '', licensure_plans: '',
    licensure_reason: '', board_exam_name: '', board_exam_date: '', board_exam_result: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('educational_background');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
  }, []);

  const showPostGradCourse  = form.post_grad_plans === 'Yes';
  const showLicensureBranch = form.licensure_reviewing === 'Yes';
  const showBoardExam       = showLicensureBranch &&
    (form.licensure_plans === 'Yes' || form.licensure_plans === 'Already taken');

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
    if (!form.degree_program)           e.add('degree_program');
    if (form.degree_program === 'Other' && !form.other_degree.trim()) e.add('other_degree');
    if (!form.reason_for_course.trim()) e.add('reason_for_course');
    if (!form.year_graduated)           e.add('year_graduated');
    if (!form.distinction)              e.add('distinction');
    if (!form.post_grad_plans)          e.add('post_grad_plans');
    if (form.post_grad_plans === 'Yes' && !form.post_grad_course.trim()) e.add('post_grad_course');
    if (!form.licensure_reviewing)      e.add('licensure_reviewing');
    if (form.licensure_reviewing === 'Yes') {
      if (!form.licensure_plans)          e.add('licensure_plans');
      if (!form.licensure_reason.trim())  e.add('licensure_reason');
      if (form.licensure_plans === 'Yes' || form.licensure_plans === 'Already taken') {
        if (!form.board_exam_name.trim()) e.add('board_exam_name');
        if (!form.board_exam_date)        e.add('board_exam_date');
        if (!form.board_exam_result)      e.add('board_exam_result');
      }
    }
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('educational_background', form);
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
    saveSectionProgress('educational_background', form)
      .then(() => navigate('/survey/certification-achievement'));
  };

  const onFocus = e => e.target.style.borderColor = 'rgba(43,114,251,0.6)';
  const onBlur  = e => e.target.style.borderColor = 'rgba(255,255,255,0.06)';

  return (
    <>
      <style>{STYLES}</style>
      <div className="eb-root">
        <Sidebar />
        <div className="eb-content">
          <div className="eb-header">
            <div className="eb-topbar">
              <button className="eb-back-btn" onClick={() => navigate('/survey/personal-background')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
              <div className="eb-badge">Alumni Status</div>

              {/* ── Notification Bell ────────────────────────────────────── */}
              <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  className={`eb-bell${showDropdown ? ' active' : ''}`}
                  onClick={() => setShowDropdown(v => !v)}
                >
                  <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                    <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z"
                      stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {unreadCount > 0 && (
                    <>
                      <div className="eb-bell-dot" />
                      <div className="eb-bell-count">{unreadCount > 99 ? '99+' : unreadCount}</div>
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

            <h1 className="eb-title">Alumni Tracer Survey</h1>
            <div className="eb-progress">
              <div className="eb-progress-row">
                <span>Section {CURRENT_SECTION} of {TOTAL_SECTIONS}</span>
              </div>
              <div className="eb-progress-track">
                <div className="eb-progress-fill" style={{ width: `${PROGRESS_PCT}%` }} />
              </div>
              <span className="eb-progress-label">Educational Background</span>
            </div>
          </div>

          <div className="eb-body">
            <div className="eb-card" ref={cardRef}>
              <div>
                <h2 className="eb-section-title">Educational Background</h2>
                <p className="eb-section-sub">Your academic background</p>
              </div>
              <div className="eb-fields">

                <div className="eb-field">
                  <label className="eb-label">Degree Program Completed <span className="eb-req">*</span>{errors.has('degree_program') && <span className="eb-field-error">Required</span>}</label>
                  <div className="eb-select-wrap">
                    <select className="eb-input eb-select" value={form.degree_program} onChange={e => set('degree_program', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                      <option value="" disabled>Select</option>
                      {DEGREE_OPTIONS.map(o => <option key={o} value={o} style={{ background: '#001743' }}>{o}</option>)}
                    </select>
                    <svg className="eb-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 7L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>

                {form.degree_program === 'Other' && (
                  <div className="eb-field">
                    <label className="eb-label">Please specify your degree program <span className="eb-req">*</span>{errors.has('other_degree') && <span className="eb-field-error">Required</span>}</label>
                    <input className="eb-input" placeholder="Enter your degree program" value={form.other_degree} onChange={e => set('other_degree', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                )}

                <div className="eb-field">
                  <label className="eb-label">Reason(s) of taking the course <span className="eb-req">*</span>{errors.has('reason_for_course') && <span className="eb-field-error">Required</span>}</label>
                  <textarea className="eb-textarea" placeholder="Enter your answer" value={form.reason_for_course} onChange={e => set('reason_for_course', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div className="eb-field">
                  <label className="eb-label">Year Graduated <span className="eb-req">*</span>{errors.has('year_graduated') && <span className="eb-field-error">Required</span>}</label>
                  <div className="eb-select-wrap">
                    <select className="eb-input eb-select" value={form.year_graduated} onChange={e => set('year_graduated', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                      <option value="" disabled>Select</option>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y} style={{ background: '#001743' }}>{y}</option>)}
                    </select>
                    <svg className="eb-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 7L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>

                <div className="eb-field">
                  <label className="eb-label">Distinction Received <span className="eb-req">*</span>{errors.has('distinction') && <span className="eb-field-error">Required</span>}</label>
                  <div className="eb-select-wrap">
                    <select className="eb-input eb-select" value={form.distinction} onChange={e => set('distinction', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                      <option value="" disabled>Select</option>
                      {DISTINCTION_OPTIONS.map(o => <option key={o} value={o} style={{ background: '#001743' }}>{o}</option>)}
                    </select>
                    <svg className="eb-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 7L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>

                <div className="eb-field">
                  <label className="eb-label">Do you have plans on taking a post-graduate studies? <span className="eb-req">*</span>{errors.has('post_grad_plans') && <span className="eb-field-error">Required</span>}</label>
                  <div className="eb-radio-group">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="eb-radio-label">
                        <input type="radio" name="post_grad_plans" value={opt} checked={form.post_grad_plans === opt} onChange={() => set('post_grad_plans', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>

                {showPostGradCourse && (
                  <div className="eb-field">
                    <label className="eb-label-sub">If yes, what course? <span className="eb-req">*</span>{errors.has('post_grad_course') && <span className="eb-field-error">Required</span>}</label>
                    <textarea className="eb-textarea" placeholder="Enter your answer" value={form.post_grad_course} onChange={e => set('post_grad_course', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                )}

                <div className="eb-field">
                  <label className="eb-label">Are you currently taking/reviewing for licensure examination? <span className="eb-req">*</span>{errors.has('licensure_reviewing') && <span className="eb-field-error">Required</span>}</label>
                  <div className="eb-radio-group">
                    {['Yes', 'No', 'Not applicable'].map(opt => (
                      <label key={opt} className="eb-radio-label">
                        <input type="radio" name="licensure_reviewing" value={opt} checked={form.licensure_reviewing === opt}
                          onChange={() => setForm(prev => ({ ...prev, licensure_reviewing: opt, licensure_plans: '', licensure_reason: '', board_exam_name: '', board_exam_date: '', board_exam_result: '' }))} />{opt}
                      </label>
                    ))}
                  </div>
                </div>

                {showLicensureBranch && (
                  <>
                    <div className="eb-field">
                      <label className="eb-label-sub">Do you have any plans on taking licensure examination? <span className="eb-req">*</span>{errors.has('licensure_plans') && <span className="eb-field-error">Required</span>}</label>
                      <div className="eb-radio-group">
                        {['Yes', 'No', 'Already taken', 'Not applicable'].map(opt => (
                          <label key={opt} className="eb-radio-label">
                            <input type="radio" name="licensure_plans" value={opt} checked={form.licensure_plans === opt}
                              onChange={() => setForm(prev => ({ ...prev, licensure_plans: opt, board_exam_name: '', board_exam_date: '', board_exam_result: '' }))} />{opt}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="eb-field">
                      <label className="eb-label-sub">Reason(s) for not taking or taking licensure examination <span className="eb-req">*</span>{errors.has('licensure_reason') && <span className="eb-field-error">Required</span>}</label>
                      <textarea className="eb-textarea" placeholder="Enter your answer" value={form.licensure_reason} onChange={e => set('licensure_reason', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </>
                )}

                {showBoardExam && (
                  <>
                    <div className="eb-field">
                      <label className="eb-label-sub">Name of board/licensure examination <span className="eb-req">*</span>{errors.has('board_exam_name') && <span className="eb-field-error">Required</span>}</label>
                      <input className="eb-input" placeholder="Enter your answer" value={form.board_exam_name} onChange={e => set('board_exam_name', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div className="eb-field">
                      <label className="eb-label-sub">Date taken/date of examination <span className="eb-req">*</span>{errors.has('board_exam_date') && <span className="eb-field-error">Required</span>}</label>
                      <input type="date" className="eb-input" value={form.board_exam_date} onChange={e => set('board_exam_date', e.target.value)} style={{ colorScheme: 'dark' }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div className="eb-field">
                      <label className="eb-label-sub">Results <span className="eb-req">*</span>{errors.has('board_exam_result') && <span className="eb-field-error">Required</span>}</label>
                      <div className="eb-radio-group">
                        {['Passed', 'Failed', 'Pending', 'Not yet taken'].map(opt => (
                          <label key={opt} className="eb-radio-label">
                            <input type="radio" name="board_exam_result" value={opt} checked={form.board_exam_result === opt} onChange={() => set('board_exam_result', opt)} />{opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </div>

              <div className="eb-footer">
                <button className="eb-btn-prev" onClick={() => navigate('/survey/personal-background')}>Previous</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {saveToast && (
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: 'rgba(81,210,130,0.9)' }}>
                      Progress saved
                    </span>
                  )}
                  <button className="eb-btn-save" onClick={handleSave}>Save</button>
                  <button className="eb-btn-next" onClick={handleNext}>Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EducationalBackground;