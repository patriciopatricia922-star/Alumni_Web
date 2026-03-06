import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AlumnAILogo from '../assets/AlumnAI Logo.png';
import { supabase } from '../lib/supabase';

const scrollbarStyles = `
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
    height: 820px;
    max-height: 95vh;
  }

  @media (max-width: 500px) {
    .signup-card {
      width: 95vw;
    }
  }
`;

const inputStyle = {
  width: '100%',
  height: '36px',
  background: 'rgba(243, 243, 245, 0.17)',
  border: '1.23674px solid rgba(0, 0, 0, 0.25)',
  borderRadius: '8px',
  padding: '4px 12px',
  fontFamily: 'Montserrat',
  fontWeight: 400,
  fontSize: '12px',
  color: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: 'Montserrat',
  fontWeight: 400,
  fontSize: '11px',
  lineHeight: '14px',
  color: '#FFFFFF',
  marginBottom: '5px',
  display: 'block',
};

const sectionTitleStyle = {
  fontFamily: 'Montserrat',
  fontWeight: 700,
  fontSize: '13px',
  lineHeight: '20px',
  color: '#FFFFFF',
  margin: '0 0 10px 0',
};

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const idData = location.state || {};

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    lastName: idData.lastName || '',
    firstName: idData.firstName || '',
    middleName: idData.middleName || '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSignup = async () => {
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      return setError('Please fill in all required fields.');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!agreed) {
      return setError('You must agree to the Terms of Service and Privacy Policy.');
    }

    setLoading(true);
    try {
      // 1. Create auth user
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

      // 2. Insert into public.users
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        email: form.email,
        first_name: form.firstName,
        middle_name: form.middleName || null,
        last_name: form.lastName,
        program: idData.program || null,
        batch_year: idData.batchYear ? parseInt(idData.batchYear) : null,
      });
      if (insertError) throw insertError;

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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
          fontFamily: 'Montserrat, Arial, sans-serif',
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
            <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>
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
              padding: '16px 20px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <img
              src={AlumnAILogo}
              alt="AlumnAI Logo"
              style={{ width: '100px', height: '100px', objectFit: 'contain' }}
            />

            <div
              style={{
                width: '80%',
                background: 'rgba(243, 243, 245, 0.17)',
                borderRadius: '10px',
                padding: '2px',
                display: 'flex',
              }}
            >
              <button
                onClick={() => setActiveTab('signup')}
                style={{
                  flex: 1,
                  height: '24px',
                  background: activeTab === 'signup' ? '#155DFC' : 'transparent',
                  borderRadius: '8px',
                  border: 'none',
                  fontFamily: 'Arial',
                  fontWeight: 400,
                  fontSize: '12px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                Sign up
              </button>
              <Link to="/login" style={{ flex: 1, textDecoration: 'none' }}>
                <button
                  style={{
                    width: '100%',
                    height: '24px',
                    background: activeTab === 'login' ? '#155DFC' : 'transparent',
                    borderRadius: '8px',
                    border: 'none',
                    fontFamily: 'Arial',
                    fontWeight: 400,
                    fontSize: '12px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                >
                  Log in
                </button>
              </Link>
            </div>
          </div>

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
            <div style={{ padding: '14px 18px 10px', flexShrink: 0, textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '14px', lineHeight: '22px', color: '#FFFFFF', margin: '0 0 2px 0' }}>
                Alumni Registration
              </h3>
              <p style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '11px', lineHeight: '16px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                Create your account to join
              </p>
            </div>

            {/* Scrollable Content */}
            <div
              className="custom-scroll"
              style={{
                padding: '4px 18px 18px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >

              {/* Error message */}
              {error && (
                <div style={{ background: 'rgba(255, 80, 80, 0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '8px 12px' }}>
                  <p style={{ fontFamily: 'Montserrat', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h4 style={sectionTitleStyle}>Personal Information</h4>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Dela Cruz"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>First Name *</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Juan"
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
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

              {/* Account Security */}
              <div>
                <h4 style={sectionTitleStyle}>Account Security</h4>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="e.g. you@gmail.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={inputStyle}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                  <p style={{ fontFamily: 'Montserrat', fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>
                    The password must be at least 8 characters long.
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      style={inputStyle}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)}
                    />
                    <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                  <p style={{ fontFamily: 'Montserrat', fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>
                    The password must be at least 8 characters long.
                  </p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: '13px', height: '13px', marginTop: '3px', accentColor: '#2B72FB', flexShrink: 0, cursor: 'pointer' }}
                />
                <label htmlFor="terms" style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '11px', lineHeight: '20px', color: '#FFFFFF', cursor: 'pointer' }}>
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: '#D9CA81', textDecoration: 'none' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" style={{ color: '#D9CA81', textDecoration: 'none' }}>Privacy Policy</Link>
                </label>
              </div>

              {/* Create Account Button */}
              <button
                onClick={handleSignup}
                disabled={!agreed || loading}
                style={{
                  width: '100%',
                  height: '40px',
                  background: agreed && !loading ? 'rgba(0, 40, 255, 0.7)' : 'rgba(0, 40, 255, 0.35)',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: 'Montserrat',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.3px',
                  color: '#FFFFFF',
                  cursor: agreed && !loading ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Already have an account */}
              <p style={{ fontFamily: 'Montserrat', fontWeight: 400, fontSize: '11px', lineHeight: '20px', color: '#FFFFFF', textAlign: 'center', margin: 0 }}>
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