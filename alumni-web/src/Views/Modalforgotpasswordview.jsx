// Views/ModalForgotPasswordView.jsx
import React from 'react';
import lockIcon from '../assets/lock_icn.svg';
import CloseIcon from '../assets/close_icn.svg';

/* ── Lock icon badge — matches ModalVerificationView ─────────────── */

/* ── Lock icon (matches header badge aesthetic) ─────────────── */
const LockIcon = () => (
  <img src={lockIcon} alt="" style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(1)' }} />
);

/* ── Check icon for success state ───────────────────────────── */
const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke="#003EA6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   ModalForgotPasswordView — pure presentation layer
   Mirrors LoginView structure: blue header band + white card body
   ════════════════════════════════════════════════════════════════ */
const ModalForgotPasswordView = ({
  email,
  setEmail,
  loading,
  sent,
  error,
  setError,
  handleSubmit,
  onBack,       // goes back to login modal
  onClose,      // closes modal entirely (X button)
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
          <h1 className="lgn-header-title">Forgot Password</h1>
          <p className="lgn-header-sub">Provide your email address</p>
        </div>

        
        <button
          className="lgn-header-close"
          onClick={onClose}
          title="Close"
          aria-label="Close forgot password modal"
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

        {sent ? (
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
              Reset link sent!
            </p>
            <p style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 400, fontSize: '13px', lineHeight: '20px',
              color: '#4A5565', margin: '0 0 24px 0',
            }}>
              Check your email inbox and follow the instructions to reset your password.
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

            {/* Email Address field */}
            <div className="lgn-field">
              <label className="lgn-label">
                Email Address
                <span className="lgn-label-required">*</span>
              </label>
              <input
                className={`lgn-input${error ? ' lgn-input--error' : ''}`}
                type="email"
                placeholder="e.g. name@gmail.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoComplete="email"
              />
            </div>

            {/* Send Code / Reset button */}
            <button
              type="button"
              className="lgn-submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Checking…' : 'Send Code'}
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

export default ModalForgotPasswordView;