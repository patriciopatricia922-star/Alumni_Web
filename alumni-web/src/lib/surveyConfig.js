import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Module-level cache
// ---------------------------------------------------------------------------
let cachedConfig  = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60_000; // 1 minute

// ---------------------------------------------------------------------------
// clearSurveyConfigCache
// ---------------------------------------------------------------------------
export const clearSurveyConfigCache = () => {
  cachedConfig  = null;
  lastFetchTime = 0;
};

// ---------------------------------------------------------------------------
// loadSurveyConfig
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
      return cachedConfig; // return stale copy rather than crashing
    }

    cachedConfig  = data?.config ?? null;
    lastFetchTime = now;
    return cachedConfig;
  } catch (err) {
    console.error('Failed to load survey config:', err);
    return cachedConfig;
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
        event: 'UPDATE',
        schema: 'public',
        table: 'survey_config',
      },
      (payload) => {
        // console.log('[Realtime] Raw Payload:', payload);
        
        
        clearSurveyConfigCache();

        // Add a tiny delay (200ms) before telling the UI to refresh.
        setTimeout(() => {
          onUpdate(payload.new.config); 
        }, 200);
      }
    )
    .subscribe((status) => {
      // console.log(`[Realtime] ${channelId} status:`, status);
    });

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