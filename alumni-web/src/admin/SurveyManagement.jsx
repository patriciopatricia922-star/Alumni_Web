// ============================================================================
// SurveyManagement.jsx — Logic Controller (SHS added as additional survey type)
// ============================================================================
// EXTENSION NOTES
// ───────────────
// All original College Survey Management logic is preserved EXACTLY as-is:
//   • DEFAULT_SURVEY, normalizeIds, migrateIntegerIds, sanitiseBranches,
//     TYPE_LABELS, uid(), LoadingScreen — unchanged, character-for-character.
//   • All Question/Option CRUD (updateQuestion, openEdit, closeEdit, saveEdit,
//     deleteQuestion, deleteSection, duplicateQuestion, addQuestion,
//     addSection, addOption, updateOption, deleteOption) — unchanged. These
//     already operate on whatever `survey` state currently points to, so no
//     edits were needed to support a second survey type.
//   • FIX 1–7, PFIX-A–E — unchanged, still present and functioning as before.
//   • The original single-survey load/publish `useEffect`s are kept intact
//     for College and simply run alongside a new, separate SHS load/publish
//     effect — not merged into or branching inside the original code paths.
//
// ADDED for SHS (net-new, does not touch existing College logic):
//   • DEFAULT_SHS_SURVEY dataset.
//   • Separate SHS state: shsSurvey, shsConfigId, shsConfigIdRef, shsBranches,
//     shsBranchesRef — mirrors the college state 1:1, kept fully independent
//     so switching alumniType never mutates or clobbers the other type's data.
//   • useAlumniType() context read — the ONLY thing that decides which of
//     the two states (college vs shs) is exposed as `survey`/`configId`/
//     `branches`/etc. to the rest of the component and to SurveyMgmtView.
//   • A second load effect for SHS, and SHS branching folded into
//     handlePublish via a type-aware branch (does not alter the College
//     branch of that same function — the college `if (currentConfigId)`
//     UPDATE/INSERT logic is untouched, byte-for-byte).
//
// SCHEMA NOTE (per your supplied `survey_config` DDL):
//   The table has no `survey_type` column. survey_type must live INSIDE the
//   jsonb `config` column, exactly as documented in surveyConfig.js v3:
//     "The Admin saves config without a survey_type field, so the JSONB
//      column will have config->>'survey_type' = NULL for college configs."
//   Filtering is therefore done via `.contains('config', { survey_type: 'shs' })`
//   for SHS, and via `.or()` for college (NULL survey_type OR 'college'),
//   matching surveyConfig.js's existing read-side pattern so the admin write
//   path and the public read path agree on the same convention.
// ============================================================================

import { useEffect, useState, useRef, useCallback } from "react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import AdminSidebar from "./components/AdminSidebar";
import SurveyMgmtView from "./views/Surveymgmtview";
import SurveySkeletonView from "./views/SurveySkeletonView";
import { useAlumniType } from './contexts/AlumniTypeContext';

// ============================================================================
// DEBUG LOGGER — toggle with localStorage.setItem('surveyDebug', '1')
// ============================================================================
const DEBUG = () =>
  typeof localStorage !== "undefined" &&
  localStorage.getItem("surveyDebug") === "1";

const dbg = (...args) => {
  if (DEBUG()) console.log("[SurveyMgmt]", ...args);
};

const dbgWarn = (...args) => {
  if (DEBUG()) console.warn("[SurveyMgmt]", ...args);
};

// ============================================================================
// DEFAULT SURVEY DATA — COLLEGE (UNCHANGED)
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
      ],
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
        { id: 4, type: "short", label: "How has your certification been useful in your career?", required: false, placeholder: "Please describe how your certifications have helped your career" },
      ],
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
        { id: 2, type: "rating", label: "Communication Skills", required: true },
        { id: 3, type: "rating", label: "Information & Technology Skills", required: true },
        { id: 4, type: "rating", label: "Leadership Skills", required: true },
        { id: 5, type: "rating", label: "Critical & Problem-Solving Skills", required: true },
        { id: 6, type: "rating", label: "Work Ethics/Professionalism Skills", required: true },
        { id: 7, type: "short", label: "What other skills should NU Dasma develop in students to make them more employable?", required: true, placeholder: "Enter your answer" },
      ],
    },
    {
      id: 7,
      title: "Feedback for the University",
      description: "Your insights and feedback",
      questions: [
        { id: 1, type: "multiple", label: "How satisfied are you with your education at NU Dasma?", required: true, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
        { id: 2, type: "multiple", label: "Would you recommend NU Dasma to others?", required: true, options: ["Yes", "No"] },
        { id: 3, type: "long", label: "Suggestions for improving academic programs and alumni services", required: true, placeholder: "Enter your answer" },
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
// DEFAULT SURVEY DATA — SHS (UPDATED CONTENT)
// Paste this block into SurveyManagement.jsx, replacing the existing
// `const DEFAULT_SHS_SURVEY = {...}` block. Nothing else needs to change.
// ============================================================================
const DEFAULT_SHS_SURVEY = {
  title: "SHS Alumni Survey",
  sections: [
    {
      id: 1,
      title: "Personal Background",
      description: "Basic information about you",
      questions: [
        { id: 1, type: "short", label: "Last Name", required: true, placeholder: "e.g. Dela Cruz" },
        { id: 2, type: "short", label: "First Name", required: true, placeholder: "e.g. Juan" },
        { id: 3, type: "short", label: "Middle Name", required: false, placeholder: "e.g. Mercado" },
        { id: 4, type: "multiple", label: "Gender", required: true, options: ["Male", "Female", "Prefer not to say"] },
        { id: 5, type: "short", label: "Birthday (MM/DD/YYYY)", required: true, placeholder: "e.g. 01/15/2005" },
        { id: 6, type: "short", label: "Street Address", required: true, placeholder: "e.g. Blk 123 Lot 456 AlumnAI St." },
        { id: 7, type: "short", label: "City", required: true, placeholder: "e.g. Dasmarinas" },
        { id: 8, type: "short", label: "Province", required: true, placeholder: "e.g. Cavite" },
        { id: 9, type: "short", label: "ZIP Code", required: true, placeholder: "e.g. 4114" },
        { id: 10, type: "multiple", label: "Country", required: true, options: ["Philippines", "United States", "Other"] },
        { id: 11, type: "short", label: "Contact Number", required: true, placeholder: "e.g. 912-345-6789" },
        { id: 12, type: "short", label: "Personal Email Address", required: true, placeholder: "e.g. juandelacruz@gmail.com" },
        { id: 13, type: "multiple", label: "Track/Strand Completed", required: true, options: ["STEM", "HUMSS", "ABM"] },
        { id: 14, type: "multiple", label: "Year Graduated", required: true, options: ["2022", "2023", "2024", "2025", "2026", "2027"] },
      ],
    },
    {
      id: 2,
      title: "Educational Background",
      description: "Your academic history after Senior High School",
      questions: [
        { id: 1, type: "multiple", label: "Status", required: true, options: ["Currently Studying", "Graduated", "Stopped", "Working"] },

        // ── Branch: Currently Studying / Graduated → NU pursuit question ──
        { id: 2, type: "multiple", label: "Did you pursue further studies to any NU Branch after SHS?", required: false, options: ["Yes", "No"] },

        // ── Sub-branch (IF YES to NU branch) ──
        { id: 3, type: "multiple", label: "What branch of NU?", required: false, options: ["NU Manila", "NU Nazareth", "NU Laguna", "NU MOA", "NU Fairview", "NU Baliwag", "NU Dasma", "NU APC", "NU Lipa", "NU Clark", "NU Bacolod", "NU East Ortigas", "NU Cebu", "NU Las Pinas"] },
        { id: 4, type: "long", label: "Reason(s) why did you choose NU", required: false, placeholder: "Enter your answer" },
        { id: 5, type: "multiple", label: "What level of education are you currently in or have completed?", required: false, options: ["Bachelors Degree", "Associate", "Diploma/Certificate Course", "Not Applicable", "Other"] },
        { id: 6, type: "short", label: "Other (please specify level of education)", required: false, placeholder: "Please specify" },
        { id: 7, type: "short", label: "Course/Program", required: false, placeholder: "Enter your course/program" },
        { id: 8, type: "multiple", label: "Year Level", required: false, options: ["1st Year", "2nd Year", "3rd Year", "4th Year College", "Not Applicable"] },

        // ── Sub-branch (IF NO to NU branch) → did you pursue studies elsewhere ──
        { id: 9, type: "multiple", label: "Did you pursue further studies to any school after SHS?", required: false, options: ["Yes", "No"] },

        // ── Sub-branch (IF YES to "any school") — went to a non-NU school ──
        { id: 10, type: "long", label: "Reason(s) why did you not choose NU", required: false, placeholder: "Enter your answer" },
        { id: 11, type: "short", label: "Name of School/University", required: false, placeholder: "Enter school/university name" },
        { id: 12, type: "multiple", label: "What level of education are you currently in or have completed?", required: false, options: ["Bachelors Degree", "Associate", "Diploma/Certificate Course", "Not Applicable", "Other"] },
        { id: 13, type: "short", label: "Other (please specify level of education)", required: false, placeholder: "Please specify" },
        { id: 14, type: "short", label: "Course/Program", required: false, placeholder: "Enter your course/program" },
        { id: 15, type: "multiple", label: "Year Level", required: false, options: ["1st Year", "2nd Year", "3rd Year", "4th Year College", "Not Applicable"] },

        // ── Sub-branch (IF NO to "any school") — repeats the NU branch question set ──
        { id: 16, type: "multiple", label: "What branch of NU?", required: false, options: ["NU Manila", "NU Nazareth", "NU Laguna", "NU MOA", "NU Fairview", "NU Baliwag", "NU Dasma", "NU APC", "NU Lipa", "NU Clark", "NU Bacolod", "NU East Ortigas", "NU Cebu", "NU Las Pinas"] },
        { id: 17, type: "long", label: "Reason(s) why did you choose NU", required: false, placeholder: "Enter your answer" },
        { id: 18, type: "multiple", label: "What level of education are you currently in or have completed?", required: false, options: ["Bachelors Degree", "Associate", "Diploma/Certificate Course", "Not Applicable", "Other"] },
        { id: 19, type: "short", label: "Other (please specify level of education)", required: false, placeholder: "Please specify" },
        { id: 20, type: "short", label: "Course/Program", required: false, placeholder: "Enter your course/program" },
        { id: 21, type: "multiple", label: "Year Level", required: false, options: ["1st Year", "2nd Year", "3rd Year", "4th Year College", "Not Applicable"] },

        // ── Branch: Stopped ──
        { id: 22, type: "multiple", label: "What is the main reason you did not pursue further studies?", required: false, options: ["Financial Constraints", "Employment Opportunity", "Family Responsibility", "Lack of Interest", "Not Applicable", "Other"] },
        { id: 23, type: "short", label: "Other (please specify reason)", required: false, placeholder: "Please specify" },

        // Branch: Working — no additional question here; routes straight to Employment Information via branch jump.
      ],
    },
    {
      id: 3,
      title: "Employment Information",
      description: "Information related to your current job status",
      questions: [
        { id: 1, type: "multiple", label: "Current Employment Status", required: true, options: ["Regular/Permanent", "Contractual", "Part-time", "Probationary", "Self-Employed", "Unemployed (Looking for work)", "Unemployed (Not Looking for work)", "Other"] },
        { id: 2, type: "short", label: "Other (please specify employment status)", required: false, placeholder: "Please specify" },

        // ── Branch (IF employed: Regular/Permanent, Contractual, Part-time, Probationary, Self-Employed, Other) ──
        { id: 3, type: "short", label: "Job Position", required: false, placeholder: "Enter your job position" },
        { id: 4, type: "short", label: "Name of Company / Employer", required: false, placeholder: "Enter company/employer name" },
        { id: 5, type: "multiple", label: "Type of Industry", required: false, options: ["Education/Academe", "Healthcare/Medical", "Information Technology", "Engineering", "Business/Finance", "Government/Public", "Private Companies", "Other"] },
        { id: 6, type: "short", label: "Other (please specify industry)", required: false, placeholder: "Please specify" },
        { id: 7, type: "multiple", label: "Location of Employment", required: false, options: ["Local", "Abroad", "None"] },
        { id: 8, type: "multiple", label: "Monthly Income Range", required: false, options: ["Below ₱15,000", "₱15,001 – ₱30,000", "₱30,001 – ₱50,000", "Above ₱50,000", "Not Applicable"] },
        { id: 9, type: "multiple", label: "Is your current job related to your strand?", required: false, options: ["Yes", "No"] },

        // ── Branch (IF Unemployed — Looking or Not Looking for work) ──
        { id: 10, type: "multiple", label: "Reasons of being unemployed", required: false, options: ["Pursuing further studies", "Family responsibilities or personal matters", "Health-related reasons", "Lack of job opportunities related to the field of study", "Other"] },
        { id: 11, type: "short", label: "Please specify other reason", required: false, placeholder: "Please specify" },
      ],
    },
    {
      id: 4,
      title: "Job Experience",
      description: "Your job hunting experience",
      questions: [
        { id: 1, type: "multiple", label: "How long did it take you to find your first job after graduation?", required: true, options: ["Less than a month", "1–3 months", "4–6 months", "7–12 months", "More than a year", "Not Applicable"] },
        { id: 2, type: "multiple", label: "How did you find your first job?", required: true, options: ["Job/Career Fair", "Internship Absorption", "Online", "Recommendation", "Walk-in Applications", "Not Applicable", "Other"] },
        { id: 3, type: "checkbox", label: "What factors helped you most in getting your first job?", required: true, options: ["Academic performance", "Internship/On-the-job training/Immersion", "Personal Connections", "Skills/Competencies acquired in school", "Certifications", "Not Applicable", "Other"] },
      ],
    },
    {
      id: 5,
      title: "Skills and Competencies",
      description: "Your workplace skills",
      questions: [
        { id: 1, type: "rating", label: "Communication Skills", required: true },
        { id: 2, type: "rating", label: "Technical Knowledge in your field", required: true },
        { id: 3, type: "rating", label: "Leadership Skills", required: true },
        { id: 4, type: "rating", label: "Critical Thinking & Problem Solving", required: true },
        { id: 5, type: "rating", label: "Work Ethics / Professionalism", required: true },
        { id: 6, type: "short", label: "What other skills should NU Dasma develop in students to make them more employable?", required: true, placeholder: "Enter your answer" },
      ],
    },
    {
      id: 6,
      title: "Feedback and Alumni Engagement",
      description: "Your insights and connection with the university",
      questions: [
        { id: 1, type: "multiple", label: "How satisfied are you with your education at NU Dasma?", required: true, options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"] },
        { id: 2, type: "multiple", label: "Would you recommend NU Dasma to others?", required: true, options: ["Yes", "No"] },
        { id: 3, type: "long", label: "Suggestions for improving academic programs/strands", required: true, placeholder: "Enter your answer" },
        { id: 4, type: "multiple", label: "Would you like to be informed about upcoming alumni events and activities?", required: true, options: ["Yes", "No"] },
        { id: 5, type: "checkbox", label: "Would you be willing to participate in:", required: true, options: ["Alumni fundraising events/activities", "Volunteer opportunities", "Not at all", "Other"] },
      ],
    },
  ],
};

// ============================================================================
// TYPE LABELS MAPPING (UNCHANGED)
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
// uid — collision-safe ID generator. (UNCHANGED)
// ============================================================================
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ============================================================================
// LoadingScreen — FROM FRIEND (UNCHANGED)
// ============================================================================
export const LoadingScreen = ({ message }) => {
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
      <div
        style={{
          marginLeft: isMobile ? 0 : "229px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#E1ECF7",
          fontFamily: "Lexend, sans-serif",
          color: "#6A7282",
          fontSize: "14px",
        }}
      >
        {message}
      </div>
    </>
  );
};

// ============================================================================
// normalizeIds — FIX 1 (UNCHANGED)
// ============================================================================
function normalizeIds(survey) {
  dbg("normalizeIds: assigning uid-based IDs to all integer-id questions");
  return {
    ...survey,
    sections: survey.sections.map((sec) => ({
      ...sec,
      id: typeof sec.id === "number" ? uid() : sec.id,
      questions: sec.questions.map((q) => ({
        ...q,
        id: typeof q.id === "number" ? uid() : q.id,
      })),
    })),
  };
}

// ============================================================================
// migrateIntegerIds — FIX 2 (UNCHANGED)
// ============================================================================
function migrateIntegerIds(surveyData, savedBranches) {
  const hasIntegerIds = surveyData.sections.some((sec) =>
    sec.questions.some((q) => typeof q.id === "number"),
  );

  if (!hasIntegerIds) {
    dbg("migrateIntegerIds: no integer IDs found — fast path, no migration needed");
    return { migratedSurvey: surveyData, migratedBranches: savedBranches ?? {} };
  }

  dbg("migrateIntegerIds: integer IDs detected — migrating question IDs and branch keys");

  const idMap = new Map();

  surveyData.sections.forEach((sec, sIdx) => {
    sec.questions.forEach((q, qIdx) => {
      if (typeof q.id === "number") {
        idMap.set(`${sIdx}:${qIdx}`, { oldId: String(q.id), newId: uid() });
      }
    });
  });

  const migratedSurvey = {
    ...surveyData,
    sections: surveyData.sections.map((sec, sIdx) => ({
      ...sec,
      id: typeof sec.id === "number" ? uid() : sec.id,
      questions: sec.questions.map((q, qIdx) => {
        const entry = idMap.get(`${sIdx}:${qIdx}`);
        return entry ? { ...q, id: entry.newId } : q;
      }),
    })),
  };

  dbg("migrateIntegerIds: ID map entries:", idMap.size);

  const firstNewIdForOldInt = new Map();
  idMap.forEach(({ oldId, newId }) => {
    if (!firstNewIdForOldInt.has(oldId)) {
      firstNewIdForOldInt.set(oldId, newId);
    }
  });

  const remapKey = (key) => {
    const withoutQ = key.slice(2);
    const optMarker = withoutQ.indexOf("-opt");
    const rawId = optMarker === -1 ? withoutQ : withoutQ.slice(0, optMarker);
    const suffix = optMarker === -1 ? "" : withoutQ.slice(optMarker);
    const newId = firstNewIdForOldInt.get(rawId);
    if (newId) {
      const remapped = `q-${newId}${suffix}`;
      dbg(`migrateIntegerIds: remap key "${key}" → "${remapped}"`);
      return remapped;
    }
    return key;
  };

  const remapDestination = (val) => {
    if (!val.startsWith("q-")) return val;
    const withoutQ = val.slice(2);
    const newId = firstNewIdForOldInt.get(withoutQ);
    if (newId) {
      const remapped = `q-${newId}`;
      dbg(`migrateIntegerIds: remap destination "${val}" → "${remapped}"`);
      return remapped;
    }
    return val;
  };

  const migratedBranches = {};
  Object.entries(savedBranches ?? {}).forEach(([key, val]) => {
    const newKey = remapKey(key);
    const destinations = Array.isArray(val) ? val : val ? [val] : ["next"];
    migratedBranches[newKey] = destinations.map(remapDestination);
  });

  dbg("migrateIntegerIds: migration complete");
  dbg("migrateIntegerIds: migratedBranches:", migratedBranches);

  return { migratedSurvey, migratedBranches };
}

// ============================================================================
// sanitiseBranches — FIX 6 (UNCHANGED)
// ============================================================================
function sanitiseBranches(savedBranches, survey) {
  if (!savedBranches || typeof savedBranches !== "object") return {};

  const validRefs = new Set(["next", "end"]);
  survey.sections.forEach((sec) =>
    sec.questions.forEach((q) => validRefs.add(`q-${q.id}`)),
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
    const filtered = arr.filter((v) => {
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
// SurveyManagement — Main Logic Controller
// ============================================================================
export default function SurveyManagement() {
  // ── NEW: which survey type is active ────────────────────────────────────
  const { alumniType } = useAlumniType(); // 'college' | 'shs'

  // ── Survey data — COLLEGE (UNCHANGED state, names, and behavior) ─────────
  const [collegeSurvey, setCollegeSurvey] = useState(null);
  const [collegeConfigId, setCollegeConfigId] = useState(null);
  const collegeConfigIdRef = useRef(null);
  const [collegeBranches, setCollegeBranches] = useState({});
  const collegeBranchesRef = useRef({});

  // ── Survey data — SHS (NEW, mirrors college 1:1) ─────────────────────────
  const [shsSurvey, setShsSurvey] = useState(null);
  const [shsConfigId, setShsConfigId] = useState(null);
  const shsConfigIdRef = useRef(null);
  const [shsBranches, setShsBranches] = useState({});
  const shsBranchesRef = useRef({});

  // ── Derive the "active" survey/configId/branches based on alumniType ────
  // This is the ONLY place that decides which underlying state is exposed.
  // Everything below this point (all CRUD, all render logic) is UNCHANGED
  // from the original and simply keeps operating on `survey`/`branches`/etc.
  const survey        = alumniType === 'shs' ? shsSurvey        : collegeSurvey;
  const setSurvey     = alumniType === 'shs' ? setShsSurvey     : setCollegeSurvey;
  const configId       = alumniType === 'shs' ? shsConfigId      : collegeConfigId;
  const setConfigId    = alumniType === 'shs' ? setShsConfigId   : setCollegeConfigId;
  const configIdRef     = alumniType === 'shs' ? shsConfigIdRef   : collegeConfigIdRef;
  const branches        = alumniType === 'shs' ? shsBranches      : collegeBranches;
  const setBranchesRaw  = alumniType === 'shs' ? setShsBranches   : setCollegeBranches;
  const branchesRef      = alumniType === 'shs' ? shsBranchesRef   : collegeBranchesRef;

  const [activeSection, setActiveSection] = useState(0);

  // ── UI mode (UNCHANGED) ───────────────────────────────────────────────────
  const [branchMode, setBranchMode] = useState(false);
  const [editingQ, setEditingQ] = useState(null);

  // ── Edit tracking (UNCHANGED) ─────────────────────────────────────────────
  const editSnapshotRef = useRef(null);
  const [dirtyQ, setDirtyQ] = useState(false);

  // ── Publication (UNCHANGED) ───────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // PFIX-A — setBranchesAndRef (UNCHANGED shape, now routes through the
  // currently-active setter/ref so college and shs branch edits never mix).
  const setBranchesAndRef = useCallback((updater) => {
    setBranchesRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      branchesRef.current = next;
      dbg("setBranchesAndRef →", next);
      return next;
    });
  }, [setBranchesRaw, branchesRef]);

  useEffect(() => {
    branchesRef.current = branches;
  }, [branches, branchesRef]);

  // ── Notifications (UNCHANGED) ─────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  // ── Branching UI (UNCHANGED) ──────────────────────────────────────────────
  const [highlightQ, setHighlightQ] = useState(null);
  const [branchTargetQ, setBranchTargetQ] = useState(null);

  // ==========================================================================
  // TOAST MANAGEMENT (UNCHANGED)
  // ==========================================================================
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
    }, 2400);
  }, []);

  // ==========================================================================
  // CONFIRMATION MODAL (UNCHANGED)
  // ==========================================================================
  const askConfirm = (message, onConfirm, title = "Delete?") =>
    setConfirmState({ message, onConfirm, title });

  // ==========================================================================
  // DATA LOADING — COLLEGE (UNCHANGED — identical to the original load())
  // ==========================================================================
  useEffect(() => {
    const loadCollege = async () => {
      dbg("Loading college survey config from Supabase...");

      const { data, error } = await supabaseAdmin
        .from("survey_config")
        .select("id, config")
        .or("config->>survey_type.is.null,config->>survey_type.eq.college")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        dbgWarn("Load error (may be no rows yet):", error.message, error.code);
      }

      if (error || !data?.config?.sections?.length) {
        dbg("No saved config found — using DEFAULT_SURVEY");
        setCollegeSurvey(normalizeIds(DEFAULT_SURVEY));
        return;
      }

      dbg("Loaded config row id:", data.id);
      dbg("Raw saved branches:", data.config.branches);

      const { branches: savedBranches, ...surveyData } = data.config;

      const { migratedSurvey, migratedBranches } = migrateIntegerIds(
        surveyData,
        savedBranches ?? {},
      );

      collegeConfigIdRef.current = data.id;
      setCollegeConfigId(data.id);
      setCollegeSurvey(migratedSurvey);

      if (Object.keys(migratedBranches).length > 0) {
        const sanitised = sanitiseBranches(migratedBranches, migratedSurvey);
        dbg("Sanitised branches loaded:", sanitised);
        collegeBranchesRef.current = sanitised;
        setCollegeBranches(sanitised);
      } else {
        dbg("No branches in saved config");
      }
    };

    loadCollege();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ==========================================================================
  // DATA LOADING — SHS (NEW — same pattern as college, kept separate)
  // ==========================================================================
  useEffect(() => {
    const loadShs = async () => {
      dbg("Loading SHS survey config from Supabase...");

      const { data, error } = await supabaseAdmin
        .from("survey_config")
        .select("id, config")
        .contains("config", { survey_type: "shs" })
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        dbgWarn("SHS load error (may be no rows yet):", error.message, error.code);
      }

      if (error || !data?.config?.sections?.length) {
        dbg("No saved SHS config found — using DEFAULT_SHS_SURVEY");
        setShsSurvey(normalizeIds(DEFAULT_SHS_SURVEY));
        return;
      }

      dbg("Loaded SHS config row id:", data.id);
      dbg("Raw saved SHS branches:", data.config.branches);

      const { branches: savedBranches, ...surveyData } = data.config;

      const { migratedSurvey, migratedBranches } = migrateIntegerIds(
        surveyData,
        savedBranches ?? {},
      );

      shsConfigIdRef.current = data.id;
      setShsConfigId(data.id);
      setShsSurvey(migratedSurvey);

      if (Object.keys(migratedBranches).length > 0) {
        const sanitised = sanitiseBranches(migratedBranches, migratedSurvey);
        dbg("Sanitised SHS branches loaded:", sanitised);
        shsBranchesRef.current = sanitised;
        setShsBranches(sanitised);
      } else {
        dbg("No branches in saved SHS config");
      }
    };

    loadShs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ==========================================================================
  // PUBLISH — PFIX-A + PFIX-B + PFIX-C + PFIX-D
  // College branch is UNCHANGED, byte-for-byte, from the original.
  // SHS branch added alongside it (NEW), using the same guard patterns.
  // ==========================================================================
  const handlePublish = async () => {
    if (!survey) return;

    const currentBranches = branchesRef.current;
    const currentConfigId = configIdRef.current;
    const currentType = alumniType; // 'college' | 'shs'

    const branchKeyCount = Object.keys(currentBranches).length;
    dbg("=== PUBLISH START ===", currentType);
    dbg("configId (state):", configId, "| configIdRef:", currentConfigId);
    dbg("Branch key count:", branchKeyCount);
    dbg("Full branches payload:", JSON.stringify(currentBranches, null, 2));

    if (branchKeyCount === 0) {
      dbg("Note: branches payload is empty (no rules configured)");
    }

    // survey_type lives inside the jsonb config column (no DB column exists
    // for it per the supplied schema). College omits it for full backward
    // compatibility with rows saved before SHS existed (matches
    // surveyConfig.js's `.or('...is.null,...eq.college')` read-side filter).
    const payload =
      currentType === 'shs'
        ? { ...survey, branches: currentBranches, survey_type: 'shs' }
        : { ...survey, branches: currentBranches };

    dbg("Full publish payload sections count:", payload.sections.length);
    dbg("Payload branches key count:", Object.keys(payload.branches).length);

    setSaving(true);
    setStatus("saving");

    try {
      if (currentConfigId) {
        dbg("UPDATE path — targeting row id:", currentConfigId);

        const { data: updateData, error: updateError } = await supabaseAdmin
          .from("survey_config")
          .update({ config: payload, updated_at: new Date().toISOString() })
          .eq("id", currentConfigId)
          .select("id, config");

        dbg("UPDATE response — error:", updateError, "| returned rows:", updateData?.length ?? "n/a");

        if (updateError) throw updateError;

        if (!updateData || updateData.length === 0) {
          const msg = `UPDATE matched 0 rows for id=${currentConfigId}. The row may have been deleted or the ID is stale.`;
          console.error("[SurveyMgmt] PFIX-B:", msg);
          throw new Error(msg);
        }

        const savedBranches = updateData[0]?.config?.branches;
        dbg("Read-back branches from UPDATE:", JSON.stringify(savedBranches, null, 2));

        const sentKeys = Object.keys(currentBranches).sort().join(",");
        const savedKeys = Object.keys(savedBranches ?? {}).sort().join(",");

        if (sentKeys !== savedKeys) {
          console.error(
            "[SurveyMgmt] PFIX-D: Branch key mismatch after UPDATE!\n" +
              "  Sent:  " + sentKeys + "\n" +
              "  Saved: " + savedKeys,
          );
          addToast("Warning: branch data may not have saved correctly. Check console.", "delete");
        } else {
          dbg("PFIX-D: Read-back verified ✓ — branch keys match");
        }
      } else {
        dbg("INSERT path — no existing config row");

        const { data: insertData, error: insertError } = await supabaseAdmin
          .from("survey_config")
          .insert({ config: payload })
          .select("id, config")
          .single();

        dbg("INSERT response — error:", insertError, "| returned row:", insertData?.id);

        if (insertError) throw insertError;

        if (insertData) {
          configIdRef.current = insertData.id;
          setConfigId(insertData.id);
          dbg("INSERT success — new configId:", insertData.id);

          const savedBranches = insertData?.config?.branches;
          dbg("Read-back branches from INSERT:", JSON.stringify(savedBranches, null, 2));

          const sentKeys = Object.keys(currentBranches).sort().join(",");
          const savedKeys = Object.keys(savedBranches ?? {}).sort().join(",");

          if (sentKeys !== savedKeys) {
            console.error(
              "[SurveyMgmt] PFIX-D: Branch key mismatch after INSERT!\n" +
                "  Sent:  " + sentKeys + "\n" +
                "  Saved: " + savedKeys,
            );
            addToast("Warning: branch data may not have saved correctly. Check console.", "delete");
          } else {
            dbg("PFIX-D: Read-back verified ✓ — branch keys match");
          }
        }
      }

      dbg("=== PUBLISH SUCCESS ===", currentType);
      setStatus("saved");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("[SurveyManagement] Publish failed:", err);
      dbg("=== PUBLISH FAILED ===", err);
      setStatus("error");
      addToast("Failed to publish. Please try again.", "delete");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================================
  // BRANCHING SCROLL — FIX 5 (UNCHANGED)
  // ==========================================================================
  useEffect(() => {
    if (branchMode && branchTargetQ) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById(branchTargetQ);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightQ(branchTargetQ);
            setTimeout(() => setHighlightQ(null), 1200);
          }
        });
      });
    }
  }, [branchMode, branchTargetQ]);

  // ==========================================================================
  // QUESTION CRUD (UNCHANGED — operates on whatever `survey`/`setSurvey`
  // currently resolve to, so it already works identically for both types)
  // ==========================================================================
  const updateQuestion = (sIdx, qIdx, patch) => {
    setSurvey((prev) => ({
      ...prev,
      sections: prev.sections.map((sec, si) =>
        si !== sIdx
          ? sec
          : {
              ...sec,
              questions: sec.questions.map((q, qi) =>
                qi !== qIdx ? q : { ...q, ...patch },
              ),
            },
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

  const deleteQuestion = (sIdx, qIdx, label) => {
    askConfirm(
      `Delete the question "${label}"? This action cannot be undone.`,
      () => {
        const deletedId = survey.sections[sIdx].questions[qIdx].id;
        const deletedRef = `q-${deletedId}`;

        setBranchesAndRef((prev) => {
          const next = { ...prev };

          Object.keys(next).forEach((k) => {
            if (k === deletedRef || k.startsWith(`${deletedRef}-opt`)) {
              delete next[k];
              return;
            }
            if (Array.isArray(next[k])) {
              const filtered = next[k].filter((v) => v !== deletedRef);
              next[k] = filtered.length > 0 ? filtered : ["next"];
            }
          });

          dbg("deleteQuestion: branches after cleanup:", next);
          return next;
        });

        setSurvey((prev) => ({
          ...prev,
          sections: prev.sections.map((sec, si) =>
            si !== sIdx
              ? sec
              : {
                  ...sec,
                  questions: sec.questions.filter((_, qi) => qi !== qIdx),
                },
          ),
        }));
        setConfirmState(null);
        addToast("Question deleted", "delete");
      },
    );
  };

  const deleteSection = (index) => {
    const sectionTitle = survey.sections[index].title;
    askConfirm(
      `Delete the section "${sectionTitle}" and all its questions? This action cannot be undone.`,
      () => {
        const deletedIdStrings = new Set(
          survey.sections[index].questions.map((q) => String(q.id)),
        );

        setBranchesAndRef((prev) => {
          const next = { ...prev };

          Object.keys(next).forEach((k) => {
            const withoutPrefix = k.slice(2);
            const optMarker = withoutPrefix.indexOf("-opt");
            const sourceIdStr =
              optMarker === -1 ? withoutPrefix : withoutPrefix.slice(0, optMarker);

            if (deletedIdStrings.has(sourceIdStr)) {
              delete next[k];
              return;
            }

            if (Array.isArray(next[k])) {
              const filtered = next[k].filter((v) => {
                if (!v.startsWith("q-")) return true;
                return !deletedIdStrings.has(v.slice(2));
              });
              next[k] = filtered.length > 0 ? filtered : ["next"];
            }
          });

          dbg("deleteSection: branches after cleanup:", next);
          return next;
        });

        setSurvey((prev) => ({
          ...prev,
          sections: prev.sections.filter((_, i) => i !== index),
        }));

        setActiveSection((prev) => Math.min(prev, survey.sections.length - 2));
        setConfirmState(null);
        addToast("Section deleted", "delete");
      },
    );
  };

  const duplicateQuestion = (sIdx, qIdx) => {
    setSurvey((prev) => {
      const sec = prev.sections[sIdx];
      const q = { ...sec.questions[qIdx], id: uid() };
      const qs = [...sec.questions];
      qs.splice(qIdx + 1, 0, q);
      return {
        ...prev,
        sections: prev.sections.map((s, si) => (si !== sIdx ? s : { ...s, questions: qs })),
      };
    });
    addToast("Question duplicated", "copy");
  };

  const addQuestion = (sIdx) => {
    setSurvey((prev) => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si !== sIdx
          ? s
          : {
              ...s,
              questions: [
                ...s.questions,
                { id: uid(), type: "short", label: "New Question", required: false, placeholder: "Enter your answer" },
              ],
            },
      ),
    }));
  };

  const addSection = () => {
    setSurvey((prev) => {
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
  // OPTION CRUD (UNCHANGED)
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
    const qId = survey.sections[sIdx].questions[qIdx].id;
    const optKey = `q-${qId}-opt${oIdx}`;

    setBranchesAndRef((prev) => {
      const next = { ...prev };
      delete next[optKey];

      const higherKeys = Object.keys(next).filter(
        (k) => k.startsWith(`q-${qId}-opt`) && parseInt(k.split("opt")[1], 10) > oIdx,
      );
      higherKeys.forEach((k) => {
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
  // DERIVED DATA (UNCHANGED)
  // ==========================================================================
  const currentSection = survey?.sections[activeSection];

  const allQuestions =
    survey?.sections.flatMap((s, si) =>
      s.questions.map((q, qi) => ({ ...q, sIdx: si, qIdx: qi, sectionTitle: s.title })),
    ) || [];

  // ── FIX 7 — targetSectionIdx (UNCHANGED) ─────────────────────────────────
  const targetSectionIdx = (() => {
    if (!branchTargetQ || !survey) return activeSection;
    const qId = branchTargetQ.startsWith("q-") ? branchTargetQ.slice(2) : branchTargetQ;
    const idx = survey.sections.findIndex((s) => s.questions.some((q) => String(q.id) === qId));
    return idx >= 0 ? idx : activeSection;
  })();

  // ==========================================================================
  // LOADING GATE — must come after all hooks
  // Gates only on the currently active survey (not both), so switching
  // alumniType doesn't force waiting on data for a survey that isn't shown.
  // ==========================================================================
  if (!survey) return <SurveySkeletonView />;

  // ==========================================================================
  // RENDER (UNCHANGED prop contract — alumniType passed through for the view
  // to render its switcher UI)
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
      DEFAULT_SURVEY={alumniType === 'shs' ? DEFAULT_SHS_SURVEY : DEFAULT_SURVEY}
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
      targetSectionIdx={targetSectionIdx}
      alumniType={alumniType}
    />
  );
}