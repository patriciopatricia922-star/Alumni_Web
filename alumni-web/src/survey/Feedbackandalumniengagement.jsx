import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';  // ← removed useLocation
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../lib/surveyConfig';
import FeedbackAndAlumniEngagementView from '../Views/FeedbackAndAlumniEngagementView';

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 7;
const SECTION_KEY     = 'feedback_and_engagement';

// Must match EmploymentInformation's DEFAULT_UNEMPLOYED_STATUSES exactly.
// These respondents skip sections 5 & 6, so their "previous" is Employment Information.
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
  const bellRef  = useRef(null);

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

  // Derive previous route from saved employment status — no sessionStorage needed.
  // Unemployed respondents skipped sections 5 & 6, so go back to Employment Information.
  // All others (employed, or status not yet loaded) go back to Skills & Competencies.
  const prevRoute = DEFAULT_UNEMPLOYED_STATUSES.includes(form.employment_status)
    ? '/survey/employment-information'
    : '/survey/skills-and-competencies';

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

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
  // Also loads employment_status from the employment_information section so
  // prevRoute can be derived correctly without relying on navigation state.
  useEffect(() => {
    const load = async () => {
      const [saved, savedEmployment] = await Promise.all([
        loadSectionData(SECTION_KEY),
        loadSectionData('employment_information'),
      ]);
      setForm(f => ({
        ...f,
        // Feedback fields
        ...(saved && {
          satisfaction:          saved.satisfaction          ?? f.satisfaction,
          recommend:             saved.recommend             ?? f.recommend,
          suggestions:           saved.suggestions           ?? f.suggestions,
          informed_about_events: saved.informed_about_events ?? f.informed_about_events,
          participate_in:        saved.participate_in        ?? f.participate_in,
          other_participate:     saved.other_participate     ?? f.other_participate,
        }),
        // Employment status — used only to compute prevRoute, not rendered
        employment_status: savedEmployment?.employment_status ?? f.employment_status ?? '',
      }));
    };
    load();
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchNotifs = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error || !data) return;
      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped  = data.map(n => ({
        id:   n.id,
        title: n.title,
        body:  n.content,
        time:  n.published_at,
        read:  readIds.includes(n.id),
      }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false);
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

  const groupByDate = (list) => {
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
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d    = new Date(iso);
    const now  = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60)    + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

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

      const claimReward = sessionStorage.getItem('survey_claim_reward') === '1';
      sessionStorage.removeItem('survey_claim_reward');

      console.log('[FeedbackAndAlumniEngagement] handleSubmit: claimReward =', claimReward);

      navigate(claimReward ? '/rewards?survey_completed=1' : '/survey/complete');
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

  if (loadingLabels) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002263' }}>
        <div style={{ color: '#fff' }}>Loading...</div>
      </div>
    );
  }

  return (
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
      bellRef={bellRef}
      notifs={notifs}
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

export default FeedbackAndAlumniEngagement;