import { supabase } from './supabase';

// ─── Canonical section definitions ───────────────────────────────────────────
// Keys are the single source of truth shared with mobile.
// web_route = React Router path  |  mobile_route = Flutter named route
export const SURVEY_SECTIONS = [
  { key: 'personal_background',        web_route: '/survey/personal-background',       mobile_route: '/personal',    percentage: 14  },
  { key: 'educational_background',     web_route: '/survey/educational-background',    mobile_route: '/education',   percentage: 28  },
  { key: 'certification_achievement',  web_route: '/survey/certification-achievement', mobile_route: '/certification', percentage: 42 },
  { key: 'employment_information',     web_route: '/survey/employment-information',    mobile_route: '/employment',  percentage: 57  },
  { key: 'job_experience',             web_route: '/survey/job-experience',            mobile_route: '/job',         percentage: 71  },
  { key: 'skills_competencies',        web_route: '/survey/skills-and-competencies',   mobile_route: '/skills',      percentage: 85  },
  { key: 'feedback_university',        web_route: '/survey/feedback',                  mobile_route: '/feedback',    percentage: 95  },
  { key: 'alumni_engagement',          web_route: '/survey/alumni-engagement',         mobile_route: '/engage',      percentage: 100 },
];

const COMPLETE_SENTINEL = '__complete__';

// ─── Save progress when a section is completed ────────────────────────────────
export const saveSectionProgress = async (sectionKey, formData = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const sectionIndex = SURVEY_SECTIONS.findIndex(s => s.key === sectionKey);
  if (sectionIndex === -1) return;

  const isLast      = sectionIndex === SURVEY_SECTIONS.length - 1;
  const nextSection = SURVEY_SECTIONS[sectionIndex + 1];
  const percentage  = SURVEY_SECTIONS[sectionIndex].percentage;

  // Store web_route and mobile_route separately so each platform
  // can resume on its own route without interfering with the other.
  const updates = {
    user_id:         user.id,
    current_section: sectionIndex + 1,
    // Web resumes at next web_route, or sentinel when done
    web_current_route:    isLast ? COMPLETE_SENTINEL : nextSection.web_route,
    // Mobile resumes at next mobile_route, or sentinel when done
    mobile_current_route: isLast ? COMPLETE_SENTINEL : nextSection.mobile_route,
    percentage,
    completed:       isLast,
    last_updated:    new Date().toISOString(),
    [sectionKey]:    true,
    ...(formData ? { [`${sectionKey}_data`]: formData } : {}),
  };

  const { error } = await supabase
    .from('survey_progress')
    .upsert(updates, { onConflict: 'user_id' });

  if (error) console.error('Error saving progress:', error.message);
};

// ─── Load saved form data for a specific section ──────────────────────────────
export const loadSectionData = async (sectionKey) => {
  const progress = await loadSurveyProgress();
  if (!progress) return null;
  return progress[`${sectionKey}_data`] || null;
};

// ─── Load full progress row ───────────────────────────────────────────────────
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

// ─── Get the WEB route to resume from ────────────────────────────────────────
// Returns '/survey/complete' when survey is fully done.
export const getResumeRoute = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return '/survey/personal-background';

  // Survey finished
  if (progress.completed || progress.web_current_route === COMPLETE_SENTINEL) {
    return '/survey/complete';
  }

  // Has a valid web route stored
  if (progress.web_current_route) {
    return progress.web_current_route;
  }

  // Legacy fallback: if old `current_route` contains a mobile route,
  // map it back to the correct web route.
  if (progress.current_route) {
    const matched = SURVEY_SECTIONS.find(
      s => s.mobile_route === progress.current_route
    );
    if (matched) return matched.web_route;
    // If it looks like a web route already, use it
    if (progress.current_route.startsWith('/survey/')) return progress.current_route;
  }

  return '/survey/personal-background';
};

// ─── Check if the survey is fully completed ───────────────────────────────────
export const isSurveyComplete = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return false;
  return progress.completed === true || progress.percentage >= 100;
};