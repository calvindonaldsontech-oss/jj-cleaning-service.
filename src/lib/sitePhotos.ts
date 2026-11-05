const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;

export interface SitePhoto {
  id: string;
  name: string;
  dataUrl: string;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not read ${file.name}`));
    };
    image.src = objectUrl;
  });
}

export async function createSitePhoto(file: File): Promise<SitePhoto> {
  const image = await loadImage(file);
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error(`Could not read ${file.name}`);
  }

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Image processing is not available in this browser.');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
  };
}
