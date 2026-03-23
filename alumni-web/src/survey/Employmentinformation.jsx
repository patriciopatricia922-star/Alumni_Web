import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import EmploymentInformationView from '../Views/EmploymentInformationView';

const TOTAL_SECTIONS  = 7;
const CURRENT_SECTION = 4;

const INDUSTRY_OPTIONS       = ['Agriculture, Forestry and Fishing','Mining and Quarrying','Manufacturing','Electricity, Gas, Steam and Air Conditioning Supply','Water Supply, Sewerage and Waste Management','Construction','Wholesale and Retail Trade','Transportation and Storage','Accommodation and Food Service Activities','Information and Communication Technology (ICT)','Financial and Insurance Activities','Real Estate Activities','Professional, Scientific and Technical Activities','Administrative and Support Service Activities','Public Administration and Defence','Education','Human Health and Social Work Activities','Arts, Entertainment and Recreation','Other Service Activities','Other'];
const EMPLOYMENT_STATUSES_ALL = ['Regular / Permanent','Contractual','Part-Time','Probationary','Self-Employed','Unemployed, but looking for work','Unemployed, but not looking for work','Other'];
const REASONS_FOR_JOB        = ['Salaries and Benefits','Career Challenge','Related to Special Skill','Related to Course or Program of Study','Proximity of Residence','Peer Influence','Family Influence','Other'];
const UNEMPLOYED_REASONS     = ['Pursuing further studies','Family responsibilities or personal matters','Health-related reasons','Lack of job opportunities related to the field of study','Waiting for job placement results or hiring process','Currently seeking better employment opportunities','Started a personal business or freelance work (not yet stable)','Relocation or migration plans','Lack of work experience or qualifications required by employers','Taking a break or resting before seeking employment','Reviewing for board examination','Other'];
const MONTHLY_INCOME         = ['Below ₱15,000','₱15,001 – ₱30,000','₱30,001 – ₱50,000','Above ₱50,000'];
const EMPLOYED_STATUSES      = ['Regular / Permanent','Contractual','Part-Time','Probationary','Self-Employed'];
const UNEMPLOYED_STATUSES    = ['Unemployed, but looking for work','Unemployed, but not looking for work'];

const computeFormPct = (form) => {
  const required = ['job_related_to_degree', 'employment_status'];
  if (form.employment_status === 'Other') required.push('other_employment_status');
  if (EMPLOYED_STATUSES.includes(form.employment_status)) {
    required.push('job_position', 'company_name', 'type_of_industry', 'location_of_employment', 'monthly_income', 'reason_for_job');
    if (form.reason_for_job === 'Other') required.push('other_reason_for_job');
  }
  if (UNEMPLOYED_STATUSES.includes(form.employment_status)) {
    required.push('reasons_unemployed');
    if (form.reasons_unemployed === 'Other') required.push('other_reason_unemployed');
  }
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const SECTION_CAP  = (CURRENT_SECTION / TOTAL_SECTIONS) * 100;
  const filled = required.filter(k => form[k] && String(form[k]).trim() !== '').length;
  const contribution = (filled / required.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + contribution).toFixed(2)), parseFloat(SECTION_CAP.toFixed(2)));
};

const EmploymentInformation = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    job_related_to_degree: '',
    employment_status: '',
    other_employment_status: '',
    job_position: '',
    company_name: '',
    type_of_industry: '',
    location_of_employment: '',
    monthly_income: '',
    reason_for_job: '',
    other_reason_for_job: '',
    reasons_unemployed: '',
    other_reason_unemployed: '',
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
      const savedData = await loadSectionData('employment_information');
      if (savedData) setForm(f => ({
        ...f,
        ...savedData,
        location_of_employment: savedData.location_of_employment || savedData.employment_location || '',
        reason_for_job:         savedData.reason_for_job         || savedData.job_acceptance_reason || '',
        type_of_industry:       savedData.type_of_industry       || savedData.industry || '',
        monthly_income:         savedData.monthly_income         || savedData.salary_range || '',
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

  const resetEmploymentBranch = (v) => setForm(prev => ({
    ...prev,
    employment_status: v,
    other_employment_status: '',
    job_position: '', company_name: '', type_of_industry: '',
    location_of_employment: '', monthly_income: '',
    reason_for_job: '', other_reason_for_job: '',
    reasons_unemployed: '', other_reason_unemployed: '',
  }));

  const validate = () => {
    const e = new Set();
    if (!form.job_related_to_degree) e.add('job_related_to_degree');
    if (!form.employment_status)     e.add('employment_status');
    if (form.employment_status === 'Other' && !form.other_employment_status.trim()) e.add('other_employment_status');
    if (EMPLOYED_STATUSES.includes(form.employment_status)) {
      if (!form.job_position.trim())    e.add('job_position');
      if (!form.company_name.trim())    e.add('company_name');
      if (!form.type_of_industry)       e.add('type_of_industry');
      if (!form.location_of_employment) e.add('location_of_employment');
      if (!form.monthly_income)         e.add('monthly_income');
      if (!form.reason_for_job)         e.add('reason_for_job');
      if (form.reason_for_job === 'Other' && !form.other_reason_for_job.trim()) e.add('other_reason_for_job');
    }
    if (UNEMPLOYED_STATUSES.includes(form.employment_status)) {
      if (!form.reasons_unemployed) e.add('reasons_unemployed');
      if (form.reasons_unemployed === 'Other' && !form.other_reason_unemployed.trim()) e.add('other_reason_unemployed');
    }
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('employment_information', form);
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
    saveSectionProgress('employment_information', form)
      .then(() => navigate('/survey/job-experience'));
  };

  const formPct = computeFormPct(form);

  return (
    <EmploymentInformationView
      form={form}
      set={set}
      resetEmploymentBranch={resetEmploymentBranch}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      industryOptions={INDUSTRY_OPTIONS}
      employmentStatusesAll={EMPLOYMENT_STATUSES_ALL}
      reasonsForJob={REASONS_FOR_JOB}
      unemployedReasons={UNEMPLOYED_REASONS}
      monthlyIncome={MONTHLY_INCOME}
      employedStatuses={EMPLOYED_STATUSES}
      unemployedStatuses={UNEMPLOYED_STATUSES}
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

export default EmploymentInformation;