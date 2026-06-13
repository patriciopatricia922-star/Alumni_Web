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
// When an SHS config does not yet exist in survey_config, the registry
// transparently falls back to the college survey so no existing flow breaks.
// -----------------------------------------------------------------------------

// SECTION_SLUG_MAP per survey type.
// College map mirrors the existing SECTION_SLUG_MAP in surveyProgress.js
// exactly — do not reorder without updating both files.
const COLLEGE_SLUG_MAP = [
  'personal-background',
  'educational-background',
  'certification-achievement',
  'employment-information',
  'job-experience',
  'skills-and-competencies',
  'feedback-and-engagement',
];

// SHS slug map — must have exactly as many entries as the SHS survey_config
// row has sections, in the same order, so that slugMap[index] never falls
// through to the title-derived fallback (which causes wrong route names and
// inflated percentage denominators).
//
// The SHS survey has 6 sections total. Sections 3-5 (employment, job-experience,
// skills) are only visited by users on the "Working" branch; all other users
// jump from section 2 directly to section 6 (feedback). The slug map must still
// list all 6 entries so the index arithmetic in loadSurveySections() stays
// aligned with the config sections array.
const SHS_SLUG_MAP = [
  'shs-personal-background',       // section 1  — all users
  'shs-educational-background',    // section 2  — all users
  'shs-employment-information',    // section 3  — Working branch only
  'shs-job-experience',            // section 4  — Working branch only
  'shs-skills-and-competencies',   // section 5  — Working branch only
  'shs-feedback-and-engagement',   // section 6  — all users (final)
];

/**
 * Registry entry shape:
 * {
 *   slugMap        : string[]   — ordered section slugs
 *   configMatcher  : (config) => boolean
 *                               — identifies the right row in survey_config
 *   fallbackType   : string     — type to fall back to if no config row found
 *   routePrefix    : string     — URL prefix for survey routes
 * }
 */
export const SURVEY_REGISTRY = {
  college: {
    slugMap:       COLLEGE_SLUG_MAP,
    configMatcher: (config) =>
      !config?.survey_type || config.survey_type === 'college',
    fallbackType:  null,   // college is the ultimate fallback; no further chain
    routePrefix:   '/survey',
  },
  shs: {
    slugMap:       SHS_SLUG_MAP,
    configMatcher: (config) => config?.survey_type === 'shs',
    fallbackType:  'college',
    routePrefix:   '/surveyshs',
  },
};

/**
 * Resolve the registry entry for a given department type.
 * Always returns a valid entry (never throws).
 *
 * @param {"college" | "shs" | null} departmentType
 * @returns {typeof SURVEY_REGISTRY["college"]}
 */
export const resolveRegistry = (departmentType) =>
  SURVEY_REGISTRY[departmentType] ?? SURVEY_REGISTRY.college;