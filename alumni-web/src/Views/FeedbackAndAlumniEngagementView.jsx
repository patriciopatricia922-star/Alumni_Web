import React from 'react';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .fa-root { display: flex; min-height: 100vh; background: #002263; font-family: 'Arimo', Arial, sans-serif; }
  .fa-content { flex: 1; min-width: 0; margin-left: 229px; }
  .fa-header { position: sticky; top: 0; z-index: 40; background: #002263; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .fa-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .fa-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
  .fa-badge { background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .fa-bell { width: 48px; height: 48px; background: rgba(0,62,166,0.35); border: 1.24px solid rgba(255,255,255,0.2); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .fa-bell.active { background: rgba(43,114,251,0.2); border-color: rgba(43,114,251,0.5); }
  .fa-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: #2B72FB; opacity: 0.42; border-radius: 50%; }
  .fa-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: #2B72FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .fa-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #fff; }
  .fa-progress { margin: 12px 51px 0; background: #001743; border: 1px solid #01122F; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 18px 30px 16px; }
  .fa-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 16px; color: rgba(255,255,255,0.99); }
  .fa-progress-track { width: 100%; height: 11px; background: #D9CA81; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
  .fa-progress-fill { height: 100%; background: #51A2FF; border-radius: 10px; transition: width 0.4s ease; }
  .fa-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 17px; color: rgba(255,255,255,0.99); }
  .fa-body { padding: 24px 51px 60px; }
  .fa-card { background: rgba(13,19,56,0.4); border: 0.89px solid rgba(255,255,255,0.1); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 40px; }
  .fa-section-title { font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.5; color: #fff; text-align: center; }
  .fa-section-sub { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 6px; text-align: center; }
  .fa-questions { display: flex; flex-direction: column; gap: 40px; }
  .fa-field { display: flex; flex-direction: column; gap: 14px; width: 100%; }
  .fa-label { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: rgba(255,255,255,0.7); }
  .fa-radio-group { display: flex; flex-direction: column; gap: 18px; padding-top: 8px; }
  .fa-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .fa-radio-label input[type="radio"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }
  .fa-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .fa-checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }
  .fa-textarea { width: 100%; height: 110px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: #fff; outline: none; resize: vertical; transition: border-color 0.15s; }
  .fa-textarea:focus { border-color: rgba(43,114,251,0.6); }
  .fa-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.08); }
  .fa-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .fa-btn-prev { width: 120px; height: 48px; background: #fff; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #090909; transition: opacity 0.15s; }
  .fa-btn-prev:hover { opacity: 0.85; }
  .fa-btn-save { width: 88px; height: 48px; background: transparent; border: 1.24px solid rgba(255,255,255,0.3); border-radius: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: rgba(255,255,255,0.8); transition: border-color 0.15s, color 0.15s; }
  .fa-btn-save:hover { border-color: rgba(255,255,255,0.7); color: #fff; }
  .fa-btn-submit { width: 120px; height: 48px; background: #0028FF; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #fff; transition: opacity 0.15s; }
  .fa-btn-submit:hover { opacity: 0.9; }
  .fa-error-banner { background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.4); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 13px; color: #FCA5A5; line-height: 1.5; }
  .fa-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .fa-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }
  @media (max-width: 1100px) { .fa-topbar { padding: 24px 32px 0; } .fa-title { padding: 14px 32px 0; font-size: 26px; } .fa-progress { margin: 12px 32px 0; } .fa-body { padding: 20px 32px 60px; } .fa-card { padding: 32px 32px 28px; } }
  @media (max-width: 900px) { .fa-topbar { padding: 20px 24px 0; } .fa-title { padding: 12px 24px 0; font-size: 24px; } .fa-progress { margin: 10px 24px 0; } .fa-body { padding: 18px 24px 60px; } .fa-card { padding: 28px 24px 24px; gap: 28px; } }
  @media (max-width: 767px) { .fa-content { margin-left: 0; } .fa-topbar { padding: 20px 16px 0; } .fa-badge { padding: 6px 12px; font-size: 10px; } .fa-bell { display: none; } .fa-title { padding: 12px 16px 0; font-size: 20px; } .fa-progress { margin: 10px 16px 0; padding: 14px 16px; } .fa-progress-row { font-size: 13px; } .fa-progress-label { font-size: 13px; } .fa-body { padding: 16px 16px 80px; } .fa-card { padding: 20px 16px 20px; gap: 24px; } .fa-section-title { font-size: 17px; } .fa-btn-prev { width: 100px; height: 44px; font-size: 14px; } .fa-btn-save { width: 80px; height: 44px; font-size: 14px; } .fa-btn-submit { width: 100px; height: 44px; font-size: 14px; } }
  @media (max-width: 390px) { .fa-title { font-size: 17px; } .fa-btn-prev, .fa-btn-submit { width: 90px; font-size: 13px; } .fa-btn-save { width: 70px; font-size: 13px; } }
  @media (max-height: 600px) { .fa-header { padding-bottom: 10px; } .fa-progress { padding: 10px 20px; } .fa-body { padding-top: 14px; } }
`;

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
}) => (
  <>
    <style>{STYLES}</style>
    <div className="fa-root">
      <Sidebar />
      <div className="fa-content">

        <div className="fa-header">
          <div className="fa-topbar">
            <button className="fa-back-btn" onClick={() => navigate('/survey/skills-and-competencies')}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                      return Object.entries(groupByDate(list)).map(([label, items]) => {
                        if (!items.length) return null;
                        return (
                          <div key={label}>
                            <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '10px 18px 4px' }}>{label}</p>
                            {items.map(n => (
                              <div key={n.id} onClick={() => markOneRead(n.id)}
                                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 18px', background: n.read ? 'transparent' : 'rgba(43,114,251,0.07)', cursor: 'pointer', transition: 'background 0.12s', borderLeft: n.read ? '3px solid transparent' : '3px solid #2B72FB' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(43,114,251,0.07)'}
                              >
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
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      See all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <h1 className="fa-title">Alumni Tracer Survey</h1>

          <div className="fa-progress">
            <div className="fa-progress-row">
              <span>Section {currentSection} of {totalSections}</span>
              <span style={{ color: formPct === 100 ? 'rgba(81,210,130,0.9)' : '#51A2FF', fontWeight: 700 }}>{formPct}%</span>
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
                  {getLabel('satisfaction')} <span className="fa-req">*</span>
                  {errors.has('satisfaction') && <span className="fa-field-error">Required</span>}
                </span>
                <div className="fa-radio-group">
                  {satisfactionOptions.map(opt => (
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
                  {getLabel('recommend')} <span className="fa-req">*</span>
                  {errors.has('recommend') && <span className="fa-field-error">Required</span>}
                </span>
                <div className="fa-radio-group">
                  {yesNoOptions.map(opt => (
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
                  {getLabel('suggestions')} <span className="fa-req">*</span>
                  {errors.has('suggestions') && <span className="fa-field-error">Required</span>}
                </span>
                <textarea className="fa-textarea" placeholder={getPlaceholder('suggestions') || 'Enter your answer'}
                  value={form.suggestions}
                  onChange={e => set('suggestions', e.target.value)} />
              </div>

              <div className="fa-divider" />

              <div className="fa-field">
                <span className="fa-label">
                  {getLabel('informed_about_events')} <span className="fa-req">*</span>
                  {errors.has('informed_about_events') && <span className="fa-field-error">Required</span>}
                </span>
                <div className="fa-radio-group">
                  {yesNoOptions.map(opt => (
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
                  {getLabel('participate_in')} <span className="fa-req">*</span>
                  {errors.has('participate_in') && <span className="fa-field-error">Required</span>}
                </span>
                <div className="fa-radio-group">
                  {participateOptions.map(opt => (
                    <label key={opt} className="fa-checkbox-label">
                      <input type="checkbox" value={opt}
                        checked={form.participate_in.includes(opt)}
                        onChange={() => toggleParticipate(opt)} />{opt}
                    </label>
                  ))}
                </div>
                {form.participate_in.includes('Other') && (
                  <input
                    style={{ width: '100%', height: '44px', background: 'rgba(255,255,255,0.17)', border: errors.has('other_participate') ? '1px solid #F87171' : '0.89px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 16px', fontFamily: 'Arimo, Arial, sans-serif', fontSize: '14px', color: '#fff', outline: 'none', marginTop: '8px' }}
                    placeholder={getPlaceholder('other_participate') || 'Please specify'}
                    value={form.other_participate}
                    onChange={e => set('other_participate', e.target.value)}
                  />
                )}
              </div>

            </div>

            <div className="fa-footer">
              <button className="fa-btn-prev" onClick={() => navigate('/survey/skills-and-competencies')}>Previous</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {saveToast && (
                  <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: 'rgba(81,210,130,0.9)' }}>
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

export default FeedbackAndAlumniEngagementView;