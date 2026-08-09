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
import NotificationBell from '../../components/notifications/NotificationBell';
import '../../styles/NotificationBell.css'; 
import '../styles/EmploymentInformationSHS.css';


// ─────────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────────
const EmploymentInformationViewSHS = ({
  form,
  set,
  setEmploymentStatus,
  setTypeOfIndustry,
  errors,
  saveToast,
  cardRef,
  employmentStatuses,
  employedStatuses,
  unemployedStatuses,
  industryOptions,
  locationOptions,
  monthlyIncomeOptions,
  unemployedReasonOptions,
  formPct,
  currentSection,
  totalSections,
  handleSave,
  handleNext,
  navigate,
  prevRoute,
}) => {
  const isEmployed   = employedStatuses.includes(form.employment_status);
  const isUnemployed = unemployedStatuses.includes(form.employment_status);

  const showEmployedBranch   = isEmployed;
  const showUnemployedBranch = isUnemployed; 

  return (
    <div className="ei-shs-root">
      <Sidebar />

      <div className="ei-shs-content">
        {/* ── Sticky header ──────────────────────────────────────────────── */}
        <div className="ei-shs-header">
          <div className="ei-shs-topbar">
            {/* Back button */}
            <button
              className="ei-shs-back-btn"
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
          <h1 className="ei-shs-title">Alumni Tracer Survey</h1>
          <p className="ei-shs-subtitle">
            Please complete all sections to update your alumni status.
          </p>

          {/* Progress */}
          <div className="ei-shs-progress">
            <div className="ei-shs-progress-row">
              <span>
                Section {currentSection} of {totalSections}
              </span>
              <span className="ei-shs-progress-pct">{formPct}% Complete</span>
            </div>
            <div className="ei-shs-progress-track">
              <div
                className="ei-shs-progress-fill"
                style={{ width: `${formPct}%` }}
              />
            </div>
            <span className="ei-shs-progress-label">
              Employment Information
            </span>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="ei-shs-body">
          <div className="ei-shs-card" ref={cardRef}>
            {/* Card heading */}
            <div>
              <h2 className="ei-shs-section-title">Employment Information</h2>
              <p className="ei-shs-section-sub">
                Information related to your current work
              </p>
            </div>

            {/* ── Root fields ─────────────────────────────────────────────── */}
            <div className="ei-shs-fields">
              {/* Q1 — Current Employment Status */}
              <div className="ei-shs-field">
                <span className="ei-shs-label">
                  Current Employment Status
                  <span className="ei-shs-req">*</span>
                  {errors.has("employment_status") && (
                    <span className="ei-shs-field-error">
                      This field is required
                    </span>
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
                {form.employment_status === "Other" && (
                  <input
                    className={`ei-shs-input ei-shs-other-input${errors.has("other_employment_status") ? " error" : ""}`}
                    type="text"
                    placeholder="Please specify your employment status"
                    value={form.other_employment_status}
                    onChange={(e) =>
                      set("other_employment_status", e.target.value)
                    }
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
                    {errors.has("job_position") && (
                      <span className="ei-shs-field-error">
                        This field is required
                      </span>
                    )}
                  </span>
                  <input
                    className={`ei-shs-input${errors.has("job_position") ? " error" : ""}`}
                    type="text"
                    placeholder="Enter your job position"
                    value={form.job_position}
                    onChange={(e) => set("job_position", e.target.value)}
                  />
                </div>

                {/* Q3 — Name of Company / Employer */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Name of Company / Employer
                    <span className="ei-shs-req">*</span>
                    {errors.has("company_name") && (
                      <span className="ei-shs-field-error">
                        This field is required
                      </span>
                    )}
                  </span>
                  <input
                    className={`ei-shs-input${errors.has("company_name") ? " error" : ""}`}
                    type="text"
                    placeholder="Enter company or employer name"
                    value={form.company_name}
                    onChange={(e) => set("company_name", e.target.value)}
                  />
                </div>

                {/* Q4 — Type of Industry */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Type of Industry
                    <span className="ei-shs-req">*</span>
                    {errors.has("type_of_industry") && (
                      <span className="ei-shs-field-error">
                        This field is required
                      </span>
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
                  {form.type_of_industry === "Others" && (
                    <input
                      className={`ei-shs-input ei-shs-other-input${errors.has("type_of_industry_other") ? " error" : ""}`}
                      type="text"
                      placeholder="Please specify the industry"
                      value={form.type_of_industry_other}
                      onChange={(e) =>
                        set("type_of_industry_other", e.target.value)
                      }
                    />
                  )}
                </div>

                {/* Q5 — Location of Employment */}
                <div className="ei-shs-field">
                  <span className="ei-shs-label">
                    Location of Employment
                    <span className="ei-shs-req">*</span>
                    {errors.has("location_of_employment") && (
                      <span className="ei-shs-field-error">
                        This field is required
                      </span>
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
                          onChange={() => set("location_of_employment", opt)}
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
                    {errors.has("monthly_income") && (
                      <span className="ei-shs-field-error">
                        This field is required
                      </span>
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
                          onChange={() => set("monthly_income", opt)}
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
                    {errors.has("job_related_to_strand") && (
                      <span className="ei-shs-field-error">
                        This field is required
                      </span>
                    )}
                  </span>
                  <div className="ei-shs-radio-group">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt} className="ei-shs-radio-label">
                        <input
                          type="radio"
                          name="job_related_to_strand"
                          value={opt}
                          checked={form.job_related_to_strand === opt}
                          onChange={() => set("job_related_to_strand", opt)}
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
                    {errors.has("reason_unemployed") && (
                      <span className="ei-shs-field-error">
                        This field is required
                      </span>
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
                          onChange={() => set("reason_unemployed", opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>

                  {/* "Other" sub-field */}
                  {form.reason_unemployed === "Other" && (
                    <input
                      className={`ei-shs-input ei-shs-other-input${errors.has("reason_unemployed_other") ? " error" : ""}`}
                      type="text"
                      placeholder="Please specify"
                      value={form.reason_unemployed_other}
                      onChange={(e) =>
                        set("reason_unemployed_other", e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
              /* end showUnemployedBranch */
            )}

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="ei-shs-footer">
              <button
                className="ei-shs-btn-prev"
                onClick={() => navigate(prevRoute)}
              >
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