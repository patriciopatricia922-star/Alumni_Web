// ============================================================================
// RewardModal.jsx — Create / Edit a Reward item
// ============================================================================
import React, { useState, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight } from 'react-icons/fa';
import { FiImage, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import '../modals/Disc.css';
import MultiImageUpload from '../modals/MultiImageUpload';

// ── Rich Text Editor (same as other modals) ──────────────────────────────────
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = React.useRef(null);
  const execCommand = (cmd) => {
    document.execCommand(cmd, false, null);
    onChange(editorRef.current.innerHTML);
    editorRef.current.focus();
  };
  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML)
      editorRef.current.innerHTML = value || '';
  }, [value]);
  return (
    <div className="cm-rich-editor">
      <div className="cm-rich-toolbar">
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('bold')}><FaBold size={12} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('italic')}><FaItalic size={12} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('underline')}><FaUnderline size={12} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyLeft')}><FaAlignLeft size={12} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyCenter')}><FaAlignCenter size={12} /></button>
        <button type="button" className="cm-toolbar-btn" onClick={() => execCommand('justifyRight')}><FaAlignRight size={12} /></button>
      </div>
      <div
        ref={editorRef}
        className="cm-rich-content"
        contentEditable="true"
        onInput={() => onChange(editorRef.current.innerHTML)}
        data-placeholder={placeholder}
      />
    </div>
  );
};

// ── Image Upload (mirrors DiscountModal — uses its own bucket/folder) ─────────
const ImageUpload = ({ onImageUpload, currentImage }) => {
  const [preview, setPreview]   = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);

  const uploadToSupabase = async (file) => {
    setUploading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `rewards/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('reward-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('reward-images')
        .getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    const url = await uploadToSupabase(file);
    if (url) onImageUpload(url);
  };

  return (
    <div className="cm-image-upload-container">
      {preview && (
        <div className="cm-image-preview">
          <img src={preview} alt="Preview" />
          <button
            type="button"
            className="cm-remove-image-btn"
            onClick={() => { setPreview(null); onImageUpload(null); }}
          >
            <FiTrash2 size={12} />
          </button>
        </div>
      )}
      <div
        className="cm-image-upload-area"
        onClick={() => document.getElementById('reward-image-input').click()}
      >
        {uploading
          ? <span>Uploading...</span>
          : <><FiImage size={16} color="#155DFC" /><span>{preview ? 'Change Image' : 'Upload Reward Image'}</span></>
        }
        <input
          id="reward-image-input"
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

// ── Main Modal ────────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = ['Apparel', 'Drinkware', 'Accessories', 'Other'];

const RewardModal = ({ open, onClose, mode, reward, onCreate, onUpdate }) => {
  const [form, setForm] = useState({
    title: '', description: '', points_required: '',
    category: 'Apparel', image_urls: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && reward) {
      setForm({
        title:           reward.title           || '',
        description:     reward.description     || '',
        points_required: reward.points_required != null ? String(reward.points_required) : '',
        category:        reward.category        || 'Apparel',
        image_urls: reward.image_urls?.length ? reward.image_urls : (reward.image_url ? [reward.image_url] : []),
      });
    } else {
      setForm({ title: '', description: '', points_required: '', category: 'Apparel', image_urls: [] });
    }
  }, [mode, reward]);

  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        points_required: Number(form.points_required),
      };
      if (mode === 'edit' && reward) await onUpdate(reward.id, payload);
      else await onCreate(payload);
    } catch (err) {
      console.error('[RewardModal]', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="cm-modal-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={e => e.stopPropagation()}>
        <div className="cm-modal-header">
          <button className="cm-modal-close" onClick={onClose}>✕</button>
          <h2 className="cm-modal-title">{mode === 'edit' ? 'Edit Reward' : 'Create New Reward'}</h2>
          <p className="cm-modal-subtitle">
            {mode === 'edit' ? 'Update reward details' : 'Add a redeemable item for alumni'}
          </p>
        </div>

        <div className="cm-modal-body">
          <div className="cm-modal-fields">
            {/* Title */}
            <div className="cm-field">
              <label className="cm-label">Reward Title <span className="cm-label-required">*</span></label>
              <input
                className="cm-input"
                placeholder="e.g. NU Alumni Tumbler"
                value={form.title}
                onChange={e => s('title', e.target.value)}
              />
            </div>

            {/* Image */}
            <div className="cm-field">
              <label className="cm-label">Reward Photos</label>
              <MultiImageUpload
                images={form.image_urls}
                onChange={urls => s('image_urls', urls)}
                bucketName="reward-images"
                folder="rewards"
                label="Upload Photos"
                classPrefix="cm-"
              />
            </div>

            {/* Description */}
            <div className="cm-field">
              <label className="cm-label">Description <span className="cm-label-required">*</span></label>
              <RichTextEditor
                value={form.description}
                onChange={v => s('description', v)}
                placeholder="Describe the reward item..."
              />
            </div>

            {/* Points + Category */}
            <div className="cm-field-grid">
              <div className="cm-field">
                <label className="cm-label">Points Required <span className="cm-label-required">*</span></label>
                <input
                  type="number"
                  min="1"
                  className="cm-input"
                  placeholder="e.g. 150"
                  value={form.points_required}
                  onChange={e => s('points_required', e.target.value)}
                />
              </div>
              <div className="cm-field">
                <label className="cm-label">Category <span className="cm-label-required">*</span></label>
                <select
                  className="cm-select"
                  value={form.category}
                  onChange={e => s('category', e.target.value)}
                >
                  {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="cm-modal-actions">
            <button className="cm-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="cm-btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Reward' : 'Create Reward'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardModal;