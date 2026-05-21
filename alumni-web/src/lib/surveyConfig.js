import { supabase } from './supabase';

let cachedConfigs = {};
const CACHE_DURATION = 60_000;

export const clearSurveyConfigCache = () => {
  cachedConfigs = {};
};

export const loadSurveyConfig = async (forceRefresh = false, departmentType = 'college') => {
  const now = Date.now();
  const cached = cachedConfigs[departmentType];

  if (
    !forceRefresh &&
    cached?.data !== undefined &&
    now - cached.fetchTime < CACHE_DURATION
  ) {
    return cached.data;
  }

  try {
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
      console.error('Error loading survey config:', error);
      return cached?.data ?? null;
    }

    cachedConfigs[departmentType] = { data: data?.config ?? null, fetchTime: now };
    return cachedConfigs[departmentType].data;
  } catch (err) {
    console.error('Failed to load survey config:', err);
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
        event: 'UPDATE',
        schema: 'public',
        table: 'survey_config',
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
  const question = questions?.find(q => q.id === fieldId);
  return question?.label || defaultLabel;
};

export const getQuestionPlaceholder = async (sectionTitle, fieldId, defaultPlaceholder, departmentType = 'college') => {
  const questions = await getSectionQuestions(sectionTitle, departmentType);
  const question = questions?.find(q => q.id === fieldId);
  return question?.placeholder || defaultPlaceholder;
};

export const getQuestionOptions = async (sectionTitle, fieldId, departmentType = 'college') => {
  const questions = await getSectionQuestions(sectionTitle, departmentType);
  const question = questions?.find(q => q.id === fieldId);
  return question?.options || [];
};