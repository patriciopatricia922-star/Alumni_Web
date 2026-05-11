// ============================================================================
// SurveyMgmtView.jsx — UI Layer
// ============================================================================
// Merged: retains stable `q-{q.id}` branch keys, multi-select branch
// dropdowns, cross-section destination labels ("Section → Question"), and
// the "Hold Ctrl/Cmd" hint from your version. Friend's positional
// `${sIdx}-${qIdx}` keys and single-select dropdowns are NOT used — they
// break silently when questions are reordered or deleted.
// All editor-mode UI, header, sidebar, toasts, and modals are identical
// between both versions and are preserved as-is.
// ============================================================================

import AdminSidebar from "../components/AdminSidebar";
import "../styles/Surveymgmt.css";
import { FiTrash2, FiCopy, FiArrowLeft, FiEdit2, FiCheck } from "react-icons/fi";
import { BiGitBranch } from "react-icons/bi";

export default function SurveyMgmtView({
  // ============================ CORE DATA ============================
  survey,
  setSurvey,
  configId,
  setConfigId,

  // ============================ SECTION NAVIGATION ============================
  activeSection,
  setActiveSection,

  // ============================ UI MODES ============================
  branchMode,
  setBranchMode,
  editingQ,
  setEditingQ,

  // ============================ EDIT TRACKING ============================
  dirtyQ,
  editSnapshotRef,

  // ============================ PUBLICATION STATE ============================
  saving,
  status,

  // ============================ BRANCHING DATA ============================
  branches,
  setBranches,
  highlightQ,
  branchTargetQ,
  setBranchTargetQ,

  // ============================ TOAST NOTIFICATIONS ============================
  toasts,
  addToast,

  // ============================ CONFIRMATION MODAL ============================
  confirmState,
  setConfirmState,
  askConfirm,

  // ============================ DATA CONSTANTS ============================
  TYPE_LABELS,
  DEFAULT_SURVEY,

  // ============================ QUESTION HANDLERS ============================
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  addQuestion,
  openEdit,
  closeEdit,
  saveEdit,

  // ============================ SECTION HANDLERS ============================
  addSection,
  deleteSection,

  // ============================ OPTION HANDLERS ============================
  addOption,
  updateOption,
  deleteOption,

  // ============================ PUBLISH HANDLER ============================
  handlePublish,

  // ============================ DERIVED DATA ============================
  currentSection,
  allQuestions,    // Flattened list of ALL questions across ALL sections
}) {

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Format long section titles with line breaks for sidebar display
  const formatSectionTitle = (title) => {
    if (title && title.length > 25) {
      const words = title.split(" ");
      if (words.length > 2) {
        const mid = Math.ceil(words.length / 2);
        return <>{words.slice(0, mid).join(" ")}<br />{words.slice(mid).join(" ")}</>;
      }
    }
    return title;
  };

  // Resolve which section the branch panel should display.
  // branchTargetQ format: "q-{sectionIdx}-{questionIdx}"
  const targetSectionIdx = branchTargetQ
    ? parseInt(branchTargetQ.split("-")[1], 10)
    : activeSection;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!survey) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#E1ECF7",
        fontFamily: "Lexend,sans-serif", color: "#6A7282",
      }}>
        Loading survey...
      </div>
    );
  }

  return (
    <>
      <AdminSidebar />

      {/* ── Toast Container ─────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem",
        display: "flex", flexDirection: "column", gap: "0.5rem",
        zIndex: 9999, pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} className={`sm-toast sm-toast-${t.type} ${t.exiting ? "sm-toast-exit" : "sm-toast-enter"}`}>
            <span className="sm-toast-icon">
              {t.type === "success" && "✓"}
              {t.type === "copy"    && "⧉"}
              {t.type === "delete"  && "🗑"}
              {t.type === "edit"    && "✎"}
            </span>
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Confirm / Publish Modal ─────────────────────────────────────── */}
      {confirmState && (
        <div className="sm-confirm-overlay" onClick={() => setConfirmState(null)}>
          <div className="sm-confirm-card" onClick={e => e.stopPropagation()}>
            <h3 className="sm-confirm-title">{confirmState.title || "Delete?"}</h3>
            <p className="sm-confirm-message">{confirmState.message}</p>
            <div className="sm-confirm-actions">
              <button className="sm-confirm-cancel" onClick={() => setConfirmState(null)}>
                Cancel
              </button>
              <button
                className={confirmState.title === "Publish Survey" ? "sm-confirm-confirm" : "sm-confirm-delete"}
                onClick={confirmState.onConfirm}
              >
                {confirmState.title === "Publish Survey" ? "Confirm" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Page ───────────────────────────────────────────────────── */}
      <div className="survey-page">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="survey-header">
          <div className="survey-header-left">
            <h1 style={{ fontWeight: 700, fontSize: 27 }}>Survey Management</h1>
            <p className="survey-desc">Edit questions and publish to reflect on the alumni survey</p>
          </div>
          <div className="survey-header-actions">
            {status === "saved"  && <span style={{ color: "#00A63E", fontSize: "0.75rem" }}>✓ Published</span>}
            {status === "error"  && <span style={{ color: "#BF0000", fontSize: "0.75rem" }}>Failed to save</span>}
            {status === "saving" && <span style={{ color: "#6A7282", fontSize: "0.75rem" }}>Saving…</span>}
            <button
              className="publish-btn"
              disabled={saving}
              onClick={() =>
                askConfirm(
                  "Do you want to publish this survey?",
                  handlePublish,
                  "Publish Survey"
                )
              }
            >
              {saving ? "Publishing…" : status === "saved" ? "✓ Published" : "Publish"}
            </button>
          </div>
        </div>

        {/* ── Main Layout ───────────────────────────────────────────────── */}
        <div className="survey-main">

          {/* ── Section Sidebar ─────────────────────────────────────────── */}
          <div className="survey-sections">
            <button className="add-section-btn" onClick={addSection}>+ Add Section</button>
            <div className="sections-list">
              {survey.sections.map((section, index) => (
                <div
                  key={index}
                  className={`section-item ${activeSection === index ? "active" : ""}`}
                  onClick={() => { setActiveSection(index); setBranchMode(false); closeEdit(); }}
                  style={{ justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div className="section-number">{index + 1}</div>
                    <span>{formatSectionTitle(section.title)}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteSection(index); }}
                    style={{
                      border: "none", background: "transparent", cursor: "pointer",
                      color: "#ef4444", padding: "0.1rem", display: "flex",
                      alignItems: "center", opacity: 0.6, flexShrink: 0,
                    }}
                    title="Delete section"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Builder Area ────────────────────────────────────────────── */}
          <div className="survey-builder">

            {branchMode ? (
              /* ── Branch Mode ────────────────────────────────────────── */
              <div className="branch-page">
                <div className="branch-header">
                  <button
                    className="branch-back"
                    onClick={() => { setBranchMode(false); setBranchTargetQ(null); }}
                  >
                    <FiArrowLeft />
                  </button>
                  <h2>Branching Options</h2>
                </div>

                <div className="branch-card">
                  {/* Show only the section containing the question that triggered branch mode */}
                  {survey.sections
                    .filter((_, sIdx) => sIdx === targetSectionIdx)
                    .map((section) => {
                      if (section.questions.length === 0) return null;
                      return (
                        <div key={targetSectionIdx} style={{ marginBottom: "1.5rem" }}>
                          <div style={{
                            fontSize: "0.9rem", fontWeight: 600,
                            color: "#4f46e5", marginBottom: "0.5rem",
                          }}>
                            {section.title}
                          </div>

                          {section.questions.map((q, qIdx) => {
                            // Stable key uses q.id — safe against reorder and delete.
                            // DOM id uses positional indices for scroll targeting only.
                            const key   = `q-${q.id}`;
                            const domId = `q-${targetSectionIdx}-${qIdx}`;

                            return (
                              <div
                                key={key}
                                id={domId}
                                style={{
                                  marginBottom: "1.25rem", paddingBottom: "1rem",
                                  borderBottom: "1px solid #e5e7eb",
                                  background: highlightQ === domId ? "#eef6ff" : "transparent",
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <div style={{
                                  fontSize: "0.82rem", fontWeight: 600,
                                  color: "#111827", marginBottom: "0.75rem",
                                }}>
                                  {q.label}
                                </div>

                                {q.type === "multiple" ? (
                                  // Per-option multi-select branch targets
                                  (q.options || []).map((opt, oIdx) => {
                                    // Key uses stable q.id; deleteOption() re-indexes oIdx
                                    const optKey     = `q-${q.id}-opt${oIdx}`;
                                    const currentVal = branches[optKey];
                                    const selectVal  = Array.isArray(currentVal)
                                      ? currentVal
                                      : currentVal ? [currentVal] : ["next"];

                                    return (
                                      <div key={oIdx} style={{
                                        display: "flex", alignItems: "center", gap: "0.75rem",
                                        padding: "0.45rem 0.6rem", borderRadius: "0.4rem",
                                        marginBottom: "0.3rem", background: "#f9fafb",
                                        flexWrap: "wrap",
                                      }}>
                                        <input type="radio" disabled />
                                        <span style={{
                                          flex: 1, fontSize: "0.75rem",
                                          overflow: "hidden", textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", maxWidth: "180px",
                                        }}>
                                          {opt}
                                        </span>
                                        <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>Go to</span>
                                        <select
                                          multiple
                                          value={selectVal}
                                          onChange={e => {
                                            const vals = Array.from(e.target.selectedOptions, o => o.value);
                                            setBranches(prev => ({ ...prev, [optKey]: vals }));
                                          }}
                                          style={{
                                            padding: "0.3rem 0.5rem", borderRadius: "0.4rem",
                                            border: "1px solid #d1d5db", fontSize: "0.78rem",
                                            width: "160px", maxWidth: "160px", height: "70px",
                                          }}
                                        >
                                          <option value="next">Next question</option>
                                          {allQuestions.map((dest, j) => (
                                            <option key={j} value={`q-${dest.id}`}>
                                              {dest.sectionTitle} → {dest.label}
                                            </option>
                                          ))}
                                          <option value="end">End of form</option>
                                        </select>
                                        <div style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
                                          Hold Ctrl / Cmd to select multiple
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  // Single multi-select branch target for non-multiple questions
                                  <div style={{
                                    display: "flex", alignItems: "center", gap: "0.75rem",
                                    padding: "0.45rem 0.6rem", borderRadius: "0.4rem",
                                    background: "#f9fafb", flexWrap: "wrap",
                                  }}>
                                    <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>Go to</span>
                                    <select
                                      multiple
                                      value={(() => {
                                        const v = branches[key];
                                        return Array.isArray(v) ? v : v ? [v] : ["next"];
                                      })()}
                                      onChange={e => {
                                        const vals = Array.from(e.target.selectedOptions, o => o.value);
                                        setBranches(prev => ({ ...prev, [key]: vals }));
                                      }}
                                      style={{
                                        padding: "0.3rem 0.5rem", borderRadius: "0.4rem",
                                        border: "1px solid #d1d5db", fontSize: "0.78rem",
                                        width: "160px", maxWidth: "160px", height: "70px",
                                      }}
                                    >
                                      <option value="next">Next question</option>
                                      {allQuestions.map((dest, j) => (
                                        <option key={j} value={`q-${dest.id}`}>
                                          {dest.sectionTitle} → {dest.label}
                                        </option>
                                      ))}
                                      <option value="end">End of form</option>
                                    </select>
                                    <div style={{ fontSize: "0.65rem", color: "#9ca3af" }}>
                                      Hold Ctrl / Cmd to select multiple
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                  {survey.sections[targetSectionIdx]?.questions.length === 0 && (
                    <div style={{
                      fontSize: "0.85rem", color: "#6b7280",
                      textAlign: "center", padding: "2rem 0",
                    }}>
                      No questions in this section yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Editor Mode ─────────────────────────────────────────── */
              <>
                {/* Section header card */}
                <div className="section-card">
                  <div className="section-top">
                    <span>Section {activeSection + 1} of {survey.sections.length}</span>
                  </div>
                  <h2>{currentSection.title}</h2>
                  <p className="section-sub">{currentSection.description}</p>
                </div>

                {/* Questions */}
                {currentSection.questions.map((q, qIdx) => {
                  const isEditing = editingQ?.sIdx === activeSection && editingQ?.qIdx === qIdx;

                  // Title-type question
                  if (q.type === "title") {
                    return (
                      <div key={q.id} className="section-card inner-section-card">
                        {isEditing ? (
                          <input
                            value={q.label}
                            onChange={e => updateQuestion(activeSection, qIdx, { label: e.target.value })}
                            style={{
                              width: "100%", border: "none",
                              borderBottom: "2px solid #6366f1", outline: "none",
                              fontFamily: "Lexend", fontSize: "1rem",
                              fontWeight: 600, background: "transparent", color: "#4f46e5",
                            }}
                          />
                        ) : (
                          <h2>{q.label}</h2>
                        )}
                        <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <button
                            onClick={() => isEditing ? closeEdit() : openEdit(activeSection, qIdx)}
                            style={{
                              border: "none", background: "#f3f4f6", padding: "0.3rem",
                              borderRadius: "0.3rem", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          {isEditing && dirtyQ && (
                            <button className="q-save-btn" onClick={() => saveEdit(activeSection, qIdx)}>
                              <FiCheck size={13} /> Save
                            </button>
                          )}
                          <button
                            onClick={() => deleteQuestion(activeSection, qIdx, q.label)}
                            style={{
                              border: "none", background: "#fee2e2", padding: "0.3rem",
                              borderRadius: "0.3rem", cursor: "pointer", color: "#ef4444",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Standard question card
                  return (
                    <div key={q.id} className={`question-card${isEditing ? " editing" : ""}`}>

                      {/* Header row */}
                      <div className="question-header">
                        {isEditing ? (
                          <input
                            value={q.label}
                            onChange={e => updateQuestion(activeSection, qIdx, { label: e.target.value })}
                            style={{
                              flex: 1, border: "none",
                              borderBottom: "2px solid #3b82f6", outline: "none",
                              fontFamily: "Lexend", fontSize: "0.85rem",
                              fontWeight: 500, background: "transparent", padding: "0.2rem 0",
                            }}
                          />
                        ) : (
                          <span>
                            {q.label} {q.required && <span className="required-asterisk">*</span>}
                          </span>
                        )}
                        <div className="question-actions">
                          {isEditing ? (
                            <select
                              className="question-type"
                              value={q.type}
                              onChange={e => updateQuestion(activeSection, qIdx, { type: e.target.value })}
                            >
                              {Object.entries(TYPE_LABELS)
                                .filter(([k]) => k !== "title" && k !== "name")
                                .map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                          ) : (
                            <span className="question-type">{TYPE_LABELS[q.type] || q.type}</span>
                          )}
                          <button
                            onClick={() => isEditing ? closeEdit() : openEdit(activeSection, qIdx)}
                            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0.2rem", display: "flex", alignItems: "center" }}
                            title={isEditing ? "Cancel editing" : "Edit question"}
                          >
                            <FiEdit2 size={16} color={isEditing ? "#3b82f6" : undefined} />
                          </button>
                          <button
                            onClick={() => duplicateQuestion(activeSection, qIdx)}
                            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0.2rem", display: "flex", alignItems: "center" }}
                            title="Duplicate question"
                          >
                            <FiCopy size={16} />
                          </button>
                          <button
                            onClick={() => deleteQuestion(activeSection, qIdx, q.label)}
                            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: "0.2rem", display: "flex", alignItems: "center" }}
                            title="Delete question"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Required toggle */}
                      {isEditing && (
                        <label style={{
                          display: "inline-flex", alignItems: "center", gap: "0.4rem",
                          fontSize: "0.75rem", marginTop: "0.5rem", marginBottom: "0.5rem", color: "#6b7280",
                        }}>
                          <input
                            type="checkbox"
                            checked={!!q.required}
                            onChange={e => updateQuestion(activeSection, qIdx, { required: e.target.checked })}
                            style={{ accentColor: "#3b82f6" }}
                          />
                          Required
                        </label>
                      )}

                      {/* Short answer */}
                      {q.type === "short" && (
                        <>
                          {isEditing && (
                            <input
                              style={{ width: "100%", maxWidth: "22rem", marginLeft: "0.75rem", marginBottom: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.4rem", padding: "0.35rem", fontSize: "0.75rem", fontFamily: "Lexend" }}
                              placeholder="Placeholder text"
                              value={q.placeholder || ""}
                              onChange={e => updateQuestion(activeSection, qIdx, { placeholder: e.target.value })}
                            />
                          )}
                          {!isEditing && (
                            <input className="question-input" placeholder={q.placeholder || "Short answer"} readOnly />
                          )}
                        </>
                      )}

                      {/* Long answer */}
                      {q.type === "long" && (
                        <>
                          {isEditing && (
                            <input
                              style={{ width: "100%", maxWidth: "22rem", marginBottom: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.4rem", padding: "0.35rem", fontSize: "0.75rem", fontFamily: "Lexend" }}
                              placeholder="Placeholder text"
                              value={q.placeholder || ""}
                              onChange={e => updateQuestion(activeSection, qIdx, { placeholder: e.target.value })}
                            />
                          )}
                          <textarea className="question-input" placeholder={q.placeholder || "Long answer"} rows="3" readOnly />
                        </>
                      )}

                      {/* Date */}
                      {q.type === "date" && (
                        <input type="date" className="question-input" style={{ maxWidth: "200px" }} readOnly />
                      )}

                      {/* Rating */}
                      {q.type === "rating" && (
                        <div className="rating-group">
                          {[1, 2, 3, 4, 5].map(star => <span key={star} className="star">★</span>)}
                        </div>
                      )}

                      {/* Multiple choice */}
                      {q.type === "multiple" && (
                        <div className="radio-group">
                          {(q.options || []).map((opt, oIdx) => (
                            <label key={oIdx}>
                              <input type="radio" disabled />
                              {isEditing ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                                  <input
                                    value={opt}
                                    onChange={e => updateOption(activeSection, qIdx, oIdx, e.target.value)}
                                    style={{ flex: 1, border: "none", borderBottom: "1px solid #d1d5db", outline: "none", fontSize: "0.8rem", fontFamily: "Lexend", padding: "0.2rem 0" }}
                                  />
                                  <button
                                    onClick={() => deleteOption(activeSection, qIdx, oIdx)}
                                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: 0, display: "flex", alignItems: "center" }}
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span>{opt}</span>
                              )}
                            </label>
                          ))}
                          {isEditing && (
                            <button
                              onClick={() => addOption(activeSection, qIdx)}
                              style={{ marginTop: "0.5rem", border: "1px dashed #d1d5db", background: "none", padding: "0.3rem 0.6rem", borderRadius: "0.4rem", fontSize: "0.75rem", color: "#6b7280", cursor: "pointer", fontFamily: "Lexend" }}
                            >
                              + Add option
                            </button>
                          )}
                        </div>
                      )}

                      {/* Save / Cancel row */}
                      {isEditing && (
                        <div className="q-save-row">
                          <button className="q-save-btn" disabled={!dirtyQ} onClick={() => saveEdit(activeSection, qIdx)}>
                            <FiCheck size={13} /> Save changes
                          </button>
                          <button className="q-cancel-btn" onClick={closeEdit}>Cancel</button>
                        </div>
                      )}

                      {/* Branch button — pill-shaped with label */}
                      {!isEditing && (
                        <div className="branch-container">
                          <button
                            className="branch-btn"
                            style={{ borderRadius: "0.4rem", padding: "0.3rem 0.5rem", gap: "0.3rem", width: "auto" }}
                            onClick={() => {
                              setBranchTargetQ(`q-${activeSection}-${qIdx}`);
                              setBranchMode(true);
                            }}
                          >
                            <BiGitBranch size={14} />
                            <span style={{ fontSize: "0.7rem" }}>Branch</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Question */}
                <button
                  onClick={() => addQuestion(activeSection)}
                  style={{
                    width: "100%", height: "36px", background: "#fff",
                    border: "1px dashed #d1d5db", borderRadius: "0.6rem",
                    fontSize: "0.8rem", color: "#6b7280", cursor: "pointer",
                    marginTop: "0.5rem", fontFamily: "Lexend",
                  }}
                >
                  + Add Question
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}