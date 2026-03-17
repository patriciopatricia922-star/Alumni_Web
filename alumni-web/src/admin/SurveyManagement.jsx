import { useEffect, useState, useCallback } from "react";
import { supabaseAdmin } from "../lib/supabaseadmin";
import AdminSidebar from "./AdminSidebar";

// ─── Default survey (used if Supabase has no config yet) ──────────────────────
const DEFAULT_SURVEY = {
  title: "Alumni Survey",
  sections: [
    { id: 1, title: "Personal Background", description: "Basic information about you", questions: [
      { id: 1, type: "short",    label: "Last Name",              required: true,  placeholder: "e.g. Dela Cruz" },
      { id: 2, type: "name",     label: "Name",                   required: true,  fields: [{ label: "First Name", placeholder: "e.g. Juan" }, { label: "Middle Name", placeholder: "e.g. Santos" }] },
      { id: 3, type: "multiple", label: "Gender",                 required: true,  options: ["Male", "Female", "Other"] },
      { id: 4, type: "date",     label: "Birthday",               required: true },
      { id: 5, type: "multiple", label: "Civil Status",           required: true,  options: ["Single", "Married", "Other"] },
      { id: 6, type: "short",    label: "Complete Address",       required: true,  placeholder: "e.g. Blk 123 Lot 456" },
      { id: 7, type: "short",    label: "Contact Number",         required: true,  placeholder: "+63 912-345-6789" },
      { id: 8, type: "short",    label: "Personal Email Address", required: true,  placeholder: "example@email.com" },
    ]},
    { id: 2, title: "Educational Background", description: "Your academic history", questions: [
      { id: 1, type: "multiple", label: "Degree Program Completed", required: true, options: ["BS Information Technology","BS Computer Science","BS Information Systems","Other"] },
      { id: 2, type: "long",     label: "Reason(s) of taking the course", required: true, placeholder: "Enter your answer" },
      { id: 3, type: "multiple", label: "Year Graduated", required: true, options: ["2018","2019","2020","2021","2022","2023","2024","2025"] },
      { id: 4, type: "multiple", label: "Distinction Received", required: true, options: ["Cum Laude","Magna Cum Laude","Summa Cum Laude","None"] },
      { id: 5, type: "multiple", label: "Do you have plans on taking a post-graduate studies?", required: true, options: ["Yes","No"] },
      { id: 6, type: "short",    label: "If yes, what course?", required: false, placeholder: "Enter your answer" },
      { id: 7, type: "multiple", label: "Are you currently taking/reviewing for a Licensure examination?", required: true, options: ["Yes","No"] },
      { id: 8, type: "short",    label: "Name of Board/Licensure Examination", required: false, placeholder: "Enter your answer" },
      { id: 9, type: "date",     label: "Date Taken/Date of Examination", required: false },
      { id: 10, type: "multiple", label: "Results", required: true, options: ["Passed","Failed","Not Applicable","Other"] },
      { id: 11, type: "multiple", label: "Do you have any plans on taking a Licensure Examination?", required: true, options: ["Yes","No","Maybe","Not at all"] },
      { id: 12, type: "long",    label: "Reason(s) for not taking or taking Licensure Examination", required: false, placeholder: "Enter your answer" },
    ]},
    { id: 3, title: "Certification Achievement", description: "Certifications you have", questions: [
      { id: 1, type: "multiple", label: "Are you a Certiport passer?", required: true, options: ["Yes","No"] },
      { id: 2, type: "multiple", label: "Please specify the type(s) of Certiport certification earned", required: true, options: ["Microsoft Office Specialist (MOS)","Adobe Certified Professional","IC3 Digital Literacy","Other"] },
      { id: 3, type: "multiple", label: "Does your certification help in your current job?", required: true, options: ["Yes","No"] },
      { id: 4, type: "short",    label: "How has your certification been useful in your career?", required: true, placeholder: "Enter your answer" },
    ]},
    { id: 4, title: "Employment Information", description: "Information related to your job", questions: [
      { id: 1, type: "multiple", label: "Is your current job related to your degree?", required: true, options: ["Yes","No"] },
      { id: 2, type: "multiple", label: "Current Employment Status", required: true, options: ["Employed","Self-Employed","Unemployed"] },
      { id: 3, type: "short",    label: "Job Title / Position", required: true, placeholder: "Enter your answer" },
      { id: 4, type: "short",    label: "Name of Company/Employer", required: true, placeholder: "Enter your answer" },
      { id: 5, type: "multiple", label: "Type of Industry", required: true, options: ["Information Technology","Education","Business","Government","Other"] },
      { id: 6, type: "multiple", label: "Location of Employment", required: true, options: ["Local","Abroad"] },
      { id: 7, type: "multiple", label: "Monthly Income Range", required: true, options: ["Below ₱15,000","₱15,001 – ₱30,000","₱30,001 – ₱50,000","Above ₱50,000"] },
      { id: 8, type: "multiple", label: "Reason(s) for accepting the job", required: true, options: ["Salaries and Benefits","Career Challenge","Related to Special Skill","Related to Course or Program of Study","Proximity of Residence","Peer Influence","Family Influence","Other"] },
      { id: 9, type: "multiple", label: "Reasons of being Unemployed", required: false, options: ["Pursuing Further Studies","Family Responsibilities or Personal Matters","Health-Related Reasons","Lack of Job Opportunities","Waiting for Job Placement Results","Currently Seeking Better Opportunities","Started a Personal Business","Relocation or Migration Plans","Lack of Work Experience","Taking a Break","Reviewing for Board Examination","Other"] },
    ]},
    { id: 5, title: "Job Experience", description: "Your job hunting experience", questions: [
      { id: 1, type: "multiple", label: "How long did it take you to find your first job after graduation?", required: true, options: ["Less than a month","1-3 months","4-6 months","7-12 months","More than a year","Not Applicable"] },
      { id: 2, type: "multiple", label: "How long have you been employed in your current job?", required: true, options: ["Less than a month","1-6 months","7-11 months","1 year or less than 2 years","2 years or less than 3 years","3 years or less than 4 years","Other"] },
      { id: 3, type: "multiple", label: "How did you find your first job?", required: true, options: ["Job/Career Fair","Internship Absorption","Online","Recommendation","Walk-in Applications","Not Applicable","Other"] },
      { id: 4, type: "multiple", label: "What factors helped you most in getting your first job?", required: true, options: ["Academic performance","Internship / On-the-job Training","Personal connections","Skills/Competencies acquired in school","Certifications","Not Applicable","Other"] },
    ]},
    { id: 6, title: "Skills & Competencies", description: "Your workplace skills", questions: [
      { id: 1, type: "multiple", label: "Is your current job related to your degree?", required: true, options: ["Yes","No"] },
      { id: 2, type: "multiple", label: "What competencies learned in college did you find very useful?", required: true, options: ["Communication Skills","Information Technology Skills","Leadership Skills","Critical & Problem-Solving Skills","Work Ethics/Professionalism","Other"] },
      { id: 3, type: "rating",   label: "Communication Skills", required: true },
      { id: 4, type: "rating",   label: "Information Technology Skills", required: true },
      { id: 5, type: "rating",   label: "Leadership Skills", required: true },
      { id: 6, type: "rating",   label: "Critical & Problem-Solving Skills", required: true },
      { id: 7, type: "rating",   label: "Work Ethics/Professionalism Skills", required: true },
      { id: 8, type: "short",    label: "What other skills should NU Dasma develop in students to make them more employable?", required: true, placeholder: "Enter your answer" },
    ]},
    { id: 7, title: "Feedback & Alumni Engagement", description: "Your insights and involvement", questions: [
      { id: 1, type: "title",    label: "Feedback for the University" },
      { id: 2, type: "multiple", label: "How satisfied are you with your education at NU Dasma?", required: true, options: ["Very Satisfied","Satisfied","Neutral","Dissatisfied","Very Dissatisfied"] },
      { id: 3, type: "multiple", label: "Would you recommend NU Dasma to others?", required: true, options: ["Yes","No"] },
      { id: 4, type: "long",     label: "Suggestions for improving academic programs and alumni services", required: true, placeholder: "Enter your answer" },
      { id: 5, type: "title",    label: "Alumni Engagement" },
      { id: 6, type: "multiple", label: "Would you like to be informed about upcoming alumni events and activities?", required: true, options: ["Yes","No"] },
      { id: 7, type: "multiple", label: "Would you be willing to participate in:", required: true, options: ["Alumni Seminars/Webinar Programs for Professional Growth","Career Talks for Students","Alumni Fundraising Events/Activities","Volunteer Opportunities","Not at all","Other"] },
    ]},
  ]
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
const IconBranch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M6 3v12M6 15c0 3 3 4 6 4M18 3v4M18 7a4 4 0 01-4 4H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// ─── Question type label map ───────────────────────────────────────────────────
const TYPE_LABELS = {
  short: "Short Answer", long: "Long Answer", multiple: "Multiple Choice",
  date: "Date", rating: "Rating (1–5)", name: "Name Fields", title: "Section Title",
};

// ─── Main Component ────────────────────────────────────────────────────────────
function SurveyManagement() {
  const [survey,        setSurvey]        = useState(null);
  const [configId,      setConfigId]      = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [branchMode,    setBranchMode]    = useState(false);
  const [editingQ,      setEditingQ]      = useState(null); // { sIdx, qIdx }
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [status,        setStatus]        = useState(""); // "saving" | "saved" | "error"
  const [branches,      setBranches]      = useState({}); // { "sIdx-qIdx": destKey }

  // ── Load from Supabase ───────────────────────────────────────────────────────
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
        setSurvey(data.config);
      }
    };
    load();
  }, []);

  // ── Save to Supabase ─────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!survey) return;
    setSaving(true);
    setStatus("saving");
    try {
      if (configId) {
        await supabaseAdmin
          .from("survey_config")
          .update({ config: survey, updated_at: new Date().toISOString() })
          .eq("id", configId);
      } else {
        const { data } = await supabaseAdmin
          .from("survey_config")
          .insert({ config: survey })
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

  // ── Mutation helpers ─────────────────────────────────────────────────────────
  const updateQuestion = (sIdx, qIdx, patch) => {
    setSurvey(prev => {
      const s = prev.sections.map((sec, si) => si !== sIdx ? sec : {
        ...sec,
        questions: sec.questions.map((q, qi) => qi !== qIdx ? q : { ...q, ...patch }),
      });
      return { ...prev, sections: s };
    });
  };

  const deleteQuestion = (sIdx, qIdx) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((sec, si) => si !== sIdx ? sec : {
        ...sec, questions: sec.questions.filter((_, qi) => qi !== qIdx),
      }),
    }));
  };

  const duplicateQuestion = (sIdx, qIdx) => {
    setSurvey(prev => {
      const sec = prev.sections[sIdx];
      const q = { ...sec.questions[qIdx], id: Date.now() };
      const qs = [...sec.questions];
      qs.splice(qIdx + 1, 0, q);
      return {
        ...prev,
        sections: prev.sections.map((s, si) => si !== sIdx ? s : { ...s, questions: qs }),
      };
    });
  };

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
    const opts = survey.sections[sIdx].questions[qIdx].options.filter((_, i) => i !== oIdx);
    updateQuestion(sIdx, qIdx, { options: opts });
  };

  const addQuestion = (sIdx) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) => si !== sIdx ? s : {
        ...s, questions: [...s.questions, { id: Date.now(), type: "short", label: "New Question", required: false, placeholder: "Enter your answer" }],
      }),
    }));
  };

  if (!survey) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#F0F4F8", fontFamily:"Lexend,sans-serif", color:"#6A7282" }}>
      Loading survey...
    </div>
  );

  const currentSection = survey.sections[activeSection];
  const allQuestions   = survey.sections.flatMap((s, si) =>
    s.questions.map((q, qi) => ({ ...q, sIdx: si, qIdx: qi, sectionTitle: s.title }))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;700&family=Arimo:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }

        .sm-page {
          min-height: 100vh;
          background: rgba(225,236,247,0.95);
          margin-left: 229px;
          padding: 37px 32px 80px;
          font-family: 'Arimo', Arial, sans-serif;
        }
        @media (max-width: 900px) { .sm-page { margin-left: 0; padding: 20px 16px 60px; } }

        /* heading */
        .sm-heading {
          display:flex; justify-content:space-between; align-items:flex-start;
          flex-wrap:wrap; gap:12px; margin-bottom:24px;
          position:sticky; top:0; z-index:100;
          background:rgba(225,236,247,0.97);
          backdrop-filter:blur(6px);
          padding-top:8px; padding-bottom:12px;
          margin-top:-8px;
        }
        .sm-title   { margin:0 0 4px; font-family:'Lexend',sans-serif; font-weight:700; font-size:30px; color:#324D87; }
        .sm-sub     { margin:0; font-family:'Lexend',sans-serif; font-size:16px; color:#6A7282; }

        /* publish btn */
        .sm-publish {
          height:38px; padding:0 20px; border:none; border-radius:10px;
          background:#155DFC; color:#fff; font-family:'Arimo',sans-serif;
          font-size:14px; font-weight:600; cursor:pointer; display:flex;
          align-items:center; gap:8px; transition:background .15s;
        }
        .sm-publish:hover   { background:#1147cc; }
        .sm-publish:disabled{ opacity:.6; cursor:not-allowed; }
        .sm-publish.saved   { background:#00A63E; }
        .sm-publish.error   { background:#BF0000; }

        /* layout */
        .sm-layout { display:grid; grid-template-columns:220px 1fr; gap:20px; }
        @media (max-width:860px) { .sm-layout { grid-template-columns:1fr; } }

        /* sidebar */
        .sm-sidebar { position:sticky; top:100px; height:calc(100vh - 120px); display:flex; flex-direction:column; gap:10px; overflow-y:auto; }
        .sm-add-sec {
          height:36px; background:#E2E8F0; border:none; border-radius:8px;
          font-family:'Arimo',sans-serif; font-size:13px; color:#314158;
          cursor:pointer; transition:background .12s;
        }
        .sm-add-sec:hover { background:#cbd5e1; }
        .sm-sec-list { display:flex; flex-direction:column; gap:6px; }
        .sm-sec-item {
          display:flex; align-items:center; gap:8px;
          background:#fff; border:1px solid #E2E8F0; border-radius:8px;
          padding:8px 10px; cursor:pointer; font-family:'Arimo',sans-serif;
          font-size:13px; color:#314158; transition:border-color .12s, background .12s;
        }
        .sm-sec-item:hover  { background:#F8FAFC; }
        .sm-sec-item.active { border-color:#155DFC; background:#EFF6FF; color:#155DFC; }
        .sm-sec-num {
          width:20px; height:20px; border-radius:50%; background:#E2E8F0;
          display:flex; align-items:center; justify-content:center;
          font-size:11px; color:#62748E; flex-shrink:0;
        }
        .sm-sec-item.active .sm-sec-num { background:#DBEAFE; color:#155DFC; }

        /* builder */
        .sm-builder { display:flex; flex-direction:column; gap:12px; }

        /* section header card */
        .sm-sec-card {
          background:#fff; border-radius:12px; border:1px solid #E2E8F0;
          border-left:4px solid #155DFC; padding:16px 20px;
          position:sticky; top:78px; z-index:90;
          box-shadow:0 2px 8px rgba(0,0,0,.06);
        }
        .sm-sec-card-top { font-family:'Arimo',sans-serif; font-size:12px; color:#90A1B9; margin-bottom:4px; }
        .sm-sec-card h2  { margin:0 0 4px; font-family:'Lexend',sans-serif; font-size:18px; color:#0F172B; font-weight:600; }
        .sm-sec-card p   { margin:0; font-family:'Arimo',sans-serif; font-size:13px; color:#6A7282; }

        /* question card */
        .sm-q-card {
          background:#fff; border-radius:12px; border:1px solid #E2E8F0;
          border-left:4px solid #3b82f6; padding:16px 18px; position:relative;
          transition:box-shadow .15s;
        }
        .sm-q-card:hover { box-shadow:0 2px 8px rgba(0,0,0,.08); }
        .sm-q-card.editing { border-left-color:#155DFC; box-shadow:0 0 0 2px rgba(21,93,252,.12); }
        .sm-q-card.title-card { border-left-color:#6366f1; }

        /* question header */
        .sm-q-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:10px; }
        .sm-q-label  { font-family:'Arimo',sans-serif; font-size:14px; font-weight:600; color:#0F172B; flex:1; }
        .sm-q-label input {
          width:100%; border:none; border-bottom:2px solid #155DFC; outline:none;
          font-family:'Arimo',sans-serif; font-size:14px; font-weight:600; color:#0F172B;
          background:transparent; padding:2px 0;
        }
        .sm-q-required { color:#EF4444; font-size:13px; margin-left:3px; }
        .sm-q-actions  { display:flex; align-items:center; gap:6px; flex-shrink:0; }

        /* type badge */
        .sm-type-badge {
          display:inline-flex; align-items:center; padding:3px 10px;
          background:#F1F5F9; border-radius:9999px;
          font-family:'Arimo',sans-serif; font-size:11px; color:#62748E;
        }
        .sm-type-select {
          padding:3px 8px; border:1px solid #CAD5E2; border-radius:9999px;
          background:#F1F5F9; font-family:'Arimo',sans-serif; font-size:11px;
          color:#314158; outline:none; cursor:pointer;
        }

        /* icon buttons */
        .sm-icon-btn {
          width:28px; height:28px; border-radius:6px; border:1px solid #E2E8F0;
          background:#fff; display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#62748E; transition:background .12s, color .12s;
        }
        .sm-icon-btn:hover               { background:#F1F5F9; color:#314158; }
        .sm-icon-btn.danger:hover         { background:#FFE2E2; color:#BF0000; border-color:#FFB3B3; }
        .sm-icon-btn.purple:hover         { background:#F3E8FF; color:#7c3aed; border-color:#ddd6fe; }
        .sm-icon-btn.edit-active          { background:#EFF6FF; color:#155DFC; border-color:#BFDBFE; }

        /* required toggle */
        .sm-req-toggle {
          display:inline-flex; align-items:center; gap:6px;
          font-family:'Arimo',sans-serif; font-size:12px; color:#6A7282;
          cursor:pointer; padding:3px 8px; border-radius:6px;
          border:1px solid #E2E8F0; background:#F8FAFC;
          transition:background .12s;
        }
        .sm-req-toggle:hover   { background:#EFF6FF; }
        .sm-req-toggle input   { margin:0; cursor:pointer; accent-color:#155DFC; }

        /* preview inputs */
        .sm-preview-input {
          width:100%; max-width:340px; height:34px;
          border:1px solid #E2E8F0; border-radius:8px;
          padding:4px 12px; font-family:'Arimo',sans-serif;
          font-size:13px; color:#62748E; background:#F8FAFC;
          pointer-events:none;
        }
        .sm-preview-textarea {
          width:100%; max-width:340px; height:60px;
          border:1px solid #E2E8F0; border-radius:8px;
          padding:6px 12px; font-family:'Arimo',sans-serif;
          font-size:13px; color:#62748E; background:#F8FAFC;
          pointer-events:none; resize:none;
        }

        /* radio/checkbox preview */
        .sm-opt-list  { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
        .sm-opt-row   { display:flex; align-items:center; gap:8px; }
        .sm-opt-input {
          flex:1; max-width:260px; border:none; border-bottom:1px solid #E2E8F0;
          padding:2px 4px; font-family:'Arimo',sans-serif; font-size:13px;
          color:#314158; outline:none; background:transparent;
        }
        .sm-opt-input:focus { border-bottom-color:#155DFC; }
        .sm-opt-add {
          margin-top:8px; background:none; border:1px dashed #CAD5E2;
          border-radius:6px; padding:4px 12px; font-family:'Arimo',sans-serif;
          font-size:12px; color:#90A1B9; cursor:pointer; transition:all .12s;
        }
        .sm-opt-add:hover { border-color:#155DFC; color:#155DFC; background:#EFF6FF; }

        /* rating stars */
        .sm-stars { display:flex; gap:6px; margin-top:4px; }
        .sm-star  { font-size:22px; color:#D1D5DB; }

        /* name fields */
        .sm-name-fields { display:flex; gap:12px; flex-wrap:wrap; }
        .sm-name-field  { display:flex; flex-direction:column; gap:4px; flex:1; min-width:120px; }
        .sm-name-label  { font-family:'Arimo',sans-serif; font-size:12px; color:#6A7282; }

        /* add question btn */
        .sm-add-q {
          height:36px; background:#fff; border:1px dashed #CAD5E2;
          border-radius:10px; font-family:'Arimo',sans-serif;
          font-size:13px; color:#90A1B9; cursor:pointer; transition:all .15s;
        }
        .sm-add-q:hover { border-color:#155DFC; color:#155DFC; background:#EFF6FF; }

        /* branch page */
        .sm-branch-header  { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
        .sm-branch-back    { display:flex; align-items:center; gap:6px; background:none; border:none; font-family:'Arimo',sans-serif; font-size:14px; color:#314158; cursor:pointer; padding:6px 10px; border-radius:8px; transition:background .12s; }
        .sm-branch-back:hover { background:#E2E8F0; }
        .sm-branch-card    { background:#fff; border-radius:12px; border:1px solid #E2E8F0; padding:20px; display:flex; flex-direction:column; gap:0; }
        .sm-branch-qrow    { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #F1F5F9; gap:16px; flex-wrap:wrap; }
        .sm-branch-qrow:last-child { border-bottom:none; }
        .sm-branch-qlabel  { font-family:'Arimo',sans-serif; font-size:13px; color:#0F172B; flex:1; min-width:180px; }
        .sm-branch-qtype   { font-family:'Arimo',sans-serif; font-size:11px; color:#90A1B9; margin-top:2px; }
        .sm-branch-select  { padding:5px 10px; border:1px solid #CAD5E2; border-radius:8px; font-family:'Arimo',sans-serif; font-size:12px; color:#314158; background:#F8FAFC; outline:none; cursor:pointer; }

        /* status indicator */
        .sm-status { font-family:'Arimo',sans-serif; font-size:12px; display:flex; align-items:center; gap:6px; }
        .sm-status.saved { color:#00A63E; }
        .sm-status.error { color:#BF0000; }
        .sm-status.saving { color:#6A7282; }
      `}</style>

      <AdminSidebar />

      <div className="sm-page">

        {/* Heading */}
        <div className="sm-heading">
          <div>
            <h1 className="sm-title">Survey Management</h1>
            <p className="sm-sub">Edit questions and publish to reflect on the alumni survey.</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {status === "saved"  && <span className="sm-status saved"><IconCheck /> Changes published</span>}
            {status === "error"  && <span className="sm-status error">Failed to save</span>}
            {status === "saving" && <span className="sm-status saving">Saving…</span>}
            <button
              className={`sm-publish${status === "saved" ? " saved" : status === "error" ? " error" : ""}`}
              onClick={handlePublish}
              disabled={saving}
            >
              {saving ? "Publishing…" : status === "saved" ? "✓ Published" : "Publish Changes"}
            </button>
          </div>
        </div>

        <div className="sm-layout">

          {/* Sidebar */}
          <div className="sm-sidebar">
            <button
              className="sm-add-sec"
              onClick={() => {
                setSurvey(prev => ({
                  ...prev,
                  sections: [
                    ...prev.sections,
                    { id: Date.now(), title: `Section ${prev.sections.length + 1}`, description: "New section", questions: [] }
                  ]
                }));
                setActiveSection(survey.sections.length);
              }}
            >
              + Add Section
            </button>
            <button
              className="sm-add-sec"
              onClick={() => {
                setSurvey(prev => ({
                  ...prev,
                  sections: [...prev.sections, {
                    id: Date.now(),
                    title: "New Section",
                    description: "Section description",
                    questions: []
                  }]
                }));
                setActiveSection(survey.sections.length);
              }}
            >
              + Add Section
            </button>
            <button className="sm-add-sec" onClick={() => {
                setSurvey(prev => ({
                  ...prev,
                  sections: [...prev.sections, {
                    id: Date.now(),
                    title: `Section ${prev.sections.length + 1}`,
                    description: "New section",
                    questions: []
                  }]
                }));
                setActiveSection(survey.sections.length);
              }}>
                + Add Section
              </button>
            <button
            className="sm-add-sec"
            onClick={() => {
              setSurvey(prev => ({
                ...prev,
                sections: [...prev.sections, {
                  id: Date.now(),
                  title: `New Section ${prev.sections.length + 1}`,
                  description: "Section description",
                  questions: [],
                }],
              }));
              setActiveSection(survey.sections.length);
            }}
          >
            + Add Section
          </button>
          <button
              className="sm-add-sec"
              onClick={() => {
                setSurvey(prev => ({
                  ...prev,
                  sections: [...prev.sections, {
                    id: Date.now(),
                    title: `New Section ${prev.sections.length + 1}`,
                    description: "Section description",
                    questions: []
                  }]
                }));
                setActiveSection(survey.sections.length);
              }}
            >+ Add Section</button>
          <button
              className="sm-add-sec"
              onClick={() => setSurvey(prev => ({
                ...prev,
                sections: [...prev.sections, {
                  id: Date.now(),
                  title: "New Section",
                  description: "Section description",
                  questions: [{ id: Date.now(), type: "short", label: "New Question", required: false, placeholder: "Enter your answer" }]
                }]
              }))}
            >
              + Add Section
            </button>
          <div className="sm-sec-list">
              {survey.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className={`sm-sec-item${activeSection === idx ? " active" : ""}`}
                  onClick={() => { setActiveSection(idx); setBranchMode(false); setEditingQ(null); }}
                >
                  <div className="sm-sec-num">{idx + 1}</div>
                  <span style={{ flex:1, lineHeight:1.3 }}>{sec.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Builder */}
          <div className="sm-builder">

            {branchMode ? (
              /* ── Branch Mode ── */
              <>
                <div className="sm-branch-header">
                  <button className="sm-branch-back" onClick={() => setBranchMode(false)}>
                    <IconBack /> Back to Editor
                  </button>
                  <h2 style={{ margin:0, fontFamily:"Lexend,sans-serif", fontSize:20, color:"#0F172B" }}>Branching Logic</h2>
                </div>
                <div className="sm-branch-card">
                  {allQuestions.filter(q => q.type !== "title").map((q, idx) => {
                    const key = `${q.sIdx}-${q.qIdx}`;
                    return (
                      <div key={idx} className="sm-branch-qrow">
                        <div>
                          <div className="sm-branch-qlabel">{q.label}</div>
                          <div className="sm-branch-qtype">{q.sectionTitle} · {TYPE_LABELS[q.type] || q.type}</div>
                        </div>
                        <select
                          className="sm-branch-select"
                          value={branches[key] || "next"}
                          onChange={e => setBranches(prev => ({ ...prev, [key]: e.target.value }))}
                        >
                          <option value="next">Continue to next question</option>
                          {allQuestions.filter(d => d.type !== "title").map((dest, j) => (
                            <option key={j} value={`${dest.sIdx}-${dest.qIdx}`}>
                              Go to: {dest.label}
                            </option>
                          ))}
                          <option value="end">End of form</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* ── Survey Editor ── */
              <>
                {/* Section header */}
                <div className="sm-sec-card">
                  <div className="sm-sec-card-top">Section {activeSection + 1} of {survey.sections.length}</div>
                  <h2>{currentSection.title}</h2>
                  <p>{currentSection.description}</p>
                </div>

                {/* Questions */}
                {currentSection.questions.map((q, qIdx) => {
                  const isEditing = editingQ?.sIdx === activeSection && editingQ?.qIdx === qIdx;

                  if (q.type === "title") {
                    return (
                      <div key={q.id} className="sm-q-card title-card">
                        <div className="sm-q-header">
                          {isEditing ? (
                            <input
                              value={q.label}
                              onChange={e => updateQuestion(activeSection, qIdx, { label: e.target.value })}
                              className="sm-q-label"
                              style={{ maxWidth:"100%" }}
                            />
                          ) : (
                            <span style={{ fontFamily:"Lexend,sans-serif", fontWeight:600, fontSize:16, color:"#4F46E5" }}>{q.label}</span>
                          )}
                          <div className="sm-q-actions">
                            <button className={`sm-icon-btn${isEditing ? " edit-active" : ""}`} onClick={() => setEditingQ(isEditing ? null : { sIdx: activeSection, qIdx })}>
                              <IconEdit />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className={`sm-q-card${isEditing ? " editing" : ""}`}>

                      {/* Header */}
                      <div className="sm-q-header">
                        <div className="sm-q-label" style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
                          {isEditing ? (
                            <input
                              value={q.label}
                              onChange={e => updateQuestion(activeSection, qIdx, { label: e.target.value })}
                            />
                          ) : (
                            <span>{q.label}{q.required && <span className="sm-q-required"> *</span>}</span>
                          )}
                        </div>
                        <div className="sm-q-actions">
                          {isEditing ? (
                            <select
                              className="sm-type-select"
                              value={q.type}
                              onChange={e => updateQuestion(activeSection, qIdx, { type: e.target.value })}
                            >
                              {Object.entries(TYPE_LABELS).filter(([k]) => k !== "title" && k !== "name").map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="sm-type-badge">{TYPE_LABELS[q.type] || q.type}</span>
                          )}
                          <button className={`sm-icon-btn${isEditing ? " edit-active" : ""}`} title="Edit" onClick={() => setEditingQ(isEditing ? null : { sIdx: activeSection, qIdx })}>
                            <IconEdit />
                          </button>
                          <button className="sm-icon-btn" title="Duplicate" onClick={() => duplicateQuestion(activeSection, qIdx)}>
                            <IconCopy />
                          </button>
                          <button className="sm-icon-btn purple" title="Branching" onClick={() => setBranchMode(true)}>
                            <IconBranch />
                          </button>
                          <button className="sm-icon-btn danger" title="Delete" onClick={() => deleteQuestion(activeSection, qIdx)}>
                            <IconTrash />
                          </button>
                        </div>
                      </div>

                      {/* Required toggle (editing mode) */}
                      {isEditing && (
                        <label className="sm-req-toggle" style={{ marginBottom:10 }}>
                          <input
                            type="checkbox"
                            checked={!!q.required}
                            onChange={e => updateQuestion(activeSection, qIdx, { required: e.target.checked })}
                          />
                          Required
                        </label>
                      )}

                      {/* Question preview / edit */}
                      {q.type === "short" && (
                        <>
                          {isEditing && (
                            <input
                              style={{ width:"100%", maxWidth:340, marginBottom:6, border:"1px solid #CAD5E2", borderRadius:6, padding:"4px 10px", fontFamily:"Arimo,sans-serif", fontSize:12, color:"#62748E" }}
                              placeholder="Placeholder text"
                              value={q.placeholder || ""}
                              onChange={e => updateQuestion(activeSection, qIdx, { placeholder: e.target.value })}
                            />
                          )}
                          <input className="sm-preview-input" placeholder={q.placeholder || "Short answer"} readOnly />
                        </>
                      )}

                      {q.type === "long" && (
                        <>
                          {isEditing && (
                            <input
                              style={{ width:"100%", maxWidth:340, marginBottom:6, border:"1px solid #CAD5E2", borderRadius:6, padding:"4px 10px", fontFamily:"Arimo,sans-serif", fontSize:12, color:"#62748E" }}
                              placeholder="Placeholder text"
                              value={q.placeholder || ""}
                              onChange={e => updateQuestion(activeSection, qIdx, { placeholder: e.target.value })}
                            />
                          )}
                          <textarea className="sm-preview-textarea" placeholder={q.placeholder || "Long answer"} readOnly />
                        </>
                      )}

                      {q.type === "date" && (
                        <input type="date" className="sm-preview-input" style={{ maxWidth:200 }} readOnly />
                      )}

                      {q.type === "rating" && (
                        <div className="sm-stars">
                          {[1,2,3,4,5].map(s => <span key={s} className="sm-star">★</span>)}
                        </div>
                      )}

                      {q.type === "name" && (
                        <div className="sm-name-fields">
                          {(q.fields || []).map((f, fi) => (
                            <div key={fi} className="sm-name-field">
                              <span className="sm-name-label">{f.label}</span>
                              <input className="sm-preview-input" placeholder={f.placeholder} readOnly style={{ maxWidth:"100%" }} />
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "multiple" && (
                        <div className="sm-opt-list">
                          {(q.options || []).map((opt, oIdx) => (
                            <div key={oIdx} className="sm-opt-row">
                              <input type="radio" disabled />
                              {isEditing ? (
                                <>
                                  <input
                                    className="sm-opt-input"
                                    value={opt}
                                    onChange={e => updateOption(activeSection, qIdx, oIdx, e.target.value)}
                                  />
                                  <button className="sm-icon-btn danger" style={{ width:22, height:22 }} onClick={() => deleteOption(activeSection, qIdx, oIdx)}>
                                    <IconTrash />
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontFamily:"Arimo,sans-serif", fontSize:13, color:"#314158" }}>{opt}</span>
                              )}
                            </div>
                          ))}
                          {isEditing && (
                            <button className="sm-opt-add" onClick={() => addOption(activeSection, qIdx)}>
                              + Add option
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}

                {/* Add question */}
                <button className="sm-add-q" onClick={() => addQuestion(activeSection)}>
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

export default SurveyManagement;