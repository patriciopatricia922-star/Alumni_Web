import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useUserProfile from '../hooks/Useuserprofile'; // Ensure casing matches your file system
import PersonalInformationView from '../Views/PersonalInformationView';

// ─────────────────────────────────────────────────────────────────────────────
// Responsive breakpoint hook
// ─────────────────────────────────────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const FORM_KEYS = [
  'firstName', 'middleName', 'lastName',
  'gender', 'birthday', 'civilStatus',
  'street', 'city', 'province', 'zipCode', 'country',
  'contactNumber',
  'academicProgram', 'yearGraduated', 'studentNumber',
  'email',   
];

const EMPTY_FORM = Object.fromEntries(FORM_KEYS.map((k) => [k, '']));
const READ_ONLY  = new Set(['email', 'id']); // ID and Email should never be in the "changes" payload

const validate = (form) => {
  const errors = {};
  if (!form.firstName?.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName?.trim())  errors.lastName  = 'Last name is required.';
  if (form.zipCode && !/^\d{4}$/.test(form.zipCode))
    errors.zipCode = 'Zip code must be 4 digits.';
  if (form.contactNumber) {
    const digits = form.contactNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11)
      errors.contactNumber = 'Enter a valid 10–11 digit number.';
  }
  if (form.yearGraduated && !/^\d{4}$/.test(form.yearGraduated))
    errors.yearGraduated = 'Enter a valid 4-digit year.';
  return errors;
};

const NOTIF_KEY   = 'alumnai_read_notifs';
const getReadIds  = () => { try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); } catch { return []; } };
const saveReadIds = (ids) => { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(ids)); } catch {} };

export const groupByDate = (list) => {
  const now = new Date();
  const today     = new Date(now); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const weekAgo   = new Date(today); weekAgo.setDate(today.getDate()-7);
  const groups    = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
  list.forEach((n) => {
    const d = new Date(n.time); d.setHours(0,0,0,0);
    if      (d >= today)     groups['Today'].push(n);
    else if (d >= yesterday) groups['Yesterday'].push(n);
    else if (d >= weekAgo)   groups['This Week'].push(n);
    else                     groups['Earlier'].push(n);
  });
  return groups;
};

export const formatTime = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};

const PersonalInformation = () => {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const { profile, loading: profileLoading, updateProfile } = useUserProfile();

  const [form,         setFormState]   = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving,       setSaving]      = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError,    setSaveError]   = useState('');
  const formInitialized               = useRef(false);

  useEffect(() => {
    if (profile && !formInitialized.current) {
      formInitialized.current = true;
      setFormState(
        Object.fromEntries(
          FORM_KEYS.map((k) => [k, profile[k] != null ? String(profile[k]) : ''])
        )
      );
    }
  }, [profile]);

  const bellRef                         = useRef(null);
  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    const h = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    supabase.from('announcements')
      .select('id, title, content, published_at, is_active')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error || !data) return;
        const readIds = getReadIds();
        const mapped  = data.map((n) => ({ id: n.id, title: n.title, body: n.content, time: n.published_at, read: readIds.includes(n.id) }));
        setNotifs(mapped);
        setUnreadCount(mapped.filter((n) => !n.read).length);
      });
  }, []);

  const setField = useCallback((key) => (valueOrEvent) => {
    const value = valueOrEvent && typeof valueOrEvent === 'object' && 'target' in valueOrEvent
      ? valueOrEvent.target.value : valueOrEvent;
    setFormState((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => { if (!prev[key]) return prev; const next = { ...prev }; delete next[key]; return next; });
  }, []);

  // Updated handleSave to prevent sending 'email' in the changes object
  const handleSave = useCallback(async () => {
    setSaveError(''); setSaveSuccess(false);
    const errors = validate(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setSaving(true);

    const changes = {};
    FORM_KEYS.forEach((k) => {
      // Logic Fix: Only add to 'changes' if it's not a Read Only field
      if (!READ_ONLY.has(k)) {
        const cached = profile?.[k] != null ? String(profile[k]) : '';
        if (form[k] !== cached) {
          changes[k] = form[k] === '' ? null : form[k];
        }
      }
    });

    // If no real changes made, just stop
    if (Object.keys(changes).length === 0) {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      return;
    }

    const { success, error } = await updateProfile(changes);
    setSaving(false);
    if (!success) {
      // User-friendly error message
      const msg = error?.includes('null value in column "email"') 
        ? "Account email missing. Please re-login." 
        : (error || 'Failed to save. Please try again.');
      setSaveError(msg);
    }
    else { 
      setSaveSuccess(true); 
      setTimeout(() => setSaveSuccess(false), 3500); 
    }
  }, [form, profile, updateProfile]);

  const markAllRead = useCallback(() => {
    saveReadIds(notifs.map((n) => n.id));
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const ids = getReadIds();
    if (!ids.includes(id)) { ids.push(id); saveReadIds(ids); }
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const filteredNotifs = useMemo(
    () => notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs,
    [notifs, notifTab]
  );

  return (
    <PersonalInformationView
      isMobile={isMobile} isTablet={isTablet}
      form={form} setField={setField} fieldErrors={fieldErrors}
      loading={profileLoading} saving={saving}
      saveSuccess={saveSuccess} saveError={saveError} handleSave={handleSave}
      bellRef={bellRef} notifs={filteredNotifs} allNotifs={notifs}
      unreadCount={unreadCount} showDropdown={showDropdown}
      setShowDropdown={setShowDropdown} notifTab={notifTab}
      setNotifTab={setNotifTab} markAllRead={markAllRead}
      markOneRead={markOneRead} groupByDate={groupByDate}
      formatTime={formatTime} navigate={navigate}
    />
  );
};

export default PersonalInformation;