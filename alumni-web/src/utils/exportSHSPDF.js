// ============================================================================
// exportSHSPDF.js
// ============================================================================
// Generates a full SHS Alumni Tracer Survey PDF report.
// Mirrors exportPDF.js structure but uses shs_* data fields and SHS KPIs.
// ============================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';

// ── Colors ───────────────────────────────────────────────────────────────────
const NAVY   = [30,  45,  90];
const BLUE   = [79, 163, 247];
const GRAY   = [107, 114, 128];
const LGRAY  = [241, 245, 249];
const WHITE  = [255, 255, 255];
const GREEN  = [16, 185, 129];
const AMBER  = [245, 158, 11];
const RED    = [239, 68, 68];
const PURPLE = [139, 92, 246];
const CYAN   = [6,  182, 212];

// ── Helpers ───────────────────────────────────────────────────────────────────
const val = (v) => (v && String(v).trim() !== '' ? String(v) : 'N/A');

const stars = (n) => {
  const filled = Number(n) || 0;
  return `[${'*'.repeat(filled)}${'-'.repeat(5 - filled)}]`;
};

const pdfSafe = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\u20B1/g, 'PHP ')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2022/g, '*')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x00-\x7F]/g, '?');
};

const drawSectionBanner = (doc, text, color, y) => {
  doc.setFillColor(...color);
  doc.rect(14, y, 182, 7, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 18, y + 5);
  doc.setTextColor(0, 0, 0);
  return y + 11;
};

const fieldRow = (doc, label, value, y, pageH) => {
  if (y > pageH - 20) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(label, 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const safeValue = pdfSafe(val(value));
  const lines = doc.splitTextToSize(safeValue, 120);
  doc.text(lines, 70, y);
  return y + (lines.length * 4.5) + 1;
};

const addPageIfNeeded = (doc, y, pageH, margin = 20) => {
  if (y > pageH - margin) { doc.addPage(); return 20; }
  return y;
};

const safeParse = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return null; }
};

// ============================================================================
// MAIN SHS EXPORT FUNCTION
// ============================================================================
export const exportSHSSurveyPDF = async ({
  filterType,    // 'batch' | 'program'
  filterValue,   // e.g. '2023' or 'SHS-STEM'
  stats,         // stats object from ResponseAnalytics state
  respondents,   // respondents array (already SHS-filtered by the view)
}) => {

  // ── Filter respondents ────────────────────────────────────────────────────
  const filtered = respondents.filter(r =>
    filterType === 'batch' ? r.batch === filterValue : r.program === filterValue
  );

  if (filtered.length === 0) {
    alert('No SHS respondents found for the selected filter.');
    return;
  }

  const totalFiltered = filtered.length;

  // ── Compute summary stats for filtered group ──────────────────────────────
  const satisfactions = filtered.map(r => {
    const map = {
      'very satisfied': 5, 'satisfied': 4, 'neutral': 3,
      'dissatisfied': 2,   'very dissatisfied': 1,
    };
    return map[r.satisfaction?.toLowerCase()] || null;
  }).filter(Boolean);

  const avgSatisfaction = satisfactions.length > 0
    ? (satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length).toFixed(1)
    : 'N/A';

  // Count those who continued studying
  const continuedStudying = filtered.filter(r =>
    r.status?.toLowerCase().includes('student') ||
    r.postGradPlans === 'Yes'
  ).length;

  const retentionRate = totalFiltered > 0
    ? Math.round((continuedStudying / totalFiltered) * 100)
    : 0;

  // ── Initialize PDF ────────────────────────────────────────────────────────
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  let y = 20;

  // ==========================================================================
  // PAGE 1 — COVER
  // ==========================================================================
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 60, 'F');

  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SHS Alumni Tracer Survey Report', pageW / 2, 28, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Senior High School Program', pageW / 2, 40, { align: 'center' });

  doc.setFillColor(...CYAN);
  doc.rect(0, 58, pageW, 1, 'F');

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('National University - Dasmarinas', pageW / 2, 73, { align: 'center' });
  doc.text('Alumni Affairs Office', pageW / 2, 80, { align: 'center' });

  // Filter pill
  doc.setFillColor(...LGRAY);
  doc.roundedRect(50, 85, 110, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(
    filterType === 'batch' ? `Batch ${filterValue}` : `Strand: ${filterValue}`,
    pageW / 2, 94, { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    `Date Generated: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageW / 2, 110, { align: 'center' }
  );
  doc.text(`Total Respondents in this Report: ${totalFiltered}`, pageW / 2, 117, { align: 'center' });

  // ── Fetch SHS KPI data from Supabase ──────────────────────────────────────
  let shsPursuedUndergradPct = 0;
  let shsPursuedUndergradNuPct = 0;
  let shsRetentionPct = 0;

  try {
    const NU_KEYWORDS = [
      'nu manila', 'nu nazareth', 'nu fairview', 'nu laguna', 'nu baliwag',
      'nu dasmarinas', 'nu lipa', 'nu east ortigas', 'nu bacolod', 'nu cebu',
      'nu moa', 'nu clark', 'nu las pinas', 'national university',
    ];
    const isNuBranch = (v) => {
      const s = (v || '').toLowerCase().trim();
      return NU_KEYWORDS.some(kw => s.includes(kw));
    };

    const { data: shsRows } = await supabase
      .from('survey_progress')
      .select('shs_educational_background_data')
      .not('shs_educational_background_data', 'is', null);

    if (shsRows && shsRows.length > 0) {
      const eduRows = shsRows.map(r => safeParse(r.shs_educational_background_data)).filter(Boolean);

      // Retention: currently studying
      const retained = eduRows.filter(e => e.status === 'Currently Studying').length;
      shsRetentionPct = eduRows.length > 0 ? Math.round((retained / eduRows.length) * 100) : 0;

      // Pursued undergrad
      const pursuedUndergrad = eduRows.filter(e => {
        const v = e.pursued_undergrad ?? e.continued_studies ?? e.pursue_undergraduate ?? null;
        return v === 'Yes' || v === true || v === 1;
      }).length;
      shsPursuedUndergradPct = eduRows.length > 0
        ? Math.round((pursuedUndergrad / eduRows.length) * 100) : 0;

      // Pursued undergrad at NU
      const pursuedAtNu = eduRows.filter(e => {
        const v = e.pursued_undergrad ?? e.continued_studies ?? e.pursue_undergraduate ?? null;
        if (v !== 'Yes' && v !== true && v !== 1) return false;
        const school = e.school || e.institution || e.university || e.undergraduate_school || '';
        return isNuBranch(school) || e.pursued_nu_branch === 'Yes';
      }).length;
      shsPursuedUndergradNuPct = eduRows.length > 0
        ? Math.round((pursuedAtNu / eduRows.length) * 100) : 0;
    }
  } catch (e) {
    console.warn('SHS KPI fetch failed, skipping:', e);
  }

  // ── Summary stat boxes ────────────────────────────────────────────────────
  const boxes = [
    { label: 'Total Respondents', value: String(totalFiltered),       color: NAVY   },
    { label: 'Retention Rate',    value: `${retentionRate}%`,         color: GREEN  },
    { label: 'Avg Satisfaction',  value: `${avgSatisfaction}/5`,      color: AMBER  },
    { label: 'Continued Studies', value: String(continuedStudying),   color: PURPLE },
  ];
  const bw = 40, bh = 24, gap = 6, startX = 14;
  let bx = startX;
  boxes.forEach(box => {
    doc.setFillColor(...box.color);
    doc.roundedRect(bx, 128, bw, bh, 3, 3, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(box.value, bx + bw / 2, 138, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label, bx + bw / 2, 144, { align: 'center' });
    bx += bw + gap;
  });

  // ── SHS Institutional KPIs on cover ──────────────────────────────────────
  let ky = 158;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('INSTITUTIONAL KPIs — SENIOR HIGH', 14, ky);
  doc.setFillColor(...CYAN);
  doc.rect(14, ky + 2, 182, 0.4, 'F');
  ky += 10;

  const shsKpiGroups = [
    {
      label: 'SENIOR HIGH',
      color: CYAN,
      items: [
        ['Retention Rate (Currently Studying)',        `${shsRetentionPct}%`],
        ['SHS Alumni Who Pursued Undergraduate Degree', `${shsPursuedUndergradPct}%`],
        ['SHS Alumni Who Pursued Undergraduate at NU', `${shsPursuedUndergradNuPct}%`],
      ],
    },
  ];

  shsKpiGroups.forEach(group => {
    doc.setFillColor(...group.color);
    doc.rect(14, ky, 182, 6, 'F');
    doc.setTextColor(...WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(group.label, 17, ky + 4.2);
    ky += 9;

    group.items.forEach(([label, value]) => {
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(label, 18, ky);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...NAVY);
      doc.text(value, 190, ky, { align: 'right' });
      ky += 6.5;
    });
    ky += 4;
  });

  // Cover footer
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.text(
    'This document is confidential and intended for authorized personnel only.',
    pageW / 2, pageH - 14, { align: 'center' }
  );

  // ==========================================================================
  // PAGE 2 — SHS SURVEY ANALYTICS SUMMARY
  // ==========================================================================
  doc.addPage();
  y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text('SHS Survey Analytics Summary', 14, y);
  y += 3;
  doc.setFillColor(...CYAN);
  doc.rect(14, y, 182, 0.5, 'F');
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    `Filter: ${filterType === 'batch' ? `Batch ${filterValue}` : `Strand — ${filterValue}`}   |   Respondents: ${totalFiltered} of ${respondents.length} total`,
    14, y
  );
  y += 10;

  // ── Gender Distribution ───────────────────────────────────────────────────
  if (stats.genderDistribution?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'GENDER DISTRIBUTION', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Gender', 'Count']],
      body: stats.genderDistribution.map(g => [g.name, g.value]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: CYAN, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 146 }, 1: { cellWidth: 36 } },
      margin: { left: 14, right: 14 },
      showHead: 'firstPage',
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Age Distribution ──────────────────────────────────────────────────────
  if (stats.ageDistribution?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'AGE DISTRIBUTION', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Age Range', 'Count']],
      body: stats.ageDistribution.map(a => [a.range, a.count]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: CYAN, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 146 }, 1: { cellWidth: 36 } },
      margin: { left: 14, right: 14 },
      showHead: 'firstPage',
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Employment/Status Breakdown ───────────────────────────────────────────
  if (stats.employment?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'STATUS BREAKDOWN (Post-SHS)', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Status', 'Count']],
      body: stats.employment.map(e => [e.name, e.value]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: CYAN, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 146 }, 1: { cellWidth: 36 } },
      margin: { left: 14, right: 14 },
      showHead: 'firstPage',
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Time to First Job ─────────────────────────────────────────────────────
  if (stats.timeToJob?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'TIME TO FIRST JOB / STUDY AFTER GRADUATION', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Duration', 'Count']],
      body: stats.timeToJob.map(t => [pdfSafe(t.label), t.count]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: AMBER, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 146 }, 1: { cellWidth: 36 } },
      margin: { left: 14, right: 14 },
      showHead: 'firstPage',
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Top Skills ────────────────────────────────────────────────────────────
  if (stats.skills?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'TOP SKILLS & COMPETENCIES', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Skill / Competency', 'Mentions']],
      body: stats.skills.map(s => [s.skill, s.count]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: PURPLE, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 146 }, 1: { cellWidth: 36 } },
      margin: { left: 14, right: 14 },
      showHead: 'firstPage',
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Satisfaction Scores ───────────────────────────────────────────────────
  if (stats.satisfactionScores?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'SATISFACTION RATING BREAKDOWN', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Rating', 'Stars', 'Count']],
      body: stats.satisfactionScores.map(s => [`${s.score}/5`, stars(s.score), s.count]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: AMBER, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 36 }, 1: { cellWidth: 110 }, 2: { cellWidth: 36 } },
      margin: { left: 14, right: 14 },
      showHead: 'firstPage',
    });
    y = doc.lastAutoTable.finalY + 8;

    // Average satisfaction callout
    y = addPageIfNeeded(doc, y, pageH);
    doc.setFillColor(...LGRAY);
    doc.roundedRect(14, y, 182, 14, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(
      `Overall Average Satisfaction: ${stats.avgSatisfaction || 'N/A'} / 5  ${stars(Math.round(stats.avgSatisfaction || 0))}`,
      18, y + 9
    );
    y += 20;
  }

  // ==========================================================================
  // PAGE 3+ — INDIVIDUAL SHS RESPONDENT RECORDS
  // ==========================================================================
  doc.addPage();
  y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text('Individual SHS Survey Responses', 14, y);
  y += 3;
  doc.setFillColor(...CYAN);
  doc.rect(14, y, 182, 0.5, 'F');
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(
    `Showing ${totalFiltered} respondent(s) — ${filterType === 'batch' ? `Batch ${filterValue}` : `Strand: ${filterValue}`}`,
    14, y
  );
  y += 10;

  filtered.forEach((r, idx) => {
    y = addPageIfNeeded(doc, y, pageH, 40);

    // ── Respondent header bar ─────────────────────────────────────────────
    doc.setFillColor(...NAVY);
    doc.roundedRect(14, y, 182, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(`${idx + 1}. ${pdfSafe(val(r.name))}`, 18, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      `${pdfSafe(val(r.email))}   |   Batch ${pdfSafe(val(r.batch))}   |   ${pdfSafe(val(r.program))}`,
      18, y + 13
    );
    y += 18;

    // ── SECTION 1: Personal Information ──────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 1 — PERSONAL INFORMATION', [59, 130, 246], y);
    const address = [r.streetAddress, r.city, r.province, r.zipCode, r.country].filter(Boolean).join(', ');
    [
      ['Student Number',   r.studentNumber],
      ['Gender',           r.gender],
      ['Birthday',         r.birthday],
      ['Civil Status',     r.civilStatus],
      ['Contact Number',   r.contact],
      ['Email Address',    r.email],
      ['Complete Address', address || 'N/A'],
    ].forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 2: Educational Background ────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 2 — EDUCATIONAL BACKGROUND', [16, 185, 129], y);
    [
      ['SHS Strand / Program', r.program],
      ['Year Graduated',       r.batch],
      ['Distinction',          r.distinction],
      ['Post-SHS Plans',       r.postGradPlans],
      ['School Continued To',  r.postGradCourse],
    ].forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 3: Employment / Status ───────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 3 — CURRENT STATUS', RED, y);
    [
      ['Current Status',       r.status],
      ['Job Title / Position', r.jobTitle],
      ['Company / Employer',   r.company],
      ['Industry',             r.industry],
      ['Monthly Income',       pdfSafe(r.salary)],
    ].forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 4: Job Experience ─────────────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 4 — JOB / STUDY EXPERIENCE', CYAN, y);
    [
      ['Time to Find First Job / School', r.timeToJob],
      ['How First Job Was Found',         r.howFoundJob],
      ['Factors That Helped',             (r.factorsForJob?.join(', ')) || 'N/A'],
    ].forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 5: Skills & Competencies ─────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 5 — SKILLS & COMPETENCIES', [139, 92, 246], y);
    [
      ['Useful Competencies',    (r.usefulCompetencies?.join(', ')) || 'N/A'],
      ['Communication Skills',   `${r.commSkillRating}/5  ${stars(r.commSkillRating)}`],
      ['Technical / IT Skills',  `${r.itSkillRating}/5  ${stars(r.itSkillRating)}`],
      ['Leadership Skills',      `${r.leadershipRating}/5  ${stars(r.leadershipRating)}`],
      ['Critical Thinking',      `${r.criticalRating}/5  ${stars(r.criticalRating)}`],
      ['Work Ethics',            `${r.workEthicsRating}/5  ${stars(r.workEthicsRating)}`],
    ].forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 6: Feedback & Engagement ─────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 6 — FEEDBACK & ENGAGEMENT', [249, 115, 22], y);
    [
      ['Satisfaction Rating',      r.satisfaction],
      ['Would Recommend NU Dasma', r.wouldRecommend],
      ['Suggestions',              r.suggestions],
      ['Willing to Participate',   (r.willingToParticipate?.join(', ')) || 'N/A'],
    ].forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });

    // ── Divider ───────────────────────────────────────────────────────────
    y += 6;
    if (idx < filtered.length - 1) {
      y = addPageIfNeeded(doc, y, pageH);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, y, 196, y);
      y += 8;
    }
  });

  // ── Page numbers ──────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text('National University - Dasmarinas  |  SHS Alumni Tracer Survey Report', 14, pageH - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageW - 14, pageH - 8, { align: 'right' });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = filterType === 'batch'
    ? `shs_alumni_report_batch_${filterValue}.pdf`
    : `shs_alumni_report_${filterValue.replace(/\s+/g, '_')}.pdf`;

  doc.save(filename);
};