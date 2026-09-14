// ─── surveyRegistry.js ───────────────────────────────────────────────────────
// Maps a department type to its survey configuration.
//
// Architecture:
//   classifyDepartment(program) → "college" | "shs"
//       ↓
//   SURVEY_REGISTRY[type]       → { configFilter, fallbackType, slugMap, … }
//       ↓
//   loadSurveySections()        → sections array for that survey type
//
// COUNT IS DYNAMIC, NOT DRIVEN BY THESE ARRAYS:
//   loadSurveySections() (surveyProgress.js) iterates over the *actual*
//   `survey_config.config.sections` array from the DB — its length is what
//   determines the section count and the percentage denominator, always.
//   slugMap below only supplies a stable, human-readable slug/route for the
//   sections that have a dedicated React controller wired to a specific
//   SECTION_KEY. Any config section at an index beyond slugMap.length (e.g.
//   a brand-new section an admin just added) automatically gets a slug
//   derived from its own title instead — see the `slug = slugMap[index] ??
//   title-derived-slug` fallback in loadSurveySections(). Nothing here needs
//   to be edited just because an admin added or removed a section.
//
// PAST INCIDENT (now resolved on the Admin side, kept here for context):
//   SHS_SLUG_MAP previously had 6 entries while a stray/duplicate 7th
//   section ("Feedback and Alumni Engagement") lingered in the SHS
//   survey_config row, probably left over from copying the College config.
//   That extra section fell through to the title-derived-slug fallback and
//   didn't match the real Feedback controller's SECTION_KEY, which threw
//   off the isLast check and produced a stuck 86% completion / redirect
//   loop (see the self-healing repair in surveyProgress.js, kept as a
//   safety net for any users already stuck in that state).
//
//   The correct fix is NOT to keep padding this array with a guessed 7th
//   slug every time a stray section shows up — that just re-hardcodes the
//   count. The actual fix is to delete the stray section from the SHS
//   survey config in Admin ▸ Survey Management (SurveyManagement.jsx's
//   deleteSection, now confirmed to fully remove it from the persisted
//   config on Publish). Once deleted, SHS is back to its true 6 sections
//   and this file needs no changes. If an admin later adds a *real* new
//   SHS section, it will automatically get a title-derived slug/key via
//   the fallback above — no edit needed here either.

// College slug map — canonical slugs for the 7 sections that have a
// dedicated controller. Additional admin-added sections are handled by the
// title-derived-slug fallback in loadSurveySections(), not by this array.
const COLLEGE_SLUG_MAP = [
  'personal-background',
  'educational-background',
  'certification-achievement',
  'employment-information',
  'job-experience',
  'skills-and-competencies',
  'feedback-and-engagement',
];

// SHS slug map — canonical slugs for the 6 sections that have a dedicated
// controller. Additional admin-added sections are handled by the
// title-derived-slug fallback in loadSurveySections(), not by this array.
const SHS_SLUG_MAP = [
  'shs-personal-background',       // section 1 — all users
  'shs-educational-background',    // section 2 — all users
  'shs-employment-information',    // section 3 — Working branch only
  'shs-job-experience',            // section 4 — Working branch only
  'shs-skills-and-competencies',   // section 5 — Working branch only
  'shs-feedback-and-engagement',   // section 6 — all users (SHS final section)
];

export const SURVEY_REGISTRY = {
  college: {
    slugMap:       COLLEGE_SLUG_MAP,
    configMatcher: (config) =>
      !config?.survey_type || config.survey_type === 'college',
    fallbackType:  null,
    routePrefix:   '/survey',
  },
  shs: {
    slugMap:       SHS_SLUG_MAP,
    configMatcher: (config) => config?.survey_type === 'shs',
    fallbackType:  'college',
    routePrefix:   '/surveyshs',
  },
};

export const resolveRegistry = (departmentType) =>
  SURVEY_REGISTRY[departmentType] ?? SURVEY_REGISTRY.college;