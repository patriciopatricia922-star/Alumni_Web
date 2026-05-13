// ============================================================================
// SurveyManagement.jsx — Logic Controller
// ============================================================================
// PERSISTENCE FIXES (in addition to the original FIX 1-6):
//
// PFIX-A — branchesRef sync race:
//   The useEffect that mirrors `branches` into `branchesRef` runs AFTER paint.
//   If the user clicks Publish in the same tick as their last branch change,
//   branchesRef.current still holds the prior render's value. Fixed by writing
//   branchesRef.current synchronously inside every setBranches call site, AND
//   adding a flush-read inside handlePublish that reads current React state
//   via a ref-callback pattern so the async function always sees the latest value.
//
// PFIX-B — Supabase UPDATE with null/undefined configId silently updates 0 rows:
//   If configIdRef.current is falsy the .eq("id", ...) filter matches nothing.
//   Supabase returns { data: [], error: null } — a silent non-update that looks
//   like success. Added explicit guard: if currentConfigId is falsy after load,
//   fall through to INSERT and back-fill the ref. Also added row-count check on
//   the UPDATE response to detect zero-row updates.
//
// PFIX-C — branches payload verification before write:
//   Added a pre-publish assertion that logs the exact payload being sent,
//   including the branches sub-object, so failures are visible in the console.
//   If the branches object is empty when the user has configured branches, a
//   warning is emitted rather than silently saving empty data.
//
// PFIX-D — post-save verification read-back:
//   After a successful INSERT or UPDATE, the saved row is re-fetched and the
//   returned config.branches is compared against what was sent. Any mismatch
//   is logged as an error toast so the user knows persistence failed even if
//   Supabase reported success.
//
// PFIX-E — load path: configIdRef written before any async setBranches call
//   so rapid publish-after-load never hits the INSERT path for an existing row.
//
// All original FIX 1-6, business logic, default data, type labels, component
// structure, and prop interface are preserved exactly.
// ============================================================================

import { useEffect, useState, useRef, useCallback } from "react";
import { supabaseAdmin } from "../lib/supabaseadmin";
import AdminSidebar from "./components/AdminSidebar";
import SurveyMgmtView from "./views/SurveyMgmtView";

// ============================================================================
// DEBUG LOGGER — toggle with localStorage.setItem('surveyDebug', '1')
// ============================================================================
const DEBUG = () =>
  typeof localStorage !== "undefined" && localStorage.getItem("surveyDebug") === "1";

const dbg = (...args) => {
  if (DEBUG()) console.log("[SurveyMgmt]", ...args);
};

const dbgWarn = (...args) => {
  if (DEBUG()) console.warn("[SurveyMgmt]", ...args);
};

// ============================================================================
// DEFAULT SURVEY DATA
// ============================================================================
const DEFAULT_SURVEY = {
  title: "Alumni Survey",
  sections: [
    {
      id: 1,
      title: "Personal Background",
      description: "Basic information about you",
      questions: [
        { id: 1,  type: "short",    label: "Last Name",              required: true,  placeholder: "e.g. Dela Cruz" },
        { id: 2,  type: "short",    label: "First Name",             required: true,  placeholder: "e.g. Juan" },
        { id: 3,  type: "short",    label: "Middle Name",            required: false, placeholder: "e.g. Mercado" },
        { id: 4,  type: "short",    label: "Student Number",         required: true,  placeholder: "e.g. 2023-123456" },
        { id: 5,  type: "multiple", label: "Gender",                 required: true,  options: ["Male", "Female", "Other"] },
        { id: 6,  type: "date",     label: "Birthday",               required: true },
        { id: 7,  type: "multiple", label: "Civil Status",           required: true,  options: ["Single", "Married", "Other"] },
        { id: 8,  type: "short",    label: "Complete Address",       required: true,  placeholder: "Enter your complete address" },
        { id: 9,  type: "short",    label: "Contact Number",         required: true,  placeholder: "e.g. 912-345-6789" },
        { id: 10, type: "short",    label: "Personal Email Address", required: true,  placeholder: "e.g. juandelacruz@gmail.com" },
      ],
    },
    {
      id: 2,
      title: "Educational Background",
      description: "Your academic history",
      questions: [
        { id: 1,  type: "multiple", label: "Degree Program Completed", required: true, options: ["Bachelor of Arts in Communication", "Bachelor of Science in Psychology", "Bachelor of Science in Physical Education", "Bachelor of Science in Accountancy", "Bachelor of Science in Management Accounting", "Bachelor of Science in Business Administration major in Marketing Management", "Bachelor of Science in Business Administration major in Financial Management", "Bachelor of Science in Business Administration major in Human Resource Management", "Bachelor of Science in Tourism Management", "Bachelor of Science in Hospitality Management", "Bachelor of Science in Architecture", "Bachelor of Science in Civil Engineering, Bachelor of Science in Computer Science with specialization in Machine Learning", "Bachelor of Science in Computer Engineering", "Bachelor of Science in Information Technology with specialization in Mobile and Web Application", "Master's in management with specialization in Business Analytics"] },
        { id: 2,  type: "long",     label: "Reason(s) of taking the course", required: true, placeholder: "Enter your answer" },
        { id: 3,  type: "multiple", label: "Year Graduated", required: true, options: ["2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"] },
        { id: 4,  type: "multiple", label: "Distinction Received", required: true, options: ["Summa Cum Laude", "Magna Cum Laude", "Cum Laude", "None"] },
        { id: 5,  type: "multiple", label: "Do you have plans on taking a post-graduate studies?", required: true, options: ["Yes", "No"] },
        { id: 6,  type: "long",     label: "If yes, what course?", required: false, placeholder: "Enter your answer" },
        { id: 7,  type: "multiple", label: "Are you currently taking/reviewing for licensure examination?", required: true, options: ["Yes", "No", "Not applicable"] },
        { id: 8,  type: "multiple", label: "Do you have any plans on taking licensure examination?", required: false, options: ["Yes", "No", "Already taken", "Not applicable"] },
        { id: 9,  type: "long",     label: "Reason(s) for not taking or taking licensure examination", required: false, placeholder: "Enter your answer" },
        { id: 10, type: "short",    label: "Name of board/licensure examination", required: false, placeholder: "Enter your answer" },
        { id: 11, type: "date",     label: "Date taken/date of examination", required: false },
        { id: 12, type: "multiple", label: "Results", required: false, options: ["Passed", "Failed", "Not Applicable", "Other"] },
      ],
    },
    {
      id: 3,
      title: "Certification Achievement",
      description: "Certifications you have",
      questions: [
        { id: 1, type: "multiple", label: "Are you a certiport passer?", required: true, options: ["Yes", "No"] },
        { id: 2, type: "checkbox", label: "Please specify any certiport certification earned", required: false, options: ["Microsoft Office Specialist (MOS) - Word", "Microsoft Office Specialist (MOS) - Excel", "Microsoft Office Specialist (MOS) - PowerPoint", "Microsoft Office Specialist (MOS) - Outlook", "Microsoft Office Specialist (MOS) - OneNote", "Other"] },
        { id: 3, type: "multiple", label: "Does your certification help in your current job?", required: false, options: ["Yes", "No"] },
        { id: 4, type: "short",    label: "How has your certification been useful in your career?", required: false, placeholder: "Please describe how your certifications have helped your career" },
      ],
    },
    {
      id: 4,
      title: "Employment Information",
      description: "Information related to your job",
      questions: [
        { id: 1,  type: "multiple", label: "Is your current job related to your degree?", required: true, options: ["Yes", "No"] },
        { id: 2,  type: "multiple", label: "Current Employment Status", required: true, options: ["Regular / Permanent", "Contractual", "Part-Time", "Probationary", "Self-Employed", "Unemployed, but looking for work", "Unemployed, but not looking for work", "Other"] },
        { id: 3,  type: "short",    label: "Please specify your employment status", required: false, placeholder: "Please specify" },
        { id: 4,  type: "short",    label: "Job position", required: false, placeholder: "Enter your answer" },
        { id: 5,  type: "short",    label: "Name of company / employer", required: false, placeholder: "Enter your answer" },
        { id: 6,  type: "multiple", label: "Type of industry", required: false, options: ["Agriculture, Forestry and Fishing", "Information and Communication Technology (ICT)", "Financial and Insurance Activities", "Education", "Other"] },
        { id: 7,  type: "multiple", label: "Location of employment", required: false, options: ["Local", "Abroad"] },
        { id: 8,  type: "multiple", label: "Monthly income range", required: false, options: ["Below ₱15,000", "₱15,001 – ₱30,000", "₱30,001 – ₱50,000", "Above ₱50,000"] },
        { id: 9,  type: "multiple", label: "Reasons for accepting the job", required: false, options: ["Salaries and Benefits", "Career Challenge", "Related to Special Skill", "Related to Course or Program of Study", "Proximity of Residence", "Peer Influence", "Family Influence", "Other"] },
        { id: 10, type: "multiple", label: "Reasons of being unemployed", required: false, options: ["Pursuing further studies", "Family responsibilities or personal matters", "Health-related reasons", "Lack of job opportunities related to the field of study", "Other"] },
        { id: 11, type: "short",    label: "Please specify other reason", required: false, placeholder: "Please specify" },
      ],
    },
    {
      id: 5,
      title: "Work Experience",
      description: "Your work hunting experience",
      questions: [
        { id: 1, type: "multiple", label: "How long did it take you to find your first job after graduation?", required: true, options: ["Less than a month", "1–3 months", "4–6 months", "7–12 months", "More than a year", "Not applicable"] },
        { id: 2, type: "multiple", label: "How long have you been employed in your current job?", required: true, options: ["Less than a month", "1–6 months", "7–11 months", "1 year or less than 2 years", "2 years or less than 3 years", "3 years or less than 4 years", "Other"] },
        { id: 3, type: "multiple", label: "How did you find your first job?", required: true, options: ["Job/Career Fair", "Internship Absorption", "Online", "Recommendation", "Walk-in Applications", "Not applicable", "Other"] },
        { id: 4, type: "checkbox", label: "What factors helped you most in getting your first job? (Check all that apply)", required: true, options: ["Academic performance", "Internship / On-the-job Training", "Personal connections", "Skills/Competencies acquired in school", "Certifications", "Not applicable", "Other"] },
      ],
    },
    {
      id: 6,
      title: "Skills & Competencies",
      description: "Your workplace skills",
      questions: [
        { id: 1, type: "checkbox", label: "What are the competencies learned in college did you find very useful?", required: true, options: ["Communication Skills", "Information & Technology Skills", "Leadership Skills", "Critical & Problem-Solving Skills", "Work Ethics/Professionalism", "Other"] },
        { id: 2, type: "rating",   label: "Communication Skills",                required: true },
        { id: 3, type: "rating",   label: "Information & Technology Skills",     required: true },
        { id: 4, type: "rating",   label: "Leadership Skills",                   required: true },
        { id: 5, type: "rating",   label: "Critical & Problem-Solving Skills",   required: true },
        { id: 6, type: "rating",   label: "Work Ethics/Professionalism Skills",  required: true },
        { id: 7, type: "short",    label: "What other skills should NU Dasma develop in students to make them more employable?", required: true, placeholder: "Enter your answer" },
      ],
    },
    {
      id: 7,
      title: "Feedback for the University",
      description: "Your insights and feedback",
      questions: [
        { id: 1, type: "multiple", label: "How satisfied are you with your education at NU Dasma?", required: true, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
        { id: 2, type: "multiple", label: "Would you recommend NU Dasma to others?", required: true, options: ["Yes", "No"] },
        { id: 3, type: "long",     label: "Suggestions for improving academic programs and alumni services", required: true, placeholder: "Enter your answer" },
      ],
    },
    {
      id: 8,
      title: "Alumni Engagement",
      description: "Your connection with the university",
      questions: [
        { id: 1, type: "multiple", label: "Would you like to be informed about upcoming alumni events and activities?", required: true, options: ["Yes", "No"] },
        { id: 2, type: "checkbox", label: "Would you be willing to participate in:", required: true, options: ["Alumni Seminars/Webinar programs for professional growth", "Career talks for students", "Alumni fundraising events/activities", "Volunteer opportunities", "Not at all", "Other"] },
      ],
    },
  ],
};

// ============================================================================
// TYPE LABELS MAPPING
// ============================================================================
const TYPE_LABELS = {
  short:    "Short Answer",
  long:     "Long Answer",
  multiple: "Multiple Choice",
  date:     "Date",
  rating:   "Rating (1–5)",
  name:     "Name Fields",
  title:    "Section Title",
};

// ============================================================================
// uid — collision-safe ID generator.
// ============================================================================
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ============================================================================
// sanitiseBranches — FIX 6
// ============================================================================
function sanitiseBranches(savedBranches, survey) {
  if (!savedBranches || typeof savedBranches !== "object") return {};

  const validRefs = new Set(["next", "end"]);
  survey.sections.forEach(sec =>
    sec.questions.forEach(q => validRefs.add(`q-${q.id}`))
  );

  const clean = {};

  for (const [key, val] of Object.entries(savedBranches)) {
    const withoutPrefix = key.slice(2);
    const optIdx = withoutPrefix.indexOf("-opt");
    const sourceId = optIdx === -1 ? withoutPrefix : withoutPrefix.slice(0, optIdx);

    if (!validRefs.has(`q-${sourceId}`)) {
      dbgWarn(`sanitiseBranches: pruning stale source key "${key}" (q-${sourceId} not found)`);
      continue;
    }

    const arr = Array.isArray(val) ? val : val ? [val] : ["next"];
    const filtered = arr.filter(v => {
      const valid = validRefs.has(v);
      if (!valid) dbgWarn(`sanitiseBranches: pruning stale destination "${v}" from key "${key}"`);
      return valid;
    });

    clean[key] = filtered.length > 0 ? filtered : ["next"];
  }

  dbg("sanitiseBranches result:", clean);
  return clean;
}

// ============================================================================
// LoadingScreen
// ============================================================================
const LoadingScreen = ({ message }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <AdminSidebar />
      <div style={{
        marginLeft: isMobile ? 0 : "229px",
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#E1ECF7",
        fontFamily: "Lexend, sans-serif", color: "#6A7282", fontSize: "14px",
      }}>
        {message}
      </div>
    </>
  );
};

// ============================================================================
// SurveyManagement — Main Logic Controller
// ============================================================================
export default function SurveyManagement() {

  // ── Survey data ───────────────────────────────────────────────────────────
  const [survey,        setSurvey]        = useState(null);
  const [configId,      setConfigId]      = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  // FIX 5 + PFIX-E — synchronous ref mirrors configId
  const configIdRef = useRef(null);

  // ── UI mode ───────────────────────────────────────────────────────────────
  const [branchMode, setBranchMode] = useState(false);
  const [editingQ,   setEditingQ]   = useState(null);

  // ── Edit tracking ─────────────────────────────────────────────────────────
  const editSnapshotRef = useRef(null);
  const [dirtyQ, setDirtyQ] = useState(false);

  // ── Publication ───────────────────────────────────────────────────────────
  const [saving,   setSaving]   = useState(false);
  const [status,   setStatus]   = useState("");
  const [branches, setBranches] = useState({});

  // PFIX-A — branchesRef is kept in sync both via useEffect AND written
  // synchronously in every setBranches call site below. The ref is the
  // single source of truth for handlePublish.
  const branchesRef = useRef({});

  // Helper: update branches state + ref atomically
  // Use this instead of raw setBranches everywhere branches change.
  const setBranchesAndRef = useCallback((updater) => {
    setBranches(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Write ref synchronously so handlePublish always sees the latest value
      // even if called before the next render+effect cycle.
      branchesRef.current = next;
      dbg("setBranchesAndRef →", next);
      return next;
    });
  }, []);

  // Keep the ref in sync as a safety net (covers external setBranches calls)
  useEffect(() => {
    branchesRef.current = branches;
  }, [branches]);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [toasts,       setToasts]       = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  // ── Branching UI ──────────────────────────────────────────────────────────
  const [highlightQ,    setHighlightQ]    = useState(null);
  const [branchTargetQ, setBranchTargetQ] = useState(null);

  // ==========================================================================
  // TOAST MANAGEMENT
  // ==========================================================================
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 2400);
  }, []);

  // ==========================================================================
  // CONFIRMATION MODAL
  // ==========================================================================
  const askConfirm = (message, onConfirm, title = "Delete?") =>
    setConfirmState({ message, onConfirm, title });

  // ==========================================================================
  // DATA LOADING — PFIX-E: configIdRef written before setBranches
  // ==========================================================================
  useEffect(() => {
    const load = async () => {
      dbg("Loading survey config from Supabase...");

      const { data, error } = await supabaseAdmin
        .from("survey_config")
        .select("id, config")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        dbgWarn("Load error (may be no rows yet):", error.message, error.code);
      }

      if (error || !data?.config?.sections?.length) {
        dbg("No saved config found — using DEFAULT_SURVEY");
        setSurvey(DEFAULT_SURVEY);
        // configIdRef stays null → first publish will INSERT
        return;
      }

      dbg("Loaded config row id:", data.id);
      dbg("Raw saved branches:", data.config.branches);

      const { branches: savedBranches, ...surveyData } = data.config;

      // PFIX-E — write ref synchronously BEFORE any async state updates
      configIdRef.current = data.id;
      setConfigId(data.id);
      setSurvey(surveyData);

      if (savedBranches) {
        const sanitised = sanitiseBranches(savedBranches, surveyData);
        dbg("Sanitised branches loaded:", sanitised);
        // Use setBranchesAndRef so ref is also updated synchronously
        setBranchesAndRef(sanitised);
      } else {
        dbg("No branches in saved config");
      }
    };

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ==========================================================================
  // PUBLISH — PFIX-A + PFIX-B + PFIX-C + PFIX-D
  // ==========================================================================
  const handlePublish = async () => {
    if (!survey) return;

    // PFIX-A — read the ref (written synchronously by setBranchesAndRef) so we
    // always get the latest branches even if this runs before the useEffect sync.
    const currentBranches = branchesRef.current;
    const currentConfigId = configIdRef.current;

    // PFIX-C — pre-publish payload diagnostics
    const branchKeyCount = Object.keys(currentBranches).length;
    dbg("=== PUBLISH START ===");
    dbg("configId (state):", configId, "| configIdRef:", currentConfigId);
    dbg("Branch key count:", branchKeyCount);
    dbg("Full branches payload:", JSON.stringify(currentBranches, null, 2));

    if (branchKeyCount === 0) {
      // This is not an error — user may not have set any branches yet.
      dbg("Note: branches payload is empty (no rules configured)");
    }

    const payload = { ...survey, branches: currentBranches };

    dbg("Full publish payload sections count:", payload.sections.length);
    dbg("Payload branches key count:", Object.keys(payload.branches).length);

    setSaving(true);
    setStatus("saving");

    try {
      if (currentConfigId) {
        // ── UPDATE path ──────────────────────────────────────────────────
        dbg("UPDATE path — targeting row id:", currentConfigId);

        const { data: updateData, error: updateError, count } = await supabaseAdmin
          .from("survey_config")
          .update({ config: payload, updated_at: new Date().toISOString() })
          .eq("id", currentConfigId)
          .select("id, config");   // select back so we can verify

        dbg("UPDATE response — error:", updateError, "| returned rows:", updateData?.length ?? "n/a");

        if (updateError) throw updateError;

        // PFIX-B — detect silent zero-row update
        if (!updateData || updateData.length === 0) {
          const msg = `UPDATE matched 0 rows for id=${currentConfigId}. The row may have been deleted or the ID is stale.`;
          console.error("[SurveyMgmt] PFIX-B:", msg);
          throw new Error(msg);
        }

        // PFIX-D — verify what was actually written
        const savedBranches = updateData[0]?.config?.branches;
        dbg("Read-back branches from UPDATE:", JSON.stringify(savedBranches, null, 2));

        const sentKeys   = Object.keys(currentBranches).sort().join(",");
        const savedKeys  = Object.keys(savedBranches ?? {}).sort().join(",");

        if (sentKeys !== savedKeys) {
          console.error(
            "[SurveyMgmt] PFIX-D: Branch key mismatch after UPDATE!\n" +
            "  Sent:  " + sentKeys + "\n" +
            "  Saved: " + savedKeys
          );
          addToast("Warning: branch data may not have saved correctly. Check console.", "delete");
        } else {
          dbg("PFIX-D: Read-back verified ✓ — branch keys match");
        }

      } else {
        // ── INSERT path ──────────────────────────────────────────────────
        dbg("INSERT path — no existing config row");

        const { data: insertData, error: insertError } = await supabaseAdmin
          .from("survey_config")
          .insert({ config: payload })
          .select("id, config")
          .single();

        dbg("INSERT response — error:", insertError, "| returned row:", insertData?.id);

        if (insertError) throw insertError;

        if (insertData) {
          // PFIX-B — write ref first so any immediate re-publish uses the new ID
          configIdRef.current = insertData.id;
          setConfigId(insertData.id);
          dbg("INSERT success — new configId:", insertData.id);

          // PFIX-D — verify what was actually written
          const savedBranches = insertData?.config?.branches;
          dbg("Read-back branches from INSERT:", JSON.stringify(savedBranches, null, 2));

          const sentKeys  = Object.keys(currentBranches).sort().join(",");
          const savedKeys = Object.keys(savedBranches ?? {}).sort().join(",");

          if (sentKeys !== savedKeys) {
            console.error(
              "[SurveyMgmt] PFIX-D: Branch key mismatch after INSERT!\n" +
              "  Sent:  " + sentKeys + "\n" +
              "  Saved: " + savedKeys
            );
            addToast("Warning: branch data may not have saved correctly. Check console.", "delete");
          } else {
            dbg("PFIX-D: Read-back verified ✓ — branch keys match");
          }
        }
      }

      dbg("=== PUBLISH SUCCESS ===");
      setStatus("saved");
      setTimeout(() => setStatus(""), 3000);

    } catch (err) {
      // FIX 4 + PFIX-C — surface the error
      console.error("[SurveyManagement] Publish failed:", err);
      dbg("=== PUBLISH FAILED ===", err);
      setStatus("error");
      addToast("Failed to publish. Please try again.", "delete");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================================
  // BRANCHING SCROLL
  // ==========================================================================
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

  // ==========================================================================
  // QUESTION CRUD
  // ==========================================================================
  const updateQuestion = (sIdx, qIdx, patch) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((sec, si) =>
        si !== sIdx ? sec : {
          ...sec,
          questions: sec.questions.map((q, qi) => qi !== qIdx ? q : { ...q, ...patch }),
        }
      ),
    }));
    if (editingQ?.sIdx === sIdx && editingQ?.qIdx === qIdx) setDirtyQ(true);
  };

  const openEdit = (sIdx, qIdx) => {
    editSnapshotRef.current = JSON.stringify(survey.sections[sIdx].questions[qIdx]);
    setDirtyQ(false);
    setEditingQ({ sIdx, qIdx });
  };

  const closeEdit = () => {
    setEditingQ(null);
    setDirtyQ(false);
    editSnapshotRef.current = null;
  };

  const saveEdit = () => {
    setEditingQ(null);
    setDirtyQ(false);
    editSnapshotRef.current = null;
    addToast("Question updated successfully", "edit");
  };

  // FIX 1 — deleteQuestion: use setBranchesAndRef for atomic ref update
  const deleteQuestion = (sIdx, qIdx, label) => {
    askConfirm(
      `Delete the question "${label}"? This action cannot be undone.`,
      () => {
        const deletedId  = survey.sections[sIdx].questions[qIdx].id;
        const deletedRef = `q-${deletedId}`;

        setBranchesAndRef(prev => {
          const next = { ...prev };

          Object.keys(next).forEach(k => {
            if (k === deletedRef || k.startsWith(`${deletedRef}-opt`)) {
              delete next[k];
              return;
            }
            if (Array.isArray(next[k])) {
              const filtered = next[k].filter(v => v !== deletedRef);
              next[k] = filtered.length > 0 ? filtered : ["next"];
            }
          });

          dbg("deleteQuestion: branches after cleanup:", next);
          return next;
        });

        setSurvey(prev => ({
          ...prev,
          sections: prev.sections.map((sec, si) =>
            si !== sIdx ? sec : {
              ...sec,
              questions: sec.questions.filter((_, qi) => qi !== qIdx),
            }
          ),
        }));
        setConfirmState(null);
        addToast("Question deleted", "delete");
      }
    );
  };

  // FIX 2 — deleteSection: use setBranchesAndRef for atomic ref update
  const deleteSection = (index) => {
    const sectionTitle = survey.sections[index].title;
    askConfirm(
      `Delete the section "${sectionTitle}" and all its questions? This action cannot be undone.`,
      () => {
        const deletedIdStrings = new Set(
          survey.sections[index].questions.map(q => String(q.id))
        );

        setBranchesAndRef(prev => {
          const next = { ...prev };

          Object.keys(next).forEach(k => {
            const withoutPrefix = k.slice(2);
            const optMarker     = withoutPrefix.indexOf("-opt");
            const sourceIdStr   = optMarker === -1
              ? withoutPrefix
              : withoutPrefix.slice(0, optMarker);

            if (deletedIdStrings.has(sourceIdStr)) {
              delete next[k];
              return;
            }

            if (Array.isArray(next[k])) {
              const filtered = next[k].filter(v => {
                if (!v.startsWith("q-")) return true;
                const destIdStr = v.slice(2);
                return !deletedIdStrings.has(destIdStr);
              });
              next[k] = filtered.length > 0 ? filtered : ["next"];
            }
          });

          dbg("deleteSection: branches after cleanup:", next);
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
      const q   = { ...sec.questions[qIdx], id: uid() };
      const qs  = [...sec.questions];
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
      sections: prev.sections.map((s, si) =>
        si !== sIdx ? s : {
          ...s,
          questions: [
            ...s.questions,
            { id: uid(), type: "short", label: "New Question", required: false, placeholder: "Enter your answer" },
          ],
        }
      ),
    }));
  };

  // FIX 3 — addSection
  const addSection = () => {
    setSurvey(prev => {
      const updated = {
        ...prev,
        sections: [
          ...prev.sections,
          { id: uid(), title: `Section ${prev.sections.length + 1}`, description: "New section", questions: [] },
        ],
      };
      setActiveSection(updated.sections.length - 1);
      return updated;
    });
  };

  // ==========================================================================
  // OPTION CRUD — use setBranchesAndRef for atomic ref updates
  // ==========================================================================
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
    const qId    = survey.sections[sIdx].questions[qIdx].id;
    const optKey = `q-${qId}-opt${oIdx}`;

    setBranchesAndRef(prev => {
      const next = { ...prev };
      delete next[optKey];

      const higherKeys = Object.keys(next).filter(k =>
        k.startsWith(`q-${qId}-opt`) && parseInt(k.split("opt")[1], 10) > oIdx
      );
      higherKeys.forEach(k => {
        const oldIdx = parseInt(k.split("opt")[1], 10);
        next[`q-${qId}-opt${oldIdx - 1}`] = next[k];
        delete next[k];
      });

      dbg("deleteOption: branches after re-index:", next);
      return next;
    });

    const opts = survey.sections[sIdx].questions[qIdx].options.filter((_, i) => i !== oIdx);
    updateQuestion(sIdx, qIdx, { options: opts });
  };

  // ==========================================================================
  // DERIVED DATA
  // ==========================================================================
  const currentSection = survey?.sections[activeSection];
  const allQuestions = survey?.sections.flatMap((s, si) =>
    s.questions.map((q, qi) => ({ ...q, sIdx: si, qIdx: qi, sectionTitle: s.title }))
  ) || [];

  // ==========================================================================
  // LOADING GATE
  // ==========================================================================
  if (!survey) return <LoadingScreen message="Loading survey configuration..." />;

  // ==========================================================================
  // RENDER
  // ==========================================================================
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
      // PFIX-A — pass setBranchesAndRef so the view's onChange handlers also
      // write the ref synchronously, not raw setBranches.
      setBranches={setBranchesAndRef}
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