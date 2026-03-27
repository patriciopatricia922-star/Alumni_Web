import { FiTrash2, FiCopy, FiArrowLeft, FiEdit2 } from "react-icons/fi";
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
  addOption,
  updateOption,
  deleteOption,
  addQuestion,
}) {
  if (!survey) {
    return (
      <div className="survey-loading" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#E1ECF7", fontFamily: "Lexend,sans-serif", color: "#6A7282" }}>
        Loading survey...
      </div>
    );
  }

  const currentSection = survey.sections[activeSection];
  const allQuestions = survey.sections.flatMap((s, si) =>
    s.questions.map((q, qi) => ({ ...q, sIdx: si, qIdx: qi, sectionTitle: s.title }))
  );

  return (
    <>
      <AdminSidebar />

      <div className="survey-page">
        {/* HEADER */}
        <div className="survey-header">
          <div className="survey-header-left">
            <h1 style={{ fontWeight: 700 }}>Survey Management</h1>
            <p className="survey-desc">Edit questions and publish to reflect on the alumni survey</p>
          </div>

          <div className="survey-header-actions">
            {status === "saved" && <span style={{ color: "#00A63E", fontSize: "0.75rem" }}>✓ Published</span>}
            {status === "error" && <span style={{ color: "#BF0000", fontSize: "0.75rem" }}>Failed to save</span>}
            {status === "saving" && <span style={{ color: "#6A7282", fontSize: "0.75rem" }}>Saving…</span>}
            <button className="publish-btn" onClick={handlePublish} disabled={saving}>
              {saving ? "Publishing…" : status === "saved" ? "✓ Published" : "Publish"}
            </button>
          </div>
        </div>

        <div className="survey-main">
          {/* SIDEBAR */}
          <div className="survey-sections">
            <button
              className="add-section-btn"
              onClick={() => {
                setSurvey((prev) => ({
                  ...prev,
                  sections: [
                    ...prev.sections,
                    { id: Date.now(), title: `Section ${prev.sections.length + 1}`, description: "New section", questions: [] },
                  ],
                }));
                setActiveSection(survey.sections.length);
              }}
            >
              + Add Section
            </button>

            <div className="sections-list">
              {survey.sections.map((section, index) => (
                <div
                  key={index}
                  className={`section-item ${activeSection === index ? "active" : ""}`}
                  onClick={() => {
                    setActiveSection(index);
                    setBranchMode(false);
                  }}
                >
                  <div className="section-number">{index + 1}</div>
                  <span>{section.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BUILDER */}
          <div className="survey-builder">
            {branchMode ? (
              <div className="branch-page">
                <div className="branch-header">
                  <button className="branch-back" onClick={() => setBranchMode(false)}>
                    <FiArrowLeft />
                    <span>Back to Editor</span>
                  </button>
                  <h2>Branching Logic</h2>
                </div>

                <div className="branch-card">
                  {allQuestions.filter((q) => q.type !== "title").map((q, idx) => {
                    const key = `${q.sIdx}-${q.qIdx}`;
                    return (
                      <div key={idx}>
                        <div className="branch-question">
                          {q.label} · {q.sectionTitle} · {TYPE_LABELS[q.type] || q.type}
                        </div>
                        <div className="branch-row">
                          <div className="branch-answer">Next Action:</div>
                          <div className="branch-select">
                            <select
                              value={branches[key] || "next"}
                              onChange={(e) => setBranches((prev) => ({ ...prev, [key]: e.target.value }))}
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

                {currentSection.questions.map((q, qIdx) => (
                  <div key={q.id} className="question-card">
                    <div className="question-header">
                      <span>
                        {q.label}
                        {q.required && <span className="required-asterisk">*</span>}
                      </span>
                      <div className="question-actions">
                        <span className="question-type">{TYPE_LABELS[q.type] || q.type}</span>
                        <FiEdit2 style={{ cursor: "pointer", color: "#4b5563" }} />
                        <FiCopy style={{ cursor: "pointer", color: "#4b5563" }} onClick={() => duplicateQuestion(activeSection, qIdx)} />
                        <FiTrash2 style={{ cursor: "pointer", color: "#ef4444" }} onClick={() => deleteQuestion(activeSection, qIdx)} />
                      </div>
                    </div>

                    {q.type === "short" && <input type="text" className="question-input" placeholder={q.placeholder} disabled />}
                    {q.type === "long" && <textarea className="question-input" placeholder={q.placeholder} disabled rows={3} />}
                    {q.type === "date" && <input type="date" className="question-input" disabled />}

                    {q.type === "multiple" && (
                      <div className="radio-group">
                        {q.options?.map((opt, oIdx) => (
                          <label key={oIdx}>
                            <input type="radio" disabled />
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
                      <button className="branch-btn" onClick={() => setBranchMode(true)}>
                        <BiGitBranch />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addQuestion(activeSection)}
                  style={{ width: "100%", padding: "0.6rem", background: "white", border: "1px dashed #3b82f6", borderRadius: "0.5rem", color: "#3b82f6", cursor: "pointer", fontFamily: "Lexend,sans-serif" }}
                >
                  + Add Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}