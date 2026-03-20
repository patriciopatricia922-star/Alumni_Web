import { useEffect, useState } from "react";
import { supabaseAdmin } from "../lib/supabaseadmin";
import AdminSidebar from "./AdminSidebar";
import { FiTrash2, FiCopy, FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { BiGitBranch } from "react-icons/bi";

// ─── Default survey (used if Supabase has no config yet) ──────────────────────
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
        { id: 5, type: "multiple", label: "Gender", required: true, options: ["Male", "Female", "Prefer not to say"] },
        { id: 6, type: "date", label: "Birthday", required: true },
        { id: 7, type: "multiple", label: "Civil Status", required: true, options: ["Single", "Married", "Widowed"] },
        { id: 8, type: "short", label: "Street Address", required: true, placeholder: "e.g. Blk 123 Lot 456 AlumnAI St." },
        { id: 9, type: "short", label: "City", required: true, placeholder: "e.g. Dasmariñas" },
        { id: 10, type: "short", label: "Province", required: true, placeholder: "e.g. Cavite" },
        { id: 11, type: "short", label: "ZIP Code", required: true, placeholder: "e.g. 4114" },
        { id: 12, type: "multiple", label: "Country", required: true, options: ["Philippines", "United States", "Other"] },
        { id: 13, type: "short", label: "Contact Number", required: true, placeholder: "e.g. 912-345-6789" },
        { id: 14, type: "short", label: "Personal Email Address", required: true, placeholder: "e.g. juandelacruz@gmail.com" },
      ]
    },
    { 
      id: 2, 
      title: "Educational Background", 
      description: "Your academic history", 
      questions: [
        { id: 1, type: "multiple", label: "Degree Program Completed", required: true, options: ["BA COMM", "BS PSYCH", "BS PE", "BSA", "BSMA", "BSBA-MM", "BSBA-FM", "BSBA-HRM", "BSTM", "BSHM", "BS ARCH", "BSCE", "BSCS-ML", "BSCpE", "BSIT-MWA", "Other"] },
        { id: 2, type: "short", label: "Please specify your degree program", required: false, placeholder: "Enter your degree program" },
        { id: 3, type: "long", label: "Reason(s) of taking the course", required: true, placeholder: "Enter your answer" },
        { id: 4, type: "multiple", label: "Year Graduated", required: true, options: ["2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034"] },
        { id: 5, type: "multiple", label: "Distinction Received", required: true, options: ["Summa Cum Laude", "Magna Cum Laude", "Cum Laude", "With Honors", "None"] },
        { id: 6, type: "multiple", label: "Do you have plans on taking a post-graduate studies?", required: true, options: ["Yes", "No"] },
        { id: 7, type: "long", label: "If yes, what course?", required: false, placeholder: "Enter your answer" },
        { id: 8, type: "multiple", label: "Are you currently taking/reviewing for licensure examination?", required: true, options: ["Yes", "No", "Not applicable"] },
        { id: 9, type: "multiple", label: "Do you have any plans on taking licensure examination?", required: false, options: ["Yes", "No", "Already taken", "Not applicable"] },
        { id: 10, type: "long", label: "Reason(s) for not taking or taking licensure examination", required: false, placeholder: "Enter your answer" },
        { id: 11, type: "short", label: "Name of board/licensure examination", required: false, placeholder: "Enter your answer" },
        { id: 12, type: "date", label: "Date taken/date of examination", required: false },
        { id: 13, type: "multiple", label: "Results", required: false, options: ["Passed", "Failed", "Pending", "Not yet taken"] },
      ]
    },
    { 
      id: 3, 
      title: "Certification Achievement", 
      description: "Certifications you have", 
      questions: [
        { id: 1, type: "multiple", label: "Are you a certiport passer?", required: true, options: ["Yes", "No"] },
        { id: 2, type: "multiple", label: "Please specify any certiport certification earned", required: false, options: ["Microsoft Office Specialist (MOS) - Word", "Microsoft Office Specialist (MOS) - Excel", "Microsoft Office Specialist (MOS) - PowerPoint", "Microsoft Office Specialist (MOS) - Outlook", "Microsoft Office Specialist (MOS) - OneNote", "Microsoft Certified Fundamentals (Azure, Microsoft 365, Power Platform, etc.)", "Microsoft Certified Educator (MCE)", "Adobe Certified Professional (ACP) - Photoshop, Illustrator, InDesign, Premiere Pro, etc.", "Adobe Agriscience and Technology Careers", "App Development with Swift - Associate", "Information Technology Specialist (IT Specialist) - Artificial Intelligence", "Information Technology Specialist (IT Specialist) - Cloud Computing", "Information Technology Specialist (IT Specialist) - Computational Thinking", "Information Technology Specialist (IT Specialist) - Cybersecurity", "Information Technology Specialist (IT Specialist) - Data Analytics", "Information Technology Specialist (IT Specialist) - Databases", "Information Technology Specialist (IT Specialist) - Device Configuration & Management", "Information Technology Specialist (IT Specialist) - HTML & CSS", "Information Technology Specialist (IT Specialist) - HTML5 Application Development", "Information Technology Specialist (IT Specialist) - Java", "Information Technology Specialist (IT Specialist) - JavaScript", "Information Technology Specialist (IT Specialist) - Networking", "Information Technology Specialist (IT Specialist) - Networking Security", "IC3 Digital Literacy - Global Standard 6", "IC3 Digital Literacy - Global Standard 5", "IC3 Digital Literacy - Fast Track", "IC3 Digital Literacy - Spark", "IC3 Digital Literacy - PHP Developer Fundamentals", "Autodesk Certified User / Professional - AutoCAD", "Autodesk Certified User / Professional - Revit", "Autodesk Certified User / Professional - Maya", "Autodesk Certified User / Professional - Fusion", "Autodesk Certified User / Professional - TinkercAD", "Cisco Certified Support Technician (CCST) - IT Support", "Cisco Certified Support Technician (CCST) - Networking", "Cisco Certified Support Technician (CCST) - Cybersecurity", "Critical Career Skills (CCS) - Communication for Business", "Critical Career Skills (CCS) - Generative AI Foundations", "Entrepreneurship and Small Business (ESB)", "Intuit Certification - QuickBooks Certified User", "Intuit Certification - Certified Bookkeeping Professional", "Meta Certification - Digital Marketing Associate", "Project Management Institute (PMI) - Project Management Ready Certification", "Unity Certified User - Artist", "Unity Certified User - Programmer", "Unity Certified User - VR Developer", "Pearson Languages Certifications", "Other"] },
        { id: 3, type: "multiple", label: "Have your certifications helped you in your career?", required: false, options: ["Yes", "No"] },
        { id: 4, type: "long", label: "How have your certifications helped you?", required: false, placeholder: "Please describe how your certifications have helped your career" },
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
        { id: 6, type: "multiple", label: "Type of industry", required: false, options: ["Agriculture, Forestry and Fishing", "Mining and Quarrying", "Manufacturing", "Electricity, Gas, Steam and Air Conditioning Supply", "Water Supply, Sewerage and Waste Management", "Construction", "Wholesale and Retail Trade", "Transportation and Storage", "Accommodation and Food Service Activities", "Information and Communication Technology (ICT)", "Financial and Insurance Activities", "Real Estate Activities", "Professional, Scientific and Technical Activities", "Administrative and Support Service Activities", "Public Administration and Defence", "Education", "Human Health and Social Work Activities", "Arts, Entertainment and Recreation", "Other Service Activities", "Other"] },
        { id: 7, type: "multiple", label: "Location of employment", required: false, options: ["Local", "Abroad"] },
        { id: 8, type: "multiple", label: "Monthly income range", required: false, options: ["Below ₱15,000", "₱15,001 – ₱30,000", "₱30,001 – ₱50,000", "Above ₱50,000"] },
        { id: 9, type: "multiple", label: "Reasons for accepting the job", required: false, options: ["Salaries and Benefits", "Career Challenge", "Related to Special Skill", "Related to Course or Program of Study", "Proximity of Residence", "Peer Influence", "Family Influence", "Other"] },
        { id: 10, type: "short", label: "Please specify other reason", required: false, placeholder: "Please specify" },
        { id: 11, type: "multiple", label: "Reasons of being unemployed", required: false, options: ["Pursuing further studies", "Family responsibilities or personal matters", "Health-related reasons", "Lack of job opportunities related to the field of study", "Waiting for job placement results or hiring process", "Currently seeking better employment opportunities", "Started a personal business or freelance work (not yet stable)", "Relocation or migration plans", "Lack of work experience or qualifications required by employers", "Taking a break or resting before seeking employment", "Reviewing for board examination", "Other"] },
        { id: 12, type: "short", label: "Please specify other reason", required: false, placeholder: "Please specify" },
      ]
    },
    { 
      id: 5, 
      title: "Job Experience", 
      description: "Your job hunting experience", 
      questions: [
        { id: 1, type: "multiple", label: "How long did it take you to find your first job after graduation?", required: true, options: ["Less than a month", "1–3 months", "4–6 months", "7–12 months", "More than a year", "Not applicable"] },
        { id: 2, type: "multiple", label: "How long have you been employed in your current job?", required: true, options: ["Less than a month", "1–6 months", "7–11 months", "1 year or less than 2 years", "2 years or less than 3 years", "3 years or less than 4 years", "Other"] },
        { id: 3, type: "short", label: "Please specify duration", required: false, placeholder: "Please specify" },
        { id: 4, type: "multiple", label: "How did you find your first job?", required: true, options: ["Job/Career Fair", "Internship Absorption", "Online", "Recommendation", "Walk-in Applications", "Not applicable", "Other"] },
        { id: 5, type: "short", label: "Please specify other source", required: false, placeholder: "Please specify" },
        { id: 6, type: "multiple", label: "What factors helped you most in getting your first job? (Check all that apply)", required: true, options: ["Academic performance", "Internship / On-the-job Training", "Personal connections", "Skills/Competencies acquired in school", "Certifications", "Not applicable", "Other"] },
        { id: 7, type: "short", label: "Please specify other factors", required: false, placeholder: "Please specify" },
      ]
    },
    { 
      id: 6, 
      title: "Skills & Competencies", 
      description: "Your workplace skills", 
      questions: [
        { id: 1, type: "multiple", label: "What are the competencies learned in college did you find very useful?", required: true, options: ["Communication Skills", "Information & Technology Skills", "Leadership Skills", "Critical & Problem-Solving Skills", "Work Ethics/Professionalism"] },
        { id: 2, type: "rating", label: "Communication Skills", required: true },
        { id: 3, type: "rating", label: "Information & Technology Skills", required: true },
        { id: 4, type: "rating", label: "Leadership Skills", required: true },
        { id: 5, type: "rating", label: "Critical & Problem-Solving Skills", required: true },
        { id: 6, type: "rating", label: "Work Ethics/Professionalism Skills", required: true },
        { id: 7, type: "long", label: "What other skills should NU Dasma develop in students to make them more employable?", required: true, placeholder: "Enter your answer" },
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
        { id: 2, type: "multiple", label: "Would you be willing to participate in:", required: true, options: ["Alumni Seminars/Webinar programs for professional growth", "Career talks for students", "Alumni fundraising events/activities", "Volunteer opportunities", "Not at all", "Other"] },
        { id: 3, type: "short", label: "Please specify other participation", required: false, placeholder: "Please specify" },
      ]
    },
  ]
};

const TYPE_LABELS = {
  short: "Short Answer",
  long: "Long Answer",
  multiple: "Multiple Choice",
  date: "Date",
  rating: "Rating (1–5)",
  name: "Name Fields",
  title: "Section Title",
};

function SurveyManagement() {
  const [survey, setSurvey] = useState(null);
  const [configId, setConfigId] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [branchMode, setBranchMode] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [branches, setBranches] = useState({});

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
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#E1ECF7", fontFamily:"Lexend,sans-serif", color:"#6A7282" }}>
      Loading survey...
    </div>
  );

  const currentSection = survey.sections[activeSection];
  const allQuestions = survey.sections.flatMap((s, si) =>
    s.questions.map((q, qi) => ({ ...q, sIdx: si, qIdx: qi, sectionTitle: s.title }))
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;700&display=swap');

        body {
          background-color: #E1ECF7;
        }

        .survey-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-height: 100vh;
          font-family: "Lexend", sans-serif;
          margin-left: 229px;
        }

        @media (max-width: 900px) {
          .survey-page {
            margin-left: 0;
          }
        }

        /* HEADER */
        .survey-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #E1ECF7;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1rem 2rem 0.5rem;
        }

        .survey-header::before {
          content: "";
          position: absolute;
          top: -5rem;
          left: 0;
          width: 100%;
          height: 5rem;
          background: #E1ECF7;
        }

        .survey-header-left {
          display: flex;
          flex-direction: column;
        }

        .survey-header h1 {
          font-size: 1.75rem;
          color: #324D87;
          margin-bottom: 0.5625rem;
          margin: 0;
        }

        .survey-desc {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        /* ACTION BUTTONS */
        .survey-header-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .publish-btn {
          background: #4FA3F7;
          color: white;
          border: none;
          padding: 0.45rem 0.9rem;
          border-radius: 0.4rem;
          font-size: 0.75rem;
          cursor: pointer;
          margin-top: 1.563rem;
          font-family: "Lexend", sans-serif;
        }

        .publish-btn:hover {
          background: #3d8fd6;
        }

        .publish-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* MAIN LAYOUT */
        .survey-main {
          display: grid;
          grid-template-columns: 18rem 1fr;
          gap: 1.25rem;
          padding: 0 2rem;
        }

        @media (max-width: 860px) {
          .survey-main {
            grid-template-columns: 1fr;
          }
        }

        /* LEFT TOOL SIDEBAR */
        .survey-sections {
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: sticky;
          top: 7.5rem;
          height: max-content;
        }

        .survey-builder {
          margin-bottom: 3rem;
        }

        .add-section-btn {
          background: #e5e7eb;
          border: none;
          padding: 0.55rem;
          border-radius: 0.45rem;
          font-size: 0.8rem;
          color: #6b7280;
          cursor: pointer;
          font-family: "Lexend", sans-serif;
        }

        .add-section-btn:hover {
          background: #d1d5db;
        }

        /* SECTIONS LIST */
        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* SECTION ITEM */
        .section-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: white;
          border-radius: 0.5rem;
          padding: 0.55rem 0.6rem;
          cursor: pointer;
          font-size: 0.78rem;
          color: #374151;
          border: 0.0625rem solid #e5e7eb;
          transition: all 0.2s;
        }

        .section-item:hover {
          background: #f9fafb;
        }

        /* SECTION NUMBER */
        .section-number {
          width: 1.2rem;
          height: 1.2rem;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: #6b7280;
          flex-shrink: 0;
        }

        /* ACTIVE SECTION */
        .section-item.active {
          border: 0.0625rem solid #3b82f6;
          background: #eff6ff;
        }

        .section-item.active .section-number {
          background: #3b82f6;
          color: white;
        }

        /* SECTION HEADER CARD */
        .section-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          border-left: 0.25rem solid #3b82f6;
          border: 0.0625rem solid #e5e7eb;
          margin-bottom: 1rem;
        }

        .section-top {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        .section-card h2 {
          margin: 0.2rem 0;
          font-size: 1.1rem;
          color: #0f172a;
        }

        .section-sub {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        /* QUESTION CARD */
        .question-card {
          background: white;
          border-radius: 0.75rem;
          border-left: 0.25rem solid #3b82f6;
          padding: 1rem;
          margin-bottom: 0.75rem;
          border: 0.0625rem solid #e5e7eb;
          transition: box-shadow 0.2s;
        }

        .question-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          gap: 1rem;
        }

        .required-asterisk {
          color: #ef4444;
          margin-left: 0.1rem;
        }

        .question-actions {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
        }

        .question-type {
          font-size: 0.75rem;
          padding: 0.2rem 0.4rem;
          border-radius: 1rem;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          font-family: "Lexend", sans-serif;
        }

        .question-input {
          width: 100%;
          max-width: 22rem;
          padding: 0.35rem;
          border-radius: 0.4rem;
          border: 0.0625rem solid #d1d5db;
          font-family: "Lexend", sans-serif;
          font-size: 0.875rem;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .radio-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .branch-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }

        .branch-btn {
          margin-top: 0.5rem;
          border: none;
          background: #f3e8ff;
          color: #7c3aed;
          padding: 0.4rem;
          border-radius: 50%;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .branch-btn:hover {
          background: #e9d5ff;
        }

        .rating-group {
          display: flex;
          gap: 8px;
          font-size: 24px;
          color: #d1d5db;
        }

        .star {
          cursor: pointer;
        }

        .star:hover {
          color: #f5b301;
        }

        .inner-section-card {
          margin-top: 0.8rem;
          margin-bottom: 0.6rem;
          border-left: 4px solid #6366f1;
          background: white;
        }

        .inner-section-card h2 {
          font-size: 1rem;
          margin: 0;
          color: #4f46e5;
        }

        .branch-page {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .branch-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .branch-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #0f172a;
        }

        .branch-back {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: none;
          border: none;
          font-size: 0.9rem;
          cursor: pointer;
          font-family: "Lexend", sans-serif;
          color: #374151;
          padding: 0.5rem;
          border-radius: 0.4rem;
        }

        .branch-back:hover {
          background: #f3f4f6;
        }

        .branch-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border: 0.0625rem solid #e5e7eb;
        }

        .branch-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.7rem 0;
          border-bottom: 0.06rem solid #e5e7eb;
          gap: 1rem;
        }

        .branch-row:last-child {
          border-bottom: none;
        }

        .branch-question {
          font-size: 0.85rem;
          max-width: 60%;
          color: #374151;
        }

        .branch-answer {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .branch-select select {
          padding: 0.35rem 0.5rem;
          border-radius: 0.4rem;
          border: 0.06rem solid #d1d5db;
          font-size: 0.8rem;
          font-family: "Lexend", sans-serif;
        }
      `}</style>

      <AdminSidebar />

      <div className="survey-page">
        {/* HEADER */}
        <div className="survey-header">
          <div className="survey-header-left">
            <h1 style={{ fontWeight: 700 }}>Survey Management</h1>
            <p className="survey-desc">
              Edit questions and publish to reflect on the alumni survey
            </p>
          </div>

          <div className="survey-header-actions">
            {status === "saved" && <span style={{ color:"#00A63E", fontSize:"0.75rem" }}>✓ Published</span>}
            {status === "error" && <span style={{ color:"#BF0000", fontSize:"0.75rem" }}>Failed to save</span>}
            {status === "saving" && <span style={{ color:"#6A7282", fontSize:"0.75rem" }}>Saving…</span>}
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

            <div className="sections-list">
              {survey.sections.map((section, index) => (
                <div
                  key={index}
                  className={`section-item ${activeSection === index ? "active" : ""}`}
                  onClick={() => { setActiveSection(index); setBranchMode(false); setEditingQ(null); }}
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
                  {allQuestions.filter(q => q.type !== "title").map((q, idx) => {
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="section-card">
                  <div className="section-top">
                    <span>Section {activeSection + 1} of {survey.sections.length}</span>
                  </div>
                  <h2>{currentSection.title}</h2>
                  <p className="section-sub">{currentSection.description}</p>
                </div>

                {currentSection.questions.map((q, qIdx) => {
                  const isEditing = editingQ?.sIdx === activeSection && editingQ?.qIdx === qIdx;

                  if (q.type === "title") {
                    return (
                      <div key={q.id} className="section-card inner-section-card">
                        {isEditing ? (
                          <input
                            value={q.label}
                            onChange={e => updateQuestion(activeSection, qIdx, { label: e.target.value })}
                            style={{ width:"100%", border:"none", borderBottom:"2px solid #6366f1", outline:"none", fontFamily:"Lexend", fontSize:"1rem", fontWeight:600, background:"transparent", color:"#4f46e5" }}
                          />
                        ) : (
                          <h2>{q.label}</h2>
                        )}
                        <div style={{ marginTop:"0.5rem", display:"flex", gap:"0.4rem" }}>
                          <button 
                            onClick={() => setEditingQ(isEditing ? null : { sIdx: activeSection, qIdx })}
                            style={{ border:"none", background:"#f3f4f6", padding:"0.3rem", borderRadius:"0.3rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => deleteQuestion(activeSection, qIdx)}
                            style={{ border:"none", background:"#fee2e2", padding:"0.3rem", borderRadius:"0.3rem", cursor:"pointer", color:"#ef4444", display:"flex", alignItems:"center", justifyContent:"center" }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className="question-card">
                      <div className="question-header">
                        {isEditing ? (
                          <input
                            value={q.label}
                            onChange={e => updateQuestion(activeSection, qIdx, { label: e.target.value })}
                            style={{ flex:1, border:"none", borderBottom:"2px solid #3b82f6", outline:"none", fontFamily:"Lexend", fontSize:"0.85rem", fontWeight:500, background:"transparent", padding:"0.2rem 0" }}
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
                              {Object.entries(TYPE_LABELS).filter(([k]) => k !== "title" && k !== "name").map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="question-type">{TYPE_LABELS[q.type] || q.type}</span>
                          )}
                          <button onClick={() => setEditingQ(isEditing ? null : { sIdx: activeSection, qIdx })} style={{ border:"none", background:"transparent", cursor:"pointer", padding:"0.2rem", display:"flex", alignItems:"center" }}>
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => duplicateQuestion(activeSection, qIdx)} style={{ border:"none", background:"transparent", cursor:"pointer", padding:"0.2rem", display:"flex", alignItems:"center" }}>
                            <FiCopy size={16} />
                          </button>
                          <button onClick={() => deleteQuestion(activeSection, qIdx)} style={{ border:"none", background:"transparent", cursor:"pointer", color:"#ef4444", padding:"0.2rem", display:"flex", alignItems:"center" }}>
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <label style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem", fontSize:"0.75rem", marginBottom:"0.5rem", color:"#6b7280" }}>
                          <input
                            type="checkbox"
                            checked={!!q.required}
                            onChange={e => updateQuestion(activeSection, qIdx, { required: e.target.checked })}
                            style={{ accentColor:"#3b82f6" }}
                          />
                          Required
                        </label>
                      )}

                      {q.type === "short" && (
                        <>
                          {isEditing && (
                            <input
                              style={{ width:"100%", maxWidth:"22rem", marginBottom:"0.5rem", border:"1px solid #d1d5db", borderRadius:"0.4rem", padding:"0.35rem", fontSize:"0.75rem", fontFamily:"Lexend" }}
                              placeholder="Placeholder text"
                              value={q.placeholder || ""}
                              onChange={e => updateQuestion(activeSection, qIdx, { placeholder: e.target.value })}
                            />
                          )}
                          <input className="question-input" placeholder={q.placeholder || "Short answer"} readOnly />
                        </>
                      )}

                      {q.type === "long" && (
                        <>
                          {isEditing && (
                            <input
                              style={{ width:"100%", maxWidth:"22rem", marginBottom:"0.5rem", border:"1px solid #d1d5db", borderRadius:"0.4rem", padding:"0.35rem", fontSize:"0.75rem", fontFamily:"Lexend" }}
                              placeholder="Placeholder text"
                              value={q.placeholder || ""}
                              onChange={e => updateQuestion(activeSection, qIdx, { placeholder: e.target.value })}
                            />
                          )}
                          <textarea className="question-input" placeholder={q.placeholder || "Long answer"} rows="3" readOnly />
                        </>
                      )}

                      {q.type === "date" && <input type="date" className="question-input" style={{maxWidth:"200px"}} readOnly />}

                      {q.type === "rating" && (
                        <div className="rating-group">
                          {[1, 2, 3, 4, 5].map(star => <span key={star} className="star">★</span>)}
                        </div>
                      )}

                      {q.type === "multiple" && (
                        <div className="radio-group">
                          {(q.options || []).map((opt, oIdx) => (
                            <label key={oIdx}>
                              <input type="radio" disabled />
                              {isEditing ? (
                                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flex:1 }}>
                                  <input
                                    value={opt}
                                    onChange={e => updateOption(activeSection, qIdx, oIdx, e.target.value)}
                                    style={{ flex:1, border:"none", borderBottom:"1px solid #d1d5db", outline:"none", fontSize:"0.8rem", fontFamily:"Lexend", padding:"0.2rem 0" }}
                                  />
                                  <button onClick={() => deleteOption(activeSection, qIdx, oIdx)} style={{ border:"none", background:"transparent", cursor:"pointer", color:"#ef4444", padding:"0", display:"flex", alignItems:"center" }}>
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span>{opt}</span>
                              )}
                            </label>
                          ))}
                          {isEditing && (
                            <button onClick={() => addOption(activeSection, qIdx)} style={{ marginTop:"0.5rem", border:"1px dashed #d1d5db", background:"none", padding:"0.3rem 0.6rem", borderRadius:"0.4rem", fontSize:"0.75rem", color:"#6b7280", cursor:"pointer", fontFamily:"Lexend" }}>
                              + Add option
                            </button>
                          )}
                        </div>
                      )}

                      <div className="branch-container">
                        <button className="branch-btn" onClick={() => setBranchMode(true)}>
                          <BiGitBranch size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button 
                  onClick={() => addQuestion(activeSection)}
                  style={{ width:"100%", height:"36px", background:"#fff", border:"1px dashed #d1d5db", borderRadius:"0.6rem", fontSize:"0.8rem", color:"#6b7280", cursor:"pointer", marginTop:"0.5rem", fontFamily:"Lexend" }}
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

export default SurveyManagement;