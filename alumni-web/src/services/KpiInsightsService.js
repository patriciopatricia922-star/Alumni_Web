// ============================================================================
// kpiInsightsService.js — Rule-Based KPI Insights & Recommendation Engine
// Derives dynamic analytics and recommendations from aggregated Supabase
// survey_progress data. No external AI/ML APIs used.
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================

const UNEMPLOYED_STATUSES = new Set([
  'Unemployed', 'Unemployed, but looking for work',
  'Unemployed, but not looking for work', 'Not employed', 'Looking for work',
]);

const SELF_EMPLOYED_STATUSES = new Set([
  'Self-Employed', 'Self-employed', 'Business owner', 'Freelance',
]);

const ABROAD_KEYWORDS = [
  'abroad', 'international', 'overseas', 'foreign', 'usa', 'uk', 'canada',
  'australia', 'singapore', 'japan', 'uae', 'dubai', 'qatar', 'saudi',
  'middle east', 'europe', 'us-based', 'uk-based',
];

const SATISFACTION_SCORE = {
  'Very Satisfied': 5, 'Very satisfied': 5,
  'Satisfied': 4,
  'Neutral': 3,
  'Dissatisfied': 2,
  'Very Dissatisfied': 1, 'Very dissatisfied': 1,
};

const NU_BRANCH_KEYWORDS = [
  'nu manila',
  'nu nazareth',
  'nu fairview',
  'nu laguna',
  'nu baliwag',
  'nu dasmarinas',
  'nu dasmariñas',
  'nu lipa',
  'nu east ortigas',
  'nu bacolod',
  'nu cebu',
  'nu moa',
  'nu clark',
  'nu las piñas',
  'nu las pinas',
  'national university',
];

// ============================================================================
// HELPERS
// ============================================================================

const safeParse = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return null; }
};

const isEmployed = (emp) => {
  if (!emp) return false;
  const status = emp.employment_status || emp.employmentStatus || emp.current_employment_status || '';
  if (!status) return !!(emp.job_position || emp.company_name);
  return !UNEMPLOYED_STATUSES.has(status);
};

const toPercent = (num, denom) =>
  denom > 0 ? Math.round((num / denom) * 100) : 0;

/**
 * Count frequency of values in an array of strings, case-insensitive.
 * Returns [{ value, count }] sorted descending.
 */
const freqMap = (arr) => {
  const map = {};
  arr.forEach(v => {
    if (!v || typeof v !== 'string') return;
    const key = v.trim().toLowerCase();
    if (key) map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, count }));
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

const topN = (freq, n = 3) => freq.slice(0, n).map(f => capitalize(f.value));

/**
 * Checks if a post-grad institution string matches any known NU branch.
 */
const isNuBranch = (val) => {
  const v = (val || '').toLowerCase().trim();
  return v ? NU_BRANCH_KEYWORDS.some(kw => v.includes(kw)) : false;
};

// ============================================================================
// EMPLOYMENT KPI INSIGHTS
// ============================================================================

/**
 * Analyzes employment_information_data rows and returns:
 * { summary, insights: string[], recommendations: string[] }
 */
export const buildEmploymentInsights = (rows) => {
  const empRows = rows.map(r => safeParse(r.employment_information_data)).filter(Boolean);
  const total = empRows.length;

  if (total === 0) {
    return {
      summary: 'No employment data available yet.',
      insights: ['Survey responses with employment data are pending.'],
      recommendations: [
        'Encourage alumni to complete the employment section of the survey.',
        'Send targeted reminders to recent graduates.',
      ],
    };
  }

  // ── Core counts ──────────────────────────────────────────────────────────
  const employedRows     = empRows.filter(e => isEmployed(e));
  const unemployedRows   = empRows.filter(e => {
    const s = e.employment_status || e.employmentStatus || e.current_employment_status || '';
    return UNEMPLOYED_STATUSES.has(s);
  });
  const selfEmpRows      = empRows.filter(e => {
    const s = e.employment_status || e.employmentStatus || e.current_employment_status || '';
    return SELF_EMPLOYED_STATUSES.has(s);
  });

  const empRate          = toPercent(employedRows.length, total);
  const unempRate        = toPercent(unemployedRows.length, total);
  const selfEmpRate      = toPercent(selfEmpRows.length, total);

  // ── Degree-job alignment ─────────────────────────────────────────────────
  const alignedCount = employedRows.filter(e => {
    const v = e.job_related_to_degree || e.is_job_related_to_degree || e.jobRelatedToDegree || '';
    return v === 'Yes' || v === true;
  }).length;
  const misalignedCount = employedRows.filter(e => {
    const v = e.job_related_to_degree || e.is_job_related_to_degree || e.jobRelatedToDegree || '';
    return v === 'No' || v === false;
  }).length;
  const alignmentRate    = toPercent(alignedCount, employedRows.length || 1);
  const misalignmentRate = toPercent(misalignedCount, employedRows.length || 1);

  // ── Local vs abroad ──────────────────────────────────────────────────────
  const abroadCount = employedRows.filter(e => {
    const loc = (
      e.job_location || e.work_location || e.company_address ||
      e.work_country  || e.location       || ''
    ).toLowerCase();
    return ABROAD_KEYWORDS.some(kw => loc.includes(kw));
  }).length;
  const abroadRate = toPercent(abroadCount, employedRows.length || 1);
  const localRate  = 100 - abroadRate;

  // ── Industry distribution ─────────────────────────────────────────────────
  const industries = empRows
    .map(e => e.industry || e.job_industry || e.field_of_work || '')
    .filter(Boolean);
  const topIndustries = topN(freqMap(industries), 3);

  // ── Salary distribution ──────────────────────────────────────────────────
  const salaries = empRows
    .map(e => e.monthly_salary || e.salary_range || e.income || e.monthly_income || '')
    .filter(Boolean);
  const topSalaryBrackets = topN(freqMap(salaries), 2);

  // ── Job search duration ──────────────────────────────────────────────────
  const searchDurations = empRows
    .map(e => e.months_to_find_job || e.job_search_duration || e.time_to_employment || '')
    .filter(Boolean);
  const topDuration = freqMap(searchDurations)[0]?.value || null;

  // ── Build insights ────────────────────────────────────────────────────────
  const insights = [];

  insights.push(
    `Employment rate stands at ${empRate}% out of ${total} respondents.`
  );

  if (unempRate > 0) {
    insights.push(`${unempRate}% of respondents are currently unemployed.`);
  }
  if (selfEmpRate > 0) {
    insights.push(`${selfEmpRate}% are self-employed or freelancing.`);
  }

  insights.push(
    `${alignmentRate}% of employed alumni are working in a field related to their degree.`
  );

  if (misalignmentRate > 30) {
    insights.push(
      `${misalignmentRate}% are employed outside their degree field — curriculum-industry alignment may need attention.`
    );
  }

  if (topIndustries.length > 0) {
    insights.push(`Top industries: ${topIndustries.join(', ')}.`);
  }

  if (abroadRate > 0) {
    insights.push(`${abroadRate}% of employed alumni work abroad; ${localRate}% are locally employed.`);
  }

  if (topSalaryBrackets.length > 0) {
    insights.push(`Most common salary ranges: ${topSalaryBrackets.join(', ')}.`);
  }

  if (topDuration) {
    insights.push(`Most common time-to-employment reported: "${capitalize(topDuration)}".`);
  }

  // ── Build recommendations ─────────────────────────────────────────────────
  const recommendations = [];

  if (empRate < 70) {
    recommendations.push('Strengthen career placement services and job fair frequency to improve employment rates.');
    recommendations.push('Partner with industry recruiters for on-campus and virtual hiring drives.');
  }

  if (alignmentRate < 60) {
    recommendations.push('Review and realign curriculum with current industry standards to improve degree-job match rates.');
    recommendations.push('Increase internship and practicum relevance through industry-vetted programs.');
  }

  if (misalignmentRate > 40) {
    recommendations.push('Provide career counseling early in the program to help students align career paths with degree outcomes.');
  }

  if (unempRate > 20) {
    recommendations.push('Launch job-readiness workshops focused on resume building, interview skills, and digital portfolios.');
    recommendations.push('Establish an alumni job referral network to shorten the job search period.');
  }

  if (abroadRate > 50) {
    recommendations.push('Develop local employer partnerships to create more competitive local job opportunities and reduce brain drain.');
  } else if (abroadRate > 20) {
    recommendations.push('Support OFW alumni with pre-departure career resources and re-integration programs.');
  }

  if (selfEmpRate > 15) {
    recommendations.push('Expand entrepreneurship support through startup incubation, mentorship, and seed funding access.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain current career services quality — employment indicators are performing well.');
    recommendations.push('Continue monitoring degree-alignment trends each survey cycle.');
  }

  const summary = `Based on ${total} employment responses: ${empRate}% employed, ${alignmentRate}% field-aligned${abroadRate > 0 ? `, ${abroadRate}% abroad` : ''}.`;

  return { summary, insights, recommendations };
};

// ============================================================================
// UNIVERSITY FEEDBACK KPI INSIGHTS
// ============================================================================

/**
 * Analyzes feedback_university_data rows and returns:
 * { summary, insights: string[], recommendations: string[] }
 */
export const buildFeedbackInsights = (rows) => {
  const feedbackRows = rows.map(r => safeParse(r.feedback_university_data)).filter(Boolean);
  const total = feedbackRows.length;

  if (total === 0) {
    return {
      summary: 'No university feedback data available yet.',
      insights: ['Alumni feedback responses are pending.'],
      recommendations: [
        'Encourage alumni to complete the university feedback section.',
        'Consider incentivizing survey completion to gather more responses.',
      ],
    };
  }

  // ── Satisfaction scores ───────────────────────────────────────────────────
  const scores = feedbackRows
    .map(r => SATISFACTION_SCORE[r.satisfaction] || null)
    .filter(Boolean);
  const avgScore = scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
    : null;
  const satisfiedCount     = scores.filter(s => s >= 4).length;
  const dissatisfiedCount  = scores.filter(s => s <= 2).length;
  const satisfactionRate   = toPercent(satisfiedCount, scores.length || 1);
  const dissatisfactionRate= toPercent(dissatisfiedCount, scores.length || 1);

  // ── Recommendation rate ────────────────────────────────────────────────────
  const wouldRecommendCount = feedbackRows.filter(r => {
    const v = r.would_recommend || r.recommend_university || r.recommend || '';
    return v === 'Yes' || v === true || (typeof v === 'string' && v.toLowerCase() === 'yes');
  }).length;
  const recommendRate = toPercent(wouldRecommendCount, total);

  // ── Common feedback themes ────────────────────────────────────────────────
  const suggestions = feedbackRows
    .flatMap(r => {
      const s = r.suggestions || r.feedback || r.comments || r.improvement_suggestions || '';
      if (Array.isArray(s)) return s;
      return typeof s === 'string' ? s.split(/[,;.\n]+/) : [];
    })
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 3 && s.length < 120);

  const suggestionFreq = freqMap(suggestions);
  const topThemes      = topN(suggestionFreq, 3);

  // ── Program/department satisfaction breakdown ─────────────────────────────
  const programRatings = {};
  feedbackRows.forEach(r => {
    const program = r.program || r.degree_program || r.department || '';
    const score   = SATISFACTION_SCORE[r.satisfaction];
    if (program && score) {
      if (!programRatings[program]) programRatings[program] = [];
      programRatings[program].push(score);
    }
  });
  const programAvgs = Object.entries(programRatings).map(([prog, arr]) => ({
    program: prog,
    avg: arr.reduce((a, b) => a + b, 0) / arr.length,
  })).sort((a, b) => a.avg - b.avg);
  const lowestProgram = programAvgs[0] || null;

  // ── Specific area ratings ─────────────────────────────────────────────────
  const areaFields = [
    'faculty_rating', 'curriculum_rating', 'facilities_rating',
    'support_services_rating', 'career_services_rating',
  ];
  const areaScores = {};
  feedbackRows.forEach(r => {
    areaFields.forEach(field => {
      const raw = r[field];
      if (raw !== undefined && raw !== null) {
        const num = typeof raw === 'number' ? raw : parseFloat(raw);
        if (!isNaN(num)) {
          if (!areaScores[field]) areaScores[field] = [];
          areaScores[field].push(num);
        }
      }
    });
  });
  const weakAreas = Object.entries(areaScores)
    .map(([field, arr]) => ({
      label: field.replace(/_rating$/, '').replace(/_/g, ' '),
      avg: arr.reduce((a, b) => a + b, 0) / arr.length,
    }))
    .filter(a => a.avg < 3.5)
    .sort((a, b) => a.avg - b.avg);

  // ── Build insights ────────────────────────────────────────────────────────
  const insights = [];

  if (avgScore !== null) {
    insights.push(`Average alumni satisfaction score: ${avgScore} / 5 (${satisfactionRate}% satisfied or very satisfied).`);
  }

  if (dissatisfactionRate > 0) {
    insights.push(`${dissatisfactionRate}% of respondents reported dissatisfaction.`);
  }

  if (recommendRate > 0) {
    insights.push(`${recommendRate}% of alumni would recommend the university to others.`);
  } else {
    insights.push('Recommendation rate data is not yet available from responses.');
  }

  if (topThemes.length > 0) {
    insights.push(`Most recurring feedback themes: ${topThemes.join(', ')}.`);
  }

  if (lowestProgram) {
    insights.push(`Program with lowest average satisfaction: "${lowestProgram.program}" (avg: ${lowestProgram.avg.toFixed(1)}/5).`);
  }

  weakAreas.forEach(a => {
    insights.push(`"${capitalize(a.label)}" rated below average (${a.avg.toFixed(1)}/5) — may need attention.`);
  });

  // ── Build recommendations ─────────────────────────────────────────────────
  const recommendations = [];

  if (satisfactionRate < 70) {
    recommendations.push('Conduct focus group discussions with dissatisfied alumni to identify root causes and actionable fixes.');
    recommendations.push('Implement a structured alumni feedback loop — share action plans based on survey findings.');
  }

  if (recommendRate < 60) {
    recommendations.push('Develop alumni success stories and testimonials to improve institutional reputation and advocacy.');
    recommendations.push('Address the most frequently cited dissatisfaction areas before the next survey cycle.');
  }

  weakAreas.forEach(a => {
    const label = capitalize(a.label);
    if (label.includes('curriculum')) {
      recommendations.push('Review and update curriculum in consultation with industry partners and alumni advisory boards.');
    } else if (label.includes('faculty')) {
      recommendations.push('Invest in faculty development programs and teaching quality enhancement initiatives.');
    } else if (label.includes('facilities')) {
      recommendations.push('Prioritize facility upgrades especially for lab and technology infrastructure based on feedback.');
    } else if (label.includes('career')) {
      recommendations.push('Strengthen career services office resources, job placement assistance, and alumni networking tools.');
    } else if (label.includes('support')) {
      recommendations.push('Enhance student and alumni support services including counseling, academic assistance, and mentoring programs.');
    }
  });

  if (topThemes.length > 0) {
    recommendations.push(
      `Address the top recurring alumni feedback themes (${topThemes.slice(0, 2).join(', ')}) in the next institutional planning cycle.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain current satisfaction performance and continue gathering structured alumni feedback regularly.');
    recommendations.push('Share positive alumni feedback trends with current students to reinforce institutional pride.');
  }

  const summary = avgScore !== null
    ? `${total} feedback responses. Avg satisfaction: ${avgScore}/5. ${recommendRate}% would recommend the university.`
    : `${total} feedback responses collected. Recommendation rate: ${recommendRate}%.`;

  return { summary, insights, recommendations };
};

// ============================================================================
// ALUMNI ENGAGEMENT KPI INSIGHTS
// ============================================================================

/**
 * Analyzes alumni_engagement_data rows and returns:
 * { summary, insights: string[], recommendations: string[] }
 */
export const buildEngagementInsights = (rows) => {
  const engRows = rows.map(r => safeParse(r.alumni_engagement_data)).filter(Boolean);
  const total = engRows.length;

  if (total === 0) {
    return {
      summary: 'No engagement data available yet.',
      insights: ['Alumni engagement responses are pending.'],
      recommendations: [
        'Send engagement surveys to registered alumni via email and SMS.',
        'Host a kickoff alumni event to boost initial participation.',
      ],
    };
  }

  // ── Participation willingness ─────────────────────────────────────────────
  const willingCount = engRows.filter(r => {
    const v = r.willing_to_participate || r.willingness_to_participate || r.willing_participate || [];
    const arr = Array.isArray(v) ? v : [v];
    return arr.some(opt => opt && opt !== 'Not at all' && opt !== 'Other' && opt !== '');
  }).length;
  const willingnessRate = toPercent(willingCount, total);

  // ── Preferred activities ───────────────────────────────────────────────────
  const allActivities = engRows.flatMap(r => {
    const v = r.preferred_activities || r.activities_interested || r.willing_to_participate
      || r.willingness_to_participate || [];
    return Array.isArray(v) ? v : (v ? [v] : []);
  }).filter(a => a && typeof a === 'string' && a !== 'Not at all' && a !== 'Other');

  const activityFreq   = freqMap(allActivities);
  const topActivities  = topN(activityFreq, 3);

  // ── Event awareness ───────────────────────────────────────────────────────
  const awareCount = engRows.filter(r => {
    const v = r.aware_of_events || r.event_awareness || r.knows_alumni_events || '';
    return v === 'Yes' || v === true || (typeof v === 'string' && v.toLowerCase() === 'yes');
  }).length;
  const awarenessRate = toPercent(awareCount, total);

  // ── Communication preferences ─────────────────────────────────────────────
  const commPrefs = engRows
    .map(r => r.preferred_communication || r.communication_preference || r.contact_preference || '')
    .filter(Boolean);
  const topComm = topN(freqMap(commPrefs), 2);

  // ── Previous participation ────────────────────────────────────────────────
  const prevParticipants = engRows.filter(r => {
    const v = r.attended_events || r.has_participated || r.previous_participation || '';
    return v === 'Yes' || v === true || (typeof v === 'string' && v.toLowerCase() === 'yes');
  }).length;
  const prevParticipationRate = toPercent(prevParticipants, total);

  // ── Barriers to participation ─────────────────────────────────────────────
  const barriers = engRows
    .flatMap(r => {
      const v = r.barriers || r.reason_not_participating || r.challenges || [];
      return Array.isArray(v) ? v : (v ? [v] : []);
    })
    .filter(Boolean);
  const topBarriers = topN(freqMap(barriers), 2);

  // ── Build insights ────────────────────────────────────────────────────────
  const insights = [];

  insights.push(
    `${willingnessRate}% of ${total} respondents expressed willingness to participate in alumni activities.`
  );

  if (prevParticipationRate > 0) {
    insights.push(`${prevParticipationRate}% have previously participated in alumni events.`);
  }

  if (awarenessRate > 0) {
    insights.push(`${awarenessRate}% are aware of university alumni events and programs.`);
  } else {
    insights.push('Low event awareness detected — alumni outreach channels may need strengthening.');
  }

  if (topActivities.length > 0) {
    insights.push(`Most preferred activities: ${topActivities.join(', ')}.`);
  }

  if (topComm.length > 0) {
    insights.push(`Preferred communication channels: ${topComm.join(', ')}.`);
  }

  if (topBarriers.length > 0) {
    insights.push(`Top barriers to participation: ${topBarriers.join(', ')}.`);
  }

  if (willingnessRate < 40) {
    insights.push('Overall engagement interest is low — proactive outreach and incentives are recommended.');
  }

  // ── Build recommendations ─────────────────────────────────────────────────
  const recommendations = [];

  if (willingnessRate < 50) {
    recommendations.push('Develop a structured alumni engagement roadmap with clear value propositions for participation.');
    recommendations.push('Offer tangible incentives such as networking opportunities, CPD credits, or recognition awards.');
  }

  if (awarenessRate < 50) {
    recommendations.push('Increase event promotion through multiple channels — email newsletters, social media, and the alumni portal.');
    recommendations.push('Partner with department heads to cascade alumni event announcements to graduates directly.');
  }

  if (topActivities.length > 0) {
    recommendations.push(
      `Prioritize organizing ${topActivities[0]} events as these align with the highest alumni interest.`
    );
  }

  if (topComm.length > 0) {
    recommendations.push(
      `Focus outreach through ${topComm.join(' and ')} — the most preferred alumni communication channels.`
    );
  }

  if (topBarriers.length > 0) {
    recommendations.push(
      `Address key participation barriers (${topBarriers.join(', ')}) through flexible scheduling, hybrid formats, or online alternatives.`
    );
  }

  if (prevParticipationRate < 30) {
    recommendations.push('Re-engage past non-participants with a targeted "come back" campaign highlighting new alumni programs.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue current alumni engagement programs and expand on top-performing activities.');
    recommendations.push('Establish an alumni ambassador program to drive organic peer-to-peer engagement.');
  }

  const summary = `${total} engagement responses. ${willingnessRate}% willing to participate. ${awarenessRate}% event-aware.`;

  return { summary, insights, recommendations };
};

// ============================================================================
// EDUCATION KPI INSIGHTS
// ============================================================================

/**
 * Analyzes educational_background_data + skills_competencies_data rows.
 * Covers:
 *   - Pursued Graduate Studies (within 1 yr)        → post_grad_plans === "Yes"
 *   - Pursued Graduate Studies at NU                → post_grad_plans === "Yes"
 *                                                      && post_grad_course matches NU branch
 *   - In Positions in Professional Organizations    → Leadership Skills rating >= 4
 *
 * @param {Array} rows - raw rows from survey_progress
 * @returns {{ summary, insights: string[], recommendations: string[] }}
 */
export const buildEducationInsights = (rows) => {
  const eduRows = rows
    .map(r => safeParse(r.educational_background_data))
    .filter(Boolean);

  const skillRows = rows
    .map(r => safeParse(r.skills_competencies_data))
    .filter(Boolean);

  const totalEdu    = eduRows.length;
  const totalSkills = skillRows.length;

  if (totalEdu === 0 && totalSkills === 0) {
    return {
      summary: 'No education or skills data available yet.',
      insights: ['Education and skills responses are pending.'],
      recommendations: [
        'Encourage alumni to complete the education and skills sections of the survey.',
        'Send targeted reminders to recent graduates.',
      ],
    };
  }

  // ── Graduate studies ──────────────────────────────────────────────────────
  // Field: post_grad_plans — "Yes" / "No"
  const gradPlanRows = eduRows.filter(r => {
    const v = r.post_grad_plans     || r.postGradPlans
      || r.plans_postgraduate       || r.do_you_have_plans_postgrad
      || r.plansPostgraduate        || r.post_graduate_plans
      || '';
    return v === 'Yes' || v === true;
  });

  const gradStudiesPct = toPercent(gradPlanRows.length, totalEdu || 1);

  // ── NU graduate studies ───────────────────────────────────────────────────
  // Field: post_grad_course — holds the institution / school name when
  // post_grad_plans === "Yes". Match against NU_BRANCH_KEYWORDS.
  const nuGradRows = gradPlanRows.filter(r => {
    const institution = r.post_grad_course  || r.postGradCourse
      || r.post_grad_school                 || r.postGradSchool
      || r.graduate_school                  || r.school
      || '';
    return isNuBranch(institution);
  });

  const nuGradPct = toPercent(nuGradRows.length, totalEdu || 1);

  // Degree programs most likely to pursue grad studies
  const gradPrograms = gradPlanRows
    .map(r => r.degree_program || r.degreeProgram || r.program || '')
    .filter(Boolean);
  const topGradPrograms = topN(freqMap(gradPrograms), 3);

  // Which NU branches were chosen
  const nuBranches = nuGradRows
    .map(r => {
      const raw = r.post_grad_course  || r.postGradCourse
        || r.post_grad_school         || r.postGradSchool
        || r.graduate_school          || r.school
        || '';
      return capitalize(raw.trim());
    })
    .filter(Boolean);
  const topNuBranches = topN(freqMap(nuBranches), 3);

  // ── Leadership (skills_competencies_data) ─────────────────────────────────
  // Field: skill_ratings["Leadership Skills"] — count alumni who rated >= 4
  // as a proxy for alumni in / ready for professional organizational leadership.
  const leadershipRows = skillRows.filter(r => {
    const ratings = r.skill_ratings || r.skillRatings || {};
    const score = ratings['Leadership Skills']
      ?? ratings['leadership_skills']
      ?? ratings['Leadership']
      ?? null;
    return score !== null && Number(score) >= 4;
  });

  const leadershipPct = toPercent(leadershipRows.length, totalSkills || 1);

  // Average leadership score across all respondents who rated it
  const leadershipScores = skillRows
    .map(r => {
      const ratings = r.skill_ratings || r.skillRatings || {};
      const score = ratings['Leadership Skills']
        ?? ratings['leadership_skills']
        ?? ratings['Leadership']
        ?? null;
      return score !== null ? Number(score) : null;
    })
    .filter(s => s !== null);

  const avgLeadershipScore = leadershipScores.length > 0
    ? (leadershipScores.reduce((a, b) => a + b, 0) / leadershipScores.length).toFixed(2)
    : null;

  // ── Build insights ────────────────────────────────────────────────────────
  const insights = [];

  if (totalEdu > 0) {
    insights.push(
      `${gradStudiesPct}% of ${totalEdu} respondents (${gradPlanRows.length} alumni) have plans to pursue or are currently pursuing graduate studies.`
    );

    insights.push(
      nuGradRows.length > 0
        ? `${nuGradPct}% of respondents plan to pursue graduate studies at a National University branch (${nuGradRows.length} alumni).`
        : `None of the ${gradPlanRows.length} alumni planning graduate studies have indicated an NU branch as their institution of choice.`
    );

    if (topGradPrograms.length > 0) {
      insights.push(
        `Programs with the highest graduate study intent: ${topGradPrograms.join(', ')}.`
      );
    }

    if (topNuBranches.length > 0) {
      insights.push(`Top NU branches selected for graduate studies: ${topNuBranches.join(', ')}.`);
    }
  }

  if (totalSkills > 0) {
    if (avgLeadershipScore !== null) {
      insights.push(
        `Average self-rated Leadership Skills score: ${avgLeadershipScore} / 5 across ${leadershipScores.length} respondents.`
      );
    }
    insights.push(
      `${leadershipPct}% of respondents (${leadershipRows.length} of ${totalSkills}) rated their Leadership Skills at 4 or above — indicative of alumni in or ready for leadership and organizational roles.`
    );
  }

  // ── Build recommendations ─────────────────────────────────────────────────
  const recommendations = [];

  if (gradStudiesPct < 30 && totalEdu > 0) {
    recommendations.push(
      'Promote graduate study opportunities through alumni newsletters, departmental advisors, and targeted scholarship campaigns.'
    );
    recommendations.push(
      'Offer alumni merit incentives such as tuition discounts or fast-tracked admission for NU graduate programs to improve conversion.'
    );
  }

  // If fewer than half of grad-intending alumni are going to NU, flag retention
  if (gradPlanRows.length > 0 && nuGradRows.length < gradPlanRows.length * 0.5) {
    recommendations.push(
      'Strengthen NU graduate program marketing targeting alumni who intend to pursue postgraduate education but have not yet chosen NU.'
    );
    recommendations.push(
      'Highlight NU graduate program outcomes, industry partnerships, and alumni success stories to improve institutional retention at the graduate level.'
    );
  }

  if (nuGradRows.length === 0 && totalEdu > 0) {
    recommendations.push(
      'Launch an NU Graduate Studies open-house or virtual information session specifically for recent alumni to increase awareness and enrollment.'
    );
  }

  if (leadershipPct < 40 && totalSkills > 0) {
    recommendations.push(
      'Offer leadership development workshops, seminars, and mentoring programs to help alumni grow into professional and organizational leadership roles.'
    );
    recommendations.push(
      'Partner with professional organizations to provide alumni with pathways into leadership positions, board membership, and industry association roles.'
    );
  }

  if (leadershipPct >= 60 && totalSkills > 0) {
    recommendations.push(
      'Leverage strong alumni leadership capital — connect high-scoring alumni with professional associations, advisory board roles, and alumni governance opportunities.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Maintain current graduate study promotion efforts and continue monitoring NU enrollment conversion rates each survey cycle.'
    );
    recommendations.push(
      'Recognize and showcase alumni in leadership positions as institutional success stories to inspire current students.'
    );
  }

  const summary = [
    totalEdu > 0
      ? `${gradStudiesPct}% pursuing grad studies; ${nuGradPct}% at an NU branch (${totalEdu} edu responses).`
      : null,
    totalSkills > 0
      ? `${leadershipPct}% rated Leadership Skills ≥ 4/5 (${totalSkills} skills responses).`
      : null,
  ].filter(Boolean).join(' ');

  return { summary, insights, recommendations };
};

// ============================================================================
// MASTER BUILDER — fetches all insights for a given set of raw survey rows
// Call this from AdminDashboard after fetching survey_progress rows.
// ============================================================================

/**
 * @param {Array} rows - raw rows from survey_progress with all JSONB fields
 * @returns {{ employment, feedback, engagement, education }}
 */
export const buildAllKpiInsights = (rows) => ({
  employment: buildEmploymentInsights(rows),
  feedback:   buildFeedbackInsights(rows),
  engagement: buildEngagementInsights(rows),
  education:  buildEducationInsights(rows),
});