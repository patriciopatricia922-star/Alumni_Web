// ============================================================================
// AdminDashboard — Logic Controller
// ============================================================================

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AdminDashboardView from "./views/AdminDashboardview";
import {
  computeCollegeKpiResults,
  toCardProps,
} from "../../utils/kpiEngine";
import { formatValidationReport } from "../../utils/kpiValidation";
import { useAlumniType } from "./contexts/AlumniTypeContext";
import { isSHSProgram, isCollegeProgram } from "../utils/alumniUtils";

// ============================================================================
// SATISFACTION SCORE MAPPING
// Shared by both College and SHS satisfaction computation.
// ============================================================================
const SATISFACTION_SCORE = {
  "Very Satisfied": 5,
  "Very satisfied": 5,
  Satisfied: 4,
  Neutral: 3,
  Dissatisfied: 2,
  "Very Dissatisfied": 1,
  "Very dissatisfied": 1,
};

// ============================================================================
// EMPLOYMENT STATUS MAPPING
// ============================================================================
const STATUS_MAPPING = {
  "Regular / Permanent": "Employed",
  Probationary: "Employed",
  Regular: "Employed",
  Permanent: "Employed",
  "Full-time": "Employed",
  "Part-time": "Employed",
  "Regular/Full-time": "Employed",
  "Part-time/Full-time": "Employed",
  Unemployed: "Unemployed",
  "Not employed": "Unemployed",
  "Looking for work": "Unemployed",
  "Unemployed, but looking for work": "Unemployed",
  "Unemployed, but not looking for work": "Unemployed",
  "Self-employed": "Self-Employed",
  "Self-Employed": "Self-Employed",
  "Business owner": "Self-Employed",
  Freelance: "Freelance",
  Student: "Student",
  Studying: "Student",
  Contractual: "Contractual",
  "Contract based": "Contractual",
};

// ============================================================================
// UNEMPLOYED STATUSES
// ============================================================================
const UNEMPLOYED_STATUSES = new Set([
  "Unemployed",
  "Unemployed, but looking for work",
  "Unemployed, but not looking for work",
  "Not employed",
  "Looking for work",
]);

// ============================================================================
// SKILL CATEGORY MATCHERS
// "Most In-Demand Skills" is derived from survey_progress.skills_competencies_data
// .useful_competencies, which only ever contains the five canonical competency
// categories below — but the exact string stored per alumnus can drift (e.g.
// "Work Ethics/Professionalism Skills" vs "Work Ethics/Professionalism",
// trailing "Skills" suffixes, spacing/punctuation differences around "&"/"/").
// normalizeSkillCategory collapses any such variant to one canonical label so
// the same competency is never double-counted as two categories, and
// legitimate values are never dropped just because the stored string doesn't
// match a label exactly.
// ============================================================================
const SKILL_CATEGORY_MATCHERS = [
  { label: "Communication Skills", test: (n) => n.includes("communication") },
  {
    label: "Information & Technology Skills",
    test: (n) => n.includes("information") && n.includes("technology"),
  },
  { label: "Leadership Skills", test: (n) => n.includes("leadership") },
  {
    label: "Critical & Problem-Solving Skills",
    test: (n) =>
      n.includes("critical") && (n.includes("problem") || n.includes("solving")),
  },
  {
    label: "Work Ethics / Professionalism",
    test: (n) =>
      n.includes("work") && (n.includes("ethic") || n.includes("professionalism")),
  },
];

// ============================================================================
// normalizeSkillCategory — maps a raw useful_competencies string to its
// canonical category label, or null if it doesn't match any known category.
// ============================================================================
const normalizeSkillCategory = (rawLabel) => {
  if (!rawLabel || typeof rawLabel !== "string") return null;
  const normalized = rawLabel.toLowerCase().replace(/[^a-z]/g, "");
  const match = SKILL_CATEGORY_MATCHERS.find((c) => c.test(normalized));
  return match ? match.label : null;
};

// ============================================================================
// safeParse — avoids try/catch repetition throughout
// ============================================================================
const safeParse = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// ============================================================================
// computeSatisfaction
// Generic helper — accepts an array of raw JSONB values (already fetched) and
// the field name that holds the satisfaction string inside each parsed object.
//
// Used by both College (feedback_university_data → parsed.satisfaction) and
// SHS (shs_feedback_and_engagement_data → parsed.satisfaction).
// Returns { avg: string|'N/A', count: number }.
// ============================================================================
const computeSatisfaction = (rows, dataField, innerField = "satisfaction") => {
  const scores = rows
    .filter((r) => r[dataField] !== null && r[dataField] !== undefined)
    .map((r) => {
      const parsed = safeParse(r[dataField]);
      return SATISFACTION_SCORE[parsed?.[innerField]] || null;
    })
    .filter(Boolean);

  if (scores.length === 0) return { avg: "N/A", count: 0 };
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { avg: avg.toFixed(1), count: scores.length };
};

// ============================================================================
// computeSurveyRate
// Generic helper — given the total count for a cohort and the number of
// completed rows that belong to that cohort, returns a formatted percentage.
// ============================================================================
const computeSurveyRate = (completedCount, totalCount) => {
  if (totalCount === 0) return "0%";
  return `${Math.round((completedCount / totalCount) * 100)}%`;
};

// ============================================================================
// INSTITUTIONAL KPIs STRUCTURE — 9 KPIs across 3 tabs + SHS tab
// ============================================================================
const institutionalKpis = {
  employment: [
    {
      id: "internship_absorption",
      category: "Career Services",
      label: "Absorption from Internship",
      value: "0%",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "employment_two_years",
      category: "Employment",
      label: "Employed Within 2 Yrs of Graduation",
      value: "0%",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "field_related",
      category: "Employment",
      label: "Employed in Field / Related Field",
      value: "0%",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      trend: { dir: "none", delta: "" },
    },
  ],
  career: [
    {
      id: "outside_field",
      category: "Career",
      label: "Employed Outside Field of Specialization",
      value: "0%",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      targetDir: "below",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "entrepreneurship",
      category: "Career",
      label: "Engaged in Entrepreneurship",
      value: "0%",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "supervisory",
      category: "Career",
      label: "Occupying Supervisory Positions",
      value: "0%",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      trend: { dir: "none", delta: "" },
    },
  ],
  education: [
    {
      id: "grad_studies",
      category: "Education",
      label: "Pursued Graduate Studies (within 1 yr)",
      value: "0%",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "nu_grad_studies",
      category: "Education",
      label: "Pursued Graduate Studies at NU",
      value: "0%",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "prof_org",
      category: "Leadership",
      label: "In Positions in Professional Organizations",
      value: "0",
      progress: 0,
      target: 0,
      targetLabel: "No target set",
      isCount: true,
      trend: { dir: "none", delta: "" },
    },
  ],
  seniorrhigh: [
    {
      id: "shs_pursued_undergrad",
      category: "Senior High",
      label: "SHS Alumni Who Pursued Undergraduate Degree",
      value: "0%",
      progress: 0,
      target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "shs_pursued_undergrad_nu",
      category: "Senior High",
      label: "SHS Alumni Who Pursued Undergraduate at NU",
      value: "0%",
      progress: 0,
      target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
  ],
};

// ============================================================================
// Prediction year constants — mirror train_model.py BASE_YEAR / END_YEAR.
// ============================================================================
const PREDICTION_BASE_YEAR = 2025;
const PREDICTION_END_YEAR = 2030;

// ============================================================================
// buildCareerAlignmentData
// ============================================================================
const buildCareerAlignmentData = (predictions) => {
  if (!predictions || predictions.length === 0) return [];

  const byProgram = {};
  predictions.forEach((row) => {
    if (!byProgram[row.program]) byProgram[row.program] = [];
    byProgram[row.program].push(row);
  });

  return Object.entries(byProgram).map(([program, rows]) => {
    const sorted = [...rows].sort((a, b) => Number(a.year) - Number(b.year));

    const baseRow = sorted[0];
    const actual = Math.round(
      baseRow.current_rate ?? baseRow.predicted_rate ?? 0,
    );

    const endRow = sorted[sorted.length - 1];
    const predicted = Math.round(endRow.predicted_rate ?? 0);

    const respondents = sorted.length;

    return { program, predicted, actual, respondents };
  });
};

// ============================================================================
// AdminDashboard Component
// ============================================================================
const AdminDashboard = () => {
  const { alumniType } = useAlumniType();

  // ── Tab ──────────────────────────────────────────────────────────────────
  const [activeKpiTab, setActiveKpiTab] = useState("employment");

  // ── College Alumni stat cards ─────────────────────────────────────────────
  const [alumniCount, setAlumniCount] = useState("—");
  const [alumniSubText, setAlumniSubText] = useState("loading...");
  const [surveyCompletionRate, setSurveyCompletionRate] = useState("—");
  const [surveySubText, setSurveySubText] = useState("loading...");
  const [employmentRate, setEmploymentRate] = useState("—");
  const [employmentRateSub, setEmploymentRateSub] = useState("loading...");
  const [alumniSatisfaction, setAlumniSatisfaction] = useState("—");
  const [satisfactionSub, setSatisfactionSub] = useState("based on feedback");

  // ── SHS Alumni stat cards ─────────────────────────────────────────────────
  // Each mirrors the equivalent College state above, prefixed with "shs".
  const [shsAlumniCount, setShsAlumniCount] = useState("—");
  const [shsAlumniSubText, setShsAlumniSubText] = useState("loading...");
  const [shsSurveyCompletionRate, setShsSurveyCompletionRate] = useState("—");
  const [shsSurveySubText, setShsSurveySubText] = useState("loading...");
  const [shsRetentionRate, setShsRetentionRate] = useState("—");
  const [shsRetentionSub, setShsRetentionSub] = useState("loading...");
  const [shsAlumniSatisfaction, setShsAlumniSatisfaction] = useState("—");
  const [shsSatisfactionSub, setShsSatisfactionSub] =
    useState("based on feedback");

  // ── Institutional KPI grid ────────────────────────────────────────────────
  const [kpiData, setKpiData] = useState(institutionalKpis);

  // ── College chart data ────────────────────────────────────────────────────
  const [employmentAlignmentData, setEmploymentAlignmentData] = useState([]);
  const [employmentStatusData, setEmploymentStatusData] = useState([]);
  const [inDemandSkillsData, setInDemandSkillsData] = useState([]);
  const [careerAlignmentData, setCareerAlignmentData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  // ── SHS chart data ────────────────────────────────────────────────────────
  const [shsPostGradPathData, setShsPostGradPathData] = useState([]);
  const [shsContinuedStudiesData, setShsContinuedStudiesData] = useState([]);

  // ── Dynamic KPI insights ──────────────────────────────────────────────────

  // ==========================================================================
  // KPI DATA FETCHING
  // Fetches all alumni, then partitions into College / SHS sets so both
  // stat cards and survey rows can be independently computed in one pass.
  // ==========================================================================
  useEffect(() => {
    const fetchStats = async () => {
      // ── 1. Fetch all alumni users with their program column ───────────────
      // We need the program field to partition College vs SHS.
      const { data: allAlumni, error: alumniErr } = await supabase
        .from("users")
        .select("id, program, created_at")
        .eq("role", "alumni");

      if (alumniErr) {
        console.error("Alumni fetch error:", alumniErr.message);
        return;
      }

      const alumniRows = allAlumni ?? [];

      // Partition by program prefix — single source of truth for categorisation.
      const collegeAlumni = alumniRows.filter((u) =>
        isCollegeProgram(u.program),
      );
      const shsAlumni = alumniRows.filter((u) => isSHSProgram(u.program));

      const collegeIds = new Set(collegeAlumni.map((u) => u.id));
      const shsIds = new Set(shsAlumni.map((u) => u.id));

      // ── 2. Registered alumni counts ───────────────────────────────────────
      setAlumniCount(String(collegeAlumni.length));
      setShsAlumniCount(String(shsAlumni.length));

      // ── 3. New alumni this month ──────────────────────────────────────────
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      const newCollegeThisMonth = collegeAlumni.filter(
        (u) => new Date(u.created_at) >= startOfMonth,
      ).length;
      const newShsThisMonth = shsAlumni.filter(
        (u) => new Date(u.created_at) >= startOfMonth,
      ).length;

      setAlumniSubText(`+${newCollegeThisMonth} new this month`);
      setShsAlumniSubText(`+${newShsThisMonth} new this month`);

      // ── 4. Survey rows — fetch once, partition in memory ─────────────────
      // Selecting every column needed across College and SHS avoids a second
      // round-trip.  The shs_* columns are null for College respondents and
      // vice-versa, so there is no bleed between cohorts.
      const { data: allSurveyRows, error: surveyFetchErr } = await supabase
        .from("survey_progress")
        .select(
          "user_id, completed, last_updated, completed_at, " +
            // College columns
            "employment_information_data, educational_background_data, " +
            "alumni_engagement_data, job_experience_data, " +
            "feedback_university_data, skills_competencies_data, " +
            // SHS columns
            "shs_feedback_and_engagement_data, shs_educational_background_data, " +
            "shs_employment_information_data, shs_job_experience_data, " +
            "shs_skills_and_competencies_data",
        );

      if (surveyFetchErr) {
        console.error("Survey fetch error:", surveyFetchErr.message);
        return;
      }

      const allRows = allSurveyRows ?? [];

      // Partition survey rows by cohort using the user ID sets built above.
      const collegeSurveyRows = allRows.filter((r) =>
        collegeIds.has(r.user_id),
      );
      const shsSurveyRows = allRows.filter((r) => shsIds.has(r.user_id));

      // ── 5. Survey completion rates ────────────────────────────────────────
      const collegeCompleted = collegeSurveyRows.filter(
        (r) => r.completed,
      ).length;
      const shsCompleted = shsSurveyRows.filter((r) => r.completed).length;

      setSurveyCompletionRate(
        computeSurveyRate(collegeCompleted, collegeAlumni.length),
      );
      setShsSurveyCompletionRate(
        computeSurveyRate(shsCompleted, shsAlumni.length),
      );

      // Month-over-month delta for College (preserves existing behaviour).
      const collegeCompletedThisMonth = collegeSurveyRows.filter(
        (r) => r.completed && new Date(r.last_updated) >= startOfMonth,
      ).length;
      const collegeCompletedLastMonth = collegeSurveyRows.filter(
        (r) =>
          r.completed &&
          new Date(r.last_updated) >= startOfLastMonth &&
          new Date(r.last_updated) < startOfMonth,
      ).length;

      if (collegeCompletedLastMonth === 0) {
        setSurveySubText(
          collegeCompletedThisMonth > 0
            ? `+${collegeCompletedThisMonth} completed this month`
            : "No completions yet",
        );
      } else {
        const diff = collegeCompletedThisMonth - collegeCompletedLastMonth;
        setSurveySubText(`${diff >= 0 ? "+" : ""}${diff} last month`);
      }

      // Same delta logic for SHS.
      const shsCompletedThisMonth = shsSurveyRows.filter(
        (r) => r.completed && new Date(r.last_updated) >= startOfMonth,
      ).length;
      const shsCompletedLastMonth = shsSurveyRows.filter(
        (r) =>
          r.completed &&
          new Date(r.last_updated) >= startOfLastMonth &&
          new Date(r.last_updated) < startOfMonth,
      ).length;

      if (shsCompletedLastMonth === 0) {
        setShsSurveySubText(
          shsCompletedThisMonth > 0
            ? `+${shsCompletedThisMonth} completed this month`
            : "No completions yet",
        );
      } else {
        const diff = shsCompletedThisMonth - shsCompletedLastMonth;
        setShsSurveySubText(`${diff >= 0 ? "+" : ""}${diff} last month`);
      }

      // ── 6. Satisfaction scores ────────────────────────────────────────────
      // College — same field as before (feedback_university_data).
      const collegeSat = computeSatisfaction(
        collegeSurveyRows,
        "feedback_university_data",
        "satisfaction",
      );
      if (collegeSat.count > 0) {
        setAlumniSatisfaction(collegeSat.avg);
        setSatisfactionSub(
          `Based on ${collegeSat.count} response${collegeSat.count !== 1 ? "s" : ""}`,
        );
      } else {
        setAlumniSatisfaction("N/A");
        setSatisfactionSub("No feedback yet");
      }

      // SHS — uses shs_feedback_and_engagement_data with the same inner field.
      const shsSat = computeSatisfaction(
        shsSurveyRows,
        "shs_feedback_and_engagement_data",
        "satisfaction",
      );
      if (shsSat.count > 0) {
        setShsAlumniSatisfaction(shsSat.avg);
        setShsSatisfactionSub(
          `Based on ${shsSat.count} response${shsSat.count !== 1 ? "s" : ""}`,
        );
      } else {
        setShsAlumniSatisfaction("N/A");
        setShsSatisfactionSub("No feedback yet");
      }

      // ── 7. SHS Retention Rate ─────────────────────────────────────────────
      // "Retention" for SHS = alumni whose shs_educational_background_data
      // indicates they continued studying (pursued undergraduate degree) at any
      // institution.  This mirrors the College employment-rate pattern: filter
      // to rows that have the relevant data, then compute the percentage.
      const shsWithEduData = shsSurveyRows.filter(
        (r) => r.shs_educational_background_data !== null,
      );
      const shsRetained = shsWithEduData.filter((r) => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return false;
        return edu.status === "Currently Studying";
      }).length;

      if (shsWithEduData.length > 0) {
        const retPct = Math.round((shsRetained / shsWithEduData.length) * 100);
        setShsRetentionRate(`${retPct}%`);
        setShsRetentionSub(
          `${shsRetained} of ${shsWithEduData.length} continued studies`,
        );
      } else {
        setShsRetentionRate("N/A");
        setShsRetentionSub("No education data yet");
      }

      // ── 8. SHS Post-Graduation Path chart data ────────────────────────────
      // Aggregates what SHS alumni did after graduation into labelled buckets
      // for the pie/bar chart in the SHS section.
      const postGradCounts = {};
      shsSurveyRows.forEach((r) => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return;

        // shs_educational_background_data has two schema versions in
        // production:
        //  - older submissions: pursued_nu_branch / nu_branch / school_name
        //  - newer submissions: pursued_further_studies_nu / other_school_name
        // pursued_other_school ("Yes"/"No") is present in both versions, so
        // it's used as the gate for the "Other School" bucket instead of
        // relying on a single NU-branch key name that isn't present in
        // every submission.
        const pursuedNu =
          edu.pursued_nu_branch ?? edu.pursued_further_studies_nu;

        let bucket = "";
        if (pursuedNu === "Yes") {
          bucket = (edu.nu_branch || edu.nuBranch || "").trim();
        } else if (edu.pursued_other_school === "Yes") {
          bucket = (edu.school_name || edu.other_school_name || "").trim();
        }

        if (!bucket) return;
        postGradCounts[bucket] = (postGradCounts[bucket] || 0) + 1;
      });

      const postGradChartData = Object.entries(postGradCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setShsPostGradPathData(postGradChartData);

      // ── 9. SHS Continued Studies chart data ──────────────────────────────
      // Buckets: "NU" vs "Other Institution" vs "Did Not Continue".
      let shsContinuedAtNu = 0;
      let shsContinuedElsewhere = 0;
      let shsDidNotContinue = 0;

      shsSurveyRows.forEach((r) => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return;

        if (edu.pursued_nu_branch === "Yes") {
          shsContinuedAtNu++;
        } else if (
          edu.pursued_nu_branch === "No" &&
          edu.pursued_other_school === "Yes"
        ) {
          shsContinuedElsewhere++;
        } else {
          shsDidNotContinue++;
        }
      });

      const continuedStudiesChartData = [
        { name: "Continued at NU", value: shsContinuedAtNu },
        { name: "Continued Elsewhere", value: shsContinuedElsewhere },
        { name: "Did Not Continue", value: shsDidNotContinue },
      ].filter((d) => d.value > 0);

      setShsContinuedStudiesData(continuedStudiesChartData);

      // ── 10. All 9 College Institutional KPIs ─────────────────────────────
      // One calculation (utils/kpiEngine.js) feeds both the KPI cards and the
      // KPI modal. Eligibility, n, d, raw % and display % are all decided
      // there; nothing below recalculates a KPI.
      const { dataset: kpiDataset, results: kpiResults } =
        computeCollegeKpiResults(collegeAlumni, collegeSurveyRows);

      if (import.meta.env.DEV) {
        // Development-only validation log (anonymised row refs, no PII).
        console.log(
          "[KPI validation]\n" + formatValidationReport(kpiDataset, kpiResults),
        );
      }

      // Employment Rate stat card (not one of the 9 KPIs) keeps its own logic.
      const parsedCollege = collegeSurveyRows.map((row) => ({
        emp: safeParse(row.employment_information_data),
      }));

      const isEmployedHelper = (emp) => {
        if (!emp) return false;
        const status =
          emp.employment_status ||
          emp.employmentStatus ||
          emp.current_employment_status ||
          "";
        if (!status) return !!(emp.job_position || emp.company_name);
        return !UNEMPLOYED_STATUSES.has(status);
      };

      const withEmpData = parsedCollege.filter((r) => r.emp !== null);

      // ── College Employment Rate stat card ─────────────────────────────────
      const employedStatCount = withEmpData.filter((r) =>
        isEmployedHelper(r.emp),
      ).length;
      if (withEmpData.length > 0) {
        const empRatePct = Math.round(
          (employedStatCount / withEmpData.length) * 100,
        );
        setEmploymentRate(`${empRatePct}%`);
        setEmploymentRateSub(
          `Based on ${withEmpData.length} response${withEmpData.length !== 1 ? "s" : ""}`,
        );
      } else {
        setEmploymentRate("N/A");
        setEmploymentRateSub("No employment data yet");
      }

      // ── SHS Institutional KPI tab values ──────────────────────────────────
      // Reads from shs_educational_background_data, reusing the same helpers.
      const shsWithEduRows = shsSurveyRows.filter(
        (r) => r.shs_educational_background_data !== null,
      );

      const shsPursuedUndergrad = shsWithEduRows.filter((r) => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return false;
        return edu.pursued_other_school === "Yes";
      }).length;
      const shsPursuedUndergradPct =
        shsWithEduRows.length > 0
          ? Math.round((shsPursuedUndergrad / shsWithEduRows.length) * 100)
          : 0;

      const shsPursuedUndergradNu = shsWithEduRows.filter((r) => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return false;
        return edu.pursued_nu_branch === "Yes";
      }).length;
      const shsPursuedUndergradNuPct =
        shsWithEduRows.length > 0
          ? Math.round((shsPursuedUndergradNu / shsWithEduRows.length) * 100)
          : 0;
      // ── Apply computed KPIs to state ──────────────────────────────────────
      const fromResults = (kpi) =>
        kpiResults[kpi.id] ? { ...kpi, ...toCardProps(kpiResults[kpi.id]) } : kpi;

      setKpiData({
        employment: institutionalKpis.employment.map(fromResults),
        career: institutionalKpis.career.map(fromResults),
        education: institutionalKpis.education.map(fromResults),

        seniorrhigh: institutionalKpis.seniorrhigh.map((kpi) => {
          switch (kpi.id) {
            case "shs_pursued_undergrad":
              return {
                ...kpi,
                value: `${shsPursuedUndergradPct}%`,
                progress: shsPursuedUndergradPct,
                targetLabel: `Goal: 100% (${shsPursuedUndergrad} of ${shsWithEduRows.length})`,
              };
            case "shs_pursued_undergrad_nu":
              return {
                ...kpi,
                value: `${shsPursuedUndergradNuPct}%`,
                progress: shsPursuedUndergradNuPct,
                targetLabel: `Goal: 100% (${shsPursuedUndergradNu} of ${shsWithEduRows.length})`,
              };
            default:
              return kpi;
          }
        }),
      });
    };

    fetchStats();
  }, []);

  // ==========================================================================
  // CHART DATA FETCHING
  // College charts are unchanged. SHS charts (Post-Grad Path, Continued
  // Studies) are populated in fetchStats above since they share the same
  // survey_progress query.
  // ==========================================================================
  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingCharts(true);

      try {
        // ── 1. Predictions — Employment Alignment (College only) ──────────
        const { data: predictions, error: predError } = await supabase
          .from("predictions")
          .select("*")
          .order("year", { ascending: true });

        if (!predError && predictions && predictions.length > 0) {
          const programs = [...new Set(predictions.map((p) => p.program))];
          const latestYear = Math.max(...predictions.map((p) => p.year));

          const alignmentByProgram = programs
            .map((program) => {
              const programPredictions = predictions.filter(
                (p) => p.program === program,
              );
              const latest = programPredictions.find(
                (p) => p.year === latestYear,
              );
              return { name: program, alignment: latest?.predicted_rate || 0 };
            })
            .sort((a, b) => b.alignment - a.alignment);
          setEmploymentAlignmentData(alignmentByProgram.slice(0, 6));

          setCareerAlignmentData(
            buildCareerAlignmentData(predictions).slice(0, 10),
          );
        } else if (predError) {
          console.error("Predictions fetch error:", predError.message);
        }

        // ── 2. Employment Status distribution (College only) ──────────────
        const { data: surveyData } = await supabase
          .from("survey_progress")
          .select(
            "user_id, employment_information_data, skills_competencies_data",
          );

        // Fetch user programs once more to filter to College rows only.
        // (Avoids a join — the users query above is already out of scope here.)
        const { data: userPrograms } = await supabase
          .from("users")
          .select("id, program")
          .eq("role", "alumni");

        const collegeUserIds = new Set(
          (userPrograms ?? [])
            .filter((u) => isCollegeProgram(u.program))
            .map((u) => u.id),
        );

        const employmentStatuses = {
          Employed: 0,
          Unemployed: 0,
          "Self-Employed": 0,
          Student: 0,
          Contractual: 0,
        };

        surveyData?.forEach((row) => {
          // Skip SHS alumni so their data doesn't inflate the College chart.
          if (!collegeUserIds.has(row.user_id)) return;

          const parsed = safeParse(row.employment_information_data);
          if (!parsed) return;
          const status =
            parsed.employment_status ||
            parsed.current_employment_status ||
            parsed.employmentStatus ||
            "";
          if (status) {
            const mapped = STATUS_MAPPING[status];
            if (mapped) {
              employmentStatuses[mapped]++;
            } else if (
              status.toLowerCase().includes("regular") ||
              status.toLowerCase().includes("permanent")
            ) {
              employmentStatuses.Employed++;
            } else if (status.toLowerCase().includes("self")) {
              employmentStatuses["Self-Employed"]++;
            } else if (status.toLowerCase().includes("student")) {
              employmentStatuses.Student++;
            } else if (parsed.company_name || parsed.job_position) {
              employmentStatuses.Employed++;
            }
          } else if (parsed.company_name || parsed.job_position) {
            employmentStatuses.Employed++;
          }
        });

        setEmploymentStatusData(
          Object.entries(employmentStatuses)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ name, value })),
        );

        // ── 3. In-Demand Skills ────────────────────────────────────────────
        // Source: survey_progress.skills_competencies_data.useful_competencies
        // for College alumni. Counts how frequently each of the five canonical
        // competency categories is reported as a "useful competency" across
        // College alumni survey responses, collapsing naming variants of the
        // same category via normalizeSkillCategory. If no alumnus has recorded
        // useful_competencies yet, skillCount stays empty and the chart renders
        // its existing empty state.
        const skillCount = {};

        surveyData?.forEach((row) => {
          if (!collegeUserIds.has(row.user_id)) return;
          const skillsParsed = safeParse(row.skills_competencies_data);
          if (!skillsParsed) return;
          const usefulCompetencies = Array.isArray(
            skillsParsed.useful_competencies,
          )
            ? skillsParsed.useful_competencies
            : [];
          usefulCompetencies.forEach((rawCategory) => {
            const category = normalizeSkillCategory(rawCategory);
            if (!category) return;
            skillCount[category] = (skillCount[category] || 0) + 1;
          });
        });

        setInDemandSkillsData(
          Object.entries(skillCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({ name, count })),
        );
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchChartData();
  }, []);

  // ==========================================================================
  // STAT CARD ARRAYS
  // ==========================================================================

  // College — unchanged shape, passed as kpis2 for backward compatibility.
  const kpis2 = [
    { label: "Registered Alumni", value: alumniCount, sub: alumniSubText },
    {
      label: "Survey Response Rate",
      value: surveyCompletionRate,
      sub: surveySubText,
    },
    { label: "Employment Rate", value: employmentRate, sub: employmentRateSub },
    {
      label: "Alumni Satisfaction",
      value: alumniSatisfaction,
      sub: satisfactionSub,
    },
  ];

  // SHS — mirrors College shape; "Retention Rate" replaces "Employment Rate"
  // because SHS alumni are typically students who may not be in the workforce.
  const shsKpis = [
    {
      label: "Registered Alumni",
      value: shsAlumniCount,
      sub: shsAlumniSubText,
    },
    {
      label: "Survey Response Rate",
      value: shsSurveyCompletionRate,
      sub: shsSurveySubText,
    },
    { label: "Retention Rate", value: shsRetentionRate, sub: shsRetentionSub },
    {
      label: "Alumni Satisfaction",
      value: shsAlumniSatisfaction,
      sub: shsSatisfactionSub,
    },
  ];

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <AdminDashboardView
      activeKpiTab={activeKpiTab}
      setActiveKpiTab={setActiveKpiTab}
      kpiData={kpiData}
      kpis2={kpis2}
      shsKpis={shsKpis}
      employmentAlignmentData={employmentAlignmentData}
      employmentStatusData={employmentStatusData}
      inDemandSkillsData={inDemandSkillsData}
      careerAlignmentData={careerAlignmentData}
      loadingCharts={loadingCharts}
      alumniType={alumniType}
      shsPostGradPathData={shsPostGradPathData}
      shsContinuedStudiesData={shsContinuedStudiesData}
    />
  );
};

export default AdminDashboard;