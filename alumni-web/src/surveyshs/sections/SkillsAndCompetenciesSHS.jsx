/**
 * SkillsAndCompetenciesSHS.jsx — Logic Layer
 * Location: src/surveyshs/sections/SkillsAndCompetenciesSHS.jsx
 *
 * Architecture is identical to all preceding SHS logic layers:
 *   • surveyConfig realtime subscription wired and ready
 *   • Two-step load: saved DB data first, then config hydration
 *   • Flat validation — all six fields are always required (no branching)
 *   • Star ratings stored as integers 1–5 (0 = unanswered)
 *   • Notification handling identical to all SHS sections
 *
 * Form fields (Q20–Q25, Skills and Competencies sub-section):
 *   communication_skills       Integer  1–5 star rating
 *   technical_knowledge        Integer  1–5 star rating
 *   leadership_skills          Integer  1–5 star rating
 *   critical_thinking          Integer  1–5 star rating
 *   work_ethics                Integer  1–5 star rating
 *   other_skills_suggestion    String   free-text
 *
 * Navigation:
 *   PREV → /surveyshs/shs-job-experience
 *   NEXT → /surveyshs/shs-feedback-and-engagement
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import SkillsAndCompetenciesViewSHS from '../views/SkillsAndCompetenciesViewSHS';

// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS  = 5;
const CURRENT_SECTION = 5;
const SECTION_KEY     = 'shs_skills_and_competencies';
const PREV_ROUTE      = '/surveyshs/shs-job-experience';
const NEXT_ROUTE      = '/surveyshs/shs-feedback-and-engagement';

// ─────────────────────────────────────────────────────────────────────────────
// Star rating fields — ordered list drives both the form shape and the view
// ─────────────────────────────────────────────────────────────────────────────
export const RATING_FIELDS = [
  { key: 'communication_skills',    label: '20. Communication skills' },
  { key: 'technical_knowledge',     label: '21. Technical knowledge in your field' },
  { key: 'leadership_skills',       label: '22. Leadership skills' },
  { key: 'critical_thinking',       label: '23. Critical thinking & problem-solving' },
  { key: 'work_ethics',             label: '24. Work ethics / professionalism' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Empty form shape
// Star ratings default to 0 (unanswered); stored as integers in DB.
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  communication_skills:    0,
  technical_knowledge:     0,
  leadership_skills:       0,
  critical_thinking:       0,
  work_ethics:             0,
  other_skills_suggestion: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Required fields — all six are always required (no branching in this section)
// ─────────────────────────────────────────────────────────────────────────────
const getRequiredFields = () => new Set([
  'communication_skills',
  'technical_knowledge',
  'leadership_skills',
  'critical_thinking',
  'work_ethics',
  'other_skills_suggestion',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Form completion percentage
// Star fields are valid when value >= 1; text field uses string check.
// ─────────────────────────────────────────────────────────────────────────────
const computeFormPct = (form) => {
  const required = getRequiredFields();
  const base     = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const cap      = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;

  const filled = [...required].filter((k) => {
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

// ─────────────────────────────────────────────────────────────────────────────
// Notification helpers — identical to all SHS sections
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
const SkillsAndCompetenciesSHS = () => {
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
          console.log('[SkillsAndCompetenciesSHS] Loaded saved data:', saved);
          setForm((f) => ({
            ...f,
            // Coerce saved star values to integers; fallback to 0 if missing
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

  // ── Notifications fetch ───────────────────────────────────────────────────
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
  // Handles both star ratings (integers) and text fields (strings).
  const set = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // ── Star rating setter — convenience wrapper around set() ─────────────────
  // Clicking the already-selected star clears the rating back to 0
  // so the user can undo an accidental selection.
  const setRating = useCallback((key, value) => {
    set(key, value);
  }, [set]);

  // ── Validation ────────────────────────────────────────────────────────────
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

  // ── Save draft ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await saveSectionProgress(SECTION_KEY, form);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error('[SkillsAndCompetenciesSHS] Error saving draft:', err);
    }
  };

  // ── Next (validate → save → navigate) ────────────────────────────────────
  const handleNext = () => {
    const errs = validate();
    if (errs.size > 0) {
      setErrors(errs);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate(NEXT_ROUTE))
      .catch((err) =>
        console.error('[SkillsAndCompetenciesSHS] Error saving before navigation:', err)
      );
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
    <SkillsAndCompetenciesViewSHS
      /* form */
      form={form}
      set={set}
      setRating={setRating}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      /* static config */
      ratingFields={RATING_FIELDS}
      /* progress */
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      /* actions */
      handleSave={handleSave}
      handleNext={handleNext}
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

export default SkillsAndCompetenciesSHS;