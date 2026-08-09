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
import NotificationBell from '../../components/notifications/NotificationBell'; // NEW IMPORT
import '../../styles/NotificationBell.css';
import '../styles/FeedbackAndEngagement.css';

// ─────────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────────
const FeedbackAndEngagementViewSHS = ({
  form,
  set,
  toggleParticipate,
  errors,
  saveToast,
  cardRef,
  satisfactionOptions,
  yesNoOptions,
  participateOptions,
  formPct,
  currentSection,
  totalSections,
  handleSave,
  handleSubmit,
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
          <button
            className="fa-shs-back-btn"
            onClick={() => navigate(prevRoute)}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
                stroke="#002263"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
          {/* Bell */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <NotificationBell onSeeAll={() => navigate("/notifications")} />
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
            <span>
              Section {currentSection} of {totalSections}
            </span>
            <span className="fa-shs-progress-pct">{formPct}% Complete</span>
          </div>
          <div className="fa-shs-progress-track">
            <div
              className="fa-shs-progress-fill"
              style={{ width: `${formPct}%` }}
            />
          </div>
          <span className="fa-shs-progress-label">
            Feedback and Alumni Engagement
          </span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="fa-shs-body">
        <div className="fa-shs-card" ref={cardRef}>
          {/* Validation error banner */}
          {errors.size > 0 && (
            <div className="fa-shs-error-banner">
              <strong>
                Please answer all required questions before submitting.
              </strong>
            </div>
          )}

          {/* Card heading */}
          <div>
            <h2 className="fa-shs-section-title">
              Feedback and Alumni Engagement
            </h2>
            <p className="fa-shs-section-sub">
              Share your thoughts and stay connected with us
            </p>
          </div>

          <div className="fa-shs-questions">
            {/* ── Sub-section: Feedback for the University ──────────────── */}
            <p className="fa-shs-group-label">Feedback for the University</p>

            {/* Q1 — Satisfaction */}
            <div className="fa-shs-field">
              <span className="fa-shs-label">
                How satisfied are you with your education at NU Dasma?
                <span className="fa-shs-req">*</span>
                {errors.has("satisfaction") && (
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
                      onChange={() => set("satisfaction", opt)}
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
                {errors.has("recommend") && (
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
                      onChange={() => set("recommend", opt)}
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
                {errors.has("suggestions") && (
                  <span className="fa-shs-field-error">Required</span>
                )}
              </span>
              <textarea
                className={`fa-shs-textarea${errors.has("suggestions") ? " error" : ""}`}
                placeholder="Enter your answer"
                value={form.suggestions}
                onChange={(e) => set("suggestions", e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#003EA6")}
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.has("suggestions")
                    ? "#F87171"
                    : "#D1D5DC")
                }
              />
            </div>

            {/* Divider */}
            <div className="fa-shs-divider" />

            {/* ── Sub-section: Alumni Engagement ────────────────────────── */}
            <p className="fa-shs-group-label">Alumni Engagement</p>

            {/* Q4 — Informed about events */}
            <div className="fa-shs-field">
              <span className="fa-shs-label">
                Would you like to be informed about upcoming alumni events and
                activities?
                <span className="fa-shs-req">*</span>
                {errors.has("informed_about_events") && (
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
                      onChange={() => set("informed_about_events", opt)}
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
                {errors.has("participate_in") && (
                  <span className="fa-shs-field-error">
                    Select at least one option
                  </span>
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
              {form.participate_in.includes("Others") && (
                <input
                  className={`fa-shs-other-input${errors.has("other_participate") ? " error" : ""}`}
                  type="text"
                  placeholder="Please specify"
                  value={form.other_participate}
                  onChange={(e) => set("other_participate", e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#003EA6")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.has(
                      "other_participate",
                    )
                      ? "#F87171"
                      : "#D1D5DC")
                  }
                />
              )}
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="fa-shs-footer">
            <button
              className="fa-shs-btn-prev"
              onClick={() => navigate(prevRoute)}
            >
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