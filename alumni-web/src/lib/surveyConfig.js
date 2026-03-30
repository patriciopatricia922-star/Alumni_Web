import { supabase } from './supabase';

let cachedConfig = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

export const loadSurveyConfig = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedConfig && (now - lastFetchTime) < CACHE_DURATION) {
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
      return null;
    }

    cachedConfig = data?.config;
    lastFetchTime = now;
    return cachedConfig;
  } catch (err) {
    console.error('Failed to load survey config:', err);
    return null;
  }
};

export const getSectionQuestions = async (sectionTitle) => {
  const config = await loadSurveyConfig();
  if (!config?.sections) return null;
  
  const section = config.sections.find(s => s.title === sectionTitle);
  return section?.questions || null;
};

export const getQuestionLabel = async (sectionTitle, fieldId, defaultLabel) => {
  const questions = await getSectionQuestions(sectionTitle);
  const question = questions?.find(q => q.id === fieldId);
  return question?.label || defaultLabel;
};

export const getQuestionPlaceholder = async (sectionTitle, fieldId, defaultPlaceholder) => {
  const questions = await getSectionQuestions(sectionTitle);
  const question = questions?.find(q => q.id === fieldId);
  return question?.placeholder || defaultPlaceholder;
};

export const getQuestionOptions = async (sectionTitle, fieldId) => {
  const questions = await getSectionQuestions(sectionTitle);
  const question = questions?.find(q => q.id === fieldId);
  return question?.options || [];
};