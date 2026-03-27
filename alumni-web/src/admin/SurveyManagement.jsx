import { useEffect, useState } from "react";
import { supabaseAdmin } from "../lib/supabaseadmin";
import SurveyMgmtView from "./views/Surveymgmtview";

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

export default function SurveyManagement() {
  const [survey, setSurvey] = useState(null);
  const [configId, setConfigId] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [branchMode, setBranchMode] = useState(false);
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
    setSurvey((prev) => {
      const s = prev.sections.map((sec, si) =>
        si !== sIdx ? sec : { ...sec, questions: sec.questions.map((q, qi) => (qi !== qIdx ? q : { ...q, ...patch })) }
      );
      return { ...prev, sections: s };
    });
  };

  const deleteQuestion = (sIdx, qIdx) => {
    setSurvey((prev) => ({
      ...prev,
      sections: prev.sections.map((sec, si) => (si !== sIdx ? sec : { ...sec, questions: sec.questions.filter((_, qi) => qi !== qIdx) })),
    }));
  };

  const duplicateQuestion = (sIdx, qIdx) => {
    setSurvey((prev) => {
      const sec = prev.sections[sIdx];
      const q = { ...sec.questions[qIdx], id: Date.now() };
      const qs = [...sec.questions];
      qs.splice(qIdx + 1, 0, q);
      return { ...prev, sections: prev.sections.map((s, si) => (si !== sIdx ? s : { ...s, questions: qs })) };
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
    setSurvey((prev) => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si !== sIdx
          ? s
          : {
              ...s,
              questions: [
                ...s.questions,
                { id: Date.now(), type: "short", label: "New Question", required: false, placeholder: "Enter your answer" },
              ],
            }
      ),
    }));
  };

  return (
    <SurveyMgmtView
      survey={survey}
      setSurvey={setSurvey}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      branchMode={branchMode}
      setBranchMode={setBranchMode}
      status={status}
      saving={saving}
      branches={branches}
      setBranches={setBranches}
      handlePublish={handlePublish}
      updateQuestion={updateQuestion}
      deleteQuestion={deleteQuestion}
      duplicateQuestion={duplicateQuestion}
      addOption={addOption}
      updateOption={updateOption}
      deleteOption={deleteOption}
      addQuestion={addQuestion}
    />
  );
}