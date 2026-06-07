/**
 * useSurveyBranching.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Evaluates Admin-configured branching rules for a survey section.
 *
 * Usage (identical for every section controller):
 *
 *   import { useSurveyBranching } from '../lib/useSurveyBranching';
 *
 *   const { shouldShowField, branchingReady } = useSurveyBranching(
 *     'Educational Background',   // must match Admin section title exactly
 *     INDEX_TO_FIELD,             // string[] — maps question index → form key
 *     form,                       // current form state object
 *   );
 *
 * Then in JSX:
 *   {shouldShowField('post_grad_course') && <div className="eb-field">…</div>}
 *
 * When no branching rules are configured (branches === {}), every call to
 * shouldShowField() returns true — zero regressions on un-branched surveys.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW BRANCHING WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * The Admin stores rules as:
 *   {
 *     "q-<uid>-opt<N>": ["q-<destUid>", …],  // when option N is chosen,
 *                                              // show these destinations
 *     "q-<uid>":        ["next"],              // question-level fallback
 *   }
 *
 * A question is VISIBLE if:
 *   (a) No branching rules exist for the section  — always show
 *   (b) The question is not the destination of any rule — always show
 *   (c) The question IS a destination of a rule AND the option that triggered
 *       that rule is currently selected — show
 *   (d) The question IS a destination of a rule AND none of the options that
 *       reference it are selected — HIDE
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useMemo } from 'react';
import { getBranches, getConfigSection } from './surveyConfig';

/**
 * @param {string}   sectionTitle  - Admin section title (case-sensitive)
 * @param {string[]} indexToField  - Maps question array index → form field key
 * @param {object}   form          - Current form state
 * @param {'college'|'shs'} [departmentType='college']
 * @returns {{ shouldShowField: (fieldKey: string) => boolean, branchingReady: boolean }}
 */
export function useSurveyBranching(
  sectionTitle,
  indexToField,
  form,
  departmentType = 'college',
) {
  const [branches,      setBranches]      = useState({});
  const [sectionConfig, setSectionConfig] = useState(null);
  const [branchingReady, setBranchingReady] = useState(false);

  // ── Load branches + section config once on mount ────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [br, sec] = await Promise.all([
          getBranches(departmentType),
          getConfigSection(sectionTitle, departmentType),
        ]);
        if (cancelled) return;
        setBranches(br  ?? {});
        setSectionConfig(sec ?? null);
      } catch (err) {
        console.error('[useSurveyBranching] Failed to load branching config:', err);
        if (!cancelled) {
          setBranches({});
          setSectionConfig(null);
        }
      } finally {
        if (!cancelled) setBranchingReady(true);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [sectionTitle, departmentType]);

  // ── Build a lookup: question uid → form field key ────────────────────────
  // This lets us map branch destination refs ("q-<uid>") back to field keys.
  const qIdToFieldKey = useMemo(() => {
    if (!sectionConfig) return {};
    const map = {};
    sectionConfig.questions.forEach((q, idx) => {
      const fieldKey = indexToField[idx];
      if (fieldKey) map[String(q.id)] = fieldKey;
    });
    return map;
  }, [sectionConfig, indexToField]);

  // ── Build the set of question IDs that are currently SKIPPED ────────────
  //
  // Algorithm:
  //   For every question in the section that has option-level branch rules:
  //     1. Find which option the user has currently selected.
  //     2. Look up that option's rule: triggeredDests = branches["q-<id>-opt<N>"]
  //     3. Collect ALL destinations referenced by ANY option of this question.
  //     4. Any destination that appears in other options' rules but NOT in the
  //        triggered option's rule is considered skipped.
  //
  //   Special sentinel values "next" and "end" are never skipped — they are
  //   control-flow signals, not question references.
  //
  const skippedQIds = useMemo(() => {
    const skipped = new Set();

    if (!branchingReady || !sectionConfig || Object.keys(branches).length === 0) {
      return skipped;
    }

    sectionConfig.questions.forEach((q, qIdx) => {
      // Only multiple-choice questions can trigger branching
      if (q.type !== 'multiple' || !Array.isArray(q.options) || q.options.length === 0) {
        return;
      }

      const fieldKey = indexToField[qIdx];
      if (!fieldKey) return;

      // Does this question have any option-level rules at all?
      const hasRules = q.options.some((_, i) =>
        Object.prototype.hasOwnProperty.call(branches, `q-${q.id}-opt${i}`)
      );
      if (!hasRules) return;

      const selectedValue   = form[fieldKey];
      const selectedOptIdx  = selectedValue != null
        ? q.options.indexOf(selectedValue)
        : -1;

      // Collect destinations for the SELECTED option (or empty if nothing selected)
      const triggeredDests = new Set(
        selectedOptIdx !== -1
          ? (branches[`q-${q.id}-opt${selectedOptIdx}`] ?? ['next'])
          : ['next']
      );

      // Collect destinations for ALL OTHER options
      q.options.forEach((_, i) => {
        if (i === selectedOptIdx) return;
        const dests = branches[`q-${q.id}-opt${i}`] ?? ['next'];
        dests.forEach(dest => {
          if (dest === 'next' || dest === 'end') return;
          // dest is "q-<uid>" — skip it if the current selection doesn't include it
          if (!triggeredDests.has(dest)) {
            const destId = dest.startsWith('q-') ? dest.slice(2) : dest;
            skipped.add(destId);
          }
        });
      });

      // Also: if the triggered option explicitly lists specific destinations,
      // any question that is ONLY reachable via other options (not "next" or
      // the triggered option's dests) should also be skipped.
      // The loop above handles this — we skip anything not in triggeredDests.
    });

    return skipped;
  }, [branches, sectionConfig, indexToField, form, branchingReady]);

  // ── Public API ────────────────────────────────────────────────────────────
  /**
   * Returns false when an Admin branching rule actively hides this field
   * given the current form values. Returns true in all other cases,
   * including while loading (safe default = show everything).
   *
   * @param {string} fieldKey - A key from the indexToField array
   * @returns {boolean}
   */
  const shouldShowField = (fieldKey) => {
    // While config is loading, show everything (no flash of hidden content)
    if (!branchingReady) return true;

    // No section config loaded — no rules can apply
    if (!sectionConfig) return true;

    // No branch rules configured at all — show everything
    if (Object.keys(branches).length === 0) return true;

    // Find the question ID for this field key
    const qIdx = indexToField.indexOf(fieldKey);
    if (qIdx === -1) return true;                   // unknown field — show

    const q = sectionConfig.questions[qIdx];
    if (!q) return true;                            // no matching question — show

    return !skippedQIds.has(String(q.id));
  };

  return { shouldShowField, branchingReady };
}