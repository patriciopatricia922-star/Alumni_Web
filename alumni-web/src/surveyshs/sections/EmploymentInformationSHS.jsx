/**
 * EmploymentInformationSHS.jsx — Logic Layer
 * Location: src/surveyshs/EmploymentInformationSHS.jsx
 *
 * Architecture mirrors EducationalBackgroundSHS.jsx exactly:
 *   • surveyConfig realtime subscription for dynamic labels / options
 *   • Two-step load: saved DB data first, then config hydration
 *   • Branch-aware validation — only validates fields currently visible
 *   • State resets cascade down the tree when a parent answer changes,
 *     preventing stale values from persisting in hidden branches
 *   • Notification handling identical to all other SHS sections
 *
 * SHS Employment branching (driven by form.employment_status):
 *
 *   Employed statuses (Regular/Permanent, Contractual, Part-time,
 *                      Probationary, Self-Employed)
 *     → job_position, company_name, type_of_industry (+other),
 *       location_of_employment, monthly_income, job_related_to_strand
 *
 *   Unemployed statuses (Unemployed – Looking, Unemployed – Not Looking)
 *     → (no further detail fields — status alone is sufficient)
 *
 *   'Other'
 *     → other_employment_status text field only
 *
 * CHANGE LOG:
 *   • TOTAL_SECTIONS corrected from 5 → 6 to match the actual SHS section
 *     count. Frontend progress bar now aligns with DB percentage values.
 *   • PREV_ROUTE corrected: removed spurious /sections/ path segment.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { saveSectionProgress, loadSectionData } from '../../lib/surveyProgress';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../../lib/surveyConfig';
import EmploymentInformationViewSHS from '../views/EmploymentInformationViewSHS';
import { useNotifications } from '../../hooks/useNotifications';
import { getReadIds } from '../../lib/notificationService';

// ─────────────────────────────────────────────────────────────────────────────
// Survey constants
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS  = 6; 
const CURRENT_SECTION = 3;
const SECTION_KEY     = 'shs_employment_information';
const PREV_ROUTE      = '/surveyshs/shs-educational-background';
const NEXT_ROUTE_DEFAULT    = '/surveyshs/shs-job-experience';
const NEXT_ROUTE_UNEMPLOYED = '/surveyshs/shs-feedback-and-engagement';

const DEPARTMENT_TYPE = 'shs';  

// ─────────────────────────────────────────────────────────────────────────────
// Static option lists (SHS-specific)
// ─────────────────────────────────────────────────────────────────────────────
export const SHS_EMPLOYMENT_STATUSES = [
  'Regular/Permanent',
  'Contractual',
  'Part-time',
  'Probationary',
  'Self-Employed',
  'Unemployed (Looking for Work)',
  'Unemployed (Not Looking for Work)',
  'Other',
];

export const SHS_EMPLOYED_STATUSES = [
  'Regular/Permanent',
  'Contractual',
  'Part-time',
  'Probationary',
  'Self-Employed',
];

export const SHS_UNEMPLOYED_STATUSES = [
  'Unemployed (Looking for Work)',
  'Unemployed (Not Looking for Work)',
];

const resolveNextRoute = (status) =>
  SHS_UNEMPLOYED_STATUSES.includes(status) ? NEXT_ROUTE_UNEMPLOYED : NEXT_ROUTE_DEFAULT;

export const SHS_INDUSTRY_OPTIONS = [
  'Education/Academe',
  'Healthcare/Medical',
  'Information Technology',
  'Engineering',
  'Business/Finance',
  'Government/Public',
  'Private Companies',
  'Others',
];

export const SHS_LOCATION_OPTIONS = ['Local', 'Abroad', 'None'];

export const SHS_MONTHLY_INCOME_OPTIONS = [
  'Below ₱15,000',
  '₱15,001 – ₱30,000',
  '₱30,001 – ₱50,000',
  'Above ₱50,000',
  'Not Applicable',
];

export const SHS_UNEMPLOYED_REASON_OPTIONS = [
  'Pursuing further studies',
  'Family responsibilities or personal matters',
  'Health-related reasons',
  'Lack of job opportunities related to the field of study',
  'Other',
];

// ─────────────────────────────────────────────────────────────────────────────
// Required fields per branch path
// ─────────────────────────────────────────────────────────────────────────────
const getRequiredFields = (form) => {
  const required = new Set(['employment_status']);

  if (form.employment_status === 'Other') {
    required.add('other_employment_status');
  }

  if (SHS_EMPLOYED_STATUSES.includes(form.employment_status)) {
    required.add('job_position');
    required.add('company_name');
    required.add('type_of_industry');
    if (form.type_of_industry === 'Others') required.add('type_of_industry_other');
    required.add('location_of_employment');
    required.add('monthly_income');
    required.add('job_related_to_strand');
  }

  if (SHS_UNEMPLOYED_STATUSES.includes(form.employment_status)) {
    required.add('reason_unemployed');
    if (form.reason_unemployed === 'Other') required.add('reason_unemployed_other');
  }

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
// Empty form shape
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  employment_status:       '',
  other_employment_status: '',
  job_position:            '',
  company_name:            '',
  type_of_industry:        '',
  type_of_industry_other:  '',
  location_of_employment:  '',
  monthly_income:          '',
  job_related_to_strand:   '',
  reason_unemployed:       '', 
  reason_unemployed_other: '', 
};

// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────
const EmploymentInformationSHS = () => {
  const navigate = useNavigate();

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
      await loadSurveyConfig(true, DEPARTMENT_TYPE); // FIXED
    });
    return () => { cancelled = true; channel?.unsubscribe(); };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await loadSectionData(SECTION_KEY);
        if (saved && Object.keys(saved).length > 0) {
          console.log('[EmploymentInformationSHS] Loaded saved data:', saved);
          setForm((f) => ({ ...f, ...saved }));
        }
      } catch (err) {
        console.error('[EmploymentInformationSHS] Error loading saved data:', err);
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

  const setEmploymentStatus = useCallback((val) => {
    setForm({ ...EMPTY_FORM, employment_status: val });
    setErrors(new Set());
  }, []);

  const setTypeOfIndustry = useCallback((val) => {
    setForm((f) => ({
      ...f,
      type_of_industry:       val,
      type_of_industry_other: '',
    }));
    setErrors((prev) => {
      const next = new Set(prev);
      next.delete('type_of_industry');
      next.delete('type_of_industry_other');
      return next;
    });
  }, []);

  const validate = () => {
    const required = getRequiredFields(form);
    const errs     = new Set();
    required.forEach((k) => {
      if (!form[k] || !String(form[k]).trim()) errs.add(k);
    });
    return errs;
  };

  const handleSave = async () => {
    try {
      await saveSectionProgress(SECTION_KEY, form);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error('[EmploymentInformationSHS] Error saving:', err);
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

    const nextRoute = resolveNextRoute(form.employment_status); // FIXED: was static NEXT_ROUTE

    // Skipping Job Experience — store prevRoute so Feedback's Back button
    // returns here instead of to Job Experience (mirrors the pattern used
    // in EducationalBackgroundSHS.jsx for its Stopped/skip branches).
    if (nextRoute === NEXT_ROUTE_UNEMPLOYED) {
      try {
        sessionStorage.setItem('shs_feedback_prev_route', '/surveyshs/shs-employment-information');
      } catch (_) {}
    }

    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate(nextRoute))
      .catch((err) =>
        console.error('[EmploymentInformationSHS] Error saving before navigation:', err)
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
    <EmploymentInformationViewSHS
      form={form}
      set={set}
      setEmploymentStatus={setEmploymentStatus}
      setTypeOfIndustry={setTypeOfIndustry}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      employmentStatuses={SHS_EMPLOYMENT_STATUSES}
      employedStatuses={SHS_EMPLOYED_STATUSES}
      unemployedStatuses={SHS_UNEMPLOYED_STATUSES}
      industryOptions={SHS_INDUSTRY_OPTIONS}
      locationOptions={SHS_LOCATION_OPTIONS}
      monthlyIncomeOptions={SHS_MONTHLY_INCOME_OPTIONS}
      unemployedReasonOptions={SHS_UNEMPLOYED_REASON_OPTIONS} 
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      handleSave={handleSave}
      handleNext={handleNext}
      navigate={navigate}
      prevRoute={PREV_ROUTE}
    />
  );
};

export default EmploymentInformationSHS;