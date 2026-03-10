import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";
import AdminSidebar from './AdminSidebar';
import { supabase } from "../lib/supabase";

// ─── DATA ────────────────────────────────────────────────────────────────────
const xLabels = ["2023 H1", "2023 H2", "2024 H1", "2024 H2"];

const programPerfData = xLabels.map((x, i) => ({
  name: x,
  SECA: [13.23, 35.26, 90.64, 0][i],
  SASE: [57, 77.05, 37.21, 0][i],
  SBMA: [58.18, 32.11, 29.74, 0][i],
}));

const empForecastData = xLabels.map((x, i) => ({
  name: x,
  "Alignment Risk": [48.95, 97.02, 50.9, 34.02][i],
  "Delay Risk": [16.41, 98.25, 70.08, 20.06][i],
}));

const empStatusData = [
  { name: "Regular",       value: 50.61, color: "#8979FF" },
  { name: "Contractual",   value: 26.04, color: "#FF928A" },
  { name: "Part-time",     value: 23.34, color: "#3CC3DF" },
  { name: "Probationary",  value: 12.81, color: "#FFAE4C" },
  { name: "Self-employed", value: 29.32, color: "#537FF1" },
  { name: "Unemployed",    value: 24.62, color: "#6FD195" },
  { name: "Others",        value: 25.58, color: "#8C63DA" },
];

const alignmentData = [
  { name: "SECA", value: 70.65, color: "#8CB8FF" },
  { name: "SASE", value: 55.58, color: "#FFA973" },
  { name: "SBMA", value: 45.09, color: "#B273FF" },
];

const skillsData = [
  { name: "Communication",             value: 82.65, color: "#8D6FFC" },
  { name: "Information Technology",    value: 70.58, color: "#3D4046" },
  { name: "Leadership",                value: 65.04, color: "#F5A0F4" },
  { name: "Critical and Problem Solving", value: 59.03, color: "#95D6DB" },
  { name: "Professionalism",           value: 50,    color: "#230235" },
];

const kpis1 = [
  { category: "Career Services",  label: "Placement Rate",    value: "92%", progress: 92,  target: 100, icon: "👥" },
  { category: "Alumni Relations", label: "Retention Rate",    value: "90%", progress: 90,  target: 100, icon: "🤝" },
  { category: "Employment",       label: "Employment Rate",   value: "40%", progress: 40,  target: 100, icon: "💼" },
  { category: "Satisfaction",     label: "Alumni Satisfaction", value: "4.3", progress: 86, target: 100, icon: "⭐" },
];

const kpis2 = [
  { category: "Alumni",         label: "Registered Alumni",    value: "100",  sub: "+8% from last year",    icon: "👥" },
  { category: "Survey",        label: "Survey Response Rate",  value: "90%",  sub: "68% completion rate",   icon: "📋" },
  { category: "Program",       label: "Active Programs",       value: "90%",  sub: "+3% from last period",  icon: "🎓" },
  { category: "Satisfaction",  label: "Alumni Satisfaction",   value: "4.3",  sub: "+3% from last period",  icon: "⭐" },
];

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
      <div style={{ fontFamily: "Lexend, Arial", fontWeight: 700, fontSize: 18, color: "#101828" }}>{title}</div>
      {subtitle && <div style={{ fontFamily: "Lexend, Arial", fontWeight: 400, fontSize: 14, color: "#000000", marginTop: 2 }}>{subtitle}</div>}
      {badge && <div style={{ fontFamily: "Lexend, Arial", fontWeight: 400, fontSize: 12, color: "#00A63E", marginTop: 2 }}>{badge}</div>}
    </div>
  );
}

// ─── KPI CARD (with progress bar) ─────────────────────────────────────────────
function KpiProgressCard({ category, label, value, progress, target }) {
  return (
    <Card style={{ width: "calc(25% - 12px)", padding: "16px 18px 14px" }}>
      <div style={{ fontFamily: "Arimo, Arial", fontWeight: 700, fontSize: 12, color: "#90A1B9", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 2 }}>{category}</div>
      <div style={{ fontFamily: "Arimo, Arial", fontWeight: 700, fontSize: 16, color: "#314158", marginBottom: 12 }}>{label}</div>
      <div style={{ fontFamily: "Arimo, Arial", fontWeight: 700, fontSize: 24, color: "#0F172B", marginBottom: 8 }}>{value}</div>
      <div style={{ height: 6, background: "#F1F5F9", borderRadius: 999, overflow: "hidden", marginBottom: 4 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#00BC7D", borderRadius: 999 }} />
      </div>
      <div style={{ fontFamily: "Arimo, Arial", fontSize: 12, color: "#62748E", textAlign: "right" }}>Target: {target}%</div>
    </Card>
  );
}

// ─── KPI CARD (stat) ──────────────────────────────────────────────────────────
function KpiStatCard({ category, label, value, sub, iconBg = "#F2F2F2", iconColor = "#155DFC" }) {
  return (
    <Card style={{ width: "calc(25% - 12px)", padding: "20px 18px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "Lexend, Arial", fontWeight: 400, fontSize: 14, color: "#6A7282" }}>{label}</div>
          <div style={{ fontFamily: "Lexend, Arial", fontWeight: 700, fontSize: 30, color: "#101828", margin: "4px 0" }}>{value}</div>
          <div style={{ fontFamily: "Arial", fontSize: 12, color: "#00A63E" }}>{sub}</div>
        </div>
        <div style={{ width: 48, height: 48, background: iconBg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>{category === "Survey" ? "📋" : category === "Alumni" ? "👥" : category === "Program" ? "🎓" : "⭐"}</span>
        </div>
      </div>
    </Card>
  );
}

// ─── CUSTOM CHART TOOLTIP ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: "Inter, Arial" }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activePieIndex, setActivePieIndex] = useState(null);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#DAE5F1", fontFamily: "Arimo, Arial" }}>
      <AdminSidebar />

      {/* Main content */}
      <main style={{ marginLeft: 229, flex: 1, padding: "37px 40px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "Lexend, Arial", fontWeight: 700, fontSize: 30, color: "#324D87", lineHeight: "36px" }}>Dashboard Overview</div>
          <div style={{ fontFamily: "Arial", fontSize: 16, color: "#6A7282", marginTop: 4 }}>Welcome back! Here's what's happening with your alumni.</div>
        </div>

        {/* Section: Institution's KPIs */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "Arimo, Arial", fontWeight: 700, fontSize: 18, color: "#0F172B", marginBottom: 12 }}>📊 Institution's KPIs</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {kpis1.map((k) => <KpiProgressCard key={k.label} {...k} />)}
          </div>
        </div>

        {/* Section: Alumni Tracer */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: "Arimo, Arial", fontWeight: 700, fontSize: 18, color: "#0F172B", marginBottom: 12 }}>🎓 Alumni Tracer</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {kpis2.map((k) => <KpiStatCard key={k.label} {...k} />)}
          </div>
        </div>

        {/* Employment Charts row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>

          {/* Employment Alignment Rate (horizontal bar) */}
          <Card style={{ flex: 1 }}>
            <CardHeader title="Employment Alignment Rate" subtitle="Percentage of employed alumni per program" badge="+3% from 2023 — H1" />
            <div style={{ padding: "16px 24px 24px" }}>
              {alignmentData.map((d) => (
                <div key={d.name} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "Roboto, Arial", fontSize: 12, color: "#333" }}>{d.name}</span>
                    <span style={{ fontFamily: "Roboto, Arial", fontSize: 12, color: "#333" }}>{d.value}%</span>
                  </div>
                  <div style={{ height: 20, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${d.value}%`, height: "100%", background: d.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                {[0, 25, 50, 75, 100].map(v => <span key={v} style={{ fontFamily: "Roboto, Arial", fontSize: 12, color: "#333" }}>{v}</span>)}
              </div>
            </div>
          </Card>

          {/* Employment Status Distribution (pie) */}
          <Card style={{ flex: 1 }}>
            <CardHeader title="Employment Status Distribution" badge="+3% from 2023 — H1" />
            <div style={{ padding: "0 16px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <ResponsiveContainer width={220} height={260}>
                <PieChart>
                  <Pie data={empStatusData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    onMouseEnter={(_, i) => setActivePieIndex(i)}
                    onMouseLeave={() => setActivePieIndex(null)}>
                    {empStatusData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color} opacity={activePieIndex === null || activePieIndex === i ? 1 : 0.5} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {empStatusData.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "Inter, Arial", fontSize: 12, color: "rgba(0,0,0,0.7)" }}>{d.name}</span>
                    <span style={{ fontFamily: "Inter, Arial", fontSize: 12, fontWeight: 600, color: d.color, marginLeft: 4 }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Program Performance */}
        <Card style={{ marginBottom: 24 }}>
          <CardHeader title="Program Performance" subtitle="Employment rate per program per period" badge="+3% from 2023 — H1" />
          <div style={{ padding: "16px 24px 24px" }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={programPerfData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,26,0.1)" />
                <XAxis dataKey="name" tick={{ fontFamily: "Inter, Arial", fontSize: 12, fill: "rgba(0,0,0,0.7)" }} />
                <YAxis domain={[0, 100]} tick={{ fontFamily: "Inter, Arial", fontSize: 12, fill: "rgba(0,0,0,0.7)" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontFamily: "Inter, Arial", fontSize: 12 }} />
                <Line type="linear" dataKey="SECA" stroke="#8979FF" strokeWidth={1.5} dot={{ r: 4, fill: "#fff", stroke: "#8979FF", strokeWidth: 1 }} filter="drop-shadow(0px 6px 12px rgba(137,121,255,0.4))" label={{ position: "top", fontSize: 10, fill: "rgba(0,0,0,0.7)" }} />
                <Line type="linear" dataKey="SASE" stroke="#FF928A" strokeWidth={1.5} dot={{ r: 4, fill: "#fff", stroke: "#FF928A", strokeWidth: 1 }} filter="drop-shadow(0px 6px 12px rgba(255,146,138,0.4))" label={{ position: "top", fontSize: 10, fill: "rgba(0,0,0,0.7)" }} />
                <Line type="linear" dataKey="SBMA" stroke="#3CC3DF" strokeWidth={1.5} dot={{ r: 4, fill: "#fff", stroke: "#3CC3DF", strokeWidth: 1 }} filter="drop-shadow(0px 6px 12px rgba(60,195,223,0.4))" label={{ position: "top", fontSize: 10, fill: "rgba(0,0,0,0.7)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Most In-Demand Skills */}
        <Card style={{ marginBottom: 24 }}>
          <CardHeader title="Most In-Demand Skills" subtitle="Top skills required by employers" badge="+3% from 2023 — H1" />
          <div style={{ padding: "16px 24px 24px" }}>
            {skillsData.map((d) => (
              <div key={d.name} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "Roboto, Arial", fontSize: 12, color: "#333" }}>{d.name}</span>
                  <span style={{ fontFamily: "Roboto, Arial", fontSize: 12, color: "#333" }}>{d.value}%</span>
                </div>
                <div style={{ height: 20, background: "#F3F4F6", borderRadius: 0, overflow: "hidden" }}>
                  <div style={{ width: `${d.value}%`, height: "100%", background: d.color }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {[0, 25, 50, 75, 100].map(v => <span key={v} style={{ fontFamily: "Roboto, Arial", fontSize: 12, color: "#333" }}>{v}</span>)}
            </div>
          </div>
        </Card>

        {/* Employment Probability Forecast */}
        <Card style={{ marginBottom: 24 }}>
          <CardHeader title="Employment Probability Forecast" subtitle="Predicted employment outcomes" badge="+3% from 2024 — H2" />
          <div style={{ padding: "16px 24px 24px" }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={empForecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,26,0.1)" />
                <XAxis dataKey="name" tick={{ fontFamily: "Inter, Arial", fontSize: 12, fill: "rgba(0,0,0,0.7)" }} />
                <YAxis domain={[0, 200]} tick={{ fontFamily: "Inter, Arial", fontSize: 12, fill: "rgba(0,0,0,0.7)" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontFamily: "Inter, Arial", fontSize: 12 }} />
                <Line type="linear" dataKey="Alignment Risk" stroke="#8979FF" strokeWidth={1.5} dot={{ r: 4, fill: "#fff", stroke: "#8979FF", strokeWidth: 1 }} filter="drop-shadow(0px 6px 12px rgba(137,121,255,0.4))" />
                <Line type="linear" dataKey="Delay Risk"     stroke="#FF928A" strokeWidth={1.5} dot={{ r: 4, fill: "#fff", stroke: "#FF928A", strokeWidth: 1 }} filter="drop-shadow(0px 6px 12px rgba(255,146,138,0.4))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </main>
    </div>
  );
}