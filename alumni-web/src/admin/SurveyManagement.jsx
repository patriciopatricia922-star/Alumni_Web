// ============================================================================
// THIS IS FOR LOGIC.
// ============================================================================
// Purpose: Handles all business logic, state management, API calls,
//          data transformations, and event handlers for survey management.
// ============================================================================

import { useEffect, useState, useRef, useCallback } from "react";
import { supabaseAdmin } from "../lib/supabaseadmin";
import AdminSidebar from "./components/AdminSidebar";
import SurveyMgmtView from "./views/SurveyMgmtView";

// ============================================================================
// DEFAULT SURVEY DATA - Initial survey structure when no config exists
// ============================================================================
const DEFAULT_SURVEY = {
  title: "Alumni Survey",
  sections: [
    { 
      id: 1, 
      title: "Personal Background", 
      description: "Basic information about you", 
      questions: [
        { id: 1, type: "short", label: "Last Name", required: true, placeholder: "e.g. Dela Cruz" },
        { id: 2, type: "short", label: "First Name", required: true, placeholder: "e.g. Juan" },
        { id: 3, type: "short", label: "Middle Name", required: false, placeholder: "e.g. Mercado" },
        { id: 4, type: "short", label: "Student Number", required: true, placeholder: "e.g. 2023-123456" },
        { id: 5, type: "multiple", label: "Gender", required: true, options: ["Male", "Female", "Other"] },
        { id: 6, type: "date", label: "Birthday", required: true },
        { id: 7, type: "multiple", label: "Civil Status", required: true, options: ["Single", "Married", "Other"] },
        { id: 8, type: "short", label: "Complete Address", required: true, placeholder: "Enter your complete address" },
        { id: 9, type: "short", label: "Contact Number", required: true, placeholder: "e.g. 912-345-6789" },
        { id: 10, type: "short", label: "Personal Email Address", required: true, placeholder: "e.g. juandelacruz@gmail.com" },
      ]
    },
    { 
      id: 2, 
      title: "Educational Background", 
      description: "Your academic history", 
      questions: [
        { id: 1, type: "multiple", label: "Degree Program Completed", required: true, options: ["Bachelor of Arts in Communication", "Bachelor of Science in Psychology", "Bachelor of Science in Physical Education", "Bachelor of Science in Accountancy", "Bachelor of Science in Management Accounting", "Bachelor of Science in Business Administration major in Marketing Management", "Bachelor of Science in Business Administration major in Financial Management", "Bachelor of Science in Business Administration major in Human Resource Management", "Bachelor of Science in Tourism Management", "Bachelor of Science in Hospitality Management", "Bachelor of Science in Architecture", "Bachelor of Science in Civil Engineering, Bachelor of Science in Computer Science with specialization in Machine Learning", "Bachelor of Science in Computer Engineering", "Bachelor of Science in Information Technology with specialization in Mobile and Web Application", "Master's in management with specialization in Business Analytics"] },
        { id: 2, type: "long", label: "Reason(s) of taking the course", required: true, placeholder: "Enter your answer" },
        { id: 3, type: "multiple", label: "Year Graduated", required: true, options: ["2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"] },
        { id: 4, type: "multiple", label: "Distinction Received", required: true, options: ["Summa Cum Laude", "Magna Cum Laude", "Cum Laude", "None"] },
        { id: 5, type: "multiple", label: "Do you have plans on taking a post-graduate studies?", required: true, options: ["Yes", "No"] },
        { id: 6, type: "long", label: "If yes, what course?", required: false, placeholder: "Enter your answer" },
        { id: 7, type: "multiple", label: "Are you currently taking/reviewing for licensure examination?", required: true, options: ["Yes", "No", "Not applicable"] },
        { id: 8, type: "multiple", label: "Do you have any plans on taking licensure examination?", required: false, options: ["Yes", "No", "Already taken", "Not applicable"] },
        { id: 9, type: "long", label: "Reason(s) for not taking or taking licensure examination", required: false, placeholder: "Enter your answer" },
        { id: 10, type: "short", label: "Name of board/licensure examination", required: false, placeholder: "Enter your answer" },
        { id: 11, type: "date", label: "Date taken/date of examination", required: false },
        { id: 12, type: "multiple", label: "Results", required: false, options: ["Passed", "Failed", "Not Applicable", "Other"] },
      ]
    },
    { 
      id: 3, 
      title: "Certification Achievement", 
      description: "Certifications you have", 
      questions: [
        { id: 1, type: "multiple", label: "Are you a certiport passer?", required: true, options: ["Yes", "No"] },
        { id: 2, type: "checkbox", label: "Please specify any certiport certification earned", required: false, options: ["Microsoft Office Specialist (MOS) - Word", "Microsoft Office Specialist (MOS) - Excel", "Microsoft Office Specialist (MOS) - PowerPoint", "Microsoft Office Specialist (MOS) - Outlook", "Microsoft Office Specialist (MOS) - OneNote", "Other"] },
        { id: 3, type: "multiple", label: "Does your certification help in your current job?", required: false, options: ["Yes", "No"] },
        { id: 4, type: "short", label: "How has your certification been useful in your career?", required: false, placeholder: "Please describe how your certifications have helped your career" },
      ]
    },
    { 
      id: 4, 
      title: "Employment Information", 
      description: "Information related to your job", 
      questions: [
        { id: 1, type: "multiple", label: "Is your current job related to your degree?", required: true, options: ["Yes", "No"] },
        { id: 2, type: "multiple", label: "Current Employment Status", required: true, options: ["Regular / Permanent", "Contractual", "Part-Time", "Probationary", "Self-Employed", "Unemployed, but looking for work", "Unemployed, but not looking for work", "Other"] },
        { id: 3, type: "short", label: "Please specify your employment status", required: false, placeholder: "Please specify" },
        { id: 4, type: "short", label: "Job position", required: false, placeholder: "Enter your answer" },
        { id: 5, type: "short", label: "Name of company / employer", required: false, placeholder: "Enter your answer" },
        { id: 6, type: "multiple", label: "Type of industry", required: false, options: ["Agriculture, Forestry and Fishing", "Information and Communication Technology (ICT)", "Financial and Insurance Activities", "Education", "Other"] },
        { id: 7, type: "multiple", label: "Location of employment", required: false, options: ["Local", "Abroad"] },
        { id: 8, type: "multiple", label: "Monthly income range", required: false, options: ["Below ₱15,000", "₱15,001 – ₱30,000", "₱30,001 – ₱50,000", "Above ₱50,000"] },
        { id: 9, type: "multiple", label: "Reasons for accepting the job", required: false, options: ["Salaries and Benefits", "Career Challenge", "Related to Special Skill", "Related to Course or Program of Study", "Proximity of Residence", "Peer Influence", "Family Influence", "Other"] },
        { id: 10, type: "multiple", label: "Reasons of being unemployed", required: false, options: ["Pursuing further studies", "Family responsibilities or personal matters", "Health-related reasons", "Lack of job opportunities related to the field of study", "Other"] },
        { id: 11, type: "short", label: "Please specify other reason", required: false, placeholder: "Please specify" },
      ]
    },
    { 
      id: 5, 
      title: "Job Experience", 
      description: "Your job hunting experience", 
      questions: [
        { id: 1, type: "multiple", label: "How long did it take you to find your first job after graduation?", required: true, options: ["Less than a month", "1–3 months", "4–6 months", "7–12 months", "More than a year", "Not applicable"] },
        { id: 2, type: "multiple", label: "How long have you been employed in your current job?", required: true, options: ["Less than a month", "1–6 months", "7–11 months", "1 year or less than 2 years", "2 years or less than 3 years", "3 years or less than 4 years", "Other"] },
        { id: 3, type: "multiple", label: "How did you find your first job?", required: true, options: ["Job/Career Fair", "Internship Absorption", "Online", "Recommendation", "Walk-in Applications", "Not applicable", "Other"] },
        { id: 4, type: "checkbox", label: "What factors helped you most in getting your first job? (Check all that apply)", required: true, options: ["Academic performance", "Internship / On-the-job Training", "Personal connections", "Skills/Competencies acquired in school", "Certifications", "Not applicable", "Other"] },
      ]
    },
    { 
      id: 6, 
      title: "Skills & Competencies", 
      description: "Your workplace skills", 
      questions: [
        { id: 1, type: "checkbox", label: "What are the competencies learned in college did you find very useful?", required: true, options: ["Communication Skills", "Information & Technology Skills", "Leadership Skills", "Critical & Problem-Solving Skills", "Work Ethics/Professionalism", "Other"] },
        { id: 2, type: "rating", label: "Communication Skills", required: true },
        { id: 3, type: "rating", label: "Information & Technology Skills", required: true },
        { id: 4, type: "rating", label: "Leadership Skills", required: true },
        { id: 5, type: "rating", label: "Critical & Problem-Solving Skills", required: true },
        { id: 6, type: "rating", label: "Work Ethics/Professionalism Skills", required: true },
        { id: 7, type: "short", label: "What other skills should NU Dasma develop in students to make them more employable?", required: true, placeholder: "Enter your answer" },
      ]
    },
    { 
      id: 7, 
      title: "Feedback for the University", 
      description: "Your insights and feedback", 
      questions: [
        { id: 1, type: "multiple", label: "How satisfied are you with your education at NU Dasma?", required: true, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
        { id: 2, type: "multiple", label: "Would you recommend NU Dasma to others?", required: true, options: ["Yes", "No"] },
        { id: 3, type: "long", label: "Suggestions for improving academic programs and alumni services", required: true, placeholder: "Enter your answer" },
      ]
    },
    { 
      id: 8, 
      title: "Alumni Engagement", 
      description: "Your connection with the university", 
      questions: [
        { id: 1, type: "multiple", label: "Would you like to be informed about upcoming alumni events and activities?", required: true, options: ["Yes", "No"] },
        { id: 2, type: "checkbox", label: "Would you be willing to participate in:", required: true, options: ["Alumni Seminars/Webinar programs for professional growth", "Career talks for students", "Alumni fundraising events/activities", "Volunteer opportunities", "Not at all", "Other"] },
      ]
    },
  ]
};

// ============================================================================
// TYPE LABELS MAPPING - Maps question types to display names
// ============================================================================
const TYPE_LABELS = {
  short: "Short Answer",
  long: "Long Answer",
  multiple: "Multiple Choice",
  date: "Date",
  rating: "Rating (1–5)",
  name: "Name Fields",
  title: "Section Title",
};

// ============================================================================
// FIX (Bug 3 & 4): Stable unique ID generator.
// Using Date.now() alone can collide when questions are added rapidly.
// This combines a timestamp with a random suffix to guarantee uniqueness.
// ============================================================================
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ============================ LOADING SCREEN COMPONENT (MOVED OUTSIDE) ============================
const LoadingScreen = ({ message }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <>
      <AdminSidebar />
      <div style={{ 
        marginLeft: isMobile ? 0 : "229px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh",
        background: "#E1ECF7",
        fontFamily: "Lexend, sans-serif",
        color: "#6A7282",
        fontSize: "14px"
      }}>
        {message}
      </div>
    </>
  );
};

// ============================================================================
// SurveyManagement Component - Main logic controller
// ============================================================================
export default function SurveyManagement() {
  // ============================ STATE DECLARATIONS ============================
  // Survey data states
  const [survey, setSurvey] = useState(null);           // Holds the complete survey configuration
  const [configId, setConfigId] = useState(null);       // Database ID of the current survey config
  const [activeSection, setActiveSection] = useState(0); // Currently selected section index
  
  // UI mode states
  const [branchMode, setBranchMode] = useState(false);   // Whether branching UI is active
  const [editingQ, setEditingQ] = useState(null);        // Currently editing question { sIdx, qIdx }
  
  // Edit tracking states
  const editSnapshotRef = useRef(null);                  // Stores original question JSON for cancel
  const [dirtyQ, setDirtyQ] = useState(false);           // Tracks if question was modified
  
  // Publication states
  const [saving, setSaving] = useState(false);           // Publishing in progress flag
  const [status, setStatus] = useState("");              // "saving" | "saved" | "error"
  const [branches, setBranches] = useState({});          // Branching logic configuration
  
  // Notification states
  const [toasts, setToasts] = useState([]);              // Toast notification queue
  const [confirmState, setConfirmState] = useState(null); // Delete confirmation modal { message, onConfirm }
  
  // Branching UI states
  const [highlightQ, setHighlightQ] = useState(null);     // Question ID to highlight
  const [branchTargetQ, setBranchTargetQ] = useState(null); // Target question for branch scroll

  // ============================ TOAST MANAGEMENT ============================
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 2400);
  }, []);

  // ============================ CONFIRMATION MODAL ============================
  const askConfirm = (message, onConfirm) => setConfirmState({ message, onConfirm });

  // ============================ DATA LOADING ============================
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabaseAdmin
        .from("survey_config")
        .select("id, config")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data?.config?.sections?.length) {
        setSurvey(DEFAULT_SURVEY);
      } else {
        setConfigId(data.id);

        // FIX (Bug 1 & 2): Destructure branches out of the saved config so
        // survey state only ever holds section/question data, while branches
        // are restored into their own dedicated state. Previously, branches
        // were never written to the DB and never read back on load.
        const { branches: savedBranches, ...surveyData } = data.config;
        setSurvey(surveyData);
        if (savedBranches) setBranches(savedBranches);
      }
    };
    load();
  }, []);

  // ============================ PUBLISH LOGIC ============================
  const handlePublish = async () => {
    if (!survey) return;
    setSaving(true);
    setStatus("saving");
    try {
      // FIX (Bug 1): Merge branches into the config payload before saving.
      // Previously only `survey` was persisted, so all branching config was
      // silently dropped on every publish.
      const payload = { ...survey, branches };

      if (configId) {
        await supabaseAdmin
          .from("survey_config")
          .update({ config: payload, updated_at: new Date().toISOString() })
          .eq("id", configId);
      } else {
        const { data } = await supabaseAdmin
          .from("survey_config")
          .insert({ config: payload })
          .select("id")
          .single();
        if (data) setConfigId(data.id);
      }
      setStatus("saved");
      setTimeout(() => setStatus(""), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // ============================ BRANCHING SCROLL LOGIC ============================
  useEffect(() => {
    if (branchMode && branchTargetQ) {
      requestAnimationFrame(() => {
        const el = document.getElementById(branchTargetQ);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightQ(branchTargetQ);
          setTimeout(() => setHighlightQ(null), 1200);
        }
      });
    }
  }, [branchMode, branchTargetQ]);

  // ============================ QUESTION CRUD OPERATIONS ============================
  const updateQuestion = (sIdx, qIdx, patch) => {
    setSurvey(prev => {
      const s = prev.sections.map((sec, si) => si !== sIdx ? sec : {
        ...sec,
        questions: sec.questions.map((q, qi) => qi !== qIdx ? q : { ...q, ...patch }),
      });
      return { ...prev, sections: s };
    });
    if (editingQ?.sIdx === sIdx && editingQ?.qIdx === qIdx) {
      setDirtyQ(true);
    }
  };

  const openEdit = (sIdx, qIdx) => {
    const q = survey.sections[sIdx].questions[qIdx];
    editSnapshotRef.current = JSON.stringify(q);
    setDirtyQ(false);
    setEditingQ({ sIdx, qIdx });
  };

  const closeEdit = () => {
    setEditingQ(null);
    setDirtyQ(false);
    editSnapshotRef.current = null;
  };

  const saveEdit = (sIdx, qIdx) => {
    setEditingQ(null);
    setDirtyQ(false);
    editSnapshotRef.current = null;
    addToast("Question updated successfully", "edit");
  };

  const deleteQuestion = (sIdx, qIdx, label) => {
    askConfirm(
      `Delete the question "${label}"? This action cannot be undone.`,
      () => {
        // FIX (Bug 3): Clean up any branch rules that referenced the deleted
        // question. Keys are now `q-{question.id}` so we can find and remove
        // them accurately, even after prior reordering.
        const deletedId = survey.sections[sIdx].questions[qIdx].id;
        setBranches(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => {
            // Remove rules where this question is the source
            if (k.startsWith(`q-${deletedId}`)) delete next[k];
            // Remove rules where this question is the destination
            if (next[k] === `q-${deletedId}`) delete next[k];
          });
          return next;
        });

        setSurvey(prev => ({
          ...prev,
          sections: prev.sections.map((sec, si) => si !== sIdx ? sec : {
            ...sec, questions: sec.questions.filter((_, qi) => qi !== qIdx),
          }),
        }));
        setConfirmState(null);
        addToast("Question deleted", "delete");
      }
    );
  };

  const deleteSection = (index) => {
    const sectionTitle = survey.sections[index].title;
    askConfirm(
      `Delete the section "${sectionTitle}" and all its questions? This action cannot be undone.`,
      () => {
        // FIX (Bug 3): Clean up branch rules for every question in the
        // deleted section, same approach as deleteQuestion above.
        const deletedIds = new Set(
          survey.sections[index].questions.map(q => q.id)
        );
        setBranches(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => {
            const sourceId = k.split("-opt")[0].replace("q-", "");
            if (deletedIds.has(Number(sourceId)) || deletedIds.has(sourceId)) {
              delete next[k];
            }
            if (deletedIds.has(Number(next[k]?.replace("q-", ""))) ||
                deletedIds.has(next[k]?.replace("q-", ""))) {
              delete next[k];
            }
          });
          return next;
        });

        setSurvey(prev => ({
          ...prev,
          sections: prev.sections.filter((_, i) => i !== index),
        }));
        setActiveSection(prev => Math.min(prev, survey.sections.length - 2));
        setConfirmState(null);
        addToast("Section deleted", "delete");
      }
    );
  };

  const duplicateQuestion = (sIdx, qIdx) => {
    setSurvey(prev => {
      const sec = prev.sections[sIdx];
      // FIX (Bug 3 & 4): Use uid() instead of Date.now() alone to guarantee
      // the duplicate gets a truly unique, stable id.
      const q = { ...sec.questions[qIdx], id: uid() };
      const qs = [...sec.questions];
      qs.splice(qIdx + 1, 0, q);
      return {
        ...prev,
        sections: prev.sections.map((s, si) => si !== sIdx ? s : { ...s, questions: qs }),
      };
    });
    addToast("Question duplicated", "copy");
  };

  const addQuestion = (sIdx) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) => si !== sIdx ? s : {
        ...s,
        questions: [
          ...s.questions,
          // FIX (Bug 3 & 4): Use uid() for collision-safe stable IDs.
          { id: uid(), type: "short", label: "New Question", required: false, placeholder: "Enter your answer" },
        ],
      }),
    }));
  };

  const addSection = () => {
    setSurvey(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: uid(), title: `Section ${prev.sections.length + 1}`, description: "New section", questions: [] }
      ]
    }));
    setActiveSection(survey.sections.length);
  };

  // ============================ OPTION CRUD OPERATIONS ============================
  const addOption = (sIdx, qIdx) => {
    const q = survey.sections[sIdx].questions[qIdx];
    updateQuestion(sIdx, qIdx, { options: [...(q.options || []), "New Option"] });
  };

  const updateOption = (sIdx, qIdx, oIdx, val) => {
    const opts = [...survey.sections[sIdx].questions[qIdx].options];
    opts[oIdx] = val;
    updateQuestion(sIdx, qIdx, { options: opts });
  };

  const deleteOption = (sIdx, qIdx, oIdx) => {
    // FIX (Bug 3): Clean up branch rules that targeted the deleted option.
    const qId = survey.sections[sIdx].questions[qIdx].id;
    const optKey = `q-${qId}-opt${oIdx}`;
    setBranches(prev => {
      const next = { ...prev };
      delete next[optKey];
      // Re-index option keys above the deleted index so they stay aligned.
      const higherKeys = Object.keys(next).filter(k =>
        k.startsWith(`q-${qId}-opt`) && parseInt(k.split("opt")[1], 10) > oIdx
      );
      higherKeys.forEach(k => {
        const oldIdx = parseInt(k.split("opt")[1], 10);
        const newKey = `q-${qId}-opt${oldIdx - 1}`;
        next[newKey] = next[k];
        delete next[k];
      });
      return next;
    });

    const opts = survey.sections[sIdx].questions[qIdx].options.filter((_, i) => i !== oIdx);
    updateQuestion(sIdx, qIdx, { options: opts });
  };

  // ============================ DERIVED DATA ============================
  const currentSection = survey?.sections[activeSection];
  const allQuestions = survey?.sections.flatMap((s, si) =>
    s.questions.map((q, qi) => ({ ...q, sIdx: si, qIdx: qi, sectionTitle: s.title }))
  ) || [];

  // ============================ LOADING STATE (AFTER ALL HOOKS) ============================
  // IMPORTANT: Conditional return MUST come AFTER all hooks are declared
  if (!survey) {
    return <LoadingScreen message="Loading survey configuration..." />;
  }

  // ============================ RENDER ============================
  return (
    <SurveyMgmtView
      survey={survey}
      setSurvey={setSurvey}
      configId={configId}
      setConfigId={setConfigId}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      branchMode={branchMode}
      setBranchMode={setBranchMode}
      editingQ={editingQ}
      setEditingQ={setEditingQ}
      dirtyQ={dirtyQ}
      editSnapshotRef={editSnapshotRef}
      saving={saving}
      status={status}
      branches={branches}
      setBranches={setBranches}
      highlightQ={highlightQ}
      branchTargetQ={branchTargetQ}
      setBranchTargetQ={setBranchTargetQ}
      toasts={toasts}
      addToast={addToast}
      confirmState={confirmState}
      setConfirmState={setConfirmState}
      askConfirm={askConfirm}
      TYPE_LABELS={TYPE_LABELS}
      DEFAULT_SURVEY={DEFAULT_SURVEY}
      updateQuestion={updateQuestion}
      deleteQuestion={deleteQuestion}
      duplicateQuestion={duplicateQuestion}
      addQuestion={addQuestion}
      openEdit={openEdit}
      closeEdit={closeEdit}
      saveEdit={saveEdit}
      addSection={addSection}
      deleteSection={deleteSection}
      addOption={addOption}
      updateOption={updateOption}
      deleteOption={deleteOption}
      handlePublish={handlePublish}
      currentSection={currentSection}
      allQuestions={allQuestions}
    />
  );
}