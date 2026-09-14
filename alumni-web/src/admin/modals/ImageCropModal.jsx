// ============================================================================
// Purpose: Popup editor that lets an admin crop an already-uploaded image.
//          Opened via the crop icon on each thumbnail in MultiImageUpload.
// ============================================================================

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FiX } from 'react-icons/fi';
import { getCroppedImageBlob } from './cropImageUtil';

const ImageCropModal = ({ open, imageUrl, onClose, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const resetAndClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageUrl) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageUrl, croppedAreaPixels);
      await onSave(blob);
      resetAndClose();
    } catch (err) {
      console.error('[ImageCropModal] Crop failed:', err);
      alert('Failed to crop image: ' + err.message);
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="crop-modal-overlay" onClick={resetAndClose}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <button className="crop-modal-close" onClick={resetAndClose} aria-label="Close">
          <FiX size={16} />
        </button>
        <h3 className="crop-modal-title">Edit Image</h3>
        <p className="crop-modal-subtitle">Drag to reposition, use the slider to zoom.</p>

        <div className="crop-modal-area">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="crop-modal-controls">
          <label className="crop-zoom-label">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="crop-zoom-slider"
          />
        </div>

        <div className="crop-modal-actions">
          <button className="cm-btn-cancel" onClick={resetAndClose} disabled={saving}>
            Cancel
          </button>
          <button className="cm-btn-submit" onClick={handleSave} disabled={saving || !croppedAreaPixels}>
            {saving ? 'Saving...' : 'Save Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;