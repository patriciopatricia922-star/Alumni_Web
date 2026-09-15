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
      // [policy-notif-click] `category` added so Policy Update rows (see
      // ContentManagement.jsx handleDisclosureUpdate) can be distinguished
      // from regular announcements once they reach the UI — used below by
      // getPolicyModalType(). No other announcement behavior depends on it.
      .select('id, title, content, published_at, is_active, category')
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
      
    // FIX: previously this only selected `points_required`, so there was no
    // actual description column being fetched at all for rewards — normalize()
    // had nothing else to use as the body. Now selecting `description` too.
    supabase
      .from('rewards')
      .select('id, title, description, points_required, created_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ]);

  const readIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  const notifications = [];

  // Helper to normalize data from different tables into a unified notification structure
  // FIX: added an optional `fallbackBody` builder so a type can supply a
  // data-driven fallback (e.g. rewards, when `description` is empty) instead
  // of silently falling through to whatever field happened to be passed in.
  // [policy-notif-click] added an optional `extraFields(item)` so a caller
  // can merge a few extra passthrough fields (currently only `category`,
  // for announcements) onto the normalized object without changing this
  // helper's shape for the other four callers, which don't pass it.
  const normalize = (data, type, idField, titleField, bodyField, dateField, fallbackBody, extraFields) => {
    if (!data) return [];
    return data.map(item => {
      const rawBody = item[bodyField];
      const hasBody = rawBody !== null && rawBody !== undefined && String(rawBody).trim() !== '';
      const resolvedBody = hasBody ? rawBody : (fallbackBody ? fallbackBody(item) : '');
      return {
        // Create a unique ID by prefixing with type to avoid collisions between tables
        id: `${type}-${item[idField]}`,
        type: type,
        typeId: item[idField], // The actual DB ID for navigation
        title: decodeHtmlEntities(item[titleField]),
        body: stripHtml(String(resolvedBody || '')),
        time: item[dateField],
        read: readIds.includes(`${type}-${item[idField]}`),
        ...(extraFields ? extraFields(item) : {}),
      };
    });
  };

  if (!annError && annData) {
    notifications.push(
      ...normalize(
        annData,
        'announcement',
        'id',
        'title',
        'content',
        'published_at',
        null,
        (item) => ({ category: item.category || null })
      )
    );
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
    // FIX: body now comes from the reward's own `description`. Only when a
    // reward genuinely has no description do we fall back to a generated,
    // human-readable sentence built from `points_required` — never the raw
    // number by itself, and never a hardcoded reward name.
    notifications.push(
      ...normalize(
        rewardData,
        'reward',
        'id',
        'title',
        'description',
        'created_at',
        (item) =>
          item.points_required != null
            ? `Redeem this reward for ${item.points_required} points.`
            : 'Check the rewards page for details.'
      )
    );
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

// [policy-notif-click] Maps a notification to which UserPolicyModal `type`
// it should open on click — 'tos', 'privacy', or null for anything that
// isn't a Policy Update notification (i.e. everything falls through to the
// normal announcement/discount/job/event/reward click handling untouched).
//
// Title text is matched rather than re-deriving from disclosure state
// because the three possible titles are an exact, fixed contract written
// by ContentManagement.jsx's handleDisclosureUpdate — this only routes an
// already-created notification, it doesn't decide what changed.
//
// When both were updated in the same save (one combined notification),
// this defaults to opening Terms first; Privacy Policy remains one tap
// away via the same entry points (About / ID Registration) as always —
// UserPolicyModal itself only ever shows one document at a time, and
// giving it a two-document mode here would be a bigger change than this
// task calls for.
export function getPolicyModalType(n) {
  if (!n || n.category !== 'Policy Update') return null;
  const title = n.title || '';
  const hasTos = title.includes('Terms of Service');
  const hasPp = title.includes('Privacy Policy');
  if (hasTos) return 'tos';
  if (hasPp) return 'privacy';
  return null;
}