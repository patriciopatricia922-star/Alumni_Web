import React, { useState, useRef, useEffect } from 'react';
import { 
  FaBold, FaItalic, FaUnderline, 
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaImage, FaTrash, FaMapMarkerAlt, FaEnvelope, FaCalendarAlt, 
  FaLink, FaListUl, FaListOl, FaUndo, FaRedo
} from 'react-icons/fa';
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

// Fixed Rich Text Editor Component
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const saveToHistory = (content) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    const content = editorRef.current.innerHTML;
    saveToHistory(content);
    onChange(content);
    editorRef.current.focus();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex];
      editorRef.current.innerHTML = content;
      onChange(content);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const content = history[newIndex];
      editorRef.current.innerHTML = content;
      onChange(content);
    }
  };

  const handleInput = () => {
    const content = editorRef.current.innerHTML;
    saveToHistory(content);
    onChange(content);
  };

  const insertIcon = (iconHtml) => {
    execCommand('insertHTML', iconHtml);
  };

  const icons = {
    location: '<span class="rich-icon" contenteditable="false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>📍 </span>',
    email: '<span class="rich-icon" contenteditable="false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>✉️ </span>',
    calendar: '<span class="rich-icon" contenteditable="false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>📅 </span>',
    link: '<span class="rich-icon" contenteditable="false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>🔗 </span>',
  };

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={() => execCommand('bold')} title="Bold">
            <FaBold size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => execCommand('italic')} title="Italic">
            <FaItalic size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => execCommand('underline')} title="Underline">
            <FaUnderline size={14} />
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyLeft')} title="Align Left">
            <FaAlignLeft size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyCenter')} title="Align Center">
            <FaAlignCenter size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyRight')} title="Align Right">
            <FaAlignRight size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => execCommand('justifyFull')} title="Justify">
            <FaAlignJustify size={14} />
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
            <FaListUl size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => execCommand('insertOrderedList')} title="Numbered List">
            <FaListOl size={14} />
          </button>
        </div>

        <div className="toolbar-group">
          <select
            className="toolbar-select"
            onChange={(e) => {
              if (e.target.value) {
                execCommand('fontSize', e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Font Size</option>
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="6">Extra Large</option>
          </select>
        </div>

        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={() => insertIcon(icons.location)} title="Insert Location Icon">
            <FaMapMarkerAlt size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertIcon(icons.email)} title="Insert Email Icon">
            <FaEnvelope size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertIcon(icons.calendar)} title="Insert Calendar Icon">
            <FaCalendarAlt size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={() => insertIcon(icons.link)} title="Insert Link Icon">
            <FaLink size={14} />
          </button>
        </div>

        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={handleUndo} title="Undo">
            <FaUndo size={14} />
          </button>
          <button type="button" className="toolbar-btn" onClick={handleRedo} title="Redo">
            <FaRedo size={14} />
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="rich-text-content"
        contentEditable="true"
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

// Rich Text Editor for Title (simpler version)
const RichTextTitle = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const saveToHistory = (content) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    const content = editorRef.current.innerHTML;
    saveToHistory(content);
    onChange(content);
    editorRef.current.focus();
  };

  const handleInput = () => {
    const content = editorRef.current.innerHTML;
    saveToHistory(content);
    onChange(content);
  };

  return (
    <div className="rich-text-title-editor">
      <div className="rich-text-title-toolbar">
        <button type="button" className="toolbar-btn-small" onClick={() => execCommand('bold')} title="Bold">
          <FaBold size={12} />
        </button>
        <button type="button" className="toolbar-btn-small" onClick={() => execCommand('italic')} title="Italic">
          <FaItalic size={12} />
        </button>
        <button type="button" className="toolbar-btn-small" onClick={() => execCommand('underline')} title="Underline">
          <FaUnderline size={12} />
        </button>
      </div>
      <div
        ref={editorRef}
        className="rich-text-title-content"
        contentEditable="true"
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

// Image Upload Component
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
          <button
            type="button"
            className="remove-image-btn"
            onClick={() => {
              setPreview(null);
              onImageUpload(null);
            }}
          >
            <FaTrash size={12} />
          </button>
        </div>
      )}
      <div className="image-upload-area" onClick={() => document.getElementById('image-input').click()}>
        <FaImage size={20} />
        <span>{preview ? 'Change Image' : 'Upload Image'}</span>
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

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
          <RichTextTitle
            value={form.title}
            onChange={(content) => s('title', content)}
            placeholder="Enter announcement title..."
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
    image: null,
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
          <RichTextTitle
            value={form.title}
            onChange={(content) => s('title', content)}
            placeholder="Enter event title..."
          />
        </Field>

        <Field label="Event Image">
          <ImageUpload
            currentImage={form.image}
            onImageUpload={(image) => s('image', image)}
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
          <RichTextTitle
            value={form.location}
            onChange={(content) => s('location', content)}
            placeholder="Enter event location..."
          />
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
    image: null,
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
          <RichTextTitle
            value={form.title}
            onChange={(content) => s('title', content)}
            placeholder="Enter job title..."
          />
        </Field>

        <Field label="Job Image">
          <ImageUpload
            currentImage={form.image}
            onImageUpload={(image) => s('image', image)}
          />
        </Field>

        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(content) => s('description', content)}
            placeholder="Enter job description..."
          />
        </Field>

        <div className="field-grid">
          <Field label="Location" required>
            <RichTextTitle
              value={form.location}
              onChange={(content) => s('location', content)}
              placeholder="Enter job location..."
            />
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
    image: null,
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
          <RichTextTitle
            value={form.title}
            onChange={(content) => s('title', content)}
            placeholder="Enter discount title..."
          />
        </Field>

        <Field label="Discount Image">
          <ImageUpload
            currentImage={form.image}
            onImageUpload={(image) => s('image', image)}
          />
        </Field>

        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(content) => s('description', content)}
            placeholder="Enter discount description..."
          />
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