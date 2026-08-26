import React, { useState, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight
} from 'react-icons/fa';
import { FiImage, FiTrash2, FiX } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
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

const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;

  return (
    <div className="cm-modal-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cm-modal-close" onClick={onClose}>
          <FiX size={16} />
        </button>
        <h2 className="cm-modal-title">{title}</h2>
        <p className="cm-modal-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div className="cm-field">
    <label className="cm-label">
      {label}
      {required && <span className="cm-label-required"> *</span>}
    </label>
    {children}
  </div>
);

const ModalFooter = ({ onCancel, createLabel, loading, onSubmit }) => (
  <div className="cm-modal-actions">
    <button className="cm-btn-cancel" onClick={onCancel}>Cancel</button>
    <button className="cm-btn-submit" onClick={onSubmit} disabled={loading}>
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
    <div className="cm-rich-editor">
      <div className="cm-rich-toolbar">
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('bold')} title="Bold">
          <FaBold size={14} />
        </button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('italic')} title="Italic">
          <FaItalic size={14} />
        </button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('underline')} title="Underline">
          <FaUnderline size={14} />
        </button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyLeft')} title="Align Left">
          <FaAlignLeft size={14} />
        </button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyCenter')} title="Align Center">
          <FaAlignCenter size={14} />
        </button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyRight')} title="Align Right">
          <FaAlignRight size={14} />
        </button>
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

// Retained for reference/backwards-compat (JobModal now uses MultiImageUpload
// via the "Company Photos" field below), but styled with cm- classes in case
// it's used elsewhere.
const ImageUpload = ({ onImageUpload, currentImage, bucketName = 'job-images', folder = 'jobs' }) => {
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
    <div className="cm-image-upload-container">
      {preview && (
        <div className="cm-image-preview">
          <img src={preview} alt="Preview" />
          <button type="button" className="cm-remove-image-btn" onClick={handleRemove}>
            <FiTrash2 size={12} />
          </button>
        </div>
      )}
      <div className="cm-image-upload-area" onClick={() => document.getElementById('job-image-input').click()}>
        {uploading ? (
          <div className="uploading-spinner"></div>
        ) : (
          <FiImage size={20} color="#155DFC" />
        )}
        <span>{uploading ? 'Uploading...' : (preview ? 'Change Logo' : 'Upload Company Logo')}</span>
        <input
          id="job-image-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>
      <p className="cm-field-hint">Recommended: Square logo, max 2MB</p>
    </div>
  );
};

const JobModal = ({ open, onClose, mode, job, onCreate, onUpdate }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    category: 'Full-time',
    salary_range: '',
    tags: '',
    expiry: '',
    image_urls: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && job) {
      setForm({
        title: job.title || '',
        description: job.description || '',
        company: job.company || '',
        location: job.location || '',
        category: job.category || 'Full-time',
        salary_range: job.salary_range || '',
        tags: Array.isArray(job.tags) ? job.tags.join(', ') : job.tags || '',
        expiry: job.expires_at ? new Date(job.expires_at).toISOString().split('T')[0] : '',
        image_urls: job.image_urls?.length ? job.image_urls : (job.image_url ? [job.image_url] : []),
      });
    } else {
      setForm({
        title: '',
        description: '',
        company: '',
        location: '',
        category: 'Full-time',
        salary_range: '',
        tags: '',
        expiry: '',
        image_urls: [],
      });
    }
  }, [mode, job]);

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
    console.log('[JobModal] Submitting form:', form);
    setLoading(true);
    try {
      if (mode === 'edit' && job) {
        await onUpdate(job.id, form);
      } else {
        await onCreate(form);
      }
    } catch (error) {
      console.error('[JobModal] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Job' : 'Create New Job'}
      subtitle={mode === 'edit' ? 'Update job details' : 'Create a new job for alumni'}
    >
      <div className="cm-modal-fields">
        <Field label="Job Title" required>
          <input className="cm-input" placeholder="Enter job title" value={form.title} onChange={(e) => s('title', e.target.value)} />
        </Field>

        <Field label="Company" required>
          <input className="cm-input" placeholder="Enter company name" value={form.company} onChange={(e) => s('company', e.target.value)} />
        </Field>

        <Field label="Company Photos">
          <MultiImageUpload
            images={form.image_urls}
            onChange={(urls) => s('image_urls', urls)}
            bucketName="job-images"
            folder="jobs"
            label="Upload Photos"
            classPrefix="cm-"
          />
        </Field>

        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(content) => s('description', content)}
            placeholder="Enter job description, responsibilities, and requirements..."
          />
        </Field>

        <div className="cm-field-grid">
          <Field label="Location" required>
            <input className="cm-input" placeholder="Enter job location" value={form.location} onChange={(e) => s('location', e.target.value)} />
          </Field>

          <Field label="Category" required>
            <select className="cm-select" value={form.category} onChange={(e) => s('category', e.target.value)}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Remote</option>
            </select>
          </Field>
        </div>

        <div className="cm-field-grid">
          <Field label="Salary Range">
            <input className="cm-input" placeholder="e.g. ₱30,000 - ₱50,000" value={form.salary_range} onChange={(e) => s('salary_range', e.target.value)} />
          </Field>

          <Field label="Requirements/Tags">
            <input className="cm-input" placeholder="e.g. Graphic Design, Multimedia Arts, Fine Arts" value={form.tags} onChange={(e) => s('tags', e.target.value)} />
          </Field>
        </div>

        <Field label="Expiry Date">
          <input className="cm-input" type="date" value={form.expiry} min={getTodayDateString()} onChange={handleDateFieldChange('expiry')} />
        </Field>

        <ModalFooter
          onCancel={onClose}
          createLabel={mode === 'edit' ? 'Update Job' : 'Create Job'}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
};

export default JobModal;