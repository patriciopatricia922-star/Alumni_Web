import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/notifications/NotificationBell'; // NEW IMPORT
import '../styles/NotificationBell.css';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .je-root { display: flex; min-height: 100vh; background: #DAE5F1; font-family: 'Arimo', Arial, sans-serif; }
  .je-content { flex: 1; min-width: 0; margin-left: 229px; }
  .je-header { position: sticky; top: 0; z-index: 40; background: #DAE5F1; padding-bottom: 16px;}
  .je-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .je-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #002263; flex-shrink: 0; margin-left: -34px; }
  .je-bell-wrap { flex-shrink: 0; margin-right: 40px; }
  .je-badge { background: #003EA6; border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .je-bell { width: 48px; height: 48px; background: #003EA6; border: 1.24px solid rgba(255,255,255,0.2); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .je-bell.active { background: #002263; border-color: rgba(0,34,99,0.5); }
  .je-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: rgba(255,0,0,0.7); opacity: 0.42; border-radius: 50%; }
  .je-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: rgba(255,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .je-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #2D467C; }
  .je-subtitle { text-align: center; padding: 4px 51px 0; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 20px; color: #4A5565; }
  .je-progress { margin: 12px 51px 0; background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 16px; padding: 18px 30px 16px; }
  .je-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1E3A5F; }
  .je-progress-track { width: 100%; height: 12px; background: #E5E7EB; border-radius: 9999px; margin-bottom: 10px; overflow: hidden; }
  .je-progress-fill { height: 100%; background: #EFC600; border-radius: 9999px; transition: width 0.4s ease; }
  .je-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #4A5565; }
  .je-body { padding: 24px 51px 60px; }
  .je-card { background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 36px; }
  .je-section-title { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 24px; line-height: 30px; color: #003EA6; text-align: center; }
  .je-section-sub { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 20px; color: #003EA6; margin-top: 6px; text-align: center; }
  .je-questions { display: flex; flex-direction: column; gap: 36px; }
  .je-field { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .je-label { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #003EA6; }
  .je-hint { font-family: 'Arimo', Arial, sans-serif; font-size: 11px; color: #6B7280; line-height: 16px; margin-top: -4px; }
  .je-radio-group { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
  .je-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: #4A5565; line-height: 1.4; padding: 2px 0; }
  .je-radio-label input[type="radio"] { width: 18px; height: 18px; accent-color: #003EA6; cursor: pointer; flex-shrink: 0; }
  .je-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: #4A5565; line-height: 1.4; padding: 2px 0; }
  .je-checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #003EA6; cursor: pointer; flex-shrink: 0; }
  .je-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .je-btn-prev { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .je-btn-prev:hover { background: #002a80; }
  .je-btn-save { width: 100px; height: 48px; background: #FFFFFF; border: 0.8px solid rgba(0,34,99,0.6); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 8px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #002263; transition: background 0.15s, border-color 0.15s; }
  .je-btn-save:hover { background: #f0f4fb; border-color: #002263; }
  .je-btn-next { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .je-btn-next:hover { background: #002a80; }
  .je-other-input { width: 100%; height: 47px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 12px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; margin-top: 8px; transition: border-color 0.15s; }
  .je-other-input:focus { border-color: #003EA6; }
  .je-other-input::placeholder { color: rgba(10,10,10,0.3); }
  .je-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .je-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }
  @media (max-width: 1100px) { .je-topbar { padding: 24px 32px 0; } .je-title { padding: 14px 32px 0; font-size: 26px; } .je-subtitle { padding: 4px 32px 0; } .je-progress { margin: 12px 32px 0; } .je-body { padding: 20px 32px 60px; } .je-card { padding: 32px 32px 28px; } .je-back-btn { margin-left: -22px; } .je-bell-wrap { margin-right: 24px; } }
  @media (max-width: 900px) { .je-topbar { padding: 20px 24px 0; } .je-title { padding: 12px 24px 0; font-size: 24px; } .je-subtitle { padding: 4px 24px 0; } .je-progress { margin: 10px 24px 0; } .je-body { padding: 18px 24px 60px; } .je-card { padding: 28px 24px 24px; gap: 28px; } .je-questions { gap: 28px; } .je-back-btn { margin-left: -16px; } .je-bell-wrap { margin-right: 16px; } }
  @media (max-width: 767px) { .je-content { margin-left: 0; } .je-topbar { padding: 20px 16px 0; } .je-badge { padding: 6px 12px; font-size: 10px; } .je-bell { display: none; } .je-title { padding: 12px 16px 0; font-size: 20px; } .je-subtitle { padding: 4px 16px 0; font-size: 14px; } .je-progress { margin: 10px 16px 0; padding: 14px 16px; } .je-progress-row { font-size: 13px; } .je-progress-label { font-size: 13px; } .je-body { padding: 16px 16px 80px; } .je-card { padding: 20px 16px 20px; gap: 24px; } .je-questions { gap: 24px; } .je-section-title { font-size: 17px; } .je-btn-prev { width: 100px; height: 44px; font-size: 14px; } .je-btn-save { width: 80px; height: 44px; font-size: 14px; } .je-btn-next { width: 100px; height: 44px; font-size: 14px; } .je-back-btn { margin-left: -10px; } .je-bell-wrap { margin-right: 8px; } }
  @media (max-width: 390px) { .je-title { font-size: 17px; } .je-other-input { font-size: 13px; } .je-btn-prev, .je-btn-next { width: 90px; font-size: 13px; } .je-btn-save { width: 70px; font-size: 13px; } }
  @media (max-height: 600px) { .je-header { padding-bottom: 10px; } .je-progress { padding: 10px 20px; } .je-body { padding-top: 14px; } }
`;

const JobExperienceView = ({
  form,
  set,
  toggleFactor,
  errors,
  saveToast,
  cardRef,
  formPct,
  currentSection,
  totalSections,
  timeToFindJobOptions,
  employmentDurationOptions,
  firstJobOptions,
  factorsOptions,
  getLabel,
  getPlaceholder,
  handleSave,
  handleNext,
  onBack,
  navigate,
}) => (
  <>
    <style>{STYLES}</style>
    <div className="je-root">
      <Sidebar />
      <div className="je-content">
        <div className="je-header">
          <div className="je-topbar">
            <button className="je-back-btn" onClick={onBack}>
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

            {/* ── Bell ─────────────────────────────────────────────────────── */}
            <div className="je-bell-wrap" style={{ position: "relative" }}>
              <NotificationBell onSeeAll={() => navigate("/notifications")} />
            </div>
          </div>

          <h1 className="je-title">Alumni Tracer Survey</h1>
          <p className="je-subtitle">
            Please complete all sections to update your alumni status.
          </p>

          <div className="je-progress">
            <div className="je-progress-row">
              <span>
                Section {currentSection} of {totalSections}
              </span>
              <span style={{ color: "#003EA6", fontWeight: 700 }}>
                {formPct}% Complete
              </span>
            </div>
            <div className="je-progress-track">
              <div
                className="je-progress-fill"
                style={{ width: `${formPct}%` }}
              />
            </div>
            <span className="je-progress-label">Work Experience</span>
          </div>
        </div>

        <div className="je-body">
          <div className="je-card" ref={cardRef}>
            <div>
              <h2 className="je-section-title">Work Search Experience</h2>
              <p className="je-section-sub">Your work search experience</p>
            </div>

            <div className="je-questions">
              <div className="je-field">
                <span className="je-label">
                  {getLabel("time_to_find_job")}{" "}
                  <span className="je-req">*</span>
                  {errors.has("time_to_find_job") && (
                    <span className="je-field-error">Required</span>
                  )}
                </span>
                <div className="je-radio-group">
                  {timeToFindJobOptions.map((opt) => (
                    <label key={opt} className="je-radio-label">
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

              <div className="je-field">
                <span className="je-label">
                  {getLabel("employment_duration")}{" "}
                  <span className="je-req">*</span>
                  {errors.has("employment_duration") && (
                    <span className="je-field-error">Required</span>
                  )}
                </span>
                <div className="je-radio-group">
                  {employmentDurationOptions.map((opt) => (
                    <label key={opt} className="je-radio-label">
                      <input
                        type="radio"
                        name="employment_duration"
                        value={opt}
                        checked={form.employment_duration === opt}
                        onChange={() => set("employment_duration", opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                {form.employment_duration === "Other" && (
                  <input
                    className="je-other-input"
                    type="text"
                    placeholder={
                      getPlaceholder("other_employment_duration") ||
                      "Please specify"
                    }
                    value={form.other_employment_duration}
                    onChange={(e) =>
                      set("other_employment_duration", e.target.value)
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#003EA6")}
                    onBlur={(e) => (e.target.style.borderColor = "#D1D5DC")}
                    style={{
                      borderColor: errors.has("other_employment_duration")
                        ? "#F87171"
                        : undefined,
                    }}
                  />
                )}
              </div>

              <div className="je-field">
                <span className="je-label">
                  {getLabel("first_job_source")}{" "}
                  <span className="je-req">*</span>
                  {errors.has("first_job_source") && (
                    <span className="je-field-error">Required</span>
                  )}
                </span>
                <div className="je-radio-group">
                  {firstJobOptions.map((opt) => (
                    <label key={opt} className="je-radio-label">
                      <input
                        type="radio"
                        name="first_job_source"
                        value={opt}
                        checked={form.first_job_source === opt}
                        onChange={() => set("first_job_source", opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                {form.first_job_source === "Other" && (
                  <input
                    className="je-other-input"
                    type="text"
                    placeholder={
                      getPlaceholder("other_first_job_source") ||
                      "Please specify"
                    }
                    value={form.other_first_job_source}
                    onChange={(e) =>
                      set("other_first_job_source", e.target.value)
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#003EA6")}
                    onBlur={(e) => (e.target.style.borderColor = "#D1D5DC")}
                    style={{
                      borderColor: errors.has("other_first_job_source")
                        ? "#F87171"
                        : undefined,
                    }}
                  />
                )}
              </div>

              <div className="je-field">
                <span className="je-label">
                  {getLabel("first_job_factors")}{" "}
                  <span className="je-req">*</span>
                  {errors.has("first_job_factors") && (
                    <span className="je-field-error">Required</span>
                  )}
                </span>
                <span className="je-hint">(Check all that apply)</span>
                <div className="je-radio-group">
                  {factorsOptions.map((opt) => (
                    <label key={opt} className="je-checkbox-label">
                      <input
                        type="checkbox"
                        value={opt}
                        checked={form.first_job_factors.includes(opt)}
                        onChange={() => toggleFactor(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                {form.first_job_factors.includes("Other") && (
                  <input
                    className="je-other-input"
                    type="text"
                    placeholder={
                      getPlaceholder("other_job_factors") || "Please specify"
                    }
                    value={form.other_job_factors}
                    onChange={(e) => set("other_job_factors", e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#003EA6")}
                    onBlur={(e) => (e.target.style.borderColor = "#D1D5DC")}
                    style={{
                      borderColor: errors.has("other_job_factors")
                        ? "#F87171"
                        : undefined,
                    }}
                  />
                )}
              </div>
            </div>

            <div className="je-footer">
              <button
                className="je-btn-prev"
                onClick={() => navigate("/survey/employment-information")}
              >
                Previous
              </button>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {saveToast && (
                  <span
                    style={{
                      fontFamily: "Arimo, Arial",
                      fontSize: "13px",
                      color: "#15803d",
                    }}
                  >
                    Progress saved
                  </span>
                )}
                <button className="je-btn-next" onClick={handleNext}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default JobExperienceView;