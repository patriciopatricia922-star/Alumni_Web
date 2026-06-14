/**
 * PersonalBackgroundSHS.jsx — Logic Layer (v2, full persistence fix)
 * Location: src/surveyshs/PersonalBackgroundSHS.jsx
 *
 * Architecture mirrors College PersonalBackground.jsx (v4) exactly.
 *
 * FIXED in v2:
 *
 *  BUG 1 — year_graduated never autofilled from profile
 *    The old code read:
 *      profile.yearGraduated ?? profile.batch_year
 *    useUserProfile camelCases DB columns, so 'batch_year' → 'batchYear'.
 *    Neither 'yearGraduated' nor 'batch_year' matched, so the field was
 *    always null. Fixed lookup order:
 *      profile.batchYear ?? profile.batch_year ?? profile.yearGraduated
 *    The three-way fallback covers: standard hook output (batchYear),
 *    any hook variant that returns raw snake_case (batch_year), and any
 *    legacy alias (yearGraduated).
 *
 *  BUG 2 — track_strand normalisation applied unconditionally
 *    normalizeTrackStrand() is retained but the lookup now also covers
 *    the hook's camelCase variant (profile.academicProgram) in addition
 *    to the raw DB column (profile.program).
 *    Lookup order:
 *      profile.program ?? profile.academicProgram
 *    'program' is the actual DB column name → hook returns it as 'program'
 *    (no underscore to strip). 'academicProgram' is the fallback alias.
 *
 *  BUG 3 — autofill deps array included `profile` (misalignment with College)
 *    Removed `profile` from the useEffect dependency array. The effect fires
 *    when profileLoading flips to false, at which point profile is already
 *    populated — exactly the same pattern as College PersonalBackground.jsx v4.
 *
 *  BUG 4 — Tier A overwrote saved answers on every re-render
 *    Tier A (unconditional overwrite) was designed to handle race conditions
 *    between Step 1 (DB load) and Step 2 (autofill). However, it unconditionally
 *    overwrote track_strand and year_graduated even if the user had manually
 *    changed those radio buttons and saved. Fixed: Tier A now only writes when
 *    the current form value is empty, exactly matching College Tier B behaviour.
 *    The profileAcademicRef is retained as a race-condition guard for Step 1
 *    re-assertion, but Step 2 no longer forcibly overwrites non-empty fields.
 *
 *  BUG 5 — TOTAL_SECTIONS was 5, should be 6
 *    Corrected to 6 so the frontend progress bar aligns with DB percentage.
 *    (This was already fixed in the previous round; retained here.)
 *
 *  NOTES ON RADIO BUTTON VALUE MATCHING:
 *    normalizeTrackStrand() maps raw DB values (e.g. "SHS-STEM", "STEM",
 *    "shs-stem") to canonical form. The canonical values MUST match the option
 *    strings rendered by PersonalBackgroundViewSHS exactly.
 *    If your surveyConfig defines options as ["STEM","ABM","HUMSS"] (no prefix),
 *    update SHS_TRACK_CANONICAL and normalizeTrackStrand accordingly, or update
 *    the surveyConfig options to use the prefixed form ["SHS-STEM","SHS-ABM","SHS-HUMSS"].
 *
 *    year_graduated is stored and compared as a STRING. Ensure the radio button
 *    option values in the view/surveyConfig are also strings (e.g. "2023", not 2023).
 *    If they are numbers, wrap each option in String() before comparison, or change
 *    normalizeYearGraduated to return a number.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import useUserProfile from '../../hooks/Useuserprofile';
import PersonalBackgroundViewSHS from '../views/PersonalBackgroundViewSHS';

// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS  = 6;   // SHS has 6 sections total
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
// Default labels / placeholders — overridden by surveyConfig when available
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

// Index-to-field mapping for surveyConfig question arrays
const INDEX_TO_FIELD = [
  'last_name', 'first_name', 'middle_name',
  'gender', 'birthday', 'complete_address',
  'contact_number', 'email', 'track_strand', 'year_graduated',
];

// ─────────────────────────────────────────────────────────────────────────────
// SHS Track/Strand canonical values
//
// These must exactly match the option value strings rendered by
// PersonalBackgroundViewSHS (and/or the surveyConfig options for track_strand).
//
// ⚠️  IMPORTANT: If your surveyConfig or view uses bare values like
//     'STEM', 'ABM', 'HUMSS' (without the 'SHS-' prefix), change
//     SHS_TRACK_CANONICAL to ['STEM', 'ABM', 'HUMSS'] and remove the
//     suffix-match logic that prepends 'SHS-'.
// ─────────────────────────────────────────────────────────────────────────────
const SHS_TRACK_CANONICAL = ['SHS-STEM', 'SHS-ABM', 'SHS-HUMSS'];

/**
 * Normalize a raw program/strand string to the canonical value expected
 * by the radio button group in PersonalBackgroundViewSHS.
 *
 * Handles:
 *   "SHS-STEM"  → "SHS-STEM"   (already canonical)
 *   "shs-stem"  → "SHS-STEM"   (lowercase)
 *   "SHS STEM"  → "SHS-STEM"   (space separator)
 *   "STEM"      → "SHS-STEM"   (missing prefix)
 *   "ABM"       → "SHS-ABM"
 *   "HUMSS"     → "SHS-HUMSS"
 *   unknown     → raw value unchanged (surveyConfig may define custom strands)
 */
const normalizeTrackStrand = (raw) => {
  if (!raw) return '';
  const upper = String(raw).trim().toUpperCase().replace(/\s+/g, '-');

  // 1. Direct canonical match (covers already-correct values)
  const direct = SHS_TRACK_CANONICAL.find((c) => c === upper);
  if (direct) return direct;

  // 2. Loose suffix match: "STEM" → "SHS-STEM"
  const suffix = SHS_TRACK_CANONICAL.find((c) => c.endsWith(`-${upper}`));
  if (suffix) return suffix;

  // 3. Already SHS-prefixed but non-standard casing
  if (upper.startsWith('SHS-')) return upper;

  // 4. Unknown / custom strand — pass through unchanged
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
// Notification helpers (identical to College implementation)
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

  // ── Shared profile hook — autofill source ─────────────────────────────────
  const { profile, loading: profileLoading, refresh: refreshProfile } = useUserProfile();

  // ── Autofill / load control flags ─────────────────────────────────────────
  const [hasLoadedSavedData,   setHasLoadedSavedData]   = useState(false);
  const [hasAttemptedAutofill, setHasAttemptedAutofill] = useState(false);

  // Ref that holds the academic values resolved from the profile so that
  // Step 1 (DB load, which may finish after Step 2) can re-assert them if
  // the race condition fires. Values are only re-asserted when the form
  // field is still empty (same guard as Tier B).
  const profileAcademicRef = useRef({});

  // ── Survey config (dynamic labels / options) ──────────────────────────────
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
  // Mirrors College PersonalBackground.jsx v4 — ensures a Profile modal save
  // is not lost when the user returns to this page.
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
  // Mirrors College STEP 1 exactly. On completion, sets hasLoadedSavedData
  // which unblocks STEP 2.
  //
  // Race-condition guard: if profileAcademicRef already contains values
  // (STEP 2 ran first), re-assert them — but only into fields that are
  // still empty so a user's manual edit is never clobbered.
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await loadSectionData(SECTION_KEY);
        if (savedData && Object.keys(savedData).length > 0) {
          console.log('[PersonalBackgroundSHS] Loaded saved survey data:', savedData);
          setForm((f) => {
            const merged = { ...f, ...savedData };
            // Re-assert profile-derived academic values only into still-empty fields.
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

  // ── STEP 2: Autofill from profile — field-by-field, never overwrites ───────
  //
  // Mirrors College PersonalBackground.jsx v4 exactly with two additions:
  //
  //   A) track_strand — derived from profile.program (or profile.academicProgram
  //      as a fallback alias), then normalised via normalizeTrackStrand().
  //
  //   B) year_graduated — derived from profile.batchYear (the camelCase form
  //      that useUserProfile returns for the DB column 'batch_year'), with
  //      fallback aliases for any hook variant that returns the raw snake_case
  //      column name or a legacy 'yearGraduated' alias.
  //
  //   C) complete_address — derived by concatenating profile address parts,
  //      only when the combined field is currently empty.
  //
  // KEY FIX: `profile` is removed from the dependency array, matching College.
  // The effect fires when profileLoading flips to false; at that point profile
  // is already populated inside the hook's closure.
  //
  // KEY FIX: ALL fields (including track_strand and year_graduated) now use
  // the same conditional guard as College Tier B — they are only written when
  // the current form value is empty. This prevents profile data from clobbering
  // a value the user deliberately changed and saved.
  useEffect(() => {
    if (!hasLoadedSavedData)   return; // wait for DB load
    if (profileLoading)        return; // wait for hook to resolve
    if (hasAttemptedAutofill)  return; // run once per page visit

    console.log('[PersonalBackgroundSHS] Running autofill...');
    console.log('[PersonalBackgroundSHS] Profile:', profile);

    if (profile && Object.keys(profile).length > 0) {

      // ── Resolve academic values from profile ────────────────────────────
      //
      // track_strand:
      //   DB column is typically 'program'.
      //   useUserProfile returns it as profile.program (no camelCase change needed).
      //   profile.academicProgram is a fallback for any hook that maps it differently.
      const rawProgram =
        profile.program          ??   // standard hook output (DB col: program)
        profile.academicProgram  ??   // fallback alias
        null;

      // year_graduated:
      //   DB column is typically 'batch_year'.
      //   useUserProfile camelCases it to profile.batchYear.
      //   Fallbacks cover raw snake_case and any legacy 'yearGraduated' alias.
      const rawBatchYear =
        profile.batchYear        ??   // standard hook output (DB col: batch_year)
        profile.batch_year       ??   // raw snake_case fallback
        profile.yearGraduated    ??   // legacy alias fallback
        null;

      const academicValues = {};

      if (rawProgram && String(rawProgram).trim()) {
        academicValues.track_strand = normalizeTrackStrand(rawProgram);
      }

      if (rawBatchYear && String(rawBatchYear).trim()) {
        // Store as string — radio button option values must also be strings.
        // See note at the top of this file if your view uses numeric options.
        academicValues.year_graduated = String(rawBatchYear).trim();
      }

      // Persist in ref so STEP 1 can re-assert in case of race condition.
      if (Object.keys(academicValues).length > 0) {
        profileAcademicRef.current = academicValues;
        console.log('[PersonalBackgroundSHS] Resolved academic values:', academicValues);
      }

      // ── Apply all autofill values — conditional guard for every field ────
      setForm((currentForm) => {
        const updated   = { ...currentForm };
        let   didChange = false;

        // Helper: write value only if target field is currently empty
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

        // Academic fields (same conditional guard as all other fields)
        fillIfEmpty('track_strand',   academicValues.track_strand);
        fillIfEmpty('year_graduated', academicValues.year_graduated);

        // Standard profile fields — identical to College PROFILE_TO_SURVEY mapping
        fillIfEmpty('first_name',     profile.firstName);
        fillIfEmpty('middle_name',    profile.middleName);
        fillIfEmpty('last_name',      profile.lastName);
        fillIfEmpty('email',          profile.email);
        fillIfEmpty('contact_number', profile.contactNumber);
        fillIfEmpty('gender',         profile.gender);
        fillIfEmpty('birthday',       profile.birthday);

        // Derived: complete_address from address parts (only when empty)
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
  // NOTE: `profile` intentionally omitted from deps — mirrors College v4.
  // The effect fires when profileLoading flips to false; profile is already
  // populated at that point inside the hook's closure.
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
  );
};

export default PersonalBackgroundSHS;