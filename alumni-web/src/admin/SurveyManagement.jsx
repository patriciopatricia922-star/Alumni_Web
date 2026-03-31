import { useEffect, useState } from "react";
import { supabaseAdmin } from "../lib/supabaseadmin";
import { supabase } from "../lib/supabase";
import SurveyMgmtView from "./views/SurveyMgmtView";
import { logAction } from "../lib/auditLogger";

const DEFAULT_SURVEY = {
  title: "Alumni Survey",
  sections: [
    // ... your existing DEFAULT_SURVEY sections here (keep as is)
    // This is your existing survey structure - too long to repeat but keep yours
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
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: "", onConfirm: null, itemName: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const showConfirm = (message, onConfirm, itemName = "") => {
    setConfirmDialog({ show: true, message, onConfirm, itemName });
  };

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    setConfirmDialog({ show: false, message: "", onConfirm: null, itemName: "" });
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ show: false, message: "", onConfirm: null, itemName: "" });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error("Error loading survey:", error);
        setSurvey(DEFAULT_SURVEY);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePublish = async () => {
    if (!survey) return;
    setSaving(true);
    setStatus("saving");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (configId) {
        await supabaseAdmin
          .from("survey_config")
          .update({ 
            config: survey, 
            updated_at: new Date().toISOString(),
            updated_by: user?.id 
          })
          .eq("id", configId);
      } else {
        const { data } = await supabaseAdmin
          .from("survey_config")
          .insert({ 
            config: survey,
            updated_by: user?.id
          })
          .select("id")
          .single();
        if (data) setConfigId(data.id);
      }
      setStatus("saved");
      
      // ✅ AUDIT LOG - PLACE THIS AFTER SUCCESSFUL PUBLISH
      await logAction({
        action: 'Update',
        module: 'Survey Management',
        description: `Published survey with ${survey.sections.length} sections`,
        status: 'Success'
      });
      
      showToast("Survey published successfully!", "success");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error("Publish error:", error);
      setStatus("error");
      showToast("Failed to publish survey. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (sIdx, qIdx, patch) => {
    setSurvey((prev) => {
      const updatedSections = prev.sections.map((sec, si) => {
        if (si !== sIdx) return sec;
        const updatedQuestions = sec.questions.map((q, qi) => {
          if (qi !== qIdx) return q;
          return { ...q, ...patch };
        });
        return { ...sec, questions: updatedQuestions };
      });
      return { ...prev, sections: updatedSections };
    });
    
    // ✅ AUDIT LOG - AFTER SUCCESSFUL QUESTION UPDATE
    const sectionTitle = survey.sections[sIdx]?.title || 'Unknown';
    const questionLabel = survey.sections[sIdx]?.questions[qIdx]?.label || 'Unknown';
    logAction({
      action: 'Update',
      module: 'Survey Management',
      description: `Updated question "${questionLabel}" in section "${sectionTitle}"`,
      status: 'Success'
    });
    
    showToast("Question updated successfully!", "success");
    setEditingQuestion(null);
  };

  const deleteQuestion = (sIdx, qIdx) => {
    const sectionTitle = survey.sections[sIdx]?.title || 'Unknown';
    const questionLabel = survey.sections[sIdx]?.questions[qIdx]?.label || 'Unknown';
    
    showConfirm(
      `Are you sure you want to delete "${questionLabel}"?`,
      async () => {
        setSurvey((prev) => ({
          ...prev,
          sections: prev.sections.map((sec, si) => 
            si !== sIdx ? sec : { ...sec, questions: sec.questions.filter((_, qi) => qi !== qIdx) }
          ),
        }));
        
        // ✅ AUDIT LOG - AFTER SUCCESSFUL QUESTION DELETE
        await logAction({
          action: 'Delete',
          module: 'Survey Management',
          description: `Deleted question "${questionLabel}" from section "${sectionTitle}"`,
          status: 'Success'
        });
        
        showToast("Question has been deleted successfully!", "success");
      },
      questionLabel
    );
  };

  const duplicateQuestion = (sIdx, qIdx) => {
    const sectionTitle = survey.sections[sIdx]?.title || 'Unknown';
    const originalLabel = survey.sections[sIdx]?.questions[qIdx]?.label || 'Unknown';
    
    setSurvey((prev) => {
      const sec = prev.sections[sIdx];
      const originalQ = sec.questions[qIdx];
      const duplicatedQ = { 
        ...originalQ, 
        id: Date.now(),
        label: `${originalQ.label} (Copy)`
      };
      const updatedQuestions = [...sec.questions];
      updatedQuestions.splice(qIdx + 1, 0, duplicatedQ);
      const updatedSections = prev.sections.map((s, si) => 
        si !== sIdx ? s : { ...s, questions: updatedQuestions }
      );
      return { ...prev, sections: updatedSections };
    });
    
    // ✅ AUDIT LOG - AFTER SUCCESSFUL QUESTION DUPLICATION
    logAction({
      action: 'Create',
      module: 'Survey Management',
      description: `Duplicated question "${originalLabel}" in section "${sectionTitle}"`,
      status: 'Success'
    });
    
    showToast("Question duplicated successfully!", "success");
  };

  const deleteSection = (sIdx) => {
    const sectionTitle = survey.sections[sIdx]?.title || 'Unknown';
    const questionCount = survey.sections[sIdx]?.questions?.length || 0;
    
    showConfirm(
      `Are you sure you want to delete "${sectionTitle}"? ${questionCount > 0 ? `This section contains ${questionCount} question(s) that will also be deleted.` : ""}`,
      async () => {
        setSurvey((prev) => {
          const updatedSections = prev.sections.filter((_, si) => si !== sIdx);
          if (activeSection >= updatedSections.length) {
            setActiveSection(Math.max(0, updatedSections.length - 1));
          }
          return { ...prev, sections: updatedSections };
        });
        
        // ✅ AUDIT LOG - AFTER SUCCESSFUL SECTION DELETE
        await logAction({
          action: 'Delete',
          module: 'Survey Management',
          description: `Deleted section "${sectionTitle}" with ${questionCount} questions`,
          status: 'Success'
        });
        
        showToast(`Section "${sectionTitle}" has been deleted successfully!`, "success");
      },
      sectionTitle
    );
  };

  const addQuestion = (sIdx) => {
    const sectionTitle = survey.sections[sIdx]?.title || 'Unknown';
    
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
    
    // ✅ AUDIT LOG - AFTER SUCCESSFUL QUESTION ADD
    logAction({
      action: 'Create',
      module: 'Survey Management',
      description: `Added new question to section "${sectionTitle}"`,
      status: 'Success'
    });
    
    showToast("New question added successfully!", "success");
  };

  const addSection = () => {
    const newSectionTitle = `Section ${survey.sections.length + 1}`;
    
    setSurvey((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: Date.now(), title: newSectionTitle, description: "New section", questions: [] },
      ],
    }));
    setActiveSection(survey.sections.length);
    
    // ✅ AUDIT LOG - AFTER SUCCESSFUL SECTION ADD
    logAction({
      action: 'Create',
      module: 'Survey Management',
      description: `Added new section "${newSectionTitle}"`,
      status: 'Success'
    });
    
    showToast("New section added successfully!", "success");
  };

  const startEditing = (question, sIdx, qIdx) => {
    setEditingQuestion({ ...question, sIdx, qIdx });
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
  };

  if (loading) {
    return (
      <div className="survey-loading-container">
        <div className="survey-loading-spinner">
          <div className="spinner"></div>
          <p>Loading survey data...</p>
        </div>
      </div>
    );
  }

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
      addQuestion={addQuestion}
      addSection={addSection}
      deleteSection={deleteSection}
      editingQuestion={editingQuestion}
      startEditing={startEditing}
      cancelEditing={cancelEditing}
      toast={toast}
      confirmDialog={confirmDialog}
      handleConfirm={handleConfirm}
      handleCancelConfirm={handleCancelConfirm}
    />
  );
}