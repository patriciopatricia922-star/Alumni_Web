import React, { useState, useEffect } from 'react';
import SuperAdSidebar from "./SuperAdSidebar";
import ContentManagementView from './Views/Contentmgmtview';
import { supabase } from '../lib/supabase';
import { logAction } from '../lib/auditLogger';

const TABS = [
  { id: "events",          label: "Events"                        },
  { id: "announcements",   label: "Announcements"                 },
  { id: "jobs",            label: "Jobs"                          },
  { id: "discounts",       label: "Discounts"                     },
  { id: "landingpage",     label: "Landing Page"                  },
  { id: "disclosurepage",  label: "User Notification/Disclosure"  },
];

function useContentManagement() {

  const [activeTab,       setActiveTab]       = useState("events");
  const [showArchive,     setShowArchive]      = useState(false);
  const [modalOpen,       setModalOpen]        = useState(false);
  const [modalMode,       setModalMode]        = useState("create");
  const [editingItem,     setEditingItem]      = useState(null);
  const [editingSection,  setEditingSection]   = useState(null);
  const [loading,         setLoading]          = useState(true);
  const [toast,           setToast]            = useState({ show: false, message: "", type: "success" });
  const [confirmAction,   setConfirmAction]    = useState(null);

  const [events,          setEvents]           = useState([]);
  const [announcements,   setAnnouncements]    = useState([]);
  const [jobs,            setJobs]             = useState([]);
  const [discounts,       setDiscounts]        = useState([]);
  const [landingSections, setLandingSections]  = useState([]);

  const [disclosure,              setDisclosure]              = useState(null);
  const [disclosureModalOpen,     setDisclosureModalOpen]     = useState(false);
  const [disclosureInitialEditing, setDisclosureInitialEditing] = useState(null);

  const showToastMessage = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

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

  const fetchDisclosure = async () => {
    const { data, error } = await supabase
      .from('disclosures')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (!error && data) setDisclosure(data);
  };

  const fetchAllContent = async () => {
    setLoading(true);
    await Promise.all([
      fetchEvents(),
      fetchAnnouncements(),
      fetchJobs(),
      fetchDiscounts(),
      fetchLandingSections(),
      fetchDisclosure(),
    ]);
    setLoading(false);
  };

  useEffect(() => { fetchAllContent(); }, []);

  const activeEvents          = events         .filter(e => e.is_active !== false);
  const activeAnnouncements   = announcements  .filter(a => a.is_active !== false);
  const activeJobs            = jobs           .filter(j => j.is_active !== false);
  const activeDiscounts       = discounts      .filter(d => d.is_active !== false);
  const activeLandingSections = landingSections.filter(l => l.is_active !== false);

  const getActiveItems = () => {
    switch (activeTab) {
      case 'events':        return activeEvents;
      case 'announcements': return activeAnnouncements;
      case 'jobs':          return activeJobs;
      case 'discounts':     return activeDiscounts;
      case 'landingpage':   return activeLandingSections;
      default:              return [];
    }
  };

  const getArchivedItems = () => {
    const archived = [];

    const push = (items, type, descField) =>
      items
        .filter(i => i.is_active === false)
        .forEach(i => archived.push({
          id:          i.id,
          type,
          title:       i.title,
          dateLabel:   `Archived: ${i.archived_at ? new Date(i.archived_at).toLocaleDateString() : 'Unknown date'}`,
          description: i[descField]?.substring(0, 100) + (i[descField]?.length > 100 ? '...' : ''),
          createdBy:   'Admin',
        }));

    push(events,          'Event',           'description');
    push(announcements,   'Announcement',    'content');
    push(jobs,            'Job',             'description');
    push(discounts,       'Discount',        'description');
    push(landingSections, 'Landing Section', 'description');

    return archived;
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingItem(null);
    setEditingSection(null);
    setModalOpen(true);
  };

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

  const openDisclosureModal = (which = null) => {
    setDisclosureInitialEditing(which);
    setDisclosureModalOpen(true);
  };

  const closeDisclosureModal = () => {
    setDisclosureModalOpen(false);
    setDisclosureInitialEditing(null);
  };

  const handleDisclosureUpdate = async ({ tos_content, pp_content }) => {
    try {
      const { error } = await supabase
        .from('disclosures')
        .upsert({ id: 1, tos_content, pp_content }, { onConflict: 'id' });

      if (error) {
        showToastMessage(`Failed to save: ${error.message}`, 'error');
        return;
      }

      await logAction({
        action: 'Update',
        module: 'Disclosure',
        description: 'Updated Terms of Service and Privacy Policy',
        recordId: 1,
        status: 'Success',
      });

      await fetchDisclosure();
      closeDisclosureModal();
      showToastMessage('Disclosure content saved successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to save disclosure: ' + err.message, 'error');
    }
  };

  const handleCreateEvent = async (formData) => {
    console.log('[CREATE] Event formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      if (!formData.title?.trim()) { showToastMessage('Event title is required', 'error'); return; }
      if (!formData.date)          { showToastMessage('Event date is required',  'error'); return; }

      const eventDate = formData.startTime
        ? new Date(`${formData.date}T${formData.startTime}`)
        : new Date(formData.date);

      if (isNaN(eventDate.getTime())) { showToastMessage('Invalid date format', 'error'); return; }

      const newEvent = {
        title:       formData.title.trim(),
        description: formData.description || '',
        event_date:  eventDate.toISOString(),
        location:    formData.location?.trim() || '',
        category:    formData.category || 'Upcoming Events',
        image_url:   formData.image_url || null,
        created_by:  user?.id,
        is_active:   true,
      };

      const { data, error } = await supabase.from('events').insert([newEvent]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Events', description: `Created event: ${formData.title}`, recordId: data[0]?.id, status: 'Success' });
      await fetchEvents();
      closeModal();
      showToastMessage('Event created successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to create event: ' + err.message, 'error');
    }
  };

  const handleCreateAnnouncement = async (formData) => {
    console.log('[CREATE] Announcement formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      const category = formData.priority === 'High' ? 'News'
                     : formData.priority === 'Medium' ? 'Updates'
                     : 'Activities';

      const newAnnouncement = {
        title:        formData.title?.trim(),
        content:      formData.content || '',
        author_id:    user?.id,
        category,
        published_at: new Date().toISOString(),
        is_active:    true,
      };

      if (!newAnnouncement.title) { showToastMessage('Announcement title is required', 'error'); return; }

      const { data, error } = await supabase.from('announcements').insert([newAnnouncement]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Announcements', description: `Created announcement: ${formData.title}`, recordId: data[0]?.id, status: 'Success' });
      await fetchAnnouncements();
      closeModal();
      showToastMessage('Announcement created successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to create announcement: ' + err.message, 'error');
    }
  };

  const handleCreateJob = async (formData) => {
    console.log('[CREATE] Job formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      if (!formData.title?.trim())   { showToastMessage('Job title is required',    'error'); return; }
      if (!formData.company?.trim()) { showToastMessage('Company name is required', 'error'); return; }

      const tags = Array.isArray(formData.tags)
        ? formData.tags
        : (formData.tags || '').split(',').map(t => t.trim()).filter(Boolean);

      const newJob = {
        title:       formData.title.trim(),
        company:     formData.company.trim(),
        description: formData.description || '',
        location:    formData.location?.trim() || 'Remote',
        category:    formData.category || 'Full-time',
        tags,
        image_url:   formData.image_url || null,
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
    } catch (err) {
      showToastMessage('Failed to create job: ' + err.message, 'error');
    }
  };

  const handleCreateDiscount = async (formData) => {
    console.log('[CREATE] Discount formData received:', formData);
    try {
      if (!formData.title?.trim())   { showToastMessage('Discount title is required', 'error'); return; }
      if (!formData.company?.trim()) { showToastMessage('Company name is required',   'error'); return; }

      const newDiscount = {
        title:         formData.title.trim(),
        description:   formData.description || '',
        company:       formData.company.trim(),
        discount_code: formData.discountCode?.trim() || null,
        image_url:     formData.image_url || null,
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
    } catch (err) {
      showToastMessage('Failed to create discount: ' + err.message, 'error');
    }
  };

  const handleCreateLandingSection = async (formData) => {
    console.log('[CREATE] Landing Section formData received:', formData);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) { showToastMessage('Authentication error. Please log in again.', 'error'); return; }

      if (!formData.title?.trim())   { showToastMessage('Section title is required', 'error'); return; }
      if (!formData.section_type)    { showToastMessage('Section type is required',  'error'); return; }

      const newSection = {
        title:        formData.title.trim(),
        description:  formData.description || '',
        section_type: formData.section_type,
        content:      formData.content || '',
        image_url:    formData.image_url || null,
        order_index:  landingSections.length,
        created_at:   new Date().toISOString(),
        is_active:    true,
        created_by:   user?.id,
      };

      const { data, error } = await supabase.from('landing_sections').insert([newSection]).select();
      if (error) { showToastMessage(`Failed to create: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Create', module: 'Landing Page', description: `Created landing section: ${formData.title}`, recordId: data[0]?.id, status: 'Success' });
      await fetchLandingSections();
      closeModal();
      showToastMessage('Landing section created successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to create landing section: ' + err.message, 'error');
    }
  };

  const handleUpdateEvent = async (id, formData) => {
    console.log('[UPDATE] Event - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      let eventDate;
      if (formData.startTime) eventDate = new Date(`${formData.date}T${formData.startTime}`);
      else if (formData.date)  eventDate = new Date(formData.date);

      const updates = {
        title:       formData.title?.trim(),
        description: formData.description || '',
        location:    formData.location?.trim() || '',
        category:    formData.category || 'Upcoming Events',
        image_url:   formData.image_url || null,
        ...(eventDate && !isNaN(eventDate.getTime()) && { event_date: eventDate.toISOString() }),
      };

      if (!updates.title) { showToastMessage('Event title is required', 'error'); return; }

      const { error } = await supabase.from('events').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Events', description: `Updated event: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchEvents();
      closeModal();
      showToastMessage('Event updated successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to update event: ' + err.message, 'error');
    }
  };

  const handleUpdateAnnouncement = async (id, formData) => {
    console.log('[UPDATE] Announcement - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      const updates = { title: formData.title?.trim(), content: formData.content || '' };
      if (!updates.title) { showToastMessage('Announcement title is required', 'error'); return; }

      const { error } = await supabase.from('announcements').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Announcements', description: `Updated announcement: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchAnnouncements();
      closeModal();
      showToastMessage('Announcement updated successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to update announcement: ' + err.message, 'error');
    }
  };

  const handleUpdateJob = async (id, formData) => {
    console.log('[UPDATE] Job - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      const tags = Array.isArray(formData.tags)
        ? formData.tags
        : (formData.tags || '').split(',').map(t => t.trim()).filter(Boolean);

      const updates = {
        title:       formData.title?.trim(),
        company:     formData.company?.trim(),
        description: formData.description || '',
        location:    formData.location?.trim() || 'Remote',
        category:    formData.category || 'Full-time',
        tags,
        image_url:   formData.image_url || null,
        expires_at:  formData.expiry ? new Date(formData.expiry).toISOString() : null,
      };

      if (!updates.title)   { showToastMessage('Job title is required',    'error'); return; }
      if (!updates.company) { showToastMessage('Company name is required', 'error'); return; }

      const { error } = await supabase.from('jobs').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Jobs', description: `Updated job: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchJobs();
      closeModal();
      showToastMessage('Job updated successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to update job: ' + err.message, 'error');
    }
  };

  const handleUpdateDiscount = async (id, formData) => {
    console.log('[UPDATE] Discount - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      const updates = {
        title:         formData.title?.trim(),
        description:   formData.description || '',
        company:       formData.company?.trim(),
        discount_code: formData.discountCode?.trim() || null,
        image_url:     formData.image_url || null,
        valid_until:   formData.expiry ? new Date(formData.expiry).toISOString() : null,
      };

      if (!updates.title)   { showToastMessage('Discount title is required', 'error'); return; }
      if (!updates.company) { showToastMessage('Company name is required',   'error'); return; }

      const { error } = await supabase.from('discounts').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Discounts', description: `Updated discount: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchDiscounts();
      closeModal();
      showToastMessage('Discount updated successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to update discount: ' + err.message, 'error');
    }
  };

  const handleUpdateLandingSection = async (id, formData) => {
    console.log('[UPDATE] Landing Section - ID:', id, 'formData:', formData);
    try {
      if (!id) { showToastMessage('Cannot update: Missing record ID', 'error'); return; }

      const updates = {
        title:        formData.title?.trim(),
        description:  formData.description || '',
        section_type: formData.section_type,
        content:      formData.content || '',
        image_url:    formData.image_url || null,
      };

      if (!updates.title)        { showToastMessage('Section title is required', 'error'); return; }
      if (!updates.section_type) { showToastMessage('Section type is required',  'error'); return; }

      const { error } = await supabase.from('landing_sections').update(updates).eq('id', id);
      if (error) { showToastMessage(`Failed to update: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: 'Landing Page', description: `Updated landing section: ${formData.title}`, recordId: id, status: 'Success' });
      await fetchLandingSections();
      closeModal();
      showToastMessage('Landing section updated successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to update landing section: ' + err.message, 'error');
    }
  };

  const TABLE_MAP = {
    events:        { table: 'events',           module: 'Events'       },
    announcements: { table: 'announcements',    module: 'Announcements'},
    jobs:          { table: 'jobs',             module: 'Jobs'         },
    discounts:     { table: 'discounts',        module: 'Discounts'    },
    landingpage:   { table: 'landing_sections', module: 'Landing Page' },
  };

  const RESTORE_TABLE_MAP = {
    'Event':           { table: 'events',           module: 'Event'           },
    'Announcement':    { table: 'announcements',    module: 'Announcement'    },
    'Job':             { table: 'jobs',             module: 'Job'             },
    'Discount':        { table: 'discounts',        module: 'Discount'        },
    'Landing Section': { table: 'landing_sections', module: 'Landing Section' },
  };

  const DATA_MAP = { events, announcements, jobs, discounts, landingpage: landingSections };

  const handleArchive = async (type, id) => {
    console.log('[ARCHIVE] Type:', type, 'ID:', id);
    try {
      if (!id) { showToastMessage('Cannot archive: Missing record ID', 'error'); return; }

      const config = TABLE_MAP[type];
      if (!config) { showToastMessage('Unknown content type', 'error'); return; }

      const items     = DATA_MAP[type] || [];
      const itemTitle = items.find(i => i.id === id)?.title || id;

      const { error } = await supabase
        .from(config.table)
        .update({ is_active: false, archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) { showToastMessage(`Failed to archive: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Archive', module: config.module, description: `Archived ${type.replace('landingpage', 'landing section').slice(0, -1)}: ${itemTitle}`, recordId: id, status: 'Success' });
      await fetchAllContent();
      showToastMessage('Item archived successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to archive item: ' + err.message, 'error');
    }
  };

  const handleRestore = async (type, id) => {
    console.log('[RESTORE] Type:', type, 'ID:', id);
    try {
      if (!id) { showToastMessage('Cannot restore: Missing record ID', 'error'); return; }

      const config = RESTORE_TABLE_MAP[type];
      if (!config) { showToastMessage('Unknown content type', 'error'); return; }

      const { error } = await supabase
        .from(config.table)
        .update({ is_active: true, restored_at: new Date().toISOString() })
        .eq('id', id);

      if (error) { showToastMessage(`Failed to restore: ${error.message}`, 'error'); return; }

      await logAction({ action: 'Update', module: config.module, description: `Restored ${type.toLowerCase()}: ${id}`, recordId: id, status: 'Success' });
      await fetchAllContent();
      setShowArchive(false);
      showToastMessage('Item restored successfully!', 'success');
    } catch (err) {
      showToastMessage('Failed to restore item: ' + err.message, 'error');
    }
  };

  const showConfirm = (label, description, confirmText, confirmColor, onConfirm) =>
    setConfirmAction({ label, description, confirmText, confirmColor, onConfirm });

  const closeConfirm = () => setConfirmAction(null);

  return {
    activeTab, setActiveTab,
    showArchive, setShowArchive,
    modalOpen, modalMode,
    editingItem, editingSection,
    loading,
    toast,
    confirmAction,
    activeItems:          getActiveItems(),
    archivedItems:        getArchivedItems(),
    activeLandingSections,
    activeAnnouncements,
    disclosure,
    disclosureModalOpen,
    disclosureInitialEditing,
    openCreate, openEdit, openEditSection, closeModal,
    openDisclosureModal, closeDisclosureModal, handleDisclosureUpdate,
    showConfirm, closeConfirm,
    handleCreateEvent,          handleUpdateEvent,
    handleCreateAnnouncement,   handleUpdateAnnouncement,
    handleCreateJob,            handleUpdateJob,
    handleCreateDiscount,       handleUpdateDiscount,
    handleCreateLandingSection, handleUpdateLandingSection,
    handleArchive,
    handleRestore,
  };
}

function Superadminengagement() {
  const cm = useContentManagement();

  return (
    <ContentManagementView
      activeTab={cm.activeTab}
      setActiveTab={cm.setActiveTab}
      showArchive={cm.showArchive}
      setShowArchive={cm.setShowArchive}
      modalOpen={cm.modalOpen}
      modalMode={cm.modalMode}
      editingItem={cm.editingItem}
      editingSection={cm.editingSection}
      loading={cm.loading}
      toast={cm.toast}
      confirmAction={cm.confirmAction}
      TABS={TABS}
      activeItems={cm.activeItems}
      archivedItems={cm.archivedItems}
      landingSections={cm.activeLandingSections}
      announcements={cm.activeAnnouncements}
      disclosure={cm.disclosure}
      disclosureModalOpen={cm.disclosureModalOpen}
      disclosureInitialEditing={cm.disclosureInitialEditing}
      onOpenDisclosureModal={cm.openDisclosureModal}
      onCloseDisclosureModal={cm.closeDisclosureModal}
      onDisclosureUpdate={cm.handleDisclosureUpdate}
      onOpenCreate={cm.openCreate}
      onOpenEdit={cm.openEdit}
      onOpenEditSection={cm.openEditSection}
      onCloseModal={cm.closeModal}
      onCloseConfirm={cm.closeConfirm}
      onCreateEvent={cm.handleCreateEvent}
      onUpdateEvent={cm.handleUpdateEvent}
      onCreateAnnouncement={cm.handleCreateAnnouncement}
      onUpdateAnnouncement={cm.handleUpdateAnnouncement}
      onCreateJob={cm.handleCreateJob}
      onUpdateJob={cm.handleUpdateJob}
      onCreateDiscount={cm.handleCreateDiscount}
      onUpdateDiscount={cm.handleUpdateDiscount}
      onCreateLandingSection={cm.handleCreateLandingSection}
      onUpdateLandingSection={cm.handleUpdateLandingSection}
      onArchive={cm.handleArchive}
      onRestore={cm.handleRestore}
      onShowConfirm={cm.showConfirm}
      sidebar={<SuperAdSidebar />}
    />
  );
}

export default Superadminengagement;