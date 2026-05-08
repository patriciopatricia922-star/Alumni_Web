// Views/ModalResetPasswordView.jsx
import React from 'react';
import lockIcon from '../assets/lock_icn.svg';
import CloseIcon from '../assets/close_icn.svg';

/* ── Lock icon badge ─────────────────────────────── */
const LockIcon = () => (
  <img src={lockIcon} alt="" style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(1)' }} />
);

/* ── Eye icon for password visibility ───────────────────────────── */
const EyeIcon = ({ visible }) => (
  visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"
        fill="#003EA6"
      />
      <circle cx="12" cy="12" r="3.5" fill="#fff" />
      <circle cx="12" cy="12" r="2" fill="#003EA6" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
        fill="#003EA6"
        opacity="0.7"
      />
    </svg>
  )
);

/* ── Check icon for success state ───────────────────────────── */
const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="#003EA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Strength indicator dots ───────────────────────────────── */
const strengthColors = ['rgba(0,62,166,0.2)', '#FF4444', '#FF9500', '#FFD700', '#00C853'];
const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthTextColors = ['transparent', '#FF4444', '#FF9500', '#FFD700', '#00C853'];
const DOTS = 8;

const StrengthRow = ({ strength, newPassword }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: DOTS }).map((_, i) => (
        <div key={i} style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: i < (strength * 2) ? strengthColors[strength] : 'rgba(0,62,166,0.2)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
    {newPassword.length > 0 && (
      <span style={{
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '11px', fontWeight: 600,
        color: strengthTextColors[strength],
        transition: 'color 0.2s',
      }}>
        {strengthLabels[strength]}
      </span>
    )}
  </div>
);

/* ════════════════════════════════════════════════════════════════
   ModalResetPasswordView — pure presentation layer
   Mirrors ModalForgotPasswordView structure
   ════════════════════════════════════════════════════════════════ */
const ModalResetPasswordView = ({
  showNew,
  showConfirm,
  newPassword,
  confirmPassword,
  loading,
  error,
  success,
  strength,
  setShowNew,
  setShowConfirm,
  setNewPassword,
  setConfirmPassword,
  handleReset,
  onClose,
  onBack,
}) => (
  <div
    className="lgn-page-root lgn-page-root--modal"
    style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}
  >
    {/* ════════════════════════════════════════════════════════
        FLOATING CARD — mirrors lgn-floating-card
    ════════════════════════════════════════════════════════ */}
    <div className="lgn-floating-card">

      {/* ── Card header band ─────────────────────────────── */}
      <div className="lgn-card-header">

        {/* Lock icon badge */}
        <div className="lgn-header-icon">
          <LockIcon />
        </div>

        {/* Title + subtitle */}
        <div className="lgn-header-text">
          <h1 className="lgn-header-title">Reset Password</h1>
          <p className="lgn-header-sub">Enter your new password</p>
        </div>

        {/* Close button */}
        <button
          className="lgn-header-close"
          onClick={onClose}
          title="Close"
          aria-label="Close reset password modal"
          style={{
            background: 'none',
            border: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
          }}
          onFocus={e => {
            e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.7)';
            e.currentTarget.style.outlineOffset = '3px';
          }}
          onBlur={e => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          <img src={CloseIcon} alt="" style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(1)' }} />
        </button>
      </div>

      {/* ── Card body ────────────────────────────────────── */}
      <div className="lgn-card-body">

        {success ? (
          /* ── Success state ─────────────────────────────── */
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(0, 62, 166, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckIcon />
            </div>
            <p style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 600, fontSize: '14px', lineHeight: '22px',
              color: '#003EA6', margin: '0 0 8px 0',
            }}>
              Password Reset Successful!
            </p>
            <p style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 400, fontSize: '13px', lineHeight: '20px',
              color: '#4A5565', margin: '0 0 24px 0',
            }}>
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button
              type="button"
              className="lgn-submit-btn"
              onClick={onBack}
            >
              Back to Login
            </button>
          </div>
        ) : (
          /* ── Form state ────────────────────────────────── */
          <>
            {/* Error banner */}
            {error && (
              <div className="lgn-error-banner">
                <p>{error}</p>
              </div>
            )}

            {/* New Password field */}
            <div className="lgn-field">
              <label className="lgn-label">
                New Password
                <span className="lgn-label-required">*</span>
              </label>
              <div className="lgn-pw-wrap">
                <input
                  className={`lgn-input${error ? ' lgn-input--error' : ''}`}
                  type={showNew ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="lgn-eye-btn"
                  onClick={() => setShowNew(v => !v)}
                  tabIndex={-1}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={showNew} />
                </button>
              </div>
              <StrengthRow strength={strength} newPassword={newPassword} />
              <p style={{
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontSize: '11px', lineHeight: '20px',
                color: '#4A5565', margin: '4px 0 0 0',
              }}>
                The password must be at least 8 characters long.
              </p>
            </div>

            {/* Confirm Password field */}
            <div className="lgn-field">
              <label className="lgn-label">
                Confirm New Password
                <span className="lgn-label-required">*</span>
              </label>
              <div className="lgn-pw-wrap">
                <input
                  className={`lgn-input${error ? ' lgn-input--error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="lgn-eye-btn"
                  onClick={() => setShowConfirm(v => !v)}
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
            </div>

            {/* Reset Password button */}
            <button
              type="button"
              className="lgn-submit-btn"
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            {/* Back to Login link */}
            <p className="lgn-footer-text">
              Remember your password?{' '}
              <button
                type="button"
                className="lgn-signup-link"
                onClick={onBack}
              >
                Log in
              </button>
            </p>
          </>
        )}

      </div>{/* /lgn-card-body */}
    </div>{/* /lgn-floating-card */}
  </div>
);

export default ModalResetPasswordView;