import React, { useMemo, useState } from 'react';
import AdminSidebar from '../admin/Adminsidebar';
import Predictiveanalyticsview from './Views/Predictiveanalyticsview';

const PAGE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'departments', label: 'Departments' },
];

const overviewPrograms = [
  { code: 'BSCS', current: 85, predicted: 92, change: 7 },
  { code: 'BSIT', current: 78, predicted: 86, change: 8 },
  { code: 'BSIS', current: 76, predicted: 84, change: 8 },
  { code: 'BSEMC', current: 74, predicted: 82, change: 8 },
  { code: 'BSCE', current: 73, predicted: 81, change: 8 },
  { code: 'BSCpE', current: 72, predicted: 80, change: 8 },
];

const departmentCards = [
  {
    key: 'seca',
    code: 'SECA',
    name: 'School of Engineering and Computer Studies',
    current: 82,
    predicted: 89,
    change: 7,
    programs: 2,
    color: 'blue',
  },
  {
    key: 'sbma',
    code: 'SBMA',
    name: 'School of Business Management and Accountancy',
    current: 76,
    predicted: 80,
    change: 4,
    programs: 2,
    color: 'amber',
  },
  {
    key: 'sase',
    code: 'SASE',
    name: 'School of Arts, Sciences and Education',
    current: 80,
    predicted: 83,
    change: 3,
    programs: 2,
    color: 'violet',
  },
];

const departmentTrends = {
  seca: {
    title: 'SECA Detailed Trends',
    subtitle: 'Predicted alignment growth from 2024 to 2029',
    summaryTitle: 'Career to Degree Alignment',
    summarySubtitle: 'Predicted alignment rates for SECA',
    trend: [
      { year: '2024', value: 82 },
      { year: '2025', value: 84 },
      { year: '2026', value: 85 },
      { year: '2027', value: 87 },
      { year: '2028', value: 88 },
      { year: '2029', value: 89 },
    ],
  },
  sbma: {
    title: 'SBMA Detailed Trends',
    subtitle: 'Predicted alignment growth from 2024 to 2029',
    summaryTitle: 'Career to Degree Alignment',
    summarySubtitle: 'Predicted alignment rates for SBMA',
    trend: [
      { year: '2024', value: 76 },
      { year: '2025', value: 77 },
      { year: '2026', value: 78 },
      { year: '2027', value: 79 },
      { year: '2028', value: 79 },
      { year: '2029', value: 80 },
    ],
  },
  sase: {
    title: 'SASE Detailed Trends',
    subtitle: 'Predicted alignment growth from 2024 to 2029',
    summaryTitle: 'Career to Degree Alignment',
    summarySubtitle: 'Predicted alignment rates for SASE',
    trend: [
      { year: '2024', value: 80 },
      { year: '2025', value: 80 },
      { year: '2026', value: 81 },
      { year: '2027', value: 82 },
      { year: '2028', value: 82 },
      { year: '2029', value: 83 },
    ],
  },
};

const pageContent = {
  overview: {
    sectionTitle: 'School of Engineering and Computer Studies',
    sectionSubtitle: 'Program-level career alignment predictions',
  },
  departments: {
    sectionTitle: 'Career Alignment by Department',
    sectionSubtitle: 'Select a department to view program-level predictions',
  },
};

const Adminpredictiveanalytics = () => {
  const [activePage, setActivePage] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const breadcrumbTabs = useMemo(() => {
    const base = [...PAGE_TABS];
    if (selectedDepartment) {
      const currentDept = departmentCards.find((card) => card.key === selectedDepartment);
      if (currentDept) {
        base.push({ key: currentDept.key, label: currentDept.code, isDepartment: true });
      }
    }
    return base;
  }, [selectedDepartment]);

  const handleTabChange = (key, isDepartment = false) => {
    if (key === 'overview') {
      setActivePage('overview');
      setSelectedDepartment(null);
      return;
    }

    if (key === 'departments') {
      setActivePage('departments');
      setSelectedDepartment(null);
      return;
    }

    if (isDepartment) {
      setActivePage('department-detail');
      setSelectedDepartment(key);
    }
  };

  const handleDepartmentClick = (departmentKey) => {
    setSelectedDepartment(departmentKey);
    setActivePage('department-detail');
  };

  const selectedDepartmentData = selectedDepartment ? departmentTrends[selectedDepartment] : null;

  return (
    <Predictiveanalyticsview
      activePage={activePage}
      setActivePage={handleTabChange}
      pageTabs={breadcrumbTabs}
      pageContent={pageContent}
      overviewPrograms={overviewPrograms}
      departmentCards={departmentCards}
      selectedDepartment={selectedDepartment}
      selectedDepartmentData={selectedDepartmentData}
      onDepartmentClick={handleDepartmentClick}
      sidebar={<AdminSidebar activePage="predictive-analytics" />}
    />
  );
};

export default Adminpredictiveanalytics;
