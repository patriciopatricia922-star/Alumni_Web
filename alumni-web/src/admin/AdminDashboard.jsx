// ============================================================================
// AdminDashboard — Logic Controller
// ============================================================================

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AdminDashboardView from "./views/AdminDashboardView";
import { buildAllKpiInsights } from "../services/kpiInsightsService";
// ↓ Corrected from friend's "./contexts/..." — must match the single canonical
//   location used by AdminSidebar and the rest of your project.
//   Both files now import the same module instance, so the Provider and
//   consumers share one context object and useContext() resolves correctly.
import { useAlumniType } from "./contexts/AlumniTypeContext";

// ============================================================================
// SATISFACTION SCORE MAPPING
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
// EMPLOYMENT STATUS MAPPING
// ============================================================================
const STATUS_MAPPING = {
  'Regular / Permanent':   'Employed',
  'Probationary':          'Employed',
  'Regular':               'Employed',
  'Permanent':             'Employed',
  'Full-time':             'Employed',
  'Part-time':             'Employed',
  'Regular/Full-time':     'Employed',
  'Part-time/Full-time':   'Employed',
  'Unemployed':            'Unemployed',
  'Not employed':          'Unemployed',
  'Looking for work':      'Unemployed',
  'Unemployed, but looking for work':     'Unemployed',
  'Unemployed, but not looking for work': 'Unemployed',
  'Self-employed':         'Self-Employed',
  'Self-Employed':         'Self-Employed',
  'Business owner':        'Self-Employed',
  'Freelance':             'Freelance',
  'Student':               'Student',
  'Studying':              'Student',
  'Contractual':           'Contractual',
  'Contract based':        'Contractual',
};

// ============================================================================
// SUPERVISORY KEYWORDS
// ============================================================================
const SUPERVISORY_KEYWORDS = [
  'manager', 'supervisor', 'lead', 'leader', 'head',
  'director', 'chief', 'officer', 'coordinator', 'superintendent',
  'foreman', 'overseer', 'team lead', 'senior', 'principal',
];

// ============================================================================
// UNEMPLOYED STATUSES
// ============================================================================
const UNEMPLOYED_STATUSES = new Set([
  'Unemployed',
  'Unemployed, but looking for work',
  'Unemployed, but not looking for work',
  'Not employed',
  'Looking for work',
]);

// ============================================================================
// NU BRANCH KEYWORDS
// All known National University branches — used to detect if an alumni
// pursued graduate studies at any NU campus.
// ============================================================================
const NU_BRANCH_KEYWORDS = [
  'nu manila',
  'nu nazareth',
  'nu fairview',
  'nu laguna',
  'nu baliwag',
  'nu dasmarinas',
  'nu dasmariñas',
  'nu lipa',
  'nu east ortigas',
  'nu bacolod',
  'nu cebu',
  'nu moa',
  'nu clark',
  'nu las piñas',
  'nu las pinas',
  'national university',
];

// ============================================================================
// isInternshipSource — normalised substring check
// ============================================================================
const isInternshipSource = (rawValue) => {
  const src = (rawValue || '').toLowerCase().trim();
  if (!src) return false;
  return ['internship', 'ojt', 'on-the-job', 'practicum'].some(kw => src.includes(kw));
};

// ============================================================================
// isNuBranch — checks if a post-grad institution string matches any NU campus
// ============================================================================
const isNuBranch = (rawValue) => {
  const val = (rawValue || '').toLowerCase().trim();
  if (!val) return false;
  return NU_BRANCH_KEYWORDS.some(kw => val.includes(kw));
};

// ============================================================================
// safeParse — avoids try/catch repetition throughout
// ============================================================================
const safeParse = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return null; }
};

// ============================================================================
// INSTITUTIONAL KPIs STRUCTURE — 9 KPIs across 3 tabs + SHS tab
// seniorrhigh tab added from friend's version — KPI values are passed through
// untouched until SHS-specific survey data and computation logic are ready.
// ============================================================================
const institutionalKpis = {
  employment: [
    {
      id: "internship_absorption",
      category: "Career Services",
      label: "Absorption from Internship",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "employment_two_years",
      category: "Employment",
      label: "Employed Within 2 Yrs of Graduation",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "field_related",
      category: "Employment",
      label: "Employed in Field / Related Field",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
  ],
  career: [
    {
      id: "outside_field",
      category: "Career",
      label: "Employed Outside Field of Specialization",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      targetDir: "below",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "entrepreneurship",
      category: "Career",
      label: "Engaged in Entrepreneurship",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "supervisory",
      category: "Career",
      label: "Occupying Supervisory Positions",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
  ],
  education: [
    {
      id: "grad_studies",
      category: "Education",
      label: "Pursued Graduate Studies (within 1 yr)",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "nu_grad_studies",
      category: "Education",
      label: "Pursued Graduate Studies at NU",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "prof_org",
      category: "Leadership",
      label: "In Positions in Professional Organizations",
      value: "0", progress: 0, target: 0,
      targetLabel: "Goal: —",
      isCount: true,
      trend: { dir: "none", delta: "" },
    },
  ],
  // Added from friend's version. Passed through untouched in setKpiData until
  // SHS-specific computation logic is implemented.
  seniorrhigh: [
    {
      id: "shs_pursued_undergrad",
      category: "Senior High",
      label: "SHS Alumni Who Pursued Undergraduate Degree",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "shs_pursued_undergrad_nu",
      category: "Senior High",
      label: "SHS Alumni Who Pursued Undergraduate at NU",
      value: "0%", progress: 0, target: 100,
      targetLabel: "Goal: 100%",
      trend: { dir: "none", delta: "" },
    },
  ],
};

// ============================================================================
// Prediction year constants — mirror train_model.py BASE_YEAR / END_YEAR.
// ============================================================================
const PREDICTION_BASE_YEAR = 2025;
const PREDICTION_END_YEAR  = 2030;

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
    const actual  = Math.round(baseRow.current_rate ?? baseRow.predicted_rate ?? 0);

    const endRow    = sorted[sorted.length - 1];
    const predicted = Math.round(endRow.predicted_rate ?? 0);

    const respondents = sorted.length;

    return { program, predicted, actual, respondents };
  });
};

// ============================================================================
// AdminDashboard Component
// ============================================================================
const AdminDashboard = () => {

  // alumniType drives view-level filtering (College vs SHS). The value is set
  // by the AlumniTypeSwitcher in AdminSidebar and shared via context so this
  // page re-renders automatically when the user toggles.
  const { alumniType } = useAlumniType();

  // ── Tab ──────────────────────────────────────────────────────────────────
  const [activeKpiTab, setActiveKpiTab] = useState("employment");

  // ── Alumni Tracer stat cards ──────────────────────────────────────────────
  const [alumniCount,          setAlumniCount]          = useState('—');
  const [alumniSubText,        setAlumniSubText]         = useState('loading...');
  const [surveyCompletionRate, setSurveyCompletionRate]  = useState('—');
  const [surveySubText,        setSurveySubText]         = useState('loading...');
  const [employmentRate,       setEmploymentRate]        = useState('—');
  const [employmentRateSub,    setEmploymentRateSub]     = useState('loading...');
  const [alumniSatisfaction,   setAlumniSatisfaction]    = useState('—');
  const [satisfactionSub,      setSatisfactionSub]       = useState('based on feedback');

  // ── Institutional KPI grid ────────────────────────────────────────────────
  const [kpiData, setKpiData] = useState(institutionalKpis);

  // ── Chart data ────────────────────────────────────────────────────────────
  const [employmentAlignmentData, setEmploymentAlignmentData] = useState([]);
  const [employmentStatusData,    setEmploymentStatusData]    = useState([]);
  const [inDemandSkillsData,      setInDemandSkillsData]      = useState([]);
  const [careerAlignmentData,     setCareerAlignmentData]     = useState([]);
  const [loadingCharts,           setLoadingCharts]           = useState(true);

  // ── Dynamic KPI insights (employment / feedback / engagement) ─────────────
  const [kpiInsights, setKpiInsights] = useState(null);

  // ==========================================================================
  // KPI DATA FETCHING
  // ==========================================================================
  useEffect(() => {
    const fetchStats = async () => {

      // ── 1. Registered alumni count ────────────────────────────────────────
      const { count: alumniTotal, error: alumniErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni');
      if (!alumniErr) setAlumniCount(String(alumniTotal ?? 0));
      else console.error('Alumni count error:', alumniErr.message);

      // ── 2. New alumni this month ──────────────────────────────────────────
      const now = new Date();
      const startOfMonth     = new Date(now.getFullYear(), now.getMonth(),     1).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const { count: newThisMonth, error: newErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni')
        .gte('created_at', startOfMonth);
      if (!newErr) setAlumniSubText(`+${newThisMonth ?? 0} new this month`);

      // ── 3. Survey completion rate ─────────────────────────────────────────
      const { count: completed, error: surveyErr } = await supabase
        .from('survey_progress')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true);

      if (!surveyErr) {
        const total = alumniTotal ?? 0;
        const rate  = total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0;
        setSurveyCompletionRate(`${rate}%`);

        const { count: completedThisMonth } = await supabase
          .from('survey_progress').select('*', { count: 'exact', head: true })
          .eq('completed', true).gte('last_updated', startOfMonth);
        const { count: completedLastMonth } = await supabase
          .from('survey_progress').select('*', { count: 'exact', head: true })
          .eq('completed', true)
          .gte('last_updated', startOfLastMonth)
          .lt('last_updated', startOfMonth);

        const thisM = completedThisMonth ?? 0;
        const lastM = completedLastMonth ?? 0;
        if (lastM === 0) {
          setSurveySubText(thisM > 0 ? `+${thisM} completed this month` : 'No completions yet');
        } else {
          const diff = thisM - lastM;
          setSurveySubText(`${diff >= 0 ? '+' : ''}${diff} last month`);
        }
      } else {
        console.error('Survey completion error:', surveyErr.message);
      }

      // ── 4. Alumni satisfaction ────────────────────────────────────────────
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

      // ── 5. All 9 Institutional KPIs + dynamic insights ────────────────────
      const { data: allRows, error: allErr } = await supabase
        .from('survey_progress')
        .select(
          'employment_information_data, educational_background_data, alumni_engagement_data, job_experience_data, feedback_university_data, skills_competencies_data'
        );

      if (allErr) {
        console.error('Institutional KPI fetch error:', allErr.message);
        return;
      }

      const surveyRows = allRows ?? [];

      // ── Build dynamic insights from raw rows ──────────────────────────────
      const insights = buildAllKpiInsights(surveyRows);
      setKpiInsights(insights);

      const parsed = surveyRows.map(row => ({
        emp:    safeParse(row.employment_information_data),
        edu:    safeParse(row.educational_background_data),
        eng:    safeParse(row.alumni_engagement_data),
        job:    safeParse(row.job_experience_data),
        skills: safeParse(row.skills_competencies_data),
      }));

      // Helper: is this respondent currently employed?
      const isEmployedHelper = (emp) => {
        if (!emp) return false;
        const status = emp.employment_status || emp.employmentStatus || emp.current_employment_status || '';
        if (!status) return !!(emp.job_position || emp.company_name);
        return !UNEMPLOYED_STATUSES.has(status);
      };

      const withEmpData  = parsed.filter(r => r.emp !== null);
      const withEduData  = parsed.filter(r => r.edu !== null);
      const employedRows = withEmpData.filter(r => isEmployedHelper(r.emp));
      const withJobData  = parsed.filter(r => r.job !== null);

      if (process.env.NODE_ENV === 'development') {
        console.log('[internship KPI] all first_job_source values:',
          withJobData.map(r => r.job.first_job_source ?? '(missing)'));
        console.log('[internship KPI] withJobData count:', withJobData.length);
      }

      // ── Employment tab KPIs ───────────────────────────────────────────────

      // KPI 1: Absorption from Internship
      const internshipCount = withJobData.filter(r => {
        const rawSrc =
          r.job.first_job_source   ||
          r.job.how_found_first_job ||
          r.job.source_of_first_job ||
          r.job.job_source          ||
          '';
        return isInternshipSource(rawSrc);
      }).length;
      const internshipPct = withJobData.length > 0
        ? Math.round((internshipCount / withJobData.length) * 100) : 0;

      // KPI 2: Employed Within 2 Years of Graduation
      const empWithinTwoYears = withEmpData.filter(r => isEmployedHelper(r.emp)).length;
      const empTwoYearsPct    = withEmpData.length > 0
        ? Math.round((empWithinTwoYears / withEmpData.length) * 100) : 0;

      // KPI 3: Employed in Field / Related Field
      const fieldRelatedCount = employedRows.filter(r => {
        const val = r.emp.job_related_to_degree
          || r.emp.is_job_related_to_degree
          || r.emp.jobRelatedToDegree
          || '';
        return val === 'Yes' || val === true;
      }).length;
      const fieldRelatedPct = employedRows.length > 0
        ? Math.round((fieldRelatedCount / employedRows.length) * 100) : 0;

      // ── Career tab KPIs ───────────────────────────────────────────────────

      // KPI 4: Employed Outside Field of Specialization
      const outsideFieldCount = employedRows.filter(r => {
        const val = r.emp.job_related_to_degree
          || r.emp.is_job_related_to_degree
          || r.emp.jobRelatedToDegree
          || '';
        return val === 'No' || val === false;
      }).length;
      const outsideFieldPct = employedRows.length > 0
        ? Math.round((outsideFieldCount / employedRows.length) * 100) : 0;

      // KPI 5: Engaged in Entrepreneurship
      const entrepreneurCount = withEmpData.filter(r => {
        const status = r.emp.employment_status
          || r.emp.current_employment_status
          || r.emp.employmentStatus
          || '';
        return status === 'Self-Employed' || status === 'Self-employed';
      }).length;
      const entrepreneurPct = withEmpData.length > 0
        ? Math.round((entrepreneurCount / withEmpData.length) * 100) : 0;

      // KPI 6: Occupying Supervisory Positions
      const supervisoryCount = employedRows.filter(r => {
        const pos = (r.emp.job_position || r.emp.jobPosition || r.emp.position || '').toLowerCase();
        return SUPERVISORY_KEYWORDS.some(kw => pos.includes(kw));
      }).length;
      const supervisoryPct = employedRows.length > 0
        ? Math.round((supervisoryCount / employedRows.length) * 100) : 0;

      // ── Education tab KPIs ────────────────────────────────────────────────

      // KPI 7: Pursued Graduate Studies (within 1 yr)
      const gradStudiesCount = withEduData.filter(r => {
        const plans = r.edu.post_grad_plans
          || r.edu.postGradPlans
          || r.edu.plans_postgraduate
          || r.edu.do_you_have_plans_postgrad
          || r.edu.plansPostgraduate
          || r.edu.post_graduate_plans
          || '';
        return plans === 'Yes' || plans === true;
      }).length;
      const gradStudiesPct = withEduData.length > 0
        ? Math.round((gradStudiesCount / withEduData.length) * 100) : 0;

      // KPI 8: Pursued Graduate Studies at NU
      const nuGradStudiesCount = withEduData.filter(r => {
        const plans = r.edu.post_grad_plans
          || r.edu.postGradPlans
          || r.edu.plans_postgraduate
          || r.edu.do_you_have_plans_postgrad
          || r.edu.plansPostgraduate
          || r.edu.post_graduate_plans
          || '';
        if (plans !== 'Yes' && plans !== true) return false;

        const institution = r.edu.post_grad_course
          || r.edu.postGradCourse
          || r.edu.post_grad_school
          || r.edu.postGradSchool
          || r.edu.graduate_school
          || r.edu.school
          || '';
        return isNuBranch(institution);
      }).length;
      const nuGradStudiesPct = withEduData.length > 0
        ? Math.round((nuGradStudiesCount / withEduData.length) * 100) : 0;

      // KPI 9: In Positions in Professional Organizations (Leadership)
      const withSkillsData = parsed.filter(r => r.skills !== null);
      const leadershipCount = withSkillsData.filter(r => {
        const ratings = r.skills.skill_ratings || r.skills.skillRatings || {};
        const leadershipRating =
          ratings['Leadership Skills'] ??
          ratings['leadership_skills']  ??
          ratings['Leadership']         ??
          null;
        return leadershipRating !== null && Number(leadershipRating) >= 4;
      }).length;

      // ── Employment Rate stat card ─────────────────────────────────────────
      const employedStatCount = withEmpData.filter(r => isEmployedHelper(r.emp)).length;
      if (withEmpData.length > 0) {
        const empRatePct = Math.round((employedStatCount / withEmpData.length) * 100);
        setEmploymentRate(`${empRatePct}%`);
        setEmploymentRateSub(`Based on ${withEmpData.length} response${withEmpData.length !== 1 ? 's' : ''}`);
      } else {
        setEmploymentRate('N/A');
        setEmploymentRateSub('No employment data yet');
      }

      // ── Apply computed KPIs to state ──────────────────────────────────────
      setKpiData({
        employment: institutionalKpis.employment.map(kpi => {
          switch (kpi.id) {
            case 'internship_absorption':
              return { ...kpi, value: `${internshipPct}%`, progress: internshipPct };
            case 'employment_two_years':
              return { ...kpi, value: `${empTwoYearsPct}%`, progress: empTwoYearsPct };
            case 'field_related':
              return { ...kpi, value: `${fieldRelatedPct}%`, progress: fieldRelatedPct };
            default:
              return kpi;
          }
        }),

        career: institutionalKpis.career.map(kpi => {
          switch (kpi.id) {
            case 'outside_field':
              return { ...kpi, value: `${outsideFieldPct}%`, progress: outsideFieldPct };
            case 'entrepreneurship':
              return { ...kpi, value: `${entrepreneurPct}%`, progress: entrepreneurPct };
            case 'supervisory':
              return { ...kpi, value: `${supervisoryPct}%`, progress: supervisoryPct };
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
                targetLabel: `Goal: 100% (${gradStudiesCount} of ${withEduData.length})`,
              };
            case 'nu_grad_studies':
              return {
                ...kpi,
                value: `${nuGradStudiesPct}%`,
                progress: nuGradStudiesPct,
                targetLabel: `Goal: 100% (${nuGradStudiesCount} of ${withEduData.length})`,
              };
            case 'prof_org':
              return {
                ...kpi,
                value: String(leadershipCount),
                progress: withSkillsData.length > 0
                  ? Math.round((leadershipCount / withSkillsData.length) * 100)
                  : 0,
                targetLabel: `${leadershipCount} alumni`,
              };
            default:
              return kpi;
          }
        }),

        // SHS KPI computation is not yet implemented — pass through the
        // initial structure so the view can render the tab without crashing.
        seniorrhigh: institutionalKpis.seniorrhigh,
      });
    };

    fetchStats();
  }, []);

  // ==========================================================================
  // CHART DATA FETCHING
  // ==========================================================================
  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingCharts(true);

      try {
        // ── 1. Predictions — Employment Alignment ─────────────────────────
        const { data: predictions, error: predError } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true });

        if (!predError && predictions && predictions.length > 0) {
          // ── 1a. Employment Alignment
          const programs   = [...new Set(predictions.map(p => p.program))];
          const latestYear = Math.max(...predictions.map(p => p.year));

          const alignmentByProgram = programs.map(program => {
            const programPredictions = predictions.filter(p => p.program === program);
            const latest = programPredictions.find(p => p.year === latestYear);
            return { name: program, alignment: latest?.predicted_rate || 0 };
          }).sort((a, b) => b.alignment - a.alignment);
          setEmploymentAlignmentData(alignmentByProgram.slice(0, 6));

          // ── 1b. Career Alignment Prediction
          setCareerAlignmentData(buildCareerAlignmentData(predictions).slice(0, 10));
        } else if (predError) {
          console.error('Predictions fetch error:', predError.message);
        }

        // ── 2. Employment Status distribution ─────────────────────────────
        const { data: surveyData } = await supabase
          .from('survey_progress')
          .select('employment_information_data');

        const employmentStatuses = { 'Employed': 0, 'Unemployed': 0, 'Self-Employed': 0, 'Student': 0, 'Contractual': 0 };

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

        setEmploymentStatusData(
          Object.entries(employmentStatuses)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ name, value }))
        );

        // ── 3. In-Demand Skills ───────────────────────────────────────────
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

        // Fallback: derive skills from survey job_factors if jobs table is empty
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

        // Final fallback: sample skills for empty-state display
        if (Object.keys(skillCount).length === 0) {
          ['Leadership', 'Communication', 'Problem Solving', 'Teamwork',
           'Project Management', 'Critical Thinking', 'Adaptability', 'Digital Literacy']
            .forEach((skill, i, arr) => { skillCount[skill.toLowerCase()] = arr.length - i; });
        }

        setInDemandSkillsData(
          Object.entries(skillCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({
              name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              count,
            }))
        );

      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchChartData();
  }, []);

  // ==========================================================================
  // ALUMNI TRACER STAT CARDS
  // ==========================================================================
  const kpis2 = [
    { label: "Registered Alumni",    value: alumniCount,          sub: alumniSubText      },
    { label: "Survey Response Rate", value: surveyCompletionRate, sub: surveySubText      },
    { label: "Employment Rate",      value: employmentRate,       sub: employmentRateSub  },
    { label: "Alumni Satisfaction",  value: alumniSatisfaction,   sub: satisfactionSub    },
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
      employmentAlignmentData={employmentAlignmentData}
      employmentStatusData={employmentStatusData}
      inDemandSkillsData={inDemandSkillsData}
      careerAlignmentData={careerAlignmentData}
      loadingCharts={loadingCharts}
      kpiInsights={kpiInsights}
      alumniType={alumniType}
    />
  );
};

export default AdminDashboard;