/**
 * PersonalBackground.jsx — Logic Layer (v2, hook-integrated)
 * Location: src/pages/PersonalBackground.jsx
 *
 * Key changes from v1:
 *  - Uses useUserProfile hook for autofill — no redundant Supabase call
 *    when PersonalInformation has already loaded the profile this session.
 *  - Autofill priority: savedSurveyData > cachedProfile > auth metadata
 *  - Academic fields (program, batch_year) autofill from profile
 *  - surveyProgress save/load unchanged — still uses existing lib
 *  - surveyConfig reflection logic unchanged
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../lib/surveyConfig';
import useUserProfile from '../hooks/Useuserprofile';
import PersonalBackgroundView from '../Views/PersonalBackgroundView';

// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS   = 7;
const CURRENT_SECTION  = 1;
const SECTION_KEY      = 'personal_background';
const NEXT_ROUTE       = '/survey/educational-background';

const REQUIRED_FIELDS = [
  'last_name', 'first_name', 'gender', 'birthday',
  'civil_status', 'street_address', 'city', 'province',
  'zip_code', 'country', 'contact_number', 'email',
];

// ─────────────────────────────────────────────────────────────────────────────
// Default labels / placeholders — overridden by surveyConfig if available
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_LABELS = {
  last_name:      'Last Name',
  first_name:     'First Name',
  middle_name:    'Middle Name',
  student_number: 'Student Number',
  gender:         'Gender',
  birthday:       'Birthday',
  civil_status:   'Civil Status',
  street_address: 'Street Address',
  city:           'City',
  province:       'Province',
  zip_code:       'ZIP Code',
  country:        'Country',
  contact_number: 'Contact Number',
  email:          'Personal Email Address',
};

const DEFAULT_PLACEHOLDERS = {
  last_name:      'e.g. Dela Cruz',
  first_name:     'e.g. Juan',
  middle_name:    'e.g. Mercado',
  student_number: 'e.g. 2023-123456',
  street_address: 'e.g. Blk 123 Lot 456 AlumnAI St.',
  city:           'e.g. Dasmariñas',
  province:       'e.g. Cavite',
  zip_code:       'e.g. 4114',
  contact_number: 'e.g. 912-345-6789',
  email:          'e.g. juandelacruz@gmail.com',
};

// Ordered field list for index-based config mapping
const INDEX_TO_FIELD = [
  'last_name', 'first_name', 'middle_name', 'student_number',
  'gender', 'birthday', 'civil_status', 'street_address',
  'city', 'province', 'zip_code', 'country', 'contact_number', 'email',
];

// ─────────────────────────────────────────────────────────────────────────────
// Form completion percentage calculator
// ─────────────────────────────────────────────────────────────────────────────
const computeFormPct = (form) => {
  const base    = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const filled  = REQUIRED_FIELDS.filter((k) => form[k] && String(form[k]).trim()).length;
  const contrib = (filled / REQUIRED_FIELDS.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(
    parseFloat((base + contrib).toFixed(2)),
    parseFloat(((CURRENT_SECTION / TOTAL_SECTIONS) * 100).toFixed(2))
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Profile JS key → survey DB snake_case key mapping
// Enables autofill from the shared useUserProfile cache
// ─────────────────────────────────────────────────────────────────────────────
const PROFILE_TO_SURVEY = {
  firstName:      'first_name',
  middleName:     'middle_name',
  lastName:       'last_name',
  email:          'email',
  studentNumber:  'student_number',
  street:         'street_address',
  city:           'city',
  province:       'province',
  zipCode:        'zip_code',
  country:        'country',
  contactNumber:  'contact_number',
  gender:         'gender',
  birthday:       'birthday',
  civilStatus:    'civil_status',
  // Academic autofill — survey section 2 may also use these
  academicProgram: null,  // not a Personal Background field
  yearGraduated:   null,  // not a Personal Background field
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification helpers
// ─────────────────────────────────────────────────────────────────────────────
const NOTIF_KEY   = 'alumnai_read_notifs';
const getReadIds  = () => { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); } catch { return []; } };
const saveReadIds = (ids) => { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(ids)); } catch {} };

const groupByDate = (list) => {
  const now = new Date();
  const today     = new Date(now); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const weekAgo   = new Date(today); weekAgo.setDate(today.getDate()-7);
  const groups    = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
  list.forEach((n) => {
    const d = new Date(n.time); d.setHours(0,0,0,0);
    if      (d >= today)     groups['Today'].push(n);
    else if (d >= yesterday) groups['Yesterday'].push(n);
    else if (d >= weekAgo)   groups['This Week'].push(n);
    else                     groups['Earlier'].push(n);
  });
  return groups;
};

const formatTime = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────
const PersonalBackground = () => {
  const navigate = useNavigate();

  // ── Shared profile hook — autofill source ─────────────────────────────
  const { profile, loading: profileLoading } = useUserProfile();

  // ── Survey config (dynamic labels / options) ──────────────────────────
  const [questionLabels,       setQuestionLabels]       = useState({});
  const [questionPlaceholders, setQuestionPlaceholders] = useState({});
  const [questionOptions,      setQuestionOptions]      = useState({});
  const [loadingConfig,        setLoadingConfig]        = useState(true);

  // ── Form state ────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    last_name: '', first_name: '', middle_name: '',
    student_number: '', gender: '', birthday: '',
    civil_status: '', street_address: '', city: '',
    province: '', zip_code: '', country: '',
    contact_number: '', email: '',
    phone_prefix: '+63',
  });

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  // ── Notifications ─────────────────────────────────────────────────────
  const bellRef                         = useRef(null);
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  // ── surveyConfig loading + realtime subscription ──────────────────────
  const applyConfig = useCallback((configData) => {
    const config = configData?.config ?? configData;
    if (!config?.sections) return;
    const section = config.sections.find(
      (s) => s.id === SECTION_KEY || s.title === 'Personal Background'
    );
    if (!section?.questions) return;

    const labels = {}, placeholders = {}, options = {};
    section.questions.forEach((q, idx) => {
      const key = q.id || INDEX_TO_FIELD[idx];
      if (!key) return;
      labels[key] = q.label;
      if (q.placeholder) placeholders[key] = q.placeholder;
      if (q.options)     options[key]      = q.options;
    });
    setQuestionLabels((p)       => ({ ...p, ...labels }));
    setQuestionPlaceholders((p) => ({ ...p, ...placeholders }));
    setQuestionOptions((p)      => ({ ...p, ...options }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoadingConfig(true);
      try {
        const config = await loadSurveyConfig(true);
        if (!cancelled && config) applyConfig(config);
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    };
    init();

    const channel = subscribeToSurveyConfigChanges(async () => {
      const fresh = await loadSurveyConfig(true);
      if (!cancelled && fresh) applyConfig(fresh);
    });
    return () => { cancelled = true; channel?.unsubscribe(); };
  }, [applyConfig]);

  // ── Autofill: saved survey data > profile cache > auth metadata ───────
  // This runs once profileLoading is false, so the shared hook has settled.
  useEffect(() => {
    if (profileLoading) return; // wait for hook

    const autofill = async () => {
      // 1. Load any previously saved survey progress for this section
      const savedData = await loadSectionData(SECTION_KEY);

      if (savedData && Object.keys(savedData).length > 0) {
        // Saved progress takes priority — user's explicit survey answers
        setForm((f) => ({ ...f, ...savedData }));
        return;
      }

      // 2. No saved progress → autofill from shared profile cache
      // This is zero-cost if PersonalInformation was already visited.
      if (profile) {
        const autofilled = {};
        Object.entries(PROFILE_TO_SURVEY).forEach(([profileKey, surveyKey]) => {
          if (surveyKey && profile[profileKey]) {
            autofilled[surveyKey] = String(profile[profileKey]);
          }
        });
        // Set phone prefix from country
        if (profile.country === 'Philippines') autofilled.phone_prefix = '+63';
        else if (profile.country === 'United States') autofilled.phone_prefix = '+1';

        setForm((f) => ({ ...f, ...autofilled }));
      }
    };

    autofill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading]);

  // ── Notifications ─────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    supabase.from('announcements')
      .select('id, title, content, published_at, is_active')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error || !data) return;
        const readIds = getReadIds();
        const mapped  = data.map((n) => ({ id: n.id, title: n.title, body: n.content, time: n.published_at, read: readIds.includes(n.id) }));
        setNotifs(mapped);
        setUnreadCount(mapped.filter((n) => !n.read).length);
      });
  }, []);

  const markAllRead = useCallback(() => {
    saveReadIds(notifs.map((n) => n.id));
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const ids = getReadIds();
    if (!ids.includes(id)) { ids.push(id); saveReadIds(ids); }
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // ── Field setters ──────────────────────────────────────────────────────
  const set      = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setRadio = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setCountry = (e) => {
    const c = e.target.value;
    const prefix = c === 'Philippines' ? '+63' : c === 'United States' ? '+1' : '+';
    setForm((f) => ({ ...f, country: c, phone_prefix: prefix }));
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    const e = new Set();
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field] || !String(form[field]).trim()) e.add(field);
    });
    return e;
  };

  // ── Save draft ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    await saveSectionProgress(SECTION_KEY, form);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // ── Next (validate → save → navigate) ─────────────────────────────────
  const handleNext = () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate(NEXT_ROUTE));
  };

  // ── Label / placeholder helpers ────────────────────────────────────────
  const getLabel       = useCallback((id) => questionLabels[id]       || DEFAULT_LABELS[id]       || id,  [questionLabels]);
  const getPlaceholder = useCallback((id) => questionPlaceholders[id] || DEFAULT_PLACEHOLDERS[id] || '', [questionPlaceholders]);

  const formPct = computeFormPct(form);

  // Loading gate — wait for both config and profile
  if (loadingConfig || profileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002263' }}>
        <div style={{ color: '#fff', fontFamily: 'Arimo, sans-serif' }}>Loading…</div>
      </div>
    );
  }

  return (
    <PersonalBackgroundView
      form={form}
      set={set}
      setRadio={setRadio}
      setCountry={setCountry}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      handleSave={handleSave}
      handleNext={handleNext}
      getLabel={getLabel}
      getPlaceholder={getPlaceholder}
      questionOptions={questionOptions}
      bellRef={bellRef}
      notifs={notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs}
      unreadCount={unreadCount}
      showDropdown={showDropdown}
      setShowDropdown={setShowDropdown}
      notifTab={notifTab}
      setNotifTab={setNotifTab}
      markAllRead={markAllRead}
      markOneRead={markOneRead}
      groupByDate={groupByDate}
      formatTime={formatTime}
      navigate={navigate}
    />
  );
};

export default PersonalBackground;