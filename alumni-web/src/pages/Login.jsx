import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AlumnAILogo from '../assets/AlumnAI Logo.png';
import { supabase } from '../lib/supabase';

const scrollbarStyles = `
  .login-card { width: 440px; height: 650px; max-height: 95vh; }
  @media (max-width: 500px) { .login-card { width: 95vw; } }
`;

const inputStyle = {
  width: '100%', height: '36px',
  background: 'rgba(243,243,245,0.17)',
  border: '1.23674px solid rgba(0,0,0,0.25)',
  borderRadius: '8px', padding: '4px 12px',
  fontFamily: 'Arimo', fontWeight: 400, fontSize: '12px',
  color: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: 'Arimo', fontWeight: 400, fontSize: '11px',
  lineHeight: '14px', color: '#FFFFFF', marginBottom: '5px', display: 'block',
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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ email: '', password: '' });

  // Pick up any error message passed back from AuthCallback (e.g. admin blocked)
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

      // Route based on role
      const email = form.email.toLowerCase().trim();
      if (email === 'superadmin@nu-dasma.edu.ph') {
        navigate('/super-admin');
      } else if (email === 'nudaao@nu-dasma.edu.ph') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Page will redirect to Google — no further action needed here
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div style={{ width: '100%', height: '100vh', background: '#002263', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arimo, sans-serif', overflow: 'hidden' }}>

        {/* Back Button */}
        <div style={{ position: 'fixed', top: '27px', left: '39px', zIndex: 10 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="login-card" style={{ background: 'rgba(13,19,56,0.25)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Top Nav */}
          <div style={{ padding: '16px 20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <img src={AlumnAILogo} alt="AlumnAI Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
            <div style={{ width: '80%', background: 'rgba(243,243,245,0.17)', borderRadius: '10px', padding: '2px', display: 'flex' }}>
              <Link to="/signup" style={{ flex: 1, textDecoration: 'none' }}>
                <button style={{ width: '100%', height: '24px', background: 'transparent', borderRadius: '8px', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                  Sign up
                </button>
              </Link>
              <button style={{ flex: 1, height: '24px', background: '#155DFC', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: '#FFFFFF', cursor: 'pointer' }}>
                Log in
              </button>
            </div>
          </div>

          {/* Google Button + OR divider */}
          <div style={{ padding: '0 20px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={handleGoogleLogin} disabled={loading} style={{ width: '50%', height: '42px', background: 'rgba(243,243,245,0.17)', border: '1.23674px solid rgba(0,0,0,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '12px', opacity: loading ? 0.6 : 1 }}>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#F44336" d="M24 9.5c3.1 0 5.8 1.1 7.9 2.9l5.9-5.9C34.3 3.5 29.4 1.5 24 1.5 15.1 1.5 7.5 6.8 4.1 14.3l6.9 5.4C12.7 13.6 17.9 9.5 24 9.5z"/>
                <path fill="#4CAF50" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.2z" opacity=".99"/>
                <path fill="#FFC107" d="M11 28.3c-.5-1.4-.8-2.8-.8-4.3s.3-2.9.8-4.3l-6.9-5.4C2.5 17.1 1.5 20.4 1.5 24s1 6.9 2.6 9.7l6.9-5.4z"/>
                <path fill="#1565C0" d="M24 46.5c5.4 0 10-1.8 13.3-4.8l-7-5.4c-1.8 1.2-4 1.9-6.3 1.9-6.1 0-11.3-4.1-13.1-9.6l-6.9 5.4C7.5 41.2 15.1 46.5 24 46.5z" opacity=".99"/>
              </svg>
              <span style={{ fontFamily: 'Arimo', fontSize: '13px', color: '#FFFFFF' }}>with Google</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', width: '100%' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#FFFFFF' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          {/* Form Card */}
          <div style={{ margin: '0 5% 5%', flex: 1, background: 'rgba(13,19,56,0.25)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0px 4px 4px rgba(0,0,0,0.25)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px 10px', flexShrink: 0, textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '17px', color: '#FFFFFF', margin: '0 0 4px 0' }}>Welcome Back</h3>
              <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Please enter your details to log in</p>
            </div>

            <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Error */}
              {error && (
                <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '8px 12px' }}>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input style={inputStyle} type="email" placeholder="you@gmail.com" value={form.email} onChange={e => set('email', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input style={inputStyle} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <Link to="/forgot-password" style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#D9CA81', textDecoration: 'none' }}>Forgot Password?</Link>
                </div>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: '100%', height: '50px',
                  background: loading ? 'rgba(0,40,255,0.4)' : 'rgba(0,40,255,0.7)',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  border: 'none', borderRadius: '13px',
                  fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px',
                  color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p style={{ fontFamily: 'Arimo', fontSize: '12px', lineHeight: '40px', color: '#FFFFFF', textAlign: 'center', margin: 0 }}>
                Don't have an account? <Link to="/register" style={{ color: '#D9CA81', textDecoration: 'none', fontWeight: 700 }}>Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;