import React from 'react';
import { Link } from 'react-router-dom';
import LoginIcon from '../assets/login_ic.svg';
import '../styles/Login.css';

/* ── Eye icon (dark variant for white card) ──────────────────── */
const EyeIcon = ({ visible }) =>
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
  );

/* ── Google colour SVG ───────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#F44336" d="M24 9.5c3.1 0 5.8 1.1 7.9 2.9l5.9-5.9C34.3 3.5 29.4 1.5 24 1.5 15.1 1.5 7.5 6.8 4.1 14.3l6.9 5.4C12.7 13.6 17.9 9.5 24 9.5z" />
    <path fill="#4CAF50" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.2z" opacity=".99" />
    <path fill="#FFC107" d="M11 28.3c-.5-1.4-.8-2.8-.8-4.3s.3-2.9.8-4.3l-6.9-5.4C2.5 17.1 1.5 20.4 1.5 24s1 6.9 2.6 9.7l6.9-5.4z" />
    <path fill="#1565C0" d="M24 46.5c5.4 0 10-1.8 13.3-4.8l-7-5.4c-1.8 1.2-4 1.9-6.3 1.9-6.1 0-11.3-4.1-13.1-9.6l-6.9 5.4C7.5 41.2 15.1 46.5 24 46.5z" opacity=".99" />
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   LoginView — pure presentation layer
   Mirrors IDRegistrationView / SignupView structure exactly.
   ════════════════════════════════════════════════════════════════ */
const LoginView = ({
  form,
  set,
  error,
  loading,
  showPassword,
  setShowPassword,
  handleLogin,
  handleGoogleLogin,
  // Modal-context props (optional)
  isModal = false,
  onClose,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) => (
  <div
    className={`lgn-page-root${isModal ? ' lgn-page-root--modal' : ''}`}
    style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}
  >

    {/* Back link — full-page route only */}
    {!isModal && (
      <div className="lgn-back">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12"
              stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
        </Link>
      </div>
    )}

    {/* ════════════════════════════════════════════════════════
        MAIN FLOATING CARD — mirrors aid-floating-card / sup-floating-card
    ════════════════════════════════════════════════════════ */}
    <div className="lgn-floating-card">

      {/* ── Card header band ─────────────────────────────────── */}
      <div className="lgn-card-header">

        {/* Login icon badge */}
        <div className="lgn-header-icon">
          {LoginIcon ? (
            <img
              src={LoginIcon}
              alt=""
              style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(1)' }}
            />
          ) : (
            /* Fallback key icon */
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Title + subtitle */}
        <div className="lgn-header-text">
          <h1 className="lgn-header-title">Welcome Back</h1>
          <p className="lgn-header-sub">Please enter your details to log in</p>
        </div>

        {/* Close / back button */}
        {isModal ? (
          <button
            className="lgn-header-close"
            onClick={onClose}
            title="Close"
            aria-label="Close login modal"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <Link to="/" className="lgn-header-close" title="Back" aria-label="Go back">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
        )}
      </div>

      {/* ── Card body ────────────────────────────────────────── */}
      <div className="lgn-card-body">

        {/* Error banner */}
        {error && (
          <div className="lgn-error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* ── Continue with Google ──────────────────────────── */}
        <button
          type="button"
          className="lgn-google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          <span className="lgn-google-label">Continue with Google</span>
        </button>

        {/* ── OR divider ───────────────────────────────────── */}
        <div className="lgn-or-row">
          <hr className="lgn-or-line" />
          <span className="lgn-or-label">OR</span>
          <hr className="lgn-or-line" />
        </div>

        {/* ── Email Address ────────────────────────────────── */}
        <div className="lgn-field">
          <label className="lgn-label">
            Email Address
            <span className="lgn-label-required">*</span>
          </label>
          <input
            className="lgn-input"
            type="email"
            placeholder="e.g. name@gmail.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="email"
          />
        </div>

        {/* ── Password ─────────────────────────────────────── */}
        <div className="lgn-field">
          <label className="lgn-label">
            Password
            <span className="lgn-label-required">*</span>
          </label>
          <div className="lgn-pw-wrap">
            <input
              className="lgn-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="lgn-eye-btn"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right' }}>
            {isModal ? (
              <button
                type="button"
                className="lgn-forgot-link"
                onClick={onSwitchToForgotPassword}
              >
                Forgot Password?
              </button>
            ) : (
              <Link to="/forgot-password" className="lgn-forgot-link">
                Forgot Password?
              </Link>
            )}
          </div>
        </div>

        {/* ── Log in button ─────────────────────────────────── */}
        <button
          type="button"
          className="lgn-submit-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        {/* ── Footer link ───────────────────────────────────── */}
        <p className="lgn-footer-text">
          Don&apos;t have an account?{' '}
          {isModal ? (
            <button
              type="button"
              className="lgn-signup-link"
              onClick={onSwitchToRegister}
            >
              Sign up
            </button>
          ) : (
            <Link to="/register" className="lgn-signup-link">Sign up</Link>
          )}
        </p>

      </div>{/* /lgn-card-body */}
    </div>{/* /lgn-floating-card */}
  </div>
);

export default LoginView;