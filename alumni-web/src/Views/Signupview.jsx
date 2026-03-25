import React from 'react';
import { Link } from 'react-router-dom';
import AlumnAILogo from '../assets/new_lg.svg';
import SignupIcon  from '../assets/signup_ic.svg';
import LoginIcon   from '../assets/login_ic.svg';
import '../styles/Signup.css';

const inputStyle = {
  width: '100%', height: '36px',
  background: 'rgba(243,243,245,0.17)',
  border: '1.23674px solid rgba(0,0,0,0.25)',
  borderRadius: '8px',
  padding: '4px 36px 4px 12px',
  fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px',
  color: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
  WebkitTextFillColor: '#FFFFFF',
};

const labelStyle = {
  fontFamily: 'Arimo', fontWeight: 400, fontSize: '13px',
  lineHeight: '14px', color: '#FFFFFF', marginBottom: '6px', display: 'block',
};

const sectionTitleStyle = {
  fontFamily: 'Arimo', fontWeight: 700, fontSize: '17px',
  lineHeight: '38px', color: '#FFFFFF', margin: '0 0 8px 0',
};

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

// Label with inline error next to the asterisk
const FieldLabel = ({ text, required, error, showError }) => (
  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
    {text}
    {required && <span style={{ color: '#FF4D4D', fontWeight: 700 }}>*</span>}
    {showError && error && (
      <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FF6B6B', fontWeight: 400 }}>
        — {error}
      </span>
    )}
  </label>
);

// Password strength bar + criteria indicators
const PasswordStrength = ({ password, strength }) => {
  if (!password) return null;

  const criteria = [
    { label: 'Uppercase',  met: /[A-Z]/.test(password) },
    { label: 'Lowercase',  met: /[a-z]/.test(password) },
    { label: 'Number',     met: /[0-9]/.test(password) },
    { label: 'Symbol',     met: /[^A-Za-z0-9]/.test(password) },
    { label: '8+ chars',   met: password.length >= 8 },
  ];

  return (
    <div style={{ marginTop: '6px' }}>
      {/* Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '4px',
            background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      {/* Label + criteria */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontFamily: 'Arimo', fontSize: '11px', color: strength.color, fontWeight: 700 }}>
          {strength.label}
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {criteria.map(c => (
            <span key={c.label} style={{
              fontFamily: 'Arimo', fontSize: '10px',
              color: c.met ? '#34D399' : 'rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', gap: '3px',
              transition: 'color 0.2s',
            }}>
              <span style={{ fontSize: '9px' }}>{c.met ? '✓' : '○'}</span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SignupView = ({
  form, idData, error, fieldErrors, touched, loading,
  showPassword, showConfirmPassword, passwordStrength,
  setShowPassword, setShowConfirmPassword,
  handleChange, handleBlur, handleSignup,
}) => (
  <>
    <div style={{
      width: '100%', height: '100vh', background: '#002263',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Arimo, Arial, sans-serif', overflow: 'hidden',
    }}>

      {/* Back Button */}
      <div style={{ position: 'fixed', top: '27px', left: '39px', zIndex: 10 }}>
        <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>Back</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="signup-card" style={{
        background: 'rgba(13,19,56,0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '15px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Top Nav */}
        <div style={{
          padding: '20px 20px 0px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '12px', flexShrink: 0,
        }}>
          <img src={AlumnAILogo} alt="AlumnAI Logo" style={{ marginLeft: '45px', width: '205px', height: '93px', objectFit: 'contain' }} />
          <div style={{
            width: '352.8px', maxWidth: '90%', height: '36px',
            background: 'rgba(243,243,245,0.17)', borderRadius: '10px',
            padding: '3px', display: 'flex', boxSizing: 'border-box',
          }}>
            <button type="button" style={{
              flex: 1, height: '100%',
              background: '#155DFC',
              borderRadius: '8px', border: 'none',
              fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px', color: '#FFFFFF',
              cursor: 'pointer', transition: 'background 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <img src={SignupIcon} alt="" style={{ width: '14px', height: '14px' }} />
              Sign up
            </button>
            <Link to="/login" style={{ flex: 1, textDecoration: 'none', display: 'flex' }}>
              <button type="button" style={{
                width: '100%', flex: 1, height: '100%',
                background: 'transparent',
                borderRadius: '8px', border: 'none',
                fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px', color: '#FFFFFF',
                cursor: 'pointer', transition: 'background 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <img src={LoginIcon} alt="" style={{ width: '14px', height: '14px' }} />
                Log in
              </button>
            </Link>
          </div>
        </div>

        <div style={{ height: '16px', flexShrink: 0 }} />

        {/* Form Card */}
        <div style={{
          margin: '0 5% 5%', flex: 1,
          background: 'rgba(13,19,56,0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
          borderRadius: '12px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '18px 18px 14px', flexShrink: 0, textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px', lineHeight: '22px', color: '#FFFFFF', margin: '0 0 4px 0' }}>Alumni Registration</h3>
            <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '11px', lineHeight: '16px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Create your account to join</p>
          </div>

          <div className="custom-scroll" style={{
            padding: '4px 20px 20px', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '24px',
          }}>

            {/* General error banner — only for non-field-specific errors */}
            {error && (
              <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 12px' }}>
                <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* ── Personal Information ─────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={sectionTitleStyle}>Personal Information</h4>

              <div>
                <FieldLabel
                  text="Last Name" required
                  error="Required"
                  showError={touched.lastName && !form.lastName}
                />
                <input
                  style={inputStyle}
                  placeholder="e.g. Dela Cruz"
                  value={form.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  autoComplete="family-name"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <FieldLabel
                    text="First Name" required
                    error="Required"
                    showError={touched.firstName && !form.firstName}
                  />
                  <input
                    style={inputStyle}
                    placeholder="e.g. Juan"
                    value={form.firstName}
                    onChange={e => handleChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    autoComplete="given-name"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Middle Name</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Mendoza"
                    value={form.middleName}
                    onChange={e => handleChange('middleName', e.target.value)}
                    autoComplete="additional-name"
                  />
                </div>
              </div>
            </div>

            {/* ── Academic Information ──────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={sectionTitleStyle}>Academic Information</h4>
              <div>
                <label style={labelStyle}>Academic Program</label>
                <input
                  style={{ ...inputStyle, background: 'rgba(243,243,245,0.35)', color: idData.program ? '#FFFFFF' : 'rgba(255,255,255,0.4)', WebkitTextFillColor: idData.program ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                  placeholder="e.g. BSCS"
                  value={idData.program || ''}
                  readOnly
                  autoComplete="off"
                />
              </div>
              <div>
                <label style={labelStyle}>Year Graduated</label>
                <input
                  style={{ ...inputStyle, background: 'rgba(243,243,245,0.35)', color: idData.batchYear ? '#FFFFFF' : 'rgba(255,255,255,0.4)', WebkitTextFillColor: idData.batchYear ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                  placeholder="e.g. 2024"
                  value={idData.batchYear || ''}
                  readOnly
                  autoComplete="off"
                />
              </div>
            </div>

            {/* ── Account Security ──────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={sectionTitleStyle}>Account Security</h4>

              {/* Email */}
              <div>
                <FieldLabel
                  text="Email Address" required
                  error={touched.email && !form.email ? 'Required' : fieldErrors.email}
                  showError={touched.email && (!form.email || !!fieldErrors.email)}
                />
                <input
                  style={{
                    ...inputStyle,
                    border: touched.email && fieldErrors.email
                      ? '1.23674px solid rgba(255,80,80,0.6)'
                      : inputStyle.border,
                  }}
                  type="email"
                  placeholder="e.g. you@gmail.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <FieldLabel
                  text="Password" required
                  error={touched.password && !form.password ? 'Required' : fieldErrors.password}
                  showError={touched.password && (!form.password || !!fieldErrors.password)}
                />
                <div style={{ position: 'relative' }}>
                  <input
                    style={inputStyle}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
                <PasswordStrength password={form.password} strength={passwordStrength} />
              </div>

              {/* Confirm Password */}
              <div>
                <FieldLabel
                  text="Confirm Password" required
                  error={touched.confirmPassword && !form.confirmPassword ? 'Required' : fieldErrors.confirmPassword}
                  showError={touched.confirmPassword && (!form.confirmPassword || !!fieldErrors.confirmPassword)}
                />
                <div style={{ position: 'relative' }}>
                  <input
                    style={{
                      ...inputStyle,
                      border: touched.confirmPassword && fieldErrors.confirmPassword
                        ? '1.23674px solid rgba(255,80,80,0.6)'
                        : inputStyle.border,
                    }}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                style={{
                  width: '284px', height: '37px',
                  background: loading ? 'rgba(0,40,255,0.35)' : 'rgba(0,40,255,0.7)',
                  boxShadow: '0px 2px 2px rgba(255,255,255,0.25)',
                  border: 'none', borderRadius: '14px',
                  fontFamily: 'Arimo', fontWeight: 700, fontSize: '13px', color: '#FFFFFF',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s ease', flexShrink: 0,
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default SignupView;