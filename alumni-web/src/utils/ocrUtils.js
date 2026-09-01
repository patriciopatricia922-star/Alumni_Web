// ─── CAMERA-IMAGE NORMALIZATION ──────────────────────────────────────────
const OCR_MAX_BYTES = 950 * 1024; 
const OCR_MAX_DIMENSION = 1800;   
const OCR_MIN_JPEG_QUALITY = 0.5;

function loadImageForNormalization(file) {
  return new Promise((resolve, reject) => {
    const viaImgElement = () => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => resolve(img);
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    };

    if (window.createImageBitmap) {
      createImageBitmap(file, { imageOrientation: 'from-image' })
        .then(resolve)
        .catch(viaImgElement);
    } else {
      viaImgElement();
    }
  });
}

function canvasToJpegBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

/**
 * User-selected (file-picker / native camera app) image for OCR.
 *
 * DIAGNOSTIC: now also returns non-sensitive metadata (dimensions, byte
 * size, MIME type, JPEG quality used) for the original and normalized
 * image, purely for temporary investigation logging (mobile vs. desktop
 * upload comparison). No image content or personal data is included. This
 * does not change what bytes are produced for OCR — `file` is computed
 * exactly as before; only an additional `meta` object is now returned
 * alongside it.
 */
export const normalizeImageForOCR = async (file) => {
  if (!file) return { file, meta: null };

  const originalMeta = {
    originalName: file.name || null,
    originalType: file.type || null,
    originalSizeBytes: file.size || null,
  };

  try {
    const image = await loadImageForNormalization(file);
    const width = image.width || image.naturalWidth;
    const height = image.height || image.naturalHeight;
    if (!width || !height) return { file, meta: { ...originalMeta, error: 'no_dimensions' } };

    const scale = Math.min(1, OCR_MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.getContext('2d').drawImage(image, 0, 0, targetW, targetH);

    let quality = 0.9;
    let blob = await canvasToJpegBlob(canvas, quality);
    while (blob && blob.size > OCR_MAX_BYTES && quality > OCR_MIN_JPEG_QUALITY) {
      quality -= 0.1;
      blob = await canvasToJpegBlob(canvas, quality);
    }

    if (!blob) return { file, meta: { ...originalMeta, error: 'blob_encode_failed' } };

    const baseName = (file.name || 'upload').replace(/\.[^.]+$/, '');
    const normalizedFile = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });

    const meta = {
      ...originalMeta,
      originalWidth: width,
      originalHeight: height,
      normalizedWidth: targetW,
      normalizedHeight: targetH,
      normalizedSizeBytes: blob.size,
      jpegQualityUsed: Math.round(quality * 100) / 100,
      userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || null,
      viewportWidth: (typeof window !== 'undefined' && window.innerWidth) || null,
      viewportHeight: (typeof window !== 'undefined' && window.innerHeight) || null,
    };

    return { file: normalizedFile, meta };
  } catch (err) {
    console.warn('Image normalization skipped, using original file:', err);
    return { file, meta: { ...originalMeta, error: String(err && err.message || err) } };
  }
};

export const verifyAlumniID = async (imageFile, clientMeta = null) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  // DIAGNOSTIC: non-sensitive upload metadata (dimensions/size/type/device
  // info) for the temporary mobile-vs-desktop investigation. No image
  // content or personal data. Backend only logs this field; it has no
  // effect on OCR or parsing.
  if (clientMeta) {
    formData.append('client_meta', JSON.stringify(clientMeta));
  }

  let lastError = null;

  // 3-attempt retry logic for network stability
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/api/verify-alumni-id`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || `Server error: ${response.status}`);
      }

      return result;

    } catch (err) {
      lastError = err.name === 'AbortError'
        ? `Connection timed out (attempt ${attempt}/3).`
        : err.message;

      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 2000)); 
      }
    }
  }

  throw new Error(lastError || 'Scan failed. Please ensure the backend is running.');
};