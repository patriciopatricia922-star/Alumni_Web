import { supabase } from './supabase';

// Dynamic section mapping - will be populated from survey_config
let DYNAMIC_SECTIONS = [];

// Function to load sections from survey_config
export const loadSurveySections = async () => {
  try {
    const { data, error } = await supabase
      .from('survey_config')
      .select('config')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data?.config?.sections) {
      console.warn('No survey config found, using default sections');
      return null;
    }

    // Build dynamic sections array from config
    DYNAMIC_SECTIONS = data.config.sections.map((section, index) => {
      const key = section.title.toLowerCase().replace(/\s+/g, '_');
      const percentage = Math.round(((index + 1) / data.config.sections.length) * 100);
      return {
        key,
        title: section.title,
        web_route: `/survey/${index + 1}`,
        mobile_route: `/survey/${index + 1}`,
        percentage,
        index: index + 1,
      };
    });

    return DYNAMIC_SECTIONS;
  } catch (err) {
    console.error('Error loading survey sections:', err);
    return null;
  }
};

// Get sections (waits for dynamic load if needed)
export const getSurveySections = async () => {
  if (DYNAMIC_SECTIONS.length === 0) {
    await loadSurveySections();
  }
  return DYNAMIC_SECTIONS;
};

const COMPLETE_SENTINEL = '__complete__';

const normalizeLegacyWebRoute = (route) => {
  if (!route) return route;
  if (route === '/survey/feedback' || route === '/survey/alumni-engagement') {
    return '/survey/feedback-and-engagement';
  }
  return route;
};

const normalizeLegacyMobileRoute = (route) => {
  if (!route) return route;
  if (route === '/feedback' || route === '/engage') {
    return '/feedback-and-engagement';
  }
  return route;
};

const splitMergedFeedbackPayload = (formData = {}) => {
  const feedbackData = {
    recommend: formData.recommend ?? '',
    suggestions: formData.suggestions ?? '',
    satisfaction: formData.satisfaction ?? '',
  };

  const engagementData = {
    participate_in: formData.participate_in ?? [],
    other_participate: formData.other_participate ?? '',
    informed_about_events: formData.informed_about_events ?? '',
  };

  return { feedbackData, engagementData };
};

// Save progress when a section is completed
export const saveSectionProgress = async (sectionKey, formData = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const sections = await getSurveySections();
  const sectionIndex = sections.findIndex((section) => section.key === sectionKey);
  if (sectionIndex === -1) return;

  const isLast = sectionIndex === sections.length - 1;
  const nextSection = sections[sectionIndex + 1];
  const percentage = sections[sectionIndex].percentage;

  const updates = {
    user_id: user.id,
    current_section: sectionIndex + 1,
    web_current_route: isLast ? COMPLETE_SENTINEL : nextSection.web_route,
    mobile_current_route: isLast ? COMPLETE_SENTINEL : nextSection.mobile_route,
    percentage,
    completed: isLast,
    last_updated: new Date().toISOString(),
    [sectionKey]: true,
  };

  if (formData) {
    if (sectionKey === 'feedback_university') {
      const { feedbackData, engagementData } = splitMergedFeedbackPayload(formData);
      updates.feedback_university_data = feedbackData;
      updates.alumni_engagement_data = engagementData;
      updates.alumni_engagement = true;
    } else {
      updates[`${sectionKey}_data`] = formData;
    }
  }

  const { error } = await supabase
    .from('survey_progress')
    .upsert(updates, { onConflict: 'user_id' });

  if (error) {
    console.error('Error saving progress:', error.message);
  }
};

// Load saved form data for a specific section
export const loadSectionData = async (sectionKey) => {
  const progress = await loadSurveyProgress();
  if (!progress) return null;

  if (sectionKey === 'feedback_university') {
    return {
      ...(progress.feedback_university_data || {}),
      ...(progress.alumni_engagement_data || {}),
    };
  }

  return progress[`${sectionKey}_data`] || null;
};

// Load full progress row
export const loadSurveyProgress = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('survey_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error loading survey progress:', error.message);
    return null;
  }

  return data;
};

// Get the WEB route to resume from
export const getResumeRoute = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) {
    const sections = await getSurveySections();
    return sections[0]?.web_route || '/survey/1';
  }

  if (progress.completed || progress.web_current_route === COMPLETE_SENTINEL) {
    return '/update-tracer';
  }

  if (progress.web_current_route) {
    return normalizeLegacyWebRoute(progress.web_current_route);
  }

  if (progress.current_route) {
    const normalizedCurrentRoute = normalizeLegacyMobileRoute(progress.current_route);
    const sections = await getSurveySections();
    const matched = sections.find(
      (section) => section.mobile_route === normalizedCurrentRoute
    );
    if (matched) return matched.web_route;

    const legacyWebRoute = normalizeLegacyWebRoute(progress.current_route);
    if (legacyWebRoute?.startsWith('/survey/')) return legacyWebRoute;
  }

  const sections = await getSurveySections();
  return sections[0]?.web_route || '/survey/1';
};

export const getMobileResumeRoute = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) {
    const sections = await getSurveySections();
    return sections[0]?.mobile_route || '/survey/1';
  }

  if (progress.completed || progress.mobile_current_route === COMPLETE_SENTINEL) {
    return '/survey-complete';
  }

  if (progress.mobile_current_route) {
    return normalizeLegacyMobileRoute(progress.mobile_current_route);
  }

  if (progress.current_route) {
    const normalizedCurrentRoute = normalizeLegacyMobileRoute(progress.current_route);
    const sections = await getSurveySections();
    const matched = sections.find(
      (section) => section.mobile_route === normalizedCurrentRoute
    );
    if (matched) return matched.mobile_route;
    return normalizedCurrentRoute;
  }

  const sections = await getSurveySections();
  return sections[0]?.mobile_route || '/survey/1';
};

export const isSurveyComplete = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return false;
  return progress.completed === true || progress.percentage >= 100;
};

// Get current section index
export const getCurrentSectionIndex = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return 0;
  return progress.current_section ? progress.current_section - 1 : 0;
};

// Mark a section as completed (for when user finishes a section)
export const markSectionComplete = async (sectionKey) => {
  const sections = await getSurveySections();
  const sectionIndex = sections.findIndex((s) => s.key === sectionKey);
  if (sectionIndex === -1) return;

  const isLast = sectionIndex === sections.length - 1;
  const nextSection = sections[sectionIndex + 1];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const updates = {
    user_id: user.id,
    current_section: sectionIndex + 1,
    web_current_route: isLast ? COMPLETE_SENTINEL : nextSection?.web_route,
    mobile_current_route: isLast ? COMPLETE_SENTINEL : nextSection?.mobile_route,
    percentage: sections[sectionIndex].percentage,
    completed: isLast,
    last_updated: new Date().toISOString(),
    [sectionKey]: true,
  };

  const { error } = await supabase
    .from('survey_progress')
    .upsert(updates, { onConflict: 'user_id' });

  if (error) {
    console.error('Error marking section complete:', error.message);
  }
};