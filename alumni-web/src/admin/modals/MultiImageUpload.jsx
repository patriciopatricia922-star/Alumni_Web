import React, { useState } from 'react';
import { FiImage, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';

const MAX_IMAGES = 4;

// ── Image dimension requirement ────────────────────────────────────────────────
const REQUIRED_WIDTH = 1080;
const REQUIRED_HEIGHT = 1080;

const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image file.'));
    };
    img.src = url;
  });
};

const MultiImageUpload = ({
  images = [],          // array of URLs, current value
  onChange,              // (newArray) => void
  bucketName,
  folder,
  label = 'Upload Images',
}) => {
  const [uploading, setUploading] = useState(false);
  const [dimError, setDimError] = useState('');

  const uploadOne = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setDimError('');

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) return;

    const filesToConsider = files.slice(0, remainingSlots);

    // ── Validate dimensions for every selected file BEFORE uploading any of them ──
    const validFiles = [];
    const rejectedNames = [];

    for (const file of filesToConsider) {
      try {
        const dims = await getImageDimensions(file);
        if (dims.width === REQUIRED_WIDTH && dims.height === REQUIRED_HEIGHT) {
          validFiles.push(file);
        } else {
          rejectedNames.push(`${file.name} (${dims.width}x${dims.height}px)`);
        }
      } catch (err) {
        rejectedNames.push(`${file.name} (unreadable)`);
      }
    }

    if (rejectedNames.length > 0) {
      setDimError(
        `Rejected — images must be exactly ${REQUIRED_WIDTH}x${REQUIRED_HEIGHT}px: ${rejectedNames.join(', ')}`
      );
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of validFiles) {
        const url = await uploadOne(file);
        if (url) uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file later
    }
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, i) => i !== index));
    setDimError('');
  };

  const inputId = `multi-image-input-${folder}`;
  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="image-upload-container">
      {images.length > 0 && (
        <div className="multi-image-grid">
          {images.map((url, i) => (
            <div className="image-preview" key={url + i}>
              <img src={url} alt={`Upload ${i + 1}`} />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => handleRemove(i)}
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          className="image-upload-area"
          onClick={() => document.getElementById(inputId).click()}
        >
          {uploading ? (
            <div className="uploading-spinner"></div>
          ) : (
            <FiImage size={20} color="#155DFC" />
          )}
          <span>{uploading ? 'Uploading...' : label}</span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </div>
      )}

      {dimError ? (
        <p className="field-hint" style={{ color: '#EF4444' }}>{dimError}</p>
      ) : (
        <p className="field-hint">
          {images.length}/{MAX_IMAGES} images added. Each must be exactly {REQUIRED_WIDTH}x{REQUIRED_HEIGHT}px. Formats: JPG, PNG, GIF.
        </p>
      )}
    </div>
  );
};

export default MultiImageUpload;