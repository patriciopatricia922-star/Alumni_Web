import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AlumnAILogo from '../assets/horizon_logo.svg';
import SignupIcon from '../assets/signup_ic.svg';
import LoginIcon from '../assets/login_ic.svg';
import { supabase } from '../lib/supabase';

const scrollbarStyles = `
  @font-face {
    font-family: 'Arimo';
    font-weight: 400;
    font-style: normal;
    src: url('../assets/fonts/Arimo-Regular.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Arimo';
    font-weight: 700;
    font-style: normal;
    src: url('../assets/fonts/Arimo-Bold.ttf') format('truetype');
  }

  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(217, 202, 129, 0.4);
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(217, 202, 129, 0.8);
  }

  .signup-card {
    width: 440px;
    height: 900px;
    max-height: 95vh;
  }

  @media (max-width: 500px) {
    .signup-card {
      width: 95vw;
    }
  }

  /* Eye icon button always visible on autofill */
  .eye-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.25);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .eye-btn:hover {
    background: rgba(0, 0, 0, 0.45);
  }
`;

const inputStyle = {
  width: '100%',
  height: '40px',
  background: 'rgba(243, 243, 245, 0.17)',
  border: '1.23674px solid rgba(0, 0, 0, 0.25)',
  borderRadius: '8px',
  padding: '4px 36px 4px 12px',
  fontFamily: 'Arimo',
  fontWeight: 400,
  fontSize: '12px',
  color: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: 'Arimo',
  fontWeight: 400,
  fontSize: '11px',
  lineHeight: '14px',
  color: '#FFFFFF',
  marginBottom: '6px',
  display: 'block',
};

const RequiredLabel = ({ text, touched, hasValue }) => (
  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '4px' }}>
    {text}
    <span style={{ color: '#FF4D4D', fontWeight: 700 }}>*</span>
    {touched && !hasValue && (
      <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FF6B6B', fontWeight: 400 }}>
        Required
      </span>
    )}
  </label>
);

const sectionTitleStyle = {
  fontFamily: 'Arimo',
  fontWeight: 700,
  fontSize: '13px',
  lineHeight: '20px',
  color: '#FFFFFF',
  margin: '0 0 14px 0',
  paddingBottom: '6px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const idData = location.state || {};

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    lastName: idData.lastName || '',
    firstName: idData.firstName || '',
    middleName: idData.middleName || '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const touch = (key) => setTouched(prev => ({ ...prev, [key]: true }));

  const validateEmail = (value) => {
    const trimmed = value.toLowerCase().trim();
    if (!trimmed) {
      setEmailError('');
    } else if (trimmed.includes('@') && !trimmed.endsWith('@gmail.com')) {
      setEmailError('Only Gmail accounts (@gmail.com) are accepted.');
    } else {
      setEmailError('');
    }
  };

  const handleSignup = async () => {
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      return setError('Please fill in all required fields.');
    }
    if (emailError) {
      return setError(emailError);
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            middle_name: form.middleName,
            last_name: form.lastName,
          },
        },
      });
      if (signUpError) throw signUpError;

      const { error: insertError } = await supabase.from('users').upsert({
        id: data.user.id,
        email: form.email,
        first_name: form.firstName,
        middle_name: form.middleName || null,
        last_name: form.lastName,
        program: idData.program || null,
        batch_year: idData.batchYear ? parseInt(idData.batchYear) : null,
      }, { onConflict: 'id' });

      if (insertError) {
        await supabase.auth.signOut();
        throw new Error('Account setup incomplete. Please try signing up again.');
      }

      navigate('/login');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.includes('409') || msg.toLowerCase().includes('unique')) {
        setError('This email is already registered. Please log in instead.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="1" x2="23" y2="23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: '#002263',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arimo, Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Back Button */}
        <div style={{ position: 'fixed', top: '27px', left: '39px', zIndex: 10 }}>
          <Link
            to="/register"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>
              Back
            </span>
          </Link>
        </div>

        {/* Main Card */}
        <div
          className="signup-card"
          style={{
            background: 'rgba(13, 19, 56, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Top Nav Area */}
          <div
            style={{
              padding: '20px 20px 0px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            <img
              src={AlumnAILogo}
              alt="AlumnAI Logo"
              style={{ width: '150px', height: '70px', objectFit: 'contain' }}
            />

            {/* Slider */}
            <div
              style={{
                width: '352.8px',
                maxWidth: '90%',
                height: '36px',
                background: 'rgba(243, 243, 245, 0.17)',
                borderRadius: '10px',
                padding: '3px',
                display: 'flex',
                boxSizing: 'border-box',
              }}
            >
              <button
                onClick={() => setActiveTab('signup')}
                style={{
                  flex: 1,
                  height: '100%',
                  background: activeTab === 'signup' ? '#155DFC' : 'transparent',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: 'Arimo',
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <img src={SignupIcon} alt="" style={{ width: '14px', height: '14px' }} />
                Sign up
              </button>
              <Link to="/login" style={{ flex: 1, textDecoration: 'none', display: 'flex' }}>
                <button
                  style={{
                    width: '100%',
                    flex: 1,
                    height: '100%',
                    background: activeTab === 'login' ? '#155DFC' : 'transparent',
                    borderRadius: '8px',
                    border: 'none',
                    fontFamily: 'Arimo',
                    fontWeight: 400,
                    fontSize: '12px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <img src={LoginIcon} alt="" style={{ width: '14px', height: '14px' }} />
                  Log in
                </button>
              </Link>
            </div>
          </div>

          {/* Gap between slider and form card */}
          <div style={{ height: '16px', flexShrink: 0 }} />

          {/* Form Card */}
          <div
            style={{
              margin: '0 5% 5%',
              flex: 1,
              background: 'rgba(13, 19, 56, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 18px 14px', flexShrink: 0, textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px', lineHeight: '22px', color: '#FFFFFF', margin: '0 0 4px 0' }}>
                Alumni Registration
              </h3>
              <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '11px', lineHeight: '16px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                Create your account to join
              </p>
            </div>

            {/* Scrollable Content */}
            <div
              className="custom-scroll"
              style={{
                padding: '4px 20px 20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >

              {error && (
                <div style={{ background: 'rgba(255, 80, 80, 0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={sectionTitleStyle}>Personal Information</h4>
                <div>
                  <RequiredLabel text="Last Name" touched={touched.lastName} hasValue={!!form.lastName} />
                  <input
                    style={inputStyle}
                    placeholder="e.g. Dela Cruz"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    onBlur={() => touch('lastName')}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <RequiredLabel text="First Name" touched={touched.firstName} hasValue={!!form.firstName} />
                    <input
                      style={inputStyle}
                      placeholder="e.g. Juan"
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      onBlur={() => touch('firstName')}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Middle Name</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Mendoza"
                      value={form.middleName}
                      onChange={e => set('middleName', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={sectionTitleStyle}>Academic Information</h4>
                <div>
                  <label style={labelStyle}>Academic Program</label>
                  <input
                    style={{ ...inputStyle, color: idData.program ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                    placeholder="e.g. BSCS"
                    value={idData.program || ''}
                    readOnly
                  />
                </div>
                <div>
                  <label style={labelStyle}>Year Graduated</label>
                  <input
                    style={{ ...inputStyle, color: idData.batchYear ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                    placeholder="e.g. 2024"
                    value={idData.batchYear || ''}
                    readOnly
                  />
                </div>
              </div>

              {/* Account Security */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={sectionTitleStyle}>Account Security</h4>
                <div>
                  <RequiredLabel text="Email Address" touched={touched.email} hasValue={!!form.email} />
                  <input
                    style={{
                      ...inputStyle,
                      border: emailError ? '1.23674px solid rgba(255,80,80,0.6)' : inputStyle.border,
                    }}
                    type="email"
                    placeholder="e.g. you@gmail.com"
                    value={form.email}
                    onChange={e => { set('email', e.target.value); validateEmail(e.target.value); }}
                    onBlur={() => touch('email')}
                  />
                  {emailError && (
                    <p style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FF6B6B', margin: '5px 0 0 0' }}>
                      {emailError}
                    </p>
                  )}
                </div>
                <div>
                  <RequiredLabel text="Password" touched={touched.password} hasValue={!!form.password} />
                  <div style={{ position: 'relative' }}>
                    <input
                      style={inputStyle}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      onBlur={() => touch('password')}
                    />
                    <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                  <p style={{ fontFamily: 'Arimo', fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '5px 0 0 0' }}>
                    Must be at least 8 characters long.
                  </p>
                </div>
                <div>
                  <RequiredLabel text="Confirm Password" touched={touched.confirmPassword} hasValue={!!form.confirmPassword} />
                  <div style={{ position: 'relative' }}>
                    <input
                      style={inputStyle}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)}
                      onBlur={() => touch('confirmPassword')}
                    />
                    <button className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                  <p style={{ fontFamily: 'Arimo', fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '5px 0 0 0' }}>
                    Must be at least 8 characters long.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSignup}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '50px',
                  background: !loading ? 'rgba(0, 40, 255, 0.7)' : 'rgba(0, 40, 255, 0.35)',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  border: 'none',
                  borderRadius: '13px',
                  fontFamily: 'Arimo',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#FFFFFF',
                  cursor: !loading ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '11px', lineHeight: '20px', color: '#FFFFFF', textAlign: 'center', margin: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#D9CA81', textDecoration: 'none', fontWeight: 700 }}>
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;