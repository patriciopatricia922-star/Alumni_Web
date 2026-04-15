import React, { useState, useEffect } from 'react';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaAlignLeft, 
  FaAlignCenter, 
  FaAlignRight 
} from 'react-icons/fa';
import { FiImage, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';

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

// FIXED: Added onSubmit prop
const ModalFooter = ({ onCancel, createLabel, loading, onSubmit }) => (
  <div className="modal-footer">
    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
    <button className="btn-create" onClick={onSubmit} disabled={loading}>
      {loading ? 'Saving...' : createLabel}
    </button>
  </div>
);

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = React.useRef(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    const content = editorRef.current.innerHTML;
    onChange(content);
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
        <button type="button" className="toolbar-btn" onClick={() => execCommand('bold')} title="Bold">
          <FaBold size={14} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('italic')} title="Italic">
          <FaItalic size={14} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('underline')} title="Underline">
          <FaUnderline size={14} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyLeft')} title="Align Left">
          <FaAlignLeft size={14} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyCenter')} title="Align Center">
          <FaAlignCenter size={14} />
        </button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyRight')} title="Align Right">
          <FaAlignRight size={14} />
        </button>
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

const ImageUpload = ({ onImageUpload, currentImage, bucketName = 'event-images', folder = 'events' }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);

  const uploadToSupabase = async (file) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const publicUrl = await uploadToSupabase(file);
      if (publicUrl) {
        onImageUpload(publicUrl);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUpload(null);
  };

  return (
    <div className="image-upload-container">
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button type="button" className="remove-image-btn" onClick={handleRemove}>
            <FiTrash2 size={12} />
          </button>
        </div>
      )}
      <div className="image-upload-area" onClick={() => document.getElementById('event-image-input').click()}>
        {uploading ? (
          <div className="uploading-spinner"></div>
        ) : (
          <FiImage size={20} color="#155DFC" />
        )}
        <span>{uploading ? 'Uploading...' : (preview ? 'Change Image' : 'Upload Image')}</span>
        <input 
          id="event-image-input" 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          style={{ display: 'none' }} 
          disabled={uploading}
        />
      </div>
      <p className="field-hint">Supported formats: JPG, PNG, GIF. Max size: 5MB</p>
    </div>
  );
};

const EventModal = ({ open, onClose, mode, event, onCreate, onUpdate }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    category: 'Upcoming Events',
    startTime: '',
    endTime: '',
    location: '',
    image_url: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
        category: event.category || 'Upcoming Events',
        startTime: event.event_date ? new Date(event.event_date).toTimeString().slice(0, 5) : '',
        endTime: event.end_time || '',
        location: event.location || '',
        image_url: event.image_url || null,
      });
    } else {
      setForm({
        title: '',
        description: '',
        date: '',
        category: 'Upcoming Events',
        startTime: '',
        endTime: '',
        location: '',
        image_url: null,
      });
    }
  }, [mode, event]);

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    console.log('[EventModal] Submitting form:', form);
    setLoading(true);
    try {
      if (mode === 'edit' && event) {
        await onUpdate(event.id, form);
      } else {
        await onCreate(form);
      }
    } catch (error) {
      console.error('[EventModal] Error:', error);
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
      <div className="modal-form">
        <Field label="Event Title" required>
          <input className="field-input" placeholder="Enter event title" value={form.title} onChange={(e) => s('title', e.target.value)} />
        </Field>

        <Field label="Event Image">
          <ImageUpload
            currentImage={form.image_url}
            onImageUpload={(url) => s('image_url', url)}
            bucketName="event-images"
            folder="events"
          />
        </Field>

        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(content) => s('description', content)}
            placeholder="Enter event description..."
          />
        </Field>

        <div className="field-grid">
          <Field label="Date" required>
            <input className="field-input" type="date" value={form.date} onChange={(e) => s('date', e.target.value)} />
          </Field>

          <Field label="Category" required>
            <select className="field-select" value={form.category} onChange={(e) => s('category', e.target.value)}>
              <option>Upcoming Events</option>
              <option>Exclusive Events</option>
            </select>
          </Field>
        </div>

        <div className="field-grid">
          <Field label="Start Time" required>
            <input className="field-input" type="time" value={form.startTime} onChange={(e) => s('startTime', e.target.value)} />
          </Field>

          <Field label="End Time">
            <input className="field-input" type="time" value={form.endTime} onChange={(e) => s('endTime', e.target.value)} />
          </Field>
        </div>

        <Field label="Location" required>
          <input className="field-input" placeholder="Enter event location" value={form.location} onChange={(e) => s('location', e.target.value)} />
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