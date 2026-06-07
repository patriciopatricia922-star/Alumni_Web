/**
 * surveyConfig.js  (v3 — branching-aware + hardened)
 * ─────────────────────────────────────────────────────────────────────────────
 * Changes vs v2:
 *
 *  1. `loadSurveyConfig()` — added explicit error code logging so RLS failures
 *     and "no rows" (PGRST116) are distinguishable in the console.
 *     The .or() filter is unchanged in shape but documented more precisely.
 *
 *  2. `getBranches()` — unchanged from v2, kept as-is.
 *
 *  3. `getConfigSection()` — unchanged from v2, kept as-is.
 *
 *  4. All other exports are character-for-character identical to v1/v2.
 */

import { supabase } from './supabase';

let cachedConfigs = {};
const CACHE_DURATION = 60_000; // 1 minute

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
    // ── Filter explanation ──────────────────────────────────────────────────
    // The Admin saves config without a survey_type field, so the JSONB column
    // will have config->>'survey_type' = NULL for college configs.
    // PostgREST's .or() with 'config->>survey_type.is.null' matches those rows.
    //
    // If this filter returns 0 rows despite a row existing, run this in
    // Supabase SQL editor to debug:
    //   select id, config->>'survey_type', updated_at
    //   from survey_config
    //   order by updated_at desc limit 5;
    // ───────────────────────────────────────────────────────────────────────

    let query = supabase
      .from('survey_config')
      .select('config')
      .order('updated_at', { ascending: false });

    if (departmentType === 'shs') {
      query = query.eq('config->>survey_type', 'shs');
    } else {
      query = query.or('config->>survey_type.is.null,config->>survey_type.eq.college');
    }

    const { data, error } = await query.limit(1).single();

    if (error) {
      // PGRST116 = no rows found — not a hard error, just no config saved yet
      if (error.code === 'PGRST116') {
        console.warn(
          '[surveyConfig] loadSurveyConfig: no config row found for departmentType=',
          departmentType,
          '— using fallback.'
        );
      } else {
        // 42501 = RLS permission denied. Any other code = unexpected error.
        console.error(
          '[surveyConfig] loadSurveyConfig error:',
          error.code,
          error.message,
          '| departmentType:', departmentType
        );
      }
      return cached?.data ?? null;
    }

    if (!data?.config) {
      console.warn('[surveyConfig] loadSurveyConfig: row found but config field is empty.');
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