// ModalLogin.jsx (Alternative - using parent modal manager for flow)
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import LoginView from '../Views/LoginView';

/**
 * ModalLogin
 *
 * Uses parent modal manager for forgot password flow.
 *
 * Props:
 *   onSuccess              — called with redirectPath after successful login
 *   onSwitchToRegister     — opens the registration modal
 *   onSwitchToForgotPassword — opens the forgot password modal
 *   onClose                — closes the entire modal overlay
 */
const ModalLogin = ({ 
  onSuccess, 
  onSwitchToRegister, 
  onSwitchToForgotPassword,  // Add this prop
  onClose 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  /* ── Login handler ─────────────────────────────────────────── */
  const handleLogin = async () => {
    setError('');
    if (!form.email || !form.password) {
      return setError('Please enter your email and password.');
    }
    setLoading(true);

    try {
      // 1. Authenticate
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (loginError) throw loginError;

      const userEmail = loginData.user?.email;
      const userId    = loginData.user?.id;

      // 2. Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, account_status, first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        const isRecursion = userError.message?.includes('infinite recursion');
        throw new Error(
          isRecursion
            ? 'Database RLS Error: Fix recursion in SQL Editor.'
            : userError.message,
        );
      }

      // 3. Account status check
      if (userData?.account_status === 'disabled') {
        await supabase.auth.signOut();
        setError('Your account has been disabled. Please contact support.');
        setLoading(false);
        return;
      }

      // 4. Role & domain validation
      const rawRole = userData?.role?.toLowerCase().trim() || 'alumni';

      if (
        (rawRole === 'admin' || rawRole === 'superadmin') &&
        !userEmail.endsWith('@nu-dasma.edu.ph')
      ) {
        await supabase.auth.signOut();
        setError('Staff roles must use @nu-dasma.edu.ph email.');
        setLoading(false);
        return;
      }

      if (rawRole === 'alumni' && !userEmail.endsWith('@gmail.com')) {
        await supabase.auth.signOut();
        setError('Alumni accounts must use @gmail.com email.');
        setLoading(false);
        return;
      }

      let redirectPath = '/dashboard';
      let roleLabel    = 'Alumni';

      if (rawRole === 'superadmin') {
        roleLabel    = 'Super Admin';
        redirectPath = '/superadmin/super-admin-dashboard';
      } else if (rawRole === 'admin') {
        roleLabel    = 'Admin';
        redirectPath = '/admin/admin-dashboard';
      }

      // 5. Audit logging
      await logAction({
        action:      'Login',
        module:      'Authentication',
        description: `${roleLabel} logged in via Modal`,
        status:      'Success',
        user_id:     userId,
      });

      onSuccess(redirectPath);
    } catch (err) {
      console.error('Modal Login Error:', err);
      setError(err.message || 'Invalid email or password.');

      try {
        await supabase.from('audit_logs').insert({
          user_email:  form.email,
          action:      'Login',
          module:      'Authentication',
          description: `Failed modal login attempt: ${err.message}`,
          status:      'Failed',
        });
      } catch (logErr) {
        console.error('Could not log failure:', logErr);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Google OAuth handler ──────────────────────────────────── */
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
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  /* ── Forgot Password handler ───────────────────────────────── */
  const handleForgotPassword = () => {
    // Pass the current email to pre-fill the forgot password form
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword(form.email);
    }
  };

  /* ── Default: Login view ───────────────────────────────────── */
  return (
    <LoginView
      form={form}
      set={set}
      error={error}
      loading={loading}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      handleLogin={handleLogin}
      handleGoogleLogin={handleGoogleLogin}
      isModal
      onClose={onClose}
      onSwitchToRegister={onSwitchToRegister}
      onSwitchToForgotPassword={handleForgotPassword}
    />
  );
};

export default ModalLogin;