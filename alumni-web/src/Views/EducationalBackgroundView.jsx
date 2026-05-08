import React from 'react';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .eb-root { display: flex; min-height: 100vh; background: #DAE5F1; font-family: 'Arimo', Arial, sans-serif; }
  .eb-content { flex: 1; min-width: 0; margin-left: 229px; }
  .eb-header { position: sticky; top: 0; z-index: 40; background: #DAE5F1; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .eb-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .eb-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #002263; flex-shrink: 0; }
  .eb-badge { background: #003EA6; border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .eb-bell { width: 48px; height: 48px; background: #003EA6; border: 1.24px solid rgba(255,255,255,0.2); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .eb-bell.active { background: #002263; border-color: rgba(0,34,99,0.5); }
  .eb-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: rgba(255,0,0,0.7); opacity: 0.42; border-radius: 50%; }
  .eb-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: rgba(255,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .eb-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #2D467C; }
  .eb-subtitle { text-align: center; padding: 4px 51px 0; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 20px; color: #4A5565; }
  .eb-progress { margin: 12px 51px 0; background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 16px; padding: 18px 30px 16px; }
  .eb-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1E3A5F; }
  .eb-progress-track { width: 100%; height: 12px; background: #E5E7EB; border-radius: 9999px; margin-bottom: 10px; overflow: hidden; }
  .eb-progress-fill { height: 100%; background: #EFC600; border-radius: 9999px; transition: width 0.4s ease; }
  .eb-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #4A5565; }
  .eb-body { padding: 24px 51px 60px; }
  .eb-card { background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 36px; }
  .eb-section-title { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 24px; line-height: 30px; color: #003EA6; text-align: center; }
  .eb-section-sub { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 20px; color: #003EA6; margin-top: 6px; text-align: center; }
  .eb-fields { display: flex; flex-direction: column; gap: 36px; }
  .eb-field { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .eb-label { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #003EA6; }
  .eb-label-sub { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 18px; letter-spacing: 0.3px; color: #003EA6; }
  .eb-input { width: 100%; height: 47px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 12px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; transition: border-color 0.15s; }
  .eb-input::placeholder { color: rgba(10,10,10,0.3); }
  .eb-input:focus { border-color: #003EA6; }
  .eb-input option { background: #F9FAFB; color: #0A0A0A; }
  .eb-textarea { width: 100%; height: 100px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 12px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; resize: none; transition: border-color 0.15s; }
  .eb-textarea::placeholder { color: rgba(10,10,10,0.3); }
  .eb-textarea:focus { border-color: #003EA6; }
  .eb-select-wrap { position: relative; width: 100%; }
  .eb-select { appearance: none; -webkit-appearance: none; cursor: pointer; }
  .eb-select-arrow { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); pointer-events: none; }
  .eb-radio-group { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
  .eb-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: #4A5565; line-height: 1.4; padding: 2px 0; }
  .eb-radio-label input[type="radio"] { width: 18px; height: 18px; accent-color: #003EA6; cursor: pointer; flex-shrink: 0; }
  .eb-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; }
  .eb-btn-prev { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .eb-btn-prev:hover { background: #002a80; }
  .eb-btn-save { width: 100px; height: 48px; background: #FFFFFF; border: 0.8px solid rgba(0,34,99,0.6); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 8px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #002263; transition: background 0.15s, border-color 0.15s; }
  .eb-btn-save:hover { background: #f0f4fb; border-color: #002263; }
  .eb-btn-next { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .eb-btn-next:hover { background: #002a80; }
  .eb-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .eb-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }

  /* ── Locked field styles ─────────────────────────────────────────────────── */
  /*
   * We do NOT use HTML disabled on the <select> because browsers apply an
   * OS-level colour tint that makes the text hard to read and cannot be
   * reliably overridden across all browsers + OS combinations.
   *
   * Instead we use a visually-styled read-only element plus pointer-events:none
   * and tabIndex=-1 to achieve the same effect without the browser quirks.
   */
  .eb-locked-display {
    width: 100%;
    height: 47px;
    background: #F0F4FB;
    border: 0.8px solid #B8C8E8;
    border-radius: 10px;
    padding: 0 40px 0 16px;       /* right padding leaves room for lock icon */
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: #2D467C;
    display: flex;
    align-items: center;
    user-select: none;
    -webkit-user-select: none;
    cursor: not-allowed;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .eb-lock-hint {
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 11.5px;
    color: #6B7E9F;
    margin-top: -4px;
  }

  @media (max-width: 1100px) { .eb-topbar { padding: 24px 32px 0; } .eb-title { padding: 14px 32px 0; font-size: 26px; } .eb-subtitle { padding: 4px 32px 0; } .eb-progress { margin: 12px 32px 0; } .eb-body { padding: 20px 32px 60px; } .eb-card { padding: 32px 32px 28px; } }
  @media (max-width: 900px) { .eb-topbar { padding: 20px 24px 0; } .eb-title { padding: 12px 24px 0; font-size: 24px; } .eb-subtitle { padding: 4px 24px 0; } .eb-progress { margin: 10px 24px 0; } .eb-body { padding: 18px 24px 60px; } .eb-card { padding: 28px 24px 24px; gap: 28px; } .eb-fields { gap: 28px; } }
  @media (max-width: 767px) { .eb-content { margin-left: 0; } .eb-topbar { padding: 20px 16px 0; } .eb-badge { padding: 6px 12px; font-size: 10px; } .eb-bell { display: none; } .eb-title { padding: 12px 16px 0; font-size: 20px; } .eb-subtitle { padding: 4px 16px 0; font-size: 14px; } .eb-progress { margin: 10px 16px 0; padding: 14px 16px; } .eb-progress-row { font-size: 13px; } .eb-progress-label { font-size: 13px; } .eb-body { padding: 16px 16px 80px; } .eb-card { padding: 20px 16px 20px; gap: 24px; } .eb-fields { gap: 24px; } .eb-section-title { font-size: 17px; } .eb-btn-prev { width: 100px; height: 44px; font-size: 14px; } .eb-btn-save { width: 80px; height: 44px; font-size: 14px; } .eb-btn-next { width: 100px; height: 44px; font-size: 14px; } }
  @media (max-width: 390px) { .eb-title { font-size: 17px; } .eb-input, .eb-textarea { font-size: 13px; } .eb-btn-prev, .eb-btn-next { width: 90px; font-size: 13px; } .eb-btn-save { width: 70px; font-size: 13px; } }
  @media (max-height: 600px) { .eb-header { padding-bottom: 10px; } .eb-progress { padding: 10px 20px; } .eb-body { padding-top: 14px; } }
`;

const onFocus = e => { if (!e.target.readOnly && !e.target.disabled) e.target.style.borderColor = '#003EA6'; };
const onBlur  = e => { if (!e.target.readOnly && !e.target.disabled) e.target.style.borderColor = '#D1D5DC'; };

// ── Lock icon ─────────────────────────────────────────────────────────────────
const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 14" fill="none" aria-hidden="true">
    <rect x="1" y="6" width="10" height="7" rx="1.5" stroke="#6B7E9F" strokeWidth="1.2"/>
    <path d="M4 6V4a2 2 0 114 0v2" stroke="#6B7E9F" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ── Hint shown beneath a locked field ─────────────────────────────────────────
const LockedHint = () => (
  <span className="eb-lock-hint" role="note">
    <LockIcon />
    Pre-filled from your Alumni ID — cannot be edited
  </span>
);

// ── Locked field display ───────────────────────────────────────────────────────
// Replaces the <select> entirely with a styled <div> so there is zero chance
// of any browser interaction (no click, no keyboard, no focus).
const LockedField = ({ value }) => (
  <div className="eb-select-wrap">
    <div
      className="eb-locked-display"
      aria-readonly="true"
      role="textbox"
      tabIndex={-1}
    >
      {value || '—'}
    </div>
    {/* Lock icon in place of the chevron arrow */}
    <span style={{
      position: 'absolute', right: 14, top: '50%',
      transform: 'translateY(-50%)', pointerEvents: 'none',
    }}>
      <LockIcon />
    </span>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// View
// ═════════════════════════════════════════════════════════════════════════════
const EducationalBackgroundView = ({
  form, set, setLicensureReviewing, setLicensurePlans, setLicensureNoPlans,
  errors, saveToast, cardRef,
  formPct, currentSection, totalSections,
  degreeOptions, yearOptions, distinctionOptions,
  licensureOptions, licensurePlansOptions, boardResultOptions,
  getLabel, getPlaceholder,
  handleSave, handleNext,
  lockedFields = {},
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  const showPostGradCourse    = form.post_grad_plans === 'Yes';
  const showLicensureBranch   = form.licensure_reviewing === 'Yes';
  // ── NEW: show the "No" branch when the user selects "No" ─────────────────
  const showLicensureNoBranch = form.licensure_reviewing === 'No';
  const showBoardExam         = showLicensureBranch &&
    (form.licensure_plans === 'Yes' || form.licensure_plans === 'Already taken');

  const isLocked = (field) => !!lockedFields[field];

  return (
    <>
      <style>{STYLES}</style>
      <div className="eb-root">
        <Sidebar />
        <div className="eb-content">

          {/* ── Header ── */}
          <div className="eb-header">
            <div className="eb-topbar">
              <button className="eb-back-btn" onClick={() => navigate('/survey/personal-background')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <div className="eb-badge">ALUMNI STATUS</div>
              <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  className={`eb-bell${showDropdown ? ' active' : ''}`}
                  onClick={() => setShowDropdown(v => !v)}
                  aria-label="Notifications"
                >
                  <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                    <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z" stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {unreadCount > 0 && (
                    <>
                      <div className="eb-bell-dot" />
                      <div className="eb-bell-count">{unreadCount > 99 ? '99+' : unreadCount}</div>
                    </>
                  )}
                </button>

                {/* ── Notification dropdown ── */}
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
                        const list = notifs;
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

            <h1 className="eb-title">Alumni Tracer Survey</h1>
            <p className="eb-subtitle">Please complete all sections to update your alumni status.</p>

            <div className="eb-progress">
              <div className="eb-progress-row">
                <span>Section {currentSection} of {totalSections}</span>
                <span style={{ color: '#003EA6', fontWeight: 700 }}>{formPct}% Complete</span>
              </div>
              <div className="eb-progress-track">
                <div className="eb-progress-fill" style={{ width: `${formPct}%` }} />
              </div>
              <span className="eb-progress-label">Educational Background</span>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="eb-body">
            <div className="eb-card" ref={cardRef}>
              <div>
                <h2 className="eb-section-title">Educational Background</h2>
                <p className="eb-section-sub">Your academic background</p>
              </div>

              <div className="eb-fields">

                {/* ── Degree Program ─────────────────────────────────────── */}
                <div className="eb-field">
                  <label className="eb-label">
                    {getLabel('degree_program')}
                    {/* No asterisk for locked fields — they are always valid */}
                    {!isLocked('degree_program') && <span className="eb-req">*</span>}
                    {errors.has('degree_program') && <span className="eb-field-error">Required</span>}
                  </label>

                  {isLocked('degree_program') ? (
                    <>
                      <LockedField value={form.degree_program} />
                      <LockedHint />
                    </>
                  ) : (
                    <div className="eb-select-wrap">
                      <select
                        className="eb-input eb-select"
                        value={form.degree_program}
                        onChange={e => set('degree_program', e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      >
                        <option value="" disabled style={{ color: 'rgba(10,10,10,0.3)' }}>Select</option>
                        {degreeOptions.map(o => (
                          <option key={o} value={o} style={{ background: '#F9FAFB', color: '#0A0A0A' }}>{o}</option>
                        ))}
                      </select>
                      <svg className="eb-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1L6 7L11 1" stroke="#00226D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* ── Other Degree (conditional) ─────────────────────────── */}
                {form.degree_program === 'Other' && (
                  <div className="eb-field">
                    <label className="eb-label">
                      {getLabel('other_degree')} <span className="eb-req">*</span>
                      {errors.has('other_degree') && <span className="eb-field-error">Required</span>}
                    </label>
                    <input
                      className="eb-input"
                      placeholder={getPlaceholder('other_degree')}
                      value={form.other_degree}
                      onChange={e => set('other_degree', e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                )}

                {/* ── Reason for course ──────────────────────────────────── */}
                <div className="eb-field">
                  <label className="eb-label">
                    {getLabel('reason_for_course')} <span className="eb-req">*</span>
                    {errors.has('reason_for_course') && <span className="eb-field-error">Required</span>}
                  </label>
                  <textarea
                    className="eb-textarea"
                    placeholder={getPlaceholder('reason_for_course')}
                    value={form.reason_for_course}
                    onChange={e => set('reason_for_course', e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>

                {/* ── Year Graduated ─────────────────────────────────────── */}
                <div className="eb-field">
                  <label className="eb-label">
                    {getLabel('year_graduated')}
                    {!isLocked('year_graduated') && <span className="eb-req">*</span>}
                    {errors.has('year_graduated') && <span className="eb-field-error">Required</span>}
                  </label>

                  {isLocked('year_graduated') ? (
                    <>
                      <LockedField value={form.year_graduated} />
                      <LockedHint />
                    </>
                  ) : (
                    <div className="eb-select-wrap">
                      <select
                        className="eb-input eb-select"
                        value={form.year_graduated}
                        onChange={e => set('year_graduated', e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      >
                        <option value="" disabled style={{ color: 'rgba(10,10,10,0.3)' }}>Select</option>
                        {yearOptions.map(y => (
                          <option key={y} value={y} style={{ background: '#F9FAFB', color: '#0A0A0A' }}>{y}</option>
                        ))}
                      </select>
                      <svg className="eb-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                        <path d="M1 1L6 7L11 1" stroke="#00226D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* ── Distinction ────────────────────────────────────────── */}
                <div className="eb-field">
                  <label className="eb-label">
                    {getLabel('distinction')} <span className="eb-req">*</span>
                    {errors.has('distinction') && <span className="eb-field-error">Required</span>}
                  </label>
                  <div className="eb-select-wrap">
                    <select
                      className="eb-input eb-select"
                      value={form.distinction}
                      onChange={e => set('distinction', e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      <option value="" disabled style={{ color: 'rgba(10,10,10,0.3)' }}>Select</option>
                      {distinctionOptions.map(o => (
                        <option key={o} value={o} style={{ background: '#F9FAFB', color: '#0A0A0A' }}>{o}</option>
                      ))}
                    </select>
                    <svg className="eb-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1L6 7L11 1" stroke="#00226D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* ── Post-grad plans ────────────────────────────────────── */}
                <div className="eb-field">
                  <label className="eb-label">
                    {getLabel('post_grad_plans')} <span className="eb-req">*</span>
                    {errors.has('post_grad_plans') && <span className="eb-field-error">Required</span>}
                  </label>
                  <div className="eb-radio-group">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="eb-radio-label">
                        <input
                          type="radio"
                          name="post_grad_plans"
                          value={opt}
                          checked={form.post_grad_plans === opt}
                          onChange={() => set('post_grad_plans', opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {showPostGradCourse && (
                  <div className="eb-field">
                    <label className="eb-label-sub">
                      {getLabel('post_grad_course')} <span className="eb-req">*</span>
                      {errors.has('post_grad_course') && <span className="eb-field-error">Required</span>}
                    </label>
                    <textarea
                      className="eb-textarea"
                      placeholder={getPlaceholder('post_grad_course')}
                      value={form.post_grad_course}
                      onChange={e => set('post_grad_course', e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                )}

                {/* ── Licensure reviewing ────────────────────────────────── */}
                <div className="eb-field">
                  <label className="eb-label">
                    {getLabel('licensure_reviewing')} <span className="eb-req">*</span>
                    {errors.has('licensure_reviewing') && <span className="eb-field-error">Required</span>}
                  </label>
                  <div className="eb-radio-group">
                    {licensureOptions.map(opt => (
                      <label key={opt} className="eb-radio-label">
                        <input
                          type="radio"
                          name="licensure_reviewing"
                          value={opt}
                          checked={form.licensure_reviewing === opt}
                          onChange={() => setLicensureReviewing(opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* ── "Yes" branch ───────────────────────────────────────── */}
                {showLicensureBranch && (
                  <>
                    <div className="eb-field">
                      <label className="eb-label-sub">
                        {getLabel('licensure_plans')} <span className="eb-req">*</span>
                        {errors.has('licensure_plans') && <span className="eb-field-error">Required</span>}
                      </label>
                      <div className="eb-radio-group">
                        {licensurePlansOptions.map(opt => (
                          <label key={opt} className="eb-radio-label">
                            <input
                              type="radio"
                              name="licensure_plans"
                              value={opt}
                              checked={form.licensure_plans === opt}
                              onChange={() => setLicensurePlans(opt)}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="eb-field">
                      <label className="eb-label-sub">
                        {getLabel('licensure_reason')} <span className="eb-req">*</span>
                        {errors.has('licensure_reason') && <span className="eb-field-error">Required</span>}
                      </label>
                      <textarea
                        className="eb-textarea"
                        placeholder={getPlaceholder('licensure_reason')}
                        value={form.licensure_reason}
                        onChange={e => set('licensure_reason', e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>
                  </>
                )}

                {/* ── Board exam fields (nested inside "Yes" branch) ─────── */}
                {showBoardExam && (
                  <>
                    <div className="eb-field">
                      <label className="eb-label-sub">
                        {getLabel('board_exam_name')} <span className="eb-req">*</span>
                        {errors.has('board_exam_name') && <span className="eb-field-error">Required</span>}
                      </label>
                      <input
                        className="eb-input"
                        placeholder={getPlaceholder('board_exam_name')}
                        value={form.board_exam_name}
                        onChange={e => set('board_exam_name', e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>

                    <div className="eb-field">
                      <label className="eb-label-sub">
                        {getLabel('board_exam_date')} <span className="eb-req">*</span>
                        {errors.has('board_exam_date') && <span className="eb-field-error">Required</span>}
                      </label>
                      <input
                        type="date"
                        className="eb-input"
                        value={form.board_exam_date}
                        onChange={e => set('board_exam_date', e.target.value)}
                        style={{ colorScheme: 'light' }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>

                    <div className="eb-field">
                      <label className="eb-label-sub">
                        {getLabel('board_exam_result')} <span className="eb-req">*</span>
                        {errors.has('board_exam_result') && <span className="eb-field-error">Required</span>}
                      </label>
                      <div className="eb-radio-group">
                        {boardResultOptions.map(opt => (
                          <label key={opt} className="eb-radio-label">
                            <input
                              type="radio"
                              name="board_exam_result"
                              value={opt}
                              checked={form.board_exam_result === opt}
                              onChange={() => set('board_exam_result', opt)}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── "No" branch ────────────────────────────────────────── */}
                {showLicensureNoBranch && (
                  <>
                    {/* Field 1 — future plans radio */}
                    <div className="eb-field">
                      <label className="eb-label-sub">
                        Do you have any plans on taking the Licensure Examination?
                        <span className="eb-req">*</span>
                        {errors.has('licensure_no_plans') && (
                          <span className="eb-field-error">Required</span>
                        )}
                      </label>
                      <div className="eb-radio-group">
                        {['Yes', 'No', 'Maybe', 'Not at all'].map(opt => (
                          <label key={opt} className="eb-radio-label">
                            <input
                              type="radio"
                              name="licensure_no_plans"
                              value={opt}
                              checked={form.licensure_no_plans === opt}
                              onChange={() => setLicensureNoPlans(opt)}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Field 2 — reason textarea */}
                    <div className="eb-field">
                      <label className="eb-label-sub">
                        {getLabel('licensure_reason')}
                        <span className="eb-req">*</span>
                        {errors.has('licensure_no_reason') && (
                          <span className="eb-field-error">Required</span>
                        )}
                      </label>
                      <textarea
                        className="eb-textarea"
                        placeholder={getPlaceholder('licensure_reason')}
                        value={form.licensure_no_reason}
                        onChange={e => set('licensure_no_reason', e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                    </div>
                  </>
                )}

              </div>{/* /eb-fields */}

              <div className="eb-footer">
                <button className="eb-btn-prev" onClick={() => navigate('/survey/personal-background')}>
                  Previous
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {saveToast && (
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#15803d' }}>
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

export default EducationalBackgroundView;