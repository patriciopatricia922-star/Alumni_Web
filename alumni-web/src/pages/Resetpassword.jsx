import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const EyeIcon = ({ visible }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#FFFFFF" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="2"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
        <line x1="1" y1="1" x2="23" y2="23" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
      </>
    )}
  </svg>
);

const inputStyle = {
  width: '100%', height: '36px',
  background: 'rgba(243,243,245,0.17)',
  border: '1.23674px solid rgba(0,0,0,0.25)',
  borderRadius: '8px', padding: '4px 36px 4px 12px',
  fontFamily: 'Montserrat', fontWeight: 400, fontSize: '12px',
  color: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: 'Montserrat', fontWeight: 400, fontSize: '13px',
  lineHeight: '38px', color: '#FFFFFF', display: 'block', margin: 0,
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength dots
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0–4
  };

  const strength = getStrength(newPassword);
  const strengthColors = ['rgba(255,255,255,0.2)', '#FF4444', '#FF9500', '#FFD700', '#00C853'];
  const dots = 8;

  const StrengthDots = () => (
    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
      {Array.from({ length: dots }).map((_, i) => (
        <div key={i} style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: i < (strength * 2) ? strengthColors[strength] : 'rgba(255,255,255,0.2)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  );

  const handleReset = async () => {
    setError('');
    if (!newPassword || !confirmPassword) return setError('Please fill in both fields.');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters long.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#002263',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Montserrat, Arial, sans-serif',
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
        {/* Title */}
        <h2 style={{
          fontFamily: 'Montserrat', fontWeight: 700, fontSize: '17px',
          color: '#FFFFFF', margin: '0 0 8px 0', textAlign: 'center',
        }}>
          Reset Password
        </h2>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'Montserrat', fontWeight: 400, fontSize: '14px',
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
            <p style={{ fontFamily: 'Montserrat', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(0,200,83,0.15)',
            border: '1px solid rgba(0,200,83,0.4)',
            borderRadius: '8px', padding: '8px 12px', marginBottom: '16px',
          }}>
            <p style={{ fontFamily: 'Montserrat', fontSize: '11px', color: '#00C853', margin: 0 }}>
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
              onClick={() => setShowNew(!showNew)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <EyeIcon visible={showNew} />
            </button>
          </div>
          <StrengthDots />
          <p style={{ fontFamily: 'Montserrat', fontSize: '11px', lineHeight: '24px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0' }}>
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
              onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <EyeIcon visible={showConfirm} />
            </button>
          </div>
          <p style={{ fontFamily: 'Montserrat', fontSize: '11px', lineHeight: '24px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0' }}>
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
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            border: 'none', borderRadius: '13px',
            fontFamily: 'Montserrat', fontWeight: 700, fontSize: '15px',
            color: '#FFFFFF', cursor: loading || success ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;