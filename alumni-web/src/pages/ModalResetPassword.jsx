// ModalResetPassword.jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import ModalResetPasswordView from '../Views/ModalResetPasswordView';

/**
 * ModalResetPassword
 *
 * Modal equivalent of ResetPassword.jsx.
 * Follows the same pattern as ModalForgotPassword.
 *
 * Props:
 *   onClose  — closes the entire modal overlay
 *   onBack   — optional: go back to login modal
 */
const ModalResetPassword = ({ onClose, onBack }) => {
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);

  /* ── Password strength calculation ───────────────────────── */
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8)          score++;
    if (/[A-Z]/.test(pw))        score++;
    if (/[0-9]/.test(pw))        score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPassword);

  /* ── Handle reset password ───────────────────────────────── */
  const handleReset = async () => {
    setError('');
    
    // Validation
    if (!newPassword || !confirmPassword) {
      return setError('Please fill in both fields.');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess(true);
      // After 2 seconds, allow navigation back to login
      setTimeout(() => {
        if (onBack) onBack();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalResetPasswordView
      showNew={showNew}
      showConfirm={showConfirm}
      newPassword={newPassword}
      confirmPassword={confirmPassword}
      loading={loading}
      error={error}
      success={success}
      strength={strength}
      setShowNew={setShowNew}
      setShowConfirm={setShowConfirm}
      setNewPassword={setNewPassword}
      setConfirmPassword={setConfirmPassword}
      handleReset={handleReset}
      onClose={onClose}
      onBack={onBack}
    />
  );
};

export default ModalResetPassword;