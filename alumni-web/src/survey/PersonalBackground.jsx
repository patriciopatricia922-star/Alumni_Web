import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import { loadSurveyConfig } from '../lib/surveyConfig';
import PersonalBackgroundView from '../Views/PersonalBackgroundView';

const TOTAL_SECTIONS = 7;
const CURRENT_SECTION = 1;

const REQUIRED_FIELDS = [
  'last_name', 'first_name', 'gender', 'birthday',
  'civil_status', 'street_address', 'city', 'province',
  'zip_code', 'country', 'contact_number', 'email',
];

// Map field IDs to their default labels
const DEFAULT_LABELS = {
  last_name: 'Last Name',
  first_name: 'First Name',
  middle_name: 'Middle Name',
  student_number: 'Student Number',
  gender: 'Gender',
  birthday: 'Birthday',
  civil_status: 'Civil Status',
  street_address: 'Street Address',
  city: 'City',
  province: 'Province',
  zip_code: 'ZIP Code',
  country: 'Country',
  contact_number: 'Contact Number',
  email: 'Personal Email Address',
};

const computeFormPct = (form) => {
  const SECTION_BASE = ((CURRENT_SECTION - 1) / TOTAL_SECTIONS) * 100;
  const filled = REQUIRED_FIELDS.filter(k => form[k] && String(form[k]).trim() !== '').length;
  const sectionContribution = (filled / REQUIRED_FIELDS.length) * (1 / TOTAL_SECTIONS) * 100;
  return Math.min(parseFloat((SECTION_BASE + sectionContribution).toFixed(2)), parseFloat((CURRENT_SECTION / TOTAL_SECTIONS) * 100));
};

const PersonalBackground = () => {
  const navigate = useNavigate();
  const [questionLabels, setQuestionLabels] = useState({});
  const [questionPlaceholders, setQuestionPlaceholders] = useState({});
  const [questionOptions, setQuestionOptions] = useState({});
  const [loadingLabels, setLoadingLabels] = useState(true);

  const [form, setForm] = useState({
    last_name: '', first_name: '', middle_name: '',
    student_number: '', gender: '', birthday: '',
    civil_status: '', street_address: '', city: '',
    province: '', zip_code: '', country: '',
    contact_number: '', email: '',
    phone_prefix: '+63',
  });

  const [errors, setErrors] = useState(new Set());
  const [saveToast, setSaveToast] = useState(false);
  const cardRef = useRef(null);

  // Load dynamic question labels from survey_config
  useEffect(() => {
    const loadDynamicContent = async () => {
      setLoadingLabels(true);
      const config = await loadSurveyConfig();
      
      if (config?.sections) {
        const personalSection = config.sections.find(s => s.title === 'Personal Background');
        if (personalSection?.questions) {
          const labels = {};
          const placeholders = {};
          const options = {};
          
          personalSection.questions.forEach(q => {
            labels[q.id] = q.label;
            if (q.placeholder) placeholders[q.id] = q.placeholder;
            if (q.options) options[q.id] = q.options;
          });
          
          setQuestionLabels(labels);
          setQuestionPlaceholders(placeholders);
          setQuestionOptions(options);
        }
      }
      setLoadingLabels(false);
    };
    loadDynamicContent();
  }, []);

  // ── Notification state ─────────────────────────────────────────────────────
  const bellRef = useRef(null);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab, setNotifTab] = useState('all');

  useEffect(() => {
    const prefill = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await supabase
        .from('users')
        .select('first_name, middle_name, last_name, email, student_number')
        .eq('id', authUser.id)
        .single();

      const savedData = await loadSectionData('personal_background');

      if (savedData) {
        setForm(f => ({ ...f, ...savedData }));
      } else if (data) {
        setForm(f => ({
          ...f,
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          student_number: data.student_number || '',
        }));
      }
    };
    prefill();
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
      const mapped = data.map(n => ({ id: n.id, title: n.title, body: n.content, time: n.published_at, read: readIds.includes(n.id) }));
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
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0, 0, 0, 0);
      if (d >= today) groups['Today'].push(n);
      else if (d >= yesterday) groups['Yesterday'].push(n);
      else if (d >= weekAgo) groups['This Week'].push(n);
      else groups['Earlier'].push(n);
    });
    return groups;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setRadio = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const setCountry = (e) => {
    const c = e.target.value;
    const prefix = c === 'Philippines' ? '+63' : c === 'United States' ? '+1' : '+';
    setForm(f => ({ ...f, country: c, phone_prefix: prefix }));
  };

  const validate = () => {
    const e = new Set();
    if (!form.last_name.trim()) e.add('last_name');
    if (!form.first_name.trim()) e.add('first_name');
    if (!form.gender) e.add('gender');
    if (!form.birthday) e.add('birthday');
    if (!form.civil_status) e.add('civil_status');
    if (!form.street_address.trim()) e.add('street_address');
    if (!form.city.trim()) e.add('city');
    if (!form.province.trim()) e.add('province');
    if (!form.zip_code.trim()) e.add('zip_code');
    if (!form.country) e.add('country');
    if (!form.contact_number.trim()) e.add('contact_number');
    if (!form.email.trim()) e.add('email');
    return e;
  };

  const handleSave = async () => {
    await saveSectionProgress('personal_background', form);
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
    saveSectionProgress('personal_background', form)
      .then(() => navigate('/survey/educational-background'));
  };

  const formPct = computeFormPct(form);

  // Helper function to get dynamic label
  const getLabel = (fieldId) => {
    return questionLabels[fieldId] || DEFAULT_LABELS[fieldId] || fieldId;
  };

  // Helper function to get dynamic placeholder
  const getPlaceholder = (fieldId) => {
    return questionPlaceholders[fieldId] || DEFAULT_PLACEHOLDERS[fieldId] || '';
  };

  const DEFAULT_PLACEHOLDERS = {
    last_name: 'e.g. Dela Cruz',
    first_name: 'e.g. Juan',
    middle_name: 'e.g. Mercado',
    student_number: 'e.g. 2023-123456',
    street_address: 'e.g. Blk 123 Lot 456 AlumnAI St.',
    city: 'e.g. Dasmariñas',
    province: 'e.g. Cavite',
    zip_code: 'e.g. 4114',
    contact_number: 'e.g. 912-345-6789',
    email: 'e.g. juandelacruz@gmail.com',
  };

  if (loadingLabels) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002263' }}>
        <div style={{ color: '#fff' }}>Loading...</div>
      </div>
    );
  }

  return (
    <PersonalBackgroundView
      form={form}
      set={set}
      setRadio={setRadio}
      setCountry={setCountry}
      errors={errors}
      saveToast={saveToast}
      cardRef={cardRef}
      formPct={formPct}
      currentSection={CURRENT_SECTION}
      totalSections={TOTAL_SECTIONS}
      handleSave={handleSave}
      handleNext={handleNext}
      getLabel={getLabel}
      getPlaceholder={getPlaceholder}
      genderOptions={questionOptions.gender || ['Male', 'Female', 'Prefer not to say']}
      civilStatusOptions={questionOptions.civil_status || ['Single', 'Married', 'Widowed']}
      countryOptions={questionOptions.country || ['Philippines', 'United States', 'Other']}
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

export default PersonalBackground;