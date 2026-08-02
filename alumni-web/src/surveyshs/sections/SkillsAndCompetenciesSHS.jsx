/**
 * SkillsAndCompetenciesSHS.jsx — Logic Layer
 * Location: src/surveyshs/SkillsAndCompetenciesSHS.jsx
 *
 * FIX: Before navigating to Feedback, store this route as
 * shs_feedback_prev_route in sessionStorage so FeedbackAndEngagementSHS
 * can read the correct back-button destination. This is the only change
 * from the original. Working-path users always pass through here last
 * before Feedback, so this write is authoritative for the Working path.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import SkillsAndCompetenciesViewSHS from '../views/SkillsAndCompetenciesViewSHS';

const TOTAL_SECTIONS  = 6;
const CURRENT_SECTION = 5;
const SECTION_KEY     = 'shs_skills_and_competencies';
const PREV_ROUTE      = '/surveyshs/shs-job-experience';
const NEXT_ROUTE      = '/surveyshs/shs-feedback-and-engagement';
const THIS_ROUTE      = '/surveyshs/shs-skills-and-competencies';

const DEPARTMENT_TYPE = 'shs';  // used for surveyConfig filtering

export const RATING_FIELDS = [
  { key: 'communication_skills', label: '20. Communication skills' },
  { key: 'technical_knowledge',  label: '21. Technical knowledge in your field' },
  { key: 'leadership_skills',    label: '22. Leadership skills' },
  { key: 'critical_thinking',    label: '23. Critical thinking & problem-solving' },
  { key: 'work_ethics',          label: '24. Work ethics / professionalism' },
];

const EMPTY_FORM = {
  communication_skills:    0,
  technical_knowledge:     0,
  leadership_skills:       0,
  critical_thinking:       0,
  work_ethics:             0,
  other_skills_suggestion: '',
};

const getRequiredFields = () => new Set([
  'communication_skills',
  'technical_knowledge',
  'leadership_skills',
  'critical_thinking',
  'work_ethics',
  'other_skills_suggestion',
]);

const computeFormPct = (form) => {
  const required = getRequiredFields();
  const base     = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const cap      = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const filled   = [...required].filter((k) => {
    const v = form[k];
    if (typeof v === 'number') return v >= 1;
    return v && String(v).trim() !== '';
  }).length;
  const contrib = (filled / required.size) * (1 / TOTAL_SECTIONS) * 100;
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

const SkillsAndCompetenciesSHS = () => {
  const navigate = useNavigate();

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);

  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  const bellRef                         = useRef(null);
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

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
          console.log('[SkillsAndCompetenciesSHS] Loaded saved data:', saved);
          setForm((f) => ({
            ...f,
            communication_skills:    Number(saved.communication_skills)    || f.communication_skills,
            technical_knowledge:     Number(saved.technical_knowledge)     || f.technical_knowledge,
            leadership_skills:       Number(saved.leadership_skills)       || f.leadership_skills,
            critical_thinking:       Number(saved.critical_thinking)       || f.critical_thinking,
            work_ethics:             Number(saved.work_ethics)             || f.work_ethics,
            other_skills_suggestion: saved.other_skills_suggestion         ?? f.other_skills_suggestion,
          }));
        }
      } catch (err) {
        console.error('[SkillsAndCompetenciesSHS] Error loading saved data:', err);
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

  const setRating = useCallback((key, value) => {
    set(key, value);
  }, [set]);

  const validate = () => {
    const required = getRequiredFields();
    const errs     = new Set();
    required.forEach((k) => {
      const v = form[k];
      if (typeof v === 'number') {
        if (v < 1) errs.add(k);
      } else {
        if (!v || !String(v).trim()) errs.add(k);
      }
    });
    return errs;
  };

  const handleSave = async () => {
    try {
      await saveSectionProgress(SECTION_KEY, form);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error('[SkillsAndCompetenciesSHS] Error saving draft:', err);
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

    // ── FIX: Working-path users reach Feedback from here, so this write
    // overwrites the Educational Background write and gives Feedback the
    // correct back-button destination for the Working path.
    try {
      sessionStorage.setItem('shs_feedback_prev_route', THIS_ROUTE);
    } catch (_) {}

    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate(NEXT_ROUTE))
      .catch((err) =>
        console.error('[SkillsAndCompetenciesSHS] Error saving before navigation:', err)
      );
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
    <SkillsAndCompetenciesViewSHS
      form={form}
      set={set}
      setRating={setRating}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      ratingFields={RATING_FIELDS}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      handleSave={handleSave}
      handleNext={handleNext}
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
      prevRoute={PREV_ROUTE}
    />
  );
};

export default SkillsAndCompetenciesSHS;