import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ForgotPasswordView from '../Views/Forgotpasswordview';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');

    try {
      const { data: existingUser, error: lookupErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (lookupErr) throw lookupErr;

      if (!existingUser) {
        setError('No account found with that email. Please use the same email you registered with.');
        setLoading(false);
        return;
      }

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
    <ForgotPasswordView
      email={email}
      setEmail={setEmail}
      loading={loading}
      sent={sent}
      error={error}
      setError={setError}
      handleSubmit={handleSubmit}
      isModal
      onSwitchToLogin={onSwitchToLogin}
    />
  );
};

export default ForgotPassword;