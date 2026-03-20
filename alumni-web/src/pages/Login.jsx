import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AlumnAILogo from '../assets/horizon_logo.svg';
import SignupIcon from '../assets/signup_ic.svg';
import LoginIcon from '../assets/login_ic.svg';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';

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

  .login-card { width: 500px; height: 730px; max-height: 95vh; }
  @media (max-width: 500px) { .login-card { width: 95vw; } }

  /* ── Suppress ALL browser-native password/eye UI ── */
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear,
  input[type="text"]::-ms-reveal,
  input[type="text"]::-ms-clear { display: none !important; }
  input::-webkit-credentials-auto-fill-button,
  input::-webkit-strong-password-auto-fill-button { visibility: hidden !important; display: none !important; pointer-events: none !important; }

  /* ── Fix browser autofill highlight — keeps text white and background transparent ── */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px rgba(13, 19, 56, 0.6) inset !important;
    -webkit-text-fill-color: #FFFFFF !important;
    caret-color: #FFFFFF !important;
    transition: background-color 9999s ease-in-out 0s;
  }

  /* ── Eye button ── */
  .eye-btn-login {
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
  .eye-btn-login:focus { outline: none; }
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
  fontFamily: 'Arimo', fontWeight: 400, fontSize: '11px',
  lineHeight: '14px', color: '#FFFFFF', marginBottom: '5px', display: 'block',
};

const EyeIcon = ({ visible }) => (
  visible ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" fill="rgba(255,255,255,0.85)" />
      <circle cx="12" cy="12" r="3.5" fill="#002263" />
      <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.85)" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="rgba(255,255,255,0.85)" />
    </svg>
  )
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [form,         setForm]         = useState({ email: '', password: '' });

  React.useEffect(() => {
    if (location.state?.error) setError(location.state.error);
  }, [location.state]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleLogin = async () => {
    setError('');
    if (!form.email || !form.password) {
      return setError('Please enter your email and password.');
    }
    setLoading(true);
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (loginError) throw loginError;

      const email = form.email.toLowerCase().trim();

      // ── Determine role label for audit log ──
      let roleLabel = 'Alumni';
      if (email === 'superadmin@nu-dasma.edu.ph') roleLabel = 'Super Admin';
      else if (email === 'nudaao@nu-dasma.edu.ph') roleLabel = 'Admin';

      // ── Log successful login ──
      await logAction({
        action:      'Login',
        module:      'Authentication',
        description: `${roleLabel} logged in`,
        status:      'Success',
      });

      if (email === 'superadmin@nu-dasma.edu.ph') {
        navigate('/superadmin/super-admin-dashboard');
      } else if (email === 'nudaao@nu-dasma.edu.ph') {
        navigate('/admin/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // ── Log failed login attempt (no user session so log manually) ──
      await supabase.from('audit_logs').insert({
        user_id:    null,
        user_email: form.email,
        user_role:  null,
        action:     'Login',
        module:     'Authentication',
        description: `Failed login attempt for ${form.email}`,
        status:     'Failed',
      });

      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div style={{
        width: '100%', height: '100vh', background: '#002263',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Arimo, sans-serif', overflow: 'hidden',
      }}>

        {/* Back Button */}
        <div style={{ position: 'fixed', top: '27px', left: '39px', zIndex: 10 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="login-card" style={{
          background: 'rgba(13,19,56,0.25)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '15px',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* Top Nav */}
          <div style={{
            padding: '20px 20px 20px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px', flexShrink: 0,
          }}>
            <img src={AlumnAILogo} alt="AlumnAI Logo" style={{ width: '150px', height: '70px', objectFit: 'contain' }} />
            <div style={{ width: '352.8px', maxWidth: '90%', background: 'rgba(243,243,245,0.17)', borderRadius: '10px', padding: '3px', display: 'flex', height: '36px', boxSizing: 'border-box' }}>
              <Link to="/register" style={{ flex: 1, textDecoration: 'none', display: 'flex' }}>
                <button style={{
                  width: '100%', flex: 1, background: 'transparent',
                  borderRadius: '8px', border: 'none', fontFamily: 'Arimo',
                  fontWeight: 400, fontSize: '12px', color: '#FFFFFF',
                  cursor: 'pointer', transition: 'background 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                  <img src={SignupIcon} alt="" style={{ width: '14px', height: '14px' }} />
                  Sign up
                </button>
              </Link>
              <button style={{
                flex: 1, background: '#155DFC',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px',
                border: 'none', fontFamily: 'Arimo', fontWeight: 400,
                fontSize: '12px', color: '#FFFFFF', cursor: 'pointer',
                transition: 'background 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <img src={LoginIcon} alt="" style={{ width: '14px', height: '14px' }} />
                Log in
              </button>
            </div>
          </div>

          {/* Google Button + OR divider */}
          <div style={{ padding: '0 20px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '251px', height: '42px',
                background: 'rgba(243,243,245,0.17)',
                border: '1.23674px solid rgba(0,0,0,0.25)',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px', opacity: loading ? 0.6 : 1,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#F44336" d="M24 9.5c3.1 0 5.8 1.1 7.9 2.9l5.9-5.9C34.3 3.5 29.4 1.5 24 1.5 15.1 1.5 7.5 6.8 4.1 14.3l6.9 5.4C12.7 13.6 17.9 9.5 24 9.5z"/>
                <path fill="#4CAF50" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.2z" opacity=".99"/>
                <path fill="#FFC107" d="M11 28.3c-.5-1.4-.8-2.8-.8-4.3s.3-2.9.8-4.3l-6.9-5.4C2.5 17.1 1.5 20.4 1.5 24s1 6.9 2.6 9.7l6.9-5.4z"/>
                <path fill="#1565C0" d="M24 46.5c5.4 0 10-1.8 13.3-4.8l-7-5.4c-1.8 1.2-4 1.9-6.3 1.9-6.1 0-11.3-4.1-13.1-9.6l-6.9 5.4C7.5 41.2 15.1 46.5 24 46.5z" opacity=".99"/>
              </svg>
              <span style={{ fontFamily: 'Arimo', fontSize: '13px', color: '#FFFFFF' }}>Continue with Google</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', width: '100%' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          {/* Form Card */}
          <div style={{
            margin: '0 5% 5%', flex: 1,
            background: 'rgba(13,19,56,0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            borderRadius: '12px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ padding: '16px 18px 12px', flexShrink: 0, textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '17px', color: '#FFFFFF', margin: '0 0 4px 0' }}>Welcome Back</h3>
              <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Please enter your details to log in</p>
            </div>

            <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {error && (
                <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '8px 12px' }}>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={inputStyle}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-btn-login"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <Link to="/forgot-password" style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#D9CA81', textDecoration: 'none' }}>Forgot Password?</Link>
                </div>
              </div>

              {/* Log in Button */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  style={{
                    width: '310px', height: '40px',
                    background: loading ? 'rgba(0,40,255,0.35)' : 'rgba(0,40,255,0.7)',
                    boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                    border: 'none', borderRadius: '13px',
                    fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px',
                    color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s ease', flexShrink: 0,
                  }}
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </div>

              <p style={{ fontFamily: 'Arimo', fontSize: '12px', lineHeight: '20px', color: '#FFFFFF', textAlign: 'center', margin: 0 }}>
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: '#D9CA81', textDecoration: 'none', fontWeight: 700 }}>Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;