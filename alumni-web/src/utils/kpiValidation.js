// ============================================================================
// kpiValidation.js — DEVELOPMENT-ONLY validation report for the KPI engine
// ============================================================================
// Produces, for every KPI: eligible population, evaluable (d), qualifying (n),
// raw %, display %, and which anonymised rows were included / excluded /
// qualifying / non-qualifying. Rows are identified by an index (R01, R02 ...)
// and program only. No names, emails, IDs or free-text answers are included.
// Never render this in the production UI.
// ============================================================================

export const formatValidationReport = (dataset, results) => {
  const lines = [];
  lines.push(`Eligible College alumni: ${dataset.eligible.length}`);
  lines.push(
    `Excluded from the College dataset: ${dataset.excluded.length}` +
      (dataset.excluded.length
        ? " (" + dataset.excluded.map((e) => `${e.ref}:${e.reason}`).join(", ") + ")"
        : ""),
  );
  dataset.warnings.forEach((w) => lines.push(`WARNING ${w}`));
  lines.push("");

  Object.values(results).forEach((r) => {
    lines.push(`KPI: ${r.label}  [${r.basis}]`);
    lines.push(`  Eligible population: ${r.breakdown.eligiblePopulation}`);
    if (r.status === "not_measurable") {
      lines.push(`  Status: ${r.note}`);
      lines.push("");
      return;
    }
    lines.push(`  Evaluable (d): ${r.d}`);
    lines.push(`  Qualifying (n): ${r.n}`);
    lines.push(`  Raw percentage: ${r.rawPct === null ? "n/a" : r.rawPct}`);
    lines.push(`  Display percentage: ${r.displayPct === null ? "n/a" : r.displayPct}`);
    lines.push(`  Target: ${r.target === null ? "No target set" : r.target + "% (" + r.targetDir + ")"}  Status: ${r.status}`);
    const by = (o) => r.rows.filter((x) => x.outcome === o).map((x) => `${x.ref}(${x.reason})`).join(" ") || "-";
    lines.push(`  Qualifying:     ${by("qualifying")}`);
    lines.push(`  Non-qualifying: ${by("non_qualifying")}`);
    lines.push(`  Excluded (not evaluable): ${by("not_evaluable")}`);
    lines.push("");
  });
  return lines.join("\n");
};