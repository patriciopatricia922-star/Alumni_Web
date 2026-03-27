import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import Responseanalyticsview from './views/Responseanalyticsview';
import { supabase } from '../lib/supabase';


const PAGE_TABS = [
  { key: 'overview', label: 'Survey Overview' },
  { key: 'responses', label: 'Survey Responses' },
];

const SECTION_OPTIONS = [
  'All Sections',
  'Personal Information',
  'Educational Information',
  'Certification Achievement',
  'Employment Information',
  'Job Search Experience',
  'Skills & Competencies',
  'Feedback & Engagement',
];

const COLORS = {
  green: '#22C55E',
  lime: '#84CC16',
  yellow: '#EAB308',
  orange: '#F97316',
  red: '#EF4444',
  blue: '#3B82F6',
  violet: '#8B5CF6',
  pink: '#FB7185',
  cyan: '#06B6D4',
  emerald: '#00C950',
  deepOrange: '#FF6900',
  danger: '#FB2C36',
  neutral: '#CBD5E1',
};

const AGE_BUCKETS = ['18-24', '25-29', '30-34', '35-39', '40+'];
const EMPLOYMENT_ORDER = [
  'Regular / Permanent',
  'Contractual',
  'Probationary',
  'Part-time',
  'Self-employed',
  'Casual',
  'Unemployed',
];
const TIME_TO_JOB_ORDER = [
  'Less than a month',
  '1–3 months',
  '3–6 months',
  '7–11 months',
  '1 year or more',
  'Not Applicable',
];
const SALARY_ORDER = [
  'Below ₱15,000',
  '₱15,001 – ₱30,000',
  '₱30,001 – ₱50,000',
  'Above ₱50,000',
];

const SATISFACTION_MAP = {
  'very satisfied': 5,
  satisfied: 4,
  neutral: 3,
  dissatisfied: 2,
  'very dissatisfied': 1,
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'have', 'has', 'had',
  'was', 'were', 'are', 'is', 'be', 'been', 'being', 'you', 'your', 'our',
  'their', 'they', 'them', 'about', 'into', 'than', 'then', 'very', 'more',
  'most', 'much', 'many', 'such', 'also', 'only', 'just', 'not', 'out',
  'can', 'could', 'would', 'should', 'will', 'may', 'might', 'able', 'school',
  'university', 'student', 'students', 'alumni', 'course', 'program', 'programs',
  'good', 'great', 'help', 'helpful', 'like', 'really', 'well', 'yes', 'no',
  'still', 'need', 'needs', 'one', 'two', 'get', 'got', 'made', 'make', 'using',
  'used', 'overall', 'better', 'best',
]);

const safeText = (value) => (typeof value === 'string' ? value.trim() : '');

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const formatDate = (value) => {
  if (!value) return 'No submission date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No submission date';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const percentageOf = (count, total) => (total ? Number(((count / total) * 100).toFixed(2)) : 0);

const average = (values) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const extractYear = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const match = value.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : String(date.getFullYear());
};

const getRollingYears = (count = 4) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, index) => String(currentYear - (count - 1 - index)));
};

const getAgeBucket = (birthday) => {
  if (!birthday) return null;
  const date = new Date(birthday);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }

  if (age <= 24) return '18-24';
  if (age <= 29) return '25-29';
  if (age <= 34) return '30-34';
  if (age <= 39) return '35-39';
  return '40+';
};

const getRatingValue = (feedback) => {
  const raw = safeText(feedback?.satisfaction).toLowerCase();
  if (SATISFACTION_MAP[raw]) return SATISFACTION_MAP[raw];
  const numeric = Number(raw);
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 5) return numeric;
  return null;
};

const countValues = (values, orderedLabels = [], palette = []) => {
  const counts = new Map();

  values.filter(Boolean).forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);

  const ordered = [
    ...orderedLabels.filter((label) => counts.has(label)),
    ...[...counts.keys()]
      .filter((label) => !orderedLabels.includes(label))
      .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0)),
  ];

  return ordered.map((label, index) => ({
    label,
    value: counts.get(label) || 0,
    percent: percentageOf(counts.get(label) || 0, total),
    color: palette[index % palette.length] || COLORS.neutral,
  }));
};

const normalizeRow = (progressRow) => {
  const personal = progressRow.personal_background_data || {};
  const educational = progressRow.educational_background_data || {};
  const certification = progressRow.certification_achievement_data || {};
  const employment = progressRow.employment_information_data || {};
  const jobExperience = progressRow.job_experience_data || {};
  const skills = progressRow.skills_competencies_data || {};
  const feedback = progressRow.feedback_university_data || {};
  const engagement = progressRow.alumni_engagement_data || {};

  return {
    id: progressRow.id,
    userId: progressRow.user_id,
    completed: progressRow.completed,
    percentage: progressRow.percentage || 0,
    lastUpdated: progressRow.last_updated,

    firstName: safeText(personal.first_name),
    middleName: safeText(personal.middle_name),
    lastName: safeText(personal.last_name),
    email: safeText(personal.email),
    gender: safeText(personal.gender),
    birthday: safeText(personal.birthday),
    civilStatus: safeText(personal.civil_status),

    degreeProgram: safeText(educational.degree_program),
    yearGraduated: safeText(educational.year_graduated),
    reasonForCourse: safeText(educational.reason_for_course),
    postGradPlans: safeText(educational.post_grad_plans),
    postGradCourse: safeText(educational.post_grad_course),
    boardExamName: safeText(educational.board_exam_name),
    boardExamDate: safeText(educational.board_exam_date),
    boardExamResult: safeText(educational.board_exam_result),
    licensureReason: safeText(educational.licensure_reason),

    certiportPasser: safeText(certification.certiport_passer),
    certifications: toArray(certification.certifications),
    helpedCareer: safeText(certification.helped_career),
    howHelped: safeText(certification.how_helped),

    employmentStatus: safeText(employment.employment_status),
    jobPosition: safeText(employment.job_position),
    companyName: safeText(employment.company_name),
    monthlyIncome: safeText(employment.monthly_income),
    reasonForJob: safeText(employment.reason_for_job),
    typeOfIndustry: safeText(employment.type_of_industry),
    jobRelatedToDegree: safeText(employment.job_related_to_degree),
    locationOfEmployment: safeText(employment.location_of_employment),

    firstJobSource: safeText(jobExperience.first_job_source),
    otherFirstJobSource: safeText(jobExperience.other_first_job_source),
    timeToFindJob: safeText(jobExperience.time_to_find_job),
    employmentDuration: safeText(jobExperience.employment_duration),
    firstJobFactors: toArray(jobExperience.first_job_factors),

    skillRatings: skills.skill_ratings || {},
    usefulCompetencies: toArray(skills.useful_competencies),
    skillsToDevelop: safeText(skills.skills_to_develop),

    feedback,
    satisfaction: safeText(feedback.satisfaction),
    recommend: safeText(feedback.recommend),
    suggestions: safeText(feedback.suggestions),

    participateIn: toArray(engagement.participate_in),
    informedAboutEvents: safeText(engagement.informed_about_events),
  };
};

const hasUsefulProgressData = (row) =>
  row.completed === true ||
  row.percentage > 0 ||
  row.personal_background_data ||
  row.educational_background_data ||
  row.certification_achievement_data ||
  row.employment_information_data ||
  row.job_experience_data ||
  row.skills_competencies_data ||
  row.feedback_university_data ||
  row.alumni_engagement_data;

const buildBoardExamSeries = (rows) => {
  const labels = getRollingYears(4);
  const buckets = new Map(labels.map((year) => [year, { passed: 0, failed: 0, total: 0 }]));

  rows.forEach((row) => {
    const result = safeText(row.boardExamResult).toLowerCase();
    if (!result) return;

    const year = extractYear(row.boardExamDate) || row.yearGraduated || extractYear(row.lastUpdated);
    if (!year || !buckets.has(year)) return;

    const bucket = buckets.get(year);

    if (result.includes('pass')) {
      bucket.passed += 1;
      bucket.total += 1;
    } else if (result.includes('fail')) {
      bucket.failed += 1;
      bucket.total += 1;
    }
  });

  const passed = labels.map((year) => {
    const bucket = buckets.get(year);
    if (!bucket.total) return null;
    return Number(((bucket.passed / bucket.total) * 100).toFixed(2));
  });

  const failed = labels.map((year) => {
    const bucket = buckets.get(year);
    if (!bucket.total) return null;
    return Number(((bucket.failed / bucket.total) * 100).toFixed(2));
  });

  return {
    labels,
    passed,
    failed,
    maxValue: 100,
  };
};

const buildCertificationSeries = (rows) => {
  const labels = getRollingYears(4);
  const buckets = new Map(labels.map((year) => [year, { certified: 0, uncertified: 0, total: 0 }]));

  rows.forEach((row) => {
    const year = row.yearGraduated || extractYear(row.lastUpdated);
    if (!year || !buckets.has(year)) return;

    const bucket = buckets.get(year);
    const isCertified =
      row.certiportPasser.toLowerCase() === 'yes' || row.certifications.length > 0;

    if (isCertified) {
      bucket.certified += 1;
    } else {
      bucket.uncertified += 1;
    }

    bucket.total += 1;
  });

  const certified = labels.map((year) => {
    const bucket = buckets.get(year);
    if (!bucket.total) return null;
    return Number(((bucket.certified / bucket.total) * 100).toFixed(2));
  });

  const uncertified = labels.map((year) => {
    const bucket = buckets.get(year);
    if (!bucket.total) return null;
    return Number(((bucket.uncertified / bucket.total) * 100).toFixed(2));
  });

  return {
    labels,
    certified,
    uncertified,
    maxValue: 100,
  };
};

const buildTopSkills = (rows) => {
  const scores = new Map();

  rows.forEach((row) => {
    row.usefulCompetencies.forEach((skill) => {
      const label = safeText(skill);
      if (!label) return;
      scores.set(label, (scores.get(label) || 0) + 1);
    });

    Object.entries(row.skillRatings).forEach(([skill, rating]) => {
      const label = safeText(skill);
      const numeric = Number(rating);
      if (!label || Number.isNaN(numeric)) return;
      scores.set(label, (scores.get(label) || 0) + numeric);
    });
  });

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], index) => ({
      label,
      value,
      color: [COLORS.green, COLORS.yellow, COLORS.orange, COLORS.pink, COLORS.red][index],
    }));
};

const buildRatingBreakdown = (rows) => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  rows.forEach((row) => {
    const rating = getRatingValue(row.feedback);
    if (rating) counts[rating] += 1;
  });

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return [
    { key: 5, color: COLORS.green },
    { key: 4, color: COLORS.lime },
    { key: 3, color: COLORS.yellow },
    { key: 2, color: COLORS.orange },
    { key: 1, color: COLORS.red },
  ].map(({ key, color }) => ({
    label: `${key}★`,
    count: counts[key],
    percent: percentageOf(counts[key], total),
    color,
  }));
};

const buildSectionResponseEntries = (rows) => {
  const entries = [];

  rows.forEach((row) => {
    const respondent =
      [row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ') ||
      row.email ||
      'Anonymous Respondent';

    const submitted = formatDate(row.lastUpdated);
    const rating = getRatingValue(row.feedback) || 0;

    const personalInfo = [
      row.gender ? `Gender: ${row.gender}` : '',
      row.civilStatus ? `Civil status: ${row.civilStatus}` : '',
      row.email ? `Email: ${row.email}` : '',
    ].filter(Boolean).join('. ');

    const educationalInfo = [
      row.degreeProgram ? `Program: ${row.degreeProgram}` : '',
      row.yearGraduated ? `Graduated: ${row.yearGraduated}` : '',
      row.reasonForCourse ? `Reason: ${row.reasonForCourse}` : '',
      row.postGradPlans ? `Post-grad plans: ${row.postGradPlans}` : '',
    ].filter(Boolean).join('. ');

    const certificationInfo = [
      row.certiportPasser ? `Certiport passer: ${row.certiportPasser}` : '',
      row.certifications.length ? `Certifications: ${row.certifications.join(', ')}` : '',
      row.helpedCareer ? `Helped career: ${row.helpedCareer}` : '',
      row.howHelped ? `How helped: ${row.howHelped}` : '',
    ].filter(Boolean).join('. ');

    const employmentInfo = [
      row.jobPosition ? `Position: ${row.jobPosition}` : '',
      row.companyName ? `Company: ${row.companyName}` : '',
      row.employmentStatus ? `Status: ${row.employmentStatus}` : '',
      row.monthlyIncome ? `Income: ${row.monthlyIncome}` : '',
      row.reasonForJob ? `Reason: ${row.reasonForJob}` : '',
    ].filter(Boolean).join('. ');

    const jobSearchInfo = [
      row.timeToFindJob ? `Time to first job: ${row.timeToFindJob}` : '',
      row.firstJobSource ? `Source: ${row.firstJobSource}` : '',
      row.employmentDuration ? `Duration: ${row.employmentDuration}` : '',
      row.firstJobFactors.length ? `Factors: ${row.firstJobFactors.join(', ')}` : '',
    ].filter(Boolean).join('. ');

    const skillsInfo = [
      row.usefulCompetencies.length ? `Useful competencies: ${row.usefulCompetencies.join(', ')}` : '',
      row.skillsToDevelop ? `Skills to develop: ${row.skillsToDevelop}` : '',
    ].filter(Boolean).join('. ');

    const feedbackInfo = [
      row.satisfaction ? `Satisfaction: ${row.satisfaction}` : '',
      row.recommend ? `Recommend: ${row.recommend}` : '',
      row.suggestions ? `Suggestions: ${row.suggestions}` : '',
      row.participateIn.length ? `Engagement: ${row.participateIn.join(', ')}` : '',
    ].filter(Boolean).join('. ');

    [
      { section: 'Personal Information', response: personalInfo },
      { section: 'Educational Information', response: educationalInfo },
      { section: 'Certification Achievement', response: certificationInfo },
      { section: 'Employment Information', response: employmentInfo },
      { section: 'Job Search Experience', response: jobSearchInfo },
      { section: 'Skills & Competencies', response: skillsInfo },
      { section: 'Feedback & Engagement', response: feedbackInfo },
    ].forEach((entry, index) => {
      if (!entry.response) return;

      entries.push({
        id: `${row.id}-${index}`,
        respondent,
        section: entry.section,
        rating,
        submitted,
        response: entry.response,
      });
    });
  });

  return entries;
};

const extractFeedbackTexts = (rows) =>
  rows
    .map((row) => safeText(row.suggestions))
    .filter((text) => text && text !== '.' && text !== '/');

const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));

const toTitleCase = (value) =>
  value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const extractTopFeedbackPhrase = (texts) => {
  const unigramCounts = new Map();
  const phraseCounts = new Map();

  texts.forEach((text) => {
    const tokens = tokenize(text);

    tokens.forEach((token) => {
      unigramCounts.set(token, (unigramCounts.get(token) || 0) + 1);
    });

    for (let i = 0; i < tokens.length - 1; i += 1) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      phraseCounts.set(bigram, (phraseCounts.get(bigram) || 0) + 1);
    }
  });

  const topPhraseEntry = [...phraseCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topPhraseEntry && topPhraseEntry[1] >= 2) return toTitleCase(topPhraseEntry[0]);

  const topWordEntry = [...unigramCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topWordEntry) return topWordEntry[0].toUpperCase();

  return '';
};

const Adminresponseanalytics = () => {
  const [activePage, setActivePage] = useState('overview');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProgress = async () => {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('survey_progress')
        .select(`
          id,
          user_id,
          completed,
          percentage,
          last_updated,
          personal_background_data,
          educational_background_data,
          certification_achievement_data,
          employment_information_data,
          job_experience_data,
          skills_competencies_data,
          feedback_university_data,
          alumni_engagement_data
        `)
        .order('last_updated', { ascending: false });

      if (!mounted) return;

      if (fetchError) {
        setError(fetchError.message || 'Failed to load survey analytics.');
        setRows([]);
        setLoading(false);
        return;
      }

      const normalized = (data || [])
        .filter(hasUsefulProgressData)
        .map(normalizeRow);

      setRows(normalized);
      setLoading(false);
    };

    loadProgress();

    return () => {
      mounted = false;
    };
  }, []);

  const allResponseEntries = useMemo(() => buildSectionResponseEntries(rows), [rows]);

  const filteredResponses = useMemo(() => {
    if (selectedSection === 'All Sections') return allResponseEntries;
    return allResponseEntries.filter((item) => item.section === selectedSection);
  }, [allResponseEntries, selectedSection]);

  const ratingBreakdown = useMemo(() => buildRatingBreakdown(rows), [rows]);

  const overviewCards = useMemo(() => {
    const ratings = rows.map((row) => getRatingValue(row.feedback)).filter(Boolean);
    const feedbackTexts = extractFeedbackTexts(rows);
    const topPhrase = extractTopFeedbackPhrase(feedbackTexts);

    const genderDistribution = countValues(
      rows.map((row) => row.gender),
      ['Male', 'Female', 'Prefer not to say'],
      [COLORS.blue, COLORS.orange, COLORS.red]
    );

    const ageDistribution = countValues(
      rows.map((row) => getAgeBucket(row.birthday)),
      AGE_BUCKETS,
      [COLORS.blue, COLORS.orange, COLORS.violet, COLORS.green, COLORS.red]
    );

    const employmentStatus = countValues(
      rows.map((row) => row.employmentStatus),
      EMPLOYMENT_ORDER,
      [COLORS.emerald, COLORS.deepOrange, COLORS.violet, COLORS.blue, COLORS.green, COLORS.orange, COLORS.danger]
    );

    const salaryRange = countValues(
      rows.map((row) => row.monthlyIncome),
      SALARY_ORDER,
      [COLORS.violet, COLORS.pink, COLORS.cyan, COLORS.orange]
    );

    const timeToFirstJob = countValues(
      rows.map((row) => row.timeToFindJob),
      TIME_TO_JOB_ORDER,
      [COLORS.green, COLORS.lime, COLORS.yellow, COLORS.orange, COLORS.red, COLORS.red]
    );

    const topSkills = buildTopSkills(rows);
    const certificationStatus = buildCertificationSeries(rows);
    const boardExamPassRate = buildBoardExamSeries(rows);

    return {
      sentiment: {
        score: Number(average(ratings).toFixed(1)) || 0,
        quote: topPhrase || 'NO COMMON FEEDBACK YET',
        keyword: topPhrase || '',
      },
      genderDistribution,
      ageDistribution,
      ageDistributionMax: Math.max(...ageDistribution.map((item) => item.value), 1),
      employmentStatus,
      salaryRange,
      salaryRangeMax: Math.max(...salaryRange.map((item) => item.value), 1),
      topSkills,
      topSkillsMax: Math.max(...topSkills.map((item) => item.value), 1),
      certificationStatus,
      boardExamPassRate,
      timeToFirstJob,
      timeToFirstJobMax: Math.max(...timeToFirstJob.map((item) => item.value), 1),
    };
  }, [rows]);

  return (
    <Responseanalyticsview
      activePage={activePage}
      setActivePage={setActivePage}
      pageTabs={PAGE_TABS}
      overviewCards={overviewCards}
      ratingBreakdown={ratingBreakdown}
      surveyResponses={filteredResponses}
      selectedSection={selectedSection}
      setSelectedSection={setSelectedSection}
      sectionOptions={SECTION_OPTIONS}
      loading={loading}
      error={error}
      sidebar={<AdminSidebar activePage="response-analytics" />}
    />
  );
};

export default Adminresponseanalytics;