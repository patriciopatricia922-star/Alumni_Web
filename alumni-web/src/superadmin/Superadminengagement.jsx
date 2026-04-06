import React, { useState, useEffect } from 'react';
import AdminSidebar from './SuperAdsidebar';
import Contentmgmtview from './views/Contentmgmtview';
import { supabase } from '../lib/supabase';
// import { supabaseAdmin } from '../lib/supabaseadmin';
import { logAction } from '../lib/auditLogger';

const TABS = [
  { key: 'events', label: 'Events' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'discounts', label: 'Discounts' },
  { key: 'landing', label: 'Landing Page' },
];

const tabConfig = {
  events: {
    sectionTitle: 'Event Board',
    createLabel: 'Add Event',
    createDesc: 'Schedule events for your alumni community.',
    emptyTitle: 'No events yet',
    emptyDesc: 'Events you create will appear here.',
  },
  announcements: {
    sectionTitle: 'Announcement Board',
    createLabel: 'Add Post',
    createDesc: 'Post updates visible to all alumni.',
    emptyTitle: 'No announcements yet',
    emptyDesc: 'Announcements you post will appear here.',
  },
  jobs: {
    sectionTitle: 'Job Board',
    createLabel: 'Add Job',
    createDesc: 'Share job opportunities with alumni.',
    emptyTitle: 'No job listings yet',
    emptyDesc: 'Job postings will appear here once added.',
  },
  discounts: {
    sectionTitle: 'Discount Board',
    createLabel: 'Add Deal',
    createDesc: 'Share exclusive deals for alumni.',
    emptyTitle: 'No discounts yet',
    emptyDesc: 'Discount offers will appear here once added.',
  },
  landing: {
    sectionTitle: 'Landing Page Content',
    createLabel: 'Add Section',
    createDesc: 'Manage content displayed on the landing page.',
    emptyTitle: 'No landing page sections',
    emptyDesc: 'Create sections to display on the landing page.',
  },
};

const Superadminengagement = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [showArchive, setShowArchive] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [landingSections, setLandingSections] = useState([]); 

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
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

  // ADD LANDING PAGE FETCH
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

  const getArchivedItems = () => {
    const archived = [];
    
    events.filter(e => e.is_active === false).forEach(e => {
      archived.push({
        id: e.id,
        type: 'Event',
        title: e.title,
        dateLabel: `Created: ${new Date(e.created_at).toLocaleDateString()}`,
        description: e.description?.substring(0, 100) + (e.description?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    announcements.filter(a => a.is_active === false).forEach(a => {
      archived.push({
        id: a.id,
        type: 'Announcement',
        title: a.title,
        dateLabel: `Published: ${new Date(a.published_at).toLocaleDateString()}`,
        description: a.content?.substring(0, 100) + (a.content?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    jobs.filter(j => j.is_active === false).forEach(j => {
      archived.push({
        id: j.id,
        type: 'Job',
        title: j.title,
        dateLabel: `Posted: ${new Date(j.posted_at).toLocaleDateString()}`,
        description: j.description?.substring(0, 100) + (j.description?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    discounts.filter(d => d.is_active === false).forEach(d => {
      archived.push({
        id: d.id,
        type: 'Discount',
        title: d.title,
        dateLabel: `Added: ${new Date(d.created_at).toLocaleDateString()}`,
        description: d.description?.substring(0, 100) + (d.description?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    // ADD LANDING SECTIONS TO ARCHIVE
    landingSections.filter(l => l.is_active === false).forEach(l => {
      archived.push({
        id: l.id,
        type: 'Landing Section',
        title: l.title,
        dateLabel: `Created: ${new Date(l.created_at).toLocaleDateString()}`,
        description: l.description?.substring(0, 100) + (l.description?.length > 100 ? '...' : ''),
        createdBy: 'Admin',
      });
    });
    
    return archived;
  };

  const openCreate = () => {
    setModalMode('create');
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  // ============================================
  // EVENT HANDLERS with Audit Logs
  // ============================================
  const handleCreateEvent = async (formData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const eventDate = new Date(`${formData.date}T${formData.startTime || '00:00'}`);
      const newEvent = {
        title: formData.title,
        description: formData.description,
        event_date: eventDate.toISOString(),
        location: formData.location,
        category: formData.category,
        image_url: formData.image_url,
        created_by: user?.id,
        is_active: true,
      };
      
      const { data, error } = await supabase.from('events').insert([newEvent]).select();
      
      if (error) throw error;
      
      await logAction({
        action: 'Create',
        module: 'Events',
        description: `Created event: ${formData.title}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchEvents();
      closeModal();
      showToast('Event created successfully!', 'success');
    } catch (error) {
      console.error('Create event error:', error);
      showToast('Failed to create event', 'error');
    }
  };

  const handleUpdateEvent = async (id, formData) => {
    try {
      const eventDate = new Date(`${formData.date}T${formData.startTime || '00:00'}`);
      const updates = {
        title: formData.title,
        description: formData.description,
        event_date: eventDate.toISOString(),
        location: formData.location,
        category: formData.category,
        image_url: formData.image_url,
      };
      
      const { error } = await supabase.from('events').update(updates).eq('id', id);
      
      if (error) throw error;
      
      await logAction({
        action: 'Update',
        module: 'Events',
        description: `Updated event: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchEvents();
      closeModal();
      showToast('Event updated successfully!', 'success');
    } catch (error) {
      console.error('Update event error:', error);
      showToast('Failed to update event', 'error');
    }
  };

  // ============================================
  // ANNOUNCEMENT HANDLERS with Audit Logs
  // ============================================
  const handleCreateAnnouncement = async (formData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newAnnouncement = {
        title: formData.title,
        content: formData.content,
        author_id: user?.id,
        category: formData.priority === 'High' ? 'News' : 'Activities',
        is_active: true,
      };
      
      const { data, error } = await supabase.from('announcements').insert([newAnnouncement]).select();
      
      if (error) throw error;
      
      await logAction({
        action: 'Create',
        module: 'Announcements',
        description: `Created announcement: ${formData.title}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchAnnouncements();
      closeModal();
      showToast('Announcement created successfully!', 'success');
    } catch (error) {
      console.error('Create announcement error:', error);
      showToast('Failed to create announcement', 'error');
    }
  };

  const handleUpdateAnnouncement = async (id, formData) => {
    try {
      const updates = {
        title: formData.title,
        content: formData.content,
      };
      
      const { error } = await supabase.from('announcements').update(updates).eq('id', id);
      
      if (error) throw error;
      
      await logAction({
        action: 'Update',
        module: 'Announcements',
        description: `Updated announcement: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchAnnouncements();
      closeModal();
      showToast('Announcement updated successfully!', 'success');
    } catch (error) {
      console.error('Update announcement error:', error);
      showToast('Failed to update announcement', 'error');
    }
  };

  // ============================================
  // JOB HANDLERS with Audit Logs
  // ============================================
  const handleCreateJob = async (formData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newJob = {
        title: formData.title,
        company: formData.company || 'Various',
        description: formData.description,
        location: formData.location,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        image_url: formData.image_url,
        posted_by: user?.id,
        expires_at: formData.expiry ? new Date(formData.expiry).toISOString() : null,
        is_active: true,
      };
      
      const { data, error } = await supabase.from('jobs').insert([newJob]).select();
      
      if (error) throw error;
      
      await logAction({
        action: 'Create',
        module: 'Jobs',
        description: `Created job: ${formData.title} at ${formData.company}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchJobs();
      closeModal();
      showToast('Job created successfully!', 'success');
    } catch (error) {
      console.error('Create job error:', error);
      showToast('Failed to create job', 'error');
    }
  };

  const handleUpdateJob = async (id, formData) => {
    try {
      const updates = {
        title: formData.title,
        company: formData.company || 'Various',
        description: formData.description,
        location: formData.location,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        image_url: formData.image_url,
        expires_at: formData.expiry ? new Date(formData.expiry).toISOString() : null,
      };
      
      const { error } = await supabase.from('jobs').update(updates).eq('id', id);
      
      if (error) throw error;
      
      await logAction({
        action: 'Update',
        module: 'Jobs',
        description: `Updated job: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchJobs();
      closeModal();
      showToast('Job updated successfully!', 'success');
    } catch (error) {
      console.error('Update job error:', error);
      showToast('Failed to update job', 'error');
    }
  };

  // ============================================
  // DISCOUNT HANDLERS with Audit Logs
  // ============================================
  const handleCreateDiscount = async (formData) => {
    try {
      const newDiscount = {
        title: formData.title,
        description: formData.description,
        company: formData.company || 'Partner Merchant',
        discount_code: formData.discountCode || null,
        image_url: formData.image_url,
        valid_until: formData.expiry ? new Date(formData.expiry).toISOString() : null,
        is_active: true,
      };
      
      const { data, error } = await supabase.from('discounts').insert([newDiscount]).select();
      
      if (error) throw error;
      
      await logAction({
        action: 'Create',
        module: 'Discounts',
        description: `Created discount: ${formData.title} from ${formData.company}`,
        recordId: data[0]?.id,
        status: 'Success'
      });
      
      await fetchDiscounts();
      closeModal();
      showToast('Discount created successfully!', 'success');
    } catch (error) {
      console.error('Create discount error:', error);
      showToast('Failed to create discount', 'error');
    }
  };

  const handleUpdateDiscount = async (id, formData) => {
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        company: formData.company || 'Partner Merchant',
        discount_code: formData.discountCode || null,
        image_url: formData.image_url,
        valid_until: formData.expiry ? new Date(formData.expiry).toISOString() : null,
      };
      
      const { error } = await supabase.from('discounts').update(updates).eq('id', id);
      
      if (error) throw error;
      
      await logAction({
        action: 'Update',
        module: 'Discounts',
        description: `Updated discount: ${formData.title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchDiscounts();
      closeModal();
      showToast('Discount updated successfully!', 'success');
    } catch (error) {
      console.error('Update discount error:', error);
      showToast('Failed to update discount', 'error');
    }
  };

  // ============================================
  // LANDING PAGE HANDLERS with Audit Logs
  // ============================================
  const handleCreateLandingSection = async (formData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const newSection = {
      title: formData.title,
      description: formData.description,
      section_type: formData.section_type,
      content: formData.content,
      image_url: formData.image_url,
      order_index: landingSections.length,
      is_active: true,
      created_by: user?.id,
    };
    
    
    const { data, error } = await supabase.from('landing_sections').insert([newSection]).select();
    
    if (error) throw error;
    
    await logAction({
      action: 'Create',
      module: 'Landing Page',
      description: `Created landing section: ${formData.title}`,
      recordId: data[0]?.id,
      status: 'Success'
    });
    
    await fetchLandingSections();
    closeModal();
    showToast('Landing section created successfully!', 'success');
  } catch (error) {
    console.error('[ContentMgmt] Create landing section error:', error);
    showToast('Failed to create landing section: ' + error.message, 'error');
  }
};

const handleUpdateLandingSection = async (id, formData) => {
  // console.log('[ContentMgmt] handleUpdateLandingSection called with:', { id, formData });
  try {
    const updates = {
      title: formData.title,
      description: formData.description,
      section_type: formData.section_type,
      content: formData.content,
      image_url: formData.image_url,
    };
    
    // console.log('[ContentMgmt] Updating landing section with:', updates);
    const { error } = await supabase.from('landing_sections').update(updates).eq('id', id);
    
    if (error) {
      console.error('[ContentMgmt] Update landing section error:', error);
      showToast('Failed to update landing section: ' + error.message, 'error');
      return;
    }
    
    // console.log('[ContentMgmt] Landing section updated successfully');
    
    // Wait for database to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await fetchLandingSections();
    closeModal();
    showToast('Landing section updated successfully!', 'success');
  } catch (error) {
    console.error('❌ [ContentMgmt] Update landing section error:', error);
    showToast('Failed to update landing section: ' + error.message, 'error');
  }
};

  // ============================================
  // ARCHIVE & RESTORE HANDLERS with Audit Logs
  // ============================================
  const handleArchive = async (type, id) => {
    try {
      const table = type === 'events' ? 'events' : 
                    type === 'announcements' ? 'announcements' :
                    type === 'jobs' ? 'jobs' : 
                    type === 'discounts' ? 'discounts' : 'landing_sections';
      
      let title = '';
      if (type === 'events') {
        const item = events.find(e => e.id === id);
        title = item?.title || id;
      } else if (type === 'announcements') {
        const item = announcements.find(a => a.id === id);
        title = item?.title || id;
      } else if (type === 'jobs') {
        const item = jobs.find(j => j.id === id);
        title = item?.title || id;
      } else if (type === 'discounts') {
        const item = discounts.find(d => d.id === id);
        title = item?.title || id;
      } else if (type === 'landing') {
        const item = landingSections.find(l => l.id === id);
        title = item?.title || id;
      }
      
      const { error } = await supabase.from(table).update({ is_active: false }).eq('id', id);
      
      if (error) throw error;
      
      await logAction({
        action: 'Archive',
        module: type === 'landing' ? 'Landing Page' : type.charAt(0).toUpperCase() + type.slice(1),
        description: `Archived ${type === 'landing' ? 'landing section' : type.slice(0, -1)}: ${title}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchAllContent();
      showToast('Item archived successfully!', 'success');
    } catch (error) {
      console.error('Archive error:', error);
      showToast('Failed to archive item', 'error');
    }
  };

  const handleRestore = async (type, id) => {
    try {
      const table = type === 'Event' ? 'events' : 
                    type === 'Announcement' ? 'announcements' :
                    type === 'Job' ? 'jobs' : 
                    type === 'Discount' ? 'discounts' : 'landing_sections';
      
      const { error } = await supabase.from(table).update({ is_active: true }).eq('id', id);
      
      if (error) throw error;
      
      await logAction({
        action: 'Update',
        module: type === 'Landing Section' ? 'Landing Page' : type,
        description: `Restored ${type.toLowerCase()}: ${id}`,
        recordId: id,
        status: 'Success'
      });
      
      await fetchAllContent();
      setShowArchive(false);
      showToast('Item restored successfully!', 'success');
    } catch (error) {
      console.error('Restore error:', error);
      showToast('Failed to restore item', 'error');
    }
  };

  const archivedItems = getArchivedItems();

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
      case 'landing': return activeLandingSections;
      default: return [];
    }
  };

  return (
    <Contentmgmtview
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      modalOpen={modalOpen}
      modalMode={modalMode}
      openCreate={openCreate}
      closeModal={closeModal}
      TABS={TABS}
      tabConfig={tabConfig}
      sidebar={<AdminSidebar activePage="engagement" />}
      showArchive={showArchive}
      setShowArchive={setShowArchive}
      archivedItems={archivedItems}
      activeItems={getActiveItems()}
      loading={loading}
      onEdit={openEdit}
      onArchive={handleArchive}
      onRestore={handleRestore}
      editingItem={editingItem}
      toast={toast}
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
    />
  );
};

export default Superadminengagement;