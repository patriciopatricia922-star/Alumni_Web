// ============================================================================
// kpiRecommendations.js — Facts, findings and suggested actions for the KPI modal
// ============================================================================
// Input : ONE KPI result object from kpiEngine.js (the same object the card
//         uses), plus an optional seed that only affects WHICH wording and
//         WHICH eligible suggestions are shown.
// Output: { badge, summary, observations[], recommendations[], severity }
//         recommendations[i] = { text, basis, general }
//
// Where each part comes from:
//  - Numbers, categories and findings: counted from alumni survey answers in
//    the result object. Nothing is invented, estimated, or taken from the
//    prediction model.
//  - A suggestion with a `basis` is shown ONLY because the survey answers
//    contain that evidence (the basis line quotes the count and the field).
//  - A suggestion with general: true is a standard practice. It is not derived
//    from the survey and is labelled that way.
//  - The seed never changes a number. This file uses no random number generator;
//    the caller supplies the seed (default: a hash of the result, so the same
//    data gives the same text).
//  - A shortfall is only claimed when the result's status is "not_met".
// ============================================================================

import { NOT_MEASURABLE_MESSAGE } from "./kpiEngine.js";
import { describeFinding, friendlySource } from "./kpiFindings.js";

/**
 * Severity bands, in percentage points of gap to the target.
 * These are configurable institutional thresholds, NOT facts about the data.
 */
export const SEVERITY_BANDS = { small: 10, moderate: 25 };

/** Number of suggested actions shown per severity. */
const ACTIONS_BY_SEVERITY = { small: 1, moderate: 2, severe: 3 };
const ACTIONS_WHEN_NO_TARGET = 2;

// ----------------------------------------------------------------------------
// Seeded helpers (deterministic for a given seed)
// ----------------------------------------------------------------------------

const hash = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h;
};

/** mulberry32: small seeded generator. Same seed -> same sequence. */
const makeRng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const shuffled = (arr, rng) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const oneOf = (arr, rng) => arr[Math.floor(rng() * arr.length)];

/** Which alumni group a result is about. College results carry no cohort field. */
const cohortOf = (result) => result.cohort || "College";

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
  no_education_answer: "no answer in the education section",
  incomplete_education_answer: "education answers incomplete (the NU or other-school question is missing)",
  nu_question_not_answered: "did not answer whether they continued at NU",
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
// Suggested actions
// ----------------------------------------------------------------------------
// Each action: { v: [wordings...], when?: (findings) => basisString | null }
//  - no `when`: a general practice (shown labelled "general practice").
//  - with `when`: eligible ONLY if the survey answers contain the evidence;
//    the returned string is the basis shown under the action.
// Add or edit actions here; nothing else needs to change.

const findingById = (findings, id) => (findings || []).find((f) => f.id === id) || null;

/** Basis string if any item of the finding matches `rx`, else null. */
const evidence = (findings, id, rx) => {
  const f = findingById(findings, id);
  if (!f) return null;
  const hits = f.items.filter((i) => rx.test(i.label));
  if (hits.length === 0) return null;
  return (
    hits.map((h) => `"${h.label}" (${h.count})`).join(", ") +
    ` among ${f.base} ${f.base === 1 ? "alumnus" : "alumni"} who answered (${friendlySource(f.source)}).`
  );
};

const ACTIONS = {
  // ---- Senior High -------------------------------------------------------------
  shs_pursued_undergrad: [
    {
      v: [
        "Follow up with alumni who did not continue to college and share enrolment, scholarship and bridging options with them.",
        "Reach out to alumni who did not continue their studies and connect them with scholarship and enrolment support.",
      ],
      when: (f) => evidence(f, "destination", /did not continue/i),
    },
    {
      v: [
        "Strengthen the SHS-to-college transition program, including help with applications and enrolment steps.",
        "Run a transition program in Grade 12 that walks students through college applications and enrolment.",
      ],
    },
    {
      v: [
        "Provide early college counseling for Grade 12 students, starting with each student's chosen strand.",
        "Start college counseling in the first term of Grade 12 so students have time to plan.",
      ],
    },
    {
      v: [
        "Invite graduates who are now in college to speak with current Grade 12 students about the move.",
        "Hold a yearly alumni talk where college students share what the transition was like.",
      ],
    },
  ],

  shs_pursued_undergrad_nu: [
    {
      v: [
        "Ask a sample of alumni who chose another school what led them there, and use the answers to improve what NU offers.",
        "Find out why some alumni continued at other schools, for example through a short follow-up survey, and share the results with admissions.",
      ],
      when: (f) => evidence(f, "destination", /another school/i),
    },
    {
      v: [
        "Offer an SHS-to-NU enrolment pathway, such as priority processing or early admission for NU Senior High graduates.",
        "Create enrolment incentives for NU Senior High graduates who apply to NU undergraduate programs.",
      ],
    },
    {
      v: [
        "Show current SHS students the NU undergraduate programs that match their strand.",
        "Hold program briefings for Grade 12 students on the NU undergraduate courses open to their strand.",
      ],
    },
    {
      v: [
        "Follow up with SHS alumni during the application period and help with the NU application steps.",
        "Send reminders and application help to graduating SHS students who are considering NU.",
      ],
    },
  ],

  internship_absorption: [
    {
      v: [
        "Strengthen partnerships with internship host companies and agree on clear paths from internship to hiring.",
        "Work with host companies to set internship-to-hire pathways, and follow up on how many interns are offered jobs.",
        "Formalise agreements with host companies so that good interns can be considered for permanent roles.",
      ],
      when: (f) => evidence(f, "first_job_factors", /internship|on-the-job/i),
    },
    {
      v: [
        "Record which host companies later hire interns and prioritise them in future placements.",
        "Keep a list of host companies that have absorbed interns and give them priority when assigning students.",
      ],
    },
    {
      v: [
        "Prepare students before the internship ends on how hiring decisions are made and how to express interest in staying.",
        "Brief interns near the end of their placement on how to ask about, and apply for, a permanent role.",
      ],
    },
    {
      v: [
        "Ask host companies why interns were or were not kept on, and use the answers to improve preparation.",
        "Collect short feedback from host supervisors at the end of each internship about retention decisions.",
      ],
    },
    {
      v: [
        "Time internship placements so that the end of the placement lines up with hiring periods.",
        "Schedule internships to finish close to host companies' hiring cycles where possible.",
      ],
    },
  ],

  employment_two_years: [
    {
      v: [
        "Strengthen links with employers in fields related to the programs, for example through targeted job fairs.",
        "Invite employers from each program's field to recruit on campus, since alumni report a lack of field-related openings.",
      ],
      when: (f) => evidence(f, "reasons_unemployed", /lack of job opportunities related/i),
    },
    {
      v: [
        "Run workshops and short projects that build work experience and the qualifications employers ask for.",
        "Offer skills-building sessions and portfolio projects before graduation to close the experience gap alumni describe.",
      ],
      when: (f) => evidence(f, "reasons_unemployed", /lack of work experience|qualifications required/i),
    },
    {
      v: [
        "Follow up with alumni who are waiting on hiring results and help them with next steps.",
        "Check in with alumni whose applications are still pending and connect them with other openings.",
      ],
      when: (f) => evidence(f, "reasons_unemployed", /waiting for job placement|hiring process/i),
    },
    {
      v: [
        "Offer job-matching and career-progression advice to alumni who are already working but looking for better opportunities.",
        "Share openings with alumni who are seeking better employment and offer career coaching.",
      ],
      when: (f) => evidence(f, "reasons_unemployed", /seeking better employment/i),
    },
    {
      v: [
        "Increase career services support in the final year, such as job fairs and employer visits.",
        "Run job-readiness workshops (résumé, interview, application practice) before graduation.",
      ],
    },
  ],

  field_related: [
    {
      v: [
        "Include information on pay and prospects for degree-related roles in career advising, since pay is a reason some alumni give for taking jobs outside their field.",
        "Show students typical pay and growth for degree-related roles, because some alumni outside the field cited salary and benefits.",
      ],
      when: (f) => evidence(f, "reason_for_job_outside", /salar|benefit/i),
    },
    {
      v: [
        "Build employer partnerships near where alumni live, since proximity of residence is a reason some give for taking jobs outside their field.",
        "Look for degree-related employers in the areas where alumni live, as some chose their job for proximity.",
      ],
      when: (f) => evidence(f, "reason_for_job_outside", /proximity/i),
    },
    {
      v: [
        "Check that the skills alumni rate most useful are well covered in coursework in the programs with lower results.",
        "Compare the skills alumni found most useful with what each program teaches.",
      ],
      when: (f) => evidence(f, "useful_competencies", /./),
    },
    {
      v: [
        "Review how closely the curriculum matches current industry requirements, starting with the programs that score lowest.",
        "Check the curriculum against current industry needs, starting with the programs that score lowest.",
      ],
    },
    {
      v: [
        "Make internships more relevant to each degree program so first jobs are more likely to be in the field.",
        "Align internship placements with each program's field.",
      ],
    },
    {
      v: [
        "Give career advising on degree-related roles earlier, before the final year.",
        "Start career advising on roles related to the degree before the final year.",
      ],
    },
  ],

  outside_field: [
    {
      v: [
        "Include information on pay and prospects for degree-related roles in career advising, since pay is a reason some alumni give for taking jobs outside their field.",
        "Show students typical pay and growth for degree-related roles, because some alumni outside the field cited salary and benefits.",
      ],
      when: (f) => evidence(f, "reason_for_job_outside", /salar|benefit/i),
    },
    {
      v: [
        "Build employer partnerships near where alumni live, since proximity of residence is a reason some give for taking jobs outside their field.",
        "Look for degree-related employers in the areas where alumni live, as some chose their job for proximity.",
      ],
      when: (f) => evidence(f, "reason_for_job_outside", /proximity/i),
    },
    {
      v: [
        "Review program-to-industry alignment each academic year, starting with the programs where alumni work outside their field.",
        "Check each year how well programs match the industries that hire their graduates.",
      ],
    },
    {
      v: [
        "Provide career guidance and mentoring from the first year so students know the roles their degree leads to.",
        "Introduce mentoring and career guidance early so students understand degree-related career paths.",
      ],
    },
    {
      v: [
        "Look at the reasons outside-field alumni gave for accepting their job before deciding on curriculum changes.",
        "Review the reason-for-job answers of outside-field alumni before changing programs.",
      ],
    },
  ],

  entrepreneurship: [
    {
      v: [
        "Offer entrepreneurship training and startup incubation to students in business programs.",
        "Provide startup incubation and entrepreneurship training for business-program students.",
      ],
    },
    {
      v: [
        "Connect students and alumni with mentors and seed-funding networks.",
        "Link student and alumni founders to mentors and funding sources.",
      ],
    },
    {
      v: [
        "Invite alumni who run businesses to share their experience in classes and events.",
        "Bring alumni entrepreneurs in as guest speakers and mentors.",
      ],
    },
    {
      v: [
        "Add a business-plan or venture project to the senior year of business programs.",
        "Include a capstone venture or business-plan requirement in business programs.",
      ],
    },
    {
      v: [
        "Confirm which programs should count toward this KPI, since only the configured business programs are included.",
        "Review the list of programs counted for entrepreneurship so the KPI reflects the intended population.",
      ],
    },
  ],

  supervisory: [
    {
      v: [
        "Provide leadership development for early-career alumni, such as short courses through the alumni office.",
        "Offer leadership and management training for alumni who are early in their careers.",
      ],
    },
    {
      v: [
        "Pair alumni with senior mentors who can advise on career progression.",
        "Set up alumni mentoring with senior professionals to support career progression.",
      ],
    },
    {
      v: [
        "Track job positions over several survey cycles so progression into supervisory roles can be seen over time.",
        "Compare job positions across survey cycles to see how alumni move into supervisory roles.",
      ],
    },
    {
      v: [
        "Review the supervisory title list in the KPI settings with the career office, since the KPI counts only titles on that list.",
        "Check the supervisory title list with the career office so the KPI reflects real supervisory roles.",
      ],
    },
    {
      v: [
        "Create leadership roles for students in organizations and projects so alumni have leadership experience early.",
        "Give students more chances to lead projects and organizations before graduation.",
      ],
    },
  ],

  grad_studies: [
    {
      v: [
        "Promote postgraduate opportunities and advising to students in their final year.",
        "Advise final-year students on postgraduate options and entry requirements.",
      ],
    },
    {
      v: [
        "Offer information on scholarships and research assistantships for graduate study.",
        "Share scholarship and research-assistantship options with students considering graduate study.",
      ],
    },
    {
      v: [
        "Ask alumni who plan graduate study what support they need, and use the answers to plan programs.",
        "Find out what support alumni with postgraduate plans want and plan around it.",
      ],
    },
    {
      v: [
        "Hold a graduate-school information session with alumni who are already studying.",
        "Invite alumni who are in graduate programs to speak with final-year students.",
      ],
    },
    {
      v: [
        "Add a survey question on enrolment so that plans can later be compared with actual enrolment. This needs a change to the survey configuration, which has not been made.",
        "Record enrolment in a later survey cycle, not only plans. This needs a change to the survey configuration, which has not been made.",
      ],
    },
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

/** Choose `count` actions: evidence-backed ones first, then general practices. */
const chooseActions = (id, findings, count, rng) => {
  const pool = ACTIONS[id] || [];
  const withBasis = pool
    .filter((a) => a.when)
    .map((a) => ({ a, basis: a.when(findings) }))
    .filter((x) => x.basis);
  const general = pool.filter((a) => !a.when).map((a) => ({ a, basis: null }));
  return [...shuffled(withBasis, rng), ...shuffled(general, rng)]
    .slice(0, count)
    .map(({ a, basis }) => ({
      text: oneOf(a.v, rng),
      basis,
      general: !basis,
    }));
};

// ----------------------------------------------------------------------------
// Small-group caution (plain language, no statistics terms)
// ----------------------------------------------------------------------------

/** Below this many alumni who can be judged, one alumnus visibly moves the result. */
export const SMALL_SAMPLE_LIMIT = 30;

/**
 * "Only 5 alumni can be judged, so one alumnus changes the result a lot. If one
 * answered differently, it would be 40% or 0% instead of 20%."
 * Null when the group is large enough or there is nothing to judge.
 */
export const smallSampleNote = (result) => {
  const { n, d } = result;
  if (!d || d >= SMALL_SAMPLE_LIMIT) return null;
  const share = (k) => `${Math.round((k / d) * 100)}%`;
  const options = [];
  if (n < d) options.push(share(n + 1));
  if (n > 0) options.push(share(n - 1));
  const head =
    d === 1
      ? "Only 1 alumnus can be judged, so this one answer decides the whole result."
      : `Only ${d} alumni can be judged, so one alumnus changes the result ${d <= 5 ? "a lot" : "noticeably"}.`;
  return `${head} If ${d === 1 ? "that alumnus" : "one"} answered differently, it would be ${options.join(" or ")} instead of ${share(n)}.`;
};

// ----------------------------------------------------------------------------
// Observations: facts only, all read from the result object.
// ----------------------------------------------------------------------------

const buildObservations = (result) => {
  const out = [];
  const b = result.breakdown;

  out.push(
    `${result.n} of ${result.d} evaluable alumni qualify = ${pct(result.rawPct)} ` +
      `(${b.eligiblePopulation} eligible ${cohortOf(result)} alumni; ${b.notEvaluable} not evaluable for this KPI).`,
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

  (result.findings || []).forEach((f) => out.push(describeFinding(f)));

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

  const caution = smallSampleNote(result);
  if (caution) out.push(caution);
  return out;
};

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

export const severityFor = (gap) =>
  gap <= SEVERITY_BANDS.small ? "small" : gap <= SEVERITY_BANDS.moderate ? "moderate" : "severe";

const plain = (texts) => texts.map((text) => ({ text, basis: null, general: false }));

/**
 * @param {object} result  one KPI result from kpiEngine.js
 * @param {{ seed?: number }} [opts]  seed only changes which eligible wording /
 *   suggestions are shown. Default: a hash of the result (same data, same text).
 */
export const buildKpiRecommendations = (result, opts = {}) => {
  if (!result) return null;
  const defaultSeed = hash(`${result.id}|${result.n}|${result.d}|${result.target}`);
  const rng = makeRng(opts.seed ?? defaultSeed);
  const badge = BADGE[result.status] || BADGE.no_data;

  if (result.status === "not_measurable") {
    return {
      badge,
      severity: null,
      summary: `${result.label}: ${NOT_MEASURABLE_MESSAGE}. ${result.breakdown.reason}`,
      observations: [],
      recommendations: plain(NOT_MEASURABLE_ACTIONS[result.id] || []),
    };
  }

  if (result.status === "no_data") {
    return {
      badge,
      severity: null,
      summary: `${result.label}: no evaluable responses yet, so no value can be calculated.`,
      observations: [
        `${result.breakdown.eligiblePopulation} eligible ${cohortOf(result)} alumni; none could be evaluated for this KPI.`,
      ],
      recommendations: plain(["Encourage alumni to complete the survey so this KPI can be calculated."]),
    };
  }

  const observations = buildObservations(result);

  if (result.status === "not_met") {
    const severity = severityFor(result.gap);
    const dirText = result.targetDir === "below" ? "ceiling" : "target";
    return {
      badge,
      severity,
      summary:
        `${result.label}: ${result.n} of ${result.d} = ${pct(result.rawPct)} against a ${dirText} of ${result.target}%. ` +
        oneOf(SEVERITY_PHRASE[severity], rng),
      observations,
      recommendations: chooseActions(result.id, result.findings, ACTIONS_BY_SEVERITY[severity], rng),
    };
  }

  if (result.status === "met") {
    return {
      badge,
      severity: null,
      summary: `${result.label}: ${result.n} of ${result.d} = ${pct(result.rawPct)}, which meets the ${result.targetDir === "below" ? "ceiling" : "target"} of ${result.target}%.`,
      observations,
      recommendations: plain([oneOf(MET_ACTIONS, rng)]),
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
    recommendations: [
      ...plain([oneOf(SET_TARGET, rng)]),
      ...chooseActions(result.id, result.findings, ACTIONS_WHEN_NO_TARGET, rng),
    ],
  };
};

// ----------------------------------------------------------------------------
// Insight view: the same facts as `observations`, grouped for the modal layout.
// Pure data. The modal only draws it; no number is computed in the component.
// ----------------------------------------------------------------------------

const MAX_ANSWER_ROWS = 6;
const MAX_PROGRAM_ROWS = 6;

const GAP_HINT = {
  small: "The gap is small.",
  moderate: "The gap is moderate.",
  severe: "The gap is large.",
};

const rankedBlock = (question, items, meta) => {
  const shown = items.slice(0, MAX_ANSWER_ROWS);
  const hidden = items.slice(MAX_ANSWER_ROWS);
  return {
    type: "ranked",
    question,
    items: shown,
    max: Math.max(...shown.map((i) => i.count)),
    more: hidden.length,
    meta,
  };
};

/**
 * @param {object} result  KPI result from kpiEngine.js
 * @param {object} rec     output of buildKpiRecommendations(result, { seed })
 * @returns {object|null}  null when there is no result (SHS cards)
 */
export const buildInsightView = (result, rec) => {
  if (!result || !rec) return null;
  const b = result.breakdown;
  const status = result.status;
  const measurable = status !== "not_measurable" && status !== "no_data";

  const view = {
    badge: rec.badge,
    tone: status === "not_met" ? "warn" : status === "met" ? "ok" : "neutral",
    hero: null,
    chips: [],
    message: null,
    included: null,
    answers: [],
    byProgram: null,
    caution: null,
    actionsHint: null,
    actions: rec.recommendations,
  };

  if (status === "not_measurable") {
    view.message = { title: NOT_MEASURABLE_MESSAGE, text: b.reason };
  } else if (status === "no_data") {
    view.message = {
      title: "No data yet",
      text: `${b.eligiblePopulation} eligible ${cohortOf(result)} alumni, but none could be evaluated for this KPI.`,
    };
  }

  if (measurable) {
    view.hero = { value: result.displayPct, n: result.n, d: result.d };
    if (result.target !== null) {
      view.chips.push({
        text: `Target: ${result.targetDir === "below" ? "no more than " : ""}${result.target}%`,
        tone: "neutral",
      });
      if (status === "not_met") {
        view.chips.push({
          text: result.targetDir === "below" ? `Above the ceiling by ${r1(result.gap)}%` : `Gap to target: ${r1(result.gap)}%`,
          tone: "warn",
        });
      }
    } else {
      view.chips.push({ text: "Set a target to measure the gap", tone: "neutral" });
    }

    view.included = {
      rows: [
        [`Eligible ${cohortOf(result)} alumni`, b.eligiblePopulation],
        ["Can be judged for this KPI", result.d],
        ["Qualifying", result.n],
        ["Not qualifying", result.d - result.n],
        ["Left out (cannot be judged)", b.notEvaluable],
      ],
      leftOut:
        b.notEvaluableReasons.length > 0
          ? "Left out because: " +
            b.notEvaluableReasons.map((x) => `${REASON_TEXT[x.label] || x.label} (${x.count})`).join("; ") + "."
          : null,
      note: result.note || null,
    };

    if (b.categories.length > 0 && CATEGORY_INTRO[result.id]) {
      const total = b.categories.reduce((s, c) => s + c.count, 0);
      view.answers.push(rankedBlock(CATEGORY_INTRO[result.id], b.categories, `${total} of ${result.d} alumni answered`));
    }

    (result.findings || []).forEach((f) => {
      const source = friendlySource(f.source);
      if (f.countOnly) {
        view.answers.push({
          type: "stat",
          question: f.title,
          value: `${f.base} of ${f.of}`,
          meta: source,
          note: "The comments are free text and are not shown or interpreted here.",
        });
      } else if (f.avg !== undefined) {
        view.answers.push({
          type: "stat",
          question: f.title,
          value: `${r1(f.avg)} on average`,
          meta: `${f.base} of ${f.of} rated · ${source}`,
          note: null,
        });
      } else if (f.items.length > 0) {
        view.answers.push(rankedBlock(f.title, f.items, `${f.base} of ${f.of} answered · ${source}`));
      }
    });

    if (b.byProgram.length >= 2) {
      const ranked = [...b.byProgram].sort((x, y) => x.n / x.d - y.n / y.d || x.program.localeCompare(y.program));
      const many = b.byProgram.length > MAX_PROGRAM_ROWS;
      const shown = many ? ranked.slice(0, 3) : b.byProgram;
      const largest = Math.max(...b.byProgram.map((p) => p.d));
      view.byProgram = {
        title: many ? "By program (three lowest shown)" : "By program",
        rows: shown.map((p) => [p.program, `${p.n} of ${p.d}`]),
        note: largest < 10 ? "Each program group is small, so read these as descriptions, not rankings." : null,
      };
    }

    view.caution = smallSampleNote(result);
  }

  if (status === "no_target") view.actionsHint = "Areas to consider. No target is set, so this is not a shortfall.";
  else if (status === "not_met") view.actionsHint = GAP_HINT[rec.severity] || null;

  return view;
};