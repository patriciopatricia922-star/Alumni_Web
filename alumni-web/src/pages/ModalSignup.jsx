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

/** Normalizes a name part: lowercase, collapse internal spaces, trim. */
const normalizeName = (str = '') =>
  str.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Modal-aware Signup — identical Supabase logic to Signup.jsx.
 * Instead of navigate('/login'), calls onSwitchToLogin() to close the modal.
 */
const ModalSignup = ({ idExtracted, onSuccess, onSwitchToLogin, onClose }) => {
  const idData = idExtracted || {};

  const [agreed,              setAgreed]              = useState(false);
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

  // ── Name-level duplicate check ──────────────────────────────────────────────
  /**
   * Queries the users table for any existing record whose normalized
   * first_name + last_name matches the current form values.
   * Middle name is intentionally excluded — it is optional and unreliable
   * as a deduplication signal.
   *
   * Returns the matched row (truthy) or null (no duplicate).
   */
  const checkNameDuplicate = async (firstName, lastName) => {
    const normFirst = normalizeName(firstName);
    const normLast  = normalizeName(lastName);

    // Fetch all rows whose first/last name could be a match.
    // ilike is case-insensitive; the JS normalization handles extra spaces.
    const { data, error: queryError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .ilike('first_name', normFirst)
      .ilike('last_name',  normLast);

    if (queryError) throw queryError;
    if (!data || data.length === 0) return null;

    // Secondary JS pass: collapse internal whitespace before comparing,
    // guarding against values stored with inconsistent spacing in the DB.
    const match = data.find(
      (row) =>
        normalizeName(row.first_name) === normFirst &&
        normalizeName(row.last_name)  === normLast
    );

    return match || null;
  };
  // ───────────────────────────────────────────────────────────────────────────

  const handleSignup = async () => {
    setError('');
    const required   = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    const newTouched = required.reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(prev => ({ ...prev, ...newTouched }));

    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword)
      return setError('Please fill in all required fields.');
    // if (!agreed)
    //   return setError('Please agree to the Terms of Service and Privacy Policy.');
    if (fieldErrors.email)           { setTouched(prev => ({ ...prev, email: true })); return; }
    if (form.password.length < 8)    return setError('Password must be at least 8 characters long.');
    if (fieldErrors.password)        return setError(fieldErrors.password);
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      // ── 1. Name-level duplicate check (runs before auth signup) ────────────
      const nameDuplicate = await checkNameDuplicate(form.firstName, form.lastName);
      if (nameDuplicate) {
        setFieldErrors(prev => ({
          ...prev,
          firstName: 'A record with this name already exists.',
          lastName:  'A record with this name already exists.',
        }));
        setTouched(prev => ({ ...prev, firstName: true, lastName: true }));
        // Surface a clear, actionable message without exposing the existing email.
        return setError(
          'An account with this name is already registered. ' +
          'If this is you, please log in instead or contact support.'
        );
      }
      // ───────────────────────────────────────────────────────────────────────

      // ── 2. Supabase auth signup ────────────────────────────────────────────
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { first_name: form.firstName, middle_name: form.middleName, last_name: form.lastName } },
      });
      if (signUpError) throw signUpError;

      // ── 3. Insert/upsert user profile row ──────────────────────────────────
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

      // ── Switch to login modal on success ───────────────────────────────────
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
      agreed={agreed}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      passwordStrength={passwordStrength}
      setAgreed={setAgreed}
      setShowPassword={setShowPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      handleChange={handleChange}
      handleBlur={handleBlur}
      handleSignup={handleSignup}
      // Modal context
      isModal
      onClose={onClose}
      onSwitchToLogin={onSwitchToLogin}
    />
  );
};

export default ModalSignup;