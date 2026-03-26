import { supabase } from './supabase';

export const SURVEY_SECTIONS = [
  {
    key: 'personal_background',
    web_route: '/survey/personal-background',
    mobile_route: '/personal',
    percentage: 14,
  },
  {
    key: 'educational_background',
    web_route: '/survey/educational-background',
    mobile_route: '/education',
    percentage: 28,
  },
  {
    key: 'certification_achievement',
    web_route: '/survey/certification-achievement',
    mobile_route: '/certification',
    percentage: 42,
  },
  {
    key: 'employment_information',
    web_route: '/survey/employment-information',
    mobile_route: '/employment',
    percentage: 57,
  },
  {
    key: 'job_experience',
    web_route: '/survey/job-experience',
    mobile_route: '/job',
    percentage: 71,
  },
  {
    key: 'skills_competencies',
    web_route: '/survey/skills-and-competencies',
    mobile_route: '/skills',
    percentage: 85,
  },
  {
    key: 'feedback_university',
    web_route: '/survey/feedback-and-engagement',
    mobile_route: '/feedback-and-engagement',
    percentage: 100,
  },
];

const COMPLETE_SENTINEL = '__complete__';

const normalizeLegacyWebRoute = (route) => {
  if (!route) return route;

  if (
    route === '/survey/feedback' ||
    route === '/survey/alumni-engagement'
  ) {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const sectionIndex = SURVEY_SECTIONS.findIndex((section) => section.key === sectionKey);
  if (sectionIndex === -1) return;

  const isLast = sectionIndex === SURVEY_SECTIONS.length - 1;
  const nextSection = SURVEY_SECTIONS[sectionIndex + 1];
  const percentage = SURVEY_SECTIONS[sectionIndex].percentage;

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  if (!progress) return '/survey/personal-background';

  if (progress.completed || progress.web_current_route === COMPLETE_SENTINEL) {
    return '/survey/complete';
  }

  if (progress.web_current_route) {
    return normalizeLegacyWebRoute(progress.web_current_route);
  }

  if (progress.current_route) {
    const normalizedCurrentRoute = normalizeLegacyMobileRoute(progress.current_route);

    const matched = SURVEY_SECTIONS.find(
      (section) => section.mobile_route === normalizedCurrentRoute
    );
    if (matched) return matched.web_route;

    const legacyWebRoute = normalizeLegacyWebRoute(progress.current_route);
    if (legacyWebRoute?.startsWith('/survey/')) return legacyWebRoute;
  }

  return '/survey/personal-background';
};

export const getMobileResumeRoute = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return '/personal';

  if (progress.completed || progress.mobile_current_route === COMPLETE_SENTINEL) {
    return '/survey-complete';
  }

  if (progress.mobile_current_route) {
    return normalizeLegacyMobileRoute(progress.mobile_current_route);
  }

  if (progress.current_route) {
    const normalizedCurrentRoute = normalizeLegacyMobileRoute(progress.current_route);

    const matched = SURVEY_SECTIONS.find(
      (section) => section.mobile_route === normalizedCurrentRoute
    );
    if (matched) return matched.mobile_route;

    return normalizedCurrentRoute;
  }

  return '/personal';
};

export const isSurveyComplete = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return false;
  return progress.completed === true || progress.percentage >= 100;
};
