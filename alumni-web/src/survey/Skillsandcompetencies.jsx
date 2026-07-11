import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { loadSurveyConfig, subscribeToSurveyConfigChanges } from '../lib/surveyConfig';
import SkillsAndCompetenciesView from '../Views/SkillsAndCompetenciesView';
import useSurveyBackGuard from '../hooks/useSurveyBackGuard'; // ← NEW
import SkeletonLoader from '../components/SkeletonLoader'; // ← NEW

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 6;
const SECTION_KEY     = 'skills_and_competencies';

const DEFAULT_COMPETENCIES_OPTIONS = [
  'Communication Skills',
  'Information & Technology Skills',
  'Leadership Skills',
  'Critical & Problem-Solving Skills',
  'Work Ethics/Professionalism',
];

const DEFAULT_SKILL_RATINGS_KEYS = [
  'Communication Skills',
  'Information & Technology Skills',
  'Leadership Skills',
  'Critical & Problem-Solving Skills',
  'Work Ethics/Professionalism Skills',
];

const DEFAULT_LABELS = {
  useful_competencies: 'What are the competencies learned in college did you find very useful?',
  skills_to_develop:   'What other skills should NU Dasma develop in students to make them more employable?',
};

const INDEX_TO_FIELD = [
  'useful_competencies',
  'rating_Communication Skills',
  'rating_Information & Technology Skills',
  'rating_Leadership Skills',
  'rating_Critical & Problem-Solving Skills',
  'rating_Work Ethics/Professionalism Skills',
  'skills_to_develop',
];

const buildDefaultRatings = (keys) => {
  const obj = {};
  keys.forEach(k => { obj[k] = 0; });
  return obj;
};

const computeFormPct = (form, skillRatingsKeys) => {
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const SECTION_CAP  = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const total  = 1 + skillRatingsKeys.length + 1;
  let   filled = 0;
  if (form.useful_competencies.length > 0) filled++;
  skillRatingsKeys.forEach(s => { if ((form.skill_ratings[s] || 0) > 0) filled++; });
  if (form.skills_to_develop?.trim()) filled++;
  const contribution = (filled / total) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), parseFloat(SECTION_CAP.toFixed(2)));
};

const SkillsAndCompetencies = () => {
  const navigate = useNavigate();

  const [questionLabels,       setQuestionLabels]       = useState({});
  const [questionPlaceholders, setQuestionPlaceholders] = useState({});
  const [competenciesOptions,  setCompetenciesOptions]  = useState(DEFAULT_COMPETENCIES_OPTIONS);
  const [skillRatingsKeys,     setSkillRatingsKeys]     = useState(DEFAULT_SKILL_RATINGS_KEYS);
  const [loadingLabels,        setLoadingLabels]        = useState(true);
  const [configVersion,        setConfigVersion]        = useState(0);

  // Used to prevent realtime updates from clobbering restored ratings
  const savedProgressRef = useRef(null);

  const [form, setForm] = useState({
    useful_competencies: [],
    skill_ratings: buildDefaultRatings(DEFAULT_SKILL_RATINGS_KEYS),
    skills_to_develop: '',
  });

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);
  const bellRef = useRef(null);

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  const applyConfig = (config) => {
    if (!config?.sections) return;
    const skillsSection = config.sections.find(s => s.title === 'Skills & Competencies');
    if (!skillsSection?.questions) return;

    const labels        = {};
    const placeholders  = {};
    const newRatingKeys = [];

    skillsSection.questions.forEach((q, idx) => {
      if (idx === 0) {
        labels['useful_competencies'] = q.label;
        if (q.options) setCompetenciesOptions(q.options);
      } else if (idx >= 1 && idx <= 5) {
        newRatingKeys.push(q.label);
      } else if (idx === 6) {
        labels['skills_to_develop'] = q.label;
        if (q.placeholder) placeholders['skills_to_develop'] = q.placeholder;
      }
    });

    if (newRatingKeys.length > 0) {
      setSkillRatingsKeys(newRatingKeys);
      setForm(prev => {
        const freshRatings = buildDefaultRatings(newRatingKeys);
        const savedRatings = savedProgressRef.current?.skill_ratings || {};
        
        newRatingKeys.forEach(key => {
          if ((prev.skill_ratings[key] ?? 0) > 0) {
            freshRatings[key] = prev.skill_ratings[key];
          } else if ((savedRatings[key] ?? 0) > 0) {
            freshRatings[key] = savedRatings[key];
          }
        });
        return { ...prev, skill_ratings: freshRatings };
      });
    }

    setQuestionLabels(prev => ({...prev, ...labels}));
    setQuestionPlaceholders(prev => ({...prev, ...placeholders}));
  };

  useEffect(() => {
    let cancelled = false;

    const loadDynamicContent = async () => {
      setLoadingLabels(true);
      try {
        const config = await loadSurveyConfig(true);
        if (!cancelled && config) applyConfig(config);
      } finally {
        if (!cancelled) setLoadingLabels(false);
      }
    };

    loadDynamicContent();

    const channel = subscribeToSurveyConfigChanges(async () => {
      console.log("[Realtime] Skills Section updating...");
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

  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData(SECTION_KEY);
      if (savedData) {
        savedProgressRef.current = savedData;
        setForm(f => ({ ...f, ...savedData }));
      }
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
      const readIds  = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped  = data.map(n => ({
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
    const d    = new Date(iso);
    const now  = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60)    + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const toggleCompetency = (value) => setForm(prev => ({
    ...prev,
    useful_competencies: prev.useful_competencies.includes(value)
      ? prev.useful_competencies.filter(v => v !== value)
      : [...prev.useful_competencies, value],
  }));

  const setSkillRating = (skill, rating) => setForm(prev => ({
    ...prev,
    skill_ratings: { ...prev.skill_ratings, [skill]: rating },
  }));

  const setSkillsToDevelop = (val) => setForm(prev => ({ ...prev, skills_to_develop: val }));

  const validate = () => {
    const e = new Set();
    if (form.useful_competencies.length === 0) e.add('useful_competencies');
    skillRatingsKeys.forEach(s => { if ((form.skill_ratings[s] || 0) === 0) e.add('rating_' + s); });
    if (!form.skills_to_develop?.trim()) e.add('skills_to_develop');
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress(SECTION_KEY, form);
    savedProgressRef.current = form;
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
    saveSectionProgress(SECTION_KEY, form)
      .then(() => navigate('/survey/feedback-and-engagement'));
  };

  const getLabel       = (fieldId) => questionLabels[fieldId]       || DEFAULT_LABELS[fieldId] || fieldId;
  const getPlaceholder = (fieldId) => questionPlaceholders[fieldId] || '';

  const formPct = computeFormPct(form, skillRatingsKeys);

  const { handleBack, BackGuardModal } = useSurveyBackGuard(
    navigate,
    '/dashboard',
    handleSave,
    'Skills and Competencies',
  );

  if (loadingLabels) {
    return <SkeletonLoader fieldCount={4} />;
  }

  return (
    <>
    <SkillsAndCompetenciesView
      form={form}
      toggleCompetency={toggleCompetency}
      setSkillRating={setSkillRating}
      setSkillsToDevelop={setSkillsToDevelop}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      competenciesOptions={competenciesOptions}
      skillRatingsKeys={skillRatingsKeys}
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

export default SkillsAndCompetencies;