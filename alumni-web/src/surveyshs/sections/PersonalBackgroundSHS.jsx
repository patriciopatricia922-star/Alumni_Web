/**
 * PersonalBackgroundSHS.jsx — Logic Layer
 * Location: src/surveyshs/PersonalBackgroundSHS.jsx
 *
 * Architecture mirrors College PersonalBackground.jsx (v4) exactly:
 *   • Two-step load: saved DB data first, autofill from profile second
 *   • Field-by-field autofill — never overwrites existing saved answers
 *   • surveyConfig realtime subscription for dynamic labels / options
 *   • Notification helpers (groupByDate, formatTime, read-state in localStorage)
 *   • Validation → save draft → navigate pattern
 *
 * SHS-specific differences from the College controller:
 *   • SECTION_KEY        → 'shs_personal_background'
 *   • NEXT_ROUTE         → '/surveyshs/section-2'   (placeholder for next SHS section)
 *   • REQUIRED_FIELDS    → SHS field set (no civil_status, no separate address parts;
 *                          adds track_strand + year_graduated)
 *   • DEFAULT_LABELS     → SHS-appropriate labels
 *   • PROFILE_TO_SURVEY  → maps profile keys to SHS snake_case keys;
 *                          now includes track_strand ← academicProgram/program
 *                          and year_graduated ← yearGraduated/batch_year
 *   • surveyConfig lookup searches for section id 'shs_personal_background'
 *     OR title 'SHS Personal Background'
 *
 * CHANGE LOG:
 *   • Added normalizeTrackStrand() helper — maps raw program strings (e.g.
 *     "SHS-STEM", "stem", "SHS HUMSS") to the canonical radio option value
 *     expected by PersonalBackgroundViewSHS. Applied in Tier A autofill only.
 *     No College logic is touched.
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
const TOTAL_SECTIONS  = 5;   
const CURRENT_SECTION = 1;
const SECTION_KEY     = 'shs_personal_background';
const NEXT_ROUTE      = '/surveyshs/shs-educational-background';

// Fields that must be filled before the user can advance
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
// Default labels — overridden by surveyConfig when available
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
// These must exactly match the radio button option values rendered by
// PersonalBackgroundViewSHS (and the canonical strings in departmentClassifier).
// Normalization is applied only in the SHS autofill path — College is untouched.
// ─────────────────────────────────────────────────────────────────────────────
const SHS_TRACK_CANONICAL = ['SHS-STEM', 'SHS-ABM', 'SHS-HUMSS'];

/**
 * Normalize a raw program string to the canonical SHS track/strand value
 * expected by the radio button group in PersonalBackgroundViewSHS.
 *
 * Handles:
 *   "SHS-STEM"  → "SHS-STEM"   (already canonical — pass through)
 *   "shs-stem"  → "SHS-STEM"   (lowercase)
 *   "SHS STEM"  → "SHS-STEM"   (space separator)
 *   "STEM"      → "SHS-STEM"   (missing prefix)
 *   "ABM"       → "SHS-ABM"
 *   "HUMSS"     → "SHS-HUMSS"
 *   anything else → raw value unchanged (surveyConfig may define custom strands)
 *
 * @param {string | null | undefined} raw
 * @returns {string}
 */
const normalizeTrackStrand = (raw) => {
  if (!raw) return '';
  const upper = String(raw).trim().toUpperCase().replace(/\s+/g, '-');

  // 1. Direct canonical match (covers already-correct values)
  const direct = SHS_TRACK_CANONICAL.find((c) => c === upper);
  if (direct) return direct;

  // 2. Loose suffix match: "STEM" → "SHS-STEM", "ABM" → "SHS-ABM", etc.
  const suffix = SHS_TRACK_CANONICAL.find((c) => c.endsWith(`-${upper}`));
  if (suffix) return suffix;

  // 3. Already SHS-prefixed but with non-standard casing — return normalised
  if (upper.startsWith('SHS-')) return upper;

  // 4. Unknown / custom strand — pass through unchanged so surveyConfig
  //    dynamic options can still match it
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
// Profile hook key → SHS survey snake_case key mapping
// Only maps fields that exist in both the users/profile table and this section.
// SHS-specific fields (track_strand, year_graduated) have no profile equivalent.
// ─────────────────────────────────────────────────────────────────────────────
const PROFILE_TO_SURVEY = {
  firstName:     'first_name',
  middleName:    'middle_name',
  lastName:      'last_name',
  email:         'email',
  contactNumber: 'contact_number',
  gender:        'gender',
  birthday:      'birthday',
  // complete_address is a combined field — derive from profile parts if available
  street:        '_street_part',   // handled separately below in autofill
  city:          '_city_part',
  province:      '_province_part',
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
  const [hasLoadedSavedData,    setHasLoadedSavedData]    = useState(false);
  const [hasAttemptedAutofill,  setHasAttemptedAutofill]  = useState(false);

  // Ref that always holds the authoritative academic values (track_strand,
  // year_graduated) so the savedData merge in Step 1 can re-assert them even
  // if it runs after Step 2 — identical to College EducationalBackground.
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
  useEffect(() => {
    refreshProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── surveyConfig loading + realtime subscription ──────────────────────────
  const applyConfig = useCallback((configData) => {
    const config = configData?.config ?? configData;
    if (!config?.sections) return;

    // Accept either the SHS-specific section id or a matching title
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
            // Re-assert authoritative academic values so a slow DB read can
            // never silently overwrite track_strand / year_graduated that were
            // set from the profile — mirrors College EducationalBackground Step 1.
            Object.entries(profileAcademicRef.current).forEach(([key, val]) => {
              merged[key] = val;
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

  // ── STEP 2: Autofill from profile ────────────────────────────────────────
  //
  // Two-tier strategy — mirrors College EducationalBackground exactly:
  //
  //   Tier A — UNCONDITIONAL overwrite (track_strand, year_graduated):
  //     These come from the authoritative users table (program, batch_year).
  //     They are always applied regardless of saved form state, and stored in
  //     profileAcademicRef so Step 1 can re-assert them after a DB load.
  //     The guard `!formValue` is intentionally NOT used here — same as the
  //     College lockedFields pattern.
  //
  //     track_strand is passed through normalizeTrackStrand() so that the raw
  //     program value (e.g. "SHS-STEM") maps to the exact string expected by
  //     the radio button group in PersonalBackgroundViewSHS.
  //
  //   Tier B — CONDITIONAL fill (all other fields):
  //     Only fills if the form field is currently empty — preserves user edits
  //     and previously saved answers.
  //
  // `profile` is added to the deps array (was missing before) so the effect
  // fires correctly when the hook resolves after the component mounts.
  useEffect(() => {
    if (!hasLoadedSavedData) return;
    if (profileLoading)      return;
    if (hasAttemptedAutofill) return;

    console.log('[PersonalBackgroundSHS] Running autofill...');
    console.log('[PersonalBackgroundSHS] Profile:', profile);

    if (profile && Object.keys(profile).length > 0) {

      // ── Tier A: academic fields — unconditional overwrite ─────────────────
      // Mirrors extractProfileAcademicFields from College EducationalBackground.
      const program   = profile.academicProgram ?? profile.program   ?? null;
      const batchYear = profile.yearGraduated   ?? profile.batch_year ?? null;

      const academicValues = {};

      if (program && String(program).trim()) {
        // ↓ CHANGE: normalizeTrackStrand maps "SHS-STEM" / "STEM" / "shs-stem"
        //   to the canonical value the radio button group checks against.
        //   College autofill is completely unaffected — this helper is only
        //   called here, inside the SHS-only controller.
        academicValues.track_strand = normalizeTrackStrand(program);
      }

      if (batchYear && String(batchYear).trim()) {
        academicValues.year_graduated = String(batchYear).trim();
      }

      if (Object.keys(academicValues).length > 0) {
        // Persist in ref so Step 1 re-assert can use them on race conditions
        profileAcademicRef.current = academicValues;
        console.log('[PersonalBackgroundSHS] Unconditionally applying academic values:', academicValues);
      }

      // ── Tier B: remaining fields — conditional fill (no overwrite) ────────
      setForm((currentForm) => {
        const updated   = { ...currentForm, ...academicValues };
        let   didChange = Object.keys(academicValues).length > 0;

        const conditionalMap = {
          firstName:     'first_name',
          middleName:    'middle_name',
          lastName:      'last_name',
          email:         'email',
          contactNumber: 'contact_number',
          gender:        'gender',
          birthday:      'birthday',
        };

        Object.entries(conditionalMap).forEach(([profileKey, surveyKey]) => {
          const profileValue = profile[profileKey];
          const formValue    = currentForm[surveyKey];
          if (
            profileValue &&
            String(profileValue).trim() !== '' &&
            (!formValue || String(formValue).trim() === '')
          ) {
            updated[surveyKey] = String(profileValue);
            didChange = true;
            console.log(`[PersonalBackgroundSHS] Autofilled ${surveyKey} ← profile.${profileKey}`);
          }
        });

        // Derived: complete_address from profile address parts (only if empty)
        if (!currentForm.complete_address || String(currentForm.complete_address).trim() === '') {
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
  }, [profileLoading, profile, hasLoadedSavedData, hasAttemptedAutofill]);

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