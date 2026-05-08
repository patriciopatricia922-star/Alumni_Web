// ModalVerification.jsx
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ModalVerificationView from '../Views/ModalVerificationView';

/**
 * ModalVerification
 *
 * Modal equivalent of VerificationCode.jsx.
 * Follows the same pattern as ModalLogin / ModalForgotPassword.
 *
 * Props:
 *   email            — email address the OTP was sent to
 *   type             — OTP type, defaults to 'recovery'
 *   onClose          — closes the entire modal overlay
 *   onBack           — optional: go back to previous modal step
 *   onResetPassword  — callback to show reset password modal
 */
const ModalVerification = ({ email = '', type = 'recovery', onClose, onBack, onResetPassword }) => {
  const [code,      setCode]      = useState(['', '', '', '', '', '']);
  const [timer,     setTimer]     = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const inputRefs = useRef([]);

  // Prevents double-tap on Resend triggering a second /auth/v1/recover
  // request before the first resolves — Supabase rate-limits this (429).
  const resendingRef = useRef(false);

  /* ── Countdown timer ──────────────────────────────────────── */
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* ── OTP input handlers ───────────────────────────────────── */
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

  /* ── Verify ───────────────────────────────────────────────── */
  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) return setError('Please enter the full 6-digit code.');
    if (!email)              return setError('Email not found. Please go back and try again.');
    setError('');
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type,
      });
      if (verifyError) throw verifyError;
      // Advance to reset password modal
      if (onResetPassword) {
        onResetPassword();
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend ───────────────────────────────────────────────── */
  const handleResend = async () => {
    if (!canResend || !email) return;
    if (resendingRef.current) return;

    resendingRef.current = true;
    setCanResend(false);
    setTimer(120);
    setError('');

    try {
      // redirectTo is intentionally omitted — see ModalForgotPassword for
      // the full explanation. Short version: omitting it keeps the email
      // as a plain OTP code only (matching the {{ .Token }} template),
      // preventing a magic link from consuming the token before entry.
      await supabase.auth.resetPasswordForEmail(email);
    } catch (err) {
      // Resend failed — surface the error and re-enable the button
      setError(err.message || 'Failed to resend code. Please try again.');
      setCanResend(true);
    } finally {
      resendingRef.current = false;
    }
  };

  /* ── Time formatter ───────────────────────────────────────── */
  const formatTime = (s) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <ModalVerificationView
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
      onClose={onClose}
      onBack={onBack}
    />
  );
};

export default ModalVerification;