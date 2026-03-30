import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiBell, FiCheck, FiSave, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ds-root { display: flex; min-height: 100vh; background: #002263; font-family: 'Arimo', Arial, sans-serif; }
  .ds-content { flex: 1; min-width: 0; margin-left: 229px; }
  .ds-header { position: sticky; top: 0; z-index: 40; background: #002263; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .ds-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .ds-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
  .ds-badge { background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .ds-bell { width: 48px; height: 48px; background: rgba(0,62,166,0.35); border: 1.24px solid rgba(255,255,255,0.2); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .ds-bell.active { background: rgba(43,114,251,0.2); border-color: rgba(43,114,251,0.5); }
  .ds-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: #2B72FB; opacity: 0.42; border-radius: 50%; }
  .ds-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: #2B72FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .ds-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #fff; }
  .ds-progress { margin: 12px 51px 0; background: #001743; border: 1px solid #01122F; border-radius: 16px; padding: 18px 30px 16px; }
  .ds-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 16px; color: rgba(255,255,255,0.99); }
  .ds-progress-track { width: 100%; height: 11px; background: #D9CA81; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
  .ds-progress-fill { height: 100%; background: #51A2FF; border-radius: 10px; transition: width 0.4s ease; }
  .ds-progress-label { font-size: 17px; color: rgba(255,255,255,0.99); }
  .ds-body { padding: 24px 51px 60px; }
  .ds-card { background: rgba(13,19,56,0.4); border: 0.89px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; display: flex; flex-direction: column; gap: 36px; }
  .ds-section-title { font-size: 20px; font-weight: 700; color: #fff; text-align: center; }
  .ds-section-sub { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 6px; text-align: center; }
  .ds-questions { display: flex; flex-direction: column; gap: 32px; }
  .ds-question { display: flex; flex-direction: column; gap: 14px; }
  .ds-label { font-size: 14px; color: rgba(255,255,255,0.9); }
  .ds-input, .ds-select { width: 100%; height: 47px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 16px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.15s; }
  .ds-input:focus, .ds-select:focus { border-color: rgba(43,114,251,0.6); }
  .ds-input.error, .ds-select.error { border-color: #F87171; }
  .ds-textarea { width: 100%; min-height: 100px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 16px; font-size: 14px; color: #fff; outline: none; resize: vertical; transition: border-color 0.15s; }
  .ds-textarea:focus { border-color: rgba(43,114,251,0.6); }
  .ds-textarea.error { border-color: #F87171; }
  .ds-radio-group { display: flex; flex-direction: column; gap: 12px; }
  .ds-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; color: rgba(255,255,255,0.7); }
  .ds-radio-label input { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; }
  .ds-checkbox-group { display: flex; flex-direction: column; gap: 12px; }
  .ds-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; color: rgba(255,255,255,0.7); }
  .ds-checkbox-label input { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; }
  .ds-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; cursor: pointer; }
  .ds-select option { background: #001743; }
  .ds-star-rating { display: flex; gap: 12px; }
  .ds-star { cursor: pointer; transition: transform 0.1s; }
  .ds-star:hover { transform: scale(1.1); }
  .ds-error { color: #F87171; font-size: 12px; margin-top: 4px; }
  .ds-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
  .ds-btn-prev { width: 120px; height: 48px; background: #fff; border-radius: 10px; border: none; cursor: pointer; font-size: 15px; font-weight: 600; color: #090909; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .ds-btn-prev:hover { opacity: 0.85; }
  .ds-btn-save { width: 88px; height: 48px; background: transparent; border: 1.24px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-size: 15px; color: rgba(255,255,255,0.8); transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .ds-btn-save:hover { border-color: rgba(255,255,255,0.7); color: #fff; }
  .ds-btn-next { width: 120px; height: 48px; background: #0028FF; border-radius: 10px; border: none; cursor: pointer; font-size: 15px; font-weight: 600; color: #fff; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .ds-btn-next:hover { opacity: 0.9; }
  .ds-req { color: #F87171; margin-left: 2px; }
  .ds-toast { position: fixed; bottom: 20px; right: 20px; background: #10B981; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; animation: fadeOut 2.5s forwards; z-index: 1000; display: flex; align-items: center; gap: 6px; }
  @keyframes fadeOut { 0% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; visibility: hidden; } }
  .ds-phone-row { display: flex; gap: 12px; }
  .ds-phone-prefix { width: 58px; height: 47px; flex-shrink: 0; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: rgba(255,255,255,0.6); }
  .ds-phone-input { flex: 1; }
  @media (max-width: 1100px) { .ds-topbar { padding: 24px 32px 0; } .ds-title { padding: 14px 32px 0; font-size: 26px; } .ds-progress { margin: 12px 32px 0; } .ds-body { padding: 20px 32px 60px; } .ds-card { padding: 32px; } }
  @media (max-width: 900px) { .ds-topbar { padding: 20px 24px 0; } .ds-title { padding: 12px 24px 0; font-size: 24px; } .ds-progress { margin: 10px 24px 0; } .ds-body { padding: 18px 24px 60px; } .ds-card { padding: 28px 24px; } }
  @media (max-width: 767px) { .ds-content { margin-left: 0; } .ds-topbar { padding: 20px 16px 0; } .ds-badge { padding: 6px 12px; font-size: 10px; } .ds-bell { display: none; } .ds-title { padding: 12px 16px 0; font-size: 20px; } .ds-progress { margin: 10px 16px 0; padding: 14px 16px; } .ds-progress-row { font-size: 13px; } .ds-progress-label { font-size: 13px; } .ds-body { padding: 16px 16px 80px; } .ds-card { padding: 20px 16px; gap: 24px; } .ds-section-title { font-size: 17px; } .ds-btn-prev, .ds-btn-next { width: 100px; height: 44px; font-size: 14px; } .ds-btn-save { width: 80px; height: 44px; font-size: 14px; } }
`;

const StarRating = ({ value, onChange }) => (
  <div className="ds-star-rating">
    {[1, 2, 3, 4, 5].map(star => (
      <div key={star} className="ds-star" onClick={() => onChange(star)}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= value ? '#51A2FF' : '#D9D9D9'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
    ))}
  </div>
);

// Notification component (same as original)
const NotificationBell = ({ bellRef, notifs, unreadCount, showDropdown, setShowDropdown, notifTab, setNotifTab, markAllRead, markOneRead, groupByDate, formatTime, navigate }) => {
  return (
    <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        className={`ds-bell${showDropdown ? ' active' : ''}`}
        onClick={() => setShowDropdown(v => !v)}
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <>
            <div className="ds-bell-dot" />
            <div className="ds-bell-count">{unreadCount > 99 ? '99+' : unreadCount}</div>
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
            {['all', 'unread'].map(t => (
              <button key={t} onClick={() => setNotifTab(t)} style={{ height: '32px', padding: '0 16px', background: notifTab === t ? '#2B72FB' : 'transparent', border: notifTab === t ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Arimo', fontSize: '13px', fontWeight: notifTab === t ? 700 : 400, color: '#FFFFFF', transition: 'all 0.15s', textTransform: 'capitalize' }}>
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
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DynamicSurveyView = ({
  section,
  formData,
  errors,
  saveToast,
  cardRef,
  formPct,
  sectionPct,
  currentSection,
  totalSections,
  handleInputChange,
  handleRadioChange,
  handleCheckboxChange,
  handleSave,
  handleNext,
  handlePrev,
  navigate,
}) => {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  // Notification state
  const bellRef = useRef(null);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab, setNotifTab] = useState('all');

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
      const mapped = data.map(n => ({ id: n.id, title: n.title, body: n.content, time: n.published_at, read: readIds.includes(n.id) }));
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
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate()-7);
    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0,0,0,0);
      if (d >= today) groups['Today'].push(n);
      else if (d >= yesterday) groups['Yesterday'].push(n);
      else if (d >= weekAgo) groups['This Week'].push(n);
      else groups['Earlier'].push(n);
    });
    return groups;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const renderQuestion = (question) => {
    const value = formData[question.id];
    const hasError = errors.has(question.id);
    const isRequired = question.required;
    
    const showRequiredStar = isRequired ? <span className="ds-req">*</span> : null;

    switch (question.type) {
      case 'short':
        return (
          <>
            <div className="ds-label">
              {question.label} {showRequiredStar}
              {hasError && <span className="ds-error"> Required</span>}
            </div>
            <input
              className={`ds-input ${hasError ? 'error' : ''}`}
              type="text"
              placeholder={question.placeholder}
              value={value || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
            />
          </>
        );
      
      case 'long':
        return (
          <>
            <div className="ds-label">
              {question.label} {showRequiredStar}
              {hasError && <span className="ds-error"> Required</span>}
            </div>
            <textarea
              className={`ds-textarea ${hasError ? 'error' : ''}`}
              placeholder={question.placeholder}
              value={value || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              rows={4}
            />
          </>
        );
      
      case 'date':
        return (
          <>
            <div className="ds-label">
              {question.label} {showRequiredStar}
              {hasError && <span className="ds-error"> Required</span>}
            </div>
            <input
              className={`ds-input ${hasError ? 'error' : ''}`}
              type="date"
              value={value || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </>
        );
      
      case 'multiple':
        return (
          <>
            <div className="ds-label">
              {question.label} {showRequiredStar}
              {hasError && <span className="ds-error"> Required</span>}
            </div>
            <div className="ds-radio-group">
              {question.options?.map(opt => (
                <label key={opt} className="ds-radio-label">
                  <input
                    type="radio"
                    name={question.id}
                    value={opt}
                    checked={value === opt}
                    onChange={() => handleRadioChange(question.id, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </>
        );
      
      case 'checkbox':
        return (
          <>
            <div className="ds-label">
              {question.label} {showRequiredStar}
              {hasError && <span className="ds-error"> Required</span>}
            </div>
            <div className="ds-checkbox-group">
              {question.options?.map(opt => (
                <label key={opt} className="ds-checkbox-label">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={Array.isArray(value) && value.includes(opt)}
                    onChange={(e) => handleCheckboxChange(question.id, opt, e.target.checked)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </>
        );
      
      case 'rating':
        return (
          <>
            <div className="ds-label">
              {question.label} {showRequiredStar}
              {hasError && <span className="ds-error"> Required</span>}
            </div>
            <StarRating
              value={value || 0}
              onChange={(rating) => handleInputChange(question.id, rating)}
            />
          </>
        );
      
      case 'select':
        return (
          <>
            <div className="ds-label">
              {question.label} {showRequiredStar}
              {hasError && <span className="ds-error"> Required</span>}
            </div>
            <select
              className={`ds-select ${hasError ? 'error' : ''}`}
              value={value || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {question.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </>
        );
      
      case 'phone':
        const prefix = formData.phone_prefix || '+63';
        return (
          <>
            <div className="ds-label">
              {question.label} {showRequiredStar}
              {hasError && <span className="ds-error"> Required</span>}
            </div>
            <div className="ds-phone-row">
              <div className="ds-phone-prefix">{prefix}</div>
              <input
                className={`ds-input ds-phone-input ${hasError ? 'error' : ''}`}
                type="tel"
                placeholder={question.placeholder}
                value={value || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="ds-root">
        <Sidebar />
        <div className="ds-content">
          <div className="ds-header">
            <div className="ds-topbar">
              <button className="ds-back-btn" onClick={() => navigate('/dashboard')}>
                <FiArrowLeft size={15} /> Back
              </button>
              <div className="ds-badge">ALUMNI STATUS</div>
              <NotificationBell
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
                navigate={navigate}
              />
            </div>
            <h1 className="ds-title">Alumni Tracer Survey</h1>
            <div className="ds-progress">
              <div className="ds-progress-row">
                <span>Section {currentSection} of {totalSections}</span>
                <span style={{ color: '#51A2FF', fontWeight: 700 }}>{Math.round(formPct)}%</span>
              </div>
              <div className="ds-progress-track">
                <div className="ds-progress-fill" style={{ width: `${formPct}%` }} />
              </div>
              <span className="ds-progress-label">{section.title}</span>
            </div>
          </div>

          <div className="ds-body">
            <div className="ds-card" ref={cardRef}>
              <div>
                <h2 className="ds-section-title">{section.title}</h2>
                <p className="ds-section-sub">{section.description}</p>
              </div>

              <div className="ds-questions">
                {section.questions?.map((question, idx) => (
                  <div key={question.id || idx} className="ds-question">
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>

              <div className="ds-footer">
                {currentSection > 1 && (
                  <button className="ds-btn-prev" onClick={handlePrev}>
                    <FiArrowLeft size={16} /> Previous
                  </button>
                )}
                <div style={{ display: 'flex', gap: '12px', marginLeft: currentSection === 1 ? 'auto' : 0 }}>
                  {saveToast && (
                    <div className="ds-toast">
                      <FiCheck size={14} /> Progress saved
                    </div>
                  )}
                  <button className="ds-btn-save" onClick={handleSave}>
                    <FiSave size={14} /> Save
                  </button>
                  <button className="ds-btn-next" onClick={handleNext}>
                    {currentSection === totalSections ? 'Submit' : 'Next'} <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicSurveyView;