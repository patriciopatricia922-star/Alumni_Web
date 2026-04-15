// ============================================================================
// THIS IS FOR LOGIC.
// ============================================================================
// Purpose: Handles all business logic, Supabase API calls, data processing,
//          state management, and event handlers for Content Management.
// ============================================================================

import React, { useState, useEffect } from 'react';
import AdminSidebar from "./components/AdminSidebar";
import ContentManagementView from './views/Contentmgmtview';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';

// ============================ CONSTANTS ============================
const TABS = [
  { id: "events", label: "Events" },
  { id: "announcements", label: "Announcements" },
  { id: "jobs", label: "Jobs" },
  { id: "discounts", label: "Discounts" },
  { id: "landingpage", label: "Landing Page" },
];

// ============================ MAIN COMPONENT ============================
function ContentManagement() {
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
  const [landingSections, setLandingSections] = useState([]);

  // ============================ HELPER FUNCTIONS ============================
  const showToastMessage = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
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

  const fetchLandingSections = async () => {
    const { data, error } = await supabase
      .from('landing_sections')
      .select('*')
      .order('order_index', { ascending: true });
    if (!error) setLandingSections(data || []);
    return data || [];
  };

  const fetchAllContent = async () => {
    setLoading(true);
    await Promise.all([
      fetchEvents(),
      fetchAnnouncements(),
      fetchJobs(),
      fetchDiscounts(),
      fetchLandingSections(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  // ============================ ARCHIVE ITEMS ============================
  const getArchivedItems = () => {
    const archived = [];
    
    events.filter(e => e.is_active === false).forEach(e => {
      archived.push({
        id: e.id,
        type: 'Event',
        title: e.title,
        dateLabel: `Archived: ${e.archived_at ? new Date(e.archived_at).toLocaleDateString() : 'Unknown date'}`,
        description: e.description?.substring(0, 100) + (e.description?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    announcements.filter(a => a.is_active === false).forEach(a => {
      archived.push({
        id: a.id,
        type: 'Announcement',
        title: a.title,
        dateLabel: `Archived: ${a.archived_at ? new Date(a.archived_at).toLocaleDateString() : 'Unknown date'}`,
        description: a.content?.substring(0, 100) + (a.content?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    jobs.filter(j => j.is_active === false).forEach(j => {
      archived.push({
        id: j.id,
        type: 'Job',
        title: j.title,
        dateLabel: `Archived: ${j.archived_at ? new Date(j.archived_at).toLocaleDateString() : 'Unknown date'}`,
        description: j.description?.substring(0, 100) + (j.description?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    discounts.filter(d => d.is_active === false).forEach(d => {
      archived.push({
        id: d.id,
        type: 'Discount',
        title: d.title,
        dateLabel: `Archived: ${d.archived_at ? new Date(d.archived_at).toLocaleDateString() : 'Unknown date'}`,
        description: d.description?.substring(0, 100) + (d.description?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    landingSections.filter(l => l.is_active === false).forEach(l => {
      archived.push({
        id: l.id,
        type: 'Landing Section',
        title: l.title,
        dateLabel: `Archived: ${l.archived_at ? new Date(l.archived_at).toLocaleDateString() : 'Unknown date'}`,
        description: l.description?.substring(0, 100) + (l.description?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    return archived;
  };

  // ============================ ACTIVE ITEMS ============================
  const activeEvents = events.filter(e => e.is_active !== false);
  const activeAnnouncements = announcements.filter(a => a.is_active !== false);
  const activeJobs = jobs.filter(j => j.is_active !== false);
  const activeDiscounts = discounts.filter(d => d.is_active !== false);
  const activeLandingSections = landingSections.filter(l => l.is_active !== false);

  const getActiveItems = () => {
    switch (activeTab) {
      case 'events': return activeEvents;
      case 'announcements': return activeAnnouncements;
      case 'jobs': return activeJobs;
      case 'discounts': return activeDiscounts;
      case 'landingpage': return activeLandingSections;
      default: return [];
    }
  };

  // ============================ MODAL HANDLERS ============================
  const openCreate = () => {
    setModalMode("create");
    setEditingItem(null);
    setEditingSection(null);
    setModalOpen(true);
  };

  const openEdit = (item, type) => {
    setModalMode("edit");
    setEditingItem(item);
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

  // ============================ CREATE HANDLERS ============================
  
  const handleCreateEvent = async (formData) => {
    console.log('[CREATE] Event formData received:', formData);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[CREATE] Auth error:', userError);
        showToastMessage('Authentication error. Please log in again.', 'error');
        return;
      }
      
      if (!formData.title?.trim()) {
        showToastMessage('Event title is required', 'error');
        return;
      }
      if (!formData.date) {
        showToastMessage('Event date is required', 'error');
        return;
      }
      
      let eventDate;
      if (formData.startTime) {
        eventDate = new Date(`${formData.date}T${formData.startTime}`);
      } else {
        eventDate = new Date(formData.date);
      }
      
      if (isNaN(eventDate.getTime())) {
        showToastMessage('Invalid date format', 'error');
        return;
      }
      
      const newEvent = {
        title: formData.title.trim(),
        description: formData.description || '',
        event_date: eventDate.toISOString(),
        location: formData.location?.trim() || '',
        category: formData.category || 'Upcoming Events',
        image_url: formData.image_url || null,
        created_by: user?.id,
        is_active: true,
      };
      
      console.log('[CREATE] Inserting event:', newEvent);
      
      const { data, error } = await supabase
        .from('events')
        .insert([newEvent])
        .select();
      
      if (error) {
        console.error('[CREATE] Supabase error:', error);
        showToastMessage(`Failed to create: ${error.message}`, 'error');
        return;
      }
      
      console.log('[CREATE] Success! Response:', data);
      
      await logAction({
        action: 'Create',
        module: 'Events',
        description: `Created event: ${formData.title}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchEvents();
      closeModal();
      showToastMessage('Event created successfully!', 'success');
      
    } catch (error) {
      console.error('[CREATE] Unexpected error:', error);
      showToastMessage('Failed to create event: ' + error.message, 'error');
    }
  };

  const handleCreateAnnouncement = async (formData) => {
    console.log('[CREATE] Announcement formData received:', formData);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[CREATE] Auth error:', userError);
        showToastMessage('Authentication error. Please log in again.', 'error');
        return;
      }
      
      let category = 'Activities';
      if (formData.priority === 'High') category = 'News';
      else if (formData.priority === 'Medium') category = 'Updates';
      
      const newAnnouncement = {
        title: formData.title?.trim(),
        content: formData.content || '',
        author_id: user?.id,
        category: category,
        published_at: new Date().toISOString(),
        is_active: true,
      };
      
      if (!newAnnouncement.title) {
        showToastMessage('Announcement title is required', 'error');
        return;
      }
      
      console.log('[CREATE] Inserting announcement:', newAnnouncement);
      
      const { data, error } = await supabase
        .from('announcements')
        .insert([newAnnouncement])
        .select();
      
      if (error) {
        console.error('[CREATE] Supabase error:', error);
        showToastMessage(`Failed to create: ${error.message}`, 'error');
        return;
      }
      
      console.log('[CREATE] Success! Response:', data);
      
      await logAction({
        action: 'Create',
        module: 'Announcements',
        description: `Created announcement: ${formData.title}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchAnnouncements();
      closeModal();
      showToastMessage('Announcement created successfully!', 'success');
      
    } catch (error) {
      console.error('[CREATE] Unexpected error:', error);
      showToastMessage('Failed to create announcement: ' + error.message, 'error');
    }
  };

  const handleCreateJob = async (formData) => {
    console.log('[CREATE] Job formData received:', formData);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[CREATE] Auth error:', userError);
        showToastMessage('Authentication error. Please log in again.', 'error');
        return;
      }
      
      if (!formData.title?.trim()) {
        showToastMessage('Job title is required', 'error');
        return;
      }
      if (!formData.company?.trim()) {
        showToastMessage('Company name is required', 'error');
        return;
      }
      
      let tags = [];
      if (formData.tags) {
        if (Array.isArray(formData.tags)) {
          tags = formData.tags;
        } else if (typeof formData.tags === 'string') {
          tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        }
      }
      
      const newJob = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        description: formData.description || '',
        location: formData.location?.trim() || 'Remote',
        category: formData.category || 'Full-time',
        tags: tags,
        image_url: formData.image_url || null,
        posted_by: user?.id,
        posted_at: new Date().toISOString(),
        expires_at: formData.expiry ? new Date(formData.expiry).toISOString() : null,
        is_active: true,
      };
      
      console.log('[CREATE] Inserting job:', newJob);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert([newJob])
        .select();
      
      if (error) {
        console.error('[CREATE] Supabase error:', error);
        showToastMessage(`Failed to create: ${error.message}`, 'error');
        return;
      }
      
      console.log('[CREATE] Success! Response:', data);
      
      await logAction({
        action: 'Create',
        module: 'Jobs',
        description: `Created job: ${formData.title} at ${formData.company}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchJobs();
      closeModal();
      showToastMessage('Job created successfully!', 'success');
      
    } catch (error) {
      console.error('[CREATE] Unexpected error:', error);
      showToastMessage('Failed to create job: ' + error.message, 'error');
    }
  };

  const handleCreateDiscount = async (formData) => {
    console.log('[CREATE] Discount formData received:', formData);
    
    try {
      if (!formData.title?.trim()) {
        showToastMessage('Discount title is required', 'error');
        return;
      }
      if (!formData.company?.trim()) {
        showToastMessage('Company name is required', 'error');
        return;
      }
      
      const newDiscount = {
        title: formData.title.trim(),
        description: formData.description || '',
        company: formData.company.trim(),
        discount_code: formData.discountCode?.trim() || null,
        image_url: formData.image_url || null,
        created_at: new Date().toISOString(),
        valid_until: formData.expiry ? new Date(formData.expiry).toISOString() : null,
        is_active: true,
      };
      
      console.log('[CREATE] Inserting discount:', newDiscount);
      
      const { data, error } = await supabase
        .from('discounts')
        .insert([newDiscount])
        .select();
      
      if (error) {
        console.error('[CREATE] Supabase error:', error);
        showToastMessage(`Failed to create: ${error.message}`, 'error');
        return;
      }
      
      console.log('[CREATE] Success! Response:', data);
      
      await logAction({
        action: 'Create',
        module: 'Discounts',
        description: `Created discount: ${formData.title} from ${formData.company}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchDiscounts();
      closeModal();
      showToastMessage('Discount created successfully!', 'success');
      
    } catch (error) {
      console.error('[CREATE] Unexpected error:', error);
      showToastMessage('Failed to create discount: ' + error.message, 'error');
    }
  };

  const handleCreateLandingSection = async (formData) => {
    console.log('[CREATE] Landing Section formData received:', formData);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[CREATE] Auth error:', userError);
        showToastMessage('Authentication error. Please log in again.', 'error');
        return;
      }
      
      if (!formData.title?.trim()) {
        showToastMessage('Section title is required', 'error');
        return;
      }
      if (!formData.section_type) {
        showToastMessage('Section type is required', 'error');
        return;
      }
      
      const newSection = {
        title: formData.title.trim(),
        description: formData.description || '',
        section_type: formData.section_type,
        content: formData.content || '',
        image_url: formData.image_url || null,
        order_index: landingSections.length,
        created_at: new Date().toISOString(),
        is_active: true,
        created_by: user?.id,
      };
      
      console.log('[CREATE] Inserting landing section:', newSection);
      
      const { data, error } = await supabase
        .from('landing_sections')
        .insert([newSection])
        .select();
      
      if (error) {
        console.error('[CREATE] Supabase error:', error);
        showToastMessage(`Failed to create: ${error.message}`, 'error');
        return;
      }
      
      console.log('[CREATE] Success! Response:', data);
      
      await logAction({
        action: 'Create',
        module: 'Landing Page',
        description: `Created landing section: ${formData.title}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchLandingSections();
      closeModal();
      showToastMessage('Landing section created successfully!', 'success');
      
    } catch (error) {
      console.error('[CREATE] Unexpected error:', error);
      showToastMessage('Failed to create landing section: ' + error.message, 'error');
    }
  };

  // ============================ UPDATE HANDLERS ============================
  
  const handleUpdateEvent = async (id, formData) => {
    console.log('[UPDATE] Event - ID:', id, 'formData:', formData);
    
    try {
      if (!id) {
        console.error('[UPDATE] No ID provided');
        showToastMessage('Cannot update: Missing record ID', 'error');
        return;
      }
      
      let eventDate;
      if (formData.startTime) {
        eventDate = new Date(`${formData.date}T${formData.startTime}`);
      } else if (formData.date) {
        eventDate = new Date(formData.date);
      }
      
      const updates = {
        title: formData.title?.trim(),
        description: formData.description || '',
        location: formData.location?.trim() || '',
        category: formData.category || 'Upcoming Events',
        image_url: formData.image_url || null,
      };
      
      if (eventDate && !isNaN(eventDate.getTime())) {
        updates.event_date = eventDate.toISOString();
      }
      
      if (!updates.title) {
        showToastMessage('Event title is required', 'error');
        return;
      }
      
      console.log('[UPDATE] Applying updates:', updates);
      
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('[UPDATE] Supabase error:', error);
        showToastMessage(`Failed to update: ${error.message}`, 'error');
        return;
      }
      
      console.log('[UPDATE] Success!');
      
      await logAction({
        action: 'Update',
        module: 'Events',
        description: `Updated event: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchEvents();
      closeModal();
      showToastMessage('Event updated successfully!', 'success');
      
    } catch (error) {
      console.error('[UPDATE] Unexpected error:', error);
      showToastMessage('Failed to update event: ' + error.message, 'error');
    }
  };

  const handleUpdateAnnouncement = async (id, formData) => {
    console.log('[UPDATE] Announcement - ID:', id, 'formData:', formData);
    
    try {
      if (!id) {
        console.error('[UPDATE] No ID provided');
        showToastMessage('Cannot update: Missing record ID', 'error');
        return;
      }
      
      const updates = {
        title: formData.title?.trim(),
        content: formData.content || '',
      };
      
      if (!updates.title) {
        showToastMessage('Announcement title is required', 'error');
        return;
      }
      
      console.log('[UPDATE] Applying updates:', updates);
      
      const { error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('[UPDATE] Supabase error:', error);
        showToastMessage(`Failed to update: ${error.message}`, 'error');
        return;
      }
      
      console.log('[UPDATE] Success!');
      
      await logAction({
        action: 'Update',
        module: 'Announcements',
        description: `Updated announcement: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchAnnouncements();
      closeModal();
      showToastMessage('Announcement updated successfully!', 'success');
      
    } catch (error) {
      console.error('[UPDATE] Unexpected error:', error);
      showToastMessage('Failed to update announcement: ' + error.message, 'error');
    }
  };

  const handleUpdateJob = async (id, formData) => {
    console.log('[UPDATE] Job - ID:', id, 'formData:', formData);
    
    try {
      if (!id) {
        console.error('[UPDATE] No ID provided');
        showToastMessage('Cannot update: Missing record ID', 'error');
        return;
      }
      
      let tags = [];
      if (formData.tags) {
        if (Array.isArray(formData.tags)) {
          tags = formData.tags;
        } else if (typeof formData.tags === 'string') {
          tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        }
      }
      
      const updates = {
        title: formData.title?.trim(),
        company: formData.company?.trim(),
        description: formData.description || '',
        location: formData.location?.trim() || 'Remote',
        category: formData.category || 'Full-time',
        tags: tags,
        image_url: formData.image_url || null,
        expires_at: formData.expiry ? new Date(formData.expiry).toISOString() : null,
      };
      
      if (!updates.title) {
        showToastMessage('Job title is required', 'error');
        return;
      }
      if (!updates.company) {
        showToastMessage('Company name is required', 'error');
        return;
      }
      
      console.log('[UPDATE] Applying updates:', updates);
      
      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('[UPDATE] Supabase error:', error);
        showToastMessage(`Failed to update: ${error.message}`, 'error');
        return;
      }
      
      console.log('[UPDATE] Success!');
      
      await logAction({
        action: 'Update',
        module: 'Jobs',
        description: `Updated job: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchJobs();
      closeModal();
      showToastMessage('Job updated successfully!', 'success');
      
    } catch (error) {
      console.error('[UPDATE] Unexpected error:', error);
      showToastMessage('Failed to update job: ' + error.message, 'error');
    }
  };

  const handleUpdateDiscount = async (id, formData) => {
    console.log('[UPDATE] Discount - ID:', id, 'formData:', formData);
    
    try {
      if (!id) {
        console.error('[UPDATE] No ID provided');
        showToastMessage('Cannot update: Missing record ID', 'error');
        return;
      }
      
      const updates = {
        title: formData.title?.trim(),
        description: formData.description || '',
        company: formData.company?.trim(),
        discount_code: formData.discountCode?.trim() || null,
        image_url: formData.image_url || null,
        valid_until: formData.expiry ? new Date(formData.expiry).toISOString() : null,
      };
      
      if (!updates.title) {
        showToastMessage('Discount title is required', 'error');
        return;
      }
      if (!updates.company) {
        showToastMessage('Company name is required', 'error');
        return;
      }
      
      console.log('[UPDATE] Applying updates:', updates);
      
      const { error } = await supabase
        .from('discounts')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('[UPDATE] Supabase error:', error);
        showToastMessage(`Failed to update: ${error.message}`, 'error');
        return;
      }
      
      console.log('[UPDATE] Success!');
      
      await logAction({
        action: 'Update',
        module: 'Discounts',
        description: `Updated discount: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchDiscounts();
      closeModal();
      showToastMessage('Discount updated successfully!', 'success');
      
    } catch (error) {
      console.error('[UPDATE] Unexpected error:', error);
      showToastMessage('Failed to update discount: ' + error.message, 'error');
    }
  };

  const handleUpdateLandingSection = async (id, formData) => {
    console.log('[UPDATE] Landing Section - ID:', id, 'formData:', formData);
    
    try {
      if (!id) {
        console.error('[UPDATE] No ID provided');
        showToastMessage('Cannot update: Missing record ID', 'error');
        return;
      }
      
      const updates = {
        title: formData.title?.trim(),
        description: formData.description || '',
        section_type: formData.section_type,
        content: formData.content || '',
        image_url: formData.image_url || null,
      };
      
      if (!updates.title) {
        showToastMessage('Section title is required', 'error');
        return;
      }
      if (!updates.section_type) {
        showToastMessage('Section type is required', 'error');
        return;
      }
      
      console.log('[UPDATE] Applying updates:', updates);
      
      const { error } = await supabase
        .from('landing_sections')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('[UPDATE] Supabase error:', error);
        showToastMessage(`Failed to update: ${error.message}`, 'error');
        return;
      }
      
      console.log('[UPDATE] Success!');
      
      await logAction({
        action: 'Update',
        module: 'Landing Page',
        description: `Updated landing section: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchLandingSections();
      closeModal();
      showToastMessage('Landing section updated successfully!', 'success');
      
    } catch (error) {
      console.error('[UPDATE] Unexpected error:', error);
      showToastMessage('Failed to update landing section: ' + error.message, 'error');
    }
  };

  // ============================ ARCHIVE & RESTORE HANDLERS (WITH archived_at & restored_at) ============================
  
  const handleArchive = async (type, id) => {
    console.log('[ARCHIVE] Type:', type, 'ID:', id);
    
    try {
      if (!id) {
        console.error('[ARCHIVE] No ID provided');
        showToastMessage('Cannot archive: Missing record ID', 'error');
        return;
      }
      
      let table;
      let moduleName;
      let itemTitle = '';
      
      switch (type) {
        case 'events':
          table = 'events';
          moduleName = 'Events';
          const eventItem = events.find(e => e.id === id);
          itemTitle = eventItem?.title || id;
          break;
        case 'announcements':
          table = 'announcements';
          moduleName = 'Announcements';
          const announcementItem = announcements.find(a => a.id === id);
          itemTitle = announcementItem?.title || id;
          break;
        case 'jobs':
          table = 'jobs';
          moduleName = 'Jobs';
          const jobItem = jobs.find(j => j.id === id);
          itemTitle = jobItem?.title || id;
          break;
        case 'discounts':
          table = 'discounts';
          moduleName = 'Discounts';
          const discountItem = discounts.find(d => d.id === id);
          itemTitle = discountItem?.title || id;
          break;
        case 'landingpage':
          table = 'landing_sections';
          moduleName = 'Landing Page';
          const landingItem = landingSections.find(l => l.id === id);
          itemTitle = landingItem?.title || id;
          break;
        default:
          console.error('[ARCHIVE] Unknown type:', type);
          showToastMessage('Unknown content type', 'error');
          return;
      }
      
      console.log('[ARCHIVE] Setting is_active to false on table:', table, 'for ID:', id);
      
      const { error } = await supabase
        .from(table)
        .update({ 
          is_active: false,
          archived_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('[ARCHIVE] Supabase error:', error);
        showToastMessage(`Failed to archive: ${error.message}`, 'error');
        return;
      }
      
      console.log('[ARCHIVE] Success! Archived:', itemTitle);
      
      await logAction({
        action: 'Archive',
        module: moduleName,
        description: `Archived ${type.slice(0, -1)}: ${itemTitle}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchAllContent();
      showToastMessage('Item archived successfully!', 'success');
      
    } catch (error) {
      console.error('[ARCHIVE] Unexpected error:', error);
      showToastMessage('Failed to archive item: ' + error.message, 'error');
    }
  };

  const handleRestore = async (type, id) => {
    console.log('[RESTORE] Type:', type, 'ID:', id);
    
    try {
      if (!id) {
        console.error('[RESTORE] No ID provided');
        showToastMessage('Cannot restore: Missing record ID', 'error');
        return;
      }
      
      let table;
      let moduleName;
      
      switch (type) {
        case 'Event':
          table = 'events';
          moduleName = 'Event';
          break;
        case 'Announcement':
          table = 'announcements';
          moduleName = 'Announcement';
          break;
        case 'Job':
          table = 'jobs';
          moduleName = 'Job';
          break;
        case 'Discount':
          table = 'discounts';
          moduleName = 'Discount';
          break;
        case 'Landing Section':
          table = 'landing_sections';
          moduleName = 'Landing Section';
          break;
        default:
          console.error('[RESTORE] Unknown type:', type);
          showToastMessage('Unknown content type', 'error');
          return;
      }
      
      console.log('[RESTORE] Setting is_active to true on table:', table, 'for ID:', id);
      
      const { error } = await supabase
        .from(table)
        .update({ 
          is_active: true,
          restored_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('[RESTORE] Supabase error:', error);
        showToastMessage(`Failed to restore: ${error.message}`, 'error');
        return;
      }
      
      console.log('[RESTORE] Success!');
      
      await logAction({
        action: 'Update',
        module: moduleName,
        description: `Restored ${type.toLowerCase()}: ${id}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchAllContent();
      setShowArchive(false);
      showToastMessage('Item restored successfully!', 'success');
      
    } catch (error) {
      console.error('[RESTORE] Unexpected error:', error);
      showToastMessage('Failed to restore item: ' + error.message, 'error');
    }
  };

  // ============================ CONFIRMATION DIALOG ============================
  const showConfirm = (label, description, confirmText, confirmColor, onConfirm) => {
    setConfirmAction({ label, description, confirmText, confirmColor, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmAction(null);
  };

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
      TABS={TABS}
      activeItems={getActiveItems()}
      archivedItems={getArchivedItems()}
      landingSections={activeLandingSections}
      announcements={activeAnnouncements}
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
      onCreateLandingSection={handleCreateLandingSection}
      onUpdateLandingSection={handleUpdateLandingSection}
      onArchive={handleArchive}
      onRestore={handleRestore}
      onShowConfirm={showConfirm}
      sidebar={<AdminSidebar />}
    />
  );
}

export default ContentManagement;