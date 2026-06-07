/**
 * FeedbackAndEngagementSHS.jsx — Logic Layer
 * Location: src/surveyshs/FeedbackAndEngagementSHS.jsx
 *
 * Architecture follows the SHS module pattern established in
 * EducationalBackgroundSHS.jsx:
 *   • surveyConfig realtime subscription wired and ready
 *   • Two-step load: saved DB data first, then config hydration
 *   • Branch-aware validation — participate_in array + "Others" sub-field
 *   • Notification handling identical to all SHS sections
 *   • logAction on final submit — mirrors college FeedbackAndAlumniEngagement
 *
 * This is the final section of the SHS survey. It ends with handleSubmit
 * (not handleNext), which:
 *   1. Validates the form
 *   2. Persists to DB via saveSectionProgress
 *   3. Logs the audit event via logAction
 *   4. Reads the survey_claim_reward sessionStorage flag (same as college)
 *   5. Navigates to /rewards?survey_completed=1 or /surveyshs/shs-complete
 *
 * Reached from:
 *   • EducationalBackgroundSHS  (when status === 'Stopped')
 *   • EmploymentInformationSHS  (all other paths)
 *
 * Form fields:
 *   — Feedback for the University —
 *   satisfaction            Radio  (Very Satisfied → Very Dissatisfied)
 *   recommend               Radio  (Yes / No)
 *   suggestions             Textarea
 *
 *   — Alumni Engagement —
 *   informed_about_events   Radio  (Yes / No)
 *   participate_in          Checkbox array
 *   other_participate       Text   (visible when 'Others' is checked)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { logAction } from '../../lib/auditLogger';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import FeedbackAndEngagementViewSHS from '../views/FeedbackAndEngagementViewSHS';

// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS  = 5;
const CURRENT_SECTION = 5; // Final section of the SHS survey
const SECTION_KEY     = 'shs_feedback_and_engagement';
const PREV_ROUTE      = '/surveyshs/sections/shs-employment-information';

// Submit destinations — mirrors college section sessionStorage pattern exactly
const SUBMIT_ROUTE_DEFAULT = '/surveyshs/shs-complete';
const SUBMIT_ROUTE_REWARD  = '/rewards?survey_completed=1';

// ─────────────────────────────────────────────────────────────────────────────
// Static option lists
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Empty form shape
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  // Feedback for the University
  satisfaction:          '',
  recommend:             '',
  suggestions:           '',

  // Alumni Engagement
  informed_about_events: '',
  participate_in:        [], // array — checkboxes
  other_participate:     '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Form completion percentage
// participate_in is an array so it needs its own length check.
// ─────────────────────────────────────────────────────────────────────────────
const computeFormPct = (form) => {
  const base = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;

  const required = [
    'satisfaction',
    'recommend',
    'suggestions',
    'informed_about_events',
    'participate_in',
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

// ─────────────────────────────────────────────────────────────────────────────
// Notification helpers (identical to all SHS sections)
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
const FeedbackAndEngagementSHS = () => {
  const navigate = useNavigate();

  // ── Config ────────────────────────────────────────────────────────────────
  const [loadingConfig, setLoadingConfig] = useState(true);

  // ── Load control ──────────────────────────────────────────────────────────
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  // ── Notifications ─────────────────────────────────────────────────────────
  const bellRef                         = useRef(null);
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  // ── surveyConfig loading + realtime subscription ──────────────────────────
  // Wired and ready for dynamic labels when admin config ships for this section.
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoadingConfig(true);
      try {
        await loadSurveyConfig(true);
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    };
    init();

    const channel = subscribeToSurveyConfigChanges(async () => {
      await loadSurveyConfig(true);
    });
    return () => { cancelled = true; channel?.unsubscribe(); };
  }, []);

  // ── STEP 1: Load saved data ───────────────────────────────────────────────
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
            // Ensure participate_in is always an array even if DB stored it differently
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

  // ── Generic scalar field setter ───────────────────────────────────────────
  const set = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // ── Checkbox toggle for participate_in array ──────────────────────────────
  // When "Others" is unchecked, also clear the other_participate text field
  // so no stale value persists — mirrors cascade-reset pattern in other sections.
  const toggleParticipate = useCallback((value) => {
    setForm((f) => {
      const already = f.participate_in.includes(value);
      const updated = already
        ? f.participate_in.filter((v) => v !== value)
        : [...f.participate_in, value];

      return {
        ...f,
        participate_in:    updated,
        // Clear sub-field when "Others" is being unchecked
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

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = new Set();
    if (!form.satisfaction)                                         errs.add('satisfaction');
    if (!form.recommend)                                            errs.add('recommend');
    if (!form.suggestions || !form.suggestions.trim())             errs.add('suggestions');
    if (!form.informed_about_events)                                errs.add('informed_about_events');
    if (form.participate_in.length === 0)                          errs.add('participate_in');
    if (form.participate_in.includes('Others') &&
        (!form.other_participate || !form.other_participate.trim())) errs.add('other_participate');
    return errs;
  };

  // ── Build the payload for DB persistence ─────────────────────────────────
  const buildPayload = () => ({
    satisfaction:          form.satisfaction,
    recommend:             form.recommend,
    suggestions:           form.suggestions,
    informed_about_events: form.informed_about_events,
    participate_in:        form.participate_in,
    other_participate:     form.other_participate,
  });

  // ── Save draft ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await saveSectionProgress(SECTION_KEY, buildPayload());
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error('[FeedbackAndEngagementSHS] Error saving draft:', err);
    }
  };

  // ── Submit (final) ────────────────────────────────────────────────────────
  // Follows the exact same pattern as college FeedbackAndAlumniEngagement:
  //   validate → save → logAction → check sessionStorage flag → navigate
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

      // Read the reward-claim intent flag set by RewardStore.handleCompleteSurvey.
      // Cleared immediately so re-submissions don't re-trigger the reward flow.
      const claimReward = sessionStorage.getItem('survey_claim_reward') === '1';
      sessionStorage.removeItem('survey_claim_reward');

      console.log('[FeedbackAndEngagementSHS] handleSubmit: claimReward =', claimReward);

      navigate(claimReward ? SUBMIT_ROUTE_REWARD : SUBMIT_ROUTE_DEFAULT);
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

  // ── Loading gate ──────────────────────────────────────────────────────────
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
      /* form */
      form={form}
      set={set}
      toggleParticipate={toggleParticipate}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      /* static options */
      satisfactionOptions={SATISFACTION_OPTIONS}
      yesNoOptions={YES_NO_OPTIONS}
      participateOptions={PARTICIPATE_OPTIONS}
      /* progress */
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      /* actions */
      handleSave={handleSave}
      handleSubmit={handleSubmit}
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
      prevRoute={PREV_ROUTE}
    />
  );
};

export default FeedbackAndEngagementSHS;