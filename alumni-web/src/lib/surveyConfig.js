// surveyConfig.js
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Module-level cache
// ---------------------------------------------------------------------------
let cachedConfig  = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60_000; // 1 minute

// ---------------------------------------------------------------------------
// clearSurveyConfigCache
// Called by SurveyManagement.js immediately after a successful publish so
// that the very next loadSurveyConfig() call (on any survey page) fetches
// fresh data from Supabase instead of serving a stale in-memory copy.
// ---------------------------------------------------------------------------
export const clearSurveyConfigCache = () => {
  cachedConfig  = null;
  lastFetchTime = 0;
};

// ---------------------------------------------------------------------------
// loadSurveyConfig
// forceRefresh = true  → always bypass the in-memory cache and hit Supabase.
// forceRefresh = false → use the cached copy if it is still within the TTL.
// ---------------------------------------------------------------------------
export const loadSurveyConfig = async (forceRefresh = false) => {
  const now = Date.now();

  if (
    !forceRefresh &&
    cachedConfig !== null &&
    now - lastFetchTime < CACHE_DURATION
  ) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from('survey_config')
      .select('config')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error loading survey config:', error);
      // Return whatever is cached (may be null) rather than crashing the page.
      return cachedConfig;
    }

    cachedConfig  = data?.config ?? null;
    lastFetchTime = now;
    return cachedConfig;
  } catch (err) {
    console.error('Failed to load survey config:', err);
    return cachedConfig;
  }
};

// ---------------------------------------------------------------------------
// subscribeToSurveyConfigChanges
//
// Call this once (e.g. in a top-level useEffect) on any page that needs to
// stay in sync with admin edits. Whenever Supabase fires an UPDATE event on
// survey_config the cache is cleared so the next loadSurveyConfig() call
// fetches the latest row automatically.
//
// Returns the Supabase channel object; call channel.unsubscribe() in the
// useEffect cleanup to avoid memory leaks.
//
// Usage:
//   useEffect(() => {
//     const ch = subscribeToSurveyConfigChanges(() => {
//       loadSurveyConfig(true).then(cfg => applyConfig(cfg));
//     });
//     return () => ch.unsubscribe();
//   }, []);
// ---------------------------------------------------------------------------
export const subscribeToSurveyConfigChanges = (onUpdate) => {
  const channel = supabase
    .channel('survey_config_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'survey_config' },
      () => {
        // Invalidate the cache first, then notify the caller.
        clearSurveyConfigCache();
        if (typeof onUpdate === 'function') onUpdate();
      }
    )
    .subscribe();

  return channel;
};

// ---------------------------------------------------------------------------
// Convenience helpers (unchanged public API)
// ---------------------------------------------------------------------------
export const getSectionQuestions = async (sectionTitle) => {
  const config = await loadSurveyConfig();
  if (!config?.sections) return null;
  const section = config.sections.find(s => s.title === sectionTitle);
  return section?.questions || null;
};

export const getQuestionLabel = async (sectionTitle, fieldId, defaultLabel) => {
  const questions = await getSectionQuestions(sectionTitle);
  const question  = questions?.find(q => q.id === fieldId);
  return question?.label || defaultLabel;
};

export const getQuestionPlaceholder = async (sectionTitle, fieldId, defaultPlaceholder) => {
  const questions = await getSectionQuestions(sectionTitle);
  const question  = questions?.find(q => q.id === fieldId);
  return question?.placeholder || defaultPlaceholder;
};

export const getQuestionOptions = async (sectionTitle, fieldId) => {
  const questions = await getSectionQuestions(sectionTitle);
  const question  = questions?.find(q => q.id === fieldId);
  return question?.options || [];
};