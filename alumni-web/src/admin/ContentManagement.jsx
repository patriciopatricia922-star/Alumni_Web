// ============================================================================
// Purpose: Handles all business logic, Supabase API calls, data processing,
//          state management, and event handlers for Content Management.
//
// INTEGRATION LOG - Mine
// ─────────────────────────────────────────────────────────────────────────────
// [landing-cms]   updated_at stamped on every mutating Supabase call
//                 handleToggleActive — show/hide landing sections without archive
// [disclosure]    disclosurepage tab, disclosure state, fetchDisclosure,
//                 handleDisclosureUpdate — full Supabase upsert with:
//                   · stripHtml validation (rejects empty rich-text markup)
//                   · updated_at explicit stamp
//                   · upsert(onConflict:'id') singleton pattern
//                   · logAction audit trail
//                   · fetchDisclosure refresh on success
//                 openDisclosureModal / closeDisclosureModal
//                 disclosureInitialEditing: 'tos' | 'pp' | null
// [friend]        openEdit switches activeTab so archive-edit always lands on
//                 the correct modal; archive/restore refactored to DRY META map
// [fix]           handleRestore — removed restored_at (column does not exist in
//                 schema); update payload now only sets is_active + updated_at
// [friend-merge]  alumniType context + SHS_TABS — SHS alumni see a tab list
//                 without the Jobs tab; alumniType prop forwarded to view
//                 rewards tab — full CRUD (fetchRewards, handleCreateReward,
//                 handleUpdateReward) + archive/restore META entries
// ============================================================================

import React, { useState, useEffect } from 'react';
import AdminSidebar from "./components/AdminSidebar";
import ContentManagementView from './views/Contentmgmtview';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';
import { useAlumniType } from "./contexts/AlumniTypeContext";

// ============================ CONSTANTS ============================
const TABS = [
  { id: "events",         label: "Events" },
  { id: "announcements",  label: "Announcements" },
  { id: "jobs",           label: "Jobs" },
  { id: "discounts",      label: "Discounts" },
  { id: "rewards",        label: "Rewards" },
  { id: "landingpage",    label: "Landing Page" },
  { id: "disclosurepage", label: "User Notification/Disclosure" },
];

const SHS_TABS = [
  { id: "events",         label: "Events" },
  { id: "announcements",  label: "Announcements" },
  { id: "discounts",      label: "Discounts" },
  { id: "rewards",        label: "Rewards" },
  { id: "landingpage",    label: "Landing Page" },
  { id: "disclosurepage", label: "User Notification/Disclosure" },
];

// ============================ MAIN COMPONENT ============================
function ContentManagement() {
  const { alumniType } = useAlumniType();

  // ============================ STATE DECLARATIONS ============================
  const [activeTab, setActiveTab] = useState("events");
  const [showArchive, setShowArchive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingItem, setEditingItem] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmAction, setConfirmAction] = useState(null);

  // Data states
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [landingSections, setLandingSections] = useState([]);

  // Disclosure — mirrors the single-row `disclosures` table (id = 1).
  // null means the row doesn't exist yet (first-run state).
  // DisclosureModal falls back to DEFAULT_TOS / DEFAULT_PP when null.
  const [disclosure, setDisclosure] = useState(null);
  const [disclosureModalOpen, setDisclosureModalOpen] = useState(false);
  // 'tos' | 'pp' | null — controls which document the modal opens to
  const [disclosureInitialEditing, setDisclosureInitialEditing] = useState(null);

  // ============================ HELPER FUNCTIONS ============================
  const showToastMessage = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Strips all HTML markup and returns trimmed plain text.
  // Prevents `<p><br></p>` and similar empty-looking rich-text from
  // passing non-empty validation in handleDisclosureUpdate.
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  };

  const resolveImages = (formData, existingUrls = []) => {
  const urls = Array.isArray(formData.image_urls) ? formData.image_urls : null;
  const finalUrls = urls && urls.length > 0 ? urls : existingUrls;
  return {
    image_urls: finalUrls,
    image_url: finalUrls.length > 0 ? finalUrls[0] : null,
  };
};

  // ============================ SUPABASE FETCH FUNCTIONS ============================
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (!error) setEvents(data || []);
    return data || [];
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('published_at', { ascending: false });
    if (!error) setAnnouncements(data || []);
    return data || [];
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('posted_at', { ascending: false });
    if (!error) setJobs(data || []);
    return data || [];
  };

  const fetchDiscounts = async () => {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setDiscounts(data || []);
    return data || [];
  };

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('points_required', { ascending: true });
    if (!error) setRewards(data || []);
    return data || [];
  };

  const fetchLandingSections = async () => {
    const { data, error } = await supabase
      .from('landing_sections')
      .select('*')
      .order('order_index', { ascending: true });
    if (!error) setLandingSections(data || []);
    return data || [];
  };

  // maybeSingle() returns null (not an error) when no row exists yet.
  // A missing row is a normal first-run state — we never surface it as
  // an error toast. The UI degrades gracefully to DEFAULT_TOS / DEFAULT_PP.
  const fetchDisclosure = async () => {
    const { data, error } = await supabase
      .from('disclosures')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) {
      // Log only — not actionable for the admin.
      console.warn('[DISCLOSURE] fetch warning:', error.message);
      return;
    }
    if (data) setDisclosure(data);
    // Row absent → disclosure stays null, modal uses defaults.
  };

  const fetchAllContent = async () => {
    setLoading(true);
    await Promise.all([
      fetchEvents(),
      fetchAnnouncements(),
      fetchJobs(),
      fetchDiscounts(),
      fetchRewards(),
      fetchLandingSections(),
      fetchDisclosure(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  // ============================ DERIVED STATE ============================
  const activeEvents          = events.filter(e => e.is_active !== false);
  const activeAnnouncements   = announcements.filter(a => a.is_active !== false);
  const activeJobs            = jobs.filter(j => j.is_active !== false);
  const activeDiscounts       = discounts.filter(d => d.is_active !== false);
  const activeRewards         = rewards.filter(r => r.is_active !== false);
  const activeLandingSections = landingSections.filter(l => l.is_active !== false);

  const getActiveItems = () => {
    switch (activeTab) {
      case 'events':        return activeEvents;
      case 'announcements': return activeAnnouncements;
      case 'jobs':          return activeJobs;
      case 'discounts':     return activeDiscounts;
      case 'rewards':       return activeRewards;
      case 'landingpage':   return activeLandingSections;
      default:              return [];
    }
  };

  // ============================ ARCHIVED ITEMS ============================
  const getArchivedItems = () => {
    const archived = [];

    // DRY helper — pushes archived rows from any collection into the result.
    const push = (items, type, descField) =>
      items
        .filter(i => i.is_active === false)
        .forEach(i => archived.push({
          id:          i.id,
          type,
          title:       i.title,
          dateLabel:   `Archived: ${i.archived_at ? new Date(i.archived_at).toLocaleDateString() : 'Unknown date'}`,
          description: (i[descField]?.substring(0, 100) ?? '') + (i[descField]?.length > 100 ? '...' : ''),
          createdBy:   'Admin',
        }));

    push(events,          'Event',           'description');
    push(announcements,   'Announcement',    'content');
    push(jobs,            'Job',             'description');
    push(discounts,       'Discount',        'description');
    push(rewards,         'Reward',          'description');
    push(landingSections, 'Landing Section', 'description');

    return archived;
  };

  // ============================ MODAL HANDLERS ============================
  const openCreate = () => {
    setModalMode("create");
    setEditingItem(null);
    setEditingSection(null);
    setModalOpen(true);
  };

  // Switches to the correct tab so the right modal always mounts.
  // Needed when editing from the archive panel or any cross-tab context.
  const openEdit = (item, type) => {
    setModalMode("edit");
    setEditingItem(item);
    if (type) setActiveTab(type);
    setEditingSection(null);
    setModalOpen(true);
  };

  const openEditSection = (section) => {
    setModalMode("edit");
    setEditingSection(section);
    setEditingItem(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setEditingSection(null);
  };

  // ── Disclosure modal ──────────────────────────────────────────────────────
  // which: 'tos' | 'pp' — controls which document the modal opens to.
  // Passing null is safe but DisclosureModal returns null early in that case.
  const openDisclosureModal = (which = null) => {
    setDisclosureInitialEditing(which);
    setDisclosureModalOpen(true);
  };

  const closeDisclosureModal = () => {
    setDisclosureModalOpen(false);
    setDisclosureInitialEditing(null);
  };

  // ============================ CREATE HANDLERS ============================

  const handleCreateEvent = async (formData) => {
    console.log('[CREATE] Event formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      if (!formData.title?.trim()) { showToastMessage('Event title is required', 'error'); return; }
      if (!formData.date)          { showToastMessage('Event date is required', 'error'); return; }

      const eventDate = formData.startTime
        ? new Date(`${formData.date}T${formData.startTime}`)
        : new Date(formData.date);

       if (isNaN(eventDate.getTime())) { showToastMessage('Invalid date format', 'error'); return; }

      const { image_urls, image_url } = resolveImages(formData);

      const newEvent = {
        title:       formData.title.trim(),
        description: formData.description || '',
        event_date:  eventDate.toISOString(),
        location:    formData.location?.trim() || '',
        category:    formData.category || 'Upcoming Events',
        image_url,
        image_urls,
        created_by:  user?.id,
        is_active:   true,
      };


      const { data, error } = await supabase.from('events').insert([newEvent]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Events', description: `Created event: ${formData.title}`, recordId: data[0]?.id, status: 'Success' });
      await fetchEvents();
      closeModal();
      showToastMessage('Event created successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to create event: ' + error.message, 'error');
    }
  };

  const handleCreateAnnouncement = async (formData) => {
    console.log('[CREATE] Announcement formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      const title = formData.title?.trim();
      if (!title) { showToastMessage('Announcement title is required', 'error'); return; }

      let category = 'Activities';
      if (formData.priority === 'High')        category = 'News';
      else if (formData.priority === 'Medium') category = 'Updates';

      const { image_urls, image_url } = resolveImages(formData);

      const newAnnouncement = {
        title,
        content:      formData.content || '',
        author_id:    user?.id,
        category,
        image_url,
        image_urls,
        published_at: new Date().toISOString(),
        is_active:    true,
      };

      const { data, error } = await supabase.from('announcements').insert([newAnnouncement]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Announcements', description: `Created announcement: ${title}`, recordId: data[0]?.id, status: 'Success' });
      await fetchAnnouncements();
      closeModal();
      showToastMessage('Announcement created successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to create announcement: ' + error.message, 'error');
    }
  };

  const handleCreateJob = async (formData) => {
    console.log('[CREATE] Job formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      if (!formData.title?.trim())   { showToastMessage('Job title is required', 'error'); return; }
      if (!formData.company?.trim()) { showToastMessage('Company name is required', 'error'); return; }

      let tags = [];
      if (Array.isArray(formData.tags)) tags = formData.tags;
      else if (typeof formData.tags === 'string') tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      const { image_urls, image_url } = resolveImages(formData);

      const newJob = {
        title:       formData.title.trim(),
        company:     formData.company.trim(),
        description: formData.description || '',
        location:    formData.location?.trim() || 'Remote',
        category:    formData.category || 'Full-time',
        tags,
        image_url,
        image_urls,
        posted_by:   user?.id,
        posted_at:   new Date().toISOString(),
        expires_at:  formData.expiry ? new Date(formData.expiry).toISOString() : null,
        is_active:   true,
      };


      const { data, error } = await supabase.from('jobs').insert([newJob]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Jobs', description: `Created job: ${formData.title} at ${formData.company}`, recordId: data[0]?.id, status: 'Success' });
      await fetchJobs();
      closeModal();
      showToastMessage('Job created successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to create job: ' + error.message, 'error');
    }
  };

  const handleCreateDiscount = async (formData) => {
    console.log('[CREATE] Discount formData received:', formData);
    try {
      if (!formData.title?.trim())   { showToastMessage('Discount title is required', 'error'); return; }
      if (!formData.company?.trim()) { showToastMessage('Company name is required', 'error'); return; }

      const { image_urls, image_url } = resolveImages(formData);

      const newDiscount = {
        title:         formData.title.trim(),
        description:   formData.description || '',
        company:       formData.company.trim(),
        discount_code: formData.discountCode?.trim() || null,
        image_url,
        image_urls,
        created_at:    new Date().toISOString(),
        valid_until:   formData.expiry ? new Date(formData.expiry).toISOString() : null,
        is_active:     true,
      };

      const { data, error } = await supabase.from('discounts').insert([newDiscount]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Discounts', description: `Created discount: ${formData.title} from ${formData.company}`, recordId: data[0]?.id, status: 'Success' });
      await fetchDiscounts();
      closeModal();
      showToastMessage('Discount created successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to create discount: ' + error.message, 'error');
    }
  };

  const handleCreateReward = async (formData) => {
    console.log('[CREATE] Reward formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      if (!formData.title?.trim())     { showToastMessage('Reward title is required', 'error'); return; }
      if (!formData.points_required)   { showToastMessage('Points required is required', 'error'); return; }

      const { image_urls, image_url } = resolveImages(formData);

      const newReward = {
        title:           formData.title.trim(),
        points_required: formData.points_required,
        description:     formData.description || '',
        category:        formData.category || 'Apparel',
        stock:           formData.stock ?? null,
        image_url,
        image_urls,
        created_by:      user?.id,
        created_at:      new Date().toISOString(),
        is_active:       true,
      };

      const { data, error } = await supabase.from('rewards').insert([newReward]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Rewards', description: `Created reward: ${formData.title}`, recordId: data[0]?.id, status: 'Success' });
      await fetchRewards();
      closeModal();
      showToastMessage('Reward added successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to add reward: ' + error.message, 'error');
    }
  };

  const handleCreateLandingSection = async (formData) => {
    console.log('[CREATE] Landing Section formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      if (!formData.title?.trim())  { showToastMessage('Section title is required', 'error'); return; }
      if (!formData.section_type)   { showToastMessage('Section type is required', 'error'); return; }

      const { image_urls, image_url } = resolveImages(formData);
      
      const newSection = {
        title:        formData.title.trim(),
        description:  formData.description || '',
        section_type: formData.section_type,
        content:      formData.content || '',
        image_url,
        image_urls,
        order_index:  landingSections.length,
        created_at:   new Date().toISOString(),
        updated_at:   new Date().toISOString(),
        is_active:    true,
        created_by:   user?.id,
      };

      const { data, error } = await supabase.from('landing_sections').insert([newSection]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Landing Page', description: `Created landing section: ${formData.title}`, recordId: data[0]?.id, status: 'Success' });
      await fetchLandingSections();
      closeModal();
      showToastMessage('Landing section created successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to create landing section: ' + error.message, 'error');
    }
  };

  // ============================ UPDATE HANDLERS ============================

  const handleUpdateEvent = async (id, formData) => {
    console.log('[UPDATE] Event - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      let eventDate;
      if (formData.startTime)  eventDate = new Date(`${formData.date}T${formData.startTime}`);
      else if (formData.date)  eventDate = new Date(formData.date);

      const { image_urls, image_url } = resolveImages(formData, editingItem?.image_urls ?? []);

      const updates = {
        title:       formData.title?.trim(),
        description: formData.description || '',
        location:    formData.location?.trim() || '',
        category:    formData.category || 'Upcoming Events',
        image_url,
        image_urls,
        updated_at:  new Date().toISOString(),
      };

      if (eventDate && !isNaN(eventDate.getTime())) updates.event_date = eventDate.toISOString();
      if (!updates.title) { showToastMessage('Event title is required', 'error'); return; }

      const { error } = await supabase.from('events').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Events', description: `Updated event: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchEvents();
      closeModal();
      showToastMessage('Event updated successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to update event: ' + error.message, 'error');
    }
  };

  const handleUpdateAnnouncement = async (id, formData) => {
    console.log('[UPDATE] Announcement - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      const { image_urls, image_url } = resolveImages(formData, editingItem?.image_urls ?? []);

      const updates = {
        title:      formData.title?.trim(),
        content:    formData.content || '',
        image_url,
        image_urls,
        updated_at: new Date().toISOString(),
      };


      if (!updates.title) { showToastMessage('Announcement title is required', 'error'); return; }

      const { error } = await supabase.from('announcements').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Announcements', description: `Updated announcement: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchAnnouncements();
      closeModal();
      showToastMessage('Announcement updated successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to update announcement: ' + error.message, 'error');
    }
  };

  const handleUpdateJob = async (id, formData) => {
    console.log('[UPDATE] Job - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      let tags = [];
      if (Array.isArray(formData.tags)) tags = formData.tags;
      else if (typeof formData.tags === 'string') tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      const { image_urls, image_url } = resolveImages(formData, editingItem?.image_urls ?? []);

      const updates = {
        title:       formData.title?.trim(),
        company:     formData.company?.trim(),
        description: formData.description || '',
        location:    formData.location?.trim() || 'Remote',
        category:    formData.category || 'Full-time',
        tags,
        image_url,
        image_urls,
        expires_at:  formData.expiry ? new Date(formData.expiry).toISOString() : null,
        updated_at:  new Date().toISOString(),
      };

      if (!updates.title)   { showToastMessage('Job title is required', 'error'); return; }
      if (!updates.company) { showToastMessage('Company name is required', 'error'); return; }

      const { error } = await supabase.from('jobs').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Jobs', description: `Updated job: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchJobs();
      closeModal();
      showToastMessage('Job updated successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to update job: ' + error.message, 'error');
    }
  };

  const handleUpdateDiscount = async (id, formData) => {
    console.log('[UPDATE] Discount - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      const { image_urls, image_url } = resolveImages(formData, editingItem?.image_urls ?? []);

      const updates = {
        title:         formData.title?.trim(),
        description:   formData.description || '',
        company:       formData.company?.trim(),
        discount_code: formData.discountCode?.trim() || null,
        image_url,
        image_urls,
        valid_until:   formData.expiry ? new Date(formData.expiry).toISOString() : null,
        updated_at:    new Date().toISOString(),
      };

      if (!updates.title)   { showToastMessage('Discount title is required', 'error'); return; }
      if (!updates.company) { showToastMessage('Company name is required', 'error'); return; }

      const { error } = await supabase.from('discounts').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Discounts', description: `Updated discount: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchDiscounts();
      closeModal();
      showToastMessage('Discount updated successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to update discount: ' + error.message, 'error');
    }
  };

  const handleUpdateReward = async (id, formData) => {
    console.log('[UPDATE] Reward - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      if (!formData.title?.trim())   { showToastMessage('Reward title is required', 'error'); return; }
      if (!formData.points_required) { showToastMessage('Points required is required', 'error'); return; }

      const { image_urls, image_url } = resolveImages(formData, editingItem?.image_urls ?? []);

      const updates = {
        title:           formData.title.trim(),
        points_required: formData.points_required,
        description:     formData.description || '',
        category:        formData.category || 'Apparel',
        stock:           formData.stock ?? null,
        image_url,
        image_urls,
        updated_at:      new Date().toISOString(),
      };

      const { error } = await supabase.from('rewards').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Rewards', description: `Updated reward: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchRewards();
      closeModal();
      showToastMessage('Reward updated successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to update reward: ' + error.message, 'error');
    }
  };

  const handleUpdateLandingSection = async (id, formData) => {
    console.log('[UPDATE] Landing Section - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      const { image_urls, image_url } = resolveImages(formData, editingItem?.image_urls ?? []);

      const updates = {
        title:        formData.title?.trim(),
        description:  formData.description || '',
        section_type: formData.section_type,
        content:      formData.content || '',
        image_url,
        image_urls,
        updated_at:   new Date().toISOString(),
      };

      if (!updates.title)        { showToastMessage('Section title is required', 'error'); return; }
      if (!updates.section_type) { showToastMessage('Section type is required', 'error'); return; }

      const { error } = await supabase.from('landing_sections').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Landing Page', description: `Updated landing section: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchLandingSections();
      closeModal();
      showToastMessage('Landing section updated successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to update landing section: ' + error.message, 'error');
    }
  };

  // ============================ DISCLOSURE UPDATE (UPSERT) ============================
  // Architectural pattern:
  //   1. Validate  — stripHtml rejects blank rich-text markup
  //   2. Upsert    — always writes both columns so no column is left stale
  //   3. Stamp     — updated_at set explicitly (no DB trigger dependency)
  //   4. Log       — logAction for audit trail
  //   5. Refresh   — fetchDisclosure keeps local state in sync with DB
  //   6. Close     — closeDisclosureModal called on success only
  //
  // Singleton pattern: disclosures table has exactly one row (id = 1).
  // upsert with onConflict:'id' creates it on first save, updates thereafter.
  const handleDisclosureUpdate = async ({ tos_content, pp_content }) => {
    console.log('[DISCLOSURE] Upserting disclosure row id=1');

    if (!stripHtml(tos_content)) {
      showToastMessage('Terms of Service content cannot be empty.', 'error');
      return;
    }
    if (!stripHtml(pp_content)) {
      showToastMessage('Privacy Policy content cannot be empty.', 'error');
      return;
    }

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('disclosures')
        .upsert(
          { id: 1, tos_content, pp_content, updated_at: now },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('[DISCLOSURE] Supabase error:', error);
        showToastMessage(`Failed to save: ${error.message}`, 'error');
        return;
      }

      console.log('[DISCLOSURE] Upsert success');

      await logAction({
        action:      'Update',
        module:      'Disclosure',
        description: 'Updated Terms of Service and Privacy Policy',
        recordId:    1,
        status:      'Success',
      });

      await fetchDisclosure();
      closeDisclosureModal();
      showToastMessage('Disclosure content saved successfully!', 'success');

    } catch (err) {
      console.error('[DISCLOSURE] Unexpected error:', err);
      showToastMessage('Failed to save disclosure: ' + err.message, 'error');
    }
  };

  // ============================ TOGGLE ACTIVE (SHOW / HIDE) ============================
  // Distinct from archive: flips is_active without touching archived_at.
  // Used by the Show/Hide button on LandingSectionCard so admins can
  // temporarily hide a section from the public page without archiving it.
  // The real-time subscription on LandingPage.js picks up the change
  // automatically so the public view updates without a page reload.
  const handleToggleActive = async (type, id, currentState) => {
    console.log('[TOGGLE] Type:', type, 'ID:', id, 'currentState:', currentState);

    const tableMap  = {
      events:        'events',
      announcements: 'announcements',
      jobs:          'jobs',
      discounts:     'discounts',
      rewards:       'rewards',
      landingpage:   'landing_sections',
    };
    const moduleMap = {
      events:        'Events',
      announcements: 'Announcements',
      jobs:          'Jobs',
      discounts:     'Discounts',
      rewards:       'Rewards',
      landingpage:   'Landing Page',
    };

    const table = tableMap[type];
    if (!table) { showToastMessage('Unknown content type', 'error'); return; }

    try {
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentState, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) { showToastMessage(`Failed to update visibility: ${error.message}`, 'error'); return; }

      await logAction({
        action:      'Update',
        module:      moduleMap[type],
        description: `Set ${type} id ${id} visibility to ${!currentState ? 'visible' : 'hidden'}`,
        recordId:    id,
        status:      'Success',
      });

      await fetchAllContent();
      showToastMessage(
        !currentState
          ? 'Section is now visible on the landing page.'
          : 'Section hidden from the landing page.',
        'success'
      );
    } catch (error) {
      showToastMessage('Failed to update visibility: ' + error.message, 'error');
    }
  };

  // ============================ ARCHIVE & RESTORE ============================

  const handleArchive = async (type, id) => {
    console.log('[ARCHIVE] Type:', type, 'ID:', id);
    try {
      if (!id) { showToastMessage('Cannot archive: Missing record ID', 'error'); return; }

      // DRY map — single source of truth for table + module + data list
      const META = {
        events:        { table: 'events',           module: 'Events',        data: events },
        announcements: { table: 'announcements',    module: 'Announcements', data: announcements },
        jobs:          { table: 'jobs',             module: 'Jobs',          data: jobs },
        discounts:     { table: 'discounts',        module: 'Discounts',     data: discounts },
        rewards:       { table: 'rewards',          module: 'Rewards',       data: rewards },
        landingpage:   { table: 'landing_sections', module: 'Landing Page',  data: landingSections },
      };

      const entry = META[type];
      if (!entry) { showToastMessage('Unknown content type', 'error'); return; }

      const { table, module: moduleName, data: list } = entry;
      const itemTitle = list.find(i => i.id === id)?.title || String(id);

      const { error } = await supabase
        .from(table)
        .update({
          is_active:   false,
          archived_at: new Date().toISOString(),
          updated_at:  new Date().toISOString(),
        })
        .eq('id', id);

      if (error) { showToastMessage(`Failed to archive: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Archive', module: moduleName, description: `Archived ${type.slice(0, -1)}: ${itemTitle}`, recordId: id, status: 'Success' });
      await fetchAllContent();
      showToastMessage('Item archived successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to archive item: ' + error.message, 'error');
    }
  };

  // FIX: removed restored_at from the update payload — that column does not
  // exist in the schema. The restore is tracked via logAction + updated_at.
  const handleRestore = async (type, id) => {
    console.log('[RESTORE] Type:', type, 'ID:', id);
    try {
      if (!id) { showToastMessage('Cannot restore: Missing record ID', 'error'); return; }

      const META = {
        'Event':           { table: 'events',           module: 'Event' },
        'Announcement':    { table: 'announcements',    module: 'Announcement' },
        'Job':             { table: 'jobs',             module: 'Job' },
        'Discount':        { table: 'discounts',        module: 'Discount' },
        'Reward':          { table: 'rewards',          module: 'Reward' },
        'Landing Section': { table: 'landing_sections', module: 'Landing Section' },
      };

      const entry = META[type];
      if (!entry) { showToastMessage('Unknown content type', 'error'); return; }

      const { table, module: moduleName } = entry;

      const { error } = await supabase
        .from(table)
        .update({
          is_active:  true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) { showToastMessage(`Failed to restore: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: moduleName, description: `Restored ${type.toLowerCase()}: ${id}`, recordId: id, status: 'Success' });
      await fetchAllContent();
      setShowArchive(false);
      showToastMessage('Item restored successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to restore item: ' + error.message, 'error');
    }
  };

  // ============================ CONFIRMATION DIALOG ============================
  const showConfirm = (label, description, confirmText, confirmColor, onConfirm) => {
    setConfirmAction({ label, description, confirmText, confirmColor, onConfirm });
  };

  const closeConfirm = () => setConfirmAction(null);

  // ============================ RENDER ============================
  return (
    <ContentManagementView
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      showArchive={showArchive}
      setShowArchive={setShowArchive}
      modalOpen={modalOpen}
      modalMode={modalMode}
      editingItem={editingItem}
      editingSection={editingSection}
      loading={loading}
      toast={toast}
      confirmAction={confirmAction}
      TABS={alumniType === 'shs' ? SHS_TABS : TABS}
      alumniType={alumniType}
      activeItems={getActiveItems()}
      archivedItems={getArchivedItems()}
      landingSections={activeLandingSections}
      announcements={activeAnnouncements}
      // ── Disclosure ────────────────────────────────────────────────────────
      disclosure={disclosure}
      disclosureModalOpen={disclosureModalOpen}
      disclosureInitialEditing={disclosureInitialEditing}
      onOpenDisclosureModal={openDisclosureModal}
      onCloseDisclosureModal={closeDisclosureModal}
      onDisclosureUpdate={handleDisclosureUpdate}
      // ── CRUD ──────────────────────────────────────────────────────────────
      onOpenCreate={openCreate}
      onOpenEdit={openEdit}
      onOpenEditSection={openEditSection}
      onCloseModal={closeModal}
      onCloseConfirm={closeConfirm}
      onCreateEvent={handleCreateEvent}
      onUpdateEvent={handleUpdateEvent}
      onCreateAnnouncement={handleCreateAnnouncement}
      onUpdateAnnouncement={handleUpdateAnnouncement}
      onCreateJob={handleCreateJob}
      onUpdateJob={handleUpdateJob}
      onCreateDiscount={handleCreateDiscount}
      onUpdateDiscount={handleUpdateDiscount}
      onCreateReward={handleCreateReward}
      onUpdateReward={handleUpdateReward}
      onCreateLandingSection={handleCreateLandingSection}
      onUpdateLandingSection={handleUpdateLandingSection}
      onArchive={handleArchive}
      onRestore={handleRestore}
      onToggleActive={handleToggleActive}
      onShowConfirm={showConfirm}
      sidebar={<AdminSidebar />}
    />
  );
}

export default ContentManagement;