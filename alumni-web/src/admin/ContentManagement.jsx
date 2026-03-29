import React, { useState, useEffect } from 'react';
import AdminSidebar from './components/AdminSidebar';
import Contentmgmtview from './views/Contentmgmtview';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseadmin';

const TABS = [
  { key: 'events', label: 'Events' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'discounts', label: 'Discounts' },
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
};

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [showArchive, setShowArchive] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for each content type
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  // Fetch all content
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

  const fetchAllContent = async () => {
    setLoading(true);
    await Promise.all([
      fetchEvents(),
      fetchAnnouncements(),
      fetchJobs(),
      fetchDiscounts(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  // Get archived items (is_active = false)
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

  // Create handlers
  const handleCreateEvent = async (formData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const eventDate = new Date(`${formData.date}T${formData.startTime || '00:00'}`);
    const newEvent = {
      title: formData.title,
      description: formData.description,
      event_date: eventDate.toISOString(),
      location: formData.location,
      category: formData.category,
      created_by: user?.id,
      is_active: true,
    };
    
    const { error } = await supabase.from('events').insert([newEvent]);
    if (!error) {
      await fetchEvents();
      closeModal();
    }
  };

  const handleUpdateEvent = async (id, formData) => {
    const eventDate = new Date(`${formData.date}T${formData.startTime || '00:00'}`);
    const updates = {
      title: formData.title,
      description: formData.description,
      event_date: eventDate.toISOString(),
      location: formData.location,
      category: formData.category,
    };
    
    const { error } = await supabase.from('events').update(updates).eq('id', id);
    if (!error) {
      await fetchEvents();
      closeModal();
    }
  };

  const handleCreateAnnouncement = async (formData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const newAnnouncement = {
      title: formData.title,
      content: formData.content,
      author_id: user?.id,
      category: formData.priority === 'High' ? 'News' : 'Activities',
      is_active: true,
    };
    
    const { error } = await supabase.from('announcements').insert([newAnnouncement]);
    if (!error) {
      await fetchAnnouncements();
      closeModal();
    }
  };

  const handleUpdateAnnouncement = async (id, formData) => {
    const updates = {
      title: formData.title,
      content: formData.content,
    };
    
    const { error } = await supabase.from('announcements').update(updates).eq('id', id);
    if (!error) {
      await fetchAnnouncements();
      closeModal();
    }
  };

  const handleCreateJob = async (formData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const newJob = {
      title: formData.title,
      company: formData.company || 'Various',
      description: formData.description,
      location: formData.location,
      category: formData.category,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      posted_by: user?.id,
      expires_at: formData.expiry ? new Date(formData.expiry).toISOString() : null,
      is_active: true,
    };
    
    const { error } = await supabase.from('jobs').insert([newJob]);
    if (!error) {
      await fetchJobs();
      closeModal();
    }
  };

  const handleUpdateJob = async (id, formData) => {
    const updates = {
      title: formData.title,
      company: formData.company || 'Various',
      description: formData.description,
      location: formData.location,
      category: formData.category,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      expires_at: formData.expiry ? new Date(formData.expiry).toISOString() : null,
    };
    
    const { error } = await supabase.from('jobs').update(updates).eq('id', id);
    if (!error) {
      await fetchJobs();
      closeModal();
    }
  };

  const handleCreateDiscount = async (formData) => {
    const newDiscount = {
      title: formData.title,
      description: formData.description,
      company: formData.company || 'Partner Merchant',
      discount_code: formData.discountCode || null,
      valid_until: formData.expiry ? new Date(formData.expiry).toISOString() : null,
      is_active: true,
    };
    
    const { error } = await supabase.from('discounts').insert([newDiscount]);
    if (!error) {
      await fetchDiscounts();
      closeModal();
    }
  };

  const handleUpdateDiscount = async (id, formData) => {
    const updates = {
      title: formData.title,
      description: formData.description,
      company: formData.company || 'Partner Merchant',
      discount_code: formData.discountCode || null,
      valid_until: formData.expiry ? new Date(formData.expiry).toISOString() : null,
    };
    
    const { error } = await supabase.from('discounts').update(updates).eq('id', id);
    if (!error) {
      await fetchDiscounts();
      closeModal();
    }
  };

  // Archive handlers
  const handleArchive = async (type, id) => {
    const table = type === 'events' ? 'events' : 
                  type === 'announcements' ? 'announcements' :
                  type === 'jobs' ? 'jobs' : 'discounts';
    
    const { error } = await supabase.from(table).update({ is_active: false }).eq('id', id);
    if (!error) {
      await fetchAllContent();
    }
  };

  const handleRestore = async (type, id) => {
    const table = type === 'Event' ? 'events' : 
                  type === 'Announcement' ? 'announcements' :
                  type === 'Job' ? 'jobs' : 'discounts';
    
    const { error } = await supabase.from(table).update({ is_active: true }).eq('id', id);
    if (!error) {
      await fetchAllContent();
      setShowArchive(false);
    }
  };

  const archivedItems = getArchivedItems();

  // Get active items for display
  const activeEvents = events.filter(e => e.is_active !== false);
  const activeAnnouncements = announcements.filter(a => a.is_active !== false);
  const activeJobs = jobs.filter(j => j.is_active !== false);
  const activeDiscounts = discounts.filter(d => d.is_active !== false);

  const getActiveItems = () => {
    switch (activeTab) {
      case 'events': return activeEvents;
      case 'announcements': return activeAnnouncements;
      case 'jobs': return activeJobs;
      case 'discounts': return activeDiscounts;
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
      onCreateEvent={handleCreateEvent}
      onUpdateEvent={handleUpdateEvent}
      onCreateAnnouncement={handleCreateAnnouncement}
      onUpdateAnnouncement={handleUpdateAnnouncement}
      onCreateJob={handleCreateJob}
      onUpdateJob={handleUpdateJob}
      onCreateDiscount={handleCreateDiscount}
      onUpdateDiscount={handleUpdateDiscount}
    />
  );
};

export default ContentManagement;