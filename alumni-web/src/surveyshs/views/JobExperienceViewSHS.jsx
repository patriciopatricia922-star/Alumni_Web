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
import NotificationBell from '../../components/notifications/NotificationBell';
import '../../styles/NotificationBell.css';
import '../styles/JobExperienceSHS.css';

// ─────────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────────
const JobExperienceViewSHS = ({
  form,
  set,
  setHowFoundJob,
  toggleFactors,
  errors,
  saveToast,
  cardRef,
  timeToFindJobOptions,
  howFoundJobOptions,
  factorsFirstJobOptions,
  formPct,
  currentSection,
  totalSections,
  handleSave,
  handleNext,
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
          <button
            className="je-shs-back-btn"
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
        <h1 className="je-shs-title">Alumni Tracer Survey</h1>
        <p className="je-shs-subtitle">
          Please complete all sections to update your alumni status.
        </p>

        {/* Progress */}
        <div className="je-shs-progress">
          <div className="je-shs-progress-row">
            <span>
              Section {currentSection} of {totalSections}
            </span>
            <span className="je-shs-progress-pct">{formPct}% Complete</span>
          </div>
          <div className="je-shs-progress-track">
            <div
              className="je-shs-progress-fill"
              style={{ width: `${formPct}%` }}
            />
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
                17. How long did it take you to find your first job after
                graduation?
                <span className="je-shs-req">*</span>
                {errors.has("time_to_find_job") && (
                  <span className="je-shs-field-error">
                    This field is required
                  </span>
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
                      onChange={() => set("time_to_find_job", opt)}
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
                {errors.has("how_found_job") && (
                  <span className="je-shs-field-error">
                    This field is required
                  </span>
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
              {form.how_found_job === "Other" && (
                <input
                  className={`je-shs-other-input${errors.has("other_how_found_job") ? " error" : ""}`}
                  type="text"
                  placeholder="Please specify how you found your first job"
                  value={form.other_how_found_job}
                  onChange={(e) => set("other_how_found_job", e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#003EA6")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.has(
                      "other_how_found_job",
                    )
                      ? "#F87171"
                      : "#D1D5DC")
                  }
                />
              )}
            </div>

            {/* ── Q19 — Factors that helped get first job ───────────────── */}
            <div className="je-shs-field">
              <span className="je-shs-label">
                19. What factors helped you most in getting your first job?
                <span className="je-shs-req">*</span>
                {errors.has("factors_first_job") && (
                  <span className="je-shs-field-error">
                    Select at least one option
                  </span>
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
              {form.factors_first_job.includes("Other") && (
                <input
                  className={`je-shs-other-input${errors.has("other_factors") ? " error" : ""}`}
                  type="text"
                  placeholder="Please specify other factors"
                  value={form.other_factors}
                  onChange={(e) => set("other_factors", e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#003EA6")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.has("other_factors")
                      ? "#F87171"
                      : "#D1D5DC")
                  }
                />
              )}
            </div>
          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="je-shs-footer">
            <button
              className="je-shs-btn-prev"
              onClick={() => navigate(prevRoute)}
            >
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