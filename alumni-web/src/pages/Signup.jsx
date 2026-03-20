import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AlumnAILogo from '../assets/new_lg.svg';
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

  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(217,202,129,0.4); border-radius: 10px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(217,202,129,0.8); }

  .signup-card { width: 440px; height: 900px; max-height: 95vh; }
  @media (max-width: 500px) { .signup-card { width: 95vw; } }

  /* ── Suppress ALL browser-native password/eye UI ── */
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear,
  input[type="text"]::-ms-reveal,
  input[type="text"]::-ms-clear { display: none !important; }
  input::-webkit-credentials-auto-fill-button,
  input::-webkit-strong-password-auto-fill-button { visibility: hidden !important; display: none !important; pointer-events: none !important; }

  /* ── Eye button ── */
  .eye-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    -webkit-appearance: none;
  }
  .eye-btn:focus { outline: none; }
`;

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

const RequiredLabel = ({ text, touched, hasValue }) => (
  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '4px' }}>
    {text}
    <span style={{ color: '#FF4D4D', fontWeight: 700 }}>*</span>
    {touched && !hasValue && (
      <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FF6B6B', fontWeight: 400 }}>Required</span>
    )}
  </label>
);

// Matches Flutter Icons.visibility / Icons.visibility_off exactly
const EyeIcon = ({ visible }) => (
  visible ? (
    // Eye open — matches Icons.visibility
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"
        fill="rgba(255,255,255,0.85)"
      />
      <circle cx="12" cy="12" r="3.5" fill="#002263" />
      <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.85)" />
    </svg>
  ) : (
    // Eye closed — matches Icons.visibility_off
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
        fill="rgba(255,255,255,0.85)"
      />
    </svg>
  )
);

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const idData   = location.state || {};

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab,           setActiveTab]           = useState('signup');
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState('');
  const [emailError,          setEmailError]          = useState('');
  const [touched,             setTouched]             = useState({});

  const [form, setForm] = useState({
    lastName:        idData.lastName   || '',
    firstName:       idData.firstName  || '',
    middleName:      idData.middleName || '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });

  const set   = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const touch = (key)        => setTouched(prev => ({ ...prev, [key]: true }));

  const validateEmail = (value) => {
    const trimmed = value.toLowerCase().trim();
    if (!trimmed) { setEmailError(''); }
    else if (trimmed.includes('@') && !trimmed.endsWith('@gmail.com')) {
      setEmailError('Only Gmail accounts (@gmail.com) are accepted.');
    } else { setEmailError(''); }
  };

  const handleSignup = async () => {
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      return setError('Please fill in all required fields.');
    }
    if (emailError) return setError(emailError);
    if (form.password.length < 8) return setError('Password must be at least 8 characters long.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name:  form.firstName,
            middle_name: form.middleName,
            last_name:   form.lastName,
          },
        },
      });
      if (signUpError) throw signUpError;

      const { error: insertError } = await supabase.from('users').upsert({
        id:          data.user.id,
        email:       form.email,
        first_name:  form.firstName,
        middle_name: form.middleName || null,
        last_name:   form.lastName,
        program:     idData.program   || null,
        batch_year:  idData.batchYear ? parseInt(idData.batchYear) : null,
        role:        'alumni',
      }, { onConflict: 'id' });

      if (insertError) {
        await supabase.auth.signOut();
        throw new Error('Account setup incomplete. Please try signing up again.');
      }

      try {
        await supabase.from('alumni_profiles').upsert({
          user_id:                      data.user.id,
          profile_completion_percentage: 10,
        }, { onConflict: 'user_id' });
      } catch (_) {}

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

  return (
    <>
      <style>{scrollbarStyles}</style>
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
            <img src={AlumnAILogo} alt="AlumnAI Logo" style={{ marginLeft: '45px', width: '150px', height: '70px', objectFit: 'contain' }} />
            <div style={{
              width: '352.8px', maxWidth: '90%', height: '36px',
              background: 'rgba(243,243,245,0.17)', borderRadius: '10px',
              padding: '3px', display: 'flex', boxSizing: 'border-box',
            }}>
              <button type="button" onClick={() => setActiveTab('signup')} style={{
                flex: 1, height: '100%',
                background: activeTab === 'signup' ? '#155DFC' : 'transparent',
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
                  background: activeTab === 'login' ? '#155DFC' : 'transparent',
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

              {error && (
                <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={sectionTitleStyle}>Personal Information</h4>
                <div>
                  <RequiredLabel text="Last Name" touched={touched.lastName} hasValue={!!form.lastName} />
                  <input style={inputStyle} placeholder="e.g. Dela Cruz" value={form.lastName}
                    onChange={e => set('lastName', e.target.value)} onBlur={() => touch('lastName')} autoComplete="family-name" />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <RequiredLabel text="First Name" touched={touched.firstName} hasValue={!!form.firstName} />
                    <input style={inputStyle} placeholder="e.g. Juan" value={form.firstName}
                      onChange={e => set('firstName', e.target.value)} onBlur={() => touch('firstName')} autoComplete="given-name" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Middle Name</label>
                    <input style={inputStyle} placeholder="e.g. Mendoza" value={form.middleName}
                      onChange={e => set('middleName', e.target.value)} autoComplete="additional-name" />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={sectionTitleStyle}>Academic Information</h4>
                <div>
                  <label style={labelStyle}>Academic Program</label>
                  <input style={{ ...inputStyle, background: 'rgba(243,243,245,0.35)', color: idData.program ? '#FFFFFF' : 'rgba(255,255,255,0.4)', WebkitTextFillColor: idData.program ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                    placeholder="e.g. BSCS" value={idData.program || ''} readOnly autoComplete="off" />
                </div>
                <div>
                  <label style={labelStyle}>Year Graduated</label>
                  <input style={{ ...inputStyle, background: 'rgba(243,243,245,0.35)', color: idData.batchYear ? '#FFFFFF' : 'rgba(255,255,255,0.4)', WebkitTextFillColor: idData.batchYear ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
                    placeholder="e.g. 2024" value={idData.batchYear || ''} readOnly autoComplete="off" />
                </div>
              </div>

              {/* Account Security */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={sectionTitleStyle}>Account Security</h4>
                <div>
                  <RequiredLabel text="Email Address" touched={touched.email} hasValue={!!form.email} />
                  <input
                    style={{ ...inputStyle, border: emailError ? '1.23674px solid rgba(255,80,80,0.6)' : inputStyle.border }}
                    type="email" placeholder="e.g. you@gmail.com" value={form.email}
                    onChange={e => { set('email', e.target.value); validateEmail(e.target.value); }}
                    onBlur={() => touch('email')} autoComplete="email"
                  />
                  {emailError && <p style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FF6B6B', margin: '5px 0 0 0' }}>{emailError}</p>}
                </div>

                <div>
                  <RequiredLabel text="Password" touched={touched.password} hasValue={!!form.password} />
                  <div style={{ position: 'relative' }}>
                    <input style={inputStyle} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                      value={form.password} onChange={e => set('password', e.target.value)}
                      onBlur={() => touch('password')} autoComplete="new-password" />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '5px 0 0 0' }}>Must be at least 8 characters long.</p>
                </div>

                <div>
                  <RequiredLabel text="Confirm Password" touched={touched.confirmPassword} hasValue={!!form.confirmPassword} />
                  <div style={{ position: 'relative' }}>
                    <input style={inputStyle} type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••"
                      value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                      onBlur={() => touch('confirmPassword')} autoComplete="new-password" />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(v => !v)}
                      tabIndex={-1} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '5px 0 0 0' }}>Must be at least 8 characters long.</p>
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="button" onClick={handleSignup} disabled={loading} style={{
                  width: '284px', height: '37px',
                  background: !loading ? 'rgba(0,40,255,0.7)' : 'rgba(0,40,255,0.35)',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  border: 'none', borderRadius: '14px',
                  fontFamily: 'Arimo', fontWeight: 700, fontSize: '13px', color: '#FFFFFF',
                  cursor: !loading ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s ease', flexShrink: 0,
                }}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '13px', lineHeight: '20px', color: '#FFFFFF', textAlign: 'center', margin: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#D9CA81', textDecoration: 'none', fontWeight: 700 }}>Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;