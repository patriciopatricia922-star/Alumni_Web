import React, { useState } from 'react';
import SuperAdSidebar from '../superadmin/SuperAdsidebar';

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Arimo:wght@400;500;600;700&display=swap');`;

const GLOBAL_STYLE = `
${FONT_IMPORT}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Arimo', Arial, sans-serif; }

.eng-tab {
  position: relative;
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  font-family: 'Arimo', Arial; font-size: 14px; font-weight: 400;
  color: #0A0A0A; cursor: pointer;
  border: 0.24px solid #666666;
  border-radius: 8px;
  background: #FFFFFF;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.eng-tab.active {
  background: #001947;
  border-color: rgba(0,0,0,0.1);
  color: #FFFFFF;
}
.eng-tab:hover:not(.active) { background: #F1F5F9; }

/* Modal overlay */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  background: #FFFFFF;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1);
  border-radius: 10px;
  width: 512px;
  padding: 25px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-close {
  position: absolute; top: 17px; right: 17px;
  background: none; border: none; cursor: pointer;
  opacity: 0.7; border-radius: 2px; padding: 2px;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { opacity: 1; }

/* Form fields */
.field-label {
  display: block;
  font-family: 'Arimo', Arial; font-size: 14px; color: #0A0A0A;
  margin-bottom: 6px;
}
.field-input {
  width: 100%; height: 36px;
  background: #F3F3F5; border: none; border-radius: 8px;
  padding: 4px 12px;
  font-family: 'Arimo', Arial; font-size: 14px; color: #0A0A0A;
  outline: none;
}
.field-input::placeholder { color: #717182; }
.field-input:focus { box-shadow: 0 0 0 2px rgba(21,93,252,0.15); }

.field-textarea {
  width: 100%;
  background: #F3F3F5; border: none; border-radius: 8px;
  padding: 8px 12px;
  font-family: 'Arimo', Arial; font-size: 14px; color: #0A0A0A;
  outline: none; resize: vertical; min-height: 64px; line-height: 1.5;
}
.field-textarea::placeholder { color: #717182; }
.field-textarea:focus { box-shadow: 0 0 0 2px rgba(21,93,252,0.15); }

.field-select {
  width: 100%; height: 36px;
  background: #F3F3F5; border: none; border-radius: 8px;
  padding: 0 12px;
  font-family: 'Arimo', Arial; font-size: 14px; color: #0A0A0A;
  outline: none; cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23717182' stroke-width='1.33' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
}
.field-select:focus { box-shadow: 0 0 0 2px rgba(21,93,252,0.15); }

/* Buttons */
.btn-cancel {
  padding: 8px 16px; border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  background: #FFFFFF; font-family: 'Arimo', Arial; font-size: 14px;
  color: #0A0A0A; cursor: pointer;
}
.btn-cancel:hover { background: #F3F4F6; }

.btn-create {
  padding: 8px 16px; border-radius: 8px; border: none;
  background: #001947; font-family: 'Arimo', Arial; font-size: 14px;
  color: #FFFFFF; cursor: pointer;
}
.btn-create:hover { background: #002570; }

/* Create card hover */
.create-card {
  flex: 1 1 0; min-width: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  padding: 32px 24px;
  background: #F8FAFC; border: 1px solid #CAD5E2;
  border-radius: 14px; cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-align: center;
}
.create-card:hover { border-color: #155DFC; background: #F0F6FF; }
`;

/* ─── Tab Icons ─────────────────────────────────────────────────────────── */
const TabIcon = ({ type, active }) => {
  const c = active ? '#FFFFFF' : '#0A0A0A';
  if (type === 'events') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
  if (type === 'announcements') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
  if (type === 'jobs') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  );
  if (type === 'discounts') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  );
  return null;
};

/* ─── Shared Modal Shell ─────────────────────────────────────────────────── */
const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.33" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h2 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: 18, color: '#0A0A0A', marginBottom: 6 }}>{title}</h2>
        <p style={{ fontFamily: 'Arimo, Arial', fontSize: 14, color: '#717182', marginBottom: 20 }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, required, children, style = {} }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
    <label className="field-label">
      {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
    </label>
    {children}
  </div>
);

const ModalFooter = ({ onCancel, createLabel }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
    <button className="btn-create">{createLabel}</button>
  </div>
);

/* ─── CREATE ANNOUNCEMENT MODAL ─────────────────────────────────────────── */
const AnnouncementModal = ({ open, onClose, mode = 'create' }) => {
  const [form, setForm] = useState({ title: '', content: '', priority: 'Medium', audience: 'All Alumni', expiry: '' });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal open={open} onClose={onClose}
      title={mode === 'edit' ? 'Edit Announcement' : 'Create New Announcement'}
      subtitle={mode === 'edit' ? 'Update announcement details' : 'Create a new announcement for alumni'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Announcement Title" required>
          <input className="field-input" placeholder="Enter announcement title" value={form.title} onChange={e => s('title', e.target.value)} />
        </Field>
        <Field label="Content" required>
          <textarea className="field-textarea" placeholder="Enter announcement content" value={form.content} onChange={e => s('content', e.target.value)} rows={3} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Priority" required>
            <select className="field-select" value={form.priority} onChange={e => s('priority', e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </Field>
          <Field label="Target Audience" required>
            <select className="field-select" value={form.audience} onChange={e => s('audience', e.target.value)}>
              <option>All Alumni</option><option>By Program</option><option>By Batch</option>
            </select>
          </Field>
        </div>
        <Field label="Expiry Date" required>
          <input className="field-input" type="date" value={form.expiry} onChange={e => s('expiry', e.target.value)} />
        </Field>
        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Announcement' : 'Create Announcement'} />
      </div>
    </Modal>
  );
};

/* ─── CREATE EVENT MODAL ─────────────────────────────────────────────────── */
const EventModal = ({ open, onClose, mode = 'create' }) => {
  const [form, setForm] = useState({ title: '', description: '', date: '', category: 'Reunion', startTime: '', endTime: '', location: '' });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal open={open} onClose={onClose}
      title={mode === 'edit' ? 'Edit Event' : 'Create New Event'}
      subtitle={mode === 'edit' ? 'Update event details' : 'Create a new event for alumni'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Event Title" required>
          <input className="field-input" placeholder="Enter event title" value={form.title} onChange={e => s('title', e.target.value)} />
        </Field>
        <Field label="Description" required>
          <textarea className="field-textarea" placeholder="Enter event description" value={form.description} onChange={e => s('description', e.target.value)} rows={3} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Date" required>
            <input className="field-input" type="date" value={form.date} onChange={e => s('date', e.target.value)} />
          </Field>
          <Field label="Category" required>
            <select className="field-select" value={form.category} onChange={e => s('category', e.target.value)}>
              <option>Reunion</option><option>Career Talk</option><option>Sports</option>
              <option>Summit</option><option>Webinar</option><option>Other</option>
            </select>
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Start Time" required>
            <input className="field-input" type="time" value={form.startTime} onChange={e => s('startTime', e.target.value)} />
          </Field>
          <Field label="End Time" required>
            <input className="field-input" type="time" value={form.endTime} onChange={e => s('endTime', e.target.value)} />
          </Field>
        </div>
        <Field label="Location" required>
          <input className="field-input" placeholder="Enter event location" value={form.location} onChange={e => s('location', e.target.value)} />
        </Field>
        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Event' : 'Create Event'} />
      </div>
    </Modal>
  );
};

/* ─── CREATE JOB MODAL ───────────────────────────────────────────────────── */
const JobModal = ({ open, onClose, mode = 'create' }) => {
  const [form, setForm] = useState({ title: '', description: '', location: '', category: 'Full-time', expiry: '' });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal open={open} onClose={onClose}
      title={mode === 'edit' ? 'Edit Job' : 'Create New Job'}
      subtitle={mode === 'edit' ? 'Update job details' : 'Create a new job for alumni'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Job Title" required>
          <input className="field-input" placeholder="Enter job title" value={form.title} onChange={e => s('title', e.target.value)} />
        </Field>
        <Field label="Description" required>
          <textarea className="field-textarea" placeholder="Enter job description" value={form.description} onChange={e => s('description', e.target.value)} rows={3} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Location" required>
            <input className="field-input" placeholder="Enter job location" value={form.location} onChange={e => s('location', e.target.value)} />
          </Field>
          <Field label="Category" required>
            <select className="field-select" value={form.category} onChange={e => s('category', e.target.value)}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option>
              <option>Internship</option><option>Remote</option>
            </select>
          </Field>
        </div>
        <Field label="Expiry Date" required>
          <input className="field-input" type="date" value={form.expiry} onChange={e => s('expiry', e.target.value)} />
        </Field>
        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Job' : 'Create Job'} />
      </div>
    </Modal>
  );
};

/* ─── CREATE DISCOUNT MODAL ─────────────────────────────────────────────── */
const DiscountModal = ({ open, onClose, mode = 'create' }) => {
  const [form, setForm] = useState({ title: '', description: '', percentage: '', audience: 'All Alumni', expiry: '' });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal open={open} onClose={onClose}
      title={mode === 'edit' ? 'Edit Discount' : 'Create New Discount'}
      subtitle={mode === 'edit' ? 'Update discount details' : 'Create a new discount for alumni'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Discount Title" required>
          <input className="field-input" placeholder="Enter discount title" value={form.title} onChange={e => s('title', e.target.value)} />
        </Field>
        <Field label="Description" required>
          <textarea className="field-textarea" placeholder="Enter discount description" value={form.description} onChange={e => s('description', e.target.value)} rows={3} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Discount Percentage" required>
            <input className="field-input" placeholder="Enter discount percentage" value={form.percentage} onChange={e => s('percentage', e.target.value)} />
          </Field>
          <Field label="Target Audience" required>
            <select className="field-select" value={form.audience} onChange={e => s('audience', e.target.value)}>
              <option>All Alumni</option><option>By Program</option><option>By Batch</option>
            </select>
          </Field>
        </div>
        <Field label="Expiry Date" required>
          <input className="field-input" type="date" value={form.expiry} onChange={e => s('expiry', e.target.value)} />
        </Field>
        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Discount' : 'Create Discount'} />
      </div>
    </Modal>
  );
};

/* ─── Tab config ─────────────────────────────────────────────────────────── */
const tabConfig = {
  events:        { sectionTitle: 'Event Board',        createLabel: 'Create New Event',        createDesc: 'Schedule events, reunions, and activities for your alumni community.', emptyTitle: 'No events yet',        emptyDesc: 'Events you create will appear here.' },
  announcements: { sectionTitle: 'Announcement Board', createLabel: 'Create New Announcement', createDesc: 'Post updates, news, and events visible to all alumni.',                emptyTitle: 'No announcements yet', emptyDesc: 'Announcements you post will appear here.' },
  jobs:          { sectionTitle: 'Job Board',          createLabel: 'Post a Job',              createDesc: 'Share job opportunities and career openings with alumni.',               emptyTitle: 'No job listings yet', emptyDesc: 'Job postings will appear here once added.' },
  discounts:     { sectionTitle: 'Discount Board',     createLabel: 'Add a Discount',          createDesc: 'Share exclusive deals and partner discounts for alumni.',                emptyTitle: 'No discounts yet',    emptyDesc: 'Discount offers will appear here once added.' },
};

/* ─── Tab Content ────────────────────────────────────────────────────────── */
const TabContent = ({ tab, onOpenCreate }) => {
  const cfg = tabConfig[tab];
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8F0',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
      borderRadius: 14, padding: '32px', display: 'flex', flexDirection: 'column', gap: 32,
    }}>
      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: 18, color: '#0F172B' }}>{cfg.sectionTitle}</span>
        <button className="btn-create" onClick={onOpenCreate}>{cfg.createLabel}</button>
      </div>

      {/* Two-column area */}
      <div style={{ display: 'flex', gap: 24, minHeight: 227 }}>
        {/* Left — create card */}
        <div className="create-card" onClick={onOpenCreate}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: '#FFFFFF',
            boxShadow: '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Arimo, Arial', fontSize: 14, color: '#0F172B' }}>{cfg.createLabel}</span>
          <span style={{ fontFamily: 'Arimo, Arial', fontSize: 12, color: '#62748E', lineHeight: '16px', maxWidth: 160 }}>{cfg.createDesc}</span>
        </div>

        {/* Right — empty state */}
        <div style={{
          flex: '1 1 0', minWidth: 0,
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
          borderRadius: 14,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '32px 24px', gap: 8, textAlign: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span style={{ fontFamily: 'Arimo, Arial', fontSize: 14, fontWeight: 600, color: '#45556C' }}>{cfg.emptyTitle}</span>
          <span style={{ fontFamily: 'Arimo, Arial', fontSize: 12, color: '#94A3B8' }}>{cfg.emptyDesc}</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'events',        label: 'Events' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'jobs',          label: 'Jobs' },
  { key: 'discounts',     label: 'Discounts' },
];

const SuperAdminEngagement = () => {
  const [activeTab,  setActiveTab]  = useState('events');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [modalMode,  setModalMode]  = useState('create'); // 'create' | 'edit'

  const openCreate = () => { setModalMode('create'); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const renderModal = () => {
    const props = { open: modalOpen, onClose: closeModal, mode: modalMode };
    if (activeTab === 'events')        return <EventModal        {...props} />;
    if (activeTab === 'announcements') return <AnnouncementModal {...props} />;
    if (activeTab === 'jobs')          return <JobModal          {...props} />;
    if (activeTab === 'discounts')     return <DiscountModal     {...props} />;
    return null;
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F6F7F8', fontFamily: 'Arimo, Arial' }}>
        <SuperAdSidebar activePage="engagement" />

        <main style={{ marginLeft: '229px', flex: 1, padding: '37px 40px 60px', overflowX: 'hidden', minWidth: 0 }}>

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'Lexend, Arial', fontSize: 30, fontWeight: 700, color: '#101828', margin: '0 0 8px', lineHeight: '36px' }}>
              Alumni Engagement
            </h1>
            <p style={{ fontFamily: 'Arimo, Arial', fontSize: 16, color: '#717182', margin: 0 }}>
              Manage events and announcements for alumni community
            </p>
          </div>

          {/* Tab bar */}
          <div style={{
            background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)',
            padding: '24px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TABS.map(t => (
                <button key={t.key} className={`eng-tab${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => { setActiveTab(t.key); setModalOpen(false); }}>
                  <TabIcon type={t.key} active={activeTab === t.key} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <TabContent key={activeTab} tab={activeTab} onOpenCreate={openCreate} />

        </main>
      </div>

      {/* Modals */}
      {renderModal()}
    </>
  );
};

export default SuperAdminEngagement;