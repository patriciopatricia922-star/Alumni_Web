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

const Field = ({ label, required, children }) => (
  <div className="field-wrap">
    <label className="field-label">
      {label}
      {required && <span className="field-required"> *</span>}
    </label>
    {children}
  </div>
);

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

// Image Upload Component for Discounts
const ImageUpload = ({ onImageUpload, currentImage, bucketName = 'discount-images', folder = 'discounts' }) => {
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

      console.log('📤 Uploading to:', bucketName, filePath);

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

      console.log('✅ Upload successful, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('🖼️ Image selected:', file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      const publicUrl = await uploadToSupabase(file);
      if (publicUrl) {
        console.log('📸 Setting image_url to:', publicUrl);
        onImageUpload(publicUrl);
      }
    }
  };

  const handleRemove = () => {
    console.log('🗑️ Removing image');
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
      <div className="image-upload-area" onClick={() => document.getElementById('discount-image-input').click()}>
        {uploading ? (
          <div className="uploading-spinner"></div>
        ) : (
          <FiImage size={20} color="#155DFC" />
        )}
        <span>{uploading ? 'Uploading...' : (preview ? 'Change Image' : 'Upload Discount Image')}</span>
        <input 
          id="discount-image-input" 
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

const DiscountModal = ({ open, onClose, mode, discount, onCreate, onUpdate }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    discountCode: '',
    audience: 'All Alumni',
    expiry: '',
    image_url: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && discount) {
      console.log('📝 Loading discount for edit:', discount);
      setForm({
        title: discount.title || '',
        description: discount.description || '',
        company: discount.company || '',
        discountCode: discount.discount_code || '',
        audience: discount.audience || 'All Alumni',
        expiry: discount.valid_until ? new Date(discount.valid_until).toISOString().split('T')[0] : '',
        image_url: discount.image_url || null,
      });
    } else {
      setForm({
        title: '',
        description: '',
        company: '',
        discountCode: '',
        audience: 'All Alumni',
        expiry: '',
        image_url: null,
      });
    }
  }, [mode, discount]);

  const s = (k, v) => {
    console.log(`📝 Setting ${k}:`, v);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const handleSubmit = async () => {
    console.log('🔵 DiscountModal handleSubmit called');
    console.log('Mode:', mode);
    console.log('Form data:', form);
    console.log('image_url value:', form.image_url);
    console.log('onUpdate prop exists?', typeof onUpdate);
    console.log('onCreate prop exists?', typeof onCreate);
    
    setLoading(true);
    try {
      if (mode === 'edit' && discount) {
        console.log('🔵 Calling onUpdate with id:', discount.id);
        await onUpdate(discount.id, form);
      } else {
        console.log('🔵 Calling onCreate with form:', form);
        await onCreate(form);
      }
    } catch (error) {
      console.error('🔴 Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

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

        <Field label="Discount Image">
          <ImageUpload
            currentImage={form.image_url}
            onImageUpload={(url) => s('image_url', url)}
            bucketName="discount-images"
            folder="discounts"
          />
        </Field>

        <Field label="Company/Partner" required>
          <input className="field-input" placeholder="Enter company name" value={form.company} onChange={(e) => s('company', e.target.value)} />
        </Field>

        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(content) => s('description', content)}
            placeholder="Enter discount description and terms..."
          />
        </Field>

        <div className="field-grid">
          <Field label="Discount Code">
            <input className="field-input" placeholder="Enter discount code (if any)" value={form.discountCode} onChange={(e) => s('discountCode', e.target.value)} />
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
          <input className="field-input" type="date" value={form.expiry} onChange={(e) => s('expiry', e.target.value)} />
        </Field>

        <ModalFooter 
          onCancel={onClose} 
          createLabel={mode === 'edit' ? 'Update Discount' : 'Create Discount'} 
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
};

export default DiscountModal;