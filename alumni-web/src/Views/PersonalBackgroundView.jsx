/**
 * PersonalBackgroundView.jsx — Rendering Layer (v2, back-navigation guard)
 * Location: src/Views/PersonalBackgroundView.jsx
 *
 * CHANGED in v2:
 *   - Back button onClick changed from `() => navigate('/dashboard')`
 *     to `() => onBack()`.
 *   - New `onBack` prop accepted (supplied by PersonalBackground.jsx v5
 *     via useSurveyBackGuard).
 *   - navigate prop is still accepted and forwarded (used by the
 *     notification dropdown's "See all notifications" link).
 *   - No other changes. All styles and form fields are identical to v1.
 */

import React from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/notifications/NotificationBell'; 
import '../styles/NotificationBell.css';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pb-root {
    display: flex;
    min-height: 100vh;
    background: #DAE5F1;
    font-family: 'Montserrat', Arial, sans-serif;
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
    background: #DAE5F1;
    padding-bottom: 16px;
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
    color: #002263;
    flex-shrink: 0;
  }

  .pb-badge {
    background: #003EA6;
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
    background: #003EA6;
    border: 1.24px solid rgba(255,255,255,0.2);
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
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
    background: #002263;
    border-color: rgba(0,34,99,0.5);
  }

  .pb-bell-dot {
    position: absolute;
    top: -4.41px; right: -4.41px;
    width: 28.81px; height: 28.81px;
    background: rgba(255, 0, 0, 0.7);
    opacity: 0.42;
    border-radius: 50%;
  }

  .pb-bell-count {
    position: absolute;
    top: -1px; right: -1px;
    min-width: 20px; height: 20px;
    background: rgba(255, 0, 0, 0.7);
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
    color: #2D467C;
  }

  .pb-subtitle {
    text-align: center;
    padding: 4px 51px 0;
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    color: #4A5565;
  }

  .pb-progress {
    margin: 12px 51px 0;
    background: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    padding: 18px 30px 16px;
  }

  .pb-progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #1E3A5F;
  }

  .pb-progress-track {
    width: 100%;
    height: 12px;
    background: #E5E7EB;
    border-radius: 9999px;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .pb-progress-fill {
    height: 100%;
    background: #EFC600;
    border-radius: 9999px;
    transition: width 0.4s ease;
  }

  .pb-progress-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #4A5565;
  }

  .pb-body {
    padding: 24px 51px 60px;
  }

  .pb-card {
    background: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 25px;
    padding: 32px 32px 32px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .pb-section-title {
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 24px;
    line-height: 30px;
    color: #003EA6;
    text-align: center;
  }

  .pb-section-sub {
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: #003EA6;
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
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: #003EA6;
  }

  .pb-input {
    width: 100%;
    height: 47px;
    background: #F9FAFB;
    border: 0.8px solid #D1D5DC;
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: #0A0A0A;
    outline: none;
    transition: border-color 0.15s;
  }
  .pb-input::placeholder {
    color: rgba(10, 10, 10, 0.3);
  }
  .pb-input:focus { border-color: #003EA6; }
  .pb-input option { background: #F9FAFB; color: #0A0A0A; }

  .pb-input-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%2300226D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
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
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: #4A5565;
    line-height: 1.4;
  }

  .pb-radio-label input[type="radio"] {
    width: 16px; height: 16px;
    accent-color: #003EA6;
    cursor: pointer;
    flex-shrink: 0;
  }

  .pb-select-other {
    margin-top: 10px;
  }

  .pb-phone-row {
    display: flex;
    gap: 12px;
  }

  .pb-phone-prefix {
    width: 58px; height: 47px;
    flex-shrink: 0;
    background: #F9FAFB;
    border: 0.8px solid #D1D5DC;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: rgba(10, 10, 10, 0.3);
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
    width: 100px;
    height: 45px;
    background: #FFFFFF;
    border: 0.8px solid rgba(0, 34, 99, 0.6);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 16px;
    color: #002263;
    transition: border-color 0.15s, background 0.15s;
  }
  .pb-btn-save:hover { background: #f0f4fb; border-color: #002263; }

  .pb-btn-next {
    width: 100px;
    height: 45px;
    background: #003EA6;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 16px;
    color: #FFFFFF;
    transition: background 0.15s;
  }
  .pb-btn-next:hover { background: #002a80; }

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
  form,
  set,
  setRadio,
  setCountry,
  errors,
  saveToast,
  cardRef,
  formPct,
  currentSection,
  totalSections,
  handleSave,
  handleNext,
  onBack,
  getLabel,
  getPlaceholder,
  questionOptions,
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
            {/* ── CHANGED: onClick now calls onBack() instead of navigate('/dashboard') ── */}
            <button className="pb-back-btn" onClick={onBack}>
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

            {/* ── Bell ──────────────────────────────────────────────────────── */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <NotificationBell
                onSeeAll={() => navigate("/notifications")}
              />
            </div>
          </div>

          <h1 className="pb-title">Alumni Tracer Survey</h1>
          <p className="pb-subtitle">
            Please complete all sections to update your alumni status.
          </p>

          <div className="pb-progress">
            <div className="pb-progress-row">
              <span>
                Section {currentSection} of {totalSections}
              </span>
              <span style={{ color: "#003EA6", fontWeight: 700 }}>
                {formPct}% Complete
              </span>
            </div>
            <div className="pb-progress-track">
              <div
                className="pb-progress-fill"
                style={{ width: `${formPct}%` }}
              />
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
                  {getLabel("last_name")} <span className="pb-req">*</span>
                  {errors.has("last_name") && (
                    <span className="pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="pb-input"
                  placeholder={getPlaceholder("last_name")}
                  value={form.last_name}
                  onChange={set("last_name")}
                />
              </div>

              <div className="pb-row">
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel("first_name")} <span className="pb-req">*</span>
                    {errors.has("first_name") && (
                      <span className="pb-field-error">Required</span>
                    )}
                  </label>
                  <input
                    className="pb-input"
                    placeholder={getPlaceholder("first_name")}
                    value={form.first_name}
                    onChange={set("first_name")}
                  />
                </div>
                <div className="pb-field">
                  <label className="pb-label">{getLabel("middle_name")}</label>
                  <input
                    className="pb-input"
                    placeholder={getPlaceholder("middle_name")}
                    value={form.middle_name}
                    onChange={set("middle_name")}
                  />
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">{getLabel("student_number")}</label>
                <input
                  className="pb-input"
                  placeholder={getPlaceholder("student_number")}
                  value={form.student_number}
                  onChange={set("student_number")}
                />
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel("gender")} <span className="pb-req">*</span>
                  {errors.has("gender") && (
                    <span className="pb-field-error">Required</span>
                  )}
                </label>
                <div className="pb-radio-group">
                  {(
                    questionOptions["gender"] || [
                      "Male",
                      "Female",
                      "Prefer not to say",
                    ]
                  ).map((opt) => (
                    <label key={opt} className="pb-radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value={opt}
                        checked={form.gender === opt}
                        onChange={() => setRadio("gender")(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel("birthday")} <span className="pb-req">*</span>
                  {errors.has("birthday") && (
                    <span className="pb-field-error">Required</span>
                  )}
                </label>
                <input
                  type="date"
                  className="pb-input"
                  value={form.birthday}
                  onChange={set("birthday")}
                  style={{ colorScheme: "light" }}
                />
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel("civil_status")} <span className="pb-req">*</span>
                  {errors.has("civil_status") && (
                    <span className="pb-field-error">Required</span>
                  )}
                </label>
                <div className="pb-radio-group">
                  {(
                    questionOptions["civil_status"] || [
                      "Single",
                      "Married",
                      "Widowed",
                    ]
                  ).map((opt) => (
                    <label key={opt} className="pb-radio-label">
                      <input
                        type="radio"
                        name="civil_status"
                        value={opt}
                        checked={form.civil_status === opt}
                        onChange={() => setRadio("civil_status")(opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel("street_address")} <span className="pb-req">*</span>
                  {errors.has("street_address") && (
                    <span className="pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="pb-input"
                  placeholder={getPlaceholder("street_address")}
                  value={form.street_address}
                  onChange={set("street_address")}
                />
              </div>

              <div className="pb-row">
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel("city")} <span className="pb-req">*</span>
                    {errors.has("city") && (
                      <span className="pb-field-error">Required</span>
                    )}
                  </label>
                  <input
                    className="pb-input"
                    placeholder={getPlaceholder("city")}
                    value={form.city}
                    onChange={set("city")}
                  />
                </div>
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel("province")} <span className="pb-req">*</span>
                    {errors.has("province") && (
                      <span className="pb-field-error">Required</span>
                    )}
                  </label>
                  <input
                    className="pb-input"
                    placeholder={getPlaceholder("province")}
                    value={form.province}
                    onChange={set("province")}
                  />
                </div>
              </div>

              <div className="pb-row">
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel("zip_code")} <span className="pb-req">*</span>
                    {errors.has("zip_code") && (
                      <span className="pb-field-error">Required</span>
                    )}
                  </label>
                  <input
                    className="pb-input"
                    placeholder={getPlaceholder("zip_code")}
                    value={form.zip_code}
                    onChange={set("zip_code")}
                  />
                </div>
                <div className="pb-field">
                  <label className="pb-label">
                    {getLabel("country")} <span className="pb-req">*</span>
                    {errors.has("country") && (
                      <span className="pb-field-error">Required</span>
                    )}
                  </label>
                  <select
                    className="pb-input pb-input-select"
                    value={form.country}
                    onChange={setCountry}
                  >
                    <option
                      value=""
                      disabled
                      style={{
                        background: "#F9FAFB",
                        color: "rgba(10,10,10,0.3)",
                      }}
                    >
                      Select
                    </option>
                    {(
                      questionOptions["country"] || [
                        "Philippines",
                        "United States",
                        "Other",
                      ]
                    ).map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        style={{ background: "#F9FAFB", color: "#0A0A0A" }}
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                  {form.country === "Other" && (
                    <input
                      className="pb-input pb-select-other"
                      placeholder="Please specify your country"
                      value={form.country_other || ""}
                      onChange={set("country_other")}
                    />
                  )}
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel("contact_number")} <span className="pb-req">*</span>
                  {errors.has("contact_number") && (
                    <span className="pb-field-error">Required</span>
                  )}
                </label>
                <div className="pb-phone-row">
                  {form.country === "Other" ? (
                    <input
                      className="pb-input"
                      style={{
                        width: "68px",
                        flexShrink: 0,
                        padding: "12px 8px",
                        textAlign: "center",
                      }}
                      value={form.phone_prefix}
                      onChange={(e) => set("phone_prefix")(e)}
                      placeholder="+"
                      maxLength={5}
                    />
                  ) : (
                    <div className="pb-phone-prefix">
                      {form.phone_prefix || "+63"}
                    </div>
                  )}
                  <input
                    type="tel"
                    className="pb-input pb-phone-input"
                    placeholder={getPlaceholder("contact_number")}
                    value={form.contact_number}
                    onChange={set("contact_number")}
                  />
                </div>
              </div>

              <div className="pb-field">
                <label className="pb-label">
                  {getLabel("email")} <span className="pb-req">*</span>
                  {errors.has("email") && (
                    <span className="pb-field-error">Required</span>
                  )}
                </label>
                <input
                  type="email"
                  className="pb-input"
                  placeholder={getPlaceholder("email")}
                  value={form.email}
                  onChange={set("email")}
                />
              </div>
            </div>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <div className="pb-footer">
              {saveToast && (
                <span
                  style={{
                    fontFamily: "Arimo, Arial",
                    fontSize: "13px",
                    color: "#15803d",
                    marginRight: "auto",
                  }}
                >
                  Progress saved
                </span>
              )}
              {/* <button className="pb-btn-save" onClick={handleSave}>Save</button> */}
              <button className="pb-btn-next" onClick={handleNext}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default PersonalBackgroundView;