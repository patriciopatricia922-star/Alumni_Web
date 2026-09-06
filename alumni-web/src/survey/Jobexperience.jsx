import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../lib/surveyConfig';
import JobExperienceView from '../Views/JobExperienceView';
import useSurveyBackGuard from '../hooks/useSurveyBackGuard'; // ← NEW
import SkeletonLoader from '../components/SkeletonLoader'; // ← NEW
import { useNotifications } from '../hooks/useNotifications'; // NEW IMPORT

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 5;

const DEFAULT_TIME_TO_FIND_JOB_OPTIONS = [
  'Less than a month', '1–3 months', '4–6 months', '7–12 months',
  'More than a year', 'Not applicable',
];
const DEFAULT_EMPLOYMENT_DURATION_OPTIONS = [
  'Less than a month', '1–6 months', '7–11 months',
  '1 year or less than 2 years', '2 years or less than 3 years',
  '3 years or less than 4 years', 'Other',
];
const DEFAULT_FIRST_JOB_OPTIONS = [
  'Job/Career Fair', 'Internship Absorption', 'Online',
  'Recommendation', 'Walk-in Applications', 'Not applicable', 'Other',
];
const DEFAULT_FACTORS_OPTIONS = [
  'Academic performance', 'Internship / On-the-job Training',
  'Personal connections', 'Skills/Competencies acquired in school',
  'Certifications', 'Not applicable', 'Other',
];

const DEFAULT_LABELS = {
  time_to_find_job:         'How long did it take you to find your first job after graduation?',
  employment_duration:      'How long have you been employed in your current job?',
  other_employment_duration: 'Please specify duration',
  first_job_source:         'How did you find your first job?',
  other_first_job_source:   'Please specify other source',
  first_job_factors:        'What factors helped you most in getting your first job?',
  other_job_factors:        'Please specify other factors',
};

const INDEX_TO_FIELD = [
  'time_to_find_job', 'employment_duration', 'other_employment_duration',
  'first_job_source', 'other_first_job_source', 'first_job_factors',
  'other_job_factors',
];

const computeFormPct = (form) => {
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const SECTION_CAP  = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const required = ['time_to_find_job', 'employment_duration', 'first_job_source', 'first_job_factors'];
  if (form.employment_duration === 'Other')            required.push('other_employment_duration');
  if (form.first_job_source === 'Other')              required.push('other_first_job_source');
  if (form.first_job_factors.includes('Other'))       required.push('other_job_factors');
  const filled = required.filter(k => {
    const v = form[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && String(v).trim() !== '';
  }).length;
  const contribution = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), parseFloat(SECTION_CAP.toFixed(2)));
};

const JobExperience = () => {
  const navigate = useNavigate();

  const [questionLabels,            setQuestionLabels]            = useState({});
  const [questionPlaceholders,      setQuestionPlaceholders]      = useState({});
  const [timeToFindJobOptions,      setTimeToFindJobOptions]      = useState(DEFAULT_TIME_TO_FIND_JOB_OPTIONS);
  const [employmentDurationOptions, setEmploymentDurationOptions] = useState(DEFAULT_EMPLOYMENT_DURATION_OPTIONS);
  const [firstJobOptions,           setFirstJobOptions]           = useState(DEFAULT_FIRST_JOB_OPTIONS);
  const [factorsOptions,            setFactorsOptions]            = useState(DEFAULT_FACTORS_OPTIONS);
  const [loadingLabels,             setLoadingLabels]             = useState(true);
  const [configVersion,             setConfigVersion]             = useState(0);

  const [form, setForm] = useState({
    time_to_find_job:          '',
    other_time_to_find_job:    '',
    employment_duration:       '',
    other_employment_duration: '',
    first_job_source:          '',
    other_first_job_source:    '',
    first_job_factors:         [],
    other_job_factors:         '',
  });

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  const { unreadCount } = useNotifications();

  const applyConfig = (config) => {
    if (!config?.sections) return;
    const jobSection = config.sections.find(s => s.title === 'Job Experience');
    if (!jobSection?.questions) return;

    const labels       = {};
    const placeholders = {};

    jobSection.questions.forEach((q, idx) => {
      const fieldKey = INDEX_TO_FIELD[idx];
      if (!fieldKey) return;

      labels[fieldKey] = q.label;
      if (q.placeholder) placeholders[fieldKey] = q.placeholder;

      if (fieldKey === 'time_to_find_job'      && q.options) setTimeToFindJobOptions(q.options);
      if (fieldKey === 'employment_duration'   && q.options) setEmploymentDurationOptions(q.options);
      if (fieldKey === 'first_job_source'      && q.options) setFirstJobOptions(q.options);
      if (fieldKey === 'first_job_factors'     && q.options) setFactorsOptions(q.options);
    });

    setQuestionLabels(prev => ({...prev, ...labels}));
    setQuestionPlaceholders(prev => ({...prev, ...placeholders}));
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
      // console.log("[Realtime] Job Experience Section updating...");
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

  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('job_experience');
      if (savedData) setForm(f => ({
        ...f, ...savedData,
        first_job_factors: savedData.first_job_factors || savedData.job_factors || [],
      }));
    };
    load();
  }, []);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleFactor = (factor) => setForm(prev => ({
    ...prev,
    first_job_factors: prev.first_job_factors.includes(factor)
      ? prev.first_job_factors.filter(f => f !== factor)
      : [...prev.first_job_factors, factor],
  }));

  const validate = () => {
    const e = new Set();
    if (!form.time_to_find_job)                                                                        e.add('time_to_find_job');
    if (!form.employment_duration)                                                                     e.add('employment_duration');
    if (form.employment_duration === 'Other' && !form.other_employment_duration.trim())                e.add('other_employment_duration');
    if (!form.first_job_source)                                                                        e.add('first_job_source');
    if (form.first_job_source === 'Other' && !form.other_first_job_source.trim())                      e.add('other_first_job_source');
    if (form.first_job_factors.length === 0)                                                           e.add('first_job_factors');
    if (form.first_job_factors.includes('Other') && !form.other_job_factors.trim())                    e.add('other_job_factors');
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('job_experience', form);
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
    saveSectionProgress('job_experience', form)
      .then(() => navigate('/survey/skills-and-competencies'));
  };

  const getLabel       = (fieldId) => questionLabels[fieldId]       || DEFAULT_LABELS[fieldId] || fieldId;
  const getPlaceholder = (fieldId) => questionPlaceholders[fieldId] || '';

  const formPct = computeFormPct(form);

  const { handleBack, BackGuardModal } = useSurveyBackGuard(
  navigate,
  '/survey/employment-information',
  handleSave,
  'Job Experience',
);

  if (loadingLabels) {
    return <SkeletonLoader fieldCount={9} />;
  }

  return (
    <>
    <JobExperienceView
      form={form}
      set={set}
      toggleFactor={toggleFactor}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      timeToFindJobOptions={timeToFindJobOptions}
      employmentDurationOptions={employmentDurationOptions}
      firstJobOptions={firstJobOptions}
      factorsOptions={factorsOptions}
      getLabel={getLabel}
      getPlaceholder={getPlaceholder}
      handleSave={handleSave}
      handleNext={handleNext}
      onBack={handleBack}
      navigate={navigate}
    />
    <BackGuardModal />
    </>
  );
};

export default JobExperience;