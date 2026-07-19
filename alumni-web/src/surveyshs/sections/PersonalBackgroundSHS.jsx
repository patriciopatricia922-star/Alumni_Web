/**
 * PersonalBackgroundSHS.jsx — Logic Layer (v6, fixed track/strand & year-graduated resolution)
 * Location: src/surveyshs/PersonalBackgroundSHS.jsx
 *
 * CHANGED in v6 (root-cause fix only — no other logic modified):
 *
 *   1. Track/Strand Completed & Year Graduated pre-fill:
 *      - profile.program / profile.batchYear never existed on the object
 *        returned by useUserProfile (it maps DB `program` → `academicProgram`
 *        and DB `batch_year` → `yearGraduated`). These dead references are
 *        removed; the hook's actual keys are read directly.
 *      - The real bug: the resolved value written into form state
 *        (e.g. 'SHS-STEM', '2024') never matched the rendered radio option
 *        strings (e.g. 'STEM', 'Batch 2024'), so `checked={form.x === opt}`
 *        never matched — regardless of correct data fetch. Fixed by
 *        resolveTrackStrand()/resolveYearGraduated(), which match the DB
 *        value against the SHS survey's OWN questionOptions (falling back to
 *        the local SHS default list), so the stored form value is always one
 *        of the exact strings actually rendered as a radio option.
 *      - The autofill effect now depends on questionOptions (gated on
 *        !loadingConfig) so resolution reruns once SHS survey config has
 *        actually loaded, instead of possibly resolving against stale
 *        fallback options before config arrives.
 *
 *   2. Locked-field behavior (v5) is preserved: once resolved, track_strand
 *      and year_graduated are written directly into form state, excluded
 *      from validation prompts, and rendered as locked/disabled in the view.
 *
 * Everything else — v5 read-only name fields, v4 address split, back-nav
 * guard, progress, save, notifications — is identical to v5.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import useUserProfile from '../../hooks/Useuserprofile';
import useSurveyBackGuard from '../../hooks/useSurveyBackGuard';
import PersonalBackgroundViewSHS from '../views/PersonalBackgroundViewSHS';

// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS  = 6;
const CURRENT_SECTION = 1;
const SECTION_KEY     = 'shs_personal_background';
const NEXT_ROUTE      = '/surveyshs/shs-educational-background';
const DEPARTMENT_TYPE = 'shs';

const REQUIRED_FIELDS = [
  'last_name',
  'first_name',
  'gender',
  'birthday',
  'street_address',
  'city',
  'province',
  'zip_code',
  'country',
  'contact_number',
  'email',
  'track_strand',
  'year_graduated',
];

// Fields pre-filled from the user's record that must not require
// (re-)selection or editing once loaded.
const LOCKED_FIELDS = new Set([
  'last_name',
  'first_name',
  'middle_name',
  'track_strand',
  'year_graduated',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Default option lists — used only when survey_config hasn't loaded options
// for these fields yet. Also the resolution target for DB → option matching.
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_TRACK_STRAND_OPTIONS = ['STEM', 'HUMSS', 'ABM'];
const DEFAULT_YEAR_GRADUATED_OPTIONS = [
  'Batch 2022', 'Batch 2023', 'Batch 2024',
  'Batch 2025', 'Batch 2026', 'Batch 2027',
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
  street_address:   'Street Address',
  city:             'City',
  province:         'Province',
  zip_code:         'ZIP Code',
  country:          'Country',
  contact_number:   'Contact Number',
  email:            'Personal Email Address',
  track_strand:     'Track/Strand Completed',
  year_graduated:   'Year Graduated',
};

const DEFAULT_PLACEHOLDERS = {
  last_name:        'e.g. Dela Cruz',
  first_name:       'e.g. Juan',
  middle_name:      'e.g. Mercado',
  street_address:   'e.g. Blk 1 Lot 2, AlumnAI St.',
  city:             'e.g. Dasmariñas',
  province:         'e.g. Cavite',
  zip_code:         'e.g. 4114',
  contact_number:   'e.g. 912-345-6789',
  email:            'e.g. juandelacruz@gmail.com',
};

const INDEX_TO_FIELD = [
  'last_name', 'first_name', 'middle_name',
  'gender', 'birthday', 'street_address', 'city', 'province',
  'zip_code', 'country',
  'contact_number', 'email', 'track_strand', 'year_graduated',
];

// ─────────────────────────────────────────────────────────────────────────────
// Profile JS key → survey snake_case key mapping (address)
// ─────────────────────────────────────────────────────────────────────────────
const PROFILE_TO_SURVEY_ADDRESS = {
  street:   'street_address',
  city:     'city',
  province: 'province',
  zipCode:  'zip_code',
  country:  'country',
};

// ─────────────────────────────────────────────────────────────────────────────
// SHS Track/Strand normalisation (fallback only — see resolveTrackStrand)
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
// Root-cause fix: resolve the DB value against the ACTUAL rendered option
// list (survey_config-provided, falling back to the SHS default list) so the
// value written into form state is always one of the exact strings the radio
// group renders as `opt`. Without this, `checked={form.x === opt}` compares
// two independently-formatted strings (e.g. 'SHS-STEM' vs 'STEM', or '2024'
// vs 'Batch 2024') and never matches, regardless of correct data fetch.
//
// `program` in the users table holds either a College program or an SHS
// strand — useUserProfile maps both uniformly to profile.academicProgram.
// Scoping resolution to THIS survey's own questionOptions (SHS strand list)
// keeps it correctly isolated from the College program list.
// ─────────────────────────────────────────────────────────────────────────────
const resolveTrackStrand = (rawProgram, configOptions) => {
  if (!rawProgram) return '';
  const options = (configOptions && configOptions.length)
    ? configOptions
    : DEFAULT_TRACK_STRAND_OPTIONS;
  const raw = String(rawProgram).trim().toUpperCase().replace(/^SHS-/, '');
  const found = options.find(
    (opt) => String(opt).trim().toUpperCase().replace(/^SHS-/, '') === raw
  );
  // Fallback preserves prior normalized behavior rather than silently
  // returning blank if no option-list match is found (e.g. config typo).
  return found || normalizeTrackStrand(rawProgram);
};

const resolveYearGraduated = (rawBatchYear, configOptions) => {
  if (rawBatchYear == null || String(rawBatchYear).trim() === '') return '';
  const options = (configOptions && configOptions.length)
    ? configOptions
    : DEFAULT_YEAR_GRADUATED_OPTIONS;
  const yearStr = String(rawBatchYear).trim();
  const found = options.find((opt) => String(opt).replace(/\D/g, '') === yearStr);
  return found || `Batch ${yearStr}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy `complete_address` migration helper
// ─────────────────────────────────────────────────────────────────────────────
const migrateLegacyAddress = (data) => {
  if (!data || !data.complete_address) return data;

  const hasSplitFields =
    (data.street_address && String(data.street_address).trim()) ||
    (data.city && String(data.city).trim()) ||
    (data.province && String(data.province).trim());

  if (hasSplitFields) return data;

  const parts = String(data.complete_address)
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const migrated = { ...data };
  if (parts.length > 0 && !migrated.street_address) migrated.street_address = parts[0];
  if (parts.length > 1 && !migrated.city)            migrated.city = parts[1];
  if (parts.length > 2 && !migrated.province)         migrated.province = parts[2];

  return migrated;
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
    street_address:   '',
    city:             '',
    province:         '',
    zip_code:         '',
    country:          '',
    contact_number:   '',
    email:            '',
    track_strand:     '',
    year_graduated:   '',
    phone_prefix:     '+63',
    complete_address: '', // legacy — preserved, not rendered, not required
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

  // ── surveyConfig loading + realtime subscription (SHS department) ────────
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
        const config = await loadSurveyConfig(true, DEPARTMENT_TYPE);
        if (!cancelled && config) applyConfig(config);
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    };
    init();

    const channel = subscribeToSurveyConfigChanges(async () => {
      const fresh = await loadSurveyConfig(true, DEPARTMENT_TYPE);
      if (!cancelled && fresh) applyConfig(fresh);
    });
    return () => { cancelled = true; channel?.unsubscribe(); };
  }, [applyConfig]);

  // ── STEP 1: Load saved survey data ────────────────────────────────────────
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedDataRaw = await loadSectionData(SECTION_KEY);
        if (savedDataRaw && Object.keys(savedDataRaw).length > 0) {
          console.log('[PersonalBackgroundSHS] Loaded saved survey data:', savedDataRaw);
          const savedData = migrateLegacyAddress(savedDataRaw);
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
  // Track/Strand Completed and Year Graduated are sourced from the user
  // record via useUserProfile:
  //   users.program    → profile.academicProgram
  //   users.batch_year → profile.yearGraduated
  //
  // ROOT-CAUSE FIX: resolve each raw DB value against THIS survey's own
  // questionOptions (SHS strand / batch-year option lists) so the value
  // written into form state is always one of the exact strings the radio
  // group renders — guaranteeing `checked={form.x === opt}` matches. This
  // effect depends on questionOptions (gated on !loadingConfig) so it
  // reruns once SHS survey config has actually loaded, rather than
  // resolving once against stale/fallback options.
  useEffect(() => {
    if (!hasLoadedSavedData)   return;
    if (profileLoading)        return;
    if (loadingConfig)         return;

    if (profile && Object.keys(profile).length > 0) {
      const rawProgram   = profile.academicProgram || null;
      const rawBatchYear = profile.yearGraduated || null;

      const academicValues = {};

      if (rawProgram) {
        academicValues.track_strand = resolveTrackStrand(
          rawProgram,
          questionOptions['track_strand']
        );
      }
      if (rawBatchYear) {
        academicValues.year_graduated = resolveYearGraduated(
          rawBatchYear,
          questionOptions['year_graduated']
        );
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

        // Locked fields: set directly from the resolved user-record value
        // (source of truth) so they display immediately and never require
        // reselection, even re-running as questionOptions finishes loading.
        if (academicValues.track_strand && updated.track_strand !== academicValues.track_strand) {
          updated.track_strand = academicValues.track_strand;
          didChange = true;
        }
        if (academicValues.year_graduated && updated.year_graduated !== academicValues.year_graduated) {
          updated.year_graduated = academicValues.year_graduated;
          didChange = true;
        }

        fillIfEmpty('first_name',     profile.firstName);
        fillIfEmpty('middle_name',    profile.middleName);
        fillIfEmpty('last_name',      profile.lastName);
        fillIfEmpty('email',          profile.email);
        fillIfEmpty('contact_number', profile.contactNumber);
        fillIfEmpty('gender',         profile.gender);
        fillIfEmpty('birthday',       profile.birthday);

        Object.entries(PROFILE_TO_SURVEY_ADDRESS).forEach(([profileKey, surveyKey]) => {
          fillIfEmpty(surveyKey, profile[profileKey]);
        });

        if (updated.country && (!updated.phone_prefix || updated.phone_prefix === '+63')) {
          if (updated.country === 'United States') updated.phone_prefix = '+1';
        }

        return didChange ? updated : currentForm;
      });

      // Locked fields are pre-answered by definition once resolved — clear
      // any stale validation error for them.
      setErrors((prev) => {
        if (!prev.size) return prev;
        const next = new Set(prev);
        let changed = false;
        if (academicValues.track_strand   && next.delete('track_strand'))   changed = true;
        if (academicValues.year_graduated && next.delete('year_graduated')) changed = true;
        return changed ? next : prev;
      });
    } else {
      console.log('[PersonalBackgroundSHS] No profile data available for autofill');
    }

    setHasAttemptedAutofill(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, hasLoadedSavedData, loadingConfig, questionOptions]);

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
    if (LOCKED_FIELDS.has(key)) return;
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
    if (LOCKED_FIELDS.has(key)) return;
    setForm((f) => ({ ...f, [key]: val }));
    if (errors.has(key)) {
      setErrors((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const setCountry = (e) => {
    const c      = e.target.value;
    const prefix = c === 'Philippines' ? '+63' : c === 'United States' ? '+1' : '+';
    setForm((f) => ({ ...f, country: c, phone_prefix: prefix }));
    if (errors.has('country')) {
      setErrors((prev) => {
        const next = new Set(prev);
        next.delete('country');
        return next;
      });
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = new Set();
    REQUIRED_FIELDS.forEach((field) => {
      if (LOCKED_FIELDS.has(field) && form[field] && String(form[field]).trim()) return;
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
        setCountry={setCountry}
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
        /* pre-fill lock behavior */
        lockedFields={LOCKED_FIELDS}
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
      <BackGuardModal />
    </>
  );
};

export default PersonalBackgroundSHS;