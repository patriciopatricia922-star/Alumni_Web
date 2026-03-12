import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const VerificationCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const type = location.state?.type || 'recovery';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) return setError('Please enter the full 6-digit code.');
    if (!email) return setError('Email not found. Please go back and try again.');
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type,
      });
      if (error) throw error;
      // OTP verified — now user can reset their password
      navigate('/reset-password');
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setCanResend(false);
    setTimer(30);
    setError('');
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/verify`,
    });
  };

  const formatTime = (s) => `00:${String(s).padStart(2, '0')}`;

  return (
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
          <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
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
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '0px',
      }}>
        {/* Title */}
        <h2 style={{
          fontFamily: 'Arimo', fontWeight: 700, fontSize: '17px',
          color: '#FFFFFF', margin: '0 0 12px 0', textAlign: 'center',
        }}>
          Verification
        </h2>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'Arimo', fontWeight: 400, fontSize: '14px',
          lineHeight: '20px', color: 'rgba(255,255,255,0.7)',
          textAlign: 'center', margin: '0 0 28px 0',
        }}>
          Enter Verification Code
        </p>

        {/* Error */}
        {error && (
          <div style={{
            width: '100%', background: 'rgba(255,80,80,0.15)',
            border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px',
            padding: '8px 12px', marginBottom: '16px', boxSizing: 'border-box',
          }}>
            <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* OTP Inputs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }} onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: '47px', height: '62px',
                background: digit ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                border: digit ? '2px solid #0057FF' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '15px',
                fontFamily: 'Arimo', fontWeight: 700, fontSize: '28px',
                color: '#002263', textAlign: 'center',
                outline: 'none', cursor: 'text',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0057FF'}
              onBlur={e => e.target.style.borderColor = digit ? '#0057FF' : 'rgba(255,255,255,0.2)'}
            />
          ))}
        </div>

        {/* Timer */}
        <p style={{
          fontFamily: 'Arimo', fontSize: '14px', lineHeight: '20px',
          color: 'rgba(255,255,255,0.7)', textAlign: 'center', margin: '0 0 4px 0',
        }}>
          {canResend ? 'Didn`t receive the code?' : `Send code again: ${formatTime(timer)}`}
        </p>

        {/* Resend */}
        <p
          onClick={handleResend}
          style={{
            fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px',
            lineHeight: '20px', color: canResend ? '#D9CA81' : 'rgba(217,202,129,0.4)',
            textAlign: 'center', margin: '0 0 28px 0',
            cursor: canResend ? 'pointer' : 'default',
            transition: 'color 0.2s',
          }}
        >
          Resend
        </p>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: '100%', height: '40px',
            background: loading ? 'rgba(0,40,255,0.4)' : 'rgba(0,40,255,0.7)',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            border: 'none', borderRadius: '13px',
            fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px',
            color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  );
};

export default VerificationCode;