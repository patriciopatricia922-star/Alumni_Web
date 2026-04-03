import React from 'react';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pb-root {
    display: flex;
    min-height: 100vh;
    background: #002263;
    font-family: 'Arimo', Arial, sans-serif;
  }

  .pb-content {
    flex: 1;
    min-width: 0;
    margin-left: 229px;
  }

  .pb-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: #002263;
    padding-bottom: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .pb-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 51px 0;
  }

  .pb-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    flex-shrink: 0;
  }

  .pb-badge {
    background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
    border: 1.24px solid rgba(99,102,241,0.3);
    border-radius: 999px;
    padding: 7px 20px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 12px;
    letter-spacing: 0.3px;
    color: rgba(255,255,255,0.8);
    white-space: nowrap;
  }

  .pb-bell {
    width: 48px;
    height: 48px;
    background: rgba(0,62,166,0.35);
    border: 1.24px solid rgba(255,255,255,0.2);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    border-radius: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .pb-bell.active {
    background: rgba(43,114,251,0.2);
    border-color: rgba(43,114,251,0.5);
  }

  .pb-bell-dot {
    position: absolute;
    top: -4.41px; right: -4.41px;
    width: 28.81px; height: 28.81px;
    background: #2B72FB;
    opacity: 0.42;
    border-radius: 50%;
  }

  .pb-bell-count {
    position: absolute;
    top: -1px; right: -1px;
    min-width: 20px; height: 20px;
    background: #2B72FB;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 10px; color: #fff; font-weight: 400;
  }

  .pb-title {
    text-align: center;
    padding: 14px 51px 0;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 28px;
    line-height: 1.4;
    letter-spacing: -0.7px;
    color: #fff;
  }

  .pb-progress {
    margin: 12px 51px 0;
    background: #001743;
    border: 1px solid #01122F;
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 16px;
    padding: 18px 30px 16px;
  }

  .pb-progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 16px;
    color: rgba(255,255,255,0.99);
  }

  .pb-progress-track {
    width: 100%;
    height: 11px;
    background: #D9CA81;
    border-radius: 10px;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .pb-progress-fill {
    height: 100%;
    background: #51A2FF;
    border-radius: 10px;
    transition: width 0.4s ease;
  }

  .pb-progress-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 17px;
    color: rgba(255,255,255,0.99);
  }

  .pb-body {
    padding: 24px 51px 60px;
  }

  .pb-card {
    background: rgba(13, 19, 56, 0.4);
    border: 0.89px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 16px;
    padding: 32px 32px 32px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .pb-section-title {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.5;
    color: #fff;
    text-align: center;
  }

  .pb-section-sub {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: rgba(255,255,255,0.6);
    margin-top: 6px;
    text-align: center;
  }

  .pb-fields {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .pb-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .pb-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: rgba(255,255,255,0.7);
  }

  .pb-input {
    width: 100%;
    height: 47px;
    background: rgba(255,255,255,0.17);
    border: 0.89px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: #fff;
    outline: none;
    transition: border-color 0.15s;
  }
  .pb-input:focus { border-color: rgba(43,114,251,0.6); }
  .pb-input option { background: #001947; }

  .pb-input-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    cursor: pointer;
  }

  .pb-row {
    display: flex;
    flex-direction: row;
    gap: 24px;
  }

  .pb-radio-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-top: 4px;
  }

  .pb-radio-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    line-height: 1.4;
  }

  .pb-radio-label input[type="radio"] {
    width: 16px; height: 16px;
    accent-color: #51A2FF;
    cursor: pointer;
    flex-shrink: 0;
  }

  .pb-phone-row {
    display: flex;
    gap: 12px;
  }

  .pb-phone-prefix {
    width: 58px; height: 47px;
    flex-shrink: 0;
    background: rgba(255,255,255,0.17);
    border: 0.89px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.6);
  }

  .pb-phone-input { flex: 1; min-width: 0; }

  .pb-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding-top: 8px;
  }

  .pb-btn-save {
    width: 88px;
    height: 45px;
    background: transparent;
    border: 1.24px solid rgba(255,255,255,0.3);
    border-radius: 10px;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: rgba(255,255,255,0.8);
    transition: border-color 0.15s, color 0.15s;
  }
  .pb-btn-save:hover { border-color: rgba(255,255,255,0.7); color: #fff; }

  .pb-btn-next {
    width: 88px;
    height: 45px;
    background: #0028FF;
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: #fff;
    transition: background 0.15s;
  }
  .pb-btn-next:hover { background: rgba(0,40,255,0.85); }

  .pb-req { color: #F87171; font-weight: 700; margin-left: 2px; }

  .pb-field-error {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 12px;
    color: #F87171;
    margin-left: 6px;
    font-weight: 400;
  }

  @media (max-width: 1100px) {
    .pb-topbar   { padding: 24px 32px 0; }
    .pb-title    { padding: 14px 32px 0; font-size: 26px; }
    .pb-progress { margin: 12px 32px 0; }
    .pb-body     { padding: 20px 32px 60px; }
  }
  @media (max-width: 900px) {
    .pb-topbar   { padding: 20px 24px 0; }
    .pb-title    { padding: 12px 24px 0; font-size: 24px; }
    .pb-progress { margin: 10px 24px 0; }
    .pb-body     { padding: 18px 24px 60px; }
    .pb-card     { padding: 28px 24px 28px; }
  }
  @media (max-width: 767px) {
    .pb-content  { margin-left: 0; }
    .pb-topbar   { padding: 20px 16px 0; }
    .pb-badge    { padding: 6px 12px; font-size: 10px; }
    .pb-bell     { display: none; }
    .pb-title    { padding: 12px 16px 0; font-size: 20px; }
    .pb-progress { margin: 10px 16px 0; padding: 14px 16px; }
    .pb-progress-row   { font-size: 13px; }
    .pb-progress-label { font-size: 13px; }
    .pb-body     { padding: 16px 16px 80px; }
    .pb-card     { padding: 20px 16px 20px; gap: 28px; }
    .pb-section-title  { font-size: 17px; }
    .pb-row      { flex-direction: column; gap: 28px; }
  }
  @media (max-width: 390px) {
    .pb-title    { font-size: 18px; }
    .pb-input    { font-size: 13px; height: 44px; }
    .pb-btn-next { width: 80px; height: 42px; font-size: 13px; }
    .pb-btn-save { width: 80px; height: 42px; font-size: 13px; }
  }
  @media (max-height: 600px) {
    .pb-header   { padding-bottom: 10px; }
    .pb-progress { padding: 10px 20px; }
    .pb-body     { padding-top: 14px; }
  }
`;

const PersonalBackgroundView = ({
  form, set, setRadio, setCountry,
  errors, saveToast, cardRef,
  formPct, sectionPct, currentSection, totalSections,
  handleSave, handleNext,
  getLabel, getPlaceholder, questionOptions,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => (
  <>
    <style>{STYLES}</style>
    <div className="pb-root">
      <Sidebar />
      <div className="pb-content">

        {/* ── Sticky Header ─────────────────────────────────────────────────── */}
        <div className="pb-header">
          <div className="pb-topbar">
            <button className="pb-back-btn" onClick={() => navigate('/dashboard')}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <div className="pb-badge">ALUMNI STATUS</div>

            {/* ── Bell ──────────────────────────────────────────────────────── */}
            <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                className={`pb-bell${showDropdown ? ' active' : ''}`}
                onClick={() => setShowDropdown(v => !v)}
              >
                <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                  <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z" stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                  <>
                    <div className="pb-bell-dot" />
                    <div className="pb-bell-count">{unreadCount > 99 ? '99+' : unreadCount}</div>
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

          <h1 className="pb-title">Alumni Tracer Survey</h1>

          {/* ── Progress bar — driven by form fill % ──────────────────────── */}
          <div className="pb-progress">
            <div className="pb-progress-row">
              <span>Section {currentSection} of {totalSections}</span>
              <span style={{ color: '#51A2FF', fontWeight: 700 }}>{formPct}%</span>
            </div>
            <div className="pb-progress-track">
              <div className="pb-progress-fill" style={{ width: `${formPct}%` }} />
            </div>
            <span className="pb-progress-label">Personal Background</span>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="pb-body">
          <div className="pb-card" ref={cardRef}>

            <div>
              <h2 className="pb-section-title">Personal Information</h2>
              <p className="pb-section-sub">Basic information about you</p>
            </div>

            <div className="pb-fields">

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel('last_name')} <span className="pb-req">*</span>
                  {errors.has('last_name') && <span className="pb-field-error">Required</span>}
                </label>
                <input className="pb-input" placeholder={getPlaceholder('last_name')}
                  value={form.last_name} onChange={set('last_name')} />
              </div>

              <div className="pb-row">
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel('first_name')} <span className="pb-req">*</span>
                    {errors.has('first_name') && <span className="pb-field-error">Required</span>}
                  </label>
                  <input className="pb-input" placeholder={getPlaceholder('first_name')}
                    value={form.first_name} onChange={set('first_name')} />
                </div>
                <div className="pb-field">
                  <label className="pb-label">{getLabel('middle_name')}</label>
                  <input className="pb-input" placeholder={getPlaceholder('middle_name')}
                    value={form.middle_name} onChange={set('middle_name')} />
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">{getLabel('student_number')}</label>
                <input className="pb-input" placeholder={getPlaceholder('student_number')}
                  value={form.student_number} onChange={set('student_number')} />
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel('gender')} <span className="pb-req">*</span>
                  {errors.has('gender') && <span className="pb-field-error">Required</span>}
                </label>
                <div className="pb-radio-group">
                  {(questionOptions['gender'] || ['Male', 'Female', 'Prefer not to say']).map(opt => (
                    <label key={opt} className="pb-radio-label">
                      <input type="radio" name="gender" value={opt}
                        checked={form.gender === opt}
                        onChange={() => setRadio('gender')(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel('birthday')} <span className="pb-req">*</span>
                  {errors.has('birthday') && <span className="pb-field-error">Required</span>}
                </label>
                <input type="date" className="pb-input"
                  value={form.birthday} onChange={set('birthday')}
                  style={{ colorScheme: 'dark' }} />
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel('civil_status')} <span className="pb-req">*</span>
                  {errors.has('civil_status') && <span className="pb-field-error">Required</span>}
                </label>
                <div className="pb-radio-group">
                  {(questionOptions['civil_status'] || ['Single', 'Married', 'Widowed']).map(opt => (
                    <label key={opt} className="pb-radio-label">
                      <input type="radio" name="civil_status" value={opt}
                        checked={form.civil_status === opt}
                        onChange={() => setRadio('civil_status')(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel('street_address')} <span className="pb-req">*</span>
                  {errors.has('street_address') && <span className="pb-field-error">Required</span>}
                </label>
                <input className="pb-input" placeholder={getPlaceholder('street_address')}
                  value={form.street_address} onChange={set('street_address')} />
              </div>

              <div className="pb-row">
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel('city')} <span className="pb-req">*</span>
                    {errors.has('city') && <span className="pb-field-error">Required</span>}
                  </label>
                  <input className="pb-input" placeholder={getPlaceholder('city')}
                    value={form.city} onChange={set('city')} />
                </div>
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel('province')} <span className="pb-req">*</span>
                    {errors.has('province') && <span className="pb-field-error">Required</span>}
                  </label>
                  <input className="pb-input" placeholder={getPlaceholder('province')}
                    value={form.province} onChange={set('province')} />
                </div>
              </div>

              <div className="pb-row">
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel('zip_code')} <span className="pb-req">*</span>
                    {errors.has('zip_code') && <span className="pb-field-error">Required</span>}
                  </label>
                  <input className="pb-input" placeholder={getPlaceholder('zip_code')}
                    value={form.zip_code} onChange={set('zip_code')} />
                </div>
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel('country')} <span className="pb-req">*</span>
                    {errors.has('country') && <span className="pb-field-error">Required</span>}
                  </label>
                  <select className="pb-input pb-input-select"
                    value={form.country} onChange={setCountry}>
                    <option value="" disabled style={{ background: '#001947' }}>Select</option>
                    {(questionOptions['country'] || ['Philippines', 'United States', 'Other']).map(opt => (
                      <option key={opt} value={opt} style={{ background: '#001947' }}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel('contact_number')} <span className="pb-req">*</span>
                  {errors.has('contact_number') && <span className="pb-field-error">Required</span>}
                </label>
                <div className="pb-phone-row">
                  {form.country === 'Other' ? (
                    <input
                      className="pb-input"
                      style={{ width: '68px', flexShrink: 0, padding: '12px 8px', textAlign: 'center' }}
                      value={form.phone_prefix}
                      onChange={e => set('phone_prefix')(e)}
                      placeholder="+"
                      maxLength={5}
                    />
                  ) : (
                    <div className="pb-phone-prefix">{form.phone_prefix || '+63'}</div>
                  )}
                  <input type="tel" className="pb-input pb-phone-input"
                    placeholder={getPlaceholder('contact_number')}
                    value={form.contact_number} onChange={set('contact_number')} />
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel('email')} <span className="pb-req">*</span>
                  {errors.has('email') && <span className="pb-field-error">Required</span>}
                </label>
                <input type="email" className="pb-input"
                  placeholder={getPlaceholder('email')}
                  value={form.email} onChange={set('email')} />
              </div>

            </div>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="pb-footer">
              {saveToast && (
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: 'rgba(81,210,130,0.9)', marginRight: 'auto' }}>
                  Progress saved
                </span>
              )}
              
              <button className="pb-btn-save" onClick={handleSave}>Save</button>
              <button className="pb-btn-next" onClick={handleNext}>Next</button>
            </div>

          </div>
        </div>

      </div>
    </div>
  </>
);

export default PersonalBackgroundView;