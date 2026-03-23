import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import FeedbackAndAlumniEngagementView from '../Views/FeedbackAndAlumniEngagementView';

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 7;

const SATISFACTION_OPTIONS = ['Very Satisfied','Satisfied','Neutral','Dissatisfied','Very Dissatisfied'];
const PARTICIPATE_OPTIONS  = ['Alumni Seminars/Webinar programs for professional growth','Career talks for students','Alumni fundraising events/activities','Volunteer opportunities','Not at all','Other'];

const computeFormPct = (form) => {
  const required = ['satisfaction', 'recommend', 'suggestions', 'informed_about_events', 'participate_in'];
  if (form.participate_in.includes('Other')) required.push('other_participate');
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const filled = required.filter(k => {
    const v = form[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && String(v).trim() !== '';
  }).length;
  const contribution = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  // Section 7 cap is 100%
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), 100);
};

const FeedbackAndAlumniEngagement = () => {
  const navigate = useNavigate();
  const cardRef  = useRef(null);
  const bellRef  = useRef(null);

  const [errors,    setErrors]    = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);

  const [form, setForm] = useState({
    satisfaction:          '',
    recommend:             '',
    suggestions:           '',
    informed_about_events: '',
    participate_in:        [],
    other_participate:     '',
  });

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    const load = async () => {
      const [feedbackData, engagementData] = await Promise.all([
        loadSectionData('feedback_university'),
        loadSectionData('alumni_engagement'),
      ]);
      setForm(f => ({
        ...f,
        ...(feedbackData   || {}),
        ...(engagementData || {}),
        informed_about_events: engagementData?.informed_about_events || engagementData?.stay_connected       || '',
        participate_in:        engagementData?.participate_in        || engagementData?.engagement_activities || [],
      }));
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

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleParticipate = (value) => setForm(prev => ({
    ...prev,
    participate_in: prev.participate_in.includes(value)
      ? prev.participate_in.filter(v => v !== value)
      : [...prev.participate_in, value],
  }));

  const validate = () => {
    const e = new Set();
    if (!form.satisfaction)              e.add('satisfaction');
    if (!form.recommend)                 e.add('recommend');
    if (!form.suggestions.trim())        e.add('suggestions');
    if (!form.informed_about_events)     e.add('informed_about_events');
    if (form.participate_in.length === 0) e.add('participate_in');
    if (form.participate_in.includes('Other') && !form.other_participate.trim()) e.add('other_participate');
    return e;
  };

  const handleSave = async () => {
    await Promise.all([
      saveSectionProgress('feedback_university', {
        satisfaction: form.satisfaction,
        recommend:    form.recommend,
        suggestions:  form.suggestions,
      }),
      saveSectionProgress('alumni_engagement', {
        informed_about_events: form.informed_about_events,
        participate_in:        form.participate_in,
        other_participate:     form.other_participate,
      }),
    ]);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleSubmit = async () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    try {
      await Promise.all([
        saveSectionProgress('feedback_university', {
          satisfaction: form.satisfaction,
          recommend:    form.recommend,
          suggestions:  form.suggestions,
        }),
        saveSectionProgress('alumni_engagement', {
          informed_about_events: form.informed_about_events,
          participate_in:        form.participate_in,
          other_participate:     form.other_participate,
        }),
      ]);
      const { data: { user } } = await supabase.auth.getUser();
      await logAction({
        action:      'Create',
        module:      'Survey',
        description: 'Alumni submitted tracer survey (web)',
        recordId:    user?.id ?? null,
        status:      'Success',
      });
      navigate('/survey/complete');
    } catch (err) {
      await logAction({
        action:      'Create',
        module:      'Survey',
        description: 'Alumni survey submission failed (web)',
        status:      'Failed',
      });
    }
  };

  const formPct = computeFormPct(form);

  return (
    <FeedbackAndAlumniEngagementView
      form={form}
      set={set}
      toggleParticipate={toggleParticipate}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      satisfactionOptions={SATISFACTION_OPTIONS}
      participateOptions={PARTICIPATE_OPTIONS}
      handleSave={handleSave}
      handleSubmit={handleSubmit}
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

export default FeedbackAndAlumniEngagement;