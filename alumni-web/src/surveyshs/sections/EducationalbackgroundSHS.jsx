/**
 * EducationalBackgroundSHS.jsx — Logic Layer
 * Location: src/surveyshs/EducationalBackgroundSHS.jsx
 *
 * Architecture mirrors College EducationalBackground.jsx exactly:
 *   • surveyConfig realtime subscription for dynamic labels / options
 *   • Two-step load: saved DB data first, then profile autofill
 *   • Branch-aware validation — only validates fields currently visible
 *   • State resets cascade down the tree when a parent answer changes,
 *     preventing stale values from persisting in hidden branches
 *   • Notification handling identical to all other SHS / College sections
 *
 * SHS-specific branching (all driven by form.status):
 *
 *   'Currently Studying' | 'Graduated'
 *     → pursued_nu_branch (Yes/No)
 *         YES → nu_branch, reason_nu, education_level (+other), course_program, year_level
 *         NO  → pursued_other_school (Yes/No)
 *                 YES → reason_not_nu, school_name, education_level (+other), course_program, year_level
 *                 NO  → (no further fields — dead end)
 *   'Stopped'
 *     → stopped_reason (+other textarea)
 *   'Working'
 *     → (no follow-up)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import EducationalBackgroundViewSHS from '../views/EducationalBackgroundViewSHS';

// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS  = 5;
const CURRENT_SECTION = 2;
const SECTION_KEY     = 'shs_educational_background';
const PREV_ROUTE                = '/surveyshs/shs-personal-background';
const NEXT_ROUTE_DEFAULT        = '/surveyshs/shs-section-3';                // Currently Studying / Graduated
const NEXT_ROUTE_WORKING        = '/surveyshs/shs-employment-information';   // Working → Employment
const NEXT_ROUTE_STOPPED        = '/surveyshs/shs-feedback-and-engagement';  // Stopped  → skip Employment
 
// ─────────────────────────────────────────────────────────────────────────────
// Resolve the correct next route based on the current status selection.
// Centralised here so navigation logic is never duplicated per-component.
// ─────────────────────────────────────────────────────────────────────────────
const resolveNextRoute = (status) => {
  if (status === 'Working') return NEXT_ROUTE_WORKING;
  if (status === 'Stopped') return NEXT_ROUTE_STOPPED;
  return NEXT_ROUTE_DEFAULT; // 'Currently Studying' | 'Graduated'
};
 
// ─────────────────────────────────────────────────────────────────────────────
// Required fields per branch path
// Validation is computed dynamically from the current form state.
// ─────────────────────────────────────────────────────────────────────────────
const getRequiredFields = (form) => {
  const required = new Set(['status']);
 
  const isStudyingOrGraduated =
    form.status === 'Currently Studying' || form.status === 'Graduated';
 
  if (isStudyingOrGraduated) {
    required.add('pursued_nu_branch');
 
    if (form.pursued_nu_branch === 'Yes') {
      // NU branch path
      required.add('nu_branch');
      required.add('reason_nu');
      required.add('education_level');
      if (form.education_level === 'Other') required.add('education_level_other');
      required.add('course_program');
      required.add('year_level');
 
    } else if (form.pursued_nu_branch === 'No') {
      required.add('pursued_other_school');
 
      if (form.pursued_other_school === 'Yes') {
        // Other school path
        required.add('reason_not_nu');
        required.add('school_name');
        required.add('education_level');
        if (form.education_level === 'Other') required.add('education_level_other');
        required.add('course_program');
        required.add('year_level');
      }
      // Both NO → no additional required fields (dead end is valid)
    }
  }
 
  if (form.status === 'Stopped') {
    required.add('stopped_reason');
    if (form.stopped_reason === 'Others') required.add('stopped_reason_other');
  }
 
  // 'Working' → only 'status' is required (already in the set)
 
  return required;
};
 
// ─────────────────────────────────────────────────────────────────────────────
// Form completion percentage
// ─────────────────────────────────────────────────────────────────────────────
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
 
// ─────────────────────────────────────────────────────────────────────────────
// Notification helpers (identical to all other sections)
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
// Empty form shape
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  // Root question
  status: '',
 
  // Studying / Graduated branch
  pursued_nu_branch:    '',   // Yes | No
  pursued_other_school: '',   // Yes | No (only when pursued_nu_branch === 'No')
 
  // Shared further-studies detail fields (used by both YES paths)
  nu_branch:             '',
  reason_nu:             '',
  reason_not_nu:         '',
  school_name:           '',
  education_level:       '',
  education_level_other: '',
  course_program:        '',
  year_level:            '',
 
  // Stopped branch
  stopped_reason:       '',
  stopped_reason_other: '',
};
 
// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────
const EducationalBackgroundSHS = () => {
  const navigate = useNavigate();
 
  // ── Config ────────────────────────────────────────────────────────────────
  const [loadingConfig, setLoadingConfig] = useState(true);
 
  // ── Load control ──────────────────────────────────────────────────────────
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);
 
  // ── Form state ────────────────────────────────────────────────────────────
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState(new Set());
  const [saveToast,setSaveToast]= useState(false);
  const cardRef = useRef(null);
 
  // ── Notifications ─────────────────────────────────────────────────────────
  const bellRef                        = useRef(null);
  const [notifs,      setNotifs]       = useState([]);
  const [unreadCount, setUnreadCount]  = useState(0);
  const [showDropdown,setShowDropdown] = useState(false);
  const [notifTab,    setNotifTab]     = useState('all');
 
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
 
  // ── STEP 1: Load saved data ────────────────────────────────────────────────
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
 
  // ── Generic field setter ───────────────────────────────────────────────────
  const set = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);
 
  // ── Status setter — resets the entire branch tree below it ────────────────
  const setStatus = useCallback((val) => {
    setForm({
      ...EMPTY_FORM,
      status: val,
    });
    setErrors(new Set());
  }, []);
 
  // ── pursued_nu_branch setter — resets level-2 and detail fields ───────────
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
 
  // ── pursued_other_school setter — resets detail fields only ───────────────
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
 
  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const required = getRequiredFields(form);
    const errs     = new Set();
    required.forEach((k) => {
      if (!form[k] || !String(form[k]).trim()) errs.add(k);
    });
    return errs;
  };
 
  // ── Save draft ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await saveSectionProgress(SECTION_KEY, form);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error('[EducationalBackgroundSHS] Error saving:', err);
    }
  };
 
  // ── Next (validate → save → navigate) ─────────────────────────────────────
  // Navigation destination is resolved from the user's status selection so
  // the branching logic stays in one place and is never duplicated.
  const handleNext = () => {
    const errs = validate();
    if (errs.size > 0) {
      setErrors(errs);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    const nextRoute = resolveNextRoute(form.status);
    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate(nextRoute))
      .catch((err) =>
        console.error('[EducationalBackgroundSHS] Error saving before navigation:', err)
      );
  };
 
  const formPct = computeFormPct(form);
 
  // ── Loading gate ───────────────────────────────────────────────────────────
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
      /* form */
      form={form}
      set={set}
      setStatus={setStatus}
      setPursuedNuBranch={setPursuedNuBranch}
      setPursuedOtherSchool={setPursuedOtherSchool}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
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
    />
  );
};
 
export default EducationalBackgroundSHS;