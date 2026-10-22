/**
 * Turn an uploaded image file into a small square avatar dataURL.
 * Center-crops to 256x256 and encodes JPEG (~15-40KB) so it fits
 * comfortably inside the persisted localStorage store.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Not an image file");
  }
  const bitmap = await loadImage(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  /* center-crop the longest edge so the avatar is a true square */
  const crop = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - crop) / 2;
  const sy = (bitmap.height - crop) / 2;
  ctx.drawImage(bitmap, sx, sy, crop, crop, 0, 0, size, size);

  return canvas.toDataURL("image/jpeg", 0.85);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}
