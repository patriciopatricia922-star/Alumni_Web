/**
 * PersonalBackgroundViewSHS.jsx — Rendering Layer (v4, locked pre-fill fields)
 * Location: src/surveyshs/views/PersonalBackgroundViewSHS.jsx
 */

import React from 'react';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/notifications/NotificationBell';
import '../styles/NotificationBell.css';
import '../styles/PersonalBackgroundSHS.css';

const BackArrow = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
      stroke="#002263"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PersonalBackgroundViewSHS = ({
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
  lockedFields,
  navigate,
}) => {
  const isLocked = (key) => !!lockedFields && lockedFields.has(key);

  return (
  <div className="shs-pb-root">
    <Sidebar />
    <div className="shs-pb-content">

      <div className="shs-pb-header">
        <div className="shs-pb-topbar">

          <button
            className="shs-pb-back-btn"
            onClick={onBack}
          >
            <BackArrow />
            Back
          </button>

          <div style={{ position: "relative", flexShrink: 0 }}>
          <NotificationBell
            onSeeAll={() => navigate("/notifications")}
          />
        </div>
        </div>

        <h1 className="shs-pb-title">Alumni Tracer Survey</h1>
        <p className="shs-pb-subtitle">
          Please complete all sections to update your alumni status.
        </p>

        <div className="shs-pb-progress">
          <div className="shs-pb-progress-row">
            <span>
              Section {currentSection} of {totalSections}
            </span>
            <span style={{ color: '#003EA6', fontWeight: 700 }}>
              {formPct}% Complete
            </span>
          </div>
          <div className="shs-pb-progress-track">
            <div
              className="shs-pb-progress-fill"
              style={{ width: `${formPct}%` }}
            />
          </div>
          <span className="shs-pb-progress-label">Personal Background</span>
        </div>
      </div>

      <div className="shs-pb-body">
        <div className="shs-pb-card" ref={cardRef}>

          <div>
            <h2 className="shs-pb-section-title">Personal Information</h2>
            <p className="shs-pb-section-sub">Basic information about you</p>
          </div>

          <div className="shs-pb-fields">

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('last_name')} <span className="shs-pb-req">*</span>
                {errors.has('last_name') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <input
                className="shs-pb-input"
                placeholder={getPlaceholder('last_name')}
                value={form.last_name}
                onChange={set('last_name')}
                readOnly={isLocked('last_name')}
                style={isLocked('last_name') ? { cursor: 'default' } : undefined}
              />
            </div>

            <div className="shs-pb-row">
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('first_name')} <span className="shs-pb-req">*</span>
                  {errors.has('first_name') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('first_name')}
                  value={form.first_name}
                  onChange={set('first_name')}
                  readOnly={isLocked('first_name')}
                  style={isLocked('first_name') ? { cursor: 'default' } : undefined}
                />
              </div>
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('middle_name')}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('middle_name')}
                  value={form.middle_name}
                  onChange={set('middle_name')}
                  readOnly={isLocked('middle_name')}
                  style={isLocked('middle_name') ? { cursor: 'default' } : undefined}
                />
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('gender')} <span className="shs-pb-req">*</span>
                {errors.has('gender') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <div className="shs-pb-radio-group">
                {(
                  questionOptions['gender'] || ['Male', 'Female', 'Other']
                ).map((opt) => (
                  <label key={opt} className="shs-pb-radio-label">
                    <input
                      type="radio"
                      name="shs_gender"
                      value={opt}
                      checked={form.gender === opt}
                      onChange={() => setRadio('gender')(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('birthday')} <span className="shs-pb-req">*</span>
                {errors.has('birthday') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <input
                type="date"
                className="shs-pb-input"
                value={form.birthday}
                onChange={set('birthday')}
                style={{ colorScheme: 'light' }}
              />
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('street_address')} <span className="shs-pb-req">*</span>
                {errors.has('street_address') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <input
                className="shs-pb-input"
                placeholder={getPlaceholder('street_address')}
                value={form.street_address}
                onChange={set('street_address')}
              />
            </div>

            <div className="shs-pb-row">
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('city')} <span className="shs-pb-req">*</span>
                  {errors.has('city') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('city')}
                  value={form.city}
                  onChange={set('city')}
                />
              </div>
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('province')} <span className="shs-pb-req">*</span>
                  {errors.has('province') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('province')}
                  value={form.province}
                  onChange={set('province')}
                />
              </div>
            </div>

            <div className="shs-pb-row">
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('zip_code')} <span className="shs-pb-req">*</span>
                  {errors.has('zip_code') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('zip_code')}
                  value={form.zip_code}
                  onChange={set('zip_code')}
                />
              </div>
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('country')} <span className="shs-pb-req">*</span>
                  {errors.has('country') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <select
                  className="shs-pb-input shs-pb-input-select"
                  value={form.country}
                  onChange={setCountry}
                >
                  <option value="" disabled>Select</option>
                  {(questionOptions['country'] || ['Philippines', 'United States', 'Other']).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('contact_number')} <span className="shs-pb-req">*</span>
                {errors.has('contact_number') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <div className="shs-pb-phone-row">
                {form.country === 'Other' ? (
                  <input
                    className="shs-pb-input"
                    style={{ width: '68px', flexShrink: 0, padding: '12px 8px', textAlign: 'center' }}
                    value={form.phone_prefix}
                    onChange={set('phone_prefix')}
                    placeholder="+"
                    maxLength={5}
                  />
                ) : (
                  <div className="shs-pb-phone-prefix">{form.phone_prefix || '+63'}</div>
                )}
                <input
                  type="tel"
                  className="shs-pb-input shs-pb-phone-input"
                  placeholder={getPlaceholder('contact_number')}
                  value={form.contact_number}
                  onChange={set('contact_number')}
                />
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('email')} <span className="shs-pb-req">*</span>
                {errors.has('email') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <input
                type="email"
                className="shs-pb-input"
                placeholder={getPlaceholder('email')}
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('track_strand')} <span className="shs-pb-req">*</span>
                {errors.has('track_strand') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <div className="shs-pb-radio-group">
                {(
                  questionOptions['track_strand'] || ['STEM', 'HUMSS', 'ABM']
                ).map((opt) => {
                  const locked = isLocked('track_strand');
                  return (
                    <label key={opt} className="shs-pb-radio-label">
                      <input
                        type="radio"
                        name="shs_track_strand"
                        value={opt}
                        checked={form.track_strand === opt}
                        disabled={locked}
                        onChange={() => !locked && setRadio('track_strand')(opt)}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('year_graduated')} <span className="shs-pb-req">*</span>
                {errors.has('year_graduated') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <div className="shs-pb-radio-group">
                {(
                  questionOptions['year_graduated'] || [
                    'Batch 2022',
                    'Batch 2023',
                    'Batch 2024',
                    'Batch 2025',
                    'Batch 2026',
                    'Batch 2027',
                  ]
                ).map((opt) => {
                  const locked = isLocked('year_graduated');
                  return (
                    <label key={opt} className="shs-pb-radio-label">
                      <input
                        type="radio"
                        name="shs_year_graduated"
                        value={opt}
                        checked={form.year_graduated === opt}
                        disabled={locked}
                        onChange={() => !locked && setRadio('year_graduated')(opt)}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="shs-pb-footer">
            {saveToast && (
              <span className="shs-pb-save-toast">Progress saved</span>
            )}
            <button className="shs-pb-btn-next" onClick={handleNext}>
              Next
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
  );
};

export default PersonalBackgroundViewSHS;