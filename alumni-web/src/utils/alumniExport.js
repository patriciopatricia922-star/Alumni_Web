// ============================================================================
// alumniExport.js — Excel (.xlsx) export for Alumni Management
// ============================================================================
// Shared by AlumniManagement.jsx (Admin) and Superadminalumni.jsx (SuperAdmin).
// Presentation only: reads the alumni records already in memory and never
// touches the database or the stored survey data.
// Requires:  npm install exceljs
// ============================================================================

const MIN_COL_WIDTH = 12;
const MAX_COL_WIDTH = 40; // long text wraps instead of widening the column
const LINE_HEIGHT = 15;

// Returns a clean display string, or "N/A" when there is no usable value.
// Treated as "no usable value": null/undefined, empty/whitespace, the "—"
// placeholder used in the UI, values made only of symbols, and the literal
// strings null / undefined / n/a. Control characters and U+FFFD (the usual
// "random character" leftovers) are stripped before checking.
export const cleanExportValue = (value) => {
  if (value === null || value === undefined) return "N/A";
  let text = typeof value === "string" ? value : String(value);
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/g, "").trim();
  if (!text) return "N/A";
  if (/^[\s\-–—_.?#*~|\\/]+$/.test(text)) return "N/A";
  if (/^(null|undefined|n\/a|na)$/i.test(text)) return "N/A";
  return text;
};

// Same columns and order as the previous export. SHS gets Educational Status
// directly before Employment Status; College is unchanged.
export const buildAlumniExportRows = (alumniList, alumniType) => {
  const isSHS = alumniType === "shs";
  const headers = [
    "Name",
    "Email",
    "Program",
    "Batch",
    ...(isSHS ? ["Educational Status"] : []),
    "Employment Status",
    "Survey Status",
    "Account Status",
  ];
  const rows = alumniList.map((a) => [
    cleanExportValue(a.name),
    cleanExportValue(a.email),
    cleanExportValue(a.program),
    cleanExportValue(a.batch),
    ...(isSHS ? [cleanExportValue(a.shs_educational_status)] : []),
    cleanExportValue(a.employment_status),
    a.survey_status === "completed" ? "Completed" : "Pending",
    a.account_status === "active" ? "Active" : "Inactive",
  ]);
  return { headers, rows };
};

const estimateLines = (text, width) =>
  String(text)
    .split("\n")
    .reduce((sum, part) => sum + Math.max(1, Math.ceil(part.length / Math.max(1, width - 1))), 0);

export const buildAlumniWorkbook = async (alumniList, alumniType) => {
  const ExcelJS = (await import("exceljs")).default;
  const { headers, rows } = buildAlumniExportRows(alumniList, alumniType);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Alumni");

  // Column widths: fit the content, but never below MIN or above MAX.
  const widths = headers.map((h, c) => {
    const longest = Math.max(h.length, ...rows.map((r) => String(r[c]).length));
    return Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, longest + 2));
  });
  sheet.columns = headers.map((h, c) => ({ header: h, key: `c${c}`, width: widths[c] }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };

  rows.forEach((values, r) => {
    const row = sheet.addRow(values);
    row.alignment = { wrapText: true, vertical: "top" };
    // Row height: tall enough for the most-wrapped cell so text is visible.
    const lines = Math.max(...values.map((v, c) => estimateLines(v, widths[c])));
    if (lines > 1) row.height = lines * LINE_HEIGHT;
  });

  return workbook;
};

export const exportAlumniToExcel = async (alumniList, alumniType) => {
  const workbook = await buildAlumniWorkbook(alumniList, alumniType);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `alumni_export_${new Date().toISOString().split("T")[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};