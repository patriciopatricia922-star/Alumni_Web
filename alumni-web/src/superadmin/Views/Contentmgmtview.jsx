// ============================================================================
// THIS IS THE UI.
// ============================================================================
// Purpose: Renders all visual components including tables, modals, cards,
//          badges, and all presentational elements for Content Management.
// ============================================================================

import React from 'react';
import '../styles/Contentmgmt.css';

// Import all modal components
import EventModal from '../modals/EventModal';
import AnnouncementModal from '../modals/AnnouncementModal';
import JobModal from '../modals/JobModal';
import DiscountModal from '../modals/DiscountModal';
import LandingModal from '../modals/LandingModal';

// ============================ ICON COMPONENTS ============================
const TabIcon = ({ type, active }) => {
  const color = active ? '#FFFFFF' : '#475569';

  if (type === 'events') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    );
  }
  if (type === 'announcements') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    );
  }
  if (type === 'jobs') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    );
  }
  if (type === 'discounts') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    );
  }
  if (type === 'landingpage') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M9 21V9"/>
      </svg>
    );
  }
  return null;
};

// ============================ LANDING SECTION CARD ============================
const LandingSectionCard = ({ section, onEdit }) => {
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getTruncatedValue = (value, maxLength = 120) => {
    if (!value) return '—';
    const stripped = stripHtml(value);
    return stripped.length > maxLength ? stripped.slice(0, maxLength) + '…' : stripped;
  };

  return (
    <div className="cm-lp-card" onClick={() => onEdit(section)} style={{ cursor: "pointer" }}>
      <div className="cm-lp-card-header">
        <h3 className="cm-lp-card-title">{section.title}</h3>
        <span className="landing-type-badge">{section.section_type?.replace('_', ' ') || 'Section'}</span>
      </div>
      <div className="cm-lp-fields">
        {section.description && (
          <div>
            <div className="cm-lp-field-label">Description</div>
            <div className="cm-lp-field-value">{getTruncatedValue(section.description, 100)}</div>
          </div>
        )}
        {section.content && (
          <div>
            <div className="cm-lp-field-label">Content</div>
            <div className="cm-lp-field-value">{getTruncatedValue(section.content, 80)}</div>
          </div>
        )}
        {section.image_url && (
          <div>
            <div className="cm-lp-field-label">Image</div>
            <div className="cm-lp-field-value">✓ Uploaded</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================ CONTENT ITEM CARD ============================
const ContentItemCard = ({ item, type, onEdit, onArchive }) => {
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getTypeColor = () => {
    switch (type) {
      case 'events': return '#155DFC';
      case 'announcements': return '#F59E0B';
      case 'jobs': return '#10B981';
      case 'discounts': return '#8B5CF6';
      default: return '#6A7282';
    }
  };

  const getTypeIcon = () => {
    if (type === 'events') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      );
    }
    if (type === 'announcements') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      );
    }
    if (type === 'jobs') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      );
    }
    if (type === 'discounts') {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
      );
    }
    return null;
  };

  const hasImage = (type === 'events' || type === 'jobs' || type === 'discounts') && item.image_url;

  return (
    <div className="content-item-card">
      {hasImage && (
        <div className="content-item-image">
          <img 
            src={item.image_url} 
            alt={item.title}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      
      <div className="content-item-header">
        <div className="content-item-icon" style={{ background: getTypeColor() }}>
          {getTypeIcon()}
        </div>
        <div className="content-item-actions">
          <button className="content-edit-btn" onClick={() => onEdit(item, type)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3l4 4-7 7H10v-4l7-7z"/>
              <path d="M4 20h16"/>
            </svg>
            Edit
          </button>
          <button className="content-archive-btn" onClick={() => onArchive(type, item.id)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            Archive
          </button>
        </div>
      </div>
      <h4 className="content-item-title">{item.title}</h4>
      <p className="content-item-description">
        {stripHtml(item.description)?.substring(0, 120)}
        {stripHtml(item.description)?.length > 120 ? '...' : ''}
      </p>
      
      {type === 'events' && item.event_date && (
        <div className="content-item-meta">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date(item.event_date).toLocaleDateString()}
          </span>
          {item.location && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{item.location}</span>}
        </div>
      )}
      {type === 'jobs' && (
        <div className="content-item-meta">
          {item.company && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>{item.company}</span>}
          {item.location && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{item.location}</span>}
        </div>
      )}
      {type === 'discounts' && (
        <div className="content-item-meta">
          {item.company && <span>{item.company}</span>}
          {item.valid_until && <span>Valid until {new Date(item.valid_until).toLocaleDateString()}</span>}
        </div>
      )}
    </div>
  );
};

// ============================ ARCHIVE PANEL ============================
const ArchivePanel = ({ archivedItems, onClose, onRestore }) => {
  return (
    <>
      <div className="cm-overlay" onClick={onClose} />
      <div className="cm-archive-panel">
        <div className="cm-archive-header">
          <h2>Archived ({archivedItems.length})</h2>
          <button className="cm-archive-close" onClick={onClose}>✕</button>
        </div>
        <div className="cm-archive-body">
          {archivedItems.length === 0 ? (
            <div className="empty-archive-state">No archived items</div>
          ) : (
            archivedItems.map((item, i) => (
              <div key={i} className="cm-archive-item">
                <div className="cm-archive-item-header">
                  <div className="cm-archive-item-title">
                    <span className="archive-type-pill">{item.type}</span>
                    {item.title}
                  </div>
                  <button className="cm-restore-btn" onClick={() => onRestore(item.type, item.id)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 .49-3.99"/>
                    </svg>
                    Restore
                  </button>
                </div>
                <div className="cm-archive-item-sub">{item.dateLabel}</div>
                <div className="cm-archive-item-desc">{item.description}</div>
                <div className="cm-archive-item-creator">Created by {item.createdBy}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

// ============================ CONFIRMATION DIALOG ============================
const ConfirmDialog = ({ action, onClose, onConfirm }) => {
  if (!action) return null;

  return (
    <div className="cm-confirm-overlay" onClick={onClose}>
      <div className="cm-confirm-box">
        <div className="cm-confirm-content">
          <h3 className="cm-confirm-title">{action.label}</h3>
          {action.description && <p className="cm-confirm-desc">{action.description}</p>}
          <div className="cm-confirm-actions">
            <button className="cm-btn-cancel" onClick={onClose}>Cancel</button>
            <button 
              className="cm-btn-submit"
              style={{ background: action.confirmColor || "#1E293B" }}
              onClick={() => {
                action.onConfirm();
                onClose();
              }}
            >
              {action.confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================ TOAST NOTIFICATION ============================
const ToastNotification = ({ toast, onClose }) => {
  if (!toast.show) return null;

  setTimeout(() => onClose(), 3000);

  return (
    <div className={`toast-notification toast-${toast.type}`}>
      {toast.message}
    </div>
  );
};

// ============================ MAIN VIEW COMPONENT ============================
const ContentManagementView = ({
  activeTab,
  setActiveTab,
  showArchive,
  setShowArchive,
  modalOpen,
  modalMode,
  editingItem,
  editingSection,
  loading,
  toast,
  confirmAction,
  TABS,
  activeItems,
  archivedItems,
  landingSections,
  announcements,
  onOpenCreate,
  onOpenEdit,
  onOpenEditSection,
  onCloseModal,
  onCloseConfirm,
  onCreateEvent,
  onUpdateEvent,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onCreateJob,
  onUpdateJob,
  onCreateDiscount,
  onUpdateDiscount,
  onCreateLandingSection,
  onUpdateLandingSection,
  onArchive,
  onRestore,
  sidebar,
}) => {
  const getTabLabel = () => {
    const tab = TABS.find(t => t.id === activeTab);
    return tab?.label || '';
  };

  const getCreateLabel = () => {
    const labels = {
      events: 'Add Event',
      announcements: 'Add Post',
      jobs: 'Add Job',
      discounts: 'Add Deal',
      landingpage: 'Add Section',
    };
    return labels[activeTab] || 'Create';
  };

  const getCreateDesc = () => {
    const descs = {
      events: 'Schedule events for your alumni community.',
      announcements: 'Post updates visible to all alumni.',
      jobs: 'Share job opportunities with alumni.',
      discounts: 'Share exclusive deals for alumni.',
      landingpage: 'Manage content displayed on the landing page.',
    };
    return descs[activeTab] || '';
  };

  const getEmptyTitle = () => {
    const titles = {
      events: 'No events yet',
      announcements: 'No announcements yet',
      jobs: 'No job listings yet',
      discounts: 'No discounts yet',
      landingpage: 'No landing page sections',
    };
    return titles[activeTab] || 'No items yet';
  };

  const getEmptyDesc = () => {
    const descs = {
      events: 'Events you create will appear here.',
      announcements: 'Announcements you post will appear here.',
      jobs: 'Job postings will appear here once added.',
      discounts: 'Discount offers will appear here once added.',
      landingpage: 'Create sections to display on the landing page.',
    };
    return descs[activeTab] || '';
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading-state">Loading content...</div>;
    }

    // Landing Page Tab
    if (activeTab === "landingpage") {
      return (
        <div className="cm-board">
          {landingSections.length === 0 ? (
            <div className="empty-state-full">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">{getEmptyTitle()}</div>
              <div className="empty-state-desc">{getEmptyDesc()}</div>
            </div>
          ) : (
            landingSections.map((section) => (
              <LandingSectionCard 
                key={section.id} 
                section={section} 
                onEdit={onOpenEditSection} 
              />
            ))
          )}
        </div>
      );
    }

    // Other Tabs
    return (
      <div className="cm-board">
        {/* Create Card */}
        <div className="cm-create-card" onClick={onOpenCreate}>
          <div className="cm-create-plus">+</div>
          <div className="cm-create-label">{getCreateLabel()}</div>
          <div className="cm-create-desc">{getCreateDesc()}</div>
        </div>

        {/* Content Items */}
        {activeItems.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">{getEmptyTitle()}</div>
            <div className="empty-state-desc">{getEmptyDesc()}</div>
          </div>
        ) : (
          activeItems.map((item) => (
            <ContentItemCard
              key={item.id}
              item={item}
              type={activeTab}
              onEdit={onOpenEdit}
              onArchive={onArchive}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <>
      <ToastNotification toast={toast} onClose={() => {}} />
      <ConfirmDialog action={confirmAction} onClose={onCloseConfirm} onConfirm={() => {}} />

      {sidebar}

      <div className="cm-page">
        {/* HEADER */}
        <div className="cm-header">
          <div>
            <h1 className="cm-title">Content Management</h1>
            <p className="cm-subtitle">Monitor, update, and organize your alumni content efficiently.</p>
          </div>
          <button className="cm-archive-btn" onClick={() => setShowArchive(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            Archive ({archivedItems.length})
          </button>
        </div>

        {/* MAIN CARD */}
        <div className="cm-card">
          {/* TABS */}
          <div className="cm-tabs">
            {TABS.map((tab, idx) => (
              <button
                key={tab.id}
                className={`cm-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon type={tab.id} active={activeTab === tab.id} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* BOARD TITLE */}
          <div className="cm-board-title">
            {activeTab === "events" && "Event Board"}
            {activeTab === "announcements" && "Announcement Board"}
            {activeTab === "jobs" && "Job Board"}
            {activeTab === "discounts" && "Discount Board"}
            {activeTab === "landingpage" && "Landing Page Content"}
          </div>

          {renderContent()}
        </div>
      </div>

      {/* ARCHIVE PANEL */}
      {showArchive && (
        <ArchivePanel 
          archivedItems={archivedItems} 
          onClose={() => setShowArchive(false)} 
          onRestore={onRestore}
        />
      )}

      {/* MODALS */}
      {modalOpen && !showArchive && activeTab === 'events' && (
        <EventModal
          open={modalOpen}
          onClose={onCloseModal}
          mode={modalMode}
          event={editingItem}
          onCreate={onCreateEvent}
          onUpdate={onUpdateEvent}
        />
      )}
      {modalOpen && !showArchive && activeTab === 'announcements' && (
        <AnnouncementModal
          open={modalOpen}
          onClose={onCloseModal}
          mode={modalMode}
          announcement={editingItem}
          onCreate={onCreateAnnouncement}
          onUpdate={onUpdateAnnouncement}
        />
      )}
      {modalOpen && !showArchive && activeTab === 'jobs' && (
        <JobModal
          open={modalOpen}
          onClose={onCloseModal}
          mode={modalMode}
          job={editingItem}
          onCreate={onCreateJob}
          onUpdate={onUpdateJob}
        />
      )}
      {modalOpen && !showArchive && activeTab === 'discounts' && (
        <DiscountModal
          open={modalOpen}
          onClose={onCloseModal}
          mode={modalMode}
          discount={editingItem}
          onCreate={onCreateDiscount}
          onUpdate={onUpdateDiscount}
        />
      )}
      {modalOpen && !showArchive && activeTab === 'landingpage' && (
        <LandingModal
          open={modalOpen}
          onClose={onCloseModal}
          mode={modalMode}
          section={editingSection || editingItem}
          onCreate={onCreateLandingSection}
          onUpdate={onUpdateLandingSection}
        />
      )}
    </>
  );
};

export default ContentManagementView;