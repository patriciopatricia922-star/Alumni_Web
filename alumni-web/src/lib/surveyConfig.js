/**
 * surveyConfig.js  (v4 — reads routed through Railway, RLS-safe in prod)
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes vs v3:
 *
 *  1. `loadSurveyConfig()` — now fetches from the Railway API
 *     (`${API_BASE}/admin/survey-config?survey_type=...`) instead of querying
 *     `survey_config` directly with the browser's Supabase anon-key client.
 *     The old direct SELECT was subject to RLS, which blocks unauthenticated
 *     alumni reads in production while happening to work on localhost (same
 *     admin-authenticated browser session used to preview both sides). This
 *     mirrors the pattern SurveyManagement.jsx already uses for Admin reads.
 *     Function signature, cache shape, and return value are unchanged, so no
 *     caller needed to change.
 *
 *  2. `getBranches()` — unchanged.
 *
 *  3. `getConfigSection()` — unchanged.
 *
 *  4. `subscribeToSurveyConfigChanges()` — unchanged (still Supabase Realtime;
 *     this only affects live in-tab refresh, not the initial load, and every
 *     section already force-refreshes via `loadSurveyConfig(true, ...)` on
 *     mount, which is the actual fix for the reported symptom).
 *
 *  5. All other exports are character-for-character identical to v3.
 */

import { supabase } from './supabase';

let cachedConfigs = {};
const CACHE_DURATION = 60_000; // 1 minute

// Same Railway API base the Admin panel (SurveyManagement.jsx) already uses
// for its own reads/writes. Falls back to the local dev API when
// VITE_API_BASE_URL isn't set (matches SurveyManagement.jsx's pattern).
const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/api`;

export const clearSurveyConfigCache = () => {
  cachedConfigs = {};
};

/**
 * Load the full survey config for the given department type.
 *
 * The returned object has the shape:
 *   {
 *     title:    string,
 *     sections: Section[],
 *     branches: BranchMap,
 *   }
 *
 * `branches` is the object the Admin builds in SurveyManagement and persists
 * via handlePublish(). Keys are "q-<uid>" or "q-<uid>-opt<N>"; values are
 * arrays of destination refs ("next" | "end" | "q-<uid>").
 *
 * ERROR CODES to watch for in the console:
 *   PGRST116 — query returned 0 rows (no config saved yet, or filter mismatch)
 *   42501    — RLS permission denied (anon role cannot SELECT survey_config)
 *   Any other code — network or schema error
 *
 * @param {boolean} forceRefresh
 * @param {'college'|'shs'} departmentType
 * @returns {Promise<object|null>}
 */
export const loadSurveyConfig = async (forceRefresh = false, departmentType = 'college') => {
  const now    = Date.now();
  const cached = cachedConfigs[departmentType];

  if (
    !forceRefresh &&
    cached?.data !== undefined &&
    now - cached.fetchTime < CACHE_DURATION
  ) {
    return cached.data;
  }

  try {
    // ── ROOT CAUSE (see investigation notes) ─────────────────────────────────
    // This used to query `survey_config` directly with the browser's Supabase
    // anon-key client (a plain .from('survey_config').select('config') call).
    // That direct client-side SELECT is governed by the table's RLS policy,
    // which only grants read access to authenticated staff/admin sessions —
    // not to anonymous alumni visitors. On localhost this was masked because
    // the same logged-in admin session/browser was reused to preview the
    // alumni survey pages, so RLS happened to allow the read. In production,
    // real alumni requests are unauthenticated, so PostgREST silently
    // returned 0 rows (not a thrown error) — `data` ended up null every time,
    // `applyConfig()` never ran in any section, and every field quietly fell
    // back to its hardcoded DEFAULT_* labels/options. That is exactly the
    // "Admin changes don't reflect on the alumni side" symptom.
    //
    // SurveyManagement.jsx (Admin) already solved this identical problem for
    // its own reads by routing through the Railway API instead of the direct
    // Supabase client (see its commented-out `supabaseAdmin` calls, replaced
    // by `fetch(`${API_BASE}/admin/survey-config...`)`). That Railway route
    // holds the service-role key server-side and isn't subject to the
    // browser-facing RLS policy, which is why Admin's own reads always work
    // in production. We mirror that exact, already-verified-working pattern
    // here so every alumni-facing section (College and SHS) reads through the
    // same reliable path instead of the RLS-restricted browser client.
    //
    // Nothing else about this function changes: same cache shape, same
    // signature, same return value (the raw `config` object), so no caller
    // (getSectionQuestions, getBranches, getConfigSection, or any of the
    // section controllers / useSurveyBranching) needs to change.
    const res = await fetch(`${API_BASE}/admin/survey-config?survey_type=${departmentType}`);

    if (!res.ok) {
      console.error(
        '[surveyConfig] loadSurveyConfig: request failed —',
        res.status, res.statusText,
        '| departmentType:', departmentType
      );
      return cached?.data ?? null;
    }

    const json = await res.json();
    const data = json?.data;

    if (!data?.config) {
      console.warn(
        '[surveyConfig] loadSurveyConfig: no config row found for departmentType=',
        departmentType,
        '— using fallback.'
      );
      return cached?.data ?? null;
    }

    cachedConfigs[departmentType] = { data: data.config, fetchTime: now };
    return cachedConfigs[departmentType].data;

  } catch (err) {
    console.error('[surveyConfig] loadSurveyConfig unexpected exception:', err);
    return cached?.data ?? null;
  }
};

let _channelCounter = 0;

export const subscribeToSurveyConfigChanges = (onUpdate) => {
  _channelCounter++;
  const channelId = `survey_config_ch_${_channelCounter}`;

  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      {
        event:  'UPDATE',
        schema: 'public',
        table:  'survey_config',
      },
      (payload) => {
        clearSurveyConfigCache();
        setTimeout(() => {
          onUpdate(payload.new.config);
        }, 200);
      }
    )
    .subscribe();

  return channel;
};

export const getSectionQuestions = async (sectionTitle, departmentType = 'college') => {
  const config = await loadSurveyConfig(false, departmentType);
  if (!config?.sections) return null;
  const section = config.sections.find(s => s.title === sectionTitle);
  return section?.questions || null;
};

export const getQuestionLabel = async (sectionTitle, fieldId, defaultLabel, departmentType = 'college') => {
  const questions = await getSectionQuestions(sectionTitle, departmentType);
  const question  = questions?.find(q => q.id === fieldId);
  return question?.label || defaultLabel;
};

export const getQuestionPlaceholder = async (sectionTitle, fieldId, defaultPlaceholder, departmentType = 'college') => {
  const questions = await getSectionQuestions(sectionTitle, departmentType);
  const question  = questions?.find(q => q.id === fieldId);
  return question?.placeholder || defaultPlaceholder;
};

export const getQuestionOptions = async (sectionTitle, fieldId, departmentType = 'college') => {
  const questions = await getSectionQuestions(sectionTitle, departmentType);
  const question  = questions?.find(q => q.id === fieldId);
  return question?.options || [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Branching-specific helpers (first added in v2, unchanged in v3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the Admin-configured branching rules for a survey.
 *
 * Shape:
 *   {
 *     "q-<uid>-opt<N>": ["q-<destUid>"],
 *     "q-<uid>":        ["next"],
 *   }
 *
 * Returns {} when no rules are configured — safe default (no fields hidden).
 *
 * @param {'college'|'shs'} departmentType
 * @returns {Promise<object>}
 */
export const getBranches = async (departmentType = 'college') => {
  const config = await loadSurveyConfig(false, departmentType);
  return config?.branches ?? {};
};

/**
 * Return the full section object (including questions with id + options) for
 * the given section title. Used by useSurveyBranching to map question IDs
 * back to option indexes.
 *
 * @param {string} sectionTitle
 * @param {'college'|'shs'} departmentType
 * @returns {Promise<object|null>}
 */
export const getConfigSection = async (sectionTitle, departmentType = 'college') => {
  const config = await loadSurveyConfig(false, departmentType);
  return config?.sections?.find(s => s.title === sectionTitle) ?? null;
};