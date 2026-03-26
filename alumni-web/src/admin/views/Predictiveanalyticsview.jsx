import React from 'react';
import '../styles/Predictiveanalytics.css';
import {
  HiOutlineChartBar,
  HiOutlineBuildingOffice2,
  HiOutlineArrowTrendingUp,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import { LuArrowUpRight, LuArrowRight } from 'react-icons/lu';


const PageTabIcon = ({ type, active }) => {
  const color = active ? '#155DFC' : '#90A1B9';

  if (type === 'overview') {
    return <HiOutlineChartBar size={16} color={color} />;
  }

  if (type === 'departments') {
    return <HiOutlineBuildingOffice2 size={16} color={color} />;
  }

  return <HiOutlineArrowTrendingUp size={16} color={color} />;
};

const BreadcrumbArrow = () => <HiOutlineChevronRight 
    size={14} color="#90A1B9" />;


const TrendBadge = ({ change }) => (
  <span className="pa-trend-badge">
    <LuArrowUpRight size={12} color="#009966" />
    +{change}%
  </span>
);


const AnalyticsHeader = ({ title, subtitle }) => (
  <div className="pa-page-header">
    <h1 className="pa-page-title">{title}</h1>
    <p className="pa-page-subtitle">{subtitle}</p>
  </div>
);

const PageTabs = ({ pageTabs, activePage, selectedDepartment, setActivePage }) => (
  <div className="pa-tab-row">
    {pageTabs.map((tab, index) => {
      const isActive =
        tab.isDepartment
          ? selectedDepartment === tab.key
          : activePage === tab.key && !selectedDepartment;

      return (
        <React.Fragment key={tab.key}>
          <button
            className={`pa-tab-btn${isActive ? ' active' : ''}`}
            onClick={() => setActivePage(tab.key, tab.isDepartment)}
          >
            <PageTabIcon type={tab.isDepartment ? 'department-detail' : tab.key} active={isActive} />
            {tab.label}
          </button>

          {index < pageTabs.length - 1 && <BreadcrumbArrow />}
        </React.Fragment>
      );
    })}
  </div>
);

const OverviewCard = ({ program }) => {
  const currentWidth = `${program.current}%`;
  const predictedWidth = `${program.predicted}%`;

  return (
    <div className="pa-overview-card">
      <div className="pa-overview-card-top">
        <div className="pa-overview-card-title">
          <span className="pa-program-code">{program.code}</span>
          <TrendBadge change={program.change} />
        </div>

        <div className="pa-overview-stats">
          <span className="pa-overview-years">2024 → 2029</span>
          <span className="pa-overview-values">{program.current}% → {program.predicted}%</span>
        </div>
      </div>

      <div className="pa-bar-pair">
        <div className="pa-bar-track">
          <div className="pa-bar-fill current" style={{ width: currentWidth }} />
        </div>
        <div className="pa-bar-track">
          <div className="pa-bar-fill predicted" style={{ width: predictedWidth }} />
        </div>
      </div>
    </div>
  );
};

const OverviewSection = ({ sectionTitle, sectionSubtitle, overviewPrograms }) => (
  <section className="pa-panel-wrap">
    <div className="pa-section-copy">
      <h2 className="pa-section-title">{sectionTitle}</h2>
      <p className="pa-section-subtitle">{sectionSubtitle}</p>
    </div>

    <div className="pa-panel">
      <div className="pa-overview-list">
        {overviewPrograms.map((program) => (
          <OverviewCard key={program.code} program={program} />
        ))}
      </div>
    </div>
  </section>
);

const DepartmentIcon = ({ color }) => (
  <div className={`pa-dept-icon ${color}`}>
    <HiOutlineBuildingOffice2 size={24} />
  </div>
);

const DepartmentCard = ({ card, onDepartmentClick }) => (
  <button className="pa-department-card" type="button" onClick={() => onDepartmentClick(card.key)}>
    <div className="pa-department-top">
      <DepartmentIcon color={card.color} />
      <HiOutlineChevronRight size={20} color="#90A1B9" />
    </div>

    <h3 className="pa-department-code">{card.code}</h3>
    <p className="pa-department-name">{card.name}</p>

    <div className="pa-department-metrics">
      <div className="pa-metric-row">
        <span className="pa-metric-label">Current Rate</span>
        <span className="pa-metric-value">{card.current}%</span>
      </div>

      <div className="pa-metric-row">
        <span className="pa-metric-label">Predicted 2029</span>
        <span className={`pa-metric-value accent ${card.color}`}>{card.predicted}%</span>
      </div>

      <div className="pa-metric-change">
        <TrendBadge change={card.change} />
      </div>
    </div>

    <div className="pa-department-footer">{card.programs} Programs</div>
  </button>
);

const DepartmentsSection = ({ sectionTitle, sectionSubtitle, departmentCards, onDepartmentClick }) => (
  <section className="pa-panel-wrap">
    <div className="pa-section-copy">
      <h2 className="pa-section-title">{sectionTitle}</h2>
      <p className="pa-section-subtitle">{sectionSubtitle}</p>
    </div>

    <div className="pa-department-grid">
      {departmentCards.map((card) => (
        <DepartmentCard key={card.key} card={card} onDepartmentClick={onDepartmentClick} />
      ))}
    </div>
  </section>
);

const TrendChart = ({ trend, title, subtitle }) => {
  const min = 70;
  const max = 100;
  const points = trend.map((item, index) => {
    const x = (index / (trend.length - 1)) * 100;
    const y = ((max - item.value) / (max - min)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="pa-chart-card">
      <div className="pa-chart-header">
        <div className="pa-chart-header-copy">
          <div className="pa-chart-icon">
            <HiOutlineArrowTrendingUp size={32} color="#155DFC" />
          </div>

          <div>
            <h2 className="pa-chart-title">{title}</h2>
            <p className="pa-chart-subtitle">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="pa-chart-shell">
        <div className="pa-chart-y-axis">
          <span>100</span>
          <span>86</span>
          <span>78</span>
          <span>70</span>
        </div>

        <div className="pa-chart-main">
          <div className="pa-chart-grid">
            <span />
            <span />
            <span />
            <span />
          </div>

          <svg className="pa-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline fill="none" stroke="#3B82F6" strokeWidth="1.5" points={points} vectorEffect="non-scaling-stroke" />
            {trend.map((item, index) => {
              const cx = (index / (trend.length - 1)) * 100;
              const cy = ((100 - item.value) / (100 - 70)) * 100;
              return <circle key={item.year} cx={cx} cy={cy} r="1.4" fill="#3B82F6" />;
            })}
          </svg>

          <div className="pa-chart-x-axis">
            {trend.map((item) => (
              <span key={item.year}>{item.year}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="pa-chart-summary">
        <div className="pa-summary-block">
          <span className="pa-summary-label">Current (2024)</span>
          <strong>{trend[0].value}%</strong>
        </div>

        <div className="pa-summary-arrow">
          <LuArrowRight size={24} color="#51A2FF" />
        </div>

        <div className="pa-summary-block">
          <span className="pa-summary-label">Predicted (2029)</span>
          <strong>{trend[trend.length - 1].value}%</strong>
        </div>

        <div className="pa-summary-change">
          <TrendBadge change={trend[trend.length - 1].value - trend[0].value} />
        </div>
      </div>

      <p className="pa-chart-note">Click breadcrumb tabs to return to departments or overview.</p>
    </div>
  );
};

const DepartmentDetailSection = ({ selectedDepartmentData }) => (
  <section className="pa-panel-wrap">
    <div className="pa-section-copy">
      <h2 className="pa-section-title">{selectedDepartmentData.title}</h2>
      <p className="pa-section-subtitle">{selectedDepartmentData.subtitle}</p>
    </div>

    <TrendChart
      trend={selectedDepartmentData.trend}
      title={selectedDepartmentData.summaryTitle}
      subtitle={selectedDepartmentData.summarySubtitle}
    />
  </section>
);

const Predictiveanalyticsview = ({
  activePage,
  setActivePage,
  pageTabs,
  pageContent,
  overviewPrograms,
  departmentCards,
  selectedDepartment,
  selectedDepartmentData,
  onDepartmentClick,
  sidebar,
}) => {
  const currentPage = pageContent[activePage];

  return (
    <div className="pa-layout">
      {sidebar}

      <main className="pa-main">
        <AnalyticsHeader
          title="Predictive Analytics"
          subtitle="Welcome back! Here's what's happening with your alumni insights."
        />

        <PageTabs
          pageTabs={pageTabs}
          activePage={activePage}
          selectedDepartment={selectedDepartment}
          setActivePage={setActivePage}
        />

        {activePage === 'overview' && (
          <OverviewSection
            sectionTitle={currentPage.sectionTitle}
            sectionSubtitle={currentPage.sectionSubtitle}
            overviewPrograms={overviewPrograms}
          />
        )}

        {activePage === 'departments' && (
          <DepartmentsSection
            sectionTitle={currentPage.sectionTitle}
            sectionSubtitle={currentPage.sectionSubtitle}
            departmentCards={departmentCards}
            onDepartmentClick={onDepartmentClick}
          />
        )}

        {activePage === 'department-detail' && selectedDepartmentData && (
          <DepartmentDetailSection selectedDepartmentData={selectedDepartmentData} />
        )}
      </main>
    </div>
  );
};

export default Predictiveanalyticsview;
