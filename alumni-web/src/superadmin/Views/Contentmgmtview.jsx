//SuperAdmin Contentmgmtview.jsx
import React, { useEffect, useCallback } from 'react';
import EventModal        from '../modals/EventModal';
import AnnouncementModal from '../modals/AnnouncementModal';
import JobModal          from '../modals/JobModal';
import DiscountModal     from '../modals/DiscountModal';
import LandingModal      from '../modals/LandingModal';
import RewardsModal      from '../modals/RewardsModal';
import DisclosureModal, { DEFAULT_TOS, DEFAULT_PP } from '../modals/DisclosureModal';
import AwardPointsModal  from '../modals/AwardPointsModal';
import '../styles/Contentmgmt.css';

const HIDDEN_SECTION_TYPES = ['hero', 'stats'];

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
  if (type === 'rewards') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
  if (type === 'landingpage') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/><path d="M9 21V9"/>
    </svg>
  );
  if (type === 'disclosurepage') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
  return null;
};

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
    <div className="cm-lp-card">
      <div className="cm-lp-card-header">
        <h3 className="cm-lp-card-title">{section.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="landing-type-badge">{section.section_type?.replace('_', ' ') || 'Section'}</span>
          <button className="cm-lp-edit-btn" onClick={() => onEdit(section)}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/>
            </svg>
            Edit
          </button>
        </div>
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

const DisclosureTabContent = ({ disclosure, onEditClick }) => {
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  const trunc = (val, max = 220) => {
    const s = stripHtml(val);
    return s.length > max ? s.slice(0, max) + '…' : s;
  };
  const tosText = disclosure?.tos_content || DEFAULT_TOS;
  const ppText  = disclosure?.pp_content  || DEFAULT_PP;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="cm-disclosure-card">
          <div className="cm-disclosure-card-header">
            <h3 className="cm-disclosure-card-title">Terms of Service</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="cm-disclosure-edit-btn" onClick={() => onEditClick('tos')}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/>
                </svg>
                Edit
              </button>
            </div>
          </div>
          <p className="cm-disclosure-card-preview">{trunc(tosText)}</p>
        </div>
        <div className="cm-disclosure-card">
          <div className="cm-disclosure-card-header">
            <h3 className="cm-disclosure-card-title">Privacy Policy</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="cm-disclosure-edit-btn" onClick={() => onEditClick('pp')}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/>
                </svg>
                Edit
              </button>
            </div>
          </div>
          <p className="cm-disclosure-card-preview">{trunc(ppText)}</p>
        </div>
      </div>
    </div>
  );
};

const ContentItemCard = ({ item, type, onEdit, onArchive }) => {
  const strip = (html) => {
    if (!html) return '';
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || d.innerText || '';
  };
  const typeColor = {
    events: '#155DFC', announcements: '#F59E0B', jobs: '#10B981', discounts: '#8B5CF6',
    rewards: '#F97316',
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
    if (type === 'rewards') return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    );
    return null;
  };
  const showImage = ['events', 'jobs', 'discounts', 'rewards', 'announcements'].includes(type) && item.image_url;
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
          <button className="content-archive-btn" onClick={() => onArchive(type, item.id, item.title)}>
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
      {type === 'rewards' && (
        <div className="content-item-meta">
          {item.category && <span>{item.category}</span>}
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            {item.points_required} pts
          </span>
          {item.stock != null && <span>Stock: {item.stock}</span>}
        </div>
      )}
    </div>
  );
};

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

const ConfirmDialog = ({ action, onClose }) => {
  if (!action) return null;
  return (
    <div className="cm-confirm-overlay" onClick={onClose}>
      <div className="cm-confirm-box" onClick={(e) => e.stopPropagation()}>
        <div className="cm-confirm-content">
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
    </div>
  );
};

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
  disclosure,
  disclosureModalOpen,
  disclosureInitialEditing,
  onOpenDisclosureModal,
  onCloseDisclosureModal,
  onDisclosureUpdate,
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
  onCreateReward,
  onUpdateReward,
  onCreateLandingSection,
  onUpdateLandingSection,
  onArchive,
  onRestore,
  onShowConfirm,
  sidebar,
  alumniType,
  awardModalOpen,
  onOpenAwardPoints,
  onCloseAwardPoints,
  onAwardPoints,
}) => {
  const handleToastClose = useCallback(() => {}, []);
  const [rewardFilter, setRewardFilter] = React.useState('All');
  const REWARD_FILTERS = ['All', 'Apparel', 'Drinkware', 'Accessories', 'Others'];

  const editableLandingSections = (landingSections || []).filter(
    s => !HIDDEN_SECTION_TYPES.includes(s.section_type)
  );

  const labels = {
    create: { events: 'Add Event', announcements: 'Add Post', jobs: 'Add Job', discounts: 'Add Deal', rewards: 'Add Reward', landingpage: 'Add Section' },
    desc:   { events: 'Schedule events for your alumni community.', announcements: 'Post updates visible to all alumni.', jobs: 'Share job opportunities with alumni.', discounts: 'Share exclusive deals for alumni.', rewards: 'Add redeemable merch and items for alumni.' },
    empty:  { events: 'No events yet', announcements: 'No announcements yet', jobs: 'No job listings yet', discounts: 'No discounts yet', rewards: 'No rewards yet', landingpage: 'No landing page sections', disclosurepage: 'No disclosure content yet' },
    emptyD: { events: 'Events you create will appear here.', announcements: 'Announcements you post will appear here.', jobs: 'Job postings will appear here once added.', discounts: 'Discount offers will appear here once added.', rewards: 'Reward items will appear here once added.', landingpage: 'Create sections to display on the landing page.', disclosurepage: 'Click Edit on either card to update the content.' },
  };

  const boardTitle = {
    events:          'Event Board',
    announcements:   'Announcement Board',
    jobs:            'Job Board',
    discounts:       'Discount Board',
    rewards:         'Rewards Board',
    landingpage:     'Landing Page Content',
    disclosurepage:  'User Notification / Disclosure',
  }[activeTab] || '';

  const renderContent = () => {
    if (loading) return <div className="loading-state">Loading content…</div>;

    if (alumniType === 'shs' && activeTab !== 'landingpage' && activeTab !== 'disclosurepage') {
      return (
        <div className="cm-board">
          <div className="cm-create-card" onClick={onOpenCreate}>
            <div className="cm-create-plus">+</div>
            <div className="cm-create-label">{labels.create[activeTab] || 'Create'}</div>
            <div className="cm-create-desc">{labels.desc[activeTab] || ''}</div>
          </div>
          <div className="empty-state-card">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">{labels.empty[activeTab] || 'No items yet'}</div>
            <div className="empty-state-desc">No alumni records found.</div>
          </div>
        </div>
      );
    }

    if (activeTab === 'disclosurepage') {
      return (
        <DisclosureTabContent
          disclosure={disclosure}
          onEditClick={onOpenDisclosureModal}
        />
      );
    }

    if (activeTab === 'landingpage') {
      const createCard = (
        <div className="cm-create-card" onClick={onOpenCreate}>
          <div className="cm-create-plus">+</div>
          <div className="cm-create-label">Add Section</div>
          <div className="cm-create-desc">Add a new section to the landing page.</div>
        </div>
      );
      return (
        <div className="cm-board">
          {createCard}
          {editableLandingSections.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">{labels.empty[activeTab]}</div>
              <div className="empty-state-desc">{labels.emptyD[activeTab]}</div>
            </div>
          ) : (
            editableLandingSections.map((s) => (
              <LandingSectionCard key={s.id} section={s} onEdit={onOpenEditSection} />
            ))
          )}
        </div>
      );
    }

    const displayedItems = (activeTab === 'rewards' && rewardFilter !== 'All')
      ? activeItems.filter(item => {
          if (rewardFilter === 'Others') {
            return !['Apparel', 'Drinkware', 'Accessories'].includes(item.category);
          }
          return item.category === rewardFilter;
        })
      : activeItems;

    const createCard = (
      <div className="cm-create-card" onClick={onOpenCreate}>
        <div className="cm-create-plus">+</div>
        <div className="cm-create-label">{labels.create[activeTab] || 'Create'}</div>
        <div className="cm-create-desc">{labels.desc[activeTab] || ''}</div>
      </div>
    );

    return (
      <div className="cm-board">
        {createCard}
        {displayedItems.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">{labels.empty[activeTab] || 'No items yet'}</div>
            <div className="empty-state-desc">{labels.emptyD[activeTab] || ''}</div>
          </div>
        ) : (
          displayedItems.map((item) => (
            <ContentItemCard
              key={item.id}
              item={item}
              type={activeTab}
              onEdit={onOpenEdit}
              onArchive={(type, id, title) => onShowConfirm(
                'Archive this item?',
                `"${title}" will be moved to the archive and hidden from users.`,
                'Archive',
                '#EF4444',
                () => onArchive(type, id)
              )}
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
            <p className="cm-subtitle">Manage announcements, jobs, events, discounts, rewards, and homepage content.</p>
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
            {TABS.map((tab, i) => (
              <React.Fragment key={tab.id}>
                {tab.rightGroup && !TABS[i - 1]?.rightGroup && (
                  <span className="cm-tab-divider" aria-hidden="true" />
                )}
                <button
                  className={`cm-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <TabIcon type={tab.id} active={activeTab === tab.id} />
                  {tab.label}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="cm-board-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="cm-board-title">{boardTitle}</div>
              {activeTab === 'rewards' && (
                <button className="cm-award-points-btn" onClick={onOpenAwardPoints}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Add Points
                </button>
              )}
            </div>
            {activeTab === 'rewards' && (
              <div className="cm-reward-filters">
                {REWARD_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setRewardFilter(f)}
                    className={`cm-filter-btn ${rewardFilter === f ? 'active' : ''}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
          {renderContent()}
        </div>
      </div>
      {showArchive && (
        <ArchivePanel archivedItems={archivedItems} onClose={() => setShowArchive(false)} onRestore={onRestore} />
      )}
      {modalOpen && !showArchive && activeTab === 'events' && (
        <EventModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          event={editingItem} onCreate={onCreateEvent} onUpdate={onUpdateEvent} />
      )}
      {modalOpen && !showArchive && activeTab === 'announcements' && (
        <AnnouncementModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          announcement={editingItem} onCreate={onCreateAnnouncement} onUpdate={onUpdateAnnouncement} />
      )}
      {modalOpen && !showArchive && activeTab === 'jobs' && (
        <JobModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          job={editingItem} onCreate={onCreateJob} onUpdate={onUpdateJob} />
      )}
      {modalOpen && !showArchive && activeTab === 'discounts' && (
        <DiscountModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          discount={editingItem} onCreate={onCreateDiscount} onUpdate={onUpdateDiscount} />
      )}
      {modalOpen && !showArchive && activeTab === 'rewards' && (
        <RewardsModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          reward={editingItem} onCreate={onCreateReward} onUpdate={onUpdateReward}/>
      )}
      {modalOpen && !showArchive && activeTab === 'landingpage' && (
        <LandingModal open={modalOpen} onClose={onCloseModal} mode={modalMode}
          section={editingSection || editingItem}
          onCreate={onCreateLandingSection} onUpdate={onUpdateLandingSection} />
      )}
      <DisclosureModal
        open={disclosureModalOpen}
        onClose={onCloseDisclosureModal}
        disclosure={disclosure}
        onUpdate={onDisclosureUpdate}
        initialEditing={disclosureInitialEditing}
      />
      <AwardPointsModal
        open={awardModalOpen}
        onClose={onCloseAwardPoints}
        onAward={onAwardPoints}
      />
    </>
  );
};

export default ContentManagementView;