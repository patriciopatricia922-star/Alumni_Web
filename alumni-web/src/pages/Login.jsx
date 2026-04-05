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

      const userId = loginData.user?.id;

      // 1. Fetch user metadata
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, account_status')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Database Fetch Error:', userError);
        // If user exists in Auth but not in public.users, they need to complete profile
        navigate('/personal-information'); 
        return;
      }

      // 2. Check Account Status
      if (userData?.account_status === 'disabled') {
        await supabase.auth.signOut();
        setError('Your account has been disabled. Please contact support.');
        setLoading(false);
        return;
      }

      // 3. Normalized Role Detection
      const rawRole = userData?.role?.toLowerCase().trim() || 'alumni';
      let redirectPath = '/dashboard';
      let roleLabel = 'Alumni';

      switch (rawRole) {
        case 'superadmin':
          roleLabel = 'Super Admin';
          redirectPath = '/superadmin/super-admin-dashboard';
          break;
        case 'admin':
          roleLabel = 'Admin';
          redirectPath = '/admin/admin-dashboard';
          break;
        case 'alumni':
        default:
          roleLabel = 'Alumni';
          redirectPath = '/dashboard';
          break;
      }

      // 4. Audit Logging
      await logAction({
        action: 'Login',
        module: 'Authentication',
        description: `${roleLabel} logged in successfully`,
        status: 'Success',
        user_id: userId,
      });

      // 5. Final Navigation
      navigate(redirectPath);

    } catch (err) {
      console.error('Login Process Error:', err);
      setError(err.message || 'Invalid email or password.');
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