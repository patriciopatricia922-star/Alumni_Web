import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .sc-root { display: flex; min-height: 100vh; background: #DAE5F1; font-family: 'Arimo', Arial, sans-serif; }
  .sc-content { flex: 1; min-width: 0; margin-left: 229px; }
  .sc-header { position: sticky; top: 0; z-index: 40; background: #DAE5F1; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .sc-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .sc-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #002263; flex-shrink: 0; }
  .sc-badge { background: #003EA6; border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .sc-bell { width: 48px; height: 48px; background: #003EA6; border: 1.24px solid rgba(255,255,255,0.2); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .sc-bell.active { background: #002263; border-color: rgba(0,34,99,0.5); }
  .sc-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: rgba(255,0,0,0.7); opacity: 0.42; border-radius: 50%; }
  .sc-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: rgba(255,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .sc-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #2D467C; }
  .sc-subtitle { text-align: center; padding: 4px 51px 0; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 20px; color: #4A5565; }
  .sc-progress { margin: 12px 51px 0; background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 16px; padding: 18px 30px 16px; }
  .sc-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1E3A5F; }
  .sc-progress-track { width: 100%; height: 12px; background: #E5E7EB; border-radius: 9999px; margin-bottom: 10px; overflow: hidden; }
  .sc-progress-fill { height: 100%; background: #EFC600; border-radius: 9999px; transition: width 0.4s ease; }
  .sc-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #4A5565; }
  .sc-body { padding: 24px 51px 60px; }
  .sc-card { background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 36px; }
  .sc-section-title { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 24px; line-height: 30px; color: #003EA6; text-align: center; }
  .sc-section-sub { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 20px; color: #003EA6; margin-top: 6px; text-align: center; }
  .sc-questions { display: flex; flex-direction: column; gap: 36px; }
  .sc-field { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .sc-label { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #003EA6; }
  .sc-skill-label { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #003EA6; }
  .sc-radio-group { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
  .sc-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: #4A5565; line-height: 1.4; padding: 2px 0; }
  .sc-checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #003EA6; cursor: pointer; flex-shrink: 0; }
  .sc-stars { display: flex; flex-direction: row; align-items: center; gap: 20px; padding: 4px 0; }
  .sc-star { width: 35px; height: 35px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .sc-skill-ratings { display: flex; flex-direction: column; gap: 32px; }
  .sc-skill-row { display: flex; flex-direction: column; gap: 10px; }
  .sc-textarea { width: 100%; height: 110px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 12px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; resize: vertical; transition: border-color 0.15s; }
  .sc-textarea::placeholder { color: rgba(10,10,10,0.3); }
  .sc-textarea:focus { border-color: #003EA6; }
  .sc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .sc-btn-prev { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .sc-btn-prev:hover { background: #002a80; }
  .sc-btn-save { width: 100px; height: 48px; background: #FFFFFF; border: 0.8px solid rgba(0,34,99,0.6); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 8px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #002263; transition: background 0.15s, border-color 0.15s; }
  .sc-btn-save:hover { background: #f0f4fb; border-color: #002263; }
  .sc-btn-next { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .sc-btn-next:hover { background: #002a80; }
  .sc-error-banner { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.3); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 13px; color: #DC2626; line-height: 1.5; }
  .sc-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .sc-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }
  @media (max-width: 1100px) { .sc-topbar { padding: 24px 32px 0; } .sc-title { padding: 14px 32px 0; font-size: 26px; } .sc-subtitle { padding: 4px 32px 0; } .sc-progress { margin: 12px 32px 0; } .sc-body { padding: 20px 32px 60px; } .sc-card { padding: 32px 32px 28px; } }
  @media (max-width: 900px) { .sc-topbar { padding: 20px 24px 0; } .sc-title { padding: 12px 24px 0; font-size: 24px; } .sc-subtitle { padding: 4px 24px 0; } .sc-progress { margin: 10px 24px 0; } .sc-body { padding: 18px 24px 60px; } .sc-card { padding: 28px 24px 24px; gap: 28px; } .sc-questions { gap: 28px; } }
  @media (max-width: 767px) { .sc-content { margin-left: 0; } .sc-topbar { padding: 20px 16px 0; } .sc-badge { padding: 6px 12px; font-size: 10px; } .sc-bell { display: none; } .sc-title { padding: 12px 16px 0; font-size: 20px; } .sc-subtitle { padding: 4px 16px 0; font-size: 14px; } .sc-progress { margin: 10px 16px 0; padding: 14px 16px; } .sc-progress-row { font-size: 13px; } .sc-progress-label { font-size: 13px; } .sc-body { padding: 16px 16px 80px; } .sc-card { padding: 20px 16px 20px; gap: 24px; } .sc-questions { gap: 24px; } .sc-section-title { font-size: 17px; } .sc-stars { gap: 12px; } .sc-star { width: 28px; height: 28px; } .sc-btn-prev { width: 100px; height: 44px; font-size: 14px; } .sc-btn-save { width: 80px; height: 44px; font-size: 14px; } .sc-btn-next { width: 100px; height: 44px; font-size: 14px; } }
  @media (max-width: 390px) { .sc-title { font-size: 17px; } .sc-textarea { font-size: 13px; } .sc-btn-prev, .sc-btn-next { width: 90px; font-size: 13px; } .sc-btn-save { width: 70px; font-size: 13px; } }
  @media (max-height: 600px) { .sc-header { padding-bottom: 10px; } .sc-progress { padding: 10px 20px; } .sc-body { padding-top: 14px; } }
`;

// Star Rating Component
const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="sc-stars">
      {[1, 2, 3, 4, 5].map(star => (
        <div key={star} className="sc-star"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= (hovered || value) ? '#EFC600' : '#E5E7EB'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      ))}
    </div>
  );
};

const SkillsAndCompetenciesView = ({
  form, toggleCompetency, setSkillRating, setSkillsToDevelop,
  errors, saveToast, cardRef,
  formPct, currentSection, totalSections,
  competenciesOptions, skillRatingsKeys,
  getLabel, getPlaceholder,
  handleSave, handleNext,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => (
  <>
    <style>{STYLES}</style>
    <div className="sc-root">
      <Sidebar />
      <div className="sc-content">

        <div className="sc-header">
          <div className="sc-topbar">
            <button className="sc-back-btn" onClick={() => navigate('/survey/job-experience')}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            <div className="sc-badge">ALUMNI STATUS</div>

            <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                className={`sc-bell${showDropdown ? ' active' : ''}`}
                onClick={() => setShowDropdown(v => !v)}
              >
                <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                  <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z" stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                  <>
                    <div className="sc-bell-dot" />
                    <div className="sc-bell-count">{unreadCount > 99 ? '99+' : unreadCount}</div>
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

          <h1 className="sc-title">Alumni Tracer Survey</h1>
          <p className="sc-subtitle">Please complete all sections to update your alumni status.</p>

          <div className="sc-progress">
            <div className="sc-progress-row">
              <span>Section {currentSection} of {totalSections}</span>
              <span style={{ color: '#003EA6', fontWeight: 700 }}>{formPct}% Complete</span>
            </div>
            <div className="sc-progress-track">
              <div className="sc-progress-fill" style={{ width: `${formPct}%` }} />
            </div>
            <span className="sc-progress-label">Skills and competencies</span>
          </div>
        </div>

        <div className="sc-body">
          <div className="sc-card" ref={cardRef}>
            {errors.size > 0 && (
              <div className="sc-error-banner">
                <strong>Please answer all required questions before proceeding.</strong>
              </div>
            )}
            <div>
              <h2 className="sc-section-title">Skills and competencies</h2>
              <p className="sc-section-sub">Your workplace skills</p>
            </div>

            <div className="sc-questions">
              <div className="sc-field">
                <span className="sc-label">
                  {getLabel('useful_competencies')} <span className="sc-req">*</span>
                  {errors.has('useful_competencies') && <span className="sc-field-error">Required</span>}
                </span>
                <div className="sc-radio-group">
                  {competenciesOptions.map(opt => (
                    <label key={opt} className="sc-checkbox-label">
                      <input type="checkbox" value={opt}
                        checked={form.useful_competencies.includes(opt)}
                        onChange={() => toggleCompetency(opt)} />{opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="sc-skill-ratings">
                {skillRatingsKeys.map(skill => (
                  <div key={skill} className="sc-skill-row">
                    <span className="sc-skill-label">
                      {skill} <span className="sc-req">*</span>
                      {errors.has('rating_' + skill) && <span className="sc-field-error">Required</span>}
                    </span>
                    <StarRating
                      value={form.skill_ratings[skill] || 0}
                      onChange={r => setSkillRating(skill, r)}
                    />
                  </div>
                ))}
              </div>

              <div className="sc-field">
                <span className="sc-label">
                  {getLabel('skills_to_develop')} <span className="sc-req">*</span>
                  {errors.has('skills_to_develop') && <span className="sc-field-error">Required</span>}
                </span>
                <textarea className="sc-textarea" placeholder={getPlaceholder('skills_to_develop') || 'Enter your answer'}
                  value={form.skills_to_develop}
                  onChange={e => setSkillsToDevelop(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#003EA6'}
                  onBlur={e => e.target.style.borderColor = '#D1D5DC'} />
              </div>
            </div>

            <div className="sc-footer">
              <button className="sc-btn-prev" onClick={() => navigate('/survey/job-experience')}>Previous</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {saveToast && (
                  <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#15803d' }}>
                    Progress saved
                  </span>
                )}
                <button className="sc-btn-save" onClick={handleSave}>Save</button>
                <button className="sc-btn-next" onClick={handleNext}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default SkillsAndCompetenciesView;