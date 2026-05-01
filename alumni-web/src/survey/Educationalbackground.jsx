import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../lib/surveyConfig';
import useUserProfile from '../hooks/Useuserprofile';
import EducationalBackgroundView from '../views/EducationalBackgroundView';

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 2;

const DEFAULT_DEGREE_OPTIONS          = ['BA COMM', 'BS PSYCH', 'BS PE', 'BSA', 'BSMA', 'BSBA-MM', 'BSBA-FM', 'BSBA-HRM', 'BSTM', 'BSHM', 'BS ARCH', 'BSCE', 'BSCS-ML', 'BSCpE', 'BSIT-MWA', 'Other'];
const DEFAULT_YEAR_OPTIONS            = Array.from({ length: 10 }, (_, i) => String(2025 + i));
const DEFAULT_DISTINCTION_OPTIONS     = ['Summa Cum Laude', 'Magna Cum Laude', 'Cum Laude', 'None'];
const DEFAULT_LICENSURE_OPTIONS       = ['Yes', 'No', 'Not applicable'];
const DEFAULT_LICENSURE_PLANS_OPTIONS = ['Yes', 'No', 'Already taken', 'Not applicable'];
const DEFAULT_BOARD_RESULT_OPTIONS    = ['Passed', 'Failed', 'Pending', 'Not yet taken'];

const DEFAULT_LABELS = {
  degree_program:      'Degree Program Completed',
  other_degree:        'Please specify your degree program',
  reason_for_course:   'Reason(s) of taking the course',
  year_graduated:      'Year Graduated',
  distinction:         'Distinction Received',
  post_grad_plans:     'Do you have plans on taking a post-graduate studies?',
  post_grad_course:    'If yes, what course?',
  licensure_reviewing: 'Are you currently taking/reviewing for licensure examination?',
  licensure_plans:     'Do you have any plans on taking licensure examination?',
  licensure_reason:    'Reason(s) for not taking or taking licensure examination',
  board_exam_name:     'Name of board/licensure examination',
  board_exam_date:     'Date taken/date of examination',
  board_exam_result:   'Results',
};

const INDEX_TO_FIELD = [
  'degree_program', 'other_degree', 'reason_for_course', 'year_graduated',
  'distinction', 'post_grad_plans', 'post_grad_course', 'licensure_reviewing',
  'licensure_plans', 'licensure_reason', 'board_exam_name', 'board_exam_date',
  'board_exam_result',
];

const REQUIRED_FIELDS_BASE = [
  'degree_program', 'reason_for_course', 'year_graduated',
  'distinction', 'post_grad_plans', 'licensure_reviewing',
];

const computeFormPct = (form) => {
  const required = [...REQUIRED_FIELDS_BASE];
  if (form.degree_program === 'Other')    required.push('other_degree');
  if (form.post_grad_plans === 'Yes')     required.push('post_grad_course');
  if (form.licensure_reviewing === 'Yes') {
    required.push('licensure_plans', 'licensure_reason');
    if (form.licensure_plans === 'Yes' || form.licensure_plans === 'Already taken') {
      required.push('board_exam_name', 'board_exam_date', 'board_exam_result');
    }
  }
  // ── NEW: count the "No" branch fields toward completion ─────────────────
  if (form.licensure_reviewing === 'No') {
    required.push('licensure_no_plans', 'licensure_no_reason');
  }
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const SECTION_CAP  = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const filled       = required.filter(k => form[k] && String(form[k]).trim() !== '').length;
  const contribution = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(
    parseFloat((SECTION_BASE + contribution).toFixed(2)),
    parseFloat(SECTION_CAP.toFixed(2))
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — extract the two lockable values from a resolved profile object.
//
// useUserProfile maps DB columns to camelCase JS keys:
//   users.program    → profile.academicProgram
//   users.batch_year → profile.yearGraduated
//
// Previous code read profile.program / profile.batch_year (the raw DB names)
// which are always undefined coming out of the hook — that was the root cause
// of the autofill never working.
// ─────────────────────────────────────────────────────────────────────────────
const extractProfileAcademicFields = (profile) => {
  if (!profile) return null;

  // useUserProfile camelCase keys (see DB_TO_PROFILE in the hook)
  const program   = profile.academicProgram ?? profile.program   ?? null;
  const batchYear = profile.yearGraduated   ?? profile.batch_year ?? null;

  const result = {};
  if (program   && String(program).trim())   result.degree_program = String(program).trim();
  if (batchYear && String(batchYear).trim()) result.year_graduated = String(batchYear).trim();

  return Object.keys(result).length > 0 ? result : null;
};

const EducationalBackground = () => {
  const navigate = useNavigate();

  // ── Shared profile hook ───────────────────────────────────────────────────
  const { profile, loading: profileLoading, refresh: refreshProfile } = useUserProfile();

  // ── Config state ──────────────────────────────────────────────────────────
  const [questionLabels,        setQuestionLabels]        = useState({});
  const [questionPlaceholders,  setQuestionPlaceholders]  = useState({});
  const [degreeOptions,         setDegreeOptions]         = useState(DEFAULT_DEGREE_OPTIONS);
  const [yearOptions,           setYearOptions]           = useState(DEFAULT_YEAR_OPTIONS);
  const [distinctionOptions,    setDistinctionOptions]    = useState(DEFAULT_DISTINCTION_OPTIONS);
  const [licensureOptions,      setLicensureOptions]      = useState(DEFAULT_LICENSURE_OPTIONS);
  const [licensurePlansOptions, setLicensurePlansOptions] = useState(DEFAULT_LICENSURE_PLANS_OPTIONS);
  const [boardResultOptions,    setBoardResultOptions]    = useState(DEFAULT_BOARD_RESULT_OPTIONS);
  const [loadingLabels,         setLoadingLabels]         = useState(true);

  // ── Locked-field tracking ─────────────────────────────────────────────────
  // lockedFields[key] = true  → field was populated from the users table and
  //                             must not be editable.
  const [lockedFields, setLockedFields] = useState({
    degree_program: false,
    year_graduated: false,
  });

  // Ref that always holds the authoritative profile values so the savedData
  // merge (Step 1) can re-assert them even if it runs after Step 2.
  const profileValuesRef = useRef({});

  // ── Load control ──────────────────────────────────────────────────────────
  const [hasLoadedSavedData,   setHasLoadedSavedData]   = useState(false);
  const [hasAttemptedAutofill, setHasAttemptedAutofill] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    degree_program:      '',
    other_degree:        '',
    reason_for_course:   '',
    year_graduated:      '',
    distinction:         '',
    post_grad_plans:     '',
    post_grad_course:    '',
    licensure_reviewing: '',
    licensure_plans:     '',
    licensure_reason:    '',
    board_exam_name:     '',
    board_exam_date:     '',
    board_exam_result:   '',
    // ── NEW: "No" branch fields ───────────────────────────────────────────
    licensure_no_plans:  '',   // shown when licensure_reviewing === 'No'
    licensure_no_reason: '',   // shown when licensure_reviewing === 'No'
  });

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);
  const bellRef = useRef(null);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  // ── Force fresh profile on mount (picks up Profile modal saves) ───────────
  useEffect(() => {
    refreshProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Survey config ─────────────────────────────────────────────────────────
  const applyConfig = useCallback((config) => {
    if (!config?.sections) return;
    const eduSection = config.sections.find(s => s.title === 'Educational Background');
    if (!eduSection?.questions) return;

    const labels       = {};
    const placeholders = {};

    eduSection.questions.forEach((q, idx) => {
      const fieldKey = INDEX_TO_FIELD[idx];
      if (!fieldKey) return;
      labels[fieldKey] = q.label;
      if (q.placeholder) placeholders[fieldKey] = q.placeholder;
      if (fieldKey === 'degree_program'      && q.options) setDegreeOptions(q.options);
      if (fieldKey === 'year_graduated'      && q.options) setYearOptions(q.options);
      if (fieldKey === 'distinction'         && q.options) setDistinctionOptions(q.options);
      if (fieldKey === 'licensure_reviewing' && q.options) setLicensureOptions(q.options);
      if (fieldKey === 'licensure_plans'     && q.options) setLicensurePlansOptions(q.options);
      if (fieldKey === 'board_exam_result'   && q.options) setBoardResultOptions(q.options);
    });

    setQuestionLabels(prev       => ({ ...prev, ...labels }));
    setQuestionPlaceholders(prev => ({ ...prev, ...placeholders }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      setLoadingLabels(true);
      try {
        const config = await loadSurveyConfig(true);
        if (!cancelled && config) applyConfig(config);
      } finally {
        if (!cancelled) setLoadingLabels(false);
      }
    };
    loadConfig();

    const channel = subscribeToSurveyConfigChanges(async () => {
      const fresh = await loadSurveyConfig(true);
      if (!cancelled && fresh) applyConfig(fresh);
    });

    return () => { cancelled = true; channel?.unsubscribe(); };
  }, [applyConfig]);

  // ── STEP 1: Load saved survey data ────────────────────────────────────────
  // After merging, re-assert any profile values already in the ref so a slow
  // DB read can never silently overwrite the locked fields.
  useEffect(() => {
    const load = async () => {
      try {
        const savedData = await loadSectionData('educational_background');
        if (savedData && Object.keys(savedData).length > 0) {
          setForm(f => {
            const merged = { ...f, ...savedData };
            // Re-assert authoritative profile values (may be {} on first render
            // if the autofill effect hasn't run yet — that is fine, it will run
            // after profileLoading resolves and will overwrite again).
            Object.entries(profileValuesRef.current).forEach(([key, val]) => {
              merged[key] = val;
            });
            return merged;
          });
        }
      } catch (err) {
        console.error('[EducationalBackground] Error loading saved data:', err);
      } finally {
        setHasLoadedSavedData(true);
      }
    };
    load();
  }, []);

  // ── STEP 2: Autofill degree_program + year_graduated from profile ─────────
  //
  // FIX: Read profile.academicProgram / profile.yearGraduated — the camelCase
  // keys that useUserProfile actually produces — instead of profile.program /
  // profile.batch_year which are always undefined from the hook.
  //
  // The effect re-runs whenever profileLoading or profile changes, so it fires
  // correctly whether the hook resolves before or after saved data loads.
  useEffect(() => {
    if (!hasLoadedSavedData) return; // wait for DB load
    if (profileLoading)      return; // wait for hook
    if (hasAttemptedAutofill) return; // run only once

    console.log('[EducationalBackground] Attempting academic autofill...');
    console.log('[EducationalBackground] Profile:', profile);

    const academicValues = extractProfileAcademicFields(profile);

    if (academicValues) {
      console.log('[EducationalBackground] Applying academic values:', academicValues);

      // Persist in ref so Step 1 re-assert (above) can use them if it runs
      // after this effect (race condition avoidance).
      profileValuesRef.current = academicValues;

      // Overwrite form fields unconditionally — these come from the authoritative
      // users table and the user must not be able to change them.
      setForm(f => ({ ...f, ...academicValues }));

      setLockedFields({
        degree_program: !!academicValues.degree_program,
        year_graduated: !!academicValues.year_graduated,
      });
    } else {
      console.log('[EducationalBackground] No academic profile data found for autofill');
    }

    setHasAttemptedAutofill(true);
  }, [profileLoading, profile, hasLoadedSavedData, hasAttemptedAutofill]);

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('announcements')
      .select('id, title, content, published_at, is_active')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error || !data) return;
        const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
        const mapped  = data.map(n => ({
          id: n.id, title: n.title, body: n.content,
          time: n.published_at, read: readIds.includes(n.id),
        }));
        setNotifs(mapped);
        setUnreadCount(mapped.filter(n => !n.read).length);
      });
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem('read_notifs', JSON.stringify(notifs.map(n => n.id)));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('read_notifs', JSON.stringify(readIds));
    }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const groupByDate = useCallback((list) => {
    const today     = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const groups    = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0, 0, 0, 0);
      if      (d >= today)     groups['Today'].push(n);
      else if (d >= yesterday) groups['Yesterday'].push(n);
      else if (d >= weekAgo)   groups['This Week'].push(n);
      else                     groups['Earlier'].push(n);
    });
    return groups;
  }, []);

  const formatTime = useCallback((iso) => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }, []);

  // ── Field setter — hard-blocks writes to locked fields ────────────────────
  // State-level protection: even if the View somehow calls set() for a locked
  // field (e.g. via a programmatic event), the value is silently discarded.
  const set = useCallback((key, val) => {
    if (lockedFields[key]) {
      console.warn(`[EducationalBackground] Blocked write to locked field "${key}"`);
      return;
    }
    setForm(prev => ({ ...prev, [key]: val }));
    // Clear validation error for the field being edited
    setErrors(prev => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [lockedFields]);

  // Clears ALL sub-fields for both branches whenever the parent answer changes,
  // preventing stale values from a previous selection persisting in saved data.
  const setLicensureReviewing = useCallback((val) =>
    setForm(prev => ({
      ...prev,
      licensure_reviewing:  val,
      // ── "Yes" branch ────────────────────────────────────────────────────
      licensure_plans:      '',
      licensure_reason:     '',
      board_exam_name:      '',
      board_exam_date:      '',
      board_exam_result:    '',
      // ── "No" branch ─────────────────────────────────────────────────────
      licensure_no_plans:   '',
      licensure_no_reason:  '',
    })), []);

  const setLicensurePlans = useCallback((val) =>
    setForm(prev => ({
      ...prev,
      licensure_plans:   val,
      board_exam_name:   '',
      board_exam_date:   '',
      board_exam_result: '',
    })), []);

  // ── NEW: setter for the "No" branch plans radio ───────────────────────────
  const setLicensureNoPlans = useCallback((val) =>
    setForm(prev => ({ ...prev, licensure_no_plans: val })), []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = new Set();
    if (!form.degree_program)                                            e.add('degree_program');
    if (form.degree_program === 'Other' && !form.other_degree.trim())   e.add('other_degree');
    if (!form.reason_for_course.trim())                                 e.add('reason_for_course');
    if (!form.year_graduated)                                           e.add('year_graduated');
    if (!form.distinction)                                              e.add('distinction');
    if (!form.post_grad_plans)                                          e.add('post_grad_plans');
    if (form.post_grad_plans === 'Yes' && !form.post_grad_course.trim()) e.add('post_grad_course');
    if (!form.licensure_reviewing)                                      e.add('licensure_reviewing');
    if (form.licensure_reviewing === 'Yes') {
      if (!form.licensure_plans)         e.add('licensure_plans');
      if (!form.licensure_reason.trim()) e.add('licensure_reason');
      if (form.licensure_plans === 'Yes' || form.licensure_plans === 'Already taken') {
        if (!form.board_exam_name.trim()) e.add('board_exam_name');
        if (!form.board_exam_date)        e.add('board_exam_date');
        if (!form.board_exam_result)      e.add('board_exam_result');
      }
    // ── NEW: validate "No" branch ─────────────────────────────────────────
    } else if (form.licensure_reviewing === 'No') {
      if (!form.licensure_no_plans)          e.add('licensure_no_plans');
      if (!form.licensure_no_reason.trim())  e.add('licensure_no_reason');
    }
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('educational_background', form);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleNext = () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    saveSectionProgress('educational_background', form)
      .then(() => navigate('/survey/certification-achievement'));
  };

  const getLabel       = useCallback((fieldId) => questionLabels[fieldId]       || DEFAULT_LABELS[fieldId] || fieldId, [questionLabels]);
  const getPlaceholder = useCallback((fieldId) => questionPlaceholders[fieldId] || '', [questionPlaceholders]);

  const formPct = computeFormPct(form);

  if (loadingLabels || !hasLoadedSavedData) {
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
    <EducationalBackgroundView
      form={form}
      set={set}
      setLicensureReviewing={setLicensureReviewing}
      setLicensurePlans={setLicensurePlans}
      setLicensureNoPlans={setLicensureNoPlans}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      degreeOptions={degreeOptions}
      yearOptions={yearOptions}
      distinctionOptions={distinctionOptions}
      licensureOptions={licensureOptions}
      licensurePlansOptions={licensurePlansOptions}
      boardResultOptions={boardResultOptions}
      getLabel={getLabel}
      getPlaceholder={getPlaceholder}
      handleSave={handleSave}
      handleNext={handleNext}
      lockedFields={lockedFields}
      bellRef={bellRef}
      notifs={notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs}
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

export default EducationalBackground;