// ============================================================================
// kpiEngine.js — Single source of truth for the 9 College Institutional KPIs
// ============================================================================
// Pipeline (each step is a pure function; nothing here touches Supabase, the
// prediction tables, train_model.py or any React state):
//
//   users + survey_progress rows
//        -> buildCollegeDataset()      eligibility (approved program + valid year)
//        -> normalised survey sections (missing data -> null)
//        -> per-KPI: eligibility -> evaluable (d) -> qualifying (n)
//        -> result object { id, label, n, d, rawPct, displayPct, target, ... }
//        -> consumed by BOTH the KPI cards and the KPI modal.
//
// Raw percentage is never rounded before it is compared with a target.
// displayPct is the only rounded value and is for presentation only.
// ============================================================================

// ----------------------------------------------------------------------------
// CONFIGURATION — everything an administrator may need to review lives here.
// ----------------------------------------------------------------------------

/**
 * Approved College programs. Source: CANONICAL_PROGRAMS in main.py with the
 * three SHS strands removed. Compared after normalisation (see normProgram).
 */
export const COLLEGE_PROGRAMS = [
  "BSArch",
  "BSIT-MWA",
  "BSCE",
  "BSCpE",
  "BSCS-ML",
  "BSPSY",
  "ABComm",
  "BPEd",
  "BSBA-MktgMgt",
  "BSBA-FinMgt",
  "BSBA-HRM",
  "BSHM",
  "BSMA",
  "BSTM",
  "BSAccountancy",
];

/**
 * Programs counted as the business population for Entrepreneurship.
 * Configurable. BSBA-HRM, BSMA, BSAccountancy, BSTM and BSHM are NOT added
 * automatically; add them here only after the institution confirms.
 */
export const ENTREPRENEURSHIP_PROGRAMS = ["BSBA-FinMgt", "BSBA-MktgMgt"];

/** Earliest plausible self-reported graduation year (mirrors train_model.py). */
export const MIN_GRAD_YEAR = 2000;

/**
 * Employment-status classification. Matched case-insensitively against
 * employment_information_data.employment_status. A status found in neither
 * list (for example "Other") is "unclassified" and is excluded from every
 * KPI that needs to know whether the alumnus is employed.
 */
export const EMPLOYED_STATUSES = [
  "Regular / Permanent",
  "Contractual",
  "Part-Time",
  "Probationary",
  "Self-Employed",
];
export const UNEMPLOYED_STATUSES = [
  "Unemployed, but looking for work",
  "Unemployed, but not looking for work",
];
export const SELF_EMPLOYED_STATUS = "Self-Employed";

/** Exact stored value of the internship answer (job_experience_data.first_job_source). */
export const INTERNSHIP_SOURCE_VALUE = "Internship Absorption";

/**
 * Supervisory classifier for employment_information_data.job_position.
 * Deterministic: whole-word / whole-phrase match, no substring matching, no AI.
 *
 * Deliberately NOT supervisory on their own (they appear in non-supervisory
 * titles): senior, officer, coordinator, lead (alone), head (alone), HR,
 * principal, chief-of-nothing.
 *
 * Edit these two lists to change the classification; nothing else needs to change.
 */
export const SUPERVISORY_TERMS = [
  "manager",
  "supervisor",
  "director",
  "department head",
  "head of",
  "team lead",
  "team leader",
  "superintendent",
  "foreman",
  "chief",
];
/** Titles that contain a supervisory word but are not supervisory roles. */
export const SUPERVISORY_EXCLUSIONS = [
  "assistant to the manager",
  "assistant to the director",
  "assistant to the supervisor",
  "assistant to manager",
  "assistant to director",
  "assistant to supervisor",
  "secretary to the manager",
  "secretary to the director",
  "manager's assistant",
  "director's assistant",
];

/**
 * Targets. null = "No target set". The 100% value that used to be hard-coded
 * on every card was a placeholder and is NOT an institutional target.
 * dir "above": higher is better. dir "below": lower is better (ceiling).
 * Use a positive number; 0 is reserved by the gauge for "No Goal".
 */
export const KPI_TARGET_CONFIG = {
  internship_absorption: { target: null, dir: "above" },
  employment_two_years: { target: null, dir: "above" },
  field_related: { target: null, dir: "above" },
  outside_field: { target: null, dir: "below" },
  entrepreneurship: { target: null, dir: "above" },
  supervisory: { target: null, dir: "above" },
  grad_studies: { target: null, dir: "above" },
  nu_grad_studies: { target: null, dir: "above" },
  prof_org: { target: null, dir: "above" },
};

export const NOT_MEASURABLE_MESSAGE = "Not measurable with current survey data";

export const KPI_LABELS = {
  internship_absorption: "Absorption from Internship",
  employment_two_years: "Employed Within 2 Yrs of Graduation",
  field_related: "Employed in Field / Related Field",
  outside_field: "Employed Outside Field of Specialization",
  entrepreneurship: "Engaged in Entrepreneurship",
  supervisory: "Occupying Supervisory Positions",
  grad_studies: "Pursued Graduate Studies (within 1 yr)",
  nu_grad_studies: "Pursued Graduate Studies at NU",
  prof_org: "In Positions in Professional Organizations",
};

// ----------------------------------------------------------------------------
// NORMALISATION HELPERS
// ----------------------------------------------------------------------------

export const safeParse = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

/**
 * Missing-data normalisation: null, undefined, "", whitespace-only strings and
 * empty objects/arrays become null. "Other" and "Not applicable" are NOT
 * treated as missing here; each KPI decides what to do with them.
 */
export const clean = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  if (Array.isArray(v)) return v.length === 0 ? null : v;
  if (typeof v === "object") return Object.keys(v).length === 0 ? null : v;
  return v;
};

/** A JSONB section as an object, or null when absent/empty (including "{}"). */
export const section = (raw) => clean(safeParse(raw));

const lc = (v) => {
  const c = clean(v);
  return typeof c === "string" ? c.toLowerCase() : null;
};

const isNotApplicable = (v) => lc(v) === "not applicable";

/** Case-insensitive, whitespace-trimmed program key used for comparison only. */
const normProgram = (p) => {
  const c = clean(p);
  return typeof c === "string" ? c.replace(/\s+/g, "").toLowerCase() : null;
};

const COLLEGE_PROGRAM_BY_KEY = new Map(
  COLLEGE_PROGRAMS.map((p) => [normProgram(p), p]),
);
const ENTREPRENEURSHIP_KEYS = new Set(
  ENTREPRENEURSHIP_PROGRAMS.map(normProgram),
);

const parseGradYear = (raw) => {
  const c = clean(raw);
  if (c === null) return null;
  const y = Number(c);
  return Number.isInteger(y) ? y : null;
};

/** "employed" | "unemployed" | "unclassified" | null (no status given). */
export const classifyEmployment = (emp) => {
  const s = lc(emp?.employment_status);
  if (s === null) return null;
  if (EMPLOYED_STATUSES.some((e) => e.toLowerCase() === s)) return "employed";
  if (UNEMPLOYED_STATUSES.some((e) => e.toLowerCase() === s)) return "unemployed";
  return "unclassified";
};

// ----------------------------------------------------------------------------
// SUPERVISORY CLASSIFIER
// ----------------------------------------------------------------------------

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wholeWord = (term) =>
  new RegExp(`(^|[^a-z0-9])${escapeRx(term.toLowerCase())}($|[^a-z0-9])`, "i");

const SUPERVISORY_RX = SUPERVISORY_TERMS.map(wholeWord);
const EXCLUSION_RX = SUPERVISORY_EXCLUSIONS.map(wholeWord);

export const isSupervisoryTitle = (title) => {
  const t = clean(title);
  if (typeof t !== "string") return false;
  if (EXCLUSION_RX.some((rx) => rx.test(t))) return false;
  return SUPERVISORY_RX.some((rx) => rx.test(t));
};

// ----------------------------------------------------------------------------
// VALIDATED COLLEGE DATASET
// ----------------------------------------------------------------------------

/**
 * Eligible College alumnus =
 *   role alumni (the dashboard query already filters role = 'alumni')
 *   AND users.program is in COLLEGE_PROGRAMS (normalised)
 *   AND educational_background_data.degree_program agrees with users.program
 *   AND educational_background_data.year_graduated is a valid year.
 *
 * Anything else is excluded WITH a reason; nothing is silently reclassified.
 *
 * @param {Array} users  rows { id, program, role? }
 * @param {Array} surveyRows rows from survey_progress (JSONB columns)
 * @param {{ currentYear?: number }} [opts]
 */
export const buildCollegeDataset = (users, surveyRows, opts = {}) => {
  const currentYear = opts.currentYear ?? new Date().getFullYear();
  const surveyByUser = new Map((surveyRows || []).map((r) => [r.user_id, r]));

  const eligible = [];
  const excluded = [];
  const warnings = [];

  (users || []).forEach((u, i) => {
    const ref = `R${String(i + 1).padStart(2, "0")}`;
    const programKey = normProgram(u.program);
    const canonical = programKey ? COLLEGE_PROGRAM_BY_KEY.get(programKey) : null;
    const survey = surveyByUser.get(u.id);

    const exclude = (reason) =>
      excluded.push({ ref, program: clean(u.program), reason });

    if (u.role !== undefined && lc(u.role) !== "alumni") {
      return exclude("role_not_alumni");
    }
    if (!canonical) {
      // SHS strands are out of scope by design; anything else is reported.
      if (programKey && programKey.startsWith("shs")) {
        return exclude("shs_program");
      }
      warnings.push(
        `${ref}: program ${JSON.stringify(clean(u.program))} is not in the approved College list; excluded, needs review.`,
      );
      return exclude("program_missing_or_not_approved");
    }
    if (!survey) return exclude("no_survey_row");

    const edu = section(survey.educational_background_data);
    const degreeKey = normProgram(edu?.degree_program);
    if (degreeKey && degreeKey !== programKey) {
      warnings.push(
        `${ref}: users.program (${canonical}) does not match degree_program (${edu.degree_program}); excluded, needs review.`,
      );
      return exclude("program_mismatch");
    }

    const year = parseGradYear(edu?.year_graduated);
    if (year === null || year < MIN_GRAD_YEAR || year > currentYear) {
      return exclude("invalid_or_missing_year_graduated");
    }

    eligible.push({
      ref,
      program: canonical,
      programKey,
      completed: !!survey.completed,
      emp: section(survey.employment_information_data),
      edu,
      job: section(survey.job_experience_data),
      skills: section(survey.skills_competencies_data),
    });
  });

  return { eligible, excluded, warnings };
};

// ----------------------------------------------------------------------------
// RESULT OBJECT
// ----------------------------------------------------------------------------

const buildResult = (id, spec, rowsOutcome, extra = {}) => {
  const { target = null, dir = "above" } = KPI_TARGET_CONFIG[id] || {};
  const n = rowsOutcome.filter((r) => r.outcome === "qualifying").length;
  const d = n + rowsOutcome.filter((r) => r.outcome === "non_qualifying").length;
  const rawPct = d > 0 ? (n / d) * 100 : null; // NOT rounded
  const displayPct = rawPct === null ? null : Math.round(rawPct);

  let status;
  let gap = null;
  if (spec.notMeasurable) status = "not_measurable";
  else if (d === 0) status = "no_data";
  else if (target === null) status = "no_target";
  else {
    gap = dir === "below" ? rawPct - target : target - rawPct; // > 0 = shortfall
    status = gap > 0 ? "not_met" : "met";
  }

  return {
    id,
    label: KPI_LABELS[id],
    basis: spec.basis, // direct | to_date | intent | not_measurable
    n,
    d,
    rawPct,
    displayPct,
    target,
    targetDir: dir,
    gap,
    status,
    note: spec.note || null,
    breakdown: {
      eligiblePopulation: spec.eligibleCount,
      evaluable: d,
      qualifying: n,
      nonQualifying: d - n,
      notEvaluable: rowsOutcome.filter((r) => r.outcome === "not_evaluable").length,
      ...extra,
    },
    rows: rowsOutcome.map(({ ref, program, outcome, reason }) => ({
      ref,
      program,
      outcome,
      reason,
    })),
  };
};

const row = (r, outcome, reason) => ({ ref: r.ref, program: r.program, outcome, reason });

const notMeasurable = (id, eligibleCount, reason) =>
  buildResult(
    id,
    {
      basis: "not_measurable",
      notMeasurable: true,
      eligibleCount,
      note: NOT_MEASURABLE_MESSAGE,
    },
    [],
    { reason },
  );

// ----------------------------------------------------------------------------
// THE NINE KPIs
// ----------------------------------------------------------------------------

export const computeCollegeKpis = (dataset) => {
  const { eligible } = dataset;
  const E = eligible.length;
  const out = {};

  // 1. Absorption from Internship -------------------------------------------
  // d: first_job_source present and not "Not applicable"; n: exact match.
  out.internship_absorption = buildResult(
    "internship_absorption",
    { basis: "direct", eligibleCount: E },
    eligible.map((r) => {
      const src = clean(r.job?.first_job_source);
      if (src === null) return row(r, "not_evaluable", "no_first_job_source");
      if (isNotApplicable(src)) return row(r, "not_evaluable", "not_applicable");
      return lc(src) === INTERNSHIP_SOURCE_VALUE.toLowerCase()
        ? row(r, "qualifying", "internship_absorption")
        : row(r, "non_qualifying", "other_source");
    }),
  );

  // 2. Employed within 2 years ("to date") ----------------------------------
  // The 2-year window is not complete for the 2025/2026 batches, so this is
  // reported "to date": currently employed OR reported a real
  // time_to_find_job bucket (i.e. a job was found after graduation).
  out.employment_two_years = buildResult(
    "employment_two_years",
    {
      basis: "to_date",
      eligibleCount: E,
      note:
        "Reported to date: currently employed, or reported finding a job after graduation. The 2-year window is not yet complete for the 2025-2026 batches, so this is not a strict 2-year outcome.",
    },
    eligible.map((r) => {
      const cls = classifyEmployment(r.emp);
      if (cls === null || cls === "unclassified") {
        return row(r, "not_evaluable", cls === null ? "no_employment_status" : "unclassified_status");
      }
      if (cls === "employed") return row(r, "qualifying", "currently_employed");
      const ttf = clean(r.job?.time_to_find_job);
      if (ttf !== null && !isNotApplicable(ttf)) {
        return row(r, "qualifying", "found_job_after_graduation");
      }
      return row(r, "non_qualifying", "no_job_reported");
    }),
  );

  // 3 & 4. In field / Outside field ----------------------------------------
  // Same evaluated population, complementary conditions.
  const fieldRows = (match) =>
    eligible.map((r) => {
      if (classifyEmployment(r.emp) !== "employed") {
        return row(r, "not_evaluable", "not_employed");
      }
      const v = lc(r.emp.job_related_to_degree);
      if (v !== "yes" && v !== "no") {
        return row(r, "not_evaluable", "no_job_related_answer");
      }
      return v === match
        ? row(r, "qualifying", `job_related_${match}`)
        : row(r, "non_qualifying", `job_related_${match === "yes" ? "no" : "yes"}`);
    });
  out.field_related = buildResult("field_related", { basis: "direct", eligibleCount: E }, fieldRows("yes"));
  out.outside_field = buildResult("outside_field", { basis: "direct", eligibleCount: E }, fieldRows("no"));

  // 5. Entrepreneurship ------------------------------------------------------
  // Business-program alumni who are employed; n = status "Self-Employed".
  out.entrepreneurship = buildResult(
    "entrepreneurship",
    {
      basis: "direct",
      eligibleCount: eligible.filter((r) => ENTREPRENEURSHIP_KEYS.has(r.programKey)).length,
    },
    eligible.map((r) => {
      if (!ENTREPRENEURSHIP_KEYS.has(r.programKey)) {
        return row(r, "not_evaluable", "not_business_program");
      }
      if (classifyEmployment(r.emp) !== "employed") {
        return row(r, "not_evaluable", "not_employed");
      }
      return lc(r.emp.employment_status) === SELF_EMPLOYED_STATUS.toLowerCase()
        ? row(r, "qualifying", "self_employed")
        : row(r, "non_qualifying", "employed_by_others");
    }),
  );

  // 6. Supervisory positions -------------------------------------------------
  const unreviewedTitles = [];
  out.supervisory = buildResult(
    "supervisory",
    {
      basis: "direct",
      eligibleCount: E,
      note:
        "Classified from job_position by a documented whole-word rule (see SUPERVISORY_TERMS in kpiEngine.js). Titles that do not match are counted as non-supervisory.",
    },
    eligible.map((r) => {
      if (classifyEmployment(r.emp) !== "employed") {
        return row(r, "not_evaluable", "not_employed");
      }
      const title = clean(r.emp.job_position);
      if (typeof title !== "string") return row(r, "not_evaluable", "no_job_position");
      if (isSupervisoryTitle(title)) return row(r, "qualifying", "supervisory_title");
      unreviewedTitles.push(title);
      return row(r, "non_qualifying", "non_supervisory_title");
    }),
    { titlesCountedAsNonSupervisory: unreviewedTitles },
  );

  // 7. Graduate studies (intent only) ---------------------------------------
  out.grad_studies = buildResult(
    "grad_studies",
    {
      basis: "intent",
      eligibleCount: E,
      note:
        "Based on reported postgraduate plans (post_grad_plans). This is intent, not proof of enrolment, and the survey has no enrolment date.",
    },
    eligible.map((r) => {
      const v = lc(r.edu?.post_grad_plans);
      if (v !== "yes" && v !== "no") return row(r, "not_evaluable", "no_post_grad_plans_answer");
      return v === "yes"
        ? row(r, "qualifying", "plans_postgraduate")
        : row(r, "non_qualifying", "no_plans");
    }),
  );

  // 8 & 9. Not measurable with current survey data ---------------------------
  out.nu_grad_studies = notMeasurable(
    "nu_grad_studies",
    E,
    "The survey stores a postgraduate course name (post_grad_course), not the institution, so study at NU cannot be established.",
  );
  out.prof_org = notMeasurable(
    "prof_org",
    E,
    "The survey has no question on positions held in professional organizations. The previous value counted Leadership Skills self-ratings of 4 or 5, which is a different thing.",
  );

  return out;
};

/** Convenience: dataset + KPIs in one call. */
export const computeCollegeKpiResults = (users, surveyRows, opts) => {
  const dataset = buildCollegeDataset(users, surveyRows, opts);
  return { dataset, results: computeCollegeKpis(dataset) };
};

// ----------------------------------------------------------------------------
// PRESENTATION HELPERS (shared by the card wiring and the modal)
// ----------------------------------------------------------------------------

/** Card props derived from a result. No arithmetic beyond formatting. */
export const toCardProps = (result) => {
  const measurable = result.status !== "not_measurable";
  const hasPct = measurable && result.displayPct !== null;
  const hasTarget = result.target !== null && measurable && result.d > 0;
  let targetLabel;
  if (!measurable) targetLabel = "Not measurable";
  else if (hasTarget) targetLabel = `Goal: ${result.target}% (${result.n} of ${result.d})`;
  else targetLabel = `No target set (${result.n} of ${result.d})`;

  return {
    value: hasPct ? `${result.displayPct}%` : "N/A",
    progress: hasPct ? result.displayPct : 0,
    target: hasTarget ? result.target : 0, // 0 = "No Goal" gauge, never "Goal not met"
    targetDir: result.targetDir,
    targetLabel,
    status: result.status,
    result,
  };
};

const fmt = (x) => (Math.round(x * 100) / 100).toString();

/**
 * Modal text built from the SAME result object the card uses.
 * Returns { summary, lines }.
 */
export const describeKpiResult = (result) => {
  if (!result) return { summary: null, lines: [] };
  if (result.status === "not_measurable") {
    return {
      summary: NOT_MEASURABLE_MESSAGE + ".",
      lines: [result.breakdown.reason].filter(Boolean),
    };
  }
  const lines = [];
  if (result.d === 0) {
    return { summary: "No evaluable responses yet.", lines };
  }
  lines.push(
    `${result.n} of ${result.d} evaluable alumni qualify = ${fmt(result.rawPct)}% (shown as ${result.displayPct}%).`,
  );
  lines.push(
    `Eligible College alumni: ${result.breakdown.eligiblePopulation}; not evaluable for this KPI: ${result.breakdown.notEvaluable}.`,
  );
  if (result.target !== null) {
    lines.push(
      result.targetDir === "below"
        ? `Target: at most ${result.target}%. Current value is ${fmt(Math.abs(result.gap))} points ${result.gap > 0 ? "above" : "within"} the ceiling.`
        : `Target: ${result.target}%. Current value is ${fmt(Math.abs(result.gap))} points ${result.gap > 0 ? "below" : "above"} the target.`,
    );
  } else {
    lines.push("No institutional target has been set for this KPI.");
  }
  if (result.note) lines.push(result.note);
  lines.push(`Based on ${result.d} response${result.d === 1 ? "" : "s"}; one alumnus moves this value by ${fmt(100 / result.d)} points.`);
  return {
    summary: `${result.label}: ${result.n} of ${result.d} = ${fmt(result.rawPct)}%.`,
    lines,
  };
};