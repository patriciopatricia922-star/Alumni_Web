import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import SkillsAndCompetenciesView from '../Views/SkillsAndCompetenciesView';

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 6;

const COMPETENCIES_OPTIONS = ['Communication Skills','Information & Technology Skills','Leadership Skills','Critical & Problem-Solving Skills','Work Ethics/Professionalism'];
const SKILL_RATINGS_KEYS   = ['Communication Skills','Information & Technology Skills','Leadership Skills','Critical & Problem-Solving Skills','Work Ethics/Professionalism Skills'];

const computeFormPct = (form) => {
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const SECTION_CAP  = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;

  // Required: useful_competencies (array), each skill rating (5), skills_to_develop
  let total  = 1 + SKILL_RATINGS_KEYS.length + 1; // 7
  let filled = 0;

  if (form.useful_competencies.length > 0) filled++;
  SKILL_RATINGS_KEYS.forEach(s => { if ((form.skill_ratings[s] || 0) > 0) filled++; });
  if (form.skills_to_develop?.trim()) filled++;

  const contribution = (filled / total) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), parseFloat(SECTION_CAP.toFixed(2)));
};

const SkillsAndCompetencies = () => {
  const navigate = useNavigate();
  const cardRef  = useRef(null);
  const bellRef  = useRef(null);

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);

  const [form, setForm] = useState({
    useful_competencies: [],
    skill_ratings: {
      'Communication Skills': 0,
      'Information & Technology Skills': 0,
      'Leadership Skills': 0,
      'Critical & Problem-Solving Skills': 0,
      'Work Ethics/Professionalism Skills': 0,
    },
    skills_to_develop: '',
  });

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    loadSectionData('skills_competencies').then(d => { if (d) setForm(f => ({ ...f, ...d })); });
  }, []);

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
      const mapped  = data.map(n => ({ id: n.id, title: n.title, body: n.content, time: n.published_at, read: readIds.includes(n.id) }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const h = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false); };
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
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
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
    if (diff < 3600)   return Math.floor(diff / 60)   + 'm ago';
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
    SKILL_RATINGS_KEYS.forEach(s => { if ((form.skill_ratings[s] || 0) === 0) e.add('rating_' + s); });
    if (!form.skills_to_develop?.trim()) e.add('skills_to_develop');
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('skills_competencies', form);
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
    saveSectionProgress('skills_competencies', form)
      .then(() => navigate('/survey/feedback-and-engagement'));
  };

  const formPct = computeFormPct(form);

  return (
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
      competenciesOptions={COMPETENCIES_OPTIONS}
      skillRatingsKeys={SKILL_RATINGS_KEYS}
      handleSave={handleSave}
      handleNext={handleNext}
      // notifications
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
      // navigation
      navigate={navigate}
    />
  );
};

export default SkillsAndCompetencies;