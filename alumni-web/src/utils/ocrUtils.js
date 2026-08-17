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
 * User-selected (file-picker / native camera app) image for OCR:
 */
export const normalizeImageForOCR = async (file) => {
  if (!file) return file;

  try {
    const image = await loadImageForNormalization(file);
    const width = image.width || image.naturalWidth;
    const height = image.height || image.naturalHeight;
    if (!width || !height) return file;

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

    if (!blob) return file;

    const baseName = (file.name || 'upload').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } catch (err) {
    console.warn('Image normalization skipped, using original file:', err);
    return file;
  }
};

export const verifyAlumniID = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

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