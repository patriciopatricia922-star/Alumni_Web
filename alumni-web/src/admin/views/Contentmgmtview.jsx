import React, { useState } from 'react';
import '../styles/ContentMgmt.css';


const TabIcon = ({ type, active }) => {
  const c = active ? '#FFFFFF' : '#0A0A0A';

  if (type === 'events') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }

  if (type === 'announcements') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }

  if (type === 'jobs') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    );
  }

  if (type === 'discounts') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    );
  }

  return null;
};

const ArchiveButtonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8V19a2 2 0 0 0 2 2H17a2 2 0 0 0 2-2V8" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const RestoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20a8 8 0 0 0-8-8H4" />
  </svg>
);

const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.33" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
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

const ModalFooter = ({ onCancel, createLabel }) => (
  <div className="modal-footer">
    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
    <button className="btn-create">{createLabel}</button>
  </div>
);

const AnnouncementModal = ({ open, onClose, mode = 'create' }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    audience: 'All Alumni',
    expiry: '',
  });

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Announcement' : 'Create New Announcement'}
      subtitle={mode === 'edit' ? 'Update announcement details' : 'Create a new announcement for alumni'}
    >
      <div className="modal-form">
        <Field label="Announcement Title" required>
          <input className="field-input" placeholder="Enter announcement title" value={form.title} onChange={(e) => s('title', e.target.value)} />
        </Field>

        <Field label="Content" required>
          <textarea className="field-textarea" placeholder="Enter announcement content" value={form.content} onChange={(e) => s('content', e.target.value)} rows={3} />
        </Field>

        <div className="field-grid">
          <Field label="Priority" required>
            <select className="field-select" value={form.priority} onChange={(e) => s('priority', e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </Field>

          <Field label="Target Audience" required>
            <select className="field-select" value={form.audience} onChange={(e) => s('audience', e.target.value)}>
              <option>All Alumni</option>
              <option>By Program</option>
              <option>By Batch</option>
            </select>
          </Field>
        </div>

        <Field label="Expiry Date" required>
          <input className="field-input" type="date" value={form.expiry} onChange={(e) => s('expiry', e.target.value)} />
        </Field>

        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Announcement' : 'Create Announcement'} />
      </div>
    </Modal>
  );
};

const EventModal = ({ open, onClose, mode = 'create' }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    category: 'Reunion',
    startTime: '',
    endTime: '',
    location: '',
  });

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Event' : 'Create New Event'}
      subtitle={mode === 'edit' ? 'Update event details' : 'Create a new event for alumni'}
    >
      <div className="modal-form">
        <Field label="Event Title" required>
          <input className="field-input" placeholder="Enter event title" value={form.title} onChange={(e) => s('title', e.target.value)} />
        </Field>

        <Field label="Description" required>
          <textarea className="field-textarea" placeholder="Enter event description" value={form.description} onChange={(e) => s('description', e.target.value)} rows={3} />
        </Field>

        <div className="field-grid">
          <Field label="Date" required>
            <input className="field-input" type="date" value={form.date} onChange={(e) => s('date', e.target.value)} />
          </Field>

          <Field label="Category" required>
            <select className="field-select" value={form.category} onChange={(e) => s('category', e.target.value)}>
              <option>Reunion</option>
              <option>Career Talk</option>
              <option>Sports</option>
              <option>Summit</option>
              <option>Webinar</option>
              <option>Other</option>
            </select>
          </Field>
        </div>

        <div className="field-grid">
          <Field label="Start Time" required>
            <input className="field-input" type="time" value={form.startTime} onChange={(e) => s('startTime', e.target.value)} />
          </Field>

          <Field label="End Time" required>
            <input className="field-input" type="time" value={form.endTime} onChange={(e) => s('endTime', e.target.value)} />
          </Field>
        </div>

        <Field label="Location" required>
          <input className="field-input" placeholder="Enter event location" value={form.location} onChange={(e) => s('location', e.target.value)} />
        </Field>

        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Event' : 'Create Event'} />
      </div>
    </Modal>
  );
};

const JobModal = ({ open, onClose, mode = 'create' }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Full-time',
    expiry: '',
  });

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Job' : 'Create New Job'}
      subtitle={mode === 'edit' ? 'Update job details' : 'Create a new job for alumni'}
    >
      <div className="modal-form">
        <Field label="Job Title" required>
          <input className="field-input" placeholder="Enter job title" value={form.title} onChange={(e) => s('title', e.target.value)} />
        </Field>

        <Field label="Description" required>
          <textarea className="field-textarea" placeholder="Enter job description" value={form.description} onChange={(e) => s('description', e.target.value)} rows={3} />
        </Field>

        <div className="field-grid">
          <Field label="Location" required>
            <input className="field-input" placeholder="Enter job location" value={form.location} onChange={(e) => s('location', e.target.value)} />
          </Field>

          <Field label="Category" required>
            <select className="field-select" value={form.category} onChange={(e) => s('category', e.target.value)}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Remote</option>
            </select>
          </Field>
        </div>

        <Field label="Expiry Date" required>
          <input className="field-input" type="date" value={form.expiry} onChange={(e) => s('expiry', e.target.value)} />
        </Field>

        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Job' : 'Create Job'} />
      </div>
    </Modal>
  );
};

const DiscountModal = ({ open, onClose, mode = 'create' }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    percentage: '',
    audience: 'All Alumni',
    expiry: '',
  });

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Discount' : 'Create New Discount'}
      subtitle={mode === 'edit' ? 'Update discount details' : 'Create a new discount for alumni'}
    >
      <div className="modal-form">
        <Field label="Discount Title" required>
          <input className="field-input" placeholder="Enter discount title" value={form.title} onChange={(e) => s('title', e.target.value)} />
        </Field>

        <Field label="Description" required>
          <textarea className="field-textarea" placeholder="Enter discount description" value={form.description} onChange={(e) => s('description', e.target.value)} rows={3} />
        </Field>

        <div className="field-grid">
          <Field label="Discount Percentage" required>
            <input className="field-input" placeholder="Enter discount percentage" value={form.percentage} onChange={(e) => s('percentage', e.target.value)} />
          </Field>

          <Field label="Target Audience" required>
            <select className="field-select" value={form.audience} onChange={(e) => s('audience', e.target.value)}>
              <option>All Alumni</option>
              <option>By Program</option>
              <option>By Batch</option>
            </select>
          </Field>
        </div>

        <Field label="Expiry Date" required>
          <input className="field-input" type="date" value={form.expiry} onChange={(e) => s('expiry', e.target.value)} />
        </Field>

        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Discount' : 'Create Discount'} />
      </div>
    </Modal>
  );
};

const TabContent = ({ tab, tabConfig, onOpenCreate }) => {
  const cfg = tabConfig[tab];

  return (
    <div className="tab-content-card">
      <div className="section-header">
        <span className="section-title">{cfg.sectionTitle}</span>
        <button className="btn-create" onClick={onOpenCreate}>{cfg.createLabel}</button>
      </div>

      <div className="content-two-column">
        <div className="create-card" onClick={onOpenCreate}>
          <div className="create-card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="create-card-title">{cfg.createLabel}</span>
          <span className="create-card-desc">{cfg.createDesc}</span>
        </div>

        <div className="empty-state-card">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="empty-state-title">{cfg.emptyTitle}</span>
          <span className="empty-state-desc">{cfg.emptyDesc}</span>
        </div>
      </div>
    </div>
  );
};

const ArchiveList = ({ archivedItems, onCloseArchive }) => {
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

              <button className="restore-btn" type="button">
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="tab-bar-icon"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>

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
            <ArchiveList archivedItems={archivedItems} onCloseArchive={() => setShowArchive(false)} />
          ) : (
            <TabContent tab={activeTab} tabConfig={tabConfig} onOpenCreate={openCreate} />
          )}
        </main>
      </div>

      {!showArchive && activeTab === 'events' && (
        <EventModal open={modalOpen} onClose={closeModal} mode={modalMode} />
      )}
      {!showArchive && activeTab === 'announcements' && (
        <AnnouncementModal open={modalOpen} onClose={closeModal} mode={modalMode} />
      )}
      {!showArchive && activeTab === 'jobs' && (
        <JobModal open={modalOpen} onClose={closeModal} mode={modalMode} />
      )}
      {!showArchive && activeTab === 'discounts' && (
        <DiscountModal open={modalOpen} onClose={closeModal} mode={modalMode} />
      )}
    </>
  );
};

export default Contentmgmtview;
