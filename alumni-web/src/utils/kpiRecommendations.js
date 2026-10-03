// ============================================================================
// kpiRecommendations.js — Deterministic facts + seeded wording for the KPI modal
// ============================================================================
// Input : ONE KPI result object from kpiEngine.js (the same object the card uses).
// Output: { badge, summary, observations[], recommendations[], severity }
//
// Rules this file follows:
//  - Every number and category in the text is read from the result object.
//    Nothing is invented, estimated or taken from the prediction model.
//  - Only the WORDING varies. Which variant is used is chosen by a hash of
//    (kpi id, n, d, target), so the same data always gives the same text and a
//    changed result can give different text. No random number generator is used.
//  - A shortfall is only claimed when the result's status is "not_met".
//    With no target set, the text says so and offers areas to consider.
// ============================================================================

import { NOT_MEASURABLE_MESSAGE } from "./kpiEngine.js";

/**
 * Severity bands, in percentage points of gap to the target.
 * These are configurable institutional thresholds, NOT facts about the data.
 * gap <= small -> "small"; gap <= moderate -> "moderate"; otherwise "severe".
 */
export const SEVERITY_BANDS = { small: 10, moderate: 25 };

/** Number of suggested actions shown per severity (the pool has three per KPI). */
const ACTIONS_BY_SEVERITY = { small: 1, moderate: 2, severe: 3 };

/** Stable string hash (djb2). Same input -> same number, every time. */
const hash = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
};
const pick = (variants, seed, salt) =>
  variants[hash(`${seed}|${salt}`) % variants.length];

const r1 = (x) => Math.round(x * 10) / 10;
const pct = (x) => `${r1(x)}%`;
const pts = (x) => `${r1(Math.abs(x))} percentage point${r1(Math.abs(x)) === 1 ? "" : "s"}`;

// ----------------------------------------------------------------------------
// Wording for the facts
// ----------------------------------------------------------------------------

const REASON_TEXT = {
  no_first_job_source: "no first-job source answered",
  not_applicable: 'answered "Not applicable" for first-job source',
  not_employed: "not currently employed",
  no_job_related_answer: "no job-related answer",
  no_job_position: "no job position given",
  not_business_program: "not in a business program",
  no_employment_status: "no employment status given",
  unclassified_status: 'employment status not classified (for example "Other")',
  no_post_grad_plans_answer: "no postgraduate-plans answer",
};

const CATEGORY_INTRO = {
  internship_absorption: "First-job sources reported",
  employment_two_years: "Employment outcomes",
  field_related: "Relevance of current job to degree",
  outside_field: "Relevance of current job to degree",
  entrepreneurship: "Employment status of employed business-program alumni",
  grad_studies: "Postgraduate plans",
};

const BADGE = {
  not_met: "Below Target Performance",
  met: "Target Met",
  no_target: "No Target Set",
  not_measurable: "Not Measurable",
  no_data: "No Data Yet",
};

const SEVERITY_PHRASE = {
  small: ["The gap is small.", "The shortfall is modest."],
  moderate: ["The gap is moderate.", "The shortfall is noticeable."],
  severe: ["The gap is large.", "The shortfall is substantial."],
};

// ----------------------------------------------------------------------------
// Suggested actions: three per KPI, each with two interchangeable wordings.
// These are general institutional suggestions, not claims about the data.
// ----------------------------------------------------------------------------

const ACTIONS = {
  internship_absorption: [
    [
      "Strengthen partnerships with internship host companies and agree on clear paths from internship to hiring.",
      "Work with host companies to set internship-to-hire pathways, and follow up on how many interns are offered jobs.",
    ],
    [
      "Record which host companies later hire interns and prioritise them in future placements.",
      "Keep a list of host companies that have absorbed interns and give them priority when assigning students.",
    ],
    [
      "Prepare students before the internship ends on how hiring decisions are made and how to express interest in staying.",
      "Brief interns near the end of their placement on how to ask about, and apply for, a permanent role.",
    ],
  ],
  employment_two_years: [
    [
      "Increase career services support in the final year, such as job fairs and employer visits.",
      "Expand final-year career services, including job fairs and employer talks, to move graduates into work sooner.",
    ],
    [
      "Run job-readiness workshops (résumé, interview, application practice) before graduation.",
      "Offer pre-graduation workshops on résumés, interviews and job applications.",
    ],
    [
      "Keep in touch with graduates who are still looking for work and connect them with open positions.",
      "Follow up with job-seeking graduates and match them with employer openings from the alumni network.",
    ],
  ],
  field_related: [
    [
      "Review how closely the curriculum matches current industry requirements in the programs with lower results.",
      "Check the curriculum against current industry needs, starting with the programs that score lowest.",
    ],
    [
      "Make internships more relevant to each degree program so first jobs are more likely to be in the field.",
      "Align internship placements with each program's field to improve degree-related first jobs.",
    ],
    [
      "Give career advising on degree-related roles earlier, before the final year.",
      "Start career advising on roles related to the degree before the final year.",
    ],
  ],
  outside_field: [
    [
      "Review program-to-industry alignment each academic year, starting with the programs where alumni work outside their field.",
      "Check each year how well programs match the industries that hire their graduates.",
    ],
    [
      "Provide career guidance and mentoring from the first year so students know the roles their degree leads to.",
      "Introduce mentoring and career guidance early so students understand degree-related career paths.",
    ],
    [
      "Ask alumni who work outside their field why they chose their job (for example through the existing reason-for-job question) before changing programs.",
      "Look at the reasons outside-field alumni gave for accepting their job before deciding on curriculum changes.",
    ],
  ],
  entrepreneurship: [
    [
      "Offer entrepreneurship training and startup incubation to students in business programs.",
      "Provide startup incubation and entrepreneurship training for business-program students.",
    ],
    [
      "Connect students and alumni with mentors and seed-funding networks.",
      "Link student and alumni founders to mentors and funding sources.",
    ],
    [
      "Invite alumni who run businesses to share their experience in classes and events.",
      "Bring alumni entrepreneurs in as guest speakers and mentors.",
    ],
  ],
  supervisory: [
    [
      "Provide leadership development for early-career alumni, such as short courses through the alumni office.",
      "Offer leadership and management training for alumni who are early in their careers.",
    ],
    [
      "Pair alumni with senior mentors who can advise on career progression.",
      "Set up alumni mentoring with senior professionals to support career progression.",
    ],
    [
      "Track job positions over several survey cycles so progression into supervisory roles can be seen over time.",
      "Compare job positions across survey cycles to see how alumni move into supervisory roles.",
    ],
  ],
  grad_studies: [
    [
      "Promote postgraduate opportunities and advising to students in their final year.",
      "Advise final-year students on postgraduate options and entry requirements.",
    ],
    [
      "Offer information on scholarships and research assistantships for graduate study.",
      "Share scholarship and research-assistantship options with students considering graduate study.",
    ],
    [
      "Ask alumni who plan graduate study what support they need, and use the answers to plan programs.",
      "Find out what support alumni with postgraduate plans want and plan around it.",
    ],
  ],
};

const MET_ACTIONS = [
  "Maintain the current practices that support this KPI and keep monitoring it each survey cycle.",
  "Keep current practices in place and re-check this KPI after each survey cycle.",
];

const SET_TARGET = [
  "Set an institutional target for this KPI so progress can be judged. Until then the card reports the result only.",
  "Agree on a target for this KPI. Without one, this result cannot be called a success or a shortfall.",
];

const NOT_MEASURABLE_ACTIONS = {
  nu_grad_studies: [
    "Add a survey question that records the institution where an alumnus studies or plans to study. This needs a change to the survey configuration, which has not been made.",
    "Until the survey records the institution, keep this KPI as not measurable instead of estimating it from course names.",
  ],
  prof_org: [
    "Add a survey question asking whether the alumnus holds a position in a professional organization, and which one. This needs a change to the survey configuration, which has not been made.",
    "Do not use Leadership Skills self-ratings as a substitute. They measure something different from organization positions.",
  ],
};

// ----------------------------------------------------------------------------
// Observations: facts only, all read from the result object.
// ----------------------------------------------------------------------------

const buildObservations = (result) => {
  const out = [];
  const b = result.breakdown;

  out.push(
    `${result.n} of ${result.d} evaluable alumni qualify = ${pct(result.rawPct)} ` +
      `(${b.eligiblePopulation} eligible College alumni; ${b.notEvaluable} not evaluable for this KPI).`,
  );

  if (result.target !== null) {
    out.push(
      result.targetDir === "below"
        ? `Target: no more than ${result.target}%. Current value is ${pts(result.gap)} ${result.gap > 0 ? "above the ceiling" : "within the ceiling"}.`
        : `Target: ${result.target}%. Current value is ${pts(result.gap)} ${result.gap > 0 ? "below the target" : "above the target"}.`,
    );
  } else {
    out.push("No institutional target is set, so no goal gap can be stated.");
  }

  if (b.categories.length > 0 && CATEGORY_INTRO[result.id]) {
    out.push(
      `${CATEGORY_INTRO[result.id]}: ` +
        b.categories.map((c) => `${c.label} (${c.count})`).join(", ") + ".",
    );
  }

  if (result.id === "supervisory") {
    out.push(
      `${result.n} of ${result.d} employed alumni hold a job title that matches the documented supervisory rule.`,
    );
  }

  if (b.byProgram.length >= 2) {
    const ranked = [...b.byProgram].sort((x, y) => x.n / x.d - y.n / y.d || x.program.localeCompare(y.program));
    const shown = b.byProgram.length <= 6 ? b.byProgram : ranked.slice(0, 3);
    const largest = Math.max(...b.byProgram.map((p) => p.d));
    out.push(
      `By program${b.byProgram.length > 6 ? " (three lowest shown)" : ""}: ` +
        shown.map((p) => `${p.program} ${p.n} of ${p.d}`).join(", ") + "." +
        (largest < 10
          ? ` The largest program group has only ${largest} evaluable alumni, so read these as descriptions, not rankings.`
          : ""),
    );
  }

  if (b.notEvaluableReasons.length > 0) {
    out.push(
      "Not counted in this KPI: " +
        b.notEvaluableReasons
          .map((x) => `${REASON_TEXT[x.label] || x.label} (${x.count})`)
          .join("; ") + ".",
    );
  }

  if (result.note) out.push(result.note);

  if (result.d < 10) {
    out.push(
      `With only ${result.d} evaluable response${result.d === 1 ? "" : "s"}, one alumnus changes this value by ${pts(100 / result.d)}.`,
    );
  }
  return out;
};

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

export const severityFor = (gap) =>
  gap <= SEVERITY_BANDS.small ? "small" : gap <= SEVERITY_BANDS.moderate ? "moderate" : "severe";

export const buildKpiRecommendations = (result) => {
  if (!result) return null;
  const seed = `${result.id}|${result.n}|${result.d}|${result.target}`;
  const badge = BADGE[result.status] || BADGE.no_data;

  if (result.status === "not_measurable") {
    return {
      badge,
      severity: null,
      summary: `${result.label}: ${NOT_MEASURABLE_MESSAGE}. ${result.breakdown.reason}`,
      observations: [],
      recommendations: NOT_MEASURABLE_ACTIONS[result.id] || [],
    };
  }

  if (result.status === "no_data") {
    return {
      badge,
      severity: null,
      summary: `${result.label}: no evaluable responses yet, so no value can be calculated.`,
      observations: [
        `${result.breakdown.eligiblePopulation} eligible College alumni; none could be evaluated for this KPI.`,
      ],
      recommendations: ["Encourage alumni to complete the survey so this KPI can be calculated."],
    };
  }

  const observations = buildObservations(result);
  const pool = ACTIONS[result.id] || [];
  const actionText = (i) => pick(pool[i], seed, `action${i}`);

  if (result.status === "not_met") {
    const severity = severityFor(result.gap);
    const dirText = result.targetDir === "below" ? "ceiling" : "target";
    return {
      badge,
      severity,
      summary:
        `${result.label}: ${result.n} of ${result.d} = ${pct(result.rawPct)} against a ${dirText} of ${result.target}%. ` +
        pick(SEVERITY_PHRASE[severity], seed, "severity"),
      observations,
      recommendations: pool
        .slice(0, ACTIONS_BY_SEVERITY[severity])
        .map((_, i) => actionText(i)),
    };
  }

  if (result.status === "met") {
    return {
      badge,
      severity: null,
      summary: `${result.label}: ${result.n} of ${result.d} = ${pct(result.rawPct)}, which meets the ${result.targetDir === "below" ? "ceiling" : "target"} of ${result.target}%.`,
      observations,
      recommendations: [pick(MET_ACTIONS, seed, "met")],
    };
  }

  // no_target: report the result; offer areas to consider without claiming a shortfall.
  return {
    badge,
    severity: null,
    summary:
      `${result.label}: ${result.n} of ${result.d} = ${pct(result.rawPct)}. No target is set, so this is a result, not a shortfall. ` +
      "The points below are areas to consider.",
    observations,
    recommendations: [pick(SET_TARGET, seed, "settarget"), actionText(0), actionText(1)],
  };
};