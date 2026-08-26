import React, { useState, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from 'react-icons/fa';
import { FiX, FiChevronDown } from 'react-icons/fi';
import MultiImageUpload from '../modals/MultiImageUpload';
import '../modals/Disc.css';

// ── Date restriction helper ───────────────────────────────────────────────────
// Returns today's date as 'YYYY-MM-DD' (local time), used as the `min` for
// date inputs so past dates cannot be selected. Computed at render time so it
// stays correct on any future day.
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

// ── EventModal ────────────────────────────────────────────────────────────────
const EventModal = ({ open, onClose, mode, event, onCreate, onUpdate }) => {
  const [form, setForm] = useState({
    title:       '',
    description: '',
    date:        '',
    category:    'Upcoming Events',
    startTime:   '',
    endTime:     '',
    location:    '',
    image_urls:  [], // ← CHANGED: was image_url (single), now array like Job/Discount/Reward
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && event) {
      setForm({
        title:       event.title       || '',
        description: event.description || '',
        date:        event.event_date  ? new Date(event.event_date).toISOString().split('T')[0] : '',
        category:    event.category    || 'Upcoming Events',
        startTime:   event.event_date  ? new Date(event.event_date).toTimeString().slice(0, 5)  : '',
        endTime:     event.end_time    || '',
        location:    event.location    || '',
        // ← CHANGED: same fallback pattern as JobModal/DiscountModal/RewardModal —
        //   use image_urls if present, else wrap a legacy single image_url into an array.
        image_urls:  event.image_urls?.length ? event.image_urls : (event.image_url ? [event.image_url] : []),
      });
    } else {
      setForm({
        title: '', description: '', date: '',
        category: 'Upcoming Events', startTime: '', endTime: '', location: '',
        image_urls: [], // ← CHANGED
      });
    }
  }, [mode, event]);

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Guards a date field against past dates regardless of entry method
  // (calendar click, typed digits, or paste). `min` on the input restricts
  // the calendar UI; this catches any value that still slips through.
  const handleDateFieldChange = (k) => (e) => {
    const val = e.target.value;
    const today = getTodayDateString();
    s(k, val && val < today ? today : val);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'edit' && event) {
        await onUpdate(event.id, form);
      } else {
        await onCreate(form);
      }
    } catch (err) {
      console.error('[EventModal] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Event' : 'Create New Event'}
      subtitle={mode === 'edit' ? 'Update event details' : 'Create a new event for alumni'}
    >
      <div className="cm-modal-fields">
        <Field label="Event Title" required>
          <input
            className="cm-input"
            placeholder="Enter event title"
            value={form.title}
            onChange={(e) => s('title', e.target.value)}
          />
        </Field>

        {/* ── CHANGED: single ImageUpload → MultiImageUpload, same as Job/Discount/Reward ── */}
        <Field label="Event Photos">
          <MultiImageUpload
            images={form.image_urls}
            onChange={(urls) => s('image_urls', urls)}
            bucketName="event-images"
            folder="events"
            label="Upload Photos"
            classPrefix="cm-"
          />
        </Field>

        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(content) => s('description', content)}
            placeholder="Enter event description..."
          />
        </Field>

        <div className="cm-field-grid">
          <Field label="Date" required>
            <input
              className="cm-input"
              type="date"
              value={form.date}
              min={getTodayDateString()}
              onChange={handleDateFieldChange('date')}
            />
          </Field>
          <Field label="Category" required>
            <div className="cm-select-wrap">
              <select className="cm-select" value={form.category} onChange={(e) => s('category', e.target.value)}>
                <option>Upcoming Events</option>
                <option>Exclusive Events</option>
              </select>
              <FiChevronDown size={14} className="cm-select-arrow" />
            </div>
          </Field>
        </div>

        <div className="cm-field-grid">
          <Field label="Start Time" required>
            <input className="cm-input" type="time" value={form.startTime} onChange={(e) => s('startTime', e.target.value)} />
          </Field>
          <Field label="End Time">
            <input className="cm-input" type="time" value={form.endTime} onChange={(e) => s('endTime', e.target.value)} />
          </Field>
        </div>

        <Field label="Location" required>
          <input
            className="cm-input"
            placeholder="Enter event location"
            value={form.location}
            onChange={(e) => s('location', e.target.value)}
          />
        </Field>

        <ModalFooter
          onCancel={onClose}
          createLabel={mode === 'edit' ? 'Update Event' : 'Create Event'}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
};

export default EventModal;