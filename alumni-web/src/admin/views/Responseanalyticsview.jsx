import React, { useState, useEffect } from 'react';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineChevronDown,
  HiOutlineStar,
} from 'react-icons/hi2';
import {
  FaSmile,
  FaMeh,
  FaFrown,
  FaBrain,
  FaChartLine,
} from 'react-icons/fa';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import '../styles/Responseanalytics.css';

// AI Service URL
const AI_BASE_URL = 'http://localhost:8000/api';

// ── Which overview cards show per section ─────────────────────────────────────
const SECTION_CARDS = {
  'All Sections':             ['gender','age','boardExam','certification','employment','salary','timeToJob','skills','rating','sentiment'],
  'Personal Information':     ['gender','age'],
  'Educational Information':  ['boardExam','certification'],
  'Certification Achievement':['certification'],
  'Employment Information':   ['employment','salary'],
  'Job Search Experience':    ['timeToJob'],
  'Skills & Competencies':    ['skills'],
  'Feedback & Engagement':    ['rating','sentiment'],
};

// ── Sub-components ────────────────────────────────────────────────────────────

const TabSwitcher = ({ pageTabs, activePage, setActivePage }) => (
  <div className="ra-tab-switcher-wrap">
    <div className="ra-tab-switcher">
      {pageTabs.map((tab) => (
        <button
          key={tab.key}
          className={`ra-tab-btn${activePage === tab.key ? ' active' : ''}`}
          onClick={() => setActivePage(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
);

const TopFilterRow = ({ selectedSection, setSelectedSection, sectionOptions }) => (
  <div className="ra-top-filter-row">
    <div className="ra-filter-select-wrap">
      <HiOutlineChatBubbleLeftRight size={15} className="ra-filter-left-icon" />
      <select
        className="ra-filter-select"
        value={selectedSection}
        onChange={(e) => setSelectedSection(e.target.value)}
      >
        {sectionOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <HiOutlineChevronDown size={15} className="ra-filter-right-icon" />
    </div>
  </div>
);

const CardTitle = ({ icon, title, subtitle, rightText }) => (
  <div className="ra-card-heading">
    <div className="ra-card-title-row">
      <div className="ra-card-title-left">
        {icon && <span className="ra-card-icon">{icon}</span>}
        <h3>{title}</h3>
      </div>
      {rightText && <span className="ra-card-right-text">{rightText}</span>}
    </div>
    {subtitle && <p className="ra-card-subtitle">{subtitle}</p>}
  </div>
);

const DoughnutCard = ({ title, rightText, items = [] }) => {
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0);
  let accumulated = 0;

  const gradient = total
    ? items.map((item) => {
        const start = (accumulated / total) * 100;
        accumulated += item.value || 0;
        const end = (accumulated / total) * 100;
        return `${item.color} ${start}% ${end}%`;
      }).join(', ')
    : '#E2E8F0 0% 100%';

  return (
    <section className="ra-card ra-card-half">
      <CardTitle title={title} rightText={rightText} />
      <div className="ra-doughnut-block">
        <div className="ra-doughnut-chart" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="ra-doughnut-center">
            <strong>{total}</strong>
            <span>total</span>
          </div>
        </div>
        <div className="ra-legend-inline">
          {items.map((item) => (
            <div key={item.label} className="ra-legend-inline-item">
              <span className="ra-legend-dot" style={{ background: item.color }} />
              <span>{item.label}</span>
              <span className="ra-legend-inline-pct">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RatingBreakdownCard = ({ ratingBreakdown = [] }) => (
  <section className="ra-card ra-card-half">
    <CardTitle title="Rating Breakdown" subtitle="Alumni satisfaction scores" />
    <div className="ra-rating-list">
      {ratingBreakdown.map((item) => (
        <div key={item.label} className="ra-rating-row">
          <span className="ra-rating-label">{item.label}</span>
          <div className="ra-rating-bar-track">
            <div
              className="ra-rating-bar-fill"
              style={{ width: `${item.percent}%`, background: item.color }}
            >
              {item.count > 0 && <span>{item.count}</span>}
            </div>
          </div>
          <span className="ra-rating-percent">{item.percent}%</span>
        </div>
      ))}
    </div>
  </section>
);

// ── Enhanced Overall Sentiment Card with AI Insights ──────────────────────────
const OverallSentimentCard = ({ sentiment, aiInsights, loadingAI }) => {
  const fullStars = Math.floor(sentiment?.score || 0);
  
  return (
    <section className="ra-card ra-card-half ra-sentiment-card">
      <CardTitle title="Overall Sentiment" subtitle="Average satisfaction rating" />
      
      <div className="ra-sentiment-grid">
        {/* Left side - Rating Display (centered) */}
        <div className="ra-sentiment-left">
          <div className="ra-sentiment-score">{sentiment?.score ?? 0}</div>
          <div className="ra-stars-animated">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              const isActive = starValue <= fullStars;
              return (
                <HiOutlineStar
                  key={index}
                  size={28}
                  className={`star-animated ${isActive ? 'star-filled' : 'star-empty'}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
              );
            })}
          </div>
          <div className="ra-sentiment-theme-pill">
            {(sentiment?.keyword || sentiment?.quote || 'NO FEEDBACK YET').toUpperCase()}
          </div>
        </div>
        
        {/* Right side - AI Insights */}
        <div className="ra-sentiment-right">
          <div className="ai-insights-header">
            <FaBrain size={14} />
            <span>AI INSIGHTS</span>
          </div>
          
          {loadingAI ? (
            <div className="ai-loading-section">
              <div className="ai-loading-spinner-small"></div>
              <span>Analyzing feedback...</span>
            </div>
          ) : aiInsights && aiInsights.total > 0 ? (
            <>
              <div className="ai-sentiment-distribution">
                <div className="dist-item positive">
                  <FaSmile size={12} />
                  <span>{aiInsights.sentiment.positive_percentage}%</span>
                </div>
                <div className="dist-item neutral">
                  <FaMeh size={12} />
                  <span>{aiInsights.sentiment.neutral_percentage}%</span>
                </div>
                <div className="dist-item negative">
                  <FaFrown size={12} />
                  <span>{aiInsights.sentiment.negative_percentage}%</span>
                </div>
              </div>
              
              {aiInsights.themes && aiInsights.themes.length > 0 && (
                <div className="ai-themes-row">
                  <span className="ai-label">Key themes:</span>
                  <div className="theme-chips-row">
                    {aiInsights.themes.slice(0, 3).map((theme, i) => (
                      <span key={i} className="theme-chip-mini">{theme.theme}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {aiInsights.keywords && aiInsights.keywords.length > 0 && (
                <div className="ai-keywords-row">
                  <FaChartLine size={12} className="keywords-icon" />
                  <span className="ai-label">Common topics:</span>
                  <span className="keywords-text">{aiInsights.keywords.slice(0, 5).join(', ')}</span>
                </div>
              )}
            </>
          ) : (
            <div className="ai-empty-state">
              <span>No feedback data available</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const HorizontalBarCard = ({ title, subtitle, items = [], max = 100, compact = false }) => (
  <section className={`ra-card ${compact ? 'ra-card-half' : 'ra-card-full'}`}>
    <CardTitle title={title} subtitle={subtitle} />
    <div className="ra-horizontal-chart">
      {items.map((item) => (
        <div key={item.label} className="ra-horizontal-row">
          <span className="ra-horizontal-label" title={item.label}>{item.label}</span>
          <div className="ra-horizontal-track">
            <div
              className="ra-horizontal-fill"
              style={{ width: `${max ? ((item.value || 0) / max) * 100 : 0}%`, background: item.color }}
            />
          </div>
          <span className="ra-horizontal-value">{item.value}</span>
        </div>
      ))}
    </div>
  </section>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ra-chart-tooltip">
      <div className="ra-chart-tooltip-title">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="ra-chart-tooltip-row">
          <span className="ra-chart-tooltip-dot" style={{ background: entry.color }} />
          <span>{entry.name}</span>
          <strong>{entry.value !== null && entry.value !== undefined ? `${entry.value}%` : 'No data'}</strong>
        </div>
      ))}
    </div>
  );
};

const LineChartCard = ({ title, subtitle, labels = [], series = [] }) => {
  const chartData = labels.map((label, index) => {
    const row = { label };
    series.forEach((line) => { 
      row[line.dataKey] = line.values?.[index] !== null && line.values?.[index] !== undefined 
        ? line.values[index] 
        : null; 
    });
    return row;
  });

  const hasData = chartData.some(row => 
    series.some(line => row[line.dataKey] !== null)
  );

  if (!hasData) {
    return (
      <section className="ra-card ra-card-full">
        <CardTitle title={title} subtitle={subtitle} />
        <div className="ra-empty-state">No data available for the selected period</div>
      </section>
    );
  }

  return (
    <section className="ra-card ra-card-full ra-line-chart-card">
      <div className="ra-line-chart-header">
        <div className="ra-line-chart-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.667" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <div className="ra-line-chart-title">{title}</div>
          <div className="ra-line-chart-subtitle">{subtitle}</div>
        </div>
      </div>
      
      <div className="ra-recharts-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 30, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#CCCCCC" strokeDasharray="4 4" vertical={false} />
            <XAxis 
              dataKey="label" 
              tickLine={false} 
              axisLine={{ stroke: '#666666', strokeWidth: 1 }}
              tick={{ fill: '#666666', fontSize: 11, fontFamily: 'Arimo, Arial' }}
              dy={8}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={{ stroke: '#666666', strokeWidth: 1 }}
              tick={{ fill: '#666666', fontSize: 11, fontFamily: 'Arimo, Arial' }}
              width={36}
              dx={-8}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={48}
              iconType="line"
              wrapperStyle={{ 
                color: '#475569', 
                fontSize: '13px', 
                fontFamily: 'Arimo, Arial',
                paddingTop: '16px'
              }}
              formatter={(value) => {
                if (value === 'passed') return 'Passed';
                if (value === 'failed') return 'Failed';
                if (value === 'certified') return 'Certified';
                if (value === 'uncertified') return 'No Certification';
                return value;
              }}
            />
            {series.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF', stroke: line.color }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {title === "Board Exam Pass Rate" && (
        <div className="ra-centered-legend">
          <div className="ra-legend-line">
            <div className="ra-legend-line-color" style={{ background: '#22C55E' }}></div>
            <span>Passed</span>
          </div>
          <div className="ra-legend-line">
            <div className="ra-legend-line-color" style={{ background: '#EF4444' }}></div>
            <span>Failed</span>
          </div>
        </div>
      )}
      
      {title === "Certification Status" && (
        <div className="ra-centered-legend">
          <div className="ra-legend-line">
            <div className="ra-legend-line-color" style={{ background: '#8B5CF6' }}></div>
            <span>Certified</span>
          </div>
          <div className="ra-legend-line">
            <div className="ra-legend-line-color" style={{ background: '#FB7185' }}></div>
            <span>No Certification</span>
          </div>
        </div>
      )}
    </section>
  );
};

const ResponseItem = ({ item }) => (
  <div className="ra-response-item">
    <div className="ra-response-top">
      <div>
        <h4>{item.respondent}</h4>
        <p>{item.section}</p>
      </div>
      <div className="ra-response-meta">
        <div className="ra-response-stars">
          {[...Array(5)].map((_, index) => (
            <HiOutlineStar key={index} size={14} className={index < item.rating ? 'filled' : ''} />
          ))}
        </div>
        <span>{item.submitted}</span>
      </div>
    </div>
    <p className="ra-response-text">{item.response}</p>
  </div>
);

// ── Overview page with section-aware filtering ────────────────────────────────
const SurveyOverviewPage = ({
  overviewCards,
  ratingBreakdown,
  selectedSection,
  setSelectedSection,
  sectionOptions,
}) => {
  const visible = SECTION_CARDS[selectedSection] || SECTION_CARDS['All Sections'];
  const show = (key) => visible.includes(key);
  
  // AI Insights state
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);
  
  // Fetch AI insights
  useEffect(() => {
    const fetchAIInsights = async () => {
      setLoadingAI(true);
      try {
        const response = await fetch(`${AI_BASE_URL}/ai/feedback-insights`);
        const data = await response.json();
        if (data.status === 'success') {
          setAiInsights(data);
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAIInsights();
  }, []);
  
  return (
    <div className="ra-content-stack">
      <TopFilterRow
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        sectionOptions={sectionOptions}
      />

      {/* Personal ──────────────────────────────────── */}
      {(show('gender') || show('age')) && (
        <div className="ra-grid-two">
          {show('gender') && (
            <DoughnutCard title="Gender Distribution" rightText="%" items={overviewCards.genderDistribution} />
          )}
          {show('age') && (
            <HorizontalBarCard
              title="Age Distribution"
              subtitle="Based on birthdays from saved survey responses"
              items={overviewCards.ageDistribution}
              max={overviewCards.ageDistributionMax}
              compact
            />
          )}
        </div>
      )}

      {/* Educational ───────────────────────────────── */}
      {show('boardExam') && overviewCards.boardExamPassRate && (
        <LineChartCard
          title="Board Exam Pass Rate"
          subtitle="Survey entries with board exam results"
          labels={overviewCards.boardExamPassRate.labels}
          series={[
            { dataKey: 'passed', name: 'passed', color: '#22C55E', values: overviewCards.boardExamPassRate.passed },
            { dataKey: 'failed', name: 'failed', color: '#EF4444', values: overviewCards.boardExamPassRate.failed },
          ]}
        />
      )}

      {show('certification') && overviewCards.certificationStatus && (
        <LineChartCard
          title="Certification Status"
          subtitle="Survey entries grouped by graduation or submission year"
          labels={overviewCards.certificationStatus.labels}
          series={[
            { dataKey: 'certified', name: 'certified', color: '#8B5CF6', values: overviewCards.certificationStatus.certified },
            { dataKey: 'uncertified', name: 'uncertified', color: '#FB7185', values: overviewCards.certificationStatus.uncertified },
          ]}
        />
      )}

      {/* Employment ────────────────────────────────── */}
      {(show('employment') || show('salary')) && (
        <div className="ra-grid-two">
          {show('employment') && (
            <DoughnutCard title="Employment Status" rightText="%" items={overviewCards.employmentStatus} />
          )}
          {show('salary') && (
            <HorizontalBarCard
              title="Salary Range"
              items={overviewCards.salaryRange}
              max={overviewCards.salaryRangeMax}
              compact
            />
          )}
        </div>
      )}

      {/* Job Search ────────────────────────────────── */}
      {show('timeToJob') && (
        <HorizontalBarCard
          title="Time to First Job"
          subtitle="Based on saved survey responses"
          items={overviewCards.timeToFirstJob}
          max={overviewCards.timeToFirstJobMax}
        />
      )}

      {/* Skills ────────────────────────────────────── */}
      {show('skills') && (
        <HorizontalBarCard
          title="Top Skills"
          subtitle="Most mentioned competencies from alumni responses"
          items={overviewCards.topSkills}
          max={overviewCards.topSkillsMax}
        />
      )}

      {/* Feedback ──────────────────────────────────── */}
      {(show('rating') || show('sentiment')) && (
        <div className="ra-grid-two">
          {show('rating') && <RatingBreakdownCard ratingBreakdown={ratingBreakdown} />}
          {show('sentiment') && (
            <OverallSentimentCard 
              sentiment={overviewCards.sentiment} 
              aiInsights={aiInsights}
              loadingAI={loadingAI}
            />
          )}
        </div>
      )}

      {/* Empty state when a section has no charts */}
      {visible.length === 0 && (
        <section className="ra-card ra-card-full">
          <p className="ra-inline-message">No charts available for this section.</p>
        </section>
      )}
    </div>
  );
};

const SurveyResponsesPage = ({
  surveyResponses,
  selectedSection,
  setSelectedSection,
  sectionOptions,
}) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);
  
  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const response = await fetch(`${AI_BASE_URL}/ai/feedback-insights`);
        const data = await response.json();
        if (data.status === 'success') {
          setAiInsights(data);
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAIInsights();
  }, []);
  
  return (
    <div className="ra-content-stack">
      <TopFilterRow
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        sectionOptions={sectionOptions}
      />
      
      {/* AI Summary Banner */}
      {!loadingAI && aiInsights && aiInsights.total > 0 && (
        <div className="ai-summary-banner">
          <div className="ai-summary-icon">
            <FaBrain size={18} />
          </div>
          <div className="ai-summary-text">
            <strong>AI Summary:</strong> {aiInsights.summary}
          </div>
        </div>
      )}
      
      <section className="ra-card ra-card-full">
        <CardTitle
          title="Survey Responses"
          subtitle="View individual alumni feedback and response entries"
        />
        <div className="ra-response-list">
          {surveyResponses.length ? (
            surveyResponses.map((item) => <ResponseItem key={item.id} item={item} />)
          ) : (
            <div className="ra-empty-state">No response entries found for this section yet.</div>
          )}
        </div>
      </section>
    </div>
  );
};

// ── Main view ─────────────────────────────────────────────────────────────────
const Responseanalyticsview = ({
  activePage,
  setActivePage,
  pageTabs,
  overviewCards,
  ratingBreakdown,
  surveyResponses,
  selectedSection,
  setSelectedSection,
  sectionOptions,
  loading,
  error,
  sidebar,
}) => (
  <div className="ra-layout">
    {sidebar}
    <main className="ra-main">
      <div className="ra-page-header">
        <h1>Response &amp; Analytics</h1>
        <p>View and analyze survey responses</p>
      </div>

      <TabSwitcher pageTabs={pageTabs} activePage={activePage} setActivePage={setActivePage} />

      {/* Scrollable Content Wrapper - ADD THIS */}
      <div className="ra-content-scroll">
        {loading ? (
          <section className="ra-card ra-card-full">
            <p className="ra-inline-message">Loading survey analytics…</p>
          </section>
        ) : error ? (
          <section className="ra-card ra-card-full">
            <p className="ra-inline-message ra-inline-message-error">{error}</p>
          </section>
        ) : activePage === 'overview' ? (
          <SurveyOverviewPage
            overviewCards={overviewCards}
            ratingBreakdown={ratingBreakdown}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            sectionOptions={sectionOptions}
          />
        ) : (
          <SurveyResponsesPage
            surveyResponses={surveyResponses}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            sectionOptions={sectionOptions}
          />
        )}
      </div>
    </main>
  </div>
);

export default Responseanalyticsview;