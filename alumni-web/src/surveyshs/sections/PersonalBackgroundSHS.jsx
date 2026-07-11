/**
 * PersonalBackgroundSHS.jsx — Logic Layer (v3, back-navigation guard)
 * Location: src/surveyshs/PersonalBackgroundSHS.jsx
 *
 * CHANGED in v3 (back-navigation guard only — no other logic modified):
 *
 *   1. Import useSurveyBackGuard from '../../hooks/useSurveyBackGuard'.
 *   2. Instantiate the hook, passing navigate, the back route, handleSave,
 *      and a human-readable section name.
 *   3. Pass handleBack (from the hook) to PersonalBackgroundViewSHS via a
 *      new `onBack` prop.
 *   4. Render <BackGuardModal /> once at the end of the return block.
 *
 * Everything else — autofill bug fixes from v2, progress, validation,
 * save, notifications — is identical to v2.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import useUserProfile from '../../hooks/Useuserprofile';
import useSurveyBackGuard from '../../hooks/useSurveyBackGuard'; // ← NEW
import PersonalBackgroundViewSHS from '../views/PersonalBackgroundViewSHS';

// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS  = 6;
const CURRENT_SECTION = 1;
const SECTION_KEY     = 'shs_personal_background';
const NEXT_ROUTE      = '/surveyshs/shs-educational-background';

const REQUIRED_FIELDS = [
  'last_name',
  'first_name',
  'gender',
  'birthday',
  'complete_address',
  'contact_number',
  'email',
  'track_strand',
  'year_graduated',
];

// ─────────────────────────────────────────────────────────────────────────────
// Default labels / placeholders
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_LABELS = {
  last_name:        'Last Name',
  first_name:       'First Name',
  middle_name:      'Middle Name',
  gender:           'Gender',
  birthday:         'Birthday (MM/DD/YYYY)',
  complete_address: 'Complete Address',
  contact_number:   'Contact Number',
  email:            'Personal Email Address',
  track_strand:     'Track/Strand Completed',
  year_graduated:   'Year Graduated',
};

const DEFAULT_PLACEHOLDERS = {
  last_name:        'e.g. Dela Cruz',
  first_name:       'e.g. Juan',
  middle_name:      'e.g. Mercado',
  complete_address: 'e.g. Blk 1 Lot 2, AlumnAI St., Dasmariñas, Cavite',
  contact_number:   'e.g. 912-345-6789',
  email:            'e.g. juandelacruz@gmail.com',
};

const INDEX_TO_FIELD = [
  'last_name', 'first_name', 'middle_name',
  'gender', 'birthday', 'complete_address',
  'contact_number', 'email', 'track_strand', 'year_graduated',
];

// ─────────────────────────────────────────────────────────────────────────────
// SHS Track/Strand normalisation (unchanged from v2)
// ─────────────────────────────────────────────────────────────────────────────
const SHS_TRACK_CANONICAL = ['SHS-STEM', 'SHS-ABM', 'SHS-HUMSS'];

const normalizeTrackStrand = (raw) => {
  if (!raw) return '';
  const upper = String(raw).trim().toUpperCase().replace(/\s+/g, '-');
  const direct = SHS_TRACK_CANONICAL.find((c) => c === upper);
  if (direct) return direct;
  const suffix = SHS_TRACK_CANONICAL.find((c) => c.endsWith(`-${upper}`));
  if (suffix) return suffix;
  if (upper.startsWith('SHS-')) return upper;
  return String(raw).trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// Form completion percentage
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
// Notification helpers
// ─────────────────────────────────────────────────────────────────────────────
const NOTIF_KEY   = 'alumnai_read_notifs';
const getReadIds  = () => { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); } catch { return []; } };
const saveReadIds = (ids) => { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(ids)); } catch {} };

const groupByDate = (list) => {
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

const formatTime = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────
const PersonalBackgroundSHS = () => {
  const navigate = useNavigate();

  // ── Shared profile hook ────────────────────────────────────────────────────
  const { profile, loading: profileLoading, refresh: refreshProfile } = useUserProfile();

  // ── Autofill / load control flags ─────────────────────────────────────────
  const [hasLoadedSavedData,   setHasLoadedSavedData]   = useState(false);
  const [hasAttemptedAutofill, setHasAttemptedAutofill] = useState(false);
  const profileAcademicRef = useRef({});

  // ── Survey config ──────────────────────────────────────────────────────────
  const [questionLabels,       setQuestionLabels]       = useState({});
  const [questionPlaceholders, setQuestionPlaceholders] = useState({});
  const [questionOptions,      setQuestionOptions]      = useState({});
  const [loadingConfig,        setLoadingConfig]        = useState(true);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    last_name:        '',
    first_name:       '',
    middle_name:      '',
    gender:           '',
    birthday:         '',
    complete_address: '',
    contact_number:   '',
    email:            '',
    track_strand:     '',
    year_graduated:   '',
  });

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef                    = useRef(null);

  // ── Notifications ─────────────────────────────────────────────────────────
  const bellRef                         = useRef(null);
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  // ── Force a fresh profile fetch on mount ──────────────────────────────────
  useEffect(() => {
    refreshProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── surveyConfig loading + realtime subscription ──────────────────────────
  const applyConfig = useCallback((configData) => {
    const config = configData?.config ?? configData;
    if (!config?.sections) return;
    const section = config.sections.find(
      (s) =>
        s.id === SECTION_KEY ||
        s.id === 'shs_personal_background' ||
        s.title === 'SHS Personal Background'
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

  // ── STEP 1: Load saved survey data ────────────────────────────────────────
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await loadSectionData(SECTION_KEY);
        if (savedData && Object.keys(savedData).length > 0) {
          console.log('[PersonalBackgroundSHS] Loaded saved survey data:', savedData);
          setForm((f) => {
            const merged = { ...f, ...savedData };
            Object.entries(profileAcademicRef.current).forEach(([key, val]) => {
              if (val && (!merged[key] || String(merged[key]).trim() === '')) {
                merged[key] = val;
              }
            });
            return merged;
          });
        }
      } catch (error) {
        console.error('[PersonalBackgroundSHS] Error loading saved data:', error);
      } finally {
        setHasLoadedSavedData(true);
      }
    };
    loadSavedData();
  }, []);

  // ── STEP 2: Autofill from profile ─────────────────────────────────────────
  useEffect(() => {
    if (!hasLoadedSavedData)   return;
    if (profileLoading)        return;
    if (hasAttemptedAutofill)  return;

    console.log('[PersonalBackgroundSHS] Running autofill...');
    console.log('[PersonalBackgroundSHS] Profile:', profile);

    if (profile && Object.keys(profile).length > 0) {
      const rawProgram =
        profile.program         ??
        profile.academicProgram ??
        null;

      const rawBatchYear =
        profile.batchYear     ??
        profile.batch_year    ??
        profile.yearGraduated ??
        null;

      const academicValues = {};

      if (rawProgram && String(rawProgram).trim()) {
        academicValues.track_strand = normalizeTrackStrand(rawProgram);
      }
      if (rawBatchYear && String(rawBatchYear).trim()) {
        academicValues.year_graduated = String(rawBatchYear).trim();
      }

      if (Object.keys(academicValues).length > 0) {
        profileAcademicRef.current = academicValues;
        console.log('[PersonalBackgroundSHS] Resolved academic values:', academicValues);
      }

      setForm((currentForm) => {
        const updated   = { ...currentForm };
        let   didChange = false;

        const fillIfEmpty = (surveyKey, value) => {
          if (
            value != null &&
            String(value).trim() !== '' &&
            (!updated[surveyKey] || String(updated[surveyKey]).trim() === '')
          ) {
            updated[surveyKey] = String(value);
            didChange = true;
            console.log(`[PersonalBackgroundSHS] Autofilled ${surveyKey}:`, value);
          }
        };

        fillIfEmpty('track_strand',   academicValues.track_strand);
        fillIfEmpty('year_graduated', academicValues.year_graduated);
        fillIfEmpty('first_name',     profile.firstName);
        fillIfEmpty('middle_name',    profile.middleName);
        fillIfEmpty('last_name',      profile.lastName);
        fillIfEmpty('email',          profile.email);
        fillIfEmpty('contact_number', profile.contactNumber);
        fillIfEmpty('gender',         profile.gender);
        fillIfEmpty('birthday',       profile.birthday);

        if (!updated.complete_address || String(updated.complete_address).trim() === '') {
          const parts = [profile.street, profile.city, profile.province]
            .filter(Boolean)
            .map((p) => String(p).trim())
            .filter((p) => p !== '');
          if (parts.length > 0) {
            updated.complete_address = parts.join(', ');
            didChange = true;
            console.log('[PersonalBackgroundSHS] Autofilled complete_address from address parts');
          }
        }

        return didChange ? updated : currentForm;
      });
    } else {
      console.log('[PersonalBackgroundSHS] No profile data available for autofill');
    }

    setHasAttemptedAutofill(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, hasLoadedSavedData, hasAttemptedAutofill]);

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    supabase
      .from('announcements')
      .select('id, title, content, published_at, is_active')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error || !data) return;
        const readIds = getReadIds();
        const mapped  = data.map((n) => ({
          id:    n.id,
          title: n.title,
          body:  n.content,
          time:  n.published_at,
          read:  readIds.includes(n.id),
        }));
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
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // ── Field setters ──────────────────────────────────────────────────────────
  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors.has(key)) {
      setErrors((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const setRadio = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors.has(key)) {
      setErrors((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = new Set();
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field] || !String(form[field]).trim()) e.add(field);
    });
    return e;
  };

  // ── Save draft ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await saveSectionProgress(SECTION_KEY, form);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (error) {
      console.error('[PersonalBackgroundSHS] Error saving:', error);
    }
  };

  // ── Next (validate → save → navigate) ─────────────────────────────────────
  const handleNext = () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate(NEXT_ROUTE))
      .catch((error) => {
        console.error('[PersonalBackgroundSHS] Error saving before navigation:', error);
      });
  };

  // ── Label / placeholder helpers ────────────────────────────────────────────
  const getLabel       = useCallback(
    (id) => questionLabels[id]       || DEFAULT_LABELS[id]       || id,
    [questionLabels]
  );
  const getPlaceholder = useCallback(
    (id) => questionPlaceholders[id] || DEFAULT_PLACEHOLDERS[id] || '',
    [questionPlaceholders]
  );

  // ── Back-navigation guard ─────────────────────────────────────────────────
  // NEW in v3: replaces the inline navigate('/dashboard') in the back button.
  const { handleBack, BackGuardModal } = useSurveyBackGuard(
    navigate,
    '/dashboard',
    handleSave,
    'Personal Background',
  );

  const formPct = computeFormPct(form);

  // ── Loading gate ───────────────────────────────────────────────────────────
  if (loadingConfig || !hasLoadedSavedData) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#002263',
      }}>
        <div style={{ color: '#fff', fontFamily: 'Arimo, sans-serif' }}>Loading…</div>
      </div>
    );
  }

  return (
    <>
      <PersonalBackgroundViewSHS
        /* form state */
        form={form}
        set={setField}
        setRadio={setRadio}
        errors={errors}
        saveToast={saveToast}
        cardRef={cardRef}
        /* progress */
        formPct={formPct}
        currentSection={CURRENT_SECTION}
        totalSections={TOTAL_SECTIONS}
        /* actions */
        handleSave={handleSave}
        handleNext={handleNext}
        onBack={handleBack}
        /* dynamic config */
        getLabel={getLabel}
        getPlaceholder={getPlaceholder}
        questionOptions={questionOptions}
        /* notifications */
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
        /* routing */
        navigate={navigate}
      />
      {/* ← NEW: modal renders via React portal, outside the view's DOM tree */}
      <BackGuardModal />
    </>
  );
};

export default PersonalBackgroundSHS;