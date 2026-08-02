/**
 * EducationalBackgroundSHS.jsx — Logic Layer
 * Location: src/surveyshs/EducationalBackgroundSHS.jsx
 *
 * FIX (this pass): SHS was not consuming dynamic survey_config the way
 * College does. Two additive changes only — nothing removed:
 *
 *   1. loadSurveyConfig(true) → loadSurveyConfig(true, DEPARTMENT_TYPE)
 *      Previously this called loadSurveyConfig with no departmentType arg,
 *      which defaults to 'college' inside surveyConfig.js — meaning SHS was
 *      silently fetching the COLLEGE config, then discarding the result
 *      entirely (no assignment, no applyConfig call).
 *
 *   2. Added questionLabels / questionPlaceholders / questionOptions state
 *      + applyConfig callback, mirroring the College pattern exactly, and
 *      an INDEX_TO_FIELD_SHS map so config questions (indexed by their
 *      position in the Admin's SHS "Educational Background" section) can be
 *      keyed to this file's actual field names.
 *
 *      IMPORTANT: applyConfig is declared BEFORE the useEffect that
 *      references it. useCallback-created functions are not hoisted like
 *      function declarations — referencing applyConfig in an effect that
 *      appears earlier in the component body throws
 *      "Cannot access 'applyConfig' before initialization".
 *
 * All existing status/sub-branch selection logic (setStatus,
 * setPursuedNuBranch, setPursuedOtherSchool, getRequiredFields,
 * computeFormPct) is UNCHANGED — that is SHS's own working conditional-flow
 * logic and is untouched per requirements.
 *
 * Routing summary (unchanged):
 *   'Working'                              → /surveyshs/shs-employment-information
 *   'Currently Studying' | 'Graduated'
 *   | 'Stopped'                            → /surveyshs/shs-feedback-and-engagement
 *                                            (sets sessionStorage prevRoute)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import EducationalBackgroundViewSHS from '../views/EducationalBackgroundViewSHS';

const TOTAL_SECTIONS  = 6;
const CURRENT_SECTION = 2;
const SECTION_KEY     = 'shs_educational_background';
const PREV_ROUTE                = '/surveyshs/shs-personal-background';
const NEXT_ROUTE_DEFAULT        = '/surveyshs/shs-feedback-and-engagement';
const NEXT_ROUTE_WORKING        = '/surveyshs/shs-employment-information';
const NEXT_ROUTE_STOPPED        = '/surveyshs/shs-feedback-and-engagement';

// Matches the convention used in PersonalBackgroundSHS.jsx
const DEPARTMENT_TYPE = 'shs';

// The route this section is mounted at — stored as prevRoute for Feedback
// when the skip path is taken.
const THIS_ROUTE = '/surveyshs/shs-educational-background';

// Maps question index in the Admin's SHS "Educational Background" section
// (per DEFAULT_SHS_SURVEY in SurveyManagement.jsx) to this file's form
// field keys. Order must match the Admin's question array order.
const INDEX_TO_FIELD_SHS = [
  'status',                 // idx 0
  'pursued_nu_branch',      // idx 1
  'nu_branch',               // idx 2
  'reason_nu',                // idx 3
  'education_level',          // idx 4
  'education_level_other',    // idx 5
  'course_program',           // idx 6
  'year_level',                // idx 7
  'pursued_other_school',      // idx 8
  'reason_not_nu',              // idx 9
  'school_name',                 // idx 10
  'education_level',             // idx 11 (repeat branch — same field key)
  'education_level_other',       // idx 12
  'course_program',              // idx 13
  'year_level',                   // idx 14
  'nu_branch',                    // idx 15 (repeat branch — same field key)
  'reason_nu',                     // idx 16
  'education_level',                // idx 17
  'education_level_other',          // idx 18
  'course_program',                 // idx 19
  'year_level',                      // idx 20
  'stopped_reason',                  // idx 21
  'stopped_reason_other',             // idx 22
];

// Default labels used if Admin config hasn't provided one yet.
const DEFAULT_LABELS_SHS = {
  status:                 'Status',
  pursued_nu_branch:      'Did you pursue further studies to any NU branch after SHS?',
  nu_branch:              'What Branch of NU?',
  reason_nu:              'Reason(s) why did you choose NU.',
  pursued_other_school:   'Did you pursue further studies to any school after SHS?',
  reason_not_nu:          'Reason(s) why did you not choose NU.',
  school_name:            'Name of School/University',
  education_level:        'What level of education are you currently in or have completed?',
  education_level_other:  'Please specify',
  course_program:         'Course/Program',
  year_level:              'Year Level',
  stopped_reason:          'What is the main reason you did not pursue further studies?',
  stopped_reason_other:    'Please specify',
};

const resolveNextRoute = (status) => {
  if (status === 'Working') return NEXT_ROUTE_WORKING;
  if (status === 'Stopped') return NEXT_ROUTE_STOPPED;
  return NEXT_ROUTE_DEFAULT;
};

const getRequiredFields = (form) => {
  const required = new Set(['status']);

  const isStudyingOrGraduated =
    form.status === 'Currently Studying' || form.status === 'Graduated';

  if (isStudyingOrGraduated) {
    required.add('pursued_nu_branch');

    if (form.pursued_nu_branch === 'Yes') {
      required.add('nu_branch');
      required.add('reason_nu');
      required.add('education_level');
      if (form.education_level === 'Other') required.add('education_level_other');
      required.add('course_program');
      required.add('year_level');
    } else if (form.pursued_nu_branch === 'No') {
      required.add('pursued_other_school');

      if (form.pursued_other_school === 'Yes') {
        required.add('reason_not_nu');
        required.add('school_name');
        required.add('education_level');
        if (form.education_level === 'Other') required.add('education_level_other');
        required.add('course_program');
        required.add('year_level');
      }
    }
  }

  if (form.status === 'Stopped') {
    required.add('stopped_reason');
    if (form.stopped_reason === 'Others') required.add('stopped_reason_other');
  }

  return required;
};

const computeFormPct = (form) => {
  const required = getRequiredFields(form);
  const base     = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const cap      = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const filled   = [...required].filter(
    (k) => form[k] && String(form[k]).trim() !== ''
  ).length;
  const contrib  = (filled / required.size) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(
    parseFloat((base + contrib).toFixed(2)),
    parseFloat(cap.toFixed(2))
  );
};

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

const EMPTY_FORM = {
  status: '',
  pursued_nu_branch:    '',
  pursued_other_school: '',
  nu_branch:             '',
  reason_nu:             '',
  reason_not_nu:         '',
  school_name:           '',
  education_level:       '',
  education_level_other: '',
  course_program:        '',
  year_level:            '',
  stopped_reason:       '',
  stopped_reason_other: '',
};

const EducationalBackgroundSHS = () => {
  const navigate = useNavigate();

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);

  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  const bellRef                        = useRef(null);
  const [notifs,      setNotifs]       = useState([]);
  const [unreadCount, setUnreadCount]  = useState(0);
  const [showDropdown,setShowDropdown] = useState(false);
  const [notifTab,    setNotifTab]     = useState('all');

  // ── Dynamic survey config state (mirrors College) ─────────────────────
  const [questionLabels,       setQuestionLabels]       = useState({});
  const [questionPlaceholders, setQuestionPlaceholders] = useState({});
  const [questionOptions,      setQuestionOptions]      = useState({});

  // ── applyConfig — MUST be declared before any useEffect references it ──
  const applyConfig = useCallback((configData) => {
    const config = configData?.config ?? configData;
    if (!config?.sections) return;
    const eduSection = config.sections.find(
      (s) => s.id === SECTION_KEY || s.title === 'Educational Background'
    );
    if (!eduSection?.questions) return;

    const labels = {};
    const placeholders = {};
    const options = {};

    eduSection.questions.forEach((q, idx) => {
      const fieldKey = INDEX_TO_FIELD_SHS[idx];
      if (!fieldKey) return;
      labels[fieldKey] = q.label;
      if (q.placeholder) placeholders[fieldKey] = q.placeholder;
      if (q.options)     options[fieldKey]      = q.options;
    });

    setQuestionLabels((prev)       => ({ ...prev, ...labels }));
    setQuestionPlaceholders((prev) => ({ ...prev, ...placeholders }));
    setQuestionOptions((prev)      => ({ ...prev, ...options }));
  }, []);

  // ── Config load effect — comes AFTER applyConfig is defined ────────────
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

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await loadSectionData(SECTION_KEY);
        if (saved && Object.keys(saved).length > 0) {
          console.log('[EducationalBackgroundSHS] Loaded saved data:', saved);
          setForm((f) => ({ ...f, ...saved }));
        }
      } catch (err) {
        console.error('[EducationalBackgroundSHS] Error loading saved data:', err);
      } finally {
        setHasLoadedSavedData(true);
      }
    };
    load();
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
          id: n.id, title: n.title, body: n.content,
          time: n.published_at, read: readIds.includes(n.id),
        }));
        setNotifs(mapped);
        setUnreadCount(mapped.filter((n) => !n.read).length);
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

  const set = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const setStatus = useCallback((val) => {
    setForm({ ...EMPTY_FORM, status: val });
    setErrors(new Set());
  }, []);

  const setPursuedNuBranch = useCallback((val) => {
    setForm((f) => ({
      ...f,
      pursued_nu_branch:     val,
      pursued_other_school:  '',
      nu_branch:             '',
      reason_nu:             '',
      reason_not_nu:         '',
      school_name:           '',
      education_level:       '',
      education_level_other: '',
      course_program:        '',
      year_level:            '',
    }));
    setErrors((prev) => {
      const next = new Set(prev);
      ['pursued_nu_branch', 'pursued_other_school',
       'nu_branch', 'reason_nu', 'reason_not_nu', 'school_name',
       'education_level', 'education_level_other',
       'course_program', 'year_level'].forEach((k) => next.delete(k));
      return next;
    });
  }, []);

  const setPursuedOtherSchool = useCallback((val) => {
    setForm((f) => ({
      ...f,
      pursued_other_school:  val,
      reason_not_nu:         '',
      school_name:           '',
      education_level:       '',
      education_level_other: '',
      course_program:        '',
      year_level:            '',
    }));
    setErrors((prev) => {
      const next = new Set(prev);
      ['pursued_other_school', 'reason_not_nu', 'school_name',
       'education_level', 'education_level_other',
       'course_program', 'year_level'].forEach((k) => next.delete(k));
      return next;
    });
  }, []);

  const validate = () => {
    const required = getRequiredFields(form);
    const errs     = new Set();
    required.forEach((k) => {
      if (!form[k] || !String(form[k]).trim()) errs.add(k);
    });
    return errs;
  };

  const handleSave = async () => {
    try {
      await saveSectionProgress(SECTION_KEY, form);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error('[EducationalBackgroundSHS] Error saving:', err);
    }
  };

  const handleNext = () => {
    const errs = validate();
    if (errs.size > 0) {
      setErrors(errs);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());

    const nextRoute = resolveNextRoute(form.status);

    if (nextRoute !== NEXT_ROUTE_WORKING) {
      try {
        sessionStorage.setItem('shs_feedback_prev_route', THIS_ROUTE);
      } catch (_) {}
    }

    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate(nextRoute))
      .catch((err) =>
        console.error('[EducationalBackgroundSHS] Error saving before navigation:', err)
      );
  };

  const getLabel       = useCallback(
    (fieldId) => questionLabels[fieldId]       || DEFAULT_LABELS_SHS[fieldId] || fieldId,
    [questionLabels]
  );
  const getPlaceholder = useCallback(
    (fieldId) => questionPlaceholders[fieldId] || '',
    [questionPlaceholders]
  );

  const formPct = computeFormPct(form);

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
    <EducationalBackgroundViewSHS
      form={form}
      set={set}
      setStatus={setStatus}
      setPursuedNuBranch={setPursuedNuBranch}
      setPursuedOtherSchool={setPursuedOtherSchool}
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

export default EducationalBackgroundSHS;