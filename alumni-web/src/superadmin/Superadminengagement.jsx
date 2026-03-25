import React, { useState } from 'react';
import SuperAdSidebar from '../superadmin/SuperAdsidebar';
import Contentmgmtview from './Views/Contentmgmtview';

const TABS = [
  { key: 'events', label: 'Events' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'discounts', label: 'Discounts' },
];

const tabConfig = {
  events: {
    sectionTitle: 'Event Board',
    createLabel: 'Create New Event',
    createDesc: 'Schedule events, reunions, and activities for your alumni community.',
    emptyTitle: 'No events yet',
    emptyDesc: 'Events you create will appear here.',
  },
  announcements: {
    sectionTitle: 'Announcement Board',
    createLabel: 'Create New Announcement',
    createDesc: 'Post updates, news, and events visible to all alumni.',
    emptyTitle: 'No announcements yet',
    emptyDesc: 'Announcements you post will appear here.',
  },
  jobs: {
    sectionTitle: 'Job Board',
    createLabel: 'Post a Job',
    createDesc: 'Share job opportunities and career openings with alumni.',
    emptyTitle: 'No job listings yet',
    emptyDesc: 'Job postings will appear here once added.',
  },
  discounts: {
    sectionTitle: 'Discount Board',
    createLabel: 'Add a Discount',
    createDesc: 'Share exclusive deals and partner discounts for alumni.',
    emptyTitle: 'No discounts yet',
    emptyDesc: 'Discount offers will appear here once added.',
  },
};

const archivedItems = [
  {
    id: 1,
    type: 'Event',
    title: 'Tech Industry Networking Event (December 20, 2025)',
    dateLabel: 'Posted: December 15, 2025',
    description: 'Lead product strategy and development for our flagship SaaS platform. Work with cross-functional teams to deliver exceptional user experiences.',
    createdBy: 'Created by',
  },
  {
    id: 2,
    type: 'Job',
    title: 'UI/UX Designer (Payso)',
    dateLabel: 'Expires: August 19, 2024',
    description: 'Graphic Designer, Multimedia Arts, Fine Arts',
    createdBy: 'Created by',
  },
  {
    id: 3,
    type: 'Discount',
    title: 'Two Seasons Hotel and Resorts',
    dateLabel: 'Expires: March 31, 2025',
    description: '25% off in room accommodation with complimentary breakfast',
    createdBy: 'Created by',
  },
];

const Superadminengagement = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [showArchive, setShowArchive] = useState(false);

  const openCreate = () => {
    setModalMode('create');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
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
      sidebar={<SuperAdSidebar activePage="engagement" />}
      showArchive={showArchive}
      setShowArchive={setShowArchive}
      archivedItems={archivedItems}
    />
  );
};

export default Superadminengagement;
