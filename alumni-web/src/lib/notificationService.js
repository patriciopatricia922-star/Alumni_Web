// src/lib/notificationService.js
import { supabase } from './supabase';
import { stripHtml, decodeHtmlEntities } from '../utils/textHelpers';

const STORAGE_KEY = 'read_notifs';

export async function fetchNotifications(userId, limit = 20) {
  // Fetch from all relevant tables in parallel
  const [
    { data: annData, error: annError },
    { data: discData, error: discError },
    { data: jobData, error: jobError },
    { data: eventData, error: eventError },
    { data: rewardData, error: rewardError },
  ] = await Promise.all([
    supabase
      .from('announcements')
      .select('id, title, content, published_at, is_active')
      .eq('is_active', true)
      .or(`target_user_ids.is.null,target_user_ids.cs.{${userId}}`)
      .order('published_at', { ascending: false }),
    
    supabase
      .from('discounts')
      .select('id, title, description, created_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
      
    supabase
      .from('jobs')
      .select('id, title, description, posted_at, is_active')
      .eq('is_active', true)
      .order('posted_at', { ascending: false }),
      
    supabase
      .from('events')
      .select('id, title, description, event_date, is_active')
      .eq('is_active', true)
      .order('event_date', { ascending: false }),
      
    supabase
      .from('rewards')
      .select('id, title, points_required, created_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ]);

  const readIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  const notifications = [];

  // Helper to normalize data from different tables into a unified notification structure
  const normalize = (data, type, idField, titleField, bodyField, dateField) => {
    if (!data) return [];
    return data.map(item => ({
      // Create a unique ID by prefixing with type to avoid collisions between tables
      id: `${type}-${item[idField]}`, 
      type: type,
      typeId: item[idField], // The actual DB ID for navigation
      title: decodeHtmlEntities(item[titleField]),
      body: stripHtml(item[bodyField] || ''),
      time: item[dateField],
      read: readIds.includes(`${type}-${item[idField]}`),
    }));
  };

  if (!annError && annData) {
    notifications.push(...normalize(annData, 'announcement', 'id', 'title', 'content', 'published_at'));
  }
  if (!discError && discData) {
    notifications.push(...normalize(discData, 'discount', 'id', 'title', 'description', 'created_at'));
  }
  if (!jobError && jobData) {
    notifications.push(...normalize(jobData, 'job', 'id', 'title', 'description', 'posted_at'));
  }
  if (!eventError && eventData) {
    notifications.push(...normalize(eventData, 'event', 'id', 'title', 'description', 'event_date'));
  }
  if (!rewardError && rewardData) {
    // For rewards, we use points_required as a snippet in the body if description isn't available
    notifications.push(...normalize(rewardData, 'reward', 'id', 'title', 'points_required', 'created_at'));
  }

  // Sort all notifications by time descending
  notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Limit the total number of notifications
  return notifications.slice(0, limit);
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