import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VerificationView from '../Views/Verificationview';

const VerificationCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const type  = location.state?.type  || 'recovery';

  const [code,      setCode]      = useState(['', '', '', '', '', '']);
  const [timer,     setTimer]     = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const inputRefs = useRef([]);

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
    if (!email)              return setError('Email not found. Please go back and try again.');
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: fullCode, type });
      if (error) throw error;
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
    setTimer(120);
    setError('');
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/verify`,
    });
  };

  const formatTime = (s) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <VerificationView
      code={code}
      error={error}
      loading={loading}
      canResend={canResend}
      timer={timer}
      inputRefs={inputRefs}
      formatTime={formatTime}
      handleChange={handleChange}
      handleKeyDown={handleKeyDown}
      handlePaste={handlePaste}
      handleVerify={handleVerify}
      handleResend={handleResend}
    />
  );
};

export default VerificationCode;