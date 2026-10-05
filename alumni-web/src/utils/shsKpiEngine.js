// ============================================================================
// shsKpiEngine.js — the two Senior High KPIs, from one calculation
// ============================================================================
// Same idea as kpiEngine.js: ONE result object per card, used by the card and by
// the insights popup. Nothing here is estimated.
//
//   shs_pursued_undergrad     n = alumni who continued to an undergraduate
//                                 degree (at NU or at another school)
//   shs_pursued_undergrad_nu  n = alumni who continued at NU
//   d = alumni who answered the education questions needed for that KPI.
//
// Survey fields read (shs_educational_background_data):
//   pursued_nu_branch / pursued_further_studies_nu   "Yes" | "No"  (two survey versions)
//   pursued_other_school                              "Yes" | "No"
//   nu_branch / nuBranch                              NU campus chosen
//   status                                            study status
// and shs_feedback_and_engagement_data.satisfaction.
//
// How an alumnus is counted:
//   NU answer     other-school answer    -> undergrad KPI        NU KPI
//   Yes           (any)                     qualifies             qualifies
//   No            Yes                       qualifies             does not qualify
//   No            No                        does not qualify      does not qualify
//   No            (missing)                 cannot be judged      does not qualify
//   (missing)     Yes                       qualifies             cannot be judged
//   (missing)     No / missing              cannot be judged      cannot be judged
//
// The previous card counted only "pursued other school = Yes" for the first KPI,
// so alumni who continued at NU were left out of it. Both KPIs have no target
// until the institution sets one (the old 100% was a placeholder).
// ============================================================================

import { buildResult, tally, section, clean } from "./kpiEngine.js";

export const SHS_COHORT = "Senior High";

const yesNo = (v) => {
  const c = clean(v);
  if (typeof c !== "string") return null;
  const l = c.toLowerCase();
  return l === "yes" ? "yes" : l === "no" ? "no" : null;
};

/** What the alumnus said about continuing studies (both survey versions). */
export const readSchoolChoices = (edu) => ({
  nu: yesNo(clean(edu?.pursued_nu_branch) ?? clean(edu?.pursued_further_studies_nu)),
  other: yesNo(edu?.pursued_other_school),
  nuBranch: typeof clean(edu?.nu_branch ?? edu?.nuBranch) === "string" ? clean(edu?.nu_branch ?? edu?.nuBranch) : null,
});

const destinationOf = ({ nu, other }) =>
  nu === "yes" ? "Continued at NU"
  : other === "yes" ? "Continued at another school"
  : nu === "no" && other === "no" ? "Did not continue"
  : null;

/**
 * @param {Array} users       SHS alumni from users ({ id, program })
 * @param {Array} surveyRows  survey_progress rows
 */
export const buildShsDataset = (users, surveyRows) => {
  const byUser = new Map((surveyRows || []).map((r) => [r.user_id, r]));
  const eligible = (users || []).map((u, i) => {
    const survey = byUser.get(u.id);
    const edu = section(survey?.shs_educational_background_data);
    const choices = readSchoolChoices(edu);
    return {
      ref: `S${String(i + 1).padStart(2, "0")}`,
      program: clean(u.program) || "Program not given",
      edu,
      feedback: section(survey?.shs_feedback_and_engagement_data),
      choices,
      destination: destinationOf(choices),
    };
  });
  return { eligible };
};

const row = (p, outcome, reason) => ({ ref: p.ref, program: p.program, outcome, reason, detail: null });

const noAnswer = (p) =>
  p.choices.nu === null && p.choices.other === null ? "no_education_answer" : null;

// ---- findings: tallies of real answers for the alumni who can be judged -------

const findingFrom = (id, title, source, people, getter) => {
  const answers = people.map(getter).filter((a) => typeof a === "string" && a);
  if (answers.length === 0) return null;
  return { id, title, source, base: answers.length, of: people.length, items: tally(answers) };
};

const buildShsFindings = (rows, byRef) => {
  const evaluable = rows
    .filter((r) => r.outcome === "qualifying" || r.outcome === "non_qualifying")
    .map((r) => byRef.get(r.ref))
    .filter(Boolean);
  const continued = evaluable.filter((p) => p.destination && p.destination !== "Did not continue");
  return [
    findingFrom("destination", "What alumni did after Senior High", "shs_educational_background_data",
      evaluable, (p) => p.destination),
    findingFrom("nu_campus", "NU campus chosen by alumni who continued at NU", "shs_educational_background_data.nu_branch",
      evaluable.filter((p) => p.choices.nu === "yes"), (p) => p.choices.nuBranch),
    findingFrom("study_status", "Study status of alumni who continued", "shs_educational_background_data.status",
      continued, (p) => clean(p.edu?.status)),
    findingFrom("satisfaction", "Satisfaction with the school", "shs_feedback_and_engagement_data.satisfaction",
      evaluable, (p) => clean(p.feedback?.satisfaction)),
  ].filter(Boolean);
};

export const computeShsKpis = (dataset) => {
  const { eligible } = dataset;
  const E = eligible.length;
  const byRef = new Map(eligible.map((p) => [p.ref, p]));
  const out = {};

  const finish = (id, rows) => {
    const result = buildResult(id, { basis: "direct", eligibleCount: E }, rows);
    result.cohort = SHS_COHORT;
    result.findings = buildShsFindings(result.rows, byRef);
    out[id] = result;
  };

  finish("shs_pursued_undergrad", eligible.map((p) => {
    const { nu, other } = p.choices;
    if (nu === "yes" || other === "yes") return row(p, "qualifying");
    if (nu === "no" && other === "no") return row(p, "non_qualifying");
    return row(p, "not_evaluable", noAnswer(p) || "incomplete_education_answer");
  }));

  finish("shs_pursued_undergrad_nu", eligible.map((p) => {
    const { nu } = p.choices;
    if (nu === "yes") return row(p, "qualifying");
    if (nu === "no") return row(p, "non_qualifying");
    return row(p, "not_evaluable", noAnswer(p) || "nu_question_not_answered");
  }));

  return out;
};

/** Convenience: dataset + KPIs in one call. */
export const computeShsKpiResults = (users, surveyRows) => {
  const dataset = buildShsDataset(users, surveyRows);
  return { dataset, results: computeShsKpis(dataset) };
};