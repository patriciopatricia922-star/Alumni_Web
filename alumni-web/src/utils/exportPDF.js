// ============================================================================
// exportPDF.js
// ============================================================================
// Generates a full Alumni Tracer Survey PDF report.
// Called from ResponseAnalyticsView when the admin clicks Export.
//
// FIX: Added Unicode normalization for salary range labels and special
//      characters (₱, en-dash –) that were rendering as corrupted symbols
//      due to the default helvetica font's limited glyph set.
//      Analytics logic, aggregation, and data flow remain untouched.
// ============================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../lib/supabase';

// ── Colors ──────────────────────────────────────────────────────────────────
const NAVY   = [30,  45,  90];
const BLUE   = [79, 163, 247];
const GRAY   = [107, 114, 128];
const LGRAY  = [241, 245, 249];
const WHITE  = [255, 255, 255];
const GREEN  = [16, 185, 129];
const AMBER  = [245, 158, 11];
const RED    = [239, 68, 68];
const PURPLE = [139, 92, 246];

// ── Helpers ──────────────────────────────────────────────────────────────────
const val = (v) => (v && String(v).trim() !== '' ? String(v) : 'N/A');
const stars = (n) => {
  const filled = Number(n) || 0;
  return `[${'*'.repeat(filled)}${'-'.repeat(5 - filled)}]`;
};

// ── FIX: Unicode normalization helper for PDF-safe text ────────────────────
// Converts characters unsupported by helvetica to ASCII equivalents.
// Applied only to text entering PDF rendering — source data is never modified.
// ============================================================================
const pdfSafe = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    // Philippine peso sign → PHP (or use 'P' if you prefer shorter)
    .replace(/\u20B1/g, 'PHP ')
    // en dash → standard hyphen
    .replace(/\u2013/g, '-')
    // em dash → double hyphen
    .replace(/\u2014/g, '--')
    // left/right smart quotes → straight quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // bullet → asterisk
    .replace(/\u2022/g, '*')
    // ellipsis → three dots
    .replace(/\u2026/g, '...')
    // non-breaking space → regular space
    .replace(/\u00A0/g, ' ')
    // any remaining non-ASCII characters (fallback: remove or replace with '?')
    // This is intentionally conservative; only triggers for truly unmapped chars
    .replace(/[^\x00-\x7F]/g, '?');
};

// ── FIX: Normalize salary range values for PDF display ─────────────────────
// Preserves the original data; returns a display-safe version.
// Maps from stored analytics keys to readable PDF labels.
// ============================================================================
const normalizeSalaryRange = (range) => {
  if (!range || typeof range !== 'string') return range;
  // Apply Unicode normalization
  const safe = pdfSafe(range);
  return safe;
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
  // FIX: Apply pdfSafe to value to handle any special characters
  const safeValue = pdfSafe(val(value));
  const lines = doc.splitTextToSize(safeValue, 120);
  doc.text(lines, 70, y);
  return y + (lines.length * 4.5) + 1;
};

const addPageIfNeeded = (doc, y, pageH, margin = 20) => {
  if (y > pageH - margin) { doc.addPage(); return 20; }
  return y;
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================
export const exportSurveyPDF = async ({
  filterType,       // 'batch' | 'program'
  filterValue,      // e.g. '2023' or 'BSIT'
  stats,            // full stats object from ResponseAnalytics state
  respondents,      // full respondents array
}) => {
  // ── Filter respondents ────────────────────────────────────────────────────
  const filtered = respondents.filter(r =>
    filterType === 'batch' ? r.batch === filterValue : r.program === filterValue
  );

  if (filtered.length === 0) {
    alert('No respondents found for the selected filter.');
    return;
  }

  // ── Compute summary stats for the filtered group ──────────────────────────
  const totalFiltered   = filtered.length;
  const employed        = filtered.filter(r => r.status?.toLowerCase().includes('employ') && !r.status?.toLowerCase().includes('un')).length;
  const selfEmployed    = filtered.filter(r => r.status?.toLowerCase().includes('self')).length;
  const unemployed      = filtered.filter(r => r.status?.toLowerCase().includes('unemployed')).length;
  const employmentRate  = totalFiltered > 0 ? Math.round(((employed + selfEmployed) / totalFiltered) * 100) : 0;

  const satisfactions   = filtered.map(r => {
    const map = { 'very satisfied': 5, 'satisfied': 4, 'neutral': 3, 'dissatisfied': 2, 'very dissatisfied': 1 };
    return map[r.satisfaction?.toLowerCase()] || null;
  }).filter(Boolean);
  const avgSatisfaction = satisfactions.length > 0
    ? (satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length).toFixed(1)
    : 'N/A';

  const withCert  = filtered.filter(r => r.certiportPasser === 'Yes' || r.certifications?.length > 0).length;
  const boardPass = filtered.filter(r => r.boardExamResult?.toLowerCase().includes('pass')).length;

  // ── Initialize PDF ────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();

  // ── Single y declaration for the entire function ──────────────────────────
  let y = 20;

  // ==========================================================================
  // PAGE 1 — COVER
  // ==========================================================================
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 60, 'F');

  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Alumni Tracer Survey Report', pageW / 2, 30, { align: 'center' });
  doc.setFontSize(14);

  doc.setFillColor(...BLUE);
  doc.rect(0, 58, pageW, 1, 'F');

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('National University - Dasmarinas', pageW / 2, 73, { align: 'center' });
  doc.text('Alumni Affairs Office', pageW / 2, 80, { align: 'center' });

  // Filter pill
  doc.setFillColor(...LGRAY);
  doc.roundedRect(55, 85, 100, 14, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(
    filterType === 'batch' ? `Batch ${filterValue}` : `Program: ${filterValue}`,
    pageW / 2, 94, { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Date Generated: ${new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' })}`, pageW / 2, 110, { align: 'center' });
  doc.text(`Total Respondents in this Report: ${totalFiltered}`, pageW / 2, 117, { align: 'center' });

  // ── Fetch KPI data from Supabase ──────────────────────────────────────────
  let internshipPct = 0, empTwoYearsPct = 0, fieldRelatedPct = 0;
  let outsideFieldPct = 0, entrepreneurPct = 0, supervisoryPct = 0;
  let gradStudiesPct = 0;

  try {
    const UNEMPLOYED_STATUSES = new Set([
      'Unemployed', 'Unemployed, but looking for work',
      'Unemployed, but not looking for work', 'Not employed', 'Looking for work',
    ]);
    const SUPERVISORY_KEYWORDS = ['manager','supervisor','lead','leader','head','director','chief','officer','coordinator'];

    const { data: kpiRows } = await supabase
      .from('survey_progress')
      .select('employment_information_data, educational_background_data, job_experience_data');

    if (kpiRows && kpiRows.length > 0) {
      const parsed = kpiRows.map(row => ({
        emp: typeof row.employment_information_data === 'object' ? row.employment_information_data : null,
        edu: typeof row.educational_background_data === 'object' ? row.educational_background_data : null,
        job: typeof row.job_experience_data === 'object' ? row.job_experience_data : null,
      }));

      const isEmployed = (emp) => {
        if (!emp) return false;
        const status = emp.employment_status || '';
        if (!status) return !!(emp.job_position || emp.company_name);
        return !UNEMPLOYED_STATUSES.has(status);
      };

      const withEmp = parsed.filter(r => r.emp !== null);
      const withEdu = parsed.filter(r => r.edu !== null);
      const withJob = parsed.filter(r => r.job !== null);
      const kpiEmployed = withEmp.filter(r => isEmployed(r.emp));

      const internSrc = ['internship','ojt','on-the-job','practicum'];
      const internCount = withJob.filter(r => {
        const src = (r.job.first_job_source || '').toLowerCase();
        return internSrc.some(kw => src.includes(kw));
      }).length;
      internshipPct = withJob.length > 0 ? Math.round((internCount / withJob.length) * 100) : 0;

      empTwoYearsPct = withEmp.length > 0 ? Math.round((kpiEmployed.length / withEmp.length) * 100) : 0;

      const fieldCount = kpiEmployed.filter(r => {
        const v = r.emp.job_related_to_degree || '';
        return v === 'Yes' || v === true;
      }).length;
      fieldRelatedPct = kpiEmployed.length > 0 ? Math.round((fieldCount / kpiEmployed.length) * 100) : 0;

      const outsideCount = kpiEmployed.filter(r => {
        const v = r.emp.job_related_to_degree || '';
        return v === 'No' || v === false;
      }).length;
      outsideFieldPct = kpiEmployed.length > 0 ? Math.round((outsideCount / kpiEmployed.length) * 100) : 0;

      const entCount = withEmp.filter(r => {
        const s = r.emp.employment_status || '';
        return s === 'Self-Employed' || s === 'Self-employed';
      }).length;
      entrepreneurPct = withEmp.length > 0 ? Math.round((entCount / withEmp.length) * 100) : 0;

      const supCount = kpiEmployed.filter(r => {
        const pos = (r.emp.job_position || '').toLowerCase();
        return SUPERVISORY_KEYWORDS.some(kw => pos.includes(kw));
      }).length;
      supervisoryPct = kpiEmployed.length > 0 ? Math.round((supCount / kpiEmployed.length) * 100) : 0;

      const gradCount = withEdu.filter(r => {
        const v = r.edu.plans_postgraduate || r.edu.post_graduate_plans || '';
        return v === 'Yes' || v === true;
      }).length;
      gradStudiesPct = withEdu.length > 0 ? Math.round((gradCount / withEdu.length) * 100) : 0;
    }
  } catch (e) {
    console.warn('KPI fetch failed, skipping KPI section:', e);
  }

  // Summary stat boxes on cover
  const boxes = [
    { label: 'Total Respondents',  value: String(totalFiltered),   color: NAVY   },
    { label: 'Employment Rate',    value: `${employmentRate}%`,    color: GREEN  },
    { label: 'Avg Satisfaction',   value: `${avgSatisfaction}/5`,  color: AMBER  },
    { label: 'With Certification', value: String(withCert),        color: PURPLE },
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

  // ── KPI section on cover page ─────────────────────────────────────────────
  let ky = 158;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('INSTITUTIONAL KPIs', 14, ky);
  doc.setFillColor(...BLUE);
  doc.rect(14, ky + 2, 182, 0.4, 'F');
  ky += 10;

  const kpiGroups = [
    {
      label: 'EMPLOYMENT',
      color: [59, 130, 246],
      items: [
        ['Absorption from Internship', `${internshipPct}%`],
        ['Employed Within 2 Yrs of Graduation', `${empTwoYearsPct}%`],
        ['Employed in Field / Related Field', `${fieldRelatedPct}%`],
      ],
    },
    {
      label: 'CAREER PROGRESS',
      color: [16, 185, 129],
      items: [
        ['Employed Outside Field of Specialization', `${outsideFieldPct}%`],
        ['Engaged in Entrepreneurship', `${entrepreneurPct}%`],
        ['Occupying Supervisory Positions', `${supervisoryPct}%`],
      ],
    },
    {
      label: 'EDUCATION',
      color: [245, 158, 11],
      items: [
        ['Pursued Graduate Studies (within 1 yr)', `${gradStudiesPct}%`],
      ],
    },
  ];

  kpiGroups.forEach(group => {
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

  // ── AI Insights from predictive analytics backend ─────────────────────────
  let aiInsights = null;
  try {
    const { data: predRows } = await supabase
      .from('predictions')
      .select('*')
      .order('year', { ascending: true });

    if (predRows && predRows.length > 0) {
      const byYear = {};
      predRows.forEach(({ year, predicted_rate }) => {
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(predicted_rate);
      });
      const overviewTrend = Object.entries(byYear)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, rates]) => ({
          year: String(year),
          value: Math.round(rates.reduce((s, r) => s + r, 0) / rates.length),
        }));

      const byDept = {};
      predRows.forEach((row) => {
        if (!byDept[row.department]) byDept[row.department] = [];
        byDept[row.department].push(row);
      });
      const departments = Object.entries(byDept).map(([dept, rows]) => {
        const sorted = [...rows].sort((a, b) => a.year - b.year);
        const current   = Math.round(sorted[0].current_rate ?? sorted[0].predicted_rate ?? 0);
        const predicted = Math.round(sorted[sorted.length - 1].predicted_rate);
        return { code: dept, name: dept, current_rate: current, predicted_rate: predicted, change: predicted - current };
      });

      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
      const aiRes = await fetch(`${API_BASE}/api/ai/predictive-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overview_trend: overviewTrend, departments, current_view: 'overview', selected_department: null }),
      });
      if (aiRes.ok) aiInsights = await aiRes.json();
    }
  } catch (e) {
    console.warn('AI insights fetch failed, skipping:', e);
  }

  // ==========================================================================
  // PAGE 2 — PREDICTIVE ANALYTICS SUMMARY
  // ==========================================================================
  doc.addPage();
  y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text('Predictive Analytics — Career Alignment Forecast', 14, y);
  y += 3;
  doc.setFillColor(...BLUE);
  doc.rect(14, y, 182, 0.5, 'F');
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text('Predicted career-to-degree alignment rates generated by the ML model (2025 - 2030).', 14, y);
  y += 10;

  // ── Fetch predictions from Supabase ───────────────────────────────────────
  try {
    const { data: predRows } = await supabase
      .from('predictions')
      .select('*')
      .order('year', { ascending: true });

    if (predRows && predRows.length > 0) {
      // ── Overall trend table ───────────────────────────────────────────────
      y = addPageIfNeeded(doc, y, pageH);
      y = drawSectionBanner(doc, 'OVERALL PREDICTED ALIGNMENT TREND (All Departments)', NAVY, y);

      const byYear = {};
      predRows.forEach(({ year, predicted_rate }) => {
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(predicted_rate);
      });
      const trendRows = Object.entries(byYear)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, rates]) => [
          String(year),
          `${Math.round(rates.reduce((s, r) => s + r, 0) / rates.length)}%`,
        ]);

      autoTable(doc, {
        startY: y,
        head: [['Year', 'Avg Predicted Alignment Rate']],
        body: trendRows,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LGRAY },
        columnStyles: { 0: { cellWidth: 36 }, 1: { cellWidth: 146 } },
        margin: { left: 14, right: 14 },
        showHead: 'firstPage',
      });
      y = doc.lastAutoTable.finalY + 10;

      // ── Per-program breakdown table ───────────────────────────────────────
      y = addPageIfNeeded(doc, y, pageH);
      y = drawSectionBanner(doc, 'PROGRAM-LEVEL CAREER ALIGNMENT PREDICTIONS', NAVY, y);

      const byProgram = {};
      predRows.forEach((row) => {
        if (!byProgram[row.program]) byProgram[row.program] = [];
        byProgram[row.program].push(row);
      });

      const programRows = Object.entries(byProgram).map(([program, rows]) => {
        const sorted = [...rows].sort((a, b) => Number(a.year) - Number(b.year));
        const baseRow = sorted[0];
        const endRow  = sorted[sorted.length - 1];
        const actual    = Math.round(baseRow.current_rate ?? baseRow.predicted_rate ?? 0);
        const predicted = Math.round(endRow.predicted_rate ?? 0);
        const change    = predicted - actual;
        return [
          program,
          String(baseRow.year),
          `${actual}%`,
          String(endRow.year),
          `${predicted}%`,
          `${change >= 0 ? '+' : ''}${change}%`,
        ];
      }).sort((a, b) => {
        const bChange = parseInt(b[5]);
        const aChange = parseInt(a[5]);
        return bChange - aChange;
      });

      autoTable(doc, {
        startY: y,
        head: [['Program', 'Base Year', 'Actual Rate', 'Forecast Year', 'Predicted Rate', 'Change']],
        body: programRows,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LGRAY },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 27 },
          5: { cellWidth: 25 },
        },
        margin: { left: 14, right: 14 },
        showHead: 'firstPage',
        didParseCell: (data) => {
          if (data.column.index === 5 && data.section === 'body') {
            const v = parseInt(data.cell.raw);
            data.cell.styles.textColor = v >= 0 ? [16, 185, 129] : [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });
      y = doc.lastAutoTable.finalY + 8;

      // ── Note about AI insights ────────────────────────────────────────────
      y = addPageIfNeeded(doc, y, pageH);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, y, 182, 16, 3, 3, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(
        'Note: AI-generated insights are not included in this export. View the Predictive Analytics page in the admin dashboard for full AI recommendations.',
        18, y + 6,
        { maxWidth: 174 }
      );
      y += 20;

    } else {
      y = addPageIfNeeded(doc, y, pageH);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text('No prediction data available.', 14, y);
      y += 10;
    }
  } catch (e) {
    console.warn('Predictions fetch failed for PDF:', e);
  }

  // ==========================================================================
  // PAGE 3 — AI INSIGHTS
  // ==========================================================================
  doc.addPage();
  let yAI = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text('AI Predictive Insights', 14, yAI);
  yAI += 3;
  doc.setFillColor(...BLUE);
  doc.rect(14, yAI, 182, 0.5, 'F');
  yAI += 10;

  if (aiInsights) {
    const sections = [
      { label: 'Key Insight',    value: aiInsights.key_insight },
      { label: 'Trend Analysis', value: aiInsights.trend_analysis },
      { label: 'Risk Alert',     value: aiInsights.risk_alert },
    ];

    sections.forEach(({ label, value }) => {
      if (!value) return;
      yAI = addPageIfNeeded(doc, yAI, pageH);
      yAI = drawSectionBanner(doc, label.toUpperCase(), NAVY, yAI);
      // FIX: Apply pdfSafe to AI-generated text which may contain Unicode
      const lines = doc.splitTextToSize(pdfSafe(String(value)), 174);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      doc.text(lines, 18, yAI);
      yAI += lines.length * 5 + 6;
    });

    if (aiInsights.department_insights?.length > 0) {
      yAI = addPageIfNeeded(doc, yAI, pageH);
      yAI = drawSectionBanner(doc, 'DEPARTMENT HIGHLIGHTS', NAVY, yAI);
      aiInsights.department_insights.forEach((item) => {
        yAI = addPageIfNeeded(doc, yAI, pageH);
        const lines = doc.splitTextToSize(pdfSafe(`• ${item}`), 170);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text(lines, 20, yAI);
        yAI += lines.length * 5 + 3;
      });
      yAI += 4;
    }

    if (aiInsights.recommendations?.length > 0) {
      yAI = addPageIfNeeded(doc, yAI, pageH);
      yAI = drawSectionBanner(doc, 'AI RECOMMENDATIONS', NAVY, yAI);
      aiInsights.recommendations.forEach((item) => {
        yAI = addPageIfNeeded(doc, yAI, pageH);
        const lines = doc.splitTextToSize(pdfSafe(`• ${item}`), 170);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text(lines, 20, yAI);
        yAI += lines.length * 5 + 3;
      });
    }

  } else {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yAI, 182, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(
      'AI insights are currently unavailable. The predictive analytics backend may be offline.\nView the Predictive Analytics page in the admin dashboard for full AI recommendations.',
      18, yAI + 7,
      { maxWidth: 174 }
    );
  }

  // ==========================================================================
  // PAGE 4 — SURVEY ANALYTICS SUMMARY
  // ==========================================================================
  doc.addPage();
  y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text('Survey Analytics Summary', 14, y);
  y += 3;
  doc.setFillColor(...BLUE);
  doc.rect(14, y, 182, 0.5, 'F');
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Filter: ${filterType === 'batch' ? `Batch ${filterValue}` : `Program — ${filterValue}`}   |   Respondents included: ${totalFiltered} of ${respondents.length} total`, 14, y);
  y += 10;

  // ── Employment Breakdown ──────────────────────────────────────────────────
  y = drawSectionBanner(doc, 'EMPLOYMENT STATUS BREAKDOWN', NAVY, y);
  autoTable(doc, {
    startY: y,
    head: [['Status', 'Count', '% of Group']],
    body: [
      ['Employed',      employed,     `${totalFiltered > 0 ? Math.round((employed / totalFiltered) * 100) : 0}%`],
      ['Self-Employed', selfEmployed, `${totalFiltered > 0 ? Math.round((selfEmployed / totalFiltered) * 100) : 0}%`],
      ['Unemployed',    unemployed,   `${totalFiltered > 0 ? Math.round((unemployed / totalFiltered) * 100) : 0}%`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: LGRAY },
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 36 }, 2: { cellWidth: 36 } },
    margin: { left: 14, right: 14 },
    showHead: 'firstPage',
  });
  y = doc.lastAutoTable.finalY + 8;

  // ── Gender Distribution ───────────────────────────────────────────────────
  if (stats.genderDistribution?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'GENDER DISTRIBUTION (All Respondents)', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Gender', 'Count']],
      body: stats.genderDistribution.map(g => [g.name, g.value]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold' },
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
      headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 146 }, 1: { cellWidth: 36 } },
      margin: { left: 14, right: 14 },
      showHead: 'firstPage',
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Salary Range ──────────────────────────────────────────────────────────
  // FIX: Apply pdfSafe normalization to salary range labels to prevent
  // Unicode character corruption (₱ → PHP, – → -) in PDF output.
  // The stats.salary data remains unmodified.
  // ==========================================================================
  if (stats.salary?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'SALARY RANGE DISTRIBUTION', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Salary Range', 'Count']],
      // FIX: Normalize each salary range string for PDF-safe rendering
      body: stats.salary.map(s => [pdfSafe(s.range), s.count]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold' },
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
    y = drawSectionBanner(doc, 'TIME TO FIRST JOB', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Duration', 'Count']],
      // FIX: Normalize time-to-job labels (may contain en dashes)
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

  // ── Board Exam ────────────────────────────────────────────────────────────
  if (stats.boardExam?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'BOARD EXAM RESULTS', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Result', 'Count']],
      body: stats.boardExam.map(b => [b.category, b.count]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: RED, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: { 0: { cellWidth: 146 }, 1: { cellWidth: 36 } },
      margin: { left: 14, right: 14 },
      showHead: 'firstPage',
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── Certification ─────────────────────────────────────────────────────────
  if (stats.certification?.length > 0) {
    if (y > pageH - 40) { doc.addPage(); y = 20; }
    y = drawSectionBanner(doc, 'CERTIFICATION STATUS', NAVY, y);
    autoTable(doc, {
      startY: y,
      head: [['Status', 'Count']],
      body: stats.certification.map(c => [c.status, c.count]),
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
      body: stats.satisfactionScores.map(s => [
        `${s.score}/5`,
        stars(s.score),
        s.count,
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: AMBER, textColor: WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LGRAY },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 36 }, 1: { cellWidth: 110 }, 2: { cellWidth: 36 } },
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
    doc.text(`Overall Average Satisfaction: ${stats.avgSatisfaction || 'N/A'} / 5  ${stars(Math.round(stats.avgSatisfaction || 0))}`, 18, y + 9);
    y += 20;
  }

  // ==========================================================================
  // PAGE 5+ — INDIVIDUAL RESPONDENT RECORDS
  // ==========================================================================
  doc.addPage();
  y = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text('Individual Survey Responses', 14, y);
  y += 3;
  doc.setFillColor(...BLUE);
  doc.rect(14, y, 182, 0.5, 'F');
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Showing ${totalFiltered} respondent(s) filtered by ${filterType === 'batch' ? `Batch ${filterValue}` : `Program: ${filterValue}`}`, 14, y);
  y += 10;

  filtered.forEach((r, idx) => {
    // ── Respondent header bar ───────────────────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH, 40);

    doc.setFillColor(...NAVY);
    doc.roundedRect(14, y, 182, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...WHITE);
    doc.text(`${idx + 1}. ${pdfSafe(val(r.name))}`, 18, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${pdfSafe(val(r.email))}   |   Batch ${pdfSafe(val(r.batch))}   |   ${pdfSafe(val(r.program))}`, 18, y + 13);
    y += 18;

    // ── SECTION 1: Personal Information ────────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 1 — PERSONAL INFORMATION', [59, 130, 246], y);

    const address = [r.streetAddress, r.city, r.province, r.zipCode, r.country].filter(Boolean).join(', ');
    const personalFields = [
      ['Student Number',   r.studentNumber],
      ['Gender',           r.gender],
      ['Birthday',         r.birthday],
      ['Civil Status',     r.civilStatus],
      ['Contact Number',   r.contact],
      ['Email Address',    r.email],
      ['Complete Address', address || 'N/A'],
    ];
    personalFields.forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 2: Educational Background ──────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 2 — EDUCATIONAL BACKGROUND', [16, 185, 129], y);

    const eduFields = [
      ['Degree Program',    r.program],
      ['Year Graduated',    r.batch],
      ['Distinction',       r.distinction],
      ['Reason for Course', r.reasonTakingCourse],
      ['Post-Grad Plans',   r.postGradPlans],
      ['Post-Grad Course',  r.postGradCourse],
      ['Board Exam Name',   r.boardExamName],
      ['Board Exam Date',   r.boardExamDate],
      ['Board Exam Result', r.boardExamResult],
      ['Licensure Plans',   r.licensurePlans],
    ];
    eduFields.forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 3: Certification ────────────────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 3 — CERTIFICATION ACHIEVEMENTS', [245, 158, 11], y);

    const certFields = [
      ['Certiport Passer',      r.certiportPasser],
      ['Certifications Earned', (r.certifications?.join(', ')) || 'None'],
      ['Helped Career',         r.certificationUseful],
      ['How It Helped',         r.certificationUsefulness],
    ];
    certFields.forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 4: Employment ───────────────────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 4 — EMPLOYMENT INFORMATION', [239, 68, 68], y);

    const empFields = [
      ['Employment Status',        r.status],
      ['Job Related to Degree',    r.jobRelatedToDegree],
      ['Job Title / Position',     r.jobTitle],
      ['Company / Employer',       r.company],
      ['Industry',                 r.industry],
      ['Employment Location',      r.employmentLocation],
      // FIX: Apply pdfSafe to salary value for individual respondents
      ['Monthly Income Range',     pdfSafe(r.salary)],
      ['Reason for Accepting Job', r.jobAcceptReason],
      ['Unemployed Reason',        r.unemployedReason],
    ];
    empFields.forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 5: Job Experience ───────────────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 5 — JOB EXPERIENCE', [6, 182, 212], y);

    const jobExpFields = [
      ['Time to Find First Job',  r.timeToJob],
      ['Duration in Current Job', r.employmentDuration],
      ['How First Job Was Found', r.howFoundJob],
      ['Factors That Helped',     (r.factorsForJob?.join(', ')) || 'N/A'],
    ];
    jobExpFields.forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 6: Skills & Competencies ────────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 6 — SKILLS & COMPETENCIES', [139, 92, 246], y);

    const skillFields = [
      ['Useful Competencies',         (r.usefulCompetencies?.join(', ')) || 'N/A'],
      ['Suggested Skills to Develop', r.suggestedSkills],
      ['Communication Skills',        `${r.commSkillRating}/5  ${stars(r.commSkillRating)}`],
      ['IT Skills',                   `${r.itSkillRating}/5  ${stars(r.itSkillRating)}`],
      ['Leadership Skills',           `${r.leadershipRating}/5  ${stars(r.leadershipRating)}`],
      ['Critical Thinking',           `${r.criticalRating}/5  ${stars(r.criticalRating)}`],
      ['Work Ethics',                 `${r.workEthicsRating}/5  ${stars(r.workEthicsRating)}`],
    ];
    skillFields.forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });
    y += 4;

    // ── SECTION 7: Feedback & Engagement ────────────────────────────────────
    y = addPageIfNeeded(doc, y, pageH);
    y = drawSectionBanner(doc, 'SECTION 7 — FEEDBACK & ALUMNI ENGAGEMENT', [249, 115, 22], y);

    const feedbackFields = [
      ['Satisfaction Rating',      r.satisfaction],
      ['Would Recommend NU Dasma', r.wouldRecommend],
      ['Suggestions',              r.suggestions],
      ['Informed About Events',    r.informedAboutEvents],
      ['Willing to Participate',   (r.willingToParticipate?.join(', ')) || 'N/A'],
    ];
    feedbackFields.forEach(([label, value]) => {
      y = addPageIfNeeded(doc, y, pageH);
      y = fieldRow(doc, label, value, y, pageH);
    });

    // ── Divider between respondents ─────────────────────────────────────────
    y += 6;
    if (idx < filtered.length - 1) {
      y = addPageIfNeeded(doc, y, pageH);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, y, 196, y);
      y += 8;
    }
  });

  // ── Page numbers + footer on every page ───────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text('National University - Dasmarinas Alumni Tracer Survey Report', 14, pageH - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageW - 14, pageH - 8, { align: 'right' });
    if (i === 1) {
      doc.text('This document is confidential and intended for authorized personnel only.', pageW / 2, pageH - 14, { align: 'center' });
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = filterType === 'batch'
    ? `alumni_report_batch_${filterValue}.pdf`
    : `alumni_report_${filterValue.replace(/\s+/g, '_')}.pdf`;

  doc.save(filename);
};