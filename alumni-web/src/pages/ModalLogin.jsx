import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import LoginView from '../Views/LoginView';

/**
 * Modal-aware Login — identical Supabase logic to Login.jsx.
 * Instead of navigate(redirectPath), calls onSuccess(redirectPath)
 * so the parent (LandingPage) can do the navigate.
 */
const ModalLogin = ({ onSuccess, onSwitchToRegister, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [form,         setForm]         = useState({ email: '', password: '' });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleLogin = async () => {
    setError('');
    if (!form.email || !form.password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email, password: form.password,
      });
      if (loginError) throw loginError;

      const email  = form.email.toLowerCase().trim();
      const userId = loginData.user?.id;

      const { data: userData, error: userError } = await supabase
        .from('users').select('role, account_status, first_name, last_name').eq('id', userId).single();
      if (userError) console.error('Error fetching user data:', userError);

      if (userData?.account_status === 'disabled') {
        await supabase.auth.signOut();
        setError('Your account has been disabled. Please contact support.');
        setLoading(false);
        return;
      }

      const role = userData?.role || null;
      let redirectPath = '/dashboard';
      let roleLabel    = 'Alumni';

      if (role === 'superadmin') { roleLabel = 'Super Admin'; redirectPath = '/superadmin/super-admin-dashboard'; }
      else if (role === 'admin') { roleLabel = 'Admin';       redirectPath = '/admin/admin-dashboard'; }
      else if (email.endsWith('@nu-dasma.edu.ph')) { roleLabel = 'Admin'; redirectPath = '/admin/admin-dashboard'; }
      else { roleLabel = 'Alumni'; redirectPath = '/dashboard'; }

      await logAction({ action: 'Login', module: 'Authentication', description: `${roleLabel} logged in`, status: 'Success', user_id: userId });

      // ── Instead of navigate, call onSuccess so landing page navigates ──
      onSuccess(redirectPath);
    } catch (err) {
      await supabase.from('audit_logs').insert({
        user_id: null, user_email: form.email, user_role: null,
        action: 'Login', module: 'Authentication',
        description: `Failed login attempt for ${form.email}`, status: 'Failed',
      });
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
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

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
      // Modal context
      isModal
      onSwitchToRegister={onSwitchToRegister}
    />
  );
};

export default ModalLogin;