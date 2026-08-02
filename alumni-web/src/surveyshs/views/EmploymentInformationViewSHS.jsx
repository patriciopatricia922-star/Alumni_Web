/**
 * EmploymentInformationViewSHS.jsx — View / Presentational Layer
 * Location: src/surveyshs/views/EmploymentInformationViewSHS.jsx
 *
 * Pure render component — receives everything via props, owns zero state.
 * Imports its own scoped CSS (EmploymentInformationSHS.css) so styles
 * never bleed into the college module or other SHS sections.
 *
 * Question order (matches the spec exactly):
 *   1. Current Employment Status            (radio + "Other" text field)
 *   2. Job Position                         (text input)   ← employed only
 *   3. Name of Company / Employer           (text input)   ← employed only
 *   4. Type of Industry                     (radio + "Others" text field) ← employed only
 *   5. Location of Employment               (radio: Local / Abroad / None) ← employed only
 *   6. Monthly Income Range                 (radio)        ← employed only
 *   7. Is your current job related to your strand? (radio: Yes / No) ← employed only
 */

import React from 'react';
import Sidebar from '../../components/Sidebar';
import '../styles/EmploymentInformationSHS.css';

// ─────────────────────────────────────────────────────────────────────────────
// Notification dropdown (self-contained, no state)
// ─────────────────────────────────────────────────────────────────────────────
const NotifDropdown = ({
  notifs, unreadCount, notifTab, setNotifTab,
  markAllRead, markOneRead, groupByDate, formatTime, navigate,
  setShowDropdown,
}) => {
  const list = notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const grouped = groupByDate(list);

  return (
    <div className="ei-shs-notif-dropdown">
      {/* Header */}
      <div className="ei-shs-notif-header">
        <span className="ei-shs-notif-title">Notifications</span>
        {unreadCount > 0 && (
          <button className="ei-shs-notif-mark-all" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="ei-shs-notif-tabs">
        {['all', 'unread'].map((t) => (
          <button
            key={t}
            className={`ei-shs-notif-tab ${notifTab === t ? 'active' : 'inactive'}`}
            onClick={() => setNotifTab(t)}
          >
            {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="ei-shs-notif-list">
        {!list.length ? (
          <div className="ei-shs-notif-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>
            <p className="ei-shs-notif-empty-text">
              {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => {
            if (!items.length) return null;
            return (
              <div key={label}>
                <p className="ei-shs-notif-group-label">{label}</p>
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`ei-shs-notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markOneRead(n.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(0,62,166,0.05)')}
                  >
                    <div className="ei-shs-notif-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="ei-shs-notif-body">
                      <p className={`ei-shs-notif-item-title ${n.read ? 'read' : 'unread'}`}>
                        {n.title}
                      </p>
                      <p className="ei-shs-notif-item-body">{n.body}</p>
                      <span className="ei-shs-notif-time">{formatTime(n.time)}</span>
                    </div>
                    {!n.read && <div className="ei-shs-notif-dot" />}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="ei-shs-notif-footer">
        <button
          className="ei-shs-notif-see-all"
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
const EmploymentInformationViewSHS = ({
  // form
  form,
  set,
  setEmploymentStatus,
  setTypeOfIndustry,
  errors,
  saveToast,
  cardRef,
  // static options
  employmentStatuses,
  employedStatuses,
  unemployedStatuses,
  industryOptions,
  locationOptions,
  monthlyIncomeOptions,
  unemployedReasonOptions, // ADDED
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
}) => {
  const isEmployed   = employedStatuses.includes(form.employment_status);
  const isUnemployed = unemployedStatuses.includes(form.employment_status);

  const showEmployedBranch   = isEmployed;
  const showUnemployedBranch = isUnemployed; // ADDED

  return (
    <div className="ei-shs-root">
      <Sidebar />

      <div className="ei-shs-content">

        {/* ── Sticky header ──────────────────────────────────────────────── */}
        <div className="ei-shs-header">
          <div className="ei-shs-topbar">

            {/* Back button */}
            <button className="ei-shs-back-btn" onClick={() => navigate(prevRoute)}>
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
            <div className="ei-shs-badge">ALUMNI STATUS</div>

            {/* Bell */}
            <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                className={`ei-shs-bell${showDropdown ? ' active' : ''}`}
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
                    <div className="ei-shs-bell-dot" />
                    <div className="ei-shs-bell-count">
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
          <h1 className="ei-shs-title">Alumni Tracer Survey</h1>
          <p className="ei-shs-subtitle">
            Please complete all sections to update your alumni status.
          </p>

          {/* Progress */}
          <div className="ei-shs-progress">
            <div className="ei-shs-progress-row">
              <span>Section {currentSection} of {totalSections}</span>
              <span className="ei-shs-progress-pct">{formPct}% Complete</span>
            </div>
            <div className="ei-shs-progress-track">
              <div className="ei-shs-progress-fill" style={{ width: `${formPct}%` }} />
            </div>
            <span className="ei-shs-progress-label">Employment Information</span>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="ei-shs-body">
          <div className="ei-shs-card" ref={cardRef}>

            {/* Card heading */}
            <div>
              <h2 className="ei-shs-section-title">Employment Information</h2>
              <p className="ei-shs-section-sub">Information related to your current work</p>
            </div>

            {/* ── Root fields ─────────────────────────────────────────────── */}
            <div className="ei-shs-fields">

              {/* Q1 — Current Employment Status */}
              <div className="ei-shs-field">
                <span className="ei-shs-label">
                  Current Employment Status
                  <span className="ei-shs-req">*</span>
                  {errors.has('employment_status') && (
                    <span className="ei-shs-field-error">This field is required</span>
                  )}
                </span>
                <div className="ei-shs-radio-group">
                  {employmentStatuses.map((opt) => (
                    <label key={opt} className="ei-shs-radio-label">
                      <input
                        type="radio"
                        name="employment_status"
                        value={opt}
                        checked={form.employment_status === opt}
                        onChange={() => setEmploymentStatus(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>

                {/* "Other" sub-field */}
                {form.employment_status === 'Other' && (
                  <input
                    className={`ei-shs-input ei-shs-other-input${errors.has('other_employment_status') ? ' error' : ''}`}
                    type="text"
                    placeholder="Please specify your employment status"
                    value={form.other_employment_status}
                    onChange={(e) => set('other_employment_status', e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* ── Employed branch ─────────────────────────────────────────── */}
            {showEmployedBranch && (
              <div className="ei-shs-branch">

                {/* Q2 — Job Position */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Job Position
                    <span className="ei-shs-req">*</span>
                    {errors.has('job_position') && (
                      <span className="ei-shs-field-error">This field is required</span>
                    )}
                  </span>
                  <input
                    className={`ei-shs-input${errors.has('job_position') ? ' error' : ''}`}
                    type="text"
                    placeholder="Enter your job position"
                    value={form.job_position}
                    onChange={(e) => set('job_position', e.target.value)}
                  />
                </div>

                {/* Q3 — Name of Company / Employer */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Name of Company / Employer
                    <span className="ei-shs-req">*</span>
                    {errors.has('company_name') && (
                      <span className="ei-shs-field-error">This field is required</span>
                    )}
                  </span>
                  <input
                    className={`ei-shs-input${errors.has('company_name') ? ' error' : ''}`}
                    type="text"
                    placeholder="Enter company or employer name"
                    value={form.company_name}
                    onChange={(e) => set('company_name', e.target.value)}
                  />
                </div>

                {/* Q4 — Type of Industry */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Type of Industry
                    <span className="ei-shs-req">*</span>
                    {errors.has('type_of_industry') && (
                      <span className="ei-shs-field-error">This field is required</span>
                    )}
                  </span>
                  <div className="ei-shs-radio-group">
                    {industryOptions.map((opt) => (
                      <label key={opt} className="ei-shs-radio-label">
                        <input
                          type="radio"
                          name="type_of_industry"
                          value={opt}
                          checked={form.type_of_industry === opt}
                          onChange={() => setTypeOfIndustry(opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>

                  {/* "Others" sub-field */}
                  {form.type_of_industry === 'Others' && (
                    <input
                      className={`ei-shs-input ei-shs-other-input${errors.has('type_of_industry_other') ? ' error' : ''}`}
                      type="text"
                      placeholder="Please specify the industry"
                      value={form.type_of_industry_other}
                      onChange={(e) => set('type_of_industry_other', e.target.value)}
                    />
                  )}
                </div>

                {/* Q5 — Location of Employment */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Location of Employment
                    <span className="ei-shs-req">*</span>
                    {errors.has('location_of_employment') && (
                      <span className="ei-shs-field-error">This field is required</span>
                    )}
                  </span>
                  <div className="ei-shs-radio-group">
                    {locationOptions.map((opt) => (
                      <label key={opt} className="ei-shs-radio-label">
                        <input
                          type="radio"
                          name="location_of_employment"
                          value={opt}
                          checked={form.location_of_employment === opt}
                          onChange={() => set('location_of_employment', opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q6 — Monthly Income Range */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Monthly Income Range
                    <span className="ei-shs-req">*</span>
                    {errors.has('monthly_income') && (
                      <span className="ei-shs-field-error">This field is required</span>
                    )}
                  </span>
                  <div className="ei-shs-radio-group">
                    {monthlyIncomeOptions.map((opt) => (
                      <label key={opt} className="ei-shs-radio-label">
                        <input
                          type="radio"
                          name="monthly_income"
                          value={opt}
                          checked={form.monthly_income === opt}
                          onChange={() => set('monthly_income', opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q7 — Is your current job related to your strand? */}
                {/* Q7 — Is your current job related to your strand? */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Is your current job related to your strand?
                    <span className="ei-shs-req">*</span>
                    {errors.has('job_related_to_strand') && (
                      <span className="ei-shs-field-error">This field is required</span>
                    )}
                  </span>
                  <div className="ei-shs-radio-group">
                    {['Yes', 'No'].map((opt) => (
                      <label key={opt} className="ei-shs-radio-label">
                        <input
                          type="radio"
                          name="job_related_to_strand"
                          value={opt}
                          checked={form.job_related_to_strand === opt}
                          onChange={() => set('job_related_to_strand', opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

              </div>
              /* end showEmployedBranch */
            )}

            {/* ── Unemployed branch ──────────────────────────────────────── */}
            {/* ADDED — was completely missing; this is why selecting either
                Unemployed status showed no follow-up fields at all. */}
            {showUnemployedBranch && (
              <div className="ei-shs-branch">

                {/* Reasons of being unemployed */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Reasons of being unemployed
                    <span className="ei-shs-req">*</span>
                    {errors.has('reason_unemployed') && (
                      <span className="ei-shs-field-error">This field is required</span>
                    )}
                  </span>
                  <div className="ei-shs-radio-group">
                    {unemployedReasonOptions.map((opt) => (
                      <label key={opt} className="ei-shs-radio-label">
                        <input
                          type="radio"
                          name="reason_unemployed"
                          value={opt}
                          checked={form.reason_unemployed === opt}
                          onChange={() => set('reason_unemployed', opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>

                  {/* "Other" sub-field */}
                  {form.reason_unemployed === 'Other' && (
                    <input
                      className={`ei-shs-input ei-shs-other-input${errors.has('reason_unemployed_other') ? ' error' : ''}`}
                      type="text"
                      placeholder="Please specify"
                      value={form.reason_unemployed_other}
                      onChange={(e) => set('reason_unemployed_other', e.target.value)}
                    />
                  )}
                </div>

              </div>
              /* end showUnemployedBranch */
            )}

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="ei-shs-footer">
              <button className="ei-shs-btn-prev" onClick={() => navigate(prevRoute)}>
                Previous
              </button>

              <div className="ei-shs-footer-right">
                {saveToast && (
                  <span className="ei-shs-save-toast">Progress saved</span>
                )}
                <button className="ei-shs-btn-save" onClick={handleSave}>
                  Save
                </button>
                <button className="ei-shs-btn-next" onClick={handleNext}>
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EmploymentInformationViewSHS;