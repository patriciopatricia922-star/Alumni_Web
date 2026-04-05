import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProfileView from '../Views/Profileview';

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

const STRENGTH_FIELDS = [
  'avatar_url',
  'first_name',
  'last_name',
  'program',
  'batch_year',
  'bio',
  'employment_status',
  'mobile_number',
];

const calcStrength = (data) => {
  if (!data) return 0;
  const filled = STRENGTH_FIELDS.filter((f) => Boolean(data[f])).length;
  return Math.round((filled / STRENGTH_FIELDS.length) * 100);
};

const Profile = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();

  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [strength, setStrength] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const bellRef = useRef(null);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab, setNotifTab] = useState('all');

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) return;

      // FIX: Detailed error logging to identify the missing column
      const { data, error } = await supabase
        .from('users')
        .select('*') // Using * temporarily is a good way to check if the table/ID is the issue
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Supabase Error Details:', error.message, error.hint, error.details);
        return;
      }

      if (!data) {
        console.warn('No user record found in "users" table for ID:', authUser.id);
        return;
      }

      setUser(data);
      setStrength(calcStrength(data));
      if (data.avatar_url) setAvatarUrl(data.avatar_url);
    } catch (err) {
      console.error('fetchUser unexpected error:', err);
    }
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error || !data) return;

      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped = data.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.content,
        time: n.published_at,
        read: readIds.includes(n.id),
      }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter((n) => !n.read).length);
    } catch (err) {
      console.error('fetchNotifs unexpected error:', err);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs((prev) => {
      const allIds = prev.map((n) => n.id);
      localStorage.setItem('read_notifs', JSON.stringify(allIds));
      return prev.map((n) => ({ ...n, read: true }));
    });
    setUnreadCount(0);
  }, []);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('read_notifs', JSON.stringify(readIds));
    }
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const handleAvatarUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) return;

      const ext = file.name.split('.').pop();
      const filePath = `avatars/${authUser.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) { console.error('Avatar upload error:', uploadError); return; }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', authUser.id);

      setAvatarUrl(publicUrl);
      fetchUser();
    } catch (err) {
      console.error('handleAvatarUpload unexpected error:', err);
    }
  }, [fetchUser]);

  return (
    <ProfileView
      user={user}
      avatarUrl={avatarUrl}
      width={width}
      strength={strength}
      showModal={showModal}
      setShowModal={setShowModal}
      bellRef={bellRef}
      notifs={notifs}
      notifTab={notifTab}
      setNotifTab={setNotifTab}
      unreadCount={unreadCount}
      showDropdown={showDropdown}
      setShowDropdown={setShowDropdown}
      markAllRead={markAllRead}
      markOneRead={markOneRead}
      onAvatarUpload={handleAvatarUpload}
      navigate={navigate}
    />
  );
};

export default Profile;