// ============================================================================
// THIS IS THE UI.
// ============================================================================

import React, { useEffect, useCallback } from 'react';
import '../styles/ContentMgmt.css';

import EventModal        from '../modals/EventModal';
import AnnouncementModal from '../modals/AnnouncementModal';
import JobModal          from '../modals/JobModal';
import DiscountModal     from '../modals/DiscountModal';
import LandingModal      from '../modals/LandingModal';

// ── Tab icons ─────────────────────────────────────────────────────────────────
const TabIcon = ({ type, active }) => {
  const c = active ? '#FFFFFF' : '#475569';
  if (type === 'events') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
  if (type === 'announcements') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
  if (type === 'jobs') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  );
  if (type === 'discounts') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
  if (type === 'landingpage') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/><path d="M9 21V9"/>
    </svg>
  );
  return null;
};

// ── Landing section card ──────────────────────────────────────────────────────
const LandingSectionCard = ({ section, onEdit }) => {
  const strip = (html) => {
    if (!html) return '';
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || d.innerText || '';
  };
  const trunc = (v, n = 120) => {
    if (!v) return '—';
    const s = strip(v);
    return s.length > n ? s.slice(0, n) + '…' : s;
  };

  return (
    <div className="cm-lp-card" onClick={() => onEdit(section)} style={{ cursor: 'pointer' }}>
      <div className="cm-lp-card-header">
        <h3 className="cm-lp-card-title">{section.title}</h3>
        <span className="landing-type-badge">{section.section_type?.replace('_', ' ') || 'Section'}</span>
      </div>
      <div className="cm-lp-fields">
        {section.description && (
          <div>
            <div className="cm-lp-field-label">Description</div>
            <div className="cm-lp-field-value">{trunc(section.description, 100)}</div>
          </div>
        )}
        {section.content && (
          <div>
            <div className="cm-lp-field-label">Content</div>
            <div className="cm-lp-field-value">{trunc(section.content, 80)}</div>
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

// ── Content item card ─────────────────────────────────────────────────────────
// NOTE: Events and announcements no longer show image thumbnails.
//       Only jobs and discounts retain image display.
const ContentItemCard = ({ item, type, onEdit, onArchive }) => {
  const strip = (html) => {
    if (!html) return '';
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || d.innerText || '';
  };

  const typeColor = {
    events: '#155DFC', announcements: '#F59E0B', jobs: '#10B981', discounts: '#8B5CF6',
  }[type] || '#6A7282';

  const typeIcon = () => {
    if (type === 'events') return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    );
    if (type === 'announcements') return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    );
    if (type === 'jobs') return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    );
    if (type === 'discounts') return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    );
    return null;
  };

  // Only jobs and discounts show image thumbnails on the card
  const showImage = (type === 'jobs' || type === 'discounts') && item.image_url;

  return (
    <div className="content-item-card">
      {showImage && (
        <div className="content-item-image">
          <img src={item.image_url} alt={item.title} onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}

      <div className="content-item-header">
        <div className="content-item-icon" style={{ background: typeColor }}>{typeIcon()}</div>
        <div className="content-item-actions">
          <button className="content-edit-btn" onClick={() => onEdit(item, type)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/>
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
        {strip(item.description)?.substring(0, 120)}
        {strip(item.description)?.length > 120 ? '...' : ''}
      </p>

      {type === 'events' && item.event_date && (
        <div className="content-item-meta">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date(item.event_date).toLocaleDateString()}
          </span>
          {item.location && (
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {item.location}
            </span>
          )}
        </div>
      )}
      {type === 'jobs' && (
        <div className="content-item-meta">
          {item.company  && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>{item.company}</span>}
          {item.location && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{item.location}</span>}
        </div>
      )}
      {type === 'discounts' && (
        <div className="content-item-meta">
          {item.company     && <span>{item.company}</span>}
          {item.valid_until && <span>Valid until {new Date(item.valid_until).toLocaleDateString()}</span>}
        </div>
      )}
    </div>
  );
};

// ── Archive panel ─────────────────────────────────────────────────────────────
const ArchivePanel = ({ archivedItems, onClose, onRestore }) => (
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

// ── Confirm dialog ────────────────────────────────────────────────────────────
const ConfirmDialog = ({ action, onClose }) => {
  if (!action) return null;
  return (
    <div className="cm-confirm-overlay" onClick={onClose}>
      <div className="cm-confirm-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="cm-confirm-title">{action.label}</h3>
        {action.description && <p className="cm-confirm-desc">{action.description}</p>}
        <div className="cm-confirm-actions">
          <button className="cm-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="cm-btn-submit"
            style={{ background: action.confirmColor || '#1E293B' }}
            onClick={() => { action.onConfirm(); onClose(); }}
          >
            {action.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Toast notification ────────────────────────────────────────────────────────
const ToastNotification = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast.show) return;
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [toast.show, onClose]);

  if (!toast.show) return null;
  return (
    <div className={`toast-notification toast-${toast.type}`}>
      {toast.message}
    </div>
  );
};

// ── Main view ─────────────────────────────────────────────────────────────────
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
  const handleToastClose = useCallback(() => {}, []);

  const labels = {
    create: { events: 'Add Event', announcements: 'Add Post', jobs: 'Add Job', discounts: 'Add Deal', landingpage: 'Add Section' },
    desc:   { events: 'Schedule events for your alumni community.', announcements: 'Post updates visible to all alumni.', jobs: 'Share job opportunities with alumni.', discounts: 'Share exclusive deals for alumni.', landingpage: 'Manage content displayed on the landing page.' },
    empty:  { events: 'No events yet', announcements: 'No announcements yet', jobs: 'No job listings yet', discounts: 'No discounts yet', landingpage: 'No landing page sections' },
    emptyD: { events: 'Events you create will appear here.', announcements: 'Announcements you post will appear here.', jobs: 'Job postings will appear here once added.', discounts: 'Discount offers will appear here once added.', landingpage: 'Create sections to display on the landing page.' },
  };

  const renderContent = () => {
    if (loading) return <div className="loading-state">Loading content…</div>;

    const createCard = (
      <div className="cm-create-card" onClick={onOpenCreate}>
        <div className="cm-create-plus">+</div>
        <div className="cm-create-label">{labels.create[activeTab] || 'Create'}</div>
        <div className="cm-create-desc">{labels.desc[activeTab] || ''}</div>
      </div>
    );

    if (activeTab === 'landingpage') {
      return (
        <div className="cm-board">
          {createCard}
          {landingSections.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">{labels.empty[activeTab]}</div>
              <div className="empty-state-desc">{labels.emptyD[activeTab]}</div>
            </div>
          ) : (
            landingSections.map((s) => (
              <LandingSectionCard key={s.id} section={s} onEdit={onOpenEditSection} />
            ))
          )}
        </div>
      );
    }

    return (
      <div className="cm-board">
        {createCard}
        {activeItems.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">{labels.empty[activeTab] || 'No items yet'}</div>
            <div className="empty-state-desc">{labels.emptyD[activeTab] || ''}</div>
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
      <ToastNotification toast={toast} onClose={handleToastClose} />
      <ConfirmDialog action={confirmAction} onClose={onCloseConfirm} />

      {sidebar}

      <div className="cm-page">
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

        <div className="cm-card">
          <div className="cm-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`cm-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon type={tab.id} active={activeTab === tab.id} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="cm-board-title">
            {{ events: 'Event Board', announcements: 'Announcement Board', jobs: 'Job Board', discounts: 'Discount Board', landingpage: 'Landing Page Content' }[activeTab]}
          </div>

          {renderContent()}
        </div>
      </div>

      {showArchive && (
        <ArchivePanel archivedItems={archivedItems} onClose={() => setShowArchive(false)} onRestore={onRestore} />
      )}

      {modalOpen && activeTab === 'events' && (
        <EventModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          event={editingItem} onCreate={onCreateEvent} onUpdate={onUpdateEvent} />
      )}
      {modalOpen && activeTab === 'announcements' && (
        <AnnouncementModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          announcement={editingItem} onCreate={onCreateAnnouncement} onUpdate={onUpdateAnnouncement} />
      )}
      {modalOpen && activeTab === 'jobs' && (
        <JobModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          job={editingItem} onCreate={onCreateJob} onUpdate={onUpdateJob} />
      )}
      {modalOpen && activeTab === 'discounts' && (
        <DiscountModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          discount={editingItem} onCreate={onCreateDiscount} onUpdate={onUpdateDiscount} />
      )}
      {modalOpen && activeTab === 'landingpage' && (
        <LandingModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          section={editingSection || editingItem}
          onCreate={onCreateLandingSection} onUpdate={onUpdateLandingSection} />
      )}
    </>
  );
};

export default ContentManagementView;