// ─── departmentClassifier.js ─────────────────────────────────────────────────
// Single source of truth for classifying a program string into a department
// type. All survey routing decisions derive from this module.
//
// Returns:
//   "shs"     — Senior High School strand
//   "college" — Any recognised college program
//   null      — Unrecognised / empty program (treated as college by callers)
// -----------------------------------------------------------------------------

const SHS_PROGRAMS = new Set(['SHS-STEM', 'SHS-ABM', 'SHS-HUMSS']);

const COLLEGE_PROGRAMS = new Set([
  // SECA
  'BSArch', 'BSIT-MWA', 'BSCE', 'BSCpE', 'BSCS-ML',
  // SASE
  'BSPSY', 'ABComm', 'BPEd',
  // SBMA
  'BSBA-MktgMgt', 'BSBA-FinMgt', 'BSBA-HRM',
  'BSHM', 'BSMA', 'BSTM', 'BSAccountancy',
]);

/**
 * Classify a canonical program string into a department type.
 *
 * @param {string | null | undefined} program — canonical program abbreviation
 *   as stored in the `users` table (e.g. "SHS-STEM", "BSIT-MWA")
 * @returns {"shs" | "college" | null}
 */
export const classifyDepartment = (program) => {
  if (!program) return null;

  const normalised = program.trim().toUpperCase().replace(/[\s\-]+/g, '-');

  if (SHS_PROGRAMS.has(normalised)    ||
      SHS_PROGRAMS.has(program.trim())) {
    return 'shs';
  }

  if (COLLEGE_PROGRAMS.has(program.trim())) {
    return 'college';
  }

  // Loose fallback: any program prefixed with "SHS" is SHS
  if (normalised.startsWith('SHS')) return 'shs';

  return 'college'; // unknown programs default to college survey
};

/**
 * Returns true if the program belongs to SHS.
 *
 * @param {string | null | undefined} program
 * @returns {boolean}
 */
export const isSHSProgram = (program) => classifyDepartment(program) === 'shs';