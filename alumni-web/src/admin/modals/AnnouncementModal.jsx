import React, { useState, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from 'react-icons/fa';

// ── Shared modal shell ────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6"  y2="18" />
            <line x1="6"  y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="field-wrap">
    <label className="field-label">
      {label}
      {required && <span className="field-required"> *</span>}
    </label>
    {children}
  </div>
);

// ── Footer ────────────────────────────────────────────────────────────────────
const ModalFooter = ({ onCancel, createLabel, loading, onSubmit }) => (
  <div className="modal-footer">
    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
    <button className="btn-create" onClick={onSubmit} disabled={loading}>
      {loading ? 'Saving...' : createLabel}
    </button>
  </div>
);

// ── Rich text editor ──────────────────────────────────────────────────────────
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = React.useRef(null);

  const execCommand = (command) => {
    document.execCommand(command, false, null);
    onChange(editorRef.current.innerHTML);
    editorRef.current.focus();
  };

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <button type="button" className="toolbar-btn" onClick={() => execCommand('bold')}          title="Bold">          <FaBold        size={13} /></button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('italic')}        title="Italic">        <FaItalic      size={13} /></button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('underline')}     title="Underline">     <FaUnderline   size={13} /></button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyLeft')}   title="Align Left">    <FaAlignLeft   size={13} /></button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyCenter')} title="Align Center">  <FaAlignCenter size={13} /></button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyRight')}  title="Align Right">   <FaAlignRight  size={13} /></button>
      </div>
      <div
        ref={editorRef}
        className="rich-text-content"
        contentEditable="true"
        onInput={() => onChange(editorRef.current.innerHTML)}
        data-placeholder={placeholder}
        style={{ minHeight: '100px' }}
      />
    </div>
  );
};

// ── AnnouncementModal ─────────────────────────────────────────────────────────
// No image upload — announcements are text-only.
const AnnouncementModal = ({ open, onClose, mode, announcement, onCreate, onUpdate }) => {
  const [form, setForm] = useState({
    title:    '',
    content:  '',
    priority: 'Medium',
    audience: 'All Alumni',
    expiry:   '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && announcement) {
      setForm({
        title:    announcement.title    || '',
        content:  announcement.content  || '',
        priority: announcement.priority || 'Medium',
        audience: announcement.audience || 'All Alumni',
        expiry:   announcement.expiry   || '',
      });
    } else {
      setForm({ title: '', content: '', priority: 'Medium', audience: 'All Alumni', expiry: '' });
    }
  }, [mode, announcement]);

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'edit' && announcement) {
        await onUpdate(announcement.id, form);
      } else {
        await onCreate(form);
      }
    } catch (err) {
      console.error('[AnnouncementModal] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Announcement' : 'Create New Announcement'}
      subtitle={mode === 'edit' ? 'Update announcement details' : 'Create a new announcement for alumni'}
    >
      <div className="modal-form">
        <Field label="Announcement Title" required>
          <input
            className="field-input"
            placeholder="Enter announcement title"
            value={form.title}
            onChange={(e) => s('title', e.target.value)}
          />
        </Field>

        <Field label="Content" required>
          <RichTextEditor
            value={form.content}
            onChange={(content) => s('content', content)}
            placeholder="Enter announcement content..."
          />
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

        <Field label="Expiry Date">
          <input
            className="field-input"
            type="date"
            value={form.expiry}
            onChange={(e) => s('expiry', e.target.value)}
          />
        </Field>

        <ModalFooter
          onCancel={onClose}
          createLabel={mode === 'edit' ? 'Update Announcement' : 'Create Announcement'}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
};

export default AnnouncementModal;