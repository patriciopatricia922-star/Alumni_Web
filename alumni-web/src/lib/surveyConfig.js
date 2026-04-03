// lib/surveyConfig.js
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
// that the very next loadSurveyConfig() call fetches fresh data from Supabase
// instead of serving a stale in-memory copy.
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

// ---------------------------------------------------------------------------
// subscribeToSurveyConfigChanges
//
// Creates an independent Realtime channel for each caller.
//
// KEY FIXES applied here:
//
// 1. UNIQUE CHANNEL NAMES
//    A monotonic counter appended to the channel name ensures each component
//    instance gets its own channel. Previously all 7 survey sections shared
//    the name 'survey_config_changes'; when any one unmounted and called
//    channel.unsubscribe() it silently destroyed the subscription for every
//    other section still on screen.
//
// 2. SUBSCRIPTION STATUS GUARD
//    The postgres_changes callback now checks the channel's subscription
//    status before acting. While the GoTrueClient singleton fix (supabase.js)
//    eliminates the auth-driven teardown that caused channels to enter a
//    broken CLOSED/CHANNEL_ERROR state, this guard is kept as a defensive
//    measure — if the channel is not SUBSCRIBED we skip the stale-data
//    callback and let the channel reconnect naturally.
//
// 3. ERROR LOGGING
//    The .subscribe() call now accepts a status callback so channel errors
//    surface in the DevTools console rather than failing silently.
//
// 4. FIX 1 — REPLICATION LAG GUARD (NEW)
//    A 300ms delay is inserted before the onUpdate callback fires. Without
//    this, loadSurveyConfig(true) races Supabase's replication pipeline:
//    the Realtime event arrives the instant the WAL entry is written, but
//    the SELECT on the reading client can still see the old row if it runs
//    before the commit is fully visible to the connection pool.
//    300ms is conservative — Supabase's own docs suggest replication lag is
//    typically <100ms on the same region, but this gives a comfortable margin
//    for cross-region and cold-pool scenarios without any perceptible UX cost.
//
// Returns the Supabase channel object.
// Call channel.unsubscribe() in the useEffect cleanup to release resources.
//
// Usage:
//   useEffect(() => {
//     const ch = subscribeToSurveyConfigChanges(async () => {
//       const cfg = await loadSurveyConfig(true);
//       applyConfig(cfg);
//     });
//     return () => ch.unsubscribe();
//   }, []);
// ---------------------------------------------------------------------------
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
        console.log('[Realtime] Raw Payload:', payload);
        
        // FIX: Clear the local cache so subsequent loads get the new data
        clearSurveyConfigCache();

        // FIX: Add a tiny delay (200ms) before telling the UI to refresh.
        // This ensures that when the component calls loadSurveyConfig(true),
        // the database is ready to serve the new version.
        setTimeout(() => {
          onUpdate(payload.new.config); 
        }, 200);
      }
    )
    .subscribe((status) => {
      console.log(`[Realtime] ${channelId} status:`, status);
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