import React from 'react';
import '../styles/Contentmgmt.css';
import EventModal from '../modals/EventModal';
import AnnouncementModal from '../modals/AnnouncementModal';
import JobModal from '../modals/JobModal';
import DiscountModal from '../modals/DiscountModal';

import { 
  FiCalendar, 
  FiBell, 
  FiBriefcase, 
  FiPercent, 
  FiMapPin, 
  FiClock,
  FiArchive,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiChevronRight,
  FiX,
  FiMenu
} from 'react-icons/fi';
import { HiOutlineBuildingOffice2, HiOutlineChevronRight } from 'react-icons/hi2';

const TabIcon = ({ type, active }) => {
  const c = active ? '#FFFFFF' : '#0A0A0A';

  if (type === 'events') {
    return <FiCalendar size={16} color={c} />;
  }

  if (type === 'announcements') {
    return <FiBell size={16} color={c} />;
  }

  if (type === 'jobs') {
    return <FiBriefcase size={16} color={c} />;
  }

  if (type === 'discounts') {
    return <FiPercent size={16} color={c} />;
  }

  return null;
};

const ArchiveButtonIcon = () => <FiArchive size={16} color="#FFFFFF" />;

const RestoreIcon = () => <FiArchive size={14} style={{ transform: 'rotate(180deg)' }} color="#0A0A0A" />;

const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX size={16} />
        </button>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div className="field-wrap">
    <label className="field-label">
      {label}
      {required && <span className="field-required"> *</span>}
    </label>
    {children}
  </div>
);

const ModalFooter = ({ onCancel, createLabel, loading }) => (
  <div className="modal-footer">
    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
    <button className="btn-create" disabled={loading}>
      {loading ? 'Saving...' : createLabel}
    </button>
  </div>
);

// Content Item Card for displaying active items
const ContentItemCard = ({ item, type, onEdit, onArchive }) => {
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
    switch (type) {
      case 'events': return <FiCalendar size={16} color="#FFFFFF" />;
      case 'announcements': return <FiBell size={16} color="#FFFFFF" />;
      case 'jobs': return <FiBriefcase size={16} color="#FFFFFF" />;
      case 'discounts': return <FiPercent size={16} color="#FFFFFF" />;
      default: return <FiCalendar size={16} color="#FFFFFF" />;
    }
  };

  // Helper to strip HTML tags for preview
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="content-item-card">
      <div className="content-item-header">
        <div className="content-item-icon" style={{ background: getTypeColor() }}>
          {getTypeIcon()}
        </div>
        <div className="content-item-actions">
          <button className="content-edit-btn" onClick={() => onEdit(item)}>
            <FiEdit2 size={12} /> Edit
          </button>
          <button className="content-archive-btn" onClick={() => onArchive(type, item.id)}>
            <FiArchive size={12} /> Archive
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
          <span><FiCalendar size={12} /> {new Date(item.event_date).toLocaleDateString()}</span>
          {item.location && <span><FiMapPin size={12} /> {item.location}</span>}
        </div>
      )}
      {type === 'jobs' && (
        <div className="content-item-meta">
          {item.company && <span><HiOutlineBuildingOffice2 size={12} /> {item.company}</span>}
          {item.location && <span><FiMapPin size={12} /> {item.location}</span>}
          {item.category && <span><FiBriefcase size={12} /> {item.category}</span>}
        </div>
      )}
      {type === 'discounts' && (
        <div className="content-item-meta">
          {item.company && <span><HiOutlineBuildingOffice2 size={12} /> {item.company}</span>}
          {item.valid_until && <span><FiClock size={12} /> Valid until {new Date(item.valid_until).toLocaleDateString()}</span>}
        </div>
      )}
    </div>
  );
};

const TabContent = ({ tab, tabConfig, onOpenCreate, activeItems, loading, onEdit, onArchive }) => {
  const cfg = tabConfig[tab];

  return (
    <div className="tab-content-card">
      <div className="section-header">
        <span className="section-title">{cfg.sectionTitle}</span>
        <button className="btn-create" onClick={onOpenCreate}>
        <FiPlus size={14} />
        {cfg.createLabel}
      </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : activeItems.length === 0 ? (
        <div className="content-two-column">
          <div className="create-card" onClick={onOpenCreate}>
            <div className="create-card-icon">
              <FiPlus size={20} stroke="#155DFC" strokeWidth="2" />
            </div>
            <span className="create-card-title">{cfg.createLabel}</span>
            <span className="create-card-desc">{cfg.createDesc}</span>
          </div>

          <div className="empty-state-card">
            <FiCalendar size={32} stroke="#CBD5E1" strokeWidth="1.5" />
            <span className="empty-state-title">{cfg.emptyTitle}</span>
            <span className="empty-state-desc">{cfg.emptyDesc}</span>
          </div>
        </div>
      ) : (
        <div className="content-items-grid">
          {activeItems.map((item) => (
            <ContentItemCard
              key={item.id}
              item={item}
              type={tab}
              onEdit={onEdit}
              onArchive={onArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ArchiveList = ({ archivedItems, onCloseArchive, onRestore }) => {
  return (
    <div className="archive-card">
      <div className="archive-header">
        <span className="section-title">Archived</span>
      </div>

      <div className="archive-list">
        {archivedItems.map((item) => (
          <div className="archive-item" key={item.id}>
            <div className="archive-item-top">
              <div className="archive-item-main">
                <div className="archive-item-title-row">
                  <h4 className="archive-item-title">{item.title}</h4>
                  <span className="archive-type-pill">{item.type}</span>
                </div>

                <div className="archive-meta-row">
                  <span className="archive-date">{item.dateLabel}</span>
                </div>
              </div>

              <button className="restore-btn" type="button" onClick={() => onRestore(item.type, item.id)}>
                <RestoreIcon />
                Restore
              </button>
            </div>

            <div className="archive-item-body">
              <p className="archive-description">{item.description}</p>
              <span className="archive-created-by">{item.createdBy}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="archive-bottom-action">
        <button className="btn-cancel" type="button" onClick={onCloseArchive}>
          Back to Content
        </button>
      </div>
    </div>
  );
};

const Contentmgmtview = ({
  activeTab,
  setActiveTab,
  modalOpen,
  modalMode,
  openCreate,
  closeModal,
  TABS,
  tabConfig,
  sidebar,
  showArchive,
  setShowArchive,
  archivedItems,
  activeItems,
  loading,
  onEdit,
  onArchive,
  onRestore,
  editingItem,
  onCreateEvent,
  onUpdateEvent,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onCreateJob,
  onUpdateJob,
  onCreateDiscount,
  onUpdateDiscount,
}) => {
  return (
    <>
      <div className="engagement-layout">
        {sidebar}

        <main className="engagement-main">
          <div className="page-top-row">
            <div className="page-header">
              <h1 className="page-title">Content Management</h1>
              <p className="page-subtitle">Monitor, update, and organize your alumni content efficiently.</p>
            </div>
          </div>

          <div className="archive-action-row">
            <button
              className="archive-toggle-btn"
              type="button"
              onClick={() => setShowArchive(true)}
            >
              <ArchiveButtonIcon />
              Archive ({archivedItems.length})
            </button>
          </div>

          <div className="tab-bar-wrap">
            <div className="tab-bar-left">
              <FiMenu size={20} stroke="#374151" strokeWidth="1.5" className="tab-bar-icon" />

              <div className="tab-list">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    className={`eng-tab${activeTab === t.key ? ' active' : ''}`}
                    onClick={() => {
                      setActiveTab(t.key);
                      closeModal();
                      setShowArchive(false);
                    }}
                  >
                    <TabIcon type={t.key} active={activeTab === t.key} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showArchive ? (
            <ArchiveList archivedItems={archivedItems} onCloseArchive={() => setShowArchive(false)} onRestore={onRestore} />
          ) : (
            <TabContent 
              tab={activeTab} 
              tabConfig={tabConfig} 
              onOpenCreate={openCreate}
              activeItems={activeItems}
              loading={loading}
              onEdit={onEdit}
              onArchive={onArchive}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {!showArchive && activeTab === 'events' && (
        <EventModal
          open={modalOpen}
          onClose={closeModal}
          mode={modalMode}
          event={editingItem}
          onCreate={onCreateEvent}
          onUpdate={onUpdateEvent}
        />
      )}
      {!showArchive && activeTab === 'announcements' && (
        <AnnouncementModal
          open={modalOpen}
          onClose={closeModal}
          mode={modalMode}
          announcement={editingItem}
          onCreate={onCreateAnnouncement}
          onUpdate={onUpdateAnnouncement}
        />
      )}
      {!showArchive && activeTab === 'jobs' && (
        <JobModal
          open={modalOpen}
          onClose={closeModal}
          mode={modalMode}
          job={editingItem}
          onCreate={onCreateJob}
          onUpdate={onUpdateJob}
        />
      )}
      {!showArchive && activeTab === 'discounts' && (
        <DiscountModal
          open={modalOpen}
          onClose={closeModal}
          mode={modalMode}
          discount={editingItem}
          onCreate={onCreateDiscount}
          onUpdate={onUpdateDiscount}
        />
      )}
    </>
  );
};

export default Contentmgmtview;