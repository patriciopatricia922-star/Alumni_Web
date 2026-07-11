// ============================================================================
// alumniUtils.js — Shared Alumni Classification Helpers
// ============================================================================
// Single source of truth for College vs SHS categorisation.
// Imported by AdminDashboard and AlumniManagement — never import these
// from a component file to avoid circular-dependency and module-load issues.
// ============================================================================

/**
 * Returns true for any SHS strand whose program value is prefixed "SHS-"
 * (e.g. SHS-STEM, SHS-ABM, SHS-HUMSS).
 */
export const isSHSProgram = (program = '') =>
  (program || '').toUpperCase().trimStart().startsWith('SHS');

/**
 * Returns true for any College program — everything that is not an SHS strand.
 */
export const isCollegeProgram = (program = '') =>
  !isSHSProgram(program);