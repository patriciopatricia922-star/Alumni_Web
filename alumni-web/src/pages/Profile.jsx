import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProfileView from '../views/ProfileView';

// ── Responsive hook ────────────────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

// ── Profile strength fields (combined from users and personal_background_data) ──
const REQUIRED_FIELDS = [
  'first_name', 'last_name', 'program',
  'batch_year', 'gender', 'birthday', 'civil_status',
  'street_address', 'city', 'province', 'zip_code', 'country',
  'contact_number', 'student_number',
];

const normalizeUserData = (userData = {}, surveyData = {}) => ({
  avatar_url: userData.avatar_url,

  first_name:  userData.first_name  ?? surveyData.first_name,
  last_name:   userData.last_name   ?? surveyData.last_name,

  program:    userData.program,
  batch_year: userData.batch_year,

  gender:       surveyData.gender,
  birthday:     surveyData.birthday,
  civil_status: surveyData.civil_status,

  street_address: surveyData.street_address,
  city:           surveyData.city,
  province:       surveyData.province,
  zip_code:       surveyData.zip_code,
  country:        surveyData.country,

  contact_number: surveyData.contact_number,
  student_number: surveyData.student_number,
});

const calcStrength = (userData, surveyData) => {
  if (!userData) return 0;
  const combined = normalizeUserData(userData, surveyData);
  const filled   = REQUIRED_FIELDS.filter((f) => {
    const val = combined[f];
    return val !== null && val !== undefined && String(val).trim() !== '';
  }).length;
  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
};

// ── Personal Information form config ──────────────────────────────────────
export const PI_FORM_KEYS = [
  'firstName', 'middleName', 'lastName',
  'gender', 'birthday', 'civilStatus',
  'street', 'city', 'province', 'zipCode', 'country',
  'contactNumber',
  'academicProgram', 'yearGraduated', 'studentNumber',
  'email',
];

const EMPTY_PI_FORM = Object.fromEntries(PI_FORM_KEYS.map((k) => [k, '']));

export const validatePI = (form) => {
  const errors = {};
  if (!form.firstName?.trim())  errors.firstName  = 'First name is required.';
  if (!form.lastName?.trim())   errors.lastName   = 'Last name is required.';
  if (form.zipCode && !/^\d{4}$/.test(form.zipCode))
    errors.zipCode = 'Zip code must be 4 digits.';
  if (form.contactNumber) {
    const digits = form.contactNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11)
      errors.contactNumber = 'Enter a valid 10–11 digit number.';
  }
  if (form.yearGraduated && !/^\d{4}$/.test(form.yearGraduated))
    errors.yearGraduated = 'Enter a valid 4-digit year.';
  return errors;
};

// ── Password rules ─────────────────────────────────────────────────────────
export const PASSWORD_RULES = [
  { id: 'length',  label: 'At least 8 characters',          test: (v) => v.length >= 8 },
  { id: 'upper',   label: 'At least one uppercase letter',   test: (v) => /[A-Z]/.test(v) },
  { id: 'lower',   label: 'At least one lowercase letter',   test: (v) => /[a-z]/.test(v) },
  { id: 'number',  label: 'At least one number',             test: (v) => /[0-9]/.test(v) },
  { id: 'special', label: 'At least one special character',  test: (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) },
];

// ── Notification helpers ───────────────────────────────────────────────────
const NOTIF_KEY   = 'alumnai_read_notifs';
const getReadIds  = () => { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); } catch { return []; } };
const saveReadIds = (ids) => { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(ids)); } catch {} };

export const groupByDate = (list) => {
  const now       = new Date();
  const today     = new Date(now); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
  const groups    = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
  list.forEach((n) => {
    const d = new Date(n.time); d.setHours(0, 0, 0, 0);
    if      (d >= today)     groups['Today'].push(n);
    else if (d >= yesterday) groups['Yesterday'].push(n);
    else if (d >= weekAgo)   groups['This Week'].push(n);
    else                     groups['Earlier'].push(n);
  });
  return groups;
};

export const formatTime = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

// ── Format last password change ────────────────────────────────────────────
export const formatLastPasswordChange = (isoDate) => {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// Profile — Main Logic Component
// ══════════════════════════════════════════════════════════════════════════════
const Profile = () => {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // ── User / avatar ─────────────────────────────────────────────────────────
  const [user,               setUser]              = useState(null);
  const [surveyData,         setSurveyData]        = useState(null);
  const [avatarUrl,          setAvatarUrl]         = useState(null);
  const [strength,           setStrength]          = useState(0);
  const [lastPasswordChange, setLastPasswordChange] = useState(null);

  // ── Modal visibility ──────────────────────────────────────────────────────
  const [showPIModal, setShowPIModal] = useState(false);
  const [showCPModal, setShowCPModal] = useState(false);

  // ── Personal Information form state ───────────────────────────────────────
  const [piForm,        setPiForm]        = useState(EMPTY_PI_FORM);
  const [piFieldErrors, setPiFieldErrors] = useState({});
  const [piSaving,      setPiSaving]      = useState(false);
  const [piSaveSuccess, setPiSaveSuccess] = useState(false);
  const [piSaveError,   setPiSaveError]   = useState('');
  const [piLoading,     setPiLoading]     = useState(false);
  const piFormInitialized                  = useRef(false);

  // ── Change Password form state ────────────────────────────────────────────
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew,     setCpNew]     = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError,   setCpError]   = useState('');
  const [cpSuccess, setCpSuccess] = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const bellRef                         = useRef(null);
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

    // ── Fetch user and survey data ─────────────────────────────────────────────
  const fetchUserAndSurvey = useCallback(async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) return;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      if (userError) { console.error('Supabase error:', userError.message); return; }

      const pwChangedAt =
        userData?.password_changed_at                 
        ?? authUser.user_metadata?.password_changed_at 
        ?? null;                                      
      setLastPasswordChange(pwChangedAt);

      const { data: surveyProgress, error: surveyError } = await supabase
        .from('survey_progress')
        .select('personal_background_data')
        .eq('user_id', authUser.id)
        .maybeSingle();
      if (surveyError) console.error('Survey fetch error:', surveyError.message);

      const personalBgData = surveyProgress?.personal_background_data || {};
      setSurveyData(personalBgData);

      if (!userData) { console.warn('No user record for ID:', authUser.id); return; }

      const mergedUser = { ...userData, ...personalBgData };
      setUser(mergedUser);
      setStrength(calcStrength(mergedUser, personalBgData));
      if (userData.avatar_url) setAvatarUrl(userData.avatar_url);
    } catch (err) {
      console.error('fetchUser error:', err);
    }
  }, []);

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error || !data) return;
      const readIds = getReadIds();
      const mapped  = data.map((n) => ({
        id: n.id, title: n.title, body: n.content,
        time: n.published_at, read: readIds.includes(n.id),
      }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter((n) => !n.read).length);
    } catch (err) {
      console.error('fetchNotifs error:', err);
    }
  }, []);

  useEffect(() => { fetchUserAndSurvey(); }, [fetchUserAndSurvey]);
  useEffect(() => { fetchNotifs(); },        [fetchNotifs]);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Initialize PI form when modal opens ───────────────────────────────────
  useEffect(() => {
    if (showPIModal && user && !piFormInitialized.current) {
      piFormInitialized.current = true;
      setPiLoading(true);

      supabase.auth.getUser().then(async ({ data: { user: au } }) => {
        const { data: surveyProgress } = await supabase
          .from('survey_progress')
          .select('personal_background_data')
          .eq('user_id', au?.id)
          .maybeSingle();

        const personalBgData = surveyProgress?.personal_background_data || {};
        const fullUserData   = { ...user, ...personalBgData };

        const mapped = { ...EMPTY_PI_FORM };

        const fieldMappings = {
          first_name:      'firstName',  firstName:      'firstName',
          middle_name:     'middleName', middleName:     'middleName',
          last_name:       'lastName',   lastName:       'lastName',
          gender:          'gender',
          birthday:        'birthday',
          civil_status:    'civilStatus', civilStatus:   'civilStatus',
          street_address:  'street',      street:        'street',
          city:            'city',
          province:        'province',
          zip_code:        'zipCode',     zipCode:       'zipCode',
          country:         'country',
          contact_number:  'contactNumber', mobile_number: 'contactNumber',
          program:         'academicProgram', academicProgram: 'academicProgram',
          batch_year:      'yearGraduated',   yearGraduated:  'yearGraduated',
          student_number:  'studentNumber',   studentNumber:  'studentNumber',
        };

        Object.entries(fieldMappings).forEach(([dbKey, formKey]) => {
          if (fullUserData[dbKey] != null && fullUserData[dbKey] !== '') {
            mapped[formKey] = String(fullUserData[dbKey]);
          }
        });

        mapped.email = au?.email || '';
        setPiForm(mapped);
        setPiLoading(false);
      });
    }
  }, [showPIModal, user]);

  const handleClosePIModal = useCallback(() => {
    setShowPIModal(false);
    piFormInitialized.current = false;
    setPiFieldErrors({});
    setPiSaveError('');
    setPiSaveSuccess(false);
  }, []);

  // ── PI field setter ────────────────────────────────────────────────────────
  const setPiField = useCallback((key) => (valueOrEvent) => {
    const value =
      valueOrEvent && typeof valueOrEvent === 'object' && 'target' in valueOrEvent
        ? valueOrEvent.target.value
        : valueOrEvent;
    setPiForm((prev) => ({ ...prev, [key]: value }));
    setPiFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // ── PI save ────────────────────────────────────────────────────────────────
  // FIX: first_name, last_name, middle_name and email are now also written into
  //      personal_background_data so that PersonalBackground.jsx autofill finds
  //      them via loadSectionData — even after a Profile modal save.
  const handlePISave = useCallback(async () => {
    setPiSaveError('');
    setPiSaveSuccess(false);
    const errors = validatePI(piForm);
    if (Object.keys(errors).length > 0) { setPiFieldErrors(errors); return; }
    setPiSaving(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // ── 1. users table (name + academic fields) ──────────────────────────
      const userTableFields = {};
      if (piForm.firstName    !== '') userTableFields.first_name  = piForm.firstName;
      if (piForm.middleName   !== '') userTableFields.middle_name = piForm.middleName;
      if (piForm.lastName     !== '') userTableFields.last_name   = piForm.lastName;
      if (piForm.academicProgram !== '') userTableFields.program  = piForm.academicProgram;
      if (piForm.yearGraduated   !== '') userTableFields.batch_year = parseInt(piForm.yearGraduated, 10);

      if (Object.keys(userTableFields).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update(userTableFields)
          .eq('id', authUser.id);
        if (userError) throw userError;
      }

      // ── 2. survey_progress.personal_background_data (JSONB) ─────────────
      // FIX: include name fields + email so the survey section can load them
      //      via loadSectionData without relying solely on the hook.
      const personalBgData = {};

      // Name fields — written here so survey autofill picks them up
      if (piForm.firstName  !== '') personalBgData.first_name   = piForm.firstName;
      if (piForm.middleName !== '') personalBgData.middle_name  = piForm.middleName;
      if (piForm.lastName   !== '') personalBgData.last_name    = piForm.lastName;

      // Email — auth-managed, stored here for survey completeness
      if (authUser.email)           personalBgData.email        = authUser.email;

      // Address / contact fields
      if (piForm.gender        !== '') personalBgData.gender         = piForm.gender;
      if (piForm.birthday      !== '') personalBgData.birthday       = piForm.birthday;
      if (piForm.civilStatus   !== '') personalBgData.civil_status   = piForm.civilStatus;
      if (piForm.street        !== '') personalBgData.street_address = piForm.street;
      if (piForm.city          !== '') personalBgData.city           = piForm.city;
      if (piForm.province      !== '') personalBgData.province       = piForm.province;
      if (piForm.zipCode       !== '') personalBgData.zip_code       = piForm.zipCode;
      if (piForm.country       !== '') personalBgData.country        = piForm.country;
      if (piForm.contactNumber !== '') personalBgData.contact_number = piForm.contactNumber;
      if (piForm.studentNumber !== '') personalBgData.student_number = piForm.studentNumber;

      if (Object.keys(personalBgData).length > 0) {
        // Merge with existing data so unedited fields are preserved
        const { data: existingProgress } = await supabase
          .from('survey_progress')
          .select('personal_background_data')
          .eq('user_id', authUser.id)
          .maybeSingle();

        const mergedData = {
          ...existingProgress?.personal_background_data,
          ...personalBgData,
        };

        const { error: surveyError } = await supabase
          .from('survey_progress')
          .upsert(
            {
              user_id:                  authUser.id,
              personal_background_data: mergedData,
              last_updated:             new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
        if (surveyError) throw surveyError;
      }

      await fetchUserAndSurvey();
      setPiSaving(false);
      setPiSaveSuccess(true);
      setTimeout(() => setPiSaveSuccess(false), 3500);
    } catch (err) {
      setPiSaving(false);
      setPiSaveError(err.message || 'Failed to save. Please try again.');
    }
  }, [piForm, fetchUserAndSurvey]);

  // ── CP reset on close ──────────────────────────────────────────────────────
  const handleCloseCPModal = useCallback(() => {
    setShowCPModal(false);
    setCpCurrent('');
    setCpNew('');
    setCpConfirm('');
    setCpError('');
    setCpSuccess(false);
  }, []);

  const handleOpenCPFromPI = useCallback(() => {
    setShowPIModal(false);
    piFormInitialized.current = false;
    setShowCPModal(true);
  }, []);

  // ── CP save ────────────────────────────────────────────────────────────────
  const handleCPSave = useCallback(async () => {
    setCpError('');
    setCpSuccess(false);
    if (!cpCurrent || !cpNew || !cpConfirm) return setCpError('Please fill in all fields.');
    if (!PASSWORD_RULES.every((r) => r.test(cpNew)))
      return setCpError('New password does not meet all requirements.');
    if (cpNew !== cpConfirm) return setCpError('New passwords do not match.');

    setCpLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser.email, password: cpCurrent,
      });
      if (signInError) throw new Error('Current password is incorrect.');

      const passwordChangedAt = new Date().toISOString();

      const { error: updateError } = await supabase.auth.updateUser({
        password: cpNew,
        data: { password_changed_at: passwordChangedAt },
      });
      if (updateError) throw updateError;

      await supabase
        .from('users')
        .update({ password_changed_at: passwordChangedAt })
        .eq('id', authUser.id);

      setLastPasswordChange(passwordChangedAt);

      // setLastPasswordChange(new Date().toISOString());
      setCpLoading(false);
      setCpSuccess(true);
      setCpCurrent('');
      setCpNew('');
      setCpConfirm('');
      setTimeout(() => { handleCloseCPModal(); }, 2000);
    } catch (err) {
      setCpLoading(false);
      setCpError(err.message || 'Failed to update password. Please try again.');
    }
  }, [cpCurrent, cpNew, cpConfirm, handleCloseCPModal]);

  // ── Notification actions ───────────────────────────────────────────────────
  const markAllRead = useCallback(() => {
    saveReadIds(notifs.map((n) => n.id));
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const ids = getReadIds();
    if (!ids.includes(id)) { ids.push(id); saveReadIds(ids); }
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const ext      = file.name.split('.').pop();
      const filePath = `avatars/${authUser.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) { console.error('Upload error:', uploadError); return; }
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', authUser.id);
      setAvatarUrl(publicUrl);
      fetchUserAndSurvey();
    } catch (err) {
      console.error('Avatar upload error:', err);
    }
  }, [fetchUserAndSurvey]);

  return (
    <ProfileView
      // layout
      isMobile={isMobile}
      isTablet={isTablet}
      navigate={navigate}
      // user
      user={user}
      avatarUrl={avatarUrl}
      strength={strength}
      onAvatarUpload={handleAvatarUpload}
      lastPasswordChange={lastPasswordChange}
      // modals
      showPIModal={showPIModal}
      setShowPIModal={setShowPIModal}
      onClosePIModal={handleClosePIModal}
      showCPModal={showCPModal}
      setShowCPModal={setShowCPModal}
      onCloseCPModal={handleCloseCPModal}
      onOpenCPFromPI={handleOpenCPFromPI}
      // PI form
      piForm={piForm}
      setPiField={setPiField}
      piFieldErrors={piFieldErrors}
      piLoading={piLoading}
      piSaving={piSaving}
      piSaveSuccess={piSaveSuccess}
      piSaveError={piSaveError}
      onPISave={handlePISave}
      // CP form
      cpCurrent={cpCurrent}  setCpCurrent={setCpCurrent}
      cpNew={cpNew}          setCpNew={setCpNew}
      cpConfirm={cpConfirm}  setCpConfirm={setCpConfirm}
      cpLoading={cpLoading}
      cpError={cpError}
      cpSuccess={cpSuccess}
      onCPSave={handleCPSave}
      // notifications
      bellRef={bellRef}
      notifs={notifs}
      unreadCount={unreadCount}
      showDropdown={showDropdown}
      setShowDropdown={setShowDropdown}
      notifTab={notifTab}
      setNotifTab={setNotifTab}
      markAllRead={markAllRead}
      markOneRead={markOneRead}
      groupByDate={groupByDate}
      formatTime={formatTime}
    />
  );
};

export default Profile;