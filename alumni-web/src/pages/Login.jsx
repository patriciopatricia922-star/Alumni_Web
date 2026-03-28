import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import LoginView from '../Views/LoginView';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [form,         setForm]         = useState({ email: '', password: '' });

  React.useEffect(() => {
    if (location.state?.error) setError(location.state.error);
  }, [location.state]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleLogin = async () => {
    setError('');
    if (!form.email || !form.password) {
      return setError('Please enter your email and password.');
    }
    setLoading(true);
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (loginError) throw loginError;

      const email = form.email.toLowerCase().trim();
      const userId = loginData.user?.id;

      // Fetch user role and account status from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, account_status, first_name, last_name')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      }

      // Check if account is disabled
      if (userData?.account_status === 'disabled') {
        await supabase.auth.signOut();
        setError('Your account has been disabled. Please contact support.');
        setLoading(false);
        return;
      }

      let role = userData?.role || null;
      let redirectPath = '/dashboard';
      let roleLabel = 'Alumni';

      // Determine role based on database role
      if (role === 'superadmin') {
        roleLabel = 'Super Admin';
        redirectPath = '/superadmin/super-admin-dashboard';
      } else if (role === 'admin') {
        roleLabel = 'Admin';
        redirectPath = '/admin/admin-dashboard';
      } else if (email.endsWith('@nu-dasma.edu.ph')) {
        // Fallback for domain-based admin accounts
        roleLabel = 'Admin';
        redirectPath = '/admin/admin-dashboard';
      } else {
        roleLabel = 'Alumni';
        redirectPath = '/dashboard';
      }

      await logAction({
        action:      'Login',
        module:      'Authentication',
        description: `${roleLabel} logged in`,
        status:      'Success',
        user_id:     userId,
      });

      navigate(redirectPath);
    } catch (err) {
      await supabase.from('audit_logs').insert({
        user_id:     null,
        user_email:  form.email,
        user_role:   null,
        action:      'Login',
        module:      'Authentication',
        description: `Failed login attempt for ${form.email}`,
        status:      'Failed',
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
    />
  );
};

export default Login;