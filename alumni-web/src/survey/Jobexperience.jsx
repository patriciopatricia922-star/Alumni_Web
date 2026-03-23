import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import JobExperienceView from '../Views/JobExperienceView';

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 5;

const TIME_TO_FIND_JOB_OPTIONS    = ['Less than a month','1–3 months','4–6 months','7–12 months','More than a year','Not applicable'];
const EMPLOYMENT_DURATION_OPTIONS = ['Less than a month','1–6 months','7–11 months','1 year or less than 2 years','2 years or less than 3 years','3 years or less than 4 years','Other'];
const FIRST_JOB_OPTIONS           = ['Job/Career Fair','Internship Absorption','Online','Recommendation','Walk-in Applications','Not applicable','Other'];
const FACTORS_OPTIONS             = ['Academic performance','Internship / On-the-job Training','Personal connections','Skills/Competencies acquired in school','Certifications','Not applicable','Other'];

const computeFormPct = (form) => {
  const required = ['time_to_find_job', 'employment_duration', 'first_job_source', 'first_job_factors'];
  if (form.employment_duration === 'Other') required.push('other_employment_duration');
  if (form.first_job_source === 'Other')    required.push('other_first_job_source');
  if (form.first_job_factors.includes('Other')) required.push('other_job_factors');
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const SECTION_CAP  = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const filled = required.filter(k => {
    const v = form[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && String(v).trim() !== '';
  }).length;
  const contribution = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), parseFloat(SECTION_CAP.toFixed(2)));
};

const JobExperience = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    time_to_find_job:          '',
    other_time_to_find_job:    '',
    employment_duration:       '',
    other_employment_duration: '',
    first_job_source:          '',
    other_first_job_source:    '',
    first_job_factors:         [],
    other_job_factors:         '',
  });

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  const bellRef = useRef(null);
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    loadSectionData('job_experience').then(d => {
      if (d) setForm(f => ({
        ...f, ...d,
        first_job_factors: d.first_job_factors || d.job_factors || [],
      }));
    });
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

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleFactor = (factor) => setForm(prev => ({
    ...prev,
    first_job_factors: prev.first_job_factors.includes(factor)
      ? prev.first_job_factors.filter(f => f !== factor)
      : [...prev.first_job_factors, factor],
  }));

  const validate = () => {
    const e = new Set();
    if (!form.time_to_find_job)              e.add('time_to_find_job');
    if (!form.employment_duration)           e.add('employment_duration');
    if (form.employment_duration === 'Other' && !form.other_employment_duration.trim()) e.add('other_employment_duration');
    if (!form.first_job_source)              e.add('first_job_source');
    if (form.first_job_source === 'Other' && !form.other_first_job_source.trim()) e.add('other_first_job_source');
    if (form.first_job_factors.length === 0) e.add('first_job_factors');
    if (form.first_job_factors.includes('Other') && !form.other_job_factors.trim()) e.add('other_job_factors');
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('job_experience', form);
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
    saveSectionProgress('job_experience', form)
      .then(() => navigate('/survey/skills-and-competencies'));
  };

  const formPct = computeFormPct(form);

  return (
    <JobExperienceView
      form={form}
      set={set}
      toggleFactor={toggleFactor}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      timeToFindJobOptions={TIME_TO_FIND_JOB_OPTIONS}
      employmentDurationOptions={EMPLOYMENT_DURATION_OPTIONS}
      firstJobOptions={FIRST_JOB_OPTIONS}
      factorsOptions={FACTORS_OPTIONS}
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

export default JobExperience;