import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SignupIcon from '../assets/camera_icn.svg';
import '../styles/Signup.css';
import TermsModal         from '../modals/TermsModal';
import PrivacyPolicyModal from '../modals/PrivacyPolicyModal';

/* ── Eye icon ────────────────────────────────────────────────── */
const EyeIcon = ({ visible }) =>
  visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"
        fill="#003EA6" />
      <circle cx="12" cy="12" r="3.5" fill="#fff" />
      <circle cx="12" cy="12" r="2" fill="#003EA6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
        fill="#003EA6" opacity="0.7" />
    </svg>
  );

/* ── Field label with optional required star + inline error ─── */
const FieldLabel = ({ text, required, error, showError }) => (
  <label className="sup-label">
    {text}
    {required && <span className="sup-label-required">*</span>}
    {showError && error && (
      <span className="sup-label-error">— {error}</span>
    )}
  </label>
);

/* ── Password strength indicator ──────────────────────────────── */
const PasswordStrength = ({ password, strength }) => {
  if (!password) return null;
  const criteria = [
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number',    met: /[0-9]/.test(password) },
    { label: 'Symbol',    met: /[^A-Za-z0-9]/.test(password) },
    { label: '8+ chars',  met: password.length >= 8 },
  ];
  return (
    <div className="sup-pw-strength">
      <div className="sup-pw-bars">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="sup-pw-bar"
            style={{ background: i <= strength.level ? strength.color : 'rgba(0,0,0,0.1)' }}
          />
        ))}
      </div>
      <div className="sup-pw-meta">
        <span className="sup-pw-level-label" style={{ color: strength.color }}>
          {strength.label}
        </span>
        <div className="sup-pw-criteria">
          {criteria.map(c => (
            <span
              key={c.label}
              className="sup-pw-criterion"
              style={{ color: c.met ? '#22C55E' : 'rgba(0,0,0,0.3)' }}
            >
              <span style={{ fontSize: '9px' }}>{c.met ? '✓' : '○'}</span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   SignupView — pure presentation layer
   Props mirror the pattern used in IDRegistrationView.
   ════════════════════════════════════════════════════════════════ */
const SignupView = ({
  form,
  idData,
  error,
  fieldErrors,
  touched,
  loading,
  agreed,
  showPassword,
  showConfirmPassword,
  passwordStrength,
  setAgreed,
  setShowPassword,
  setShowConfirmPassword,
  handleChange,
  handleBlur,
  handleSignup,
  // Modal-context props (optional)
  isModal = false,
  onClose,
  onSwitchToLogin,
}) => {
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | null

  /* Derived: button is active only when form is complete enough */
  const canSubmit = !loading;

  return (
    <>
      {/*
        sup-page-root:
          • Full-page route  → dark blue backdrop, fills viewport (default)
          • Modal context    → transparent, no min-height
      */}
      <div
        className={`sup-page-root${isModal ? ' sup-page-root--modal' : ''}`}
        style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}
      >

        {/* Back link — full-page route only */}
        {!isModal && (
          <div className="sup-back">
            <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12"
                  stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
            </Link>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MAIN FLOATING CARD — mirrors aid-floating-card layout
        ══════════════════════════════════════════════════════════ */}
        <div className="sup-floating-card">

          {/* ── Card header band ─────────────────────────────────── */}
          <div className="sup-card-header">

            {/* Sign-up icon badge */}
            <div className="sup-header-icon">
              {SignupIcon ? (
                <img src={SignupIcon} alt="" style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(1)' }} />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                    fill="#FFFFFF" />
                </svg>
              )}
            </div>

            {/* Title + subtitle */}
            <div className="sup-header-text">
              <h1 className="sup-header-title">Alumni Registration</h1>
              <p className="sup-header-sub">Create your account to join</p>
            </div>

            {/* Close button */}
            {isModal ? (
              <button
                className="sup-header-close"
                onClick={onClose}
                title="Close"
                aria-label="Close registration modal"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            ) : (
              <Link to="/register" className="sup-header-close" title="Back" aria-label="Go back">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Link>
            )}
          </div>

          {/* ── Card body ────────────────────────────────────────── */}
          <div className="sup-card-body">

            {/* Global error banner */}
            {error && (
              <div className="sup-error-banner">
                <p>{error}</p>
              </div>
            )}

            {/* ── SECTION: Personal Details ──────────────────────── */}
            <div className="sup-section">
              <h2 className="sup-section-label">Personal Details</h2>

              {/* Last Name */}
              <div className="sup-field">
                <FieldLabel
                  text="Last Name"
                  required
                  error="Required"
                  showError={touched.lastName && !form.lastName}
                />
                <input
                  className="sup-input"
                  placeholder="e.g. Dela Cruz"
                  value={form.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  autoComplete="family-name"
                />
              </div>

              {/* First Name + Middle Name side-by-side */}
              <div className="sup-field-row">
                <div className="sup-field">
                  <FieldLabel
                    text="First Name"
                    required
                    error="Required"
                    showError={touched.firstName && !form.firstName}
                  />
                  <input
                    className="sup-input"
                    placeholder="e.g. Juan"
                    value={form.firstName}
                    onChange={e => handleChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    autoComplete="given-name"
                  />
                </div>
                <div className="sup-field">
                  <label className="sup-label">Middle Name</label>
                  <input
                    className="sup-input"
                    placeholder="e.g. Mendoza"
                    value={form.middleName}
                    onChange={e => handleChange('middleName', e.target.value)}
                    autoComplete="additional-name"
                  />
                </div>
              </div>
            </div>

            <hr className="sup-divider" />

            {/* ── SECTION: Academic Information ─────────────────── */}
            <div className="sup-section">
              <h2 className="sup-section-label">Academic Information</h2>

              {/* Academic Program (read-only, pre-filled from ID) */}
              <div className="sup-field">
                <FieldLabel text="Academic Program" required />
                <input
                  className="sup-input sup-input--readonly"
                  placeholder="e.g. BSCS"
                  value={idData?.program || ''}
                  readOnly
                  style={{ color: idData?.program ? '#0A0A0A' : 'rgba(10,10,10,0.5)' }}
                />
              </div>

              {/* Year Graduated (read-only, pre-filled from ID) */}
              <div className="sup-field">
                <FieldLabel text="Year Graduated" required />
                <input
                  className="sup-input sup-input--readonly"
                  placeholder="e.g. 2025"
                  value={idData?.batchYear || ''}
                  readOnly
                  style={{ color: idData?.batchYear ? '#0A0A0A' : 'rgba(10,10,10,0.5)' }}
                />
              </div>
            </div>

            <hr className="sup-divider" />

            {/* ── SECTION: Account Security ──────────────────────── */}
            <div className="sup-section">
              <h2 className="sup-section-label">Account Security</h2>

              {/* Email Address */}
              <div className="sup-field">
                <FieldLabel
                  text="Email Address"
                  required
                  error={touched.email && !form.email ? 'Required' : fieldErrors.email}
                  showError={touched.email && (!form.email || !!fieldErrors.email)}
                />
                <input
                  className={`sup-input${touched.email && fieldErrors.email ? ' sup-input--error' : ''}`}
                  type="email"
                  placeholder="e.g. name@gmail.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="sup-field">
                <FieldLabel
                  text="Password"
                  required
                  error={touched.password && !form.password ? 'Required' : fieldErrors.password}
                  showError={touched.password && (!form.password || !!fieldErrors.password)}
                />
                <div className="sup-pw-wrap">
                  <input
                    className="sup-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="sup-eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
                <PasswordStrength password={form.password} strength={passwordStrength} />
                <p className="sup-pw-hint">
                  The password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character (e.g., !@#$%^&*).
                </p>
              </div>

              {/* Confirm Password */}
              <div className="sup-field">
                <FieldLabel
                  text="Confirm Password"
                  required
                  error={touched.confirmPassword && !form.confirmPassword ? 'Required' : fieldErrors.confirmPassword}
                  showError={touched.confirmPassword && (!form.confirmPassword || !!fieldErrors.confirmPassword)}
                />
                <div className="sup-pw-wrap">
                  <input
                    className={`sup-input${touched.confirmPassword && fieldErrors.confirmPassword ? ' sup-input--error' : ''}`}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="sup-eye-btn"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
                <p className="sup-pw-hint">
                  The password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character (e.g., !@#$%^&*).
                </p>
              </div>
            </div>

            {/* ── Terms checkbox ─────────────────────────────────── */}
            <div className="sup-terms-row">
              <input
                type="checkbox"
                id="sup-terms-id"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="sup-checkbox"
              />
              <label htmlFor="sup-terms-id" className="sup-terms-label">
                I agree to the{' '}
                <button type="button" className="sup-legal-btn" onClick={() => setLegalModal('terms')}>
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="sup-legal-btn" onClick={() => setLegalModal('privacy')}>
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* ── Create Account button ──────────────────────────── */}
            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              className={`sup-submit-btn${loading ? ' sup-submit-btn--loading' : canSubmit ? ' sup-submit-btn--active' : ''}`}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>

            {/* ── Footer link ────────────────────────────────────── */}
            <p className="sup-footer-text">
              Already have an account?{' '}
              {isModal ? (
                <button type="button" onClick={onSwitchToLogin} className="sup-login-link">Log in</button>
              ) : (
                <Link to="/login" className="sup-login-link">Log in</Link>
              )}
            </p>

          </div>{/* /sup-card-body */}
        </div>{/* /sup-floating-card */}
      </div>

      {/* ── Legal modals — above everything ───────────────────── */}
      {legalModal === 'terms'   && <TermsModal         onClose={() => setLegalModal(null)} />}
      {legalModal === 'privacy' && <PrivacyPolicyModal  onClose={() => setLegalModal(null)} />}
    </>
  );
};

export default SignupView;