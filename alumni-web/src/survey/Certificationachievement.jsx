import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../lib/surveyConfig';
import CertificationAchievementView from '../Views/CertificationAchievementView';
import useSurveyBackGuard from '../hooks/useSurveyBackGuard'; // ← NEW
import SkeletonLoader from '../components/SkeletonLoader'; // ← NEW


const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 3;

const DEFAULT_CERTIFICATIONS = [
  'Microsoft Office Specialist (MOS) - Word', 'Microsoft Office Specialist (MOS) - Excel',
  'Microsoft Office Specialist (MOS) - PowerPoint', 'Microsoft Office Specialist (MOS) - Outlook',
  'Microsoft Office Specialist (MOS) - OneNote', 'Microsoft Certified Fundamentals (Azure, Microsoft 365, Power Platform, etc.)',
  'Microsoft Certified Educator (MCE)', 'Adobe Certified Professional (ACP) - Photoshop, Illustrator, InDesign, Premiere Pro, etc.',
  'Adobe Agriscience and Technology Careers', 'App Development with Swift - Associate',
  'Information Technology Specialist (IT Specialist) - Artificial Intelligence',
  'Information Technology Specialist (IT Specialist) - Cloud Computing',
  'Information Technology Specialist (IT Specialist) - Computational Thinking',
  'Information Technology Specialist (IT Specialist) - Cybersecurity',
  'Information Technology Specialist (IT Specialist) - Data Analytics',
  'Information Technology Specialist (IT Specialist) - Databases',
  'Information Technology Specialist (IT Specialist) - Device Configuration & Management',
  'Information Technology Specialist (IT Specialist) - HTML & CSS',
  'Information Technology Specialist (IT Specialist) - HTML5 Application Development',
  'Information Technology Specialist (IT Specialist) - Java',
  'Information Technology Specialist (IT Specialist) - JavaScript',
  'Information Technology Specialist (IT Specialist) - Networking',
  'Information Technology Specialist (IT Specialist) - Networking Security',
  'IC3 Digital Literacy - Global Standard 6', 'IC3 Digital Literacy - Global Standard 5',
  'IC3 Digital Literacy - Fast Track', 'IC3 Digital Literacy - Spark',
  'IC3 Digital Literacy - PHP Developer Fundamentals',
  'Autodesk Certified User / Professional - AutoCAD', 'Autodesk Certified User / Professional - Revit',
  'Autodesk Certified User / Professional - Maya', 'Autodesk Certified User / Professional - Fusion',
  'Autodesk Certified User / Professional - TinkercAD',
  'Cisco Certified Support Technician (CCST) - IT Support',
  'Cisco Certified Support Technician (CCST) - Networking',
  'Cisco Certified Support Technician (CCST) - Cybersecurity',
  'Critical Career Skills (CCS) - Communication for Business',
  'Critical Career Skills (CCS) - Generative AI Foundations',
  'Entrepreneurship and Small Business (ESB)',
  'Intuit Certification - QuickBooks Certified User',
  'Intuit Certification - Certified Bookkeeping Professional',
  'Meta Certification - Digital Marketing Associate',
  'Project Management Initiative (PMI) - Project Management Ready Certification',
  'Unity Certified User - Artist', 'Unity Certified User - Programmer',
  'Unity Certified User - VR Developer', 'Pearson Languages Certifications', 'Other',
];

const DEFAULT_LABELS = {
  certiport_passer: 'Are you a certiport passer?',
  certifications:   'Please specify any certiport certification earned',
  helped_career:    'Have your certifications helped you in your career?',
  how_helped:       'How have your certifications helped you?',
};

const INDEX_TO_FIELD = [
  'certiport_passer', 'certifications', 'helped_career', 'how_helped',
];

const computeFormPct = (form) => {
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const SECTION_CAP  = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const required = ['certiport_passer'];
  if (form.certiport_passer === 'Yes') {
    required.push('certifications', 'helped_career');
    if (form.helped_career === 'Yes') required.push('how_helped');
  }
  const filled = required.filter(k => {
    const v = form[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && String(v).trim() !== '';
  }).length;
  const contribution = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), parseFloat(SECTION_CAP.toFixed(2)));
};

const CertificationAchievement = () => {
  const navigate = useNavigate();

  const [questionLabels,       setQuestionLabels]       = useState({});
  const [questionPlaceholders, setQuestionPlaceholders] = useState({});
  const [certifications,       setCertifications]       = useState(DEFAULT_CERTIFICATIONS);
  const [yesNoOptions,         setYesNoOptions]         = useState(['Yes', 'No']);
  const [loadingLabels,        setLoadingLabels]        = useState(true);
  const [configVersion,        setConfigVersion]        = useState(0);

  const [form, setForm] = useState({
    certiport_passer: '',
    certifications:   [],
    helped_career:    '',
    how_helped:       '',
  });

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);
  const bellRef = useRef(null);

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  // FIXED: Logic now maps config to specific state keys for checkboxes/radio options
  const applyConfig = (config) => {
    if (!config?.sections) return;
    const certSection = config.sections.find(s => s.title === 'Certification Achievement');
    if (!certSection?.questions) return;

    const labels       = {};
    const placeholders = {};

    certSection.questions.forEach((q, idx) => {
      const fieldKey = INDEX_TO_FIELD[idx];
      if (!fieldKey) return;

      labels[fieldKey] = q.label;
      if (q.placeholder) placeholders[fieldKey] = q.placeholder;

      // Update specific selection lists
      if (fieldKey === 'certifications'   && q.options) setCertifications(q.options);
      if (fieldKey === 'certiport_passer' && q.options) setYesNoOptions(q.options);
    });

    setQuestionLabels(prev => ({...prev, ...labels}));
    setQuestionPlaceholders(prev => ({...prev, ...placeholders}));
  };

  useEffect(() => {
    let cancelled = false;

    const loadDynamicContent = async () => {
      setLoadingLabels(true);
      try {
        const config = await loadSurveyConfig(true);
        if (!cancelled && config) {
          applyConfig(config);
        }
      } finally {
        if (!cancelled) setLoadingLabels(false);
      }
    };

    loadDynamicContent();

    const channel = subscribeToSurveyConfigChanges(async () => {
      // console.log("[Realtime] Certifications Section updating...");
      const freshConfig = await loadSurveyConfig(true);
      if (!cancelled && freshConfig) {
        applyConfig(freshConfig);
        setConfigVersion(v => v + 1);
      }
    });

    return () => {
      cancelled = true;
      if (channel) channel.unsubscribe();
    };
  }, []);

  // Load progress (UNTOUCHED)
  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('certification_achievement');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
  }, []);

  // Notifications (UNTOUCHED)
  useEffect(() => {
    const fetchNotifs = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error || !data) return;
      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped = data.map(n => ({
        id: n.id, title: n.title, body: n.content,
        time: n.published_at, read: readIds.includes(n.id),
      }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem('read_notifs', JSON.stringify(notifs.map(n => n.id)));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { readIds.push(id); localStorage.setItem('read_notifs', JSON.stringify(readIds)); }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const groupByDate = (list) => {
    const today     = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const groups    = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0, 0, 0, 0);
      if      (d >= today)     groups['Today'].push(n);
      else if (d >= yesterday) groups['Yesterday'].push(n);
      else if (d >= weekAgo)   groups['This Week'].push(n);
      else                     groups['Earlier'].push(n);
    });
    return groups;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60)    + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const setCertiportPasser = (val) =>
    setForm(prev => ({ ...prev, certiport_passer: val, certifications: [], helped_career: '', how_helped: '' }));

  const setHelpedCareer = (val) =>
    setForm(prev => ({ ...prev, helped_career: val, how_helped: '' }));

  const validate = () => {
    const e = new Set();
    if (!form.certiport_passer) e.add('certiport_passer');
    if (form.certiport_passer === 'Yes') {
      if (form.certifications.length === 0)                e.add('certifications');
      if (!form.helped_career)                             e.add('helped_career');
      if (form.helped_career === 'Yes' && !form.how_helped.trim()) e.add('how_helped');
    }
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('certification_achievement', form);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleNext = () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    saveSectionProgress('certification_achievement', form)
      .then(() => navigate('/survey/employment-information'));
  };

  const getLabel       = (fieldId) => questionLabels[fieldId]       || DEFAULT_LABELS[fieldId] || fieldId;
  const getPlaceholder = (fieldId) => questionPlaceholders[fieldId] || '';

  const { handleBack, BackGuardModal } = useSurveyBackGuard(
  navigate,
  '/survey/educational-background',   // ← same "same route as flag/back button" caveat as before — see note below
  handleSave,
  'Certification Achievement',
);

  const formPct = computeFormPct(form);

  if (loadingLabels) {
    return <SkeletonLoader fieldCount={4} />;
  }

  return (
    <>
    <CertificationAchievementView
      form={form}
      set={set}
      setCertiportPasser={setCertiportPasser}
      setHelpedCareer={setHelpedCareer}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      certifications={certifications}
      yesNoOptions={yesNoOptions}
      getLabel={getLabel}
      getPlaceholder={getPlaceholder}
      handleSave={handleSave}
      handleNext={handleNext}
      bellRef={bellRef}
      notifs={notifs}
      unreadCount={unreadCount}
      showDropdown={showDropdown}
      setShowDropdown={setShowDropdown}
      notifTab={notifTab}
      setNotifTab={setNotifTab}
      markAllRead={markAllRead}
      markOneRead={markOneRead}
      groupByDate={groupByDate}
      formatTime={formatTime}
      navigate={navigate}
    />
    <BackGuardModal />
    </>
  );
};

export default CertificationAchievement;