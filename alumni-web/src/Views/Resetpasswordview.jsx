import React from 'react';
import { Link } from 'react-router-dom';

const STYLES = `
  input::-ms-reveal,
  input::-ms-clear { display: none; }
  input::-webkit-credentials-auto-fill-button { visibility: hidden; pointer-events: none; }
  input::placeholder { color: rgba(255,255,255,0.3) !important; opacity: 1; }
  input::-webkit-input-placeholder { color: rgba(255,255,255,0.3) !important; -webkit-text-fill-color: rgba(255,255,255,0.3) !important; }
  input::-moz-placeholder { color: rgba(255,255,255,0.3) !important; opacity: 1; }
  .rp-eye-btn {
    position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 0;
    display: flex; align-items: center; justify-content: center;
    line-height: 0; -webkit-appearance: none;
  }
  .rp-eye-btn:focus { outline: none; }
`;

const inputStyle = {
  width: '100%', height: '36px',
  background: 'rgba(243,243,245,0.17)',
  border: '1.23674px solid rgba(0,0,0,0.25)',
  borderRadius: '8px', padding: '4px 36px 4px 12px',
  fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px',
  color: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
  WebkitTextFillColor: '#FFFFFF',
};

const labelStyle = {
  fontFamily: 'Arimo', fontWeight: 400, fontSize: '13px',
  lineHeight: '38px', color: '#FFFFFF', display: 'block', margin: 0,
};

// Same EyeIcon as Login/Signup
const EyeIcon = ({ visible }) => (
  visible ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" fill="rgba(255,255,255,0.85)" />
      <circle cx="12" cy="12" r="3.5" fill="#002263" />
      <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.85)" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="rgba(255,255,255,0.85)" />
    </svg>
  )
);

const strengthColors      = ['rgba(255,255,255,0.2)', '#FF4444', '#FF9500', '#FFD700', '#00C853'];
const strengthLabels      = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthTextColors  = ['transparent', '#FF4444', '#FF9500', '#FFD700', '#00C853'];
const DOTS = 8;

const StrengthRow = ({ strength, newPassword }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: DOTS }).map((_, i) => (
        <div key={i} style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: i < (strength * 2) ? strengthColors[strength] : 'rgba(255,255,255,0.2)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
    {newPassword.length > 0 && (
      <span style={{
        fontFamily: 'Arimo', fontSize: '11px', fontWeight: 600,
        color: strengthTextColors[strength],
        transition: 'color 0.2s',
      }}>
        {strengthLabels[strength]}
      </span>
    )}
  </div>
);

const ResetPasswordView = ({
  showNew, showConfirm,
  newPassword, confirmPassword,
  loading, error, success, strength,
  setShowNew, setShowConfirm,
  setNewPassword, setConfirmPassword,
  handleReset,
}) => (
  <>
    <style>{STYLES}</style>
    <div style={{
      width: '100%', height: '100vh',
      background: '#002263',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Arimo',
    }}>

      {/* Back Button */}
      <div style={{ position: 'fixed', top: '27px', left: '39px', zIndex: 10 }}>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
        </Link>
      </div>

      {/* Card */}
      <div style={{
        width: '368px',
        background: 'rgba(13,19,56,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
        borderRadius: '13px',
        padding: '40px 22px 32px',
        display: 'flex', flexDirection: 'column',
        gap: '0px',
      }}>

        <h2 style={{
          fontFamily: 'Arimo', fontWeight: 700, fontSize: '17px',
          color: '#FFFFFF', margin: '0 0 8px 0', textAlign: 'center',
        }}>
          Reset Password
        </h2>

        <p style={{
          fontFamily: 'Arimo', fontWeight: 400, fontSize: '14px',
          lineHeight: '20px', color: 'rgba(255,255,255,0.7)',
          textAlign: 'center', margin: '0 0 28px 0',
        }}>
          Enter your new password for your account
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.15)',
            border: '1px solid rgba(255,80,80,0.4)',
            borderRadius: '8px', padding: '8px 12px', marginBottom: '16px',
          }}>
            <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(0,200,83,0.15)',
            border: '1px solid rgba(0,200,83,0.4)',
            borderRadius: '8px', padding: '8px 12px', marginBottom: '16px',
          }}>
            <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#00C853', margin: 0 }}>
              Password reset successfully! Redirecting to login…
            </p>
          </div>
        )}

        {/* New Password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>New Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              style={inputStyle}
              type={showNew ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="rp-eye-btn"
              onClick={() => setShowNew(v => !v)}
              tabIndex={-1}
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              <EyeIcon visible={showNew} />
            </button>
          </div>
          <StrengthRow strength={strength} newPassword={newPassword} />
          <p style={{ fontFamily: 'Arimo', fontSize: '11px', lineHeight: '24px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0' }}>
            The password must be at least 8 characters long.
          </p>
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle}>Confirm New Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              style={inputStyle}
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
            />
            <button
              type="button"
              className="rp-eye-btn"
              onClick={() => setShowConfirm(v => !v)}
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              <EyeIcon visible={showConfirm} />
            </button>
          </div>
          <p style={{ fontFamily: 'Arimo', fontSize: '11px', lineHeight: '24px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0' }}>
            The password must be at least 8 characters long.
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleReset}
          disabled={loading || success}
          style={{
            width: '100%', height: '40px',
            background: loading || success ? 'rgba(0,40,255,0.4)' : 'rgba(0,40,255,0.7)',
            boxShadow: '0px 2px 2px rgba(255,255,255,0.25)',
            border: 'none', borderRadius: '13px',
            fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px',
            color: '#FFFFFF', cursor: loading || success ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </div>
  </>
);

export default ResetPasswordView;