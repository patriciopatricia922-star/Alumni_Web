import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AdminDashboardView from "./views/AdminDashboardview";

const SATISFACTION_SCORE = {
  'Very Satisfied':    5,
  'Very satisfied':    5,
  'Satisfied':         4,
  'Neutral':           3,
  'Dissatisfied':      2,
  'Very Dissatisfied': 1,
  'Very dissatisfied': 1,
};

const AdminDashboard = () => {
  const [alumniCount, setAlumniCount] = useState('—');
  const [surveyCompletionRate, setSurveyCompletionRate] = useState('—');
  const [alumniSubText, setAlumniSubText] = useState('loading...');
  const [surveySubText, setSurveySubText] = useState('loading...');
  const [activePrograms, setActivePrograms] = useState('—');
  const [activeProgramsSub, setActiveProgramsSub] = useState('from survey responses');
  const [alumniSatisfaction, setAlumniSatisfaction] = useState('—');
  const [satisfactionSub, setSatisfactionSub] = useState('based on feedback');
  const [employmentRate, setEmploymentRate] = useState('0%');
  const [employmentRateInt, setEmploymentRateInt] = useState(0);
  
  // Chart data states
  const [employmentAlignmentData, setEmploymentAlignmentData] = useState([]);
  const [employmentStatusData, setEmploymentStatusData] = useState([]);
  const [programPerformanceData, setProgramPerformanceData] = useState([]);
  const [inDemandSkillsData, setInDemandSkillsData] = useState([]);
  const [employmentForecastData, setEmploymentForecastData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch alumni count
      const { count: alumniTotal, error: alumniErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni');
      if (!alumniErr) setAlumniCount(String(alumniTotal ?? 0));
      else console.error('Alumni count error:', alumniErr.message);

      // Fetch new alumni this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: newThisMonth, error: newErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni')
        .gte('created_at', startOfMonth);
      if (!newErr) setAlumniSubText(`+${newThisMonth ?? 0} new this month`);

      // Fetch survey completion
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

      // Fetch active programs
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

      // Fetch alumni satisfaction
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
    };
    fetchStats();
  }, []);

  // Fetch chart data from predictions
  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingCharts(true);
      
      try {
        // Fetch predictions from your predictive analytics model
        const { data: predictions, error } = await supabase
          .from('predictions')
          .select('*')
          .order('year', { ascending: true });
        
        if (error) throw error;
        
        if (predictions && predictions.length > 0) {
          // Calculate employment rate
          const totalPrograms = predictions.length;
          const employedCount = predictions.filter(p => (p.predicted_rate || 0) > 60).length;
          const empRate = totalPrograms > 0 ? Math.round((employedCount / totalPrograms) * 100) : 0;
          setEmploymentRate(`${empRate}%`);
          setEmploymentRateInt(empRate);
          
          // 1. Employment Alignment Data (by program)
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
          
          // In AdminDashboard.jsx, update the employment status distribution section:

          // 2. Employment Status Distribution
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

          // Only include statuses with values > 0
          const statusData = Object.entries(employmentStatuses)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));

          setEmploymentStatusData(statusData);
          // 3. Program Performance Data
          const currentYear = Math.min(...predictions.map(p => p.year));
          const programPerformance = programs.map(program => {
            const programPredictions = predictions.filter(p => p.program === program);
            const predicted = programPredictions.find(p => p.year === latestYear);
            return {
              program,
              predicted: predicted?.predicted_rate || 0,
            };
          }).sort((a, b) => b.predicted - a.predicted);
          setProgramPerformanceData(programPerformance.slice(0, 5));
          
          // 4. Most In-Demand Skills
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
          
          // 5. Employment Probability Forecast
          const years = [...new Set(predictions.map(p => p.year))].sort();
          const avgByYear = years.map(year => {
            const yearPredictions = predictions.filter(p => p.year === year);
            const avg = yearPredictions.reduce((sum, p) => sum + (p.predicted_rate || 0), 0) / yearPredictions.length;
            return { year: String(year), rate: Math.round(avg) };
          });
          setEmploymentForecastData(avgByYear);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setLoadingCharts(false);
      }
    };
    
    fetchChartData();
  }, []);

  const kpis1 = [
    { category: "Career Services",  label: "Placement Rate",      value: surveyCompletionRate, progress: parseInt(surveyCompletionRate) || 0, target: 100 },
    { category: "Alumni Relations", label: "Retention Rate",      value: "0%", progress: 0, target: 100 },
    { category: "Employment",       label: "Employment Rate",     value: employmentRate, progress: employmentRateInt, target: 100 },
    { category: "Satisfaction",     label: "Alumni Satisfaction", value: alumniSatisfaction, progress: Math.round(parseFloat(alumniSatisfaction) * 20) || 0, target: 100 },
  ];

  const kpis2 = [
    { category: "Alumni",       label: "Registered Alumni",    value: alumniCount, sub: alumniSubText },
    { category: "Survey",       label: "Survey Response Rate", value: surveyCompletionRate, sub: surveySubText },
    { category: "Program",      label: "Active Programs",      value: activePrograms, sub: activeProgramsSub },
    { category: "Satisfaction", label: "Alumni Satisfaction",  value: alumniSatisfaction, sub: satisfactionSub },
  ];

  return (
    <AdminDashboardView
      kpis1={kpis1}
      kpis2={kpis2}
      employmentAlignmentData={employmentAlignmentData}
      employmentStatusData={employmentStatusData}
      programPerformanceData={programPerformanceData}
      inDemandSkillsData={inDemandSkillsData}
      employmentForecastData={employmentForecastData}
      loadingCharts={loadingCharts}
    />
  );
};

export default AdminDashboard;