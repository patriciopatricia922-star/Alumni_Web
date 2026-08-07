import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/notifications/NotificationBell'; // NEW IMPORT
import '../styles/NotificationBell.css'; // NEW IMPORT

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .ca-root { display: flex; min-height: 100vh; background: #DAE5F1; font-family: 'Arimo', Arial, sans-serif; }
  .ca-content { flex: 1; min-width: 0; margin-left: 229px; }
  .ca-header { position: sticky; top: 0; z-index: 40; background: #DAE5F1; padding-bottom: 16px; }
  .ca-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .ca-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #002263; flex-shrink: 0; }
  .ca-badge { background: #003EA6; border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .ca-bell { width: 48px; height: 48px; background: #003EA6; border: 1.24px solid rgba(255,255,255,0.2); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; transition: all 0.15s; }
  .ca-bell.active { background: #002263; border-color: rgba(0,34,99,0.5); }
  .ca-bell-dot { position: absolute; top: -4.41px; right: -4.41px; width: 28.81px; height: 28.81px; background: rgba(255,0,0,0.7); opacity: 0.42; border-radius: 50%; }
  .ca-bell-count { position: absolute; top: -1px; right: -1px; min-width: 20px; height: 20px; background: rgba(255,0,0,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; font-weight: 400; }
  .ca-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #2D467C; }
  .ca-subtitle { text-align: center; padding: 4px 51px 0; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 16px; line-height: 20px; color: #4A5565; }
  .ca-progress { margin: 12px 51px 0; background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 16px; padding: 18px 30px 16px; }
  .ca-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1E3A5F; }
  .ca-progress-track { width: 100%; height: 12px; background: #E5E7EB; border-radius: 9999px; margin-bottom: 10px; overflow: hidden; }
  .ca-progress-fill { height: 100%; background: #EFC600; border-radius: 9999px; transition: width 0.4s ease; }
  .ca-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 500; color: #4A5565; }
  .ca-body { padding: 24px 51px 60px; }
  .ca-card { background: #FFFFFF; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 36px; }
  .ca-section-title { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 24px; line-height: 30px; color: #003EA6; text-align: center; }
  .ca-section-sub { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; line-height: 20px; color: #003EA6; margin-top: 6px; text-align: center; }
  .ca-fields { display: flex; flex-direction: column; gap: 36px; }
  .ca-field { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .ca-label { font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #003EA6; }
  .ca-textarea { width: 100%; height: 100px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 12px 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; resize: none; transition: border-color 0.15s; }
  .ca-textarea::placeholder { color: rgba(10,10,10,0.3); }
  .ca-textarea:focus { border-color: #003EA6; }
  .ca-radio-group { display: flex; flex-direction: column; gap: 12px; padding-top: 4px; }
  .ca-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; font-weight: 400; color: #4A5565; line-height: 1.4; padding: 2px 0; }
  .ca-radio-label input[type="radio"] { width: 18px; height: 18px; accent-color: #003EA6; cursor: pointer; flex-shrink: 0; }
  .ca-dropdown { position: relative; width: 100%; }
  .ca-dropdown-trigger { width: 100%; height: 47px; background: #F9FAFB; border: 0.8px solid #D1D5DC; border-radius: 10px; padding: 0 16px; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 14px; color: #0A0A0A; outline: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.15s; user-select: none; }
  .ca-dropdown-trigger.open { border-color: #003EA6; }
  .ca-dropdown-menu { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #FFFFFF; border: 1px solid #D1D5DC; border-radius: 10px; max-height: 280px; overflow-y: auto; z-index: 200; padding: 8px 0; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
  .ca-dropdown-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background 0.15s; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 13px; line-height: 20px; color: #0A0A0A; }
  .ca-dropdown-item:hover { background: rgba(0,62,166,0.04); }
  .ca-dropdown-item.selected { background: rgba(0,62,166,0.08); }
  .ca-dropdown-item input[type="checkbox"] { width: 16px; height: 16px; margin-top: 2px; accent-color: #003EA6; flex-shrink: 0; cursor: pointer; }
  .ca-tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .ca-tag { display: flex; align-items: center; gap: 6px; background: rgba(0,62,166,0.08); border: 1px solid rgba(0,62,166,0.2); border-radius: 20px; padding: 5px 12px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #003EA6; }
  .ca-tag-remove { background: none; border: none; cursor: pointer; color: rgba(0,62,166,0.5); font-size: 16px; padding: 0; line-height: 1; }
  .ca-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; }
  .ca-btn-prev { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .ca-btn-prev:hover { background: #002a80; }
  .ca-btn-save { width: 100px; height: 48px; background: #FFFFFF; border: 0.8px solid rgba(0,34,99,0.6); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 8px; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #002263; transition: background 0.15s, border-color 0.15s; }
  .ca-btn-save:hover { background: #f0f4fb; border-color: #002263; }
  .ca-btn-next { width: 120px; height: 48px; background: #003EA6; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0px 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Montserrat', 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 400; color: #FFFFFF; transition: background 0.15s; }
  .ca-btn-next:hover { background: #002a80; }
  .ca-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .ca-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }
  @media (max-width: 1100px) { .ca-topbar { padding: 24px 32px 0; } .ca-title { padding: 14px 32px 0; font-size: 26px; } .ca-subtitle { padding: 4px 32px 0; } .ca-progress { margin: 12px 32px 0; } .ca-body { padding: 20px 32px 60px; } .ca-card { padding: 32px 32px 28px; } }
  @media (max-width: 900px) { .ca-topbar { padding: 20px 24px 0; } .ca-title { padding: 12px 24px 0; font-size: 24px; } .ca-subtitle { padding: 4px 24px 0; } .ca-progress { margin: 10px 24px 0; } .ca-body { padding: 18px 24px 60px; } .ca-card { padding: 28px 24px 24px; gap: 28px; } .ca-fields { gap: 28px; } }
  @media (max-width: 767px) { .ca-content { margin-left: 0; } .ca-topbar { padding: 20px 16px 0; } .ca-badge { padding: 6px 12px; font-size: 10px; } .ca-bell { display: none; } .ca-title { padding: 12px 16px 0; font-size: 20px; } .ca-subtitle { padding: 4px 16px 0; font-size: 14px; } .ca-progress { margin: 10px 16px 0; padding: 14px 16px; } .ca-progress-row { font-size: 13px; } .ca-progress-label { font-size: 13px; } .ca-body { padding: 16px 16px 80px; } .ca-card { padding: 20px 16px 20px; gap: 24px; } .ca-fields { gap: 24px; } .ca-section-title { font-size: 17px; } .ca-btn-prev { width: 100px; height: 44px; font-size: 14px; } .ca-btn-save { width: 80px; height: 44px; font-size: 14px; } .ca-btn-next { width: 100px; height: 44px; font-size: 14px; } }
  @media (max-width: 390px) { .ca-title { font-size: 17px; } .ca-textarea { font-size: 13px; } .ca-btn-prev, .ca-btn-next { width: 90px; font-size: 13px; } .ca-btn-save { width: 70px; font-size: 13px; } }
  @media (max-height: 600px) { .ca-header { padding-bottom: 10px; } .ca-progress { padding: 10px 20px; } .ca-body { padding-top: 14px; } }
`;

const onFocus = e => e.target.style.borderColor = '#003EA6';
const onBlur = e => e.target.style.borderColor = '#D1D5DC';

// Multi-select dropdown component
const MultiSelectDropdown = ({ value, onChange, certifications, placeholder }) => {
  const [open, setOpen] = useState(false);
  const toggle = (cert) => onChange(value.includes(cert) ? value.filter(c => c !== cert) : [...value, cert]);
  const displayText = value.length === 0
    ? placeholder || 'Select a certification'
    : value.length === 1
      ? (value[0].length > 45 ? value[0].slice(0, 45) + '…' : value[0])
      : `${value.length} certifications selected`;
  return (
    <div className="ca-dropdown">
      <div className={`ca-dropdown-trigger${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span style={{ color: value.length === 0 ? 'rgba(10,10,10,0.3)' : '#0A0A0A' }}>{displayText}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M1 1L6 7L11 1" stroke="#00226D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <div className="ca-dropdown-menu">
          {certifications.map(cert => (
            <label key={cert} className={`ca-dropdown-item${value.includes(cert) ? ' selected' : ''}`}>
              <input type="checkbox" checked={value.includes(cert)} onChange={() => toggle(cert)} />{cert}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CertificationAchievementView = ({
  form, set, setCertiportPasser, setHelpedCareer,
  errors, saveToast, cardRef,
  formPct, currentSection, totalSections,
  certifications, yesNoOptions,
  getLabel, getPlaceholder,
  handleSave, handleNext,
  onBack,
  navigate,
}) => {
  const showCertFields = form.certiport_passer === 'Yes';
  const showHowHelped = showCertFields && form.helped_career === 'Yes';

  return (
    <>
      <style>{STYLES}</style>
      <div className="ca-root">
        <Sidebar />
        <div className="ca-content">
          <div className="ca-header">
            <div className="ca-topbar">
              <button className="ca-back-btn" onClick={onBack}>
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

              <div style={{ position: "relative", flexShrink: 0 }}>
                <NotificationBell onSeeAll={() => navigate("/notifications")} />
              </div>
            </div>

            <h1 className="ca-title">Alumni Tracer Survey</h1>
            <p className="ca-subtitle">
              Please complete all sections to update your alumni status.
            </p>

            <div className="ca-progress">
              <div className="ca-progress-row">
                <span>
                  Section {currentSection} of {totalSections}
                </span>
                <span style={{ color: "#003EA6", fontWeight: 700 }}>
                  {formPct}% Complete
                </span>
              </div>
              <div className="ca-progress-track">
                <div
                  className="ca-progress-fill"
                  style={{ width: `${formPct}%` }}
                />
              </div>
              <span className="ca-progress-label">
                Certification Achievement
              </span>
            </div>
          </div>

          <div className="ca-body">
            <div className="ca-card" ref={cardRef}>
              <div>
                <h2 className="ca-section-title">Certification Achievement</h2>
                <p className="ca-section-sub">Certifications you have</p>
              </div>

              <div className="ca-fields">
                <div className="ca-field">
                  <label className="ca-label">
                    {getLabel("certiport_passer")}{" "}
                    <span className="ca-req">*</span>
                    {errors.has("certiport_passer") && (
                      <span className="ca-field-error">Required</span>
                    )}
                  </label>
                  <div className="ca-radio-group">
                    {yesNoOptions.map((opt) => (
                      <label key={opt} className="ca-radio-label">
                        <input
                          type="radio"
                          name="certiport_passer"
                          value={opt}
                          checked={form.certiport_passer === opt}
                          onChange={() => setCertiportPasser(opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {showCertFields && (
                  <>
                    <div className="ca-field">
                      <label className="ca-label">
                        {getLabel("certifications")}{" "}
                        <span className="ca-req">*</span>
                        {errors.has("certifications") && (
                          <span className="ca-field-error">Required</span>
                        )}
                      </label>
                      <MultiSelectDropdown
                        value={form.certifications}
                        onChange={(v) => set("certifications", v)}
                        certifications={certifications}
                        placeholder={
                          getPlaceholder("certifications") ||
                          "Select a certification"
                        }
                      />
                    </div>

                    {form.certifications.length > 0 && (
                      <div className="ca-tags">
                        {form.certifications.map((cert) => (
                          <div key={cert} className="ca-tag">
                            <span>
                              {cert.length > 40
                                ? cert.slice(0, 40) + "…"
                                : cert}
                            </span>
                            <button
                              className="ca-tag-remove"
                              onClick={() =>
                                set(
                                  "certifications",
                                  form.certifications.filter((c) => c !== cert),
                                )
                              }
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="ca-field">
                      <label className="ca-label">
                        {getLabel("helped_career")}{" "}
                        <span className="ca-req">*</span>
                        {errors.has("helped_career") && (
                          <span className="ca-field-error">Required</span>
                        )}
                      </label>
                      <div className="ca-radio-group">
                        {yesNoOptions.map((opt) => (
                          <label key={opt} className="ca-radio-label">
                            <input
                              type="radio"
                              name="helped_career"
                              value={opt}
                              checked={form.helped_career === opt}
                              onChange={() => setHelpedCareer(opt)}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    {showHowHelped && (
                      <div className="ca-field">
                        <label className="ca-label">
                          {getLabel("how_helped")}{" "}
                          <span className="ca-req">*</span>
                          {errors.has("how_helped") && (
                            <span className="ca-field-error">Required</span>
                          )}
                        </label>
                        <textarea
                          className="ca-textarea"
                          placeholder={
                            getPlaceholder("how_helped") ||
                            "Please describe how your certifications have helped your career"
                          }
                          value={form.how_helped}
                          onChange={(e) => set("how_helped", e.target.value)}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="ca-footer">
                <button
                  className="ca-btn-prev"
                  onClick={() => navigate("/survey/educational-background")}
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
                  <button className="ca-btn-next" onClick={handleNext}>
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
};

export default CertificationAchievementView;