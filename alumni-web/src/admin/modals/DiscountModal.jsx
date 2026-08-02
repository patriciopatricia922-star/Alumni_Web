import React, { useState, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight
} from 'react-icons/fa';
import { FiImage, FiTrash2, FiX, FiChevronDown } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import MultiImageUpload from '../modals/MultiImageUpload';
import BatchProgramModal from '../modals/BatchProgramModal';
import { useAlumniType } from '../contexts/AlumniTypeContext'; // adjust path to match your project
import '../modals/Disc.css';


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

// Retained for reference/backwards-compat (DiscountModal now uses
// MultiImageUpload via the "Discount Photos" field below), but styled with
// cm- classes in case it's used elsewhere.
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
    <div className="cm-image-upload-container">
      {preview && (
        <div className="cm-image-preview">
          <img src={preview} alt="Preview" />
          <button type="button" className="cm-remove-image-btn" onClick={handleRemove}>
            <FiTrash2 size={12} />
          </button>
        </div>
      )}
      <div className="cm-image-upload-area" onClick={() => document.getElementById('discount-image-input').click()}>
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
      <p className="cm-field-hint">Supported formats: JPG, PNG. Max size: 2MB</p>
    </div>
  );
};

const DiscountModal = ({ open, onClose, mode, discount, onCreate, onUpdate }) => {
  const { alumniType } = useAlumniType();

  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    discountCode: '',
    audience: 'All Alumni',
    expiry: '',
    image_urls: [],
    // ── NEW: batch / program targeting ──────────────────────────────────────
    target_filter_value: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [batchProgramPickerOpen, setBatchProgramPickerOpen] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && discount) {
      setForm({
        title: discount.title || '',
        description: discount.description || '',
        company: discount.company || '',
        discountCode: discount.discount_code || '',
        audience: discount.audience || 'All Alumni',
        expiry: discount.valid_until ? new Date(discount.valid_until).toISOString().split('T')[0] : '',
        image_urls: discount.image_urls?.length ? discount.image_urls : (discount.image_url ? [discount.image_url] : []),
        target_filter_value: discount.target_filter_value || '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        company: '',
        discountCode: '',
        audience: 'All Alumni',
        expiry: '',
        image_urls: [],
        target_filter_value: '',
      });
    }
    setFormError('');
  }, [mode, discount]);

  const s = (k, v) => {
    console.log(`[DiscountModal] Setting ${k}:`, v);
    setForm((f) => ({ ...f, [k]: v }));
  };

  // Switching audience away from By Program/By Batch clears the selection,
  // and picking either one auto-opens the picker.
  const handleAudienceChange = (value) => {
    setForm((f) => ({
      ...f,
      audience: value,
      ...(value !== 'By Program' && value !== 'By Batch'
        ? { target_filter_value: '' }
        : {}),
    }));
    if (value === 'By Program' || value === 'By Batch') setBatchProgramPickerOpen(true);
    setFormError('');
  };

  const handleBatchProgramSelect = (value) => {
    setForm((f) => ({ ...f, target_filter_value: value }));
    setFormError('');
  };

  const handleSubmit = async () => {
    if ((form.audience === 'By Program' || form.audience === 'By Batch') && !form.target_filter_value) {
      setFormError(`Please select a ${form.audience === 'By Batch' ? 'batch' : 'program'} to target this discount to.`);
      return;
    }
    setFormError('');
    console.log('[DiscountModal] Submitting form:', form);
    setLoading(true);
    try {
      if (mode === 'edit' && discount) {
        await onUpdate(discount.id, form);
      } else {
        await onCreate(form);
      }
    } catch (error) {
      console.error('[DiscountModal] Error:', error);
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
      <div className="cm-modal-fields">
        <Field label="Discount Title" required>
          <input className="cm-input" placeholder="Enter discount title" value={form.title} onChange={(e) => s('title', e.target.value)} />
        </Field>

        <Field label="Discount Photos">
          <MultiImageUpload
            images={form.image_urls}
            onChange={(urls) => s('image_urls', urls)}
            bucketName="discount-images"
            folder="discounts"
            label="Upload Photos"
            classPrefix="cm-"
          />
        </Field>

        <Field label="Location" required>
          <input className="cm-input" placeholder="Enter location" value={form.company} onChange={(e) => s('company', e.target.value)} />
        </Field>

        <Field label="Description" required>
          <RichTextEditor
            value={form.description}
            onChange={(content) => s('description', content)}
            placeholder="Enter discount description and terms..."
          />
        </Field>

        <div className="cm-field-grid">
          <Field label="Discount Code">
            <input className="cm-input" placeholder="Enter discount code (if any)" value={form.discountCode} onChange={(e) => s('discountCode', e.target.value)} />
          </Field>

          <Field label="Target Audience" required>
            <div className="cm-select-wrap">
              <select className="cm-select" value={form.audience} onChange={(e) => handleAudienceChange(e.target.value)}>
                <option>All Alumni</option>
                <option>By Program</option>
                <option>By Batch</option>
              </select>
              <FiChevronDown size={14} className="cm-select-arrow" />
            </div>
          </Field>
        </div>

        {/* ── Batch / Program picker ──────────────────────────────────────────── */}
        {(form.audience === 'By Program' || form.audience === 'By Batch') && (
          <Field label={form.audience === 'By Batch' ? 'Targeted Batch' : 'Targeted Program'} required>
            {form.target_filter_value ? (
              <div className="cm-target-user-chip">
                <div className="cm-target-user-info">
                  <div className="cm-target-user-name">
                    {form.audience === 'By Batch' ? `Batch ${form.target_filter_value}` : form.target_filter_value}
                  </div>
                </div>
                <button
                  type="button"
                  className="cm-target-user-change"
                  onClick={() => setBatchProgramPickerOpen(true)}
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="cm-target-user-select-btn"
                onClick={() => setBatchProgramPickerOpen(true)}
              >
                + Choose a {form.audience === 'By Batch' ? 'batch' : 'program'}
              </button>
            )}
            {formError && <p className="cm-field-hint cm-field-error">{formError}</p>}
          </Field>
        )}

        <Field label="Expiry Date">
          <input className="cm-input" type="date" value={form.expiry} onChange={(e) => s('expiry', e.target.value)} />
        </Field>

        <ModalFooter
          onCancel={onClose}
          createLabel={mode === 'edit' ? 'Update Discount' : 'Create Discount'}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>

      <BatchProgramModal
        open={batchProgramPickerOpen}
        onClose={() => setBatchProgramPickerOpen(false)}
        filterType={form.audience === 'By Batch' ? 'batch' : 'program'}
        onSelect={handleBatchProgramSelect}
        selectedValue={form.target_filter_value}
        alumniType={alumniType}
      />
    </Modal>
  );
};

export default DiscountModal;