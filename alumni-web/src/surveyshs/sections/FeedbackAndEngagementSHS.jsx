/**
 * FeedbackAndEngagementSHS.jsx — Logic Layer
 * Location: src/surveyshs/FeedbackAndEngagementSHS.jsx
 *
 * FIX: PREV_ROUTE is now resolved dynamically from sessionStorage on mount
 * instead of being hardcoded to shs-employment-information.
 *
 * Why: Two paths reach this component:
 *   Skip path  (Studying/Graduated/Stopped) → arrives from Educational Background
 *   Full path  (Working)                    → arrives from Skills and Competencies
 *
 * The previous hardcoded value was only correct for the Working path, and
 * even then it pointed to Employment rather than Skills. Both paths now write
 * sessionStorage.shs_feedback_prev_route before navigating here, so the back
 * button always returns to the correct preceding section.
 *
 * Fallback: if sessionStorage is unavailable or the key is missing (e.g. direct
 * navigation, page refresh), falls back to shs-educational-background — the
 * lowest common ancestor that both paths share.
 *
 * All other logic is unchanged from the original.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { logAction } from '../../lib/auditLogger';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import FeedbackAndEngagementViewSHS from '../views/FeedbackAndEngagementViewSHS';
import { useNotifications } from '../../hooks/useNotifications';
import { getReadIds } from '../../lib/notificationService';

const TOTAL_SECTIONS  = 6;
const CURRENT_SECTION = 6;
const SECTION_KEY     = 'shs_feedback_and_engagement';

const DEPARTMENT_TYPE = 'shs';  // used for surveyConfig filtering
// Fallback used when sessionStorage is empty (direct nav / page refresh)
const PREV_ROUTE_FALLBACK = '/surveyshs/shs-educational-background';

const SUBMIT_ROUTE_DEFAULT = '/surveyshs/shs-complete';
const SUBMIT_ROUTE_REWARD  = '/rewards?survey_completed=1';

const SATISFACTION_OPTIONS = [
  'Very Satisfied',
  'Satisfied',
  'Neutral',
  'Dissatisfied',
  'Very Dissatisfied',
];

const YES_NO_OPTIONS = ['Yes', 'No'];

const PARTICIPATE_OPTIONS = [
  'Alumni fundraising events/activities',
  'Volunteer opportunities',
  'Not at all',
  'Others',
];

const EMPTY_FORM = {
  satisfaction:          '',
  recommend:             '',
  suggestions:           '',
  informed_about_events: '',
  participate_in:        [],
  other_participate:     '',
};

const computeFormPct = (form) => {
  const base = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const required = [
    'satisfaction', 'recommend', 'suggestions',
    'informed_about_events', 'participate_in',
  ];
  if (form.participate_in.includes('Others')) required.push('other_participate');
  const filled = required.filter((k) => {
    const v = form[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && String(v).trim() !== '';
  }).length;
  const contrib = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((base + contrib).toFixed(2)), 100);
};

const FeedbackAndEngagementSHS = () => {
  const navigate = useNavigate();

  const [prevRoute] = useState(() => {
    try {
      return sessionStorage.getItem('shs_feedback_prev_route') || PREV_ROUTE_FALLBACK;
    } catch (_) {
      return PREV_ROUTE_FALLBACK;
    }
  });

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);

  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  const { unreadCount, setNotifs, setUnreadCount } = useNotifications();

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoadingConfig(true);
      try {
        await loadSurveyConfig(true, DEPARTMENT_TYPE); 
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    };
    init();
    const channel = subscribeToSurveyConfigChanges(async () => {
      await loadSurveyConfig(true, DEPARTMENT_TYPE);
    });
    return () => { cancelled = true; channel?.unsubscribe(); };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await loadSectionData(SECTION_KEY);
        if (saved && Object.keys(saved).length > 0) {
          console.log('[FeedbackAndEngagementSHS] Loaded saved data:', saved);
          setForm((f) => ({
            ...f,
            satisfaction:          saved.satisfaction          ?? f.satisfaction,
            recommend:             saved.recommend             ?? f.recommend,
            suggestions:           saved.suggestions           ?? f.suggestions,
            informed_about_events: saved.informed_about_events ?? f.informed_about_events,
            participate_in:        Array.isArray(saved.participate_in)
                                     ? saved.participate_in
                                     : f.participate_in,
            other_participate:     saved.other_participate     ?? f.other_participate,
          }));
        }
      } catch (err) {
        console.error('[FeedbackAndEngagementSHS] Error loading saved data:', err);
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

  const set = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const toggleParticipate = useCallback((value) => {
    setForm((f) => {
      const already = f.participate_in.includes(value);
      const updated = already
        ? f.participate_in.filter((v) => v !== value)
        : [...f.participate_in, value];
      return {
        ...f,
        participate_in:    updated,
        other_participate: (value === 'Others' && already) ? '' : f.other_participate,
      };
    });
    setErrors((prev) => {
      const next = new Set(prev);
      next.delete('participate_in');
      if (value === 'Others') next.delete('other_participate');
      return next;
    });
  }, []);

  const validate = () => {
    const errs = new Set();
    if (!form.satisfaction)                                          errs.add('satisfaction');
    if (!form.recommend)                                             errs.add('recommend');
    if (!form.suggestions || !form.suggestions.trim())              errs.add('suggestions');
    if (!form.informed_about_events)                                 errs.add('informed_about_events');
    if (form.participate_in.length === 0)                           errs.add('participate_in');
    if (form.participate_in.includes('Others') &&
        (!form.other_participate || !form.other_participate.trim())) errs.add('other_participate');
    return errs;
  };

  const buildPayload = () => ({
    satisfaction:          form.satisfaction,
    recommend:             form.recommend,
    suggestions:           form.suggestions,
    informed_about_events: form.informed_about_events,
    participate_in:        form.participate_in,
    other_participate:     form.other_participate,
  });

  const handleSave = async () => {
    try {
      await saveSectionProgress(SECTION_KEY, buildPayload());
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error('[FeedbackAndEngagementSHS] Error saving draft:', err);
    }
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.size > 0) {
      setErrors(errs);
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
        description: 'SHS alumni submitted tracer survey (web)',
        recordId:    user?.id ?? null,
        status:      'Success',
      });

      try { sessionStorage.removeItem('shs_feedback_prev_route'); } catch (_) {}

      const originRoute = sessionStorage.getItem('survey_origin_route') || '/dashboard';
      sessionStorage.removeItem('survey_origin_route');

      navigate(`${originRoute}?survey_completed=1`);
    } catch (err) {
      console.error('[FeedbackAndEngagementSHS] Submit error:', err);
      await logAction({
        action:      'Create',
        module:      'Survey',
        description: 'SHS alumni survey submission failed (web)',
        status:      'Failed',
      });
    }
  };

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
    <FeedbackAndEngagementViewSHS
      form={form}
      set={set}
      toggleParticipate={toggleParticipate}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      satisfactionOptions={SATISFACTION_OPTIONS}
      yesNoOptions={YES_NO_OPTIONS}
      participateOptions={PARTICIPATE_OPTIONS}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      handleSave={handleSave}
      handleSubmit={handleSubmit}
      navigate={navigate}
      prevRoute={prevRoute}
    />
  );
};

export default FeedbackAndEngagementSHS;