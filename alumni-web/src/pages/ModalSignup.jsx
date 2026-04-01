import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import SignupView from '../Views/Signupview';

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[a-z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 1, label: 'Weak',   color: '#F87171' };
  if (score <= 3) return { level: 2, label: 'Good',   color: '#FBBF24' };
  return           { level: 3, label: 'Strong', color: '#34D399' };
};

/**
 * Modal-aware Signup — identical Supabase logic to Signup.jsx.
 * Instead of navigate('/login'), calls onSuccess() to close the modal.
 */
const ModalSignup = ({ idExtracted, onSuccess, onSwitchToLogin, onClose }) => {
  const idData = idExtracted || {};

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [error,               setError]               = useState('');
  const [touched,             setTouched]             = useState({});
  const [fieldErrors,         setFieldErrors]         = useState({});

  const [form, setForm] = useState({
    lastName:        idData.lastName   || '',
    firstName:       idData.firstName  || '',
    middleName:      idData.middleName || '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });

  const set   = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const touch = (key)        => setTouched(prev => ({ ...prev, [key]: true }));
  const passwordStrength = getPasswordStrength(form.password);

  const validateField = (key, value) => {
    const errs = { ...fieldErrors };
    switch (key) {
      case 'email': {
        const trimmed = value.toLowerCase().trim();
        if (trimmed && trimmed.includes('@') && !trimmed.endsWith('@gmail.com')) {
          errs.email = 'Only @gmail.com accounts are accepted.';
        } else { delete errs.email; }
        break;
      }
      case 'password': {
        if (value && value.length < 8) errs.password = 'Must be at least 8 characters.';
        else delete errs.password;
        if (touched.confirmPassword && form.confirmPassword) {
          if (form.confirmPassword !== value) errs.confirmPassword = 'Passwords do not match.';
          else delete errs.confirmPassword;
        }
        break;
      }
      case 'confirmPassword': {
        if (value && value !== form.password) errs.confirmPassword = 'Passwords do not match.';
        else delete errs.confirmPassword;
        break;
      }
      default: break;
    }
    setFieldErrors(errs);
  };

  const handleChange = (key, value) => { set(key, value); if (touched[key]) validateField(key, value); };
  const handleBlur   = (key)         => { touch(key); validateField(key, form[key]); };

  const handleSignup = async () => {
    setError('');
    const required  = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    const newTouched = required.reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(prev => ({ ...prev, ...newTouched }));

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword)
      return setError('Please fill in all required fields.');
    if (fieldErrors.email)           { setTouched(prev => ({ ...prev, email: true })); return; }
    if (form.password.length < 8)    return setError('Password must be at least 8 characters long.');
    if (fieldErrors.password)        return setError(fieldErrors.password);
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { first_name: form.firstName, middle_name: form.middleName, last_name: form.lastName } },
      });
      if (signUpError) throw signUpError;

      const { error: insertError } = await supabase.from('users').upsert({
        id:          data.user.id,
        email:       form.email,
        first_name:  form.firstName,
        middle_name: form.middleName || null,
        last_name:   form.lastName,
        program:     idData.program   || null,
        batch_year:  idData.batchYear ? parseInt(idData.batchYear) : null,
        role:        'alumni',
      }, { onConflict: 'id' });

      if (insertError) {
        await supabase.auth.signOut();
        throw new Error('Account setup incomplete. Please try signing up again.');
      }

      try {
        await supabase.from('alumni_profiles').upsert({
          user_id: data.user.id, profile_completion_percentage: 10,
        }, { onConflict: 'user_id' });
      } catch (_) {}

      // ── Instead of navigate('/login'), switch to login modal ──
      onSwitchToLogin();
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.includes('409') || msg.toLowerCase().includes('unique')) {
        setFieldErrors(prev => ({ ...prev, email: 'This email is already registered. Please log in instead.' }));
        setTouched(prev => ({ ...prev, email: true }));
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupView
      form={form}
      idData={idData}
      error={error}
      fieldErrors={fieldErrors}
      touched={touched}
      loading={loading}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      passwordStrength={passwordStrength}
      setShowPassword={setShowPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      handleChange={handleChange}
      handleBlur={handleBlur}
      handleSignup={handleSignup}
      // Modal context
      isModal
      onSwitchToLogin={onSwitchToLogin}
    />
  );
};

export default ModalSignup;