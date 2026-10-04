// ============================================================================
// kpiFindings.js — What alumni actually answered behind each KPI
// ============================================================================
// A "finding" is a tally of real survey answers for the alumni a KPI is about,
// with the survey field it came from. Nothing here is estimated or inferred:
//   { id, title, source, base, of, items: [{ label, count }], avg? }
//     base = alumni in the group who answered the question
//     of   = alumni in the group
//
// This module is pure and imports nothing. kpiEngine.js passes in the helpers
// it needs (ctx) so there is no import cycle.
//
// Free-text fields (the "other_*" answers, written suggestions) are never
// quoted or interpreted here.
// ============================================================================

const toList = (v) =>
  (Array.isArray(v) ? v : [v])
    .map((x) => (typeof x === "string" ? x.trim() : null))
    .filter((x) => x);

const tally = (labels) => {
  const m = new Map();
  labels.forEach((x) => m.set(x, (m.get(x) || 0) + 1));
  return [...m.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

const isNotApplicable = (s) => s.toLowerCase() === "not applicable";

/** Written answers that are not real suggestions (compared case-insensitively). */
const NON_ANSWERS = new Set(["n/a", "na", "none", "no", "nothing", "-", "wala", "not applicable"]);

/**
 * @param {string} id   KPI id
 * @param {{ rows: Array, byRef: Map, employment: Function }} ctx
 *   rows: the KPI result rows ({ ref, outcome, reason })
 *   byRef: ref -> eligible alumnus entry (emp, job, skills, feedback ...)
 *   employment: classifyEmployment from kpiEngine
 */
export const buildFindings = (id, ctx) => {
  const { rows, byRef, employment } = ctx;
  const group = (...outcomes) =>
    rows
      .filter((r) => outcomes.includes(r.outcome))
      .map((r) => byRef.get(r.ref))
      .filter(Boolean);

  const make = (fid, title, source, people, getter) => {
    const answers = people.map(getter).filter((a) => a.length > 0);
    if (answers.length === 0) return null;
    return {
      id: fid,
      title,
      source,
      base: answers.length,
      of: people.length,
      items: tally(answers.flat()),
    };
  };

  const evaluable = group("qualifying", "non_qualifying");
  const out = [];
  const add = (f) => f && out.push(f);

  const firstJobFactors = () =>
    add(
      make(
        "first_job_factors",
        "What alumni said helped them get their first job",
        "job_experience_data.first_job_factors",
        evaluable,
        (p) => toList(p.job?.first_job_factors),
      ),
    );

  const timeToFind = () =>
    add(
      make(
        "time_to_find_job",
        "Time alumni took to find their first job",
        "job_experience_data.time_to_find_job",
        evaluable,
        (p) => toList(p.job?.time_to_find_job).filter((s) => !isNotApplicable(s)),
      ),
    );

  const usefulCompetencies = () =>
    add(
      make(
        "useful_competencies",
        "Skills alumni found most useful",
        "skills_competencies_data.useful_competencies",
        evaluable,
        (p) => toList(p.skills?.useful_competencies),
      ),
    );

  // Yes/No option (verified: stored values are "Yes" and "No").
  const recommend = () =>
    add(
      make(
        "recommend",
        "Alumni who would recommend the university",
        "feedback_university_data.recommend",
        evaluable,
        (p) => toList(p.feedback?.recommend),
      ),
    );

  // Free text (verified: many distinct answers, up to ~350 characters).
  // Only HOW MANY alumni wrote one is reported. The text is never read out.
  const writtenSuggestions = () => {
    const wrote = evaluable.filter((p) => {
      const t = toList(p.feedback?.suggestions)[0];
      return t && !NON_ANSWERS.has(t.toLowerCase());
    }).length;
    if (wrote === 0) return;
    out.push({
      id: "written_suggestions",
      title: "Alumni who wrote suggestions about the university",
      source: "feedback_university_data.suggestions",
      base: wrote,
      of: evaluable.length,
      items: [],
      countOnly: true,
    });
  };

  const satisfaction = () =>
    add(
      make(
        "satisfaction",
        "Satisfaction with the university",
        "feedback_university_data.satisfaction",
        evaluable,
        (p) => toList(p.feedback?.satisfaction),
      ),
    );

  switch (id) {
    case "internship_absorption":
      firstJobFactors();
      timeToFind();
      break;

    case "employment_two_years":
      add(
        make(
          "reasons_unemployed",
          "Reasons given by alumni who are not currently employed",
          "employment_information_data.reasons_unemployed",
          group("qualifying", "non_qualifying").filter((p) => employment(p.emp) === "unemployed"),
          (p) => toList(p.emp?.reasons_unemployed),
        ),
      );
      timeToFind();
      break;

    case "field_related":
    case "outside_field": {
      // The alumni who answered "No" to "Is your current job related to your degree?"
      const outsideRows = rows.filter((r) =>
        id === "outside_field" ? r.outcome === "qualifying" : r.outcome === "non_qualifying",
      );
      add(
        make(
          "reason_for_job_outside",
          "Reasons for accepting their job, given by alumni working outside their field",
          "employment_information_data.reason_for_job",
          outsideRows.map((r) => byRef.get(r.ref)).filter(Boolean),
          (p) => toList(p.emp?.reason_for_job),
        ),
      );
      usefulCompetencies();
      satisfaction();
      recommend();
      writtenSuggestions();
      break;
    }

    case "supervisory": {
      const rated = evaluable
        .map((p) => Number(p.skills?.skill_ratings?.["Leadership Skills"]))
        .filter((x) => Number.isFinite(x));
      if (rated.length > 0) {
        out.push({
          id: "leadership_rating",
          title: "Self-rating of Leadership Skills among employed alumni",
          source: "skills_competencies_data.skill_ratings",
          base: rated.length,
          of: evaluable.length,
          items: [],
          avg: rated.reduce((a, b) => a + b, 0) / rated.length,
        });
      }
      usefulCompetencies();
      break;
    }

    default:
      break; // entrepreneurship, grad_studies: no additional survey evidence available
  }
  return out;
};

/** One readable line for a finding, with its source field. */
export const describeFinding = (f) => {
  if (f.countOnly) {
    return `${f.title}: ${f.base} of ${f.of}. The comments are free text and are not shown or interpreted here. Source: ${f.source}.`;
  }
  if (f.avg !== undefined) {
    return `${f.title}: ${Math.round(f.avg * 10) / 10} on average (${f.base} of ${f.of} rated). Source: ${f.source}.`;
  }
  return (
    `${f.title} (${f.base} of ${f.of} answered): ` +
    f.items.map((i) => `${i.label} (${i.count})`).join(", ") +
    `. Source: ${f.source}.`
  );
};