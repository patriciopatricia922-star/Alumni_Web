// ModalForgotPassword.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ModalForgotPasswordView from '../Views/Modalforgotpasswordview';
import ModalVerification from './ModalVerification';

/**
 * ModalForgotPassword
 *
 * Manages its own verification sub-view inline so the full
 * forgot-password → OTP → reset-password flow stays within
 * the modal stack without any page navigation.
 *
 * Props:
 *   onSwitchToLogin  — callback to return to the login modal
 *   onClose          — callback to close the entire modal overlay
 *   onResetPassword  — callback to open the reset-password modal
 */
const ModalForgotPassword = ({ onSwitchToLogin, onClose, onResetPassword }) => {
  const navigate = useNavigate();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  // Controls which sub-view is active
  const [view, setView] = useState('forgotPassword'); // 'forgotPassword' | 'verification'

  // Prevents double-submission that triggers Supabase's 429 rate limit
  // on /auth/v1/recover. React state updates are async so checking
  // `loading` alone doesn't block a second click before setLoading flushes.
  const submittingRef = useRef(false);

  /* ── Submit handler ───────────────────────────────────────── */
  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    submittingRef.current = true;

    try {
      // 1. Verify account exists
      const { data: existingUser, error: lookupErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (lookupErr) throw lookupErr;

      if (!existingUser) {
        setError('No account found with that email. Please use the same email you registered with.');
        setLoading(false);
        submittingRef.current = false;
        return;
      }

      // 2. Send OTP recovery email.
      // redirectTo is intentionally omitted. The Supabase email template
      // contains only {{ .Token }} (a 6-digit OTP code). Adding redirectTo
      // would embed a magic link alongside the code — if that link is
      // clicked (or pre-fetched by an email client) it consumes the token
      // before the user can enter it, causing every verifyOtp() call to
      // return 403.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
      );

      if (resetError) throw resetError;

      setSent(true);
      // Transition to verification step inside the modal
      setView('verification');

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      submittingRef.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  };

  /* ── Back to login ────────────────────────────────────────── */
  const handleBackToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      if (onClose) onClose();
      navigate('/', { state: { openLogin: true } });
    }
  };

  /* ── Sub-view: Verification ───────────────────────────────── */
  if (view === 'verification') {
    return (
      <ModalVerification
        email={email.trim().toLowerCase()}
        type="recovery"
        onClose={onClose}
        onBack={() => setView('forgotPassword')}
        onResetPassword={onResetPassword}
      />
    );
  }

  /* ── Default: Forgot Password view ───────────────────────── */
  return (
    <ModalForgotPasswordView
      email={email}
      setEmail={setEmail}
      loading={loading}
      sent={sent}
      error={error}
      setError={setError}
      handleSubmit={handleSubmit}
      onBack={handleBackToLogin}
      onClose={onClose}
    />
  );
};

export default ModalForgotPassword;