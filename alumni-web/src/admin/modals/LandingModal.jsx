import React, { useState, useEffect } from 'react';
import { FiX, FiImage, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';

// ============================================
// MODAL COMPONENTS
// ============================================
const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX size={16} />
        </button>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, required, children, hint }) => (
  <div className="field-wrap">
    <label className="field-label">
      {label}
      {required && <span className="field-required"> *</span>}
    </label>
    {children}
    {hint && <p className="field-hint">{hint}</p>}
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

// ============================================
// RICH TEXT EDITOR
// ============================================
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = React.useRef(null);

  const execCommand = (command) => {
    document.execCommand(command, false, null);
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
          <span style={{ fontWeight: 'bold' }}>B</span>
        </button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('italic')} title="Italic">
          <span style={{ fontStyle: 'italic' }}>I</span>
        </button>
        <button type="button" className="toolbar-btn" onClick={() => execCommand('underline')} title="Underline">
          <span style={{ textDecoration: 'underline' }}>U</span>
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

// ============================================
// IMAGE UPLOAD COMPONENT
// ============================================
const ImageUpload = ({ onImageUpload, currentImage, bucketName = 'landing-images', folder = 'landing', label = 'Upload Image' }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);

  const uploadToSupabase = async (file) => {
    setUploading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
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
      <div className="image-upload-area" onClick={() => document.getElementById('landing-image-input').click()}>
        {uploading ? (
          <div className="uploading-spinner"></div>
        ) : (
          <FiImage size={20} color="#155DFC" />
        )}
        <span>{uploading ? 'Uploading...' : (preview ? 'Change Image' : label)}</span>
        <input 
          id="landing-image-input" 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          style={{ display: 'none' }} 
          disabled={uploading}
        />
      </div>
      <p className="field-hint">Supported formats: JPG, PNG. Max size: 2MB</p>
    </div>
  );
};

// ============================================
// SECTION TYPES
// ============================================
const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'stats', label: 'Statistics Section' },
  { value: 'events', label: 'Upcoming Events Section' },
  { value: 'jobs', label: 'Job Opportunities Section' },
  { value: 'discounts', label: 'Alumni Discounts Section' },
  { value: 'why_join', label: 'Why Join AlumnAI Section' },
  { value: 'benefits', label: 'What You Get as an Alumni Section' },
  { value: 'footer', label: 'Footer Contact Information' },
];

// ============================================
// HELPER FUNCTION FOR PARSING SEPARATED CONTENT
// ============================================
const parseSeparatedContent = (content, expectedCount = 3) => {
  if (!content) return Array(expectedCount).fill('');
  let parts;
  if (content.includes('\n---\n')) {
    parts = content.split('\n---\n');
  } else if (content.includes('---')) {
    parts = content.split('---');
  } else {
    parts = [content];
  }
  while (parts.length < expectedCount) parts.push('');
  return parts.map(part => part.trim());
};

const joinSeparatedContent = (parts) => {
  return parts.join('\n---\n');
};

// ============================================
// SECTION FORM COMPONENTS
// ============================================

// Hero Section Form
const HeroForm = ({ form, setForm }) => (
  <>
    <Field label="Main Heading" required>
      <input 
        className="field-input" 
        placeholder="e.g., ALUMNI AFFAIRS" 
        value={form.title || ''} 
        onChange={(e) => setForm({ ...form, title: e.target.value })} 
      />
    </Field>
    <Field label="Subheading">
      <input 
        className="field-input" 
        placeholder="e.g., OFFICE OF THE" 
        value={form.description || ''} 
        onChange={(e) => setForm({ ...form, description: e.target.value })} 
      />
    </Field>
    <Field label="Button Text" required>
      <input 
        className="field-input" 
        placeholder="e.g., Explore More" 
        value={form.content || ''} 
        onChange={(e) => setForm({ ...form, content: e.target.value })} 
      />
    </Field>
    <Field label="Background Image">
      <ImageUpload
        currentImage={form.image_url}
        onImageUpload={(url) => setForm({ ...form, image_url: url })}
        bucketName="landing-images"
        folder="hero"
        label="Upload Background Image"
      />
    </Field>
  </>
);

// Statistics Section Form - Clean UX for admin
const StatsForm = ({ form, setForm }) => {
  const numbers = parseSeparatedContent(form.description, 4);
  const labels = parseSeparatedContent(form.content, 4);
  
  const updateNumber = (index, value) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setForm({ ...form, description: joinSeparatedContent(newNumbers) });
  };
  
  const updateLabel = (index, value) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setForm({ ...form, content: joinSeparatedContent(newLabels) });
  };
  
  return (
    <>
      {/* Row 1: Alumni Count (Auto) + Programs Count (Editable) */}
      <div className="field-grid">
        <Field label="Alumni Count" hint="Auto-generated from registered alumni">
          <div className="auto-field">
            <input 
              className="field-input auto-value"
              value="Auto-calculated from database"
              disabled
            />
            <span className="auto-badge">Live Data</span>
          </div>
        </Field>
        <Field label="Programs Count" required>
          <input 
            className="field-input" 
            placeholder="e.g., 44" 
            value={numbers[1] || ''} 
            onChange={(e) => updateNumber(1, e.target.value)} 
          />
        </Field>
      </div>
      
      {/* Row 2: Alumni Label + Programs Label */}
      <div className="field-grid">
        <Field label="Alumni Label">
          <input 
            className="field-input" 
            placeholder="e.g., Alumni" 
            value={labels[0] || ''} 
            onChange={(e) => updateLabel(0, e.target.value)} 
          />
        </Field>
        <Field label="Programs Label">
          <input 
            className="field-input" 
            placeholder="e.g., Undergraduate and Postgraduate Programmes" 
            value={labels[1] || ''} 
            onChange={(e) => updateLabel(1, e.target.value)} 
          />
        </Field>
      </div>
      
      {/* Row 3: Employment Rate (Auto) + University Ranking (Editable) */}
      <div className="field-grid">
        <Field label="Employment Rate" hint="Auto-generated from completed surveys">
          <div className="auto-field">
            <input 
              className="field-input auto-value"
              value="Auto-calculated from database"
              disabled
            />
            <span className="auto-badge">Live Data</span>
          </div>
        </Field>
        <Field label="University Ranking" required>
          <input 
            className="field-input" 
            placeholder="e.g., #1201-1300" 
            value={numbers[3] || ''} 
            onChange={(e) => updateNumber(3, e.target.value)} 
          />
        </Field>
      </div>
      
      {/* Row 4: Employment Rate Label + Ranking Label */}
      <div className="field-grid">
        <Field label="Employment Rate Label">
          <input 
            className="field-input" 
            placeholder="e.g., Employment Rate" 
            value={labels[2] || ''} 
            onChange={(e) => updateLabel(2, e.target.value)} 
          />
        </Field>
        <Field label="Ranking Label">
          <input 
            className="field-input" 
            placeholder="e.g., Asia University Ranking" 
            value={labels[3] || ''} 
            onChange={(e) => updateLabel(3, e.target.value)} 
          />
        </Field>
      </div>
    </>
  );
};

// Events Section Form
const EventsForm = ({ form, setForm }) => (
  <>
    <Field label="Section Title" required>
      <input 
        className="field-input" 
        placeholder="e.g., Upcoming Events" 
        value={form.title || ''} 
        onChange={(e) => setForm({ ...form, title: e.target.value })} 
      />
    </Field>
    <Field label="Description">
      <textarea
        className="field-textarea"
        rows="3"
        placeholder="Stay updated with upcoming activities and gatherings..."
        value={form.description || ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </Field>
  </>
);

// Jobs Section Form
const JobsForm = ({ form, setForm }) => (
  <>
    <Field label="Section Title" required>
      <input 
        className="field-input" 
        placeholder="e.g., Job Opportunities" 
        value={form.title || ''} 
        onChange={(e) => setForm({ ...form, title: e.target.value })} 
      />
    </Field>
    <Field label="Description">
      <textarea
        className="field-textarea"
        rows="3"
        placeholder="Browse through our curated list of job opportunities..."
        value={form.description || ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </Field>
  </>
);

// Discounts Section Form
const DiscountsForm = ({ form, setForm }) => (
  <>
    <Field label="Section Title" required>
      <input 
        className="field-input" 
        placeholder="e.g., Alumni Discounts" 
        value={form.title || ''} 
        onChange={(e) => setForm({ ...form, title: e.target.value })} 
      />
    </Field>
    <Field label="Description">
      <textarea
        className="field-textarea"
        rows="3"
        placeholder="Enjoy exclusive discounts and benefits..."
        value={form.description || ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </Field>
  </>
);

// Why Join AlumnAI Section Form
const WhyJoinForm = ({ form, setForm }) => (
  <>
    <Field label="Section Title" required>
      <input 
        className="field-input" 
        placeholder="e.g., Why Join AlumnAI?" 
        value={form.title || ''} 
        onChange={(e) => setForm({ ...form, title: e.target.value })} 
      />
    </Field>
    <Field label="Subtitle">
      <textarea
        className="field-textarea"
        rows="3"
        placeholder="Connecting National University—Dasmariñas alumni through innovative technology..."
        value={form.description || ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </Field>
    <Field label="Mission & Vision Content">
      <RichTextEditor
        value={form.content || ''}
        onChange={(content) => setForm({ ...form, content })}
        placeholder="Enter mission and vision content..."
      />
    </Field>
  </>
);

// Benefits Section Form (What You Get as an Alumni)
const BenefitsForm = ({ form, setForm }) => {
  const benefits = parseSeparatedContent(form.content, 3);
  
  const updateBenefit = (index, value) => {
    const newBenefits = [...benefits];
    newBenefits[index] = value;
    setForm({ ...form, content: joinSeparatedContent(newBenefits) });
  };
  
  return (
    <>
      <Field label="Section Title" required>
        <input 
          className="field-input" 
          placeholder="What You Get as an Alumni" 
          value={form.title || ''} 
          onChange={(e) => setForm({ ...form, title: e.target.value })} 
        />
      </Field>
      <Field label="Description">
        <textarea
          className="field-textarea"
          rows="3"
          placeholder="Membership opens doors to a lifetime of opportunity..."
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>
      
      <Field label="Benefit 1 - Title & Description">
        <textarea
          className="field-textarea"
          rows="2"
          placeholder="Stay Connected: Build lasting relationships..."
          value={benefits[0] || ''}
          onChange={(e) => updateBenefit(0, e.target.value)}
        />
      </Field>
      <Field label="Benefit 2 - Title & Description">
        <textarea
          className="field-textarea"
          rows="2"
          placeholder="Give Back: Mentor current students..."
          value={benefits[1] || ''}
          onChange={(e) => updateBenefit(1, e.target.value)}
        />
      </Field>
      <Field label="Benefit 3 - Title & Description">
        <textarea
          className="field-textarea"
          rows="2"
          placeholder="Grow Together: Access exclusive job listings..."
          value={benefits[2] || ''}
          onChange={(e) => updateBenefit(2, e.target.value)}
        />
      </Field>
    </>
  );
};

// What We Do Section Form
const WhatWeDoForm = ({ form, setForm }) => {
  const services = parseSeparatedContent(form.content, 3);
  
  const updateService = (index, value) => {
    const newServices = [...services];
    newServices[index] = value;
    setForm({ ...form, content: joinSeparatedContent(newServices) });
  };
  
  return (
    <>
      <Field label="Section Title" required>
        <input 
          className="field-input" 
          placeholder="What We Do as an Alumni" 
          value={form.title || ''} 
          onChange={(e) => setForm({ ...form, title: e.target.value })} 
        />
      </Field>
      <Field label="Description">
        <textarea
          className="field-textarea"
          rows="3"
          placeholder="Our commitment to alumni engagement and support..."
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>
      
      <Field label="Service 1 - Title & Description">
        <textarea
          className="field-textarea"
          rows="2"
          placeholder="Study Carried Forward: Build lifelong relationships..."
          value={services[0] || ''}
          onChange={(e) => updateService(0, e.target.value)}
        />
      </Field>
      <Field label="Service 2 - Title & Description">
        <textarea
          className="field-textarea"
          rows="2"
          placeholder="Live Events: Attend live events, workshops..."
          value={services[1] || ''}
          onChange={(e) => updateService(1, e.target.value)}
        />
      </Field>
      <Field label="Service 3 - Title & Description">
        <textarea
          className="field-textarea"
          rows="2"
          placeholder="Career Development: Access resources and support..."
          value={services[2] || ''}
          onChange={(e) => updateService(2, e.target.value)}
        />
      </Field>
    </>
  );
};

// Footer Form
const FooterForm = ({ form, setForm }) => {
  const fields = parseSeparatedContent(form.description, 4);
  
  const updateField = (index, value) => {
    const newFields = [...fields];
    newFields[index] = value;
    setForm({ ...form, description: joinSeparatedContent(newFields) });
  };
  
  return (
    <>
      <Field label="Address" required>
        <textarea
          className="field-textarea"
          rows="2"
          placeholder="Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114"
          value={fields[0] || ''}
          onChange={(e) => updateField(0, e.target.value)}
        />
      </Field>
      <Field label="Phone Numbers">
        <input 
          className="field-input" 
          placeholder="09399151561(Smart) / 09661381357(Globe)" 
          value={fields[1] || ''} 
          onChange={(e) => updateField(1, e.target.value)} 
        />
      </Field>
      <Field label="Email Address">
        <input 
          className="field-input" 
          placeholder="nudaao@nu-dasma.edu.ph" 
          value={fields[2] || ''} 
          onChange={(e) => updateField(2, e.target.value)} 
        />
      </Field>
      <Field label="Office Hours">
        <input 
          className="field-input" 
          placeholder="Monday to Friday (8:30AM - 5:30PM); Saturday (8:30AM - 12:30PM)" 
          value={fields[3] || ''} 
          onChange={(e) => updateField(3, e.target.value)} 
        />
      </Field>
    </>
  );
};

// ============================================
// MAIN MODAL COMPONENT
// ============================================
const LandingModal = ({ open, onClose, mode, section, onCreate, onUpdate }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    section_type: 'hero',
    content: '',
    image_url: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && section) {
      setForm({
        title: section.title || '',
        description: section.description || '',
        section_type: section.section_type || 'hero',
        content: section.content || '',
        image_url: section.image_url || null,
      });
    } else {
      setForm({
        title: '',
        description: '',
        section_type: 'hero',
        content: '',
        image_url: null,
      });
    }
  }, [mode, section]);

  const handleSubmit = async () => {
    console.log('🔵 [LandingModal] handleSubmit called - mode:', mode);
    console.log('🔵 [LandingModal] Form data:', form);
    
    setLoading(true);
    try {
      if (mode === 'edit' && section) {
        console.log('🔵 [LandingModal] Calling onUpdate with id:', section.id);
        await onUpdate(section.id, form);
      } else {
        console.log('🔵 [LandingModal] Calling onCreate with form:', form);
        await onCreate(form);
      }
    } catch (error) {
      console.error('🔴 [LandingModal] Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
  switch (form.section_type) {
    case 'hero':
      return <HeroForm form={form} setForm={setForm} />;
    case 'stats':
      return <StatsForm form={form} setForm={setForm} />;
    case 'events':
      return <EventsForm form={form} setForm={setForm} />;
    case 'jobs':
      return <JobsForm form={form} setForm={setForm} />;
    case 'discounts':
      return <DiscountsForm form={form} setForm={setForm} />;
    case 'why_join':
      return <WhyJoinForm form={form} setForm={setForm} />;
    case 'benefits':
      return <BenefitsForm form={form} setForm={setForm} />;
    case 'footer':
      return <FooterForm form={form} setForm={setForm} />;
    default:
      return (
          <>
            <Field label="Section Title" required>
              <input 
                className="field-input" 
                placeholder="Enter section title" 
                value={form.title || ''} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
              />
            </Field>
            <Field label="Description">
              <textarea
                className="field-textarea"
                rows="3"
                placeholder="Enter description..."
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Content">
              <RichTextEditor
                value={form.content || ''}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Enter content..."
              />
            </Field>
          </>
        );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Landing Section' : 'Create Landing Section'}
      subtitle={mode === 'edit' ? 'Update section details' : 'Create a new section for the landing page'}
    >
      <div className="modal-form">
        <Field label="Section Type" required>
          <select 
            className="field-select" 
            value={form.section_type} 
            onChange={(e) => setForm({ ...form, section_type: e.target.value, title: '', description: '', content: '', image_url: null })}
          >
            {SECTION_TYPES.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>

        {renderForm()}

        <ModalFooter 
          onCancel={onClose} 
          createLabel={mode === 'edit' ? 'Update Section' : 'Create Section'} 
          loading={loading} 
        />
      </div>
    </Modal>
  );
};

export default LandingModal;