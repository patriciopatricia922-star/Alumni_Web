import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";
import AdminSidebar from './AdminSidebar';
import { supabase } from "../lib/supabase";

const kpis1 = [
  { category: "Career Services",  label: "Placement Rate",      value: "0%", progress: 0, target: 100 },
  { category: "Alumni Relations", label: "Retention Rate",      value: "0%", progress: 0, target: 100 },
  { category: "Employment",       label: "Employment Rate",     value: "0%", progress: 0, target: 100 },
  { category: "Satisfaction",     label: "Alumni Satisfaction", value: "0",  progress: 0, target: 100 },
];

const kpis2 = [
  { category: "Alumni",       label: "Registered Alumni",    value: "—", sub: "loading..." },
  { category: "Survey",       label: "Survey Response Rate", value: "—", sub: "loading..." },
  { category: "Program",      label: "Active Programs",      value: "—", sub: "from survey responses" },
  { category: "Satisfaction", label: "Alumni Satisfaction",  value: "—", sub: "based on feedback" },
];

// ─── EMPTY CHART PLACEHOLDER ──────────────────────────────────────────────────
function EmptyChart({ height = 280 }) {
  return (
    <div style={{
      height, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#F8FAFC", borderRadius: 10,
      border: "1px dashed #CBD5E1", gap: 8,
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      <span style={{ fontFamily: "Arimo", fontSize: 13, color: "#94A3B8" }}>No data available yet</span>
    </div>
  );
}

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#FFFFFF", border: "0.889px solid #9E9E9E", borderRadius: 10, ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, badge }) {
  return (
    <div style={{ padding: "24px 24px 0", borderBottom: "0.889px solid #9E9E9E", paddingBottom: 16 }}>
      <div style={{ fontFamily: "Arimo", fontWeight: 700, fontSize: 18, color: "#101828" }}>{title}</div>
      {subtitle && <div style={{ fontFamily: "Arimo", fontWeight: 400, fontSize: 14, color: "#000000", marginTop: 2 }}>{subtitle}</div>}
      {badge && <div style={{ fontFamily: "Arimo", fontWeight: 400, fontSize: 12, color: "#00A63E", marginTop: 2 }}>{badge}</div>}
    </div>
  );
}

// ─── KPI CARD (with progress bar) ─────────────────────────────────────────────
function KpiProgressCard({ category, label, value, progress, target }) {
  return (
    <Card style={{ width: "calc(25% - 12px)", padding: "16px 18px 14px" }}>
      <div style={{ fontFamily: "Arimo", fontWeight: 700, fontSize: 12, color: "#90A1B9", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 2 }}>{category}</div>
      <div style={{ fontFamily: "Arimo", fontWeight: 700, fontSize: 16, color: "#314158", marginBottom: 12 }}>{label}</div>
      <div style={{ fontFamily: "Arimo", fontWeight: 700, fontSize: 24, color: "#0F172B", marginBottom: 8 }}>{value}</div>
      <div style={{ height: 6, background: "#F1F5F9", borderRadius: 999, overflow: "hidden", marginBottom: 4 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#00BC7D", borderRadius: 999 }} />
      </div>
      <div style={{ fontFamily: "Arimo", fontSize: 12, color: "#62748E", textAlign: "right" }}>Target: {target}%</div>
    </Card>
  );
}

// ─── KPI CARD (stat) ──────────────────────────────────────────────────────────
function KpiStatCard({ label, value, sub }) {
  return (
    <Card style={{ width: "calc(25% - 12px)", padding: "20px 18px 14px" }}>
      <div style={{ fontFamily: "Arimo", fontWeight: 400, fontSize: 14, color: "#6A7282" }}>{label}</div>
      <div style={{ fontFamily: "Arimo", fontWeight: 700, fontSize: 30, color: "#101828", margin: "4px 0" }}>{value}</div>
      <div style={{ fontFamily: "Arimo", fontSize: 12, color: "#00A63E" }}>{sub}</div>
    </Card>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [alumniCount, setAlumniCount] = useState('\u2014');
  const [surveyCompletionRate, setSurveyCompletionRate] = useState('\u2014');
  const [alumniSubText, setAlumniSubText] = useState('loading...');
  const [surveySubText, setSurveySubText] = useState('loading...');
  const [activePrograms, setActivePrograms] = useState('\u2014');
  const [activeProgramsSub, setActiveProgramsSub] = useState('from survey responses');
  const [alumniSatisfaction, setAlumniSatisfaction] = useState('\u2014');
  const [satisfactionSub, setSatisfactionSub] = useState('based on feedback');

  const SATISFACTION_SCORE = {
    'Very satisfied':    5,
    'Satisfied':         4,
    'Neutral':           3,
    'Dissatisfied':      2,
    'Very Dissatisfied': 1,
  };

  useEffect(() => {
    const fetchStats = async () => {
      const { count: alumniTotal, error: alumniErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni');
      if (!alumniErr) setAlumniCount(String(alumniTotal ?? 0));
      else console.error('Alumni count error:', alumniErr.message);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: newThisMonth, error: newErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'alumni')
        .gte('created_at', startOfMonth);
      if (!newErr) setAlumniSubText(`+${newThisMonth ?? 0} new this month`);

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

      // ── Active Programs ───────────────────────────────────────────────────
      try {
        const { data: eduRows } = await supabase
          .from('survey_progress')
          .select('educational_background_data')
          .not('educational_background_data', 'is', null);
        if (eduRows) {
          const programs = new Set(
            eduRows.map(r => r.educational_background_data?.degreeProgram).filter(Boolean)
          );
          const count = programs.size;
          setActivePrograms(String(count));
          setActiveProgramsSub(count === 1 ? '1 unique program' : `${count} unique programs`);
        }
      } catch (e) { console.error('Active programs error:', e); }

      // ── Alumni Satisfaction ───────────────────────────────────────────────
      try {
        const { data: feedbackRows } = await supabase
          .from('survey_progress')
          .select('feedback_university_data')
          .not('feedback_university_data', 'is', null);
        if (feedbackRows) {
          const scores = feedbackRows
            .map(r => SATISFACTION_SCORE[r.feedback_university_data?.satisfaction])
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "rgba(225,236,247,0.95)", fontFamily: "Arimo" }}>
      <AdminSidebar />

      <main style={{ marginLeft: 229, flex: 1, padding: "37px 32px 60px", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "Arimo", fontWeight: 700, fontSize: 30, color: "#324D87", lineHeight: "36px" }}>Dashboard Overview</div>
          <div style={{ fontFamily: "Arimo", fontSize: 16, color: "#6A7282", marginTop: 4 }}>Welcome bark! Here's what's happening with your alumni.</div>
        </div>

        {/* Section: Institution's KPIs */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Arimo", fontWeight: 700, fontSize: 18, color: "#0F172B", marginBottom: 12 }}>Institution's KPIs</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {kpis1.map((k) => <KpiProgressCard key={k.label} {...k} />)}
          </div>
        </div>

        {/* Section: Alumni Tracer */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "Arimo", fontWeight: 700, fontSize: 18, color: "#0F172B", marginBottom: 12 }}>Alumni Tracer</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {kpis2.map((k) => (
              <KpiStatCard
                key={k.label}
                {...k}
                value={
                  k.label === 'Registered Alumni'    ? alumniCount :
                  k.label === 'Survey Response Rate' ? surveyCompletionRate :
                  k.label === 'Active Programs'      ? activePrograms :
                  k.label === 'Alumni Satisfaction'  ? alumniSatisfaction :
                  k.value
                }
                sub={
                  k.label === 'Registered Alumni'    ? alumniSubText :
                  k.label === 'Survey Response Rate' ? surveySubText :
                  k.label === 'Active Programs'      ? activeProgramsSub :
                  k.label === 'Alumni Satisfaction'  ? satisfactionSub :
                  k.sub
                }
              />
            ))}
          </div>
        </div>

        {/* Employment Charts row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Card style={{ flex: 1 }}>
            <CardHeader title="Employment Alignment Rate" subtitle="Percentage of employed alumni per program" />
            <div style={{ padding: "16px 24px 24px" }}>
              <EmptyChart height={200} />
            </div>
          </Card>

          <Card style={{ flex: 1 }}>
            <CardHeader title="Employment Status Distribution" />
            <div style={{ padding: "16px 24px 24px" }}>
              <EmptyChart height={200} />
            </div>
          </Card>
        </div>

        {/* Program Performance */}
        <Card style={{ marginBottom: 24 }}>
          <CardHeader title="Program Performance" subtitle="Employment rate per program per period" />
          <div style={{ padding: "16px 24px 24px" }}>
            <EmptyChart height={280} />
          </div>
        </Card>

        {/* Most In-Demand Skills */}
        <Card style={{ marginBottom: 24 }}>
          <CardHeader title="Most In-Demand Skills" subtitle="Top skills required by employers" />
          <div style={{ padding: "16px 24px 24px" }}>
            <EmptyChart height={200} />
          </div>
        </Card>

        {/* Employment Probability Forecast */}
        <Card style={{ marginBottom: 24 }}>
          <CardHeader title="Employment Probability Forecast" subtitle="Predicted employment outcomes" />
          <div style={{ padding: "16px 24px 24px" }}>
            <EmptyChart height={280} />
          </div>
        </Card>

      </main>
    </div>
  );
}