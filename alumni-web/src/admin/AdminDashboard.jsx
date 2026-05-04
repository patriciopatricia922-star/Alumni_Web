// ============================================================================
// THIS IS FOR LOGIC.
// ============================================================================
// Purpose: Handles all business logic, Supabase API calls, data processing,
//          state management, and event handlers for the admin dashboard.
// ============================================================================

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AdminDashboardView from "./views/AdminDashboardView";

// ============================================================================
// SATISFACTION SCORE MAPPING - Maps survey satisfaction text to numeric scores
// ============================================================================
const SATISFACTION_SCORE = {
  'Very Satisfied':    5,
  'Very satisfied':    5,
  'Satisfied':         4,
  'Neutral':           3,
  'Dissatisfied':      2,
  'Very Dissatisfied': 1,
  'Very dissatisfied': 1,
};

// ============================================================================
// EMPLOYMENT STATUS MAPPING - Maps employment status values to categories
// ============================================================================
const STATUS_MAPPING = {
  'Regular / Permanent': 'Employed',
  'Probationary': 'Employed',
  'Regular': 'Employed',
  'Permanent': 'Employed',
  'Full-time': 'Employed',
  'Part-time': 'Employed',
  'Regular/Full-time': 'Employed',
  'Part-time/Full-time': 'Employed',
  'Unemployed': 'Unemployed',
  'Not employed': 'Unemployed',
  'Looking for work': 'Unemployed',
  'Unemployed, but looking for work': 'Unemployed',
  'Unemployed, but not looking for work': 'Unemployed',
  'Self-employed': 'Self-Employed',
  'Self-Employed': 'Self-Employed',
  'Business owner': 'Self-Employed',
  'Freelance': 'Freelance',
  'Student': 'Student',
  'Studying': 'Student',
  'Contractual': 'Contractual',
  'Contract based': 'Contractual',
};

// ============================================================================
// SUPERVISORY KEYWORDS - Used to detect supervisory job positions
// Maps to the "Occupying Supervisory Positions" KPI
// ============================================================================
const SUPERVISORY_KEYWORDS = [
  'manager', 'supervisor', 'lead', 'leader', 'head',
  'director', 'chief', 'officer', 'coordinator', 'superintendent',
  'foreman', 'overseer', 'team lead', 'senior', 'principal',
];

// ============================================================================
// UNEMPLOYED STATUSES - Used to determine whether a respondent is unemployed
// ============================================================================
const UNEMPLOYED_STATUSES = new Set([
  'Unemployed',
  'Unemployed, but looking for work',
  'Unemployed, but not looking for work',
  'Not employed',
  'Looking for work',
]);

// ============================================================================
// WITHIN_ONE_YEAR_VALUES - Survey options that map to "found job within 1 yr"
// Used as a proxy for the "Employed Within 2 Yrs of Graduation" KPI.
// The survey asks how long it took to find the FIRST job; options of 1 yr or
// less are treated as satisfying the 2-year employment window goal.
// ============================================================================
const WITHIN_ONE_YEAR_VALUES = new Set([
  'Less than a month',
  '1–3 months',
  '4–6 months',
  '7–12 months',
]);

// ============================================================================
// safe JSON parse helper — avoids try/catch repetition throughout
// ============================================================================
const safeParse = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return null; }
};

// ============================================================================
// INSTITUTIONAL KPIs STRUCTURE - 9 KPIs across 3 tabs (3 each)
// Values will be populated from survey_progress data
// ============================================================================
const institutionalKpis = {
  employment: [
    {
      id: "internship_absorption",
      category: "Career Services",
      label: "Absorption from Internship",
      value: "0%", progress: 0, target: 0,
      targetLabel: "Goal: —",
      trend: { dir: "none", delta: "" },
      // SOURCE: employment_information_data → how_found_first_job === "Internship Absorption"
      // DENOMINATOR: all employed respondents
    },
    {
      id: "employment_two_years",
      category: "Employment",
      label: "Employed Within 2 Yrs of Graduation",
      value: "0%", progress: 0, target: 85,
      targetLabel: "Goal: 85%",
      trend: { dir: "none", delta: "" },
      // SOURCE: employment_information_data → time_to_find_first_job in WITHIN_ONE_YEAR_VALUES
      //         OR current_employment_status is not in UNEMPLOYED_STATUSES
      // DENOMINATOR: all respondents with employment data
    },
    {
      id: "field_related",
      category: "Employment",
      label: "Employed in Field / Related Field",
      value: "0%", progress: 0, target: 70,
      targetLabel: "Goal: 70%",
      trend: { dir: "none", delta: "" },
      // SOURCE: employment_information_data → job_related_to_degree === "Yes"
      // DENOMINATOR: all employed respondents (not unemployed)
    },
  ],
  career: [
    {
      id: "outside_field",
      category: "Career",
      label: "Employed Outside Field of Specialization",
      value: "0%", progress: 0, target: 20,
      targetLabel: "Goal: <20%",
      targetDir: "below",
      trend: { dir: "none", delta: "" },
      // SOURCE: employment_information_data → job_related_to_degree === "No"
      // DENOMINATOR: all employed respondents
    },
    {
      id: "entrepreneurship",
      category: "Career",
      label: "Engaged in Entrepreneurship",
      value: "0%", progress: 0, target: 0,
      targetLabel: "Goal: —",
      trend: { dir: "none", delta: "" },
      // SOURCE: employment_information_data → current_employment_status === "Self-Employed"
      // DENOMINATOR: all respondents with employment data
    },
    {
      id: "supervisory",
      category: "Career",
      label: "Occupying Supervisory Positions",
      value: "0%", progress: 0, target: 15,
      targetLabel: "Goal: 15%",
      trend: { dir: "none", delta: "" },
      // SOURCE: employment_information_data → job_position contains SUPERVISORY_KEYWORDS
      // DENOMINATOR: all employed respondents
    },
  ],
  education: [
    {
      id: "grad_studies",
      category: "Education",
      label: "Pursued Graduate Studies (within 1 yr)",
      value: "0%", progress: 0, target: 10,
      targetLabel: "Goal: 10%",
      trend: { dir: "none", delta: "" },
      // SOURCE: educational_background_data → plans_postgraduate === "Yes"
      //         OR currently_taking_licensure mapped to grad intent
      // DENOMINATOR: all respondents with educational background data
    },
    {
      id: "nu_grad_studies",
      category: "Education",
      label: "Pursued Graduate Studies at NU",
      value: "0%", progress: 0, target: 30,
      targetLabel: "Goal: 30%",
      trend: { dir: "none", delta: "" },
      // SOURCE: educational_background_data → plans_postgraduate === "Yes"
      //         ⚠️  No NU-specific field exists in the current survey schema.
      //         This uses the same "plans post-grad" signal as a temporary proxy.
      //         Replace with an NU-specific field once added to the survey.
      // DENOMINATOR: all respondents who said Yes to post-grad plans
    },
    {
      id: "prof_org",
      category: "Leadership",
      label: "In Positions in Professional Organizations",
      value: "0", progress: 0, target: 0,
      targetLabel: "Goal: —",
      isCount: true,
      trend: { dir: "none", delta: "" },
      // SOURCE: alumni_engagement_data → willing_to_participate includes
      //         any active engagement option (not "Not at all")
      //         ⚠️  No explicit "professional organization" field in survey.
      //         This is a count of alumni expressing any active engagement intent
      //         as a proxy until a dedicated field is added.
      // DENOMINATOR: n/a — displayed as a raw count
    },
  ],
};

// ============================================================================
// AdminDashboard Component - Main logic controller
// ============================================================================
const AdminDashboard = () => {
  // ============================ TAB STATE ============================
  const [activeKpiTab, setActiveKpiTab] = useState("employment");

  // ============================ KPI STATE ============================
  const [alumniCount, setAlumniCount] = useState('—');
  const [surveyCompletionRate, setSurveyCompletionRate] = useState('—');
  const [alumniSubText, setAlumniSubText] = useState('loading...');
  const [surveySubText, setSurveySubText] = useState('loading...');
  const [activePrograms, setActivePrograms] = useState('—');
  const [activeProgramsSub, setActiveProgramsSub] = useState('from survey responses');
  const [alumniSatisfaction, setAlumniSatisfaction] = useState('—');
  const [satisfactionSub, setSatisfactionSub] = useState('based on feedback');

  // ============================ INSTITUTIONAL KPI DATA STATES ============================
  const [kpiData, setKpiData] = useState(institutionalKpis);

  // ============================ CHART DATA STATES ============================
  const [employmentAlignmentData, setEmploymentAlignmentData] = useState([]);
  const [employmentStatusData, setEmploymentStatusData] = useState([]);
  const [inDemandSkillsData, setInDemandSkillsData] = useState([]);
  const [employmentForecastData, setEmploymentForecastData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  // ============================ KPI DATA FETCHING ============================
  useEffect(() => {
    const fetchStats = async () => {

      // --------------------------------------------------------------------
      // 1. FETCH REGISTERED ALUMNI COUNT
      // --------------------------------------------------------------------
      const { count: alumniTotal, error: alumniErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni');
      if (!alumniErr) setAlumniCount(String(alumniTotal ?? 0));
      else console.error('Alumni count error:', alumniErr.message);

      // --------------------------------------------------------------------
      // 2. FETCH NEW ALUMNI THIS MONTH
      // --------------------------------------------------------------------
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: newThisMonth, error: newErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni')
        .gte('created_at', startOfMonth);
      if (!newErr) setAlumniSubText(`+${newThisMonth ?? 0} new this month`);

      // --------------------------------------------------------------------
      // 3. FETCH SURVEY COMPLETION RATE
      // --------------------------------------------------------------------
      const { count: completed, error: surveyErr } = await supabase
        .from('survey_progress')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true);

      if (!surveyErr) {
        const total = alumniTotal ?? 0;
        const rate = total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0;
        setSurveyCompletionRate(`${rate}%`);

        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const { count: completedThisMonth } = await supabase
          .from('survey_progress').select('*', { count: 'exact', head: true })
          .eq('completed', true).gte('last_updated', startOfMonth);
        const { count: completedLastMonth } = await supabase
          .from('survey_progress').select('*', { count: 'exact', head: true })
          .eq('completed', true).gte('last_updated', startOfLastMonth).lt('last_updated', startOfMonth);

        const thisM = completedThisMonth ?? 0;
        const lastM = completedLastMonth ?? 0;
        if (lastM === 0) {
          setSurveySubText(thisM > 0 ? `+${thisM} completed this month` : 'No completions yet');
        } else {
          const diff = thisM - lastM;
          setSurveySubText(`${diff >= 0 ? '+' : ''}${diff} vs last month`);
        }
      } else {
        console.error('Survey completion error:', surveyErr.message);
      }

      // --------------------------------------------------------------------
      // 4. FETCH ACTIVE PROGRAMS
      // --------------------------------------------------------------------
      try {
        const { data: eduRows, error: eduErr } = await supabase
          .from('survey_progress')
          .select('educational_background_data');

        if (eduErr) {
          console.error('Active programs error:', eduErr.message);
          setActivePrograms('—');
          setActiveProgramsSub('Unable to load');
        } else if (eduRows) {
          const programs = new Set(
            eduRows
              .filter(r => r.educational_background_data !== null)
              .map(r => {
                const parsed = safeParse(r.educational_background_data);
                return parsed?.degreeProgram || parsed?.degree_program || null;
              })
              .filter(Boolean)
          );
          const count = programs.size;
          setActivePrograms(String(count));
          setActiveProgramsSub(count === 1 ? '1 active program' : `${count} active programs`);
        }
      } catch (e) { console.error('Active programs error:', e); }

      // --------------------------------------------------------------------
      // 5. FETCH ALUMNI SATISFACTION
      // --------------------------------------------------------------------
      try {
        const { data: feedbackRows, error: feedbackErr } = await supabase
          .from('survey_progress')
          .select('feedback_university_data');

        if (feedbackErr) {
          console.error('Alumni satisfaction error:', feedbackErr.message);
          setAlumniSatisfaction('—');
          setSatisfactionSub('Unable to load');
        } else if (feedbackRows) {
          const scores = feedbackRows
            .filter(r => r.feedback_university_data !== null)
            .map(r => {
              const parsed = safeParse(r.feedback_university_data);
              return SATISFACTION_SCORE[parsed?.satisfaction] || null;
            })
            .filter(Boolean);

          if (scores.length > 0) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            setAlumniSatisfaction(avg.toFixed(1));
            setSatisfactionSub(`Based on ${scores.length} response${scores.length !== 1 ? 's' : ''}`);
          } else {
            setAlumniSatisfaction('N/A');
            setSatisfactionSub('No feedback yet');
          }
        }
      } catch (e) { console.error('Alumni satisfaction error:', e); }

      // ====================================================================
      // 6. COMPUTE ALL 9 INSTITUTIONAL KPIs FROM survey_progress
      //
      // Single fetch of the three relevant JSON columns to avoid multiple
      // round-trips. All KPI computation happens client-side from this data.
      // ====================================================================
      const { data: allRows, error: allErr } = await supabase
        .from('survey_progress')
        .select(
          'employment_information_data, educational_background_data, alumni_engagement_data'
        );

      if (allErr) {
        console.error('Institutional KPI fetch error:', allErr.message);
        return;
      }

      // ── Parse all rows once ─────────────────────────────────────────────
      const parsed = (allRows ?? []).map(row => ({
        emp: safeParse(row.employment_information_data),
        edu: safeParse(row.educational_background_data),
        eng: safeParse(row.alumni_engagement_data),
      }));

      // ── Helper: is this respondent currently employed? ──────────────────
      // A respondent is "employed" if their status is NOT in UNEMPLOYED_STATUSES
      // and they have an employment status recorded.
      const isEmployed = (emp) => {
        if (!emp) return false;
        const status = emp.employment_status || emp.employmentStatus || emp.current_employment_status || '';
        if (!status) {
          // Fallback: if they have a job position or company, treat as employed
          return !!(emp.job_position || emp.company_name);
        }
        return !UNEMPLOYED_STATUSES.has(status);
      };

      // ── Partition rows ──────────────────────────────────────────────────
      const withEmpData   = parsed.filter(r => r.emp !== null);
      const withEduData   = parsed.filter(r => r.edu !== null);
      const employedRows  = withEmpData.filter(r => isEmployed(r.emp));

      // ════════════════════════════════════════════════════════════════════
      // EMPLOYMENT TAB KPIs
      // ════════════════════════════════════════════════════════════════════

      // ── KPI 1: Absorption from Internship ───────────────────────────────
      // Numerator:   employed alumni who found their first job via internship
      // Denominator: all employed respondents
      // Field path:  emp.how_found_first_job || emp.first_job_source
      const internshipCount = employedRows.filter(r => {
        const src = r.emp.how_found_first_job
          || r.emp.first_job_source
          || r.emp.how_did_you_find_first_job
          || '';
        return src === 'Internship Absorption';
      }).length;
      const internshipPct = employedRows.length > 0
        ? Math.round((internshipCount / employedRows.length) * 100)
        : 0;

      // ── KPI 2: Employed Within 2 Years of Graduation ────────────────────
      // Proxy: respondents whose time-to-first-job was ≤ 1 year
      //        OR who are currently employed (not unemployed status).
      // Using current employment status (not unemployed) as the primary signal
      // since it's the most direct indicator available in the schema.
      // Denominator: all respondents with employment data
      const empWithinTwoYears = withEmpData.filter(r => isEmployed(r.emp)).length;
      const empTwoYearsPct = withEmpData.length > 0
        ? Math.round((empWithinTwoYears / withEmpData.length) * 100)
        : 0;

      // ── KPI 3: Employed in Field / Related Field ─────────────────────────
      // Field path: emp.job_related_to_degree || emp.is_job_related_to_degree
      // Denominator: all employed respondents
      const fieldRelatedCount = employedRows.filter(r => {
        const val = r.emp.job_related_to_degree
          || r.emp.is_job_related_to_degree
          || r.emp.jobRelatedToDegree
          || '';
        return val === 'Yes' || val === true;
      }).length;
      const fieldRelatedPct = employedRows.length > 0
        ? Math.round((fieldRelatedCount / employedRows.length) * 100)
        : 0;

      // ════════════════════════════════════════════════════════════════════
      // CAREER TAB KPIs
      // ════════════════════════════════════════════════════════════════════

      // ── KPI 4: Employed Outside Field of Specialization ─────────────────
      // Direct inverse of KPI 3 — job_related_to_degree === "No"
      // Denominator: all employed respondents
      const outsideFieldCount = employedRows.filter(r => {
        const val = r.emp.job_related_to_degree
          || r.emp.is_job_related_to_degree
          || r.emp.jobRelatedToDegree
          || '';
        return val === 'No' || val === false;
      }).length;
      const outsideFieldPct = employedRows.length > 0
        ? Math.round((outsideFieldCount / employedRows.length) * 100)
        : 0;

      // ── KPI 5: Engaged in Entrepreneurship ──────────────────────────────
      // Field path: emp.employment_status === "Self-Employed"
      // Denominator: all respondents with employment data
      const entrepreneurCount = withEmpData.filter(r => {
        const status = r.emp.employment_status
          || r.emp.current_employment_status
          || r.emp.employmentStatus
          || '';
        return status === 'Self-Employed' || status === 'Self-employed';
      }).length;
      const entrepreneurPct = withEmpData.length > 0
        ? Math.round((entrepreneurCount / withEmpData.length) * 100)
        : 0;

      // ── KPI 6: Occupying Supervisory Positions ───────────────────────────
      // Field path: emp.job_position (free-text) — checked against SUPERVISORY_KEYWORDS
      // Denominator: all employed respondents
      const supervisoryCount = employedRows.filter(r => {
        const pos = (r.emp.job_position || r.emp.jobPosition || r.emp.position || '').toLowerCase();
        return SUPERVISORY_KEYWORDS.some(kw => pos.includes(kw));
      }).length;
      const supervisoryPct = employedRows.length > 0
        ? Math.round((supervisoryCount / employedRows.length) * 100)
        : 0;

      // ════════════════════════════════════════════════════════════════════
      // EDUCATION TAB KPIs
      // ════════════════════════════════════════════════════════════════════

      // ── KPI 7: Pursued Graduate Studies (within 1 yr) ───────────────────
      // Field path: edu.plans_postgraduate || edu.do_you_have_plans_postgrad
      // Matches survey label: "Do you have plans on taking a post-graduate studies?"
      // Answer: "Yes"
      // Denominator: all respondents with educational background data
      const gradStudiesCount = withEduData.filter(r => {
        const val = r.edu.plans_postgraduate
          || r.edu.do_you_have_plans_postgrad
          || r.edu.plansPostgraduate
          || r.edu.post_graduate_plans
          || '';
        return val === 'Yes' || val === true;
      }).length;
      const gradStudiesPct = withEduData.length > 0
        ? Math.round((gradStudiesCount / withEduData.length) * 100)
        : 0;

      // ── KPI 8: Pursued Graduate Studies at NU ───────────────────────────
      // ⚠️  NO NU-SPECIFIC FIELD EXISTS in the current survey schema.
      // Proxy: of those who said "Yes" to post-grad, we cannot determine
      // which institution. This KPI is set to 0 with a clear note until
      // a dedicated "preferred institution" field is added to the survey.
      //
      // To activate: add a survey question like:
      //   "If yes, do you plan to pursue graduate studies at NU Dasmarinas?"
      // Then map its "Yes" responses here.
      const nuGradStudiesPct = 0; // ← pending NU-specific survey field

      // ── KPI 9: In Positions in Professional Organizations (count) ────────
      // ⚠️  NO DIRECT "PROFESSIONAL ORGANIZATION POSITION" FIELD in survey.
      // Proxy: alumni_engagement_data → willing_to_participate includes any
      //        active option (i.e., not exclusively "Not at all").
      //        This measures engagement intent as a proxy for org participation.
      //
      // Field path: eng.willing_to_participate (array of checkbox selections)
      const withEngData = parsed.filter(r => r.eng !== null);
      const profOrgCount = withEngData.filter(r => {
        const participates = r.eng.willing_to_participate
          || r.eng.willingness_to_participate
          || r.eng.willing_participate
          || [];
        const arr = Array.isArray(participates) ? participates : [participates];
        // Exclude "Not at all" — any other selection counts as active engagement
        return arr.some(opt => opt && opt !== 'Not at all' && opt !== 'Other');
      }).length;

      // ════════════════════════════════════════════════════════════════════
      // APPLY ALL COMPUTED KPIs TO STATE
      // ════════════════════════════════════════════════════════════════════
      setKpiData({
        employment: institutionalKpis.employment.map(kpi => {
          switch (kpi.id) {
            case 'internship_absorption':
              return {
                ...kpi,
                value: `${internshipPct}%`,
                progress: internshipPct,
                targetLabel: 'N/A',   // no defined institutional goal for this KPI
              };
            case 'employment_two_years':
              return {
                ...kpi,
                value: `${empTwoYearsPct}%`,
                progress: empTwoYearsPct,
              };
            case 'field_related':
              return {
                ...kpi,
                value: `${fieldRelatedPct}%`,
                progress: fieldRelatedPct,
              };
            default:
              return kpi;
          }
        }),

        career: institutionalKpis.career.map(kpi => {
          switch (kpi.id) {
            case 'outside_field':
              return {
                ...kpi,
                value: `${outsideFieldPct}%`,
                progress: outsideFieldPct,
              };
            case 'entrepreneurship':
              return {
                ...kpi,
                value: `${entrepreneurPct}%`,
                progress: entrepreneurPct,
                targetLabel: 'N/A',   // no defined institutional goal for this KPI
              };
            case 'supervisory':
              return {
                ...kpi,
                value: `${supervisoryPct}%`,
                progress: supervisoryPct,
              };
            default:
              return kpi;
          }
        }),

        education: institutionalKpis.education.map(kpi => {
          switch (kpi.id) {
            case 'grad_studies':
              return {
                ...kpi,
                value: `${gradStudiesPct}%`,
                progress: gradStudiesPct,
              };
            case 'nu_grad_studies':
              return {
                ...kpi,
                value: `${nuGradStudiesPct}%`,
                progress: nuGradStudiesPct,
                targetLabel: 'Goal: 30% (pending NU field)',
              };
            case 'prof_org':
              return {
                ...kpi,
                value: String(profOrgCount),
                progress: 0,
                targetLabel: 'N/A',   // no defined institutional goal for this KPI
              };
            default:
              return kpi;
          }
        }),
      });
    };

    fetchStats();
  }, []);

  // ============================ CHART DATA FETCHING ============================
  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingCharts(true);

      try {
        // --------------------------------------------------------------------
        // 1. FETCH PREDICTIONS DATA (from Python ML service via Supabase)
        // --------------------------------------------------------------------
        const { data: predictions, error } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true });

        if (!error && predictions && predictions.length > 0) {
          const programs = [...new Set(predictions.map(p => p.program))];
          const latestYear = Math.max(...predictions.map(p => p.year));
          const alignmentByProgram = programs.map(program => {
            const programPredictions = predictions.filter(p => p.program === program);
            const latest = programPredictions.find(p => p.year === latestYear);
            return { name: program, alignment: latest?.predicted_rate || 0 };
          }).sort((a, b) => b.alignment - a.alignment);
          setEmploymentAlignmentData(alignmentByProgram.slice(0, 6));

          const years = [...new Set(predictions.map(p => p.year))].sort();
          const avgByYear = years.map(year => {
            const yearPredictions = predictions.filter(p => p.year === year);
            const avg = yearPredictions.reduce((sum, p) => sum + (p.predicted_rate || 0), 0) / yearPredictions.length;
            return { year: String(year), rate: Math.round(avg) };
          });
          setEmploymentForecastData(avgByYear);
        }

        // --------------------------------------------------------------------
        // 2. FETCH EMPLOYMENT STATUS DATA
        // --------------------------------------------------------------------
        const { data: surveyData } = await supabase
          .from('survey_progress')
          .select('employment_information_data');

        const employmentStatuses = {
          'Employed': 0,
          'Unemployed': 0,
          'Self-Employed': 0,
          'Student': 0,
          'Contractual': 0,
        };

        surveyData?.forEach(row => {
          const parsed = safeParse(row.employment_information_data);
          if (!parsed) return;
          const status = parsed.employment_status
            || parsed.current_employment_status
            || parsed.employmentStatus
            || '';
          if (status) {
            const mapped = STATUS_MAPPING[status];
            if (mapped) {
              employmentStatuses[mapped]++;
            } else if (status.toLowerCase().includes('regular') || status.toLowerCase().includes('permanent')) {
              employmentStatuses.Employed++;
            } else if (status.toLowerCase().includes('self')) {
              employmentStatuses['Self-Employed']++;
            } else if (status.toLowerCase().includes('student')) {
              employmentStatuses.Student++;
            } else if (parsed.company_name || parsed.job_position) {
              employmentStatuses.Employed++;
            }
          } else if (parsed.company_name || parsed.job_position) {
            employmentStatuses.Employed++;
          }
        });

        const statusData = Object.entries(employmentStatuses)
          .filter(([_, v]) => v > 0)
          .map(([name, value]) => ({ name, value }));
        setEmploymentStatusData(statusData);

        // --------------------------------------------------------------------
        // 3. FETCH IN-DEMAND SKILLS
        // --------------------------------------------------------------------
        const skillCount = {};

        const { data: jobsData } = await supabase
          .from('jobs')
          .select('tags')
          .eq('is_active', true);

        jobsData?.forEach(job => {
          if (!job.tags) return;
          let tagsArray = [];
          if (Array.isArray(job.tags)) {
            tagsArray = job.tags;
          } else if (typeof job.tags === 'string') {
            try {
              const p = JSON.parse(job.tags);
              tagsArray = Array.isArray(p) ? p : [p];
            } catch {
              tagsArray = job.tags.split(',').map(t => t.trim());
            }
          }
          tagsArray.forEach(tag => {
            if (tag?.length > 0) {
              const skill = tag.toLowerCase().trim();
              skillCount[skill] = (skillCount[skill] || 0) + 1;
            }
          });
        });

        if (Object.keys(skillCount).length === 0) {
          const { data: surveyEmpData } = await supabase
            .from('survey_progress')
            .select('employment_information_data');

          surveyEmpData?.forEach(row => {
            const parsed = safeParse(row.employment_information_data);
            if (!parsed) return;
            const factors = parsed.job_factors || parsed.first_job_factors;
            if (Array.isArray(factors)) {
              factors.forEach(factor => {
                if (factor && factor !== 'Other') {
                  const skill = factor.toLowerCase().trim();
                  skillCount[skill] = (skillCount[skill] || 0) + 1;
                }
              });
            }
          });
        }

        if (Object.keys(skillCount).length === 0) {
          const sampleSkills = [
            'Leadership', 'Communication', 'Problem Solving', 'Teamwork',
            'Project Management', 'Critical Thinking', 'Adaptability', 'Digital Literacy',
          ];
          sampleSkills.forEach((skill, i) => {
            skillCount[skill.toLowerCase()] = sampleSkills.length - i;
          });
        }

        const topSkills = Object.entries(skillCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, count]) => ({
            name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            count,
          }));
        setInDemandSkillsData(topSkills);

      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchChartData();
  }, []);

  // ============================ ALUMNI TRACER KPIs ============================
  const kpis2 = [
    { label: "Registered Alumni",    value: alumniCount,          sub: alumniSubText },
    { label: "Survey Response Rate", value: surveyCompletionRate, sub: surveySubText },
    { label: "Active Programs",      value: activePrograms,       sub: activeProgramsSub },
    { label: "Alumni Satisfaction",  value: alumniSatisfaction,   sub: satisfactionSub },
  ];

  // ============================ RENDER ============================
  return (
    <AdminDashboardView
      activeKpiTab={activeKpiTab}
      setActiveKpiTab={setActiveKpiTab}
      kpiData={kpiData}
      kpis2={kpis2}
      employmentAlignmentData={employmentAlignmentData}
      employmentStatusData={employmentStatusData}
      inDemandSkillsData={inDemandSkillsData}
      employmentForecastData={employmentForecastData}
      loadingCharts={loadingCharts}
    />
  );
};

export default AdminDashboard;