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

      let roleLabel = 'Alumni';
      if (email === 'superadmin@nu-dasma.edu.ph') roleLabel = 'Super Admin';
      else if (email === 'nudaao@nu-dasma.edu.ph') roleLabel = 'Admin';

      await logAction({
        action:      'Login',
        module:      'Authentication',
        description: `${roleLabel} logged in`,
        status:      'Success',
      });

      if (email === 'superadmin@nu-dasma.edu.ph') {
        navigate('/superadmin/super-admin-dashboard');
      } else if (email === 'nudaao@nu-dasma.edu.ph') {
        navigate('/admin/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
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