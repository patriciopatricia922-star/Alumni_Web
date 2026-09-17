/**
 * JobExperienceSHS.jsx — Logic Layer
 * Location: src/surveyshs/JobExperienceSHS.jsx
 *
 * Architecture is identical to all preceding SHS logic layers:
 *   • surveyConfig realtime subscription wired and ready
 *   • Two-step load: saved DB data first, then config hydration
 *   • Branch-aware validation — radio "Other" sub-fields + checkbox array
 *   • State resets cascade when a parent radio changes
 *   • Notification handling identical to all SHS sections
 *
 * Form fields (Q17–Q19, Work Experience sub-section):
 *   time_to_find_job      Radio   — no sub-field
 *   how_found_job         Radio   — other_how_found_job text when 'Other'
 *   factors_first_job     Array   — checkboxes
 *                                   other_factors text when 'Other' checked
 *
 * Navigation:
 *   PREV → /surveyshs/shs-employment-information
 *   NEXT → /surveyshs/shs-skills-and-competencies
 *
 * CHANGE LOG:
 *   • TOTAL_SECTIONS corrected from 5 → 6 to match the actual SHS section
 *     count. Frontend progress bar now aligns with DB percentage values.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import JobExperienceViewSHS from '../views/JobExperienceViewSHS';
import { useNotifications } from '../../hooks/useNotifications';
import { getReadIds } from '../../lib/notificationService';
// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS  = 6;   // FIX: was 5 — SHS has 6 sections total
const CURRENT_SECTION = 4;
const SECTION_KEY     = 'shs_job_experience';
const PREV_ROUTE      = '/surveyshs/shs-employment-information';
const NEXT_ROUTE      = '/surveyshs/shs-skills-and-competencies';

const DEPARTMENT_TYPE = 'shs';  // used for surveyConfig filtering

// This section's known position in the default SHS section order (matches
// SHS_SLUG_MAP[3] = 'shs-job-experience' in surveyRegistry.js). Used only
// to look up this section's live title/description/count for the header
// display — TOTAL_SECTIONS/CURRENT_SECTION above are untouched and still
// drive computeFormPct exactly as before.
const SECTION_INDEX = 3;

// Fallbacks shown until config has loaded, and used if the config lookup
// below ever fails to find this section.
const DEFAULT_SECTION_TITLE       = 'Job Experience';
const DEFAULT_SECTION_DESCRIPTION = 'Information related to your first job after graduation';
// ─────────────────────────────────────────────────────────────────────────────
// Static option lists
// ─────────────────────────────────────────────────────────────────────────────
export const TIME_TO_FIND_JOB_OPTIONS = [
  'Less than a month',
  '1-3 months',
  '4-6 months',
  '7-12 months',
  'More than a year',
  'Not Applicable',
];

export const HOW_FOUND_JOB_OPTIONS = [
  'Job/Career Fair',
  'Internship Absorption',
  'Online',
  'Recommendation',
  'Walk-in Applications',
  'Not Applicable',
  'Other',
];

export const FACTORS_FIRST_JOB_OPTIONS = [
  'Academic performance',
  'Internship/On-the-Job Training/Immersion',
  'Personal connections',
  'Skills/Competencies acquired in school',
  'Certifications',
  'Not Applicable',
  'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// Empty form shape
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  time_to_find_job:    '',
  how_found_job:       '',
  other_how_found_job: '',
  factors_first_job:   [],
  other_factors:       '',
};

// ─────────────────────────────────────────────────────────────────────────────
// Required fields — computed dynamically from current form state
// ─────────────────────────────────────────────────────────────────────────────
const getRequiredFields = (form) => {
  const required = new Set([
    'time_to_find_job',
    'how_found_job',
    'factors_first_job',
  ]);

  if (form.how_found_job === 'Other')           required.add('other_how_found_job');
  if (form.factors_first_job.includes('Other')) required.add('other_factors');

  return required;
};

// ─────────────────────────────────────────────────────────────────────────────
// Form completion percentage
// ─────────────────────────────────────────────────────────────────────────────
const computeFormPct = (form) => {
  const required = getRequiredFields(form);
  const base     = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const cap      = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;

  const filled = [...required].filter((k) => {
    const v = form[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && String(v).trim() !== '';
  }).length;

  const contrib = (filled / required.size) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(
    parseFloat((base + contrib).toFixed(2)),
    parseFloat(cap.toFixed(2))
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────
const JobExperienceSHS = () => {
  const navigate = useNavigate();

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);

  const [form,      setForm]      = useState(EMPTY_FORM);
  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  const { unreadCount, setNotifs, setUnreadCount } = useNotifications();

  // ── Section header display state (FIX: was hardcoded in the View) ────────
  // This file doesn't wire dynamic question labels (a separate, pre-existing
  // gap outside this task's scope) — this adds only the section
  // title/description/count extraction, reusing the same loadSurveyConfig
  // call already made below, whose return value was previously discarded.
  const [sectionTitle,          setSectionTitle]          = useState(DEFAULT_SECTION_TITLE);
  const [sectionDescription,    setSectionDescription]    = useState(DEFAULT_SECTION_DESCRIPTION);
  const [displayTotalSections,  setDisplayTotalSections]  = useState(TOTAL_SECTIONS);
  const [displayCurrentSection, setDisplayCurrentSection] = useState(CURRENT_SECTION);

  const applyConfig = useCallback((configData) => {
    const config = configData?.config ?? configData;
    if (!config?.sections) return;

    // Prefer a positional match (this section's known index in the default
    // SHS section order) so renaming the section title in Admin doesn't
    // break this lookup; an id/title match is kept as a fallback only.
    const jobSection =
      config.sections[SECTION_INDEX] ??
      config.sections.find(
        (s) => s.id === SECTION_KEY || s.title === 'Job Experience'
      );
    if (!jobSection) return;

    if (jobSection.title)       setSectionTitle(jobSection.title);
    if (jobSection.description) setSectionDescription(jobSection.description);
    if (config.sections.length) setDisplayTotalSections(config.sections.length);
    const foundIndex = config.sections.indexOf(jobSection);
    if (foundIndex !== -1) setDisplayCurrentSection(foundIndex + 1);
  }, []);

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
          console.log('[JobExperienceSHS] Loaded saved data:', saved);
          setForm((f) => ({
            ...f,
            time_to_find_job:    saved.time_to_find_job    ?? f.time_to_find_job,
            how_found_job:       saved.how_found_job       ?? f.how_found_job,
            other_how_found_job: saved.other_how_found_job ?? f.other_how_found_job,
            factors_first_job:   Array.isArray(saved.factors_first_job)
                                   ? saved.factors_first_job
                                   : f.factors_first_job,
            other_factors:       saved.other_factors       ?? f.other_factors,
          }));
        }
      } catch (err) {
        console.error('[JobExperienceSHS] Error loading saved data:', err);
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

  const setHowFoundJob = useCallback((val) => {
    setForm((f) => ({
      ...f,
      how_found_job:       val,
      other_how_found_job: '',
    }));
    setErrors((prev) => {
      const next = new Set(prev);
      next.delete('how_found_job');
      next.delete('other_how_found_job');
      return next;
    });
  }, []);

  const toggleFactors = useCallback((value) => {
    setForm((f) => {
      const already = f.factors_first_job.includes(value);
      const updated = already
        ? f.factors_first_job.filter((v) => v !== value)
        : [...f.factors_first_job, value];

      return {
        ...f,
        factors_first_job: updated,
        other_factors: (value === 'Other' && already) ? '' : f.other_factors,
      };
    });
    setErrors((prev) => {
      const next = new Set(prev);
      next.delete('factors_first_job');
      if (value === 'Other') next.delete('other_factors');
      return next;
    });
  }, []);

  const validate = () => {
    const required = getRequiredFields(form);
    const errs     = new Set();
    required.forEach((k) => {
      const v = form[k];
      if (Array.isArray(v)) {
        if (v.length === 0) errs.add(k);
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
      console.error('[JobExperienceSHS] Error saving draft:', err);
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
    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate(NEXT_ROUTE))
      .catch((err) =>
        console.error('[JobExperienceSHS] Error saving before navigation:', err)
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
    <JobExperienceViewSHS
      form={form}
      set={set}
      setHowFoundJob={setHowFoundJob}
      toggleFactors={toggleFactors}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      timeToFindJobOptions={TIME_TO_FIND_JOB_OPTIONS}
      howFoundJobOptions={HOW_FOUND_JOB_OPTIONS}
      factorsFirstJobOptions={FACTORS_FIRST_JOB_OPTIONS}
      formPct={formPct}
      currentSection={displayCurrentSection}
      totalSections={displayTotalSections}
      sectionTitle={sectionTitle}
      sectionDescription={sectionDescription}
      handleSave={handleSave}
      handleNext={handleNext}
      navigate={navigate}
      prevRoute={PREV_ROUTE}
    />
  );
};

export default JobExperienceSHS;