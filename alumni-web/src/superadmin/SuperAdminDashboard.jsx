import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SuperAdminDashboardView from "./Views/SuperAdminDashboardView";
import { buildAllKpiInsights } from "../services/KpiInsightsService";
import { useAlumniType } from "./contexts/AlumniTypeContext";
import { isSHSProgram, isCollegeProgram } from "../utils/alumniUtils";

const SATISFACTION_SCORE = {
  'Very Satisfied':    5,
  'Very satisfied':    5,
  'Satisfied':         4,
  'Neutral':           3,
  'Dissatisfied':      2,
  'Very Dissatisfied': 1,
  'Very dissatisfied': 1,
};

const STATUS_MAPPING = {
  'Regular / Permanent':                  'Employed',
  'Probationary':                         'Employed',
  'Regular':                              'Employed',
  'Permanent':                            'Employed',
  'Full-time':                            'Employed',
  'Part-time':                            'Employed',
  'Regular/Full-time':                    'Employed',
  'Part-time/Full-time':                  'Employed',
  'Unemployed':                           'Unemployed',
  'Not employed':                         'Unemployed',
  'Looking for work':                     'Unemployed',
  'Unemployed, but looking for work':     'Unemployed',
  'Unemployed, but not looking for work': 'Unemployed',
  'Self-employed':                        'Self-Employed',
  'Self-Employed':                        'Self-Employed',
  'Business owner':                       'Self-Employed',
  'Freelance':                            'Freelance',
  'Student':                              'Student',
  'Studying':                             'Student',
  'Contractual':                          'Contractual',
  'Contract based':                       'Contractual',
};

const SUPERVISORY_KEYWORDS = [
  'manager', 'supervisor', 'lead', 'leader', 'head',
  'director', 'chief', 'officer', 'coordinator', 'superintendent',
  'foreman', 'overseer', 'team lead', 'senior', 'principal',
];

const UNEMPLOYED_STATUSES = new Set([
  'Unemployed',
  'Unemployed, but looking for work',
  'Unemployed, but not looking for work',
  'Not employed',
  'Looking for work',
]);

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

const isInternshipSource = (rawValue) => {
  const src = (rawValue || '').toLowerCase().trim();
  if (!src) return false;
  return ['internship', 'ojt', 'on-the-job', 'practicum'].some(kw => src.includes(kw));
};

const isNuBranch = (rawValue) => {
  const val = (rawValue || '').toLowerCase().trim();
  if (!val) return false;
  return NU_BRANCH_KEYWORDS.some(kw => val.includes(kw));
};

const safeParse = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return null; }
};

// ============================ MOST IN-DEMAND SKILLS: CATEGORY NORMALIZATION ============================
// Root-cause fix: "Most In-Demand Skills" must be derived from
// survey_progress.skills_competencies_data.useful_competencies, which only
// ever contains the five canonical competency categories below — but the
// exact string stored per alumnus can drift (e.g. "Work Ethics/Professionalism
// Skills" vs "Work Ethics/Professionalism", trailing "Skills" suffixes,
// spacing/punctuation differences around "&"/"/"). This normalizer collapses
// any such variant to one canonical label so the same competency is never
// double-counted as two categories, and legitimate values are never dropped
// just because the stored string doesn't match a label exactly. It only
// reads/labels existing values — it never invents or discards a category.
const SKILL_CATEGORY_MATCHERS = [
  { label: 'Communication Skills',              test: (n) => n.includes('communication') },
  { label: 'Information & Technology Skills',   test: (n) => n.includes('information') && n.includes('technology') },
  { label: 'Leadership Skills',                 test: (n) => n.includes('leadership') },
  { label: 'Critical & Problem-Solving Skills', test: (n) => n.includes('critical') && (n.includes('problem') || n.includes('solving')) },
  { label: 'Work Ethics / Professionalism',     test: (n) => n.includes('work') && (n.includes('ethic') || n.includes('professionalism')) },
];

const normalizeSkillCategory = (rawLabel) => {
  if (!rawLabel || typeof rawLabel !== 'string') return null;
  const normalized = rawLabel.toLowerCase().replace(/[^a-z]/g, '');
  const match = SKILL_CATEGORY_MATCHERS.find((c) => c.test(normalized));
  return match ? match.label : null;
};

// Ported from Admin: generic satisfaction computation helper, used for both
// College (feedback_university_data) and SHS (shs_feedback_and_engagement_data).
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

// Ported from Admin: generic survey completion rate helper.
const computeSurveyRate = (completedCount, totalCount) => {
  if (totalCount === 0) return "0%";
  return `${Math.round((completedCount / totalCount) * 100)}%`;
};

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

// Ported from Admin: adds `respondents` per program, matching Admin's
// buildCareerAlignmentData exactly.
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

const SuperAdminDashboard = () => {

  const { alumniType } = useAlumniType();

  const [activeKpiTab, setActiveKpiTab] = useState("employment");

  // ── College Alumni stat cards ─────────────────────────────────────────────
  // NOTE: `activePrograms` state below is intentionally left in place (in case
  // anything else in this file still references it) but is NO LONGER surfaced
  // in kpis2 — Admin's 3rd College stat card is Employment Rate, not Active
  // Programs, so kpis2 now uses employmentRate/employmentRateSub to match
  // Admin's exact card set and produce identical results for equivalent data.
  const [alumniCount,          setAlumniCount]          = useState('—');
  const [surveyCompletionRate, setSurveyCompletionRate]  = useState('—');
  const [alumniSubText,        setAlumniSubText]         = useState('loading...');
  const [surveySubText,        setSurveySubText]         = useState('loading...');
  const [alumniSatisfaction,   setAlumniSatisfaction]    = useState('—');
  const [satisfactionSub,      setSatisfactionSub]       = useState('based on feedback');
  const [employmentRate,       setEmploymentRate]        = useState('—');
  const [employmentRateSub,    setEmploymentRateSub]     = useState('loading...');

  // ── SHS Alumni stat cards ─────────────────────────────────────────────────
  const [shsAlumniCount,          setShsAlumniCount]          = useState('—');
  const [shsAlumniSubText,        setShsAlumniSubText]         = useState('loading...');
  const [shsSurveyCompletionRate, setShsSurveyCompletionRate]  = useState('—');
  const [shsSurveySubText,        setShsSurveySubText]         = useState('loading...');
  const [shsRetentionRate,        setShsRetentionRate]         = useState('—');
  const [shsRetentionSub,         setShsRetentionSub]          = useState('loading...');
  const [shsAlumniSatisfaction,   setShsAlumniSatisfaction]    = useState('—');
  const [shsSatisfactionSub,      setShsSatisfactionSub]       = useState('based on feedback');

  const [shsPostGradPathData,     setShsPostGradPathData]      = useState([]);
  const [shsContinuedStudiesData, setShsContinuedStudiesData]  = useState([]);

  const [kpiData, setKpiData] = useState(institutionalKpis);

  const [employmentAlignmentData, setEmploymentAlignmentData] = useState([]);
  const [employmentStatusData,    setEmploymentStatusData]    = useState([]);
  const [inDemandSkillsData,      setInDemandSkillsData]      = useState([]);
  const [careerAlignmentData,     setCareerAlignmentData]     = useState([]);
  const [loadingCharts,           setLoadingCharts]           = useState(true);

  const [kpiInsights, setKpiInsights] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {

      const { data: allAlumni, error: alumniErr } = await supabase
        .from('users')
        .select('id, program, created_at')
        .eq('role', 'alumni');

      if (alumniErr) {
        console.error('Alumni fetch error:', alumniErr.message);
        return;
      }

      const alumniRows    = allAlumni ?? [];
      const collegeAlumni = alumniRows.filter(u => isCollegeProgram(u.program));
      const shsAlumni     = alumniRows.filter(u => isSHSProgram(u.program));
      const collegeIds    = new Set(collegeAlumni.map(u => u.id));
      const shsIds        = new Set(shsAlumni.map(u => u.id));

      setAlumniCount(String(collegeAlumni.length));
      setShsAlumniCount(String(shsAlumni.length));

      const now              = new Date();
      const startOfMonth     = new Date(now.getFullYear(), now.getMonth(),     1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const newCollegeThisMonth = collegeAlumni.filter(u => new Date(u.created_at) >= startOfMonth).length;
      const newShsThisMonth     = shsAlumni.filter(u => new Date(u.created_at) >= startOfMonth).length;
      setAlumniSubText(`+${newCollegeThisMonth} new this month`);
      setShsAlumniSubText(`+${newShsThisMonth} new this month`);

      const { data: allSurveyRows, error: surveyFetchErr } = await supabase
        .from('survey_progress')
        .select(
          'user_id, completed, last_updated, completed_at, ' +
          'employment_information_data, educational_background_data, ' +
          'alumni_engagement_data, job_experience_data, ' +
          'feedback_university_data, skills_competencies_data, ' +
          'shs_feedback_and_engagement_data, shs_educational_background_data, ' +
          'shs_employment_information_data, shs_job_experience_data, ' +
          'shs_skills_and_competencies_data'
        );

      if (surveyFetchErr) {
        console.error('Survey fetch error:', surveyFetchErr.message);
        return;
      }

      const allRowsRaw         = allSurveyRows ?? [];
      const collegeSurveyRows  = allRowsRaw.filter(r => collegeIds.has(r.user_id));
      const shsSurveyRows      = allRowsRaw.filter(r => shsIds.has(r.user_id));

      const collegeCompleted = collegeSurveyRows.filter(r => r.completed).length;
      const shsCompleted     = shsSurveyRows.filter(r => r.completed).length;

      // Ported from Admin: use computeSurveyRate helper for exact parity.
      setSurveyCompletionRate(computeSurveyRate(collegeCompleted, collegeAlumni.length));
      setShsSurveyCompletionRate(computeSurveyRate(shsCompleted, shsAlumni.length));

      const collegeCompletedThisMonth = collegeSurveyRows.filter(
        r => r.completed && new Date(r.last_updated) >= startOfMonth
      ).length;
      const collegeCompletedLastMonth = collegeSurveyRows.filter(
        r => r.completed && new Date(r.last_updated) >= startOfLastMonth && new Date(r.last_updated) < startOfMonth
      ).length;
      if (collegeCompletedLastMonth === 0) {
        setSurveySubText(collegeCompletedThisMonth > 0 ? `+${collegeCompletedThisMonth} completed this month` : 'No completions yet');
      } else {
        const diff = collegeCompletedThisMonth - collegeCompletedLastMonth;
        setSurveySubText(`${diff >= 0 ? '+' : ''}${diff} last month`);
      }

      const shsCompletedThisMonth = shsSurveyRows.filter(
        r => r.completed && new Date(r.last_updated) >= startOfMonth
      ).length;
      const shsCompletedLastMonth = shsSurveyRows.filter(
        r => r.completed && new Date(r.last_updated) >= startOfLastMonth && new Date(r.last_updated) < startOfMonth
      ).length;
      if (shsCompletedLastMonth === 0) {
        setShsSurveySubText(shsCompletedThisMonth > 0 ? `+${shsCompletedThisMonth} completed this month` : 'No completions yet');
      } else {
        const diff = shsCompletedThisMonth - shsCompletedLastMonth;
        setShsSurveySubText(`${diff >= 0 ? '+' : ''}${diff} last month`);
      }

      // ── Satisfaction scores — ported from Admin: use computeSatisfaction ──
      const collegeSat = computeSatisfaction(
        collegeSurveyRows,
        "feedback_university_data",
        "satisfaction",
      );
      if (collegeSat.count > 0) {
        setAlumniSatisfaction(collegeSat.avg);
        setSatisfactionSub(`Based on ${collegeSat.count} response${collegeSat.count !== 1 ? 's' : ''}`);
      } else {
        setAlumniSatisfaction('N/A');
        setSatisfactionSub('No feedback yet');
      }

      const shsSat = computeSatisfaction(
        shsSurveyRows,
        "shs_feedback_and_engagement_data",
        "satisfaction",
      );
      if (shsSat.count > 0) {
        setShsAlumniSatisfaction(shsSat.avg);
        setShsSatisfactionSub(`Based on ${shsSat.count} response${shsSat.count !== 1 ? 's' : ''}`);
      } else {
        setShsAlumniSatisfaction('N/A');
        setShsSatisfactionSub('No feedback yet');
      }

      const insights = buildAllKpiInsights(collegeSurveyRows);
      setKpiInsights(insights);

      const parsed = collegeSurveyRows.map(row => ({
        emp:    safeParse(row.employment_information_data),
        edu:    safeParse(row.educational_background_data),
        eng:    safeParse(row.alumni_engagement_data),
        job:    safeParse(row.job_experience_data),
        skills: safeParse(row.skills_competencies_data),
      }));

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

      if (import.meta.env.DEV) {
        console.log('[internship KPI] all first_job_source values:',
          withJobData.map(r => r.job.first_job_source ?? '(missing)'));
        console.log('[internship KPI] withJobData count:', withJobData.length);
      }

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

      const empWithinTwoYears = withEmpData.filter(r => isEmployedHelper(r.emp)).length;
      const empTwoYearsPct    = withEmpData.length > 0
        ? Math.round((empWithinTwoYears / withEmpData.length) * 100) : 0;

      const fieldRelatedCount = employedRows.filter(r => {
        const val = r.emp.job_related_to_degree
          || r.emp.is_job_related_to_degree
          || r.emp.jobRelatedToDegree
          || '';
        return val === 'Yes' || val === true;
      }).length;
      const fieldRelatedPct = employedRows.length > 0
        ? Math.round((fieldRelatedCount / employedRows.length) * 100) : 0;

      const outsideFieldCount = employedRows.filter(r => {
        const val = r.emp.job_related_to_degree
          || r.emp.is_job_related_to_degree
          || r.emp.jobRelatedToDegree
          || '';
        return val === 'No' || val === false;
      }).length;
      const outsideFieldPct = employedRows.length > 0
        ? Math.round((outsideFieldCount / employedRows.length) * 100) : 0;

      const entrepreneurCount = withEmpData.filter(r => {
        const status = r.emp.employment_status
          || r.emp.current_employment_status
          || r.emp.employmentStatus
          || '';
        return status === 'Self-Employed' || status === 'Self-employed';
      }).length;
      const entrepreneurPct = withEmpData.length > 0
        ? Math.round((entrepreneurCount / withEmpData.length) * 100) : 0;

      const supervisoryCount = employedRows.filter(r => {
        const pos = (r.emp.job_position || r.emp.jobPosition || r.emp.position || '').toLowerCase();
        return SUPERVISORY_KEYWORDS.some(kw => pos.includes(kw));
      }).length;
      const supervisoryPct = employedRows.length > 0
        ? Math.round((supervisoryCount / employedRows.length) * 100) : 0;

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

      // ── College Employment Rate stat card ─────────────────────────────────
      const employedStatCount = withEmpData.filter(r => isEmployedHelper(r.emp)).length;
      if (withEmpData.length > 0) {
        const empRatePct = Math.round((employedStatCount / withEmpData.length) * 100);
        setEmploymentRate(`${empRatePct}%`);
        setEmploymentRateSub(`Based on ${withEmpData.length} response${withEmpData.length !== 1 ? 's' : ''}`);
      } else {
        setEmploymentRate('N/A');
        setEmploymentRateSub('No employment data yet');
      }

      // ── SHS Retention Rate — ported from Admin's exact field logic ───────
      // Admin defines "retained" as shs_educational_background_data.status
      // === "Currently Studying". The previous guessed-field version here
      // (pursued_undergrad/continued_studies/etc.) did not match Admin's
      // schema assumptions and would compute different results for the same
      // rows, so it has been replaced to guarantee identical output.
      const shsWithEduData = shsSurveyRows.filter(r => r.shs_educational_background_data !== null);
      const shsRetained = shsWithEduData.filter(r => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return false;
        return edu.status === 'Currently Studying';
      }).length;

      if (shsWithEduData.length > 0) {
        const retPct = Math.round((shsRetained / shsWithEduData.length) * 100);
        setShsRetentionRate(`${retPct}%`);
        setShsRetentionSub(`${shsRetained} of ${shsWithEduData.length} continued studies`);
      } else {
        setShsRetentionRate('N/A');
        setShsRetentionSub('No education data yet');
      }

      // ── SHS Post-Graduation Path chart — ported from Admin's exact
      // bucketing logic (pursued_nu_branch / nu_branch / school_name) ───────
      const postGradCounts = {};
      shsSurveyRows.forEach(r => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return;

        let bucket = '';
        if (edu.pursued_nu_branch === 'Yes') {
          bucket = (edu.nu_branch || '').trim();
        } else if (edu.pursued_nu_branch === 'No') {
          bucket = (edu.school_name || '').trim();
        }

        if (!bucket) return;
        postGradCounts[bucket] = (postGradCounts[bucket] || 0) + 1;
      });
      setShsPostGradPathData(
        Object.entries(postGradCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
      );

      // ── SHS Continued Studies chart — ported from Admin's exact
      // bucketing logic (pursued_nu_branch / pursued_other_school) ─────────
      let shsContinuedAtNu = 0, shsContinuedElsewhere = 0, shsDidNotContinue = 0;
      shsSurveyRows.forEach(r => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return;

        if (edu.pursued_nu_branch === 'Yes') {
          shsContinuedAtNu++;
        } else if (edu.pursued_nu_branch === 'No' && edu.pursued_other_school === 'Yes') {
          shsContinuedElsewhere++;
        } else {
          shsDidNotContinue++;
        }
      });
      setShsContinuedStudiesData(
        [
          { name: 'Continued at NU', value: shsContinuedAtNu },
          { name: 'Continued Elsewhere', value: shsContinuedElsewhere },
          { name: 'Did Not Continue', value: shsDidNotContinue },
        ].filter(d => d.value > 0)
      );

      // ── SHS Institutional KPI tab values — ported from Admin's exact
      // field logic (pursued_other_school / pursued_nu_branch) ──────────────
      const shsWithEduRows = shsSurveyRows.filter(r => r.shs_educational_background_data !== null);

      const shsPursuedUndergrad = shsWithEduRows.filter(r => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return false;
        return edu.pursued_other_school === 'Yes';
      }).length;
      const shsPursuedUndergradPct = shsWithEduRows.length > 0
        ? Math.round((shsPursuedUndergrad / shsWithEduRows.length) * 100) : 0;

      const shsPursuedUndergradNu = shsWithEduRows.filter(r => {
        const edu = safeParse(r.shs_educational_background_data);
        if (!edu) return false;
        return edu.pursued_nu_branch === 'Yes';
      }).length;
      const shsPursuedUndergradNuPct = shsWithEduRows.length > 0
        ? Math.round((shsPursuedUndergradNu / shsWithEduRows.length) * 100) : 0;

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

        seniorrhigh: institutionalKpis.seniorrhigh.map(kpi => {
          switch (kpi.id) {
            case 'shs_pursued_undergrad':
              return {
                ...kpi,
                value: `${shsPursuedUndergradPct}%`,
                progress: shsPursuedUndergradPct,
                targetLabel: `Goal: 100% (${shsPursuedUndergrad} of ${shsWithEduRows.length})`,
              };
            case 'shs_pursued_undergrad_nu':
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

  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingCharts(true);

      try {
        const { data: predictions, error: predError } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true });

        if (!predError && predictions && predictions.length > 0) {
          const programs   = [...new Set(predictions.map(p => p.program))];
          const latestYear = Math.max(...predictions.map(p => p.year));

          const alignmentByProgram = programs.map(program => {
            const programPredictions = predictions.filter(p => p.program === program);
            const latest = programPredictions.find(p => p.year === latestYear);
            return { name: program, alignment: latest?.predicted_rate || 0 };
          }).sort((a, b) => b.alignment - a.alignment);
          setEmploymentAlignmentData(alignmentByProgram.slice(0, 6));

          // Ported from Admin: slice to top 10, matching Admin exactly.
          setCareerAlignmentData(buildCareerAlignmentData(predictions).slice(0, 10));

        } else if (predError) {
          console.error('Predictions fetch error:', predError.message);
        }

        const { data: surveyData } = await supabase
          .from('survey_progress')
          .select('user_id, employment_information_data, skills_competencies_data');

        const { data: userPrograms } = await supabase
          .from('users')
          .select('id, program')
          .eq('role', 'alumni');

        const collegeUserIds = new Set(
          (userPrograms ?? []).filter(u => isCollegeProgram(u.program)).map(u => u.id)
        );

        const employmentStatuses = {
          'Employed': 0, 'Unemployed': 0, 'Self-Employed': 0, 'Student': 0, 'Contractual': 0,
        };

        surveyData?.forEach(row => {
          if (!collegeUserIds.has(row.user_id)) return;
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

        // ── Most In-Demand Skills ─────────────────────────────────────────
        // Correct source: survey_progress.skills_competencies_data.useful_competencies
        // for college alumni. Counts how frequently each of the five canonical
        // competency categories is reported as a "useful competency" across
        // college alumni survey responses. Naming variants for the same
        // category (see normalizeSkillCategory) are collapsed into one
        // category rather than creating duplicates or being dropped. If no
        // alumnus has recorded useful_competencies yet, skillCount stays
        // empty and the chart renders its existing empty state — no
        // fabricated skills or counts are introduced.
        const skillCount = {};

        surveyData?.forEach(row => {
          if (!collegeUserIds.has(row.user_id)) return;
          const skillsParsed = safeParse(row.skills_competencies_data);
          if (!skillsParsed) return;
          const usefulCompetencies = Array.isArray(skillsParsed.useful_competencies)
            ? skillsParsed.useful_competencies
            : [];
          usefulCompetencies.forEach(rawCategory => {
            const category = normalizeSkillCategory(rawCategory);
            if (!category) return;
            skillCount[category] = (skillCount[category] || 0) + 1;
          });
        });

        setInDemandSkillsData(
          Object.entries(skillCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({ name, count }))
        );

      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchChartData();
  }, []);

  // ── College — matches Admin's exact card set: Registered Alumni, Survey
  // Response Rate, Employment Rate, Alumni Satisfaction. "Active Programs"
  // has been removed from this row since it has no Admin equivalent and
  // would make Super Admin's College dashboard diverge from Admin's.
  const kpis2 = [
    { label: "Registered Alumni",    value: alumniCount,          sub: alumniSubText      },
    { label: "Survey Response Rate", value: surveyCompletionRate, sub: surveySubText      },
    { label: "Employment Rate",      value: employmentRate,       sub: employmentRateSub  },
    { label: "Alumni Satisfaction",  value: alumniSatisfaction,   sub: satisfactionSub    },
  ];

  const shsKpis = [
    { label: "Registered Alumni",    value: shsAlumniCount,          sub: shsAlumniSubText   },
    { label: "Survey Response Rate", value: shsSurveyCompletionRate, sub: shsSurveySubText   },
    { label: "Retention Rate",       value: shsRetentionRate,        sub: shsRetentionSub    },
    { label: "Alumni Satisfaction",  value: shsAlumniSatisfaction,   sub: shsSatisfactionSub },
  ];

  return (
    <SuperAdminDashboardView
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
      kpiInsights={kpiInsights}
      alumniType={alumniType}
      shsPostGradPathData={shsPostGradPathData}
      shsContinuedStudiesData={shsContinuedStudiesData}
    />
  );
};

export default SuperAdminDashboard;