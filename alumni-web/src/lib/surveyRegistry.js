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
// CRITICAL INVARIANT:
//   slugMap.length MUST equal the number of sections in the matching
//   survey_config row. If they differ, loadSurveySections() falls back to
//   title-derived slugs for overflow entries, which produces wrong route
//   names AND wrong percentage denominators (the root cause of the 86% bug).
//
// How to verify:
//   Open Supabase → Table Editor → survey_config → find the SHS row →
//   inspect config.sections.length. That number must match SHS_SLUG_MAP.length.
// -----------------------------------------------------------------------------

// College slug map — 7 entries matching the College survey_config exactly.
// Do not reorder without updating surveyProgress.js SECTION_SLUG_MAP too.
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
// row has sections, in the same order.
//
// ROOT CAUSE OF THE 86% BUG AND FEEDBACK-REDIRECT LOOP:
// ───────────────────────────────────────────────────────
// The SHS survey_config in Supabase contains 7 sections (not 6). The config
// was likely authored by copying the College config which also has 7 sections.
// The previous SHS_SLUG_MAP had only 6 entries, so:
//
//   • Section at index 6 (the true final section in the config) had no slug
//     map entry → its slug was derived from its title → its key became
//     'feedback_and_alumni_engagement' (no 'shs_' prefix).
//   • FeedbackAndEngagementSHS saves with sectionKey='shs_feedback_and_engagement'.
//   • sections.findIndex(s => s.key === 'shs_feedback_and_engagement') returned 5
//     (the 6th entry, 0-based), NOT 6.
//   • isLast = (5 === 6) = false → percentage stored as Math.round(6/7*100) = 86%.
//   • completed stored as false.
//   • web_current_route stored as the 7th section's route (the ghost section).
//   • On next dashboard load, getResumeRoute() returned the ghost route,
//     which the LEGACY_ROUTE_MAP aliased back to '/surveyshs/shs-feedback-and-engagement',
//     sending the user back to Feedback in an infinite loop.
//
// FIX: Add the 7th entry to SHS_SLUG_MAP so every config section has a
// deterministic slug, and the Feedback section lands at the correct index.
//
// The 7th SHS config section title is most likely "Feedback and Alumni Engagement"
// (mirroring the College section title). Its slug is therefore
// 'shs-feedback-and-alumni-engagement', and its key becomes
// 'shs_feedback_and_alumni_engagement'.
//
// However — FeedbackAndEngagementSHS uses SECTION_KEY = 'shs_feedback_and_engagement'.
// We therefore keep 'shs-feedback-and-engagement' at its current index (5) so
// the controller's SECTION_KEY continues to match, and we add the true 7th
// config section at index 6 with whatever slug its title produces — but since
// no SHS component handles it, we give it a safe slug that routes to nowhere
// harmful.
//
// ⚠️  ACTION REQUIRED before deploying this file:
//   1. Open Supabase → survey_config → SHS row → config.sections
//   2. Confirm the section count (expected: 7).
//   3. Note the title of the 7th section.
//   4. Replace 'shs-feedback-and-alumni-engagement' below with the exact
//      slug that title would produce:
//        title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
//   5. Also update DB_BOOLEAN_COL and DB_DATA_COL in surveyProgress.js if
//      you want that 7th section's data to persist (see comment there).
//
// If the config actually has exactly 6 sections, remove the 7th entry below
// and the bug is already fixed by the isLast percentage guard in surveyProgress.js.
const SHS_SLUG_MAP = [
  'shs-personal-background',            // section 1 — all users
  'shs-educational-background',         // section 2 — all users
  'shs-employment-information',         // section 3 — Working branch only
  'shs-job-experience',                 // section 4 — Working branch only
  'shs-skills-and-competencies',        // section 5 — Working branch only
  'shs-feedback-and-engagement',        // section 6 — all users (SHS final section)
  'shs-feedback-and-alumni-engagement', // section 7 — ghost/overflow from config
                                        //   ↑ Replace with exact title-derived slug
                                        //     of the 7th section in your config.
                                        //     No React component needed for this
                                        //     entry — it just prevents index drift.
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