import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');

    try {
      // ── Check if account exists in users table first ──────────────────────
      const { data: existingUser, error: lookupErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (lookupErr) throw lookupErr;

      if (!existingUser) {
        setError("No account found with that email. Please use the same email you registered with.");
        setLoading(false);
        return;
      }

      // ── Account exists — send reset email ─────────────────────────────────
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/verify`,
      });

      if (resetError) throw resetError;

      setSent(true);
      navigate('/verify', { state: { email: email.trim(), type: 'recovery' } });

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: '#002263',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Arimo',
    }}>

      {/* Back Button */}
      <button
        onClick={() => navigate('/login')}
        style={{
          position: 'absolute', top: '20px', left: '20px',
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>
          Back
        </span>
      </button>

      {/* Card */}
      <div style={{
        width: '368px',
        background: 'rgba(13, 19, 56, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: '13px',
        padding: '40px 16px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Title */}
        <h2 style={{
          fontFamily: 'Arimo', fontWeight: 700,
          fontSize: '17px', lineHeight: '38px',
          color: '#FFFFFF', margin: '0 0 8px 0',
          textAlign: 'center',
        }}>
          Forgot Password
        </h2>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'Arimo', fontWeight: 400,
          fontSize: '14px', lineHeight: '20px',
          textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)',
          margin: '0 0 28px 0',
          padding: '0 8px',
        }}>
          Provide the email address associated with your account
        </p>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '16px 8px 8px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(43, 114, 251, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#2B72FB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '14px', lineHeight: '22px', color: '#FFFFFF', margin: '0 0 6px 0' }}>
              Reset link sent!
            </p>
            <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '13px', lineHeight: '20px', color: 'rgba(255,255,255,0.6)', margin: '0 0 24px 0' }}>
              Check your email inbox and follow the instructions to reset your password.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '339px', height: '40px',
                background: 'rgba(0, 40, 255, 0.7)',
                boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                borderRadius: '13px', border: 'none',
                cursor: 'pointer', color: '#FFFFFF',
                fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px',
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div style={{ width: '100%' }}>

            {/* Email field */}
            <div style={{ marginBottom: '16px', padding: '0 2px' }}>
              <label style={{
                fontFamily: 'Arimo', fontWeight: 400,
                fontSize: '13px', lineHeight: '38px',
                color: '#FFFFFF', display: 'block',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="name@gmail.com"
                style={{
                  width: '100%', height: '36px',
                  background: 'rgba(243, 243, 245, 0.17)',
                  border: error ? '1.24px solid rgba(255,80,80,0.6)' : '1.24px solid rgba(0,0,0,0.25)',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  fontFamily: 'Arimo', fontWeight: 400,
                  fontSize: '13px', lineHeight: '24px',
                  color: '#FFFFFF', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error toast-style banner */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                background: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '16px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,100,100,0.9)" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="rgba(255,100,100,0.9)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p style={{
                  fontFamily: 'Arimo', fontSize: '12px', lineHeight: '18px',
                  color: 'rgba(255,150,150,0.95)', margin: 0,
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '339px', height: '40px',
                background: loading ? 'rgba(0,40,255,0.4)' : 'rgba(0, 40, 255, 0.7)',
                boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                borderRadius: '13px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: '#FFFFFF',
                fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px',
                lineHeight: '38px', textAlign: 'center',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Checking...' : 'Send Reset Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;