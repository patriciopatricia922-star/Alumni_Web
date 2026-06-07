/**
 * JobExperienceViewSHS.jsx — View / Presentational Layer
 * Location: src/surveyshs/views/JobExperienceViewSHS.jsx
 *
 * Pure render component — zero state, all data via props.
 * Imports its own scoped CSS (JobExperienceSHS.css).
 *
 * Renders three questions under the "Work Experience" sub-section:
 *
 *   Q17 — time_to_find_job       radio  (no sub-field)
 *   Q18 — how_found_job          radio  + other_how_found_job text when 'Other'
 *   Q19 — factors_first_job      checkboxes + other_factors text when 'Other'
 *
 * Footer: Previous | [toast] Save | Next
 */

import React from 'react';
import Sidebar from '../../components/Sidebar';
import '../styles/JobExperienceSHS.css';

// ─────────────────────────────────────────────────────────────────────────────
// Notification dropdown — self-contained, stateless
// ─────────────────────────────────────────────────────────────────────────────
const NotifDropdown = ({
  notifs, unreadCount, notifTab, setNotifTab,
  markAllRead, markOneRead, groupByDate, formatTime,
  navigate, setShowDropdown,
}) => {
  const list    = notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const grouped = groupByDate(list);

  return (
    <div className="je-shs-notif-dropdown">
      <div className="je-shs-notif-header">
        <span className="je-shs-notif-title">Notifications</span>
        {unreadCount > 0 && (
          <button className="je-shs-notif-mark-all" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="je-shs-notif-tabs">
        {['all', 'unread'].map((t) => (
          <button
            key={t}
            className={`je-shs-notif-tab ${notifTab === t ? 'active' : 'inactive'}`}
            onClick={() => setNotifTab(t)}
          >
            {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      <div className="je-shs-notif-list">
        {!list.length ? (
          <div className="je-shs-notif-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>
            <p className="je-shs-notif-empty-text">
              {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => {
            if (!items.length) return null;
            return (
              <div key={label}>
                <p className="je-shs-notif-group-label">{label}</p>
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`je-shs-notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markOneRead(n.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                    onMouseLeave={(e) => (
                      e.currentTarget.style.background = n.read
                        ? 'transparent'
                        : 'rgba(0,62,166,0.05)'
                    )}
                  >
                    <div className="je-shs-notif-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="je-shs-notif-body">
                      <p className={`je-shs-notif-item-title ${n.read ? 'read' : 'unread'}`}>
                        {n.title}
                      </p>
                      <p className="je-shs-notif-item-body">{n.body}</p>
                      <span className="je-shs-notif-time">{formatTime(n.time)}</span>
                    </div>
                    {!n.read && <div className="je-shs-notif-dot" />}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <div className="je-shs-notif-footer">
        <button
          className="je-shs-notif-see-all"
          onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
        >
          See all notifications
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────────
const JobExperienceViewSHS = ({
  // form
  form,
  set,
  setHowFoundJob,
  toggleFactors,
  errors,
  saveToast,
  cardRef,
  // static options
  timeToFindJobOptions,
  howFoundJobOptions,
  factorsFirstJobOptions,
  // progress
  formPct,
  currentSection,
  totalSections,
  // actions
  handleSave,
  handleNext,
  // notifications
  bellRef,
  notifs,
  unreadCount,
  showDropdown,
  setShowDropdown,
  notifTab,
  setNotifTab,
  markAllRead,
  markOneRead,
  groupByDate,
  formatTime,
  // routing
  navigate,
  prevRoute,
}) => (
  <div className="je-shs-root">
    <Sidebar />

    <div className="je-shs-content">

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <div className="je-shs-header">
        <div className="je-shs-topbar">

          {/* Back button */}
          <button className="je-shs-back-btn" onClick={() => navigate(prevRoute)}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
                stroke="#002263" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            Back
          </button>

          {/* Badge */}
          <div className="je-shs-badge">ALUMNI STATUS</div>

          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              className={`je-shs-bell${showDropdown ? ' active' : ''}`}
              onClick={() => setShowDropdown((v) => !v)}
              aria-label="Notifications"
            >
              <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                <path
                  d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z"
                  stroke="#FFFFFF" strokeWidth="1.67"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              {unreadCount > 0 && (
                <>
                  <div className="je-shs-bell-dot" />
                  <div className="je-shs-bell-count">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                </>
              )}
            </button>

            {showDropdown && (
              <NotifDropdown
                notifs={notifs}
                unreadCount={unreadCount}
                notifTab={notifTab}
                setNotifTab={setNotifTab}
                markAllRead={markAllRead}
                markOneRead={markOneRead}
                groupByDate={groupByDate}
                formatTime={formatTime}
                navigate={navigate}
                setShowDropdown={setShowDropdown}
              />
            )}
          </div>
        </div>

        {/* Page title */}
        <h1 className="je-shs-title">Alumni Tracer Survey</h1>
        <p className="je-shs-subtitle">
          Please complete all sections to update your alumni status.
        </p>

        {/* Progress */}
        <div className="je-shs-progress">
          <div className="je-shs-progress-row">
            <span>Section {currentSection} of {totalSections}</span>
            <span className="je-shs-progress-pct">{formPct}% Complete</span>
          </div>
          <div className="je-shs-progress-track">
            <div className="je-shs-progress-fill" style={{ width: `${formPct}%` }} />
          </div>
          <span className="je-shs-progress-label">Job Experience</span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="je-shs-body">
        <div className="je-shs-card" ref={cardRef}>

          {/* Card heading */}
          <div>
            <h2 className="je-shs-section-title">Job Experience</h2>
            <p className="je-shs-section-sub">
              Information related to your first job after graduation
            </p>
          </div>

          <div className="je-shs-questions">

            {/* Sub-section label */}
            <p className="je-shs-group-label">Work Experience</p>

            {/* ── Q17 — Time to find first job ─────────────────────────── */}
            <div className="je-shs-field">
              <span className="je-shs-label">
                17. How long did it take you to find your first job after graduation?
                <span className="je-shs-req">*</span>
                {errors.has('time_to_find_job') && (
                  <span className="je-shs-field-error">This field is required</span>
                )}
              </span>
              <div className="je-shs-radio-group">
                {timeToFindJobOptions.map((opt) => (
                  <label key={opt} className="je-shs-radio-label">
                    <input
                      type="radio"
                      name="time_to_find_job"
                      value={opt}
                      checked={form.time_to_find_job === opt}
                      onChange={() => set('time_to_find_job', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* ── Q18 — How found first job ────────────────────────────── */}
            <div className="je-shs-field">
              <span className="je-shs-label">
                18. How did you find your first job?
                <span className="je-shs-req">*</span>
                {errors.has('how_found_job') && (
                  <span className="je-shs-field-error">This field is required</span>
                )}
              </span>
              <div className="je-shs-radio-group">
                {howFoundJobOptions.map((opt) => (
                  <label key={opt} className="je-shs-radio-label">
                    <input
                      type="radio"
                      name="how_found_job"
                      value={opt}
                      checked={form.how_found_job === opt}
                      onChange={() => setHowFoundJob(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {/* "Other" sub-field — appears when Other is selected */}
              {form.how_found_job === 'Other' && (
                <input
                  className={`je-shs-other-input${errors.has('other_how_found_job') ? ' error' : ''}`}
                  type="text"
                  placeholder="Please specify how you found your first job"
                  value={form.other_how_found_job}
                  onChange={(e) => set('other_how_found_job', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#003EA6')}
                  onBlur={(e) => (
                    e.target.style.borderColor = errors.has('other_how_found_job')
                      ? '#F87171'
                      : '#D1D5DC'
                  )}
                />
              )}
            </div>

            {/* ── Q19 — Factors that helped get first job ───────────────── */}
            <div className="je-shs-field">
              <span className="je-shs-label">
                19. What factors helped you most in getting your first job?
                <span className="je-shs-req">*</span>
                {errors.has('factors_first_job') && (
                  <span className="je-shs-field-error">Select at least one option</span>
                )}
              </span>
              <div className="je-shs-checkbox-group">
                {factorsFirstJobOptions.map((opt) => (
                  <label key={opt} className="je-shs-checkbox-label">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={form.factors_first_job.includes(opt)}
                      onChange={() => toggleFactors(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {/* "Other" sub-field — appears when Other is checked */}
              {form.factors_first_job.includes('Other') && (
                <input
                  className={`je-shs-other-input${errors.has('other_factors') ? ' error' : ''}`}
                  type="text"
                  placeholder="Please specify other factors"
                  value={form.other_factors}
                  onChange={(e) => set('other_factors', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#003EA6')}
                  onBlur={(e) => (
                    e.target.style.borderColor = errors.has('other_factors')
                      ? '#F87171'
                      : '#D1D5DC'
                  )}
                />
              )}
            </div>

          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="je-shs-footer">
            <button className="je-shs-btn-prev" onClick={() => navigate(prevRoute)}>
              Previous
            </button>

            <div className="je-shs-footer-right">
              {saveToast && (
                <span className="je-shs-save-toast">✓ Progress saved</span>
              )}
              <button className="je-shs-btn-save" onClick={handleSave}>
                Save
              </button>
              <button className="je-shs-btn-next" onClick={handleNext}>
                Next
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
);

export default JobExperienceViewSHS;