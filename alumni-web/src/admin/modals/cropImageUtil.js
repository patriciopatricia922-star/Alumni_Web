// ============================================================================
// Purpose: Turns a crop selection (from react-easy-crop) into an actual
//          cropped image file (Blob) using an off-screen canvas.
// ============================================================================

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous'; // needed to read pixels from Supabase's public URL
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    image.src = url;
  });

// Final output size — every cropped image is resized to exactly this,
// regardless of how big or small the on-screen crop selection was.
const OUTPUT_SIZE = 1080;

// pixelCrop = { x, y, width, height } — comes from react-easy-crop's onCropComplete
export const getCroppedImageBlob = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');

  // Source rect = the crop selection (pixelCrop), destination rect = the
  // full 1080x1080 canvas, so the selection is scaled up/down to fit.
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty — could not create cropped image.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.92
    );
  });
};