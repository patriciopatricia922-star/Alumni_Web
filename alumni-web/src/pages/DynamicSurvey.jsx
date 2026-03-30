import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { saveSectionProgress, loadSectionData, loadSurveyProgress } from '../lib/surveyProgress';
import DynamicSurveyView from '../views/DynamicSurveyView';

const DynamicSurvey = () => {
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(parseInt(sectionId) || 1);
  const [formData, setFormData] = useState({});
  const [userData, setUserData] = useState({});
  const [errors, setErrors] = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const cardRef = useRef(null);

  // Load user data for autofill
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await supabase
        .from('users')
        .select('first_name, middle_name, last_name, email, student_number')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setUserData({
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          student_number: data.student_number || '',
        });
      }
    };
    fetchUserData();
  }, []);

  // Load existing progress
  useEffect(() => {
    const loadProgress = async () => {
      const progress = await loadSurveyProgress();
      setProgressData(progress);
    };
    loadProgress();
  }, []);

  // Load survey config and populate form data
  useEffect(() => {
    const loadSurvey = async () => {
      setLoading(true);
      try {
        // Get the latest survey config
        const { data: configData, error: configError } = await supabase
          .from('survey_config')
          .select('config')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (configError || !configData?.config?.sections) {
          console.error('No survey config found');
          setLoading(false);
          return;
        }

        const surveySections = configData.config.sections;
        
        // Build sections with proper keys
        const builtSections = surveySections.map((section, idx) => {
          let dbKey = '';
          const title = section.title;
          if (title === 'Personal Background') dbKey = 'personal_background';
          else if (title === 'Educational Background') dbKey = 'educational_background';
          else if (title === 'Certification Achievement') dbKey = 'certification_achievement';
          else if (title === 'Employment Information') dbKey = 'employment_information';
          else if (title === 'Job Experience') dbKey = 'job_experience';
          else if (title === 'Skills & Competencies') dbKey = 'skills_competencies';
          else if (title === 'Feedback for the University') dbKey = 'feedback_university';
          else if (title === 'Alumni Engagement') dbKey = 'alumni_engagement';
          else dbKey = title.toLowerCase().replace(/\s+/g, '_');

          return {
            ...section,
            id: idx,
            dbKey,
            index: idx + 1,
          };
        });

        setSections(builtSections);

        // Load saved data for current section
        const currentSectionData = builtSections[currentSection - 1];
        if (currentSectionData) {
          const savedData = await loadSectionData(currentSectionData.dbKey);
          
          // For Personal Background, merge with user data
          if (currentSectionData.dbKey === 'personal_background') {
            setFormData({
              last_name: savedData?.last_name || userData.last_name || '',
              first_name: savedData?.first_name || userData.first_name || '',
              middle_name: savedData?.middle_name || userData.middle_name || '',
              email: savedData?.email || userData.email || '',
              student_number: savedData?.student_number || userData.student_number || '',
              gender: savedData?.gender || '',
              birthday: savedData?.birthday || '',
              civil_status: savedData?.civil_status || '',
              street_address: savedData?.street_address || '',
              city: savedData?.city || '',
              province: savedData?.province || '',
              zip_code: savedData?.zip_code || '',
              country: savedData?.country || '',
              contact_number: savedData?.contact_number || '',
              phone_prefix: savedData?.phone_prefix || '+63',
            });
          } else if (savedData) {
            setFormData(savedData);
          } else {
            setFormData({});
          }
        }
      } catch (err) {
        console.error('Error loading survey:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSurvey();
  }, [currentSection, userData]);

  const getCurrentDbKey = () => sections[currentSection - 1]?.dbKey;

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (errors.has(fieldName)) {
      const newErrors = new Set(errors);
      newErrors.delete(fieldName);
      setErrors(newErrors);
    }
  };

  const handleRadioChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (errors.has(fieldName)) {
      const newErrors = new Set(errors);
      newErrors.delete(fieldName);
      setErrors(newErrors);
    }
  };

  const handleCheckboxChange = (fieldName, value, checked) => {
    const currentValues = formData[fieldName] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    setFormData(prev => ({ ...prev, [fieldName]: newValues }));
    if (errors.has(fieldName)) {
      const newErrors = new Set(errors);
      newErrors.delete(fieldName);
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = new Set();
    const currentSectionData = sections[currentSection - 1];
    const dbKey = currentSectionData?.dbKey;
    
    // Define required fields for each section based on your original survey
    const requiredFieldsMap = {
      personal_background: [
        'last_name', 'first_name', 'gender', 'birthday', 'civil_status',
        'street_address', 'city', 'province', 'zip_code', 'country', 'contact_number', 'email'
      ],
      educational_background: [
        'degree_program', 'reason_for_course', 'year_graduated', 'distinction', 'post_grad_plans', 'licensure_reviewing'
      ],
      certification_achievement: ['certiport_passer'],
      employment_information: ['job_related_to_degree', 'employment_status'],
      job_experience: ['time_to_find_job', 'employment_duration', 'first_job_source', 'first_job_factors'],
      skills_competencies: ['useful_competencies', 'skills_to_develop'],
      feedback_university: ['satisfaction', 'recommend', 'suggestions'],
      alumni_engagement: ['informed_about_events', 'participate_in'],
    };
    
    const requiredFields = requiredFieldsMap[dbKey] || [];
    
    requiredFields.forEach(field => {
      const value = formData[field];
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) {
        newErrors.add(field);
      }
    });
    
    return newErrors;
  };

  const handleSave = async () => {
    const dbKey = getCurrentDbKey();
    if (dbKey) {
      await saveSectionProgress(dbKey, formData);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    }
  };

  const handleNext = async () => {
    const validationErrors = validate();
    if (validationErrors.size > 0) {
      setErrors(validationErrors);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    
    const dbKey = getCurrentDbKey();
    if (dbKey) {
      await saveSectionProgress(dbKey, formData);
      
      if (currentSection < sections.length) {
        navigate(`/survey/${currentSection + 1}`);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('survey_progress')
            .upsert({
              user_id: user.id,
              completed: true,
              percentage: 100,
              last_updated: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        }
        navigate('/survey/complete');
      }
    }
  };

  const handlePrev = () => {
    if (currentSection > 1) {
      navigate(`/survey/${currentSection - 1}`);
    }
  };

  const computeFormPct = () => {
    const currentSectionData = sections[currentSection - 1];
    const dbKey = currentSectionData?.dbKey;
    
    if (progressData && dbKey && progressData[dbKey]) {
      return (currentSection / sections.length) * 100;
    }
    
    // Calculate based on filled required fields
    const requiredFieldsMap = {
      personal_background: [
        'last_name', 'first_name', 'gender', 'birthday', 'civil_status',
        'street_address', 'city', 'province', 'zip_code', 'country', 'contact_number', 'email'
      ],
      educational_background: [
        'degree_program', 'reason_for_course', 'year_graduated', 'distinction', 'post_grad_plans', 'licensure_reviewing'
      ],
      certification_achievement: ['certiport_passer'],
      employment_information: ['job_related_to_degree', 'employment_status'],
      job_experience: ['time_to_find_job', 'employment_duration', 'first_job_source', 'first_job_factors'],
      skills_competencies: ['useful_competencies', 'skills_to_develop'],
      feedback_university: ['satisfaction', 'recommend', 'suggestions'],
      alumni_engagement: ['informed_about_events', 'participate_in'],
    };
    
    const requiredFields = requiredFieldsMap[dbKey] || [];
    const totalRequired = requiredFields.length;
    if (totalRequired === 0) return (currentSection / sections.length) * 100;
    
    const filled = requiredFields.filter(field => {
      const value = formData[field];
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;
    
    const sectionContribution = (filled / totalRequired) * (1 / sections.length) * 100;
    const basePct = ((currentSection - 1) / sections.length) * 100;
    return Math.min(basePct + sectionContribution, (currentSection / sections.length) * 100);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002263' }}>
        <div style={{ color: '#fff' }}>Loading survey...</div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002263', flexDirection: 'column', gap: '20px' }}>
        <div style={{ color: '#fff', fontSize: '18px' }}>No survey configuration found.</div>
        <div style={{ color: 'rgba(255,255,255,0.6)' }}>Please ask the admin to publish the survey from Survey Management.</div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection - 1];
  
  if (!currentSectionData) {
    return <div style={{ background: '#002263', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      Survey section not found
    </div>;
  }

  return (
    <DynamicSurveyView
      section={currentSectionData}
      formData={formData}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={computeFormPct()}
      currentSection={currentSection}
      totalSections={sections.length}
      handleInputChange={handleInputChange}
      handleRadioChange={handleRadioChange}
      handleCheckboxChange={handleCheckboxChange}
      handleSave={handleSave}
      handleNext={handleNext}
      handlePrev={handlePrev}
      navigate={navigate}
    />
  );
};

export default DynamicSurvey;