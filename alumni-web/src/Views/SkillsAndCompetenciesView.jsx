import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/notifications/NotificationBell'; // NEW IMPORT
import '../styles/NotificationBell.css';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .sc-root { display: flex; min-height: 100vh; background: #DAE5F1; font-family: 'Arimo', Arial, sans-serif; }
  .sc-content { flex: 1; min-width: 0; margin-left: 229px; }
  .sc-header { position: sticky; top: 0; z-index: 40; background: #DAE5F1; padding-bottom: 16px;}
  .sc-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .sc-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #002263; flex-shrink: 0; margin-left: -34px; }
  .sc-bell-wrap { flex-shrink: 0; margin-right: 40px; }
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
  @media (max-width: 1100px) { .sc-topbar { padding: 24px 32px 0; } .sc-title { padding: 14px 32px 0; font-size: 26px; } .sc-subtitle { padding: 4px 32px 0; } .sc-progress { margin: 12px 32px 0; } .sc-body { padding: 20px 32px 60px; } .sc-card { padding: 32px 32px 28px; } .sc-back-btn { margin-left: -22px; } .sc-bell-wrap { margin-right: 24px; } }
  @media (max-width: 900px) { .sc-topbar { padding: 20px 24px 0; } .sc-title { padding: 12px 24px 0; font-size: 24px; } .sc-subtitle { padding: 4px 24px 0; } .sc-progress { margin: 10px 24px 0; } .sc-body { padding: 18px 24px 60px; } .sc-card { padding: 28px 24px 24px; gap: 28px; } .sc-questions { gap: 28px; } .sc-back-btn { margin-left: -16px; } .sc-bell-wrap { margin-right: 16px; } }
  @media (max-width: 767px) { .sc-content { margin-left: 0; } .sc-topbar { padding: 20px 16px 0; } .sc-badge { padding: 6px 12px; font-size: 10px; } .sc-bell { display: none; } .sc-title { padding: 12px 16px 0; font-size: 20px; } .sc-subtitle { padding: 4px 16px 0; font-size: 14px; } .sc-progress { margin: 10px 16px 0; padding: 14px 16px; } .sc-progress-row { font-size: 13px; } .sc-progress-label { font-size: 13px; } .sc-body { padding: 16px 16px 80px; } .sc-card { padding: 20px 16px 20px; gap: 24px; } .sc-questions { gap: 24px; } .sc-section-title { font-size: 17px; } .sc-stars { gap: 12px; } .sc-star { width: 28px; height: 28px; } .sc-btn-prev { width: 100px; height: 44px; font-size: 14px; } .sc-btn-save { width: 80px; height: 44px; font-size: 14px; } .sc-btn-next { width: 100px; height: 44px; font-size: 14px; } .sc-back-btn { margin-left: -10px; } .sc-bell-wrap { margin-right: 8px; } }
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
  form,
  toggleCompetency,
  setSkillRating,
  setSkillsToDevelop,
  errors,
  saveToast,
  cardRef,
  formPct,
  currentSection,
  totalSections,
  competenciesOptions,
  skillRatingsKeys,
  getLabel,
  getPlaceholder,
  handleSave,
  handleNext,
  onBack,
  navigate,
}) => (
  <>
    <style>{STYLES}</style>
    <div className="sc-root">
      <Sidebar />
      <div className="sc-content">
        <div className="sc-header">
          <div className="sc-topbar">
            <button className="sc-back-btn" onClick={onBack}>
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

            <div className="sc-bell-wrap" style={{ position: "relative" }}>
              <NotificationBell onSeeAll={() => navigate("/notifications")} />
            </div>
          </div>

          <h1 className="sc-title">Alumni Tracer Survey</h1>
          <p className="sc-subtitle">
            Please complete all sections to update your alumni status.
          </p>

          <div className="sc-progress">
            <div className="sc-progress-row">
              <span>
                Section {currentSection} of {totalSections}
              </span>
              <span style={{ color: "#003EA6", fontWeight: 700 }}>
                {formPct}% Complete
              </span>
            </div>
            <div className="sc-progress-track">
              <div
                className="sc-progress-fill"
                style={{ width: `${formPct}%` }}
              />
            </div>
            <span className="sc-progress-label">Skills and competencies</span>
          </div>
        </div>

        <div className="sc-body">
          <div className="sc-card" ref={cardRef}>
            {errors.size > 0 && (
              <div className="sc-error-banner">
                <strong>
                  Please answer all required questions before proceeding.
                </strong>
              </div>
            )}
            <div>
              <h2 className="sc-section-title">Skills and competencies</h2>
              <p className="sc-section-sub">Your workplace skills</p>
            </div>

            <div className="sc-questions">
              <div className="sc-field">
                <span className="sc-label">
                  {getLabel("useful_competencies")}{" "}
                  <span className="sc-req">*</span>
                  {errors.has("useful_competencies") && (
                    <span className="sc-field-error">Required</span>
                  )}
                </span>
                <div className="sc-radio-group">
                  {competenciesOptions.map((opt) => (
                    <label key={opt} className="sc-checkbox-label">
                      <input
                        type="checkbox"
                        value={opt}
                        checked={form.useful_competencies.includes(opt)}
                        onChange={() => toggleCompetency(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="sc-skill-ratings">
                {skillRatingsKeys.map((skill) => (
                  <div key={skill} className="sc-skill-row">
                    <span className="sc-skill-label">
                      {skill} <span className="sc-req">*</span>
                      {errors.has("rating_" + skill) && (
                        <span className="sc-field-error">Required</span>
                      )}
                    </span>
                    <StarRating
                      value={form.skill_ratings[skill] || 0}
                      onChange={(r) => setSkillRating(skill, r)}
                    />
                  </div>
                ))}
              </div>

              <div className="sc-field">
                <span className="sc-label">
                  {getLabel("skills_to_develop")}{" "}
                  <span className="sc-req">*</span>
                  {errors.has("skills_to_develop") && (
                    <span className="sc-field-error">Required</span>
                  )}
                </span>
                <textarea
                  className="sc-textarea"
                  placeholder={
                    getPlaceholder("skills_to_develop") || "Enter your answer"
                  }
                  value={form.skills_to_develop}
                  onChange={(e) => setSkillsToDevelop(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#003EA6")}
                  onBlur={(e) => (e.target.style.borderColor = "#D1D5DC")}
                />
              </div>
            </div>

            <div className="sc-footer">
              <button
                className="sc-btn-prev"
                onClick={() => navigate("/survey/job-experience")}
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
                <button className="sc-btn-next" onClick={handleNext}>
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

export default SkillsAndCompetenciesView;