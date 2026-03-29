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

const ModalFooter = ({ onCancel, createLabel, loading }) => (
  <div className="modal-footer">
    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
    <button className="btn-create" disabled={loading}>
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

// Image Upload Component for Jobs
const ImageUpload = ({ onImageUpload, currentImage }) => {
  const [preview, setPreview] = useState(currentImage || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-upload-container">
      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button type="button" className="remove-image-btn" onClick={() => { setPreview(null); onImageUpload(null); }}>
          <FiTrash2 size={12} />
        </button>
        </div>
      )}
      <div className="image-upload-area" onClick={() => document.getElementById('event-image-input').click()}>
      <FiImage size={20} color="#155DFC" />
      <span>{preview ? 'Change Image' : 'Upload Event Image'}</span>
      <input id="event-image-input" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
    </div>
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
    image: null,
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
        image: job.image_url || null,
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
        image: null,
      });
    }
  }, [mode, job]);

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    if (mode === 'edit' && job) {
      await onUpdate(job.id, form);
    } else {
      await onCreate(form);
    }
    setLoading(false);
  };

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

        <Field label="Company" required>
          <input className="field-input" placeholder="Enter company name" value={form.company} onChange={(e) => s('company', e.target.value)} />
        </Field>

        <Field label="Company Logo">
          <ImageUpload
            currentImage={form.image}
            onImageUpload={(image) => s('image', image)}
          />
        </Field>

        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(content) => s('description', content)}
            placeholder="Enter job description, responsibilities, and requirements..."
          />
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

        <div className="field-grid">
          <Field label="Salary Range">
            <input className="field-input" placeholder="e.g. ₱30,000 - ₱50,000" value={form.salary_range} onChange={(e) => s('salary_range', e.target.value)} />
          </Field>

          <Field label="Requirements/Tags (comma-separated)">
            <input className="field-input" placeholder="e.g. Graphic Design, Multimedia Arts, Fine Arts" value={form.tags} onChange={(e) => s('tags', e.target.value)} />
          </Field>
        </div>

        <Field label="Expiry Date">
          <input className="field-input" type="date" value={form.expiry} onChange={(e) => s('expiry', e.target.value)} />
        </Field>

        <ModalFooter onCancel={onClose} createLabel={mode === 'edit' ? 'Update Job' : 'Create Job'} loading={loading} />
      </div>
    </Modal>
  );
};

export default JobModal;