import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminDashboard.css";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Empty Chart Placeholder
const EmptyChart = ({ height = 280 }) => (
  <div className="empty-chart" style={{ height: `${height}px` }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
    <span>No data available yet</span>
  </div>
);

// Chart Card Component
const ChartCard = ({ title, subtitle, children }) => (
  <div className="chart-card">
    <div className="chart-card-header">
      <div className="chart-card-title">{title}</div>
      {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
    </div>
    <div className="chart-container">
      {children}
    </div>
  </div>
);

// KPI Progress Card
const KpiProgressCard = ({ category, label, value, progress, target }) => (
  <div style={{ 
    background: "#FFFFFF", 
    border: "0.889px solid #9E9E9E", 
    borderRadius: 10, 
    width: "calc(25% - 12px)", 
    padding: "16px 18px 14px" 
  }}>
    <div style={{ 
      fontFamily: "Lexend, Arimo, Arial", 
      fontWeight: 700, 
      fontSize: 12, 
      color: "#90A1B9", 
      letterSpacing: "0.6px", 
      textTransform: "uppercase", 
      marginBottom: 2 
    }}>{category}</div>
    <div style={{ 
      fontFamily: "Lexend, Arimo, Arial", 
      fontWeight: 700, 
      fontSize: 16, 
      color: "#314158", 
      marginBottom: 12 
    }}>{label}</div>
    <div style={{ 
      fontFamily: "Lexend, Arimo, Arial", 
      fontWeight: 700, 
      fontSize: 24, 
      color: "#0F172B", 
      marginBottom: 8 
    }}>{value}</div>
    <div style={{ height: 6, background: "#F1F5F9", borderRadius: 999, overflow: "hidden", marginBottom: 4 }}>
      <div style={{ width: `${progress}%`, height: "100%", background: "#00BC7D", borderRadius: 999 }} />
    </div>
    <div style={{ 
      fontFamily: "Lexend, Arimo, Arial", 
      fontSize: 12, 
      color: "#62748E", 
      textAlign: "right" 
    }}>Target: {target}%</div>
  </div>
);

// KPI Stat Card Icons
const statCardIcons = {
  'Registered Alumni': {
    bg: '#EFF6FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  'Survey Response Rate': {
    bg: '#F0FDF4',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  'Active Programs': {
    bg: '#F5F3FF',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  'Alumni Satisfaction': {
    bg: '#FFFBEB',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
};

// KPI Stat Card
const KpiStatCard = ({ label, value, sub }) => {
  const iconData = statCardIcons[label];
  return (
    <div style={{ 
      background: "#FFFFFF", 
      border: "0.889px solid #9E9E9E", 
      borderRadius: 10, 
      width: "calc(25% - 12px)", 
      padding: "20px 18px 14px" 
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontFamily: "Lexend, Arimo, Arial", 
            fontWeight: 400, 
            fontSize: 14, 
            color: "#6A7282" 
          }}>{label}</div>
          <div style={{ 
            fontFamily: "Lexend, Arimo, Arial", 
            fontWeight: 700, 
            fontSize: 30, 
            color: "#101828", 
            margin: "4px 0" 
          }}>{value}</div>
          <div style={{ 
            fontFamily: "Lexend, Arimo, Arial", 
            fontSize: 12, 
            color: "#00A63E" 
          }}>{sub}</div>
        </div>
        {iconData && (
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: iconData.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginLeft: 12,
          }}>
            {iconData.icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Bar Chart Component
const CustomBarChart = ({ data, dataKey, nameKey, title, subtitle, height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <EmptyChart height={height} />
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey={dataKey} fill="#3B82F6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// Pie Chart Component
const CustomPieChart = ({ data, title, subtitle, height = 280 }) => {
  // Filter out zero values
  const filteredData = data?.filter(d => d.value > 0) || [];
  
  if (!filteredData || filteredData.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <EmptyChart height={height} />
      </ChartCard>
    );
  }

  // Custom label renderer to prevent overlap
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.15;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#475569" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontFamily="Arimo, sans-serif"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} alumni`} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// Line Chart Component
const CustomLineChart = ({ data, dataKey, xKey, title, subtitle, height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <EmptyChart height={height} />
      </ChartCard>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// Main View
const AdminDashboardView = ({
  kpis1,
  kpis2,
  employmentAlignmentData,
  employmentStatusData,
  programPerformanceData,
  inDemandSkillsData,
  employmentForecastData,
  loadingCharts,
}) => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "rgba(225,236,247,0.95)", fontFamily: "Lexend, Arimo, Arial" }}>
      <AdminSidebar />

      <main className="dashboard-main">

        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome Bark! Here's what's happening with your alumni.</p>
        </div>

        {/* Section: Institution's KPIs */}
        <div className="dashboard-section">
          <div className="section-title">Institution's KPIs</div>
          <div className="kpi-grid">
            {kpis1.map((k) => <KpiProgressCard key={k.label} {...k} />)}
          </div>
        </div>

        {/* Section: Alumni Tracer */}
        <div className="dashboard-section">
          <div className="section-title">Alumni Tracer</div>
          <div className="kpi-grid">
            {kpis2.map((k) => <KpiStatCard key={k.label} {...k} />)}
          </div>
        </div>

        {/* Employment Alignment Rate & Employment Status Distribution */}
        <div className="charts-row">
          <CustomBarChart
            data={employmentAlignmentData}
            dataKey="alignment"
            nameKey="name"
            title="Employment Alignment Rate"
            subtitle="Percentage of employed alumni per program"
            height={280}
          />
          <CustomPieChart
            data={employmentStatusData}
            title="Employment Status Distribution"
            subtitle="Breakdown of alumni by employment type"
            height={280}
          />
        </div>

        {/* Program Performance */}
        <div className="full-width-chart">
          <CustomBarChart
            data={programPerformanceData}
            dataKey="predicted"
            nameKey="program"
            title="Program Performance"
            subtitle="Predicted employment rate per program"
            height={300}
          />
        </div>

        {/* Most In-Demand Skills & Employment Probability Forecast */}
        <div className="charts-row">
          <CustomBarChart
            data={inDemandSkillsData}
            dataKey="count"
            nameKey="name"
            title="Most In-Demand Skills"
            subtitle="Top skills required by employers"
            height={280}
          />
          <CustomLineChart
            data={employmentForecastData}
            dataKey="rate"
            xKey="year"
            title="Employment Probability Forecast"
            subtitle="Predicted employment outcomes over time"
            height={280}
          />
        </div>

      </main>
    </div>
  );
};

export default AdminDashboardView;