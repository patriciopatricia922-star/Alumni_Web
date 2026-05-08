// ============================================================================
// AdminDashboard — Logic Controller
// ============================================================================

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AdminDashboardView from "./views/AdminDashboardView";

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
// isInternshipSource — normalised substring check
// ============================================================================
const isInternshipSource = (rawValue) => {
  const src = (rawValue || '').toLowerCase().trim();
  if (!src) return false;
  return ['internship', 'ojt', 'on-the-job', 'practicum'].some(kw => src.includes(kw));
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
// INSTITUTIONAL KPIs STRUCTURE — 9 KPIs across 3 tabs
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
};

// ============================================================================
// Prediction year constants — mirror train_model.py BASE_YEAR / END_YEAR.
//
// BASE_YEAR rows carry the observed current_rate  → used as "actual"  in chart.
// END_YEAR  rows carry the final predicted_rate   → used as "predicted" in chart.
// ============================================================================
const PREDICTION_BASE_YEAR = 2025;
const PREDICTION_END_YEAR  = 2030;

// ============================================================================
// buildCareerAlignmentData
//
// Accepts the raw rows from the `predictions` table and returns the array
// shape the CareerAlignmentChart already expects:
//   [{ program, predicted, actual, respondents }, …]
//
//   • "actual"      = current_rate  from the BASE_YEAR row per program.
//                     Falls back to predicted_rate of that same row when
//                     current_rate is null/undefined (handles legacy data).
//   • "predicted"   = predicted_rate from the END_YEAR row per program.
//   • "respondents" = number of prediction rows for the program, used by the
//                     chart tooltip to surface data-sparsity context (e.g.
//                     a program with n=1 survey respondent will show
//                     actual=100% which looks misleading without this label).
//                     NOTE: this equals the number of year-rows stored (1–6),
//                     NOT the raw survey headcount. For the raw headcount the
//                     chart would need a separate survey_progress query; this
//                     field is a lightweight proxy that at least lets the UI
//                     flag single-data-point programs.
// ============================================================================
const buildCareerAlignmentData = (predictions) => {
  if (!predictions || predictions.length === 0) return [];

  // Group by program — each program will have one row per predicted year.
  const byProgram = {};
  predictions.forEach((row) => {
    if (!byProgram[row.program]) byProgram[row.program] = [];
    byProgram[row.program].push(row);
  });

  return Object.entries(byProgram).map(([program, rows]) => {
    const sorted = [...rows].sort((a, b) => Number(a.year) - Number(b.year));

    // Earliest row → actual (observed baseline)
    const baseRow = sorted[0];
    const actual  = Math.round(baseRow.current_rate ?? baseRow.predicted_rate ?? 0);

    // Latest row → predicted (end-of-horizon forecast)
    const endRow    = sorted[sorted.length - 1];
    const predicted = Math.round(endRow.predicted_rate ?? 0);

    // Row count per program — lightweight sparsity proxy for tooltip display.
    // A program present in all 6 year-rows (2025–2030) has respondents = 6.
    // A program with only 1 row was likely added mid-cycle or has sparse data.
    const respondents = sorted.length;

    return { program, predicted, actual, respondents };
  });
};

// ============================================================================
// AdminDashboard Component
// ============================================================================
const AdminDashboard = () => {

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
          setSurveySubText(`${diff >= 0 ? '+' : ''}${diff} vs last month`);
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

      // ── 5. All 9 Institutional KPIs ───────────────────────────────────────
      const { data: allRows, error: allErr } = await supabase
        .from('survey_progress')
        .select(
          'employment_information_data, educational_background_data, alumni_engagement_data, job_experience_data'
        );

      if (allErr) {
        console.error('Institutional KPI fetch error:', allErr.message);
        return;
      }

      const parsed = (allRows ?? []).map(row => ({
        emp: safeParse(row.employment_information_data),
        edu: safeParse(row.educational_background_data),
        eng: safeParse(row.alumni_engagement_data),
        job: safeParse(row.job_experience_data),
      }));

      // Helper: is this respondent currently employed?
      const isEmployed = (emp) => {
        if (!emp) return false;
        const status = emp.employment_status || emp.employmentStatus || emp.current_employment_status || '';
        if (!status) return !!(emp.job_position || emp.company_name);
        return !UNEMPLOYED_STATUSES.has(status);
      };

      const withEmpData  = parsed.filter(r => r.emp !== null);
      const withEduData  = parsed.filter(r => r.edu !== null);
      const employedRows = withEmpData.filter(r => isEmployed(r.emp));
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
      const empWithinTwoYears = withEmpData.filter(r => isEmployed(r.emp)).length;
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
        const val = r.edu.plans_postgraduate
          || r.edu.do_you_have_plans_postgrad
          || r.edu.plansPostgraduate
          || r.edu.post_graduate_plans
          || '';
        return val === 'Yes' || val === true;
      }).length;
      const gradStudiesPct = withEduData.length > 0
        ? Math.round((gradStudiesCount / withEduData.length) * 100) : 0;

      // KPI 8: Pursued Graduate Studies at NU (pending NU-specific field)
      const nuGradStudiesPct = 0;

      // KPI 9: In Positions in Professional Organizations (count)
      const withEngData = parsed.filter(r => r.eng !== null);
      const profOrgCount = withEngData.filter(r => {
        const participates = r.eng.willing_to_participate
          || r.eng.willingness_to_participate
          || r.eng.willing_participate
          || [];
        const arr = Array.isArray(participates) ? participates : [participates];
        return arr.some(opt => opt && opt !== 'Not at all' && opt !== 'Other');
      }).length;

      // ── Employment Rate stat card ─────────────────────────────────────────
      const employedStatCount = withEmpData.filter(r => isEmployed(r.emp)).length;
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
              return { ...kpi, value: `${gradStudiesPct}%`, progress: gradStudiesPct };
            case 'nu_grad_studies':
              return { ...kpi, value: `${nuGradStudiesPct}%`, progress: nuGradStudiesPct };
            case 'prof_org':
              return { ...kpi, value: String(profOrgCount), progress: 0, targetLabel: 'N/A' };
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
  // ==========================================================================
  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingCharts(true);

      try {
        // ── 1. Predictions — Employment Alignment ─────────────────────────
        //    Also used below for Career Alignment, so we fetch once and reuse.
        const { data: predictions, error: predError } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true });

        if (!predError && predictions && predictions.length > 0) {
          // ── 1a. Employment Alignment (top-N programs by latest predicted rate)
          const programs   = [...new Set(predictions.map(p => p.program))];
          const latestYear = Math.max(...predictions.map(p => p.year));

          const alignmentByProgram = programs.map(program => {
            const programPredictions = predictions.filter(p => p.program === program);
            const latest = programPredictions.find(p => p.year === latestYear);
            return { name: program, alignment: latest?.predicted_rate || 0 };
          }).sort((a, b) => b.alignment - a.alignment);
          setEmploymentAlignmentData(alignmentByProgram.slice(0, 6));

          // ── 1b. Career Alignment Prediction
          //
          //    • actual      = current_rate of the BASE_YEAR row (observed baseline)
          //    • predicted   = predicted_rate of the END_YEAR row (model forecast)
          //    • respondents = year-row count per program, surfaced in tooltip as
          //                    a sparsity indicator (programs with very few survey
          //                    respondents may show extreme actual values like 100%
          //                    or 0% — the respondents field lets the chart tooltip
          //                    flag these as low-confidence data points).
          //
          //    All canonical programs from train_model.py / main.py that have
          //    predictions stored will appear automatically — no hard-coded list.
          setCareerAlignmentData(buildCareerAlignmentData(predictions));
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
    />
  );
};

export default AdminDashboard;