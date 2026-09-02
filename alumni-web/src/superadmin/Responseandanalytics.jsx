// ============================================================================
// Purpose: Handles all business logic, Supabase API calls, data processing,
//          state management, and event handlers for Response & Analytics.
// ============================================================================
// SYNCED FROM ADMIN (this diff):
//   - Added SHS vs College support (shs_* table columns, shs-aware extraction/aggregation)
//   - Replaced <LoadingScreen> loading state with <ResponseAnalyticsSkeleton>
//   - Wired in useAlumniType() context (same context Admin uses) to drive department branching
//   - LoadingScreen retained for error state only
//   Changes from the previous version are marked ← SYNCED.
//   Super Admin-specific structure preserved: sidebar import (SuperAdsidebar), component
//   name (ResponseandAnalytics), file/folder location, and export are UNCHANGED.
// ============================================================================
import React, { useState, useEffect } from 'react';
import SuperAdSidebar from "./SuperAdSidebar";
import ResponseAnalyticsView from './Views/Responseanalyticsview';
import ResponseAnalyticsSkeleton from './Views/ResponseAnalyticsSkeleton'; // ← SYNCED
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import { useAlumniType } from './contexts/AlumniTypeContext'; // ← SYNCED (same context/path as Admin)

// ============================ EMPLOYMENT STATUS MAPPING ============================
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

// ============================ HELPER FUNCTIONS ============================
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
  // Resilient fallback (same normalized-key technique used above for
  // Work Ethics/Professionalism): if the stored satisfaction text is a
  // close variant of the labels above — extra punctuation/whitespace, a
  // leading number like "1 - Very Dissatisfied", different casing — an
  // exact-string match misses it and the response is silently dropped
  // instead of counted. This only reads the existing value; it never
  // invents or hard-codes a rating.
  const normalized = raw.replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (satisfactionMap[normalized]) return satisfactionMap[normalized];
  const leadingNum = raw.match(/^\s*(\d)\b/);
  if (leadingNum) {
    const n = Number(leadingNum[1]);
    if (n >= 1 && n <= 5) return n;
  }
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
  if (age <= 34) return '25-34';
  if (age <= 44) return '35-44';
  return '45+';
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

// ============================ EMPLOYMENT STATUS NORMALIZATION ============================
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

// ============================ RESILIENT RATING KEY LOOKUP ============================
// Root-cause fix for the "Work Ethics / Professionalism" 0/5 bug:
// The actual stored JSONB key for this rating is
//   "Work Ethics/Professionalism Skills"
// (no spaces around the slash, plus a trailing " Skills" — confirmed against
// a real survey_progress.skills_competencies_data.skill_ratings row), which
// does not match the UI label "Work Ethics / Professionalism" nor any of the
// snake_case/camelCase guesses previously checked. The other four ratings
// happened to work because their stored keys are an exact character match
// for their UI label + " Skills" (e.g. "Leadership Skills").
// This helper is a safety net for any further key drift: it tokenizes the
// target label and matches it against a normalized (lowercased,
// punctuation/whitespace-stripped) version of each key actually present on
// the ratings object, so trailing words like "Skills" or missing/extra
// spacing no longer break the lookup. It only reads the existing key — it
// never renames or writes anything back to the database.
const findRatingByNormalizedKey = (ratingsObj, targetLabel) => {
  if (!ratingsObj || typeof ratingsObj !== 'object') return undefined;
  const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetTokens = targetLabel.toLowerCase().split(/\s+/).filter(Boolean);
  for (const key of Object.keys(ratingsObj)) {
    const normalizedKey = normalize(key);
    if (targetTokens.every((tok) => normalizedKey.includes(tok))) {
      return ratingsObj[key];
    }
  }
  return undefined;
};

// ============================ RESILIENT BIRTHDAY LOOKUP ============================
// Root-cause fix for birthdays exporting as blank in the CSV: every other
// field on `personal` that has known key variants (student_number/student_id,
// contact_number/phone, street_address/address, zip_code/postal_code) already
// checks multiple possible keys. `birthday` was the one exception that only
// ever checked a single key (`personal.birthday`), so any record where the
// stored key drifted (e.g. birth_date, date_of_birth, dateOfBirth, dob) was
// silently read as blank even though the alumnus had actually answered it.
// This only reads whatever key actually holds the value — it never invents,
// reformats, or writes back a birthday.
const getBirthdayValue = (personal) => {
  if (!personal || typeof personal !== 'object') return '';
  const direct = safeText(personal.birthday);
  if (direct) return direct;
  const fallback =
    findRatingByNormalizedKey(personal, 'birth date') ??
    findRatingByNormalizedKey(personal, 'date of birth') ??
    findRatingByNormalizedKey(personal, 'dob');
  return fallback !== undefined ? safeText(fallback) : '';
};

// ============================ SINGLE RESPONSE EXTRACTION ============================
// ← SYNCED: now SHS-aware, mirroring Admin's extractRespondentData exactly.
const extractRespondentData = (row, userEmail = '', alumniType = 'college') => {
  const isShs = alumniType === 'shs';

  const personal         = (isShs ? row.shs_personal_background_data      : row.personal_background_data)        || {};
  const educational      = (isShs ? row.shs_educational_background_data  : row.educational_background_data)      || {};
  const certificationData = isShs ? {} : (row.certification_achievement_data || {}); // SHS has no certification section
  const employmentData   = (isShs ? row.shs_employment_information_data   : row.employment_information_data)      || {};
  const jobExperience    = (isShs ? row.shs_job_experience_data          : row.job_experience_data)              || {};
  const skillsData       = (isShs ? row.shs_skills_and_competencies_data : row.skills_competencies_data)          || {};
  const feedback         = (isShs ? row.shs_feedback_and_engagement_data : row.feedback_university_data)          || {};
  const engagement       = isShs ? feedback : (row.alumni_engagement_data || {}); // SHS merges engagement into feedback

  const firstName  = safeText(personal.first_name);
  const lastName   = safeText(personal.last_name);
  const middleName = safeText(personal.middle_name);
  const fullName   = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Anonymous';

  const email = userEmail || safeText(personal.email) || safeText(personal.email_address) || '';

  const program = isShs
    ? (safeText(personal.track_strand) || 'Not specified')          // SHS: track/strand, stored on personal_background
    : (safeText(educational.degree_program) || 'Not specified');

  const batch = isShs
    ? (safeText(personal.year_graduated).replace(/\D/g, '') || extractYear(row.last_updated) || 'N/A')
    : (extractYear(educational.year_graduated) || extractYear(row.last_updated) || 'N/A');

  const employmentStatus = resolveEmploymentStatus(employmentData);

  const skillRatings = isShs ? skillsData : (skillsData.skill_ratings || {});

  const commSkillRating = isShs
    ? (skillRatings.communication_skills || 0)
    : (skillRatings.communication_skills || skillRatings.communicationSkills || skillRatings.communication || skillRatings['Communication Skills'] || 0);

  const itSkillRating = isShs
    ? (skillRatings.technical_knowledge || 0)
    : (skillRatings.information_technology_skills || skillRatings.informationTechnologySkills || skillRatings.it_skills || skillRatings.itSkills || skillRatings['Information & Technology Skills'] || skillRatings['Information Technology Skills'] || 0);

  const leadershipRating = isShs
    ? (skillRatings.leadership_skills || 0)
    : (skillRatings.leadership_skills || skillRatings.leadershipSkills || skillRatings.leadership || skillRatings['Leadership Skills'] || 0);

  const criticalRating = isShs
    ? (skillRatings.critical_thinking || 0)
    : (skillRatings.critical_problem_solving_skills || skillRatings.criticalProblemSolvingSkills || skillRatings.critical_thinking || skillRatings['Critical & Problem-Solving Skills'] || skillRatings.criticalThinking || 0);

  const workEthicsRating = isShs
    ? (skillRatings.work_ethics || 0)
    : (
        // Confirmed actual stored key (no spaces around "/", trailing " Skills"),
        // matching the same "<Label> Skills" pattern the other four ratings use.
        skillRatings['Work Ethics/Professionalism Skills'] ||
        skillRatings.work_ethics_professionalism ||
        skillRatings.workEthicsProfessionalism ||
        skillRatings.work_ethics ||
        skillRatings.workEthics ||
        skillRatings['Work Ethics / Professionalism'] ||
        // Fallback: match whatever key the DB actually uses for this rating
        // (handles capitalization/spacing/naming-convention/suffix mismatches)
        // without touching the DB or any other rating's value.
        findRatingByNormalizedKey(skillRatings, 'work ethics professionalism') ||
        findRatingByNormalizedKey(skillRatings, 'work ethics') ||
        0
      );

  return {
    id: row.id,
    name: fullName,
    email,
    batch,
    program,
    status: employmentStatus,
    studentNumber:            safeText(personal.student_number)   || safeText(personal.student_id)  || '',
    gender:                   safeText(personal.gender)           || '',
    birthday:                 getBirthdayValue(personal),
    civilStatus:              safeText(personal.civil_status)     || '',
    contact:                  safeText(personal.contact_number)   || safeText(personal.phone) || '',
    streetAddress:            safeText(personal.street_address)   || safeText(personal.address) || '',
    city:                     safeText(personal.city)             || '',
    province:                 safeText(personal.province)          || '',
    zipCode:                  safeText(personal.zip_code)         || safeText(personal.postal_code) || '',
    country:                  safeText(personal.country)          || 'Philippines',
    // ← SYNCED: SHS uses reason_nu instead of reason_for_course
    reasonTakingCourse:       isShs
      ? safeText(educational.reason_nu)
      : safeText(educational.reason_for_course) || '',
    distinction:              safeText(educational.distinction)          || '',
    postGradPlans:             safeText(educational.post_grad_plans)      || '',
    postGradCourse:           safeText(educational.post_grad_course)     || '',
    // ← SYNCED: SHS Educational Background branching fields
    eduStatus:                safeText(educational.status)               || '',
    pursuedNuBranch:          safeText(educational.pursued_nu_branch)    || '',
    pursuedOtherSchool:       safeText(educational.pursued_other_school) || '',
    nuBranch:                 safeText(educational.nu_branch)            || '',
    reasonNu:                 safeText(educational.reason_nu)            || '',
    reasonNotNu:              safeText(educational.reason_not_nu)        || '',
    schoolName:               safeText(educational.school_name)          || '',
    educationLevel:           safeText(educational.education_level)      || '',
    educationLevelOther:      safeText(educational.education_level_other)|| '',
    courseProgram:            safeText(educational.course_program)       || '',
    yearLevel:                safeText(educational.year_level)           || '',
    stoppedReason:            safeText(educational.stopped_reason)       || '',
    stoppedReasonOther:       safeText(educational.stopped_reason_other) || '',
    programOther:             safeText(educational.degree_program_other) || '',
    boardExamName:            safeText(educational.board_exam_name)      || '',
    boardExamDate:            safeText(educational.board_exam_date)      || '',
    boardExamResult:          safeText(educational.board_exam_result)    || '',
    licensureReason:          safeText(educational.licensure_reason)     || '',
    licensureReviewing:        safeText(educational.licensure_reviewing)  || '',
    licensurePlans:           safeText(educational.licensure_plans)      || '',
    certiportPasser:          safeText(certificationData.certiport_passer) || '',
    certifications:           toArray(certificationData.certifications),
    certificationUseful:      safeText(certificationData.helped_career)  || '',
    certificationUsefulness:  safeText(certificationData.how_helped)     || '',
    employmentType:           safeText(employmentData.employment_status)          || '',
    employmentStatusOther:    safeText(employmentData.employment_status_other)    || '',
    jobTitle:                 safeText(employmentData.job_position)               || '',
    company:                  safeText(employmentData.company_name)               || '',
    industry:                 safeText(employmentData.type_of_industry)           || '',
    employmentLocation:       safeText(employmentData.location_of_employment)     || '',
    salary:                   safeText(employmentData.monthly_income)             || '',
    jobRelatedToDegree: isShs
      ? safeText(employmentData.job_related_to_strand)   // ← SHS key differs from college's job_related_to_degree
      : safeText(employmentData.job_related_to_degree) || '',
    jobAcceptReason:          safeText(employmentData.reason_for_job)             || '',
    jobAcceptReasonOther:     safeText(employmentData.other_reason_for_job)       || '',
    unemployedReason:         safeText(employmentData.reasons_unemployed)         || '',
    unemployedReasonOther:    safeText(employmentData.other_reason_unemployed)    || '',
    employmentDuration:       safeText(jobExperience.employment_duration)         || '',
    employmentDurationOther:  safeText(jobExperience.other_employment_duration)   || '',
    // SHS Job Experience uses factors_first_job / other_factors / other_how_found_job
    factorsForJob: isShs ? toArray(jobExperience.factors_first_job) : toArray(jobExperience.first_job_factors),
    factorsForJobOther: isShs ? safeText(jobExperience.other_factors)  : safeText(jobExperience.other_job_factors) || '',
    howFoundJob: isShs ? safeText(jobExperience.how_found_job) : safeText(jobExperience.first_job_source) || '',
    howFoundJobOther: isShs ? safeText(jobExperience.other_how_found_job) : safeText(jobExperience.other_first_job_source) || '',
    timeToJob:                safeText(jobExperience.time_to_find_job)             || '',
    usefulCompetencies: isShs ? [] : toArray(skillsData.useful_competencies), // SHS has no competencies checklist
    suggestedSkills: isShs
      ? safeText(skillsData.other_skills_suggestion)   // ← SHS key
      : safeText(skillsData.skills_to_develop) || '',
    commSkillRating:          Number(commSkillRating)     || 0,
    itSkillRating:            Number(itSkillRating)       || 0,
    leadershipRating:         Number(leadershipRating)    || 0,
    criticalRating:           Number(criticalRating)      || 0,
    workEthicsRating:         Number(workEthicsRating)    || 0,
    satisfaction:             safeText(feedback.satisfaction)          || '',
    wouldRecommend:           safeText(feedback.recommend)             || '',
    suggestions:               safeText(feedback.suggestions)           || '',
    informedAboutEvents:      safeText(engagement.informed_about_events)        || '',
    willingToParticipate:     toArray(engagement.participate_in),
    willingToParticipateOther: isShs
      ? safeText(engagement.other_participate)
      : safeText(engagement.participate_in_other) || '',
  };
};

// ============================ PROCESS ALL SURVEY DATA ============================
// ← SYNCED: now accepts alumniType and reads shs_* columns per row, mirroring Admin.
const processSurveyData = (rows, userEmails = {}, alumniType = 'college') => {
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
  const isShs = alumniType === 'shs';

  rows.forEach(row => {
    totalResponses++;
    const respondent = extractRespondentData(row, userEmails[row.user_id], alumniType);
    respondents.push(respondent);

    const personal          = (isShs ? row.shs_personal_background_data : row.personal_background_data) || {};
    const educational       = (isShs ? row.shs_educational_background_data : row.educational_background_data) || {};
    const certificationData = (isShs ? row.shs_certification_achievement_data : row.certification_achievement_data) || {};
    const employmentData    = (isShs ? row.shs_employment_information_data : row.employment_information_data) || {};
    const jobExperience     = (isShs ? row.shs_job_experience_data : row.job_experience_data) || {};
    const skillsData        = (isShs ? row.shs_skills_and_competencies_data : row.skills_competencies_data) || {};
    const feedback          = (isShs ? row.shs_feedback_and_engagement_data : row.feedback_university_data) || {};

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

    // ── Certification Status aggregation ──────────────────────────────────
    // Root cause of the missing "No Certification" bucket: this used to gate
    // the count behind `certificationData.certiport_passer !== null`, an
    // unrelated field. Any real response where `certiport_passer` happened to
    // be null (even though `certifications` was a valid, answered empty
    // array `[]`) was silently skipped from BOTH buckets — it never reached
    // "With Certification" (no certs) and never reached "No Certification"
    // either (blocked by the null check). certiport_passer is a separate,
    // Certiport-specific field and is intentionally left untouched/unused
    // here; only `certifications` decides this chart's bucket.
    //
    // - `certifications` is a real array (answered) with 1+ non-blank entries
    //     → "With Certification"
    // - `certifications` is a real array (answered) but empty, or contains
    //   only blank strings → "No Certification"
    // - `certifications` is missing/null (section not answered) → not
    //   counted in either bucket, consistent with how other charts in this
    //   file (board exam, salary, time-to-job, etc.) skip genuinely blank
    //   survey answers rather than assuming a value.
    if (Array.isArray(certificationData.certifications)) {
      const nonBlankCerts = certificationData.certifications.filter(
        (c) => safeText(c) !== ''
      );
      if (nonBlankCerts.length > 0) certification['With Certification']++;
      else                          certification['No Certification']++;
    }

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

    // ← SYNCED: SHS skills aggregation maps numeric skill keys to readable labels
    const competencies = isShs
      ? ['communication_skills', 'technical_knowledge', 'leadership_skills', 'critical_thinking', 'work_ethics']
          .filter(key => Number(skillsData[key]) > 0)
          .map(key => ({
            work_ethics: 'Work Ethics',
            critical_thinking: 'Critical Thinking',
            leadership_skills: 'Leadership Skills',
            technical_knowledge: 'Technical Knowledge',
            communication_skills: 'Communication Skills',
          }[key]))
      : toArray(skillsData.useful_competencies);

    competencies.forEach(skill => {
      const normalized = skill.trim();
      if (normalized) skills.set(normalized, (skills.get(normalized) || 0) + 1);
    });
  });

  const avgSatisfaction = satisfactionCount > 0 ? (satisfactionSum / satisfactionCount).toFixed(1) : 0;

  return {
    totalResponses,
    avgSatisfaction: parseFloat(avgSatisfaction),
    satisfactionScores: Object.entries(satisfactionScores).map(([score, count]) => ({ score, count })),
    genderDistribution: Object.entries(genderDistribution).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })),
    ageDistribution:    Object.entries(ageDistribution).filter(([_, v]) => v > 0).map(([range, count]) => ({ range, count })),
    boardExam:          Object.entries(boardExam).filter(([_, v]) => v > 0).map(([category, count]) => ({ category, count })),
    certification:      Object.entries(certification).filter(([_, v]) => v > 0).map(([status, count]) => ({ status, count })),
    employment:         Object.entries(employment).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })),
    salary:             Object.entries(salary).filter(([_, v]) => v > 0).map(([range, count]) => ({ range, count })),
    timeToJob:          Object.entries(timeToJob).filter(([_, v]) => v > 0).map(([label, count]) => ({ label, count })),
    skills:             [...skills.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([skill, count]) => ({ skill, count })),
    respondents,
  };
};

// ============================ LOADING SCREEN (error state only) ============================
// ← SYNCED: LoadingScreen is now used for the error state only, matching Admin.
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
      <SuperAdSidebar />
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

// ============================ EMPTY STATS SHAPE ============================
// Reused whenever there are no completed responses to process, so switching
// alumniType (SHS ↔ College) from a department that has data to one that
// doesn't correctly clears out the previous department's stats/respondents
// instead of leaving stale charts/table data on screen.
const EMPTY_STATS = {
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
};

// ============================ MAIN COMPONENT ============================
// ← unchanged: component name ResponseandAnalytics preserved (Super Admin naming convention)
const ResponseandAnalytics = () => {
  const { alumniType } = useAlumniType(); // ← SYNCED
  const location = useLocation();
  const focus    = location.state?.focus;

  const [activeTab,         setActiveTab]         = useState("overview");
  const [selectedSection,   setSelectedSection]   = useState("All Sections");
  const [showFilter,        setShowFilter]         = useState(false);
  const [selectedResponse,  setSelectedResponse]  = useState(null);
  const [loading,           setLoading]            = useState(true);
  const [error,             setError]              = useState(null);
  const [stats,             setStats]              = useState(EMPTY_STATS);
  const [respondents, setRespondents] = useState([]);


  useEffect(() => {
    if (focus === "employment_status") setActiveTab("overview");
    if (focus === "degree_alignment")  setActiveTab("analytics");
  }, [focus]);

  // ============================ FETCH DATA FROM SUPABASE ============================
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
            alumni_engagement_data,
            shs_personal_background_data,
            shs_educational_background_data,
            shs_employment_information_data,
            shs_job_experience_data,
            shs_skills_and_competencies_data,
            shs_feedback_and_engagement_data
          `);
        // ← SYNCED: added shs_* columns to select

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setStats(EMPTY_STATS);
          setRespondents([]);
          setLoading(false);
          return;
        }

        // ← SYNCED: filter now branches on alumniType, matching Admin
        const completedSurveys = data.filter(row => {
          if (row.completed !== true) return false;
          if (alumniType === 'shs') return !!row.shs_personal_background_data;
          return !!row.personal_background_data;
        });

        if (completedSurveys.length === 0) {
          setStats(EMPTY_STATS);
          setRespondents([]);
          setLoading(false);
          return;
        }

        const processed = processSurveyData(completedSurveys, userEmails, alumniType);

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
  }, [alumniType]); // ← SYNCED: refetch when department switches

  // ============================ HELPER FUNCTIONS ============================
  const renderStars = (num) => "★".repeat(num) + "☆".repeat(5 - num);

  const isSectionVisible = (sectionName) => {
    const formatted = selectedSection
      .toLowerCase()
      .replace(/[\s&]+/g, '-')
      .replace(/[^\w-]/g, '');
    return selectedSection === "All Sections" || formatted === sectionName;
  };

  // ============================ LOADING STATE ← SYNCED ============================
  if (loading) {
    return <ResponseAnalyticsSkeleton activeTab={activeTab} />;
  }

  // ============================ ERROR STATE ============================
  if (error) {
    return <LoadingScreen message={`Error: ${error}`} isError={true} />;
  }

  // ============================ RENDER ============================
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
      sidebar={<SuperAdSidebar />}
      alumniType={alumniType}
    />
  );
};

export default ResponseandAnalytics;