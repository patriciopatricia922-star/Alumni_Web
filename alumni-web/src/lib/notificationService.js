// src/lib/notificationService.js
import { supabase } from './supabase';
import { stripHtml, decodeHtmlEntities } from '../utils/textHelpers';

const STORAGE_KEY = 'read_notifs';

export async function fetchNotifications(userId, limit = 20) {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, content, published_at, is_active')
    .eq('is_active', true)
    .or(`target_user_ids.is.null,target_user_ids.cs.{${userId}}`)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const readIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  return data.map((n) => ({
    id: n.id,
    title: decodeHtmlEntities(n.title),
    body: stripHtml(n.content),
    time: n.published_at,
    read: readIds.includes(n.id),
    // NEW: lets the notification identify its source content and
    // where clicking it should navigate. Currently all notifications
    // come from announcements, so type is fixed here; announcementId
    // mirrors id (the announcement's own primary key) so downstream
    // code has an explicit, self-describing field to read instead of
    // relying on "id" meaning different things for different types
    // if more notification sources are added later.
    type: 'announcement',
    announcementId: n.id,
  }));
}

export function getReadIds() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function persistReadIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function markAllAsRead(notifs) {
  const allIds = notifs.map((n) => n.id);
  persistReadIds(allIds);
  return notifs.map((n) => ({ ...n, read: true }));
}

export function markOneAsRead(notifs, id) {
  const readIds = getReadIds();
  if (!readIds.includes(id)) {
    readIds.push(id);
    persistReadIds(readIds);
  }
  return notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export function groupByDate(list) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
  list.forEach((n) => {
    const d = new Date(n.time);
    d.setHours(0, 0, 0, 0);
    if (d >= today) groups['Today'].push(n);
    else if (d >= yesterday) groups['Yesterday'].push(n);
    else if (d >= weekAgo) groups['This Week'].push(n);
    else groups['Earlier'].push(n);
  });
  return groups;
}

export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}