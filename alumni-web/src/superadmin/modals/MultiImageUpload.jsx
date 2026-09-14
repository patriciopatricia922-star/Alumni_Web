import React, { useState } from 'react';
import { FiImage, FiTrash2 } from 'react-icons/fi';
import { FaCrop } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import ImageCropModal from './ImageCropModal';

const MAX_IMAGES = 4;

const MultiImageUpload = ({
  images = [],           // array of URLs, current value
  onChange,               // (newArray) => void
  bucketName,
  folder,
  label = 'Upload Images',
  classPrefix = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [cropTarget, setCropTarget] = useState(null); // { index, url } | null

  const uploadOne = async (fileOrBlob, fileName) => {
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileOrBlob, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Any image size/format is accepted — no dimension check. Use the crop
  // tool after upload to adjust sizing if needed.
  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError('');

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = files.slice(0, remainingSlots);

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const url = await uploadOne(file, fileName);
        if (url) uploaded.push(url);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-selecting the same file later
    }
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, i) => i !== index));
    setError('');
  };

  const handleCropClick = (index) => {
    setCropTarget({ index, url: images[index] });
  };

  // Uploads the cropped result as a new file and swaps it into that slot.
  const handleCropSave = async (croppedBlob) => {
    if (!cropTarget) return;
    setUploading(true);
    setError('');
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-cropped.jpg`;
      const newUrl = await uploadOne(croppedBlob, fileName);
      const updated = [...images];
      updated[cropTarget.index] = newUrl;
      onChange(updated);
    } catch (err) {
      console.error('Crop upload error:', err);
      setError(`Failed to save cropped image: ${err.message}`);
    } finally {
      setUploading(false);
      setCropTarget(null);
    }
  };

  const inputId = `multi-image-input-${folder}`;
  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className={`${classPrefix}image-upload-container`}>
      {images.length > 0 && (
        <div className={`${classPrefix}multi-image-grid`}>
          {images.map((url, i) => (
            <div className={`${classPrefix}image-preview`} key={url + i}>
              <img src={url} alt={`Upload ${i + 1}`} />
              <button
                type="button"
                className={`${classPrefix}remove-image-btn`}
                onClick={() => handleRemove(i)}
                title="Remove image"
              >
                <FiTrash2 size={12} />
              </button>
              <button
                type="button"
                className={`${classPrefix}crop-image-btn`}
                onClick={() => handleCropClick(i)}
                title="Edit / crop image"
              >
                <FaCrop size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          className={`${classPrefix}image-upload-area`}
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

      {error ? (
        <p className="field-hint" style={{ color: '#EF4444' }}>{error}</p>
      ) : (
        <p className="field-hint">
          {images.length}/{MAX_IMAGES} images added. Any size accepted — use the crop icon to adjust. Formats: JPG, PNG, GIF.
        </p>
      )}

      <ImageCropModal
        open={!!cropTarget}
        imageUrl={cropTarget?.url}
        onClose={() => setCropTarget(null)}
        onSave={handleCropSave}
      />
    </div>
  );
};

export default MultiImageUpload;