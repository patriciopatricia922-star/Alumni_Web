import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import LoginView from '../Views/LoginView';

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
      // 1. Authenticate
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email, 
        password: form.password,
      });
      if (loginError) throw loginError;

      const userEmail = loginData.user?.email;
      const userId = loginData.user?.id;

      // 2. Fetch User Data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, account_status, first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        // Specifically check for the recursion error message
        const isRecursion = userError.message?.includes('infinite recursion');
        throw new Error(isRecursion ? "Database RLS Error: Fix recursion in SQL Editor." : userError.message);
      }

      // 3. Account Status Check
      if (userData?.account_status === 'disabled') {
        await supabase.auth.signOut();
        setError('Your account has been disabled. Please contact support.');
        setLoading(false);
        return;
      }

      // 4. Role & Domain Validation Logic
      const rawRole = userData?.role?.toLowerCase().trim() || 'alumni';
      
      // Enforce: Admin/SuperAdmin must use @nu-dasma.edu.ph
      if ((rawRole === 'admin' || rawRole === 'superadmin') && !userEmail.endsWith('@nu-dasma.edu.ph')) {
        await supabase.auth.signOut();
        setError('Staff roles must use @nu-dasma.edu.ph email.');
        setLoading(false);
        return;
      }

      // Enforce: Alumni must use @gmail.com
      if (rawRole === 'alumni' && !userEmail.endsWith('@gmail.com')) {
        await supabase.auth.signOut();
        setError('Alumni accounts must use @gmail.com email.');
        setLoading(false);
        return;
      }

      let redirectPath = '/dashboard';
      let roleLabel = 'Alumni';

      if (rawRole === 'superadmin') {
        roleLabel = 'Super Admin';
        redirectPath = '/superadmin/super-admin-dashboard';
      } else if (rawRole === 'admin') {
        roleLabel = 'Admin';
        redirectPath = '/admin/admin-dashboard';
      }

      // 5. Audit Logging
      await logAction({ 
        action: 'Login', 
        module: 'Authentication', 
        description: `${roleLabel} logged in via Modal`, 
        status: 'Success', 
        user_id: userId 
      });

      onSuccess(redirectPath);
    } catch (err) {
      console.error('Modal Login Error:', err);
      setError(err.message || 'Invalid email or password.');
      
      // Attempt to log the failure
      try {
        await supabase.from('audit_logs').insert({
          user_email: form.email,
          action: 'Login',
          module: 'Authentication',
          description: `Failed modal login attempt: ${err.message}`,
          status: 'Failed',
        });
      } catch (logErr) {
        console.error('Could not log failure:', logErr);
      }
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
      setError(err.message || 'Google sign-in failed.');
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
      isModal
      onSwitchToRegister={onSwitchToRegister}
    />
  );
};

export default ModalLogin;