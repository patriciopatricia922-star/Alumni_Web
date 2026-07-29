import React, { useState, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import MultiImageUpload from '../modals/MultiImageUpload';
import '../modals/Disc.css';

// ── Shared modal shell ────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;
  return (
    <div className="cm-modal-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cm-modal-close" onClick={onClose} aria-label="Close">
          <FiX size={16} />
        </button>
        <h2 className="cm-modal-title">{title}</h2>
        <p className="cm-modal-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="cm-field">
    <label className="cm-label">
      {label}
      {required && <span className="cm-label-required"> *</span>}
    </label>
    {children}
  </div>
);

// ── Footer ────────────────────────────────────────────────────────────────────
const ModalFooter = ({ onCancel, createLabel, loading, onSubmit }) => (
  <div className="cm-modal-actions">
    <button className="cm-btn-cancel" onClick={onCancel}>Cancel</button>
    <button className="cm-btn-submit" onClick={onSubmit} disabled={loading}>
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
    <div className="cm-rich-editor">
      <div className="cm-rich-toolbar">
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('bold')}          title="Bold">          <FaBold        size={13} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('italic')}        title="Italic">        <FaItalic      size={13} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('underline')}     title="Underline">     <FaUnderline   size={13} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyLeft')}   title="Align Left">    <FaAlignLeft   size={13} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyCenter')} title="Align Center">  <FaAlignCenter size={13} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyRight')}  title="Align Right">   <FaAlignRight  size={13} /></button>
      </div>
      <div
        ref={editorRef}
        className="cm-rich-content"
        contentEditable="true"
        onInput={() => onChange(editorRef.current.innerHTML)}
        data-placeholder={placeholder}
        style={{ minHeight: '100px' }}
      />
    </div>
  );
};

// ── AnnouncementModal ─────────────────────────────────────────────────────────
const AnnouncementModal = ({ open, onClose, mode, announcement, onCreate, onUpdate }) => {
  const [form, setForm] = useState({
    title:      '',
    content:    '',
    priority:   'Medium',
    audience:   'All Alumni',
    expiry:     '',
    image_urls: [], // ← CHANGED: was image_url (single), now array like Job/Discount/Reward
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && announcement) {
      setForm({
        title:      announcement.title    || '',
        content:    announcement.content  || '',
        priority:   announcement.priority || 'Medium',
        audience:   announcement.audience || 'All Alumni',
        expiry:     announcement.expiry   || '',
        // ← CHANGED: same fallback pattern as JobModal/DiscountModal/RewardModal
        image_urls: announcement.image_urls?.length ? announcement.image_urls : (announcement.image_url ? [announcement.image_url] : []),
      });
    } else {
      setForm({ title: '', content: '', priority: 'Medium', audience: 'All Alumni', expiry: '', image_urls: [] });
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
      <div className="cm-modal-fields">
        <Field label="Announcement Title" required>
          <input
            className="cm-input"
            placeholder="Enter announcement title"
            value={form.title}
            onChange={(e) => s('title', e.target.value)}
          />
        </Field>

        {/* ── CHANGED: single ImageUpload → MultiImageUpload, same as Job/Discount/Reward ── */}
        <Field label="Announcement Photos">
          <MultiImageUpload
            images={form.image_urls}
            onChange={(urls) => s('image_urls', urls)}
            bucketName="announcement-images"
            folder="announcements"
            label="Upload Photos"
            classPrefix="cm-"
          />
        </Field>

        <Field label="Content" required>
          <RichTextEditor
            value={form.content}
            onChange={(content) => s('content', content)}
            placeholder="Enter announcement content..."
          />
        </Field>

        <div className="cm-field-grid">
          <Field label="Priority" required>
            <select className="cm-select" value={form.priority} onChange={(e) => s('priority', e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </Field>
          <Field label="Target Audience" required>
            <select className="cm-select" value={form.audience} onChange={(e) => s('audience', e.target.value)}>
              <option>All Alumni</option>
              <option>By Program</option>
              <option>By Batch</option>
            </select>
          </Field>
        </div>

        <Field label="Expiry Date">
          <input
            className="cm-input"
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