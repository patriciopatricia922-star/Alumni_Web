/**
 * EducationalBackground.jsx — Reference implementation with branching
 * ─────────────────────────────────────────────────────────────────────────────
 * This file is a drop-in replacement for the original EducationalBackground.jsx.
 * It is identical to the original EXCEPT for the three additions marked
 * ← BRANCHING ADD.  Those three hunks are the complete change needed.
 *
 * Apply the same three-hunk pattern to all other section controllers.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../lib/surveyConfig';
import useUserProfile from '../hooks/Useuserprofile';
import EducationalBackgroundView from '../Views/EducationalBackgroundView';
import { useSurveyBranching } from '../lib/useSurveyBranching';
import useSurveyBackGuard from '../hooks/useSurveyBackGuard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useNotifications } from '../hooks/useNotifications';

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

// Must match, position-for-position, the exact order of questions saved by
// SuperAdmin for the "Educational Background" section (College). That saved
// list has 12 questions and does NOT include a separate "other_degree"
// question (it's a UI-only sub-field shown when degree_program === "Other"),
// so it must not occupy a slot here either — doing so previously shifted
// every subsequent mapping by one position and broke branching detection.
const INDEX_TO_FIELD = [
  'degree_program', 'reason_for_course', 'year_graduated',
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

const extractProfileAcademicFields = (profile) => {
  if (!profile) return null;
  const program   = profile.academicProgram ?? profile.program   ?? null;
  const batchYear = profile.yearGraduated   ?? profile.batch_year ?? null;
  const result = {};
  if (program   && String(program).trim())   result.degree_program = String(program).trim();
  if (batchYear && String(batchYear).trim()) result.year_graduated = String(batchYear).trim();
  return Object.keys(result).length > 0 ? result : null;
};

const EducationalBackground = () => {
  const navigate = useNavigate();

  const { profile, loading: profileLoading, refresh: refreshProfile } = useUserProfile();

  const [questionLabels,        setQuestionLabels]        = useState({});
  const [questionPlaceholders,  setQuestionPlaceholders]  = useState({});
  const [degreeOptions,         setDegreeOptions]         = useState(DEFAULT_DEGREE_OPTIONS);
  const [yearOptions,           setYearOptions]           = useState(DEFAULT_YEAR_OPTIONS);
  const [distinctionOptions,    setDistinctionOptions]    = useState(DEFAULT_DISTINCTION_OPTIONS);
  const [licensureOptions,      setLicensureOptions]      = useState(DEFAULT_LICENSURE_OPTIONS);
  const [licensurePlansOptions, setLicensurePlansOptions] = useState(DEFAULT_LICENSURE_PLANS_OPTIONS);
  const [boardResultOptions,    setBoardResultOptions]    = useState(DEFAULT_BOARD_RESULT_OPTIONS);
  const [loadingLabels,         setLoadingLabels]         = useState(true);

  const [lockedFields, setLockedFields] = useState({
    degree_program: false,
    year_graduated: false,
  });

  const profileValuesRef = useRef({});

  const [hasLoadedSavedData,   setHasLoadedSavedData]   = useState(false);
  const [hasAttemptedAutofill, setHasAttemptedAutofill] = useState(false);

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
    licensure_no_plans:  '',
    licensure_no_reason: '',
  });

  // ── BRANCHING ADD 2/3 ─────────────────────────────────────────────────────
  // Reads config.branches from the same DB row the Admin edits.
  // shouldShowField(fieldKey) returns false for fields the Admin's rules skip.
  // When no rules are configured, every field returns true (no regressions).
  const { shouldShowField, branchingReady } = useSurveyBranching(
    'Educational Background', // must match admin section title exactly
    INDEX_TO_FIELD,
    form,
  );
  // ─────────────────────────────────────────────────────────────────────────

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);
  const { unreadCount, setNotifs, setUnreadCount } = useNotifications();

  useEffect(() => {
    refreshProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    const load = async () => {
      try {
        const savedData = await loadSectionData('educational_background');
        if (savedData && Object.keys(savedData).length > 0) {
          setForm(f => {
            const merged = { ...f, ...savedData };
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

  useEffect(() => {
    if (!hasLoadedSavedData) return;
    if (profileLoading)      return;
    if (hasAttemptedAutofill) return;

    const academicValues = extractProfileAcademicFields(profile);
    if (academicValues) {
      profileValuesRef.current = academicValues;
      setForm(f => ({ ...f, ...academicValues }));
      setLockedFields({
        degree_program: !!academicValues.degree_program,
        year_graduated: !!academicValues.year_graduated,
      });
    }
    setHasAttemptedAutofill(true);
  }, [profileLoading, profile, hasLoadedSavedData, hasAttemptedAutofill]);

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

  const set = useCallback((key, val) => {
    if (lockedFields[key]) {
      console.warn(`[EducationalBackground] Blocked write to locked field "${key}"`);
      return;
    }
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [lockedFields]);

  const setLicensureReviewing = useCallback((val) =>
    setForm(prev => ({
      ...prev,
      licensure_reviewing:  val,
      licensure_plans:      '',
      licensure_reason:     '',
      board_exam_name:      '',
      board_exam_date:      '',
      board_exam_result:    '',
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

  const setLicensureNoPlans = useCallback((val) =>
    setForm(prev => ({ ...prev, licensure_no_plans: val })), []);

  const validate = () => {
    const e = new Set();
    // Only validate fields that are currently visible (not skipped by branching)
    if (!form.degree_program)                                                         e.add('degree_program');
    if (form.degree_program === 'Other' && shouldShowField('other_degree') && !form.other_degree.trim())
                                                                                      e.add('other_degree');
    if (!form.reason_for_course.trim())                                               e.add('reason_for_course');
    if (!form.year_graduated)                                                         e.add('year_graduated');
    if (!form.distinction)                                                            e.add('distinction');
    if (!form.post_grad_plans)                                                        e.add('post_grad_plans');
    if (form.post_grad_plans === 'Yes' && shouldShowField('post_grad_course') && !form.post_grad_course.trim())
                                                                                      e.add('post_grad_course');
    if (!form.licensure_reviewing)                                                    e.add('licensure_reviewing');
    if (form.licensure_reviewing === 'Yes') {
      if (shouldShowField('licensure_plans') && !form.licensure_plans)               e.add('licensure_plans');
      if (shouldShowField('licensure_reason') && !form.licensure_reason.trim())      e.add('licensure_reason');
      if (form.licensure_plans === 'Yes' || form.licensure_plans === 'Already taken') {
        if (shouldShowField('board_exam_name') && !form.board_exam_name.trim())      e.add('board_exam_name');
        if (shouldShowField('board_exam_date') && !form.board_exam_date)             e.add('board_exam_date');
        if (shouldShowField('board_exam_result') && !form.board_exam_result)         e.add('board_exam_result');
      }
    } else if (form.licensure_reviewing === 'No') {
      if (shouldShowField('licensure_no_plans') && !form.licensure_no_plans)         e.add('licensure_no_plans');
      if (shouldShowField('licensure_no_reason') && !form.licensure_no_reason.trim()) e.add('licensure_no_reason');
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

  const { handleBack, BackGuardModal } = useSurveyBackGuard(
    navigate,
    '/dashboard',
    handleSave,
    'Educational Background',
  );

  const formPct = computeFormPct(form);


  if (loadingLabels || !hasLoadedSavedData) {
    return <SkeletonLoader fieldCount={9} />;
  }

  return (
    // ── BRANCHING ADD 3/3 ─────────────────────────────────────────────────
    // Forward shouldShowField + branchingReady to the View.
    // The View uses shouldShowField(fieldKey) to conditionally render each
    // question that might be skipped by an Admin-configured branching rule.
    // ──────────────────────────────────────────────────────────────────────
    <>
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
      onBack={handleBack}
      lockedFields={lockedFields}
      navigate={navigate}
      shouldShowField={shouldShowField}
      branchingReady={branchingReady}
     />
      <BackGuardModal />
    </>
  );
};

export default EducationalBackground;