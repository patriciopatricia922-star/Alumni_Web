// ============================================================================
// THIS IS THE UI.
// ============================================================================
// Purpose: Renders all visual components for survey management including:
//          - Sidebar with section list
//          - Question builder interface
//          - Branching logic interface
//          - Modals, toasts, and all presentational elements
// ============================================================================

import AdminSidebar from "../components/AdminSidebar";
import '../styles/Surveymgmt.css';
import { 
  FiTrash2, 
  FiCopy, 
  FiArrowLeft, 
  FiEdit2, 
  FiCheck, 
  FiPlus
} from "react-icons/fi";
import { BiGitBranch } from "react-icons/bi";

export default function SurveyMgmtView({
  // ============================ CORE DATA ============================
  survey,               // Complete survey configuration object
  setSurvey,            // State setter for survey data
  configId,             // Database ID of current config
  setConfigId,          // State setter for config ID
  
  // ============================ SECTION NAVIGATION ============================
  activeSection,        // Currently selected section index (0-based)
  setActiveSection,     // Function to change active section
  
  // ============================ UI MODES ============================
  branchMode,           // Boolean - whether branching UI is active
  setBranchMode,        // Toggle between editor and branching mode
  editingQ,             // Currently editing question { sIdx, qIdx } or null
  setEditingQ,          // Set editing question state
  
  // ============================ EDIT TRACKING ============================
  dirtyQ,               // Boolean - whether current edit has unsaved changes
  editSnapshotRef,      // Ref storing original question JSON for cancel
  
  // ============================ PUBLICATION STATE ============================
  saving,               // Boolean - publish in progress
  status,               // "saving" | "saved" | "error" | ""
  
  // ============================ BRANCHING DATA ============================
  branches,             // Object mapping question/option to destination
  setBranches,          // Update branching logic
  highlightQ,           // Question ID to highlight (for scroll animation)
  branchTargetQ,        // Target question when entering branch mode
  setBranchTargetQ,     // Set target question for branching
  
  // ============================ TOAST NOTIFICATIONS ============================
  toasts,               // Array of active toast objects
  addToast,             // Function to add new toast notification
  
  // ============================ CONFIRMATION MODAL ============================
  confirmState,         // { message, onConfirm } or null
  setConfirmState,      // Close/update confirmation modal
  askConfirm,           // Show confirmation dialog
  
  // ============================ DATA CONSTANTS ============================
  TYPE_LABELS,          // Maps question type keys to display names
  DEFAULT_SURVEY,       // Default survey structure for reset
  
  // ============================ QUESTION HANDLERS ============================
  updateQuestion,       // Update a question's properties
  deleteQuestion,       // Delete a question after confirmation
  duplicateQuestion,    // Create a copy of a question
  addQuestion,          // Add new empty question to current section
  openEdit,             // Enter edit mode for a question
  closeEdit,            // Exit edit mode without saving
  saveEdit,             // Exit edit mode and show success toast
  
  // ============================ SECTION HANDLERS ============================
  addSection,           // Add new empty section
  deleteSection,        // Delete a section after confirmation
  
  // ============================ OPTION HANDLERS ============================
  addOption,            // Add new option to multiple choice question
  updateOption,         // Update specific option text
  deleteOption,         // Remove an option from multiple choice question
  
  // ============================ PUBLISH HANDLER ============================
  handlePublish,        // Save survey config to database
  
  // ============================ DERIVED DATA ============================
  currentSection,       // Currently active section object
  allQuestions,         // Flattened list of all questions with metadata
}) {
  
  // Helper: Format long section titles with line breaks for sidebar display
  const formatSectionTitle = (title) => {
    if (title && title.length > 25) {
      const words = title.split(' ');
      if (words.length > 2) {
        const midPoint = Math.ceil(words.length / 2);
        return (
          <>
            {words.slice(0, midPoint).join(' ')}<br />
            {words.slice(midPoint).join(' ')}
          </>
        );
      }
    }
    return title;
  };

  // Loading state UI
  if (!survey) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh", 
        background: "#E1ECF7", 
        fontFamily: "Lexend,sans-serif", 
        color: "#6A7282" 
      }}>
        Loading survey...
      </div>
    );
  }

  return (
    <>
      {/* Admin Sidebar - Navigation component */}
      <AdminSidebar />

      {/* ============================ TOAST CONTAINER ============================ */}
      {/* Displays temporary notification messages at bottom-right corner */}
      <div style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem",
        display: "flex", flexDirection: "column", gap: "0.5rem",
        zIndex: 9999, pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`sm-toast sm-toast-${t.type} ${t.exiting ? "sm-toast-exit" : "sm-toast-enter"}`}
          >
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

      {/* ============================ CONFIRM DELETE MODAL ============================ */}
      {/* Shown when user attempts to delete a question or section */}
      {confirmState && (
        <div className="sm-confirm-overlay" onClick={() => setConfirmState(null)}>
          <div className="sm-confirm-card" onClick={e => e.stopPropagation()}>
            <div className="sm-confirm-icon">🗑</div>
            <h3 className="sm-confirm-title">Delete?</h3>
            <p className="sm-confirm-message">{confirmState.message}</p>
            <div className="sm-confirm-actions">
              <button className="sm-confirm-cancel" onClick={() => setConfirmState(null)}>
                Cancel
              </button>
              <button className="sm-confirm-delete" onClick={confirmState.onConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================ MAIN PAGE CONTAINER ============================ */}
      <div className="survey-page">
        
        {/* ============================ HEADER SECTION ============================ */}
        {/* Sticky header with title, description, and publish controls */}
        <div className="survey-header">
          <div className="survey-header-left">
            <h1 style={{ fontWeight: 700, fontSize: 27 }}>Survey Management</h1>
            <p className="survey-desc">Edit questions and publish to reflect on the alumni survey</p>
          </div>
          <div className="survey-header-actions">
            {/* Status indicators */}
            {status === "saved"  && <span style={{ color:"#00A63E", fontSize:"0.75rem" }}>✓ Published</span>}
            {status === "error"  && <span style={{ color:"#BF0000", fontSize:"0.75rem" }}>Failed to save</span>}
            {status === "saving" && <span style={{ color:"#6A7282", fontSize:"0.75rem" }}>Saving…</span>}
            
            {/* Publish button - saves survey to database */}
            <button className="publish-btn" onClick={handlePublish} disabled={saving}>
              {saving ? "Publishing…" : status === "saved" ? "✓ Published" : "Publish"}
            </button>
          </div>
        </div>

        {/* ============================ MAIN LAYOUT ============================ */}
        <div className="survey-main">
          
          {/* ============================ LEFT SIDEBAR - SECTIONS LIST ============================ */}
          <div className="survey-sections">
            {/* Add Section button */}
            <button className="add-section-btn" onClick={addSection}>
              + Add Section
            </button>

            {/* Scrollable list of all sections */}
            <div className="sections-list">
              {survey.sections.map((section, index) => (
                <div
                  key={index}
                  className={`section-item ${activeSection === index ? "active" : ""}`}
                  onClick={() => { 
                    setActiveSection(index); 
                    setBranchMode(false); 
                    closeEdit(); 
                  }}
                  style={{ justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div className="section-number">{index + 1}</div>
                    <span>{formatSectionTitle(section.title)}</span>
                  </div>
                  {/* Delete section button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSection(index); }}
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

          {/* ============================ RIGHT CONTENT - BUILDER AREA ============================ */}
          <div className="survey-builder">
            
            {/* BRANCHING MODE UI - Configure question branching logic */}
            {branchMode ? (
              <div className="branch-page">
                <div className="branch-header">
                  <button className="branch-back" onClick={() => { setBranchMode(false); setBranchTargetQ(null); }}>
                    <FiArrowLeft />
                  </button>
                  <h2>Branching Options</h2>
                </div>

                <div className="branch-card">
                  {survey.sections.map((section, sIdx) => {
                    const sectionQuestions = section.questions;
                    if (sectionQuestions.length === 0) return null;
                    return (
                      <div key={sIdx} style={{ marginBottom: "1.5rem" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#4f46e5", marginBottom: "0.5rem" }}>
                          {section.title}
                        </div>
                        {sectionQuestions.map((q, qIdx) => {
                          const realQIdx = survey.sections[sIdx].questions.findIndex(qq => qq.id === q.id);
                          const key = `${sIdx}-${realQIdx}`;
                          return (
                            <div
                              key={key}
                              id={`q-${sIdx}-${realQIdx}`}
                              style={{
                                marginBottom: "1.25rem", paddingBottom: "1rem",
                                borderBottom: "1px solid #e5e7eb",
                                background: highlightQ === `q-${sIdx}-${realQIdx}` ? "#eef6ff" : "transparent",
                                transition: "all 0.3s ease",
                              }}
                            >
                              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111827", marginBottom: "0.75rem" }}>
                                {q.label}
                              </div>
                              
                              {/* Multiple choice branching - each option can have different destination */}
                              {q.type === "multiple" ? (
                                (q.options || []).map((opt, oIdx) => {
                                  const optKey = `${key}-opt${oIdx}`;
                                  return (
                                    <div key={oIdx} style={{
                                      display: "flex", alignItems: "center", gap: "0.75rem",
                                      padding: "0.45rem 0.6rem", borderRadius: "0.4rem",
                                      marginBottom: "0.3rem", background: "#f9fafb",
                                    }}>
                                      <input type="radio" disabled />
                                      <span style={{
                                        flex: 1, fontSize: "0.75rem", overflow: "hidden",
                                        textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px"
                                      }}>
                                        {opt}
                                      </span>
                                      <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>Go to</span>
                                      <select
                                        value={branches[optKey] || "next"}
                                        onChange={e => setBranches(prev => ({ ...prev, [optKey]: e.target.value }))}
                                        style={{ padding: "0.3rem 0.5rem", borderRadius: "0.4rem", border: "1px solid #d1d5db", fontSize: "0.78rem", width: "130px", maxWidth: "130px" }}
                                      >
                                        <option value="next">Next question</option>
                                        {allQuestions.map((dest, j) => (
                                          <option key={j} value={`${dest.sIdx}-${dest.qIdx}`}>
                                            {dest.sectionTitle} → {dest.label}
                                          </option>
                                        ))}
                                        <option value="end">End of form</option>
                                      </select>
                                    </div>
                                  );
                                })
                              ) : (
                                /* Non-multiple question branching - single destination */
                                <div style={{
                                  display: "flex", alignItems: "center", gap: "0.75rem",
                                  padding: "0.45rem 0.6rem", borderRadius: "0.4rem", background: "#f9fafb",
                                }}>
                                  <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>Go to</span>
                                  <select
                                    value={branches[key] || "next"}
                                    onChange={e => setBranches(prev => ({ ...prev, [key]: e.target.value }))}
                                    style={{ padding: "0.3rem 0.5rem", borderRadius: "0.4rem", border: "1px solid #d1d5db", fontSize: "0.78rem", width: "130px", maxWidth: "130px" }}
                                  >
                                    <option value="next">Next question</option>
                                    {allQuestions.map((dest, j) => (
                                      <option key={j} value={`${dest.sIdx}-${dest.qIdx}`}>
                                        {dest.sectionTitle} → {dest.label}
                                      </option>
                                    ))}
                                    <option value="end">End of form</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  
                  {/* Empty state message */}
                  {allQuestions.filter(q => q.type === "multiple").length === 0 && (
                    <div style={{ fontSize: "0.85rem", color: "#6b7280", textAlign: "center", padding: "2rem 0" }}>
                      No multiple choice questions found.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ============================ EDITOR MODE UI ============================ */
              <>
                {/* Section Header Card */}
                <div className="section-card">
                  <div className="section-top">
                    <span>Section {activeSection + 1} of {survey.sections.length}</span>
                  </div>
                  <h2>{currentSection.title}</h2>
                  <p className="section-sub">{currentSection.description}</p>
                </div>

                {/* Render each question in the current section */}
                {currentSection.questions.map((q, qIdx) => {
                  const isEditing = editingQ?.sIdx === activeSection && editingQ?.qIdx === qIdx;

                  // Special handling for "title" type questions
                  if (q.type === "title") {
                    return (
                      <div key={q.id} className="section-card inner-section-card">
                        {isEditing ? (
                          <input
                            value={q.label}
                            onChange={e => updateQuestion(activeSection, qIdx, { label: e.target.value })}
                            style={{ width: "100%", border: "none", borderBottom: "2px solid #6366f1", outline: "none", fontFamily: "Lexend", fontSize: "1rem", fontWeight: 600, background: "transparent", color: "#4f46e5" }}
                          />
                        ) : (
                          <h2>{q.label}</h2>
                        )}
                        <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <button
                            onClick={() => isEditing ? closeEdit() : openEdit(activeSection, qIdx)}
                            style={{ border: "none", background: "#f3f4f6", padding: "0.3rem", borderRadius: "0.3rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
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
                            style={{ border: "none", background: "#fee2e2", padding: "0.3rem", borderRadius: "0.3rem", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}
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
                      
                      {/* Question Header - Label and action buttons */}
                      <div className="question-header">
                        {isEditing ? (
                          <input
                            value={q.label}
                            onChange={e => updateQuestion(activeSection, qIdx, { label: e.target.value })}
                            style={{ flex: 1, border: "none", borderBottom: "2px solid #3b82f6", outline: "none", fontFamily: "Lexend", fontSize: "0.85rem", fontWeight: 500, background: "transparent", padding: "0.2rem 0" }}
                          />
                        ) : (
                          <span>
                            {q.label} {q.required && <span className="required-asterisk">*</span>}
                          </span>
                        )}

                        <div className="question-actions">
                          {/* Question type dropdown (editing mode only) */}
                          {isEditing ? (
                            <select
                              className="question-type"
                              value={q.type}
                              onChange={e => updateQuestion(activeSection, qIdx, { type: e.target.value })}
                            >
                              {Object.entries(TYPE_LABELS).filter(([k]) => k !== "title" && k !== "name").map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="question-type">{TYPE_LABELS[q.type] || q.type}</span>
                          )}
                          
                          {/* Edit/Cancel button */}
                          <button
                            onClick={() => isEditing ? closeEdit() : openEdit(activeSection, qIdx)}
                            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0.2rem", display: "flex", alignItems: "center" }}
                            title={isEditing ? "Cancel editing" : "Edit question"}
                          >
                            <FiEdit2 size={16} color={isEditing ? "#3b82f6" : undefined} />
                          </button>
                          
                          {/* Duplicate button */}
                          <button
                            onClick={() => duplicateQuestion(activeSection, qIdx)}
                            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0.2rem", display: "flex", alignItems: "center" }}
                            title="Duplicate question"
                          >
                            <FiCopy size={16} />
                          </button>
                          
                          {/* Delete button */}
                          <button
                            onClick={() => deleteQuestion(activeSection, qIdx, q.label)}
                            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: "0.2rem", display: "flex", alignItems: "center" }}
                            title="Delete question"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Required checkbox (editing mode only) */}
                      {isEditing && (
                        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", marginTop: "0.5rem", marginBottom: "0.5rem", color: "#6b7280" }}>
                          <input
                            type="checkbox"
                            checked={!!q.required}
                            onChange={e => updateQuestion(activeSection, qIdx, { required: e.target.checked })}
                            style={{ accentColor: "#3b82f6" }}
                          />
                          Required
                        </label>
                      )}

                      {/* ============================ SHORT ANSWER FIELD ============================ */}
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

                      {/* ============================ LONG ANSWER FIELD ============================ */}
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

                      {/* ============================ DATE FIELD ============================ */}
                      {q.type === "date" && (
                        <input type="date" className="question-input" style={{ maxWidth: "200px" }} readOnly />
                      )}

                      {/* ============================ RATING FIELD ============================ */}
                      {q.type === "rating" && (
                        <div className="rating-group">
                          {[1, 2, 3, 4, 5].map(star => <span key={star} className="star">★</span>)}
                        </div>
                      )}

                      {/* ============================ MULTIPLE CHOICE FIELD ============================ */}
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
                                  <button onClick={() => deleteOption(activeSection, qIdx, oIdx)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#ef4444", padding: "0", display: "flex", alignItems: "center" }}>
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span>{opt}</span>
                              )}
                            </label>
                          ))}
                          {/* Add option button (editing mode only) */}
                          {isEditing && (
                            <button onClick={() => addOption(activeSection, qIdx)} style={{ marginTop: "0.5rem", border: "1px dashed #d1d5db", background: "none", padding: "0.3rem 0.6rem", borderRadius: "0.4rem", fontSize: "0.75rem", color: "#6b7280", cursor: "pointer", fontFamily: "Lexend" }}>
                              + Add option
                            </button>
                          )}
                        </div>
                      )}

                      {/* ============================ SAVE / CANCEL ROW ============================ */}
                      {/* Only visible when editing a question */}
                      {isEditing && (
                        <div className="q-save-row">
                          <button className="q-save-btn" disabled={!dirtyQ} onClick={() => saveEdit(activeSection, qIdx)}>
                            <FiCheck size={13} /> Save changes
                          </button>
                          <button className="q-cancel-btn" onClick={closeEdit}>
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* ============================ BRANCH BUTTON ============================ */}
                      {/* Opens branching mode for this question */}
                      {!isEditing && (
                        <div className="branch-container">
                          <button
                            className="branch-btn"
                            onClick={() => {
                              setBranchTargetQ(`q-${activeSection}-${qIdx}`);
                              setBranchMode(true);
                            }}
                          >
                            <BiGitBranch size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ============================ ADD QUESTION BUTTON ============================ */}
                <button
                  onClick={() => addQuestion(activeSection)}
                  style={{ width: "100%", height: "36px", background: "#fff", border: "1px dashed #d1d5db", borderRadius: "0.6rem", fontSize: "0.8rem", color: "#6b7280", cursor: "pointer", marginTop: "0.5rem", fontFamily: "Lexend" }}
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