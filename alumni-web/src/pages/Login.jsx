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
      // 1. Supabase Auth Sign In
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (loginError) throw loginError;

      const userId = loginData.user?.id;
      const userEmail = loginData.user?.email;

      // 2. Fetch user role and status from 'users' table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, account_status')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Database Fetch Error:', userError);
        // If there's a database error (like RLS recursion), we stay here and show it
        throw new Error(`Profile Access Error: ${userError.message}`);
      }

      // 3. Check Account Status
      if (userData?.account_status === 'disabled') {
        await supabase.auth.signOut();
        setError('Your account has been disabled. Please contact support.');
        setLoading(false);
        return;
      }

      // 4. Email Domain & Role Validation
      const rawRole = userData?.role?.toLowerCase().trim() || 'alumni';
      
      // Enforce: Admin/SuperAdmin must use @nu-dasma.edu.ph
      if ((rawRole === 'admin' || rawRole === 'superadmin') && !userEmail.endsWith('@nu-dasma.edu.ph')) {
        await supabase.auth.signOut();
        setError('Staff/Admin roles must use a @nu-dasma.edu.ph email.');
        setLoading(false);
        return;
      }

      // Enforce: Alumni must use @gmail.com
      if (rawRole === 'alumni' && !userEmail.endsWith('@gmail.com')) {
        await supabase.auth.signOut();
        setError('Alumni accounts must use a @gmail.com email.');
        setLoading(false);
        return;
      }

      // 5. Normalized Role & Redirect Path Detection
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

      // 6. Audit Logging
      await logAction({
        action: 'Login',
        module: 'Authentication',
        description: `${roleLabel} logged in successfully`,
        status: 'Success',
        user_id: userId,
      });

      // 7. Final Navigation
      navigate(redirectPath);

    } catch (err) {
      console.error('Login Process Error:', err);
      // Clean up the error message for the user
      const friendlyMessage = err.message?.includes('infinite recursion') 
        ? "Database Policy Error: Please fix RLS recursion in Supabase." 
        : err.message || 'Invalid email or password.';
      setError(friendlyMessage);
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