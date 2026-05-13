import React, { useState, useEffect } from 'react';
import AdminSidebar from "./SuperAdsidebar";
import ResponseAnalyticsView from './views/ResponseAnalyticsView';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

const STATUS_MAPPING = {
  'Regular / Permanent':                  'Employed',
  'Probationary':                         'Employed',
  'Regular':                              'Employed',
  'Permanent':                            'Employed',
  'Full-time':                            'Employed',
  'Part-time':                            'Employed',
  'Regular/Full-time':                    'Employed',
  'Part-time/Full-time':                  'Employed',
  'Unemployed':                           'Unemployed',
  'Not employed':                         'Unemployed',
  'Looking for work':                     'Unemployed',
  'Unemployed, but looking for work':     'Unemployed',
  'Unemployed, but not looking for work': 'Unemployed',
  'Self-employed':                        'Self-Employed',
  'Self-Employed':                        'Self-Employed',
  'Business owner':                       'Self-Employed',
  'Freelance':                            'Freelance',
  'Student':                              'Student',
  'Studying':                             'Student',
  'Contractual':                          'Contractual',
  'Contract based':                       'Contractual',
};

const safeText = (value) => (typeof value === 'string' ? value.trim() : (value || ''));

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const getRatingValue = (feedback) => {
  const satisfactionMap = {
    'very satisfied': 5,
    'satisfied': 4,
    'neutral': 3,
    'dissatisfied': 2,
    'very dissatisfied': 1,
  };
  const raw = safeText(feedback?.satisfaction).toLowerCase();
  if (satisfactionMap[raw]) return satisfactionMap[raw];
  const numeric = Number(raw);
  if (!isNaN(numeric) && numeric >= 1 && numeric <= 5) return numeric;
  return null;
};

const getAgeBucket = (birthday) => {
  if (!birthday) return null;
  const date = new Date(birthday);
  if (isNaN(date.getTime())) return null;
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

const extractYear = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const match = value.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : null;
  }
  const date = new Date(value);
  return !isNaN(date.getTime()) ? String(date.getFullYear()) : null;
};

const resolveEmploymentStatus = (empData) => {
  if (!empData) return 'Not specified';

  const rawStatus = empData.employment_status
    || empData.current_employment_status
    || empData.employmentStatus
    || '';

  if (rawStatus && STATUS_MAPPING[rawStatus]) {
    return STATUS_MAPPING[rawStatus];
  }

  const statusLower = rawStatus.toLowerCase();

  if (statusLower.includes('regular') || statusLower.includes('permanent')) return 'Employed';
  if (statusLower.includes('self'))                                          return 'Self-Employed';
  if (statusLower.includes('student') || statusLower.includes('studying'))  return 'Student';
  if (statusLower.includes('contract'))                                      return 'Contractual';
  if (statusLower.includes('freelance'))                                     return 'Freelance';
  if (statusLower.includes('unemployed') || statusLower.includes('not employed') || statusLower.includes('looking for work')) {
    return 'Unemployed';
  }
  if (statusLower.includes('full-time') || statusLower.includes('part-time')) return 'Employed';

  if (empData.job_position || empData.company_name) return 'Employed';

  return rawStatus || 'Not specified';
};

const extractRespondentData = (row, userEmail = '') => {
  const personal         = row.personal_background_data       || {};
  const educational      = row.educational_background_data    || {};
  const certificationData = row.certification_achievement_data || {};
  const employmentData   = row.employment_information_data    || {};
  const jobExperience    = row.job_experience_data            || {};
  const skillsData       = row.skills_competencies_data       || {};
  const feedback         = row.feedback_university_data       || {};
  const engagement       = row.alumni_engagement_data         || {};

  const firstName  = safeText(personal.first_name);
  const lastName   = safeText(personal.last_name);
  const middleName = safeText(personal.middle_name);
  const fullName   = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Anonymous';

  const email  = userEmail || safeText(personal.email) || safeText(personal.email_address) || '';
  const batch   = extractYear(educational.year_graduated) || extractYear(row.last_updated) || 'N/A';
  const program = safeText(educational.degree_program) || 'Not specified';

  const employmentStatus = resolveEmploymentStatus(employmentData);

  const skillRatings = skillsData.skill_ratings || {};

  const commSkillRating = skillRatings.communication_skills ||
                          skillRatings.communicationSkills  ||
                          skillRatings.communication        ||
                          skillRatings['Communication Skills'] || 0;

  const itSkillRating = skillRatings.information_technology_skills ||
                        skillRatings.informationTechnologySkills   ||
                        skillRatings.it_skills                     ||
                        skillRatings.itSkills                      ||
                        skillRatings['Information & Technology Skills'] ||
                        skillRatings['Information Technology Skills'] || 0;

  const leadershipRating = skillRatings.leadership_skills ||
                           skillRatings.leadershipSkills  ||
                           skillRatings.leadership        ||
                           skillRatings['Leadership Skills'] || 0;

  const criticalRating = skillRatings.critical_problem_solving_skills ||
                         skillRatings.criticalProblemSolvingSkills    ||
                         skillRatings.critical_thinking               ||
                         skillRatings['Critical & Problem-Solving Skills'] ||
                         skillRatings.criticalThinking || 0;

  const workEthicsRating = skillRatings.work_ethics_professionalism ||
                           skillRatings.workEthicsProfessionalism   ||
                           skillRatings.work_ethics                 ||
                           skillRatings.workEthics                  ||
                           skillRatings['Work Ethics / Professionalism'] || 0;

  return {
    id: row.id,
    name: fullName,
    email,
    batch,
    program,
    status: employmentStatus,
    studentNumber:            safeText(personal.student_number)   || safeText(personal.student_id) || '',
    gender:                   safeText(personal.gender)           || '',
    birthday:                 safeText(personal.birthday)         || '',
    civilStatus:              safeText(personal.civil_status)     || '',
    contact:                  safeText(personal.contact_number)   || safeText(personal.phone) || '',
    streetAddress:            safeText(personal.street_address)   || safeText(personal.address) || '',
    city:                     safeText(personal.city)             || '',
    province:                 safeText(personal.province)         || '',
    zipCode:                  safeText(personal.zip_code)         || safeText(personal.postal_code) || '',
    country:                  safeText(personal.country)          || 'Philippines',
    reasonTakingCourse:       safeText(educational.reason_for_course)    || '',
    distinction:              safeText(educational.distinction)          || '',
    postGradPlans:            safeText(educational.post_grad_plans)      || '',
    postGradCourse:           safeText(educational.post_grad_course)     || '',
    programOther:             safeText(educational.degree_program_other) || '',
    boardExamName:            safeText(educational.board_exam_name)      || '',
    boardExamDate:            safeText(educational.board_exam_date)      || '',
    boardExamResult:          safeText(educational.board_exam_result)    || '',
    licensureReason:          safeText(educational.licensure_reason)     || '',
    licensureReviewing:       safeText(educational.licensure_reviewing)  || '',
    licensurePlans:           safeText(educational.licensure_plans)      || '',
    certiportPasser:          safeText(certificationData.certiport_passer) || '',
    certifications:           toArray(certificationData.certifications),
    certificationUseful:      safeText(certificationData.helped_career)  || '',
    certificationUsefulness:  safeText(certificationData.how_helped)     || '',
    jobRelatedToDegree:       safeText(employmentData.job_related_to_degree)      || '',
    employmentType:           safeText(employmentData.employment_status)          || '',
    employmentStatusOther:    safeText(employmentData.employment_status_other)    || '',
    jobTitle:                 safeText(employmentData.job_position)               || '',
    company:                  safeText(employmentData.company_name)               || '',
    industry:                 safeText(employmentData.type_of_industry)           || '',
    employmentLocation:       safeText(employmentData.location_of_employment)     || '',
    salary:                   safeText(employmentData.monthly_income)             || '',
    jobAcceptReason:          safeText(employmentData.reason_for_job)             || '',
    jobAcceptReasonOther:     safeText(employmentData.other_reason_for_job)       || '',
    unemployedReason:         safeText(employmentData.reasons_unemployed)         || '',
    unemployedReasonOther:    safeText(employmentData.other_reason_unemployed)    || '',
    timeToJob:                safeText(jobExperience.time_to_find_job)            || '',
    employmentDuration:       safeText(jobExperience.employment_duration)         || '',
    employmentDurationOther:  safeText(jobExperience.other_employment_duration)   || '',
    howFoundJob:              safeText(jobExperience.first_job_source)            || '',
    howFoundJobOther:         safeText(jobExperience.other_first_job_source)      || '',
    factorsForJob:            toArray(jobExperience.first_job_factors),
    factorsForJobOther:       safeText(jobExperience.other_job_factors)           || '',
    usefulCompetencies:       toArray(skillsData.useful_competencies),
    suggestedSkills:          safeText(skillsData.skills_to_develop)              || '',
    commSkillRating:          Number(commSkillRating)     || 0,
    itSkillRating:            Number(itSkillRating)       || 0,
    leadershipRating:         Number(leadershipRating)    || 0,
    criticalRating:           Number(criticalRating)      || 0,
    workEthicsRating:         Number(workEthicsRating)    || 0,
    satisfaction:             safeText(feedback.satisfaction)          || '',
    wouldRecommend:           safeText(feedback.recommend)             || '',
    suggestions:              safeText(feedback.suggestions)           || '',
    informedAboutEvents:      safeText(engagement.informed_about_events)        || '',
    willingToParticipate:     toArray(engagement.participate_in),
    willingToParticipateOther: safeText(engagement.participate_in_other)        || '',
  };
};

const processSurveyData = (rows, userEmails = {}) => {
  let totalResponses   = 0;
  let satisfactionSum  = 0;
  let satisfactionCount = 0;

  const satisfactionScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const genderDistribution = { Male: 0, Female: 0, Other: 0 };
  const ageDistribution    = { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 };
  const boardExam          = { Passed: 0, Failed: 0 };
  const certification      = { 'With Certification': 0, 'No Certification': 0 };
  const employment         = { 'Employed': 0, 'Unemployed': 0, 'Self-Employed': 0, 'Student': 0, 'Contractual': 0, 'Freelance': 0 };
  const salary             = { '< ₱15k': 0, '₱15k–30k': 0, '₱30k–50k': 0, '> ₱40k': 0 };
  const timeToJob          = { '< 1 month': 0, '1–3 months': 0, '3–6 months': 0, '6 + months': 0 };
  const skills             = new Map();
  const respondents        = [];

  rows.forEach(row => {
    totalResponses++;
    const respondent = extractRespondentData(row, userEmails[row.user_id]);
    respondents.push(respondent);

    const personal          = row.personal_background_data       || {};
    const educational       = row.educational_background_data    || {};
    const certificationData = row.certification_achievement_data || {};
    const employmentData    = row.employment_information_data    || {};
    const jobExperience     = row.job_experience_data            || {};
    const skillsData        = row.skills_competencies_data       || {};
    const feedback          = row.feedback_university_data       || {};

    const gender = safeText(personal.gender);
    if (gender === 'Male')        genderDistribution.Male++;
    else if (gender === 'Female') genderDistribution.Female++;
    else if (gender)              genderDistribution.Other++;

    const ageBucket = getAgeBucket(personal.birthday);
    if (ageBucket) ageDistribution[ageBucket]++;

    const rating = getRatingValue(feedback);
    if (rating) {
      satisfactionSum += rating;
      satisfactionCount++;
      satisfactionScores[rating]++;
    }

    const examResult = safeText(educational.board_exam_result);
    if (examResult.toLowerCase().includes('pass'))      boardExam.Passed++;
    else if (examResult.toLowerCase().includes('fail')) boardExam.Failed++;

    const hasCertification = safeText(certificationData.certiport_passer) === 'Yes' ||
                             (certificationData.certifications && certificationData.certifications.length > 0);
    if (hasCertification)                                   certification['With Certification']++;
    else if (certificationData.certiport_passer !== null)   certification['No Certification']++;

    const resolvedStatus = resolveEmploymentStatus(employmentData);
    if (employment.hasOwnProperty(resolvedStatus)) {
      employment[resolvedStatus]++;
    } else if (resolvedStatus && resolvedStatus !== 'Not specified') {
      employment['Employed']++;
    }

    const monthlyIncome = safeText(employmentData.monthly_income);
    if (monthlyIncome.includes('Below') || monthlyIncome.includes('<'))              salary['< ₱15k']++;
    else if (monthlyIncome.includes('15,001') || monthlyIncome.includes('15k–30k')) salary['₱15k–30k']++;
    else if (monthlyIncome.includes('30,001') || monthlyIncome.includes('30k–50k')) salary['₱30k–50k']++;
    else if (monthlyIncome.includes('Above') || monthlyIncome.includes('>'))        salary['> ₱40k']++;

    const timeToFind = safeText(jobExperience.time_to_find_job);
    if (timeToFind.includes('Less') || timeToFind.includes('< 1'))      timeToJob['< 1 month']++;
    else if (timeToFind.includes('1–3'))                                 timeToJob['1–3 months']++;
    else if (timeToFind.includes('3–6'))                                 timeToJob['3–6 months']++;
    else if (timeToFind.includes('6 +') || timeToFind.includes('6+'))   timeToJob['6 + months']++;

    const competencies = toArray(skillsData.useful_competencies);
    competencies.forEach(skill => {
      const normalized = skill.trim();
      if (normalized) skills.set(normalized, (skills.get(normalized) || 0) + 1);
    });
  });

  const avgSatisfaction = satisfactionCount > 0 ? (satisfactionSum / satisfactionCount).toFixed(1) : 0;

  const genderDistributionArray  = Object.entries(genderDistribution) .filter(([_, v]) => v > 0).map(([name, value])     => ({ name, value }));
  const ageDistributionArray     = Object.entries(ageDistribution)    .filter(([_, v]) => v > 0).map(([range, count])    => ({ range, count }));
  const satisfactionScoresArray  = Object.entries(satisfactionScores)                            .map(([score, count])   => ({ score, count }));
  const boardExamArray           = Object.entries(boardExam)          .filter(([_, v]) => v > 0).map(([category, count]) => ({ category, count }));
  const certificationArray       = Object.entries(certification)      .filter(([_, v]) => v > 0).map(([status, count])  => ({ status, count }));
  const employmentArray          = Object.entries(employment)         .filter(([_, v]) => v > 0).map(([name, value])     => ({ name, value }));
  const salaryArray              = Object.entries(salary)             .filter(([_, v]) => v > 0).map(([range, count])    => ({ range, count }));
  const timeToJobArray           = Object.entries(timeToJob)          .filter(([_, v]) => v > 0).map(([label, count])    => ({ label, count }));
  const skillsArray              = [...skills.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([skill, count])    => ({ skill, count }));

  return {
    totalResponses,
    avgSatisfaction: parseFloat(avgSatisfaction),
    satisfactionScores: satisfactionScoresArray,
    genderDistribution: genderDistributionArray,
    ageDistribution:    ageDistributionArray,
    boardExam:          boardExamArray,
    certification:      certificationArray,
    employment:         employmentArray,
    salary:             salaryArray,
    timeToJob:          timeToJobArray,
    skills:             skillsArray,
    respondents,
  };
};

const LoadingScreen = ({ message, isError = false }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <AdminSidebar />
      <div style={{
        marginLeft: isMobile ? 0 : "229px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#E1ECF7",
        fontFamily: "Lexend, sans-serif",
        color: isError ? "#ef4444" : "#6A7282",
        fontSize: "14px"
      }}>
        {message}
      </div>
    </>
  );
};

const ResponseandAnalytics = () => {
  const location = useLocation();
  const focus    = location.state?.focus;

  const [activeTab,         setActiveTab]         = useState("overview");
  const [selectedSection,   setSelectedSection]   = useState("All Sections");
  const [showFilter,        setShowFilter]         = useState(false);
  const [selectedResponse,  setSelectedResponse]  = useState(null);
  const [loading,           setLoading]            = useState(true);
  const [error,             setError]              = useState(null);
  const [stats,             setStats]              = useState({
    totalResponses:    0,
    avgSatisfaction:   0,
    satisfactionScores: [],
    genderDistribution: [],
    ageDistribution:   [],
    boardExam:         [],
    certification:     [],
    employment:        [],
    salary:            [],
    timeToJob:         [],
    skills:            [],
  });
  const [respondents, setRespondents] = useState([]);

  useEffect(() => {
    if (focus === "employment_status") setActiveTab("overview");
    if (focus === "degree_alignment")  setActiveTab("analytics");
  }, [focus]);

  useEffect(() => {
    const fetchSurveyData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, email')
          .eq('role', 'alumni');

        const userEmails = {};
        if (usersData) {
          usersData.forEach(user => { userEmails[user.id] = user.email || ''; });
        }

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
          `);

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setError('No survey responses found.');
          setLoading(false);
          return;
        }

        const completedSurveys = data.filter(row => row.completed === true);

        if (completedSurveys.length === 0) {
          setError('No completed survey responses found.');
          setLoading(false);
          return;
        }

        const processed = processSurveyData(completedSurveys, userEmails);
        setStats({
          totalResponses:    processed.totalResponses,
          avgSatisfaction:   processed.avgSatisfaction,
          satisfactionScores: processed.satisfactionScores,
          genderDistribution: processed.genderDistribution,
          ageDistribution:   processed.ageDistribution,
          boardExam:         processed.boardExam,
          certification:     processed.certification,
          employment:        processed.employment,
          salary:            processed.salary,
          timeToJob:         processed.timeToJob,
          skills:            processed.skills,
        });
        setRespondents(processed.respondents);

      } catch (err) {
        console.error('Error fetching survey data:', err);
        setError(err.message || 'Failed to load survey data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, []);

  const renderStars = (num) => "★".repeat(num) + "☆".repeat(5 - num);

  const isSectionVisible = (sectionName) => {
    const formatted = selectedSection
      .toLowerCase()
      .replace(/[\s&]+/g, '-')
      .replace(/[^\w-]/g, '');
    return selectedSection === "All Sections" || formatted === sectionName;
  };

  if (loading) return <LoadingScreen message="Loading survey data..." />;
  if (error)   return <LoadingScreen message={`Error: ${error}`} isError={true} />;

  return (
    <ResponseAnalyticsView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedSection={selectedSection}
      setSelectedSection={setSelectedSection}
      showFilter={showFilter}
      setShowFilter={setShowFilter}
      selectedResponse={selectedResponse}
      setSelectedResponse={setSelectedResponse}
      stats={stats}
      respondents={respondents}
      isSectionVisible={isSectionVisible}
      renderStars={renderStars}
      sidebar={<AdminSidebar />}
    />
  );
};

export default ResponseandAnalytics;