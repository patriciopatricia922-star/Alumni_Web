import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../lib/surveyConfig';
import FeedbackAndAlumniEngagementView from '../Views/FeedbackAndAlumniEngagementView';
import useSurveyBackGuard from '../hooks/useSurveyBackGuard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useNotifications } from '../hooks/useNotifications';

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 7;
const SECTION_KEY     = 'feedback_and_engagement';

const DEFAULT_UNEMPLOYED_STATUSES = [
  'Unemployed, but looking for work',
  'Unemployed, but not looking for work',
];

const DEFAULT_SATISFACTION_OPTIONS = [
  'Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied',
];
const DEFAULT_YES_NO_OPTIONS = ['Yes', 'No'];
const DEFAULT_PARTICIPATE_OPTIONS = [
  'Alumni Seminars/Webinar programs for professional growth',
  'Career talks for students',
  'Alumni fundraising events/activities',
  'Volunteer opportunities',
  'Not at all',
  'Other',
];

const DEFAULT_LABELS = {
  satisfaction:          'How satisfied are you with the education you received from NU Dasmariñas?',
  recommend:             'Would you recommend NU Dasmariñas to others?',
  suggestions:           'Do you have any suggestions or feedback for the university?',
  informed_about_events: 'Are you informed about alumni events and activities?',
  participate_in:        'Which alumni activities would you be willing to participate in? (Select all that apply)',
  other_participate:     'Please specify other activities',
};

const DEFAULT_PLACEHOLDERS = {
  suggestions:       'Share your suggestions, comments, or feedback here...',
  other_participate: 'Please specify',
};

const INDEX_TO_FIELD = [
  'satisfaction', 'recommend', 'suggestions',
  'informed_about_events', 'participate_in', 'other_participate',
];

const computeFormPct = (form) => {
  const required = ['satisfaction', 'recommend', 'suggestions', 'informed_about_events', 'participate_in'];
  if (form.participate_in.includes('Other')) required.push('other_participate');
  const SECTION_BASE   = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const filled         = required.filter(k => {
    const v = form[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && String(v).trim() !== '';
  }).length;
  const contribution = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), 100);
};

const FeedbackAndAlumniEngagement = () => {
  const navigate = useNavigate();
  const cardRef  = useRef(null);

  const { unreadCount } = useNotifications();

  const [questionLabels,       setQuestionLabels]       = useState({});
  const [questionPlaceholders, setQuestionPlaceholders] = useState({});
  const [satisfactionOptions,  setSatisfactionOptions]  = useState(DEFAULT_SATISFACTION_OPTIONS);
  const [yesNoOptions,         setYesNoOptions]         = useState(DEFAULT_YES_NO_OPTIONS);
  const [participateOptions,   setParticipateOptions]   = useState(DEFAULT_PARTICIPATE_OPTIONS);
  const [loadingLabels,        setLoadingLabels]        = useState(true);
  const [configVersion,        setConfigVersion]        = useState(0);

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);

  const [form, setForm] = useState({
    satisfaction:          '',
    recommend:             '',
    suggestions:           '',
    informed_about_events: '',
    participate_in:        [],
    other_participate:     '',
  });

  
  const prevRoute = DEFAULT_UNEMPLOYED_STATUSES.includes(form.employment_status)
    ? '/survey/employment-information'
    : '/survey/skills-and-competencies';

  // ── Survey config ─────────────────────────────────────────────────────────
  const applyConfig = (config) => {
    if (!config?.sections) return;
    const feedbackSection = config.sections.find(
      s => s.title === 'Feedback and Alumni Engagement'
    );
    if (!feedbackSection?.questions) return;

    const labels       = {};
    const placeholders = {};

    feedbackSection.questions.forEach((q, idx) => {
      const fieldKey = INDEX_TO_FIELD[idx];
      if (!fieldKey) return;

      labels[fieldKey] = q.label;
      if (q.placeholder) placeholders[fieldKey] = q.placeholder;

      if (fieldKey === 'satisfaction'          && q.options) setSatisfactionOptions(q.options);
      if (fieldKey === 'recommend'             && q.options) setYesNoOptions(q.options);
      if (fieldKey === 'informed_about_events' && q.options) setYesNoOptions(q.options);
      if (fieldKey === 'participate_in'        && q.options) setParticipateOptions(q.options);
    });

    setQuestionLabels(prev => ({ ...prev, ...labels }));
    setQuestionPlaceholders(prev => ({ ...prev, ...placeholders }));
  };

  useEffect(() => {
    let cancelled = false;

    const loadDynamicContent = async () => {
      setLoadingLabels(true);
      try {
        const config = await loadSurveyConfig(true);
        if (!cancelled && config) applyConfig(config);
      } finally {
        if (!cancelled) setLoadingLabels(false);
      }
    };

    loadDynamicContent();

    const channel = subscribeToSurveyConfigChanges(async () => {
      const freshConfig = await loadSurveyConfig(true);
      if (!cancelled && freshConfig) {
        applyConfig(freshConfig);
        setConfigVersion(v => v + 1);
      }
    });

    return () => {
      cancelled = true;
      if (channel) channel.unsubscribe();
    };
  }, []);

  // ── Load saved section data ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const [saved, savedEmployment] = await Promise.all([
        loadSectionData(SECTION_KEY),
        loadSectionData('employment_information'),
      ]);
      setForm(f => ({
        ...f,
        ...(saved && {
          satisfaction:          saved.satisfaction          ?? f.satisfaction,
          recommend:             saved.recommend             ?? f.recommend,
          suggestions:           saved.suggestions           ?? f.suggestions,
          informed_about_events: saved.informed_about_events ?? f.informed_about_events,
          participate_in:        saved.participate_in        ?? f.participate_in,
          other_participate:     saved.other_participate     ?? f.other_participate,
        }),
        employment_status: savedEmployment?.employment_status ?? f.employment_status ?? '',
      }));
    };
    load();
  }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleParticipate = (value) => setForm(prev => ({
    ...prev,
    participate_in: prev.participate_in.includes(value)
      ? prev.participate_in.filter(v => v !== value)
      : [...prev.participate_in, value],
  }));

  const validate = () => {
    const e = new Set();
    if (!form.satisfaction)               e.add('satisfaction');
    if (!form.recommend)                  e.add('recommend');
    if (!form.suggestions.trim())         e.add('suggestions');
    if (!form.informed_about_events)      e.add('informed_about_events');
    if (form.participate_in.length === 0) e.add('participate_in');
    if (form.participate_in.includes('Other') && !form.other_participate.trim())
      e.add('other_participate');
    return e;
  };

  const buildPayload = () => ({
    satisfaction:          form.satisfaction,
    recommend:             form.recommend,
    suggestions:           form.suggestions,
    informed_about_events: form.informed_about_events,
    participate_in:        form.participate_in,
    other_participate:     form.other_participate,
  });

  const getLabel       = (fieldId) => questionLabels[fieldId]       || DEFAULT_LABELS[fieldId]       || fieldId;
  const getPlaceholder = (fieldId) => questionPlaceholders[fieldId] || DEFAULT_PLACEHOLDERS[fieldId] || '';

  // ── Save (draft) ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    await saveSectionProgress(SECTION_KEY, buildPayload());
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // ── Submit (final) ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());

    try {
      await saveSectionProgress(SECTION_KEY, buildPayload());

      const { data: { user } } = await supabase.auth.getUser();
      await logAction({
        action:      'Create',
        module:      'Survey',
        description: 'Alumni submitted tracer survey (web)',
        recordId:    user?.id ?? null,
        status:      'Success',
      });

      const originRoute = sessionStorage.getItem('survey_origin_route') || '/dashboard';
      sessionStorage.removeItem('survey_origin_route');

      navigate('/survey/complete', { state: { originRoute } });
      
    } catch (err) {
      console.error('[FeedbackAndAlumniEngagement] handleSubmit error:', err);
      await logAction({
        action:      'Create',
        module:      'Survey',
        description: 'Alumni survey submission failed (web)',
        status:      'Failed',
      });
    }
  };

  const formPct = computeFormPct(form);

  const { handleBack, BackGuardModal } = useSurveyBackGuard(
    navigate,
    '/dashboard',
    handleSave,
    'Feedback and Alumni Engagement',
  );

  if (loadingLabels) {
    return <SkeletonLoader fieldCount={4} />;
  }

  return (
    <>
    <FeedbackAndAlumniEngagementView
      form={form}
      set={set}
      toggleParticipate={toggleParticipate}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      satisfactionOptions={satisfactionOptions}
      yesNoOptions={yesNoOptions}
      participateOptions={participateOptions}
      getLabel={getLabel}
      getPlaceholder={getPlaceholder}
      handleSave={handleSave}
      handleSubmit={handleSubmit}
      prevRoute={prevRoute}
      onBack={handleBack}
      navigate={navigate}
    />
    <BackGuardModal />
    </>
  );
};

export default FeedbackAndAlumniEngagement;