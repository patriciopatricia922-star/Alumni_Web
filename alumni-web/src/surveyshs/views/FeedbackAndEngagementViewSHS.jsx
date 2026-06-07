/**
 * FeedbackAndEngagementViewSHS.jsx — View / Presentational Layer
 * Location: src/surveyshs/views/FeedbackAndEngagementViewSHS.jsx
 *
 * Pure render component — receives everything via props, owns zero state.
 * Imports its own scoped CSS (FeedbackAndEngagementSHS.css) so styles
 * never bleed into the college module or other SHS sections.
 *
 * Layout mirrors college FeedbackAndAlumniEngagementView exactly:
 *   sticky header → progress → card → footer
 *
 * Two visual sub-sections inside the card, separated by a divider:
 *   ① Feedback for the University
 *      • satisfaction    (radio)
 *      • recommend       (radio)
 *      • suggestions     (textarea)
 *   ② Alumni Engagement
 *      • informed_about_events  (radio)
 *      • participate_in         (checkboxes + "Others" text input)
 *
 * Footer: Previous | Save | Submit
 */

import React from 'react';
import Sidebar from '../../components/Sidebar';
import '../styles/FeedbackAndEngagement.css';


// ─────────────────────────────────────────────────────────────────────────────
// Notification dropdown (self-contained, stateless)
// ─────────────────────────────────────────────────────────────────────────────
const NotifDropdown = ({
  notifs, unreadCount, notifTab, setNotifTab,
  markAllRead, markOneRead, groupByDate, formatTime,
  navigate, setShowDropdown,
}) => {
  const list    = notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const grouped = groupByDate(list);

  return (
    <div className="fa-shs-notif-dropdown">
      {/* Header */}
      <div className="fa-shs-notif-header">
        <span className="fa-shs-notif-title">Notifications</span>
        {unreadCount > 0 && (
          <button className="fa-shs-notif-mark-all" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="fa-shs-notif-tabs">
        {['all', 'unread'].map((t) => (
          <button
            key={t}
            className={`fa-shs-notif-tab ${notifTab === t ? 'active' : 'inactive'}`}
            onClick={() => setNotifTab(t)}
          >
            {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="fa-shs-notif-list">
        {!list.length ? (
          <div className="fa-shs-notif-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>
            <p className="fa-shs-notif-empty-text">
              {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => {
            if (!items.length) return null;
            return (
              <div key={label}>
                <p className="fa-shs-notif-group-label">{label}</p>
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`fa-shs-notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markOneRead(n.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                    onMouseLeave={(e) => (
                      e.currentTarget.style.background = n.read
                        ? 'transparent'
                        : 'rgba(0,62,166,0.05)'
                    )}
                  >
                    <div className="fa-shs-notif-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="fa-shs-notif-body">
                      <p className={`fa-shs-notif-item-title ${n.read ? 'read' : 'unread'}`}>
                        {n.title}
                      </p>
                      <p className="fa-shs-notif-item-body">{n.body}</p>
                      <span className="fa-shs-notif-time">{formatTime(n.time)}</span>
                    </div>
                    {!n.read && <div className="fa-shs-notif-dot" />}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="fa-shs-notif-footer">
        <button
          className="fa-shs-notif-see-all"
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
const FeedbackAndEngagementViewSHS = ({
  // form
  form,
  set,
  toggleParticipate,
  errors,
  saveToast,
  cardRef,
  // static options
  satisfactionOptions,
  yesNoOptions,
  participateOptions,
  // progress
  formPct,
  currentSection,
  totalSections,
  // actions
  handleSave,
  handleSubmit,
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
  <div className="fa-shs-root">
    <Sidebar />

    <div className="fa-shs-content">

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <div className="fa-shs-header">
        <div className="fa-shs-topbar">

          {/* Back button */}
          <button className="fa-shs-back-btn" onClick={() => navigate(prevRoute)}>
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
          <div className="fa-shs-badge">ALUMNI STATUS</div>

          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              className={`fa-shs-bell${showDropdown ? ' active' : ''}`}
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
                  <div className="fa-shs-bell-dot" />
                  <div className="fa-shs-bell-count">
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
        <h1 className="fa-shs-title">Alumni Tracer Survey</h1>
        <p className="fa-shs-subtitle">
          Please complete all sections to update your alumni status.
        </p>

        {/* Progress */}
        <div className="fa-shs-progress">
          <div className="fa-shs-progress-row">
            <span>Section {currentSection} of {totalSections}</span>
            <span className="fa-shs-progress-pct">{formPct}% Complete</span>
          </div>
          <div className="fa-shs-progress-track">
            <div className="fa-shs-progress-fill" style={{ width: `${formPct}%` }} />
          </div>
          <span className="fa-shs-progress-label">Feedback and Alumni Engagement</span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="fa-shs-body">
        <div className="fa-shs-card" ref={cardRef}>

          {/* Validation error banner */}
          {errors.size > 0 && (
            <div className="fa-shs-error-banner">
              <strong>Please answer all required questions before submitting.</strong>
            </div>
          )}

          {/* Card heading */}
          <div>
            <h2 className="fa-shs-section-title">Feedback and Alumni Engagement</h2>
            <p className="fa-shs-section-sub">Share your thoughts and stay connected with us</p>
          </div>

          <div className="fa-shs-questions">

            {/* ── Sub-section: Feedback for the University ──────────────── */}
            <p className="fa-shs-group-label">Feedback for the University</p>

            {/* Q1 — Satisfaction */}
            <div className="fa-shs-field">
              <span className="fa-shs-label">
                How satisfied are you with your education at NU Dasma?
                <span className="fa-shs-req">*</span>
                {errors.has('satisfaction') && (
                  <span className="fa-shs-field-error">Required</span>
                )}
              </span>
              <div className="fa-shs-radio-group">
                {satisfactionOptions.map((opt) => (
                  <label key={opt} className="fa-shs-radio-label">
                    <input
                      type="radio"
                      name="satisfaction"
                      value={opt}
                      checked={form.satisfaction === opt}
                      onChange={() => set('satisfaction', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Q2 — Recommend */}
            <div className="fa-shs-field">
              <span className="fa-shs-label">
                Would you recommend NU Dasma to others?
                <span className="fa-shs-req">*</span>
                {errors.has('recommend') && (
                  <span className="fa-shs-field-error">Required</span>
                )}
              </span>
              <div className="fa-shs-radio-group">
                {yesNoOptions.map((opt) => (
                  <label key={opt} className="fa-shs-radio-label">
                    <input
                      type="radio"
                      name="recommend"
                      value={opt}
                      checked={form.recommend === opt}
                      onChange={() => set('recommend', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Q3 — Suggestions */}
            <div className="fa-shs-field">
              <span className="fa-shs-label">
                Suggestion for improving academic programs.
                <span className="fa-shs-req">*</span>
                {errors.has('suggestions') && (
                  <span className="fa-shs-field-error">Required</span>
                )}
              </span>
              <textarea
                className={`fa-shs-textarea${errors.has('suggestions') ? ' error' : ''}`}
                placeholder="Enter your answer"
                value={form.suggestions}
                onChange={(e) => set('suggestions', e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#003EA6')}
                onBlur={(e) => (e.target.style.borderColor = errors.has('suggestions') ? '#F87171' : '#D1D5DC')}
              />
            </div>

            {/* Divider */}
            <div className="fa-shs-divider" />

            {/* ── Sub-section: Alumni Engagement ────────────────────────── */}
            <p className="fa-shs-group-label">Alumni Engagement</p>

            {/* Q4 — Informed about events */}
            <div className="fa-shs-field">
              <span className="fa-shs-label">
                Would you like to be informed about upcoming alumni events and activities?
                <span className="fa-shs-req">*</span>
                {errors.has('informed_about_events') && (
                  <span className="fa-shs-field-error">Required</span>
                )}
              </span>
              <div className="fa-shs-radio-group">
                {yesNoOptions.map((opt) => (
                  <label key={opt} className="fa-shs-radio-label">
                    <input
                      type="radio"
                      name="informed_about_events"
                      value={opt}
                      checked={form.informed_about_events === opt}
                      onChange={() => set('informed_about_events', opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Q5 — Participate in (checkboxes) */}
            <div className="fa-shs-field">
              <span className="fa-shs-label">
                Would you be willing to participate in:
                <span className="fa-shs-req">*</span>
                {errors.has('participate_in') && (
                  <span className="fa-shs-field-error">Select at least one option</span>
                )}
              </span>
              <div className="fa-shs-checkbox-group">
                {participateOptions.map((opt) => (
                  <label key={opt} className="fa-shs-checkbox-label">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={form.participate_in.includes(opt)}
                      onChange={() => toggleParticipate(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>

              {/* "Others" sub-field — appears when Others is checked */}
              {form.participate_in.includes('Others') && (
                <input
                  className={`fa-shs-other-input${errors.has('other_participate') ? ' error' : ''}`}
                  type="text"
                  placeholder="Please specify"
                  value={form.other_participate}
                  onChange={(e) => set('other_participate', e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = '#003EA6')}
                  onBlur={(e) => (
                    e.target.style.borderColor = errors.has('other_participate')
                      ? '#F87171'
                      : '#D1D5DC'
                  )}
                />
              )}
            </div>

          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="fa-shs-footer">
            <button className="fa-shs-btn-prev" onClick={() => navigate(prevRoute)}>
              Previous
            </button>

            <div className="fa-shs-footer-right">
              {saveToast && (
                <span className="fa-shs-save-toast">✓ Progress saved</span>
              )}
              <button className="fa-shs-btn-save" onClick={handleSave}>
                Save
              </button>
              <button className="fa-shs-btn-submit" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
);

export default FeedbackAndEngagementViewSHS;