import { useState } from "react";
import { 
  FiTrash2, 
  FiCopy, 
  FiArrowLeft, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiPlus, 
  FiCalendar, 
  FiChevronDown,
  FiChevronUp,
  FiClock
} from "react-icons/fi";
import { BiGitBranch } from "react-icons/bi";
import AdminSidebar from '../components/AdminSidebar';
import "../styles/Surveymgmt.css";

const TYPE_LABELS = {
  short: "Short Answer",
  long: "Long Answer",
  multiple: "Multiple Choice",
  date: "Date",
  rating: "Rating (1–5)",
  name: "Name Fields",
  title: "Section Title",
};

const QUESTION_TYPES = [
  { value: "short", label: "Short Answer" },
  { value: "long", label: "Long Answer" },
  { value: "multiple", label: "Multiple Choice" },
  { value: "date", label: "Date" },
  { value: "rating", label: "Rating (1–5)" },
];

export default function SurveyMgmtView({
  survey,
  setSurvey,
  activeSection,
  setActiveSection,
  branchMode,
  setBranchMode,
  status,
  saving,
  branches,
  setBranches,
  handlePublish,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  addQuestion,
  addSection,
  deleteSection,
  editingQuestion,
  startEditing,
  cancelEditing,
  toast = { show: false, message: "", type: "success" },
  confirmDialog = { show: false, message: "", onConfirm: null, itemName: "" },
  handleConfirm = () => {},
  handleCancelConfirm = () => {},
}) {
  const [editForm, setEditForm] = useState({ 
    label: "", 
    type: "short", 
    required: false, 
    placeholder: "", 
    options: [],
    sIdx: null,
    qIdx: null
  });
  
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [rescheduleRecipients, setRescheduleRecipients] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleEditClick = (question, sIdx, qIdx) => {
    setEditForm({
      sIdx: sIdx,
      qIdx: qIdx,
      label: question.label,
      type: question.type,
      required: question.required || false,
      placeholder: question.placeholder || "",
      options: question.options || []
    });
    if (startEditing) startEditing(question, sIdx, qIdx);
  };

  const handleSaveEdit = () => {
    const { sIdx, qIdx, label, type, required, placeholder, options } = editForm;
    if (updateQuestion && sIdx !== null && qIdx !== null) {
      updateQuestion(sIdx, qIdx, { label, type, required, placeholder, options });
    }
    cancelEditing();
  };

  const handleReschedule = async () => {
    try {
      const response = await fetch('/api/survey/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: rescheduleDate,
          message: rescheduleMessage,
          recipients: rescheduleRecipients
        })
      });
      
      if (response.ok) {
        const showToastFn = window.showToast || (() => {});
        showToastFn("Reschedule notification sent successfully!", "success");
        setShowRescheduleModal(false);
        setRescheduleDate("");
        setRescheduleMessage("");
      }
    } catch (error) {
      console.error("Error sending reschedule:", error);
    }
  };

  if (!survey) {
    return (
      <>
        <AdminSidebar />
        <div className="survey-loading-container">
          <div className="survey-loading-spinner">
            <div className="spinner"></div>
            <p>Loading survey data...</p>
          </div>
        </div>
      </>
    );
  }

  const currentSection = survey.sections[activeSection];
  const isFeedbackSection = currentSection?.title === "Feedback and Alumni Engagement";
  const allQuestions = survey.sections.flatMap((s, si) =>
    s.questions.map((q, qi) => ({ ...q, sIdx: si, qIdx: qi, sectionTitle: s.title }))
  );

  const getFeedbackGroups = () => {
    if (!isFeedbackSection) return null;
    const feedbackGroup = currentSection.questions.slice(0, 3);
    const engagementGroup = currentSection.questions.slice(3, 6);
    return { feedbackGroup, engagementGroup };
  };

  const feedbackGroups = getFeedbackGroups();

  // Helper function to wrap section titles with line breaks for long names
  const formatSectionTitle = (title) => {
    if (title.length > 20) {
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

  return (
    <>
      <AdminSidebar />

      {toast && toast.show && (
        <div className={`toast-notification toast-${toast.type || "success"}`}>
          {toast.message}
        </div>
      )}

      {confirmDialog && confirmDialog.show && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>{confirmDialog.message}</p>
              {confirmDialog.itemName && (
                <p className="modal-item-name">"{confirmDialog.itemName}"</p>
              )}
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-cancel" onClick={handleCancelConfirm}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={handleConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && (
        <div className="modal-overlay">
          <div className="modal-container reschedule-modal">
            <div className="modal-header">
              <h3>Reschedule Survey</h3>
              <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="edit-form-field">
                <label>New Survey Date</label>
                <input
                  type="datetime-local"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              
              <div className="edit-form-field">
                <label>Notification Message (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Add a custom message to notify alumni about the reschedule..."
                  value={rescheduleMessage}
                  onChange={(e) => setRescheduleMessage(e.target.value)}
                />
              </div>
              
              <div className="edit-form-field">
                <label>Notify</label>
                <select
                  value={rescheduleRecipients}
                  onChange={(e) => setRescheduleRecipients(e.target.value)}
                >
                  <option value="all">All Alumni</option>
                  <option value="incomplete">Alumni who haven't completed survey</option>
                  <option value="new">New alumni (last 30 days)</option>
                </select>
              </div>
              
              <p className="reschedule-note">
                <FiClock size={14} />
                Alumni will receive an email notification about the new survey schedule.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowRescheduleModal(false)}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-confirm reschedule-btn" onClick={handleReschedule}>
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="survey-page">
        {/* HEADER - Sticky with divider */}
        <div className="survey-header">
          <div className="survey-header-left">
            <h1>Survey Management</h1>
            <p className="survey-desc">Edit and publish survey for alumni outreach</p>
          </div>

          <div className="survey-header-actions">
            {status === "saved" && <span className="status-saved">✓ Published</span>}
            {status === "error" && <span className="status-error">Failed to save</span>}
            {status === "saving" && <span className="status-saving">Saving…</span>}
            
            <button className="reschedule-btn" onClick={() => setShowRescheduleModal(true)}>
              <FiClock size={16} />
              Reschedule
            </button>
            
            <button className="publish-btn" onClick={handlePublish} disabled={saving}>
              {saving ? "Publishing…" : status === "saved" ? "✓ Published" : "Publish"}
            </button>
          </div>
        </div>
        
        <div className="survey-header-divider" />

        <div className="survey-main">
          {/* LEFT SIDEBAR - Sections */}
          <div className="survey-sections">
            <button className="add-section-btn" onClick={addSection}>
              <FiPlus size={16} />
              Add Section
            </button>
            
            <div className="sections-divider" />

            <div className="sections-list">
              {survey.sections.map((section, index) => (
                <div
                  key={index}
                  className={`section-item ${activeSection === index ? "active" : ""}`}
                  onClick={() => {
                    setActiveSection(index);
                    setBranchMode(false);
                    if (cancelEditing) cancelEditing();
                  }}
                >
                  <div className="section-number">{index + 1}</div>
                  <span className="section-title">{formatSectionTitle(section.title)}</span>
                  <button 
                    className="section-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deleteSection) deleteSection(index);
                    }}
                    title="Delete section"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT - Scrollable */}
          <div className="survey-builder-wrapper">
            <div className="survey-builder">
              {branchMode ? (
                <div className="branch-page">
                  <div className="branch-header">
                    <button className="branch-back" onClick={() => setBranchMode(false)}>
                      <FiArrowLeft size={18} />
                      <span>Back to Editor</span>
                    </button>
                    <h2>Branching Logic</h2>
                  </div>

                  <div className="branch-card">
                    {allQuestions.filter((q) => q.type !== "title").map((q, idx) => {
                      const key = `${q.sIdx}-${q.qIdx}`;
                      return (
                        <div key={idx} className="branch-item">
                          <div className="branch-question">
                            {q.label} · {q.sectionTitle} · {TYPE_LABELS[q.type] || q.type}
                          </div>
                          <div className="branch-row">
                            <div className="branch-answer">Next Action:</div>
                            <div className="branch-select">
                              <select
                                value={branches && branches[key] ? branches[key] : "next"}
                                onChange={(e) => setBranches && setBranches((prev) => ({ ...prev, [key]: e.target.value }))}
                              >
                                <option value="next">Continue to next question</option>
                                {survey.sections.map((sec, sIndex) => (
                                  <option key={sIndex} value={`section-${sIndex}`}>
                                    Jump to: {sec.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="section-card">
                    <div className="section-top">
                      <span>SECTION {activeSection + 1} OF {survey.sections.length}</span>
                    </div>
                    <h2>{currentSection.title}</h2>
                    <p className="section-sub">{currentSection.description}</p>
                  </div>

                  {isFeedbackSection && feedbackGroups ? (
                    <>
                      <div className="subsection-card">
                        <div className="subsection-header">
                          <h3>Feedback to the University</h3>
                          <p className="subsection-desc">Your insights and involvement</p>
                        </div>
                        {feedbackGroups.feedbackGroup.map((q, qIdx) => {
                          const globalQIdx = currentSection.questions.findIndex(question => question.id === q.id);
                          return renderQuestion(q, globalQIdx);
                        })}
                      </div>

                      <div className="subsection-card">
                        <div className="subsection-header">
                          <h3>Alumni Engagement</h3>
                          <p className="subsection-desc">Your insights and involvement</p>
                        </div>
                        {feedbackGroups.engagementGroup.map((q, qIdx) => {
                          const globalQIdx = currentSection.questions.findIndex(question => question.id === q.id);
                          return renderQuestion(q, globalQIdx);
                        })}
                      </div>
                    </>
                  ) : (
                    currentSection.questions.map((q, qIdx) => renderQuestion(q, qIdx))
                  )}

                  <button className="add-question-btn" onClick={() => addQuestion && addQuestion(activeSection)}>
                    <FiPlus size={18} />
                    Add Question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  function renderQuestion(q, qIdx) {
    const isEditing = editingQuestion && editingQuestion.id === q.id;
    
    if (isEditing) {
      return (
        <div key={q.id} className="question-card editing">
          <div className="edit-form">
            <div className="edit-form-field">
              <label>Question Label</label>
              <input
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                placeholder="Enter question"
              />
            </div>
            
            <div className="edit-form-field">
              <label>Question Type</label>
              <div className="custom-select">
                <button 
                  className="select-trigger"
                  onClick={() => setOpenDropdown(openDropdown === q.id ? null : q.id)}
                >
                  {QUESTION_TYPES.find(t => t.value === editForm.type)?.label || "Select type"}
                  <FiChevronDown size={16} />
                </button>
                {openDropdown === q.id && (
                  <div className="select-dropdown">
                    {QUESTION_TYPES.map(type => (
                      <div
                        key={type.value}
                        className="select-option"
                        onClick={() => {
                          setEditForm({ ...editForm, type: type.value });
                          setOpenDropdown(null);
                        }}
                      >
                        {type.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="edit-form-field checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={editForm.required}
                  onChange={(e) => setEditForm({ ...editForm, required: e.target.checked })}
                />
                Required Question
              </label>
            </div>
            
            {editForm.type !== "multiple" && editForm.type !== "rating" && (
              <div className="edit-form-field">
                <label>Placeholder (optional)</label>
                <input
                  type="text"
                  value={editForm.placeholder}
                  onChange={(e) => setEditForm({ ...editForm, placeholder: e.target.value })}
                  placeholder="e.g. Enter your answer"
                />
              </div>
            )}
            
            {editForm.type === "multiple" && (
              <div className="edit-form-field">
                <label>Options</label>
                {editForm.options && editForm.options.map((opt, optIdx) => (
                  <div key={optIdx} className="option-row">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...editForm.options];
                        newOptions[optIdx] = e.target.value;
                        setEditForm({ ...editForm, options: newOptions });
                      }}
                    />
                    <button
                      className="remove-option-btn"
                      onClick={() => {
                        const newOptions = editForm.options.filter((_, i) => i !== optIdx);
                        setEditForm({ ...editForm, options: newOptions });
                      }}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                <button
                  className="add-option-btn"
                  onClick={() => setEditForm({ ...editForm, options: [...(editForm.options || []), "New Option"] })}
                >
                  + Add Option
                </button>
              </div>
            )}
            
            <div className="edit-form-actions">
              <button className="save-edit-btn" onClick={handleSaveEdit}>
                <FiSave size={16} />
                Save Changes
              </button>
              <button className="cancel-edit-btn" onClick={cancelEditing}>
                <FiX size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div key={q.id} className="question-card">
        <div className="question-header">
          <span className="question-label">
            {q.label}
            {q.required && <span className="required-asterisk">*</span>}
          </span>
          <div className="question-actions">
            <span className="question-type">{TYPE_LABELS[q.type] || q.type}</span>
            <button 
              className="icon-btn edit-btn"
              onClick={() => handleEditClick(q, activeSection, qIdx)}
              title="Edit question"
            >
              <FiEdit2 size={18} />
            </button>
            <button 
              className="icon-btn copy-btn"
              onClick={() => duplicateQuestion && duplicateQuestion(activeSection, qIdx)}
              title="Duplicate question"
            >
              <FiCopy size={18} />
            </button>
            <button 
              className="icon-btn delete-btn"
              onClick={() => deleteQuestion && deleteQuestion(activeSection, qIdx)}
              title="Delete question"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>

        {q.type === "short" && (
          <div className="preview-field">
            <div className="preview-placeholder">{q.placeholder || "Enter your answer"}</div>
          </div>
        )}
        {q.type === "long" && (
          <div className="preview-field preview-textarea">
            <div className="preview-placeholder">{q.placeholder || "Enter your answer"}</div>
          </div>
        )}
        {q.type === "date" && (
          <div className="preview-field preview-date">
            <div className="preview-placeholder">Select date</div>
          </div>
        )}

        {q.type === "multiple" && (
          <div className="radio-group">
            {q.options && q.options.map((opt, oIdx) => (
              <label key={oIdx}>
                <input type="radio" name={`question-${q.id}`} disabled />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {q.type === "rating" && (
          <div className="rating-group">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="star">★</span>
            ))}
          </div>
        )}

        <div className="branch-container">
          <button 
            className="branch-btn" 
            onClick={() => setBranchMode(true)}
            title="Branching logic"
          >
            <BiGitBranch size={18} />
          </button>
        </div>
      </div>
    );
  }
}