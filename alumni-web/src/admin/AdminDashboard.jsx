// ============================================================================
// THIS IS FOR LOGIC.
// ============================================================================
// Purpose: Handles all business logic, Supabase API calls, data processing,
//          state management, and event handlers for the admin dashboard.
//          Uses friend's UI design with my backend logic.
// ============================================================================

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AdminDashboardView from "./views/AdminDashboardview";

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
// INSTITUTIONAL KPIs STRUCTURE - 9 KPIs across 3 tabs (3 each)
// Values will be populated from Supabase data
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
    },
    {
      id: "employment_two_years",
      category: "Employment",
      label: "Employed Within 2 Yrs of Graduation",
      value: "0%", progress: 0, target: 85,
      targetLabel: "Goal: 85%",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "field_related",
      category: "Employment",
      label: "Employed in Field / Related Field",
      value: "0%", progress: 0, target: 70,
      targetLabel: "Goal: 70%",
      trend: { dir: "none", delta: "" },
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
    },
    {
      id: "entrepreneurship",
      category: "Career",
      label: "Engaged in Entrepreneurship",
      value: "0%", progress: 0, target: 0,
      targetLabel: "Goal: —",
      trend: { dir: "none", delta: "" },
    },
    {
      id: "supervisory",
      category: "Career",
      label: "Occupying Supervisory Positions",
      value: "0%", progress: 0, target: 15,
      targetLabel: "Goal: 15%",
      trend: { dir: "none", delta: "" },
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
    },
    {
      id: "nu_grad_studies",
      category: "Education",
      label: "Pursued Graduate Studies at NU",
      value: "0%", progress: 0, target: 30,
      targetLabel: "Goal: 30%",
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
                const d = r.educational_background_data;
                const parsed = typeof d === 'string' ? JSON.parse(d) : d;
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
              const d = r.feedback_university_data;
              const parsed = typeof d === 'string' ? JSON.parse(d) : d;
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
      
      // --------------------------------------------------------------------
      // 6. UPDATE INSTITUTIONAL KPIs WITH REAL DATA
      // --------------------------------------------------------------------
      // Calculate employment rate from survey data
      const { data: employmentData } = await supabase
        .from('survey_progress')
        .select('employment_information_data');
      
      let employedCount = 0;
      let totalWithEmployment = 0;
      let fieldRelatedCount = 0;
      
      employmentData?.forEach(row => {
        const empData = row.employment_information_data;
        if (empData) {
          const parsed = typeof empData === 'string' ? JSON.parse(empData) : empData;
          const status = parsed?.employment_status || parsed?.employmentStatus;
          totalWithEmployment++;
          if (status?.toLowerCase().includes('employed')) {
            employedCount++;
            // Check if job is related to degree
            const isRelated = parsed?.job_related_to_degree || parsed?.jobRelatedToDegree;
            if (isRelated === 'Yes' || isRelated === true) fieldRelatedCount++;
          }
        }
      });
      
      const employmentRatePercent = totalWithEmployment > 0 ? Math.round((employedCount / totalWithEmployment) * 100) : 0;
      const fieldRelatedPercent = employedCount > 0 ? Math.round((fieldRelatedCount / employedCount) * 100) : 0;
      
      // Update KPI data with real values
      setKpiData(prev => ({
        ...prev,
        employment: prev.employment.map(kpi => {
          if (kpi.id === 'employment_two_years') {
            return { ...kpi, value: `${employmentRatePercent}%`, progress: employmentRatePercent };
          }
          if (kpi.id === 'field_related') {
            return { ...kpi, value: `${fieldRelatedPercent}%`, progress: fieldRelatedPercent };
          }
          return kpi;
        })
      }));
    };
    
    fetchStats();
  }, []);

  // ============================ CHART DATA FETCHING ============================
  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingCharts(true);
      
      try {
        // --------------------------------------------------------------------
        // 1. FETCH PREDICTIONS DATA
        // --------------------------------------------------------------------
        const { data: predictions, error } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true });
        
        if (!error && predictions && predictions.length > 0) {
          // Employment Alignment Data
          const programs = [...new Set(predictions.map(p => p.program))];
          const latestYear = Math.max(...predictions.map(p => p.year));
          const alignmentByProgram = programs.map(program => {
            const programPredictions = predictions.filter(p => p.program === program);
            const latest = programPredictions.find(p => p.year === latestYear);
            return {
              name: program,
              alignment: latest?.predicted_rate || 0,
            };
          }).sort((a, b) => b.alignment - a.alignment);
          setEmploymentAlignmentData(alignmentByProgram.slice(0, 6));
          
          // Employment Forecast Data
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
        };

        surveyData?.forEach(row => {
          const empData = row.employment_information_data;
          if (empData) {
            const parsed = typeof empData === 'string' ? JSON.parse(empData) : empData;
            const status = parsed?.employment_status || parsed?.employmentStatus;
            if (status?.toLowerCase().includes('employed')) employmentStatuses.Employed++;
            else if (status?.toLowerCase().includes('unemployed')) employmentStatuses.Unemployed++;
            else if (status?.toLowerCase().includes('self')) employmentStatuses['Self-Employed']++;
            else if (status?.toLowerCase().includes('student')) employmentStatuses.Student++;
          }
        });

        const statusData = Object.entries(employmentStatuses)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({ name, value }));
        setEmploymentStatusData(statusData);
        
        // --------------------------------------------------------------------
        // 3. FETCH IN-DEMAND SKILLS
        // --------------------------------------------------------------------
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('tags')
          .eq('is_active', true);
        
        const skillCount = {};
        jobsData?.forEach(job => {
          if (job.tags && Array.isArray(job.tags)) {
            job.tags.forEach(tag => {
              const skill = tag.toLowerCase();
              skillCount[skill] = (skillCount[skill] || 0) + 1;
            });
          }
        });
        
        const topSkills = Object.entries(skillCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }));
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
    { label: "Registered Alumni",    value: alumniCount, sub: alumniSubText },
    { label: "Survey Response Rate", value: surveyCompletionRate, sub: surveySubText },
    { label: "Active Programs",      value: activePrograms, sub: activeProgramsSub },
    { label: "Alumni Satisfaction",  value: alumniSatisfaction, sub: satisfactionSub },
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