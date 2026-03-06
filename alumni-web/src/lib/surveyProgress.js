import { supabase } from './supabase';

// Section order and their corresponding routes + percentages
export const SURVEY_SECTIONS = [
  { key: 'personal_background',        route: '/survey/personal-background',       percentage: 14  },
  { key: 'educational_background',     route: '/survey/educational-background',    percentage: 28  },
  { key: 'certification_achievement',  route: '/survey/certification-achievement', percentage: 42  },
  { key: 'employment_information',     route: '/survey/employment-information',    percentage: 57  },
  { key: 'job_experience',             route: '/survey/job-experience',            percentage: 71  },
  { key: 'skills_competencies',        route: '/survey/skills-and-competencies',   percentage: 85  },
  { key: 'feedback_university',        route: '/survey/feedback',                  percentage: 95  },
  { key: 'alumni_engagement',          route: '/survey/alumni-engagement',         percentage: 100 },
];

// Save progress + form data when a section is completed
export const saveSectionProgress = async (sectionKey, formData = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const sectionIndex = SURVEY_SECTIONS.findIndex(s => s.key === sectionKey);
  if (sectionIndex === -1) return;

  const nextSection = SURVEY_SECTIONS[sectionIndex + 1];
  const percentage = SURVEY_SECTIONS[sectionIndex].percentage;

  const updates = {
    user_id: user.id,
    current_section: sectionIndex + 1,
    current_route: nextSection ? nextSection.route : SURVEY_SECTIONS[sectionIndex].route,
    percentage,
    last_updated: new Date().toISOString(),
    [sectionKey]: true,
    // Save form data if provided
    ...(formData ? { [`${sectionKey}_data`]: formData } : {}),
  };

  const { error } = await supabase
    .from('survey_progress')
    .upsert(updates, { onConflict: 'user_id' });

  if (error) console.error('Error saving progress:', error.message);
};

// Load saved form data for a specific section
export const loadSectionData = async (sectionKey) => {
  const progress = await loadSurveyProgress();
  if (!progress) return null;
  return progress[`${sectionKey}_data`] || null;
};

// Load progress for current user
export const loadSurveyProgress = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('survey_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle(); // returns null instead of 406 when no row exists

  if (error) {
    console.error('Error loading survey progress:', error.message);
    return null;
  }

  return data;
};

// Get the route to resume from
export const getResumeRoute = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return '/survey/personal-background';
  return progress.current_route || '/survey/personal-background';
};