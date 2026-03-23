import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import EducationalBackgroundView from '../Views/EducationalBackgroundView';

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 2;

const DEGREE_OPTIONS      = ['BA COMM','BS PSYCH','BS PE','BSA','BSMA','BSBA-MM','BSBA-FM','BSBA-HRM','BSTM','BSHM','BS ARCH','BSCE','BSCS-ML','BSCpE','BSIT-MWA','Other'];
const YEAR_OPTIONS        = Array.from({ length: 10 }, (_, i) => String(2025 + i));
const DISTINCTION_OPTIONS = ['Summa Cum Laude','Magna Cum Laude','Cum Laude','With Honors','None'];

const REQUIRED_FIELDS_BASE = [
  'degree_program', 'reason_for_course', 'year_graduated',
  'distinction', 'post_grad_plans', 'licensure_reviewing',
];

const computeFormPct = (form) => {
  const required = [...REQUIRED_FIELDS_BASE];
  if (form.degree_program === 'Other')          required.push('other_degree');
  if (form.post_grad_plans === 'Yes')           required.push('post_grad_course');
  if (form.licensure_reviewing === 'Yes') {
    required.push('licensure_plans', 'licensure_reason');
    if (form.licensure_plans === 'Yes' || form.licensure_plans === 'Already taken') {
      required.push('board_exam_name', 'board_exam_date', 'board_exam_result');
    }
  }
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const SECTION_CAP  = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const filled = required.filter(k => form[k] && String(form[k]).trim() !== '').length;
  const contribution = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), parseFloat(SECTION_CAP.toFixed(2)));
};

const EducationalBackground = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    degree_program: '', other_degree: '', reason_for_course: '',
    year_graduated: '', distinction: '', post_grad_plans: '',
    post_grad_course: '', licensure_reviewing: '', licensure_plans: '',
    licensure_reason: '', board_exam_name: '', board_exam_date: '', board_exam_result: '',
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
    const load = async () => {
      const savedData = await loadSectionData('educational_background');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
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

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const setLicensureReviewing = (val) =>
    setForm(prev => ({ ...prev, licensure_reviewing: val, licensure_plans: '', licensure_reason: '', board_exam_name: '', board_exam_date: '', board_exam_result: '' }));

  const setLicensurePlans = (val) =>
    setForm(prev => ({ ...prev, licensure_plans: val, board_exam_name: '', board_exam_date: '', board_exam_result: '' }));

  const validate = () => {
    const e = new Set();
    if (!form.degree_program)           e.add('degree_program');
    if (form.degree_program === 'Other' && !form.other_degree.trim()) e.add('other_degree');
    if (!form.reason_for_course.trim()) e.add('reason_for_course');
    if (!form.year_graduated)           e.add('year_graduated');
    if (!form.distinction)              e.add('distinction');
    if (!form.post_grad_plans)          e.add('post_grad_plans');
    if (form.post_grad_plans === 'Yes' && !form.post_grad_course.trim()) e.add('post_grad_course');
    if (!form.licensure_reviewing)      e.add('licensure_reviewing');
    if (form.licensure_reviewing === 'Yes') {
      if (!form.licensure_plans)         e.add('licensure_plans');
      if (!form.licensure_reason.trim()) e.add('licensure_reason');
      if (form.licensure_plans === 'Yes' || form.licensure_plans === 'Already taken') {
        if (!form.board_exam_name.trim()) e.add('board_exam_name');
        if (!form.board_exam_date)        e.add('board_exam_date');
        if (!form.board_exam_result)      e.add('board_exam_result');
      }
    }
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('educational_background', form);
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
    saveSectionProgress('educational_background', form)
      .then(() => navigate('/survey/certification-achievement'));
  };

  const formPct = computeFormPct(form);

  return (
    <EducationalBackgroundView
      form={form}
      set={set}
      setLicensureReviewing={setLicensureReviewing}
      setLicensurePlans={setLicensurePlans}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      degreeOptions={DEGREE_OPTIONS}
      yearOptions={YEAR_OPTIONS}
      distinctionOptions={DISTINCTION_OPTIONS}
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

export default EducationalBackground;