import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ei-root { display: flex; min-height: 100vh; background: #DAE5F1; font-family: 'Arimo', Arial, sans-serif; }
  .ei-content { flex: 1; min-width: 0; margin-left: 229px; }
  .ei-header { position: sticky; top: 0; z-index: 40; background: #DAE5F1; padding-bottom: 16px; }
  .ei-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .ei-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #002263; flex-shrink: 0; }
  .ei-badge { background: #003EA6; border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .ei-bell { width: 48px; height: 48px; background: #003EA6; border: 1.24px solid rgba(255,255,255,0.2); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .ei-bell.active { background: #002263; border-color: rgba(0,34,99,0.5); }
  .ei-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: rgba(255,0,0,0.7); opacity: 0.42; border-radius: 50%; }
  .ei-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: rgba(255,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .ei-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #2D467C; }
  .ei-subtitle { text-align: center; padding: 4px 51px 0; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 20px; color: #4A5565; }
  .ei-progress { margin: 12px 51px 0; background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 16px; padding: 18px 30px 16px; }
  .ei-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1E3A5F; }
  .ei-progress-track { width: 100%; height: 12px; background: #E5E7EB; border-radius: 9999px; margin-bottom: 10px; overflow: hidden; }
  .ei-progress-fill { height: 100%; background: #EFC600; border-radius: 9999px; transition: width 0.4s ease; }
  .ei-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #4A5565; }
  .ei-body { padding: 24px 51px 60px; }
  .ei-card { background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 36px; }
  .ei-section-title { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 24px; line-height: 30px; color: #003EA6; text-align: center; }
  .ei-section-sub { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 20px; color: #003EA6; margin-top: 6px; text-align: center; }
  .ei-fields { display: flex; flex-direction: column; gap: 36px; }
  .ei-field { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .ei-label { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #003EA6; }
  .ei-input { width: 100%; height: 47px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 12px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; transition: border-color 0.15s; }
  .ei-input::placeholder { color: rgba(10,10,10,0.3); }
  .ei-input:focus { border-color: #003EA6; }
  .ei-radio-group { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
  .ei-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: #4A5565; line-height: 1.4; padding: 2px 0; }
  .ei-radio-label input[type="radio"] { width: 18px; height: 18px; accent-color: #003EA6; cursor: pointer; flex-shrink: 0; }
  .ei-branch { display: flex; flex-direction: column; gap: 36px; padding-top: 24px; }
  .ei-dropdown { position: relative; width: 100%; }
  .ei-dropdown-trigger { width: 100%; height: 47px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 0 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.15s; user-select: none; }
  .ei-dropdown-trigger.open { border-color: #003EA6; }
  .ei-dropdown-menu { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #FFFFFF; border: 1px solid #D1D5DC; border-radius: 10px; max-height: 260px; overflow-y: auto; z-index: 200; padding: 8px 0; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
  .ei-dropdown-item { padding: 10px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; cursor: pointer; transition: background 0.15s; }
  .ei-dropdown-item:hover { background: rgba(0,62,166,0.04); }
  .ei-dropdown-item.selected { background: rgba(0,62,166,0.08); color: #003EA6; }
  .ei-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .ei-btn-prev { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .ei-btn-prev:hover { background: #002a80; }
  .ei-btn-save { width: 100px; height: 48px; background: #FFFFFF; border: 0.8px solid rgba(0,34,99,0.6); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 8px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #002263; transition: background 0.15s, border-color 0.15s; }
  .ei-btn-save:hover { background: #f0f4fb; border-color: #002263; }
  .ei-btn-next { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .ei-btn-next:hover { background: #002a80; }
  .ei-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .ei-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }
  @media (max-width: 1100px) { .ei-topbar { padding: 24px 32px 0; } .ei-title { padding: 14px 32px 0; font-size: 26px; } .ei-subtitle { padding: 4px 32px 0; } .ei-progress { margin: 12px 32px 0; } .ei-body { padding: 20px 32px 60px; } .ei-card { padding: 32px 32px 28px; } }
  @media (max-width: 900px) { .ei-topbar { padding: 20px 24px 0; } .ei-title { padding: 12px 24px 0; font-size: 24px; } .ei-subtitle { padding: 4px 24px 0; } .ei-progress { margin: 10px 24px 0; } .ei-body { padding: 18px 24px 60px; } .ei-card { padding: 28px 24px 24px; gap: 28px; } .ei-fields { gap: 28px; } .ei-branch { gap: 28px; } }
  @media (max-width: 767px) { .ei-content { margin-left: 0; } .ei-topbar { padding: 20px 16px 0; } .ei-badge { padding: 6px 12px; font-size: 10px; } .ei-bell { display: none; } .ei-title { padding: 12px 16px 0; font-size: 20px; } .ei-subtitle { padding: 4px 16px 0; font-size: 14px; } .ei-progress { margin: 10px 16px 0; padding: 14px 16px; } .ei-progress-row { font-size: 13px; } .ei-progress-label { font-size: 13px; } .ei-body { padding: 16px 16px 80px; } .ei-card { padding: 20px 16px 20px; gap: 24px; } .ei-fields { gap: 24px; } .ei-branch { gap: 24px; } .ei-section-title { font-size: 17px; } .ei-btn-prev { width: 100px; height: 44px; font-size: 14px; } .ei-btn-save { width: 80px; height: 44px; font-size: 14px; } .ei-btn-next { width: 100px; height: 44px; font-size: 14px; } }
  @media (max-width: 390px) { .ei-title { font-size: 17px; } .ei-input { font-size: 13px; } .ei-btn-prev, .ei-btn-next { width: 90px; font-size: 13px; } .ei-btn-save { width: 70px; font-size: 13px; } }
  @media (max-height: 600px) { .ei-header { padding-bottom: 10px; } .ei-progress { padding: 10px 20px; } .ei-body { padding-top: 14px; } }
`;

const onFocus = e => e.target.style.borderColor = '#003EA6';
const onBlur = e => e.target.style.borderColor = '#D1D5DC';

// Industry Select Dropdown
const SelectDropdown = ({ value, onChange, industryOptions, placeholder }) => {
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
        <span style={{ color: value ? '#0A0A0A' : 'rgba(10,10,10,0.3)' }}>{value || placeholder || 'Select'}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M1 1L6 7L11 1" stroke="#00226D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <div className="ei-dropdown-menu">
          {industryOptions.map(opt => (
            <div key={opt} className={`ei-dropdown-item${value === opt ? ' selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}>{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmploymentInformationView = ({
  form, set, resetEmploymentBranch,
  errors, saveToast, cardRef,
  formPct, currentSection, totalSections,
  industryOptions, employmentStatusesAll, reasonsForJob,
  unemployedReasons, monthlyIncome, locationOptions,
  employedStatuses, unemployedStatuses,
  getLabel, getPlaceholder,
  handleSave, handleNext,
  onBack,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  const isEmployed = employedStatuses.includes(form.employment_status);
  const isUnemployed = unemployedStatuses.includes(form.employment_status);
  const showEmployedFields = form.employment_status !== '' && isEmployed;
  const showUnemployedFields = form.employment_status !== '' && isUnemployed;

  return (
    <>
      <style>{STYLES}</style>
      <div className="ei-root">
        <Sidebar />
        <div className="ei-content">

          <div className="ei-header">
            <div className="ei-topbar">
              <button className="ei-back-btn" onClick={onBack}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              

              <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  className={`ei-bell${showDropdown ? ' active' : ''}`}
                  onClick={() => setShowDropdown(v => !v)}
                >
                  <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                    <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z" stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {unreadCount > 0 && (
                    <>
                      <div className="ei-bell-dot" />
                      <div className="ei-bell-count">{unreadCount > 99 ? '99+' : unreadCount}</div>
                    </>
                  )}
                </button>

                {showDropdown && (
                  <div style={{ position: 'absolute', top: '60px', right: 0, width: '380px', maxHeight: '520px', background: '#FFFFFF', backdropFilter: 'blur(16px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 300 }}>
                    <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', color: '#003EA6' }}>Notifications</span>
                      {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#003EA6', cursor: 'pointer', padding: 0 }}>Mark all read</button>}
                    </div>
                    <div style={{ display: 'flex', padding: '10px 18px 0', gap: '4px', flexShrink: 0 }}>
                      {['all', 'unread'].map(t => (
                        <button key={t} onClick={() => setNotifTab(t)} style={{ height: '32px', padding: '0 16px', background: notifTab === t ? '#003EA6' : 'transparent', border: notifTab === t ? 'none' : '1px solid #D1D5DC', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Arimo', fontSize: '13px', fontWeight: notifTab === t ? 700 : 400, color: notifTab === t ? '#FFFFFF' : '#4A5565', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                          {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                        </button>
                      ))}
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                      {(() => {
                        const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                        if (!list.length) return (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: '10px' }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: 'rgba(0,0,0,0.3)', margin: 0 }}>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
                          </div>
                        );
                        return Object.entries(groupByDate(list)).map(([label, items]) => {
                          if (!items.length) return null;
                          return (
                            <div key={label}>
                              <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px', color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{label}</p>
                              {items.map(n => (
                                <div key={n.id} onClick={() => markOneRead(n.id)}
                                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 18px', background: n.read ? 'transparent' : 'rgba(0,62,166,0.05)', cursor: 'pointer', transition: 'background 0.12s', borderLeft: n.read ? '3px solid transparent' : '3px solid #003EA6' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(0,62,166,0.05)'}
                                >
                                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0,62,166,0.08)', border: '1px solid rgba(0,62,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"/></svg>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: 'Arimo', fontWeight: n.read ? 400 : 700, fontSize: '13px', color: '#0A0A0A', margin: '0 0 2px 0', lineHeight: '1.4' }}>{n.title}</p>
                                    <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: '#4A5565', margin: '0 0 4px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body}</p>
                                    <span style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(0,0,0,0.35)' }}>{formatTime(n.time)}</span>
                                  </div>
                                  {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#003EA6', flexShrink: 0, marginTop: '6px' }} />}
                                </div>
                              ))}
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
                      <button onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                        style={{ width: '100%', height: '36px', background: '#F9FAFB', border: '1px solid #D1D5DC', borderRadius: '10px', fontFamily: 'Arimo', fontSize: '13px', color: '#4A5565', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F0F4FB'}
                        onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
                      >
                        See all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h1 className="ei-title">Alumni Tracer Survey</h1>
            <p className="ei-subtitle">Please complete all sections to update your alumni status.</p>

            <div className="ei-progress">
              <div className="ei-progress-row">
                <span>Section {currentSection} of {totalSections}</span>
                <span style={{ color: '#003EA6', fontWeight: 700 }}>{formPct}% Complete</span>
              </div>
              <div className="ei-progress-track">
                <div className="ei-progress-fill" style={{ width: `${formPct}%` }} />
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
                  <span className="ei-label">
                    {getLabel('job_related_to_degree')} <span className="ei-req">*</span>
                    {errors.has('job_related_to_degree') && <span className="ei-field-error">Required</span>}
                  </span>
                  <div className="ei-radio-group">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="ei-radio-label">
                        <input type="radio" name="job_related_to_degree" value={opt}
                          checked={form.job_related_to_degree === opt}
                          onChange={() => set('job_related_to_degree', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="ei-field">
                  <span className="ei-label">
                    {getLabel('employment_status')} <span className="ei-req">*</span>
                    {errors.has('employment_status') && <span className="ei-field-error">Required</span>}
                  </span>
                  <div className="ei-radio-group">
                    {employmentStatusesAll.map(opt => (
                      <label key={opt} className="ei-radio-label">
                        <input type="radio" name="employment_status" value={opt}
                          checked={form.employment_status === opt}
                          onChange={() => resetEmploymentBranch(opt)} />{opt}
                      </label>
                    ))}
                  </div>
                  {form.employment_status === 'Other' && (
                    <input className="ei-input" type="text" placeholder={getPlaceholder('other_employment_status') || 'Please specify'}
                      value={form.other_employment_status}
                      onChange={e => set('other_employment_status', e.target.value)}
                      onFocus={onFocus} onBlur={onBlur}
                      style={{ marginTop: '8px', borderColor: errors.has('other_employment_status') ? '#F87171' : undefined }}
                    />
                  )}
                </div>
              </div>

              {showEmployedFields && (
                <div className="ei-branch">
                  <div className="ei-field">
                    <span className="ei-label">
                      {getLabel('job_position')} <span className="ei-req">*</span>
                      {errors.has('job_position') && <span className="ei-field-error">Required</span>}
                    </span>
                    <input className="ei-input" type="text" placeholder={getPlaceholder('job_position') || 'Enter your answer'}
                      value={form.job_position} onChange={e => set('job_position', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">
                      {getLabel('company_name')} <span className="ei-req">*</span>
                      {errors.has('company_name') && <span className="ei-field-error">Required</span>}
                    </span>
                    <input className="ei-input" type="text" placeholder={getPlaceholder('company_name') || 'Enter your answer'}
                      value={form.company_name} onChange={e => set('company_name', e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">
                      {getLabel('type_of_industry')} <span className="ei-req">*</span>
                      {errors.has('type_of_industry') && <span className="ei-field-error">Required</span>}
                    </span>
                    <SelectDropdown value={form.type_of_industry} onChange={v => set('type_of_industry', v)} industryOptions={industryOptions} placeholder={getPlaceholder('type_of_industry') || 'Select industry'} />
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">
                      {getLabel('location_of_employment')} <span className="ei-req">*</span>
                      {errors.has('location_of_employment') && <span className="ei-field-error">Required</span>}
                    </span>
                    <div className="ei-radio-group">
                      {locationOptions.map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="location_of_employment" value={opt}
                            checked={form.location_of_employment === opt}
                            onChange={() => set('location_of_employment', opt)} />{opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">
                      {getLabel('monthly_income')} <span className="ei-req">*</span>
                      {errors.has('monthly_income') && <span className="ei-field-error">Required</span>}
                    </span>
                    <div className="ei-radio-group">
                      {monthlyIncome.map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="monthly_income" value={opt}
                            checked={form.monthly_income === opt}
                            onChange={() => set('monthly_income', opt)} />{opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="ei-field">
                    <span className="ei-label">
                      {getLabel('reason_for_job')} <span className="ei-req">*</span>
                      {errors.has('reason_for_job') && <span className="ei-field-error">Required</span>}
                    </span>
                    <div className="ei-radio-group">
                      {reasonsForJob.map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="reason_for_job" value={opt}
                            checked={form.reason_for_job === opt}
                            onChange={() => set('reason_for_job', opt)} />{opt}
                        </label>
                      ))}
                    </div>
                    {form.reason_for_job === 'Other' && (
                      <input className="ei-input" type="text" placeholder={getPlaceholder('other_reason_for_job') || 'Please specify'}
                        value={form.other_reason_for_job}
                        onChange={e => set('other_reason_for_job', e.target.value)}
                        onFocus={onFocus} onBlur={onBlur}
                        style={{ marginTop: '8px', borderColor: errors.has('other_reason_for_job') ? '#F87171' : undefined }}
                      />
                    )}
                  </div>
                </div>
              )}

              {showUnemployedFields && (
                <div className="ei-branch">
                  <div className="ei-field">
                    <span className="ei-label">
                      {getLabel('reasons_unemployed')} <span className="ei-req">*</span>
                      {errors.has('reasons_unemployed') && <span className="ei-field-error">Required</span>}
                    </span>
                    <div className="ei-radio-group" style={{ gap: '16px' }}>
                      {unemployedReasons.map(reason => (
                        <label key={reason} className="ei-radio-label">
                          <input type="radio" name="reasons_unemployed" value={reason}
                            checked={form.reasons_unemployed === reason}
                            onChange={() => set('reasons_unemployed', reason)} />{reason}
                        </label>
                      ))}
                    </div>
                    {form.reasons_unemployed === 'Other' && (
                      <input className="ei-input" type="text" placeholder={getPlaceholder('other_reason_unemployed') || 'Please specify'}
                        value={form.other_reason_unemployed}
                        onChange={e => set('other_reason_unemployed', e.target.value)}
                        onFocus={onFocus} onBlur={onBlur}
                        style={{ marginTop: '8px', borderColor: errors.has('other_reason_unemployed') ? '#F87171' : undefined }}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="ei-footer">
                <button className="ei-btn-prev" onClick={() => navigate('/survey/certification-achievement')}>Previous</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {saveToast && (
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#15803d' }}>
                      Progress saved
                    </span>
                  )}
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

export default EmploymentInformationView;