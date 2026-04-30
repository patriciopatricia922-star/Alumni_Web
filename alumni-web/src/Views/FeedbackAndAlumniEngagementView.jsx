import React from 'react';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .fa-root { display: flex; min-height: 100vh; background: #DAE5F1; font-family: 'Arimo', Arial, sans-serif; }
  .fa-content { flex: 1; min-width: 0; margin-left: 229px; }
  .fa-header { position: sticky; top: 0; z-index: 40; background: #DAE5F1; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .fa-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .fa-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #002263; flex-shrink: 0; }
  .fa-badge { background: #003EA6; border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .fa-bell { width: 48px; height: 48px; background: #003EA6; border: 1.24px solid rgba(255,255,255,0.2); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .fa-bell.active { background: #002263; border-color: rgba(0,34,99,0.5); }
  .fa-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: rgba(255,0,0,0.7); opacity: 0.42; border-radius: 50%; }
  .fa-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: rgba(255,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .fa-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #2D467C; }
  .fa-subtitle { text-align: center; padding: 4px 51px 0; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 20px; color: #4A5565; }
  .fa-progress { margin: 12px 51px 0; background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 16px; padding: 18px 30px 16px; }
  .fa-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1E3A5F; }
  .fa-progress-track { width: 100%; height: 12px; background: #E5E7EB; border-radius: 9999px; margin-bottom: 10px; overflow: hidden; }
  .fa-progress-fill { height: 100%; background: #EFC600; border-radius: 9999px; transition: width 0.4s ease; }
  .fa-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #4A5565; }
  .fa-body { padding: 24px 51px 60px; }
  .fa-card { background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 36px; }
  .fa-section-title { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 24px; line-height: 30px; color: #003EA6; text-align: center; }
  .fa-section-sub { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 20px; color: #003EA6; margin-top: 6px; text-align: center; }
  .fa-questions { display: flex; flex-direction: column; gap: 36px; }
  .fa-field { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .fa-label { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #003EA6; }
  .fa-radio-group { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
  .fa-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: #4A5565; line-height: 1.4; padding: 2px 0; }
  .fa-radio-label input[type="radio"] { width: 18px; height: 18px; accent-color: #003EA6; cursor: pointer; flex-shrink: 0; }
  .fa-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: #4A5565; line-height: 1.4; padding: 2px 0; }
  .fa-checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #003EA6; cursor: pointer; flex-shrink: 0; }
  .fa-textarea { width: 100%; height: 110px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 12px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; resize: vertical; transition: border-color 0.15s; }
  .fa-textarea::placeholder { color: rgba(10,10,10,0.3); }
  .fa-textarea:focus { border-color: #003EA6; }
  .fa-divider { width: 100%; height: 1px; background: #E5E7EB; }
  .fa-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .fa-btn-prev { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .fa-btn-prev:hover { background: #002a80; }
  .fa-btn-save { width: 100px; height: 48px; background: #FFFFFF; border: 0.8px solid rgba(0,34,99,0.6); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 8px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #002263; transition: background 0.15s, border-color 0.15s; }
  .fa-btn-save:hover { background: #f0f4fb; border-color: #002263; }
  .fa-btn-submit { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .fa-btn-submit:hover { background: #002a80; }
  .fa-error-banner { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.3); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 13px; color: #DC2626; line-height: 1.5; }
  .fa-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .fa-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }
  .fa-other-input { width: 100%; height: 47px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 12px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; margin-top: 8px; transition: border-color 0.15s; }
  .fa-other-input:focus { border-color: #003EA6; }
  .fa-other-input::placeholder { color: rgba(10,10,10,0.3); }
  @media (max-width: 1100px) { .fa-topbar { padding: 24px 32px 0; } .fa-title { padding: 14px 32px 0; font-size: 26px; } .fa-subtitle { padding: 4px 32px 0; } .fa-progress { margin: 12px 32px 0; } .fa-body { padding: 20px 32px 60px; } .fa-card { padding: 32px 32px 28px; } }
  @media (max-width: 900px) { .fa-topbar { padding: 20px 24px 0; } .fa-title { padding: 12px 24px 0; font-size: 24px; } .fa-subtitle { padding: 4px 24px 0; } .fa-progress { margin: 10px 24px 0; } .fa-body { padding: 18px 24px 60px; } .fa-card { padding: 28px 24px 24px; gap: 28px; } .fa-questions { gap: 28px; } }
  @media (max-width: 767px) { .fa-content { margin-left: 0; } .fa-topbar { padding: 20px 16px 0; } .fa-badge { padding: 6px 12px; font-size: 10px; } .fa-bell { display: none; } .fa-title { padding: 12px 16px 0; font-size: 20px; } .fa-subtitle { padding: 4px 16px 0; font-size: 14px; } .fa-progress { margin: 10px 16px 0; padding: 14px 16px; } .fa-progress-row { font-size: 13px; } .fa-progress-label { font-size: 13px; } .fa-body { padding: 16px 16px 80px; } .fa-card { padding: 20px 16px 20px; gap: 24px; } .fa-questions { gap: 24px; } .fa-section-title { font-size: 17px; } .fa-btn-prev { width: 100px; height: 44px; font-size: 14px; } .fa-btn-save { width: 80px; height: 44px; font-size: 14px; } .fa-btn-submit { width: 100px; height: 44px; font-size: 14px; } }
  @media (max-width: 390px) { .fa-title { font-size: 17px; } .fa-textarea, .fa-other-input { font-size: 13px; } .fa-btn-prev, .fa-btn-submit { width: 90px; font-size: 13px; } .fa-btn-save { width: 70px; font-size: 13px; } }
  @media (max-height: 600px) { .fa-header { padding-bottom: 10px; } .fa-progress { padding: 10px 20px; } .fa-body { padding-top: 14px; } }
`;

// Static fallback labels — used when getLabel/getPlaceholder are not provided as functions
const DEFAULT_LABELS = {
  satisfaction:           'How satisfied are you with the education you received from NU Dasmariñas?',
  recommend:              'Would you recommend NU Dasmariñas to others?',
  suggestions:            'Do you have any suggestions or feedback for the university?',
  informed_about_events:  'Are you informed about alumni events and activities?',
  participate_in:         'Which alumni activities would you be willing to participate in? (Select all that apply)',
  other_participate:      'Please specify other activities',
};

const DEFAULT_PLACEHOLDERS = {
  suggestions:      'Share your suggestions, comments, or feedback here...',
  other_participate: 'Please specify',
};

const FeedbackAndAlumniEngagementView = ({
  form, set, toggleParticipate,
  errors, saveToast, cardRef,
  formPct, currentSection, totalSections,
  satisfactionOptions, participateOptions, yesNoOptions,
  getLabel, getPlaceholder,
  handleSave, handleSubmit,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  // Safe wrappers — if the controller doesn't pass these as functions, fall back gracefully
  const label       = (key) => typeof getLabel       === 'function' ? getLabel(key)       : (DEFAULT_LABELS[key]       || key);
  const placeholder = (key) => typeof getPlaceholder === 'function' ? getPlaceholder(key) : (DEFAULT_PLACEHOLDERS[key] || '');

  return (
    <>
      <style>{STYLES}</style>
      <div className="fa-root">
        <Sidebar />
        <div className="fa-content">

          <div className="fa-header">
            <div className="fa-topbar">
              <button className="fa-back-btn" onClick={() => navigate('/survey/skills-and-competencies')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <div className="fa-badge">ALUMNI STATUS</div>

              <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  className={`fa-bell${showDropdown ? ' active' : ''}`}
                  onClick={() => setShowDropdown(v => !v)}
                >
                  <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                    <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z" stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {unreadCount > 0 && (
                    <>
                      <div className="fa-bell-dot" />
                      <div className="fa-bell-count">{unreadCount > 99 ? '99+' : unreadCount}</div>
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
                        return Object.entries(groupByDate(list)).map(([lbl, items]) => {
                          if (!items.length) return null;
                          return (
                            <div key={lbl}>
                              <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px', color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{lbl}</p>
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

            <h1 className="fa-title">Alumni Tracer Survey</h1>
            <p className="fa-subtitle">Please complete all sections to update your alumni status.</p>

            <div className="fa-progress">
              <div className="fa-progress-row">
                <span>Section {currentSection} of {totalSections}</span>
                <span style={{ color: '#003EA6', fontWeight: 700 }}>{formPct}% Complete</span>
              </div>
              <div className="fa-progress-track">
                <div className="fa-progress-fill" style={{ width: `${formPct}%` }} />
              </div>
              <span className="fa-progress-label">Feedback and Alumni Engagement</span>
            </div>
          </div>

          <div className="fa-body">
            <div className="fa-card" ref={cardRef}>
              {errors.size > 0 && (
                <div className="fa-error-banner">
                  <strong>Please answer all required questions before proceeding.</strong>
                </div>
              )}
              <div>
                <h2 className="fa-section-title">Feedback and Alumni Engagement</h2>
                <p className="fa-section-sub">Share your thoughts and stay connected with us</p>
              </div>

              <div className="fa-questions">

                <div className="fa-field">
                  <span className="fa-label">
                    {label('satisfaction')} <span className="fa-req">*</span>
                    {errors.has('satisfaction') && <span className="fa-field-error">Required</span>}
                  </span>
                  <div className="fa-radio-group">
                    {(satisfactionOptions || []).map(opt => (
                      <label key={opt} className="fa-radio-label">
                        <input type="radio" name="satisfaction" value={opt}
                          checked={form.satisfaction === opt}
                          onChange={() => set('satisfaction', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="fa-field">
                  <span className="fa-label">
                    {label('recommend')} <span className="fa-req">*</span>
                    {errors.has('recommend') && <span className="fa-field-error">Required</span>}
                  </span>
                  <div className="fa-radio-group">
                    {(yesNoOptions || []).map(opt => (
                      <label key={opt} className="fa-radio-label">
                        <input type="radio" name="recommend" value={opt}
                          checked={form.recommend === opt}
                          onChange={() => set('recommend', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="fa-field">
                  <span className="fa-label">
                    {label('suggestions')} <span className="fa-req">*</span>
                    {errors.has('suggestions') && <span className="fa-field-error">Required</span>}
                  </span>
                  <textarea className="fa-textarea"
                    placeholder={placeholder('suggestions') || 'Enter your answer'}
                    value={form.suggestions}
                    onChange={e => set('suggestions', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#003EA6'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DC'} />
                </div>

                <div className="fa-divider" />

                <div className="fa-field">
                  <span className="fa-label">
                    {label('informed_about_events')} <span className="fa-req">*</span>
                    {errors.has('informed_about_events') && <span className="fa-field-error">Required</span>}
                  </span>
                  <div className="fa-radio-group">
                    {(yesNoOptions || []).map(opt => (
                      <label key={opt} className="fa-radio-label">
                        <input type="radio" name="informed_about_events" value={opt}
                          checked={form.informed_about_events === opt}
                          onChange={() => set('informed_about_events', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="fa-field">
                  <span className="fa-label">
                    {label('participate_in')} <span className="fa-req">*</span>
                    {errors.has('participate_in') && <span className="fa-field-error">Required</span>}
                  </span>
                  <div className="fa-radio-group">
                    {(participateOptions || []).map(opt => (
                      <label key={opt} className="fa-checkbox-label">
                        <input type="checkbox" value={opt}
                          checked={form.participate_in.includes(opt)}
                          onChange={() => toggleParticipate(opt)} />{opt}
                      </label>
                    ))}
                  </div>
                  {form.participate_in.includes('Other') && (
                    <input
                      className="fa-other-input"
                      placeholder={placeholder('other_participate') || 'Please specify'}
                      value={form.other_participate}
                      onChange={e => set('other_participate', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#003EA6'}
                      onBlur={e => e.target.style.borderColor = '#D1D5DC'}
                      style={{ borderColor: errors.has('other_participate') ? '#F87171' : undefined }}
                    />
                  )}
                </div>

              </div>

              <div className="fa-footer">
                <button className="fa-btn-prev" onClick={() => navigate('/survey/skills-and-competencies')}>Previous</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {saveToast && (
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#15803d' }}>
                      ✓ Progress saved
                    </span>
                  )}
                  <button className="fa-btn-save" onClick={handleSave}>Save</button>
                  <button className="fa-btn-submit" onClick={handleSubmit}>Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackAndAlumniEngagementView;